import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signUpWithEmail, signInWithGoogle } from './authApi';
import { GoogleGlyph } from './GoogleGlyph';

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signUpWithEmail(email, password, fullName);
      setSubmittedEmail(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start Google sign-in.');
    }
  }

  if (submittedEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 dark:bg-navy-950">
        <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-ink-100 bg-white p-6 text-center shadow-[var(--shadow-soft)] dark:border-navy-800 dark:bg-navy-900">
          <Logo size={36} />
          <h1 className="font-display mt-6 text-lg font-semibold text-ink-900 dark:text-white">Check your inbox</h1>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
            We sent a verification link to <span className="font-medium text-ink-700 dark:text-ink-200">{submittedEmail}</span>.
            Confirm your email to finish setting up your account.
          </p>
          <Link to="/login" className="mt-6 inline-block text-sm font-medium text-navy-600 hover:underline dark:text-navy-300">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 dark:bg-navy-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Logo size={40} />
          <p className="text-sm text-ink-500 dark:text-ink-400">Everything a student needs. One place.</p>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-ink-100 bg-white p-6 shadow-[var(--shadow-soft)] dark:border-navy-800 dark:bg-navy-900">
          <h1 className="font-display mb-6 text-xl font-semibold text-ink-900 dark:text-white">Create your account</h1>

          <Button type="button" variant="secondary" className="w-full" onClick={handleGoogle}>
            <GoogleGlyph className="size-4" />
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
            <div className="h-px flex-1 bg-ink-200 dark:bg-navy-700" />
            or sign up with email
            <div className="h-px flex-1 bg-ink-200 dark:bg-navy-700" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input label="Full name" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              required
              hint="At least 8 characters."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p role="alert" className="text-sm text-amber-600 dark:text-amber-400">
                {error}
              </p>
            )}
            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-navy-600 hover:underline dark:text-navy-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
