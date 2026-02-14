const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

require("dotenv").config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Définition des routes
app.use("/api/users", require("./routes/UserRoute"));
app.use("/api/roles", require("./routes/RoleRoute"));
app.use("/api/auth", require("./routes/AuthRoute"));
app.use("/api/shopCategories", require("./routes/ShopCategoryRoute"));
app.use("/api/floors", require("./routes/FloorRoute"));
app.use("/api/doors", require("./routes/DoorRoute"));
app.use("/api/shops", require("./routes/ShopRoute"));
app.use("/api/shopStatus", require("./routes/ShopStatusRoute"));
app.use("/api/productCategories", require("./routes/product/ProductCategoryRoute"));
app.use("/api/products", require("./routes/product/ProductRoute"));
app.use("/api/stocks", require("./routes/product/StockRoute"));
app.use("/api/promotions", require("./routes/product/PromotionRoute"));
app.use("/api/prices", require("./routes/product/PriceRoute"));




module.exports = app;
