
'use client';

import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Lightbulb, Calendar, Pencil, MessageSquare, CheckCircle, Send } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const processSteps = [
  {
    icon: <Lightbulb className="w-8 h-8 text-primary" />,
    title: 'Requirement Gathering',
    description: 'We begin with a detailed consultation to fully understand your project goals and requirements.',
  },
  {
    icon: <Calendar className="w-8 h-8 text-primary" />,
    title: 'Timeline and Plan',
    description: 'A customized plan and a clear timeline are developed and shared with you for approval.',
  },
  {
    icon: <Pencil className="w-8 h-8 text-primary" />,
    title: 'Writing and Development',
    description: 'Our expert team begins the writing, editing, and development process with precision.',
  },
  {
    icon: <MessageSquare className="w-8 h-8 text-primary" />,
    title: 'Review and Feedback',
    description: 'You receive the first draft to provide your valuable feedback for revisions and enhancements.',
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-primary" />,
    title: 'Finalization',
    description: 'We incorporate your feedback and finalize the document to meet the highest quality standards.',
  },
  {
    icon: <Send className="w-8 h-8 text-primary" />,
    title: 'Delivery & Submission',
    description: 'The completed work is delivered, with assistance for submission and publication if required.',
  },
];

export function Process() {
  return (
    <section id="process" className="w-full bg-secondary py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <AnimatedWrapper>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
              Our Process
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              A streamlined and transparent workflow designed for success.
            </p>
          </div>
        </AnimatedWrapper>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <AnimatedWrapper key={step.title} delay={index * 100}>
                 <Card className="h-full relative overflow-hidden bg-background/50 shadow-soft hover:shadow-lift transition-shadow duration-300">
                    <span className="absolute -top-4 -right-4 text-[8rem] font-bold text-primary/5 opacity-50 select-none">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <CardHeader>
                        <div className="bg-primary/10 p-4 rounded-full mb-4 w-fit">
                            {step.icon}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                </Card>
              </AnimatedWrapper>
            ))}
        </div>
      </div>
    </section>
  );
}
