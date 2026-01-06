export interface QnAItem {
  id: number;
  category: string;
  categoryKey: string;
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
  relatedPage?: string;
  tags: string[];
}

export const qnaCategories = [
  { key: 'getting-started', label: '시작하기', labelEn: 'Getting Started' },
  { key: 'wallet', label: '지갑', labelEn: 'Wallet' },
  { key: 'staking', label: '스테이킹', labelEn: 'Staking' },
  { key: 'defi', label: 'DeFi', labelEn: 'DeFi' },
  { key: 'nft', label: 'NFT', labelEn: 'NFT' },
  { key: 'gamefi', label: 'GameFi', labelEn: 'GameFi' },
  { key: 'network', label: '네트워크', labelEn: 'Network' },
  { key: 'developers', label: '개발자', labelEn: 'Developers' },
  { key: 'solutions', label: '솔루션', labelEn: 'Solutions' },
  { key: 'community', label: '커뮤니티', labelEn: 'Community' },
  { key: 'security', label: '보안', labelEn: 'Security' },
  { key: 'tokenomics', label: '토크노믹스', labelEn: 'Tokenomics' },
];

export const qnaData: QnAItem[] = [
  // ============================================
  // 시작하기 (Getting Started) - Questions 1-10
  // ============================================
  {
    id: 1,
    category: '시작하기',
    categoryKey: 'getting-started',
    question: 'TBURN이란 무엇인가요?',
    questionEn: 'What is TBURN?',
    answer: 'TBURN은 Chain ID 6000 메인넷에서 운영되는 차세대 Layer 1 블록체인입니다. 125개의 제네시스 밸리데이터와 64개의 동적 샤드를 통해 약 210,000 TPS를 처리하며 100ms 블록 타임을 제공합니다. AI 강화 BFT 합의 메커니즘으로 높은 보안성과 확장성을 제공하고, 500B 총 공급량의 디플레이션 토큰 경제 모델을 운영합니다.',
    answerEn: 'TBURN is a next-generation Layer 1 blockchain operating on Chain ID 6000 mainnet. With 125 genesis validators and 64 dynamic shards, it processes approximately 210,000 TPS with 100ms block time. It uses an AI-enhanced BFT consensus mechanism for high security and scalability, with a deflationary token economic model of 500B total supply.',
    relatedPage: '/learn/whitepaper',
    tags: ['기초', '블록체인', '소개', 'Chain ID 6000']
  },
  {
    id: 2,
    category: '시작하기',
    categoryKey: 'getting-started',
    question: 'TBURN을 시작하려면 어떻게 해야 하나요?',
    questionEn: 'How do I get started with TBURN?',
    answer: '1) 지원되는 지갑(MetaMask, Rabby, Trust Wallet 등)을 설치합니다. 2) TBURN 메인넷에 연결합니다. 3) TB 토큰을 구매하거나 전송받습니다. 4) 지갑 대시보드에서 자산을 관리하고 DeFi 서비스를 이용할 수 있습니다.',
    answerEn: '1) Install a supported wallet (MetaMask, Rabby, Trust Wallet, etc.). 2) Connect to TBURN mainnet. 3) Purchase or receive TB tokens. 4) Manage your assets and use DeFi services from the wallet dashboard.',
    relatedPage: '/app/wallet-dashboard',
    tags: ['시작', '지갑', '연결']
  },
  {
    id: 3,
    category: '시작하기',
    categoryKey: 'getting-started',
    question: 'TB 토큰은 어디서 구매할 수 있나요?',
    questionEn: 'Where can I buy TB tokens?',
    answer: 'TB 토큰은 TBURN 내장 DEX, 파트너 거래소, 또는 크로스체인 브릿지를 통해 구매할 수 있습니다. DEX 페이지에서 직접 스왑하거나, 브릿지를 통해 다른 체인에서 자산을 가져올 수 있습니다.',
    answerEn: 'TB tokens can be purchased on TBURN\'s built-in DEX, partner exchanges, or through cross-chain bridges. You can swap directly on the DEX page or bring assets from other chains via the bridge.',
    relatedPage: '/app/dex',
    tags: ['구매', '토큰', 'DEX']
  },
  {
    id: 4,
    category: '시작하기',
    categoryKey: 'getting-started',
    question: 'TBURN 지갑 주소 형식은 무엇인가요?',
    questionEn: 'What is the TBURN wallet address format?',
    answer: 'TBURN은 Bech32m 형식의 주소를 사용합니다. 모든 주소는 "tb1"로 시작하며 총 41자로 구성됩니다 (예: tb1edmprvaftt65lkp2x6v8fmjvst5spfruj47kwm). 이 형식은 BIP-350 표준을 따르며 오류 감지 기능이 내장되어 있습니다.',
    answerEn: 'TBURN uses Bech32m format addresses. All addresses start with "tb1" and consist of exactly 41 characters (e.g., tb1edmprvaftt65lkp2x6v8fmjvst5spfruj47kwm). This format follows the BIP-350 standard with built-in error detection.',
    relatedPage: '/app/wallet-dashboard',
    tags: ['주소', 'Bech32m', '형식']
  },
  {
    id: 5,
    category: '시작하기',
    categoryKey: 'getting-started',
    question: '거래 수수료는 얼마인가요?',
    questionEn: 'What are the transaction fees?',
    answer: 'TBURN의 기본 네트워크 수수료는 약 0.0001 TB입니다. 추가로 모든 전송에는 0.5%의 번 수수료가 적용되어 토큰이 영구 소각됩니다. 이 디플레이션 메커니즘이 토큰 가치 유지에 기여합니다.',
    answerEn: 'TBURN\'s base network fee is approximately 0.0001 TB. Additionally, all transfers have a 0.5% burn fee that permanently burns tokens. This deflationary mechanism contributes to maintaining token value.',
    relatedPage: '/learn/tokenomics',
    tags: ['수수료', '번', '비용']
  },
  {
    id: 6,
    category: '시작하기',
    categoryKey: 'getting-started',
    question: 'TBURN 메인넷과 테스트넷의 차이점은 무엇인가요?',
    questionEn: 'What is the difference between TBURN mainnet and testnet?',
    answer: '메인넷은 실제 가치를 가진 TB 토큰이 사용되는 프로덕션 네트워크입니다. 테스트넷은 개발 및 테스트 목적으로 사용되며 테스트 토큰은 가치가 없습니다. 개발자는 테스트넷에서 스마트 계약을 배포하고 테스트한 후 메인넷에 배포해야 합니다.',
    answerEn: 'Mainnet is the production network where TB tokens with real value are used. Testnet is used for development and testing purposes, and test tokens have no value. Developers should deploy and test smart contracts on testnet before deploying to mainnet.',
    relatedPage: '/testnet-scan',
    tags: ['메인넷', '테스트넷', '네트워크']
  },
  {
    id: 7,
    category: '시작하기',
    categoryKey: 'getting-started',
    question: 'TBURN Explorer는 무엇인가요?',
    questionEn: 'What is TBURN Explorer?',
    answer: 'TBURN Explorer(스캔)는 블록체인 탐색기로 블록, 트랜잭션, 지갑, 스마트 계약을 조회할 수 있습니다. 실시간 네트워크 상태, 밸리데이터 정보, 토큰 이동을 투명하게 확인할 수 있는 공개 도구입니다.',
    answerEn: 'TBURN Explorer (Scan) is a blockchain explorer where you can view blocks, transactions, wallets, and smart contracts. It\'s a public tool for transparently checking real-time network status, validator information, and token movements.',
    relatedPage: '/scan',
    tags: ['탐색기', '스캔', '조회']
  },
  {
    id: 8,
    category: '시작하기',
    categoryKey: 'getting-started',
    question: '로드맵에서 향후 계획은 무엇인가요?',
    questionEn: 'What are the future plans in the roadmap?',
    answer: 'TBURN 로드맵은 지속적인 네트워크 확장, 새로운 DeFi 프로토콜 통합, 크로스체인 브릿지 확대, AI 기능 강화, 게임 및 NFT 생태계 성장을 포함합니다. 자세한 마일스톤은 로드맵 페이지에서 확인할 수 있습니다.',
    answerEn: 'TBURN\'s roadmap includes continuous network expansion, new DeFi protocol integration, cross-chain bridge expansion, AI feature enhancement, and gaming/NFT ecosystem growth. Detailed milestones can be found on the roadmap page.',
    relatedPage: '/learn/roadmap',
    tags: ['로드맵', '계획', '미래']
  },
  {
    id: 9,
    category: '시작하기',
    categoryKey: 'getting-started',
    question: 'TBURN 백서는 어디서 볼 수 있나요?',
    questionEn: 'Where can I read the TBURN whitepaper?',
    answer: 'TBURN 백서는 공식 웹사이트의 Learn 섹션에서 확인할 수 있습니다. 백서에는 기술 아키텍처, 합의 메커니즘, 토크노믹스, 거버넌스 모델에 대한 상세한 설명이 포함되어 있습니다.',
    answerEn: 'The TBURN whitepaper is available in the Learn section of the official website. It contains detailed explanations of technical architecture, consensus mechanism, tokenomics, and governance model.',
    relatedPage: '/learn/whitepaper',
    tags: ['백서', '문서', '기술']
  },
  {
    id: 10,
    category: '시작하기',
    categoryKey: 'getting-started',
    question: 'TBURN 커뮤니티에 어떻게 참여할 수 있나요?',
    questionEn: 'How can I join the TBURN community?',
    answer: '커뮤니티 허브를 통해 공지사항, 이벤트, 뉴스를 확인하고 다른 사용자와 소통할 수 있습니다. 거버넌스 제안에 투표하고, 에어드랍 및 캠페인에 참여하여 보상을 받을 수 있습니다.',
    answerEn: 'Through the Community Hub, you can check announcements, events, and news, and interact with other users. You can vote on governance proposals and participate in airdrops and campaigns to earn rewards.',
    relatedPage: '/community/hub',
    tags: ['커뮤니티', '참여', '소통']
  },

  // ============================================
  // 지갑 (Wallet) - Questions 11-20
  // ============================================
  {
    id: 11,
    category: '지갑',
    categoryKey: 'wallet',
    question: '어떤 지갑이 TBURN을 지원하나요?',
    questionEn: 'Which wallets support TBURN?',
    answer: 'TBURN은 MetaMask, Rabby Wallet, Trust Wallet, Coinbase Wallet, Ledger 하드웨어 지갑을 지원합니다. 모든 EVM 호환 지갑에서 TBURN 네트워크를 추가하여 사용할 수 있습니다.',
    answerEn: 'TBURN supports MetaMask, Rabby Wallet, Trust Wallet, Coinbase Wallet, and Ledger hardware wallets. You can use any EVM-compatible wallet by adding the TBURN network.',
    relatedPage: '/solutions/wallets',
    tags: ['지갑', '호환성', 'MetaMask']
  },
  {
    id: 12,
    category: '지갑',
    categoryKey: 'wallet',
    question: '지갑을 TBURN 네트워크에 어떻게 연결하나요?',
    questionEn: 'How do I connect my wallet to TBURN network?',
    answer: '지갑 대시보드에서 "지갑 연결" 버튼을 클릭하고 원하는 지갑을 선택합니다. 네트워크가 자동으로 추가되며, 수동 설정이 필요한 경우 RPC 페이지에서 네트워크 정보를 확인할 수 있습니다.',
    answerEn: 'Click the "Connect Wallet" button on the wallet dashboard and select your preferred wallet. The network will be added automatically, and if manual setup is needed, you can find network information on the RPC page.',
    relatedPage: '/app/wallet-dashboard',
    tags: ['연결', '네트워크', '설정']
  },
  {
    id: 13,
    category: '지갑',
    categoryKey: 'wallet',
    question: '토큰을 다른 지갑으로 어떻게 전송하나요?',
    questionEn: 'How do I transfer tokens to another wallet?',
    answer: '지갑 및 이체 탭에서 수신자 주소(tb1로 시작하는 41자)를 입력하고 금액을 설정합니다. 번 수수료(0.5%)와 네트워크 수수료가 자동 계산되어 표시됩니다. 전송 버튼을 클릭하여 트랜잭션을 완료합니다.',
    answerEn: 'In the Wallet & Transfer tab, enter the recipient address (41 characters starting with tb1) and set the amount. Burn fee (0.5%) and network fee are automatically calculated and displayed. Click the transfer button to complete the transaction.',
    relatedPage: '/user',
    tags: ['전송', '이체', '송금']
  },
  {
    id: 14,
    category: '지갑',
    categoryKey: 'wallet',
    question: '지갑 잔액이 업데이트되지 않는 이유는 무엇인가요?',
    questionEn: 'Why is my wallet balance not updating?',
    answer: '네트워크 지연이나 캐시 문제일 수 있습니다. 페이지를 새로고침하거나 지갑을 다시 연결해 보세요. 트랜잭션이 컨펌되었는지 Explorer에서 확인할 수 있습니다. 문제가 지속되면 다른 RPC 엔드포인트를 시도해 보세요.',
    answerEn: 'It may be due to network delay or cache issues. Try refreshing the page or reconnecting your wallet. You can verify if the transaction is confirmed on the Explorer. If the issue persists, try a different RPC endpoint.',
    relatedPage: '/network/rpc',
    tags: ['잔액', '업데이트', '문제']
  },
  {
    id: 15,
    category: '지갑',
    categoryKey: 'wallet',
    question: '하드웨어 지갑을 사용할 수 있나요?',
    questionEn: 'Can I use a hardware wallet?',
    answer: 'Ledger 하드웨어 지갑을 완전히 지원합니다. Ledger Live를 통해 TBURN 앱을 설치하고 MetaMask와 연결하여 사용할 수 있습니다. 하드웨어 지갑은 최고 수준의 보안을 제공합니다.',
    answerEn: 'Ledger hardware wallets are fully supported. You can install the TBURN app through Ledger Live and connect it with MetaMask. Hardware wallets provide the highest level of security.',
    relatedPage: '/solutions/wallets',
    tags: ['Ledger', '하드웨어', '보안']
  },
  {
    id: 16,
    category: '지갑',
    categoryKey: 'wallet',
    question: '지갑 대시보드에서 무엇을 할 수 있나요?',
    questionEn: 'What can I do on the wallet dashboard?',
    answer: '지갑 대시보드에서 포트폴리오 개요, 자산 잔액, 최근 트랜잭션을 확인할 수 있습니다. 스테이킹, DEX 스왑, NFT 조회, DeFi 서비스 접근 등 모든 블록체인 활동의 중심 허브입니다.',
    answerEn: 'On the wallet dashboard, you can view portfolio overview, asset balances, and recent transactions. It\'s the central hub for all blockchain activities including staking, DEX swaps, NFT browsing, and DeFi services.',
    relatedPage: '/app/wallet-dashboard',
    tags: ['대시보드', '포트폴리오', '관리']
  },
  {
    id: 17,
    category: '지갑',
    categoryKey: 'wallet',
    question: '미청구 보상은 어떻게 청구하나요?',
    questionEn: 'How do I claim unclaimed rewards?',
    answer: '대시보드의 보상 섹션에서 청구 가능한 보상을 확인할 수 있습니다. "모두 청구" 버튼을 클릭하면 스테이킹, 마이닝, 이벤트 보상을 한 번에 청구할 수 있습니다. 트랜잭션 승인 후 지갑에 반영됩니다.',
    answerEn: 'You can view claimable rewards in the Rewards section of the dashboard. Click the "Claim All" button to claim staking, mining, and event rewards at once. They will be reflected in your wallet after transaction confirmation.',
    relatedPage: '/user',
    tags: ['보상', '청구', '클레임']
  },
  {
    id: 18,
    category: '지갑',
    categoryKey: 'wallet',
    question: '트랜잭션 상태를 어떻게 확인하나요?',
    questionEn: 'How do I check transaction status?',
    answer: 'Explorer에서 트랜잭션 해시를 검색하면 상태, 컨펌 수, 가스 사용량, 블록 정보를 확인할 수 있습니다. 지갑 대시보드의 최근 활동 섹션에서도 트랜잭션 기록을 볼 수 있습니다.',
    answerEn: 'Search for the transaction hash in Explorer to check status, confirmation count, gas usage, and block information. You can also view transaction history in the Recent Activity section of the wallet dashboard.',
    relatedPage: '/scan',
    tags: ['트랜잭션', '상태', '확인']
  },
  {
    id: 19,
    category: '지갑',
    categoryKey: 'wallet',
    question: '가스비가 부족하면 어떻게 되나요?',
    questionEn: 'What happens if I don\'t have enough gas?',
    answer: '가스비(TB)가 부족하면 트랜잭션이 실패합니다. 전송하기 전에 충분한 TB 잔액이 있는지 확인하세요. 트랜잭션 시뮬레이터에서 예상 가스비를 미리 확인할 수 있습니다.',
    answerEn: 'If you don\'t have enough gas (TB), the transaction will fail. Make sure you have sufficient TB balance before transferring. You can check estimated gas fees in advance using the Transaction Simulator.',
    relatedPage: '/app/simulator',
    tags: ['가스', '수수료', '잔액']
  },
  {
    id: 20,
    category: '지갑',
    categoryKey: 'wallet',
    question: '온램프(Fiat-to-Crypto)는 어떻게 사용하나요?',
    questionEn: 'How do I use the on-ramp (Fiat-to-Crypto)?',
    answer: '네트워크 램프 페이지에서 신용카드, 은행 이체 등으로 직접 TB 토큰을 구매할 수 있습니다. 파트너 결제 서비스를 통해 원화(KRW) 및 주요 통화로 간편하게 구매 가능합니다.',
    answerEn: 'On the Network Ramp page, you can purchase TB tokens directly using credit cards, bank transfers, etc. Through partner payment services, you can easily purchase using KRW and major currencies.',
    relatedPage: '/network/ramp',
    tags: ['온램프', '구매', '법정화폐']
  },

  // ============================================
  // 스테이킹 (Staking) - Questions 21-30
  // ============================================
  {
    id: 21,
    category: '스테이킹',
    categoryKey: 'staking',
    question: '스테이킹이란 무엇인가요?',
    questionEn: 'What is staking?',
    answer: '스테이킹은 TB 토큰을 밸리데이터에게 위임하여 네트워크 보안에 기여하고 보상을 받는 것입니다. 스테이킹된 토큰은 네트워크 합의에 참여하며, APY에 따라 정기적으로 보상이 지급됩니다.',
    answerEn: 'Staking is delegating TB tokens to validators to contribute to network security and earn rewards. Staked tokens participate in network consensus, and rewards are distributed regularly based on APY.',
    relatedPage: '/app/staking',
    tags: ['스테이킹', '위임', '보상']
  },
  {
    id: 22,
    category: '스테이킹',
    categoryKey: 'staking',
    question: '최소 스테이킹 금액은 얼마인가요?',
    questionEn: 'What is the minimum staking amount?',
    answer: '일반 위임의 경우 최소 10 TB부터 스테이킹 가능합니다. 밸리데이터로 직접 참여하려면 티어에 따라 1,000 TB에서 100,000 TB까지 필요합니다.',
    answerEn: 'For regular delegation, staking starts from a minimum of 10 TB. To participate directly as a validator, you need between 1,000 TB to 100,000 TB depending on the tier.',
    relatedPage: '/app/staking',
    tags: ['최소금액', '위임', '밸리데이터']
  },
  {
    id: 23,
    category: '스테이킹',
    categoryKey: 'staking',
    question: '스테이킹 보상은 어떻게 계산되나요?',
    questionEn: 'How are staking rewards calculated?',
    answer: '보상은 스테이킹 금액, 밸리데이터 성능, 네트워크 참여율에 따라 계산됩니다. 현재 기본 APY는 약 8-15%이며, 보상 페이지에서 상세 내역을 확인할 수 있습니다.',
    answerEn: 'Rewards are calculated based on staking amount, validator performance, and network participation rate. Current base APY is approximately 8-15%, and detailed breakdown can be viewed on the Rewards page.',
    relatedPage: '/app/staking/rewards',
    tags: ['보상', '계산', 'APY']
  },
  {
    id: 24,
    category: '스테이킹',
    categoryKey: 'staking',
    question: '언스테이킹(Unstaking)은 얼마나 걸리나요?',
    questionEn: 'How long does unstaking take?',
    answer: '언스테이킹 요청 후 21일의 언본딩 기간이 있습니다. 이 기간 동안 토큰은 락업되며 보상이 지급되지 않습니다. 언본딩이 완료되면 토큰이 지갑으로 반환됩니다.',
    answerEn: 'There is a 21-day unbonding period after requesting unstaking. During this period, tokens are locked and no rewards are earned. Once unbonding is complete, tokens are returned to your wallet.',
    relatedPage: '/app/staking',
    tags: ['언스테이킹', '언본딩', '기간']
  },
  {
    id: 25,
    category: '스테이킹',
    categoryKey: 'staking',
    question: '밸리데이터를 어떻게 선택해야 하나요?',
    questionEn: 'How should I choose a validator?',
    answer: '업타임(가동률), 커미션율, 총 위임량, 자체 스테이킹 금액을 고려하세요. 높은 업타임과 낮은 커미션을 가진 신뢰할 수 있는 밸리데이터를 선택하는 것이 좋습니다. 밸리데이터 페이지에서 상세 정보를 비교할 수 있습니다.',
    answerEn: 'Consider uptime, commission rate, total delegation, and self-stake amount. It\'s advisable to choose reliable validators with high uptime and low commission. You can compare detailed information on the Validators page.',
    relatedPage: '/network/validators',
    tags: ['밸리데이터', '선택', '커미션']
  },
  {
    id: 26,
    category: '스테이킹',
    categoryKey: 'staking',
    question: '슬래싱(Slashing)이란 무엇인가요?',
    questionEn: 'What is slashing?',
    answer: '슬래싱은 밸리데이터가 악의적인 행동(이중 서명, 장시간 오프라인)을 했을 때 스테이킹된 토큰의 일부가 삭감되는 페널티입니다. 신뢰할 수 있는 밸리데이터를 선택하면 슬래싱 위험을 줄일 수 있습니다.',
    answerEn: 'Slashing is a penalty where a portion of staked tokens is cut when validators engage in malicious behavior (double signing, extended offline periods). Choosing reliable validators can reduce slashing risk.',
    relatedPage: '/app/staking',
    tags: ['슬래싱', '페널티', '보안']
  },
  {
    id: 27,
    category: '스테이킹',
    categoryKey: 'staking',
    question: '리퀴드 스테이킹이란 무엇인가요?',
    questionEn: 'What is liquid staking?',
    answer: '리퀴드 스테이킹은 스테이킹하면서도 유동성을 유지할 수 있는 방법입니다. TB를 스테이킹하면 stTB 토큰을 받고, 이를 DeFi에서 활용하면서 동시에 스테이킹 보상도 받을 수 있습니다.',
    answerEn: 'Liquid staking is a way to maintain liquidity while staking. When you stake TB, you receive stTB tokens that can be used in DeFi while simultaneously earning staking rewards.',
    relatedPage: '/app/liquid-staking',
    tags: ['리퀴드', 'stTB', '유동성']
  },
  {
    id: 28,
    category: '스테이킹',
    categoryKey: 'staking',
    question: 'stTB 토큰은 어디서 사용할 수 있나요?',
    questionEn: 'Where can I use stTB tokens?',
    answer: 'stTB는 DEX에서 거래, 렌딩 프로토콜에서 담보, 이자 농사 풀에 예치할 수 있습니다. 스테이킹 보상과 DeFi 수익을 동시에 얻는 이중 수익이 가능합니다.',
    answerEn: 'stTB can be traded on DEX, used as collateral in lending protocols, and deposited in yield farming pools. You can earn dual yields from both staking rewards and DeFi returns.',
    relatedPage: '/app/liquid-staking',
    tags: ['stTB', 'DeFi', '활용']
  },
  {
    id: 29,
    category: '스테이킹',
    categoryKey: 'staking',
    question: '스테이킹 SDK는 무엇인가요?',
    questionEn: 'What is the Staking SDK?',
    answer: '스테이킹 SDK는 개발자가 자체 애플리케이션에 스테이킹 기능을 통합할 수 있는 도구입니다. JavaScript/TypeScript를 지원하며, 위임, 언스테이킹, 보상 청구 등의 기능을 프로그래밍 방식으로 구현할 수 있습니다.',
    answerEn: 'The Staking SDK is a tool for developers to integrate staking functionality into their applications. It supports JavaScript/TypeScript and allows programmatic implementation of delegation, unstaking, and reward claiming.',
    relatedPage: '/app/staking/sdk',
    tags: ['SDK', '개발자', '통합']
  },
  {
    id: 30,
    category: '스테이킹',
    categoryKey: 'staking',
    question: '밸리데이터 신청은 어떻게 하나요?',
    questionEn: 'How do I apply to become a validator?',
    answer: '밸리데이터 신청 시스템에서 3단계 신청을 완료하세요: 1) 기본 요건 확인 및 서류 제출, 2) 기술 인프라 검증, 3) 스테이킹 및 최종 승인. 티어(Bronze, Silver, Gold)에 따라 요구 조건이 다릅니다.',
    answerEn: 'Complete the 3-step application in the Validator Application System: 1) Basic requirements verification and document submission, 2) Technical infrastructure verification, 3) Staking and final approval. Requirements vary by tier (Bronze, Silver, Gold).',
    relatedPage: '/user',
    tags: ['밸리데이터', '신청', '티어']
  },

  // ============================================
  // DeFi - Questions 31-45
  // ============================================
  {
    id: 31,
    category: 'DeFi',
    categoryKey: 'defi',
    question: 'TBURN DEX란 무엇인가요?',
    questionEn: 'What is TBURN DEX?',
    answer: 'TBURN DEX는 탈중앙화 거래소로 TB 토큰과 다른 자산을 직접 스왑할 수 있습니다. AMM(자동화된 마켓 메이커) 방식으로 운영되며, 유동성 풀에 참여하여 거래 수수료를 얻을 수도 있습니다.',
    answerEn: 'TBURN DEX is a decentralized exchange where you can directly swap TB tokens with other assets. It operates using AMM (Automated Market Maker), and you can also earn trading fees by participating in liquidity pools.',
    relatedPage: '/app/dex',
    tags: ['DEX', '스왑', 'AMM']
  },
  {
    id: 32,
    category: 'DeFi',
    categoryKey: 'defi',
    question: '토큰 스왑은 어떻게 하나요?',
    questionEn: 'How do I swap tokens?',
    answer: 'DEX 페이지에서 교환할 토큰 쌍을 선택하고 수량을 입력합니다. 예상 출력량과 슬리피지를 확인한 후 스왑 버튼을 클릭합니다. 지갑에서 트랜잭션을 승인하면 스왑이 완료됩니다.',
    answerEn: 'On the DEX page, select the token pair to exchange and enter the amount. Check the expected output and slippage, then click the swap button. Approve the transaction in your wallet to complete the swap.',
    relatedPage: '/app/dex',
    tags: ['스왑', '교환', '거래']
  },
  {
    id: 33,
    category: 'DeFi',
    categoryKey: 'defi',
    question: '유동성 풀(LP)이란 무엇인가요?',
    questionEn: 'What are liquidity pools (LP)?',
    answer: '유동성 풀은 스왑을 위한 토큰 쌍이 예치된 스마트 계약입니다. LP 제공자는 두 토큰을 동일한 가치로 예치하고, 거래 수수료의 일부를 보상으로 받습니다. DEX #pools 섹션에서 참여할 수 있습니다.',
    answerEn: 'Liquidity pools are smart contracts where token pairs are deposited for swaps. LP providers deposit two tokens of equal value and receive a portion of trading fees as rewards. You can participate in the DEX #pools section.',
    relatedPage: '/app/dex#pools',
    tags: ['유동성', 'LP', '풀']
  },
  {
    id: 34,
    category: 'DeFi',
    categoryKey: 'defi',
    question: '비영구적 손실(Impermanent Loss)이란?',
    questionEn: 'What is impermanent loss?',
    answer: '비영구적 손실은 LP 제공 시 토큰 가격 변동으로 인해 발생하는 기회비용입니다. 풀에서 출금할 때 단순 보유했을 때보다 적은 가치를 가질 수 있습니다. 변동성이 낮은 쌍을 선택하면 이 위험을 줄일 수 있습니다.',
    answerEn: 'Impermanent loss is the opportunity cost that occurs due to token price changes when providing liquidity. When withdrawing from the pool, you may have less value than if you simply held. Choosing low-volatility pairs can reduce this risk.',
    relatedPage: '/app/dex#pools',
    tags: ['비영구적손실', 'IL', '위험']
  },
  {
    id: 35,
    category: 'DeFi',
    categoryKey: 'defi',
    question: '렌딩(대출)은 어떻게 작동하나요?',
    questionEn: 'How does lending work?',
    answer: '렌딩 프로토콜에서 자산을 예치하면 이자를 받고, 담보를 제공하면 다른 자산을 빌릴 수 있습니다. 담보 비율, 이자율, 청산 임계값을 확인하고 참여하세요. 과담보 대출 방식으로 안전하게 운영됩니다.',
    answerEn: 'In the lending protocol, you earn interest by depositing assets, and can borrow other assets by providing collateral. Check collateral ratio, interest rate, and liquidation threshold before participating. It operates safely with overcollateralized loans.',
    relatedPage: '/app/lending',
    tags: ['렌딩', '대출', '이자']
  },
  {
    id: 36,
    category: 'DeFi',
    categoryKey: 'defi',
    question: '청산(Liquidation)이란 무엇인가요?',
    questionEn: 'What is liquidation?',
    answer: '청산은 담보 가치가 빌린 자산 가치 대비 일정 비율 이하로 떨어질 때 발생합니다. 담보가 자동으로 매각되어 대출이 상환됩니다. 건전한 담보 비율을 유지하여 청산을 방지하세요.',
    answerEn: 'Liquidation occurs when collateral value falls below a certain ratio compared to borrowed assets. Collateral is automatically sold to repay the loan. Maintain a healthy collateral ratio to prevent liquidation.',
    relatedPage: '/app/lending',
    tags: ['청산', '담보', '위험관리']
  },
  {
    id: 37,
    category: 'DeFi',
    categoryKey: 'defi',
    question: '이자 농사(Yield Farming)란?',
    questionEn: 'What is yield farming?',
    answer: '이자 농사는 DeFi 프로토콜에 유동성을 제공하고 추가 토큰 보상을 받는 전략입니다. LP 토큰을 농사 풀에 스테이킹하면 거래 수수료 + 농사 보상을 동시에 얻을 수 있습니다.',
    answerEn: 'Yield farming is a strategy of providing liquidity to DeFi protocols and receiving additional token rewards. By staking LP tokens in farming pools, you can earn trading fees + farming rewards simultaneously.',
    relatedPage: '/app/yield-farming',
    tags: ['이자농사', '파밍', '보상']
  },
  {
    id: 38,
    category: 'DeFi',
    categoryKey: 'defi',
    question: 'APY와 APR의 차이점은?',
    questionEn: 'What is the difference between APY and APR?',
    answer: 'APR(연간이자율)은 단리 기준이고, APY(연간수익률)는 복리를 포함합니다. 예: APR 10%는 연말에 10% 수익이지만, APY 10%는 복리로 실제 수익이 더 높습니다. DeFi에서는 주로 APY를 표시합니다.',
    answerEn: 'APR (Annual Percentage Rate) is based on simple interest, while APY (Annual Percentage Yield) includes compounding. Example: 10% APR means 10% return at year-end, but 10% APY yields higher actual returns due to compounding. DeFi typically displays APY.',
    relatedPage: '/app/yield-farming',
    tags: ['APY', 'APR', '수익률']
  },
  {
    id: 39,
    category: 'DeFi',
    categoryKey: 'defi',
    question: 'DeFi Hub는 무엇인가요?',
    questionEn: 'What is the DeFi Hub?',
    answer: 'DeFi Hub는 TBURN의 모든 DeFi 서비스(DEX, 렌딩, 이자농사, 리퀴드 스테이킹)를 한 곳에서 접근할 수 있는 통합 대시보드입니다. 포트폴리오 현황과 수익 최적화 도구를 제공합니다.',
    answerEn: 'DeFi Hub is an integrated dashboard where you can access all TBURN DeFi services (DEX, lending, yield farming, liquid staking) in one place. It provides portfolio status and yield optimization tools.',
    relatedPage: '/solutions/defi-hub',
    tags: ['DeFi Hub', '통합', '대시보드']
  },
  {
    id: 40,
    category: 'DeFi',
    categoryKey: 'defi',
    question: '크로스체인 브릿지는 어떻게 사용하나요?',
    questionEn: 'How do I use the cross-chain bridge?',
    answer: '브릿지 페이지에서 소스 체인과 대상 체인을 선택하고 전송할 토큰과 수량을 입력합니다. 브릿지 수수료를 확인하고 트랜잭션을 승인합니다. 보통 10-30분 내에 대상 체인에서 토큰을 받을 수 있습니다.',
    answerEn: 'On the Bridge page, select source and destination chains, then enter the token and amount to transfer. Check the bridge fee and approve the transaction. You can typically receive tokens on the destination chain within 10-30 minutes.',
    relatedPage: '/solutions/cross-chain-bridge',
    tags: ['브릿지', '크로스체인', '전송']
  },
  {
    id: 41,
    category: 'DeFi',
    categoryKey: 'defi',
    question: '어떤 체인과 브릿지가 가능한가요?',
    questionEn: 'Which chains are bridgeable?',
    answer: 'Ethereum, BNB Chain, Polygon, Arbitrum, Optimism, Avalanche 등 주요 EVM 체인과 브릿지가 가능합니다. Bitcoin(BTC)은 BTCFi 솔루션을 통해 래핑된 형태로 TBURN에서 사용할 수 있습니다.',
    answerEn: 'Bridging is available with major EVM chains including Ethereum, BNB Chain, Polygon, Arbitrum, Optimism, and Avalanche. Bitcoin (BTC) can be used on TBURN in wrapped form through the BTCFi solution.',
    relatedPage: '/solutions/cross-chain-bridge',
    tags: ['체인', '브릿지', 'EVM']
  },
  {
    id: 42,
    category: 'DeFi',
    categoryKey: 'defi',
    question: 'BTCFi란 무엇인가요?',
    questionEn: 'What is BTCFi?',
    answer: 'BTCFi는 Bitcoin을 TBURN 생태계에서 활용할 수 있게 하는 솔루션입니다. BTC를 래핑하여 wBTC로 사용하고, TBURN DeFi 서비스에 참여할 수 있습니다. Bitcoin 보유자도 DeFi 수익을 얻을 수 있습니다.',
    answerEn: 'BTCFi is a solution that enables using Bitcoin within the TBURN ecosystem. You can wrap BTC as wBTC and participate in TBURN DeFi services. Bitcoin holders can also earn DeFi yields.',
    relatedPage: '/solutions/btcfi',
    tags: ['BTCFi', 'Bitcoin', 'wBTC']
  },
  {
    id: 43,
    category: 'DeFi',
    categoryKey: 'defi',
    question: '스테이블코인을 TBURN에서 사용할 수 있나요?',
    questionEn: 'Can I use stablecoins on TBURN?',
    answer: 'USDT, USDC 등 주요 스테이블코인을 브릿지를 통해 TBURN으로 가져와 사용할 수 있습니다. DEX에서 스왑하거나 렌딩 담보로 활용할 수 있으며, 안정적인 수익을 위한 스테이블 풀도 제공됩니다.',
    answerEn: 'Major stablecoins like USDT and USDC can be bridged to TBURN for use. You can swap on DEX or use as lending collateral, and stable pools are also available for consistent yields.',
    relatedPage: '/use-cases/stablecoins',
    tags: ['스테이블코인', 'USDT', 'USDC']
  },
  {
    id: 44,
    category: 'DeFi',
    categoryKey: 'defi',
    question: '결제 솔루션은 어떻게 작동하나요?',
    questionEn: 'How do payment solutions work?',
    answer: '결제 솔루션은 TB 토큰으로 상품/서비스 결제를 가능하게 합니다. 판매자 API, 결제 게이트웨이, QR 결제를 지원하며, 즉시 정산과 낮은 수수료가 특징입니다.',
    answerEn: 'Payment solutions enable paying for goods/services with TB tokens. They support merchant API, payment gateway, and QR payments, featuring instant settlement and low fees.',
    relatedPage: '/solutions/payments',
    tags: ['결제', '페이먼트', '상거래']
  },
  {
    id: 45,
    category: 'DeFi',
    categoryKey: 'defi',
    question: '기관 결제는 어떤 기능이 있나요?',
    questionEn: 'What features are available for institutional payments?',
    answer: '기관 결제는 대규모 거래를 위한 전용 기능입니다. 배치 처리, 멀티시그 승인, 규정 준수 도구, 감사 추적, 맞춤형 한도 설정을 제공하며, 전담 지원팀이 배정됩니다.',
    answerEn: 'Institutional payments are dedicated features for large-scale transactions. They provide batch processing, multi-sig approval, compliance tools, audit trails, and custom limit settings, with a dedicated support team.',
    relatedPage: '/use-cases/institutional-payments',
    tags: ['기관', '결제', '엔터프라이즈']
  },

  // ============================================
  // NFT - Questions 46-55
  // ============================================
  {
    id: 46,
    category: 'NFT',
    categoryKey: 'nft',
    question: 'TBURN NFT 마켓플레이스란?',
    questionEn: 'What is TBURN NFT Marketplace?',
    answer: 'TBURN NFT 마켓플레이스는 디지털 수집품, 예술품, 게임 아이템 등 NFT를 거래할 수 있는 플랫폼입니다. TBC-721, TBC-1155 표준을 지원하며, 낮은 가스비와 빠른 거래가 특징입니다.',
    answerEn: 'TBURN NFT Marketplace is a platform for trading NFTs including digital collectibles, artwork, and game items. It supports TBC-721 and TBC-1155 standards, featuring low gas fees and fast transactions.',
    relatedPage: '/app/nft-marketplace',
    tags: ['NFT', '마켓플레이스', '거래']
  },
  {
    id: 47,
    category: 'NFT',
    categoryKey: 'nft',
    question: 'NFT는 어떻게 구매하나요?',
    questionEn: 'How do I buy NFTs?',
    answer: 'NFT 마켓플레이스에서 컬렉션을 탐색하고 원하는 NFT를 선택합니다. 고정가 구매 또는 경매 입찰로 구매할 수 있습니다. 지갑을 연결하고 충분한 TB 잔액이 있는지 확인하세요.',
    answerEn: 'Browse collections on the NFT Marketplace and select the NFT you want. You can purchase via fixed price or auction bid. Connect your wallet and ensure you have sufficient TB balance.',
    relatedPage: '/app/nft-marketplace',
    tags: ['구매', '경매', '컬렉션']
  },
  {
    id: 48,
    category: 'NFT',
    categoryKey: 'nft',
    question: 'NFT를 어떻게 판매하나요?',
    questionEn: 'How do I sell NFTs?',
    answer: '지갑에 있는 NFT를 마켓플레이스에 리스팅할 수 있습니다. 고정가 판매 또는 경매 방식을 선택하고, 가격과 기간을 설정합니다. 판매 완료 시 수수료를 제외한 금액이 지갑으로 입금됩니다.',
    answerEn: 'You can list NFTs in your wallet on the marketplace. Choose between fixed price or auction, and set the price and duration. Upon sale completion, the amount minus fees is deposited to your wallet.',
    relatedPage: '/app/nft-marketplace',
    tags: ['판매', '리스팅', '경매']
  },
  {
    id: 49,
    category: 'NFT',
    categoryKey: 'nft',
    question: 'NFT 런치패드란 무엇인가요?',
    questionEn: 'What is the NFT Launchpad?',
    answer: 'NFT 런치패드는 새로운 NFT 프로젝트를 출시하는 플랫폼입니다. 검증된 크리에이터의 신규 컬렉션을 초기 민팅 가격에 구매할 수 있으며, 화이트리스트 이벤트와 독점 드랍에 참여할 수 있습니다.',
    answerEn: 'The NFT Launchpad is a platform for launching new NFT projects. You can purchase verified creators\' new collections at initial minting prices and participate in whitelist events and exclusive drops.',
    relatedPage: '/app/nft-launchpad',
    tags: ['런치패드', '민팅', '드랍']
  },
  {
    id: 50,
    category: 'NFT',
    categoryKey: 'nft',
    question: 'NFT 민팅은 어떻게 하나요?',
    questionEn: 'How do I mint NFTs?',
    answer: '런치패드에서 원하는 프로젝트의 민팅 일정을 확인하세요. 화이트리스트에 등록되어 있다면 우선 민팅에 참여할 수 있습니다. 민팅 시간에 지갑을 연결하고 민팅 버튼을 클릭하면 됩니다.',
    answerEn: 'Check the minting schedule for your desired project on the Launchpad. If you\'re on the whitelist, you can participate in priority minting. Connect your wallet at minting time and click the mint button.',
    relatedPage: '/app/nft-launchpad',
    tags: ['민팅', '화이트리스트', '생성']
  },
  {
    id: 51,
    category: 'NFT',
    categoryKey: 'nft',
    question: 'TBC-721과 TBC-1155의 차이점은?',
    questionEn: 'What is the difference between TBC-721 and TBC-1155?',
    answer: 'TBC-721은 각 토큰이 고유한 1:1 NFT 표준입니다. TBC-1155는 동일한 계약에서 대체 가능(FT)과 대체 불가능(NFT) 토큰을 모두 지원하는 다중 토큰 표준으로, 게임 아이템에 적합합니다.',
    answerEn: 'TBC-721 is a 1:1 NFT standard where each token is unique. TBC-1155 is a multi-token standard that supports both fungible (FT) and non-fungible (NFT) tokens in the same contract, suitable for game items.',
    relatedPage: '/solutions/token-extensions',
    tags: ['TBC-721', 'TBC-1155', '표준']
  },
  {
    id: 52,
    category: 'NFT',
    categoryKey: 'nft',
    question: '아티스트/크리에이터로 어떻게 시작하나요?',
    questionEn: 'How do I get started as an artist/creator?',
    answer: '크리에이터 솔루션에서 프로필을 설정하고 작품을 업로드할 수 있습니다. 컬렉션을 생성하고 NFT를 민팅한 후 마켓플레이스에 리스팅합니다. 로열티 설정으로 2차 판매에서도 수익을 얻을 수 있습니다.',
    answerEn: 'Set up your profile and upload your work in the Creator Solutions. Create a collection, mint NFTs, and list them on the marketplace. Royalty settings allow you to earn from secondary sales as well.',
    relatedPage: '/solutions/artists-creators',
    tags: ['크리에이터', '아티스트', '로열티']
  },
  {
    id: 53,
    category: 'NFT',
    categoryKey: 'nft',
    question: 'NFT 로열티는 어떻게 작동하나요?',
    questionEn: 'How do NFT royalties work?',
    answer: '크리에이터는 NFT 생성 시 로열티 비율(일반적으로 2.5-10%)을 설정합니다. 2차 판매가 발생할 때마다 설정된 비율의 금액이 자동으로 크리에이터에게 지급됩니다.',
    answerEn: 'Creators set a royalty percentage (typically 2.5-10%) when creating NFTs. Each time a secondary sale occurs, the set percentage is automatically paid to the creator.',
    relatedPage: '/app/nft-marketplace',
    tags: ['로열티', '수익', '크리에이터']
  },
  {
    id: 54,
    category: 'NFT',
    categoryKey: 'nft',
    question: 'NFT의 진위를 어떻게 확인하나요?',
    questionEn: 'How do I verify NFT authenticity?',
    answer: 'Explorer에서 NFT 계약 주소와 토큰 ID를 검색하면 소유권 이력, 민팅 정보, 크리에이터를 확인할 수 있습니다. 검증된 컬렉션에는 인증 배지가 표시됩니다.',
    answerEn: 'Search for the NFT contract address and token ID in Explorer to check ownership history, minting information, and creator. Verified collections display a certification badge.',
    relatedPage: '/scan',
    tags: ['진위', '확인', '인증']
  },
  {
    id: 55,
    category: 'NFT',
    categoryKey: 'nft',
    question: 'NFT를 다른 지갑으로 전송할 수 있나요?',
    questionEn: 'Can I transfer NFTs to another wallet?',
    answer: '지갑 대시보드나 NFT 마켓플레이스에서 보유한 NFT를 선택하고 전송 옵션을 사용합니다. 수신자의 TBURN 주소(tb1...)를 입력하고 트랜잭션을 승인하면 전송됩니다.',
    answerEn: 'Select your NFT in the wallet dashboard or NFT marketplace and use the transfer option. Enter the recipient\'s TBURN address (tb1...) and approve the transaction to transfer.',
    relatedPage: '/app/nft-marketplace',
    tags: ['전송', 'NFT', '이동']
  },

  // ============================================
  // GameFi - Questions 56-62
  // ============================================
  {
    id: 56,
    category: 'GameFi',
    categoryKey: 'gamefi',
    question: 'TBURN GameFi란 무엇인가요?',
    questionEn: 'What is TBURN GameFi?',
    answer: 'TBURN GameFi는 게임과 금융이 결합된 생태계입니다. 플레이투언(P2E) 게임에서 NFT 아이템을 획득하고, 토큰을 벌고, 토너먼트에 참가하여 보상을 받을 수 있습니다.',
    answerEn: 'TBURN GameFi is an ecosystem combining gaming and finance. In Play-to-Earn (P2E) games, you can acquire NFT items, earn tokens, and receive rewards by participating in tournaments.',
    relatedPage: '/app/gamefi',
    tags: ['GameFi', 'P2E', '게임']
  },
  {
    id: 57,
    category: 'GameFi',
    categoryKey: 'gamefi',
    question: '게임에서 어떻게 토큰을 벌 수 있나요?',
    questionEn: 'How can I earn tokens in games?',
    answer: '게임 플레이, 퀘스트 완료, PvP 대전 승리, 토너먼트 참가로 토큰을 획득합니다. 획득한 토큰은 게임 내 아이템 구매나 마켓플레이스에서 거래에 사용할 수 있습니다.',
    answerEn: 'Earn tokens through gameplay, quest completion, PvP victories, and tournament participation. Earned tokens can be used for in-game item purchases or trading on the marketplace.',
    relatedPage: '/app/gamefi',
    tags: ['토큰', '수익', 'P2E']
  },
  {
    id: 58,
    category: 'GameFi',
    categoryKey: 'gamefi',
    question: '게임 NFT 아이템은 어떻게 거래하나요?',
    questionEn: 'How do I trade game NFT items?',
    answer: '게임 내 NFT 아이템은 GameFi 마켓플레이스나 NFT 마켓플레이스에서 거래할 수 있습니다. 아이템의 희귀도, 스탯, 레벨에 따라 가치가 결정됩니다.',
    answerEn: 'In-game NFT items can be traded on the GameFi marketplace or NFT marketplace. Value is determined by item rarity, stats, and level.',
    relatedPage: '/app/gamefi',
    tags: ['아이템', '거래', 'NFT']
  },
  {
    id: 59,
    category: 'GameFi',
    categoryKey: 'gamefi',
    question: '게임 개발자 도구는 무엇이 있나요?',
    questionEn: 'What game developer tools are available?',
    answer: '게임 개발자를 위한 SDK, Unity/Unreal 플러그인, NFT 발행 API, 토큰 통합 가이드를 제공합니다. 게임 툴링 솔루션에서 상세 문서와 샘플 코드를 확인할 수 있습니다.',
    answerEn: 'We provide SDKs, Unity/Unreal plugins, NFT minting APIs, and token integration guides for game developers. Detailed documentation and sample code are available in Game Tooling solutions.',
    relatedPage: '/solutions/game-tooling',
    tags: ['개발도구', 'SDK', '게임개발']
  },
  {
    id: 60,
    category: 'GameFi',
    categoryKey: 'gamefi',
    question: '토너먼트에 어떻게 참가하나요?',
    questionEn: 'How do I participate in tournaments?',
    answer: 'GameFi 페이지에서 진행 중인 토너먼트를 확인하고 참가비를 지불하여 등록합니다. 순위에 따라 상금 풀에서 보상이 분배됩니다. 일부 토너먼트는 초대 전용입니다.',
    answerEn: 'Check ongoing tournaments on the GameFi page and register by paying the entry fee. Rewards from the prize pool are distributed based on rankings. Some tournaments are invite-only.',
    relatedPage: '/app/gamefi',
    tags: ['토너먼트', '대회', '경쟁']
  },
  {
    id: 61,
    category: 'GameFi',
    categoryKey: 'gamefi',
    question: '게이밍 사용 사례는 무엇이 있나요?',
    questionEn: 'What are the gaming use cases?',
    answer: 'P2E 게임, 가상 세계 토지/아이템 거래, 게임 길드 운영, e스포츠 베팅, 게임 내 경제 시스템 구축 등 다양한 사용 사례가 있습니다. 게이밍 솔루션 페이지에서 자세히 알아보세요.',
    answerEn: 'Use cases include P2E games, virtual world land/item trading, game guild operations, esports betting, and in-game economy systems. Learn more on the Gaming solutions page.',
    relatedPage: '/use-cases/gaming',
    tags: ['사용사례', '게이밍', '메타버스']
  },
  {
    id: 62,
    category: 'GameFi',
    categoryKey: 'gamefi',
    question: '게임 자산의 소유권은 어떻게 보장되나요?',
    questionEn: 'How is game asset ownership guaranteed?',
    answer: '모든 게임 자산은 블록체인에 NFT로 기록됩니다. 스마트 계약이 소유권을 보장하며, 게임 서비스가 종료되어도 자산은 지갑에 영구 보존됩니다.',
    answerEn: 'All game assets are recorded as NFTs on the blockchain. Smart contracts guarantee ownership, and assets are permanently preserved in your wallet even if the game service ends.',
    relatedPage: '/app/gamefi',
    tags: ['소유권', '영구', '블록체인']
  },

  // ============================================
  // 네트워크 (Network) - Questions 63-75
  // ============================================
  {
    id: 63,
    category: '네트워크',
    categoryKey: 'network',
    question: 'TBURN의 TPS는 얼마인가요?',
    questionEn: 'What is TBURN\'s TPS?',
    answer: 'TBURN 메인넷은 초당 520,000 트랜잭션(TPS)을 처리할 수 있습니다. AI 기반 동적 샤딩과 최적화된 BFT 합의를 통해 높은 처리량을 달성합니다.',
    answerEn: 'TBURN mainnet can process 520,000 transactions per second (TPS). High throughput is achieved through AI-based dynamic sharding and optimized BFT consensus.',
    relatedPage: '/network/status',
    tags: ['TPS', '성능', '처리량']
  },
  {
    id: 64,
    category: '네트워크',
    categoryKey: 'network',
    question: '블록 타임은 얼마나 걸리나요?',
    questionEn: 'How long is the block time?',
    answer: 'TBURN의 블록 타임은 100ms(0.1초)입니다. 이를 통해 거의 즉각적인 트랜잭션 확정이 가능하며, 사용자 경험을 크게 향상시킵니다.',
    answerEn: 'TBURN\'s block time is 100ms (0.1 seconds). This enables near-instant transaction finality, greatly enhancing user experience.',
    relatedPage: '/network/status',
    tags: ['블록타임', '속도', '확정']
  },
  {
    id: 65,
    category: '네트워크',
    categoryKey: 'network',
    question: 'AI 강화 BFT 합의란 무엇인가요?',
    questionEn: 'What is AI-enhanced BFT consensus?',
    answer: 'TBURN은 전통적인 BFT(Byzantine Fault Tolerance) 합의를 AI로 강화합니다. AI가 밸리데이터 성능 예측, 악의적 행동 탐지, 리더 선출 최적화를 수행하여 보안과 효율성을 높입니다.',
    answerEn: 'TBURN enhances traditional BFT (Byzantine Fault Tolerance) consensus with AI. AI performs validator performance prediction, malicious behavior detection, and leader election optimization to improve security and efficiency.',
    relatedPage: '/app/consensus',
    tags: ['합의', 'BFT', 'AI']
  },
  {
    id: 66,
    category: '네트워크',
    categoryKey: 'network',
    question: '샤딩이란 무엇인가요?',
    questionEn: 'What is sharding?',
    answer: '샤딩은 블록체인 네트워크를 여러 부분(샤드)으로 나누어 병렬 처리하는 확장성 기술입니다. TBURN은 AI 기반 동적 샤딩으로 부하에 따라 자동으로 샤드 수를 조절합니다.',
    answerEn: 'Sharding is a scalability technique that divides the blockchain network into multiple parts (shards) for parallel processing. TBURN uses AI-based dynamic sharding to automatically adjust shard count based on load.',
    relatedPage: '/app/sharding',
    tags: ['샤딩', '확장성', '병렬']
  },
  {
    id: 67,
    category: '네트워크',
    categoryKey: 'network',
    question: '크로스샤드 트랜잭션은 어떻게 작동하나요?',
    questionEn: 'How do cross-shard transactions work?',
    answer: '서로 다른 샤드에 있는 계정 간 트랜잭션은 크로스샤드 프로토콜을 통해 처리됩니다. 메시지 큐와 확인 메커니즘으로 원자성을 보장하며, 일반 트랜잭션보다 약간 더 긴 시간이 소요될 수 있습니다.',
    answerEn: 'Transactions between accounts on different shards are processed through the cross-shard protocol. Message queues and confirmation mechanisms guarantee atomicity, and may take slightly longer than regular transactions.',
    relatedPage: '/app/cross-shard',
    tags: ['크로스샤드', '트랜잭션', '샤드간']
  },
  {
    id: 68,
    category: '네트워크',
    categoryKey: 'network',
    question: '밸리데이터는 몇 명인가요?',
    questionEn: 'How many validators are there?',
    answer: '현재 활성 밸리데이터 수는 네트워크 상태 페이지에서 실시간으로 확인할 수 있습니다. TBURN은 탈중앙화를 위해 지속적으로 밸리데이터를 확대하고 있습니다.',
    answerEn: 'The current number of active validators can be checked in real-time on the network status page. TBURN is continuously expanding validators for decentralization.',
    relatedPage: '/network/validators',
    tags: ['밸리데이터', '수', '탈중앙화']
  },
  {
    id: 69,
    category: '네트워크',
    categoryKey: 'network',
    question: 'RPC 엔드포인트는 어디서 확인하나요?',
    questionEn: 'Where can I find RPC endpoints?',
    answer: 'RPC 페이지에서 메인넷과 테스트넷의 공식 RPC 엔드포인트를 확인할 수 있습니다. HTTP와 WebSocket 엔드포인트가 제공되며, 체인 ID와 블록 탐색기 URL도 함께 안내됩니다.',
    answerEn: 'Official RPC endpoints for mainnet and testnet can be found on the RPC page. HTTP and WebSocket endpoints are provided, along with chain ID and block explorer URL.',
    relatedPage: '/network/rpc',
    tags: ['RPC', '엔드포인트', '연결']
  },
  {
    id: 70,
    category: '네트워크',
    categoryKey: 'network',
    question: '네트워크 상태를 어떻게 모니터링하나요?',
    questionEn: 'How do I monitor network status?',
    answer: '네트워크 상태 페이지에서 TPS, 블록 높이, 활성 밸리데이터, 총 스테이킹량 등 실시간 지표를 확인할 수 있습니다. WebSocket 연결을 통해 실시간 업데이트를 받을 수 있습니다.',
    answerEn: 'On the Network Status page, you can check real-time metrics including TPS, block height, active validators, and total staked amount. Real-time updates are available through WebSocket connections.',
    relatedPage: '/network/status',
    tags: ['모니터링', '상태', '지표']
  },
  {
    id: 71,
    category: '네트워크',
    categoryKey: 'network',
    question: 'AI 오케스트레이션이란?',
    questionEn: 'What is AI Orchestration?',
    answer: 'AI 오케스트레이션은 TBURN의 AI 시스템이 네트워크를 자동으로 최적화하는 것입니다. 밸리데이터 스케줄링, 샤드 관리, 거버넌스 사전 검증, 이상 탐지 등을 AI가 자율적으로 수행합니다.',
    answerEn: 'AI Orchestration is TBURN\'s AI system automatically optimizing the network. AI autonomously performs validator scheduling, shard management, governance pre-validation, and anomaly detection.',
    relatedPage: '/app/ai',
    tags: ['AI', '오케스트레이션', '자동화']
  },
  {
    id: 72,
    category: '네트워크',
    categoryKey: 'network',
    question: '합의 과정을 시각적으로 볼 수 있나요?',
    questionEn: 'Can I visualize the consensus process?',
    answer: '합의 페이지에서 BFT 합의 라운드, 투표 진행, 블록 제안 과정을 실시간으로 시각화하여 볼 수 있습니다. 각 밸리데이터의 참여 상태와 서명도 확인할 수 있습니다.',
    answerEn: 'On the Consensus page, you can visualize BFT consensus rounds, voting progress, and block proposal processes in real-time. You can also check each validator\'s participation status and signatures.',
    relatedPage: '/app/consensus',
    tags: ['합의', '시각화', '라운드']
  },
  {
    id: 73,
    category: '네트워크',
    categoryKey: 'network',
    question: 'TBURN은 EVM 호환인가요?',
    questionEn: 'Is TBURN EVM compatible?',
    answer: 'TBURN은 완전한 EVM 호환성을 제공합니다. Ethereum용으로 작성된 스마트 계약과 도구를 그대로 사용할 수 있으며, EVM 마이그레이션 가이드에서 상세한 전환 방법을 안내합니다.',
    answerEn: 'TBURN provides full EVM compatibility. Smart contracts and tools written for Ethereum can be used as-is, and the EVM Migration guide provides detailed transition methods.',
    relatedPage: '/developers/evm-migration',
    tags: ['EVM', '호환성', 'Ethereum']
  },
  {
    id: 74,
    category: '네트워크',
    categoryKey: 'network',
    question: '양자 내성 서명이란?',
    questionEn: 'What are quantum-resistant signatures?',
    answer: 'TBURN은 양자 컴퓨터 공격에 대비한 양자 내성 암호화 서명을 지원합니다. 미래의 양자 컴퓨팅 위협으로부터 자산과 트랜잭션을 보호합니다.',
    answerEn: 'TBURN supports quantum-resistant cryptographic signatures for protection against quantum computer attacks. It protects assets and transactions from future quantum computing threats.',
    relatedPage: '/learn/whitepaper',
    tags: ['양자', '보안', '암호화']
  },
  {
    id: 75,
    category: '네트워크',
    categoryKey: 'network',
    question: 'DePIN 사용 사례는 무엇인가요?',
    questionEn: 'What are DePIN use cases?',
    answer: 'DePIN(분산 물리 인프라 네트워크)은 TBURN에서 IoT 기기, 무선 네트워크, 센서 데이터 등 물리적 인프라를 토큰화하고 관리합니다. 참여자는 인프라 제공으로 보상을 받습니다.',
    answerEn: 'DePIN (Decentralized Physical Infrastructure Networks) tokenizes and manages physical infrastructure like IoT devices, wireless networks, and sensor data on TBURN. Participants earn rewards for providing infrastructure.',
    relatedPage: '/use-cases/depin',
    tags: ['DePIN', 'IoT', '인프라']
  },

  // ============================================
  // 개발자 (Developers) - Questions 76-85
  // ============================================
  {
    id: 76,
    category: '개발자',
    categoryKey: 'developers',
    question: 'TBURN 개발을 어떻게 시작하나요?',
    questionEn: 'How do I start developing on TBURN?',
    answer: 'Quickstart 가이드에서 개발 환경 설정부터 첫 스마트 계약 배포까지 단계별로 안내합니다. Node.js, Hardhat 또는 Foundry를 설치하고 테스트넷에서 시작하세요.',
    answerEn: 'The Quickstart guide provides step-by-step instructions from development environment setup to first smart contract deployment. Install Node.js, Hardhat or Foundry, and start on testnet.',
    relatedPage: '/developers/quickstart',
    tags: ['시작', '개발', '가이드']
  },
  {
    id: 77,
    category: '개발자',
    categoryKey: 'developers',
    question: 'SDK는 어떤 언어를 지원하나요?',
    questionEn: 'What languages does the SDK support?',
    answer: 'JavaScript/TypeScript, Python, Go, Rust SDK를 제공합니다. 각 SDK는 지갑 연결, 트랜잭션 생성, 스마트 계약 상호작용을 지원합니다.',
    answerEn: 'We provide JavaScript/TypeScript, Python, Go, and Rust SDKs. Each SDK supports wallet connection, transaction creation, and smart contract interaction.',
    relatedPage: '/developers/sdk',
    tags: ['SDK', '언어', '도구']
  },
  {
    id: 78,
    category: '개발자',
    categoryKey: 'developers',
    question: 'API 문서는 어디서 확인하나요?',
    questionEn: 'Where can I find API documentation?',
    answer: 'API 문서 페이지에서 REST API, GraphQL, WebSocket API의 전체 레퍼런스를 확인할 수 있습니다. 인증, 요청 형식, 응답 스키마, 에러 코드가 상세히 문서화되어 있습니다.',
    answerEn: 'On the API documentation page, you can find complete references for REST API, GraphQL, and WebSocket API. Authentication, request format, response schema, and error codes are detailed.',
    relatedPage: '/developers/api',
    tags: ['API', '문서', '레퍼런스']
  },
  {
    id: 79,
    category: '개발자',
    categoryKey: 'developers',
    question: '스마트 계약을 어떻게 배포하나요?',
    questionEn: 'How do I deploy smart contracts?',
    answer: 'Solidity로 계약을 작성하고 Hardhat/Foundry로 컴파일합니다. 테스트넷에서 먼저 테스트한 후 메인넷에 배포합니다. 계약 페이지에서 검증된 계약 예제를 참고할 수 있습니다.',
    answerEn: 'Write contracts in Solidity and compile with Hardhat/Foundry. Test on testnet first, then deploy to mainnet. You can refer to verified contract examples on the Contracts page.',
    relatedPage: '/developers/contracts',
    tags: ['배포', '스마트계약', 'Solidity']
  },
  {
    id: 80,
    category: '개발자',
    categoryKey: 'developers',
    question: 'WebSocket API는 어떻게 사용하나요?',
    questionEn: 'How do I use the WebSocket API?',
    answer: 'WebSocket 연결로 블록, 트랜잭션, 이벤트를 실시간으로 구독할 수 있습니다. 개발자 WebSocket 페이지에서 연결 URL, 구독 메시지 형식, 예제 코드를 확인하세요.',
    answerEn: 'WebSocket connections allow real-time subscription to blocks, transactions, and events. Check the Developer WebSocket page for connection URL, subscription message format, and example code.',
    relatedPage: '/developers/websocket',
    tags: ['WebSocket', '실시간', '구독']
  },
  {
    id: 81,
    category: '개발자',
    categoryKey: 'developers',
    question: 'CLI 도구는 무엇이 있나요?',
    questionEn: 'What CLI tools are available?',
    answer: 'TBURN CLI는 계정 관리, 트랜잭션 전송, 계약 배포, 네트워크 조회를 터미널에서 수행할 수 있습니다. npm으로 설치하고 tburn 명령어로 사용합니다.',
    answerEn: 'TBURN CLI allows account management, transaction sending, contract deployment, and network queries from the terminal. Install via npm and use with the tburn command.',
    relatedPage: '/developers/cli',
    tags: ['CLI', '터미널', '도구']
  },
  {
    id: 82,
    category: '개발자',
    categoryKey: 'developers',
    question: 'Ethereum에서 마이그레이션하려면?',
    questionEn: 'How do I migrate from Ethereum?',
    answer: 'TBURN은 EVM 호환이므로 대부분의 계약은 수정 없이 배포 가능합니다. EVM 마이그레이션 가이드에서 RPC 변경, 체인 ID 설정, 주의사항을 확인하세요.',
    answerEn: 'Since TBURN is EVM compatible, most contracts can be deployed without modification. Check the EVM Migration guide for RPC changes, chain ID settings, and considerations.',
    relatedPage: '/developers/evm-migration',
    tags: ['마이그레이션', 'Ethereum', 'EVM']
  },
  {
    id: 83,
    category: '개발자',
    categoryKey: 'developers',
    question: '설치 요구사항은 무엇인가요?',
    questionEn: 'What are the installation requirements?',
    answer: 'Node.js 18+, npm 또는 yarn이 필요합니다. Solidity 개발을 위해 Hardhat 또는 Foundry를 권장합니다. Installation 페이지에서 운영체제별 상세 가이드를 확인하세요.',
    answerEn: 'Node.js 18+ and npm or yarn are required. Hardhat or Foundry is recommended for Solidity development. Check the Installation page for OS-specific detailed guides.',
    relatedPage: '/developers/installation',
    tags: ['설치', '요구사항', '환경']
  },
  {
    id: 84,
    category: '개발자',
    categoryKey: 'developers',
    question: '테스트 토큰은 어디서 받나요?',
    questionEn: 'Where can I get test tokens?',
    answer: '테스트넷 faucet에서 무료 테스트 TB를 받을 수 있습니다. 테스트넷 RPC 페이지에서 faucet 링크와 사용 방법을 확인하세요. 24시간마다 요청할 수 있습니다.',
    answerEn: 'You can get free test TB from the testnet faucet. Check the Testnet RPC page for faucet links and usage. Requests can be made every 24 hours.',
    relatedPage: '/testnet-rpc',
    tags: ['테스트넷', 'faucet', '토큰']
  },
  {
    id: 85,
    category: '개발자',
    categoryKey: 'developers',
    question: 'Actions & Blinks란?',
    questionEn: 'What are Actions & Blinks?',
    answer: 'Actions & Blinks는 블록체인 작업을 URL로 공유할 수 있는 기능입니다. 복잡한 트랜잭션도 링크 하나로 공유하고 실행할 수 있어 사용자 온보딩을 간소화합니다.',
    answerEn: 'Actions & Blinks is a feature to share blockchain operations as URLs. Complex transactions can be shared and executed with a single link, simplifying user onboarding.',
    relatedPage: '/solutions/actions-blinks',
    tags: ['Actions', 'Blinks', 'URL']
  },

  // ============================================
  // 솔루션 (Solutions) - Questions 86-92
  // ============================================
  {
    id: 86,
    category: '솔루션',
    categoryKey: 'solutions',
    question: '토큰 확장 기능이란?',
    questionEn: 'What are token extensions?',
    answer: 'TBC-20 토큰에 추가 기능(동결, 전송 제한, 이자, 메타데이터)을 확장할 수 있습니다. 규정 준수가 필요한 보안 토큰이나 특수 목적 토큰에 활용됩니다.',
    answerEn: 'TBC-20 tokens can be extended with additional features (freezing, transfer restrictions, interest, metadata). Used for security tokens or special-purpose tokens requiring compliance.',
    relatedPage: '/solutions/token-extensions',
    tags: ['토큰', '확장', 'TBC-20']
  },
  {
    id: 87,
    category: '솔루션',
    categoryKey: 'solutions',
    question: '허가형 블록체인 솔루션이란?',
    questionEn: 'What are permissioned blockchain solutions?',
    answer: '기업이 접근 제어가 필요한 프라이빗 네트워크를 구축할 수 있습니다. TBURN의 기술을 기반으로 허가된 참가자만 접근 가능한 엔터프라이즈 블록체인을 운영합니다.',
    answerEn: 'Enterprises can build private networks with access control. Based on TBURN technology, operate enterprise blockchains accessible only to authorized participants.',
    relatedPage: '/solutions/permissioned',
    tags: ['허가형', '프라이빗', '기업']
  },
  {
    id: 88,
    category: '솔루션',
    categoryKey: 'solutions',
    question: '상거래(Commerce) 솔루션은?',
    questionEn: 'What are Commerce solutions?',
    answer: '온라인/오프라인 상점에서 TB 결제를 받을 수 있는 통합 솔루션입니다. 결제 API, POS 통합, 정산 시스템, 세금 계산 도구를 제공합니다.',
    answerEn: 'An integrated solution for accepting TB payments in online/offline stores. Provides payment API, POS integration, settlement system, and tax calculation tools.',
    relatedPage: '/solutions/commerce',
    tags: ['상거래', '결제', 'POS']
  },
  {
    id: 89,
    category: '솔루션',
    categoryKey: 'solutions',
    question: '금융 솔루션은 무엇이 있나요?',
    questionEn: 'What financial solutions are available?',
    answer: '금융 기관을 위한 커스터디, 트레이딩, 결제, 자산 관리 솔루션을 제공합니다. 규정 준수 도구와 감사 추적 기능으로 기관 요구사항을 충족합니다.',
    answerEn: 'Provides custody, trading, payment, and asset management solutions for financial institutions. Compliance tools and audit trail features meet institutional requirements.',
    relatedPage: '/solutions/financial',
    tags: ['금융', '기관', '커스터디']
  },
  {
    id: 90,
    category: '솔루션',
    categoryKey: 'solutions',
    question: 'AI 기능은 무엇이 있나요?',
    questionEn: 'What AI features are available?',
    answer: 'AI 기반 번 최적화, 거버넌스 분석, 브릿지 리스크 평가, 이상 탐지, 밸리데이터 스케줄링을 제공합니다. 다중 AI 모델(Gemini, Claude, GPT-4o, Grok)이 통합되어 있습니다.',
    answerEn: 'Provides AI-based burn optimization, governance analysis, bridge risk assessment, anomaly detection, and validator scheduling. Multiple AI models (Gemini, Claude, GPT-4o, Grok) are integrated.',
    relatedPage: '/solutions/ai-features',
    tags: ['AI', '최적화', '분석']
  },
  {
    id: 91,
    category: '솔루션',
    categoryKey: 'solutions',
    question: '엔터프라이즈 사용 사례는?',
    questionEn: 'What are enterprise use cases?',
    answer: '공급망 추적, 디지털 인증, 데이터 무결성 검증, 내부 토큰 시스템 구축 등 기업 블록체인 활용 사례를 제공합니다. 전담 지원과 SLA가 제공됩니다.',
    answerEn: 'Provides enterprise blockchain use cases including supply chain tracking, digital certification, data integrity verification, and internal token systems. Dedicated support and SLA provided.',
    relatedPage: '/use-cases/enterprise',
    tags: ['엔터프라이즈', '기업', '공급망']
  },
  {
    id: 92,
    category: '솔루션',
    categoryKey: 'solutions',
    question: '토큰화(Tokenization)란?',
    questionEn: 'What is tokenization?',
    answer: '실물 자산(부동산, 예술품, 상품)을 블록체인 토큰으로 변환하는 것입니다. 분할 소유권, 유동성 증가, 24/7 거래가 가능해집니다.',
    answerEn: 'Converting real assets (real estate, art, commodities) into blockchain tokens. Enables fractional ownership, increased liquidity, and 24/7 trading.',
    relatedPage: '/use-cases/tokenization',
    tags: ['토큰화', 'RWA', '자산']
  },

  // ============================================
  // 커뮤니티 (Community) - Questions 93-96
  // ============================================
  {
    id: 93,
    category: '커뮤니티',
    categoryKey: 'community',
    question: '뉴스와 공지는 어디서 확인하나요?',
    questionEn: 'Where can I check news and announcements?',
    answer: '커뮤니티 뉴스 페이지에서 최신 업데이트, 파트너십 발표, 기술 개선 소식을 확인할 수 있습니다. 뉴스레터를 구독하면 이메일로도 받아볼 수 있습니다.',
    answerEn: 'Check the Community News page for latest updates, partnership announcements, and technical improvements. Subscribe to the newsletter to receive updates via email.',
    relatedPage: '/community/news',
    tags: ['뉴스', '공지', '업데이트']
  },
  {
    id: 94,
    category: '커뮤니티',
    categoryKey: 'community',
    question: '이벤트에 어떻게 참여하나요?',
    questionEn: 'How do I participate in events?',
    answer: '커뮤니티 이벤트 페이지에서 진행 중인 에어드랍, 캠페인, 밋업 정보를 확인하세요. 참여 조건을 충족하고 등록하면 보상을 받을 수 있습니다.',
    answerEn: 'Check the Community Events page for ongoing airdrops, campaigns, and meetup information. Meet participation requirements and register to receive rewards.',
    relatedPage: '/community/events',
    tags: ['이벤트', '에어드랍', '캠페인']
  },
  {
    id: 95,
    category: '커뮤니티',
    categoryKey: 'community',
    question: '거버넌스 제안은 어떻게 하나요?',
    questionEn: 'How do I make governance proposals?',
    answer: '일정량의 TB를 스테이킹하면 거버넌스 제안을 생성할 수 있습니다. 제안 형식에 맞춰 내용을 작성하고 제출하면 커뮤니티 투표가 진행됩니다.',
    answerEn: 'Staking a certain amount of TB allows you to create governance proposals. Write content according to the proposal format and submit for community voting.',
    relatedPage: '/user',
    tags: ['거버넌스', '제안', '투표']
  },
  {
    id: 96,
    category: '커뮤니티',
    categoryKey: 'community',
    question: '커뮤니티 허브에서 무엇을 할 수 있나요?',
    questionEn: 'What can I do on the Community Hub?',
    answer: '커뮤니티 허브에서 다른 사용자와 토론하고, 프로젝트를 소개하고, 피드백을 공유할 수 있습니다. 공식 공지사항과 개발 업데이트도 확인할 수 있습니다.',
    answerEn: 'On the Community Hub, you can discuss with other users, introduce projects, and share feedback. You can also check official announcements and development updates.',
    relatedPage: '/community/hub',
    tags: ['허브', '토론', '소통']
  },

  // ============================================
  // 보안 & 토크노믹스 (Security & Tokenomics) - Questions 97-100
  // ============================================
  {
    id: 97,
    category: '보안',
    categoryKey: 'security',
    question: '자산을 안전하게 보관하는 방법은?',
    questionEn: 'How do I keep my assets safe?',
    answer: '1) 하드웨어 지갑 사용 권장, 2) 개인키/시드구문 절대 공유 금지, 3) 피싱 사이트 주의, 4) 공식 URL만 사용, 5) 2FA 활성화. 대량 자산은 반드시 콜드 월렛에 보관하세요.',
    answerEn: '1) Use hardware wallet, 2) Never share private key/seed phrase, 3) Beware of phishing sites, 4) Use only official URLs, 5) Enable 2FA. Store large assets in cold wallets.',
    relatedPage: '/solutions/wallets',
    tags: ['보안', '안전', '지갑']
  },
  {
    id: 98,
    category: '보안',
    categoryKey: 'security',
    question: '스캠을 어떻게 구별하나요?',
    questionEn: 'How do I identify scams?',
    answer: '공식 채널만 신뢰하세요. 개인키나 시드구문을 요구하는 것은 100% 스캠입니다. "무료 토큰" "긴급 업그레이드" 등 급박함을 조성하는 메시지를 경계하세요.',
    answerEn: 'Trust only official channels. Requests for private keys or seed phrases are 100% scams. Beware of messages creating urgency like "free tokens" or "urgent upgrade".',
    relatedPage: '/community/hub',
    tags: ['스캠', '사기', '주의']
  },
  {
    id: 99,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: 'TB 토큰 총 발행량은 얼마인가요?',
    questionEn: 'What is the total supply of TB tokens?',
    answer: 'TB 토큰의 초기 발행량과 현재 유통량은 토크노믹스 페이지에서 확인할 수 있습니다. 번 메커니즘으로 인해 총 공급량은 지속적으로 감소합니다.',
    answerEn: 'Initial supply and current circulating supply of TB tokens can be checked on the Tokenomics page. Due to the burn mechanism, total supply continuously decreases.',
    relatedPage: '/learn/tokenomics',
    tags: ['발행량', '공급', '토큰']
  },
  {
    id: 100,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: '번(Burn) 메커니즘은 어떻게 작동하나요?',
    questionEn: 'How does the burn mechanism work?',
    answer: '모든 전송에 0.5% 번 수수료가 적용되어 해당 금액이 영구 소각됩니다. 또한 네트워크 수수료 일부도 소각됩니다. 이 디플레이션 모델이 토큰 가치를 지지합니다.',
    answerEn: 'A 0.5% burn fee applies to all transfers, permanently burning that amount. Part of network fees are also burned. This deflationary model supports token value.',
    relatedPage: '/learn/tokenomics',
    tags: ['번', '소각', '디플레이션']
  },

  // ============================================
  // 익스플로러 & RPC (Explorer & RPC) - Questions 101-105
  // ============================================
  {
    id: 101,
    category: '네트워크',
    categoryKey: 'network',
    question: 'TBURNscan에서 무엇을 확인할 수 있나요?',
    questionEn: 'What can I view on TBURNscan?',
    answer: 'TBURNscan은 TBURN 메인넷(Chain ID 6000)의 공식 블록체인 탐색기입니다. 실시간 블록 생성(100ms), 트랜잭션 내역, 지갑 잔액, 스마트 계약, 64개 샤드 상태, 125개 밸리데이터 정보를 투명하게 조회할 수 있습니다. 현재 블록 높이, TPS, 총 소각량 등 네트워크 통계도 확인 가능합니다.',
    answerEn: 'TBURNscan is the official blockchain explorer for TBURN mainnet (Chain ID 6000). You can transparently view real-time block production (100ms), transaction history, wallet balances, smart contracts, 64 shard states, and 125 validator information. Network statistics like current block height, TPS, and total burn amount are also available.',
    relatedPage: '/scan',
    tags: ['TBURNscan', '익스플로러', '블록', '트랜잭션']
  },
  {
    id: 102,
    category: '네트워크',
    categoryKey: 'network',
    question: 'RPC 엔드포인트 정보는 어디서 확인하나요?',
    questionEn: 'Where can I find RPC endpoint information?',
    answer: 'RPC 페이지에서 메인넷/테스트넷 RPC 엔드포인트, WebSocket URL, Chain ID(6000), 네이티브 통화 정보를 확인할 수 있습니다. 인터랙티브 API 테스터로 직접 RPC 호출을 시험하고, SDK 코드 예제와 성능 벤치마크 도구도 제공됩니다.',
    answerEn: 'The RPC page provides mainnet/testnet RPC endpoints, WebSocket URLs, Chain ID (6000), and native currency information. Test RPC calls directly with the interactive API tester, and access SDK code examples and performance benchmarking tools.',
    relatedPage: '/rpc',
    tags: ['RPC', '엔드포인트', 'API', 'Chain ID']
  },
  {
    id: 103,
    category: '네트워크',
    categoryKey: 'network',
    question: '밸리데이터 페이지에서 무엇을 볼 수 있나요?',
    questionEn: 'What can I see on the Validators page?',
    answer: '125개 제네시스 밸리데이터의 상세 정보를 확인할 수 있습니다. 각 밸리데이터의 스테이킹 금액, 위임자 수, 업타임(가동률), 커미션율, 성능 점수, 블록 제안/검증 통계를 조회합니다. 5단계 성능 티어(Diamond, Platinum, Gold, Silver, Bronze)와 인센티브 보너스 정보도 표시됩니다.',
    answerEn: 'View detailed information on 125 genesis validators. Check each validator\'s staking amount, delegator count, uptime, commission rate, performance score, and block proposal/verification statistics. 5-tier performance levels (Diamond, Platinum, Gold, Silver, Bronze) and incentive bonus information are also displayed.',
    relatedPage: '/network/validators',
    tags: ['밸리데이터', '스테이킹', '성능', '125']
  },
  {
    id: 104,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: '토큰 배포 스케줄은 어떻게 되나요?',
    questionEn: 'What is the token distribution schedule?',
    answer: 'Token Schedule 페이지에서 20년 토큰 배포 계획을 확인할 수 있습니다. 500B TBURN 총 공급량이 4가지 수탁 메커니즘으로 배포됩니다: 프로토콜 자동(22%), 베스팅 계약(31%), 파운데이션 멀티시그(17%), 커뮤니티 풀(30%). 연도별 배포량과 누적 진행률을 시각화된 차트로 확인 가능합니다.',
    answerEn: 'The Token Schedule page shows the 20-year token distribution plan. 500B TBURN total supply is distributed through 4 custody mechanisms: Protocol Automatic (22%), Vesting Contract (31%), Foundation Multisig (17%), Community Pool (30%). Annual distribution amounts and cumulative progress are visualized in charts.',
    relatedPage: '/token-schedule',
    tags: ['토큰 스케줄', '배포', '베스팅', '20년']
  },
  {
    id: 105,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: '토큰 상세 정보는 어디서 확인하나요?',
    questionEn: 'Where can I view token details?',
    answer: 'Token Details 페이지에서 TBURN 토큰의 핵심 정보를 확인합니다. 500B 총 공급량, 현재 유통량, 총 소각량, 실시간 가격, 시가총액, 24시간 거래량 등 상세 통계를 제공합니다. TBC-20 토큰 표준 정보와 계약 주소도 확인 가능합니다.',
    answerEn: 'The Token Details page shows core TBURN token information. Detailed statistics include 500B total supply, current circulating supply, total burned amount, real-time price, market cap, and 24-hour trading volume. TBC-20 token standard info and contract address are also available.',
    relatedPage: '/token-details',
    tags: ['토큰 상세', '공급량', '가격', '500B']
  },

  // ============================================
  // 토큰 배포 프로그램 (Token Distribution Programs) - Questions 106-115
  // ============================================
  {
    id: 106,
    category: '커뮤니티',
    categoryKey: 'community',
    question: '에어드랍(Airdrop) 프로그램이란?',
    questionEn: 'What is the Airdrop program?',
    answer: '에어드랍은 초기 사용자와 커뮤니티 참여자에게 무료 TBURN 토큰을 배포하는 프로그램입니다. 지갑 연결, 소셜 미디어 팔로우, 특정 조건 충족 시 토큰을 받을 수 있습니다. 자격 조건 확인 및 청구는 Airdrop 페이지에서 가능합니다.',
    answerEn: 'Airdrop is a program distributing free TBURN tokens to early users and community participants. Receive tokens by connecting wallet, following social media, and meeting specific conditions. Check eligibility and claim on the Airdrop page.',
    relatedPage: '/airdrop',
    tags: ['에어드랍', '무료', '토큰 배포']
  },
  {
    id: 107,
    category: '커뮤니티',
    categoryKey: 'community',
    question: '리퍼럴(Referral) 프로그램은 어떻게 작동하나요?',
    questionEn: 'How does the Referral program work?',
    answer: '고유 리퍼럴 링크로 새 사용자를 초대하면 보상을 받습니다. 초대받은 사용자가 지갑을 연결하고 특정 활동을 완료하면 양쪽 모두에게 TBURN 토큰이 지급됩니다. 리퍼럴 통계와 보상은 Referral 페이지에서 추적 가능합니다.',
    answerEn: 'Invite new users with your unique referral link to earn rewards. When invited users connect wallet and complete specific activities, both parties receive TBURN tokens. Track referral statistics and rewards on the Referral page.',
    relatedPage: '/referral',
    tags: ['리퍼럴', '초대', '보상']
  },
  {
    id: 108,
    category: '커뮤니티',
    categoryKey: 'community',
    question: '이벤트(Events) 페이지에서는 무엇을 하나요?',
    questionEn: 'What can I do on the Events page?',
    answer: 'Events 페이지에서 진행 중인 캠페인, 밋업, 해커톤, 커뮤니티 이벤트 정보를 확인합니다. 이벤트 참여로 특별 보상과 NFT를 획득할 수 있습니다. 지난 이벤트 기록과 당첨자 발표도 확인 가능합니다.',
    answerEn: 'The Events page shows ongoing campaigns, meetups, hackathons, and community events. Participate to earn special rewards and NFTs. Past event records and winner announcements are also available.',
    relatedPage: '/events',
    tags: ['이벤트', '캠페인', '밋업']
  },
  {
    id: 109,
    category: '커뮤니티',
    categoryKey: 'community',
    question: '커뮤니티 프로그램(Community Program)이란?',
    questionEn: 'What is the Community Program?',
    answer: '커뮤니티 프로그램은 적극적인 커뮤니티 기여자에게 보상하는 시스템입니다. 콘텐츠 제작, 번역, 모더레이션, 기술 지원 등 다양한 활동으로 TBURN 토큰을 획득할 수 있습니다. 30%의 커뮤니티 풀에서 보상이 지급됩니다.',
    answerEn: 'Community Program rewards active community contributors. Earn TBURN tokens through content creation, translation, moderation, technical support, and more. Rewards are distributed from the 30% Community Pool.',
    relatedPage: '/community-program',
    tags: ['커뮤니티', '프로그램', '기여']
  },
  {
    id: 110,
    category: '커뮤니티',
    categoryKey: 'community',
    question: 'DAO 거버넌스(DAO Governance)란 무엇인가요?',
    questionEn: 'What is DAO Governance?',
    answer: 'DAO Governance는 TBURN 토큰 홀더가 네트워크 의사결정에 참여하는 탈중앙화 거버넌스 시스템입니다. 스테이킹된 토큰으로 제안 생성과 투표가 가능하며, 커뮤니티 풀(30%) 자금 사용, 프로토콜 업그레이드, 파라미터 변경 등을 결정합니다.',
    answerEn: 'DAO Governance is a decentralized governance system where TBURN token holders participate in network decisions. Staked tokens enable proposal creation and voting to decide Community Pool (30%) fund usage, protocol upgrades, and parameter changes.',
    relatedPage: '/dao-governance',
    tags: ['DAO', '거버넌스', '투표', '제안']
  },

  // ============================================
  // 보상 시스템 (Reward Systems) - Questions 111-115
  // ============================================
  {
    id: 111,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: '블록 리워드(Block Rewards)는 어떻게 배분되나요?',
    questionEn: 'How are Block Rewards distributed?',
    answer: '블록 리워드는 프로토콜 자동(22%) 수탁 메커니즘에서 배분됩니다. 블록 제안자(40%), 검증자(50%), 소각(10%)으로 나뉘며, 1000블록(약 100초)마다 에포크 기반으로 정산됩니다. 100ms 블록 타임으로 빠른 보상 사이클이 운영됩니다.',
    answerEn: 'Block Rewards are distributed from Protocol Automatic (22%) custody mechanism. Split between block proposer (40%), verifiers (50%), and burn (10%), settled on epoch basis every 1000 blocks (~100 seconds). Fast reward cycles operate with 100ms block time.',
    relatedPage: '/block-rewards',
    tags: ['블록 리워드', '보상', '프로토콜']
  },
  {
    id: 112,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: '밸리데이터 인센티브(Validator Incentives)란?',
    questionEn: 'What are Validator Incentives?',
    answer: '125개 제네시스 밸리데이터를 위한 5단계 성능 기반 보너스 시스템입니다. Diamond(+25%), Platinum(+20%), Gold(+15%), Silver(+10%), Bronze(기본) 티어로 나뉘며, 업타임과 블록 검증 성과에 따라 추가 보상이 지급됩니다. 연속 성과 보너스와 일관성 보너스도 제공됩니다.',
    answerEn: 'A 5-tier performance-based bonus system for 125 genesis validators. Tiers include Diamond (+25%), Platinum (+20%), Gold (+15%), Silver (+10%), and Bronze (base). Additional rewards based on uptime and block verification performance. Streak bonuses and consistency bonuses also available.',
    relatedPage: '/validator-incentives',
    tags: ['밸리데이터', '인센티브', '성능', '티어']
  },
  {
    id: 113,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: '에코시스템 펀드(Ecosystem Fund)란?',
    questionEn: 'What is the Ecosystem Fund?',
    answer: '에코시스템 펀드는 TBURN 생태계 성장을 위한 전략적 자금입니다. 커뮤니티 풀(30%)에서 관리되며, 개발자 그랜트, 기술 지원, 생태계 프로젝트 투자, 해커톤 상금 등에 사용됩니다. DAO 거버넌스 투표를 통해 자금 사용이 결정됩니다.',
    answerEn: 'Ecosystem Fund is strategic funding for TBURN ecosystem growth. Managed from Community Pool (30%), used for developer grants, technical support, ecosystem project investments, and hackathon prizes. Fund usage is decided through DAO governance voting.',
    relatedPage: '/ecosystem-fund',
    tags: ['에코시스템', '펀드', '그랜트']
  },

  // ============================================
  // 파트너십 & 마케팅 (Partnership & Marketing) - Questions 114-117
  // ============================================
  {
    id: 114,
    category: '커뮤니티',
    categoryKey: 'community',
    question: '파트너십 프로그램(Partnership Program)이란?',
    questionEn: 'What is the Partnership Program?',
    answer: 'TBURN과 전략적 협력을 원하는 기업/프로젝트를 위한 프로그램입니다. 기술 통합, 공동 마케팅, 생태계 확장을 위한 지원과 토큰 인센티브가 제공됩니다. 파운데이션 멀티시그(17%)의 전략적 준비금에서 파트너 지원 자금이 관리됩니다.',
    answerEn: 'Program for companies/projects seeking strategic collaboration with TBURN. Provides support and token incentives for technical integration, joint marketing, and ecosystem expansion. Partner support funds managed from Foundation Multisig (17%) strategic reserves.',
    relatedPage: '/partnership-program',
    tags: ['파트너십', '협력', '통합']
  },
  {
    id: 115,
    category: '커뮤니티',
    categoryKey: 'community',
    question: '마케팅 프로그램(Marketing Program)이란?',
    questionEn: 'What is the Marketing Program?',
    answer: 'TBURN 브랜드 인지도와 사용자 확보를 위한 마케팅 활동 프로그램입니다. 인플루언서 협업, 광고 캠페인, 콘텐츠 제작, 이벤트 후원 등이 포함됩니다. 커뮤니티 풀(30%)에서 마케팅 예산이 지원됩니다.',
    answerEn: 'Marketing activity program for TBURN brand awareness and user acquisition. Includes influencer collaborations, ad campaigns, content creation, and event sponsorships. Marketing budget supported from Community Pool (30%).',
    relatedPage: '/marketing-program',
    tags: ['마케팅', '캠페인', '브랜드']
  },
  {
    id: 116,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: '전략적 파트너(Strategic Partner) 배분이란?',
    questionEn: 'What is Strategic Partner allocation?',
    answer: '전략적 파트너 배분은 TBURN 성장에 핵심적인 파트너사에 대한 토큰 할당입니다. 베스팅 계약(31%) 메커니즘을 통해 시간 잠금 방식으로 배포되며, 파트너의 장기적 참여와 생태계 기여를 보장합니다.',
    answerEn: 'Strategic Partner allocation is token allocation for partners crucial to TBURN growth. Distributed through Vesting Contract (31%) mechanism with time-lock, ensuring partners\' long-term participation and ecosystem contribution.',
    relatedPage: '/strategic-partner',
    tags: ['전략적 파트너', '배분', '베스팅']
  },
  {
    id: 117,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: '어드바이저 프로그램(Advisor Program)이란?',
    questionEn: 'What is the Advisor Program?',
    answer: '어드바이저 프로그램은 업계 전문가와 자문위원에 대한 토큰 보상 시스템입니다. 베스팅 계약(31%)을 통해 2-4년 베스팅 기간으로 배포되며, 전략 조언, 네트워크 연결, 기술 자문 등에 대한 대가입니다.',
    answerEn: 'Advisor Program is a token compensation system for industry experts and advisors. Distributed through Vesting Contract (31%) with 2-4 year vesting periods, compensating for strategic advice, network connections, and technical consulting.',
    relatedPage: '/advisor-program',
    tags: ['어드바이저', '자문', '베스팅']
  },

  // ============================================
  // 투자 라운드 (Investment Rounds) - Questions 118-120
  // ============================================
  {
    id: 118,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: '시드 라운드(Seed Round)란?',
    questionEn: 'What is the Seed Round?',
    answer: '시드 라운드는 TBURN 초기 개발 단계의 첫 번째 투자 라운드입니다. 초기 투자자에게 가장 유리한 가격으로 토큰이 제공되며, 베스팅 계약(31%)을 통해 12-24개월 락업 후 점진적 배포됩니다.',
    answerEn: 'Seed Round is the first investment round in TBURN\'s early development stage. Tokens offered to early investors at the most favorable price, distributed gradually after 12-24 month lockup through Vesting Contract (31%).',
    relatedPage: '/seed-round',
    tags: ['시드 라운드', '투자', '초기']
  },
  {
    id: 119,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: '프라이빗 라운드(Private Round)란?',
    questionEn: 'What is the Private Round?',
    answer: '프라이빗 라운드는 시드 라운드 이후 기관 투자자와 전략적 투자자를 대상으로 하는 투자 라운드입니다. 시드보다 높은 가격이지만 퍼블릭 세일보다 할인된 가격으로 제공되며, 6-18개월 베스팅 조건이 적용됩니다.',
    answerEn: 'Private Round is an investment round for institutional and strategic investors after Seed Round. Offered at higher price than seed but discounted from public sale, with 6-18 month vesting conditions.',
    relatedPage: '/private-round',
    tags: ['프라이빗', '투자', '기관']
  },
  {
    id: 120,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: '퍼블릭 라운드(Public Round)란?',
    questionEn: 'What is the Public Round?',
    answer: '퍼블릭 라운드는 일반 대중이 참여할 수 있는 공개 토큰 세일입니다. KYC 인증을 완료한 누구나 참여 가능하며, 런치패드 플랫폼(CoinList, DAO Maker 등)을 통해 진행됩니다. 짧은 락업 기간 또는 즉시 유통이 가능합니다.',
    answerEn: 'Public Round is an open token sale where general public can participate. Anyone completing KYC verification can join, conducted through launchpad platforms (CoinList, DAO Maker, etc.). Short lockup period or immediate distribution available.',
    relatedPage: '/public-round',
    tags: ['퍼블릭', '공개 세일', 'KYC']
  },

  // ============================================
  // 런치패드 (Launchpads) - Questions 121-123
  // ============================================
  {
    id: 121,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: '런치패드(Launchpad)란?',
    questionEn: 'What is the Launchpad?',
    answer: 'TBURN 런치패드는 새로운 프로젝트가 TBURN 네트워크에서 토큰을 발행하고 자금을 조달하는 플랫폼입니다. IDO(Initial DEX Offering) 형식으로 진행되며, TBURN 스테이커는 티어에 따라 참여 기회와 할당량을 받습니다.',
    answerEn: 'TBURN Launchpad is a platform for new projects to issue tokens and raise funds on TBURN network. Conducted as IDO (Initial DEX Offering), where TBURN stakers receive participation opportunities and allocations based on tier.',
    relatedPage: '/launchpad',
    tags: ['런치패드', 'IDO', '프로젝트']
  },
  {
    id: 122,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: 'CoinList 세일이란?',
    questionEn: 'What is the CoinList sale?',
    answer: 'CoinList는 규정을 준수하는 글로벌 토큰 세일 플랫폼입니다. TBURN 퍼블릭 세일이 CoinList를 통해 진행되어 전 세계 인증된 투자자가 안전하게 참여할 수 있습니다. 복권 및 선착순 방식으로 할당이 결정됩니다.',
    answerEn: 'CoinList is a compliant global token sale platform. TBURN public sale conducted through CoinList allows verified investors worldwide to participate safely. Allocations determined through lottery and first-come-first-served methods.',
    relatedPage: '/coinlist',
    tags: ['CoinList', '토큰 세일', '글로벌']
  },
  {
    id: 123,
    category: '토크노믹스',
    categoryKey: 'tokenomics',
    question: 'DAO Maker 세일이란?',
    questionEn: 'What is the DAO Maker sale?',
    answer: 'DAO Maker는 DAO 파워 스테이킹 기반의 런치패드 플랫폼입니다. TBURN 토큰 세일이 DAO Maker를 통해 진행되며, DAO 토큰 스테이커가 우선 참여 기회를 얻습니다. 강력한 커뮤니티와 개인 투자자 중심의 플랫폼입니다.',
    answerEn: 'DAO Maker is a launchpad platform based on DAO Power staking. TBURN token sale conducted through DAO Maker, where DAO token stakers get priority participation. A platform focused on strong community and individual investors.',
    relatedPage: '/dao-maker',
    tags: ['DAO Maker', '런치패드', 'DAO']
  },

  // ============================================
  // 샤드 & 인프라 (Sharding & Infrastructure) - Questions 124-126
  // ============================================
  {
    id: 124,
    category: '네트워크',
    categoryKey: 'network',
    question: 'TBURN의 동적 샤딩은 어떻게 작동하나요?',
    questionEn: 'How does TBURN\'s dynamic sharding work?',
    answer: 'TBURN은 5-64개 범위에서 동적으로 샤드를 확장합니다. 네트워크 부하에 따라 자동으로 샤드가 활성화/비활성화되며, 현재 64개 최대 샤드에서 약 210,000 TPS를 처리합니다. 크로스샤드 메시징으로 샤드 간 통신이 원활하게 이루어집니다.',
    answerEn: 'TBURN dynamically scales shards between 5-64. Shards automatically activate/deactivate based on network load, currently processing approximately 210,000 TPS with 64 maximum shards. Cross-shard messaging enables seamless communication between shards.',
    relatedPage: '/sharding',
    tags: ['샤딩', '동적', 'TPS', '64']
  },
  {
    id: 125,
    category: '네트워크',
    categoryKey: 'network',
    question: 'TBURN 메인넷 핵심 사양은?',
    questionEn: 'What are TBURN mainnet core specifications?',
    answer: 'TBURN 메인넷 핵심 사양: Chain ID 6000, 125개 제네시스 밸리데이터, 64개 동적 샤드, ~210,000 TPS 용량, 100ms 블록 타임, 500B TBURN 총 공급량, 5단계 BFT 합의, 20년 디플레이션 토크노믹스. AI 강화 거버넌스와 자동 리밸런싱 시스템을 갖추고 있습니다.',
    answerEn: 'TBURN mainnet core specs: Chain ID 6000, 125 genesis validators, 64 dynamic shards, ~210,000 TPS capacity, 100ms block time, 500B TBURN total supply, 5-phase BFT consensus, 20-year deflationary tokenomics. Features AI-enhanced governance and automatic rebalancing systems.',
    relatedPage: '/learn/whitepaper',
    tags: ['메인넷', '사양', 'Chain ID 6000', '210K TPS']
  },
  {
    id: 126,
    category: '네트워크',
    categoryKey: 'network',
    question: '밸리데이터 인프라 요구사항은?',
    questionEn: 'What are validator infrastructure requirements?',
    answer: '밸리데이터 노드 운영을 위한 최소 요구사항: 8코어 CPU, 32GB RAM, 1TB NVMe SSD, 100Mbps 네트워크. 고성능 노드는 16코어, 64GB RAM, 2TB SSD를 권장합니다. 티어에 따라 1,000-100,000 TB 스테이킹이 필요합니다.',
    answerEn: 'Minimum requirements for validator node operation: 8-core CPU, 32GB RAM, 1TB NVMe SSD, 100Mbps network. High-performance nodes recommend 16-core, 64GB RAM, 2TB SSD. 1,000-100,000 TB staking required depending on tier.',
    relatedPage: '/validator/infrastructure',
    tags: ['인프라', '노드', '요구사항']
  }
];

export const getQnAByCategory = (categoryKey: string): QnAItem[] => {
  if (categoryKey === 'all') return qnaData;
  return qnaData.filter(item => item.categoryKey === categoryKey);
};

export const searchQnA = (query: string): QnAItem[] => {
  const lowerQuery = query.toLowerCase();
  return qnaData.filter(item => 
    item.question.toLowerCase().includes(lowerQuery) ||
    item.questionEn.toLowerCase().includes(lowerQuery) ||
    item.answer.toLowerCase().includes(lowerQuery) ||
    item.answerEn.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getQnAById = (id: number): QnAItem | undefined => {
  return qnaData.find(item => item.id === id);
};
