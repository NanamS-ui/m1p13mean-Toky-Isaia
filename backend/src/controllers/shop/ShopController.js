const ShopService = require("../../services/shop/ShopService");
const UploadService = require("../../services/UploadService");

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

exports.getShopById = async (req, res) => {
  try {
    const shop = await ShopService.getShopById(req.params.id);
    res.json(shop);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.updateShop = async (req, res) => {
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
