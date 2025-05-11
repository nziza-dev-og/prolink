
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, Checkbox } from 'lucide-react';
import { ProLinkLogo } from '@/components/icons/prolink-logo';
import { Separator } from '@/components/ui/separator';

const DEFAULT_ADMIN_SECRET_CODE = 'linkedIn';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);


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
      // Check if already admin and redirect
      const isAdmin = localStorage.getItem('isAdmin');
      if (isAdmin === 'true') {
        router.push('/admin/dashboard');
      }
    }
  }, [router]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

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
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-3 self-start mb-8">
              <ProLinkLogo className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold text-primary">ProLink Admin</h1>
          </div>

          <div>
            <h2 className="text-3xl font-bold">Welcome Back</h2>
            <p className="text-muted-foreground mt-1">
              Before we can get your day started, lets sign in.
            </p>
          </div>

          <Button variant="outline" className="w-full py-6 text-base" disabled>
            <GoogleIcon />
            Sign in with Google
          </Button>

          <div className="flex items-center space-x-2">
            <Separator className="flex-grow" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-grow" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="secretCode">Admin Secret Code</Label>
              <Input
                id="secretCode"
                type="password"
                placeholder="Enter your administrator code"
                required
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                disabled={isLoading}
                className="text-base h-12"
              />
            </div>
             {/* "Keep me signed in" and "Forgot password" removed as not applicable for secret code login */}
            <Button type="submit" className="w-full text-base py-3 h-12" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-background to-accent/10 items-center justify-center p-8 relative overflow-hidden">
        <Image
          src="https://picsum.photos/seed/adminlogin/1200/900" // Replace with actual illustration if available
          alt="Admin Dashboard Illustration"
          width={1200}
          height={900}
          className="object-contain rounded-lg shadow-2xl max-w-full max-h-[80vh]"
          data-ai-hint="data analytics illustration"
          priority
        />
         <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-accent/5 opacity-50 mix-blend-multiply"></div>
      </div>
    </div>
  );
}
