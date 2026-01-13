export default function BusinessCard() {
  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto'
      }}
    >
      <div 
        className="slide-container"
        style={{
          width: '1280px',
          height: '720px',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#050505',
          color: '#ffffff',
          overflow: 'hidden',
          fontFamily: "'Nanum Gothic Coding', monospace"
        }}
      >
        <link href="https://fonts.googleapis.com/css2?family=Nanum+Gothic+Coding:wght@400;700&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        
        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>

        {/* LEFT PANEL: Brand Visual */}
        <div 
          style={{
            flex: '0 0 38%',
            position: 'relative',
            backgroundColor: '#1a1000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            borderRight: '1px solid rgba(255, 184, 0, 0.1)'
          }}
        >
          {/* Glow effects */}
          <div style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            backgroundColor: '#FF8A00',
            borderRadius: '50%',
            filter: 'blur(120px)',
            opacity: 0.2,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0
          }} />
          <div style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            backgroundColor: '#FFB800',
            borderRadius: '50%',
            filter: 'blur(100px)',
            opacity: 0.15,
            top: '20%',
            left: '20%',
            zIndex: 0
          }} />
          
          {/* Geometric shapes */}
          <div style={{
            position: 'absolute',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: '300px',
            height: '300px',
            top: '-50px',
            left: '-50px',
            transform: 'rotate(45deg)',
            zIndex: 1
          }} />
          <div style={{
            position: 'absolute',
            border: '1px solid rgba(255, 138, 0, 0.2)',
            width: '200px',
            height: '200px',
            bottom: '50px',
            right: '-50px',
            transform: 'rotate(15deg)',
            zIndex: 1
          }} />

          {/* Left content */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
            <img 
              alt="TBURN Logo" 
              src="https://www.genspark.ai/api/files/s/vZ1uWnOR"
              style={{
                width: '160px',
                height: '160px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 20px rgba(255, 138, 0, 0.4))',
                marginBottom: '20px'
              }}
            />
            <h2 style={{
              fontFamily: "'Noto Sans KR', sans-serif",
              fontWeight: 900,
              fontSize: '1.8rem',
              letterSpacing: '-0.02em',
              color: '#fff',
              margin: 0
            }}>TBURN MAINNET</h2>
            <span style={{
              display: 'inline-block',
              marginTop: '10px',
              padding: '4px 12px',
              border: '1px solid rgba(255, 184, 0, 0.5)',
              borderRadius: '50px',
              color: '#FFB800',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              backgroundColor: 'rgba(0,0,0,0.3)'
            }}>Core Development Team</span>
          </div>
        </div>

        {/* RIGHT PANEL: Developer Info */}
        <div style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#0d0d0d',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px'
        }}>
          {/* Code pattern background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.05,
            pointerEvents: 'none',
            zIndex: 0,
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '14px',
            lineHeight: '20px',
            color: '#FFB800',
            overflow: 'hidden',
            whiteSpace: 'pre',
            padding: '20px'
          }}>
{`01011001 TBURN 1010001 BLOCKCHAIN 11010100
HASH: 0x4f3a2b1c DECENTRALIZED 101010101
SMART_CONTRACT_INIT() => TRUE 00110011
GAS_LIMIT: 21000 MAX_SUPPLY: UNLIMITED
CONSENSUS: PROOF_OF_STAKE 111000111
01011001 TBURN 1010001 BLOCKCHAIN 11010100
HASH: 0x4f3a2b1c DECENTRALIZED 101010101
SMART_CONTRACT_INIT() => TRUE 00110011
GAS_LIMIT: 21000 MAX_SUPPLY: UNLIMITED
CONSENSUS: PROOF_OF_STAKE 111000111`}
          </div>

          <div style={{ position: 'relative', zIndex: 10 }}>
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
              <p style={{
                fontSize: '1.2rem',
                color: '#FF8A00',
                fontWeight: 700,
                marginBottom: '5px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {'>'} Chairman of the TBURN Foundation
                <span style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '20px',
                  backgroundColor: '#FF8A00',
                  marginLeft: '5px',
                  animation: 'blink 1s infinite'
                }} />
              </p>
              <h1 style={{
                fontSize: '3.5rem',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.1,
                marginBottom: '20px',
                margin: 0
              }}>Kevin JEONG</h1>
            </div>

            {/* Tech Stack */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
              {[
                { icon: 'fas fa-cube', name: 'Solidity' },
                { icon: 'fas fa-cogs', name: 'Rust' },
                { icon: 'fab fa-js', name: 'TypeScript' },
                { icon: 'fas fa-shield-alt', name: 'Security' }
              ].map((tech) => (
                <div key={tech.name} style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ccc',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <i className={tech.icon} style={{ marginRight: '8px', color: '#FFB800' }} />
                  {tech.name}
                </div>
              ))}
            </div>

            {/* Terminal Window */}
            <div style={{
              backgroundColor: '#151515',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              fontSize: '1rem',
              lineHeight: 1.8,
              color: '#a0a0a0',
              width: '100%'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '1px solid #222'
              }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', marginRight: '6px', backgroundColor: '#FF5F56' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', marginRight: '6px', backgroundColor: '#FFBD2E' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', marginRight: '6px', backgroundColor: '#27C93F' }} />
                <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#666' }}>contact_info.json</span>
              </div>
              <div style={{ display: 'flex', marginBottom: '5px' }}>
                <span style={{ color: '#FF8A00', marginRight: '10px', fontWeight: 'bold' }}>$</span>
                <span style={{ color: '#d8dee9' }}>cat profile.json</span>
              </div>
              <div style={{ marginTop: '10px' }}>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#88c0d0' }}>"email"</span>: <span style={{ color: '#a3be8c' }}>"founder@tburn.io"</span>,</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#88c0d0' }}>"github"</span>: <span style={{ color: '#a3be8c' }}>"@tburnceo"</span>,</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#88c0d0' }}>"telegram"</span>: <span style={{ color: '#a3be8c' }}>"@tburnio"</span>,</p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#88c0d0' }}>"website"</span>: <span style={{ color: '#a3be8c' }}>"tburn.io"</span> <span style={{ color: '#555' }}>// TBURN Mainnet</span></p>
                <p style={{ margin: '2px 0' }}><span style={{ color: '#88c0d0' }}>"Mobile"</span>: <span style={{ color: '#a3be8c' }}>"+82-10-9878-3167"</span></p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            background: '#fff',
            padding: '8px',
            borderRadius: '4px'
          }}>
            <svg style={{ width: '80px', height: '80px', display: 'block' }} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect fill="#fff" height="100" width="100" />
              <path d="M0,0 h100 v100 h-100 z M10,10 h80 v80 h-80 z" fill="#fff" />
              <rect fill="#000" height="30" width="30" x="10" y="10" />
              <rect fill="#000" height="30" width="30" x="60" y="10" />
              <rect fill="#000" height="30" width="30" x="10" y="60" />
              <rect fill="#000" height="20" width="20" x="45" y="45" />
              <rect fill="#000" height="10" width="10" x="65" y="65" />
              <rect fill="#000" height="10" width="10" x="80" y="50" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
