import { motion } from "framer-motion";

const LoadingSpinner = ({ size = "md", message = "Loading..." }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizeClasses[size]} border-4 border-purple-200 dark:border-purple-800 border-t-purple-500 rounded-full`}
      />
      <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm">{message}</p>
    </div>
  );
};

export default LoadingSpinner;