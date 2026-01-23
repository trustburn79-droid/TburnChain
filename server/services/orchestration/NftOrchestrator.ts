/**
 * NFT Orchestrator - Manages cross-module NFT marketplace operations
 * Ensures NFT trades update wallets, collections, and marketplace metrics
 */

import { dataHub } from '../DataHub';
import { eventBus } from '../EventBus';

export interface ListNftCommand {
  sellerAddress: string;
  collectionId: string;
  tokenId: string;
  price: string;
  currency: string;
  expiresAt?: number;
}

export interface BuyNftCommand {
  buyerAddress: string;
  listingId: string;
  price: string;
}

export interface BidCommand {
  bidderAddress: string;
  listingId: string;
  bidAmount: string;
  expiresAt?: number;
}

export interface AcceptBidCommand {
  sellerAddress: string;
  listingId: string;
  bidId: string;
}

export interface NftResult {
  success: boolean;
  listingId?: string;
  saleId?: string;
  txHash?: string;
  message: string;
  affectedModules: string[];
  royaltyPaid?: string;
  platformFee?: string;
}

class NftOrchestratorService {
  private totalCollections: number = 156;
  private totalListings: number = 2847;
  private volume24h: bigint = BigInt("850000000000000000000000");
  private floorPriceAvg: bigint = BigInt("125000000000000000000");

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    dataHub.updateNftMetrics(
      this.totalCollections,
      this.totalListings,
      this.volume24h.toString(),
      this.floorPriceAvg.toString()
    );
  }

  /**
   * List NFT for sale with cross-module updates
   */
  async listNft(command: ListNftCommand): Promise<NftResult> {
    const { sellerAddress, collectionId, tokenId, price, currency, expiresAt } = command;

    try {
      this.totalListings += 1;

      dataHub.updateNftMetrics(
        this.totalCollections,
        this.totalListings,
        this.volume24h.toString(),
        this.floorPriceAvg.toString()
      );

      const listingId = `listing_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      eventBus.publish({
        channel: 'nft.listings',
        type: 'NFT_LISTED',
        data: {
          listingId,
          sellerAddress,
          collectionId,
          tokenId,
          price,
          currency,
          expiresAt: expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1000,
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        sourceModule: 'nft',
        affectedModules: ['nft', 'wallets']
      });

      return {
        success: true,
        listingId,
        txHash: generateMockTxHash(),
        message: 'NFT listed successfully',
        affectedModules: ['nft', 'wallets']
      };
    } catch (error) {
      return {
        success: false,
        message: `List NFT failed: ${error}`,
        affectedModules: []
      };
    }
  }

  /**
   * Buy NFT with cross-module updates
   */
  async buyNft(command: BuyNftCommand): Promise<NftResult> {
    const { buyerAddress, listingId, price } = command;

    try {
      const salePrice = BigInt(price);
      const royaltyRate = BigInt(250);
      const platformFeeRate = BigInt(250);

      const royaltyAmount = (salePrice * royaltyRate) / BigInt(10000);
      const platformFee = (salePrice * platformFeeRate) / BigInt(10000);
      const sellerProceeds = salePrice - royaltyAmount - platformFee;

      this.totalListings = Math.max(0, this.totalListings - 1);
      this.volume24h += salePrice;

      dataHub.updateNftMetrics(
        this.totalCollections,
        this.totalListings,
        this.volume24h.toString(),
        this.floorPriceAvg.toString()
      );

      dataHub.invalidateAccountCache(buyerAddress);

      const saleId = `sale_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      eventBus.publish({
        channel: 'nft.sales',
        type: 'NFT_SOLD',
        data: {
          saleId,
          listingId,
          buyerAddress,
          price,
          royaltyPaid: royaltyAmount.toString(),
          platformFee: platformFee.toString(),
          sellerProceeds: sellerProceeds.toString(),
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        sourceModule: 'nft',
        affectedModules: ['wallets', 'nft', 'dashboard']
      });

      eventBus.publish({
        channel: 'wallets.balance',
        type: 'NFT_PURCHASE',
        data: {
          address: buyerAddress,
          amount: price,
          listingId,
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        sourceModule: 'nft',
        affectedModules: ['wallets']
      });

      eventBus.publish({
        channel: 'wallets.activity',
        type: 'NFT_TRANSFERRED',
        data: {
          listingId,
          newOwner: buyerAddress,
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        sourceModule: 'nft',
        affectedModules: ['wallets']
      });

      return {
        success: true,
        saleId,
        listingId,
        txHash: generateMockTxHash(),
        message: 'NFT purchased successfully',
        affectedModules: ['nft', 'wallets', 'dashboard'],
        royaltyPaid: royaltyAmount.toString(),
        platformFee: platformFee.toString()
      };
    } catch (error) {
      return {
        success: false,
        message: `Buy NFT failed: ${error}`,
        affectedModules: []
      };
    }
  }

  /**
   * Place bid on NFT
   */
  async placeBid(command: BidCommand): Promise<NftResult> {
    const { bidderAddress, listingId, bidAmount, expiresAt } = command;

    try {
      dataHub.invalidateAccountCache(bidderAddress);

      const bidId = `bid_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      eventBus.publish({
        channel: 'nft.listings',
        type: 'BID_PLACED',
        data: {
          bidId,
          listingId,
          bidderAddress,
          bidAmount,
          expiresAt: expiresAt || Date.now() + 24 * 60 * 60 * 1000,
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        sourceModule: 'nft',
        affectedModules: ['nft', 'wallets']
      });

      return {
        success: true,
        listingId,
        txHash: generateMockTxHash(),
        message: 'Bid placed successfully',
        affectedModules: ['nft', 'wallets']
      };
    } catch (error) {
      return {
        success: false,
        message: `Place bid failed: ${error}`,
        affectedModules: []
      };
    }
  }

  /**
   * Accept bid on NFT
   */
  async acceptBid(command: AcceptBidCommand): Promise<NftResult> {
    const { sellerAddress, listingId, bidId } = command;

    try {
      this.totalListings = Math.max(0, this.totalListings - 1);

      dataHub.updateNftMetrics(
        this.totalCollections,
        this.totalListings,
        this.volume24h.toString(),
        this.floorPriceAvg.toString()
      );

      dataHub.invalidateAccountCache(sellerAddress);

      eventBus.publish({
        channel: 'nft.sales',
        type: 'BID_ACCEPTED',
        data: {
          listingId,
          bidId,
          sellerAddress,
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        sourceModule: 'nft',
        affectedModules: ['wallets', 'nft']
      });

      return {
        success: true,
        listingId,
        txHash: generateMockTxHash(),
        message: 'Bid accepted successfully',
        affectedModules: ['nft', 'wallets']
      };
    } catch (error) {
      return {
        success: false,
        message: `Accept bid failed: ${error}`,
        affectedModules: []
      };
    }
  }

  /**
   * Get current NFT marketplace metrics
   */
  getMetrics() {
    return {
      totalCollections: this.totalCollections,
      totalListings: this.totalListings,
      volume24h: this.volume24h.toString(),
      floorPriceAvg: this.floorPriceAvg.toString()
    };
  }
}

export const nftOrchestrator = new NftOrchestratorService();
export default nftOrchestrator;
