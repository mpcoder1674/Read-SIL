create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'faculty', 'librarian', 'administrator')),
  full_name text not null default 'Library member',
  email text not null default '',
  university_id text unique,
  department text,
  program text,
  avatar_url text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.book_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  isbn text unique,
  category_id uuid references public.book_categories(id) on delete set null,
  publisher text,
  publication_year integer check (publication_year between 1000 and 2200),
  language text not null default 'English',
  description text,
  cover_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_authors (
  book_id uuid not null references public.books(id) on delete cascade,
  author_id uuid not null references public.authors(id) on delete restrict,
  primary key (book_id, author_id)
);

create table if not exists public.book_copies (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  accession_number text unique,
  status text not null default 'available' check (status in ('available', 'checked_out', 'reserved', 'lost', 'damaged', 'withdrawn')),
  condition text not null default 'good' check (condition in ('new', 'good', 'worn', 'damaged')),
  shelf_location text not null default 'To be assigned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete restrict,
  copy_id uuid not null references public.book_copies(id) on delete restrict,
  issued_by uuid references public.profiles(id) on delete set null,
  issued_at timestamptz not null default now(),
  due_at timestamptz not null,
  returned_at timestamptz,
  status text not null default 'active' check (status in ('active', 'returned', 'lost')),
  renewal_count integer not null default 0 check (renewal_count >= 0),
  created_at timestamptz not null default now()
);

create unique index if not exists loans_one_active_per_copy on public.loans(copy_id) where returned_at is null and status = 'active';
create index if not exists loans_member_status_idx on public.loans(member_id, status, due_at);

create table if not exists public.loan_renewal_requests (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  requested_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  decision_note text
);

create unique index if not exists renewal_one_pending_per_loan on public.loan_renewal_requests(loan_id) where status = 'pending';

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete restrict,
  book_id uuid not null references public.books(id) on delete restrict,
  copy_id uuid references public.book_copies(id) on delete set null,
  queue_position integer not null check (queue_position > 0),
  status text not null default 'waiting' check (status in ('waiting', 'ready', 'fulfilled', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  ready_at timestamptz,
  expires_at timestamptz
);

create unique index if not exists reservations_one_active_per_member_book on public.reservations(member_id, book_id) where status in ('waiting', 'ready');
create index if not exists reservations_book_queue_idx on public.reservations(book_id, status, queue_position, created_at);

create table if not exists public.fines (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete restrict,
  amount numeric(10,2) not null check (amount >= 0),
  reason text not null,
  status text not null default 'outstanding' check (status in ('outstanding', 'paid', 'waived')),
  calculated_at timestamptz not null default now(),
  settled_at timestamptz,
  settled_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (loan_id, reason)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  fine_id uuid not null references public.fines(id) on delete restrict,
  member_id uuid not null references public.profiles(id) on delete restrict,
  amount numeric(10,2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'verified', 'failed', 'demo_recorded')),
  provider text,
  transaction_reference text unique,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null
);

create unique index if not exists payments_one_demo_record_per_fine on public.payments(fine_id) where status = 'demo_recorded';

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  category text not null default 'general',
  title text not null,
  message text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  related_type text,
  related_id uuid
);

create table if not exists public.notification_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  due_date_reminders boolean not null default true,
  reservation_updates boolean not null default true,
  announcements boolean not null default true,
  email_updates boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.library_policies (
  policy_key text primary key,
  policy_value jsonb not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.library_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  active boolean not null default true,
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists books_title_search_idx on public.books using gin (to_tsvector('english', title));
create index if not exists books_isbn_idx on public.books(isbn);
create index if not exists book_copies_book_status_idx on public.book_copies(book_id, status);
create index if not exists fines_loan_status_idx on public.fines(loan_id, status);
create index if not exists notifications_recipient_read_idx on public.notifications(recipient_id, read_at, created_at desc);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);

create or replace function public.audit_catalogue_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_record jsonb;
  v_target uuid;
  v_metadata jsonb;
  v_action text;
