import type { Content, CustomTableLayout, Alignment } from 'pdfmake';
import fs from 'fs';
import path from 'path';

const TABLE_ACCENT = '#4A9E87';
const TABLE_ROW_STRIPE = '#F3F8F6';
const TABLE_RULE = '#D8DEDC';

const LOGO_PATH = path.join(__dirname, 'assets/logo-fundacion.png');

const LOGO_BASE64: string = (() => {
  try {
    const buffer = fs.readFileSync(LOGO_PATH);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch {
    return '';
  }
})();

export class InformeBuilder {
  static styles = {
    header: {
      fontSize: 16,
      bold: true,
      margin: [0, 0, 0, 2] as [number, number, number, number],
    },
    fecha: {
      fontSize: 9,
      color: 'gray',
      alignment: 'right' as const,
    },
    parrafo: {
      fontSize: 11,
      lineHeight: 1.3,
      alignment: 'justify' as const,
      margin: [0, 0, 0, 8] as [number, number, number, number],
    },
    footerNote: { fontSize: 8, color: 'gray', italics: true },
    tableHeader: {
      bold: true,
      fontSize: 9,
      color: TABLE_ACCENT,
      characterSpacing: 0.4,
    },
    tableCell: {
      fontSize: 10,
      color: '#333333',
    },
  };

  /**
   * Header institucional: logo a la izquierda, título + fecha de generación a la derecha.
   * Se usa igual en todos los informes (académico, semestre, entrevista, etc.)
   */
  static headerBuilder(titulo: string): Content {
    const fechaGeneracion = new Date().toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const logoColumn = LOGO_BASE64
      ? { image: LOGO_BASE64, width: 60 }
      : { text: 'FCG', width: 60, bold: true };

    return {
      stack: [
        {
          columns: [logoColumn, { text: fechaGeneracion, style: 'fecha', width: '*' }],
          columnGap: 10,
        },
        {
          text: titulo,
          style: 'header',
          alignment: 'center',
          margin: [0, 10, 0, 0] as [number, number, number, number],
        },
      ],
      margin: [0, 0, 0, 15],
    };
  }

  /**
   * Lista de campos "Etiqueta: valor" en una sola columna, sin tabla.
   * Pensado para secciones de datos de una persona (becario, entrevistador, etc.)
   * donde una tabla resulta visualmente pesada para pocos campos.
   */
  static fieldListBuilder(pairs: Array<[string, string]>): Content {
    return {
      stack: pairs.map(([label, value]) => ({
        text: [
          { text: `${label}: `, bold: true },
          { text: value },
        ],
        fontSize: 11,
        margin: [0, 0, 0, 4] as [number, number, number, number],
      })),
    };
  }

  static footerBuilder(): Content {
    return {
      text: 'Fundación Carmen Goudie — Documento generado automáticamente',
      style: 'footerNote',
      alignment: 'center',
    };
  }

  /**
   * Tabla con encabezado en mayúsculas, franjas alternadas y sin líneas
   * verticales — pensada para leerse como un reporte, no como una hoja de cálculo.
   * `aligns` controla la alineación por columna (por defecto 'left').
   */
  static tableBuilder(
    headers: string[],
    rows: (string | Content)[][],
    widths?: (string | number)[],
    aligns?: Alignment[],
  ): Content {
    const alignOf = (col: number): Alignment => aligns?.[col] ?? 'left';

    const layout: CustomTableLayout = {
      hLineWidth: (i, node) =>
        i === 1 || i === node.table.body.length ? 1 : 0,
      vLineWidth: () => 0,
      hLineColor: (i) => (i === 1 ? TABLE_ACCENT : TABLE_RULE),
      fillColor: (rowIndex) =>
        rowIndex > 0 && rowIndex % 2 === 0 ? TABLE_ROW_STRIPE : null,
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 7,
      paddingBottom: () => 7,
    };

    return {
      table: {
        headerRows: 1,
        widths: widths ?? headers.map(() => '*'),
        body: [
          headers.map((h, col) => ({
            text: h.toUpperCase(),
            style: 'tableHeader',
            alignment: alignOf(col),
          })),
          ...rows.map((row) =>
            row.map((cell, col) =>
              typeof cell === 'string'
                ? { text: cell, style: 'tableCell', alignment: alignOf(col) }
                : cell,
            ),
          ),
        ],
      },
      layout,
      margin: [0, 0, 0, 4] as [number, number, number, number],
    };
  }

  /**
   * Rótulo "Tabla N. Título" que precede a una tabla, para poder referenciarla
   * desde el texto explicativo justo antes ("en la Tabla N a continuación...").
   */
  static tableCaption(numero: number, titulo: string): Content {
    return {
      text: `Tabla ${numero}. ${titulo}`,
      bold: true,
      fontSize: 10,
      color: TABLE_ACCENT,
      margin: [0, 10, 0, 4] as [number, number, number, number],
    };
  }

  /**
   * `marginTop` extra permite separar un párrafo del bloque anterior cuando
   * hace falta dejar claro que introduce lo que viene después y no describe
   * lo que vino antes (p. ej. el texto que antecede a una tabla, justo
   * después de que terminó la tabla anterior).
   */
  static paragrafBuilder(body: string, marginTop = 0): Content {
    return {
      text: body,
      style: 'parrafo',
      margin: [0, marginTop, 0, 8] as [number, number, number, number],
    };
  }
}
