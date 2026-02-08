
import React, { useState, useEffect } from 'react';

interface HeroCarouselProps {
  images: string[];
}

const HeroCarousel: React.FC<HeroCarouselProps> = React.memo(({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000); 
    return () => clearInterval(interval);
  }, [images]);

  if (images.length === 0) return <div className="absolute inset-0 bg-stone-800"></div>;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ease-in-out ${
            idx === currentIndex ? 'opacity-100 scale-105 duration-[8000ms]' : 'opacity-0 scale-100'
          }`}
          style={{ transitionProperty: 'opacity, transform', willChange: 'opacity, transform' }}
        >
          <img
            src={img}
            alt={`Slide ${idx}`}
            className="w-full h-full object-cover"
            loading={idx === 0 ? "eager" : "lazy"}
            // @ts-ignore: fetchPriority is a new standard not yet in all TS definitions
            fetchPriority={idx === 0 ? "high" : "auto"}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 via-stone-900/20 to-stone-900/60"></div>
        </div>
      ))}
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === currentIndex ? 'w-8 bg-emerald-400' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
});

export default HeroCarousel;
