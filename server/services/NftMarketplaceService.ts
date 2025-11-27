import { storage } from "../storage";
import type { 
  NftCollection, 
  NftItem, 
  MarketplaceListing, 
  MarketplaceSale,
  NftActivityLog,
  InsertNftCollection,
  InsertNftItem,
  InsertMarketplaceListing,
  InsertMarketplaceSale,
  InsertNftActivityLog,
} from "@shared/schema";

const PRECISION = BigInt(10 ** 18);
const BASIS_POINTS = 10000;
const PLATFORM_FEE_BPS = 250;

function generateAddress(): string {
  const chars = "0123456789abcdef";
  let address = "0x";
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

function generateTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

const collectionNames = [
  { name: "TBURN Founders", symbol: "TBF", category: "PFP" },
  { name: "Quantum Punks", symbol: "QP", category: "Art" },
  { name: "AI Worlds", symbol: "AIW", category: "Metaverse" },
  { name: "CryptoBeasts", symbol: "BEAST", category: "Gaming" },
  { name: "Neon Dreams", symbol: "NEON", category: "Art" },
  { name: "BlockchainBots", symbol: "BBOT", category: "Collectible" },
  { name: "Digital Realms", symbol: "REALM", category: "Metaverse" },
  { name: "Genesis Artifacts", symbol: "GENA", category: "Collectible" },
];

const rarityTiers: Array<"common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic"> = [
  "common", "uncommon", "rare", "epic", "legendary", "mythic"
];

const rarityWeights = [40, 30, 15, 10, 4, 1];

function pickRarity(): "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic" {
  const total = rarityWeights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < rarityTiers.length; i++) {
    rand -= rarityWeights[i];
    if (rand <= 0) return rarityTiers[i];
  }
  return "common";
}

function getRarityScore(tier: string): number {
  const scores: Record<string, number> = {
    common: 1000,
    uncommon: 2500,
    rare: 5000,
    epic: 7500,
    legendary: 9000,
    mythic: 9900,
  };
  return scores[tier] || 1000;
}

