
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';
import { ProLinkLogo } from '@/components/icons/prolink-logo';

const DEFAULT_ADMIN_SECRET_CODE = 'linkedIn'; 

export default function AdminLoginPage() {
  const [secretCode, setSecretCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [effectiveAdminSecret, setEffectiveAdminSecret] = useState(DEFAULT_ADMIN_SECRET_CODE);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const customAdminSecret = localStorage.getItem('adminSecret');
      if (customAdminSecret) {
        setEffectiveAdminSecret(customAdminSecret);
      }
    }
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (secretCode === effectiveAdminSecret) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('isAdmin', 'true');
        }
        toast({ title: 'Admin Access Granted', description: 'Redirecting to dashboard...' });
        router.push('/admin/dashboard');
      } else {
        toast({ title: 'Access Denied', description: 'Invalid secret code.', variant: 'destructive' });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-background px-4">
        <div className="flex items-center gap-3 mb-8">
            <ProLinkLogo className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-primary">ProLink Admin</h1>
        </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl">Admin Access Required</CardTitle>
          <CardDescription>Enter the secret code to access the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="secretCode">Secret Code</Label>
              <Input
                id="secretCode"
                type="password"
                placeholder="Enter your administrator code"
                required
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                disabled={isLoading}
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full text-base py-3" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "Enter Admin Area"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
