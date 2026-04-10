import React from 'react';
import jsPDF from 'jspdf';
import { Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface EntrevistaReportGeneratorProps {
  entrevista: any;
}

export const EntrevistaReportGenerator: React.FC<EntrevistaReportGeneratorProps> = ({ entrevista }) => {
  
  const generarPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = 20;

    const checkPageBreak = (requiredSpace: number = 10) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    const splitText = (text: string, maxWidth: number): string[] => {
      return doc.splitTextToSize(text, maxWidth);
    };

    const formatMultiline = (text: string): string[] => {
      return text
        .split(/\r?\n/)
        .map((block) => block.trim())
        .flatMap((block, index) => {
          if (block.length === 0) return index === 0 ? [] : [''];
          const lines = splitText(block, maxWidth);
          return index === 0 ? lines : [''].concat(lines);
        });
    };

    // ENCABEZADO
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME DE ENTREVISTA', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // INFORMACIÓN GENERAL
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Información General', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Estudiante
    if (entrevista.estudiante) {
      const nombreCompleto = `${entrevista.estudiante.nombre || ''} ${entrevista.estudiante.apellido_paterno || ''} ${entrevista.estudiante.apellido_materno || ''}`;
      doc.text(`Estudiante: ${nombreCompleto.trim()}`, margin, yPosition);
      yPosition += 6;
      if (entrevista.estudiante.rut) {
        doc.text(`RUT: ${entrevista.estudiante.rut}`, margin, yPosition);
        yPosition += 6;
      }
    }

    // Fecha
    const fechaFormateada = new Date(entrevista.fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Fecha: ${fechaFormateada}`, margin, yPosition);
    yPosition += 6;

    // Número y estado
    const numeroEntrevista = entrevista.numero_entrevista ?? entrevista.numero_Entrevista;
    if (numeroEntrevista) {
      doc.text(`N° entrevista: ${numeroEntrevista}`, margin, yPosition);
      yPosition += 6;
    }

    if (entrevista.estado) {
      doc.text(`Estado: ${entrevista.estado}`, margin, yPosition);
      yPosition += 6;
    }

    if (entrevista.duracion_minutos) {
      doc.text(`Duración: ${entrevista.duracion_minutos} minutos`, margin, yPosition);
      yPosition += 6;
    }

    // Tutor
    if (entrevista.tutor || entrevista.nombre_Tutor) {
      doc.text(`Tutor: ${entrevista.tutor || entrevista.nombre_Tutor}`, margin, yPosition);
      yPosition += 6;
    }

    yPosition += 4;
    checkPageBreak(20);

    // TEMAS ABORDADOS
    if (entrevista.temas_abordados) {
      doc.setFont('helvetica', 'bold');
      doc.text('Temas Abordados:', margin, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      const temasTexto = Array.isArray(entrevista.temas_abordados)
        ? entrevista.temas_abordados.join(', ')
        : entrevista.temas_abordados;
      const temasLineas = splitText(temasTexto, maxWidth);
      temasLineas.forEach(linea => {
        checkPageBreak(6);
        doc.text(linea, margin, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }

    checkPageBreak(20);

    // OBSERVACIONES
    const observacionesTexto = (entrevista.observaciones && String(entrevista.observaciones).trim()) || 'Sin observaciones';
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones:', margin, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    const observacionesLineas = formatMultiline(observacionesTexto);
    observacionesLineas.forEach(linea => {
      checkPageBreak(6);
      doc.text(linea, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 5;

    // INFORMACIÓN ADICIONAL
    const infoTexto = (entrevista.informacion_adicional && String(entrevista.informacion_adicional).trim()) || 'Sin información adicional';
    doc.setFont('helvetica', 'bold');
    doc.text('Información adicional:', margin, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    const infoLineas = formatMultiline(infoTexto);
    infoLineas.forEach(linea => {
      checkPageBreak(6);
      doc.text(linea, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 5;

    // DETALLE POR ENTREVISTA
    const detalleEntrevistas = Array.isArray(entrevista.detalleEntrevistas) ? entrevista.detalleEntrevistas : [];
    if (detalleEntrevistas.length > 0) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Detalle de entrevistas:', margin, yPosition);
      yPosition += 10;

      detalleEntrevistas.forEach((det: any, index: number) => {
        checkPageBreak(24);
        doc.setFontSize(11);
        doc.text(`Entrevista ${det.numero_entrevista || index + 1}`, margin, yPosition);
        yPosition += 6;

        const fechaTxt = det.fecha ? new Date(det.fecha).toLocaleDateString('es-CL') : 'Sin fecha';
        const estadoTxt = det.estado || 'Sin estado';
        const duracionTxt = det.duracion_minutos ? `${det.duracion_minutos} minutos` : 'Sin duración registrada';

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${fechaTxt}`, margin, yPosition);
        yPosition += 6;
        doc.text(`Estado: ${estadoTxt}`, margin, yPosition);
        yPosition += 6;
        doc.text(`Duración: ${duracionTxt}`, margin, yPosition);
        yPosition += 6;

        doc.setFont('helvetica', 'bold');
        doc.text('Observaciones:', margin, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        formatMultiline(det.observaciones || 'Sin observaciones').forEach((linea) => {
          checkPageBreak(6);
          doc.text(linea, margin, yPosition);
          yPosition += 6;
        });

        doc.setFont('helvetica', 'bold');
        doc.text('Información adicional:', margin, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        formatMultiline(det.informacion_adicional || 'Sin información adicional').forEach((linea) => {
          checkPageBreak(6);
          doc.text(linea, margin, yPosition);
          yPosition += 6;
        });

        if (det.temas_abordados && det.temas_abordados.length) {
          doc.setFont('helvetica', 'bold');
          doc.text('Temas:', margin, yPosition);
          yPosition += 6;
          doc.setFont('helvetica', 'normal');
          splitText(Array.isArray(det.temas_abordados) ? det.temas_abordados.join(', ') : det.temas_abordados, maxWidth).forEach((linea) => {
            checkPageBreak(6);
            doc.text(linea, margin, yPosition);
            yPosition += 6;
          });
        }

        yPosition += 4;
      });
      yPosition += 4;
    }

    checkPageBreak(20);

    // TEXTOS AGRUPADOS POR ETIQUETA
    const textos = Array.isArray(entrevista.textos) ? entrevista.textos : [];
    if (textos.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Comentarios y Notas:', margin, yPosition);
      yPosition += 10;

      // Agrupar por etiqueta
      const textosPorEtiqueta: { [etiqueta: string]: any[] } = {};
      textos.forEach((texto: any) => {
        const etiqueta = texto.etiqueta?.nombre_etiqueta || texto.nombre_etiqueta || 'Sin etiqueta';
        if (!textosPorEtiqueta[etiqueta]) textosPorEtiqueta[etiqueta] = [];
        textosPorEtiqueta[etiqueta].push(texto);
      });

      // Mostrar cada grupo de etiqueta
      Object.entries(textosPorEtiqueta).forEach(([etiqueta, textosDeEtiqueta]) => {
        checkPageBreak(20);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(etiqueta, margin, yPosition);
        yPosition += 6;

        textosDeEtiqueta.forEach((texto: any) => {
          checkPageBreak(18);
          const fechaBase = texto.fecha || entrevista.fecha;
          const fechaTxt = fechaBase ? new Date(fechaBase).toLocaleDateString('es-CL') : 'Sin fecha';
          const contexto = texto.contexto ? `Contexto: ${texto.contexto}` : '';

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`Fecha: ${fechaTxt}`, margin, yPosition);
          yPosition += 6;

          const lineasContenido = splitText(texto.contenido || 'Sin contenido', maxWidth);
          lineasContenido.forEach(linea => {
            checkPageBreak(6);
            doc.text(linea, margin + 8, yPosition);
            yPosition += 6;
          });

          if (contexto) {
            const lineasCtx = splitText(contexto, maxWidth);
            lineasCtx.forEach(linea => {
              checkPageBreak(6);
              doc.text(linea, margin + 8, yPosition);
              yPosition += 6;
            });
          }

          yPosition += 4;
        });
        yPosition += 4;
      });
    }

    // PIE DE PÁGINA
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(`Generado el ${new Date().toLocaleDateString('es-CL')}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    // Guardar
    const apellido = entrevista.estudiante?.apellido_paterno || '';
    const nombre = entrevista.estudiante?.nombre || 'Sin_Nombre';
    const fecha = new Date(entrevista.fecha).toLocaleDateString('es-CL').replace(/\//g, '-');
    const nombreArchivo = `Entrevista_${apellido}_${nombre}_${fecha}.pdf`;
    doc.save(nombreArchivo.replace(/\s+/g, '_'));
  };

  return (
    <Button
      variant="contained"
      color="error"
      startIcon={<PictureAsPdfIcon />}
      onClick={generarPDF}
      sx={{
        textTransform: 'none',
        fontWeight: 'bold',
        boxShadow: 2,
        '&:hover': {
          boxShadow: 4,
        }
      }}
    >
      Generar PDF de Entrevista
    </Button>
  );
};
