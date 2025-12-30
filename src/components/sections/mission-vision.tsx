
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Target, Eye } from 'lucide-react';

export function MissionVision() {
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

  return (
    <section id="mission-vision" className="w-full bg-secondary py-16 md:py-24 lg:py-32">
      <div className="container mx-auto max-w-4xl">
        <div className="relative">
          {/* Vertical connecting line */}
          <div
            className="absolute left-9 top-9 h-[calc(100%-4.5rem)] w-0.5 bg-border -translate-x-1/2"
            aria-hidden="true"
          />

          <div className="space-y-16">
            {items.map((item, index) => (
              <AnimatedWrapper key={item.title} delay={index * 200}>
                <div className="relative flex items-start gap-8">
                  {/* Icon and Circle */}
                  <div className="relative z-10 flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-full bg-background shadow-soft">
                    {item.icon}
                  </div>

                  {/* Content */}
                  <div className="pt-2">
                    <h3 className="font-headline text-3xl text-primary mb-2">{item.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
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
