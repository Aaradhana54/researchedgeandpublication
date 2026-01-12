
'use client';

import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Lightbulb, Calendar, Pencil, MessageSquare, CheckCircle, Send, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const processSteps = [
  {
    icon: <Lightbulb className="w-8 h-8" />,
    title: 'Requirement Gathering',
    description: 'We begin with a detailed consultation to fully understand your project goals and requirements.',
  },
  {
    icon: <Calendar className="w-8 h-8" />,
    title: 'Timeline and Plan',
    description: 'A customized plan and a clear timeline are developed and shared with you for approval.',
  },
  {
    icon: <Pencil className="w-8 h-8" />,
    title: 'Writing & Development',
    description: 'Our expert team begins the writing, editing, and development process with precision.',
  },
  {
    icon: <MessageSquare className="w-8 h-8" />,
    title: 'Review and Feedback',
    description: 'You receive the first draft to provide your valuable feedback for revisions and enhancements.',
  },
  {
    icon: <CheckCircle className="w-8 h-8" />,
    title: 'Finalization & Delivery',
    description: 'We incorporate your feedback and finalize the document for delivery.',
  },
];


export function Process() {
  return (
    <section id="process" className="w-full bg-secondary py-16 md:py-24 lg:py-32 overflow-hidden">
      <div className="container mx-auto">
        <AnimatedWrapper>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
              Our Process
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              A streamlined and transparent workflow designed for your success.
            </p>
          </div>
        </AnimatedWrapper>
        
        <div className="relative md:hidden">
            <div className="flex items-center justify-center text-muted-foreground text-sm mb-4">
                <ArrowRight className="mr-2"/> Scroll to view all steps
            </div>
            <div className="horizontal-scroll-container no-scrollbar overflow-x-auto pb-8 -mb-8">
                <div className="flex flex-nowrap gap-8 px-4">
                    {processSteps.map((step, index) => (
                         <AnimatedWrapper 
                            key={index}
                            delay={index * 150}
                            className="w-64 flex-shrink-0"
                        >
                            <div className="bg-background rounded-lg shadow-soft p-6 text-center h-full border">
                                <div 
                                    className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center text-primary-foreground shadow-lg"
                                    style={{ background: 'linear-gradient(to top right, hsl(var(--primary)), hsl(var(--accent)))' }}
                                >
                                    {step.icon}
                                </div>
                                <h3 className="font-bold text-lg text-primary mb-2">Step {String(index + 1).padStart(2, '0')}</h3>
                                <h4 className="font-semibold text-foreground mb-3">{step.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {step.description}
                                </p>
                            </div>
                        </AnimatedWrapper>
                    ))}
                </div>
            </div>
        </div>

        <div className="relative hidden md:block">
            <div className="absolute left-1/2 top-10 h-full w-0.5 bg-border -translate-x-1/2"></div>
            {processSteps.map((step, index) => (
                <div key={index} className={cn("relative flex items-center w-full my-8", index % 2 === 0 ? "justify-start" : "justify-end")}>
                    <div className={cn("relative w-5/12", index % 2 === 0 ? "text-right pr-16" : "text-left pl-16")}>
                        <AnimatedWrapper>
                            <div className="bg-background p-6 rounded-lg shadow-lift border">
                                <h3 className="text-xl font-bold text-primary mb-2">{step.title}</h3>
                                <p className="text-muted-foreground">{step.description}</p>
                            </div>
                        </AnimatedWrapper>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 z-10">
                        <div className="bg-primary text-primary-foreground rounded-full w-20 h-20 flex items-center justify-center flex-col shadow-lg border-4 border-background">
                            {step.icon}
                             <span className="text-xs font-bold mt-1">STEP {index+1}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
