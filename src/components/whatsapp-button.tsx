'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn("h-10 w-10", className)}
    >
        <path d="M16.6 14.2c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.7-.8.9-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.2-.5-.5-.8-1-1.2-1.7-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.2.2-.3.1-.1.1-.3 0-.4-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.2-.6.4-.2.2-.7.7-.7 1.6 0 .9.7 1.9.8 2s.7 2 .7 2.1c.1.1 1.4 2.1 3.4 3 .6.2 1 .3 1.4.4.5.1 1-.1 1.4-.2.4-.2.6-.4.8-.8.2-.3.2-.6.1-.7-.1-.1-.2-.2-.4-.3zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
    </svg>
);


export function WhatsAppButton({ phoneNumber }: { phoneNumber: string }) {
    const whatsappUrl = `https://wa.me/${phoneNumber}`;

    return (
        <Button
            asChild
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#128C7E] hover:scale-110 transition-all duration-300 z-50"
        >
            <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
                <WhatsAppIcon />
            </Link>
        </Button>
    );
}
