import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import logoOnLight from '@assets/enbo-verj-logo-light.png';
import { useAuth } from '@/store/auth';

export default function Login() {
  const [email, setEmail] = useState('admin@verjsolar.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading, user, logout } = useAuth();
  const [, navigate] = useLocation();
  const nextPath = new URLSearchParams(window.location.search).get('next');
  const safeNextPath = nextPath === '/bdo/dashboard' ? nextPath : null;

  if (user) {
    const isBdo = user.roles.includes('BDO');
    const currentDashboard = isBdo ? '/bdo/dashboard' : '/';
    const currentRole = user.roles[0] ?? 'EnBO user';

    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <Card className="z-10 w-full max-w-md mx-6 border-border shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">You are already signed in</CardTitle>
            <CardDescription>
              Signed in as <strong>{user.name}</strong> ({currentRole}).
              {safeNextPath && !isBdo && ' Sign out before using the BDO activation link.'}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" onClick={() => navigate(currentDashboard)}>
              Continue to {isBdo ? 'BDO Dashboard' : 'Executive Dashboard'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                await logout();
                navigate(safeNextPath ? `/login?next=${encodeURIComponent(safeNextPath)}` : '/login');
              }}
            >
              Sign in as a different user
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(user.roles.includes('BDO') ? (safeNextPath ?? '/bdo/dashboard') : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="z-10 w-full max-w-md p-6">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex flex-col items-center">
            <img
              src={logoOnLight}
              alt="EnBO by VERJ"
              className="h-20 w-auto object-contain"
            />
            <div className="text-[10px] tracking-widest text-muted-foreground/60 uppercase mt-2">Energy, Business &amp; Operations Management</div>
          </div>
        </div>

        <Card className="border-border shadow-xl">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
              <CardDescription className="uppercase tracking-widest text-xs font-semibold mt-2">
                REDEFINE YOUR LIMIT.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@verjsolar.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full font-bold" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</> : 'Access System'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Default password: <span className="font-mono">VERJ@2026</span>
        </p>
      </div>
    </div>
  );
}
