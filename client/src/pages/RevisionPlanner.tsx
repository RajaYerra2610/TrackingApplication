import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function RevisionPlanner() {
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Missed' | 'Completed'>('Upcoming');

  const fetchData = async () => {
    try {
      const [upcoming, missed, completed] = await Promise.all([
        api.revisions.upcoming(),
        api.revisions.missed(),
        api.revisions.getAll('Completed')
      ]);

      if (activeTab === 'Upcoming') setRevisions(upcoming);
      else if (activeTab === 'Missed') setRevisions(missed);
      else setRevisions(completed);

    } catch { toast.error('Failed to load revisions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleComplete = async (id: string) => {
    try {
      await api.revisions.complete(id);
      toast.success('Revision completed');
      await api.gamification.addXP(20, 'revision_complete');
      fetchData();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.revisions.delete(id);
      toast.success('Revision deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20';
      case 'Missed': return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
      default: return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';
    }
  };

  const getDayLabel = (num: number) => {
    const days = [1, 3, 7, 15, 30];
    return `Day ${days[num - 1] || 'X'}`;
  }

  return (
    <div className="space-y-6 max-w-[1000px]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Spaced Repetition</h1>
          <p className="text-sm text-muted-foreground mt-1">Review topics on Days 1, 3, 7, 15, and 30 to maximize retention.</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-4">
        {['Upcoming', 'Missed', 'Completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors relative',
              activeTab === tab ? 'text-white bg-muted/50' : 'text-muted-foreground hover:text-white hover:bg-muted/50'
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="revisionTab" className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-[#5B8CFF]" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3"><div className="skeleton h-24 rounded-xl" /><div className="skeleton h-24 rounded-xl" /></div>
      ) : revisions.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title={`No ${activeTab} Revisions`}
          description={activeTab === 'Upcoming' ? "You're all caught up! Add new concepts or problems and generate their revision schedules." : `No ${activeTab.toLowerCase()} revisions to show.`}
        />
      ) : (
        <div className="space-y-3">
          {revisions.map((rev, i) => (
            <motion.div key={rev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard hover={false} className="p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-lg flex-shrink-0', getStatusColor(rev.status))}>
                    R{rev.revisionNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 border border-border capitalize">
                        {rev.itemType}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Due {formatDate(rev.revisionDate)}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold mt-1">{rev.itemName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Originally learned: {formatDate(rev.originalDate)} ({getDayLabel(rev.revisionNumber)} review)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {rev.status !== 'Completed' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleComplete(rev.id)}
                      className="px-4 py-2 rounded-xl bg-[#22C55E]/20 text-[#22C55E] text-sm font-medium hover:bg-[#22C55E]/30 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Complete
                    </motion.button>
                  )}
                  {rev.status === 'Completed' && (
                     <div className="px-3 py-1.5 rounded-lg bg-[#22C55E]/10 text-[#22C55E] text-sm flex items-center gap-1">
                       <CheckCircle2 className="w-4 h-4" /> Done
                     </div>
                  )}
                  <button onClick={() => handleDelete(rev.id)} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all text-muted-foreground hover:text-red-400">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
