-- =====================================================================
-- MAAR Student Hub — Database Schema (PostgreSQL / Supabase)
-- =====================================================================
-- Design principles:
--  1. auth.users (Supabase-managed) is the single source of identity.
--     Every other user-owned table stores a user_id FK -> auth.users(id)
--     and is protected by Row Level Security keyed on auth.uid().
--  2. Profile creation is idempotent: a trigger on auth.users creates
--     exactly one profiles row per user, so "Continue with Google" and
--     "Email & Password" can never create duplicate accounts.
--  3. Every table has created_at / updated_at with an auto-update
--     trigger, and every foreign key has a matching index.
--  4. Soft config (education systems, subjects, learning styles) is
--     modelled as lookup tables, not enums, so new systems (e.g. a
--     new exam board) can be added with an INSERT, not a migration.
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Utility: auto-maintain updated_at
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =====================================================================
-- 1. IDENTITY & ONBOARDING
-- =====================================================================

-- Lookup: education systems (extensible without a migration)
create table education_systems (
  code text primary key,          -- 'GCSE', 'A_LEVEL', 'IB', 'CBSE', ...
  label text not null,
  country_hint text,
  sort_order int not null default 100
);

insert into education_systems (code, label, country_hint, sort_order) values
  ('GCSE', 'GCSE', 'GB', 10),
  ('A_LEVEL', 'A-Level', 'GB', 20),
  ('BTEC', 'BTEC', 'GB', 30),
  ('T_LEVEL', 'T-Level', 'GB', 40),
  ('UNIVERSITY', 'University', null, 50),
  ('SSC', 'SSC', 'IN', 60),
  ('HSC', 'HSC', 'IN', 70),
  ('CBSE', 'CBSE', 'IN', 80),
  ('ICSE', 'ICSE', 'IN', 90),
  ('IB', 'International Baccalaureate', null, 100),
  ('SAT', 'SAT / US High School', 'US', 110),
  ('OTHER', 'Other', null, 999)
on conflict (code) do nothing;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  age int check (age is null or (age between 5 and 100)),
  country text,
  education_system_code text references education_systems(code),
  institution_name text,          -- school / college / university
  current_year text,              -- free text: 'Year 11', 'Year 2', etc.
  study_goal text,
  preferred_study_duration_minutes int default 25,
  preferred_focus_session_minutes int default 25,
  learning_style text check (learning_style in
    ('VISUAL','AUDITORY','READING_WRITING','KINAESTHETIC','NOT_SURE')),
  onboarding_completed boolean not null default false,
  theme_preference text not null default 'system'
    check (theme_preference in ('light','dark','system')),
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create exactly one profile row per new auth user (Google or email)
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;  -- idempotent: never duplicates
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Student's chosen subjects (many-per-user, free text + optional colour)
create table subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color_hex text not null default '#2C4F85',
  icon text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);
create index idx_subjects_user on subjects(user_id);
create trigger trg_subjects_updated_at before update on subjects
  for each row execute function set_updated_at();

-- =====================================================================
-- 2. TIMETABLE & CALENDAR
-- =====================================================================

create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  title text not null,
  description text,
  event_type text not null default 'EVENT' check (event_type in
    ('LESSON','REVISION','EXAM','HOMEWORK','WORK_SHIFT','REMINDER','EVENT')),
  color_hex text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  -- Recurrence (RFC 5545-style, kept simple and queryable)
  recurrence_freq text check (recurrence_freq in ('NONE','DAILY','WEEKLY','MONTHLY')),
  recurrence_interval int default 1,
  recurrence_days_of_week int[],       -- 0=Sun .. 6=Sat, for WEEKLY
  recurrence_until timestamptz,
  parent_event_id uuid references calendar_events(id) on delete cascade, -- for generated occurrences/exceptions
  reminder_minutes_before int,
  source text not null default 'MANUAL' check (source in ('MANUAL','ICS_IMPORT')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_time_order check (ends_at >= starts_at)
);
create index idx_events_user_time on calendar_events(user_id, starts_at, ends_at);
create index idx_events_subject on calendar_events(subject_id);
create index idx_events_parent on calendar_events(parent_event_id);
create trigger trg_events_updated_at before update on calendar_events
  for each row execute function set_updated_at();

