
import React, { useState, useEffect, useRef } from 'react';
import { FooterConfig } from '../scr/types';

interface FooterEditModalProps {
  config: FooterConfig;
  onSave: (config: FooterConfig) => void;
  onClose: () => void;
}

const FooterEditModal: React.FC<FooterEditModalProps> = ({ config, onSave, onClose }) => {
  const [formData, setFormData] = useState<FooterConfig>(config);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea')) return;
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

  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...(formData.addresses || [])];
    newAddresses[index] = value;
    setFormData({ ...formData, addresses: newAddresses });
  };

  const addAddress = () => {
    setFormData({ ...formData, addresses: [...(formData.addresses || []), 'Nueva ubicación'] });
  };

  const removeAddress = (index: number) => {
    const newAddresses = [...(formData.addresses || [])];
    newAddresses.splice(index, 1);
    setFormData({ ...formData, addresses: newAddresses });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"></div>
      
      <div 
        className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] pointer-events-auto overflow-hidden"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div 
            onMouseDown={handleMouseDown}
            className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 cursor-grab active:cursor-grabbing select-none"
        >
          <div>
            <h2 className="text-xl font-bold text-stone-800 font-serif">Configuración de Pie de Página</h2>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Contacto y Redes Sociales</p>
          </div>
          <button onClick={onClose} className="bg-white text-stone-400 hover:text-stone-600 p-2 rounded-full border border-stone-200 shadow-sm transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-8 bg-white custom-scrollbar">
            <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Mensaje del Footer</label>
                <textarea 
                    rows={3}
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-stone-800 uppercase tracking-widest border-b border-stone-100 pb-2">Contacto Directo</h3>
                    <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Email</label>
                        <input type="text" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-bold" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Teléfono</label>
                        <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-bold" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-black text-stone-800 uppercase tracking-widest border-b border-stone-100 pb-2">Redes Sociales</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-400 w-8">IG</span>
                            <input type="text" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono" placeholder="URL Instagram" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-400 w-8">FB</span>
                            <input type="text" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono" placeholder="URL Facebook" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-400 w-8">TT</span>
                            <input type="text" value={formData.tiktok} onChange={e => setFormData({...formData, tiktok: e.target.value})} className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono" placeholder="URL TikTok" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-stone-800 uppercase tracking-widest">Sucursales / Ubicaciones</h3>
                    <button onClick={addAddress} className="text-[10px] font-bold bg-white border border-stone-200 px-3 py-1 rounded-full hover:bg-stone-100">+ Añadir</button>
                </div>
                <div className="space-y-3">
                    {formData.addresses && formData.addresses.map((addr, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input 
                                type="text" 
                                value={addr} 
                                onChange={e => handleAddressChange(idx, e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-sm"
                            />
                            <button onClick={() => removeAddress(idx)} className="text-red-400 hover:text-red-600 px-2">✕</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end">
            <button onClick={() => onSave(formData)} className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 text-xs uppercase tracking-widest">
                Guardar Cambios
            </button>
        </div>
      </div>
    </div>
  );
};

export default FooterEditModal;
