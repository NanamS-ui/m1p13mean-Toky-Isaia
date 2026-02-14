const FloorService = require("../../services/shop/FloorService");

exports.createFloor = async (req, res) => {
    try {
        const floor = await FloorService.createFloor(req.body);
        res.status(201).json(floor);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

exports.getFloors = async (req, res) => {
    try {
        const floors = await FloorService.getFloors();
        res.json(floors);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

exports.getFloorById = async (req, res) => {
    try {
        const floor = await FloorService.getFloorById(req.params.id);
        res.json(floor);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

exports.updateFloor = async (req, res) => {
    try {
        const floor = await FloorService.updateFloor(req.params.id, req.body);
        res.json(floor);
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};

exports.deleteFloor = async (req, res) => {
    try {
        await FloorService.deleteFloor(req.params.id);
        res.json({ message: "Etage supprimé" });
    } catch (error) {
        res.status(error.status || 400).json({ message: error.message });
    }
};
