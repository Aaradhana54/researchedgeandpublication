import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedWrapper } from "@/components/animated-wrapper";
import { CheckCircle } from "lucide-react";

const idealFor = [
    'Schools (textbooks, activity books)',
    'Colleges (lab manuals, guides)',
    'Coaching centers (notes, test series)',
    'Universities (journals, edited volumes)',
];

const includes = [
    'Expert content writing',
    'Institutional branding',
    'ISBN under institution name',
    'Print + eBook distribution',
    'Marketing support',
]

export function InstitutionalBranding() {
  return (
    <section id="institutional-branding" className="w-full py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <AnimatedWrapper>
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
              Institutional & School Branding Publications
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
              Custom books published under your school, college, or university's name to enhance your brand and academic offerings.
            </p>
          </div>
        </AnimatedWrapper>
        <div className="grid md:grid-cols-2 gap-8 items-start">
            <AnimatedWrapper delay={200}>
                <Card className="h-full shadow-soft hover:shadow-lift transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">Ideal For</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {idealFor.map(item => (
                                <li key={item} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                                    <span className="text-muted-foreground">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </AnimatedWrapper>
            <AnimatedWrapper delay={400}>
                 <Card className="h-full shadow-soft hover:shadow-lift transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">What's Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {includes.map(item => (
                                <li key={item} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                                    <span className="text-muted-foreground">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </AnimatedWrapper>
        </div>
      </div>
    </section>
  );
}
