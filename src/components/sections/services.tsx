
'use client';

import Image from 'next/image';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import {
  BookOpenText,
  FileSignature,
  FileText,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  PenSquare,
  Lightbulb,
  Send,
  CheckCircle,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const researchServices = [
  {
    title: 'Thesis & Dissertation Writing',
    icon: <BookOpenText className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Synopsis & Proposal Preparation',
    icon: <FileSignature className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Research Paper Writing & Publication',
    icon: <FileText className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Literature Review',
    icon: <ClipboardList className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Data Analysis & Interpretation',
    icon: <BarChart3 className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Plagiarism Checking & Removal',
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
  },
   {
    title: 'Proofreading & Editing',
    icon: <PenSquare className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Topic Selection & Research Design',
    icon: <Lightbulb className="w-6 h-6 text-primary" />,
  },
  {
    title: 'Journal Formatting & Submission',
    icon: <Send className="w-6 h-6 text-primary" />,
  },
];

export function Services() {
  const servicesImage = PlaceHolderImages.find(p => p.id === 'services-image');
  
  return (
    <section id="services" className="w-full bg-background py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
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
             <AnimatedWrapper delay={200}>
                {servicesImage && (
                <div className="overflow-hidden rounded-lg shadow-lift aspect-w-4 aspect-h-5">
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
        </div>
      </div>
    </section>
  );
}
