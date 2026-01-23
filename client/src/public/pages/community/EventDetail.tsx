import { Link, useRoute, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Share2, Bell, Video, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslationApi } from "@/hooks/use-translation-api";

interface EventData {
  id: string;
  title: string;
  titleKo?: string;
  description: string;
  descriptionKo?: string;
  type: string;
  startDate: number;
  endDate: number;
  participants: number;
  maxParticipants?: number;
  rewards?: string;
  status: string;
  location?: string;
  isOnline: boolean;
  isRegistered?: boolean;
  translationKey?: string;
}

const eventGradients: Record<string, string> = {
  "ama": "from-purple-600 to-blue-600",
  "workshop": "from-green-600 to-cyan-600",
  "hackathon": "from-orange-600 to-red-600",
  "meetup": "from-blue-600 to-indigo-600",
  "conference": "from-pink-600 to-purple-600",
  "airdrop": "from-yellow-600 to-orange-600",
  "competition": "from-red-600 to-pink-600"
};

const eventButtonColors: Record<string, string> = {
  "ama": "bg-purple-600 hover:bg-purple-700",
  "workshop": "bg-green-600 hover:bg-green-700",
  "hackathon": "bg-orange-600 hover:bg-orange-700",
  "meetup": "bg-blue-600 hover:bg-blue-700",
  "conference": "bg-pink-600 hover:bg-pink-700",
  "airdrop": "bg-yellow-600 hover:bg-yellow-700",
  "competition": "bg-red-600 hover:bg-red-700"
};

