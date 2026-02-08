
import React, { useState, useEffect, useRef } from 'react';
import { PaymentConfig, LinkedAccount } from '../types';

interface PaymentConfigModalProps {
  config: PaymentConfig;
  onSave: (config: PaymentConfig) => void;
  onClose: () => void;
}

const PaymentConfigModal: React.FC<PaymentConfigModalProps> = ({ config, onSave, onClose }) => {
  const [formData, setFormData] = useState<PaymentConfig>({
    ...config,
    linkedAccounts: config.linkedAccounts || [],
    enableOnlinePayment: config.enableOnlinePayment || false,
    touchPayLink: config.touchPayLink || ''
  });
  
  const [isLinking, setIsLinking] = useState(false);
  
  // Drag State
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

  const handleLinkBank = () => {
    setIsLinking(true);
    setTimeout(() => {
        const newAccount: LinkedAccount = {
            id: Date.now().toString(),
            bankName: 'Banco Nacional',
            accountLast4: Math.floor(1000 + Math.random() * 9000).toString(),
            status: 'active',
            currency: 'CRC'
        };
        setFormData(prev => ({ ...prev, linkedAccounts: [...prev.linkedAccounts, newAccount] }));
        setIsLinking(false);
    }, 1500);
  };

  const removeAccount = (id: string) => {
      setFormData(prev => ({ ...prev, linkedAccounts: prev.linkedAccounts.filter(acc => acc.id !== id) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"></div>

      <div 
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] flex flex-col max-h-[90vh] pointer-events-auto border border-white/40 overflow-hidden"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div 
            onMouseDown={handleMouseDown}
            className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 cursor-grab active:cursor-grabbing select-none"
        >
          <div>
            <h2 className="text-xl font-bold text-stone-800 font-serif">Gestión Financiera</h2>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">Pasarelas y Cuentas</p>
          </div>
          <button onClick={onClose} className="bg-white p-2 rounded-full text-stone-400 hover:text-stone-600 border border-stone-200 shadow-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white custom-scrollbar">
          <section>
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center text-xs">🏦</span>
                    Cuentas Vinculadas
                </h3>
                <button 
                    onClick={handleLinkBank}
                    disabled={isLinking}
                    className="text-[10px] bg-stone-900 text-white px-3 py-2 rounded-lg hover:bg-black transition-colors disabled:opacity-50 font-bold uppercase tracking-wide"
                >
                    {isLinking ? 'Conectando...' : '+ Vincular'}
                </button>
             </div>
             
             {formData.linkedAccounts.length > 0 ? (
                 <div className="space-y-3">
                     {formData.linkedAccounts.map(acc => (
                         <div key={acc.id} className="border border-stone-200 rounded-2xl p-4 flex justify-between items-center bg-stone-50">
                             <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${acc.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                <div>
                                    <p className="font-bold text-sm text-stone-800">{acc.bankName}</p>
                                    <p className="text-[10px] text-stone-500 font-mono">**** {acc.accountLast4} • {acc.currency}</p>
                                </div>
                             </div>
                             <button onClick={() => removeAccount(acc.id)} className="text-red-400 hover:text-red-600 bg-white p-1.5 rounded-lg border border-stone-100 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                         </div>
                     ))}
                 </div>
             ) : (
                 <div className="text-center p-6 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                     <p className="text-stone-400 text-xs">No hay cuentas bancarias.</p>
                 </div>
             )}
          </section>

          <div className="border-t border-stone-100"></div>

          <section>
            <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-md flex items-center justify-center text-xs">💳</span>
                Pagos Online
            </h3>
            
            <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer p-4 border border-stone-200 rounded-2xl hover:bg-stone-50 transition-colors bg-white">
                    <div>
                        <span className="block font-bold text-stone-800 text-sm">Habilitar Tarjeta</span>
                        <span className="block text-[10px] text-stone-500 mt-0.5">Mostrar opción en checkout.</span>
                    </div>
                    <div className="relative inline-block w-10 h-6 align-middle select-none">
                        <input 
                            type="checkbox" 
                            checked={formData.enableOnlinePayment}
                            onChange={e => setFormData({...formData, enableOnlinePayment: e.target.checked})}
                            className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer border-stone-300 checked:right-0 checked:border-emerald-500 checked:bg-emerald-500 transition-all right-5 top-0.5"
                        />
                        <div className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${formData.enableOnlinePayment ? 'bg-emerald-200' : 'bg-stone-200'}`}></div>
                    </div>
                </label>

                {formData.enableOnlinePayment && (
                   <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 animate-pulse-once">
                      <label className="block text-[10px] font-black text-purple-600 uppercase mb-2 tracking-widest">Enlace de Pago (Touch/Wompi)</label>
                      <input 
                        type="text" 
                        value={formData.touchPayLink}
                        onChange={e => setFormData({...formData, touchPayLink: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-purple-200 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white font-mono text-purple-900"
                        placeholder="https://..."
                      />
                   </div>
                )}
            </div>
          </section>

          <div className="border-t border-stone-100"></div>

          <section>
            <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-md flex items-center justify-center text-xs">📱</span>
                Información Manual & Contacto
            </h3>
            <div className="space-y-3">
              <div>
                  <label className="block text-[9px] font-bold text-stone-400 uppercase mb-1 ml-1">WhatsApp Ventas (Botón Flotante)</label>
                  <input type="text" placeholder="Ej: 87751442" value={formData.whatsappNumber || ''} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:border-emerald-500 outline-none bg-emerald-50/50" />
              </div>
              <input type="text" placeholder="# SINPE Móvil" value={formData.sinpeMovil} onChange={e => setFormData({...formData, sinpeMovil: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:border-emerald-500 outline-none" />
              <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="IBAN Colones" value={formData.ibanColones} onChange={e => setFormData({...formData, ibanColones: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs font-mono focus:border-emerald-500 outline-none" />
                  <input type="text" placeholder="IBAN Dólares" value={formData.ibanDollars} onChange={e => setFormData({...formData, ibanDollars: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs font-mono focus:border-emerald-500 outline-none" />
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end">
          <button onClick={() => onSave(formData)} className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-widest text-xs active:scale-95">
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfigModal;
