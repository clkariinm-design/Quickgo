-- QuickGo security hardening migration.
-- Apply after 001_quickgo_schema.sql. Review in staging before production.

-- Prevent users from granting themselves privileged roles or changing server-owned fields.
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is not null and auth.uid() = old.id then
    if new.role is distinct from old.role
       or new.wallet_balance_usd is distinct from old.wallet_balance_usd
       or new.phone_verified is distinct from old.phone_verified
       or new.email_verified is distinct from old.email_verified
       or new.referral_code is distinct from old.referral_code
       or new.referred_by is distinct from old.referred_by then
      raise exception 'Protected profile fields can only be changed by trusted server operations'
        using errcode = '42501';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_fields on public.profiles;
create trigger protect_profile_privileged_fields
before update on public.profiles
for each row execute function public.protect_profile_privileged_fields();

-- Replace broad profile update policy with an explicit self-update policy.
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own editable profile fields"
on public.profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Public catalog data is readable only when the store is approved and active.
alter table public.delivery_zones enable row level security;
alter table public.coupons enable row level security;

drop policy if exists "Public read active delivery zones" on public.delivery_zones;
create policy "Public read active delivery zones"
on public.delivery_zones for select
using (is_active = true);

drop policy if exists "Public read active coupons" on public.coupons;
create policy "Public read active coupons"
on public.coupons for select
using (is_active = true);

drop policy if exists "Public read products from verified stores" on public.products;
create policy "Public read products from verified stores"
on public.products for select
using (
  exists (
    select 1 from public.stores s
    where s.id = products.store_id
      and s.is_verified = true
      and s.is_open = true
  )
);

-- Customers may create support tickets only for themselves and read only their own.
drop policy if exists "Customers create own support tickets" on public.support_tickets;
create policy "Customers create own support tickets"
on public.support_tickets for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users read own support tickets" on public.support_tickets;
create policy "Users read own support tickets"
on public.support_tickets for select to authenticated
using (auth.uid() = user_id or public.is_admin());

-- Reviews must belong to the authenticated customer and a delivered order.
drop policy if exists "Customers create reviews for delivered orders" on public.reviews;
create policy "Customers create reviews for delivered orders"
on public.reviews for insert to authenticated
with check (
  auth.uid() = customer_id
  and exists (
    select 1 from public.orders o
    where o.id = reviews.order_id
      and o.customer_id = auth.uid()
      and o.status = 'delivered'
  )
);

drop policy if exists "Users read reviews" on public.reviews;
create policy "Users read reviews"
on public.reviews for select
using (true);

-- Verification records are private; only the owner and an administrator may read them.
-- The storage bucket itself remains private as configured in the initial migration.
