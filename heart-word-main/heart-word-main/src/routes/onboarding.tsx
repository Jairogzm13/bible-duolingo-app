import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, BookOpen, Heart, Sun, Cross, HandHeart, Lightbulb, Sparkles, ArrowRight } from "lucide-react";
import { updateProfile, useProfile } from "@/lib/auth";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({ topics: [] });

  useEffect(() => {
    if (!loading && profile?.onboarded) navigate({ to: "/assessment" });
  }, [loading, profile?.onboarded, navigate]);

  const steps = [
    { type: "intro" as const, title: t("onboarding.welcomeTitle"), sub: t("onboarding.welcomeSub") },
    {
      type: "single" as const,
      key: "knowledgeLevel",
      title: t("onboarding.knowledgeQ"),
      sub: t("onboarding.knowledgeSub"),
      options: [
        { id: "beginner", label: t("onboarding.starting"), emoji: "🌱" },
        { id: "intermediate", label: t("onboarding.basics"), emoji: "📖" },
        { id: "advanced", label: t("onboarding.deep"), emoji: "🕊️" },
      ],
    },
    {
      type: "single" as const,
      key: "goal",
      title: t("onboarding.goalQ"),
      sub: t("onboarding.goalSub"),
      options: [
        { id: "habit", label: t("onboarding.habit"), emoji: "🔥" },
        { id: "understand", label: t("onboarding.understand"), emoji: "🧠" },
        { id: "closer", label: t("onboarding.closer"), emoji: "✝️" },
        { id: "memorize", label: t("onboarding.memorize"), emoji: "💡" },
      ],
    },
    {
      type: "minutes" as const,
      key: "dailyMinutes",
      title: t("onboarding.timeQ"),
      sub: t("onboarding.timeSub"),
      options: [
        { id: 5, label: "5 " + t("common.minutes"), desc: t("onboarding.casual") },
        { id: 10, label: "10 " + t("common.minutes"), desc: t("onboarding.regular") },
        { id: 15, label: "15 " + t("common.minutes"), desc: t("onboarding.serious") },
        { id: 30, label: "30 " + t("common.minutes"), desc: t("onboarding.devoted") },
      ],
    },
    {
      type: "multi" as const,
      key: "topics",
      title: t("onboarding.topicsQ"),
      sub: t("onboarding.topicsSub"),
      options: [
        { id: "gospel", label: "Gospel", icon: Cross },
        { id: "prayer", label: "Prayer", icon: HandHeart },
        { id: "wisdom", label: "Wisdom", icon: Lightbulb },
        { id: "faith", label: "Faith", icon: Heart },
        { id: "psalms", label: "Psalms", icon: Sun },
        { id: "prophecy", label: "Prophecy", icon: Sparkles },
        { id: "history", label: "History", icon: BookOpen },
      ],
    },
  ];

  const current = steps[step];
  const total = steps.length;
  const pct = ((step + 1) / total) * 100;

  const canNext =
    current.type === "intro" ||
    (current.type === "multi" ? (answers.topics?.length ?? 0) > 0 : answers[(current as any).key] !== undefined);

  async function next() {
    if (step === total - 1) {
      await updateProfile({
        onboarded: true,
        goal: answers.goal,
        daily_minutes: answers.dailyMinutes,
        topics: answers.topics,
        difficulty_tier: answers.knowledgeLevel ?? "beginner",
      });
      navigate({ to: "/assessment" });
    } else setStep((s) => s + 1);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-gradient-divine px-5 pb-8 pt-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="rounded-full p-2 text-muted-foreground disabled:opacity-30" disabled={step === 0}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <motion.div animate={{ width: `${pct}%` }} className="h-full rounded-full bg-gradient-sky" />
        </div>
        <span className="w-10 text-right text-xs font-bold text-muted-foreground">{step + 1}/{total}</span>
      </div>

      <div className="mt-10 flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            {current.type === "intro" && (
              <div className="flex flex-col items-center pt-6 text-center">
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-sky shadow-glow">
                  <BookOpen className="h-16 w-16 text-primary-foreground" strokeWidth={2.2} />
                </motion.div>
                <h1 className="mt-8 font-display text-3xl font-bold text-balance">{current.title}</h1>
                <p className="mt-3 max-w-xs text-balance text-muted-foreground">{current.sub}</p>
              </div>
            )}

            {current.type !== "intro" && (
              <div>
                <h1 className="font-display text-2xl font-bold leading-tight text-balance">{current.title}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{current.sub}</p>

                <div className="mt-6 space-y-3">
                  {current.type === "single" &&
                    (current.options as any[]).map((o) => {
                      const active = answers[(current as any).key] === o.id;
                      return (
                        <button
                          key={o.id}
                          onClick={() => setAnswers((a: any) => ({ ...a, [(current as any).key]: o.id }))}
                          className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${active ? "border-primary bg-primary/5 shadow-soft" : "border-border bg-card"}`}
                        >
                          <span className="text-2xl">{o.emoji}</span>
                          <span className="flex-1 font-display font-semibold">{o.label}</span>
                          {active && <span className="h-3 w-3 rounded-full bg-primary" />}
                        </button>
                      );
                    })}

                  {current.type === "minutes" && (
                    <div className="grid grid-cols-2 gap-3">
                      {(current.options as any[]).map((o) => {
                        const active = answers.dailyMinutes === o.id;
                        return (
                          <button
                            key={o.id}
                            onClick={() => setAnswers((a: any) => ({ ...a, dailyMinutes: o.id }))}
                            className={`flex flex-col items-center rounded-2xl border-2 p-5 transition ${active ? "border-primary bg-primary/5 shadow-soft" : "border-border bg-card"}`}
                          >
                            <span className="font-display text-2xl font-bold text-primary">{o.label}</span>
                            <span className="mt-1 text-xs font-semibold text-muted-foreground">{o.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {current.type === "multi" && (
                    <div className="flex flex-wrap gap-2">
                      {(current.options as any[]).map((o) => {
                        const active = answers.topics?.includes(o.id);
                        const Icon = o.icon;
                        return (
                          <button
                            key={o.id}
                            onClick={() =>
                              setAnswers((a: any) => ({
                                ...a,
                                topics: active ? a.topics.filter((t: string) => t !== o.id) : [...(a.topics ?? []), o.id],
                              }))
                            }
                            className={`flex items-center gap-2 rounded-full border-2 px-4 py-2.5 transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-bold">{o.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={next}
        disabled={!canNext}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-display text-base font-bold text-primary-foreground shadow-pop transition active:translate-y-0.5 active:shadow-none disabled:opacity-40"
      >
        {step === total - 1 ? t("auth.begin") : t("common.continue")}
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}