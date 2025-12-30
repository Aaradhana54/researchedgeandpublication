
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Target, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  {
    icon: <Target className="w-8 h-8 text-white" />,
    title: 'Our Mission',
    description:
      'To simplify the complex journey of research and publication by providing ethical, high-quality support that makes academic and institutional publishing straightforward, transparent, and accessible to scholars, educators, and institutions worldwide.',
    alignment: 'left',
  },
  {
    icon: <Eye className="w-8 h-8 text-white" />,
    title: 'Our Vision',
    description:
      'To become India’s most trusted and comprehensive one-stop platform for all research and publishing needs, building a future where every <span class="text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-purple-300">brilliant idea</span> receives the expert support it needs to achieve global recognition.',
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
            className={cn(
                'transition-all duration-1000 transform',
                item.alignment === 'left' ? 'translate-x-[-100%]' : 'translate-x-[100%]',
                'is-in-view:translate-x-0'
            )}
            delay={100}
          >
            <div className={cn(
                "flex items-center",
                item.alignment === 'right' && 'justify-end'
            )}>
                <Card className="group relative w-full md:w-3/4 lg:w-2/3 bg-gradient-to-br from-primary via-primary to-purple-700 text-primary-foreground shadow-lift rounded-2xl border-purple-500/20 overflow-hidden transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
                     <div className="relative flex flex-col md:flex-row items-center p-8 gap-8">
                        <AnimatedWrapper delay={700} className="transition-all duration-700 opacity-0 is-in-view:opacity-100">
                             <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm p-5 rounded-full border border-white/20">
                                {item.icon}
                            </div>
                        </AnimatedWrapper>
                        
                        <div className="text-center md:text-left">
                            <AnimatedWrapper delay={800} className="transition-all duration-700 opacity-0 is-in-view:opacity-100">
                                <CardTitle className="text-3xl font-headline mb-3 text-white">{item.title}</CardTitle>
                            </AnimatedWrapper>
                            <AnimatedWrapper delay={900} className="transition-all duration-700 opacity-0 is-in-view:opacity-100">
                                <CardContent className="p-0 text-lg text-white/80 leading-relaxed">
                                     <p dangerouslySetInnerHTML={{ __html: item.description }}></p>
                                </CardContent>
                            </AnimatedWrapper>
                        </div>
                    </div>
                </Card>
            </div>
          </AnimatedWrapper>
        ))}
      </div>
    </section>
  );
}
