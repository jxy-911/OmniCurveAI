import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  displayMode?: boolean;
  className?: string;
  fallback?: string;
}

export const MathView: React.FC<MathViewProps> = ({
  math,
  displayMode = false,
  className = '',
  fallback,
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch (err) {
      console.warn('KaTeX rendering error:', err);
      return fallback || math;
    }
  }, [math, displayMode, fallback]);

  return (
    <span
      className={`inline-block max-w-full overflow-x-auto overflow-y-visible select-all align-middle py-0.5 px-0.5 font-normal tracking-normal text-neutral-900 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
