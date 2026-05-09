import { ThemeProvider } from "next-themes";
import { useEffect, type ReactNode } from "react";
import "@/lib/i18n";
import { useTranslation } from "react-i18next";

function LangSync() {
  const { i18n } = useTranslation();
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="lumen.theme">
      <LangSync />
      {children}
    </ThemeProvider>
  );
}