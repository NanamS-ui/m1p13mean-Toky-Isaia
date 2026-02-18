const mongoose = require("mongoose");
const Order = require("../../models/order/Order");
const OrderItem = require("../../models/order/OrderItem");

const buildError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
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