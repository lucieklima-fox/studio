import GameContainer from '@/components/game/GameContainer';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <main className="min-h-screen pb-12">
      {/* Visual background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
      </div>

      <GameContainer />
      <Toaster />
      
      <footer className="container mx-auto max-w-5xl mt-12 px-4 text-center text-muted-foreground/60">
        <p className="text-sm font-medium">Made with ❤️ for young musicians. Melody Maestro &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
