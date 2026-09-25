import { useEffect, useRef } from 'react';

/** Keeps the end of a scrolling list in view whenever `trigger` changes. */
export function useAutoScroll<T extends HTMLElement>(trigger: unknown) {
  const endRef = useRef<T>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    endRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'end' });
  }, [trigger]);

  return endRef;
}
