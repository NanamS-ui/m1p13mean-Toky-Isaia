const Door = require("../models/Door");

const buildError = (message, status) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const createDoor = async (payload) => Door.create(payload);

const getDoors = async () => Door.find();

const getDoorById = async (id) => {
    const door = await Door.findById(id);
    if (!door) throw buildError("Porte introuvable", 404);
    return door;
};

const updateDoor = async (id, payload) => {
    const door = await Door.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    }).populate("floor");
    if (!door) throw buildError("Porte introuvable", 404);
    return door;
};

const deleteDoor = async (id) => {
    const door = await Door.findByIdAndDelete(id);
    if (!door) throw buildError("Porte introuvable", 404);
    return door;
};

module.exports = {
    createDoor,
    getDoors,
    getDoorById,
    updateDoor,
    deleteDoor
};
