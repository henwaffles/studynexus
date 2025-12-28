const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
};

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload an image to Cloudinary
 * @param {string} fileBuffer - Base64 encoded image data or file buffer
 * @param {string} folder - Folder name in Cloudinary (default: 'studynexus')
 * @returns {Promise<object>} - Upload result with URL and public_id
 */
const uploadImage = async (fileBuffer, folder = 'studynexus') => {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
      );
    }

    const result = await cloudinary.uploader.upload(fileBuffer, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Max dimensions
        { quality: 'auto:good' }, // Automatic quality optimization
        { fetch_format: 'auto' } // Automatic format selection (WebP when supported)
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public_id of the image to delete
 * @returns {Promise<object>} - Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
      );
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary image URL
 * @returns {string|null} - Public ID or null if invalid URL
 */
const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  try {
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    const afterUpload = parts[1];
    // Remove version number if present (v1234567890/)
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    // Remove file extension
    const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  extractPublicId,
  isCloudinaryConfigured,
  cloudinary
};
