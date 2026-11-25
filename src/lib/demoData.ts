import type { LibraryData } from './types'

export const initialDemoData: LibraryData = {
  books: [
    { id: 'b1', title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', category: 'Computer Science', isbn: '9781119800361', shelf: 'CS-A12', copies: 12, available: 5 },
    { id: 'b2', title: 'Data Structures and Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', category: 'Computer Science', isbn: '9780262046305', shelf: 'CS-A08', copies: 10, available: 3 },
    { id: 'b3', title: 'Machine Learning', author: 'Tom M. Mitchell', category: 'Artificial Intelligence', isbn: '9780070428072', shelf: 'AI-B04', copies: 8, available: 0 },
    { id: 'b4', title: 'Deep Learning', author: 'Ian Goodfellow, Yoshua Bengio', category: 'Artificial Intelligence', isbn: '9780262035613', shelf: 'AI-B09', copies: 7, available: 2 },
    { id: 'b5', title: 'Computer Networks', author: 'Andrew S. Tanenbaum', category: 'Computer Science', isbn: '9780137503269', shelf: 'CS-C03', copies: 9, available: 4 },
    { id: 'b6', title: 'Database System Concepts', author: 'Abraham Silberschatz', category: 'Information Systems', isbn: '9780078022159', shelf: 'IS-A02', copies: 6, available: 2 },
    { id: 'b7', title: 'Digital Signal Processing', author: 'John G. Proakis', category: 'Electronics', isbn: '9780131873742', shelf: 'EC-D11', copies: 5, available: 1 },
  ],
  loans: [
    { id: 'l1', title: 'Operating System Concepts', member: 'Keerthana S', issued: '06 Sep 2026', due: '26 Sep 2026', status: 'Overdue' },
    { id: 'l2', title: 'Data Structures and Algorithms', member: 'Keerthana S', issued: '07 Oct 2026', due: '24 Oct 2026', status: 'On time' },
    { id: 'l3', title: 'Machine Learning', member: 'Ramesh Kumar', issued: '02 Oct 2026', due: '12 Oct 2026', status: 'Due soon' },
    { id: 'l4', title: 'Deep Learning', member: 'Dr. Ananya Verma', issued: '01 Oct 2026', due: '25 Oct 2026', status: 'On time' },
    { id: 'l5', title: 'Computer Networks', member: 'Keerthana S', issued: '08 Oct 2026', due: '28 Oct 2026', status: 'On time' },
  ],
  reservations: [
    { id: 'r1', title: 'Machine Learning', member: 'Keerthana S', placed: '09 Oct 2026', status: 'Waiting' },
    { id: 'r2', title: 'Artificial Intelligence', member: 'Priya R', placed: '10 Oct 2026', status: 'Pending' },
    { id: 'r3', title: 'Database System Concepts', member: 'Manoj K', placed: '10 Oct 2026', status: 'Pending' },
    { id: 'r4', title: 'Digital Signal Processing', member: 'Keerthana S', placed: '10 Oct 2026', status: 'Pending' },
    { id: 'r5', title: 'Database System Concepts', member: 'Dr. Ananya Verma', placed: '10 Oct 2026', status: 'Pending' },
  ],
  fines: [
    { id: 'f1', title: 'Operating System Concepts', amount: 20, status: 'Outstanding' },
    { id: 'f2', title: 'Computer Networks', amount: 50, status: 'Paid' },
  ],
  notices: [
    { id: 'n1', title: 'Book overdue', message: 'Operating System Concepts is overdue. Please return it soon.', date: 'Today, 11:20 AM', read: false },
    { id: 'n2', title: 'New reservation', message: 'Your reservation for Machine Learning is in the queue.', date: 'Today, 08:41 AM', read: false },
    { id: 'n3', title: 'New arrivals', message: 'Explore the latest titles in AI and Data Science.', date: 'Yesterday', read: true },
  ],
  announcements: [
    { id: 'an1', title: 'New Arrivals in Computer Science', message: 'Explore the latest titles in AI, Data Science and more.', date: 'Today' },
    { id: 'an2', title: 'Library Timing Update', message: 'The library is open from 8:00 AM to 8:00 PM.', date: 'This week' },
    { id: 'an3', title: 'Access to Digital Resources', message: 'New e-books and research databases are now available.', date: '10 Oct 2026' },
  ],
  renewalRequests: [
    { id: 'rr1', loanId: 'l2', title: 'Data Structures and Algorithms', member: 'Keerthana S', requested: 'Today, 09:42 AM', status: 'Pending' },
  ],
  payments: [
    { id: 'p1', amount: 50, status: 'Verified · sample', reference: 'LIB20261009', date: '09 Oct 2026' },
  ],
  policies: { studentLimit: 6, facultyLimit: 12, loanPeriodDays: 14, maxRenewals: 2, finePerDay: 10, graceDays: 3, reservationPickupDays: 3 },
  members: [
    { id: 'm1', name: 'Keerthana S', role: 'Student', email: 'keerthana@sapthagiri.edu.in', status: 'Active' },
    { id: 'm2', name: 'Ramesh Kumar', role: 'Faculty', email: 'ramesh.kumar@sapthagiri.edu.in', status: 'Active' },
    { id: 'm3', name: 'Dr. Ananya Verma', role: 'Faculty', email: 'ananya.verma@sapthagiri.edu.in', status: 'Active' },
    { id: 'm4', name: 'Priya R', role: 'Student', email: 'priya.r@sapthagiri.edu.in', status: 'Active' },
    { id: 'm5', name: 'Arjun T', role: 'Student', email: 'arjun.t@sapthagiri.edu.in', status: 'Active' },
  ],
  activity: [
    { id: 'a1', action: 'Book issued', detail: 'Operating System Concepts', person: 'Keerthana S', date: '10 Oct 2026 · 11:24 AM', status: 'Completed' },
    { id: 'a2', action: 'Book returned', detail: 'Deep Learning', person: 'Ramesh Kumar', date: '10 Oct 2026 · 10:56 AM', status: 'Completed' },
    { id: 'a3', action: 'Reservation placed', detail: 'Computer Networks', person: 'Priya R', date: '10 Oct 2026 · 09:32 AM', status: 'Pending' },
    { id: 'a4', action: 'New member registered', detail: 'Student account', person: 'Arjun T', date: '09 Oct 2026 · 04:05 PM', status: 'Completed' },
    { id: 'a5', action: 'Fine payment received', detail: '₹50 · Receipt #LIB20261009', person: 'Siddharth R', date: '09 Oct 2026 · 02:18 PM', status: 'Completed' },
  ],
  metrics: {
    totalBooks: 24680,
    totalMembers: 3842,
    activeLoans: 1276,
    overdueLoans: 94,
    activeReservations: 186,
    outstandingFines: 18450,
    myActiveLoans: 3,
    myReservations: 2,
    myOverdueLoans: 1,
    myOutstandingFines: 20,
    charts: {
      categories: [{ label: 'Computer Science', value: 5842 }, { label: 'Engineering', value: 4436 }, { label: 'Mathematics', value: 3696 }, { label: 'Electronics', value: 3453 }, { label: 'Management', value: 2960 }, { label: 'General', value: 2467 }, { label: 'Others', value: 1732 }],
      memberTypes: [{ label: 'Students', value: 2767 }, { label: 'Faculty', value: 691 }, { label: 'Research Scholars', value: 298 }, { label: 'Alumni', value: 86 }],
      circulation: [{ label: 'Oct 3', issued: 48, returned: 36, reservations: 21 }, { label: 'Oct 4', issued: 62, returned: 54, reservations: 33 }, { label: 'Oct 5', issued: 71, returned: 63, reservations: 42 }, { label: 'Oct 6', issued: 55, returned: 48, reservations: 38 }, { label: 'Oct 7', issued: 89, returned: 76, reservations: 61 }, { label: 'Oct 8', issued: 68, returned: 60, reservations: 53 }, { label: 'Oct 9', issued: 74, returned: 66, reservations: 58 }],
      fines: [{ label: 'Oct 1', value: 2100 }, { label: 'Oct 7', value: 3200 }, { label: 'Oct 13', value: 3950 }, { label: 'Oct 19', value: 6240 }, { label: 'Oct 25', value: 4850 }, { label: 'Oct 31', value: 5780 }],
    },
  },
}

const storageKey = 'read-at-sil-demo-data-v1'

export function readDemoData(): LibraryData {
  try {
    const value = localStorage.getItem(storageKey)
    return value ? { ...initialDemoData, ...JSON.parse(value) as Partial<LibraryData> } : structuredClone(initialDemoData)
  } catch {
    return structuredClone(initialDemoData)
  }
}

export function saveDemoData(data: LibraryData) {
  localStorage.setItem(storageKey, JSON.stringify(data))
}
