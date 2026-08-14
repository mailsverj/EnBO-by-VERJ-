import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sun } from 'lucide-react';
import { Link } from 'wouter';

export default function Login() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <div className="z-10 w-full max-w-md p-6">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-primary font-bold text-3xl tracking-tight">
            <Sun className="h-8 w-8 text-accent" />
            <span>VERJ<span className="opacity-70 font-medium">SOLAR</span></span>
          </div>
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Command Centre</CardTitle>
            <CardDescription className="uppercase tracking-widest text-xs font-semibold mt-2">
              REDEFINE YOUR LIMIT.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@verjsolar.com" defaultValue="admin@verjsolar.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" defaultValue="password123" />
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/" className="w-full">
              <Button className="w-full font-bold">Access System</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
