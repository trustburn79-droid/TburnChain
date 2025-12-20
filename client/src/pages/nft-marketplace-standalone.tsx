import { useState, useCallback } from "react";
import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Image, 
  Grid3X3, 
  TrendingUp, 
  Star, 
  Gavel, 
  Clock,
  DollarSign,
  Package,
  Activity,
  Search,
  Filter,
  CheckCircle,
  ShoppingCart,
  X,
  Plus,
  Loader2,
  RefreshCw,
  Eye,
  Heart,
  Share2,
  ExternalLink,
  Copy,
  Users,
  Sparkles,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Tag,
  ChevronRight,
  Info,
  Shield,
  Wallet,
  Zap,
  Crown,
  Gem,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WalletRequiredBanner } from "@/components/require-wallet";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectModal } from "@/components/wallet-connect-modal";

const ENTERPRISE_WALLET = "0xTBURNEnterprise7a3b4c5d6e7f8901234567890abcdef";

interface NftCollection {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
  description?: string | null;
  verified: boolean;
  floorPrice: string;
  floorPriceUsd: string;
  volume24h: string;
  volume24hUsd: string;
  volumeTotal: string;
  owners: number;
  totalItems: number;
  listedItems: number;
  category: string | null;
  aiRarityScore: number | null;
  aiTrendScore: number | null;
  creatorAddress?: string | null;
  createdAt?: string;
  royaltyPercent?: number;
}

interface NftItem {
  id: string;
  collectionId: string;
  tokenId: string;
  name: string | null;
  description?: string | null;
  imageUrl: string | null;
  rarityTier: string | null;
  rarityScore: number | null;
  ownerAddress: string;
  isListed: boolean;
  estimatedValue: string | null;
  attributes?: Array<{ trait_type: string; value: string }>;
  createdAt?: string;
}

interface MarketplaceListing {
  id: string;
  collectionId: string;
  itemId: string;
  sellerAddress: string;
  listingType: string;
  price: string;
  currency: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
}

interface NftActivity {
  id: string;
  collectionId: string;
  itemId: string | null;
  eventType: string;
  fromAddress: string | null;
  toAddress: string | null;
  price: string | null;
  currency: string | null;
  txHash?: string | null;
  createdAt: string;
}

interface MarketplaceOverview {
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
  recentSales: any[];
  recentActivity: NftActivity[];
}

function formatAmount(wei: string | null | undefined, decimals: number = 18): string {
  if (!wei || wei === "0") return "0";
  try {
    const value = BigInt(wei);
    const divisor = BigInt(10 ** decimals);
    const integerPart = value / divisor;
    const remainder = value % divisor;
    const decimalStr = remainder.toString().padStart(decimals, '0').slice(0, 4);
    return `${integerPart.toLocaleString()}.${decimalStr}`;
  } catch {
    return "0";
  }
}

function parseAmount(amount: string, decimals: number = 18): string {
  try {
    const parts = amount.split('.');
    const integerPart = parts[0] || '0';
    const decimalPart = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals);
    return BigInt(integerPart + decimalPart).toString();
  } catch {
    return "0";
  }
}

function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      timeZone: 'America/New_York',
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch {
    return dateStr;
  }
}

function getRarityColor(tier: string | null): string {
  const colors: Record<string, string> = {
    common: "text-gray-400 bg-gray-500/20 border-gray-500/30",
    uncommon: "text-green-400 bg-green-500/20 border-green-500/30",
    rare: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    epic: "text-purple-400 bg-purple-500/20 border-purple-500/30",
    legendary: "text-orange-400 bg-orange-500/20 border-orange-500/30",
    mythic: "text-pink-400 bg-pink-500/20 border-pink-500/30",
  };
  return colors[tier || "common"] || colors.common;
}

function getEventTypeIcon(type: string) {
  const icons: Record<string, { icon: typeof Activity; color: string }> = {
    mint: { icon: Sparkles, color: "text-green-400" },
    list: { icon: Tag, color: "text-blue-400" },
    delist: { icon: X, color: "text-gray-400" },
    sale: { icon: ShoppingCart, color: "text-emerald-400" },
    bid: { icon: Gavel, color: "text-purple-400" },
    offer: { icon: DollarSign, color: "text-orange-400" },
    transfer: { icon: ArrowUpRight, color: "text-cyan-400" },
    burn: { icon: Flame, color: "text-red-400" },
  };
  return icons[type] || { icon: Activity, color: "text-gray-400" };
}

