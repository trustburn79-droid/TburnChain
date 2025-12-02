import { 
  CalendarDays, Filter, Rocket, Code, Calendar, Clock, Bell, 
  Mic, Video, MapPin, GraduationCap, Presentation
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const filterCategories = ["All Events", "Hackathon", "AMA", "Webinar", "Meetup", "Conference"];

const featuredEvents = [
  {
    id: 1,
    type: "Launch Event",
    typeIcon: Rocket,
    title: "V4 Mainnet Launch",
    date: "12/05/2024 • 20:00 KST",
    description: "Celebrate the official mainnet launch of TBurn Chain V4. Live demo, Q&A session with the founders, and a special airdrop event for attendees.",
    capacity: { current: 8542, max: 10000 },
    location: "Online",
    gradient: "from-[#7000ff] to-blue-900",
    buttonColor: "bg-[#00f0ff] text-black hover:bg-cyan-400",
    progressColor: "bg-[#00f0ff]",
    buttonText: "Register Now",
  },
  {
    id: 2,
    type: "Hackathon",
    typeIcon: Code,
    title: "TBurn DeFi Challenge",
    date: "01/10/2025 • 48 Hours",
    description: "Build innovative DeFi applications on TBurn Chain and compete for $100,000 in prizes. Connect with mentors and VCs.",
    capacity: { current: 423, max: 1000 },
    location: "Online",
    gradient: "from-green-600 to-emerald-900",
    buttonColor: "bg-[#00ff9d] text-black hover:bg-green-400",
    progressColor: "bg-[#00ff9d]",
    buttonText: "Apply Now",
  },
];

const upcomingEvents = [
  {
    id: 3,
    type: "AMA Session",
    title: "Founders AMA Session",
    description: "Direct Q&A with Changmin Kim (CEO) & Junhyuk Lee (CTO). Ask anything about the roadmap.",
    date: "12/20",
    time: "21:00 KST",
    location: "Online",
    badgeColor: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    buttonText: "Set Reminder",
  },
  {
    id: 4,
    type: "Webinar",
    title: "Trust Score API Guide",
    description: "Step-by-step developer guide to integrating Trust Score API into your dApp.",
    date: "12/10",
    time: "15:00 KST",
    location: "Zoom",
    badgeColor: "bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/30",
    buttonText: "Register",
  },
  {
    id: 5,
    type: "Meetup",
    title: "Seoul Blockchain Meetup",
    description: "Offline networking event at COEX. Presentations, food, and networking.",
    date: "12/15",
    time: "19:00 KST",
    location: "Seoul",
    badgeColor: "bg-[#7000ff]/20 text-[#7000ff] border-[#7000ff]/30",
    buttonText: "RSVP (Limited)",
  },
  {
    id: 6,
    type: "Seminar",
    title: "Triple-Band AI Deep Dive",
    description: "Technical explanation of how our 3-tier AI system evaluates project reliability.",
    date: "01/15",
    time: "16:00 KST",
    location: "Online",
    badgeColor: "bg-red-500/20 text-red-500 border-red-500/30",
    buttonText: "Register",
  },
  {
    id: 7,
    type: "Training",
    title: "Validator Node Ops",
    description: "Technical workshop on setting up and maintaining a secure validator node.",
    date: "01/25",
    time: "14:00 KST",
    location: "Online",
    badgeColor: "bg-[#ffd700]/20 text-[#ffd700] border-[#ffd700]/30",
    buttonText: "Register",
  },
  {
    id: 8,
    type: "Conference",
    title: "Future of Trust 2025",
    description: "Global conference at Marina Bay Sands. Keynotes, panels, and VIP networking.",
    date: "02/20",
    time: "09:00 SGT",
    location: "Singapore",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    buttonText: "Get Tickets",
    special: true,
  },
];

export default function Events() {
  const [activeFilter, setActiveFilter] = useState("All Events");

  return (
    <main className="flex-grow relative z-10">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-[#7000ff]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00f0ff] mb-6">
            <CalendarDays className="w-3 h-3" /> COMMUNITY_EVENTS
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Events & <span className="text-gradient">Activities</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mb-10">
            Join TBurn Chain community events, hackathons, and conferences. <br />
            Connect with developers and build the future of trust together.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-8 px-6 border-b border-white/5 bg-black/40 sticky top-16 z-40 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl flex items-center gap-4 overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeFilter === cat
                  ? "bg-[#7000ff]/20 border border-[#7000ff] text-white shadow-[0_0_10px_rgba(112,0,255,0.2)]"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:bg-[#7000ff]/20 hover:border-[#7000ff] hover:text-white"
              }`}
              data-testid={`button-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-[#7000ff]" /> Featured Events
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {featuredEvents.map((event) => (
              <div key={event.id} className="spotlight-card rounded-2xl p-0 border border-white/10 overflow-hidden group">
                <div className={`h-48 bg-gradient-to-r ${event.gradient} relative p-6 flex flex-col justify-between`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="bg-white/90 text-black text-xs font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                      <event.typeIcon className="w-3 h-3" /> {event.type}
                    </span>
                    <span className="bg-[#00ff9d] text-black text-xs font-bold px-2 py-1 rounded shadow-lg">{event.location}</span>
                  </div>
                  <div className="relative z-10 text-white">
                    <h3 className="text-2xl font-bold mb-1">{event.title}</h3>
                    <p className="text-sm opacity-90 font-mono flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> {event.date}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">{event.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-500">Capacity</span>
                      <span className="text-[#00f0ff] font-mono">{event.capacity.current.toLocaleString()} / {event.capacity.max.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${event.progressColor} rounded-full transition-all duration-500`} 
                        style={{ width: `${(event.capacity.current / event.capacity.max) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link href={`/community/events/${event.id}`}>
                      <button 
                        className={`flex-1 py-2 rounded ${event.buttonColor} font-bold text-sm transition`}
                        data-testid={`button-register-${event.id}`}
                      >
                        {event.buttonText}
                      </button>
                    </Link>
                    <button className="px-4 py-2 rounded border border-white/20 text-white hover:bg-white/10 transition">
                      <Bell className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-12 px-6 bg-white/5">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-gray-400" /> Upcoming Events
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id} 
                className={`spotlight-card rounded-xl p-6 border border-white/10 flex flex-col ${
                  event.special ? "bg-gradient-to-br from-blue-900/20 to-transparent" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`${event.badgeColor} border px-2 py-1 rounded text-xs font-bold`}>{event.type}</div>
                  <span className="text-gray-500 text-xs font-mono">{event.location}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                <p className="text-gray-400 text-sm mb-4 flex-grow">{event.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-mono mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>
                </div>
                <Link href={`/community/events/${event.id}`}>
                  <button 
                    className={`w-full py-2 rounded text-xs transition ${
                      event.special 
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/50 font-bold hover:bg-blue-600/40" 
                        : "border border-white/20 text-white hover:bg-white/10"
                    }`}
                    data-testid={`button-event-${event.id}`}
                  >
                    {event.buttonText}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host Event CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="spotlight-card rounded-xl p-8 border border-[#00f0ff]/30 text-center bg-gradient-to-b from-[#00f0ff]/5 to-transparent">
            <div className="w-16 h-16 bg-[#00f0ff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mic className="w-8 h-8 text-[#00f0ff]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Want to host an event?</h2>
            <p className="text-gray-400 mb-8">
              Host meetups, webinars, or hackathons with the TBurn Chain community. <br />
              We provide funding, swag, and marketing support.
            </p>
            <Link href="/community/hub">
              <button 
                className="px-8 py-3 rounded-lg bg-[#00f0ff] text-black font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                data-testid="button-apply-host"
              >
                Apply to Host
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
