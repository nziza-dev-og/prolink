'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockUserProfiles } from "@/lib/mock-data";
import type { UserProfile } from "@/types";
import { UserPlus, Users, Loader2, Contact } from "lucide-react"; // Added Contact
import { useAuth } from '@/context/auth-context';

// Mock data for invitations (incoming connection requests)
const mockInvitationsData: UserProfile[] = mockUserProfiles.slice(3, 5).map(p => ({...p, uid: p.id, email: `${p.firstName.toLowerCase()}@example.com`, createdAt: new Date().toISOString(), headline: `Wants to connect with you. Common connections: ${Math.floor(Math.random()*10)}`, connectionsCount: p.connectionsCount || 0 }));


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
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [invitations, setInvitations] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  useEffect(() => {
    if (currentUser) {
      // Filter invitations to exclude current user
      const filteredInvitations = mockInvitationsData.filter(inv => inv.uid !== currentUser.uid);
      setInvitations(filteredInvitations);

      // Filter suggestions
      const currentUserLocation = currentUser.location;
      const currentUserConnections = currentUser.connections || [];
      
      const filteredSuggestions = mockUserProfiles.filter(p => 
        p.uid !== currentUser.uid && // Not the current user
        !currentUserConnections.includes(p.uid) && // Not already connected
        !filteredInvitations.some(inv => inv.uid === p.uid) && // Not in pending invitations
        (currentUserLocation ? p.location === currentUserLocation : true) // Same location or all if no location for current user
      ).slice(0, 6); // Show up to 6 suggestions
      setSuggestions(filteredSuggestions);
    }
  }, [currentUser]);


  if (loadingAuth || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const connectionsDisplayCount = currentUser.connections?.length ?? currentUser.connectionsCount ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Panel: Manage Network */}
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
                <Contact className="mr-3 h-5 w-5 text-muted-foreground" /> {/* Replaced People Icon */}
                 Contacts
              </div>
              <span className="text-sm text-muted-foreground">0</span> {/* Mock */}
            </Link>
            <Link href="#" className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-md" aria-disabled="true" onClick={(e) => e.preventDefault()}>
              <div className="flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> {/* People Icon for Following */}
                 People I Follow
              </div>
              <span className="text-sm text-muted-foreground">0</span> {/* Mock */}
            </Link>
            <Link href="#" className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-md" aria-disabled="true" onClick={(e) => e.preventDefault()}>
              <div className="flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-muted-foreground"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> {/* Calendar Icon */}
                 Events
              </div>
              <span className="text-sm text-muted-foreground">0</span> {/* Mock */}
            </Link>
          </CardContent>
        </Card>
        <Card>
            <CardContent className="p-4 text-center">
                <p className="text-sm mb-2">Add personal contacts</p>
                <p className="text-xs text-muted-foreground mb-3">We’ll periodically import and store your contacts to help you and others connect. You choose who to connect to and who to invite. <Link href="#" className="text-primary">Learn more</Link></p>
                <Button variant="outline" className="w-full" disabled>Import contacts</Button>
            </CardContent>
        </Card>
      </aside>

      {/* Right Panel: Invitations and Suggestions */}
      <section className="md:col-span-2 space-y-6">
        {invitations.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-lg">Invitations</CardTitle>
              <Button variant="ghost" size="sm" disabled>See all {invitations.length}</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {invitations.map(user => (
                <InvitationCard key={user.uid} user={user} />
              ))}
            </CardContent>
          </Card>
        )}

        {suggestions.length > 0 && (
            <div>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">People you may know {currentUser.location ? `from ${currentUser.location}` : ''}</h2>
                <Button variant="ghost" size="sm" disabled>See all</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map(user => ( 
                <SuggestionCard key={user.uid} user={user} />
                ))}
            </div>
            </div>
        )}
         {suggestions.length === 0 && !loadingAuth && (
             <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    No new suggestions right now.
                </CardContent>
            </Card>
         )}
      </section>
    </div>
  );
}
