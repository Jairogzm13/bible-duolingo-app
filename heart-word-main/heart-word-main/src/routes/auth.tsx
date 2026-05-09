import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Lock, BookOpen, ArrowRight, User as UserIcon, Apple } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useSession } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/" });
  }, [session, loading, navigate]);

  async function emailAuth(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success(t("auth.checkEmail"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err?.message || t("auth.error"));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) throw new Error((result.error as any)?.message ?? "Google error");
    } catch (err: any) {
      toast.error(err?.message || t("auth.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-gradient-divine px-6 pb-8 pt-10">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-sky shadow-glow">
          <BookOpen className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold">{t("auth.welcome")}</h1>
        <p className="mt-2 max-w-xs text-balance text-sm text-muted-foreground">{t("auth.tagline")}</p>
      </motion.div>

      <div className="mx-auto mt-8 flex w-fit rounded-full bg-secondary p-1">
        {(["signup", "signin"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition ${mode === m ? "bg-card text-primary shadow-card" : "text-muted-foreground"}`}
          >
            {m === "signup" ? t("auth.signup") : t("auth.signin")}
          </button>
        ))}
      </div>

      <form onSubmit={emailAuth} className="mt-6 space-y-3">
        {mode === "signup" && (
          <Field icon={<UserIcon className="h-4 w-4 text-muted-foreground" />} placeholder={t("auth.name")} value={name} onChange={setName} />
        )}
        <Field icon={<Mail className="h-4 w-4 text-muted-foreground" />} placeholder={t("auth.email")} type="email" value={email} onChange={setEmail} required />
        <Field icon={<Lock className="h-4 w-4 text-muted-foreground" />} placeholder={t("auth.password")} type="password" value={password} onChange={setPassword} required />
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-display font-bold text-primary-foreground shadow-pop active:translate-y-0.5 active:shadow-none disabled:opacity-50"
        >
          {mode === "signup" ? t("auth.begin") : t("common.continue")} <ArrowRight className="h-5 w-5" />
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("auth.or")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={google}
        disabled={busy}
        className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card py-3.5 font-display font-bold shadow-card disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
        {t("auth.google")}
      </button>

      <button
        type="button"
        onClick={() => toast.info(t("auth.appleSoon"))}
        className="mt-3 flex items-center justify-center gap-3 rounded-2xl border border-border bg-card py-3.5 font-display font-bold shadow-card opacity-60"
      >
        <Apple className="h-5 w-5" />
        {t("auth.apple")}
      </button>

      <p className="mt-6 text-center text-xs text-muted-foreground">{t("auth.terms")}</p>
    </div>
  );
}

function Field({ icon, placeholder, value, onChange, type = "text", required }: any) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-card focus-within:border-primary">
      {icon}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        required={required}
        className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}