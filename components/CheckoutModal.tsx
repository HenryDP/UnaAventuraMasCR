
import React, { useState, useEffect } from 'react';
import { Tour, PaymentConfig, Language, Booking, User } from '../src/types';
import { useTranslation } from '../src/services/translations';
import { db } from '../src/services/db';

interface CheckoutModalProps {
  tour: Tour;
  paymentConfig: PaymentConfig;
  lang: Language;
  onClose: () => void;
  onBookingAction?: () => void; 
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ tour, paymentConfig, lang, onClose }) => {
  const t = useTranslation(lang);
  const [visitorType, setVisitorType] = useState<'national' | 'foreigner'>('national');
  const [quantity, setQuantity] = useState(1);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');

  // Auto-seleccionar el primer punto de recogida si existe
  useEffect(() => {
    if (tour.pickupLocations && tour.pickupLocations.length > 0) {
        setPickupLocation(tour.pickupLocations[0]);
    }
    setQuantity(Math.max(1, tour.minGroupSize || 1));
  }, [tour.pickupLocations, tour.minGroupSize]);

  const basePrice = visitorType === 'national' ? tour.priceNational : tour.priceForeigner;
  const totalPrice = basePrice * quantity;
  const tourTitle = tour.titles?.[lang] || tour.title;
  const tourDesc = tour.descriptions?.[lang] || tour.description;

  const formatTime = (time?: string) => {
      if (!time) return '';
      const [hours, minutes] = time.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
  };

  const saveBookingRecord = async (method: 'whatsapp' | 'card') => {
    // Si el tour no tiene fecha, asumimos hoy para el registro
    const dateToUse = tour.tourDate ? new Date(tour.tourDate).toISOString() : new Date().toISOString();
    
    // Intentar obtener usuario actual de sesión para todos los detalles
    let customerName = "Cliente Web/WhatsApp";
    let customerEmail = "";
    let customerNationality = "";
    let customerPhone = "";

    try {
        const sessionUser = sessionStorage.getItem('cr_currentUser');
        if (sessionUser) {
            const u: User = JSON.parse(sessionUser);
            customerName = u.name;
            customerEmail = u.email;
            customerNationality = u.nationality || "No indicada";
            customerPhone = u.phoneNumber || "No indicado";
        }
    } catch(e) {}

    const newBooking: Booking = {
        id: Date.now().toString(),
        tourId: tour.id,
        tourTitle: tourTitle,
        bookingDate: new Date().toISOString(),
        dateOfTour: dateToUse,
        reviewed: false,
        // Nuevos campos completos para reporte
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerNationality: customerNationality,
        customerType: visitorType,
        quantity: quantity,
        totalPrice: totalPrice,
        paymentMethod: method,
        selectedPickupLocation: pickupLocation || 'No requerido/No especificado'
    };
    await db.bookings.add(newBooking);
  };

  const handleWhatsAppReservation = async () => {
    const whatsappNumber = (paymentConfig.whatsappNumber || '50687751442').replace(/\D/g, '');
    let message = `¡Hola! 👋 Me interesa reservar:\n\n*${tourTitle}*\n📅 Fecha: ${tour.tourDate || 'A convenir'}\n👥 Tipo: ${visitorType === 'national' ? 'Nacional' : 'Extranjero'}\n🔢 Cantidad: ${quantity}\n💰 Total: $${totalPrice}`;
    
    if (pickupLocation) {
        message += `\n📍 Pickup: ${pickupLocation}`;
    }

    // Intentar obtener info del usuario para el mensaje
    try {
        const sessionUser = sessionStorage.getItem('cr_currentUser');
        if (sessionUser) {
            const u = JSON.parse(sessionUser);
            message += `\n\n👤 Mis Datos:\nNombre: ${u.name}\nTel: ${u.phoneNumber}\nNacionalidad: ${u.nationality}`;
        }
    } catch(e) {}

    message += `\n\nPura Vida! 🇨🇷`;
    
    // Guardar registro de reserva
    await saveBookingRecord('whatsapp');

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    onClose();
  };

  const handleCardPayment = async () => {
    // Guardar registro de reserva
    await saveBookingRecord('card');

    if (paymentConfig.touchPayLink) {
      window.open(paymentConfig.touchPayLink, '_blank');
    } else {
      window.open('https://tp.cr/s/MjQ3MDc1', '_blank');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-[zoomIn_0.3s_ease-out]">
        
        {/* Header Image Compacto */}
        <div className="relative h-48 flex-shrink-0">
          <img src={tour.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt={tourTitle} />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-stone-900/10 to-transparent"></div>
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 p-2.5 bg-black/30 hover:bg-black/50 rounded-full text-white backdrop-blur-md transition-all z-10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="absolute bottom-5 left-8 right-8">
             <div className="flex gap-2 mb-2">
                <span className="bg-emerald-500 text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">{tour.category}</span>
                {tour.tourDate && <span className="bg-white/90 backdrop-blur-md text-stone-800 text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">📅 {tour.tourDate}</span>}
             </div>
             <h2 className="text-3xl font-bold text-stone-800 font-serif leading-none drop-shadow-sm">{tourTitle}</h2>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          <div className="space-y-4">
             <p className="text-stone-500 text-sm leading-relaxed font-light">{tourDesc}</p>
             
             {/* Info de Horarios y Logística */}
             {(tour.pickupTime || tour.returnTime) && (
                 <div className="flex gap-3 bg-blue-50 p-4 rounded-3xl border border-blue-100">
                     {tour.pickupTime && (
                         <div className="flex-1 text-center">
                             <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest mb-1">Hora Salida</p>
                             <p className="text-sm font-bold text-blue-900">{formatTime(tour.pickupTime)}</p>
                         </div>
                     )}
                     {tour.returnTime && (
                         <div className="flex-1 text-center border-l border-blue-200">
                             <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest mb-1">Regreso Aprox.</p>
                             <p className="text-sm font-bold text-blue-900">{formatTime(tour.returnTime)}</p>
                         </div>
                     )}
                 </div>
             )}

             {/* Grid de Micro-Detalles Técnicos */}
             <div className="grid grid-cols-2 gap-3 bg-stone-50 p-4 rounded-3xl border border-stone-100">
                <div className="text-center p-2">
                   <p className="text-[7px] font-black text-stone-400 uppercase tracking-widest mb-1">Nivel / Dificultad</p>
                   <p className="text-[10px] font-bold text-emerald-700 leading-tight">{tour.difficulty}</p>
                </div>
                <div className="text-center p-2 border-l border-stone-200">
                   <p className="text-[7px] font-black text-stone-400 uppercase tracking-widest mb-1">Distancia Hiking</p>
                   <p className="text-[10px] font-bold text-stone-800 leading-tight">🥾 {tour.hikingDistance || 'A convenir'}</p>
                </div>
                <div className="text-center p-2 border-t border-stone-200">
                   <p className="text-[7px] font-black text-stone-400 uppercase tracking-widest mb-1">Mínimo Grupo</p>
                   <p className="text-[10px] font-bold text-stone-800 leading-tight">👥 {tour.minGroupSize || 1} Personas</p>
                </div>
                 <div className="text-center p-2 border-t border-l border-stone-200">
                   <p className="text-[7px] font-black text-stone-400 uppercase tracking-widest mb-1">Fecha Programada</p>
                   <p className="text-[10px] font-bold text-stone-800 leading-tight">📅 {tour.tourDate || 'Abierta'}</p>
                </div>
             </div>
          </div>

          {/* Listas de Detalles Adicionales */}
          <div className="grid grid-cols-1 gap-6 pt-4 border-t border-stone-50">
             {tour.included && tour.included.length > 0 && (
               <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Qué incluye el Tour
                  </h4>
                  <ul className="space-y-2 pl-2">
                    {tour.included.map((item, i) => (
                      <li key={i} className="text-[11px] text-stone-600 flex items-start gap-2 border-b border-stone-50 pb-1 last:border-0">
                        <span className="text-emerald-500 font-bold shrink-0">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
               </div>
             )}

             {tour.recommendations && tour.recommendations.length > 0 && (
               <div className="space-y-3 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                  <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Recomendaciones
                  </h4>
                  <ul className="space-y-2 pl-2">
                    {tour.recommendations.map((item, i) => (
                      <li key={i} className="text-[11px] text-stone-700 flex items-start gap-2">
                        <span className="text-orange-400 font-bold shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
               </div>
             )}
          </div>

          <div className="h-px bg-stone-100 w-full"></div>

          {/* Configuración de Reserva y Pago */}
          <div className="space-y-6">
             <div className="flex bg-stone-100 p-1.5 rounded-2xl">
                <button 
                 onClick={() => setVisitorType('national')} 
                 className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${visitorType === 'national' ? 'bg-white text-emerald-700 shadow-md' : 'text-stone-400'}`}
                >
                  🇨🇷 Nacional
                </button>
                <button 
                 onClick={() => setVisitorType('foreigner')} 
                 className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${visitorType === 'foreigner' ? 'bg-white text-emerald-700 shadow-md' : 'text-stone-400'}`}
                >
                  🌎 Extranjero
                </button>
             </div>

             {/* Selector de Punto de Recogida - Solo si hay definidos */}
             {tour.pickupLocations && tour.pickupLocations.length > 0 && (
                 <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                     <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                        Selecciona tu Punto de Recogida
                     </label>
                     <select 
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full p-3 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 bg-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                     >
                        {tour.pickupLocations.map((loc, i) => (
                            <option key={i} value={loc}>{loc}</option>
                        ))}
                     </select>
                     <p className="text-[9px] text-stone-400 mt-2 font-medium italic">
                        * Salida: {formatTime(tour.pickupTime) || 'TBD'}
                     </p>
                 </div>
             )}

             <div className="flex items-center justify-between bg-stone-50 p-6 rounded-[2.5rem] border border-stone-100">
                <div className="flex items-center gap-5 bg-white border border-stone-200 p-1.5 rounded-2xl shadow-sm">
                   <button onClick={() => setQuantity(Math.max(tour.minGroupSize || 1, quantity - 1))} className="w-10 h-10 rounded-xl hover:bg-stone-50 flex items-center justify-center font-bold text-stone-400 text-xl transition-colors">−</button>
                   <span className="text-2xl font-black text-stone-800 w-6 text-center">{quantity}</span>
                   <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-xl hover:bg-stone-50 flex items-center justify-center font-bold text-stone-400 text-xl transition-colors">+</button>
                </div>
                <div className="text-right">
                   <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Inversión Total</p>
                   <p className="text-4xl font-black text-emerald-600 font-serif">${totalPrice} <span className="text-[10px] font-sans text-stone-400 uppercase tracking-normal">USD</span></p>
                </div>
             </div>
          </div>

          {/* Acciones de Pago Finales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
             <button 
              onClick={handleWhatsAppReservation}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-[0.98]"
             >
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
               RESERVAR POR WHATSAPP
             </button>

             <button 
              onClick={handleCardPayment}
              className="w-full bg-stone-900 hover:bg-black text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-stone-900/10 flex items-center justify-center gap-3 active:scale-[0.98]"
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3-3v8a3 3 0 003 3z" /></svg>
               PAGAR CON TARJETA
             </button>
          </div>
          
          <button 
            onClick={() => setShowPaymentInfo(!showPaymentInfo)}
            className="w-full text-[9px] font-black text-stone-400 uppercase tracking-[0.4em] py-4 border-t border-stone-100 hover:text-emerald-600 transition-colors"
          >
            {showPaymentInfo ? 'OCULTAR CUENTAS BANCARIAS' : 'MOSTRAR CUENTAS BANCARIAS'}
          </button>

          {showPaymentInfo && (
            <div className="animate-[fadeInUp_0.3s_ease-out] space-y-4 bg-stone-50 p-6 rounded-[2.5rem] border border-stone-100">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-[7px] font-black text-emerald-600 uppercase tracking-widest mb-1">SINPE Móvil</p>
                      <p className="text-md font-black text-stone-800">{paymentConfig.sinpeMovil || '8775-1442'}</p>
                      <p className="text-[9px] font-bold text-stone-400">{paymentConfig.sinpeName || 'Una Aventura Más CR'}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[7px] font-black text-emerald-600 uppercase tracking-widest mb-1">Banco</p>
                      <p className="text-[10px] font-black text-stone-800">{paymentConfig.bankName || 'BAC'}</p>
                   </div>
                </div>
                <div className="h-px bg-stone-200"></div>
                <div>
                   <p className="text-[7px] font-black text-emerald-600 uppercase tracking-widest mb-1">IBAN Colones</p>
                   <p className="text-[10px] font-mono font-bold text-stone-600 break-all">{paymentConfig.ibanColones || 'CR00000000000000000000'}</p>
                </div>
                {paymentConfig.ibanDollars && (
                  <>
                    <div className="h-px bg-stone-200"></div>
                    <div>
                      <p className="text-[7px] font-black text-emerald-600 uppercase tracking-widest mb-1">IBAN Dólares</p>
                      <p className="text-[10px] font-mono font-bold text-stone-600 break-all">{paymentConfig.ibanDollars}</p>
                    </div>
                  </>
                )}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default CheckoutModal;
