import { useEffect, useState, useRef } from "react";

const logMessages = [
  "Initializing neural handshake...",
  "Validating shard #89X blocks...",
  "Optimizing gas routes (Layer 2)...",
  "AI Trust Score updated: 99.2%",
  "Burn protocol executing...",
  "Wallet signature verified.",
  "Cross-chain bridge connected.",
  "Syncing with mainnet nodes...",
  "Quantum encryption active.",
  "Governance proposal indexed.",
  "Detecting MEV bots... Blocked.",
  "Asset liquidity rebalancing...",
  "Verifying ZK-proofs...",
];

function getCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-US", { hour12: false });
}

interface LogEntry {
  id: number;
  time: string;
  message: string;
}

export function AITerminal() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const idRef = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const addLog = () => {
      const randomMessage = logMessages[Math.floor(Math.random() * logMessages.length)];
      const newLog: LogEntry = {
        id: idRef.current++,
        time: getCurrentTime(),
        message: randomMessage,
      };

      setLogs((prev) => {
        const updated = [...prev, newLog];
        if (updated.length > 20) {
          return updated.slice(-20);
        }
        return updated;
      });

      const nextInterval = Math.random() * 2000 + 500;
      setTimeout(addLog, nextInterval);
    };

    addLog();
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed bottom-6 right-6 w-80 z-50 hidden lg:block">
      <div className="rounded-lg overflow-hidden border border-gray-700 bg-[#0a0a0f]/90 backdrop-blur-md shadow-2xl">
        
        {/* Header */}
        <div className="bg-gray-800/50 px-4 py-2 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-mono tracking-wider">BURN_AI_CORE v4.0</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-4 h-40 relative group">
          <div 
            ref={contentRef}
            className="h-full overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 flex flex-col justify-end"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="animate-fade-in"
              >
                <span className="text-gray-500 mr-2 tracking-wider">[{log.time}]</span>
                <span className="text-gray-200 mr-1">{">"}</span>
                <span className="text-[#00f0ff]">{log.message}</span>
              </div>
            ))}
          </div>

          {/* CRT Scanline Effect */}
          <div 
            className="absolute inset-0 pointer-events-none z-10 opacity-20"
            style={{
              background: "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%), linear-gradient(90deg, rgba(255,0,0,0.03), rgba(0,255,0,0.01), rgba(0,0,255,0.03))",
              backgroundSize: "100% 2px, 3px 100%",
            }}
          ></div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
