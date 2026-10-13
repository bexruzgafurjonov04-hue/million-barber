import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'portfolio';
    if (req.baseUrl.includes('barber') || req.path.includes('avatar')) {
      subfolder = 'barbers';
    } else if (req.baseUrl.includes('shop') || req.path.includes('shop')) {
      subfolder = 'shop';
    }

    const uploadPath = path.join(process.cwd(), 'uploads', subfolder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate safe, unguessable filename
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, `${Date.now()}-${randomBytes}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});
