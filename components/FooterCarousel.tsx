
import React from 'react';

interface FooterCarouselProps {
  images: string[];
}

const FooterCarousel: React.FC<FooterCarouselProps> = ({ images }) => {
  if (!images || images.length === 0) return null;

  // Multiplicamos para asegurar el efecto de scroll continuo
  const displayImages = [...images, ...images, ...images, ...images];

  return (
    <div className="bg-white py-12 border-t border-stone-100 overflow-hidden group">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Aliados y Certificaciones</h4>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>

        <div className="flex animate-[footerScroll_30s_linear_infinite] w-max gap-16 items-center hover:[animation-play-state:paused]">
          {displayImages.map((img, idx) => (
            <div key={idx} className="h-14 md:h-16 flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-500 opacity-50 hover:opacity-100">
              <img 
                src={img} 
                alt={`Partner ${idx}`} 
                className="h-full w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes footerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 4)); }
        }
      `}</style>
    </div>
  );
};

export default FooterCarousel;
