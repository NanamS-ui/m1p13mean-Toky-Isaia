const mongoose = require("mongoose");

const StockViewSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model(
  "StockView",
  StockViewSchema,
  "stock_view"
);
