import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowDownLeft, ArrowLeftRight, ArrowRight, Bell, BookMarked, BookOpen,
  BookOpenCheck, Building2, CalendarDays, ChartNoAxesCombined, Check, ChevronDown,
  ChevronRight, CircleDollarSign, Clock3, CreditCard, Download, GraduationCap,
  LayoutDashboard, LibraryBig, LogOut, Menu, Plus, Search, Settings, ShieldCheck,
  Sparkles, Users, X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { cloudConfigured, supabase } from './lib/supabase'
import { cancelReservation, createBook, issueBook, issueReservedBook, loadLibraryData, markNoticeRead, recordDemoPayment, requestRenewal, reserveBook, returnLoan, reviewLoanRenewal, setMemberRole, setMemberStatus } from './lib/cloudData'
import { readDemoData, saveDemoData } from './lib/demoData'
import type { Book, LibraryData, Profile, Role } from './lib/types'

type NavItem = { id: string; label: string; icon: LucideIcon }

const roleNames: Record<Role, string> = {
  student: 'Student',
  faculty: 'Faculty',
  librarian: 'Librarian',
  administrator: 'Administrator',
}

const roleCopy: Record<Role, { theme: string; heading: string; sentence: string; icon: LucideIcon; email: string }> = {
  student: { theme: 'student', heading: 'Knowledge builds brighter futures.', sentence: 'Explore thousands of books, reserve, borrow and grow with read@SIL.', icon: GraduationCap, email: 'University Email / USN' },
  faculty: { theme: 'faculty', heading: 'Teaching today for a brighter tomorrow.', sentence: 'Access academic resources, research materials and digital collections.', icon: Users, email: 'University Email' },
  librarian: { theme: 'librarian', heading: 'Manage today’s library for tomorrow’s learners.', sentence: 'Catalogue, issue, return and manage library resources efficiently.', icon: BookOpen, email: 'Authorized Email' },
  administrator: { theme: 'administrator', heading: 'Oversee. Manage. Enhance.', sentence: 'Monitor system activity, manage users and ensure seamless library operations.', icon: Settings, email: 'Authorized Email' },
}

const navigation: Record<Role, NavItem[]> = {
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Search Books', icon: Search },
    { id: 'borrowings', label: 'My Borrowings', icon: BookOpenCheck },
    { id: 'reservations', label: 'Reservations', icon: CalendarDays },
    { id: 'fines', label: 'Fines & Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: Users },
  ],
  faculty: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Search Books', icon: Search },
    { id: 'borrowings', label: 'My Borrowings', icon: BookOpenCheck },
    { id: 'reservations', label: 'Reservations', icon: CalendarDays },
    { id: 'fines', label: 'Fines & Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: Users },
  ],
  librarian: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'manage-books', label: 'Manage Books', icon: BookOpen },
    { id: 'members', label: 'Manage Members', icon: Users },
    { id: 'circulation', label: 'Book Issue/Return', icon: ArrowLeftRight },
    { id: 'reservations', label: 'Reservations', icon: CalendarDays },
    { id: 'fines', label: 'Fines Management', icon: CircleDollarSign },
    { id: 'reports', label: 'Reports', icon: ChartNoAxesCombined },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'audit', label: 'Audit Logs', icon: ShieldCheck },
  ],
  administrator: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'catalogue', label: 'Book Catalogue', icon: BookOpen },
    { id: 'circulation', label: 'Circulation', icon: ArrowLeftRight },
    { id: 'reservations', label: 'Reservations', icon: CalendarDays },
    { id: 'fines', label: 'Fines & Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports & Analytics', icon: ChartNoAxesCombined },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'audit', label: 'Audit Logs', icon: ShieldCheck },
    { id: 'policies', label: 'Policies & Access', icon: ShieldCheck },
  ],
}

const demoNames: Record<Role, string> = {
  student: 'Keerthana S',
  faculty: 'Dr. Ananya Verma',
  librarian: 'Maya Rao',
  administrator: 'Administrator',
}

