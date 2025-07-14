import { useTheme } from '../../contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
    </motion.button>
  );
}

export default ThemeToggle;