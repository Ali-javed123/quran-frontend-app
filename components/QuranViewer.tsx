// 'use client';

// import { useState, useEffect } from 'react';
// import { fetchSurahAyahs, fetchParaAyahs } from '@/lib/api';
// import { Ayah } from '@/types/quran';
// import { Loader2, AlertCircle } from 'lucide-react';
// import '@/styles/tajweed.css';

// interface QuranViewerProps {
//   type: 'surah' | 'para';
//   id: number;
// }

// export function QuranViewer( { type, id }: QuranViewerProps ) {
//   const [ ayahs, setAyahs ] = useState<Ayah[]>( [] );
//   const [ loading, setLoading ] = useState( true );
//   const [ error, setError ] = useState<string | null>( null );
//   const [ title, setTitle ] = useState<string>( '' );

//   useEffect( () => {
//     const loadAyahs = async () => {
//       setLoading( true );
//       setError( null );
//       try {
//         if ( type === 'surah' ) {
//           const response = await fetchSurahAyahs( id );
//           setAyahs( response.ayahs );
//           if ( response.ayahs.length > 0 ) {
//             setTitle( `Surah ${response.ayahs[ 0 ].surah_name} (${response.ayahs[ 0 ].suraIndex})` );
//           }
//         } else {
//           const response = await fetchParaAyahs( id );
//           setAyahs( response.ayahs );
//           if ( response.ayahs.length > 0 ) {
//             setTitle( `Para ${id} - ${response.ayahs[ 0 ].para_name}` );
//           }
//         }
//       } catch ( err ) {
//         setError( err instanceof Error ? err.message : 'Failed to load ayahs' );
//       } finally {
//         setLoading( false );
//       }
//     };
//     loadAyahs();
//   }, [ type, id ] );

//   // Safely render the HTML from textTajweed (trusted API)
//   const renderAyahText = ( textTajweed: string ) => {
//     return { __html: textTajweed };
//   };

//   if ( loading ) {
//     return (
//       <div className="flex justify-center items-center h-full min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
//       </div>
//     );
//   }

//   if ( error ) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full min-h-screen gap-4 text-destructive ">
//         <AlertCircle className="h-12 w-12" />
//         <p className="text-lg">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 ml-[45px]">
//       <div className="text-center mb-8 border-b pb-4">
//         <h1 className="text-2xl md:text-3xl font-bold text-emerald-700 dark:text-emerald-400">
//           {title}
//         </h1>
//         <p className="text-sm text-muted-foreground mt-2">
//           {ayahs.length} Verses • Page {ayahs[ 0 ]?.page_no || '?'}
//         </p>
//       </div>

//       <div className="quran-page space-y-6">
//         {ayahs.map( ( ayah ) => (
//           <div key={ayah._id} className="ayah-card p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 shadow-sm">
//             {/* Bismillah if present */}
//             {ayah.bismillah && (
//               <div className="bismillah text-right mb-4 text-2xl md:text-3xl font-arabic text-emerald-600 dark:text-emerald-400">
//                 <div dangerouslySetInnerHTML={{ __html: ayah.bismillah || ayah.bismillah }} />
//               </div>
//             )}
//             {/* Ayah text with Tajweed coloring */}
//             <div className="arabic-text text-right font-arabic text-3xl md:text-4xl leading-loose">
//               <div dangerouslySetInnerHTML={renderAyahText( ayah.textTajweed )} />
//             </div>
//             <div className="mt-2 text-left text-xs text-muted-foreground">
//               Verse {ayah.ayaIndex} • Page {ayah.page_no}
//             </div>
//           </div>
//         ) )}
//       </div>
//     </div>
//   );
// }


// 'use client';

// import { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   fetchSurahAyahsPaginated,
//   fetchParaAyahsPaginated,
//   fetchSurahMeta,
//   fetchParaMeta,
// } from '@/lib/api';
// import { Ayah } from '@/types/quran';
// import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
// import '@/styles/tajweed.css';

// interface QuranViewerProps {
//   type: 'surah' | 'para';
//   id: number;
// }

