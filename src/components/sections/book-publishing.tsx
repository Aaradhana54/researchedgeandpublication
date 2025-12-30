
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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';


const publishingServices = [
  {
    icon: <BookCopy className="w-8 h-8 text-primary" />,
    imageId: 'publishing-writing',
    title: 'Book Writing & Ghostwriting',
    description: 'Professional writing and ghostwriting services to bring your book idea to life, from initial concept to a complete manuscript.',
  },
  {
    icon: <BookUp className="w-8 h-8 text-primary" />,
    imageId: 'publishing-conversion',
    title: 'Academic Book Conversion',
    description: 'Expertly transform your thesis, dissertation, or extensive research into a polished and publishable academic book.',
  },
  {
    icon: <FileCheck2 className="w-8 h-8 text-primary" />,
    imageId: 'publishing-editing',
    title: 'Editing & Proofreading',
    description: 'Meticulous developmental editing, copy-editing, and proofreading to ensure your manuscript is polished and error-free.',
  },
  {
    icon: <Palette className="w-8 h-8 text-primary" />,
    imageId: 'publishing-design',
    title: 'Cover Design & Formatting',
    description: 'Creative cover design and professional interior layout services for both print and digital eBook formats.',
  },
  {
    icon: <Copyright className="w-8 h-8 text-primary" />,
    imageId: 'publishing-copyright',
    title: 'ISBN & Copyright',
    description: 'We handle the entire process of ISBN assignment and copyright registration to officially protect your intellectual property.',
  },
  {
    icon: <Globe2 className="w-8 h-8 text-primary" />,
    imageId: 'publishing-distribution',
    title: 'Global Publishing & Distribution',
    description: 'We manage the publishing process and ensure your book is distributed globally to major online retailers and platforms.',
  },
   {
    icon: <Megaphone className="w-8 h-8 text-primary" />,
    imageId: 'publishing-marketing',
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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishingServices.map((service, index) => {
                 const serviceImage = PlaceHolderImages.find(p => p.id === service.imageId);
                 return (
                    <AnimatedWrapper key={index} delay={index * 100}>
                        <Card className="h-full overflow-hidden shadow-soft hover:shadow-lift transition-all duration-300 group">
                            <div className="relative">
                                {serviceImage && (
                                     <div className="relative h-48 w-full">
                                        <Image
                                            src={serviceImage.imageUrl}
                                            alt={serviceImage.description}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            data-ai-hint={serviceImage.imageHint}
                                        />
                                     </div>
                                )}
                                <div className="absolute top-2 right-2 bg-background/80 text-primary font-bold text-lg rounded-md px-3 py-1 shadow-md">
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        {service.icon}
                                    </div>
                                    <span>{service.title}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{service.description}</p>
                            </CardContent>
                        </Card>
                    </AnimatedWrapper>
                 )
            })}
        </div>
      </div>
    </section>
  );
}
