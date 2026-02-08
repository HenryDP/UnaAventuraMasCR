
import React, { useState, useRef, useEffect } from 'react';
import { Tour, TourCategory, Province, Difficulty, DurationCategory } from '../types';
import { generateTourDescription } from '../services/geminiService';
import { processImage } from '../services/imageUtils';

interface AdminPanelProps {
  tour?: Tour;
  onSave: (tour: Tour) => void;
  onCancel: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ tour, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [aiKeywords, setAiKeywords] = useState('');
  const [error, setError] = useState('');
  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  
  // Estados para inputs de listas
  const [newPickup, setNewPickup] = useState('');
  const [newIncluded, setNewIncluded] = useState('');
  const [newRecommendation, setNewRecommendation] = useState('');

  // Estado para la posición de la ventana arrastrable
  const [position, setPosition] = useState({ x: 0, y: 0 }); 
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  
  const mainImageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Tour>>(tour || {
    title: '',
    slug: '',
    titles: { es: '', en: '', de: '', fr: '' },
    description: '',
    descriptions: { es: '', en: '', de: '', fr: '' },
    priceNational: 0,
    priceForeigner: 0,
    category: TourCategory.NATURE,
    province: Province.SAN_JOSE,
    location: '',
    imageUrl: '',
    gallery: [],
    difficulty: Difficulty.BEGINNER,
    durationCategory: DurationCategory.HALF_DAY,
    durationText: '',
    minGroupSize: 1,
    tourDate: '',
    pickupTime: '',
    returnTime: '',
    hikingDistance: '',
    included: [],
    recommendations: [],
    pickupLocations: []
  });

  useEffect(() => {
    // Posición inicial centrada
    if (window.innerWidth > 768) {
        setPosition({ x: window.innerWidth / 2 - 450, y: 50 }); 
    } else {
        setPosition({ x: 0, y: 0 }); 
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // No arrastrar si se hace clic en elementos de formulario
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
    
    setIsDraggingWindow(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingWindow) {
        setPosition({
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y
        });
      }
    };

    const handleMouseUp = () => setIsDraggingWindow(false);

    if (isDraggingWindow) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingWindow]);

  const handleGenerateAI = async () => {
    if (!formData.title) return alert("Pon un título primero");
    setLoading(true);
    try {
      const result = await generateTourDescription(formData.title, aiKeywords);
      setFormData({
        ...formData,
        description: result.es,
        descriptions: result,
        slug: result.slug || formData.slug,
        titles: { es: formData.title, en: formData.title, de: formData.title, fr: formData.title }
      });
    } catch (e) {
      alert("Error con IA");
    } finally {
      setLoading(false);
    }
  };

  const processAndSetMainImage = async (e: React.ChangeEvent<HTMLInputElement> | File) => {
    setError('');
    let file: File | undefined;
    if (e instanceof File) { file = e; } else { file = (e as React.ChangeEvent<HTMLInputElement>).target.files?.[0]; }
    if (!file) return;
    setIsProcessingImg(true);
    try {
      const compressed = await processImage(file, 1200, 0.8, 'image/jpeg');
      setFormData(prev => ({ ...prev, imageUrl: compressed }));
    } catch (err: any) {
      setError(err.message || 'Error al procesar la imagen.');
    } finally {
      setIsProcessingImg(false);
      if (mainImageInputRef.current) mainImageInputRef.current.value = '';
    }
  };

