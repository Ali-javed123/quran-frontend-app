import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSurahAyahsPaginated, fetchParaAyahsPaginated, fetchSurahMeta, fetchParaMeta } from '../lib/api';
import { Ayah, VerificationResultData, RecitationError, RecitationStartData } from '../types/ayahs';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Mic, MicOff, WifiOff, CheckCircle } from 'lucide-react';
import { useRecitationChecker } from '../hooks/useRecitationChecker';
import { useToast } from '../hooks/useToast';
import { Toast } from './Toast';
import '../styles/tajweed.css';

interface QuranViewerProps { type: 'surah' | 'para'; id: number; }
interface PaginationState { currentPage: number; startPage: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean; }

export function QuranViwer({ type, id }: QuranViewerProps) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surahName, setSurahName] = useState('');
  const [paraName, setParaName] = useState('');
  const [manzil, setManzil] = useState('');
  const [title, setTitle] = useState('');
  const [recordingAyahId, setRecordingAyahId] = useState<string | null>(null);
  const [highlightedWords, setHighlightedWords] = useState<Map<string, { userWord: string; correctWord: string; position: number }[]>>(new Map());
  const [pagination, setPagination] = useState<PaginationState>({ currentPage: 1, startPage: 1, totalPages: 1, hasNextPage: true, hasPrevPage: false });

  const { isConnected, isRecording, isLoading: isRecitationLoading, currentAccuracy, activeAyahId, connectionError, reconnect, startRecitation, startRecording, stopRecording, cancelRecitation, onVerificationResult, onError } = useRecitationChecker();
  const { toasts, addToast, removeToast } = useToast();
  const latestRequestRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAyahRef = useRef<Ayah | null>(null);
  const currentAyahIndexRef = useRef<number>(-1);

  // Helper: Get next ayah in sequence
  const getNextAyah = useCallback((currentAyahObj: Ayah, allAyahs: Ayah[]): Ayah | null => {
    const currentIndex = allAyahs.findIndex(a => a._id === currentAyahObj._id);
    if (currentIndex !== -1 && currentIndex + 1 < allAyahs.length) {
      return allAyahs[currentIndex + 1];
    }
    return null;
  }, []);

  // Helper: Auto-advance to next ayah on perfect recitation
  const autoAdvanceOnPerfect = useCallback(async (currentAyahObj: Ayah, ayahId: string, accuracy: number, allAyahs: Ayah[]) => {
    if (accuracy >= 95 && recordingAyahId === ayahId) {
      // Show success notification
      addToast('success', '✅ کامل تلاوت!', 'ماشاء اللہ! بہت خوب', 2000);
      
      // Clear any existing timeout
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      
      // Stop current recording
      stopRecording();
      setRecordingAyahId(null);
      
      // Small delay to show success message
      successTimeoutRef.current = setTimeout(async () => {
        // Find next ayah
        const nextAyah = getNextAyah(currentAyahObj, allAyahs);
        
        if (nextAyah) {
          // Show notification for auto-advance
          addToast('info', '🔄 اگلی آیت پر جا رہے ہیں', `آیت ${nextAyah.ayaIndex}`, 2000);
          
          // Small delay before starting next ayah
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Automatically start recitation for next ayah
          await autoStartRecitation(nextAyah, allAyahs);
        } else {
          addToast('success', '🎉 مبارک ہو!', 'آپ نے یہ صفحہ مکمل کر لیا', 3000);
        }
      }, 800);
    }
  }, [recordingAyahId, stopRecording, addToast, getNextAyah]);

  // Helper: Auto-start recitation for an ayah
  const autoStartRecitation = useCallback(async (ayah: Ayah, allAyahs: Ayah[]) => {
    // Cancel any existing recitation first
    if (recordingAyahId && isRecording) {
      stopRecording();
      setRecordingAyahId(null);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setRecordingAyahId(ayah._id);
    currentAyahRef.current = ayah;
    
    // Prepare start data
    let startData: RecitationStartData;
    if (type === 'surah') {
      startData = {
        suraIndex: ayah.suraIndex || id,
        ayaIndex: ayah.ayaIndex,
        pageNo: ayah.page_no || pagination.currentPage,
        paraNo: null,
      };
    } else {
      startData = {
        suraIndex: ayah.suraIndex || null,
        ayaIndex: ayah.ayaIndex,
        pageNo: ayah.page_no || pagination.currentPage,
        paraNo: ayah.para_no || id,
      };
    }
    
    // Start recitation session
    startRecitation(startData, ayah._id);
    
    // Wait for session to be ready
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Start recording
    await startRecording();
  }, [type, id, pagination.currentPage, recordingAyahId, isRecording, stopRecording, startRecitation, startRecording]);

  // Update current ayah index when ayahs change
  useEffect(() => {
    if (recordingAyahId && ayahs.length > 0) {
      const idx = ayahs.findIndex(a => a._id === recordingAyahId);
      if (idx !== -1) {
        currentAyahIndexRef.current = idx;
        currentAyahRef.current = ayahs[idx];
      }
    }
  }, [ayahs, recordingAyahId]);

  // Handle verification results with highlighting and auto-advance
  useEffect(() => {
    onVerificationResult((data: VerificationResultData) => {
      // Only process if we have an active recording
      if (!recordingAyahId) return;
      
      // Get current ayah
      const currentAyahObj = currentAyahRef.current;
      if (!currentAyahObj) return;
      
      // Store highlighting data for this ayah
      if (data.wrongWords && data.wrongWords.length > 0) {
        // Filter: only substitution errors (real pronunciation mistakes)
        const realErrors = data.wrongWords.filter(
          (w) => w.errorType === 'substitution' && w.userWord && w.correctWord
        );
        
        if (realErrors.length > 0) {
          setHighlightedWords(prev => {
            const newMap = new Map(prev);
            newMap.set(recordingAyahId, realErrors.map(w => ({
              userWord: w.userWord,
              correctWord: w.correctWord,
              position: w.position
            })));
            return newMap;
          });
        }
      } else if (data.isPerfect || data.accuracy >= 95) {
        // Clear highlighting for perfect recitation
        setHighlightedWords(prev => {
          const newMap = new Map(prev);
          newMap.delete(recordingAyahId);
          return newMap;
        });
      }
      
      // Show notifications for individual word errors (only for substitution errors)
      if (data.wrongWords && data.wrongWords.length > 0 && data.accuracy < 95) {
        data.wrongWords.forEach((w) => {
          // Skip insertion/deletion errors (only show substitution)
          if (w.errorType === 'insertion' || w.errorType === 'deletion') return;
          if (!w.userWord || !w.correctWord) return;
          
          const wrongDisplay = w.userOriginal || w.userWord;
          const correctDisplay = w.correctOriginal || w.correctWord;
          addToast('error', `❌ غلط: "${wrongDisplay}"`, `✅ صحیح: "${correctDisplay}"`, 3000);
        });
      }
      
      // Auto-advance if perfect or high accuracy
      if (data.isPerfect || data.accuracy >= 95) {
        autoAdvanceOnPerfect(currentAyahObj, recordingAyahId, data.accuracy, ayahs);
      }
    });
    
    onError((err: RecitationError) => {
      // Ignore non-critical errors
      if (err.message?.includes('No active recitation') || err.message?.includes('not ready')) return;
      addToast('error', 'خرابی', err.message, 4000);
    });
  }, [onVerificationResult, onError, addToast, recordingAyahId, autoAdvanceOnPerfect, ayahs]);

  // Function to render ayah text with highlighting
  const renderAyahWithHighlighting = useCallback((ayah: Ayah, text: string) => {
    const highlights = highlightedWords.get(ayah._id);
    if (!highlights || highlights.length === 0) {
      return <span dangerouslySetInnerHTML={{ __html: text }} />;
    }
    
    // For now, since we can't easily highlight specific words in HTML without complex parsing,
    // we'll add a visual indicator on the ayah container
    // For proper word-level highlighting, server should provide character positions
    return (
      <span className="relative">
        <span dangerouslySetInnerHTML={{ __html: text }} />
        <div className="absolute inset-0 pointer-events-none">
          {highlights.map((_, idx) => (
            <span key={idx} className="recitation-error-word" style={{ opacity: 0.3 }} />
          ))}
        </div>
      </span>
    );
  }, [highlightedWords]);

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
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
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

  const handleMicClick = async (ayah: Ayah) => {
    const ayahId = ayah._id;
    
    // If clicking on the currently recording ayah, stop recording
    if (recordingAyahId === ayahId && isRecording) {
      stopRecording();
      setRecordingAyahId(null);
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      return;
    }
    
    // Cancel any existing recording first
    if (recordingAyahId && isRecording) {
      stopRecording();
      setRecordingAyahId(null);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setRecordingAyahId(ayahId);
    currentAyahRef.current = ayah;
    
    // Prepare start data
    let startData: RecitationStartData;
    if (type === 'surah') {
      startData = {
        suraIndex: ayah.suraIndex || id,
        ayaIndex: ayah.ayaIndex,
        pageNo: ayah.page_no || pagination.currentPage,
        paraNo: null,
      };
    } else {
      startData = {
        suraIndex: ayah.suraIndex || null,
        ayaIndex: ayah.ayaIndex,
        pageNo: ayah.page_no || pagination.currentPage,
        paraNo: ayah.para_no || id,
      };
    }
    
    // Start recitation session
    startRecitation(startData, ayahId);
    
    // Wait for session to be ready
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Start recording
    await startRecording();
  };

  if (loading && ayahs.length === 0) return <div className="flex justify-center items-center h-full min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div>;
  if (error) return <div className="flex flex-col items-center justify-center h-full min-h-screen gap-4"><AlertCircle className="h-12 w-12 text-red-500" /><p className="text-lg">{error}</p><button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-700 text-white rounded">دوبارہ کوشش کریں</button></div>;

  return (
    <>
      <Toast toasts={toasts} onRemove={removeToast} />
      {!isConnected && (<div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg text-sm flex items-center gap-2"><WifiOff className="w-4 h-4" /><span>سرور سے کنکشن نہیں</span><button onClick={reconnect} className="ml-2 underline">دوبارہ جوڑیں</button></div>)}
      {isRecording && recordingAyahId && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-emerald-600 text-white px-5 py-2 rounded-full shadow-lg text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>🎤 سن رہا ہے — آیت {currentAyahRef.current?.ayaIndex || ''}</span>
          {currentAccuracy > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
              currentAccuracy >= 95 ? 'bg-green-500' : 
              currentAccuracy >= 80 ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {currentAccuracy}%
            </span>
          )}
        </div>
      )}
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
            {ayahs.map((ayah: Ayah, ayahIndex: number) => {
              const hasRuku = !!(ayah.ruku_para || ayah.ruku_surah);
              const isThisRecording = recordingAyahId === ayah._id && isRecording;
              const isThisLoading = isRecitationLoading && activeAyahId === ayah._id;
              const hasHighlights = highlightedWords.has(ayah._id);
              
              return (
                <div 
                  key={ayah._id} 
                  className={`relative group mb-8 ${isThisRecording ? 'recording-active' : ''} ${hasHighlights ? 'has-errors' : ''}`}
                >
                  {hasRuku && (<div className="ruku-container flex flex-col items-center"><span className="text-xs font-bold text-quran-gold">{ayah.ruku_surah || ''}</span><span className="text-2xl md:text-3xl font-bold text-quran-gold">ع</span><span className="text-xs font-bold text-quran-gold">{ayah.ruku_para || ''}</span></div>)}
                  {ayah.bismillah && (<div className="text-center my-3 text-lg md:text-2xl text-quran-bismillah dark:text-quran-bismillah-dark"><div dangerouslySetInnerHTML={{ __html: ayah.bismillah }} /></div>)}
                  <div className={`relative ${hasHighlights ? 'bg-red-50/20 dark:bg-red-900/20 rounded-lg p-2 -mx-2' : ''}`}>
                    <div className={`quran-ayat-text font-bold leading-[2.4] text-quran-text dark:text-quran-text-dark ${hasHighlights ? 'recitation-error-words-container' : ''}`} style={{ fontFamily: "'Scheherazade New', serif" }}>
                      {renderAyahWithHighlighting(ayah, ayah.textTajweed)}
                    </div>
                    <span className="inline-block mr-2 text-quran-gold text-lg font-bold">({ayah.ayaIndex})</span>
                  </div>
                  
                  {/* Error indicator */}
                  {hasHighlights && !isThisRecording && (
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2">
                      <div className="bg-red-500 text-white rounded-full p-1 shadow-md" title="Pronunciation errors found">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                  
                  {/* Perfect indicator */}
                  {!hasHighlights && recordingAyahId !== ayah._id && ayah._id !== currentAyahRef.current?._id && (
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-green-500 text-white rounded-full p-1 shadow-md" title="Previously perfected">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => handleMicClick(ayah)} 
                    disabled={isThisLoading && !isThisRecording} 
                    title={isThisRecording ? 'روکیں' : 'تلاوت شروع کریں'}
                    className={`absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 rounded-full shadow-lg hover:scale-110 ${
                      isThisRecording 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse opacity-100' 
                        : hasHighlights 
                          ? 'bg-yellow-500 hover:bg-yellow-600' 
                          : 'bg-emerald-500 hover:bg-emerald-600'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {isThisLoading && !isThisRecording ? 
                      <Loader2 className="w-4 h-4 text-white animate-spin" /> : 
                      isThisRecording ? 
                        <MicOff className="w-4 h-4 text-white" /> : 
                        <Mic className="w-4 h-4 text-white" />
                    }
                  </button>
                  
                  {isThisRecording && currentAccuracy > 0 && (
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 shadow-md border">
                      <span className={`text-xs font-bold ${
                        currentAccuracy >= 95 ? 'text-green-600' : 
                        currentAccuracy >= 80 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {currentAccuracy}%
                      </span>
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