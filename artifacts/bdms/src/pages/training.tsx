import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Download, ChevronRight, CheckCircle2, Circle, Sun, Zap,
  Users, TrendingUp, ClipboardCheck, Award, Shield, Menu, X, Printer, Loader2
} from 'lucide-react';
import logoOnDark from '@assets/enbo-verj-logo-dark.png';
import heroImg from '@assets/training-hero.jpg';
import solarBasicsImg from '@assets/training-solar-basics.jpg';
import salesImg from '@assets/training-sales.jpg';
import productsImg from '@assets/training-products.jpg';
import teamImg from '@assets/training-team.jpg';
import { api } from '@/lib/api';
import type { ChapterBlock, ChapterSection, TrainingChapter } from '@/lib/api';

// Static chapter definitions (order + icons — fetched content overrides title/subtitle/sections)
const CHAPTERS = [
  { id: 'welcome',               icon: Sun,            readTime: '5 min' },
  { id: 'solar-fundamentals',    icon: Zap,            readTime: '10 min' },
  { id: 'verj-products',         icon: BookOpen,       readTime: '8 min' },
  { id: 'bdo-role',              icon: Users,          readTime: '7 min' },
  { id: 'sales-process',         icon: TrendingUp,     readTime: '12 min' },
  { id: 'customer-assessment',   icon: ClipboardCheck, readTime: '9 min' },
  { id: 'onboarding-workflow',   icon: Award,          readTime: '6 min' },
  { id: 'professional-standards',icon: Shield,         readTime: '5 min' },
];

// Hero images per chapter
const HERO_IMAGES: Record<string, string> = {
  'welcome':               heroImg,
  'solar-fundamentals':    solarBasicsImg,
  'verj-products':         productsImg,
  'bdo-role':              teamImg,
  'sales-process':         salesImg,
};

const imgClass = "w-full rounded-xl object-cover my-6 shadow-2xl max-h-[200px] sm:max-h-[280px] md:max-h-[360px]";

