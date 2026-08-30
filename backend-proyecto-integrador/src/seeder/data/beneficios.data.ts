import { TipoBeneficio } from '@prisma/client';

// Beneficios estatales reales relevantes para educación escolar y superior de
// pregrado (fuente: chileatiende.gob.cl/temas/becas-y-creditos). Se dejaron
// fuera becas de magíster, doctorado, postdoctorado y programas de
// capacitación laboral por no aplicar a este contexto.
export const beneficiosData = [
  {
    nombre: 'Beca Aysén',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Beca Bicentenario',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Beca TIC',
    proveedor: 'JUNAEB',
    tipo: TipoBeneficio.MANUTENCION,
  },
  {
    nombre: 'Beca BAES',
    proveedor: 'JUNAEB',
    tipo: TipoBeneficio.MANUTENCION,
  },
  {
    nombre: 'Beca Articulación',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Beca Integración Territorial',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Beca Mantención Educación Superior',
    proveedor: 'JUNAEB',
    tipo: TipoBeneficio.MANUTENCION,
  },
  {
    nombre: 'Beca Distinción Trayectorias Educativas',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Beca Excelencia Académica',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Beca Excelencia Técnica',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Beca Indígena',
    proveedor: 'JUNAEB',
    tipo: TipoBeneficio.MANUTENCION,
  },
  {
    nombre: 'Beca Juan Gómez Millas',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Beca Magallanes y Antártica',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Beca Nuevo Milenio',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Beca Discapacidad Educación Superior',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.MANUTENCION,
  },
  {
    nombre: 'Beca Hijos de Profesionales de la Educación',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Beca Patagonia Aysén',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Beca Polimetales',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.MANUTENCION,
  },
  {
    nombre: 'Beca Práctica Técnico Profesional',
    proveedor: 'JUNAEB',
    tipo: TipoBeneficio.MANUTENCION,
  },
  {
    nombre: 'Beca Presidente de la República',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Beca PAES',
    proveedor: 'JUNAEB',
    tipo: TipoBeneficio.MANUTENCION,
  },
  {
    nombre: 'Beca Residencia Indígena',
    proveedor: 'JUNAEB',
    tipo: TipoBeneficio.MANUTENCION,
  },
  {
    nombre: 'Beca Vocación de Profesor',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Crédito con Aval del Estado',
    proveedor: 'Comisión Ingresa',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Fondo Solidario de Crédito Universitario',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
  {
    nombre: 'Gratuidad',
    proveedor: 'Ministerio de Educación',
    tipo: TipoBeneficio.ARANCEL,
  },
];
