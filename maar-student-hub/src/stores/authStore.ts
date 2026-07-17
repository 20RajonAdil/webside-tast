import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  status: 'loading' | 'signed-out' | 'signed-in';
  initialize: () => () => void; // returns an unsubscribe function
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  status: 'loading',

  initialize: () => {
    // 1. Hydrate from any existing session immediately (fast paint, no flash of login screen)
    supabase.auth.getSession().then(({ data }) => {
      set({
        session: data.session,
        user: data.session?.user ?? null,
        status: data.session ? 'signed-in' : 'signed-out',
      });
      if (data.session) get().refreshProfile();
    });

    // 2. Stay in sync with sign-in / sign-out / token refresh from any tab
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        status: session ? 'signed-in' : 'signed-out',
      });
      if (session) {
        get().refreshProfile();
      } else {
        set({ profile: null });
      }
    });

    return () => subscription.subscription.unsubscribe();
  },

  refreshProfile: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error && data) set({ profile: data as Profile });
  },
}));
