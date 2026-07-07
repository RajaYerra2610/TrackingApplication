import { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { Target } from 'lucide-react';
import { api } from '@/lib/api';

export function SubjectRadarChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    api.analytics.subjects().then(setData).catch(() => {});
  }, []);

  return (
    <GlassCard hover={false}>
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-[#22D3EE]" />
        <h3 className="text-sm font-semibold">Subject Progress</h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="currentColor" className="text-border" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'currentColor', fontSize: 10 }}
            className="text-muted-foreground"
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: 'currentColor', fontSize: 9 }}
            className="text-muted-foreground"
          />
          <Radar
            name="Progress"
            dataKey="percentage"
            stroke="#22D3EE"
            fill="#22D3EE"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
