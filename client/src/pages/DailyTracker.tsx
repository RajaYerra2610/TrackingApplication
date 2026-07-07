import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Edit, X, ListChecks } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function DailyTracker() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const data = await api.daily.getAll();
      setEntries(data);
    } catch { toast.error('Failed to load entries'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = entries.filter(e =>
    !search || e.dsaTopic?.toLowerCase().includes(search.toLowerCase()) ||
    e.jsTopic?.toLowerCase().includes(search.toLowerCase()) ||
    e.notes?.toLowerCase().includes(search.toLowerCase()) ||
    e.date?.includes(search)
  );

  const handleSave = async (formData: any) => {
    try {
      if (editItem) {
        await api.daily.update(editItem.id, formData);
        toast.success('Entry updated');
      } else {
        await api.daily.create(formData);
        toast.success('Entry added');
        await api.gamification.addXP(15, 'daily_log');
      }
      setShowModal(false);
      setEditItem(null);
      fetchData();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.daily.delete(deleteId); toast.success('Entry deleted'); fetchData(); } catch { toast.error('Failed'); }
    setDeleteId(null);
  };

  if (loading) return <TableSkeleton rows={8} />;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">{entries.length} days logged</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white text-sm font-medium">
          <Plus className="w-4 h-4" /> Log Today
        </motion.button>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search by date, topic, or notes..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50 transition-colors" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ListChecks} title="No Entries Yet" description="Start logging your daily study progress"
          action={{ label: 'Log Today', onClick: () => { setEditItem(null); setShowModal(true); } }} />
      ) : (
        <div className="grid gap-3">
          {filtered.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <GlassCard className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold">{formatDate(entry.date)}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#5B8CFF]">{entry.studyHours}h studied</span>
                      <span className="text-xs text-[#8B5CF6]">{entry.problemsSolved} problems</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full',
                        entry.productivity >= 7 ? 'bg-[#22C55E]/10 text-[#22C55E]' : entry.productivity >= 4 ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#EF4444]/10 text-[#EF4444]'
                      )}>
                        Productivity: {entry.productivity}/10
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditItem(entry); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-muted/50"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteId(entry.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.dsaTopic && <Tag label={`DSA: ${entry.dsaTopic}`} color="#5B8CFF" />}
                  {entry.jsTopic && <Tag label={`JS: ${entry.jsTopic}`} color="#F59E0B" />}
                  {entry.reactTopic && <Tag label={`React: ${entry.reactTopic}`} color="#22D3EE" />}
                  {entry.backendTopic && <Tag label={`Backend: ${entry.backendTopic}`} color="#22C55E" />}
                  {entry.sqlTopic && <Tag label={`SQL: ${entry.sqlTopic}`} color="#8B5CF6" />}
                  {entry.systemDesignTopic && <Tag label={`SD: ${entry.systemDesignTopic}`} color="#EF4444" />}
                  {entry.revisionCompleted && <Tag label="✅ Revision" color="#22C55E" />}
                  {entry.mockInterview && <Tag label="🎤 Mock" color="#F59E0B" />}
                  {entry.jobApplied && <Tag label="📄 Applied" color="#5B8CFF" />}
                </div>
                {entry.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{entry.notes}</p>}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && <DailyModal item={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} />}
      </AnimatePresence>
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteId(null)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              className="relative glass-card p-6 w-full max-w-sm border border-border">
              <h3 className="text-lg font-semibold mb-2">Delete Entry?</h3>
              <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl text-sm hover:bg-muted/50">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-sm bg-[#EF4444] text-white">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full border" style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}>
      {label}
    </span>
  );
}

function DailyModal({ item, onSave, onClose }: { item: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    date: item?.date || new Date().toISOString().split('T')[0],
    studyHours: item?.studyHours || 0, dsaTopic: item?.dsaTopic || '', problemsSolved: item?.problemsSolved || 0,
    difficulty: item?.difficulty || 'Medium', jsTopic: item?.jsTopic || '', reactTopic: item?.reactTopic || '',
    backendTopic: item?.backendTopic || '', sqlTopic: item?.sqlTopic || '', dockerTopic: item?.dockerTopic || '',
    lldTopic: item?.lldTopic || '', hldTopic: item?.hldTopic || '', systemDesignTopic: item?.systemDesignTopic || '',
    revisionCompleted: item?.revisionCompleted || false, mockInterview: item?.mockInterview || false,
    jobApplied: item?.jobApplied || false, notes: item?.notes || '', productivity: item?.productivity || 5,
    energyLevel: item?.energyLevel || 5,
  });

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="relative glass-card p-6 w-full max-w-3xl border border-border max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{item ? 'Edit Entry' : 'Log Today'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="Date" type="date" value={form.date} onChange={v => update('date', v)} />
          <InputField label="Study Hours" type="number" value={form.studyHours} onChange={v => update('studyHours', parseFloat(v) || 0)} />
          <InputField label="Problems Solved" type="number" value={form.problemsSolved} onChange={v => update('problemsSolved', parseInt(v) || 0)} />
          <InputField label="DSA Topic" value={form.dsaTopic} onChange={v => update('dsaTopic', v)} />
          <InputField label="JavaScript Topic" value={form.jsTopic} onChange={v => update('jsTopic', v)} />
          <InputField label="React Topic" value={form.reactTopic} onChange={v => update('reactTopic', v)} />
          <InputField label="Backend Topic" value={form.backendTopic} onChange={v => update('backendTopic', v)} />
          <InputField label="SQL Topic" value={form.sqlTopic} onChange={v => update('sqlTopic', v)} />
          <InputField label="Docker Topic" value={form.dockerTopic} onChange={v => update('dockerTopic', v)} />
          <InputField label="LLD Topic" value={form.lldTopic} onChange={v => update('lldTopic', v)} />
          <InputField label="HLD Topic" value={form.hldTopic} onChange={v => update('hldTopic', v)} />
          <InputField label="System Design" value={form.systemDesignTopic} onChange={v => update('systemDesignTopic', v)} />
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Productivity (1-10)</label>
            <input type="range" min={1} max={10} value={form.productivity} onChange={e => update('productivity', parseInt(e.target.value))}
              className="w-full accent-[#5B8CFF]" />
            <span className="text-xs text-[#5B8CFF]">{form.productivity}/10</span>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Energy Level (1-10)</label>
            <input type="range" min={1} max={10} value={form.energyLevel} onChange={e => update('energyLevel', parseInt(e.target.value))}
              className="w-full accent-[#22C55E]" />
            <span className="text-xs text-[#22C55E]">{form.energyLevel}/10</span>
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.revisionCompleted} onChange={e => update('revisionCompleted', e.target.checked)} className="rounded" /><span className="text-sm">Revision Done</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.mockInterview} onChange={e => update('mockInterview', e.target.checked)} className="rounded" /><span className="text-sm">Mock Interview</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.jobApplied} onChange={e => update('jobApplied', e.target.checked)} className="rounded" /><span className="text-sm">Job Applied</span></label>
          </div>
          <div className="md:col-span-3">
            <label className="text-xs text-muted-foreground mb-1.5 block">Notes</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50 resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm hover:bg-muted/50">Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onSave(form)}
            className="px-5 py-2.5 rounded-xl text-sm bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white font-medium">
            {item ? 'Update' : 'Log Entry'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InputField({ label, type = 'text', value, onChange }: { label: string; type?: string; value: any; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50 transition-colors" />
    </div>
  );
}
