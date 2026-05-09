import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, Sparkles, BookOpen, Heart, HandHeart, Lightbulb } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { logActivity } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "AI — Lumen" }] }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function AssistantPage() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: "assistant", content: t("assistant.greeting") }]);
  }, [i18n.language, t]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const suggestions = [
    { icon: BookOpen, label: t("assistant.suggestions.explain") },
    { icon: HandHeart, label: t("assistant.suggestions.pray") },
    { icon: Heart, label: t("assistant.suggestions.encourage") },
    { icon: Lightbulb, label: t("assistant.suggestions.plan") },
  ];

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, language: i18n.language }),
      });
      if (resp.status === 429) { toast.error("Rate limited"); throw new Error("rate"); }
      if (resp.status === 402) { toast.error("AI credits exhausted"); throw new Error("paid"); }
      if (!resp.ok || !resp.body) throw new Error("net");

      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx); buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(j);
            const c = p.choices?.[0]?.delta?.content;
            if (c) {
              acc += c;
              setMessages((m) => m.map((mm, i) => i === m.length - 1 ? { ...mm, content: acc } : mm));
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
      await logActivity("ai_chat", { q: trimmed }, 5);
    } catch (e) {
      setMessages((m) => m.map((mm, i) => i === m.length - 1 && mm.content === "" ? { ...mm, content: t("assistant.error") } : mm));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-6rem)] flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-card/80 px-5 py-4 backdrop-blur">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-sky shadow-glow">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold">{t("assistant.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("assistant.subtitle")}</p>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user" ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm border border-border bg-card text-foreground shadow-card"
              }`}>
                {m.content || (busy && i === messages.length - 1 ? "…" : "")}
              </div>
            </motion.div>
          ))}

          {messages.length === 1 && !busy && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              {suggestions.map((s) => {
                const Icon = s.icon;
                return (
                  <button key={s.label} onClick={() => send(s.label)} className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-left text-xs font-semibold shadow-card transition active:scale-95">
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card/80 p-3 backdrop-blur">
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder={t("assistant.placeholder")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button onClick={() => send(input)} disabled={!input.trim() || busy}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition active:scale-95 disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}