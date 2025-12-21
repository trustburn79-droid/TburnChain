import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { qnaData, qnaCategories, getQnAByCategory, searchQnA, type QnAItem } from '@/data/qna-data';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  Quote,
  Sun,
  Moon,
  Home,
  ScanLine,
  User,
  Flame,
  Wallet,
  Layers,
  PieChart,
  Cpu,
  Shield,
  Gavel,
  Wrench,
  LayoutGrid,
  Gamepad2,
  Globe,
  Code,
  Lightbulb,
  Users,
  Lock,
  Coins,
  BookOpen,
  Headphones,
  ExternalLink,
  Bug,
  ImageIcon
} from 'lucide-react';
import { Link } from 'wouter';
import { useTheme } from '@/components/theme-provider';
import { LanguageSelector } from '@/components/language-selector';
import { cn } from '@/lib/utils';

const categoryIcons: Record<string, typeof Flame> = {
  'all': LayoutGrid,
  'getting-started': Flame,
  'wallet': Wallet,
  'staking': Layers,
  'defi': PieChart,
  'nft': Gamepad2,
  'gamefi': Gamepad2,
  'network': Globe,
  'developers': Code,
  'solutions': Lightbulb,
  'community': Users,
  'security': Lock,
  'tokenomics': Coins,
};

