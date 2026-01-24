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
  --bg-primary: #030407;
  --bg-secondary: #0a0a0f;
  --bg-card: #121218;
  --bg-hover: #1a1a22;
  --accent-gold: #f97316;
  --accent-orange: #ea580c;
  --accent-cyan: #06b6d4;
  --accent-purple: #8b5cf6;
  --accent-blue: #3b82f6;
  --accent-pink: #ec4899;
  --text-primary: #f5f5f5;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --border-color: rgba(255, 255, 255, 0.06);
  --glass-bg: #0a0a0f;
  --glass-border: rgba(255, 255, 255, 0.08);
  --glow-gold: rgba(249, 115, 22, 0.4);
  --glow-cyan: rgba(6, 182, 212, 0.4);
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
    radial-gradient(2px 2px at 20px 30px, rgba(249, 115, 22, 0.3), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(6, 182, 212, 0.2), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(139, 92, 246, 0.3), transparent),
    radial-gradient(2px 2px at 130px 80px, rgba(249, 115, 22, 0.2), transparent);
  background-repeat: repeat;
  background-size: 200px 200px;
  z-index: 0;
  pointer-events: none;
  opacity: 0.3;
}

.menu-test-page .container {
  position: relative;
  z-index: 1;
}

.menu-test-page .announcement-bar {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.08), rgba(139, 92, 246, 0.06), rgba(6, 182, 212, 0.08));
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
  background: rgba(3, 4, 7, 0.9);
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
  width: 40px;
  height: 40px;
  transition: transform 0.3s ease;
}

.menu-test-page .logo:hover .logo-icon {
  transform: scale(1.1);
}

.menu-test-page .logo-icon svg {
  width: 100%;
  height: 100%;
}

.menu-test-page .logo-text {
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}

.menu-test-page .logo-text .tburn { color: var(--text-primary); }
.menu-test-page .logo-text .chain { color: var(--accent-cyan); font-weight: 300; }

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
  padding: 0.5rem;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s ease;
  background: none;
  border: none;
}

.menu-test-page .header-icon-btn:hover {
  color: var(--text-primary);
}

.menu-test-page .header-icon-btn.tree:hover {
  color: #22c55e;
}

.menu-test-page .header-icon-btn svg {
  width: 20px;
  height: 20px;
}

.menu-test-page .lang-selector {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s ease;
  background: none;
  border: none;
}

.menu-test-page .lang-selector:hover {
  color: var(--text-primary);
}

.menu-test-page .lang-selector svg {
  width: 20px;
  height: 20px;
}

.menu-test-page .lang-selector .lang-code {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.menu-test-page .lang-selector .chevron {
  width: 12px;
  height: 12px;
}

.menu-test-page .login-btn {
  background: rgba(10, 10, 15, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: var(--accent-cyan);
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
  white-space: nowrap;
}

.menu-test-page .login-btn:hover {
  background: rgba(6, 182, 212, 0.1);
}

/* MEGA MENU */
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
  background: #050508;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  padding: 0;
  overflow: hidden;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.9),
    0 0 40px rgba(0, 0, 0, 0.5);
  transform: translateY(10px) scale(0.98);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-test-page .nav-item:hover .mega-menu {
  transform: translateY(0) scale(1);
}

.menu-test-page .mega-menu-header {
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-test-page .mega-menu-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-test-page .mega-menu-title .icon {
  width: 26px;
  height: 26px;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

.menu-test-page .mega-menu-badge {
  font-size: 0.6rem;
  padding: 0.2rem 0.5rem;
  background: rgba(6, 182, 212, 0.15);
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
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 1rem;
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
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
  transform: translateY(-3px);
}

.menu-test-page .mega-section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.menu-test-page .mega-section-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  position: relative;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-test-page .mega-section:hover .mega-section-icon {
  transform: scale(1.1) rotate(-5deg);
}

.menu-test-page .mega-section-icon.gold { 
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2)); 
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.15);
}
.menu-test-page .mega-section-icon.cyan { 
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.2)); 
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.15);
}
.menu-test-page .mega-section-icon.purple { 
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2)); 
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.15);
}
.menu-test-page .mega-section-icon.pink { 
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(244, 114, 182, 0.2)); 
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.15);
}

