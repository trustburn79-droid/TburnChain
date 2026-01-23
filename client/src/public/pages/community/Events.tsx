import { 
  CalendarDays, Filter, Rocket, Code, Calendar, Clock, Bell, 
  Mic, Video, MapPin, GraduationCap, Presentation, Loader2, AlertTriangle, Users, Gift, Trophy
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useTranslationApi } from "@/hooks/use-translation-api";

interface EventData {
  id: string;
  title: string;
  titleKo?: string;
  description: string;
  descriptionKo?: string;
  type: 'ama' | 'workshop' | 'hackathon' | 'meetup' | 'airdrop' | 'competition';
  startDate: number;
  endDate: number;
  participants: number;
  maxParticipants?: number;
  rewards?: string;
  status: 'upcoming' | 'live' | 'ended';
  location?: string;
  isOnline: boolean;
  isRegistered?: boolean;
  translationKey?: string;
}

const eventTypeIcons: Record<string, any> = {
  ama: Mic,
  workshop: GraduationCap,
  hackathon: Code,
  meetup: Users,
  airdrop: Gift,
  competition: Trophy,
  webinar: Presentation,
  conference: CalendarDays,
};

const eventGradients: Record<string, string> = {
  ama: "from-amber-600 to-orange-900",
  workshop: "from-blue-600 to-indigo-900",
  hackathon: "from-green-600 to-emerald-900",
  meetup: "from-[#7000ff] to-purple-900",
  airdrop: "from-cyan-600 to-blue-900",
  competition: "from-rose-600 to-red-900",
};

