import { Hero } from '@/components/sections/hero';
import { MissionVision } from '@/components/sections/mission-vision';
import { About } from '@/components/sections/about';
import { Features } from '@/components/sections/features';
import { Services } from '@/components/sections/services';
import { BookPublishing } from '@/components/sections/book-publishing';
import { InstitutionalBranding } from '@/components/sections/institutional-branding';
import { Process } from '@/components/sections/process';
import { Testimonials } from '@/components/sections/testimonials';
import { Contact } from '@/components/sections/contact';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FeedbackForm } from '@/components/sections/feedback-form';
import { WhatsAppButton } from '@/components/whatsapp-button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Hero />
        <MissionVision />
        <About />
        <Features />
        <Services />
        <BookPublishing />
        <InstitutionalBranding />
        <Process />
        <Testimonials />
        <Contact />
        <FeedbackForm />
        <WhatsAppButton phoneNumber="8889932922" />
      </main>
      <Footer />
    </div>
  );
}
