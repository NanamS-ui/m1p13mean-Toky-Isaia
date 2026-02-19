const mongoose = require("mongoose");
const Order = require("../../models/order/Order");
const OrderItem = require("../../models/order/OrderItem");

const buildError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const getTop5ProductByOwner = async(ownerId, limite =5, startDate)=>{
  let start = new Date();
  if(!startDate) start = new Date(`${startDate}T00:00:00.000Z`);
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
              $gte : {$dateSubtract:{startDate:start, unit : "day", amount : 7}},
              $lte : start}}},
          {$group:{
              _id : {$dateToString : {format : "%Y-%m-%d",date: "$created_at"}},
              revenue : {$sum : "$revenue"}
          }}]
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
      {$sort: { created_at: -1 }},
      {$limit: nombre},
      {$project: {_id: 1, total : 1, category: "$orderCategory.value",buyerName: "$buyer.name",}}
  ]);
}

const getOrderItemsAnalytics = async (
  shopOwnerId,
  startDate,
  endDate
) => {

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

  return await OrderItem.aggregate([

    {$match: {deleted_at: null, created_at: { $gte: start, $lte: end }}},

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

    
    {
      $facet: {
        globalStats: [{
            $group: {_id: null,
                CA: {$sum: {$multiply: ["$unit_price", "$quantity"]}},
                totalOrders: {$addToSet: "$order._id"},
                panierMoyen: { $avg: "$order.total" },
                delivered: {$sum: {
                    $cond: [
                        { $eq: ["$order.orderCategory.value", "Livré"] },
                        1,
                        0
                    ]}},

              cancelled: {$sum: {
                  $cond: [
                        { $eq: ["$order.orderCategory.value", "Annulé"] },
                        1,
                        0]}},

              totalReduction: {$sum: {
                  $multiply: ["$unit_price","$quantity",{ $divide: ["$promotion_percentage", 100] }]
                }},
              avgReduction: { $avg: "$promotion_percentage" },
              ordersWithPromo: {$addToSet: {
                  $cond: [
                    { $gt: ["$promotion_percentage", 0] },
                    "$order._id",
                    null
                  ]
                }}
            }
          },
          {
            $project: {
              CA: 1,
              panierMoyen: 1,
              totalReduction: 1,
              avgReduction: 1,
              totalOrders: { $size: "$totalOrders" },
              ordersWithPromo: {
                $size: {$filter: {input: "$ordersWithPromo",as: "o",cond: { $ne: ["$$o", null] }}}
              },
              delivered: 1,
              cancelled: 1
            }
          }
        ],

        /* ===== CA PAR MOIS ===== */
        caParMois: [
          {$group: {
              _id: { $month: "$order.created_at" },
              CA: {$sum: {$multiply: ["$unit_price", "$quantity"]}}
            }
          },{ $sort: { "_id": 1 } }
        ],

        
        productsSorted: [
        {$group: {
            _id: "$stock.product",
            totalSold: { $sum: "$quantity" },
            CA: { $sum: { $multiply: ["$unit_price", "$quantity"] } },
            stock: { $first: "$stock.reste" }
            }},{ $sort: { totalSold: -1 } }
        ]
    }
    },
    {
        $project: {
            
            top5Produits: { $slice: ["$productsSorted", 5] },

            top3ProduitsFaibles: {$cond: [
                    { $gt: [{ $size: "$productsSorted" }, 5] },
                    { $slice: ["$productsSorted", 5, { $subtract: [{ $size: "$productsSorted" }, 5] }] },
                    [] 
                ]
            },
            globalStats: 1,
            caParMois: 1
        }
    }

  ]);
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
    getTop5ProductByOwner
}