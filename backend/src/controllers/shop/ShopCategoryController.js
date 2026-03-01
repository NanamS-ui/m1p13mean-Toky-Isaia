const ShopCategoryService = require("../../services/shop/ShopCategoryService");

exports.createShopCategory = async (req, res) =>{
    try{
        const shopCategory = await ShopCategoryService.createShopCategory(req.body);
        res.status(201).json(shopCategory);
    }catch(error){
        res.status(error.status || 400).json({message: error.message});
    }
};

exports.getShopCategories = async (req, res) =>{
    try{
        const shopCategories = await ShopCategoryService.getShopCategories();
        res.json(shopCategories);
    }catch(error){
        res.status(error.status|| 500).json({message : error.message});
    }
};

exports.getShopCategoryById = async (req, res) =>{
    try{
        const shopCategory = await ShopCategoryService.getShopCategoryById(req.params.id);
        res.json(shopCategory);
    }catch(error){
        res.status(error.status || 400).json({message : error.message});
    }
};

exports.updateShopCategory = async (req, res) =>{
    try{
        const shopCategory = await ShopCategoryService.updateShopCategory(req.params.id,req.body);
        res.json(shopCategory);
    }catch(error){
        res.status(error.status || 400).json({message : error.message});
    }
};

exports.deleteShopCategory = async (req, res)=>{
    try{
        const shopCategory = await ShopCategoryService.deleteShopCategory(req.params.id);
        res.json({message: "Categorie boutique supprimée"});
    }catch(error){
        res.status(error.status || 400).json({message : error.message});
    }
};