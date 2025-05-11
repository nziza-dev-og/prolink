
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Users, ShieldAlert, UserPlus, Edit2, Trash2, Eye, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UserProfile } from '@/types';
import { getAllUserProfiles } from '@/lib/user-service';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

interface MockAdmin {
  id: string;
  avatarUrl?: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Editor' | 'Viewer';
}

export default function AdminUsersPage() {
  const { currentUser } = useAuth(); 
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const mockAdmins = useMemo<MockAdmin[]>(() => [
    {
      id: currentUser?.uid || 'admin1',
      avatarUrl: currentUser?.profilePictureUrl || `https://picsum.photos/seed/${currentUser?.uid || 'admin1'}/40`,
      name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Current Admin',
      email: currentUser?.email || 'admin@example.com',
      role: 'Super Admin',
    },
    {
      id: 'admin2',
      avatarUrl: 'https://picsum.photos/seed/admin2/40',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      role: 'Editor',
    },
    {
      id: 'admin3',
      avatarUrl: 'https://picsum.photos/seed/admin3/40',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'Viewer',
    }
  ], [currentUser]);

  useEffect(() => {
    async function fetchUsers() {
      setIsLoadingUsers(true);
      try {
        const fetchedUsers = await getAllUserProfiles();
        setAllUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({ title: "Error", description: "Could not load users.", variant: "destructive" });
      } finally {
        setIsLoadingUsers(false);
      }
    }
    fetchUsers();
  }, [toast]);

  const filteredUsers = allUsers.filter(user =>
    (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
      </div>
      <CardDescription>Manage user accounts, view profiles, and handle user-related issues.</CardDescription>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center"><ShieldAlert className="mr-2 h-5 w-5" /> Manage Admins</CardTitle>
            <CardDescription>Oversee platform administrators and their roles.</CardDescription>
          </div>
          <Button disabled><UserPlus className="mr-2 h-4 w-4" /> Add Admin (Soon)</Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={admin.avatarUrl} alt={admin.name} data-ai-hint="admin avatar"/>
                          <AvatarFallback>{admin.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{admin.name}</p>
                          <p className="text-xs text-muted-foreground">{admin.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{admin.role}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="icon" className="h-8 w-8" title="Edit Admin (Soon)" disabled>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" title="Remove Admin (Soon)" disabled>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl">Platform Users ({isLoadingUsers ? "..." : filteredUsers.length})</CardTitle>
            <CardDescription>View and manage all registered users on the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                  placeholder="Search users by name or email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
              />
            </div>
            {isLoadingUsers ? (
                <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
            ) : filteredUsers.length > 0 ? (
                <ScrollArea className="h-[400px] mt-2 border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map(user => (
                            <TableRow key={user.uid}>
                                <TableCell>
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.profilePictureUrl} alt={user.firstName || 'user'} data-ai-hint="user avatar small"/>
                                    <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.createdAt ? format(new Date(user.createdAt as string), "PP") : 'N/A'}</TableCell>
                                <TableCell className="text-right space-x-1">
                                    <Button variant="outline" size="icon" className="h-7 w-7" asChild title="View Profile">
                                        <Link href={`/profile/${user.uid}`}><Eye className="h-4 w-4"/></Link>
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-7 w-7" title="Edit User (Soon)" disabled>
                                        <Edit2 className="h-4 w-4"/>
                                    </Button>
                                     <Button variant="destructive" size="icon" className="h-7 w-7" title="Delete User (Soon)" disabled>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            ) : (
                <p className="text-muted-foreground text-sm text-center py-10">
                    {searchTerm ? 'No users match your search.' : 'No users found.'}
                </p>
            )}
             <div className="flex space-x-2 pt-2">
                <Button variant="outline" disabled>Manage User Roles (Soon)</Button>
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
