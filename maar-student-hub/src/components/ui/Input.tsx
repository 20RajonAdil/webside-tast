import { type InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-ink-700 dark:text-ink-200">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          className={`h-11 rounded-[var(--radius-md)] border bg-white px-3.5 text-sm text-ink-800 placeholder:text-ink-400 outline-none transition-colors focus:border-navy-500 focus:ring-2 focus:ring-navy-100 dark:bg-navy-900 dark:text-ink-100 dark:placeholder:text-ink-500 ${
            error ? 'border-amber-500 focus:border-amber-500 focus:ring-amber-100' : 'border-ink-200 dark:border-navy-700'
          } ${className}`}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-ink-500 dark:text-ink-400">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-amber-600 dark:text-amber-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
