import { Link, useRoute } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Share2, Bell, ExternalLink, CheckCircle, Video, Globe, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const events: Record<string, {
  id: string;
  title: string;
  description: string;
  fullDescription: string[];
  date: string;
  time: string;
  timezone: string;
  location: string;
  locationType: "virtual" | "in-person" | "hybrid";
  type: string;
  capacity: { current: number; max: number };
  speakers: { name: string; role: string; avatar: string }[];
  agenda: { time: string; title: string; speaker?: string }[];
  requirements: string[];
  gradient: string;
  buttonColor: string;
}> = {
  "1": {
    id: "1",
    title: "TBURN v7.0 Mainnet Launch Event",
    description: "Join us for the official launch celebration of TBURN v7.0 mainnet with live demonstrations and Q&A.",
    fullDescription: [
      "Be part of history as we officially launch TBURN v7.0 mainnet! This virtual event will feature live demonstrations of our revolutionary AI-enhanced blockchain technology.",
      "The TBURN Core Team will walk you through the key features of v7.0, including our Triple-Band AI Orchestration system, Dynamic Sharding, and the comprehensive DeFi ecosystem.",
      "Attendees will have the opportunity to ask questions directly to our developers and learn how to get started with TBURN v7.0."
    ],
    date: "December 3, 2024",
    time: "14:00 - 16:00",
    timezone: "UTC",
    location: "Virtual Event (Zoom)",
    locationType: "virtual",
    type: "Launch Event",
    capacity: { current: 2847, max: 5000 },
    speakers: [
      { name: "Alex Park", role: "CEO & Founder", avatar: "AP" },
      { name: "Dr. Sarah Chen", role: "Chief AI Architect", avatar: "SC" },
      { name: "Michael Rodriguez", role: "DeFi Product Lead", avatar: "MR" },
    ],
    agenda: [
      { time: "14:00", title: "Welcome & Introduction", speaker: "Alex Park" },
      { time: "14:15", title: "TBURN v7.0 Technical Overview" },
      { time: "14:45", title: "AI Orchestration Deep Dive", speaker: "Dr. Sarah Chen" },
      { time: "15:15", title: "DeFi Ecosystem Demo", speaker: "Michael Rodriguez" },
      { time: "15:45", title: "Live Q&A Session" },
    ],
    requirements: [
      "Stable internet connection",
      "Zoom client installed",
      "Questions ready for Q&A",
    ],
    gradient: "from-purple-600 to-blue-600",
    buttonColor: "bg-purple-600 hover:bg-purple-700"
  },
  "2": {
    id: "2",
    title: "Developer Workshop: Building on TBURN",
    description: "Hands-on workshop for developers to learn smart contract development on TBURN v7.0.",
    fullDescription: [
      "This intensive workshop is designed for developers who want to build decentralized applications on TBURN v7.0.",
      "You'll learn about our enhanced token standards (TBC-20, TBC-721, TBC-1155), smart contract best practices, and how to integrate with our AI-powered APIs.",
      "By the end of this workshop, you'll have deployed your first smart contract on TBURN testnet and understand the full development lifecycle."
    ],
    date: "December 5, 2024",
    time: "10:00 - 14:00",
    timezone: "UTC",
    location: "Virtual Workshop",
    locationType: "virtual",
    type: "Workshop",
    capacity: { current: 189, max: 500 },
    speakers: [
      { name: "James Liu", role: "Lead Developer", avatar: "JL" },
      { name: "Emma Wilson", role: "Developer Relations", avatar: "EW" },
    ],
    agenda: [
      { time: "10:00", title: "Environment Setup & Prerequisites" },
      { time: "10:30", title: "TBURN SDK Introduction", speaker: "James Liu" },
      { time: "11:30", title: "Smart Contract Development" },
      { time: "12:30", title: "Lunch Break" },
      { time: "13:00", title: "Testing & Deployment", speaker: "Emma Wilson" },
      { time: "13:45", title: "Q&A and Wrap-up" },
    ],
    requirements: [
      "Node.js 18+ installed",
      "Basic Solidity knowledge",
      "Code editor (VS Code recommended)",
      "GitHub account",
    ],
    gradient: "from-green-600 to-cyan-600",
    buttonColor: "bg-green-600 hover:bg-green-700"
  },
  "3": {
    id: "3",
    title: "TBURN Community AMA",
    description: "Monthly Ask Me Anything session with the TBURN team. Submit your questions!",
    fullDescription: [
      "Join our monthly community AMA where the TBURN team answers your burning questions!",
      "This is your opportunity to get insights directly from the team about roadmap updates, technical decisions, and community initiatives.",
      "Questions can be submitted in advance through our Discord or asked live during the session."
    ],
    date: "December 10, 2024",
    time: "18:00 - 19:30",
    timezone: "UTC",
    location: "Discord Voice Channel",
    locationType: "virtual",
    type: "AMA",
    capacity: { current: 456, max: 1000 },
    speakers: [
      { name: "Alex Park", role: "CEO & Founder", avatar: "AP" },
      { name: "Community Team", role: "Moderators", avatar: "CT" },
    ],
    agenda: [
      { time: "18:00", title: "Welcome & Updates" },
      { time: "18:15", title: "Pre-submitted Questions" },
      { time: "18:45", title: "Live Questions from Community" },
      { time: "19:15", title: "Closing Remarks & Announcements" },
    ],
    requirements: [
      "Discord account",
      "Join TBURN Discord server",
    ],
    gradient: "from-orange-600 to-red-600",
    buttonColor: "bg-orange-600 hover:bg-orange-700"
  },
  "4": {
    id: "4",
    title: "Validator Onboarding Session",
    description: "Learn how to become a TBURN validator and start earning rewards.",
    fullDescription: [
      "Interested in running a validator node on TBURN? This session covers everything you need to know.",
      "We'll walk through hardware requirements, setup procedures, staking requirements, and the economics of being a validator.",
      "Our team will also explain the 3-tier validator system and how AI Trust Scores affect your rewards."
    ],
    date: "December 12, 2024",
    time: "15:00 - 17:00",
    timezone: "UTC",
    location: "Virtual Event",
    locationType: "virtual",
    type: "Onboarding",
    capacity: { current: 78, max: 200 },
    speakers: [
      { name: "David Kim", role: "Infrastructure Lead", avatar: "DK" },
      { name: "Lisa Zhang", role: "Validator Relations", avatar: "LZ" },
    ],
    agenda: [
      { time: "15:00", title: "Introduction to TBURN Validation" },
      { time: "15:30", title: "Technical Requirements & Setup", speaker: "David Kim" },
      { time: "16:00", title: "Economics & Rewards", speaker: "Lisa Zhang" },
      { time: "16:30", title: "Live Demo & Q&A" },
    ],
    requirements: [
      "Basic understanding of blockchain",
      "Interest in running infrastructure",
      "Minimum stake requirement: 100,000 TBURN",
    ],
    gradient: "from-blue-600 to-indigo-600",
    buttonColor: "bg-blue-600 hover:bg-blue-700"
  }
};

