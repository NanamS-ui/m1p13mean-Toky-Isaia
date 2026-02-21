const Shop = require("../../models/shop/Shop");
const User = require("../../models/user/User");
const Order = require("../../models/order/Order");
const {buildDateMatch,getMonthRange} = require("../../utils/dateFilter");
const OrderItem = require("../../models/order/OrderItem");
const buildError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
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
    getAdminStatistics
}