
import React, { useState, useEffect, useRef } from 'react';
import { Tour, Booking } from '../types';
import { db } from '../services/db';

interface BookingsReportModalProps {
  tour: Tour;
  onClose: () => void;
}

const BookingsReportModal: React.FC<BookingsReportModalProps> = ({ tour, onClose }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fetchBookings = async () => {
      const data = await db.bookings.getByTourId(tour.id);
      setBookings(data);
      setLoading(false);
    };
    fetchBookings();

    // Centrar inicialmente
    if (window.innerWidth > 768) {
        setPosition({
            x: window.innerWidth / 2 - 300,
            y: 100
        });
    } else {
        setPosition({ x: 0, y: 0 });
    }
  }, [tour.id]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Evitar arrastre si se hace clic en un botón
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y
        });
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

  const handleDownloadCSV = () => {
    if (bookings.length === 0) return;
    const headers = ['Fecha Reserva', 'Fecha Tour', 'Cliente', 'Email', 'Teléfono', 'Nacionalidad', 'Tarifa', 'Cant.', 'Total', 'Pickup'];
    const rows = bookings.map(b => [
        new Date(b.bookingDate).toLocaleDateString(),
        new Date(b.dateOfTour).toLocaleDateString(),
        b.customerName || '-',
        b.customerEmail || '-',
        b.customerPhone || '-',
        b.customerNationality || '-',
        b.customerType === 'national' ? 'Nacional' : 'Standard',
        b.quantity || 1,
        `$${b.totalPrice || 0}`,
        b.selectedPickupLocation || '-'
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Ventas_${tour.title.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none flex items-start justify-start overflow-hidden">
      <div 
        className="bg-white w-[90vw] max-w-3xl h-[70vh] rounded-none sm:rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-stone-200 overflow-hidden flex flex-col pointer-events-auto select-none"
        style={{ 
            position: 'absolute',
            left: `${position.x}px`, 
            top: `${position.y}px`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <div 
            onMouseDown={handleMouseDown}
            className="p-6 bg-stone-900 text-white flex justify-between items-center cursor-grab active:cursor-grabbing"
        >
          <div>
            <h2 className="text-xl font-bold font-serif">Reporte de Ventas Detallado</h2>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-1">{tour.title} (Arrástrame)</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDownloadCSV} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-2" title="Descargar CSV">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Exportar CSV
            </button>
            <button onClick={onClose} className="bg-white/10 hover:bg-red-500 hover:text-white text-stone-300 p-2.5 rounded-xl transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-stone-50 custom-scrollbar">
          {loading ? (
             <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-stone-300 border-t-emerald-500 rounded-full animate-spin"></div>
             </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
               {bookings.map(b => (
                  <div key={b.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-4">
                     {/* Header Card */}
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black">
                            {b.customerName?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <p className="font-bold text-stone-800 text-sm">{b.customerName || 'Cliente Anónimo'}</p>
                                <p className="text-[10px] text-stone-400 font-bold uppercase">{b.customerType === 'national' ? 'Nacional' : 'Extranjero'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-black text-emerald-600">${b.totalPrice}</p>
                            <p className="text-[10px] text-stone-400">{new Date(b.bookingDate).toLocaleDateString()}</p>
                        </div>
                     </div>

                     {/* Details Grid */}
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-stone-50 p-3 rounded-xl border border-stone-100">
                        <div>
                            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Email</p>
                            <p className="text-xs font-bold text-stone-700 truncate" title={b.customerEmail}>{b.customerEmail || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Teléfono</p>
                            <p className="text-xs font-bold text-stone-700">{b.customerPhone || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Nacionalidad</p>
                            <p className="text-xs font-bold text-stone-700">{b.customerNationality || '-'}</p>
                        </div>
                         <div>
                            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Pickup</p>
                            <p className="text-xs font-bold text-stone-700 truncate" title={b.selectedPickupLocation}>{b.selectedPickupLocation || '-'}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 italic">
               <span className="text-5xl mb-4">📉</span>
               No hay ventas registradas aún.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsReportModal;
