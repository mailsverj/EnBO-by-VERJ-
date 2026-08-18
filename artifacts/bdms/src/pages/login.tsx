import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import logoPath from '@assets/Copy_of_Modern_Cabinet_Furniture_Product_1786754353697.png';
import { useAuth } from '@/store/auth';

export default function Login() {
  const [email, setEmail] = useState('admin@verjsolar.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
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
            <div className="inline-flex flex-col items-start">
              <div className="text-4xl font-black tracking-tight text-white" style={{ textShadow: '0 1px 12px rgba(0,0,0,0.35)' }}>EnBO</div>
              <div className="flex items-center gap-1.5 mt-1 w-full">
                <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase shrink-0">by</span>
                <img
                  src={logoPath}
                  alt="VERJ"
                  className="flex-1 h-5 object-contain object-left"
                  style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(96%) saturate(600%) hue-rotate(2deg) brightness(105%)' }}
                />
              </div>
            </div>
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
