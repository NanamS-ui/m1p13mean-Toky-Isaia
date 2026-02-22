const StatusSupportClient = require("../../models/supportClient/StatusSupportClient");

const buildError = (message, status) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const createStatusSupportClient = async (payload) => StatusSupportClient.create(payload);

const getStatusSupportClients = async () => StatusSupportClient.find();

const getStatusSupportClientById = async (id) => {
    const status = await StatusSupportClient.findById(id);
    if (!status) throw buildError("Status support client introuvable", 404);
    return status;
};

const updateStatusSupportClient = async (id, payload) => {
    const status = await StatusSupportClient.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    });
    if (!status) throw buildError("Status support client introuvable", 404);
    return status;
};

const deleteStatusSupportClient = async (id) => {
    const status = await StatusSupportClient.findByIdAndDelete(id);
    if (!status) throw buildError("Status support client introuvable", 404);
    return status;
};

module.exports = {
    createStatusSupportClient,
    getStatusSupportClients,
    getStatusSupportClientById,
    updateStatusSupportClient,
    deleteStatusSupportClient
};