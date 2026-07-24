import multer from 'multer';
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

// ─── Use memory storage — no disk writes ──────────────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Upload a buffer to Cloudinary via a readable stream
 */
export const uploadToCloudinary = (buffer, folder = 'movie-review') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
};

/**
 * Middleware: upload file and attach result to req.cloudinary
 */
export const handleUpload = (fieldName) => async (req, res, next) => {
  if (!req.file) return next();
  try {
    const result = await uploadToCloudinary(req.file.buffer);
    req.cloudinary = { url: result.secure_url, public_id: result.public_id };
    next();
  } catch (err) {
    next(err);
  }
};
