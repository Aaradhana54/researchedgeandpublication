
import { Logo } from "@/components/ui/logo";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Process', href: '#process' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="bg-secondary text-muted-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm">
              India’s trusted academic and publishing partner, transforming ideas into polished, publishable work.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                <a href="mailto:revio1803@gmail.com" className="hover:text-primary transition-colors">
                  revio1803@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                <span>+91 12345 67890</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                <span>Jaipur, Rajasthan, India</span>
              </li>
            </ul>
          </div>
          
          {/* Social Media */}
          <div className="space-y-4">
             <h3 className="font-semibold text-foreground">Follow Us</h3>
             <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook /></Link>
             </div>
          </div>

        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm">
          <p>&copy; {currentYear} Research Agent Publication. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
