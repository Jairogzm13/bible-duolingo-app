import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, X, ChevronLeft, Sparkles, Crown } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { logActivity, useProfile } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/lesson/$id")({
  component: LessonPage,
});

type Q = { q: string; options: string[]; answer: number; reference: string; explanation: string };

function LessonPage() {
  const { id } = Route.useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("ai-assessment", {
          body: { mode: "leveled_quiz", language: i18n.language, tier: profile?.difficulty_tier ?? "beginner", topic: id },
        });
        if (error) throw error;
        setQuestions(data.questions);
      } catch (e: any) {
        toast.error(e?.message ?? "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, i18n.language, profile?.difficulty_tier]);

  async function next() {
    if (picked === null) return;
    if (picked === questions[idx].answer) setScore((s) => s + 1);
    if (idx + 1 < questions.length) {
      setIdx(idx + 1); setPicked(null);
    } else {
      const finalScore = score + (picked === questions[idx].answer ? 1 : 0);
      const xp = finalScore * 20;
      await logActivity("lesson_completed", { id, score: finalScore, total: questions.length }, xp);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("lesson_progress").upsert({
          user_id: user.id, lesson_id: id, status: "completed", score: finalScore, completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,lesson_id" });
      }
      setDone(true);
    }
  }

  if (loading) {
    return <AppShell><div className="flex h-[60vh] items-center justify-center"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Sparkles className="h-10 w-10 text-primary" /></motion.div></div></AppShell>;
  }

  if (done) {
    return (
      <AppShell>
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-gold shadow-glow">
            <Crown className="h-14 w-14 text-gold-foreground" />
          </motion.div>
          <h1 className="mt-6 font-display text-2xl font-bold">+{score * 20} XP</h1>
          <p className="mt-2 text-sm text-muted-foreground">{score}/{questions.length}</p>
          <button onClick={() => navigate({ to: "/" })} className="mt-8 w-full max-w-xs rounded-2xl bg-primary py-4 font-display font-bold text-primary-foreground shadow-pop">{t("common.continue")}</button>
        </div>
      </AppShell>
    );
  }

  if (questions.length === 0) {
    return <AppShell><div className="p-10 text-center text-sm text-muted-foreground">{t("common.loading")}</div></AppShell>;
  }

  const q = questions[idx];
  return (
    <AppShell>
      <div className="px-5 pb-10 pt-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: "/" })} className="rounded-full p-2 text-muted-foreground"><ChevronLeft className="h-5 w-5" /></button>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <motion.div animate={{ width: `${((idx + 1) / questions.length) * 100}%` }} className="h-full rounded-full bg-gradient-sky" />
          </div>
          <span className="text-xs font-bold text-muted-foreground">{idx + 1}/{questions.length}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mt-8">
            <h2 className="font-display text-xl font-bold leading-snug">{q.q}</h2>
            <div className="mt-6 space-y-3">
              {q.options.map((o, i) => {
                const isCorrect = i === q.answer;
                const isPicked = i === picked;
                const reveal = picked !== null;
                return (
                  <button key={i} onClick={() => picked === null && setPicked(i)} disabled={picked !== null}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                      reveal && isCorrect ? "border-success bg-success/10" :
                      reveal && isPicked ? "border-heart bg-heart/10" :
                      isPicked ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}>
                    <span className="flex-1 font-display font-semibold">{o}</span>
                    {reveal && isCorrect && <Check className="h-5 w-5 text-success" />}
                    {reveal && isPicked && !isCorrect && <X className="h-5 w-5 text-heart" />}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-2xl bg-secondary p-4 text-sm">
                <p className="font-bold text-primary">{q.reference}</p>
                <p className="mt-1 text-muted-foreground">{q.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <button onClick={next} disabled={picked === null}
          className="mt-8 w-full rounded-2xl bg-primary py-4 font-display font-bold text-primary-foreground shadow-pop disabled:opacity-40">
          {idx + 1 === questions.length ? t("assessment.finish") : t("assessment.next")}
        </button>
      </div>
    </AppShell>
  );
}