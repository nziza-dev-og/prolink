
import { Suspense } from 'react';
import NetworkClientContent from '@/components/network/network-client-content';
import { Loader2 } from 'lucide-react';

export default function NetworkPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <NetworkClientContent />
    </Suspense>
  );
}
