// // components/QuranViewer.tsx — FIX: No setTimeout, proper ready-based flow

// 'use client';

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { fetchSurahAyahsPaginated, fetchParaAyahsPaginated, fetchSurahMeta, fetchParaMeta } from '../lib/api';
// import { Ayah, VerificationResultData, RecitationError } from '../types/ayahs';
// import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Mic, MicOff, WifiOff } from 'lucide-react';
// import { useRecitationChecker } from '../hooks/useRecitationChecker';
// import { useToast } from '../hooks/useToast';
// import { Toast } from './Toast';
// import '../styles/tajweed.css';

// interface QuranViewerProps { type: 'surah' | 'para'; id: number; }
// interface PaginationState { currentPage: number; startPage: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean; }

// export function QuranViewer({ type, id }: QuranViewerProps) {
//   const [ayahs, setAyahs] = useState<Ayah[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [surahName, setSurahName] = useState('');
//   const [paraName, setParaName] = useState('');
//   const [manzil, setManzil] = useState('');
//   const [title, setTitle] = useState('');
//   const [recordingAyahId, setRecordingAyahId] = useState<string | null>(null);
//   const [pagination, setPagination] = useState<PaginationState>({ currentPage: 1, startPage: 1, totalPages: 1, hasNextPage: true, hasPrevPage: false });

//   const { isConnected, isRecording, isLoading: isRecitationLoading, currentAccuracy, activeAyahId, connectionError, reconnect, startRecitation, startRecording, stopRecording, cancelRecitation, onVerificationResult, onError } = useRecitationChecker();
//   const { toasts, addToast, removeToast } = useToast();
//   const latestRequestRef = useRef<number>(0);
//   const abortControllerRef = useRef<AbortController | null>(null);

//   useEffect(() => {
//     // onVerificationResult((data: VerificationResultData) => {
//     //   if (data.isPerfect) { addToast('success', '🎉 بالکل صحیح!', 'ماشاء اللہ! آپ نے بالکل درست پڑھا', 4000); return; }
//     //   if (data.wrongWords?.length > 0) {
//     //     const lines = data.wrongWords.map((w) => {
//     //       if (w.errorType === 'deletion' || !w.userWord) return `➕ چھوٹا لفظ: «${w.correctWord}»`;
//     //       if (w.errorType === 'insertion' || !w.correctWord) return `➖ اضافی لفظ: «${w.userWord}»`;
//     //       return `❌ «${w.userWord}»  ←  ✅ «${w.correctWord}»`;
//     //     }).join('\n');
//     //     addToast('warning', `⚠️ ${data.wrongWords.length} غلطی — ${data.accuracy}% درست`, lines, 7000);
//     //   }
//     // });
//     onVerificationResult((data: VerificationResultData) => {
//   // ✅ Perfect — single success toast only
//   if (data.isPerfect) {
//     addToast('success', '✅ بالکل صحیح!', 'ماشاء اللہ!', 3000);
//     return;
//   }

//   // ❌ Wrong words — one error toast per wrong word (no warning/info)
//   if (data.wrongWords?.length > 0) {
//     data.wrongWords.forEach((w) => {
//       // Skip insertion/deletion noise — only real substitution errors
//       if (w.errorType === 'insertion' || w.errorType === 'deletion') return;
//       if (!w.userWord || !w.correctWord) return;

//       // Show both wrong and correct word in toast
//       const wrongDisplay   = w.userOriginal  || w.userWord;
//       const correctDisplay = w.correctOriginal || w.correctWord;
//       addToast('error', `❌ «${wrongDisplay}»  →  ✅ «${correctDisplay}»`, '', 4000);
//     });
//   }
//   // No warning/info toasts at all
// });
//     onError((err: RecitationError) => {
//       if (err.message?.includes('No active recitation') || err.message?.includes('not ready')) return;
//       addToast('error', 'خرابی', err.message, 4000);
//     });
//   }, [onVerificationResult, onError, addToast]);

//   const getNextStartPage = async (currentId: number, pageType: 'surah' | 'para') => {
//     try { const m = pageType === 'surah' ? await fetchSurahMeta(currentId + 1) : await fetchParaMeta(currentId + 1); return m.startPage || 605; } catch { return 605; }
//   };

