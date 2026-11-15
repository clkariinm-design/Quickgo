import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { t, TranslationKey } from '../i18n/translations';
import {
  authService,
  cartService,
  catalogService,
  orderService,
  paymentService,
  platformService,
  profileService,
  storageService,
} from '../services/api';
import {
  Address,
  AppPortal,
  CartItem,
  Coupon,
  DeliveryZone,
  DriverApplication,
  FraudAlert,
  Language,
  MerchantApplication,
  NavTab,
  NotificationItem,
  Order,
  OrderStatus,
  PaymentMethodId,
  PaymentTransaction,
  PlatformSettings,
  Product,
  PromoBanner,
  RefundStatus,
  ServiceCategory,
  ServiceCategoryId,
  Store,
  StoreReview,
  SupportTicket,
  UserProfile,
  VerificationStatus,
} from '../types';

interface AppContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  tr: (key: TranslationKey) => string;

  // Portal & Navigation
  activePortal: AppPortal;
  setActivePortal: (portal: AppPortal) => void;
  showSplash: boolean;
  dismissSplash: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  // Catalog & Burco Zones
  categories: ServiceCategory[];
  banners: PromoBanner[];
  stores: Store[];
  products: Product[];
  deliveryZones: DeliveryZone[];
  coupons: Coupon[];
  selectedCategory: ServiceCategoryId;
  setSelectedCategory: (cat: ServiceCategoryId) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Modals & Screens
  selectedStoreId: string | null;
  openStore: (storeId: string) => void;
  closeStore: () => void;
  selectedProduct: Product | null;
  openProduct: (product: Product) => void;
  closeProduct: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  activeOrderId: string | null;
  openOrderTracking: (orderId: string) => void;
  closeOrderTracking: () => void;
  isLocationSheetOpen: boolean;
  openLocationSheet: () => void;
  closeLocationSheet: () => void;
  isAuthOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  isParcelOpen: boolean;
  openParcelModal: () => void;
  closeParcelModal: () => void;
  isNotificationsOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;

  // Auth & Customer Verification
  isAuthenticated: boolean;
  user: UserProfile;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, phone: string, email: string, password: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<{ demoCodeHint?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<boolean>;
  sendEmailVerification: (email: string) => Promise<{ demoCodeHint?: string }>;
  verifyEmailCode: (email: string, code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updated: UserProfile) => void;
  topUpWalletTestMode: (amountUsd: number) => void;
  claimReferralBonus: () => void;

  // Addresses
  addresses: Address[];
  selectedAddress: Address;
  selectAddress: (addressId: string) => void;
  addAddress: (addr: Omit<Address, 'id'>) => void;
  setDefaultAddress: (addressId: string) => void;

  // Cart & Coupons
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  deliveryFee: number;
  serviceFee: number;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  cartTotal: number;
  applyCouponCode: (code: string) => boolean;
  removeCoupon: () => void;
  addToCart: (product: Product, quantity?: number, note?: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeCartItem: (cartItemId: string) => void;
  clearCart: () => void;

  // Orders & Real-Time GPS
  orders: Order[];
  placeOrder: (payload: {
    customerPhone: string;
    orderNotes?: string;
    paymentMethod: PaymentMethodId;
  }) => Promise<Order>;
  placeParcelOrder: (payload: {
    pickupAddress: string;
    dropoffAddress: string;
    recipientName: string;
    recipientPhone: string;
    packageSize: 'small' | 'medium' | 'large';
    fare: number;
    paymentMethod: PaymentMethodId;
  }) => Promise<Order>;
  advanceOrderStatus: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  requestRefund: (orderId: string) => void;
  resolveRefund: (orderId: string, status: RefundStatus) => void;
  stepOrderGps: (orderId: string) => void;
  reorderOrder: (order: Order) => void;

  // Reviews, Support, Transactions
  reviews: StoreReview[];
  submitReview: (payload: {
    orderId: string;
    storeId: string;
    storeRating: number;
    driverRating: number;
    comment: string;
  }) => void;
  tickets: SupportTicket[];
  submitSupportTicket: (payload: { orderNumber?: string; subject: string; message: string }) => void;
  resolveSupportTicket: (ticketId: string) => void;
  transactions: PaymentTransaction[];

  // Driver, Merchant & Admin Portals
  driverApplications: DriverApplication[];
  submitDriverApplication: (payload: {
    fullName: string;
    phone: string;
    vehicleType: string;
    plateNumber: string;
    operatingZone: string;
    idFileName: string;
    licenseFileName: string;
    vehicleFileName: string;
  }) => Promise<void>;
  reviewDriverApplication: (appId: string, status: VerificationStatus, notes?: string) => void;
  toggleDriverAvailability: (appId: string) => void;

  merchantApplications: MerchantApplication[];
  submitMerchantApplication: (payload: {
    ownerName: string;
    ownerPhone: string;
    businessName: string;
    category: Exclude<ServiceCategoryId, 'all' | 'parcel'>;
    neighborhood: string;
    licenseNumber: string;
    openingHours: string;
    ownerIdFileName: string;
    businessLicenseFileName: string;
  }) => Promise<void>;
  reviewMerchantApplication: (appId: string, status: VerificationStatus, notes?: string) => void;
  toggleStoreOpen: (storeId: string) => void;

  fraudAlerts: FraudAlert[];
  resolveFraudAlert: (alertId: string) => void;
  platformSettings: PlatformSettings;
  updatePlatformCommission: (pct: number) => void;

  // Favorites & Notifications
  favoriteStoreIds: string[];
  toggleFavoriteStore: (storeId: string) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markAllNotificationsRead: () => void;
  pushNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;

  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => profileService.getLanguage());
  const [activePortal, setActivePortal] = useState<AppPortal>('customer');
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTabState] = useState<NavTab>('home');

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const deliveryZones = useMemo(() => catalogService.getDeliveryZones(), []);
  const coupons = useMemo(() => catalogService.getCoupons(), []);

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryId>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isParcelOpen, setIsParcelOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const session = useMemo(() => authService.getSession(), []);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(session.isAuthenticated);
  const [user, setUser] = useState<UserProfile>(session.user);

  useEffect(() => {
    let active = true;
    authService.getAuthenticatedUser().then((currentUser) => {
      if (!active || !currentUser) return;
      setUser(currentUser);
      setIsAuthenticated(true);
    }).catch(() => {
      if (active) setIsAuthenticated(false);
    });
    return () => { active = false; };
  }, []);

  const [addresses, setAddresses] = useState<Address[]>(() => profileService.getAddresses());
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const list = profileService.getAddresses();
    return list.find((a) => a.isDefault)?.id || list[0]?.id || '';
  });

  const [cart, setCart] = useState<CartItem[]>(() => cartService.getCart());
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [orders, setOrders] = useState<Order[]>(() => orderService.getOrders());
  const [favoriteStoreIds, setFavoriteStoreIds] = useState<string[]>(() =>
    profileService.getFavoriteStoreIds()
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    profileService.getNotifications()
  );

  const [driverApplications, setDriverApplications] = useState<DriverApplication[]>(() =>
    platformService.getDriverApplications()
  );
  const [merchantApplications, setMerchantApplications] = useState<MerchantApplication[]>(() =>
    platformService.getMerchantApplications()
  );
  const [reviews, setReviews] = useState<StoreReview[]>(() => platformService.getReviews());
  const [tickets, setTickets] = useState<SupportTicket[]>(() => platformService.getTickets());
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() =>
    paymentService.getTransactions()
  );
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>(() =>
    platformService.getFraudAlerts()
  );
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() =>
    platformService.getSettings()
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      catalogService.getCategories(),
      catalogService.getPromoBanners(),
      catalogService.getStores(),
      catalogService.getProducts(),
    ]).then(([cats, bans, strs, prods]) => {
      if (!mounted) return;
      setCategories(cats);
      setBanners(bans);
      setStores(strs);
      setProducts(prods);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!showSplash) return;
    const timer = window.setTimeout(() => setShowSplash(false), 1250);
    return () => window.clearTimeout(timer);
  }, [showSplash]);

  // Connect to SSE real-time order updates stream
  useEffect(() => {
    const evtSource = new EventSource('/api/orders/stream');
    evtSource.addEventListener('order_update', () => {
      setOrders(orderService.getOrders());
    });
    return () => {
      evtSource.close();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  const pushNotification = (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => profileService.saveNotifications([newItem, ...prev]));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    profileService.saveLanguage(lang);
  };

  const tr = (key: TranslationKey) => t(language, key);

  const setActiveTab = (tab: NavTab) => {
    setSelectedStoreId(null);
    setActiveOrderId(null);
    setIsCheckoutOpen(false);
    setActiveTabState(tab);
  };

  const selectedAddress = useMemo(() => {
    return (
      addresses.find((a) => a.id === selectedAddressId) ||
      addresses.find((a) => a.isDefault) ||
      addresses[0]
    );
  }, [addresses, selectedAddressId]);

  const selectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setIsLocationSheetOpen(false);
  };

  const addAddress = (addr: Omit<Address, 'id'>) => {
    const newAddr: Address = { ...addr, id: `addr-${Date.now()}` };
    const next = addr.isDefault
      ? addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddr)
      : [...addresses, newAddr];
    setAddresses(profileService.saveAddresses(next));
    setSelectedAddressId(newAddr.id);
    showToast(tr('addressAddedToast'));
  };

  const setDefaultAddress = (addressId: string) => {
    const next = addresses.map((a) => ({ ...a, isDefault: a.id === addressId }));
    setAddresses(profileService.saveAddresses(next));
    setSelectedAddressId(addressId);
  };

  const loginWithEmail = async (email: string, password: string) => {
    const loggedUser = await authService.loginWithEmail(email, password);
    setUser(loggedUser);
    setIsAuthenticated(true);
    setIsAuthOpen(false);
  };

  const signUp = async (fullName: string, phone: string, email: string, password: string) => {
    const created = await authService.signUp(fullName, phone, email, password);
    setUser(created);
    const currentUser = await authService.getAuthenticatedUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsAuthOpen(false);
    } else {
      setIsAuthenticated(false);
      showToast('Akoonka waa la sameeyay. Fadlan iimaylkaaga ka xaqiiji, dabadeed soo gal.');
    }
  };

  const sendPhoneOtp = async (phone: string) => {
    const res = await authService.sendPhoneOtp(phone);
    pushNotification({
      category: 'otp',
      title: { en: 'QuickGo OTP Sent', so: 'Koodhka QuickGo Waa La Diray' },
      message: {
        en: `A verification code was requested for ${phone}. Check your SMS messages.`,
        so: `Koodh xaqiijin ayaa loo diray ${phone}. Ka eeg farriimaha SMS-ka.`,
      },
    });
    return res;
  };

  const verifyOtp = async (phone: string, code: string) => {
    const res = await authService.verifyPhoneOtp(phone, code);
    if (res.ok && res.user) {
      setUser(res.user);
      setIsAuthenticated(true);
      setIsAuthOpen(false);
      showToast('Phone verified via OTP.');
      return true;
    }
    return false;
  };

  const sendEmailVerification = async (email: string) => {
    const res = await authService.sendEmailVerification(email);
    pushNotification({
      category: 'otp',
      title: { en: 'Email Verification Sent', so: 'Xaqiijinta Iimaylka Waa La Diray' },
      message: {
        en: `A verification code was requested for ${email}. Check your inbox.`,
        so: `Koodh xaqiijin ayaa loo diray ${email}. Ka eeg sanduuqa iimaylka.`,
      },
    });
    return res;
  };

  const verifyEmailCode = async (email: string, code: string) => {
    const ok = await authService.verifyEmailCode(email, code);
    if (ok) {
      const currentUser = await authService.getAuthenticatedUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        setIsAuthOpen(false);
      } else {
        const updated = profileService.updateUserProfile({ ...user, email, emailVerified: true });
        setUser(updated);
      }
      showToast('Email verified.');
    }
    return ok;
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setActivePortal('customer');
    setIsAuthOpen(true);
  };

  const updateProfile = (updated: UserProfile) => {
    const saved = profileService.updateUserProfile(updated);
    setUser(saved);
    showToast(tr('profileUpdatedToast'));
  };

  const topUpWalletTestMode = (amountUsd: number) => {
    if (amountUsd <= 0) return;
    const saved = profileService.updateUserProfile({
      ...user,
      walletBalanceUsd: Number((user.walletBalanceUsd + amountUsd).toFixed(2)),
    });
    setUser(saved);
    const txn: PaymentTransaction = {
      id: `txn-topup-${Date.now()}`,
      orderNumber: 'WALLET-TOPUP',
      userId: user.id,
      customerName: user.fullName,
      provider: 'zaad',
      amountUsd,
      currency: 'USD',
      status: 'authorized_test',
      isTestMode: true,
      reference: `TEST-TOPUP-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions(paymentService.saveTransactions([txn, ...transactions]));
    showToast(`Test Mode: +$${amountUsd.toFixed(2)} added to QuickGo Wallet.`);
  };

  const claimReferralBonus = () => {
    const saved = profileService.updateUserProfile({
      ...user,
      walletBalanceUsd: Number((user.walletBalanceUsd + 3.0).toFixed(2)),
      referralRewardsUsd: Number((user.referralRewardsUsd + 3.0).toFixed(2)),
    });
    setUser(saved);
    showToast('$3.00 referral reward credited to your QuickGo Wallet.');
  };

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const cartSubtotal = useMemo(
    () => Number(cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2)),
    [cart]
  );

  const deliveryFee = useMemo(() => {
    if (cart.length === 0) return 0;
    if (appliedCoupon?.discountType === 'free_delivery' && cartSubtotal >= appliedCoupon.minOrderUsd) {
      return 0;
    }
    const zone = deliveryZones.find((z) => z.id === selectedAddress?.zoneId);
    return zone ? zone.deliveryFeeUsd : 1.5;
  }, [cart, cartSubtotal, appliedCoupon, deliveryZones, selectedAddress]);

  const serviceFee = useMemo(() => (cart.length === 0 ? 0 : 0.75), [cart]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon || cartSubtotal < appliedCoupon.minOrderUsd) return 0;
    if (appliedCoupon.discountType === 'percent') {
      return Number(((cartSubtotal * appliedCoupon.discountValue) / 100).toFixed(2));
    }
    if (appliedCoupon.discountType === 'fixed') {
      return Math.min(cartSubtotal, appliedCoupon.discountValue);
    }
    return 0;
  }, [appliedCoupon, cartSubtotal]);

  const cartTotal = useMemo(
    () =>
      Math.max(
        0,
        Number((cartSubtotal + deliveryFee + serviceFee - discountAmount).toFixed(2))
      ),
    [cartSubtotal, deliveryFee, serviceFee, discountAmount]
  );

  const applyCouponCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    const match = coupons.find((c) => c.code === clean);
    if (!match || cartSubtotal < match.minOrderUsd) {
      showToast(tr('invalidCoupon'));
      return false;
    }
    setAppliedCoupon(match);
    showToast(`${tr('couponApplied')}: ${match.code}`);
    return true;
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const addToCart = (product: Product, quantity = 1, note?: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const next = existing
        ? prev.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + quantity, note: note || i.note }
              : i
          )
        : [
            ...prev,
            {
              id: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              product,
              quantity,
              note,
            },
          ];
      return cartService.saveCart(next);
    });
    showToast(`${product.name[language]} · ${tr('added')}`);
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      cartService.saveCart(
        prev
          .map((item) =>
            item.id === cartItemId ? { ...item, quantity: item.quantity + delta } : item
          )
          .filter((item) => item.quantity > 0)
      )
    );
  };

  const removeCartItem = (cartItemId: string) => {
    setCart((prev) => cartService.saveCart(prev.filter((item) => item.id !== cartItemId)));
  };

  const clearCart = () => {
    setCart(cartService.saveCart([]));
    setAppliedCoupon(null);
  };

  const placeOrder = async (payload: {
    customerPhone: string;
    orderNotes?: string;
    paymentMethod: PaymentMethodId;
  }) => {
    const store = stores.find((s) => s.id === cart[0]?.product.storeId);

    if (payload.paymentMethod === 'wallet' && user.walletBalanceUsd >= cartTotal) {
      const saved = profileService.updateUserProfile({
        ...user,
        walletBalanceUsd: Number((user.walletBalanceUsd - cartTotal).toFixed(2)),
      });
      setUser(saved);
    }

    const { order, transaction } = await orderService.createOrder({
      user,
      items: cart,
      store,
      deliveryAddress: selectedAddress,
      customerPhone: payload.customerPhone,
      orderNotes: payload.orderNotes,
      paymentMethod: payload.paymentMethod,
      deliveryFee,
      serviceFee,
      discountAmount,
      couponCode: appliedCoupon?.code,
      commissionRatePct: platformSettings.commissionRatePct,
    });

    setOrders(orderService.getOrders());
    setTransactions([transaction, ...transactions]);
    clearCart();
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setActiveTabState('orders');
    setActiveOrderId(order.id);

    pushNotification({
      category: 'payment',
      title: {
        en: `Order ${order.orderNumber} Confirmed`,
        so: `Dalabka ${order.orderNumber} Waa La Xaqiijiyay`,
      },
      message: {
        en: `${order.storeName} received your order (${transaction.isTestMode ? 'Test Mode' : 'COD'}: $${order.total.toFixed(2)}).`,
        so: `${order.storeName} wuxuu helay dalabkaaga ($${order.total.toFixed(2)}).`,
      },
      orderId: order.id,
    });
    return order;
  };

  const placeParcelOrder = async (payload: {
    pickupAddress: string;
    dropoffAddress: string;
    recipientName: string;
    recipientPhone: string;
    packageSize: 'small' | 'medium' | 'large';
    fare: number;
    paymentMethod: PaymentMethodId;
  }) => {
    const { order, transaction } = await orderService.createParcelOrder({
      user,
      ...payload,
      commissionRatePct: platformSettings.commissionRatePct,
    });
    setOrders(orderService.getOrders());
    setTransactions([transaction, ...transactions]);
    setIsParcelOpen(false);
    setActiveTabState('orders');
    setActiveOrderId(order.id);
    pushNotification({
      category: 'driver',
      title: { en: `Parcel Courier Assigned`, so: `Darawalka Xirmada La Magacaabay` },
      message: {
        en: `Courier ${order.driver?.name} is heading to ${payload.pickupAddress}.`,
        so: `Darawalka ${order.driver?.name} wuxuu ku sii jeedaa ${payload.pickupAddress}.`,
      },
      orderId: order.id,
    });
    return order;
  };

  const advanceOrderStatus = (orderId: string) => {
    const flow: OrderStatus[] = [
      'confirmed',
      'preparing',
      'driver_assigned',
      'picked_up',
      'delivered',
    ];
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;
    const idx = flow.indexOf(target.status);
    if (idx === -1 || idx === flow.length - 1) return;
    const nextStatus = flow[idx + 1];
    updateOrderStatus(orderId, nextStatus);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, reason?: string) => {
    const updated = orderService.updateOrderStatus(orderId, status, {
      cancellationReason: reason,
    });
    setOrders(updated);
    const target = updated.find((o) => o.id === orderId);
    if (target) {
      pushNotification({
        category: 'order',
        title: {
          en: `Order ${target.orderNumber}: ${status.replace('_', ' ')}`,
          so: `Dalabka ${target.orderNumber}: ${status.replace('_', ' ')}`,
        },
        message: {
          en: `${target.storeName} order status updated to ${status.replace('_', ' ')}.`,
          so: `Xaaladda dalabka ${target.storeName} waa la cusboonaysiiyay.`,
        },
        orderId,
      });
    }
  };

  const cancelOrder = (orderId: string, reason: string) => {
    const target = orders.find((o) => o.id === orderId);
    const autoRefund: RefundStatus =
      target && target.paymentStatus !== 'pending_cod' ? 'requested' : 'none';
    const updated = orderService.updateOrderStatus(orderId, 'cancelled', {
      cancellationReason: reason,
      refundStatus: autoRefund,
    });
    setOrders(updated);
    showToast('Order cancelled.');
  };

  const requestRefund = (orderId: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, refundStatus: 'requested' as RefundStatus } : o
    );
    setOrders(orderService.saveOrders(updated));
    showToast('Refund request sent to QuickGo Admin.');
  };

  const resolveRefund = (orderId: string, status: RefundStatus) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            refundStatus: status,
            paymentStatus: status === 'approved_refunded' ? 'refunded' : o.paymentStatus,
          }
        : o
    );
    setOrders(orderService.saveOrders(updatedOrders));
    const target = updatedOrders.find((o) => o.id === orderId);
    if (target && status === 'approved_refunded') {
      const updatedTxns = transactions.map((t) =>
        t.orderNumber === target.orderNumber ? { ...t, status: 'refunded' as const } : t
      );
      setTransactions(paymentService.saveTransactions(updatedTxns));
    }
    showToast(`Refund marked as ${status.replace('_', ' ')}.`);
  };

  const stepOrderGps = (orderId: string) => {
    setOrders(orderService.stepOrderGps(orderId));
  };

  const reorderOrder = (order: Order) => {
    if (order.isParcel) {
      setIsParcelOpen(true);
      return;
    }
    order.items.forEach((ci) => addToCart(ci.product, ci.quantity, ci.note));
    setIsCartOpen(true);
  };

  const submitReview = (payload: {
    orderId: string;
    storeId: string;
    storeRating: number;
    driverRating: number;
    comment: string;
  }) => {
    const newReview: StoreReview = {
      id: `rev-${Date.now()}`,
      storeId: payload.storeId,
      orderId: payload.orderId,
      customerName: user.fullName,
      storeRating: payload.storeRating,
      driverRating: payload.driverRating,
      comment: payload.comment.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const nextReviews = platformService.saveReviews([newReview, ...reviews]);
    setReviews(nextReviews);

    const nextOrders = orderService.saveOrders(
      orders.map((o) => (o.id === payload.orderId ? { ...o, isReviewed: true } : o))
    );
    setOrders(nextOrders);

    const storeReviews = nextReviews.filter((r) => r.storeId === payload.storeId);
    if (storeReviews.length > 0) {
      const nextStores = stores.map((s) =>
        s.id === payload.storeId
          ? {
              ...s,
              reviewCount: s.reviewCount + 1,
              rating: Number(
                (
                  (s.rating * s.reviewCount + payload.storeRating) /
                  (s.reviewCount + 1)
                ).toFixed(2)
              ),
            }
          : s
      );
      setStores(catalogService.saveStores(nextStores));
    }
    showToast('Thank you! Review published.');
  };

  const submitSupportTicket = (payload: {
    orderNumber?: string;
    subject: string;
    message: string;
  }) => {
    const ticket: SupportTicket = {
      id: `tkt-${Date.now().toString().slice(-4)}`,
      userId: user.id,
      customerName: user.fullName,
      orderNumber: payload.orderNumber,
      subject: payload.subject.trim(),
      message: payload.message.trim(),
      status: 'open',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTickets(platformService.saveTickets([ticket, ...tickets]));
    showToast('Support ticket submitted.');
  };

  const resolveSupportTicket = (ticketId: string) => {
    setTickets(
      platformService.saveTickets(
        tickets.map((t) => (t.id === ticketId ? { ...t, status: 'resolved' } : t))
      )
    );
  };

  const submitDriverApplication = async (payload: {
    fullName: string;
    phone: string;
    vehicleType: string;
    plateNumber: string;
    operatingZone: string;
    idFileName: string;
    licenseFileName: string;
    vehicleFileName: string;
  }) => {
    const [idDocument, licenseDocument, vehicleDocument] = await Promise.all([
      storageService.uploadVerificationDoc(user.id, 'driver', 'national_id', payload.idFileName),
      storageService.uploadVerificationDoc(
        user.id,
        'driver',
        'driving_license',
        payload.licenseFileName
      ),
      storageService.uploadVerificationDoc(user.id, 'driver', 'vehicle_reg', payload.vehicleFileName),
    ]);

    const app: DriverApplication = {
      id: `drv-app-${Date.now()}`,
      userId: user.id,
      fullName: payload.fullName.trim(),
      phone: payload.phone.trim(),
      vehicleType: payload.vehicleType.trim(),
      plateNumber: payload.plateNumber.trim().toUpperCase(),
      operatingZone: payload.operatingZone,
      idDocument,
      licenseDocument,
      vehicleDocument,
      status: 'pending',
      isAvailable: false,
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    setDriverApplications(platformService.saveDriverApplications([app, ...driverApplications]));
    showToast('Driver verification documents uploaded for Admin review.');
  };

  const reviewDriverApplication = (
    appId: string,
    status: VerificationStatus,
    notes?: string
  ) => {
    setDriverApplications(
      platformService.saveDriverApplications(
        driverApplications.map((d) =>
          d.id === appId
            ? {
                ...d,
                status,
                reviewerNotes: notes,
                isAvailable: status === 'approved' ? true : false,
              }
            : d
        )
      )
    );
    showToast(`Driver status updated to ${status}.`);
  };

  const toggleDriverAvailability = (appId: string) => {
    setDriverApplications(
      platformService.saveDriverApplications(
        driverApplications.map((d) =>
          d.id === appId ? { ...d, isAvailable: !d.isAvailable } : d
        )
      )
    );
  };

  const submitMerchantApplication = async (payload: {
    ownerName: string;
    ownerPhone: string;
    businessName: string;
    category: Exclude<ServiceCategoryId, 'all' | 'parcel'>;
    neighborhood: string;
    licenseNumber: string;
    openingHours: string;
    ownerIdFileName: string;
    businessLicenseFileName: string;
  }) => {
    const [ownerIdDoc, businessLicenseDoc] = await Promise.all([
      storageService.uploadVerificationDoc(user.id, 'merchant', 'owner_id', payload.ownerIdFileName),
      storageService.uploadVerificationDoc(
        user.id,
        'merchant',
        'business_license',
        payload.businessLicenseFileName
      ),
    ]);

    const app: MerchantApplication = {
      id: `mrc-app-${Date.now()}`,
      ownerId: user.id,
      ownerName: payload.ownerName.trim(),
      ownerPhone: payload.ownerPhone.trim(),
      businessName: payload.businessName.trim(),
      category: payload.category,
      neighborhood: payload.neighborhood,
      licenseNumber: payload.licenseNumber.trim(),
      openingHours: payload.openingHours.trim(),
      ownerIdDoc,
      businessLicenseDoc,
      status: 'pending',
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    setMerchantApplications(
      platformService.saveMerchantApplications([app, ...merchantApplications])
    );
    showToast('Merchant verification submitted to Admin Console.');
  };

  const reviewMerchantApplication = (
    appId: string,
    status: VerificationStatus,
    notes?: string
  ) => {
    const nextApps = platformService.saveMerchantApplications(
      merchantApplications.map((m) =>
        m.id === appId ? { ...m, status, reviewerNotes: notes } : m
      )
    );
    setMerchantApplications(nextApps);

    const target = nextApps.find((m) => m.id === appId);
    if (target && status === 'approved' && !stores.some((s) => s.name === target.businessName)) {
      const zone = deliveryZones.find((z) => z.neighborhood === target.neighborhood);
      const newStore: Store = {
        id: `store-${Date.now()}`,
        name: target.businessName,
        category: target.category,
        tagline: {
          en: `Verified Burco ${target.category} partner in ${target.neighborhood}`,
          so: `Ganacsade la xaqiijiyay oo ku yaal ${target.neighborhood}`,
        },
        logoInitials: target.businessName.slice(0, 2).toUpperCase(),
        logoBg: '#142B4A',
        coverImage: stores[0]?.coverImage || '',
        rating: 5.0,
        reviewCount: 1,
        deliveryTimeMin: zone?.etaMin || 20,
        deliveryTimeMax: zone?.etaMax || 32,
        deliveryFee: zone?.deliveryFeeUsd || 1.5,
        openingHours: target.openingHours,
        isOpen: true,
        isPopular: true,
        isVerified: true,
        neighborhood: target.neighborhood,
        city: 'Burco',
        coordinates: zone?.coordinates || { lat: 9.5221, lng: 45.5336 },
        distanceKm: 1.8,
        productCategories: ['Featured'],
      };
      setStores(catalogService.saveStores([newStore, ...stores]));
    }
    showToast(`Merchant ${status}.`);
  };

  const toggleStoreOpen = (storeId: string) => {
    setStores(
      catalogService.saveStores(
        stores.map((s) => (s.id === storeId ? { ...s, isOpen: !s.isOpen } : s))
      )
    );
  };

  const resolveFraudAlert = (alertId: string) => {
    setFraudAlerts(
      platformService.saveFraudAlerts(
        fraudAlerts.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
      )
    );
    showToast('Fraud alert marked resolved.');
  };

  const updatePlatformCommission = (pct: number) => {
    const next = platformService.saveSettings({
      ...platformSettings,
      commissionRatePct: pct,
    });
    setPlatformSettings(next);
    showToast(`Platform commission updated to ${pct}%.`);
  };

  const toggleFavoriteStore = (storeId: string) => {
    setFavoriteStoreIds((prev) => {
      const exists = prev.includes(storeId);
      return profileService.saveFavoriteStoreIds(
        exists ? prev.filter((id) => id !== storeId) : [...prev, storeId]
      );
    });
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAllNotificationsRead = () => {
    setNotifications(
      profileService.saveNotifications(notifications.map((n) => ({ ...n, read: true })))
    );
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        tr,
        activePortal,
        setActivePortal,
        showSplash,
        dismissSplash: () => setShowSplash(false),
        activeTab,
        setActiveTab,
        categories,
        banners,
        stores,
        products,
        deliveryZones,
        coupons,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedStoreId,
        openStore: (id) => {
          setSelectedStoreId(id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        closeStore: () => setSelectedStoreId(null),
        selectedProduct,
        openProduct: (prod) => setSelectedProduct(prod),
        closeProduct: () => setSelectedProduct(null),
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        isCheckoutOpen,
        openCheckout: () => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        },
        closeCheckout: () => setIsCheckoutOpen(false),
        activeOrderId,
        openOrderTracking: (id) => {
          setActivePortal('customer');
          setActiveTabState('orders');
          setActiveOrderId(id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        closeOrderTracking: () => setActiveOrderId(null),
        isLocationSheetOpen,
        openLocationSheet: () => setIsLocationSheetOpen(true),
        closeLocationSheet: () => setIsLocationSheetOpen(false),
        isAuthOpen,
        openAuth: () => setIsAuthOpen(true),
        closeAuth: () => setIsAuthOpen(false),
        isParcelOpen,
        openParcelModal: () => setIsParcelOpen(true),
        closeParcelModal: () => setIsParcelOpen(false),
        isNotificationsOpen,
        openNotifications: () => setIsNotificationsOpen(true),
        closeNotifications: () => setIsNotificationsOpen(false),
        isAuthenticated,
        user,
        loginWithEmail,
        signUp,
        sendPhoneOtp,
        verifyOtp,
        sendEmailVerification,
        verifyEmailCode,
        logout,
        updateProfile,
        topUpWalletTestMode,
        claimReferralBonus,
        addresses,
        selectedAddress,
        selectAddress,
        addAddress,
        setDefaultAddress,
        cart,
        cartCount,
        cartSubtotal,
        deliveryFee,
        serviceFee,
        appliedCoupon,
        discountAmount,
        cartTotal,
        applyCouponCode,
        removeCoupon,
        addToCart,
        updateCartQuantity,
        removeCartItem,
        clearCart,
        orders,
        placeOrder,
        placeParcelOrder,
        advanceOrderStatus,
        updateOrderStatus,
        cancelOrder,
        requestRefund,
        resolveRefund,
        stepOrderGps,
        reorderOrder,
        reviews,
        submitReview,
        tickets,
        submitSupportTicket,
        resolveSupportTicket,
        transactions,
        driverApplications,
        submitDriverApplication,
        reviewDriverApplication,
        toggleDriverAvailability,
        merchantApplications,
        submitMerchantApplication,
        reviewMerchantApplication,
        toggleStoreOpen,
        fraudAlerts,
        resolveFraudAlert,
        platformSettings,
        updatePlatformCommission,
        favoriteStoreIds,
        toggleFavoriteStore,
        notifications,
        unreadCount,
        markAllNotificationsRead,
        pushNotification,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
