import { Injectable, Inject } from '@nestjs/common';
import {
  v2 as CloudinaryType,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import { StorageService } from '../storage.service';
import { UploadResult } from '../storage.types';

type CloudinaryInstance = typeof CloudinaryType & {
  folders: {
    files: string;
    images: string;
  };
};

@Injectable()
export class CloudinaryAdapter extends StorageService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinary: CloudinaryInstance,
  ) {
    super();
  }

  uploadImage(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadResult> {
    const targetFolder = folder
      ? `${this.cloudinary.folders.images}/${folder}`
      : this.cloudinary.folders.images;
    return new Promise((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: targetFolder },
        (
          error: UploadApiErrorResponse | undefined,
          result?: UploadApiResponse,
        ) => {
          if (error) return reject(new Error(error.message));
          if (!result)
            return reject(new Error('Cloudinary no devolvió un resultado'));
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(file.buffer);
    });
  }

  uploadPDF(file: Express.Multer.File, folder?: string): Promise<UploadResult> {
    const targetFolder = folder
      ? `${this.cloudinary.folders.files}/${folder}`
      : this.cloudinary.folders.files;
    return new Promise((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: targetFolder },
        (
          error: UploadApiErrorResponse | undefined,
          result?: UploadApiResponse,
        ) => {
          if (error) return reject(new Error(error.message));
          if (!result)
            return reject(new Error('Cloudinary no devolvió un resultado'));
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(file.buffer);
    });
  }

  delete(publicId: string): Promise<void> {
    return this.cloudinary.uploader.destroy(publicId).then(() => undefined);
  }
}
