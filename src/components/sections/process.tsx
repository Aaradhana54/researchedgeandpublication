
'use client';

import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Lightbulb, Calendar, Pencil, MessageSquare, CheckCircle, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

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

const Arrow = ({ className }: { className?: string }) => (
    <div className={`hidden lg:flex items-center justify-center ${className}`}>
        <ArrowRight className="w-12 h-12 text-primary/30" />
    </div>
);


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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 items-center gap-8">
            {/* Step 1 */}
            <AnimatedWrapper delay={100} className="lg:col-span-1">
                <Card className="h-full text-center shadow-soft hover:shadow-lift transition-all duration-300">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                            {processSteps[0].icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="mb-2 text-xl">{processSteps[0].title}</CardTitle>
                        <p className="text-muted-foreground">{processSteps[0].description}</p>
                    </CardContent>
                </Card>
            </AnimatedWrapper>

            <Arrow />

            {/* Step 2 */}
            <AnimatedWrapper delay={200} className="lg:col-span-1">
                <Card className="h-full text-center shadow-soft hover:shadow-lift transition-all duration-300">
                     <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                            {processSteps[1].icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="mb-2 text-xl">{processSteps[1].title}</CardTitle>
                        <p className="text-muted-foreground">{processSteps[1].description}</p>
                    </CardContent>
                </Card>
            </AnimatedWrapper>
            
            <Arrow />

            {/* Step 3 */}
            <AnimatedWrapper delay={300} className="lg:col-span-1">
                <Card className="h-full text-center shadow-soft hover:shadow-lift transition-all duration-300">
                     <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                            {processSteps[2].icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="mb-2 text-xl">{processSteps[2].title}</CardTitle>
                        <p className="text-muted-foreground">{processSteps[2].description}</p>
                    </CardContent>
                </Card>
            </AnimatedWrapper>
        </div>
        
        {/* Connector for smaller screens */}
        <div className="flex lg:hidden justify-center my-8">
             <ArrowRight className="w-12 h-12 text-primary/30 rotate-90" />
        </div>
        
        {/* Connector for larger screens */}
        <div className="hidden lg:flex justify-end my-8 h-8">
             <div className="w-1/5 border-b-2 border-l-2 border-primary/30 rounded-bl-3xl"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 items-center gap-8">
            {/* Step 6 */}
            <AnimatedWrapper delay={600} className="lg:col-span-1 order-last lg:order-first">
                 <Card className="h-full text-center shadow-soft hover:shadow-lift transition-all duration-300">
                     <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                            {processSteps[5].icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="mb-2 text-xl">{processSteps[5].title}</CardTitle>
                        <p className="text-muted-foreground">{processSteps[5].description}</p>
                    </CardContent>
                </Card>
            </AnimatedWrapper>
            
            <Arrow className="lg:rotate-180" />

            {/* Step 5 */}
            <AnimatedWrapper delay={500} className="lg:col-span-1 order-3 lg:order-2">
                 <Card className="h-full text-center shadow-soft hover:shadow-lift transition-all duration-300">
                     <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                            {processSteps[4].icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="mb-2 text-xl">{processSteps[4].title}</CardTitle>
                        <p className="text-muted-foreground">{processSteps[4].description}</p>
                    </CardContent>
                </Card>
            </AnimatedWrapper>

             <Arrow className="lg:rotate-180" />

             {/* Step 4 */}
            <AnimatedWrapper delay={400} className="lg:col-span-1 order-first lg:order-last">
                 <Card className="h-full text-center shadow-soft hover:shadow-lift transition-all duration-300">
                     <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                            {processSteps[3].icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="mb-2 text-xl">{processSteps[3].title}</CardTitle>
                        <p className="text-muted-foreground">{processSteps[3].description}</p>
                    </CardContent>
                </Card>
            </AnimatedWrapper>
        </div>
      </div>
    </section>
  );
}
