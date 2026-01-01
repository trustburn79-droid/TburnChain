import { useState } from "react";
import { Flame, Palette, Type, Image, Shapes, Download, Check, Copy, FileText, Printer, Monitor, Share2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TBurnLogo } from "@/components/tburn-logo";

const brandStyles = `
  .brand-page {
    --gold: #D4AF37;
    --gold-light: #F5D76E;
    --gold-dark: #B8960C;
    --navy: #1A365D;
    --navy-light: #2D4A7C;
    --navy-dark: #0F2744;
    --dark: #0F172A;
    --dark-card: #1E293B;
    --dark-lighter: #334155;
    --gray: #64748B;
    --light-gray: #94A3B8;
    --white: #FFFFFF;
    --off-white: #F8FAFC;
    --success: #22C55E;
    --warning: #F59E0B;
    --danger: #EF4444;
    --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
    --gradient-navy: linear-gradient(135deg, #1A365D 0%, #2D4A7C 100%);
    --gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
    --gradient-fire: linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD700 100%);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--dark);
    color: var(--white);
    line-height: 1.6;
  }

  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
  @keyframes flame { 0%, 100% { transform: scale(1) rotate(-2deg); } 50% { transform: scale(1.05) rotate(2deg); } }
  @keyframes copySuccess { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }

  .brand-hero {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 100px 2rem 80px;
    background: radial-gradient(ellipse at center top, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse at bottom right, rgba(26, 54, 93, 0.2) 0%, transparent 50%),
                var(--gradient-dark);
  }

  .brand-hero-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .brand-hero-bg::before {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
    top: -200px;
    right: -100px;
    animation: float 8s ease-in-out infinite;
  }

  .brand-hero-content {
    max-width: 900px;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .brand-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(212, 175, 55, 0.15);
    border: 1px solid rgba(212, 175, 55, 0.4);
    padding: 8px 20px;
    border-radius: 100px;
    font-size: 0.875rem;
    color: var(--gold);
    margin-bottom: 2rem;
  }

  .brand-hero h1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 900;
    margin-bottom: 1.5rem;
    line-height: 1.1;
  }

  .gradient-text {
    background: var(--gradient-gold);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .brand-hero-subtitle {
    font-size: 1.125rem;
    color: var(--light-gray);
    max-width: 600px;
    margin: 0 auto 2rem;
  }

  .asset-categories {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .category-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--dark-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    color: var(--light-gray);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s;
  }

  .category-pill:hover, .category-pill.active {
    border-color: var(--gold);
    color: var(--gold);
    background: rgba(212, 175, 55, 0.1);
  }

  .brand-section { padding: 80px 2rem; max-width: 1400px; margin: 0 auto; }

  .brand-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .brand-section-title-group h2 {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-section-title-group h2 svg { color: var(--gold); }
  .brand-section-title-group p { color: var(--light-gray); }

  .download-section-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(212, 175, 55, 0.1);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 10px;
    color: var(--gold);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }

  .download-section-btn:hover {
    background: var(--gold);
    color: var(--dark);
  }

  .logo-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .logo-card {
    background: var(--dark-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s;
  }

  .logo-card:hover {
    border-color: var(--gold);
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .logo-preview {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .logo-preview.dark-bg { background: var(--dark); }
  .logo-preview.light-bg { background: var(--off-white); }
  .logo-preview.navy-bg { background: var(--navy); }
  .logo-preview.gold-bg { background: var(--gold); }
  .logo-preview.gradient-bg { background: var(--gradient-gold); }
  .logo-preview.transparent-bg {
    background: repeating-conic-gradient(#333 0% 25%, #444 0% 50%) 50% / 20px 20px;
  }

  .logo-display {
    max-width: 180px;
    max-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-display.main-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 2rem;
    font-weight: 900;
  }

  .logo-display.main-logo .icon {
    width: 60px;
    height: 60px;
    background: var(--gradient-gold);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
  }

  .logo-display.main-logo .text { color: var(--white); }
  .logo-display.main-logo .text span { color: var(--gold); }
  .logo-display.main-logo.dark .text { color: var(--dark); }
  .logo-display.main-logo.dark .text span { color: var(--navy); }

  .logo-display.symbol-only {
    width: 80px;
    height: 80px;
    background: var(--gradient-gold);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 42px;
    animation: flame 3s ease-in-out infinite;
  }

  .logo-display.symbol-only.outline {
    background: transparent;
    border: 3px solid var(--gold);
  }

  .logo-display.wordmark {
    font-size: 2.5rem;
    font-weight: 900;
    letter-spacing: -1px;
  }

  .logo-display.wordmark.gold { color: var(--gold); }
  .logo-display.wordmark.white { color: var(--white); }
  .logo-display.wordmark.dark { color: var(--dark); }
  .logo-display.wordmark span { color: var(--gold); }

  .logo-info {
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .logo-info h4 { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
  .logo-info p { font-size: 0.8rem; color: var(--gray); margin-bottom: 1rem; }

  .logo-formats {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .format-tag {
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    font-size: 0.7rem;
    color: var(--light-gray);
    text-transform: uppercase;
  }

  .logo-download-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px;
    background: rgba(212, 175, 55, 0.1);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 10px;
    color: var(--gold);
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s;
  }

  .logo-download-btn:hover {
    background: var(--gold);
    color: var(--dark);
  }

  .color-section { margin-bottom: 3rem; }

  .color-section-title {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .color-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }

  .color-card {
    background: var(--dark-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s;
  }

  .color-card:hover {
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-3px);
  }

  .color-swatch {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--white);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .color-info { padding: 1.25rem; }
  .color-info h4 { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem; }

  .color-codes {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .color-code {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.3s;
  }

  .color-code:hover { background: rgba(255, 255, 255, 0.08); }
  .color-code .label { color: var(--gray); }
  .color-code .value { font-family: monospace; color: var(--white); }
  .color-code .copy-icon { color: var(--gray); font-size: 0.75rem; opacity: 0; transition: opacity 0.3s; }
  .color-code:hover .copy-icon { opacity: 1; }
  .color-code.copied .copy-icon { color: var(--success); animation: copySuccess 0.3s ease; }

  .typography-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  .typography-card {
    background: var(--dark-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 2rem;
  }

  .typography-card h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--gold);
    margin-bottom: 0.5rem;
  }

  .typography-card .font-name {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }

  .typography-card .font-preview {
    font-size: 1.25rem;
    color: var(--light-gray);
    margin-bottom: 1.5rem;
    line-height: 1.8;
  }

  .font-weights {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .font-weight-tag {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    font-size: 0.85rem;
  }

  .font-weight-tag span { color: var(--gray); margin-left: 4px; }

  .banner-grid { display: grid; gap: 2rem; }

  .banner-card {
    background: var(--dark-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s;
  }

  .banner-card:hover {
    border-color: var(--gold);
    transform: translateY(-5px);
  }

  .banner-preview { position: relative; overflow: hidden; }

  .banner-display {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .banner-display.hero-banner {
    height: 300px;
    background: linear-gradient(135deg, var(--navy) 0%, var(--navy-dark) 100%);
  }

  .banner-display.social-banner {
    height: 200px;
    background: linear-gradient(135deg, var(--dark) 0%, var(--navy) 100%);
  }

  .banner-display.email-banner {
    height: 150px;
    background: var(--gradient-gold);
  }

  .banner-display.ad-banner {
    height: 250px;
    background: linear-gradient(135deg, var(--navy-dark) 0%, var(--dark) 100%);
  }

  .banner-content {
    text-align: center;
    z-index: 1;
    padding: 2rem;
  }

  .banner-content .logo-group {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 1rem;
  }

  .banner-content .logo-icon-small {
    width: 50px;
    height: 50px;
    background: var(--gradient-gold);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
  }

  .banner-content .logo-text-small {
    font-size: 1.75rem;
    font-weight: 900;
  }

  .banner-content .logo-text-small span { color: var(--gold); }

  .banner-content h3 {
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .banner-content p { color: var(--light-gray); font-size: 0.95rem; }

  .banner-content.dark-text h3,
  .banner-content.dark-text p,
  .banner-content.dark-text .logo-text-small { color: var(--dark); }

  .banner-decoration {
    position: absolute;
    pointer-events: none;
  }

  .banner-decoration.circles {
    width: 300px;
    height: 300px;
    border: 2px solid rgba(212, 175, 55, 0.2);
    border-radius: 50%;
    right: -100px;
    top: -100px;
  }

  .banner-decoration.lines {
    width: 200px;
    height: 200px;
    background: linear-gradient(45deg, transparent 45%, rgba(212, 175, 55, 0.1) 45%, rgba(212, 175, 55, 0.1) 55%, transparent 55%);
    left: -50px;
    bottom: -50px;
  }

  .banner-info {
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .banner-meta h4 { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }

  .banner-size {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.85rem;
    color: var(--gray);
  }

  .banner-size .dimension {
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    font-family: monospace;
  }

  .banner-download-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(212, 175, 55, 0.1);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 10px;
    color: var(--gold);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }

  .banner-download-btn:hover {
    background: var(--gold);
    color: var(--dark);
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 1rem;
  }

  .icon-card {
    background: var(--dark-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s;
    cursor: pointer;
  }

  .icon-card:hover {
    border-color: var(--gold);
    transform: translateY(-3px);
    background: rgba(212, 175, 55, 0.1);
  }

  .icon-card .icon-display { font-size: 2rem; margin-bottom: 0.75rem; }
  .icon-card .icon-name { font-size: 0.75rem; color: var(--gray); }

  .guidelines-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  .guideline-card {
    background: var(--dark-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    overflow: hidden;
  }

  .guideline-card.do { border-color: rgba(34, 197, 94, 0.3); }
  .guideline-card.dont { border-color: rgba(239, 68, 68, 0.3); }

  .guideline-header {
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
  }

  .guideline-card.do .guideline-header {
    background: rgba(34, 197, 94, 0.1);
    color: var(--success);
  }

  .guideline-card.dont .guideline-header {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger);
  }

  .guideline-content { padding: 1.5rem; }

  .guideline-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .guideline-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
  }

  .guideline-item .icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  .guideline-card.do .guideline-item .icon {
    background: rgba(34, 197, 94, 0.2);
    color: var(--success);
  }

  .guideline-card.dont .guideline-item .icon {
    background: rgba(239, 68, 68, 0.2);
    color: var(--danger);
  }

  .clearspace-container {
    background: var(--dark-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 2rem;
    margin-top: 3rem;
    text-align: center;
  }

  .clearspace-visual {
    display: flex;
    justify-content: center;
    margin: 2rem 0;
  }

  .clearspace-logo {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 3rem 4rem;
    border: 2px dashed rgba(212, 175, 55, 0.4);
    border-radius: 16px;
    font-weight: 900;
    font-size: 2rem;
  }

  .clearspace-logo .icon {
    width: 60px;
    height: 60px;
    background: var(--gradient-gold);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
  }

  .clearspace-logo .text span { color: var(--gold); }

  .clearspace-marker {
    position: absolute;
    background: rgba(212, 175, 55, 0.2);
    color: var(--gold);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .clearspace-marker.top { top: -1rem; left: 50%; transform: translateX(-50%); }
  .clearspace-marker.bottom { bottom: -1rem; left: 50%; transform: translateX(-50%); }
  .clearspace-marker.left { left: -1rem; top: 50%; transform: translateY(-50%); }
  .clearspace-marker.right { right: -1rem; top: 50%; transform: translateY(-50%); }

  .clearspace-note {
    color: var(--light-gray);
    font-size: 0.9rem;
  }

  .download-center {
    background: var(--dark-card);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 24px;
    padding: 3rem;
    text-align: center;
  }

  .download-center h3 {
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .download-center > p {
    color: var(--light-gray);
    margin-bottom: 2rem;
  }

  .download-options {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .download-option {
    width: 200px;
    padding: 2rem 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
  }

  .download-option:hover {
    border-color: var(--gold);
    background: rgba(212, 175, 55, 0.1);
    transform: translateY(-5px);
  }

  .download-option .icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--gold);
  }

  .download-option h4 {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .download-option p {
    font-size: 0.8rem;
    color: var(--gray);
  }

  .brand-footer {
    background: rgba(255, 255, 255, 0.02);
    padding: 3rem 2rem;
    text-align: center;
    color: var(--gray);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .brand-footer a {
    color: var(--gold);
    text-decoration: none;
  }

  .brand-footer a:hover { text-decoration: underline; }

  @media (max-width: 1200px) {
    .logo-grid { grid-template-columns: repeat(2, 1fr); }
    .color-grid { grid-template-columns: repeat(2, 1fr); }
    .icon-grid { grid-template-columns: repeat(6, 1fr); }
  }

  @media (max-width: 1024px) {
    .typography-grid { grid-template-columns: 1fr; }
    .guidelines-grid { grid-template-columns: 1fr; }
    .download-options { flex-direction: column; align-items: center; }
  }

  @media (max-width: 768px) {
    .brand-hero { padding: 80px 1rem 60px; }
    .brand-section { padding: 60px 1rem; }
    .logo-grid { grid-template-columns: 1fr; }
    .color-grid { grid-template-columns: 1fr; }
    .icon-grid { grid-template-columns: repeat(4, 1fr); }
    .brand-section-header { flex-direction: column; gap: 1rem; text-align: center; }
    .banner-info { flex-direction: column; gap: 1rem; }
  }
`;

