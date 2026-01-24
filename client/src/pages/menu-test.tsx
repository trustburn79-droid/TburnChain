import { useEffect, useState } from 'react';
import { ChevronDown, Search, Bell, Globe, Menu, X } from 'lucide-react';
import { TBurnLogo } from "@/components/tburn-logo";

export default function MenuTest() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const menuStructure = [
    {
      key: "explore",
      title: "Explore",
      items: [
        { title: "TBurn Scan", href: "/scan", badge: "Core" },
        { title: "Transactions", href: "/transactions" },
        { title: "Blocks", href: "/blocks" },
        { title: "Validators", href: "/validators", badge: "Core" },
        { title: "Staking", href: "/staking" },
        { title: "Governance", href: "/governance" },
        { title: "Bridge", href: "/bridge", badge: "Core" },
      ],
    },
    {
      key: "build",
      title: "Build",
      items: [
        { title: "Documentation", href: "/docs" },
        { title: "API Reference", href: "/api" },
        { title: "SDK Guide", href: "/sdk" },
        { title: "RPC Endpoints", href: "/rpc", badge: "Core" },
        { title: "Faucet", href: "/faucet", badge: "New" },
        { title: "GitHub", href: "/github" },
      ],
    },
    {
      key: "community",
      title: "Community",
      highlight: true,
      items: [
        { title: "Discord", href: "/discord" },
        { title: "Telegram", href: "/telegram" },
        { title: "Twitter", href: "/twitter" },
        { title: "Ambassador", href: "/ambassador", badge: "New" },
        { title: "Events", href: "/events" },
      ],
    },
    {
      key: "more",
      title: "More",
      items: [
        { title: "About Us", href: "/about" },
        { title: "Careers", href: "/careers", badge: "Hiring" },
        { title: "Press Kit", href: "/press" },
        { title: "Terms of Service", href: "/terms" },
        { title: "Privacy Policy", href: "/privacy" },
      ],
    },
  ];

  return (
    <div className="menu-test-wrapper">
      <style>{menuTestStyles}</style>
      
      {/* Navigation */}
      <nav className="menu-nav">
        <div className="menu-nav-content">
          {/* Logo */}
          <a href="/" className="menu-logo">
            <div className="menu-logo-icon">
              <TBurnLogo className="w-10 h-10" />
            </div>
            <span className="menu-logo-text">
              TBurn <span className="menu-logo-chain">Chain</span>
            </span>
          </a>

          {/* Navigation Items */}
          <div className="menu-nav-items">
            {menuStructure.map((menu) => (
              <div
                key={menu.key}
                className="menu-nav-item-wrapper"
                onMouseEnter={() => setActiveMenu(menu.key)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  className={`menu-nav-button ${menu.highlight ? 'highlight' : ''} ${activeMenu === menu.key ? 'active' : ''}`}
                  data-testid={`menu-${menu.key}`}
                >
                  {menu.title}
                  <ChevronDown className={`menu-chevron ${activeMenu === menu.key ? 'rotated' : ''}`} />
                </button>

                {activeMenu === menu.key && (
                  <div className="menu-dropdown-wrapper">
                    <div className="menu-dropdown">
                      {menu.items.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          className="menu-dropdown-item"
                          data-testid={`link-${item.href.replace(/\//g, '-').slice(1)}`}
                        >
                          <span className="menu-dropdown-title">{item.title}</span>
                          {item.badge && (
                            <span className={`menu-badge ${item.badge.toLowerCase()}`}>
                              {item.badge}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side */}
          <div className="menu-nav-right">
            <button className="menu-icon-btn" data-testid="button-search">
              <Search className="w-5 h-5" />
            </button>
            <button className="menu-icon-btn" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
            </button>
            <button className="menu-lang-btn" data-testid="button-language">
              <Globe className="w-5 h-5" />
              <span>EN</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <button className="menu-connect-btn" data-testid="button-connect-wallet">
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="menu-hero">
        <h1 className="menu-hero-title">
          The Future of<br />
          <span className="menu-hero-gradient">AI-Powered Blockchain</span>
        </h1>
        <p className="menu-hero-subtitle">
          Experience the world's fastest blockchain with 155,324 TPS, 
          powered by advanced AI consensus and quantum-resistant security.
        </p>
        <div className="menu-hero-buttons">
          <button className="menu-btn-primary">Launch App</button>
          <button className="menu-btn-secondary">Read Docs</button>
        </div>
        <div className="menu-hero-stats">
          <div className="menu-stat-card">
            <div className="menu-stat-value">155,324</div>
            <div className="menu-stat-label">TPS</div>
          </div>
          <div className="menu-stat-card">
            <div className="menu-stat-value">99.99%</div>
            <div className="menu-stat-label">Uptime</div>
          </div>
          <div className="menu-stat-card">
            <div className="menu-stat-value">24</div>
            <div className="menu-stat-label">Shards</div>
          </div>
          <div className="menu-stat-card">
            <div className="menu-stat-value">125</div>
            <div className="menu-stat-label">Validators</div>
          </div>
        </div>
      </section>
    </div>
  );
}

const menuTestStyles = `
.menu-test-wrapper {
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #030407;
  color: #f5f5f5;
  min-height: 100vh;
}

/* Navigation */
.menu-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(3, 4, 7, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.menu-nav-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.menu-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  cursor: pointer;
}

.menu-logo:hover .menu-logo-icon {
  transform: scale(1.1);
}

.menu-logo-icon {
  transition: transform 0.3s ease;
}

.menu-logo-text {
  font-weight: 700;
  font-size: 1.25rem;
  color: white;
  letter-spacing: -0.02em;
}

.menu-logo-chain {
  color: #00f0ff;
  font-weight: 300;
}

/* Navigation Items */
.menu-nav-items {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-nav-item-wrapper {
  position: relative;
}

.menu-nav-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #a1a1aa;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
  border-radius: 0.5rem;
}

.menu-nav-button:hover,
.menu-nav-button.active {
  color: white;
}

.menu-nav-button.highlight {
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #7c3aed, #06b6d4);
  color: white;
}

.menu-nav-button.highlight:hover {
  opacity: 0.9;
}

.menu-chevron {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;
}

.menu-chevron.rotated {
  transform: rotate(180deg);
}

/* Dropdown */
.menu-dropdown-wrapper {
  position: absolute;
  left: 0;
  top: 100%;
  padding-top: 0.5rem;
  z-index: 50;
}

.menu-dropdown {
  width: 16rem;
  padding: 0.5rem;
  background: rgba(10, 10, 15, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  box-shadow: 
    0 4px 30px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.menu-dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  text-decoration: none;
  transition: all 0.15s ease;
}

.menu-dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.menu-dropdown-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
}

.menu-badge {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.menu-badge.core {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
}

.menu-badge.new {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
}

.menu-badge.hiring {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

/* Right Side */
.menu-nav-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: transparent;
  border: none;
  color: #a1a1aa;
  cursor: pointer;
  transition: color 0.2s ease;
  border-radius: 0.5rem;
}

.menu-icon-btn:hover {
  color: white;
}

.menu-lang-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  color: #a1a1aa;
  cursor: pointer;
  transition: color 0.2s ease;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.menu-lang-btn:hover {
  color: white;
}

.menu-connect-btn {
  padding: 0.5rem 1.5rem;
  background: transparent;
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 0.5rem;
  color: #06b6d4;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
}

.menu-connect-btn:hover {
  background: rgba(6, 182, 212, 0.1);
}

/* Hero Section */
.menu-hero {
  padding: 6rem 2rem;
  text-align: center;
  max-width: 1280px;
  margin: 0 auto;
}

.menu-hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
}

.menu-hero-gradient {
  background: linear-gradient(135deg, #00f0ff 0%, #7000ff 50%, #00f0ff 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.menu-hero-subtitle {
  font-size: 1.125rem;
  color: #a1a1aa;
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.6;
}

.menu-hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 4rem;
}

.menu-btn-primary {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.3);
}

.menu-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(249, 115, 22, 0.4);
}

.menu-btn-secondary {
  padding: 0.75rem 2rem;
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Stats */
.menu-hero-stats {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.menu-stat-card {
  background: rgba(10, 10, 15, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.75rem;
  padding: 1.5rem 2rem;
  min-width: 140px;
  text-align: center;
  transition: all 0.3s ease;
}

.menu-stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(6, 182, 212, 0.3);
}

.menu-stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #06b6d4;
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
}

.menu-stat-card:hover .menu-stat-value {
  text-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
}

.menu-stat-label {
  font-size: 0.875rem;
  color: #71717a;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 1024px) {
  .menu-nav-items {
    display: none;
  }
  
  .menu-hero-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 640px) {
  .menu-hero-stats {
    flex-direction: column;
    align-items: center;
  }
  
  .menu-stat-card {
    width: 100%;
    max-width: 280px;
  }
  
  .menu-hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .menu-btn-primary,
  .menu-btn-secondary {
    width: 100%;
    max-width: 280px;
  }
}
`;
