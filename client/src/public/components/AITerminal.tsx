import { useEffect, useState, useRef } from "react";

const aiMessages = [
  { type: "info", text: "[CORE] Neural network initialized" },
  { type: "success", text: "[OK] Trust score validation: PASSED" },
  { type: "info", text: "[AI] Processing governance proposal #847" },
  { type: "warning", text: "[SCAN] Analyzing cross-chain bridge tx..." },
  { type: "success", text: "[DEX] Liquidity pool rebalanced" },
  { type: "info", text: "[SHARD] Dynamic sharding: 128 active" },
  { type: "success", text: "[BLOCK] New block #13,080,921 confirmed" },
  { type: "info", text: "[VALIDATOR] 30,247 nodes online" },
  { type: "success", text: "[BURN] Auto-burn executed: 1,247 TBURN" },
  { type: "info", text: "[AI] Model weights updated successfully" },
];

export function AITerminal() {
  const [logs, setLogs] = useState<Array<{ type: string; text: string; id: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    const addLog = () => {
      const randomMessage = aiMessages[Math.floor(Math.random() * aiMessages.length)];
      const newLog = { ...randomMessage, id: idRef.current++ };
      
      setLogs(prev => {
        const updated = [...prev, newLog];
        return updated.slice(-5);
      });
    };

    addLog();
    addLog();
    addLog();

    const interval = setInterval(addLog, 2000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const getLogColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-brand-cyan";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 z-50 hidden lg:block" data-testid="terminal-ai">
      <div className="terminal-window rounded-lg overflow-hidden">
        <div className="bg-gray-900 px-3 py-1 flex justify-between items-center border-b border-gray-800">
          <span className="text-[10px] text-gray-400 font-mono">BURN_AI_CORE v4.0</span>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </div>
        <div className="p-3 h-32 overflow-hidden relative">
          <div
            ref={containerRef}
            className="space-y-1 font-mono flex flex-col justify-end h-full"
          >
            {logs.map((log) => (
              <div key={log.id} className={`log-entry ${getLogColor(log.type)}`}>
                {log.text}
              </div>
            ))}
          </div>
          <div className="terminal-scanlines absolute inset-0 pointer-events-none z-10"></div>
        </div>
      </div>
    </div>
  );
}
