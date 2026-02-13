const cloudinary = require("../config/cloudinary");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const uploadToCloudinary = async (base64Data, folderName = "shops") => {
  try {
    if (!base64Data || typeof base64Data !== "string") {
      throw buildError("Données invalides pour l'upload", 400);
    }

    const result = await cloudinary.uploader.upload(base64Data, {
      folder: folderName,
      resource_type: "auto",
      quality: "auto"
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error("Erreur Cloudinary:", error);
    throw buildError(
      error.message || "Erreur lors de l'upload de l'image",
      500
    );
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Erreur suppression Cloudinary:", error);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};
