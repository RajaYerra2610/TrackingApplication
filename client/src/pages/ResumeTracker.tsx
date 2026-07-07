import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, FileText, Download, Upload, Trash2, Edit, X, Briefcase, Eye } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function ResumeTracker() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const data = await api.resumes.getAll();
      setResumes(data);
    } catch { toast.error('Failed to load resumes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (formData: any) => {
    try {
      if (editItem) {
        await api.resumes.update(editItem.id, formData);
        toast.success('Resume updated');
      } else {
        await api.resumes.create(formData);
        toast.success('Resume added');
      }
      setShowModal(false);
      setEditItem(null);
      fetchData();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.resumes.delete(deleteId);
      toast.success('Resume deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 max-w-[1000px]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resume Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage different resume versions for various roles.</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Resume
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {Array.from({length: 3}).map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState icon={FileText} title="No Resumes Yet" description="Keep track of your resume versions here." action={{ label: 'Add Resume', onClick: () => setShowModal(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume, i) => (
            <motion.div key={resume.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-5 flex flex-col h-full group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#5B8CFF]/10 text-[#5B8CFF]"><FileText className="w-6 h-6" /></div>
                    <div>
                      <h3 className="font-bold text-base leading-tight">{resume.versionName}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Target: {resume.targetRole}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-2 mb-4 flex-1">
                  <p className="text-xs text-muted-foreground">Updated: {formatDate(resume.lastUpdated)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded border border-[#5B8CFF]/30 bg-[#5B8CFF]/10 text-[#5B8CFF]">ATS Score: {resume.atsScore}%</span>
                  </div>
                  {resume.notes && <p className="text-xs text-muted-foreground line-clamp-2 mt-3 italic">"{resume.notes}"</p>}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
                  <div className="flex gap-2">
                    {resume.driveLink && (
                       <a href={resume.driveLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#5B8CFF] transition-colors">
                         <Eye className="w-3.5 h-3.5" /> View
                       </a>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditItem(resume); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-muted/50"><Edit className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button onClick={() => setDeleteId(resume.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" /></button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <ResumeModal item={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteId(null)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              className="relative glass-card p-6 w-full max-w-sm border border-border">
              <h3 className="text-lg font-semibold mb-2">Delete Resume?</h3>
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

function ResumeModal({ item, onSave, onClose }: { item: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    versionName: item?.versionName || '',
    targetRole: item?.targetRole || '',
    driveLink: item?.driveLink || '',
    atsScore: item?.atsScore || 0,
    notes: item?.notes || '',
    lastUpdated: item?.lastUpdated || new Date().toISOString().split('T')[0]
  });

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative glass-card p-6 w-full max-w-lg border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{item ? 'Edit Resume' : 'Add Resume'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <InputField label="Version Name *" value={form.versionName} onChange={v => update('versionName', v)} placeholder="e.g. Frontend V2" />
          <InputField label="Target Role *" value={form.targetRole} onChange={v => update('targetRole', v)} placeholder="e.g. Senior Frontend Engineer" />
          <InputField label="Link (Google Drive/PDF)" type="url" value={form.driveLink} onChange={v => update('driveLink', v)} placeholder="https://..." />
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Estimated ATS Score (0-100)</label>
            <input type="number" min={0} max={100} value={form.atsScore} onChange={e => update('atsScore', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Notes</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none resize-none" placeholder="Tailored for React/Next.js roles..." />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm hover:bg-muted/50">Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => form.versionName && form.targetRole && onSave(form)}
            disabled={!form.versionName || !form.targetRole}
            className="px-5 py-2.5 rounded-xl text-sm bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white font-medium disabled:opacity-50">
            {item ? 'Update' : 'Add Resume'}
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
