export type RoleId =
  | 'principal'
  | 'dean'
  | 'hod'
  | 'hr'
  | 'finance'
  | 'iqac'
  | 'research'
  | 'admission'
  | 'employee'
  | 'admin'

export type Status = 'Pending' | 'Approved' | 'Rejected' | 'Returned'

export interface Campus {
  id: string
  name: string
  short: string
  active: boolean
}

export interface School {
  id: string
  name: string
}

export interface Department {
  id: string
  name: string
  schoolId: string
  campusId: string
}

export interface Qualification {
  degree: string
  institution: string
  year: number
}

export interface Certification {
  id: string
  title: string
  issuer: string
  date: string
  kind: 'Certification' | 'FDP' | 'Award' | 'Membership' | 'Workshop'
  status: Status
  proof: string
}

export interface DocumentItem {
  id: string
  name: string
  category: 'Identity' | 'Bank' | 'Appointment' | 'Academic' | 'Statutory'
  status: Status
  uploaded: string
}

export interface ServiceEvent {
  date: string
  event: string
}

export interface Employee {
  id: string
  name: string
  email: string
  designation: string
  category: 'Teaching' | 'Non-teaching'
  departmentId: string
  campusId: string
  joined: string
  phone: string
  dob: string
  address: string
  bank: { account: string; ifsc: string; bankName: string }
  pan: string
  aadhaar: string
  basicPay: number
  allowances: number
  qualifications: Qualification[]
  certifications: Certification[]
  documents: DocumentItem[]
  service: ServiceEvent[]
  admissionDuty: boolean
  probationEnds?: string
  retires: string
}

export interface PunchDay {
  date: string
  in: string | null
  out: string | null
  lateMinutes: number
  status: 'Present' | 'Late' | 'Leave' | 'Absent' | 'Holiday' | 'Weekend'
}

export interface LeaveBalance {
  type: string
  total: number
  used: number
}

export interface Payslip {
  id: string
  employeeId: string
  month: string
  basic: number
  allowances: number
  pf: number
  tds: number
  professionalTax: number
  net: number
  published: boolean
}

export type ScopusQuartile = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Not indexed'
export type AuthorRole = 'First / corresponding author' | 'Co-author'

export interface Publication {
  id: string
  employeeId: string
  title: string
  journal: string
  year: number
  doi: string
  quartile: ScopusQuartile
  authorRole: AuthorRole
  incentive: number
  stage: 'Submitted' | 'HoD verified' | 'Research approved' | 'Paid' | 'Returned'
  submitted: string
}

export interface FundedProject {
  id: string
  employeeId: string
  title: string
  agency: string
  amount: number
  start: string
  end: string
  status: 'Ongoing' | 'Completed'
}

export interface IncentivePolicy {
  amounts: Record<ScopusQuartile, number>
  coAuthorShare: number
  annualCap: number
}

export interface RequestItem {
  id: string
  employeeId: string
  type: 'Leave' | 'On-duty' | 'Profile change' | 'Certificate' | 'Experience letter'
  detail: string
  from?: string
  to?: string
  days?: number
  stage: 'HoD' | 'Dean' | 'HR' | 'Principal' | 'Done'
  status: Status
  created: string
  history: { at: string; by: string; action: string }[]
}

export interface Candidate {
  id: string
  name: string
  designation: string
  departmentId: string
  joining: string
  steps: { label: string; done: boolean }[]
}

export interface AdmissionDuty {
  id: string
  employeeId: string
  date: string
  task: string
  venue: string
}

export interface AuditEntry {
  at: string
  by: string
  action: string
}

export interface Holiday {
  date: string
  name: string
}
