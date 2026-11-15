-- Persist the phone number entered during email-based customer signup.
-- Phone verification remains false until Supabase Auth confirms the number.

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_name text;
  requested_phone text;
begin
  requested_name := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  requested_phone := coalesce(
    nullif(btrim(new.phone), ''),
    nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'phone', ''), '\s+', '', 'g'), '')
  );

  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(requested_name, split_part(coalesce(new.email, requested_phone, 'QuickGo Customer'), '@', 1)),
    new.email,
    requested_phone
  )
  on conflict (id) do update
    set email = excluded.email,
        phone = coalesce(excluded.phone, public.profiles.phone);

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;
