
'use client';

import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Target, Eye } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

const items = [
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: 'Our Mission',
    watermark: 'MISSION',
    description:
      'To simplify the complex journey of research and publication by providing ethical, high-quality support that makes academic and institutional publishing straightforward, transparent, and accessible to scholars, educators, and institutions worldwide.',
    animationClass: 'animate-slide-in-from-left',
  },
  {
    icon: <Eye className="w-8 h-8 text-primary" />,
    title: 'Our Vision',
    watermark: 'VISION',
    description:
      'To become India’s most trusted and comprehensive one-stop platform for all research and publishing needs, building a future where every <span class="font-medium text-primary">brilliant idea</span> receives the expert support it needs to achieve global recognition.',
    animationClass: 'animate-slide-in-from-right',
  },
];

export function MissionVision() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section id="mission-vision" className="w-full bg-secondary py-16 md:py-24 lg:py-32 overflow-x-hidden">
      <div ref={ref} className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {items.map((item) => (
            <div
              key={item.title}
              className={cn(
                'gradient-border-card opacity-0',
                inView ? item.animationClass : ''
              )}
            >
              <div className="relative h-full overflow-hidden rounded-lg bg-background p-8 text-left shadow-soft">
                {/* Watermark */}
                <p className="absolute -bottom-4 -right-4 text-[6rem] font-extrabold text-foreground/5 pointer-events-none z-0">
                  {item.watermark}
                </p>
                
                <div className="relative z-10 space-y-4">
                  <AnimatedWrapper>
                    <div className="group/icon inline-block bg-primary/10 p-3 rounded-full mb-4 transition-all duration-300">
                      {React.cloneElement(item.icon, {
                        className: 'w-8 h-8 text-primary transition-transform duration-300 group-hover/icon:scale-110',
                      })}
                    </div>
                  </AnimatedWrapper>
                  <AnimatedWrapper delay={200}>
                    <h3 className="text-3xl font-headline font-bold text-foreground">
                      {item.title}
                    </h3>
                  </AnimatedWrapper>
                  <AnimatedWrapper delay={400}>
                    <p
                      className="text-lg text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    ></p>
                  </AnimatedWrapper>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
