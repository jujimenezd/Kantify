import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Corrected import for Geist (removed _Mono)
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/Navbar';

const geistSans = Geist({ // Using Geist variable font
  variable: '--font-geist-sans',
  subsets: ['latin'],
});


export const metadata: Metadata = {
  title: 'Ethical Compass',
  description: 'Explore ethical dilemmas with Kantian reflection.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="antialiased font-sans">
        <AppProvider>
          <Navbar />
          <main className="pt-16"> {/* Add padding to prevent content overlap with fixed Navbar */}
            {children}
          </main>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