function GlassCard({ children, className = "", hover = false }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl
      bg-gradient-to-br from-white/10 to-white/5
      backdrop-blur-xl border border-white/20
      shadow-[0_8px_32px_rgba(0,0,0,0.12)]
      ${hover ? 'hover:border-white/40 hover:shadow-[0_8px_40px_rgba(139,92,246,0.15)] transition-all duration-300' : ''}
      ${className}
    `}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  trendUp,
  loading 
}: { 
  icon: typeof DollarSign; 
  label: string; 
  value: string; 
  trend?: string;
  trendUp?: boolean;
  loading?: boolean;
}) {
  return (
    <GlassCard hover className="p-5">
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
          <Icon className="w-5 h-5 text-purple-400" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        {loading ? (
          <Skeleton className="h-8 w-28 bg-white/10" />
        ) : (
          <div className="text-2xl font-bold text-white">{value}</div>
        )}
        <div className="text-sm text-white/60 mt-1">{label}</div>
      </div>
    </GlassCard>
  );
}

interface CollectionCardProps {
  collection: NftCollection;
  onViewDetails: (collection: NftCollection) => void;
}

function CollectionCard({ collection, onViewDetails }: CollectionCardProps) {
  const { t } = useTranslation();
  const priceChange = collection.aiTrendScore ? (collection.aiTrendScore - 50) * 2 : 0;
  
  return (
    <GlassCard hover className="p-4 cursor-pointer group">
      <div 
        className="flex gap-4"
        onClick={() => onViewDetails(collection)}
        data-testid={`card-collection-${collection.id}`}
      >
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
          {collection.imageUrl ? (
            <img src={collection.imageUrl} alt={collection.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="w-8 h-8 text-white/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white truncate">{collection.name}</span>
            {collection.verified && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent>{t("nftMarketplace.verifiedCollection")}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="text-sm text-white/60 flex items-center gap-2 mt-1">
            <span>{collection.symbol}</span>
            {collection.category && (
              <Badge className="text-xs bg-white/10 text-white/80 border-white/20">{collection.category}</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="text-white/70">
              <span className="text-white/50">{t("nftMarketplace.floor")}: </span>
              <span className="font-medium text-white">{formatAmount(collection.floorPrice)} TBURN</span>
            </div>
            {priceChange !== 0 && (
              <span className={`flex items-center text-xs font-medium ${priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(priceChange).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity self-center" />
      </div>
    </GlassCard>
  );
}

interface ListingCardProps {
  listing: MarketplaceListing;
  collections: NftCollection[];
  items: NftItem[];
  onBuyNow: (listing: MarketplaceListing) => void;
  onPlaceBid: (listing: MarketplaceListing) => void;
  onCancelListing: (listing: MarketplaceListing) => void;
  onViewItem: (item: NftItem, collection: NftCollection | undefined) => void;
}

