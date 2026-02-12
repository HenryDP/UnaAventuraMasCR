
import React from 'react';
import { Province } from '../scr/types';

interface CostaRicaMapProps {
  selectedProvince: string;
  onSelectProvince: (province: string) => void;
}

const CostaRicaMap: React.FC<CostaRicaMapProps> = ({ selectedProvince, onSelectProvince }) => {
  const isAll = selectedProvince === 'Todas';
  const isInternational = selectedProvince === Province.INTERNACIONAL;

  if (isInternational) {
      return (
          <div className="w-full max-w-3xl mx-auto p-4 flex flex-col items-center">
             <div className="w-full h-[320px] bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 rounded-[2rem] flex flex-col items-center justify-center border-2 border-white shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/world-map.png')]"></div>
                <span className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-700">🌍</span>
                <h3 className="text-2xl font-bold text-white mb-2 font-serif z-10 text-center px-4">Destinos Internacionales</h3>
                <p className="text-blue-100 text-sm z-10 mb-4 opacity-80">Explora más allá de las fronteras</p>
                <button 
                    onClick={() => onSelectProvince('Todas')}
                    className="z-10 bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-2 rounded-full font-bold hover:bg-white/20 transition-all flex items-center gap-2 text-xs"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Volver a Costa Rica
                </button>
             </div>
          </div>
      );
  }

  const query = isAll ? 'Costa Rica' : `Provincia de ${selectedProvince}, Costa Rica`;
  const zoom = isAll ? 7 : 9;
  const mapType = 'h'; 

  return (
    <div className="w-full max-w-3xl mx-auto p-4 flex flex-col items-center">
      <div className="relative w-full aspect-[2/1] max-h-[320px] rounded-[2rem] overflow-hidden shadow-xl border-4 border-white bg-stone-200">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=${mapType}&z=${zoom}&ie=UTF8&iwloc=&output=embed`}
          title="Mapa Turístico"
          className="w-full h-full filter contrast-[1.05] brightness-[1.02]"
          loading="lazy"
        ></iframe>

        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-[2rem]"></div>

        {!isAll && (
          <button 
            onClick={() => onSelectProvince('Todas')}
            className="absolute top-4 right-4 bg-white/95 hover:bg-white text-emerald-800 px-4 py-2 rounded-full text-[10px] font-black shadow-lg transition-all flex items-center gap-2 backdrop-blur-md z-10 transform hover:scale-105 active:scale-95 border border-stone-100 uppercase tracking-widest"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Todo el País
          </button>
        )}
      </div>
    </div>
  );
};

export default CostaRicaMap;
