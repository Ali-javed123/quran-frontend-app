// // types/quran.ts

// export interface Waqf {
//   symbol: string;
//   unicode: string;
//   type: string;
//   label: string;
//   meaning: string;
//   charIndex: number;
//   wordBefore: string;
//   wordAfter: string;
//   waqfIndex: number;
// }

// export interface EndWaqf {
//   symbol: string;
//   unicode: string;
//   type: string;
//   label: string;
//   meaning: string;
//   charIndex: number;
//   wordBefore: string;
//   wordAfter: string;
// }

// export interface Ayah {
//   _id: string;
//   suraIndex: number;
//   ayaIndex: number;
//   text: string;
//   textTajweed: string;
//   page_no: number;
//   para_no: number;
//   juz: number;
//   hizb: number;
//   rubElHizb: number;
//   manzil: number;
//   sajda: boolean;
//   sajdaType: string | null;
//   globalIndex: number;
//   waqf: Waqf[];
//   hasWaqf: boolean;
//   waqfCount: number;
//   ruku_global: number | null;
//   ruku_para: number;
//   ruku_surah: number;
//   surah_name: string;
//   para_name: string;
//   bismillah: string | null;
//   endWaqf: EndWaqf | null |string;
//   __v: number;
// }

// export interface Surah {
//   surah_name: string;
//   suraIndex: number;
// }

// export interface Para {
//   surah_name: string;
//   ayahCount: number;
//   para_no: number;
// }

// export type QuranType = 'surah' | 'para';

// export interface SurahDetailResponse {
//   suraIndex: string;
//   page: number;
//   totalPages: number;
//   ayahs: Ayah[];
// }

// export interface ParaDetailResponse {
//   paraNo: string;
//   page: number;
//   totalPages: number;
//   ayahs: Ayah[];
// }

// export interface SurahPageResponse {
//   surahNo: string;
//   page: number;
//   totalLines: number;
//   ayahs: Ayah[];
// }

// export interface ParaPageResponse {
//   paraNo: string;
//   page: number;
//   totalLines: number;
//   ayahs: Ayah[];
// }

// export interface SurahMeta {
//   suraIndex: number;
//   startPage: number;
//   surah_name?: string;
//   paraName?: string;
// }

// export interface ParaMeta {
//   para_no: number;
//   startPage: number;
//   paraName: string;
//   surah_name?: string;
// }

// // Socket Event Types
// export interface RecitationStartData {
// suraIndex: number | null;
// ayaIndex: number | null;
// pageNo: number | null;
// paraNo: number | null;
// }

// export interface RecitationReadyData {
//   suraIndex: number;
//   ayaIndex: number;
//   text: string;
//   textTajweed: string;
//   surahName: string;
//   ayahId: string;
// }

// export interface WrongWord {
//   position: number;
//   userWord: string | null;
//   correctWord: string | null;
//   userOriginal: string | null;
//   correctOriginal: string | null;
//   isExtra?: boolean;
//   isMissing?: boolean;
//   errorType?: 'substitution' | 'deletion' | 'insertion';
// }

// export interface VerificationResultData {
//   transcribedText: string;
//   accuracy: number;
//   isPerfect: boolean;
//   wrongWords: WrongWord[];
//   match?: boolean;
//   correction?: string;
//   diff?: string;
//   timestamp: number;
// }

// export interface AIMistake {
//   user: string;
//   correct: string;
//   tip: string;
// }

// export interface AIFeedbackData {
//   overall: string;
//   mistakes: AIMistake[];
//   encouragement: string;
//   score: number;
// }

// export interface RecitationError {
//   message: string;
// }

// export interface SessionCompleteData {
//   duration: number;
//   suraIndex: number;
//   ayaIndex: number;
//   accuracy: number;
//   isPerfect: boolean;
//   wrongWords: WrongWord[];
//   feedback?: AIFeedbackData;
//   message: string;
//   transcribedText?: string;
// }

// export interface AyahTextResponse {
//   text?: string;
//   textTajweed?: string;
//   surahName?: string;
//   ayahId?: string;                                                                                                                                                                                                                     
//   error?: string;
// }

// export interface ApiResponse<T> {
//   source?: 'cache' | 'db';
//   data: T;
// }
// types/ayahs.ts
// COMPLETE WITH PROGRESSIVE MATCHING TYPES

export interface Waqf {
  symbol: string;
  unicode: string;
  type: string;
  label: string;
  meaning: string;
  charIndex: number;
  wordBefore: string;
  wordAfter: string;
  waqfIndex: number;
}

export interface EndWaqf {
  symbol: string;
  unicode: string;
  type: string;
  label: string;
  meaning: string;
  charIndex: number;
  wordBefore: string;
  wordAfter: string;
}

