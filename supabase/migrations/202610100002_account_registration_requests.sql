alter table public.profiles
  add column if not exists requested_role text;

alter table public.profiles
  drop constraint if exists profiles_requested_role_check;

alter table public.profiles
  add constraint profiles_requested_role_check
  check (requested_role is null or requested_role in ('student', 'faculty', 'librarian', 'administrator'));

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  requested text := new.raw_user_meta_data ->> 'requested_role';
begin
  insert into public.profiles(id, role, requested_role, full_name, email, university_id, department, is_active)
  values (
    new.id,
    'student',
    case when requested in ('student', 'faculty', 'librarian', 'administrator') then requested else 'student' end,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'university_id', ''),
    nullif(new.raw_user_meta_data ->> 'department', ''),
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.create_profile_for_auth_user() from public, anon, authenticated;

