import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mic, Calendar, Clock, Link as LinkIcon, Trash2, Edit, X, Star } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function MockInterviews() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const data = await api.mockInterviews.getAll();
      setInterviews(data);
    } catch { toast.error('Failed to load mock interviews'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (formData: any) => {
    try {
      if (editItem) {
        await api.mockInterviews.update(editItem.id, formData);
        toast.success('Mock interview updated');
      } else {
        await api.mockInterviews.create(formData);
        toast.success('Mock interview added');
        await api.gamification.addXP(25, 'mock_interview');
      }
      setShowModal(false);
      setEditItem(null);
      fetchData();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.mockInterviews.delete(deleteId);
      toast.success('Mock interview deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 max-w-[1000px]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mock Interviews</h1>
          <p className="text-sm text-muted-foreground mt-1">Practice and track your mock interview performance.</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white text-sm font-medium">
          <Plus className="w-4 h-4" /> Log Interview
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {Array.from({length: 4}).map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />)}
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState icon={Mic} title="No Interviews Logged" description="Start logging your mock interviews to track your improvement." action={{ label: 'Log Interview', onClick: () => setShowModal(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((interview, i) => (
            <motion.div key={interview.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-5 flex flex-col h-full group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6]"><Mic className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-bold text-base leading-tight">{interview.type} Interview</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Platform: {interview.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full border border-border">
                    <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-xs font-semibold">{interview.score}/10</span>
                  </div>
                </div>

                <div className="space-y-2 mt-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> <span>{formatDate(interview.date)}</span>
                  </div>
                  {interview.feedback && <p className="text-xs text-muted-foreground line-clamp-2 mt-2">"{interview.feedback}"</p>}
                  {interview.actionItems && (
                     <div className="mt-3">
                       <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Action Items</p>
                       <p className="text-xs text-foreground bg-muted/50 p-2 rounded-lg border border-border">{interview.actionItems}</p>
                     </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
                  <div className="flex gap-2">
                    {interview.recordingLink && (
                       <a href={interview.recordingLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#8B5CF6] transition-colors">
                         <LinkIcon className="w-3.5 h-3.5" /> Recording
                       </a>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => { setEditItem(interview); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-muted/50"><Edit className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button onClick={() => setDeleteId(interview.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" /></button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <InterviewModal item={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteId(null)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              className="relative glass-card p-6 w-full max-w-sm border border-border">
              <h3 className="text-lg font-semibold mb-2">Delete Interview?</h3>
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

function InterviewModal({ item, onSave, onClose }: { item: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    date: item?.date || new Date().toISOString().split('T')[0],
    platform: item?.platform || 'Pramp',
    type: item?.type || 'DSA',
    score: item?.score || 5,
    feedback: item?.feedback || '',
    actionItems: item?.actionItems || '',
    recordingLink: item?.recordingLink || ''
  });

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative glass-card p-6 w-full max-w-lg border border-border max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{item ? 'Edit Mock Interview' : 'Log Mock Interview'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Date *" type="date" value={form.date} onChange={v => update('date', v)} />
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Type *</label>
              <select value={form.type} onChange={e => update('type', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none cursor-pointer">
                {['DSA', 'System Design', 'Behavioral', 'Machine Coding', 'Frontend', 'Backend'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          
          <InputField label="Platform / Interviewer Name" value={form.platform} onChange={v => update('platform', v)} placeholder="e.g. Pramp, Meetpro, John Doe" />
          
          <div>
             <label className="text-xs text-muted-foreground mb-1.5 block">Score (1-10)</label>
             <input type="range" min={1} max={10} value={form.score} onChange={e => update('score', parseInt(e.target.value) || 1)}
               className="w-full accent-[#8B5CF6]" />
             <span className="text-xs text-[#8B5CF6]">{form.score}/10</span>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Feedback</label>
            <textarea value={form.feedback} onChange={e => update('feedback', e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none resize-none" placeholder="What went well? What didn't?" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Action Items</label>
            <textarea value={form.actionItems} onChange={e => update('actionItems', e.target.value)} rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none resize-none" placeholder="e.g. Practice DP, improve communication..." />
          </div>

          <InputField label="Recording Link" type="url" value={form.recordingLink} onChange={v => update('recordingLink', v)} placeholder="https://..." />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm hover:bg-muted/50">Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => form.date && form.type && onSave(form)}
            className="px-5 py-2.5 rounded-xl text-sm bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white font-medium disabled:opacity-50">
            {item ? 'Update' : 'Log Interview'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder }: { label: string; type?: string; value: any; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50 transition-colors" />
    </div>
  );
}
