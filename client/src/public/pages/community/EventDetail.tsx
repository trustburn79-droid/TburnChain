import { Link, useRoute } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Share2, Bell, ExternalLink, CheckCircle, Video, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const eventIds = ["1", "2", "3", "4"];

const eventGradients: Record<string, string> = {
  "1": "from-purple-600 to-blue-600",
  "2": "from-green-600 to-cyan-600",
  "3": "from-orange-600 to-red-600",
  "4": "from-blue-600 to-indigo-600"
};

const eventButtonColors: Record<string, string> = {
  "1": "bg-purple-600 hover:bg-purple-700",
  "2": "bg-green-600 hover:bg-green-700",
  "3": "bg-orange-600 hover:bg-orange-700",
  "4": "bg-blue-600 hover:bg-blue-700"
};

const eventCapacities: Record<string, { current: number; max: number }> = {
  "1": { current: 2847, max: 5000 },
  "2": { current: 189, max: 500 },
  "3": { current: 456, max: 1000 },
  "4": { current: 78, max: 200 }
};

export default function EventDetail() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, params] = useRoute("/community/events/:id");
  const eventId = params?.id || "";
  const [isRegistered, setIsRegistered] = useState(false);

  const isValidEvent = eventIds.includes(eventId);
  const gradient = eventGradients[eventId] || "from-purple-600 to-blue-600";
  const buttonColor = eventButtonColors[eventId] || "bg-purple-600 hover:bg-purple-700";
  const capacity = eventCapacities[eventId] || { current: 0, max: 100 };

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

  if (!isValidEvent) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] pt-24 px-6">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <h1 className="text-3xl font-bold text-white mb-4">
            {t('publicPages.community.events.detail.notFound')}
          </h1>
          <p className="text-gray-400 mb-8">
            {t('publicPages.community.events.detail.notFoundDesc')}
          </p>
          <Link href="/community/events">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('publicPages.community.events.detail.backToEvents')}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const eventKey = `publicPages.community.events.detail.events.${eventId}`;
  const title = t(`${eventKey}.title`);
  const description = t(`${eventKey}.description`);
  const date = t(`${eventKey}.date`);
  const time = t(`${eventKey}.time`);
  const timezone = t(`${eventKey}.timezone`);
  const location = t(`${eventKey}.location`);
  const locationType = t(`${eventKey}.locationType`);
  const type = t(`${eventKey}.type`);

  const fullDescriptionArray: string[] = [];
  for (let i = 0; i < 5; i++) {
    const desc = t(`${eventKey}.fullDescription.${i}`, { defaultValue: '' });
    if (desc && desc !== `${eventKey}.fullDescription.${i}`) {
      fullDescriptionArray.push(desc);
    }
  }

  const speakersArray: { name: string; role: string; avatar: string }[] = [];
  for (let i = 0; i < 5; i++) {
    const name = t(`${eventKey}.speakers.${i}.name`, { defaultValue: '' });
    if (name && name !== `${eventKey}.speakers.${i}.name`) {
      speakersArray.push({
        name,
        role: t(`${eventKey}.speakers.${i}.role`),
        avatar: t(`${eventKey}.speakers.${i}.avatar`)
      });
    }
  }

  const agendaArray: { time: string; title: string; speaker?: string }[] = [];
  for (let i = 0; i < 10; i++) {
    const agendaTime = t(`${eventKey}.agenda.${i}.time`, { defaultValue: '' });
    if (agendaTime && agendaTime !== `${eventKey}.agenda.${i}.time`) {
      const speaker = t(`${eventKey}.agenda.${i}.speaker`, { defaultValue: '' });
      agendaArray.push({
        time: agendaTime,
        title: t(`${eventKey}.agenda.${i}.title`),
        speaker: speaker && speaker !== `${eventKey}.agenda.${i}.speaker` ? speaker : undefined
      });
    }
  }

  const requirementsArray: string[] = [];
  for (let i = 0; i < 6; i++) {
    const req = t(`${eventKey}.requirements.${i}`, { defaultValue: '' });
    if (req && req !== `${eventKey}.requirements.${i}`) {
      requirementsArray.push(req);
    }
  }

  const LocationIcon = locationType === "virtual" ? Video : locationType === "hybrid" ? Globe : MapPin;
  const capacityPercentage = (capacity.current / capacity.max) * 100;

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className={`h-72 bg-gradient-to-r ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto max-w-5xl px-6 h-full flex flex-col justify-end pb-8 relative z-10">
          <Link href="/community/events" className="text-white/80 hover:text-white flex items-center gap-1 text-sm mb-4 transition">
            <ArrowLeft className="w-4 h-4" />
            {t('publicPages.community.events.detail.backToEvents')}
          </Link>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className="bg-white/90 text-black">{type}</Badge>
            <Badge className="bg-green-500/90 text-white capitalize">{locationType}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 font-mono">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {date}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {time} {timezone}</span>
            <span className="flex items-center gap-1"><LocationIcon className="w-4 h-4" /> {location}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">
                {t('publicPages.community.events.detail.about')}
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-gray-300 leading-relaxed mb-4">{description}</p>
                {fullDescriptionArray.map((paragraph, index) => (
                  <p key={index} className="text-gray-400 leading-relaxed mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">
                {t('publicPages.community.events.detail.agenda')}
              </h2>
              <div className="space-y-3">
                {agendaArray.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-purple-400 font-mono text-sm whitespace-nowrap">{item.time}</span>
                    <div>
                      <p className="text-white font-medium">{item.title}</p>
                      {item.speaker && <p className="text-sm text-gray-400">{item.speaker}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">
                {t('publicPages.community.events.detail.speakers')}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {speakersArray.map((speaker, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {speaker.avatar}
                    </div>
                    <div>
                      <p className="text-white font-medium">{speaker.name}</p>
                      <p className="text-sm text-gray-400">{speaker.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">
                {t('publicPages.community.events.detail.requirements')}
              </h2>
              <ul className="space-y-2">
                {requirementsArray.map((req, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {req}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t('publicPages.community.events.detail.registration')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">{t('publicPages.community.events.detail.spotsFilled')}</span>
                    <span className="text-white font-mono">{capacity.current.toLocaleString()} / {capacity.max.toLocaleString()}</span>
                  </div>
                  <Progress value={capacityPercentage} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{Math.round(capacityPercentage)}% {t('publicPages.community.events.detail.full')}</p>
                </div>

                {isRegistered ? (
                  <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-green-400 font-medium">{t('publicPages.community.events.detail.youAreRegistered')}</p>
                  </div>
                ) : (
                  <Button className={`w-full ${buttonColor} text-white`} onClick={handleRegister} data-testid="button-register">
                    {t('publicPages.community.events.detail.registerNow')}
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10" onClick={handleNotification} data-testid="button-remind">
                    <Bell className="w-4 h-4 mr-2" />
                    {t('publicPages.community.events.detail.remindMe')}
                  </Button>
                  <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10" onClick={handleShare} data-testid="button-share">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white font-medium mb-3">{t('publicPages.community.events.detail.eventDetails')}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{time} {timezone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <LocationIcon className="w-4 h-4" />
                      <span>{location}</span>
                    </div>
                  </div>
                </div>

                <Link href="/community/events" className="block">
                  <Button variant="ghost" className="w-full text-purple-400 hover:text-purple-300">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('publicPages.community.events.detail.wantToHost')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
