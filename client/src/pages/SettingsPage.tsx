import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, Upload, Download, Moon, Sun, Monitor, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.settings.get().then(data => {
      setSettings(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      toast.error('Failed to load settings');
    });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    try {
      await api.settings.update(settings.id, settings);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  const handleExport = async () => {
    try {
      const data = await api.export.all();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Backup exported successfully');
    } catch {
      toast.error('Failed to export backup');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Note: Full restore is destructive and dangerous. We should have a confirmation modal.
        // For now, we'll just show a toast that this feature is WIP to prevent accidental deletion.
        toast.info('Database restore feature is currently disabled for safety.', {
           description: 'Please manually replace the SQLite file to restore.'
        });
      } catch (err) {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  if (loading) return <div className="space-y-4 max-w-2xl"><div className="skeleton h-32 rounded-xl" /><div className="skeleton h-64 rounded-xl" /></div>;
  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your goals, preferences, and data.</p>
      </motion.div>

      <GlassCard hover={false} className="p-6">
        <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Goals & Targets</h2>
        <div className="space-y-4">
           <div>
             <label className="text-sm font-medium mb-1 block">Daily Study Goal (Hours)</label>
             <input
               type="number"
               value={settings.goalHoursPerDay}
               onChange={e => setSettings({...settings, goalHoursPerDay: parseFloat(e.target.value) || 0})}
               className="w-full max-w-xs px-4 py-2 rounded-lg bg-muted/50 border border-border outline-none focus:border-[#5B8CFF]/50"
             />
             <p className="text-xs text-muted-foreground mt-1">Your target study hours per day.</p>
           </div>
           <div>
             <label className="text-sm font-medium mb-1 block">Preparation Timeline (Days)</label>
             <input
               type="number"
               value={settings.targetDays}
               onChange={e => setSettings({...settings, targetDays: parseInt(e.target.value) || 0})}
               className="w-full max-w-xs px-4 py-2 rounded-lg bg-muted/50 border border-border outline-none focus:border-[#5B8CFF]/50"
             />
             <p className="text-xs text-muted-foreground mt-1">Usually 90 or 120 days.</p>
           </div>
        </div>

        <h2 className="text-lg font-semibold mb-4 mt-8 border-b border-border pb-2">Preferences</h2>
        <div className="space-y-4">
           <label className="flex items-center gap-3">
             <input
               type="checkbox"
               checked={settings.theme === 'dark'}
               onChange={e => setSettings({...settings, theme: e.target.checked ? 'dark' : 'light'})}
               className="w-4 h-4 rounded accent-[#5B8CFF]"
             />
             <div>
               <p className="text-sm font-medium">Dark Mode Default</p>
               <p className="text-xs text-muted-foreground">Start the app in dark mode.</p>
             </div>
           </label>
           <label className="flex items-center gap-3">
             <input
               type="checkbox"
               checked={settings.emailNotifications}
               onChange={e => setSettings({...settings, emailNotifications: e.target.checked})}
               className="w-4 h-4 rounded accent-[#5B8CFF]"
             />
             <div>
               <p className="text-sm font-medium">Enable Notifications</p>
               <p className="text-xs text-muted-foreground">Get reminded about spaced repetition reviews.</p>
             </div>
           </label>
        </div>

        <div className="mt-8 pt-4 border-t border-border flex justify-end">
           <motion.button
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={handleSave}
             className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white font-medium flex items-center gap-2"
           >
             <Save className="w-4 h-4" /> Save Settings
           </motion.button>
        </div>
      </GlassCard>

      <GlassCard hover={false} className="p-6 border-red-500/20">
        <h2 className="text-lg font-semibold mb-4 text-red-400 border-b border-red-500/20 pb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Data Management
        </h2>
        <p className="text-sm text-muted-foreground mb-4">Export all your data as a JSON file, or restore from a previous backup. Keep your data safe.</p>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-muted/50 border border-border hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" /> Export Backup
          </motion.button>

          <label className="px-4 py-2 rounded-xl bg-muted/50 border border-border hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm cursor-pointer">
            <Upload className="w-4 h-4" /> Restore Backup
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </GlassCard>
    </div>
  );
}
