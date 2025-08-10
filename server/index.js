import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwva5ae36',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

  // Helper function to map Cloudinary folders to UI folders
  const mapFolderToUI = (publicId) => {
    const pathParts = publicId.split('/');
    let folderName = 'general';
    
    if (pathParts.length > 1) {
      const cloudinaryFolder = pathParts[1];
      switch (cloudinaryFolder) {
        case 'committee_members':
          folderName = 'commitymembers';
          break;
        case 'events':
        case 'upcoming_events':
          folderName = 'events';
          break;
        case 'form_register':
        case 'form_builder':
          folderName = 'formregister';
          break;
        case 'user_profiles':
        case 'community_members':
          folderName = 'profiles';
          break;
        case 'general':
          folderName = 'general';
          break;
        default:
          folderName = 'general';
      }
    }
    
    return folderName;
  };

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("HITAM AI API is running");
});

// Cloudinary API endpoints
app.get("/api/cloudinary/all-images", async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();
    
    const images = result.resources.map(resource => {
      return {
        id: resource.public_id,
        url: resource.secure_url,
        publicId: resource.public_id,
        name: resource.public_id.split('/').pop(),
        folder: mapFolderToUI(resource.public_id),
        size: resource.bytes,
        width: resource.width,
        height: resource.height,
        format: resource.format,
        createdAt: resource.created_at,
        originalFolder: resource.public_id.split('/')[1] || 'general',
      };
    });
    
    res.json(images);
  } catch (error) {
    console.error('Error fetching all images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

app.get("/api/cloudinary/files", async (req, res) => {
  try {
    const { folder } = req.query;
    const expression = folder ? `folder:${folder}/*` : 'resource_type:image';
    
    const result = await cloudinary.search
      .expression(expression)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();
    
    const images = result.resources.map(resource => {
      return {
        id: resource.public_id,
        url: resource.secure_url,
        publicId: resource.public_id,
        name: resource.public_id.split('/').pop(),
        folder: mapFolderToUI(resource.public_id),
        size: resource.bytes,
        width: resource.width,
        height: resource.height,
        format: resource.format,
        createdAt: resource.created_at,
        originalFolder: resource.public_id.split('/')[1] || 'general',
      };
    });
    
    res.json(images);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

app.delete("/api/cloudinary/delete", async (req, res) => {
  try {
    const { publicId } = req.body;
    
    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({ success: true, message: 'Image deleted successfully' });
    } else {
      res.status(400).json({ error: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Start server with port fallback
const startServer = (port) => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);