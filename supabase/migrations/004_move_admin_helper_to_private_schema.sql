-- Move SECURITY DEFINER authorization helper out of the exposed API schema.
-- Apply after 003_rls_completion_and_function_hardening.sql.

create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'::public.user_role
  );
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

drop policy if exists "Users view own profile or admin" on public.profiles;
create policy "Users view own profile or admin" on public.profiles for select
using ((select auth.uid()) = id or private.is_admin());

drop policy if exists "Users update own editable profile fields" on public.profiles;
create policy "Users update own editable profile fields" on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Users manage own addresses" on public.addresses;
create policy "Users manage own addresses" on public.addresses for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Customers view own orders, drivers assigned, merchants store orders, admins all" on public.orders;
drop policy if exists "Customers view own orders, drivers assigned, merchants store or" on public.orders;
create policy "Order parties and admins can read orders" on public.orders for select using (
  (select auth.uid()) = customer_id
  or exists (select 1 from public.drivers d where d.id = orders.driver_id and d.user_id = (select auth.uid()))
  or exists (select 1 from public.stores s join public.merchants m on s.merchant_id = m.id where s.id = orders.store_id and m.owner_id = (select auth.uid()))
  or private.is_admin()
);

drop policy if exists "Users view own payments or admin" on public.payments;
create policy "Users view own payments or admin" on public.payments for select
using ((select auth.uid()) = user_id or private.is_admin());

drop policy if exists "Users manage own notifications" on public.notifications;
create policy "Users manage own notifications" on public.notifications for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users read own support tickets" on public.support_tickets;
create policy "Users read own support tickets" on public.support_tickets for select to authenticated
using ((select auth.uid()) = user_id or private.is_admin());

drop policy if exists "Owners read own merchant records" on public.merchants;
create policy "Owners read own merchant records" on public.merchants for select to authenticated
using (owner_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Drivers read own driver record" on public.drivers;
create policy "Drivers read own driver record" on public.drivers for select to authenticated
using (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Public read open verified stores" on public.stores;
create policy "Public read open verified stores" on public.stores for select
using ((is_verified = true and is_open = true) or private.is_admin());

drop policy if exists "Owners and admins view verification docs" on storage.objects;
create policy "Owners and admins view verification docs" on storage.objects for select to authenticated
using (bucket_id = 'verification-documents' and ((storage.foldername(name))[1] = (select auth.uid())::text or private.is_admin()));

drop function if exists public.is_admin();
