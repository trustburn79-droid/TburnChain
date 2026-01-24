import { useEffect } from 'react';

export default function MenuTest() {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div 
      className="menu-test-page"
      dangerouslySetInnerHTML={{ __html: menuTestHtml }}
    />
  );
}

const menuTestStyles = `
:root {
  --bg-primary: #06060b;
  --bg-secondary: #0c0c14;
  --bg-card: #12121c;
  --bg-hover: #1a1a28;
  --accent-gold: #f0b90b;
  --accent-orange: #ff8c00;
  --accent-cyan: #00d4aa;
  --accent-purple: #8b5cf6;
  --accent-blue: #3b82f6;
  --accent-pink: #ec4899;
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --border-color: rgba(255, 255, 255, 0.06);
  --glass-bg: rgba(18, 18, 28, 0.95);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glow-gold: rgba(240, 185, 11, 0.4);
  --glow-cyan: rgba(0, 212, 170, 0.4);
  --glow-purple: rgba(139, 92, 246, 0.4);
}

.menu-test-page * { margin: 0; padding: 0; box-sizing: border-box; }

.menu-test-page {
  font-family: 'Inter', 'Rajdhani', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
}

.menu-test-page .bg-stars {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(2px 2px at 20px 30px, rgba(0, 212, 170, 0.2), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(240, 185, 11, 0.15), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(139, 92, 246, 0.25), transparent),
    radial-gradient(2px 2px at 130px 80px, rgba(0, 212, 170, 0.15), transparent);
  background-repeat: repeat;
  background-size: 200px 200px;
  z-index: 0;
  pointer-events: none;
  opacity: 0.2;
}

.menu-test-page .container {
  position: relative;
  z-index: 1;
}

.menu-test-page .announcement-bar {
  background: linear-gradient(90deg, rgba(240, 185, 11, 0.08), rgba(139, 92, 246, 0.08), rgba(0, 212, 170, 0.08));
  padding: 0.6rem 1rem;
  text-align: center;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--border-color);
}

.menu-test-page .announcement-bar span { color: var(--accent-gold); margin-right: 0.5rem; }
.menu-test-page .announcement-bar a { color: var(--accent-cyan); text-decoration: none; margin-left: 0.5rem; }
.menu-test-page .announcement-bar a:hover { text-decoration: underline; }

.menu-test-page .main-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(6, 6, 11, 0.97);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
}

.menu-test-page .header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-test-page .logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.menu-test-page .logo-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  box-shadow: 0 4px 20px var(--glow-gold);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.menu-test-page .logo:hover .logo-icon {
  transform: rotate(-10deg) scale(1.05);
  box-shadow: 0 6px 30px var(--glow-gold);
}

.menu-test-page .logo-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
}

.menu-test-page .logo-text .t { color: var(--accent-gold); }
.menu-test-page .logo-text .burn { color: var(--text-primary); }
.menu-test-page .logo-text .chain { color: var(--accent-cyan); }

.menu-test-page .main-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.menu-test-page .nav-item {
  position: relative;
  padding: 0.7rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-test-page .nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.menu-test-page .nav-item .arrow {
  font-size: 0.65rem;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-test-page .nav-item:hover .arrow {
  transform: rotate(180deg);
}

.menu-test-page .nav-item::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-gold), var(--accent-cyan));
  transition: all 0.3s ease;
  transform: translateX(-50%);
  border-radius: 2px;
}

.menu-test-page .nav-item:hover::after {
  width: calc(100% - 2rem);
}

.menu-test-page .header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.menu-test-page .header-icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.menu-test-page .header-icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.menu-test-page .lang-selector {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-test-page .lang-selector:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.menu-test-page .connect-wallet-btn {
  padding: 0.65rem 1.4rem;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  color: #000;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px var(--glow-gold);
  position: relative;
  overflow: hidden;
}

.menu-test-page .connect-wallet-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.menu-test-page .connect-wallet-btn:hover::before {
  left: 100%;
}

.menu-test-page .connect-wallet-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px var(--glow-gold);
}

.menu-test-page .mega-menu-wrapper {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding-top: 15px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.4s ease, visibility 0.4s ease;
}

.menu-test-page .nav-item:hover .mega-menu-wrapper {
  opacity: 1;
  visibility: visible;
}

.menu-test-page .mega-menu {
  width: 920px;
  background: var(--glass-bg);
  backdrop-filter: blur(30px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 0;
  overflow: hidden;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.6),
    0 0 60px rgba(0, 212, 170, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transform: translateY(10px) scale(0.98);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-test-page .nav-item:hover .mega-menu {
  transform: translateY(0) scale(1);
}

.menu-test-page .mega-menu-header {
  padding: 1.25rem 1.75rem;
  background: linear-gradient(90deg, rgba(240, 185, 11, 0.08), rgba(139, 92, 246, 0.08), rgba(0, 212, 170, 0.08));
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-test-page .mega-menu-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.menu-test-page .mega-menu-title .icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.menu-test-page .mega-menu-badge {
  font-size: 0.7rem;
  padding: 0.3rem 0.7rem;
  background: rgba(0, 212, 170, 0.15);
  color: var(--accent-cyan);
  border-radius: 20px;
  font-weight: 500;
}

.menu-test-page .mega-menu-body {
  padding: 1.5rem;
}

.menu-test-page .mega-menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.menu-test-page .mega-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 1.25rem;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  animation: sectionFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.menu-test-page .nav-item:hover .mega-section:nth-child(1) { animation-delay: 0.05s; }
.menu-test-page .nav-item:hover .mega-section:nth-child(2) { animation-delay: 0.1s; }
.menu-test-page .nav-item:hover .mega-section:nth-child(3) { animation-delay: 0.15s; }
.menu-test-page .nav-item:hover .mega-section:nth-child(4) { animation-delay: 0.2s; }

@keyframes sectionFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-test-page .mega-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-gold), var(--accent-cyan));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-test-page .mega-section:hover::before {
  transform: scaleX(1);
}

.menu-test-page .mega-section:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.menu-test-page .mega-section-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  position: relative;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-test-page .mega-section:hover .mega-section-icon {
  transform: scale(1.1) rotate(-5deg);
}

.menu-test-page .mega-section-icon.gold { 
  background: linear-gradient(135deg, rgba(240, 185, 11, 0.2), rgba(255, 140, 0, 0.2)); 
  box-shadow: 0 4px 20px rgba(240, 185, 11, 0.2);
}
.menu-test-page .mega-section-icon.cyan { 
  background: linear-gradient(135deg, rgba(0, 212, 170, 0.2), rgba(0, 180, 150, 0.2)); 
  box-shadow: 0 4px 20px rgba(0, 212, 170, 0.2);
}
.menu-test-page .mega-section-icon.purple { 
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2)); 
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.2);
}
.menu-test-page .mega-section-icon.pink { 
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(244, 114, 182, 0.2)); 
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.2);
}

.menu-test-page .mega-section-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 0.9rem;
}

.menu-test-page .mega-links {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.menu-test-page .mega-link {
  font-size: 0.9rem;
  color: var(--text-secondary);
  padding: 0.5rem 0.75rem;
  margin: 0 -0.75rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border-radius: 8px;
  position: relative;
}

.menu-test-page .mega-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--accent-cyan);
  border-radius: 2px;
  transition: height 0.3s ease;
}

.menu-test-page .mega-link:hover::before {
  height: 60%;
}

.menu-test-page .mega-link:hover {
  color: var(--text-primary);
  background: rgba(0, 212, 170, 0.08);
  padding-left: 1rem;
}

.menu-test-page .mega-link .arrow-icon {
  margin-left: auto;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  font-size: 0.8rem;
  color: var(--accent-cyan);
}

.menu-test-page .mega-link:hover .arrow-icon {
  opacity: 1;
  transform: translateX(0);
}

.menu-test-page .badge {
  font-size: 0.6rem;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.menu-test-page .badge.core { 
  background: linear-gradient(135deg, rgba(240, 185, 11, 0.2), rgba(255, 140, 0, 0.2)); 
  color: var(--accent-gold); 
}
.menu-test-page .badge.new { 
  background: linear-gradient(135deg, rgba(0, 212, 170, 0.2), rgba(0, 180, 150, 0.2)); 
  color: var(--accent-cyan);
  animation: pulse-badge 2s infinite;
}
.menu-test-page .badge.hot { 
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(248, 113, 113, 0.2)); 
  color: #ef4444; 
}

@keyframes pulse-badge {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.menu-test-page .mega-quick-access {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-color);
  opacity: 0;
  transform: translateY(15px);
  animation: quickFadeIn 0.5s 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes quickFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-test-page .mega-quick-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.menu-test-page .mega-quick-label .icon {
  color: var(--accent-gold);
  animation: flash 2s infinite;
}

@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.menu-test-page .mega-quick-items {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.menu-test-page .mega-quick-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 1.1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.menu-test-page .mega-quick-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.menu-test-page .mega-quick-btn:hover::before {
  opacity: 0.1;
}

.menu-test-page .mega-quick-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--text-primary);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 212, 170, 0.15);
}

.menu-test-page .mega-quick-btn .icon {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.menu-test-page .mega-quick-btn:hover .icon {
  transform: scale(1.2);
}

.menu-test-page .mega-featured {
  margin-top: 1.25rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(0, 212, 170, 0.1));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  opacity: 0;
  animation: featuredFadeIn 0.5s 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes featuredFadeIn {
  to { opacity: 1; }
}

.menu-test-page .mega-featured-text {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.menu-test-page .mega-featured-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-cyan));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.menu-test-page .mega-featured-info h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.menu-test-page .mega-featured-info p {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.menu-test-page .mega-featured-btn {
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-test-page .mega-featured-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.menu-test-page .hero-section {
  padding: 5rem 2rem;
  text-align: center;
  position: relative;
  background: radial-gradient(ellipse at center top, rgba(240, 185, 11, 0.08), transparent 50%);
}

.menu-test-page .hero-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.menu-test-page .hero-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.6;
}

.menu-test-page .hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 4rem;
}

.menu-test-page .hero-btn {
  padding: 0.8rem 1.75rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.menu-test-page .hero-btn.primary {
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  color: #000;
  border: none;
  box-shadow: 0 4px 20px var(--glow-gold);
}

.menu-test-page .hero-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px var(--glow-gold);
}

.menu-test-page .hero-btn.secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.menu-test-page .hero-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

.menu-test-page .hero-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.menu-test-page .stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  min-width: 180px;
  text-align: center;
  transition: all 0.3s ease;
}

.menu-test-page .stat-card:hover {
  transform: translateY(-5px);
  border-color: var(--accent-cyan);
}

.menu-test-page .stat-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--accent-cyan);
  margin-bottom: 0.5rem;
}

.menu-test-page .stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.menu-test-page .solutions-section {
  padding: 5rem 2rem;
  background: var(--bg-secondary);
}

.menu-test-page .section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.menu-test-page .section-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.menu-test-page .section-desc {
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.menu-test-page .solutions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.menu-test-page .solution-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.menu-test-page .solution-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.1);
}

.menu-test-page .solution-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  font-size: 1.5rem;
}

.menu-test-page .solution-icon.gold { background: linear-gradient(135deg, rgba(240, 185, 11, 0.15), rgba(255, 140, 0, 0.15)); }
.menu-test-page .solution-icon.cyan { background: linear-gradient(135deg, rgba(0, 212, 170, 0.15), rgba(0, 180, 150, 0.15)); }
.menu-test-page .solution-icon.purple { background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.15)); }

.menu-test-page .solution-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.menu-test-page .solution-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.menu-test-page .cta-section {
  padding: 5rem 2rem;
  text-align: center;
  background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.08), transparent 60%);
}

.menu-test-page .cta-box {
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(0, 212, 170, 0.08));
  border: 1px solid var(--border-color);
  border-radius: 24px;
}

.menu-test-page .cta-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.menu-test-page .cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.menu-test-page .cta-btn {
  padding: 0.8rem 1.75rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.menu-test-page .cta-btn.primary {
  background: var(--accent-cyan);
  color: #000;
  border: none;
}

.menu-test-page .cta-btn.primary:hover {
  background: #00e6b8;
  transform: translateY(-3px);
  box-shadow: 0 10px 30px var(--glow-cyan);
}

.menu-test-page .cta-btn.secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.menu-test-page .cta-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

.menu-test-page .footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.menu-test-page .footer-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem;
  display: grid;
  grid-template-columns: 1.5fr repeat(4, 1fr);
  gap: 3rem;
}

.menu-test-page .footer-brand { padding-right: 2rem; }

.menu-test-page .footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.menu-test-page .footer-logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-test-page .footer-logo-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
}

.menu-test-page .footer-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.menu-test-page .footer-social {
  display: flex;
  gap: 0.75rem;
}

.menu-test-page .social-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.menu-test-page .social-icon:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-3px);
}

.menu-test-page .footer-column h4 {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-test-page .footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.menu-test-page .footer-link {
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.menu-test-page .footer-link:hover { color: var(--accent-cyan); }

.menu-test-page .footer-newsletter {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-test-page .newsletter-text h4 { font-size: 1rem; margin-bottom: 0.25rem; }
.menu-test-page .newsletter-text p { font-size: 0.85rem; color: var(--text-muted); }

.menu-test-page .newsletter-form { display: flex; gap: 0.75rem; }

.menu-test-page .newsletter-input {
  padding: 0.7rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 0.9rem;
  width: 280px;
}

.menu-test-page .newsletter-input::placeholder { color: var(--text-muted); }

.menu-test-page .newsletter-btn {
  padding: 0.7rem 1.5rem;
  background: var(--accent-cyan);
  color: #000;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-test-page .newsletter-btn:hover {
  background: #00e6b8;
  transform: translateY(-2px);
}

.menu-test-page .footer-bottom {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.menu-test-page .footer-copyright { font-size: 0.8rem; color: var(--text-muted); }

.menu-test-page .footer-quick-links { display: flex; gap: 1.5rem; flex-wrap: wrap; }

.menu-test-page .footer-quick-link {
  font-size: 0.8rem;
  color: var(--accent-cyan);
  cursor: pointer;
  transition: color 0.2s;
}

.menu-test-page .footer-quick-link:hover { color: var(--accent-gold); }

.menu-test-page .footer-legal { display: flex; gap: 1.5rem; }
.menu-test-page .footer-legal a { font-size: 0.8rem; color: var(--text-muted); text-decoration: none; }
.menu-test-page .footer-legal a:hover { color: var(--text-secondary); }

@media (max-width: 1200px) {
  .menu-test-page .mega-menu { width: 95vw; }
  .menu-test-page .mega-menu-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 992px) {
  .menu-test-page .main-nav { display: none; }
  .menu-test-page .mobile-menu-btn { display: flex; }
  .menu-test-page .solutions-grid { grid-template-columns: repeat(2, 1fr); }
  .menu-test-page .footer-main { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .menu-test-page .quick-access-bar { display: none; }
  .menu-test-page .hero-title { font-size: 2.5rem; }
  .menu-test-page .hero-stats { flex-direction: column; align-items: center; }
  .menu-test-page .stat-card { width: 100%; max-width: 300px; }
  .menu-test-page .solutions-grid { grid-template-columns: 1fr; }
  .menu-test-page .footer-main { grid-template-columns: 1fr; gap: 2rem; }
  .menu-test-page .footer-newsletter { flex-direction: column; gap: 1rem; text-align: center; }
  .menu-test-page .newsletter-form { flex-direction: column; width: 100%; }
  .menu-test-page .newsletter-input { width: 100%; }
  .menu-test-page .footer-bottom { flex-direction: column; text-align: center; }
}

.menu-test-page .mobile-menu-btn {
  display: none;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.2rem;
}
`;

