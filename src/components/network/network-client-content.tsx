
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile } from "@/types"; 
import { UserPlus, Users, Loader2, Contact, Search, CalendarIcon, UserRoundCog, X } from "lucide-react"; 
import { useAuth } from '@/context/auth-context';
import { 
    searchUserProfiles,
    sendConnectionRequest,
    getInvitationStatus,
    cancelConnectionRequest,
    acceptConnectionRequest,
    ignoreConnectionRequest,
    getPendingInvitations,
} from '@/lib/user-service';
import { useToast } from '@/hooks/use-toast';


function InvitationCard({ invitation, currentUserUid, onInvitationAction }: { invitation: UserProfile & { invitationId: string }, currentUserUid: string, onInvitationAction: () => void }) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await acceptConnectionRequest(invitation.invitationId, currentUserUid, invitation.uid);
      toast({ title: "Connection Accepted", description: `You are now connected with ${invitation.firstName}.` });
      onInvitationAction(); 
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast({ title: "Error", description: "Failed to accept invitation.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIgnore = async () => {
    setIsProcessing(true);
    try {
      await ignoreConnectionRequest(invitation.invitationId, currentUserUid);
      toast({ title: "Invitation Ignored", description: `Invitation from ${invitation.firstName} ignored.` });
      onInvitationAction(); 
    } catch (error) {
      console.error("Error ignoring invitation:", error);
      toast({ title: "Error", description: "Failed to ignore invitation.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="flex flex-col sm:flex-row items-center justify-between p-4">
      <div className="flex items-center space-x-3 mb-3 sm:mb-0 text-center sm:text-left">
        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto sm:mx-0">
          <AvatarImage src={invitation.profilePictureUrl} alt={invitation.firstName || 'user'} data-ai-hint="user avatar"/>
          <AvatarFallback>{invitation.firstName?.charAt(0)}{invitation.lastName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <Link href={`/profile/${invitation.uid}`} className="font-semibold hover:underline">
            {invitation.firstName} {invitation.lastName}
          </Link>
          <p className="text-sm text-muted-foreground">{invitation.headline}</p>
        </div>
      </div>
      <div className="flex space-x-2 mt-2 sm:mt-0 w-full sm:w-auto justify-center sm:justify-end">
        <Button variant="outline" size="sm" onClick={handleIgnore} disabled={isProcessing} className="flex-1 sm:flex-none">
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ignore"}
        </Button>
        <Button size="sm" onClick={handleAccept} disabled={isProcessing} className="flex-1 sm:flex-none">
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Accept"}
        </Button>
      </div>
    </Card>
  );
}

function SuggestionCard({ user, currentUserUid }: { user: UserProfile, currentUserUid: string }) {
  const { toast } = useToast();
  const [connectionState, setConnectionState] = useState<{ status: 'loading' | 'not_connected' | 'pending_sent' | 'pending_received' | 'connected' | 'error' | 'unknown', invitationId?: string }>({ status: 'loading' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      if (!currentUserUid || !user.uid || currentUserUid === user.uid) {
        setConnectionState({ status: 'unknown' }); 
        return;
      }
      setIsProcessing(true);
      try {
        const result = await getInvitationStatus(currentUserUid, user.uid);
        setConnectionState(result);
      } catch (err) {
        console.error("Error fetching invitation status:", err);
        setConnectionState({ status: 'error' });
        toast({ title: "Error", description: "Could not fetch connection status.", variant: "destructive" });
      } finally {
        setIsProcessing(false);
      }
    }
    fetchStatus();
  }, [currentUserUid, user.uid, toast]);

  const handleConnect = async () => {
    if (!currentUserUid || currentUserUid === user.uid) return;
    setIsProcessing(true);
    try {
      const result = await sendConnectionRequest(currentUserUid, user.uid);
      if (result === 'already_connected') {
        toast({ title: "Already Connected", description: "You are already connected with this user." });
        setConnectionState({ status: 'connected' });
      } else if (result === 'already_sent') {
         toast({ title: "Request Sent", description: "Connection request already pending." });
        const updatedStatus = await getInvitationStatus(currentUserUid, user.uid); 
        setConnectionState(updatedStatus);
      } else if (result === 'already_received') {
        toast({ title: "Request Exists", description: "This user has already sent you a connection request. Check your invitations." });
        const updatedStatus = await getInvitationStatus(currentUserUid, user.uid); 
        setConnectionState(updatedStatus);
      } else if (result) { 
        toast({ title: "Request Sent", description: "Connection request sent successfully!" });
        setConnectionState({ status: 'pending_sent', invitationId: result });
      } else { 
         toast({ title: "Error", description: "Could not send connection request.", variant: "destructive" });
         setConnectionState({ status: 'error' });
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast({ title: "Error", description: "Failed to send connection request.", variant: "destructive" });
      setConnectionState({ status: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCancelRequest = async () => {
    if (!connectionState.invitationId || !currentUserUid || !user.uid) return;
    setIsProcessing(true);
    try {
        await cancelConnectionRequest(connectionState.invitationId, currentUserUid, user.uid); 
        toast({ title: "Request Cancelled", description: "Connection request has been cancelled." });
        setConnectionState({ status: 'not_connected', invitationId: undefined });
    } catch (error) {
        console.error("Error cancelling request:", error);
        toast({ title: "Error", description: "Failed to cancel request.", variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
  };


  let buttonContent: React.ReactNode;
  let buttonAction: (() => Promise<void>) | undefined = undefined;
  let buttonDisabled = isProcessing || connectionState.status === 'loading' || connectionState.status === 'unknown';

  switch (connectionState.status) {
    case 'loading':
      buttonContent = <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>;
      buttonDisabled = true;
      break;
    case 'not_connected':
      buttonContent = <><UserPlus className="mr-2 h-4 w-4" /> Connect</>;
      buttonAction = handleConnect;
      break;
    case 'pending_sent':
      buttonContent = <><X className="mr-2 h-4 w-4" /> Cancel</>; 
      buttonAction = handleCancelRequest; 
      break;
    case 'pending_received':
      buttonContent = "Accept Invite"; 
      buttonAction = async () => { 
        if (!connectionState.invitationId) return;
        setIsProcessing(true);
        try {
          await acceptConnectionRequest(connectionState.invitationId, currentUserUid, user.uid);
          toast({ title: "Connection Accepted", description: `You are now connected with ${user.firstName}.` });
          setConnectionState({ status: 'connected' });
        } catch (error) {
          toast({ title: "Error", description: "Failed to accept connection.", variant: "destructive" });
          setConnectionState({ status: 'pending_received', invitationId: connectionState.invitationId }); // Revert to previous state on error
        } finally {
          setIsProcessing(false);
        }
      };
      break;
    case 'connected':
      buttonContent = "Connected";
      buttonDisabled = true;
      break;
    case 'error':
      buttonContent = <><UserPlus className="mr-2 h-4 w-4" /> Connect</>;
      buttonAction = handleConnect; 
      break;
    case 'unknown':
    default:
      buttonContent = <><UserPlus className="mr-2 h-4 w-4" /> Connect</>;
      buttonDisabled = true;
  }

  if (currentUserUid === user.uid) return null; 

  return (
    <Card className="text-center">
      <CardContent className="p-4">
        <Link href={`/profile/${user.uid}`}>
          <Avatar className="h-20 w-20 mx-auto mb-2">
            <AvatarImage src={user.profilePictureUrl} alt={user.firstName || 'user'} data-ai-hint="user avatar medium"/>
            <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <Link href={`/profile/${user.uid}`} className="block font-semibold hover:underline">
          {user.firstName} {user.lastName}
        </Link>
        <p className="text-xs text-muted-foreground h-8 overflow-hidden mb-2">{user.headline}</p>
        <Button variant="outline" className="w-full" onClick={buttonAction} disabled={buttonDisabled}>
          {buttonContent}
        </Button>
      </CardContent>
    </Card>
  );
}


export default function NetworkClientContent() {
  const { currentUser, loadingAuth, refetchUserProfile } = useAuth();
  const router = useRouter();
  const searchParamsHook = useSearchParams(); 
  const { toast } = useToast();
  
  const [invitations, setInvitations] = useState<(UserProfile & {invitationId: string})[]>([]); 
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedSuggestions, setDisplayedSuggestions] = useState<UserProfile[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false); 

  useEffect(() => {
    const initialSearch = searchParamsHook.get('search');
    if (initialSearch) {
      setSearchTerm(initialSearch);
    }
  }, [searchParamsHook]);


  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  const fetchInvitations = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingInvitations(true);
    try {
      const pendingInvites = await getPendingInvitations(currentUser.uid);
      setInvitations(pendingInvites);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast({title: "Error", description: "Could not load invitations.", variant: "destructive"});
    } finally {
      setIsLoadingInvitations(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    if (!loadingAuth && currentUser) {
        fetchInvitations();
    }
  }, [currentUser, loadingAuth, fetchInvitations]);

  useEffect(() => {
    async function fetchAndSetSuggestions() {
      if (!currentUser) return;

      if (searchTerm.trim()) {
        setIsLoadingSuggestions(true);
        try {
          const results = await searchUserProfiles(searchTerm, currentUser.uid);
          setDisplayedSuggestions(results);
        } catch (error) {
          console.error("Error searching profiles:", error);
          setDisplayedSuggestions([]);
          toast({ title: "Search Error", description: "Could not perform search.", variant: "destructive" });
        } finally {
            setIsLoadingSuggestions(false);
        }
      } else {
        setDisplayedSuggestions([]); 
        setIsLoadingSuggestions(false);
      }
    }

    const debounceTimer = setTimeout(() => {
        if (!loadingAuth && currentUser) {
            fetchAndSetSuggestions();
        }
    }, 300); 

    return () => clearTimeout(debounceTimer);

  }, [searchTerm, currentUser, loadingAuth, toast]);


  const handleInvitationAction = () => {
    fetchInvitations(); 
    if(currentUser) refetchUserProfile(); 
  };

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
      <aside className="md:col-span-1 space-y-4 md:sticky top-20 order-1 md:order-none">
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

      <section className="md:col-span-3 space-y-6 order-2 md:order-none">
        <Card>
            <CardContent className="p-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search" 
                    placeholder="Search by name, email or headline..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            </CardContent>
        </Card>
        
        {isLoadingInvitations ? (
            <div className="flex justify-center items-center py-6"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
        ): invitations.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-lg">Invitations ({invitations.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invitations.map(inviteWithId => ( 
                <InvitationCard key={inviteWithId.invitationId} invitation={inviteWithId} currentUserUid={currentUser.uid} onInvitationAction={handleInvitationAction} />
              ))}
            </CardContent>
          </Card>
        )}
        
        {isLoadingSuggestions ? (
            <div className="flex justify-center items-center py-10"> <Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
        ) : searchTerm && displayedSuggestions.length > 0 ? ( 
            <div>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Search Results ({displayedSuggestions.length})</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedSuggestions.map(user => ( 
                  <SuggestionCard key={user.uid} user={user} currentUserUid={currentUser.uid} />
                ))}
            </div>
            </div>
        ) : searchTerm && !isLoadingSuggestions && displayedSuggestions.length === 0 ? ( 
             <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    No users found matching your search.
                </CardContent>
            </Card>
        ) : !searchTerm && !isLoadingSuggestions && invitations.length === 0 ? ( 
             <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                   Search for people you know or check your invitations.
                </CardContent>
            </Card>
        ) : null }
      </section>
    </div>
  );
}
