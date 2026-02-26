const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

require("dotenv").config();
connectDB();

const app = express();
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
app.use("/api/stock-mouvements", require("./routes/product/StockMouvementRoute"));
app.use("/api/orderCategories", require("./routes/order/OrderCategoryRoute"));
app.use("/api/orders", require("./routes/order/OrderRoute"));
app.use("/api/orderItems", require("./routes/order/OrderItemRoute"));
app.use("/api/stats", require("./routes/statistic/OrderStatisticRouter"));
app.use("/api/adminStats", require("./routes/statistic/AdminStatisticRouter"));
app.use("/api/messenger", require("./routes/messenger/MessengerRoute"));
app.use("/api/shopReviews", require("./routes/shop/ShopReviewRoute"));
app.use("/api/notices", require("./routes/notice/NoticeRoute"));
app.use("/api/eventCategories", require("./routes/events/EventCategoryRoute"));
app.use("/api/events", require("./routes/events/EventRoute"));

app.use("/api/payments", require("./routes/payment/PaymentRoute"));


app.use("/api/user_status", require("./routes/user/UserStatusRoute"));

app.use("/api/documents", require("./routes/billing/BillingDocumentRoute"));
app.use("/api/status_support_clients", require("./routes/supportClient/StatusSupportClientRoute"));
app.use("/api/type_support_clients", require("./routes/supportClient/TypeSupportClientRoute"));
app.use("/api/support_clients", require("./routes/supportClient/SupportClientRoute"));



module.exports = app;
