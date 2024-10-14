import React, { useRef, useCallback } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheck } from 'react-icons/fa';
import clsx from 'clsx';

interface ImageEditorProps {
  imageSrc: string;
  onUpdate: (newSrc: string) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onUpdate, onCancel }) => {
  const cropperRef = useRef<ReactCropperElement>(null); // Correct ref type for cropper

  const handleSave = useCallback(() => {
    const cropper = cropperRef.current?.cropper; // Access the cropper instance properly
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      if (croppedCanvas) {
        const newSrc = croppedCanvas.toDataURL('image/jpeg'); // Generate new blob URL for the edited image
        onUpdate(newSrc); // Pass newSrc correctly
      }
    }
  }, [onUpdate]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className={clsx(
            'bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl w-11/12 md:w-3/4 lg:w-1/2 relative',
            'flex flex-col'
          )}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Edit Image
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 focus:outline-none"
              aria-label="Close Editor"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="relative w-full h-80 md:h-96 bg-gray-700 dark:bg-gray-800">
            <Cropper
              src={imageSrc}
              style={{ height: '100%', width: '100%' }}
              guides={true}
              viewMode={1}
              background={false}
              responsive={true}
              autoCropArea={1}
              checkOrientation={false}
              ref={cropperRef}
              movable={true}
              rotatable={false}
              scalable={true}
              zoomable={true}
              cropBoxResizable={true}
              cropBoxMovable={true}
              toggleDragModeOnDblclick={false}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 space-y-4 md:space-y-0">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none transition-colors"
            >
              <FaCheck className="mr-2" /> Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageEditor;
