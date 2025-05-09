
import { Suspense } from 'react';
import MessagingClientContent from '@/components/messaging/messaging-client-content';
import { Loader2 } from 'lucide-react';

export default function MessagingPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[calc(100vh-10rem)] border rounded-lg">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <MessagingClientContent />
    </Suspense>
  );
}
