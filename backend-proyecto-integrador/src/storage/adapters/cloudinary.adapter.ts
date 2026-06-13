import { Injectable, Inject } from '@nestjs/common';
import { StorageService } from '../storage.service';
import { UploadResult } from '../storage.types';

@Injectable()
export class CloudinaryAdapter extends StorageService {

  constructor(@Inject('CLOUDINARY') private readonly cloudinary: any) {
    super();
  }

  uploadImage(file: Express.Multer.File, folder?: string): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder },
        (error: Error | null, result: any) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(file.buffer);
    });
  }

  uploadPDF(file: Express.Multer.File, folder?: string): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const stream = this.cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder },
        (error: Error | null, result: any) => {
          if (error) return reject(error);
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
