import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, ExternalLink, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Youtube = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const ROADMAP_NAMES: Record<string, string> = {
  javascript: 'JavaScript', react: 'React', node: 'Node.js', sql: 'SQL',
  python: 'Python', docker: 'Docker', fastapi: 'FastAPI', nextjs: 'Next.js',
  cicd: 'CI/CD', lld: 'Low-Level Design', hld: 'High-Level Design', 'system-design': 'System Design',
};

const ROADMAP_COLORS: Record<string, string> = {
  javascript: '#F59E0B', react: '#22D3EE', node: '#22C55E', sql: '#5B8CFF',
  python: '#8B5CF6', docker: '#22D3EE', fastapi: '#22C55E', nextjs: '#5B8CFF',
  cicd: '#F59E0B', lld: '#8B5CF6', hld: '#EF4444', 'system-design': '#22D3EE',
};

export default function RoadmapPage() {
  const { name } = useParams<{ name: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const roadmapName = ROADMAP_NAMES[name || ''] || name || '';
  const color = ROADMAP_COLORS[name || ''] || '#5B8CFF';

  const fetchData = async () => {
    try {
      const data = await api.roadmaps.get(name || '');
      setItems(data);
      // Expand all sections by default
      const sections = new Set(data.map((item: any) => item.section));
      setExpandedSections(sections);
    } catch { toast.error('Failed to load roadmap'); }
    finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchData(); }, [name]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(section) ? next.delete(section) : next.add(section);
      return next;
    });
  };

  const toggleItem = async (item: any) => {
    try {
      await api.roadmaps.toggle(item.id);
      if (!item.completed) {
        await api.gamification.addXP(5, 'roadmap_complete');
      }
      fetchData();
    } catch { toast.error('Failed to update'); }
  };

  // Group by section
  const sections = items.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const totalItems = items.length;
  const completedItems = items.filter(i => i.completed).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const totalHours = items.reduce((sum, i) => sum + (i.estimatedHours || 0), 0);
  const completedHours = items.filter(i => i.completed).reduce((sum, i) => sum + (i.estimatedHours || 0), 0);

  if (loading) return <TableSkeleton rows={10} />;

  return (
    <div className="space-y-6 max-w-[1000px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{roadmapName} <span className="text-muted-foreground font-normal">Roadmap</span></h1>
          <p className="text-sm text-muted-foreground mt-1">{completedItems} of {totalItems} topics completed</p>
        </div>
        <div className="flex items-center gap-4">
          <ProgressRing value={progress} size={80} strokeWidth={6} color={color} label="Complete" />
          <div className="text-right">
            <p className="text-sm font-semibold">{completedHours}h / {totalHours}h</p>
            <p className="text-xs text-muted-foreground">Est. time</p>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <GlassCard hover={false} className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Overall Progress</span>
          <span className="text-xs font-bold" style={{ color }}>{progress}%</span>
        </div>
        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </GlassCard>

      {/* Sections */}
      <div className="space-y-3">
        {Object.entries(sections).map(([section, rawSectionItems], si) => {
          const sectionItems = rawSectionItems as any[];
          const sectionCompleted = sectionItems.filter((i: any) => i.completed).length;
          const sectionProgress = Math.round((sectionCompleted / sectionItems.length) * 100);
          const isExpanded = expandedSections.has(section);

          return (
            <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.05 }}>
              <GlassCard hover={false} className="p-0 overflow-hidden">
                {/* Section Header */}
                <button onClick={() => toggleSection(section)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <div>
                      <h3 className="text-sm font-semibold text-left">{section}</h3>
                      <p className="text-xs text-muted-foreground">{sectionCompleted}/{sectionItems.length} topics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium" style={{ color }}>{sectionProgress}%</span>
                    <div className="w-24 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: color, width: `${sectionProgress}%` }} />
                    </div>
                  </div>
                </button>

                {/* Section Items */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <div className="border-t border-border">
                        {sectionItems.map((item: any, i: number) => (
                          <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors group">
                            {/* Checkbox */}
                            <button onClick={() => toggleItem(item)}
                              className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                                item.completed ? 'border-transparent' : 'border-border hover:border-border'
                              )}
                              style={item.completed ? { backgroundColor: color } : undefined}>
                              {item.completed && <Check className="w-3 h-3 text-white" />}
                            </button>

                            {/* Topic */}
                            <span className={cn('text-sm flex-1', item.completed && 'line-through text-muted-foreground')}>
                              {item.topic}
                            </span>

                            {/* Est hours */}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Clock className="w-3 h-3" />
                              <span>{item.estimatedHours}h</span>
                            </div>

                            {/* Links */}
                            {item.youtubeLink && (
                              <a href={item.youtubeLink} target="_blank" rel="noreferrer"
                                className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Youtube className="w-4 h-4 text-red-400 hover:text-red-300" />
                              </a>
                            )}
                            {item.documentationLink && (
                              <a href={item.documentationLink} target="_blank" rel="noreferrer"
                                className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <FileText className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </a>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
