import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as { message?: string }).message || 'Error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
    );
    response.status(status).json(errorResponse);
  }
}

const PRISMA_MESSAGES: Record<string, { status: number; message: string }> = {
  P2002: {
    status: 409,
    message: 'Ya existe un registro con ese valor (restricción única)',
  },
  P2003: {
    status: 400,
    message: 'Referencia inválida: el registro relacionado no existe',
  },
  P2025: { status: 404, message: 'Registro no encontrado' },
  P2000: {
    status: 400,
    message: 'El valor proporcionado es demasiado largo para el campo',
  },
  P2011: {
    status: 400,
    message: 'Se recibió un valor nulo en un campo obligatorio',
  },
  P2012: { status: 400, message: 'Falta un campo obligatorio en la solicitud' },
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message?: string }).message || 'Error';
      const errorResponse = {
        statusCode: exception.getStatus(),
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message,
      };
      return response.status(exception.getStatus()).json(errorResponse);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = PRISMA_MESSAGES[exception.code];
      const status = mapped?.status ?? HttpStatus.CONFLICT;
      const message =
        mapped?.message ?? `Error de base de datos (${exception.code})`;
      this.logger.error(
        `${request.method} ${request.url} — Prisma ${exception.code}`,
        exception.message,
      );
      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message,
      });
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      this.logger.error(
        `${request.method} ${request.url} — Prisma validation`,
        exception.message,
      );
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message:
          'Datos de entrada inválidos: verifica que los campos numéricos contengan números y los campos requeridos estén completos',
      });
    }

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );
    // No exponer mensajes internos al cliente — solo en logs.
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: 'Error interno del servidor',
    });
  }
}
