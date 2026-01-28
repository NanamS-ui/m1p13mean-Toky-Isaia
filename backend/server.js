const app = require("./src/app");

app.listen(process.env.PORT, () =>
  console.log(`Serveur démarré sur le port ${process.env.PORT}`)
);
