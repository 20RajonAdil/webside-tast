import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Flame, NotebookPen, Timer, ListChecks, CalendarClock, ArrowRight } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useDashboardData } from './useDashboardData';

const EVENT_TYPE_LABEL: Record<string, string> = {
  LESSON: 'Lesson',
  REVISION: 'Revision',
  EXAM: 'Exam',
  HOMEWORK: 'Homework',
  WORK_SHIFT: 'Work',
  REMINDER: 'Reminder',
  EVENT: 'Event',
};

export function DashboardPage() {
  const { profile } = useAuthStore();
  const { todaysEvents, todaysHomework, upcomingDeadlines, recentNotes, currentStreak, isLoading, error } =
    useDashboardData();

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
            {greeting}, {firstName}.
          </h2>
          <p className="text-sm text-ink-500 dark:text-ink-400">Here's where things stand today.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-sm font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Flame className="size-4" aria-hidden="true" />
          {currentStreak} day{currentStreak === 1 ? '' : 's'} streak
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {error}
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link to="/notes">
          <Button variant="secondary" size="sm"><NotebookPen className="size-4" />New note</Button>
        </Link>
        <Link to="/homework">
          <Button variant="secondary" size="sm"><ListChecks className="size-4" />Add homework</Button>
        </Link>
        <Link to="/focus">
          <Button variant="secondary" size="sm"><Timer className="size-4" />Start focus session</Button>
        </Link>
        <Link to="/timetable">
          <Button variant="secondary" size="sm"><CalendarClock className="size-4" />Add event</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Today's timetable"
            action={
              <Link to="/timetable" className="flex items-center gap-1 text-sm text-navy-600 hover:underline dark:text-navy-300">
                View calendar <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          {isLoading ? (
            <SkeletonLines />
          ) : todaysEvents.length === 0 ? (
            <EmptyState message="Nothing scheduled for today. Enjoy the breathing room, or plan a revision session." />
          ) : (
            <ul className="flex flex-col divide-y divide-ink-100 dark:divide-navy-800">
              {todaysEvents.map((event) => (
                <li key={event.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: event.color_hex ?? '#2C4F85' }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{event.title}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400">
                      {format(new Date(event.starts_at), 'HH:mm')}–{format(new Date(event.ends_at), 'HH:mm')} · {EVENT_TYPE_LABEL[event.event_type]}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Study streak" />
          <div className="flex flex-col items-center justify-center py-4">
            <Flame className="size-9 text-amber-500" aria-hidden="true" />
            <p className="font-display mt-2 text-3xl font-semibold text-ink-900 dark:text-white">{currentStreak}</p>
            <p className="text-sm text-ink-500 dark:text-ink-400">day{currentStreak === 1 ? '' : 's'} in a row</p>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Today's homework"
            action={
              <Link to="/homework" className="flex items-center gap-1 text-sm text-navy-600 hover:underline dark:text-navy-300">
                All homework <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          {isLoading ? (
            <SkeletonLines />
          ) : todaysHomework.length === 0 ? (
            <EmptyState message="Nothing due today." />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {todaysHomework.map((hw) => (
                <li key={hw.id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-ink-800 dark:text-ink-100">{hw.title}</span>
                  <PriorityBadge priority={hw.priority} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Upcoming deadlines"
            action={
              <Link to="/homework" className="flex items-center gap-1 text-sm text-navy-600 hover:underline dark:text-navy-300">
                See all <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          {isLoading ? (
            <SkeletonLines />
          ) : upcomingDeadlines.length === 0 ? (
            <EmptyState message="No upcoming deadlines. You're on top of things." />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {upcomingDeadlines.map((hw) => (
                <li key={hw.id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-ink-800 dark:text-ink-100">{hw.title}</span>
                  <span className="shrink-0 text-xs text-ink-500 dark:text-ink-400">
                    {hw.due_at ? format(new Date(hw.due_at), 'd MMM') : '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Recent notes"
            action={
              <Link to="/notes" className="flex items-center gap-1 text-sm text-navy-600 hover:underline dark:text-navy-300">
                Open notes <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          {isLoading ? (
            <SkeletonLines />
          ) : recentNotes.length === 0 ? (
            <EmptyState message="No notes yet. Your first one is one click away." />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {recentNotes.map((note) => (
                <li key={note.id} className="truncate text-sm text-ink-800 dark:text-ink-100">
                  {note.title}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function SkeletonLines() {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-ink-100 dark:bg-navy-800" style={{ width: `${70 - i * 10}%` }} />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-2 text-sm text-ink-500 dark:text-ink-400">{message}</p>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    LOW: 'bg-ink-100 text-ink-600 dark:bg-navy-800 dark:text-ink-300',
    MEDIUM: 'bg-navy-50 text-navy-700 dark:bg-navy-800 dark:text-navy-200',
    HIGH: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    URGENT: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  };
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[priority] ?? styles.MEDIUM}`}>
      {priority.toLowerCase()}
    </span>
  );
}
