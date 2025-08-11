// Fetch all images from Cloudinary (across all folders)
export const getAllCloudinaryImages = async () => {
  try {
    // This assumes you have a backend endpoint that proxies the Cloudinary search API for security
    const response = await fetch(`/api/cloudinary/all-images`);
    if (!response.ok) {
      throw new Error('Failed to fetch all images');
    }
    return await response.json();
  } catch (error) {
    console.error('Cloudinary fetch all images error:', error);
    throw new Error('Failed to fetch all images from Cloudinary');
  }
};
// Removed Node.js cloudinary SDK import and config. Use direct upload via fetch for browser compatibility.

// Cloudinary utility functions for file uploads
// Note: We'll use the upload preset approach for client-side uploads

// Upload file to Cloudinary using upload preset
export const uploadToCloudinary = async (file, folder = 'hitam_ai') => {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dwva5ae36';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'Hitam_ai';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return {
      id: data.public_id,
      url: data.secure_url,
      publicId: data.public_id,
      name: data.public_id.split('/').pop(),
      folder: data.folder?.split('/').pop() || 'general',
      originalFolder: data.folder || 'hitam_ai/general',
      size: file.size,
      width: data.width,
      height: data.height,
      format: data.format,
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await fetch(`/api/cloudinary/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

// Get files from a specific folder
export const getFilesFromFolder = async (folder = 'hitam_ai') => {
  try {
    const response = await fetch(`/api/cloudinary/files?folder=${folder}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    return await response.json();
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    throw new Error('Failed to fetch files from Cloudinary');
  }
};

// Update name/folder of a file
export const updateCloudinaryResource = async ({ publicId, name, folder }) => {
  try {
    const response = await fetch(`/api/cloudinary/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId, name, folder })
    });

    if (!response.ok) {
      throw new Error('Update failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Cloudinary update error:', error);
    throw new Error('Failed to update file on Cloudinary');
  }
};

// Upload to specific subfolder
export const uploadToSubfolder = async (file, subfolder) => {
  const folder = `hitam_ai/${subfolder}`;
  return await uploadToCloudinary(file, folder);
};

// Upload event image
export const uploadEventImage = async (file) => {
  return await uploadToSubfolder(file, 'events');
};

// Upload upcoming event image
export const uploadUpcomingEventImage = async (file) => {
  return await uploadToSubfolder(file, 'events'); // Map to events folder
};

// Upload form registration file
export const uploadFormFile = async (file, formTitle) => {
  const folder = `hitam_ai/form_register/${formTitle}`;
  return await uploadToCloudinary(file, folder);
};

// Upload committee member image
export const uploadCommitteeMemberImage = async (file) => {
  return await uploadToSubfolder(file, 'committee_members');
};

// Upload community member image
export const uploadCommunityMemberImage = async (file) => {
  return await uploadToSubfolder(file, 'user_profiles'); // Map to user_profiles
};

// Upload general image
export const uploadGeneralImage = async (file) => {
  return await uploadToSubfolder(file, 'general');
};

// Upload form builder image
export const uploadFormBuilderImage = async (file) => {
  return await uploadToSubfolder(file, 'form_builder');
};
