import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

// Landing point for both Google OAuth and email verification links.
// Supabase's client already exchanges the URL code/fragment for a
// session (detectSessionInUrl: true); we just wait for it, then route on.
export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      navigate(data.session ? '/' : '/login', { replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 dark:bg-navy-950">
      <Loader2 className="size-6 animate-spin text-navy-500" aria-label="Signing you in" />
    </div>
  );
}
