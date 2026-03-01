const OrderAnalyticsService = require("../../services/statistics/OrderAnalyticsService");
exports.getDashBoard = async (req, res) => {
  try {
    let { shopOwnerId, date } = req.query;
    if(!shopOwnerId) shopOwnerId = req.user.id;
    
    const stats = await OrderAnalyticsService.getDashboard(shopOwnerId,5,date);

    return res.status(200).json({stats});

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getOrderItemsAnalytics = async (req, res) => {
  try {
    let { shopOwnerId, startDate, endDate } = req.query;
    if(!shopOwnerId) shopOwnerId = req.user.id;
    const stats = await OrderAnalyticsService.getFullAnalytics(shopOwnerId, startDate, endDate);

    return res.status(200).json({stats});

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
