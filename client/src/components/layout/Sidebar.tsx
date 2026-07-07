import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, CalendarDays, ListChecks, Code2, BookOpen,
  RotateCcw, FileCode, Atom, Server, Database, Container,
  PenTool, Layers, Network, Cpu, Mic, FileText,
  Briefcase, BarChart3, TrendingUp, Settings, ChevronLeft,
  ChevronRight, Zap, GraduationCap, Calendar, Rocket, LogOut
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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

const navSections = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: "Today's Planner", icon: CalendarDays, path: '/today' },
      { label: 'Daily Tracker', icon: ListChecks, path: '/daily' },
    ],
  },
  {
    title: 'Trackers',
    items: [
      { label: 'DSA Tracker', icon: Code2, path: '/dsa' },
      { label: 'Concept Tracker', icon: BookOpen, path: '/concepts' },
      { label: 'Revision Planner', icon: RotateCcw, path: '/revisions' },
    ],
  },
  {
    title: 'Roadmaps',
    items: [
      { label: 'JavaScript', icon: FileCode, path: '/roadmap/javascript' },
      { label: 'React', icon: Atom, path: '/roadmap/react' },
      { label: 'Node.js', icon: Server, path: '/roadmap/node' },
      { label: 'SQL', icon: Database, path: '/roadmap/sql' },
      { label: 'Python', icon: PenTool, path: '/roadmap/python' },
      { label: 'Docker', icon: Container, path: '/roadmap/docker' },
      { label: 'FastAPI', icon: Zap, path: '/roadmap/fastapi' },
      { label: 'Next.js', icon: Layers, path: '/roadmap/nextjs' },
      { label: 'CI/CD', icon: Rocket, path: '/roadmap/cicd' },
      { label: 'LLD', icon: Network, path: '/roadmap/lld' },
      { label: 'HLD', icon: Cpu, path: '/roadmap/hld' },
      { label: 'System Design', icon: GraduationCap, path: '/roadmap/system-design' },
    ],
  },
  {
    title: 'Career',
    items: [
      { label: 'Mock Interviews', icon: Mic, path: '/mock-interviews' },
      { label: 'Resume Tracker', icon: FileText, path: '/resumes' },
      { label: 'GitHub Projects', icon: Github, path: '/github' },
      { label: 'Job Applications', icon: Briefcase, path: '/jobs' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Weekly Report', icon: BarChart3, path: '/reports/weekly' },
      { label: 'Monthly Report', icon: TrendingUp, path: '/reports/monthly' },
      { label: 'Settings', icon: Settings, path: '/settings' },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border bg-background/80 backdrop-blur-xl"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <motion.div
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] flex items-center justify-center flex-shrink-0"
          whileHover={{ rotate: 10 }}
        >
          <Zap className="w-5 h-5 text-white" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <h1 className="text-sm font-bold tracking-tight whitespace-nowrap">Interview Tracker</h1>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">Pro</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.title}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2 px-3"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'sidebar-item group relative',
                      isActive && 'active',
                      collapsed && 'justify-center px-0'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-[#5B8CFF]/10 rounded-lg border border-[#5B8CFF]/20"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon className={cn(
                      'w-4.5 h-4.5 flex-shrink-0 relative z-10',
                      isActive ? 'text-[#5B8CFF]' : 'text-muted-foreground group-hover:text-foreground'
                    )} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="relative z-10 text-[13px] whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-[#0F172A] border border-white/10 rounded-md text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse & Logout Button */}
      <div className="border-t border-border p-3 space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center p-2 rounded-lg text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-colors group"
        >
          <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3 text-[13px] whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-[#0F172A] border border-white/10 rounded-md text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Logout
            </div>
          )}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
