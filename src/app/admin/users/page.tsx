
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Users, ShieldAlert, UserPlus, Edit2, Trash2, Eye } from 'lucide-react';
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
  const { currentUser } = useAuth(); // For current admin info
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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Users className="mr-2 h-6 w-6" /> User Management</CardTitle>
          <CardDescription>Manage user accounts, view profiles, and handle user-related issues.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center"><ShieldAlert className="mr-2 h-5 w-5" /> Manage Admins</CardTitle>
            <CardDescription>Oversee platform administrators and their roles.</CardDescription>
          </div>
          <Button disabled><UserPlus className="mr-2 h-4 w-4" /> Add Admin (Coming Soon)</Button>
        </CardHeader>
        <CardContent>
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
                    <Button variant="outline" size="icon" className="h-8 w-8" title="Edit Admin (Coming Soon)" disabled>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8" title="Remove Admin (Coming Soon)" disabled>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="text-xl">Platform Users</CardTitle>
            <CardDescription>View and manage all registered users on the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Input 
                placeholder="Search users by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isLoadingUsers ? (
                <div className="flex justify-center items-center py-4"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
            ) : filteredUsers.length > 0 ? (
                <ScrollArea className="h-[400px] mt-2 border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Avatar</TableHead>
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
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.profilePictureUrl} alt={user.firstName || 'user'} data-ai-hint="user avatar small"/>
                                    <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                </TableCell>
                                <TableCell>{user.firstName} {user.lastName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.createdAt ? format(new Date(user.createdAt as string), "PPP") : 'N/A'}</TableCell>
                                <TableCell className="text-right space-x-1">
                                    <Button variant="outline" size="icon" className="h-7 w-7" asChild title="View Profile">
                                        <Link href={`/profile/${user.uid}`}><Eye className="h-4 w-4"/></Link>
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-7 w-7" title="Edit User (Coming Soon)" disabled>
                                        <Edit2 className="h-4 w-4"/>
                                    </Button>
                                     <Button variant="destructive" size="icon" className="h-7 w-7" title="Delete User (Coming Soon)" disabled>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                    {searchTerm ? 'No users match your search.' : 'No users found.'}
                </p>
            )}
             <div className="flex space-x-2 mt-4">
                <Button variant="outline" disabled>Manage User Roles (Coming Soon)</Button>
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
