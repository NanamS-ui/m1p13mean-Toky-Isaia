const Shop = require("../../models/shop/Shop");
const User = require("../../models/user/User");
const Order = require("../../models/order/Order");
const OrderCategory = require("../../models/order/OrderCategory");
const Role = require("../../models/user/Role");
const {buildDateMatch,getMonthRange} = require("../../utils/dateFilter");
const OrderItem = require("../../models/order/OrderItem");
const buildError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};
const getAdminUserStatistics = async(startDate, endDate)=>{
    const [moyenneMensuelleGlobale, hourlyActiveUsers, orderStats,orderUserStats] = await Promise.all([
        getMoyenneMensuelleGlobale(startDate, endDate),
        getHourlyActiveUsers(startDate, endDate),
        getOrderStats(startDate, endDate),
        getOrderUserStats(startDate, endDate)
      ]);
    return{moyenneMensuelleGlobale, hourlyActiveUsers, orderStats,orderUserStats}
}
const getOrderUserStats = async (startDate, endDate) => {
  const now = new Date();
  const start = startDate ? new Date(`${startDate}T00:00:00.000Z`) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59.999Z`) : now;
  const orderMatch = { deleted_at: null };
  if (start || end) orderMatch.created_at = {};
  if (start) orderMatch.created_at.$gte = start;
  if (end) orderMatch.created_at.$lte = end;
  const totalOrders = await Order.countDocuments(orderMatch);
  const deliveredCategory = await OrderCategory.findOne({ value: "Livrée" });
  const deliveredOrders = deliveredCategory? await Order.countDocuments({ ...orderMatch, orderCategory: deliveredCategory._id }): 0;
  const buyersRole = await Role.findOne({ val: "ACHETEUR" });
  if (!buyersRole) return { percentBuyersOrdered: 0, percentOrdersDelivered: 0 };
  const totalBuyerUsers = await User.countDocuments({
    role: buyersRole._id,
    is_deleted: null
  });
  const buyersWithOrders = await Order.distinct("buyer", {
    buyer: { $ne: null },
    ...orderMatch
  });
  const buyersWithOrdersCount = await User.countDocuments({
    _id: { $in: buyersWithOrders },
    role: buyersRole._id,
    is_deleted: null
  });
  const percentBuyersOrdered =totalBuyerUsers > 0 ? (buyersWithOrdersCount / totalBuyerUsers) * 100 : 0;

  const percentOrdersDelivered =totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

  return {
    percentBuyersOrdered: percentBuyersOrdered.toFixed(2),
    percentOrdersDelivered: percentOrdersDelivered.toFixed(2)
  };
};
const getOrderStats = async (startDate, endDate) => {
  const now = new Date();
  const start = startDate ? new Date(`${startDate}T00:00:00.000Z`) : null;
  const end = endDate ? new Date(`${endDate}T23:59:59.999Z`) : now;
  const match = { deleted_at: null };
  if (start || end) match.created_at = {};
  if (start) match.created_at.$gte = start;
  if (end) match.created_at.$lte = end;
  const result = await Order.aggregate([
    { $match: match },
    {$group: {_id: "$buyer",totalUserCommands: { $sum: 1 },totalSpent: { $sum: "$total" }}},
    {$group: {_id: null, totalUsers: { $sum: 1 }, totalOrders: { $sum: "$totalUserCommands" },      
        usersMultipleOrders: {$sum: { $cond: [{ $gt: ["$totalUserCommands", 1] }, 1, 0] }},totalSpentAll: { $sum: "$totalSpent" }}},
    {$addFields: {avgCommandPerUser: {$divide: ["$totalOrders", "$totalUsers"]},
        percentUsersMultipleOrders: {$multiply: [{ $divide: ["$usersMultipleOrders", "$totalUsers"] }, 100]},
        avgOrderTotal: { $divide: ["$totalSpentAll", "$totalOrders"] }  }}
  ]);
  return result[0] || {
    totalOrders: 0,
    totalUsers: 0,
    months: 0,
    avgCommandPerUserPerMonth: 0,
    percentUsersMultipleOrders: 0,
    avgOrderTotal: 0
  };
};
const getHourlyActiveUsers = async (startDate, endDate) => {
  const now = new Date();
  const match = {};
  if (startDate || endDate) {
    match["login_history.login_date"] = {};
    if (startDate) match["login_history.login_date"].$gte = new Date(`${startDate}T00:00:00.000Z`);
    if (endDate) match["login_history.login_date"].$lte = new Date(`${endDate}T23:59:59.999Z`);
  }

  const result = await User.aggregate([
    { $unwind: "$login_history" },
    // ...(Object.keys(match).length ? [{ $match: match }] : []),
    { $match: match },
    {$addFields: {logoutEffective: { $ifNull: ["$login_history.logout_date", now] }}},
    {$addFields: {startHour: { $hour: { date: "$login_history.login_date", timezone: "Africa/Nairobi" } },endHour: { $hour: { date: "$logoutEffective", timezone: "Africa/Nairobi" } },userId: "$_id"}},
    {$project: {hoursCovered: { $range: ["$startHour", { $add: ["$endHour", 1] }] },userId: 1}},
    { $unwind: "$hoursCovered" },
    {$group: {_id: "$hoursCovered",activeUsers: { $addToSet: "$userId" }}},
    {$project: {_id: 0,hour: { $concat: [{ $toString: "$_id" }, ":00"] },activeUsers: { $size: "$activeUsers" }}},
    { $sort: { hour: 1 } }
  ]);

  return result;
};
const getMoyenneMensuelleGlobale = async (startDate, endDate) => {
  let start;
  let end = endDate? new Date(`${endDate}T23:59:59.999Z`): new Date();
  if (!startDate) {
    const firstLogin = await User.aggregate([
      { $unwind: "$login_history" },{ $sort: { "login_history.login_date": 1 } },{ $limit: 1 },
      {$project: {_id: 0,first: "$login_history.login_date"}}]);
    start = firstLogin.length? firstLogin[0].first: end; 
  } else {start = new Date(`${startDate}T00:00:00.000Z`);}
  const monthCount =(end.getFullYear() - start.getFullYear()) * 12 +(end.getMonth() - start.getMonth()) +1;
  const result = await User.aggregate([
    { $unwind: "$login_history" },
    {$addFields: {login: "$login_history.login_date",logout: {$ifNull: ["$login_history.logout_date", new Date()]}}},
    {$match: {$expr: {$and: [{ $lte: ["$login", end] },{ $gte: ["$logout", start] }]}}},
    {$addFields: {effectiveStart: {$cond: [{ $lt: ["$login", start] }, start, "$login"]},
        effectiveEnd: {$cond: [{ $gt: ["$logout", end] }, end, "$logout"]}}},
    {$addFields: {durationMinutes: {$divide: [{ $subtract: ["$effectiveEnd", "$effectiveStart"] },1000 * 60]}}},
    {$group: {_id: null,totalMinutes: { $sum: "$durationMinutes" },users: { $addToSet: "$_id" }}},
    {$project: {totalMinutes: 1,userCount: { $size: "$users" }}}
  ]);
  if (!result.length || result[0].userCount === 0) {return 0;}
  const { totalMinutes, userCount } = result[0];
  const moyenne =totalMinutes / (userCount * monthCount);
  return Number(moyenne.toFixed(2));
};
const getAdminStatistics = async(startDate, endDate)=>{
    const [totalUsers, totalBoutiques, totalCommandes,totalCa12DernierMois, CAMonthandGrowth, CAParShopPerCategory] = await Promise.all([
        getNombreUserIncrit(startDate, endDate),
        getNombreBoutique(startDate, endDate),
        getNombreCommande(startDate, endDate),
        getCADouzeDernierMois(startDate, endDate),
        getCAMonthAndGrowth(endDate),
        getCAParShopEtCategorie(startDate,endDate)
      ]);
    const CA12LastMonths = totalCa12DernierMois[0]||{};
    const CAShopAndCategory = CAParShopPerCategory[0]||{};
    return{
        totalUsers,
        totalBoutiques,
        totalCommandes,
        CA12LastMonths,
        CAMonthandGrowth,
        CAShopAndCategory
    }
}
const getCAParShopEtCategorie = async (startDate, endDate) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  return OrderItem.aggregate([
    {$match: {deleted_at: null,
        ...dateMatch
    }},
    {$lookup: {from: "stocks", let : {stockId:"$stock"},pipeline:[{$match: {$expr : {$eq : ["$_id", "$$stockId"]}}},
        {$project: {_id :1, product:1, shop:1}}],as: "stock"}},
    {$unwind: "$stock"},

    {$lookup: {from: "shops", let : {shopId:"$stock.shop"},
      pipeline:[{$match: {$expr : {$eq : ["$_id", "$$shopId"]}}},
        {$project: {_id :1,name:1,shop_category:1}}],as: "shop"}},
    {$unwind: "$shop"},

    {$lookup: {from: "shop_categories",localField: "shop.shop_category",foreignField: "_id",as: "shopCategory"}},
    { $unwind: "$shopCategory" },
    { $match: { "shop.deleted_at": null } }, 
    
    {$project: {
        shopId: "$shop._id",shopName: "$shop.name",shopCategoryId: "$shopCategory._id",shopCategoryName: "$shopCategory.value",
        ca: {$multiply: ["$quantity",{ $multiply: ["$unit_price", { $subtract: [1, { $divide: ["$promotion_percentage", 100] }] }] }]}
    }},
    
    {$facet: {topBoutique: [ {$group: {_id: "$shopId",shopName: { $first: "$shopName" },totalCA: { $sum: "$ca" }}}],
            topShopCategory:[{$group: {_id: "$shopCategoryId" ,shopCategoryName: { $first: "$shopCategoryName" },totalCA: { $sum: "$ca" }}}]
    }}

  ]);

} 
const getCAMonthAndGrowth = async (endDate) => {
  const { currentMonthStart, currentMonthEnd, prevMonthStart, prevMonthEnd } = getMonthRange(endDate);

  const result = await Order.aggregate([
    {$match: {deleted_at: null,created_at: { $gte: prevMonthStart, $lte: currentMonthEnd }}},
    {$project: {total: 1,month: { $month: "$created_at" },year: { $year: "$created_at" }}},
    {$group: {_id: { year: "$year", month: "$month" },monthlyTotal: { $sum: "$total" }}}
  ]);

  let caCurrent = 0, caPrev = 0;
  const currentMonth = currentMonthStart.getMonth() + 1;
  const prevMonth = prevMonthStart.getMonth() + 1;
  const yearCurrent = currentMonthStart.getFullYear();
  const yearPrev = prevMonthStart.getFullYear();

  result.forEach(r => {
    if (r._id.year === yearCurrent && r._id.month === currentMonth) caCurrent = r.monthlyTotal;
    if (r._id.year === yearPrev && r._id.month === prevMonth) caPrev = r.monthlyTotal;
  });

  const growth = caPrev === 0 ? null : ((caCurrent - caPrev) / caPrev) * 100;

  return {
    caCurrentMonth: caCurrent,
    caPrevMonth: caPrev,
    growthRatePercent: growth
  };
};
const getAdminDashboard = async(startDate, endDate)=>{
    const [totalUsers, totalBoutiques, totalCommandes, totalCa12DernierMois, CAParMois12DernierMois] = await Promise.all([
        getNombreUserIncrit(startDate, endDate),
        getNombreBoutique(startDate, endDate),
        getNombreCommande(startDate, endDate),
        getCADouzeDernierMois(startDate, endDate),
        getCaParMois12DernierMois(endDate)
      ]);
    const CA12LastMonths = totalCa12DernierMois[0]||{};
    return{
        totalUsers,
        totalBoutiques,
        totalCommandes,
        CA12LastMonths,
        CAParMois12DernierMois
    }
}

/**
 * KPI Dashboard – données pré-calculées pour le donut chart et les indicateurs dérivés
 */
const getDashboardKPI = async (startDate, endDate) => {
  const [
    totalBoutiques,
    totalCommandes,
    caParMois,
    topBoutiquesData,
    topCategoriesData
  ] = await Promise.all([
    getNombreBoutique(startDate, endDate),
    getNombreCommande(startDate, endDate),
    getCaParMois12DernierMois(endDate),
    getTopBoutiquesByCA(startDate, endDate, 5),
    getTopCategoriesByCA(startDate, endDate, 5)
  ]);

  // --- Répartition CA par mois (6 derniers mois) ---
  const last6 = Array.isArray(caParMois) ? caParMois.slice(-6) : [];
  const totalCA = last6.reduce((sum, m) => sum + Number(m?.total ?? 0), 0);

  const caDistribution = last6.map(m => {
    const val = Number(m?.total ?? 0);
    const pct = totalCA > 0 ? Number(((val / totalCA) * 100).toFixed(1)) : 0;
    return {
      mois: m._id,           // ex: "2026-01"
      total: val,
      pourcentage: pct
    };
  });

  // --- CA moyen mensuel ---
  const caMoyenMensuel = last6.length > 0 ? Number((totalCA / last6.length).toFixed(2)) : 0;

  // --- Variation CA vs mois précédent ---
  let caVariation = 0;
  if (last6.length >= 2) {
    const curr = Number(last6[last6.length - 1]?.total ?? 0);
    const prev = Number(last6[last6.length - 2]?.total ?? 0);
    caVariation = prev > 0 ? Number((((curr - prev) / prev) * 100).toFixed(1)) : 0;
  }

  // --- Commandes par boutique ---
  const commandesParBoutique = totalBoutiques > 0
    ? Number((totalCommandes / totalBoutiques).toFixed(1))
    : 0;

  return {
    caDistribution,
    caMoyenMensuel,
    caVariation,
    commandesParBoutique,
    totalCA,
    topBoutiques: topBoutiquesData,
    topCategories: topCategoriesData
  };
};

/**
 * Top N boutiques par CA
 */
const getTopBoutiquesByCA = async (startDate, endDate, limit = 5) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  const result = await OrderItem.aggregate([
    { $match: { deleted_at: null, ...dateMatch } },
    { $lookup: { from: "stocks", let: { stockId: "$stock" }, pipeline: [
      { $match: { $expr: { $eq: ["$_id", "$$stockId"] } } },
      { $project: { _id: 1, shop: 1 } }
    ], as: "stock" } },
    { $unwind: "$stock" },
    { $lookup: { from: "shops", let: { shopId: "$stock.shop" }, pipeline: [
      { $match: { $expr: { $eq: ["$_id", "$$shopId"] } } },
      { $project: { _id: 1, name: 1 } }
    ], as: "shop" } },
    { $unwind: "$shop" },
    { $match: { "shop.deleted_at": null } },
    { $group: {
      _id: "$shop._id",
      nom: { $first: "$shop.name" },
      totalCA: { $sum: { $multiply: ["$quantity", { $multiply: ["$unit_price", { $subtract: [1, { $divide: ["$promotion_percentage", 100] }] }] }] } }
    } },
    { $sort: { totalCA: -1 } },
    { $limit: limit }
  ]);
  return result;
};

/**
 * Top N catégories de boutique par CA
 */
const getTopCategoriesByCA = async (startDate, endDate, limit = 5) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  const result = await OrderItem.aggregate([
    { $match: { deleted_at: null, ...dateMatch } },
    { $lookup: { from: "stocks", let: { stockId: "$stock" }, pipeline: [
      { $match: { $expr: { $eq: ["$_id", "$$stockId"] } } },
      { $project: { _id: 1, shop: 1 } }
    ], as: "stock" } },
    { $unwind: "$stock" },
    { $lookup: { from: "shops", let: { shopId: "$stock.shop" }, pipeline: [
      { $match: { $expr: { $eq: ["$_id", "$$shopId"] } } },
      { $project: { _id: 1, shop_category: 1 } }
    ], as: "shop" } },
    { $unwind: "$shop" },
    { $lookup: { from: "shop_categories", localField: "shop.shop_category", foreignField: "_id", as: "category" } },
    { $unwind: "$category" },
    { $group: {
      _id: "$category._id",
      nom: { $first: "$category.value" },
      totalCA: { $sum: { $multiply: ["$quantity", { $multiply: ["$unit_price", { $subtract: [1, { $divide: ["$promotion_percentage", 100] }] }] }] } }
    } },
    { $sort: { totalCA: -1 } },
    { $limit: limit }
  ]);
  return result;
};
const getCaParMois12DernierMois = async (endDate) => {

    const end = endDate
        ? new Date(`${endDate}T23:59:59.999Z`)
        : new Date();

    const start = new Date(end);
    start.setMonth(start.getMonth() - 12);

    return Order.aggregate([
    {$match: {deleted_at: null,created_at: {$gte: start,$lte: end}}},
    {$group: {_id: {$dateToString: { format: "%Y-%m", date: "$created_at" }},total: { $sum: "$total" }}},
    { $sort: { "_id": 1 } }
    ]);
}
const getCADouzeDernierMois = async (startDate, endDate) => {
    const dateMatch = buildDateMatch(startDate, endDate);
    return Order.aggregate([
    {$match: {deleted_at: null, ...dateMatch}},
    {$group: {_id: null,total12Months: { $sum: "$total" }}}
    ]);
}
const getNombreCommande = async (startDate, endDate) => {
    const dateMatch = buildDateMatch(startDate, endDate);

    return Order.countDocuments({
        deleted_at : null,
        ...dateMatch
    });
}

const getNombreBoutique = async (startDate, endDate) => {
  const dateMatch = buildDateMatch(startDate, endDate);

    return Shop.countDocuments({
        deleted_at: null,
        ...dateMatch
    });
}
const getNombreUserIncrit = async(startDate, endDate) => {
    const dateMatch = buildDateMatch(startDate, endDate);
    return User.countDocuments({
        is_deleted : null,
        ...dateMatch
    });
}
module.exports = {
    getAdminDashboard,
    getAdminStatistics,
    getAdminUserStatistics,
    getDashboardKPI
}