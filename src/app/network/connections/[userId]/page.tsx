
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUserProfile } from '@/lib/user-service';
import type { UserProfile } from "@/types";
import { Loader2, MessageSquare, UserX } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

function ConnectionCard({ connection }: { connection: UserProfile }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-3">
          <Link href={`/profile/${connection.uid}`}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={connection.profilePictureUrl} alt={connection.firstName} data-ai-hint="user avatar"/>
              <AvatarFallback>{connection.firstName?.charAt(0)}{connection.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={`/profile/${connection.uid}`} className="font-semibold hover:underline">
              {connection.firstName} {connection.lastName}
            </Link>
            <p className="text-sm text-muted-foreground truncate max-w-xs">{connection.headline}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/messaging?chatWith=${connection.uid}`}>
            <MessageSquare className="mr-2 h-4 w-4" /> Message
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function UserConnectionsPage() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const { currentUser, loadingAuth } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [connections, setConnections] = useState<UserProfile[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
        router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);
  
  useEffect(() => {
    async function fetchConnectionsData() {
      if (userId) {
        setIsLoadingData(true);
        try {
          const userProfileData = await getUserProfile(userId);
          setProfile(userProfileData);

          if (userProfileData?.connections && userProfileData.connections.length > 0) {
            const connectionProfiles = await Promise.all(
              userProfileData.connections.map(connId => getUserProfile(connId))
            );
            setConnections(connectionProfiles.filter(p => p !== null) as UserProfile[]);
          } else {
            setConnections([]);
          }
        } catch (error) {
          console.error("Failed to fetch connections data:", error);
          toast({ title: "Error", description: "Could not load connections details.", variant: "destructive" });
        } finally {
          setIsLoadingData(false);
        }
      }
    }
    if (!loadingAuth && currentUser) {
        fetchConnectionsData();
    }
  }, [userId, loadingAuth, currentUser, toast]);

  if (loadingAuth || isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-10">User profile not found.</div>;
  }
  
  const isOwnProfile = currentUser?.uid === userId;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isOwnProfile ? "Your Connections" : `${profile.firstName} ${profile.lastName}'s Connections`}
          </CardTitle>
          <CardDescription>
            {connections.length} {connections.length === 1 ? "connection" : "connections"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length > 0 ? (
            <div className="space-y-4">
              {connections.map(conn => (
                <ConnectionCard key={conn.uid} connection={conn} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <UserX className="h-12 w-12 mx-auto mb-4" />
              <p>No connections to display.</p>
              {isOwnProfile && <Button asChild className="mt-4"><Link href="/network">Find new connections</Link></Button>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
