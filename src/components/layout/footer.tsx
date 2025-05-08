import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-secondary text-secondary-foreground border-t">
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-sm">
          ProLink &copy; {currentYear}. All rights reserved.
        </p>
        <nav className="mt-2 text-xs space-x-4">
          <Link href="/about" className="hover:text-primary">About</Link>
          <Link href="/accessibility" className="hover:text-primary">Accessibility</Link>
          <Link href="/help" className="hover:text-primary">Help Center</Link>
          <Link href="/privacy" className="hover:text-primary">Privacy & Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
