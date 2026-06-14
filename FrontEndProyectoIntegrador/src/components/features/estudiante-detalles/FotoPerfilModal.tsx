import React, { useState, useRef } from 'react';
import { Box } from '@mui/material';
import { Modal, Alert, Button } from '../../ui';
import { storageService } from '../../../services';

interface Props {
  estudianteId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (url: string) => void;
}

export const FotoPerfilModal: React.FC<Props> = ({ estudianteId, isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    if (loading) return;
    setFile(null);
    setPreview(null);
    setError('');
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) { setError('Selecciona una imagen primero.'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await storageService.uploadFotoPerfil(estudianteId, file);
      onSuccess(result.foto_url);
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      titulo="Cambiar foto de perfil"
      abierto={isOpen}
      onCerrar={handleClose}
      tamanio="sm"
      acciones={
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Button variante="outline" tamano="md" onClick={handleClose} deshabilitado={loading}>
            Cancelar
          </Button>
          <Button variante="primary" tamano="md" onClick={handleUpload} cargando={loading} deshabilitado={!file}>
            Subir foto
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && <Alert tipo="error" mensaje={error} cerrable onCerrar={() => setError('')} />}

        <div className="flex flex-col items-center gap-4">
          {preview ? (
            <img
              src={preview}
              alt="Vista previa"
              className="w-40 h-40 rounded-full object-cover border-2 border-[#65B39B]"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
              Sin imagen
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="text-sm text-[#65B39B] hover:text-[#4a9e87] font-semibold underline underline-offset-2 transition-colors disabled:opacity-50"
          >
            {file ? 'Cambiar imagen seleccionada' : 'Seleccionar imagen (JPEG)'}
          </button>
        </div>
      </Box>
    </Modal>
  );
};
