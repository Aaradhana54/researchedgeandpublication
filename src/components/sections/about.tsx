
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
                About Research Edge and Publication
              </h2>
              <p className="text-lg text-muted-foreground">
                Founded on the principle that every great idea deserves to be shared, Research Edge and Publication (REP) is a premier academic and publishing partner based in India. We specialize in providing comprehensive, end-to-end services tailored to the unique needs of students, scholars, educators, and institutions.
              </p>
              <p className="text-lg text-muted-foreground">
                Our team is our greatest asset. Comprising seasoned researchers, meticulous editors, expert statisticians, and creative designers, we bring a wealth of diverse experience to every project. We are passionate about fostering academic growth and are committed to transforming your hard work and innovative ideas into polished, impactful, and publishable manuscripts.
              </p>
               <p className="text-lg text-muted-foreground">
                With an unwavering focus on quality, integrity, and client success, we guide you through each phase of the research and publishing journey. From refining your initial concept to navigating the final submission, we ensure your work not only meets but exceeds the highest standards of academic excellence.
              </p>
            </div>
          </AnimatedWrapper>
          <AnimatedWrapper delay={200}>
            {aboutImage && (
              <div className="overflow-hidden rounded-lg shadow-lift h-[600px]">
                 <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  width={600}
                  height={800}
                  data-ai-hint={aboutImage.imageHint}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
          </AnimatedWrapper>
        </div>
      </div>
    </section>
  );
}
