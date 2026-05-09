import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  language: string;
  theme: string;
  level: number;
  xp: number;
  streak: number;
  hearts: number;
  gems: number;
  difficulty_tier: "beginner" | "intermediate" | "advanced" | "scholar";
  knowledge_score: number;
  onboarded: boolean;
  assessment_completed: boolean;
  goal: string | null;
  daily_minutes: number | null;
  topics: string[] | null;
};

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return { session, user: session?.user ?? null as User | null, loading };
}

export function useProfile() {
  const { session, loading: sLoading } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sLoading) return;
    if (!session?.user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancel = false;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      if (!cancel) {
        setProfile(data as Profile | null);
        setLoading(false);
      }
    })();
    const ch = supabase
      .channel("profile-" + session.user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `id=eq.${session.user.id}` }, (p) => {
        setProfile(p.new as Profile);
      })
      .subscribe();
    return () => {
      cancel = true;
      supabase.removeChannel(ch);
    };
  }, [session?.user?.id, sLoading]);

  return { profile, loading: loading || sLoading, userId: session?.user?.id ?? null };
}

export async function updateProfile(patch: Partial<Profile>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").update(patch).eq("id", user.id);
}

export async function logActivity(type: string, payload: Record<string, any> = {}, xp = 0) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("activities").insert({ user_id: user.id, type, payload, xp_earned: xp });
  if (xp > 0) {
    const { data: p } = await supabase.from("profiles").select("xp, level").eq("id", user.id).maybeSingle();
    if (p) {
      const newXp = (p.xp ?? 0) + xp;
      const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);
      await supabase.from("profiles").update({ xp: newXp, level: newLevel, last_active_at: new Date().toISOString() }).eq("id", user.id);
    }
  }
}

export async function signOut() {
  await supabase.auth.signOut();
}