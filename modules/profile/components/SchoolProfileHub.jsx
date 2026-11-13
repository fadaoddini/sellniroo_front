'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
  lazy,
} from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Loader2,
  Mail,
  Phone,
  User,
  Shield,
  GraduationCap,
  BookOpen,
  HeartHandshake,
  Calendar,
  BadgeCheck,
  ExternalLink,
  ChevronDown,
  Search,
  X,
  Check,
  Eye,
} from 'lucide-react'
import moment from 'moment-jalaali'
import { useAuth } from '@/contexts/AuthContext'
import schoolService from '@/components/School/services/schoolService'
import {
  buildSchoolProfileTabs,
  defaultSchoolProfileTab,
  resolveSchoolRole,
  schoolRoleLabel,
  SCHOOL_RANK_FA,
} from '@/components/School/schoolRoleNav'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import styles from '../styles/ProfilePage.module.css'
import domainStyles from '../styles/DomainProfilePage.module.css'
import hubStyles from '../styles/SchoolProfileHub.module.css'

const TeacherDashboard = lazy(() =>
  import('@/components/School/TeacherDashboard'),
)
const StudentDashboard = lazy(() =>
  import('@/components/School/StudentDashboard'),
)
const CounselorDashboard = lazy(() =>
  import('@/components/School/CounselorDashboard'),
)
const SchoolManage = lazy(() => import('@/components/School/SchoolManage'))

function PanelFallback() {
  return (
    <div className={styles.panelFallback} role="status">
      <Loader2 className={styles.spinner} size={22} />
    </div>
  )
}

function RoleBadge({ role, me }) {
  const label = schoolRoleLabel(role)
  const student = me?.student
  let extra = ''
  if (role === 'student' && student) {
    extra = SCHOOL_RANK_FA[student.rank_tier] || student.rank_tier || ''
  } else if (role === 'teacher' && me?.teacher?.specialty) {
    extra = me.teacher.specialty
  } else if (role === 'counselor' && me?.counselor?.specialty) {
    extra = me.counselor.specialty
  }
  return (
    <div className={hubStyles.roleBadge}>
      <span>
        {label}
        {extra ? (
          <>
            <br />
            {extra}
          </>
        ) : null}
      </span>
    </div>
  )
}

