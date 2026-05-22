import { TipoBeneficio } from "@prisma/client";


//ejemplo
export const beneficiosData = [
  {
    nombre: 'Beca de Transporte',
    proveedor: 'Fundación Educativa',
    tipo: TipoBeneficio.MANUTENCION,
    descripcion: 'Beca para cubrir gastos de transporte público para estudiantes que viven lejos de la fundación.',
    monto: 50000,
  },
];  