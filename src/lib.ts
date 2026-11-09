import { punchesFor } from './data/mock'
import type { Department, Employee, Publication, RequestItem, RoleId } from './data/types'

const stageForRole: Partial<Record<RoleId, RequestItem['stage']>> = {
  hod: 'HoD',
  dean: 'Dean',
  hr: 'HR',
  principal: 'Principal',
}

/** Requests waiting on this role, limited to the people this role looks after. */
export function queueFor(role: RoleId, scoped: Employee[], requests: RequestItem[]) {
  const stage = stageForRole[role]
  if (!stage) return []
  const ids = new Set(scoped.map((e) => e.id))
  return requests.filter((r) => r.status === 'Pending' && r.stage === stage && ids.has(r.employeeId))
}

/** How complete and verified an employee's accreditation-relevant data is (0–100). */
export function completeness(e: Employee, pubs: Publication[]) {
  if (e.real) return 0
  if (e.category === 'Non-teaching') {
    if (!e.documents.length) return 0
    const docs = e.documents.filter((d) => d.status === 'Approved').length / e.documents.length
    return Math.round(docs * 100)
  }
  const checks = [
    e.qualifications.length >= 2,
    e.qualifications.some((q) => q.degree === 'PhD' || q.degree === 'UGC-NET'),
    e.certifications.length > 0 && e.certifications.every((c) => c.status === 'Approved'),
    e.certifications.some((c) => c.kind === 'FDP'),
    e.documents.every((d) => d.status === 'Approved'),
    pubs.some((p) => p.employeeId === e.id && p.stage !== 'Returned'),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

export function deptReadiness(depts: Department[], emps: Employee[], pubs: Publication[]) {
  return depts
    .map((d) => {
      const staff = emps.filter((e) => e.departmentId === d.id && e.category === 'Teaching' && !e.real)
      const score = staff.length ? Math.round(staff.reduce((a, e) => a + completeness(e, pubs), 0) / staff.length) : 0
      return { dept: d, staff: staff.length, score }
    })
    .filter((x) => x.staff > 0)
    .sort((a, b) => b.score - a.score)
}

export function todaySummary(emps: Employee[]) {
  let present = 0
  let late = 0
  let leave = 0
  let lateMinutes = 0
  emps = emps.filter((e) => !e.real)
  for (const e of emps) {
    const days = punchesFor(e.id)
    const t = days[days.length - 1]
    if (t.status === 'Present') present++
    if (t.status === 'Late') {
      present++
      late++
    }
    if (t.status === 'Leave') leave++
    lateMinutes += days.reduce((a, d) => a + d.lateMinutes, 0)
  }
  const working = !['Weekend', 'Holiday'].includes(punchesFor(emps[0]?.id ?? '')?.at(-1)?.status ?? '')
  return { present, late, leave, total: emps.length, lateMinutes, working }
}

export const pubStages: Publication['stage'][] = ['Submitted', 'HoD verified', 'Research approved', 'Paid']
