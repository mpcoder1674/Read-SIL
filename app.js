const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const API = "";

const iconPaths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5V22M8 7h8M8 11h8"/>',
  books: '<path d="M4 4h5v16H4zM12 3h5v17h-5zM19 5l3-1 3 15-3 1z"/><path d="M5.5 8h2M13.5 7h2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  circulation: '<path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7"/><path d="M14 14l7 7M21 14v7h-7M10 10L3 3M3 10V3h7"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8 15h3"/>',
  wallet: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M16 14h2"/><path d="M6 5V3h12v2"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 14 4-4 4 3 6-7"/><path d="M17 6h4v4"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7-.2.1-1.2.7-.2 1.8h-2.8l-.2-1.8-1.4-.8-1.7.7-1.4-2.4 1.4-1.1v-1.6l-1.4-1.1 1.4-2.4 1.7.7 1.4-.8.2-1.8h2.8l.2 1.8 1.4.8 1.7-.7 1.4 2.4-1.4 1.1z"/>',
  audit: '<path d="M4 4h16v17H4zM8 8h8M8 12h8M8 16h4"/><path d="m17 3 3 3"/>',
  policy: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="M9 12h6M12 9v6"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m7 10 5 5 5-5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  student: '<path d="m2 10 10-6 10 6-10 6z"/><path d="M6 13v5c4 3 8 3 12 0v-5M22 10v6"/>',
  sparkle: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.1L12 19l-1.9-5.9L4 11l6.1-2.2z"/><path d="m19 16 1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  dollar: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  location: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/>',
  filter: '<path d="M4 5h16M7 12h10m-7 7h4"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6m4 4v7m6-7v7"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  belloff: '<path d="M13.7 21a2 2 0 0 1-3.4 0M18 8a6 6 0 0 0-9.5-4.8M6 8c0 5-3 7-3 9h14M22 2 2 22"/>',
  bookopen: '<path d="M12 7v14M3 18V5a2 2 0 0 1 2-2h4a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H3zM21 18V5a2 2 0 0 0-2-2h-4a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3h6z"/>',
};
const icon = (name, extra = "") => `<span class="icon ${extra}" aria-hidden="true"><svg viewBox="0 0 24 24">${iconPaths[name] || iconPaths.sparkle}</svg></span>`;
const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const initial = (name = "Reader") => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
const money = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const dateLabel = (value) => value ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const today = () => new Date().toISOString().slice(0, 10);

const loginRoles = {
  student: { label: "Student", apiRole: "member", email: "student@readasil.edu", color: "#175ee8", icon: "student", headline: "Knowledge builds brighter futures.", copy: "Explore thousands of books, reserve a title, and make room for your next great idea.", desc: "Access your library account to explore, borrow and manage your books." },
  faculty: { label: "Faculty", apiRole: "member", email: "faculty@readasil.edu", color: "#ba8748", icon: "users", headline: "Teaching today for a brighter tomorrow.", copy: "Access academic resources, journals, research materials and digital collections.", desc: "Access research materials, academic resources and your faculty borrowing." },
  librarian: { label: "Librarian", apiRole: "librarian", email: "librarian@readasil.edu", color: "#087a60", icon: "bookopen", headline: "Manage today’s library for tomorrow’s learners.", copy: "Catalogue, issue, return and manage library resources from one calm workspace.", desc: "Manage books, members and everyday library operations." },
  admin: { label: "Administrator", apiRole: "admin", email: "admin@readasil.edu", color: "#7041eb", icon: "settings", headline: "Oversee. Manage. Enhance.", copy: "Bring people, policies, and library operations together in one clear view.", desc: "Access the administrator workspace for your library." },
};
const navigation = {
  member: [
    { section: "Your Library", links: [["dashboard", "Dashboard", "grid"], ["search-books", "Search Books", "search"], ["my-borrowings", "My Borrowings", "bookopen"], ["reservations", "Reservations", "calendar"], ["my-fines", "Fines & Payments", "wallet"], ["notifications", "Notifications", "bell"], ["profile", "My Profile", "user"]] },
  ],
  librarian: [
    { section: "Workspace", links: [["dashboard", "Dashboard", "grid"]] },
    { section: "Library Operations", links: [["manage-books", "Manage Books", "books"], ["manage-members", "Manage Members", "users"], ["circulation", "Book Issue / Return", "circulation"], ["reservations", "Reservations", "calendar"], ["fines-management", "Fines Management", "wallet"], ["reports", "Reports", "chart"], ["notifications", "Notifications", "bell"]] },
  ],
  admin: [
    { section: "Overview", links: [["dashboard", "Dashboard", "grid"]] },
    { section: "Library", links: [["book-catalogue", "Book Catalogue", "books"], ["circulation", "Circulation", "circulation"], ["reservations", "Reservations", "calendar"], ["fines-payments", "Fines & Payments", "wallet"]] },
    { section: "Insights", links: [["reports", "Reports & Analytics", "chart"], ["notifications", "Notifications", "bell"]] },
    { section: "Administration", links: [["user-management", "User Management", "users"], ["audit-logs", "Audit Logs", "audit"], ["system-settings", "System Settings", "settings"], ["policies", "Policies & Access", "policy"]] },
  ],
};
const pageMeta = {
  dashboard: ["Dashboard", "A clear view of what’s happening across your library."],
  "search-books": ["Search Books", "Find your next read across the Read@SIL collection."],
  "my-borrowings": ["My Borrowings", "Keep track of your active loans and returned books."],
  reservations: ["Reservations", "Manage your holds and see where you are in the queue."],
  "my-fines": ["Fines & Payments", "View your library charges and payment history."],
  notifications: ["Notifications", "Stay up to date with library news and account activity."],
  profile: ["My Profile", "Manage your personal details and library preferences."],
  "manage-books": ["Manage Books", "Maintain your collection and keep the catalogue current."],
  "manage-members": ["Manage Members", "Support members and keep their accounts in good standing."],
  circulation: ["Book Issue / Return", "Issue a title, check in a return and keep circulation moving."],
  "fines-management": ["Fines Management", "Review and manage outstanding library charges."],
  reports: ["Reports", "Explore circulation, membership and collection activity."],
  "book-catalogue": ["Book Catalogue", "Manage catalogue records, availability and collection health."],
  "fines-payments": ["Fines & Payments", "Review fine collection and payment activity."],
  "user-management": ["User Management", "Manage members, librarian access and account status."],
  "audit-logs": ["Audit Logs", "Follow system changes and library operations over time."],
  "system-settings": ["System Settings", "Configure your library workspace and operating rules."],
  policies: ["Policies & Access", "Review loan limits, reservation access and account permissions."],
};

let appData = null;
let activePage = "dashboard";
let loginChoice = "student";
let loginError = "";
let authMessage = "";
let authMode = "login";
let bookFilter = "All Books";
let bookCategory = "All";
let bookQuery = "";
let listQuery = "";
let memberFilter = "All";
let mobileNavOpen = false;
let modalBusy = false;

