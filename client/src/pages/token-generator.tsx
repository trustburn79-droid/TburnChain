import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Box,
  PlusCircle,
  List,
  GitBranch,
  Rocket,
  Home,
  CheckCircle2,
  Loader2,
} from "lucide-react";

type TabType = "create" | "myTokens" | "verification";

export default function TokenSystemPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [activeTab, setActiveTab] = useState<TabType>("create");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [decimals, setDecimals] = useState("18");
  
  const [canMint, setCanMint] = useState(false);
  const [canBurn, setCanBurn] = useState(true);
  const [antiBot, setAntiBot] = useState(false);
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  const formatSupply = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString("en-US");
  };

  const getTokenIcon = () => {
    if (tokenSymbol) {
      return tokenSymbol.charAt(0).toUpperCase();
    }
    return "T";
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setShowConsole(true);
    setConsoleLogs([]);
    setDeploySuccess(false);

    const steps = [
      { msg: "> Initializing TBC-20 Factory...", delay: 500 },
      { msg: "> Compiling Smart Contract Bytecode...", delay: 700 },
      { msg: "> Connecting to TBURN Mainnet (ChainID: 882)...", delay: 800 },
      { msg: "> Estimating Gas... <span class='text-emerald-500'>0.00045 TB (Ultra Low)</span>", delay: 800 },
      { msg: "> Signing Transaction with Wallet...", delay: 700 },
      { msg: "> Broadcasting to Mempool...", delay: 700 },
      { msg: "> <span class='text-emerald-500'>[SUCCESS]</span> Block #21,334,102 Confirmed (0.4s)", delay: 800 },
      { msg: "> Contract Address: <span class='text-pink-400'>0x71C...9A21</span>", delay: 200 },
      { msg: "> Verifying Source Code on Explorer...", delay: 800 },
      { msg: "> <span class='text-emerald-500 font-bold'>Token Deployed Successfully!</span>", delay: 500 },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      const timestamp = new Date().toLocaleTimeString();
      setConsoleLogs((prev) => [...prev, `[${timestamp}] ${step.msg}`]);
    }

    setIsDeploying(false);
    setDeploySuccess(true);
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans antialiased ${isDark ? 'bg-[#0B1120] text-[#E2E8F0]' : 'bg-slate-50 text-slate-800'}`}>
      
      <aside className={`w-20 lg:w-64 flex flex-col z-20 transition-all duration-300 border-r ${isDark ? 'bg-[#0F172A] border-gray-800' : 'bg-white border-slate-200'}`}>
        <div className={`h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b ${isDark ? 'border-gray-800' : 'border-slate-100'}`}>
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-blue-500 font-bold text-xl shadow-lg shrink-0 border border-slate-700">
            <Box className="w-5 h-5" />
          </div>
          <div className="hidden lg:block ml-3">
            <h1 className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              TBURN <span className="text-blue-500">Factory</span>
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 py-6 space-y-2 px-3">
          <button
            onClick={() => setActiveTab("create")}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${
              activeTab === "create"
                ? isDark
                  ? 'bg-[#151E32] text-white border-l-4 border-blue-500 shadow-sm'
                  : 'bg-blue-50 text-blue-500 border-l-4 border-blue-500 shadow-sm'
                : isDark
                  ? 'text-gray-400 hover:bg-gray-800'
                  : 'text-slate-500 hover:bg-slate-100'
            }`}
            data-testid="nav-create-token"
          >
            <PlusCircle className="w-6 h-6" />
            <span className="hidden lg:block font-medium">Create Token</span>
          </button>
          <button
            onClick={() => setActiveTab("myTokens")}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${
              activeTab === "myTokens"
                ? isDark
                  ? 'bg-[#151E32] text-white border-l-4 border-blue-500 shadow-sm'
                  : 'bg-blue-50 text-blue-500 border-l-4 border-blue-500 shadow-sm'
                : isDark
                  ? 'text-gray-400 hover:bg-gray-800'
                  : 'text-slate-500 hover:bg-slate-100'
            }`}
            data-testid="nav-my-tokens"
          >
            <List className="w-6 h-6" />
            <span className="hidden lg:block font-medium">My Tokens</span>
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${
              activeTab === "verification"
                ? isDark
                  ? 'bg-[#151E32] text-white border-l-4 border-blue-500 shadow-sm'
                  : 'bg-blue-50 text-blue-500 border-l-4 border-blue-500 shadow-sm'
                : isDark
                  ? 'text-gray-400 hover:bg-gray-800'
                  : 'text-slate-500 hover:bg-slate-100'
            }`}
            data-testid="nav-verification"
          >
            <GitBranch className="w-6 h-6" />
            <span className="hidden lg:block font-medium">Verification</span>
          </button>
        </nav>
      </aside>

      <main className={`flex-1 flex flex-col relative overflow-hidden ${isDark ? 'bg-[#0B1120]' : 'bg-slate-50'} transition-colors duration-300`}>
        
        <header className={`h-16 border-b ${isDark ? 'border-gray-800 bg-[#0B1120]/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-10`}>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-mono ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-slate-200 text-slate-600'}`}>
              Standard: TBC-20
            </span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Audit Verified
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="link-home">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <ThemeToggle />
            <div className="hidden md:flex flex-col items-end">
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Deployer Balance</span>
              <span className={`font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>12,500.00 TB</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth z-0">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                TBC20 Token Generator
              </h1>
              <p className={isDark ? 'text-gray-400' : 'text-slate-500'}>
                코딩 없이 1분 만에 나만의 TBURN 기반 토큰을 생성하고 배포하세요.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-6">
                
                <div className={`backdrop-blur-xl rounded-2xl p-6 ${isDark ? 'bg-[#151E32]/70 border border-white/5' : 'bg-white/90 border border-slate-200'}`}>
                  <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</span>
                    Token Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                        Token Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Super Tburn Token"
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                        className={`rounded-xl px-4 py-3 ${isDark ? 'bg-[#0B1120] border-gray-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        data-testid="input-token-name"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                        Symbol <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. STT"
                        value={tokenSymbol}
                        onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                        className={`rounded-xl px-4 py-3 uppercase ${isDark ? 'bg-[#0B1120] border-gray-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        data-testid="input-token-symbol"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                        Initial Supply <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="1000000"
                        value={initialSupply}
                        onChange={(e) => setInitialSupply(e.target.value)}
                        className={`rounded-xl px-4 py-3 ${isDark ? 'bg-[#0B1120] border-gray-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        data-testid="input-initial-supply"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                        Decimals
                      </label>
                      <Input
                        type="number"
                        value={decimals}
                        onChange={(e) => setDecimals(e.target.value)}
                        className={`rounded-xl px-4 py-3 ${isDark ? 'bg-[#0B1120] border-gray-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        data-testid="input-decimals"
                      />
                    </div>
                  </div>
                </div>

                <div className={`backdrop-blur-xl rounded-2xl p-6 ${isDark ? 'bg-[#151E32]/70 border border-white/5' : 'bg-white/90 border border-slate-200'}`}>
                  <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">2</span>
                    Features & Capabilities
                  </h3>
                  
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Can Mint (Mintable)</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Allows creating more tokens after initial deployment.</p>
                      </div>
                      <Switch
                        checked={canMint}
                        onCheckedChange={setCanMint}
                        data-testid="switch-mintable"
                      />
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Can Burn (Burnable)</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Allows holders to destroy their tokens to reduce supply.</p>
                      </div>
                      <Switch
                        checked={canBurn}
                        onCheckedChange={setCanBurn}
                        data-testid="switch-burnable"
                      />
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Anti-Bot (Limit per Tx)</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Restricts the maximum amount per transaction.</p>
                      </div>
                      <Switch
                        checked={antiBot}
                        onCheckedChange={setAntiBot}
                        data-testid="switch-antibot"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                
                <div className={`backdrop-blur-xl rounded-2xl p-6 sticky top-6 ${isDark ? 'bg-[#151E32]/70 border border-white/5' : 'bg-white/90 border border-slate-200'}`}>
                  <h3 className={`text-sm font-bold mb-4 uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Live Preview
                  </h3>
                  
                  <div className="rounded-2xl p-6 text-white shadow-2xl mb-6 border border-white/10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                    <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] rotate-45 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold border-2 border-white/20">
                        <span data-testid="preview-icon">{getTokenIcon()}</span>
                      </div>
                      <span className="bg-black/30 backdrop-blur-md px-2 py-1 rounded text-xs font-mono border border-white/10">TBC-20</span>
                    </div>
                    <div className="mb-1 relative z-10">
                      <p className="text-xs text-gray-400">Total Supply</p>
                      <p className="text-2xl font-mono font-bold tracking-tight" data-testid="preview-supply">
                        {formatSupply(initialSupply)}
                      </p>
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-lg font-bold" data-testid="preview-name">{tokenName || "Token Name"}</h4>
                      <p className="text-sm text-blue-400 font-bold" data-testid="preview-symbol">{tokenSymbol || "SYMBOL"}</p>
                    </div>
                    <div className="absolute bottom-4 right-4 text-white/5 text-6xl font-bold select-none">TBC</div>
                  </div>

                  <div className={`rounded-xl p-4 mb-6 border ${isDark ? 'bg-[#0B1120] border-gray-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className={isDark ? 'text-gray-500' : 'text-slate-500'}>Service Fee</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>100 TB</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className={isDark ? 'text-gray-500' : 'text-slate-500'}>Gas Fee (Est.)</span>
                      <span className="font-bold text-emerald-500">$0.001</span>
                    </div>
                    <div className={`border-t my-2 pt-2 flex justify-between ${isDark ? 'border-gray-700' : 'border-slate-200'}`}>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Total</span>
                      <span className="font-bold text-blue-500 text-lg">100.001 TB</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleDeploy}
                    disabled={isDeploying || !tokenName || !tokenSymbol || !initialSupply}
                    className={`w-full py-6 text-lg font-bold shadow-lg transition-all transform hover:scale-[1.02] ${
                      deploySuccess
                        ? 'bg-gradient-to-r from-green-600 to-green-500'
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-500/30'
                    }`}
                    data-testid="button-deploy"
                  >
                    {isDeploying ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Deploying...
                      </>
                    ) : deploySuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Done
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5 mr-2" />
                        Deploy Token
                      </>
                    )}
                  </Button>
                  <p className={`text-center text-xs mt-4 ${isDark ? 'text-gray-400' : 'text-slate-400'}`}>
                    By deploying, you agree to the <a href="#" className="text-blue-500 hover:underline">Terms of Service</a>.
                  </p>
                </div>
              </div>
            </div>

            {showConsole && (
              <div className="mt-8">
                <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-slate-700 bg-[#0B1120]' : 'border-slate-300 bg-slate-900'}`}>
                  <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs text-slate-400 font-mono">Terminal - Deploying to TBURN Mainnet</span>
                  </div>
                  <div className="p-4 font-mono text-sm text-slate-300 space-y-1 h-48 overflow-y-auto" data-testid="console-logs">
                    {consoleLogs.map((log, index) => (
                      <div key={index} dangerouslySetInnerHTML={{ __html: log }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
