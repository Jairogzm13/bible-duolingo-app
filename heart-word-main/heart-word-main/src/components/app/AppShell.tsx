import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, BookOpen, Sparkles, Book, User } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session, loading } = useSession();

  useEffect(() => {
    if (!loading && !session && location.pathname !== "/auth") {
      navigate({ to: "/auth" });
    }
  }, [loading, session, location.pathname, navigate]);

  const tabs = [
    { to: "/", label: t("nav.home"), icon: Home },
    { to: "/learn", label: t("nav.learn"), icon: BookOpen },
    { to: "/assistant", label: t("nav.ai"), icon: Sparkles },
    { to: "/bible", label: t("nav.bible"), icon: Book },
    { to: "/profile", label: t("nav.profile"), icon: User },
  ] as const;
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <main className="flex-1 pb-24">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto max-w-md px-3 pb-3">
          <div className="flex items-center justify-between rounded-3xl border border-border bg-card/95 px-2 py-2 shadow-card backdrop-blur-md">
            {tabs.map((tab) => {
              const active = location.pathname === tab.to || (tab.to !== "/" && location.pathname.startsWith(tab.to));
              const Icon = tab.icon;
              return (
                <Link key={tab.to} to={tab.to} className="relative flex flex-1 flex-col items-center gap-0.5 py-2">
                  {active && (
                    <motion.div
                      layoutId="tab-pill"
                      className="absolute inset-1 rounded-2xl bg-primary/10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={`relative h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} strokeWidth={active ? 2.5 : 2} />
                  <span className={`relative text-[10px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
