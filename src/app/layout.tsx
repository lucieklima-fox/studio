import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { musicSystemConfig } from '@/lib/music-system'; // Forces initialization/validation at boot

export const metadata: Metadata = {
  title: 'Melody Maestro - Learn Music the Fun Way!',
  description: 'Interactive music education for children to learn notes and piano.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ensure the config is loaded. If validateMusicSystem threw, this layout won't render.
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
          {isSystemReady ? children : <div className="p-20 text-center font-bold text-destructive">System Initialization Failed</div>}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
