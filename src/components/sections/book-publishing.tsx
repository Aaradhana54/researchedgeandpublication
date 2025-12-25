import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AnimatedWrapper } from '@/components/animated-wrapper';

const publishingServices = [
    { title: 'Book Writing & Ghostwriting', description: 'Professional writing and ghostwriting services to bring your book idea to life.' },
    { title: 'Academic Book Conversion', description: 'Transform your thesis, dissertation, or research into a published academic book.' },
    { title: 'Editing & Proofreading', description: 'Meticulous editing to ensure your manuscript is polished and error-free.' },
    { title: 'Cover Design & Interior Formatting', description: 'Creative cover design and professional interior layout for print and eBooks.' },
    { title: 'ISBN & Copyright Assistance', description: 'We handle ISBN assignment and copyright registration to protect your work.' },
    { title: 'Publishing & Distribution', description: 'Global distribution to major online retailers and platforms.' },
    { title: 'Book Marketing & Branding', description: 'Strategic marketing and branding support to help your book reach its audience.' },
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
        <AnimatedWrapper delay={200}>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {publishingServices.map((service) => (
                <AccordionItem key={service.title} value={service.title} className="bg-card shadow-soft rounded-lg mb-3 px-4 transition-shadow hover:shadow-lift">
                  <AccordionTrigger className="text-lg font-medium hover:no-underline">
                    {service.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {service.description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  );
}