begin
  if tg_table_name = 'profiles' and tg_op = 'UPDATE' then
    if old.role = new.role and old.is_active = new.is_active then return new; end if;
  end if;
  v_record := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_action := lower(tg_table_name || '_' || tg_op);
  if tg_table_name = 'library_policies' then
    v_metadata := jsonb_build_object('policy_key', v_record ->> 'policy_key');
  elsif tg_table_name = 'book_authors' then
    v_target := nullif(v_record ->> 'book_id', '')::uuid;
    v_metadata := jsonb_build_object('book_id', v_record ->> 'book_id', 'author_id', v_record ->> 'author_id');
  else
    v_target := nullif(v_record ->> 'id', '')::uuid;
    v_metadata := case
      when tg_table_name = 'profiles' then jsonb_build_object('role', v_record ->> 'role', 'is_active', v_record ->> 'is_active')
      when tg_table_name = 'books' then jsonb_build_object('title', v_record ->> 'title', 'isbn', v_record ->> 'isbn')
      when tg_table_name = 'book_copies' then jsonb_build_object('book_id', v_record ->> 'book_id', 'status', v_record ->> 'status', 'shelf_location', v_record ->> 'shelf_location')
      when tg_table_name = 'book_categories' or tg_table_name = 'authors' then jsonb_build_object('name', v_record ->> 'name')
      when tg_table_name = 'library_announcements' then jsonb_build_object('title', v_record ->> 'title', 'active', v_record ->> 'active')
      else '{}'::jsonb
    end;
  end if;
  insert into public.audit_logs(actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), v_action, tg_table_name, v_target, v_metadata);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists books_audit_changes on public.books;
create trigger books_audit_changes after insert or update or delete on public.books for each row execute function public.audit_catalogue_change();
drop trigger if exists profiles_audit_changes on public.profiles;
create trigger profiles_audit_changes after insert or update or delete on public.profiles for each row execute function public.audit_catalogue_change();
drop trigger if exists copies_audit_changes on public.book_copies;
create trigger copies_audit_changes after insert or update or delete on public.book_copies for each row execute function public.audit_catalogue_change();
drop trigger if exists categories_audit_changes on public.book_categories;
create trigger categories_audit_changes after insert or update or delete on public.book_categories for each row execute function public.audit_catalogue_change();
drop trigger if exists authors_audit_changes on public.authors;
create trigger authors_audit_changes after insert or update or delete on public.authors for each row execute function public.audit_catalogue_change();
drop trigger if exists book_authors_audit_changes on public.book_authors;
create trigger book_authors_audit_changes after insert or update or delete on public.book_authors for each row execute function public.audit_catalogue_change();
drop trigger if exists policies_audit_changes on public.library_policies;
create trigger policies_audit_changes after insert or update or delete on public.library_policies for each row execute function public.audit_catalogue_change();
drop trigger if exists announcements_audit_changes on public.library_announcements;
create trigger announcements_audit_changes after insert or update or delete on public.library_announcements for each row execute function public.audit_catalogue_change();

revoke all on function public.audit_catalogue_change() from public, anon, authenticated;

do $$
declare
  table_name text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach table_name in array array['books', 'book_copies', 'loans', 'loan_renewal_requests', 'reservations', 'fines', 'payments', 'notifications', 'profiles', 'library_policies', 'library_announcements'] loop
      if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name) then
        execute format('alter publication supabase_realtime add table public.%I', table_name);
      end if;
    end loop;
  end if;
end;
$$;

insert into public.library_policies(policy_key, policy_value)
values ('circulation', '{"student_loan_limit":6,"faculty_loan_limit":12,"loan_period_days":14,"max_renewals":2,"fine_per_day":10,"grace_days":3,"reservation_pickup_days":3,"block_issue_with_unpaid_fines":false}'::jsonb)
on conflict (policy_key) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at before update on public.books for each row execute function public.set_updated_at();
drop trigger if exists copies_set_updated_at on public.book_copies;
create trigger copies_set_updated_at before update on public.book_copies for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  insert into public.profiles(id, role, full_name, email, is_active)
  values (
    new.id,
    'student',
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.create_profile_for_auth_user() from public, anon, authenticated;

drop trigger if exists auth_user_profile_created on auth.users;
create trigger auth_user_profile_created after insert on auth.users for each row execute function public.create_profile_for_auth_user();

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select role from public.profiles where id = auth.uid() and is_active = true
$$;

create or replace function public.is_library_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.current_app_role() in ('librarian', 'administrator'), false)
$$;

create or replace function public.is_library_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.current_app_role() = 'administrator', false)
$$;

create or replace function public.create_catalogue_book(p_title text, p_author text, p_category text, p_isbn text, p_copies integer)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_book_id uuid;
  v_category_id uuid;
  v_author_id uuid;
  v_copy_count integer;
begin
  if not public.is_library_staff() then raise exception 'Library staff permission required'; end if;
  if length(trim(p_title)) = 0 or length(trim(p_author)) = 0 then raise exception 'Title and author are required'; end if;
  if p_copies < 1 or p_copies > 500 then raise exception 'Copy count must be between 1 and 500'; end if;
  insert into public.book_categories(name) values (trim(p_category)) on conflict (name) do nothing;
  select id into v_category_id from public.book_categories where name = trim(p_category);
  insert into public.authors(name) values (trim(p_author)) on conflict (name) do nothing;
  select id into v_author_id from public.authors where name = trim(p_author);
  insert into public.books(title, isbn, category_id, created_by)
  values (trim(p_title), nullif(trim(p_isbn), ''), v_category_id, auth.uid()) returning id into v_book_id;
  insert into public.book_authors(book_id, author_id) values (v_book_id, v_author_id);
  insert into public.book_copies(book_id, accession_number)
  select v_book_id, 'SIL-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
  from generate_series(1, p_copies);
  return v_book_id;
