import { useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../ui/LoadingSpinner';

function MemberForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    rollNo: initialData.rollNo || '',
    year: initialData.year || '',
    branch: initialData.branch || '',
    email: initialData.email || '',
    role: initialData.role || '',
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Electrical', 'Mechanical', 'Civil', 'Other'];
  const roles = ['Club President', 'Vice President', 'Secretary', 'Treasurer', 'Technical Lead', 'Event Coordinator', 'Media Coordinator', 'Member'];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full"
          placeholder="Enter full name"
        />
      </div>
      
      <div>
        <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full"
        >
          <option value="">Select Role</option>
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="rollNo" className="block text-sm font-medium mb-1">Roll Number</label>
        <input
          id="rollNo"
          name="rollNo"
          type="text"
          required
          value={formData.rollNo}
          onChange={handleChange}
          className="w-full"
          placeholder="Enter roll number"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="year" className="block text-sm font-medium mb-1">Year</label>
          <select
            id="year"
            name="year"
            required
            value={formData.year}
            onChange={handleChange}
            className="w-full"
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="branch" className="block text-sm font-medium mb-1">Branch</label>
          <select
            id="branch"
            name="branch"
            required
            value={formData.branch}
            onChange={handleChange}
            className="w-full"
          >
            <option value="">Select Branch</option>
            {branches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full"
          placeholder="Enter email address"
        />
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
            <span>{initialData.id ? 'Update' : 'Add'} Member</span>
          )}
        </motion.button>
      </div>
    </form>
  );
}

export default MemberForm;