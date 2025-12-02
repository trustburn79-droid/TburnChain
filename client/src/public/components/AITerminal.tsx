import { useEffect, useState, useRef } from "react";

const logMessages = [
  "Burn protocol initiated...",
  "Wallet signature verified.",
  "Validating shard #89X...",
  "Optimizing gas routes...",
  "Syncing neural nodes...",
  "Cross-chain bridge active.",
  "Trust score: 98.4/100",
  "Block #13,080,921 confirmed.",
  "Validator consensus reached.",
  "AI model weights updated.",
  "Liquidity pool rebalanced.",
  "Governance proposal #847 processed.",
  "DEX swap executed: 0.001s",
  "Shard migration complete.",
  "Auto-burn: 1,247 TBURN",
];

function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

interface LogEntry {
  id: number;
  time: string;
  message: string;
  isNew: boolean;
}

export function AITerminal() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const addLog = () => {
      const randomMessage = logMessages[Math.floor(Math.random() * logMessages.length)];
      const newLog: LogEntry = {
        id: idRef.current++,
        time: getCurrentTime(),
        message: randomMessage,
        isNew: true,
      };

      setLogs((prev) => {
        const updated = prev.map((log) => ({ ...log, isNew: false }));
        return [...updated, newLog].slice(-6);
      });
    };

    addLog();
    setTimeout(() => addLog(), 300);
    setTimeout(() => addLog(), 600);

    const interval = setInterval(addLog, 1500 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 hidden lg:block"
      style={{ width: "320px" }}
      data-testid="terminal-ai"
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(60, 60, 60, 0.6)",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            background: "rgba(15, 22, 28, 0.98)",
            padding: "5px 8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(40, 55, 65, 0.5)",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "#6a8a9a",
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              letterSpacing: "0.3px",
            }}
          >
            BURN_AI_CORE v4.0
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#ff5f56",
              }}
            />
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#ffbd2e",
              }}
            />
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#27ca40",
              }}
            />
          </div>
        </div>

        {/* Terminal Content */}
        <div
          style={{
            padding: "6px 8px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            overflow: "hidden",
          }}
        >
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                fontSize: "12px",
                lineHeight: "1.5",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                animation: log.isNew ? "fadeInLog 0.4s ease-out" : "none",
              }}
            >
              <span style={{ color: "#5a7a8a" }}>[{log.time}]</span>
              <span style={{ color: "#a0b8c8" }}> {">"} </span>
              <span style={{ color: "#00f0ff" }}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInLog {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