.menu-test-page .mega-section-title {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
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
  text-decoration: none;
}

.menu-test-page .mega-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--accent-gold);
  border-radius: 2px;
  transition: height 0.3s ease;
}

.menu-test-page .mega-link:hover::before {
  height: 60%;
}

.menu-test-page .mega-link:hover {
  color: var(--text-primary);
  background: rgba(249, 115, 22, 0.08);
  padding-left: 1rem;
}

.menu-test-page .mega-link .arrow-icon {
  margin-left: auto;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  font-size: 0.8rem;
  color: var(--accent-gold);
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
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2)); 
  color: var(--accent-gold); 
}
.menu-test-page .badge.new { 
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.2)); 
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

/* Quick Access */
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
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  text-decoration: none;
}

.menu-test-page .mega-quick-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-cyan));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.menu-test-page .mega-quick-btn:hover::before {
  opacity: 0.1;
}

.menu-test-page .mega-quick-btn:hover {
  border-color: var(--accent-gold);
  color: var(--text-primary);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(249, 115, 22, 0.15);
}

.menu-test-page .mega-quick-btn .icon {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.menu-test-page .mega-quick-btn:hover .icon {
  transform: scale(1.2);
}

/* Featured Section */
.menu-test-page .mega-featured {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
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
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  border-radius: 12px;
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
  background: var(--accent-gold);
  color: #000;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.menu-test-page .mega-featured-btn:hover {
  background: var(--accent-orange);
  transform: translateY(-2px);
}

/* Hero Section */
.menu-test-page .hero-section {
  padding: 6rem 2rem 4rem;
  text-align: center;
  position: relative;
}

.menu-test-page .hero-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--text-primary), var(--accent-gold), var(--accent-cyan));
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 5s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.menu-test-page .hero-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.7;
}

.menu-test-page .hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 4rem;
}

.menu-test-page .hero-btn {
  padding: 0.9rem 2rem;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.menu-test-page .hero-btn.primary {
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-orange));
  color: #000;
  border: none;
  box-shadow: 0 4px 25px var(--glow-gold);
}

.menu-test-page .hero-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 40px var(--glow-gold);
}

.menu-test-page .hero-btn.secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.menu-test-page .hero-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Hero Stats */
.menu-test-page .hero-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  max-width: 1000px;
  margin: 0 auto;
}

.menu-test-page .stat-card {
  background: rgba(10, 10, 15, 0.6);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 1.75rem 2.5rem;
  min-width: 180px;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.menu-test-page .stat-card:hover {
  border-color: rgba(249, 115, 22, 0.3);
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.menu-test-page .stat-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-cyan);
  margin-bottom: 0.5rem;
}

.menu-test-page .stat-card:hover .stat-value {
  color: var(--accent-gold);
  text-shadow: 0 0 30px var(--glow-gold);
}

.menu-test-page .stat-label {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* CTA Section */
.menu-test-page .cta-section {
  padding: 5rem 2rem;
  text-align: center;
  background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.06), transparent 60%);
}

.menu-test-page .cta-box {
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.06), rgba(249, 115, 22, 0.06));
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
  background: var(--accent-gold);
  color: #000;
  border: none;
}

.menu-test-page .cta-btn.primary:hover {
  background: var(--accent-orange);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px var(--glow-gold);
}

.menu-test-page .cta-btn.secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.menu-test-page .cta-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Footer */
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

.menu-test-page .footer-link:hover { color: var(--accent-gold); }

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
  background: var(--accent-gold);
  color: #000;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-test-page .newsletter-btn:hover {
  background: var(--accent-orange);
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
  color: var(--accent-gold);
  cursor: pointer;
  transition: color 0.2s;
}

.menu-test-page .footer-quick-link:hover { color: var(--accent-cyan); }

.menu-test-page .footer-legal { display: flex; gap: 1.5rem; }
.menu-test-page .footer-legal a { font-size: 0.8rem; color: var(--text-muted); text-decoration: none; }
.menu-test-page .footer-legal a:hover { color: var(--text-secondary); }

