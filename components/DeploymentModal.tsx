
import React, { useState, useEffect, useRef } from 'react';
import { downloadProjectAsZip } from '../src/services/exportService';

interface DeploymentModalProps {
  onClose: () => void;
  brandName: string;
}

const DeploymentModal: React.FC<DeploymentModalProps> = ({ onClose, brandName }) => {
  const [step, setStep] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const steps = [
    "Iniciando protocolo de sincronización...",
    "Compilando Motor de Imágenes (Compression V2)...",
    "Generando Manifest PWA para Android/iOS...",
    "Optimizando base de datos de tours...",
    "Preparando paquete de despliegue...",
    "¡Listo para subir a la nube!"
  ];

  useEffect(() => {
    if (step < steps.length - 1) {
      const timer = setTimeout(() => setStep(s => s + 1), 800);
      return () => clearTimeout(timer);
    } else {
      setIsDone(true);
    }
  }, [step]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
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

  const handleDownload = async () => {
      await downloadProjectAsZip();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-xl"></div>
      
      <div 
        className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto border border-white/10"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div 
            onMouseDown={handleMouseDown}
            className="p-10 text-center space-y-8 cursor-grab active:cursor-grabbing select-none"
        >
          
          <div className="relative w-24 h-24 mx-auto pointer-events-none">
             {!isDone ? (
               <div className="w-full h-full border-[8px] border-stone-100 border-t-emerald-500 rounded-full animate-spin"></div>
             ) : (
               <div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center animate-[bounce_1s_infinite]">
                 <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                 </svg>
               </div>
             )}
          </div>

          <div className="space-y-4 pointer-events-none">
             <h3 className="text-3xl font-bold text-stone-900 font-serif">
               {isDone ? "Paquete Listo" : "Procesando..."}
             </h3>
             <p className="text-stone-400 text-sm font-bold uppercase tracking-widest min-h-[1.5em] transition-all duration-500">
               {steps[step]}
             </p>
          </div>

          {isDone ? (
            <div className="space-y-6 animate-[fadeInUp_0.6s_ease-out]">
               <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-left">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-2 tracking-widest">Instrucciones de Publicación</p>
                  <ol className="text-xs text-stone-600 space-y-2 list-decimal list-inside font-medium">
                      <li>Descarga el paquete haciendo clic abajo.</li>
                      <li>Descomprime el archivo ZIP en tu computadora.</li>
                      <li>Arrastra la carpeta a <strong>Netlify Drop</strong> o súbela a <strong>Vercel</strong>.</li>
                      <li>¡Tu web app PWA estará online gratis!</li>
                  </ol>
               </div>
               
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleDownload}
                    className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Descargar Paquete de Producción
                  </button>

                  <button 
                    onClick={onClose}
                    className="w-full text-stone-400 py-3 font-bold text-[10px] uppercase tracking-widest hover:text-stone-600"
                  >
                    Cerrar y Seguir Editando
                  </button>
               </div>
            </div>
          ) : (
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden pointer-events-none">
               <div 
                 className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                 style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
               ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeploymentModal;
