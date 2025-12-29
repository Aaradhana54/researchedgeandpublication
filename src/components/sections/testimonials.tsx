'use client';
import Image from 'next/image';
import { useMemo } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import { type Testimonial } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { LoaderCircle } from 'lucide-react';


const staticTestimonials: Testimonial[] = PlaceHolderImages
    .filter(img => img.id.startsWith('testimonial-') && img.data)
    .map(img => ({
        ...img.data!,
        avatarId: img.id
    }));


export function Testimonials() {
  const firestore = useFirestore();

  const testimonialsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'testimonials'));
  }, [firestore]);
  
  const { data: dynamicTestimonials, loading } = useCollection<Testimonial>(testimonialsQuery);

  const allTestimonials = [...staticTestimonials, ...(dynamicTestimonials || [])];


  return (
    <section id="testimonials" className="w-full py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <AnimatedWrapper>
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
              What Our Clients Say
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Hear from the researchers, educators, and institutions who trust us.
            </p>
          </div>
        </AnimatedWrapper>
        <AnimatedWrapper delay={200}>
        {loading ? (
             <div className="flex justify-center"><LoaderCircle className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
              {allTestimonials.map((testimonial, index) => {
                const image = PlaceHolderImages.find(p => p.id === testimonial.avatarId);
                const message = testimonial.message.replace(/Revio Research|Revio/gi, 'Research Edge and Publication');
                return (
                  <CarouselItem key={index} className="md:basis-1/2">
                    <div className="p-1 h-full">
                      <Card className="h-full flex flex-col justify-between shadow-soft hover:shadow-lift transition-shadow duration-300">
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                          {image ? (
                             <Image
                                src={image.imageUrl}
                                alt={`Avatar of ${testimonial.name}`}
                                width={80}
                                height={80}
                                data-ai-hint={image.imageHint}
                                className="rounded-full border-4 border-primary/10"
                              />
                          ) : (
                             <div className="w-20 h-20 rounded-full border-4 border-primary/10 bg-muted flex items-center justify-center">
                               <span className="text-2xl font-bold text-primary">{testimonial.name.charAt(0)}</span>
                             </div>
                           )}
                          <blockquote className="mt-2 text-muted-foreground italic">
                            “{message}”
                          </blockquote>
                          <div className="mt-auto">
                            <p className="font-bold text-primary">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.designation}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        )}
        </AnimatedWrapper>
      </div>
    </section>
  );
}
