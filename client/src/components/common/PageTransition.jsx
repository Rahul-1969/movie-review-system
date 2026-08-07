import { motion } from 'framer-motion';

/**
 * PageTransition — wraps a page's root element to provide a snappy
 * fade + subtle slide-up enter animation and a fade exit animation.
 *
 * Duration: 200ms — fast enough to feel instant, visible enough to feel smooth.
 *
 * Usage:
 *   return (
 *     <PageTransition>
 *       <div>...page content...</div>
 *     </PageTransition>
 *   );
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
