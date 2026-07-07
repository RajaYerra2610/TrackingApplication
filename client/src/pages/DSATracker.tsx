import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender, type ColumnDef, type SortingState
} from '@tanstack/react-table';
import {
  Code2, Plus, Search, Filter, Star, Bookmark, ExternalLink,
  Trash2, Edit, ChevronLeft, ChevronRight, Upload, Download, X
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TOPICS = ['Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Trees', 'Graphs', 'Dynamic Programming', 'Greedy', 'Backtracking', 'Binary Search', 'Two Pointers', 'Sliding Window', 'Heap', 'Trie', 'Bit Manipulation', 'Math', 'Sorting', 'Hashing', 'Recursion'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const STATUSES = ['Unsolved', 'Solved', 'Attempted', 'Review'];
const PLATFORMS = ['LeetCode', 'HackerRank', 'CodeForces', 'CodeChef', 'GeeksForGeeks', 'InterviewBit', 'Other'];

export default function DSATracker() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  const fetchData = async () => {
    try {
      const params: Record<string, string> = {};
      if (filterTopic) params.topic = filterTopic;
      if (filterDifficulty) params.difficulty = filterDifficulty;
      const data = await api.dsa.getAll(params);
      setProblems(data);
    } catch (error) {
      toast.error('Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterTopic, filterDifficulty]);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'favorite',
      header: '',
      size: 40,
      cell: ({ row }) => (
        <button onClick={() => toggleFavorite(row.original)}>
          <Star className={cn('w-4 h-4', row.original.favorite ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-muted-foreground/30')} />
        </button>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Problem',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{row.original.name}</span>
          {row.original.leetcodeLink && (
            <a href={row.original.leetcodeLink} target="_blank" rel="noreferrer" className="text-muted-foreground/50 hover:text-[#5B8CFF]">
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {row.original.bookmark && <Bookmark className="w-3 h-3 fill-[#5B8CFF] text-[#5B8CFF]" />}
        </div>
      ),
    },
    {
      accessorKey: 'topic',
      header: 'Topic',
      cell: ({ getValue }) => (
        <span className="text-xs px-2 py-1 rounded-full bg-muted/50 border border-border">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'difficulty',
      header: 'Difficulty',
      cell: ({ getValue }) => {
        const d = getValue() as string;
        const colors: Record<string, string> = {
          Easy: 'text-[#22C55E] bg-[#22C55E]/10',
          Medium: 'text-[#F59E0B] bg-[#F59E0B]/10',
          Hard: 'text-[#EF4444] bg-[#EF4444]/10',
        };
        return <span className={cn('text-xs px-2 py-1 rounded-full font-medium', colors[d])}>{d}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue() as string;
        const colors: Record<string, string> = {
          Solved: 'text-[#22C55E] bg-[#22C55E]/10',
          Attempted: 'text-[#F59E0B] bg-[#F59E0B]/10',
          Unsolved: 'text-muted-foreground bg-muted/50',
          Review: 'text-[#8B5CF6] bg-[#8B5CF6]/10',
        };
        return <span className={cn('text-xs px-2 py-1 rounded-full font-medium', colors[s])}>{s}</span>;
      },
    },
    {
      accessorKey: 'confidence',
      header: 'Confidence',
      cell: ({ getValue }) => {
        const v = getValue() as number;
        return (
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={cn('w-2 h-5 rounded-sm', i <= v ? 'bg-[#5B8CFF]' : 'bg-muted/50')} />
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'timeTaken',
      header: 'Time',
      cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{getValue() as number}min</span>,
    },
    {
      id: 'actions',
      header: '',
      size: 80,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button onClick={() => { setEditItem(row.original); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-muted/50">
            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => setDeleteId(row.original.id)} className="p-1.5 rounded-lg hover:bg-red-500/10">
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
          </button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: problems,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  const toggleFavorite = async (item: any) => {
    try {
      await api.dsa.update(item.id, { favorite: !item.favorite });
      fetchData();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.dsa.delete(deleteId);
      toast.success('Problem deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
    setDeleteId(null);
  };

  const handleSave = async (formData: any) => {
    try {
      if (editItem) {
        await api.dsa.update(editItem.id, formData);
        toast.success('Problem updated');
      } else {
        await api.dsa.create(formData);
        toast.success('Problem added');
        await api.gamification.addXP(10, 'dsa_add');
      }
      setShowModal(false);
      setEditItem(null);
      fetchData();
    } catch { toast.error('Failed to save'); }
  };

  if (loading) return <TableSkeleton rows={10} />;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">DSA Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">{problems.length} problems tracked</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => api.export.excel('dsa')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border text-sm hover:bg-muted/50 transition-colors">
            <Download className="w-4 h-4" /> Export
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Problem
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text" placeholder="Search problems..."
            value={globalFilter} onChange={e => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50 transition-colors"
          />
        </div>
        <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none cursor-pointer appearance-none">
          <option value="">All Topics</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none cursor-pointer appearance-none">
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      {problems.length === 0 ? (
        <EmptyState icon={Code2} title="No Problems Yet" description="Start adding DSA problems to track your progress" action={{ label: 'Add First Problem', onClick: () => { setEditItem(null); setShowModal(true); } }} />
      ) : (
        <GlassCard hover={false} className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id} className="border-b border-border">
                    {hg.headers.map(h => (
                      <th key={h.id} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                        onClick={h.column.getToggleSortingHandler()}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, i) => (
                  <motion.tr key={row.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border hover:bg-muted/50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex gap-1">
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded-lg hover:bg-muted/50 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
                className="p-1.5 rounded-lg hover:bg-muted/50 disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <DSAModal
            item={editItem}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditItem(null); }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteId(null)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="relative glass-card p-6 w-full max-w-sm border border-border">
              <h3 className="text-lg font-semibold mb-2">Delete Problem?</h3>
              <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl text-sm hover:bg-muted/50">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-sm bg-[#EF4444] text-white hover:bg-[#EF4444]/90">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DSAModal({ item, onSave, onClose }: { item: any; onSave: (data: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    leetcodeLink: item?.leetcodeLink || '',
    platform: item?.platform || 'LeetCode',
    topic: item?.topic || 'Arrays',
    difficulty: item?.difficulty || 'Medium',
    solvedDate: item?.solvedDate || new Date().toISOString().split('T')[0],
    timeTaken: item?.timeTaken || 30,
    confidence: item?.confidence || 3,
    status: item?.status || 'Solved',
    favorite: item?.favorite || false,
    bookmark: item?.bookmark || false,
    tags: item?.tags || '',
    notes: item?.notes || '',
  });

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative glass-card p-6 w-full max-w-2xl border border-border max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{item ? 'Edit Problem' : 'Add Problem'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1.5 block">Problem Name *</label>
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50" placeholder="Two Sum" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1.5 block">LeetCode Link</label>
            <input type="url" value={form.leetcodeLink} onChange={e => update('leetcodeLink', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50" placeholder="https://leetcode.com/problems/..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Platform</label>
            <select value={form.platform} onChange={e => update('platform', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none cursor-pointer">
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Topic</label>
            <select value={form.topic} onChange={e => update('topic', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none cursor-pointer">
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => update('difficulty', d)}
                  className={cn('flex-1 py-2 rounded-xl text-xs font-medium border transition-colors',
                    form.difficulty === d ? d === 'Easy' ? 'bg-[#22C55E]/20 border-[#22C55E]/30 text-[#22C55E]' : d === 'Medium' ? 'bg-[#F59E0B]/20 border-[#F59E0B]/30 text-[#F59E0B]' : 'bg-[#EF4444]/20 border-[#EF4444]/30 text-[#EF4444]' : 'bg-muted/50 border-border'
                  )}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
            <select value={form.status} onChange={e => update('status', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none cursor-pointer">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Solved Date</label>
            <input type="date" value={form.solvedDate} onChange={e => update('solvedDate', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Time Taken (min)</label>
            <input type="number" value={form.timeTaken} onChange={e => update('timeTaken', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Confidence (1-5)</label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} onClick={() => update('confidence', i)}
                  className={cn('flex-1 h-8 rounded-lg border transition-colors',
                    i <= form.confidence ? 'bg-[#5B8CFF]/20 border-[#5B8CFF]/30' : 'bg-muted/50 border-border'
                  )}>
                  <span className="text-xs">{i}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1.5 block">Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={e => update('tags', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50" placeholder="hash-map, two-pointer" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1.5 block">Notes</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm outline-none focus:border-[#5B8CFF]/50 resize-none" placeholder="Key insights, approach used..." />
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.favorite} onChange={e => update('favorite', e.target.checked)} className="rounded" />
              <Star className="w-4 h-4 text-[#F59E0B]" /> <span className="text-sm">Favorite</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.bookmark} onChange={e => update('bookmark', e.target.checked)} className="rounded" />
              <Bookmark className="w-4 h-4 text-[#5B8CFF]" /> <span className="text-sm">Bookmark</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm hover:bg-muted/50 transition-colors">Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => form.name && onSave(form)}
            disabled={!form.name}
            className="px-5 py-2.5 rounded-xl text-sm bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white font-medium disabled:opacity-50">
            {item ? 'Update' : 'Add Problem'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
