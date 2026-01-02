import{a as N,r as l,aR as w,aK as S,Z as G,j as e,fM as y,aO as E,bi as D,cI as j,gh as V,cF as o,fP as T,L as i,ae as P,fN as R,p as C,gA as B,gB as _,gD as A,gC as $}from"./index-4Fx_5_L1.js";const I=`import { defineConfig } from '@tburn/sdk';

export default defineConfig({
  // Network: mainnet, testnet, devnet
  network: 'mainnet',
  
  // API Credentials
  apiKey: process.env.TBURN_API_KEY,
  
  // Options
  timeout: 30000,
  retries: 3,
  ws: {
    enabled: true
  }
});`,c=`import { TBurnClient } from '@tburn/sdk';

// 1. Initialize Client
const client = new TBurnClient({ apiKey: 'YOUR_KEY' });

// 2. Get Balance
const balance = await client.getBalance('0xYourAddress...');
console.log(\`Balance: \${balance.formatted} TBURN\`);

// 3. Query Trust Score (AI)
const score = await client.ai.getTrustScore('0xProjectAddress...');
console.log(\`Score: \${score.value}/100 (Grade: \${score.grade})\`);

// 4. Send Transaction
const tx = await client.transfer({
  to: '0xRecipient...',
  amount: '100', // TBURN
  gasLimit: 'auto'
});
console.log(\`Transaction Hash: \${tx.hash}\`);`,L=`import { TBurnClient, DeFi } from '@tburn/sdk';

const client = new TBurnClient({ apiKey: 'YOUR_KEY' });

// 1. Get Pool Info
const pool = await client.defi.getPool('TBURN-USDT');
console.log(\`TVL: \${pool.tvl}, APY: \${pool.apy}%\`);

// 2. Add Liquidity
const lpTokens = await client.defi.addLiquidity({
  poolId: 'TBURN-USDT',
  amountA: '1000',
  amountB: '500',
  slippage: 0.5
});

// 3. Swap Tokens
const swap = await client.defi.swap({
  from: 'TBURN',
  to: 'USDT',
  amount: '100',
  minReceived: '98'
});`,U=`import { TBurnClient } from '@tburn/sdk';

const client = new TBurnClient({ apiKey: 'YOUR_KEY' });

// 1. Subscribe to New Blocks
client.ws.subscribeBlocks((block) => {
  console.log(\`New block: #\${block.number}\`);
});

// 2. Watch Address Transactions
client.ws.watchAddress('0xYourAddress...', (tx) => {
  console.log(\`New tx: \${tx.hash}\`);
});

// 3. Listen to Trust Score Updates
client.ws.subscribeTrustScores(['0xProject1...'], (update) => {
  console.log(\`Score changed: \${update.oldScore} → \${update.newScore}\`);
});`,Y=`import { TBurnClient, TBurnError, RateLimitError, NetworkError } from '@tburn/sdk';

const client = new TBurnClient({ apiKey: 'YOUR_KEY' });

try {
  const balance = await client.getBalance('0xAddress...');
} catch (error) {
  if (error instanceof RateLimitError) {
    // Handle rate limiting - wait and retry
    console.log(\`Rate limited. Retry after \${error.retryAfter} seconds\`);
    await sleep(error.retryAfter * 1000);
    // Retry the request
  } else if (error instanceof NetworkError) {
    // Handle network issues
    console.error(\`Network error: \${error.message}\`);
    // Implement fallback or retry logic
  } else if (error instanceof TBurnError) {
    // Handle API errors
    console.error(\`API Error \${error.code}: \${error.message}\`);
    switch (error.code) {
      case 'INVALID_ADDRESS':
        console.log('Please check the address format');
        break;
      case 'INSUFFICIENT_FUNDS':
        console.log('Not enough balance for this operation');
        break;
      default:
        console.log('An unexpected error occurred');
    }
  }
}`,H=`from tburn_sdk import TBurnClient
from tburn_sdk.exceptions import TBurnError, RateLimitError

# Initialize client
client = TBurnClient(api_key="YOUR_API_KEY")

# Get balance
balance = client.get_balance("0xYourAddress...")
print(f"Balance: {balance.formatted} TBURN")

# Send transaction with error handling
try:
    tx = client.transfer(
        to="0xRecipient...",
        amount="100",
        gas_limit="auto"
    )
    print(f"Transaction Hash: {tx.hash}")
except RateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after} seconds")
except TBurnError as e:
    print(f"API Error {e.code}: {e.message}")

# DeFi operations
pool = client.defi.get_pool("TBURN-USDT")
print(f"TVL: {pool.tvl}, APY: {pool.apy}%")

# WebSocket streaming
@client.ws.on_block
def handle_block(block):
    print(f"New block: #{block.number}")

client.ws.connect()`,K=`package main

import (
    "fmt"
    "log"
    tburn "github.com/tburn/go-sdk"
)

func main() {
    // Initialize client
    client, err := tburn.NewClient(tburn.Config{
        APIKey:  "YOUR_API_KEY",
        Network: tburn.Mainnet,
    })
    if err != nil {
        log.Fatalf("Failed to create client: %v", err)
    }

    // Get balance with error handling
    balance, err := client.GetBalance("0xYourAddress...")
    if err != nil {
        switch e := err.(type) {
        case *tburn.RateLimitError:
            fmt.Printf("Rate limited. Retry after %d seconds\\n", e.RetryAfter)
        case *tburn.APIError:
            fmt.Printf("API Error %s: %s\\n", e.Code, e.Message)
        default:
            fmt.Printf("Unknown error: %v\\n", err)
        }
        return
    }
    fmt.Printf("Balance: %s TBURN\\n", balance.Formatted)

    // Send transaction
    tx, err := client.Transfer(tburn.TransferRequest{
        To:       "0xRecipient...",
        Amount:   "100",
        GasLimit: "auto",
    })
    if err == nil {
        fmt.Printf("Transaction Hash: %s\\n", tx.Hash)
    }
}`,O=`use tburn_sdk::{TBurnClient, Config, Error};

#[tokio::main]
async fn main() -> Result<(), Error> {
    // Initialize client
    let client = TBurnClient::new(Config {
        api_key: "YOUR_API_KEY".to_string(),
        network: Network::Mainnet,
        ..Default::default()
    })?;

    // Get balance with pattern matching error handling
    match client.get_balance("0xYourAddress...").await {
        Ok(balance) => {
            println!("Balance: {} TBURN", balance.formatted);
        }
        Err(Error::RateLimit { retry_after }) => {
            println!("Rate limited. Retry after {} seconds", retry_after);
        }
        Err(Error::Api { code, message }) => {
            println!("API Error {}: {}", code, message);
        }
        Err(e) => {
            println!("Unknown error: {:?}", e);
        }
    }

    // Send transaction
    let tx = client.transfer(TransferRequest {
        to: "0xRecipient...".to_string(),
        amount: "100".to_string(),
        gas_limit: GasLimit::Auto,
    }).await?;
    
    println!("Transaction Hash: {}", tx.hash);
    Ok(())
}`;function z(){const{t}=N(),[s,p]=l.useState("JavaScript"),[n,m]=l.useState("Core"),[u,d]=l.useState(null),b=[{name:"TypeScript",icon:B,color:"#ffd700",version:"v8.0.0",active:!0},{name:"Python",icon:_,color:"#3b82f6",version:"v8.0.0",active:!0},{name:"Go",icon:A,color:"#00f0ff",version:"v8.0.0",active:!0},{name:"Rust",icon:$,color:"#f97316",version:"v8.0.0",active:!0}],x=[{icon:w,title:t("publicPages.developers.sdk.features.typeSafety.title"),desc:t("publicPages.developers.sdk.features.typeSafety.description"),color:"#00ff9d",bgColor:"bg-[#00ff9d]/10"},{icon:S,title:t("publicPages.developers.sdk.features.autoRetry.title"),desc:t("publicPages.developers.sdk.features.autoRetry.description"),color:"#7000ff",bgColor:"bg-[#7000ff]/10"},{icon:G,title:t("publicPages.developers.sdk.features.realTimeStreams.title"),desc:t("publicPages.developers.sdk.features.realTimeStreams.description"),color:"#00f0ff",bgColor:"bg-[#00f0ff]/10"}],g=[{label:t("publicPages.developers.sdk.install.npm"),command:"npm install @tburn/sdk"},{label:t("publicPages.developers.sdk.install.yarn"),command:"yarn add @tburn/sdk"}],k=[t("publicPages.developers.sdk.examples.core"),t("publicPages.developers.sdk.examples.defi"),t("publicPages.developers.sdk.examples.streaming"),"Error Handling"],h=(a,r)=>{navigator.clipboard.writeText(a),d(r),setTimeout(()=>d(null),2e3)},f=()=>{switch(n){case t("publicPages.developers.sdk.examples.defi"):return L;case t("publicPages.developers.sdk.examples.streaming"):return U;case"Error Handling":return Y;default:return c}},v=()=>{switch(s){case"Python":return H;case"Go":return K;case"Rust":return O;default:return c}};return e.jsxDEV("main",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:313:4","data-component-name":"main",className:"flex-grow relative z-10 pt-4 bg-gray-50 dark:bg-transparent transition-colors",children:[e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:315:6","data-component-name":"section",className:"relative py-12 overflow-hidden border-b border-gray-200 dark:border-white/5",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:316:8","data-component-name":"div",className:"absolute top-0 right-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:316,columnNumber:9},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:318:8","data-component-name":"div",className:"max-w-7xl mx-auto px-6 lg:px-8 relative z-10",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:319:10","data-component-name":"div",className:"flex items-center gap-4 mb-6",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:320:12","data-component-name":"div",className:"w-14 h-14 rounded-lg bg-gradient-to-br from-[#7000ff] to-[#00f0ff] flex items-center justify-center shadow-[0_0_30px_rgba(112,0,255,0.3)]",children:e.jsxDEV(y,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:321:14","data-component-name":"Package",className:"w-7 h-7 text-white"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:321,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:320,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:323:12","data-component-name":"div",children:[e.jsxDEV("h1",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:324:14","data-component-name":"h1",className:"text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white",children:t("publicPages.developers.sdk.title")},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:324,columnNumber:15},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:325:14","data-component-name":"p",className:"text-sm text-[#00f0ff] font-mono mt-1",children:t("publicPages.developers.sdk.tag")},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:325,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:323,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:319,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:328:10","data-component-name":"p",className:"text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl",children:t("publicPages.developers.sdk.subtitle")},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:328,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:318,columnNumber:9},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:315,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:335:6","data-component-name":"section",className:"py-4 px-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/40 sticky top-20 z-40 backdrop-blur-md",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:336:8","data-component-name":"div",className:"max-w-7xl mx-auto px-6 lg:px-8",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:337:10","data-component-name":"div",className:"flex flex-wrap gap-3",children:b.map(a=>e.jsxDEV("button",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:339:14","data-component-name":"button",onClick:()=>p(a.name),className:`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition border ${s===a.name?"bg-[#7000ff]/20 border-[#7000ff] text-gray-900 dark:text-white":"bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#7000ff] hover:text-gray-900 dark:hover:text-white"}`,"data-testid":`button-lang-${a.name.toLowerCase()}`,children:[e.jsxDEV(a.icon,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:349:16","data-component-name":"lang.icon",className:"w-4 h-4",style:{color:a.color}},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:349,columnNumber:17},this),a.name,e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:351:16","data-component-name":"span",className:"text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10",children:a.version},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:351,columnNumber:17},this)]},a.name,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:339,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:337,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:336,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:335,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:359:6","data-component-name":"section",className:"py-16 px-6",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:360:8","data-component-name":"div",className:"max-w-7xl mx-auto px-6 lg:px-8",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:361:10","data-component-name":"div",className:"grid md:grid-cols-3 gap-6",children:x.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:363:14","data-component-name":"div",className:"bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-6",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:364:16","data-component-name":"div",className:"flex items-start gap-4",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:365:18","data-component-name":"div",className:`w-10 h-10 rounded-lg ${a.bgColor} flex items-center justify-center flex-shrink-0`,style:{color:a.color},children:e.jsxDEV(a.icon,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:366:20","data-component-name":"feature.icon",className:"w-5 h-5"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:366,columnNumber:21},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:365,columnNumber:19},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:368:18","data-component-name":"div",children:[e.jsxDEV("h3",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:369:20","data-component-name":"h3",className:"text-lg font-bold text-gray-900 dark:text-white mb-1",children:a.title},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:369,columnNumber:21},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:370:20","data-component-name":"p",className:"text-sm text-gray-600 dark:text-gray-400",children:a.desc},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:370,columnNumber:21},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:368,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:364,columnNumber:17},this)},r,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:363,columnNumber:15},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:361,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:360,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:359,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:380:6","data-component-name":"section",className:"py-16 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:381:8","data-component-name":"div",className:"max-w-7xl mx-auto px-6 lg:px-8",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:382:10","data-component-name":"div",className:"grid lg:grid-cols-2 gap-12",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:384:12","data-component-name":"div",children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:385:14","data-component-name":"h2",className:"text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2",children:[e.jsxDEV(E,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:386:16","data-component-name":"Download",className:"w-6 h-6 text-[#00f0ff]"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:386,columnNumber:17},this)," ",t("publicPages.developers.sdk.installation")]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:385,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:388:14","data-component-name":"div",className:"space-y-4",children:g.map((a,r)=>e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:390:18","data-component-name":"div",className:"bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl p-4",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:391:20","data-component-name":"div",className:"flex justify-between items-center mb-2",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:392:22","data-component-name":"span",className:"text-xs text-gray-500 font-mono",children:a.label},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:392,columnNumber:23},this),e.jsxDEV("button",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:393:22","data-component-name":"button",onClick:()=>h(a.command,r),className:"text-gray-500 hover:text-gray-900 dark:hover:text-white transition",children:e.jsxDEV(D,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:397:24","data-component-name":"Copy",className:`w-4 h-4 ${u===r?"text-[#00ff9d]":""}`},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:397,columnNumber:25},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:393,columnNumber:23},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:391,columnNumber:21},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:400:20","data-component-name":"div",className:"bg-gray-900 dark:bg-[#0d0d12] border border-gray-300 dark:border-white/10 rounded-lg p-3 font-mono text-sm text-white",children:a.command},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:400,columnNumber:21},this)]},r,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:390,columnNumber:19},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:388,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:384,columnNumber:13},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:409:12","data-component-name":"div",children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:410:14","data-component-name":"h2",className:"text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2",children:[e.jsxDEV(j,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:411:16","data-component-name":"Settings",className:"w-6 h-6 text-[#7000ff]"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:411,columnNumber:17},this)," ",t("publicPages.developers.sdk.configuration")]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:410,columnNumber:15},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:413:14","data-component-name":"div",className:"bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl overflow-hidden",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:414:16","data-component-name":"div",className:"bg-gray-100 dark:bg-black/40 border-b border-gray-200 dark:border-white/10 p-3 flex items-center gap-2",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:415:18","data-component-name":"span",className:"w-3 h-3 rounded-full bg-red-500"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:415,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:416:18","data-component-name":"span",className:"w-3 h-3 rounded-full bg-yellow-500"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:416,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:417:18","data-component-name":"span",className:"w-3 h-3 rounded-full bg-green-500"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:417,columnNumber:19},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:418:18","data-component-name":"span",className:"ml-2 text-xs text-gray-500 font-mono",children:"tburn.config.ts"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:418,columnNumber:19},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:414,columnNumber:17},this),e.jsxDEV("pre",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:420:16","data-component-name":"pre",className:"bg-gray-900 dark:bg-[#0d0d12] p-4 font-mono text-sm text-gray-300 dark:text-gray-400 overflow-x-auto",children:e.jsxDEV("code",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:421:18","data-component-name":"code",dangerouslySetInnerHTML:{__html:I.replace(/import|from|export default/g,'<span class="text-[#7000ff]">$&</span>').replace(/'[^']*'/g,'<span class="text-[#00ff9d]">$&</span>').replace(/\/\/.*/g,'<span class="text-gray-500">$&</span>').replace(/\b(true|false)\b/g,'<span class="text-[#7000ff]">$1</span>').replace(/\b(\d+)\b/g,'<span class="text-[#ffd700]">$1</span>')}},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:421,columnNumber:19},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:420,columnNumber:17},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:413,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:409,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:382,columnNumber:11},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:381,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:380,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:436:6","data-component-name":"section",className:"py-20 px-6",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:437:8","data-component-name":"div",className:"max-w-7xl mx-auto px-6 lg:px-8",children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:438:10","data-component-name":"h2",className:"text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2",children:[e.jsxDEV(V,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:439:12","data-component-name":"Code",className:"w-6 h-6 text-[#ffd700]"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:439,columnNumber:13},this)," ",t("publicPages.developers.sdk.quickExamples")]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:438,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:442:10","data-component-name":"div",className:"bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl overflow-hidden",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:443:12","data-component-name":"div",className:"flex border-b border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-black/40",children:k.map(a=>e.jsxDEV("button",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:445:16","data-component-name":"button",onClick:()=>m(a),className:`px-6 py-3 text-sm font-medium transition ${n===a?"text-gray-900 dark:text-white border-b-2 border-[#7000ff] bg-white dark:bg-white/5 font-bold":"text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`,"data-testid":`button-tab-${a.toLowerCase()}`,children:a},a,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:445,columnNumber:17},this))},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:443,columnNumber:13},this),e.jsxDEV("pre",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:460:12","data-component-name":"pre",className:"bg-gray-900 dark:bg-[#0d0d12] p-6 font-mono text-sm text-gray-300 dark:text-gray-400 overflow-x-auto",children:e.jsxDEV("code",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:461:14","data-component-name":"code",dangerouslySetInnerHTML:{__html:f().replace(/import|from|const|await|new/g,'<span class="text-[#7000ff]">$&</span>').replace(/'[^']*'/g,'<span class="text-[#00ff9d]">$&</span>').replace(/`[^`]*`/g,'<span class="text-[#00ff9d]">$&</span>').replace(/\/\/.*/g,'<span class="text-gray-500">$&</span>')}},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:461,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:460,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:442,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:437,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:436,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:473:6","data-component-name":"section",className:"py-16 px-6 bg-gray-100 dark:bg-white/5 border-y border-gray-200 dark:border-white/5",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:474:8","data-component-name":"div",className:"max-w-7xl mx-auto px-6 lg:px-8",children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:475:10","data-component-name":"h2",className:"text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2",children:[e.jsxDEV(o,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:476:12","data-component-name":"Terminal",className:"w-6 h-6 text-[#00ff9d]"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:476,columnNumber:13},this)," Language-Specific Examples"]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:475,columnNumber:11},this),e.jsxDEV("p",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:478:10","data-component-name":"p",className:"text-gray-600 dark:text-gray-400 mb-8",children:"Full SDK examples with error handling for each supported language. Select a language from the top navigation to see the corresponding code."},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:478,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:482:10","data-component-name":"div",className:"bg-white dark:bg-transparent shadow-sm border border-gray-200 dark:border-white/10 dark:spotlight-card rounded-xl overflow-hidden",children:[e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:483:12","data-component-name":"div",className:"bg-gray-100 dark:bg-black/40 border-b border-gray-200 dark:border-white/10 p-3 flex items-center gap-2",children:[e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:484:14","data-component-name":"span",className:"w-3 h-3 rounded-full bg-red-500"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:484,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:485:14","data-component-name":"span",className:"w-3 h-3 rounded-full bg-yellow-500"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:485,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:486:14","data-component-name":"span",className:"w-3 h-3 rounded-full bg-green-500"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:486,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:487:14","data-component-name":"span",className:"ml-2 text-xs text-gray-500 font-mono",children:s==="Python"?"main.py":s==="Go"?"main.go":s==="Rust"?"main.rs":"index.ts"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:487,columnNumber:15},this),e.jsxDEV("span",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:492:14","data-component-name":"span",className:"ml-auto text-xs px-2 py-0.5 rounded bg-[#7000ff]/20 text-[#7000ff]",children:s},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:492,columnNumber:15},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:483,columnNumber:13},this),e.jsxDEV("pre",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:494:12","data-component-name":"pre",className:"bg-gray-900 dark:bg-[#0d0d12] p-6 font-mono text-sm text-gray-300 dark:text-gray-400 overflow-x-auto max-h-[600px]",children:e.jsxDEV("code",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:495:14","data-component-name":"code",dangerouslySetInnerHTML:{__html:v().replace(/import|from|const|await|new|package|func|use|async|fn|let|match|Ok|Err/g,'<span class="text-[#7000ff]">$&</span>').replace(/"[^"]*"/g,'<span class="text-[#00ff9d]">$&</span>').replace(/'[^']*'/g,'<span class="text-[#00ff9d]">$&</span>').replace(/`[^`]*`/g,'<span class="text-[#00ff9d]">$&</span>').replace(/\/\/.*/g,'<span class="text-gray-500">$&</span>').replace(/#.*/g,'<span class="text-gray-500">$&</span>')}},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:495,columnNumber:15},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:494,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:482,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:474,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:473,columnNumber:7},this),e.jsxDEV("section",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:509:6","data-component-name":"section",className:"py-16 px-6 bg-gradient-to-br from-[#7000ff]/5 to-transparent border-t border-gray-200 dark:border-white/5",children:e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:510:8","data-component-name":"div",className:"container mx-auto max-w-4xl text-center",children:[e.jsxDEV("h2",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:511:10","data-component-name":"h2",className:"text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-center gap-2",children:[e.jsxDEV(T,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:512:12","data-component-name":"HelpCircle",className:"w-6 h-6"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:512,columnNumber:13},this)," ",t("publicPages.developers.sdk.needHelp.title")]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:511,columnNumber:11},this),e.jsxDEV("div",{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:514:10","data-component-name":"div",className:"flex flex-wrap justify-center gap-4",children:[e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:515:12","data-component-name":"Link",href:"/developers/api",className:"px-6 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-[#00f0ff] transition flex items-center gap-2 text-gray-900 dark:text-white","data-testid":"link-api-reference",children:[e.jsxDEV(P,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:520:14","data-component-name":"Server",className:"w-5 h-5 text-[#00f0ff]"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:520,columnNumber:15},this)," ",t("publicPages.developers.sdk.needHelp.apiReference")]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:515,columnNumber:13},this),e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:522:12","data-component-name":"Link",href:"/developers/cli",className:"px-6 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-[#00ff9d] transition flex items-center gap-2 text-gray-900 dark:text-white","data-testid":"link-cli-reference",children:[e.jsxDEV(o,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:527:14","data-component-name":"Terminal",className:"w-5 h-5 text-[#00ff9d]"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:527,columnNumber:15},this)," ",t("publicPages.developers.sdk.needHelp.cliReference")]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:522,columnNumber:13},this),e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:529:12","data-component-name":"Link",href:"/developers/examples",className:"px-6 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-[#ffd700] transition flex items-center gap-2 text-gray-900 dark:text-white","data-testid":"link-code-examples",children:[e.jsxDEV(R,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:534:14","data-component-name":"Book",className:"w-5 h-5 text-[#ffd700]"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:534,columnNumber:15},this)," ",t("publicPages.developers.sdk.needHelp.codeExamples")]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:529,columnNumber:13},this),e.jsxDEV(i,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:536:12","data-component-name":"Link",href:"/community/hub",className:"px-6 py-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-[#7000ff] transition flex items-center gap-2 text-gray-900 dark:text-white","data-testid":"link-discord-support",children:[e.jsxDEV(C,{"data-replit-metadata":"client/src/public/pages/developers/SdkGuide.tsx:541:14","data-component-name":"SiDiscord",className:"w-5 h-5 text-[#7000ff]"},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:541,columnNumber:15},this)," ",t("publicPages.developers.sdk.needHelp.discordSupport")]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:536,columnNumber:13},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:514,columnNumber:11},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:510,columnNumber:9},this)},void 0,!1,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:509,columnNumber:7},this)]},void 0,!0,{fileName:"/home/runner/workspace/client/src/public/pages/developers/SdkGuide.tsx",lineNumber:313,columnNumber:5},this)}export{z as default};
