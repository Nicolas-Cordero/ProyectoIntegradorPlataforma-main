import React, { useMemo } from 'react';
import { Box } from '@mui/material';

type Particle = {
  left: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  scale: number;
  blur: number;
  borderRadius: string;
};

const PARTICLE_COUNT = 20;
const BASE_COLOR = '238, 179, 93';

function createSeededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function createParticles(): Particle[] {
  const random = createSeededRandom(20260405);

  return Array.from({ length: PARTICLE_COUNT }, () => {
    const size = 4 + Math.floor(random() * 12);
    const duration = 10 + random() * 12;
    const delay = -random() * duration;
    const driftX = (random() - 0.5) * 180;
    const driftY = -110 + random() * 240;
    const scale = 0.88 + random() * 0.5;
    const opacity = 0.42 + random() * 0.28;
    const blur = random() * 0.25;

    return {
      left: -5 + random() * 110,
      top: -2 + random() * 104,
      size,
      opacity,
      duration,
      delay,
      driftX,
      driftY,
      scale,
      blur,
      borderRadius: `${40 + random() * 18}% ${48 + random() * 18}% ${42 + random() * 18}% ${56 + random() * 18}% / ${38 + random() * 18}% ${52 + random() * 18}% ${44 + random() * 18}% ${58 + random() * 18}%`,
    };
  });
}

export const BackgroundParticles: React.FC = () => {
  const particles = useMemo(() => createParticles(), []);

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <Box
        component="style"
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes dashboard-particle-float {
              0% {
                transform: translate3d(0, 0, 0) scale(1);
              }
              50% {
                transform: translate3d(var(--drift-x), calc(var(--drift-y) * 0.55), 0) scale(var(--particle-scale));
              }
              100% {
                transform: translate3d(calc(var(--drift-x) * -0.35), var(--drift-y), 0) scale(1.03);
              }
            }
          `,
        }}
      />

      {particles.map((particle, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size * 0.92}px`,
            borderRadius: particle.borderRadius,
            backgroundColor: `rgba(${BASE_COLOR}, ${particle.opacity})`,
            boxShadow: `0 0 ${particle.size * 1.9}px rgba(${BASE_COLOR}, ${particle.opacity * 0.85})`,
            filter: `blur(${particle.blur}px)`,
            animation: `dashboard-particle-float ${particle.duration}s ease-in-out ${particle.delay}s infinite alternate`,
            transformOrigin: 'center center',
            mixBlendMode: 'normal',
            '--drift-x': `${particle.driftX}px`,
            '--drift-y': `${particle.driftY}px`,
            '--particle-scale': `${particle.scale}`,
          } as React.CSSProperties}
        />
      ))}
    </Box>
  );
};
