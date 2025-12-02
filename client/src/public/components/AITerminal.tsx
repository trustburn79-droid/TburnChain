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

      setTimeout(addLog, 2000);
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
        
        {/* Header - 원본 그대로 */}
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

        {/* Terminal Content - 원본: p-4 h-40 */}
        <div className="p-4 h-40 relative group">
          <div 
            ref={contentRef}
            className="h-full overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 no-scrollbar flex flex-col justify-end"
          >
            {logs.map((log) => (
              <div key={log.id} className="animate-fade-in">
                <span className="text-gray-500 mr-1">[{log.time}]</span>
                <span className="text-gray-400 mr-1">{">"}</span>
                <span className="text-[#00f0ff] drop-shadow-[0_0_2px_rgba(0,240,255,0.5)]">{log.message}</span>
              </div>
            ))}
          </div>

          {/* CRT Scanline Effect - 원본 그대로 */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
