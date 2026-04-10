// 'use client';

// import { useState, useEffect } from 'react';
// import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { fetchSurahs, fetchParas } from '@/lib/api';
// import { Surah, Para, QuranType } from '@/types/quran';
// import { Loader2, AlertCircle } from 'lucide-react';
// import { QuranViewer } from './QuranViewer';

// interface QuranSidebarProps {
//   initialType: QuranType;
// }

// export function QuranSidebar( { initialType }: QuranSidebarProps ) {
//   const [ activeTab, setActiveTab ] = useState<QuranType>( initialType );
//   const [ surahs, setSurahs ] = useState<Surah[]>( [] );
//   const [ paras, setParas ] = useState<Para[]>( [] );
//   const [ loading, setLoading ] = useState( false );
//   const [ error, setError ] = useState<string | null>( null );

//   // Selected item state
//   const [ selectedSuraIndex, setSelectedSuraIndex ] = useState<number | null>( null );
//   const [ selectedParaNo, setSelectedParaNo ] = useState<number | null>( null );

//   useEffect( () => {
//     const loadData = async () => {
//       setLoading( true );
//       setError( null );
//       try {
//         if ( activeTab === 'surah' ) {
//           const data = await fetchSurahs();
//           setSurahs( data );
//           // Auto-select first surah if none selected
//           if ( selectedSuraIndex === null && data.length > 0 ) {
//             setSelectedSuraIndex( data[ 0 ].suraIndex );
//           }
//         } else {
//           const data = await fetchParas();
//           setParas( data );
//           if ( selectedParaNo === null && data.length > 0 ) {
//             setSelectedParaNo( data[ 0 ].para_no );
//           }
//         }
//       } catch ( err ) {
//         setError( err instanceof Error ? err.message : 'Failed to load data' );
//       } finally {
//         setLoading( false );
//       }
//     };
//     loadData();
//   }, [ activeTab ] );

//   const handleTabChange = ( value: string ) => {
//     setActiveTab( value as QuranType );
//     // Reset selection when tab changes
//     setSelectedSuraIndex( null );
//     setSelectedParaNo( null );
//   };

//   const handleSurahSelect = ( suraIndex: number ) => {
//     setSelectedSuraIndex( suraIndex );
//   };

//   const handleParaSelect = ( paraNo: number ) => {
//     setSelectedParaNo( paraNo );
//   };

//   return (
//     <div className="flex min-h-screen bg-background">
//       <Sidebar className="border-r shadow-sm w-80">
//         <SidebarContent>
//           <div className="p-4">
//             <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="surah">سورۃ نام</TabsTrigger>
//                 <TabsTrigger value="para">پارہ نام</TabsTrigger>
//               </TabsList>
//             </Tabs>
//           </div>

//           {loading && (
//             <div className="flex justify-center items-center py-12">
//               <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
//             </div>
//           )}

//           {error && (
//             <div className="flex flex-col items-center gap-2 py-12 text-destructive">
//               <AlertCircle className="h-6 w-6" />
//               <p className="text-sm">{error}</p>
//             </div>
//           )}

//           {!loading && !error && (
//             <>
//               {activeTab === 'surah' && (
//                 <SidebarGroup>
//                   <SidebarGroupLabel>Surahs (114)</SidebarGroupLabel>
//                   <SidebarMenu>
//                     {surahs.map( ( surah ) => (
//                       <SidebarMenuItem key={surah.suraIndex}>
//                         <SidebarMenuButton asChild isActive={selectedSuraIndex === surah.suraIndex}>
//                           <button
//                             onClick={() => handleSurahSelect( surah.suraIndex )}
//                             className="w-full text-left flex justify-between items-center"
//                           >
//                             <span>{surah.surah_name}</span>
//                             <span className="text-xs text-muted-foreground">{surah.suraIndex}</span>
//                           </button>
//                         </SidebarMenuButton>
//                       </SidebarMenuItem>
//                     ) )}
//                   </SidebarMenu>
//                 </SidebarGroup>
//               )}

//               {activeTab === 'para' && (
//                 <SidebarGroup>
//                   <SidebarGroupLabel>Paras (30)</SidebarGroupLabel>
//                   <SidebarMenu>
//                     {paras.map( ( para ) => (
//                       <SidebarMenuItem key={para.para_no}>
//                         <SidebarMenuButton asChild isActive={selectedParaNo === para.para_no}>
//                           <button
//                             onClick={() => handleParaSelect( para.para_no )}
//                             className="w-full text-left"
//                           >
//                             <div className="flex flex-col">
//                               <span className="font-medium">Para {para.para_no}</span>
//                               <span className="text-xs text-muted-foreground">{para.surah_name}</span>
//                               <span className="text-xs text-muted-foreground">Ayahs: {para.ayahCount}</span>
//                             </div>
//                           </button>
//                         </SidebarMenuButton>
//                       </SidebarMenuItem>
//                     ) )}
//                   </SidebarMenu>
//                 </SidebarGroup>
//               )}
//             </>
//           )}
//         </SidebarContent>
//       </Sidebar>

//       <main className="flex-1 overflow-auto">
//         {activeTab === 'surah' && selectedSuraIndex !== null && (
//           <QuranViewer type="surah" id={selectedSuraIndex} />
//         )}
//         {activeTab === 'para' && selectedParaNo !== null && (
//           <QuranViewer type="para" id={selectedParaNo} />
//         )}
//       </main>
//     </div>
//   );
// }
'use client';

