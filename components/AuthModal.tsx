
import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../services/db';

interface AuthModalProps {
  onLoginSuccess: (user: User) => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess, onClose }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nationality: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegistering) {
      // Validación ampliada
      if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.nationality.trim() || !formData.phoneNumber.trim()) {
        setError('Por favor, completa todos los campos.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      const newUser: User = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        nationality: formData.nationality,
        phoneNumber: formData.phoneNumber
      };

      // Fix: Added explicit type cast to handle the 'unknown' result from db.users.create
      const result = (await db.users.create(newUser)) as { success: boolean; message: string };
      if (result.success) {
        onLoginSuccess(newUser);
      } else {
        setError(result.message);
      }

    } else {
      const user = await db.users.findByEmail(formData.email);
      if (user && user.password === formData.password) {
        onLoginSuccess(user);
      } else {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_0.3s_ease-out] max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <div className="bg-emerald-600 px-8 py-6 relative shrink-0">
           <button onClick={onClose} className="absolute top-4 right-4 text-emerald-100 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-white text-center font-serif">
            {isRegistering ? 'Únete a la Aventura' : 'Bienvenido de nuevo'}
          </h2>
          <p className="text-emerald-100 text-center text-[10px] uppercase font-bold tracking-widest mt-1">
            {isRegistering ? 'Crea tu cuenta de explorador' : 'Ingresa a tu panel de viajero'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-[11px] p-3 rounded-xl border border-red-100 text-center font-bold animate-shake">
              {error}
            </div>
          )}

          {isRegistering && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1 tracking-widest ml-1">Nombre Completo</label>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1 tracking-widest ml-1">Nacionalidad</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold"
                      placeholder="Ej: Costa Rica"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1 tracking-widest ml-1">Teléfono</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold"
                      placeholder="+506 8888-8888"
                    />
                  </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1 tracking-widest ml-1">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1 tracking-widest ml-1">Contraseña</label>
            <input
              type="password"
              name="password"
              autoComplete={isRegistering ? "new-password" : "current-password"}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold"
              placeholder="••••••••"
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1 tracking-widest ml-1">Confirmar Contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 mt-4"
          >
            {isRegistering ? 'Crear mi Base de Datos Personal' : 'Acceder al Sistema'}
          </button>
        </form>

        <div className="bg-stone-50 p-6 text-center border-t border-stone-100 shrink-0">
          <p className="text-stone-500 text-xs font-medium">
            {isRegistering ? '¿Ya eres parte de nosotros?' : '¿No tienes cuenta aún?'}
            <button
              onClick={() => { setIsRegistering(!isRegistering); setError(''); setFormData({name: '', nationality: '', email: '', phoneNumber: '', password: '', confirmPassword: ''}) }}
              className="text-emerald-600 font-bold ml-2 hover:underline focus:outline-none"
            >
              {isRegistering ? 'Inicia Sesión' : 'Crea una aquí'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
