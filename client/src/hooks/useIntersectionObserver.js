import { useEffect } from 'react';

export const useIntersectionObserver = ({
  target,
  onIntersect,
  threshold = 1.0,
  rootMargin = '0px',
  enabled = true,
}) => {
  useEffect(() => {
    if (!enabled || !target?.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
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
};
