import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const ENTERPRISE_WALLET = "0xTBURNEnterprise7a3b4c5d6e7f8901234567890abcdef";

interface NftCollection {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
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
}

interface NftItem {
  id: string;
  collectionId: string;
  tokenId: string;
  name: string | null;
  imageUrl: string | null;
  rarityTier: string | null;
  rarityScore: number | null;
  ownerAddress: string;
  isListed: boolean;
  estimatedValue: string | null;
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

function getEventTypeColor(type: string): string {
  const colors: Record<string, string> = {
    mint: "text-green-500",
    list: "text-blue-500",
    delist: "text-gray-500",
    sale: "text-emerald-500",
    bid: "text-purple-500",
    offer: "text-orange-500",
    transfer: "text-cyan-500",
    burn: "text-red-500",
  };
  return colors[type] || "text-gray-500";
}

function CollectionCard({ collection }: { collection: NftCollection }) {
  return (
    <Card className="hover-elevate cursor-pointer" data-testid={`card-collection-${collection.id}`}>
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
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{collection.name}</span>
              {collection.verified && (
                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
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
                <span className="text-muted-foreground">Floor: </span>
                <span className="font-medium">{formatAmount(collection.floorPrice)} TBURN</span>
              </div>
              <div>
                <span className="text-muted-foreground">24h Vol: </span>
                <span className="font-medium">{formatAmount(collection.volume24h)} TBURN</span>
              </div>
            </div>
          </div>
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
}

function ListingCard({ listing, collections, items, onBuyNow, onPlaceBid, onCancelListing }: ListingCardProps) {
  const collection = collections.find(c => c.id === listing.collectionId);
  const item = items.find(i => i.id === listing.itemId);
  const isOwner = listing.sellerAddress === ENTERPRISE_WALLET;
  
  return (
    <Card className="hover-elevate" data-testid={`card-listing-${listing.id}`}>
      <CardContent className="p-4">
        <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
          {item?.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name || "NFT"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{item?.name || `#${item?.tokenId}`}</span>
            {item?.rarityTier && (
              <Badge className={getRarityColor(item.rarityTier)}>
                {item.rarityTier}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {collection?.name}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="font-semibold">{formatAmount(listing.price)} TBURN</span>
            </div>
            <Badge variant={listing.listingType === "auction" ? "default" : "secondary"}>
              {listing.listingType === "auction" ? (
                <><Gavel className="w-3 h-3 mr-1" /> Auction</>
              ) : (
                "Buy Now"
              )}
            </Badge>
          </div>
          <div className="flex gap-2 mt-3">
            {isOwner ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => onCancelListing(listing)}
                data-testid={`button-cancel-${listing.id}`}
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            ) : listing.listingType === "auction" ? (
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => onPlaceBid(listing)}
                data-testid={`button-bid-${listing.id}`}
              >
                <Gavel className="w-3 h-3 mr-1" />
                Place Bid
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => onBuyNow(listing)}
                data-testid={`button-buy-${listing.id}`}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Buy Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityRow({ activity, collections }: { activity: NftActivity; collections: NftCollection[] }) {
  const collection = collections.find(c => c.id === activity.collectionId);
  
  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0" data-testid={`row-activity-${activity.id}`}>
      <div className={`p-2 rounded-lg bg-muted ${getEventTypeColor(activity.eventType)}`}>
        <Activity className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium capitalize">{activity.eventType}</span>
          {collection && (
            <span className="text-sm text-muted-foreground truncate">
              {collection.name}
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          {activity.fromAddress && (
            <span>{shortenAddress(activity.fromAddress)}</span>
          )}
          {activity.fromAddress && activity.toAddress && <span>→</span>}
          {activity.toAddress && (
            <span>{shortenAddress(activity.toAddress)}</span>
          )}
        </div>
      </div>
      {activity.price && (
        <div className="text-right">
          <div className="font-medium">{formatAmount(activity.price)} TBURN</div>
        </div>
      )}
    </div>
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
    if (!price || parseFloat(price) <= 0) {
      setPriceError("Price must be greater than 0");
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
          <DialogTitle>List NFT for Sale</DialogTitle>
          <DialogDescription>
            Create a new listing on the marketplace
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="item">Select NFT</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger data-testid="select-item">
                <SelectValue placeholder="Choose an NFT to list" />
              </SelectTrigger>
              <SelectContent>
                {availableItems.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No NFTs available to list</div>
                ) : (
                  availableItems.map(item => {
                    const coll = collections.find(c => c.id === item.collectionId);
                    return (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name || `#${item.tokenId}`} - {coll?.name || "Unknown Collection"}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (TBURN)</Label>
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
            <Label htmlFor="listingType">Listing Type</Label>
            <Select value={listingType} onValueChange={setListingType}>
              <SelectTrigger data-testid="select-listing-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Price</SelectItem>
                <SelectItem value="auction">Auction</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isPending || !selectedItem || !price}
            data-testid="button-submit-listing"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
            ) : (
              <><Plus className="w-4 h-4 mr-2" /> Create Listing</>
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
  if (!listing) return null;
  
  const item = items.find(i => i.id === listing.itemId);
  const collection = collections.find(c => c.id === listing.collectionId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            You are about to purchase this NFT
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-background flex-shrink-0">
              {item?.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name || "NFT"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{item?.name || `#${item?.tokenId}`}</div>
              <div className="text-sm text-muted-foreground">{collection?.name}</div>
              {item?.rarityTier && (
                <Badge className={`mt-1 ${getRarityColor(item.rarityTier)}`}>
                  {item.rarityTier}
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-semibold">{formatAmount(listing.price)} TBURN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seller</span>
              <span className="font-mono text-sm">{shortenAddress(listing.sellerAddress)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Buyer</span>
              <span className="font-mono text-sm">{shortenAddress(ENTERPRISE_WALLET)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isPending}
            data-testid="button-confirm-buy"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><ShoppingCart className="w-4 h-4 mr-2" /> Confirm Purchase</>
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
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");

  if (!listing) return null;
  
  const item = items.find(i => i.id === listing.itemId);
  const collection = collections.find(c => c.id === listing.collectionId);
  const minBid = parseFloat(formatAmount(listing.price)) * 1.05;

  const handleSubmit = () => {
    const amount = parseFloat(bidAmount);
    if (!amount || amount <= 0) {
      setBidError("Bid amount must be greater than 0");
      return;
    }
    if (amount < minBid) {
      setBidError(`Bid must be at least ${minBid.toFixed(4)} TBURN`);
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
          <DialogTitle>Place a Bid</DialogTitle>
          <DialogDescription>
            Enter your bid amount for this auction
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex gap-4 p-4 bg-muted rounded-lg mb-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-background flex-shrink-0">
              {item?.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name || "NFT"}
                  className="w-full h-full object-cover"
                />
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
                <span className="text-muted-foreground">Current Price: </span>
                <span className="font-semibold">{formatAmount(listing.price)} TBURN</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bidAmount">Your Bid (TBURN)</Label>
            <Input
              id="bidAmount"
              type="number"
              step="0.0001"
              min="0"
              placeholder={`Minimum: ${minBid.toFixed(4)}`}
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
              Minimum bid: {minBid.toFixed(4)} TBURN (5% above current price)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isPending || !bidAmount}
            data-testid="button-submit-bid"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing Bid...</>
            ) : (
              <><Gavel className="w-4 h-4 mr-2" /> Place Bid</>
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
  if (!listing) return null;
  
  const item = items.find(i => i.id === listing.itemId);
  const collection = collections.find(c => c.id === listing.collectionId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Listing</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this listing?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-background flex-shrink-0">
              {item?.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name || "NFT"}
                  className="w-full h-full object-cover"
                />
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
                <span className="text-muted-foreground">Listed Price: </span>
                <span className="font-semibold">{formatAmount(listing.price)} TBURN</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Canceling this listing will remove it from the marketplace. You can relist it at any time.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Keep Listed
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            data-testid="button-confirm-cancel"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Canceling...</>
            ) : (
              <><X className="w-4 h-4 mr-2" /> Cancel Listing</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function NftMarketplacePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);

  const { data: overview, isLoading: overviewLoading } = useQuery<MarketplaceOverview>({
    queryKey: ["/api/nft/stats"],
    refetchInterval: 10000,
  });

  const { data: collections, isLoading: collectionsLoading } = useQuery<NftCollection[]>({
    queryKey: ["/api/nft/collections"],
    refetchInterval: 15000,
  });

  const { data: listings, isLoading: listingsLoading } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/nft/listings"],
    refetchInterval: 10000,
  });

  const { data: items } = useQuery<NftItem[]>({
    queryKey: ["/api/nft/items"],
    refetchInterval: 15000,
  });

  const { data: activity } = useQuery<NftActivity[]>({
    queryKey: ["/api/nft/activity"],
    refetchInterval: 5000,
  });

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
        title: "NFT Listed Successfully",
        description: "Your NFT has been listed on the marketplace.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to List NFT",
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
      setSelectedListing(null);
      toast({
        title: "Purchase Successful",
        description: "You have successfully purchased the NFT!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
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
      setSelectedListing(null);
      toast({
        title: "Bid Placed Successfully",
        description: "Your bid has been placed on the auction.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Place Bid",
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
        title: "Listing Canceled",
        description: "Your listing has been removed from the marketplace.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Cancel Listing",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBuyNow = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setBuyDialogOpen(true);
  };

  const handlePlaceBid = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setBidDialogOpen(true);
  };

  const handleCancelListing = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setCancelDialogOpen(true);
  };

  const filteredCollections = collections?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">NFT Marketplace</h1>
          <p className="text-muted-foreground">
            Discover, collect, and trade unique digital assets on TBURN blockchain
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
              data-testid="input-search"
            />
          </div>
          <Button variant="outline" size="icon" data-testid="button-filter">
            <Filter className="w-4 h-4" />
          </Button>
          <Button onClick={() => setListDialogOpen(true)} data-testid="button-list-nft">
            <Plus className="w-4 h-4 mr-2" />
            List NFT
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">24h Volume</span>
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
              <span className="text-sm">24h Sales</span>
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
              <span className="text-sm">Collections</span>
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
              <span className="text-sm">Total Items</span>
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
              <span className="text-sm">Active Listings</span>
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
              <span className="text-sm">Auctions</span>
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
            Overview
          </TabsTrigger>
          <TabsTrigger value="collections" data-testid="tab-collections">
            <Grid3X3 className="w-4 h-4 mr-2" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="listings" data-testid="tab-listings">
            <Package className="w-4 h-4 mr-2" />
            Listings
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">
            <Activity className="w-4 h-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Featured Collections
                </CardTitle>
                <CardDescription>Top performing collections on the marketplace</CardDescription>
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
                        <CollectionCard key={collection.id} collection={collection} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest marketplace events</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="divide-y">
                    {activity?.slice(0, 20).map(act => (
                      <ActivityRow 
                        key={act.id} 
                        activity={act} 
                        collections={collections || []} 
                      />
                    ))}
                    {!activity?.length && (
                      <div className="py-8 text-center text-muted-foreground">
                        No recent activity
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
                Trending Collections
              </CardTitle>
              <CardDescription>Collections with the most activity in the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collectionsLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))
                ) : (
                  collections?.slice(0, 6).map(collection => (
                    <CollectionCard key={collection.id} collection={collection} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Collections</CardTitle>
              <CardDescription>Browse all NFT collections on TBURN blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collectionsLoading ? (
                  Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))
                ) : (
                  filteredCollections.map(collection => (
                    <CollectionCard key={collection.id} collection={collection} />
                  ))
                )}
              </div>
              {!collectionsLoading && filteredCollections.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  No collections found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Active Listings</CardTitle>
                <CardDescription>NFTs currently available for purchase</CardDescription>
              </div>
              <Button onClick={() => setListDialogOpen(true)} data-testid="button-list-nft-tab">
                <Plus className="w-4 h-4 mr-2" />
                List NFT
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {listingsLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square" />
                  ))
                ) : (
                  listings?.slice(0, 20).map(listing => (
                    <ListingCard 
                      key={listing.id} 
                      listing={listing} 
                      collections={collections || []}
                      items={items || []}
                      onBuyNow={handleBuyNow}
                      onPlaceBid={handlePlaceBid}
                      onCancelListing={handleCancelListing}
                    />
                  ))
                )}
              </div>
              {!listingsLoading && (!listings || listings.length === 0) && (
                <div className="py-12 text-center text-muted-foreground">
                  No active listings
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>All marketplace events in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="divide-y">
                  {activity?.map(act => (
                    <ActivityRow 
                      key={act.id} 
                      activity={act} 
                      collections={collections || []} 
                    />
                  ))}
                  {!activity?.length && (
                    <div className="py-12 text-center text-muted-foreground">
                      No activity recorded yet
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
    </div>
  );
}
