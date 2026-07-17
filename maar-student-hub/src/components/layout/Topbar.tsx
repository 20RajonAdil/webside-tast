import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { signOut } from '@/features/auth/authApi';

export function Topbar({ title }: { title: string }) {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-ink-100 bg-white/80 px-6 backdrop-blur dark:border-navy-800 dark:bg-navy-900/80">
      <h1 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{title}</h1>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex items-center gap-2 rounded-full border border-ink-200 py-1 pl-1 pr-3 text-sm text-ink-700 hover:bg-ink-50 dark:border-navy-700 dark:text-ink-200 dark:hover:bg-navy-800"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-navy-800 text-white">
            <User className="size-4" aria-hidden="true" />
          </span>
          {profile?.full_name ?? 'Account'}
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-44 rounded-[var(--radius-md)] border border-ink-100 bg-white py-1 shadow-[var(--shadow-soft)] dark:border-navy-700 dark:bg-navy-900"
          >
            <button
              role="menuitem"
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-navy-800"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
