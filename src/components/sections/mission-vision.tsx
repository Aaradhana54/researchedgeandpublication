'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Eye } from 'lucide-react';
import { AnimatedWrapper } from '@/components/animated-wrapper';

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
      'To become India’s most trusted and comprehensive one-stop platform for all research and publishing needs, building a future where every brilliant idea receives the expert support it needs to achieve global recognition.',
  },
];

export function MissionVision() {
  return (
    <section id="mission-vision" className="w-full bg-secondary py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {items.map((item, index) => (
            <AnimatedWrapper key={item.title} delay={index * 150}>
              <Card className="h-full text-center shadow-soft hover:shadow-lift hover:-translate-y-2 transition-all duration-300 bg-background">
                <CardHeader>
                   <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    {item.icon}
                  </div>
                  <CardTitle className="text-3xl font-headline font-bold text-primary">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className="text-lg text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  ></p>
                </CardContent>
              </Card>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
