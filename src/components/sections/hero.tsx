
'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export function Hero() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const heroImages = PlaceHolderImages.filter(p => p.id.startsWith('hero-'));

  const headlineText = "Research Edge and";
  const animatedWord = "Publication";

  return (
    <section
      id="home"
      className="relative w-full h-[calc(100vh-5rem)] overflow-hidden"
    >
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        opts={{
          loop: true,
        }}
        className="w-full h-full"
      >
        <CarouselContent>
          {heroImages.map((image, index) => (
            <CarouselItem key={index}>
              <div className="w-full h-[calc(100vh-5rem)] relative">
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  fill
                  className="object-cover"
                  data-ai-hint={image.imageHint}
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      <div className="absolute inset-0 bg-[hsl(var(--foreground)_/_0.6)]" />

      {/* Foreground Content Layer */}
      <div className="absolute inset-0 z-10 h-full flex flex-col items-center justify-center text-center container mx-auto px-4">
        <div key={current} className="space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-headline opacity-0 animate-pop-in" style={{ animationDelay: '100ms' }}>
            {headlineText}{' '}
            <span className="gradient-text-shimmer">{animatedWord}</span>
          </h1>
          
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl text-white/90 opacity-0 animate-fade-slide-in" style={{ animationDelay: '300ms' }}>
            From Research to Publication, All in One Place
          </p>
          
          <p className="mt-6 max-w-4xl mx-auto text-base md:text-lg text-white/80 opacity-0 animate-fade-slide-in" style={{ animationDelay: '400ms' }}>
            India’s trusted academic and publishing partner helping students, scholars, educators, and institutions convert ideas into polished, publishable work.
          </p>
        
          <div className="mt-10 flex justify-center gap-4 opacity-0 animate-fade-slide-in" style={{ animationDelay: '500ms' }}>
            <Button asChild size="lg">
              <Link href="#services">Our Services</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
              <Link href="#contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
