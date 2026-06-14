import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (config: ConfigService) => {
    const cloudName       = config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey          = config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret       = config.get<string>('CLOUDINARY_API_SECRET');
    const file_folder     = config.get<string>('CLOUDINARY_FILE_FOLDER');
    const image_folder    = config.get<string>('CLOUDINARY_IMAGE_FOLDER')


    if (!cloudName || !apiKey || !apiSecret || !file_folder || !image_folder) {
      throw new Error(
        'Faltan variables de entorno de Cloudinary: ' +
        'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_FILE_FOLDER, CLOUDINARY_IMAGE_FOLDER'
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key:    apiKey,
      api_secret: apiSecret,
    });

    return Object.assign(cloudinary, {
      folders: {
        files:  file_folder,
        images: image_folder,
      },
    });
  },
  inject: [ConfigService],
};