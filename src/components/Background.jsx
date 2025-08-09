import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ParticleBackground from "./particles/ParticaleBackground"; // Import the ParticleBackground component

const Background = () => {
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    // No bubble-related code needed
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <ParticleBackground /> {/* Add the ParticleBackground component */}
      {/* Score Display */}
      {showScore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          className="fixed top-20 right-4 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full shadow-lg">
            <span className="text-lg font-bold">Score: {score}</span>
          </div>
        </motion.div>
      )}
      {/* Game Instructions */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="fixed bottom-4 left-4 z-50 pointer-events-none"
      >
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
            🎮 Particle Background Game
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Click the particles to interact and earn points! Score: {score}
          </p>
        </div>
      </motion.div>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-teal-500/5 dark:from-purple-400/10 dark:via-blue-400/10 dark:to-teal-400/10 pointer-events-none" />
    </div>
  );
};

export default Background;