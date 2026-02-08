
import React, { useState, useEffect, useRef } from 'react';
import { GeneralConfig } from '../types';
import { processImage } from '../services/imageUtils';

interface GeneralConfigModalProps {
  config: GeneralConfig;
  onSave: (config: GeneralConfig) => void;
  onClose: () => void;
}

const GeneralConfigModal: React.FC<GeneralConfigModalProps> = ({ config, onSave, onClose }) => {
  const [formData, setFormData] = useState<GeneralConfig>(config);
  const [isProcessing, setIsProcessing] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea, label')) return;
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const processed = await processImage(file, 500, 0.9, 'image/png');
        setFormData(prev => ({ ...prev, logoUrl: processed }));
      } catch (err) {
        console.error("Error optimizando logo", err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"></div>
      
      <div 
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] pointer-events-auto overflow-hidden border border-white/40"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div 
            onMouseDown={handleMouseDown}
            className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50 cursor-grab active:cursor-grabbing select-none"
        >
          <div>
            <h2 className="text-2xl font-bold font-serif text-stone-800">Marca e Identidad</h2>
            <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mt-1">Personalización Visual</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar bg-white">
          <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 flex items-center gap-6">
               <div className="w-20 h-20 bg-white rounded-2xl border border-stone-200 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                  {isProcessing ? (
                     <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin"></div>
                  ) : formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-3xl">📸</span>
                  )}
               </div>
               <div className="flex-1">
                 <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Logo Principal</label>
                 <div className="flex gap-3">
                     <label className="bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide cursor-pointer hover:bg-black transition-colors shadow-lg">
                        Subir
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isProcessing} />
                     </label>
                     {formData.logoUrl && (
                        <button 
                        onClick={() => setFormData({...formData, logoUrl: ''})}
                        className="text-xs text-red-500 font-bold px-3 py-2 hover:bg-red-50 rounded-xl transition-colors"
                        >
                        Eliminar
                        </button>
                     )}
                 </div>
               </div>
          </div>

          <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase mb-2 tracking-widest">Nombre Comercial</label>
                <input 
                  type="text" 
                  value={formData.brandName} 
                  onChange={e => setFormData({...formData, brandName: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-base font-bold text-stone-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase mb-2 tracking-widest">Título Hero (H1)</label>
                <input 
                  value={formData.heroTitle || ''} 
                  onChange={e => setFormData({...formData, heroTitle: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xl font-serif font-bold text-stone-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase mb-2 tracking-widest">Subtítulo Hero</label>
                <textarea 
                  rows={2}
                  value={formData.heroSubtitle || ''} 
                  onChange={e => setFormData({...formData, heroSubtitle: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-stone-600 resize-none bg-stone-50"
                />
              </div>
          </div>
        </div>

        <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end">
           <button 
             onClick={() => onSave(formData)}
             className="bg-emerald-600 text-white py-3 px-8 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-transform active:scale-95 uppercase tracking-widest text-xs"
           >
             Guardar Cambios
           </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralConfigModal;
