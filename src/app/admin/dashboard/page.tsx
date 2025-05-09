'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
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
    } else {
      // Should not happen in client component, but as a fallback
      router.push('/admin/login');
    }
    setIsVerifying(false);
  }, [router]);

  const handleAdminLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdmin');
    }
    router.push('/'); // Redirect to home or login page
  };

  if (isVerifying) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdminVerified) {
    // This case should ideally be handled by the redirect in useEffect,
    // but it's a safeguard.
    return null; 
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Admin Dashboard</CardTitle>
          <CardDescription>Welcome to the ProLink Admin Panel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>This is the admin dashboard. You can manage users, content, and site settings from here.</p>
          
          <section>
            <h3 className="text-xl font-semibold mb-2">Quick Stats (Placeholder)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">1,234</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">5,678</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reported Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">12</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Management Tools (Placeholder)</h3>
            <div className="space-x-2">
              <Button variant="outline" disabled>Manage Users</Button>
              <Button variant="outline" disabled>Content Moderation</Button>
              <Button variant="outline" disabled>Site Settings</Button>
            </div>
          </section>

          <Button variant="destructive" onClick={handleAdminLogout}>
            Exit Admin Panel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
