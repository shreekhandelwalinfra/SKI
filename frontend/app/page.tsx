import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Hero from './components/Hero';
import FeaturedProperties from './components/FeaturedProperties';
import Portfolio from './components/Portfolio';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedProperties />
        <Portfolio />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
