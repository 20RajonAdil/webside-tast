import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { CalendarEvent, Homework, Note } from '@/types/database';

interface DashboardData {
  todaysEvents: CalendarEvent[];
  todaysHomework: Homework[];
  upcomingDeadlines: Homework[];
  recentNotes: Note[];
  currentStreak: number;
  isLoading: boolean;
  error: string | null;
}

function startOfDayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function useDashboardData(): DashboardData {
  const { user } = useAuthStore();
  const [state, setState] = useState<Omit<DashboardData, 'isLoading' | 'error'>>({
    todaysEvents: [],
    todaysHomework: [],
    upcomingDeadlines: [],
    recentNotes: [],
    currentStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const todayStart = startOfDayISO(0);
        const todayEnd = startOfDayISO(1);

        const [eventsRes, homeworkTodayRes, deadlinesRes, notesRes, streakRes] = await Promise.all([
          supabase
            .from('calendar_events')
            .select('*')
            .eq('user_id', user!.id)
            .gte('starts_at', todayStart)
            .lt('starts_at', todayEnd)
            .order('starts_at', { ascending: true }),
          supabase
            .from('homework')
            .select('*')
            .eq('user_id', user!.id)
            .gte('due_at', todayStart)
            .lt('due_at', todayEnd)
            .neq('status', 'COMPLETED'),
          supabase
            .from('homework')
            .select('*')
            .eq('user_id', user!.id)
            .neq('status', 'COMPLETED')
            .gte('due_at', todayStart)
            .order('due_at', { ascending: true })
            .limit(5),
          supabase
            .from('notes')
            .select('*')
            .eq('user_id', user!.id)
            .order('updated_at', { ascending: false })
            .limit(4),
          supabase
            .from('study_streak_days')
            .select('study_date, total_minutes')
            .eq('user_id', user!.id)
            .order('study_date', { ascending: false })
            .limit(60),
        ]);

        if (cancelled) return;

        const firstError =
          eventsRes.error || homeworkTodayRes.error || deadlinesRes.error || notesRes.error || streakRes.error;
        if (firstError) throw firstError;

        // Streak: count consecutive days (from today backwards) with logged minutes.
        let streak = 0;
        const days = (streakRes.data ?? []) as { study_date: string; total_minutes: number }[];
        const byDate = new Map(days.map((d) => [d.study_date, d.total_minutes]));
        for (let i = 0; i < 365; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          if ((byDate.get(key) ?? 0) > 0) streak++;
          else break;
        }

        setState({
          todaysEvents: (eventsRes.data ?? []) as CalendarEvent[],
          todaysHomework: (homeworkTodayRes.data ?? []) as Homework[],
          upcomingDeadlines: (deadlinesRes.data ?? []) as Homework[],
          recentNotes: (notesRes.data ?? []) as Note[],
          currentStreak: streak,
        });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your dashboard.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { ...state, isLoading, error };
}
