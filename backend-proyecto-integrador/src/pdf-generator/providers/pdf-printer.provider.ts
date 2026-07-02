import { Injectable, OnModuleInit } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import path from 'path';

@Injectable()
export class PdfPrinterProvider implements OnModuleInit {
  onModuleInit() {
    const pdfmakeRoot = path.dirname(require.resolve('pdfmake/package.json'));
    const fontsDir = path.join(pdfmakeRoot, 'build', 'fonts', 'Roboto');
    const buildDir = path.join(pdfmakeRoot, 'build');

    PdfPrinter.setFonts({
      Roboto: {
        normal: path.join(fontsDir, 'Roboto-Regular.ttf'),
        bold: path.join(fontsDir, 'Roboto-Medium.ttf'),
        italics: path.join(fontsDir, 'Roboto-Italic.ttf'),
        bolditalics: path.join(fontsDir, 'Roboto-MediumItalic.ttf'),
      },
    });

    PdfPrinter.setUrlAccessPolicy(() => false);
    PdfPrinter.setLocalAccessPolicy((filePath) =>
      filePath.startsWith(buildDir),
    );
  }

  async createPdf(docDefinition: object): Promise<Buffer> {
    return PdfPrinter.createPdf(
      docDefinition as unknown as TDocumentDefinitions,
    ).getBuffer();
  }
}