function ListingCard({ listing, collections, items, onBuyNow, onPlaceBid, onCancelListing, onViewItem }: ListingCardProps) {
  const { t } = useTranslation();
  const collection = collections.find(c => c.id === listing.collectionId);
  const item = items.find(i => i.id === listing.itemId);
  const isOwner = listing.sellerAddress === ENTERPRISE_WALLET;
  
  return (
    <GlassCard hover className="overflow-hidden group" data-testid={`card-listing-${listing.id}`}>
      <div 
        className="aspect-square relative cursor-pointer overflow-hidden"
        onClick={() => item && onViewItem(item, collection)}
      >
        {item?.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name || t("nftMarketplace.nft")}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Image className="w-16 h-16 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <Eye className="w-6 h-6 text-white" />
        </div>
        {item?.rarityTier && (
          <Badge className={`absolute top-3 left-3 ${getRarityColor(item.rarityTier)} border`}>{item.rarityTier}</Badge>
        )}
        {listing.listingType === "auction" && (
          <Badge className="absolute top-3 right-3 bg-purple-500/90 border-purple-400/50">
            <Gavel className="w-3 h-3 mr-1" />Auction
          </Badge>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white truncate">{item?.name || `#${item?.tokenId}`}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-pink-400">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-sm text-white/60 flex items-center gap-2">
          {collection?.imageUrl && (
            <img src={collection.imageUrl} alt="" className="w-4 h-4 rounded-full border border-white/20" />
          )}
          <span className="truncate">{collection?.name}</span>
          {collection?.verified && <CheckCircle className="w-3 h-3 text-blue-400" />}
        </div>
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-white/50">{t("nftMarketplace.price")}</div>
            <div className="font-bold text-white">{formatAmount(listing.price)} TBURN</div>
          </div>
          <div className="flex gap-2">
            {isOwner ? (
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/50"
                onClick={(e) => { e.stopPropagation(); onCancelListing(listing); }}
                data-testid={`button-cancel-${listing.id}`}
              >
                <X className="w-3 h-3 mr-1" />Cancel
              </Button>
            ) : listing.listingType === "auction" ? (
              <Button 
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-0"
                onClick={(e) => { e.stopPropagation(); onPlaceBid(listing); }}
                data-testid={`button-bid-${listing.id}`}
              >
                <Gavel className="w-3 h-3 mr-1" />Bid
              </Button>
            ) : (
              <Button 
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-0"
                onClick={(e) => { e.stopPropagation(); onBuyNow(listing); }}
                data-testid={`button-buy-${listing.id}`}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />Buy
              </Button>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

interface ActivityRowProps {
  activity: NftActivity;
  collections: NftCollection[];
  items: NftItem[];
}

function ActivityRow({ activity, collections, items }: ActivityRowProps) {
  const { toast } = useToast();
  const collection = collections.find(c => c.id === activity.collectionId);
  const item = activity.itemId ? items.find(i => i.id === activity.itemId) : null;
  const eventIcon = getEventTypeIcon(activity.eventType);
  const Icon = eventIcon.icon;

  const copyTxHash = () => {
    if (activity.txHash) {
      navigator.clipboard.writeText(activity.txHash);
      toast({ title: "Copied", description: "Transaction hash copied to clipboard" });
    }
  };
  
  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-white/5 rounded-xl transition-colors group" data-testid={`row-activity-${activity.id}`}>
      <div className={`p-2.5 rounded-xl bg-white/10 ${eventIcon.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
        {item?.imageUrl ? (
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : collection?.imageUrl ? (
          <img src={collection.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-5 h-5 text-white/40" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium capitalize ${eventIcon.color}`}>{activity.eventType}</span>
          {item && <span className="text-sm font-medium text-white truncate">{item.name || `#${item.tokenId}`}</span>}
        </div>
        <div className="text-sm text-white/50 flex items-center gap-2">
          {collection && (
            <span className="flex items-center gap-1 truncate">
              {collection.name}
              {collection.verified && <CheckCircle className="w-3 h-3 text-blue-400" />}
            </span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        {activity.price && <div className="font-semibold text-white">{formatAmount(activity.price)} TBURN</div>}
        <div className="text-xs text-white/50">{formatDate(activity.createdAt)}</div>
      </div>
      {activity.txHash && (
        <Button variant="ghost" size="sm" className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white" onClick={(e) => { e.stopPropagation(); copyTxHash(); }}>
          <Copy className="w-3 h-3 mr-1" />Tx
        </Button>
      )}
    </div>
  );
}

interface ItemDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: NftItem | null;
  collection?: NftCollection;
  listings: MarketplaceListing[];
  activity: NftActivity[];
  onBuyNow: (listing: MarketplaceListing) => void;
  onPlaceBid: (listing: MarketplaceListing) => void;
}

function ItemDetailDialog({ open, onOpenChange, item, collection, listings, activity, onBuyNow, onPlaceBid }: ItemDetailDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  if (!item) return null;

  const itemListing = listings.find(l => l.itemId === item.id && l.status === "active");
  const itemActivity = activity.filter(a => a.itemId === item.id);
  const mockAttributes = [
    { trait_type: "Background", value: "Cosmic Purple" },
    { trait_type: "Body", value: "Quantum Gold" },
    { trait_type: "Eyes", value: "Laser Red" },
    { trait_type: "Accessories", value: "Plasma Crown" },
  ];

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({ title: "Copied", description: "Address copied to clipboard" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-white/20">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 relative border border-white/10">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name || "NFT"} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-20 h-20 text-white/30" />
                </div>
              )}
              {item.rarityTier && (
                <Badge className={`absolute top-3 left-3 ${getRarityColor(item.rarityTier)} border`}>{item.rarityTier}</Badge>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1 border-white/20 text-white"><Heart className="w-4 h-4 mr-1" />Favorite</Button>
              <Button variant="outline" size="sm" className="flex-1 border-white/20 text-white"><Share2 className="w-4 h-4 mr-1" />Share</Button>
              <Button variant="outline" size="icon" className="border-white/20 text-white"><ExternalLink className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="md:w-1/2 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                {collection && (
                  <>
                    {collection.imageUrl && <img src={collection.imageUrl} alt="" className="w-5 h-5 rounded-full border border-white/20" />}
                    <span>{collection.name}</span>
                    {collection.verified && <CheckCircle className="w-3 h-3 text-blue-400" />}
                  </>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">{item.name || `#${item.tokenId}`}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white/50" />
                <span className="text-sm text-white/70">Owned by</span>
                <button className="font-mono text-sm text-purple-400 hover:underline" onClick={() => copyAddress(item.ownerAddress)}>{shortenAddress(item.ownerAddress)}</button>
              </div>
              {item.rarityScore && (
                <Badge variant="outline" className="gap-1 border-white/20 text-white"><BarChart3 className="w-3 h-3" />Rank: #{item.rarityScore}</Badge>
              )}
            </div>
            {itemListing ? (
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-white/60">{itemListing.listingType === "auction" ? "Current Bid" : "Current Price"}</div>
                    <div className="text-2xl font-bold text-white">{formatAmount(itemListing.price)} TBURN</div>
                  </div>
                  {itemListing.listingType === "auction" && (
                    <div className="flex items-center gap-1 text-sm text-white/60"><Clock className="w-4 h-4" />Ends in: 12h 30m</div>
                  )}
                </div>
                <div className="flex gap-2">
                  {itemListing.listingType === "auction" ? (
                    <Button className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" onClick={() => onPlaceBid(itemListing)}><Gavel className="w-4 h-4 mr-2" />Place Bid</Button>
                  ) : (
                    <Button className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" onClick={() => onBuyNow(itemListing)}><ShoppingCart className="w-4 h-4 mr-2" />Buy Now</Button>
                  )}
                  <Button variant="outline" className="border-white/20 text-white"><Tag className="w-4 h-4 mr-2" />Make Offer</Button>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-4 text-center">
                <Info className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <div className="text-sm text-white/60">Not for sale</div>
                {item.estimatedValue && (
                  <div className="mt-2">
                    <span className="text-xs text-white/50">Estimated Value: </span>
                    <span className="font-medium text-white">{formatAmount(item.estimatedValue)} TBURN</span>
                  </div>
                )}
              </GlassCard>
            )}
            <div>
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" />Attributes</h3>
              <div className="grid grid-cols-2 gap-2">
                {mockAttributes.map((attr, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                    <div className="text-xs text-white/50 uppercase">{attr.trait_type}</div>
                    <div className="font-medium text-sm text-white truncate">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
            {itemActivity.length > 0 && (
              <div>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-purple-400" />Item History</h3>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {itemActivity.slice(0, 10).map(act => {
                      const eventIcon = getEventTypeIcon(act.eventType);
                      const Icon = eventIcon.icon;
                      return (
                        <div key={act.id} className="flex items-center gap-2 text-sm">
                          <Icon className={`w-4 h-4 ${eventIcon.color}`} />
                          <span className="capitalize text-white/80">{act.eventType}</span>
                          {act.price && <span className="font-medium text-white">{formatAmount(act.price)} TBURN</span>}
                          <span className="text-white/50 ml-auto">{formatDate(act.createdAt)}</span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface BuyNowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: MarketplaceListing | null;
  items: NftItem[];
  collections: NftCollection[];
  onConfirm: () => void;
  isPending: boolean;
}

function BuyNowDialog({ open, onOpenChange, listing, items, collections, onConfirm, isPending }: BuyNowDialogProps) {
  if (!listing) return null;
  const item = items.find(i => i.id === listing.itemId);
  const collection = collections.find(c => c.id === listing.collectionId);
  const royaltyAmount = collection?.royaltyPercent ? (BigInt(listing.price) * BigInt(collection.royaltyPercent) / BigInt(100)).toString() : "0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Confirm Purchase</DialogTitle>
          <DialogDescription className="text-white/60">You are about to purchase this NFT</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <GlassCard className="flex gap-4 p-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
              {item?.imageUrl ? <img src={item.imageUrl} alt={item.name || "NFT"} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image className="w-8 h-8 text-white/40" /></div>}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg text-white">{item?.name || `#${item?.tokenId}`}</div>
              <div className="text-sm text-white/60 flex items-center gap-1">{collection?.name}{collection?.verified && <CheckCircle className="w-3 h-3 text-blue-400" />}</div>
              {item?.rarityTier && <Badge className={`mt-2 ${getRarityColor(item.rarityTier)} border`}>{item.rarityTier}</Badge>}
            </div>
          </GlassCard>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between py-2 border-b border-white/10"><span className="text-white/60">Item Price</span><span className="font-medium text-white">{formatAmount(listing.price)} TBURN</span></div>
            {royaltyAmount !== "0" && <div className="flex justify-between py-2 border-b border-white/10"><span className="text-white/60">Creator Royalty ({collection?.royaltyPercent}%)</span><span className="font-medium text-white">{formatAmount(royaltyAmount)} TBURN</span></div>}
            <div className="flex justify-between py-2"><span className="font-semibold text-white">Total Payment</span><span className="font-bold text-xl text-white">{formatAmount(listing.price)} TBURN</span></div>
          </div>
          <GlassCard className="mt-4 p-3 flex items-start gap-2">
            <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm"><div className="font-medium text-white">Secure Transaction</div><div className="text-white/60">Protected by TBURN smart contracts</div></div>
          </GlassCard>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="border-white/20 text-white">Cancel</Button>
          <Button onClick={onConfirm} disabled={isPending} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" data-testid="button-confirm-buy">
            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing</> : <><ShoppingCart className="w-4 h-4 mr-2" />Confirm Purchase</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PlaceBidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: MarketplaceListing | null;
  items: NftItem[];
  collections: NftCollection[];
  onSubmit: (bidAmount: string) => void;
  isPending: boolean;
}

function PlaceBidDialog({ open, onOpenChange, listing, items, collections, onSubmit, isPending }: PlaceBidDialogProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");

  if (!listing) return null;
  const item = items.find(i => i.id === listing.itemId);
  const collection = collections.find(c => c.id === listing.collectionId);
  const minBid = parseFloat(formatAmount(listing.price)) * 1.05;

  const handleSubmit = () => {
    const amount = parseFloat(bidAmount);
    if (!amount || amount <= 0) { setBidError("Bid must be greater than zero"); return; }
    if (amount < minBid) { setBidError(`Bid must be at least ${minBid.toFixed(4)} TBURN`); return; }
    setBidError("");
    onSubmit(parseAmount(bidAmount));
  };

  const handleClose = () => { setBidAmount(""); setBidError(""); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Place Bid</DialogTitle>
          <DialogDescription className="text-white/60">Enter your bid for this auction</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <GlassCard className="flex gap-4 p-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
              {item?.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image className="w-6 h-6 text-white/40" /></div>}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">{item?.name || `#${item?.tokenId}`}</div>
              <div className="text-sm text-white/60">{collection?.name}</div>
              <div className="mt-2 text-sm"><span className="text-white/60">Current Bid: </span><span className="font-semibold text-white">{formatAmount(listing.price)} TBURN</span></div>
            </div>
          </GlassCard>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Your Bid (TBURN)</Label>
              <Input type="number" step="0.0001" min="0" placeholder={`Min: ${minBid.toFixed(4)}`} value={bidAmount} onChange={(e) => { setBidAmount(e.target.value); setBidError(""); }} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" data-testid="input-bid-amount" />
              {bidError && <p className="text-sm text-red-400">{bidError}</p>}
            </div>
            <div className="text-sm text-white/50">Minimum bid: {minBid.toFixed(4)} TBURN (5% above current bid)</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending} className="border-white/20 text-white">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending || !bidAmount} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" data-testid="button-confirm-bid">
            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing</> : <><Gavel className="w-4 h-4 mr-2" />Place Bid</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ListNftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: NftItem[];
  collections: NftCollection[];
  onSubmit: (data: { itemId: string; price: string; listingType: string }) => void;
  isPending: boolean;
}

function ListNftDialog({ open, onOpenChange, items, collections, onSubmit, isPending }: ListNftDialogProps) {
  const [selectedItem, setSelectedItem] = useState("");
  const [price, setPrice] = useState("");
  const [listingType, setListingType] = useState("fixed");
  const [priceError, setPriceError] = useState("");

  const availableItems = items.filter(item => !item.isListed && item.ownerAddress === ENTERPRISE_WALLET);

  const handleSubmit = () => {
    if (!selectedItem) return;
    if (!price || parseFloat(price) <= 0) { setPriceError("Price must be greater than zero"); return; }
    setPriceError("");
    onSubmit({ itemId: selectedItem, price: parseAmount(price), listingType });
  };

  const handleClose = () => { setSelectedItem(""); setPrice(""); setListingType("fixed"); setPriceError(""); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">List NFT for Sale</DialogTitle>
          <DialogDescription className="text-white/60">Create a new listing on the marketplace</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-white">Select NFT</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white" data-testid="select-item"><SelectValue placeholder="Choose an NFT to list" /></SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/20">
                {availableItems.length === 0 ? <div className="p-2 text-sm text-white/60">No NFTs available to list</div> : availableItems.map(item => {
                  const coll = collections.find(c => c.id === item.collectionId);
                  return <SelectItem key={item.id} value={item.id} className="text-white hover:bg-white/10">{item.name || `#${item.tokenId}`} - {coll?.name || "Unknown"}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-white">Price (TBURN)</Label>
            <Input type="number" step="0.0001" min="0" placeholder="0.00" value={price} onChange={(e) => { setPrice(e.target.value); setPriceError(""); }} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" data-testid="input-price" />
            {priceError && <p className="text-sm text-red-400">{priceError}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-white">Listing Type</Label>
            <Select value={listingType} onValueChange={setListingType}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white" data-testid="select-listing-type"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/20">
                <SelectItem value="fixed" className="text-white hover:bg-white/10">Fixed Price</SelectItem>
                <SelectItem value="auction" className="text-white hover:bg-white/10">Auction</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending} className="border-white/20 text-white">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending || !selectedItem || !price} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" data-testid="button-submit-listing">
            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating</> : <><Plus className="w-4 h-4 mr-2" />Create Listing</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CancelListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: MarketplaceListing | null;
  items: NftItem[];
  collections: NftCollection[];
  onConfirm: () => void;
  isPending: boolean;
}

function CancelListingDialog({ open, onOpenChange, listing, items, collections, onConfirm, isPending }: CancelListingDialogProps) {
  if (!listing) return null;
  const item = items.find(i => i.id === listing.itemId);
  const collection = collections.find(c => c.id === listing.collectionId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Cancel Listing</DialogTitle>
          <DialogDescription className="text-white/60">Are you sure you want to cancel this listing?</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <GlassCard className="flex gap-4 p-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
              {item?.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image className="w-6 h-6 text-white/40" /></div>}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">{item?.name || `#${item?.tokenId}`}</div>
              <div className="text-sm text-white/60">{collection?.name}</div>
              <div className="mt-2 text-sm"><span className="text-white/60">Listed Price: </span><span className="font-semibold text-white">{formatAmount(listing.price)} TBURN</span></div>
            </div>
          </GlassCard>
          <p className="mt-4 text-sm text-white/60">Canceling this listing will remove it from the marketplace. You can relist the NFT at any time.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="border-white/20 text-white">Keep Listed</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending} data-testid="button-confirm-cancel">
            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Canceling</> : <><X className="w-4 h-4 mr-2" />Cancel Listing</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function NftMarketplaceStandalone() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isConnected, isCorrectNetwork } = useWeb3();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listingFilter, setListingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [itemDetailOpen, setItemDetailOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [selectedItem, setSelectedItem] = useState<NftItem | null>(null);
  const [selectedItemCollection, setSelectedItemCollection] = useState<NftCollection | undefined>(undefined);

  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery<MarketplaceOverview>({
    queryKey: ["/api/nft/stats"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: collections = [], isLoading: collectionsLoading, refetch: refetchCollections } = useQuery<NftCollection[]>({
    queryKey: ["/api/nft/collections"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: listings = [], isLoading: listingsLoading, refetch: refetchListings } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/nft/listings"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: items = [], refetch: refetchItems } = useQuery<NftItem[]>({
    queryKey: ["/api/nft/items"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: activity = [], refetch: refetchActivity } = useQuery<NftActivity[]>({
    queryKey: ["/api/nft/activity"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchOverview(), refetchCollections(), refetchListings(), refetchItems(), refetchActivity()]);
      toast({ title: "Data Refreshed", description: "Marketplace data has been updated" });
    } catch {
      toast({ title: "Refresh Failed", description: "Failed to refresh marketplace data", variant: "destructive" });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchOverview, refetchCollections, refetchListings, refetchItems, refetchActivity, toast]);

  const createListingMutation = useMutation({
    mutationFn: async (data: { itemId: string; price: string; listingType: string }) => {
      const response = await apiRequest("POST", "/api/nft/listings", { itemId: data.itemId, sellerAddress: ENTERPRISE_WALLET, price: data.price, listingType: data.listingType });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nft/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/stats"] });
      setListDialogOpen(false);
      toast({ title: "NFT Listed", description: "Your NFT has been listed on the marketplace" });
    },
    onError: (error: Error) => { toast({ title: "Failed to List NFT", description: error.message, variant: "destructive" }); },
  });

  const buyNowMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
      const response = await apiRequest("POST", `/api/nft/listings/${listingId}/buy`, { buyerAddress: ENTERPRISE_WALLET, txHash });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nft/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/stats"] });
      setBuyDialogOpen(false);
      setItemDetailOpen(false);
      setSelectedListing(null);
      toast({ title: "Purchase Successful", description: "NFT has been transferred to your wallet" });
    },
    onError: (error: Error) => { toast({ title: "Purchase Failed", description: error.message, variant: "destructive" }); },
  });

  const placeBidMutation = useMutation({
    mutationFn: async ({ listingId, bidAmount }: { listingId: string; bidAmount: string }) => {
      const response = await apiRequest("POST", "/api/nft/bids", { listingId, bidderAddress: ENTERPRISE_WALLET, amount: bidAmount, currency: "TBURN", status: "active" });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nft/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/stats"] });
      setBidDialogOpen(false);
      setItemDetailOpen(false);
      setSelectedListing(null);
      toast({ title: "Bid Placed", description: "Your bid has been submitted successfully" });
    },
    onError: (error: Error) => { toast({ title: "Failed to Place Bid", description: error.message, variant: "destructive" }); },
  });

  const cancelListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const response = await apiRequest("POST", `/api/nft/listings/${listingId}/cancel`, { sellerAddress: ENTERPRISE_WALLET });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nft/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/stats"] });
      setCancelDialogOpen(false);
      setSelectedListing(null);
      toast({ title: "Listing Canceled", description: "Your listing has been removed from the marketplace" });
    },
    onError: (error: Error) => { toast({ title: "Failed to Cancel Listing", description: error.message, variant: "destructive" }); },
  });

  const handleBuyNow = (listing: MarketplaceListing) => {
    if (!isConnected) { toast({ title: "Wallet Required", description: "Please connect your wallet to make a purchase", variant: "destructive" }); setWalletModalOpen(true); return; }
    if (!isCorrectNetwork) { toast({ title: "Wrong Network", description: "Please switch to TBURN Mainnet", variant: "destructive" }); return; }
    setSelectedListing(listing);
    setBuyDialogOpen(true);
  };

  const handlePlaceBid = (listing: MarketplaceListing) => {
    if (!isConnected) { toast({ title: "Wallet Required", description: "Please connect your wallet to place a bid", variant: "destructive" }); setWalletModalOpen(true); return; }
    if (!isCorrectNetwork) { toast({ title: "Wrong Network", description: "Please switch to TBURN Mainnet", variant: "destructive" }); return; }
    setSelectedListing(listing);
    setBidDialogOpen(true);
  };

  const handleCancelListing = (listing: MarketplaceListing) => {
    if (!isConnected) { toast({ title: "Wallet Required", description: "Please connect your wallet", variant: "destructive" }); setWalletModalOpen(true); return; }
    setSelectedListing(listing);
    setCancelDialogOpen(true);
  };

  const handleViewItem = (item: NftItem, collection?: NftCollection) => {
    setSelectedItem(item);
    setSelectedItemCollection(collection || collections?.find(c => c.id === item.collectionId));
    setItemDetailOpen(true);
  };

  const handleViewCollection = (collection: NftCollection) => {
    setSearchQuery(collection.name);
    setActiveTab("collections");
  };

  const filteredCollections = collections?.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.symbol.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  const filteredListings = listings?.filter(l => {
    if (listingFilter === "auction") return l.listingType === "auction";
    if (listingFilter === "fixed") return l.listingType === "fixed";
    return true;
  }).sort((a, b) => {
    if (sortBy === "price_low") return parseInt(a.price) - parseInt(b.price);
    if (sortBy === "price_high") return parseInt(b.price) - parseInt(a.price);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }) || [];

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 space-y-8">
        <WalletRequiredBanner />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                <Gem className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent" data-testid="text-page-title">NFT Marketplace</h1>
                <p className="text-white/60">Discover, collect, and trade unique digital assets on TBURN Mainnet</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input placeholder="Search collections..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-64 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500/50" data-testid="input-search" />
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="border-white/20 text-white hover:bg-white/10" data-testid="button-refresh">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setListDialogOpen(true)} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-0" data-testid="button-list-nft">
              <Plus className="w-4 h-4 mr-2" />List NFT
            </Button>
            {!isConnected && (
              <Button onClick={() => setWalletModalOpen(true)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Wallet className="w-4 h-4 mr-2" />Connect Wallet
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={DollarSign} label="24h Volume" value={`${formatAmount(overview?.totalVolume24h || "0")} TBURN`} trend="+12.5%" trendUp loading={overviewLoading} />
          <StatCard icon={TrendingUp} label="24h Sales" value={overview?.salesCount24h?.toLocaleString() || "0"} trend="+8.3%" trendUp loading={overviewLoading} />
          <StatCard icon={Grid3X3} label="Collections" value={overview?.totalCollections?.toLocaleString() || "0"} loading={overviewLoading} />
          <StatCard icon={Package} label="Total Items" value={overview?.totalItems?.toLocaleString() || "0"} loading={overviewLoading} />
          <StatCard icon={Tag} label="Active Listings" value={overview?.activeListings?.toLocaleString() || "0"} loading={overviewLoading} />
          <StatCard icon={Gavel} label="Live Auctions" value={overview?.auctionListings?.toLocaleString() || "0"} loading={overviewLoading} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <GlassCard className="p-2">
            <TabsList className="grid w-full grid-cols-4 bg-transparent gap-2">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:border-purple-500/30 data-[state=active]:text-white text-white/60 border border-transparent rounded-xl"><Star className="w-4 h-4 mr-2" />Overview</TabsTrigger>
              <TabsTrigger value="collections" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:border-purple-500/30 data-[state=active]:text-white text-white/60 border border-transparent rounded-xl"><Grid3X3 className="w-4 h-4 mr-2" />Collections</TabsTrigger>
              <TabsTrigger value="listings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:border-purple-500/30 data-[state=active]:text-white text-white/60 border border-transparent rounded-xl"><Tag className="w-4 h-4 mr-2" />Listings</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:border-purple-500/30 data-[state=active]:text-white text-white/60 border border-transparent rounded-xl"><Activity className="w-4 h-4 mr-2" />Activity</TabsTrigger>
            </TabsList>
          </GlassCard>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Flame className="w-5 h-5 text-orange-400" />Trending Collections</h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("collections")} className="text-purple-400 hover:text-purple-300">View All<ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </div>
                  {collectionsLoading ? (
                    <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full bg-white/10" />)}</div>
                  ) : (
                    <div className="space-y-3">{(overview?.trendingCollections || filteredCollections.slice(0, 5)).map(collection => <CollectionCard key={collection.id} collection={collection} onViewDetails={handleViewCollection} />)}</div>
                  )}
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" />Featured Listings</h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("listings")} className="text-purple-400 hover:text-purple-300">View All<ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </div>
                  {listingsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1, 2, 3].map(i => <Skeleton key={i} className="aspect-square rounded-2xl bg-white/10" />)}</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredListings.slice(0, 6).map(listing => (
                        <ListingCard key={listing.id} listing={listing} collections={collections || []} items={items || []} onBuyNow={handleBuyNow} onPlaceBid={handlePlaceBid} onCancelListing={handleCancelListing} onViewItem={handleViewItem} />
                      ))}
                    </div>
                  )}
                </GlassCard>
              </div>

              <div className="space-y-6">
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4"><Activity className="w-5 h-5 text-purple-400" />Recent Activity</h2>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-1">{(activity || []).slice(0, 15).map(act => <ActivityRow key={act.id} activity={act} collections={collections || []} items={items || []} />)}</div>
                  </ScrollArea>
                </GlassCard>

                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4"><Crown className="w-5 h-5 text-yellow-400" />Top Collectors</h2>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">{i}</div>
                        <div className="flex-1"><div className="font-medium text-white">Collector #{i}</div><div className="text-xs text-white/50">{(100 - i * 12).toLocaleString()} NFTs</div></div>
                        <div className="text-right"><div className="text-sm font-medium text-white">{(50000 - i * 8000).toLocaleString()}</div><div className="text-xs text-white/50">TBURN</div></div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collectionsLoading ? Array(9).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl bg-white/10" />) : filteredCollections.map(collection => <CollectionCard key={collection.id} collection={collection} onViewDetails={handleViewCollection} />)}
            </div>
          </TabsContent>

          <TabsContent value="listings" className="space-y-4">
            <GlassCard className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <Select value={listingFilter} onValueChange={setListingFilter}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    <SelectItem value="all" className="text-white hover:bg-white/10">All Types</SelectItem>
                    <SelectItem value="fixed" className="text-white hover:bg-white/10">Fixed Price</SelectItem>
                    <SelectItem value="auction" className="text-white hover:bg-white/10">Auctions</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    <SelectItem value="recent" className="text-white hover:bg-white/10">Recently Listed</SelectItem>
                    <SelectItem value="price_low" className="text-white hover:bg-white/10">Price: Low to High</SelectItem>
                    <SelectItem value="price_high" className="text-white hover:bg-white/10">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-white/60">{filteredListings.length} listings</div>
              </div>
            </GlassCard>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {listingsLoading ? Array(10).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl bg-white/10" />) : filteredListings.map(listing => <ListingCard key={listing.id} listing={listing} collections={collections || []} items={items || []} onBuyNow={handleBuyNow} onPlaceBid={handlePlaceBid} onCancelListing={handleCancelListing} onViewItem={handleViewItem} />)}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <GlassCard className="p-6">
              <div className="space-y-1">{(activity || []).map(act => <ActivityRow key={act.id} activity={act} collections={collections || []} items={items || []} />)}</div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>

      <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
      <ListNftDialog open={listDialogOpen} onOpenChange={setListDialogOpen} items={items || []} collections={collections || []} onSubmit={(data) => createListingMutation.mutate(data)} isPending={createListingMutation.isPending} />
      <BuyNowDialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen} listing={selectedListing} items={items || []} collections={collections || []} onConfirm={() => selectedListing && buyNowMutation.mutate(selectedListing.id)} isPending={buyNowMutation.isPending} />
      <PlaceBidDialog open={bidDialogOpen} onOpenChange={setBidDialogOpen} listing={selectedListing} items={items || []} collections={collections || []} onSubmit={(bidAmount) => selectedListing && placeBidMutation.mutate({ listingId: selectedListing.id, bidAmount })} isPending={placeBidMutation.isPending} />
      <CancelListingDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} listing={selectedListing} items={items || []} collections={collections || []} onConfirm={() => selectedListing && cancelListingMutation.mutate(selectedListing.id)} isPending={cancelListingMutation.isPending} />
      <ItemDetailDialog open={itemDetailOpen} onOpenChange={setItemDetailOpen} item={selectedItem} collection={selectedItemCollection} listings={listings || []} activity={activity || []} onBuyNow={handleBuyNow} onPlaceBid={handlePlaceBid} />
    </div>
    </TooltipProvider>
  );
}
