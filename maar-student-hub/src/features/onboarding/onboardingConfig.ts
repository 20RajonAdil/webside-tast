import type { LearningStyle } from '@/types/database';

// Mirrors supabase/schema.sql `education_systems` seed data. Fetched from
// the DB at runtime (see useEducationSystems), duplicated here only as a
// typed fallback so the wizard can render before the network round-trip.
export const EDUCATION_SYSTEMS_FALLBACK = [
  { code: 'GCSE', label: 'GCSE' },
  { code: 'A_LEVEL', label: 'A-Level' },
  { code: 'BTEC', label: 'BTEC' },
  { code: 'T_LEVEL', label: 'T-Level' },
  { code: 'UNIVERSITY', label: 'University' },
  { code: 'SSC', label: 'SSC' },
  { code: 'HSC', label: 'HSC' },
  { code: 'CBSE', label: 'CBSE' },
  { code: 'ICSE', label: 'ICSE' },
  { code: 'IB', label: 'International Baccalaureate' },
  { code: 'SAT', label: 'SAT / US High School' },
  { code: 'OTHER', label: 'Other' },
];

export const LEARNING_STYLES: { value: LearningStyle; label: string; description: string }[] = [
  { value: 'VISUAL', label: 'Visual', description: 'Diagrams, colour-coding, mind maps' },
  { value: 'AUDITORY', label: 'Auditory', description: 'Listening, discussion, reading aloud' },
  { value: 'READING_WRITING', label: 'Reading / Writing', description: 'Notes, lists, written summaries' },
  { value: 'KINAESTHETIC', label: 'Kinaesthetic', description: 'Practice questions, hands-on examples' },
  { value: 'NOT_SURE', label: "I'm not sure", description: 'MAAR can suggest one as you go' },
];

export const FOCUS_DURATIONS = [15, 25, 45, 60, 90];
