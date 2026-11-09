import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as mock from './data/mock'
import type {
  AdmissionDuty,
  AuditEntry,
  Campus,
  Candidate,
  Certification,
  Department,
  Employee,
  FundedProject,
  IncentivePolicy,
  Payslip,
  Publication,
  RequestItem,
  RoleId,
} from './data/types'
import { roleTitle } from './data/roles'

interface State {
  role: RoleId | null
  employees: Employee[]
  departments: Department[]
  campuses: Campus[]
  designations: string[]
  leaveTypes: string[]
  requests: RequestItem[]
  publications: Publication[]
  projects: FundedProject[]
  policy: IncentivePolicy
  payslips: Payslip[]
  candidates: Candidate[]
  duties: AdmissionDuty[]
  audit: AuditEntry[]
  roleHolders: Record<RoleId, string>
}

const KEY = 'rcss-epde-demo-v1'

function initial(): State {
  return {
    role: null,
    employees: mock.employees,
    departments: mock.departments,
    campuses: mock.campuses,
    designations: mock.designations,
    leaveTypes: mock.leaveTypes,
    requests: mock.initialRequests,
    publications: mock.publications,
    projects: mock.projects,
    policy: mock.defaultPolicy,
    payslips: mock.payslips,
    candidates: mock.initialCandidates,
    duties: mock.initialDuties,
    audit: [
      { at: '2026-11-08 17:02', by: 'Ms. Reshma George (HR)', action: 'Verified documents for Ms. Priya Ramesh (onboarding)' },
      { at: '2026-11-08 11:15', by: 'Mr. Joseph Mathew (Finance)', action: 'Viewed salary register, September 2026' },
      { at: '2026-11-07 09:30', by: 'Mr. Nikhil Das (Admin)', action: 'Added leave type "Duty Leave"' },
    ],
    roleHolders: mock.personaEmployee,
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initial(), ...JSON.parse(raw) }
  } catch {
    /* storage unavailable: start fresh */
  }
  return initial()
}

function now() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

const stageForRole: Partial<Record<RoleId, RequestItem['stage']>> = {
  hod: 'HoD',
  dean: 'Dean',
  hr: 'HR',
  principal: 'Principal',
}

function nextStage(r: RequestItem): RequestItem['stage'] {
  if (r.type === 'Leave') {
    if (r.stage === 'HoD') return (r.days ?? 0) > 2 ? 'Dean' : 'Done'
    if (r.stage === 'Dean') return (r.days ?? 0) > 10 ? 'Principal' : 'Done'
    return 'Done'
  }
  return 'Done'
}