export default function QnAPage() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const currentLang = i18n.language;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const getLocalizedContent = (item: QnAItem, field: 'question' | 'answer') => {
    // Try to get content from i18n translations first
    const translationKey = `qna.content.${item.id}.${field}`;
    if (i18n.exists(translationKey)) {
      const translatedContent = t(translationKey);
      if (translatedContent && translatedContent !== translationKey) {
        return translatedContent;
      }
    }
    // Fallback to qna-data.ts content (Korean or English)
    if (currentLang === 'ko') {
      return field === 'question' ? item.question : item.answer;
    }
    return field === 'question' ? item.questionEn : item.answerEn;
  };

  const getLocalizedTags = (item: QnAItem): string[] => {
    // Try to get tags from i18n translations first
    const translatedTags = t(`qna.content.${item.id}.tags`, { returnObjects: true, defaultValue: null }) as string[] | null;
    if (Array.isArray(translatedTags) && translatedTags.length > 0 && typeof translatedTags[0] === 'string') {
      return translatedTags;
    }
    // Fallback to original tags
    return item.tags;
  };

  const filteredQnA = useMemo(() => {
    let results: QnAItem[];
    
    if (searchQuery.trim()) {
      results = searchQnA(searchQuery);
      if (selectedCategory !== 'all') {
        results = results.filter(q => q.categoryKey === selectedCategory);
      }
    } else {
      results = getQnAByCategory(selectedCategory);
    }
    
    return results;
  }, [searchQuery, selectedCategory]);

  const getCategoryLabel = (categoryKey: string) => {
    if (categoryKey === 'all') {
      return t('qna.viewAll', 'View All');
    }
    return t(`qna.categories.${categoryKey}`, categoryKey);
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: qnaData.length };
    qnaCategories.forEach(cat => {
      counts[cat.key] = qnaData.filter(q => q.categoryKey === cat.key).length;
    });
    return counts;
  }, []);

  const toggleFaq = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const CategoryIcon = ({ categoryKey }: { categoryKey: string }) => {
    const Icon = categoryIcons[categoryKey] || BookOpen;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200" data-testid="page-qna">
      <header className="h-16 border-b border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg">
            T
          </div>
          <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            TBURN <span className="text-blue-500 hidden sm:inline">Help Center</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-white"
              data-testid="link-nav-home"
            >
              <Home className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/scan">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-white"
              data-testid="link-nav-scan"
            >
              <ScanLine className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/user">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-white"
              data-testid="link-nav-user"
            >
              <User className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/bug-bounty">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-white"
              data-testid="link-nav-bug-bounty"
            >
              <Bug className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/security-audit">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-white"
              data-testid="link-nav-security-audit"
            >
              <Shield className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/token-generator">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-white"
              data-testid="link-nav-token-generator"
            >
              <Coins className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/nft-marketplace">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-white"
              data-testid="link-nav-nft-marketplace"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div className="w-px h-6 bg-slate-200 dark:bg-gray-700 mx-1" />
          <LanguageSelector />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full text-slate-500 dark:text-yellow-400 hover:bg-slate-100 dark:hover:bg-gray-700"
            data-testid="button-theme-toggle"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:block w-64 border-r border-slate-200 dark:border-gray-800 overflow-y-auto p-6 bg-white dark:bg-[#0F172A]">
          <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase mb-4 tracking-wider">
            {t('qna.categories.title', 'Categories')}
          </h3>
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className={cn(
                  "w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  selectedCategory === 'all'
                    ? "bg-blue-500 text-white"
                    : "text-slate-500 hover:bg-slate-50 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
                data-testid="button-category-all"
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm",
                  selectedCategory === 'all'
                    ? "bg-blue-600"
                    : "bg-white dark:bg-gray-700"
                )}>
                  <LayoutGrid className="h-4 w-4" />
                </div>
                <span className="flex-1">{t('qna.viewAll', 'View All')}</span>
                <span className="text-xs opacity-70">({categoryCounts.all})</span>
              </button>

              {qnaCategories.map((category) => {
                const Icon = categoryIcons[category.key] || BookOpen;
                return (
                  <button
                    key={category.key}
                    onClick={() => {
                      setSelectedCategory(category.key);
                      setSearchQuery('');
                    }}
                    className={cn(
                      "w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      selectedCategory === category.key
                        ? "bg-blue-500 text-white"
                        : "text-slate-500 hover:bg-slate-50 dark:text-gray-400 dark:hover:bg-gray-800"
                    )}
                    data-testid={`button-category-${category.key}`}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm",
                      selectedCategory === category.key
                        ? "bg-blue-600"
                        : "bg-white dark:bg-gray-700"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1">{t(`qna.categories.${category.key}`, category.labelEn)}</span>
                    <span className="text-xs opacity-70">({categoryCounts[category.key]})</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="h-4 w-4 text-blue-500" />
              <h4 className="text-sm font-bold text-blue-500">
                {t('qna.needMoreHelp', 'Need more help?')}
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-3">
              {t('qna.supportDescription', 'Our support team is available 24/7 for technical issues.')}
            </p>
            <Link href="/community/hub">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold" size="sm" data-testid="button-contact-support">
                {t('qna.contactSupport', 'Contact Support')}
              </Button>
            </Link>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative bg-slate-50 dark:bg-[#0B1120]">
          <div className="bg-white dark:bg-[#151E32] border-b border-slate-200 dark:border-gray-800 p-6 md:p-8 sticky top-0 z-10 shadow-sm">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2" data-testid="text-qna-title">
                {t('qna.howCanWeHelp', 'How can we help you?')}
              </h2>
              <p className="text-slate-500 dark:text-gray-400 mb-6 text-sm" data-testid="text-qna-description">
                {t('qna.searchDescription', 'Search through 100+ technical documents about TBURN mainnet, staking, trust score, and more.')}
              </p>
              
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="text"
                  placeholder={t('qna.searchPlaceholder', 'Search questions (e.g., staking rewards, Trust Score, fees...)')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-gray-700 rounded-2xl pl-12 pr-4 py-4 h-14 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-[#0B1120] transition-all shadow-sm text-base"
                  data-testid="input-search-qna"
                />
              </div>
            </div>
          </div>

          <div className="lg:hidden p-4 overflow-x-auto whitespace-nowrap border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0F172A]">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 mr-2 rounded-full text-sm font-bold border transition-all",
                selectedCategory === 'all'
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400"
              )}
              data-testid="button-mobile-category-all"
            >
              <LayoutGrid className="h-4 w-4" />
              {t('qna.all', 'All')}
            </button>
            {qnaCategories.map((category) => {
              const Icon = categoryIcons[category.key] || BookOpen;
              return (
                <button
                  key={category.key}
                  onClick={() => {
                    setSelectedCategory(category.key);
                    setSearchQuery('');
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 mr-2 rounded-full text-sm font-bold border transition-all",
                    selectedCategory === category.key
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400"
                  )}
                  data-testid={`button-mobile-category-${category.key}`}
                >
                  <Icon className="h-4 w-4" />
                  {t(`qna.categories.${category.key}`, category.labelEn)}
                </button>
              );
            })}
          </div>

          <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-10 min-h-[600px]">
            {filteredQnA.length === 0 ? (
              <div className="text-center py-20" data-testid="text-no-results">
                <div className="text-6xl mb-4">
                  <Search className="h-16 w-16 mx-auto text-slate-300 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t('qna.noResults', 'No results found.')}
                </h3>
                <p className="text-slate-500 dark:text-gray-400">
                  {t('qna.tryDifferentKeywords', 'Try different keywords or browse categories.')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-500 dark:text-gray-400">
                    {searchQuery 
                      ? t('qna.resultsFor', { query: searchQuery, defaultValue: `Results for "${searchQuery}"` })
                      : getCategoryLabel(selectedCategory)}
                  </span>
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    {filteredQnA.length} {t('qna.items', 'items')}
                  </Badge>
                </div>

                {filteredQnA.map((item) => {
                  const isExpanded = expandedItems.has(item.id);
                  const category = qnaCategories.find(c => c.key === item.categoryKey);
                  
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-xl overflow-hidden border transition-all duration-200",
                        "bg-white dark:bg-[#151E32] border-slate-200 dark:border-gray-700",
                        "backdrop-blur-xl"
                      )}
                      data-testid={`accordion-item-${item.id}`}
                    >
                      <button
                        onClick={() => toggleFaq(item.id)}
                        className="w-full flex items-center justify-between p-5 text-left focus:outline-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-blue-500 font-mono font-bold text-lg opacity-50">
                            Q{item.id.toString().padStart(2, '0')}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-white text-base md:text-lg">
                            {getLocalizedContent(item, 'question')}
                          </span>
                        </div>
                        <ChevronDown 
                          className={cn(
                            "h-5 w-5 text-slate-400 transition-transform duration-300 shrink-0 ml-2",
                            isExpanded && "rotate-180"
                          )} 
                        />
                      </button>
                      
                      <div 
                        className={cn(
                          "overflow-hidden transition-all duration-300",
                          isExpanded ? "max-h-[1000px]" : "max-h-0"
                        )}
                      >
                        <div className="bg-slate-50 dark:bg-[#0B1120]/50 border-t border-slate-100 dark:border-gray-800">
                          <div className="p-5 pl-14 text-slate-600 dark:text-gray-300 leading-relaxed">
                            <Quote className="h-3 w-3 text-slate-300 dark:text-gray-600 inline mr-2" />
                            {getLocalizedContent(item, 'answer')}
                          </div>
                          <div className="px-5 pb-4 pl-14 flex flex-wrap items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className="text-[10px] uppercase tracking-wider font-bold text-slate-400 border-slate-200 dark:border-gray-700"
                            >
                              {category ? t(`qna.categories.${category.key}`, category.labelEn) : item.categoryKey}
                            </Badge>
                            {getLocalizedTags(item).slice(0, 3).map((tag, idx) => (
                              <Badge 
                                key={`${item.id}-tag-${idx}`}
                                variant="outline"
                                className="text-[10px] cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSearchQuery(tag);
                                }}
                              >
                                {tag}
                              </Badge>
                            ))}
                            {item.relatedPage && (
                              <Link href={item.relatedPage}>
                                <span 
                                  className="text-[10px] text-blue-500 hover:underline cursor-pointer flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                  data-testid={`link-related-page-${item.id}`}
                                >
                                  {t('qna.relatedPage', 'Related Page')}
                                  <ExternalLink className="h-3 w-3" />
                                </span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <footer className="border-t border-slate-200 dark:border-gray-800 p-8 text-center text-slate-500 dark:text-gray-500 text-sm">
            &copy; 2024-2025 TBURN Foundation. All Rights Reserved. | 
            <Link href="/developers/docs">
              <span className="hover:text-blue-500 cursor-pointer ml-1">Documentation</span>
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
