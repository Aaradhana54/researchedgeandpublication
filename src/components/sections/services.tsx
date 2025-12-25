import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AnimatedWrapper } from '@/components/animated-wrapper';

const researchServices = [
    { title: 'Thesis & Dissertation Writing', description: 'Comprehensive support for crafting your thesis or dissertation from start to finish.' },
    { title: 'Synopsis & Proposal Preparation', description: 'Develop a compelling research proposal and synopsis to get your project approved.' },
    { title: 'Research Paper Writing & Publication Support', description: 'Expert assistance in writing and publishing your research in high-impact journals.' },
    { title: 'Literature Review & Reference Management', description: 'Systematic literature reviews and precise reference management using tools like EndNote and Zotero.' },
    { title: 'Data Analysis & Interpretation (SPSS, R, SmartPLS)', description: 'Advanced statistical analysis and clear interpretation of your research data.' },
    { title: 'Plagiarism Checking & Removal', description: 'Ensure originality with our thorough plagiarism checks and content refinement services.' },
    { title: 'Proofreading & Editing', description: 'Professional editing to enhance clarity, grammar, and style for a polished final document.' },
    { title: 'Topic Selection & Research Design', description: 'Guidance in selecting a relevant topic and designing a robust research methodology.' },
    { title: 'Journal Formatting & Submission', description: 'Formatting your manuscript according to journal guidelines and managing the submission process.' },
];

export function Services() {
  return (
    <section id="services" className="w-full py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <AnimatedWrapper>
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
              Research Services
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              End-to-end support for every stage of your academic research journey.
            </p>
          </div>
        </AnimatedWrapper>
        <AnimatedWrapper delay={200}>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {researchServices.map((service) => (
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
