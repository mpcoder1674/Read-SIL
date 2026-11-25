const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { User, Book, Loan, Reservation, Fine, Notification, Setting, Audit } = require("./models");
const { coverUrl, providerStatus, requireConfiguredProvider, uploadCover, removeCover } = require("./storage");

const router = express.Router();
const MEMBER_ROLES = new Set(["member", "librarian", "admin"]);
const settingsDefaults = {
  loan_period_days: "14", max_active_loans: "5", fine_per_day: "20",
  institution_name: "Saptagiri Information Library", public_reservations: "true",
};
const nowIso = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const daysAhead = (count) => new Date(Date.now() + count * 86400000).toISOString().slice(0, 10);
const publicUser = (user) => ({
  id: String(user._id), name: user.name, email: user.email, role: user.role,
  department: user.department, member_id: user.member_id, phone: user.phone,
  status: user.status, joined_on: user.joined_on,
});
const publicBook = (book, url = "") => ({
  id: String(book._id), title: book.title, author: book.author, category: book.category,
  isbn: book.isbn, publisher: book.publisher, year: book.year, location: book.location,
  total_copies: book.total_copies, available: book.available, color: book.color,
  description: book.description, cover_url: url,
});
const plainId = (value) => value ? String(value._id || value) : "";
const safeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function requireRole(user, ...roles) {
  if (!roles.includes(user.role)) throw httpError(403, "Your account does not have access to this action.");
}

async function setting(key) {
  const record = await Setting.findOne({ key }).lean();
  return record?.value ?? settingsDefaults[key];
}

async function logAction(user, action, target = "", detail = "") {
  await Audit.create({ actor_id: user?._id || null, action, target, detail, created_at: nowIso() });
}

async function hydrateBook(book) {
  if (!book) return null;
  return publicBook(book, await coverUrl(book));
}

async function bootstrap(user) {
  const staff = ["admin", "librarian"].includes(user.role);
  const loanFilter = staff ? {} : { user_id: user._id };
  const reservationFilter = staff ? {} : { user_id: user._id };
  const fineFilter = staff ? {} : { user_id: user._id };
  const noticeFilter = { $or: [{ user_id: null }, { user_id: user._id }] };

  const [rawBooks, rawLoans, rawReservations, rawFines, rawNotices, rawUsers, rawSettings, rawAudit] = await Promise.all([
    Book.find({}).sort({ title: 1 }).lean(),
    Loan.find(loanFilter).populate("book_id").populate("user_id").sort({ status: 1, due_date: 1 }).lean(),
    Reservation.find(reservationFilter).populate("book_id").populate("user_id").sort({ reserved_on: -1 }).lean(),
    Fine.find(fineFilter).populate("user_id").populate({ path: "loan_id", populate: { path: "book_id" } }).sort({ issued_on: -1 }).lean(),
    Notification.find(noticeFilter).sort({ created_at: -1 }).lean(),
    staff ? User.find({}).select("name email role department member_id phone status joined_on").sort({ name: 1 }).lean() : Promise.resolve([]),
    user.role === "admin" ? Setting.find({}).lean() : Promise.resolve([]),
    staff ? Audit.find({}).populate("actor_id", "name").sort({ created_at: -1 }).limit(user.role === "admin" ? 100 : 40).lean() : Promise.resolve([]),
  ]);

  const books = await Promise.all(rawBooks.map(hydrateBook));
  const loans = rawLoans.map((loan) => ({
    id: String(loan._id), user_id: plainId(loan.user_id), book_id: plainId(loan.book_id),
    issued_on: loan.issued_on, due_date: loan.due_date, returned_on: loan.returned_on,
    status: loan.status, book_title: loan.book_id?.title || "Removed title", author: loan.book_id?.author || "",
    book_color: loan.book_id?.color || "blue", member_name: loan.user_id?.name || "Unknown member",
    member_id: loan.user_id?.member_id || "", member_email: loan.user_id?.email || "",
  }));
  const reservations = rawReservations.map((reservation) => ({
    id: String(reservation._id), user_id: plainId(reservation.user_id), book_id: plainId(reservation.book_id),
    reserved_on: reservation.reserved_on, status: reservation.status, queue_position: reservation.queue_position,
    book_title: reservation.book_id?.title || "Removed title", author: reservation.book_id?.author || "",
    book_color: reservation.book_id?.color || "blue", member_name: reservation.user_id?.name || "Unknown member",
    member_id: reservation.user_id?.member_id || "", member_email: reservation.user_id?.email || "",
  }));
  const fines = rawFines.map((fine) => ({
    id: String(fine._id), user_id: plainId(fine.user_id), loan_id: plainId(fine.loan_id),
    amount: fine.amount, issued_on: fine.issued_on, status: fine.status, description: fine.description,
    member_name: fine.user_id?.name || "Unknown member", member_id: fine.user_id?.member_id || "",
    member_email: fine.user_id?.email || "", book_title: fine.loan_id?.book_id?.title || "",
  }));
  const notifications = rawNotices.map((notice) => ({
    id: String(notice._id), user_id: plainId(notice.user_id), type: notice.type, title: notice.title,
    message: notice.message, created_at: notice.created_at,
    read_at: notice.user_id ? notice.read_at : (notice.read_by || []).some((reader) => String(reader) === String(user._id)) ? notice.created_at : "",
  }));
  const users = rawUsers.map((person) => ({ ...publicUser(person), id: String(person._id) }));
  const settings = Object.fromEntries(rawSettings.map((record) => [record.key, record.value]));
  const audit = rawAudit.map((entry) => ({
    id: String(entry._id), actor_id: plainId(entry.actor_id), action: entry.action, target: entry.target,
    detail: entry.detail, created_at: entry.created_at, actor_name: entry.actor_id?.name || "System",
  }));
  const preferences = Object.fromEntries(Object.entries(user.preferences || {}).map(([key, value]) => [key, String(Boolean(value))]));
  return {
    user: publicUser(user), books, loans, reservations, fines, notifications, users, settings, audit,
    preferences, storage: providerStatus(),
  };
}

