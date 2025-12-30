
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
    icon: <BookCopy className="w-8 h-8 text-primary" />,
    title: 'Book Writing & Ghostwriting',
    description: 'Professional writing and ghostwriting services to bring your book idea to life, from initial concept to a complete manuscript.',
  },
  {
    icon: <BookUp className="w-8 h-8 text-primary" />,
    title: 'Academic Book Conversion',
    description: 'Expertly transform your thesis, dissertation, or extensive research into a polished and publishable academic book.',
  },
  {
    icon: <FileCheck2 className="w-8 h-8 text-primary" />,
    title: 'Editing & Proofreading',
    description: 'Meticulous developmental editing, copy-editing, and proofreading to ensure your manuscript is polished and error-free.',
  },
  {
    icon: <Palette className="w-8 h-8 text-primary" />,
    title: 'Cover Design & Formatting',
    description: 'Creative cover design and professional interior layout services for both print and digital eBook formats.',
  },
  {
    icon: <Copyright className="w-8 h-8 text-primary" />,
    title: 'ISBN & Copyright',
    description: 'We handle the entire process of ISBN assignment and copyright registration to officially protect your intellectual property.',
  },
  {
    icon: <Globe2 className="w-8 h-8 text-primary" />,
    title: 'Global Publishing & Distribution',
    description: 'We manage the publishing process and ensure your book is distributed globally to major online retailers and platforms.',
  },
   {
    icon: <Megaphone className="w-8 h-8 text-primary" />,
    title: 'Book Marketing & Branding',
    description: 'Strategic marketing and author branding support to help your book connect with its intended audience and achieve success.',
  },
];


export function BookPublishing() {
  const image = PlaceHolderImages.find(p => p.id === 'book-publishing-image');

  return (
    <section id="book-publishing" className="w-full bg-secondary py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <AnimatedWrapper>
            <div className="text-center space-y-4 mb-16">
                 <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
                    From Manuscript to Masterpiece
                </h2>
                <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                    Our comprehensive book writing and publishing services guide you through every step of the journey, turning your ideas into a beautifully crafted, globally distributed book.
                </p>
            </div>
        </AnimatedWrapper>
        
        <div className="relative">
             {/* Central Timeline */}
            <div className="absolute left-1/2 top-0 h-full w-0.5 bg-border -translate-x-1/2" aria-hidden="true"></div>

            <div className="space-y-16">
                 {publishingServices.map((service, index) => (
                    <AnimatedWrapper key={index} delay={index * 150}>
                        <div className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                            
                            <div className={`w-1/2 p-6 ${index % 2 === 0 ? 'pr-12' : 'pl-12'}`}>
                                <div className="space-y-3">
                                    <div className={`flex items-center gap-4 ${index % 2 !== 0 ? 'justify-end flex-row-reverse' : ''}`}>
                                        <div className="p-3 bg-background rounded-full shadow-soft">
                                            {service.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">{service.title}</h3>
                                    </div>
                                    <p className={`text-muted-foreground ${index % 2 !== 0 ? 'text-right' : ''}`}>{service.description}</p>
                                </div>
                            </div>
                            
                            {/* Dot on Timeline */}
                            <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-background rounded-full border-4 border-primary"></div>
                        </div>
                    </AnimatedWrapper>
                 ))}
            </div>
        </div>
      </div>
    </section>
  );
}
