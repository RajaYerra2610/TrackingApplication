import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export function HeatMap() {
  const [data, setData] = useState<{ date: string; studyHours: number }[]>([]);

  useEffect(() => {
    api.analytics.heatmap().then(setData).catch(() => {});
  }, []);

  // Build 365-day grid
  const today = new Date();
  const days: { date: string; hours: number; level: number }[] = [];

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const entry = data.find(d => d.date === dateStr);
    const hours = entry?.studyHours || 0;
    const level = hours === 0 ? 0 : hours <= 2 ? 1 : hours <= 4 ? 2 : hours <= 6 ? 3 : 4;
    days.push({ date: dateStr, hours, level });
  }

  // Group into weeks (columns of 7)
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const colorMap = [
    'bg-muted/50',
    'bg-[#5B8CFF]/20',
    'bg-[#5B8CFF]/40',
    'bg-[#5B8CFF]/60',
    'bg-[#5B8CFF]/80',
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <GlassCard hover={false}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#5B8CFF]" />
          <h3 className="text-sm font-semibold">Study Activity</h3>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span>Less</span>
          {colorMap.map((c, i) => (
            <div key={i} className={cn('w-2.5 h-2.5 rounded-sm', c)} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-[700px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.001 }}
                  className={cn(
                    'w-[11px] h-[11px] rounded-[2px] cursor-default transition-colors',
                    colorMap[day.level]
                  )}
                  title={`${day.date}: ${day.hours}h`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
