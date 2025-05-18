"use client";

import { useEffect, useState } from "react";
import { Header } from "./header";
import { Hero } from "./Hero";
import ContactModal from "./sections/contact";

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header scrolled={scrolled} />
      <main className="flex-grow p-24">
        <Hero setIsContactModalOpen={setIsContactModalOpen} />
        {/* <Marketplace />
        <Features />
        <About />
        <EUDRSection />
        <Testimonials />
        <ContactSection /> */}
      </main>
      <ContactModal open={isContactModalOpen} setOpen={setIsContactModalOpen} />
      {/* <Footer /> */}
    </div>
  );
};

export default LandingPage;
