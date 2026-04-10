import { notFound } from 'next/navigation';
import { QuranSidebar } from '@/components/QuranSidebar';
import { QuranType } from '@/types/quran';

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function QuranPage({ params }: PageProps) {
  const { type } = await params;
  if (type !== 'surah' && type !== 'para') {
    notFound();
  }
  return <QuranSidebar initialType={type as QuranType} />;
}