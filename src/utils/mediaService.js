import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp,
  limit
} from "firebase/firestore";
import { db } from "../firebase";
import { uploadImageDirect, deleteImageDirect } from "./cloudinaryDirect";

// Media collection reference
const mediaCollection = collection(db, "media");

/**
 * Upload media to Cloudinary and save metadata to Firestore
 * @param {File} file - The file to upload
 * @param {string} folder - Cloudinary folder
 * @param {Object} metadata - Additional metadata to store
 * @returns {Promise<Object>} - Upload result with Firestore document
 */
export const uploadMedia = async (file, folder = 'general', metadata = {}) => {
  try {
    // Upload to Cloudinary
    const cloudinaryResult = await uploadImageDirect(file, folder);
    
    // Prepare media document for Firestore
    const mediaDoc = {
      name: file.name,
      originalName: file.name,
      url: cloudinaryResult.url,
      publicId: cloudinaryResult.publicId,
      folder: folder,
      format: cloudinaryResult.format,
      size: cloudinaryResult.size,
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      mimeType: file.type,
      uploadedBy: metadata.uploadedBy || 'anonymous',
      tags: metadata.tags || [],
      description: metadata.description || '',
      altText: metadata.altText || '',
      isPublic: metadata.isPublic !== false, // Default to public
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...metadata
    };

    // Save to Firestore
    const docRef = await addDoc(mediaCollection, mediaDoc);
    
    return {
      id: docRef.id,
      ...mediaDoc,
      cloudinaryResult
    };
  } catch (error) {
    console.error('Error uploading media:', error);
    throw new Error(`Failed to upload media: ${error.message}`);
  }
};

/**
 * Update media metadata in Firestore
 * @param {string} mediaId - Firestore document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateMedia = async (mediaId, updates) => {
  try {
    const mediaRef = doc(db, "media", mediaId);
    await updateDoc(mediaRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating media:', error);
    throw new Error(`Failed to update media: ${error.message}`);
  }
};

/**
 * Delete media from both Cloudinary and Firestore
 * @param {string} mediaId - Firestore document ID
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<void>}
 */
export const deleteMedia = async (mediaId, publicId) => {
  try {
    // Delete from Cloudinary
    if (publicId) {
      await deleteImageDirect(publicId);
    }
    
    // Delete from Firestore
    const mediaRef = doc(db, "media", mediaId);
    await deleteDoc(mediaRef);
  } catch (error) {
    console.error('Error deleting media:', error);
    throw new Error(`Failed to delete media: ${error.message}`);
  }
};

/**
 * Get media documents from Firestore with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of media documents
 */
export const getMedia = async (options = {}) => {
  try {
    const { folder, tags, uploadedBy, limit: limitCount = 100, orderByField = 'createdAt', orderDirection = 'desc' } = options;
    
    let q = collection(db, "media");
    const constraints = [];
    
    // Add filters
    if (folder && folder !== 'all') {
      constraints.push(where("folder", "==", folder));
    }
    
    if (tags && tags.length > 0) {
      constraints.push(where("tags", "array-contains-any", tags));
    }
    
    if (uploadedBy) {
      constraints.push(where("uploadedBy", "==", uploadedBy));
    }
    
    // Add ordering
    constraints.push(orderBy(orderByField, orderDirection));
    
    // Add limit
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
    
    // Apply constraints
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    const snapshot = await getDocs(q);
    const media = [];
    
    snapshot.forEach((doc) => {
      media.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return media;
  } catch (error) {
    console.error('Error fetching media:', error);
    throw new Error(`Failed to fetch media: ${error.message}`);
  }
};

/**
 * Get media by ID
 * @param {string} mediaId - Firestore document ID
 * @returns {Promise<Object|null>} - Media document or null
 */
export const getMediaById = async (mediaId) => {
  try {
    const mediaRef = doc(db, "media", mediaId);
    const mediaDoc = await getDocs(mediaRef);
    
    if (mediaDoc.exists()) {
      return {
        id: mediaDoc.id,
        ...mediaDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching media by ID:', error);
    throw new Error(`Failed to fetch media: ${error.message}`);
  }
};

/**
 * Search media by text query
 * @param {string} searchQuery - Search term
 * @param {Object} options - Additional search options
 * @returns {Promise<Array>} - Array of matching media documents
 */
export const searchMedia = async (searchQuery, options = {}) => {
  try {
    const { folder, limit: limitCount = 50 } = options;
    
    // Get all media first (Firestore doesn't support full-text search)
    let media = await getMedia({ folder, limit: 1000 });
    
    // Filter by search query
    const query = searchQuery.toLowerCase();
    media = media.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query)) ||
      item.altText.toLowerCase().includes(query)
    );
    
    // Apply limit
    if (limitCount) {
      media = media.slice(0, limitCount);
    }
    
    return media;
  } catch (error) {
    console.error('Error searching media:', error);
    throw new Error(`Failed to search media: ${error.message}`);
  }
};

/**
 * Get media statistics
 * @returns {Promise<Object>} - Media statistics
 */
export const getMediaStats = async () => {
  try {
    const allMedia = await getMedia({ limit: 1000 });
    
    const stats = {
      total: allMedia.length,
      byFolder: {},
      byFormat: {},
      totalSize: 0,
      averageSize: 0
    };
    
    allMedia.forEach(item => {
      // Count by folder
      stats.byFolder[item.folder] = (stats.byFolder[item.folder] || 0) + 1;
      
      // Count by format
      stats.byFormat[item.format] = (stats.byFormat[item.format] || 0) + 1;
      
      // Calculate total size
      stats.totalSize += item.size || 0;
    });
    
    // Calculate average size
    if (stats.total > 0) {
      stats.averageSize = Math.round(stats.totalSize / stats.total);
    }
    
    return stats;
  } catch (error) {
    console.error('Error fetching media stats:', error);
    throw new Error(`Failed to fetch media stats: ${error.message}`);
  }
};

export default {
  uploadMedia,
  updateMedia,
  deleteMedia,
  getMedia,
  getMediaById,
  searchMedia,
  getMediaStats
};
