const SupportClientService = require("../../services/supportClient/SupportClientService");

exports.createSupportClient = async (req, res) => {
    try {
        const support = await SupportClientService.createSupportClient(req.body);
        res.status(201).json(support);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

exports.getSupportClients = async (req, res) => {
    try {
        const supports = await SupportClientService.getSupportClients();
        res.json(supports);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getSupportClientById = async (req, res) => {
    try {
        const support = await SupportClientService.getSupportClientById(req.params.id);
        res.json(support);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

exports.updateSupportClient = async (req, res) => {
    try {
        const support = await SupportClientService.updateSupportClient(req.params.id, req.body);
        res.json(support);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

exports.deleteSupportClient = async (req, res) => {
    try {
        await SupportClientService.deleteSupportClient(req.params.id);
        res.json({ message: "Support client supprimé" });
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};
exports.getSupportClientsByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const supports = await SupportClientService.getSupportClientsByDate(startDate, endDate);
        res.json(supports);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};
exports.createSupportClientByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const support = await SupportClientService.createSupportClientByUser(userId, req.body);
        res.status(201).json(support);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

exports.getSupportClientsByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const supports = await SupportClientService.getSupportClientsByUser(userId);
        res.json(supports);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};