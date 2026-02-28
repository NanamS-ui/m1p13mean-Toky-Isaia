const ProductService = require("../../services/product/ProductService");
const UploadService = require("../../services/UploadService");

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
    console.error(error);
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

exports.uploadProductImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image requise" });
    }

    const result = await UploadService.uploadToCloudinary(image, "products");

    res.status(200).json({
      url: result.url,
      publicId: result.publicId,
      message: "Image de produit uploadée avec succès"
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getMyFavoriteProductIds = async (req, res) => {
  try {
    const ids = await ProductService.getFavoriteProductIdsByUser(req.user.id);
    res.json(ids);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.isFavoriteProduct = async (req, res) => {
  try {
    const isFavorite = await ProductService.isFavoriteProduct(req.user.id, req.params.id);
    res.json({ isFavorite });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.addFavoriteProduct = async (req, res) => {
  try {
    const favoriteProducts = await ProductService.addFavoriteProduct(req.user.id, req.params.id);
    res.status(200).json({ message: "Produit ajouté aux favoris", favoriteProducts });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.removeFavoriteProduct = async (req, res) => {
  try {
    const favoriteProducts = await ProductService.removeFavoriteProduct(req.user.id, req.params.id);
    res.status(200).json({ message: "Produit retiré des favoris", favoriteProducts });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};