async function authenticate(req, res, next) {
  try {
    const token = String(req.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) throw httpError(401, "Please sign in to continue.");
    const claims = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"], issuer: "readasil", audience: "readasil-app" });
    const user = await User.findById(claims.sub);
    if (!user || user.status !== "Active") throw httpError(401, "Your session is no longer active. Please sign in again.");
    req.user = user;
    next();
  } catch (error) {
    next(error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" || error.name === "CastError"
      ? httpError(401, "Your session has expired. Please sign in again.") : error);
  }
}

const loginAttempts = new Map();
const registrationAttempts = new Map();
function rateLimitLogin(req, res, next) {
  const key = `${req.ip}:${String(req.body.email || "").toLowerCase()}`;
  const now = Date.now();
  const entry = loginAttempts.get(key) || { count: 0, first: now };
  if (now - entry.first > 15 * 60 * 1000) { entry.count = 0; entry.first = now; }
  if (entry.count >= 10) return res.status(429).json({ error: "Too many sign-in attempts. Try again in 15 minutes." });
  req.loginAttemptKey = key;
  req.loginAttempt = entry;
  next();
}

router.post("/login", rateLimitLogin, async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const role = String(req.body.role || "member");
  const user = await User.findOne({ email }).select("+password_hash");
  if (user?.status === "Pending approval" && user.role === "librarian" && role === "librarian") {
    return res.status(403).json({ error: "Your librarian registration is awaiting administrator approval." });
  }
  const memberType = String(req.body.memberType || "student");
  const accountTypeMatches = user?.role !== "member" || (["student", "faculty"].includes(memberType) && (memberType === "faculty" ? user.member_id.startsWith("FAC-") : !user.member_id.startsWith("FAC-")));
  const valid = user && user.status === "Active" && user.role === role && accountTypeMatches && await user.checkPassword(password);
  if (!valid) {
    req.loginAttempt.count += 1;
    loginAttempts.set(req.loginAttemptKey, req.loginAttempt);
    return res.status(401).json({ error: "The email, password, or account type doesn't match." });
  }
  loginAttempts.delete(req.loginAttemptKey);
  const token = signInToken(user);
  res.json({ token, user: publicUser(user) });
});

