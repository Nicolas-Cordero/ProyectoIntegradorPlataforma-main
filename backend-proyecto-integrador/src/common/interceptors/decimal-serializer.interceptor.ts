import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Prisma } from '@prisma/client';

/**
 * Prisma mapea las columnas `Decimal` a objetos decimal.js, cuyo `toJSON()`
 * devuelve un *string*. El frontend recibe entonces "150000" en un campo que
 * sus tipos declaran como `number`, y el error es silencioso:
 * `String.prototype.toLocaleString(opts)` ignora las opciones de formato, y
 * `.toFixed()` no existe en `String` y lanza un TypeError.
 *
 * Este interceptor convierte los `Decimal` a `number` justo antes de
 * serializar, de modo que el contrato HTTP coincida con los tipos que el
 * frontend ya declara. Afecta a las columnas `Decimal` del schema:
 * `ramo.nota_final` y `estudiante.promedios_media`.
 *
 * Es seguro en este dominio: los montos son enteros en CLP y las notas tienen
 * un decimal, ambos representables exactamente en un `number`. Si alguna vez
 * se guardan valores que excedan la precisión de un double, hay que volver a
 * exponerlos como string y parsearlos en el cliente.
 */
function normalizarDecimales(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;

  if (Prisma.Decimal.isDecimal(value)) return value.toNumber();

  // Respuestas que no son JSON plano: los PDF de pdf-generator viajan como
  // StreamableFile y recorrerlos los destruiría.
  if (
    value instanceof Date ||
    value instanceof StreamableFile ||
    Buffer.isBuffer(value)
  ) {
    return value;
  }

  if (Array.isArray(value)) return value.map(normalizarDecimales);

  // Solo objetos planos (las filas de Prisma lo son). Cualquier otra instancia
  // de clase se deja intacta en lugar de reconstruirla perdiendo su prototipo.
  const proto: unknown = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return value;

  const salida: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(value)) {
    salida[clave] = normalizarDecimales(valor);
  }
  return salida;
}

@Injectable()
export class DecimalSerializerInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(map(normalizarDecimales));
  }
}
