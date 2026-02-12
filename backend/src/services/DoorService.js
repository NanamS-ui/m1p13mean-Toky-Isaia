const Door = require("../models/Door");
const mongoose = require("mongoose");
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

const getDoorsByFloor = async (idFloor)=>{
    if (!mongoose.Types.ObjectId.isValid(idFloor)) {
        throw { status: 400, message: "Invalid Floor ID" };
    }
    const doors = await Door.find({floor : idFloor})
                            .populate('floor');
    return doors;
}

const getAvailableDoorsByFloor = async (idFloor) => {
    if (!mongoose.Types.ObjectId.isValid(idFloor)) {
        throw { status: 400, message: "Invalid Floor ID" };
    }
    
    const doors = await Door.aggregate([

    
    {
        $match: {
            floor: new mongoose.Types.ObjectId(idFloor)
        }
    },
    
    {
        $lookup: {
            from: "shops",
            localField: "_id",
            foreignField: "door",
            as: "shop"
        }
    },
    
    {
        $unwind: {
            path: "$shop",
            preserveNullAndEmptyArrays: true
        }
    },
    
    {
        $lookup: {
            from: "shop_status",
            localField: "shop.shop_status",
            foreignField: "_id",
            as: "status"
        }
    },
    
    {
        $unwind: {
            path: "$status",
            preserveNullAndEmptyArrays: true
        }
    },
    
    {
        $match: {
            $or: [
            { shop: null },
            { "shop.deleted_at": { $ne: null } },
            { "status.value": { $nin: ["Active", "En attente"] } }
            ]
        }
    }

    ]);
    console.log(JSON.stringify(doors, null, 2));
    return doors;
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
    getDoorsByFloor,
    getAvailableDoorsByFloor,
    updateDoor,
    deleteDoor
};