-- =====================================================================
-- 3. NOTES
-- =====================================================================

create table note_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_folder_id uuid references note_folders(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_folders_user on note_folders(user_id);
create index idx_folders_parent on note_folders(parent_folder_id);

create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid references note_folders(id) on delete set null,
  subject_id uuid references subjects(id) on delete set null,
  title text not null default 'Untitled note',
  content_json jsonb not null default '{}'::jsonb,  -- rich text doc (e.g. TipTap/ProseMirror JSON)
  content_markdown text,                             -- derived, for search/export
  is_pinned boolean not null default false,
  is_favourite boolean not null default false,
  tags text[] not null default '{}',
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_notes_user on notes(user_id);
create index idx_notes_folder on notes(folder_id);
create index idx_notes_subject on notes(subject_id);
create index idx_notes_tags on notes using gin(tags);
create index idx_notes_search on notes using gin(search_vector);
create trigger trg_notes_updated_at before update on notes
  for each row execute function set_updated_at();

create or replace function notes_search_vector_update()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.content_markdown, '')), 'B');
  return new;
end;
$$ language plpgsql;

create trigger trg_notes_search_vector
  before insert or update of title, content_markdown on notes
  for each row execute function notes_search_vector_update();

-- Version history preparation (append-only snapshots)
create table note_versions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content_json jsonb not null,
  created_at timestamptz not null default now()
);
create index idx_note_versions_note on note_versions(note_id, created_at desc);

-- =====================================================================
-- 4. HOMEWORK / ASSIGNMENTS
-- =====================================================================

create table homework (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  title text not null,
  notes text,
  priority text not null default 'MEDIUM' check (priority in ('LOW','MEDIUM','HIGH','URGENT')),
  status text not null default 'NOT_STARTED' check (status in
    ('NOT_STARTED','IN_PROGRESS','COMPLETED','OVERDUE')),
  estimated_minutes int,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_homework_user on homework(user_id, due_at);
create index idx_homework_subject on homework(subject_id);
create index idx_homework_status on homework(user_id, status);
create trigger trg_homework_updated_at before update on homework
  for each row execute function set_updated_at();

-- =====================================================================
-- 5. STUDY PLANNER / STREAKS
-- =====================================================================

create table study_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  title text not null,
  target_date date,
  target_hours numeric(6,2),
  logged_hours numeric(6,2) not null default 0,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','COMPLETED','ABANDONED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_goals_user on study_goals(user_id);
create trigger trg_goals_updated_at before update on study_goals
  for each row execute function set_updated_at();

create table study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  goal_id uuid references study_goals(id) on delete set null,
  session_type text not null default 'FOCUS' check (session_type in
    ('FOCUS','DEEP_WORK','REVISION','CUSTOM')),
  planned_minutes int not null,
  actual_minutes int,
  -- authoritative timestamps so the timer survives refresh/minimise/background tabs
  started_at timestamptz not null,
  ended_at timestamptz,
  paused_total_seconds int not null default 0,
  status text not null default 'RUNNING' check (status in ('RUNNING','PAUSED','COMPLETED','ABANDONED')),
  created_at timestamptz not null default now()
);
create index idx_sessions_user_time on study_sessions(user_id, started_at desc);

-- Daily streak rollup (one row per user per calendar day with any completed session)
create table study_streak_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  study_date date not null,
  total_minutes int not null default 0,
  primary key (user_id, study_date)
);

-- =====================================================================
-- 6. FLASHCARDS (self-test now, spaced-repetition-ready fields)
-- =====================================================================