const eventBadgeColors: Record<string, string> = {
  ama: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  workshop: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  hackathon: "bg-green-500/20 text-green-400 border-green-500/30",
  meetup: "bg-[#7000ff]/20 text-[#7000ff] border-[#7000ff]/30",
  airdrop: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  competition: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const eventButtonColors: Record<string, string> = {
  ama: "bg-amber-500 text-black hover:bg-amber-400",
  workshop: "bg-blue-500 text-white hover:bg-blue-400",
  hackathon: "bg-[#00ff9d] text-black hover:bg-green-400",
  meetup: "bg-[#7000ff] text-white hover:bg-purple-500",
  airdrop: "bg-[#00f0ff] text-black hover:bg-cyan-400",
  competition: "bg-rose-500 text-white hover:bg-rose-400",
};

const eventProgressColors: Record<string, string> = {
  ama: "bg-amber-500",
  workshop: "bg-blue-500",
  hackathon: "bg-[#00ff9d]",
  meetup: "bg-[#7000ff]",
  airdrop: "bg-[#00f0ff]",
  competition: "bg-rose-500",
};

export default function Events() {
  const { t, i18n } = useTranslation();
  const [activeFilter, setActiveFilter] = useState("all");
  const { toast } = useToast();

  const currentLang = i18n.language;

  const { data: events, isLoading, error } = useQuery<EventData[]>({
    queryKey: ['/api/community/events'],
    refetchInterval: 30000,
  });

  const translationItems = useMemo(() => {
    if (!events) return [];
    return events.flatMap(event => [
      { id: `${event.id}-title`, text: event.title },
      { id: `${event.id}-description`, text: event.description }
    ]);
  }, [events]);

  const { getTranslation, isTranslating } = useTranslationApi(translationItems, {
    enabled: !!events && events.length > 0
  });

  const getLocalizedContent = (event: EventData, field: 'title' | 'description') => {
    const originalText = field === 'title' ? event.title : event.description;
    const koText = field === 'title' ? event.titleKo : event.descriptionKo;
    return getTranslation(`${event.id}-${field}`, originalText, koText);
  };

  const getLocaleForDate = () => {
    const localeMap: Record<string, string> = {
      en: 'en-US', ko: 'ko-KR', zh: 'zh-CN', ja: 'ja-JP',
      es: 'es-ES', fr: 'fr-FR', ru: 'ru-RU', ar: 'ar-SA',
      hi: 'hi-IN', bn: 'bn-BD', pt: 'pt-BR', ur: 'ur-PK'
    };
    return localeMap[currentLang] || 'en-US';
  };

  const filterCategories = [
    { key: "all", label: t('publicPages.community.events.filters.all') },
    { key: "hackathon", label: t('publicPages.community.events.filters.hackathon') },
    { key: "ama", label: t('publicPages.community.events.filters.ama') },
    { key: "workshop", label: t('publicPages.community.events.filters.webinar') },
    { key: "meetup", label: t('publicPages.community.events.filters.meetup') },
    { key: "competition", label: t('publicPages.community.events.filters.conference') },
  ];

  const filteredEvents = events?.filter(event => {
    return activeFilter === "all" || event.type === activeFilter;
  }) || [];

  const featuredEvents = filteredEvents.filter(e => e.status === 'live' || (e.maxParticipants && e.participants / e.maxParticipants > 0.8)).slice(0, 2);
  const upcomingEvents = filteredEvents.filter(e => e.status === 'upcoming').slice(0, 6);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(getLocaleForDate(), { 
      month: '2-digit', 
      day: '2-digit',
      year: 'numeric'
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

  const getTitle = (event: EventData) => getLocalizedContent(event, 'title');
  const getDescription = (event: EventData) => getLocalizedContent(event, 'description');
  
  const handleNotification = (eventTitle: string) => {
    toast({ title: t('publicPages.community.events.toast.reminderSet'), description: t('publicPages.community.events.toast.reminderDescription', { title: eventTitle }) });
  };

  return (
    <main className="flex-grow relative z-10 bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-gray-200 dark:border-white/5">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <CalendarDays className="w-3 h-3" /> {t('publicPages.community.events.tag')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t('publicPages.community.events.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-10">
            {t('publicPages.community.events.subtitle')}
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-8 px-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/40 sticky top-16 z-40 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl flex items-center gap-4 overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {filterCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveFilter(cat.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeFilter === cat.key
                  ? "bg-[#7000ff]/20 border border-[#7000ff] text-gray-900 dark:text-white shadow-[0_0_10px_rgba(112,0,255,0.2)]"
                  : "bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-[#7000ff]/20 hover:border-[#7000ff] hover:text-gray-900 dark:hover:text-white"
              }`}
              data-testid={`button-filter-${cat.key}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-center gap-3 py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#7000ff]" />
              <span className="text-gray-600 dark:text-gray-400">{t('common.loading')}</span>
            </div>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && (
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <AlertTriangle className="w-10 h-10 text-red-500" />
              <span className="text-gray-600 dark:text-gray-400">{t('common.error')}</span>
            </div>
          </div>
        </section>
      )}

      {/* Featured Events */}
      {!isLoading && !error && featuredEvents.length > 0 && (
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-[#7000ff]" /> {t('publicPages.community.events.featuredTitle')}
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredEvents.map((event) => {
                const Icon = eventTypeIcons[event.type] || Rocket;
                const gradient = eventGradients[event.type] || "from-[#7000ff] to-blue-900";
                const buttonColor = eventButtonColors[event.type] || "bg-[#00f0ff] text-black hover:bg-cyan-400";
                const progressColor = eventProgressColors[event.type] || "bg-[#00f0ff]";
                
                return (
                  <div key={event.id} className="spotlight-card rounded-2xl p-0 border border-gray-300 dark:border-white/10 overflow-hidden group bg-white dark:bg-transparent shadow-sm">
                    <div className={`h-48 bg-gradient-to-r ${gradient} relative p-6 flex flex-col justify-between`}>
                      <div className="absolute inset-0 bg-gray-50 dark:bg-black/20" />
                      <div className="relative z-10 flex justify-between items-start">
                        <span className="bg-white/90 text-black text-xs font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                          <Icon className="w-3 h-3" /> {event.type.toUpperCase()}
                        </span>
                        <span className="bg-[#00ff9d] text-black text-xs font-bold px-2 py-1 rounded shadow-lg">
                          {event.isOnline ? t('publicPages.community.events.locations.online') : event.location}
                        </span>
                      </div>
                      <div className="relative z-10 text-white">
                        <h3 className="text-2xl font-bold mb-1">{getTitle(event)}</h3>
                        <p className="text-sm opacity-90 font-mono flex items-center gap-2">
                          <Calendar className="w-3 h-3" /> {formatDate(event.startDate)} • {formatTime(event.startDate)}
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">{getDescription(event)}</p>
                      
                      {event.maxParticipants && (
                        <div className="mb-6">
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-gray-500">{t('publicPages.community.events.capacity')}</span>
                            <span className="text-[#00f0ff] font-mono">{event.participants.toLocaleString()} / {event.maxParticipants.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${progressColor} rounded-full transition-all duration-500`} 
                              style={{ width: `${Math.min((event.participants / event.maxParticipants) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {event.rewards && (
                        <div className="mb-4 flex items-center gap-2 text-sm">
                          <Gift className="w-4 h-4 text-[#ffd700]" />
                          <span className="text-[#ffd700] font-mono">{event.rewards}</span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Link href={`/community/events/${event.id}`} className="flex-1">
                          <button 
                            className={`w-full py-2 rounded ${buttonColor} font-bold text-sm transition`}
                            data-testid={`button-register-${event.id}`}
                          >
                            {event.isRegistered ? t('publicPages.community.events.buttons.registered') : t('publicPages.community.events.buttons.registerNow')}
                          </button>
                        </Link>
                        <button 
                          className="px-4 py-2 rounded border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
                          onClick={() => handleNotification(getTitle(event))}
                          data-testid={`button-notify-${event.id}`}
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {!isLoading && !error && upcomingEvents.length > 0 && (
        <section className="py-12 px-6 bg-gray-100 dark:bg-white/5">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-gray-600 dark:text-gray-400" /> {t('publicPages.community.events.upcomingTitle')}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => {
                const badgeColor = eventBadgeColors[event.type] || "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
                
                return (
                  <div 
                    key={event.id} 
                    className="spotlight-card rounded-xl p-6 border border-gray-300 dark:border-white/10 flex flex-col bg-white dark:bg-transparent shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`${badgeColor} border px-2 py-1 rounded text-xs font-bold`}>{event.type.toUpperCase()}</div>
                      <span className="text-gray-500 text-xs font-mono">
                        {event.isOnline ? t('publicPages.community.events.locations.online') : event.location}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{getTitle(event)}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow line-clamp-2">{getDescription(event)}</p>
                    
                    {event.rewards && (
                      <div className="mb-3 flex items-center gap-2 text-xs">
                        <Gift className="w-3 h-3 text-[#ffd700]" />
                        <span className="text-[#ffd700] font-mono">{event.rewards}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-mono mb-4">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(event.startDate)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(event.startDate)}</span>
                    </div>
                    <Link href={`/community/events/${event.id}`}>
                      <button 
                        className="w-full py-2 rounded text-xs transition border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                        data-testid={`button-event-${event.id}`}
                      >
                        {t('publicPages.community.events.buttons.register')}
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredEvents.length === 0 && (
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <CalendarDays className="w-10 h-10 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">{t('adminCommunityContent.noEventsFound')}</span>
            </div>
          </div>
        </section>
      )}

      {/* Host Event CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="spotlight-card rounded-xl p-8 border border-[#00f0ff]/30 text-center bg-white dark:bg-transparent shadow-sm bg-gradient-to-b from-[#00f0ff]/5 to-transparent">
            <div className="w-16 h-16 bg-[#00f0ff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mic className="w-8 h-8 text-[#00f0ff]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('publicPages.community.events.hostCta.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t('publicPages.community.events.hostCta.description')}
            </p>
            <Link href="/community/hub">
              <button 
                className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                data-testid="button-apply-host"
              >
                {t('publicPages.community.events.hostCta.button')}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
