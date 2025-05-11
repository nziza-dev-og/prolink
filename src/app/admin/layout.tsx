
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LayoutDashboard, Users, FileText, LineChart, MessageSquare, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { ProLinkLogo } from '@/components/icons/prolink-logo';

interface AdminLayoutProps {
  children: ReactNode;
}

const sidebarNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: LineChart },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleAdminLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdmin');
    }
    router.push('/'); 
  };

  return (
    <aside className="w-60 bg-card border-r p-4 flex flex-col shadow-md">
      <Link href="/" className="flex items-center gap-2 mb-6 px-2">
        <ProLinkLogo className="h-7 w-7" />
        <h1 className="text-xl font-semibold text-primary">Admin Panel</h1>
      </Link>
      <nav className="flex-grow space-y-1">
        {sidebarNavItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start text-sm font-medium",
              pathname === item.href 
                ? "bg-primary/10 text-primary hover:bg-primary/20" 
                : "hover:bg-accent/50 text-foreground/70 hover:text-foreground"
            )}
          >
            <Link href={item.href}>
              <item.icon className="mr-3 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto">
        <Button
            variant="outline"
            className="w-full justify-start text-sm font-medium text-foreground/70 hover:text-foreground"
            onClick={handleAdminLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Exit Admin
          </Button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const { loadingAuth } = useAuth();
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      const isAdmin = localStorage.getItem('isAdmin');
      if (isAdmin === 'true') {
        setIsAdminVerified(true);
      } else {
        // Only redirect if not already on the login page
        if (pathname !== '/admin/login') { 
          router.push('/admin/login');
        }
      }
      setIsVerifying(false);
    }
  }, [router, pathname]); // Add pathname to dependency array

  if (isVerifying || loadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If on the login page and not verified, let the login page render itself.
  // Otherwise, if not verified and not on login page, this part might still be reached briefly before redirect.
  // The main protection is the redirect in useEffect.
  if (!isAdminVerified && pathname !== '/admin/login') {
    return (
        <div className="flex justify-center items-center min-h-screen bg-background">
            <p>Redirecting to login...</p>
        </div>
    );
  }
  
  // If it's the login page, or if admin is verified, render the content
  if (pathname === '/admin/login' || isAdminVerified) {
    return (
      <div className="flex min-h-screen bg-background">
        {pathname !== '/admin/login' && <AdminSidebar />} {/* Show sidebar only if not login page */}
        <main className="flex-grow p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    );
  }

  // Fallback for any other case (should ideally not be reached if logic is correct)
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
        <p>Verifying admin status...</p>
    </div>
  );
}
