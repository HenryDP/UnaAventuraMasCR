
import React, { useState } from 'react';
import { Tour, Language } from '../types';
import { useTranslation } from '../services/translations';

interface TourCardProps {
  tour: Tour;
  isAdmin: boolean;
  lang: Language;
  onEdit?: (tour: Tour) => void;
  onDelete?: (tour: Tour) => void;
  onBook?: (tour: Tour) => void;
  onViewBookings?: (tour: Tour) => void;
}

const TourCard: React.FC<TourCardProps> = React.memo(({ tour, isAdmin, lang, onEdit, onDelete, onBook, onViewBookings }) => {
  const t = useTranslation(lang);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const title = tour.titles?.[lang] || tour.title;
  const description = tour.descriptions?.[lang] || tour.description;

  const slug = tour.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const shareUrl = `${window.location.origin}${window.location.pathname}#tour-${slug}-${tour.id}`;
  const shareText = `${t('share_message')}\n\n*${title}*\n📍 ${tour.location}\n\n👉 `;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        setShowShareMenu(true);
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareText}${shareUrl}`).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    });
  };

  return (
    <div id={`tour-${tour.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-stone-100 flex flex-col h-full scroll-mt-24 will-change-transform relative">
      <div className="relative h-64 overflow-hidden">
        <img 
            src={tour.imageUrl} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            loading="lazy"
            decoding="async" /* Mejora de rendimiento: decodificación no bloqueante */
        />
        <div className="absolute top-4 left-4">
          <span className="bg-emerald-600/90 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shadow-lg">{tour.category}</span>
        </div>
        {isAdmin && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => onViewBookings?.(tour)} className="bg-white/90 p-2.5 rounded-full shadow-lg text-blue-600 hover:scale-110 transition-transform" title="Ver Ventas">📄</button>
            <button onClick={() => onEdit?.(tour)} className="bg-white/90 p-2.5 rounded-full shadow-lg text-emerald-600 hover:scale-110 transition-transform">✏️</button>
            <button onClick={() => onDelete?.(tour)} className="bg-white/90 p-2.5 rounded-full shadow-lg text-red-500 hover:scale-110 transition-transform">🗑️</button>
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
           <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/20 flex-1">
              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">🇨🇷 Nacional</p>
              <p className="text-sm font-black text-stone-800">${tour.priceNational}</p>
           </div>
           <div className="bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/10 flex-1">
              <p className="text-[8px] font-black text-indigo-300 uppercase tracking-tighter">🌎 Standard</p>
              <p className="text-sm font-black text-white">${tour.priceForeigner}</p>
           </div>
        </div>
      </div>

      <div className="p-7 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-stone-800 leading-tight group-hover:text-emerald-700 transition-colors font-serif">{title}</h3>
          <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             {tour.location}
          </p>
        </div>
        
        <p className="text-stone-500 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed font-light">{description}</p>
        
        <div className="flex flex-col gap-3 mt-auto">
          <button 
            onClick={() => onBook?.(tour)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-500/10 active:scale-95 flex items-center justify-center gap-2"
          >
            {t('details_and_book')}
          </button>
          
          <button 
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-xs border border-stone-200 text-stone-500 hover:bg-stone-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            {t('share_adventure')}
          </button>
        </div>
      </div>

      {showShareMenu && (
        <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out]">
          <button onClick={() => setShowShareMenu(false)} className="absolute top-4 right-4 p-2 bg-stone-100 rounded-full text-stone-400">✕</button>
          <h4 className="text-xl font-bold text-stone-800 font-serif mb-6">{t('share_via')}</h4>
          <div className="grid grid-cols-2 gap-4 w-full">
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(shareText + shareUrl)}`} 
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors"
            >
              <span className="text-2xl">💬</span>
              <span className="text-[10px] font-bold text-emerald-800 uppercase">WhatsApp</span>
            </a>
            <a 
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} 
              target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl">✈️</span>
              <span className="text-[10px] font-bold text-blue-800 uppercase">Telegram</span>
            </a>
            <button 
              onClick={copyToClipboard}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${copied ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-stone-900 border-stone-800 text-white hover:bg-black'}`}
            >
              <span className="text-2xl">{copied ? '✅' : '🔗'}</span>
              <span className="text-[10px] font-bold uppercase">{copied ? t('link_copied') : t('copy_link')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default TourCard;
