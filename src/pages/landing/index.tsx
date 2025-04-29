import { useEffect, useState } from 'react';
import { Header } from './header';
 
import Features from './sections/features';
import About from './sections/about';
import Marketplace from './sections/market-place';
import Testimonials from './sections/testimonial';
import EUDRSection from './sections/eudr';
import ContactSection from './sections/contact';
import { Footer } from './footer';
import { Hero } from './Hero';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header scrolled={scrolled} />
      <main className="flex-grow p-24">
        <Hero />
        <Marketplace />
        <Features />
        <About />
        <EUDRSection />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;