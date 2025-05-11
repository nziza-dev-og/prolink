
'use client';

import Link from 'next/link';
import { Bell, Briefcase, Home, MessageSquareText, Search, Users, ChevronDown, LogOut, Settings, User as UserIcon, Loader2, ShieldCheck, CalendarDays } from 'lucide-react';
import { ProLinkLogo } from '@/components/icons/prolink-logo';
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
import type { Notification } from '@/types';
import { getAllUserNotifications } from '@/lib/notification-service';
import { updateUserProfile } from '@/lib/user-service';


const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/network', label: 'My Network', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/messaging', label: 'Messaging', icon: MessageSquareText },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, loadingAuth, refetchUserProfile } = useAuth();
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
    async function fetchNotificationsCount() {
      if (currentUser) {
        try {
          const allNotifications = await getAllUserNotifications(currentUser.uid);
          const unreadCount = allNotifications.filter(n => !n.isRead).length;
          setUnreadNotificationsCount(unreadCount);
        } catch (error) {
          console.error("Failed to fetch notifications count:", error);
          setUnreadNotificationsCount(0);
        }
      } else {
        setUnreadNotificationsCount(0);
      }
    }
    if (currentUser) {
        fetchNotificationsCount();
    }
    // Re-fetch on pathname change if desired, e.g., after visiting notifications page
  }, [currentUser, pathname]); 

  const handleSignOut = async () => {
    try {
      if (currentUser) {
        await updateUserProfile(currentUser.uid, { isActive: false, lastLogin: new Date() });
      }
      await signOut(auth);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isAdmin');
      }
      setIsAdmin(false);
      setCurrentUser(null); // Update local state in AuthContext
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.push('/login');
    } catch (error: any) {
      toast({ title: 'Sign Out Error', description: error.message, variant: 'destructive' });
    }
  };

  // Helper in AuthContext to update currentUser
  const setCurrentUser = (user: any) => {
    // This is a simplified stand-in. AuthContext should ideally expose a setUser method.
    // For now, we'll rely on onAuthStateChanged to eventually clear it.
    // Or, more directly, modify refetchUserProfile or add a clearUser function to AuthContext.
    refetchUserProfile(); 
  };


  return (
    <header className="bg-background sticky top-0 z-50 py-2">
      <div className="container mx-auto px-4 h-auto md:h-16 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-start mb-2 md:mb-0">
          <Link href="/" aria-label="ProLink Home">
            <ProLinkLogo className="h-8 w-8" />
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
           {/* Mobile-only user dropdown trigger - to ensure "Me" is always accessible */}
           {currentUser && (
            <div className="md:hidden">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-10 w-10">
                             <Avatar className="h-7 w-7">
                                <AvatarImage src={currentUser.profilePictureUrl} alt={`${currentUser.firstName} ${currentUser.lastName}`} data-ai-hint="user avatar small"/>
                                <AvatarFallback>{currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}</AvatarFallback>
                                {currentUser.isActive && <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-1 ring-card" />}
                            </Avatar>
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
                      <DropdownMenuItem asChild><Link href={`/profile/${currentUser.uid}`}><UserIcon className="mr-2 h-4 w-4" /><span>View Profile</span></Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/settings"><Settings className="mr-2 h-4 w-4" /><span>Settings & Privacy</span></Link></DropdownMenuItem>
                      {isAdmin && <DropdownMenuItem asChild><Link href="/admin/dashboard"><ShieldCheck className="mr-2 h-4 w-4" /><span>Admin Dashboard</span></Link></DropdownMenuItem>}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /><span>Sign Out</span></DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
           )}
        </div>

        <div className="flex items-center justify-center w-full md:w-auto">
          {loadingAuth ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : currentUser ? (
            <div className="flex items-center space-x-0 md:space-x-2">
              <nav className="bg-card rounded-full shadow-md p-1 flex items-center space-x-0.5 sm:space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group relative flex flex-col items-center justify-center p-1.5 sm:p-2 min-w-[56px] sm:min-w-[64px] h-[56px] sm:h-[60px] rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={item.label}
                  >
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all duration-150 ease-in-out",
                      pathname === item.href ? "bg-primary scale-105" : "bg-transparent group-hover:bg-accent/20"
                    )}>
                      <item.icon className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                        pathname === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                      )} />
                    </div>
                    <span className={cn(
                      "mt-0.5 text-[10px] sm:text-xs transition-colors whitespace-nowrap",
                      pathname === item.href ? "text-primary font-semibold" : "text-muted-foreground group-hover:text-accent-foreground"
                    )}>
                      {item.label}
                    </span>
                    {item.href === '/notifications' && unreadNotificationsCount > 0 && (
                      <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-destructive text-[9px] sm:text-[10px] text-destructive-foreground ring-1 sm:ring-2 ring-card">
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              <div className="hidden md:flex"> {/* Hide "Me" on mobile here, show avatar-only trigger above */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="ml-1 sm:ml-2 relative h-auto p-1 flex flex-col items-center text-xs text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[56px] sm:min-w-[64px] h-[56px] sm:h-[60px] rounded-xl group">
                       <div className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all duration-150 ease-in-out group-hover:bg-accent/20">
                        <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                          <AvatarImage src={currentUser.profilePictureUrl} alt={`${currentUser.firstName} ${currentUser.lastName}`} data-ai-hint="user avatar small"/>
                          <AvatarFallback>{currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}</AvatarFallback>
                          {currentUser.isActive && <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-1 ring-card" />}
                        </Avatar>
                      </div>
                      <div className='flex items-center mt-0.5 text-muted-foreground group-hover:text-accent-foreground'>
                        <span className="text-[10px] sm:text-xs">Me</span>
                        <ChevronDown className="h-3 w-3 ml-0.5" />
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
                    <DropdownMenuItem asChild><Link href={`/profile/${currentUser.uid}`}><UserIcon className="mr-2 h-4 w-4" /><span>View Profile</span></Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/settings"><Settings className="mr-2 h-4 w-4" /><span>Settings & Privacy</span></Link></DropdownMenuItem>
                    {isAdmin && <DropdownMenuItem asChild><Link href="/admin/dashboard"><ShieldCheck className="mr-2 h-4 w-4" /><span>Admin Dashboard</span></Link></DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /><span>Sign Out</span></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
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
        </div>
      </div>
    </header>
  );
}
