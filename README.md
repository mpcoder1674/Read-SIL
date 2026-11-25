# Read@SIL · Saptagiri Information Library

Read@SIL is a responsive library portal with member, librarian, and administrator workspaces. It uses HTML, CSS and JavaScript in the browser, Node.js and Express for the API, MongoDB for persistence, JWT for authentication, and optional Cloudinary or Amazon S3 storage for book cover images.

Hosting and deployment are intentionally left for a later step.

## Run locally on Windows

1. Install **Node.js 20.19 or newer** and a local MongoDB Community Server.
2. Double-click **Start Read@SIL.bat**. On the first run, it installs the project packages and creates `.env` from `.env.example`.
3. Keep the local MongoDB service running. The default connection is `mongodb://127.0.0.1:27017/readasil`.
4. Open `http://localhost:8000` if a browser did not open automatically.
5. To stop Read@SIL, press **Ctrl+C** in its server window.

You can also run `npm install` and `npm start` from this folder. Use `npm run dev` while editing. The server waits for MongoDB before it opens the web app; if MongoDB is unavailable, start the local database service and run it again.

## Demo workspaces

All demo accounts use **Read@2026**.

| Workspace | Sign-in email |
| --- | --- |
| Student member | `student@readasil.edu` |
| Faculty member | `faculty@readasil.edu` |
| Librarian | `librarian@readasil.edu` |
| Administrator | `admin@readasil.edu` |

The first server launch seeds these accounts and sample books into an empty database. New member accounts created by staff start with the temporary password **Read@SIL2026**. Members can change their password from their profile.

## Registration and administrator credentials

Use the **Register** tab to create a student, faculty, or librarian account. Student and faculty accounts are ready immediately. Librarian registration creates a pending application; an administrator must approve it in **User Management** before that person can sign in. Admin registration is not available. The seeded administrator signs in with `admin@readasil.edu` and **Read@2026**; change the admin email or password from the admin profile. The admin credential form only changes login credentials and requires the current password.

## Included workflows

- **Members:** search and filter books, borrow available titles, reserve unavailable titles, view active and returned loans, check fine balances, read notices, and manage profiles and notification preferences.
- **Librarians:** maintain the catalogue, manage member accounts, issue and check in books, review reservations and fines, publish notices, export circulation records, and view reports.
- **Administrators:** staff workflows plus account and access views, audit history, library policy controls, and system settings.
- The API checks permissions on protected operations. Passwords use bcrypt hashes; sessions use expiring, signed JWTs.
- Circulation and reservations update the MongoDB inventory. Returned copies can be assigned to the next waiting reservation.

## MongoDB configuration

Set `MONGODB_URI` in `.env`. The supplied value connects to a local MongoDB service. Keep credentials private. `JWT_SECRET` should be a unique random value of at least 32 characters before any public deployment.

## Book cover storage

Cover uploads accept JPG, PNG, WebP, and GIF images up to 3 MB. Select one provider in `.env`:

- **Cloudinary:** set `FILE_STORAGE_PROVIDER=cloudinary`, then provide `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
- **Amazon S3:** set `FILE_STORAGE_PROVIDER=s3`, then provide `AWS_REGION` and `AWS_S3_BUCKET`. AWS credentials are read through the standard AWS SDK credential chain. S3 covers are stored privately and served using short-lived signed URLs.
- Leave `FILE_STORAGE_PROVIDER=none` until a provider is configured. Catalogue and circulation features work without image uploads.

Provider accounts, credentials, and buckets are not configured in this project folder. Never put secret values in `app.js` or commit `.env`.

Fine payments are recorded by library staff in the ledger. No payment processor is configured.
