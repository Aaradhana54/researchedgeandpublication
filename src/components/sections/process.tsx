import { AnimatedWrapper } from '@/components/animated-wrapper';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

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
  const processImage = PlaceHolderImages.find(p => p.id === 'process-image');

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
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <AnimatedWrapper delay={200}>
             {processImage && (
              <div className="overflow-hidden rounded-lg shadow-lift">
                 <Image
                  src={processImage.imageUrl}
                  alt={processImage.description}
                  width={600}
                  height={400}
                  data-ai-hint={processImage.imageHint}
                  className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
          </AnimatedWrapper>
          <div className="space-y-8">
            {processSteps.map((item, index) => (
              <AnimatedWrapper key={item.step} delay={index * 150}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
                    {item.step}
                  </div>
                  <div>
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
