import { AnimatedWrapper } from '@/components/animated-wrapper';

const processSteps = [
  {
    step: 1,
    title: 'Consultation',
    description: 'We start with a detailed consultation to understand your project requirements and goals.',
  },
  {
    step: 2,
    title: 'Planning',
    description: 'Our experts create a customized plan and timeline tailored to your specific needs.',
  },
  {
    step: 3,
    title: 'Execution',
    description: 'Our team of writers, editors, and statisticians begin working on your project with precision.',
  },
  {
    step: 4,
    title: 'Review',
    description: 'You receive drafts for review and provide feedback for revisions and improvements.',
  },
  {
    step: 5,
    title: 'Final Publishing',
    description: 'We finalize the work and assist with submission, publication, and distribution.',
  },
];

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
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" aria-hidden="true"></div>

          <div className="space-y-12">
            {processSteps.map((item, index) => (
              <AnimatedWrapper key={item.step} delay={index * 200}>
                <div className="relative flex items-center">
                  <div className={`flex-1 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="p-6 bg-card rounded-lg shadow-soft hover:shadow-lift transition-shadow duration-300">
                      <h3 className="text-xl font-bold text-primary">{item.title}</h3>
                      <p className="mt-2 text-muted-foreground">{item.description}</p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-background rounded-full border-4 border-primary flex items-center justify-center font-bold text-primary">
                    {item.step}
                  </div>

                  <div className="flex-1"></div>
                </div>
              </AnimatedWrapper>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
