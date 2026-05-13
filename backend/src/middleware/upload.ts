import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store files in memory before uploading to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
});

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('⚠️ Cloudinary not configured. Using placeholder URL.');
      // Return a placeholder URL when Cloudinary is not configured
      const timestamp = Date.now();
      const hash = Math.random().toString(36).substring(2, 15);
      const placeholderUrl = `https://via.placeholder.com/600x600?text=image+${timestamp}`;
      resolve({ url: placeholderUrl, publicId: `local_${hash}` });
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', timeout: 60000 },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(new Error(`Upload failed: ${error.message || 'Unknown error'}`));
        } else if (!result) {
          reject(new Error('Upload failed: No result returned from Cloudinary.'));
        } else {
          console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      }
    );

    uploadStream.on('error', (error) => {
      console.error('❌ Upload stream error:', error);
      reject(new Error(`Stream error: ${error.message}`));
    });

    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