function signInToken(user) {
  return jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: String(user._id), issuer: "readasil", audience: "readasil-app",
    algorithm: "HS256", expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function rateLimitRegistration(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const entry = registrationAttempts.get(key) || { count: 0, first: now };
  if (now - entry.first > 60 * 60 * 1000) { entry.count = 0; entry.first = now; }
  if (entry.count >= 8) return res.status(429).json({ error: "Too many registration attempts. Try again in an hour." });
  entry.count += 1;
  registrationAttempts.set(key, entry);
  req.registrationKey = key;
  req.registrationEntry = entry;
  next();
}

router.post("/register", rateLimitRegistration, async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const accountType = String(req.body.accountType || "");
  if (!name || name.length > 120) throw httpError(400, "Enter your name (up to 120 characters).");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw httpError(400, "Enter a valid email address.");
  if (password.length < 10 || password.length > 256) throw httpError(400, "Choose a password with 10 to 256 characters.");
  if (!["student", "faculty", "librarian"].includes(accountType)) throw httpError(400, "Choose Student, Faculty, or Librarian registration.");
  if (await User.exists({ email })) throw httpError(409, "An account with this email already exists. Try signing in instead.");

  const year = new Date().getFullYear();
  const prefix = accountType === "faculty" ? "FAC" : accountType === "librarian" ? "LIB" : "SIL";
  const member = new User({
    name, email, role: accountType === "librarian" ? "librarian" : "member",
    department: String(req.body.department || "General").trim().slice(0, 100),
    member_id: `${prefix}-${year}-${1000 + Math.floor(Math.random() * 9000)}`,
    phone: String(req.body.phone || "").trim().slice(0, 40),
    status: accountType === "librarian" ? "Pending approval" : "Active",
    joined_on: today(),
  });
  await member.setPassword(password);
  await member.save();

  if (accountType === "librarian") {
    const admins = await User.find({ role: "admin", status: "Active" }).select("_id").lean();
    if (admins.length) await Notification.insertMany(admins.map((admin) => ({
      user_id: admin._id, type: "warning", title: "Librarian registration needs review",
      message: `${name} (${email}) has requested a librarian account. Review the account in User Management.`, created_at: nowIso(),
    })));
    await Audit.create({ actor_id: member._id, action: "Librarian registration submitted", target: name, detail: email, created_at: nowIso() });
    return res.status(201).json({ message: "Registration received. An administrator must approve your librarian account before you can sign in.", user: publicUser(member), pendingApproval: true });
  }

  await Audit.create({ actor_id: member._id, action: `${accountType === "faculty" ? "Faculty" : "Student"} registration completed`, target: name, detail: email, created_at: nowIso() });
  const token = signInToken(member);
  res.status(201).json({ message: "Your Read@SIL account is ready.", user: publicUser(member), token });
});

router.post("/logout", (_req, res) => res.json({ ok: true }));
router.get("/bootstrap", authenticate, async (req, res) => res.json(await bootstrap(req.user)));