import { useState, useEffect } from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '../components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { fetchSurahs, fetchParas } from '../lib/api';
import { Surah, Para, QuranType } from '../types/quran';
import { Loader2, AlertCircle, Sun, Moon } from 'lucide-react';
import { QuranViewer } from './QuranViewer';

interface QuranSidebarProps {
  initialType: QuranType;
}

export function QuranSidebar( { initialType }: QuranSidebarProps ) {
  const [ activeTab, setActiveTab ] = useState<QuranType>( initialType );
  const [ surahs, setSurahs ] = useState<Surah[]>( [] );
  const [ paras, setParas ] = useState<Para[]>( [] );
  const [ loading, setLoading ] = useState( false );
  const [ error, setError ] = useState<string | null>( null );
  const [ isDarkMode, setIsDarkMode ] = useState( false );

  // Selected item state
  const [ selectedSuraIndex, setSelectedSuraIndex ] = useState<number | null>( null );
  const [ selectedParaNo, setSelectedParaNo ] = useState<number | null>( null );

  // Theme management
  useEffect( () => {
    const isDark = localStorage.getItem( 'theme' ) === 'dark' ||
      ( !localStorage.getItem( 'theme' ) && window.matchMedia( '(prefers-color-scheme: dark)' ).matches );
    setIsDarkMode( isDark );
    if ( isDark ) {
      document.documentElement.classList.add( 'dark' );
    } else {
      document.documentElement.classList.remove( 'dark' );
    }
  }, [] );

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode( newDarkMode );
    if ( newDarkMode ) {
      document.documentElement.classList.add( 'dark' );
      localStorage.setItem( 'theme', 'dark' );
    } else {
      document.documentElement.classList.remove( 'dark' );
      localStorage.setItem( 'theme', 'light' );
    }
  };

  useEffect( () => {
    const loadData = async () => {
      setLoading( true );
      setError( null );
      try {
        if ( activeTab === 'surah' ) {
          const data = await fetchSurahs();
          setSurahs( data );
          if ( selectedSuraIndex === null && data.length > 0 ) {
            setSelectedSuraIndex( data[ 0 ].suraIndex );
          }
        } else {
          const data = await fetchParas();
          setParas( data );
          if ( selectedParaNo === null && data.length > 0 ) {
            setSelectedParaNo( data[ 0 ].para_no );
          }
        }
      } catch ( err ) {
        setError( err instanceof Error ? err.message : 'Failed to load data' );
      } finally {
        setLoading( false );
      }
    };
    loadData();
  }, [ activeTab ] );

  const handleTabChange = ( value: string ) => {
    setActiveTab( value as QuranType );
    setSelectedSuraIndex( null );
    setSelectedParaNo( null );
  };

  const handleSurahSelect = ( suraIndex: number ) => {
    setSelectedSuraIndex( suraIndex );
  };

  const handleParaSelect = ( paraNo: number ) => {
    setSelectedParaNo( paraNo );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar className="border-r shadow-sm w-80">
        <SidebarContent>
          <div className="p-4 flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="surah">سورۃ نام</TabsTrigger>
                <TabsTrigger value="para">پارہ نام</TabsTrigger>
              </TabsList>
            </Tabs>
            <button
              onClick={toggleTheme}
              className="ml-2 p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-2 py-12 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {activeTab === 'surah' && (
                <SidebarGroup>
                  <SidebarGroupLabel>Surahs (114)</SidebarGroupLabel>
                  <SidebarMenu>
                    {surahs.map( ( surah ) => (
                      <SidebarMenuItem key={surah.suraIndex}>
                        <SidebarMenuButton asChild isActive={selectedSuraIndex === surah.suraIndex}>
                          <button
                            onClick={() => handleSurahSelect( surah.suraIndex )}
                            className="w-full text-left flex justify-between items-center"
                          >
                            <span>{surah.surah_name}</span>
                            <span className="text-xs text-muted-foreground">{surah.suraIndex}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ) )}
                  </SidebarMenu>
                </SidebarGroup>
              )}

              {activeTab === 'para' && (
                <SidebarGroup>
                  <SidebarGroupLabel>Paras (30)</SidebarGroupLabel>
                  <SidebarMenu>
                    {paras.map( ( para ) => (
                      <SidebarMenuItem key={para.para_no}>
                        <SidebarMenuButton asChild isActive={selectedParaNo === para.para_no}>
                          <button
                            onClick={() => handleParaSelect( para.para_no )}
                            className="w-full text-left"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">Para {para.para_no}</span>
                              <span className="text-xs text-muted-foreground">{para.surah_name}</span>
                              <span className="text-xs text-muted-foreground">Ayahs: {para.ayahCount}</span>
                            </div>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ) )}
                  </SidebarMenu>
                </SidebarGroup>
              )}
            </>
          )}
        </SidebarContent>
      </Sidebar>

      <main className="flex-1 overflow-auto">
        {activeTab === 'surah' && selectedSuraIndex !== null && (
          <QuranViewer type="surah" id={selectedSuraIndex} />
        )}
        {activeTab === 'para' && selectedParaNo !== null && (
          <QuranViewer type="para" id={selectedParaNo} />
        )}
      </main>
    </div>
  );
}