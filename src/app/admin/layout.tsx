
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LayoutDashboard, Users, FileText, LineChart, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context'; // Assuming useAuth can be used for admin logout logic if needed

interface AdminLayoutProps {
  children: ReactNode;
}

const sidebarNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: LineChart },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-card border-r p-4 space-y-2 flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-primary">Admin Panel</h2>
      <nav className="flex-grow">
        {sidebarNavItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start mb-1",
              pathname === item.href && "bg-accent text-accent-foreground hover:bg-accent/90"
            )}
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
    </aside>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { loadingAuth } = useAuth();
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAdmin = localStorage.getItem('isAdmin');
      if (isAdmin === 'true') {
        setIsAdminVerified(true);
      } else {
        router.push('/admin/login');
      }
    }
    setIsVerifying(false);
  }, [router]);

  if (isVerifying || loadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdminVerified) {
    // Redirect is handled in useEffect, this is a fallback.
    return null; 
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]"> {/* Adjust min-h based on header height */}
      <AdminSidebar />
      <main className="flex-grow p-6 bg-background overflow-auto">
        {children}
      </main>
    </div>
  );
}
