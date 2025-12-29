
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import Link from 'next/link';

export function Hero() {
  const heroImage = {
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwYm9va3N8ZW58MHx8fHwxNzE4MDI3NTI5fDA&ixlib=rb-4.0.3&q=80&w=1080',
    description: 'A stack of books on a table with a library in the background.',
    imageHint: 'library books'
  };

  return (
    <section
      id="home"
      className="relative w-full h-[calc(100vh-5rem)] overflow-hidden"
    >
      {/* Background Image Layer */}
      <Image
        src={heroImage.imageUrl}
        alt={heroImage.description}
        fill
        className="object-cover"
        data-ai-hint={heroImage.imageHint}
        priority
      />
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Foreground Content Layer */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center container mx-auto px-4">
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
