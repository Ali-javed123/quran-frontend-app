// app/layout.tsx
import './globals.css';
import { ThemeProvider } from "../components/theme-provider";
import { cn } from "../lib/utils";
import { SidebarProvider } from "../components/ui/sidebar";

// 🔹 Dynamic import of fonts
import { Amiri as AmiriFont, Geist as GeistFont } from "next/font/google";

const geistSans = GeistFont( { subsets: [ 'latin' ], variable: '--font-sans' } );
const geistMono = GeistFont( { subsets: [ 'latin' ], weight: [ '400', '700' ], variable: '--font-mono' } );
const amiri = AmiriFont( { subsets: [ 'arabic' ], weight: [ '400', '700' ], variable: '--font-arabic' } );

export default function RootLayout( { children }: { children: React.ReactNode } ) {
  return (
    <html
      lang="ar"
      // dir="rtl"

      suppressHydrationWarning
      className={cn(
        geistSans.variable,
        geistMono.variable,
        amiri.variable,
        "font-sans"
      )}
    >
      <body >

        <ThemeProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}