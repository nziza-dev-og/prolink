'use client';

import Link from 'next/link';
import { Bell, Briefcase, Home, MessageSquareText, Search, Users, UserCircle, ChevronDown, LogOut, Settings, User } from 'lucide-react';
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
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/network', label: 'My Network', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/messaging', label: 'Messaging', icon: MessageSquareText },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

// Mock current user data
const currentUser = {
  name: 'Alice Johnson',
  headline: 'Senior Software Engineer',
  profilePictureUrl: 'https://picsum.photos/seed/alice/40/40',
  id: '1'
};


export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" aria-label="ProLink Home">
            <LinkedInLogo className="h-8 w-8" />
          </Link>
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search"
              className="pl-8 w-[200px] lg:w-[280px] h-9 rounded-md"
            />
          </div>
        </div>

        <nav className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center p-1 text-xs text-muted-foreground hover:text-foreground transition-colors",
                pathname === item.href && "text-foreground border-b-2 border-primary"
              )}
              aria-label={item.label}
            >
              <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="hidden sm:block text-xs">{item.label}</span>
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-auto p-1 flex flex-col items-center text-xs text-muted-foreground hover:text-foreground">
                 <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                    <AvatarImage src={currentUser.profilePictureUrl} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
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
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.headline}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/profile/${currentUser.id}`}>
                  <User className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings & Privacy</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
