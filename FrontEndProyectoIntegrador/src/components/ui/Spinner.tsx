import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

/**
 * Componente de spinner simple usando Tailwind CSS
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  message,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = fullScreen
    ? 'flex flex-col items-center justify-center min-h-screen gap-4'
    : 'flex flex-col items-center justify-center gap-4 p-8';

  return (
    <div className={containerClasses}>
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}
        role="status"
        aria-label="Cargando"
      />
      {message && (
        <p className="text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
};