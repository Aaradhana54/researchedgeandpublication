
'use client';

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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const researchServices = [
  {
    title: 'Thesis & Dissertation Writing',
    description: 'Comprehensive support from start to finish.',
    icon: <BookOpenText className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Synopsis & Proposal Preparation',
    description: 'Develop a compelling research proposal.',
    icon: <FileSignature className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Research Paper Writing & Publication',
    description: 'Expert assistance for high-impact journals.',
    icon: <FileText className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Literature Review',
    description: 'Systematic literature reviews and management.',
    icon: <ClipboardList className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Data Analysis & Interpretation',
    description: 'Advanced statistical analysis for your data.',
    icon: <BarChart3 className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Plagiarism Checking & Removal',
    description: 'Ensure originality with our refinement services.',
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
  },
   {
    title: 'Proofreading & Editing',
    description: 'Enhance clarity, grammar, and style.',
    icon: <PenSquare className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Topic Selection & Research Design',
    description: 'Guidance on topic and methodology.',
    icon: <Lightbulb className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Journal Formatting & Submission',
    description: 'Manuscript formatting and submission process.',
    icon: <Send className="w-8 h-8 text-primary" />,
  },
];

export function Services() {
  
  return (
    <section id="services" className="w-full bg-secondary py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <AnimatedWrapper>
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
              Research Services
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              End-to-end support for every stage of your academic research journey.
            </p>
          </div>
        </AnimatedWrapper>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchServices.map((service, index) => (
            <AnimatedWrapper key={service.title} delay={index * 100}>
              <Card className="h-full shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300">
                 <CardHeader className="flex-row items-center gap-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                        {service.icon}
                    </div>
                    <CardTitle className="text-lg font-semibold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
