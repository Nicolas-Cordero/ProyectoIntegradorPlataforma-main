import { useOutletContext } from 'react-router-dom';
import type { EstudianteOutletContext } from './EstudianteDetail';

export default function EstudianteEntrevistas() {
  const { canEdit } = useOutletContext<EstudianteOutletContext>();

  if (!canEdit) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-4xl mb-3">🔒</p>
        <h2 className="text-lg font-bold text-gray-700">Acceso restringido</h2>
        <p className="text-gray-400 mt-2">Solo administradores y tutores pueden ver las entrevistas.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
      <p className="text-5xl mb-4">🚧</p>
      <h2 className="text-xl font-bold text-gray-700">Entrevistas</h2>
      <p className="text-gray-400 mt-2">En construcción</p>
    </div>
  );
}
