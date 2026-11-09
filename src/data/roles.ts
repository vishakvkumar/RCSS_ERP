import type { Employee, RoleId } from './types'
import { departments } from './mock'

export interface RoleMeta {
  id: RoleId
  title: string
  scope: string
  summary: string
}

export const roles: RoleMeta[] = [
  { id: 'principal', title: 'Director / Principal', scope: 'Whole institution', summary: 'Institution-wide dashboard, final approvals, accreditation readiness.' },
  { id: 'dean', title: 'Dean', scope: 'One school', summary: 'All departments in the school, escalated approvals.' },
  { id: 'hod', title: 'Head of Department', scope: 'One department', summary: 'Department staff, attendance, first-level approvals, academic verification.' },
  { id: 'hr', title: 'HR', scope: 'All employees', summary: 'Employee records, onboarding, document verification, letters.' },
  { id: 'finance', title: 'Finance', scope: 'Pay and payouts', summary: 'Salary slips, Form 16, statutory data and incentive payments.' },
  { id: 'iqac', title: 'IQAC Coordinator', scope: 'Accreditation data', summary: 'Verified faculty data mapped to NAAC and NIRF, completeness tracking.' },
  { id: 'research', title: 'Research Pillar Head', scope: 'Research', summary: 'Publications, funded projects and the Scopus-based incentive.' },
  { id: 'admission', title: 'Admission Pillar Head', scope: 'Admission duty staff', summary: 'Admission-duty roster and staff availability.' },
  { id: 'employee', title: 'Employee', scope: 'Own record', summary: 'Profile, documents, payslips, leave and research claims.' },
  { id: 'admin', title: 'System Administrator', scope: 'Settings', summary: 'Departments, campuses, roles, approval chains and audit log.' },
]

export const roleTitle = (r: RoleId) => roles.find((x) => x.id === r)?.title ?? r

export interface NavItem {
  to: string
  label: string
  icon: string
}

const self: NavItem[] = [
  { to: '/me/profile', label: 'My profile', icon: 'User' },
  { to: '/me/attendance', label: 'Attendance and leave', icon: 'CalendarCheck' },
  { to: '/me/payslips', label: 'Payslips and Form 16', icon: 'Wallet' },
  { to: '/me/research', label: 'My research', icon: 'BookOpen' },
  { to: '/me/requests', label: 'My requests', icon: 'Send' },
]

export function navFor(role: RoleId): { section: string; items: NavItem[] }[] {
  const work: Record<RoleId, NavItem[]> = {
    principal: [
      { to: '/approvals', label: 'Approvals', icon: 'CheckSquare' },
      { to: '/people', label: 'People', icon: 'Users' },
      { to: '/research', label: 'Research', icon: 'FlaskConical' },
      { to: '/iqac', label: 'IQAC and NAAC', icon: 'Award' },
    ],
    dean: [
      { to: '/approvals', label: 'Approvals', icon: 'CheckSquare' },
      { to: '/people', label: 'School staff', icon: 'Users' },
      { to: '/research', label: 'Research', icon: 'FlaskConical' },
    ],
    hod: [
      { to: '/approvals', label: 'Approvals', icon: 'CheckSquare' },
      { to: '/people', label: 'Department staff', icon: 'Users' },
      { to: '/verify', label: 'Verify academic entries', icon: 'BadgeCheck' },
      { to: '/research', label: 'Research', icon: 'FlaskConical' },
    ],
    hr: [
      { to: '/approvals', label: 'HR requests', icon: 'CheckSquare' },
      { to: '/people', label: 'Employees', icon: 'Users' },
      { to: '/onboarding', label: 'Onboarding', icon: 'UserPlus' },
      { to: '/verify', label: 'Document verification', icon: 'BadgeCheck' },
    ],
    finance: [
      { to: '/payroll', label: 'Salary and Form 16', icon: 'Wallet' },
      { to: '/payouts', label: 'Incentive payouts', icon: 'IndianRupee' },
    ],
    iqac: [
      { to: '/iqac', label: 'NAAC and NIRF', icon: 'Award' },
      { to: '/people', label: 'Faculty data', icon: 'Users' },
    ],
    research: [
      { to: '/research', label: 'Publications and claims', icon: 'FlaskConical' },
      { to: '/research/projects', label: 'Funded projects', icon: 'Landmark' },
      { to: '/research/policy', label: 'Incentive policy', icon: 'SlidersHorizontal' },
    ],
    admission: [{ to: '/admission', label: 'Admission duty', icon: 'ClipboardList' }],
    employee: [],
    admin: [
      { to: '/admin/master', label: 'Master data', icon: 'Building2' },
      { to: '/admin/roles', label: 'Roles and access', icon: 'KeyRound' },
      { to: '/admin/audit', label: 'Audit log', icon: 'History' },
    ],
  }
  const out = [{ section: 'Overview', items: [{ to: '/', label: 'Dashboard', icon: 'LayoutDashboard' }] }]
  if (work[role].length) out.push({ section: 'My work', items: work[role] })
  out.push({ section: 'Self-service', items: self })
  out.push({ section: 'About', items: [{ to: '/access', label: 'Who sees what', icon: 'ShieldCheck' }] })
  return out
}

