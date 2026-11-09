// Sample data for the demo.
// Leadership names and titles are taken from the RCSS committees page (https://rajagiri.edu/about-committees).
// No personal data (salary, attendance, leave, ID, research) is simulated for them.
// Every other person and every number in this file is fictional.
import type {
  AdmissionDuty,
  Campus,
  Candidate,
  Certification,
  Department,
  DocumentItem,
  Employee,
  FundedProject,
  Holiday,
  IncentivePolicy,
  LeaveBalance,
  Payslip,
  Publication,
  PunchDay,
  RequestItem,
  RoleId,
  School,
} from './types'

// Small deterministic random generator so the demo looks the same on every load.
function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export const campuses: Campus[] = [
  { id: 'hill', name: 'Hill Campus, Kalamassery', short: 'Kalamassery', active: true },
  { id: 'valley', name: 'Valley Campus, Kakkanad', short: 'Kakkanad', active: false },
]

export const schools: School[] = [
  { id: 'sss', name: 'School of Social Sciences' },
  { id: 'scm', name: 'School of Commerce and Management' },
  { id: 'sci', name: 'School of Sciences and Computing' },
]

export const departments: Department[] = [
  { id: 'sw', name: 'Social Work', schoolId: 'sss', campusId: 'hill' },
  { id: 'psy', name: 'Psychology', schoolId: 'sss', campusId: 'hill' },
  { id: 'lang', name: 'English and Languages', schoolId: 'sss', campusId: 'hill' },
  { id: 'com', name: 'Commerce', schoolId: 'scm', campusId: 'hill' },
  { id: 'pm', name: 'Personnel Management', schoolId: 'scm', campusId: 'hill' },
  { id: 'cs', name: 'Computer Science', schoolId: 'sci', campusId: 'hill' },
  { id: 'lis', name: 'Library and Information Science', schoolId: 'sci', campusId: 'hill' },
  { id: 'stat', name: 'Statistics', schoolId: 'sci', campusId: 'hill' },
  { id: 'bio', name: 'Biosciences', schoolId: 'sci', campusId: 'hill' },
  { id: 'admin', name: 'Administration', schoolId: 'sss', campusId: 'hill' },
]

export const designations = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Librarian',
  'Office Superintendent',
  'Accountant',
  'Clerk',
  'Lab Assistant',
]

export const leaveTypes = ['Casual Leave', 'Earned Leave', 'Medical Leave', 'Duty Leave']

export const leadershipSource = 'https://rajagiri.edu/about-committees'

const people: [string, string, string, Employee['category'], string?, boolean?][] = [
  // name, department, designation, category, persona role, real person (from rajagiri.edu)
  ['Prof. Fr. Saju M.D., CMI', 'admin', 'Principal; Chairperson, IQAC', 'Teaching', 'principal', true],
  ['Dr. Bindiya M. Varghese', 'cs', 'Dean, Computer Science', 'Teaching', 'dean', true],
  ['Dr. Anjali Nair', 'cs', 'Associate Professor', 'Teaching', 'hod'],
  ['Dr. Manoj Mathew', 'admin', 'Associate Dean, Human Resource Development', 'Teaching', 'hr', true],
  ['Mr. Joseph Mathew', 'admin', 'Accountant', 'Non-teaching', 'finance'],
  ['Prof. Binoy Joseph', 'admin', 'Associate Director; IQAC Coordinator', 'Teaching', 'iqac', true],
  ['Dr. Alphonsa Vijaya Joseph', 'bio', 'Director, RRDC; Head, Biosciences', 'Teaching', 'research', true],
  ['Dr. Veeva Mathew', 'admin', 'Director, Admissions', 'Teaching', 'admission', true],
  ['Mr. Vivek Raj', 'cs', 'Assistant Professor', 'Teaching', 'employee'],
  ['Dr. Shiju Thomas M.Y.', 'admin', 'Convenor, IT Committee', 'Teaching', 'admin', true],
  ['Dr. Fathima Rasheed', 'cs', 'Assistant Professor', 'Teaching'],
  ['Mr. Rahul Krishnan', 'cs', 'Assistant Professor', 'Teaching'],
  ['Ms. Divya Suresh', 'cs', 'Lab Assistant', 'Non-teaching'],
  ['Dr. Benny Antony', 'sw', 'Associate Professor', 'Teaching'],
  ['Ms. Aleena Paul', 'sw', 'Assistant Professor', 'Teaching'],
  ['Dr. Sreeja Unnikrishnan', 'psy', 'Assistant Professor', 'Teaching'],
  ['Mr. Ajay Varma', 'com', 'Assistant Professor', 'Teaching'],
  ['Dr. Rincy Thomas', 'com', 'Associate Professor', 'Teaching'],
  ['Ms. Neethu Babu', 'pm', 'Assistant Professor', 'Teaching'],
  ['Dr. Sabu Jacob', 'lis', 'Librarian', 'Teaching'],
  ['Ms. Gayathri Mohan', 'lis', 'Assistant Professor', 'Teaching'],
  ['Dr. Vinod Kumar', 'stat', 'Assistant Professor', 'Teaching'],
  ['Ms. Ann Maria', 'lang', 'Assistant Professor', 'Teaching'],
  ['Dr. Harish Shenoy', 'lang', 'Associate Professor', 'Teaching'],
]

