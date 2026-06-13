import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from '../config/cloudinary.config'; 
import { StorageService } from './storage.service';
import { CloudinaryAdapter } from './adapters/cloudinary.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    CloudinaryProvider,                                     
    { provide: StorageService, useClass: CloudinaryAdapter },
  ],
  exports: [StorageService],
})
export class StorageModule {}