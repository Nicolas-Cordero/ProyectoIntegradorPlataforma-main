import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import type { AuthenticatedUser } from '../interfaces/auth.interfaces';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