// export function QuranViewer( { type, id }: QuranViewerProps ) {
//   const [ ayahs, setAyahs ] = useState<Ayah[]>( [] );
//   const [ loading, setLoading ] = useState( true );
//   const [ error, setError ] = useState<string | null>( null );
//   const [ title, setTitle ] = useState<string>( '' );

//   const [ currentPage, setCurrentPage ] = useState<number>( 1 );
//   const [ totalPages, setTotalPages ] = useState<number>( 1 );
//   const [ startPage, setStartPage ] = useState<number>( 1 );

//   const abortControllerRef = useRef<AbortController | null>( null );

//   // Next start page helper to calculate total pages
//   const getNextStartPage = async ( currentId: number, type: 'surah' | 'para' ) => {
//     try {
//       if ( type === 'surah' ) {
//         const nextMeta = await fetchSurahMeta( currentId + 1 );
//         return nextMeta.startPage || 605;
//       } else {
//         const nextMeta = await fetchParaMeta( currentId + 1 );
//         return nextMeta.startPage || 605;
//       }
//     } catch {
//       return 605; // Last page of Quran
//     }
//   };

//   // Load meta and calculate total pages
//   const loadMeta = useCallback( async ( signal: AbortSignal ) => {
//     try {
//       let metaStartPage: number;
//       let itemName: string;

//       if ( type === 'surah' ) {
//         const meta = await fetchSurahMeta( id );
//         metaStartPage = meta.startPage || 1;
//         itemName = `Surah ${meta.surah_name || ''} (${id})`;
//       } else {
//         const meta = await fetchParaMeta( id );
//         metaStartPage = meta.startPage || 1;
//         itemName = `Para ${id} - ${meta.paraName || ''}`;
//       }

//       if ( signal.aborted ) return;

//       setStartPage( metaStartPage );
//       setCurrentPage( metaStartPage );
//       setTitle( itemName );

//       const nextStartPage = await getNextStartPage( id, type );
//       const total = nextStartPage - metaStartPage;
//       setTotalPages( total > 0 ? metaStartPage + total - 1 : metaStartPage );

//       return metaStartPage;
//     } catch ( err ) {
//       if ( !signal.aborted ) throw err;
//     }
//   }, [ type, id ] );

//   // Load ayahs for specific page
//   const loadAyahs = useCallback( async ( page: number, signal: AbortSignal ) => {
//     setLoading( true );
//     setError( null );

//     try {
//       let res;
//       if ( type === 'surah' ) {
//         res = await fetchSurahAyahsPaginated( id, page );
//       } else {
//         res = await fetchParaAyahsPaginated( id, page );
//       }

//       if ( signal.aborted ) return;

//       setAyahs( res.ayahs || [] );
//       setCurrentPage( page );
//     } catch ( err ) {
//       if ( !signal.aborted ) setError( err instanceof Error ? err.message : 'Failed to load ayahs' );
//     } finally {
//       if ( !signal.aborted ) setLoading( false );
//     }
//   }, [ type, id ] );

//   // Initial load
//   useEffect( () => {
//     const init = async () => {
//       if ( abortControllerRef.current ) abortControllerRef.current.abort();
//       const controller = new AbortController();
//       abortControllerRef.current = controller;
//       const signal = controller.signal;

//       setLoading( true );
//       setError( null );

//       try {
//         const firstPage = await loadMeta( signal );
//         await loadAyahs( firstPage ?? 1, signal );
//       } catch ( err ) {
//         if ( !signal.aborted ) {
//           setError( err instanceof Error ? err.message : 'Failed to load' );
//           setLoading( false );
//         }
//       }
//     };

//     init();

//     return () => {
//       if ( abortControllerRef.current ) abortControllerRef.current.abort();
//     };
//   }, [ id, type, loadMeta, loadAyahs ] );

//   const handleNext = () => {
//     if ( currentPage < totalPages ) {
//       const controller = new AbortController();
//       abortControllerRef.current = controller;
//       loadAyahs( currentPage + 1, controller.signal );
//     }
//   };

