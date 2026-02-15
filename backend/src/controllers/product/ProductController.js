const ProductService = require("../../services/product/ProductService");

exports.createProduct = async (req, res) => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.createProductStock = async (req, res) => {
  try {
    const product = await ProductService.createProductStock(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await ProductService.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await ProductService.updateProduct(
      req.params.id,
      req.body
    );
    res.json(product);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};
exports.updateProductByFormulaire = async (req, res) => {
  try {
    const product = await ProductService.updateProductStockByFormulaire(
      req.params.id,
      req.body
    );
    res.json(product);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await ProductService.deleteProduct(req.params.id);
    res.json({ message: "Produit supprimé" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};
