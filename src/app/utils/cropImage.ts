import { Area } from 'react-easy-crop';

export default function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  orientation: 'portrait' | 'landscape'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      if (orientation === 'portrait') {
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
      } else {
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
      }

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          const fileUrl = URL.createObjectURL(blob);
          resolve(fileUrl);
        },
        'image/jpeg',
        1
      );
    };
    image.onerror = () => {
      reject(new Error('Image load error'));
    };
  });
}
