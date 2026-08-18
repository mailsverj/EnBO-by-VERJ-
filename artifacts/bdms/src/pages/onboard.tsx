import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Download, ClipboardCheck, Loader2, LogOut, AlertTriangle,
  CheckCircle2, LockKeyhole, ChevronRight, ExternalLink,
} from 'lucide-react';
import logoPath from '@assets/Copy_of_Modern_Cabinet_Furniture_Product_1786754353697.png';

const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');

interface PortalApp {
  id: number;
  refId: string;
  fullName: string;
  email: string;
  status: string;
  assessmentStatus: string;
  assessmentScore: number | null;
  assessmentTotal: number | null;
  assessmentPassed: boolean | null;
}

// ── Shared header ─────────────────────────────────────────────────────────────
function Header({ app, onLogout }: { app?: PortalApp; onLogout?: () => void }) {
  return (
    <div className="w-full bg-[#0a0a0a] border-b border-white/10 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-3">
        <div>
          <div className="text-white font-black text-lg leading-none tracking-tight">EnBO</div>
          <div className="flex items-center gap-0.5 mt-0.5">
            <span className="text-white italic text-[9px] font-semibold leading-none">by</span>
            <img
              src={logoPath}
              alt="VERJ"
              className="h-6 object-contain"
              style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(96%) saturate(600%) hue-rotate(2deg) brightness(105%)' }}
            />
          </div>
        </div>
        <div className="ml-2 h-5 w-px bg-white/20" />
        <span className="text-white/50 text-xs font-medium tracking-wide uppercase">Pre-Onboarding Portal</span>
        <div className="flex-1" />
        {app && onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}

export default function Onboard() {
  const [phase, setPhase] = useState<'init' | 'login' | 'dashboard'>('init');
  const [app, setApp] = useState<PortalApp | null>(null);

  // Login form
  const [refId, setRefId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/onboard/me`, { credentials: 'include' });
        if (res.ok) {
          const { app: a } = await res.json() as { app: PortalApp };
          setApp(a);
          setPhase('dashboard');
        } else {
          setPhase('login');
        }
      } catch {
        setPhase('login');
      }
    })();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await fetch(`${BASE}/api/onboard/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refId: refId.trim().toUpperCase(), password }),
      });
      const json = await res.json() as { ok?: boolean; app?: PortalApp; error?: string; redirectToLogin?: boolean; locked?: boolean };
      if (!res.ok) {
        setLoginError(json.error ?? 'Login failed. Please check your details and try again.');
        setLoggingIn(false);
        return;
      }
      setApp(json.app!);
      setPhase('dashboard');
    } catch {
      setLoginError('Network error. Please check your connection and try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${BASE}/api/onboard/logout`, { method: 'POST', credentials: 'include' });
    setApp(null);
    setRefId('');
    setPassword('');
    setPhase('login');
  };

  // Refresh app status (called when returning from assessment)
  const refreshStatus = async () => {
    try {
      const res = await fetch(`${BASE}/api/onboard/me`, { credentials: 'include' });
      if (res.ok) {
        const { app: a } = await res.json() as { app: PortalApp };
        setApp(a);
      }
    } catch {
      // ignore
    }
  };

  // ── Init spinner ─────────────────────────────────────────────────────────────
  if (phase === 'init') return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    </div>
  );

  // ── Login ─────────────────────────────────────────────────────────────────────
  if (phase === 'login') return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white">Welcome back</h1>
            <p className="text-white/50 text-sm mt-2">Sign in with the credentials sent to your email</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white/70 text-sm">Application ID</Label>
              <Input
                type="text"
                value={refId}
                onChange={e => setRefId(e.target.value.toUpperCase())}
                placeholder="e.g. APP-001"
                className="bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:border-amber-400/60 font-mono tracking-wider"
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/70 text-sm">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your portal password"
                className="bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:border-amber-400/60"
                required
                autoComplete="current-password"
              />
            </div>

            {loginError && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-xs leading-relaxed">{loginError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loggingIn || !refId || !password}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold h-11"
            >
              {loggingIn
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</>
                : <>Sign In <ChevronRight className="h-4 w-4 ml-1" /></>}
            </Button>
          </form>

          <p className="text-center text-white/25 text-xs mt-8 leading-relaxed">
            Your Application ID and password were sent to your email when you were shortlisted.<br />
            Need help? Contact <a href="mailto:mails.verj@gmail.com" className="text-amber-400/70 hover:text-amber-400 underline">mails.verj@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  if (phase === 'dashboard' && app) {
    const assessmentLink = `${BASE}/assessment?ref=${app.refId}`;
    const trainingLink = `${BASE}/training`;
    const workbookLink = `${BASE}/training/workbook`;

    const passed = app.assessmentPassed === true || app.assessmentStatus === 'Passed';
    const locked = app.assessmentStatus === 'Failed';
    const inProgress = !passed && !locked;
    const isActivated = app.status === 'Activated';

    const percentage = (app.assessmentScore != null && app.assessmentTotal)
      ? Math.round((app.assessmentScore / app.assessmentTotal) * 100)
      : null;

    const steps = [
      { label: 'Study', sublabel: 'Read the handbook', done: true },
      { label: 'Assess', sublabel: 'Pass the test', done: passed || isActivated },
      { label: 'Activate', sublabel: 'Get your account', done: isActivated },
    ];

    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
        <Header app={app} onLogout={handleLogout} />
        <div className="flex-1 max-w-lg mx-auto w-full px-5 pt-8 pb-12 space-y-7">

          {/* Welcome */}
          <div>
            <h1 className="text-3xl font-black text-white leading-tight">
              Hello, {app.fullName.split(' ')[0]} 👋
            </h1>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span className="text-white/35 text-sm font-mono">{app.refId}</span>
              <span className="text-white/20">·</span>
              <StatusBadge status={app.status} assessmentStatus={app.assessmentStatus} />
            </div>
          </div>

          {/* Step tracker — large, high-contrast */}
          {!locked && !isActivated && (
            <div className="grid grid-cols-3 gap-3">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-4 flex flex-col items-center text-center border-2 ${
                    step.done
                      ? 'bg-amber-500 border-amber-400'
                      : 'bg-[#1a1a1a] border-[#2a2a2a]'
                  }`}
                >
                  <div className={`text-2xl font-black mb-1 ${step.done ? 'text-black' : 'text-white/25'}`}>
                    {step.done ? '✓' : i + 1}
                  </div>
                  <div className={`text-xs font-bold leading-tight ${step.done ? 'text-black' : 'text-white/50'}`}>
                    {step.label}
                  </div>
                  <div className={`text-[10px] mt-0.5 leading-tight ${step.done ? 'text-black/60' : 'text-white/25'}`}>
                    {step.sublabel}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Status banner */}
          {isActivated && (
            <div className="rounded-2xl bg-green-500 p-5 flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-black flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-black font-black text-base">Your BDO account is active!</div>
                <p className="text-black/70 text-sm mt-1 leading-relaxed">
                  Congratulations! Check your email for your full login credentials.
                </p>
                <a href={`${BASE}/login`}>
                  <Button className="mt-3 bg-black hover:bg-black/80 text-white font-semibold text-sm">
                    Go to EnBO Login →
                  </Button>
                </a>
              </div>
            </div>
          )}

          {!isActivated && passed && (
            <div className="rounded-2xl bg-amber-500 p-5 flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-black flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-black font-black text-base">Assessment passed!</div>
                <p className="text-black/70 text-sm mt-1 leading-relaxed">
                  You scored <strong>{percentage}%</strong> ({app.assessmentScore}/{app.assessmentTotal} marks).
                  The VERJ team will activate your account soon — watch your email.
                </p>
              </div>
            </div>
          )}

          {locked && (
            <div className="rounded-2xl bg-red-500/15 border-2 border-red-500/30 p-5 flex items-start gap-4">
              <LockKeyhole className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-white font-black text-base">Assessment locked</div>
                <p className="text-white/60 text-sm mt-1 leading-relaxed">
                  You've used both attempts. Contact{' '}
                  <a href="mailto:mails.verj@gmail.com" className="text-red-400 underline">mails.verj@gmail.com</a>{' '}
                  to request a review.
                </p>
              </div>
            </div>
          )}

          {/* Action cards */}
          <div className="space-y-3">
            <p className="text-white/35 text-xs font-semibold uppercase tracking-widest">Your Resources</p>

            {/* Download & Study Workbook */}
            <a href={workbookLink} target="_blank" rel="noreferrer"
              className="flex items-center gap-4 bg-[#1c1c1c] active:bg-[#252525] rounded-2xl p-4 border border-[#2a2a2a] transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Download className="h-5 w-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm">Download & Study Training Workbook</div>
                <div className="text-white/40 text-xs mt-0.5 leading-relaxed">Save as PDF and study before your assessment</div>
              </div>
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <ExternalLink className="h-3.5 w-3.5 text-white/40" />
              </div>
            </a>

            {/* Take Assessment — always shown unless locked or activated */}
            {!locked && !isActivated && (
              <a
                href={assessmentLink}
                onClick={() => { window.addEventListener('focus', refreshStatus, { once: true }); }}
                className="flex items-center gap-4 rounded-2xl p-4 border-2 bg-green-500 border-green-400 active:bg-green-600 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-black font-black text-sm">Take Assessment</div>
                  <div className="text-black/60 text-xs mt-0.5">Score 70%+ to pass — 2 attempts allowed</div>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
                  <ChevronRight className="h-4 w-4 text-black" />
                </div>
              </a>
            )}
          </div>

          <p className="text-white/15 text-xs text-center pt-2">
            VERJ Solar Energy Solutions · EnBO Pre-Onboarding Portal
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function StatusBadge({ status, assessmentStatus }: { status: string; assessmentStatus: string }) {
  if (status === 'Activated') return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Activated</Badge>;
  if (assessmentStatus === 'Passed') return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Assessment Passed — Pending Activation</Badge>;
  if (assessmentStatus === 'Failed') return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Assessment Locked</Badge>;
  if (assessmentStatus === 'Failed Attempt 1') return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">1 Attempt Remaining</Badge>;
  return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Shortlisted</Badge>;
}
