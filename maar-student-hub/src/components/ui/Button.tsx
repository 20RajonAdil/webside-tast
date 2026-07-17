import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-navy-800 text-white hover:bg-navy-700 active:bg-navy-900 disabled:bg-navy-300 shadow-soft',
  secondary:
    'bg-white text-navy-800 border border-ink-200 hover:bg-ink-50 active:bg-ink-100 disabled:text-ink-300 dark:bg-navy-900 dark:text-ink-100 dark:border-navy-700 dark:hover:bg-navy-800',
  ghost:
    'bg-transparent text-ink-600 hover:bg-ink-100 active:bg-ink-200 disabled:text-ink-300 dark:text-ink-300 dark:hover:bg-navy-800',
  danger:
    'bg-amber-600 text-white hover:bg-amber-500 active:bg-amber-700 disabled:bg-amber-200',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-colors duration-150 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-navy-500 focus-visible:outline-offset-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