create table flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_decks_user on flashcard_decks(user_id);
create trigger trg_decks_updated_at before update on flashcard_decks
  for each row execute function set_updated_at();

create table flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references flashcard_decks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  front text not null,
  back text not null,
  -- spaced-repetition-ready (SM-2 style) — unused by simple self-test mode today
  ease_factor numeric(4,2) not null default 2.5,
  interval_days int not null default 0,
  repetitions int not null default 0,
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_flashcards_deck on flashcards(deck_id);
create index idx_flashcards_due on flashcards(user_id, due_at);

-- =====================================================================
-- 7. GRADE TRACKER
-- =====================================================================

create table grade_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  assessment_name text not null,
  assessment_type text not null default 'ASSIGNMENT' check (assessment_type in
    ('ASSIGNMENT','TEST','EXAM','COURSEWORK','MOCK')),
  target_grade text,
  predicted_grade text,
  achieved_grade text,
  achieved_percentage numeric(5,2),
  max_percentage numeric(5,2) not null default 100,
  weight numeric(5,2) not null default 1,   -- for weighted averages
  assessed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_grades_user_subject on grade_records(user_id, subject_id);
create trigger trg_grades_updated_at before update on grade_records
  for each row execute function set_updated_at();

-- =====================================================================
-- 8. FILE MANAGER
-- (actual bytes live in Supabase Storage bucket 'student-files';
--  this table is the private, queryable, RLS-protected index over it)
-- =====================================================================

create table file_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_folder_id uuid references file_folders(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  name text not null,
  created_at timestamptz not null default now()
);
create index idx_file_folders_user on file_folders(user_id);

create table files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid references file_folders(id) on delete set null,
  subject_id uuid references subjects(id) on delete set null,
  storage_path text not null,     -- path inside the 'student-files' bucket
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);
create index idx_files_user on files(user_id);
create index idx_files_folder on files(folder_id);

-- =====================================================================
-- 9. SOURCE-BASED STUDY ASSISTANT
--    (answers only from the student's own uploaded docs, or curated
--     official resources — never free-floating chat)
-- =====================================================================

-- Provider abstraction: swap AI vendors without touching app code
create table ai_providers (
  code text primary key,             -- 'anthropic', 'openai', ...
  label text not null,
  is_active boolean not null default true
);
insert into ai_providers (code, label) values ('anthropic', 'Anthropic Claude')
  on conflict (code) do nothing;

-- Curated, legally-redistributable official resources (not user content)
create table official_resources (
  id uuid primary key default gen_random_uuid(),
  country text,
  education_system_code text references education_systems(code),
  subject_name text not null,
  title text not null,
  description text,
  storage_path text,             -- if hosted directly (license-cleared only)
  external_url text,             -- if linking out instead of redistributing
  created_at timestamptz not null default now()
);
create index idx_official_resources_lookup
  on official_resources(country, education_system_code, subject_name);

-- Chunked, embeddable text extracted from the student's own uploaded files
create table document_chunks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_id uuid references files(id) on delete cascade,
  official_resource_id uuid references official_resources(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  -- embedding stored as vector when pgvector is enabled; nullable so the
  -- app works with keyword search before pgvector is provisioned
  embedding vector(1536),
  created_at timestamptz not null default now(),
  constraint chk_one_source check (
    (file_id is not null and official_resource_id is null) or
    (file_id is null and official_resource_id is not null)
  )
);
create index idx_chunks_user on document_chunks(user_id);
create index idx_chunks_file on document_chunks(file_id);

create table assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  title text not null default 'New conversation',
  provider_code text not null default 'anthropic' references ai_providers(code),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_conversations_user on assistant_conversations(user_id);
create trigger trg_conversations_updated_at before update on assistant_conversations
  for each row execute function set_updated_at();

create table assistant_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references assistant_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  -- which source chunks the answer was grounded in (empty = "not found in materials")
  cited_chunk_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);
