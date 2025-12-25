import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import { ShieldCheck, Users, Clock, Tag, Lock } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-accent" />,
    title: '100% Plagiarism-Free',
    description: 'We guarantee customized, original work that is free from plagiarism.',
  },
  {
    icon: <Users className="w-8 h-8 text-accent" />,
    title: 'Subject-Specific Experts',
    description: 'Our team consists of specialists across a wide range of academic disciplines.',
  },
  {
    icon: <Clock className="w-8 h-8 text-accent" />,
    title: 'Transparent Timelines',
    description: 'We provide clear and realistic deadlines, ensuring timely delivery.',
  },
  {
    icon: <Tag className="w-8 h-8 text-accent" />,
    title: 'Affordable Packages',
    description: 'High-quality services at competitive prices to fit your budget.',
  },
  {
    icon: <Lock className="w-8 h-8 text-accent" />,
    title: 'Complete Confidentiality',
    description: 'Your research and personal information are kept secure and private.',
  },
];

export function Features() {
  return (
    <section id="features" className="w-full bg-secondary py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
            Why We Stand Out
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Our commitment to excellence and client satisfaction sets us apart.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {features.map((feature, index) => (
            <AnimatedWrapper key={feature.title} delay={index * 100}>
              <Card className="h-full text-center shadow-soft hover:shadow-lift hover:-translate-y-2 transition-all duration-300">
                <CardHeader className="items-center">
                  <div className="bg-accent/10 p-4 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
