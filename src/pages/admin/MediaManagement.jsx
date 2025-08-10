import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiImage, FiTrash2, FiEdit3, FiPlus, FiFolder, FiSearch, FiGrid, FiList, FiRefreshCw } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import CloudinaryUpload from '../../components/ui/CloudinaryUpload';
import { uploadToCloudinary, getAllCloudinaryImages, getFilesFromFolder, deleteFromCloudinary } from "../../utils/cloudinary";

const MediaManagement= () => {
  const [images, setImages] = useState([]);
  const [allImages, setAllImages] = useState([]); // For stats calculation
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const folders = [
    { id: 'all', name: 'All Images', icon: FiImage, color: 'bg-gray-500' },
    { id: 'events', name: 'Events', icon: FiFolder, color: 'bg-blue-500' },
    { id: 'formregister', name: 'Form Registration', icon: FiFolder, color: 'bg-green-500' },
    { id: 'commitymembers', name: 'Committee Members', icon: FiFolder, color: 'bg-purple-500' },
    { id: 'profiles', name: 'User Profiles', icon: FiFolder, color: 'bg-orange-500' },
    { id: 'general', name: 'General', icon: FiFolder, color: 'bg-indigo-500' }
  ];

  // Load all images for stats calculation
  useEffect(() => {
    const loadAllImagesForStats = async () => {
      try {
        const allImagesData = await getAllCloudinaryImages();
        setAllImages(allImagesData);
      } catch (error) {
        console.error('Error loading all images for stats:', error);
      }
    };
    loadAllImagesForStats();
  }, []);

  // Load images from Cloudinary based on selected folder
  useEffect(() => {
    loadImages();
  }, [selectedFolder]);

  const loadImages = async () => {
    setLoading(true);
    try {
      let images = [];
      if (selectedFolder === 'all') {
        // Get all images and let the filtering happen on the frontend
        images = await getAllCloudinaryImages();
      } else {
        // For specific folders, get all images and filter by folder
        const allImages = await getAllCloudinaryImages();
        images = allImages.filter(img => img.folder === selectedFolder);
      }
      setImages(images);
    } catch (error) {
      console.error('Error loading images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Reload all images for stats
      const allImagesData = await getAllCloudinaryImages();
      setAllImages(allImagesData);
      
      // Reload current folder images
      await loadImages();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpload = async (uploadData) => {
    if (!uploadData) return;
    setUploading(true);
    try {
      // After upload, reload all images for stats and current folder
      const allImagesData = await getAllCloudinaryImages();
      setAllImages(allImagesData);
      await loadImages();
      setShowUploadModal(false);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      // Find the image to get its publicId
      const imageToDelete = images.find(img => img.id === imageId);
      if (!imageToDelete) {
        throw new Error('Image not found');
      }

      // Delete from Cloudinary using the backend API
      await deleteFromCloudinary(imageToDelete.publicId);
      
      // Reload all images for stats and current folder
      const allImagesData = await getAllCloudinaryImages();
      setAllImages(allImagesData);
      await loadImages();
      
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  const handleEdit = (image) => {
    setEditingImage(image);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingImage) return;

    setImages(prev => 
      prev.map(img => 
        img.id === editingImage.id 
          ? { ...img, name: editingImage.name, folder: editingImage.folder }
          : img
      )
    );

    setShowEditModal(false);
    setEditingImage(null);
    alert('Image updated successfully!');
  };

  const filteredImages = images.filter(image => {
    // Since we're already filtering by folder in loadImages, we only need to filter by search
    const matchesSearch = image.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFolderStats = () => {
    const stats = {};
    folders.forEach(folder => {
      if (folder.id === 'all') {
        stats[folder.id] = allImages.length;
      } else {
        stats[folder.id] = allImages.filter(img => img.folder === folder.id).length;
      }
    });
    return stats;
  };

  // Log folder distribution for debugging
  useEffect(() => {
    if (images.length > 0) {
      const folderDistribution = {};
      images.forEach(img => {
        folderDistribution[img.folder] = (folderDistribution[img.folder] || 0) + 1;
      });
      console.log('Current folder:', selectedFolder);
      console.log('Images loaded:', images.length);
      console.log('Folder distribution:', folderDistribution);
    }
  }, [images, selectedFolder]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading media...</p>
        </div>
      </div>
    );
  }

  const folderStats = getFolderStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Media Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all images and media files across the platform using Cloudinary
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              onClick={() => setViewMode('grid')}
              size="sm"
            >
              <FiGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              onClick={() => setViewMode('list')}
              size="sm"
            >
              <FiList className="w-4 h-4" />
            </Button>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>

          {/* Upload Button */}
          <Button
            onClick={() => setShowUploadModal(true)}
            className="whitespace-nowrap"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
        </div>

        {/* Folder Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors duration-200 ${
                selectedFolder === folder.id
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${folder.color}`}></div>
              <folder.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{folder.name}</span>
              <span className="text-xs opacity-75">
                ({folderStats[folder.id] || 0})
              </span>
            </button>
          ))}
        </div>

        {/* Images Grid/List */}
        {filteredImages.length === 0 ? (
          <Card className="text-center py-12">
            <FiImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No images found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery || selectedFolder !== 'all' 
                ? 'Try adjusting your search or folder selection'
                : 'Get started by uploading your first image'
              }
            </p>
            {!searchQuery && selectedFolder === 'all' && (
              <Button onClick={() => setShowUploadModal(true)}>
                <FiPlus className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            )}
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {filteredImages.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={viewMode === 'grid' ? '' : 'bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700'}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <Card className="overflow-hidden">
                    <div className="relative group">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(image)}
                            className="bg-white text-gray-900 hover:bg-gray-100"
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(image.id)}
                            className="bg-white text-red-600 hover:bg-red-50"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                        {image.name}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{image.folder}</span>
                        <span>{formatFileSize(image.size)}</span>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatDate(image.createdAt)}
                      </div>
                    </div>
                  </Card>
                ) : (
                  // List View
                  <div className="flex items-center gap-4">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {image.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {image.folder} • {formatFileSize(image.size)} • {image.width}×{image.height}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(image.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(image)}
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(image.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Upload New Image"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Folder
              </label>
              <select
                value={selectedFolder === 'all' ? 'general' : selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {folders.filter(f => f.id !== 'all').map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            <CloudinaryUpload
              onUpload={handleUpload}
              folder={(() => {
                if (selectedFolder === 'all') return 'hitam_ai/general';
                switch (selectedFolder) {
                  case 'events': return 'hitam_ai/events';
                  case 'formregister': return 'hitam_ai/form_register';
                  case 'commitymembers': return 'hitam_ai/committee_members';
                  case 'profiles': return 'hitam_ai/user_profiles';
                  case 'general': return 'hitam_ai/general';
                  default: return 'hitam_ai/general';
                }
              })()}
              showPreview={true}
            />

            {uploading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Uploading to Cloudinary...
                </p>
              </div>
            )}
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingImage(null);
          }}
          title="Edit Image"
          size="md"
        >
          {editingImage && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image Name
                </label>
                <Input
                  value={editingImage.name}
                  onChange={(e) => setEditingImage({ ...editingImage, name: e.target.value })}
                  placeholder="Enter image name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Folder
                </label>
                <select
                  value={editingImage.folder}
                  onChange={(e) => setEditingImage({ ...editingImage, folder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {folders.filter(f => f.id !== 'all').map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingImage(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MediaManagement;
