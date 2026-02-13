const ProductCategoryService = require("../../services/product/ProductCategoryService");

exports.createProductCategory = async (req, res) => {
  try {
    const category = await ProductCategoryService.createProductCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getProductCategories = async (req, res) => {
  try {
    const categories = await ProductCategoryService.getProductCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductCategoryById = async (req, res) => {
  try {
    const category = await ProductCategoryService.getProductCategoryById(req.params.id);
    res.json(category);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updateProductCategory = async (req, res) => {
  try {
    const category = await ProductCategoryService.updateProductCategory(
      req.params.id,
      req.body
    );
    res.json(category);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteProductCategory = async (req, res) => {
  try {
    await ProductCategoryService.deleteProductCategory(req.params.id);
    res.json({ message: "Catégorie supprimée" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};
