
import React from 'react';
import { Review } from '../src/types';

interface ReviewsSectionProps {
  reviews: Review[];
  onAddReview: () => void;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, onAddReview }) => {
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : '5.0';

  return (
    <section className="py-32 bg-stone-50 border-t border-stone-100 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-100 rounded-full blur-[100px] opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-60"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
           <div>
              <h2 className="text-4xl md:text-5xl font-bold text-stone-800 font-serif mb-4">Historias de Viajeros</h2>
              <p className="text-stone-500 text-lg max-w-xl">Descubre por qué miles de aventureros eligen Costa Rica como su destino favorito.</p>
           </div>
           
           <div className="flex items-center gap-6 bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
              <div className="text-center">
                 <p className="text-3xl font-black text-stone-800 leading-none">{averageRating}</p>
                 <div className="text-yellow-400 text-xs">★★★★★</div>
              </div>
              <div className="w-px h-10 bg-stone-100"></div>
              <button 
                onClick={onAddReview}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95"
              >
                Escribir Reseña
              </button>
           </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-stone-200">
             <p className="text-stone-400 italic">Sé el primero en contar tu historia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {reviews.slice(0, 6).map((review) => (
                <div key={review.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-stone-100 group">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-lg font-black text-stone-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                            {review.userName.charAt(0)}
                         </div>
                         <div>
                            <p className="font-bold text-stone-800 text-sm">{review.userName}</p>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{review.location || 'Viajero'}</p>
                         </div>
                      </div>
                      <div className="flex text-yellow-400 text-sm">
                         {Array.from({ length: 5 }).map((_, i) => (
                           <span key={i} className={i < review.rating ? 'opacity-100' : 'text-stone-200'}>★</span>
                         ))}
                      </div>
                   </div>
                   
                   <p className="text-stone-600 leading-relaxed text-sm mb-6 line-clamp-4 italic">"{review.comment}"</p>
                   
                   <div className="pt-6 border-t border-stone-50 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{review.date}</span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Verificado</span>
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
