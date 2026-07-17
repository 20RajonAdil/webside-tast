import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { AuthCallbackPage } from '@/features/auth/AuthCallbackPage';
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { AppShell } from '@/components/layout/AppShell';
import { ModuleRoadmap } from '@/components/shared/ModuleRoadmap';
import { RequireAuth, RequireOnboarding, RedirectIfAuthenticated } from './guards';

function ShellRoute({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireOnboarding>
        <AppShell title={title}>{children}</AppShell>
      </RequireOnboarding>
    </RequireAuth>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth (public, but redirect away once fully signed in) */}
      <Route path="/login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
      <Route path="/signup" element={<RedirectIfAuthenticated><SignupPage /></RedirectIfAuthenticated>} />
      <Route path="/forgot-password" element={<RedirectIfAuthenticated><ForgotPasswordPage /></RedirectIfAuthenticated>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Onboarding: requires auth, but is the one screen exempt from RequireOnboarding */}
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingFlow />
          </RequireAuth>
        }
      />

      {/* Main app: requires auth + completed onboarding */}
      <Route path="/" element={<ShellRoute title="Dashboard"><DashboardPage /></ShellRoute>} />
      <Route
        path="/timetable"
        element={
          <ShellRoute title="Timetable">
            <ModuleRoadmap
              moduleName="Timetable & Calendar"
              whatItWillDo={[
                'Daily, weekly and monthly views over calendar_events',
                'Recurring lessons/revision/exams with conflict detection',
                'ICS import and colour-coded categories',
              ]}
            />
          </ShellRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ShellRoute title="Notes">
            <ModuleRoadmap
              moduleName="Notes"
              whatItWillDo={[
                'Rich-text editor with folders, notebooks and subjects',
                'Tagging, pinning, favourites and full-text search',
                'Autosave with version history over note_versions',
              ]}
            />
          </ShellRoute>
        }
      />
      <Route
        path="/homework"
        element={
          <ShellRoute title="Homework">
            <ModuleRoadmap
              moduleName="Homework & Assignments"
              whatItWillDo={[
                'Subject, priority, deadline and duration tracking',
                'Filtering, search and progress views',
                'Auto-sync with Dashboard and Timetable',
              ]}
            />
          </ShellRoute>
        }
      />
      <Route
        path="/planner"
        element={
          <ShellRoute title="Study Planner">
            <ModuleRoadmap
              moduleName="Study Planner"
              whatItWillDo={['Long-term goals over study_goals', 'Revision scheduling', 'Streak and progress history']}
            />
          </ShellRoute>
        }
      />
      <Route
        path="/focus"
        element={
          <ShellRoute title="Focus Room">
            <ModuleRoadmap
              moduleName="Focus Room"
              whatItWillDo={[
                'Timestamp-accurate Pomodoro timer (survives refresh/minimise)',
                'Deep work sessions, pause/resume, custom timers',
                'Session history and statistics over study_sessions',
              ]}
            />
          </ShellRoute>
        }
      />
      <Route
        path="/flashcards"
        element={
          <ShellRoute title="Flashcards">
            <ModuleRoadmap
              moduleName="Flashcards"
              whatItWillDo={['Deck and card management', 'Self-test mode', 'Spaced-repetition fields already in schema, scheduling logic next']}
            />
          </ShellRoute>
        }
      />
      <Route
        path="/grades"
        element={
          <ShellRoute title="Grade Tracker">
            <ModuleRoadmap
              moduleName="Grade Tracker"
              whatItWillDo={['Target vs predicted vs achieved grades', 'Weighted average calculation', 'Visual trend graphs']}
            />
          </ShellRoute>
        }
      />
      <Route
        path="/tools"
        element={
          <ShellRoute title="Study Tools">
            <ModuleRoadmap
              moduleName="Study Tools"
              whatItWillDo={['Scientific & GPA calculators', 'Unit converter', 'Stopwatch, countdown timer, pinned resources']}
            />
          </ShellRoute>
        }
      />
      <Route
        path="/assistant"
        element={
          <ShellRoute title="Study Assistant">
            <ModuleRoadmap
              moduleName="Source-Based Study Assistant"
              whatItWillDo={[
                'Answers grounded only in uploaded documents / official resources',
                'Provider-agnostic AI layer (src/lib/ai) so vendors can be swapped',
                'Explicit "not found in your materials" responses instead of guessing',
              ]}
            />
          </ShellRoute>
        }
      />
      <Route
        path="/files"
        element={
          <ShellRoute title="Files">
            <ModuleRoadmap moduleName="File Manager" whatItWillDo={['Supabase Storage-backed uploads', 'Folder organisation by subject', 'Private, RLS-protected access']} />
          </ShellRoute>
        }
      />
      <Route
        path="/achievements"
        element={
          <ShellRoute title="Achievements">
            <ModuleRoadmap moduleName="Achievements" whatItWillDo={['Streak and milestone badges', 'Quiet, non-gamey progress markers']} />
          </ShellRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ShellRoute title="Settings">
            <ModuleRoadmap moduleName="Settings" whatItWillDo={['Theme, font size, accessibility toggles', 'Notification preferences', 'Profile and privacy controls over user_settings']} />
          </ShellRoute>
        }
      />
    </Routes>
  );
}
