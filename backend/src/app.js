const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const mongoose = require("mongoose");

require("dotenv").config();
connectDB().catch((err) => {
	console.error("[db] Mongo connection failed:", err?.message || err);
});

const app = express();
app.use(cors());

// Limite plus stricte en prod Vercel, plus large en local.
const bodyLimit = process.env.VERCEL ? "4mb" : "50mb";
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ limit: bodyLimit, extended: true }));

app.get("/api/health", (req, res) => {
	res.status(200).json({
		ok: true,
		dbReadyState: mongoose.connection.readyState,
		hasMongoUri: Boolean(process.env.MONGO_URI),
	});
});

// Définition des routes
app.use("/api/users", require("./routes/user/UserRoute"));
app.use("/api/roles", require("./routes/user/RoleRoute"));
app.use("/api/auth", require("./routes/AuthRoute"));
app.use("/api/shopCategories", require("./routes/shop/ShopCategoryRoute"));
app.use("/api/floors", require("./routes/shop/FloorRoute"));
app.use("/api/doors", require("./routes/shop/DoorRoute"));
app.use("/api/shops", require("./routes/shop/ShopRoute"));
app.use("/api/shopStatus", require("./routes/shop/ShopStatusRoute"));
app.use("/api/serviceCenters", require("./routes/config/ServiceCenterRoute"));
app.use("/api/infoCenter", require("./routes/config/InfoCenterRoute"));
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
app.use("/api/notifications", require("./routes/communication/NotificationRoute"));

// Gestion d'erreurs de parsing body (raw-body / body-parser)
app.use((err, req, res, next) => {
	if (err?.type === "entity.too.large") {
		return res.status(413).json({ message: "Payload too large", limit: bodyLimit });
	}

	if (
		err?.type === "request.size.invalid" ||
		(typeof err?.message === "string" && err.message.includes("request size did not match content length"))
	) {
		return res.status(400).json({
			message: "Invalid request body size (content-length mismatch).",
			hint: "On Vercel, avoid large JSON/base64 uploads; upload files directly to Cloudinary or reduce payload size.",
		});
	}

	return next(err);
});



module.exports = app;
