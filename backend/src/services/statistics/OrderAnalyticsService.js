const mongoose = require("mongoose");
const Order = require("../../models/order/Order");
const OrderItem = require("../../models/order/OrderItem");

const buildError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};
const getDashboard = async (ownerId, limite = 5, startDate, nombre = 5) => {

  const [topData, orderData] = await Promise.all([
    getTop5ProductByOwner(ownerId, limite, startDate),
    getLastOrderByOwner(ownerId, nombre)
  ]);

  const products = topData[0] || {};
  const orders = orderData[0] || {};

  return {
    topProducts: products.topProduct || [],
    weeklyRevenue: products.weeklyRevenue || [],
    dailyRevenue: products.dailyRevenue?.[0]?.revenue ?? 0,
    monthlyRevenue: products.monthlyRevenue?.[0]?.revenue ?? 0,
    lastOrders: orders.lastOrder || [],
    orderStats: orders.stat?.[0] || {}
  };
};

const getTop5ProductByOwner = async(ownerId, limite =5, startDate)=>{
  const start = startDate ? new Date(startDate) : new Date();
  start.setUTCHours(23, 59, 59, 999);

  const sevenDaysAgo = new Date(start);
  sevenDaysAgo.setUTCDate(start.getUTCDate() - 7);
  
  const startOfDay = new Date(start);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const startOfMonth = new Date(start);
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  return OrderItem.aggregate([
    {$match: {deleted_at : null}},
    {$lookup: {from: "stocks", let : {stockId:"$stock"},
      pipeline:[{$match: {$expr : {$eq : ["$_id", "$$stockId"]}}},
        {$project: {_id :1, product:1, shop:1}}],as: "stock"}},
    {$unwind: "$stock"},
    {$lookup: {from: "shops", let : {shopId:"$stock.shop"},
      pipeline:[{$match: {$expr : {$eq : ["$_id", "$$shopId"]}}},
        {$project: {_id :1, owner:1}}],as: "shop"}},
    {$unwind: "$shop"},
    {$match :{"shop.owner": new mongoose.Types.ObjectId(ownerId)}},
    {$lookup: {from: "products", let : {productId:"$stock.product"},
      pipeline:[{$match: {$expr : {$eq : ["$_id", "$$productId"]}}},
        {$project: {_id :1, name:1}}],as: "product"}},
    {$unwind: "$product"},
    {$addFields:{
        revenue : {$multiply :["$quantity", "$unit_price",{$subtract:[1,{$divide: [{ $ifNull: ["$promotion_percentage", 0] },100]}]}]}
    }},
    {$facet: {
      topProduct: [ {$group: {
        _id: "$product._id",
        productName : {$first : "$product.name"},
        totalQuantity:{$sum : "$quantity"},
        totalRevenue : {$sum : "$revenue"}
        }},
        {$sort: {totalRevenue: -1}},
        {$limit: limite} ],
       
      weeklyRevenue : [{$match:{created_at : {
              $gte : sevenDaysAgo,
              $lte : start}}},
          {$group:{
              _id : {$dateToString : {format : "%Y-%m-%d",date: "$created_at"}},
              revenue : {$sum : "$revenue"}
          }}],
      dailyRevenue : [
        {$match:{created_at : {$gte : startOfDay, $lte : start}}},
        {$group :{ _id : null, revenue : {$sum : "$revenue"}}}
      ],
      monthlyRevenue : [
        {$match:{created_at : {$gte : startOfMonth, $lte : start }}},
        {$group :{ _id : null, revenue : {$sum : "$revenue"}}}
      ]
    }},
  ]);
};