export default function EventDetail() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/community/events/:id");
  const eventId = params?.id || "";
  const [isRegistered, setIsRegistered] = useState(false);
  const currentLang = i18n.language;

  const { data: events, isLoading } = useQuery<EventData[]>({
    queryKey: ['/api/community/events'],
  });

  const event = events?.find(e => e.id === eventId);

  const translationItems = useMemo(() => {
    if (!event) return [];
    return [
      { id: `${event.id}-title`, text: event.title },
      { id: `${event.id}-description`, text: event.description }
    ];
  }, [event]);

  const { getTranslation, isTranslating } = useTranslationApi(translationItems, {
    enabled: !!event
  });

  const getLocalizedContent = (evt: EventData, field: 'title' | 'description') => {
    const id = `${evt.id}-${field}`;
    const originalText = field === 'title' ? evt.title : evt.description;
    const koText = field === 'title' ? evt.titleKo : evt.descriptionKo;
    return getTranslation(id, originalText, koText);
  };

  const handleRegister = () => {
    setIsRegistered(true);
    toast({
      title: t('publicPages.community.events.detail.registered'),
      description: t('publicPages.community.events.detail.registeredDesc'),
    });
  };

  const handleNotification = () => {
    toast({
      title: t('publicPages.community.events.detail.notificationSet'),
      description: t('publicPages.community.events.detail.notificationDesc'),
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: t('publicPages.community.events.detail.linkCopied'),
      description: t('publicPages.community.events.detail.shareSuccess'),
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors pt-4 px-6">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors pt-4 px-6">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('publicPages.community.events.detail.notFound')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('publicPages.community.events.detail.notFoundDesc')}
          </p>
          <Button variant="outline" className="border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10" onClick={() => setLocation("/community/events")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('publicPages.community.events.detail.backToEvents')}
            </Button>
        </div>
      </main>
    );
  }

  const title = getLocalizedContent(event, 'title');
  const description = getLocalizedContent(event, 'description');
  const gradient = eventGradients[event.type] || "from-purple-600 to-blue-600";
  const showTranslationBadge = currentLang !== 'en' && currentLang !== 'ko';
  const buttonColor = eventButtonColors[event.type] || "bg-purple-600 hover:bg-purple-700";
  const isKorean = currentLang === 'ko';
  const capacity = { current: event.participants, max: event.maxParticipants || 1000 };
  const capacityPercentage = (capacity.current / capacity.max) * 100;

  const getLocaleForDate = () => {
    const localeMap: Record<string, string> = {
      en: 'en-US', ko: 'ko-KR', zh: 'zh-CN', ja: 'ja-JP',
      es: 'es-ES', fr: 'fr-FR', ru: 'ru-RU', ar: 'ar-SA',
      hi: 'hi-IN', bn: 'bn-BD', pt: 'pt-BR', ur: 'ur-PK'
    };
    return localeMap[currentLang] || 'en-US';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(getLocaleForDate(), { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString(getLocaleForDate(), { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const LocationIcon = event.isOnline ? Video : MapPin;
  const locationType = event.isOnline ? t('publicPages.community.events.detail.online') : t('publicPages.community.events.detail.inPerson');
  const location = event.location || (event.isOnline ? t('publicPages.community.events.detail.onlineLocation') : '');

  const typeLabel = t(`publicPages.community.events.types.${event.type}`);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors">
      <div className={`h-72 bg-gradient-to-r ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto max-w-5xl px-6 h-full flex flex-col justify-end pb-8 relative z-10">
          <Link href="/community/events" className="text-white/80 hover:text-white flex items-center gap-1 text-sm mb-4 transition">
            <ArrowLeft className="w-4 h-4" />
            {t('publicPages.community.events.detail.backToEvents')}
          </Link>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className="bg-white/90 text-black">{typeLabel}</Badge>
            <Badge className="bg-green-500/90 text-white capitalize">{locationType}</Badge>
            {event.status === 'upcoming' && (
              <Badge className="bg-blue-500/90 text-white">{t('publicPages.community.events.detail.upcoming')}</Badge>
            )}
            {showTranslationBadge && (
              <Badge className="bg-cyan-500/90 text-white flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {isTranslating ? t('common.translating') : t('common.translated')}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 font-mono">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(event.startDate)}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatTime(event.startDate)}</span>
            <span className="flex items-center gap-1"><LocationIcon className="w-4 h-4" /> {location}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('publicPages.community.events.detail.about')}
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{description}</p>
              </div>
            </section>

            {event.rewards && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('publicPages.community.events.detail.rewards')}
                </h2>
                <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <span className="text-2xl">🏆</span>
                      </div>
                      <div>
                        <p className="text-yellow-400 font-bold text-xl">{event.rewards}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{t('publicPages.community.events.detail.participantRewards')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white text-lg">
                  {t('publicPages.community.events.detail.registration')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.community.events.detail.registeredCount')}</span>
                  <span className="text-gray-900 dark:text-white font-mono">{capacity.current.toLocaleString()} / {capacity.max.toLocaleString()}</span>
                </div>
                <Progress value={capacityPercentage} className="h-2" />
                <p className="text-xs text-gray-500">
                  {Math.round(100 - capacityPercentage)}% {t('publicPages.community.events.detail.spotsRemaining')}
                </p>

                {isRegistered || event.isRegistered ? (
                  <Button disabled className="w-full bg-green-600">
                    <Users className="w-4 h-4 mr-2" />
                    {t('publicPages.community.events.detail.registered')}
                  </Button>
                ) : (
                  <Button onClick={handleRegister} className={`w-full ${buttonColor}`} data-testid="button-register-event">
                    <Users className="w-4 h-4 mr-2" />
                    {t('publicPages.community.events.detail.register')}
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10" onClick={handleNotification}>
                    <Bell className="w-4 h-4 mr-1" />
                    {t('publicPages.community.events.detail.notify')}
                  </Button>
                  <Button variant="outline" className="flex-1 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-1" />
                    {t('publicPages.community.events.detail.share')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white text-lg">
                  {t('publicPages.community.events.detail.eventDetails')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.community.events.detail.type')}</span>
                  <span className="text-gray-900 dark:text-white">{typeLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.community.events.detail.date')}</span>
                  <span className="text-gray-900 dark:text-white">{formatDate(event.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.community.events.detail.time')}</span>
                  <span className="text-gray-900 dark:text-white">{formatTime(event.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('publicPages.community.events.detail.location')}</span>
                  <span className="text-gray-900 dark:text-white">{locationType}</span>
                </div>
                {event.rewards && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('publicPages.community.events.detail.rewards')}</span>
                    <span className="text-yellow-400">{event.rewards}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
