import type { Content } from 'pdfmake';
import fs from 'fs';
import path from 'path';

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
      columns: [
        logoColumn,
        {
          width: '*',
          stack: [
            { text: titulo, style: 'header' },
            { text: `Generado el ${fechaGeneracion}`, style: 'fecha' },
          ],
        },
      ],
      columnGap: 10,
      margin: [0, 0, 0, 15],
    };
  }

  static footerBuilder(): Content {
    return {
      text: 'Fundación Carmen Goudie — Documento generado automáticamente',
      style: 'footerNote',
      alignment: 'center',
    };
  }

  static tableBuilder(
    headers: string[],
    rows: string[][],
    widths?: (string | number)[],
  ): Content {
    return {
      table: {
        headerRows: 1,
        widths: widths ?? headers.map(() => '*'),
        body: [headers, ...rows],
      },
    };
  }

  static paragrafBuilder(body: string): Content {
    return {
      text: body,
      style: 'parrafo',
    };
  }
}
