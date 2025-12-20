import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
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
  Store,
  BarChart3,
  Paintbrush,
  User,
  Search,
  Sun,
  Moon,
  Image,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

interface NFTItem {
  id: number;
  name: string;
  collection: string;
  price: number;
  image: string;
  category: "art" | "game" | "pfp";
  verified: boolean;
  rare: boolean;
}

const nftItems: NFTItem[] = [
  { id: 1, name: "Cyber Punk #2077", collection: "CyberPunk Origins", price: 1250, image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cyber1", category: "pfp", verified: true, rare: false },
  { id: 2, name: "Neon City Land", collection: "Metaverse Lands", price: 50000, image: "https://images.unsplash.com/photo-1614726365723-49cfae968603?q=80&w=1000&auto=format&fit=crop", category: "game", verified: true, rare: true },
  { id: 3, name: "Abstract Soul", collection: "Modern Art", price: 450, image: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000&auto=format&fit=crop", category: "art", verified: false, rare: false },
  { id: 4, name: "Space Warrior", collection: "Galaxy War P2E", price: 890, image: "https://api.dicebear.com/7.x/bottts/svg?seed=Warrior", category: "game", verified: true, rare: false },
  { id: 5, name: "Golden Ticket", collection: "TBURN VIP", price: 10000, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop", category: "art", verified: true, rare: true },
  { id: 6, name: "Pixel Cat #88", collection: "Pixel Pets", price: 120, image: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Cat", category: "pfp", verified: false, rare: false },
  { id: 7, name: "Ether Blade", collection: "RPG Weapons", price: 2300, image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=1000&auto=format&fit=crop", category: "game", verified: true, rare: false },
  { id: 8, name: "Future Architecture", collection: "ArchViz", price: 1500, image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=1000&auto=format&fit=crop", category: "art", verified: true, rare: false },
];

const liveSales = [
  "CyberPunk #882 sold for 1,200 TB",
  "SpaceDog #12 sold for 450 TB",
  "Land Plot (0,0) sold for 50,000 TB",
  "Epic Sword sold for 55 TB",
  "Mutant Ape TB #1 sold for 3,500 TB",
  "Abstract Art #99 sold for 120 TB",
  "CyberPunk #883 sold for 1,250 TB",
];

export default function NFTMarketplace() {
  const [isDark, setIsDark] = useState(true);
  const [activeCategory, setActiveCategory] = useState<"all" | "art" | "game" | "pfp">("all");
  const [buyNowChecked, setBuyNowChecked] = useState(true);
  const [auctionChecked, setAuctionChecked] = useState(false);
  const [trustScore, setTrustScore] = useState([80]);
  const [mintModalOpen, setMintModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("price-low");

  const filteredItems = nftItems.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  return (
    <div className={`flex h-screen overflow-hidden font-sans antialiased ${isDark ? "dark" : ""}`}>
      <style>{`
        .glass-panel { backdrop-filter: blur(12px); transition: all 0.3s ease; }
        .dark .glass-panel { background: rgba(21, 30, 50, 0.7); border: 1px solid rgba(255, 255, 255, 0.05); }
        .glass-panel { background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(226, 232, 240, 0.8); }
        .nft-card:hover { transform: translateY(-5px); }
        .nft-card:hover .nft-image { transform: scale(1.05); }
        .nft-card .buy-btn { opacity: 0; transform: translateY(10px); transition: all 0.3s; }
        .nft-card:hover .buy-btn { opacity: 1; transform: translateY(0); }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee { animation: marquee 25s linear infinite; }
      `}</style>

      {/* Sidebar */}
      <aside className="w-20 lg:w-64 flex flex-col z-20 transition-all duration-300 border-r bg-white border-slate-200 dark:bg-[#0F172A] dark:border-gray-800">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
            N
          </div>
          <div className="hidden lg:block ml-3">
            <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              TBURN <span className="text-violet-500">NFT</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3">
          <Link href="/nft-marketplace">
            <div className="flex items-center gap-4 px-3 py-3 rounded-xl bg-violet-50 text-violet-500 border-l-4 border-violet-500 dark:bg-[#151E32] dark:text-white dark:border-violet-500 shadow-sm transition-colors cursor-pointer">
              <Store className="w-5 h-5" />
              <span className="hidden lg:block font-medium">Marketplace</span>
            </div>
          </Link>
          <a href="#" className="flex items-center gap-4 px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span className="hidden lg:block font-medium">Stats & Rankings</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
            <Paintbrush className="w-5 h-5" />
            <span className="hidden lg:block font-medium">Create (Mint)</span>
          </a>
          <a href="#" className="flex items-center gap-4 px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
            <User className="w-5 h-5" />
            <span className="hidden lg:block font-medium">My Collection</span>
          </a>
        </nav>

        <div className="p-3">
          <Link href="/user">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden lg:inline">Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="relative w-full max-w-96 hidden md:block">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search collections, items, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#151E32] border border-slate-200 dark:border-gray-700 rounded-full pl-12 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-800 dark:text-white"
              data-testid="input-search"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="rounded-full text-slate-500 dark:text-yellow-400"
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              onClick={() => setMintModalOpen(true)}
              className="hidden md:flex bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-violet-500/30"
              data-testid="button-create-nft"
            >
              Create NFT
            </Button>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-700 overflow-hidden cursor-pointer border-2 border-transparent hover:border-violet-500 transition-colors">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full" />
            </div>
          </div>
        </header>

        {/* Live Sales Marquee */}
        <div className="h-8 bg-violet-500 text-white text-xs font-bold overflow-hidden flex items-center relative z-10">
          <div className="absolute left-0 bg-violet-500 px-2 z-10 flex items-center gap-1">
            <span className="text-orange-300">🔥</span> LIVE SALES:
          </div>
          <div className="animate-marquee whitespace-nowrap flex gap-8 pl-32">
            {liveSales.map((sale, index) => (
              <span key={index}>{sale}</span>
            ))}
            {liveSales.map((sale, index) => (
              <span key={`dup-${index}`}>{sale}</span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth z-0">
          {/* Hero Section */}
          <div className="relative rounded-3xl overflow-hidden mb-10 h-[400px] border border-slate-200 dark:border-white/5 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1614812513172-567d2fe96a75?q=80&w=2940&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover"
              alt="Hero"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/80 to-transparent"></div>

            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center max-w-2xl">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/20">
                  Trust Score 90+ Only
                </span>
                <span className="px-3 py-1 bg-violet-500 text-white rounded-full text-xs font-bold animate-pulse">
                  Live Minting
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Discover the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                  Future
                </span>{" "}
                of Digital Art
              </h1>
              <p className="text-gray-300 mb-8 text-lg">
                TBURN 메인넷의 초고속, 제로 가스비 환경에서 검증된 프리미엄 NFT를 거래하세요.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors">
                  Explore
                </Button>
                <Button
                  variant="outline"
                  className="px-8 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold rounded-xl hover:bg-white/20 transition-colors"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="w-full lg:w-64 space-y-6 shrink-0">
              {/* Status Filter */}
              <div className="glass-panel p-5 rounded-xl">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wider">
                  Status
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox
                      checked={buyNowChecked}
                      onCheckedChange={(checked) => setBuyNowChecked(!!checked)}
                      className="border-gray-600 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                      data-testid="checkbox-buy-now"
                    />
                    <span className="text-sm text-slate-500 dark:text-gray-400 group-hover:text-violet-500 transition-colors">
                      Buy Now
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox
                      checked={auctionChecked}
                      onCheckedChange={(checked) => setAuctionChecked(!!checked)}
                      className="border-gray-600 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                      data-testid="checkbox-auction"
                    />
                    <span className="text-sm text-slate-500 dark:text-gray-400 group-hover:text-violet-500 transition-colors">
                      On Auction
                    </span>
                  </label>
                </div>
              </div>

              {/* Category Filter */}
              <div className="glass-panel p-5 rounded-xl">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wider">
                  Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(["all", "art", "game", "pfp"] as const).map((cat) => (
                    <Button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      size="sm"
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        activeCategory === cat
                          ? "bg-violet-500 text-white hover:bg-violet-600"
                          : "bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-gray-600"
                      }`}
                      data-testid={`button-category-${cat}`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Creator Trust Filter */}
              <div className="glass-panel p-5 rounded-xl border-l-4 border-violet-500">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wider">
                  Creator Trust
                </h3>
                <Slider
                  value={trustScore}
                  onValueChange={setTrustScore}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                  data-testid="slider-trust-score"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-gray-400 mt-2">
                  <span>0</span>
                  <span className="text-violet-500 font-bold">Min: {trustScore[0]}+</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            {/* NFT Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {sortedItems.length.toLocaleString()} Items{" "}
                  <span className="text-slate-400 text-sm font-normal">Found</span>
                </h2>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-slate-100 dark:bg-[#151E32] border border-slate-200 dark:border-gray-700" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="recent">Recently Listed</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6" data-testid="nft-grid">
                {sortedItems.map((item) => (
                  <div
                    key={item.id}
                    className="nft-card glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-gray-700 bg-white dark:bg-[#151E32] group cursor-pointer transition-all duration-300"
                    data-testid={`nft-card-${item.id}`}
                  >
                    <div className="h-64 overflow-hidden relative">
                      <img
                        src={item.image}
                        className="nft-image w-full h-full object-cover transition-transform duration-500"
                        alt={item.name}
                      />
                      {item.rare && (
                        <span className="absolute top-3 left-3 bg-amber-500 text-black text-xs font-extrabold px-2 py-1 rounded shadow-lg">
                          LEGENDARY
                        </span>
                      )}
                      <Button className="buy-btn absolute bottom-4 left-4 right-4 bg-white text-black font-bold py-2 rounded-lg shadow-lg hover:bg-gray-100">
                        Buy Now
                      </Button>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
                            <span>{item.collection}</span>
                            {item.verified && (
                              <CheckCircle className="w-3 h-3 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100 dark:border-gray-700">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Price</p>
                          <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                            {item.price.toLocaleString()} TB
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Last Sale</p>
                          <p className="text-sm font-mono text-slate-500 dark:text-gray-400">2m ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  className="px-8 py-3 bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-300 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-gray-700 transition-colors"
                  data-testid="button-load-more"
                >
                  Load More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mint Modal */}
      <Dialog open={mintModalOpen} onOpenChange={setMintModalOpen}>
        <DialogContent className="bg-white dark:bg-[#151E32] border-slate-200 dark:border-gray-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Create New Item
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-violet-500 transition-colors">
              <Image className="w-12 h-12 mx-auto text-slate-400 mb-2" />
              <p className="text-slate-500 dark:text-gray-400 text-sm">
                Upload file (JPG, PNG, GIF, MP4)
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <Input
                type="text"
                placeholder="Item Name"
                className="w-full bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-gray-700"
                data-testid="input-nft-name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">
                Price (TB)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                className="w-full bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-gray-700"
                data-testid="input-nft-price"
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-gray-400">Minting Fee (Gas)</span>
                <span className="font-mono font-bold text-emerald-500">$0.001</span>
              </div>
            </div>
            <Button
              className="w-full py-3 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 transition-all"
              data-testid="button-mint-item"
            >
              Mint Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
