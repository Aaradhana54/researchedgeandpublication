
'use client';

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
      className="relative w-full min-h-[calc(100vh-5rem)] flex items-center justify-center text-center"
    >
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover -z-20"
          data-ai-hint={heroImage.imageHint}
          priority
        />
      )}
      {/* This overlay creates a dark tint. Remove the div for a proper image view. */}
      <div className="absolute top-0 left-0 inset-0 bg-black/50 -z-10" />


      <div className="container mx-auto px-4 relative z-10">
        <AnimatedWrapper>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-headline">
            Research Edge and Publication
          </h1>
        </AnimatedWrapper>
        <AnimatedWrapper delay={200}>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl text-white/90">
            From Research to Publication, All in One Place
          </p>
        </AnimatedWrapper>
        <AnimatedWrapper delay={400}>
          <p className="mt-6 max-w-4xl mx-auto text-base md:text-lg text-white/80">
            India’s trusted academic and publishing partner helping students, scholars, educators, and institutions convert ideas into polished, publishable work.
          </p>
        </AnimatedWrapper>
        <AnimatedWrapper delay={600}>
          <div className="mt-10 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="#services">Our Services</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
              <Link href="#contact">Contact Us</Link>
            </Button>
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  );
}
