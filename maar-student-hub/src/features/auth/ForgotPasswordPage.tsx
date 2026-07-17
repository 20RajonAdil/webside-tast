import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { sendPasswordReset } from './authApi';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the reset link.');
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
          {sent ? (
            <>
              <h1 className="font-display mb-2 text-lg font-semibold text-ink-900 dark:text-white">Check your email</h1>
              <p className="text-sm text-ink-500 dark:text-ink-400">
                If an account exists for {email}, a password reset link is on its way.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display mb-2 text-lg font-semibold text-ink-900 dark:text-white">Reset your password</h1>
              <p className="mb-5 text-sm text-ink-500 dark:text-ink-400">
                Enter your email and we'll send you a link to reset it.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                {error && (
                  <p role="alert" className="text-sm text-amber-600 dark:text-amber-400">
                    {error}
                  </p>
                )}
                <Button type="submit" isLoading={isSubmitting} className="w-full">
                  Send reset link
                </Button>
              </form>
            </>
          )}
          <Link to="/login" className="mt-5 inline-block text-sm font-medium text-navy-600 hover:underline dark:text-navy-300">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