/** Which employees a role may list, given the signed-in person. */
export function scopeEmployees(role: RoleId, me: Employee, all: Employee[]): Employee[] {
  const deptOf = (id: string) => departments.find((d) => d.id === id)
  switch (role) {
    case 'principal':
    case 'hr':
    case 'iqac':
    case 'research':
    case 'finance':
      return all
    case 'dean': {
      const school = deptOf(me.departmentId)?.schoolId
      return all.filter((e) => deptOf(e.departmentId)?.schoolId === school)
    }
    case 'hod':
      return all.filter((e) => e.departmentId === me.departmentId)
    case 'admission':
      return all.filter((e) => e.admissionDuty)
    default:
      return all.filter((e) => e.id === me.id)
  }
}

export type Field = 'salary' | 'identity' | 'bank' | 'academic' | 'attendance' | 'research' | 'contact'

/** What parts of someone else's record a role can see. */
export function canSee(role: RoleId, field: Field): boolean | 'logged' | 'totals' {
  const m: Record<RoleId, Partial<Record<Field, boolean | 'logged' | 'totals'>>> = {
    principal: { salary: 'totals', identity: 'logged', bank: 'logged', academic: true, attendance: true, research: true, contact: true },
    dean: { academic: true, attendance: true, research: true, contact: true },
    hod: { academic: true, attendance: true, research: true, contact: true },
    hr: { salary: true, identity: true, bank: true, academic: true, attendance: true, contact: true },
    finance: { salary: true, bank: true, attendance: 'totals', contact: true },
    iqac: { academic: true, research: true, contact: true },
    research: { research: true, academic: true, contact: true },
    admission: { attendance: true, contact: true },
    employee: {},
    admin: { contact: true },
  }
  return m[role][field] ?? false
}

export const accessMatrix: { data: string; cells: Record<Exclude<RoleId, 'employee'>, string> }[] = [
  { data: 'Academic records', cells: { principal: 'All', dean: 'School', hod: 'Dept', hr: 'All', finance: 'No', iqac: 'All', research: 'Papers', admission: 'No', admin: 'No' } },
  { data: 'Attendance and leave', cells: { principal: 'All', dean: 'School', hod: 'Dept', hr: 'All', finance: 'Totals', iqac: 'No', research: 'No', admission: 'Duty', admin: 'No' } },
  { data: 'Salary and Form 16', cells: { principal: 'Totals', dean: 'No', hod: 'No', hr: 'View', finance: 'All', iqac: 'No', research: 'No', admission: 'No', admin: 'No' } },
  { data: 'ID and bank documents', cells: { principal: 'Logged', dean: 'No', hod: 'No', hr: 'All', finance: 'Bank', iqac: 'No', research: 'No', admission: 'No', admin: 'No' } },
  { data: 'Research claims', cells: { principal: 'All', dean: 'School', hod: 'Dept', hr: 'No', finance: 'Payout', iqac: 'All', research: 'All', admission: 'No', admin: 'No' } },
  { data: 'NAAC and NIRF data', cells: { principal: 'All', dean: 'School', hod: 'Dept', hr: 'No', finance: 'No', iqac: 'All', research: 'View', admission: 'No', admin: 'No' } },
  { data: 'System settings', cells: { principal: 'No', dean: 'No', hod: 'No', hr: 'No', finance: 'No', iqac: 'No', research: 'No', admission: 'No', admin: 'All' } },
]
