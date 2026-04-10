import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { UserSeeder } from './seeds/user.seeder';

@Module({
  imports: [UsersModule],
  providers: [UserSeeder],
  exports: [UserSeeder],
})
export class SeederModule {}
