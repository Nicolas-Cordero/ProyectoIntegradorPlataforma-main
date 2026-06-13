import { Injectable } from '@nestjs/common';
import { UploadResult } from './storage.types';

@Injectable()
export class StorageService {

  uploadImage(file: Express.Multer.File, folder?: string): Promise<UploadResult>{
    return new Promise((resolve, reject) => {
      resolve({url: "", publicId: ""});
      reject(new Error("algo salio mal."));
    })
  }

  uploadPDF(file: Express.Multer.File, folder?: string): Promise<UploadResult>{
    return new Promise((resolve, reject) => {
      resolve({url: "", publicId: ""});
      reject(new Error("algo salio mal."));
    })
  }

  delete(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      resolve();
      reject(new Error("algo salio mal."));
    });
  }
}
