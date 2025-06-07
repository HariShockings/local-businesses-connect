import { v2 as cloudinary } from 'cloudinary';

// Function to configure Cloudinary
const configureCloudinary = () => {
  // Validate environment variables
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary environment variables missing:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? 'set' : 'unset',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'unset',
    });
    throw new Error('Cloudinary configuration failed: Missing environment variables');
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log('Cloudinary configured with cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);
};

export { configureCloudinary, cloudinary };