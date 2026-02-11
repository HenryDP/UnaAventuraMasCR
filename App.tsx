import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Tour, TourCategory, Province, PaymentConfig, User, AboutData, FooterConfig, Difficulty, DurationCategory, AdminUser, AdminRole, Language, Review, GeneralConfig } from './types';
import { db } from './services/db';
import { useTranslation } from './services/translations';
import { downloadProjectAsZip } from './services/exportService';
import Layout from './components/Layout';
import TourCard from './components/TourCard';
import HeroCarousel from './components/HeroCarousel';
import ReviewsSection from './components/ReviewsSection';
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "./services/firebase";

// Modales críticos
import AuthModal from './components/AuthModal';
import AdminLoginModal from './components/AdminLoginModal';
import CheckoutModal from './components/CheckoutModal';
import ReviewModal from './components/ReviewModal';

// Modales de administración (Lazy Load)
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const PaymentConfigModal = React.lazy(() => import('./components/PaymentConfigModal'));
const TeamManagementModal = React.lazy(() => import('./components/TeamManagementModal'));
const UsersManagementModal = React.lazy(() => import('./components/UsersManagementModal'));
const AboutEditModal = React.lazy(() => import('./components/AboutEditModal'));
const FooterEditModal = React.lazy(() => import('./components/FooterEditModal'));
const HeroCarouselEditor = React.lazy(() => import('./components/HeroCarouselEditor'));
const DeploymentModal = React.lazy(() => import('./components/DeploymentModal'));
const GeneralConfigModal = React.lazy(() => import('./components/GeneralConfigModal'));
const BookingsReportModal = React.lazy(() => import('./components/BookingsReportModal'));

