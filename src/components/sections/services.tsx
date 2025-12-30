
'use client';

import Image from 'next/image';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import {
  CheckCircle,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const researchServices = [
  {
    title: 'Thesis & Dissertation Writing',
  },
  {
    title: 'Synopsis & Proposal Preparation',
  },
  {
    title: 'Research Paper Writing & Publication',
  },
  {
    title: 'Literature Review',
  },
  {
    title: 'Data Analysis & Interpretation',
  },
  {
    title: 'Plagiarism Checking & Removal',
  },
   {
    title: 'Proofreading & Editing',
  },
  {
    title: 'Topic Selection & Research Design',
  },
  {
    title: 'Journal Formatting & Submission',
  },
];

export function Services() {
  const servicesImage = PlaceHolderImages.find(p => p.id === 'services-image');
  
  return (
    <section id="services" className="w-full bg-background py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-stretch">
            <AnimatedWrapper delay={200}>
                {servicesImage && (
                <div className="overflow-hidden rounded-lg shadow-lift h-full">
                    <Image
                    src={servicesImage.imageUrl}
                    alt={servicesImage.description}
                    width={600}
                    height={750}
                    data-ai-hint={servicesImage.imageHint}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                </div>
                )}
            </AnimatedWrapper>
            <AnimatedWrapper>
                 <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
                        Research Services
                        </h2>
                        <p className="max-w-2xl text-lg text-muted-foreground">
                        End-to-end support for every stage of your academic research journey. Our comprehensive services ensure your work is polished, professional, and ready for publication.
                        </p>
                    </div>
                    <ul className="space-y-4">
                        {researchServices.map((service, index) => (
                           <li key={index} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                                <span className="font-medium text-foreground">{service.title}</span>
                           </li>
                        ))}
                    </ul>
                </div>
            </AnimatedWrapper>
        </div>
      </div>
    </section>
  );
}
