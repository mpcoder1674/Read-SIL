import { supabase } from './supabase'
import type { Book, LibraryData, Profile } from './types'

type Row = Record<string, unknown>

function value<T>(item: unknown, key: string, fallback: T): T {
  return item && typeof item === 'object' && key in item ? (item as Row)[key] as T : fallback
}

function relation(item: unknown, key: string): Row {
  const result = value<unknown>(item, key, {})
  return (Array.isArray(result) ? result[0] : result) as Row
}

function asBook(row: Row): Book {
  const copies = Array.isArray(row.book_copies) ? row.book_copies as Row[] : []
  const authors = Array.isArray(row.book_authors) ? row.book_authors as Row[] : []
  const authorNames = authors.map((entry) => String(relation(entry, 'authors').name ?? '')).filter(Boolean)
  return {
    id: String(row.id),
    title: String(row.title ?? 'Untitled'),
    author: authorNames.join(', ') || 'Author not listed',
    category: String(relation(row, 'book_categories').name ?? 'Uncategorised'),
    isbn: String(row.isbn ?? ''),
    shelf: String(copies.find((copy) => copy.status === 'available')?.shelf_location ?? '—'),
    copies: copies.length,
    available: copies.filter((copy) => copy.status === 'available').length,
  }
}

function dateLabel(value: unknown) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(String(value)))
}