const logoAssets = [
  { id: "main-logo-dark", title: "메인 로고 (다크)", desc: "어두운 배경에서 사용하는 기본 로고", bg: "dark-bg", type: "main", dark: false, formats: ["SVG", "PNG", "PDF"] },
  { id: "main-logo-light", title: "메인 로고 (라이트)", desc: "밝은 배경에서 사용하는 기본 로고", bg: "light-bg", type: "main", dark: true, formats: ["SVG", "PNG", "PDF"] },
  { id: "main-logo-navy", title: "메인 로고 (네이비)", desc: "네이비 배경에서 사용하는 로고", bg: "navy-bg", type: "main", dark: false, formats: ["SVG", "PNG", "PDF"] },
  { id: "symbol", title: "심볼 (Symbol)", desc: "아이콘 또는 파비콘으로 사용", bg: "dark-bg", type: "symbol", formats: ["SVG", "PNG", "ICO"] },
  { id: "symbol-outline", title: "심볼 아웃라인", desc: "아웃라인 버전의 심볼", bg: "dark-bg", type: "symbol-outline", formats: ["SVG", "PNG"] },
  { id: "symbol-transparent", title: "심볼 (투명 배경)", desc: "투명 배경용 PNG 심볼", bg: "transparent-bg", type: "symbol", formats: ["PNG", "WEBP"] },
  { id: "wordmark-gold", title: "워드마크 (골드)", desc: "심볼 없이 텍스트만 사용", bg: "dark-bg", type: "wordmark-gold", formats: ["SVG", "PNG"] },
  { id: "wordmark-white", title: "워드마크 (화이트)", desc: "어두운 배경용 화이트 워드마크", bg: "navy-bg", type: "wordmark-white", formats: ["SVG", "PNG"] },
  { id: "wordmark-dark", title: "워드마크 (다크)", desc: "밝은 배경용 다크 워드마크", bg: "gold-bg", type: "wordmark-dark", formats: ["SVG", "PNG"] },
];

