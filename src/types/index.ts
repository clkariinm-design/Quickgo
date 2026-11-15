export type Language = 'en' | 'so';

export type NavTab = 'home' | 'search' | 'orders' | 'favorites' | 'profile';

export type AppPortal = 'customer' | 'driver' | 'merchant' | 'admin';

export type UserRole = 'customer' | 'driver' | 'merchant' | 'admin';

export type VerificationStatus = 'unverified' | 'pending' | 'approved' | 'rejected';

export type ServiceCategoryId =
  | 'all'
  | 'food'
  | 'supermarket'
  | 'pharmacy'
  | 'fashion'
  | 'electronics'
  | 'groceries'
  | 'parcel';

export type AuthMode =
  | 'login'
  | 'signup'
  | 'phone'
  | 'otp'
  | 'forgot_password';

export type PaymentMethodId =
  | 'evc_plus'
  | 'zaad'
  | 'sahal'
  | 'cash_on_delivery'
  | 'card'
  | 'wallet';

export type PaymentStatus =
  | 'pending_cod'
  | 'authorized_test'
  | 'paid_live'
  | 'refunded'
  | 'failed';

export type OrderStatus =
  | 'confirmed'
  | 'preparing'
  | 'driver_assigned'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export type RefundStatus = 'none' | 'requested' | 'approved_refunded' | 'rejected';

export interface LocalizedText {
  en: string;
  so: string;
}

export interface GPSPoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface DeliveryZone {
  id: string;
  city: string;
  neighborhood: string;
  deliveryFeeUsd: number;
  etaMin: number;
  etaMax: number;
  coordinates: GPSPoint;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarInitials: string;
  joinedAt: string;
  role: UserRole;
  phoneVerified: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  walletBalanceUsd: number;
  referralCode: string;
  referralRewardsUsd: number;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  district: string;
  zoneId: string;
  city: string;
  coordinates: GPSPoint;
  instructions?: string;
  isDefault: boolean;
}

export interface ServiceCategory {
  id: Exclude<ServiceCategoryId, 'all'>;
  name: LocalizedText;
  description: LocalizedText;
  iconName: string;
  accentBg: string;
  accentText: string;
}

export interface StoreReview {
  id: string;
  storeId: string;
  orderId: string;
  customerName: string;
  storeRating: number;
  driverRating?: number;
  comment: string;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  category: Exclude<ServiceCategoryId, 'all' | 'parcel'>;
  tagline: LocalizedText;
  logoInitials: string;
  logoBg: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  openingHours: string;
  isOpen: boolean;
  isPopular: boolean;
  isVerified: boolean;
  neighborhood: string;
  city: string;
  coordinates: GPSPoint;
  distanceKm: number;
  productCategories: string[];
}

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  name: LocalizedText;
  description: LocalizedText;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  isRecommended?: boolean;
  isSpecialOffer?: boolean;
  unit?: string;
  inStock: boolean;
}

export interface PromoBanner {
  id: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  ctaLabel: LocalizedText;
  image: string;
  targetCategory: ServiceCategoryId;
  targetStoreId?: string;
  discountText?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  note?: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  rating: number;
  initials: string;
  isVerified: boolean;
  isAvailable: boolean;
  currentGps: GPSPoint;
  zone: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  storeId: string;
  storeName: string;
  storeCoordinates: GPSPoint;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discountAmount: number;
  couponCode?: string;
  total: number;
  commissionRatePct: number;
  status: OrderStatus;
  refundStatus: RefundStatus;
  cancellationReason?: string;
  createdAt: string;
  estimatedMinutes: number;
  deliveryAddress: Address;
  customerPhone: string;
  orderNotes?: string;
  paymentMethod: PaymentMethodId;
  paymentStatus: PaymentStatus;
  paymentIsTestMode: boolean;
  paymentReference: string;
  driver?: DriverInfo;
  isReviewed?: boolean;
  isParcel?: boolean;
  parcelDetails?: {
    pickupAddress: string;
    dropoffAddress: string;
    packageSize: string;
    recipientName: string;
    recipientPhone: string;
  };
}

export interface UploadedDocRef {
  fileName: string;
  docType: string;
  uploadedAt: string;
  storagePath: string;
}

export interface DriverApplication {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  vehicleType: string;
  plateNumber: string;
  operatingZone: string;
  idDocument?: UploadedDocRef;
  licenseDocument?: UploadedDocRef;
  vehicleDocument?: UploadedDocRef;
  status: VerificationStatus;
  isAvailable: boolean;
  reviewerNotes?: string;
  submittedAt: string;
}

export interface MerchantApplication {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  businessName: string;
  category: Exclude<ServiceCategoryId, 'all' | 'parcel'>;
  neighborhood: string;
  licenseNumber: string;
  openingHours: string;
  ownerIdDoc?: UploadedDocRef;
  businessLicenseDoc?: UploadedDocRef;
  healthPermitDoc?: UploadedDocRef;
  status: VerificationStatus;
  reviewerNotes?: string;
  submittedAt: string;
}

export interface PaymentTransaction {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  provider: PaymentMethodId;
  amountUsd: number;
  currency: 'USD';
  status: PaymentStatus;
  isTestMode: boolean;
  reference: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  description: LocalizedText;
  discountType: 'percent' | 'fixed' | 'free_delivery';
  discountValue: number;
  minOrderUsd: number;
}

export interface SupportTicket {
  id: string;
  userId: string;
  customerName: string;
  orderNumber?: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface FraudAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  orderNumber?: string;
  createdAt: string;
  resolved: boolean;
}

export interface PlatformSettings {
  commissionRatePct: number;
  defaultMarket: string;
  currency: 'USD';
  paymentGatewayMode: 'test' | 'live';
}

export interface NotificationItem {
  id: string;
  category: 'otp' | 'order' | 'driver' | 'payment' | 'promo';
  title: LocalizedText;
  message: LocalizedText;
  createdAt: string;
  read: boolean;
  orderId?: string;
}
