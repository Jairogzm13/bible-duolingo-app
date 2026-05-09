import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, BookOpen, Bookmark, X } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { BIBLE, fetchPassage, type FetchResult } from "@/lib/bible";
import { readingPlans, dailyQuotes } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/bible")({
  head: () => ({ meta: [{ title: "Bible — Lumen" }] }),
  component: BiblePage,
});

function BiblePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === "en" ? "en" : "es";
  const devotional = dailyQuotes[(new Date().getDate() + 2) % dailyQuotes.length];

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"OT" | "NT">("OT");
  const [openBook, setOpenBook] = useState<string | null>(null);
  const [chapter, setChapter] = useState(1);
  const [passage, setPassage] = useState<FetchResult | null>(null);
  const [loadingP, setLoadingP] = useState(false);
  const [searchResult, setSearchResult] = useState<FetchResult | null>(null);

  const filteredBooks = BIBLE.filter((b) => b.testament === tab && (
    !query || b.en.toLowerCase().includes(query.toLowerCase()) || b.es.toLowerCase().includes(query.toLowerCase())
  ));

  async function doSearch() {
    if (!query.trim()) return;
    setLoadingP(true);
    const r = await fetchPassage(query, lang as any);
    setLoadingP(false);
    if (r) setSearchResult(r);
    else toast.error(t("bible.noResults"));
  }

  useEffect(() => {
    if (!openBook) return;
    const book = BIBLE.find((b) => b.id === openBook);
    if (!book) return;
    setLoadingP(true);
    fetchPassage(`${book.en} ${chapter}`, lang as any).then((r) => {
      setPassage(r);
      setLoadingP(false);
    });
  }, [openBook, chapter, lang]);

  async function saveVerse(ref: string, text: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("saved_verses").insert({ user_id: user.id, reference: ref, text });
    await logActivity("verse_saved", { ref });
    toast.success("✓");
  }

  return (
    <AppShell>
      <header className="bg-gradient-hero px-5 pb-4 pt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("bible.readReflect")}</p>
        <h1 className="font-display text-2xl font-bold">{t("bible.title")}</h1>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder={t("bible.searchPlaceholder")}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && <button onClick={() => { setQuery(""); setSearchResult(null); }}><X className="h-4 w-4 text-muted-foreground" /></button>}
        </div>
      </header>

      <div className="space-y-5 px-5 pt-4">
        {searchResult && (
          <div className="rounded-3xl border border-primary/30 bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display font-bold text-primary">{searchResult.reference}</p>
              <button onClick={() => saveVerse(searchResult.reference, searchResult.text)}><Bookmark className="h-4 w-4 text-gold" /></button>
            </div>
            <div className="mt-2 space-y-1 text-sm leading-relaxed">
              {searchResult.verses.map((v, i) => (
                <p key={i}><span className="text-xs font-bold text-primary mr-1">{v.verse}</span>{v.text.trim()}</p>
              ))}
            </div>
          </div>
        )}

        {!openBook && !searchResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden rounded-3xl bg-gradient-sky p-5 shadow-glow">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/80">{t("bible.todaysDevo")}</p>
            <p className="mt-2 font-display text-lg font-semibold leading-snug text-primary-foreground">"{devotional[lang]}"</p>
            <p className="mt-1 text-xs font-bold text-primary-foreground/80">{devotional.ref}</p>
          </motion.div>
        )}

        {!openBook && (
          <>
            <div>
              <h2 className="mb-3 font-display text-lg font-bold">{t("bible.plans")}</h2>
              <div className="-mx-5 flex gap-3 overflow-x-auto px-5 no-scrollbar">
                {readingPlans.map((p) => (
                  <div key={p.id} className="min-w-[200px] rounded-3xl border border-border bg-card p-4 shadow-card">
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${p.accent === "gold" ? "bg-gradient-gold" : "bg-gradient-sky"}`}>
                      <BookOpen className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <p className="font-display text-base font-bold">{lang === "en" ? p.titleEn : p.titleEs}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{lang === "en" ? p.descEn : p.descEs}</p>
                    <p className="mt-3 text-xs font-bold text-primary">{p.days} {t("common.days")}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">{t("bible.browseBooks")}</h2>
                <div className="flex rounded-full bg-secondary p-1">
                  {(["OT", "NT"] as const).map((x) => (
                    <button key={x} onClick={() => setTab(x)} className={`rounded-full px-3 py-1 text-xs font-bold ${tab === x ? "bg-card text-primary shadow-card" : "text-muted-foreground"}`}>
                      {x === "OT" ? t("bible.oldTestament") : t("bible.newTestament")}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filteredBooks.map((b) => (
                  <button key={b.id} onClick={() => { setOpenBook(b.id); setChapter(1); }} className="rounded-2xl border border-border bg-card p-3 text-left shadow-card transition active:scale-95">
                    <p className="font-display font-bold">{lang === "en" ? b.en : b.es}</p>
                    <p className="text-xs text-muted-foreground">{b.chapters} {t("bible.chapters")}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {openBook && (() => {
          const book = BIBLE.find((b) => b.id === openBook)!;
          return (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <button onClick={() => { setOpenBook(null); setPassage(null); }} className="text-sm font-bold text-primary">‹ {t("common.back")}</button>
                <p className="font-display font-bold">{lang === "en" ? book.en : book.es}</p>
              </div>
              <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-3 no-scrollbar">
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
                  <button key={c} onClick={() => setChapter(c)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${c === chapter ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}>{c}</button>
                ))}
              </div>
              <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
                <p className="mb-3 font-display font-bold text-primary">{t("bible.chapter")} {chapter}</p>
                {loadingP ? (
                  <p className="text-sm text-muted-foreground">{t("bible.loadingVerses")}</p>
                ) : passage ? (
                  <div className="space-y-1.5 text-sm leading-relaxed">
                    {passage.verses.map((v, i) => (
                      <p key={i} className="group">
                        <span className="text-xs font-bold text-primary mr-1">{v.verse}</span>
                        {v.text.trim()}
                        <button onClick={() => saveVerse(`${passage.reference.split(":")[0]}:${v.verse}`, v.text.trim())} className="ml-1 opacity-0 group-hover:opacity-100">
                          <Bookmark className="inline h-3 w-3 text-gold" />
                        </button>
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("bible.noResults")}</p>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </AppShell>
  );
}