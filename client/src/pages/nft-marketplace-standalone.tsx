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
import { Checkbox } from "@/components/ui/checkbox";
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
  ArrowRight,
  Flame,
  Tag,
  Layers,
  ChevronRight,
  Info,
  Shield,
  Wallet,
  Zap,
  Crown,
  Gem,
  Store,
  PaintBucket,
  User,
  Sun,
  Moon,
  Globe,
  Home,
  HelpCircle,
  ScanLine,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WalletRequiredBanner } from "@/components/require-wallet";
import { useWeb3 } from "@/lib/web3-context";
import { WalletConnectModal } from "@/components/wallet-connect-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";

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
    // Calculate divisor manually to avoid ES2016 target requirement
    let divisor = BigInt(1);
    for (let i = 0; i < decimals; i++) divisor *= BigInt(10);
    const integerPart = value / divisor;
    const remainder = value % divisor;
    const decimalStr = remainder.toString().padStart(decimals, '0').slice(0, 2);
    if (integerPart >= BigInt(1000000)) {
      return `${(Number(integerPart) / 1000000).toFixed(1)}M`;
    }
    if (integerPart >= BigInt(1000)) {
      return `${(Number(integerPart) / 1000).toFixed(1)}K`;
    }
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
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch {
    return dateStr;
  }
}

function getRarityColor(tier: string | null): string {
  const colors: Record<string, string> = {
    common: "bg-gray-500 text-white",
    uncommon: "bg-green-500 text-white",
    rare: "bg-blue-500 text-white",
    epic: "bg-violet-500 text-white",
    legendary: "bg-amber-500 text-black",
    mythic: "bg-pink-500 text-white",
  };
  return colors[tier?.toLowerCase() || "common"] || colors.common;
}

function getEventTypeIcon(type: string) {
  const icons: Record<string, { icon: typeof Activity; color: string }> = {
    mint: { icon: Sparkles, color: "text-green-400" },
    list: { icon: Tag, color: "text-blue-400" },
    delist: { icon: X, color: "text-gray-400" },
    sale: { icon: ShoppingCart, color: "text-emerald-400" },
    bid: { icon: Gavel, color: "text-violet-400" },
    offer: { icon: DollarSign, color: "text-orange-400" },
    transfer: { icon: ArrowUpRight, color: "text-cyan-400" },
    burn: { icon: Flame, color: "text-red-400" },
  };
  return icons[type] || { icon: Activity, color: "text-gray-400" };
}

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { theme } = useTheme();
  return (
    <div className={`backdrop-blur-xl rounded-xl transition-all ${theme === 'dark' ? 'bg-[#151E32]/70 border border-white/5' : 'bg-white/90 border border-gray-200 shadow-sm'} ${className}`}>
      {children}
    </div>
  );
}

interface NftCardProps {
  listing: MarketplaceListing;
  item: NftItem | undefined;
  collection: NftCollection | undefined;
  onBuyNow: (listing: MarketplaceListing) => void;
  onViewItem: (item: NftItem, collection: NftCollection | undefined) => void;
}

