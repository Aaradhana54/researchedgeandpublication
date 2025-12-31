
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from "@/components/ui/logo";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram, Shield, DollarSign, FileSignature } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [isPortalsMenuOpen, setIsPortalsMenuOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Process', href: '#process' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* About Section */}
          <div className="space-y-4">
            <DropdownMenu open={isPortalsMenuOpen} onOpenChange={setIsPortalsMenuOpen}>
              <DropdownMenuTrigger asChild>
                  <div onDoubleClick={() => setIsPortalsMenuOpen(true)} className="cursor-pointer inline-block">
                      <Logo />
                  </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                  <DropdownMenuGroup>
                      <DropdownMenuLabel>Staff Portals</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => router.push('/admin/login')}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin</span>
                      </DropdownMenuItem>
                       <DropdownMenuItem onSelect={() => router.push('/sales-manager/login')}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span>Sales Manager</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => router.push('/sales/login')}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span>Sales Team</span>
                      </DropdownMenuItem>
                       <DropdownMenuItem onSelect={() => router.push('/writing/login')}>
                        <FileSignature className="mr-2 h-4 w-4" />
                        <span>Writer</span>
                      </DropdownMenuItem>
                  </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <p className="text-sm text-muted-foreground">
              India’s trusted academic and publishing partner, transforming ideas into polished, publishable work.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                <a href="mailto:revio1803@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                  revio1803@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">+91 88899 32922</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Tejaji Nagar, Indore, India</span>
              </li>
            </ul>
          </div>
          
          {/* Social Media */}
          <div>
             <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
             <div className="flex gap-4">
                <Link href="https://www.instagram.com/revioresearch?igsh=OG1jOTAybGlldXRq" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><Instagram /></Link>
                <Link href="https://www.linkedin.com/company/revio-research/" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin /></Link>
                <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors"><Twitter /></Link>
                <Link href="https://www.facebook.com/profile.php?id=61575793142887" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><Facebook /></Link>
             </div>
          </div>

        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Research Edge and Publication. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
