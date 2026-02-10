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



module.exports = app;
