import{r as h,j as e}from"./index-MawzfEWf.js";import{d as j,x as E,n,X as m}from"./tburn-loader-BM0jq71g.js";import{P as b}from"./palette-B4__0fWt.js";import{T as N,P as V}from"./type-D7I5BUsA.js";import{I as f}from"./image-MJ4NK2Ec.js";import{F as g}from"./flame-Bet5LKZW.js";import{D as s}from"./download-Bxc74lJz.js";import{C as i}from"./index-DNbWdfiD.js";import{C as c}from"./copy-fW6DFBZM.js";import{F as v}from"./file-text-3sfpm8UG.js";import{M as F}from"./monitor-DI4Da3sC.js";import{S as C}from"./share-2-D2WT3Ncx.js";import"./i18nInstance-DCxlOlkw.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=j("Shapes",[["path",{d:"M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z",key:"1bo67w"}],["rect",{x:"3",y:"14",width:"7",height:"7",rx:"1",key:"1bkyp8"}],["circle",{cx:"17.5",cy:"17.5",r:"3.5",key:"w3z12y"}]]),z=`
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
`,S=[{id:"main-logo-dark",title:"메인 로고 (다크)",desc:"어두운 배경에서 사용하는 기본 로고",bg:"dark-bg",type:"main",dark:!1,formats:["SVG","PNG","PDF"]},{id:"main-logo-light",title:"메인 로고 (라이트)",desc:"밝은 배경에서 사용하는 기본 로고",bg:"light-bg",type:"main",dark:!0,formats:["SVG","PNG","PDF"]},{id:"main-logo-navy",title:"메인 로고 (네이비)",desc:"네이비 배경에서 사용하는 로고",bg:"navy-bg",type:"main",dark:!1,formats:["SVG","PNG","PDF"]},{id:"symbol",title:"심볼 (Symbol)",desc:"아이콘 또는 파비콘으로 사용",bg:"dark-bg",type:"symbol",formats:["SVG","PNG","ICO"]},{id:"symbol-outline",title:"심볼 아웃라인",desc:"아웃라인 버전의 심볼",bg:"dark-bg",type:"symbol-outline",formats:["SVG","PNG"]},{id:"symbol-transparent",title:"심볼 (투명 배경)",desc:"투명 배경용 PNG 심볼",bg:"transparent-bg",type:"symbol",formats:["PNG","WEBP"]},{id:"wordmark-gold",title:"워드마크 (골드)",desc:"심볼 없이 텍스트만 사용",bg:"dark-bg",type:"wordmark-gold",formats:["SVG","PNG"]},{id:"wordmark-white",title:"워드마크 (화이트)",desc:"어두운 배경용 화이트 워드마크",bg:"navy-bg",type:"wordmark-white",formats:["SVG","PNG"]},{id:"wordmark-dark",title:"워드마크 (다크)",desc:"밝은 배경용 다크 워드마크",bg:"gold-bg",type:"wordmark-dark",formats:["SVG","PNG"]}],T=[{name:"TBURN Gold",hex:"#D4AF37",rgb:"212, 175, 55",hsl:"46, 63%, 52%",label:"Gold Primary"},{name:"TBURN Navy",hex:"#1A365D",rgb:"26, 54, 93",hsl:"215, 56%, 23%",label:"Navy Primary"},{name:"TBURN Dark",hex:"#0F172A",rgb:"15, 23, 42",hsl:"222, 47%, 11%",label:"Dark Primary"},{name:"TBURN White",hex:"#FFFFFF",rgb:"255, 255, 255",hsl:"0, 0%, 100%",label:"White",textDark:!0}],I=[{name:"Gold Light",hex:"#F5D76E",label:"Gold Light"},{name:"Gold Dark",hex:"#B8960C",label:"Gold Dark"},{name:"Navy Light",hex:"#2D4A7C",label:"Navy Light"},{name:"Card Background",hex:"#1E293B",label:"Card Dark"}],R=[{name:"Success",hex:"#22C55E",label:"Success Green"},{name:"Info",hex:"#3B82F6",label:"Info Blue"},{name:"Warning",hex:"#F59E0B",label:"Warning Orange"},{name:"Error",hex:"#EF4444",label:"Error Red"}],A=[{name:"Gold Gradient",css:"linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%)"},{name:"Navy Gradient",css:"linear-gradient(135deg, #1A365D 0%, #2D4A7C 100%)"},{name:"Fire Gradient",css:"linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD700 100%)"},{name:"Dark Gradient",css:"linear-gradient(180deg, #0F172A 0%, #1E293B 100%)"}],L=[{id:"hero",title:"히어로 배너",type:"hero-banner",dimension:"1920 × 600",desc:"웹사이트 메인"},{id:"social",title:"소셜 미디어 배너",type:"social-banner",dimension:"1200 × 630",desc:"Facebook/Twitter"},{id:"email",title:"이메일 헤더",type:"email-banner",dimension:"600 × 200",desc:"뉴스레터"},{id:"ad",title:"광고 배너",type:"ad-banner",dimension:"728 × 90",desc:"디스플레이 광고"}],G=[{icon:"🔥",name:"Fire"},{icon:"⚡",name:"Lightning"},{icon:"🛡️",name:"Shield"},{icon:"💎",name:"Diamond"},{icon:"🪙",name:"Coin"},{icon:"📊",name:"Chart"},{icon:"🔐",name:"Lock"},{icon:"🌐",name:"Globe"},{icon:"💰",name:"Wallet"},{icon:"🏦",name:"Bank"},{icon:"📈",name:"Growth"},{icon:"🔗",name:"Chain"},{icon:"⚙️",name:"Settings"},{icon:"🎯",name:"Target"},{icon:"🚀",name:"Rocket"},{icon:"💫",name:"Spark"}];function J(){const{toast:o}=E(),[w,k]=h.useState("logos"),[t,x]=h.useState(null),D=a=>{k(a);const r=document.getElementById(a);r&&r.scrollIntoView({behavior:"smooth"})},l=async(a,r)=>{try{await navigator.clipboard.writeText(a),x(r),o({title:"클립보드에 복사되었습니다!",description:a}),setTimeout(()=>x(null),1e3)}catch{o({title:"복사 실패",variant:"destructive"})}},u=a=>{o({title:`${a} 다운로드를 시작합니다...`,description:"파일이 곧 다운로드됩니다."})},d=a=>{o({title:`${a} 섹션 에셋을 다운로드합니다...`})},p=a=>{o({title:`${{full:"전체 브랜드 패키지",print:"인쇄용 패키지",digital:"디지털용 패키지",social:"소셜 미디어 패키지"}[a]}를 다운로드합니다...`})},y=(a,r=!1)=>a==="main"?e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:959:8","data-component-name":"div",className:"flex items-center gap-3",children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:960:10","data-component-name":"TBurnLogo",className:"w-16 h-16"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:960,columnNumber:11},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:961:10","data-component-name":"span",className:`text-2xl font-black ${r?"text-gray-900":"text-white"}`,children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:962:17","data-component-name":"span",className:"text-[#D4AF37]",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:962,columnNumber:18},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:961,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:959,columnNumber:9},this):a==="symbol"?e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:968:13","data-component-name":"TBurnLogo",className:"w-20 h-20",showText:!1},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:968,columnNumber:14},this):a==="symbol-outline"?e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:972:8","data-component-name":"div",className:"w-20 h-20 rounded-2xl border-2 border-[#D4AF37] flex items-center justify-center",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:973:10","data-component-name":"TBurnLogo",className:"w-14 h-14",symbolColor:"#D4AF37",showText:!1},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:973,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:972,columnNumber:9},this):a==="wordmark-gold"?e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:978:13","data-component-name":"span",className:"text-3xl font-black text-[#D4AF37]",children:"TBURNCHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:978,columnNumber:14},this):a==="wordmark-white"?e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:981:13","data-component-name":"span",className:"text-3xl font-black text-white",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:981:67","data-component-name":"span",className:"text-[#D4AF37]",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:981,columnNumber:159},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:981,columnNumber:14},this):a==="wordmark-dark"?e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:984:13","data-component-name":"span",className:"text-3xl font-black text-gray-900",children:"TBURNCHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:984,columnNumber:14},this):null;return e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:990:4","data-component-name":"div",className:"brand-page","data-testid":"page-brand",children:[e.jsxDEV("style",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:991:6","data-component-name":"style",children:z},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:991,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:993:6","data-component-name":"section",className:"brand-hero",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:994:8","data-component-name":"div",className:"brand-hero-bg"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:994,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:995:8","data-component-name":"div",className:"brand-hero-content",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:996:10","data-component-name":"div",className:"brand-badge",children:[e.jsxDEV(b,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:997:12","data-component-name":"Palette",className:"w-4 h-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:997,columnNumber:13},this),"OFFICIAL BRAND ASSETS"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:996,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1000:10","data-component-name":"h1",children:["TBURN Chain",e.jsxDEV("br",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1001:23","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1001,columnNumber:24},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1002:12","data-component-name":"span",className:"gradient-text",children:"Brand Assets"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1002,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1e3,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1004:10","data-component-name":"p",className:"brand-hero-subtitle",children:["TBURN Chain의 공식 브랜드 에셋입니다.",e.jsxDEV("br",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1005:38","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1005,columnNumber:39},this),"로고, 컬러, 타이포그래피, 배너를 다운로드하고 올바르게 사용하세요."]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1004,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1008:10","data-component-name":"div",className:"asset-categories",children:[{id:"logos",icon:B,label:"로고"},{id:"colors",icon:b,label:"컬러"},{id:"typography",icon:N,label:"타이포그래피"},{id:"banners",icon:f,label:"배너"},{id:"icons",icon:g,label:"아이콘"}].map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1016:14","data-component-name":"div",className:`category-pill ${w===a.id?"active":""}`,onClick:()=>D(a.id),"data-testid":`category-${a.id}`,children:[e.jsxDEV(a.icon,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1022:16","data-component-name":"cat.icon",className:"w-4 h-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1022,columnNumber:17},this),a.label]},a.id,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1016,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1008,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:995,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:993,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1030:6","data-component-name":"section",className:"brand-section",id:"logos",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1031:8","data-component-name":"div",className:"brand-section-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1032:10","data-component-name":"div",className:"brand-section-title-group",children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1033:12","data-component-name":"h2",children:[e.jsxDEV(B,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1033:16","data-component-name":"Shapes",className:"w-6 h-6"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1033,columnNumber:107},this)," 로고 / Logo"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1033,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1034:12","data-component-name":"p",children:"TBURN Chain의 공식 로고와 다양한 버전"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1034,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1032,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1036:10","data-component-name":"button",className:"download-section-btn",onClick:()=>d("logos"),"data-testid":"button-download-logos",children:[e.jsxDEV(s,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1037:12","data-component-name":"Download",className:"w-4 h-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1037,columnNumber:13},this)," 로고 전체 다운로드"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1036,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1031,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1041:8","data-component-name":"div",className:"logo-grid",children:S.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1043:12","data-component-name":"div",className:"logo-card","data-testid":`logo-card-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1044:14","data-component-name":"div",className:`logo-preview ${a.bg}`,children:y(a.type,a.dark)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1044,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1047:14","data-component-name":"div",className:"logo-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1048:16","data-component-name":"h4",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1048,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1049:16","data-component-name":"p",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1049,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1050:16","data-component-name":"div",className:"logo-formats",children:a.formats.map(r=>e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1052:20","data-component-name":"span",className:"format-tag",children:r},r,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1052,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1050,columnNumber:17},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1055:16","data-component-name":"button",className:"logo-download-btn",onClick:()=>u(a.id),"data-testid":`button-download-${a.id}`,children:[e.jsxDEV(s,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1056:18","data-component-name":"Download",className:"w-4 h-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1056,columnNumber:19},this)," 다운로드"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1055,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1047,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1043,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1041,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1063:8","data-component-name":"div",style:{marginTop:"3rem",padding:"2rem",background:"var(--dark-card)",borderRadius:"20px",border:"1px solid rgba(255,255,255,0.1)"},children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1064:10","data-component-name":"h3",style:{fontSize:"1.25rem",fontWeight:700,marginBottom:"0.5rem",display:"flex",alignItems:"center",gap:"8px"},children:[e.jsxDEV(g,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1065:12","data-component-name":"Flame",className:"w-5 h-5 text-orange-500"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1065,columnNumber:13},this)," TBurn Logo Symbol"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1064,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1067:10","data-component-name":"p",style:{color:"var(--gray)",marginBottom:"1.5rem"},children:"다양한 배경과 심볼 색상 조합 미리보기"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1067,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1069:10","data-component-name":"div",style:{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:"1rem"},className:"logo-variants-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1070:12","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1071:14","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#1f2937",display:"flex",alignItems:"center",justifyContent:"center"},"data-testid":"logo-var-dark",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1072:16","data-component-name":"TBurnLogo",className:"w-11 h-11"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1072,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1071,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1074:14","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Dark"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1074,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1070,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1076:12","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1077:14","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#ffffff",border:"1px solid #e5e7eb",display:"flex",alignItems:"center",justifyContent:"center"},"data-testid":"logo-var-light",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1078:16","data-component-name":"TBurnLogo",className:"w-11 h-11"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1078,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1077,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1080:14","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Light"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1080,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1076,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1082:12","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1083:14","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#000000",display:"flex",alignItems:"center",justifyContent:"center"},"data-testid":"logo-var-black",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1084:16","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#FF6B35"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1084,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1083,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1086:14","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Black"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1086,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1082,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1088:12","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1089:14","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#1e3a5f",display:"flex",alignItems:"center",justifyContent:"center"},"data-testid":"logo-var-navy",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1090:16","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#FFD700"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1090,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1089,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1092:14","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Navy"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1092,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1088,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1094:12","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1095:14","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center"},"data-testid":"logo-var-orange",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1096:16","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#FFFFFF"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1096,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1095,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1098:14","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Orange"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1098,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1094,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1100:12","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1101:14","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#facc15",display:"flex",alignItems:"center",justifyContent:"center"},"data-testid":"logo-var-yellow",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1102:16","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#000000"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1102,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1101,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1104:14","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Yellow"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1104,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1100,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1106:12","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1107:14","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#581c87",display:"flex",alignItems:"center",justifyContent:"center"},"data-testid":"logo-var-purple",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1108:16","data-component-name":"TBurnLogo",className:"w-11 h-11"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1108,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1107,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1110:14","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Purple"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1110,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1106,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1112:12","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1113:14","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#374151",display:"flex",alignItems:"center",justifyContent:"center"},"data-testid":"logo-var-red",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1114:16","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#EF4444"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1114,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1113,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1116:14","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Red"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1116,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1112,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1118:12","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1119:14","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center"},"data-testid":"logo-var-cyan",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1120:16","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#06B6D4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1120,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1119,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1122:14","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Cyan"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1122,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1118,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1124:12","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1125:14","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#18181b",display:"flex",alignItems:"center",justifyContent:"center"},"data-testid":"logo-var-green",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1126:16","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#22C55E"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1126,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1125,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1128:14","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Green"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1128,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1124,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1130:12","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1131:14","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#dc2626",display:"flex",alignItems:"center",justifyContent:"center"},"data-testid":"logo-var-red-bg",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1132:16","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#FFFFFF"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1132,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1131,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1134:14","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Red BG"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1134,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1130,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1136:12","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1137:14","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"linear-gradient(135deg, #f97316 0%, #facc15 100%)",display:"flex",alignItems:"center",justifyContent:"center"},"data-testid":"logo-var-brand",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1138:16","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#FFFFFF"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1138,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1137,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1140:14","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Brand"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1140,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1136,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1142:12","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1143:14","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#06b6d4",display:"flex",alignItems:"center",justifyContent:"center"},"data-testid":"logo-var-cyan-bg",children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1144:16","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#FF6B35",textColor:"#FFFFFF"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1144,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1143,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1146:14","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Cyan BG"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1146,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1142,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1069,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1150:10","data-component-name":"div",style:{marginTop:"1.5rem",paddingTop:"1.5rem",borderTop:"1px solid rgba(255,255,255,0.1)"},children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1151:12","data-component-name":"p",style:{fontSize:"0.875rem",fontWeight:500,marginBottom:"1rem"},children:"White T Variants"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1151,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1152:12","data-component-name":"div",style:{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:"1rem"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1153:14","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1154:16","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#1f2937",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1155:18","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#FF6B35",textColor:"#FFFFFF",fontSize:17},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1155,columnNumber:19},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1154,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1157:16","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Orange"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1157,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1153,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1159:14","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1160:16","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#000000",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1161:18","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#FFD700",textColor:"#FFFFFF",fontSize:17},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1161,columnNumber:19},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1160,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1163:16","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Gold"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1163,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1159,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1165:14","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1166:16","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#172554",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1167:18","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#06B6D4",textColor:"#FFFFFF",fontSize:17},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1167,columnNumber:19},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1166,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1169:16","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Cyan"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1169,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1165,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1171:14","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1172:16","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#581c87",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1173:18","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#EC4899",textColor:"#FFFFFF",fontSize:17},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1173,columnNumber:19},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1172,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1175:16","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Pink"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1175,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1171,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1177:14","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1178:16","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#064e3b",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1179:18","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#84CC16",textColor:"#FFFFFF",fontSize:17},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1179,columnNumber:19},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1178,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1181:16","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Lime"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1181,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1177,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1183:14","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1184:16","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#1e293b",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1185:18","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#3B82F6",textColor:"#FFFFFF",fontSize:17},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1185,columnNumber:19},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1184,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1187:16","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Blue"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1187,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1183,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1189:14","data-component-name":"div",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1190:16","data-component-name":"div",style:{width:"48px",height:"48px",borderRadius:"8px",background:"#27272a",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1191:18","data-component-name":"TBurnLogo",className:"w-11 h-11",symbolColor:"#F59E0B",textColor:"#FFFFFF",fontSize:17},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1191,columnNumber:19},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1190,columnNumber:17},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1193:16","data-component-name":"span",style:{fontSize:"0.75rem",color:"var(--gray)"},children:"Amber"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1193,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1189,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1152,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1150,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1063,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1030,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1200:6","data-component-name":"section",className:"brand-section",id:"colors",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1201:8","data-component-name":"div",className:"brand-section-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1202:10","data-component-name":"div",className:"brand-section-title-group",children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1203:12","data-component-name":"h2",children:[e.jsxDEV(b,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1203:16","data-component-name":"Palette",className:"w-6 h-6"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1203,columnNumber:107},this)," 컬러 팔레트 / Color Palette"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1203,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1204:12","data-component-name":"p",children:"TBURN Chain의 공식 브랜드 컬러"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1204,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1202,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1206:10","data-component-name":"button",className:"download-section-btn",onClick:()=>d("colors"),"data-testid":"button-download-colors",children:[e.jsxDEV(s,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1207:12","data-component-name":"Download",className:"w-4 h-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1207,columnNumber:13},this)," ASE 파일 다운로드"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1206,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1201,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1211:8","data-component-name":"div",className:"color-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1212:10","data-component-name":"div",className:"color-section-title",children:"Primary Colors"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1212,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1213:10","data-component-name":"div",className:"color-grid",children:T.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1215:14","data-component-name":"div",className:"color-card","data-testid":`color-card-${a.hex}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1216:16","data-component-name":"div",className:"color-swatch",style:{background:a.hex,color:a.textDark?"#333":"#fff"},children:a.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1216,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1219:16","data-component-name":"div",className:"color-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1220:18","data-component-name":"h4",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1220,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1221:18","data-component-name":"div",className:"color-codes",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1222:20","data-component-name":"div",className:`color-code ${t===`${a.hex}-hex`?"copied":""}`,onClick:()=>l(a.hex,`${a.hex}-hex`),children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1223:22","data-component-name":"span",className:"label",children:"HEX"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1223,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1224:22","data-component-name":"span",className:"value",children:a.hex},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1224,columnNumber:23},this),t===`${a.hex}-hex`?e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1225:57","data-component-name":"Check",className:"w-3 h-3 copy-icon",style:{opacity:1}},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1225,columnNumber:58},this):e.jsxDEV(c,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1225:122","data-component-name":"Copy",className:"w-3 h-3 copy-icon"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1225,columnNumber:216},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1222,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1227:20","data-component-name":"div",className:`color-code ${t===`${a.hex}-rgb`?"copied":""}`,onClick:()=>l(`rgb(${a.rgb})`,`${a.hex}-rgb`),children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1228:22","data-component-name":"span",className:"label",children:"RGB"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1228,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1229:22","data-component-name":"span",className:"value",children:a.rgb},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1229,columnNumber:23},this),t===`${a.hex}-rgb`?e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1230:57","data-component-name":"Check",className:"w-3 h-3 copy-icon",style:{opacity:1}},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1230,columnNumber:58},this):e.jsxDEV(c,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1230:122","data-component-name":"Copy",className:"w-3 h-3 copy-icon"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1230,columnNumber:216},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1227,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1232:20","data-component-name":"div",className:`color-code ${t===`${a.hex}-hsl`?"copied":""}`,onClick:()=>l(`hsl(${a.hsl})`,`${a.hex}-hsl`),children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1233:22","data-component-name":"span",className:"label",children:"HSL"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1233,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1234:22","data-component-name":"span",className:"value",children:a.hsl},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1234,columnNumber:23},this),t===`${a.hex}-hsl`?e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1235:57","data-component-name":"Check",className:"w-3 h-3 copy-icon",style:{opacity:1}},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1235,columnNumber:58},this):e.jsxDEV(c,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1235:122","data-component-name":"Copy",className:"w-3 h-3 copy-icon"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1235,columnNumber:216},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1232,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1221,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1219,columnNumber:17},this)]},a.hex,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1215,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1213,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1211,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1244:8","data-component-name":"div",className:"color-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1245:10","data-component-name":"div",className:"color-section-title",children:"Secondary Colors"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1245,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1246:10","data-component-name":"div",className:"color-grid",children:I.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1248:14","data-component-name":"div",className:"color-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1249:16","data-component-name":"div",className:"color-swatch",style:{background:a.hex},children:a.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1249,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1250:16","data-component-name":"div",className:"color-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1251:18","data-component-name":"h4",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1251,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1252:18","data-component-name":"div",className:"color-codes",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1253:20","data-component-name":"div",className:`color-code ${t===`${a.hex}-hex`?"copied":""}`,onClick:()=>l(a.hex,`${a.hex}-hex`),children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1254:22","data-component-name":"span",className:"label",children:"HEX"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1254,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1255:22","data-component-name":"span",className:"value",children:a.hex},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1255,columnNumber:23},this),t===`${a.hex}-hex`?e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1256:57","data-component-name":"Check",className:"w-3 h-3 copy-icon",style:{opacity:1}},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1256,columnNumber:58},this):e.jsxDEV(c,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1256:122","data-component-name":"Copy",className:"w-3 h-3 copy-icon"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1256,columnNumber:216},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1253,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1252,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1250,columnNumber:17},this)]},a.hex,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1248,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1246,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1244,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1265:8","data-component-name":"div",className:"color-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1266:10","data-component-name":"div",className:"color-section-title",children:"Accent Colors"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1266,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1267:10","data-component-name":"div",className:"color-grid",children:R.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1269:14","data-component-name":"div",className:"color-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1270:16","data-component-name":"div",className:"color-swatch",style:{background:a.hex},children:a.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1270,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1271:16","data-component-name":"div",className:"color-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1272:18","data-component-name":"h4",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1272,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1273:18","data-component-name":"div",className:"color-codes",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1274:20","data-component-name":"div",className:`color-code ${t===`${a.hex}-hex`?"copied":""}`,onClick:()=>l(a.hex,`${a.hex}-hex`),children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1275:22","data-component-name":"span",className:"label",children:"HEX"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1275,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1276:22","data-component-name":"span",className:"value",children:a.hex},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1276,columnNumber:23},this),t===`${a.hex}-hex`?e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1277:57","data-component-name":"Check",className:"w-3 h-3 copy-icon",style:{opacity:1}},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1277,columnNumber:58},this):e.jsxDEV(c,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1277:122","data-component-name":"Copy",className:"w-3 h-3 copy-icon"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1277,columnNumber:216},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1274,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1273,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1271,columnNumber:17},this)]},a.hex,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1269,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1267,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1265,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1286:8","data-component-name":"div",className:"color-section",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1287:10","data-component-name":"div",className:"color-section-title",children:"Gradients"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1287,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1288:10","data-component-name":"div",className:"color-grid",children:A.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1290:14","data-component-name":"div",className:"color-card",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1291:16","data-component-name":"div",className:"color-swatch",style:{background:a.css},children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1291,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1292:16","data-component-name":"div",className:"color-info",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1293:18","data-component-name":"h4",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1293,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1294:18","data-component-name":"div",className:"color-codes",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1295:20","data-component-name":"div",className:`color-code ${t===`grad-${r}`?"copied":""}`,onClick:()=>l(a.css,`grad-${r}`),children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1296:22","data-component-name":"span",className:"label",children:"CSS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1296,columnNumber:23},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1297:22","data-component-name":"span",className:"value",style:{fontSize:"0.65rem"},children:[a.css.slice(0,30),"..."]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1297,columnNumber:23},this),t===`grad-${r}`?e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1298:50","data-component-name":"Check",className:"w-3 h-3 copy-icon",style:{opacity:1}},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1298,columnNumber:51},this):e.jsxDEV(c,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1298:115","data-component-name":"Copy",className:"w-3 h-3 copy-icon"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1298,columnNumber:209},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1295,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1294,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1292,columnNumber:17},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1290,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1288,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1286,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1200,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1308:6","data-component-name":"section",className:"brand-section",id:"typography",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1309:8","data-component-name":"div",className:"brand-section-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1310:10","data-component-name":"div",className:"brand-section-title-group",children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1311:12","data-component-name":"h2",children:[e.jsxDEV(N,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1311:16","data-component-name":"Type",className:"w-6 h-6"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1311,columnNumber:107},this)," 타이포그래피 / Typography"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1311,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1312:12","data-component-name":"p",children:"TBURN Chain의 공식 서체"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1312,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1310,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1314:10","data-component-name":"button",className:"download-section-btn",onClick:()=>d("typography"),"data-testid":"button-download-typography",children:[e.jsxDEV(s,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1315:12","data-component-name":"Download",className:"w-4 h-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1315,columnNumber:13},this)," 폰트 다운로드"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1314,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1309,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1319:8","data-component-name":"div",className:"typography-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1320:10","data-component-name":"div",className:"typography-card",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1321:12","data-component-name":"h4",children:"Primary Font"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1321,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1322:12","data-component-name":"div",className:"font-name",style:{fontFamily:"Inter"},children:"Inter"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1322,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1323:12","data-component-name":"div",className:"font-preview",children:["ABCDEFGHIJKLMNOPQRSTUVWXYZ",e.jsxDEV("br",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1324:40","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1324,columnNumber:41},this),"abcdefghijklmnopqrstuvwxyz",e.jsxDEV("br",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1325:40","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1325,columnNumber:41},this),"0123456789 !@#$%^&*()"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1323,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1328:12","data-component-name":"div",className:"font-weights",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1329:14","data-component-name":"span",className:"font-weight-tag",children:["Light ",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1329:54","data-component-name":"span",children:"300"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1329,columnNumber:147},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1329,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1330:14","data-component-name":"span",className:"font-weight-tag",children:["Regular ",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1330:56","data-component-name":"span",children:"400"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1330,columnNumber:149},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1330,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1331:14","data-component-name":"span",className:"font-weight-tag",children:["Medium ",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1331:55","data-component-name":"span",children:"500"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1331,columnNumber:148},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1331,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1332:14","data-component-name":"span",className:"font-weight-tag",children:["SemiBold ",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1332:57","data-component-name":"span",children:"600"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1332,columnNumber:150},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1332,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1333:14","data-component-name":"span",className:"font-weight-tag",children:["Bold ",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1333:53","data-component-name":"span",children:"700"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1333,columnNumber:146},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1333,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1334:14","data-component-name":"span",className:"font-weight-tag",children:["ExtraBold ",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1334:58","data-component-name":"span",children:"800"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1334,columnNumber:151},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1334,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1335:14","data-component-name":"span",className:"font-weight-tag",children:["Black ",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1335:54","data-component-name":"span",children:"900"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1335,columnNumber:147},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1335,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1328,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1320,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1338:10","data-component-name":"div",className:"typography-card",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1339:12","data-component-name":"h4",children:"Secondary Font (Korean)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1339,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1340:12","data-component-name":"div",className:"font-name",children:"Pretendard"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1340,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1341:12","data-component-name":"div",className:"font-preview",children:["가나다라마바사아자차카타파하",e.jsxDEV("br",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1342:28","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1342,columnNumber:29},this),"다양한 굵기를 지원하는 한글 폰트",e.jsxDEV("br",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1343:32","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1343,columnNumber:33},this),"TBURN 블록체인"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1341,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1346:12","data-component-name":"div",className:"font-weights",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1347:14","data-component-name":"span",className:"font-weight-tag",children:["Regular ",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1347:56","data-component-name":"span",children:"400"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1347,columnNumber:149},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1347,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1348:14","data-component-name":"span",className:"font-weight-tag",children:["Medium ",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1348:55","data-component-name":"span",children:"500"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1348,columnNumber:148},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1348,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1349:14","data-component-name":"span",className:"font-weight-tag",children:["SemiBold ",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1349:57","data-component-name":"span",children:"600"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1349,columnNumber:150},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1349,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1350:14","data-component-name":"span",className:"font-weight-tag",children:["Bold ",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1350:53","data-component-name":"span",children:"700"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1350,columnNumber:146},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1350,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1346,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1338,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1319,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1308,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1356:6","data-component-name":"section",className:"brand-section",id:"banners",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1357:8","data-component-name":"div",className:"brand-section-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1358:10","data-component-name":"div",className:"brand-section-title-group",children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1359:12","data-component-name":"h2",children:[e.jsxDEV(f,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1359:16","data-component-name":"Image",className:"w-6 h-6"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1359,columnNumber:107},this)," 배너 / Banners"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1359,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1360:12","data-component-name":"p",children:"다양한 용도의 배너 템플릿"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1360,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1358,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1362:10","data-component-name":"button",className:"download-section-btn",onClick:()=>d("banners"),"data-testid":"button-download-banners",children:[e.jsxDEV(s,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1363:12","data-component-name":"Download",className:"w-4 h-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1363,columnNumber:13},this)," 배너 전체 다운로드"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1362,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1357,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1367:8","data-component-name":"div",className:"banner-grid",children:L.map(a=>e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1369:12","data-component-name":"div",className:"banner-card","data-testid":`banner-card-${a.id}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1370:14","data-component-name":"div",className:"banner-preview",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1371:16","data-component-name":"div",className:`banner-display ${a.type}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1372:18","data-component-name":"div",className:`banner-content ${a.type==="email-banner"?"dark-text":""}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1373:20","data-component-name":"div",className:"logo-group",children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1374:22","data-component-name":"TBurnLogo",className:"w-12 h-12"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1374,columnNumber:23},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1375:22","data-component-name":"div",className:"logo-text-small",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1375:60","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1375,columnNumber:152},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1375,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1373,columnNumber:21},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1377:20","data-component-name":"h3",children:"The Future of Decentralized Finance"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1377,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1378:20","data-component-name":"p",children:"Burn to Earn · AI-Powered · Quantum-Resistant"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1378,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1372,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1380:18","data-component-name":"div",className:"banner-decoration circles"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1380,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1381:18","data-component-name":"div",className:"banner-decoration lines"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1381,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1371,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1370,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1384:14","data-component-name":"div",className:"banner-info",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1385:16","data-component-name":"div",className:"banner-meta",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1386:18","data-component-name":"h4",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1386,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1387:18","data-component-name":"div",className:"banner-size",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1388:20","data-component-name":"span",className:"dimension",children:a.dimension},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1388,columnNumber:21},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1389:20","data-component-name":"span",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1389,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1387,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1385,columnNumber:17},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1392:16","data-component-name":"button",className:"banner-download-btn",onClick:()=>u(a.id),"data-testid":`button-download-banner-${a.id}`,children:[e.jsxDEV(s,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1393:18","data-component-name":"Download",className:"w-4 h-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1393,columnNumber:19},this)," 다운로드"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1392,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1384,columnNumber:15},this)]},a.id,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1369,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1367,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1356,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1401:6","data-component-name":"section",className:"brand-section",id:"icons",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1402:8","data-component-name":"div",className:"brand-section-header",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1403:10","data-component-name":"div",className:"brand-section-title-group",children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1404:12","data-component-name":"h2",children:[e.jsxDEV(g,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1404:16","data-component-name":"Flame",className:"w-6 h-6"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1404,columnNumber:107},this)," 아이콘 세트 / Icon Set"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1404,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1405:12","data-component-name":"p",children:"TBURN Chain에서 사용하는 아이콘"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1405,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1403,columnNumber:11},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1407:10","data-component-name":"button",className:"download-section-btn",onClick:()=>d("icons"),"data-testid":"button-download-icons",children:[e.jsxDEV(s,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1408:12","data-component-name":"Download",className:"w-4 h-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1408,columnNumber:13},this)," 아이콘 전체 다운로드"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1407,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1402,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1412:8","data-component-name":"div",className:"icon-grid",children:G.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1414:12","data-component-name":"div",className:"icon-card",onClick:()=>u(`icon-${a.name}`),"data-testid":`icon-${a.name}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1415:14","data-component-name":"div",className:"icon-display",children:a.icon},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1415,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1416:14","data-component-name":"div",className:"icon-name",children:a.name},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1416,columnNumber:15},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1414,columnNumber:13},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1412,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1401,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1422:6","data-component-name":"section",className:"brand-section",id:"guidelines",style:{background:"rgba(255,255,255,0.02)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1423:8","data-component-name":"div",className:"brand-section-header",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1424:10","data-component-name":"div",className:"brand-section-title-group",children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1425:12","data-component-name":"h2",children:[e.jsxDEV(v,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1425:16","data-component-name":"FileText",className:"w-6 h-6"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1425,columnNumber:107},this)," 사용 가이드라인 / Usage Guidelines"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1425,columnNumber:13},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1426:12","data-component-name":"p",children:"브랜드 에셋을 올바르게 사용하는 방법"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1426,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1424,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1423,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1430:8","data-component-name":"div",className:"guidelines-grid",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1431:10","data-component-name":"div",className:"guideline-card do",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1432:12","data-component-name":"div",className:"guideline-header",children:[e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1433:14","data-component-name":"Check",className:"w-5 h-5"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1433,columnNumber:15},this)," DO - 올바른 사용"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1432,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1435:12","data-component-name":"div",className:"guideline-content",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1436:14","data-component-name":"div",className:"guideline-items",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1437:16","data-component-name":"div",className:"guideline-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1438:18","data-component-name":"div",className:"icon",children:e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1438:40","data-component-name":"Check",className:"w-3 h-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1438,columnNumber:132},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1438,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1439:18","data-component-name":"p",children:"공식 로고 파일을 원본 그대로 사용하세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1439,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1437,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1441:16","data-component-name":"div",className:"guideline-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1442:18","data-component-name":"div",className:"icon",children:e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1442:40","data-component-name":"Check",className:"w-3 h-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1442,columnNumber:132},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1442,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1443:18","data-component-name":"p",children:"로고 주변에 충분한 여백을 확보하세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1443,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1441,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1445:16","data-component-name":"div",className:"guideline-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1446:18","data-component-name":"div",className:"icon",children:e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1446:40","data-component-name":"Check",className:"w-3 h-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1446,columnNumber:132},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1446,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1447:18","data-component-name":"p",children:"지정된 컬러 팔레트 내에서 로고를 사용하세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1447,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1445,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1449:16","data-component-name":"div",className:"guideline-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1450:18","data-component-name":"div",className:"icon",children:e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1450:40","data-component-name":"Check",className:"w-3 h-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1450,columnNumber:132},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1450,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1451:18","data-component-name":"p",children:"고해상도 이미지가 필요할 때 SVG 포맷을 사용하세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1451,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1449,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1436,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1435,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1431,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1457:10","data-component-name":"div",className:"guideline-card dont",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1458:12","data-component-name":"div",className:"guideline-header",children:[e.jsxDEV(m,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1459:14","data-component-name":"X",className:"w-5 h-5"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1459,columnNumber:15},this)," DON'T - 잘못된 사용"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1458,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1461:12","data-component-name":"div",className:"guideline-content",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1462:14","data-component-name":"div",className:"guideline-items",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1463:16","data-component-name":"div",className:"guideline-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1464:18","data-component-name":"div",className:"icon",children:e.jsxDEV(m,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1464:40","data-component-name":"X",className:"w-3 h-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1464,columnNumber:132},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1464,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1465:18","data-component-name":"p",children:"로고의 색상을 임의로 변경하지 마세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1465,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1463,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1467:16","data-component-name":"div",className:"guideline-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1468:18","data-component-name":"div",className:"icon",children:e.jsxDEV(m,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1468:40","data-component-name":"X",className:"w-3 h-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1468,columnNumber:132},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1468,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1469:18","data-component-name":"p",children:"로고를 늘리거나, 기울이거나, 회전하지 마세요. 원본 비율을 유지하세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1469,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1467,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1471:16","data-component-name":"div",className:"guideline-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1472:18","data-component-name":"div",className:"icon",children:e.jsxDEV(m,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1472:40","data-component-name":"X",className:"w-3 h-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1472,columnNumber:132},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1472,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1473:18","data-component-name":"p",children:"로고에 그림자, 외곽선, 효과를 추가하지 마세요."},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1473,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1471,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1475:16","data-component-name":"div",className:"guideline-item",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1476:18","data-component-name":"div",className:"icon",children:e.jsxDEV(m,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1476:40","data-component-name":"X",className:"w-3 h-3"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1476,columnNumber:132},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1476,columnNumber:19},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1477:18","data-component-name":"p",children:"복잡한 배경 위에 로고를 배치하지 마세요. 가독성이 떨어집니다."},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1477,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1475,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1462,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1461,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1457,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1430,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1484:8","data-component-name":"div",className:"clearspace-container",children:[e.jsxDEV("h4",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1485:10","data-component-name":"h4",style:{fontSize:"1.125rem",fontWeight:700,marginBottom:"1.5rem"},children:"Clear Space (여백 가이드)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1485,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1486:10","data-component-name":"div",className:"clearspace-visual",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1487:12","data-component-name":"div",className:"clearspace-logo",children:[e.jsxDEV(n,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1488:14","data-component-name":"TBurnLogo",className:"w-16 h-16"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1488,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1489:14","data-component-name":"div",className:"text",children:["TBURN",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1489:41","data-component-name":"span",children:"CHAIN"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1489,columnNumber:133},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1489,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1490:14","data-component-name":"div",className:"clearspace-marker top",children:"X"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1490,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1491:14","data-component-name":"div",className:"clearspace-marker bottom",children:"X"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1491,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1492:14","data-component-name":"div",className:"clearspace-marker left",children:"X"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1492,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1493:14","data-component-name":"div",className:"clearspace-marker right",children:"X"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1493,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1487,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1486,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1496:10","data-component-name":"div",className:"clearspace-note",children:[e.jsxDEV("strong",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1497:12","data-component-name":"strong",children:"X = 심볼 높이의 50%"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1497,columnNumber:13},this),e.jsxDEV("br",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1497:43","data-component-name":"br"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1497,columnNumber:138},this),"로고 주변에 최소 X 만큼의 여백을 확보하여 가독성과 브랜드 임팩트를 유지하세요."]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1496,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1484,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1422,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1503:6","data-component-name":"section",className:"brand-section",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1504:8","data-component-name":"div",className:"download-center",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1505:10","data-component-name":"h3",children:"브랜드 에셋 다운로드"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1505,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1506:10","data-component-name":"p",children:"필요한 포맷의 에셋 패키지를 다운로드하세요"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1506,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1507:10","data-component-name":"div",className:"download-options",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1508:12","data-component-name":"div",className:"download-option",onClick:()=>p("full"),"data-testid":"download-full",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1509:14","data-component-name":"div",className:"icon",children:e.jsxDEV(v,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1509:36","data-component-name":"FileText",className:"w-10 h-10"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1509,columnNumber:128},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1509,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1510:14","data-component-name":"h4",children:"전체 패키지"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1510,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1511:14","data-component-name":"p",children:"모든 에셋 포함 (ZIP)"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1511,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1508,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1513:12","data-component-name":"div",className:"download-option",onClick:()=>p("print"),"data-testid":"download-print",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1514:14","data-component-name":"div",className:"icon",children:e.jsxDEV(V,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1514:36","data-component-name":"Printer",className:"w-10 h-10"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1514,columnNumber:128},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1514,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1515:14","data-component-name":"h4",children:"인쇄용"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1515,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1516:14","data-component-name":"p",children:"고해상도 PDF, EPS"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1516,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1513,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1518:12","data-component-name":"div",className:"download-option",onClick:()=>p("digital"),"data-testid":"download-digital",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1519:14","data-component-name":"div",className:"icon",children:e.jsxDEV(F,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1519:36","data-component-name":"Monitor",className:"w-10 h-10"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1519,columnNumber:128},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1519,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1520:14","data-component-name":"h4",children:"디지털용"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1520,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1521:14","data-component-name":"p",children:"SVG, PNG, WebP"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1521,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1518,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1523:12","data-component-name":"div",className:"download-option",onClick:()=>p("social"),"data-testid":"download-social",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1524:14","data-component-name":"div",className:"icon",children:e.jsxDEV(C,{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1524:36","data-component-name":"Share2",className:"w-10 h-10"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1524,columnNumber:128},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1524,columnNumber:15},this),e.jsxDEV("h4",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1525:14","data-component-name":"h4",children:"소셜 미디어"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1525,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1526:14","data-component-name":"p",children:"최적화된 배너/프로필"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1526,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1523,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1507,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1504,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1503,columnNumber:7},this),e.jsxDEV("footer",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1532:6","data-component-name":"footer",className:"brand-footer",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1533:8","data-component-name":"p",children:"© 2025-2045 TBURN Foundation. All Rights Reserved."},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1533,columnNumber:9},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1534:8","data-component-name":"p",style:{marginTop:"0.5rem"},children:["브랜드 에셋 사용에 관한 문의: ",e.jsxDEV("a",{"data-replit-metadata":"client/src/public/pages/Brand.tsx:1535:28","data-component-name":"a",href:"mailto:brand@tburn.io",children:"brand@tburn.io"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1535,columnNumber:29},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1534,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:1532,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/Brand.tsx",lineNumber:990,columnNumber:5},this)}export{J as default};
