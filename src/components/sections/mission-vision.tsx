
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Target, Eye } from 'lucide-react';

export function MissionVision() {
  return (
    <section id="mission-vision" className="w-full bg-secondary py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <div className="grid gap-8 md:grid-cols-2">
          <AnimatedWrapper>
            <Card className="h-full shadow-soft hover:shadow-lift transition-shadow duration-300">
              <CardHeader className="flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground">
                  To simplify the complex journey of research and publication by providing ethical, high-quality support that makes academic and institutional publishing straightforward, transparent, and accessible to scholars, educators, and institutions worldwide.
                </p>
              </CardContent>
            </Card>
          </AnimatedWrapper>
          <AnimatedWrapper delay={200}>
            <Card className="h-full shadow-soft hover:shadow-lift transition-shadow duration-300">
              <CardHeader className="flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Eye className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground">
                  To become India’s most trusted and comprehensive one-stop platform for all research and publishing needs, building a future where every brilliant idea receives the expert support it needs to achieve global recognition.
                </p>
              </CardContent>
            </Card>
          </AnimatedWrapper>
        </div>
      </div>
    </section>
  );
}
