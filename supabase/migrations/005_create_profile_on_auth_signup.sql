-- Create a least-privilege customer profile whenever Supabase Auth creates a user.
-- Privileged role and verification fields are deliberately not read from user metadata.

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_name text;
begin
  requested_name := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');

  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(requested_name, split_part(coalesce(new.email, new.phone, 'QuickGo Customer'), '@', 1)),
    new.email,
    new.phone
  )
  on conflict (id) do update
    set email = excluded.email,
        phone = coalesce(excluded.phone, public.profiles.phone);

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

drop trigger if exists on_auth_user_created_quickgo_profile on auth.users;
create trigger on_auth_user_created_quickgo_profile
after insert on auth.users
for each row execute function private.handle_new_user();
