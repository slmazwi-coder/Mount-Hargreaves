import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  { url: '', caption: 'Academic excellence' },
  { url: '', caption: 'Discipline and pride' },
  { url: '', caption: 'Community and growth' },
  { url: '', caption: 'Preparing learners for the future' },
];

export const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative h-[650px] w-full overflow-hidden bg-school-green">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {slides[currentIndex].url ? (
            <img
              src={slides[currentIndex].url}
              alt={slides[currentIndex].caption}
              className="h-full w-full object-cover object-center opacity-40"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-school-green via-[#0B2A57] to-[#081529] opacity-95" />
          )}
          <div className="absolute bottom-20 left-0 right-0 text-center z-20">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={`caption-${currentIndex}`}
              className="text-white/85 text-lg md:text-xl font-medium tracking-wide uppercase"
            >
              {slides[currentIndex].caption}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-4 uppercase"
        >
          Mount Hargreaves SSS
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-lg md:text-2xl font-light italic"
        >
          "Strive for excellence"
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 flex gap-4"
        >
          <a href="/admissions" className="btn-primary bg-white text-school-green hover:bg-gray-100">
            Admissions
          </a>
          <a href="/about" className="btn-primary border-2 border-white bg-transparent hover:bg-white/10">
            Learn More
          </a>
        </motion.div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
      >
        <ChevronRight size={32} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
};
