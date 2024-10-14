'use client';

import { useDarkMode } from '../context/DarkModeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? <FaSun /> : <FaMoon />}
    </button>
  );
};

export default DarkModeToggle;