//   const loadMeta = useCallback(async (signal: AbortSignal) => {
//     try {
//       let metaStartPage: number; let sName = '', pName = '', itemName = '';
//       if (type === 'surah') { const m = await fetchSurahMeta(id); metaStartPage = m.startPage || 1; sName = m.surah_name || ''; pName = m.paraName || `Para ${id}`; itemName = `Surah ${sName} (${id})`; }
//       else { const m = await fetchParaMeta(id); metaStartPage = m.startPage || 1; pName = m.paraName || `Para ${id}`; sName = m.surah_name || ''; itemName = `Para ${id} - ${pName}`; }
//       if (signal.aborted) return;
//       setPagination(prev => ({ ...prev, startPage: metaStartPage, currentPage: metaStartPage }));
//       setTitle(itemName); setSurahName(sName); setParaName(pName);
//       const nextStart = await getNextStartPage(id, type);
//       setPagination(prev => ({ ...prev, totalPages: nextStart > metaStartPage ? nextStart - 1 : 605 }));
//       return metaStartPage;
//     } catch (err) { if (!signal.aborted) throw err; return 1; }
//   }, [type, id]);

//   const loadAyahs = useCallback(async (page: number, signal: AbortSignal) => {
//     setLoading(true); setError(null);
//     const reqId = Date.now(); latestRequestRef.current = reqId;
//     try {
//       const res = type === 'surah' ? await fetchSurahAyahsPaginated(id, page) : await fetchParaAyahsPaginated(id, page);
//       if (signal.aborted || latestRequestRef.current !== reqId) return;
//       const fetched: Ayah[] = res?.ayahs || [];
//       setAyahs(fetched); setPagination(prev => ({ ...prev, currentPage: page }));
//       let nextExists = false, prevExists = false;
//       try {
//         const [nr, pr] = await Promise.all([
//           type === 'surah' ? fetchSurahAyahsPaginated(id, page + 1) : fetchParaAyahsPaginated(id, page + 1),
//           page > pagination.startPage ? (type === 'surah' ? fetchSurahAyahsPaginated(id, page - 1) : fetchParaAyahsPaginated(id, page - 1)) : Promise.resolve({ ayahs: [] }),
//         ]);
//         if (latestRequestRef.current === reqId) { nextExists = (nr?.ayahs?.length || 0) > 0; prevExists = page > pagination.startPage && (pr?.ayahs?.length || 0) > 0; }
//       } catch { }
//       setPagination(prev => ({ ...prev, hasNextPage: nextExists, hasPrevPage: prevExists }));
//       const mAyah = fetched.find(a => a.manzil); if (mAyah?.manzil) setManzil(`Manzil ${mAyah.manzil}`);
//       const first = fetched[0]; if (first?.surah_name) setSurahName(first.surah_name); if (first?.para_name) setParaName(first.para_name);
//     } catch (err) { if (!signal.aborted) setError(err instanceof Error ? err.message : 'Failed to load'); }
//     finally { if (!signal.aborted) setLoading(false); }
//   }, [type, id, pagination.startPage]);

//   useEffect(() => {
//     const init = async () => {
//       abortControllerRef.current?.abort();
//       const ctrl = new AbortController(); abortControllerRef.current = ctrl;
//       setLoading(true); setError(null);
//       try { const firstPage = await loadMeta(ctrl.signal); await loadAyahs(firstPage ?? 1, ctrl.signal); }
//       catch (err) { if (!ctrl.signal.aborted) { setError(err instanceof Error ? err.message : 'Failed to load'); setLoading(false); } }
//     };
//     init();
//     return () => { abortControllerRef.current?.abort(); cancelRecitation(); };
//   }, [id, type]);

//   const handleNext = () => { if (!pagination.hasNextPage) return; const ctrl = new AbortController(); abortControllerRef.current = ctrl; loadAyahs(pagination.currentPage + 1, ctrl.signal); };
//   const handlePrev = () => { if (!pagination.hasPrevPage) return; const ctrl = new AbortController(); abortControllerRef.current = ctrl; loadAyahs(pagination.currentPage - 1, ctrl.signal); };

