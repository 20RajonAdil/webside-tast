import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signInWithEmail, signInWithGoogle } from './authApi';
import { GoogleGlyph } from './GoogleGlyph';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithEmail(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in. Check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      await signInWithGoogle();
      // Browser redirects away to Google; nothing further happens here.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start Google sign-in.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 dark:bg-navy-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Logo size={40} />
          <p className="text-sm text-ink-500 dark:text-ink-400">Everything a student needs. One place.</p>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-ink-100 bg-white p-6 shadow-[var(--shadow-soft)] dark:border-navy-800 dark:bg-navy-900">
          <h1 className="font-display mb-6 text-xl font-semibold text-ink-900 dark:text-white">Welcome back</h1>

          <Button type="button" variant="secondary" className="w-full" onClick={handleGoogle}>
            <GoogleGlyph className="size-4" />
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
            <div className="h-px flex-1 bg-ink-200 dark:bg-navy-700" />
            or continue with email
            <div className="h-px flex-1 bg-ink-200 dark:bg-navy-700" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p role="alert" className="text-sm text-amber-600 dark:text-amber-400">
                {error}
              </p>
            )}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-navy-600 hover:underline dark:text-navy-300">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
          New to MAAR?{' '}
          <Link to="/signup" className="font-medium text-navy-600 hover:underline dark:text-navy-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
