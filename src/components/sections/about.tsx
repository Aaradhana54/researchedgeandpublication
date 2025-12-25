import Image from 'next/image';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function About() {
  const aboutImage = PlaceHolderImages.find(p => p.id === 'about-us');

  return (
    <section id="about" className="w-full py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <AnimatedWrapper>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
                About Us
              </h2>
              <p className="text-lg text-muted-foreground">
                We are a professional academic and publishing company offering end-to-end services. Our dedicated team includes experienced researchers, statisticians, editors, and designers committed to transforming your ideas into impactful publications.
              </p>
              <p className="text-lg text-muted-foreground">
                With a focus on quality and integrity, we guide you through every step of the research and publishing journey, ensuring your work meets the highest standards of academic excellence.
              </p>
            </div>
          </AnimatedWrapper>
          <AnimatedWrapper delay={200}>
            {aboutImage && (
              <div className="overflow-hidden rounded-lg shadow-lift">
                 <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  width={600}
                  height={400}
                  data-ai-hint={aboutImage.imageHint}
                  className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
          </AnimatedWrapper>
        </div>
      </div>
    </section>
  );
}