function useStoreValue() {
  const [s, setS] = useState<State>(load)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch {
      /* ignore */
    }
  }, [s])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const me = useMemo(() => {
    if (!s.role) return null
    const id = s.roleHolders[s.role]
    return s.employees.find((e) => e.id === id) ?? s.employees[0]
  }, [s.role, s.roleHolders, s.employees])

  const actor = me ? `${me.name} (${s.role ? roleTitle(s.role) : ''})` : 'System'

  const log = useCallback(
    (action: string) => setS((p) => ({ ...p, audit: [{ at: now(), by: actor, action }, ...p.audit].slice(0, 200) })),
    [actor],
  )

  const emp = useCallback((id: string) => s.employees.find((e) => e.id === id), [s.employees])

  const actions = {
    signIn: (role: RoleId) => setS((p) => ({ ...p, role })),
    signOut: () => setS((p) => ({ ...p, role: null })),
    reset: () => {
      setS({ ...initial(), role: s.role })
      setToast('Demo data reset')
    },
    notify: setToast,

    updateEmployee: (id: string, patch: Partial<Employee>, note?: string) => {
      setS((p) => ({ ...p, employees: p.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
      if (note) log(note)
    },

    addCertification: (empId: string, c: Omit<Certification, 'id' | 'status'>) => {
      setS((p) => ({
        ...p,
        employees: p.employees.map((e) =>
          e.id === empId
            ? { ...e, certifications: [...e.certifications, { ...c, id: `${empId}-c${Date.now()}`, status: 'Pending' }] }
            : e,
        ),
      }))
      log(`Uploaded ${c.kind.toLowerCase()} "${c.title}"`)
      setToast('Uploaded. Sent to your HoD for verification.')
    },

    verifyCertification: (empId: string, certId: string, status: 'Approved' | 'Returned') => {
      setS((p) => ({
        ...p,
        employees: p.employees.map((e) =>
          e.id === empId
            ? { ...e, certifications: e.certifications.map((c) => (c.id === certId ? { ...c, status } : c)) }
            : e,
        ),
      }))
      log(`${status === 'Approved' ? 'Verified' : 'Returned'} certificate for ${emp(empId)?.name}`)
      setToast(status === 'Approved' ? 'Verified. It now counts in IQAC data.' : 'Returned to the employee with a note.')
    },

    verifyDocument: (empId: string, docId: string, status: 'Approved' | 'Returned') => {
      setS((p) => ({
        ...p,
        employees: p.employees.map((e) =>
          e.id === empId ? { ...e, documents: e.documents.map((d) => (d.id === docId ? { ...d, status } : d)) } : e,
        ),
      }))
      log(`${status === 'Approved' ? 'Verified' : 'Returned'} a document for ${emp(empId)?.name}`)
      setToast(status === 'Approved' ? 'Document verified.' : 'Document returned.')
    },

    submitRequest: (r: Omit<RequestItem, 'id' | 'stage' | 'status' | 'created' | 'history'>) => {
      const first: RequestItem['stage'] = r.type === 'Leave' || r.type === 'On-duty' ? 'HoD' : 'HR'
      const item: RequestItem = {
        ...r,
        id: `REQ${600 + Math.floor(Math.random() * 399)}`,
        stage: first,
        status: 'Pending',
        created: now().slice(0, 10),
        history: [{ at: now(), by: me?.name ?? '', action: 'Submitted' }],
      }
      setS((p) => ({ ...p, requests: [item, ...p.requests] }))
      log(`Submitted ${r.type.toLowerCase()} request`)
      setToast(`Request sent to ${first === 'HoD' ? 'your Head of Department' : 'HR'}.`)
    },

    decideRequest: (id: string, approve: boolean) => {
      setS((p) => ({
        ...p,
        requests: p.requests.map((r) => {
          if (r.id !== id) return r
          if (!approve)
            return { ...r, status: 'Rejected', stage: 'Done', history: [...r.history, { at: now(), by: actor, action: 'Rejected' }] }
          const n = nextStage(r)
          return {
            ...r,
            stage: n,
            status: n === 'Done' ? 'Approved' : 'Pending',
            history: [...r.history, { at: now(), by: actor, action: n === 'Done' ? 'Approved' : `Approved and forwarded to ${n}` }],
          }
        }),
      }))
      log(`${approve ? 'Approved' : 'Rejected'} request ${id}`)
      setToast(approve ? 'Approved.' : 'Rejected.')
    },

    submitPublication: (p0: Omit<Publication, 'id' | 'incentive' | 'stage' | 'submitted'>) => {
      const incentive = mock.computeIncentive(s.policy, p0.quartile, p0.authorRole)
      setS((p) => ({
        ...p,
        publications: [
          { ...p0, id: `PUB${200 + p.publications.length}`, incentive, stage: 'Submitted', submitted: now().slice(0, 10) },
          ...p.publications,
        ],
      }))
      log(`Submitted publication "${p0.title}" (${p0.quartile})`)
      setToast(`Claim submitted. Expected incentive ₹${incentive.toLocaleString('en-IN')}.`)
    },

    advancePublication: (id: string, to: Publication['stage']) => {
      setS((p) => ({ ...p, publications: p.publications.map((x) => (x.id === id ? { ...x, stage: to } : x)) }))
      log(`Publication ${id}: ${to}`)
      setToast(
        to === 'HoD verified'
          ? 'Verified and sent to the Research pillar.'
          : to === 'Research approved'
            ? 'Approved and sent to Finance for payment.'
            : to === 'Paid'
              ? 'Payment released. IQAC data updated.'
              : 'Returned to the faculty member.',
      )
    },

    setPolicy: (policy: IncentivePolicy) => {
      setS((p) => ({ ...p, policy }))
      log('Updated research incentive policy')
      setToast('Policy saved. New claims use these values.')
    },

    publishPayslips: (month: string) => {
      setS((p) => ({ ...p, payslips: p.payslips.map((x) => (x.month === month ? { ...x, published: true } : x)) }))
      log(`Published salary slips for ${month}`)
      setToast('Salary slips published to every employee’s app.')
    },

    completeOnboardingStep: (id: string, label: string) => {
      setS((p) => ({
        ...p,
        candidates: p.candidates.map((c) =>
          c.id === id ? { ...c, steps: c.steps.map((st) => (st.label === label ? { ...st, done: true } : st)) } : c,
        ),
      }))
      log(`Onboarding: ${label}`)
    },

    addCandidate: (c: Omit<Candidate, 'id' | 'steps'>) => {
      const steps = [
        'Offer accepted',
        'Personal details submitted',
        'Documents uploaded',
        'HR verification',
        'Rajagiri Google account created',
        'R Punch enrolment',
      ].map((label, i) => ({ label, done: i === 0 }))
      setS((p) => ({ ...p, candidates: [...p.candidates, { ...c, id: `CAN${Date.now()}`, steps }] }))
      log(`Sent onboarding link to ${c.name}`)
      setToast(`Onboarding link sent to ${c.name}.`)
    },

    addDuty: (d: Omit<AdmissionDuty, 'id'>) => {
      setS((p) => ({ ...p, duties: [...p.duties, { ...d, id: `AD${Date.now()}` }] }))
      log(`Assigned admission duty to ${emp(d.employeeId)?.name}`)
      setToast('Duty assigned and the staff member notified.')
    },

    removeDuty: (id: string) => setS((p) => ({ ...p, duties: p.duties.filter((d) => d.id !== id) })),

    addDepartment: (d: Omit<Department, 'id'>) => {
      setS((p) => ({ ...p, departments: [...p.departments, { ...d, id: `d${Date.now()}` }] }))
      log(`Added department "${d.name}"`)
      setToast(`Department "${d.name}" added.`)
    },

    renameDepartment: (id: string, name: string) => {
      setS((p) => ({ ...p, departments: p.departments.map((d) => (d.id === id ? { ...d, name } : d)) }))
      log(`Renamed department to "${name}"`)
    },

    toggleCampus: (id: string) => {
      setS((p) => ({ ...p, campuses: p.campuses.map((c) => (c.id === id ? { ...c, active: !c.active } : c)) }))
      const c = s.campuses.find((x) => x.id === id)
      log(`${c?.active ? 'Disabled' : 'Enabled'} ${c?.name}`)
      setToast(`${c?.name} ${c?.active ? 'disabled' : 'enabled'}.`)
    },

    addListItem: (list: 'designations' | 'leaveTypes', value: string) => {
      setS((p) => ({ ...p, [list]: [...p[list], value] }))
      log(`Added ${list === 'designations' ? 'designation' : 'leave type'} "${value}"`)
    },

    assignRole: (role: RoleId, employeeId: string) => {
      setS((p) => ({ ...p, roleHolders: { ...p.roleHolders, [role]: employeeId } }))
      log(`Assigned role ${roleTitle(role)} to ${emp(employeeId)?.name}`)
      setToast('Role updated.')
    },

    logView: (what: string) => log(what),
  }

  return { s, me, emp, actions, toast, stageForRole }
}

type Store = ReturnType<typeof useStoreValue>
const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const v = useStoreValue()
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore outside provider')
  return v
}

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
export const monthName = (m: string) =>
  new Date(`${m}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
export const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
