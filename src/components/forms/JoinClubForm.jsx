import { useState } from "react";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import LoadingSpinner from "../ui/LoadingSpinner";

function JoinClubForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    year: "",
    branch: "",
    email: "",
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    // Validate roll number
    if (!formData.rollNo.trim()) {
      newErrors.rollNo = "Roll number is required";
    }
    
    // Validate year
    if (!formData.year) {
      newErrors.year = "Year is required";
    }
    
    // Validate branch
    if (!formData.branch) {
      newErrors.branch = "Branch is required";
    }
    
    // Validate email (must be @hitam.org)
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.endsWith("@hitam.org")) {
      newErrors.email = "Must be a valid HITAM email (@hitam.org)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const branches = ["Computer Science", "Information Technology", "Electronics", "Electrical", "Mechanical", "Civil", "Other"];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className={`w-full ${errors.name ? "border-error-500" : ""}`}
          placeholder="Enter your full name"
        />
        {errors.name && <p className="text-error-500 text-sm mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="rollNo" className="block text-sm font-medium mb-1">Roll Number</label>
        <input
          id="rollNo"
          name="rollNo"
          type="text"
          value={formData.rollNo}
          onChange={handleChange}
          className={`w-full ${errors.rollNo ? "border-error-500" : ""}`}
          placeholder="Enter your roll number"
        />
        {errors.rollNo && <p className="text-error-500 text-sm mt-1">{errors.rollNo}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="year" className="block text-sm font-medium mb-1">Year</label>
          <select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className={`w-full ${errors.year ? "border-error-500" : ""}`}
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {errors.year && <p className="text-error-500 text-sm mt-1">{errors.year}</p>}
        </div>
        
        <div>
          <label htmlFor="branch" className="block text-sm font-medium mb-1">Branch</label>
          <select
            id="branch"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className={`w-full ${errors.branch ? "border-error-500" : ""}`}
          >
            <option value="">Select Branch</option>
            {branches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
          {errors.branch && <p className="text-error-500 text-sm mt-1">{errors.branch}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">HITAM Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full ${errors.email ? "border-error-500" : ""}`}
          placeholder="youremail@hitam.org"
        />
        {errors.email && <p className="text-error-500 text-sm mt-1">{errors.email}</p>}
      </div>
      
      <motion.button
        type="submit"
        className="w-full btn-primary py-3 mt-6"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner size="sm" color="white" />
            <span className="ml-2">Submitting...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <FiCheck className="mr-2" />
            <span>Join HITAM AI Club</span>
          </div>
        )}
      </motion.button>
      
      <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-4">
        By joining, you agree to receive updates about AI club activities and events.
      </p>
    </form>
  );
}

export default JoinClubForm;