import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ExternalLink, Trash2, Edit, X, Star, GitFork, Activity } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const Github = ({ className }: { className?: string }) => (
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
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function GitHubProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const data = await api.github.getAll();
      setProjects(data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (formData: any) => {
    try {
      if (editItem) {
        await api.github.update(editItem.id, formData);
        toast.success('Project updated');
      } else {
        await api.github.create(formData);
        toast.success('Project added');
      }
      setShowModal(false);
      setEditItem(null);
      fetchData();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.github.delete(deleteId);
      toast.success('Project deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 max-w-[1000px]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">GitHub Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Showcase your portfolio and open-source contributions.</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Project
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {Array.from({length: 3}).map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState icon={Github} title="No Projects Yet" description="Track your top projects to show off to recruiters." action={{ label: 'Add Project', onClick: () => setShowModal(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, i) => (
            <motion.div key={project.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-5 flex flex-col h-full group">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-muted/50 border border-border text-foreground"><Github className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-bold text-base leading-tight">{project.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{project.isPinned ? '📌 Pinned' : 'Public Repository'}</p>
                    </div>
                  </div>
                  {project.demoLink && (
                    <a href={project.demoLink} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-full border border-border text-xs font-medium hover:bg-muted/50 transition-colors flex items-center gap-1">
                      Demo <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mt-3 mb-4 line-clamp-2">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.techStack.split(',').map((tech: string) => (
                     <span key={tech.trim()} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 border border-border text-muted-foreground">{tech.trim()}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
                  <div className="flex items-center gap-4">
                     {project.stars > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="w-3.5 h-3.5" /> {project.stars}</span>}
                     {project.forks > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><GitFork className="w-3.5 h-3.5" /> {project.forks}</span>}
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {project.repoLink && (
                       <a href={project.repoLink} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-muted/50"><ExternalLink className="w-3.5 h-3.5 text-muted-foreground" /></a>
                    )}
                    <button onClick={() => { setEditItem(project); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-muted/50"><Edit className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button onClick={() => setDeleteId(project.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" /></button>
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
          <ProjectModal item={editItem} onSave={handleSave} onClose={() => { setShowModal(false); setEditItem(null); }} />
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
              <h3 className="text-lg font-semibold mb-2">Delete Project?</h3>
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

function ProjectModal({ item, onSave, onClose }: { item: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    repoLink: item?.repoLink || '',
    demoLink: item?.demoLink || '',
    description: item?.description || '',
    techStack: item?.techStack || '',
    stars: item?.stars || 0,
    forks: item?.forks || 0,
    isPinned: item?.isPinned || false
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
          <h2 className="text-lg font-bold">{item ? 'Edit Project' : 'Add Project'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <InputField label="Project Name *" value={form.name} onChange={v => update('name', v)} placeholder="e.g. Interview Tracker Pro" />
          
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Repository Link" type="url" value={form.repoLink} onChange={v => update('repoLink', v)} placeholder="https://github.com/..." />
            <InputField label="Live Demo Link" type="url" value={form.demoLink} onChange={v => update('demoLink', v)} placeholder="https://..." />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none resize-none" placeholder="A brief description of what this project does." />
          </div>

          <InputField label="Tech Stack (comma-separated)" value={form.techStack} onChange={v => update('techStack', v)} placeholder="React, Node.js, Tailwind..." />
          
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs text-muted-foreground mb-1.5 block">Stars</label>
               <input type="number" min={0} value={form.stars} onChange={e => update('stars', parseInt(e.target.value) || 0)}
                 className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50" />
             </div>
             <div>
               <label className="text-xs text-muted-foreground mb-1.5 block">Forks</label>
               <input type="number" min={0} value={form.forks} onChange={e => update('forks', parseInt(e.target.value) || 0)}
                 className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50" />
             </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
             <input type="checkbox" checked={form.isPinned} onChange={e => update('isPinned', e.target.checked)} className="rounded" />
             <span className="text-sm">Pin this project to highlight it</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm hover:bg-muted/50">Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => form.name && onSave(form)}
            disabled={!form.name}
            className="px-5 py-2.5 rounded-xl text-sm bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white font-medium disabled:opacity-50">
            {item ? 'Update' : 'Add Project'}
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
