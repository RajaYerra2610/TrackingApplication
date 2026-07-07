import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'primary' | 'purple' | 'cyan' | 'success' | 'warning';
}

export function GlassCard({ children, className, hover = true, glow, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass-card p-6',
        hover && 'transition-transform duration-300',
        glow === 'primary' && 'glow-primary',
        glow === 'purple' && 'glow-purple',
        glow === 'cyan' && 'glow-cyan',
        glow === 'success' && 'glow-success',
        className
      )}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
