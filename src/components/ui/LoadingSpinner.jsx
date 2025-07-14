import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className={`${sizeClasses[size]} mx-auto mb-4 text-blue-600 dark:text-blue-400`}
        >
          <Brain className="w-full h-full" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 dark:text-gray-300 font-medium"
        >
          {text}
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingSpinner;