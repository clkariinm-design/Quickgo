-- Complete RLS coverage and harden the initial admin predicate.
-- Apply after 002_security_hardening.sql.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'::public.user_role
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.merchants enable row level security;
alter table public.drivers enable row level security;

create policy "Owners read own merchant records"
on public.merchants for select to authenticated
using (owner_id = (select auth.uid()) or public.is_admin());

create policy "Drivers read own driver record"
on public.drivers for select to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Anyone can view approved verified stores" on public.stores;
create policy "Public read open verified stores"
on public.stores for select
using ((is_verified = true and is_open = true) or public.is_admin());