export class NftMarketplaceService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const existingCollections = await storage.getAllNftCollections();
      if (existingCollections.length > 0) {
        console.log(`[NFT Marketplace] Found ${existingCollections.length} existing collections`);
        this.initialized = true;
        return;
      }

      console.log("[NFT Marketplace] Initializing demo data...");
      await this.seedDemoData();
      this.initialized = true;
      console.log("[NFT Marketplace] Demo data initialized successfully");
    } catch (error) {
      console.error("[NFT Marketplace] Initialization error:", error);
    }
  }

  private async seedDemoData(): Promise<void> {
    for (const collData of collectionNames) {
      const creatorAddress = generateAddress();
      const contractAddress = generateAddress();
      
      const totalItems = Math.floor(Math.random() * 5000) + 500;
      const floorPrice = (BigInt(Math.floor(Math.random() * 50) + 1) * PRECISION).toString();
      const volume24h = (BigInt(Math.floor(Math.random() * 1000)) * PRECISION).toString();
      const volumeTotal = (BigInt(Math.floor(Math.random() * 50000)) * PRECISION).toString();
      
      const collection = await storage.createNftCollection({
        name: collData.name,
        symbol: collData.symbol,
        description: `${collData.name} is a premium NFT collection on the TBURN blockchain featuring unique digital assets with AI-enhanced rarity scoring.`,
        contractAddress,
        tokenStandard: "TBC-721",
        creatorAddress,
        creatorName: `${collData.name} Studios`,
        verified: Math.random() > 0.3,
        imageUrl: `https://picsum.photos/seed/${collData.symbol}/400/400`,
        bannerUrl: `https://picsum.photos/seed/${collData.symbol}banner/1200/400`,
        royaltyFee: Math.floor(Math.random() * 500) + 100,
        royaltyRecipient: creatorAddress,
        totalItems,
        listedItems: Math.floor(totalItems * 0.15),
        owners: Math.floor(totalItems * 0.6),
        floorPrice,
        floorPriceUsd: "0",
        volume24h,
        volume24hUsd: "0",
        volumeTotal,
        volumeTotalUsd: "0",
        avgPrice24h: floorPrice,
        salesCount24h: Math.floor(Math.random() * 50),
        salesCountTotal: Math.floor(Math.random() * 2000),
        marketCap: (BigInt(floorPrice) * BigInt(totalItems)).toString(),
        marketCapUsd: "0",
        status: "active",
        featured: Math.random() > 0.7,
        aiRarityScore: Math.floor(Math.random() * 3000) + 7000,
        aiTrendScore: Math.floor(Math.random() * 5000) + 5000,
        category: collData.category,
        tags: [collData.category.toLowerCase(), "nft", "tburn"],
      });

      const itemCount = Math.min(20, totalItems);
      for (let i = 0; i < itemCount; i++) {
        const rarityTier = pickRarity();
        const rarityScore = getRarityScore(rarityTier);
        const ownerAddress = generateAddress();
        
        const basePrice = BigInt(floorPrice);
        const multiplier = rarityScore / 1000;
        const itemPrice = (basePrice * BigInt(Math.floor(multiplier * 100)) / BigInt(100)).toString();
        
        const item = await storage.createNftItem({
          collectionId: collection.id,
          tokenId: `${i + 1}`,
          tokenUri: `ipfs://Qm${generateAddress().slice(2, 48)}/${i + 1}.json`,
          name: `${collData.name} #${i + 1}`,
          description: `A unique ${rarityTier} item from the ${collData.name} collection.`,
          imageUrl: `https://picsum.photos/seed/${collData.symbol}${i}/500/500`,
          attributes: JSON.stringify([
            { trait_type: "Rarity", value: rarityTier },
            { trait_type: "Generation", value: "1" },
            { trait_type: "Power", value: Math.floor(Math.random() * 100) + 1 },
          ]),
          ownerAddress,
          creatorAddress,
          totalSupply: 1,
          availableSupply: 1,
          rarityRank: i + 1,
          rarityScore,
          rarityTier,
          estimatedValue: itemPrice,
          estimatedValueUsd: "0",
          status: "active",
          isListed: Math.random() > 0.7,
          mintTxHash: generateTxHash(),
          mintedAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
          mintPrice: floorPrice,
          aiAnalyzed: true,
          aiContentScore: Math.floor(Math.random() * 2000) + 8000,
          aiAuthenticityScore: 10000,
        });

        if (item.isListed) {
          const listingPrice = (BigInt(itemPrice) * BigInt(110) / BigInt(100)).toString();
          await storage.createListing({
            collectionId: collection.id,
            itemId: item.id,
            sellerAddress: ownerAddress,
            listingType: Math.random() > 0.8 ? "auction" : "fixed",
            price: listingPrice,
            priceUsd: "0",
            currency: "TBURN",
            quantity: 1,
            remainingQuantity: 1,
            startsAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: "active",
          });
        }

        await storage.createActivityLog({
          collectionId: collection.id,
          itemId: item.id,
          eventType: "mint",
          fromAddress: null,
          toAddress: ownerAddress,
          price: item.mintPrice,
          priceUsd: "0",
          currency: "TBURN",
          quantity: 1,
          txHash: item.mintTxHash,
        });
      }
    }

    await storage.createNftMarketplaceStats({
      volume24h: "0",
      volume24hUsd: "0",
      volume7d: "0",
      volume7dUsd: "0",
      volumeTotal: "0",
      volumeTotalUsd: "0",
      salesCount24h: 0,
      salesCount7d: 0,
      salesCountTotal: 0,
      totalCollections: collectionNames.length,
      activeCollections: collectionNames.length,
      verifiedCollections: 0,
      totalItems: 0,
      listedItems: 0,
      activeListings: 0,
      auctionListings: 0,
      totalUsers: 0,
      activeTraders24h: 0,
      totalPlatformFees: "0",
      platformFees24h: "0",
      totalRoyalties: "0",
      royalties24h: "0",
      avgFloorPrice: "0",
      avgFloorPriceUsd: "0",
    });
  }

  async getMarketplaceOverview(): Promise<{
    totalVolume24h: string;
    totalVolume24hUsd: string;
    salesCount24h: number;
    activeListings: number;
    auctionListings: number;
    totalCollections: number;
    verifiedCollections: number;
    totalItems: number;
    activeTraders: number;
    avgFloorPrice: string;
    trendingCollections: NftCollection[];
    recentSales: MarketplaceSale[];
    recentActivity: NftActivityLog[];
  }> {
    const [overview, trending, sales, activity] = await Promise.all([
      storage.getNftMarketplaceOverview(),
      storage.getTrendingNftCollections(5),
      storage.getRecentSales(10),
      storage.getRecentActivity(20),
    ]);

    return {
      ...overview,
      trendingCollections: trending,
      recentSales: sales,
      recentActivity: activity,
    };
  }

  async getCollectionDetails(collectionId: string): Promise<{
    collection: NftCollection;
    items: NftItem[];
    listings: MarketplaceListing[];
    activity: NftActivityLog[];
  } | null> {
    const collection = await storage.getNftCollectionById(collectionId);
    if (!collection) return null;

    const [items, listings, activity] = await Promise.all([
      storage.getNftItemsByCollection(collectionId, 50),
      storage.getListingsByCollection(collectionId, 50),
      storage.getActivityByCollection(collectionId, 50),
    ]);

    return { collection, items, listings, activity };
  }

  async getItemDetails(itemId: string): Promise<{
    item: NftItem;
    collection: NftCollection;
    listing: MarketplaceListing | null;
    activity: NftActivityLog[];
  } | null> {
    const item = await storage.getNftItemById(itemId);
    if (!item) return null;

    const collection = await storage.getNftCollectionById(item.collectionId);
    if (!collection) return null;

    const listings = await storage.getActiveListings(1);
    const itemListing = listings.find(l => l.itemId === itemId) || null;
    const activity = await storage.getActivityByItem(itemId, 20);

    return { item, collection, listing: itemListing, activity };
  }

  async createListing(
    itemId: string,
    sellerAddress: string,
    price: string,
    listingType: "fixed" | "auction" | "dutch_auction" = "fixed",
    expiresAt?: Date
  ): Promise<MarketplaceListing> {
    const item = await storage.getNftItemById(itemId);
    if (!item) throw new Error("Item not found");
    if (item.ownerAddress.toLowerCase() !== sellerAddress.toLowerCase()) {
      throw new Error("Only the owner can list this item");
    }
    if (item.isListed) throw new Error("Item is already listed");

    const listing = await storage.createListing({
      collectionId: item.collectionId,
      itemId,
      sellerAddress,
      listingType,
      price,
      priceUsd: "0",
      currency: "TBURN",
      quantity: 1,
      remainingQuantity: 1,
      startsAt: new Date(),
      expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "active",
    });

    await storage.updateNftItem(itemId, { isListed: true });

    await storage.createActivityLog({
      collectionId: item.collectionId,
      itemId,
      eventType: "list",
      fromAddress: sellerAddress,
      toAddress: null,
      price,
      priceUsd: "0",
      currency: "TBURN",
      quantity: 1,
      listingId: listing.id,
    });

    return listing;
  }

  async cancelListing(listingId: string, sellerAddress: string): Promise<void> {
    const listing = await storage.getListingById(listingId);
    if (!listing) throw new Error("Listing not found");
    if (listing.sellerAddress.toLowerCase() !== sellerAddress.toLowerCase()) {
      throw new Error("Only the seller can cancel this listing");
    }
    if (listing.status !== "active") throw new Error("Listing is not active");

    await storage.updateListing(listingId, { status: "cancelled" });
    await storage.updateNftItem(listing.itemId, { isListed: false });

    await storage.createActivityLog({
      collectionId: listing.collectionId,
      itemId: listing.itemId,
      eventType: "delist",
      fromAddress: sellerAddress,
      toAddress: null,
      listingId,
    });
  }

  async executeSale(
    listingId: string,
    buyerAddress: string,
    txHash: string
  ): Promise<MarketplaceSale> {
    const listing = await storage.getListingById(listingId);
    if (!listing) throw new Error("Listing not found");
    if (listing.status !== "active") throw new Error("Listing is not active");

    const collection = await storage.getNftCollectionById(listing.collectionId);
    if (!collection) throw new Error("Collection not found");

    const platformFee = (BigInt(listing.price) * BigInt(PLATFORM_FEE_BPS) / BigInt(BASIS_POINTS)).toString();
    const royaltyFee = (BigInt(listing.price) * BigInt(collection.royaltyFee) / BigInt(BASIS_POINTS)).toString();
    const sellerProceeds = (BigInt(listing.price) - BigInt(platformFee) - BigInt(royaltyFee)).toString();

    const sale = await storage.createSale({
      listingId,
      collectionId: listing.collectionId,
      itemId: listing.itemId,
      sellerAddress: listing.sellerAddress,
      buyerAddress,
      saleType: listing.listingType === "auction" ? "auction" : "fixed",
      salePrice: listing.price,
      salePriceUsd: "0",
      currency: listing.currency,
      quantity: 1,
      platformFee,
      platformFeePercent: PLATFORM_FEE_BPS,
      royaltyFee,
      royaltyFeePercent: collection.royaltyFee,
      royaltyRecipient: collection.royaltyRecipient,
      sellerProceeds,
      txHash,
    });

    await storage.updateListing(listingId, { status: "sold" });
    await storage.updateNftItem(listing.itemId, { 
      ownerAddress: buyerAddress, 
      isListed: false,
      lastSalePrice: listing.price,
      lastSaleAt: new Date(),
    });

    await storage.createActivityLog({
      collectionId: listing.collectionId,
      itemId: listing.itemId,
      eventType: "sale",
      fromAddress: listing.sellerAddress,
      toAddress: buyerAddress,
      price: listing.price,
      priceUsd: "0",
      currency: listing.currency,
      quantity: 1,
      txHash,
      listingId,
      saleId: sale.id,
    });

    return sale;
  }
}

export const nftMarketplaceService = new NftMarketplaceService();
