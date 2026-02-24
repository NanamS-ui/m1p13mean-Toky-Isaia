const SupportClient = require("../../models/supportClient/SupportClient");
const StatusSupportClient = require("../../models/supportClient/StatusSupportClient");

const buildError = (message, status) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const createSupportClient = async (payload) => {
    if (!payload.status_support_client) {
        const defaultStatus = await StatusSupportClient.findOne({ value: "En cours" });
        if (!defaultStatus) throw buildError('Status "En cours" introuvable', 400);
        payload.status_support_client = defaultStatus._id;
    }
    return SupportClient.create(payload);
};

const getSupportClients = async () => SupportClient.find()
    .populate("status_support_client")
    .populate("type_support_client")
    .populate("user");

const getSupportClientById = async (id) => {
    const support = await SupportClient.findById(id)
        .populate("status_support_client")
        .populate("type_support_client")
        .populate("user");
    if (!support) throw buildError("Support client introuvable", 404);
    return support;
};

const updateSupportClient = async (id, payload) => {
    const support = await SupportClient.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    })
    .populate("status_support_client")
    .populate("type_support_client")
    .populate("user");

    if (!support) throw buildError("Support client introuvable", 404);
    return support;
};

const deleteSupportClient = async (id) => {
    const support = await SupportClient.findByIdAndDelete(id);
    if (!support) throw buildError("Support client introuvable", 404);
    return support;
};
const getSupportClientsByDate = async (startDate, endDate) => {
    const filter = {};

    if (startDate || endDate) {
        filter.created_at = {};
        if (startDate) filter.created_at.$gte = new Date(startDate);
        if (endDate) filter.created_at.$lte = new Date(endDate);
    }

    return SupportClient.find(filter)
        .select("_id sujet user type_support_client reponse status_support_client created_at")
        .populate({
            path: "user",
            select: "_id name email"
        })
        .populate({
            path: "type_support_client",
            select: "_id value"
        }).populate({
            path: "status_support_client",
            select: "_id value"
        });
};

const createSupportClientByUser = async (userId, payload) => {
    if (!payload.status_support_client) {
        const defaultStatus = await StatusSupportClient.findOne({ value: "En cours" });
        if (!defaultStatus) throw new Error('Status "En cours" introuvable');
        payload.status_support_client = defaultStatus._id;
    }
    payload.user = userId;

    return SupportClient.create(payload);
};

const getSupportClientsByUser = async (userId) => SupportClient.find({
    user: userId,
    deleted_at: null
})
    .sort({ created_at: -1 })
    .populate({
        path: "type_support_client",
        select: "_id value"
    })
    .populate({
        path: "status_support_client",
        select: "_id value"
    })
    .select("_id sujet reponse type_support_client status_support_client created_at");
module.exports = {
    createSupportClient,
    getSupportClients,
    getSupportClientById,
    updateSupportClient,
    deleteSupportClient,
    getSupportClientsByDate,
    createSupportClientByUser,
    getSupportClientsByUser
};