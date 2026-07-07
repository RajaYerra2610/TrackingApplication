import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { Code2 } from 'lucide-react';
import { api } from '@/lib/api';

const COLORS = ['#22C55E', '#F59E0B', '#EF4444'];

export function DSAProgressChart() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.dsa.stats().then(setStats).catch(() => {});
  }, []);

  const data = stats ? [
    { name: 'Easy', count: stats.easy, fill: COLORS[0] },
    { name: 'Medium', count: stats.medium, fill: COLORS[1] },
    { name: 'Hard', count: stats.hard, fill: COLORS[2] },
  ] : [];

  return (
    <GlassCard hover={false}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="text-sm font-semibold">DSA Progress</h3>
        </div>
        {stats && (
          <span className="text-xs text-muted-foreground">
            {stats.solved} / {stats.total} solved
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
          <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
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
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
