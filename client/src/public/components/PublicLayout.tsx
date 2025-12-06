import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { NeuralCanvas } from "./NeuralCanvas";
import "../styles/public.css";
import { useLocation } from "wouter";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [location] = useLocation();
  
  // Scan pages have their own ScanLayout with header/footer
  const isScanPage = location.startsWith("/scan");
  
  if (isScanPage) {
    // For scan pages, just render children without PublicHeader/Footer
    // ScanLayout provides its own header and footer
    return (
      <div className="min-h-screen bg-[#030407] text-white antialiased">
        {children}
      </div>
    );
  }
  
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
