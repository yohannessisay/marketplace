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
      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <Hero setIsContactModalOpen={setIsContactModalOpen} />
      </main>
      <ContactModal open={isContactModalOpen} setOpen={setIsContactModalOpen} />
    </div>
  );
};

export default LandingPage;