create index idx_messages_conversation on assistant_messages(conversation_id, created_at);

-- =====================================================================
-- 10. ACHIEVEMENTS / MILESTONES
-- =====================================================================

create table achievements (
  code text primary key,             -- 'STREAK_7', 'FIRST_NOTE', ...
  title text not null,
  description text not null,
  icon text
);

create table user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_code text not null references achievements(code),
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_code)
);

-- =====================================================================
-- 11. SETTINGS
-- =====================================================================

create table user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  font_scale text not null default 'MEDIUM' check (font_scale in ('SMALL','MEDIUM','LARGE','XL')),
  high_contrast boolean not null default false,
  reduce_motion boolean not null default false,
  language text not null default 'en',
  notifications_email boolean not null default true,
  notifications_push boolean not null default true,
  notify_deadline_hours_before int not null default 24,
  privacy_profile_visible boolean not null default false,
  updated_at timestamptz not null default now()
);
create trigger trg_settings_updated_at before update on user_settings
  for each row execute function set_updated_at();

-- =====================================================================
-- ROW LEVEL SECURITY
-- Pattern: every user-owned table -> "owner can do everything, nobody
-- else can see or touch it." Reference/lookup tables are public-read.
-- =====================================================================

alter table profiles enable row level security;
alter table subjects enable row level security;
alter table calendar_events enable row level security;
alter table note_folders enable row level security;
alter table notes enable row level security;
alter table note_versions enable row level security;
alter table homework enable row level security;
alter table study_goals enable row level security;
alter table study_sessions enable row level security;
alter table study_streak_days enable row level security;
alter table flashcard_decks enable row level security;
alter table flashcards enable row level security;
alter table grade_records enable row level security;
alter table file_folders enable row level security;
alter table files enable row level security;
alter table document_chunks enable row level security;
alter table assistant_conversations enable row level security;
alter table assistant_messages enable row level security;
alter table user_achievements enable row level security;
alter table user_settings enable row level security;

alter table education_systems enable row level security;
alter table ai_providers enable row level security;
alter table official_resources enable row level security;
alter table achievements enable row level security;

-- Generic "owner-only" policy, applied per table (Postgres has no policy
-- templates, so each is declared explicitly for clarity and auditability).
create policy "profiles_owner" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "subjects_owner" on subjects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "events_owner" on calendar_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "note_folders_owner" on note_folders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notes_owner" on notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "note_versions_owner" on note_versions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "homework_owner" on homework
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_owner" on study_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sessions_owner" on study_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "streaks_owner" on study_streak_days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "decks_owner" on flashcard_decks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "flashcards_owner" on flashcards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "grades_owner" on grade_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "file_folders_owner" on file_folders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "files_owner" on files
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "chunks_owner" on document_chunks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "conversations_owner" on assistant_conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "messages_owner" on assistant_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_achievements_owner" on user_achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "settings_owner" on user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Lookup/reference tables: readable by any authenticated user, writable by none (managed by admins via service role)
create policy "education_systems_read" on education_systems for select using (true);
create policy "ai_providers_read" on ai_providers for select using (true);
create policy "official_resources_read" on official_resources for select using (true);
create policy "achievements_read" on achievements for select using (true);

-- =====================================================================
-- STORAGE (Supabase Storage buckets — run via dashboard or SQL below)
-- =====================================================================
-- Bucket 'student-files' should be created as PRIVATE (not public).
-- Path convention: {user_id}/{file_id}/{original_filename}
-- Example storage RLS (apply in Storage > Policies once bucket exists):
--
-- create policy "student_files_owner_select" on storage.objects
--   for select using (bucket_id = 'student-files' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "student_files_owner_insert" on storage.objects
--   for insert with check (bucket_id = 'student-files' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "student_files_owner_delete" on storage.objects
--   for delete using (bucket_id = 'student-files' and auth.uid()::text = (storage.foldername(name))[1]);
