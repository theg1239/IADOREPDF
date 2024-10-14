'use client';

import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AiOutlineCloudUpload, AiOutlineLoading3Quarters } from 'react-icons/ai';
import SortableImage from './components/SortableImage';
import clsx from 'clsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import imageCompression from 'browser-image-compression';
import { useDarkMode } from './context/DarkModeContext';

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, 
      },
    })
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        try {
          return await imageCompression(file, options);
        } catch (error) {
          console.error('Error compressing image:', error);
          return file; 
        }
      })
    );

    const imageUrls = compressedFiles.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...imageUrls]);
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(images[index]); // Free up memory
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleUpdateImage = (index: number, newSrc: string) => {
    setImages((prevImages) =>
      prevImages.map((img, i) => (i === index ? newSrc : img))
    );
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img === active.id);
      const newIndex = images.findIndex((img) => img === over.id);
      setImages((images) => arrayMove(images, oldIndex, newIndex));
    }
  };

  const createPDF = async () => {
    try {
      setIsGenerating(true);
      const pdf = new jsPDF('portrait', 'pt', 'a4');

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgElement = new Image();
        imgElement.src = img;

        await new Promise<void>((resolve, reject) => {
          imgElement.onload = () => {
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = imgElement.width;
            const imgHeight = imgElement.height;

            let renderedWidth = pdfWidth;
            let renderedHeight = (imgHeight * pdfWidth) / imgWidth;

            if (renderedHeight > pdfHeight) {
              renderedHeight = pdfHeight;
              renderedWidth = (imgWidth * pdfHeight) / imgHeight;
            }

            if (i > 0) {
              pdf.addPage();
            }
            pdf.addImage(
              imgElement,
              'JPEG',
              (pdfWidth - renderedWidth) / 2,
              (pdfHeight - renderedHeight) / 2,
              renderedWidth,
              renderedHeight
            );
            resolve();
          };
          imgElement.onerror = () => {
            reject(new Error('Image load error'));
          };
        });
      }

      pdf.save('converted-images.pdf');
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    if (files.length === 0) return;
    handleCompressedFiles(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  const { isDarkMode } = useDarkMode();

  const handleCompressedFiles = async (files: File[]) => {
    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        try {
          return await imageCompression(file, options);
        } catch (error) {
          console.error('Error compressing image:', error);
          return file; 
        }
      })
    );

    const imageUrls = compressedFiles.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...imageUrls]);
  };

  return (
    <div
      className="bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 py-8 relative transition-colors duration-300"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div
        className={clsx(
          'absolute inset-0 bg-black bg-opacity-50 opacity-0 pointer-events-none transition-opacity duration-300',
          isDraggingOver && 'opacity-100'
        )}
      ></div>

      <div className="w-full max-w-4xl bg-gray-100 dark:bg-gray-800 shadow-lg rounded-lg p-8 relative transition-colors duration-300">
        <h1 className="text-3xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">
          Image to PDF
        </h1>

        <div
          onClick={handleZoneClick}
          className="border-2 border-dashed border-blue-500 rounded-md p-6 mb-6 flex flex-col items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer relative"
        >
          <AiOutlineCloudUpload className="text-4xl text-blue-500 dark:text-blue-400 mb-4" />
          <p className="text-gray-700 dark:text-gray-300 text-center">
            Drag and drop images anywhere on the page, or click anywhere to{' '}
            <span className="text-blue-500 dark:text-blue-400 underline">browse</span>
          </p>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {images.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">
              Uploaded Images
            </h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={images} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <SortableImage
                      key={img}
                      id={img}
                      src={img}
                      index={index}
                      onRemove={handleRemoveImage}
                      onUpdate={handleUpdateImage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        <button
          onClick={createPDF}
          disabled={images.length === 0 || isGenerating}
          className={clsx(
            'w-full flex items-center justify-center px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors',
            {
              'opacity-50 cursor-not-allowed': images.length === 0 || isGenerating,
            }
          )}
        >
          {isGenerating ? (
            <>
              <AiOutlineLoading3Quarters className="animate-spin mr-2" />
              Generating PDF...
            </>
          ) : (
            'Convert to PDF'
          )}
        </button>
      </div>
      <ToastContainer
       position="bottom-right" 
       autoClose={3000} 
       hideProgressBar
       newestOnTop
       closeOnClick
       rtl={false}
       pauseOnFocusLoss
       draggable
       pauseOnHover
       theme={isDarkMode ? "dark" : "light"}  
       />
    </div>
  );
}
