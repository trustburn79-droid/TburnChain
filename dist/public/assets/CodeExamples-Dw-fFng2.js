import{r as l,j as e}from"./index-CKV5SgXC.js";import{L as N}from"./index-CDBApoG5.js";import{k as E}from"./index-D7kzilD4.js";import{d as k,u as C,o as w,a7 as y}from"./tburn-loader-Ca8nqTW3.js";import{C as j}from"./coins-BygYt6Qu.js";import{B as D}from"./bot-D95_KyhE.js";import{A as V}from"./arrow-left-right-Cs4L_pEB.js";import{D as I}from"./database-BMum3IG5.js";import{U as P}from"./utensils-BARwFNzT.js";import{F as T}from"./flame-BhiFoJoj.js";import"./i18nInstance-DCxlOlkw.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=k("Images",[["path",{d:"M18 22H4a2 2 0 0 1-2-2V6",key:"pblm9e"}],["path",{d:"m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18",key:"nf6bnh"}],["circle",{cx:"12",cy:"8",r:"2",key:"1822b1"}],["rect",{width:"16",height:"16",x:"6",y:"2",rx:"2",key:"12espp"}]]),c={"SecureVault.sol":`pragma solidity ^0.8.19;

import "@burnchain/contracts/ITrustOracle.sol";

contract SecureVault {
    ITrustOracle public trustOracle;
    uint256 public constant MIN_SCORE = 70;

    constructor(address _oracle) {
        trustOracle = ITrustOracle(_oracle);
    }

    function depositToProject(address project) external payable {
        // 1. Verify Trust Score before deposit
        uint8 score = trustOracle.getScore(project);
        
        require(score >= MIN_SCORE, "Project trust too low");
        
        // 2. Proceed with logic
        (bool success, ) = project.call{value: msg.value}("");
        require(success, "Transfer failed");
    }
}`,"App.tsx":`import { TBurnSDK } from '@tburn/sdk';
import { useState, useEffect } from 'react';

export function WalletConnect() {
  const [sdk, setSDK] = useState<TBurnSDK | null>(null);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    const initSDK = async () => {
      const instance = new TBurnSDK({
        apiKey: import.meta.env.VITE_TBURN_API_KEY,
        network: 'mainnet'
      });
      setSDK(instance);
    };
    initSDK();
  }, []);

  const connectWallet = async () => {
    if (!sdk) return;
    const wallet = await sdk.connectWallet();
    setAddress(wallet.address);
    const bal = await sdk.getBalance(wallet.address);
    setBalance(sdk.utils.formatEther(bal));
  };

  return (
    <div className="wallet-container">
      {address ? (
        <div>
          <p>Connected: {address.slice(0,6)}...{address.slice(-4)}</p>
          <p>Balance: {balance} TBURN</p>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}`,"DEXSwap.sol":`pragma solidity ^0.8.19;

import "@burnchain/contracts/ITBC20.sol";
import "@burnchain/contracts/ITrustOracle.sol";

contract TBurnDEX {
    ITrustOracle public trustOracle;
    uint256 public constant FEE_BPS = 30; // 0.3% fee
    
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
    }
    
    mapping(bytes32 => Pool) public pools;
    mapping(bytes32 => mapping(address => uint256)) public liquidity;
    
    event Swap(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed provider, bytes32 poolId, uint256 amountA, uint256 amountB);
    
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external returns (uint256 amountOut) {
        bytes32 poolId = getPoolId(tokenIn, tokenOut);
        Pool storage pool = pools[poolId];
        
        // Verify trust scores for tokens
        require(trustOracle.getScore(tokenIn) >= 60, "TokenIn trust too low");
        require(trustOracle.getScore(tokenOut) >= 60, "TokenOut trust too low");
        
        // Calculate output using x*y=k formula
        uint256 amountInWithFee = amountIn * (10000 - FEE_BPS);
        amountOut = (amountInWithFee * pool.reserveB) / (pool.reserveA * 10000 + amountInWithFee);
        
        require(amountOut >= minAmountOut, "Slippage too high");
        
        // Transfer tokens
        ITBC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        ITBC20(tokenOut).transfer(msg.sender, amountOut);
        
        // Update reserves
        pool.reserveA += amountIn;
        pool.reserveB -= amountOut;
        
        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
    
    function getPoolId(address tokenA, address tokenB) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(tokenA < tokenB ? tokenA : tokenB, tokenA < tokenB ? tokenB : tokenA));
    }
}`,"NFTMint.sol":`pragma solidity ^0.8.19;

