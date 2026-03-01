const StatusSupportClientService = require("../../services/supportClient/StatusSupportClientService");

exports.createStatusSupportClient = async (req, res) => {
    try {
        const status = await StatusSupportClientService.createStatusSupportClient(req.body);
        res.status(201).json(status);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

exports.getStatusSupportClients = async (req, res) => {
    try {
        const statuses = await StatusSupportClientService.getStatusSupportClients();
        res.json(statuses);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getStatusSupportClientById = async (req, res) => {
    try {
        const status = await StatusSupportClientService.getStatusSupportClientById(req.params.id);
        res.json(status);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

exports.updateStatusSupportClient = async (req, res) => {
    try {
        const status = await StatusSupportClientService.updateStatusSupportClient(req.params.id, req.body);
        res.json(status);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

exports.deleteStatusSupportClient = async (req, res) => {
    try {
        await StatusSupportClientService.deleteStatusSupportClient(req.params.id);
        res.json({ message: "Status support client supprimé" });
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};