const primaryColors = [
  { name: "TBURN Gold", hex: "#D4AF37", rgb: "212, 175, 55", hsl: "46, 63%, 52%", label: "Gold Primary" },
  { name: "TBURN Navy", hex: "#1A365D", rgb: "26, 54, 93", hsl: "215, 56%, 23%", label: "Navy Primary" },
  { name: "TBURN Dark", hex: "#0F172A", rgb: "15, 23, 42", hsl: "222, 47%, 11%", label: "Dark Primary" },
  { name: "TBURN White", hex: "#FFFFFF", rgb: "255, 255, 255", hsl: "0, 0%, 100%", label: "White", textDark: true },
];

const secondaryColors = [
  { name: "Gold Light", hex: "#F5D76E", label: "Gold Light" },
  { name: "Gold Dark", hex: "#B8960C", label: "Gold Dark" },
  { name: "Navy Light", hex: "#2D4A7C", label: "Navy Light" },
  { name: "Card Background", hex: "#1E293B", label: "Card Dark" },
];

const accentColors = [
  { name: "Success", hex: "#22C55E", label: "Success Green" },
  { name: "Info", hex: "#3B82F6", label: "Info Blue" },
  { name: "Warning", hex: "#F59E0B", label: "Warning Orange" },
  { name: "Error", hex: "#EF4444", label: "Error Red" },
];

