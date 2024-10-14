'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import clsx from 'clsx';
import { useDarkMode } from '../context/DarkModeContext'; 

interface RenamePDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName: string;
}

const RenamePDFModal = ({ isOpen, onClose, onRename, currentName }: RenamePDFModalProps) => {
  const { isDarkMode } = useDarkMode();
  const [newName, setNewName] = useState<string>(currentName.replace('.pdf', ''));

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName.replace('.pdf', ''));
    }
  }, [currentName, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() === '') {
      alert('PDF name cannot be empty.');
      return;
    }
    onRename(newName.trim());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={clsx(
              'bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 md:w-1/3 relative',
              'flex flex-col'
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()} 
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 focus:outline-none"
              aria-label="Close Rename Modal"
            >
              <FaTimes size={18} />
            </button>

            {/* Modal Content */}
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Rename PDF
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <label htmlFor="pdf-name" className="text-gray-700 dark:text-gray-300">
                Enter a custom name for your PDF:
              </label>
              <input
                type="text"
                id="pdf-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                placeholder="My Custom PDF"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-gray-200 dark:text-gray-300 rounded-md hover:bg-gray-500 dark:hover:bg-gray-600 focus:outline-none transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RenamePDFModal;
