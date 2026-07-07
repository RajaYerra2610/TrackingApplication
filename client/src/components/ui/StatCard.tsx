import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  gradient: 'blue' | 'purple' | 'cyan' | 'success' | 'warning' | 'danger';
  delay?: number;
}

const gradientMap = {
  blue: { bg: 'stat-gradient-blue', icon: 'text-[#5B8CFF] bg-[#5B8CFF]/10', border: 'border-[#5B8CFF]/20' },
  purple: { bg: 'stat-gradient-purple', icon: 'text-[#8B5CF6] bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/20' },
  cyan: { bg: 'stat-gradient-cyan', icon: 'text-[#22D3EE] bg-[#22D3EE]/10', border: 'border-[#22D3EE]/20' },
  success: { bg: 'stat-gradient-success', icon: 'text-[#22C55E] bg-[#22C55E]/10', border: 'border-[#22C55E]/20' },
  warning: { bg: 'stat-gradient-warning', icon: 'text-[#F59E0B] bg-[#F59E0B]/10', border: 'border-[#F59E0B]/20' },
  danger: { bg: 'stat-gradient-danger', icon: 'text-[#EF4444] bg-[#EF4444]/10', border: 'border-[#EF4444]/20' },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, gradient, delay = 0 }: StatCardProps) {
  const colors = gradientMap[gradient];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(
        'glass-card p-5 cursor-default',
        colors.bg,
        colors.border,
        'border'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-xl', colors.icon)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            trend.value >= 0 ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#EF4444] bg-[#EF4444]/10'
          )}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <motion.p
          className="text-2xl font-bold tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
        >
          {value}
        </motion.p>
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/70">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