//   const handleMicClick = async (ayah: Ayah) => {
//     const ayahId = ayah._id;
//     if (recordingAyahId === ayahId && isRecording) { stopRecording(); setRecordingAyahId(null); return; }
//     if (recordingAyahId && isRecording) stopRecording();
//     setRecordingAyahId(ayahId);
//     // ✅ FIX: No setTimeout. startRecording waits for recitation-ready internally.
//     startRecitation({ suraIndex: ayah.suraIndex, ayaIndex: ayah.ayaIndex, pageNo: ayah.page_no, paraNo: ayah.para_no }, ayahId);
//     await startRecording();
//   };

//   if (loading && ayahs.length === 0) return <div className="flex justify-center items-center h-full min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>;
//   if (error) return <div className="flex flex-col items-center justify-center h-full min-h-screen gap-4"><AlertCircle className="h-12 w-12 text-red-500" /><p className="text-lg">{error}</p><button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-700 text-white rounded">دوبارہ کوشش کریں</button></div>;

//   return (
//     <>
//       <Toast toasts={toasts} onRemove={removeToast} />
//       {!isConnected && (<div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg text-sm flex items-center gap-2"><WifiOff className="w-4 h-4" /><span>سرور سے کنکشن نہیں</span><button onClick={reconnect} className="ml-2 underline">دوبارہ جوڑیں</button></div>)}
//       {isRecording && recordingAyahId && (<div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-emerald-600 text-white px-5 py-2 rounded-full shadow-lg text-sm flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full animate-pulse" /><span>🎤 سن رہا ہے{currentAccuracy > 0 ? ` — ${currentAccuracy}% درست` : '...'}</span></div>)}
//       {loading && (<div className="absolute inset-0 bg-white/40 dark:bg-black/40 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>)}

//       <div className="flex justify-center items-start min-h-screen py-4 px-2">
//         <div className="relative w-full max-w-[95%] md:max-w-[85%] lg:max-w-[75%] quran-paper dark:bg-quran-paper-dark shadow-2xl" style={{ border: '3px solid var(--quran-gold)', fontFamily: "'Scheherazade New', serif" }}>
//           <div className="absolute inset-[6px] pointer-events-none z-10 quran-inner-border-light" />
//           <div className="absolute inset-[3px] pointer-events-none z-10 quran-inner-border" />
//           <div className="relative flex items-center justify-between px-3 md:px-6 py-2 quran-header-border quran-header-bg">
//             <div className="text-quran-text dark:text-quran-text-dark text-lg md:text-2xl lg:text-[30px] font-bold" style={{ direction: 'rtl', minWidth: 60 }}>{surahName || title}</div>
//             <div className="flex items-center justify-center w-8 h-6 md:w-10 md:h-7 rounded-full border text-xs md:text-sm font-bold quran-page-number">{pagination.currentPage}</div>
//             <div className="text-quran-text dark:text-quran-text-dark text-lg md:text-2xl lg:text-[28px] font-bold text-right" style={{ direction: 'rtl', minWidth: 60 }}>{paraName}</div>
//           </div>
//           <div className="relative px-3 md:px-10 py-4" dir="rtl">
//             {ayahs.map((ayah: Ayah) => {
//               const hasRuku = !!(ayah.ruku_para || ayah.ruku_surah);
//               const isThisRecording = recordingAyahId === ayah._id && isRecording;
//               const isThisLoading = isRecitationLoading && activeAyahId === ayah._id;
//               return (
//                 <div key={ayah._id} className="relative group mb-8">
//                   {hasRuku && (<div className="ruku-container flex flex-col items-center"><span className="text-xs font-bold text-quran-gold">{ayah.ruku_surah || ''}</span><span className="text-2xl md:text-3xl font-bold text-quran-gold">ع</span><span className="text-xs font-bold text-quran-gold">{ayah.ruku_para || ''}</span></div>)}
//                   {ayah.bismillah && (<div className="text-center my-3 text-lg md:text-2xl text-quran-bismillah dark:text-quran-bismillah-dark"><div dangerouslySetInnerHTML={{ __html: ayah.bismillah }} /></div>)}
//                   <div className="relative">
//                     <span className="quran-ayat-text font-bold leading-[2.4] text-quran-text dark:text-quran-text-dark" style={{ fontFamily: "'Scheherazade New', serif" }}><span dangerouslySetInnerHTML={{ __html: ayah.textTajweed }} /></span>
//                     <span className="inline-block mr-2 text-quran-gold text-lg font-bold">({ayah.ayaIndex})</span>
//                   </div>
//                   <button onClick={() => handleMicClick(ayah)} disabled={isThisLoading && !isThisRecording} title={isThisRecording ? 'روکیں' : 'تلاوت شروع کریں'}
//                     className={`absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 rounded-full shadow-lg hover:scale-110 ${isThisRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse opacity-100' : 'bg-emerald-500 hover:bg-emerald-600'} disabled:opacity-40 disabled:cursor-not-allowed`}>
//                     {isThisLoading && !isThisRecording ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : isThisRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
//                   </button>
//                   {isThisRecording && currentAccuracy > 0 && (
//                     <div className="absolute -left-12 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 shadow-md border">
//                       <span className={`text-xs font-bold ${currentAccuracy >= 98 ? 'text-green-600' : currentAccuracy >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>{currentAccuracy}%</span>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//           <div className="flex items-center justify-between px-3 md:px-6 py-3 quran-footer-border quran-footer-bg">
//             <button onClick={handleNext} disabled={!pagination.hasNextPage} className="flex items-center gap-1 text-sm font-bold text-quran-text dark:text-quran-text-dark disabled:opacity-30"><ChevronLeft className="w-4 h-4" /> اگلا</button>
//             <div className="text-sm md:text-base font-bold text-quran-text dark:text-quran-text-dark text-center">{manzil || `صفحہ ${pagination.currentPage}`}</div>
//             <button onClick={handlePrev} disabled={!pagination.hasPrevPage} className="flex items-center gap-1 text-sm font-bold text-quran-text dark:text-quran-text-dark disabled:opacity-30">پچھلا <ChevronRight className="w-4 h-4" /></button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
// components/QuranViewer.tsx — FIX: Proper validation for Surah params



