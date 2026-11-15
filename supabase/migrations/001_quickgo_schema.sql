-- QuickGo Production PostgreSQL Schema, Storage & Row Level Security (RLS)
-- Market Default: Burco, Somaliland | Currency: USD

create extension if not exists "pgcrypto";

-- 1. Roles & Profiles
create type user_role as enum ('customer', 'driver', 'merchant', 'admin');
create type verification_status as enum ('unverified', 'pending', 'approved', 'rejected');
create type order_status as enum ('confirmed', 'preparing', 'driver_assigned', 'picked_up', 'delivered', 'cancelled');
create type refund_status as enum ('none', 'requested', 'approved_refunded', 'rejected');
create type payment_status as enum ('pending_cod', 'authorized_test', 'paid_live', 'failed', 'refunded');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique,
  phone text unique,
  role user_role not null default 'customer',
  phone_verified boolean not null default false,
  email_verified boolean not null default false,
  two_factor_enabled boolean not null default false,
  wallet_balance_usd numeric(10,2) not null default 0.00,
  referral_code text unique,
  referred_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Delivery Zones & Saved Addresses (Burco, Somaliland)
create table if not exists public.delivery_zones (
  id text primary key,
  city text not null default 'Burco',
  neighborhood text not null,
  delivery_fee_usd numeric(6,2) not null default 1.50,
  eta_min_minutes int not null default 15,
  eta_max_minutes int not null default 30,
  is_active boolean not null default true
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  street text not null,
  neighborhood text not null,
  zone_id text references public.delivery_zones(id),
  city text not null default 'Burco',
  lat double precision,
  lng double precision,
  instructions text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. Merchants & Stores
create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  business_license_no text not null,
  owner_id_doc_path text,
  business_doc_path text,
  verification_status verification_status not null default 'pending',
  reviewer_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null,
  category text not null,
  neighborhood text not null default 'Plaza',
  city text not null default 'Burco',
  rating numeric(3,2) not null default 5.00,
  review_count int not null default 0,
  delivery_fee_usd numeric(6,2) not null default 1.50,
  opening_hours text not null default '08:00 - 23:00',
  is_open boolean not null default true,
  is_verified boolean not null default false,
  lat double precision not null default 9.5221,
  lng double precision not null default 45.5336,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name_en text not null,
  name_so text not null,
  description_en text not null,
  description_so text not null,
  category text not null,
  price_usd numeric(10,2) not null check (price_usd >= 0),
  original_price_usd numeric(10,2),
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. Drivers & Live GPS
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  vehicle_type text not null,
  plate_number text not null,
  operating_zone text not null default 'Burco Central',
  id_doc_path text,
  license_doc_path text,
  vehicle_doc_path text,
  verification_status verification_status not null default 'pending',
  is_available boolean not null default false,
  current_lat double precision default 9.5221,
  current_lng double precision default 45.5336,
  last_gps_at timestamptz,
  rating numeric(3,2) not null default 5.00,
  created_at timestamptz not null default now()
);

-- 5. Orders & Payments
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_reference text unique not null,
  customer_id uuid not null references public.profiles(id),
  store_id uuid references public.stores(id),
  driver_id uuid references public.drivers(id),
  subtotal_usd numeric(10,2) not null,
  delivery_fee_usd numeric(10,2) not null,
  service_fee_usd numeric(10,2) not null,
  discount_usd numeric(10,2) not null default 0.00,
  total_usd numeric(10,2) not null,
  commission_rate_pct numeric(5,2) not null default 12.00,
  status order_status not null default 'confirmed',
  refund_status refund_status not null default 'none',
  cancellation_reason text,
  delivery_address jsonb not null,
  customer_phone text not null,
  payment_method text not null,
  coupon_code text,
  estimated_minutes int not null default 25,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  provider text not null,
  amount_usd numeric(10,2) not null,
  currency text not null default 'USD',
  status payment_status not null,
  is_test_mode boolean not null default true,
  provider_reference text not null,
  created_at timestamptz not null default now()
);

-- 6. Coupons, Reviews, Support, Notifications, Fraud Alerts
create table if not exists public.coupons (
  code text primary key,
  discount_type text not null check (discount_type in ('percent', 'fixed', 'free_delivery')),
  discount_value numeric(10,2) not null,
  min_order_usd numeric(10,2) not null default 0,
  is_active boolean not null default true
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  store_id uuid references public.stores(id) on delete cascade,
  customer_id uuid not null references public.profiles(id),
  store_rating int not null check (store_rating between 1 and 5),
  driver_rating int check (driver_rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_reference text,
  subject text not null,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  title_en text not null,
  title_so text not null,
  message_en text not null,
  message_so text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.merchants enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.drivers enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.support_tickets enable row level security;
alter table public.notifications enable row level security;

-- Helper function to check admin role
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- RLS Policies
create policy "Users view own profile or admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users manage own addresses" on public.addresses
  for all using (auth.uid() = user_id);

create policy "Anyone can view approved verified stores" on public.stores
  for select using (is_verified = true or public.is_admin());

create policy "Customers view own orders, drivers assigned, merchants store orders, admins all" on public.orders
  for select using (
    auth.uid() = customer_id
    or exists (select 1 from public.drivers d where d.id = orders.driver_id and d.user_id = auth.uid())
    or exists (select 1 from public.stores s join public.merchants m on s.merchant_id = m.id where s.id = orders.store_id and m.owner_id = auth.uid())
    or public.is_admin()
  );

create policy "Users view own payments or admin" on public.payments
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Users manage own notifications" on public.notifications
  for all using (auth.uid() = user_id);

-- Supabase Storage Bucket for Verification Documents
insert into storage.buckets (id, name, public)
values ('verification-documents', 'verification-documents', false)
on conflict (id) do nothing;

create policy "Authenticated users upload own verification docs"
on storage.objects for insert to authenticated
with check (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners and admins view verification docs"
on storage.objects for select to authenticated
using (bucket_id = 'verification-documents' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
