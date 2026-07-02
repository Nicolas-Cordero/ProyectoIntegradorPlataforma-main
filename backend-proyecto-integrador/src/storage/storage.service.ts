import { Injectable } from '@nestjs/common';
import { UploadResult } from './storage.types';

@Injectable()
export abstract class StorageService {
  abstract uploadImage(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadResult>;
  abstract uploadPDF(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadResult>;
  abstract delete(publicId: string): Promise<void>;
}
