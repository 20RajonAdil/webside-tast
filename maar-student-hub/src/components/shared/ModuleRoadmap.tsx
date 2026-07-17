import { Construction } from 'lucide-react';

/**
 * Shown only for modules not yet built. This is intentionally NOT styled
 * as a finished feature — the brief is explicit that nothing should look
 * done when it isn't. Each entry names exactly what phase will build it.
 */
export function ModuleRoadmap({ moduleName, whatItWillDo }: { moduleName: string; whatItWillDo: string[] }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-ink-300 bg-white/60 px-8 py-14 text-center dark:border-navy-700 dark:bg-navy-900/40">
      <Construction className="size-8 text-ink-400" aria-hidden="true" />
      <h2 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100">
        {moduleName} is scheduled for the next build phase
      </h2>
      <p className="text-sm text-ink-500 dark:text-ink-400">
        The architecture, database tables, and RLS policies for this module already exist in the schema.
        It will be built out with the same care as Dashboard and Onboarding — real Supabase-backed
        functionality, not a mockup. Planned for this module:
      </p>
      <ul className="flex flex-col gap-1.5 text-left text-sm text-ink-600 dark:text-ink-300">
        {whatItWillDo.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
