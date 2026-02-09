const mongoose = require("mongoose");

const ShopCategoriesSchema = new mongoose.Schema(
    {
        value: {
            type : String,
            required : true,
            trim : true
        }
    },
    {timestamps : false}
);

ShopCategoriesSchema.index({value : 1},{unique: true});

module.exports = mongoose.model("ShopCategory", ShopCategoriesSchema, "shop_categories");