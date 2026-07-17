import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { EDUCATION_SYSTEMS_FALLBACK, FOCUS_DURATIONS, LEARNING_STYLES } from './onboardingConfig';
import type { LearningStyle } from '@/types/database';

interface WizardData {
  fullName: string;
  age: string;
  country: string;
  educationSystemCode: string;
  institutionName: string;
  currentYear: string;
  subjects: string[];
  studyGoal: string;
  preferredStudyDuration: number;
  preferredFocusSession: number;
  learningStyle: LearningStyle | null;
}

const STEPS = ['About you', 'Education', 'Subjects', 'Study preferences', 'Learning style'] as const;

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjectDraft, setSubjectDraft] = useState('');
  const [data, setData] = useState<WizardData>({
    fullName: '',
    age: '',
    country: '',
    educationSystemCode: '',
    institutionName: '',
    currentYear: '',
    subjects: [],
    studyGoal: '',
    preferredStudyDuration: 25,
    preferredFocusSession: 25,
    learningStyle: null,
  });

  function update<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function addSubject() {
    const trimmed = subjectDraft.trim();
    if (!trimmed || data.subjects.includes(trimmed)) return;
    update('subjects', [...data.subjects, trimmed]);
    setSubjectDraft('');
  }

  function removeSubject(name: string) {
    update('subjects', data.subjects.filter((s) => s !== name));
  }

  const canAdvance = (() => {
    switch (step) {
      case 0:
        return data.fullName.trim().length > 0;
      case 1:
        return data.educationSystemCode.length > 0;
      case 2:
        return data.subjects.length > 0;
      case 3:
        return true;
      case 4:
        return data.learningStyle !== null;
      default:
        return true;
    }
  })();

  async function handleFinish() {
    if (!user) return;
    setIsSaving(true);
    setError(null);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          age: data.age ? Number(data.age) : null,
          country: data.country || null,
          education_system_code: data.educationSystemCode,
          institution_name: data.institutionName || null,
          current_year: data.currentYear || null,
          study_goal: data.studyGoal || null,
          preferred_study_duration_minutes: data.preferredStudyDuration,
          preferred_focus_session_minutes: data.preferredFocusSession,
          learning_style: data.learningStyle,
          onboarding_completed: true,
        })
        .eq('id', user.id);
      if (profileError) throw profileError;

      const palette = ['#2C4F85', '#059669', '#D97706', '#7C3AED', '#5F87BB', '#047857'];
      const { error: subjectsError } = await supabase.from('subjects').insert(
        data.subjects.map((name, i) => ({
          user_id: user.id,
          name,
          color_hex: palette[i % palette.length],
        }))
      );
      if (subjectsError) throw subjectsError;

      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id }, { onConflict: 'user_id' });
      if (settingsError) throw settingsError;

      await refreshProfile();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your setup. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-ink-50 px-4 py-10 dark:bg-navy-950">
      <Logo size={36} />

      <div className="mt-8 flex w-full max-w-xl items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={`h-1.5 w-full rounded-full ${i <= step ? 'bg-emerald-500' : 'bg-ink-200 dark:bg-navy-800'}`}
            />
            <span className="hidden text-[11px] text-ink-500 sm:block dark:text-ink-400">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 w-full max-w-xl rounded-[var(--radius-lg)] border border-ink-100 bg-white p-7 shadow-[var(--shadow-soft)] dark:border-navy-800 dark:bg-navy-900">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">Let's set up your Hub</h2>
            <Input label="Full name" required value={data.fullName} onChange={(e) => update('fullName', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Age (optional)" type="number" min={5} max={100} value={data.age} onChange={(e) => update('age', e.target.value)} />
              <Input label="Country" value={data.country} onChange={(e) => update('country', e.target.value)} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">Your education</h2>
            <div>
              <span className="mb-2 block text-sm font-medium text-ink-700 dark:text-ink-200">Education system</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {EDUCATION_SYSTEMS_FALLBACK.map((sys) => (
                  <button
                    key={sys.code}
                    type="button"
                    onClick={() => update('educationSystemCode', sys.code)}
                    className={`rounded-[var(--radius-md)] border px-3 py-2 text-left text-sm transition-colors ${
                      data.educationSystemCode === sys.code
                        ? 'border-navy-600 bg-navy-50 text-navy-800 dark:bg-navy-800 dark:text-white'
                        : 'border-ink-200 text-ink-600 hover:bg-ink-50 dark:border-navy-700 dark:text-ink-300 dark:hover:bg-navy-800'
                    }`}
                  >
                    {sys.label}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="School, college or university (optional)"
              value={data.institutionName}
              onChange={(e) => update('institutionName', e.target.value)}
            />
            <Input label="Current year (optional)" placeholder="e.g. Year 12, Year 2" value={data.currentYear} onChange={(e) => update('currentYear', e.target.value)} />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">Your subjects</h2>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="Add a subject"
                  value={subjectDraft}
                  onChange={(e) => setSubjectDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSubject();
                    }
                  }}
                  placeholder="e.g. Biology"
                />
              </div>
              <Button type="button" variant="secondary" className="mt-7" onClick={addSubject}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.subjects.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1 text-sm text-navy-700 dark:bg-navy-800 dark:text-navy-100"
                >
                  {s}
                  <button type="button" aria-label={`Remove ${s}`} onClick={() => removeSubject(s)} className="text-navy-400 hover:text-navy-700">
                    ×
                  </button>
                </span>
              ))}
              {data.subjects.length === 0 && <p className="text-sm text-ink-400">No subjects added yet.</p>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">Study preferences</h2>
            <Input label="What's your main study goal? (optional)" placeholder="e.g. Achieve A*AA at A-Level" value={data.studyGoal} onChange={(e) => update('studyGoal', e.target.value)} />
            <div>
              <span className="mb-2 block text-sm font-medium text-ink-700 dark:text-ink-200">Preferred study session length</span>
              <div className="flex flex-wrap gap-2">
                {FOCUS_DURATIONS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => update('preferredStudyDuration', mins)}
                    className={`rounded-full border px-4 py-1.5 text-sm ${
                      data.preferredStudyDuration === mins
                        ? 'border-navy-600 bg-navy-50 text-navy-800 dark:bg-navy-800 dark:text-white'
                        : 'border-ink-200 text-ink-600 dark:border-navy-700 dark:text-ink-300'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium text-ink-700 dark:text-ink-200">Preferred focus session length</span>
              <div className="flex flex-wrap gap-2">
                {FOCUS_DURATIONS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => update('preferredFocusSession', mins)}
                    className={`rounded-full border px-4 py-1.5 text-sm ${
                      data.preferredFocusSession === mins
                        ? 'border-navy-600 bg-navy-50 text-navy-800 dark:bg-navy-800 dark:text-white'
                        : 'border-ink-200 text-ink-600 dark:border-navy-700 dark:text-ink-300'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">How do you learn best?</h2>
            <div className="grid gap-2">
              {LEARNING_STYLES.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => update('learningStyle', style.value)}
                  className={`rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors ${
                    data.learningStyle === style.value
                      ? 'border-navy-600 bg-navy-50 dark:bg-navy-800'
                      : 'border-ink-200 hover:bg-ink-50 dark:border-navy-700 dark:hover:bg-navy-800'
                  }`}
                >
                  <span className="block text-sm font-medium text-ink-800 dark:text-ink-100">{style.label}</span>
                  <span className="block text-xs text-ink-500 dark:text-ink-400">{style.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-sm text-amber-600 dark:text-amber-400">
            {error}
          </p>
        )}

        <div className="mt-7 flex items-center justify-between">
          <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" disabled={!canAdvance} onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button type="button" disabled={!canAdvance} isLoading={isSaving} onClick={handleFinish}>
              Go to my dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
