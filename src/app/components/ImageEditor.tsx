'use client';

import { useRef, useCallback } from 'react';
import Cropper from 'react-cropper'; 
import 'cropperjs/dist/cropper.css';
import { motion } from 'framer-motion';
import { FaTimes, FaCheck } from 'react-icons/fa';
import clsx from 'clsx';
import CropperType from 'cropperjs'; 

interface ReactCropperElement extends HTMLImageElement {
  cropper: CropperType;
}

interface ImageEditorProps {
  imageSrc: string;
  onSave: (croppedImage: string) => void;
  onCancel: () => void;
}

const ImageEditor = ({ imageSrc, onSave, onCancel }: ImageEditorProps) => {
  const cropperRef = useRef<ReactCropperElement>(null);

  const handleSave = useCallback(() => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      if (!croppedCanvas) {
        alert('Failed to crop the image.');
        return;
      }
      croppedCanvas.toBlob(
        (blob: Blob | null) => { 
          if (blob) {
            const croppedImageUrl = URL.createObjectURL(blob);
            onSave(croppedImageUrl);
          } else {
            alert('Failed to crop the image.');
          }
        },
        'image/jpeg',
        1
      );
    }
  }, [onSave]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        className="bg-gray-800 dark:bg-gray-900 rounded-lg overflow-hidden shadow-xl w-11/12 md:w-3/4 lg:w-1/2 relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-100 focus:outline-none"
          aria-label="Close Editor"
        >
          <FaTimes size={24} />
        </button>

        <div className="relative w-full h-80 md:h-96 bg-gray-700">
          <Cropper
            src={imageSrc}
            style={{ height: '100%', width: '100%' }}
            initialAspectRatio={undefined} 
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
            zoomable={false} 
          />
        </div>

        <div className="flex flex-col items-center mt-4 space-y-4 px-6">
          <div className="flex space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-500 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none flex items-center transition-colors"
            >
              <FaCheck className="mr-2" /> Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageEditor;
