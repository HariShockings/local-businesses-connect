import multer from 'multer';

// Configure Multer to store files in memory (we'll upload directly to Cloudinary)
const storage = multer.memoryStorage();

// File filter to allow only PNG images
const fileFilter = (req, file, cb) => {
  console.log('Multer processing file:', file.originalname, file.mimetype); // Debug log
  if (file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only PNG files are allowed'), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

export default upload;