
import React, { useEffect, useState } from 'react';
import { User } from '../src/types';
import { db } from '../src/services/db';

interface UsersManagementModalProps {
  onClose: () => void;
}

const UsersManagementModal: React.FC<UsersManagementModalProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      const data = await db.users.getAll();
      setUsers(data);
      setLoading(false);
    };
    loadUsers();
  }, []);

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-[fadeIn_0.3s_ease-out]">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-900 text-white">
          <div>
            <h2 className="text-xl font-bold font-serif">Base de Datos de Clientes</h2>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-1">Conectado a IndexedDB Engine</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-stone-50">
          {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Consultando registros...</p>
              </div>
          ) : users.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {users.map((u, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-100 hover:border-emerald-200 shadow-sm transition-all group">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-black text-lg">
                     {u.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-stone-800 truncate">{u.name}</p>
                    <p className="text-[10px] text-stone-500 font-mono truncate">{u.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
               <div className="text-5xl mb-4 grayscale opacity-20">📊</div>
               <p className="text-stone-400 text-sm font-bold uppercase tracking-widest">No hay registros de clientes aún</p>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-white border-t border-stone-100">
           <button onClick={onClose} className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all">Cerrar Visor de Datos</button>
        </div>
      </div>
    </div>
  );
};

export default UsersManagementModal;
