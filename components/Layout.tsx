
import React, { useState, useEffect } from 'react';
import { User, FooterConfig, Language } from '../scr/types';
import { useTranslation } from '../scr/services/translations';
import TermsModal from './TermsModal';

interface LayoutProps {
  children: React.ReactNode;
  isAdmin: boolean;
  isSyncing?: boolean;
  user: User | null;
  lang: Language;
  onSetLang: (lang: Language) => void;
  logoUrl?: string;
  brandName: string;
  footerConfig: FooterConfig;
  whatsappNumber?: string; // Nuevo prop para el número dinámico
  onLoginAdmin: () => void;
  onLogoutAdmin: () => void;
  onOpenAuth: () => void;
  onLogoutUser: () => void;
  onEditFooter?: () => void;
  onManageTeam?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  isAdmin, 
  isSyncing,
  user,
  lang,
  onSetLang,
  logoUrl,
  brandName,
  footerConfig,
  whatsappNumber,
  onLoginAdmin, 
  onLogoutAdmin,
  onOpenAuth,
  onLogoutUser,
  onEditFooter
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const t = useTranslation(lang);

  // Lógica del número de WhatsApp
  const defaultNumber = "87751442";
  const rawNumber = whatsappNumber || defaultNumber;
  // Limpiar el número para el link (quitar espacios, guiones, etc)
  const cleanNumber = rawNumber.replace(/\D/g, '');
  // Asegurar código de país (506 para CR por defecto si no lo trae)
  const finalNumber = cleanNumber.startsWith('506') || cleanNumber.length > 8 ? cleanNumber : `506${cleanNumber}`;
  const whatsappLink = `https://wa.me/${finalNumber}`;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // PWA Install Prompt Listener
    const handleInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      setIsMobileMenuOpen(false);
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'es', label: 'ES', flag: '🇨🇷' },
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'de', label: 'DE', flag: '🇩🇪' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans relative bg-white ${isAdmin ? 'border-t-4 border-emerald-500' : ''}`}>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      
      {/* Botón Flotante de WhatsApp */}
      <a 
        href={whatsappLink}
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[90] bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-[0_10px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_15px_30px_rgba(37,211,102,0.5)] hover:scale-110 transition-all duration-300 flex items-center justify-center group animate-[fadeIn_1s_ease-out_1s_both]"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        
        {/* Tooltip */}
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-stone-800 text-xs font-bold px-4 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-stone-100">
           ¡Hola! 👋 ¿En qué te ayudamos?
        </span>

        {/* Notificación Ping */}
        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </a>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[200] bg-stone-900/60 backdrop-blur-md transition-opacity duration-500 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transition-transform duration-500 transform p-8 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="flex justify-between items-center mb-12">
                  <span className="font-serif font-bold text-2xl text-stone-800">Menú</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-stone-100 rounded-full text-stone-500">✕</button>
              </div>
              
              <nav className="space-y-6 mb-8">
                  <a href="#inicio" onClick={(e) => handleNavClick(e, '#inicio')} className="block text-xl font-bold text-stone-800 border-b border-stone-100 pb-4">Inicio</a>
                  <a href="#tours" onClick={(e) => handleNavClick(e, '#tours')} className="block text-xl font-bold text-stone-800 border-b border-stone-100 pb-4">Tours</a>
                  <a href="#nosotros" onClick={(e) => handleNavClick(e, '#nosotros')} className="block text-xl font-bold text-stone-800 border-b border-stone-100 pb-4">Nosotros</a>
              </nav>

              {/* Install App Button (Mobile Only) */}
              {isInstallable && (
                <button 
                  onClick={handleInstallClick}
                  className="w-full mb-8 bg-stone-900 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Instalar App
                </button>
              )}

              <div className="space-y-4">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Idioma / Language</p>
                  <div className="grid grid-cols-2 gap-3">
                      {languages.map((l) => (
                          <button 
                            key={l.code} 
                            onClick={() => { onSetLang(l.code); setIsMobileMenuOpen(false); }}
                            className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${lang === l.code ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-stone-50 border-stone-200 text-stone-600'}`}
                          >
                              <span className="font-bold text-xs">{l.label}</span>
                              <span>{l.flag}</span>
                          </button>
                      ))}
                  </div>
              </div>

              <div className="mt-auto space-y-4">
                  {user ? (
                      <button onClick={onLogoutUser} className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold">Cerrar Sesión</button>
                  ) : (
                      <button onClick={onOpenAuth} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold">Ingresar</button>
                  )}
              </div>
          </div>
      </div>

      <header className={`fixed top-0 w-full z-[150] transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-2xl h-16 shadow-2xl' : 'bg-transparent h-24'}`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo UA - Puerta Secreta para Admin */}
          <div 
            className="flex items-center space-x-4 group cursor-pointer" 
            onClick={(e) => handleNavClick(e as any, '#inicio')}
            onDoubleClick={onLoginAdmin}
            title={isAdmin ? "Doble clic: Opciones Admin" : brandName}
          >
            <div className="relative">
              {/* Logo Aesthetic Redesign: Sin fondo si hay imagen */}
              <div className={`w-14 h-14 flex items-center justify-center transition-transform group-hover:rotate-6 ${scrolled ? 'scale-90' : 'scale-100'} ${!logoUrl ? 'bg-emerald-600 rounded-2xl text-white font-black shadow-lg' : ''}`}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain drop-shadow-lg filter" />
                ) : (
                  'UA'
                )}
              </div>
              
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg border border-stone-100">
                 <div className={`w-2.5 h-2.5 rounded-full ${isSyncing ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></div>
                 {!isSyncing && (
                   <div className="absolute w-full h-full bg-emerald-500/30 rounded-full animate-ping"></div>
                 )}
              </div>
            </div>

            <div className="flex flex-col">
              <span className={`font-bold transition-all leading-tight ${scrolled ? 'text-lg text-emerald-950' : 'text-2xl text-white drop-shadow-xl font-serif'}`}>{brandName}</span>
              <div className="flex items-center gap-1.5 overflow-hidden">
                  <div className={`h-1 w-1 rounded-full ${isSyncing ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                  <span className={`text-[7px] font-black uppercase tracking-[0.4em] ${scrolled ? 'text-emerald-700/60' : 'text-emerald-400'}`}>
                    {isAdmin ? (isSyncing ? 'Syncing...' : 'Red Cloud: Online') : 'Costa Rica Experience'}
                  </span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-8">
                <a href="#inicio" onClick={(e) => handleNavClick(e, '#inicio')} className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-emerald-500 ${scrolled ? 'text-stone-700' : 'text-white/80 hover:text-white'}`}>Inicio</a>
                <a href="#tours" onClick={(e) => handleNavClick(e, '#tours')} className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-emerald-500 ${scrolled ? 'text-stone-700' : 'text-white/80 hover:text-white'}`}>Tours</a>
            </div>
            
            {/* Language Switcher Desktop */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border transition-all ${scrolled ? 'bg-stone-100 border-stone-200' : 'bg-white/10 border-white/20 backdrop-blur-md'}`}>
                {languages.map((l) => (
                    <button 
                        key={l.code}
                        onClick={() => onSetLang(l.code)}
                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black transition-all ${lang === l.code ? 'bg-emerald-600 text-white shadow-md' : (scrolled ? 'text-stone-400 hover:text-emerald-600' : 'text-white/60 hover:text-white')}`}
                    >
                        {l.label}
                    </button>
                ))}
            </div>

            <div className={`h-6 w-px ${scrolled ? 'bg-stone-200' : 'bg-white/20'}`}></div>

            {user ? (
                <div className="flex items-center gap-4">
                   <div className="flex flex-col items-end">
                      <p className={`text-[10px] font-black leading-none ${scrolled ? 'text-stone-900' : 'text-white'}`}>{user.name}</p>
                      <span className="text-[6px] text-emerald-500 font-black uppercase tracking-widest mt-0.5">Explorador</span>
                   </div>
                   <button onClick={onLogoutUser} className="bg-red-500/10 text-red-600 text-[8px] font-black uppercase px-4 py-2 rounded-xl border border-red-500/20 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-500/5">Salir</button>
                </div>
              ) : (
                <button onClick={onOpenAuth} className={`px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${scrolled ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-white/15 text-white border border-white/20 backdrop-blur-md hover:bg-white/25 hover:border-white/40'}`}>Ingresar</button>
              )}
            
            {isAdmin && (
              <button onClick={onLogoutAdmin} className="bg-stone-950 text-white px-6 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-[0.3em] border border-white/10 shadow-2xl hover:bg-red-600 transition-all active:scale-95">Admin Exit</button>
            )}
          </nav>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`md:hidden p-3.5 rounded-2xl transition-all active:scale-90 ${scrolled ? 'bg-stone-100 text-stone-900' : 'bg-white/10 text-white backdrop-blur-md border border-white/10'}`}>
             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </header>

      <main className="flex-grow pt-0">{children}</main>

      <footer id="contact" className="bg-stone-950 text-white py-40 relative overflow-hidden group/footer">
        {/* Botón de Edición del Footer */}
        {isAdmin && onEditFooter && (
            <button 
                onClick={onEditFooter}
                className="absolute top-10 right-10 bg-emerald-600 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 border border-white/20 z-50 group-hover/footer:opacity-100 opacity-0 transition-opacity"
                title="Editar Footer"
            >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
        )}

        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-600 via-blue-500 to-emerald-600 animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-24 relative z-10">
           <div className="space-y-10">
             <div className="flex items-center gap-6">
               <div className={`w-20 h-20 ${logoUrl ? '' : 'bg-emerald-600 border border-white/10 shadow-2xl'} rounded-[2rem] flex items-center justify-center text-3xl font-black overflow-hidden`}>
                 {logoUrl ? <img src={logoUrl} alt="Logo Footer" className="w-full h-full object-contain" /> : 'UA'}
               </div>
               <div className="flex flex-col">
                  <h4 className="text-4xl font-bold font-serif tracking-tighter leading-none">{brandName}</h4>
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Pura Vida Worldwide</p>
               </div>
             </div>
             <p className="text-stone-500 text-xl leading-relaxed max-w-sm font-light opacity-80">{footerConfig.description}</p>
           </div>
           
           <div className="space-y-10">
             <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-500">Navegación</h4>
             <ul className="space-y-6 text-stone-400 font-bold text-sm">
               <li><a href="#inicio" onClick={(e) => handleNavClick(e, '#inicio')} className="hover:text-emerald-400 transition-all hover:translate-x-2 inline-block">Inicio</a></li>
               <li><a href="#tours" onClick={(e) => handleNavClick(e, '#tours')} className="hover:text-emerald-400 transition-all hover:translate-x-2 inline-block">Experiencias</a></li>
               <li><button onClick={() => setShowTerms(true)} className="hover:text-emerald-400 transition-all hover:translate-x-2 inline-block text-left">Políticas de Privacidad</button></li>
             </ul>
           </div>
           
           <div className="space-y-10">
             <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-500">Oficina Cloud</h4>
             <div className="space-y-8">
                <div>
                   <p className="text-stone-500 text-[9px] font-black uppercase mb-1.5">Email Directo</p>
                   <p className="text-white font-bold text-sm">{footerConfig.email}</p>
                </div>
                <div>
                   <p className="text-stone-500 text-[9px] font-black uppercase mb-1.5">WhatsApp</p>
                   <p className="text-white font-bold text-sm">{footerConfig.phone}</p>
                </div>

                <div>
                   <p className="text-stone-500 text-[9px] font-black uppercase mb-1.5">Redes Sociales</p>
                   <div className="flex gap-4">
                      {footerConfig.instagram && (
                        <a href={footerConfig.instagram} target="_blank" rel="noopener noreferrer" className="bg-stone-800 p-2.5 rounded-lg text-white hover:bg-pink-600 transition-colors group shadow-lg border border-white/5" title="Instagram">
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></svg>
                        </a>
                      )}
                      {footerConfig.facebook && (
                        <a href={footerConfig.facebook} target="_blank" rel="noopener noreferrer" className="bg-stone-800 p-2.5 rounded-lg text-white hover:bg-blue-600 transition-colors group shadow-lg border border-white/5" title="Facebook">
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10.05 10.05 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" /></svg>
                        </a>
                      )}
                      {footerConfig.tiktok && (
                         <a href={footerConfig.tiktok} target="_blank" rel="noopener noreferrer" className="bg-stone-800 p-2.5 rounded-lg text-white hover:bg-black transition-colors group shadow-lg border border-white/5 hover:border-white/20" title="TikTok">
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                        </a>
                      )}
                   </div>
                </div>
                
                {isAdmin && (
                   <div className="pt-6 border-t border-white/5 animate-pulse">
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Estado Administrativo: Conectado</p>
                      <p className="text-stone-600 text-[9px] font-mono mt-1">SESS: {lang.toUpperCase()}-PRIMARY</p>
                   </div>
                )}
             </div>
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-40 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="text-stone-600 text-[10px] font-bold uppercase tracking-[0.4em]">
              © {new Date().getFullYear()} {brandName} Network • Global Services
           </div>
           <div className="flex items-center gap-8 grayscale opacity-40">
              <span className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">Designed by Pura Vida</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
