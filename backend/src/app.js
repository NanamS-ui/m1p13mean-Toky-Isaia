const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

require("dotenv").config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Définition des routes
app.use("/api/users", require("./routes/user/UserRoute"));
app.use("/api/roles", require("./routes/user/RoleRoute"));
app.use("/api/auth", require("./routes/AuthRoute"));
app.use("/api/shopCategories", require("./routes/shop/ShopCategoryRoute"));
app.use("/api/floors", require("./routes/shop/FloorRoute"));
app.use("/api/doors", require("./routes/shop/DoorRoute"));
app.use("/api/shops", require("./routes/shop/ShopRoute"));
app.use("/api/shopStatus", require("./routes/shop/ShopStatusRoute"));
app.use("/api/productCategories", require("./routes/product/ProductCategoryRoute"));
app.use("/api/products", require("./routes/product/ProductRoute"));
app.use("/api/stocks", require("./routes/product/StockRoute"));
app.use("/api/promotions", require("./routes/product/PromotionRoute"));
app.use("/api/prices", require("./routes/product/PriceRoute"));
app.use("/api/tags", require("./routes/product/TagRoute"));





module.exports = app;