function NftCard({ listing, item, collection, onBuyNow, onViewItem }: NftCardProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isLegendary = item?.rarityTier?.toLowerCase() === 'legendary' || item?.rarityTier?.toLowerCase() === 'mythic';
  
  return (
    <div 
      className={`group cursor-pointer rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 ${theme === 'dark' ? 'border border-gray-700 bg-[#151E32]' : 'border border-gray-200 bg-white shadow-sm'}`}
      onClick={() => item && onViewItem(item, collection)}
      data-testid={`card-nft-${listing.id}`}
    >
      <div className="h-64 overflow-hidden relative">
        {item?.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name || "NFT"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/50 to-fuchsia-900/50">
            <Image className="w-16 h-16 text-gray-600" />
          </div>
        )}
        {isLegendary && (
          <span className="absolute top-3 left-3 bg-amber-500 text-black text-xs font-extrabold px-2 py-1 rounded shadow-lg">
            {t('nftMarketplacePage.rarity.legendary')}
          </span>
        )}
        {item?.rarityTier && !isLegendary && (
          <span className={`absolute top-3 left-3 ${getRarityColor(item.rarityTier)} text-xs font-bold px-2 py-1 rounded shadow-lg uppercase`}>
            {t(`nftMarketplacePage.rarity.${item.rarityTier.toLowerCase()}`)}
          </span>
        )}
        {listing.listingType === "auction" && (
          <span className="absolute top-3 right-3 bg-violet-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            <Gavel className="w-3 h-3" />{t('nftMarketplacePage.filters.auction')}
          </span>
        )}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all">
          <button 
            className="flex-1 bg-white text-black font-bold py-2 rounded-lg shadow-lg hover:bg-gray-100 transition-all"
            onClick={(e) => { e.stopPropagation(); onBuyNow(listing); }}
            data-testid={`button-buy-${listing.id}`}
          >
            {listing.listingType === "auction" ? t('nftMarketplacePage.card.placeBid') : t('nftMarketplacePage.card.buyNow')}
          </button>
          <button 
            className="px-3 bg-gray-800/90 text-white font-bold py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-all flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); item && onViewItem(item, collection); }}
            data-testid={`button-view-${listing.id}`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold text-lg truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item?.name || `#${item?.tokenId}`}</h4>
            <div className={`flex items-center gap-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="truncate">{collection?.name || "Unknown Collection"}</span>
              {collection?.verified && <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />}
            </div>
          </div>
        </div>
        <div className={`flex justify-between items-end mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div>
            <p className={`text-[10px] uppercase font-bold tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('nftMarketplacePage.card.price')}</p>
            <p className={`text-lg font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatAmount(listing.price)} TB</p>
          </div>
          <div className="text-right">
            <p className={`text-[10px] uppercase font-bold tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('nftMarketplacePage.card.listed')}</p>
            <p className={`text-sm font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(listing.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ItemDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: NftItem | null;
  collection: NftCollection | undefined;
  listings: MarketplaceListing[];
  activity: NftActivity[];
  onBuyNow: (listing: MarketplaceListing) => void;
  onPlaceBid: (listing: MarketplaceListing) => void;
}

function ItemDetailDialog({ open, onOpenChange, item, collection, listings, activity, onBuyNow, onPlaceBid }: ItemDetailDialogProps) {
  const { t } = useTranslation();
  if (!item) return null;
  
  const itemListing = listings.find(l => l.itemId === item.id);
  const itemActivity = activity.filter(a => a.itemId === item.id);
  const mockAttributes = item.attributes || [
    { trait_type: "Background", value: "Cosmic" },
    { trait_type: "Eyes", value: "Laser" },
    { trait_type: "Skin", value: "Gold" },
    { trait_type: "Accessory", value: "Crown" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#0B1120] border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">{item.name || `Token #${item.tokenId}`}</DialogTitle>
          <DialogDescription className="text-gray-400 flex items-center gap-2">
            {collection?.name}
            {collection?.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#151E32] border border-gray-700">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name || "NFT"} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-20 h-20 text-gray-600" />
                </div>
              )}
            </div>
            {item.description && (
              <GlassPanel className="p-4">
                <h3 className="font-semibold text-white mb-2">Description</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
              </GlassPanel>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              {item.rarityTier && (
                <span className={`${getRarityColor(item.rarityTier)} text-xs font-bold px-3 py-1 rounded uppercase`}>
                  {t(`nftMarketplacePage.rarity.${item.rarityTier.toLowerCase()}`)}
                </span>
              )}
              {item.rarityScore && (
                <span className="bg-violet-500/20 text-violet-400 border border-violet-500/30 text-xs px-3 py-1 rounded">
                  Rarity Score: {item.rarityScore}
                </span>
              )}
            </div>
            
            {itemListing ? (
              <GlassPanel className="p-4 border-l-4 border-violet-500">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Current Price</p>
                    <p className="text-3xl font-mono font-bold text-white">{formatAmount(itemListing.price)} TB</p>
                  </div>
                  {itemListing.listingType === "auction" && (
                    <span className="bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded flex items-center gap-1">
                      <Gavel className="w-3 h-3" />Auction
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {itemListing.listingType === "auction" ? (
                    <Button className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 border-0" onClick={() => onPlaceBid(itemListing)}>
                      <Gavel className="w-4 h-4 mr-2" />Place Bid
                    </Button>
                  ) : (
                    <Button className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 border-0" onClick={() => onBuyNow(itemListing)}>
                      <ShoppingCart className="w-4 h-4 mr-2" />Buy Now
                    </Button>
                  )}
                  <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                    <Tag className="w-4 h-4 mr-2" />Make Offer
                  </Button>
                </div>
              </GlassPanel>
            ) : (
              <GlassPanel className="p-4 text-center">
                <Info className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Not for sale</p>
                {item.estimatedValue && (
                  <p className="mt-2 text-sm">
                    <span className="text-gray-500">Est. Value: </span>
                    <span className="font-bold text-white">{formatAmount(item.estimatedValue)} TB</span>
                  </p>
                )}
              </GlassPanel>
            )}
            
            <GlassPanel className="p-4">
              <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />Attributes
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {mockAttributes.map((attr, idx) => (
                  <div key={idx} className="bg-[#0B1120] rounded-lg p-3 text-center border border-gray-700">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{attr.trait_type}</p>
                    <p className="font-medium text-sm text-white truncate">{attr.value}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
            
            {itemActivity.length > 0 && (
              <GlassPanel className="p-4">
                <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-400" />Item History
                </h3>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {itemActivity.slice(0, 10).map(act => {
                      const eventIcon = getEventTypeIcon(act.eventType);
                      const Icon = eventIcon.icon;
                      return (
                        <div key={act.id} className="flex items-center gap-2 text-sm py-1">
                          <Icon className={`w-4 h-4 ${eventIcon.color}`} />
                          <span className="capitalize text-gray-300">{act.eventType}</span>
                          {act.price && <span className="font-mono font-bold text-white">{formatAmount(act.price)} TB</span>}
                          <span className="text-gray-500 ml-auto text-xs">{formatDate(act.createdAt)}</span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </GlassPanel>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151E32] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Confirm Purchase</DialogTitle>
          <DialogDescription className="text-gray-400">You are about to purchase this NFT</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex gap-4 p-4 bg-[#0B1120] rounded-xl border border-gray-700">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
              {item?.imageUrl ? <img src={item.imageUrl} alt={item.name || "NFT"} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image className="w-8 h-8 text-gray-600" /></div>}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg text-white">{item?.name || `#${item?.tokenId}`}</p>
              <p className="text-sm text-gray-400 flex items-center gap-1">{collection?.name}{collection?.verified && <CheckCircle className="w-3 h-3 text-blue-500" />}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Item Price</span>
              <span className="font-mono font-bold text-white">{formatAmount(listing.price)} TB</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold text-white">Total</span>
              <span className="font-mono font-bold text-xl text-white">{formatAmount(listing.price)} TB</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-900/30 flex items-start gap-2">
            <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-white">Secure Transaction</p>
              <p className="text-gray-400">Protected by TBURN smart contracts</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="border-gray-600 text-white hover:bg-gray-800">Cancel</Button>
          <Button onClick={onConfirm} disabled={isPending} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 border-0" data-testid="button-confirm-buy">
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
    if (amount < minBid) { setBidError(`Bid must be at least ${minBid.toFixed(2)} TB`); return; }
    setBidError("");
    onSubmit(parseAmount(bidAmount));
  };

  const handleClose = () => { setBidAmount(""); setBidError(""); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#151E32] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Place Bid</DialogTitle>
          <DialogDescription className="text-gray-400">Enter your bid amount</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex gap-4 p-4 bg-[#0B1120] rounded-xl border border-gray-700 mb-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
              {item?.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image className="w-6 h-6 text-gray-600" /></div>}
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{item?.name || `#${item?.tokenId}`}</p>
              <p className="text-sm text-gray-400">{collection?.name}</p>
              <p className="text-sm mt-1"><span className="text-gray-500">Min Bid: </span><span className="font-mono font-bold text-violet-400">{minBid.toFixed(2)} TB</span></p>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Your Bid (TB)</Label>
            <Input 
              type="number" 
              placeholder={`Min ${minBid.toFixed(2)}`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="bg-[#0B1120] border-gray-700 text-white focus:ring-violet-500 focus:border-violet-500"
            />
            {bidError && <p className="text-red-400 text-sm">{bidError}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending} className="border-gray-600 text-white hover:bg-gray-800">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 border-0" data-testid="button-confirm-bid">
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
  onSubmit: (data: { itemId: string; collectionId: string; price: string; listingType: string }) => void;
  isPending: boolean;
}

function ListNftDialog({ open, onOpenChange, items, collections, onSubmit, isPending }: ListNftDialogProps) {
  const [selectedItem, setSelectedItem] = useState("");
  const [price, setPrice] = useState("");
  const [listingType, setListingType] = useState("fixed");

  const ownedItems = items.filter(i => !i.isListed);
  const selectedItemData = items.find(i => i.id === selectedItem);
  const selectedCollection = collections.find(c => c.id === selectedItemData?.collectionId);

  const handleSubmit = () => {
    if (!selectedItem || !price) return;
    onSubmit({
      itemId: selectedItem,
      collectionId: selectedItemData?.collectionId || "",
      price: parseAmount(price),
      listingType
    });
  };

  const handleClose = () => {
    setSelectedItem("");
    setPrice("");
    setListingType("fixed");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#151E32] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Create New Listing</DialogTitle>
          <DialogDescription className="text-gray-400">List your NFT for sale</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-violet-500 transition-colors">
            {selectedItemData?.imageUrl ? (
              <img src={selectedItemData.imageUrl} alt="" className="w-24 h-24 object-cover rounded-lg mx-auto mb-2" />
            ) : (
              <Image className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            )}
            <p className="text-gray-400 text-sm">Select an NFT to list</p>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Select NFT</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger className="bg-[#0B1120] border-gray-700 text-white">
                <SelectValue placeholder="Choose an NFT" />
              </SelectTrigger>
              <SelectContent className="bg-[#0B1120] border-gray-700">
                {ownedItems.map(item => (
                  <SelectItem key={item.id} value={item.id} className="text-white hover:bg-gray-800">
                    {item.name || `Token #${item.tokenId}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Price (TB)</Label>
            <Input 
              type="number" 
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-[#0B1120] border-gray-700 text-white focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Listing Type</Label>
            <Select value={listingType} onValueChange={setListingType}>
              <SelectTrigger className="bg-[#0B1120] border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0B1120] border-gray-700">
                <SelectItem value="fixed" className="text-white hover:bg-gray-800">Fixed Price</SelectItem>
                <SelectItem value="auction" className="text-white hover:bg-gray-800">Auction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Minting Fee (Gas)</span>
              <span className="font-mono font-bold text-green-400">$0.001</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending} className="border-gray-600 text-white hover:bg-gray-800">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending || !selectedItem || !price} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 border-0 shadow-lg shadow-violet-500/30" data-testid="button-confirm-list">
            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating</> : "List Item"}
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
      <DialogContent className="bg-[#151E32] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Cancel Listing</DialogTitle>
          <DialogDescription className="text-gray-400">Remove this NFT from the marketplace</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex gap-4 p-4 bg-[#0B1120] rounded-xl border border-gray-700">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
              {item?.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image className="w-6 h-6 text-gray-600" /></div>}
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{item?.name || `#${item?.tokenId}`}</p>
              <p className="text-sm text-gray-400">{collection?.name}</p>
              <p className="mt-2 text-sm"><span className="text-gray-500">Listed Price: </span><span className="font-mono font-bold text-white">{formatAmount(listing.price)} TB</span></p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-400">Canceling this listing will remove it from the marketplace. You can relist the NFT at any time.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="border-gray-600 text-white hover:bg-gray-800">Keep Listed</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending} data-testid="button-confirm-cancel">
            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Canceling</> : <><X className="w-4 h-4 mr-2" />Cancel Listing</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function NftMarketplaceStandalone() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { theme } = useTheme();
  const { isConnected, isCorrectNetwork, address: walletAddress } = useWeb3();
  const [searchQuery, setSearchQuery] = useState("");
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSidebarSection, setActiveSidebarSection] = useState("marketplace");
  const [listingFilter, setListingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showBuyNow, setShowBuyNow] = useState(true);
  const [showAuction, setShowAuction] = useState(false);
  
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [itemDetailOpen, setItemDetailOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [selectedItem, setSelectedItem] = useState<NftItem | null>(null);
  const [selectedItemCollection, setSelectedItemCollection] = useState<NftCollection | undefined>(undefined);

  const { data: overview, isLoading: overviewLoading } = useQuery<MarketplaceOverview>({
    queryKey: ["/api/nft/stats"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: collections = [], isLoading: collectionsLoading } = useQuery<NftCollection[]>({
    queryKey: ["/api/nft/collections"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/nft/listings"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: items = [] } = useQuery<NftItem[]>({
    queryKey: ["/api/nft/items"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const { data: activity = [] } = useQuery<NftActivity[]>({
    queryKey: ["/api/nft/activity"],
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    retry: 3,
    placeholderData: keepPreviousData,
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: { itemId: string; collectionId: string; price: string; listingType: string }) => {
      return apiRequest("POST", "/api/nft/listings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nft/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/items"] });
      setListDialogOpen(false);
      toast({ title: "Success", description: "NFT listed successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to list NFT", variant: "destructive" })
  });

  const buyNowMutation = useMutation({
    mutationFn: async (listingId: string) => {
      return apiRequest("POST", `/api/nft/listings/${listingId}/buy`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nft/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/activity"] });
      setBuyDialogOpen(false);
      toast({ title: "Success", description: "NFT purchased successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to purchase NFT", variant: "destructive" })
  });

  const placeBidMutation = useMutation({
    mutationFn: async ({ listingId, bidAmount }: { listingId: string; bidAmount: string }) => {
      return apiRequest("POST", `/api/nft/listings/${listingId}/bid`, { bidAmount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nft/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/activity"] });
      setBidDialogOpen(false);
      toast({ title: "Success", description: "Bid placed successfully" });
    },
    onError: () => toast({ title: "Error", description: "Failed to place bid", variant: "destructive" })
  });

  const cancelListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      return apiRequest("DELETE", `/api/nft/listings/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nft/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/items"] });
      setCancelDialogOpen(false);
      toast({ title: "Success", description: "Listing cancelled" });
    },
    onError: () => toast({ title: "Error", description: "Failed to cancel listing", variant: "destructive" })
  });

  const handleBuyNow = (listing: MarketplaceListing) => {
    if (!isConnected) { toast({ title: "Wallet Required", description: "Please connect your wallet", variant: "destructive" }); setWalletModalOpen(true); return; }
    setSelectedListing(listing);
    setBuyDialogOpen(true);
  };

  const handlePlaceBid = (listing: MarketplaceListing) => {
    if (!isConnected) { toast({ title: "Wallet Required", description: "Please connect your wallet", variant: "destructive" }); setWalletModalOpen(true); return; }
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

  const filteredListings = listings?.filter(l => {
    if (showBuyNow && !showAuction) return l.listingType === "fixed";
    if (!showBuyNow && showAuction) return l.listingType === "auction";
    return true;
  }).filter(l => {
    if (categoryFilter === "all") return true;
    const collection = collections.find(c => c.id === l.collectionId);
    return collection?.category?.toLowerCase() === categoryFilter;
  }).sort((a, b) => {
    if (sortBy === "price_low") return parseInt(a.price) - parseInt(b.price);
    if (sortBy === "price_high") return parseInt(b.price) - parseInt(a.price);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }) || [];

  const liveSales = activity?.filter(a => a.eventType === 'sale').slice(0, 10) || [];

  return (
    <TooltipProvider>
    <div className={`flex h-screen overflow-hidden font-sans antialiased transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0B1120] text-[#E2E8F0]' : 'bg-gray-50 text-gray-900'}`}>
      
      <aside className={`w-20 lg:w-64 flex flex-col z-20 transition-all duration-300 border-r ${theme === 'dark' ? 'bg-[#0F172A] border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className={`h-16 flex items-center justify-center lg:justify-between lg:px-6 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">N</div>
            <div className="hidden lg:block ml-3">
              <h1 className={`font-bold text-lg tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>TBURN <span className="text-violet-500">NFT</span></h1>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 py-6 space-y-2 px-3">
          <button 
            onClick={() => { setActiveSidebarSection("marketplace"); setActiveTab("overview"); }}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${activeSidebarSection === "marketplace" 
              ? theme === 'dark' ? "bg-[#151E32] text-white border-l-4 border-violet-500 shadow-sm" : "bg-violet-50 text-violet-700 border-l-4 border-violet-500 shadow-sm"
              : theme === 'dark' ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}
            data-testid="link-marketplace"
          >
            <Store className="w-5 h-5" /> <span className="hidden lg:block font-medium">{t('nftMarketplacePage.sidebar.marketplace')}</span>
          </button>
          <button 
            onClick={() => { setActiveSidebarSection("stats"); setActiveTab("overview"); }}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${activeSidebarSection === "stats" 
              ? theme === 'dark' ? "bg-[#151E32] text-white border-l-4 border-violet-500 shadow-sm" : "bg-violet-50 text-violet-700 border-l-4 border-violet-500 shadow-sm"
              : theme === 'dark' ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}
            data-testid="link-stats"
          >
            <BarChart3 className="w-5 h-5" /> <span className="hidden lg:block font-medium">{t('nftMarketplacePage.sidebar.statsRankings')}</span>
          </button>
          <button 
            onClick={() => setListDialogOpen(true)}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${theme === 'dark' ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}
            data-testid="link-create"
          >
            <PaintBucket className="w-5 h-5" /> <span className="hidden lg:block font-medium">{t('nftMarketplacePage.sidebar.create')}</span>
          </button>
          <button 
            onClick={() => { 
              if (!isConnected) {
                setWalletModalOpen(true);
                toast({ title: t('nftMarketplacePage.walletRequired.title'), description: t('nftMarketplacePage.walletRequired.description'), variant: "default" });
              } else {
                setActiveSidebarSection("mycollection"); 
                setActiveTab("overview");
              }
            }}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${activeSidebarSection === "mycollection" 
              ? theme === 'dark' ? "bg-[#151E32] text-white border-l-4 border-violet-500 shadow-sm" : "bg-violet-50 text-violet-700 border-l-4 border-violet-500 shadow-sm"
              : theme === 'dark' ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}
            data-testid="link-collection"
          >
            <User className="w-5 h-5" /> <span className="hidden lg:block font-medium">{t('nftMarketplacePage.sidebar.myCollection')}</span>
          </button>
        </nav>
      </aside>

      <main className={`flex-1 flex flex-col relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0B1120]' : 'bg-gray-50'}`}>
        
        <header className={`h-16 border-b backdrop-blur-md flex items-center justify-between px-8 z-10 ${theme === 'dark' ? 'border-gray-800 bg-[#0B1120]/80' : 'border-gray-200 bg-white/80'}`}>
          <div className="relative w-96 hidden md:block">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <Input 
              type="text" 
              placeholder={t('nftMarketplacePage.header.searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-full pl-12 pr-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 ${theme === 'dark' ? 'bg-[#151E32] border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400'}`}
              data-testid="input-search"
            />
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Navigation Icons */}
            <a href="/" data-testid="link-home">
              <Button variant="ghost" size="icon" className={`h-9 w-9 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                <Home className="w-4 h-4" />
              </Button>
            </a>
            <a href="/qna" data-testid="link-qna">
              <Button variant="ghost" size="icon" className={`h-9 w-9 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                <HelpCircle className="w-4 h-4" />
              </Button>
            </a>
            <a href="/scan" data-testid="link-scan">
              <Button variant="ghost" size="icon" className={`h-9 w-9 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                <ScanLine className="w-4 h-4" />
              </Button>
            </a>
            <a href="/user" data-testid="link-user">
              <Button variant="ghost" size="icon" className={`h-9 w-9 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                <User className="w-4 h-4" />
              </Button>
            </a>
            {/* Language Selector - Globe icon only */}
            <Select value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
              <SelectTrigger className={`w-10 h-10 p-0 rounded-full border-0 justify-center ${theme === 'dark' ? 'bg-transparent hover:bg-gray-800 text-white' : 'bg-transparent hover:bg-gray-100 text-gray-700'}`} data-testid="select-language">
                <Globe className="w-5 h-5" />
              </SelectTrigger>
              <SelectContent className={`min-w-[160px] ${theme === 'dark' ? 'bg-[#151E32] border-gray-700' : 'bg-white border-gray-200'}`}>
                <SelectItem value="en" className={`${theme === 'dark' ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>English</SelectItem>
                <SelectItem value="ko" className={`${theme === 'dark' ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>한국어</SelectItem>
                <SelectItem value="ja" className={`${theme === 'dark' ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>日本語</SelectItem>
                <SelectItem value="zh" className={`${theme === 'dark' ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>中文</SelectItem>
                <SelectItem value="es" className={`${theme === 'dark' ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>Español</SelectItem>
                <SelectItem value="fr" className={`${theme === 'dark' ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>Français</SelectItem>
                <SelectItem value="ru" className={`${theme === 'dark' ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>Русский</SelectItem>
                <SelectItem value="pt" className={`${theme === 'dark' ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>Português</SelectItem>
                <SelectItem value="ar" className={`${theme === 'dark' ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>العربية</SelectItem>
                <SelectItem value="hi" className={`${theme === 'dark' ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>हिन्दी</SelectItem>
                <SelectItem value="bn" className={`${theme === 'dark' ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>বাংলা</SelectItem>
                <SelectItem value="ur" className={`${theme === 'dark' ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>اردو</SelectItem>
              </SelectContent>
            </Select>
            {!isConnected && (
              <Button 
                onClick={() => setWalletModalOpen(true)} 
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-violet-500/30 border-0"
                data-testid="button-connect-wallet"
              >
                <Wallet className="w-4 h-4 mr-2" />{t('nftMarketplacePage.header.connect')}
              </Button>
            )}
            <ThemeToggle />
            <div className={`w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-violet-500 transition-colors ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="h-8 bg-violet-500 text-white text-xs font-bold overflow-hidden flex items-center relative z-10">
          <div className="absolute left-0 bg-violet-500 px-3 z-10 flex items-center gap-1">
            <Flame className="w-3 h-3" /> {t('nftMarketplacePage.liveSales')}:
          </div>
          <div className="animate-marquee whitespace-nowrap flex gap-8 pl-32" style={{ animation: 'marquee 25s linear infinite' }}>
            {liveSales.length > 0 ? liveSales.map((sale, idx) => {
              const saleItem = items.find(i => i.id === sale.itemId);
              return (
                <span key={idx}>{saleItem?.name || `NFT #${idx}`} {t('nftMarketplacePage.soldFor')} {formatAmount(sale.price || "0")} TB</span>
              );
            }) : (
              <>
                <span>CyberPunk #882 sold for 1,200 TB</span>
                <span>SpaceDog #12 sold for 450 TB</span>
                <span>Land Plot (0,0) sold for 50,000 TB</span>
                <span>Epic Sword sold for 55 TB</span>
                <span>Mutant Ape TB #1 sold for 3,500 TB</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth z-0">
          
          {/* Stats & Rankings Section */}
          {activeSidebarSection === "stats" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white">{t('nftMarketplacePage.statsRankings.title')}</h1>
                  <p className="text-gray-400 mt-1">{t('nftMarketplacePage.statsRankings.subtitle')}</p>
                </div>
                <Select defaultValue="24h">
                  <SelectTrigger className="w-32 bg-[#151E32] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151E32] border-gray-700">
                    <SelectItem value="24h" className="text-white hover:bg-gray-800">24시간</SelectItem>
                    <SelectItem value="7d" className="text-white hover:bg-gray-800">7일</SelectItem>
                    <SelectItem value="30d" className="text-white hover:bg-gray-800">30일</SelectItem>
                    <SelectItem value="all" className="text-white hover:bg-gray-800">전체</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Top Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassPanel className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('nftMarketplacePage.stats.totalVolumeStat')}</p>
                      <p className="font-bold font-mono text-xl text-white">{formatAmount((overview as any)?.totalVolume || overview?.totalVolume24h || "0")} TB</p>
                      <p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" />+12.5%</p>
                    </div>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('nftMarketplacePage.stats.volume24hStat')}</p>
                      <p className="font-bold font-mono text-xl text-white">{formatAmount(overview?.totalVolume24h || "0")} TB</p>
                      <p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" />+8.2%</p>
                    </div>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('nftMarketplacePage.stats.sales24h')}</p>
                      <p className="font-bold font-mono text-xl text-white">{(overview as any)?.totalSales24h?.toLocaleString() || activity?.filter(a => a.eventType === 'sale').length || 0}</p>
                      <p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" />+5.1%</p>
                    </div>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('nftMarketplacePage.stats.activeListings')}</p>
                      <p className="font-bold font-mono text-xl text-white">{listings?.length?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-400">{t('nftMarketplacePage.stats.totalCollections')}</p>
                    </div>
                  </div>
                </GlassPanel>
              </div>

              {/* Collection Rankings Table */}
              <GlassPanel className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    {t('nftMarketplacePage.stats.collectionRankings')}
                  </h2>
                  <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">Top {collections?.length || 0}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-gray-400 font-bold uppercase tracking-wider border-b border-gray-700">
                    <div className="col-span-1">{t('nftMarketplacePage.collectionsTable.rank')}</div>
                    <div className="col-span-4">{t('nftMarketplacePage.collectionsTable.collection')}</div>
                    <div className="col-span-2 text-right">{t('nftMarketplacePage.collectionsTable.floorPrice')}</div>
                    <div className="col-span-2 text-right">{t('nftMarketplacePage.collectionsTable.volume24h')}</div>
                    <div className="col-span-2 text-right">{t('nftMarketplacePage.collectionsTable.totalVolume')}</div>
                    <div className="col-span-1 text-right">{t('nftMarketplacePage.collectionsTable.items')}</div>
                  </div>
                  {collectionsLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="grid grid-cols-12 gap-4 px-4 py-3 items-center">
                        <Skeleton className="col-span-1 h-6 bg-gray-700" />
                        <div className="col-span-4 flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-lg bg-gray-700" />
                          <Skeleton className="h-5 w-24 bg-gray-700" />
                        </div>
                        <Skeleton className="col-span-2 h-5 bg-gray-700" />
                        <Skeleton className="col-span-2 h-5 bg-gray-700" />
                        <Skeleton className="col-span-2 h-5 bg-gray-700" />
                        <Skeleton className="col-span-1 h-5 bg-gray-700" />
                      </div>
                    ))
                  ) : (
                    [...(collections || [])].sort((a, b) => parseInt(b.volumeTotal || "0") - parseInt(a.volumeTotal || "0")).map((collection, idx) => (
                      <div key={collection.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer" data-testid={`ranking-row-${idx}`}>
                        <div className="col-span-1">
                          <span className={`font-bold ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-gray-400'}`}>
                            {idx + 1}
                          </span>
                        </div>
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                            <img src={collection.imageUrl || `https://picsum.photos/seed/${collection.id}/100/100`} alt={collection.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-white truncate">{collection.name}</span>
                              {collection.verified && <CheckCircle className="w-4 h-4 text-violet-400 shrink-0" />}
                            </div>
                            <span className="text-xs text-gray-400">{collection.owners?.toLocaleString() || 0} {t('nftMarketplacePage.collectionsTable.owners')}</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-right font-mono text-white">{formatAmount(collection.floorPrice)} TB</div>
                        <div className="col-span-2 text-right font-mono text-white">{formatAmount(collection.volume24h)} TB</div>
                        <div className="col-span-2 text-right font-mono text-white">{formatAmount(collection.volumeTotal)} TB</div>
                        <div className="col-span-1 text-right text-gray-400">{collection.totalItems?.toLocaleString() || 0}</div>
                      </div>
                    ))
                  )}
                </div>
              </GlassPanel>

              {/* Top Sellers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassPanel className="p-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-blue-400" />
                    Top Sellers
                  </h2>
                  <div className="space-y-3">
                    {[
                      { name: "CryptoArtist", address: "tb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", sales: "125,000", count: 342 },
                      { name: "PixelMaster", address: "tb1p4qhjn9z5t4yx6n0p8t8d3m9q7w5r2e1y6u0i3o", sales: "98,500", count: 256 },
                      { name: "NFTKing", address: "tb1z0x9c8v7b6n5m4l3k2j1h0g9f8e7d6c5b4a3s2d", sales: "76,200", count: 189 },
                      { name: "DigitalDreamer", address: "tb1q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9z", sales: "54,800", count: 134 },
                      { name: "ArtCollector", address: "tb1m9n8b7v6c5x4z3a2s1d0f9g8h7j6k5l4p3o2i1u", sales: "42,100", count: 98 },
                    ].map((seller, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
                        <span className={`w-6 font-bold ${idx === 0 ? 'text-amber-400' : 'text-gray-400'}`}>{idx + 1}</span>
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seller.name}`} alt={seller.name} className="w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white">{seller.name}</p>
                          <p className="text-xs text-gray-400 truncate">{seller.address}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-white">{seller.sales} TB</p>
                          <p className="text-xs text-gray-400">{seller.count} sales</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassPanel>

                <GlassPanel className="p-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                    <Flame className="w-5 h-5 text-orange-400" />
                    Trending Now
                  </h2>
                  <div className="space-y-3">
                    {(items || []).slice(0, 5).map((item, idx) => {
                      const itemCollection = collections?.find(c => c.id === item.collectionId);
                      const itemListing = listings?.find(l => l.itemId === item.id);
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => handleViewItem(item, itemCollection)}>
                          <span className={`w-6 font-bold ${idx === 0 ? 'text-orange-400' : 'text-gray-400'}`}>{idx + 1}</span>
                          <div className="w-12 h-12 rounded-lg overflow-hidden">
                            <img src={item.imageUrl || `https://picsum.photos/seed/${item.id}/100/100`} alt={item.name || 'NFT'} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{item.name}</p>
                            <p className="text-xs text-gray-400">{itemCollection?.name || 'Unknown'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-white">{formatAmount(itemListing?.price || "0")} TB</p>
                            <p className="text-xs text-emerald-400 flex items-center justify-end gap-1"><TrendingUp className="w-3 h-3" />Hot</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassPanel>
              </div>
            </div>
          )}

          {/* My Collection Section */}
          {activeSidebarSection === "mycollection" && isConnected && (() => {
            const normalizedWallet = walletAddress?.toLowerCase() || '';
            const isLoadingData = !items || items.length === 0;
            
            let userItems = (items || []).filter(item => {
              if (!normalizedWallet || !item.ownerAddress) return false;
              return item.ownerAddress.toLowerCase() === normalizedWallet;
            });
            
            const userListings = listings?.filter(l => l.sellerAddress?.toLowerCase() === normalizedWallet) || [];
            const hasRealOwnershipData = userItems.length > 0 || userListings.length > 0;
            
            if (!hasRealOwnershipData && items && items.length > 0) {
              const seed = normalizedWallet.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
              userItems = items.filter((_, idx) => (seed + idx) % 4 === 0).slice(0, 6);
            }
            
            const userListedItems = userItems.filter(i => i.isListed || userListings.some(l => l.itemId === i.id));
            const userSales = activity?.filter(a => a.eventType === 'sale' && (a.toAddress?.toLowerCase() === normalizedWallet || a.fromAddress?.toLowerCase() === normalizedWallet)) || [];
            const totalValue = userListings.reduce((sum, l) => sum + parseInt(l.price || "0"), 0) || 
                               userItems.reduce((sum, item) => sum + parseInt(item.estimatedValue || "0"), 0);
            
            return (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">{t('nftMarketplacePage.myCollection.title')}</h1>
                    {!hasRealOwnershipData && userItems.length > 0 && (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">{t('nftMarketplacePage.myCollection.demoData')}</Badge>
                    )}
                  </div>
                  <p className="text-gray-400 mt-1">{t('nftMarketplacePage.myCollection.subtitle')}</p>
                  <p className="text-xs text-gray-500 mt-1 font-mono">{walletAddress?.slice(0, 10)}...{walletAddress?.slice(-6)}</p>
                </div>
                <Button onClick={() => setListDialogOpen(true)} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-violet-500/30 border-0">
                  <Plus className="w-4 h-4 mr-2" />{t('nftMarketplacePage.myCollection.listNft')}
                </Button>
              </div>

              {/* My Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassPanel className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                      <Image className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('nftMarketplacePage.myCollection.ownedNfts')}</p>
                      <p className="font-bold font-mono text-xl text-white">{userItems.length}</p>
                    </div>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('nftMarketplacePage.myCollection.listedItems')}</p>
                      <p className="font-bold font-mono text-xl text-white">{userListedItems.length}</p>
                    </div>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('nftMarketplacePage.myCollection.totalValue')}</p>
                      <p className="font-bold font-mono text-xl text-white">{formatAmount(String(totalValue))} TB</p>
                    </div>
                  </div>
                </GlassPanel>
                <GlassPanel className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('nftMarketplacePage.myCollection.salesMade')}</p>
                      <p className="font-bold font-mono text-xl text-white">{userSales.length}</p>
                    </div>
                  </div>
                </GlassPanel>
              </div>

              {/* My NFTs Grid */}
              <GlassPanel className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">{t('nftMarketplacePage.myCollection.myNfts')} ({userItems.length})</h2>
                {userItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Image className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-4">{t('nftMarketplacePage.myCollection.noNftsDesc')}</p>
                    <Button onClick={() => { setActiveSidebarSection("marketplace"); setActiveTab("overview"); }} variant="outline" className="border-violet-500 text-violet-400 hover:bg-violet-500/10">
                      {t('nftMarketplacePage.myCollection.browseMarketplace')}
                    </Button>
                  </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userItems.map(item => {
                    const itemCollection = collections?.find(c => c.id === item.collectionId);
                    const itemListing = listings?.find(l => l.itemId === item.id);
                    return (
                      <div key={item.id} className="rounded-2xl overflow-hidden border border-gray-700 bg-[#151E32] hover:border-violet-500 transition-all duration-300 cursor-pointer" onClick={() => handleViewItem(item, itemCollection)}>
                        <div className="relative h-48 overflow-hidden">
                          <img src={item.imageUrl || `https://picsum.photos/seed/${item.id}/400/400`} alt={item.name || 'NFT'} className="w-full h-full object-cover" />
                          {itemListing && (
                            <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">{t('nftMarketplacePage.myCollection.listed')}</span>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-white truncate">{item.name}</h4>
                          <p className="text-xs text-gray-400">{itemCollection?.name || 'Unknown'}</p>
                          {itemListing && (
                            <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                              <span className="text-xs text-gray-400">{t('nftMarketplacePage.myCollection.price')}</span>
                              <span className="font-mono font-bold text-white">{formatAmount(itemListing.price)} TB</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </GlassPanel>
            </div>
            );
          })()}

          {/* Marketplace Section - Hero and Tabs */}
          {activeSidebarSection === "marketplace" && (
            <>
          <div className="relative rounded-3xl overflow-hidden mb-10 h-[400px] border border-white/5 shadow-2xl">
            <img src="https://images.unsplash.com/photo-1614812513172-567d2fe96a75?q=80&w=2940&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/80 to-transparent"></div>
            
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20">{t('nftMarketplacePage.hero.trustScore')}</span>
                <span className="px-3 py-1 bg-violet-500 text-white rounded-full text-xs font-bold animate-pulse">{t('nftMarketplacePage.hero.liveMinting')}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight" data-testid="text-page-title">
                {t('nftMarketplacePage.hero.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">{t('nftMarketplacePage.hero.titleHighlight')}</span>
              </h1>
              <p className="text-gray-300 mb-8 text-lg">
                {t('nftMarketplacePage.hero.subtitle')}
              </p>
              <div className="flex gap-4">
                <Button className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 border-0" data-testid="button-explore">{t('nftMarketplacePage.hero.exploreBtn')}</Button>
                <Button variant="outline" className="px-8 py-3 bg-white/10 backdrop-blur-md text-white border-white/20 font-bold rounded-xl hover:bg-white/20" onClick={() => setListDialogOpen(true)} data-testid="button-create">{t('nftMarketplacePage.hero.createBtn')}</Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <GlassPanel className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('nftMarketplacePage.stats.volume24h')}</p>
                  <p className="font-bold font-mono text-white">{formatAmount(overview?.totalVolume24h || "0")} TB</p>
                </div>
              </div>
            </GlassPanel>
            <GlassPanel className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Image className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('nftMarketplacePage.stats.totalItems')}</p>
                  <p className="font-bold font-mono text-white">{overview?.totalItems?.toLocaleString() || "0"}</p>
                </div>
              </div>
            </GlassPanel>
            <GlassPanel className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('nftMarketplacePage.stats.collections')}</p>
                  <p className="font-bold font-mono text-white">{overview?.totalCollections || "0"}</p>
                </div>
              </div>
            </GlassPanel>
            <GlassPanel className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{t('nftMarketplacePage.stats.activeSellers')}</p>
                  <p className="font-bold font-mono text-white">{(overview as any)?.activeSellers || overview?.totalCollections || "0"}</p>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* Tabbed Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
              <TabsList className="bg-[#151E32] border border-gray-700 p-1 rounded-xl">
                <TabsTrigger value="overview" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white rounded-lg px-5 py-2 text-sm font-medium" data-testid="tab-overview">{t('nftMarketplacePage.tabs.overview')}</TabsTrigger>
                <TabsTrigger value="collections" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white rounded-lg px-5 py-2 text-sm font-medium" data-testid="tab-collections">{t('nftMarketplacePage.tabs.collections')}</TabsTrigger>
                <TabsTrigger value="listings" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white rounded-lg px-5 py-2 text-sm font-medium" data-testid="tab-listings">{t('nftMarketplacePage.tabs.listings')}</TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white rounded-lg px-5 py-2 text-sm font-medium" data-testid="tab-activity">{t('nftMarketplacePage.tabs.activity')}</TabsTrigger>
              </TabsList>
              {activeTab === "listings" && (
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-[#151E32] border-gray-700 text-white" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151E32] border-gray-700">
                    <SelectItem value="recent" className="text-white hover:bg-gray-800">{t('nftMarketplacePage.filters.recent')}</SelectItem>
                    <SelectItem value="price_low" className="text-white hover:bg-gray-800">{t('nftMarketplacePage.filters.priceLow')}</SelectItem>
                    <SelectItem value="price_high" className="text-white hover:bg-gray-800">{t('nftMarketplacePage.filters.priceHigh')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Filter Sidebar */}
                <div className="w-full lg:w-64 space-y-6 shrink-0">
                  <GlassPanel className="p-5">
                    <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">{t('nftMarketplacePage.filters.status')}</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox checked={showBuyNow} onCheckedChange={(checked) => setShowBuyNow(!!checked)} className="border-gray-600 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500" />
                        <span className="text-sm text-gray-400 group-hover:text-violet-400 transition-colors">{t('nftMarketplacePage.filters.buyNow')}</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox checked={showAuction} onCheckedChange={(checked) => setShowAuction(!!checked)} className="border-gray-600 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500" />
                        <span className="text-sm text-gray-400 group-hover:text-violet-400 transition-colors">{t('nftMarketplacePage.filters.auction')}</span>
                      </label>
                    </div>
                  </GlassPanel>

                  <GlassPanel className="p-5">
                    <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">{t('nftMarketplacePage.filters.category')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {["all", "art", "game", "pfp", "music"].map(cat => (
                        <button 
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${categoryFilter === cat ? 'bg-violet-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                          data-testid={`button-category-${cat}`}
                        >
                          {t(`nftMarketplacePage.filters.${cat}`)}
                        </button>
                      ))}
                    </div>
                  </GlassPanel>

                  <GlassPanel className="p-5 border-l-4 border-violet-500">
                    <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">{t('nftMarketplacePage.filters.creatorTrust')}</h3>
                    <input type="range" min="0" max="100" defaultValue="80" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500" />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>0</span>
                      <span className="text-violet-400 font-bold">Min: 80+</span>
                      <span>100</span>
                    </div>
                  </GlassPanel>
                </div>

                {/* NFT Grid */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                      {filteredListings.length.toLocaleString()} {t('nftMarketplacePage.stats.items')} <span className="text-gray-400 text-sm font-normal">{t('nftMarketplacePage.filters.found')}</span>
                    </h2>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48 bg-[#151E32] border-gray-700 text-white" data-testid="select-sort-overview">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#151E32] border-gray-700">
                        <SelectItem value="recent" className="text-white hover:bg-gray-800">Recently Listed</SelectItem>
                        <SelectItem value="price_low" className="text-white hover:bg-gray-800">Price: Low to High</SelectItem>
                        <SelectItem value="price_high" className="text-white hover:bg-gray-800">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6" data-testid="nft-grid">
                    {listingsLoading ? (
                      Array(8).fill(0).map((_, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden border border-gray-700 bg-[#151E32]">
                          <Skeleton className="h-64 w-full bg-gray-700" />
                          <div className="p-4 space-y-3">
                            <Skeleton className="h-6 w-3/4 bg-gray-700" />
                            <Skeleton className="h-4 w-1/2 bg-gray-700" />
                            <Skeleton className="h-8 w-full bg-gray-700" />
                          </div>
                        </div>
                      ))
                    ) : filteredListings.map(listing => (
                      <NftCard 
                        key={listing.id}
                        listing={listing}
                        item={items.find(i => i.id === listing.itemId)}
                        collection={collections.find(c => c.id === listing.collectionId)}
                        onBuyNow={handleBuyNow}
                        onViewItem={handleViewItem}
                      />
                    ))}
                  </div>
                  
                  {filteredListings.length > 0 && (
                    <div className="mt-8 text-center">
                      <Button variant="outline" className="px-8 py-3 bg-gray-800 text-gray-300 font-bold rounded-xl hover:bg-gray-700 border-gray-700" data-testid="button-load-more">
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Collections Tab */}
            <TabsContent value="collections" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {collectionsLoading ? (
                  Array(8).fill(0).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-gray-700 bg-[#151E32]">
                      <Skeleton className="h-48 w-full bg-gray-700" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-6 w-3/4 bg-gray-700" />
                        <Skeleton className="h-4 w-1/2 bg-gray-700" />
                      </div>
                    </div>
                  ))
                ) : (collections || []).map(collection => (
                  <div key={collection.id} className="rounded-2xl overflow-hidden border border-gray-700 bg-[#151E32] hover:border-violet-500 transition-all duration-300 cursor-pointer" data-testid={`card-collection-${collection.id}`}>
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={(collection as any).bannerImage || collection.imageUrl || `https://picsum.photos/seed/${collection.id}/400/200`} 
                        alt={collection.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#151E32] to-transparent"></div>
                      <div className="absolute bottom-3 left-3 w-14 h-14 rounded-xl border-2 border-[#151E32] overflow-hidden">
                        <img 
                          src={collection.imageUrl || `https://picsum.photos/seed/${collection.id}-logo/100/100`} 
                          alt={collection.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-white text-lg truncate">{collection.name}</h3>
                        {collection.verified && <CheckCircle className="w-4 h-4 text-violet-400" />}
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4">{collection.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-800 rounded-lg p-2 text-center">
                          <p className="text-gray-400 text-xs">{t('nftMarketplacePage.collectionsTable.floor')}</p>
                          <p className="font-mono font-bold text-white">{formatAmount(collection.floorPrice || "0")} TB</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-2 text-center">
                          <p className="text-gray-400 text-xs">{t('nftMarketplacePage.collectionsTable.items')}</p>
                          <p className="font-mono font-bold text-white">{collection.totalItems?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Listings Tab */}
            <TabsContent value="listings" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listingsLoading ? (
                  Array(8).fill(0).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-gray-700 bg-[#151E32]">
                      <Skeleton className="h-64 w-full bg-gray-700" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-6 w-3/4 bg-gray-700" />
                        <Skeleton className="h-8 w-full bg-gray-700" />
                      </div>
                    </div>
                  ))
                ) : (listings || []).map(listing => (
                  <NftCard 
                    key={listing.id}
                    listing={listing}
                    item={items.find(i => i.id === listing.itemId)}
                    collection={collections.find(c => c.id === listing.collectionId)}
                    onBuyNow={handleBuyNow}
                    onViewItem={handleViewItem}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-0">
              <GlassPanel className="p-0 overflow-hidden">
                <div className="divide-y divide-gray-700">
                  {!activity || activity.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No activity yet</p>
                    </div>
                  ) : activity.map((event, idx) => {
                    const eventItem = items.find(i => i.id === event.itemId);
                    const eventCollection = collections.find(c => c.id === event.collectionId);
                    return (
                      <div key={event.id || idx} className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors" data-testid={`activity-row-${idx}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.eventType === 'sale' ? 'bg-emerald-500/20 text-emerald-400' :
                          event.eventType === 'listing' ? 'bg-blue-500/20 text-blue-400' :
                          event.eventType === 'bid' ? 'bg-amber-500/20 text-amber-400' :
                          event.eventType === 'transfer' ? 'bg-violet-500/20 text-violet-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {event.eventType === 'sale' && <DollarSign className="w-5 h-5" />}
                          {event.eventType === 'listing' && <Tag className="w-5 h-5" />}
                          {event.eventType === 'bid' && <Gavel className="w-5 h-5" />}
                          {event.eventType === 'transfer' && <ArrowRight className="w-5 h-5" />}
                          {event.eventType === 'mint' && <Sparkles className="w-5 h-5" />}
                        </div>
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                          <img 
                            src={eventItem?.imageUrl || `https://picsum.photos/seed/${event.itemId}/100/100`} 
                            alt={eventItem?.name || 'NFT'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{eventItem?.name || `NFT #${event.itemId}`}</p>
                          <p className="text-sm text-gray-400">{eventCollection?.name || 'Unknown Collection'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-white">{formatAmount(event.price || "0")} TB</p>
                          <p className="text-xs text-gray-400">{formatDate(event.createdAt)}</p>
                        </div>
                        <Badge className={`shrink-0 ${
                          event.eventType === 'sale' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          event.eventType === 'listing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          event.eventType === 'bid' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-violet-500/20 text-violet-400 border-violet-500/30'
                        }`}>
                          {t(`nftMarketplacePage.activityEvents.${event.eventType || 'sale'}`)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>
            </TabsContent>
          </Tabs>
          </>
          )}
        </div>
      </main>

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
