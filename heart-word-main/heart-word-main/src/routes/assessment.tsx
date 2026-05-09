import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, ArrowRight, Check, X, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity, updateProfile, useProfile } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/assessment")({
  component: AssessmentPage,
});

type Q = {
  q: string;
  options: string[];
  answer: number;
  difficulty: string;
  testament: string;
  reference: string;
  explanation: string;
};

function AssessmentPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const [phase, setPhase] = useState<"intro" | "loading" | "quiz" | "evaluating" | "result">("intro");
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ correct: boolean; difficulty: string; testament: string }[]>([]);
  const [result, setResult] = useState<{ tier: string; knowledge_score: number; note: string; focus_topics: string[] } | null>(null);

  useEffect(() => {
    if (!loading && !profile) navigate({ to: "/auth" });
  }, [loading, profile, navigate]);

  async function generate() {
    setPhase("loading");
    try {
      const { data, error } = await supabase.functions.invoke("ai-assessment", {
        body: { mode: "generate", language: i18n.language, knowledgeHint: profile?.difficulty_tier ?? "beginner" },
      });
      if (error) throw error;
      setQuestions(data.questions);
      setPhase("quiz");
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
      setPhase("intro");
    }
  }

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const q = questions[idx];
    const correct = i === q.answer;
    setAnswers((a) => [...a, { correct, difficulty: q.difficulty, testament: q.testament }]);
    setTimeout(() => {
      if (idx + 1 < questions.length) {
        setIdx(idx + 1);
        setPicked(null);
      } else {
        evaluate();
      }
    }, 1400);
  }

  async function evaluate() {
    setPhase("evaluating");
    try {
      const { data, error } = await supabase.functions.invoke("ai-assessment", {
        body: { mode: "evaluate", language: i18n.language, answers: answers.concat([{ correct: questions[idx].answer === picked, difficulty: questions[idx].difficulty, testament: questions[idx].testament }]) },
      });
      if (error) throw error;
      setResult(data);
      await updateProfile({
        difficulty_tier: data.tier,
        knowledge_score: data.knowledge_score,
        assessment_completed: true,
      });
      await logActivity("assessment_completed", data, 100);
      setPhase("result");
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
      setPhase("quiz");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-gradient-divine px-5 pb-8 pt-8">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-sky shadow-glow">
              <Sparkles className="h-12 w-12 text-primary-foreground" />
            </div>
            <h1 className="mt-6 font-display text-2xl font-bold">{t("assessment.title")}</h1>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t("assessment.subtitle")}</p>
            <p className="mt-6 max-w-sm rounded-3xl border border-border bg-card p-5 text-sm shadow-card">{t("assessment.intro")}</p>
            <div className="flex-1" />
            <button
              onClick={generate}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-display font-bold text-primary-foreground shadow-pop active:translate-y-0.5 active:shadow-none"
            >
              {t("assessment.start")} <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}

        {(phase === "loading" || phase === "evaluating") && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col items-center justify-center gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-12 w-12 text-primary" />
            </motion.div>
            <p className="font-display text-base font-semibold">{phase === "loading" ? t("assessment.generating") : t("assessment.analyzing")}</p>
          </motion.div>
        )}

        {phase === "quiz" && questions[idx] && (
          <motion.div key={`q-${idx}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-1 flex-col">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground">{idx + 1}/{questions.length}</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{questions[idx].testament} · {questions[idx].difficulty}</span>
            </div>
            <h2 className="font-display text-xl font-bold leading-snug">{questions[idx].q}</h2>
            <div className="mt-6 space-y-3">
              {questions[idx].options.map((o, i) => {
                const isCorrect = i === questions[idx].answer;
                const isPicked = i === picked;
                const reveal = picked !== null;
                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    disabled={picked !== null}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                      reveal && isCorrect
                        ? "border-success bg-success/10"
                        : reveal && isPicked
                        ? "border-heart bg-heart/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <span className="font-display font-semibold flex-1">{o}</span>
                    {reveal && isCorrect && <Check className="h-5 w-5 text-success" />}
                    {reveal && isPicked && !isCorrect && <X className="h-5 w-5 text-heart" />}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-secondary p-4 text-sm">
                <p className="font-bold text-primary">{questions[idx].reference}</p>
                <p className="mt-1 text-muted-foreground">{questions[idx].explanation}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === "result" && result && (
          <motion.div key="result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-1 flex-col items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-gold shadow-glow">
              <Crown className="h-14 w-14 text-gold-foreground" />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("assessment.yourLevel")}</p>
            <h1 className="mt-1 font-display text-3xl font-bold capitalize">{result.tier}</h1>
            <p className="mt-2 text-sm font-bold text-primary">{t("assessment.yourScore")}: {result.knowledge_score}/100</p>
            <p className="mt-6 max-w-sm rounded-3xl border border-border bg-card p-5 text-sm leading-relaxed shadow-card">{result.note}</p>
            <div className="flex-1" />
            <button
              onClick={() => navigate({ to: "/" })}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-display font-bold text-primary-foreground shadow-pop"
            >
              {t("assessment.continue")} <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}