const TagService = require("../../services/product/TagService");

exports.createTag = async (req, res) => {
  try {
    const tag = await TagService.createTag(req.body);
    res.status(201).json(tag);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getTags = async (req, res) => {
  try {
    const tags = await TagService.getTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTagById = async (req, res) => {
  try {
    const tag = await TagService.getTagById(req.params.id);
    res.json(tag);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const tag = await TagService.updateTag(req.params.id, req.body);
    res.json(tag);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    await TagService.deleteTag(req.params.id);
    res.json({ message: "Tag supprimé (soft delete)" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};
