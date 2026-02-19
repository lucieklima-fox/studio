import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { musicSystemConfig } from '@/lib/music-system';

export const metadata: Metadata = {
  title: 'Melody Maestro - Learn Music the Fun Way!',
  description: 'Interactive music education for children to learn notes and piano.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ensure the config is initialized
  const isSystemReady = !!musicSystemConfig;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <FirebaseClientProvider>
          {isSystemReady ? children : (
            <div className="flex items-center justify-center min-h-screen">
               <div className="p-10 text-center bg-white rounded-3xl shadow-xl">
                  <p className="text-xl font-bold text-destructive">Initializing System...</p>
               </div>
            </div>
          )}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
