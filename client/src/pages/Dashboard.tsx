import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, Code2, BookOpen, RotateCcw, Mic, Briefcase,
  Target, TrendingUp, Flame, Calendar, Zap, Trophy
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { GlassCard } from '@/components/ui/GlassCard';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { StudyHoursChart } from '@/components/charts/StudyHoursChart';
import { DSAProgressChart } from '@/components/charts/DSAProgressChart';
import { SubjectRadarChart } from '@/components/charts/SubjectRadarChart';
import { HeatMap } from '@/components/charts/HeatMap';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardData {
  overallProgress: number;
  interviewReadiness: number;
  faangReadiness: number;
  currentStreak: number;
  daysRemaining: number;
  daysPassed: number;
  targetDays: number;
  totalHours: number;
  weeklyHours: number;
  monthlyHours: number;
  todayHours: number;
  dsaSolved: number;
  dsaTotal: number;
  conceptsLearned: number;
  conceptsTotal: number;
  revisionDue: number;
  mockInterviews: number;
  applicationsSent: number;
  roadmapProgress: number;
  consistency: number;
  avgProductivity: number;
  xp: number;
  level: number;
  goalHoursPerDay: number;
}

// Helper for greeting
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.analytics.dashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return null;

  const todayProgress = data.goalHoursPerDay > 0
    ? Math.min(100, Math.round((data.todayHours / data.goalHoursPerDay) * 100))
    : 0;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good {getGreeting()}, <span className="gradient-text">{user?.name || 'User'}</span> 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Day {data.daysPassed} of {data.targetDays} • {data.daysRemaining} days remaining
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20">
            <Flame className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-sm font-semibold text-[#F59E0B]">{data.currentStreak} day streak</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
            <Zap className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-sm font-semibold text-[#8B5CF6]">Lvl {data.level} • {data.xp} XP</span>
          </div>
        </div>
      </motion.div>

      {/* Progress Rings Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="flex items-center gap-5" glow="primary">
          <ProgressRing value={data.overallProgress} color="#5B8CFF" label="Overall" />
          <div>
            <p className="text-sm font-semibold">Overall Progress</p>
            <p className="text-xs text-muted-foreground mt-1">Across all trackers</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-5" glow="purple">
          <ProgressRing value={data.interviewReadiness} color="#8B5CF6" label="Readiness" />
          <div>
            <p className="text-sm font-semibold">Interview Ready</p>
            <p className="text-xs text-muted-foreground mt-1">Weighted score</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-5" glow="cyan">
          <ProgressRing value={data.faangReadiness} color="#22D3EE" label="FAANG" />
          <div>
            <p className="text-sm font-semibold">FAANG Readiness</p>
            <p className="text-xs text-muted-foreground mt-1">Target: 80%+</p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-5" glow="success">
          <ProgressRing value={todayProgress} color="#22C55E" label="Today" />
          <div>
            <p className="text-sm font-semibold">Today's Progress</p>
            <p className="text-xs text-muted-foreground mt-1">{data.todayHours}h / {data.goalHoursPerDay}h goal</p>
          </div>
        </GlassCard>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Study Hours"
          value={`${data.totalHours}h`}
          subtitle={`${data.weeklyHours}h this week`}
          icon={Clock}
          gradient="blue"
          delay={0}
        />
        <StatCard
          title="DSA Solved"
          value={data.dsaSolved}
          subtitle={`${data.dsaTotal} total tracked`}
          icon={Code2}
          gradient="purple"
          delay={0.05}
        />
        <StatCard
          title="Concepts Learned"
          value={data.conceptsLearned}
          subtitle={`${data.conceptsTotal} total`}
          icon={BookOpen}
          gradient="cyan"
          delay={0.1}
        />
        <StatCard
          title="Revision Due"
          value={data.revisionDue}
          subtitle="Pending reviews"
          icon={RotateCcw}
          gradient={data.revisionDue > 5 ? 'danger' : 'warning'}
          delay={0.15}
        />
        <StatCard
          title="Mock Interviews"
          value={data.mockInterviews}
          subtitle="Completed"
          icon={Mic}
          gradient="success"
          delay={0.2}
        />
        <StatCard
          title="Applications Sent"
          value={data.applicationsSent}
          subtitle="Active applications"
          icon={Briefcase}
          gradient="blue"
          delay={0.25}
        />
        <StatCard
          title="Consistency"
          value={`${data.consistency}%`}
          subtitle={`Avg ${data.avgProductivity}/10 productivity`}
          icon={Target}
          gradient="purple"
          delay={0.3}
        />
        <StatCard
          title="Roadmap Progress"
          value={`${data.roadmapProgress}%`}
          subtitle="Across 12 roadmaps"
          icon={TrendingUp}
          gradient="cyan"
          delay={0.35}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StudyHoursChart />
        <DSAProgressChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SubjectRadarChart />
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-semibold">Achievements</h3>
          </div>
          <AchievementGrid />
        </GlassCard>
      </div>

      {/* Heatmap */}
      <HeatMap />
    </div>
  );
}

function AchievementGrid() {
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    api.gamification.achievements().then(setAchievements).catch(() => {});
  }, []);

  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked).slice(0, 8);

  return (
    <div className="grid grid-cols-4 gap-2">
      {unlocked.map((a) => (
        <motion.div
          key={a.id}
          whileHover={{ scale: 1.1 }}
          className="flex flex-col items-center p-2 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 cursor-default"
          title={a.description}
        >
          <Trophy className="w-5 h-5 text-[#F59E0B] mb-1" />
          <span className="text-[9px] text-center text-[#F59E0B] font-medium leading-tight">{a.name}</span>
        </motion.div>
      ))}
      {locked.map((a) => (
        <motion.div
          key={a.id}
          className="flex flex-col items-center p-2 rounded-lg bg-muted/50 border border-border opacity-40 cursor-default"
          title={a.description}
        >
          <Trophy className="w-5 h-5 text-muted-foreground mb-1" />
          <span className="text-[9px] text-center text-muted-foreground font-medium leading-tight">{a.name}</span>
        </motion.div>
      ))}
    </div>
  );
}

