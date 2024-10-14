'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { FaTrash, FaGripVertical, FaEdit } from 'react-icons/fa'; 
import clsx from 'clsx';
import ImageEditor from './ImageEditor';

interface SortableImageProps {
  id: string;
  src: string;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, newSrc: string) => void;
}

const SortableImage = React.memo(function SortableImage({
  id,
  src,
  index,
  onRemove,
  onUpdate,
}: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleSave = (newSrc: string) => {
    onUpdate(id, newSrc); 
  };

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        className={clsx(
          'relative group bg-gray-800 dark:bg-gray-700 rounded-md overflow-hidden',
          isDragging ? 'shadow-2xl cursor-grabbing' : 'cursor-pointer'
        )}
        {...attributes} 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        layout
        initial={{ opacity: 1 }}
        animate={{ opacity: isDragging ? 0.8 : 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsEditing(true)} 
      >
        <div
          className="absolute top-2 left-2 text-gray-400 dark:text-gray-300 cursor-grab z-10 touch-none"
          {...listeners} 
        >
          <FaGripVertical />
        </div>

        <div className="absolute top-2 right-2 bg-blue-600 dark:bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
          {index + 1}
        </div>

        <img
          src={src}
          alt={`upload-${index}`}
          className="w-full h-32 object-cover"
          loading="lazy"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true); 
          }}
          className="absolute bottom-2 left-2 bg-blue-600 dark:bg-blue-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Edit Image"
        >
          <FaEdit className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id); 
          }}
          className="absolute bottom-2 right-2 bg-red-600 dark:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove Image"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </motion.div>

      {isEditing && (
        <ImageEditor
          imageSrc={src}
          onUpdate={handleSave} 
          onCancel={() => setIsEditing(false)}
        />
      )}
    </>
  );
});

export default SortableImage;
