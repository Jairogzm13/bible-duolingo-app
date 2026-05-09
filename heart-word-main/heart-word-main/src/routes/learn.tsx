import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Lock, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { StatBar } from "@/components/app/StatBar";
import { sections, TIER_RANK } from "@/lib/data";
import { useProfile } from "@/lib/auth";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "Learn — Lumen" }] }),
  component: LearnPage,
});

function LearnPage() {
  const { t, i18n } = useTranslation();
  const { profile } = useProfile();
  const userTier = profile?.difficulty_tier ?? "beginner";
  const userRank = TIER_RANK[userTier];
  const lang = i18n.language === "en" ? "en" : "es";

  return (
    <AppShell>
      <header className="bg-gradient-hero px-5 pb-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("learn.chooseWorld")}</p>
            <h1 className="font-display text-2xl font-bold">{t("learn.paths")}</h1>
          </div>
          <StatBar />
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("learn.yourTier")}</span>
          <span className="text-xs font-bold text-primary">{t(`learn.tier.${userTier}`)}</span>
        </div>
      </header>

      <div className="space-y-3 px-5 pt-5">
        {sections.map((s, i) => {
          const Icon = s.icon;
          const unlocked = TIER_RANK[s.minTier] <= userRank;
          const tone = s.color === "gold" ? "bg-gradient-gold" : s.color === "heart" ? "bg-heart" : "bg-gradient-sky";
          const popShadow = s.color === "gold" ? "shadow-gold-pop" : "shadow-pop";
          const title = lang === "en" ? s.titleKey : s.titleEs;
          const sub = lang === "en" ? s.subtitleEn : s.subtitle;
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={unlocked ? "/lesson/$id" : "/learn"} params={{ id: s.id }} onClick={(e) => !unlocked && e.preventDefault()} className="block">
                <div className={`relative overflow-hidden rounded-3xl border border-border bg-card p-4 ${unlocked ? "shadow-card" : "opacity-60"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tone} ${unlocked ? popShadow : ""}`}>
                      {unlocked ? <Icon className="h-7 w-7 text-primary-foreground" strokeWidth={2.4} /> : <Lock className="h-6 w-6 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {t("home.section")} {i + 1} · {s.unitsCount} {t("learn.units")} · {t(`learn.tier.${s.minTier}`)}
                      </p>
                      <h3 className="font-display text-base font-bold">{title}</h3>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {unlocked && (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-sky" style={{ width: `${(i === 0 ? 35 : 10)}%` }} />
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </AppShell>
  );
}