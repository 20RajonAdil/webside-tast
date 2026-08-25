import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { AuthCallbackPage } from '@/features/auth/AuthCallbackPage';
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { MaarAI } from '@/features/assistant/MaarAI';
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
      <Route path="/login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
      <Route path="/signup" element={<RedirectIfAuthenticated><SignupPage /></RedirectIfAuthenticated>} />
      <Route path="/forgot-password" element={<RedirectIfAuthenticated><ForgotPasswordPage /></RedirectIfAuthenticated>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/onboarding" element={<RequireAuth><OnboardingFlow /></RequireAuth>} />

      <Route path="/" element={<ShellRoute title="Dashboard"><DashboardPage /></ShellRoute>} />
      <Route path="/assistant" element={<ShellRoute title="MAAR AI"><MaarAI /></ShellRoute>} />
      <Route path="/timetable" element={<ShellRoute title="Timetable"><ModuleRoadmap moduleName="Timetable & Calendar" whatItWillDo={['Daily, weekly and monthly views', 'Recurring lessons/revision/exams', 'ICS import and categories']} /></ShellRoute>} />
      <Route path="/notes" element={<ShellRoute title="Notes"><ModuleRoadmap moduleName="Notes" whatItWillDo={['Rich-text editor', 'Tagging and search', 'Autosave and version history']} /></ShellRoute>} />
      <Route path="/homework" element={<ShellRoute title="Homework"><ModuleRoadmap moduleName="Homework & Assignments" whatItWillDo={['Subject, priority, deadline and duration tracking', 'Filtering and search', 'Dashboard and timetable sync']} /></ShellRoute>} />
      <Route path="/planner" element={<ShellRoute title="Study Planner"><ModuleRoadmap moduleName="Study Planner" whatItWillDo={['Long-term goals', 'Revision scheduling', 'Streak and progress history']} /></ShellRoute>} />
      <Route path="/focus" element={<ShellRoute title="Focus Room"><ModuleRoadmap moduleName="Focus Room" whatItWillDo={['Pomodoro timer', 'Deep work sessions', 'Session history and statistics']} /></ShellRoute>} />
      <Route path="/flashcards" element={<ShellRoute title="Flashcards"><ModuleRoadmap moduleName="Flashcards" whatItWillDo={['Deck and card management', 'Self-test mode', 'Spaced repetition']} /></ShellRoute>} />
      <Route path="/grades" element={<ShellRoute title="Grade Tracker"><ModuleRoadmap moduleName="Grade Tracker" whatItWillDo={['Target vs predicted vs achieved grades', 'Weighted averages', 'Visual trends']} /></ShellRoute>} />
      <Route path="/tools" element={<ShellRoute title="Study Tools"><ModuleRoadmap moduleName="Study Tools" whatItWillDo={['Scientific and GPA calculators', 'Unit converter', 'Timers and resources']} /></ShellRoute>} />
      <Route path="/files" element={<ShellRoute title="Files"><ModuleRoadmap moduleName="File Manager" whatItWillDo={['Supabase Storage uploads', 'Subject folders', 'Private access']} /></ShellRoute>} />
      <Route path="/achievements" element={<ShellRoute title="Achievements"><ModuleRoadmap moduleName="Achievements" whatItWillDo={['Streak and milestone badges', 'Progress markers']} /></ShellRoute>} />
      <Route path="/settings" element={<ShellRoute title="Settings"><ModuleRoadmap moduleName="Settings" whatItWillDo={['Theme and accessibility', 'Notifications', 'Profile and privacy controls']} /></ShellRoute>} />
    </Routes>
  );
}
