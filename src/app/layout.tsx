import type { Metadata } from 'next';
import Image from 'next/image'; 
import localFont from 'next/font/local';
import './globals.css';
import { DarkModeProvider } from './context/DarkModeContext';
import DarkModeToggle from './components/DarkModeToggle';
import Link from 'next/link'; 

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'imgtopdf - Convert Images to PDF',
  description: 'Easily convert multiple images into a single PDF file.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}
  >
        <DarkModeProvider>
          <div className="flex flex-col min-h-screen">
            <header className="w-full bg-blue-600 dark:bg-blue-800 text-white py-4 px-8 shadow-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-semibold tracking-wide">ImgToPDF Converter</h1>
              </div>
              <DarkModeToggle />
            </header>
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
        </DarkModeProvider>
      </body>
    </html>
  );
}
