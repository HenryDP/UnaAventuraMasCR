
import React, { useState } from 'react';
import { Review } from '../types';

interface ReviewModalProps {
  onSubmit: (review: Omit<Review, 'id' | 'date'>) => void;
  onClose: () => void;
  initialName?: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ onSubmit, onClose, initialName }) => {
  const [userName, setUserName] = useState(initialName || '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) return;
    onSubmit({
      userName,
      rating,
      comment,
      location: location || 'Viajero Internacional'
    });
  };

  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-[zoomIn_0.3s_ease-out]">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
           <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 bg-white/10 rounded-full backdrop-blur-md">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
           <h3 className="text-2xl font-bold font-serif mb-2 relative z-10">¡Tu opinión importa!</h3>
           <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest relative z-10">Ayúdanos a mejorar la experiencia</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="flex flex-col items-center gap-2 mb-4">
               <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Califica tu experiencia</span>
               <div className="flex gap-2">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button
                     key={star}
                     type="button"
                     onClick={() => setRating(star)}
                     className={`w-10 h-10 text-2xl transition-transform hover:scale-110 focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-stone-200'}`}
                   >
                     ★
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-4">
               <div>
                   <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Tu Nombre</label>
                   <input 
                     type="text" 
                     value={userName} 
                     onChange={e => setUserName(e.target.value)}
                     className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold bg-stone-50"
                     placeholder="Ej: Ana García"
                     required
                   />
               </div>
               
               <div>
                   <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">¿De dónde nos visitas?</label>
                   <input 
                     type="text" 
                     value={location} 
                     onChange={e => setLocation(e.target.value)}
                     className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-stone-50"
                     placeholder="Ej: Madrid, España"
                   />
               </div>

               <div>
                   <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Tu Comentario</label>
                   <textarea 
                     value={comment} 
                     onChange={e => setComment(e.target.value)}
                     className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none h-24 bg-stone-50"
                     placeholder="¿Qué fue lo que más te gustó?"
                     required
                   />
               </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 uppercase tracking-widest text-[11px]"
            >
              Publicar Reseña
            </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;