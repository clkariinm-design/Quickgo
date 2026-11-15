import {
  BURCO_DELIVERY_ZONES,
  INITIAL_ADDRESSES,
  INITIAL_COUPONS,
  INITIAL_DRIVERS,
  INITIAL_DRIVER_APPLICATIONS,
  INITIAL_FRAUD_ALERTS,
  INITIAL_MERCHANT_APPLICATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
  INITIAL_TICKETS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER,
  PRODUCTS,
  PROMO_BANNERS,
  SERVICE_CATEGORIES,
  STORES,
} from '../data/mockData';
import {
  Address,
  CartItem,
  Coupon,
  DeliveryZone,
  DriverApplication,
  DriverInfo,
  FraudAlert,
  GPSPoint,
  MerchantApplication,
  NotificationItem,
  Order,
  OrderStatus,
  PaymentMethodId,
  PaymentStatus,
  PaymentTransaction,
  PlatformSettings,
  Product,
  PromoBanner,
  RefundStatus,
  ServiceCategory,
  Store,
  StoreReview,
  SupportTicket,
  UploadedDocRef,
  UserProfile,
  UserRole,
} from '../types';
import { getBackendConfig, supabase } from './supabaseClient';

const STORAGE_KEYS = {
  user: 'quickgo_user_v2',
  auth: 'quickgo_is_auth_v2',
  addresses: 'quickgo_addresses_v2',
  orders: 'quickgo_orders_v2',
  favorites: 'quickgo_favorites_v2',
  cart: 'quickgo_cart_v2',
  notifications: 'quickgo_notifications_v2',
  language: 'quickgo_language_v2',
  driverApps: 'quickgo_driver_apps_v2',
  merchantApps: 'quickgo_merchant_apps_v2',
  stores: 'quickgo_stores_v2',
  transactions: 'quickgo_txns_v2',
  reviews: 'quickgo_reviews_v2',
  tickets: 'quickgo_tickets_v2',
  fraud: 'quickgo_fraud_v2',
  settings: 'quickgo_settings_v2',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

async function apiPost<T>(path: string, body: unknown, role: UserRole = 'customer', userId = 'usr-maxamed-01'): Promise<T | null> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-quickgo-role': role,
        'x-quickgo-user-id': userId,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const catalogService = {
  async getCategories(): Promise<ServiceCategory[]> {
    getBackendConfig();
    return SERVICE_CATEGORIES;
  },
  async getPromoBanners(): Promise<PromoBanner[]> {
    return PROMO_BANNERS;
  },
  async getStores(): Promise<Store[]> {
    return readStorage<Store[]>(STORAGE_KEYS.stores, STORES);
  },
  saveStores(stores: Store[]): Store[] {
    writeStorage(STORAGE_KEYS.stores, stores);
    return stores;
  },
  async getProducts(): Promise<Product[]> {
    return PRODUCTS;
  },
  getDeliveryZones(): DeliveryZone[] {
    return BURCO_DELIVERY_ZONES;
  },
  getCoupons(): Coupon[] {
    return INITIAL_COUPONS;
  },
};

function mapAuthProfile(authUser: { id: string; email?: string; phone?: string; created_at?: string; user_metadata?: Record<string, unknown>; email_confirmed_at?: string | null }, row?: Record<string, unknown> | null): UserProfile {
  const fullName = String(row?.full_name || authUser.user_metadata?.full_name || 'QuickGo Customer');
  return {
    id: authUser.id,
    fullName,
    email: String(row?.email || authUser.email || ''),
    phone: String(row?.phone || authUser.phone || authUser.user_metadata?.phone || ''),
    avatarInitials: getInitials(fullName),
    joinedAt: String(row?.created_at || authUser.created_at || new Date().toISOString()).slice(0, 10),
    role: (row?.role as UserRole) || 'customer',
    phoneVerified: Boolean(row?.phone_verified || authUser.phone),
    emailVerified: Boolean(row?.email_verified || authUser.email_confirmed_at),
    twoFactorEnabled: Boolean(row?.two_factor_enabled),
    walletBalanceUsd: Number(row?.wallet_balance_usd || 0),
    referralCode: String(row?.referral_code || ''),
    referralRewardsUsd: 0,
  };
}

async function loadSupabaseProfile(authUser: { id: string; email?: string; phone?: string; created_at?: string; user_metadata?: Record<string, unknown>; email_confirmed_at?: string | null }): Promise<UserProfile> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.from('profiles')
    .select('id,full_name,email,phone,role,phone_verified,email_verified,two_factor_enabled,wallet_balance_usd,referral_code,created_at')
    .eq('id', authUser.id)
    .maybeSingle();
  if (error) throw error;
  return mapAuthProfile(authUser, data);
}

