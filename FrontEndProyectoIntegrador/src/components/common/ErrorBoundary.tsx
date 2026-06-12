import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { logger } from '../../config';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Captura errores de renderizado no manejados en el árbol de componentes
 * y muestra un mensaje de recuperación en lugar de una pantalla en blanco.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error no capturado en la aplicación:', error, errorInfo.componentStack);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Algo salió mal</h1>
          <p className="text-gray-600">
            Ocurrió un error inesperado. Intenta volver al inicio.
          </p>
          <button
            onClick={this.handleReload}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
