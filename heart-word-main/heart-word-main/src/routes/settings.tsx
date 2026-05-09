import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ChevronLeft, Sun, Moon, Monitor, Languages, LogOut, RefreshCw } from "lucide-react";
import { signOut, updateProfile, useProfile } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  async function changeLang(lng: "es" | "en") {
    await i18n.changeLanguage(lng);
    if (profile) await updateProfile({ language: lng });
  }

  async function changeTheme(v: string) {
    setTheme(v);
    if (profile) await updateProfile({ theme: v });
  }

  async function out() {
    await signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-10">
      <header className="flex items-center gap-3 border-b border-border bg-card/60 px-5 py-4 backdrop-blur">
        <Link to="/profile" className="rounded-full p-2 text-muted-foreground"><ChevronLeft className="h-5 w-5" /></Link>
        <h1 className="font-display text-xl font-bold">{t("settings.title")}</h1>
      </header>

      <div className="space-y-6 px-5 pt-6">
        <Section title={t("settings.appearance")}>
          <Row label={t("settings.theme")}>
            <div className="flex gap-2">
              {[
                { v: "light", icon: Sun, label: t("settings.light") },
                { v: "dark", icon: Moon, label: t("settings.dark") },
                { v: "system", icon: Monitor, label: t("settings.system") },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = mounted && theme === opt.v;
                return (
                  <button
                    key={opt.v}
                    onClick={() => changeTheme(opt.v)}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 p-3 transition ${
                      active ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[11px] font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </Row>
        </Section>

        <Section title={t("settings.language")}>
          <div className="flex gap-2">
            {[
              { v: "es", label: "Español" },
              { v: "en", label: "English" },
            ].map((opt) => {
              const active = i18n.language === opt.v;
              return (
                <button
                  key={opt.v}
                  onClick={() => changeLang(opt.v as any)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3.5 transition ${
                    active ? "border-primary bg-primary/5 text-primary" : "border-border bg-card"
                  }`}
                >
                  <Languages className="h-4 w-4" />
                  <span className="text-sm font-bold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title={t("settings.account")}>
          <button
            onClick={() => { toast.success("Reset"); navigate({ to: "/assessment" }); }}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-card"
          >
            <RefreshCw className="h-5 w-5 text-primary" />
            <span className="flex-1 text-sm font-semibold">{t("profile.retakeAssessment")}</span>
          </button>
          <button
            onClick={out}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-card"
          >
            <LogOut className="h-5 w-5 text-heart" />
            <span className="flex-1 text-sm font-semibold">{t("common.signOut")}</span>
          </button>
        </Section>

        <p className="text-center text-xs text-muted-foreground">{t("settings.about")} · {t("settings.version")} 1.0.0</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
      <p className="mb-3 text-sm font-semibold">{label}</p>
      {children}
    </div>
  );
}