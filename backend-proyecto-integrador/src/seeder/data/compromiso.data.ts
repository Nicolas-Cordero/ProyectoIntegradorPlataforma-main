import { DocumentoCompromiso, Topico } from '../../acuerdo/interfaces';


const topicos: Topico[] = [
  {
    nombre: "Compromisos académicos",
    puntos: [
      'Mantenerse como alumna/o regular de su establecimiento de educación superior.',
      'Presentar una alta asistencia a clases.',
      'Participar de las instancias de apoyo académico, psicopedagógico y psicológico que ofrece el Establecimiento de Educación Superior en el que está matriculada/o, en el caso de que sea requerido.',
      'Comunicar con anticipación a la Fundación en caso de que exista voluntad de suspensión de estudios, cambio de carrera o de abandono de la carrera.'
    ]
  },
  {
    nombre: 'Compromisos de comunicación',
    puntos: [
      'Responder oportunamente (en un plazo de 48 horas) a las comunicaciones que establece la Fundación en sus distintas modalidades: telefónica, whatsapp (personal y grupal) y correo electrónico.',
      'Asistir a las entrevistas individuales convocadas por la Fundación en una fecha mutuamente acordada (mínimo 2 a 3 entrevistas por semestre).',
      'Avisar con anticipación y justificar las ausencias a las entrevistas individuales agendadas.'
    ]
  },
  {
    nombre: 'Compromisos de participación',
    puntos: [
      'Participar de los encuentros grupales convocados por la Fundación (mínimo 1 vez por semestre).',
      'Participar de la red de becarios, colaborando con los becarios que requieran apoyo académico, orientación vocacional, apoyo en la inserción en una nueva ciudad, etc.',
      'Participar del Paseo Anual de Becarios, a realizarse en el mes de diciembre.'
    ]
  },
]

const abstract: string = "El presente documento expone los compromisos que adquiere un/a estudiante para mantener la beca Carmen Goudie durante la realización de sus estudios superiores."

const subtitulo: string = "Beca Carmen Goudie año 2026"

const titulo: string = "Renovación compromiso Becarias y Becarios"

const compromiso: DocumentoCompromiso = {
  titulo: titulo,
  subtitulo: subtitulo,
  abstract: abstract,
  topicos: topicos
}

export const compromisoData = [
  {
    documento: compromiso
  }
];