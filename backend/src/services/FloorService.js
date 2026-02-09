const Floor = require("../models/Floor");

const buildError = (message, status) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const createFloor = async (payload) => Floor.create(payload);

const getFloors = async () => Floor.find();

const getFloorById = async (id) => {
    const floor = await Floor.findById(id);
    if (!floor) throw buildError("Etage introuvable", 404);
    return floor;
};

const updateFloor = async (id, payload) => {
    const floor = await Floor.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    });
    if (!floor) throw buildError("Etage introuvable", 404);
    return floor;
};

const deleteFloor = async (id) => {
    const floor = await Floor.findByIdAndDelete(id);
    if (!floor) throw buildError("Etage introuvable", 404);
    return floor;
};

module.exports = {
    createFloor,
    getFloors,
    getFloorById,
    updateFloor,
    deleteFloor
};