/* Responsive */
@media (max-width: 1200px) {
  .menu-test-page .mega-menu { width: 95vw; }
  .menu-test-page .mega-menu-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 992px) {
  .menu-test-page .main-nav { display: none; }
  .menu-test-page .hero-title { font-size: 2.5rem; }
  .menu-test-page .footer-main { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .menu-test-page .hero-stats { flex-direction: column; align-items: center; }
  .menu-test-page .stat-card { width: 100%; max-width: 300px; }
  .menu-test-page .footer-main { grid-template-columns: 1fr; gap: 2rem; }
  .menu-test-page .footer-newsletter { flex-direction: column; gap: 1rem; text-align: center; }
  .menu-test-page .newsletter-form { flex-direction: column; width: 100%; }
  .menu-test-page .newsletter-input { width: 100%; }
  .menu-test-page .footer-bottom { flex-direction: column; text-align: center; }
}
`;

const menuTestHtml = `
<style>${menuTestStyles}</style>
<div class="bg-stars"></div>

<div class="container">
    <!-- Announcement Bar -->
    <div class="announcement-bar">
        <span>🎉</span>
        TBURN Mainnet is LIVE! 155,324 TPS achieved with 99.99% uptime.
        <a href="#">Learn more →</a>
    </div>

    <!-- Main Header -->
    <header class="main-header">
        <div class="header-content">
            <!-- Logo -->
            <a href="/" class="logo">
                <div class="logo-icon">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="flameGradient" x1="50%" y1="100%" x2="50%" y2="0%">
                                <stop offset="0%" stop-color="#FF6B35" />
                                <stop offset="50%" stop-color="#F7931E" />
                                <stop offset="100%" stop-color="#FFD700" />
                            </linearGradient>
                            <linearGradient id="outerGlow" x1="50%" y1="100%" x2="50%" y2="0%">
                                <stop offset="0%" stop-color="#FF4500" stop-opacity="0.8" />
                                <stop offset="100%" stop-color="#FFD700" stop-opacity="0.2" />
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="45" fill="url(#outerGlow)" opacity="0.3" />
                        <circle cx="50" cy="50" r="40" stroke="url(#flameGradient)" stroke-width="2" fill="none" />
                        <path d="M50 20 C35 35, 25 50, 30 65 C35 80, 45 85, 50 85 C55 85, 65 80, 70 65 C75 50, 65 35, 50 20" fill="url(#flameGradient)" />
                        <path d="M50 35 C42 45, 38 55, 42 65 C45 72, 48 75, 50 75 C52 75, 55 72, 58 65 C62 55, 58 45, 50 35" fill="#FFD700" opacity="0.8" />
                        <text x="50" y="58" text-anchor="middle" font-size="16" font-weight="bold" fill="#1a1a2e" font-family="sans-serif">T</text>
                    </svg>
                </div>
                <div class="logo-text">
                    <span class="tburn">TBurn</span> <span class="chain">Chain</span>
                </div>
            </a>

            <!-- Main Navigation -->
            <nav class="main-nav">
                <!-- Explore Menu -->
                <div class="nav-item">
                    Explore <span class="arrow">▾</span>
                    <div class="mega-menu-wrapper">
                        <div class="mega-menu">
                            <div class="mega-menu-header">
                                <div class="mega-menu-title">
                                    <span class="icon">🔍</span>
                                    Explore TBurn Chain
                                </div>
                                <div class="mega-menu-badge">Mainnet Live</div>
                            </div>
                            <div class="mega-menu-body">
                                <div class="mega-menu-grid">
                                    <div class="mega-section">
                                        <div class="mega-section-header">
                                            <div class="mega-section-icon gold">🔍</div>
                                            <div class="mega-section-title">TBURNScan</div>
                                        </div>
                                        <div class="mega-links">
                                            <a href="/scan" class="mega-link">Mainnet Scan <span class="badge core">Core</span> <span class="arrow-icon">→</span></a>
                                            <a href="/scan/blocks" class="mega-link">Blocks <span class="arrow-icon">→</span></a>
                                            <a href="/scan/txs" class="mega-link">Transactions <span class="arrow-icon">→</span></a>
                                            <a href="/scan/validators" class="mega-link">Validators <span class="arrow-icon">→</span></a>
                                            <a href="/scan/tokens" class="mega-link">Tokens <span class="arrow-icon">→</span></a>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-header">
                                            <div class="mega-section-icon cyan">📊</div>
                                            <div class="mega-section-title">Network</div>
                                        </div>
                                        <div class="mega-links">
                                            <a href="/network/validators" class="mega-link">Validators <span class="badge core">Core</span> <span class="arrow-icon">→</span></a>
                                            <a href="/network/rpc" class="mega-link">RPC Providers <span class="arrow-icon">→</span></a>
                                            <a href="/network/status" class="mega-link">Network Status <span class="arrow-icon">→</span></a>
                                            <a href="/network/ramp" class="mega-link">On/Off Ramp <span class="arrow-icon">→</span></a>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-header">
                                            <div class="mega-section-icon purple">📚</div>
                                            <div class="mega-section-title">Learn</div>
                                        </div>
                                        <div class="mega-links">
                                            <a href="/learn/what-is-burn-chain" class="mega-link">What is TBURN Chain <span class="arrow-icon">→</span></a>
                                            <a href="/learn/trust-score" class="mega-link">Trust Score System <span class="arrow-icon">→</span></a>
                                            <a href="/learn/whitepaper" class="mega-link">Whitepaper <span class="arrow-icon">→</span></a>
                                            <a href="/learn/tokenomics" class="mega-link">Tokenomics <span class="arrow-icon">→</span></a>
                                            <a href="/learn/roadmap" class="mega-link">Roadmap <span class="arrow-icon">→</span></a>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-header">
                                            <div class="mega-section-icon pink">📈</div>
                                            <div class="mega-section-title">DeFi Hub</div>
                                        </div>
                                        <div class="mega-links">
                                            <a href="/app/dex" class="mega-link">DEX <span class="badge hot">Hot</span> <span class="arrow-icon">→</span></a>
                                            <a href="/app/lending" class="mega-link">Lending <span class="arrow-icon">→</span></a>
                                            <a href="/app/yield-farming" class="mega-link">Yield Farming <span class="arrow-icon">→</span></a>
                                            <a href="/app/bridge" class="mega-link">Bridge <span class="arrow-icon">→</span></a>
                                            <a href="/app/staking" class="mega-link">Staking <span class="arrow-icon">→</span></a>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mega-quick-access">
                                    <div class="mega-quick-label"><span class="icon">⚡</span> Quick Access</div>
                                    <div class="mega-quick-items">
                                        <a href="/scan" class="mega-quick-btn"><span class="icon">🔍</span> TBurn Scan</a>
                                        <a href="/network/validators" class="mega-quick-btn"><span class="icon">📊</span> Validators</a>
                                        <a href="/app/bridge" class="mega-quick-btn"><span class="icon">🔗</span> Bridge</a>
                                        <a href="/network/rpc" class="mega-quick-btn"><span class="icon">📡</span> RPC Endpoint</a>
                                        <a href="/app/governance" class="mega-quick-btn"><span class="icon">🗳️</span> Governance</a>
                                    </div>
                                </div>

                                <div class="mega-featured">
                                    <div class="mega-featured-text">
                                        <div class="mega-featured-icon">🚀</div>
                                        <div class="mega-featured-info">
                                            <h4>155,324 TPS Achieved!</h4>
                                            <p>World's fastest AI-powered blockchain is live</p>
                                        </div>
                                    </div>
                                    <a href="/scan/stats" class="mega-featured-btn">View Stats →</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Build Menu -->
                <div class="nav-item">
                    Build <span class="arrow">▾</span>
                    <div class="mega-menu-wrapper">
                        <div class="mega-menu">
                            <div class="mega-menu-header">
                                <div class="mega-menu-title">
                                    <span class="icon">🛠️</span>
                                    Build on TBurn
                                </div>
                                <div class="mega-menu-badge">Developer Portal</div>
                            </div>
                            <div class="mega-menu-body">
                                <div class="mega-menu-grid">
                                    <div class="mega-section">
                                        <div class="mega-section-header">
                                            <div class="mega-section-icon gold">📖</div>
                                            <div class="mega-section-title">Documentation</div>
                                        </div>
                                        <div class="mega-links">
                                            <a href="/developers/quickstart" class="mega-link">Quick Start <span class="badge core">Core</span> <span class="arrow-icon">→</span></a>
                                            <a href="/developers/docs" class="mega-link">Documentation <span class="arrow-icon">→</span></a>
                                            <a href="/developers/api" class="mega-link">API Reference <span class="arrow-icon">→</span></a>
                                            <a href="/developers/sdk" class="mega-link">SDK Guide <span class="arrow-icon">→</span></a>
                                            <a href="/developers/contracts" class="mega-link">Smart Contracts <span class="arrow-icon">→</span></a>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-header">
                                            <div class="mega-section-icon cyan">🛠️</div>
                                            <div class="mega-section-title">Developer Tools</div>
                                        </div>
                                        <div class="mega-links">
                                            <a href="/developers/cli" class="mega-link">CLI Reference <span class="arrow-icon">→</span></a>
                                            <a href="/developers/websocket" class="mega-link">WebSocket API <span class="arrow-icon">→</span></a>
                                            <a href="/developers/examples" class="mega-link">Code Examples <span class="arrow-icon">→</span></a>
                                            <a href="/developers/evm-migration" class="mega-link">EVM Migration <span class="arrow-icon">→</span></a>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-header">
                                            <div class="mega-section-icon purple">🧪</div>
                                            <div class="mega-section-title">Testnet</div>
                                        </div>
                                        <div class="mega-links">
                                            <a href="/testnet-scan/faucet" class="mega-link">Faucet <span class="badge new">New</span> <span class="arrow-icon">→</span></a>
                                            <a href="/testnet-scan" class="mega-link">Testnet Scan <span class="arrow-icon">→</span></a>
                                            <a href="/testnet-scan/blocks" class="mega-link">Testnet Blocks <span class="arrow-icon">→</span></a>
                                            <a href="/network/testnet-rpc" class="mega-link">Testnet RPC <span class="arrow-icon">→</span></a>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-header">
                                            <div class="mega-section-icon pink">💡</div>
                                            <div class="mega-section-title">Solutions</div>
                                        </div>
                                        <div class="mega-links">
                                            <a href="/solutions/token-extensions" class="mega-link">Token Extensions <span class="arrow-icon">→</span></a>
                                            <a href="/solutions/wallets" class="mega-link">Wallets <span class="arrow-icon">→</span></a>
                                            <a href="/solutions/game-tooling" class="mega-link">Game Tooling <span class="arrow-icon">→</span></a>
                                            <a href="/solutions/ai-features" class="mega-link">AI Features <span class="badge hot">Hot</span> <span class="arrow-icon">→</span></a>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mega-quick-access">
                                    <div class="mega-quick-label"><span class="icon">⚡</span> Quick Access</div>
                                    <div class="mega-quick-items">
                                        <a href="/testnet-scan/faucet" class="mega-quick-btn"><span class="icon">💧</span> Faucet</a>
                                        <a href="/network/testnet-rpc" class="mega-quick-btn"><span class="icon">📡</span> Testnet RPC</a>
                                        <a href="/developers/api" class="mega-quick-btn"><span class="icon">📄</span> API Docs</a>
                                        <a href="/token-generator" class="mega-quick-btn"><span class="icon">🪙</span> Token Generator</a>
                                    </div>
                                </div>

                                <div class="mega-featured">
                                    <div class="mega-featured-text">
                                        <div class="mega-featured-icon">🧠</div>
                                        <div class="mega-featured-info">
                                            <h4>AI Smart Contract Templates</h4>
                                            <p>Deploy intelligent contracts in minutes</p>
                                        </div>
                                    </div>
                                    <a href="/developers/contracts" class="mega-featured-btn">Get Started →</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Community Menu -->
                <div class="nav-item">
                    Community <span class="arrow">▾</span>
                    <div class="mega-menu-wrapper">
                        <div class="mega-menu" style="width: 720px;">
                            <div class="mega-menu-header">
                                <div class="mega-menu-title">
                                    <span class="icon">👥</span>
                                    Join Our Community
                                </div>
                                <div class="mega-menu-badge">50K+ Members</div>
                            </div>
                            <div class="mega-menu-body">
                                <div class="mega-menu-grid" style="grid-template-columns: repeat(3, 1fr);">
                                    <div class="mega-section">
                                        <div class="mega-section-header">
                                            <div class="mega-section-icon gold">💬</div>
                                            <div class="mega-section-title">Community Hub</div>
                                        </div>
                                        <div class="mega-links">
                                            <a href="/community/news" class="mega-link">News & Blog <span class="arrow-icon">→</span></a>
                                            <a href="/community/events" class="mega-link">Events <span class="arrow-icon">→</span></a>
                                            <a href="/community/hub" class="mega-link">Community Hub <span class="arrow-icon">→</span></a>
                                            <a href="/official-channels" class="mega-link">Official Channels <span class="arrow-icon">→</span></a>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-header">
                                            <div class="mega-section-icon cyan">🎁</div>
                                            <div class="mega-section-title">Token Programs</div>
                                        </div>
                                        <div class="mega-links">
                                            <a href="/airdrop" class="mega-link">Airdrop Program <span class="badge hot">Hot</span> <span class="arrow-icon">→</span></a>
                                            <a href="/referral" class="mega-link">Referral Program <span class="arrow-icon">→</span></a>
                                            <a href="/community-program" class="mega-link">Community Program <span class="arrow-icon">→</span></a>
                                            <a href="/events" class="mega-link">Event Center <span class="arrow-icon">→</span></a>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-header">
                                            <div class="mega-section-icon purple">🏛️</div>
                                            <div class="mega-section-title">Governance</div>
                                        </div>
                                        <div class="mega-links">
                                            <a href="/dao-governance" class="mega-link">DAO Governance <span class="badge new">New</span> <span class="arrow-icon">→</span></a>
                                            <a href="/validator-incentives" class="mega-link">Validator Incentives <span class="arrow-icon">→</span></a>
                                            <a href="/ecosystem-fund" class="mega-link">Ecosystem Fund <span class="arrow-icon">→</span></a>
                                            <a href="/bug-bounty" class="mega-link">Bug Bounty <span class="arrow-icon">→</span></a>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mega-featured">
                                    <div class="mega-featured-text">
                                        <div class="mega-featured-icon">🎯</div>
                                        <div class="mega-featured-info">
                                            <h4>Airdrop Program Now Live!</h4>
                                            <p>Join and earn TBURN tokens</p>
                                        </div>
                                    </div>
                                    <a href="/airdrop" class="mega-featured-btn">Apply Now →</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- More Menu -->
                <div class="nav-item">
                    More <span class="arrow">▾</span>
                    <div class="mega-menu-wrapper">
                        <div class="mega-menu" style="width: 720px;">
                            <div class="mega-menu-header">
                                <div class="mega-menu-title">
                                    <span class="icon">🔗</span>
                                    More Resources
                                </div>
                            </div>
                            <div class="mega-menu-body">
                                <div class="mega-menu-grid" style="grid-template-columns: repeat(3, 1fr);">
                                    <div class="mega-section">
                                        <div class="mega-section-header">
                                            <div class="mega-section-icon gold">🏢</div>
                                            <div class="mega-section-title">About</div>
                                        </div>
                                        <div class="mega-links">
                                            <a href="/vision" class="mega-link">Vision <span class="arrow-icon">→</span></a>
                                            <a href="/founders" class="mega-link">Team <span class="arrow-icon">→</span></a>
                                            <a href="/brand" class="mega-link">Brand <span class="arrow-icon">→</span></a>
                                            <a href="/qna" class="mega-link">Q&A <span class="arrow-icon">→</span></a>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-header">
                                            <div class="mega-section-icon cyan">🛡️</div>
                                            <div class="mega-section-title">Validators</div>
                                        </div>
                                        <div class="mega-links">
                                            <a href="/validator" class="mega-link">Command Center <span class="arrow-icon">→</span></a>
                                            <a href="/external-validator-program" class="mega-link">External Validator <span class="arrow-icon">→</span></a>
                                            <a href="/validator-governance" class="mega-link">Governance & Rewards <span class="arrow-icon">→</span></a>
                                            <a href="/security-audit" class="mega-link">Security Audit <span class="arrow-icon">→</span></a>
                                        </div>
                                    </div>
                                    <div class="mega-section">
                                        <div class="mega-section-header">
                                            <div class="mega-section-icon purple">📜</div>
                                            <div class="mega-section-title">Legal</div>
                                        </div>
                                        <div class="mega-links">
                                            <a href="/legal/terms-of-service" class="mega-link">Terms of Service <span class="arrow-icon">→</span></a>
                                            <a href="/legal/privacy-policy" class="mega-link">Privacy Policy <span class="arrow-icon">→</span></a>
                                            <a href="/legal/disclaimer" class="mega-link">Disclaimer <span class="arrow-icon">→</span></a>
                                            <a href="/nft-marketplace" class="mega-link">NFT Marketplace <span class="arrow-icon">→</span></a>
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
                <a href="/tree" class="header-icon-btn tree" title="Site Map">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>
                    </svg>
                </a>
                <button class="lang-selector">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
                    </svg>
                    <span class="lang-code">KO</span>
                    <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </button>
                <button class="header-icon-btn" title="Theme Toggle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
                    </svg>
                </button>
                <button class="login-btn">로그인</button>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
        <h1 class="hero-title">
            The Future of<br>AI-Powered Blockchain
        </h1>
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
                    <div class="footer-logo-icon">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
                            <defs>
                                <linearGradient id="footerFlame" x1="50%" y1="100%" x2="50%" y2="0%">
                                    <stop offset="0%" stop-color="#FF6B35" />
                                    <stop offset="50%" stop-color="#F7931E" />
                                    <stop offset="100%" stop-color="#FFD700" />
                                </linearGradient>
                            </defs>
                            <path d="M50 20 C35 35, 25 50, 30 65 C35 80, 45 85, 50 85 C55 85, 65 80, 70 65 C75 50, 65 35, 50 20" fill="url(#footerFlame)" />
                            <path d="M50 35 C42 45, 38 55, 42 65 C45 72, 48 75, 50 75 C52 75, 55 72, 58 65 C62 55, 58 45, 50 35" fill="#FFD700" opacity="0.8" />
                        </svg>
                    </div>
                    <div class="footer-logo-text">TBurn Chain</div>
                </div>
                <p class="footer-desc">
                    The world's fastest AI-powered blockchain. Building the future of decentralized finance with quantum-resistant security.
                </p>
                <div class="footer-social">
                    <div class="social-icon">𝕏</div>
                    <div class="social-icon">💬</div>
                    <div class="social-icon">💾</div>
                    <div class="social-icon">✉️</div>
                </div>
            </div>
            <div class="footer-column">
                <h4>🔍 Explore</h4>
                <div class="footer-links">
                    <div class="footer-link">TBurn Scan</div>
                    <div class="footer-link">Validators</div>
                    <div class="footer-link">Governance</div>
                    <div class="footer-link">Bridge</div>
                </div>
            </div>
            <div class="footer-column">
                <h4>🛠️ Build</h4>
                <div class="footer-links">
                    <div class="footer-link">Documentation</div>
                    <div class="footer-link">API Reference</div>
                    <div class="footer-link">GitHub</div>
                    <div class="footer-link">Faucet</div>
                </div>
            </div>
            <div class="footer-column">
                <h4>👥 Community</h4>
                <div class="footer-links">
                    <div class="footer-link">Discord</div>
                    <div class="footer-link">Telegram</div>
                    <div class="footer-link">Ambassador</div>
                    <div class="footer-link">Events</div>
                </div>
            </div>
            <div class="footer-column">
                <h4>🏢 Company</h4>
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
            <div class="footer-copyright">© 2026 TBurn Chain. All rights reserved.</div>
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
