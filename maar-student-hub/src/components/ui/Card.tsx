import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-ink-100 bg-white p-5 shadow-[var(--shadow-card)] dark:border-navy-800 dark:bg-navy-900 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-display text-base font-semibold text-ink-800 dark:text-ink-100">{title}</h3>
      {action}
    </div>
  );
}
