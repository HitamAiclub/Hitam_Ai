import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome } from "react-icons/fi";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="container max-w-lg text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
            404
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            Page Not Found
          </h2>
          
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
            The page you"re looking for doesn"t exist or has been moved.
          </p>
          
          <Link to="/" className="btn-primary inline-flex items-center">
            <FiHome className="mr-2" />
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default NotFoundPage;