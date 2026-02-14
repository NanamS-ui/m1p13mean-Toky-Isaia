const ShopCategory = require("../../models/shop/ShopCategory");

const buildError = (message, status) =>{
    const error = new Error(message);
    error.status = status;
    return error;
}

const createShopCategory = async (payload)=> ShopCategory.create(payload);

const getShopCategories = async() => ShopCategory.find();

const getShopCategoryById = async (id)=>{
    const shopCategory = await ShopCategory.findById(id);
    if(!shopCategory) throw buildError("Categorie de boutique introuvable", 404);
    return shopCategory;
};

const updateShopCategory = async (id, payload)=>{
    const shopCategory = await ShopCategory.findByIdAndUpdate(id, payload,{
        new: true,
        runValidators: true
    });
    if(!shopCategory) throw buildError("Categorie de boutique introuvable", 404);
    return shopCategory;
};

const deleteShopCategory = async (id) =>{
    const shopCategory = await ShopCategory.findByIdAndDelete(id);
    if(!shopCategory) throw buildError("Categorie de boutique introuvable", 404);
    return shopCategory;
};

module.exports = {
    createShopCategory,
    getShopCategories,
    getShopCategoryById,
    updateShopCategory,
    deleteShopCategory
};