import { About } from '@/components/About';
import { AreasServed } from '@/components/AreasServed';
import { Contact } from '@/components/Contact';
import { CTA } from '@/components/CTA';
import { FacebookFeed } from '@/components/FacebookFeed';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { HowWeWork } from '@/components/HowWeWork';
import { Services } from '@/components/Services';
import { TrustStrip } from '@/components/TrustStrip';
import { Values } from '@/components/Values';

export default function Page() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <TrustStrip />
        <About />
        <Values />
        <Services />
        <HowWeWork />
        <AreasServed />
        <CTA />
        <Contact />
        <FacebookFeed />
      </main>
      <Footer />
    </>
  );
}
