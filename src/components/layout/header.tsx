'use client';

import Link from 'next/link';
import { Bell, Briefcase, Home, MessageSquareText, Search, Users, ChevronDown, LogOut, Settings, User as UserIcon, Loader2, ShieldCheck } from 'lucide-react';
import { LinkedInLogo } from '@/components/icons/linkedin-logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { generateMockNotifications } from '@/lib/mock-data';
import type { Notification } from '@/types';


const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/network', label: 'My Network', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/messaging', label: 'Messaging', icon: MessageSquareText },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, loadingAuth } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminStatus = localStorage.getItem('isAdmin');
      setIsAdmin(adminStatus === 'true');
    }
  }, [pathname]); 

  useEffect(() => {
    if (currentUser) {
      // Simulate fetching notifications and counting unread ones
      const allNotifications = generateMockNotifications(currentUser.uid);
      const unreadCount = allNotifications.filter(n => !n.isRead).length;
      setUnreadNotificationsCount(unreadCount);
    } else {
      setUnreadNotificationsCount(0);
    }
  }, [currentUser, pathname]); // Re-check on pathname change as well, in case navigation clears notifications

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isAdmin');
      }
      setIsAdmin(false);
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.push('/login');
    } catch (error: any) {
      toast({ title: 'Sign Out Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" aria-label="ProLink Home">
            <LinkedInLogo className="h-8 w-8" />
          </Link>
          {currentUser && (
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search"
                className="pl-8 w-[200px] lg:w-[280px] h-9 rounded-md"
                disabled // Search functionality not implemented globally yet
              />
            </div>
          )}
        </div>

        <nav className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          {loadingAuth ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : currentUser ? (
            <>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center p-1 text-xs text-muted-foreground hover:text-foreground transition-colors",
                    pathname === item.href && "text-foreground border-b-2 border-primary"
                  )}
                  aria-label={item.label}
                >
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  {item.href === '/notifications' && unreadNotificationsCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                  <span className="hidden sm:block text-xs">{item.label}</span>
                </Link>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-auto p-1 flex flex-col items-center text-xs text-muted-foreground hover:text-foreground">
                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                      <AvatarImage src={currentUser.profilePictureUrl} alt={`${currentUser.firstName} ${currentUser.lastName}`} data-ai-hint="user avatar small"/>
                      <AvatarFallback>{currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className='hidden sm:flex items-center'>
                      <span className="text-xs">Me</span>
                      <ChevronDown className="h-3 w-3" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.firstName} {currentUser.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.headline}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${currentUser.uid}`}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>View Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings & Privacy</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="space-x-2">
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
