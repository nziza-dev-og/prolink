
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Settings as SettingsIcon, ShieldAlert, Tool } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [newSecretCode, setNewSecretCode] = useState('');
  const [isSavingSecret, setIsSavingSecret] = useState(false);
  const [currentSecretCode, setCurrentSecretCode] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSecret = localStorage.getItem('adminSecret') || 'linkedIn'; // Default if not set
      setCurrentSecretCode(storedSecret);
    }
  }, []);


  const handleSaveSecretCode = (event: FormEvent) => {
    event.preventDefault();
    if (!newSecretCode.trim()) {
      toast({ title: "Invalid Code", description: "Secret code cannot be empty.", variant: "destructive" });
      return;
    }
    setIsSavingSecret(true);
    
    setTimeout(() => { // Simulate API call
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminSecret', newSecretCode);
          setCurrentSecretCode(newSecretCode); // Update displayed current secret
          toast({ title: "Secret Code Updated", description: "Admin secret code has been changed." });
          setNewSecretCode(''); 
        } else {
           toast({ title: "Error", description: "Could not save secret code (client-side storage not available).", variant: "destructive" });
        }
        setIsSavingSecret(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
      </div>
      <CardDescription>Configure admin-specific settings and general site parameters.</CardDescription>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><ShieldAlert className="mr-2 h-5 w-5"/>Admin Access</CardTitle>
            <CardDescription>Manage the secret code for accessing the admin panel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Current Admin Secret Code: <span className="font-mono bg-muted px-2 py-1 rounded-md text-foreground">{currentSecretCode ? '********' : 'Not Set'}</span> (Hidden for security)
          </p>
          <form onSubmit={handleSaveSecretCode} className="space-y-4 max-w-sm">
            <div>
              <Label htmlFor="newSecretCode" className="font-medium">Change Admin Secret Code</Label>
              <Input
                id="newSecretCode"
                type="password"
                value={newSecretCode}
                onChange={(e) => setNewSecretCode(e.target.value)}
                placeholder="Enter new secret code"
                disabled={isSavingSecret}
                className="mt-1 text-sm"
              />
            </div>
            <Button type="submit" disabled={isSavingSecret || !newSecretCode.trim()}>
              {isSavingSecret && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save New Secret Code
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><Tool className="mr-2 h-5 w-5"/>Site Configuration</CardTitle>
            <CardDescription>General settings for the platform. (These are placeholders)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="siteName">Site Name (Placeholder)</Label>
                <Input id="siteName" defaultValue="ProLink Platform" disabled className="mt-1"/>
            </div>
             <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode (Placeholder)</Label>
                <Button variant="outline" disabled className="block mt-1">Toggle Maintenance Mode</Button>
            </div>
          <p className="text-xs text-muted-foreground mt-1"> (e.g., Site name, maintenance mode, API keys - All placeholders for now)</p>
        </CardContent>
      </Card>
    </div>
  );
}
