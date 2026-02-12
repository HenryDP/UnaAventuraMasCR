
import React, { useState, useEffect, useRef } from 'react';
import { AdminUser } from '../src/types';

interface TeamManagementModalProps {
  adminUsers: AdminUser[];
  onAddUser: (name: string, accessCode: string) => void;
  onRemoveUser: (id: string) => void;
  onClose: () => void;
}

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ adminUsers, onAddUser, onRemoveUser, onClose }) => {
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [error, setError] = useState('');

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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      setError('Datos incompletos.');
      return;
    }
    if (adminUsers.length >= 3) {
      setError('Límite de editores alcanzado.');
      return;
    }
    onAddUser(newName, newCode);
    setNewName('');
    setNewCode('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"></div>

      <div 
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_40px_80px_-10px_rgba(0,0,0,0.4)] flex flex-col pointer-events-auto overflow-hidden border border-white/20"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        <div 
            onMouseDown={handleMouseDown}
            className="bg-stone-900 p-8 flex justify-between items-center cursor-grab active:cursor-grabbing select-none text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold font-serif">Equipo Cloud</h2>
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1">Gestión de Accesos</p>
          </div>
          <button onClick={onClose} className="relative z-10 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-8 bg-stone-50">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Nuevo Acceso ({adminUsers.length}/3)</h3>
            
            {adminUsers.length < 3 ? (
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="flex gap-3">
                   <div className="flex-1">
                      <input 
                        type="text" 
                        placeholder="Nombre" 
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none"
                      />
                   </div>
                   <div className="flex-1">
                      <input 
                        type="text" 
                        placeholder="Código" 
                        value={newCode}
                        onChange={e => setNewCode(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm font-mono focus:ring-2 focus:ring-stone-900 outline-none"
                      />
                   </div>
                </div>
                {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded-lg text-center">{error}</p>}
                <button type="submit" className="w-full bg-stone-900 hover:bg-black text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95">
                    Otorgar Permiso
                </button>
              </form>
            ) : (
               <div className="text-center py-4 text-stone-400 text-xs font-medium italic border-t border-stone-100 mt-2">
                 Capacidad máxima del equipo alcanzada.
               </div>
            )}
          </div>

          <div>
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Personal Activo</h3>
            {adminUsers.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-4 italic">Solo tú tienes acceso.</p>
            ) : (
              <div className="space-y-3">
                {adminUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-sm group hover:border-red-200 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-sm">{user.name.charAt(0)}</div>
                        <div>
                           <p className="font-bold text-stone-800 text-sm">{user.name}</p>
                           <p className="text-[10px] text-stone-400 font-mono bg-stone-100 px-1.5 py-0.5 rounded inline-block mt-0.5">AUTH: {user.accessCode}</p>
                        </div>
                     </div>
                     <button onClick={() => onRemoveUser(user.id)} className="text-stone-300 hover:text-red-500 p-2 transition-colors" title="Revocar Acceso">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                     </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementModal;
