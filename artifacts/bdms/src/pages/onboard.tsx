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
            Need help? Contact <a href="mailto:recruitment@verjsolar.com" className="text-amber-400/70 hover:text-amber-400 underline">recruitment@verjsolar.com</a>
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

    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
        <Header app={app} onLogout={handleLogout} />
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 space-y-8">

          {/* Welcome banner */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-white">
                Hello, {app.fullName.split(' ')[0]} 👋
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white/40 text-sm">{app.refId}</span>
              <span className="text-white/20">·</span>
              <StatusBadge status={app.status} assessmentStatus={app.assessmentStatus} />
            </div>
          </div>

          {/* Activated state */}
          {isActivated && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-white font-bold text-base">Your BDO account is active!</div>
                <p className="text-white/60 text-sm mt-1 leading-relaxed">
                  Congratulations! Your VBDO account has been activated. Please check your email for your full login credentials and sign in to the main EnBO platform.
                </p>
                <a href={`${BASE}/login`}>
                  <Button className="mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm">
                    Go to EnBO Login →
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* Passed — pending activation */}
          {!isActivated && passed && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-white font-bold text-base">Assessment passed — pending activation</div>
                <p className="text-white/60 text-sm mt-1 leading-relaxed">
                  Well done! You scored <strong className="text-white">{percentage}%</strong> ({app.assessmentScore}/{app.assessmentTotal} marks).
                  Your result has been submitted to the VERJ team. You will be notified by email once your BDO account is activated.
                </p>
              </div>
            </div>
          )}

          {/* Locked — failed both attempts */}
          {locked && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex items-start gap-4">
              <LockKeyhole className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-white font-bold text-base">Assessment locked</div>
                <p className="text-white/60 text-sm mt-1 leading-relaxed">
                  You have used all available attempts without meeting the required score. Please contact{' '}
                  <a href="mailto:recruitment@verjsolar.com" className="text-amber-400 underline">recruitment@verjsolar.com</a>{' '}
                  if you wish to request a review.
                </p>
              </div>
            </div>
          )}

          {/* Step progress (only when not locked or activated) */}
          {!locked && !isActivated && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { num: 1, label: 'Study Handbook', done: true },
                { num: 2, label: 'Pass Assessment', done: passed },
                { num: 3, label: 'Get Activated', done: isActivated },
              ].map(step => (
                <div key={step.num} className={`rounded-lg p-3 border text-center ${
                  step.done
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-white/3 border-white/10'
                }`}>
                  <div className={`text-lg font-black ${step.done ? 'text-amber-400' : 'text-white/30'}`}>
                    {step.done ? '✓' : step.num}
                  </div>
                  <div className={`text-xs mt-1 ${step.done ? 'text-amber-300' : 'text-white/40'}`}>
                    {step.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action cards */}
          <div>
            <h2 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Your Resources</h2>
            <div className="space-y-3">

              {/* Download Handbook */}
              <a
                href={workbookLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-xl p-5 transition-all group"
              >
                <div className="w-11 h-11 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                  <Download className="h-5 w-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">Download Handbook</div>
                  <div className="text-white/45 text-xs mt-0.5">Save the BDO Training Handbook as a PDF to study offline</div>
                </div>
                <ExternalLink className="h-4 w-4 text-white/25 group-hover:text-white/50 flex-shrink-0 transition-colors" />
              </a>

              {/* Study Online */}
              <a
                href={trainingLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-xl p-5 transition-all group"
              >
                <div className="w-11 h-11 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">Study Online</div>
                  <div className="text-white/45 text-xs mt-0.5">Read the interactive training workbook chapter by chapter in your browser</div>
                </div>
                <ExternalLink className="h-4 w-4 text-white/25 group-hover:text-white/50 flex-shrink-0 transition-colors" />
              </a>

              {/* Take Assessment */}
              {inProgress && (
                <a
                  href={assessmentLink}
                  onClick={e => {
                    // Refresh status when user returns
                    window.addEventListener('focus', refreshStatus, { once: true });
                  }}
                  className="flex items-center gap-4 bg-green-500/10 hover:bg-green-500/15 border border-green-500/25 hover:border-green-500/40 rounded-xl p-5 transition-all group"
                >
                  <div className="w-11 h-11 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <ClipboardCheck className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">Take Assessment</div>
                    <div className="text-white/45 text-xs mt-0.5">
                      Complete the competency assessment — score 70% or above to pass (2 attempts maximum)
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-green-400/60 group-hover:text-green-400 flex-shrink-0 transition-colors" />
                </a>
              )}

              {/* Retake hint (failed attempt 1 — can still retake) */}
              {!inProgress && !locked && !passed && (
                <a
                  href={assessmentLink}
                  className="flex items-center gap-4 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 hover:border-amber-500/40 rounded-xl p-5 transition-all group"
                >
                  <div className="w-11 h-11 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <ClipboardCheck className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">Retry Assessment</div>
                    <div className="text-amber-300/70 text-xs mt-0.5">
                      You have 1 attempt remaining. Review the handbook carefully before retrying.
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-amber-400/60 group-hover:text-amber-400 flex-shrink-0 transition-colors" />
                </a>
              )}
            </div>
          </div>

          <p className="text-white/20 text-xs text-center pb-4">
            VERJ Solar Energy Solutions — EnBO Pre-Onboarding Portal
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