const gradients = [
  { name: "Gold Gradient", css: "linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%)" },
  { name: "Navy Gradient", css: "linear-gradient(135deg, #1A365D 0%, #2D4A7C 100%)" },
  { name: "Fire Gradient", css: "linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD700 100%)" },
  { name: "Dark Gradient", css: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)" },
];

const banners = [
  { id: "hero", title: "히어로 배너", type: "hero-banner", dimension: "1920 × 600", desc: "웹사이트 메인" },
  { id: "social", title: "소셜 미디어 배너", type: "social-banner", dimension: "1200 × 630", desc: "Facebook/Twitter" },
  { id: "email", title: "이메일 헤더", type: "email-banner", dimension: "600 × 200", desc: "뉴스레터" },
  { id: "ad", title: "광고 배너", type: "ad-banner", dimension: "728 × 90", desc: "디스플레이 광고" },
];

const iconSet = [
  { icon: "🔥", name: "Fire" }, { icon: "⚡", name: "Lightning" }, { icon: "🛡️", name: "Shield" },
  { icon: "💎", name: "Diamond" }, { icon: "🪙", name: "Coin" }, { icon: "📊", name: "Chart" },
  { icon: "🔐", name: "Lock" }, { icon: "🌐", name: "Globe" }, { icon: "💰", name: "Wallet" },
  { icon: "🏦", name: "Bank" }, { icon: "📈", name: "Growth" }, { icon: "🔗", name: "Chain" },
  { icon: "⚙️", name: "Settings" }, { icon: "🎯", name: "Target" }, { icon: "🚀", name: "Rocket" },
  { icon: "💫", name: "Spark" },
];

