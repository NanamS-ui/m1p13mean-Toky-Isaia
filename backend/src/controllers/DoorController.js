const DoorService = require("../services/DoorService");

exports.createDoor = async (req, res) => {
    try {
        const door = await DoorService.createDoor(req.body);
        res.status(201).json(door);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

exports.getDoors = async (req, res) => {
    try {
        const doors = await DoorService.getDoors();
        res.json(doors);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getDoorById = async (req, res) => {
    try {
        const door = await DoorService.getDoorById(req.params.id);
        res.json(door);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

exports.getDoorsByFloor = async(req, res)=>{
    try{
        const doors = await DoorService.getDoorsByFloor(req.params.idFloor);
        res.json(doors);
    }catch(error){
        res.status(error.status || 500).json({message : error.message});
    }
};

exports.getAvailableDoorsByFloor = async(req, res)=>{
    try{
        const doors = await DoorService.getAvailableDoorsByFloor(req.params.idFloor);
        res.json(doors);
    }catch(error){
        res.status(error.status || 500).json({message : error.message});
    }
};

exports.updateDoor = async (req, res) => {
    try {
        const door = await DoorService.updateDoor(req.params.id, req.body);
        res.json(door);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

exports.deleteDoor = async (req, res) => {
    try {
        await DoorService.deleteDoor(req.params.id);
        res.json({ message: "Porte supprimée" });
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};
