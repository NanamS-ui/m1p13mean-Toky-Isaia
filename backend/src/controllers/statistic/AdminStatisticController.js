const AdminStatisticService = require("../../services/statistics/AdminStatisticService");
exports.getAdminStatistics= async (req,res) => {
    try{
        let { startDate, endDate } = req.query;
        const statistic = await AdminStatisticService.getAdminStatistics(startDate, endDate);
        res.json(statistic);
    }catch(error){
        res.status(error.status || 400).json({ message: error.message });
    }
}
exports.getAdminDashboard= async (req,res) => {
    try{
        let { startDate, endDate } = req.query;
        const statistic = await AdminStatisticService.getAdminDashboard(startDate, endDate);
        res.json(statistic);
    }catch(error){
        res.status(error.status || 400).json({ message: error.message });
    }
}