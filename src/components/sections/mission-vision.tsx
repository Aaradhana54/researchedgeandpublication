
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Target, Eye } from 'lucide-react';

const items = [
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: 'Our Mission',
    description:
      'To simplify the complex journey of research and publication by providing ethical, high-quality support that makes academic and institutional publishing straightforward, transparent, and accessible to scholars, educators, and institutions worldwide.',
  },
  {
    icon: <Eye className="w-8 h-8 text-primary" />,
    title: 'Our Vision',
    description:
      'To become India’s most trusted and comprehensive one-stop platform for all research and publishing needs, building a future where every <span class="font-medium text-primary">brilliant idea</span> receives the expert support it needs to achieve global recognition.',
  },
];

export function MissionVision() {
  return (
    <section id="mission-vision" className="w-full bg-secondary py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, index) => (
            <AnimatedWrapper
              key={item.title}
              delay={index * 100}
            >
              <Card className="bg-background text-foreground shadow-soft rounded-lg hover:shadow-lift hover:-translate-y-2 transition-all duration-300 h-full">
                <CardHeader>
                   <AnimatedWrapper>
                        <div className="flex-shrink-0 bg-secondary p-4 inline-block rounded-full border">
                            {item.icon}
                        </div>
                   </AnimatedWrapper>
                </CardHeader>
                <CardContent className="space-y-3">
                   <AnimatedWrapper>
                    <CardTitle className="text-3xl font-headline">{item.title}</CardTitle>
                  </AnimatedWrapper>
                  <AnimatedWrapper delay={200}>
                    <p className="text-lg text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: item.description }}></p>
                  </AnimatedWrapper>
                </CardContent>
              </Card>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
