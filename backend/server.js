require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
  })
  .catch((err) => {
    console.error("[db] Mongo connection failed:", err?.message || err);
    process.exit(1);
  });