//   const handlePrev = () => {
//     if ( currentPage > startPage ) {
//       const controller = new AbortController();
//       abortControllerRef.current = controller;
//       loadAyahs( currentPage - 1, controller.signal );
//     }
//   };

//   if ( loading && ayahs.length === 0 ) {
//     return (
//       <div className="flex justify-center items-center h-full min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
//       </div>
//     );
//   }

//   if ( error ) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full min-h-screen gap-4 text-destructive">
//         <AlertCircle className="h-12 w-12" />
//         <p className="text-lg">{error}</p>
//         <button
//           onClick={() => window.location.reload()}
//           className="px-4 py-2 bg-emerald-600 text-white rounded"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 ml-[45px]">
//       {/* Header */}
//       <div className="text-center mb-8 border-b pb-4">
//         <h1 className="text-2xl md:text-3xl font-bold text-emerald-700">{title}</h1>
//         <p className="text-sm text-muted-foreground mt-2">
//           {ayahs.length} Verses • Page {currentPage} of {totalPages}
//         </p>
//       </div>

//       {/* Ayah list */}
//       <div className="quran-page space-y-6">
//         {ayahs.map( ( ayah ) => (
//           <div
//             key={ayah._id}
//             className="ayah-card p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 shadow-sm"
//           >
//             {ayah.bismillah && (
//               <div className="text-right mb-4 text-2xl font-arabic text-emerald-600">
//                 <div dangerouslySetInnerHTML={{ __html: ayah.bismillah }} />
//               </div>
//             )}
//             <div className="text-right font-arabic text-3xl leading-loose">
//               <div dangerouslySetInnerHTML={{ __html: ayah.textTajweed }} />
//             </div>
//             <div className="mt-2 text-left text-xs text-muted-foreground">
//               Verse {ayah.ayaIndex} • Page {ayah.page_no}
//             </div>
//           </div>
//         ) )}
//       </div>

//       {/* Pagination controls */}
//       <div className="flex justify-center gap-4 mt-8">
//         <button
//           onClick={handlePrev}
//           disabled={currentPage <= startPage}
//           className="px-4 py-2 bg-emerald-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
//         >
//           <ChevronLeft className="w-4 h-4" /> Previous
//         </button>
//         <span className="px-4 py-2 text-muted-foreground">
//           Page {currentPage} / {totalPages}
//         </span>
//         <button
//           onClick={handleNext}
//           disabled={currentPage >= totalPages}
//           className="px-4 py-2 bg-emerald-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
//         >
//           Next <ChevronRight className="w-4 h-4" />
//         </button>
//       </div>
//     </div>
//   );
// }

'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchSurahAyahsPaginated,
  fetchParaAyahsPaginated,
  fetchSurahMeta,
  fetchParaMeta,
} from '@/lib/api';
import { Ayah } from '@/types/quran';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import '@/styles/tajweed.css';

interface QuranViewerProps {
  type: 'surah' | 'para';
  id: number;
}

