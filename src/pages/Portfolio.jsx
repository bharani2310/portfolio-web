import { useState } from 'react';
import { motion } from 'framer-motion';
import Loader from '../components/Loader/Loader';
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import About from '../components/About/About';
import Skills from '../components/Skills/Skills';
import Experience from '../components/Experience/Experience';
import Projects from '../components/Projects/Projects';
import Contact from '../components/Contact/Contact';
import Footer from '../components/Footer/Footer';
import { PortfolioProvider } from '../hooks/usePortfolioContext.jsx';

export default function Portfolio() {
  const [, setLoaded] = useState(false);
  return (
    <PortfolioProvider>
      <Loader name="Portfolio" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7, duration: 0.6 }}
        onAnimationComplete={() => setLoaded(true)}
      >
        <Navbar />
        <main className="pt-16 md:pt-20">
          <Hero />
          <About />
          <Skills />
          <Experience />
          <Projects />
          <Contact />
        </main>
        <Footer />
      </motion.div>
    </PortfolioProvider>
  );
}
