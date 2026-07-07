import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Sun, Moon, Plus, Command } from 'lucide-react';
import { api } from '@/lib/api';
import { useThemeStore } from '@/store/themeStore';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuth();

  useEffect(() => {
    api.notifications.unreadCount().then(data => setUnreadCount(data.count)).catch(() => {});
  }, []);

  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6">
        {/* Left - Page context */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border text-muted-foreground text-sm hover:border-muted-foreground/30 transition-colors w-64"
          >
            <Search className="w-4 h-4" />
            <span>Search anything...</span>
            <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground/50">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </motion.button>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Add */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="p-2 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
            </motion.button>

            <AnimatePresence>
              {showAddMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    <div className="p-1">
                      <button onClick={() => window.location.href = '/jobs'} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
                        Add Job Application
                      </button>
                      <button onClick={() => window.location.href = '/dsa'} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
                        Add DSA Problem
                      </button>
                      <button onClick={() => window.location.href = '/concepts'} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
                        Add Concept
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-muted/50 border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <AnimatePresence mode="wait">
              {theme === 'dark' ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <Sun className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <Moon className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2.5 rounded-xl bg-muted/50 border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full text-[9px] font-bold text-white flex items-center justify-center"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* User Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B8CFF] to-[#22D3EE] flex items-center justify-center text-white text-sm font-bold cursor-pointer"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </motion.div>
        </div>
      </header>

      {/* Command Palette */}
      <AnimatePresence>
        {searchOpen && (
          <CommandPalette onClose={() => setSearchOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');

  const commands = [
    { label: 'Go to Dashboard', shortcut: 'D', action: () => { window.location.href = '/'; onClose(); } },
    { label: 'Go to DSA Tracker', shortcut: 'S', action: () => { window.location.href = '/dsa'; onClose(); } },
    { label: 'Go to Daily Tracker', shortcut: 'T', action: () => { window.location.href = '/daily'; onClose(); } },
    { label: 'Go to Concepts', shortcut: 'C', action: () => { window.location.href = '/concepts'; onClose(); } },
    { label: 'Go to Revision Planner', shortcut: 'R', action: () => { window.location.href = '/revisions'; onClose(); } },
    { label: 'Go to Job Applications', shortcut: 'J', action: () => { window.location.href = '/jobs'; onClose(); } },
    { label: 'Go to Mock Interviews', shortcut: 'M', action: () => { window.location.href = '/mock-interviews'; onClose(); } },
    { label: 'Go to Settings', shortcut: ',', action: () => { window.location.href = '/settings'; onClose(); } },
  ];

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg glass-card border border-border shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, pages..."
            className="flex-1 py-4 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/50"
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
          <kbd className="text-[10px] text-muted-foreground/40 bg-muted/50 px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.map((cmd, i) => (
            <motion.button
              key={cmd.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={cmd.action}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <span>{cmd.label}</span>
              <kbd className="text-[10px] text-muted-foreground/40 bg-muted/50 px-1.5 py-0.5 rounded">
                {cmd.shortcut}
              </kbd>
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No results found</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