const menuTestHtml = `
<style>${menuTestStyles}</style>
<div class="bg-stars"></div>

<div class="container">
    <!-- Announcement Bar -->
    <div class="announcement-bar">
        <span>&#127881;</span>
        TBURN Mainnet is LIVE! 155,324 TPS achieved with 99.99% uptime.
        <a href="#">Learn more &rarr;</a>
    </div>

    <!-- Main Header -->
    <header class="main-header">
        <div class="header-content">
            <!-- Logo -->
            <a href="#" class="logo">
                <div class="logo-icon">&#128293;</div>
                <div class="logo-text">
                    <span class="t">T</span><span class="burn">Burn</span> <span class="chain">Chain</span>
                </div>
            </a>

            <!-- Main Navigation -->
            <nav class="main-nav">
                <!-- Explore Menu -->
                <div class="nav-item">
                    Explore <span class="arrow">&#9662;</span>
                    <div class="mega-menu-wrapper">
                        <div class="mega-menu">
                            <div class="mega-menu-header">
                                <div class="mega-menu-title">
                                    <span class="icon">&#128269;</span>
                                    Explore TBurn Chain
                                </div>
                                <div class="mega-menu-badge">Mainnet Live</div>
                            </div>
                            <div class="mega-menu-body">
                                <div class="mega-menu-grid">
                                    <div class="mega-section">
                                        <div class="mega-section-icon gold">&#128269;</div>
                                        <div class="mega-section-title">Blockchain</div>
                                        <div class="mega-links">
                                            <div class="mega-link">TBurn Scan <span class="badge core">Core</span> <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Transactions <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Blocks <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Accounts <span class="arrow-icon">&rarr;</span></div>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-icon cyan">&#128202;</div>
                                        <div class="mega-section-title">Network</div>
                                        <div class="mega-links">
                                            <div class="mega-link">Validators <span class="badge core">Core</span> <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Staking <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Governance <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Node Map <span class="arrow-icon">&rarr;</span></div>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-icon purple">&#128176;</div>
                                        <div class="mega-section-title">Assets</div>
                                        <div class="mega-links">
                                            <div class="mega-link">TBURN Token <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Bridge <span class="badge core">Core</span> <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Token List <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">NFT Gallery <span class="arrow-icon">&rarr;</span></div>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-icon pink">&#128200;</div>
                                        <div class="mega-section-title">DeFi Hub</div>
                                        <div class="mega-links">
                                            <div class="mega-link">DEX <span class="badge hot">Hot</span> <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Lending <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Yield Farming <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">NFT Marketplace <span class="arrow-icon">&rarr;</span></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mega-quick-access">
                                    <div class="mega-quick-label"><span class="icon">&#9889;</span> Quick Access</div>
                                    <div class="mega-quick-items">
                                        <div class="mega-quick-btn"><span class="icon">&#128269;</span> TBurn Scan</div>
                                        <div class="mega-quick-btn"><span class="icon">&#128202;</span> Validators</div>
                                        <div class="mega-quick-btn"><span class="icon">&#128279;</span> Bridge</div>
                                        <div class="mega-quick-btn"><span class="icon">&#128225;</span> RPC Endpoint</div>
                                        <div class="mega-quick-btn"><span class="icon">&#128499;&#65039;</span> Governance</div>
                                    </div>
                                </div>

                                <div class="mega-featured">
                                    <div class="mega-featured-text">
                                        <div class="mega-featured-icon">&#128640;</div>
                                        <div class="mega-featured-info">
                                            <h4>155,324 TPS Achieved!</h4>
                                            <p>World's fastest AI-powered blockchain is live</p>
                                        </div>
                                    </div>
                                    <div class="mega-featured-btn">View Stats &rarr;</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Build Menu -->
                <div class="nav-item">
                    Build <span class="arrow">&#9662;</span>
                    <div class="mega-menu-wrapper">
                        <div class="mega-menu">
                            <div class="mega-menu-header">
                                <div class="mega-menu-title">
                                    <span class="icon">&#128736;&#65039;</span>
                                    Build on TBurn
                                </div>
                                <div class="mega-menu-badge">Developer Portal</div>
                            </div>
                            <div class="mega-menu-body">
                                <div class="mega-menu-grid">
                                    <div class="mega-section">
                                        <div class="mega-section-icon gold">&#128214;</div>
                                        <div class="mega-section-title">Documentation</div>
                                        <div class="mega-links">
                                            <div class="mega-link">Getting Started <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">API Reference <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">SDK Guide <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Smart Contracts <span class="arrow-icon">&rarr;</span></div>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-icon cyan">&#128736;&#65039;</div>
                                        <div class="mega-section-title">Developer Tools</div>
                                        <div class="mega-links">
                                            <div class="mega-link">RPC Endpoints <span class="badge core">Core</span> <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">WebSocket API <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">CLI Tools <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">GitHub <span class="arrow-icon">&rarr;</span></div>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-icon purple">&#129514;</div>
                                        <div class="mega-section-title">Testnet</div>
                                        <div class="mega-links">
                                            <div class="mega-link">Faucet <span class="badge new">New</span> <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Testnet Scan <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Testnet RPC <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Deploy Guide <span class="arrow-icon">&rarr;</span></div>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-icon pink">&#127891;</div>
                                        <div class="mega-section-title">Resources</div>
                                        <div class="mega-links">
                                            <div class="mega-link">Whitepaper <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Tokenomics <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Roadmap <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Education <span class="arrow-icon">&rarr;</span></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mega-quick-access">
                                    <div class="mega-quick-label"><span class="icon">&#9889;</span> Quick Access</div>
                                    <div class="mega-quick-items">
                                        <div class="mega-quick-btn"><span class="icon">&#128167;</span> Faucet</div>
                                        <div class="mega-quick-btn"><span class="icon">&#128225;</span> Testnet RPC</div>
                                        <div class="mega-quick-btn"><span class="icon">&#128196;</span> API Docs</div>
                                        <div class="mega-quick-btn"><span class="icon">&#128025;</span> GitHub</div>
                                    </div>
                                </div>

                                <div class="mega-featured">
                                    <div class="mega-featured-text">
                                        <div class="mega-featured-icon">&#129504;</div>
                                        <div class="mega-featured-info">
                                            <h4>AI Smart Contract Templates</h4>
                                            <p>Deploy intelligent contracts in minutes</p>
                                        </div>
                                    </div>
                                    <div class="mega-featured-btn">Get Started &rarr;</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Community Menu -->
                <div class="nav-item">
                    Community <span class="arrow">&#9662;</span>
                    <div class="mega-menu-wrapper">
                        <div class="mega-menu" style="width: 720px;">
                            <div class="mega-menu-header">
                                <div class="mega-menu-title">
                                    <span class="icon">&#128101;</span>
                                    Join Our Community
                                </div>
                                <div class="mega-menu-badge">50K+ Members</div>
                            </div>
                            <div class="mega-menu-body">
                                <div class="mega-menu-grid" style="grid-template-columns: repeat(3, 1fr);">
                                    <div class="mega-section">
                                        <div class="mega-section-icon gold">&#128172;</div>
                                        <div class="mega-section-title">Social</div>
                                        <div class="mega-links">
                                            <div class="mega-link">Discord <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Telegram <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Twitter <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Medium <span class="arrow-icon">&rarr;</span></div>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-icon cyan">&#127942;</div>
                                        <div class="mega-section-title">Events</div>
                                        <div class="mega-links">
                                            <div class="mega-link">Hackathons <span class="badge hot">Hot</span> <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Meetups <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Webinars <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Conferences <span class="arrow-icon">&rarr;</span></div>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-icon purple">&#127873;</div>
                                        <div class="mega-section-title">Programs</div>
                                        <div class="mega-links">
                                            <div class="mega-link">Ambassador <span class="badge new">New</span> <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Grants <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Bug Bounty <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Partners <span class="arrow-icon">&rarr;</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- More Menu -->
                <div class="nav-item">
                    More <span class="arrow">&#9662;</span>
                    <div class="mega-menu-wrapper">
                        <div class="mega-menu" style="width: 500px;">
                            <div class="mega-menu-header">
                                <div class="mega-menu-title">
                                    <span class="icon">&#128279;</span>
                                    More Resources
                                </div>
                            </div>
                            <div class="mega-menu-body">
                                <div class="mega-menu-grid" style="grid-template-columns: repeat(2, 1fr);">
                                    <div class="mega-section">
                                        <div class="mega-section-icon gold">&#128188;</div>
                                        <div class="mega-section-title">About</div>
                                        <div class="mega-links">
                                            <div class="mega-link">About Us <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Team <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Careers <span class="badge new">Hiring</span> <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Press Kit <span class="arrow-icon">&rarr;</span></div>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-icon cyan">&#128218;</div>
                                        <div class="mega-section-title">Legal</div>
                                        <div class="mega-links">
                                            <div class="mega-link">Terms of Service <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Privacy Policy <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Cookie Policy <span class="arrow-icon">&rarr;</span></div>
                                            <div class="mega-link">Disclaimers <span class="arrow-icon">&rarr;</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Header Right -->
            <div class="header-right">
                <div class="header-icon-btn">&#128269;</div>
                <div class="header-icon-btn">&#128276;</div>
                <div class="lang-selector">&#127760; EN &#9662;</div>
                <button class="connect-wallet-btn">Connect Wallet</button>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
        <h1 class="hero-title">The Future of<br />AI-Powered Blockchain</h1>
        <p class="hero-subtitle">
            Experience the world's fastest blockchain with 155,324 TPS, 
            powered by advanced AI consensus and quantum-resistant security.
        </p>
        <div class="hero-buttons">
            <button class="hero-btn primary">Launch App</button>
            <button class="hero-btn secondary">Read Docs</button>
        </div>
        <div class="hero-stats">
            <div class="stat-card">
                <div class="stat-value">155,324</div>
                <div class="stat-label">TPS</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">99.99%</div>
                <div class="stat-label">Uptime</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">24</div>
                <div class="stat-label">Shards</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">125</div>
                <div class="stat-label">Validators</div>
            </div>
        </div>
    </section>

    <!-- Solutions Section -->
    <section class="solutions-section">
        <div class="section-header">
            <h2 class="section-title">Enterprise Solutions</h2>
            <p class="section-desc">
                Discover how TBurn Chain powers the next generation of decentralized applications
            </p>
        </div>
        <div class="solutions-grid">
            <div class="solution-card">
                <div class="solution-icon gold">&#128293;</div>
                <h3 class="solution-title">AI-Optimized Consensus</h3>
                <p class="solution-desc">
                    Revolutionary BFT consensus enhanced by AI for maximum throughput and minimal latency.
                </p>
            </div>
            <div class="solution-card">
                <div class="solution-icon cyan">&#128274;</div>
                <h3 class="solution-title">Quantum-Resistant</h3>
                <p class="solution-desc">
                    Future-proof security with post-quantum cryptographic signatures and multi-layer protection.
                </p>
            </div>
            <div class="solution-card">
                <div class="solution-icon purple">&#128640;</div>
                <h3 class="solution-title">Dynamic Sharding</h3>
                <p class="solution-desc">
                    Auto-scaling shard architecture that adapts to network demand in real-time.
                </p>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
        <div class="cta-box">
            <h2 class="cta-title">Ready to Build the Future?</h2>
            <div class="cta-buttons">
                <button class="cta-btn primary">Start Building</button>
                <button class="cta-btn secondary">Contact Sales</button>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-main">
            <div class="footer-brand">
                <div class="footer-logo">
                    <div class="footer-logo-icon">&#128293;</div>
                    <div class="footer-logo-text">TBurn Chain</div>
                </div>
                <p class="footer-desc">
                    The world's fastest AI-powered blockchain. Building the future of decentralized finance with quantum-resistant security.
                </p>
                <div class="footer-social">
                    <div class="social-icon">&#120143;</div>
                    <div class="social-icon">&#128172;</div>
                    <div class="social-icon">&#128190;</div>
                    <div class="social-icon">&#9993;&#65039;</div>
                </div>
            </div>
            <div class="footer-column">
                <h4>&#128269; Explore</h4>
                <div class="footer-links">
                    <div class="footer-link">TBurn Scan</div>
                    <div class="footer-link">Validators</div>
                    <div class="footer-link">Governance</div>
                    <div class="footer-link">Bridge</div>
                </div>
            </div>
            <div class="footer-column">
                <h4>&#128736;&#65039; Build</h4>
                <div class="footer-links">
                    <div class="footer-link">Documentation</div>
                    <div class="footer-link">API Reference</div>
                    <div class="footer-link">GitHub</div>
                    <div class="footer-link">Faucet</div>
                </div>
            </div>
            <div class="footer-column">
                <h4>&#128101; Community</h4>
                <div class="footer-links">
                    <div class="footer-link">Discord</div>
                    <div class="footer-link">Telegram</div>
                    <div class="footer-link">Ambassador</div>
                    <div class="footer-link">Events</div>
                </div>
            </div>
            <div class="footer-column">
                <h4>&#128188; Company</h4>
                <div class="footer-links">
                    <div class="footer-link">About</div>
                    <div class="footer-link">Careers</div>
                    <div class="footer-link">Press</div>
                    <div class="footer-link">Contact</div>
                </div>
            </div>
        </div>
        <div class="footer-newsletter">
            <div class="newsletter-text">
                <h4>Subscribe to our newsletter</h4>
                <p>Get the latest updates and news directly to your inbox</p>
            </div>
            <form class="newsletter-form">
                <input type="email" class="newsletter-input" placeholder="Enter your email" />
                <button type="submit" class="newsletter-btn">Subscribe</button>
            </form>
        </div>
        <div class="footer-bottom">
            <div class="footer-copyright">&copy; 2026 TBurn Chain. All rights reserved.</div>
            <div class="footer-quick-links">
                <div class="footer-quick-link">Status</div>
                <div class="footer-quick-link">Support</div>
                <div class="footer-quick-link">Blog</div>
            </div>
            <div class="footer-legal">
                <a href="#">Terms</a>
                <a href="#">Privacy</a>
                <a href="#">Cookies</a>
            </div>
        </div>
    </footer>
</div>
`;
