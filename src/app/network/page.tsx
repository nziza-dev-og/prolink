'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockUserProfiles, generateMockNotifications } from "@/lib/mock-data"; 
import type { UserProfile, Notification as NotificationType } from "@/types"; 
import { UserPlus, Users, Loader2, Contact, Search, CalendarIcon, UserRoundCog } from "lucide-react"; 
import { useAuth } from '@/context/auth-context';
import { searchUserProfiles } from '@/lib/user-service'; // Import the new search function


function InvitationCard({ user }: { user: UserProfile }) {
  return (
    <Card className="flex flex-col sm:flex-row items-center justify-between p-4">
      <div className="flex items-center space-x-3 mb-3 sm:mb-0">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.profilePictureUrl} alt={user.firstName} data-ai-hint="user avatar"/>
          <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <Link href={`/profile/${user.uid}`} className="font-semibold hover:underline">
            {user.firstName} {user.lastName}
          </Link>
          <p className="text-sm text-muted-foreground">{user.headline}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" disabled>Ignore</Button>
        <Button size="sm" disabled>Accept</Button>
      </div>
    </Card>
  );
}

function SuggestionCard({ user }: { user: UserProfile }) {
  return (
    <Card className="text-center">
      <CardContent className="p-4">
        <Link href={`/profile/${user.uid}`}>
          <Avatar className="h-20 w-20 mx-auto mb-2">
            <AvatarImage src={user.profilePictureUrl} alt={user.firstName} data-ai-hint="user avatar medium"/>
            <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <Link href={`/profile/${user.uid}`} className="block font-semibold hover:underline">
          {user.firstName} {user.lastName}
        </Link>
        <p className="text-xs text-muted-foreground h-8 overflow-hidden mb-2">{user.headline}</p>
        <Button variant="outline" className="w-full" disabled>
          <UserPlus className="mr-2 h-4 w-4" /> Connect
        </Button>
      </CardContent>
    </Card>
  );
}


export default function NetworkPage() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  
  // For mock "People you may know" and "Invitations"
  const [allMockProfiles, setAllMockProfiles] = useState<UserProfile[]>([]); 
  const [invitations, setInvitations] = useState<UserProfile[]>([]); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedSuggestions, setDisplayedSuggestions] = useState<UserProfile[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  // Load mock profiles for default suggestions and invitations (can be replaced later)
  useEffect(() => {
    if (currentUser) {
      setAllMockProfiles(mockUserProfiles);
      // Mock invitations (these would come from a specific 'invitations' collection or notifications)
      const mockInvites = generateMockNotifications(currentUser.uid)
        .filter(n => n.type === 'connection_request' && n.user)
        .map(n => mockUserProfiles.find(p => p.uid === n.user!.id)!)
        .filter(Boolean) as UserProfile[];
      setInvitations(mockInvites);
    }
  }, [currentUser]);

  // Effect for handling search or default suggestions
  useEffect(() => {
    async function fetchAndSetSuggestions() {
      if (!currentUser) return;

      setIsLoadingSuggestions(true);
      if (searchTerm.trim()) {
        try {
          const results = await searchUserProfiles(searchTerm, currentUser.uid);
          setDisplayedSuggestions(results);
        } catch (error) {
          console.error("Error searching profiles:", error);
          setDisplayedSuggestions([]);
          // todo: toast error
        }
      } else {
        // Default suggestions: people from the same location, not connected, not invited (using mock data for now)
        const currentUserConnections = currentUser.connections || [];
        const invitationUIDs = invitations.map(inv => inv.uid);
        const defaultSugg = allMockProfiles.filter(p =>
          p.uid !== currentUser.uid &&
          !currentUserConnections.includes(p.uid) &&
          !invitationUIDs.includes(p.uid) &&
          (currentUser.location ? p.location === currentUser.location : true)
        ).slice(0, 6);
        setDisplayedSuggestions(defaultSugg);
      }
      setIsLoadingSuggestions(false);
    }

    if (!loadingAuth && currentUser) {
        fetchAndSetSuggestions();
    } else if (!loadingAuth && !currentUser) {
        setIsLoadingSuggestions(false); // Not logged in, no suggestions to load
    }
  }, [searchTerm, currentUser, loadingAuth, invitations, allMockProfiles]);


  if (loadingAuth || (!currentUser && !loadingAuth)) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!currentUser) return null;

  const connectionsDisplayCount = currentUser.connections?.length ?? currentUser.connectionsCount ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      <aside className="md:col-span-1 space-y-4 sticky top-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Manage my network</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Link href={`/network/connections/${currentUser.uid}`} className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-md">
              <div className="flex items-center text-sm">
                <Users className="mr-3 h-5 w-5 text-muted-foreground" /> Connections
              </div>
              <span className="text-sm text-muted-foreground">{connectionsDisplayCount}</span>
            </Link>
             <Link href="#" className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-md" aria-disabled="true" onClick={(e) => e.preventDefault()}>
              <div className="flex items-center text-sm">
                <Contact className="mr-3 h-5 w-5 text-muted-foreground" /> Contacts
              </div>
              <span className="text-sm text-muted-foreground">0</span> 
            </Link>
            <Link href="#" className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-md" aria-disabled="true" onClick={(e) => e.preventDefault()}>
              <div className="flex items-center text-sm">
                 <UserRoundCog className="mr-3 h-5 w-5 text-muted-foreground" /> People I Follow
              </div>
              <span className="text-sm text-muted-foreground">0</span> 
            </Link>
            <Link href="#" className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-md" aria-disabled="true" onClick={(e) => e.preventDefault()}>
              <div className="flex items-center text-sm">
                <CalendarIcon className="mr-3 h-5 w-5 text-muted-foreground" /> Events
              </div>
              <span className="text-sm text-muted-foreground">0</span> 
            </Link>
          </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4 text-center">
                <p className="text-sm mb-2">Add personal contacts</p>
                <p className="text-xs text-muted-foreground mb-3">We’ll periodically import and store your contacts to help you and others connect. You choose who to connect to and who to invite. <Link href="#" className="text-primary hover:underline">Learn more</Link></p>
                <Button variant="outline" className="w-full" disabled>Import contacts</Button>
            </CardContent>
        </Card>
      </aside>

      <section className="md:col-span-3 space-y-6">
        <Card>
            <CardContent className="p-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search" 
                    placeholder="Search by name or email..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            </CardContent>
        </Card>

        {invitations.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-lg">Invitations</CardTitle>
              {invitations.length > 3 && <Button variant="ghost" size="sm" disabled>See all {invitations.length}</Button>}
            </CardHeader>
            <CardContent className="space-y-4">
              {invitations.slice(0,3).map(user => ( 
                <InvitationCard key={user.uid} user={user} />
              ))}
            </CardContent>
          </Card>
        )}
        
        {isLoadingSuggestions ? (
            <div className="flex justify-center items-center py-10"> <Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
        ) : displayedSuggestions.length > 0 ? (
            <div>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">
                    {searchTerm ? 'Search Results' : `People you may know ${currentUser.location ? `from ${currentUser.location}` : ''}`}
                </h2>
                {/* Display "See all" only for default suggestions if there are more than shown */}
                {displayedSuggestions.length > 6 && !searchTerm && <Button variant="ghost" size="sm" disabled>See all</Button>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedSuggestions.map(user => ( 
                <SuggestionCard key={user.uid} user={user} />
                ))}
            </div>
            </div>
        ) : (
             <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    {searchTerm ? 'No users found matching your search.' : 'No new suggestions right now. Try searching for people you know.'}
                </CardContent>
            </Card>
        )}
      </section>
    </div>
  );
}
