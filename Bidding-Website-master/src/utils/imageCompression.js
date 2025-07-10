/**
 * Image compression utility for reducing file sizes before upload
 * Helps prevent Vercel serverless function payload size limits (4.5MB)
 */

/**
 * Compress an image file to reduce its size
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    maxSizeKB = 500, // Target max size in KB
    format = 'image/jpeg' // Default to JPEG for better compression
  } = options;

  return new Promise((resolve, reject) => {
    // Create canvas and context
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Check if compression was successful
            const compressedSizeKB = blob.size / 1024;
            console.log(`Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${compressedSizeKB.toFixed(1)}KB`);

            // Create new File object with compressed data
            const compressedFile = new File([blob], file.name, {
              type: format,
              lastModified: Date.now()
            });

            resolve(compressedFile);
          },
          format,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
const calculateDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  let width = originalWidth;
  let height = originalHeight;

  // Calculate scaling factor
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const ratio = Math.min(widthRatio, heightRatio, 1); // Don't upscale

  width = Math.round(originalWidth * ratio);
  height = Math.round(originalHeight * ratio);

  return { width, height };
};

/**
 * Compress multiple images
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options
 * @returns {Promise<File[]>} - Array of compressed files
 */
export const compressImages = async (files, options = {}) => {
  const compressionPromises = files.map(file => {
    // Only compress image files
    if (!file.type.startsWith('image/')) {
      return Promise.resolve(file);
    }

    // Skip compression for small files (under 100KB)
    if (file.size < 100 * 1024) {
      return Promise.resolve(file);
    }

    return compressImage(file, options);
  });

  try {
    const compressedFiles = await Promise.all(compressionPromises);
    return compressedFiles;
  } catch (error) {
    console.error('Error compressing images:', error);
    throw new Error('Failed to compress one or more images');
  }
};

/**
 * Validate file size and type before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  } = options;

  const errors = [];

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    errors.push(`File size ${fileSizeMB.toFixed(1)}MB exceeds maximum allowed size of ${maxSizeMB}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileSize: fileSizeMB,
    fileType: file.type
  };
};

/**
 * Get optimal compression settings based on file size
 * @param {number} fileSizeKB - File size in KB
 * @returns {Object} - Compression settings
 */
export const getCompressionSettings = (fileSizeKB) => {
  if (fileSizeKB > 2000) { // > 2MB
    return {
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.7,
      format: 'image/jpeg'
    };
  } else if (fileSizeKB > 1000) { // > 1MB
    return {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      format: 'image/jpeg'
    };
  } else if (fileSizeKB > 500) { // > 500KB
    return {
      maxWidth: 1400,
      maxHeight: 1400,
      quality: 0.85,
      format: 'image/jpeg'
    };
  } else {
    // Small files, minimal compression
    return {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.9,
      format: 'image/jpeg'
    };
  }
};

/**
 * Smart image compression that adapts based on file size
 * @param {File} file - Image file to compress
 * @returns {Promise<File>} - Optimally compressed file
 */
export const smartCompressImage = async (file) => {
  const fileSizeKB = file.size / 1024;
  const settings = getCompressionSettings(fileSizeKB);
  
  console.log(`Compressing ${file.name} (${fileSizeKB.toFixed(1)}KB) with settings:`, settings);
  
  return compressImage(file, settings);
};
