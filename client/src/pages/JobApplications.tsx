import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, ExternalLink, Calendar, Building, DollarSign, MapPin, Edit, Trash2, X, BarChart2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const STATUSES = ['Applied', 'Phone Screen', 'Technical', 'Onsite', 'Offer', 'Rejected', 'Withdrawn'];

export default function JobApplications() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [jobsData, statsData] = await Promise.all([
        api.jobs.getAll(),
        api.jobs.stats()
      ]);
      setJobs(jobsData);
      setStats(statsData);
    } catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (formData: any) => {
    try {
      if (editItem) {
        await api.jobs.update(editItem.id, formData);
        toast.success('Application updated');
      } else {
        await api.jobs.create(formData);
        toast.success('Application added');
        await api.gamification.addXP(15, 'job_application');
      }
      setShowModal(false);
      setEditItem(null);
      fetchData();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.jobs.delete(deleteId);
      toast.success('Application deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
    setDeleteId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Offer': return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20';
      case 'Rejected': case 'Withdrawn': return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
      case 'Applied': return 'text-muted-foreground bg-muted/50 border-border';
      default: return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20'; // Phone Screen, Technical, Onsite
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your pipeline and interview process.</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Application
        </motion.button>
      </motion.div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#5B8CFF]/10 text-[#5B8CFF]"><Briefcase className="w-5 h-5" /></div>
              <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Applications</p></div>
            </div>
          </GlassCard>
          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]"><BarChart2 className="w-5 h-5" /></div>
              <div><p className="text-2xl font-bold">{stats.total - (stats.offers + stats.rejected)}</p><p className="text-xs text-muted-foreground">In Progress</p></div>
            </div>
          </GlassCard>
          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#22C55E]/10 text-[#22C55E]"><Building className="w-5 h-5" /></div>
              <div><p className="text-2xl font-bold">{stats.offers}</p><p className="text-xs text-muted-foreground">Offers</p></div>
            </div>
          </GlassCard>
          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#EF4444]/10 text-[#EF4444]"><X className="w-5 h-5" /></div>
              <div><p className="text-2xl font-bold">{stats.rejected}</p><p className="text-xs text-muted-foreground">Rejected</p></div>
            </div>
          </GlassCard>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {Array.from({length: 6}).map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No Applications Yet" description="Keep track of your job search pipeline here." action={{ label: 'Add Application', onClick: () => { setEditItem(null); setShowModal(true); } }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-5 flex flex-col h-full group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{job.role}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                      <Building className="w-3.5 h-3.5" /> <span className="text-sm font-medium">{job.company}</span>
                    </div>
                  </div>
                  <span className={cn('text-xs px-2.5 py-1 rounded-full border', getStatusColor(job.status))}>
                    {job.status}
                  </span>
                </div>

                <div className="space-y-2 mt-2 mb-4 flex-1">
                  {job.location && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" /> <span>{job.location}</span>
                    </div>
                  )}
                  {job.package && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <DollarSign className="w-3.5 h-3.5" /> <span>{job.package}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> <span>Applied {formatDate(job.appliedDate)}</span>
                  </div>
                  {job.interviewRound && (
                     <div className="flex items-center gap-2 text-xs text-[#5B8CFF]">
                       <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-[#5B8CFF]/20 text-[8px] font-bold">R</span>
                       <span>Current Round: {job.interviewRound}</span>
                     </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
                  <span className="text-[10px] text-muted-foreground truncate pr-2">
                    {job.notes ? job.notes.substring(0, 40) + '...' : 'No notes'}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => { setEditItem(job); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-muted/50"><Edit className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button onClick={() => setDeleteId(job.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" /></button>
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
          <JobModal item={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} />
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
              <h3 className="text-lg font-semibold mb-2">Delete Application?</h3>
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

function JobModal({ item, onSave, onClose }: { item: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    company: item?.company || '', role: item?.role || '', package: item?.package || '',
    location: item?.location || '', appliedDate: item?.appliedDate || new Date().toISOString().split('T')[0],
    status: item?.status || 'Applied', interviewRound: item?.interviewRound || '',
    offer: item?.offer || false, rejected: item?.rejected || false, notes: item?.notes || ''
  });

  const update = (field: string, value: any) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      // Auto-sync offer/rejected with status
      if (field === 'status') {
        next.offer = value === 'Offer';
        next.rejected = value === 'Rejected' || value === 'Withdrawn';
      }
      return next;
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative glass-card p-6 w-full max-w-2xl border border-border max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{item ? 'Edit Application' : 'Add Application'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Company *" value={form.company} onChange={v => update('company', v)} placeholder="e.g. Google" />
          <InputField label="Role *" value={form.role} onChange={v => update('role', v)} placeholder="e.g. Frontend Engineer" />
          <InputField label="Package/Salary" value={form.package} onChange={v => update('package', v)} placeholder="e.g. $150k" />
          <InputField label="Location" value={form.location} onChange={v => update('location', v)} placeholder="e.g. Remote, NY" />
          <InputField label="Applied Date" type="date" value={form.appliedDate} onChange={v => update('appliedDate', v)} />
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
            <select value={form.status} onChange={e => update('status', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none cursor-pointer">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <InputField label="Current Interview Round" value={form.interviewRound} onChange={v => update('interviewRound', v)} placeholder="e.g. Round 2 - System Design" />
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1.5 block">Notes</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none resize-none" placeholder="Interviewer names, topics to prepare..." />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm hover:bg-muted/50">Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => form.company && form.role && onSave(form)}
            disabled={!form.company || !form.role}
            className="px-5 py-2.5 rounded-xl text-sm bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white font-medium disabled:opacity-50">
            {item ? 'Update' : 'Add Application'}
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