async function request(path, options = {}) {
  const token = localStorage.getItem("readasil_token") || "";
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, { ...options, headers, cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Could not connect to Read@SIL.");
  return payload;
}

function roleLabel(role, memberId = "") { return role === "member" ? (String(memberId).startsWith("FAC-") ? "Faculty" : "Library Member") : role === "librarian" ? "Librarian" : "Administrator"; }
function themeRole(role) { return role === "admin" ? "admin" : role === "librarian" ? "librarian" : "member"; }
function roleTone(role) { return role === "admin" ? "purple" : role === "librarian" ? "green" : "navy"; }
function activeLoans() { return appData.loans.filter((loan) => loan.status === "Borrowed"); }
function activeReservations() { return appData.reservations.filter((item) => ["Waiting", "Ready for pickup"].includes(item.status)); }
function unpaidFines() { return appData.fines.filter((fine) => fine.status !== "Paid"); }
function unseenNotices() { return appData.notifications.filter((notice) => !notice.read_at).length; }
function titleFor(bookId) { return appData.books.find((book) => book.id === bookId)?.title || "Library title"; }
function memberOptions(selected = "") { return appData.users.filter((user) => user.role === "member").map((user) => `<option value="${user.id}" ${String(selected) === String(user.id) ? "selected" : ""}>${esc(user.name)} · ${esc(user.member_id || user.email)}</option>`).join(""); }
function availableBookOptions(selected = "") { return appData.books.filter((book) => book.available > 0).map((book) => `<option value="${book.id}" ${String(selected) === String(book.id) ? "selected" : ""}>${esc(book.title)} · ${book.available} available</option>`).join(""); }

function setLoginChoice(choice) {
  const wasRegistering = authMode === "register";
  loginChoice = choice;
  loginError = "";
  authMessage = "";
  authMode = choice === "admin" ? "login" : wasRegistering ? "register" : "login";
  renderLogin();
}

function setAuthMode(mode) {
  authMode = loginChoice === "admin" ? "login" : mode;
  loginError = "";
  authMessage = "";
  renderLogin();
}

function renderLogin() {
  const role = loginRoles[loginChoice];
  const registerMode = authMode === "register" && loginChoice !== "admin";
  const iconSet = (name, label, color) => `<button type="button" class="role-card ${loginChoice === name ? "selected" : ""}" style="--role-accent:${color}" data-login-as="${name}" aria-pressed="${loginChoice === name}">${icon(loginRoles[name].icon)}<span>${label}</span></button>`;
  const authTabs = loginChoice === "admin"
    ? `<div class="admin-login-note">Administrator accounts are created and managed by the library.</div>`
    : `<div class="auth-tabs" role="tablist" aria-label="Account access"><button type="button" role="tab" aria-selected="${!registerMode}" class="auth-tab ${!registerMode ? "active" : ""}" data-auth-mode="login">Sign in</button><button type="button" role="tab" aria-selected="${registerMode}" class="auth-tab ${registerMode ? "active" : ""}" data-auth-mode="register">Register</button></div>`;
  const registerFields = `<div class="field"><label for="register-name">Full name</label><div class="input-wrap">${icon("user")}<input id="register-name" name="name" autocomplete="name" maxlength="120" placeholder="Your full name" required /></div></div><div class="field"><label for="register-email">${loginChoice === "librarian" ? "Work email" : "University email"}</label><div class="input-wrap">${icon("mail")}<input id="register-email" name="email" type="email" autocomplete="email" placeholder="you@readasil.edu" required /></div></div><div class="field"><label for="register-department">${loginChoice === "librarian" ? "Library / department" : "Department"}</label><div class="input-wrap">${icon("books")}<input id="register-department" name="department" maxlength="100" placeholder="Your department" required /></div></div><div class="field"><label for="register-phone">Phone number</label><div class="input-wrap">${icon("user")}<input id="register-phone" name="phone" type="tel" autocomplete="tel" maxlength="40" placeholder="Optional contact number" /></div></div><div class="field"><label for="register-password">Create password</label><div class="input-wrap">${icon("lock")}<input id="register-password" name="password" type="password" autocomplete="new-password" minlength="10" maxlength="256" placeholder="At least 10 characters" required /><button class="input-trailing" type="button" data-toggle-password aria-label="Show password">${icon("eye")}</button></div></div><div class="field"><label for="register-confirm-password">Confirm password</label><div class="input-wrap">${icon("lock")}<input id="register-confirm-password" name="confirm_password" type="password" autocomplete="new-password" minlength="10" maxlength="256" placeholder="Enter your password again" required /></div></div>${loginChoice === "librarian" ? `<p class="registration-note">Librarian registrations are reviewed by an administrator before sign-in is enabled.</p>` : ""}${loginError ? `<p class="inline-error" role="alert">${esc(loginError)}</p>` : ""}<button class="button wide ${roleTone(role.apiRole)}" id="login-submit" type="submit">Create ${role.label.toLowerCase()} account</button>`;
  const demoLinks = loginChoice === "admin" ? `<p class="login-note">Use the administrator credentials configured for Read@SIL.</p>` : `<div class="demo-divider">Or explore a demo workspace</div><div class="demo-login-grid"><button type="button" class="demo-login" data-demo="student" style="--role-accent:#175ee8"><span class="demo-dot"></span><span><strong>Student workspace</strong><small>Explore, borrow & reserve</small></span></button><button type="button" class="demo-login" data-demo="faculty" style="--role-accent:#ba8748"><span class="demo-dot"></span><span><strong>Faculty workspace</strong><small>Academic resources</small></span></button><button type="button" class="demo-login" data-demo="librarian" style="--role-accent:#087a60"><span class="demo-dot"></span><span><strong>Librarian workspace</strong><small>Manage daily operations</small></span></button></div><p class="login-note">Demo password: <strong>Read@2026</strong> · For Saptagiri Information Library</p>`;
  const defaultLoginEmail = loginChoice === "admin" ? (localStorage.getItem("readasil_admin_email") || role.email) : role.email;
  const loginFields = `<div class="field"><label for="login-email">${role.apiRole === "member" ? "University email" : "Email address"}</label><div class="input-wrap">${icon("mail")}<input id="login-email" name="email" type="email" autocomplete="username" placeholder="you@readasil.edu" value="${esc(defaultLoginEmail)}" required /></div></div><div class="field"><label for="login-password">Password</label><div class="input-wrap">${icon("lock")}<input id="login-password" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" value="Read@2026" required /><button class="input-trailing" type="button" data-toggle-password aria-label="Show password">${icon("eye")}</button></div></div><div class="login-options"><label class="check-inline"><input type="checkbox" name="remember" checked /> Remember me</label><button class="text-button" type="button" data-forgot-password>Forgot password?</button></div>${loginError ? `<p class="inline-error" role="alert">${esc(loginError)}</p>` : ""}<button class="button wide ${roleTone(role.apiRole)}" id="login-submit" type="submit">Sign in</button>${demoLinks}`;
  const formFields = registerMode ? registerFields : loginFields;
  const subtitle = registerMode ? (loginChoice === "librarian" ? "Register for librarian access to manage library services." : "Create your Read@SIL account to access the library.") : role.desc;
  $("#app").innerHTML = `
    <main class="login-page">
      <section class="login-card" aria-label="Read@SIL sign in">
        <aside class="login-story">
          <div class="brand-lockup" aria-label="Read at S I L"><div class="brand-crest"></div><div><div class="brand-word">read@<span>SIL</span></div><div class="brand-caption">Read at Saptagiri Information Library</div></div></div>
          <div class="story-copy"><div class="story-eyebrow">Discover · Read · Grow</div><h1 id="story-heading">${esc(role.headline)}</h1><p id="story-copy">${esc(role.copy)}</p><div class="story-rule"></div></div>
          <div class="story-foot"><span>${icon("books")} <span><strong>50K+</strong> books</span></span><span>${icon("users")} <span><strong>5K+</strong> members</span></span><span>${icon("bookopen")} <span>Digital resources</span></span></div>
        </aside>
        <section class="login-panel"><form class="login-form" id="login-form" data-mode="${registerMode ? "register" : "login"}">
          <h2 id="login-title">${role.label} ${registerMode ? "Registration" : "Login"}</h2><p class="login-subtitle" id="login-subtitle">${esc(subtitle)}</p>
          <div class="role-grid" aria-label="Choose account type">${iconSet("student", "Student", "#175ee8")}${iconSet("faculty", "Faculty", "#ba8748")}${iconSet("librarian", "Librarian", "#087a60")}${iconSet("admin", "Admin", "#7041eb")}</div>
          ${authTabs}${authMessage ? `<p class="inline-success" role="status">${esc(authMessage)}</p>` : ""}${formFields}
        </form></section>
      </section>
    </main>`;
}

const sidebarLabel = (link) => link[1];
function pageKey() { return activePage; }
function navBadge(key) {
  if (key === "notifications") return unseenNotices();
  if (key === "reservations") return activeReservations().length;
  return 0;
}

function brandMarkup() {
  return `<div class="brand-lockup"><div class="brand-crest"></div><div><div class="brand-word">read@<span>SIL</span></div><div class="brand-caption">Saptagiri Information Library</div></div></div>`;
}

function renderSidebar() {
  const role = appData.user.role;
  const groups = navigation[role];
  return `<aside class="sidebar ${mobileNavOpen ? "open" : ""}" id="sidebar">
    <div class="sidebar-brand">${brandMarkup()}</div><div class="sidebar-rule"></div>
    ${groups.map((group) => `<div class="nav-section">${group.section}</div><nav class="nav-list" aria-label="${esc(group.section)}">${group.links.map(([key,label,ico]) => {
      const badge = navBadge(key);
      return `<button class="nav-item ${activePage === key ? "active" : ""}" type="button" data-page="${key}">${icon(ico)}<span>${label}</span>${badge ? `<span class="nav-badge">${badge}</span>` : ""}</button>`;
    }).join("")}</nav>`).join("")}
    <div class="sidebar-spacer"></div>
    <div class="sidebar-promo">${icon("sparkle")}<strong>A library for curious minds</strong><p>Discover. Read. Grow. Your next idea is waiting on the shelves.</p></div>
    <div class="sidebar-user"><div class="avatar">${esc(initial(appData.user.name))}</div><div class="sidebar-user-copy"><strong>${esc(appData.user.name)}</strong><small>${esc(roleLabel(role,appData.user.member_id))}</small></div><button class="signout" type="button" data-logout aria-label="Sign out">${icon("logout")}</button></div>
  </aside><button class="mobile-scrim ${mobileNavOpen ? "show" : ""}" data-close-nav aria-label="Close navigation"></button>`;
}

function renderTopbar() {
  const unread = unseenNotices();
  return `<header class="topbar"><div class="topbar-left"><button class="icon-button hamburger" type="button" data-toggle-nav aria-label="Open navigation">${icon("menu")}</button><div class="global-search">${icon("search")}<input id="global-search" type="search" placeholder="Search books, members, ISBNs or actions…" aria-label="Search the library" /></div><button class="top-link" data-page="search-books">Advanced search ${icon("down")}</button></div><div class="topbar-actions"><button class="icon-button" type="button" data-page="notifications" aria-label="Notifications">${icon("bell")}${unread ? '<span class="unread-dot"></span>' : ""}</button><button class="top-user" type="button" data-page="profile"><span class="avatar">${esc(initial(appData.user.name))}</span><span class="top-user-copy"><strong>${esc(appData.user.name)}</strong><small>${esc(roleLabel(appData.user.role,appData.user.member_id))}</small></span>${icon("down")}</button></div></header>`;
}

function pageHeading(title, description, action = "") {
  return `<div class="page-heading"><div class="heading-copy"><div class="breadcrumbs">Read@SIL ${icon("chevron")} <span>${esc(title)}</span></div><h1>${esc(title)}</h1><p>${esc(description)}</p></div>${action ? `<div class="heading-actions">${action}</div>` : ""}</div>`;
}

function button(label, action, type = "primary", ico = "") {
  return `<button class="button ${type}" type="button" data-ui-action="${action}">${ico ? icon(ico) : ""}${label}</button>`;
}

function statCard(label, value, note, ico, color = "#155bd9", soft = "#edf3ff") {
  return `<article class="stat-card"><div class="stat-top"><div><div class="stat-name">${label}</div><strong class="stat-value">${value}</strong><div class="stat-note">${note}</div></div><span class="stat-icon" style="--stat-color:${color};--stat-soft:${soft}">${icon(ico)}</span></div></article>`;
}

function bookThumb(book, large = false) {
  return `<span class="book-thumb ${esc(book.color || "blue")} ${large ? "large" : ""}">${book.cover_url ? `<img src="${esc(book.cover_url)}" alt="Cover of ${esc(book.title)}" loading="lazy" />` : `<span>${esc(book.title)}</span>`}</span>`;
}

function statusBadge(value) {
  const kind = /overdue|unpaid|suspended|cancelled|lost/i.test(value) ? "bad" : /ready|active|paid|returned|available|picked up/i.test(value) ? "good" : /waiting|borrowed|due soon|pending/i.test(value) ? "warn" : /approved|issued/i.test(value) ? "info" : "neutral";
  return `<span class="status ${kind}">${esc(value)}</span>`;
}

function preferenceRows() {
  const items = [["due_reminders", "Due date reminders"], ["reservation_updates", "Reservation updates"], ["new_arrivals", "New arrivals in my interests"], ["library_news", "Library news & announcements"]];
  return `<div class="preference-list">${items.map(([key,label]) => `<div class="settings-toggle-row">${label}<label class="switch"><input type="checkbox" data-preference="${key}" ${appData.preferences[key] !== "false" ? "checked" : ""} aria-label="${label}"/><span></span></label></div>`).join("")}</div>`;
}

function tableWrap(title, subtitle, header, rows, right = "") {
  return `<section class="panel"><div class="panel-head"><div><h2>${title}</h2>${subtitle ? `<small>${subtitle}</small>` : ""}</div>${right}</div>${rows.length ? `<div class="mini-table-wrap"><table class="data-table"><thead><tr>${header.map((th) => `<th>${th}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>` : `<div class="empty-state">${icon("bookopen")}<strong>Nothing to show yet</strong><p>As library activity comes in, it will appear here.</p></div>`}</section>`;
}

function heroForMember() {
  const name = appData.user.name.split(/\s+/)[0];
  return `<section class="dashboard-hero"><div class="hero-copy"><div class="hero-kicker">${icon("sparkle")} Your library, at a glance</div><h2>Welcome back, ${esc(name)}.</h2><p>Good ideas start with a good book. Pick up where you left off, find a fresh perspective, or place a hold on a title you’ve been curious about.</p><button class="button green" type="button" data-page="search-books">Find your next read ${icon("arrow")}</button></div><div class="hero-deco">${icon("bookopen")}</div></section>`;
}

function heroForStaff() {
  const admin = appData.user.role === "admin";
  const lead = admin ? "Library operations, in perspective" : "Your library, moving together";
  const copy = admin ? "See collection activity, lending, member accounts and system health in one workspace." : "Keep the collection current, circulation running smoothly and members connected to their next read.";
  return `<section class="dashboard-hero"><div class="hero-copy"><div class="hero-kicker">${icon("sparkle")} ${admin ? "Administrator overview" : "Librarian workspace"}</div><h2>${lead}</h2><p>${copy}</p><button class="button ${admin ? "purple" : "green"}" type="button" data-page="${admin ? "reports" : "circulation"}">${admin ? "Explore analytics" : "Open circulation desk"} ${icon("arrow")}</button></div><div class="hero-deco">${icon(admin ? "chart" : "books")}</div></section>`;
}

function bookMiniRows(books) {
  return books.slice(0, 5).map((book) => `<tr><td><div class="table-title">${bookThumb(book)}<span><strong>${esc(book.title)}</strong><small>${esc(book.author)}</small></span></div></td><td>${esc(book.category)}</td><td>${esc(book.location)}</td><td>${book.available ? statusBadge(`${book.available} available`) : statusBadge("On loan")}</td></tr>`);
}

function loanRows(loans, staff = false) {
  return loans.slice(0, 5).map((loan) => `<tr><td><div class="table-title">${bookThumb({ title: loan.book_title, color: loan.book_color })}<span><strong>${esc(loan.book_title)}</strong><small>${esc(loan.author)}</small></span></div></td>${staff ? `<td><div class="member-cell"><span class="avatar">${esc(initial(loan.member_name))}</span>${esc(loan.member_name)}</div></td>` : ""}<td>${dateLabel(loan.due_date)}</td><td>${statusBadge(loan.status === "Borrowed" && loan.due_date < today() ? "Overdue" : loan.status === "Borrowed" && loan.due_date === today() ? "Due soon" : loan.status)}</td></tr>`);
}

function dashboardMember() {
  const loans = activeLoans();
  const overdue = loans.filter((loan) => loan.due_date < today()).length;
  const dueSoon = loans.filter((loan) => loan.due_date >= today() && loan.due_date <= new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)).length;
  const unpaid = unpaidFines().reduce((sum, fine) => sum + Number(fine.amount), 0);
  const reservations = activeReservations();
  const hero = heroForMember();
  const quick = `<section class="panel"><div class="panel-head"><h2>Quick access</h2></div><div class="panel-body"><div class="quick-grid">
    <button class="quick-card" data-page="search-books">${icon("search")}<span><strong>Search books</strong><small>Find something new</small></span></button>
    <button class="quick-card" data-page="my-borrowings">${icon("bookopen")}<span><strong>My borrowings</strong><small>${loans.length} active loans</small></span></button>
    <button class="quick-card" data-page="reservations">${icon("calendar")}<span><strong>Reservations</strong><small>${reservations.length} active holds</small></span></button>
    <button class="quick-card" data-page="my-fines">${icon("wallet")}<span><strong>Fines & payments</strong><small>${money(unpaid)} balance</small></span></button>
  </div></div></section>`;
  const title = pageMeta.dashboard;
  return `${pageHeading("Dashboard", `Good to see you, ${appData.user.name.split(/\s+/)[0]}. ${title[1]}`)}${hero}
    <div class="stats-grid">${statCard("Currently borrowed", loans.length, `<span class="up">${dueSoon} due this week</span>`, "bookopen", "#175ee8", "#edf3ff")}${statCard("Active reservations", reservations.length, `${reservations.filter((r) => r.status === "Ready for pickup").length} ready for pickup`, "calendar", "#8e63dc", "#f2edff")}${statCard("Overdue books", overdue, overdue ? '<span style="color:#d64e58">Please return soon</span>' : "Everything is on time", "clock", "#d18c39", "#fff4e5")}${statCard("Outstanding fines", money(unpaid), unpaid ? '<span style="color:#d64e58">Payment is due</span>' : "Your account is clear", "wallet", "#d64e58", "#fff0f0")}</div>
    <div class="dashboard-grid"><div class="stack">${tableWrap("Currently borrowed", "Your books and return dates", ["Book", "Due date", "Status"], loanRows(loans))}${tableWrap("Recently added", "Fresh picks from the collection", ["Book", "Category", "Shelf", "Availability"], bookMiniRows([...appData.books].slice(-5)))}</div><div class="stack">${quick}<section class="panel"><div class="panel-head"><div><h2>Library announcements</h2><small>Recent updates from your library</small></div><button class="panel-link" data-page="notifications">All notices ${icon("chevron")}</button></div><div class="notice-list">${appData.notifications.slice(0,3).map((notice) => `<div class="notice-row ${notice.read_at ? "" : "unread"}"><span class="notice-icon ${esc(notice.type)}">${icon(notice.type === "warning" ? "clock" : notice.type === "success" ? "check" : "bell")}</span><span class="notice-copy"><strong>${esc(notice.title)}</strong><small>${esc(notice.message)}</small></span></div>`).join("") || `<div class="empty-state">${icon("bell")}<strong>No updates yet</strong></div>`}</div></section></div></div>`;
}

function staffDashboard() {
  const admin = appData.user.role === "admin";
  const loans = activeLoans();
  const booksAvailable = appData.books.reduce((sum, book) => sum + book.available, 0);
  const copies = appData.books.reduce((sum, book) => sum + book.total_copies, 0);
  const members = appData.users.filter((user) => user.role === "member");
  const overdue = loans.filter((loan) => loan.due_date < today());
  const statMarkup = admin
    ? `${statCard("Book titles", appData.books.length.toLocaleString("en-IN"), `${booksAvailable} copies available`, "books", "#7041eb", "#f0ecff")}${statCard("Library members", members.length.toLocaleString("en-IN"), "Active member accounts", "users", "#357be8", "#edf3ff")}${statCard("Current loans", loans.length.toLocaleString("en-IN"), `${overdue.length} currently overdue`, "circulation", "#d89640", "#fff5e4")}${statCard("Unpaid fines", money(unpaidFines().reduce((sum, f) => sum + Number(f.amount), 0)), `${unpaidFines().length} accounts to review`, "wallet", "#dc5862", "#fff0f0")}`
    : `${statCard("Books in catalogue", appData.books.length.toLocaleString("en-IN"), `${booksAvailable} copies on shelf`, "books", "#087a60", "#e7f6f1")}${statCard("Active members", members.length.toLocaleString("en-IN"), "Member accounts", "users", "#357be8", "#edf3ff")}${statCard("Books on loan", loans.length.toLocaleString("en-IN"), `${overdue.length} overdue returns`, "circulation", "#d89640", "#fff5e4")}${statCard("Reservations", activeReservations().length.toLocaleString("en-IN"), "Across the collection", "calendar", "#8e63dc", "#f2edff")}`;
  const navPage = admin ? "book-catalogue" : "manage-books";
  const activity = appData.audit.slice(0, 5).map((row) => `<div class="activity-row"><span class="notice-icon success">${icon("check")}</span><span class="activity-copy"><strong>${esc(row.action)}</strong><small>${esc(row.actor_name || "Library")}${row.target ? ` · ${esc(row.target)}` : ""} · ${dateLabel(row.created_at)}</small></span></div>`).join("");
  return `${pageHeading(admin ? "Administrator Dashboard" : "Librarian Dashboard", `Welcome, ${appData.user.name}. Here's a live overview of the library.`)}${heroForStaff()}
    <div class="stats-grid">${statMarkup}</div>
    <div class="dashboard-grid"><div class="stack">${tableWrap("Recent circulation", "Latest books in the lending queue", ["Book", "Member", "Due date", "Status"], loanRows(loans, true), `<button class="panel-link" data-page="circulation">View all ${icon("chevron")}</button>`)}<section class="panel"><div class="panel-head"><div><h2>${admin ? "Collection snapshot" : "Collection activity"}</h2><small>${copies} copies across ${appData.books.length} titles</small></div><button class="panel-link" data-page="${navPage}">Open catalogue ${icon("chevron")}</button></div><div class="panel-body"><div class="report-grid"><div class="report-tile"><small>Available today</small><strong>${booksAvailable}</strong><span>On library shelves</span></div><div class="report-tile"><small>Currently on loan</small><strong>${copies - booksAvailable}</strong><span>Across active members</span></div><div class="report-tile"><small>Awaiting pickup</small><strong>${appData.reservations.filter((r) => r.status === "Ready for pickup").length}</strong><span>Reserved and ready</span></div></div></div></section></div>
    <div class="stack"><section class="panel"><div class="panel-head"><div><h2>Quick actions</h2><small>Common library desk workflows</small></div></div><div class="panel-body"><div class="quick-grid"><button class="quick-card" data-ui-action="issue-book">${icon("plus")}<span><strong>Issue a book</strong><small>Check out a title</small></span></button><button class="quick-card" data-ui-action="add-book">${icon("book")}<span><strong>Add a book</strong><small>Grow the catalogue</small></span></button><button class="quick-card" data-ui-action="add-member">${icon("users")}<span><strong>Add a member</strong><small>Create an account</small></span></button><button class="quick-card" data-page="reports">${icon("chart")}<span><strong>View reports</strong><small>Review library trends</small></span></button></div></div></section><section class="panel"><div class="panel-head"><div><h2>Recent activity</h2><small>Changes across your library</small></div><button class="panel-link" data-page="${admin ? "audit-logs" : "reports"}">View all ${icon("chevron")}</button></div><div class="activity-list">${activity || `<div class="empty-state">${icon("audit")}<strong>Activity will appear here</strong></div>`}</div></section></div></div>`;
}

function pageDashboard() { return appData.user.role === "member" ? dashboardMember() : staffDashboard(); }

function filteredBooks() {
  return appData.books.filter((book) => {
    const term = bookQuery.trim().toLowerCase();
    const textMatch = !term || [book.title, book.author, book.category, book.isbn, book.publisher].some((v) => String(v).toLowerCase().includes(term));
    const categoryMatch = bookCategory === "All" || book.category === bookCategory;
    const statusMatch = bookFilter === "All Books" || (bookFilter === "Available" ? book.available > 0 : book.available === 0);
    return textMatch && categoryMatch && statusMatch;
  });
}

function pageBooks(manage = false) {
  const categories = ["All", ...new Set(appData.books.map((book) => book.category))];
  const title = manage ? (appData.user.role === "admin" ? "Book Catalogue" : "Manage Books") : "Search Books";
  const heading = pageMeta[manage ? (appData.user.role === "admin" ? "book-catalogue" : "manage-books") : "search-books"];
  const actions = manage ? button("Add a book", "add-book", roleTone(appData.user.role), "plus") : "";
  const query = bookQuery;
  const grid = filteredBooks();
  const cards = grid.map((book) => `<article class="catalogue-card"><button class="cover-wrap" type="button" data-book-details="${book.id}" aria-label="View ${esc(book.title)}">${bookThumb(book, true)}</button><span class="status ${book.available ? "good" : "bad"}">${book.available ? `${book.available} available` : "On loan"}</span><h3>${esc(book.title)}</h3><p>${esc(book.author)}</p><div class="book-meta">${esc(book.category)} · ${esc(book.location)}</div><button class="button ${manage ? "soft" : "ghost"} small" data-book-details="${book.id}" type="button">${manage ? "View record" : "View details"}</button></article>`).join("");
  return `${pageHeading(title, heading[1], actions)}
    <div class="catalogue-layout"><aside class="filter-panel"><h3>${icon("filter")} Filters</h3><div class="filter-group"><strong>Availability</strong><label class="filter-option"><input type="radio" name="book-availability" value="All Books" ${bookFilter === "All Books" ? "checked" : ""}/> All books</label><label class="filter-option"><input type="radio" name="book-availability" value="Available" ${bookFilter === "Available" ? "checked" : ""}/> Available now</label><label class="filter-option"><input type="radio" name="book-availability" value="On loan" ${bookFilter === "On loan" ? "checked" : ""}/> Currently on loan</label></div><div class="filter-group"><strong>Category</strong>${categories.map((category) => `<label class="filter-option"><input type="radio" name="book-category" value="${esc(category)}" ${bookCategory === category ? "checked" : ""}/> ${esc(category)}</label>`).join("")}</div><div class="filter-group"><strong>Collection</strong><small style="color:#8996a8;font-size:9px;line-height:1.5">Browse shelves across the library or narrow your search by title, author, or ISBN.</small></div></aside>
    <section><div class="panel"><div class="toolbar"><div class="toolbar-left"><div class="inline-search">${icon("search")}<input id="catalogue-search" type="search" placeholder="Search titles, authors or ISBN" value="${esc(query)}" /></div><select id="sort-books" class="select-small"><option value="title">Title A–Z</option><option value="author">Author</option><option value="year">Newest edition</option></select><button class="button soft small" data-ui-action="clear-filters">Clear filters</button></div><div class="toolbar-right"><span style="color:#8996a8;font-size:10px">${grid.length} ${grid.length === 1 ? "title" : "titles"}</span></div></div><div class="filter-tabs">${["All Books", "Available", "On loan"].map((item) => `<button class="filter-tab ${bookFilter === item ? "active" : ""}" data-book-filter="${item}">${item}</button>`).join("")}</div><div class="panel-body"><div class="catalogue-grid">${cards || `<div class="empty-state" style="grid-column:1/-1">${icon("search")}<strong>No titles found</strong><p>Try a different title, author, or category.</p></div>`}</div></div></div></section></div>`;
}

function pageBorrowings() {
  const active = activeLoans();
  const overdue = active.filter((loan) => loan.due_date < today());
  const returned = appData.loans.filter((loan) => loan.status === "Returned");
  const rows = [...active, ...returned].filter((loan) => !listQuery || `${loan.book_title} ${loan.author}`.toLowerCase().includes(listQuery.toLowerCase())).map((loan) => `<tr><td><div class="table-title">${bookThumb({ title: loan.book_title, color: loan.book_color })}<span><strong>${esc(loan.book_title)}</strong><small>${esc(loan.author)}</small></span></div></td><td>${dateLabel(loan.issued_on)}</td><td>${dateLabel(loan.due_date)}</td><td>${loan.returned_on ? dateLabel(loan.returned_on) : "—"}</td><td>${statusBadge(loan.status === "Borrowed" && loan.due_date < today() ? "Overdue" : loan.status === "Borrowed" && loan.due_date <= new Date(Date.now()+5*86400000).toISOString().slice(0,10) ? "Due soon" : loan.status)}</td></tr>`);
  return `${pageHeading("My Borrowings", pageMeta["my-borrowings"][1], button("Find a book", "go-search", "ghost", "search"))}<div class="stats-grid">${statCard("Active loans", active.length, "Books currently with you", "bookopen")}${statCard("Due this week", active.filter((l) => l.due_date >= today() && l.due_date <= new Date(Date.now()+7*86400000).toISOString().slice(0,10)).length, "Plan a visit to return", "clock", "#d18c39", "#fff4e5")}${statCard("Overdue", overdue.length, overdue.length ? "Return to clear your account" : "No overdue books", "calendar", "#d64e58", "#fff0f0")}${statCard("Total borrowed", appData.loans.length, `${returned.length} returned`, "books", "#8e63dc", "#f2edff")}</div><section class="panel"><div class="toolbar"><div class="toolbar-left"><div class="inline-search">${icon("search")}<input type="search" data-list-query placeholder="Search your borrowings" value="${esc(listQuery)}" /></div></div><div class="toolbar-right"><span style="font-size:10px;color:#8b98aa">${rows.length} records</span></div></div>${rows.length ? `<div class="mini-table-wrap"><table class="data-table"><thead><tr><th>Book</th><th>Borrowed on</th><th>Due date</th><th>Returned</th><th>Status</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>` : `<div class="empty-state">${icon("bookopen")}<strong>No borrowings yet</strong><p>Browse the catalogue to find your next read.</p><button class="button green small" data-page="search-books">Browse books</button></div>`}<div class="panel-body" style="border-top:1px solid #edf0f5"><small style="color:#8190a4;font-size:10px">Renewals: contact the library desk before the due date. A title with an active reservation may not be renewed.</small></div></section>`;
}

function pageReservations(staff = false) {
  const records = staff ? activeReservations() : appData.reservations;
  const all = staff ? appData.reservations : appData.reservations;
  const rows = all.map((record) => `<tr><td><div class="table-title">${bookThumb({ title: record.book_title, color: record.book_color })}<span><strong>${esc(record.book_title)}</strong><small>${esc(record.author)}</small></span></div></td>${staff ? `<td><div class="member-cell"><span class="avatar">${esc(initial(record.member_name))}</span>${esc(record.member_name)}</div></td>` : ""}<td>${dateLabel(record.reserved_on)}</td><td>${record.status === "Waiting" ? `#${record.queue_position}` : "—"}</td><td>${statusBadge(record.status)}</td><td>${["Waiting","Ready for pickup"].includes(record.status) ? `<button class="button danger small" data-library-action="cancel_reservation" data-id="${record.id}">Cancel</button>` : "—"}</td></tr>`);
  const title = staff ? "Reservations" : "Reservations";
  return `${pageHeading(title, pageMeta.reservations[1], !staff ? button("Browse books", "go-search", "ghost", "search") : "")}<div class="stats-grid">${statCard("Active holds", activeReservations().length, "Awaiting a copy or pickup", "calendar")}${statCard("Ready for pickup", appData.reservations.filter((r) => r.status === "Ready for pickup").length, "Collect within 48 hours", "check", "#0a8668", "#e8f7f0")}${statCard("Waiting in queue", appData.reservations.filter((r) => r.status === "Waiting").length, "We’ll let you know when available", "clock", "#d18c39", "#fff4e5")}${staff ? statCard("All reservations", appData.reservations.length, "Across the collection", "books", "#8e63dc", "#f2edff") : statCard("Completed / cancelled", appData.reservations.filter((r) => !["Waiting","Ready for pickup"].includes(r.status)).length, "Your reservation history", "check", "#8e63dc", "#f2edff")}</div>${tableWrap("Reservation activity", "A clear view of every hold", ["Book", ...(staff ? ["Member"] : []), "Reserved on", "Queue", "Status", "Action"], rows)}${!staff ? `<section class="panel" style="margin-top:14px"><div class="panel-head"><div><h2>What happens next?</h2><small>Your place in line, without the guesswork.</small></div></div><div class="panel-body" style="display:flex;gap:14px;flex-wrap:wrap;color:#687890;font-size:10px;line-height:1.6"><span>① We’ll email and notify you when your book is ready.</span><span>② Pick up from the circulation desk within 48 hours.</span><span>③ Your 14-day loan starts at checkout.</span></div></section>` : ""}`;
}

function pageFines(staff = false) {
  const fines = appData.fines;
  const outstanding = fines.filter((f) => f.status !== "Paid");
  const paid = fines.filter((f) => f.status === "Paid");
  const rows = fines.map((fine) => `<tr><td>${staff ? `<div class="member-cell"><span class="avatar">${esc(initial(fine.member_name))}</span><span>${esc(fine.member_name)}<small style="display:block;color:#929fb1;font-size:9px">${esc(fine.member_id || fine.member_email)}</small></span></div>` : esc(fine.book_title || "Library charge")}</td>${staff ? `<td>${esc(fine.book_title || fine.description)}</td>` : `<td>${esc(fine.description)}</td>`}<td>${dateLabel(fine.issued_on)}</td><td class="money">${money(fine.amount)}</td><td>${statusBadge(fine.status)}</td><td>${fine.status === "Paid" ? "—" : staff ? `<button class="button soft small" data-library-action="pay_fine" data-id="${fine.id}">Record payment</button>` : `<span style="color:#8996a8;font-size:9px">Pay at library desk</span>`}</td></tr>`);
  const title = staff ? (appData.user.role === "admin" ? "Fines & Payments" : "Fines Management") : "Fines & Payments";
  const key = staff ? (appData.user.role === "admin" ? "fines-payments" : "fines-management") : "my-fines";
  const actions = staff ? button("Add a fine", "add-fine", roleTone(appData.user.role), "plus") : "";
  return `${pageHeading(title, pageMeta[key][1], actions)}<div class="stats-grid">${statCard(staff ? "Outstanding fines" : "Outstanding balance", money(outstanding.reduce((sum,f)=>sum+Number(f.amount),0)), `${outstanding.length} unpaid charge${outstanding.length===1?"":"s"}`, "wallet", "#d64e58", "#fff0f0")}${statCard("Collected", money(paid.reduce((sum,f)=>sum+Number(f.amount),0)), `${paid.length} payment${paid.length===1?"":"s"} recorded`, "check", "#0a8668", "#e8f7f0")}${statCard("Total charges", fines.length, "Fines and adjustments", "audit", "#8e63dc", "#f2edff")}${statCard("Payment method", "Library desk", "In-person payment record", "dollar", "#d18c39", "#fff4e5")}</div><section class="panel"><div class="panel-head"><div><h2>${staff ? "Fine ledger" : "Your fines"}</h2><small>Review the reason and status of each charge.</small></div></div>${fines.length ? `<div class="mini-table-wrap"><table class="data-table"><thead><tr><th>${staff?"Member":"Book"}</th><th>Details</th><th>Issued</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>` : `<div class="empty-state">${icon("check")}<strong>Your account is clear</strong><p>There are no outstanding library fines.</p></div>`}<div class="panel-body" style="border-top:1px solid #edf0f5"><small style="color:#8492a7;font-size:10px">${staff ? "Payments recorded here update the member's account." : "To pay at the desk, visit the circulation counter. For a payment query, contact the library."}</small></div></section>`;
}

function pageNotifications() {
  const notices = [...appData.notifications];
  const headingActions = appData.user.role === "member" ? `<button class="button soft" data-library-action="mark_all_read">Mark all as read</button>` : `${button("Publish a notice", "publish-notice", roleTone(appData.user.role), "plus")}<button class="button soft" data-library-action="mark_all_read">Mark all as read</button>`;
  return `${pageHeading("Notifications", pageMeta.notifications[1], headingActions)}<div class="dashboard-grid equal"><section class="panel"><div class="panel-head"><div><h2>All notifications</h2><small>${unseenNotices()} unread updates</small></div><select class="select-small" id="notice-filter"><option value="all">All notices</option><option value="unread">Unread only</option><option value="read">Read</option></select></div><div class="notice-list">${notices.map((notice) => `<div class="notice-row ${notice.read_at ? "" : "unread"}" data-notice-row data-read="${notice.read_at ? "true" : "false"}"><span class="notice-icon ${esc(notice.type)}">${icon(notice.type === "warning" ? "clock" : notice.type === "success" ? "check" : notice.type === "error" ? "belloff" : "bell")}</span><span class="notice-copy"><strong>${esc(notice.title)}</strong><small>${esc(notice.message)}</small><small>${dateLabel(notice.created_at)}</small></span>${!notice.read_at ? `<button class="button soft small" data-library-action="mark_read" data-id="${notice.id}">Mark read</button>` : statusBadge("Read")}</div>`).join("") || `<div class="empty-state">${icon("bell")}<strong>Nothing new right now</strong><p>We’ll place new account updates here.</p></div>`}</div></section><div class="stack"><section class="panel"><div class="panel-head"><div><h2>Notification preferences</h2><small>Choose the updates you want to hear about.</small></div></div><div class="panel-body">${preferenceRows()}</div></section><section class="panel"><div class="panel-head"><h2>Need a hand?</h2></div><div class="panel-body" style="color:#7d8ca1;font-size:10px;line-height:1.7">Visit the library desk for account questions or call the team at <strong style="color:#34506e">+91 80 2345 6789</strong>. We’re happy to help.</div></section></div></div>`;
}

function pageProfile() {
  const user = appData.user;
  const lends = appData.loans.length;
  const extras = user.role === "admin"
    ? `<section class="panel" style="margin-top:14px"><div class="panel-head"><h2>Administrator sign-in</h2></div><div class="panel-body" style="color:#718097;font-size:11px;line-height:1.65">Only the administrator login email and password can be changed from this profile. The current password is required to save credential changes.</div></section>`
    : `<div class="dashboard-grid equal" style="margin-top:14px"><section class="panel"><div class="panel-head"><h2>Reading at Read@SIL</h2></div><div class="panel-body"><div class="report-grid">${[["Books borrowed",lends],["Reservations",appData.reservations.length],["Fines paid",appData.fines.filter(f=>f.status==="Paid").length]].map(([label,value])=>`<div class="report-tile"><small>${label}</small><strong>${value}</strong><span>Since joining</span></div>`).join("")}</div></div></section><section class="panel"><div class="panel-head"><h2>Your preferences</h2></div><div class="panel-body">${preferenceRows()}</div></section></div>`;
  return `${pageHeading("My Profile", pageMeta.profile[1], button(user.role === "admin" ? "Change login credentials" : "Edit profile", "edit-profile", "ghost", user.role === "admin" ? "lock" : "edit"))}<section class="panel"><div class="profile-banner"><div class="avatar">${esc(initial(user.name))}</div><div><h2>${esc(user.name)}</h2><p>${esc(roleLabel(user.role,user.member_id))} · Member since ${dateLabel(user.joined_on)}</p></div>${statusBadge(user.status)}</div><div class="panel-body"><h3 style="margin:0 0 14px;color:#354a68;font:800 12px Manrope">Personal information</h3><div class="profile-grid">${[["University email",user.email], ["Member ID",user.member_id||"—"], ["Department",user.department||"—"], ["Phone number",user.phone||"—"], ["Account type",roleLabel(user.role,user.member_id)], ["Account status",user.status]].map(([label,value])=>`<div class="profile-item"><small>${label}</small><strong>${esc(value)}</strong></div>`).join("")}</div></div></section>${extras}`;
}

function pageManageMembers() {
  const rows = appData.users.filter((user) => user.role === "member").filter((user) => !listQuery || `${user.name} ${user.email} ${user.member_id} ${user.department}`.toLowerCase().includes(listQuery.toLowerCase())).filter((user) => memberFilter === "All" || user.status === memberFilter).map((member) => {
    const count = appData.loans.filter((loan)=>String(loan.user_id)===String(member.id)&&loan.status==="Borrowed").length;
    const outstanding = appData.fines.filter((fine)=>String(fine.user_id)===String(member.id)&&fine.status!=="Paid").reduce((sum,fine)=>sum+Number(fine.amount),0);
    return `<tr><td><div class="member-cell"><span class="avatar">${esc(initial(member.name))}</span><span><strong>${esc(member.name)}</strong><small style="display:block;color:#929fb1;font-size:9px">${esc(member.email)}</small></span></div></td><td>${esc(member.member_id||"—")}</td><td>${esc(member.department||"General")}</td><td>${count}</td><td>${outstanding?money(outstanding):"—"}</td><td>${statusBadge(member.status)}</td><td><button class="button soft small" data-edit-member="${member.id}">Manage</button></td></tr>`;
  });
  return `${pageHeading("Manage Members", pageMeta["manage-members"][1], button("Add a member", "add-member", "green", "plus"))}<div class="stats-grid">${statCard("Library members", appData.users.filter(u=>u.role==="member").length, "Accounts across all departments", "users", "#087a60", "#e8f7f0")}${statCard("Active today", appData.users.filter(u=>u.role==="member"&&u.status==="Active").length, "Members in good standing", "check", "#155bd9", "#edf3ff")}${statCard("Current loans", appData.loans.filter(l=>l.status==="Borrowed").length, "Across all member accounts", "bookopen", "#8e63dc", "#f2edff")}${statCard("Outstanding fines", money(appData.fines.filter(f=>f.status!=="Paid").reduce((sum,f)=>sum+Number(f.amount),0)), "Review at the circulation desk", "wallet", "#d18c39", "#fff4e5")}</div><section class="panel"><div class="toolbar"><div class="toolbar-left"><div class="inline-search">${icon("search")}<input type="search" data-list-query placeholder="Find a member by name, ID or email" value="${esc(listQuery)}" /></div><select class="select-small" id="member-filter">${["All","Active","Suspended"].map((x)=>`<option ${memberFilter===x?"selected":""}>${x}</option>`).join("")}</select></div><div class="toolbar-right"><span style="font-size:10px;color:#8996a8">${rows.length} members</span></div></div>${rows.length?`<div class="mini-table-wrap"><table class="data-table"><thead><tr><th>Member</th><th>Member ID</th><th>Department</th><th>On loan</th><th>Fine balance</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`:`<div class="empty-state">${icon("users")}<strong>No members found</strong></div>`}</section>`;
}

function pageCirculation() {
  const rows = appData.loans.map((loan) => `<tr><td><div class="table-title">${bookThumb({title:loan.book_title,color:loan.book_color})}<span><strong>${esc(loan.book_title)}</strong><small>${esc(loan.author)}</small></span></div></td><td><div class="member-cell"><span class="avatar">${esc(initial(loan.member_name))}</span><span>${esc(loan.member_name)}<small style="display:block;color:#929fb1;font-size:9px">${esc(loan.member_id||loan.member_email)}</small></span></div></td><td>${dateLabel(loan.issued_on)}</td><td>${dateLabel(loan.due_date)}</td><td>${statusBadge(loan.status === "Borrowed" && loan.due_date < today()?"Overdue":loan.status)}</td><td>${loan.status === "Borrowed" ? `<button class="button green small" data-library-action="return" data-id="${loan.id}">Check in</button>` : statusBadge("Returned")}</td></tr>`);
  return `${pageHeading("Book Issue / Return", pageMeta.circulation[1], button("Issue a book", "issue-book", "green", "plus"))}<div class="stats-grid">${statCard("Books on loan", activeLoans().length, "Active checked-out books", "bookopen", "#087a60", "#e8f7f0")}${statCard("Issued today", appData.loans.filter(l=>l.issued_on===today()).length, "New circulation records", "circulation", "#175ee8", "#edf3ff")}${statCard("Overdue returns", activeLoans().filter(l=>l.due_date<today()).length, "Follow up with members", "clock", "#d64e58", "#fff0f0")}${statCard("Available copies", appData.books.reduce((sum,b)=>sum+b.available,0), "Ready to check out", "books", "#8e63dc", "#f2edff")}</div><section class="panel"><div class="toolbar"><div class="toolbar-left"><div class="inline-search">${icon("search")}<input type="search" data-list-query placeholder="Search loans or members" value="${esc(listQuery)}" /></div><select class="select-small" id="loan-filter"><option value="All">All records</option><option value="Borrowed">Active loans</option><option value="Returned">Returned</option><option value="Overdue">Overdue</option></select></div><div class="toolbar-right"><button class="button soft small" data-ui-action="export-circulation">${icon("download")} Export</button></div></div>${tableWrap("Circulation ledger", "Manage every issue and return in one place", ["Book","Member","Issued","Due date","Status","Action"], rows)}</section>`;
}

function pageReports() {
  const loans = appData.loans;
  const members = appData.users.filter(u=>u.role==="member");
  const categories = Object.entries(appData.books.reduce((counts, book) => (counts[book.category]=(counts[book.category]||0)+book.total_copies,counts), {}));
  const maxCount = Math.max(1,...categories.map(([,count])=>count));
  return `${pageHeading("Reports & Analytics", pageMeta.reports[1], `<button class="button soft" data-ui-action="export-report">${icon("download")} Export report</button>`)}<div class="report-grid">${[["Total titles",appData.books.length,"Catalogue records"],["Member accounts",members.length,"Library members"],["Loans this year",loans.length,"Circulation records"],["Books available",appData.books.reduce((sum,b)=>sum+b.available,0),"Copies on shelf"],["Reservations",appData.reservations.length,"All hold records"],["Fines collected",money(appData.fines.filter(f=>f.status==="Paid").reduce((sum,f)=>sum+Number(f.amount),0)),"Paid fines"]].map(([a,b,c])=>`<div class="report-tile"><small>${a}</small><strong>${b}</strong><span>${c}</span></div>`).join("")}</div><div class="dashboard-grid equal" style="margin-top:14px"><section class="panel"><div class="panel-head"><div><h2>Collection by category</h2><small>Copies by subject area</small></div></div><div class="panel-body">${categories.map(([name,count])=>`<div style="display:grid;grid-template-columns:100px 1fr 28px;align-items:center;gap:8px;margin:11px 0;color:#63738b;font-size:10px"><span>${esc(name)}</span><span style="height:7px;border-radius:5px;background:#edf0f6;overflow:hidden"><i style="display:block;width:${Math.round(count/maxCount*100)}%;height:100%;border-radius:5px;background:var(--accent)"></i></span><strong style="color:#455a75;text-align:right">${count}</strong></div>`).join("")}</div></section><section class="panel"><div class="panel-head"><div><h2>Circulation overview</h2><small>Active and completed loans</small></div></div><div class="panel-body"><div class="report-grid">${[["Active",activeLoans().length],["Returned",loans.filter(l=>l.status==="Returned").length],["Overdue",activeLoans().filter(l=>l.due_date<today()).length]].map(([name,num])=>`<div class="report-tile"><small>${name}</small><strong>${num}</strong><span>Library loans</span></div>`).join("")}</div><div class="chart" style="display:flex;align-items:flex-end;justify-content:space-around;gap:10px;padding:20px 10px 0;border-bottom:1px solid #edf0f5">${[0.4,0.58,0.5,0.76,0.63,0.9,0.7,1].map((v,i)=>`<span title="Month ${i+1}" style="width:7%;height:${v*100}%;max-height:120px;min-height:28px;border-radius:5px 5px 0 0;background:color-mix(in srgb,var(--accent) ${i*8+28}%,white)"></span>`).join("")}</div><div class="legend"><span><i></i>Monthly circulation · sample trend</span></div></div></section></div><div style="margin-top:12px;color:#8d99aa;font-size:9px">Summary figures are calculated from the current library ledger. Chart trend is a visual guide until more historical activity is recorded.</div>`;
}

function pageAudit() {
  const rows = appData.audit.map((entry) => `<tr><td>${dateLabel(entry.created_at)}</td><td>${esc(entry.action)}</td><td>${esc(entry.actor_name||"System")}</td><td>${esc(entry.target||"—")}</td><td>${esc(entry.detail||"—")}</td><td>${statusBadge("Recorded")}</td></tr>`);
  return `${pageHeading("Audit Logs", pageMeta["audit-logs"][1], `<button class="button soft" data-ui-action="export-audit">${icon("download")} Export logs</button>`)}<div class="stats-grid">${statCard("Recent entries", appData.audit.length, "Showing latest system activity", "audit")}${statCard("System actors", new Set(appData.audit.map((x)=>x.actor_id)).size, "Accounts with recent activity", "users", "#175ee8", "#edf3ff")}${statCard("Book actions", appData.audit.filter((x)=>/book/i.test(x.action)).length, "Catalogue or circulation", "book", "#087a60", "#e8f7f0")}${statCard("Member actions", appData.audit.filter((x)=>/member|user/i.test(x.action)).length, "Account updates", "shield", "#8e63dc", "#f2edff")}</div>${tableWrap("System activity", "A traceable record of library operations", ["Date","Activity","Performed by","Target","Details","Status"], rows)}`;
}

function pageUserManagement() {
  const rows = appData.users.map((person) => `<tr><td><div class="member-cell"><span class="avatar">${esc(initial(person.name))}</span><span><strong>${esc(person.name)}</strong><small style="display:block;color:#929fb1;font-size:9px">${esc(person.email)}</small></span></div></td><td>${statusBadge(roleLabel(person.role,person.member_id))}</td><td>${esc(person.department||"General")}</td><td>${esc(person.joined_on?dateLabel(person.joined_on):"—")}</td><td>${statusBadge(person.status)}</td><td>${person.role==="member"?`<button class="button soft small" data-edit-member="${person.id}">Manage</button>`:person.role==="librarian"&&person.status==="Pending approval"?`<button class="button purple small" data-library-action="approve_librarian" data-id="${person.id}">Approve access</button>`:statusBadge("Staff account")}</td></tr>`);
  return `${pageHeading("User Management", pageMeta["user-management"][1], button("Add a member", "add-member", "purple", "plus"))}<div class="stats-grid">${statCard("Total accounts", appData.users.length, "Across all roles", "users", "#7041eb", "#f0ecff")}${statCard("Library members", appData.users.filter(u=>u.role==="member").length, "Student and faculty accounts", "student")}${statCard("Librarian accounts", appData.users.filter(u=>u.role==="librarian"&&u.status==="Active").length, "Approved library staff", "bookopen", "#087a60", "#e8f7f0")}${statCard("Pending librarian requests", appData.users.filter(u=>u.role==="librarian"&&u.status==="Pending approval").length, "Review before staff sign-in", "clock", "#d18c39", "#fff4e5")}</div>${tableWrap("Library accounts", "Review member registrations and approve librarian access", ["Account","Role","Department","Joined","Status","Action"], rows)}`;
}

function settingsPage(policyOnly = false) {
  const s = appData.settings;
  const title = policyOnly ? "Policies & Access" : "System Settings";
  const headingKey = policyOnly ? "policies" : "system-settings";
  const mainFields = `<div class="field"><label for="setting-name">Library name</label><input id="setting-name" name="institution_name" value="${esc(s.institution_name||"Saptagiri Information Library")}" /></div><div class="field"><label for="setting-loan">Standard loan period (days)</label><input id="setting-loan" name="loan_period_days" type="number" min="1" max="60" value="${esc(s.loan_period_days||14)}" /></div><div class="field"><label for="setting-limit">Maximum active loans per member</label><input id="setting-limit" name="max_active_loans" type="number" min="1" max="20" value="${esc(s.max_active_loans||5)}" /></div><div class="field"><label for="setting-fine">Fine per overdue day (₹)</label><input id="setting-fine" name="fine_per_day" type="number" min="0" step="5" value="${esc(s.fine_per_day||20)}" /></div>`;
  return `${pageHeading(title, pageMeta[headingKey][1])}<form id="settings-form"><div class="setting-grid"><section class="setting-card"><h3>${policyOnly?"Borrowing policies":"Library identity"}</h3><p>${policyOnly?"Set clear rules for loans and overdue items.":"Keep your workspace name and collection controls current."}</p>${mainFields}</section><section class="setting-card"><h3>Account access</h3><p>Control how members and staff use the library workspace.</p><div class="settings-toggle-row">Members can place reservations<label class="switch"><input type="checkbox" name="public_reservations" ${s.public_reservations!=="false"?"checked":""}/><span></span></label></div><div class="field" style="margin-top:12px"><label>Authentication</label><div style="padding:10px;border:1px solid #e8edf3;border-radius:7px;color:#536681;background:#f8f9fc;font-size:10px">Protected with signed Read@SIL staff and member accounts.</div></div></section><section class="setting-card"><h3>Library workspace</h3><p>Information displayed to your readers and library staff.</p><div class="profile-grid"><div class="profile-item"><small>Library</small><strong>Saptagiri Information Library</strong></div><div class="profile-item"><small>Workspace</small><strong>Read@SIL web portal</strong></div><div class="profile-item"><small>Service desk</small><strong>+91 80 2345 6789</strong></div><div class="profile-item"><small>Service email</small><strong>library@readasil.edu</strong></div></div></section><section class="setting-card"><h3>Book cover storage</h3><p>Book cover uploads use a private cloud storage provider configured in the local environment file.</p><div class="settings-toggle-row">Provider ${statusBadge(appData.storage?.configured ? (appData.storage.provider==="s3"?"Amazon S3":"Cloudinary") : "Not configured")}</div><div style="margin-top:10px;color:#8190a4;font-size:10px;line-height:1.6">Set <code>FILE_STORAGE_PROVIDER</code> to <code>cloudinary</code> or <code>s3</code> in <code>.env</code>, then add the provider credentials. Uploads are limited to image files up to 3 MB.</div></section><section class="setting-card"><h3>Staff access</h3><p>People who can manage circulation and library operations.</p><div class="activity-list">${appData.users.filter(u=>u.role!=="member").map((u)=>`<div class="activity-row"><span class="avatar">${esc(initial(u.name))}</span><span class="activity-copy"><strong>${esc(u.name)}</strong><small>${esc(u.email)}</small></span>${statusBadge(roleLabel(u.role))}</div>`).join("")}</div></section></div><div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="button purple" type="submit">Save policies</button></div></form>`;
}

function currentPageBody() {
  const role = appData.user.role;
  switch (activePage) {
    case "dashboard": return pageDashboard();
    case "search-books": return pageBooks(false);
    case "manage-books": return pageBooks(true);
    case "book-catalogue": return pageBooks(true);
    case "my-borrowings": return pageBorrowings();
    case "reservations": return pageReservations(role !== "member");
    case "my-fines": return pageFines(false);
    case "fines-management":
    case "fines-payments": return pageFines(true);
    case "notifications": return pageNotifications();
    case "profile": return role === "member" ? pageProfile() : pageProfile();
    case "manage-members": return pageManageMembers();
    case "circulation": return pageCirculation();
    case "reports": return pageReports();
    case "audit-logs": return pageAudit();
    case "user-management": return pageUserManagement();
    case "system-settings": return settingsPage(false);
    case "policies": return settingsPage(true);
    default: activePage = "dashboard"; return pageDashboard();
  }
}

function renderApp() {
  if (!appData) return renderLogin();
  document.documentElement.style.setProperty("--role-accent", loginRoles[appData.user.role === "admin" ? "admin" : appData.user.role === "librarian" ? "librarian" : "student"].color);
  $("#app").innerHTML = `<div class="app-shell" data-theme="${themeRole(appData.user.role)}">${renderSidebar()}<div class="workspace">${renderTopbar()}<main class="main-content">${currentPageBody()}<footer class="app-footer"><span>© ${new Date().getFullYear()} Read@SIL · Saptagiri Information Library</span><span>Discover · Read · Grow</span></footer></main></div></div>`;
}

async function signIn(choice, email, password) {
  loginError = "";
  const role = loginRoles[choice];
  const submit = $("#login-submit");
  if (submit) { submit.disabled = true; submit.textContent = "Connecting…"; }
  try {
    const result = await request("/api/login", { method: "POST", body: JSON.stringify({ email, password, role: role.apiRole, memberType: choice }) });
    localStorage.setItem("readasil_token", result.token);
    if (choice === "admin") localStorage.setItem("readasil_admin_email", email);
    appData = await request("/api/bootstrap");
    activePage = "dashboard"; listQuery = ""; bookQuery = "";
    renderApp();
  } catch (error) {
    loginError = error.message;
    renderLogin();
    if ($("#login-email")) $("#login-email").value = email;
    if ($("#login-password")) $("#login-password").value = password;
  }
}

async function registerAccount(values) {
  loginError = "";
  authMessage = "";
  const { confirm_password, ...payload } = values;
  if (payload.password !== confirm_password) {
    loginError = "The passwords do not match.";
    renderLogin();
    restoreRegistrationFields(values);
    return;
  }
  try {
    const result = await request("/api/register", { method: "POST", body: JSON.stringify({ ...payload, accountType: loginChoice }) });
    if (result.token) {
      localStorage.setItem("readasil_token", result.token);
      appData = await request("/api/bootstrap");
      authMode = "login";
      activePage = "dashboard";
      renderApp();
      showToast(result.message);
    } else {
      authMode = "login";
      loginError = "";
      authMessage = result.message;
      renderLogin();
      if ($("#login-email")) $("#login-email").value = payload.email;
      if ($("#login-password")) $("#login-password").value = "";
    }
  } catch (error) {
    loginError = error.message;
    authMessage = "";
    renderLogin();
    restoreRegistrationFields(values);
  }
}

function restoreRegistrationFields(values) {
  const selectors = { name: "#register-name", email: "#register-email", department: "#register-department", phone: "#register-phone", password: "#register-password", confirm_password: "#register-confirm-password" };
  for (const [key, selector] of Object.entries(selectors)) if ($(selector)) $(selector).value = values[key] || "";
}

async function signOut() {
  try { await request("/api/logout", { method: "POST", body: "{}" }); } catch { /* local sign-out still clears this browser */ }
  localStorage.removeItem("readasil_token");
  appData = null; activePage = "dashboard"; loginChoice = "student"; authMode = "login"; authMessage = ""; loginError = ""; renderLogin();
}

function goTo(page) {
  activePage = page;
  mobileNavOpen = false;
  listQuery = "";
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message, error = false) {
  const node = document.createElement("div");
  node.className = `toast ${error ? "error" : ""}`;
  node.innerHTML = `${icon(error ? "close" : "check")}<span>${esc(message)}</span>`;
  $("#toast-region").append(node);
  setTimeout(() => node.remove(), 4200);
}

async function performAction(action, payload = {}) {
  try {
    const result = await request("/api/actions", { method: "POST", body: JSON.stringify({ action, payload }) });
    appData = result.data;
    if (action === "update_profile" && appData.user.role === "admin") localStorage.setItem("readasil_admin_email", appData.user.email);
    renderApp();
    showToast(result.message);
  } catch (error) { showToast(error.message, true); }
}

function openModal(title, content) {
  const dialog = $("#modal");
  dialog.innerHTML = `<div class="modal-head"><h2>${title}</h2><button class="modal-close" type="button" data-close-modal aria-label="Close">${icon("close")}</button></div><div class="modal-content">${content}</div>`;
  if (!dialog.open) dialog.showModal();
}

function closeModal() { const dialog = $("#modal"); if (dialog.open) dialog.close(); }

function bookDetails(id) {
  const book = appData.books.find((item) => String(item.id) === String(id));
  if (!book) return;
  const existingHold = appData.reservations.some((r)=>String(r.book_id)===String(book.id)&&["Waiting","Ready for pickup"].includes(r.status));
  openModal("Book details", `<div class="book-detail">${bookThumb(book,true)}<div><span class="status ${book.available?"good":"warn"}">${book.available?`${book.available} copies available`:"All copies on loan"}</span><h2 style="margin-top:10px">${esc(book.title)}</h2><p>by ${esc(book.author)}</p><p>${esc(book.description||"Explore this title at the Saptagiri Information Library.")}</p><div class="book-detail-meta"><span>${esc(book.category)}</span><span>${esc(book.year)}</span><span>${esc(book.location)}</span><span>ISBN ${esc(book.isbn||"Not recorded")}</span></div>${appData.user.role==="member"?`<div class="book-detail-actions">${book.available?`<button class="button green" type="button" data-modal-action="borrow" data-id="${book.id}">Borrow this book</button>`:`<button class="button navy" type="button" data-modal-action="reserve" data-id="${book.id}" ${existingHold?"disabled":""}>${existingHold?"Reservation active":"Place a reservation"}</button>`}</div>`:`<div class="book-detail-actions"><button class="button ${roleTone(appData.user.role)}" type="button" data-modal-action="edit-book" data-id="${book.id}">${icon("edit")} Edit record</button></div>`}</div></div>`);
}

function modalForm(kind, row = null) {
  let title = "", fields = "", action = "";
  const textField = (name,label,value="",type="text",placeholder="") => `<div class="field"><label for="modal-${name}">${label}</label><input id="modal-${name}" name="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${["title","author","name","email","amount"].includes(name)?"required":""}/></div>`;
  const selectField = (name,label,options) => `<div class="field"><label for="modal-${name}">${label}</label><select id="modal-${name}" name="${name}" required>${options}</select></div>`;
  const descField = (name,label,value="") => `<div class="field span-2"><label for="modal-${name}">${label}</label><textarea id="modal-${name}" name="${name}" rows="3">${esc(value)}</textarea></div>`;
  if (kind === "book" || kind === "edit-book") {
    title = kind === "book" ? "Add a book to the catalogue" : "Edit catalogue record"; action = kind === "book" ? "create_book" : "update_book";
    fields = `<div class="field"><label for="modal-title">Book title</label><input id="modal-title" name="title" required value="${esc(row?.title||"")}" /></div><div class="field"><label for="modal-author">Author</label><input id="modal-author" name="author" required value="${esc(row?.author||"")}" /></div><div class="field"><label for="modal-category">Category</label><select id="modal-category" name="category">${["Technology","Fiction","Design","Psychology","Self Development","History","Biography","Research","General"].map((v)=>`<option ${row?.category===v?"selected":""}>${v}</option>`).join("")}</select></div>${textField("isbn","ISBN",row?.isbn||"")}${textField("publisher","Publisher",row?.publisher||"")}${textField("year","Publication year",row?.year||new Date().getFullYear(),"number")}${textField("location","Shelf / location",row?.location||"Main Library")}${textField("total_copies","Total copies",row?.total_copies||1,"number")}${descField("description","Description",row?.description||"")}<div class="field span-2"><label for="modal-cover">Book cover (optional · JPG, PNG, WebP or GIF · max 3 MB)</label><input id="modal-cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp,image/gif" ${appData.storage?.configured?"":"disabled"}/>${appData.storage?.configured?(row?.cover_url?`<small style="color:#8492a7;font-size:9px">A cover is already saved. Choose another image to replace it.</small>`:""):`<small style="color:#8492a7;font-size:9px">Configure Cloudinary or Amazon S3 in .env to enable cover uploads.</small>`}</div>`;
  } else if (kind === "member" || kind === "edit-member") {
    title = kind === "member" ? "Add a library member" : "Manage member account"; action = kind === "member" ? "create_member" : "update_member";
    fields = `<div class="field"><label for="modal-name">Full name</label><input id="modal-name" name="name" required value="${esc(row?.name||"")}" /></div><div class="field"><label for="modal-email">University email</label><input id="modal-email" name="email" type="email" required value="${esc(row?.email||"")}" ${kind==="edit-member"?"disabled":""} /></div>${textField("department","Department",row?.department||"General")}${textField("phone","Phone",row?.phone||"")}${kind==="member"?`${textField("member_id","Member ID","")}${textField("password","Temporary password","Read@SIL2026","text")}`:`<div class="field"><label for="modal-status">Account status</label><select id="modal-status" name="status"><option ${row?.status==="Active"?"selected":""}>Active</option><option ${row?.status==="Suspended"?"selected":""}>Suspended</option></select></div><div class="field"><label>Member ID</label><input value="${esc(row?.member_id||"")}" disabled /></div>`}`;
  } else if (kind === "issue") {
    title="Issue a book"; action="issue";
    fields = `${selectField("user_id","Library member",`<option value="">Select a member</option>${memberOptions()}`)}${selectField("book_id","Available title",`<option value="">Select a book</option>${availableBookOptions()}`)}<div class="field span-2" style="padding:10px;border-radius:8px;background:#f3f8f5;color:#647a72;font-size:10px;line-height:1.5">Standard loan period: ${esc(appData.settings.loan_period_days||14)} days. The due date will be calculated automatically.</div>`;
  } else if (kind === "fine") {
    title="Add a fine"; action="add_fine";
    fields = `${selectField("user_id","Library member",`<option value="">Select a member</option>${memberOptions()}`)}${textField("amount","Amount (₹)","","number")}${descField("description","Reason","Library fine")}`;
  } else if (kind === "notice") {
    title="Publish a library notice"; action="add_notification";
    fields = `${textField("title","Notice title")}${selectField("type","Notice type",`<option value="info">Information</option><option value="success">Update</option><option value="warning">Reminder</option>`)}${descField("message","Message")}${selectField("audience","Audience",`<option value="all">All members</option>${memberOptions()}`)}`;
  } else if (kind === "profile") {
    if (appData.user.role === "admin") {
      title="Change administrator login credentials"; action="update_profile";
      fields = `${textField("email","Login email",appData.user.email,"email")}<div class="field"><label for="modal-current_password">Current password</label><input id="modal-current_password" name="current_password" type="password" autocomplete="current-password" required /></div>${textField("new_password","New password","","password","Optional · leave blank to keep current")}`;
    } else {
      title="Edit your profile"; action="update_profile";
      fields = `${textField("name","Full name",appData.user.name)}${textField("phone","Phone number",appData.user.phone||"")}${textField("current_password","Current password","","password","Required to change password")}${textField("new_password","New password","","password","Leave blank to keep current")}`;
    }
  }
  if (!title) return;
  openModal(title, `<form id="modal-form" data-form-action="${action}" data-record-id="${row?.id||""}"><div class="modal-grid">${fields}</div><div class="modal-actions"><button class="button soft" type="button" data-close-modal>Cancel</button>${kind==="edit-book"?`<button class="button danger" type="button" data-delete-book="${row.id}">${icon("trash")} Remove title</button>`:""}<button class="button ${roleTone(appData.user.role)}" type="submit">${kind==="issue"?"Issue book":kind==="profile"?appData.user.role==="admin"?"Save login credentials":"Save profile":kind==="edit-member"?"Save changes":kind==="edit-book"?"Save record":kind==="book"?"Add to catalogue":kind==="member"?"Add member":kind==="fine"?"Add fine":"Publish notice"}</button></div></form>`);
}

async function handleModalSubmit(form) {
  if (modalBusy) return;
  modalBusy = true;
  const action = form.dataset.formAction;
  const formData = new FormData(form);
  const coverFile = formData.get("cover");
  const values = Object.fromEntries([...formData.entries()].filter(([key]) => key !== "cover"));
  if (action === "update_book" || action === "update_member") values.id = form.dataset.recordId;
  if (action === "update_profile") values.id = appData.user.id;
  if (action === "update_settings") {
    const settings = Object.fromEntries(new FormData(form).entries());
    settings.public_reservations = form.elements.public_reservations.checked;
    try { const result=await request("/api/actions",{method:"POST",body:JSON.stringify({action,payload:settings})}); appData=result.data; closeModal(); renderApp(); showToast(result.message); }
    catch(error){ showToast(error.message,true); }
    modalBusy=false; return;
  }
  const submit = $("[type=submit]",form); if(submit){submit.disabled=true;submit.textContent="Saving…";}
  try {
    const result=await request("/api/actions",{method:"POST",body:JSON.stringify({action,payload:values})});
    appData=result.data;
    if (action === "update_profile" && appData.user.role === "admin") localStorage.setItem("readasil_admin_email", appData.user.email);
    let toastMessage = result.message;
    if ((action === "create_book" || action === "update_book") && coverFile instanceof File && coverFile.size) {
      const fileData = new FormData(); fileData.append("cover", coverFile);
      try {
        const token = localStorage.getItem("readasil_token") || "";
        const coverResponse = await fetch(`/api/books/${encodeURIComponent(result.data.entityId || values.id)}/cover`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fileData });
        const coverResult = await coverResponse.json().catch(() => ({}));
        if (!coverResponse.ok) throw new Error(coverResult.error || "Book details saved, but the cover could not be uploaded.");
        appData = coverResult.data;
        toastMessage += " Cover uploaded.";
      } catch (coverError) {
        closeModal(); renderApp(); showToast(coverError.message, true); modalBusy = false; return;
      }
    }
    closeModal(); renderApp(); showToast(toastMessage);
  } catch(error) {
    showToast(error.message,true);
    if(submit){submit.disabled=false;submit.textContent="Try again";}
  }
  modalBusy=false;
}

function exportCsv(filename, headers, rows) {
  const csv = [headers, ...rows].map((line) => line.map((cell) => `"${String(cell ?? "").replaceAll('"','""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff",csv],{type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob); const link=document.createElement("a");link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url);
}

function exportAction(action) {
  if (action === "export-circulation") exportCsv("readasil-circulation.csv",["Book","Member","Member ID","Issued","Due date","Status"],appData.loans.map((l)=>[l.book_title,l.member_name,l.member_id,l.issued_on,l.due_date,l.status]));
  if (action === "export-report") exportCsv("readasil-library-summary.csv",["Metric","Value"],[["Book titles",appData.books.length],["Available copies",appData.books.reduce((s,b)=>s+b.available,0)],["Current loans",activeLoans().length],["Reservations",appData.reservations.length],["Member accounts",appData.users.filter(u=>u.role==="member").length],["Outstanding fines",unpaidFines().reduce((s,f)=>s+Number(f.amount),0)]]);
  if (action === "export-audit") exportCsv("readasil-audit-logs.csv",["Timestamp","Action","Actor","Target","Details"],appData.audit.map((a)=>[a.created_at,a.action,a.actor_name,a.target,a.detail]));
}

async function loadApp() {
  const token = localStorage.getItem("readasil_token");
  if (token) {
    try { appData = await request("/api/bootstrap"); renderApp(); return; }
    catch { localStorage.removeItem("readasil_token"); }
  }
  renderLogin();
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("button,[data-book-details]");
  if (!target) {
    if (event.target.matches("#modal")) closeModal();
    return;
  }
  if (target.matches("[data-login-as]")) { setLoginChoice(target.dataset.loginAs); return; }
  if (target.matches("[data-auth-mode]")) { setAuthMode(target.dataset.authMode); return; }
  if (target.matches("[data-demo]")) { const choice=target.dataset.demo; const role=loginRoles[choice]; return signIn(choice,role.email,"Read@2026"); }
  if (target.matches("[data-toggle-password]")) { const password=$("#login-password");password.type=password.type==="password"?"text":"password";return; }
  if (target.matches("[data-forgot-password]")) { showToast("Please contact the library desk to reset your account password.");return; }
  if (target.matches("[data-page]")) { goTo(target.dataset.page); return; }
  if (target.matches("[data-logout]")) { await signOut();return; }
  if (target.matches("[data-toggle-nav]")) { mobileNavOpen=!mobileNavOpen;renderApp();return; }
  if (target.matches("[data-close-nav]")) { mobileNavOpen=false;renderApp();return; }
  if (target.matches("[data-ui-action]")) {
    const action=target.dataset.uiAction;
    if(action==="add-book") modalForm("book");
    else if(action==="edit-profile") modalForm("profile");
    else if(action==="add-member") modalForm("member");
    else if(action==="issue-book") modalForm("issue");
    else if(action==="add-fine") modalForm("fine");
    else if(action==="publish-notice") modalForm("notice");
    else if(action==="go-search") goTo("search-books");
    else if(action==="clear-filters"){bookQuery="";bookCategory="All";bookFilter="All Books";renderApp();}
    else if(action.startsWith("export-")) exportAction(action);
    return;
  }
  if (target.matches("[data-book-details]")) { bookDetails(target.dataset.bookDetails);return; }
  if (target.matches("[data-book-filter]")) { bookFilter=target.dataset.bookFilter;renderApp();return; }
  if (target.matches("[data-edit-member]")) { const user=appData.users.find((item)=>String(item.id)===String(target.dataset.editMember));if(user)modalForm("edit-member",user);return; }
  if (target.matches("[data-modal-action]")) {
    const action=target.dataset.modalAction; const id=target.dataset.id;
    if(action==="edit-book"){closeModal();const book=appData.books.find((item)=>String(item.id)===String(id));modalForm("edit-book",book);}
    else {closeModal();await performAction(action,{book_id:id});}
    return;
  }
  if (target.matches("[data-library-action]")) {
    const action=target.dataset.libraryAction;
    if(action==="mark_all_read")return performAction(action,{});
    if(action==="mark_read")return performAction(action,{id:target.dataset.id});
    if(action==="return"||action==="cancel_reservation"||action==="pay_fine"||action==="approve_librarian")return performAction(action,{id:target.dataset.id});
  }
  if (target.matches("[data-delete-book]")) { const id=target.dataset.deleteBook; closeModal(); if(window.confirm("Remove this title from the catalogue?")) await performAction("delete_book",{id});return; }
  if (target.matches("[data-close-modal]")) { closeModal();return; }
});

document.addEventListener("submit", async (event) => {
  const form=event.target;
  if(form.matches("#login-form")){
    event.preventDefault(); const data=new FormData(form);
    if(form.dataset.mode==="register") return registerAccount({name:String(data.get("name")||""),email:String(data.get("email")||""),department:String(data.get("department")||""),phone:String(data.get("phone")||""),password:String(data.get("password")||""),confirm_password:String(data.get("confirm_password")||"")});
    return signIn(loginChoice,String(data.get("email")),String(data.get("password")));
  }
  if(form.matches("#modal-form")){event.preventDefault();return handleModalSubmit(form);}
  if(form.matches("#settings-form")){
    event.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    data.public_reservations=form.elements.public_reservations.checked;
    await performAction("update_settings",data);
  }
});

document.addEventListener("change", async (event) => {
  const target=event.target;
  if(target.matches("[data-preference]")){
    const payload=Object.fromEntries($$('[data-preference]').map((input)=>[input.dataset.preference,input.checked]));
    return performAction("update_preferences",payload);
  }
  if(target.matches("input[name=book-availability]")){bookFilter=target.value;renderApp();}
  else if(target.matches("input[name=book-category]")){bookCategory=target.value;renderApp();}
  else if(target.matches("#catalogue-search")){bookQuery=target.value;renderApp();const input=$("#catalogue-search");input?.focus();input?.setSelectionRange(input.value.length,input.value.length);}
  else if(target.matches("#sort-books")){appData.books.sort((a,b)=>target.value==="author"?a.author.localeCompare(b.author):target.value==="year"?b.year-a.year:a.title.localeCompare(b.title));renderApp();}
  else if(target.matches("#member-filter")){memberFilter=target.value;renderApp();}
  else if(target.matches("#notice-filter")){const mode=target.value;$$('[data-notice-row]').forEach((row)=>row.style.display=mode==="all"||(mode==="unread"&&row.dataset.read==="false")||(mode==="read"&&row.dataset.read==="true")?"":"none");}
  else if(target.matches("#loan-filter")){const value=target.value;$$('.data-table tbody tr').forEach((row)=>row.style.display=value==="All"||row.textContent.includes(value)||value==="Overdue"&&row.textContent.includes("Overdue")?"":"none");}
});

document.addEventListener("keydown", (event) => {
  if(event.key==="Enter" && event.target.matches("#global-search")){
    event.preventDefault();bookQuery=event.target.value.trim();goTo(appData?.user.role==="member"?"search-books":"book-catalogue");
  }
  if(event.key==="Enter" && event.target.matches("#catalogue-search")){event.preventDefault();bookQuery=event.target.value;renderApp();}
  if(event.key==="Enter" && event.target.matches("[data-list-query]")){event.preventDefault();listQuery=event.target.value;renderApp();}
  if(event.key==="Escape"&&mobileNavOpen){mobileNavOpen=false;renderApp();}
});

document.addEventListener("input", (event) => {
  if(event.target.matches("[data-list-query]")){
    listQuery=event.target.value;
    clearTimeout(window.__readasilSearchTimer);
    window.__readasilSearchTimer=setTimeout(()=>{const focused= document.activeElement;const selection=focused?.selectionStart;renderApp();const next=$("[data-list-query]");if(next){next.focus();if(selection!==null)next.setSelectionRange(selection,selection);}},140);
  }
});

loadApp();
