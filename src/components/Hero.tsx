import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, ArrowRight, Play } from 'lucide-react';

const SLIDE_DURATION = 6000;

const slides = [
  { url: '/assets/hero/images (2).jpeg', title: 'Academic', subtitle: 'Excellence', caption: 'Empowering minds for a brighter tomorrow.', alt: 'Mount Hargreaves SSS students demonstrating academic excellence' },
  { url: '/assets/hero/images (1).jpeg', title: 'Discipline', subtitle: '& Pride', caption: 'Building character through dedication and respect.', alt: 'Mount Hargreaves SSS learners showing discipline and school pride' },
  { url: '/assets/hero/3e7e487a933835fd2aa5936d57c7cdd6.png', title: 'Our Team', subtitle: '& Community', caption: 'Fostering unity and collaboration in every endeavor.', alt: 'Mount Hargreaves SSS staff and school community' },
  { url: '/assets/hero/d8d53f724e0b195658e83c643a6b491e.png', title: 'Celebrating', subtitle: 'Achievements', caption: 'Honoring hard work, dedication, and success.', alt: 'Mount Hargreaves SSS celebrating student achievements' },
];

export const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);
  
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  // We use scrollY to create a subtle parallax effect on the background image
  const y = useTransform(scrollY, [0, 1000], [0, 300]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isPaused]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goTo = (index: number) => setCurrentIndex(index);

  const slide = slides[currentIndex];
  const showImage = !!slide.url && !failed[currentIndex];

  // Animation variants
  const textContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  const textItem = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-screen min-h-[700px] w-full overflow-hidden bg-[#0a1128]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0 z-0"
        >
          {showImage ? (
            <motion.div
              style={{ y }}
              className="absolute inset-0 w-full h-[120%] -top-[10%]"
            >
              <motion.img
                initial={{ scale: 1.05 }}
                animate={{ scale: 1.15 }}
                transition={{ duration: SLIDE_DURATION / 1000 + 2, ease: 'linear' }}
                src={slide.url}
                alt={slide.alt}
                className="w-full h-full object-cover object-center"
                onError={() => setFailed((p) => ({ ...p, [currentIndex]: true }))}
              />
            </motion.div>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#0B1F3B] via-[#0B2A57] to-[#081529] flex items-center justify-center">
              <div className="text-center text-white/70 px-6">
                <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
                  <ImageIcon />
                </div>
                <div className="font-semibold">Hero image placeholder</div>
                <div className="text-sm text-white/60">
                  Add images to <span className="font-mono">public/assets/hero/</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Complex Gradient Overlays for premium look and text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3B] via-[#0B1F3B]/40 to-transparent opacity-90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3B]/80 via-transparent to-[#0B1F3B]/30 opacity-80" />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 max-w-7xl mx-auto w-full pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentIndex}`}
            variants={textContainer}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.4 } }}
            className="flex flex-col items-center max-w-4xl"
          >
            <motion.div variants={textItem} className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm md:text-base font-medium uppercase tracking-widest shadow-xl">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Mount Hargreaves SSS
            </motion.div>

            <motion.h1 variants={textItem} className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.1] mb-2 drop-shadow-2xl">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white/70">
                {slide.title}
              </span>
              <span className="block mt-2">
                {slide.subtitle}
              </span>
            </motion.h1>

            <motion.p variants={textItem} className="mt-8 text-lg md:text-2xl font-light text-blue-50/90 max-w-2xl drop-shadow-md">
              {slide.caption}
            </motion.p>
            
            <motion.p variants={textItem} className="mt-6 text-xl md:text-3xl font-medium italic text-blue-200/90 font-serif">
              "We Can"
            </motion.p>

            <motion.div variants={textItem} className="mt-12 flex flex-col sm:flex-row gap-5 items-center justify-center">
              <a href="/admissions" className="group relative px-8 py-4 bg-white text-[#0B1F3B] rounded-full font-bold text-lg overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                <span className="relative flex items-center gap-2">
                  Apply Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
              <a href="/about" className="group px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2 hover:border-white/40 transform hover:-translate-y-1">
                <Play size={18} className="fill-white group-hover:scale-110 transition-transform" />
                Discover More
              </a>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 w-full flex justify-between items-center px-4 md:px-8 z-20 pointer-events-none">
        <button
          onClick={prev}
          className="pointer-events-auto h-14 w-14 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-[#0B1F3B] transition-all duration-300 transform hover:scale-110 group"
          aria-label="Previous slide"
        >
          <ChevronLeft size={28} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button
          onClick={next}
          className="pointer-events-auto h-14 w-14 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-[#0B1F3B] transition-all duration-300 transform hover:scale-110 group"
          aria-label="Next slide"
        >
          <ChevronRight size={28} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-8 left-0 w-full flex justify-center z-20">
        <div className="flex gap-3 items-center bg-black/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative group py-2"
              aria-label={`Go to slide ${i + 1}`}
            >
              <div className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden ${i === currentIndex ? 'w-12 bg-white/30' : 'w-4 bg-white/30 group-hover:bg-white/50'}`}>
                {i === currentIndex && !isPaused && (
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                    className="h-full bg-white"
                  />
                )}
                {i === currentIndex && isPaused && (
                  <div className="h-full w-full bg-white" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
