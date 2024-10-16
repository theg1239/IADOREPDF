import type { Metadata } from 'next';
import Image from 'next/image';
import localFont from 'next/font/local';
import './globals.css';
import { DarkModeProvider } from './context/DarkModeContext';
import DarkModeToggle from './components/DarkModeToggle';

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
  title: 'IMG2PDF - Convert Images to PDF',
  description: 'Easily convert multiple images into a single PDF file. Edit and crop the images you upload easily.x`',
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
            <header className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pt-3 py-2 px-4 shadow-md flex items-center justify-between h-16">
              <div className="flex items-center space-x-1"> 
                <img
  src="/images/IMAGE2PDF.png"
  alt="Img2PDF Logo"
  width={200}
  height={50}
  className="inline-block align-middle"
/>
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
