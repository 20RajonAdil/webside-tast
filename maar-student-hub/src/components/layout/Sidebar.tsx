import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  NotebookPen,
  ListChecks,
  Target,
  Timer,
  Layers,
  LineChart,
  Wrench,
  Sparkles,
  FolderClosed,
  Trophy,
  Settings,
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/timetable', label: 'Timetable', icon: CalendarDays, end: false },
  { to: '/notes', label: 'Notes', icon: NotebookPen, end: false },
  { to: '/homework', label: 'Homework', icon: ListChecks, end: false },
  { to: '/planner', label: 'Study Planner', icon: Target, end: false },
  { to: '/focus', label: 'Focus Room', icon: Timer, end: false },
  { to: '/flashcards', label: 'Flashcards', icon: Layers, end: false },
  { to: '/grades', label: 'Grade Tracker', icon: LineChart, end: false },
  { to: '/tools', label: 'Study Tools', icon: Wrench, end: false },
  { to: '/assistant', label: 'Study Assistant', icon: Sparkles, end: false },
  { to: '/files', label: 'Files', icon: FolderClosed, end: false },
  { to: '/achievements', label: 'Achievements', icon: Trophy, end: false },
] as const;

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-100 bg-white px-3 py-5 dark:border-navy-800 dark:bg-navy-900 md:flex">
      <div className="px-2 pb-6">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-0.5" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-navy-50 text-navy-800 dark:bg-navy-800 dark:text-white'
                  : 'text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-navy-800/60'
              }`
            }
          >
            <Icon className="size-4.5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors ${
            isActive ? 'bg-navy-50 text-navy-800 dark:bg-navy-800 dark:text-white' : 'text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-navy-800/60'
          }`
        }
      >
        <Settings className="size-4.5" aria-hidden="true" />
        Settings
      </NavLink>
    </aside>
  );
}

export { NAV_ITEMS };
