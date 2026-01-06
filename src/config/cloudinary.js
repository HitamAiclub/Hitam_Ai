// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
  upload_preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  folders: {
    events: 'events',
    formregister: 'formregister',
    commitymembers: 'commitymembers',
    profiles: 'profiles',
    general: 'general'
  }
};

// Upload URL
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`;

// Default upload parameters - simplified without upload preset
export const getDefaultUploadParams = (folder = 'general') => ({
  folder: CLOUDINARY_CONFIG.folders[folder] || folder
});

// Cloudinary API endpoints for admin operations
export const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}`;

export default CLOUDINARY_CONFIG;
