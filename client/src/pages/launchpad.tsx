import { useState, useEffect } from "react";
import { TBurnLogo } from "@/components/tburn-logo";
import { useQuery } from "@tanstack/react-query";
import { useWeb3 } from "@/lib/web3-context";
import { useToast } from "@/hooks/use-toast";

interface LaunchpadPlatform {
  name: string;
  status: string;
  totalProjects: number;
  totalRaised: string;
  avgRoi: string;
  participants: number;
  upcomingIdo: number;
}

interface LaunchpadStatsData {
  platforms: LaunchpadPlatform[];
  totalLaunchpadRaised: string;
  averageRoi: string;
}

interface LaunchpadStatsResponse {
  success: boolean;
  data: LaunchpadStatsData;
}

export default function LaunchpadPage() {
  const { isConnected, address, connect, disconnect, formatAddress } = useWeb3();
  const { toast } = useToast();
  const [isKYCVerified, setIsKYCVerified] = useState(false);
  const [currentStep, setCurrentStep] = useState(isConnected ? 2 : 1);
  const [selectedPayment, setSelectedPayment] = useState("usdt");
  const [investAmount, setInvestAmount] = useState(1000);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<"pending" | "success" | "error">("pending");
  const [countdown, setCountdown] = useState({ days: 14, hours: 8, minutes: 32, seconds: 45 });
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const { data: response, isLoading: isLoadingStats } = useQuery<LaunchpadStatsResponse>({
    queryKey: ['/api/token-programs/launchpad/stats'],
  });
  const launchpadStats = response?.data;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleFaq = (faqId: string) => {
    setActiveFaq(activeFaq === faqId ? null : faqId);
  };

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
      toast({ title: "지갑 연결 해제", description: "지갑 연결이 해제되었습니다." });
    } else {
      connect("metamask");
      toast({ title: "지갑 연결", description: "MetaMask 연결을 시도합니다." });
    }
  };

  const handleShareSocial = (platform: string, url: string) => {
    window.open(url, '_blank');
    toast({ title: `${platform} 열기`, description: `${platform} 페이지로 이동합니다.` });
  };

  useEffect(() => {
    if (isConnected) {
      setCurrentStep(2);
    }
  }, [isConnected]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) { days = 0; hours = 0; minutes = 0; seconds = 0; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const tokenPrice = 0.02;
  const listingPrice = 0.08;
  
  const getBonusInfo = (amount: number) => {
    if (amount >= 50000) return { percent: 5, tier: "Whale", icon: "🐋" };
    if (amount >= 10000) return { percent: 3, tier: "Dolphin", icon: "🐬" };
    if (amount >= 1000) return { percent: 1, tier: "Fish", icon: "🐟" };
    return { percent: 0, tier: "Shrimp", icon: "🦐" };
  };

  const bonusInfo = getBonusInfo(investAmount);
  const baseTokens = investAmount / tokenPrice;
  const bonusTokens = baseTokens * (bonusInfo.percent / 100);
  const totalTokens = baseTokens + bonusTokens;
  const tgeTokens = totalTokens * 0.15;
  const estimatedValue = totalTokens * listingPrice;

  const handleConnectWallet = async (walletType: string = "metamask") => {
    await connect("metamask");
    toast({ title: "지갑 연결", description: `${walletType} 연결을 시도합니다.` });
  };

  const handleKYC = () => {
    if (!isConnected) {
      toast({ 
        title: "지갑 연결 필요", 
        description: "KYC 인증을 위해 먼저 지갑을 연결해주세요.", 
        variant: "destructive" 
      });
      return;
    }
    toast({ title: "KYC 인증 시작", description: "본인 인증을 진행합니다..." });
    setTimeout(() => {
      setIsKYCVerified(true);
      setCurrentStep(3);
      toast({ title: "KYC 인증 완료", description: "본인 인증이 성공적으로 완료되었습니다." });
    }, 1500);
  };

  const handlePurchase = () => {
    if (!isConnected) {
      toast({ 
        title: "지갑 연결 필요", 
        description: "토큰 구매를 위해 먼저 지갑을 연결해주세요.", 
        variant: "destructive" 
      });
      return;
    }
    if (!isKYCVerified) {
      toast({ 
        title: "KYC 인증 필요", 
        description: "토큰 구매를 위해 KYC 인증을 완료해주세요.", 
        variant: "destructive" 
      });
      return;
    }
    if (investAmount < 100) {
      toast({ 
        title: "최소 금액 미달", 
        description: "최소 참여 금액은 $100입니다.", 
        variant: "destructive" 
      });
      return;
    }
    setShowModal(true);
    setModalStatus("pending");
    toast({ title: "구매 진행중", description: "트랜잭션을 처리합니다..." });
    
    setTimeout(() => {
      setModalStatus("success");
      setCurrentStep(4);
      toast({ title: "구매 완료", description: `${totalTokens.toLocaleString()} TBURN 토큰을 성공적으로 구매했습니다.` });
    }, 3000);
  };

  const handleViewDetails = () => {
    scrollToSection('sale-info');
    toast({ title: "세일 상세 정보", description: "아래에서 세일 상세 정보를 확인하세요." });
  };

  const handleSelectTier = (tierName: string, bonus: string) => {
    if (!isConnected) {
      toast({ 
        title: "지갑 연결 필요", 
        description: "티어 참여를 위해 먼저 지갑을 연결해주세요.", 
        variant: "destructive" 
      });
      return;
    }
    toast({ title: `${tierName} 티어 선택`, description: `보너스: ${bonus}` });
    scrollToSection('purchase');
  };

  const tiers = [
    { id: "whale", icon: "🐋", name: "Whale", bonus: "+5%", range: "$50,000 이상" },
    { id: "dolphin", icon: "🐬", name: "Dolphin", bonus: "+3%", range: "$10,000 ~ $49,999" },
    { id: "fish", icon: "🐟", name: "Fish", bonus: "+1%", range: "$1,000 ~ $9,999" },
    { id: "shrimp", icon: "🦐", name: "Shrimp", bonus: "-", range: "$100 ~ $999" },
  ];

  const saleInfo = [
    { label: "토큰 가격", value: "$0.020", highlight: true },
    { label: "총 세일 물량", value: "6억 TBURN" },
    { label: "최소 참여", value: "$100" },
    { label: "TGE 해제", value: "15%", success: true },
    { label: "클리프", value: "3개월" },
    { label: "베스팅", value: "12개월" },
    { label: "네트워크", value: "Ethereum" },
  ];

  const features = [
    "TBURN Foundation 공식 보장",
    "안전한 스마트 컨트랙트",
    "모든 티어 보너스 적용",
    "24/7 고객 지원",
    "실시간 토큰 클레임",
  ];

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  return (
    <div className="launchpad-page">
      <style>{`
        .launchpad-page {
          --gold: #D4AF37;
          --dark: #0F172A;
          --dark-card: #1E293B;
          --dark-lighter: #334155;
          --gray: #64748B;
          --light-gray: #94A3B8;
          --white: #FFFFFF;
          --success: #22C55E;
          --warning: #F59E0B;
          --danger: #EF4444;
          --purple: #8B5CF6;
          --blue: #3B82F6;
          --cyan: #06B6D4;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%);
          --gradient-blue: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          --gradient-success: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
          
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: var(--white);
          line-height: 1.6;
          min-height: 100vh;
        }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); } 50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes slideIn { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }

        .lp-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .logo-icon {
          width: 44px;
          height: 44px;
          background: var(--gradient-gold);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text { font-size: 1.25rem; font-weight: 800; color: var(--white); }
        .logo-text span { color: var(--gold); }

        .header-right { display: flex; align-items: center; gap: 1.5rem; }

        .header-stats { display: flex; gap: 2rem; }

        .header-stat { text-align: right; }
        .header-stat .label { font-size: 0.7rem; color: var(--gray); text-transform: uppercase; }
        .header-stat .value { font-size: 0.9rem; font-weight: 700; color: var(--white); }
        .header-stat .value.live { color: var(--success); }

        .wallet-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          background: var(--gradient-blue);
          border: none;
          border-radius: 12px;
          color: var(--white);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .wallet-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }

        .wallet-btn.connected {
          background: var(--dark-card);
          border: 1px solid var(--success);
        }

        .main-content {
          padding: 100px 2rem 60px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .sale-header { text-align: center; margin-bottom: 3rem; }

        .official-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.4);
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.85rem;
          color: var(--success);
          margin-bottom: 1.5rem;
        }

        .sale-header h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 0.75rem; }

        .sale-header h1 .highlight {
          background: var(--gradient-blue);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sale-header p { color: var(--light-gray); font-size: 1.1rem; }

        .countdown-section {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05));
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .countdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .countdown-title { display: flex; align-items: center; gap: 10px; }
        .countdown-title h3 { font-size: 1.125rem; font-weight: 700; }

        .live-dot {
          width: 10px;
          height: 10px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .sale-phase {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(34, 197, 94, 0.2);
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--success);
        }

        .countdown-timer {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .countdown-item { text-align: center; }

        .countdown-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--white);
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.75rem 1.25rem;
          min-width: 80px;
        }

        .countdown-unit { font-size: 0.75rem; color: var(--gray); margin-top: 0.5rem; text-transform: uppercase; }

        .progress-section {
          background: var(--dark-card);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .progress-header .raised { font-size: 1.5rem; font-weight: 800; color: var(--blue); }
        .progress-header .goal { color: var(--gray); }

        .progress-bar-container {
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--gradient-blue);
          border-radius: 100px;
          width: 45%;
          position: relative;
        }

        .progress-bar-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .progress-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .progress-stats .percent { color: var(--blue); font-weight: 700; }
        .progress-stats .tokens { color: var(--light-gray); }

        .launchpad-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
          margin-top: 2rem;
        }

        .purchase-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
        }

        .purchase-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .purchase-header h3 { font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 10px; }

        .purchase-body { padding: 1.5rem; }

        .steps-indicator {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          position: relative;
        }

        .steps-indicator::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 40px;
          right: 40px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
        }

        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          background: var(--dark);
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
        }

        .step-item.completed .step-number {
          background: var(--success);
          border-color: var(--success);
        }

        .step-item.active .step-number {
          background: var(--blue);
          border-color: var(--blue);
          animation: glow 2s infinite;
        }

        .step-label { font-size: 0.75rem; color: var(--gray); text-align: center; }
        .step-item.completed .step-label, .step-item.active .step-label { color: var(--white); }

        .form-section { margin-bottom: 1.5rem; animation: slideIn 0.3s ease; }

        .form-section-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--light-gray);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wallet-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px dashed rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
        }

        .wallet-section.connected {
          border-style: solid;
          border-color: var(--success);
          background: rgba(34, 197, 94, 0.05);
        }

        .wallet-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .wallet-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 1.25rem;
          background: var(--dark);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .wallet-option:hover {
          border-color: var(--blue);
          transform: translateY(-3px);
        }

        .wallet-option .icon { font-size: 2rem; }
        .wallet-option span { font-size: 0.85rem; font-weight: 600; }

        .connected-wallet {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .connected-wallet .avatar {
          width: 50px;
          height: 50px;
          background: var(--gradient-blue);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .connected-wallet .info h4 { font-size: 1rem; font-weight: 700; color: var(--success); }
        .connected-wallet .info p { font-size: 0.85rem; color: var(--gray); font-family: monospace; }

        .kyc-section {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .kyc-status { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }

        .kyc-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .kyc-icon.pending { background: rgba(245, 158, 11, 0.2); color: var(--warning); }
        .kyc-icon.verified { background: rgba(34, 197, 94, 0.2); color: var(--success); }

        .kyc-info h4 { font-size: 1rem; font-weight: 700; }
        .kyc-info p { font-size: 0.85rem; color: var(--gray); }

        .kyc-btn {
          display: block;
          width: 100%;
          padding: 12px;
          background: var(--gradient-blue);
          border: none;
          border-radius: 10px;
          color: var(--white);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .kyc-btn:hover { transform: scale(1.02); }
        .kyc-btn.verified { background: var(--success); cursor: default; }

        .amount-section {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .amount-input-group { position: relative; margin-bottom: 1rem; }

        .amount-input {
          width: 100%;
          padding: 1.25rem 1rem;
          padding-right: 100px;
          background: var(--dark);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--white);
          font-size: 1.5rem;
          font-weight: 700;
          transition: border-color 0.3s;
        }

        .amount-input:focus { outline: none; border-color: var(--blue); }

        .amount-currency {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--dark-lighter);
          border-radius: 8px;
        }

        .amount-currency .icon { font-size: 1.25rem; }
        .amount-currency span { font-size: 0.9rem; font-weight: 600; }

        .quick-amounts { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }

        .quick-amount {
          flex: 1;
          min-width: 60px;
          padding: 10px;
          background: var(--dark);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--light-gray);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .quick-amount:hover, .quick-amount.active {
          border-color: var(--blue);
          color: var(--blue);
          background: rgba(59, 130, 246, 0.1);
        }

        .token-output {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05));
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          margin-top: 1rem;
        }

        .token-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .token-row:last-child { border-bottom: none; }
        .token-row .label { color: var(--gray); font-size: 0.9rem; }
        .token-row .value { font-weight: 700; }
        .token-row .value.highlight { color: var(--blue); font-size: 1.25rem; }
        .token-row .value.bonus { color: var(--success); }
        .token-row .value.gold { color: var(--gold); }

        .payment-methods {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .payment-method {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 1rem;
          background: var(--dark);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .payment-method:hover { border-color: rgba(255, 255, 255, 0.3); }
        .payment-method.active { border-color: var(--blue); background: rgba(59, 130, 246, 0.1); }
        .payment-method .icon { font-size: 1.5rem; }
        .payment-method span { font-size: 0.85rem; font-weight: 600; }

        .purchase-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 18px;
          background: var(--gradient-blue);
          border: none;
          border-radius: 14px;
          color: var(--white);
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 1.5rem;
        }

        .purchase-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(59, 130, 246, 0.3);
        }

        .purchase-btn:disabled { background: var(--gray); cursor: not-allowed; }

        .info-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }

        .info-card {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
        }

        .info-card-header {
          padding: 1.25rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), transparent);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-card-header h4 { font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }

        .info-card-body { padding: 1.25rem; }

        .token-info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .token-info-item:last-child { border-bottom: none; }
        .token-info-item .label { color: var(--gray); font-size: 0.9rem; }
        .token-info-item .value { font-weight: 600; font-size: 0.9rem; }
        .token-info-item .value.highlight { color: var(--blue); }
        .token-info-item .value.success { color: var(--success); }

        .tier-card {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 0.75rem;
        }

        .tier-card:last-child { margin-bottom: 0; }
        .tier-card.active { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); }

        .tier-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .tier-name { display: flex; align-items: center; gap: 8px; font-weight: 700; }
        .tier-name .icon { font-size: 1.25rem; }

        .tier-bonus {
          padding: 4px 10px;
          background: rgba(34, 197, 94, 0.2);
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--success);
        }

        .tier-bonus.disabled { background: rgba(100,116,139,0.2); color: var(--gray); }

        .tier-range { font-size: 0.85rem; color: var(--gray); }

        .vesting-visual { display: flex; flex-direction: column; gap: 1rem; }

        .vesting-item { display: flex; align-items: center; gap: 1rem; }

        .vesting-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--blue);
          position: relative;
        }

        .vesting-dot::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 100%;
          width: 2px;
          height: 30px;
          background: rgba(59, 130, 246, 0.3);
          transform: translateX(-50%);
        }

        .vesting-item:last-child .vesting-dot::after { display: none; }
        .vesting-item.tge .vesting-dot { background: var(--success); }
        .vesting-item.cliff .vesting-dot { background: var(--warning); }

        .vesting-info { flex: 1; }
        .vesting-info .title { font-weight: 600; font-size: 0.9rem; }
        .vesting-info .desc { font-size: 0.8rem; color: var(--gray); }
        .vesting-amount { font-weight: 700; color: var(--blue); }

        .features-list { display: flex; flex-direction: column; gap: 0.75rem; }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }

        .feature-check { color: var(--success); font-size: 0.9rem; }
        .feature-item span { font-size: 0.9rem; }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .modal {
          background: var(--dark-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          width: 100%;
          max-width: 480px;
          overflow: hidden;
          animation: slideIn 0.3s ease;
        }

        .modal-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 { font-size: 1.25rem; font-weight: 700; }

        .modal-close {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: var(--gray);
          cursor: pointer;
          transition: all 0.3s;
        }

        .modal-close:hover { background: rgba(255, 255, 255, 0.1); color: var(--white); }

        .modal-body { padding: 2rem; text-align: center; }

        .tx-status-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
        }

        .tx-status-icon.pending { background: rgba(59, 130, 246, 0.2); color: var(--blue); }
        .tx-status-icon.success { background: rgba(34, 197, 94, 0.2); color: var(--success); }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(59, 130, 246, 0.3);
          border-top-color: var(--blue);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .modal-body h4 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
        .modal-body p { color: var(--gray); margin-bottom: 1.5rem; }

        .tx-details {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .tx-detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.9rem; }
        .tx-detail-row .label { color: var(--gray); }
        .tx-detail-row .value { font-weight: 600; }

        .modal-btn {
          display: block;
          width: 100%;
          padding: 14px;
          background: var(--gradient-blue);
          border: none;
          border-radius: 12px;
          color: var(--white);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .modal-btn:hover { transform: scale(1.02); }

        .footer {
          margin-top: 4rem;
          padding: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .footer-links { display: flex; justify-content: center; gap: 2rem; margin-bottom: 1rem; }
        .footer-links a { color: var(--gray); text-decoration: none; font-size: 0.9rem; transition: color 0.3s; }
        .footer-links a:hover { color: var(--blue); }
        .footer p { color: var(--gray); font-size: 0.85rem; }

        @media (max-width: 1024px) {
          .launchpad-grid { grid-template-columns: 1fr; }
          .header-stats { display: none; }
        }

        @media (max-width: 768px) {
          .main-content { padding: 90px 1rem 40px; }
          .countdown-timer { gap: 0.75rem; flex-wrap: wrap; }
          .countdown-value { font-size: 1.75rem; padding: 0.5rem 0.75rem; min-width: 60px; }
          .wallet-options { grid-template-columns: 1fr; }
          .payment-methods { grid-template-columns: 1fr; }
          .steps-indicator::before { display: none; }
        }
      `}</style>

      {/* Header */}
      <header className="lp-header">
        <div className="header-container">
          <a href="/" className="logo">
            <div className="logo-icon">
              <TBurnLogo className="w-6 h-6" />
            </div>
            <div className="logo-text">TBURN<span>CHAIN</span></div>
          </a>

          <div className="header-right">
            <div className="header-stats">
              <div className="header-stat">
                <div className="label">상태</div>
                <div className="value live">● LIVE</div>
              </div>
              <div className="header-stat">
                <div className="label">토큰 가격</div>
                <div className="value">$0.020</div>
              </div>
              <div className="header-stat">
                <div className="label">진행률</div>
                <div className="value">45%</div>
              </div>
            </div>

            <button 
              className={`wallet-btn ${isConnected ? 'connected' : ''}`}
              onClick={handleWalletClick}
              data-testid="button-wallet-connect"
            >
              {isConnected ? formatAddress(address || '') : '지갑 연결'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Sale Header */}
        <div className="sale-header">
          <div className="official-badge">
            🛡️ TBURN Foundation 공식 런치패드
          </div>
          <h1>TBURN <span className="highlight">Public Sale</span></h1>
          <p>안전하고 투명한 공식 토큰 세일 플랫폼</p>
        </div>

        {/* Countdown Section */}
        <div className="countdown-section" data-testid="countdown-section">
          <div className="countdown-header">
            <div className="countdown-title">
              <div className="live-dot"></div>
              <h3>세일 종료까지</h3>
            </div>
            <div className="sale-phase">
              🚀 Phase 2 진행 중
            </div>
          </div>

          <div className="countdown-timer">
            <div className="countdown-item">
              <div className="countdown-value">{countdown.days.toString().padStart(2, '0')}</div>
              <div className="countdown-unit">Days</div>
            </div>
            <div className="countdown-item">
              <div className="countdown-value">{countdown.hours.toString().padStart(2, '0')}</div>
              <div className="countdown-unit">Hours</div>
            </div>
            <div className="countdown-item">
              <div className="countdown-value">{countdown.minutes.toString().padStart(2, '0')}</div>
              <div className="countdown-unit">Minutes</div>
            </div>
            <div className="countdown-item">
              <div className="countdown-value">{countdown.seconds.toString().padStart(2, '0')}</div>
              <div className="countdown-unit">Seconds</div>
            </div>
          </div>

          <div className="progress-section" data-testid="fundraise-progress">
            <div className="progress-header">
              <div className="raised">
                {isLoadingStats ? '...' : launchpadStats?.totalLaunchpadRaised || '$5,400,000'}
              </div>
              <div className="goal">목표: $12,000,000</div>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill"></div>
            </div>
            <div className="progress-stats">
              <span className="percent">45% 완료</span>
              <span className="tokens">2.7억 TBURN 판매 · 잔여 3.3억 TBURN</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="launchpad-grid">
          {/* Purchase Card */}
          <div className="purchase-card">
            <div className="purchase-header">
              <h3>🛒 토큰 구매</h3>
            </div>

            <div className="purchase-body">
              {/* Steps Indicator */}
              <div className="steps-indicator">
                <div className={`step-item ${currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : ''}`}>
                  <div className="step-number">{currentStep > 1 ? '✓' : '1'}</div>
                  <div className="step-label">지갑 연결</div>
                </div>
                <div className={`step-item ${currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : ''}`}>
                  <div className="step-number">{currentStep > 2 ? '✓' : '2'}</div>
                  <div className="step-label">KYC 인증</div>
                </div>
                <div className={`step-item ${currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : ''}`}>
                  <div className="step-number">{currentStep > 3 ? '✓' : '3'}</div>
                  <div className="step-label">금액 입력</div>
                </div>
                <div className={`step-item ${currentStep >= 4 ? 'completed' : ''}`}>
                  <div className="step-number">{currentStep >= 4 ? '✓' : '4'}</div>
                  <div className="step-label">구매 완료</div>
                </div>
              </div>

              {/* Wallet Section */}
              <div className="form-section">
                <div className="form-section-title">지갑 연결</div>
                <div className={`wallet-section ${isConnected ? 'connected' : ''}`}>
                  {isConnected ? (
                    <div className="connected-wallet">
                      <div className="avatar">🦊</div>
                      <div className="info">
                        <h4>연결됨</h4>
                        <p>{formatAddress(address || '')}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p style={{ marginBottom: '1rem', color: 'var(--gray)' }}>지갑을 연결하세요</p>
                      <div className="wallet-options">
                        <div className="wallet-option" onClick={() => handleConnectWallet("MetaMask")} data-testid="button-wallet-metamask">
                          <span className="icon">🦊</span>
                          <span>MetaMask</span>
                        </div>
                        <div className="wallet-option" onClick={() => handleConnectWallet("Rabby")} data-testid="button-wallet-rabby">
                          <span className="icon">🐰</span>
                          <span>Rabby</span>
                        </div>
                        <div className="wallet-option" onClick={() => handleConnectWallet("Trust")} data-testid="button-wallet-trust">
                          <span className="icon">💎</span>
                          <span>Trust</span>
                        </div>
                        <div className="wallet-option" onClick={() => handleConnectWallet("Coinbase")} data-testid="button-wallet-coinbase">
                          <span className="icon">🪙</span>
                          <span>Coinbase</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* KYC Section */}
              {isConnected && (
                <div className="form-section">
                  <div className="form-section-title">✅ KYC 인증</div>
                  <div className="kyc-section">
                    <div className="kyc-status">
                      <div className={`kyc-icon ${isKYCVerified ? 'verified' : 'pending'}`}>
                        {isKYCVerified ? '✓' : '⏳'}
                      </div>
                      <div className="kyc-info">
                        <h4>{isKYCVerified ? 'KYC 인증 완료' : 'KYC 인증 필요'}</h4>
                        <p>{isKYCVerified ? '모든 인증이 완료되었습니다' : '간단한 본인 인증을 진행해주세요'}</p>
                      </div>
                    </div>
                    <button 
                      className={`kyc-btn ${isKYCVerified ? 'verified' : ''}`}
                      onClick={handleKYC}
                      disabled={isKYCVerified}
                      data-testid="button-kyc"
                    >
                      {isKYCVerified ? '✓ 인증 완료' : 'KYC 인증하기'}
                    </button>
                  </div>
                </div>
              )}

              {/* Amount Section */}
              {isKYCVerified && (
                <div className="form-section">
                  <div className="form-section-title">💵 참여 금액</div>
                  <div className="amount-section">
                    <div className="amount-input-group">
                      <input 
                        type="number"
                        className="amount-input"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(Number(e.target.value) || 0)}
                        placeholder="금액 입력"
                        data-testid="input-amount"
                      />
                      <div className="amount-currency">
                        <span className="icon">💵</span>
                        <span>USDT</span>
                      </div>
                    </div>

                    <div className="quick-amounts">
                      {quickAmounts.map(amount => (
                        <button 
                          key={amount}
                          className={`quick-amount ${investAmount === amount ? 'active' : ''}`}
                          onClick={() => setInvestAmount(amount)}
                        >
                          ${amount.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    <div className="token-output">
                      <div className="token-row">
                        <span className="label">토큰 수량</span>
                        <span className="value highlight">{baseTokens.toLocaleString()} TBURN</span>
                      </div>
                      <div className="token-row">
                        <span className="label">티어 보너스 ({bonusInfo.icon} {bonusInfo.tier})</span>
                        <span className="value bonus">{bonusInfo.percent > 0 ? `+${bonusTokens.toLocaleString()} TBURN` : '-'}</span>
                      </div>
                      <div className="token-row">
                        <span className="label">총 토큰</span>
                        <span className="value highlight">{totalTokens.toLocaleString()} TBURN</span>
                      </div>
                      <div className="token-row">
                        <span className="label">TGE 해제 (15%)</span>
                        <span className="value">{tgeTokens.toLocaleString()} TBURN</span>
                      </div>
                      <div className="token-row">
                        <span className="label">예상 가치 (@$0.08)</span>
                        <span className="value gold">${estimatedValue.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="form-section-title" style={{ marginTop: '1.5rem' }}>💳 결제 방법</div>
                    <div className="payment-methods">
                      {['usdt', 'usdc', 'eth'].map(method => (
                        <div 
                          key={method}
                          className={`payment-method ${selectedPayment === method ? 'active' : ''}`}
                          onClick={() => setSelectedPayment(method)}
                        >
                          <span className="icon">{method === 'usdt' ? '💵' : method === 'usdc' ? '🔵' : '💎'}</span>
                          <span>{method.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    className="purchase-btn"
                    onClick={handlePurchase}
                    disabled={investAmount < 100}
                    data-testid="button-purchase"
                  >
                    🚀 토큰 구매하기
                  </button>

                  <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--gray)' }}>
                    🔒 안전한 스마트 컨트랙트로 처리됩니다
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="info-sidebar">
            {/* Token Info */}
            <div className="info-card">
              <div className="info-card-header">
                <h4>ℹ️ 세일 정보</h4>
              </div>
              <div className="info-card-body">
                {saleInfo.map((item, idx) => (
                  <div key={idx} className="token-info-item">
                    <span className="label">{item.label}</span>
                    <span className={`value ${item.highlight ? 'highlight' : ''} ${item.success ? 'success' : ''}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier Info */}
            <div className="info-card">
              <div className="info-card-header">
                <h4>🏅 참여 티어</h4>
              </div>
              <div className="info-card-body">
                {tiers.map(tier => (
                  <div key={tier.id} className={`tier-card ${bonusInfo.tier === tier.name ? 'active' : ''}`}>
                    <div className="tier-header">
                      <div className="tier-name">
                        <span className="icon">{tier.icon}</span>
                        <span>{tier.name}</span>
                      </div>
                      <span className={`tier-bonus ${tier.bonus === '-' ? 'disabled' : ''}`}>{tier.bonus}</span>
                    </div>
                    <div className="tier-range">{tier.range}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vesting Schedule */}
            <div className="info-card">
              <div className="info-card-header">
                <h4>📅 베스팅 스케줄</h4>
              </div>
              <div className="info-card-body">
                <div className="vesting-visual">
                  <div className="vesting-item tge">
                    <div className="vesting-dot"></div>
                    <div className="vesting-info">
                      <div className="title">TGE</div>
                      <div className="desc">토큰 생성 시점</div>
                    </div>
                    <div className="vesting-amount">15%</div>
                  </div>
                  <div className="vesting-item cliff">
                    <div className="vesting-dot"></div>
                    <div className="vesting-info">
                      <div className="title">클리프</div>
                      <div className="desc">1~3개월</div>
                    </div>
                    <div className="vesting-amount">0%</div>
                  </div>
                  <div className="vesting-item">
                    <div className="vesting-dot"></div>
                    <div className="vesting-info">
                      <div className="title">베스팅</div>
                      <div className="desc">4~15개월</div>
                    </div>
                    <div className="vesting-amount">85%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="info-card">
              <div className="info-card-header">
                <h4>🛡️ 공식 런치패드 특징</h4>
              </div>
              <div className="info-card-body">
                <div className="features-list">
                  {features.map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <span className="feature-check">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="faq-section" id="faq" style={{ marginTop: '4rem' }}>
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--white)', marginBottom: '0.5rem' }}>자주 묻는 질문</h2>
            <p style={{ color: 'var(--gray)' }}>TBURN 런치패드에 대해 궁금한 점</p>
          </div>

          <div className="faq-container" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div 
              className={`faq-item ${activeFaq === 'faq-1' ? 'active' : ''}`} 
              data-testid="faq-item-1"
              style={{ background: 'var(--dark-card)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
            >
              <div 
                className="faq-question" 
                onClick={() => toggleFaq('faq-1')}
                style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--white)' }}>런치패드 총 판매 규모는 얼마인가요?</h4>
                <span style={{ color: 'var(--gray)', transform: activeFaq === 'faq-1' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </div>
              {activeFaq === 'faq-1' && (
                <div className="faq-answer" style={{ padding: '0 1.25rem 1.25rem', color: 'var(--light-gray)' }}>
                  <p>TBURN 공식 런치패드에서는 총 6억 TBURN (전체 공급량의 6%)이 판매됩니다. 토큰 가격은 $0.02이며, 목표 모금액은 $12,000,000입니다.</p>
                </div>
              )}
            </div>

            <div 
              className={`faq-item ${activeFaq === 'faq-2' ? 'active' : ''}`} 
              data-testid="faq-item-2"
              style={{ background: 'var(--dark-card)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
            >
              <div 
                className="faq-question" 
                onClick={() => toggleFaq('faq-2')}
                style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--white)' }}>참여 자격은 어떻게 되나요?</h4>
                <span style={{ color: 'var(--gray)', transform: activeFaq === 'faq-2' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </div>
              {activeFaq === 'faq-2' && (
                <div className="faq-answer" style={{ padding: '0 1.25rem 1.25rem', color: 'var(--light-gray)' }}>
                  <p>지갑 연결과 KYC 인증을 완료한 모든 사용자가 참여할 수 있습니다. 최소 참여 금액은 $100이며, 최대 한도는 없습니다.</p>
                </div>
              )}
            </div>

            <div 
              className={`faq-item ${activeFaq === 'faq-3' ? 'active' : ''}`} 
              data-testid="faq-item-3"
              style={{ background: 'var(--dark-card)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
            >
              <div 
                className="faq-question" 
                onClick={() => toggleFaq('faq-3')}
                style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--white)' }}>티어별 보너스는 어떻게 적용되나요?</h4>
                <span style={{ color: 'var(--gray)', transform: activeFaq === 'faq-3' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </div>
              {activeFaq === 'faq-3' && (
                <div className="faq-answer" style={{ padding: '0 1.25rem 1.25rem', color: 'var(--light-gray)' }}>
                  <p>참여 금액에 따라 보너스가 자동 적용됩니다. Whale($50,000+): +5%, Dolphin($10,000~$49,999): +3%, Fish($1,000~$9,999): +1%, Shrimp($100~$999): 보너스 없음.</p>
                </div>
              )}
            </div>

            <div 
              className={`faq-item ${activeFaq === 'faq-4' ? 'active' : ''}`} 
              data-testid="faq-item-4"
              style={{ background: 'var(--dark-card)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
            >
              <div 
                className="faq-question" 
                onClick={() => toggleFaq('faq-4')}
                style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--white)' }}>토큰은 언제 받을 수 있나요?</h4>
                <span style={{ color: 'var(--gray)', transform: activeFaq === 'faq-4' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </div>
              {activeFaq === 'faq-4' && (
                <div className="faq-answer" style={{ padding: '0 1.25rem 1.25rem', color: 'var(--light-gray)' }}>
                  <p>TGE(토큰 생성 이벤트) 시점에 15%가 즉시 해제됩니다. 이후 3개월 클리프 기간 후 12개월에 걸쳐 나머지 85%가 월별로 배분됩니다.</p>
                </div>
              )}
            </div>

            <div 
              className={`faq-item ${activeFaq === 'faq-5' ? 'active' : ''}`} 
              data-testid="faq-item-5"
              style={{ background: 'var(--dark-card)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
            >
              <div 
                className="faq-question" 
                onClick={() => toggleFaq('faq-5')}
                style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--white)' }}>어떤 결제 방법을 지원하나요?</h4>
                <span style={{ color: 'var(--gray)', transform: activeFaq === 'faq-5' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </div>
              {activeFaq === 'faq-5' && (
                <div className="faq-answer" style={{ padding: '0 1.25rem 1.25rem', color: 'var(--light-gray)' }}>
                  <p>USDT, USDC, ETH 세 가지 결제 방법을 지원합니다. 모든 결제는 Ethereum 네트워크에서 안전한 스마트 컨트랙트를 통해 처리됩니다.</p>
                </div>
              )}
            </div>

            <div 
              className={`faq-item ${activeFaq === 'faq-6' ? 'active' : ''}`} 
              data-testid="faq-item-6"
              style={{ background: 'var(--dark-card)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
            >
              <div 
                className="faq-question" 
                onClick={() => toggleFaq('faq-6')}
                style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--white)' }}>참여 절차는 어떻게 되나요?</h4>
                <span style={{ color: 'var(--gray)', transform: activeFaq === 'faq-6' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </div>
              {activeFaq === 'faq-6' && (
                <div className="faq-answer" style={{ padding: '0 1.25rem 1.25rem', color: 'var(--light-gray)' }}>
                  <p>1) 지갑 연결 → 2) KYC 인증 → 3) 참여 금액 입력 → 4) 결제 방법 선택 → 5) 토큰 구매 완료. 전체 과정은 약 5분 소요됩니다.</p>
                </div>
              )}
            </div>

            <div 
              className={`faq-item ${activeFaq === 'faq-7' ? 'active' : ''}`} 
              data-testid="faq-item-7"
              style={{ background: 'var(--dark-card)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
            >
              <div 
                className="faq-question" 
                onClick={() => toggleFaq('faq-7')}
                style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--white)' }}>공식 런치패드의 특별한 혜택은 무엇인가요?</h4>
                <span style={{ color: 'var(--gray)', transform: activeFaq === 'faq-7' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </div>
              {activeFaq === 'faq-7' && (
                <div className="faq-answer" style={{ padding: '0 1.25rem 1.25rem', color: 'var(--light-gray)' }}>
                  <p>TBURN Foundation 공식 보장, 안전한 스마트 컨트랙트 처리, 모든 티어 보너스 적용, 24/7 고객 지원, 실시간 토큰 클레임 기능을 제공합니다.</p>
                </div>
              )}
            </div>

            <div 
              className={`faq-item ${activeFaq === 'faq-8' ? 'active' : ''}`} 
              data-testid="faq-item-8"
              style={{ background: 'var(--dark-card)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
            >
              <div 
                className="faq-question" 
                onClick={() => toggleFaq('faq-8')}
                style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--white)' }}>문의사항이 있으면 어디로 연락하나요?</h4>
                <span style={{ color: 'var(--gray)', transform: activeFaq === 'faq-8' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </div>
              {activeFaq === 'faq-8' && (
                <div className="faq-answer" style={{ padding: '0 1.25rem 1.25rem', color: 'var(--light-gray)' }}>
                  <p>공식 Telegram(@tburnchain), Discord(discord.gg/tburnchain) 또는 이메일(support@tburn.io)로 24시간 문의 가능합니다. 24/7 실시간 고객 지원팀이 대기중입니다.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-links">
            <a href="/legal/terms-of-service" data-testid="footer-link-terms">이용약관</a>
            <a href="/legal/privacy-policy" data-testid="footer-link-privacy">개인정보처리방침</a>
            <a href="/risk-disclosure" data-testid="footer-link-risk">리스크 고지</a>
            <a href="/qna" data-testid="footer-link-support">고객 지원</a>
            <a 
              href="#faq" 
              onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}
              data-testid="footer-link-faq"
            >FAQ</a>
          </div>
          <div className="social-links" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <a 
              href="https://x.com/tburnchain" 
              onClick={(e) => { e.preventDefault(); handleShareSocial('Twitter', 'https://x.com/tburnchain'); }}
              data-testid="footer-link-twitter"
            >𝕏</a>
            <a 
              href="https://t.me/tburnchain" 
              onClick={(e) => { e.preventDefault(); handleShareSocial('Telegram', 'https://t.me/tburnchain'); }}
              data-testid="footer-link-telegram"
            >Telegram</a>
            <a 
              href="https://discord.gg/tburnchain" 
              onClick={(e) => { e.preventDefault(); handleShareSocial('Discord', 'https://discord.gg/tburnchain'); }}
              data-testid="footer-link-discord"
            >Discord</a>
          </div>
          <p>© 2025-2045 TBURN Foundation. All Rights Reserved.</p>
        </footer>
      </main>

      {/* Transaction Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{modalStatus === 'success' ? '구매 완료!' : '트랜잭션 처리 중'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className={`tx-status-icon ${modalStatus}`}>
                {modalStatus === 'pending' ? <div className="spinner"></div> : '✓'}
              </div>
              <h4>{modalStatus === 'success' ? '토큰 구매 완료!' : '트랜잭션 확인 중...'}</h4>
              <p>{modalStatus === 'success' ? '토큰이 성공적으로 구매되었습니다' : '지갑에서 트랜잭션을 확인해주세요'}</p>

              <div className="tx-details">
                <div className="tx-detail-row">
                  <span className="label">구매 금액</span>
                  <span className="value">${investAmount.toLocaleString()} {selectedPayment.toUpperCase()}</span>
                </div>
                <div className="tx-detail-row">
                  <span className="label">받을 토큰</span>
                  <span className="value">{totalTokens.toLocaleString()} TBURN</span>
                </div>
                <div className="tx-detail-row">
                  <span className="label">예상 가스비</span>
                  <span className="value">~$5.00</span>
                </div>
              </div>

              {modalStatus === 'success' && (
                <button className="modal-btn" onClick={() => setShowModal(false)}>
                  확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
