const express = require("express");
const multer = require("multer");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 Cloudinary Config (PUT YOUR REAL VALUES)
cloudinary.config({
  cloud_name: "YOUR_CLOUD_NAME",
  api_key: "YOUR_API_KEY",
  api_secret: "YOUR_API_SECRET"
});

// Upload setup
const upload = multer({ dest: "uploads/" });

// Upload API
app.post("/upload", upload.single("photo"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "cloud_gallery"
    });

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Get images
app.get("/images", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      prefix: "cloud_gallery",
      max_results: 50
    });

    const images = result.resources.map(i => ({
      url: i.secure_url,
      public_id: i.public_id
    }));

    res.json(images);
  } catch (err) {
    res.status(500).send("Error");
  }
});

// Delete
app.delete("/delete", async (req, res) => {
  await cloudinary.uploader.destroy(req.body.public_id);
  res.send("Deleted");
});

app.listen(5000, () =>
  console.log("🚀 Server running http://localhost:5000")
);