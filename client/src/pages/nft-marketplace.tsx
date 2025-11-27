import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Image, 
  Grid3X3, 
  TrendingUp, 
  Star, 
  Gavel, 
  Clock,
  DollarSign,
  Users,
  Package,
  Activity,
  Search,
  Filter,
  ExternalLink,
  CheckCircle,
  Sparkles,
} from "lucide-react";

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

function ListingCard({ listing, collections, items }: { 
  listing: MarketplaceListing; 
  collections: NftCollection[];
  items: NftItem[];
}) {
  const collection = collections.find(c => c.id === listing.collectionId);
  const item = items.find(i => i.id === listing.itemId);
  
  return (
    <Card className="hover-elevate cursor-pointer" data-testid={`card-listing-${listing.id}`}>
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

export default function NftMarketplacePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredCollections = collections?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
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
            <CardHeader>
              <CardTitle>Active Listings</CardTitle>
              <CardDescription>NFTs currently available for purchase</CardDescription>
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
    </div>
  );
}
