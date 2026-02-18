const OrderAnalyticsService = require("../../services/statistics/OrderAnalyticsService");
exports.getOrderItemsAnalytics = async (req, res) => {
  try {
    let { shopOwnerId, startDate, endDate } = req.query;
    if(!shopOwnerId) shopOwnerId = req.user.id;
    if ( !startDate || !endDate) {
      return res.status(400).json({
        message: "startDate and endDate are required"
      });
    }
    const stats = await OrderAnalyticsService.getOrderItemsAnalytics(shopOwnerId, startDate, endDate);

    return res.status(200).json({stats});

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
