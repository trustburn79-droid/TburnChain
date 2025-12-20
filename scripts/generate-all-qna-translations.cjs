const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../client/src/locales');

const qnaEnglish = {
  "q1": {
    "question": "What is TBURN?",
    "answer": "TBURN is a next-generation Layer 1 blockchain that processes 520,000 TPS with 100ms block time. It uses an AI-enhanced BFT consensus mechanism to provide high security and scalability, with a deflationary token economic model aimed at sustainable value creation."
  },
  "q2": {
    "question": "How do I get started with TBURN?",
    "answer": "1) Install a supported wallet (MetaMask, Rabby, Trust Wallet, etc.). 2) Connect to TBURN mainnet. 3) Purchase or receive TB tokens. 4) Manage your assets and use DeFi services from the wallet dashboard."
  },
  "q3": {
    "question": "Where can I buy TB tokens?",
    "answer": "TB tokens can be purchased on TBURN's built-in DEX, partner exchanges, or through cross-chain bridges. You can swap directly on the DEX page or bring assets from other chains via the bridge."
  },
  "q4": {
    "question": "What is the TBURN wallet address format?",
    "answer": "TBURN uses Bech32m format addresses. All addresses start with \"tb1\" and consist of exactly 41 characters (e.g., tb1edmprvaftt65lkp2x6v8fmjvst5spfruj47kwm). This format follows the BIP-350 standard with built-in error detection."
  },
  "q5": {
    "question": "What are the transaction fees?",
    "answer": "TBURN's base network fee is approximately 0.0001 TB. Additionally, all transfers have a 0.5% burn fee that permanently burns tokens. This deflationary mechanism contributes to maintaining token value."
  },
  "q6": {
    "question": "What is the difference between TBURN mainnet and testnet?",
    "answer": "Mainnet is the production network where TB tokens with real value are used. Testnet is used for development and testing purposes, and test tokens have no value. Developers should deploy and test smart contracts on testnet before deploying to mainnet."
  },
  "q7": {
    "question": "What is TBURN Explorer?",
    "answer": "TBURN Explorer (Scan) is a blockchain explorer where you can view blocks, transactions, wallets, and smart contracts. It's a public tool for transparently checking real-time network status, validator information, and token movements."
  },
  "q8": {
    "question": "What are the future plans in the roadmap?",
    "answer": "TBURN's roadmap includes continuous network expansion, new DeFi protocol integration, cross-chain bridge expansion, AI feature enhancement, and gaming/NFT ecosystem growth. Detailed milestones can be found on the roadmap page."
  },
  "q9": {
    "question": "Where can I read the TBURN whitepaper?",
    "answer": "The TBURN whitepaper is available in the Learn section of the official website. It contains detailed explanations of technical architecture, consensus mechanism, tokenomics, and governance model."
  },
  "q10": {
    "question": "How can I join the TBURN community?",
    "answer": "Through the Community Hub, you can check announcements, events, and news, and interact with other users. You can vote on governance proposals and participate in airdrops and campaigns to earn rewards."
  },
  "q11": {
    "question": "Which wallets support TBURN?",
    "answer": "TBURN supports MetaMask, Rabby Wallet, Trust Wallet, Coinbase Wallet, and Ledger hardware wallets. You can use any EVM-compatible wallet by adding the TBURN network."
  },
  "q12": {
    "question": "How do I connect my wallet to TBURN network?",
    "answer": "Click the \"Connect Wallet\" button on the wallet dashboard and select your preferred wallet. The network will be added automatically, and if manual setup is needed, you can find network information on the RPC page."
  },
  "q13": {
    "question": "How do I transfer tokens to another wallet?",
    "answer": "In the Wallet & Transfer tab, enter the recipient address (41 characters starting with tb1) and set the amount. Burn fee (0.5%) and network fee are automatically calculated and displayed. Click the transfer button to complete the transaction."
  },
  "q14": {
    "question": "Why is my wallet balance not updating?",
    "answer": "It may be due to network delay or cache issues. Try refreshing the page or reconnecting your wallet. You can verify if the transaction is confirmed on the Explorer. If the issue persists, try a different RPC endpoint."
  },
  "q15": {
    "question": "Can I use a hardware wallet?",
    "answer": "Ledger hardware wallets are fully supported. You can install the TBURN app through Ledger Live and connect it with MetaMask. Hardware wallets provide the highest level of security."
  },
  "q16": {
    "question": "What can I do on the wallet dashboard?",
    "answer": "On the wallet dashboard, you can view portfolio overview, asset balances, and recent transactions. It's the central hub for all blockchain activities including staking, DEX swaps, NFT browsing, and DeFi services."
  },
  "q17": {
    "question": "How do I claim unclaimed rewards?",
    "answer": "You can view claimable rewards in the Rewards section of the dashboard. Click the \"Claim All\" button to claim staking, mining, and event rewards at once. They will be reflected in your wallet after transaction confirmation."
  },
  "q18": {
    "question": "How do I check transaction status?",
    "answer": "Search for the transaction hash in Explorer to check status, confirmation count, gas usage, and block information. You can also view transaction history in the Recent Activity section of the wallet dashboard."
  },
  "q19": {
    "question": "What happens if I don't have enough gas?",
    "answer": "If you don't have enough gas (TB), the transaction will fail. Make sure you have sufficient TB balance before transferring. You can check estimated gas fees in advance using the Transaction Simulator."
  },
  "q20": {
    "question": "How do I use the on-ramp (Fiat-to-Crypto)?",
    "answer": "On the Network Ramp page, you can purchase TB tokens directly using credit cards, bank transfers, etc. Through partner payment services, you can easily purchase using KRW and major currencies."
  },
  "q21": {
    "question": "What is staking?",
    "answer": "Staking is delegating TB tokens to validators to contribute to network security and earn rewards. Staked tokens participate in network consensus, and rewards are distributed regularly based on APY."
  },
  "q22": {
    "question": "What is the minimum staking amount?",
    "answer": "For regular delegation, staking starts from a minimum of 10 TB. To participate directly as a validator, you need between 1,000 TB to 100,000 TB depending on the tier."
  },
  "q23": {
    "question": "How are staking rewards calculated?",
    "answer": "Rewards are calculated based on staking amount, validator performance, and network participation rate. Current base APY is approximately 8-15%, and detailed breakdown can be viewed on the Rewards page."
  },
  "q24": {
    "question": "How long does unstaking take?",
    "answer": "There is a 21-day unbonding period after requesting unstaking. During this period, tokens are locked and no rewards are earned. Once unbonding is complete, tokens are returned to your wallet."
  },
  "q25": {
    "question": "How should I choose a validator?",
    "answer": "Consider uptime, commission rate, total delegation, and self-stake amount. It's advisable to choose reliable validators with high uptime and low commission. You can compare detailed information on the Validators page."
  },
  "q26": {
    "question": "What is slashing?",
    "answer": "Slashing is a penalty where a portion of staked tokens is cut when validators engage in malicious behavior (double signing, extended offline periods). Choosing reliable validators can reduce slashing risk."
  },
  "q27": {
    "question": "What is liquid staking?",
    "answer": "Liquid staking is a way to maintain liquidity while staking. When you stake TB, you receive stTB tokens that can be used in DeFi while simultaneously earning staking rewards."
  },
  "q28": {
    "question": "Where can I use stTB tokens?",
    "answer": "stTB can be traded on DEX, used as collateral in lending protocols, and deposited in yield farming pools. You can earn dual yields from both staking rewards and DeFi returns."
  },
  "q29": {
    "question": "What is the Staking SDK?",
    "answer": "The Staking SDK is a tool for developers to integrate staking functionality into their applications. It supports JavaScript/TypeScript and allows programmatic implementation of delegation, unstaking, and reward claiming."
  },
  "q30": {
    "question": "How do I apply to become a validator?",
    "answer": "Complete the 3-step application in the Validator Application System: 1) Basic requirements verification and document submission, 2) Technical infrastructure verification, 3) Staking and final approval. Requirements vary by tier (Bronze, Silver, Gold)."
  },
  "q31": {
    "question": "What is TBURN DEX?",
    "answer": "TBURN DEX is a decentralized exchange where you can swap TB tokens and other assets directly. It operates using AMM (Automated Market Maker), and you can earn trading fees by participating in liquidity pools."
  },
  "q32": {
    "question": "How do I swap tokens on DEX?",
    "answer": "Select the token pair to swap on the DEX page. Enter the amount and the exchange ratio is automatically calculated. Set slippage and click the swap button. Confirm the transaction in your wallet to complete."
  },
  "q33": {
    "question": "What is slippage?",
    "answer": "Slippage is the difference between the expected price and actual execution price during a swap. It mainly occurs when large orders affect pool liquidity. You can set a slippage tolerance to control acceptable price change."
  },
  "q34": {
    "question": "How do I provide liquidity?",
    "answer": "You provide a pair of tokens (e.g., TB-USDT) to a liquidity pool. LP tokens are received, and trading fees are earned proportionally. IL (Impermanent Loss) can occur when prices fluctuate."
  },
  "q35": {
    "question": "What is impermanent loss?",
    "answer": "When one token's price changes significantly compared to the other in a liquidity pool, the value of your deposited assets may be less than if you simply held them. However, trading fee rewards can offset this loss."
  },
  "q36": {
    "question": "What is lending?",
    "answer": "On the Lending page, you can deposit assets to earn interest or borrow other assets using your holdings as collateral. Interest rates are determined dynamically by supply and demand."
  },
  "q37": {
    "question": "What is collateralization ratio?",
    "answer": "The ratio of collateral required to borrow. For example, with 150% collateralization, you need to deposit 1.5 TB worth of collateral to borrow 1 TB worth. Falling below the maintenance ratio triggers liquidation."
  },
  "q38": {
    "question": "What is liquidation?",
    "answer": "If the collateral value falls below the maintenance ratio due to price drops, part of the collateral is sold to repay the debt. Set a safe collateralization ratio and monitor regularly to prevent liquidation."
  },
  "q39": {
    "question": "What is yield farming?",
    "answer": "Yield Farming is a strategy to maximize returns by depositing assets in various DeFi protocols. You can stake LP tokens or deposit single assets in different pools to earn reward tokens."
  },
  "q40": {
    "question": "How are APR and APY different?",
    "answer": "APR is simple interest without compounding, while APY includes compound interest. For example, 10% APR with monthly compounding results in approximately 10.47% APY. Most DeFi displays APY for annual return reference."
  },
  "q41": {
    "question": "What is Cross-Chain Bridge?",
    "answer": "A service that transfers assets from other blockchains (Ethereum, BSC, Polygon, etc.) to TBURN. Assets are locked on the original chain and equivalent tokens are minted on TBURN. Transfers take approximately 5-30 minutes."
  },
  "q42": {
    "question": "How do I use the bridge?",
    "answer": "Select origin and destination chains on the Bridge page. Choose the token to transfer and enter the amount. After connecting your wallet, confirm the bridge transaction. Transferred assets are stored in an address with identical format."
  },
  "q43": {
    "question": "Is bridge security guaranteed?",
    "answer": "TBURN Bridge uses multi-signature verification and AI risk assessment system. All transactions are verified by multiple validators and are monitored 24/7 for suspicious activity."
  },
  "q44": {
    "question": "What tokens can be bridged?",
    "answer": "ETH, USDT, USDC, and major tokens are supported. The list of supported tokens expands continuously, and available tokens can be checked on the Bridge page."
  },
  "q45": {
    "question": "What is BTCfi?",
    "answer": "BTCfi is DeFi using Bitcoin. Through TBURN, you can use wrapped BTC (wBTC) for staking, lending, and yield farming. Generate yield from BTC while maintaining its value."
  },
  "q46": {
    "question": "How do I mint NFTs on TBURN?",
    "answer": "On the NFT Marketplace Launchpad page, you can create NFT collections. Upload images, enter metadata, set royalties, and deploy with one click. TBC-721 standard is used."
  },
  "q47": {
    "question": "How do I list NFTs for sale?",
    "answer": "Click the NFT you want to sell on the Marketplace page and select \"List\". Set your price (fixed price or auction) and complete the listing with wallet signature. Royalties are automatically paid upon sale."
  },
  "q48": {
    "question": "How much are NFT marketplace fees?",
    "answer": "Marketplace fees are 2.5% of sale price. Creators can set royalties (up to 10%) separately, which are automatically distributed on every resale."
  },
  "q49": {
    "question": "How do I participate in NFT Launchpad?",
    "answer": "Launchpad allows early participation in new NFT projects. Connect your wallet, complete KYC if required, and participate during the minting period. Whitelist and public sale schedules are announced for each project."
  },
  "q50": {
    "question": "What NFT standards are supported?",
    "answer": "TBC-721 (single NFT) and TBC-1155 (multi-edition NFT) standards are supported. Both support metadata extension and royalty configuration, and are compatible with EVM."
  },
  "q51": {
    "question": "What is GameFi?",
    "answer": "GameFi is games with blockchain-based economies. You can own in-game items as NFTs and trade or stake game tokens. P2E (Play-to-Earn) model allows earning real value through play."
  },
  "q52": {
    "question": "How can I use TBURN in games?",
    "answer": "Games built on TBURN allow you to earn rewards as TB or game tokens. Own in-game items as NFTs and trade them in the marketplace. Check the Game Tooling page for game integration methods."
  },
  "q53": {
    "question": "How is the game economy structured?",
    "answer": "TBURN's game economy uses deflationary design. In-game consumption creates token burns, maintaining token value while running a sustainable game ecosystem."
  },
  "q54": {
    "question": "What are game development tools?",
    "answer": "Game developers can integrate using TBURN SDK. Unity and Unreal Engine plugins are provided for easy NFT minting, token transfers, and wallet connections."
  },
  "q55": {
    "question": "What are in-game transaction fees?",
    "answer": "In-game transactions also have TBURN network fees, but micro-transaction optimized gas costs are applied. Batch transaction processing can reduce fees."
  },
  "q56": {
    "question": "What is TBURN network performance?",
    "answer": "TBURN processes 520,000 TPS with 100ms block time and approximately 0.8 second finality. The sharding architecture enables parallel processing, and performance can be verified on the network stats page."
  },
  "q57": {
    "question": "What is BFT consensus?",
    "answer": "BFT (Byzantine Fault Tolerance) is a consensus algorithm that operates correctly even with up to 1/3 malicious nodes. TBURN uses AI-enhanced BFT for optimized validator selection and faster consensus."
  },
  "q58": {
    "question": "What is sharding?",
    "answer": "A technique that divides the network into multiple sub-networks (shards) for parallel processing. Each shard processes transactions independently, dramatically increasing scalability. Cross-shard communication is secured through the beacon chain."
  },
  "q59": {
    "question": "How does RPC connection work?",
    "answer": "Check the official RPC endpoint on the RPC Providers page. Enter the endpoint URL in wallet or dApp to connect. Multiple endpoints are available for redundancy and speed optimization."
  },
  "q60": {
    "question": "How do I check network status?",
    "answer": "The Network Status page shows real-time TPS, block height, validator count, and latency. You can also check uptime of each node and network congestion."
  },
  "q61": {
    "question": "What are validator requirements?",
    "answer": "Minimum 99.5% uptime, stable internet connection (100Mbps+), recommended 32GB RAM, 2TB SSD storage. Required staking amount varies by tier: Bronze 1,000 TB, Silver 10,000 TB, Gold 100,000 TB."
  },
  "q62": {
    "question": "What is developer documentation?",
    "answer": "Technical documentation for developers is available in the Developer Hub. Includes smart contract development, SDK usage, API reference, and code examples. Updated regularly."
  },
  "q63": {
    "question": "What programming languages are supported?",
    "answer": "Smart contracts support Solidity and Rust. SDKs are available for JavaScript/TypeScript, Python, Go, and Rust. Choose based on your development environment."
  },
  "q64": {
    "question": "How do I deploy smart contracts?",
    "answer": "After developing a contract, deploy to testnet for testing first. Once testing is complete, deploy to mainnet through the deployment page. Contract verification and security audit are recommended."
  },
  "q65": {
    "question": "What SDK features are available?",
    "answer": "The SDK supports wallet connection, transaction sending, smart contract interaction, event listening, staking, and NFT operations. Installation guide and code samples are provided in the documentation."
  },
  "q66": {
    "question": "How do I use the API?",
    "answer": "The REST API and GraphQL API allow querying block/transaction data. WebSocket API provides real-time updates. API keys are managed on the API Keys page."
  },
  "q67": {
    "question": "What is EVM migration?",
    "answer": "TBURN is EVM-compatible, allowing direct deployment of existing Ethereum contracts. Most Solidity code works as-is. Migration guides and tools are available on the EVM Migration page."
  },
  "q68": {
    "question": "What is the smart contract security audit?",
    "answer": "Contracts integrated in mainnet should be security audited. Auditing partners detect vulnerabilities. Auditing process and certification methods are explained in the documentation."
  },
  "q69": {
    "question": "What is the Transaction Simulator?",
    "answer": "The Transaction Simulator allows testing without executing real transactions. Verify the result before execution. Useful for gas estimation and error checking."
  },
  "q70": {
    "question": "How do I use the CLI?",
    "answer": "The command-line interface tool is available for developers to deploy contracts, query information, and send transactions from the command line. Installation and commands are in the CLI Reference."
  },
  "q71": {
    "question": "What is WebSocket API?",
    "answer": "WebSocket API provides real-time data streaming. Subscribe to new blocks, transactions, events, and receive instant notifications. Useful for building real-time applications."
  },
  "q72": {
    "question": "How do I check block details?",
    "answer": "Enter the block number in Explorer to check the block's transaction list, proposer, timestamp, and gas used. Parent hash and state root can also be verified."
  },
  "q73": {
    "question": "How do I check address details?",
    "answer": "Enter the address in Explorer to check balance, transaction history, token holdings, and contract information. Internal transactions and event logs are also displayed."
  },
  "q74": {
    "question": "How do I view token list?",
    "answer": "The Tokens page in Explorer shows all tokens issued on the network. Check holders count, transfers, and market cap. Token contract verification status is also displayed."
  },
  "q75": {
    "question": "How do I verify contracts?",
    "answer": "Publish source code on the contract verification page and match compilation settings for verification. Verified contracts show source code and ABI, enabling transparent interaction."
  },
  "q76": {
    "question": "How do I use testnet?",
    "answer": "Switch to testnet network settings in your wallet. Get test TB from the Testnet Faucet and test as you would on mainnet. Testnet Explorer is separate from mainnet."
  },
  "q77": {
    "question": "What is the faucet?",
    "answer": "Faucet provides free test tokens on testnet. Enter your wallet address to receive test TB within 24 hours. Use for development and testing."
  },
  "q78": {
    "question": "What is code example library?",
    "answer": "The Code Examples page provides sample code for common use cases. Wallet connection, token transfers, staking integration, and NFT minting examples are available for learning."
  },
  "q79": {
    "question": "What is the Quick Start guide?",
    "answer": "Explains the fastest way to get started with TBURN development. From SDK installation to first transaction, with step-by-step guidance. Perfect for beginners."
  },
  "q80": {
    "question": "Where can I report bugs?",
    "answer": "Report bugs found through the Community Hub feedback. For critical security vulnerabilities, use the Bug Bounty program for rewards."
  },
  "q81": {
    "question": "What is governance?",
    "answer": "TB token holders participate in decisions through voting. Vote on network upgrades, parameter changes, and fund allocation. Voting power is based on staking amount."
  },
  "q82": {
    "question": "How do I participate in voting?",
    "answer": "View ongoing proposals in the Governance section and vote. Must stake TB to have voting power. Voting periods are typically 7-14 days."
  },
  "q83": {
    "question": "What is DePIN?",
    "answer": "DePIN (Decentralized Physical Infrastructure Networks) tokenizes physical infrastructure like IoT devices and energy grids, enabling decentralized management and incentives."
  },
  "q84": {
    "question": "Where can I get test tokens?",
    "answer": "You can get free test TB from the testnet faucet. Check the Testnet RPC page for faucet links and usage. Requests can be made every 24 hours."
  },
  "q85": {
    "question": "What are Actions & Blinks?",
    "answer": "Actions & Blinks is a feature to share blockchain operations as URLs. Complex transactions can be shared and executed with a single link, simplifying user onboarding."
  },
  "q86": {
    "question": "What are token extensions?",
    "answer": "TBC-20 tokens can be extended with additional features (freezing, transfer restrictions, interest, metadata). Used for security tokens or special-purpose tokens requiring compliance."
  },
  "q87": {
    "question": "What are permissioned blockchain solutions?",
    "answer": "Enterprises can build private networks with access control. Based on TBURN technology, operate enterprise blockchains accessible only to authorized participants."
  },
  "q88": {
    "question": "What are Commerce solutions?",
    "answer": "An integrated solution for accepting TB payments in online/offline stores. Provides payment API, POS integration, settlement system, and tax calculation tools."
  },
  "q89": {
    "question": "What financial solutions are available?",
    "answer": "Provides custody, trading, payment, and asset management solutions for financial institutions. Compliance tools and audit trail features meet institutional requirements."
  },
  "q90": {
    "question": "What AI features are available?",
    "answer": "Provides AI-based burn optimization, governance analysis, bridge risk assessment, anomaly detection, and validator scheduling. Multiple AI models (Gemini, Claude, GPT-4o, Grok) are integrated."
  },
  "q91": {
    "question": "What are enterprise use cases?",
    "answer": "Provides enterprise blockchain use cases including supply chain tracking, digital certification, data integrity verification, and internal token systems. Dedicated support and SLA provided."
  },
  "q92": {
    "question": "What is tokenization?",
    "answer": "Converting real assets (real estate, art, commodities) into blockchain tokens. Enables fractional ownership, increased liquidity, and 24/7 trading."
  },
  "q93": {
    "question": "Where can I check news and announcements?",
    "answer": "Check the Community News page for latest updates, partnership announcements, and technical improvements. Subscribe to the newsletter to receive updates via email."
  },
  "q94": {
    "question": "How do I participate in events?",
    "answer": "Check the Community Events page for ongoing airdrops, campaigns, and meetup information. Meet participation requirements and register to receive rewards."
  },
  "q95": {
    "question": "How do I make governance proposals?",
    "answer": "Staking a certain amount of TB allows you to create governance proposals. Write content according to the proposal format and submit for community voting."
  },
  "q96": {
    "question": "What can I do on the Community Hub?",
    "answer": "On the Community Hub, you can discuss with other users, introduce projects, and share feedback. You can also check official announcements and development updates."
  },
  "q97": {
    "question": "How do I keep my assets safe?",
    "answer": "1) Use hardware wallet, 2) Never share private key/seed phrase, 3) Beware of phishing sites, 4) Use only official URLs, 5) Enable 2FA. Store large assets in cold wallets."
  },
  "q98": {
    "question": "How do I identify scams?",
    "answer": "Trust only official channels. Requests for private keys or seed phrases are 100% scams. Beware of messages creating urgency like \"free tokens\" or \"urgent upgrade\"."
  },
  "q99": {
    "question": "What is the total supply of TB tokens?",
    "answer": "Initial supply and current circulating supply of TB tokens can be checked on the Tokenomics page. Due to the burn mechanism, total supply continuously decreases."
  },
  "q100": {
    "question": "How does the burn mechanism work?",
    "answer": "A 0.5% burn fee applies to all transfers, permanently burning that amount. Part of network fees are also burned. This deflationary model supports token value."
  }
};

