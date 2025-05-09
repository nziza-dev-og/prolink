'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>Enter the secret code to access the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretCode">Secret Code</Label>
              <Input
                id="secretCode"
                type="password"
                placeholder="Enter secret code"
                required
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enter Admin Area
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
