
'use client';

import {
  BookCopy,
  BookUp,
  FileCheck2,
  Palette,
  Copyright,
  Globe2,
  Megaphone,
} from 'lucide-react';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';


const publishingServices = [
  {
    icon: <BookCopy className="w-6 h-6 text-primary" />,
    title: 'Book Writing & Ghostwriting',
    description: 'Professional writing and ghostwriting services to bring your book idea to life.',
  },
  {
    icon: <BookUp className="w-6 h-6 text-primary" />,
    title: 'Academic Book Conversion',
    description: 'Transform your thesis, dissertation, or research into a published academic book.',
  },
  {
    icon: <FileCheck2 className="w-6 h-6 text-primary" />,
    title: 'Editing & Proofreading',
    description: 'Meticulous editing to ensure your manuscript is polished and error-free.',
  },
  {
    icon: <Palette className="w-6 h-6 text-primary" />,
    title: 'Cover Design & Formatting',
    description: 'Creative cover design and professional interior layout for print and eBooks.',
  },
  {
    icon: <Copyright className="w-6 h-6 text-primary" />,
    title: 'ISBN & Copyright',
    description: 'We handle ISBN assignment and copyright registration to protect your work.',
  },
  {
    icon: <Globe2 className="w-6 h-6 text-primary" />,
    title: 'Publishing & Distribution',
    description: 'Global distribution to major online retailers and platforms.',
  },
   {
    icon: <Megaphone className="w-6 h-6 text-primary" />,
    title: 'Book Marketing & Branding',
    description: 'Strategic marketing and branding support to help your book reach its audience.',
  },
];


export function BookPublishing() {
  const image = PlaceHolderImages.find(p => p.id === 'book-publishing-image');

  return (
    <section id="book-publishing" className="w-full bg-secondary py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
         <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedWrapper>
                 <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
                          Book Writing & Publishing
                        </h2>
                        <p className="max-w-2xl text-lg text-muted-foreground">
                          Comprehensive services to guide your manuscript from concept to a globally published book.
                        </p>
                    </div>
                    <ul className="space-y-6">
                        {publishingServices.map((service, index) => (
                           <li key={index} className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-full mt-1">
                                  {service.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{service.title}</h3>
                                    <p className="text-muted-foreground">{service.description}</p>
                                </div>
                           </li>
                        ))}
                    </ul>
                </div>
            </AnimatedWrapper>
            <AnimatedWrapper delay={200}>
                {image && (
                <div className="overflow-hidden rounded-lg shadow-lift h-full min-h-[600px]">
                    <Image
                    src={image.imageUrl}
                    alt={image.description}
                    width={600}
                    height={800}
                    data-ai-hint={image.imageHint}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                </div>
                )}
            </AnimatedWrapper>
        </div>
      </div>
    </section>
  );
}
