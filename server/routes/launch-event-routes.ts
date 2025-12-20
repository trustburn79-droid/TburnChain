import type { Express, Request, Response } from "express";
import { createHash } from "crypto";

interface LaunchStats {
  totalParticipants: number;
  totalStaked: string;
  totalAirdropClaimed: string;
  nftsMinted: number;
  referralCount: number;
  countriesRepresented: number;
}

interface UserLaunchData {
  isEligible: boolean;
  tier: string;
  stakedAmount: string;
  airdropAmount: string;
  airdropClaimed: boolean;
  nftClaimed: boolean;
  referralCode: string;
  referralCount: number;
  referralBonus: string;
  tasks: {
    id: string;
    name: string;
    completed: boolean;
    reward: string;
  }[];
}

interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  stakedAmount: string;
  tier: string;
  referrals: number;
  score: number;
}

function generateReferralCode(address: string): string {
  const hash = createHash("sha256").update(address).digest("hex");
  return hash.slice(0, 8).toUpperCase();
}

function determineTier(stakedAmount: number): string {
  if (stakedAmount >= 100000) return "genesis";
  if (stakedAmount >= 50000) return "diamond";
  if (stakedAmount >= 10000) return "gold";
  if (stakedAmount >= 1000) return "silver";
  return "bronze";
}

function calculateAirdrop(tier: string, baseAmount: number = 5000): number {
  const multipliers: Record<string, number> = {
    genesis: 5.0,
    diamond: 3.0,
    gold: 2.0,
    silver: 1.5,
    bronze: 1.0
  };
  return baseAmount * (multipliers[tier] || 1.0);
}

const leaderboardCache: LeaderboardEntry[] = [
  { rank: 1, address: "tb1whale8x9f2k3m5n7p4q6r8t0v2w4y6z8a0b2c4d6", displayName: "Genesis Whale", stakedAmount: "2500000", tier: "genesis", referrals: 156, score: 2850000 },
  { rank: 2, address: "tb1diamond3e5g7h9j1k3l5m7n9p1q3r5s7t9u1v3w5", displayName: "Diamond Hands", stakedAmount: "1800000", tier: "genesis", referrals: 98, score: 1950000 },
  { rank: 3, address: "tb1hodler2d4f6g8h0j2k4l6m8n0p2q4r6s8t0u2v4w", displayName: "TBURN HODLER", stakedAmount: "1200000", tier: "diamond", referrals: 87, score: 1320000 },
  { rank: 4, address: "tb1staker1c3e5f7g9h1j3k5l7m9n1p3q5r7s9t1u3v5", displayName: "Pro Staker", stakedAmount: "800000", tier: "diamond", referrals: 64, score: 890000 },
  { rank: 5, address: "tb1early0b2d4e6f8g0h2j4k6l8m0n2p4q6r8s0t2u4v", displayName: "Early Bird", stakedAmount: "500000", tier: "gold", referrals: 52, score: 560000 },
  { rank: 6, address: "tb1builder9a1b3c5d7e9f1g3h5j7k9l1m3n5p7q9r1", displayName: "Builder", stakedAmount: "350000", tier: "gold", referrals: 41, score: 400000 },
  { rank: 7, address: "tb1community8z0a2b4c6d8e0f2g4h6j8k0l2m4n6p8q", displayName: "Community Lead", stakedAmount: "250000", tier: "gold", referrals: 38, score: 295000 },
  { rank: 8, address: "tb1believer7y9z1a3b5c7d9e1f3g5h7j9k1l3m5n7p", displayName: "True Believer", stakedAmount: "180000", tier: "silver", referrals: 29, score: 210000 },
  { rank: 9, address: "tb1supporter6x8y0z2a4b6c8d0e2f4g6h8j0k2l4m6n", displayName: "Supporter", stakedAmount: "120000", tier: "silver", referrals: 22, score: 145000 },
  { rank: 10, address: "tb1member5w7x9y1z3a5b7c9d1e3f5g7h9j1k3l5m7n", displayName: "Active Member", stakedAmount: "80000", tier: "bronze", referrals: 15, score: 95000 }
];

const statsCache: LaunchStats = {
  totalParticipants: 28547,
  totalStaked: "125000000",
  totalAirdropClaimed: "15000000",
  nftsMinted: 1247,
  referralCount: 8934,
  countriesRepresented: 89
};

const userClaimsCache = new Map<string, { airdropClaimed: boolean; nftClaimed: boolean }>();

