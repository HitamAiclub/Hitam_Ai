import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiX } from 'react-icons/fi';
import LoadingSpinner from '../ui/LoadingSpinner';

function EventForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    presenter: initialData.presenter || '',
    date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
    type: initialData.type || 'event',
    imageFile: null,
    imageUrl: initialData.imageUrl || '',
  });
  
  const [imagePreview, setImagePreview] = useState(initialData.imageUrl || '');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearImageSelection = () => {
    setFormData(prev => ({ ...prev, imageFile: null }));
    setImagePreview(initialData.imageUrl || '');
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Event Type</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="event"
              checked={formData.type === 'event'}
              onChange={handleChange}
              className="mr-2"
            />
            Event
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="workshop"
              checked={formData.type === 'workshop'}
              onChange={handleChange}
              className="mr-2"
            />
            Workshop
          </label>
        </div>
      </div>
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={formData.title}
          onChange={handleChange}
          className="w-full"
          placeholder="Enter title"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          value={formData.description}
          onChange={handleChange}
          className="w-full"
          placeholder="Enter description"
        />
      </div>
      
      <div>
        <label htmlFor="presenter" className="block text-sm font-medium mb-1">Presenter/Host</label>
        <input
          id="presenter"
          name="presenter"
          type="text"
          value={formData.presenter}
          onChange={handleChange}
          className="w-full"
          placeholder="Enter presenter's name"
        />
      </div>
      
      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-1">
          {formData.type === 'workshop' ? 'Start Date' : 'Date'}
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          value={formData.date}
          onChange={handleChange}
          className="w-full"
        />
      </div>
      
      {formData.type === 'workshop' && (
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-1">End Date</label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full"
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">Image</label>
        <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-4">
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="mx-auto h-48 object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={clearImageSelection}
                className="absolute top-2 right-2 p-1 bg-error-500 text-white rounded-full"
                aria-label="Clear image"
              >
                <FiX />
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiUpload className="mx-auto h-12 w-12 text-neutral-400" />
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}
          
          <input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={`mt-2 w-full ${imagePreview ? '' : 'opacity-0 absolute inset-0 cursor-pointer'}`}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm text-sm font-medium"
          disabled={isLoading}
        >
          Cancel
        </button>
        
        <motion.button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <div className="flex items-center">
              <LoadingSpinner size="sm" color="white" />
              <span className="ml-2">Saving...</span>
            </div>
          ) : (
            <span>{initialData.id ? 'Update' : 'Create'}</span>
          )}
        </motion.button>
      </div>
    </form>
  );
}

export default EventForm;