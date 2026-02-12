
import React, { useState, useRef, useEffect } from 'react';
import { processImage } from '../src/services/imageUtils';

interface HeroCarouselEditorProps {
  images: string[];
  onSave: (images: string[]) => void;
  onClose: () => void;
}

const HeroCarouselEditor: React.FC<HeroCarouselEditorProps> = ({ images, onSave, onClose }) => {
  const [currentImages, setCurrentImages] = useState<string[]>(images);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, .clickable-zone')) return;
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

  const handleAddUrl = () => {
    if (!newImageUrl.trim()) return;
    if (currentImages.length >= 10) return alert("Límite de 10 imágenes.");
    setCurrentImages([...currentImages, newImageUrl]);
    setNewImageUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (currentImages.length + files.length > 10) return alert("Límite excedido.");

    setIsProcessing(true);
    const newProcessedImages: string[] = [];

    try {
        for (let i = 0; i < files.length; i++) {
          const compressed = await processImage(files[i], 1920, 0.85, 'image/jpeg');
          newProcessedImages.push(compressed);
        }
        setCurrentImages([...currentImages, ...newProcessedImages]);
    } catch (err) {
        console.error(err);
    } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    setCurrentImages(currentImages.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"></div>

      <div 
        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] pointer-events-auto overflow-hidden border border-white/20"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div 
            onMouseDown={handleMouseDown}
            className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50 cursor-grab active:cursor-grabbing select-none"
        >
          <div>
            <h2 className="text-2xl font-bold text-stone-800 font-serif">Carrusel de Portada</h2>
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1">Imágenes High-Res ({currentImages.length}/10)</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white border border-stone-200 hover:bg-stone-100 rounded-full transition-colors text-stone-400 shadow-sm">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white custom-scrollbar">
          {/* Zona de Carga */}
          <div className="flex flex-col md:flex-row gap-6 clickable-zone">
            <div 
                className="flex-1 bg-emerald-50 p-8 rounded-[2rem] border-2 border-dashed border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400 transition-all cursor-pointer flex flex-col items-center justify-center group relative"
                onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Subir Imágenes</p>
              <p className="text-[10px] text-emerald-600/70 mt-1">Multi-selección permitida</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
              {isProcessing && (
                <div className="absolute inset-0 bg-white/80 rounded-[2rem] flex items-center justify-center z-10">
                    <div className="w-8 h-8 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
                </div>
              )}
            </div>

            <div className="flex-1 bg-stone-50 p-8 rounded-[2rem] border border-stone-200 flex flex-col justify-center">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Añadir vía URL</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newImageUrl} 
                        onChange={e => setNewImageUrl(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-400 outline-none text-sm"
                        placeholder="https://..."
                    />
                    <button onClick={handleAddUrl} className="bg-stone-800 text-white px-6 rounded-xl font-bold text-sm hover:bg-black transition-colors">Go</button>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 clickable-zone">
            {currentImages.map((img, idx) => (
              <div key={idx} className="group relative aspect-video rounded-3xl overflow-hidden shadow-md bg-stone-100 border border-stone-200">
                <img src={img} className="w-full h-full object-cover" alt={`Slide ${idx}`} />
                <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                   <button 
                    onClick={() => handleRemove(idx)}
                    className="w-12 h-12 bg-white text-red-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                   >
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-white border border-white/10">
                   #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 border-t border-stone-100 flex gap-4 bg-stone-50 justify-end">
           <button onClick={onClose} className="px-8 py-4 font-bold text-stone-500 hover:text-stone-800 uppercase tracking-widest text-[11px] transition-colors">Cancelar</button>
           <button 
            onClick={() => onSave(currentImages)} 
            className="px-10 bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 uppercase tracking-widest text-[11px]"
           >
             Guardar Galería
           </button>
        </div>
      </div>
    </div>
  );
};

export default HeroCarouselEditor;
