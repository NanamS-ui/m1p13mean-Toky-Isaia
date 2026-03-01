const serverless = require("serverless-http");
const app = require("../backend/src/app"); 
const connectDB = require("../backend/src/config/db");

const handler = serverless(app);

module.exports = async (req, res) => {
	try {
		await connectDB();
	} catch (err) {
		const message = err?.message || String(err);
		return res.status(500).json({ ok: false, error: "DB_CONNECTION_FAILED", message });
	}

	return handler(req, res);
};