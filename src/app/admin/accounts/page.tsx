
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, PlusCircle, List } from 'lucide-react';

export default function AdminAccountsPage() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Accounts Management</h1>
      </div>
      <CardDescription>
        Manage connected LinkedIn accounts (if applicable for a ProLinked manager tool). This page is a placeholder.
      </CardDescription>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><List className="mr-2 h-5 w-5" /> Connected Accounts</CardTitle>
          <CardDescription>
            View and manage LinkedIn accounts linked to the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This section would typically allow an admin to manage multiple LinkedIn accounts connected to the ProLinked platform, 
            especially if the platform serves as a management tool for agencies or social media managers handling multiple client profiles.
          </p>
          <div className="mb-6">
            <Button disabled>
              <PlusCircle className="mr-2 h-4 w-4" /> Connect New Account (Coming Soon)
            </Button>
          </div>
          <div className="h-60 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground bg-muted/20">
            <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-2"/>
                <p>Connected Accounts List Placeholder</p>
                <p className="text-xs">No accounts connected or feature under development.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
