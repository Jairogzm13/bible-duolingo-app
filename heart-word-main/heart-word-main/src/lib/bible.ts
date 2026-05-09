// All 66 books of the Protestant Bible, with English + Spanish names and chapter counts.
// Verses fetched on demand from bible-api.com (free, no auth).

export type BibleBook = {
  id: string; // canonical English short id used by bible-api
  en: string;
  es: string;
  testament: "OT" | "NT";
  chapters: number;
};

export const BIBLE: BibleBook[] = [
  { id: "genesis", en: "Genesis", es: "Génesis", testament: "OT", chapters: 50 },
  { id: "exodus", en: "Exodus", es: "Éxodo", testament: "OT", chapters: 40 },
  { id: "leviticus", en: "Leviticus", es: "Levítico", testament: "OT", chapters: 27 },
  { id: "numbers", en: "Numbers", es: "Números", testament: "OT", chapters: 36 },
  { id: "deuteronomy", en: "Deuteronomy", es: "Deuteronomio", testament: "OT", chapters: 34 },
  { id: "joshua", en: "Joshua", es: "Josué", testament: "OT", chapters: 24 },
  { id: "judges", en: "Judges", es: "Jueces", testament: "OT", chapters: 21 },
  { id: "ruth", en: "Ruth", es: "Rut", testament: "OT", chapters: 4 },
  { id: "1samuel", en: "1 Samuel", es: "1 Samuel", testament: "OT", chapters: 31 },
  { id: "2samuel", en: "2 Samuel", es: "2 Samuel", testament: "OT", chapters: 24 },
  { id: "1kings", en: "1 Kings", es: "1 Reyes", testament: "OT", chapters: 22 },
  { id: "2kings", en: "2 Kings", es: "2 Reyes", testament: "OT", chapters: 25 },
  { id: "1chronicles", en: "1 Chronicles", es: "1 Crónicas", testament: "OT", chapters: 29 },
  { id: "2chronicles", en: "2 Chronicles", es: "2 Crónicas", testament: "OT", chapters: 36 },
  { id: "ezra", en: "Ezra", es: "Esdras", testament: "OT", chapters: 10 },
  { id: "nehemiah", en: "Nehemiah", es: "Nehemías", testament: "OT", chapters: 13 },
  { id: "esther", en: "Esther", es: "Ester", testament: "OT", chapters: 10 },
  { id: "job", en: "Job", es: "Job", testament: "OT", chapters: 42 },
  { id: "psalms", en: "Psalms", es: "Salmos", testament: "OT", chapters: 150 },
  { id: "proverbs", en: "Proverbs", es: "Proverbios", testament: "OT", chapters: 31 },
  { id: "ecclesiastes", en: "Ecclesiastes", es: "Eclesiastés", testament: "OT", chapters: 12 },
  { id: "songofsolomon", en: "Song of Solomon", es: "Cantares", testament: "OT", chapters: 8 },
  { id: "isaiah", en: "Isaiah", es: "Isaías", testament: "OT", chapters: 66 },
  { id: "jeremiah", en: "Jeremiah", es: "Jeremías", testament: "OT", chapters: 52 },
  { id: "lamentations", en: "Lamentations", es: "Lamentaciones", testament: "OT", chapters: 5 },
  { id: "ezekiel", en: "Ezekiel", es: "Ezequiel", testament: "OT", chapters: 48 },
  { id: "daniel", en: "Daniel", es: "Daniel", testament: "OT", chapters: 12 },
  { id: "hosea", en: "Hosea", es: "Oseas", testament: "OT", chapters: 14 },
  { id: "joel", en: "Joel", es: "Joel", testament: "OT", chapters: 3 },
  { id: "amos", en: "Amos", es: "Amós", testament: "OT", chapters: 9 },
  { id: "obadiah", en: "Obadiah", es: "Abdías", testament: "OT", chapters: 1 },
  { id: "jonah", en: "Jonah", es: "Jonás", testament: "OT", chapters: 4 },
  { id: "micah", en: "Micah", es: "Miqueas", testament: "OT", chapters: 7 },
  { id: "nahum", en: "Nahum", es: "Nahúm", testament: "OT", chapters: 3 },
  { id: "habakkuk", en: "Habakkuk", es: "Habacuc", testament: "OT", chapters: 3 },
  { id: "zephaniah", en: "Zephaniah", es: "Sofonías", testament: "OT", chapters: 3 },
  { id: "haggai", en: "Haggai", es: "Hageo", testament: "OT", chapters: 2 },
  { id: "zechariah", en: "Zechariah", es: "Zacarías", testament: "OT", chapters: 14 },
  { id: "malachi", en: "Malachi", es: "Malaquías", testament: "OT", chapters: 4 },
  { id: "matthew", en: "Matthew", es: "Mateo", testament: "NT", chapters: 28 },
  { id: "mark", en: "Mark", es: "Marcos", testament: "NT", chapters: 16 },
  { id: "luke", en: "Luke", es: "Lucas", testament: "NT", chapters: 24 },
  { id: "john", en: "John", es: "Juan", testament: "NT", chapters: 21 },
  { id: "acts", en: "Acts", es: "Hechos", testament: "NT", chapters: 28 },
  { id: "romans", en: "Romans", es: "Romanos", testament: "NT", chapters: 16 },
  { id: "1corinthians", en: "1 Corinthians", es: "1 Corintios", testament: "NT", chapters: 16 },
  { id: "2corinthians", en: "2 Corinthians", es: "2 Corintios", testament: "NT", chapters: 13 },
  { id: "galatians", en: "Galatians", es: "Gálatas", testament: "NT", chapters: 6 },
  { id: "ephesians", en: "Ephesians", es: "Efesios", testament: "NT", chapters: 6 },
  { id: "philippians", en: "Philippians", es: "Filipenses", testament: "NT", chapters: 4 },
  { id: "colossians", en: "Colossians", es: "Colosenses", testament: "NT", chapters: 4 },
  { id: "1thessalonians", en: "1 Thessalonians", es: "1 Tesalonicenses", testament: "NT", chapters: 5 },
  { id: "2thessalonians", en: "2 Thessalonians", es: "2 Tesalonicenses", testament: "NT", chapters: 3 },
  { id: "1timothy", en: "1 Timothy", es: "1 Timoteo", testament: "NT", chapters: 6 },
  { id: "2timothy", en: "2 Timothy", es: "2 Timoteo", testament: "NT", chapters: 4 },
  { id: "titus", en: "Titus", es: "Tito", testament: "NT", chapters: 3 },
  { id: "philemon", en: "Philemon", es: "Filemón", testament: "NT", chapters: 1 },
  { id: "hebrews", en: "Hebrews", es: "Hebreos", testament: "NT", chapters: 13 },
  { id: "james", en: "James", es: "Santiago", testament: "NT", chapters: 5 },
  { id: "1peter", en: "1 Peter", es: "1 Pedro", testament: "NT", chapters: 5 },
  { id: "2peter", en: "2 Peter", es: "2 Pedro", testament: "NT", chapters: 5 },
  { id: "1john", en: "1 John", es: "1 Juan", testament: "NT", chapters: 5 },
  { id: "2john", en: "2 John", es: "2 Juan", testament: "NT", chapters: 1 },
  { id: "3john", en: "3 John", es: "3 Juan", testament: "NT", chapters: 1 },
  { id: "jude", en: "Jude", es: "Judas", testament: "NT", chapters: 1 },
  { id: "revelation", en: "Revelation", es: "Apocalipsis", testament: "NT", chapters: 22 },
];

export type Verse = { book_name: string; chapter: number; verse: number; text: string };
export type FetchResult = { reference: string; verses: Verse[]; text: string };

// Use bible-api.com (free, public). Spanish translation: "rvr" (Reina Valera Revisada).
export async function fetchPassage(query: string, language: "es" | "en" = "es"): Promise<FetchResult | null> {
  const q = encodeURIComponent(query.trim());
  const translation = language === "es" ? "rvr" : "kjv";
  try {
    const r = await fetch(`https://bible-api.com/${q}?translation=${translation}`);
    if (!r.ok) return null;
    const data = await r.json();
    if (!data?.verses) return null;
    return { reference: data.reference, verses: data.verses, text: data.text };
  } catch {
    return null;
  }
}