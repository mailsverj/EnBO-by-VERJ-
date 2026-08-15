import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'wouter';
import logoPath from '@assets/Copy_of_Modern_Cabinet_Furniture_Product_1786754353697.png';

export default function Login() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <div className="z-10 w-full max-w-md p-6">
        <div className="flex flex-col items-center gap-2 mb-8">
          <img
            src={logoPath}
            alt="VERJ"
            className="h-12 object-contain"
            style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(96%) saturate(600%) hue-rotate(2deg) brightness(105%)' }}
          />
          <div className="text-center">
            <div className="text-4xl font-black tracking-tight text-foreground">BuDOM</div>
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mt-0.5">by VERJ</div>
            <div className="text-[10px] tracking-widest text-muted-foreground/60 uppercase mt-0.5">Business Development & Operations Management</div>
          </div>
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
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
