
'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Settings as SettingsIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [newSecretCode, setNewSecretCode] = useState('');
  const [isSavingSecret, setIsSavingSecret] = useState(false);

  const handleSaveSecretCode = (event: FormEvent) => {
    event.preventDefault();
    if (!newSecretCode.trim()) {
      toast({ title: "Invalid Code", description: "Secret code cannot be empty.", variant: "destructive" });
      return;
    }
    setIsSavingSecret(true);
    // Simulate saving for now, as localStorage access should be handled carefully in Next.js SSR/Client context
    // This is better done client-side only.
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminSecret', newSecretCode);
      toast({ title: "Secret Code Updated", description: "Admin secret code has been changed." });
      setNewSecretCode(''); 
    } else {
       toast({ title: "Error", description: "Could not save secret code (server context).", variant: "destructive" });
    }
    setIsSavingSecret(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><SettingsIcon className="mr-2 h-6 w-6" /> Admin Settings</CardTitle>
          <CardDescription>Configure admin-specific settings and general site parameters.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="text-xl">Admin Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSaveSecretCode} className="space-y-4 max-w-sm">
            <div>
              <Label htmlFor="newSecretCode">Change Admin Secret Code</Label>
              <Input
                id="newSecretCode"
                type="password"
                value={newSecretCode}
                onChange={(e) => setNewSecretCode(e.target.value)}
                placeholder="Enter new secret code"
                disabled={isSavingSecret}
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={isSavingSecret || !newSecretCode.trim()}>
              {isSavingSecret && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save New Secret Code
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="text-xl">Site Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>General Site Settings (Coming Soon)</Button>
          <p className="text-xs text-muted-foreground mt-1"> (e.g., Site name, maintenance mode, API keys - Placeholder)</p>
        </CardContent>
      </Card>
    </div>
  );
}