function previewInitials(name, fallback = '؟') {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return fallback
  if (parts.length === 1) return parts[0].slice(0, 1)
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`
}

function SchoolPreviewPicker({
  items = [],
  value,
  onChange,
  label = 'پیش‌نمایش',
  title = 'انتخاب',
  countNoun = 'مورد',
  triggerPlaceholder = 'انتخاب کنید',
  searchPlaceholder = 'جستجو…',
  emptyLabel = 'موردی یافت نشد',
  fallbackName = (item) => `مورد ${item.id}`,
  getSecondary = () => '',
  getSearchText = (item) =>
    `${item.display_name || ''} ${item.mobile || ''}`,
  initialFallback = '؟',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const searchRef = useRef(null)
  const titleId = 'school-preview-picker-title'

  const selected = useMemo(
    () => items.find((item) => String(item.id) === String(value)),
    [items, value],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) =>
      String(getSearchText(item) || '')
        .toLowerCase()
        .includes(q),
    )
  }, [items, query, getSearchText])

  const selectedSecondary = selected ? getSecondary(selected) : ''

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return undefined
    }
    const t = setTimeout(() => searchRef.current?.focus(), 50)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const dialog =
    open && mounted
      ? createPortal(
          <div
            className={hubStyles.previewOverlay}
            onClick={() => setOpen(false)}
            role="presentation"
          >
            <div
              className={hubStyles.previewDialog}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <div className={hubStyles.previewDialogHead}>
                <div className={hubStyles.previewDialogTitle}>
                  <span className={hubStyles.previewDialogIcon} aria-hidden>
                    <Eye size={15} strokeWidth={2.2} />
                  </span>
                  <div>
                    <h4 id={titleId}>{title}</h4>
                    <p>
                      {items.length} {countNoun} در دسترس
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={hubStyles.previewDialogClose}
                  onClick={() => setOpen(false)}
                  aria-label="بستن"
                >
                  <X size={15} strokeWidth={2.2} />
                </button>
              </div>

              <div className={hubStyles.previewSearch}>
                <Search size={15} strokeWidth={2.2} aria-hidden />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  autoComplete="off"
                />
                {query ? (
                  <button
                    type="button"
                    className={hubStyles.previewSearchClear}
                    onClick={() => {
                      setQuery('')
                      searchRef.current?.focus()
                    }}
                    aria-label="پاک کردن جستجو"
                  >
                    <X size={13} strokeWidth={2.4} />
                  </button>
                ) : null}
              </div>

              <div className={hubStyles.previewList} role="listbox">
                {filtered.length === 0 ? (
                  <p className={hubStyles.previewEmpty}>{emptyLabel}</p>
                ) : (
                  filtered.map((item) => {
                    const active = String(item.id) === String(value)
                    const name = item.display_name || fallbackName(item)
                    const secondary = getSecondary(item)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`${hubStyles.previewOption} ${
                          active ? hubStyles.previewOptionActive : ''
                        }`}
                        onClick={() => {
                          onChange(String(item.id))
                          setOpen(false)
                        }}
                      >
                        <span className={hubStyles.previewAvatar} aria-hidden>
                          {previewInitials(name, initialFallback)}
                        </span>
                        <span className={hubStyles.previewOptionMeta}>
                          <strong>{name}</strong>
                          <em>{secondary || '—'}</em>
                        </span>
                        {active ? (
                          <Check
                            size={15}
                            strokeWidth={2.6}
                            className={hubStyles.previewCheck}
                            aria-hidden
                          />
                        ) : null}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <div className={hubStyles.previewSelect}>
        <span className={hubStyles.previewSelectLabel}>{label}</span>
        <button
          type="button"
          className={hubStyles.previewTrigger}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className={hubStyles.previewTriggerText}>
            <strong>
              {selected?.display_name || triggerPlaceholder}
            </strong>
            {selectedSecondary ? <em>{selectedSecondary}</em> : null}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2.2}
            className={hubStyles.previewSelectIcon}
            aria-hidden
          />
        </button>
      </div>
      {dialog}
    </>
  )
}

function accountRow(icon, label, value, opts = {}) {
  const { dir, href } = opts
  return (
    <li>
      <span className={hubStyles.accountLabel}>
        {icon}
        {label}
      </span>
      {href && value && value !== '—' ? (
        <Link href={href} className={hubStyles.accountLink} dir={dir || undefined}>
          {value}
          <ExternalLink size={12} aria-hidden />
        </Link>
      ) : (
        <strong dir={dir || undefined}>{value || '—'}</strong>
      )}
    </li>
  )
}

function AccountPanel({ user, me, role }) {
  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') || '—'
  const joined = user?.date_joined
    ? moment(user.date_joined).format('jYYYY/jMM/jDD')
    : '—'
  const teacher = me?.teacher
  const student = me?.student
  const counselor = me?.counselor
  const accessItems = [
    { ok: !!me?.can_view_teacher_panel, label: 'پنل معلم' },
    { ok: !!me?.can_view_manage_panel, label: 'مدیریت' },
    { ok: !!me?.can_view_student_panel, label: 'دانش‌آموز' },
    { ok: !!me?.can_view_counselor_panel, label: 'مشاور' },
  ]

  return (
    <section className={hubStyles.accountGrid} aria-label="اطلاعات حساب">
      <article className={hubStyles.accountCol}>
        <header className={hubStyles.accountColHead}>
          <User size={16} aria-hidden />
          <h3>حساب کاربری</h3>
        </header>
        <ul className={hubStyles.accountList}>
          {accountRow(null, 'نام و نام خانوادگی', fullName)}
          {accountRow(<Phone size={13} aria-hidden />, 'موبایل', user?.mobile || '—', {
            dir: 'ltr',
          })}
          {accountRow(<Mail size={13} aria-hidden />, 'ایمیل', user?.email || '—', {
            dir: 'ltr',
          })}
          {accountRow(
            <Calendar size={13} aria-hidden />,
            'عضویت از',
            joined,
          )}
          {accountRow(null, 'شناسه کاربر', user?.id != null ? String(user.id) : '—', {
            dir: 'ltr',
          })}
          {accountRow(
            <Shield size={13} aria-hidden />,
            'سطح سیستم',
            user?.is_superuser
              ? 'سوپریوزر'
              : user?.is_staff
                ? 'استف'
                : 'کاربر',
          )}
        </ul>
      </article>

      <article className={hubStyles.accountCol}>
        <header className={hubStyles.accountColHead}>
          <BadgeCheck size={16} aria-hidden />
          <h3>نقش و دسترسی مدرسه</h3>
        </header>
        <ul className={hubStyles.accountList}>
          {accountRow(null, 'نقش فعال', schoolRoleLabel(role))}
          {accountRow(
            null,
            'مدیر مدرسه',
            me?.is_admin || me?.is_superuser ? 'بله' : 'خیر',
          )}
          {accessItems.map((a) => (
            <li key={a.label}>
              <span className={hubStyles.accountLabel}>{a.label}</span>
              <strong
                className={
                  a.ok ? hubStyles.accountOk : hubStyles.accountMuted
                }
              >
                {a.ok ? 'فعال' : 'ندارد'}
              </strong>
            </li>
          ))}
        </ul>
      </article>

      <article className={hubStyles.accountCol}>
        <header className={hubStyles.accountColHead}>
          {role === 'teacher' || teacher ? (
            <GraduationCap size={16} aria-hidden />
          ) : role === 'student' || student ? (
            <BookOpen size={16} aria-hidden />
          ) : role === 'counselor' || counselor ? (
            <HeartHandshake size={16} aria-hidden />
          ) : (
            <Shield size={16} aria-hidden />
          )}
          <h3>جزئیات نقش</h3>
        </header>
        <ul className={hubStyles.accountList}>
          {teacher ? (
            <>
              {accountRow(null, 'نام نمایشی معلم', teacher.display_name || '—')}
              {accountRow(null, 'تخصص', teacher.specialty || '—')}
              {accountRow(
                null,
                'وضعیت',
                teacher.is_active === false ? 'غیرفعال' : 'فعال',
              )}
              {accountRow(
                null,
                'تعداد دانش‌آموز',
                teacher.student_count != null
                  ? String(teacher.student_count)
                  : '—',
              )}
              {accountRow(
                null,
                'تعداد درس',
                teacher.subject_count != null
                  ? String(teacher.subject_count)
                  : '—',
              )}
              {accountRow(
                null,
                'صفحه عمومی',
                teacher.public_path || teacher.public_slug || '—',
                teacher.public_path
                  ? { href: teacher.public_path, dir: 'ltr' }
                  : { dir: 'ltr' },
              )}
            </>
          ) : null}

          {student ? (
            <>
              {accountRow(null, 'نام نمایشی دانش‌آموز', student.display_name || '—')}
              {accountRow(
                null,
                'پایه',
                student.grade != null ? String(student.grade) : '—',
              )}
              {accountRow(
                null,
                'کلاس',
                student.school_class_title || '—',
              )}
              {accountRow(
                null,
                'رتبه',
                SCHOOL_RANK_FA[student.rank_tier] || student.rank_tier || '—',
              )}
              {accountRow(
                null,
                'امتیاز فعالیت',
                student.activity_points != null
                  ? String(student.activity_points)
                  : '—',
              )}
              {accountRow(
                null,
                'معدل',
                student.average_percent != null
                  ? `${student.average_percent}٪`
                  : '—',
              )}
            </>
          ) : null}

          {counselor ? (
            <>
              {accountRow(
                null,
                'نام نمایشی مشاور',
                counselor.display_name || '—',
              )}
              {accountRow(null, 'تخصص', counselor.specialty || '—')}
              {accountRow(
                null,
                'شماره پروانه',
                counselor.license_no || '—',
              )}
              {accountRow(
                null,
                'سابقه (سال)',
                counselor.years_experience != null
                  ? String(counselor.years_experience)
                  : '—',
              )}
              {accountRow(
                null,
                'وضعیت',
                counselor.is_active === false ? 'غیرفعال' : 'فعال',
              )}
              {accountRow(
                null,
                'صفحه عمومی',
                counselor.public_path || counselor.public_slug || '—',
                counselor.public_path
                  ? { href: counselor.public_path, dir: 'ltr' }
                  : { dir: 'ltr' },
              )}
            </>
          ) : null}

          {!teacher && !student && !counselor ? (
            <li className={hubStyles.accountEmpty}>
              <span>
                هنوز نقش معلم / دانش‌آموز / مشاور به این حساب وصل نشده است.
                {me?.is_admin || me?.is_superuser
                  ? ' به‌عنوان مدیر می‌توانید همه پنل‌ها را پیش‌نمایش کنید.'
                  : ''}
              </span>
            </li>
          ) : null}
        </ul>
      </article>
    </section>
  )
}

export default function SchoolProfileHub() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [me, setMe] = useState(null)
  const [ready, setReady] = useState(false)
  const [previewTeacherId, setPreviewTeacherId] = useState('')
  const [previewStudentId, setPreviewStudentId] = useState('')
  const [previewCounselorId, setPreviewCounselorId] = useState('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const qs = searchParams.toString()
      const next = qs ? `/profile?${qs}` : '/profile'
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [authLoading, isAuthenticated, router, searchParams])

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let cancelled = false
    ;(async () => {
      const res = await schoolService.me()
      if (cancelled) return
      if (res.success) setMe(res.data)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const role = useMemo(() => resolveSchoolRole(me, user), [me, user])
  const tabs = useMemo(() => buildSchoolProfileTabs(me, user), [me, user])
  const tabKeys = useMemo(() => new Set(tabs.map((t) => t.key)), [tabs])
  const defaultTab = useMemo(
    () => defaultSchoolProfileTab(me, user),
    [me, user],
  )

  const initialTab = useMemo(() => {
    const q = searchParams.get('tab')
    if (q && tabKeys.has(q)) return q
    return defaultTab
  }, [searchParams, tabKeys, defaultTab])

  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    if (!tabKeys.has(activeTab)) setActiveTab(defaultTab)
  }, [tabKeys, activeTab, defaultTab])

  const handleTabChange = (key) => {
    if (!tabKeys.has(key)) return
    setActiveTab(key)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', key)
    router.replace(`/profile?${params.toString()}`, { scroll: false })
  }

  const panelFlush =
    activeTab === 'teacher' ||
    activeTab === 'manage' ||
    activeTab === 'students' ||
    activeTab === 'counselor'

  const previewTeachers = me?.preview_teachers || []
  const previewStudents = me?.preview_students || []
  const previewCounselors = me?.preview_counselors || []
  const canPreviewTeacher =
    !!(me?.is_admin || me?.is_superuser) && previewTeachers.length > 0
  const canPreviewStudent =
    !!(me?.is_admin || me?.is_superuser) && previewStudents.length > 0
  const canPreviewCounselor =
    !!(me?.is_admin || me?.is_superuser) && previewCounselors.length > 0

  useEffect(() => {
    if (!canPreviewTeacher) return
    if (previewTeacherId) return
    const first = previewTeachers[0]
    if (first?.id != null) setPreviewTeacherId(String(first.id))
  }, [canPreviewTeacher, previewTeachers, previewTeacherId])

  useEffect(() => {
    if (!canPreviewStudent) return
    if (previewStudentId) return
    const first = previewStudents[0]
    if (first?.id != null) setPreviewStudentId(String(first.id))
  }, [canPreviewStudent, previewStudents, previewStudentId])

  useEffect(() => {
    if (!canPreviewCounselor) return
    if (previewCounselorId) return
    const first = previewCounselors[0]
    if (first?.id != null) setPreviewCounselorId(String(first.id))
  }, [canPreviewCounselor, previewCounselors, previewCounselorId])

  if (authLoading || !isAuthenticated || !ready) {
    return (
      <div
        className={`${styles.loadingContainer} ${styles.profilePageSchool} ${domainStyles.pageSchool}`}
        role="status"
      >
        <Loader2 className={styles.spinner} size={28} />
      </div>
    )
  }

  return (
    <div
      className={`${styles.profilePage} ${styles.profilePageSchool} ${domainStyles.page} ${domainStyles.pageSchool} ${hubStyles.page}`}
    >
      <div className={`${styles.container} ${domainStyles.container}`}>
        <ProfileHeader
          user={user}
          variant="school"
          showShortcuts={false}
          roleChip={<RoleBadge role={role} me={me} />}
          actionsExtra={
            canPreviewTeacher && activeTab === 'teacher' ? (
              <SchoolPreviewPicker
                items={previewTeachers}
                value={previewTeacherId}
                onChange={setPreviewTeacherId}
                label="پیش‌نمایش معلم"
                title="پیش‌نمایش معلم"
                countNoun="معلم"
                triggerPlaceholder="انتخاب معلم"
                searchPlaceholder="جستجو با نام، تخصص یا موبایل…"
                emptyLabel="معلمی یافت نشد"
                fallbackName={(t) => `معلم ${t.id}`}
                getSecondary={(t) => t.specialty || 'بدون تخصص ثبت‌شده'}
                getSearchText={(t) =>
                  `${t.display_name || ''} ${t.specialty || ''} ${t.mobile || ''}`
                }
                initialFallback="م"
              />
            ) : canPreviewStudent && activeTab === 'students' ? (
              <SchoolPreviewPicker
                items={previewStudents}
                value={previewStudentId}
                onChange={setPreviewStudentId}
                label="پیش‌نمایش دانش‌آموز"
                title="پیش‌نمایش دانش‌آموز"
                countNoun="دانش‌آموز"
                triggerPlaceholder="انتخاب دانش‌آموز"
                searchPlaceholder="جستجو با نام، پایه یا موبایل…"
                emptyLabel="دانش‌آموزی یافت نشد"
                fallbackName={(s) => `دانش‌آموز ${s.id}`}
                getSecondary={(s) =>
                  s.grade ? `پایه ${s.grade}` : 'بدون پایه'
                }
                getSearchText={(s) =>
                  `${s.display_name || ''} ${s.grade || ''} ${s.mobile || ''}`
                }
                initialFallback="د"
              />
            ) : canPreviewCounselor && activeTab === 'counselor' ? (
              <SchoolPreviewPicker
                items={previewCounselors}
                value={previewCounselorId}
                onChange={setPreviewCounselorId}
                label="پیش‌نمایش مشاور"
                title="پیش‌نمایش مشاور"
                countNoun="مشاور"
                triggerPlaceholder="انتخاب مشاور"
                searchPlaceholder="جستجو با نام، تخصص یا موبایل…"
                emptyLabel="مشاوری یافت نشد"
                fallbackName={(c) => `مشاور ${c.id}`}
                getSecondary={(c) => c.specialty || 'بدون تخصص ثبت‌شده'}
                getSearchText={(c) =>
                  `${c.display_name || ''} ${c.specialty || ''} ${c.mobile || ''}`
                }
                initialFallback="ش"
              />
            ) : null
          }
          footer={
            <div className={hubStyles.headerChrome}>
              <div className={hubStyles.headerTabs}>
                <ProfileTabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onChange={handleTabChange}
                  tone="school"
                />
              </div>
            </div>
          }
        />

        <div
          className={`${styles.tabContent} ${panelFlush ? styles.tabContentFlush : ''}`}
          role="tabpanel"
          id={`panel-${activeTab}`}
        >
          {activeTab === 'account' ? (
            <AccountPanel user={user} me={me} role={role} />
          ) : null}

          <Suspense fallback={<PanelFallback />}>
            {activeTab === 'teacher' ? (
              <TeacherDashboard
                embedded
                previewTeacherId={previewTeacherId}
                onPreviewTeacherIdChange={setPreviewTeacherId}
              />
            ) : null}
            {activeTab === 'manage' ? <SchoolManage embedded /> : null}
            {activeTab === 'students' ? (
              <StudentDashboard
                embedded
                previewStudentId={previewStudentId}
                onPreviewStudentIdChange={setPreviewStudentId}
              />
            ) : null}
            {activeTab === 'counselor' ? (
              <CounselorDashboard
                embedded
                previewCounselorId={previewCounselorId}
                onPreviewCounselorIdChange={setPreviewCounselorId}
              />
            ) : null}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
