import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 dark:bg-navy-950">
      <Loader2 className="size-6 animate-spin text-navy-500" aria-label="Loading" />
    </div>
  );
}

/** Blocks access to signed-out visitors; sends them to /login and remembers where they were headed. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuthStore();
  const location = useLocation();

  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'signed-out') return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

/** Once signed in, forces first-time users through onboarding before anything else. */
export function RequireOnboarding({ children }: { children: ReactNode }) {
  const { profile, status } = useAuthStore();

  if (status === 'loading' || (status === 'signed-in' && !profile)) return <FullScreenLoader />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

/** Keeps already-onboarded users out of the auth pages / onboarding wizard. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { status, profile } = useAuthStore();
  if (status === 'signed-in' && profile?.onboarding_completed) return <Navigate to="/" replace />;
  return <>{children}</>;
}
