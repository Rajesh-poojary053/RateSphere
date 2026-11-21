
const cloudinary = require("../config/cloudinary");

const uploadStoreImage = async (req, res, next) => {
  try {
    console.log("Upload request received");
    console.log("File details:", req.file);

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Image not received by server. Please try again."
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "ratesphere/stores",
          resource_type: "image"
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    return res.status(200).json({
      success: true,
      message: "Store image uploaded successfully.",
      imageUrl: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error("Cloudinary upload error:", error);
    next(error);
  }
};

module.exports = { uploadStoreImage };
