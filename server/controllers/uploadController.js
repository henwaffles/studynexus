const { uploadImage, deleteImage, extractPublicId, isCloudinaryConfigured } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

const extensionForMime = (mimetype) => {
  switch (mimetype) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    default:
      return '';
  }
};

/**
 * Upload image to Cloudinary
 * POST /api/upload/image
 */
const uploadImageHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // If Cloudinary isn't configured, fall back to local disk storage (dev-friendly).
    if (!isCloudinaryConfigured()) {
      const uploadsDir = ensureUploadsDir();
      const extFromMime = extensionForMime(req.file.mimetype);
      const extFromName = path.extname(req.file.originalname || '');
      const ext = extFromName || extFromMime || '';
      const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, req.file.buffer);

      const url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
      return res.status(200).json({
        message: 'Image uploaded successfully',
        data: {
          url,
          storage: 'local'
        }
      });
    }

    // Convert buffer to base64 data URI
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await uploadImage(base64Image);

    res.status(200).json({
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
};

/**
 * Delete image from Cloudinary
 * DELETE /api/upload/image
 */
const deleteImageHandler = async (req, res) => {
  try {
    const { url, publicId } = req.body;

    if (!url && !publicId) {
      return res.status(400).json({ error: 'Image URL or public ID required' });
    }

    // Extract public ID from URL if not provided
    const imagePublicId = publicId || extractPublicId(url);

    if (!imagePublicId) {
      return res.status(400).json({ error: 'Invalid image URL or public ID' });
    }

    // Delete from Cloudinary
    const result = await deleteImage(imagePublicId);

    res.status(200).json({
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete image' });
  }
};

module.exports = {
  uploadImageHandler,
  deleteImageHandler
};
