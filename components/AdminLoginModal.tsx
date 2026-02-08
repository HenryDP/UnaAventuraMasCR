
import React, { useState, useEffect, useRef } from 'react';
import { AdminUser, AdminRole } from '../types';

interface AdminLoginModalProps {
  authorizedUsers: AdminUser[];
  onSuccess: (role: AdminRole, userName?: string) => void;
  onClose: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ authorizedUsers, onSuccess, onClose }) => {
  const [password, setPassword] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Chequear Super Admin
    if (password === 'puravida') {
      onSuccess('SUPER_ADMIN');
      onClose();
      return;
    }

    // 2. Chequear Editores adicionales
    const foundUser = authorizedUsers.find(u => u.accessCode === password);
    if (foundUser) {
       onSuccess('EDITOR', foundUser.name);
       onClose();
       return;
    }

    setError('Credenciales incorrectas');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"></div>

      <div 
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        {/* Header con gradiente */}
        <div 
            onMouseDown={handleMouseDown}
            className="bg-gradient-to-r from-stone-800 to-stone-900 p-8 text-center relative cursor-grab active:cursor-grabbing select-none"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="w-16 h-16 bg-stone-700 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-stone-600 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Acceso Administrativo</h2>
          <p className="text-stone-400 text-xs mt-1 uppercase tracking-widest">Ingresa tu código de acceso</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-4 bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl border border-red-100 text-center flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-xs font-bold text-stone-500 uppercase mb-2 ml-1">Código / Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-center tracking-widest text-lg bg-stone-50"
              placeholder="••••••••"
              autoFocus
            />
            <p className="text-center text-xs text-stone-400 mt-3">
              Master Demo: <span className="font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">puravida</span>
            </p>
          </div>

          <button 
            type="submit"
            className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-4 rounded-xl shadow-lg transition-transform transform active:scale-95"
          >
            Entrar al Panel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
