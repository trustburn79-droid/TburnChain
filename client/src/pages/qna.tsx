import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { qnaData, qnaCategories, getQnAByCategory, searchQnA, type QnAItem } from '@/data/qna-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, HelpCircle, ChevronRight, ExternalLink, Tag } from 'lucide-react';
import { Link } from 'wouter';

export default function QnAPage() {
  const { i18n } = useTranslation();
  const isKorean = i18n.language === 'ko';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredQnA = useMemo(() => {
    let results: QnAItem[];
    
    if (searchQuery.trim()) {
      results = searchQnA(searchQuery);
    } else {
      results = getQnAByCategory(selectedCategory);
    }
    
    return results;
  }, [searchQuery, selectedCategory]);

  const getCategoryLabel = (categoryKey: string) => {
    if (categoryKey === 'all') {
      return isKorean ? '전체' : 'All';
    }
    const category = qnaCategories.find(c => c.key === categoryKey);
    return category ? (isKorean ? category.label : category.labelEn) : categoryKey;
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: qnaData.length };
    qnaCategories.forEach(cat => {
      counts[cat.key] = qnaData.filter(q => q.categoryKey === cat.key).length;
    });
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-background" data-testid="page-qna">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <HelpCircle className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold" data-testid="text-qna-title">
                {isKorean ? 'TBURN 자주 묻는 질문' : 'TBURN FAQ'}
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-qna-description">
              {isKorean 
                ? 'TBURN 블록체인 플랫폼에 대한 100가지 질문과 답변을 확인하세요.'
                : 'Find answers to 100 frequently asked questions about the TBURN blockchain platform.'}
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={isKorean ? '질문 검색...' : 'Search questions...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              data-testid="input-search-qna"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <Card className="lg:w-64 shrink-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {isKorean ? '카테고리' : 'Categories'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-auto lg:h-[calc(100vh-400px)]">
                  <div className="p-4 pt-0 space-y-1">
                    <Button
                      variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
                      className="w-full justify-between"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      data-testid="button-category-all"
                    >
                      <span>{isKorean ? '전체' : 'All'}</span>
                      <Badge variant="outline" className="ml-2">
                        {categoryCounts.all}
                      </Badge>
                    </Button>
                    {qnaCategories.map((category) => (
                      <Button
                        key={category.key}
                        variant={selectedCategory === category.key ? 'secondary' : 'ghost'}
                        className="w-full justify-between"
                        onClick={() => {
                          setSelectedCategory(category.key);
                          setSearchQuery('');
                        }}
                        data-testid={`button-category-${category.key}`}
                      >
                        <span>{isKorean ? category.label : category.labelEn}</span>
                        <Badge variant="outline" className="ml-2">
                          {categoryCounts[category.key]}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="flex-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {searchQuery ? (
                      <>
                        {isKorean ? '검색 결과' : 'Search Results'}
                        <Badge>{filteredQnA.length}</Badge>
                      </>
                    ) : (
                      <>
                        {getCategoryLabel(selectedCategory)}
                        <Badge>{filteredQnA.length}</Badge>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredQnA.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground" data-testid="text-no-results">
                      {isKorean 
                        ? '검색 결과가 없습니다. 다른 키워드로 검색해 보세요.'
                        : 'No results found. Try searching with different keywords.'}
                    </div>
                  ) : (
                    <Accordion
                      type="multiple"
                      value={expandedItems}
                      onValueChange={setExpandedItems}
                      className="space-y-2"
                    >
                      {filteredQnA.map((item) => (
                        <AccordionItem
                          key={item.id}
                          value={`item-${item.id}`}
                          className="border rounded-lg px-4"
                          data-testid={`accordion-item-${item.id}`}
                        >
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-start gap-3 text-left">
                              <span className="text-primary font-mono text-sm shrink-0">
                                Q{item.id.toString().padStart(2, '0')}
                              </span>
                              <span className="font-medium">
                                {isKorean ? item.question : item.questionEn}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <div className="pl-10 space-y-4">
                              <p className="text-muted-foreground leading-relaxed">
                                {isKorean ? item.answer : item.answerEn}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                {item.tags.map((tag) => (
                                  <Badge 
                                    key={tag} 
                                    variant="outline" 
                                    className="text-xs cursor-pointer"
                                    onClick={() => setSearchQuery(tag)}
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              {item.relatedPage && (
                                <Link href={item.relatedPage}>
                                  <Button variant="ghost" size="sm" className="text-primary" data-testid={`link-related-page-${item.id}`}>
                                    {isKorean ? '관련 페이지 보기' : 'View Related Page'}
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="mt-4">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold">
                    {isKorean ? '질문을 찾지 못하셨나요?' : 'Couldn\'t find your question?'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isKorean 
                      ? '커뮤니티 허브에서 더 많은 도움을 받으세요.'
                      : 'Get more help from the Community Hub.'}
                  </p>
                </div>
                <Link href="/community/hub">
                  <Button data-testid="button-community-hub">
                    {isKorean ? '커뮤니티 허브' : 'Community Hub'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
