export interface Surah {
  surah_name: string
  suraIndex: number
}

export interface Para {
  surah_name: string
  ayahCount: number
  para_no: number
}
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


export type QuranType = "surah" | "para"

export interface Ayah {
  _id: string
  suraIndex: number
  ayaIndex: number
  text: string
  textTajweed: string
  page_no: number
  para_no: number
  juz: number
  hizb: number
  rubElHizb: number
  manzil: number
  sajda: boolean
  sajdaType: string | null
  globalIndex: number
    waqf: Waqf[];
  
  hasWaqf: boolean
  waqfCount: number
  ruku_global: number | null
  ruku_para: number
  ruku_surah: number
  
  surah_name: string
  para_name: string
  bismillah: string | null
  endWaqf: string | null
  __v: number
}

export interface SurahDetailResponse {
  suraIndex: string
  page: number
  totalPages: number
  ayahs: Ayah[]
}

export interface ParaDetailResponse {
  suraIndex: string // Actually paraNo but API returns as suraIndex? We'll treat as para number string
  page: number
  totalPages: number
  ayahs: Ayah[]
}

// Actual API response for surah pagination

export interface SurahPageResponse {
  surahNo: string
  page: number
  totalLines: number
  ayahs: Ayah[]
}

// Socket Event Types

export interface RecitationStartData {
  suraIndex: number | null;
  ayaIndex: number | null;
  pageNo: number | null;
  paraNo: number | null;
}

// Actual API response for para pagination
export interface ParaPageResponse {
  paraNo: string
  page: number
  totalLines: number
  ayahs: Ayah[]
}