const emptyData: LibraryData = { books: [], loans: [], reservations: [], fines: [], notices: [], announcements: [], renewalRequests: [], payments: [], policies: { studentLimit: 0, facultyLimit: 0, loanPeriodDays: 0, maxRenewals: 0, finePerDay: 0, graceDays: 0, reservationPickupDays: 0 }, members: [], activity: [], metrics: { totalBooks: 0, totalMembers: 0, activeLoans: 0, overdueLoans: 0, activeReservations: 0, outstandingFines: 0, myActiveLoans: 0, myReservations: 0, myOverdueLoans: 0, myOutstandingFines: 0, charts: { categories: [], memberTypes: [], circulation: [], fines: [] } } }

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <div className="brand-crest" aria-hidden="true"><BookOpen size={22} /><span>✦</span></div>
      <div className="brand-copy">
        <div className="brand-name">read<span>@</span><b>SIL</b></div>
        {!compact && <div className="brand-full">READ AT SAPTHAGIRI INFORMATION LIBRARY</div>}
        {!compact && <div className="brand-tag">DISCOVER · READ · GROW</div>}
      </div>
    </div>
  )
}

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessionReady, setSessionReady] = useState(!cloudConfigured)
  const [passwordRecovery, setPasswordRecovery] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery')

  useEffect(() => {
    const client = supabase
    if (!client) return
    const loadProfile = async (userId: string | undefined) => {
      if (!userId) {
        setProfile(null)
        setSessionReady(true)
        return
      }
      const { data } = await client.from('profiles').select('id,role,full_name,email,university_id,department,is_active').eq('id', userId).maybeSingle()
      if (data && !data.is_active) {
        setProfile(null)
        await client.auth.signOut()
      } else {
        setProfile(data as Profile | null)
      }
      setSessionReady(true)
    }
    void client.auth.getSession().then(({ data }) => loadProfile(data.session?.user.id))
    const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true)
        return
      }
      void loadProfile(session?.user.id)
    })
    return () => authListener.subscription.unsubscribe()
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage profile={profile} onProfile={setProfile} recovering={passwordRecovery} onRecoveryComplete={() => setPasswordRecovery(false)} />} />
      <Route path="/login/:role" element={<LoginPage profile={profile} onProfile={setProfile} recovering={passwordRecovery} onRecoveryComplete={() => setPasswordRecovery(false)} />} />
      <Route path="/:role/*" element={<Portal profile={profile} sessionReady={sessionReady} onProfile={setProfile} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function LoginPage({ profile, onProfile, recovering, onRecoveryComplete }: { profile: Profile | null; onProfile: (profile: Profile | null) => void; recovering: boolean; onRecoveryComplete: () => void }) {
  const params = useParams<{ role: string }>()
  const navigate = useNavigate()
  const role = params.role as Role | undefined
  const validRole = role && role in roleNames ? role : undefined
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [universityId, setUniversityId] = useState('')
  const [department, setDepartment] = useState('')
  const [registering, setRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const Icon = validRole ? roleCopy[validRole].icon : LibraryBig

  useEffect(() => {
    if (recovering && !validRole) navigate('/login/administrator', { replace: true })
  }, [recovering, validRole, navigate])

  if (!recovering && profile && validRole === profile.role) return <Navigate to={`/${profile.role}/dashboard`} replace />

  async function signIn(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (!validRole) return
    if (!supabase) {
      setMessage('Cloud sign-in is not configured yet. Open a clearly marked demo preview, or add the Supabase keys from the setup guide.')
      return
    }
    setBusy(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      setMessage(error?.message ?? 'We could not verify this account.')
      setBusy(false)
      return
    }
    const { data: account, error: accountError } = await supabase.from('profiles').select('id,role,full_name,email,university_id,department,is_active').eq('id', data.user.id).maybeSingle()
    if (accountError || !account || !account.is_active) {
      await supabase.auth.signOut()
      setMessage('This account is not active in the library directory. Contact the library administrator.')
      setBusy(false)
      return
    }
    if (account.role !== validRole) {
      await supabase.auth.signOut()
      setMessage(`This account is assigned to the ${roleNames[account.role as Role]} portal.`)
      setBusy(false)
      return
    }
    onProfile(account as Profile)
    navigate(`/${validRole}/dashboard`)
  }

  async function register(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (!validRole) return
    if (!supabase) {
      setMessage('Online registration needs Supabase. Add the project URL and publishable key, then apply the database migrations.')
      return
    }
    setBusy(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          university_id: universityId.trim(),
          department: department.trim(),
          requested_role: validRole,
        },
        emailRedirectTo: `${window.location.origin}/login/${validRole}`,
      },
    })
    if (error) {
      setMessage(error.message)
    } else if (!data.user) {
      setMessage('We could not submit the account request. Please try again or contact the library.')
    } else {
      setMessage(`Your ${roleNames[validRole]} account request was submitted. Verify your university email, then wait for library administrator approval before signing in.`)
    }
    setBusy(false)
  }

  async function forgotPassword() {
    if (!email) {
      setMessage('Enter your university email first, then choose Forgot password.')
      return
    }
    if (!supabase) {
      setMessage('Password recovery becomes available after Supabase Auth is configured.')
      return
    }
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login/${validRole ?? 'student'}` })
    setMessage(error ? error.message : 'If this account exists, password recovery instructions have been sent.')
    setBusy(false)
  }

  async function updatePassword(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (!supabase) return
    if (password.length < 8) {
      setMessage('Choose a password with at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setMessage('The passwords do not match.')
      return
    }
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage(error.message)
      setBusy(false)
      return
    }
    await supabase.auth.signOut()
    onProfile(null)
    setPassword('')
    setConfirmPassword('')
    onRecoveryComplete()
    setMessage('Your password has been updated. Sign in with your new password.')
    setBusy(false)
  }

  async function googleSignIn() {
    if (!validRole || !supabase) {
      setMessage('Google sign-in becomes available after Supabase Auth and the university provider are configured.')
      return
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/${validRole}/dashboard` } })
    if (error) setMessage(error.message)
  }

  if (!validRole) {
    return (
      <main className="login-picker">
        <div className="login-picker-hero">
          <Brand />
          <div className="picker-copy">
            <span className="eyebrow">SAPTHAGIRI NPS UNIVERSITY · BENGALURU</span>
            <h1>One library.<br /><em>Every possibility.</em></h1>
            <p>Find the knowledge you need, wherever your learning takes you.</p>
            <div className="picker-numbers"><span><b>50K+</b> Books</span><span><b>5K+</b> Members</span><span><b>Digital</b> Resources</span></div>
          </div>
          <div className="picker-architecture" aria-hidden="true"><Building2 size={140} strokeWidth={0.65} /></div>
          <UniversityMark />
        </div>
        <div className="role-select-area">
          <div className="role-select-heading"><span className="eyebrow">YOUR LIBRARY, YOUR WAY</span><h2>Choose your portal</h2><p>Sign in to continue to your read@SIL workspace.</p></div>
          <div className="role-cards">
            {(Object.keys(roleNames) as Role[]).map((item) => {
              const ItemIcon = roleCopy[item].icon
              return <button className={`role-card theme-${item}`} key={item} onClick={() => navigate(`/login/${item}`)}>
                <span className="role-card-icon"><ItemIcon size={22} /></span>
                <span className="role-card-text"><b>{roleNames[item]} portal</b><small>{item === 'student' ? 'Explore, borrow and learn' : item === 'faculty' ? 'Research and academic resources' : item === 'librarian' ? 'Manage library operations' : 'System oversight and analytics'}</small></span>
                <ChevronRight size={20} />
              </button>
            })}
          </div>
          <div className="picker-footer"><Brand compact /><span>Secure access for Sapthagiri NPS University</span></div>
        </div>
      </main>
    )
  }

  return (
    <main className={`login-page theme-${validRole}`}>
      <section className="login-story">
        <Brand />
        <div className="login-story-content">
          <span className="eyebrow">READ AT SAPTHAGIRI INFORMATION LIBRARY</span>
          <h1>{roleCopy[validRole].heading}</h1>
          <p>{roleCopy[validRole].sentence}</p>
          <span className="gold-rule" />
          <div className="story-features">
            {(validRole === 'student' ? ['50K+ Books', '5K+ Members', 'Digital Resources'] : validRole === 'faculty' ? ['Journals & Research', 'Digital Databases', 'Faculty Resources'] : validRole === 'librarian' ? ['Manage Books', 'Handle Members', 'Issue & Return'] : ['User Management', 'System Settings', 'Analytics & Reports']).map((feature) => <span key={feature}><BookMarked size={18} />{feature}</span>)}
          </div>
        </div>
        <div className="login-library-scene" aria-hidden="true"><div className="scene-shelf shelf-one" /><div className="scene-shelf shelf-two" /><div className="scene-plant"><i /><i /><i /><b /></div><div className="scene-window" /></div>
        <UniversityMark />
      </section>
      <section className="login-form-side">
        <button className="back-to-roles" onClick={() => navigate('/login')}><ArrowDownLeft size={17} /> All portals</button>
        <div className="login-form-card">
          <div className="login-role-icon"><Icon size={24} /></div>
          <span className="eyebrow">SAPTHAGIRI INFORMATION LIBRARY</span>
          <h2>{recovering ? 'Set a new password' : registering ? `Register · ${roleNames[validRole]}` : `${roleNames[validRole]} Login`}</h2>
          <p className="form-intro">{recovering ? 'Choose a new password for your read@SIL account.' : registering ? 'Request a read@SIL account. The library team will verify your details and approve access.' : `Access your ${validRole} library account to explore and manage resources.`}</p>
          <form onSubmit={recovering ? updatePassword : registering ? register : signIn}>
            {registering && <>
              <label className="field-label" htmlFor="full-name">Full name</label>
              <div className="input-wrap"><Users size={15} /><input id="full-name" autoComplete="name" placeholder="Your name" value={fullName} onChange={(event) => setFullName(event.target.value)} required /></div>
              <label className="field-label" htmlFor="university-id">University ID / Staff ID</label>
              <div className="input-wrap"><span>＃</span><input id="university-id" autoComplete="off" placeholder="Your university or staff ID" value={universityId} onChange={(event) => setUniversityId(event.target.value)} required /></div>
              <label className="field-label" htmlFor="department">Department</label>
              <div className="input-wrap"><Building2 size={15} /><input id="department" autoComplete="organization-title" placeholder="Your department" value={department} onChange={(event) => setDepartment(event.target.value)} required /></div>
            </>}
            {!recovering && <>
              <label className="field-label" htmlFor="email">University email</label>
              <div className="input-wrap"><span>@</span><input id="email" type="email" autoComplete="username" placeholder={roleCopy[validRole].email} value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            </>}
            <label className="field-label" htmlFor="password">{recovering ? 'New password' : 'Password'}</label>
            <div className="input-wrap"><span>⌑</span><input id="password" type={showPassword ? 'text' : 'password'} autoComplete={registering || recovering ? 'new-password' : 'current-password'} minLength={registering || recovering ? 8 : undefined} placeholder={registering || recovering ? 'Create a password (8+ characters)' : 'Enter your password'} value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" className="show-password" onClick={() => setShowPassword((current) => !current)}>{showPassword ? 'Hide' : 'Show'}</button></div>
            {recovering && <>
              <label className="field-label" htmlFor="confirm-password">Confirm new password</label>
              <div className="input-wrap"><span>⌑</span><input id="confirm-password" type="password" autoComplete="new-password" minLength={8} placeholder="Enter the new password again" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div>
            </>}
            {!registering && !recovering && <div className="form-options"><label><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label><button type="button" onClick={() => void forgotPassword()}>Forgot password?</button></div>}
            <button className="primary-button" type="submit" disabled={busy}>{busy ? <span className="spinner" /> : null}{busy ? (recovering ? 'Updating…' : registering ? 'Submitting…' : 'Signing in…') : (recovering ? 'Update password' : registering ? 'Request account' : 'Sign in')}</button>
          </form>
          {message && <div className="form-message" role="status">{message}</div>}
          {recovering ? <div className="register-note">Use this form only after opening the password recovery link sent to your email.</div> : registering ? <div className="register-note">Requested access stays inactive until a library administrator approves your role.</div> : <>
            <div className="or-divider"><span />or continue with<span /></div>
            <button className="google-button" onClick={() => void googleSignIn()}><b className="google-g">G</b>Sign in with Google (University Account)</button>
            <div className="login-assistance">{validRole === 'administrator' ? 'Authorized personnel only.' : 'Need help? Contact the library.'}</div>
            <div className="register-prompt">New to read@SIL? <button type="button" onClick={() => { setRegistering(true); setMessage('') }}>Register here</button></div>
            {!cloudConfigured && <button className="preview-button" onClick={() => navigate(`/${validRole}/dashboard?preview=1`)}><Sparkles size={16} /> Preview dashboard with sample data</button>}
            {!remember && <small className="remember-note">This session will be stored for this browser session only.</small>}
          </>}
          {registering && <div className="register-prompt">Already registered? <button type="button" onClick={() => { setRegistering(false); setMessage('') }}>Back to sign in</button></div>}
        </div>
        <div className="login-bottom"><Brand compact /><span>© 2026 Sapthagiri NPS University</span></div>
      </section>
    </main>
  )
}

function UniversityMark() {
  return <div className="university-mark"><div className="university-seal"><BookOpen size={25} /><span>✺</span></div><div><b>SAPTHAGIRI NPS</b><small>U N I V E R S I T Y</small><em>UNMATCHED EXCELLENCE, UNLIMITED POTENTIAL</em></div></div>
}

