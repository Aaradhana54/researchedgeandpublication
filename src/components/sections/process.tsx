
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
        
        <div className="relative">
            <div className="flex items-center justify-center md:hidden text-muted-foreground text-sm">
                <ArrowRight className="mr-2"/> Scroll to view all steps
            </div>
            <div className="horizontal-scroll-container no-scrollbar overflow-x-auto overflow-y-hidden pb-8 -mb-8">
                <div className="relative flex items-start justify-start w-max px-8 pt-24 pb-12" style={{ minWidth: `100rem` }}>
                    
                    {/* The connecting line path */}
                    <svg className="absolute top-0 left-0 h-full w-full" >
                        <path
                            d="M 160 80 
                               C 240 80, 240 160, 320 160 
                               C 400 160, 400 80, 480 80
                               C 560 80, 560 160, 640 160
                               C 720 160, 720 80, 800 80
                               C 880 80, 880 160, 960 160
                               C 1040 160, 1040 80, 1120 80"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="4"
                            className="path-animation"
                            strokeLinecap="round"
                        />
                    </svg>

                    {processSteps.map((step, index) => (
                        <AnimatedWrapper 
                            key={index}
                            delay={index * 150}
                            className={cn(
                                "relative w-72 px-4 animate-slide-in-left",
                                index % 2 === 1 ? 'top-20' : '-top-8'
                            )}
                        >
                            {/* Icon Badge */}
                            <div 
                                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-primary-foreground shadow-lg"
                                style={{ background: 'linear-gradient(to top right, hsl(var(--primary)), hsl(var(--accent)))' }}
                            >
                                {step.icon}
                            </div>
                            
                            {/* Card */}
                            <div className="pt-8">
                                <div className="bg-background rounded-lg shadow-soft p-6 text-center h-full border">
                                    <h3 className="font-bold text-lg text-primary mb-2">Step {String(index + 1).padStart(2, '0')}</h3>
                                    <h4 className="font-semibold text-foreground mb-3">{step.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </AnimatedWrapper>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
