import {
  Surah,
  Para,
  SurahDetailResponse,
  ParaDetailResponse,
  SurahPageResponse,
  ParaPageResponse,
} from "../types/quran"

const BASE_URL = "https://quran-backend-pink.vercel.app/api/quran"

export async function fetchSurahs(): Promise<Surah[]> {
  const res = await fetch(`${BASE_URL}/surahs`)
  if (!res.ok) throw new Error("Failed to fetch surahs")
  const json = await res.json()

  return json.data // 👈 agar API { data: [] } return karti hai
}

export async function fetchParas(): Promise<Para[]> {
  const res = await fetch(`${BASE_URL}/paras`)
  if (!res.ok) throw new Error("Failed to fetch paras")
  const json = await res.json()

  return json.data // 👈 agar API { data: [] } return karti hai
}

export async function fetchSurahAyahs(
  suraIndex: number
): Promise<SurahDetailResponse> {
  const res = await fetch(`${BASE_URL}/surahs/${suraIndex}`)
  if (!res.ok) throw new Error("Failed to fetch surah ayahs")
  const json = await res.json()

  return json.data // 👈 agar API { data: [] } return karti hai
}

export async function fetchParaAyahs(
  paraNo: number
): Promise<ParaDetailResponse> {
  const res = await fetch(`${BASE_URL}/paras/${paraNo}`)
  if (!res.ok) throw new Error("Failed to fetch para ayahs")
  const json = await res.json()

  return json.data // 👈 agar API { data: [] } return karti hai
}

// Add these to your existing api.ts

export async function fetchSurahAyahsPaginated(
  suraIndex: number,
  page: number = 1
): Promise<SurahDetailResponse> {
  const res = await fetch(`${BASE_URL}/surah/${suraIndex}/${page}`)
  if (!res.ok) throw new Error("Failed to fetch surah ayahs (paginated)")
  const json = await res.json()

  return json.data
}

export async function fetchParaAyahsPaginated(
  paraNo: number,
  page: number = 1
): Promise<ParaDetailResponse> {
  const res = await fetch(`${BASE_URL}/paras/${paraNo}/${page}`)
  if (!res.ok) throw new Error("Failed to fetch para ayahs (paginated)")
  const json = await res.json()

  return json.data
}

// META APIs
export async function fetchSurahMeta(suraIndex: number) {
  const res = await fetch(`${BASE_URL}/surah-meta/${suraIndex}`)
  if (!res.ok) throw new Error("Failed to fetch surah meta")
  const json = await res.json()

  return json.data
}

export async function fetchParaMeta(paraNo: number) {
  const res = await fetch(`${BASE_URL}/para-meta/${paraNo}`)
  if (!res.ok) throw new Error("Failed to fetch para meta")
  const json = await res.json()

  return json.data
}
