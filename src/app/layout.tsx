import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Foxnoty – Melody Maestro',
  description: 'Interaktivní hudební výuka čtení not, posuvek a hry na klavír v češtině.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
