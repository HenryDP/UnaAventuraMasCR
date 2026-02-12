
import React, { useState, useRef, useEffect } from 'react';
import { processImage } from '../scr/services/imageUtils';

interface FooterCarouselEditorProps {
  images: string[];
  onSave: (images: string[]) => void;
  onClose: () => void;
}

const FooterCarouselEditor: React.FC<FooterCarouselEditorProps> = ({ images, onSave, onClose }) => {
  const [currentImages, setCurrentImages] = useState<string[]>(images);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) return;
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    const newProcessedImages: string[] = [];
    try {
        for (let i = 0; i < files.length; i++) {
            const compressed = await processImage(files[i], 400, 0.8, 'image/png');
            newProcessedImages.push(compressed);
        }
        setCurrentImages([...currentImages, ...newProcessedImages]);
    } catch (err) { console.error(err); } 
    finally { setIsProcessing(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleRemove = (index: number) => {
    setCurrentImages(currentImages.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"></div>

      <div 
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] pointer-events-auto overflow-hidden border border-white/20"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div 
            onMouseDown={handleMouseDown}
            className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 cursor-grab active:cursor-grabbing select-none"
        >
          <div>
            <h2 className="text-xl font-bold text-stone-800 font-serif">Logos de Confianza</h2>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Aliados y Certificaciones</p>
          </div>
          <button onClick={onClose} className="bg-white p-2 text-stone-400 hover:text-stone-600 rounded-full border border-stone-200 transition-colors shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="bg-indigo-50 p-6 rounded-[2rem] border-2 border-dashed border-indigo-200 hover:bg-indigo-100 transition-all cursor-pointer flex flex-col items-center justify-center group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm mb-2 group-hover:scale-110 transition-transform">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-900">Subir Logo PNG</span>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
              {isProcessing && <p className="text-[9px] text-indigo-500 mt-1 animate-pulse">Procesando...</p>}
            </div>

            <div className="bg-stone-50 p-6 rounded-[2rem] border border-stone-200 flex flex-col justify-center">
              <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">Añadir URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button onClick={() => {if(newImageUrl) {setCurrentImages([...currentImages, newImageUrl]); setNewImageUrl('')}}} className="bg-indigo-600 text-white px-3 rounded-lg font-bold text-xs">+</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {currentImages.map((img, idx) => (
              <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-stone-100 bg-white p-4 shadow-sm hover:shadow-lg transition-all">
                <img src={img} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all" alt={`Logo ${idx}`} />
                <button 
                  onClick={() => handleRemove(idx)}
                  className="absolute inset-0 bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end">
           <button onClick={() => onSave(currentImages)} className="bg-indigo-600 text-white py-3 px-8 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs active:scale-95">Guardar Logos</button>
        </div>
      </div>
    </div>
  );
};

export default FooterCarouselEditor;
