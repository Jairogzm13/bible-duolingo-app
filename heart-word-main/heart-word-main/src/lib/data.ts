import { BookOpen, Cross, Heart, HandHeart, Sparkles, Scroll, Crown, Lightbulb, Flame, Star, Trophy, Calendar, Compass } from "lucide-react";

export const sections = [
  { id: "basics", titleKey: "Bible Basics", titleEs: "Bases de la Biblia", subtitle: "Empieza tu camino", subtitleEn: "Start your journey", icon: BookOpen, color: "primary", unitsCount: 6, minTier: "beginner" },
  { id: "gospel", titleKey: "Jesus & the Gospel", titleEs: "Jesús y el Evangelio", subtitle: "Vida de Cristo", subtitleEn: "Life of Christ", icon: Cross, color: "gold", unitsCount: 8, minTier: "beginner" },
  { id: "faith", titleKey: "Faith", titleEs: "Fe", subtitle: "Creer profundamente", subtitleEn: "Believing deeply", icon: Heart, color: "heart", unitsCount: 5, minTier: "beginner" },
  { id: "prayer", titleKey: "Prayer", titleEs: "Oración", subtitle: "Hablar con Dios", subtitleEn: "Talking with God", icon: HandHeart, color: "primary", unitsCount: 4, minTier: "beginner" },
  { id: "wisdom", titleKey: "Wisdom", titleEs: "Sabiduría", subtitle: "Proverbios y enseñanza", subtitleEn: "Proverbs & teaching", icon: Lightbulb, color: "gold", unitsCount: 6, minTier: "intermediate" },
  { id: "old", titleKey: "Old Testament", titleEs: "Antiguo Testamento", subtitle: "De Génesis a Malaquías", subtitleEn: "Genesis to Malachi", icon: Scroll, color: "primary", unitsCount: 12, minTier: "intermediate" },
  { id: "new", titleKey: "New Testament", titleEs: "Nuevo Testamento", subtitle: "Cartas de gracia", subtitleEn: "Letters of grace", icon: Sparkles, color: "primary", unitsCount: 10, minTier: "intermediate" },
  { id: "prophecies", titleKey: "Prophecies", titleEs: "Profecías", subtitle: "Voces de Dios", subtitleEn: "Voices of God", icon: Compass, color: "gold", unitsCount: 5, minTier: "advanced" },
  { id: "living", titleKey: "Christian Living", titleEs: "Vida Cristiana", subtitle: "Caminar diario", subtitleEn: "Daily walk", icon: Crown, color: "primary", unitsCount: 7, minTier: "advanced" },
  { id: "theology", titleKey: "Theology Deep Dive", titleEs: "Teología Profunda", subtitle: "Doctrina y exégesis", subtitleEn: "Doctrine & exegesis", icon: BookOpen, color: "gold", unitsCount: 8, minTier: "scholar" },
  { id: "history", titleKey: "Biblical History", titleEs: "Historia Bíblica", subtitle: "Contexto y arqueología", subtitleEn: "Context & archaeology", icon: Scroll, color: "primary", unitsCount: 6, minTier: "scholar" },
];

export const TIER_RANK: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2, scholar: 3 };

export const dailyQuotes = [
  { es: "Todo lo puedo en Cristo que me fortalece.", en: "I can do all things through Christ who strengthens me.", ref: "Filipenses 4:13" },
  { es: "Estad quietos y conoced que yo soy Dios.", en: "Be still, and know that I am God.", ref: "Salmo 46:10" },
  { es: "El Señor es mi pastor; nada me faltará.", en: "The Lord is my shepherd; I shall not want.", ref: "Salmo 23:1" },
  { es: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito.", en: "For God so loved the world, that he gave his only Son.", ref: "Juan 3:16" },
  { es: "Confía en el Señor con todo tu corazón.", en: "Trust in the Lord with all your heart.", ref: "Proverbios 3:5" },
];

export const achievements = [
  { id: "a1", icon: Flame, titleEs: "En llamas", titleEn: "On Fire", descEs: "Racha de 7 días", descEn: "7-day streak" },
  { id: "a2", icon: Star, titleEs: "Estrella en ascenso", titleEn: "Rising Star", descEs: "Llega al nivel 5", descEn: "Reach level 5" },
  { id: "a3", icon: BookOpen, titleEs: "Estudioso", titleEn: "Scholar", descEs: "Completa 50 lecciones", descEn: "Complete 50 lessons" },
  { id: "a4", icon: Trophy, titleEs: "Campeón", titleEn: "Champion", descEs: "Top 10 semanal", descEn: "Top 10 weekly" },
  { id: "a5", icon: Calendar, titleEs: "Fiel", titleEn: "Faithful", descEs: "Racha de 30 días", descEn: "30-day streak" },
  { id: "a6", icon: Cross, titleEs: "Discípulo", titleEn: "Disciple", descEs: "Termina mundo Evangelio", descEn: "Finish Gospel world" },
];

export const readingPlans = [
  { id: "p1", titleEs: "Biblia en 90 días", titleEn: "Bible in 90 Days", descEs: "Lee toda la Biblia", descEn: "Read the whole Bible", days: 90, accent: "primary" },
  { id: "p2", titleEs: "Salmos de paz", titleEn: "Psalms of Peace", descEs: "30 días de consuelo", descEn: "30 days of comfort", days: 30, accent: "gold" },
  { id: "p3", titleEs: "Vida de Jesús", titleEn: "Life of Jesus", descEs: "Camina por los Evangelios", descEn: "Walk through the Gospels", days: 21, accent: "primary" },
  { id: "p4", titleEs: "Sabiduría diaria", titleEn: "Wisdom Daily", descEs: "Un proverbio cada mañana", descEn: "A proverb each morning", days: 31, accent: "gold" },
];

export type LessonNode = { id: string; titleEs: string; titleEn: string; type: "lesson" | "quiz" | "boss" | "reflection" };
export const startingPath: LessonNode[] = [
  { id: "l1", titleEs: "¿Qué es la Biblia?", titleEn: "What is the Bible?", type: "lesson" },
  { id: "l2", titleEs: "Cómo está organizada", titleEn: "How it's organized", type: "lesson" },
  { id: "l3", titleEs: "Repaso de conocimiento", titleEn: "Knowledge check", type: "quiz" },
  { id: "l4", titleEs: "La historia del Génesis", titleEn: "The story of Genesis", type: "lesson" },
  { id: "l5", titleEs: "Une los versículos", titleEn: "Verse matching", type: "quiz" },
  { id: "l6", titleEs: "Reflexiona y escribe", titleEn: "Reflect & journal", type: "reflection" },
  { id: "l7", titleEs: "Reto de sección", titleEn: "Section boss", type: "boss" },
];