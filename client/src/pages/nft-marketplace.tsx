import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
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
    common: "text-gray-500 bg-gray-500/10",
    uncommon: "text-green-500 bg-green-500/10",
    rare: "text-blue-500 bg-blue-500/10",
    epic: "text-purple-500 bg-purple-500/10",
    legendary: "text-orange-500 bg-orange-500/10",
    mythic: "text-pink-500 bg-pink-500/10",
  };
  return colors[tier || "common"] || colors.common;
}

function getEventTypeIcon(type: string) {
  const icons: Record<string, { icon: typeof Activity; color: string }> = {
    mint: { icon: Sparkles, color: "text-green-500" },
    list: { icon: Tag, color: "text-blue-500" },
    delist: { icon: X, color: "text-gray-500" },
    sale: { icon: ShoppingCart, color: "text-emerald-500" },
    bid: { icon: Gavel, color: "text-purple-500" },
    offer: { icon: DollarSign, color: "text-orange-500" },
    transfer: { icon: ArrowUpRight, color: "text-cyan-500" },
    burn: { icon: Flame, color: "text-red-500" },
  };
  return icons[type] || { icon: Activity, color: "text-gray-500" };
}

interface CollectionCardProps {
  collection: NftCollection;
  onViewDetails: (collection: NftCollection) => void;
}