const payByDesignation: Record<string, number> = {
  Professor: 144200,
  'Associate Professor': 131400,
  'Assistant Professor': 57700,
  Librarian: 68900,
  'Office Superintendent': 45800,
  Accountant: 41300,
  Clerk: 26500,
  'Lab Assistant': 24400,
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const personaEmployee: Record<RoleId, string> = {} as Record<RoleId, string>

function realPerson(id: string, name: string, dept: string, desig: string, cat: Employee['category']): Employee {
  return {
    id,
    name,
    email: '',
    designation: desig,
    category: cat,
    departmentId: dept,
    campusId: 'hill',
    joined: '',
    phone: '',
    dob: '',
    address: '',
    bank: { account: '', ifsc: '', bankName: '' },
    pan: '',
    aadhaar: '',
    basicPay: 0,
    allowances: 0,
    qualifications: [],
    certifications: [],
    documents: [],
    service: [{ date: '', event: `${desig} (as listed on rajagiri.edu)` }],
    admissionDuty: false,
    retires: '2099-12-31',
    real: true,
  }
}

export const employees: Employee[] = people.map(([name, dept, desig, cat, persona, real], i) => {
  const r = seeded(1000 + i * 37)
  const id = `RCSS${String(1001 + i)}`
  if (persona) personaEmployee[persona as RoleId] = id
  if (real) return realPerson(id, name, dept, desig, cat)
  const joinYear = 2000 + Math.floor(r() * 23)
  const first = name.replace(/^(Dr\.|Mr\.|Ms\.)\s/, '').split(' ')[0].toLowerCase()
  const certs: Certification[] = [
    {
      id: `${id}-c1`,
      title: cat === 'Teaching' ? 'Faculty Development Programme on Outcome-Based Education' : 'Office Automation and e-Governance',
      issuer: cat === 'Teaching' ? 'UGC-MMTTC' : 'Kerala Institute of Local Administration',
      date: '2025-06-14',
      kind: cat === 'Teaching' ? 'FDP' : 'Certification',
      status: 'Approved',
      proof: 'certificate.pdf',
    },
  ]
  if (i % 3 === 0)
    certs.push({
      id: `${id}-c2`,
      title: 'NPTEL: Research Methodology (Elite)',
      issuer: 'NPTEL / IIT Madras',
      date: '2026-04-20',
      kind: 'Certification',
      status: i % 2 === 0 ? 'Pending' : 'Approved',
      proof: 'nptel.pdf',
    })
  const docs: DocumentItem[] = [
    { id: `${id}-d1`, name: 'Aadhaar card', category: 'Identity', status: 'Approved', uploaded: '2024-07-01' },
    { id: `${id}-d2`, name: 'PAN card', category: 'Identity', status: 'Approved', uploaded: '2024-07-01' },
    { id: `${id}-d3`, name: 'Cancelled cheque', category: 'Bank', status: 'Approved', uploaded: '2024-07-01' },
    { id: `${id}-d4`, name: 'Appointment order', category: 'Appointment', status: 'Approved', uploaded: `${joinYear}-06-01` },
    { id: `${id}-d5`, name: 'Highest degree certificate', category: 'Academic', status: i % 5 === 0 ? 'Pending' : 'Approved', uploaded: '2024-07-02' },
  ]
  return {
    id,
    name,
    email: `${first}.${id.toLowerCase()}@rajagiri.edu`,
    designation: desig,
    category: cat,
    departmentId: dept,
    campusId: 'hill',
    joined: `${joinYear}-06-${pad(1 + Math.floor(r() * 25))}`,
    phone: `+91 9${Math.floor(100000000 + r() * 899999999)}`,
    dob: `${1965 + Math.floor(r() * 30)}-${pad(1 + Math.floor(r() * 12))}-${pad(1 + Math.floor(r() * 27))}`,
    address: 'Rajagiri P.O., Kalamassery, Kochi, Kerala 683104',
    bank: {
      account: `XXXXXX${Math.floor(1000 + r() * 8999)}`,
      ifsc: 'SBIN0070123',
      bankName: 'State Bank of India',
    },
    pan: `ABCDE${Math.floor(1000 + r() * 8999)}F`,
    aadhaar: `XXXX XXXX ${Math.floor(1000 + r() * 8999)}`,
    basicPay: payByDesignation[desig],
    allowances: Math.round(payByDesignation[desig] * 0.46),
    qualifications:
      cat === 'Teaching'
        ? [
            { degree: name.startsWith('Dr.') ? 'PhD' : 'MPhil', institution: 'Mahatma Gandhi University', year: joinYear - 2 },
            { degree: 'Master’s degree', institution: 'University of Kerala', year: joinYear - 6 },
            { degree: 'UGC-NET', institution: 'University Grants Commission', year: joinYear - 5 },
          ]
        : [{ degree: 'Bachelor’s degree', institution: 'Mahatma Gandhi University', year: joinYear - 3 }],
    certifications: certs,
    documents: docs,
    service: [
      { date: `${joinYear}-06-01`, event: `Joined as ${cat === 'Teaching' ? 'Assistant Professor' : desig}` },
      ...(desig === 'Associate Professor' || desig === 'Professor'
        ? [{ date: `${joinYear + 8}-07-01`, event: 'Promoted to Associate Professor (CAS)' }]
        : []),
      ...(desig === 'Professor' ? [{ date: `${joinYear + 14}-07-01`, event: 'Promoted to Professor (CAS)' }] : []),
    ],
    admissionDuty: i % 4 === 1 || persona === 'admission',
    probationEnds: joinYear >= 2022 ? `${joinYear + 2}-06-01` : undefined,
    retires: `${1965 + Math.floor(r() * 30) + 60}-05-31`,
  }
})

export const holidays: Holiday[] = [
  { date: '2026-11-01', name: 'Kerala Piravi' },
  { date: '2026-12-25', name: 'Christmas' },
  { date: '2026-12-31', name: 'College day (tentative)' },
  { date: '2027-01-01', name: 'New Year' },
  { date: '2027-01-26', name: 'Republic Day' },
]

// R Punch: last 30 days of punches, generated relative to today
export function punchesFor(employeeId: string): PunchDay[] {
  const idx = employees.findIndex((e) => e.id === employeeId)
  const r = seeded(5000 + idx * 91)
  const hidden = employees[idx]?.real
  const out: PunchDay[] = []
  const today = new Date()
  for (let k = 29; k >= 0; k--) {
    const d = new Date(today)
    d.setDate(today.getDate() - k)
    const date = isoDate(d)
    const dow = d.getDay()
    if (dow === 0 || dow === 6) {
      out.push({ date, in: null, out: null, lateMinutes: 0, status: 'Weekend' })
      continue
    }
    if (holidays.some((h) => h.date === date)) {
      out.push({ date, in: null, out: null, lateMinutes: 0, status: 'Holiday' })
      continue
    }
    if (hidden) {
      out.push({ date, in: null, out: null, lateMinutes: 0, status: 'Hidden' })
      continue
    }
    const x = r()
    if (x < 0.05) {
      out.push({ date, in: null, out: null, lateMinutes: 0, status: 'Leave' })
      continue
    }
    const late = x > 0.82 ? Math.floor(5 + r() * 30) : 0
    const inMin = 8 * 60 + 45 + (late ? 15 + late : -Math.floor(r() * 20))
    const outMin = 16 * 60 + 15 + Math.floor(r() * 75)
    const fmt = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
    out.push({
      date,
      in: fmt(inMin),
      out: k === 0 ? null : fmt(outMin),
      lateMinutes: late,
      status: late ? 'Late' : 'Present',
    })
  }
  return out
}

export function leaveBalancesFor(employeeId: string): LeaveBalance[] {
  const idx = employees.findIndex((e) => e.id === employeeId)
  const r0 = seeded(7000 + idx)
  const r = employees[idx]?.real ? () => 0 : r0
  return [
    { type: 'Casual Leave', total: 15, used: Math.floor(r() * 10) },
    { type: 'Earned Leave', total: 30, used: Math.floor(r() * 12) },
    { type: 'Medical Leave', total: 20, used: Math.floor(r() * 4) },
    { type: 'Duty Leave', total: 10, used: Math.floor(r() * 5) },
  ]
}

const months = ['2026-10', '2026-09', '2026-08', '2026-07', '2026-06', '2026-05']

export const payslips: Payslip[] = employees.filter((e) => !e.real).flatMap((e) =>
  months.map((m, i) => {
    const pf = Math.round(Math.min(e.basicPay, 15000) * 0.12)
    const tds = Math.round((e.basicPay + e.allowances) * (e.basicPay > 100000 ? 0.12 : e.basicPay > 50000 ? 0.05 : 0))
    const pt = 208
    return {
      id: `${e.id}-${m}`,
      employeeId: e.id,
      month: m,
      basic: e.basicPay,
      allowances: e.allowances,
      pf,
      tds,
      professionalTax: pt,
      net: e.basicPay + e.allowances - pf - tds - pt,
      published: i > 0,
    }
  }),
)

// Sample incentive values only — replace with the RCSS research incentive policy.
export const defaultPolicy: IncentivePolicy = {
  amounts: { Q1: 25000, Q2: 15000, Q3: 10000, Q4: 5000, 'Not indexed': 0 },
  coAuthorShare: 0.5,
  annualCap: 100000,
}

export function computeIncentive(policy: IncentivePolicy, q: Publication['quartile'], role: Publication['authorRole']) {
  const base = policy.amounts[q] ?? 0
  return Math.round(role === 'Co-author' ? base * policy.coAuthorShare : base)
}

const pubSeed: [string, string, string, Publication['quartile'], Publication['authorRole'], Publication['stage']][] = [
  ['RCSS1009', 'Explainable anomaly detection for campus energy data', 'Journal of Applied Data Science', 'Q2', 'First / corresponding author', 'Research approved'],
  ['RCSS1009', 'A survey of federated learning in Indian higher education', 'Education and Information Technologies', 'Q1', 'Co-author', 'Submitted'],
  ['RCSS1003', 'Graph neural networks for course recommendation', 'Expert Systems with Applications', 'Q1', 'First / corresponding author', 'Paid'],
  ['RCSS1011', 'Malayalam sentiment analysis with transformer models', 'Language Resources and Evaluation', 'Q2', 'First / corresponding author', 'HoD verified'],
  ['RCSS1014', 'Community mental health outreach in coastal Kerala', 'Indian Journal of Social Work', 'Q3', 'First / corresponding author', 'Paid'],
  ['RCSS1016', 'Workplace resilience among health workers after the floods', 'Asian Journal of Psychiatry', 'Q1', 'First / corresponding author', 'Research approved'],
  ['RCSS1016', 'Adolescent screen time and wellbeing', 'Journal of Adolescence', 'Q1', 'Co-author', 'Submitted'],
  ['RCSS1018', 'Microfinance and women entrepreneurs in Ernakulam', 'Journal of Small Business Management', 'Q2', 'First / corresponding author', 'Paid'],
  ['RCSS1022', 'Small-area estimation of household income in Kerala', 'Statistics and Applications', 'Q3', 'First / corresponding author', 'Paid'],
  ['RCSS1022', 'Bayesian methods for crop yield forecasting', 'Journal of Applied Statistics', 'Q2', 'Co-author', 'HoD verified'],
  ['RCSS1020', 'Open-access adoption in Kerala college libraries', 'Library Hi Tech', 'Q1', 'First / corresponding author', 'Submitted'],
  ['RCSS1017', 'GST compliance costs for MSMEs', 'Indian Journal of Finance', 'Q4', 'First / corresponding author', 'Paid'],
  ['RCSS1019', 'Gig workers and labour law in India', 'Indian Journal of Industrial Relations', 'Q3', 'First / corresponding author', 'Research approved'],
]

export const publications: Publication[] = pubSeed.map(([emp, title, journal, q, role, stage], i) => ({
  id: `PUB${100 + i}`,
  employeeId: emp,
  title,
  journal,
  year: 2026,
  doi: `10.1000/demo.${2026}.${100 + i}`,
  quartile: q,
  authorRole: role,
  incentive: computeIncentive(defaultPolicy, q, role),
  stage,
  submitted: `2026-${pad(3 + (i % 8))}-${pad(5 + i)}`,
}))

export const projects: FundedProject[] = [
  { id: 'PRJ1', employeeId: 'RCSS1014', title: 'Psychosocial support model for disaster-affected families', agency: 'ICSSR', amount: 1200000, start: '2025-04-01', end: '2027-03-31', status: 'Ongoing' },
  { id: 'PRJ2', employeeId: 'RCSS1003', title: 'AI-assisted early warning for student dropout', agency: 'KSCSTE', amount: 850000, start: '2024-08-01', end: '2026-07-31', status: 'Completed' },
  { id: 'PRJ3', employeeId: 'RCSS1022', title: 'Rural household consumption survey methods', agency: 'DST', amount: 1550000, start: '2025-10-01', end: '2028-09-30', status: 'Ongoing' },
  { id: 'PRJ4', employeeId: 'RCSS1018', title: 'Women-led enterprises in the coastal economy', agency: 'ICSSR', amount: 600000, start: '2026-01-15', end: '2027-01-14', status: 'Ongoing' },
]

export const initialRequests: RequestItem[] = [
  {
    id: 'REQ501', employeeId: 'RCSS1009', type: 'Leave', detail: 'Casual Leave: family function', from: '2026-11-17', to: '2026-11-18', days: 2,
    stage: 'HoD', status: 'Pending', created: '2026-11-06',
    history: [{ at: '2026-11-06 10:12', by: 'Mr. Vivek Raj', action: 'Submitted' }],
  },
  {
    id: 'REQ502', employeeId: 'RCSS1011', type: 'On-duty', detail: 'Resource person, FDP at CUSAT', from: '2026-11-20', to: '2026-11-20', days: 1,
    stage: 'HoD', status: 'Pending', created: '2026-11-07',
    history: [{ at: '2026-11-07 09:40', by: 'Dr. Fathima Rasheed', action: 'Submitted' }],
  },
  {
    id: 'REQ503', employeeId: 'RCSS1014', type: 'Leave', detail: 'Earned Leave: international conference', from: '2026-12-01', to: '2026-12-08', days: 6,
    stage: 'Dean', status: 'Pending', created: '2026-11-03',
    history: [
      { at: '2026-11-03 11:05', by: 'Dr. Benny Antony', action: 'Submitted' },
      { at: '2026-11-04 15:20', by: 'Head of Department', action: 'Approved and forwarded to Dean' },
    ],
  },
  {
    id: 'REQ504', employeeId: 'RCSS1017', type: 'Profile change', detail: 'Bank account change (new SBI account)',
    stage: 'HR', status: 'Pending', created: '2026-11-05',
    history: [{ at: '2026-11-05 14:00', by: 'Mr. Ajay Varma', action: 'Submitted' }],
  },
  {
    id: 'REQ505', employeeId: 'RCSS1021', type: 'Experience letter', detail: 'Experience certificate for PhD registration',
    stage: 'HR', status: 'Pending', created: '2026-11-08',
    history: [{ at: '2026-11-08 12:30', by: 'Ms. Gayathri Mohan', action: 'Submitted' }],
  },
  {
    id: 'REQ506', employeeId: 'RCSS1018', type: 'Leave', detail: 'Earned Leave: 15 days, personal',
    from: '2026-12-14', to: '2026-12-31', days: 15, stage: 'Principal', status: 'Pending', created: '2026-11-01',
    history: [
      { at: '2026-11-01 09:00', by: 'Dr. Rincy Thomas', action: 'Submitted' },
      { at: '2026-11-02 10:00', by: 'Head of Department', action: 'Approved and forwarded' },
      { at: '2026-11-03 16:45', by: 'Dean', action: 'Approved; over 10 days, sent to Principal' },
    ],
  },
]

export const initialCandidates: Candidate[] = [
  {
    id: 'CAN1', name: 'Ms. Priya Ramesh', designation: 'Assistant Professor', departmentId: 'cs', joining: '2026-12-01',
    steps: [
      { label: 'Offer accepted', done: true },
      { label: 'Personal details submitted', done: true },
      { label: 'Documents uploaded', done: true },
      { label: 'HR verification', done: false },
      { label: 'Rajagiri Google account created', done: false },
      { label: 'R Punch enrolment', done: false },
    ],
  },
  {
    id: 'CAN2', name: 'Mr. Alan Jose', designation: 'Clerk', departmentId: 'admin', joining: '2026-11-20',
    steps: [
      { label: 'Offer accepted', done: true },
      { label: 'Personal details submitted', done: false },
      { label: 'Documents uploaded', done: false },
      { label: 'HR verification', done: false },
      { label: 'Rajagiri Google account created', done: false },
      { label: 'R Punch enrolment', done: false },
    ],
  },
]

export const initialDuties: AdmissionDuty[] = [
  { id: 'AD1', employeeId: 'RCSS1022', date: '2026-11-21', task: 'MSW spot admission panel', venue: 'Seminar Hall 1' },
  { id: 'AD2', employeeId: 'RCSS1018', date: '2026-11-21', task: 'Document verification desk', venue: 'Admission Office' },
  { id: 'AD3', employeeId: 'RCSS1014', date: '2026-11-22', task: 'Group discussion moderator', venue: 'Room 204' },
]

// NAAC criteria with the faculty data fields that feed them
export const naacCriteria = [
  { id: 'C1', name: 'Curricular Aspects', feeds: ['FDPs and workshops'] },
  { id: 'C2', name: 'Teaching-Learning and Evaluation', feeds: ['Qualifications', 'Experience', 'PhD and NET'] },
  { id: 'C3', name: 'Research, Innovations and Extension', feeds: ['Publications', 'Funded projects', 'Awards'] },
  { id: 'C4', name: 'Infrastructure and Learning Resources', feeds: ['Library data'] },
  { id: 'C5', name: 'Student Support and Progression', feeds: ['Fedina (outside this system)'] },
  { id: 'C6', name: 'Governance, Leadership and Management', feeds: ['FDPs', 'Welfare measures', 'Staff training'] },
  { id: 'C7', name: 'Institutional Values and Best Practices', feeds: ['Extension activities'] },
]