async function doAction(user, action, payload = {}) {
  const id = String(payload.id || "");
  const todayString = today();
  if (action === "borrow") {
    requireRole(user, "member");
    const active = await Loan.countDocuments({ user_id: user._id, status: "Borrowed" });
    const maxLoans = Number(await setting("max_active_loans"));
    if (active >= maxLoans) throw httpError(400, `You have reached the ${maxLoans}-book loan limit.`);
    const book = await Book.findOneAndUpdate({ _id: payload.book_id, available: { $gt: 0 } }, { $inc: { available: -1 } }, { new: true });
    if (!book) {
      const exists = await Book.exists({ _id: payload.book_id });
      throw httpError(400, exists ? "This title is currently unavailable. Place a reservation instead." : "Book not found.");
    }
    const days = Number(await setting("loan_period_days"));
    try {
      await Loan.create({ user_id: user._id, book_id: book._id, issued_on: todayString, due_date: daysAhead(days), status: "Borrowed" });
    } catch (error) {
      await Book.updateOne({ _id: book._id }, { $inc: { available: 1 } });
      throw error;
    }
    await logAction(user, "Book borrowed", book.title, `Due in ${days} days`);
    return `${book.title} is now in your borrowings.`;
  }
  if (action === "reserve") {
    requireRole(user, "member");
    if (await setting("public_reservations") === "false") throw httpError(403, "Reservations are currently unavailable. Please contact the library desk.");
    const book = await Book.findById(payload.book_id);
    if (!book) throw httpError(404, "Book not found.");
    if (book.available > 0) throw httpError(400, "A copy is available now. Borrow it from the catalogue instead.");
    if (await Reservation.exists({ user_id: user._id, book_id: book._id, status: { $in: ["Waiting", "Ready for pickup"] } })) {
      throw httpError(400, "You already have an active reservation for this title.");
    }
    const position = await Reservation.countDocuments({ book_id: book._id, status: "Waiting" }) + 1;
    await Reservation.create({ user_id: user._id, book_id: book._id, reserved_on: todayString, status: "Waiting", queue_position: position });
    await logAction(user, "Reservation placed", book.title, `Queue position ${position}`);
    return "Your reservation has been placed. We will notify you when it is ready.";
  }
  if (action === "cancel_reservation") {
    const record = await Reservation.findById(id);
    if (!record || (!record.user_id.equals(user._id) && !["admin", "librarian"].includes(user.role))) throw httpError(404, "Reservation not found.");
    const cancelled = await Reservation.findOneAndUpdate({ _id: record._id, status: { $in: ["Waiting", "Ready for pickup"] } }, { $set: { status: "Cancelled" } }, { new: true });
    if (!cancelled) throw httpError(400, "This reservation is no longer active.");
    if (record.status === "Ready for pickup") {
      const book = await Book.findByIdAndUpdate(record.book_id, { $inc: { available: 1 } }, { new: true });
      if (book && book.available > 0) await prepareNextReservation(book);
    }
    await logAction(user, "Reservation cancelled", String(record.book_id));
    return "Reservation cancelled.";
  }
  if (action === "return") {
    requireRole(user, "librarian", "admin");
    const loan = await Loan.findOneAndUpdate({ _id: id, status: "Borrowed" }).populate("book_id").populate("user_id");
    if (!loan) throw httpError(404, "Active borrowing not found.");
    loan.status = "Returned";
    loan.returned_on = todayString;
    await loan.save();
    const book = await Book.findByIdAndUpdate(loan.book_id._id, { $inc: { available: 1 } }, { new: true });
    let holdMessage = "";
    if (book && book.available > 0) {
      const promoted = await prepareNextReservation(book);
      if (promoted) holdMessage = " The next reservation is ready for pickup.";
    }
    const overdue = Math.max(0, Math.floor((new Date(`${todayString}T00:00:00Z`) - new Date(`${loan.due_date}T00:00:00Z`)) / 86400000));
    if (overdue) {
      const daily = Number(await setting("fine_per_day"));
      const amount = overdue * daily;
      await Fine.create({ user_id: loan.user_id._id, loan_id: loan._id, amount, issued_on: todayString, status: "Unpaid", description: `Overdue return · ${overdue} days` });
      await Notification.create({ user_id: loan.user_id._id, type: "warning", title: "A late return fine was added", message: `A ₹${amount.toLocaleString("en-IN")} late fine was added for ${loan.book_id.title}.`, created_at: nowIso() });
    }
    await logAction(user, "Book returned", loan.book_id.title, `Loan ${loan._id}; ${overdue} days overdue`);
    return `Book checked in successfully.${holdMessage}${overdue ? ` A ₹${(overdue * Number(await setting("fine_per_day"))).toLocaleString("en-IN")} late fine was added.` : ""}`;
  }
  if (action === "issue") {
    requireRole(user, "librarian", "admin");
    const member = await User.findOne({ _id: payload.user_id, role: "member", status: "Active" });
    if (!member) throw httpError(400, "Choose a valid active member.");
    const maxLoans = Number(await setting("max_active_loans"));
    if (await Loan.countDocuments({ user_id: member._id, status: "Borrowed" }) >= maxLoans) throw httpError(400, `This member has reached the ${maxLoans}-book loan limit.`);
    const days = Number(await setting("loan_period_days"));
    const book = await Book.findOneAndUpdate({ _id: payload.book_id, available: { $gt: 0 } }, { $inc: { available: -1 } }, { new: true });
    if (!book) throw httpError(400, "No copies are available to issue.");
    try {
      await Loan.create({ user_id: member._id, book_id: book._id, issued_on: todayString, due_date: daysAhead(days), status: "Borrowed" });
    } catch (error) {
      await Book.updateOne({ _id: book._id }, { $inc: { available: 1 } });
      throw error;
    }
    await logAction(user, "Book issued", book.title, `Issued to ${member.name}`);
    return `${book.title} issued to ${member.name}.`;
  }
  if (action === "create_book" || action === "update_book") {
    requireRole(user, "librarian", "admin");
    const title = String(payload.title || "").trim();
    const author = String(payload.author || "").trim();
    if (!title || !author) throw httpError(400, "Title and author are required.");
    const values = {
      title, author, category: String(payload.category || "General").trim(),
      isbn: String(payload.isbn || "").trim(), publisher: String(payload.publisher || "").trim(),
      year: safeNumber(payload.year, new Date().getFullYear()), location: String(payload.location || "Main Library").trim(),
      total_copies: Math.max(1, safeNumber(payload.total_copies, 1)), color: payload.color || "blue",
      description: String(payload.description || "").trim(),
    };
    if (action === "create_book") {
      values.available = values.total_copies;
      const book = await Book.create(values);
      await logAction(user, "Book added", title);
      return { message: `${title} was added to the catalogue.`, entityId: String(book._id) };
    }
    const book = await Book.findById(id);
    if (!book) throw httpError(404, "Book not found.");
    const committed = book.total_copies - book.available;
    values.total_copies = Math.max(committed, values.total_copies);
    values.available = values.total_copies - committed;
    Object.assign(book, values);
    await book.save();
    await logAction(user, "Book updated", title);
    return { message: `${title} details saved.`, entityId: String(book._id) };
  }
  if (action === "delete_book") {
    requireRole(user, "librarian", "admin");
    const book = await Book.findById(id);
    if (!book) throw httpError(404, "Book not found.");
    if (await Loan.exists({ book_id: book._id }) || await Reservation.exists({ book_id: book._id })) {
      throw httpError(400, "This title has circulation history. Keep the record in the catalogue for accurate library records.");
    }
    await Book.deleteOne({ _id: book._id });
    await removeCover({ key: book.cover_storage_key, publicId: book.cover_public_id });
    await logAction(user, "Book removed", book.title);
    return `Book ${book.title} was removed from the catalogue.`;
  }
  if (action === "create_member") {
    requireRole(user, "librarian", "admin");
    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw httpError(400, "Enter a member name and valid email address.");
    if (await User.exists({ email })) throw httpError(400, "An account with this email already exists.");
    const password = String(payload.password || "Read@2026");
    if (password.length < 10) throw httpError(400, "Choose a temporary password with at least 10 characters.");
    const member = new User({
      name, email, role: "member", department: String(payload.department || "General").trim(),
      member_id: String(payload.member_id || `SIL-${new Date().getFullYear()}-${1000 + Math.floor(Math.random() * 9000)}`),
      phone: String(payload.phone || ""), status: "Active", joined_on: todayString,
    });
    await member.setPassword(password);
    await member.save();
    await logAction(user, "Member added", name, email);
    await Notification.create({ user_id: member._id, type: "success", title: "Welcome to Read@SIL", message: "Your library account is ready. Explore the catalogue and discover your next read.", created_at: nowIso() });
    return `${name} has been added as a member.`;
  }
  if (action === "update_member") {
    requireRole(user, "librarian", "admin");
    const member = await User.findOne({ _id: id, role: "member" });
    if (!member) throw httpError(404, "Member not found.");
    if (payload.status === "Suspended" && await Loan.exists({ user_id: member._id, status: "Borrowed" })) {
      throw httpError(400, "Check in this member’s active loans before suspending their account.");
    }
    member.name = String(payload.name || member.name).trim();
    member.department = String(payload.department ?? member.department).trim();
    member.phone = String(payload.phone ?? member.phone).trim();
    member.status = payload.status === "Suspended" ? "Suspended" : "Active";
    await member.save();
    await logAction(user, "Member updated", member.name);
    return "Member details updated.";
  }
  if (action === "approve_librarian") {
    requireRole(user, "admin");
    const librarian = await User.findOneAndUpdate(
      { _id: id, role: "librarian", status: "Pending approval" },
      { $set: { status: "Active" } },
      { new: true },
    );
    if (!librarian) throw httpError(404, "Pending librarian application not found.");
    await Notification.create({ user_id: librarian._id, type: "success", title: "Librarian account approved", message: "Your Read@SIL librarian account is active. You can now sign in.", created_at: nowIso() });
    await logAction(user, "Librarian account approved", librarian.name, librarian.email);
    return `${librarian.name} can now sign in as a librarian.`;
  }
  if (action === "mark_read") {
    const notice = await Notification.findOne({ _id: id, $or: [{ user_id: user._id }, { user_id: null }] }).select("user_id");
    if (notice?.user_id) await Notification.updateOne({ _id: id }, { $set: { read_at: nowIso() } });
    else if (notice) await Notification.updateOne({ _id: id }, { $addToSet: { read_by: user._id } });
    return "Notification marked as read.";
  }
  if (action === "mark_all_read") {
    await Notification.updateMany({ user_id: user._id, read_at: "" }, { $set: { read_at: nowIso() } });
    await Notification.updateMany({ user_id: null, read_by: { $ne: user._id } }, { $addToSet: { read_by: user._id } });
    return "All notifications marked as read.";
  }
  if (action === "pay_fine") {
    requireRole(user, "librarian", "admin");
    const fine = await Fine.findOneAndUpdate({ _id: id, status: "Unpaid" }, { $set: { status: "Paid" } }, { new: true });
    if (!fine) throw httpError(404, "Unpaid fine not found.");
    await logAction(user, "Fine paid", String(fine._id), `₹${fine.amount.toFixed(0)}`);
    return `Payment of ₹${fine.amount.toLocaleString("en-IN")} recorded. Thank you.`;
  }
  if (action === "add_fine") {
    requireRole(user, "librarian", "admin");
    const member = await User.findOne({ _id: payload.user_id, role: "member" });
    const amount = Math.round(safeNumber(payload.amount) * 100) / 100;
    if (!member || amount <= 0) throw httpError(400, "Choose a member and enter a fine amount above zero.");
    await Fine.create({ user_id: member._id, amount, issued_on: todayString, status: "Unpaid", description: String(payload.description || "Library fine") });
    await logAction(user, "Fine added", member.name, `₹${amount.toFixed(0)}`);
    return "Fine added to the member account.";
  }
  if (action === "update_settings") {
    requireRole(user, "admin");
    const allowed = new Set(Object.keys(settingsDefaults));
    const updates = Object.entries(payload).filter(([key]) => allowed.has(key));
    for (const [key, value] of updates) {
      if (["loan_period_days", "max_active_loans"].includes(key) && (!Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 365)) throw httpError(400, `${key === "loan_period_days" ? "Loan period" : "Maximum active loans"} must be a whole number from 1 to 365.`);
      if (key === "fine_per_day" && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100000)) throw httpError(400, "Fine per day must be a number from ₹0 to ₹100,000.");
      if (key === "institution_name" && !String(value).trim()) throw httpError(400, "Library name is required.");
      await Setting.updateOne({ key }, { $set: { value: String(value) } }, { upsert: true, runValidators: true });
    }
    await logAction(user, "System settings updated", "Read@SIL", updates.map(([key]) => key).join(", "));
    return "Library policies saved.";
  }
  if (action === "update_preferences") {
    const allowed = ["due_reminders", "reservation_updates", "new_arrivals", "library_news"];
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(payload, key)) user.set(`preferences.${key}`, Boolean(payload[key] === true || payload[key] === "true"));
    await user.save();
    return "Your notification preferences have been saved.";
  }
  if (action === "update_profile") {
    if (user.role === "admin") {
      const account = await User.findById(user._id).select("+password_hash");
      if (!payload.current_password || !await account.checkPassword(String(payload.current_password))) throw httpError(400, "Enter the current administrator password to change login credentials.");
      const email = String(payload.email || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw httpError(400, "Enter a valid administrator login email.");
      if (email !== account.email && await User.exists({ email, _id: { $ne: account._id } })) throw httpError(409, "Another account already uses this email address.");
      const newPassword = String(payload.new_password || "");
      if (newPassword && (newPassword.length < 10 || newPassword.length > 256)) throw httpError(400, "Choose a password with 10 to 256 characters.");
      account.email = email;
      if (newPassword) await account.setPassword(newPassword);
      await account.save();
      await logAction(user, "Administrator credentials changed", email, newPassword ? "Login email and password updated" : "Login email updated");
      return "Administrator login credentials updated.";
    }
    const name = String(payload.name || "").trim();
    if (!name) throw httpError(400, "Your name is required.");
    const newPassword = String(payload.new_password || "");
    if (newPassword) {
      const account = await User.findById(user._id).select("+password_hash");
      if (!payload.current_password || !await account.checkPassword(String(payload.current_password))) throw httpError(400, "Enter your current password before setting a new one.");
      if (newPassword.length < 10 || newPassword.length > 256) throw httpError(400, "Choose a password with 10 to 256 characters.");
      await account.setPassword(newPassword);
      account.name = name;
      account.phone = String(payload.phone || "").trim();
      await account.save();
    } else {
      user.name = name;
      user.phone = String(payload.phone || "").trim();
      await user.save();
    }
    await logAction(user, "Profile updated", name);
    return "Your profile has been updated.";
  }
  if (action === "add_notification") {
    requireRole(user, "librarian", "admin");
    const title = String(payload.title || "").trim();
    const message = String(payload.message || "").trim();
    if (!title || !message) throw httpError(400, "Enter a title and message for the notice.");
    const noticeType = ["info", "success", "warning", "error"].includes(payload.type) ? payload.type : "info";
    const target = payload.audience === "all" ? null : await User.findOne({ _id: payload.audience, role: "member" }).select("_id");
    if (payload.audience !== "all" && !target) throw httpError(400, "Choose a valid member for this notice.");
    await Notification.create({ user_id: target?._id || null, type: noticeType, title, message, created_at: nowIso() });
    await logAction(user, "Notification published", title, target ? `Member ${target._id}` : "All members");
    return "Notification published.";
  }
  throw httpError(400, "Unknown library action.");
}

