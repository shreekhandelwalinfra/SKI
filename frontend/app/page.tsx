import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Hero from './components/Hero';
import WhyChooseSKI from './components/WhyChooseSKI';
import EarningPlanTeaser from './components/EarningPlanTeaser';
import Testimonials from './components/Testimonials';
import CTASection from './components/CTASection';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhyChooseSKI />
        <EarningPlanTeaser />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
