// src/components/common/MainLayout.tsx
import { Navbar } from './Navbar';
import type { NavLink } from './Navbar';
import { BackgroundParticles } from './Particles';
import marcoIzquierdo from '../../assets/frames/marco-izquierda.svg';
import marcoDerecho from '../../assets/frames/mardo-derecha.svg';
import type { Usuario } from '../../types';

interface MainLayoutProps {
  usuario: Usuario | null;
  onLogout: () => void;
  links?: NavLink[];
  children: React.ReactNode;
}

export function MainLayout({ usuario, onLogout, links = [], children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#FFFBF0]">

      {/* Marcos decorativos */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <img
          src={marcoIzquierdo}
          alt=""
          className="absolute left-0 top-0 h-screen w-auto max-w-none opacity-35 select-none hidden md:block"
        />
        <img
          src={marcoDerecho}
          alt=""
          className="absolute right-0 top-0 h-screen w-auto max-w-none opacity-35 select-none hidden md:block"
        />
      </div>

      {/* Partículas de fondo */}
      <BackgroundParticles />

      {/* Navbar */}
      <Navbar usuario={usuario} onLogout={onLogout} links={links} />

      {/* Contenido */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

    </div>
  );
}