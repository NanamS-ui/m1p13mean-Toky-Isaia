const AdminStatisticService = require("../../services/statistics/AdminStatisticService");
const AdminStatisticExportService = require("../../services/statistics/AdminStatisticExportService");
exports.getAdminUserStatistics= async (req,res) => {
    try{
        let { startDate, endDate } = req.query;
        const statistic = await AdminStatisticService.getAdminUserStatistics(startDate, endDate);
        res.json(statistic);
    }catch(error){
        res.status(error.status || 400).json({ message: error.message });
    }
}
exports.getAdminStatistics= async (req,res) => {
    try{
        let { startDate, endDate } = req.query;
        const statistic = await AdminStatisticService.getAdminStatistics(startDate, endDate);
        res.json(statistic);
    }catch(error){
        res.status(error.status || 400).json({ message: error.message });
    }
}

exports.exportAdminStatisticsExcel = async (req, res) => {
    try {
        const startDate = req.query.startDate || req.query.dateDebut;
        const endDate = req.query.endDate || req.query.dateFin;

        const stats = await AdminStatisticService.getAdminStatistics(startDate, endDate);
        const workbook = await AdminStatisticExportService.buildAdminStatisticsWorkbook(stats, { startDate, endDate });

        const safeStart = startDate || 'all';
        const safeEnd = endDate || 'now';
        const filename = `statistiques-korus-centre_${safeStart}_${safeEnd}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
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

exports.getDashboardKPI = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const kpi = await AdminStatisticService.getDashboardKPI(startDate, endDate);
        res.json(kpi);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
}

exports.exportAdminDashboardExcel = async (req, res) => {
    try {
        const startDate = req.query.startDate || req.query.dateDebut;
        const endDate = req.query.endDate || req.query.dateFin;

        const [dashboard, kpi] = await Promise.all([
            AdminStatisticService.getAdminDashboard(startDate, endDate),
            AdminStatisticService.getDashboardKPI(startDate, endDate)
        ]);
        const workbook = await AdminStatisticExportService.buildAdminDashboardWorkbook(dashboard, { startDate, endDate, kpi });

        const safeStart = startDate || 'all';
        const safeEnd = endDate || 'now';
        const filename = `dashboard-korus-centre_${safeStart}_${safeEnd}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
}

exports.exportAdminUserStatisticsExcel = async (req, res) => {
    try {
        const startDate = req.query.startDate || req.query.dateDebut;
        const endDate = req.query.endDate || req.query.dateFin;

        const userStats = await AdminStatisticService.getAdminUserStatistics(startDate, endDate);
        const workbook = await AdminStatisticExportService.buildAdminUserStatisticsWorkbook(userStats, { startDate, endDate });

        const safeStart = startDate || 'all';
        const safeEnd = endDate || 'now';
        const filename = `statistiques-utilisateurs_${safeStart}_${safeEnd}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
}