function Portal({ profile, sessionReady, onProfile }: { profile: Profile | null; sessionReady: boolean; onProfile: (profile: Profile | null) => void }) {
  const params = useParams<{ role: string; '*': string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roleParam = params.role
  const role = roleParam && roleParam in roleNames ? roleParam as Role : undefined
  const page = params['*']?.split('/')[0] || 'dashboard'
  const preview = searchParams.get('preview') === '1'
  const [data, setData] = useState<LibraryData>(emptyData)
  const [dataLoading, setDataLoading] = useState(!preview)
  const [cloudError, setCloudError] = useState('')
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')
  const [dialog, setDialog] = useState<'book' | 'issue' | 'member' | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const user = profile ?? (role ? { id: 'preview', role, full_name: demoNames[role], email: '', university_id: 'SNP22CS045', department: role === 'faculty' ? 'Computer Science' : 'Information Technology', is_active: true } : null)

  useEffect(() => {
    if (!role) return
    if (preview) {
      setData(readDemoData())
      setDataLoading(false)
      setCloudError('')
      return
    }
    if (!sessionReady) return
    if (!profile) {
      navigate(`/login/${role}`, { replace: true })
      return
    }
    if (profile.role !== role) {
      navigate(`/${profile.role}/dashboard`, { replace: true })
      return
    }
    setDataLoading(true)
    setCloudError('')
    void loadLibraryData(profile).then(setData).catch((error: Error) => {
      setCloudError(error.message)
      setData(emptyData)
    }).finally(() => setDataLoading(false))
  }, [role, page, preview, sessionReady, profile, navigate])

  useEffect(() => {
    const client = supabase
    if (!client || preview || !profile) return
    const tables = ['books', 'book_copies', 'loans', 'loan_renewal_requests', 'reservations', 'fines', 'payments', 'notifications', 'profiles', 'library_policies', 'library_announcements']
    let channel = client.channel(`read-at-sil-${profile.id}`)
    for (const table of tables) {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        void loadLibraryData(profile).then(setData).catch((error: Error) => setCloudError(error.message))
      })
    }
    channel.subscribe()
    return () => { void client.removeChannel(channel) }
  }, [profile?.id, preview])

  const navItems = role ? navigation[role] : []
  const validPage = navItems.some((item) => item.id === page)
  useEffect(() => {
    if (role && !validPage && page !== 'dashboard') navigate(`/${role}/dashboard${preview ? '?preview=1' : ''}`, { replace: true })
  }, [role, page, validPage, navigate, preview])

  function updateLocal(change: (current: LibraryData) => LibraryData) {
    setData((current) => {
      const updated = change(current)
      saveDemoData(updated)
      return updated
    })
  }

  function notify(text: string) {
    setToast(text)
    window.setTimeout(() => setToast(''), 3200)
  }

  async function refreshCloud() {
    if (profile && !preview) setData(await loadLibraryData(profile))
  }

  async function perform(action: string, id?: string) {
    if (!role || !user) return
    try {
      if (preview) {
        if (action === 'reserve') {
          const book = data.books.find((entry) => entry.id === id)
          if (!book) return
          updateLocal((current) => ({ ...current, reservations: [...current.reservations, { id: `r${Date.now()}`, title: book.title, member: demoNames[role], placed: 'Today', status: book.available > 0 ? 'Pending' : 'Waiting' }] }))
          notify(`Reservation added for ${book.title}.`)
        } else if (action === 'renew') {
          const loan = data.loans.find((entry) => entry.id === id)
          if (loan && !data.renewalRequests.some((entry) => entry.loanId === loan.id && entry.status === 'Pending')) {
            updateLocal((current) => ({ ...current, renewalRequests: [{ id: `rr${Date.now()}`, loanId: loan.id, title: loan.title, member: loan.member, requested: 'Just now', status: 'Pending' }, ...current.renewalRequests] }))
          }
          notify('Renewal request recorded in this browser preview.')
        } else if (action === 'return') {
          const loan = data.loans.find((entry) => entry.id === id)
          const waitingReservation = loan && data.reservations.find((entry) => entry.title === loan.title && entry.status === 'Waiting')
          updateLocal((current) => ({
            ...current,
            loans: current.loans.map((entry) => entry.id === id ? { ...entry, status: 'Returned' } : entry),
            books: loan && !waitingReservation ? current.books.map((book) => book.title === loan.title ? { ...book, available: Math.min(book.copies, book.available + 1) } : book) : current.books,
            reservations: waitingReservation ? current.reservations.map((entry) => entry.id === waitingReservation.id ? { ...entry, status: 'Ready for pickup' } : entry) : current.reservations,
          }))
          notify('Return recorded in this browser preview.')
        } else if (action === 'pay') {
          const fine = data.fines.find((entry) => entry.id === id)
          if (fine && !data.payments.some((payment) => payment.reference === `DEMO-${fine.id}`)) updateLocal((current) => ({ ...current, payments: [{ id: `p${Date.now()}`, amount: fine.amount, status: 'Demo recorded', reference: `DEMO-${fine.id}`, date: 'Today' }, ...current.payments] }))
          notify('Demonstration payment recorded. No money was collected and the fine remains outstanding.')
        } else if (action === 'read') {
          updateLocal((current) => ({ ...current, notices: current.notices.map((notice) => notice.id === id ? { ...notice, read: true } : notice) }))
          notify('Notification marked as read.')
        } else if (action === 'cancel') {
          const reservation = data.reservations.find((entry) => entry.id === id)
          updateLocal((current) => ({
            ...current,
            reservations: current.reservations.map((entry) => entry.id === id ? { ...entry, status: 'Cancelled' } : entry),
            books: reservation?.status === 'Ready for pickup' ? current.books.map((book) => book.title === reservation.title ? { ...book, available: Math.min(book.copies, book.available + 1) } : book) : current.books,
          }))
          notify('Reservation removed from the browser preview.')
        } else if (action === 'deactivate-member' || action === 'activate-member') {
          updateLocal((current) => ({ ...current, members: current.members.map((member) => member.id === id ? { ...member, status: action === 'activate-member' ? 'Active' : 'Inactive' } : member) }))
          notify('Sample member status updated in the browser preview.')
        } else if (action.startsWith('set-role:')) {
          const nextRole = action.slice('set-role:'.length)
          updateLocal((current) => ({ ...current, members: current.members.map((member) => member.id === id ? { ...member, role: roleNames[nextRole as Role] ?? nextRole } : member) }))
          notify('Sample member role updated in the browser preview.')
        } else if (action === 'approve-renewal' || action === 'reject-renewal') {
          const request = data.renewalRequests.find((entry) => entry.id === id)
          updateLocal((current) => ({ ...current, renewalRequests: current.renewalRequests.map((entry) => entry.id === id ? { ...entry, status: action === 'approve-renewal' ? 'Approved' : 'Rejected' } : entry), loans: action === 'approve-renewal' && request ? current.loans.map((loan) => loan.id === request.loanId ? { ...loan, due: '07 Nov 2026', status: 'On time' } : loan) : current.loans }))
          notify(action === 'approve-renewal' ? 'Sample renewal approved.' : 'Sample renewal declined.')
        } else if (action === 'issue-reservation') {
          const reservation = data.reservations.find((entry) => entry.id === id)
          if (reservation) updateLocal((current) => ({
            ...current,
            reservations: current.reservations.filter((entry) => entry.id !== id),
            books: current.books.map((book) => book.title === reservation.title ? { ...book, available: Math.max(0, book.available - 1) } : book),
            loans: [{ id: `l${Date.now()}`, title: reservation.title, member: reservation.member, issued: 'Today', due: '24 Oct 2026', status: 'On time' }, ...current.loans],
            activity: [{ id: `a${Date.now()}`, action: 'Reserved book issued', detail: reservation.title, person: reservation.member, date: 'Just now', status: 'Completed' }, ...current.activity],
          }))
          notify('Reserved book issued in the browser preview.')
        }
        return
      }
      if (action === 'reserve' && id) await reserveBook(id)
      if (action === 'renew' && id) await requestRenewal(id)
      if (action === 'return' && id) await returnLoan(id)
      if (action === 'issue-reservation' && id) await issueReservedBook(id)
      if (action === 'read' && id) await markNoticeRead(id)
      if (action === 'pay' && id) {
        await recordDemoPayment(id)
        await refreshCloud()
        notify('Demonstration payment recorded. No money was collected and the fine remains outstanding.')
        return
      }
      if (action === 'cancel' && id) await cancelReservation(id)
      if ((action === 'deactivate-member' || action === 'activate-member') && id) await setMemberStatus(id, action === 'activate-member')
      if (action.startsWith('set-role:') && id) await setMemberRole(id, action.slice('set-role:'.length))
      if ((action === 'approve-renewal' || action === 'reject-renewal') && id) await reviewLoanRenewal(id, action === 'approve-renewal')
      await refreshCloud()
      notify(action === 'reserve' ? 'Reservation saved.' : action === 'renew' ? 'Renewal request submitted.' : action === 'return' ? 'Book return completed.' : action === 'issue-reservation' ? 'Reserved book issued.' : action === 'cancel' ? 'Reservation cancelled.' : action.includes('member') ? 'Member status updated.' : 'Notification updated.')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'The action could not be completed.')
    }
  }

  async function submitBook(input: { title: string; author: string; category: string; isbn: string; copies: number }) {
    if (preview) {
      const book: Book = { ...input, id: `b${Date.now()}`, shelf: 'New arrivals', available: input.copies }
      updateLocal((current) => ({ ...current, books: [book, ...current.books], activity: [{ id: `a${Date.now()}`, action: 'Book added', detail: input.title, person: demoNames[role!], date: 'Just now', status: 'Completed' }, ...current.activity] }))
      notify('Book added to the browser preview catalogue.')
    } else {
      try {
        await createBook(input)
        await refreshCloud()
        notify('Book added to the catalogue.')
      } catch (error) {
        notify(error instanceof Error ? error.message : 'The book could not be added.')
      }
    }
    setDialog(null)
  }

  async function submitIssue(memberId: string, bookId: string) {
    if (preview) {
      const book = data.books.find((entry) => entry.id === bookId)
      const member = data.members.find((entry) => entry.id === memberId)
      if (!book || book.available < 1) {
        notify('No available copy is ready to issue.')
        return
      }
      updateLocal((current) => ({
        ...current,
        books: current.books.map((entry) => entry.id === bookId ? { ...entry, available: Math.max(0, entry.available - 1) } : entry),
        loans: [{ id: `l${Date.now()}`, title: book.title, member: member?.name ?? 'Library member', issued: 'Today', due: '24 Oct 2026', status: 'On time' }, ...current.loans],
        activity: [{ id: `a${Date.now()}`, action: 'Book issued', detail: book.title, person: member?.name ?? 'Library member', date: 'Just now', status: 'Completed' }, ...current.activity],
      }))
      notify(`${book.title} issued in the browser preview.`)
      setDialog(null)
      return
    }
    try {
      await issueBook(memberId, bookId)
      await refreshCloud()
      notify('Book issue completed.')
      setDialog(null)
    } catch (error) {
      notify(error instanceof Error ? error.message : 'The book could not be issued.')
    }
  }

  async function submitMember(input: { name: string; email: string; role: string }) {
    if (!preview) {
      notify('Account invitations require the secured admin invitation workflow. Configure the server invite function before creating accounts.')
      setDialog(null)
      return
    }
    updateLocal((current) => ({ ...current, members: [{ id: `m${Date.now()}`, name: input.name, role: input.role, email: input.email, status: 'Demo' }, ...current.members] }))
    notify('Sample member added to the browser preview.')
    setDialog(null)
  }

  async function signOut() {
    if (!preview && supabase) await supabase.auth.signOut()
    onProfile(null)
    navigate('/login')
  }

  function exportCsv() {
    const rows = page === 'members' || page === 'users' ? data.members : page === 'circulation' ? data.loans : page === 'audit' ? data.activity : data.books
    const headers = Object.keys(rows[0] ?? {})
    if (!headers.length) {
      notify('There are no records to export yet.')
      return
    }
    const csv = [headers.join(','), ...rows.map((row) => headers.map((key) => `"${String((row as Record<string, unknown>)[key] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `read-at-sil-${page}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!role) return <Navigate to="/login" replace />
  if (!preview && !sessionReady) return <LoadingScreen />
  if (!preview && !profile) return <Navigate to={`/login/${role}`} replace />
  if (!preview && profile?.role !== role) return <Navigate to={`/${profile?.role ?? 'student'}/dashboard`} replace />

  const currentName = profile?.full_name || (role ? demoNames[role] : '')
  const unread = data.notices.filter((notice) => !notice.read).length
  const currentPage = navItems.find((item) => item.id === page)?.label ?? 'Dashboard'

  return (
    <div className={`portal theme-${role}`}>
      {preview && <div className="demo-ribbon"><Sparkles size={14} /> DEMO PREVIEW · Sample data stored in this browser <button onClick={() => navigate('/login')}>Exit preview <X size={14} /></button></div>}
      <div className="portal-layout">
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <Brand />
          <nav aria-label={`${roleNames[role]} navigation`}>
            {navItems.map((item) => {
              const ItemIcon = item.icon
              return <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => { navigate(`/${role}/${item.id}${preview ? '?preview=1' : ''}`); setSidebarOpen(false) }}><ItemIcon size={19} /><span>{item.label}</span>{item.id === 'notifications' && unread > 0 && <i className="nav-badge">{unread}</i>}</button>
            })}
          </nav>
          <div className="sidebar-bottom-art" aria-hidden="true"><Building2 size={168} strokeWidth={0.7} /></div>
          <UniversityMark />
          <div className="sidebar-user">
            <div className="avatar avatar-small">{currentName.slice(0, 1)}</div><div className="sidebar-user-copy"><b>{currentName}</b><small>{roleNames[role]} · {profile?.university_id ?? (preview ? 'Preview account' : 'Sapthagiri')}</small></div>
            <button aria-label="Open account menu" onClick={() => setAccountOpen((open) => !open)}><ChevronDown size={17} /></button>
            {accountOpen && <div className="account-menu"><button onClick={() => navigate(`/${role}/profile${preview ? '?preview=1' : ''}`)}>Profile</button><button onClick={() => void signOut()}><LogOut size={15} />Sign out</button></div>}
          </div>
        </aside>
        {sidebarOpen && <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
        <div className="portal-main">
          <header className="topbar">
            <button className="mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
            <div className="global-search"><Search size={19} /><input aria-label="Search library" placeholder="Search books, members, reservations, fines…" value={query} onChange={(event) => setQuery(event.target.value)} /><button onClick={() => navigate(`/${role}/${role === 'student' || role === 'faculty' ? 'books' : 'manage-books'}${preview ? '?preview=1' : ''}`)}>Search</button></div>
            <div className="topbar-actions">
              <div className="notification-control"><button className="icon-button" aria-label="Notifications" onClick={() => setNotificationOpen((open) => !open)}><Bell size={20} />{unread > 0 && <i>{unread}</i>}</button>
                {notificationOpen && <div className="notification-popover"><div className="popover-heading"><b>Notifications</b><button onClick={() => { setNotificationOpen(false); navigate(`/${role}/notifications${preview ? '?preview=1' : ''}`) }}>View all</button></div>{data.notices.slice(0, 3).map((notice) => <button className="popover-notice" key={notice.id} onClick={() => { void perform('read', notice.id); setNotificationOpen(false) }}><b>{notice.title}</b><small>{notice.message}</small></button>)}</div>}
              </div>
              <button className="topbar-profile" onClick={() => setAccountOpen((open) => !open)}><div className="avatar">{currentName.slice(0, 1)}</div><span><b>{currentName}</b><small>{roleNames[role]}</small></span><ChevronDown size={16} /></button>
            </div>
          </header>
          <main className="page-content">
            {cloudError && <div className="cloud-alert"><ShieldCheck size={17} /><span>Database unavailable: {cloudError}. Apply the supplied Supabase migration, then reload this page.</span></div>}
            {dataLoading ? <LoadingScreen inline /> : page === 'dashboard' ? <Dashboard role={role} name={currentName} data={data} navigate={navigate} preview={preview} onQuickAction={(action) => setDialog(action)} /> : <WorkspacePage role={role} page={page} pageLabel={currentPage} data={data} query={query} onQuery={setQuery} preview={preview} onAction={(action, id) => void perform(action, id)} onDialog={setDialog} onExport={exportCsv} profile={profile} />}
          </main>
        </div>
      </div>
      {dialog && <ActionDialog type={dialog} data={data} preview={preview} onClose={() => setDialog(null)} onSubmitBook={(input) => void submitBook(input)} onSubmitIssue={(memberId, bookId) => void submitIssue(memberId, bookId)} onSubmitMember={(input) => void submitMember(input)} />}
      {toast && <div className="toast" role="status"><Check size={17} />{toast}</div>}
    </div>
  )
}

function LoadingScreen({ inline = false }: { inline?: boolean }) {
  return <div className={`loading-screen ${inline ? 'loading-inline' : ''}`}><div className="spinner large-spinner" /><span>Loading read@SIL…</span></div>
}

function Dashboard({ role, name, data, navigate, preview, onQuickAction }: { role: Role; name: string; data: LibraryData; navigate: (path: string) => void; preview: boolean; onQuickAction: (action: 'book' | 'issue' | 'member') => void }) {
  if (role === 'student') return <StudentDashboard name={name} data={data} navigate={navigate} preview={preview} />
  if (role === 'faculty') return <FacultyDashboard name={name} data={data} navigate={navigate} preview={preview} />
  return <StaffDashboard role={role} data={data} navigate={navigate} preview={preview} onQuickAction={onQuickAction} />
}

function StudentDashboard({ name, data, navigate, preview }: { name: string; data: LibraryData; navigate: (path: string) => void; preview: boolean }) {
  const due = data.loans.filter((loan) => loan.status !== 'Returned' && (!preview || loan.member === demoNames.student)).slice(0, 3)
  const path = (page: string) => `/${preview ? 'student' : 'student'}/${page}${preview ? '?preview=1' : ''}`
  const cards = [
    { title: 'Search Books', description: 'Find books by title, author, subject or ISBN.', icon: Search, target: 'books', tone: 'blue' },
    { title: 'My Borrowings', description: 'View issued books, due dates and history.', icon: BookOpen, target: 'borrowings', tone: 'gold' },
    { title: 'Reservations', description: 'Manage your reservations and waiting list.', icon: CalendarDays, target: 'reservations', tone: 'rose' },
    { title: 'Fines & Payments', description: 'Review outstanding fines and receipts.', icon: CreditCard, target: 'fines', tone: 'violet' },
    { title: 'Notifications', description: 'Stay updated with due dates and library news.', icon: Bell, target: 'notifications', tone: 'green' },
    { title: 'Profile', description: 'Manage your account details and preferences.', icon: Users, target: 'profile', tone: 'sky' },
  ]
  return <>
    <section className="student-hero">
      <div><span className="eyebrow">YOUR SAPTHAGIRI LIBRARY</span><h1>Welcome back,<br /><b>{name}</b> <span className="wave">👋</span></h1><p>Explore. Read. Learn. Grow.</p></div>
      <blockquote>“A reader lives<br />a thousand lives<br />before they die.”<small>— George R. R. Martin</small></blockquote>
      <div className="hero-books" aria-hidden="true"><i>KNOWLEDGE</i><i>RESEARCH</i><i>INNOVATION</i></div>
    </section>
    <div className="metric-grid student-metrics">
      <MetricCard icon={BookOpen} label="Books Borrowed" value={preview ? '3' : String(data.metrics.myActiveLoans)} foot="out of 6 allowed" tone="blue" />
      <MetricCard icon={CalendarDays} label="Active Reservations" value={preview ? '2' : String(data.metrics.myReservations)} foot={preview ? '1 waiting' : 'in your queue'} tone="green" />
      <MetricCard icon={Clock3} label="Overdue Books" value={preview ? '1' : String(data.metrics.myOverdueLoans)} foot={preview ? 'Please return soon' : 'check due dates'} tone="red" />
      <MetricCard icon={CreditCard} label="Outstanding Fines" value={`₹${preview ? '20' : data.metrics.myOutstandingFines.toLocaleString('en-IN')}`} foot="View details →" tone="blue" />
    </div>
    <div className="quick-card-grid student-quick-cards">{cards.map((card) => <button key={card.title} className={`quick-card quick-${card.tone}`} onClick={() => navigate(path(card.target))}><span className="quick-icon"><card.icon size={24} /></span><span><b>{card.title}</b><small>{card.description}</small></span><i><ArrowRight size={17} /></i><span className="quick-art" aria-hidden="true" /></button>)}</div>
    <div className="student-bottom-grid">
      <section className="surface-card due-panel"><PanelHeading title="Books Due Soon" action="View All" onClick={() => navigate(path('borrowings'))} /><table><thead><tr><th>Book Title</th><th>Due Date</th><th>Status</th></tr></thead><tbody>{due.length ? due.map((loan) => <tr key={loan.id}><td><div className="book-cell"><span className="book-cover">▤</span><span><b>{loan.title}</b><small>{data.books.find((book) => book.title === loan.title)?.author ?? 'Sapthagiri library collection'}</small></span></div></td><td>{loan.due}</td><td><StatusPill status={loan.status} /></td></tr>) : <EmptyRow columns={3} />}</tbody></table></section>
      <section className="surface-card activity-panel"><PanelHeading title="Recent Activity" action="View All" onClick={() => navigate(path('borrowings'))} /><Timeline entries={data.activity.slice(0, 4).map((entry) => ({ title: entry.action, subtitle: entry.detail, time: entry.date }))} /></section>
      <section className="surface-card announcement-panel"><PanelHeading title="Library Announcements" action="View All" onClick={() => navigate(path('notifications'))} /><div className="announcement-list">{data.announcements.slice(0, 3).length ? data.announcements.slice(0, 3).map((entry) => <Announcement key={entry.id} icon={BookOpen} title={entry.title} detail={entry.message} date={entry.date} />) : <div className="empty-message">Library announcements will appear here.</div>}</div></section>
    </div>
  </>
}

function FacultyDashboard({ name, data, navigate, preview }: { name: string; data: LibraryData; navigate: (path: string) => void; preview: boolean }) {
  const path = (page: string) => `/faculty/${page}${preview ? '?preview=1' : ''}`
  const facultyLoans = data.loans.filter((loan) => !preview || loan.member === demoNames.faculty)
  return <>
    <section className="staff-hero faculty-hero"><div><span className="eyebrow">FACULTY PORTAL</span><h1>Good morning, {name} <span className="wave">👋</span></h1><p>Research, teach and discover academic resources.</p></div><div className="staff-hero-book"><BookOpen size={46} /><span>JOURNALS · RESEARCH · LEARNING</span></div></section>
    <div className="metric-grid"><MetricCard icon={BookOpen} label="Books Borrowed" value={preview ? String(data.loans.filter((loan) => loan.member === demoNames.faculty && loan.status !== 'Returned').length) : String(data.metrics.myActiveLoans)} foot="faculty allowance" tone="gold" /><MetricCard icon={CalendarDays} label="Reservations" value={preview ? String(data.reservations.filter((item) => item.member === demoNames.faculty).length) : String(data.metrics.myReservations)} foot="active requests" tone="blue" /><MetricCard icon={Clock3} label="Overdue Books" value={preview ? String(data.loans.filter((loan) => loan.member === demoNames.faculty && loan.status === 'Overdue').length) : String(data.metrics.myOverdueLoans)} foot="check due dates" tone="red" /><MetricCard icon={CreditCard} label="Outstanding Fines" value={`₹${preview ? '0' : data.metrics.myOutstandingFines.toLocaleString('en-IN')}`} foot="View details →" tone="gold" /></div>
    <div className="faculty-content-grid"><section className="surface-card"><PanelHeading title="My Borrowings" action="View All" onClick={() => navigate(path('borrowings'))} /><LoanTable loans={facultyLoans.slice(0, 4)} /></section><section className="surface-card faculty-research-card"><div className="research-mark"><GraduationCap size={30} /></div><h2>Research begins here</h2><p>Search journals, digital databases and faculty resources across the Sapthagiri library collection.</p><button className="secondary-button" onClick={() => navigate(path('books'))}>Explore resources <ArrowRight size={16} /></button></section></div>
    <div className="staff-bottom-grid"><section className="surface-card"><PanelHeading title="Recommended for Faculty" action="Browse catalogue" onClick={() => navigate(path('books'))} /><BookList books={data.books.slice(0, 4)} /></section><section className="surface-card"><PanelHeading title="Recent Notifications" action="View All" onClick={() => navigate(path('notifications'))} /><NoticeList notices={data.notices.slice(0, 4)} /></section></div>
  </>
}

function StaffDashboard({ role, data, navigate, preview, onQuickAction }: { role: 'librarian' | 'administrator'; data: LibraryData; navigate: (path: string) => void; preview: boolean; onQuickAction: (action: 'book' | 'issue' | 'member') => void }) {
  const admin = role === 'administrator'
  const base = `/${role}/`
  const dest = (page: string) => `${base}${page}${preview ? '?preview=1' : ''}`
  const totalBooks = preview ? '24,680' : data.metrics.totalBooks.toLocaleString('en-IN')
  const members = preview ? '3,842' : data.metrics.totalMembers.toLocaleString('en-IN')
  const issued = preview ? '1,276' : data.metrics.activeLoans.toLocaleString('en-IN')
  const overdue = preview ? '94' : data.metrics.overdueLoans.toLocaleString('en-IN')
  const fines = preview ? '₹18,450' : `₹${data.metrics.outstandingFines.toLocaleString('en-IN')}`
  return <>
    <section className={`staff-hero ${admin ? 'admin-hero' : 'librarian-hero'}`}><div><span className="eyebrow">{admin ? 'ADMINISTRATION / OVERVIEW' : 'LIBRARY OPERATIONS'}</span><h1>{admin ? 'Administrator' : 'Librarian'} Dashboard</h1><p>{admin ? 'Manage your library system, users, resources and overall operations.' : 'Manage library resources, members, circulation, and more — all in one place.'}</p></div><div className="staff-hero-book"><b>{admin ? 'KNOWLEDGE\nPEOPLE\nPOSSIBILITIES' : 'KNOWLEDGE\nORGANIZE\nSUPPORT\nLEARNERS'}</b><span className="hero-book-stack"><i>RESEARCH METHODS</i><i>MACHINE LEARNING</i><i>DATA SCIENCE</i></span></div></section>
    <div className="metric-grid staff-metrics"><MetricCard icon={BookOpen} label="Total Books" value={totalBooks} foot={preview ? '↑ 12% than last month' : 'catalogue records'} tone={admin ? 'violet' : 'green'} /><MetricCard icon={Users} label={admin ? 'Registered Members' : 'Total Members'} value={members} foot={preview ? '↑ 8% than last month' : 'library accounts'} tone="blue" /><MetricCard icon={ArrowLeftRight} label={admin ? 'Books Currently Issued' : 'Books Issued'} value={issued} foot={preview ? '↓ 5% than last month' : 'active loans'} tone="gold" /><MetricCard icon={Clock3} label="Overdue Books" value={overdue} foot={preview ? '↓ 18% than last month' : 'needs follow up'} tone="red" /><MetricCard icon={CircleDollarSign} label="Outstanding Fines" value={fines} foot={preview ? '↑ 6% than last month' : 'unpaid balance'} tone="green" /></div>
    <div className="analytics-grid"><section className="surface-card circulation-chart"><PanelHeading title={admin ? 'Circulation Overview' : 'Circulation Trend'} subtitle={preview ? (admin ? 'Books issued and returned in the last 7 days' : 'Books issued, returned and reserved') : 'Live counts from the last seven days'} action="Last 7 days⌄" /><BarChart admin={admin} data={data.metrics.charts.circulation} /></section><section className="surface-card category-chart"><PanelHeading title={admin ? 'Membership Distribution' : 'Book Category Distribution'} subtitle={admin ? 'Distribution of registered members' : undefined} /><DonutChart data={admin ? data.metrics.charts.memberTypes : data.metrics.charts.categories} total={admin ? data.metrics.totalMembers : data.metrics.totalBooks} admin purple={admin} /></section>{!admin && <section className="surface-card category-chart member-chart"><PanelHeading title="Member Type Distribution" /><DonutChart data={data.metrics.charts.memberTypes} total={data.metrics.totalMembers} admin purple={false} /></section>}</div>
    <div className="operations-grid"><section className="surface-card activity-table-card"><PanelHeading title={admin ? 'Recent Library Activity' : 'Recent Book Issue/Return Activity'} action="View All →" onClick={() => navigate(dest(admin ? 'audit' : 'circulation'))} /><ActivityTable activity={data.activity.slice(0, 5)} /></section><section className="surface-card overdue-card"><PanelHeading title={<>Overdue Books <span className="danger-count">({overdue})</span></>} action="View All →" onClick={() => navigate(dest('circulation'))} /><OverdueList loans={data.loans.filter((loan) => loan.status === 'Overdue').slice(0, 5)} /></section><section className="surface-card quick-actions-card"><PanelHeading title="Quick Actions" /><div className="quick-action-grid"><QuickAction icon={BookOpen} label={admin ? 'Add Book' : 'Add New Book'} onClick={() => onQuickAction('book')} /><QuickAction icon={Users} label={admin ? 'Register Member' : 'Add Member'} onClick={() => onQuickAction('member')} /><QuickAction icon={ArrowLeftRight} label="Issue Book" onClick={() => onQuickAction('issue')} /><QuickAction icon={ArrowRight} label="Return Book" onClick={() => navigate(dest('circulation'))} /><QuickAction icon={CalendarDays} label="Manage Reservations" onClick={() => navigate(dest('reservations'))} /><QuickAction icon={CircleDollarSign} label="Collect Fine" onClick={() => navigate(dest('fines'))} /><QuickAction icon={Download} label="Generate Report" onClick={() => navigate(dest('reports'))} /><QuickAction icon={Settings} label="System Settings" onClick={() => navigate(dest('settings'))} /></div></section></div>
    <div className="staff-bottom-grid"><section className="surface-card"><PanelHeading title="Upcoming Reservations" action="View All →" onClick={() => navigate(dest('reservations'))} /><ReservationTable reservations={data.reservations.filter((entry) => ['Waiting', 'Ready for pickup', 'Pending'].includes(entry.status)).slice(0, 4)} /></section><section className="surface-card fine-trend-card"><PanelHeading title={preview ? 'Fines Collection Trend' : 'Fine Accrual Trend'} action="Last 30 days⌄" /><FineTrendChart data={data.metrics.charts.fines} purple={admin} /></section><section className="surface-card"><PanelHeading title="Recent Notifications" action="View All →" onClick={() => navigate(dest('notifications'))} /><NoticeList notices={data.notices.slice(0, 4)} /></section></div>
    {admin && <div className="system-health-grid"><section className="surface-card health-card"><PanelHeading title="System Health" action="View Details →" /><HealthLine icon={Building2} label="Database" detail="PostgreSQL Cloud" status={cloudConfigured ? 'Connected' : 'Not configured'} /><HealthLine icon={ShieldCheck} label="Authentication" detail="Supabase Auth" status={cloudConfigured ? 'Active' : 'Preview only'} /><HealthLine icon={LibraryBig} label="Cloud Storage" detail="Book Covers & Resources" status={cloudConfigured ? 'Ready' : 'Not configured'} /></section></div>}
  </>
}

function MetricCard({ icon: Icon, label, value, foot, tone }: { icon: LucideIcon; label: string; value: string; foot: string; tone: string }) {
  return <article className="metric-card"><span className={`metric-icon tone-${tone}`}><Icon size={22} /></span><div className="metric-copy"><small>{label}</small><b>{value}</b><span className={`metric-foot ${tone === 'red' ? 'text-red' : ''}`}>{foot}</span></div>{tone === 'red' && <span className="metric-side-icon"><Clock3 size={19} /></span>}</article>
}

function PanelHeading({ title, subtitle, action, onClick }: { title: ReactNode; subtitle?: string; action?: string; onClick?: () => void }) {
  return <div className="panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action && <button onClick={onClick}>{action}</button>}</div>
}

function StatusPill({ status }: { status: string }) {
  const style = status.toLowerCase().replace(/ /g, '-')
  return <span className={`status-pill status-${style}`}>{status}</span>
}

function EmptyRow({ columns, message = 'No records to show.' }: { columns: number; message?: string }) {
  return <tr><td colSpan={columns} className="empty-row">{message}</td></tr>
}

function Timeline({ entries }: { entries: { title: string; subtitle: string; time: string }[] }) {
  return <div className="timeline">{entries.length ? entries.map((entry, index) => <div className="timeline-entry" key={`${entry.title}-${index}`}><i className={`timeline-dot dot-${index % 4}`} /><div><b>{entry.title}</b><small>{entry.subtitle}</small></div><time>{entry.time}</time></div>) : <div className="empty-message">Recent library activity will appear here.</div>}</div>
}

function Announcement({ icon: Icon, title, detail, date }: { icon: LucideIcon; title: string; detail: string; date: string }) {
  return <div className="announcement"><span><Icon size={19} /></span><div><b>{title}</b><small>{detail}</small></div><time>{date}</time></div>
}

function BookList({ books }: { books: Book[] }) {
  return <div className="book-list">{books.length ? books.map((book, index) => <div className="book-list-row" key={book.id}><span className={`mini-cover cover-${index % 5}`}>▤</span><span><b>{book.title}</b><small>{book.author}</small></span><span className="book-availability">{book.available} available</span></div>) : <div className="empty-message">Add books to see recommendations.</div>}</div>
}

function LoanTable({ loans }: { loans: LibraryData['loans'] }) {
  return <table><thead><tr><th>Book</th><th>Due date</th><th>Status</th></tr></thead><tbody>{loans.length ? loans.map((loan) => <tr key={loan.id}><td>{loan.title}</td><td>{loan.due}</td><td><StatusPill status={loan.status} /></td></tr>) : <EmptyRow columns={3} />}</tbody></table>
}

function BarChart({ admin, data }: { admin: boolean; data: LibraryData['metrics']['charts']['circulation'] }) {
  const max = Math.max(1, ...data.flatMap((entry) => [entry.issued, entry.returned, entry.reservations]))
  return <div className={`bar-chart ${admin ? 'chart-purple' : ''}`}><div className="chart-y-labels"><span>{max}</span><span>{Math.round(max * .8)}</span><span>{Math.round(max * .6)}</span><span>{Math.round(max * .4)}</span><span>{Math.round(max * .2)}</span><span>0</span></div><div className="bar-chart-inner">{data.length ? data.map((entry) => <div className="bar-column" key={entry.label}><div className="bars"><i style={{ height: `${Math.max(2, entry.issued / max * 100)}%` }} /><i style={{ height: `${Math.max(2, entry.returned / max * 100)}%` }} /></div><i className="reservation-dot" style={{ bottom: `${Math.max(2, entry.reservations / max * 100)}%` }} /><small>{entry.label}</small></div>) : <div className="empty-chart">No circulation records for this period.</div>}</div><div className="chart-legend"><span><i className="legend-issued" />{admin ? 'Issued' : 'Books Issued'}</span><span><i className="legend-returned" />{admin ? 'Returned' : 'Books Returned'}</span><span><i className="legend-reserved" />Reservations</span></div></div>
}

function DonutChart({ admin, data, total, purple }: { admin: boolean; data: { label: string; value: number }[]; total: number; purple: boolean }) {
  const colors = purple ? ['#673deb', '#a982fa', '#d5c7ff', '#4826b5'] : ['#087a55', '#e85e64', '#f2b948', '#28a982', '#53b391', '#8862ef', '#bddfd0']
  let offset = 0
  const chartTotal = data.reduce((sum, item) => sum + item.value, 0)
  const gradient = data.length ? data.map((entry, index) => {
    const start = chartTotal ? offset / chartTotal * 100 : 0
    offset += entry.value
    const end = chartTotal ? offset / chartTotal * 100 : 0
    return `${colors[index % colors.length]} ${start}% ${end}%`
  }).join(', ') : '#e7ecf3'
  return <div className={`donut-layout ${admin ? 'donut-members' : ''}`}><div className={`donut-chart ${purple ? 'donut-purple' : ''}`} style={{ background: `conic-gradient(${gradient})` }}><div><b>{total.toLocaleString('en-IN')}</b><small>{admin ? 'Total Members' : 'Total Books'}</small></div></div><div className="donut-legend">{data.length ? data.map((entry, index) => <div key={entry.label}><i className={`legend-color color-${index}`} style={{ background: colors[index % colors.length] }} /><span>{entry.label}</span><b>{admin ? `${total ? Math.round(entry.value / total * 100) : 0}%` : entry.value.toLocaleString('en-IN')}</b></div>) : <span className="secondary-text">No category records yet.</span>}</div></div>
}

function FineTrendChart({ data, purple }: { data: LibraryData['metrics']['charts']['fines']; purple: boolean }) {
  const width = 520
  const height = 145
  const max = Math.max(1, ...data.map((point) => point.value))
  const points = data.map((point, index) => `${data.length < 2 ? width / 2 : index / (data.length - 1) * width},${height - point.value / max * (height - 14)}`).join(' ')
  const area = data.length ? `0,${height} ${points} ${width},${height}` : ''
  const lineColor = purple ? '#6138ed' : '#16815c'
  return <div className="fine-trend"><svg className="fine-trend-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-label="Fine accrual trend chart"><defs><linearGradient id="fineArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={lineColor} stopOpacity=".4" /><stop offset="1" stopColor={lineColor} stopOpacity=".04" /></linearGradient></defs>{[0, 1, 2, 3, 4].map((line) => <line key={line} x1="0" x2={width} y1={line * (height - 1) / 4} y2={line * (height - 1) / 4} stroke="#e7edf4" strokeWidth="1" />)}{data.length > 0 && <><polygon points={area} fill="url(#fineArea)" /><polyline points={points} fill="none" stroke={lineColor} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />{data.map((point, index) => <circle key={point.label} cx={data.length < 2 ? width / 2 : index / (data.length - 1) * width} cy={height - point.value / max * (height - 14)} r="3.5" fill={lineColor} />)}</>}</svg><div className="fine-labels">{data.length ? data.map((point) => <span key={point.label}>{point.label}</span>) : <span>No fine records for this period.</span>}</div></div>
}

function ActivityTable({ activity }: { activity: LibraryData['activity'] }) {
  return <div className="table-scroll"><table><thead><tr><th>Date & Time</th><th>Member</th><th>Action</th><th>Book / Detail</th><th>Status</th></tr></thead><tbody>{activity.length ? activity.map((entry) => <tr key={entry.id}><td>{entry.date}</td><td>{entry.person}</td><td>{entry.action}</td><td>{entry.detail}</td><td><StatusPill status={entry.status} /></td></tr>) : <EmptyRow columns={5} />}</tbody></table></div>
}

function OverdueList({ loans }: { loans: LibraryData['loans'] }) {
  return <table><thead><tr><th>Book Title</th><th>Member</th><th>Status</th></tr></thead><tbody>{loans.length ? loans.map((loan) => <tr key={loan.id}><td>{loan.title}</td><td>{loan.member}</td><td><StatusPill status="Overdue" /></td></tr>) : <EmptyRow columns={3} message="No overdue books in these records." />}</tbody></table>
}

function ReservationTable({ reservations }: { reservations: LibraryData['reservations'] }) {
  return <table><thead><tr><th>Date</th><th>Member</th><th>Book Title</th><th>Status</th></tr></thead><tbody>{reservations.length ? reservations.map((entry) => <tr key={entry.id}><td>{entry.placed}</td><td>{entry.member}</td><td>{entry.title}</td><td><StatusPill status={entry.status} /></td></tr>) : <EmptyRow columns={4} />}</tbody></table>
}

function NoticeList({ notices }: { notices: LibraryData['notices'] }) {
  return <div className="notice-list">{notices.length ? notices.map((notice) => <div className={`notice-row ${notice.read ? '' : 'notice-unread'}`} key={notice.id}><span className="notice-dot" /><div><b>{notice.title}</b><small>{notice.message}</small></div><time>{notice.date}</time></div>) : <div className="empty-message">No notifications to display.</div>}</div>
}

function QuickAction({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return <button className="quick-action" onClick={onClick}><Icon size={18} /><span>{label}</span><ChevronRight size={14} /></button>
}

function HealthLine({ icon: Icon, label, detail, status }: { icon: LucideIcon; label: string; detail: string; status: string }) {
  return <div className="health-line"><span><Icon size={18} /></span><div><b>{label}</b><small>{detail}</small></div><i className={status === 'Connected' || status === 'Active' || status === 'Ready' ? 'health-good' : 'health-muted'} />{status}</div>
}

const pageDetails: Record<string, { title: string; description: string; icon: LucideIcon }> = {
  books: { title: 'Search Books', description: 'Search the library catalogue by title, author, ISBN or subject.', icon: Search },
  'manage-books': { title: 'Manage Books', description: 'Maintain catalogue records and physical book copies.', icon: BookOpen },
  catalogue: { title: 'Book Catalogue', description: 'Review catalogue records and manage library holdings.', icon: BookOpen },
  borrowings: { title: 'My Borrowings', description: 'Review current loans, due dates and borrowing history.', icon: BookOpenCheck },
  reservations: { title: 'Reservations', description: 'View reservation status and manage the waiting list.', icon: CalendarDays },
  fines: { title: 'Fines & Payments', description: 'Review fines, payment status and transaction history.', icon: CreditCard },
  notifications: { title: 'Notifications', description: 'Stay current with library updates and account reminders.', icon: Bell },
  profile: { title: 'My Profile', description: 'Review your library account and member details.', icon: Users },
  members: { title: 'Manage Members', description: 'Review member directory and library account status.', icon: Users },
  users: { title: 'User Management', description: 'Manage directory access and assigned library roles.', icon: Users },
  circulation: { title: 'Book Issue & Return', description: 'Manage active loans and maintain circulation records.', icon: ArrowLeftRight },
  reports: { title: 'Reports & Analytics', description: 'Review library activity and export catalogue records.', icon: ChartNoAxesCombined },
  settings: { title: 'System Settings', description: 'Review library service configuration and account settings.', icon: Settings },
  policies: { title: 'Policies & Access', description: 'Review lending rules and role-based access settings.', icon: ShieldCheck },
  audit: { title: 'Audit Logs', description: 'Review the record of significant library system activity.', icon: ShieldCheck },
}

function WorkspacePage({ role, page, pageLabel, data, query, onQuery, preview, onAction, onDialog, onExport, profile }: { role: Role; page: string; pageLabel: string; data: LibraryData; query: string; onQuery: (query: string) => void; preview: boolean; onAction: (action: string, id?: string) => void; onDialog: (dialog: 'book' | 'issue' | 'member' | null) => void; onExport: () => void; profile: Profile | null }) {
  const info = pageDetails[page] ?? { title: pageLabel, description: 'Manage library information and records.', icon: LibraryBig }
  const Icon = info.icon
  const isStudent = role === 'student' || role === 'faculty'
  const canManageCatalogue = ['manage-books', 'catalogue', 'books'].includes(page) && !isStudent
  const canAddBook = ['manage-books', 'catalogue'].includes(page) && !isStudent
  const canAddMember = ['members', 'users'].includes(page) && !isStudent
  const bookRows = useMemo(() => data.books.filter((book) => `${book.title} ${book.author} ${book.category} ${book.isbn}`.toLowerCase().includes(query.toLowerCase())), [data.books, query])
  const loans = useMemo(() => data.loans.filter((loan) => !isStudent || loan.member === demoNames[role] || !preview).filter((loan) => `${loan.title} ${loan.member} ${loan.status}`.toLowerCase().includes(query.toLowerCase())), [data.loans, isStudent, preview, role, query])
  const reservationRows = useMemo(() => data.reservations.filter((item) => !isStudent || item.member === demoNames[role] || !preview).filter((item) => `${item.title} ${item.member} ${item.status}`.toLowerCase().includes(query.toLowerCase())), [data.reservations, isStudent, preview, role, query])
  const fineRows = data.fines.filter((fine) => `${fine.title} ${fine.status}`.toLowerCase().includes(query.toLowerCase()))
  const members = data.members.filter((member) => `${member.name} ${member.role} ${member.email} ${member.status}`.toLowerCase().includes(query.toLowerCase()))
  const notices = data.notices.filter((notice) => `${notice.title} ${notice.message}`.toLowerCase().includes(query.toLowerCase()))
  const staffMode = role === 'librarian' || role === 'administrator'

  return <>
    <div className="workspace-heading"><div className="breadcrumb"><span>read@SIL</span><ChevronRight size={14} /><span>{roleNames[role]}</span><ChevronRight size={14} /><b>{info.title}</b></div><div className="workspace-title"><span><Icon size={23} /></span><div><h1>{info.title}</h1><p>{info.description}</p></div></div></div>
    <section className="surface-card workspace-card">
      <div className="workspace-toolbar"><div className="workspace-search"><Search size={17} /><input placeholder={page === 'books' || canManageCatalogue ? 'Search title, author, ISBN or subject…' : `Search ${pageLabel.toLowerCase()}…`} value={query} onChange={(event) => onQuery(event.target.value)} /></div><div className="toolbar-actions">{['reports', 'audit'].includes(page) && <button className="secondary-button" onClick={onExport}><Download size={16} /> Export CSV</button>}{canAddBook && <button className="primary-button compact-button" onClick={() => onDialog('book')}><Plus size={16} /> Add Book</button>}{canAddMember && <button className="primary-button compact-button" onClick={() => onDialog('member')}><Plus size={16} /> Add Member</button>}{page === 'circulation' && staffMode && <button className="primary-button compact-button" onClick={() => onDialog('issue')}><ArrowLeftRight size={16} /> Issue Book</button>}</div></div>
      {canManageCatalogue && <div className="table-scroll"><table><thead><tr><th>Book Title</th><th>Author</th><th>Category</th><th>ISBN</th><th>Available</th><th>Location</th><th>Copies</th></tr></thead><tbody>{bookRows.length ? bookRows.map((book) => <tr key={book.id}><td><div className="book-cell"><span className="mini-cover">▤</span><b>{book.title}</b></div></td><td>{book.author}</td><td>{book.category}</td><td>{book.isbn || '—'}</td><td><span className={book.available > 0 ? 'availability available' : 'availability unavailable'}>{book.available}/{book.copies}</span></td><td>{book.shelf}</td><td>{book.copies}</td></tr>) : <EmptyRow columns={7} message={preview ? 'No matching books. Add or search the sample catalogue.' : 'No catalogue records are available yet.'} />}</tbody></table></div>}
      {page === 'borrowings' || page === 'circulation' ? <LoanWorkspace loans={loans} renewals={data.renewalRequests} staffMode={staffMode} preview={preview} onAction={onAction} /> : null}
      {page === 'reservations' && <div className="table-scroll"><table><thead><tr><th>Book Title</th><th>Member</th><th>Placed</th><th>Status</th><th>Action</th></tr></thead><tbody>{reservationRows.length ? reservationRows.map((item) => <tr key={item.id}><td>{item.title}</td><td>{item.member}</td><td>{item.placed}</td><td><StatusPill status={item.status} /></td><td>{staffMode && item.status === 'Ready for pickup' ? <button className="table-action" onClick={() => onAction('issue-reservation', item.id)}>Issue to member</button> : ['Waiting', 'Pending', 'Ready for pickup'].includes(item.status) ? <button className="table-action muted-action" onClick={() => onAction('cancel', item.id)}>Cancel</button> : <span className="secondary-text">History</span>}</td></tr>) : <EmptyRow columns={5} message="No reservations match this view." />}</tbody></table></div>}
      {page === 'fines' && <><div className="table-scroll"><table><thead><tr><th>Fine / Book</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{fineRows.length ? fineRows.map((fine) => <tr key={fine.id}><td>{fine.title}</td><td>₹{fine.amount.toLocaleString('en-IN')}</td><td><StatusPill status={fine.status} /></td><td>{fine.status === 'Outstanding' && isStudent ? <button className="table-action" onClick={() => onAction('pay', fine.id)}>Record demo payment</button> : <span className="secondary-text">{fine.status === 'Paid' ? 'Receipt available' : 'Staff review'}</span>}</td></tr>) : <EmptyRow columns={4} message="No fines to display." />}</tbody></table></div><section className="payment-history"><PanelHeading title="Payment History" /><div className="table-scroll"><table><thead><tr><th>Reference</th><th>Amount</th><th>Date</th><th>Record status</th></tr></thead><tbody>{data.payments.length ? data.payments.map((payment) => <tr key={payment.id}><td>{payment.reference}</td><td>₹{payment.amount.toLocaleString('en-IN')}</td><td>{payment.date}</td><td><StatusPill status={payment.status} /></td></tr>) : <EmptyRow columns={4} message="No payment records are available." />}</tbody></table></div><div className="preview-note"><CircleDollarSign size={15} /> Demonstration records do not collect money or settle an outstanding balance.</div></section></>}
      {(page === 'members' || page === 'users') && <div className="table-scroll"><table><thead><tr><th>Member</th><th>Library role</th><th>Requested portal</th><th>Email</th><th>Status</th><th>Action</th></tr></thead><tbody>{members.length ? members.map((member) => <tr key={member.id}><td><div className="member-cell"><span className="avatar avatar-table">{member.name[0]}</span><b>{member.name}</b></div></td><td>{role === 'administrator' ? <select className="role-select" value={member.role.toLowerCase()} onChange={(event) => onAction(`set-role:${event.target.value}`, member.id)}><option value="student">Student</option><option value="faculty">Faculty</option><option value="librarian">Librarian</option><option value="administrator">Administrator</option></select> : member.role}</td><td>{member.status === 'Inactive' && member.requestedRole ? roleNames[member.requestedRole as Role] ?? member.requestedRole : '—'}</td><td>{member.email}</td><td><StatusPill status={member.status} /></td><td>{role === 'administrator' ? <button className="table-action" onClick={() => onAction(member.status === 'Active' ? 'deactivate-member' : 'activate-member', member.id)}>{member.status === 'Active' ? 'Deactivate' : 'Activate'}</button> : <span className="secondary-text">Admin managed</span>}</td></tr>) : <EmptyRow columns={6} message={preview ? 'No sample members match your search.' : 'No member records are available.'} />}</tbody></table></div>}
      {page === 'notifications' && <NoticeWorkspace notices={notices} onAction={onAction} />}
      {page === 'profile' && <ProfileWorkspace role={role} profileName={demoNames[role]} profile={profile} />}
      {page === 'reports' && <ReportsWorkspace data={data} preview={preview} onExport={onExport} />}
      {page === 'settings' && <SettingsWorkspace role={role} preview={preview} policies={data.policies} />}
      {page === 'policies' && <PoliciesWorkspace preview={preview} policies={data.policies} />}
      {page === 'audit' && <ActivityTable activity={data.activity.filter((entry) => `${entry.action} ${entry.detail} ${entry.person}`.toLowerCase().includes(query.toLowerCase()))} />}
      {page === 'books' && isStudent && <div className="table-scroll"><table><thead><tr><th>Book Title</th><th>Author</th><th>Category</th><th>Availability</th><th>Location</th><th>Action</th></tr></thead><tbody>{bookRows.length ? bookRows.map((book) => <tr key={book.id}><td><div className="book-cell"><span className="mini-cover">▤</span><b>{book.title}</b></div></td><td>{book.author}</td><td>{book.category}</td><td><span className={book.available > 0 ? 'availability available' : 'availability unavailable'}>{book.available > 0 ? `${book.available} available` : 'Currently borrowed'}</span></td><td>{book.shelf}</td><td><button className="table-action" onClick={() => onAction('reserve', book.id)}>Reserve</button></td></tr>) : <EmptyRow columns={6} message="No books match your search." />}</tbody></table></div>}
      {!['books', 'manage-books', 'catalogue', 'borrowings', 'circulation', 'reservations', 'fines', 'members', 'users', 'notifications', 'profile', 'reports', 'settings', 'policies', 'audit'].includes(page) && <div className="empty-message">This workspace is ready for library records.</div>}
      {preview && <div className="preview-note"><Sparkles size={15} /> Sample preview changes are saved in this browser. They are not university records.</div>}
    </section>
  </>
}

function LoanWorkspace({ loans, renewals, staffMode, preview, onAction }: { loans: LibraryData['loans']; renewals: LibraryData['renewalRequests']; staffMode: boolean; preview: boolean; onAction: (action: string, id?: string) => void }) {
  return <><div className="table-scroll"><table><thead><tr><th>Book Title</th>{staffMode && <th>Member</th>}<th>Issue Date</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead><tbody>{loans.length ? loans.map((loan) => <tr key={loan.id}><td>{loan.title}</td>{staffMode && <td>{loan.member}</td>}<td>{loan.issued}</td><td>{loan.due}</td><td><StatusPill status={loan.status} /></td><td>{staffMode ? loan.status !== 'Returned' ? <button className="table-action" onClick={() => onAction('return', loan.id)}>Return</button> : <span className="secondary-text">Returned</span> : loan.status !== 'Returned' ? <button className="table-action" onClick={() => onAction('renew', loan.id)}>Request renewal</button> : <span className="secondary-text">Complete</span>}</td></tr>) : <EmptyRow columns={staffMode ? 6 : 5} message={preview ? 'No matching loan records.' : 'No borrowing records are available.'} />}</tbody></table></div>{staffMode && <section className="renewal-queue"><PanelHeading title="Renewal Requests" /><div className="table-scroll"><table><thead><tr><th>Book</th><th>Member</th><th>Requested</th><th>Status</th><th>Decision</th></tr></thead><tbody>{renewals.length ? renewals.map((request) => <tr key={request.id}><td>{request.title}</td><td>{request.member}</td><td>{request.requested}</td><td><StatusPill status={request.status} /></td><td>{request.status === 'Pending' ? <div className="decision-actions"><button className="table-action" onClick={() => onAction('approve-renewal', request.id)}>Approve</button><button className="table-action muted-action" onClick={() => onAction('reject-renewal', request.id)}>Decline</button></div> : <span className="secondary-text">Reviewed</span>}</td></tr>) : <EmptyRow columns={5} message="There are no renewal requests." />}</tbody></table></div></section>}{!preview && <div className="preview-note"><ShieldCheck size={15} /> Loan changes are validated by the Supabase circulation functions and library policy.</div>}</>
}

function NoticeWorkspace({ notices, onAction }: { notices: LibraryData['notices']; onAction: (action: string, id?: string) => void }) {
  return <div className="notice-workspace">{notices.length ? notices.map((notice) => <article className={`notice-card ${notice.read ? '' : 'notice-card-unread'}`} key={notice.id}><span className="notice-card-icon"><Bell size={18} /></span><div><b>{notice.title}</b><p>{notice.message}</p><time>{notice.date}</time></div>{!notice.read && <button className="table-action" onClick={() => onAction('read', notice.id)}>Mark read</button>}</article>) : <div className="empty-message">You are all caught up. New library alerts will appear here.</div>}</div>
}

function ProfileWorkspace({ role, profileName, profile }: { role: Role; profileName: string; profile: Profile | null }) {
  return <div className="profile-workspace"><div className="profile-avatar-large">{(profile?.full_name ?? profileName).slice(0, 1)}</div><div><h2>{profile?.full_name ?? profileName}</h2><p>{roleNames[role]} · {profile?.university_id ?? 'SNP22CS045'}</p></div><div className="profile-fields"><ProfileField label="University email" value={profile?.email || 'Configured after sign-in'} /><ProfileField label="Department" value={profile?.department || 'Information Technology'} /><ProfileField label="Account status" value={profile?.is_active === false ? 'Inactive' : 'Active'} /><ProfileField label="Library role" value={roleNames[role]} /></div><p className="secondary-text">Role, university ID and account status are managed by the library administrator.</p></div>
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return <div className="profile-field"><small>{label}</small><b>{value}</b></div>
}

function ReportsWorkspace({ data, preview, onExport }: { data: LibraryData; preview: boolean; onExport: () => void }) {
  return <div className="reports-workspace"><div className="report-tiles"><MetricCard icon={BookOpen} label="Catalogue records" value={data.metrics.totalBooks.toLocaleString('en-IN')} foot={preview ? 'sample preview' : 'database count'} tone="blue" /><MetricCard icon={ArrowLeftRight} label="Loan records shown" value={String(data.loans.length)} foot="latest records" tone="green" /><MetricCard icon={CalendarDays} label="Reservations shown" value={String(data.reservations.length)} foot="latest records" tone="gold" /></div><div className="report-export"><ChartNoAxesCombined size={32} /><div><b>Library records export</b><small>Download the current catalogue rows as a CSV file.</small></div><button className="secondary-button" onClick={onExport}><Download size={16} /> Export CSV</button></div>{preview && <div className="preview-note"><Sparkles size={15} /> Counts describe the local sample preview data only.</div>}</div>
}

function SettingsWorkspace({ role, preview, policies }: { role: Role; preview: boolean; policies: LibraryData['policies'] }) {
  const limit = role === 'student' ? policies.studentLimit : role === 'faculty' ? policies.facultyLimit : 'Staff'
  return <div className="settings-grid"><SettingRow label="Borrowing limit" value={typeof limit === 'number' ? `${limit} books` : limit} detail="Configured in the library circulation policy." /><SettingRow label="Borrowing period" value={`${policies.loanPeriodDays} days`} detail="Applied to new loans through the circulation workflow." /><SettingRow label="Renewal limit" value={`${policies.maxRenewals} renewals`} detail="Renewal decisions are handled by library staff." /><SettingRow label="Fine grace period" value={`${policies.graceDays} days`} detail={`The configured overdue fine is ₹${policies.finePerDay} per day.`} /><SettingRow label="Reservation pickup" value={`${policies.reservationPickupDays} days`} detail="Ready reservations expire after this pickup window." /><SettingRow label="Cloud connection" value={cloudConfigured ? 'Supabase configured' : 'Not configured'} detail={preview ? 'Preview data is saved only in this browser.' : 'Supabase keys and the database migration are required.'} /></div>
}

function SettingRow({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="setting-row"><div><b>{label}</b><small>{detail}</small></div><span>{value}</span></div>
}

function PoliciesWorkspace({ preview, policies }: { preview: boolean; policies: LibraryData['policies'] }) {
  return <div className="settings-grid"><SettingRow label="Student borrowing limit" value={`${policies.studentLimit} books`} detail="The circulation function enforces this active loan limit." /><SettingRow label="Faculty borrowing limit" value={`${policies.facultyLimit} books`} detail="The circulation function enforces this active loan limit." /><SettingRow label="Standard loan period" value={`${policies.loanPeriodDays} days`} detail="Applied to new loans when staff issues a copy." /><SettingRow label="Renewal limit" value={`${policies.maxRenewals} renewals`} detail="Renewals must be requested by a member and reviewed by staff." /><SettingRow label="Overdue fine" value={`₹${policies.finePerDay} per day`} detail={`${policies.graceDays} grace days apply before a fine is calculated.`} /><SettingRow label="Reservation pickup" value={`${policies.reservationPickupDays} days`} detail="The ready copy is offered to the next waiting member after cancellation or expiry processing." /><SettingRow label="Payments" value="Demonstration only" detail="No real payment provider is configured." /><div className="preview-note"><ShieldCheck size={15} /> {preview ? 'These policy values are sample defaults for the browser preview.' : 'Values are read from the Supabase circulation policy. Update them through a trusted admin workflow.'}</div></div>
}

function ActionDialog({ type, data, preview, onClose, onSubmitBook, onSubmitIssue, onSubmitMember }: { type: 'book' | 'issue' | 'member'; data: LibraryData; preview: boolean; onClose: () => void; onSubmitBook: (input: { title: string; author: string; category: string; isbn: string; copies: number }) => void; onSubmitIssue: (memberId: string, bookId: string) => void; onSubmitMember: (input: { name: string; email: string; role: string }) => void }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('Computer Science')
  const [isbn, setIsbn] = useState('')
  const [copies, setCopies] = useState(1)
  const [memberId, setMemberId] = useState(data.members[0]?.id ?? '')
  const [bookId, setBookId] = useState(data.books.find((book) => book.available > 0)?.id ?? '')
  const [memberRole, setMemberRole] = useState('Student')
  const [memberEmail, setMemberEmail] = useState('')
  const [memberName, setMemberName] = useState('')
  const titleText = type === 'book' ? 'Add catalogue book' : type === 'issue' ? 'Issue a book' : 'Add member'

  function submit(event: FormEvent) {
    event.preventDefault()
    if (type === 'book') onSubmitBook({ title, author, category, isbn, copies })
    if (type === 'issue') onSubmitIssue(memberId, bookId)
    if (type === 'member') onSubmitMember({ name: memberName, email: memberEmail, role: memberRole })
  }

  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header><div><span className="eyebrow">{preview ? 'BROWSER PREVIEW' : 'READ@SIL CATALOGUE'}</span><h2 id="dialog-title">{titleText}</h2></div><button aria-label="Close dialog" onClick={onClose}><X size={20} /></button></header><form onSubmit={submit}>
    {type === 'book' && <><label>Book title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label><label>Author<input value={author} onChange={(event) => setAuthor(event.target.value)} required /></label><div className="form-row"><label>Category<input value={category} onChange={(event) => setCategory(event.target.value)} required /></label><label>ISBN<input value={isbn} onChange={(event) => setIsbn(event.target.value)} /></label></div><label>Physical copies<input type="number" min="1" max="500" value={copies} onChange={(event) => setCopies(Number(event.target.value))} required /></label></>}
    {type === 'issue' && <><label>Member<select value={memberId} onChange={(event) => setMemberId(event.target.value)} required>{data.members.map((member) => <option key={member.id} value={member.id}>{member.name} · {member.role}</option>)}</select></label><label>Available book<select value={bookId} onChange={(event) => setBookId(event.target.value)} required>{data.books.filter((book) => book.available > 0).map((book) => <option key={book.id} value={book.id}>{book.title} · {book.available} available</option>)}</select></label><p className="dialog-hint">The database checks account eligibility, borrowing limits and copy availability before creating a loan.</p></>}
    {type === 'member' && <><label>Full name<input value={memberName} onChange={(event) => setMemberName(event.target.value)} required /></label><label>University email<input type="email" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} required /></label><label>Library role<select value={memberRole} onChange={(event) => setMemberRole(event.target.value)}><option>Student</option><option>Faculty</option><option>Librarian</option></select></label>{!preview && <p className="dialog-hint">Creating accounts requires a trusted invitation workflow. This form will not assign a role or create login credentials.</p>}</>}
    <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">{type === 'issue' ? 'Issue book' : type === 'book' ? 'Save book' : 'Add member'}</button></div>
  </form></section></div>
}