function CollectionCard({ collection, onViewDetails }: CollectionCardProps) {
  const { t } = useTranslation();
  const priceChange = collection.aiTrendScore ? (collection.aiTrendScore - 50) * 2 : 0;
  
  return (
    <Card 
      className="hover-elevate cursor-pointer group" 
      onClick={() => onViewDetails(collection)}
      data-testid={`card-collection-${collection.id}`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {collection.imageUrl ? (
              <img 
                src={collection.imageUrl} 
                alt={collection.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{collection.name}</span>
              {collection.verified && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>{t("nftMarketplace.verifiedCollection")}</TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span>{collection.symbol}</span>
              {collection.category && (
                <Badge variant="secondary" className="text-xs">
                  {collection.category}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div>
                <span className="text-muted-foreground">{t("nftMarketplace.floor")}: </span>
                <span className="font-medium">{formatAmount(collection.floorPrice)} TBURN</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">{t("nftMarketplace.vol24h")}: </span>
                <span className="font-medium">{formatAmount(collection.volume24h)} TBURN</span>
                {priceChange !== 0 && (
                  <span className={`flex items-center text-xs ${priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {priceChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(priceChange).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center" />
        </div>
      </CardContent>
    </Card>
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
    <Card className="hover-elevate group" data-testid={`card-listing-${listing.id}`}>
      <CardContent className="p-4">
        <div 
          className="aspect-square rounded-lg overflow-hidden bg-muted mb-3 relative cursor-pointer"
          onClick={() => item && onViewItem(item, collection)}
        >
          {item?.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name || t("nftMarketplace.nft")}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Eye className="w-8 h-8 text-white" />
          </div>
          {item?.rarityTier && (
            <Badge className={`absolute top-2 left-2 ${getRarityColor(item.rarityTier)}`}>
              {t(`nftMarketplace.rarityTiers.${item.rarityTier}`)}
            </Badge>
          )}
          {listing.listingType === "auction" && (
            <Badge className="absolute top-2 right-2 bg-purple-500/90">
              <Gavel className="w-3 h-3 mr-1" />
              {t("nftMarketplace.auction")}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium truncate">{item?.name || `#${item?.tokenId}`}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Heart className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("nftMarketplace.addToFavorites")}</TooltipContent>
            </Tooltip>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            {collection?.imageUrl && (
              <img src={collection.imageUrl} alt="" className="w-4 h-4 rounded-full" />
            )}
            <span className="truncate">{collection?.name}</span>
            {collection?.verified && <CheckCircle className="w-3 h-3 text-blue-500" />}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
            <div>
              <div className="text-xs text-muted-foreground">{t("nftMarketplace.price")}</div>
              <div className="font-semibold">{formatAmount(listing.price)} TBURN</div>
            </div>
            <div className="flex gap-1">
              {isOwner ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onCancelListing(listing); }}
                  data-testid={`button-cancel-${listing.id}`}
                >
                  <X className="w-3 h-3 mr-1" />
                  {t("nftMarketplace.cancel")}
                </Button>
              ) : listing.listingType === "auction" ? (
                <Button 
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onPlaceBid(listing); }}
                  data-testid={`button-bid-${listing.id}`}
                >
                  <Gavel className="w-3 h-3 mr-1" />
                  {t("nftMarketplace.bid")}
                </Button>
              ) : (
                <Button 
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onBuyNow(listing); }}
                  data-testid={`button-buy-${listing.id}`}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {t("nftMarketplace.buy")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityRowProps {
  activity: NftActivity;
  collections: NftCollection[];
  items: NftItem[];
  onViewItem: (item: NftItem, collection: NftCollection | undefined) => void;
  onViewCollection: (collection: NftCollection) => void;
}

function ActivityRow({ activity, collections, items, onViewItem, onViewCollection }: ActivityRowProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const collection = collections.find(c => c.id === activity.collectionId);
  const item = activity.itemId ? items.find(i => i.id === activity.itemId) : null;
  const eventIcon = getEventTypeIcon(activity.eventType);
  const Icon = eventIcon.icon;

  const copyTxHash = () => {
    if (activity.txHash) {
      navigator.clipboard.writeText(activity.txHash);
      toast({
        title: t("nftMarketplace.copied"),
        description: t("nftMarketplace.txHashCopied"),
      });
    }
  };
  
  return (
    <div 
      className="flex items-center gap-4 py-3 px-2 border-b last:border-0 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group" 
      data-testid={`row-activity-${activity.id}`}
      onClick={() => {
        if (item && collection) {
          onViewItem(item, collection);
        } else if (collection) {
          onViewCollection(collection);
        }
      }}
    >
      <div className={`p-2.5 rounded-lg bg-muted ${eventIcon.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {item?.imageUrl ? (
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : collection?.imageUrl ? (
          <img src={collection.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium capitalize ${eventIcon.color}`}>
            {t(`nftMarketplace.eventTypes.${activity.eventType}`)}
          </span>
          {item && (
            <span className="text-sm font-medium truncate">
              {item.name || `#${item.tokenId}`}
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          {collection && (
            <span className="flex items-center gap-1 truncate">
              {collection.name}
              {collection.verified && <CheckCircle className="w-3 h-3 text-blue-500" />}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
          {activity.fromAddress && (
            <span className="font-mono">{shortenAddress(activity.fromAddress)}</span>
          )}
          {activity.fromAddress && activity.toAddress && (
            <ArrowUpRight className="w-3 h-3" />
          )}
          {activity.toAddress && (
            <span className="font-mono">{shortenAddress(activity.toAddress)}</span>
          )}
        </div>
      </div>
      
      <div className="text-right flex-shrink-0">
        {activity.price && (
          <div className="font-semibold">{formatAmount(activity.price)} TBURN</div>
        )}
        <div className="text-xs text-muted-foreground">{formatDate(activity.createdAt)}</div>
        {activity.txHash && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); copyTxHash(); }}
          >
            <Copy className="w-3 h-3 mr-1" />
            <span className="text-xs">Tx</span>
          </Button>
        )}
      </div>
    </div>
  );
}

interface CollectionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: NftCollection | null;
  items: NftItem[];
  listings: MarketplaceListing[];
  activity: NftActivity[];
  onViewItem: (item: NftItem) => void;
}

function CollectionDetailDialog({ 
  open, 
  onOpenChange, 
  collection, 
  items, 
  listings,
  activity,
  onViewItem 
}: CollectionDetailDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [detailTab, setDetailTab] = useState("items");

  if (!collection) return null;

  const collectionItems = items.filter(i => i.collectionId === collection.id);
  const collectionListings = listings.filter(l => l.collectionId === collection.id && l.status === "active");
  const collectionActivity = activity.filter(a => a.collectionId === collection.id);
  const listedPercentage = collection.totalItems > 0 
    ? (collection.listedItems / collection.totalItems) * 100 
    : 0;

  const copyAddress = () => {
    if (collection.creatorAddress) {
      navigator.clipboard.writeText(collection.creatorAddress);
      toast({ title: t("nftMarketplace.copied"), description: t("nftMarketplace.addressCopied") });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
              {collection.imageUrl ? (
                <img src={collection.imageUrl} alt={collection.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl">{collection.name}</DialogTitle>
                {collection.verified && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}
                {collection.category && (
                  <Badge variant="secondary">{collection.category}</Badge>
                )}
              </div>
              <DialogDescription className="mt-1">
                <span className="font-mono">{collection.symbol}</span>
                {collection.creatorAddress && (
                  <span className="ml-2">
                    {t("nftMarketplace.by")} 
                    <button 
                      className="font-mono ml-1 hover:underline"
                      onClick={copyAddress}
                    >
                      {shortenAddress(collection.creatorAddress)}
                    </button>
                  </span>
                )}
              </DialogDescription>
              {collection.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {t(`nftMarketplace.collectionDescriptions.${collection.name}`, collection.description)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("nftMarketplace.share")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("nftMarketplace.viewOnExplorer")}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground">{t("nftMarketplace.floorPrice")}</div>
            <div className="font-bold text-lg">{formatAmount(collection.floorPrice)}</div>
            <div className="text-xs text-muted-foreground">TBURN</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground">{t("nftMarketplace.volume24h")}</div>
            <div className="font-bold text-lg">{formatAmount(collection.volume24h)}</div>
            <div className="text-xs text-muted-foreground">TBURN</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground">{t("nftMarketplace.owners")}</div>
            <div className="font-bold text-lg">{collection.owners.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{t("nftMarketplace.unique")}</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground">{t("nftMarketplace.items")}</div>
            <div className="font-bold text-lg">{collection.totalItems.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{collection.listedItems} {t("nftMarketplace.listed")}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">{t("nftMarketplace.listedRatio")}</span>
              <span>{listedPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={listedPercentage} className="h-2" />
          </div>
          {collection.aiTrendScore && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{t("nftMarketplace.aiTrendScore")}: {collection.aiTrendScore}</span>
            </div>
          )}
          {collection.royaltyPercent !== undefined && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">{t("nftMarketplace.royalty")}: {collection.royaltyPercent}%</span>
            </div>
          )}
        </div>

        <Separator />

        <Tabs value={detailTab} onValueChange={setDetailTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="items" className="gap-2">
              <Grid3X3 className="w-4 h-4" />
              {t("nftMarketplace.items")} ({collectionItems.length})
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-2">
              <Tag className="w-4 h-4" />
              {t("nftMarketplace.listings")} ({collectionListings.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              {t("nftMarketplace.activity")} ({collectionActivity.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="items" className="m-0">
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {collectionItems.slice(0, 20).map(item => (
                  <div 
                    key={item.id}
                    className="group cursor-pointer"
                    onClick={() => onViewItem(item)}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      {item.rarityTier && (
                        <Badge className={`absolute top-1 left-1 text-xs ${getRarityColor(item.rarityTier)}`}>
                          {item.rarityTier}
                        </Badge>
                      )}
                      {item.isListed && (
                        <Badge className="absolute top-1 right-1 text-xs bg-green-500/90">
                          {t("nftMarketplace.forSale")}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 truncate text-sm font-medium">{item.name || `#${item.tokenId}`}</div>
                    {item.estimatedValue && (
                      <div className="text-xs text-muted-foreground">{formatAmount(item.estimatedValue)} TBURN</div>
                    )}
                  </div>
                ))}
              </div>
              {collectionItems.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  {t("nftMarketplace.noItemsInCollection")}
                </div>
              )}
            </TabsContent>

            <TabsContent value="listings" className="m-0">
              <div className="space-y-2">
                {collectionListings.map(listing => {
                  const item = items.find(i => i.id === listing.itemId);
                  return (
                    <div 
                      key={listing.id}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer"
                      onClick={() => item && onViewItem(item)}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-background">
                        {item?.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item?.name || `#${item?.tokenId}`}</div>
                        <div className="text-sm text-muted-foreground">{shortenAddress(listing.sellerAddress)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatAmount(listing.price)} TBURN</div>
                        <Badge variant={listing.listingType === "auction" ? "default" : "secondary"} className="text-xs">
                          {listing.listingType === "auction" ? t("nftMarketplace.auction") : t("nftMarketplace.fixedPrice")}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {collectionListings.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    {t("nftMarketplace.noActiveListingsInCollection")}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="m-0">
              <div className="space-y-1">
                {collectionActivity.slice(0, 30).map(act => {
                  const item = act.itemId ? items.find(i => i.id === act.itemId) : null;
                  const eventIcon = getEventTypeIcon(act.eventType);
                  const Icon = eventIcon.icon;
                  return (
                    <div 
                      key={act.id}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                      onClick={() => item && onViewItem(item)}
                    >
                      <div className={`p-2 rounded-lg bg-muted ${eventIcon.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                        {item?.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium capitalize ${eventIcon.color}`}>
                          {t(`nftMarketplace.eventTypes.${act.eventType}`)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {act.fromAddress && shortenAddress(act.fromAddress)}
                          {act.fromAddress && act.toAddress && " → "}
                          {act.toAddress && shortenAddress(act.toAddress)}
                        </div>
                      </div>
                      <div className="text-right">
                        {act.price && <div className="font-medium text-sm">{formatAmount(act.price)} TBURN</div>}
                        <div className="text-xs text-muted-foreground">{formatDate(act.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
                {collectionActivity.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    {t("nftMarketplace.noActivityInCollection")}
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface NftItemDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: NftItem | null;
  collection: NftCollection | undefined;
  listings: MarketplaceListing[];
  activity: NftActivity[];
  onBuyNow: (listing: MarketplaceListing) => void;
  onPlaceBid: (listing: MarketplaceListing) => void;
}

function NftItemDetailDialog({ 
  open, 
  onOpenChange, 
  item, 
  collection,
  listings,
  activity,
  onBuyNow,
  onPlaceBid,
}: NftItemDetailDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  if (!item) return null;

  const itemListing = listings.find(l => l.itemId === item.id && l.status === "active");
  const itemActivity = activity.filter(a => a.itemId === item.id);
  
  const mockAttributes = item.attributes || [
    { trait_type: "Background", value: "Cosmic Blue" },
    { trait_type: "Body", value: "Quantum Silver" },
    { trait_type: "Eyes", value: "Holographic" },
    { trait_type: "Accessory", value: "Neural Link" },
    { trait_type: "Rarity", value: item.rarityTier || "Common" },
  ];

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({ title: t("nftMarketplace.copied"), description: t("nftMarketplace.addressCopied") });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex flex-col md:flex-row gap-6 overflow-y-auto">
          <div className="md:w-1/2 flex-shrink-0">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted relative">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name || ""} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              {item.rarityTier && (
                <Badge className={`absolute top-3 left-3 ${getRarityColor(item.rarityTier)}`}>
                  {t(`nftMarketplace.rarityTiers.${item.rarityTier}`)}
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2 mt-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Heart className="w-4 h-4 mr-1" />
                    {t("nftMarketplace.favorite")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("nftMarketplace.addToFavorites")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="w-4 h-4 mr-1" />
                    {t("nftMarketplace.share")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("nftMarketplace.shareNft")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("nftMarketplace.viewOnExplorer")}</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="md:w-1/2 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                {collection && (
                  <>
                    {collection.imageUrl && (
                      <img src={collection.imageUrl} alt="" className="w-5 h-5 rounded-full" />
                    )}
                    <span>{collection.name}</span>
                    {collection.verified && <CheckCircle className="w-3 h-3 text-blue-500" />}
                  </>
                )}
              </div>
              <h2 className="text-2xl font-bold">{item.name || `#${item.tokenId}`}</h2>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {item.rarityTier 
                    ? t(`nftMarketplace.itemDescriptions.${item.rarityTier}`, { collection: collection?.name || '' }) 
                    : t('nftMarketplace.itemDescriptions.default', { collection: collection?.name || '' })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{t("nftMarketplace.ownedBy")}</span>
                <button 
                  className="font-mono text-sm hover:underline"
                  onClick={() => copyAddress(item.ownerAddress)}
                >
                  {shortenAddress(item.ownerAddress)}
                </button>
              </div>
              {item.rarityScore && (
                <Badge variant="outline" className="gap-1">
                  <BarChart3 className="w-3 h-3" />
                  {t("nftMarketplace.rarityRank")}: #{item.rarityScore}
                </Badge>
              )}
            </div>

            {itemListing ? (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {itemListing.listingType === "auction" 
                          ? t("nftMarketplace.currentBid") 
                          : t("nftMarketplace.currentPrice")}
                      </div>
                      <div className="text-2xl font-bold">{formatAmount(itemListing.price)} TBURN</div>
                    </div>
                    {itemListing.listingType === "auction" && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {t("nftMarketplace.endsIn")}: 12h 30m
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {itemListing.listingType === "auction" ? (
                      <Button className="flex-1" onClick={() => onPlaceBid(itemListing)}>
                        <Gavel className="w-4 h-4 mr-2" />
                        {t("nftMarketplace.placeBid")}
                      </Button>
                    ) : (
                      <Button className="flex-1" onClick={() => onBuyNow(itemListing)}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {t("nftMarketplace.buyNow")}
                      </Button>
                    )}
                    <Button variant="outline">
                      <Tag className="w-4 h-4 mr-2" />
                      {t("nftMarketplace.makeOffer")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center">
                  <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">{t("nftMarketplace.notForSale")}</div>
                  {item.estimatedValue && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">{t("nftMarketplace.estimatedValue")}: </span>
                      <span className="font-medium">{formatAmount(item.estimatedValue)} TBURN</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t("nftMarketplace.attributes")}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {mockAttributes.map((attr, idx) => (
                  <div key={idx} className="bg-muted rounded-lg p-2 text-center">
                    <div className="text-xs text-muted-foreground uppercase">{attr.trait_type}</div>
                    <div className="font-medium text-sm truncate">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {itemActivity.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {t("nftMarketplace.itemHistory")}
                </h3>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {itemActivity.slice(0, 10).map(act => {
                      const eventIcon = getEventTypeIcon(act.eventType);
                      const Icon = eventIcon.icon;
                      return (
                        <div key={act.id} className="flex items-center gap-2 text-sm">
                          <Icon className={`w-4 h-4 ${eventIcon.color}`} />
                          <span className="capitalize">{t(`nftMarketplace.eventTypes.${act.eventType}`)}</span>
                          {act.price && <span className="font-medium">{formatAmount(act.price)} TBURN</span>}
                          <span className="text-muted-foreground ml-auto">{formatDate(act.createdAt)}</span>
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

interface ListNftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: NftItem[];
  collections: NftCollection[];
  onSubmit: (data: { itemId: string; price: string; listingType: string }) => void;
  isPending: boolean;
}

function ListNftDialog({ open, onOpenChange, items, collections, onSubmit, isPending }: ListNftDialogProps) {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState("");
  const [price, setPrice] = useState("");
  const [listingType, setListingType] = useState("fixed");
  const [priceError, setPriceError] = useState("");

  const availableItems = items.filter(item => !item.isListed && item.ownerAddress === ENTERPRISE_WALLET);

  const handleSubmit = () => {
    if (!selectedItem) return;
    if (!price || parseFloat(price) <= 0) {
      setPriceError(t("nftMarketplace.priceGreaterThanZero"));
      return;
    }
    setPriceError("");
    onSubmit({
      itemId: selectedItem,
      price: parseAmount(price),
      listingType,
    });
  };

  const handleClose = () => {
    setSelectedItem("");
    setPrice("");
    setListingType("fixed");
    setPriceError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("nftMarketplace.listNftForSale")}</DialogTitle>
          <DialogDescription>
            {t("nftMarketplace.createNewListing")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="item">{t("nftMarketplace.selectNft")}</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger data-testid="select-item">
                <SelectValue placeholder={t("nftMarketplace.chooseNftToList")} />
              </SelectTrigger>
              <SelectContent>
                {availableItems.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">{t("nftMarketplace.noNftsAvailable")}</div>
                ) : (
                  availableItems.map(item => {
                    const coll = collections.find(c => c.id === item.collectionId);
                    return (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name || `#${item.tokenId}`} - {coll?.name || t("nftMarketplace.unknownCollection")}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">{t("nftMarketplace.priceTburn")}</Label>
            <Input
              id="price"
              type="number"
              step="0.0001"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setPriceError("");
              }}
              data-testid="input-price"
            />
            {priceError && (
              <p className="text-sm text-destructive">{priceError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="listingType">{t("nftMarketplace.listingType")}</Label>
            <Select value={listingType} onValueChange={setListingType}>
              <SelectTrigger data-testid="select-listing-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">{t("nftMarketplace.fixedPrice")}</SelectItem>
                <SelectItem value="auction">{t("nftMarketplace.auction")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            {t("nftMarketplace.cancel")}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isPending || !selectedItem || !price}
            data-testid="button-submit-listing"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("nftMarketplace.creating")}</>
            ) : (
              <><Plus className="w-4 h-4 mr-2" /> {t("nftMarketplace.createListing")}</>
            )}
          </Button>
        </DialogFooter>
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
  const { t } = useTranslation();
  if (!listing) return null;
  
  const item = items.find(i => i.id === listing.itemId);
  const collection = collections.find(c => c.id === listing.collectionId);
  const royaltyAmount = collection?.royaltyPercent 
    ? (BigInt(listing.price) * BigInt(collection.royaltyPercent) / BigInt(100)).toString()
    : "0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("nftMarketplace.confirmPurchase")}</DialogTitle>
          <DialogDescription>
            {t("nftMarketplace.aboutToPurchase")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-background flex-shrink-0">
              {item?.imageUrl ? (
                <img src={item.imageUrl} alt={item.name || t("nftMarketplace.nft")} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">{item?.name || `#${item?.tokenId}`}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                {collection?.name}
                {collection?.verified && <CheckCircle className="w-3 h-3 text-blue-500" />}
              </div>
              {item?.rarityTier && (
                <Badge className={`mt-2 ${getRarityColor(item.rarityTier)}`}>
                  {t(`nftMarketplace.rarityTiers.${item.rarityTier}`)}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">{t("nftMarketplace.itemPrice")}</span>
              <span className="font-medium">{formatAmount(listing.price)} TBURN</span>
            </div>
            {royaltyAmount !== "0" && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">{t("nftMarketplace.creatorRoyalty")} ({collection?.royaltyPercent}%)</span>
                <span className="font-medium">{formatAmount(royaltyAmount)} TBURN</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">{t("nftMarketplace.seller")}</span>
              <span className="font-mono text-sm">{shortenAddress(listing.sellerAddress)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold">{t("nftMarketplace.totalPayment")}</span>
              <span className="font-bold text-lg">{formatAmount(listing.price)} TBURN</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-start gap-2">
            <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium">{t("nftMarketplace.secureTransaction")}</div>
              <div className="text-muted-foreground">{t("nftMarketplace.secureTransactionDesc")}</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("nftMarketplace.cancel")}
          </Button>
          <Button onClick={onConfirm} disabled={isPending} data-testid="button-confirm-buy">
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("nftMarketplace.processing")}</>
            ) : (
              <><ShoppingCart className="w-4 h-4 mr-2" /> {t("nftMarketplace.confirmPurchaseBtn")}</>
            )}
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
  const { t } = useTranslation();
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");

  if (!listing) return null;
  
  const item = items.find(i => i.id === listing.itemId);
  const collection = collections.find(c => c.id === listing.collectionId);
  const minBid = parseFloat(formatAmount(listing.price)) * 1.05;

  const handleSubmit = () => {
    const amount = parseFloat(bidAmount);
    if (!amount || amount <= 0) {
      setBidError(t("nftMarketplace.bidGreaterThanZero"));
      return;
    }
    if (amount < minBid) {
      setBidError(t("nftMarketplace.bidMustBeAtLeast", { min: minBid.toFixed(4) }));
      return;
    }
    setBidError("");
    onSubmit(parseAmount(bidAmount));
  };

  const handleClose = () => {
    setBidAmount("");
    setBidError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("nftMarketplace.placeABid")}</DialogTitle>
          <DialogDescription>
            {t("nftMarketplace.enterBidAmount")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex gap-4 p-4 bg-muted rounded-lg mb-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-background flex-shrink-0">
              {item?.imageUrl ? (
                <img src={item.imageUrl} alt={item.name || t("nftMarketplace.nft")} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{item?.name || `#${item?.tokenId}`}</div>
              <div className="text-sm text-muted-foreground">{collection?.name}</div>
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">{t("nftMarketplace.currentBid")}: </span>
                <span className="font-semibold">{formatAmount(listing.price)} TBURN</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bidAmount">{t("nftMarketplace.yourBidTburn")}</Label>
            <Input
              id="bidAmount"
              type="number"
              step="0.0001"
              min="0"
              placeholder={`${t("nftMarketplace.bidMinimum")}: ${minBid.toFixed(4)}`}
              value={bidAmount}
              onChange={(e) => {
                setBidAmount(e.target.value);
                setBidError("");
              }}
              data-testid="input-bid-amount"
            />
            {bidError && (
              <p className="text-sm text-destructive">{bidError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("nftMarketplace.minimumBidInfo", { min: minBid.toFixed(4) })}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            {t("nftMarketplace.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !bidAmount} data-testid="button-submit-bid">
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("nftMarketplace.placingBid")}</>
            ) : (
              <><Gavel className="w-4 h-4 mr-2" /> {t("nftMarketplace.placeBid")}</>
            )}
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
  const { t } = useTranslation();
  if (!listing) return null;
  
  const item = items.find(i => i.id === listing.itemId);
  const collection = collections.find(c => c.id === listing.collectionId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("nftMarketplace.cancelListing")}</DialogTitle>
          <DialogDescription>
            {t("nftMarketplace.cancelListingConfirm")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-background flex-shrink-0">
              {item?.imageUrl ? (
                <img src={item.imageUrl} alt={item.name || t("nftMarketplace.nft")} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{item?.name || `#${item?.tokenId}`}</div>
              <div className="text-sm text-muted-foreground">{collection?.name}</div>
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">{t("nftMarketplace.listedPrice")}: </span>
                <span className="font-semibold">{formatAmount(listing.price)} TBURN</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("nftMarketplace.cancelListingInfo")}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("nftMarketplace.keepListed")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending} data-testid="button-confirm-cancel">
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("nftMarketplace.canceling")}</>
            ) : (
              <><X className="w-4 h-4 mr-2" /> {t("nftMarketplace.cancelListing")}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function NftMarketplacePage() {
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
  const [collectionDetailOpen, setCollectionDetailOpen] = useState(false);
  const [itemDetailOpen, setItemDetailOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<NftCollection | null>(null);
  const [selectedItem, setSelectedItem] = useState<NftItem | null>(null);
  const [selectedItemCollection, setSelectedItemCollection] = useState<NftCollection | undefined>(undefined);

  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery<MarketplaceOverview>({
    queryKey: ["/api/nft/stats"],
    refetchInterval: 10000,
  });

  const { data: collections, isLoading: collectionsLoading, refetch: refetchCollections } = useQuery<NftCollection[]>({
    queryKey: ["/api/nft/collections"],
    refetchInterval: 15000,
  });

  const { data: listings, isLoading: listingsLoading, refetch: refetchListings } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/nft/listings"],
    refetchInterval: 10000,
  });

  const { data: items, refetch: refetchItems } = useQuery<NftItem[]>({
    queryKey: ["/api/nft/items"],
    refetchInterval: 15000,
  });

  const { data: activity, refetch: refetchActivity } = useQuery<NftActivity[]>({
    queryKey: ["/api/nft/activity"],
    refetchInterval: 5000,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchOverview(),
        refetchCollections(),
        refetchListings(),
        refetchItems(),
        refetchActivity(),
      ]);
      toast({
        title: t("nftMarketplace.refreshSuccess"),
        description: t("nftMarketplace.refreshSuccessDesc"),
      });
    } catch {
      toast({
        title: t("nftMarketplace.refreshError"),
        description: t("nftMarketplace.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchOverview, refetchCollections, refetchListings, refetchItems, refetchActivity, toast, t]);

  const createListingMutation = useMutation({
    mutationFn: async (data: { itemId: string; price: string; listingType: string }) => {
      const response = await apiRequest("POST", "/api/nft/listings", {
        itemId: data.itemId,
        sellerAddress: ENTERPRISE_WALLET,
        price: data.price,
        listingType: data.listingType,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nft/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/stats"] });
      setListDialogOpen(false);
      toast({
        title: t("nftMarketplace.nftListedSuccess"),
        description: t("nftMarketplace.nftListedSuccessDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("nftMarketplace.failedToListNft"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const buyNowMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
      const response = await apiRequest("POST", `/api/nft/listings/${listingId}/buy`, {
        buyerAddress: ENTERPRISE_WALLET,
        txHash,
      });
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
      toast({
        title: t("nftMarketplace.purchaseSuccessful"),
        description: t("nftMarketplace.purchaseSuccessfulDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("nftMarketplace.purchaseFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const placeBidMutation = useMutation({
    mutationFn: async ({ listingId, bidAmount }: { listingId: string; bidAmount: string }) => {
      const response = await apiRequest("POST", "/api/nft/bids", {
        listingId,
        bidderAddress: ENTERPRISE_WALLET,
        amount: bidAmount,
        currency: "TBURN",
        status: "active",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nft/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/stats"] });
      setBidDialogOpen(false);
      setItemDetailOpen(false);
      setSelectedListing(null);
      toast({
        title: t("nftMarketplace.bidPlacedSuccess"),
        description: t("nftMarketplace.bidPlacedSuccessDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("nftMarketplace.failedToPlaceBid"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const response = await apiRequest("POST", `/api/nft/listings/${listingId}/cancel`, {
        sellerAddress: ENTERPRISE_WALLET,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nft/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nft/stats"] });
      setCancelDialogOpen(false);
      setSelectedListing(null);
      toast({
        title: t("nftMarketplace.listingCanceled"),
        description: t("nftMarketplace.listingCanceledDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("nftMarketplace.failedToCancelListing"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBuyNow = (listing: MarketplaceListing) => {
    if (!isConnected) {
      toast({ title: t('wallet.walletRequired'), description: t('wallet.connectRequiredDesc'), variant: "destructive" });
      setWalletModalOpen(true);
      return;
    }
    if (!isCorrectNetwork) {
      toast({ title: t('wallet.wrongNetworkTitle'), description: t('wallet.wrongNetworkDesc'), variant: "destructive" });
      return;
    }
    setSelectedListing(listing);
    setBuyDialogOpen(true);
  };

  const handlePlaceBid = (listing: MarketplaceListing) => {
    if (!isConnected) {
      toast({ title: t('wallet.walletRequired'), description: t('wallet.connectRequiredDesc'), variant: "destructive" });
      setWalletModalOpen(true);
      return;
    }
    if (!isCorrectNetwork) {
      toast({ title: t('wallet.wrongNetworkTitle'), description: t('wallet.wrongNetworkDesc'), variant: "destructive" });
      return;
    }
    setSelectedListing(listing);
    setBidDialogOpen(true);
  };

  const handleCancelListing = (listing: MarketplaceListing) => {
    if (!isConnected) {
      toast({ title: t('wallet.walletRequired'), description: t('wallet.connectRequiredDesc'), variant: "destructive" });
      setWalletModalOpen(true);
      return;
    }
    setSelectedListing(listing);
    setCancelDialogOpen(true);
  };

  const handleViewCollection = (collection: NftCollection) => {
    setSelectedCollection(collection);
    setCollectionDetailOpen(true);
  };

  const handleViewItem = (item: NftItem, collection?: NftCollection) => {
    setSelectedItem(item);
    setSelectedItemCollection(collection || collections?.find(c => c.id === item.collectionId));
    setItemDetailOpen(true);
  };

  const filteredCollections = collections?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
    <div className="p-6 space-y-6">
      <WalletRequiredBanner />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">{t("nftMarketplace.title")}</h1>
          <p className="text-muted-foreground">
            {t("nftMarketplace.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("nftMarketplace.searchCollections")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
              data-testid="input-search"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setListDialogOpen(true)} data-testid="button-list-nft">
            <Plus className="w-4 h-4 mr-2" />
            {t("nftMarketplace.listNft")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">{t("nftMarketplace.volume24h")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-volume-24h">
                {formatAmount(overview?.totalVolume24h || "0")} TBURN
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">{t("nftMarketplace.sales24h")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-sales-24h">
                {overview?.salesCount24h?.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Grid3X3 className="w-4 h-4" />
              <span className="text-sm">{t("nftMarketplace.collections")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-collections">
                {overview?.totalCollections?.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Package className="w-4 h-4" />
              <span className="text-sm">{t("nftMarketplace.totalItems")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-total-items">
                {overview?.totalItems?.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{t("nftMarketplace.activeListings")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-active-listings">
                {overview?.activeListings?.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Gavel className="w-4 h-4" />
              <span className="text-sm">{t("nftMarketplace.auctions")}</span>
            </div>
            {overviewLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold" data-testid="text-auctions">
                {overview?.auctionListings?.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <TrendingUp className="w-4 h-4 mr-2" />
            {t("nftMarketplace.overview")}
          </TabsTrigger>
          <TabsTrigger value="collections" data-testid="tab-collections">
            <Grid3X3 className="w-4 h-4 mr-2" />
            {t("nftMarketplace.collections")}
          </TabsTrigger>
          <TabsTrigger value="listings" data-testid="tab-listings">
            <Package className="w-4 h-4 mr-2" />
            {t("nftMarketplace.listings")}
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">
            <Activity className="w-4 h-4 mr-2" />
            {t("nftMarketplace.activity")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    {t("nftMarketplace.featuredCollections")}
                  </CardTitle>
                  <CardDescription>{t("nftMarketplace.featuredCollectionsDesc")}</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveTab("collections")}
                  data-testid="button-view-all-collections"
                >
                  {t("nftMarketplace.viewAll")}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {collectionsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))
                    ) : (
                      collections?.filter(c => c.verified)?.slice(0, 5).map(collection => (
                        <CollectionCard 
                          key={collection.id} 
                          collection={collection}
                          onViewDetails={handleViewCollection}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    {t("nftMarketplace.recentActivity")}
                  </CardTitle>
                  <CardDescription>{t("nftMarketplace.recentActivityDesc")}</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveTab("activity")}
                  data-testid="button-view-all-activity"
                >
                  {t("nftMarketplace.viewAll")}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-1">
                    {activity?.slice(0, 15).map(act => (
                      <ActivityRow 
                        key={act.id} 
                        activity={act} 
                        collections={collections || []}
                        items={items || []}
                        onViewItem={handleViewItem}
                        onViewCollection={handleViewCollection}
                      />
                    ))}
                    {!activity?.length && (
                      <div className="py-8 text-center text-muted-foreground">
                        {t("nftMarketplace.noRecentActivity")}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                {t("nftMarketplace.trendingCollections")}
              </CardTitle>
              <CardDescription>{t("nftMarketplace.trendingCollectionsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collectionsLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))
                ) : (
                  collections?.slice(0, 6).map(collection => (
                    <CollectionCard 
                      key={collection.id} 
                      collection={collection}
                      onViewDetails={handleViewCollection}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("nftMarketplace.allCollections")}</CardTitle>
              <CardDescription>{t("nftMarketplace.allCollectionsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collectionsLoading ? (
                  Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))
                ) : (
                  filteredCollections.map(collection => (
                    <CollectionCard 
                      key={collection.id} 
                      collection={collection}
                      onViewDetails={handleViewCollection}
                    />
                  ))
                )}
              </div>
              {!collectionsLoading && filteredCollections.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  {t("nftMarketplace.noCollectionsFound")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>{t("nftMarketplace.activeListingsTitle")}</CardTitle>
                <CardDescription>{t("nftMarketplace.activeListingsDesc")}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={listingFilter} onValueChange={setListingFilter}>
                  <SelectTrigger className="w-32" data-testid="select-listing-filter">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("nftMarketplace.all")}</SelectItem>
                    <SelectItem value="fixed">{t("nftMarketplace.fixedPrice")}</SelectItem>
                    <SelectItem value="auction">{t("nftMarketplace.auction")}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">{t("nftMarketplace.sortRecent")}</SelectItem>
                    <SelectItem value="price_low">{t("nftMarketplace.sortPriceLow")}</SelectItem>
                    <SelectItem value="price_high">{t("nftMarketplace.sortPriceHigh")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setListDialogOpen(true)} data-testid="button-list-nft-tab">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("nftMarketplace.listNft")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {listingsLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square" />
                  ))
                ) : (
                  filteredListings.slice(0, 20).map(listing => (
                    <ListingCard 
                      key={listing.id} 
                      listing={listing} 
                      collections={collections || []}
                      items={items || []}
                      onBuyNow={handleBuyNow}
                      onPlaceBid={handlePlaceBid}
                      onCancelListing={handleCancelListing}
                      onViewItem={handleViewItem}
                    />
                  ))
                )}
              </div>
              {!listingsLoading && filteredListings.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  {t("nftMarketplace.noActiveListings")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("nftMarketplace.activityFeed")}</CardTitle>
              <CardDescription>{t("nftMarketplace.activityFeedDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-1">
                  {activity?.map(act => (
                    <ActivityRow 
                      key={act.id} 
                      activity={act} 
                      collections={collections || []}
                      items={items || []}
                      onViewItem={handleViewItem}
                      onViewCollection={handleViewCollection}
                    />
                  ))}
                  {!activity?.length && (
                    <div className="py-12 text-center text-muted-foreground">
                      {t("nftMarketplace.noActivityRecorded")}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ListNftDialog
        open={listDialogOpen}
        onOpenChange={setListDialogOpen}
        items={items || []}
        collections={collections || []}
        onSubmit={(data) => createListingMutation.mutate(data)}
        isPending={createListingMutation.isPending}
      />

      <BuyNowDialog
        open={buyDialogOpen}
        onOpenChange={setBuyDialogOpen}
        listing={selectedListing}
        items={items || []}
        collections={collections || []}
        onConfirm={() => selectedListing && buyNowMutation.mutate(selectedListing.id)}
        isPending={buyNowMutation.isPending}
      />

      <PlaceBidDialog
        open={bidDialogOpen}
        onOpenChange={setBidDialogOpen}
        listing={selectedListing}
        items={items || []}
        collections={collections || []}
        onSubmit={(bidAmount) => selectedListing && placeBidMutation.mutate({ listingId: selectedListing.id, bidAmount })}
        isPending={placeBidMutation.isPending}
      />

      <CancelListingDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        listing={selectedListing}
        items={items || []}
        collections={collections || []}
        onConfirm={() => selectedListing && cancelListingMutation.mutate(selectedListing.id)}
        isPending={cancelListingMutation.isPending}
      />

      <CollectionDetailDialog
        open={collectionDetailOpen}
        onOpenChange={setCollectionDetailOpen}
        collection={selectedCollection}
        items={items || []}
        listings={listings || []}
        activity={activity || []}
        onViewItem={(item) => handleViewItem(item, selectedCollection || undefined)}
      />

      <NftItemDetailDialog
        open={itemDetailOpen}
        onOpenChange={setItemDetailOpen}
        item={selectedItem}
        collection={selectedItemCollection}
        listings={listings || []}
        activity={activity || []}
        onBuyNow={handleBuyNow}
        onPlaceBid={handlePlaceBid}
      />
      <WalletConnectModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </div>
  );
}