export const authService = {
  getSession(): { isAuthenticated: boolean; user: UserProfile } {
    return { isAuthenticated: false, user: INITIAL_USER };
  },

  async getAuthenticatedUser(): Promise<UserProfile | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return loadSupabaseProfile(data.user);
  },

  async sendPhoneOtp(phone: string): Promise<{ sent: boolean; demoCodeHint?: string }> {
    if (!supabase) throw new Error('Supabase lama habayn. Ku dar VITE_SUPABASE_URL iyo VITE_SUPABASE_ANON_KEY.');
    const { error } = await supabase.auth.signInWithOtp({ phone: phone.replace(/\s+/g, ''), options: { shouldCreateUser: false } });
    if (error) throw error;
    return { sent: true };
  },

  async verifyPhoneOtp(phone: string, otpCode: string): Promise<{ ok: boolean; user?: UserProfile }> {
    if (!supabase || !/^\d{6}$/.test(otpCode.trim())) return { ok: false };
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.replace(/\s+/g, ''),
      token: otpCode.trim(),
      type: 'sms',
    });
    if (error || !data.user) return { ok: false };
    return { ok: true, user: await loadSupabaseProfile(data.user) };
  },

  async sendEmailVerification(email: string): Promise<{ sent: boolean; demoCodeHint?: string }> {
    if (!supabase) throw new Error('Supabase lama habayn. Ku dar VITE_SUPABASE_URL iyo VITE_SUPABASE_ANON_KEY.');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false },
    });
    if (error) throw error;
    return { sent: true };
  },

  async verifyEmailCode(email: string, code: string): Promise<boolean> {
    if (!supabase || !/^\d{6}$/.test(code.trim())) return false;
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    });
    return !error;
  },

  async loginWithEmail(email: string, password: string): Promise<UserProfile> {
    if (!supabase) throw new Error('Supabase lama habayn. Ku dar VITE_SUPABASE_URL iyo VITE_SUPABASE_ANON_KEY.');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error('Gelitaanka lama xaqiijin.');
    return loadSupabaseProfile(data.user);
  },

  async signUp(fullName: string, phone: string, email: string, password: string): Promise<UserProfile> {
    if (!supabase) throw new Error('Supabase lama habayn. Ku dar VITE_SUPABASE_URL iyo VITE_SUPABASE_ANON_KEY.');
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), phone: phone.trim() },
      },
    });
    if (error) throw error;
    if (!data.user) throw new Error('Akoonka lama abuuri karin.');
    if (data.session) return loadSupabaseProfile(data.user);
    return mapAuthProfile(data.user, {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: 'customer',
      phone_verified: false,
      email_verified: false,
      wallet_balance_usd: 0,
    });
  },

  async logout(): Promise<void> {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return;
    }
    writeStorage(STORAGE_KEYS.auth, false);
  },
};

export const storageService = {
  async uploadVerificationDoc(
    userId: string,
    role: UserRole,
    docType: string,
    fileName: string,
    mimeType = 'application/pdf'
  ): Promise<UploadedDocRef> {
    const res = await apiPost<{ storagePath: string; uploadedAt: string }>(
      '/api/storage/upload',
      { docType, fileName, mimeType },
      role,
      userId
    );
    return {
      docType,
      fileName,
      uploadedAt: res?.uploadedAt || new Date().toISOString(),
      storagePath: res?.storagePath || `${userId}/${docType}/${fileName}`,
    };
  },
};

