
import React, { useState, useEffect, useRef } from 'react';
import { AboutData } from '../scr/types';
import { processImage } from '../scr/services/imageUtils';

interface AboutEditModalProps {
  data: AboutData;
  onSave: (data: AboutData) => void;
  onClose: () => void;
}

const AboutEditModal: React.FC<AboutEditModalProps> = ({ data, onSave, onClose }) => {
  const [formData, setFormData] = useState<AboutData>(data);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Dragging State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, label')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const processed = await processImage(file, 1000, 0.8, 'image/jpeg');
        setFormData(prev => ({ ...prev, imageUrl: processed }));
      } catch (err) {
        console.error("Error optimizando imagen", err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop visual solamente */}
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"></div>

      <div 
        className="bg-white w-full max-w-2xl rounded-[2rem] shadow-[0_50px_100px_-12px_rgba(0,0,0,0.25)] flex flex-col max-h-[85vh] pointer-events-auto border border-white/20 overflow-hidden"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div 
            onMouseDown={handleMouseDown}
            className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 cursor-grab active:cursor-grabbing select-none"
        >
          <div>
            <h2 className="text-xl font-bold text-stone-800 font-serif">Editar Historia</h2>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Sobre Nosotros</p>
          </div>
          <button onClick={onClose} className="bg-white text-stone-400 hover:text-red-500 p-2 rounded-full border border-stone-200 shadow-sm transition-colors active:scale-90">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar bg-white">
            <div className="flex gap-6 items-start">
                <div className="relative group shrink-0">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-md border border-stone-100 bg-stone-100">
                        <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity rounded-2xl">
                        <span className="text-white text-xs font-bold uppercase tracking-wider">Cambiar</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    {isProcessing && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-6 h-6 border-2 border-emerald-500 rounded-full animate-spin border-t-transparent"></div></div>}
                </div>
                
                <div className="flex-1 space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Título Principal</label>
                        <input 
                            type="text" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-stone-800"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Años Exp.</label>
                            <input type="text" value={formData.stats.years} onChange={e => setFormData({...formData, stats: {...formData.stats, years: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm font-bold" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Clientes</label>
                            <input type="text" value={formData.stats.customers} onChange={e => setFormData({...formData, stats: {...formData.stats, customers: e.target.value}})} className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm font-bold" />
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Descripción Detallada</label>
                <textarea 
                    rows={6}
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm leading-relaxed text-stone-600 bg-stone-50"
                />
            </div>
        </div>

        <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end">
            <button 
              onClick={() => onSave(formData)} 
              className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 text-xs uppercase tracking-widest"
            >
                Guardar Cambios
            </button>
        </div>
      </div>
    </div>
  );
};

export default AboutEditModal;
