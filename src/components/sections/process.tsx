
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
        
        <div className="relative max-w-4xl mx-auto">
          {/* Central Timeline */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-border -translate-x-1/2" aria-hidden="true"></div>

          <div className="space-y-16">
            {processSteps.map((step, index) => (
              <AnimatedWrapper key={step.title} delay={index * 150}>
                <div className={cn(
                  "relative flex items-center",
                  index % 2 === 0 ? "justify-start" : "justify-end"
                )}>
                  {/* Content Box */}
                  <div className={cn(
                    "w-1/2 p-6 bg-background rounded-lg shadow-soft border border-transparent hover:border-primary/50 hover:shadow-lift transition-all duration-300",
                    index % 2 === 0 ? "pr-12 text-right" : "pl-12 text-left"
                  )}>
                    <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  {/* Icon and Number */}
                  <div className="absolute left-1/2 -translate-x-1/2 bg-secondary flex flex-col items-center gap-2">
                     <div className="flex items-center justify-center w-16 h-16 bg-background rounded-full border-2 border-primary">
                      {step.icon}
                    </div>
                     <span className="font-bold text-sm text-primary">STEP {index + 1}</span>
                  </div>
                </div>
              </AnimatedWrapper>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