export const paymentService = {
  getTransactions(): PaymentTransaction[] {
    return readStorage<PaymentTransaction[]>(STORAGE_KEYS.transactions, INITIAL_TRANSACTIONS);
  },

  saveTransactions(txns: PaymentTransaction[]): PaymentTransaction[] {
    writeStorage(STORAGE_KEYS.transactions, txns);
    return txns;
  },

  async authorizeOrderPayment(payload: {
    userId: string;
    customerName: string;
    provider: PaymentMethodId;
    amountUsd: number;
    orderNumber: string;
  }): Promise<{
    transaction: PaymentTransaction;
    status: PaymentStatus;
    isTestMode: boolean;
    reference: string;
  }> {
    const remote = await apiPost<{
      transactionId: string;
      status: PaymentStatus;
      isTestMode: boolean;
    }>(
      '/api/payments/intent',
      {
        provider: payload.provider,
        amountUsd: payload.amountUsd,
        orderReference: payload.orderNumber,
      },
      'customer',
      payload.userId
    );

    const isCod = payload.provider === 'cash_on_delivery';
    const isTestMode = remote ? remote.isTestMode : !isCod;
    const status: PaymentStatus =
      remote?.status || (isCod ? 'pending_cod' : 'authorized_test');
    const reference =
      remote?.transactionId ||
      (isCod
        ? `COD-${payload.orderNumber}`
        : `TEST-${payload.provider.toUpperCase()}-${Date.now().toString().slice(-5)}`);

    const transaction: PaymentTransaction = {
      id: `txn-${Date.now()}`,
      orderNumber: payload.orderNumber,
      userId: payload.userId,
      customerName: payload.customerName,
      provider: payload.provider,
      amountUsd: payload.amountUsd,
      currency: 'USD',
      status,
      isTestMode,
      reference,
      createdAt: new Date().toISOString(),
    };

    const current = paymentService.getTransactions();
    paymentService.saveTransactions([transaction, ...current]);
    return { transaction, status, isTestMode, reference };
  },
};

export const profileService = {
  getAddresses(): Address[] {
    return readStorage<Address[]>(STORAGE_KEYS.addresses, INITIAL_ADDRESSES);
  },

  saveAddresses(addresses: Address[]): Address[] {
    writeStorage(STORAGE_KEYS.addresses, addresses);
    return addresses;
  },

  updateUserProfile(user: UserProfile): UserProfile {
    const updated = {
      ...user,
      avatarInitials: getInitials(user.fullName),
    };
    writeStorage(STORAGE_KEYS.user, updated);
    return updated;
  },

  getFavoriteStoreIds(): string[] {
    return readStorage<string[]>(STORAGE_KEYS.favorites, ['store-saffron', 'store-careplus']);
  },

  saveFavoriteStoreIds(ids: string[]): string[] {
    writeStorage(STORAGE_KEYS.favorites, ids);
    return ids;
  },

  getNotifications(): NotificationItem[] {
    return readStorage<NotificationItem[]>(STORAGE_KEYS.notifications, INITIAL_NOTIFICATIONS);
  },

  saveNotifications(items: NotificationItem[]): NotificationItem[] {
    writeStorage(STORAGE_KEYS.notifications, items);
    return items;
  },

  getLanguage(): 'en' | 'so' {
    return readStorage<'en' | 'so'>(STORAGE_KEYS.language, 'en');
  },

  saveLanguage(lang: 'en' | 'so'): void {
    writeStorage(STORAGE_KEYS.language, lang);
  },
};

export const cartService = {
  getCart(): CartItem[] {
    return readStorage<CartItem[]>(STORAGE_KEYS.cart, []);
  },
  saveCart(items: CartItem[]): CartItem[] {
    writeStorage(STORAGE_KEYS.cart, items);
    return items;
  },
};

