const ShopService = require("../../services/shop/ShopService");
const UploadService = require("../../services/UploadService");

exports.createShopWithProprietaire = async (req, res) => {
  try {
    const shop = await ShopService.createShopWithProprietaire(req.body);
    res.status(201).json(shop);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.createShop = async (req, res) => {
  try {
    const shop = await ShopService.createShop(req.body, req.user.id);
    res.status(201).json(shop);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getShops = async (req, res) => {
  try {
    const shops = await ShopService.getShops();
    res.json(shops);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getActiveShops = async (req, res) => {
  try {
    const { floor, category } = req.query;
    const shops = await ShopService.getActiveShops(floor, category);
    res.json(shops);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getTopShops = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10);
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10;
    const shops = await ShopService.getTopShopsPublic(safeLimit);
    res.json(shops);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getShopById = async (req, res) => {
  try {
    const shop = await ShopService.getShopById(req.params.id);
    res.json(shop);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};
exports.getShopByIdOwner = async (req, res) => {
  try {
    const shops = await ShopService.getByIdOwner(req.user.id);
    res.json(shops);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getMyFavoriteShops = async (req, res) => {
  try {
    const shops = await ShopService.getFavoriteShopsByUser(req.user.id);
    res.json(shops);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getMyFavoriteShopIds = async (req, res) => {
  try {
    const ids = await ShopService.getFavoriteShopIdsByUser(req.user.id);
    res.json(ids);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.addFavoriteShop = async (req, res) => {
  try {
    const favoriteShops = await ShopService.addFavoriteShop(req.user.id, req.params.id);
    res.status(200).json({ message: "Boutique ajoutée aux favoris", favoriteShops });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.removeFavoriteShop = async (req, res) => {
  try {
    const favoriteShops = await ShopService.removeFavoriteShop(req.user.id, req.params.id);
    res.status(200).json({ message: "Boutique retirée des favoris", favoriteShops });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.isFavoriteShop = async (req, res) => {
  try {
    const isFavorite = await ShopService.isFavoriteShop(req.user.id, req.params.id);
    res.json({ isFavorite });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};
exports.updateShop = async (req, res) => {
  console.log(req.user);
  try {
    const shop = await ShopService.updateShop(req.params.id, req.body);
    res.json(shop);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteShop = async (req, res) => {
  try {
    await ShopService.deleteShop(req.params.id);
    res.json({ message: "Boutique supprimée" });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.addSuspension = async (req, res) => {
  try {
    const shop = await ShopService.addSuspension(req.params.id, req.body);
    res.json(shop);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.updateShopStatus = async (req, res) => {
  try {
    const { status_value, id_shop } = req.body;

    const updatedShop = await ShopService.updateShopStatus(
      status_value,
      id_shop
    );

    res.status(200).json(updatedShop);

  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Internal Server Error"
    });
  }
};

exports.uploadShopLogo = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image requise" });
    }

    const result = await UploadService.uploadToCloudinary(image, "shop-logos");

    res.status(200).json({
      url: result.url,
      publicId: result.publicId,
      message: "Logo uploadé avec succès"
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.uploadShopBanner = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image requise" });
    }

    const result = await UploadService.uploadToCloudinary(image, "shop-banners");

    res.status(200).json({
      url: result.url,
      publicId: result.publicId,
      message: "Bannière uploadée avec succès"
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
