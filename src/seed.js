const bcrypt = require("bcryptjs");
const { User, Book, Loan, Reservation, Fine, Notification, Setting, Audit } = require("./models");

const daysAgo = (count) => new Date(Date.now() - count * 86400000).toISOString().slice(0, 10);
const daysFromNow = (count) => new Date(Date.now() + count * 86400000).toISOString().slice(0, 10);
const nowIso = () => new Date().toISOString();

async function seedIfEmpty() {
  if (await User.exists({})) return false;

  const peopleData = [
    { name: "Keerthana S", email: "student@readasil.edu", role: "member", department: "Computer Science", member_id: "SIL-2024-0184", phone: "98765 43210", joined_on: daysAgo(280) },
    { name: "Dr. Arjun Rao", email: "faculty@readasil.edu", role: "member", department: "Information Technology", member_id: "FAC-2020-0042", phone: "98220 64127", joined_on: daysAgo(1400) },
    { name: "Ananya Nair", email: "librarian@readasil.edu", role: "librarian", department: "Library Services", member_id: "LIB-2021-0008", phone: "98450 22012", joined_on: daysAgo(1900) },
    { name: "Maya Krishnan", email: "admin@readasil.edu", role: "admin", department: "Administration", member_id: "ADM-2018-0001", phone: "99860 10033", joined_on: daysAgo(2900) },
    { name: "Rahul Menon", email: "rahul@readasil.edu", role: "member", department: "Electronics", member_id: "SIL-2023-0220", phone: "98444 33770", joined_on: daysAgo(700) },
    { name: "Priya Iyer", email: "priya@readasil.edu", role: "member", department: "Architecture", member_id: "SIL-2022-0318", phone: "98860 21512", joined_on: daysAgo(1000) },
  ];
  const people = await User.insertMany(await Promise.all(peopleData.map(async (person) => ({
    ...person, password_hash: await bcrypt.hash("Read@2026", 12),
  }))));
  const byEmail = Object.fromEntries(people.map((person) => [person.email, person]));

  const bookRows = [
    ["The Design of Everyday Things", "Don Norman", "Design", "9780465050659", "Basic Books", 2013, "Design · A2 · 014", 4, 3, "gold", "A practical guide to understanding how thoughtful design shapes everyday life."],
    ["Atomic Habits", "James Clear", "Self Development", "9780735211292", "Avery", 2018, "Personal Growth · B1 · 008", 5, 2, "orange", "An easy, proven framework for building good habits and breaking bad ones."],
    ["Machine Learning Yearning", "Andrew Ng", "Technology", "9780999579595", "DeepLearning.AI", 2022, "Technology · C3 · 021", 3, 2, "blue", "A technical strategy guide for structuring machine learning projects."],
    ["The Midnight Library", "Matt Haig", "Fiction", "9780525559474", "Viking", 2020, "Fiction · A4 · 116", 4, 4, "violet", "Between life and death there is a library, and within it every story matters."],
    ["Thinking, Fast and Slow", "Daniel Kahneman", "Psychology", "9780374533557", "Farrar, Straus and Giroux", 2011, "Psychology · B2 · 044", 3, 1, "green", "A landmark exploration of the two systems that drive the way we think."],
    ["Clean Code", "Robert C. Martin", "Technology", "9780132350884", "Prentice Hall", 2008, "Technology · C2 · 034", 6, 4, "red", "A handbook of agile software craftsmanship and readable programs."],
    ["The Alchemist", "Paulo Coelho", "Fiction", "9780062315007", "HarperOne", 2014, "Fiction · A3 · 061", 5, 5, "gold", "A timeless story about listening to your heart and following a dream."],
    ["Ikigai", "Héctor García & Francesc Miralles", "Self Development", "9780143130727", "Penguin Life", 2017, "Personal Growth · B1 · 026", 4, 2, "green", "The Japanese secret to a long and happy life."],
    ["Sapiens", "Yuval Noah Harari", "History", "9780062316097", "Harper", 2015, "History · D1 · 017", 4, 3, "orange", "A brief history of humankind and the ideas that changed our world."],
    ["Introduction to Algorithms", "Thomas H. Cormen et al.", "Technology", "9780262046305", "MIT Press", 2022, "Technology · C4 · 003", 3, 0, "blue", "The comprehensive introduction to the modern study of computer algorithms."],
    ["The Creative Act", "Rick Rubin", "Design", "9780593652886", "Penguin Press", 2023, "Design · A2 · 029", 3, 2, "violet", "A beautiful course in creative practice and the art of making."],
    ["Educated", "Tara Westover", "Biography", "9780399590504", "Random House", 2018, "Biography · D3 · 022", 4, 2, "red", "A memoir about the transformative power of education."],
  ];
  const books = await Book.insertMany(bookRows.map(([title, author, category, isbn, publisher, year, location, total_copies, available, color, description]) => ({
    title, author, category, isbn, publisher, year, location, total_copies, available, color, description,
  })));
  const byTitle = Object.fromEntries(books.map((book) => [book.title, book]));

  const loanRows = [
    ["The Design of Everyday Things", "student@readasil.edu", 12, 2],
    ["Atomic Habits", "student@readasil.edu", 5, -2],
    ["The Midnight Library", "student@readasil.edu", 8, 4],
    ["Clean Code", "rahul@readasil.edu", 3, 11],
    ["Sapiens", "priya@readasil.edu", 9, 3],
    ["Thinking, Fast and Slow", "faculty@readasil.edu", 6, 8],
  ];
  const loans = await Loan.insertMany(loanRows.map(([bookTitle, email, age, left]) => ({
    user_id: byEmail[email]._id,
    book_id: byTitle[bookTitle]._id,
    issued_on: daysAgo(age),
    due_date: daysFromNow(left),
    status: "Borrowed",
  })));
  await Reservation.insertMany([
    ["Introduction to Algorithms", "student@readasil.edu", 2, "Waiting", 1],
    ["Atomic Habits", "rahul@readasil.edu", 5, "Ready for pickup", 1],
    ["The Creative Act", "student@readasil.edu", 8, "Waiting", 2],
    ["Clean Code", "priya@readasil.edu", 1, "Waiting", 1],
  ].map(([bookTitle, email, age, status, queue_position]) => ({
    user_id: byEmail[email]._id,
    book_id: byTitle[bookTitle]._id,
    reserved_on: daysAgo(age),
    status,
    queue_position,
  })));
  await Fine.insertMany([
    { user_id: byEmail["student@readasil.edu"]._id, loan_id: loans[1]._id, amount: 40, issued_on: daysAgo(1), status: "Unpaid", description: "Overdue return · 2 days" },
    { user_id: byEmail["rahul@readasil.edu"]._id, loan_id: loans[3]._id, amount: 60, issued_on: daysAgo(0), status: "Unpaid", description: "Overdue return · 3 days" },
  ]);
  await Notification.insertMany([
    { user_id: byEmail["student@readasil.edu"]._id, type: "success", title: "Reservation is ready for pickup", message: "Atomic Habits is ready at the circulation desk. Please collect it within 48 hours.", created_at: nowIso() },
    { user_id: byEmail["student@readasil.edu"]._id, type: "warning", title: "Return due soon", message: "The Midnight Library is due in 4 days. Renew before the due date to avoid a late fine.", created_at: nowIso() },
    { user_id: byEmail["student@readasil.edu"]._id, type: "info", title: "New books this week", message: "Explore 18 new titles added to Design and Technology.", created_at: nowIso() },
    { user_id: null, type: "success", title: "Weekly catalogue sync completed", message: "All 42,680 catalogue records are up to date.", created_at: nowIso() },
  ]);
  await Setting.insertMany([
    ["loan_period_days", "14"], ["max_active_loans", "5"], ["fine_per_day", "20"],
    ["institution_name", "Saptagiri Information Library"], ["public_reservations", "true"],
  ].map(([key, value]) => ({ key, value })), { ordered: false });
  await Audit.create({ actor_id: byEmail["admin@readasil.edu"]._id, action: "System initialized", target: "Read@SIL", detail: "Demo library workspace seeded", created_at: nowIso() });
  return true;
}

module.exports = { seedIfEmpty };
