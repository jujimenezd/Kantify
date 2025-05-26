"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import EthicalCompassLogo from './EthicalCompassLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/dilemmas', label: 'Dilemmas' },
    { href: '/profile', label: 'My Profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <EthicalCompassLogo />
            <h1 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              Ethical Compass
            </h1>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {navItems.map((item) => (
              <Button key={item.href} variant="ghost" asChild
                className={cn(
                  "text-sm font-medium",
                  pathname === item.href
                    ? "text-primary hover:text-primary/90"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
