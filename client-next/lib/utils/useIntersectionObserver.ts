import { useEffect, RefObject } from 'react';

export interface UseIntersectionObserverProps {
  target: RefObject<HTMLElement | null>;
  onIntersect: () => void;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useIntersectionObserver({
  target,
  onIntersect,
  threshold = 0.5,
  rootMargin = '100px',
  enabled = true,
}: UseIntersectionObserverProps) {
  useEffect(() => {
    if (!enabled || !target?.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersect();
        }
      },
      { rootMargin, threshold }
    );

    const el = target.current;
    observer.observe(el);

    return () => {
      observer.unobserve(el);
    };
  }, [target, onIntersect, threshold, rootMargin, enabled]);
}