const qnaKorean = {
  "q1": {
    "question": "TBURN이란 무엇인가요?",
    "answer": "TBURN은 초당 520,000 TPS를 처리하고 100ms 블록 타임을 제공하는 차세대 Layer 1 블록체인입니다. AI 강화 BFT 합의 메커니즘을 사용하여 높은 보안성과 확장성을 제공하며, 디플레이션 토큰 경제 모델을 통해 지속 가능한 가치 창출을 목표로 합니다."
  },
  "q2": {
    "question": "TBURN을 시작하려면 어떻게 해야 하나요?",
    "answer": "1) 지원되는 지갑(MetaMask, Rabby, Trust Wallet 등)을 설치합니다. 2) TBURN 메인넷에 연결합니다. 3) TB 토큰을 구매하거나 전송받습니다. 4) 지갑 대시보드에서 자산을 관리하고 DeFi 서비스를 이용할 수 있습니다."
  },
  "q3": {
    "question": "TB 토큰은 어디서 구매할 수 있나요?",
    "answer": "TB 토큰은 TBURN 내장 DEX, 파트너 거래소, 또는 크로스체인 브릿지를 통해 구매할 수 있습니다. DEX 페이지에서 직접 스왑하거나, 브릿지를 통해 다른 체인에서 자산을 가져올 수 있습니다."
  },
  "q4": {
    "question": "TBURN 지갑 주소 형식은 무엇인가요?",
    "answer": "TBURN은 Bech32m 형식의 주소를 사용합니다. 모든 주소는 \"tb1\"로 시작하며 총 41자로 구성됩니다 (예: tb1edmprvaftt65lkp2x6v8fmjvst5spfruj47kwm). 이 형식은 BIP-350 표준을 따르며 오류 감지 기능이 내장되어 있습니다."
  },
  "q5": {
    "question": "거래 수수료는 얼마인가요?",
    "answer": "TBURN의 기본 네트워크 수수료는 약 0.0001 TB입니다. 추가로 모든 전송에는 0.5%의 번 수수료가 적용되어 토큰이 영구 소각됩니다. 이 디플레이션 메커니즘이 토큰 가치 유지에 기여합니다."
  },
  "q6": {
    "question": "TBURN 메인넷과 테스트넷의 차이점은 무엇인가요?",
    "answer": "메인넷은 실제 가치를 가진 TB 토큰이 사용되는 프로덕션 네트워크입니다. 테스트넷은 개발 및 테스트 목적으로 사용되며 테스트 토큰은 가치가 없습니다. 개발자는 테스트넷에서 스마트 계약을 배포하고 테스트한 후 메인넷에 배포해야 합니다."
  },
  "q7": {
    "question": "TBURN Explorer는 무엇인가요?",
    "answer": "TBURN Explorer(스캔)는 블록체인 탐색기로 블록, 트랜잭션, 지갑, 스마트 계약을 조회할 수 있습니다. 실시간 네트워크 상태, 밸리데이터 정보, 토큰 이동을 투명하게 확인할 수 있는 공개 도구입니다."
  },
  "q8": {
    "question": "로드맵에서 향후 계획은 무엇인가요?",
    "answer": "TBURN 로드맵은 지속적인 네트워크 확장, 새로운 DeFi 프로토콜 통합, 크로스체인 브릿지 확대, AI 기능 강화, 게임 및 NFT 생태계 성장을 포함합니다. 자세한 마일스톤은 로드맵 페이지에서 확인할 수 있습니다."
  },
  "q9": {
    "question": "TBURN 백서는 어디서 볼 수 있나요?",
    "answer": "TBURN 백서는 공식 웹사이트의 Learn 섹션에서 확인할 수 있습니다. 백서에는 기술 아키텍처, 합의 메커니즘, 토크노믹스, 거버넌스 모델에 대한 상세한 설명이 포함되어 있습니다."
  },
  "q10": {
    "question": "TBURN 커뮤니티에 어떻게 참여할 수 있나요?",
    "answer": "커뮤니티 허브를 통해 공지사항, 이벤트, 뉴스를 확인하고 다른 사용자와 소통할 수 있습니다. 거버넌스 제안에 투표하고, 에어드랍 및 캠페인에 참여하여 보상을 받을 수 있습니다."
  },
  "q11": {
    "question": "어떤 지갑이 TBURN을 지원하나요?",
    "answer": "TBURN은 MetaMask, Rabby Wallet, Trust Wallet, Coinbase Wallet, Ledger 하드웨어 지갑을 지원합니다. 모든 EVM 호환 지갑에서 TBURN 네트워크를 추가하여 사용할 수 있습니다."
  },
  "q12": {
    "question": "지갑을 TBURN 네트워크에 어떻게 연결하나요?",
    "answer": "지갑 대시보드에서 \"지갑 연결\" 버튼을 클릭하고 원하는 지갑을 선택합니다. 네트워크가 자동으로 추가되며, 수동 설정이 필요한 경우 RPC 페이지에서 네트워크 정보를 확인할 수 있습니다."
  },
  "q13": {
    "question": "토큰을 다른 지갑으로 어떻게 전송하나요?",
    "answer": "지갑 및 이체 탭에서 수신자 주소(tb1로 시작하는 41자)를 입력하고 금액을 설정합니다. 번 수수료(0.5%)와 네트워크 수수료가 자동 계산되어 표시됩니다. 전송 버튼을 클릭하여 트랜잭션을 완료합니다."
  },
  "q14": {
    "question": "지갑 잔액이 업데이트되지 않는 이유는 무엇인가요?",
    "answer": "네트워크 지연이나 캐시 문제일 수 있습니다. 페이지를 새로고침하거나 지갑을 다시 연결해 보세요. 트랜잭션이 컨펌되었는지 Explorer에서 확인할 수 있습니다. 문제가 지속되면 다른 RPC 엔드포인트를 시도해 보세요."
  },
  "q15": {
    "question": "하드웨어 지갑을 사용할 수 있나요?",
    "answer": "Ledger 하드웨어 지갑을 완전히 지원합니다. Ledger Live를 통해 TBURN 앱을 설치하고 MetaMask와 연결하여 사용할 수 있습니다. 하드웨어 지갑은 최고 수준의 보안을 제공합니다."
  },
  "q16": {
    "question": "지갑 대시보드에서 무엇을 할 수 있나요?",
    "answer": "지갑 대시보드에서 포트폴리오 개요, 자산 잔액, 최근 트랜잭션을 확인할 수 있습니다. 스테이킹, DEX 스왑, NFT 조회, DeFi 서비스 접근 등 모든 블록체인 활동의 중심 허브입니다."
  },
  "q17": {
    "question": "미청구 보상은 어떻게 청구하나요?",
    "answer": "대시보드의 보상 섹션에서 청구 가능한 보상을 확인할 수 있습니다. \"모두 청구\" 버튼을 클릭하면 스테이킹, 마이닝, 이벤트 보상을 한 번에 청구할 수 있습니다. 트랜잭션 승인 후 지갑에 반영됩니다."
  },
  "q18": {
    "question": "트랜잭션 상태를 어떻게 확인하나요?",
    "answer": "Explorer에서 트랜잭션 해시를 검색하면 상태, 컨펌 수, 가스 사용량, 블록 정보를 확인할 수 있습니다. 지갑 대시보드의 최근 활동 섹션에서도 트랜잭션 기록을 볼 수 있습니다."
  },
  "q19": {
    "question": "가스비가 부족하면 어떻게 되나요?",
    "answer": "가스비(TB)가 부족하면 트랜잭션이 실패합니다. 전송하기 전에 충분한 TB 잔액이 있는지 확인하세요. 트랜잭션 시뮬레이터에서 예상 가스비를 미리 확인할 수 있습니다."
  },
  "q20": {
    "question": "온램프(Fiat-to-Crypto)는 어떻게 사용하나요?",
    "answer": "네트워크 램프 페이지에서 신용카드, 은행 이체 등으로 직접 TB 토큰을 구매할 수 있습니다. 파트너 결제 서비스를 통해 원화(KRW) 및 주요 통화로 간편하게 구매 가능합니다."
  },
  "q21": {
    "question": "스테이킹이란 무엇인가요?",
    "answer": "스테이킹은 TB 토큰을 밸리데이터에게 위임하여 네트워크 보안에 기여하고 보상을 받는 것입니다. 스테이킹된 토큰은 네트워크 합의에 참여하며, APY에 따라 정기적으로 보상이 지급됩니다."
  },
  "q22": {
    "question": "최소 스테이킹 금액은 얼마인가요?",
    "answer": "일반 위임의 경우 최소 10 TB부터 스테이킹 가능합니다. 밸리데이터로 직접 참여하려면 티어에 따라 1,000 TB에서 100,000 TB까지 필요합니다."
  },
  "q23": {
    "question": "스테이킹 보상은 어떻게 계산되나요?",
    "answer": "보상은 스테이킹 금액, 밸리데이터 성능, 네트워크 참여율에 따라 계산됩니다. 현재 기본 APY는 약 8-15%이며, 보상 페이지에서 상세 내역을 확인할 수 있습니다."
  },
  "q24": {
    "question": "언스테이킹(Unstaking)은 얼마나 걸리나요?",
    "answer": "언스테이킹 요청 후 21일의 언본딩 기간이 있습니다. 이 기간 동안 토큰은 락업되며 보상이 지급되지 않습니다. 언본딩이 완료되면 토큰이 지갑으로 반환됩니다."
  },
  "q25": {
    "question": "밸리데이터를 어떻게 선택해야 하나요?",
    "answer": "업타임(가동률), 커미션율, 총 위임량, 자체 스테이킹 금액을 고려하세요. 높은 업타임과 낮은 커미션을 가진 신뢰할 수 있는 밸리데이터를 선택하는 것이 좋습니다. 밸리데이터 페이지에서 상세 정보를 비교할 수 있습니다."
  },
  "q26": {
    "question": "슬래싱(Slashing)이란 무엇인가요?",
    "answer": "슬래싱은 밸리데이터가 악의적인 행동(이중 서명, 장시간 오프라인)을 했을 때 스테이킹된 토큰의 일부가 삭감되는 페널티입니다. 신뢰할 수 있는 밸리데이터를 선택하면 슬래싱 위험을 줄일 수 있습니다."
  },
  "q27": {
    "question": "리퀴드 스테이킹이란 무엇인가요?",
    "answer": "리퀴드 스테이킹은 스테이킹하면서도 유동성을 유지할 수 있는 방법입니다. TB를 스테이킹하면 stTB 토큰을 받고, 이를 DeFi에서 활용하면서 동시에 스테이킹 보상도 받을 수 있습니다."
  },
  "q28": {
    "question": "stTB 토큰은 어디서 사용할 수 있나요?",
    "answer": "stTB는 DEX에서 거래, 렌딩 프로토콜에서 담보, 이자 농사 풀에 예치할 수 있습니다. 스테이킹 보상과 DeFi 수익을 동시에 얻는 이중 수익이 가능합니다."
  },
  "q29": {
    "question": "스테이킹 SDK는 무엇인가요?",
    "answer": "스테이킹 SDK는 개발자가 자체 애플리케이션에 스테이킹 기능을 통합할 수 있는 도구입니다. JavaScript/TypeScript를 지원하며, 위임, 언스테이킹, 보상 청구 등의 기능을 프로그래밍 방식으로 구현할 수 있습니다."
  },
  "q30": {
    "question": "밸리데이터 신청은 어떻게 하나요?",
    "answer": "밸리데이터 신청 시스템에서 3단계 신청을 완료하세요: 1) 기본 요건 확인 및 서류 제출, 2) 기술 인프라 검증, 3) 스테이킹 및 최종 승인. 티어(Bronze, Silver, Gold)에 따라 요구 조건이 다릅니다."
  },
  "q31": {
    "question": "TBURN DEX란 무엇인가요?",
    "answer": "TBURN DEX는 탈중앙화 거래소로 TB 토큰과 다른 자산을 직접 스왑할 수 있습니다. AMM(자동화된 마켓 메이커) 방식으로 운영되며, 유동성 풀에 참여하여 거래 수수료를 얻을 수도 있습니다."
  },
  "q32": {
    "question": "DEX에서 토큰을 어떻게 스왑하나요?",
    "answer": "DEX 페이지에서 스왑할 토큰 쌍을 선택합니다. 금액을 입력하면 환율이 자동 계산됩니다. 슬리피지를 설정하고 스왑 버튼을 클릭합니다. 지갑에서 트랜잭션을 승인하면 완료됩니다."
  },
  "q33": {
    "question": "슬리피지란 무엇인가요?",
    "answer": "슬리피지는 스왑 시 예상 가격과 실제 체결 가격의 차이입니다. 대량 주문이 풀 유동성에 영향을 줄 때 주로 발생합니다. 슬리피지 허용치를 설정하여 허용 가능한 가격 변동을 제어할 수 있습니다."
  },
  "q34": {
    "question": "유동성 공급은 어떻게 하나요?",
    "answer": "토큰 쌍(예: TB-USDT)을 유동성 풀에 제공합니다. LP 토큰을 받고, 거래 수수료를 비례적으로 획득합니다. 가격 변동 시 IL(비영구적 손실)이 발생할 수 있습니다."
  },
  "q35": {
    "question": "비영구적 손실이란 무엇인가요?",
    "answer": "유동성 풀에서 한 토큰의 가격이 다른 토큰 대비 크게 변할 때, 단순히 보유했을 때보다 자산 가치가 적어지는 현상입니다. 단, 거래 수수료 보상이 이 손실을 상쇄할 수 있습니다."
  },
  "q36": {
    "question": "렌딩이란 무엇인가요?",
    "answer": "렌딩 페이지에서 자산을 예치하여 이자를 받거나, 보유 자산을 담보로 다른 자산을 빌릴 수 있습니다. 이자율은 공급과 수요에 따라 동적으로 결정됩니다."
  },
  "q37": {
    "question": "담보 비율이란 무엇인가요?",
    "answer": "대출에 필요한 담보의 비율입니다. 예를 들어 150% 담보 비율의 경우 1 TB 가치를 빌리려면 1.5 TB 가치의 담보가 필요합니다. 유지 비율 미만이 되면 청산됩니다."
  },
  "q38": {
    "question": "청산이란 무엇인가요?",
    "answer": "가격 하락으로 담보 가치가 유지 비율 아래로 떨어지면 담보의 일부가 매각되어 부채를 상환합니다. 안전한 담보 비율을 설정하고 정기적으로 모니터링하여 청산을 방지하세요."
  },
  "q39": {
    "question": "이자 농사란 무엇인가요?",
    "answer": "이자 농사는 다양한 DeFi 프로토콜에 자산을 예치하여 수익을 극대화하는 전략입니다. LP 토큰을 스테이킹하거나 단일 자산을 다양한 풀에 예치하여 보상 토큰을 획득합니다."
  },
  "q40": {
    "question": "APR과 APY는 어떻게 다른가요?",
    "answer": "APR은 복리 없는 단순 이자이고, APY는 복리가 포함된 이자입니다. 예를 들어 10% APR을 월별 복리로 계산하면 약 10.47% APY가 됩니다. 대부분의 DeFi는 연간 수익 참고용으로 APY를 표시합니다."
  },
  "q41": {
    "question": "크로스체인 브릿지란 무엇인가요?",
    "answer": "다른 블록체인(Ethereum, BSC, Polygon 등)에서 TBURN으로 자산을 이동하는 서비스입니다. 원본 체인에서 자산이 락업되고 TBURN에서 동등한 토큰이 발행됩니다. 이동 시간은 약 5-30분입니다."
  },
  "q42": {
    "question": "브릿지는 어떻게 사용하나요?",
    "answer": "브릿지 페이지에서 출발 체인과 도착 체인을 선택합니다. 이동할 토큰과 금액을 입력합니다. 지갑 연결 후 브릿지 트랜잭션을 승인합니다. 이동된 자산은 동일한 형식의 주소에 저장됩니다."
  },
  "q43": {
    "question": "브릿지 보안은 보장되나요?",
    "answer": "TBURN 브릿지는 다중 서명 검증과 AI 위험 평가 시스템을 사용합니다. 모든 트랜잭션은 여러 밸리데이터에 의해 검증되며, 의심스러운 활동은 24시간 모니터링됩니다."
  },
  "q44": {
    "question": "어떤 토큰을 브릿지할 수 있나요?",
    "answer": "ETH, USDT, USDC 및 주요 토큰이 지원됩니다. 지원되는 토큰 목록은 지속적으로 확장되며, 브릿지 페이지에서 사용 가능한 토큰을 확인할 수 있습니다."
  },
  "q45": {
    "question": "BTCfi란 무엇인가요?",
    "answer": "BTCfi는 비트코인을 활용한 DeFi입니다. TBURN을 통해 래핑된 BTC(wBTC)를 스테이킹, 렌딩, 이자 농사에 사용할 수 있습니다. BTC의 가치를 유지하면서 수익을 창출합니다."
  },
  "q46": {
    "question": "TBURN에서 NFT를 어떻게 발행하나요?",
    "answer": "NFT 마켓플레이스 런치패드 페이지에서 NFT 컬렉션을 생성할 수 있습니다. 이미지 업로드, 메타데이터 입력, 로열티 설정 후 원클릭으로 배포합니다. TBC-721 표준을 사용합니다."
  },
  "q47": {
    "question": "NFT를 어떻게 판매 등록하나요?",
    "answer": "마켓플레이스 페이지에서 판매할 NFT를 클릭하고 \"리스트\"를 선택합니다. 가격(고정가 또는 경매)을 설정하고 지갑 서명으로 리스팅을 완료합니다. 판매 시 로열티가 자동 지급됩니다."
  },
  "q48": {
    "question": "NFT 마켓플레이스 수수료는 얼마인가요?",
    "answer": "마켓플레이스 수수료는 판매가의 2.5%입니다. 크리에이터는 로열티(최대 10%)를 별도로 설정할 수 있으며, 이는 재판매 시마다 자동 분배됩니다."
  },
  "q49": {
    "question": "NFT 런치패드에 어떻게 참여하나요?",
    "answer": "런치패드는 새로운 NFT 프로젝트에 조기 참여할 수 있습니다. 지갑을 연결하고, 필요시 KYC를 완료한 후 민팅 기간에 참여합니다. 화이트리스트와 퍼블릭 세일 일정은 각 프로젝트별로 공지됩니다."
  },
  "q50": {
    "question": "어떤 NFT 표준이 지원되나요?",
    "answer": "TBC-721(단일 NFT)과 TBC-1155(멀티 에디션 NFT) 표준이 지원됩니다. 둘 다 메타데이터 확장과 로열티 설정을 지원하며, EVM과 호환됩니다."
  },
  "q51": {
    "question": "GameFi란 무엇인가요?",
    "answer": "GameFi는 블록체인 기반 경제를 가진 게임입니다. 게임 내 아이템을 NFT로 소유하고, 게임 토큰을 거래하거나 스테이킹할 수 있습니다. P2E(Play-to-Earn) 모델로 플레이를 통해 실제 가치를 얻습니다."
  },
  "q52": {
    "question": "TBURN을 게임에서 어떻게 사용할 수 있나요?",
    "answer": "TBURN 기반으로 구축된 게임에서 TB 또는 게임 토큰으로 보상을 획득합니다. 게임 내 아이템을 NFT로 소유하고 마켓플레이스에서 거래합니다. 게임 통합 방법은 Game Tooling 페이지를 확인하세요."
  },
  "q53": {
    "question": "게임 경제는 어떻게 구성되어 있나요?",
    "answer": "TBURN의 게임 경제는 디플레이션 설계를 사용합니다. 게임 내 소비는 토큰 소각을 생성하여 토큰 가치를 유지하면서 지속 가능한 게임 생태계를 운영합니다."
  },
  "q54": {
    "question": "게임 개발 도구는 무엇이 있나요?",
    "answer": "게임 개발자는 TBURN SDK를 사용하여 통합할 수 있습니다. Unity 및 Unreal Engine 플러그인이 제공되어 쉽게 NFT 발행, 토큰 전송, 지갑 연결이 가능합니다."
  },
  "q55": {
    "question": "게임 내 트랜잭션 수수료는 얼마인가요?",
    "answer": "게임 내 트랜잭션에도 TBURN 네트워크 수수료가 적용되지만, 마이크로 트랜잭션에 최적화된 가스 비용이 적용됩니다. 배치 트랜잭션 처리로 수수료를 줄일 수 있습니다."
  },
  "q56": {
    "question": "TBURN 네트워크 성능은 어떤가요?",
    "answer": "TBURN은 520,000 TPS를 100ms 블록 타임과 약 0.8초 파이널리티로 처리합니다. 샤딩 아키텍처가 병렬 처리를 가능하게 하며, 네트워크 통계 페이지에서 성능을 확인할 수 있습니다."
  },
  "q57": {
    "question": "BFT 합의란 무엇인가요?",
    "answer": "BFT(비잔틴 장애 허용)는 최대 1/3의 악의적인 노드가 있어도 정상 작동하는 합의 알고리즘입니다. TBURN은 AI 강화 BFT를 사용하여 최적화된 밸리데이터 선택과 빠른 합의를 제공합니다."
  },
  "q58": {
    "question": "샤딩이란 무엇인가요?",
    "answer": "네트워크를 여러 하위 네트워크(샤드)로 분할하여 병렬 처리하는 기술입니다. 각 샤드는 독립적으로 트랜잭션을 처리하여 확장성을 극적으로 향상시킵니다. 크로스 샤드 통신은 비콘 체인을 통해 보안됩니다."
  },
  "q59": {
    "question": "RPC 연결은 어떻게 하나요?",
    "answer": "RPC Providers 페이지에서 공식 RPC 엔드포인트를 확인하세요. 지갑이나 dApp에 엔드포인트 URL을 입력하여 연결합니다. 여러 엔드포인트가 중복성과 속도 최적화를 위해 제공됩니다."
  },
  "q60": {
    "question": "네트워크 상태를 어떻게 확인하나요?",
    "answer": "Network Status 페이지에서 실시간 TPS, 블록 높이, 밸리데이터 수, 레이턴시를 확인할 수 있습니다. 각 노드의 업타임과 네트워크 혼잡도도 확인할 수 있습니다."
  },
  "q61": {
    "question": "밸리데이터 요구 사항은 무엇인가요?",
    "answer": "최소 99.5% 업타임, 안정적인 인터넷 연결(100Mbps+), 권장 32GB RAM, 2TB SSD 스토리지. 필요한 스테이킹 금액은 티어에 따라 다릅니다: Bronze 1,000 TB, Silver 10,000 TB, Gold 100,000 TB."
  },
  "q62": {
    "question": "개발자 문서란 무엇인가요?",
    "answer": "개발자를 위한 기술 문서는 Developer Hub에서 확인할 수 있습니다. 스마트 계약 개발, SDK 사용법, API 레퍼런스, 코드 예제가 포함됩니다. 정기적으로 업데이트됩니다."
  },
  "q63": {
    "question": "어떤 프로그래밍 언어가 지원되나요?",
    "answer": "스마트 계약은 Solidity와 Rust를 지원합니다. SDK는 JavaScript/TypeScript, Python, Go, Rust로 제공됩니다. 개발 환경에 따라 선택하세요."
  },
  "q64": {
    "question": "스마트 계약을 어떻게 배포하나요?",
    "answer": "계약 개발 후 먼저 테스트넷에 배포하여 테스트합니다. 테스트 완료 후 배포 페이지를 통해 메인넷에 배포합니다. 계약 검증과 보안 감사를 권장합니다."
  },
  "q65": {
    "question": "SDK 기능은 무엇이 있나요?",
    "answer": "SDK는 지갑 연결, 트랜잭션 전송, 스마트 계약 상호작용, 이벤트 리스닝, 스테이킹, NFT 작업을 지원합니다. 설치 가이드와 코드 샘플은 문서에서 제공됩니다."
  },
  "q66": {
    "question": "API는 어떻게 사용하나요?",
    "answer": "REST API와 GraphQL API로 블록/트랜잭션 데이터를 쿼리할 수 있습니다. WebSocket API는 실시간 업데이트를 제공합니다. API 키는 API Keys 페이지에서 관리합니다."
  },
  "q67": {
    "question": "EVM 마이그레이션이란 무엇인가요?",
    "answer": "TBURN은 EVM 호환으로 기존 Ethereum 계약을 직접 배포할 수 있습니다. 대부분의 Solidity 코드가 그대로 작동합니다. 마이그레이션 가이드와 도구는 EVM Migration 페이지에서 확인하세요."
  },
  "q68": {
    "question": "스마트 계약 보안 감사란 무엇인가요?",
    "answer": "메인넷에 통합된 계약은 보안 감사를 받아야 합니다. 감사 파트너가 취약점을 탐지합니다. 감사 프로세스와 인증 방법은 문서에서 설명됩니다."
  },
  "q69": {
    "question": "트랜잭션 시뮬레이터란 무엇인가요?",
    "answer": "트랜잭션 시뮬레이터는 실제 트랜잭션을 실행하지 않고 테스트할 수 있습니다. 실행 전 결과를 확인합니다. 가스 추정과 오류 확인에 유용합니다."
  },
  "q70": {
    "question": "CLI는 어떻게 사용하나요?",
    "answer": "커맨드라인 인터페이스 도구는 개발자가 명령줄에서 계약 배포, 정보 쿼리, 트랜잭션 전송을 할 수 있습니다. 설치와 명령어는 CLI Reference에서 확인하세요."
  },
  "q71": {
    "question": "WebSocket API란 무엇인가요?",
    "answer": "WebSocket API는 실시간 데이터 스트리밍을 제공합니다. 새 블록, 트랜잭션, 이벤트를 구독하고 즉시 알림을 받습니다. 실시간 애플리케이션 구축에 유용합니다."
  },
  "q72": {
    "question": "블록 상세를 어떻게 확인하나요?",
    "answer": "Explorer에서 블록 번호를 입력하면 블록의 트랜잭션 목록, 제안자, 타임스탬프, 사용 가스를 확인할 수 있습니다. 부모 해시와 상태 루트도 검증할 수 있습니다."
  },
  "q73": {
    "question": "주소 상세를 어떻게 확인하나요?",
    "answer": "Explorer에서 주소를 입력하면 잔액, 트랜잭션 내역, 토큰 보유량, 계약 정보를 확인할 수 있습니다. 내부 트랜잭션과 이벤트 로그도 표시됩니다."
  },
  "q74": {
    "question": "토큰 목록을 어떻게 보나요?",
    "answer": "Explorer의 Tokens 페이지에서 네트워크에 발행된 모든 토큰을 확인합니다. 보유자 수, 전송 횟수, 시가총액을 확인합니다. 토큰 계약 검증 상태도 표시됩니다."
  },
  "q75": {
    "question": "계약 검증은 어떻게 하나요?",
    "answer": "계약 검증 페이지에서 소스 코드를 공개하고 컴파일 설정을 일치시켜 검증합니다. 검증된 계약은 소스 코드와 ABI를 표시하여 투명한 상호작용이 가능합니다."
  },
  "q76": {
    "question": "테스트넷은 어떻게 사용하나요?",
    "answer": "지갑에서 테스트넷 네트워크 설정으로 전환합니다. 테스트넷 Faucet에서 테스트 TB를 받고 메인넷처럼 테스트합니다. 테스트넷 Explorer는 메인넷과 분리되어 있습니다."
  },
  "q77": {
    "question": "Faucet이란 무엇인가요?",
    "answer": "Faucet은 테스트넷에서 무료 테스트 토큰을 제공합니다. 지갑 주소를 입력하면 24시간 내에 테스트 TB를 받습니다. 개발 및 테스트에 사용하세요."
  },
  "q78": {
    "question": "코드 예제 라이브러리란 무엇인가요?",
    "answer": "Code Examples 페이지에서 일반적인 사용 사례에 대한 샘플 코드를 제공합니다. 지갑 연결, 토큰 전송, 스테이킹 통합, NFT 발행 예제를 학습에 활용하세요."
  },
  "q79": {
    "question": "Quick Start 가이드란 무엇인가요?",
    "answer": "TBURN 개발을 시작하는 가장 빠른 방법을 설명합니다. SDK 설치부터 첫 트랜잭션까지 단계별 안내가 제공됩니다. 초보자에게 적합합니다."
  },
  "q80": {
    "question": "버그 신고는 어디서 하나요?",
    "answer": "발견한 버그는 커뮤니티 허브 피드백을 통해 신고하세요. 중요한 보안 취약점의 경우 Bug Bounty 프로그램을 통해 보상을 받을 수 있습니다."
  },
  "q81": {
    "question": "거버넌스란 무엇인가요?",
    "answer": "TB 토큰 보유자가 투표를 통해 의사결정에 참여합니다. 네트워크 업그레이드, 파라미터 변경, 자금 배분에 투표합니다. 투표권은 스테이킹 금액에 기반합니다."
  },
  "q82": {
    "question": "투표에 어떻게 참여하나요?",
    "answer": "거버넌스 섹션에서 진행 중인 제안을 확인하고 투표합니다. 투표권을 갖으려면 TB를 스테이킹해야 합니다. 투표 기간은 보통 7-14일입니다."
  },
  "q83": {
    "question": "DePIN이란 무엇인가요?",
    "answer": "DePIN(분산 물리적 인프라 네트워크)은 IoT 장치와 에너지 그리드와 같은 물리적 인프라를 토큰화하여 분산 관리 및 인센티브를 가능하게 합니다."
  },
  "q84": {
    "question": "테스트 토큰은 어디서 받나요?",
    "answer": "테스트넷 faucet에서 무료 테스트 TB를 받을 수 있습니다. 테스트넷 RPC 페이지에서 faucet 링크와 사용 방법을 확인하세요. 24시간마다 요청할 수 있습니다."
  },
  "q85": {
    "question": "Actions & Blinks란?",
    "answer": "Actions & Blinks는 블록체인 작업을 URL로 공유할 수 있는 기능입니다. 복잡한 트랜잭션도 링크 하나로 공유하고 실행할 수 있어 사용자 온보딩을 간소화합니다."
  },
  "q86": {
    "question": "토큰 확장 기능이란?",
    "answer": "TBC-20 토큰에 추가 기능(동결, 전송 제한, 이자, 메타데이터)을 확장할 수 있습니다. 규정 준수가 필요한 보안 토큰이나 특수 목적 토큰에 활용됩니다."
  },
  "q87": {
    "question": "허가형 블록체인 솔루션이란?",
    "answer": "기업이 접근 제어가 필요한 프라이빗 네트워크를 구축할 수 있습니다. TBURN의 기술을 기반으로 허가된 참가자만 접근 가능한 엔터프라이즈 블록체인을 운영합니다."
  },
  "q88": {
    "question": "상거래(Commerce) 솔루션은?",
    "answer": "온라인/오프라인 상점에서 TB 결제를 받을 수 있는 통합 솔루션입니다. 결제 API, POS 통합, 정산 시스템, 세금 계산 도구를 제공합니다."
  },
  "q89": {
    "question": "금융 솔루션은 무엇이 있나요?",
    "answer": "금융 기관을 위한 커스터디, 트레이딩, 결제, 자산 관리 솔루션을 제공합니다. 규정 준수 도구와 감사 추적 기능으로 기관 요구사항을 충족합니다."
  },
  "q90": {
    "question": "AI 기능은 무엇이 있나요?",
    "answer": "AI 기반 번 최적화, 거버넌스 분석, 브릿지 리스크 평가, 이상 탐지, 밸리데이터 스케줄링을 제공합니다. 다중 AI 모델(Gemini, Claude, GPT-4o, Grok)이 통합되어 있습니다."
  },
  "q91": {
    "question": "엔터프라이즈 사용 사례는?",
    "answer": "공급망 추적, 디지털 인증, 데이터 무결성 검증, 내부 토큰 시스템 구축 등 기업 블록체인 활용 사례를 제공합니다. 전담 지원과 SLA가 제공됩니다."
  },
  "q92": {
    "question": "토큰화(Tokenization)란?",
    "answer": "실물 자산(부동산, 예술품, 상품)을 블록체인 토큰으로 변환하는 것입니다. 분할 소유권, 유동성 증가, 24/7 거래가 가능해집니다."
  },
  "q93": {
    "question": "뉴스와 공지는 어디서 확인하나요?",
    "answer": "커뮤니티 뉴스 페이지에서 최신 업데이트, 파트너십 발표, 기술 개선 소식을 확인할 수 있습니다. 뉴스레터를 구독하면 이메일로도 받아볼 수 있습니다."
  },
  "q94": {
    "question": "이벤트에 어떻게 참여하나요?",
    "answer": "커뮤니티 이벤트 페이지에서 진행 중인 에어드랍, 캠페인, 밋업 정보를 확인하세요. 참여 조건을 충족하고 등록하면 보상을 받을 수 있습니다."
  },
  "q95": {
    "question": "거버넌스 제안은 어떻게 하나요?",
    "answer": "일정량의 TB를 스테이킹하면 거버넌스 제안을 생성할 수 있습니다. 제안 형식에 맞춰 내용을 작성하고 제출하면 커뮤니티 투표가 진행됩니다."
  },
  "q96": {
    "question": "커뮤니티 허브에서 무엇을 할 수 있나요?",
    "answer": "커뮤니티 허브에서 다른 사용자와 토론하고, 프로젝트를 소개하고, 피드백을 공유할 수 있습니다. 공식 공지사항과 개발 업데이트도 확인할 수 있습니다."
  },
  "q97": {
    "question": "자산을 안전하게 보관하는 방법은?",
    "answer": "1) 하드웨어 지갑 사용 권장, 2) 개인키/시드구문 절대 공유 금지, 3) 피싱 사이트 주의, 4) 공식 URL만 사용, 5) 2FA 활성화. 대량 자산은 반드시 콜드 월렛에 보관하세요."
  },
  "q98": {
    "question": "스캠을 어떻게 구별하나요?",
    "answer": "공식 채널만 신뢰하세요. 개인키나 시드구문을 요구하는 것은 100% 스캠입니다. \"무료 토큰\" \"긴급 업그레이드\" 등 급박함을 조성하는 메시지를 경계하세요."
  },
  "q99": {
    "question": "TB 토큰 총 발행량은 얼마인가요?",
    "answer": "TB 토큰의 초기 발행량과 현재 유통량은 토크노믹스 페이지에서 확인할 수 있습니다. 번 메커니즘으로 인해 총 공급량은 지속적으로 감소합니다."
  },
  "q100": {
    "question": "번(Burn) 메커니즘은 어떻게 작동하나요?",
    "answer": "모든 전송에 0.5% 번 수수료가 적용되어 해당 금액이 영구 소각됩니다. 또한 네트워크 수수료 일부도 소각됩니다. 이 디플레이션 모델이 토큰 가치를 지지합니다."
  }
};

function updateLocaleFile(localePath, qnaContent) {
  try {
    const content = fs.readFileSync(localePath, 'utf8');
    const json = JSON.parse(content);
    json.qnaContent = qnaContent;
    fs.writeFileSync(localePath, JSON.stringify(json, null, 2), 'utf8');
    console.log(`Updated: ${path.basename(localePath)}`);
  } catch (error) {
    console.error(`Error updating ${localePath}:`, error.message);
  }
}

updateLocaleFile(path.join(localesDir, 'en.json'), qnaEnglish);
updateLocaleFile(path.join(localesDir, 'ko.json'), qnaKorean);

console.log('English and Korean locale files updated with qnaContent!');
