import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Trash2, Edit, X, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SUBJECTS = ['JavaScript', 'React', 'Node.js', 'SQL', 'Python', 'Docker', 'System Design', 'DSA', 'TypeScript', 'MongoDB', 'Redis', 'GraphQL', 'AWS', 'CI/CD', 'Testing'];

export default function ConceptTracker() {
  const [concepts, setConcepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try { const data = await api.concepts.getAll(); setConcepts(data); const subjects = new Set(data.map((c: any) => c.subject)); setExpandedSubjects(subjects); }
    catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const grouped = concepts.reduce((acc, c) => { if (!acc[c.subject]) acc[c.subject] = []; acc[c.subject].push(c); return acc; }, {} as Record<string, any[]>);

  const handleSave = async (formData: any) => {
    try {
      if (editItem) { await api.concepts.update(editItem.id, formData); toast.success('Updated'); }
      else { await api.concepts.create(formData); toast.success('Added'); await api.gamification.addXP(10, 'concept_add'); }
      setShowModal(false); setEditItem(null); fetchData();
    } catch { toast.error('Failed'); }
  };

  const toggleComplete = async (concept: any) => {
    try { await api.concepts.update(concept.id, { completed: !concept.completed }); if (!concept.completed) await api.gamification.addXP(5, 'concept_complete'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string) => {
    try { await api.concepts.delete(id); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6 max-w-[1000px]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Concept Tracker</h1><p className="text-sm text-muted-foreground mt-1">{concepts.filter(c => c.completed).length}/{concepts.length} concepts mastered</p></div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setEditItem(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Concept
        </motion.button>
      </motion.div>

      {concepts.length === 0 ? (
        <EmptyState icon={BookOpen} title="No Concepts" description="Start tracking concepts you learn" action={{ label: 'Add Concept', onClick: () => setShowModal(true) }} />
      ) : (
        Object.entries(grouped).map(([subject, rawItems]) => {
          const items = rawItems as any[];
          const completed = items.filter((c: any) => c.completed).length;
          const progress = Math.round((completed / items.length) * 100);
          const isExpanded = expandedSubjects.has(subject);
          return (
            <GlassCard key={subject} hover={false} className="p-0 overflow-hidden">
              <button onClick={() => { const next = new Set(expandedSubjects); isExpanded ? next.delete(subject) : next.add(subject); setExpandedSubjects(next); }}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <div><h3 className="text-sm font-semibold">{subject}</h3><p className="text-xs text-muted-foreground">{completed}/{items.length}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[#5B8CFF]">{progress}%</span>
                  <div className="w-24 h-1.5 bg-muted/50 rounded-full overflow-hidden"><div className="h-full rounded-full bg-[#5B8CFF]" style={{ width: `${progress}%` }} /></div>
                </div>
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
                    {items.map((concept: any) => (
                      <div key={concept.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 group">
                        <button onClick={() => toggleComplete(concept)} className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0', concept.completed ? 'bg-[#22C55E] border-transparent' : 'border-border')}>
                          {concept.completed && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <div className="flex-1">
                          <span className={cn('text-sm', concept.completed && 'line-through text-muted-foreground')}>{concept.concept}</span>
                          <div className="flex gap-2 mt-0.5">
                            {concept.interviewReady && <span className="text-[10px] text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded-full">Interview Ready</span>}
                            <span className="text-[10px] text-muted-foreground">Confidence: {concept.confidence}/5</span>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditItem(concept); setShowModal(true); }} className="p-1 rounded hover:bg-muted/50"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(concept.id)} className="p-1 rounded hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          );
        })
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); setEditItem(null); }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="relative glass-card p-6 w-full max-w-lg border border-border">
              <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold">{editItem ? 'Edit' : 'Add'} Concept</h2><button onClick={() => { setShowModal(false); setEditItem(null); }}><X className="w-4 h-4" /></button></div>
              <ConceptForm item={editItem} onSave={handleSave} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConceptForm({ item, onSave }: { item: any; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ subject: item?.subject || 'JavaScript', concept: item?.concept || '', confidence: item?.confidence || 3, interviewReady: item?.interviewReady || false, resourceLink: item?.resourceLink || '', notes: item?.notes || '', started: item?.started ?? true, completed: item?.completed || false });
  const update = (f: string, v: any) => setForm(p => ({ ...p, [f]: v }));
  return (
    <div className="space-y-4">
      <div><label className="text-xs text-muted-foreground mb-1.5 block">Subject</label>
        <select value={form.subject} onChange={e => update('subject', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none">{SUBJECTS.map(s => <option key={s}>{s}</option>)}</select></div>
      <div><label className="text-xs text-muted-foreground mb-1.5 block">Concept Name *</label>
        <input value={form.concept} onChange={e => update('concept', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50" /></div>
      <div><label className="text-xs text-muted-foreground mb-1.5 block">Confidence (1-5)</label>
        <div className="flex gap-2">{[1,2,3,4,5].map(i => <button key={i} onClick={() => update('confidence', i)} className={cn('flex-1 py-2 rounded-xl text-xs border', i <= form.confidence ? 'bg-[#5B8CFF]/20 border-[#5B8CFF]/30 text-[#5B8CFF]' : 'bg-muted/50 border-border')}>{i}</button>)}</div></div>
      <div><label className="text-xs text-muted-foreground mb-1.5 block">Resource Link</label>
        <input value={form.resourceLink} onChange={e => update('resourceLink', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50" /></div>
      <div><label className="text-xs text-muted-foreground mb-1.5 block">Notes</label>
        <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none resize-none" /></div>
      <label className="flex items-center gap-2"><input type="checkbox" checked={form.interviewReady} onChange={e => update('interviewReady', e.target.checked)} /><span className="text-sm">Interview Ready</span></label>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => form.concept && onSave(form)} disabled={!form.concept}
        className="w-full py-2.5 rounded-xl text-sm bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white font-medium disabled:opacity-50">{item ? 'Update' : 'Add'}</motion.button>
    </div>
  );
}
