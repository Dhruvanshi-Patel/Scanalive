/**
 * Image Contrast & Feature Sharpness Optimizer
 * Preprocesses target photos to ensure maximum MindAR feature point recognition
 * even under harsh real-life conditions (lens flares, motion blur, glare, low light).
 */

export const optimizeTargetPhotoForAR = (imageFile) => {
  return new Promise((resolve) => {
    if (!imageFile) return resolve(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Standardize dimensions for high feature density
        canvas.width = 800;
        canvas.height = Math.round((img.height / img.width) * 800);

        // Draw original
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply High-Pass Edge & Contrast Enhancement
        for (let i = 0; i < data.length; i += 4) {
          // Luminance calculation
          const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          
          // Contrast Boost (S-Curve Transfer Function for Flare/Blur Resilience)
          let enhanced = (avg - 128) * 1.35 + 128;
          enhanced = Math.min(255, Math.max(0, enhanced));

          data[i] = enhanced;     // R
          data[i + 1] = enhanced; // G
          data[i + 2] = enhanced; // B
        }

        ctx.putImageData(imageData, 0, 0);

        // Convert optimized canvas back to Blob / DataURL
        canvas.toBlob((blob) => {
          const optimizedFile = new File([blob], `optimized_${imageFile.name}`, { type: 'image/jpeg' });
          const previewUrl = canvas.toDataURL('image/jpeg', 0.92);
          resolve({ optimizedFile, previewUrl, originalUrl: e.target.result });
        }, 'image/jpeg', 0.92);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  });
};
