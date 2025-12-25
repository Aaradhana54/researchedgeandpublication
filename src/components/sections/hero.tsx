import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Hero() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  return (
    <section
      id="home"
      className="relative w-full min-h-[calc(100vh-5rem)] flex items-center justify-center text-center px-4 py-24 md:py-32 lg:py-40"
    >
      {heroImage && (
         <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover -z-10"
            data-ai-hint={heroImage.imageHint}
            priority
          />
      )}
      <div className="absolute inset-0 bg-background/80 -z-10" />

      <div className="container mx-auto">
        <AnimatedWrapper>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl font-headline">
            Research Agent Publication
          </h1>
        </AnimatedWrapper>
        <AnimatedWrapper delay={200}>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl text-foreground/80">
            From Research to Publication, All in One Place
          </p>
        </AnimatedWrapper>
        <AnimatedWrapper delay={400}>
          <p className="mt-6 max-w-4xl mx-auto text-base md:text-lg text-muted-foreground">
            India’s trusted academic and publishing partner helping students, scholars, educators, and institutions convert ideas into polished, publishable work.
          </p>
        </AnimatedWrapper>
        <AnimatedWrapper delay={600}>
          <div className="mt-10 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="#services">Our Services</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-background/80">
              <Link href="#contact">Contact Us</Link>
            </Button>
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  );
}
