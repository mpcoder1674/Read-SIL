export type Role = 'student' | 'faculty' | 'librarian' | 'administrator'

export type Book = {
  id: string
  title: string
  author: string
  category: string
  isbn: string
  shelf: string
  copies: number
  available: number
}

export type Loan = {
  id: string
  title: string
  member: string
  issued: string
  due: string
  status: 'On time' | 'Due soon' | 'Overdue' | 'Returned'
}

export type Reservation = {
  id: string
  title: string
  member: string
  placed: string
  status: 'Waiting' | 'Ready for pickup' | 'Pending' | 'Fulfilled' | 'Cancelled' | 'Expired'
}

export type Fine = {
  id: string
  title: string
  amount: number
  status: 'Outstanding' | 'Paid'
}

export type Notice = {
  id: string
  title: string
  message: string
  date: string
  read: boolean
}

export type Announcement = {
  id: string
  title: string
  message: string
  date: string
}

export type RenewalRequest = {
  id: string
  loanId: string
  title: string
  member: string
  requested: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export type DashboardCharts = {
  categories: { label: string; value: number }[]
  memberTypes: { label: string; value: number }[]
  circulation: { label: string; issued: number; returned: number; reservations: number }[]
  fines: { label: string; value: number }[]
}

export type PaymentRecord = {
  id: string
  amount: number
  status: string
  reference: string
  date: string
}

export type LibraryPolicy = {
  studentLimit: number
  facultyLimit: number
  loanPeriodDays: number
  maxRenewals: number
  finePerDay: number
  graceDays: number
  reservationPickupDays: number
}

export type LibraryData = {
  books: Book[]
  loans: Loan[]
  reservations: Reservation[]
  fines: Fine[]
  notices: Notice[]
  announcements: Announcement[]
  renewalRequests: RenewalRequest[]
  payments: PaymentRecord[]
  policies: LibraryPolicy
  members: { id: string; name: string; role: string; requestedRole?: string | null; email: string; status: string }[]
  activity: { id: string; action: string; detail: string; person: string; date: string; status: string }[]
  metrics: { totalBooks: number; totalMembers: number; activeLoans: number; overdueLoans: number; activeReservations: number; outstandingFines: number; myActiveLoans: number; myReservations: number; myOverdueLoans: number; myOutstandingFines: number; charts: DashboardCharts }
}

export type Profile = {
  id: string
  role: Role
  full_name: string
  email: string
  university_id: string | null
  department: string | null
  is_active: boolean
}
