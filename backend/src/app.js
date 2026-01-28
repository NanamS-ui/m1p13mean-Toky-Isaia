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

module.exports = app;