  // Generic list handler
  const addItemToList = (field: 'pickupLocations' | 'included' | 'recommendations', value: string, setter: (s: string) => void) => {
    if (!value.trim()) return;
    setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
    }));
    setter('');
  };

  const removeItemFromList = (field: 'pickupLocations' | 'included' | 'recommendations', idx: number) => {
    setFormData(prev => ({
        ...prev,
        [field]: prev[field]?.filter((_, i) => i !== idx)
    }));
  };

  const validateAndSave = () => {
    setError('');
    if (!formData.title?.trim()) return setError('El título es obligatorio.');
    if (!formData.imageUrl?.trim()) return setError('La imagen principal es obligatoria.');
    onSave(formData as Tour);
  };

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none flex items-start justify-start sm:p-6 overflow-hidden">
      <div 
        className="bg-white w-full max-w-5xl max-h-[100vh] sm:max-h-[90vh] rounded-none sm:rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col pointer-events-auto border-0 sm:border border-stone-200"
        style={{ 
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDraggingWindow ? 'none' : 'transform 0.1s ease-out',
            position: 'absolute' 
        }}
      >
        <div 
            onMouseDown={handleMouseDown}
            className="p-4 md:p-6 flex justify-between items-center bg-stone-50 border-b border-stone-100 cursor-grab active:cursor-grabbing select-none"
        >
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-stone-800 font-serif">Editor de Experiencias</h2>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-1">Gestión de Contenido</p>
          </div>
          <button onClick={onCancel} className="text-stone-400 hover:text-red-500 p-2 bg-white rounded-full shadow-sm border border-stone-200 active:scale-95 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white">
            {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold text-center text-xs">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* COLUMNA IZQUIERDA: Info General y Precios */}
                <div className="space-y-6">
                    <section>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Nombre del Tour</label>
                        <input 
                            type="text" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full p-4 rounded-2xl border border-stone-100 bg-stone-50 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Ej: Caminata al Volcán Arenal..."
                        />
                    </section>
                    
                    <section className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100">
                        <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">Link Corto (Slug)</label>
                        <input 
                            type="text" 
                            value={formData.slug} 
                            onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                            className="w-full bg-white p-2 rounded-xl border border-emerald-200 text-xs font-mono text-emerald-900 outline-none"
                            placeholder="ej: arenal-extreme"
                        />
                    </section>

                    <section>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Portada Principal</label>
                        <div 
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingMain(true); }}
                            onDragLeave={() => setIsDraggingMain(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDraggingMain(false); const file = e.dataTransfer.files[0]; if (file) processAndSetMainImage(file); }}
                            className={`relative aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-stone-50 ${isDraggingMain ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200'}`}
                        >
                            {isProcessingImg ? (
                                <div className="flex flex-col items-center p-4 text-center z-10">
                                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-2"></div>
                                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Optimizando...</span>
                                </div>
                            ) : formData.imageUrl ? (
                                <div className="absolute inset-0 group">
                                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Main" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <button onClick={() => setFormData({...formData, imageUrl: ''})} className="bg-red-500 text-white p-3 rounded-full">🗑️</button>
                                    </div>
                                </div>
                            ) : (
                                <label className="cursor-pointer text-center p-10 w-full h-full flex flex-col items-center justify-center">
                                    <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Sube o arrastra la foto</p>
                                    <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={(e) => processAndSetMainImage(e)} />
                                </label>
                            )}
                        </div>
                    </section>

                    <div className="grid grid-cols-2 gap-4">
                        <section>
                            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Precio Nacional ($)</label>
                            <input type="number" value={formData.priceNational} onChange={e => setFormData({...formData, priceNational: Number(e.target.value)})} className="w-full p-4 rounded-xl border border-stone-100 bg-stone-50 font-bold" />
                        </section>
                        <section>
                            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Precio Extranjero ($)</label>
                            <input type="number" value={formData.priceForeigner} onChange={e => setFormData({...formData, priceForeigner: Number(e.target.value)})} className="w-full p-4 rounded-xl border border-stone-100 bg-stone-50 font-bold" />
                        </section>
                    </div>

                    <section className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                        <h4 className="text-sm font-bold text-stone-800 mb-4 border-b border-stone-200 pb-2">Logística y Recogida</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                             <div>
                                <label className="block text-[10px] font-black text-stone-400 uppercase mb-1">Hora Salida</label>
                                <input type="time" value={formData.pickupTime} onChange={e => setFormData({...formData, pickupTime: e.target.value})} className="w-full p-2 rounded-lg border border-stone-200 bg-white" />
                             </div>
                             <div>
                                <label className="block text-[10px] font-black text-stone-400 uppercase mb-1">Hora Regreso</label>
                                <input type="time" value={formData.returnTime} onChange={e => setFormData({...formData, returnTime: e.target.value})} className="w-full p-2 rounded-lg border border-stone-200 bg-white" />
                             </div>
                        </div>
                        <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Puntos de Recogida</label>
                        <div className="flex gap-2 mb-2">
                            <input 
                                type="text" 
                                value={newPickup}
                                onChange={(e) => setNewPickup(e.target.value)}
                                placeholder="Lugar (ej: Parque Central)..."
                                className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-stone-300 outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && addItemToList('pickupLocations', newPickup, setNewPickup)}
                            />
                            <button onClick={() => addItemToList('pickupLocations', newPickup, setNewPickup)} className="bg-stone-800 text-white px-3 rounded-lg font-bold">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.pickupLocations?.map((loc, idx) => (
                                <div key={idx} className="bg-white px-3 py-1 rounded-lg border border-stone-200 text-xs font-bold flex items-center gap-2 text-stone-600">
                                    {loc}
                                    <button onClick={() => removeItemFromList('pickupLocations', idx)} className="text-red-400 hover:text-red-600">×</button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* COLUMNA DERECHA: Ficha Técnica y Detalles */}
                <div className="space-y-6">
                    <section className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100">
                        <h4 className="text-sm font-bold text-emerald-800 mb-4 border-b border-emerald-200 pb-2 uppercase tracking-wide">Ficha Técnica del Tour</h4>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-[10px] font-black text-emerald-600 uppercase mb-1">Fecha del Tour</label>
                                <input type="date" value={formData.tourDate} onChange={e => setFormData({...formData, tourDate: e.target.value})} className="w-full p-2 rounded-xl border border-emerald-200 bg-white font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-emerald-600 uppercase mb-1">Mínimo Grupo</label>
                                <input type="number" min="1" value={formData.minGroupSize} onChange={e => setFormData({...formData, minGroupSize: Number(e.target.value)})} className="w-full p-2 rounded-xl border border-emerald-200 bg-white font-bold text-sm" />
                            </div>
                        </div>

                        <div className="mb-4">
                             <label className="block text-[10px] font-black text-emerald-600 uppercase mb-1">Nivel de Dificultad</label>
                             <select 
                                value={formData.difficulty} 
                                onChange={e => setFormData({...formData, difficulty: e.target.value as Difficulty})}
                                className="w-full p-3 rounded-xl border border-emerald-200 bg-white font-bold text-sm outline-none"
                             >
                                 {Object.values(Difficulty).map(d => (
                                     <option key={d} value={d}>{d}</option>
                                 ))}
                             </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-emerald-600 uppercase mb-1">Distancia Hiking (Km/Mi)</label>
                            <input type="text" value={formData.hikingDistance} onChange={e => setFormData({...formData, hikingDistance: e.target.value})} placeholder="Ej: 5km total" className="w-full p-2 rounded-xl border border-emerald-200 bg-white font-bold text-sm" />
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-2">
                             <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Descripción</label>
                             <button onClick={handleGenerateAI} disabled={loading} className="text-[9px] font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors">
                                {loading ? '...' : '✨ Generar con IA'}
                             </button>
                        </div>
                        {loading && <input type="text" placeholder="Keywords para IA..." value={aiKeywords} onChange={e => setAiKeywords(e.target.value)} className="w-full mb-2 p-2 border border-purple-200 rounded text-xs"/>}
                        <textarea 
                            rows={4}
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full p-4 rounded-2xl border border-stone-100 bg-stone-50 text-sm outline-none resize-none leading-relaxed"
                            placeholder="Describe la experiencia..."
                        />
                    </section>

                    {/* Listas: Qué incluye y Recomendaciones */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <section className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                             <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">¿Qué incluye?</label>
                             <div className="flex gap-2 mb-2">
                                <input type="text" value={newIncluded} onChange={e => setNewIncluded(e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg border border-stone-200 text-xs" placeholder="Ej: Transporte..." onKeyDown={e => e.key === 'Enter' && addItemToList('included', newIncluded, setNewIncluded)}/>
                                <button onClick={() => addItemToList('included', newIncluded, setNewIncluded)} className="bg-stone-300 px-2 rounded-lg font-bold text-stone-600">+</button>
                             </div>
                             <ul className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                {formData.included?.map((item, i) => (
                                    <li key={i} className="flex justify-between items-center text-xs bg-white px-2 py-1 rounded border border-stone-100">
                                        <span className="truncate">{item}</span>
                                        <button onClick={() => removeItemFromList('included', i)} className="text-red-400 font-bold ml-2">×</button>
                                    </li>
                                ))}
                             </ul>
                        </section>

                        <section className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                             <label className="block text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Recomendaciones</label>
                             <div className="flex gap-2 mb-2">
                                <input type="text" value={newRecommendation} onChange={e => setNewRecommendation(e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg border border-orange-200 text-xs" placeholder="Ej: Bloqueador..." onKeyDown={e => e.key === 'Enter' && addItemToList('recommendations', newRecommendation, setNewRecommendation)}/>
                                <button onClick={() => addItemToList('recommendations', newRecommendation, setNewRecommendation)} className="bg-orange-200 px-2 rounded-lg font-bold text-orange-600">+</button>
                             </div>
                             <ul className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                {formData.recommendations?.map((item, i) => (
                                    <li key={i} className="flex justify-between items-center text-xs bg-white px-2 py-1 rounded border border-orange-100">
                                        <span className="truncate">{item}</span>
                                        <button onClick={() => removeItemFromList('recommendations', i)} className="text-red-400 font-bold ml-2">×</button>
                                    </li>
                                ))}
                             </ul>
                        </section>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button onClick={onCancel} className="flex-1 py-4 font-bold text-stone-500 uppercase tracking-widest text-[10px] hover:bg-stone-100 rounded-xl transition-colors">Cancelar</button>
                        <button onClick={validateAndSave} className="flex-[2] bg-emerald-600 text-white py-4 rounded-xl font-black shadow-xl uppercase tracking-widest text-[10px] active:scale-95 transition-all">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