export default function Training() {
  const [activeChapter, setActiveChapter] = useState('welcome');
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const contentRef = useRef<HTMLDivElement>(null);
  const isPublic = !document.cookie.includes('connect.sid');

  useEffect(() => {
    const stored = localStorage.getItem('verj_read_chapters');
    if (stored) setReadChapters(new Set(JSON.parse(stored)));
  }, []);

  // Fetch chapter list from DB
  const { data: chaptersData } = useQuery({
    queryKey: ['training', 'chapters'],
    queryFn: api.training.listChapters,
    staleTime: 60_000,
  });

  // Fetch active chapter content
  const { data: chapterData, isLoading: chapterLoading } = useQuery({
    queryKey: ['training', 'chapter', activeChapter],
    queryFn: () => api.training.getChapter(activeChapter),
    staleTime: 60_000,
    retry: false,
  });

  const dbChapters = chaptersData?.chapters ?? [];

  // Merge static (order/icons) with DB titles
  const chapters = CHAPTERS.map(c => {
    const db = dbChapters.find(d => d.chapterId === c.id);
    return { ...c, title: db?.title ?? c.id.replace(/-/g, ' '), subtitle: db?.subtitle ?? '' };
  });

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
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const currentIdx = chapters.findIndex(c => c.id === activeChapter);
  const progress = Math.round((readChapters.size / chapters.length) * 100);

  const handlePrint = () => {
    window.open(`${(import.meta.env.BASE_URL ?? '/').replace(/\/$/, '')}/training/workbook`, '_blank');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0f0f0f]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="h-14 bg-[#111] border-b border-white/10 flex items-center px-4 gap-3 flex-shrink-0 z-20">
        <button onClick={() => setSidebarOpen(v => !v)} className="text-white/60 hover:text-white mr-1">
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <img src={logoOnDark} alt="EnBO by VERJ" className="h-11 w-auto object-contain" />
        <span className="text-white font-bold tracking-wide text-sm hidden sm:inline">BDO Training Workbook</span>
        <div className="flex-1" />
        <div className="hidden sm:flex items-center gap-2 text-xs text-white/50">
          <span>{readChapters.size}/{chapters.length} chapters</span>
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <Button size="sm" variant="outline" className="ml-2 border-white/20 text-white hover:bg-white/10 text-xs gap-1.5" onClick={handlePrint}>
          <Printer className="h-3 w-3" /> <span className="hidden sm:inline">Download PDF</span>
        </Button>
        {!isPublic && (
          <Link href="/assessment">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs gap-1.5">
              Take Assessment <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <>
            {/* Mobile backdrop */}
            <div className="md:hidden fixed inset-0 bg-black/70 z-30" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-14 left-0 md:static md:inset-auto w-72 md:w-64 bg-[#161616] border-r border-white/10 flex flex-col flex-shrink-0 overflow-hidden z-40 md:z-auto">
              <div className="p-4 border-b border-white/10">
                <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Contents</div>
                <Progress value={progress} className="h-1 bg-white/10 [&>div]:bg-amber-400" />
                <div className="text-xs text-white/40 mt-1">{progress}% complete</div>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {chapters.map((ch, i) => {
                  const isActive = ch.id === activeChapter;
                  const isRead = readChapters.has(ch.id);
                  return (
                    <button key={ch.id} onClick={() => goToChapter(ch.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${isActive ? 'bg-amber-500/10 border-r-2 border-amber-400' : 'hover:bg-white/5'}`}>
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
          </>
        )}

        {/* Content area */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-10">
            {chapterLoading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="h-8 w-8 animate-spin text-white/30" />
              </div>
            ) : chapterData?.chapter ? (
              <ChapterView
                chapter={chapterData.chapter}
                chapterIndex={currentIdx}
                heroImage={HERO_IMAGES[activeChapter]}
              />
            ) : (
              <div className="text-white/40 text-center py-16">Chapter not found</div>
            )}

            {/* Navigation */}
            <div className="flex justify-between gap-2 mt-12 pt-8 border-t border-white/10">
              {currentIdx > 0 ? (
                <Button variant="outline" className="border-white/20 text-white/60 hover:bg-white/5 hover:text-white gap-2 max-w-[45vw] sm:max-w-xs"
                  onClick={() => goToChapter(chapters[currentIdx - 1].id)}>
                  <span className="truncate">← {chapters[currentIdx - 1].title}</span>
                </Button>
              ) : <div />}
              {currentIdx < chapters.length - 1 ? (
                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 max-w-[45vw] sm:max-w-xs"
                  onClick={() => goToChapter(chapters[currentIdx + 1].id)}>
                  <span className="truncate">{chapters[currentIdx + 1].title} →</span>
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

// ─── Chapter View ─────────────────────────────────────────────────────────────

function ChapterView({ chapter, chapterIndex, heroImage }: {
  chapter: TrainingChapter;
  chapterIndex: number;
  heroImage?: string;
}) {
  return (
    <div>
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-400/30 mb-4">
        Chapter {chapterIndex + 1}
      </Badge>
      <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
        {chapter.title.includes(' ') ? (
          <>
            {chapter.title.split(/\s(.+)/)[0]}<br />
            <span className="text-amber-400">{chapter.title.split(/\s(.+)/)[1]}</span>
          </>
        ) : (
          <span className="text-amber-400">{chapter.title}</span>
        )}
      </h1>
      {chapter.subtitle && (
        <p className="text-white/40 text-sm mb-8">{chapter.subtitle}</p>
      )}
      {heroImage && (
        <img src={heroImage} alt={chapter.title} className={imgClass} />
      )}
      {(chapter.content as { sections: ChapterSection[] }).sections?.map((section, i) => (
        <Section key={i} title={section.title}>
          {section.blocks.map((block, j) => (
            <BlockRenderer key={j} block={block} />
          ))}
        </Section>
      ))}
    </div>
  );
}

// ─── Block Renderer ───────────────────────────────────────────────────────────

function BlockRenderer({ block }: { block: ChapterBlock }) {
  const bodyClass = "text-white/70 leading-relaxed text-sm md:text-base";
  const liClass = "text-white/65 text-sm leading-relaxed";

  if (block.type === 'paragraph') {
    // Support **bold** markdown
    const parts = block.text.split(/\*\*(.+?)\*\*/g);
    return (
      <p className={`${bodyClass} mb-4`}>
        {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part)}
      </p>
    );
  }

  if (block.type === 'callout') {
    const styles = {
      tip: 'bg-amber-500/10 border-amber-400/30 text-amber-200',
      warning: 'bg-red-500/10 border-red-400/30 text-red-200',
      key: 'bg-blue-500/10 border-blue-400/30 text-blue-200',
    }[block.variant];
    const labels = { tip: '💡 Tip', warning: '⚠️ Important', key: '🔑 Key Concept' }[block.variant];
    return (
      <div className={`border rounded-lg p-4 my-4 text-sm leading-relaxed ${styles}`}>
        <div className="font-semibold mb-1">{labels}</div>
        {block.text}
      </div>
    );
  }

  if (block.type === 'list') {
    return (
      <ul className="space-y-2 mt-2 mb-4">
        {block.items.filter(Boolean).map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5 flex-shrink-0">▸</span>
            <span className={liClass}>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === 'pipeline') {
    return (
      <div className="flex flex-col gap-1 mt-2 mb-4">
        {block.items.filter(Boolean).map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">{i + 1}</div>
            <div className="text-white/65 text-sm">{step}</div>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === 'cards') {
    const cols = block.columns ?? 2;
    const gridClass = cols === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';
    return (
      <div className={`grid ${gridClass} gap-4 mt-4 mb-4`}>
        {block.items.map((card, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10">
            {card.subtitle ? (
              <>
                <div className="text-2xl font-black text-amber-400">{card.title}</div>
                <div className="text-white/50 text-xs mt-1">{card.subtitle}</div>
                {card.body && <div className="text-white/55 text-sm mt-2">{card.body}</div>}
              </>
            ) : (
              <>
                <div className="text-amber-400 font-bold text-sm mb-2">{card.title}</div>
                <div className="text-white/55 text-sm leading-relaxed">{card.body}</div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (block.type === 'keyterms') {
    return (
      <div className="bg-white/3 rounded-xl border border-white/10 overflow-hidden mb-4">
        {block.terms.map((t, i) => (
          <div key={i} className="flex gap-3 py-3 px-4 border-b border-white/5 last:border-0">
            <span className="text-amber-400 font-semibold text-sm w-36 flex-shrink-0">{t.term}</span>
            <span className="text-white/60 text-sm leading-relaxed">{t.def}</span>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === 'formula') {
    return (
      <div className="bg-white/5 rounded-xl p-5 border border-amber-400/20 mb-4">
        {block.label && <div className="text-amber-400 font-bold mb-2">{block.label}</div>}
        {block.formula && (
          <div className="text-white text-lg font-mono bg-black/30 rounded-lg p-3 mb-3">{block.formula}</div>
        )}
        {block.explanation && <p className="text-white/55 text-sm">{block.explanation}</p>}
      </div>
    );
  }

  if (block.type === 'steps') {
    return (
      <div className="space-y-3 mt-4 mb-4">
        {block.items.map((s, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="bg-amber-500/20 text-amber-400 font-bold text-xs px-2 py-1 rounded flex-shrink-0 mt-0.5">{s.label}</div>
            <div className="text-white/60 text-sm leading-relaxed">{s.desc}</div>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === 'objections') {
    return (
      <div className="space-y-3 mt-2 mb-4">
        {block.items.map((o, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-red-400 font-semibold text-sm mb-2">{o.obj}</div>
            <div className="text-white/60 text-sm leading-relaxed">{o.res}</div>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === 'dodont') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
        <div className="bg-green-500/10 rounded-xl p-4 border border-green-400/20">
          <div className="text-green-400 font-semibold text-sm mb-2">✓ Do</div>
          <ul className="space-y-1 text-white/60 text-sm">
            {block.dos.filter(Boolean).map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
        <div className="bg-red-500/10 rounded-xl p-4 border border-red-400/20">
          <div className="text-red-400 font-semibold text-sm mb-2">✗ Don't</div>
          <ul className="space-y-1 text-white/60 text-sm">
            {block.donts.filter(Boolean).map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      </div>
    );
  }

  if (block.type === 'table') {
    return (
      <div className="bg-white/3 rounded-xl border border-white/10 overflow-hidden mb-4">
        <div className={`grid px-4 py-2 bg-white/5 text-xs font-semibold text-white/50 uppercase tracking-wider`}
          style={{ gridTemplateColumns: `repeat(${block.headers.length}, 1fr)` }}>
          {block.headers.map((h, i) => <div key={i}>{h}</div>)}
        </div>
        {block.rows.map((row, ri) => (
          <div key={ri} className={`grid px-4 py-2.5 border-t border-white/5 text-sm`}
            style={{ gridTemplateColumns: `repeat(${block.headers.length}, 1fr)` }}>
            {row.map((cell, ci) => (
              <div key={ci} className={ci === 0 ? 'text-white/60' : 'text-amber-400 font-semibold'}>{cell}</div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (block.type === 'assessment_cta') {
    return (
      <div className="mt-8 bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-2xl p-8 border border-amber-400/20 text-center">
        <div className="text-3xl mb-3">🎓</div>
        <h3 className="text-white font-black text-xl mb-2">You're Ready for the Assessment</h3>
        <p className="text-white/50 text-sm mb-6">You've completed all 8 chapters. You now have everything you need to pass the VERJ BDO Assessment. Good luck — we believe in you.</p>
        <Link href="/assessment">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 gap-2">
            Take Assessment <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return null;
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

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
