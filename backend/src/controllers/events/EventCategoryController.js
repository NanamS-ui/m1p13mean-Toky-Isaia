const EventCategoryService = require("../../services/events/EventCategoryService");

exports.createEventCategory = async (req, res) => {
  try {
    const category = await EventCategoryService.createEventCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getEventCategories = async (req, res) => {
  try {
    const categories = await EventCategoryService.getEventCategories();
    res.json(categories);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getEventCategoryById = async (req, res) => {
  try {
    const category = await EventCategoryService.getEventCategoryById(req.params.id);
    res.json(category);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updateEventCategory = async (req, res) => {
  try {
    const category = await EventCategoryService.updateEventCategory(req.params.id, req.body);
    res.json(category);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteEventCategory = async (req, res) => {
  try {
    await EventCategoryService.deleteEventCategory(req.params.id);
    res.json({ message: "Catégorie supprimée" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};
