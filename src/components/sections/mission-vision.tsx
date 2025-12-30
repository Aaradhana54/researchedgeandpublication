
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Target, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: 'Our Mission',
    description:
      'To simplify the complex journey of research and publication by providing ethical, high-quality support that makes academic and institutional publishing straightforward, transparent, and accessible to scholars, educators, and institutions worldwide.',
    alignment: 'left',
  },
  {
    icon: <Eye className="w-8 h-8 text-primary" />,
    title: 'Our Vision',
    description:
      'To become India’s most trusted and comprehensive one-stop platform for all research and publishing needs, building a future where every <span class="font-medium text-primary">brilliant idea</span> receives the expert support it needs to achieve global recognition.',
    alignment: 'right',
  },
];

export function MissionVision() {
  return (
    <section id="mission-vision" className="w-full bg-secondary py-16 md:py-24 lg:py-32 overflow-x-hidden">
      <div className="container mx-auto max-w-6xl space-y-16">
        {items.map((item, index) => (
          <AnimatedWrapper 
            key={item.title} 
            className={cn("flex items-center", item.alignment === 'right' && 'justify-end')}
          >
            <Card className="group w-full md:w-3/4 lg:w-2/3 bg-background text-foreground shadow-soft rounded-2xl transition-all duration-500 hover:shadow-lift hover:-translate-y-2">
                 <div className="relative flex flex-col md:flex-row items-center p-8 gap-8">
                    <AnimatedWrapper>
                         <div className="flex-shrink-0 bg-secondary p-5 rounded-full border">
                            {item.icon}
                        </div>
                    </AnimatedWrapper>
                    
                    <div className="text-center md:text-left">
                        <AnimatedWrapper>
                            <CardTitle className="text-3xl font-headline mb-3">{item.title}</CardTitle>
                        </AnimatedWrapper>
                        <AnimatedWrapper>
                            <CardContent className="p-0 text-lg text-muted-foreground leading-relaxed">
                                 <p dangerouslySetInnerHTML={{ __html: item.description }}></p>
                            </CardContent>
                        </AnimatedWrapper>
                    </div>
                </div>
            </Card>
          </AnimatedWrapper>
        ))}
      </div>
    </section>
  );
}
