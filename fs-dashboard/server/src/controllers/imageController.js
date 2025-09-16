import axios from "axios";

const DATA_SERVICE_URL = "http://localhost:8000";

/**
 * Upload image to data service endpoint
 * Accepts multipart/form-data with image file or base64 image data
 */
export const uploadImage = async (req, res) => {
  try {
    let imageData;

    // Check if image is uploaded as file or base64
    if (req.file) {
      // Convert uploaded file to base64
      const imageBuffer = req.file.buffer;
      const base64Image = imageBuffer.toString("base64");
      const mimeType = req.file.mimetype;
      imageData = `data:${mimeType};base64,${base64Image}`;
    } else if (req.body.image) {
      // Use provided base64 image data
      imageData = req.body.image;
    } else {
      return res.status(400).json({
        error: "No image provided. Send either file upload or base64 image data.",
      });
    }

    // Forward to data service
    const response = await axios.post(
      `${DATA_SERVICE_URL}/upload-image`,
      {
        image: imageData,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    // Return the response from data service
    res.json({
      success: true,
      data: response.data,
      message: "Image processed successfully",
    });
  } catch (error) {
    console.error("Error uploading image to data service:", error.message);

    if (error.code === "ECONNREFUSED")
      return res.status(503).json({
        error: "Data service is not available",
        details: "Please ensure the data service is running on port 8000",
      });

    if (error.response)
      // Forward error from data service
      return res.status(error.response.status).json({
        error: "Data service error",
        details: error.response.data,
      });

    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};
