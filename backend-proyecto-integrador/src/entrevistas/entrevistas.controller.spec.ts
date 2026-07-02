import { Reflector } from '@nestjs/core';
import { ForbiddenException, Type } from '@nestjs/common';
import { UserRol } from '@prisma/client';
import { EntrevistasController } from './entrevistas.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';

// Construye un ExecutionContext mínimo para probar el RolesGuard
function mockContext(
  handler: (...args: unknown[]) => unknown,
  classRef: Type<unknown>,
  userRol: UserRol,
) {
  return {
    getHandler: () => handler,
    getClass: () => classRef,
    switchToHttp: () => ({
      getRequest: () => ({ user: { rol: userRol } }),
    }),
  } as any;
}

describe('EntrevistasController — permisos de rol', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('Un TUTOR NO puede eliminar una entrevista', () => {
    // Arrange
    const ctx = mockContext(
      EntrevistasController.prototype.delete,
      EntrevistasController,
      UserRol.TUTOR,
    );

    // Act & Assert
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('Un ADMIN puede eliminar una entrevista', () => {
    // Arrange
    const ctx = mockContext(
      EntrevistasController.prototype.delete,
      EntrevistasController,
      UserRol.ADMIN,
    );

    // Act & Assert
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('El endpoint DELETE tiene @Roles solo para ADMIN', () => {
    // Comprueba el metadata directamente en el handler
    const roles: UserRol[] = Reflect.getMetadata(
      ROLES_KEY,
      EntrevistasController.prototype.delete,
    );
    expect(roles).toEqual([UserRol.ADMIN]);
  });

  it('Un TUTOR puede crear una entrevista', () => {
    // Arrange
    const ctx = mockContext(
      EntrevistasController.prototype.create,
      EntrevistasController,
      UserRol.TUTOR,
    );

    // Act & Assert
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('Un TUTOR puede listar entrevistas', () => {
    // Arrange
    const ctx = mockContext(
      EntrevistasController.prototype.findAll,
      EntrevistasController,
      UserRol.TUTOR,
    );

    // Act & Assert
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