export const orderService = {
  getOrders(): Order[] {
    return readStorage<Order[]>(STORAGE_KEYS.orders, INITIAL_ORDERS);
  },

  saveOrders(orders: Order[]): Order[] {
    writeStorage(STORAGE_KEYS.orders, orders);
    return orders;
  },

  async createOrder(payload: {
    user: UserProfile;
    items: CartItem[];
    store?: Store;
    deliveryAddress: Address;
    customerPhone: string;
    orderNotes?: string;
    paymentMethod: PaymentMethodId;
    deliveryFee: number;
    serviceFee: number;
    discountAmount: number;
    couponCode?: string;
    commissionRatePct: number;
  }): Promise<{ order: Order; transaction: PaymentTransaction }> {
    const subtotal = payload.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const total = Math.max(
      0,
      Number(
        (subtotal + payload.deliveryFee + payload.serviceFee - payload.discountAmount).toFixed(2)
      )
    );
    const orderNumber = `QG-BRC-${Math.floor(1000 + Math.random() * 8999)}`;

    const paymentResult = await paymentService.authorizeOrderPayment({
      userId: payload.user.id,
      customerName: payload.user.fullName,
      provider: payload.paymentMethod,
      amountUsd: total,
      orderNumber,
    });

    const storeCoords: GPSPoint = payload.store?.coordinates || {
      lat: 9.5221,
      lng: 45.5336,
      label: payload.items[0]?.product.storeName || 'Burco Center',
    };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: payload.user.id,
      customerName: payload.user.fullName,
      storeId: payload.items[0]?.product.storeId || 'store-saffron',
      storeName: payload.items[0]?.product.storeName || 'QuickGo Partner',
      storeCoordinates: storeCoords,
      items: payload.items,
      subtotal,
      deliveryFee: payload.deliveryFee,
      serviceFee: payload.serviceFee,
      discountAmount: payload.discountAmount,
      couponCode: payload.couponCode,
      total,
      commissionRatePct: payload.commissionRatePct,
      status: 'confirmed',
      refundStatus: 'none',
      createdAt: new Date().toISOString(),
      estimatedMinutes: 26,
      deliveryAddress: payload.deliveryAddress,
      customerPhone: payload.customerPhone,
      orderNotes: payload.orderNotes,
      paymentMethod: payload.paymentMethod,
      paymentStatus: paymentResult.status,
      paymentIsTestMode: paymentResult.isTestMode,
      paymentReference: paymentResult.reference,
      driver: {
        ...INITIAL_DRIVERS[0],
        currentGps: { ...storeCoords },
      },
    };

    const current = orderService.getOrders();
    orderService.saveOrders([newOrder, ...current]);
    await apiPost('/api/orders/broadcast', {
      orderId: newOrder.id,
      status: newOrder.status,
      gps: newOrder.driver?.currentGps,
    });

    return { order: newOrder, transaction: paymentResult.transaction };
  },

  async createParcelOrder(payload: {
    user: UserProfile;
    pickupAddress: string;
    dropoffAddress: string;
    recipientName: string;
    recipientPhone: string;
    packageSize: 'small' | 'medium' | 'large';
    fare: number;
    paymentMethod: PaymentMethodId;
    commissionRatePct: number;
  }): Promise<{ order: Order; transaction: PaymentTransaction }> {
    const orderNumber = `QG-BRC-${Math.floor(1000 + Math.random() * 8999)}`;
    const sizeLabel =
      payload.packageSize === 'small'
        ? 'Small Parcel (Documents / Keys)'
        : payload.packageSize === 'medium'
          ? 'Medium Box (up to 5 kg)'
          : 'Large Parcel (up to 15 kg)';

    const total = Number((payload.fare + 0.5).toFixed(2));
    const paymentResult = await paymentService.authorizeOrderPayment({
      userId: payload.user.id,
      customerName: payload.user.fullName,
      provider: payload.paymentMethod,
      amountUsd: total,
      orderNumber,
    });

    const pickupGps: GPSPoint = { lat: 9.5218, lng: 45.5331, label: 'Pickup · Burco' };
    const dropoffGps: GPSPoint = { lat: 9.5305, lng: 45.5426, label: 'Dropoff · Burco' };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: payload.user.id,
      customerName: payload.user.fullName,
      storeId: 'parcel-express',
      storeName: 'QuickGo Parcel Express',
      storeCoordinates: pickupGps,
      items: [
        {
          id: `parcel-item-${Date.now()}`,
          quantity: 1,
          product: {
            id: 'parcel-svc',
            storeId: 'parcel-express',
            storeName: 'QuickGo Parcel Express',
            name: { en: sizeLabel, so: sizeLabel },
            description: {
              en: `${payload.pickupAddress} → ${payload.dropoffAddress}`,
              so: `${payload.pickupAddress} → ${payload.dropoffAddress}`,
            },
            category: 'Parcel',
            price: payload.fare,
            image: '',
            inStock: true,
          },
        },
      ],
      subtotal: payload.fare,
      deliveryFee: 0,
      serviceFee: 0.5,
      discountAmount: 0,
      total,
      commissionRatePct: payload.commissionRatePct,
      status: 'driver_assigned',
      refundStatus: 'none',
      createdAt: new Date().toISOString(),
      estimatedMinutes: 30,
      deliveryAddress: {
        id: 'parcel-dest',
        label: payload.recipientName,
        street: payload.dropoffAddress,
        district: 'Burco',
        zoneId: 'zone-october',
        city: 'Burco',
        coordinates: dropoffGps,
        isDefault: false,
      },
      customerPhone: payload.user.phone,
      paymentMethod: payload.paymentMethod,
      paymentStatus: paymentResult.status,
      paymentIsTestMode: paymentResult.isTestMode,
      paymentReference: paymentResult.reference,
      isParcel: true,
      parcelDetails: {
        pickupAddress: payload.pickupAddress,
        dropoffAddress: payload.dropoffAddress,
        packageSize: sizeLabel,
        recipientName: payload.recipientName,
        recipientPhone: payload.recipientPhone,
      },
      driver: {
        ...INITIAL_DRIVERS[1],
        currentGps: { lat: 9.5245, lng: 45.5355 },
      },
    };

    const current = orderService.getOrders();
    orderService.saveOrders([newOrder, ...current]);
    return { order: newOrder, transaction: paymentResult.transaction };
  },

  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    extra?: { cancellationReason?: string; refundStatus?: RefundStatus; driver?: DriverInfo }
  ): Order[] {
    const orders = orderService.getOrders();
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      let nextEta = order.estimatedMinutes;
      if (status === 'delivered' || status === 'cancelled') nextEta = 0;
      else if (status === 'picked_up') nextEta = 10;
      else if (status === 'driver_assigned') nextEta = 16;
      else if (status === 'preparing') nextEta = 22;

      return {
        ...order,
        status,
        estimatedMinutes: nextEta,
        cancellationReason: extra?.cancellationReason ?? order.cancellationReason,
        refundStatus: extra?.refundStatus ?? order.refundStatus,
        driver: extra?.driver ?? order.driver,
      };
    });
    orderService.saveOrders(updated);
    apiPost('/api/orders/broadcast', { orderId, status });
    return updated;
  },

  stepOrderGps(orderId: string): Order[] {
    const orders = orderService.getOrders();
    const updated = orders.map((order) => {
      if (order.id !== orderId || !order.driver) return order;
      if (order.status !== 'picked_up' && order.status !== 'driver_assigned') return order;

      const target =
        order.status === 'driver_assigned'
          ? order.storeCoordinates
          : order.deliveryAddress.coordinates;
      const cur = order.driver.currentGps;
      const nextLat = cur.lat + (target.lat - cur.lat) * 0.22;
      const nextLng = cur.lng + (target.lng - cur.lng) * 0.22;

      return {
        ...order,
        estimatedMinutes: Math.max(2, order.estimatedMinutes - 1),
        driver: {
          ...order.driver,
          currentGps: { lat: Number(nextLat.toFixed(5)), lng: Number(nextLng.toFixed(5)) },
        },
      };
    });
    return orderService.saveOrders(updated);
  },
};

