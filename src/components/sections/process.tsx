
'use client';

import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Lightbulb, Calendar, Pencil, MessageSquare, CheckCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-border -translate-x-1/2" aria-hidden="true"></div>

          <div className="space-y-12 md:space-y-0">
            {processSteps.map((step, index) => (
              <AnimatedWrapper key={step.title} delay={index * 150}>
                <div className="relative flex items-center md:items-start">
                  <div className={cn(
                    "flex w-full items-center justify-start md:w-1/2",
                    index % 2 === 0 ? 'md:justify-end md:pr-8' : 'md:justify-start md:pl-8 md:flex-row-reverse'
                  )}>
                    <div className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-full bg-background shadow-soft flex items-center justify-center relative",
                       index % 2 === 0 ? 'md:-mr-8' : 'md:-ml-8'
                    )}>
                      {/* Dot on the timeline */}
                      <div className="absolute left-1/2 top-1/2 -translate-y-1/2 bg-background p-1 rounded-full z-20">
                         <div className="w-4 h-4 rounded-full bg-primary border-4 border-background"></div>
                      </div>
                      <div className="z-10">{step.icon}</div>
                    </div>
                    
                    <div className={cn(
                      "bg-card p-6 rounded-lg shadow-soft max-w-sm w-full",
                       index % 2 === 0 ? "text-right" : "text-left"
                    )}>
                      <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                   {/* This is a spacer for mobile layout */}
                  <div className="hidden md:block w-1/2"></div>
                </div>
              </AnimatedWrapper>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