const getLastOrderByOwner = async(ownerId, nombre = 5)=>{
    return Order.aggregate([
      { $match: {deleted_at: null}},
      {$lookup: {from: "order_categories", localField: "orderCategory", foreignField: "_id", as: "orderCategory"}},
      {$unwind: "$orderCategory"},
      {$lookup: { from: "users", let : {idUser : "$buyer" },pipeline:[{$match: {$expr : {$eq: ["$_id","$$idUser"]}}}, 
        {$project:{_id:1, name:1}}],as: "buyer"}},
      {$unwind : "$buyer"},
      {$lookup: { from: "order_items", let : {orderId : "$_id"},pipeline :[{$match: {$expr : {$eq : ["$order", "$$orderId"]}}},
        {$project: {_id :1,stock : 1,deleted_at : 1}}],as: "orderItems"}},
      {$unwind: "$orderItems"},
      {$match: {"orderItems.deleted_at": null}},
      { $lookup: {from: "stocks", let : {stockId :"$orderItems.stock" },pipeline:[{$match:{$expr:{$eq : ["$_id","$$stockId" ]}}},
        {$project:{_id : 1,product : 1,shop : 1}}],as: "stock"}},
      { $unwind: "$stock" },
      {$lookup: {from: "products",let : { productId : "$stock.product"},pipeline : [{ $match: {$expr : {$eq : ["$_id", "$$productId"]}}},
        {$project: {_id : 1,name : 1}}],as : "product"}},
      { $unwind: "$product" },
      {$lookup: {from: "shops",let: { shopId: "$stock.shop" },pipeline: [{$match: {$expr: { $eq: ["$_id", "$$shopId"] }}},
        {$project: {_id: 1,owner: 1}}],as: "shop"}},
      { $unwind: "$shop" },
      {$match:{"shop.owner": new mongoose.Types.ObjectId(ownerId),}}
      ,{$group: {_id: "$_id", order: { $first: "$$ROOT" }}},
      {$replaceRoot: { newRoot: "$order" }},
      {$facet :{
        lastOrder : [{$sort: { created_at: -1 }},
      {$limit: nombre},
      {$project: {_id: 1, total : 1, category: "$orderCategory.value",buyerName: "$buyer.name",}}],
          stat: [
              {$group:{
                 _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: "$total" },
                 pending: {$sum: {$cond: [{ $eq: ["$orderCategory.value", "En attente"] }, 1, 0]}},
                 confirmed: {$sum: {$cond: [{ $eq: ["$orderCategory.value", "Confirmée"] }, 1, 0]}},
                preparing: {$sum: {$cond: [{ $eq: ["$orderCategory.value", "En préparation"] }, 1, 0]}},
                delivered: {$sum: {$cond: [{ $eq: ["$orderCategory.value", "Livrée"] }, 1, 0]}},
                cancelled: {$sum: {$cond: [{ $eq: ["$orderCategory.value", "Annulée"] }, 1, 0]}}
              }},
              {$addFields:{
                averageBasket: {$cond: [{ $eq: ["$totalOrders", 0] },0,{ $divide: ["$totalRevenue", "$totalOrders"] }]},
                confirmedPercent: {$multiply: [{ $divide: ["$confirmed", "$totalOrders"] },100]},
                preparingPercent: {$multiply: [{ $divide: ["$preparing", "$totalOrders"] },100]},
                deliveredPercent: {$multiply: [{ $divide: ["$delivered", "$totalOrders"] },100]},
                cancelledPercent: {$multiply: [{ $divide: ["$cancelled", "$totalOrders"] },100]}
              }}
          ],
      }}
      
  ]);
}
const getOrderItemsAnalyticsGlobal = async (ownerId,startDate,endDate) => {

  const match = { deleted_at: null };

  if (startDate || endDate) {
    match.created_at = {};
    if (startDate) {
      match.created_at.$gte = new Date(`${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      match.created_at.$lte = new Date(`${endDate}T23:59:59.999Z`);
    }
  }
  return Order.aggregate([
      { $match: match },
      {$lookup: {from: "order_categories", localField: "orderCategory", foreignField: "_id", as: "orderCategory"}},
      {$unwind: "$orderCategory"},
      {$lookup: { from: "users", let : {idUser : "$buyer" },pipeline:[{$match: {$expr : {$eq: ["$_id","$$idUser"]}}}, 
        {$project:{_id:1, name:1}}],as: "buyer"}},
      {$unwind : "$buyer"},
      {$lookup: { from: "order_items", let : {orderId : "$_id"},pipeline :[{$match: {$expr : {$eq : ["$order", "$$orderId"]}}},
        {$project: {_id :1,stock : 1,deleted_at : 1}}],as: "orderItems"}},
      {$unwind: "$orderItems"},
      {$match: {"orderItems.deleted_at": null}},
      { $lookup: {from: "stocks", let : {stockId :"$orderItems.stock" },pipeline:[{$match:{$expr:{$eq : ["$_id","$$stockId" ]}}},
        {$project:{_id : 1,product : 1,shop : 1}}],as: "stock"}},
      { $unwind: "$stock" },
      {$lookup: {from: "products",let : { productId : "$stock.product"},pipeline : [{ $match: {$expr : {$eq : ["$_id", "$$productId"]}}},
        {$project: {_id : 1,name : 1}}],as : "product"}},
      { $unwind: "$product" },
      {$lookup: {from: "shops",let: { shopId: "$stock.shop" },pipeline: [{$match: {$expr: { $eq: ["$_id", "$$shopId"] }}},
        {$project: {_id: 1,owner: 1}}],as: "shop"}},
      { $unwind: "$shop" },
      {$match:{"shop.owner": new mongoose.Types.ObjectId(ownerId),}}
      ,{$group: {_id: "$_id", order: { $first: "$$ROOT" }}},
      {$replaceRoot: { newRoot: "$order" }},
      {$facet :{
        lastOrder : [{$sort: { created_at: -1 }},
      {$project: {_id: 1, total : 1, category: "$orderCategory.value",buyerName: "$buyer.name",}}],
          stat: [
              {$group:{
                 _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: "$total" },
                 pending: {$sum: {$cond: [{ $eq: ["$orderCategory.value", "En attente"] }, 1, 0]}},
                 confirmed: {$sum: {$cond: [{ $eq: ["$orderCategory.value", "Confirmée"] }, 1, 0]}},
                preparing: {$sum: {$cond: [{ $eq: ["$orderCategory.value", "En préparation"] }, 1, 0]}},
                delivered: {$sum: {$cond: [{ $eq: ["$orderCategory.value", "Livrée"] }, 1, 0]}},
                cancelled: {$sum: {$cond: [{ $eq: ["$orderCategory.value", "Annulée"] }, 1, 0]}}
              }},
              {$addFields:{
                averageBasket: {$cond: [{ $eq: ["$totalOrders", 0] },0,{ $divide: ["$totalRevenue", "$totalOrders"] }]},
                confirmedPercent: {$multiply: [{ $divide: ["$confirmed", "$totalOrders"] },100]},
                preparingPercent: {$multiply: [{ $divide: ["$preparing", "$totalOrders"] },100]},
                deliveredPercent: {$multiply: [{ $divide: ["$delivered", "$totalOrders"] },100]},
                cancelledPercent: {$multiply: [{ $divide: ["$cancelled", "$totalOrders"] },100]}
              }}
          ],
      }}
      
  ]);
}

const getOrderItemsAnalytics = async (shopOwnerId,startDate,endDate) => {

  const match = { deleted_at: null };

  if (startDate || endDate) {
    match.created_at = {};
    if (startDate) {
      match.created_at.$gte = new Date(`${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      match.created_at.$lte = new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  return await OrderItem.aggregate([

    { $match: match },

    { $lookup: {from: "stocks", localField: "stock", foreignField: "_id", as: "stock"}},
    { $unwind: "$stock" },

    { $lookup: { from: "shops", localField: "stock.shop", foreignField: "_id", as: "stock.shop"}},
    { $unwind: "$stock.shop" },
    { $match: { "stock.shop.owner": new mongoose.Types.ObjectId(shopOwnerId)}},

    { $lookup: {from: "products", localField: "stock.product", foreignField: "_id",as: "stock.product"}},
    { $unwind: "$stock.product" },
    
    { $lookup: { from: "orders", localField: "order", foreignField: "_id", as: "order" }},
    { $unwind: "$order" },

    { $lookup: { from: "order_categories", localField: "order.orderCategory", foreignField: "_id",as: "order.orderCategory"}},
    { $unwind: { path: "$order.orderCategory", preserveNullAndEmptyArrays: true } },

    {$facet: {globalStats: 
              [{$group: {_id: null,CA: {$sum: {$multiply: ["$unit_price", "$quantity"]}},totalOrders: {$addToSet: "$order._id"},
                panierMoyen: { $avg: "$order.total" },delivered: {$sum: {$cond: [{ $eq: ["$order.orderCategory.value", "Livré"] },1,0]}},
                cancelled: {$sum: {$cond: [{ $eq: ["$order.orderCategory.value", "Annulé"] },1,0]}},
                pending: {$sum: {$cond: [{ $eq: ["$order.orderCategory.value", "En attente"] },1,0]}},
                totalReduction: {$sum: {$multiply: ["$unit_price","$quantity",{ $divide: ["$promotion_percentage", 100] }]}},
              avgReduction: { $avg: "$promotion_percentage" },ordersWithPromo: {$addToSet: {$cond: [{ $gt: ["$promotion_percentage", 0] },"$order._id",null]}}}},
          {$project: {CA: 1,panierMoyen: 1,totalReduction: 1,avgReduction: 1,totalOrders: { $size: "$totalOrders" },
              ordersWithPromo: {$size: {$filter: {input: "$ordersWithPromo",as: "o",cond: { $ne: ["$$o", null] }}}},
              delivered: 1,cancelled: 1,pending: 1
            }}],
        productsSorted: [
        {$group: {_id: "$stock.product",totalSold: { $sum: "$quantity" },CA: { $sum: { $multiply: ["$unit_price", "$quantity"] } },
            stock: { $first: "$stock.reste" }}},{ $sort: { totalSold: -1 } }
        ]}
    },
    {$project: {top5Produits: { $slice: ["$productsSorted", 5] },
            top3ProduitsFaibles: {$cond: [{ $gt: [{ $size: "$productsSorted" }, 5] },{ $slice: ["$productsSorted", 5, { $subtract: [{ $size: "$productsSorted" }, 5] }] },[] ]
            },globalStats: 1,caParMois: 1}
    }

  ]);
};
const getRevenueParMois = async(ownerId,startDate)=>{
  const match = { deleted_at: null };

  if (startDate) {
    const dateParam = new Date(`${startDate}T00:00:00.000Z`);

    match.$expr = {
      $eq: [
        { $year: "$created_at" },
        { $year: dateParam }
      ]
    };
  }

  return OrderItem.aggregate([
    {$match: match},
    {$lookup: {from: "stocks", let : {stockId:"$stock"},pipeline:[{$match: {$expr : {$eq : ["$_id", "$$stockId"]}}},
        {$project: {_id :1, product:1, shop:1}}],as: "stock"}},
    {$unwind: "$stock"},
    {$lookup: {from: "shops", let : {shopId:"$stock.shop"},
      pipeline:[{$match: {$expr : {$eq : ["$_id", "$$shopId"]}}},
        {$project: {_id :1, owner:1}}],as: "shop"}},
    {$unwind: "$shop"},
    { $match: { "shop.owner": new mongoose.Types.ObjectId(ownerId)}},
    {$lookup: {from: "products", let : {productId:"$stock.product"},
      pipeline:[{$match: {$expr : {$eq : ["$_id", "$$productId"]}}},
        {$project: {_id :1, name:1}}],as: "product"}},
    {$unwind: "$product"},
    {$addFields:{
        revenue : {
            $multiply :["$quantity", "$unit_price",{
                $subtract:[1,{
                    $divide: [
                        { $ifNull: ["$promotion_percentage", 0] },
                    100]}
                ]}
            ]}
    }},
    {$facet: {
      caParMois: [
          {$group: {_id: { $month: "$created_at" },CA: {$sum: {$multiply: ["$unit_price", "$quantity"]}}}},{ $sort: { "_id": 1 } }
        ],
    }}
  ]);

}
const getFullAnalytics = async (ownerId, startDate, endDate) => {
  try {
    const [
      orderAnalytics,
      orderItemAnalytics,
      revenueParMois
    ] = await Promise.all([
      getOrderItemsAnalyticsGlobal(ownerId, startDate, endDate),
      getOrderItemsAnalytics(ownerId, startDate, endDate),
      getRevenueParMois(ownerId,startDate)
    ]);
    
    
    return {
      orders: orderAnalytics?.[0] || {},
      orderItems: orderItemAnalytics?.[0] || {},
      revenueParMois : revenueParMois[0] || {}
    };

  } catch (error) {
    throw error;
  }
};

const getOrderAnalytics = async (startDate, endDate, userId) => {
  if (!startDate || !endDate) {
    throw buildError("startDate et endDate requis");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    throw buildError("startDate doit être inférieur à endDate");
  }

  const orderStat = await kpiOrderStat(start, end, userId);
  return orderStat
}

const kpiOrderStat =async (start, end, userId)=>{
     const orderStats = await Order.aggregate([
        {
            $match:{
                created_at : {$gte : start, $lte : end},
                deleted_at : null,
                buyer : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from : "order_categories",
                localField : "order_category",
                foreignField : "_id",
                as : "category"
            }
        },
        {
            $unwind : "$category"
        },
        {
            $group:{
                _id : null,
                CA : {$sum : "$total"},
                totalOrder : { $sum : 1},
                panierMoyen : { $avg : "$total"},
                delivered : {
                    $sum : {
                        $cond : [{$eq : ["$category.value", "Livrée"]},1,0]
                    }
                },
                canceled : {
                    $sum : {
                        $cond : [{$eq : ["$category.value", "Annulée"]},1,0]
                    }
                }
            }

        }

    ]);
    const global = orderStats[0]|| {
        CA : 0,
        totalOrders: 0,
        panierMoyen: 0,
        delivered: 0,
        cancelled: 0,
        tauxDelivered : orderStats[0].totalOrders ?  (orderStats[0].delivered/orderStats[0].totalOrder)*100 : 0,
        tauxCanceled : orderStats[0].totalOrders ?  (orderStats[0].cancelled/orderStats[0].totalOrder)*100 : 0
    };
    
    return global;
}
module.exports ={
    getOrderItemsAnalytics,
    getTop5ProductByOwner,
    getDashboard,
    getFullAnalytics
}