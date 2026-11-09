import { Link } from 'react-router-dom'
import { useStore, inr, fmtDate, monthName } from '../store'
import { roleTitle, scopeEmployees } from '../data/roles'
import { leaveBalancesFor, punchesFor, holidays, naacCriteria } from '../data/mock'
import { completeness, deptReadiness, queueFor, todaySummary } from '../lib'
import { Badge, Bar, Card, Notice, PageHead, Stat } from '../components/ui'

function Greeting() {
  const { s, me } = useStore()
  const h = new Date().getHours()
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return (
    <PageHead
      eyebrow={roleTitle(s.role!)}
      title={`${g}, ${me!.name.split(' ').slice(0, 2).join(' ')}`}
      sub={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
    />
  )
}

function ApprovalList() {
  const { s, me, emp } = useStore()
  const scoped = scopeEmployees(s.role!, me!, s.employees)
  const q = queueFor(s.role!, scoped, s.requests)
  return (
    <Card title="Waiting for you" sub={`${q.length} request${q.length === 1 ? '' : 's'}`} action={<Link to="/approvals">Open approvals →</Link>}>
      {q.length === 0 ? (
        <p className="muted small">Nothing waiting. All caught up.</p>
      ) : (
        <table className="t">
          <tbody>
            {q.slice(0, 5).map((r) => (
              <tr key={r.id}>
                <td>
                  <b>{emp(r.employeeId)?.name}</b>
                  <div className="small muted">{r.detail}</div>
                </td>
                <td>
                  <Badge>{r.type}</Badge>
                </td>
                <td className="small muted">{fmtDate(r.created)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  )
}

function Readiness({ limitTo }: { limitTo?: string[] }) {
  const { s } = useStore()
  const depts = s.departments.filter((d) => !limitTo || limitTo.includes(d.id))
  const rows = deptReadiness(depts, s.employees, s.publications)
  return (
    <Card title="Accreditation readiness" sub="Share of faculty data that is complete and verified, by department">
      <div className="stack">
        {rows.map((r) => (
          <div key={r.dept.id} className="stack" style={{ gap: 4 }}>
            <div className="row between small">
              <span>{r.dept.name}</span>
              <b>{r.score}%</b>
            </div>
            <Bar value={r.score} />
          </div>
        ))}
      </div>
    </Card>
  )
}

function PrincipalDash() {
  const { s } = useStore()
  const t = todaySummary(s.employees)
  const paid = s.publications.filter((p) => p.stage === 'Paid')
  const readiness = deptReadiness(s.departments, s.employees, s.publications)
  const overall = Math.round(readiness.reduce((a, r) => a + r.score, 0) / (readiness.length || 1))
  const payroll = s.payslips.filter((p) => p.month === '2026-09').reduce((a, p) => a + p.basic + p.allowances, 0)
  const allPending = s.requests.filter((r) => r.status === 'Pending')
  return (
    <>
      <div className="grid g4">
        <Stat label="Staff strength" value={s.employees.length} sub={`${s.employees.filter((e) => e.category === 'Teaching').length} teaching · ${s.employees.filter((e) => e.category === 'Non-teaching').length} non-teaching`} />
        <Stat label="On campus today (R Punch)" value={t.working ? `${t.present}/${t.total}` : '—'} sub={t.working ? `${t.late} late · ${t.leave} on leave` : 'Not a working day'} />
        <Stat label="Research incentives paid, 2026" value={inr(paid.reduce((a, p) => a + p.incentive, 0))} sub={`${paid.length} papers · ${s.projects.length} funded projects`} />
        <Stat label="NAAC readiness" value={`${overall}%`} sub="Average across departments" />
      </div>
      <div className="grid g2">
        <ApprovalList />
        <Card title="Where requests are waiting" sub="Every pending request across the college, by stage">
          <table className="t">
            <tbody>
              {(['HoD', 'Dean', 'HR', 'Principal'] as const).map((st) => {
                const n = allPending.filter((r) => r.stage === st).length
                return (
                  <tr key={st}>
                    <td>{st === 'HoD' ? 'Heads of Department' : st === 'Dean' ? 'Deans' : st}</td>
                    <td className="num">
                      <b>{n}</b>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </div>
      <div className="grid g2">
        <Readiness />
        <Card title="Payroll cost (totals only)" sub={`Gross pay, ${monthName('2026-09')}`}>
          <div className="stat">
            <span className="value">{inr(payroll)}</span>
            <span className="sub">Individual salaries are visible to Finance and HR. The Principal sees totals.</span>
          </div>
        </Card>
      </div>
    </>
  )
}

function DeanDash() {
  const { s, me } = useStore()
  const scoped = scopeEmployees('dean', me!, s.employees)
  const deptIds = [...new Set(scoped.map((e) => e.departmentId))]
  const t = todaySummary(scoped)
  const school = s.departments.find((d) => d.id === me!.departmentId)?.schoolId
  const pubs = s.publications.filter((p) => scoped.some((e) => e.id === p.employeeId))
  return (
    <>
      <Notice>
        You are seeing the {deptIds.length} departments in your school ({school === 'scm' ? 'Commerce and Management' : school}). Salary and personal documents are not shown to this role.
      </Notice>
      <div className="grid g4">
        <Stat label="School staff" value={scoped.length} />
        <Stat label="Present today" value={t.working ? `${t.present}/${t.total}` : '—'} sub={t.working ? `${t.late} late` : 'Not a working day'} />
        <Stat label="Papers this year" value={pubs.length} sub={`${pubs.filter((p) => p.quartile === 'Q1').length} in Q1 journals`} />
        <Stat label="Waiting for you" value={queueFor('dean', scoped, s.requests).length} />
      </div>
      <div className="grid g2">
        <ApprovalList />
        <Readiness limitTo={deptIds} />
      </div>
    </>
  )
}

function HodDash() {
  const { s, me } = useStore()
  const scoped = scopeEmployees('hod', me!, s.employees)
  const dept = s.departments.find((d) => d.id === me!.departmentId)
  const toVerify = scoped.flatMap((e) => e.certifications.filter((c) => c.status === 'Pending').map((c) => ({ e, c })))
  const pubsToVerify = s.publications.filter((p) => p.stage === 'Submitted' && scoped.some((e) => e.id === p.employeeId))
  return (
    <>
      <div className="grid g4">
        <Stat label={`${dept?.name} staff`} value={scoped.length} />
        <Stat label="Waiting for you" value={queueFor('hod', scoped, s.requests).length} sub="Leave and on-duty" />
        <Stat label="Entries to verify" value={toVerify.length + pubsToVerify.length} sub={<Link to="/verify">Certificates and papers →</Link>} />
        <Stat label="Department readiness" value={`${deptReadiness([dept!], s.employees, s.publications)[0]?.score ?? 0}%`} />
      </div>
      <div className="grid g2">
        <ApprovalList />
        <Card title="Today in the department" sub="From R Punch">
          <table className="t">
            <thead>
              <tr>
                <th>Name</th>
                <th>In</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {scoped.map((e) => {
                const d = punchesFor(e.id).at(-1)!
                return (
                  <tr key={e.id}>
                    <td>{e.name}</td>
                    <td>{d.in ?? '—'}</td>
                    <td>
                      <Badge>{d.status}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  )
}

function HrDash() {
  const { s } = useStore()
  const docs = s.employees.flatMap((e) => e.documents.filter((d) => d.status === 'Pending'))
  const probation = s.employees.filter((e) => e.probationEnds)
  return (
    <>
      <div className="grid g4">
        <Stat label="Employees" value={s.employees.length} />
        <Stat label="Joining soon" value={s.candidates.length} sub={<Link to="/onboarding">Onboarding →</Link>} />
        <Stat label="Documents to verify" value={docs.length} sub={<Link to="/verify">Verification queue →</Link>} />
        <Stat label="HR requests" value={queueFor('hr', s.employees, s.requests).length} />
      </div>
      <div className="grid g2">
        <ApprovalList />
        <Card title="Lifecycle alerts" sub="Probation, contracts and retirements">
          <table className="t">
            <tbody>
              {probation.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td className="small">Probation ends {fmtDate(e.probationEnds!)}</td>
                  <td>
                    <Badge>Pending</Badge>
                  </td>
                </tr>
              ))}
              {s.employees
                .filter((e) => e.retires < '2028-01-01')
                .map((e) => (
                  <tr key={e.id + 'r'}>
                    <td>{e.name}</td>
                    <td className="small">Retires {fmtDate(e.retires)}</td>
                    <td>
                      <Badge>Retirement</Badge>
                    </td>
                  </tr>
                ))}
              {probation.length === 0 && (
                <tr>
                  <td className="muted small">No alerts</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  )
}

function FinanceDash() {
  const { s } = useStore()
  const unpublished = [...new Set(s.payslips.filter((p) => !p.published).map((p) => p.month))]
  const toPay = s.publications.filter((p) => p.stage === 'Research approved')
  const sep = s.payslips.filter((p) => p.month === '2026-09')
  return (
    <>
      <div className="grid g4">
        <Stat label="Gross pay, September" value={inr(sep.reduce((a, p) => a + p.basic + p.allowances, 0))} />
        <Stat label="Net pay, September" value={inr(sep.reduce((a, p) => a + p.net, 0))} />
        <Stat label="Slips to publish" value={unpublished.length ? monthName(unpublished[0]) : 'None'} sub={<Link to="/payroll">Salary and Form 16 →</Link>} />
        <Stat label="Incentives to pay" value={inr(toPay.reduce((a, p) => a + p.incentive, 0))} sub={<Link to="/payouts">{toPay.length} approved claims →</Link>} />
      </div>
      <Notice>Payroll integration will follow once the college confirms how salaries are processed today. Figures here are sample data.</Notice>
    </>
  )
}

function IqacDash() {
  const { s } = useStore()
  const teaching = s.employees.filter((e) => e.category === 'Teaching')
  const incomplete = teaching.filter((e) => completeness(e, s.publications) < 100)
  return (
    <>
      <div className="grid g4">
        <Stat label="Faculty records" value={teaching.length} />
        <Stat label="Fully complete" value={teaching.length - incomplete.length} />
        <Stat label="Need follow-up" value={incomplete.length} sub={<Link to="/iqac">See gaps →</Link>} />
        <Stat label="Scopus papers, 2026" value={s.publications.filter((p) => p.quartile !== 'Not indexed').length} />
      </div>
      <div className="grid g2">
        <Readiness />
        <Card title="NAAC criteria fed by this platform">
          <table className="t">
            <tbody>
              {naacCriteria.map((c) => (
                <tr key={c.id}>
                  <td>
                    <b>{c.id}</b>
                  </td>
                  <td>
                    {c.name}
                    <div className="small muted">{c.feeds.join(', ')}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  )
}

function ResearchDash() {
  const { s } = useStore()
  const byQ = (['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => ({ q, n: s.publications.filter((p) => p.quartile === q).length }))
  const max = Math.max(...byQ.map((x) => x.n), 1)
  const waiting = s.publications.filter((p) => p.stage === 'HoD verified')
  return (
    <>
      <div className="grid g4">
        <Stat label="Publications, 2026" value={s.publications.length} />
        <Stat label="Waiting for your approval" value={waiting.length} sub={<Link to="/research">Open claims →</Link>} />
        <Stat label="Incentives committed" value={inr(s.publications.filter((p) => ['Research approved', 'Paid'].includes(p.stage)).reduce((a, p) => a + p.incentive, 0))} />
        <Stat label="Funded projects" value={inr(s.projects.reduce((a, p) => a + p.amount, 0))} sub={`${s.projects.length} projects`} />
      </div>
      <Card title="Papers by Scopus quartile" sub="Higher tier, higher incentive">
        <div className="stack">
          {byQ.map((x) => (
            <div key={x.q} className="row" style={{ gap: 12 }}>
              <b style={{ width: 28 }}>{x.q}</b>
              <div className="bar" style={{ flex: 1, height: 14 }}>
                <i style={{ width: `${(x.n / max) * 100}%` }} />
              </div>
              <span style={{ width: 24, textAlign: 'right' }}>{x.n}</span>
              <span className="small muted" style={{ width: 110 }}>
                {inr(s.policy.amounts[x.q])} each
              </span>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

function AdmissionDash() {
  const { s, emp } = useStore()
  const staff = s.employees.filter((e) => e.admissionDuty)
  const available = staff.filter((e) => !['Leave'].includes(punchesFor(e.id).at(-1)!.status))
  return (
    <>
      <div className="grid g3">
        <Stat label="Staff on admission duty list" value={staff.length} />
        <Stat label="Available today" value={available.length} />
        <Stat label="Duties scheduled" value={s.duties.length} sub={<Link to="/admission">Roster →</Link>} />
      </div>
      <Card title="Upcoming duties">
        <table className="t">
          <tbody>
            {s.duties.map((d) => (
              <tr key={d.id}>
                <td>{fmtDate(d.date)}</td>
                <td>{d.task}</td>
                <td>{emp(d.employeeId)?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Notice>Student admissions stay in Fedina. This view covers staff assigned to admission work.</Notice>
    </>
  )
}

function AdminDash() {
  const { s } = useStore()
  return (
    <>
      <div className="grid g4">
        <Stat label="Campuses live" value={`${s.campuses.filter((c) => c.active).length}/${s.campuses.length}`} />
        <Stat label="Departments" value={s.departments.length} />
        <Stat label="Leave types" value={s.leaveTypes.length} />
        <Stat label="Audit entries" value={s.audit.length} />
      </div>
      <Card title="Recent activity" action={<Link to="/admin/audit">Full audit log →</Link>}>
        <table className="t">
          <tbody>
            {s.audit.slice(0, 6).map((a, i) => (
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

function EmployeeDash() {
  const { s, me } = useStore()
  const days = punchesFor(me!.id)
  const today = days.at(-1)!
  const lates = days.filter((d) => d.status === 'Late')
  const bal = leaveBalancesFor(me!.id)
  const slip = s.payslips.filter((p) => p.employeeId === me!.id && p.published)[0]
  const myReq = s.requests.filter((r) => r.employeeId === me!.id)
  const myPubs = s.publications.filter((p) => p.employeeId === me!.id)
  const nextHoliday = holidays.find((h) => h.date >= new Date().toISOString().slice(0, 10))
  return (
    <>
      <div className="grid g4">
        <Stat label="Today (R Punch)" value={today.in ?? '—'} sub={today.status === 'Late' ? `Late by ${today.lateMinutes} min` : today.status} />
        <Stat label="Late marks, last 30 days" value={lates.length} sub={`${lates.reduce((a, d) => a + d.lateMinutes, 0)} minutes in total`} />
        <Stat label="Casual leave left" value={bal[0].total - bal[0].used} sub={<Link to="/me/attendance">All balances →</Link>} />
        <Stat label="Latest salary slip" value={slip ? inr(slip.net) : '—'} sub={slip ? <Link to="/me/payslips">{monthName(slip.month)} →</Link> : ''} />
      </div>
      <div className="grid g2">
        <Card title="My requests" action={<Link to="/me/requests">All →</Link>}>
          {myReq.length === 0 ? (
            <p className="muted small">No requests yet.</p>
          ) : (
            <table className="t">
              <tbody>
                {myReq.map((r) => (
                  <tr key={r.id}>
                    <td>{r.detail}</td>
                    <td>
                      <Badge>{r.status}</Badge>
                    </td>
                    <td className="small muted">{r.status === 'Pending' ? `With ${r.stage}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="My research claims" action={<Link to="/me/research">Add a paper →</Link>}>
          <table className="t">
            <tbody>
              {myPubs.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.title}
                    <div className="small muted">
                      {p.quartile} · {inr(p.incentive)}
                    </div>
                  </td>
                  <td>
                    <Badge>{p.stage}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      {nextHoliday && <Notice>Next holiday: {nextHoliday.name}, {fmtDate(nextHoliday.date)}.</Notice>}
    </>
  )
}

export default function Dashboard() {
  const { s } = useStore()
  const body = {
    principal: <PrincipalDash />,
    dean: <DeanDash />,
    hod: <HodDash />,
    hr: <HrDash />,
    finance: <FinanceDash />,
    iqac: <IqacDash />,
    research: <ResearchDash />,
    admission: <AdmissionDash />,
    employee: <EmployeeDash />,
    admin: <AdminDash />,
  }[s.role!]
  return (
    <>
      <Greeting />
      {body}
    </>
  )
}
