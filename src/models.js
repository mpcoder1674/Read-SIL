const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  role: { type: String, enum: ["member", "librarian", "admin"], default: "member", required: true },
  department: { type: String, default: "General", trim: true, maxlength: 100 },
  member_id: { type: String, default: "", trim: true, maxlength: 40 },
  phone: { type: String, default: "", trim: true, maxlength: 40 },
  status: { type: String, enum: ["Active", "Suspended", "Pending approval"], default: "Active" },
  password_hash: { type: String, required: true, select: false },
  joined_on: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  preferences: {
    due_reminders: { type: Boolean, default: true },
    reservation_updates: { type: Boolean, default: true },
    new_arrivals: { type: Boolean, default: true },
    library_news: { type: Boolean, default: true },
  },
}, { timestamps: true, minimize: false });

userSchema.methods.setPassword = async function setPassword(password) {
  this.password_hash = await bcrypt.hash(password, 12);
};
userSchema.methods.checkPassword = function checkPassword(password) {
  return bcrypt.compare(password, this.password_hash);
};

const bookSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 240 },
  author: { type: String, required: true, trim: true, maxlength: 180 },
  category: { type: String, required: true, trim: true, maxlength: 100 },
  isbn: { type: String, default: "", trim: true, maxlength: 32 },
  publisher: { type: String, default: "", trim: true, maxlength: 180 },
  year: { type: Number, default: () => new Date().getFullYear(), min: 0, max: 3000 },
  location: { type: String, default: "Main Library", trim: true, maxlength: 120 },
  total_copies: { type: Number, default: 1, min: 1 },
  available: { type: Number, default: 1, min: 0 },
  color: { type: String, default: "blue", enum: ["blue", "red", "gold", "green", "orange", "violet"] },
  description: { type: String, default: "", maxlength: 3000 },
  cover_url: { type: String, default: "" },
  cover_storage_key: { type: String, default: "" },
  cover_public_id: { type: String, default: "" },
}, { timestamps: true });
bookSchema.index({ title: "text", author: "text", category: "text", isbn: "text" });

const loanSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  book_id: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
  issued_on: { type: String, required: true },
  due_date: { type: String, required: true, index: true },
  returned_on: { type: String, default: "" },
  status: { type: String, enum: ["Borrowed", "Returned"], default: "Borrowed", index: true },
}, { timestamps: true });

const reservationSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  book_id: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
  reserved_on: { type: String, required: true },
  status: { type: String, enum: ["Waiting", "Ready for pickup", "Picked up", "Cancelled", "Expired"], default: "Waiting", index: true },
  queue_position: { type: Number, default: 1 },
}, { timestamps: true });

const fineSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  loan_id: { type: Schema.Types.ObjectId, ref: "Loan", default: null },
  amount: { type: Number, required: true, min: 0 },
  issued_on: { type: String, required: true },
  status: { type: String, enum: ["Unpaid", "Paid"], default: "Unpaid", index: true },
  description: { type: String, default: "", maxlength: 500 },
}, { timestamps: true });

const notificationSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
  type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  message: { type: String, default: "", maxlength: 3000 },
  created_at: { type: String, required: true },
  read_at: { type: String, default: "" },
  read_by: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const settingSchema = new Schema({ key: { type: String, unique: true, required: true }, value: { type: String, required: true } }, { timestamps: true });
const auditSchema = new Schema({
  actor_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
  action: { type: String, required: true, maxlength: 160 },
  target: { type: String, default: "", maxlength: 240 },
  detail: { type: String, default: "", maxlength: 600 },
  created_at: { type: String, required: true, index: true },
}, { timestamps: true });

module.exports = {
  User: model("User", userSchema),
  Book: model("Book", bookSchema),
  Loan: model("Loan", loanSchema),
  Reservation: model("Reservation", reservationSchema),
  Fine: model("Fine", fineSchema),
  Notification: model("Notification", notificationSchema),
  Setting: model("Setting", settingSchema),
  Audit: model("Audit", auditSchema),
};