import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSurahAyahsPaginated, fetchParaAyahsPaginated, fetchSurahMeta, fetchParaMeta } from '../lib/api';
import { Ayah, VerificationResultData, RecitationError, RecitationStartData } from '../types/ayahs';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Mic, MicOff, WifiOff } from 'lucide-react';
import { useRecitationChecker } from '../hooks/useRecitationChecker';
import { useToast } from '../hooks/useToast';
import { Toast } from './Toast';
import '../styles/tajweed.css';

interface QuranViewerProps { type: 'surah' | 'para'; id: number; }
interface PaginationState { currentPage: number; startPage: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean; }

export function QuranViewer({ type, id }: QuranViewerProps) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surahName, setSurahName] = useState('');
  const [paraName, setParaName] = useState('');
  const [manzil, setManzil] = useState('');
  const [title, setTitle] = useState('');
  const [recordingAyahId, setRecordingAyahId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ currentPage: 1, startPage: 1, totalPages: 1, hasNextPage: true, hasPrevPage: false });

  const { isConnected, isRecording, isLoading: isRecitationLoading, currentAccuracy, activeAyahId, connectionError, reconnect, startRecitation, startRecording, stopRecording, cancelRecitation, onVerificationResult, onError } = useRecitationChecker();
  const { toasts, addToast, removeToast } = useToast();
  const latestRequestRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    onVerificationResult((data: VerificationResultData) => {
      if (data.isPerfect) {
        addToast('success', '✅ بالکل صحیح!', 'ماشاء اللہ!', 3000);
        return;
      }

      if (data.wrongWords?.length > 0) {
        data.wrongWords.forEach((w) => {
          if (w.errorType === 'insertion' || w.errorType === 'deletion') return;
          if (!w.userWord || !w.correctWord) return;

          const wrongDisplay   = w.userOriginal  || w.userWord;
          const correctDisplay = w.correctOriginal || w.correctWord;
          addToast('error', `❌ «${wrongDisplay}»  →  ✅ «${correctDisplay}»`, '', 4000);
        });
      }
    });
    onError((err: RecitationError) => {
      if (err.message?.includes('No active recitation') || err.message?.includes('not ready')) return;
      addToast('error', 'خرابی', err.message, 4000);
    });
  }, [onVerificationResult, onError, addToast]);

  const getNextStartPage = async (currentId: number, pageType: 'surah' | 'para') => {
    try { 
      const m = pageType === 'surah' ? await fetchSurahMeta(currentId + 1) : await fetchParaMeta(currentId + 1); 
      return m.startPage || 605; 
    } catch { 
      return 605; 
    }
  };

  const loadMeta = useCallback(async (signal: AbortSignal) => {
    try {
      let metaStartPage: number; let sName = '', pName = '', itemName = '';
      if (type === 'surah') { 
        const m = await fetchSurahMeta(id); 
        metaStartPage = m.startPage || 1; 
        sName = m.surah_name || ''; 
        pName = m.paraName || `Para ${id}`; 
        itemName = `Surah ${sName} (${id})`; 
      } else { 
        const m = await fetchParaMeta(id); 
        metaStartPage = m.startPage || 1; 
        pName = m.paraName || `Para ${id}`; 
        sName = m.surah_name || ''; 
        itemName = `Para ${id} - ${pName}`; 
      }
      if (signal.aborted) return;
      setPagination(prev => ({ ...prev, startPage: metaStartPage, currentPage: metaStartPage }));
      setTitle(itemName); setSurahName(sName); setParaName(pName);
      const nextStart = await getNextStartPage(id, type);
      setPagination(prev => ({ ...prev, totalPages: nextStart > metaStartPage ? nextStart - 1 : 605 }));
      return metaStartPage;
    } catch (err) { 
      if (!signal.aborted) throw err; 
      return 1; 
    }
  }, [type, id]);

  const loadAyahs = useCallback(async (page: number, signal: AbortSignal) => {
    setLoading(true); setError(null);
    const reqId = Date.now(); latestRequestRef.current = reqId;
    try {
      const res = type === 'surah' ? await fetchSurahAyahsPaginated(id, page) : await fetchParaAyahsPaginated(id, page);
      if (signal.aborted || latestRequestRef.current !== reqId) return;
      const fetched: Ayah[] = res?.ayahs || [];
      setAyahs(fetched); setPagination(prev => ({ ...prev, currentPage: page }));
      let nextExists = false, prevExists = false;
      try {
        const [nr, pr] = await Promise.all([
          type === 'surah' ? fetchSurahAyahsPaginated(id, page + 1) : fetchParaAyahsPaginated(id, page + 1),
          page > pagination.startPage ? (type === 'surah' ? fetchSurahAyahsPaginated(id, page - 1) : fetchParaAyahsPaginated(id, page - 1)) : Promise.resolve({ ayahs: [] }),
        ]);
        if (latestRequestRef.current === reqId) { nextExists = (nr?.ayahs?.length || 0) > 0; prevExists = page > pagination.startPage && (pr?.ayahs?.length || 0) > 0; }
      } catch { }
      setPagination(prev => ({ ...prev, hasNextPage: nextExists, hasPrevPage: prevExists }));
      const mAyah = fetched.find(a => a.manzil); if (mAyah?.manzil) setManzil(`Manzil ${mAyah.manzil}`);
      const first = fetched[0]; if (first?.surah_name) setSurahName(first.surah_name); if (first?.para_name) setParaName(first.para_name);
    } catch (err) { 
      if (!signal.aborted) setError(err instanceof Error ? err.message : 'Failed to load'); 
    } finally { 
      if (!signal.aborted) setLoading(false); 
    }
  }, [type, id, pagination.startPage]);

  useEffect(() => {
    const init = async () => {
      abortControllerRef.current?.abort();
      const ctrl = new AbortController(); abortControllerRef.current = ctrl;
      setLoading(true); setError(null);
      try { 
        const firstPage = await loadMeta(ctrl.signal); 
        await loadAyahs(firstPage ?? 1, ctrl.signal); 
      } catch (err) { 
        if (!ctrl.signal.aborted) { 
          setError(err instanceof Error ? err.message : 'Failed to load'); 
          setLoading(false); 
        } 
      }
    };
    init();
    return () => { 
      abortControllerRef.current?.abort(); 
      cancelRecitation(); 
    };
  }, [id, type]);

  const handleNext = () => { 
    if (!pagination.hasNextPage) return; 
    const ctrl = new AbortController(); 
    abortControllerRef.current = ctrl; 
    loadAyahs(pagination.currentPage + 1, ctrl.signal); 
  };
  
  const handlePrev = () => { 
    if (!pagination.hasPrevPage) return; 
    const ctrl = new AbortController(); 
    abortControllerRef.current = ctrl; 
    loadAyahs(pagination.currentPage - 1, ctrl.signal); 
  };

  // 🔴🔴🔴 MAIN FIX STARTS HERE 🔴🔴🔴
  const handleMicClick = async (ayah: Ayah) => {
    const ayahId = ayah._id;
    
    // Cancel any existing recording first
    if (recordingAyahId && isRecording) {
      stopRecording();
      setRecordingAyahId(null);
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (recordingAyahId === ayahId && isRecording) {
      stopRecording();
      setRecordingAyahId(null);
      return;
    }
    
    setRecordingAyahId(ayahId);
    
    // ✅ FIX: Validate and prepare data properly for both Surah and Para
  let startData: RecitationStartData;
    
    if (type === 'surah') {
      // For Surah: Make sure suraIndex is valid, pageNo should be based on ayah
      startData = {
        suraIndex: ayah.suraIndex || id,  // Fallback to main id if ayah.suraIndex missing
        ayaIndex: ayah.ayaIndex,
        pageNo: ayah.page_no || pagination.currentPage,  // Use current page if ayah page missing
        paraNo: null,  // null for surah mode
      };
      console.log('🎯 Surah start data:', startData);
    } else {
      // For Para: Use paraNo from ayah
      startData = {
        suraIndex: ayah.suraIndex || null,
        ayaIndex: ayah.ayaIndex,
        pageNo: ayah.page_no || pagination.currentPage,
        paraNo: ayah.para_no || id,  // Fallback to main id
      };
      console.log('🎯 Para start data:', startData);
    }
    
    // Validate required fields
    if (type === 'surah' && (!startData.suraIndex || startData.suraIndex <= 0)) {
      console.error('❌ Invalid Surah data:', startData);
      addToast('error', 'Error', 'Surah index is invalid. Please try again.', 3000);
      setRecordingAyahId(null);
      return;
    }
    
    if (type === 'para' && (!startData.paraNo || startData.paraNo <= 0)) {
      console.error('❌ Invalid Para data:', startData);
      addToast('error', 'Error', 'Para number is invalid. Please try again.', 3000);
      setRecordingAyahId(null);
      return;
    }
    
    // Start recitation session
    startRecitation(startData, ayahId);
    
    // Small delay to ensure session is created on server
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Start recording (will wait for recitation-ready event internally)
    await startRecording();
  };
  // 🔴🔴🔴 MAIN FIX ENDS HERE 🔴🔴🔴

  if (loading && ayahs.length === 0) return <div className="flex justify-center items-center h-full min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>;
  if (error) return <div className="flex flex-col items-center justify-center h-full min-h-screen gap-4"><AlertCircle className="h-12 w-12 text-red-500" /><p className="text-lg">{error}</p><button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-700 text-white rounded">دوبارہ کوشش کریں</button></div>;

  return (
    <>
      <Toast toasts={toasts} onRemove={removeToast} />
      {!isConnected && (<div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg text-sm flex items-center gap-2"><WifiOff className="w-4 h-4" /><span>سرور سے کنکشن نہیں</span><button onClick={reconnect} className="ml-2 underline">دوبارہ جوڑیں</button></div>)}
      {isRecording && recordingAyahId && (<div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-emerald-600 text-white px-5 py-2 rounded-full shadow-lg text-sm flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full animate-pulse" /><span>🎤 سن رہا ہے{currentAccuracy > 0 ? ` — ${currentAccuracy}% درست` : '...'}</span></div>)}
      {loading && (<div className="absolute inset-0 bg-white/40 dark:bg-black/40 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>)}

      <div className="flex justify-center items-start min-h-screen py-4 px-2">
        <div className="relative w-full max-w-[95%] md:max-w-[85%] lg:max-w-[75%] quran-paper dark:bg-quran-paper-dark shadow-2xl" style={{ border: '3px solid var(--quran-gold)', fontFamily: "'Scheherazade New', serif" }}>
          <div className="absolute inset-[6px] pointer-events-none z-10 quran-inner-border-light" />
          <div className="absolute inset-[3px] pointer-events-none z-10 quran-inner-border" />
          <div className="relative flex items-center justify-between px-3 md:px-6 py-2 quran-header-border quran-header-bg">
            <div className="text-quran-text dark:text-quran-text-dark text-lg md:text-2xl lg:text-[30px] font-bold" style={{ direction: 'rtl', minWidth: 60 }}>{surahName || title}</div>
            <div className="flex items-center justify-center w-8 h-6 md:w-10 md:h-7 rounded-full border text-xs md:text-sm font-bold quran-page-number">{pagination.currentPage}</div>
            <div className="text-quran-text dark:text-quran-text-dark text-lg md:text-2xl lg:text-[28px] font-bold text-right" style={{ direction: 'rtl', minWidth: 60 }}>{paraName}</div>
          </div>
          <div className="relative px-3 md:px-10 py-4" dir="rtl">
            {ayahs.map((ayah: Ayah) => {
              const hasRuku = !!(ayah.ruku_para || ayah.ruku_surah);
              const isThisRecording = recordingAyahId === ayah._id && isRecording;
              const isThisLoading = isRecitationLoading && activeAyahId === ayah._id;
              return (
                <div key={ayah._id} className="relative group mb-8">
                  {hasRuku && (<div className="ruku-container flex flex-col items-center"><span className="text-xs font-bold text-quran-gold">{ayah.ruku_surah || ''}</span><span className="text-2xl md:text-3xl font-bold text-quran-gold">ع</span><span className="text-xs font-bold text-quran-gold">{ayah.ruku_para || ''}</span></div>)}
                  {ayah.bismillah && (<div className="text-center my-3 text-lg md:text-2xl text-quran-bismillah dark:text-quran-bismillah-dark"><div dangerouslySetInnerHTML={{ __html: ayah.bismillah }} /></div>)}
                  <div className="relative">
                    <span className="quran-ayat-text font-bold leading-[2.4] text-quran-text dark:text-quran-text-dark" style={{ fontFamily: "'Scheherazade New', serif" }}><span dangerouslySetInnerHTML={{ __html: ayah.textTajweed }} /></span>
                    <span className="inline-block mr-2 text-quran-gold text-lg font-bold">({ayah.ayaIndex})</span>
                  </div>
                  <button onClick={() => handleMicClick(ayah)} disabled={isThisLoading && !isThisRecording} title={isThisRecording ? 'روکیں' : 'تلاوت شروع کریں'}
                    className={`absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 rounded-full shadow-lg hover:scale-110 ${isThisRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse opacity-100' : 'bg-emerald-500 hover:bg-emerald-600'} disabled:opacity-40 disabled:cursor-not-allowed`}>
                    {isThisLoading && !isThisRecording ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : isThisRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
                  </button>
                  {isThisRecording && currentAccuracy > 0 && (
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 shadow-md border">
                      <span className={`text-xs font-bold ${currentAccuracy >= 98 ? 'text-green-600' : currentAccuracy >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>{currentAccuracy}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between px-3 md:px-6 py-3 quran-footer-border quran-footer-bg">
            <button onClick={handleNext} disabled={!pagination.hasNextPage} className="flex items-center gap-1 text-sm font-bold text-quran-text dark:text-quran-text-dark disabled:opacity-30"><ChevronLeft className="w-4 h-4" /> اگلا</button>
            <div className="text-sm md:text-base font-bold text-quran-text dark:text-quran-text-dark text-center">{manzil || `صفحہ ${pagination.currentPage}`}</div>
            <button onClick={handlePrev} disabled={!pagination.hasPrevPage} className="flex items-center gap-1 text-sm font-bold text-quran-text dark:text-quran-text-dark disabled:opacity-30">پچھلا <ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </>
  );
}