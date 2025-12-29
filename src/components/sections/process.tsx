
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
        
        <div className="relative max-w-2xl mx-auto">
           {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 h-full w-0.5 bg-border -translate-x-1/2" aria-hidden="true"></div>
          
          <div className="space-y-12">
            {processSteps.map((item, index) => (
              <AnimatedWrapper key={item.step} delay={index * 150}>
                <div className="relative flex items-start md:items-center">
                    {/* Circle */}
                    <div className="absolute left-6 md:left-1/2 top-0 md:top-1/2 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl ring-8 ring-secondary -translate-x-1/2 md:-translate-y-1/2">
                        {item.step}
                    </div>
                    
                    <div className="w-full p-6 bg-card rounded-lg shadow-soft ml-16 md:ml-0 md:w-[calc(50%-3rem)] md:odd:ml-auto md:odd:text-right md:even:mr-auto">
                         <h3 className="text-xl font-bold">{item.title}</h3>
                        <p className="mt-1 text-muted-foreground">{item.description}</p>
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
