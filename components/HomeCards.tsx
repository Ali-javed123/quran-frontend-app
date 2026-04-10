// 'use client';

// import Link from 'next/link';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { BookOpen, Layers } from 'lucide-react';

// export function HomeCards() {
//   return (
//     <div className="grid gap-6 md:grid-cols-2 max-w-3xl w-full">
//       <Link href="/quran/surah" className="transition-transform hover:scale-105">
//         <Card className="h-full cursor-pointer border-2 hover:border-emerald-500 dark:hover:border-emerald-400">
//           <CardHeader>
//             <BookOpen className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mb-2" />
//             <CardTitle className="text-2xl">Surah Wise</CardTitle>
//             <CardDescription>Browse the Quran by Surah (chapters)</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <p className="text-sm text-muted-foreground">114 Surahs – from Al-Fatihah to An-Nas</p>
//           </CardContent>
//         </Card>
//       </Link>

//       <Link href="/quran/para" className="transition-transform hover:scale-105">
//         <Card className="h-full cursor-pointer border-2 hover:border-emerald-500 dark:hover:border-emerald-400">
//           <CardHeader>
//             <Layers className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mb-2" />
//             <CardTitle className="text-2xl">Para Wise</CardTitle>
//             <CardDescription>Browse the Quran by Juzʼ (para)</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <p className="text-sm text-muted-foreground">30 Paras – traditional division for recitation</p>
//           </CardContent>
//         </Card>
//       </Link>
//     </div>
//   );
// }
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { BookOpen, Layers } from 'lucide-react';

export function HomeCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-full w-full px-4">
      <Link href="/quran/surah" className="transition-transform hover:scale-105">
        <Card className="h-full cursor-pointer border-2 hover:border-emerald-500 dark:hover:border-emerald-400 bg-card">
          <CardHeader>
            <BookOpen className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mb-2" />
            <CardTitle className="text-2xl">Surah Wise</CardTitle>
            <CardDescription>Browse the Quran by Surah (chapters)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">114 Surahs – from Al-Fatihah to An-Nas</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/quran/para" className="transition-transform hover:scale-105">
        <Card className="h-full cursor-pointer border-2 hover:border-emerald-500 dark:hover:border-emerald-400 bg-card">
          <CardHeader>
            <Layers className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mb-2" />
            <CardTitle className="text-2xl">Para Wise</CardTitle>
            <CardDescription>Browse the Quran by Juzʼ (para)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">30 Paras – traditional division for recitation</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}