export interface Ayah {
  _id: string;
  suraIndex: number;
  ayaIndex: number;
  text: string;
  textTajweed: string;
  page_no: number;
  para_no: number;
  juz: number;
  hizb: number;
  rubElHizb: number;
  manzil: number;
  sajda: boolean;
  sajdaType: string | null;
  globalIndex: number;
  waqf: Waqf[];
  hasWaqf: boolean;
  waqfCount: number;
  ruku_global: number | null;
  ruku_para: number;
  ruku_surah: number;
  surah_name: string;
  para_name: string;
  bismillah: string | null;
  endWaqf: EndWaqf | null | string;
  __v: number;
}

export interface Surah {
  surah_name: string;
  suraIndex: number;
}

export interface Para {
  surah_name: string;
  ayahCount?: number;
  para_no?: number;
}

export type QuranType = 'surah' | 'para';

export interface SurahDetailResponse {
  suraIndex: string;
  page: number;
  totalPages: number;
  ayahs: Ayah[];
}

export interface ParaDetailResponse {
  paraNo: string;
  page: number;
  totalPages: number;
  ayahs: Ayah[];
}

export interface SurahPageResponse {
  surahNo: string;
  page: number;
  totalLines: number;
  ayahs: Ayah[];
}

export interface ParaPageResponse {
  paraNo: string;
  page: number;
  totalLines: number;
  ayahs: Ayah[];
}

export interface SurahMeta {
  suraIndex: number;
  startPage: number;
  surah_name?: string;
  paraName?: string;
}

export interface ParaMeta {
  para_no: number;
  startPage: number;
  paraName: string;
  surah_name?: string;
}

// Socket Event Types
export interface RecitationStartData {
  suraIndex: number | null;
  ayaIndex: number | null;
  pageNo: number | null;
  paraNo: number | null;
}

export interface RecitationReadyData {
  suraIndex: number;
  ayaIndex: number;
  text: string;
  textTajweed: string;
  surahName: string;
  paraName?: string;
  ayahId?: string;
  romanText?: string;
  totalWords?: number;  // Added for progressive matching
  wordCount?: number;   // Alternative name
}
export interface WordPosition {
  wordIndex: number;
  startChar: number;
  endChar: number;
  text: string;
  arabicText: string;
}
export interface WordVerificationResult {
  wordIndex: number;
  isCorrect: boolean;
  userPronunciation?: string;
  correctPronunciation?: string;
  errorType?: 'substitution' | 'insertion' | 'deletion' | 'pronunciation';
  confidence: number;
}

export interface WrongWord {
  position: number;
  userWord: string | null;
  correctWord: string | null;
  userOriginal?: string | null;
  correctOriginal?: string | null;
  userRoman?: string | null;
  correctRoman?: string | null;
  isExtra?: boolean;
  isMissing?: boolean;
  isPending?: boolean;
  errorType?: 'substitution' | 'deletion' | 'insertion' | 'pending' | 'close_match';
  similarity?: number;
}

export interface WordResult {
  position: number;
  correctWord: string;
  correctRoman: string;
  userWord: string | null;
  userRoman: string | null;
  status: 'correct' | 'close' | 'wrong' | 'missing';
  similarity: number;
  isOnlyHarakatDiff: boolean;
  hasWaqf: boolean;
  matched?: boolean;
  harakatOnly?: boolean;
  merged?: boolean;
}

export interface VerificationResultData {
  transcribedText: string;
  transcribedRoman?: string;
  spokenRoman?: string;
  correctRoman?: string;
  accuracy: number;
  isPerfect: boolean;
  wrongWords: WrongWord[];
  pendingWords?: WrongWord[];  // Words not yet recited
  correctText: string;
  summary?: string;
  timestamp: number;
  matchedCount?: number;       // Added for progressive matching
  totalWords?: number;         // Added for progressive matching
  remainingWords?: number;     // Added for progressive matching
  isComplete?: boolean;        // Added for progressive matching
  wordResults?: WordResult[];  // Detailed word-by-word results
  method?: string;
}

export interface AIMistake {
  user: string;
  correct: string;
  tip: string;
}

export interface AIFeedbackData {
  overall: string;
  mistakes: AIMistake[];
  encouragement: string;
  score: number;
}

export interface RecitationError {
  message: string;
}

export interface SessionCompleteData {
  duration: number;
  suraIndex: number;
  ayaIndex: number;
  accuracy: number;
  isPerfect: boolean;
  wrongWords: WrongWord[];
  feedback?: AIFeedbackData;
  message: string;
  transcribedText?: string;
}

export interface AyahTextResponse {
  text?: string;
  textTajweed?: string;
  surahName?: string;
  ayahId?: string;
  error?: string;
}

export interface ApiResponse<T> {
  source?: 'cache' | 'db';
  data?: T;
}