async function prepareNextReservation(book) {
  const next = await Reservation.findOneAndUpdate(
    { book_id: book._id, status: "Waiting" },
    { $set: { status: "Ready for pickup" } },
    { sort: { reserved_on: 1, _id: 1 }, new: true },
  );
  if (!next) return false;
  const stock = await Book.findOneAndUpdate({ _id: book._id, available: { $gt: 0 } }, { $inc: { available: -1 } }, { new: true });
  if (!stock) {
    await Reservation.updateOne({ _id: next._id, status: "Ready for pickup" }, { $set: { status: "Waiting" } });
    return false;
  }
  const copy = await Book.findById(book._id).select("title").lean();
  await Notification.create({ user_id: next.user_id, type: "success", title: "Reservation is ready for pickup", message: `${copy?.title || "Your reserved book"} is ready at the circulation desk. Please collect it within 48 hours.`, created_at: nowIso() });
  return true;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    callback(allowed.has(file.mimetype) ? null : httpError(400, "Upload a JPG, PNG, WebP, or GIF image."), allowed.has(file.mimetype));
  },
});
function hasValidImageSignature(buffer, mimetype) {
  if (mimetype === "image/png") return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimetype === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimetype === "image/gif") return buffer.length >= 6 && ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString());
  if (mimetype === "image/webp") return buffer.length >= 12 && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  return false;
}