export default function EventDetail() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, params] = useRoute("/community/events/:id");
  const eventId = params?.id || "";
  const [isRegistered, setIsRegistered] = useState(false);

  const event = events[eventId];

  const handleRegister = () => {
    setIsRegistered(true);
    toast({
      title: t('publicPages.community.events.detail.registered', 'Registration Successful!'),
      description: t('publicPages.community.events.detail.registeredDesc', 'You have been registered for this event. Check your email for details.'),
    });
  };

  const handleNotification = () => {
    toast({
      title: t('publicPages.community.events.detail.notificationSet', 'Reminder Set!'),
      description: t('publicPages.community.events.detail.notificationDesc', 'We will notify you before the event starts.'),
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: t('publicPages.community.events.detail.linkCopied', 'Link copied!'),
      description: t('publicPages.community.events.detail.shareSuccess', 'Event link copied to clipboard'),
    });
  };

  if (!event) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] pt-24 px-6">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <h1 className="text-3xl font-bold text-white mb-4">
            {t('publicPages.community.events.detail.notFound', 'Event Not Found')}
          </h1>
          <p className="text-gray-400 mb-8">
            {t('publicPages.community.events.detail.notFoundDesc', 'The event you are looking for does not exist or has ended.')}
          </p>
          <Link href="/community/events">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('publicPages.community.events.detail.backToEvents', 'Back to Events')}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const LocationIcon = event.locationType === "virtual" ? Video : event.locationType === "hybrid" ? Globe : MapPin;
  const capacityPercentage = (event.capacity.current / event.capacity.max) * 100;

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className={`h-72 bg-gradient-to-r ${event.gradient} relative`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto max-w-5xl px-6 h-full flex flex-col justify-end pb-8 relative z-10">
          <Link href="/community/events" className="text-white/80 hover:text-white flex items-center gap-1 text-sm mb-4 transition">
            <ArrowLeft className="w-4 h-4" />
            {t('publicPages.community.events.detail.backToEvents', 'Back to Events')}
          </Link>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className="bg-white/90 text-black">{event.type}</Badge>
            <Badge className="bg-green-500/90 text-white capitalize">{event.locationType}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 font-mono">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {event.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {event.time} {event.timezone}</span>
            <span className="flex items-center gap-1"><LocationIcon className="w-4 h-4" /> {event.location}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">
                {t('publicPages.community.events.detail.about', 'About This Event')}
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-gray-300 leading-relaxed mb-4">{event.description}</p>
                {event.fullDescription.map((paragraph, index) => (
                  <p key={index} className="text-gray-400 leading-relaxed mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">
                {t('publicPages.community.events.detail.agenda', 'Event Agenda')}
              </h2>
              <div className="space-y-3">
                {event.agenda.map((item, index) => (
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
                {t('publicPages.community.events.detail.speakers', 'Speakers')}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {event.speakers.map((speaker, index) => (
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
                {t('publicPages.community.events.detail.requirements', 'Requirements')}
              </h2>
              <ul className="space-y-2">
                {event.requirements.map((req, index) => (
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
                  {t('publicPages.community.events.detail.registration', 'Registration')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">{t('publicPages.community.events.detail.spots', 'Spots Filled')}</span>
                    <span className="text-white font-mono">
                      {event.capacity.current.toLocaleString()} / {event.capacity.max.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={capacityPercentage} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(capacityPercentage)}% {t('publicPages.community.events.detail.full', 'full')}
                  </p>
                </div>

                <div className="space-y-3">
                  {isRegistered ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('publicPages.community.events.detail.registeredButton', 'Registered')}
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full ${event.buttonColor}`}
                      onClick={handleRegister}
                      data-testid="button-register"
                    >
                      {t('publicPages.community.events.detail.registerButton', 'Register Now')}
                    </Button>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                      onClick={handleNotification}
                      data-testid="button-notify"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      {t('publicPages.community.events.detail.remind', 'Remind Me')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={handleShare}
                      data-testid="button-share"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-white mb-3">
                    {t('publicPages.community.events.detail.eventDetails', 'Event Details')}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      {event.time} {event.timezone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <LocationIcon className="w-4 h-4" />
                      {event.location}
                    </div>
                  </div>
                </div>

                <Link href="/community/hub">
                  <Button variant="ghost" className="w-full text-purple-400 hover:text-purple-300 p-0">
                    {t('publicPages.community.events.detail.hostEvent', 'Want to host an event?')}
                    <ExternalLink className="w-3 h-3 ml-1" />
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
