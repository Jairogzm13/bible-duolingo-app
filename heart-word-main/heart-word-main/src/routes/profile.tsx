import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Crown, Flame, Star, BookOpen, Calendar, Heart, Settings, Bookmark, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { useProfile } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { achievements } from "@/lib/data";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Lumen" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { profile, userId } = useProfile();
  const navigate = useNavigate();
  const lang = i18n.language === "en" ? "en" : "es";
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());
  const [savedVerses, setSavedVerses] = useState<Array<{ reference: string; text: string }>>([]);
  const [lessonsCount, setLessonsCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const since = new Date(); since.setDate(since.getDate() - 28);
      const [{ data: acts }, { data: sv }, { data: lp }] = await Promise.all([
        supabase.from("activities").select("created_at").eq("user_id", userId).gte("created_at", since.toISOString()),
        supabase.from("saved_verses").select("reference, text").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
        supabase.from("lesson_progress").select("id").eq("user_id", userId).eq("status", "completed"),
      ]);
      const set = new Set<string>();
      (acts ?? []).forEach((a: any) => set.add(new Date(a.created_at).toISOString().slice(0, 10)));
      setActiveDays(set);
      setSavedVerses(sv ?? []);
      setLessonsCount(lp?.length ?? 0);
    })();
  }, [userId]);

  if (!profile) return <AppShell><div className="p-10 text-center text-sm text-muted-foreground">{t("common.loading")}</div></AppShell>;

  const today = new Date();
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (27 - i));
    return { date: d, active: activeDays.has(d.toISOString().slice(0, 10)) };
  });

  const xpInLevel = profile.xp % 500;

  return (
    <AppShell>
      <header className="bg-gradient-hero px-5 pb-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">{t("profile.title")}</h1>
          <Link to="/settings" className="rounded-full bg-card p-2 shadow-card"><Settings className="h-4 w-4" /></Link>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-sky shadow-glow">
              <span className="font-display text-3xl font-bold text-primary-foreground">{(profile.display_name ?? "?").charAt(0).toUpperCase()}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-gold-foreground shadow-card">
              <Crown className="h-3 w-3" /> {profile.level}
            </div>
          </div>
          <div className="flex-1">
            <p className="font-display text-xl font-bold">{profile.display_name ?? t("common.you")}</p>
            <p className="text-xs text-muted-foreground">{t("profile.joined")} · {profile.goal ?? t("profile.growing")}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-gradient-sky" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-3xl border border-border bg-card p-4 shadow-card">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("profile.difficulty")}</p>
            <p className="font-display text-base font-bold capitalize">{t(`learn.tier.${profile.difficulty_tier}`)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("profile.knowledgeScore")}</p>
            <p className="font-display text-base font-bold text-primary">{profile.knowledge_score}/100</p>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-5 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={Flame} value={profile.streak} label={t("profile.stats.streak")} tone="streak" />
          <Stat icon={Star} value={profile.xp} label={t("profile.stats.xp")} tone="gold" />
          <Stat icon={BookOpen} value={lessonsCount} label={t("profile.stats.lessons")} tone="primary" />
          <Stat icon={Heart} value={savedVerses.length} label={t("profile.stats.saved")} tone="heart" />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">{t("profile.calendar")}</h2>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((d, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.01 }}
                  className={`aspect-square rounded-lg ${d.active ? "bg-gradient-sky" : "bg-secondary"}`} />
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-display text-lg font-bold">{t("profile.achievements")}</h2>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((a) => {
              const Icon = a.icon;
              const earned = (a.id === "a1" && profile.streak >= 7) || (a.id === "a2" && profile.level >= 5);
              return (
                <div key={a.id} className={`flex flex-col items-center rounded-2xl border border-border p-3 text-center shadow-card ${earned ? "bg-card" : "bg-muted opacity-50"}`}>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${earned ? "bg-gradient-gold shadow-gold-pop" : "bg-secondary"}`}>
                    <Icon className={`h-6 w-6 ${earned ? "text-gold-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <p className="mt-2 text-xs font-bold">{lang === "en" ? a.titleEn : a.titleEs}</p>
                  <p className="text-[10px] text-muted-foreground">{lang === "en" ? a.descEn : a.descEs}</p>
                </div>
              );
            })}
          </div>
        </div>

        {savedVerses.length > 0 && (
          <div>
            <h2 className="mb-3 font-display text-lg font-bold">{t("profile.saved")}</h2>
            <div className="space-y-2">
              {savedVerses.map((s) => (
                <div key={s.reference} className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
                  <Bookmark className="h-5 w-5 shrink-0 text-gold" fill="currentColor" />
                  <div>
                    <p className="text-sm">"{s.text}"</p>
                    <p className="mt-1 text-xs font-bold text-primary">{s.reference}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate({ to: "/assessment" })}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-bold text-primary shadow-card"
        >
          <Sparkles className="h-4 w-4" />
          {t("profile.retakeAssessment")}
        </button>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, value, label, tone }: { icon: any; value: number; label: string; tone: string }) {
  const bg = tone === "streak" ? "bg-streak/10 text-streak" : tone === "gold" ? "bg-gold/15 text-gold-foreground" : tone === "heart" ? "bg-heart/10 text-heart" : "bg-primary/10 text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
        <Icon className="h-5 w-5" fill="currentColor" />
      </div>
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}