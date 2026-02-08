
import { Tour, User, PaymentConfig, AboutData, FooterConfig, AdminUser, Review, Booking, GeneralConfig } from '../types';

const DB_NAME = 'CostaRicaToursDB';
const DB_VERSION = 4;

const STORES = {
  TOURS: 'tours',
  USERS: 'users',
  CONFIGS: 'configs',
  ADMINS: 'admins',
  REVIEWS: 'reviews',
  BOOKINGS: 'bookings'
};

export const syncChannel = new BroadcastChannel('cr_app_sync');

const notifyChange = (store: string) => {
    syncChannel.postMessage({ type: 'UPDATE', store });
};

class DatabaseManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        Object.values(STORES).forEach(store => {
            if (!db.objectStoreNames.contains(store)) {
                db.createObjectStore(store, store === 'users' ? { keyPath: 'email' } : { keyPath: 'id' });
            }
        });
        if (db.objectStoreNames.contains('configs')) db.deleteObjectStore('configs');
        db.createObjectStore('configs');
      };
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
      request.onerror = () => reject('Error al abrir la base de datos');
    });
  }

  private async getStore(name: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    await this.init();
    if (!this.db) throw new Error("Base de datos no inicializada");
    return this.db.transaction(name, mode).objectStore(name);
  }

  tours = {
    getAll: async (): Promise<Tour[]> => {
      const store = await this.getStore(STORES.TOURS);
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    },
    saveAll: async (tours: Tour[]) => {
      const store = await this.getStore(STORES.TOURS, 'readwrite');
      store.clear().onsuccess = () => {
        tours.forEach(tour => store.put(tour));
        notifyChange(STORES.TOURS);
      };
    }
  };

  users = {
    getAll: async (): Promise<User[]> => {
      const store = await this.getStore(STORES.USERS);
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
      });
    },
    findByEmail: async (email: string): Promise<User | undefined> => {
      const store = await this.getStore(STORES.USERS);
      return new Promise((resolve) => {
        const req = store.get(email);
        req.onsuccess = () => resolve(req.result);
      });
    },
    create: async (user: User): Promise<{ success: boolean; message: string }> => {
      const store = await this.getStore(STORES.USERS, 'readwrite');
      return new Promise((resolve) => {
        const request = store.put(user);
        request.onsuccess = () => resolve({ success: true, message: 'OK' });
        request.onerror = () => resolve({ success: false, message: 'Error al crear usuario' });
      });
    }
  };

  config = {
    get: async <T>(key: string, fallback: T): Promise<T> => {
      const store = await this.getStore(STORES.CONFIGS);
      return new Promise((resolve) => {
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result !== undefined ? req.result : fallback);
        req.onerror = () => resolve(fallback);
      });
    },
    set: async (key: string, value: any) => {
      const store = await this.getStore(STORES.CONFIGS, 'readwrite');
      store.put(value, key).onsuccess = () => notifyChange(STORES.CONFIGS);
    },
    getPayment: (f: PaymentConfig) => this.config.get('payment', f),
    setPayment: (v: PaymentConfig) => this.config.set('payment', v),
    getAbout: (f: AboutData) => this.config.get('about', f),
    setAbout: (v: AboutData) => this.config.set('about', v),
    getFooter: (f: FooterConfig) => this.config.get('footer', f),
    setFooter: (v: FooterConfig) => this.config.set('footer', v),
    getGeneral: (f: GeneralConfig) => this.config.get('general', f),
    setGeneral: (v: GeneralConfig) => this.config.set('general', v),
    getLastSync: () => this.config.get('last_sync', 'En línea'),
    setLastSync: (v: string) => this.config.set('last_sync', v),
    setCarousel: (v: string[]) => this.config.set('carousel', v)
  };

  admins = {
    getAll: async (): Promise<AdminUser[]> => {
      const store = await this.getStore(STORES.ADMINS);
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
      });
    },
    saveAll: async (v: AdminUser[]) => {
      const store = await this.getStore(STORES.ADMINS, 'readwrite');
      store.clear().onsuccess = () => v.forEach(a => store.put(a));
    }
  };

  reviews = {
    getAll: async (): Promise<Review[]> => {
      const store = await this.getStore(STORES.REVIEWS);
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
      });
    },
    saveAll: async (v: Review[]) => {
      const store = await this.getStore(STORES.REVIEWS, 'readwrite');
      store.clear().onsuccess = () => v.forEach(r => store.put(r));
    },
    add: async (v: Review) => {
      const store = await this.getStore(STORES.REVIEWS, 'readwrite');
      return new Promise((resolve) => {
        const req = store.put(v);
        req.onsuccess = () => {
          notifyChange(STORES.REVIEWS);
          resolve(true);
        };
      });
    }
  };

  bookings = {
    add: async (v: Booking) => {
        const store = await this.getStore(STORES.BOOKINGS, 'readwrite');
        store.put(v);
    },
    getByTourId: async (id: string): Promise<Booking[]> => {
        const store = await this.getStore(STORES.BOOKINGS);
        return new Promise(resolve => {
            const req = store.getAll();
            req.onsuccess = () => resolve((req.result as Booking[]).filter(b => b.tourId === id));
        });
    }
  };

  cloud = {
    syncAll: async () => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await this.config.setLastSync(`En línea: ${now}`);
      return now;
    },
    deploy: async () => {
      const now = new Date().toLocaleString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      notifyChange('GLOBAL_DEPLOY');
      return now;
    }
  };
}

export const db = new DatabaseManager();
