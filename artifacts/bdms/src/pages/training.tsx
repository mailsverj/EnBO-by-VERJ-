import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Download, ChevronRight, CheckCircle2, Circle, Sun, Zap,
  Users, TrendingUp, ClipboardCheck, Award, Shield, Menu, X, Printer
} from 'lucide-react';
import logoPath from '@assets/Copy_of_Modern_Cabinet_Furniture_Product_1786754353697.png';
import heroImg from '@assets/training-hero.jpg';
import solarBasicsImg from '@assets/training-solar-basics.jpg';
import salesImg from '@assets/training-sales.jpg';
import productsImg from '@assets/training-products.jpg';
import teamImg from '@assets/training-team.jpg';

interface Chapter {
  id: string;
  title: string;
  icon: React.ElementType;
  readTime: string;
}

const CHAPTERS: Chapter[] = [
  { id: 'welcome', title: 'Welcome to VERJ SOLAR', icon: Sun, readTime: '5 min' },
  { id: 'solar-fundamentals', title: 'Solar Energy Fundamentals', icon: Zap, readTime: '10 min' },
  { id: 'verj-products', title: 'VERJ Products & Solutions', icon: BookOpen, readTime: '8 min' },
  { id: 'bdo-role', title: 'Your Role as a VERJ BDO', icon: Users, readTime: '7 min' },
  { id: 'sales-process', title: 'Lead Generation & Sales', icon: TrendingUp, readTime: '12 min' },
  { id: 'customer-assessment', title: 'Customer Needs Assessment', icon: ClipboardCheck, readTime: '9 min' },
  { id: 'onboarding-workflow', title: 'BDO Onboarding Workflow', icon: Award, readTime: '6 min' },
  { id: 'professional-standards', title: 'Professional Standards', icon: Shield, readTime: '5 min' },
];