end;
$$;

create or replace function public.issue_copy(p_member_id uuid, p_copy_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_member public.profiles%rowtype;
  v_book_id uuid;
  v_copy_status text;
  v_policy jsonb;
  v_limit integer;
  v_loan_days integer;
  v_active_count integer;
  v_loan_id uuid;
  v_reservation_id uuid;
begin
  if not public.is_library_staff() then raise exception 'Library staff permission required'; end if;
  select * into v_member from public.profiles where id = p_member_id for update;
  if not found or not v_member.is_active then raise exception 'Member account is not active'; end if;
  if v_member.role not in ('student', 'faculty') then raise exception 'Only student or faculty accounts may borrow books'; end if;
  select book_id, status into v_book_id, v_copy_status from public.book_copies where id = p_copy_id for update;
  if not found then raise exception 'Book copy does not exist'; end if;
  if v_copy_status not in ('available', 'reserved') then raise exception 'Book copy is no longer available'; end if;
  if v_copy_status = 'reserved' then
    select id into v_reservation_id from public.reservations where copy_id = p_copy_id and member_id = p_member_id and status = 'ready' and expires_at > now() for update;
    if not found then raise exception 'This copy is reserved for another member'; end if;
  end if;
  select policy_value into v_policy from public.library_policies where policy_key = 'circulation';
  v_policy := coalesce(v_policy, '{}'::jsonb);
  v_limit := coalesce((v_policy ->> (case when v_member.role = 'faculty' then 'faculty_loan_limit' else 'student_loan_limit' end))::integer, case when v_member.role = 'faculty' then 12 else 6 end);
  v_loan_days := coalesce((v_policy ->> 'loan_period_days')::integer, 14);
  select count(*) into v_active_count from public.loans where member_id = p_member_id and returned_at is null and status = 'active';
  if v_active_count >= v_limit then raise exception 'Member has reached the borrowing limit'; end if;
  if coalesce((v_policy ->> 'block_issue_with_unpaid_fines')::boolean, false) and exists (
    select 1 from public.fines f join public.loans l on l.id = f.loan_id where l.member_id = p_member_id and f.status = 'outstanding'
  ) then raise exception 'Member has an outstanding fine'; end if;
  insert into public.loans(member_id, copy_id, issued_by, due_at)
  values (p_member_id, p_copy_id, auth.uid(), now() + make_interval(days => v_loan_days)) returning id into v_loan_id;
  update public.book_copies set status = 'checked_out' where id = p_copy_id;
  if v_reservation_id is not null then
    update public.reservations set status = 'fulfilled' where id = v_reservation_id;
    insert into public.audit_logs(actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'reservation_fulfilled', 'reservation', v_reservation_id, jsonb_build_object('loan_id', v_loan_id));
  end if;
  insert into public.audit_logs(actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'book_issued', 'loan', v_loan_id, jsonb_build_object('member_id', p_member_id, 'copy_id', p_copy_id, 'book_id', v_book_id));
  insert into public.notifications(recipient_id, category, title, message, related_type, related_id)
  values (p_member_id, 'loan', 'Book issued', 'A library loan has been added to your account.', 'loan', v_loan_id);
  return v_loan_id;
end;
$$;

create or replace function public.issue_reserved_copy(p_reservation_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_reservation public.reservations%rowtype;
begin
  if not public.is_library_staff() then raise exception 'Library staff permission required'; end if;
  select * into v_reservation from public.reservations where id = p_reservation_id and status = 'ready' for update;
  if not found or v_reservation.copy_id is null then raise exception 'Ready reservation not found'; end if;
  if v_reservation.expires_at <= now() then raise exception 'This pickup window has expired'; end if;
  return public.issue_copy(v_reservation.member_id, v_reservation.copy_id);
end;
$$;

create or replace function public.return_copy(p_loan_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_loan public.loans%rowtype;
  v_book_id uuid;
  v_next public.reservations%rowtype;
  v_policy jsonb;
  v_grace integer;
  v_rate numeric;
  v_days integer;
  v_amount numeric(10,2);
begin
  if not public.is_library_staff() then raise exception 'Library staff permission required'; end if;
  select * into v_loan from public.loans where id = p_loan_id for update;
  if not found then raise exception 'Loan record does not exist'; end if;
  if v_loan.returned_at is not null or v_loan.status <> 'active' then raise exception 'This loan has already been returned'; end if;
  select book_id into v_book_id from public.book_copies where id = v_loan.copy_id for update;
  update public.loans set returned_at = now(), status = 'returned' where id = p_loan_id;
  select policy_value into v_policy from public.library_policies where policy_key = 'circulation';
  v_policy := coalesce(v_policy, '{}'::jsonb);
  v_grace := coalesce((v_policy ->> 'grace_days')::integer, 3);
  v_rate := coalesce((v_policy ->> 'fine_per_day')::numeric, 10);
  v_days := greatest(0, (current_date - v_loan.due_at::date) - v_grace);
  v_amount := round(v_days * v_rate, 2);
  if v_amount > 0 then
    insert into public.fines(loan_id, amount, reason) values (p_loan_id, v_amount, 'Overdue return') on conflict (loan_id, reason) do nothing;
  end if;
  select * into v_next from public.reservations where book_id = v_book_id and status = 'waiting' order by queue_position, created_at limit 1 for update skip locked;
  if found then
    update public.reservations set status = 'ready', copy_id = v_loan.copy_id, ready_at = now(), expires_at = now() + make_interval(days => coalesce((v_policy ->> 'reservation_pickup_days')::integer, 3)) where id = v_next.id;
    update public.book_copies set status = 'reserved' where id = v_loan.copy_id;
    insert into public.notifications(recipient_id, category, title, message, related_type, related_id)
    values (v_next.member_id, 'reservation', 'Book ready for pickup', 'A reserved book is ready for pickup at the library.', 'reservation', v_next.id);
  else
    update public.book_copies set status = 'available' where id = v_loan.copy_id;
  end if;
  insert into public.audit_logs(actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'book_returned', 'loan', p_loan_id, jsonb_build_object('member_id', v_loan.member_id, 'copy_id', v_loan.copy_id, 'fine_amount', v_amount));
  insert into public.notifications(recipient_id, category, title, message, related_type, related_id)
  values (v_loan.member_id, 'loan', 'Book returned', 'Your library return has been recorded.', 'loan', p_loan_id);
end;
$$;

create or replace function public.reserve_book(p_book_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text;
  v_position integer;
  v_reservation_id uuid;
begin
  v_role := public.current_app_role();
  if coalesce(v_role, '') not in ('student', 'faculty') then raise exception 'An active student or faculty account is required'; end if;
  perform 1 from public.books where id = p_book_id for update;
  if not found then raise exception 'Book does not exist'; end if;
  if exists (select 1 from public.reservations where member_id = auth.uid() and book_id = p_book_id and status in ('waiting', 'ready')) then raise exception 'You already have an active reservation for this book'; end if;
  select coalesce(max(queue_position), 0) + 1 into v_position from public.reservations where book_id = p_book_id and status in ('waiting', 'ready');
  insert into public.reservations(member_id, book_id, queue_position, status)
  values (auth.uid(), p_book_id, v_position, 'waiting') returning id into v_reservation_id;
  insert into public.audit_logs(actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'reservation_created', 'reservation', v_reservation_id, jsonb_build_object('book_id', p_book_id, 'queue_position', v_position));
  insert into public.notifications(recipient_id, category, title, message, related_type, related_id)
  values (auth.uid(), 'reservation', 'Reservation placed', 'Your reservation was added to the library queue.', 'reservation', v_reservation_id);
  return v_reservation_id;
end;
$$;

create or replace function public.request_loan_renewal(p_loan_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_loan public.loans%rowtype;
  v_max integer;
  v_count integer;
  v_request_id uuid;
begin
  if coalesce(public.current_app_role(), '') not in ('student', 'faculty') then raise exception 'An active student or faculty account is required'; end if;
  select * into v_loan from public.loans where id = p_loan_id and member_id = auth.uid() for update;
  if not found or v_loan.returned_at is not null or v_loan.status <> 'active' then raise exception 'Active loan not found for this account'; end if;
  if v_loan.due_at < now() then raise exception 'Overdue books cannot be renewed online'; end if;
  select coalesce((policy_value ->> 'max_renewals')::integer, 2) into v_max from public.library_policies where policy_key = 'circulation';
  select count(*) into v_count from public.loan_renewal_requests where loan_id = p_loan_id and status = 'pending';
  if v_loan.renewal_count + v_count >= coalesce(v_max, 2) then raise exception 'This loan has reached the renewal limit'; end if;
  insert into public.loan_renewal_requests(loan_id, requester_id) values (p_loan_id, auth.uid()) returning id into v_request_id;
  insert into public.audit_logs(actor_id, action, target_type, target_id) values (auth.uid(), 'renewal_requested', 'loan', p_loan_id);
  return v_request_id;
end;
$$;

create or replace function public.review_loan_renewal(p_request_id uuid, p_approve boolean, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_request public.loan_renewal_requests%rowtype;
  v_loan public.loans%rowtype;
  v_max integer;
  v_period integer;
begin
  if not public.is_library_staff() then raise exception 'Library staff permission required'; end if;
  select * into v_request from public.loan_renewal_requests where id = p_request_id for update;
  if not found or v_request.status <> 'pending' then raise exception 'Pending renewal request not found'; end if;
  select * into v_loan from public.loans where id = v_request.loan_id for update;
  if not found or v_loan.returned_at is not null or v_loan.status <> 'active' then raise exception 'The loan is no longer active'; end if;
  select coalesce((policy_value ->> 'max_renewals')::integer, 2), coalesce((policy_value ->> 'loan_period_days')::integer, 14)
    into v_max, v_period from public.library_policies where policy_key = 'circulation';
  if p_approve and (v_loan.due_at < now() or v_loan.renewal_count >= coalesce(v_max, 2)) then raise exception 'The loan is not eligible for renewal'; end if;
  update public.loan_renewal_requests
  set status = case when p_approve then 'approved' else 'rejected' end, reviewed_by = auth.uid(), reviewed_at = now(), decision_note = p_note
  where id = p_request_id;
  if p_approve then
    update public.loans set due_at = greatest(due_at, now()) + make_interval(days => coalesce(v_period, 14)), renewal_count = renewal_count + 1 where id = v_loan.id;
  end if;
  insert into public.audit_logs(actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), case when p_approve then 'renewal_approved' else 'renewal_rejected' end, 'loan', v_loan.id, jsonb_build_object('request_id', p_request_id, 'note', p_note));
  insert into public.notifications(recipient_id, category, title, message, related_type, related_id)
  values (v_request.requester_id, 'loan', case when p_approve then 'Renewal approved' else 'Renewal declined' end, case when p_approve then 'Your loan due date was extended.' else coalesce(p_note, 'Contact the library for more information.') end, 'loan', v_loan.id);
end;
$$;

create or replace function public.cancel_reservation(p_reservation_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_reservation public.reservations%rowtype;
  v_next public.reservations%rowtype;
  v_policy jsonb;
  v_role text;
begin
  v_role := public.current_app_role();
  if v_role is null then raise exception 'An active library account is required'; end if;
  select * into v_reservation from public.reservations where id = p_reservation_id for update;
  if not found then raise exception 'Reservation does not exist'; end if;
  if v_reservation.member_id <> auth.uid() and not public.is_library_staff() then raise exception 'You cannot cancel another member reservation'; end if;
  if v_reservation.status not in ('waiting', 'ready') then raise exception 'This reservation cannot be cancelled'; end if;
  update public.reservations set status = 'cancelled' where id = p_reservation_id;
  if v_reservation.status = 'ready' and v_reservation.copy_id is not null then
    select policy_value into v_policy from public.library_policies where policy_key = 'circulation';
    select * into v_next from public.reservations where book_id = v_reservation.book_id and status = 'waiting' order by queue_position, created_at limit 1 for update skip locked;
    if found then
      update public.reservations set status = 'ready', copy_id = v_reservation.copy_id, ready_at = now(), expires_at = now() + make_interval(days => coalesce((v_policy ->> 'reservation_pickup_days')::integer, 3)) where id = v_next.id;
      update public.book_copies set status = 'reserved' where id = v_reservation.copy_id;
      insert into public.notifications(recipient_id, category, title, message, related_type, related_id)
      values (v_next.member_id, 'reservation', 'Book ready for pickup', 'A reserved book is ready for pickup at the library.', 'reservation', v_next.id);
    else
      update public.book_copies set status = 'available' where id = v_reservation.copy_id;
    end if;
  end if;
  insert into public.audit_logs(actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'reservation_cancelled', 'reservation', p_reservation_id, jsonb_build_object('book_id', v_reservation.book_id));
  insert into public.notifications(recipient_id, category, title, message, related_type, related_id)
  values (v_reservation.member_id, 'reservation', 'Reservation cancelled', 'Your library reservation was cancelled.', 'reservation', p_reservation_id);
end;
$$;

create or replace function public.record_demo_payment(p_fine_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_amount numeric(10,2);
  v_payment_id uuid;
begin
  if coalesce(public.current_app_role(), '') not in ('student', 'faculty') then raise exception 'An active student or faculty account is required'; end if;
  select f.amount into v_amount from public.fines f join public.loans l on l.id = f.loan_id where f.id = p_fine_id and l.member_id = auth.uid() and f.status = 'outstanding' for update of f;
  if not found then raise exception 'Outstanding fine not found for this account'; end if;
  select id into v_payment_id from public.payments where fine_id = p_fine_id and status = 'demo_recorded';
  if found then return v_payment_id; end if;
  insert into public.payments(fine_id, member_id, amount, status, provider)
  values (p_fine_id, auth.uid(), v_amount, 'demo_recorded', 'demonstration') returning id into v_payment_id;
  insert into public.audit_logs(actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'demo_payment_recorded', 'payment', v_payment_id, jsonb_build_object('fine_id', p_fine_id, 'amount', v_amount, 'no_money_collected', true));
  return v_payment_id;
end;
$$;

create or replace function public.library_dashboard_metrics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text := public.current_app_role();
  v_total_books bigint := 0;
  v_total_members bigint := 0;
  v_active_loans bigint := 0;
  v_overdue_loans bigint := 0;
  v_active_reservations bigint := 0;
  v_outstanding_fines numeric := 0;
  v_my_active_loans bigint := 0;
  v_my_reservations bigint := 0;
  v_my_overdue_loans bigint := 0;
  v_my_outstanding_fines numeric := 0;
  v_categories jsonb := '[]'::jsonb;
  v_member_types jsonb := '[]'::jsonb;
  v_circulation jsonb := '[]'::jsonb;
  v_fines_trend jsonb := '[]'::jsonb;
begin
  if v_role is null then raise exception 'An active library profile is required'; end if;
  if v_role in ('librarian', 'administrator') then
    select count(*) into v_total_books from public.book_copies;
    select count(*) into v_total_members from public.profiles where is_active and role in ('student', 'faculty', 'librarian');
    select count(*) into v_active_loans from public.loans where status = 'active' and returned_at is null;
    select count(*) into v_overdue_loans from public.loans where status = 'active' and returned_at is null and due_at < now();
    select count(*) into v_active_reservations from public.reservations where status in ('waiting', 'ready');
    select coalesce(sum(f.amount), 0) into v_outstanding_fines from public.fines f where f.status = 'outstanding';
    select coalesce(jsonb_agg(jsonb_build_object('label', category_name, 'value', item_count) order by item_count desc), '[]'::jsonb)
      into v_categories
      from (select coalesce(c.name, 'Uncategorised') as category_name, count(copy.id) as item_count from public.books b left join public.book_categories c on c.id = b.category_id left join public.book_copies copy on copy.book_id = b.id group by c.name order by item_count desc limit 7) as category_summary;
    select coalesce(jsonb_agg(jsonb_build_object('label', initcap(role), 'value', item_count) order by item_count desc), '[]'::jsonb)
      into v_member_types
      from (select role, count(*) as item_count from public.profiles where is_active and role in ('student', 'faculty', 'librarian') group by role) as member_summary;
    select coalesce(jsonb_agg(jsonb_build_object(
      'label', to_char(day::date, 'Mon DD'),
      'issued', (select count(*) from public.loans where issued_at::date = day::date),
      'returned', (select count(*) from public.loans where returned_at::date = day::date),
      'reservations', (select count(*) from public.reservations where created_at::date = day::date)
    ) order by day), '[]'::jsonb)
      into v_circulation
      from generate_series(date_trunc('day', now()) - interval '6 days', date_trunc('day', now()), interval '1 day') as days(day);
    select coalesce(jsonb_agg(jsonb_build_object('label', to_char(bucket_start, 'Mon DD'), 'value', bucket_total) order by bucket_start), '[]'::jsonb)
      into v_fines_trend
      from (
        select bucket_start, coalesce((select sum(amount) from public.fines where calculated_at >= bucket_start and calculated_at < bucket_start + interval '7 days'), 0) as bucket_total
        from generate_series(date_trunc('day', now()) - interval '35 days', date_trunc('day', now()), interval '7 days') as buckets(bucket_start)
      ) as fine_summary;
  else
    select count(*) into v_my_active_loans from public.loans where member_id = auth.uid() and status = 'active' and returned_at is null;
    select count(*) into v_my_reservations from public.reservations where member_id = auth.uid() and status in ('waiting', 'ready');
    select count(*) into v_my_overdue_loans from public.loans where member_id = auth.uid() and status = 'active' and returned_at is null and due_at < now();
    select coalesce(sum(f.amount), 0) into v_my_outstanding_fines from public.fines f join public.loans l on l.id = f.loan_id where l.member_id = auth.uid() and f.status = 'outstanding';
  end if;
  return jsonb_build_object(
    'total_books', v_total_books,
    'total_members', v_total_members,
    'active_loans', v_active_loans,
    'overdue_loans', v_overdue_loans,
    'active_reservations', v_active_reservations,
    'outstanding_fines', v_outstanding_fines,
    'my_active_loans', v_my_active_loans,
    'my_reservations', v_my_reservations,
    'my_overdue_loans', v_my_overdue_loans,
    'my_outstanding_fines', v_my_outstanding_fines,
    'charts', jsonb_build_object('categories', v_categories, 'member_types', v_member_types, 'circulation', v_circulation, 'fines', v_fines_trend)
  );
end;
$$;

create or replace function public.admin_set_member_role(p_member_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_library_admin() then raise exception 'Administrator permission required'; end if;
  if p_role not in ('student', 'faculty', 'librarian', 'administrator') then raise exception 'Invalid library role'; end if;
  if p_member_id = auth.uid() and p_role <> 'administrator' then raise exception 'You cannot remove your own administrator role'; end if;
  update public.profiles set role = p_role where id = p_member_id;
  if not found then raise exception 'Member account does not exist'; end if;
end;
$$;

create or replace function public.admin_set_member_status(p_member_id uuid, p_is_active boolean)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_library_admin() then raise exception 'Administrator permission required'; end if;
  if p_member_id = auth.uid() and not p_is_active then raise exception 'You cannot deactivate your own administrator account'; end if;
  update public.profiles set is_active = p_is_active where id = p_member_id;
  if not found then raise exception 'Member account does not exist'; end if;
end;
$$;

alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.book_categories enable row level security;
alter table public.authors enable row level security;
alter table public.books enable row level security;
alter table public.book_authors enable row level security;
alter table public.book_copies enable row level security;
alter table public.loans enable row level security;
alter table public.loan_renewal_requests enable row level security;
alter table public.reservations enable row level security;
alter table public.fines enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.library_policies enable row level security;
alter table public.library_announcements enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists profiles_read_self_or_staff on public.profiles;
create policy profiles_read_self_or_staff on public.profiles for select to authenticated using (id = auth.uid() or public.is_library_staff());
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists departments_read_active on public.departments;
create policy departments_read_active on public.departments for select to authenticated using (public.current_app_role() is not null);
drop policy if exists departments_admin_write on public.departments;
create policy departments_admin_write on public.departments for all to authenticated using (public.is_library_admin()) with check (public.is_library_admin());

drop policy if exists categories_read_active on public.book_categories;
create policy categories_read_active on public.book_categories for select to authenticated using (public.current_app_role() is not null);
drop policy if exists categories_staff_write on public.book_categories;
create policy categories_staff_write on public.book_categories for all to authenticated using (public.is_library_staff()) with check (public.is_library_staff());
drop policy if exists authors_read_active on public.authors;
create policy authors_read_active on public.authors for select to authenticated using (public.current_app_role() is not null);
drop policy if exists authors_staff_write on public.authors;
create policy authors_staff_write on public.authors for all to authenticated using (public.is_library_staff()) with check (public.is_library_staff());
drop policy if exists book_authors_read_active on public.book_authors;
create policy book_authors_read_active on public.book_authors for select to authenticated using (public.current_app_role() is not null);
drop policy if exists book_authors_staff_write on public.book_authors;
create policy book_authors_staff_write on public.book_authors for all to authenticated using (public.is_library_staff()) with check (public.is_library_staff());

drop policy if exists books_read_active on public.books;
create policy books_read_active on public.books for select to authenticated using (public.current_app_role() is not null);
drop policy if exists books_staff_write on public.books;
create policy books_staff_write on public.books for all to authenticated using (public.is_library_staff()) with check (public.is_library_staff());
drop policy if exists copies_read_active on public.book_copies;
create policy copies_read_active on public.book_copies for select to authenticated using (public.current_app_role() is not null);
drop policy if exists copies_staff_write on public.book_copies;
create policy copies_staff_write on public.book_copies for all to authenticated using (public.is_library_staff()) with check (public.is_library_staff());

drop policy if exists loans_read_member_or_staff on public.loans;
create policy loans_read_member_or_staff on public.loans for select to authenticated using ((public.current_app_role() is not null and member_id = auth.uid()) or public.is_library_staff());
drop policy if exists renewals_read_owner_or_staff on public.loan_renewal_requests;
create policy renewals_read_owner_or_staff on public.loan_renewal_requests for select to authenticated using ((public.current_app_role() is not null and requester_id = auth.uid()) or public.is_library_staff());
drop policy if exists reservations_read_owner_or_staff on public.reservations;
create policy reservations_read_owner_or_staff on public.reservations for select to authenticated using ((public.current_app_role() is not null and member_id = auth.uid()) or public.is_library_staff());
drop policy if exists fines_read_owner_or_staff on public.fines;
create policy fines_read_owner_or_staff on public.fines for select to authenticated using (exists (select 1 from public.loans l where l.id = public.fines.loan_id and ((public.current_app_role() is not null and l.member_id = auth.uid()) or public.is_library_staff())));
drop policy if exists payments_read_owner_or_staff on public.payments;
create policy payments_read_owner_or_staff on public.payments for select to authenticated using ((public.current_app_role() is not null and member_id = auth.uid()) or public.is_library_staff());

drop policy if exists notifications_read_owner_or_staff on public.notifications;
create policy notifications_read_owner_or_staff on public.notifications for select to authenticated using ((public.current_app_role() is not null and recipient_id = auth.uid()) or public.is_library_staff());
drop policy if exists notifications_update_read_state on public.notifications;
create policy notifications_update_read_state on public.notifications for update to authenticated using ((public.current_app_role() is not null and recipient_id = auth.uid()) or public.is_library_staff()) with check ((public.current_app_role() is not null and recipient_id = auth.uid()) or public.is_library_staff());
drop policy if exists notification_preferences_owner on public.notification_preferences;
create policy notification_preferences_owner on public.notification_preferences for all to authenticated using (public.current_app_role() is not null and profile_id = auth.uid()) with check (public.current_app_role() is not null and profile_id = auth.uid());

drop policy if exists policies_read_active on public.library_policies;
create policy policies_read_active on public.library_policies for select to authenticated using (public.current_app_role() is not null);
drop policy if exists policies_admin_write on public.library_policies;
create policy policies_admin_write on public.library_policies for all to authenticated using (public.is_library_admin()) with check (public.is_library_admin());
drop policy if exists announcements_read_active on public.library_announcements;
create policy announcements_read_active on public.library_announcements for select to authenticated using ((active and (expires_at is null or expires_at > now())) or public.is_library_staff());
drop policy if exists announcements_staff_write on public.library_announcements;
create policy announcements_staff_write on public.library_announcements for all to authenticated using (public.is_library_staff()) with check (public.is_library_staff());
drop policy if exists audit_read_staff on public.audit_logs;
create policy audit_read_staff on public.audit_logs for select to authenticated using (public.is_library_staff());

revoke all on public.profiles, public.departments, public.book_categories, public.authors, public.books, public.book_authors, public.book_copies, public.loans, public.loan_renewal_requests, public.reservations, public.fines, public.payments, public.notifications, public.notification_preferences, public.library_policies, public.library_announcements, public.audit_logs from anon, authenticated;
grant select on public.profiles, public.departments, public.book_categories, public.authors, public.books, public.book_authors, public.book_copies, public.loans, public.loan_renewal_requests, public.reservations, public.fines, public.payments, public.notifications, public.notification_preferences, public.library_policies, public.library_announcements, public.audit_logs to authenticated;
grant update (full_name, department, program, avatar_url) on public.profiles to authenticated;
grant insert, update, delete on public.departments, public.book_categories, public.authors, public.books, public.book_authors, public.book_copies, public.library_announcements to authenticated;
grant insert, update, delete on public.library_policies to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant insert, update, delete on public.notification_preferences to authenticated;

revoke all on function public.current_app_role() from public, anon;
revoke all on function public.is_library_staff() from public, anon;
revoke all on function public.is_library_admin() from public, anon;
revoke all on function public.create_catalogue_book(text, text, text, text, integer) from public, anon;
revoke all on function public.issue_copy(uuid, uuid) from public, anon;
revoke all on function public.issue_reserved_copy(uuid) from public, anon;
revoke all on function public.return_copy(uuid) from public, anon;
revoke all on function public.reserve_book(uuid) from public, anon;
revoke all on function public.request_loan_renewal(uuid) from public, anon;
revoke all on function public.review_loan_renewal(uuid, boolean, text) from public, anon;
revoke all on function public.cancel_reservation(uuid) from public, anon;
revoke all on function public.record_demo_payment(uuid) from public, anon;
revoke all on function public.library_dashboard_metrics() from public, anon;
revoke all on function public.admin_set_member_role(uuid, text) from public, anon;
revoke all on function public.admin_set_member_status(uuid, boolean) from public, anon;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_library_staff() to authenticated;
grant execute on function public.is_library_admin() to authenticated;
grant execute on function public.create_catalogue_book(text, text, text, text, integer) to authenticated;
grant execute on function public.issue_copy(uuid, uuid) to authenticated;
grant execute on function public.issue_reserved_copy(uuid) to authenticated;
grant execute on function public.return_copy(uuid) to authenticated;
grant execute on function public.reserve_book(uuid) to authenticated;
grant execute on function public.request_loan_renewal(uuid) to authenticated;
grant execute on function public.review_loan_renewal(uuid, boolean, text) to authenticated;
grant execute on function public.cancel_reservation(uuid) to authenticated;
grant execute on function public.record_demo_payment(uuid) to authenticated;
grant execute on function public.library_dashboard_metrics() to authenticated;
grant execute on function public.admin_set_member_role(uuid, text) to authenticated;
grant execute on function public.admin_set_member_status(uuid, boolean) to authenticated;