import "@burnchain/contracts/TBC721.sol";
import "@burnchain/contracts/ITrustOracle.sol";

contract TBurnNFT is TBC721 {
    ITrustOracle public trustOracle;
    uint256 public nextTokenId;
    uint256 public mintPrice = 0.1 ether;
    uint256 public maxSupply = 10000;
    
    string private _baseTokenURI;
    
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => uint256) public mintCount;
    
    event NFTMinted(address indexed minter, uint256 tokenId, string tokenURI);
    
    constructor(
        address _oracle,
        string memory baseURI
    ) TBC721("TBURN Collection", "TBNFT") {
        trustOracle = ITrustOracle(_oracle);
        _baseTokenURI = baseURI;
    }
    
    function mint(string memory tokenURI) external payable returns (uint256) {
        require(nextTokenId < maxSupply, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");
        
        // Check minter trust score for anti-bot protection
        uint8 score = trustOracle.getScore(msg.sender);
        require(score >= 50, "Trust score too low");
        
        // Limit mints per wallet based on trust
        uint256 maxMints = score >= 80 ? 10 : 3;
        require(mintCount[msg.sender] < maxMints, "Mint limit reached");
        
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _tokenURIs[tokenId] = tokenURI;
        mintCount[msg.sender]++;
        
        emit NFTMinted(msg.sender, tokenId, tokenURI);
        return tokenId;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return string(abi.encodePacked(_baseTokenURI, _tokenURIs[tokenId]));
    }
}`};function O({code:a}){const o=n=>n.replace(/(pragma solidity|import|contract|constructor|function|external|payable|public|constant|require)/g,'<span style="color: #ff79c6">$1</span>').replace(/(SecureVault|ITrustOracle|getScore|call)/g,'<span style="color: #50fa7b">$1</span>').replace(/("@burnchain\/contracts\/ITrustOracle\.sol"|"Project trust too low"|"Transfer failed"|"")/g,'<span style="color: #f1fa8c">$1</span>').replace(/(\/\/ .*)/g,'<span style="color: #6272a4">$1</span>').replace(/(uint256|uint8|address|bool)/g,'<span style="color: #8be9fd">$1</span>');return e.jsxDEV("pre",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:203:4","data-component-name":"pre",className:"text-sm overflow-x-auto",dangerouslySetInnerHTML:{__html:o(a)}},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:203,columnNumber:5},this)}function K(){const{t:a}=C(),[o,n]=l.useState("All Recipes"),[p,x]=l.useState("SecureVault.sol"),d=l.useRef(null),b=[a("publicPages.developers.examples.categories.allRecipes"),a("publicPages.developers.examples.categories.smartContracts"),a("publicPages.developers.examples.categories.defi"),a("publicPages.developers.examples.categories.nfts"),a("publicPages.developers.examples.categories.wallets")],g=[{title:a("publicPages.developers.examples.recipes.connectWallet.title"),description:a("publicPages.developers.examples.recipes.connectWallet.description"),icon:w,color:"#00f0ff",category:a("publicPages.developers.examples.recipes.connectWallet.category"),tags:["#react","#web3"]},{title:a("publicPages.developers.examples.recipes.createToken.title"),description:a("publicPages.developers.examples.recipes.createToken.description"),icon:j,color:"#7000ff",category:a("publicPages.developers.examples.recipes.createToken.category"),tags:["#token","#smart-contract"]},{title:a("publicPages.developers.examples.recipes.aiOracle.title"),description:a("publicPages.developers.examples.recipes.aiOracle.description"),icon:D,color:"#00ff9d",category:a("publicPages.developers.examples.recipes.aiOracle.category"),tags:["#python","#api"]},{title:a("publicPages.developers.examples.recipes.nftMinting.title"),description:a("publicPages.developers.examples.recipes.nftMinting.description"),icon:S,color:"#ffd700",category:a("publicPages.developers.examples.recipes.nftMinting.category"),tags:["#nft","#mint"]},{title:a("publicPages.developers.examples.recipes.flashLoan.title"),description:a("publicPages.developers.examples.recipes.flashLoan.description"),icon:V,color:"#ff0055",category:a("publicPages.developers.examples.recipes.flashLoan.category"),tags:["#defi","#arbitrage"]},{title:a("publicPages.developers.examples.recipes.indexerSetup.title"),description:a("publicPages.developers.examples.recipes.indexerSetup.description"),icon:I,color:"#3b82f6",category:a("publicPages.developers.examples.recipes.indexerSetup.category"),tags:["#graph","#data"]}],v=[a("publicPages.developers.examples.featured.checks.trustScore"),a("publicPages.developers.examples.featured.checks.revert"),a("publicPages.developers.examples.featured.checks.gasOptimized")];return l.useEffect(()=>{const t=d.current;if(!t)return;const s=r=>{t.querySelectorAll(".spotlight-card").forEach(i=>{const u=i.getBoundingClientRect(),h=r.clientX-u.left,f=r.clientY-u.top;i.style.setProperty("--mouse-x",`${h}px`),i.style.setProperty("--mouse-y",`${f}px`)})};return t.addEventListener("mousemove",s),()=>t.removeEventListener("mousemove",s)},[]),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:301:4","data-component-name":"div",ref:d,className:"min-h-screen bg-gray-50 dark:bg-transparent transition-colors",children:[e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:303:6","data-component-name":"section",className:"relative py-20 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:304:8","data-component-name":"div",className:"absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00ff9d]/10 blur-[120px] rounded-full pointer-events-none"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:304,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:306:8","data-component-name":"div",className:"container mx-auto max-w-5xl text-center relative z-10",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:307:10","data-component-name":"div",className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00ff9d] mb-6",children:[e.jsxDEV(P,{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:308:12","data-component-name":"Utensils",className:"w-4 h-4"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:308,columnNumber:13},this)," ",a("publicPages.developers.examples.tag")]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:307,columnNumber:11},this),e.jsxDEV("h1",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:310:10","data-component-name":"h1",className:"text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6","data-testid":"text-page-title",children:[a("publicPages.developers.examples.title").split(" ")[0]," ",e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:312:12","data-component-name":"span",className:"bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent",children:a("publicPages.developers.examples.title").split(" ").slice(1).join(" ")||"Examples"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:312,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:310,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:316:10","data-component-name":"p",className:"text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-8",children:a("publicPages.developers.examples.subtitle")},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:316,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:320:10","data-component-name":"div",className:"flex flex-wrap justify-center gap-3",children:b.map((t,s)=>e.jsxDEV("button",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:322:14","data-component-name":"button",onClick:()=>n(t),className:`px-4 py-2 rounded-lg font-mono text-sm transition ${o===t?"bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50":"bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-white/10 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30"}`,"data-testid":`filter-${s}`,children:t},s,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:322,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:320,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:306,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:303,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:340:6","data-component-name":"section",className:"py-16 px-6",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:341:8","data-component-name":"div",className:"container mx-auto max-w-6xl",children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:342:10","data-component-name":"h2",className:"text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3",children:[e.jsxDEV(T,{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:343:12","data-component-name":"Flame",className:"w-6 h-6 text-[#7000ff]"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:343,columnNumber:13},this)," ",a("publicPages.developers.examples.featured.title")]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:342,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:346:10","data-component-name":"div",className:"grid lg:grid-cols-2 gap-8",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:347:12","data-component-name":"div",className:"space-y-6",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:348:14","data-component-name":"div",children:[e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:349:16","data-component-name":"p",className:"text-gray-600 dark:text-gray-400",children:a("publicPages.developers.examples.featured.description")},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:349,columnNumber:17},this),e.jsxDEV("ul",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:352:16","data-component-name":"ul",className:"space-y-3 text-gray-600 dark:text-gray-300 text-sm mt-4",children:v.map((t,s)=>e.jsxDEV("li",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:354:20","data-component-name":"li",className:"flex items-center gap-3",children:[e.jsxDEV(y,{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:355:22","data-component-name":"CheckCircle",className:"w-4 h-4 text-[#00ff9d]"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:355,columnNumber:23},this)," ",t]},s,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:354,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:352,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:348,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:361:14","data-component-name":"div",className:"flex gap-4",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:362:16","data-component-name":"div",className:"bg-gray-100 dark:bg-white/5 rounded p-3 border border-gray-300 dark:border-white/10 text-center flex-1",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:363:18","data-component-name":"div",className:"text-xs text-gray-500 uppercase",children:a("publicPages.developers.examples.featured.difficulty")},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:363,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:364:18","data-component-name":"div",className:"text-[#00ff9d] font-bold",children:a("publicPages.developers.examples.featured.intermediate")},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:364,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:362,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:366:16","data-component-name":"div",className:"bg-gray-100 dark:bg-white/5 rounded p-3 border border-gray-300 dark:border-white/10 text-center flex-1",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:367:18","data-component-name":"div",className:"text-xs text-gray-500 uppercase",children:a("publicPages.developers.examples.featured.time")},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:367,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:368:18","data-component-name":"div",className:"text-gray-900 dark:text-white font-bold",children:a("publicPages.developers.examples.featured.tenMins")},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:368,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:366,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:361,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:347,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:374:12","data-component-name":"div",className:"rounded-lg overflow-hidden shadow-2xl",style:{background:"#0d0d12",border:"1px solid rgba(255, 255, 255, 0.1)",boxShadow:"0 25px 50px -12px rgba(112, 0, 255, 0.2)"},"data-testid":"ide-window",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:383:14","data-component-name":"div",className:"px-4 py-2 flex items-center justify-between flex-wrap gap-2",style:{background:"#1a1a20",borderBottom:"1px solid rgba(255, 255, 255, 0.05)"},children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:390:16","data-component-name":"div",className:"flex gap-1.5",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:391:18","data-component-name":"span",className:"w-2.5 h-2.5 rounded-full bg-red-500"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:391,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:392:18","data-component-name":"span",className:"w-2.5 h-2.5 rounded-full bg-yellow-500"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:392,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:393:18","data-component-name":"span",className:"w-2.5 h-2.5 rounded-full bg-green-500"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:393,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:390,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:395:16","data-component-name":"div",className:"flex gap-3 text-xs font-mono overflow-x-auto",children:Object.keys(c).map(t=>e.jsxDEV("button",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:397:20","data-component-name":"button",onClick:()=>x(t),className:p===t?"text-[#00f0ff] border-b border-[#00f0ff] pb-1 whitespace-nowrap":"text-gray-500 hover:text-white transition whitespace-nowrap","data-testid":`tab-${t.replace(".","-")}`,children:t},t,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:397,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:395,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:383,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:411:14","data-component-name":"div",className:"p-6 font-mono text-gray-300 overflow-x-auto max-h-96",children:e.jsxDEV(O,{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:412:16","data-component-name":"SyntaxHighlight",code:c[p]||c["SecureVault.sol"]},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:412,columnNumber:17},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:411,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:374,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:346,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:341,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:340,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:420:6","data-component-name":"section",className:"py-16 px-6 bg-gray-100 dark:bg-white/5",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:421:8","data-component-name":"div",className:"container mx-auto max-w-7xl",children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:422:10","data-component-name":"h2",className:"text-2xl font-bold text-gray-900 dark:text-white mb-8",children:a("publicPages.developers.examples.commonRecipes")},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:422,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:424:10","data-component-name":"div",className:"grid md:grid-cols-2 lg:grid-cols-3 gap-6",children:g.map((t,s)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:426:14","data-component-name":"div",className:"bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6 group cursor-pointer","data-testid":`recipe-card-${s}`,children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:431:16","data-component-name":"div",className:"flex justify-between items-start mb-4 flex-wrap gap-2",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:432:18","data-component-name":"div",className:"p-2 rounded",style:{backgroundColor:`${t.color}10`,color:t.color},children:e.jsxDEV(t.icon,{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:436:20","data-component-name":"recipe.icon",className:"w-5 h-5"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:436,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:432,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:438:18","data-component-name":"span",className:"text-xs font-mono bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-600 dark:text-gray-300",children:t.category},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:438,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:431,columnNumber:17},this),e.jsxDEV("h3",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:442:16","data-component-name":"h3",className:"text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors",style:{"--hover-color":t.color},children:t.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:442,columnNumber:17},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:448:16","data-component-name":"p",className:"text-sm text-gray-600 dark:text-gray-400 mb-4",children:t.description},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:448,columnNumber:17},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:449:16","data-component-name":"div",className:"flex gap-2 text-xs font-mono text-gray-500",children:t.tags.map((r,m)=>e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:451:20","data-component-name":"span",children:r},m,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:451,columnNumber:21},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:449,columnNumber:17},this)]},s,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:426,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:424,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:421,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:420,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:461:6","data-component-name":"section",className:"py-20 px-6",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:462:8","data-component-name":"div",className:"container mx-auto max-w-4xl",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:463:10","data-component-name":"div",className:"rounded-2xl p-1",style:{background:"linear-gradient(to right, rgba(112, 0, 255, 0.2), rgba(0, 240, 255, 0.2))",border:"1px solid rgba(255, 255, 255, 0.1)"},children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:470:12","data-component-name":"div",className:"rounded-xl p-10 text-center",style:{background:"rgba(0, 0, 0, 0.8)",backdropFilter:"blur(24px)"},children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:474:14","data-component-name":"h2",className:"text-3xl font-bold text-white mb-4",children:a("publicPages.developers.examples.cta.title")},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:474,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:475:14","data-component-name":"p",className:"text-gray-400 mb-8",children:a("publicPages.developers.examples.cta.description")},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:475,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:478:14","data-component-name":"div",className:"flex justify-center gap-4 flex-wrap",children:[e.jsxDEV("a",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:479:16","data-component-name":"a",href:"https://github.com",target:"_blank",rel:"noopener noreferrer",className:"px-8 py-3 rounded-lg font-bold text-white flex items-center gap-2 transition-all hover:-translate-y-0.5",style:{background:"linear-gradient(90deg, #7000ff, #00f0ff)",boxShadow:"0 0 15px rgba(112, 0, 255, 0.3)"},"data-testid":"button-submit-pr",children:[e.jsxDEV(E,{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:490:18","data-component-name":"SiGithub",className:"w-5 h-5"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:490,columnNumber:19},this)," ",a("publicPages.developers.examples.cta.submitPr")]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:479,columnNumber:17},this),e.jsxDEV(N,{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:492:16","data-component-name":"Link",href:"/community/hub",children:e.jsxDEV("button",{"data-replit-metadata":"client/src/public/pages/developers/CodeExamples.tsx:493:18","data-component-name":"button",className:"px-8 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition","data-testid":"button-request-guide",children:a("publicPages.developers.examples.cta.requestGuide")},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:493,columnNumber:19},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:492,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:478,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:470,columnNumber:13},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:463,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:462,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:461,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/CodeExamples.tsx",lineNumber:301,columnNumber:5},this)}export{K as default};
