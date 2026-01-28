const mongoose = require("mongoose");

// Définition du schéma utilisateur
const UserSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true // supprime les espaces au début et à la fin
  },
  email: {
    type: String,
    required: true,
    unique: true, // empêche les doublons
    lowercase: true, // transforme en minuscules
    trim: true
  },
  telephone: {
    type: String,
    required: true,
    trim: true
  },
  adresse: {
    type: String,
    required: true,
    trim: true
  },
  motDePasse: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "user"], // seuls ces rôles sont autorisés
    default: "user"
  }
}, {
  timestamps: true // ajoute createdAt et updatedAt automatiquement
});

module.exports = mongoose.model("User", UserSchema);
