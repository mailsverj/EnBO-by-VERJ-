import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Users, FileText, UserSquare2,
  Settings, LogOut, Briefcase, FileSpreadsheet,
  Calculator, Banknote, ShieldCheck, HardHat, FileDigit, Loader2,
  BookOpen, Megaphone, Menu, X
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import logoPath from '@assets/Copy_of_Modern_Cabinet_Furniture_Product_1786754353697.png';
import { api } from '@/lib/api';

const allLinks = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['Super Admin', 'Chief Admin', 'Management', 'Sales Admin', 'Finance', 'Lead Technical Officer'] },

  // BDO Management
  { path: '/bdo/applications', icon: FileText, label: 'Applications', group: 'BDO Management', roles: ['Super Admin', 'Chief Admin', 'Recruitment/Admin', 'Management'] },
  { path: '/bdo/directory', icon: Users, label: 'BDO Directory', group: 'BDO Management', roles: ['Super Admin', 'Chief Admin', 'Recruitment/Admin', 'Management', 'Sales Admin'] },

  // Operations
  { path: '/leads', icon: Briefcase, label: 'Leads Pipeline', group: 'Operations', roles: ['Super Admin', 'Chief Admin', 'Sales Admin', 'Management', 'BDO', 'Technical Officer', 'Lead Technical Officer'] },
  { path: '/customers', icon: UserSquare2, label: 'Customers', group: 'Operations', roles: ['Super Admin', 'Chief Admin', 'Sales Admin', 'Management'] },

  // Engineering
  { path: '/engineering/queue', icon: FileText, label: 'Engineering Queue', group: 'Engineering', roles: ['Super Admin', 'Chief Admin', 'Technical Officer', 'Lead Technical Officer', 'Engineer', 'Management'] },
  { path: '/engineering/designs', icon: FileDigit, label: 'Technical Designs', group: 'Engineering', roles: ['Super Admin', 'Chief Admin', 'Technical Officer', 'Lead Technical Officer', 'Engineer', 'Management'] },
  { path: '/engineering/calculator', icon: Calculator, label: 'System Calculator', group: 'Engineering', roles: ['Super Admin', 'Chief Admin', 'Technical Officer', 'Lead Technical Officer', 'Engineer'] },
  { path: '/inventory', icon: HardHat, label: 'Inventory', group: 'Engineering', roles: ['Super Admin', 'Chief Admin', 'Technical Officer', 'Lead Technical Officer', 'Engineer', 'Finance', 'Management'] },

  // Finance
  { path: '/invoicing', icon: FileSpreadsheet, label: 'Invoices', group: 'Finance', roles: ['Super Admin', 'Chief Admin', 'Finance', 'Management', 'Sales Admin', 'Sales'] },
  { path: '/commission', icon: Banknote, label: 'Commission Ledger', group: 'Finance', roles: ['Super Admin', 'Chief Admin', 'Finance', 'Management', 'BDO', 'Sales'] },
  { path: '/finance', icon: ShieldCheck, label: 'Accounting', group: 'Finance', roles: ['Super Admin', 'Chief Admin', 'Finance', 'Management', 'Sales'] },

  // Training & Comms
  { path: '/training', icon: BookOpen, label: 'Training Portal', group: 'Training & Comms', roles: ['Super Admin', 'Chief Admin', 'Recruitment/Admin', 'Management', 'BDO', 'Technical Officer', 'Lead Technical Officer', 'Engineer', 'Sales Admin', 'Finance'] },
  { path: '/broadcasts', icon: Megaphone, label: 'Broadcasts', group: 'Training & Comms', roles: ['Super Admin', 'Chief Admin', 'Recruitment/Admin', 'Management', 'BDO', 'Technical Officer', 'Lead Technical Officer', 'Engineer', 'Sales Admin', 'Finance'] },

  // Settings
  { path: '/settings', icon: Settings, label: 'System Settings', group: 'System', roles: ['Super Admin', 'Chief Admin', 'Management'] },
];

interface SidebarContentProps {
  onNavigate?: () => void;
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  const { data: unreadData } = useQuery({
    queryKey: ['broadcasts', 'unread-count'],
    queryFn: () => api.broadcasts.unreadCount(),
    refetchInterval: 60_000,
    enabled: !!user,
  });
  const unreadCount = unreadData?.unread ?? 0;

  if (!user) return null;

  const hasAnyRole = (allowedRoles: string[]) =>
    user.roles.some(r => allowedRoles.includes(r));

  const links = allLinks.filter(link => hasAnyRole(link.roles));
  const groups = Array.from(new Set(links.map(l => l.group).filter(Boolean)));
  const noGroupLinks = links.filter(l => !l.group);

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
    navigate('/login');
  };

  const navLink = (link: typeof allLinks[0]) => (
    <Link
      key={link.path}
      href={link.path}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        location === link.path
          ? 'bg-primary text-primary-foreground font-medium shadow-sm'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
      }`}
    >
      <link.icon className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm flex-1">{link.label}</span>
      {link.path === '/broadcasts' && unreadCount > 0 && (
        <span className="ml-auto text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border bg-sidebar gap-3 flex-shrink-0">
        <img
          src={logoPath}
          alt="VERJ"
          className="h-8 object-contain flex-shrink-0"
          style={{ filter: 'brightness(0) saturate(100%) invert(73%) sepia(96%) saturate(600%) hue-rotate(2deg) brightness(105%)' }}
        />
        <div className="min-w-0">
          <div className="text-sidebar-primary font-black text-lg leading-none tracking-tight">EnBO</div>
          <div className="text-sidebar-foreground/50 text-[9px] font-semibold tracking-[0.15em] uppercase leading-none mt-0.5">by VERJ</div>
        </div>
      </div>

      {/* Nav links */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-6">
          {noGroupLinks.length > 0 && (
            <div className="space-y-1">
              {noGroupLinks.map(navLink)}
            </div>
          )}
          {groups.map(group => (
            <div key={group} className="space-y-1">
              <h4 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 mt-4">{group}</h4>
              {links.filter(l => l.group === group).map(navLink)}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User info + logout */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar/50 space-y-3 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">{user.name[0]}</span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</div>
            <div className="text-[10px] text-sidebar-foreground/50 truncate">{user.roles[0]}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs h-8 px-2"
          onClick={handleLogout}
        >
          <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (location === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Desktop sidebar (always visible ≥ md) ── */}
      <div className="hidden md:flex fixed left-0 top-0 h-screen z-40 shadow-sm">
        <SidebarContent />
      </div>

      {/* ── Mobile drawer ── */}
      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      {/* Drawer panel */}
      <div
        className={`fixed left-0 top-0 h-screen z-50 md:hidden shadow-xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </div>

      {/* ── Main area ── */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="font-semibold text-sm tracking-widest text-muted-foreground hidden sm:block">
              REDEFINE YOUR LIMIT.
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {user && (
              <span className="text-xs hidden sm:block">{user.email}</span>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
