
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import {
  BookOpenText,
  FileSignature,
  FileText,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  PenSquare,
  Lightbulb,
  Send,
} from 'lucide-react';

const researchServices = [
  {
    title: 'Thesis & Dissertation Writing',
    description: 'Comprehensive support for crafting your thesis or dissertation from start to finish.',
    icon: <BookOpenText className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Synopsis & Proposal Preparation',
    description: 'Develop a compelling research proposal and synopsis to get your project approved.',
    icon: <FileSignature className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Research Paper Writing & Publication Support',
    description: 'Expert assistance in writing and publishing your research in high-impact journals.',
    icon: <FileText className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Literature Review & Reference Management',
    description: 'Systematic literature reviews and precise reference management.',
    icon: <ClipboardList className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Data Analysis & Interpretation',
    description: 'Advanced statistical analysis and clear interpretation of your research data.',
    icon: <BarChart3 className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Plagiarism Checking & Removal',
    description: 'Ensure originality with our thorough plagiarism checks and content refinement services.',
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
  },
   {
    title: 'Proofreading & Editing',
    description: 'Professional editing to enhance clarity, grammar, and style for a polished final document.',
    icon: <PenSquare className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Topic Selection & Research Design',
    description: 'Guidance in selecting a relevant topic and designing a robust research methodology.',
    icon: <Lightbulb className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Journal Formatting & Submission',
    description: 'Formatting your manuscript according to journal guidelines and managing the submission process.',
    icon: <Send className="w-8 h-8 text-primary" />,
  },
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {researchServices.map((service, index) => (
            <AnimatedWrapper key={service.title} delay={index * 100}>
              <Card className="h-full shadow-soft hover:shadow-lift hover:-translate-y-2 transition-all duration-300 flex flex-col">
                <CardHeader>
                    <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                        {service.icon}
                    </div>
                    <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
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
