
import {
  BookCopy,
  BookUp,
  FileCheck2,
  Palette,
  Copyright,
  Globe2,
  Megaphone,
} from 'lucide-react';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const publishingServices = [
  {
    icon: <BookCopy className="w-8 h-8 text-accent" />,
    title: 'Book Writing & Ghostwriting',
    description: 'Professional writing and ghostwriting services to bring your book idea to life.',
  },
  {
    icon: <BookUp className="w-8 h-8 text-accent" />,
    title: 'Academic Book Conversion',
    description: 'Transform your thesis, dissertation, or research into a published academic book.',
  },
  {
    icon: <FileCheck2 className="w-8 h-8 text-accent" />,
    title: 'Editing & Proofreading',
    description: 'Meticulous editing to ensure your manuscript is polished and error-free.',
  },
  {
    icon: <Palette className="w-8 h-8 text-accent" />,
    title: 'Cover Design & Formatting',
    description: 'Creative cover design and professional interior layout for print and eBooks.',
  },
  {
    icon: <Copyright className="w-8 h-8 text-accent" />,
    title: 'ISBN & Copyright',
    description: 'We handle ISBN assignment and copyright registration to protect your work.',
  },
  {
    icon: <Globe2 className="w-8 h-8 text-accent" />,
    title: 'Publishing & Distribution',
    description: 'Global distribution to major online retailers and platforms.',
  },
   {
    icon: <Megaphone className="w-8 h-8 text-accent" />,
    title: 'Book Marketing & Branding',
    description: 'Strategic marketing and branding support to help your book reach its audience.',
  },
];


export function BookPublishing() {
  return (
    <section id="book-publishing" className="w-full bg-secondary py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <AnimatedWrapper>
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
              Book Writing & Publishing
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Comprehensive services to guide your manuscript from concept to publication.
            </p>
          </div>
        </AnimatedWrapper>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
           {publishingServices.map((service, index) => (
            <AnimatedWrapper key={service.title} delay={index * 100}>
              <Card className="h-full text-center shadow-soft hover:shadow-lift hover:-translate-y-2 transition-all duration-300">
                <CardHeader className="items-center">
                  <div className="bg-accent/10 p-4 rounded-full mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
