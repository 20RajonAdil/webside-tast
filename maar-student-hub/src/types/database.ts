// These types mirror supabase/schema.sql. Once the Supabase project is
// live, replace this file's contents with the output of:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
// Kept hand-written for now so the app compiles before a project exists.

export type LearningStyle = 'VISUAL' | 'AUDITORY' | 'READING_WRITING' | 'KINAESTHETIC' | 'NOT_SURE';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  age: number | null;
  country: string | null;
  education_system_code: string | null;
  institution_name: string | null;
  current_year: string | null;
  study_goal: string | null;
  preferred_study_duration_minutes: number;
  preferred_focus_session_minutes: number;
  learning_style: LearningStyle | null;
  onboarding_completed: boolean;
  theme_preference: ThemePreference;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface EducationSystem {
  code: string;
  label: string;
  country_hint: string | null;
  sort_order: number;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  color_hex: string;
  icon: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export type EventType = 'LESSON' | 'REVISION' | 'EXAM' | 'HOMEWORK' | 'WORK_SHIFT' | 'REMINDER' | 'EVENT';

export interface CalendarEvent {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  event_type: EventType;
  color_hex: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  recurrence_freq: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | null;
  recurrence_interval: number | null;
  recurrence_days_of_week: number[] | null;
  recurrence_until: string | null;
  parent_event_id: string | null;
  reminder_minutes_before: number | null;
  source: 'MANUAL' | 'ICS_IMPORT';
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  folder_id: string | null;
  subject_id: string | null;
  title: string;
  content_json: Record<string, unknown>;
  content_markdown: string | null;
  is_pinned: boolean;
  is_favourite: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type HomeworkPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type HomeworkStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

export interface Homework {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  notes: string | null;
  priority: HomeworkPriority;
  status: HomeworkStatus;
  estimated_minutes: number | null;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string | null;
  goal_id: string | null;
  session_type: 'FOCUS' | 'DEEP_WORK' | 'REVISION' | 'CUSTOM';
  planned_minutes: number;
  actual_minutes: number | null;
  started_at: string;
  ended_at: string | null;
  paused_total_seconds: number;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';
  created_at: string;
}
