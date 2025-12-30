
'use client';

import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Lightbulb, Calendar, Pencil, MessageSquare, CheckCircle, Send, ArrowRight } from 'lucide-react';

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
    <section id="process" className="w-full bg-secondary py-16 md:py-24 lg:py-32">
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
            <div className="horizontal-scroll-container overflow-x-auto overflow-y-hidden pb-8">
                <div className="relative flex items-start justify-start w-max px-8 pt-16">
                    
                    {/* The connecting line path */}
                    <svg className="absolute top-8 left-0 h-16 w-full" style={{ minWidth: `${processSteps.length * 18}rem` }}>
                        <path
                            d={`M 144 64 
                                C 192 64, 192 0, 240 0 
                                S 288 64, 336 64
                                C 384 64, 384 0, 432 0
                                S 480 64, 528 64
                                C 576 64, 576 0, 624 0
                                S 672 64, 720 64
                                C 768 64, 768 0, 816 0
                                S 864 64, 912 64
                                C 960 64, 960 0, 1008 0
                                `}
                            fill="none"
                            stroke="hsl(var(--border))"
                            strokeWidth="2"
                            className="path-animation"
                        />
                    </svg>

                    {processSteps.map((step, index) => (
                        <AnimatedWrapper 
                            key={index}
                            delay={index * 150}
                            className="relative w-72 px-4 animate-slide-in-left"
                        >
                            {/* Icon Badge */}
                            <div 
                                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-primary-foreground"
                                style={{ background: 'linear-gradient(to top right, hsl(var(--primary)), hsl(var(--accent)))' }}
                            >
                                {step.icon}
                            </div>
                            
                            {/* Card */}
                            <div className="pt-12">
                                <div className="bg-background rounded-lg shadow-soft p-6 text-center h-full">
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