// Configuración inicial
const INITIAL_TOURS: Tour[] = [/* tu tour inicial aquí */];
const DEFAULT_PAYMENT_CONFIG: PaymentConfig = { /* ... */ };
const DEFAULT_ABOUT_DATA: AboutData = { /* ... */ };
const DEFAULT_FOOTER_CONFIG: FooterConfig = { /* ... */ };
const DEFAULT_GENERAL_CONFIG: GeneralConfig = { /* ... */ };
const DEFAULT_CAROUSEL_IMAGES = [/* ... */];

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [lastSync, setLastSync] = useState('Conectado');

  const [tours, setTours] = useState<Tour[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(DEFAULT_PAYMENT_CONFIG);
  const [aboutData, setAboutData] = useState<AboutData>(DEFAULT_ABOUT_DATA);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [generalConfig, setGeneralConfig] = useState<GeneralConfig>(DEFAULT_GENERAL_CONFIG);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [carouselImages, setCarouselImages] = useState<string[]>(DEFAULT_CAROUSEL_IMAGES);

  const [adminRole, setAdminRole] = useState<AdminRole>(() => (sessionStorage.getItem('adminRole') as AdminRole) || null);
  const [user, setUser] = useState<User | null>(() => {
      const u = sessionStorage.getItem('cr_currentUser');
      return u ? JSON.parse(u) : null;
  });
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'es');

  const t = useTranslation(lang);

  const [selectedProvince, setSelectedProvince] = useState<string>('Todas');
  const [editingTour, setEditingTour] = useState<Tour | null | undefined>(undefined);
  const [viewingBookingsTour, setViewingBookingsTour] = useState<Tour | null>(null);
  const [showPaymentConfig, setShowPaymentConfig] = useState(false);
  const [showGeneralConfig, setShowGeneralConfig] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [showUsersManagement, setShowUsersManagement] = useState(false);
  const [showCarouselEditor, setShowCarouselEditor] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [editingFooter, setEditingFooter] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [bookingTour, setBookingTour] = useState<Tour | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [dashboardPos, setDashboardPos] = useState({ x: 24, y: 100 });
  const [isDashboardCollapsed, setIsDashboardCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const isAdmin = adminRole === 'SUPER_ADMIN' || adminRole === 'EDITOR';

  // Persistencia del idioma
  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  // Inicialización DB y Firestore
  useEffect(() => {
    const initApp = async () => {
      try {
        await db.init();
        setDbReady(true);

        const ref = doc(firestore, "configs", "general");
        const snap = await getDoc(ref);
        console.log(snap.exists() ? "📘 Cuaderno central conectado" : "❌ No se encontró configs/general");

        const [criticalTours, criticalGeneral, criticalCarousel] = await Promise.all([
          db.tours.getAll(),
          db.config.getGeneral(DEFAULT_GENERAL_CONFIG),
          db.config.get('carousel', DEFAULT_CAROUSEL_IMAGES)
        ]);

        setTours(criticalTours.length ? criticalTours : INITIAL_TOURS);
        setGeneralConfig(criticalGeneral);
        setCarouselImages(criticalCarousel as string[]);
        setLoading(false);

        const [p, a, f, ad, r, ls] = await Promise.all([
          db.config.getPayment(DEFAULT_PAYMENT_CONFIG),
          db.config.getAbout(DEFAULT_ABOUT_DATA),
          db.config.getFooter(DEFAULT_FOOTER_CONFIG),
          db.admins.getAll(),
          db.reviews.getAll(),
          db.config.getLastSync()
        ]);

        setPaymentConfig(p);
        setAboutData(a);
        setFooterConfig(f);
        setAdminUsers(ad);
        setReviews(r);
        setLastSync(ls);

      } catch (err) {
        console.error("Critical DB Error:", err);
        setLoading(false);
      }
    };

    initApp();
  }, []);

  // Sincronización automática con manejo de errores
  const handleDataChange = async () => {
    if (!dbReady || !isAdmin) return;
    setSyncing(true);

    const results = await Promise.allSettled([
      db.tours.saveAll(tours),
      db.config.setPayment(paymentConfig),
      db.config.setAbout(aboutData),
      db.config.setFooter(footerConfig),
      db.admins.saveAll(adminUsers),
      db.config.setCarousel(carouselImages),
      db.reviews.saveAll(reviews),
      db.config.setGeneral(generalConfig)
    ]);

    results.forEach((res, i) => res.status === 'rejected' && console.error(Sync error #${i}:, res.reason));

    const ls = await db.cloud.syncAll();
    setLastSync(ls);
    setSyncing(false);
  };

  // Evitar loops infinitos: solo sync cuando cambian datos y app está lista
  const prevDataRef = useRef({ tours, paymentConfig, aboutData, footerConfig, adminUsers, carouselImages, reviews, generalConfig });
  useEffect(() => {
    const changed =
      prevDataRef.current.tours !== tours ||
      prevDataRef.current.paymentConfig !== paymentConfig ||
      prevDataRef.current.aboutData !== aboutData ||
      prevDataRef.current.footerConfig !== footerConfig ||
      prevDataRef.current.adminUsers !== adminUsers ||
      prevDataRef.current.carouselImages !== carouselImages ||
      prevDataRef.current.reviews !== reviews ||
      prevDataRef.current.generalConfig !== generalConfig;

    if (!loading && dbReady && isAdmin && changed) {
      handleDataChange();
      prevDataRef.current = { tours, paymentConfig, aboutData, footerConfig, adminUsers, carouselImages, reviews, generalConfig };
    }
  }, [tours, paymentConfig, aboutData, footerConfig, adminUsers, carouselImages, reviews, generalConfig, loading, dbReady, isAdmin]);

  // Resto de handlers: handlePublishToCloud, handleExportProject, handleSaveTour, handleAddReview, handleLogoutAdmin
  // ...igual que antes, no cambian

  // Draggable dashboard
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setDashboardPos({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
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

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-stone-50">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
      <p className="text-stone-400 font-black tracking-widest uppercase text-[10px]">Cargando Experiencia...</p>
    </div>
  );

  return (
    <Layout
      isAdmin={isAdmin}
      isSyncing={syncing}
      user={user}
      lang={lang}
      onSetLang={setLang}
      brandName={generalConfig.brandName}
      logoUrl={generalConfig.logoUrl}
      footerConfig={footerConfig}
      whatsappNumber={paymentConfig.whatsappNumber}
      onLoginAdmin={() => setShowAdminLogin(true)}
      onLogoutAdmin={() => { setAdminRole(null); sessionStorage.removeItem('adminRole'); }}
      onOpenAuth={() => setShowAuthModal(true)}
      onLogoutUser={() => { setUser(null); sessionStorage.removeItem('cr_currentUser'); }}
      onEditFooter={() => setEditingFooter(true)}
    >
      {/* Aquí va todo tu JSX de modales, dashboard flotante, tours, hero, about y reviews */}
      {/* ...igual que tu versión existente, con Suspense para los modales lazy */}
    </Layout>
  );
};