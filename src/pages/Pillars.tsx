import { useState } from 'react'
import { Check, Download, Plus, Save, Trash2, X } from 'lucide-react'
import { useStore, inr, fmtDate } from '../store'
import { accessMatrix, roles, roleTitle, scopeEmployees } from '../data/roles'
import { naacCriteria, punchesFor } from '../data/mock'
import type { IncentivePolicy, Publication, RoleId, ScopusQuartile } from '../data/types'
import { completeness, deptReadiness } from '../lib'
import { Badge, Bar, Card, Modal, Notice, PageHead, Stat, downloadText, toCsv } from '../components/ui'

/* ---------------- Research ---------------- */
export function ResearchClaims() {
  const { s, me, emp, actions } = useStore()
  const scoped = scopeEmployees(s.role!, me!, s.employees)
  const pubs = s.publications.filter((p) => scoped.some((e) => e.id === p.employeeId))
  const [filter, setFilter] = useState<Publication['stage'] | 'All'>('All')
  const list = pubs.filter((p) => filter === 'All' || p.stage === filter)
  const canApprove = s.role === 'research'
  return (
    <>
      <PageHead eyebrow={roleTitle(s.role!)} title="Publications and incentive claims" sub="Each paper is checked against Scopus; the incentive follows the college policy.">
        <button
          className="btn"
          onClick={() =>
            downloadText(
              'publications.csv',
              toCsv([['ID', 'Faculty', 'Title', 'Journal', 'Quartile', 'Author role', 'Incentive', 'Stage'], ...list.map((p) => [p.id, emp(p.employeeId)?.name ?? '', p.title, p.journal, p.quartile, p.authorRole, p.incentive, p.stage])]),
            )
          }
        >
          <Download /> Export
        </button>
      </PageHead>
      <div className="grid g4">
        <Stat label="Papers" value={pubs.length} />
        <Stat label="Q1 papers" value={pubs.filter((p) => p.quartile === 'Q1').length} />
        <Stat label="Waiting for Research approval" value={pubs.filter((p) => p.stage === 'HoD verified').length} />
        <Stat label="Paid" value={inr(pubs.filter((p) => p.stage === 'Paid').reduce((a, p) => a + p.incentive, 0))} />
      </div>
      <Card>
        <div className="tabs" style={{ marginBottom: 12 }}>
          {(['All', 'Submitted', 'HoD verified', 'Research approved', 'Paid'] as const).map((f) => (
            <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className="table-wrap">
          <table className="t">
            <thead>
              <tr>
                <th>Faculty</th>
                <th>Paper</th>
                <th>Scopus</th>
                <th className="num">Incentive</th>
                <th>Stage</th>
                {canApprove && <th />}
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>{emp(p.employeeId)?.name}</b>
                    <div className="small muted">{s.departments.find((d) => d.id === emp(p.employeeId)?.departmentId)?.name}</div>
                  </td>
                  <td>
                    {p.title}
                    <div className="small muted">
                      {p.journal} · {p.authorRole}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${p.quartile === 'Q1' ? 'b-green' : 'b-grey'}`}>{p.quartile}</span>
                  </td>
                  <td className="num">{inr(p.incentive)}</td>
                  <td>
                    <Badge>{p.stage}</Badge>
                  </td>
                  {canApprove && (
                    <td>
                      {p.stage === 'HoD verified' && (
                        <div className="row" style={{ flexWrap: 'nowrap' }}>
                          <button className="btn sm primary" onClick={() => actions.advancePublication(p.id, 'Research approved')}>
                            <Check /> Approve
                          </button>
                          <button className="btn sm danger" onClick={() => actions.advancePublication(p.id, 'Returned')}>
                            <X />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

export function ResearchProjects() {
  const { s, emp } = useStore()
  return (
    <>
      <PageHead eyebrow="Research pillar" title="Funded projects" sub="Sanctioned research grants and their investigators." />
      <div className="grid g3">
        <Stat label="Projects" value={s.projects.length} />
        <Stat label="Total sanctioned" value={inr(s.projects.reduce((a, p) => a + p.amount, 0))} />
        <Stat label="Ongoing" value={s.projects.filter((p) => p.status === 'Ongoing').length} />
      </div>
      <Card>
        <table className="t">
          <thead>
            <tr>
              <th>Project</th>
              <th>Principal investigator</th>
              <th>Agency</th>
              <th>Period</th>
              <th className="num">Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {s.projects.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{emp(p.employeeId)?.name}</td>
                <td>{p.agency}</td>
                <td className="small">
                  {fmtDate(p.start)} – {fmtDate(p.end)}
                </td>
                <td className="num">{inr(p.amount)}</td>
                <td>
                  <Badge>{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

export function ResearchPolicy() {
  const { s, actions } = useStore()
  const [p, setP] = useState<IncentivePolicy>(s.policy)
  const qs: ScopusQuartile[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Not indexed']
  return (
    <>
      <PageHead eyebrow="Research pillar" title="Incentive policy" sub="The rules the system applies to every claim. Change a value here; no software change needed.">
        <button className="btn primary" onClick={() => actions.setPolicy(p)}>
          <Save /> Save policy
        </button>
      </PageHead>
      <Notice tone="amber">These are placeholder amounts. They will be replaced with the RCSS research incentive policy once it is shared.</Notice>
      <div className="grid g2">
        <Card title="Amount per paper, by Scopus quartile">
          <table className="t">
            <tbody>
              {qs.map((q) => (
                <tr key={q}>
                  <td>
                    <b>{q}</b>
                  </td>
                  <td>
                    <label className="field">
                      <input
                        type="number"
                        value={p.amounts[q]}
                        onChange={(e) => setP({ ...p, amounts: { ...p.amounts, [q]: Number(e.target.value) } })}
                      />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Rules">
          <div className="stack" style={{ gap: 16 }}>
            <label className="field">
              Co-author share (% of the full amount)
              <input type="number" value={Math.round(p.coAuthorShare * 100)} onChange={(e) => setP({ ...p, coAuthorShare: Number(e.target.value) / 100 })} />
            </label>
            <label className="field">
              Annual cap per faculty member (₹)
              <input type="number" value={p.annualCap} onChange={(e) => setP({ ...p, annualCap: Number(e.target.value) })} />
            </label>
            <div className="small muted">
              Example: a Q1 paper as co-author earns {inr(Math.round(p.amounts.Q1 * p.coAuthorShare))}.
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}

/* ---------------- IQAC ---------------- */
export function Iqac() {
  const { s } = useStore()
  const teaching = s.employees.filter((e) => e.category === 'Teaching')
  const readiness = deptReadiness(s.departments, s.employees, s.publications)
  const gaps = teaching
    .map((e) => ({ e, c: completeness(e, s.publications) }))
    .filter((x) => x.c < 100)
    .sort((a, b) => a.c - b.c)
  const verifiedFdps = teaching.reduce((a, e) => a + e.certifications.filter((c) => c.kind === 'FDP' && c.status === 'Approved').length, 0)
  const phd = teaching.filter((e) => e.qualifications.some((q) => q.degree === 'PhD')).length

  function exportAqar() {
    downloadText(
      'aqar-faculty-tables.csv',
      toCsv([
        ['Table', 'Metric', 'Value'],
        ['2.4', 'Full-time teachers', teaching.length],
        ['2.4.2', 'Teachers with PhD', phd],
        ['3.3', 'Scopus-indexed papers (2026)', s.publications.filter((p) => p.quartile !== 'Not indexed').length],
        ['3.1', 'Funded projects', s.projects.length],
        ['3.1', 'Grants sanctioned (₹)', s.projects.reduce((a, p) => a + p.amount, 0)],
        ['6.3', 'Verified FDPs attended', verifiedFdps],
      ]),
    )
  }

  return (
    <>
      <PageHead eyebrow="IQAC" title="NAAC and NIRF readiness" sub="Built from data faculty enter through the year and HoDs verify.">
        <button className="btn primary" onClick={exportAqar}>
          <Download /> Export AQAR tables
        </button>
      </PageHead>
      <div className="grid g4">
        <Stat label="Full-time teachers" value={teaching.length} />
        <Stat label="With PhD" value={`${phd}`} sub={`${Math.round((phd / teaching.length) * 100)}% of faculty`} />
        <Stat label="Scopus papers, 2026" value={s.publications.filter((p) => p.quartile !== 'Not indexed').length} />
        <Stat label="Verified FDPs" value={verifiedFdps} />
      </div>
      <div className="grid g2">
        <Card title="Department readiness">
          <div className="stack">
            {readiness.map((r) => (
              <div key={r.dept.id} className="stack" style={{ gap: 4 }}>
                <div className="row between small">
                  <span>
                    {r.dept.name} <span className="muted">({r.staff} faculty)</span>
                  </span>
                  <b>{r.score}%</b>
                </div>
                <Bar value={r.score} />
              </div>
            ))}
          </div>
        </Card>
        <Card title="Records to follow up" sub="Lowest completeness first">
          <table className="t">
            <tbody>
              {gaps.slice(0, 8).map(({ e, c }) => (
                <tr key={e.id}>
                  <td>
                    {e.name}
                    <div className="small muted">{s.departments.find((d) => d.id === e.departmentId)?.name}</div>
                  </td>
                  <td style={{ width: 120 }}>
                    <div className="small">{c}%</div>
                    <Bar value={c} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <Card title="Data mapped to NAAC criteria">
        <table className="t">
          <thead>
            <tr>
              <th>Criterion</th>
              <th>Fed by</th>
            </tr>
          </thead>
          <tbody>
            {naacCriteria.map((c) => (
              <tr key={c.id}>
                <td>
                  <b>{c.id}</b> {c.name}
                </td>
                <td className="small">{c.feeds.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

/* ---------------- Admission ---------------- */
export function Admission() {
  const { s, emp, actions } = useStore()
  const staff = s.employees.filter((e) => e.admissionDuty)
  const [add, setAdd] = useState(false)
  const [f, setF] = useState({ employeeId: staff[0]?.id ?? '', date: '', task: '', venue: '' })
  return (
    <>
      <PageHead eyebrow="Admission pillar" title="Admission duty" sub="Staff rostering for the admission season. Student data stays in Fedina.">
        <button className="btn primary" onClick={() => setAdd(true)}>
          <Plus /> Assign duty
        </button>
      </PageHead>
      <div className="grid g2">
        <Card title="Duty roster">
          <table className="t">
            <tbody>
              {s.duties.map((d) => (
                <tr key={d.id}>
                  <td>{fmtDate(d.date)}</td>
                  <td>
                    {d.task}
                    <div className="small muted">{d.venue}</div>
                  </td>
                  <td>{emp(d.employeeId)?.name}</td>
                  <td>
                    <button className="btn sm danger" onClick={() => actions.removeDuty(d.id)} aria-label="Remove">
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Admission staff availability" sub="From leave and attendance">
          <table className="t">
            <tbody>
              {staff.map((e) => {
                const t = punchesFor(e.id).at(-1)!
                return (
                  <tr key={e.id}>
                    <td>
                      {e.name}
                      <div className="small muted">{s.departments.find((d) => d.id === e.departmentId)?.name}</div>
                    </td>
                    <td>
                      <Badge>{t.status === 'Leave' ? 'On leave' : t.status === 'Weekend' || t.status === 'Holiday' ? t.status : 'Available'}</Badge>
                    </td>
                    <td className="small muted">{s.duties.filter((d) => d.employeeId === e.id).length} duties</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </div>
      {add && (
        <Modal
          title="Assign admission duty"
          onClose={() => setAdd(false)}
          footer={
            <button
              className="btn primary"
              disabled={!f.date || !f.task}
              onClick={() => {
                actions.addDuty(f)
                setAdd(false)
              }}
            >
              Assign
            </button>
          }
        >
          <div className="form-grid">
            <label className="field full">
              Staff member
              <select value={f.employeeId} onChange={(x) => setF({ ...f, employeeId: x.target.value })}>
                {staff.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Date
              <input type="date" value={f.date} onChange={(x) => setF({ ...f, date: x.target.value })} />
            </label>
            <label className="field">
              Venue
              <input value={f.venue} onChange={(x) => setF({ ...f, venue: x.target.value })} />
            </label>
            <label className="field full">
              Task
              <input value={f.task} onChange={(x) => setF({ ...f, task: x.target.value })} placeholder="e.g. Interview panel, MBA" />
            </label>
          </div>
        </Modal>
      )}
    </>
  )
}

/* ---------------- Admin ---------------- */
export function AdminMaster() {
  const { s, actions } = useStore()
  const [dept, setDept] = useState({ name: '', schoolId: 'sss', campusId: 'hill' })
  const [desig, setDesig] = useState('')
  const [leave, setLeave] = useState('')
  const [rename, setRename] = useState<{ id: string; name: string } | null>(null)
  return (
    <>
      <PageHead eyebrow="System administrator" title="Master data" sub="The college changes its own structure. No developer needed." />
      <Card title="Campuses" sub="Kakkanad can be switched on when the college is ready.">
        <table className="t">
          <tbody>
            {s.campuses.map((c) => (
              <tr key={c.id}>
                <td>
                  <b>{c.name}</b>
                </td>
                <td>
                  <Badge>{c.active ? 'Approved' : 'Pending'}</Badge> <span className="small muted">{c.active ? 'Live' : 'Not yet live'}</span>
                </td>
                <td className="num">
                  <button className="btn sm" onClick={() => actions.toggleCampus(c.id)}>
                    {c.active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Departments" sub={`${s.departments.length} departments`}>
        <div className="row" style={{ marginBottom: 14, alignItems: 'flex-end' }}>
          <label className="field" style={{ flex: 1, minWidth: 200 }}>
            New department
            <input value={dept.name} onChange={(e) => setDept({ ...dept, name: e.target.value })} placeholder="e.g. Data Science" />
          </label>
          <label className="field">
            School
            <select value={dept.schoolId} onChange={(e) => setDept({ ...dept, schoolId: e.target.value })}>
              <option value="sss">Social Sciences</option>
              <option value="scm">Commerce and Management</option>
              <option value="sci">Computing and Information</option>
            </select>
          </label>
          <label className="field">
            Campus
            <select value={dept.campusId} onChange={(e) => setDept({ ...dept, campusId: e.target.value })}>
              {s.campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.short}
                </option>
              ))}
            </select>
          </label>
          <button
            className="btn primary"
            disabled={!dept.name}
            onClick={() => {
              actions.addDepartment(dept)
              setDept({ ...dept, name: '' })
            }}
          >
            <Plus /> Add
          </button>
        </div>
        <table className="t">
          <tbody>
            {s.departments.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td className="small muted">{s.campuses.find((c) => c.id === d.campusId)?.short}</td>
                <td className="small">{s.employees.filter((e) => e.departmentId === d.id).length} staff</td>
                <td className="num">
                  <button className="btn sm" onClick={() => setRename({ id: d.id, name: d.name })}>
                    Rename
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="grid g2">
        <Card title="Designations">
          <div className="row" style={{ marginBottom: 12 }}>
            {s.designations.map((d) => (
              <span key={d} className="badge b-grey">
                {d}
              </span>
            ))}
          </div>
          <div className="row">
            <input className="btn" style={{ flex: 1, fontWeight: 400 }} value={desig} onChange={(e) => setDesig(e.target.value)} placeholder="New designation" />
            <button
              className="btn"
              disabled={!desig}
              onClick={() => {
                actions.addListItem('designations', desig)
                setDesig('')
              }}
            >
              <Plus /> Add
            </button>
          </div>
        </Card>
        <Card title="Leave types">
          <div className="row" style={{ marginBottom: 12 }}>
            {s.leaveTypes.map((d) => (
              <span key={d} className="badge b-grey">
                {d}
              </span>
            ))}
          </div>
          <div className="row">
            <input className="btn" style={{ flex: 1, fontWeight: 400 }} value={leave} onChange={(e) => setLeave(e.target.value)} placeholder="New leave type" />
            <button
              className="btn"
              disabled={!leave}
              onClick={() => {
                actions.addListItem('leaveTypes', leave)
                setLeave('')
              }}
            >
              <Plus /> Add
            </button>
          </div>
        </Card>
      </div>
      <Card title="Approval chains">
        <table className="t">
          <tbody>
            <tr><td><b>Leave, up to 2 days</b></td><td>Head of Department</td></tr>
            <tr><td><b>Leave, 3 to 10 days</b></td><td>Head of Department → Dean</td></tr>
            <tr><td><b>Leave, over 10 days</b></td><td>Head of Department → Dean → Principal</td></tr>
            <tr><td><b>On-duty</b></td><td>Head of Department</td></tr>
            <tr><td><b>Profile change, letters</b></td><td>HR</td></tr>
            <tr><td><b>Research incentive</b></td><td>Head of Department → Research Pillar Head → Finance</td></tr>
          </tbody>
        </table>
        <p className="small muted" style={{ marginTop: 10 }}>Sample chains, to be confirmed by the college.</p>
      </Card>
      {rename && (
        <Modal
          title="Rename department"
          onClose={() => setRename(null)}
          footer={
            <button
              className="btn primary"
              onClick={() => {
                actions.renameDepartment(rename.id, rename.name)
                setRename(null)
              }}
            >
              Save
            </button>
          }
        >
          <label className="field">
            Name
            <input value={rename.name} onChange={(e) => setRename({ ...rename, name: e.target.value })} />
          </label>
        </Modal>
      )}
    </>
  )
}

export function AdminRoles() {
  const { s, emp, actions } = useStore()
  return (
    <>
      <PageHead eyebrow="System administrator" title="Roles and access" sub="Who holds each role. Changing a holder changes what they see immediately." />
      <Card>
        <table className="t">
          <thead>
            <tr>
              <th>Role</th>
              <th>Sees</th>
              <th>Held by</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id}>
                <td>
                  <b>{r.title}</b>
                </td>
                <td className="small">{r.summary}</td>
                <td>
                  {r.id === 'employee' ? (
                    <span className="small muted">Every employee</span>
                  ) : (
                    <label className="field">
                      <select value={s.roleHolders[r.id]} onChange={(e) => actions.assignRole(r.id as RoleId, e.target.value)}>
                        {s.employees.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Notice>
        Current holder of System Administrator: {emp(s.roleHolders.admin)?.name}. Administrators manage settings, not people’s salary or documents.
      </Notice>
    </>
  )
}

export function AdminAudit() {
  const { s } = useStore()
  return (
    <>
      <PageHead eyebrow="System administrator" title="Audit log" sub="Every change, approval and view of sensitive data. Cannot be edited.">
        <button className="btn" onClick={() => downloadText('audit-log.csv', toCsv([['When', 'Who', 'What'], ...s.audit.map((a) => [a.at, a.by, a.action])]))}>
          <Download /> Export
        </button>
      </PageHead>
      <Card>
        <table className="t">
          <tbody>
            {s.audit.map((a, i) => (
              <tr key={i}>
                <td className="small muted" style={{ whiteSpace: 'nowrap' }}>
                  {a.at}
                </td>
                <td className="small">{a.by}</td>
                <td>{a.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

/* ---------------- Access matrix ---------------- */
export function Access() {
  const { s } = useStore()
  const cols = roles.filter((r) => r.id !== 'employee')
  const tone = (v: string) => (v === 'No' ? 'cell-no' : v === 'All' ? 'cell-yes' : 'cell-mid')
  return (
    <>
      <PageHead eyebrow="Role-based access" title="Who sees what" sub="Every role sees exactly what its work needs, and nothing more." />
      <Card>
        <div className="table-wrap">
          <table className="t matrix">
            <thead>
              <tr>
                <th>Data</th>
                {cols.map((c) => (
                  <th key={c.id} style={{ background: c.id === s.role ? '#e3f1e8' : undefined }}>
                    {c.title.replace('Director / ', '').replace(' Pillar Head', '').replace('System ', '').replace('Head of Department', 'HoD').replace(' Coordinator', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accessMatrix.map((row) => (
                <tr key={row.data}>
                  <td>
                    <b>{row.data}</b>
                  </td>
                  {cols.map((c) => {
                    const v = row.cells[c.id as Exclude<RoleId, 'employee'>]
                    return (
                      <td key={c.id} className={tone(v)} style={{ background: c.id === s.role ? '#f1f7f3' : undefined }}>
                        {v}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginTop: 12 }}>
          Every employee sees their own record in full. “Logged” = opened only with a recorded reason. “Totals” = summaries, not individual figures. Your current role is highlighted.
        </p>
      </Card>
      <div className="grid g3">
        {roles.map((r) => (
          <Card key={r.id} title={r.title} sub={r.scope}>
            <p className="small">{r.summary}</p>
          </Card>
        ))}
      </div>
    </>
  )
}
