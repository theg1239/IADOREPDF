'use client';

import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import Head from 'next/head';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  AiOutlineCloudUpload,
  AiOutlineLoading3Quarters,
  AiOutlineEdit,
} from 'react-icons/ai';
import SortableImage from './components/SortableImage';
import clsx from 'clsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import imageCompression from 'browser-image-compression';
import { useDarkMode } from './context/DarkModeContext';
import RenamePDFModal from './components/RenamePDFModal';

interface ImageType {
  id: string;
  src: string;
}

export default function Home() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState<boolean>(false);
  const [pdfName, setPdfName] = useState<string>('converted-images.pdf');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUniqueId = () => `${Date.now()}-${Math.random()}`;

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: 0,
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
    const newImages: ImageType[] = imageUrls.map((url) => ({
      id: generateUniqueId(),
      src: url,
    }));
    setImages((prevImages) => [...prevImages, ...newImages]);
    e.target.value = '';
  };

  const handleRemoveImage = (id: string) => {
    const image = images.find((img) => img.id === id);
    if (image) {
      URL.revokeObjectURL(image.src);
      setImages((prevImages) => prevImages.filter((img) => img.id !== id));
    }
  };

  const handleUpdateImage = (id: string, newSrc: string) => {
    setImages((prevImages) =>
      prevImages.map((img) => {
        if (img.id === id) {
          URL.revokeObjectURL(img.src);
          return { ...img, src: newSrc };
        }
        return img;
      })
    );
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      setImages((images) => arrayMove(images, oldIndex, newIndex));
    }
  };

  const createPDF = async () => {
    try {
      setIsGenerating(true);
      const pdf = new jsPDF('portrait', 'pt', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const loadImage = (src: string) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const imgElement = new Image();
          imgElement.src = src;
          imgElement.onload = () => resolve(imgElement);
          imgElement.onerror = () => reject(new Error('Image load error'));
        });
      };

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        try {
          const imgElement = await loadImage(img.src);

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

          pdf.addImage(imgElement, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        } catch (error) {
          console.error(`Error loading image ${i}:`, error);
          toast.error(`Failed to load image ${i + 1}. Skipping this image.`);
        }
      }

      pdf.save(pdfName);
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
    const newImages: ImageType[] = imageUrls.map((url) => ({
      id: generateUniqueId(),
      src: url,
    }));
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const openRenameModal = () => {
    setIsRenameModalOpen(true);
  };

  const closeRenameModal = () => {
    setIsRenameModalOpen(false);
  };

  const handleRename = (newName: string) => {
    setPdfName(newName.endsWith('.pdf') ? newName : `${newName}.pdf`);
    closeRenameModal();
    toast.success(`PDF renamed to "${newName}"`);
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const imageUrl = URL.createObjectURL(file);
            const newImage: ImageType = { id: generateUniqueId(), src: imageUrl };
            setImages((prevImages) => [...prevImages, newImage]);
          }
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
      images.forEach((img) => {
        URL.revokeObjectURL(img.src);
      });
    };
  }, []);

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <title>Convert Images to PDF Online - Free & Fast | IMG2PDF.in</title>
        <meta
          name="description"
          content="Convert your images to PDF quickly and securely with img2pdf.in. No registration required."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="img2pdf.in" />
        <meta
          name="keywords"
          content="Image to PDF, Convert Image to PDF, JPG to PDF, PNG to PDF, Free Image to PDF Converter, Online Image to PDF Converter"
        />
        <link rel="canonical" href="https://img2pdf.in" />
        <meta
          property="og:site_name"
          content="img2pdf.in - Free Online Image to PDF Converter"
        />
        <meta
          property="og:title"
          content="Convert Images to PDF Online - Free & Secure | img2pdf.in"
        />
        <meta
          property="og:description"
          content="Convert your images to PDF quickly and securely with img2pdf.in. Supports JPG, PNG, and more. No registration required."
        />
        <meta property="og:image" content="/images/og-image.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://img2pdf.in" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@img2pdf" />
        <meta name="twitter:creator" content="@img2pdf" />
        <meta
          name="twitter:title"
          content="Convert Images to PDF Online - Free & Secure | img2pdf.in"
        />
        <meta
          name="twitter:description"
          content="Convert your images to PDF quickly and securely with img2pdf.in. Supports JPG, PNG, and more. No registration required."
        />
        <meta name="twitter:image" content="/images/og-image.png" />
        <meta name="robots" content="index, follow" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: 'https://img2pdf.in',
            name: 'img2pdf.in',
            description: 'A free tool to convert images to PDFs.',
            publisher: {
              '@type': 'Organization',
              name: 'img2pdf.in',
            },
          })}
        </script>
      </Head>

      <div
        className={clsx(
          'bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 py-8 relative transition-colors duration-300'
        )}
      >
        <div
          className={clsx(
            'absolute inset-0 bg-black bg-opacity-50 opacity-0 pointer-events-none transition-opacity duration-300',
            isDraggingOver && 'opacity-100'
          )}
        ></div>

        <div className="w-full max-w-4xl bg-gray-100 dark:bg-gray-800 shadow-lg rounded-lg p-8 relative transition-colors duration-300">
          <h1 className="text-3xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">
            Images to PDF
          </h1>

          <div
            onClick={handleZoneClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className="border-2 border-dashed border-blue-500 rounded-md p-6 mb-6 flex flex-col items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer relative"
          >
            <AiOutlineCloudUpload className="text-4xl text-blue-500 dark:text-blue-400 mb-4" />
            <p className="text-gray-700 dark:text-gray-300 text-center">
              Drag and drop images here, or click to browse. You can also paste images from the clipboard.
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
                <SortableContext
                  items={images.map((img) => img.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                      <SortableImage
                        key={img.id}
                        id={img.id}
                        src={img.src}
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

          <div className="flex items-center space-x-4 w-full">
            <button
              onClick={openRenameModal}
              className="flex items-center justify-center px-6 py-4 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors focus:outline-none"
              aria-label="Rename PDF"
            >
              <AiOutlineEdit className="w-6 h-6" />
            </button>

            <button
              onClick={createPDF}
              disabled={images.length === 0 || isGenerating}
              className={clsx(
                'flex flex-grow items-center justify-center px-6 py-4 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors',
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
        </div>

        <RenamePDFModal
          isOpen={isRenameModalOpen}
          onClose={closeRenameModal}
          onRename={handleRename}
          currentName={pdfName}
        />

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
          theme={isDarkMode ? 'dark' : 'light'}
        />
      </div>
    </>
  );
}