export async function loadLibraryData(profile: Profile): Promise<LibraryData> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const [booksResult, loansResult, renewalsResult, reservationsResult, finesResult, paymentsResult, noticesResult, announcementsResult, membersResult, auditResult, policyResult] = await Promise.all([
    supabase.from('books').select('id,title,isbn,book_categories(name),book_authors(authors(name)),book_copies(id,status,shelf_location)').order('title').limit(100),
    supabase.from('loans').select('id,member_id,issued_at,due_at,returned_at,status,book_copies(book_id,books(title))').order('issued_at', { ascending: false }).limit(100),
    supabase.from('loan_renewal_requests').select('id,loan_id,requester_id,status,requested_at,loans(copy_id,book_copies(book_id,books(title)))').order('requested_at', { ascending: false }).limit(50),
    supabase.from('reservations').select('id,book_id,member_id,created_at,status,books(title)').order('created_at', { ascending: false }).limit(100),
    supabase.from('fines').select('id,loan_id,amount,reason,status,created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('payments').select('id,fine_id,amount,status,transaction_reference,created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('notifications').select('id,title,message,created_at,read_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('library_announcements').select('id,title,message,published_at').eq('active', true).order('published_at', { ascending: false }).limit(10),
    ['librarian', 'administrator'].includes(profile.role)
      ? supabase.from('profiles').select('id,full_name,role,requested_role,email,is_active').order('full_name').limit(100)
      : Promise.resolve({ data: [], error: null }),
    ['librarian', 'administrator'].includes(profile.role)
      ? supabase.from('audit_logs').select('id,action,target_type,target_id,created_at,actor_id').order('created_at', { ascending: false }).limit(30)
      : Promise.resolve({ data: [], error: null }),
    supabase.from('library_policies').select('policy_value').eq('policy_key', 'circulation').maybeSingle(),
  ])

  const failed = [booksResult, loansResult, renewalsResult, reservationsResult, finesResult, paymentsResult, noticesResult, announcementsResult, membersResult, auditResult, policyResult].find((result) => result.error)
  if (failed?.error) throw new Error(failed.error.message)

  const books = (booksResult.data ?? []).map((row) => asBook(row as Row))
  const members = (membersResult.data ?? []).map((row) => {
    const member = row as Row
    return { id: String(member.id), name: String(member.full_name ?? 'Library member'), role: String(member.role ?? 'Member'), requestedRole: member.requested_role ? String(member.requested_role) : null, email: String(member.email ?? ''), status: member.is_active ? 'Active' : 'Inactive' }
  })
  const memberNames = new Map(members.map((member) => [member.id, member.name]))
  const bookNames = new Map(books.map((book) => [book.id, book.title]))
  const loans = (loansResult.data ?? []).map((row) => {
    const loan = row as Row
    const due = new Date(String(loan.due_at))
    const status = loan.returned_at ? 'Returned' : due.getTime() < Date.now() ? 'Overdue' : due.getTime() < Date.now() + 5 * 86400000 ? 'Due soon' : 'On time'
    const copy = relation(loan, 'book_copies')
    const bookTitle = relation(copy, 'books').title ?? bookNames.get(String(copy.book_id)) ?? 'Loan record'
    return { id: String(loan.id), title: String(bookTitle), member: memberNames.get(String(loan.member_id)) ?? (String(loan.member_id) === profile.id ? profile.full_name : 'Member'), issued: dateLabel(loan.issued_at), due: dateLabel(loan.due_at), status: status as 'Returned' | 'Overdue' | 'Due soon' | 'On time' }
  })
  const reservations = (reservationsResult.data ?? []).map((row) => {
    const reservation = row as Row
    const bookId = String(reservation.book_id)
    const status = String(reservation.status ?? 'pending').toLowerCase()
    return { id: String(reservation.id), title: bookNames.get(bookId) ?? String(relation(reservation, 'books').title ?? 'Reserved title'), member: memberNames.get(String(reservation.member_id)) ?? (String(reservation.member_id) === profile.id ? profile.full_name : 'Member'), placed: dateLabel(reservation.created_at), status: (status === 'ready' ? 'Ready for pickup' : status === 'waiting' ? 'Waiting' : status === 'fulfilled' ? 'Fulfilled' : status === 'cancelled' ? 'Cancelled' : status === 'expired' ? 'Expired' : 'Pending') as 'Waiting' | 'Ready for pickup' | 'Pending' | 'Fulfilled' | 'Cancelled' | 'Expired' }
  })
  const renewalRequests = (renewalsResult.data ?? []).map((row) => {
    const request = row as Row
    const loan = relation(request, 'loans')
    const copy = relation(loan, 'book_copies')
    const bookTitle = relation(copy, 'books').title ?? bookNames.get(String(copy.book_id)) ?? 'Loan record'
    const status = String(request.status ?? 'pending')
    return { id: String(request.id), loanId: String(request.loan_id), title: String(bookTitle), member: memberNames.get(String(request.requester_id)) ?? (String(request.requester_id) === profile.id ? profile.full_name : 'Member'), requested: dateLabel(request.requested_at), status: (status.charAt(0).toUpperCase() + status.slice(1)) as 'Pending' | 'Approved' | 'Rejected' }
  })
  const fines = (finesResult.data ?? []).map((row) => {
    const fine = row as Row
    return { id: String(fine.id), title: String(fine.reason ?? 'Library fine'), amount: Number(fine.amount ?? 0), status: String(fine.status) === 'paid' ? 'Paid' as const : 'Outstanding' as const }
  })
  const payments = (paymentsResult.data ?? []).map((row) => {
    const payment = row as Row
    return { id: String(payment.id), amount: Number(payment.amount ?? 0), status: String(payment.status ?? 'pending'), reference: String(payment.transaction_reference ?? payment.fine_id ?? payment.id), date: dateLabel(payment.created_at) }
  })
  const notices = (noticesResult.data ?? []).map((row) => {
    const notice = row as Row
    return { id: String(notice.id), title: String(notice.title ?? 'Library update'), message: String(notice.message ?? ''), date: dateLabel(notice.created_at), read: Boolean(notice.read_at) }
  })
  const announcements = (announcementsResult.data ?? []).map((row) => {
    const announcement = row as Row
    return { id: String(announcement.id), title: String(announcement.title ?? 'Library announcement'), message: String(announcement.message ?? ''), date: dateLabel(announcement.published_at) }
  })
  const policy = (policyResult.data?.policy_value ?? {}) as Row
  const policies = {
    studentLimit: Number(policy.student_loan_limit ?? 6),
    facultyLimit: Number(policy.faculty_loan_limit ?? 12),
    loanPeriodDays: Number(policy.loan_period_days ?? 14),
    maxRenewals: Number(policy.max_renewals ?? 2),
    finePerDay: Number(policy.fine_per_day ?? 10),
    graceDays: Number(policy.grace_days ?? 3),
    reservationPickupDays: Number(policy.reservation_pickup_days ?? 3),
  }
  const staffActivity = (auditResult.data ?? []).map((row) => {
    const entry = row as Row
    return { id: String(entry.id), action: String(entry.action ?? 'Library activity'), detail: `${String(entry.target_type ?? 'Record')} ${String(entry.target_id ?? '')}`.trim(), person: memberNames.get(String(entry.actor_id)) ?? 'Staff member', date: dateLabel(entry.created_at), status: 'Completed' }
  })
  const memberActivity = loans.map((loan) => ({ id: loan.id, action: loan.status === 'Returned' ? 'Book returned' : 'Book issued', detail: loan.title, person: profile.full_name, date: loan.issued, status: 'Completed' }))

  const { data: metricsRow, error: metricsError } = await supabase.rpc('library_dashboard_metrics')
  if (metricsError) throw new Error(metricsError.message)
  const rawMetrics = (metricsRow ?? {}) as Row
  const rawCharts = (rawMetrics.charts ?? {}) as Row
  const chartRows = (key: string) => Array.isArray(rawCharts[key]) ? rawCharts[key] as Row[] : []
  const metrics = {
    totalBooks: Number(rawMetrics.total_books ?? 0),
    totalMembers: Number(rawMetrics.total_members ?? 0),
    activeLoans: Number(rawMetrics.active_loans ?? 0),
    overdueLoans: Number(rawMetrics.overdue_loans ?? 0),
    activeReservations: Number(rawMetrics.active_reservations ?? 0),
    outstandingFines: Number(rawMetrics.outstanding_fines ?? 0),
    myActiveLoans: Number(rawMetrics.my_active_loans ?? 0),
    myReservations: Number(rawMetrics.my_reservations ?? 0),
    myOverdueLoans: Number(rawMetrics.my_overdue_loans ?? 0),
    myOutstandingFines: Number(rawMetrics.my_outstanding_fines ?? 0),
    charts: {
      categories: chartRows('categories').map((row) => ({ label: String(row.label ?? 'Other'), value: Number(row.value ?? 0) })),
      memberTypes: chartRows('member_types').map((row) => ({ label: String(row.label ?? 'Member'), value: Number(row.value ?? 0) })),
      circulation: chartRows('circulation').map((row) => ({ label: String(row.label ?? ''), issued: Number(row.issued ?? 0), returned: Number(row.returned ?? 0), reservations: Number(row.reservations ?? 0) })),
      fines: chartRows('fines').map((row) => ({ label: String(row.label ?? ''), value: Number(row.value ?? 0) })),
    },
  }
  return { books, loans, reservations, fines, notices, announcements, renewalRequests, payments, policies, members, activity: staffActivity.length ? staffActivity : memberActivity, metrics }
}

export async function createBook(input: { title: string; author: string; category: string; isbn: string; copies: number }) {
  if (!supabase) throw new Error('Cloud database is not configured.')
  const { error } = await supabase.rpc('create_catalogue_book', {
    p_title: input.title,
    p_author: input.author,
    p_category: input.category,
    p_isbn: input.isbn || null,
    p_copies: input.copies,
  })
  if (error) throw new Error(error.message)
}

export async function reserveBook(bookId: string) {
  if (!supabase) throw new Error('Cloud database is not configured.')
  const { error } = await supabase.rpc('reserve_book', { p_book_id: bookId })
  if (error) throw new Error(error.message)
}

export async function issueBook(memberId: string, bookId: string) {
  if (!supabase) throw new Error('Cloud database is not configured.')
  const { data, error: copyError } = await supabase.from('book_copies').select('id').eq('book_id', bookId).eq('status', 'available').limit(1).maybeSingle()
  if (copyError) throw new Error(copyError.message)
  if (!data) throw new Error('No available copy is ready to issue.')
  const { error } = await supabase.rpc('issue_copy', { p_member_id: memberId, p_copy_id: data.id })
  if (error) throw new Error(error.message)
}

export async function issueReservedBook(reservationId: string) {
  if (!supabase) throw new Error('Cloud database is not configured.')
  const { error } = await supabase.rpc('issue_reserved_copy', { p_reservation_id: reservationId })
  if (error) throw new Error(error.message)
}

export async function returnLoan(loanId: string) {
  if (!supabase) throw new Error('Cloud database is not configured.')
  const { error } = await supabase.rpc('return_copy', { p_loan_id: loanId })
  if (error) throw new Error(error.message)
}

export async function requestRenewal(loanId: string) {
  if (!supabase) throw new Error('Cloud database is not configured.')
  const { error } = await supabase.rpc('request_loan_renewal', { p_loan_id: loanId })
  if (error) throw new Error(error.message)
}

export async function markNoticeRead(noticeId: string) {
  if (!supabase) throw new Error('Cloud database is not configured.')
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', noticeId)
  if (error) throw new Error(error.message)
}

export async function recordDemoPayment(fineId: string) {
  if (!supabase) throw new Error('Cloud database is not configured.')
  const { error } = await supabase.rpc('record_demo_payment', { p_fine_id: fineId })
  if (error) throw new Error(error.message)
}

export async function cancelReservation(reservationId: string) {
  if (!supabase) throw new Error('Cloud database is not configured.')
  const { error } = await supabase.rpc('cancel_reservation', { p_reservation_id: reservationId })
  if (error) throw new Error(error.message)
}

export async function setMemberStatus(memberId: string, isActive: boolean) {
  if (!supabase) throw new Error('Cloud database is not configured.')
  const { error } = await supabase.rpc('admin_set_member_status', { p_member_id: memberId, p_is_active: isActive })
  if (error) throw new Error(error.message)
}

export async function setMemberRole(memberId: string, role: string) {
  if (!supabase) throw new Error('Cloud database is not configured.')
  const { error } = await supabase.rpc('admin_set_member_role', { p_member_id: memberId, p_role: role })
  if (error) throw new Error(error.message)
}

export async function reviewLoanRenewal(requestId: string, approve: boolean) {
  if (!supabase) throw new Error('Cloud database is not configured.')
  const { error } = await supabase.rpc('review_loan_renewal', { p_request_id: requestId, p_approve: approve, p_note: null })
  if (error) throw new Error(error.message)
}
