import type { FieldType } from '../components/EditableField';

export interface FieldConfig {
  key: string;
  label: string;
  type?: FieldType;
  source?: 'root' | 'informacionAcademica' | 'institucion';
  nested?: string; // Para campos anidados como 'institucion.nombre'
  readOnly?: boolean;
  computed?: boolean; // Para campos calculados
  placeholder?: string;
  maxLength?: number;
  inputMode?: 'numeric' | 'text' | 'tel' | 'email';
  options?: Array<{ value: string; label: string }>;
  customRender?: string; // Identificador para renders especiales
}

export interface SectionConfig {
  id: string;
  titulo?: string;
  campos: FieldConfig[];
}

export const personalDataConfig: SectionConfig[] = [
  {
    id: 'datosPersonales',
    titulo: 'Datos Personales',
    campos: [
      {
        key: 'nombre',
        label: 'Nombre',
        type: 'text',
        source: 'root',
      },
      {
        key: 'rut',
        label: 'RUT',
        type: 'text',
        source: 'root',
        placeholder: '12345678-9',
      },
      {
        key: 'telefono',
        label: 'Teléfono',
        type: 'tel',
        source: 'root',
        placeholder: '+56912345678',
        inputMode: 'tel',
      },
      {
        key: 'generacion',
        label: 'Generación',
        type: 'text',
        source: 'root',
        placeholder: '2023',
        maxLength: 4,
      },
      {
        key: 'año_ingreso_beca',
        label: 'Año Ingreso Beca',
        type: 'text',
        source: 'informacionAcademica',
        placeholder: '2023',
        maxLength: 4,
        inputMode: 'numeric',
      },
      {
        key: 'fecha_de_nacimiento',
        label: 'Fecha de Nacimiento',
        type: 'date',
        source: 'root',
      },
      {
        key: 'edad',
        label: 'Edad',
        source: 'root',
        readOnly: true,
        computed: true,
      },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        source: 'root',
        options: [
          { value: 'masculino', label: 'Masculino' },
          { value: 'femenino', label: 'Femenino' },
          { value: 'otro', label: 'Otro' },
          { value: 'prefiero_no_decir', label: 'Prefiero no decir' },
        ],
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        source: 'root',
        placeholder: 'ejemplo@correo.com',
        inputMode: 'email',
      },
      {
        key: 'direccion',
        label: 'Dirección',
        type: 'text',
        source: 'root',
        placeholder: 'Dirección completa',
      },
    ],
  },
  {
    id: 'informacionLiceo',
    campos: [
      {
        key: 'colegio',
        label: 'Liceo',
        type: 'text',
        source: 'informacionAcademica',
        placeholder: 'Nombre del liceo',
      },
      {
        key: 'especialidad_colegio',
        label: 'Especialidad',
        type: 'text',
        source: 'informacionAcademica',
        placeholder: 'Especialidad del liceo',
      },
      {
        key: 'comuna_colegio',
        label: 'Comuna Liceo',
        type: 'text',
        source: 'informacionAcademica',
        placeholder: 'Comuna del liceo',
      },
      {
        key: 'promedio_1',
        label: 'Promedios Enseñanza Media',
        type: 'text',
        source: 'informacionAcademica',
        placeholder: 'Ej: 6.5 (usa punto)',
      },
      {
        key: 'puntajes_admision',
        label: 'PAES',
        type: 'text',
        source: 'informacionAcademica',
        placeholder: 'Matemáticas: 720, Lenguaje: 650',
      },
    ],
  },
  {
    id: 'informacionUniversidad',
    campos: [
      {
        key: 'carrera_especialidad',
        label: 'Carrera',
        type: 'text',
        source: 'institucion',
        placeholder: 'Nombre de la carrera',
      },
      {
        key: 'duracion',
        label: 'Duración Carrera',
        type: 'text',
        source: 'institucion',
        placeholder: 'Ej: 10 semestres, 5 años',
      },
      {
        key: 'institucion_nombre',
        label: 'Universidad',
        type: 'text',
        source: 'institucion',
        placeholder: 'Nombre de la universidad',
      },
      {
        key: 'via_acceso',
        label: 'Vía de acceso',
        type: 'text',
        source: 'informacionAcademica',
        placeholder: 'Ej: PAES, Admisión especial',
      },
      {
        key: 'trayectoria_academica',
        label: 'Trayectoria Académica',
        source: 'informacionAcademica',
        customRender: 'textarea',
      },
      {
        key: 'beneficios',
        label: 'Otros Beneficios',
        source: 'informacionAcademica',
        customRender: 'textarea',
      },
    ],
  },
  {
    id: 'statusObservaciones',
    campos: [
      {
        key: 'status_detalle',
        label: 'Status Detalle',
        source: 'root',
        customRender: 'textarea',
      },
      {
        key: 'observaciones',
        label: 'Observaciones',
        source: 'root',
        customRender: 'textarea',
      },
    ],
  },
];
