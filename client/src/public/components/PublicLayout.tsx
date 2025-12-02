import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { NeuralCanvas } from "./NeuralCanvas";
import "../styles/public.css";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="public-page min-h-screen flex flex-col bg-[#030407] text-white antialiased">
      <NeuralCanvas />
      <PublicHeader />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
