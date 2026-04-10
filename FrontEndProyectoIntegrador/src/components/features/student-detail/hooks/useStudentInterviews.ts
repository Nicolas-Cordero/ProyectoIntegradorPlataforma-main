import { useState } from 'react';

export const useStudentInterviews = () => {
  const [mostrarModalNuevaEntrevista, setMostrarModalNuevaEntrevista] = useState(false);

  // Abrir modal para nueva entrevista
  const handleAbrirModalNuevaEntrevista = () => {
    setMostrarModalNuevaEntrevista(true);
  };

  // Cerrar modal de nueva entrevista
  const handleCerrarModalNuevaEntrevista = () => {
    setMostrarModalNuevaEntrevista(false);
  };

  // Crear nueva entrevista
  const handleCrearEntrevista = async (datosEntrevista: any) => {
    try {
      // Lógica para crear entrevista
      // TODO: Implementar cuando se tenga el servicio de entrevistas
      console.log('Creando entrevista:', datosEntrevista);
      
      setMostrarModalNuevaEntrevista(false);
      alert('✅ Entrevista creada correctamente');
    } catch (err: any) {
      console.error('❌ Error al crear entrevista:', err);
      alert(`❌ Error al crear entrevista: ${err.message}`);
    }
  };

  return {
    mostrarModalNuevaEntrevista,
    setMostrarModalNuevaEntrevista,
    handleAbrirModalNuevaEntrevista,
    handleCerrarModalNuevaEntrevista,
    handleCrearEntrevista
  };
};