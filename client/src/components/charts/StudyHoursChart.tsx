import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { BarChart3 } from 'lucide-react';
import { api } from '@/lib/api';

export function StudyHoursChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    api.analytics.weekly().then(setData).catch(() => {});
  }, []);

  return (
    <GlassCard hover={false}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-[#5B8CFF]" />
        <h3 className="text-sm font-semibold">Study Hours (This Week)</h3>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5B8CFF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#5B8CFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
          <XAxis dataKey="day" stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              fontSize: '12px',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#5B8CFF"
            strokeWidth={2}
            fill="url(#studyGradient)"
            dot={{ r: 4, fill: '#5B8CFF', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#5B8CFF', stroke: '#5B8CFF40', strokeWidth: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
