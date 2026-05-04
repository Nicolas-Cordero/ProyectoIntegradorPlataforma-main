import { SetMetadata } from '@nestjs/common';
import { UserRol } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRol[]) => SetMetadata(ROLES_KEY, roles);
