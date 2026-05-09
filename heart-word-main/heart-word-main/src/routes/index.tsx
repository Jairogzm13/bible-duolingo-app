import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Check, Star, Lock, Crown, Sparkles, ChevronRight, Quote, Zap, BookOpen } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { StatBar } from "@/components/app/StatBar";
import { useProfile } from "@/lib/auth";
import { dailyQuotes, startingPath } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Lumen" }] }),
  component: HomePage,
});

function HomePage() {
  const { t, i18n } = useTranslation();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!profile) return;
    if (!profile.onboarded) navigate({ to: "/onboarding" });
    else if (!profile.assessment_completed) navigate({ to: "/assessment" });
  }, [profile, loading, navigate]);

  if (loading || !profile) return <AppShell><div className="p-10 text-center text-sm text-muted-foreground">{t("common.loading")}</div></AppShell>;

  const quote = dailyQuotes[new Date().getDate() % dailyQuotes.length];
  const xpToNext = 500;
  const xpInLevel = profile.xp % xpToNext;
  const xpPct = Math.round((xpInLevel / xpToNext) * 100);
  const lang = i18n.language === "en" ? "en" : "es";

  // simulated path: 2 done, 1 current, rest locked based on lessons completed
  const path = startingPath.map((n, i) => ({
    ...n,
    status: i < 2 ? "completed" : i === 2 ? "current" : "locked" as "completed" | "current" | "locked",
  }));

  return (
    <AppShell>
      <header className="bg-gradient-hero px-5 pb-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("home.welcomeBack")}</p>
            <h1 className="font-display text-2xl font-bold text-foreground">{t("home.hi")}, {profile.display_name ?? t("common.you")} 👋</h1>
          </div>
          <StatBar />
        </div>

        <div className="mt-5 rounded-3xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-sky shadow-glow">
                <Crown className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">{t("common.level")} {profile.level} · {t(`learn.tier.${profile.difficulty_tier}`)}</p>
                <p className="font-display text-base font-bold">{t("home.discipleInTraining")}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary">{xpInLevel}/{xpToNext} XP</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary">
            <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-sky" />
          </div>
        </div>
      </header>

      <div className="space-y-5 px-5 pt-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-gradient-gold p-5 shadow-glow">
          <Quote className="absolute -right-2 -top-2 h-24 w-24 text-foreground/5" />
          <p className="text-xs font-bold uppercase tracking-widest text-gold-foreground/70">{t("home.verseOfDay")}</p>
          <p className="mt-2 font-display text-lg font-semibold leading-snug text-gold-foreground">"{quote[lang]}"</p>
          <p className="mt-2 text-sm font-bold text-gold-foreground/80">— {quote.ref}</p>
        </motion.div>

        <Link to="/lesson/$id" params={{ id: "daily" }} className="block">
          <motion.div whileTap={{ scale: 0.98 }} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-streak/15">
              <Zap className="h-6 w-6 text-streak" fill="currentColor" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-streak">{t("home.dailyChallenge")}</p>
              <p className="font-display font-bold">{t("home.quizTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("home.keepStreak")}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </Link>

        <div className="rounded-3xl border border-border bg-secondary/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{t("home.section")} 1 · {t("home.unit")} 2</p>
              <h2 className="font-display text-xl font-bold">{t("home.bibleBasics")}</h2>
            </div>
            <Link to="/learn" className="rounded-full bg-card px-3 py-1.5 text-xs font-bold text-primary shadow-card">{t("home.allSections")}</Link>
          </div>
        </div>

        <div className="relative pb-10 pt-4">
          {path.map((node, i) => {
            const offset = Math.sin(i * 0.9) * 70;
            const isCurrent = node.status === "current";
            const isDone = node.status === "completed";
            const isLocked = node.status === "locked";
            const Icon = node.type === "boss" ? Crown : node.type === "quiz" ? Sparkles : node.type === "reflection" ? BookOpen : Star;
            const title = lang === "en" ? node.titleEn : node.titleEs;
            return (
              <div key={node.id} className="relative flex flex-col items-center" style={{ marginTop: i === 0 ? 0 : 18, transform: `translateX(${offset}px)` }}>
                <Link to={isLocked ? "/" : "/lesson/$id"} params={{ id: node.id }} onClick={(e) => isLocked && e.preventDefault()}>
                  <motion.div whileTap={{ scale: isLocked ? 1 : 0.92 }} className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 ${
                    isDone ? "border-success bg-success text-success-foreground shadow-pop" :
                    isCurrent ? "border-primary bg-card text-primary shadow-glow" :
                    "border-border bg-muted text-muted-foreground"
                  } ${node.type === "boss" && !isLocked ? "h-24 w-24" : ""}`}>
                    {isDone ? <Check className="h-8 w-8" strokeWidth={3} /> : isLocked ? <Lock className="h-7 w-7" /> : <Icon className="h-8 w-8" strokeWidth={2.5} />}
                    {isCurrent && (
                      <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} className="absolute -inset-2 rounded-full border-4 border-primary/40" />
                    )}
                    {isCurrent && (
                      <span className="absolute -top-9 whitespace-nowrap rounded-xl bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow">{t("common.start")}</span>
                    )}
                  </motion.div>
                </Link>
                <p className={`mt-2 max-w-[140px] text-center text-xs font-semibold ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>{title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}