const mongoose = require("mongoose");
const Order = require("../../models/order/Order");
const OrderItem = require("../../models/order/OrderItem");

const buildError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

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
    getOrderItemsAnalytics
}