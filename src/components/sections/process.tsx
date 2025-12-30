
'use client';

import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Lightbulb, Calendar, Pencil, MessageSquare, CheckCircle, Send } from 'lucide-react';

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
            {/* The vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block"></div>

            {processSteps.map((step, index) => (
                <div key={index} className="relative mb-12 md:mb-20">
                     <AnimatedWrapper className="flex flex-col md:flex-row items-center w-full">
                        {/* Content */}
                        <div className={`w-full md:w-5/12 p-6 bg-background rounded-lg shadow-soft ${index % 2 === 0 ? 'md:order-3' : 'md:order-1'}`}>
                             <div className="flex items-center gap-4 mb-3">
                                 <div className="bg-primary/10 p-3 rounded-full">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                            </div>
                            <p className="text-muted-foreground">{step.description}</p>
                        </div>
                        
                        {/* Spacer */}
                        <div className="hidden md:block w-2/12 order-2"></div>
                        
                        {/* Number Circle on Timeline */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full border-4 border-background text-2xl font-bold z-10">
                            {index + 1}
                        </div>
                    </AnimatedWrapper>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