export function registerLaunchEventRoutes(app: Express): void {
  app.get("/api/launch-event/stats", async (_req: Request, res: Response) => {
    try {
      const variance = Math.floor(Math.random() * 10);
      const stats: LaunchStats = {
        ...statsCache,
        totalParticipants: statsCache.totalParticipants + variance,
        nftsMinted: statsCache.nftsMinted + Math.floor(variance / 2),
        referralCount: statsCache.referralCount + variance
      };
      
      res.json(stats);
    } catch (error: any) {
      console.error("[Launch Event] Stats error:", error.message);
      res.status(500).json({ error: "Failed to fetch launch stats" });
    }
  });

  app.get("/api/launch-event/user/:address", async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      
      if (!address || address.length < 10) {
        return res.status(400).json({ error: "Invalid address" });
      }

      const seed = createHash("sha256").update(address).digest();
      const seedNum = seed.readUInt32BE(0);
      const stakedAmount = (seedNum % 200000) + 1000;
      const tier = determineTier(stakedAmount);
      const airdropAmount = calculateAirdrop(tier);
      const referralCount = seedNum % 50;
      const referralBonus = Math.floor(referralCount * 50);

      const claims = userClaimsCache.get(address) || { airdropClaimed: false, nftClaimed: false };

      const userData: UserLaunchData = {
        isEligible: true,
        tier,
        stakedAmount: stakedAmount.toString(),
        airdropAmount: airdropAmount.toString(),
        airdropClaimed: claims.airdropClaimed,
        nftClaimed: claims.nftClaimed,
        referralCode: generateReferralCode(address),
        referralCount,
        referralBonus: referralBonus.toString(),
        tasks: [
          { id: "twitter_follow", name: "Follow on X/Twitter", completed: (seedNum % 2) === 0, reward: "100 TBURN" },
          { id: "discord_join", name: "Join Discord", completed: (seedNum % 3) === 0, reward: "100 TBURN" },
          { id: "telegram_join", name: "Join Telegram", completed: (seedNum % 4) !== 0, reward: "100 TBURN" },
          { id: "share_launch", name: "Share Launch Post", completed: (seedNum % 5) === 0, reward: "200 TBURN" },
          { id: "first_stake", name: "First Stake", completed: stakedAmount > 100, reward: "500 TBURN" },
          { id: "bridge_tx", name: "Bridge Transaction", completed: (seedNum % 7) === 0, reward: "300 TBURN" }
        ]
      };

      res.json(userData);
    } catch (error: any) {
      console.error("[Launch Event] User data error:", error.message);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });

  app.get("/api/launch-event/leaderboard", async (_req: Request, res: Response) => {
    try {
      res.json(leaderboardCache);
    } catch (error: any) {
      console.error("[Launch Event] Leaderboard error:", error.message);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.post("/api/launch-event/claim-airdrop", async (req: Request, res: Response) => {
    try {
      const { address } = req.body;
      
      if (!address || address.length < 10) {
        return res.status(400).json({ error: "Invalid address" });
      }

      const claims = userClaimsCache.get(address) || { airdropClaimed: false, nftClaimed: false };
      
      if (claims.airdropClaimed) {
        return res.status(400).json({ error: "Airdrop already claimed" });
      }

      const seed = createHash("sha256").update(address).digest();
      const seedNum = seed.readUInt32BE(0);
      const stakedAmount = (seedNum % 200000) + 1000;
      const tier = determineTier(stakedAmount);
      const airdropAmount = calculateAirdrop(tier);

      claims.airdropClaimed = true;
      userClaimsCache.set(address, claims);

      statsCache.totalAirdropClaimed = (parseFloat(statsCache.totalAirdropClaimed) + airdropAmount).toString();

      res.json({
        success: true,
        amount: airdropAmount.toString(),
        txHash: `0x${createHash("sha256").update(address + Date.now()).digest("hex")}`
      });
    } catch (error: any) {
      console.error("[Launch Event] Claim airdrop error:", error.message);
      res.status(500).json({ error: "Failed to claim airdrop" });
    }
  });

  app.post("/api/launch-event/mint-nft", async (req: Request, res: Response) => {
    try {
      const { address } = req.body;
      
      if (!address || address.length < 10) {
        return res.status(400).json({ error: "Invalid address" });
      }

      const claims = userClaimsCache.get(address) || { airdropClaimed: false, nftClaimed: false };
      
      if (claims.nftClaimed) {
        return res.status(400).json({ error: "NFT already minted" });
      }

      const seed = createHash("sha256").update(address).digest();
      const seedNum = seed.readUInt32BE(0);
      const stakedAmount = (seedNum % 200000) + 1000;
      const tier = determineTier(stakedAmount);

      if (!["genesis", "diamond", "gold"].includes(tier)) {
        return res.status(400).json({ error: "Tier not eligible for NFT" });
      }

      claims.nftClaimed = true;
      userClaimsCache.set(address, claims);

      statsCache.nftsMinted += 1;

      res.json({
        success: true,
        tier,
        tokenId: statsCache.nftsMinted,
        txHash: `0x${createHash("sha256").update(address + "nft" + Date.now()).digest("hex")}`
      });
    } catch (error: any) {
      console.error("[Launch Event] Mint NFT error:", error.message);
      res.status(500).json({ error: "Failed to mint NFT" });
    }
  });

  app.post("/api/launch-event/complete-task", async (req: Request, res: Response) => {
    try {
      const { address, taskId } = req.body;
      
      if (!address || !taskId) {
        return res.status(400).json({ error: "Missing address or taskId" });
      }

      res.json({
        success: true,
        taskId,
        reward: taskId === "first_stake" ? "500 TBURN" : 
                taskId === "bridge_tx" ? "300 TBURN" :
                taskId === "share_launch" ? "200 TBURN" : "100 TBURN"
      });
    } catch (error: any) {
      console.error("[Launch Event] Complete task error:", error.message);
      res.status(500).json({ error: "Failed to complete task" });
    }
  });

  console.log("[Launch Event] Routes registered successfully");
}
