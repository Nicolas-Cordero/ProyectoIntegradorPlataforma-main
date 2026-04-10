import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import type { BoxProps } from '@mui/material';

interface TypingTextProps extends Omit<BoxProps, 'children'> {
  text: string;
  startDelayMs?: number;
  charDelayMs?: number;
}

export function TypingText({
  text,
  startDelayMs = 0,
  charDelayMs = 1,
  sx,
  ...props
}: TypingTextProps) {
  const [visibleChars, setVisibleChars] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;
    let index = 0;

    setVisibleChars(0);

    const startTyping = () => {
      const revealNextChar = () => {
        if (cancelled) {
          return;
        }

        index += 1;
        setVisibleChars(index);

        if (index < text.length) {
          timeoutId = window.setTimeout(revealNextChar, charDelayMs);
        }
      };

      revealNextChar();
    };

    const startId = window.setTimeout(startTyping, startDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(startId);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [text, startDelayMs, charDelayMs]);

  return (
    <Box
      aria-label={text}
      sx={{
        position: 'relative',
        display: 'inline-block',
        whiteSpace: 'pre-wrap',
        ...sx,
      }}
      {...props}
    >
      <Box
        component="span"
        sx={{
          visibility: 'hidden',
          whiteSpace: 'inherit',
        }}
      >
        {text}
      </Box>
      <Box
        component="span"
        sx={{
          position: 'absolute',
          inset: 0,
          whiteSpace: 'inherit',
        }}
      >
        {text.slice(0, visibleChars)}
      </Box>
    </Box>
  );
}