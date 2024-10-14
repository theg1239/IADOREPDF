import Cropper from 'cropperjs';

export default function getCroppedImg(
    imageSrc: string,
    cropper: Cropper 
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const croppedCanvas = cropper.getCroppedCanvas();
      if (!croppedCanvas) {
        reject(new Error('Failed to get cropped canvas.'));
        return;
      }
  
      croppedCanvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty.'));
            return;
          }
          const fileUrl = URL.createObjectURL(blob);
          resolve(fileUrl);
        },
        'image/jpeg',
        1
      );
    });
  }
  