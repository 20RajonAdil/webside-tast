import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updatePassword } from './authApi';

// Supabase places a recovery session in the URL fragment and the client
// picks it up automatically (detectSessionInUrl: true), so by the time
// this page mounts the user already has a valid session to act on.
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      await updatePassword(password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 dark:bg-navy-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Logo size={40} />
        </div>
        <div className="rounded-[var(--radius-lg)] border border-ink-100 bg-white p-6 shadow-[var(--shadow-soft)] dark:border-navy-800 dark:bg-navy-900">
          <h1 className="font-display mb-5 text-lg font-semibold text-ink-900 dark:text-white">Set a new password</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input label="New password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input label="Confirm new password" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {error && (
              <p role="alert" className="text-sm text-amber-600 dark:text-amber-400">
                {error}
              </p>
            )}
            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Update password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
