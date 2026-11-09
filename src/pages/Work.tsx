import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, X, Search, Eye, Send, Download } from 'lucide-react'
import { useStore, inr, fmtDate, monthName } from '../store'
import { canSee, roleTitle, scopeEmployees } from '../data/roles'
import { leaveBalancesFor, punchesFor } from '../data/mock'
import { completeness, queueFor } from '../lib'
import { Avatar, Badge, Bar, Card, Locked, Modal, Notice, PageHead, Stat, downloadText, toCsv } from '../components/ui'
import { SlipView } from './SelfService'

/* ---------------- Approvals ---------------- */
export function Approvals() {
  const { s, me, emp, actions } = useStore()
  const scoped = scopeEmployees(s.role!, me!, s.employees)
  const q = queueFor(s.role!, scoped, s.requests)
  const done = s.requests.filter((r) => r.history.some((h) => h.by.includes(me!.name)) && !q.includes(r))
  return (
    <>
      <PageHead eyebrow={roleTitle(s.role!)} title="Approvals" sub="Requests waiting at your stage of the approval chain." />
      <Card title="Waiting for you" sub={`${q.length} pending`}>
        {q.length === 0 ? (
          <p className="muted small">Nothing waiting. Try submitting leave as an Employee, then come back as Head of Department.</p>
        ) : (
          <div className="table-wrap">
            <table className="t">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Request</th>
                  <th>Dates</th>
                  <th>Leave left</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {q.map((r) => {
                  const e = emp(r.employeeId)!
                  const bal = leaveBalancesFor(e.id)
                  return (
                    <tr key={r.id}>
                      <td>
                        <b>{e.name}</b>
                        <div className="small muted">{e.designation}</div>
                      </td>
                      <td>
                        <Badge>{r.type}</Badge>
                        <div className="small">{r.detail}</div>
                        <div className="small muted">{r.history.at(-1)?.action}</div>
                      </td>
                      <td className="small">{r.from ? `${fmtDate(r.from)} – ${fmtDate(r.to!)} (${r.days}d)` : '—'}</td>
                      <td className="small">{r.type === 'Leave' ? `CL ${bal[0].total - bal[0].used} · EL ${bal[1].total - bal[1].used}` : '—'}</td>
                      <td>
                        <div className="row" style={{ flexWrap: 'nowrap' }}>
                          <button className="btn sm primary" onClick={() => actions.decideRequest(r.id, true)}>
                            <Check /> Approve
                          </button>
                          <button className="btn sm danger" onClick={() => actions.decideRequest(r.id, false)}>
                            <X />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {done.length > 0 && (
        <Card title="Recently handled by you">
          <table className="t">
            <tbody>
              {done.map((r) => (
                <tr key={r.id}>
                  <td>{emp(r.employeeId)?.name}</td>
                  <td>{r.detail}</td>
                  <td>
                    <Badge>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  )
}

/* ---------------- People ---------------- */
export function People() {
  const { s, me } = useStore()
  const [q, setQ] = useState('')
  const [dept, setDept] = useState('')
  const scoped = scopeEmployees(s.role!, me!, s.employees)
  const list = scoped.filter(
    (e) => (!dept || e.departmentId === dept) && (e.name.toLowerCase().includes(q.toLowerCase()) || e.id.toLowerCase().includes(q.toLowerCase())),
  )
  const depts = s.departments.filter((d) => scoped.some((e) => e.departmentId === d.id))
  const showIqac = s.role === 'iqac' || s.role === 'principal'
  return (
    <>
      <PageHead
        eyebrow={roleTitle(s.role!)}
        title={s.role === 'hod' ? 'Department staff' : s.role === 'dean' ? 'School staff' : s.role === 'iqac' ? 'Faculty data' : 'People'}
        sub={`You can see ${scoped.length} of ${s.employees.length} employees, based on your role.`}
      >
        {s.role === 'iqac' && (
          <button
            className="btn"
            onClick={() =>
              downloadText(
                'faculty-data.csv',
                toCsv([
                  ['ID', 'Name', 'Department', 'Designation', 'Highest qualification', 'Verified certificates', 'Publications', 'Completeness %'],
                  ...list.map((e) => [
                    e.id,
                    e.name,
                    s.departments.find((d) => d.id === e.departmentId)?.name ?? '',
                    e.designation,
                    e.qualifications[0]?.degree ?? '',
                    e.certifications.filter((c) => c.status === 'Approved').length,
                    s.publications.filter((p) => p.employeeId === e.id).length,
                    completeness(e, s.publications),
                  ]),
                ]),
              )
            }
          >
            <Download /> Export CSV
          </button>
        )}
      </PageHead>
      <Card>
        <div className="row" style={{ marginBottom: 14 }}>
          <label className="field" style={{ flex: 1, minWidth: 200 }}>
            <span className="row" style={{ gap: 6 }}>
              <Search size={14} /> Search
            </span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or employee ID" />
          </label>
          {depts.length > 1 && (
            <label className="field">
              Department
              <select value={dept} onChange={(e) => setDept(e.target.value)}>
                <option value="">All</option>
                {depts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="table-wrap">
          <table className="t">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Today</th>
                {showIqac && <th>Data completeness</th>}
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((e) => {
                const d = punchesFor(e.id).at(-1)!
                const c = completeness(e, s.publications)
                return (
                  <tr key={e.id}>
                    <td>
                      <div className="row" style={{ flexWrap: 'nowrap' }}>
                        <Avatar name={e.name} />
                        <div>
                          <b>{e.name}</b>
                          <div className="small muted">
                            {e.designation} · {e.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="small">{s.departments.find((x) => x.id === e.departmentId)?.name}</td>
                    <td>{canSee(s.role!, 'attendance') === true ? <Badge>{d.status}</Badge> : <span className="muted small">—</span>}</td>
                    {showIqac && (
                      <td style={{ minWidth: 140 }}>
                        <div className="small">{c}%</div>
                        <Bar value={c} />
                      </td>
                    )}
                    <td>
                      <Link className="btn sm" to={`/people/${e.id}`}>
                        <Eye /> Open
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

export function PersonDetail() {
  const { id } = useParams()
  const { s, me, actions } = useStore()
  const scoped = scopeEmployees(s.role!, me!, s.employees)
  const e = scoped.find((x) => x.id === id)
  const [revealed, setRevealed] = useState(false)
  const [slip, setSlip] = useState(false)
  if (!e) return <Notice tone="amber">This record is outside what your role can see.</Notice>
  const r = s.role!
  const sal = canSee(r, 'salary')
  const idv = canSee(r, 'identity')
  const bank = canSee(r, 'bank')
  const latest = s.payslips.find((p) => p.employeeId === e.id && p.published)
  const pubs = s.publications.filter((p) => p.employeeId === e.id)
  const days = punchesFor(e.id)
  const showSensitive = idv === true || (idv === 'logged' && revealed)

  return (
    <>
      <PageHead eyebrow={`Viewing as ${roleTitle(r)}`} title={e.name} sub={`${e.designation} · ${s.departments.find((d) => d.id === e.departmentId)?.name} · ${e.id}`}>
        <Link className="btn" to="/people">
          ← Back
        </Link>
      </PageHead>
      <div className="grid g2">
        <Card title="Contact and service">
          <dl className="kv">
            <dt>Rajagiri email</dt>
            <dd>{e.email}</dd>
            <dt>Phone</dt>
            <dd>{e.phone}</dd>
            <dt>Joined</dt>
            <dd>{fmtDate(e.joined)}</dd>
            <dt>Category</dt>
            <dd>{e.category}</dd>
            <dt>Service book</dt>
            <dd>
              {e.service.map((x) => (
                <div key={x.date} className="small">
                  {fmtDate(x.date)}: {x.event}
                </div>
              ))}
            </dd>
          </dl>
        </Card>
        <Card title="Identity and bank">
          {idv === false && bank === false && <Locked />}
          {idv === 'logged' && !revealed && (
            <div className="stack">
              <Locked text="Hidden by default for this role" />
              <button
                className="btn sm"
                style={{ alignSelf: 'flex-start' }}
                onClick={() => {
                  actions.logView(`Opened ID and bank details of ${e.name} (reason: verification)`)
                  setRevealed(true)
                }}
              >
                <Eye /> Open with a recorded reason
              </button>
            </div>
          )}
          {(showSensitive || bank === true) && (
            <dl className="kv">
              {showSensitive && (
                <>
                  <dt>PAN</dt>
                  <dd>{e.pan}</dd>
                  <dt>Aadhaar</dt>
                  <dd>{e.aadhaar}</dd>
                  <dt>Address</dt>
                  <dd>{e.address}</dd>
                </>
              )}
              {(bank === true || showSensitive) && (
                <>
                  <dt>Bank</dt>
                  <dd>
                    {e.bank.bankName} · {e.bank.account}
                  </dd>
                </>
              )}
            </dl>
          )}
          {revealed && <p className="small muted" style={{ marginTop: 10 }}>This view was recorded in the audit log.</p>}
        </Card>
      </div>
      <div className="grid g2">
        <Card title="Pay">
          {sal === true && latest ? (
            <div className="stack">
              <div className="row between">
                <span>
                  Net pay, {monthName(latest.month)}
                </span>
                <b>{inr(latest.net)}</b>
              </div>
              <button className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={() => setSlip(true)}>
                View slip
              </button>
            </div>
          ) : sal === 'totals' ? (
            <Locked text="Leadership sees payroll totals, not individual pay" />
          ) : (
            <Locked />
          )}
        </Card>
        <Card title="Attendance (R Punch)">
          {canSee(r, 'attendance') ? (
            <div className="row" style={{ gap: 24 }}>
              <div className="stat">
                <span className="label">Late marks, 30 days</span>
                <span className="value">{days.filter((d) => d.status === 'Late').length}</span>
              </div>
              <div className="stat">
                <span className="label">Leave days, 30 days</span>
                <span className="value">{days.filter((d) => d.status === 'Leave').length}</span>
              </div>
            </div>
          ) : (
            <Locked />
          )}
        </Card>
      </div>
      <Card title="Academic record">
        {canSee(r, 'academic') || canSee(r, 'research') ? (
          <div className="grid g2">
            <div>
              <h3 style={{ marginBottom: 8 }}>Qualifications and certificates</h3>
              {e.qualifications.map((q) => (
                <div key={q.degree} className="small">
                  {q.degree}, {q.institution} ({q.year})
                </div>
              ))}
              {e.certifications.map((c) => (
                <div key={c.id} className="small row" style={{ marginTop: 6 }}>
                  {c.title} <Badge>{c.status}</Badge>
                </div>
              ))}
            </div>
            <div>
              <h3 style={{ marginBottom: 8 }}>Publications</h3>
              {pubs.length === 0 && <p className="small muted">None recorded.</p>}
              {pubs.map((p) => (
                <div key={p.id} className="small" style={{ marginBottom: 6 }}>
                  {p.title} <span className="muted">({p.journal}, {p.quartile})</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Locked />
        )}
      </Card>
      {slip && latest && (
        <Modal title="Salary slip" onClose={() => setSlip(false)}>
          <SlipView slip={latest} name={e.name} desig={e.designation} />
        </Modal>
      )}
    </>
  )
}

/* ---------------- Verification (HoD: academic, HR: documents) ---------------- */
export function Verify() {
  const { s, me, emp, actions } = useStore()
  const scoped = scopeEmployees(s.role!, me!, s.employees)
  if (s.role === 'hr') {
    const docs = s.employees.flatMap((e) => e.documents.filter((d) => d.status === 'Pending').map((d) => ({ e, d })))
    return (
      <>
        <PageHead eyebrow="HR" title="Document verification" sub="Every document passes through a named verifier." />
        <Card title={`${docs.length} documents waiting`}>
          {docs.length === 0 && <p className="muted small">All documents verified.</p>}
          <table className="t">
            <tbody>
              {docs.map(({ e, d }) => (
                <tr key={d.id}>
                  <td>
                    <b>{e.name}</b>
                    <div className="small muted">{e.id}</div>
                  </td>
                  <td>
                    {d.name}
                    <div className="small muted">{d.category}</div>
                  </td>
                  <td>
                    <div className="row" style={{ flexWrap: 'nowrap' }}>
                      <button className="btn sm primary" onClick={() => actions.verifyDocument(e.id, d.id, 'Approved')}>
                        <Check /> Verify
                      </button>
                      <button className="btn sm danger" onClick={() => actions.verifyDocument(e.id, d.id, 'Returned')}>
                        Return
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </>
    )
  }
  const certs = scoped.flatMap((e) => e.certifications.filter((c) => c.status === 'Pending').map((c) => ({ e, c })))
  const pubs = s.publications.filter((p) => p.stage === 'Submitted' && scoped.some((e) => e.id === p.employeeId))
  return (
    <>
      <PageHead eyebrow="Head of Department" title="Verify academic entries" sub="Your verification is what makes IQAC data trustworthy." />
      <Card title="Certificates and FDPs" sub={`${certs.length} waiting`}>
        {certs.length === 0 && <p className="muted small">Nothing to verify.</p>}
        <table className="t">
          <tbody>
            {certs.map(({ e, c }) => (
              <tr key={c.id}>
                <td>
                  <b>{e.name}</b>
                </td>
                <td>
                  {c.title}
                  <div className="small muted">
                    {c.kind} · {c.issuer} · {fmtDate(c.date)}
                  </div>
                </td>
                <td>
                  <div className="row" style={{ flexWrap: 'nowrap' }}>
                    <button className="btn sm primary" onClick={() => actions.verifyCertification(e.id, c.id, 'Approved')}>
                      <Check /> Verify
                    </button>
                    <button className="btn sm danger" onClick={() => actions.verifyCertification(e.id, c.id, 'Returned')}>
                      Return
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Research incentive claims" sub="Confirm authorship, then the claim goes to the Research pillar.">
        {pubs.length === 0 && <p className="muted small">No new claims.</p>}
        <table className="t">
          <tbody>
            {pubs.map((p) => (
              <tr key={p.id}>
                <td>
                  <b>{emp(p.employeeId)?.name}</b>
                </td>
                <td>
                  {p.title}
                  <div className="small muted">
                    {p.journal} · {p.quartile} · {p.authorRole}
                  </div>
                </td>
                <td className="num">{inr(p.incentive)}</td>
                <td>
                  <div className="row" style={{ flexWrap: 'nowrap' }}>
                    <button className="btn sm primary" onClick={() => actions.advancePublication(p.id, 'HoD verified')}>
                      <Check /> Verify
                    </button>
                    <button className="btn sm danger" onClick={() => actions.advancePublication(p.id, 'Returned')}>
                      Return
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

/* ---------------- Onboarding ---------------- */
export function Onboarding() {
  const { s, actions } = useStore()
  const [add, setAdd] = useState(false)
  const [f, setF] = useState({ name: '', designation: 'Assistant Professor', departmentId: 'cs', joining: '' })
  return (
    <>
      <PageHead eyebrow="HR" title="Onboarding" sub="New staff complete their joining formalities online, before day one.">
        <button className="btn primary" onClick={() => setAdd(true)}>
          <Send /> Send onboarding link
        </button>
      </PageHead>
      {s.candidates.map((c) => {
        const done = c.steps.filter((x) => x.done).length
        return (
          <Card
            key={c.id}
            title={c.name}
            sub={`${c.designation} · ${s.departments.find((d) => d.id === c.departmentId)?.name} · joining ${c.joining ? fmtDate(c.joining) : 'TBC'}`}
            action={<Badge>{done === c.steps.length ? 'Done' : `${done}/${c.steps.length} steps`}</Badge>}
          >
            <div className="stack">
              {c.steps.map((st) => (
                <div key={st.label} className="row between">
                  <span className="row">
                    <span className={`badge ${st.done ? 'b-green' : 'b-grey'}`}>{st.done ? '✓' : '·'}</span> {st.label}
                  </span>
                  {!st.done && (
                    <button className="btn sm" onClick={() => actions.completeOnboardingStep(c.id, st.label)}>
                      Mark done
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )
      })}
      {add && (
        <Modal
          title="Send onboarding link"
          onClose={() => setAdd(false)}
          footer={
            <button
              className="btn primary"
              disabled={!f.name}
              onClick={() => {
                actions.addCandidate(f)
                setAdd(false)
              }}
            >
              <Send /> Send
            </button>
          }
        >
          <div className="form-grid">
            <label className="field full">
              Name
              <input value={f.name} onChange={(x) => setF({ ...f, name: x.target.value })} />
            </label>
            <label className="field">
              Designation
              <select value={f.designation} onChange={(x) => setF({ ...f, designation: x.target.value })}>
                {s.designations.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Department
              <select value={f.departmentId} onChange={(x) => setF({ ...f, departmentId: x.target.value })}>
                {s.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Joining date
              <input type="date" value={f.joining} onChange={(x) => setF({ ...f, joining: x.target.value })} />
            </label>
          </div>
          <Notice>The candidate receives a link to fill in details and upload documents. HR then verifies them here.</Notice>
        </Modal>
      )}
    </>
  )
}

/* ---------------- Finance ---------------- */
export function Payroll() {
  const { s, emp, actions } = useStore()
  const months = [...new Set(s.payslips.map((p) => p.month))].sort().reverse()
  const [m, setM] = useState(months[0])
  const rows = s.payslips.filter((p) => p.month === m)
  const published = rows.every((p) => p.published)
  return (
    <>
      <PageHead eyebrow="Finance" title="Salary and Form 16" sub="Publish slips once; every employee downloads their own.">
        <select className="btn" value={m} onChange={(e) => setM(e.target.value)}>
          {months.map((x) => (
            <option key={x} value={x}>
              {monthName(x)}
            </option>
          ))}
        </select>
        <button
          className="btn"
          onClick={() =>
            downloadText(
              `salary-register-${m}.csv`,
              toCsv([['ID', 'Name', 'Basic', 'Allowances', 'PF', 'TDS', 'PT', 'Net'], ...rows.map((p) => [p.employeeId, emp(p.employeeId)?.name ?? '', p.basic, p.allowances, p.pf, p.tds, p.professionalTax, p.net])]),
            )
          }
        >
          <Download /> Register CSV
        </button>
        <button className="btn primary" disabled={published} onClick={() => actions.publishPayslips(m)}>
          <Send /> {published ? 'Published' : 'Publish slips'}
        </button>
      </PageHead>
      <div className="grid g4">
        <Stat label="Employees" value={rows.length} />
        <Stat label="Gross" value={inr(rows.reduce((a, p) => a + p.basic + p.allowances, 0))} />
        <Stat label="Deductions" value={inr(rows.reduce((a, p) => a + p.pf + p.tds + p.professionalTax, 0))} />
        <Stat label="Net payable" value={inr(rows.reduce((a, p) => a + p.net, 0))} />
      </div>
      <Card title={`Salary register, ${monthName(m)}`} action={<Badge>{published ? 'Published' : 'Pending'}</Badge>}>
        <div className="table-wrap">
          <table className="t">
            <thead>
              <tr>
                <th>Employee</th>
                <th className="num">Gross</th>
                <th className="num">PF</th>
                <th className="num">TDS</th>
                <th className="num">Net</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    {emp(p.employeeId)?.name}
                    <div className="small muted">{p.employeeId}</div>
                  </td>
                  <td className="num">{(p.basic + p.allowances).toLocaleString('en-IN')}</td>
                  <td className="num">{p.pf.toLocaleString('en-IN')}</td>
                  <td className="num">{p.tds.toLocaleString('en-IN')}</td>
                  <td className="num">
                    <b>{p.net.toLocaleString('en-IN')}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Form 16, FY 2025–26" sub="Generated from the year’s salary and TDS records.">
        <button className="btn" onClick={() => actions.notify('Form 16 issued to all employees (demo).')}>
          <Send /> Issue Form 16 to all employees
        </button>
      </Card>
    </>
  )
}

export function Payouts() {
  const { s, emp, actions } = useStore()
  const toPay = s.publications.filter((p) => p.stage === 'Research approved')
  const paid = s.publications.filter((p) => p.stage === 'Paid')
  return (
    <>
      <PageHead eyebrow="Finance" title="Incentive payouts" sub="Research incentives approved by the Research pillar, ready to pay." />
      <Card title="Ready to pay" sub={`${toPay.length} claims · ${inr(toPay.reduce((a, p) => a + p.incentive, 0))}`}>
        {toPay.length === 0 && <p className="muted small">Nothing waiting.</p>}
        <table className="t">
          <tbody>
            {toPay.map((p) => (
              <tr key={p.id}>
                <td>
                  <b>{emp(p.employeeId)?.name}</b>
                  <div className="small muted">{emp(p.employeeId)?.bank.bankName} · {emp(p.employeeId)?.bank.account}</div>
                </td>
                <td className="small">
                  {p.title} ({p.quartile})
                </td>
                <td className="num">
                  <b>{inr(p.incentive)}</b>
                </td>
                <td>
                  <button className="btn sm primary" onClick={() => actions.advancePublication(p.id, 'Paid')}>
                    Release payment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Paid this year" sub={inr(paid.reduce((a, p) => a + p.incentive, 0))}>
        <table className="t">
          <tbody>
            {paid.map((p) => (
              <tr key={p.id}>
                <td>{emp(p.employeeId)?.name}</td>
                <td className="small">{p.title}</td>
                <td className="num">{inr(p.incentive)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}