export function QuranViewer( { type, id }: QuranViewerProps ) {
  const [ ayahs, setAyahs ] = useState<Ayah[]>( [] );
  const [ loading, setLoading ] = useState( true );
  const [ error, setError ] = useState<string | null>( null );
  const [ title, setTitle ] = useState<string>( '' );
  const [ surahName, setSurahName ] = useState<string>( '' );
  const [ paraName, setParaName ] = useState<string>( '' );
  const [ manzil, setManzil ] = useState<string>( '' );
  const [ currentPage, setCurrentPage ] = useState<number>( 1 );
  const [ totalPages, setTotalPages ] = useState<number>( 1 );
  const [ startPage, setStartPage ] = useState<number>( 1 );
  const [ hasNextPage, setHasNextPage ] = useState( true );
  const [ hasPrevPage, setHasPrevPage ] = useState( false );
  const latestRequestRef = useRef<number>( 0 );
  const abortControllerRef = useRef<AbortController | null>( null );

  const getNextStartPage = async ( currentId: number, type: 'surah' | 'para' ) => {
    try {
      if ( type === 'surah' ) {
        const nextMeta = await fetchSurahMeta( currentId + 1 );
        return nextMeta.startPage || 605;
      } else {
        const nextMeta = await fetchParaMeta( currentId + 1 );
        return nextMeta.startPage || 605;
      }
    } catch {
      return 605;
    }
  };

  const loadMeta = useCallback( async ( signal: AbortSignal ) => {
    try {
      let metaStartPage: number;
      let itemName: string;
      let sName = '';
      let pName = '';

      if ( type === 'surah' ) {
        const meta = await fetchSurahMeta( id );
        metaStartPage = meta.startPage || 1;
        sName = meta.surah_name || '';
        pName = meta.paraName || `Para ${id}`;
        itemName = `Surah ${sName} (${id})`;
      } else {
        const meta = await fetchParaMeta( id );
        metaStartPage = meta.startPage || 1;
        pName = meta.paraName || `Para ${id}`;
        sName = meta.surah_name || '';
        itemName = `Para ${id} - ${pName}`;
      }

      if ( signal.aborted ) return;
      setStartPage( metaStartPage );
      setCurrentPage( metaStartPage );
      setTitle( itemName );
      setSurahName( sName );
      setParaName( pName );

      // const nextStartPage = await getNextStartPage( id, type );
      // const total = nextStartPage - metaStartPage;
      // setTotalPages( total > 0 ? metaStartPage + total - 1 : metaStartPage );
      const nextStartPage = await getNextStartPage( id, type );

      // last page = next surah/para ka start - 1
      const lastPage =
        nextStartPage && nextStartPage > metaStartPage
          ? nextStartPage - 1
          : 605; // fallback (Quran total pages)

      setTotalPages( lastPage );
      return metaStartPage;
    } catch ( err ) {
      if ( !signal.aborted ) throw err;
    }
  }, [ type, id ] );

  const loadAyahs = useCallback( async ( page: number, signal: AbortSignal ) => {
    setLoading( true );
    setError( null );

    const requestId = Date.now();
    latestRequestRef.current = requestId;

    try {
      let res;

      // =========================
      // 1. CURRENT PAGE FETCH
      // =========================
      if ( type === 'surah' ) {
        res = await fetchSurahAyahsPaginated( id, page );
      } else {
        res = await fetchParaAyahsPaginated( id, page );
      }

      if ( signal.aborted || latestRequestRef.current !== requestId ) return;

      const fetchedAyahs: Ayah[] = res?.ayahs || [];

      setAyahs( fetchedAyahs );
      setCurrentPage( page );

      // =========================
      // 2. PREV + NEXT CHECK (SAFE)
      // =========================
      let nextExists = false;
      let prevExists = false;

      try {
        const [ nextRes, prevRes ] = await Promise.all( [
          // NEXT PAGE CHECK
          type === 'surah'
            ? fetchSurahAyahsPaginated( id, page + 1 )
            : fetchParaAyahsPaginated( id, page + 1 ),

          // PREV PAGE CHECK
          page > startPage
            ? ( type === 'surah'
              ? fetchSurahAyahsPaginated( id, page - 1 )
              : fetchParaAyahsPaginated( id, page - 1 ) )
            : Promise.resolve( { ayahs: [] } ),
        ] );

        if ( latestRequestRef.current === requestId ) {
          nextExists = ( nextRes?.ayahs?.length || 0 ) > 0;
          prevExists = page > startPage && ( prevRes?.ayahs?.length || 0 ) > 0;
        }
      } catch {
        nextExists = false;
        prevExists = false;
      }

      // =========================
      // 3. UPDATE PAGINATION FLAGS
      // =========================
      setHasNextPage( nextExists );
      setHasPrevPage( prevExists );

      // =========================
      // 4. META INFO UPDATE
      // =========================
      const manzilAyah = fetchedAyahs.find( ( a ) => a.manzil );
      if ( manzilAyah?.manzil ) {
        setManzil( `Manzil ${manzilAyah.manzil}` );
      }

      const firstAyah = fetchedAyahs[ 0 ];
      if ( firstAyah ) {
        if ( firstAyah.surah_name ) setSurahName( firstAyah.surah_name );
        if ( firstAyah.para_name ) setParaName( firstAyah.para_name );
      }

    } catch ( err ) {
      if ( !signal.aborted ) {
        setError( err instanceof Error ? err.message : 'Failed to load ayahs' );
      }
    } finally {
      if ( !signal.aborted ) setLoading( false );
    }
  }, [ type, id, startPage ] );
  useEffect( () => {
    const init = async () => {
      if ( abortControllerRef.current ) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const signal = controller.signal;
      setLoading( true );
      setError( null );
      try {
        const firstPage = await loadMeta( signal );
        await loadAyahs( firstPage ?? 1, signal );
      } catch ( err ) {
        if ( !signal.aborted ) {
          setError( err instanceof Error ? err.message : 'Failed to load' );
          setLoading( false );
        }
      }
    };
    init();
    return () => {
      if ( abortControllerRef.current ) abortControllerRef.current.abort();
    };
  }, [ id, type, loadMeta, loadAyahs ] );

  const handleNext = () => {
    if ( !hasNextPage ) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    loadAyahs( currentPage + 1, controller.signal );
  };

  const handlePrev = () => {
    if ( !hasPrevPage ) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    loadAyahs( currentPage - 1, controller.signal );
  };

  if ( loading && ayahs.length === 0 ) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if ( error ) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen gap-4 text-destructive">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-emerald-700 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // return (
  //   <div className="flex justify-center items-start min-h-screen bg-[#f5efe0] py-7 px-2">
  //     {/* Quran Page Container */}
  //     <div
  //       className="relative w-full ml-32 max-w-[75%] bg-[#fdf8ee] shadow-2xl"
  //       style={{
  //         border: '3px solid #8B5E3C',
  //         fontFamily: "'Scheherazade New', 'KFGQPC Uthman Taha Naskh', serif",
  //       }}
  //     >
  //       {/* Outer decorative border */}
  //       <div
  //         className="absolute inset-[6px] pointer-events-none z-10"
  //         style={{ border: '1px solid #c8a97e' }}
  //       />
  //       <div
  //         className="absolute inset-[2px] pointer-events-none z-10"
  //         style={{ border: '0.5px solid #e2c99a' }}
  //       />

  //       {/* ── TOP HEADER ── */}
  //       <div
  //         className="relative flex items-center justify-between px-6 py-2"
  //         style={{
  //           borderBottom: '2px solid #8B5E3C',
  //           background: 'linear-gradient(to bottom, #f0e0c0, #fdf8ee)',
  //         }}
  //       >
  //         {/* Top-left: Surah Name */}
  //         <div
  //           className="  text-[#5a3a1a]  !text-[30px] !font-bold"
  //           style={{ fontFamily: "'Scheherazade New', serif", direction: 'rtl', minWidth: 80 }}
  //         >
  //           {surahName || title}
  //         </div>

  //         {/* Top-center: Page number in decorative oval */}
  //         <div
  //           className="flex items-center justify-center"
  //           style={{
  //             background: 'transparent',
  //             border: '1.5px solid #8B5E3C',
  //             borderRadius: '50%',
  //             width: 38,
  //             height: 28,

  //             fontSize: 13,
  //             color: '#5a3a1a',
  //             fontWeight: 700,
  //           }}
  //         >
  //           {currentPage}
  //         </div>

  //         {/* Top-right: Para Name */}
  //         <div
  //           className="!text-[36px] !font-bold text-[#5a3a1a] "
  //           style={{ fontFamily: "'Scheherazade New', serif", direction: 'rtl', minWidth: 80, textAlign: 'left' }}
  //         >
  //           {paraName}
  //         </div>
  //       </div>

  //       {/* ── AYAH CONTENT AREA ── */}
  //       <div className="relative px-10 py-4" dir="rtl">
  //         {ayahs.map( ( ayah ) => {
  //           const hasRuku = !!( ayah.ruku_para || ayah.ruku_surah );
  //           return (
  //             <div key={ayah._id} className="relative">
  //               {/* Ruku symbol on the LEFT (which is right in RTL = outside left margin) */}
  //               {hasRuku && (
  //                 <div
  //                   className="absolute flex flex-col items-center"
  //                   style={{
  //                     left: -26,
  //                     top: '50%',
  //                     transform: 'translateY(-50%)',
  //                   }}
  //                 >
  //                   {/* Ruku ع symbol */}
  //                   <span
  //                     style={{
  //                       fontSize: 13,
  //                       color: '#8B5E3C',
  //                       fontWeight: 800,
  //                       lineHeight: 1.2,
  //                     }}
  //                   >
  //                     {ayah.ruku_surah || ayah.ruku_surah}
  //                   </span>
  //                   <span
  //                     style={{
  //                       fontFamily: "'Scheherazade New', serif",
  //                       fontSize: 35,
  //                       color: '#8B5E3C',
  //                       lineHeight: 1,
  //                       fontWeight: 900,
  //                     }}
  //                   >
  //                     ع
  //                   </span>
  //                   {/* Ruku para number below symbol */}
  //                   <span
  //                     style={{
  //                       fontSize: 13,
  //                       color: '#8B5E3C',
  //                       fontWeight: 800,
  //                       lineHeight: 1.2,
  //                     }}
  //                   >
  //                     {ayah.ruku_para || ayah.ruku_para}
  //                   </span>
  //                 </div>
  //               )}

  //               {/* Bismillah */}
  //               {ayah.bismillah && (
  //                 <div
  //                   className="text-center my-3 text-2xl text-[#1a3a1a]"
  //                   style={{ fontFamily: "'Scheherazade New', serif" }}
  //                 >
  //                   <div dangerouslySetInnerHTML={{ __html: ayah.bismillah }} />
  //                 </div>
  //               )}

  //               {/* Ayah text — inline continuous flow like real Quran */}
  //               <span
  //                 className="text-[#1a1a1a] leading-[2.4] text-[42px] font-semi-bold"
  //                 style={{ fontFamily: "'Scheherazade New', serif" }}
  //               >
  //                 <span dangerouslySetInnerHTML={{ __html: ayah.textTajweed }} />
  //               </span>
  //             </div>
  //           );
  //         } )}
  //       </div>

  //       {/* ── BOTTOM FOOTER ── */}
  //       <div
  //         className="flex items-center justify-between px-6 py-3"
  //         style={{
  //           borderTop: '2px solid #8B5E3C',
  //           background: 'linear-gradient(to top, #f0e0c0, #fdf8ee)',
  //         }}
  //       >
  //         {/* Bottom-left: prev page button */}
  //         <button
  //           onClick={handleNext}
  //           // disabled={currentPage >= totalPages}
  //           disabled={!hasNextPage}

  //           className="flex items-center gap-1 text-sm text-[#5a3a1a] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#8B5E3C] transition-colors"
  //           style={{ direction: 'ltr' }}
  //         >
  //           <ChevronLeft className="w-4 h-4" />
  //           Next
  //         </button>

  //         {/* Bottom-center: Manzil */}
  //         <div
  //           className="text-md text-[#5a3a1a] font-bold  text-center"
  //           style={{ fontFamily: "'Scheherazade New', serif" }}
  //         >
  //           {manzil || `صفحہ ${currentPage}`}
  //         </div>

  //         {/* Bottom-right: prev button */}
  //         <button
  //           onClick={handlePrev}
  //           // disabled={currentPage <= startPage}
  //           disabled={!hasPrevPage}
  //           className="flex items-center gap-1 text-md text-[#5a3a1a] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#8B5E3C] transition-colors"
  //           style={{ direction: 'ltr' }}
  //         >
  //           Pre
  //           <ChevronRight className="w-4 h-4" />
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
    <div className="flex justify-center items-start min-h-screen bg-quran-page-bg dark:bg-quran-page-bg-dark transition-colors duration-300 py-4 px-2">

      {/* Quran Page Container */}
      <div
        className="relative w-full max-w-[95%] md:max-w-[85%] lg:max-w-[75%] quran-paper dark:bg-quran-paper-dark shadow-2xl transition-all duration-300"
        style={{
          border: '3px solid var(--quran-gold)',
          fontFamily: "'Scheherazade New', 'KFGQPC Uthman Taha Naskh', serif",
        }}
      >
        {/* Outer borders */}
        <div className="absolute inset-[6px] pointer-events-none z-10 quran-inner-border-light" />
        <div className="absolute inset-[2px] pointer-events-none z-10 quran-inner-border" />

        {/* ───────── TOP HEADER ───────── */}
        <div className="relative flex items-center justify-between px-3 md:px-6 py-2 quran-header-border quran-header-bg dark:quran-header-bg">

          {/* Surah Name */}
          <div
            className="text-quran-text dark:text-quran-text-dark text-lg md:text-2xl lg:text-[30px] font-bold"
            style={{ direction: 'rtl', minWidth: 60 }}
          >
            {surahName || title}
          </div>

          {/* Page Number */}
          <div
            className="flex items-center justify-center w-8 h-6 md:w-10 md:h-7 rounded-full border text-xs md:text-sm font-bold quran-page-number"
          >
            {currentPage}
          </div>

          {/* Para Name */}
          <div
            className="text-quran-text dark:text-quran-text-dark text-lg md:text-2xl lg:text-[28px] font-bold text-right"
            style={{ direction: 'rtl', minWidth: 60 }}
          >
            {paraName}
          </div>
        </div>

        {/* ───────── AYAH CONTENT ───────── */}
        <div className="relative px-3 md:px-10 py-4" dir="rtl">

          {ayahs.map( ( ayah ) => {
            const hasRuku = !!( ayah.ruku_para || ayah.ruku_surah );

            return (
              <div key={ayah._id} className="relative">

                {/* Ruku */}
                {hasRuku && (
                  <div className="ruku-container flex flex-col items-center">
                    <span className="text-xs font-bold text-quran-gold">
                      {ayah.ruku_surah || ''}
                    </span>

                    <span className="text-2xl md:text-3xl font-bold text-quran-gold">
                      ع
                    </span>

                    <span className="text-xs font-bold text-quran-gold">
                      {ayah.ruku_para || ''}
                    </span>
                  </div>
                )}

                {/* Bismillah */}
                {ayah.bismillah && (
                  <div className="text-center my-3 text-lg md:text-2xl text-quran-bismillah dark:text-quran-bismillah-dark">
                    <div dangerouslySetInnerHTML={{ __html: ayah.bismillah }} />
                  </div>
                )}

                {/* Ayah Text */}
                <span
                  className="quran-ayat-text font-bold leading-[2.4] text-quran-text dark:text-quran-text-dark"
                  style={{ fontFamily: "'Scheherazade New', serif" }}
                >
                  <span dangerouslySetInnerHTML={{ __html: ayah.textTajweed }} />
                </span>

              </div>
            );
          } )}

        </div>

        {/* ───────── FOOTER ───────── */}
        <div className="flex items-center justify-between px-3 md:px-6 py-3 quran-footer-border quran-footer-bg dark:quran-footer-bg">

          {/* Prev */}
          <button
            onClick={handleNext}
            disabled={!hasNextPage}
            className="flex items-center gap-1 text-sm font-bold text-quran-text dark:text-quran-text-dark disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            Next
          </button>

          {/* Center */}
          <div className="text-sm md:text-base font-bold text-quran-text dark:text-quran-text-dark text-center">
            {manzil || `صفحہ ${currentPage}`}
          </div>

          {/* Next */}
          <button
            onClick={handlePrev}
            disabled={!hasPrevPage}
            className="flex items-center gap-1 text-sm font-bold text-quran-text dark:text-quran-text-dark disabled:opacity-30"
          >
            Prev
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>
      </div>
    </div>
  );
}
// components/QuranViewer.tsx
