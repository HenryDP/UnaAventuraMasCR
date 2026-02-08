
import React from 'react';

interface TermsModalProps {
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Términos y Condiciones</h2>
            <p className="text-stone-500 text-xs font-medium uppercase tracking-widest mt-1">Última actualización: Marzo 2024</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-stone-100 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 text-stone-700 leading-relaxed">
          <section>
            <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">01</span>
              Reservaciones y Pagos
            </h3>
            <p className="text-sm">
              Toda reservación se considera confirmada una vez que el cliente haya realizado el pago total o el depósito acordado y haya recibido un comprobante de confirmación por parte de nuestra agencia. Aceptamos pagos vía SINPE Móvil, transferencia bancaria y tarjetas de crédito/débito. Los precios están expresados en dólares estadounidenses ($) pero pueden cancelarse en colones (₡) al tipo de cambio oficial de venta del Banco Central del día del pago.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">02</span>
              Políticas de Cancelación
            </h3>
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-sm space-y-2">
              <p>• <strong>Más de 72 horas antes:</strong> Reembolso del 100% menos gastos administrativos (5%).</p>
              <p>• <strong>Entre 72 y 24 horas antes:</strong> Reembolso del 50% del monto total.</p>
              <p>• <strong>Menos de 24 horas o "No Show":</strong> No se realizará ningún reembolso.</p>
              <p className="mt-4 italic text-stone-500">Nota: En caso de condiciones climáticas extremas o fuerza mayor que impidan la realización del tour, la agencia ofrecerá reprogramar la actividad o realizar un reembolso completo.</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">03</span>
              Responsabilidad del Cliente
            </h3>
            <p className="text-sm mb-3">
              El cliente declara estar en condiciones físicas y de salud óptimas para realizar las actividades contratadas. Es responsabilidad del cliente informar sobre cualquier condición médica, alergia o limitación física antes del inicio del tour.
            </p>
            <p className="text-sm">
              Asimismo, el cliente se compromete a seguir estrictamente las instrucciones de seguridad de los guías y a respetar las normas de conservación ambiental de los Parques Nacionales y zonas protegidas de Costa Rica.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">04</span>
              Seguros y Limitación de Responsabilidad
            </h3>
            <p className="text-sm">
              Nuestra agencia cuenta con Pólizas de Responsabilidad Civil vigentes. Sin embargo, no nos hacemos responsables por la pérdida, robo o daño de artículos personales (cámaras, celulares, joyas, etc.) durante el desarrollo de las actividades. Se recomienda a los turistas extranjeros contar con su propio seguro de viaje internacional.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">05</span>
              Documentación y Requisitos
            </h3>
            <p className="text-sm">
              Es obligación del turista portar su identificación original (Cédula o Pasaporte) en caso de ser requerida por las autoridades migratorias o de los Parques Nacionales. La agencia se reserva el derecho de admisión si el cliente se presenta bajo los efectos del alcohol o sustancias ilícitas.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-center">
          <button 
            onClick={onClose}
            className="bg-emerald-600 text-white font-bold px-10 py-3 rounded-xl hover:bg-emerald-700 transition-transform active:scale-95 shadow-md"
          >
            Entendido y Acepto
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