export const platformService = {
  getDriverApplications(): DriverApplication[] {
    return readStorage<DriverApplication[]>(STORAGE_KEYS.driverApps, INITIAL_DRIVER_APPLICATIONS);
  },
  saveDriverApplications(apps: DriverApplication[]): DriverApplication[] {
    writeStorage(STORAGE_KEYS.driverApps, apps);
    return apps;
  },
  getMerchantApplications(): MerchantApplication[] {
    return readStorage<MerchantApplication[]>(
      STORAGE_KEYS.merchantApps,
      INITIAL_MERCHANT_APPLICATIONS
    );
  },
  saveMerchantApplications(apps: MerchantApplication[]): MerchantApplication[] {
    writeStorage(STORAGE_KEYS.merchantApps, apps);
    return apps;
  },
  getReviews(): StoreReview[] {
    return readStorage<StoreReview[]>(STORAGE_KEYS.reviews, INITIAL_REVIEWS);
  },
  saveReviews(reviews: StoreReview[]): StoreReview[] {
    writeStorage(STORAGE_KEYS.reviews, reviews);
    return reviews;
  },
  getTickets(): SupportTicket[] {
    return readStorage<SupportTicket[]>(STORAGE_KEYS.tickets, INITIAL_TICKETS);
  },
  saveTickets(tickets: SupportTicket[]): SupportTicket[] {
    writeStorage(STORAGE_KEYS.tickets, tickets);
    return tickets;
  },
  getFraudAlerts(): FraudAlert[] {
    return readStorage<FraudAlert[]>(STORAGE_KEYS.fraud, INITIAL_FRAUD_ALERTS);
  },
  saveFraudAlerts(alerts: FraudAlert[]): FraudAlert[] {
    writeStorage(STORAGE_KEYS.fraud, alerts);
    return alerts;
  },
  getSettings(): PlatformSettings {
    return readStorage<PlatformSettings>(STORAGE_KEYS.settings, INITIAL_SETTINGS);
  },
  saveSettings(settings: PlatformSettings): PlatformSettings {
    writeStorage(STORAGE_KEYS.settings, settings);
    apiPost('/api/admin/commission', { commissionPct: settings.commissionRatePct }, 'admin');
    return settings;
  },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'QG';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function capitalizeWords(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
