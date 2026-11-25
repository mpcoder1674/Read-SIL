# read@SIL

read@SIL is the Sapthagiri Information Library portal. The interface follows the supplied student, librarian, administrator, and four-role login references, with separate navy, gold, green, and purple environments.

The project contains a React and TypeScript frontend, a Supabase client that reads public project configuration from environment variables, and a PostgreSQL migration with Row Level Security and transactional circulation functions. It also includes an explicitly labeled browser preview so the dashboards can be reviewed before cloud credentials are available.

## Run the interface

```powershell
npm install
npm run dev
```

Open the local Vite address and choose **Preview dashboard with sample data** on any role login. Preview changes are stored in this browser's local storage and are not university records. The reference screenshots informed the layout and theme; demo metrics are labeled as sample values.

## Connect Supabase

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the project URL and publishable key. Older projects can use `VITE_SUPABASE_ANON_KEY` instead. Never put a secret or service-role key in frontend configuration.
3. Apply every `.sql` file in `supabase/migrations` in filename order, using the Supabase SQL Editor or CLI.
4. Enable the university's email or Google provider in Supabase Auth.
5. Create the first account in Supabase Auth, then promote its profile from the trusted SQL Editor:

```sql
update public.profiles
set role = 'administrator', is_active = true
where email = 'your-admin-university-email';
```

Users can request an account from each role's login screen. New Auth users remain inactive and receive the safe default `student` role; the requested portal is stored separately for administrator review. A trusted administrator must assign the approved role and activate the account before it can sign in. Signup metadata cannot grant faculty, librarian, or administrator access by itself.

Once connected, login checks the authenticated user's profile role before entering a portal. Catalogue data and dashboard metrics come from Supabase; circulation issue, return, reservation, renewal review, member status changes, and book creation run through database functions. Row Level Security restricts access by profile role and ownership.

## Current scope

The app supports role-specific login screens, role-checked routes, dashboard and catalogue views, searching, CSV export, sample CRUD interactions, cloud catalogue creation, reservations, issue and return, renewal requests and review, notification read status, member activation and role assignment, audit records, and a clearly labeled demonstration-payment record. A demonstration payment does not collect money or settle a fine.

Selected catalogue, circulation, reservation, profile, fine, payment and notification changes refresh through Supabase Realtime when the project has the `supabase_realtime` publication. Production email or push delivery, scheduled due-date reminders and reservation expiry, live payment processing, PDF reports, and invitation emails still need provider credentials or server-side jobs. They are not represented as active services. Configure Sapthagiri's final circulation and fine policies in the seeded `library_policies` row before using the database for real library operations.
