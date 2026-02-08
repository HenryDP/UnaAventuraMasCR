
export type Language = 'es' | 'en' | 'de' | 'fr';

export interface Tour {
  id: string;
  slug?: string; // Nombre amigable para el link (ej: volcan-arenal-pro)
  title: string;
  titles: Record<Language, string>;
  description: string;
  descriptions: Record<Language, string>;
  priceNational: number;
  priceForeigner: number;
  category: TourCategory;
  province: Province;
  location: string;
  imageUrl: string;
  gallery: string[];
  difficulty: Difficulty;
  durationCategory: DurationCategory;
  durationText: string;
  minGroupSize: number;
  tourDate: string; 
  hikingDistance: string;
  included: string[];
  recommendations: string[];
  pickupLocations: string[]; 
  pickupTime?: string; 
  returnTime?: string; 
}

export interface Review {
  id: string;
  userName: string;
  rating: number; 
  comment: string;
  date: string;
  location?: string;
}

export interface Booking {
  id: string;
  tourId: string;
  tourTitle: string;
  dateOfTour: string; 
  bookingDate: string;
  reviewed: boolean;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerNationality?: string;
  customerType?: 'national' | 'foreigner';
  quantity?: number;
  totalPrice?: number;
  paymentMethod?: 'whatsapp' | 'card';
  selectedPickupLocation?: string;
}

export interface User {
  email: string;
  password: string; 
  name: string;
  nationality?: string;
  phoneNumber?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  accessCode: string; 
  role: 'EDITOR';
}

export type AdminRole = 'SUPER_ADMIN' | 'EDITOR' | null;

export enum TourCategory {
  ADVENTURE = 'Aventura',
  NATURE = 'Naturaleza',
  BEACH = 'Playa',
  CULTURE = 'Cultura',
  VOLCANO = 'Volcán'
}

export enum Province {
  SAN_JOSE = 'San José',
  ALAJUELA = 'Alajuela',
  CARTAGO = 'Cartago',
  HEREDIA = 'Heredia',
  GUANACASTE = 'Guanacaste',
  PUNTARENAS = 'Puntarenas',
  LIMON = 'Limón',
  INTERNACIONAL = 'Internacional'
}

export enum Difficulty {
  BEGINNER = 'Principiante',
  BEGINNER_FIT = 'Principiante con excelente condición física',
  INTERMEDIATE = 'Intermedio',
  ADVANCED = 'Avanzado'
}

export enum DurationCategory {
  HALF_DAY = 'Medio Día',
  FULL_DAY = 'Día Completo',
  MULTI_DAY = 'Varios Días'
}

export interface LinkedAccount {
  id: string;
  bankName: string;
  accountLast4: string;
  status: 'active' | 'inactive';
  currency: 'CRC' | 'USD';
}

export interface PaymentConfig {
  sinpeMovil: string;
  sinpeName: string;
  ibanColones: string;
  ibanDollars: string;
  bankName: string;
  whatsappNumber: string;
  acceptsCash: boolean;
  acceptsCard: boolean;
  enableOnlinePayment: boolean;
  touchPayLink?: string; 
  linkedAccounts: LinkedAccount[];
}

export interface GeneralConfig {
  brandName: string;
  logoUrl: string;
  heroTitle?: string;
  heroSubtitle?: string;
}

export interface AboutData {
  title: string;
  description: string;
  imageUrl: string;
  stats: {
    years: string;
    customers: string;
  }
}

export interface FooterConfig {
  description: string;
  addresses: string[];
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  tiktok: string;
}