export default function Training() {
  const [activeChapter, setActiveChapter] = useState('welcome');
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const isPublic = !document.cookie.includes('connect.sid');

  useEffect(() => {
    const stored = localStorage.getItem('verj_read_chapters');
    if (stored) setReadChapters(new Set(JSON.parse(stored)));
  }, []);

  const markRead = (id: string) => {
    setReadChapters(prev => {
      const next = new Set(prev).add(id);
      localStorage.setItem('verj_read_chapters', JSON.stringify([...next]));
      return next;
    });
  };

  const goToChapter = (id: string) => {
    setActiveChapter(id);
    markRead(id);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentIdx = CHAPTERS.findIndex(c => c.id === activeChapter);
  const progress = Math.round((readChapters.size / CHAPTERS.length) * 100);

  const handlePrint = () => {
    window.open(`${(import.meta.env.BASE_URL ?? '/').replace(/\/$/, '')}/training/workbook`, '_blank');
  };

  const Header = () => (
    <div className="h-14 bg-[#111] border-b border-white/10 flex items-center px-5 gap-3 flex-shrink-0 z-20">
      <button onClick={() => setSidebarOpen(v => !v)} className="text-white/60 hover:text-white mr-1">
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>
      <img src={logoPath} alt="VERJ" className="h-7 object-contain"
        style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(96%) saturate(600%) hue-rotate(2deg) brightness(105%)' }} />
      <span className="text-white font-bold tracking-wide text-sm">BDO Training Workbook</span>
      <div className="flex-1" />
      <div className="hidden sm:flex items-center gap-2 text-xs text-white/50">
        <span>{readChapters.size}/{CHAPTERS.length} chapters read</span>
        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <Button size="sm" variant="outline" className="ml-3 border-white/20 text-white hover:bg-white/10 text-xs gap-1.5" onClick={handlePrint}>
        <Printer className="h-3 w-3" /> Download PDF
      </Button>
      {!isPublic && (
        <Link href="/assessment">
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs gap-1.5 ml-1">
            Take Assessment <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0f0f0f]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 bg-[#161616] border-r border-white/10 flex flex-col flex-shrink-0 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Contents</div>
              <Progress value={progress} className="h-1 bg-white/10 [&>div]:bg-amber-400" />
              <div className="text-xs text-white/40 mt-1">{progress}% complete</div>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {CHAPTERS.map((ch, i) => {
                const isActive = ch.id === activeChapter;
                const isRead = readChapters.has(ch.id);
                return (
                  <button
                    key={ch.id}
                    onClick={() => goToChapter(ch.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${isActive ? 'bg-amber-500/10 border-r-2 border-amber-400' : 'hover:bg-white/5'}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isRead
                        ? <CheckCircle2 className={`h-3.5 w-3.5 ${isActive ? 'text-amber-400' : 'text-green-500'}`} />
                        : <Circle className="h-3.5 w-3.5 text-white/20" />}
                    </div>
                    <div>
                      <div className="text-xs text-white/30 mb-0.5">{String(i + 1).padStart(2, '0')}</div>
                      <div className={`text-sm leading-snug ${isActive ? 'text-amber-300 font-medium' : 'text-white/60'}`}>{ch.title}</div>
                      <div className="text-xs text-white/25 mt-0.5">{ch.readTime}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content area */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">
            <ChapterContent id={activeChapter} />
            {/* Chapter navigation */}
            <div className="flex justify-between mt-16 pt-8 border-t border-white/10">
              {currentIdx > 0 ? (
                <Button variant="outline" className="border-white/20 text-white/60 hover:bg-white/5 hover:text-white gap-2"
                  onClick={() => goToChapter(CHAPTERS[currentIdx - 1].id)}>
                  ← {CHAPTERS[currentIdx - 1].title}
                </Button>
              ) : <div />}
              {currentIdx < CHAPTERS.length - 1 ? (
                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2"
                  onClick={() => goToChapter(CHAPTERS[currentIdx + 1].id)}>
                  {CHAPTERS[currentIdx + 1].title} →
                </Button>
              ) : (
                <Link href="/assessment">
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold gap-2">
                    <Award className="h-4 w-4" /> Take Assessment
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
        <span className="w-1 h-6 bg-amber-400 rounded-full flex-shrink-0" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function Callout({ type, children }: { type: 'tip' | 'warning' | 'key'; children: React.ReactNode }) {
  const styles = {
    tip: 'bg-amber-500/10 border-amber-400/30 text-amber-200',
    warning: 'bg-red-500/10 border-red-400/30 text-red-200',
    key: 'bg-blue-500/10 border-blue-400/30 text-blue-200',
  }[type];
  const labels = { tip: '💡 Tip', warning: '⚠️ Important', key: '🔑 Key Concept' }[type];
  return (
    <div className={`border rounded-lg p-4 my-4 text-sm leading-relaxed ${styles}`}>
      <div className="font-semibold mb-1">{labels}</div>
      {children}
    </div>
  );
}

function KeyTerm({ term, def }: { term: string; def: string }) {
  return (
    <div className="flex gap-3 py-3 border-b border-white/5">
      <span className="text-amber-400 font-semibold text-sm w-36 flex-shrink-0">{term}</span>
      <span className="text-white/60 text-sm leading-relaxed">{def}</span>
    </div>
  );
}

function ChapterContent({ id }: { id: string }) {
  const bodyClass = "text-white/70 leading-relaxed text-sm md:text-base";
  const h3Class = "text-white font-semibold text-base mt-6 mb-3";
  const liClass = "text-white/65 text-sm leading-relaxed";
  const imgClass = "w-full rounded-xl object-cover my-6 shadow-2xl";

  if (id === 'welcome') return (
    <div>
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-400/30 mb-4">Chapter 1</Badge>
      <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">Welcome to<br /><span className="text-amber-400">VERJ SOLAR</span></h1>
      <p className="text-white/40 text-sm mb-8">The start of your journey as a VERJ Business Development Officer</p>
      <img src={heroImg} alt="VERJ Solar BDO" className={imgClass} style={{ height: 360 }} />
      <Section title="Who We Are">
        <p className={bodyClass}>VERJ SOLAR is a Nigerian renewable energy company committed to powering homes, businesses, and communities with reliable, clean, and affordable solar solutions. We operate across Nigeria, bringing world-class solar technology to every corner of the country through our nationwide network of Business Development Officers — people like you.</p>
        <p className={`${bodyClass} mt-4`}>Our mission is simple: <strong className="text-white">to redefine the limit of what is possible</strong> for every Nigerian family and business through the power of the sun.</p>
      </Section>
      <Section title="Why BDOs Matter">
        <p className={bodyClass}>At VERJ, our BDOs are not just salespeople. You are the face of VERJ in your community. You are an energy ambassador — someone who educates, inspires, and empowers people to take control of their power supply. The impact you create outlasts any single sale.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {[
            { title: 'Community Impact', body: 'Every system you sell frees a family from generator fuel costs and unstable grid power.' },
            { title: 'Career Growth', body: 'VERJ BDOs grow into senior roles — Team Leads, Area Managers, and beyond.' },
            { title: 'Earnings Potential', body: 'Your income is directly linked to your performance. The sky is your limit.' },
          ].map(c => (
            <div key={c.title} className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="text-amber-400 font-bold text-sm mb-2">{c.title}</div>
              <div className="text-white/55 text-sm leading-relaxed">{c.body}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Our Core Values">
        <ul className="space-y-2 mt-2">
          {['Integrity — We do what is right, always.', 'Excellence — We deliver the best, not the easiest.', 'Customer-First — The customer\'s success is our success.', 'Innovation — We embrace better ways of doing things.', 'Accountability — We own our results.'].map(v => (
            <li key={v} className="flex items-start gap-2"><span className="text-amber-400 mt-0.5 flex-shrink-0">▸</span><span className={liClass}>{v}</span></li>
          ))}
        </ul>
      </Section>
      <Callout type="key">As a VERJ BDO, you represent the brand at all times. Everything you say, wear, and do reflects on VERJ. This is not just a job — it is a responsibility.</Callout>
    </div>
  );

  if (id === 'solar-fundamentals') return (
    <div>
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-400/30 mb-4">Chapter 2</Badge>
      <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">Solar Energy<br /><span className="text-amber-400">Fundamentals</span></h1>
      <p className="text-white/40 text-sm mb-8">Understanding how solar works so you can explain it confidently to any customer</p>
      <img src={solarBasicsImg} alt="Nigerian home with solar power" className={imgClass} style={{ height: 340 }} />
      <Section title="How Solar Power Works">
        <p className={bodyClass}>A solar energy system converts sunlight into electricity using photovoltaic (PV) panels. This electricity is then stored in batteries and/or used directly to power your home. An inverter converts the DC electricity from panels and batteries into AC electricity that your appliances use.</p>
        <p className={`${bodyClass} mt-4`}>Nigeria receives an average of 5–7 hours of peak sunlight daily — one of the highest solar radiation levels in the world. This makes solar an exceptionally powerful and economical energy solution for Nigerian homes and businesses.</p>
      </Section>
      <Section title="Key Components">
        <div className="space-y-4 mt-2">
          {[
            { name: 'Solar Panels (PV Modules)', desc: 'Capture sunlight and convert it to DC electricity. Measured in Watts (W) or Kilowatts (kW). Common residential sizes: 400W–600W per panel.' },
            { name: 'Inverter', desc: 'The brain of the system. Converts DC power from panels/batteries into AC power for your appliances. Also manages charging and discharging. Choose the right inverter for your load.' },
            { name: 'Battery Bank', desc: 'Stores energy for use at night or when there is no sun. Capacity is measured in kilowatt-hours (kWh). Modern lithium batteries (LiFePO4) offer high depth of discharge (80–100%) and long life (3,000+ cycles).' },
            { name: 'Charge Controller', desc: 'Regulates the voltage and current from solar panels to the battery, preventing overcharging. Modern hybrid inverters often have this built in.' },
            { name: 'Wiring & Protection', desc: 'DC and AC cabling, circuit breakers, surge protectors (SPD), and earthing equipment to ensure safe operation.' },
          ].map(c => (
            <div key={c.name} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white font-semibold text-sm mb-1">{c.name}</div>
              <div className="text-white/55 text-sm leading-relaxed">{c.desc}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Key Terms You Must Know">
        <div className="bg-white/3 rounded-xl border border-white/10 overflow-hidden">
          {[
            { term: 'PV', def: 'Photovoltaic — the technology that converts sunlight directly into electricity.' },
            { term: 'kWh', def: 'Kilowatt-hour — the unit for measuring electrical energy. 1 kWh = running a 1,000W appliance for 1 hour.' },
            { term: 'kWp', def: 'Kilowatt-peak — the rated output of solar panels under standard test conditions.' },
            { term: 'DoD', def: 'Depth of Discharge — how much of a battery\'s capacity can safely be used. LiFePO4 batteries typically allow 80–100% DoD.' },
            { term: 'LiFePO4', def: 'Lithium Iron Phosphate — the preferred battery chemistry for modern solar systems. Safe, long-lasting, and high-performance.' },
            { term: 'Off-grid', def: 'A system completely independent from the national grid, relying entirely on solar and batteries.' },
            { term: 'Hybrid', def: 'A system that can work with solar, batteries, AND the grid or generator as a backup.' },
          ].map(t => <KeyTerm key={t.term} {...t} />)}
        </div>
      </Section>
      <Section title="VERJ Sizing Formulas (Critical)">
        <Callout type="warning">These formulas are used by VERJ engineers and will appear in your assessment. You must understand them — not just memorise them.</Callout>
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-5 border border-amber-400/20">
            <div className="text-amber-400 font-bold mb-2">Battery Capacity Formula</div>
            <div className="text-white text-lg font-mono bg-black/30 rounded-lg p-3 mb-3">Total Night-time Load Energy × 1.25</div>
            <p className="text-white/55 text-sm">Night-time load energy = total energy consumed by appliances used after dark. The 1.25 factor adds a 25% safety buffer.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-5 border border-amber-400/20">
            <div className="text-amber-400 font-bold mb-2">PV (Solar Panel) Formula</div>
            <div className="text-white text-lg font-mono bg-black/30 rounded-lg p-3 mb-3">(Total Battery Size ÷ 6 + Total Load) × 1.67</div>
            <p className="text-white/55 text-sm">This ensures the panels can charge the battery in ~6 hours AND cover the live load simultaneously, with a 67% system efficiency buffer.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-5 border border-amber-400/20">
            <div className="text-amber-400 font-bold mb-2">Inverter Selection</div>
            <p className="text-white/55 text-sm">Select the inverter from inventory within a 5 kW tolerance of the calculated load. If no matching inverter exists, the engineer marks it as <span className="text-amber-400 font-semibold">DESIGN REVIEW REQUIRED</span>.</p>
          </div>
        </div>
      </Section>
    </div>
  );

  if (id === 'verj-products') return (
    <div>
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-400/30 mb-4">Chapter 3</Badge>
      <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">VERJ Products<br /><span className="text-amber-400">&amp; Solutions</span></h1>
      <p className="text-white/40 text-sm mb-8">Know your products inside out — because you cannot sell what you do not understand</p>
      <img src={productsImg} alt="Solar installation" className={imgClass} style={{ height: 320 }} />
      <Section title="Our Product Range">
        <p className={bodyClass}>VERJ SOLAR offers complete solar energy solutions — from compact residential systems to large commercial installations. Our systems are designed, installed, and maintained by VERJ-certified engineers to the highest quality standards.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {[
            { name: 'Residential Systems', range: '1 kWp – 10 kWp', desc: 'Ideal for homes, flats, and small businesses. Covers essential loads: fans, lights, TV, refrigerator, and phone charging.' },
            { name: 'Mid-range Systems', range: '10 kWp – 20 kWp', desc: 'For medium homes, schools, and SMEs. Can power air conditioning, water pumps, and office equipment.' },
            { name: 'Large Commercial', range: '20 kWp – 48 kWp', desc: 'For factories, hospitals, large offices, and estates. Full-facility backup with scalable battery banks.' },
            { name: 'Custom Designs', range: '48 kWp+', desc: 'Bespoke engineering for large-scale industrial and institutional requirements.' },
          ].map(p => (
            <div key={p.name} className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="text-white font-bold text-sm">{p.name}</div>
              <div className="text-amber-400 text-xs font-mono mt-1 mb-2">{p.range}</div>
              <div className="text-white/55 text-sm leading-relaxed">{p.desc}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="What Makes VERJ Different">
        <ul className="space-y-3 mt-2">
          {[
            'Factory-grade components — no compromise on quality',
            'VERJ-certified engineers for every installation',
            'After-sales support and maintenance packages',
            'BuDOM-tracked warranties and service history',
            'Customer-facing Solar Plan invoices — no confusing jargon',
            'Scalable systems designed to grow with the customer',
          ].map(p => (
            <li key={p} className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5 flex-shrink-0">▸</span>
              <span className={liClass}>{p}</span>
            </li>
          ))}
        </ul>
      </Section>
      <Callout type="tip">Never make up product specifications. If a customer asks a technical question you cannot answer, say: "Great question. Let me get our engineer to confirm the exact specs for you." This builds trust rather than eroding it.</Callout>
      <Section title="Battery Selection Guide">
        <div className="bg-white/3 rounded-xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-2 px-4 py-2 bg-white/5 text-xs font-semibold text-white/50 uppercase tracking-wider">
            <div>Calculated Need</div><div>Recommended Size</div>
          </div>
          {[['0 – 5 kWh','5 kWh'],['5.1 – 10 kWh','10 kWh'],['10.1 – 16 kWh','16 kWh'],['16.1 – 32 kWh','32 kWh'],['32.1 – 48 kWh','48 kWh']].map(([r,s]) => (
            <div key={r} className="grid grid-cols-2 px-4 py-2.5 border-t border-white/5 text-sm">
              <div className="text-white/60">{r}</div>
              <div className="text-amber-400 font-semibold">{s}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );

  if (id === 'bdo-role') return (
    <div>
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-400/30 mb-4">Chapter 4</Badge>
      <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">Your Role as<br /><span className="text-amber-400">a VERJ BDO</span></h1>
      <p className="text-white/40 text-sm mb-8">Understanding your responsibilities, your pipeline, and how you are measured</p>
      <img src={teamImg} alt="VERJ BDO team" className={imgClass} style={{ height: 320 }} />
      <Section title="Your Core Responsibilities">
        <ul className="space-y-3">
          {[
            { title: 'Lead Generation', desc: 'Identify and approach potential customers in your coverage area through referrals, community engagement, and outreach.' },
            { title: 'Customer Education', desc: 'Help prospects understand the benefits of solar and how VERJ\'s solutions can solve their specific energy challenges.' },
            { title: 'Site Assessment', desc: 'Conduct a basic load assessment at the customer\'s premises and submit the information for engineering review.' },
            { title: 'Proposal Presentation', desc: 'Present the VERJ Solar Plan (proposal) to the customer in a clear, compelling, and professional way.' },
            { title: 'Deal Closure', desc: 'Guide the customer through the decision and payment process, coordinating with the VERJ sales and finance teams.' },
            { title: 'Relationship Management', desc: 'Maintain ongoing relationships with existing customers for referrals and potential upgrades.' },
          ].map(r => (
            <li key={r.title} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white font-semibold text-sm mb-1">{r.title}</div>
              <div className="text-white/55 text-sm">{r.desc}</div>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="The BDO Pipeline (Business Chain)">
        <div className="flex flex-col gap-1 mt-2">
          {['BDO generates Lead','Lead becomes a Customer','Customer\'s Load is Assessed','Design is created by Engineer','Design is technically approved','Invoice is generated','Sales approves Invoice','Customer makes Payment','System is installed','Commission is earned'].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">{i + 1}</div>
              <div className="text-white/65 text-sm">{step}</div>
            </div>
          ))}
        </div>
        <Callout type="key">Every record in BuDOM retains the BDO ID so your contribution is always tracked and credited — from the initial lead all the way to commission payment.</Callout>
      </Section>
      <Section title="Your VBDO ID">
        <p className={bodyClass}>Once activated, you receive a unique VERJ BDO ID in the format <span className="text-amber-400 font-mono font-bold">VBDO-XXXX</span>. This ID is your official VERJ identity. It appears on all your commissions, leads, customers, and BuDOM records. Guard it carefully.</p>
      </Section>
    </div>
  );

  if (id === 'sales-process') return (
    <div>
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-400/30 mb-4">Chapter 5</Badge>
      <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">Lead Generation<br /><span className="text-amber-400">&amp; Sales</span></h1>
      <p className="text-white/40 text-sm mb-8">How to find the right prospects, build trust, and close deals professionally</p>
      <img src={salesImg} alt="Nigerian BDO sales visit" className={imgClass} style={{ height: 340 }} />
      <Section title="Finding Quality Leads">
        <p className={bodyClass}>The best leads are warm leads — people who already trust you or have been referred by someone they trust. Focus your energy on building relationships rather than cold approaching strangers.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {[
            { source: 'Referrals', desc: 'Your single most powerful lead source. Ask every satisfied customer for 2–3 referrals.' },
            { source: 'Community Events', desc: 'Church gatherings, market days, estate meetings, cooperative meetings.' },
            { source: 'Social Media', desc: 'WhatsApp status, Facebook groups, Instagram stories showing before/after.' },
            { source: 'Existing Network', desc: 'Friends, family, former colleagues — people who already trust you.' },
            { source: 'Canvassing', desc: 'Door-to-door in residential estates or commercial areas during business hours.' },
            { source: 'Generator Noise', desc: 'Anyone running a generator is a qualified solar prospect. Find them.' },
          ].map(l => (
            <div key={l.source} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-amber-400 font-semibold text-sm mb-1">{l.source}</div>
              <div className="text-white/55 text-sm">{l.desc}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="The Sales Conversation">
        <p className={bodyClass}>A great sales conversation is 80% listening and 20% talking. Before you present anything, understand the customer's situation deeply.</p>
        <div className="space-y-3 mt-4">
          {[
            { step: '1. Connect', desc: 'Build rapport. Be genuinely interested in the person, not just the sale.' },
            { step: '2. Discover', desc: 'Ask about their power situation. How long are outages? What does fuel cost per week? What appliances suffer?' },
            { step: '3. Identify Pain', desc: 'Uncover their specific frustration. A pain point is a problem your product can solve.' },
            { step: '4. Present', desc: 'Show how VERJ\'s solution specifically solves their identified pain. Personalise it.' },
            { step: '5. Handle Objections', desc: 'Acknowledge concerns, validate them, then address them with facts and evidence.' },
            { step: '6. Close', desc: 'Ask for the next step clearly: "Shall we schedule a site visit?" or "Shall we proceed with the proposal?"' },
          ].map(s => (
            <div key={s.step} className="flex gap-3 items-start">
              <div className="bg-amber-500/20 text-amber-400 font-bold text-xs px-2 py-1 rounded flex-shrink-0 mt-0.5">{s.step}</div>
              <div className="text-white/60 text-sm leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Handling Common Objections">
        <div className="space-y-3 mt-2">
          {[
            { obj: '"It\'s too expensive"', res: 'Reframe as an investment. "You currently spend ₦X/month on fuel. This system pays for itself in Y months and then saves you money every month after."' },
            { obj: '"I tried solar before and it failed"', res: 'Acknowledge their experience. Ask about the system they had. Then explain VERJ\'s quality difference and post-installation support.' },
            { obj: '"Let me think about it"', res: 'Understand the real objection. "Of course — what specific aspect would you like more information on before you decide?"' },
            { obj: '"My neighbour has solar from another company"', res: 'Never disparage competitors. "That\'s great! Every home powered by solar is a win. What I can tell you is what makes VERJ specifically different..."' },
          ].map(o => (
            <div key={o.obj} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-red-400 font-semibold text-sm mb-2">{o.obj}</div>
              <div className="text-white/60 text-sm leading-relaxed">{o.res}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Understanding ROI for Your Customer">
        <p className={bodyClass}>Return on Investment (ROI) is one of the most powerful tools in your sales conversation. If a customer spends ₦25,000 per month on generator fuel, their annual fuel bill is ₦300,000. A solar system costing ₦1,500,000 pays for itself in 5 years — and then provides free energy for the next 20+ years.</p>
        <Callout type="tip">Always anchor the conversation on the customer's current monthly cost versus their new monthly zero-cost. Numbers are more powerful than words.</Callout>
      </Section>
    </div>
  );

  if (id === 'customer-assessment') return (
    <div>
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-400/30 mb-4">Chapter 6</Badge>
      <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">Customer Needs<br /><span className="text-amber-400">Assessment</span></h1>
      <p className="text-white/40 text-sm mb-8">How to conduct a professional load assessment and submit an accurate brief to the engineering team</p>
      <Section title="Why Accurate Assessment Matters">
        <p className={bodyClass}>An incorrectly sized system either leaves the customer unsatisfied (undersized — runs out of power at night) or wastes their money (oversized — paying for capacity they don't use). Both damage VERJ's reputation and your relationship with the customer.</p>
        <Callout type="warning">Never promise a specific system size to a customer before the engineering team has reviewed their load schedule. You can give a range, but never a final number. Under-sizing or over-sizing a system has serious consequences.</Callout>
      </Section>
      <Section title="The Load Assessment Process">
        <div className="space-y-3 mt-2">
          {[
            { step: 'Step 1: Appliance Inventory', desc: 'List every electrical appliance the customer uses. Include appliances they want to power with solar — not just what they currently use.' },
            { step: 'Step 2: Power Ratings', desc: 'Record the wattage of each appliance. This is usually on a label at the back of the appliance or in the manual. Common examples: LED bulb (10W), fan (50W), TV (100W), refrigerator (150W), air conditioner (1,500W).' },
            { step: 'Step 3: Daily Usage Hours', desc: 'Ask how many hours per day each appliance is used. Separate day-time use from night-time use — this matters for battery sizing.' },
            { step: 'Step 4: Calculate Energy', desc: 'Energy (Wh) = Wattage × Hours per day. Sum all appliances. Convert to kWh (divide by 1,000).' },
            { step: 'Step 5: Submit to BuDOM', desc: 'Enter the load schedule into BuDOM. The engineering team uses this data to design the correct system.' },
          ].map(s => (
            <div key={s.step} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-amber-400 font-semibold text-sm mb-1">{s.step}</div>
              <div className="text-white/60 text-sm">{s.desc}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Key Questions to Ask a Prospect">
        <ul className="space-y-2 mt-2">
          {[
            'How many hours of power outage do you experience daily?',
            'What appliances do you currently use on your generator?',
            'What additional appliances would you like solar to power?',
            'Do you run an air conditioner? If so, how many and for how many hours?',
            'What is your approximate monthly generator fuel spend?',
            'Do you have an existing solar or inverter system? What brand?',
            'When would you ideally like the system installed?',
          ].map(q => (
            <li key={q} className="flex items-start gap-2 text-sm">
              <span className="text-amber-400 flex-shrink-0 mt-0.5">?</span>
              <span className="text-white/60">{q}</span>
            </li>
          ))}
        </ul>
      </Section>
      <Callout type="key">The most important thing you can determine in a customer visit is: <strong className="text-white">what problem are they trying to solve?</strong> A customer who spends ₦20,000/week on fuel has a very different need from one who just wants to power their lights. Size the conversation accordingly.</Callout>
    </div>
  );

  if (id === 'onboarding-workflow') return (
    <div>
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-400/30 mb-4">Chapter 7</Badge>
      <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">BDO Onboarding<br /><span className="text-amber-400">Workflow</span></h1>
      <p className="text-white/40 text-sm mb-8">How you got here — and what happens after you pass the assessment</p>
      <Section title="The Full Application Pipeline">
        <div className="space-y-2 mt-4">
          {[
            { status: 'Submitted', desc: 'You completed the application form. Your information is under review.' },
            { status: 'KYC Pending', desc: 'Admin is reviewing your selfie/photo and government-issued ID.' },
            { status: 'KYC Verified', desc: 'Your identity has been confirmed. You are eligible for shortlisting.' },
            { status: 'Shortlisted', desc: 'You have been shortlisted! Your onboarding portal is now active. Train, study, and take the assessment.' },
            { status: 'Assessment Passed', desc: 'Congratulations! You passed the assessment. Awaiting Chief Admin activation.' },
            { status: 'Assessment Failed', desc: 'You have used all assessment attempts. Contact VERJ if you wish to apply again.' },
            { status: 'Activated / Active BDO', desc: 'Welcome to the team! Your VBDO ID, BDO portal account, certificate, and work ID have been generated.' },
          ].map((s, i) => (
            <div key={s.status} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">{i + 1}</div>
                {i < 6 && <div className="w-px h-6 bg-white/10" />}
              </div>
              <div className="pb-2">
                <div className="text-white font-semibold text-sm">{s.status}</div>
                <div className="text-white/50 text-xs mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Assessment Rules — READ CAREFULLY">
        <Callout type="warning">You have a maximum of 2 attempts at the assessment. Passing on either attempt advances you to activation. Failing both attempts locks your onboarding access permanently. The Chief Admin may grant an override if VERJ decides to give you another opportunity.</Callout>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[
            { label: 'Total Marks', value: '100' },
            { label: 'Pass Mark', value: '70 (70%)' },
            { label: 'Max Attempts', value: '2' },
            { label: 'Time Limit', value: 'None' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
              <div className="text-2xl font-black text-amber-400">{s.value}</div>
              <div className="text-white/50 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="What You Get When Activated">
        <ul className="space-y-2 mt-2">
          {[
            'A unique VBDO ID (e.g. VBDO-0017)',
            'BuDOM BDO Portal login credentials',
            'VERJ BDO Certificate (downloadable, MD-signed)',
            'VERJ Work ID (downloadable, MD-signed)',
            'Access to leads, customers, commissions, and your performance dashboard',
          ].map(item => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-white/65 text-sm">{item}</span>
            </li>
          ))}
        </ul>
        <Callout type="key">Your onboarding (applicant) account is deactivated the moment you are activated as a BDO. Your old login credentials will no longer work. You receive new login details via email and WhatsApp.</Callout>
      </Section>
    </div>
  );

  if (id === 'professional-standards') return (
    <div>
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-400/30 mb-4">Chapter 8</Badge>
      <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">Professional<br /><span className="text-amber-400">Standards</span></h1>
      <p className="text-white/40 text-sm mb-8">The code of conduct that defines you as a VERJ BDO</p>
      <Section title="Appearance & Dress Code">
        <p className={bodyClass}>You represent VERJ at every customer interaction. Your appearance is your first impression — and first impressions last. Always dress smartly and professionally, even for informal visits.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-400/20">
            <div className="text-green-400 font-semibold text-sm mb-2">✓ Do</div>
            <ul className="space-y-1 text-white/60 text-sm">
              <li>Dress smartly (smart casual minimum)</li>
              <li>Wear VERJ branded items when available</li>
              <li>Keep hair neat and groomed</li>
              <li>Carry business cards and a notepad</li>
              <li>Arrive on time for every appointment</li>
            </ul>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-400/20">
            <div className="text-red-400 font-semibold text-sm mb-2">✗ Don't</div>
            <ul className="space-y-1 text-white/60 text-sm">
              <li>Visit customers in torn or casual wear</li>
              <li>Use your phone during a customer presentation</li>
              <li>Smoke or drink alcohol before/during visits</li>
              <li>Make promises you haven't cleared with VERJ</li>
              <li>Discuss competitor pricing unless you know the facts</li>
            </ul>
          </div>
        </div>
      </Section>
      <Section title="Ethical Conduct">
        <div className="space-y-3 mt-2">
          {[
            { rule: 'No Personal Gifts', desc: 'Do not accept cash, gifts, or favours from customers or prospects. Politely decline and explain VERJ\'s professional standards.' },
            { rule: 'No Misrepresentation', desc: 'Never make false claims about VERJ products or services. If you don\'t know something, find out and come back with the truth.' },
            { rule: 'Confidentiality', desc: 'Customer data accessed through BuDOM is confidential. Never share customer information with third parties.' },
            { rule: 'Conflict of Interest', desc: 'Inform VERJ management if you have a personal relationship with a customer or a competing business interest.' },
            { rule: 'Following Authority', desc: 'If a Chief Admin instruction conflicts with VERJ\'s official process, raise your concern professionally before proceeding. You are not exempt from the process.' },
          ].map(e => (
            <div key={e.rule} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white font-semibold text-sm mb-1">{e.rule}</div>
              <div className="text-white/55 text-sm">{e.desc}</div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Communication Standards">
        <ul className="space-y-2 mt-2">
          {[
            'Always respond to customer messages within 24 hours.',
            'Use clear, respectful language in all written and verbal communication.',
            'Copy your VERJ contact into important emails when necessary.',
            'Never make a commitment on behalf of VERJ without authorisation.',
            'Report all significant customer interactions in BuDOM.',
          ].map(c => (
            <li key={c} className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5 flex-shrink-0">▸</span>
              <span className="text-white/65 text-sm">{c}</span>
            </li>
          ))}
        </ul>
      </Section>
      <Callout type="key">
        Your VERJ BDO status can be suspended or revoked for serious violations of this code of conduct. Your VBDO ID and the privileges that come with it are earned — and they must be maintained through consistent professional behaviour.
      </Callout>
      <div className="mt-12 bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-2xl p-8 border border-amber-400/20 text-center">
        <div className="text-3xl mb-3">🎓</div>
        <h3 className="text-white font-black text-xl mb-2">You're Ready for the Assessment</h3>
        <p className="text-white/50 text-sm mb-6">You've completed all 8 chapters. You now have everything you need to pass the VERJ BDO Assessment. Good luck — we believe in you.</p>
        <Link href="/assessment">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 gap-2">
            Take Assessment <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );

  return <div className="text-white/40">Chapter not found</div>;
}