export default function Brand() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("logos");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollToSection = (sectionId: string) => {
    setActiveCategory(sectionId);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const copyColor = async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      toast({ title: "클립보드에 복사되었습니다!", description: value });
      setTimeout(() => setCopiedId(null), 1000);
    } catch {
      toast({ title: "복사 실패", variant: "destructive" });
    }
  };

  const downloadAsset = (assetName: string) => {
    toast({ title: `${assetName} 다운로드를 시작합니다...`, description: "파일이 곧 다운로드됩니다." });
  };

  const downloadSection = (section: string) => {
    toast({ title: `${section} 섹션 에셋을 다운로드합니다...` });
  };

  const downloadPackage = (type: string) => {
    const packageNames: Record<string, string> = {
      full: "전체 브랜드 패키지",
      print: "인쇄용 패키지",
      digital: "디지털용 패키지",
      social: "소셜 미디어 패키지",
    };
    toast({ title: `${packageNames[type]}를 다운로드합니다...` });
  };

  const renderLogoDisplay = (type: string, dark: boolean = false) => {
    if (type === "main") {
      return (
        <div className="flex items-center gap-3">
          <TBurnLogo className="w-16 h-16" />
          <span className={`text-2xl font-black ${dark ? "text-gray-900" : "text-white"}`}>
            TBURN<span className="text-[#D4AF37]">CHAIN</span>
          </span>
        </div>
      );
    }
    if (type === "symbol") {
      return <TBurnLogo className="w-20 h-20" showText={false} />;
    }
    if (type === "symbol-outline") {
      return (
        <div className="w-20 h-20 rounded-2xl border-2 border-[#D4AF37] flex items-center justify-center">
          <TBurnLogo className="w-14 h-14" symbolColor="#D4AF37" showText={false} />
        </div>
      );
    }
    if (type === "wordmark-gold") {
      return <span className="text-3xl font-black text-[#D4AF37]">TBURNCHAIN</span>;
    }
    if (type === "wordmark-white") {
      return <span className="text-3xl font-black text-white">TBURN<span className="text-[#D4AF37]">CHAIN</span></span>;
    }
    if (type === "wordmark-dark") {
      return <span className="text-3xl font-black text-gray-900">TBURNCHAIN</span>;
    }
    return null;
  };

  return (
    <div className="brand-page" data-testid="page-brand">
      <style>{brandStyles}</style>
      
      <section className="brand-hero">
        <div className="brand-hero-bg" />
        <div className="brand-hero-content">
          <div className="brand-badge">
            <Palette className="w-4 h-4" />
            OFFICIAL BRAND ASSETS
          </div>
          <h1>
            TBURN Chain<br />
            <span className="gradient-text">Brand Assets</span>
          </h1>
          <p className="brand-hero-subtitle">
            TBURN Chain의 공식 브랜드 에셋입니다.<br />
            로고, 컬러, 타이포그래피, 배너를 다운로드하고 올바르게 사용하세요.
          </p>
          <div className="asset-categories">
            {[
              { id: "logos", icon: Shapes, label: "로고" },
              { id: "colors", icon: Palette, label: "컬러" },
              { id: "typography", icon: Type, label: "타이포그래피" },
              { id: "banners", icon: Image, label: "배너" },
              { id: "icons", icon: Flame, label: "아이콘" },
            ].map((cat) => (
              <div
                key={cat.id}
                className={`category-pill ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => scrollToSection(cat.id)}
                data-testid={`category-${cat.id}`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-section" id="logos">
        <div className="brand-section-header">
          <div className="brand-section-title-group">
            <h2><Shapes className="w-6 h-6" /> 로고 / Logo</h2>
            <p>TBURN Chain의 공식 로고와 다양한 버전</p>
          </div>
          <button className="download-section-btn" onClick={() => downloadSection("logos")} data-testid="button-download-logos">
            <Download className="w-4 h-4" /> 로고 전체 다운로드
          </button>
        </div>

        <div className="logo-grid">
          {logoAssets.map((asset) => (
            <div key={asset.id} className="logo-card" data-testid={`logo-card-${asset.id}`}>
              <div className={`logo-preview ${asset.bg}`}>
                {renderLogoDisplay(asset.type, asset.dark)}
              </div>
              <div className="logo-info">
                <h4>{asset.title}</h4>
                <p>{asset.desc}</p>
                <div className="logo-formats">
                  {asset.formats.map((f) => (
                    <span key={f} className="format-tag">{f}</span>
                  ))}
                </div>
                <button className="logo-download-btn" onClick={() => downloadAsset(asset.id)} data-testid={`button-download-${asset.id}`}>
                  <Download className="w-4 h-4" /> 다운로드
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "3rem", padding: "2rem", background: "var(--dark-card)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <Flame className="w-5 h-5 text-orange-500" /> TBurn Logo Symbol
          </h3>
          <p style={{ color: "var(--gray)", marginBottom: "1.5rem" }}>다양한 배경과 심볼 색상 조합 미리보기</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1rem" }} className="logo-variants-grid">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center" }} data-testid="logo-var-dark">
                <TBurnLogo className="w-11 h-11" />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Dark</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#ffffff", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }} data-testid="logo-var-light">
                <TBurnLogo className="w-11 h-11" />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Light</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }} data-testid="logo-var-black">
                <TBurnLogo className="w-11 h-11" symbolColor="#FF6B35" />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Black</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center" }} data-testid="logo-var-navy">
                <TBurnLogo className="w-11 h-11" symbolColor="#FFD700" />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Navy</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }} data-testid="logo-var-orange">
                <TBurnLogo className="w-11 h-11" symbolColor="#FFFFFF" />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Orange</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#facc15", display: "flex", alignItems: "center", justifyContent: "center" }} data-testid="logo-var-yellow">
                <TBurnLogo className="w-11 h-11" symbolColor="#000000" />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Yellow</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#581c87", display: "flex", alignItems: "center", justifyContent: "center" }} data-testid="logo-var-purple">
                <TBurnLogo className="w-11 h-11" />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Purple</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#374151", display: "flex", alignItems: "center", justifyContent: "center" }} data-testid="logo-var-red">
                <TBurnLogo className="w-11 h-11" symbolColor="#EF4444" />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Red</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }} data-testid="logo-var-cyan">
                <TBurnLogo className="w-11 h-11" symbolColor="#06B6D4" />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Cyan</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#18181b", display: "flex", alignItems: "center", justifyContent: "center" }} data-testid="logo-var-green">
                <TBurnLogo className="w-11 h-11" symbolColor="#22C55E" />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Green</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }} data-testid="logo-var-red-bg">
                <TBurnLogo className="w-11 h-11" symbolColor="#FFFFFF" />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Red BG</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "linear-gradient(135deg, #f97316 0%, #facc15 100%)", display: "flex", alignItems: "center", justifyContent: "center" }} data-testid="logo-var-brand">
                <TBurnLogo className="w-11 h-11" symbolColor="#FFFFFF" />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Brand</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#06b6d4", display: "flex", alignItems: "center", justifyContent: "center" }} data-testid="logo-var-cyan-bg">
                <TBurnLogo className="w-11 h-11" symbolColor="#FF6B35" textColor="#FFFFFF" />
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Cyan BG</span>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 500, marginBottom: "1rem" }}>White T Variants</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TBurnLogo className="w-11 h-11" symbolColor="#FF6B35" textColor="#FFFFFF" fontSize={17} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Orange</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TBurnLogo className="w-11 h-11" symbolColor="#FFD700" textColor="#FFFFFF" fontSize={17} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Gold</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#172554", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TBurnLogo className="w-11 h-11" symbolColor="#06B6D4" textColor="#FFFFFF" fontSize={17} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Cyan</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#581c87", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TBurnLogo className="w-11 h-11" symbolColor="#EC4899" textColor="#FFFFFF" fontSize={17} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Pink</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#064e3b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TBurnLogo className="w-11 h-11" symbolColor="#84CC16" textColor="#FFFFFF" fontSize={17} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Lime</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TBurnLogo className="w-11 h-11" symbolColor="#3B82F6" textColor="#FFFFFF" fontSize={17} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Blue</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "#27272a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TBurnLogo className="w-11 h-11" symbolColor="#F59E0B" textColor="#FFFFFF" fontSize={17} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--gray)" }}>Amber</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-section" id="colors" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="brand-section-header">
          <div className="brand-section-title-group">
            <h2><Palette className="w-6 h-6" /> 컬러 팔레트 / Color Palette</h2>
            <p>TBURN Chain의 공식 브랜드 컬러</p>
          </div>
          <button className="download-section-btn" onClick={() => downloadSection("colors")} data-testid="button-download-colors">
            <Download className="w-4 h-4" /> ASE 파일 다운로드
          </button>
        </div>

        <div className="color-section">
          <div className="color-section-title">Primary Colors</div>
          <div className="color-grid">
            {primaryColors.map((color) => (
              <div key={color.hex} className="color-card" data-testid={`color-card-${color.hex}`}>
                <div className="color-swatch" style={{ background: color.hex, color: color.textDark ? "#333" : "#fff" }}>
                  {color.label}
                </div>
                <div className="color-info">
                  <h4>{color.name}</h4>
                  <div className="color-codes">
                    <div className={`color-code ${copiedId === `${color.hex}-hex` ? "copied" : ""}`} onClick={() => copyColor(color.hex, `${color.hex}-hex`)}>
                      <span className="label">HEX</span>
                      <span className="value">{color.hex}</span>
                      {copiedId === `${color.hex}-hex` ? <Check className="w-3 h-3 copy-icon" style={{ opacity: 1 }} /> : <Copy className="w-3 h-3 copy-icon" />}
                    </div>
                    <div className={`color-code ${copiedId === `${color.hex}-rgb` ? "copied" : ""}`} onClick={() => copyColor(`rgb(${color.rgb})`, `${color.hex}-rgb`)}>
                      <span className="label">RGB</span>
                      <span className="value">{color.rgb}</span>
                      {copiedId === `${color.hex}-rgb` ? <Check className="w-3 h-3 copy-icon" style={{ opacity: 1 }} /> : <Copy className="w-3 h-3 copy-icon" />}
                    </div>
                    <div className={`color-code ${copiedId === `${color.hex}-hsl` ? "copied" : ""}`} onClick={() => copyColor(`hsl(${color.hsl})`, `${color.hex}-hsl`)}>
                      <span className="label">HSL</span>
                      <span className="value">{color.hsl}</span>
                      {copiedId === `${color.hex}-hsl` ? <Check className="w-3 h-3 copy-icon" style={{ opacity: 1 }} /> : <Copy className="w-3 h-3 copy-icon" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="color-section">
          <div className="color-section-title">Secondary Colors</div>
          <div className="color-grid">
            {secondaryColors.map((color) => (
              <div key={color.hex} className="color-card">
                <div className="color-swatch" style={{ background: color.hex }}>{color.label}</div>
                <div className="color-info">
                  <h4>{color.name}</h4>
                  <div className="color-codes">
                    <div className={`color-code ${copiedId === `${color.hex}-hex` ? "copied" : ""}`} onClick={() => copyColor(color.hex, `${color.hex}-hex`)}>
                      <span className="label">HEX</span>
                      <span className="value">{color.hex}</span>
                      {copiedId === `${color.hex}-hex` ? <Check className="w-3 h-3 copy-icon" style={{ opacity: 1 }} /> : <Copy className="w-3 h-3 copy-icon" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="color-section">
          <div className="color-section-title">Accent Colors</div>
          <div className="color-grid">
            {accentColors.map((color) => (
              <div key={color.hex} className="color-card">
                <div className="color-swatch" style={{ background: color.hex }}>{color.label}</div>
                <div className="color-info">
                  <h4>{color.name}</h4>
                  <div className="color-codes">
                    <div className={`color-code ${copiedId === `${color.hex}-hex` ? "copied" : ""}`} onClick={() => copyColor(color.hex, `${color.hex}-hex`)}>
                      <span className="label">HEX</span>
                      <span className="value">{color.hex}</span>
                      {copiedId === `${color.hex}-hex` ? <Check className="w-3 h-3 copy-icon" style={{ opacity: 1 }} /> : <Copy className="w-3 h-3 copy-icon" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="color-section">
          <div className="color-section-title">Gradients</div>
          <div className="color-grid">
            {gradients.map((grad, i) => (
              <div key={i} className="color-card">
                <div className="color-swatch" style={{ background: grad.css }}>{grad.name}</div>
                <div className="color-info">
                  <h4>{grad.name}</h4>
                  <div className="color-codes">
                    <div className={`color-code ${copiedId === `grad-${i}` ? "copied" : ""}`} onClick={() => copyColor(grad.css, `grad-${i}`)}>
                      <span className="label">CSS</span>
                      <span className="value" style={{ fontSize: "0.65rem" }}>{grad.css.slice(0, 30)}...</span>
                      {copiedId === `grad-${i}` ? <Check className="w-3 h-3 copy-icon" style={{ opacity: 1 }} /> : <Copy className="w-3 h-3 copy-icon" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-section" id="typography">
        <div className="brand-section-header">
          <div className="brand-section-title-group">
            <h2><Type className="w-6 h-6" /> 타이포그래피 / Typography</h2>
            <p>TBURN Chain의 공식 서체</p>
          </div>
          <button className="download-section-btn" onClick={() => downloadSection("typography")} data-testid="button-download-typography">
            <Download className="w-4 h-4" /> 폰트 다운로드
          </button>
        </div>

        <div className="typography-grid">
          <div className="typography-card">
            <h4>Primary Font</h4>
            <div className="font-name" style={{ fontFamily: "Inter" }}>Inter</div>
            <div className="font-preview">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
              abcdefghijklmnopqrstuvwxyz<br />
              0123456789 !@#$%^&*()
            </div>
            <div className="font-weights">
              <span className="font-weight-tag">Light <span>300</span></span>
              <span className="font-weight-tag">Regular <span>400</span></span>
              <span className="font-weight-tag">Medium <span>500</span></span>
              <span className="font-weight-tag">SemiBold <span>600</span></span>
              <span className="font-weight-tag">Bold <span>700</span></span>
              <span className="font-weight-tag">ExtraBold <span>800</span></span>
              <span className="font-weight-tag">Black <span>900</span></span>
            </div>
          </div>
          <div className="typography-card">
            <h4>Secondary Font (Korean)</h4>
            <div className="font-name">Pretendard</div>
            <div className="font-preview">
              가나다라마바사아자차카타파하<br />
              다양한 굵기를 지원하는 한글 폰트<br />
              TBURN 블록체인
            </div>
            <div className="font-weights">
              <span className="font-weight-tag">Regular <span>400</span></span>
              <span className="font-weight-tag">Medium <span>500</span></span>
              <span className="font-weight-tag">SemiBold <span>600</span></span>
              <span className="font-weight-tag">Bold <span>700</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-section" id="banners" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="brand-section-header">
          <div className="brand-section-title-group">
            <h2><Image className="w-6 h-6" /> 배너 / Banners</h2>
            <p>다양한 용도의 배너 템플릿</p>
          </div>
          <button className="download-section-btn" onClick={() => downloadSection("banners")} data-testid="button-download-banners">
            <Download className="w-4 h-4" /> 배너 전체 다운로드
          </button>
        </div>

        <div className="banner-grid">
          {banners.map((banner) => (
            <div key={banner.id} className="banner-card" data-testid={`banner-card-${banner.id}`}>
              <div className="banner-preview">
                <div className={`banner-display ${banner.type}`}>
                  <div className={`banner-content ${banner.type === "email-banner" ? "dark-text" : ""}`}>
                    <div className="logo-group">
                      <TBurnLogo className="w-12 h-12" />
                      <div className="logo-text-small">TBURN<span>CHAIN</span></div>
                    </div>
                    <h3>The Future of Decentralized Finance</h3>
                    <p>Burn to Earn · AI-Powered · Quantum-Resistant</p>
                  </div>
                  <div className="banner-decoration circles" />
                  <div className="banner-decoration lines" />
                </div>
              </div>
              <div className="banner-info">
                <div className="banner-meta">
                  <h4>{banner.title}</h4>
                  <div className="banner-size">
                    <span className="dimension">{banner.dimension}</span>
                    <span>{banner.desc}</span>
                  </div>
                </div>
                <button className="banner-download-btn" onClick={() => downloadAsset(banner.id)} data-testid={`button-download-banner-${banner.id}`}>
                  <Download className="w-4 h-4" /> 다운로드
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="brand-section" id="icons">
        <div className="brand-section-header">
          <div className="brand-section-title-group">
            <h2><Flame className="w-6 h-6" /> 아이콘 세트 / Icon Set</h2>
            <p>TBURN Chain에서 사용하는 아이콘</p>
          </div>
          <button className="download-section-btn" onClick={() => downloadSection("icons")} data-testid="button-download-icons">
            <Download className="w-4 h-4" /> 아이콘 전체 다운로드
          </button>
        </div>

        <div className="icon-grid">
          {iconSet.map((item, i) => (
            <div key={i} className="icon-card" onClick={() => downloadAsset(`icon-${item.name}`)} data-testid={`icon-${item.name}`}>
              <div className="icon-display">{item.icon}</div>
              <div className="icon-name">{item.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="brand-section" id="guidelines" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="brand-section-header">
          <div className="brand-section-title-group">
            <h2><FileText className="w-6 h-6" /> 사용 가이드라인 / Usage Guidelines</h2>
            <p>브랜드 에셋을 올바르게 사용하는 방법</p>
          </div>
        </div>

        <div className="guidelines-grid">
          <div className="guideline-card do">
            <div className="guideline-header">
              <Check className="w-5 h-5" /> DO - 올바른 사용
            </div>
            <div className="guideline-content">
              <div className="guideline-items">
                <div className="guideline-item">
                  <div className="icon"><Check className="w-3 h-3" /></div>
                  <p>공식 로고 파일을 원본 그대로 사용하세요.</p>
                </div>
                <div className="guideline-item">
                  <div className="icon"><Check className="w-3 h-3" /></div>
                  <p>로고 주변에 충분한 여백을 확보하세요.</p>
                </div>
                <div className="guideline-item">
                  <div className="icon"><Check className="w-3 h-3" /></div>
                  <p>지정된 컬러 팔레트 내에서 로고를 사용하세요.</p>
                </div>
                <div className="guideline-item">
                  <div className="icon"><Check className="w-3 h-3" /></div>
                  <p>고해상도 이미지가 필요할 때 SVG 포맷을 사용하세요.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="guideline-card dont">
            <div className="guideline-header">
              <X className="w-5 h-5" /> DON'T - 잘못된 사용
            </div>
            <div className="guideline-content">
              <div className="guideline-items">
                <div className="guideline-item">
                  <div className="icon"><X className="w-3 h-3" /></div>
                  <p>로고의 색상을 임의로 변경하지 마세요.</p>
                </div>
                <div className="guideline-item">
                  <div className="icon"><X className="w-3 h-3" /></div>
                  <p>로고를 늘리거나, 기울이거나, 회전하지 마세요. 원본 비율을 유지하세요.</p>
                </div>
                <div className="guideline-item">
                  <div className="icon"><X className="w-3 h-3" /></div>
                  <p>로고에 그림자, 외곽선, 효과를 추가하지 마세요.</p>
                </div>
                <div className="guideline-item">
                  <div className="icon"><X className="w-3 h-3" /></div>
                  <p>복잡한 배경 위에 로고를 배치하지 마세요. 가독성이 떨어집니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="clearspace-container">
          <h4 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.5rem" }}>Clear Space (여백 가이드)</h4>
          <div className="clearspace-visual">
            <div className="clearspace-logo">
              <TBurnLogo className="w-16 h-16" />
              <div className="text">TBURN<span>CHAIN</span></div>
              <div className="clearspace-marker top">X</div>
              <div className="clearspace-marker bottom">X</div>
              <div className="clearspace-marker left">X</div>
              <div className="clearspace-marker right">X</div>
            </div>
          </div>
          <div className="clearspace-note">
            <strong>X = 심볼 높이의 50%</strong><br />
            로고 주변에 최소 X 만큼의 여백을 확보하여 가독성과 브랜드 임팩트를 유지하세요.
          </div>
        </div>
      </section>

      <section className="brand-section">
        <div className="download-center">
          <h3>브랜드 에셋 다운로드</h3>
          <p>필요한 포맷의 에셋 패키지를 다운로드하세요</p>
          <div className="download-options">
            <div className="download-option" onClick={() => downloadPackage("full")} data-testid="download-full">
              <div className="icon"><FileText className="w-10 h-10" /></div>
              <h4>전체 패키지</h4>
              <p>모든 에셋 포함 (ZIP)</p>
            </div>
            <div className="download-option" onClick={() => downloadPackage("print")} data-testid="download-print">
              <div className="icon"><Printer className="w-10 h-10" /></div>
              <h4>인쇄용</h4>
              <p>고해상도 PDF, EPS</p>
            </div>
            <div className="download-option" onClick={() => downloadPackage("digital")} data-testid="download-digital">
              <div className="icon"><Monitor className="w-10 h-10" /></div>
              <h4>디지털용</h4>
              <p>SVG, PNG, WebP</p>
            </div>
            <div className="download-option" onClick={() => downloadPackage("social")} data-testid="download-social">
              <div className="icon"><Share2 className="w-10 h-10" /></div>
              <h4>소셜 미디어</h4>
              <p>최적화된 배너/프로필</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="brand-footer">
        <p>© 2025-2045 TBURN Foundation. All Rights Reserved.</p>
        <p style={{ marginTop: "0.5rem" }}>
          브랜드 에셋 사용에 관한 문의: <a href="mailto:brand@tburn.io">brand@tburn.io</a>
        </p>
      </footer>
    </div>
  );
}