router.post("/books/:id/cover", authenticate, (req, res, next) => {
  if (!["admin", "librarian"].includes(req.user.role)) return next(httpError(403, "Your account does not have access to this action."));
  next();
}, upload.single("cover"), async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw httpError(404, "Book not found.");
  if (!req.file) throw httpError(400, "Choose an image file to upload.");
  if (!hasValidImageSignature(req.file.buffer, req.file.mimetype)) throw httpError(400, "The selected file is not a valid image.");
  requireConfiguredProvider();
  const uploaded = await uploadCover(req.file, String(book._id));
  const oldCover = { key: book.cover_storage_key, publicId: book.cover_public_id };
  book.cover_url = uploaded.url;
  book.cover_storage_key = uploaded.key;
  book.cover_public_id = uploaded.publicId;
  await book.save();
  await removeCover(oldCover);
  await logAction(req.user, "Book cover uploaded", book.title, providerStatus().provider);
  res.json({ message: "Book cover uploaded.", data: await bootstrap(req.user) });
});

router.post("/actions", authenticate, async (req, res) => {
  const result = await doAction(req.user, String(req.body.action || ""), req.body.payload || {});
  const message = typeof result === "string" ? result : result.message;
  const data = await bootstrap(req.user);
  if (result?.entityId) data.entityId = result.entityId;
  res.json({ message, data });
});

router.use((error, _req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || (error.name === "ValidationError" ? 400 : error.name === "CastError" ? 400 : error.code === 11000 ? 400 : error.name === "MulterError" ? 400 : 500);
  const message = status < 500 ? (error.code === 11000 ? "That record already exists." : error.message) : "Something went wrong. Please try again.";
  if (status >= 500) console.error("Read@SIL API error:", error);
  res.status(status).json({ error: message });
});

module.exports = { router, bootstrap };
