import { useState } from 'react'
import { Download, Plus, Upload, Send, Pencil } from 'lucide-react'
import { useStore, inr, fmtDate, monthName } from '../store'
import { leaveBalancesFor, punchesFor, holidays, computeIncentive } from '../data/mock'
import type { AuthorRole, Certification, Payslip, RequestItem, ScopusQuartile } from '../data/types'
import { Badge, Bar, Card, Modal, Notice, PageHead, Stat, Steps, downloadText } from '../components/ui'
import { completeness, pubStages } from '../lib'
import { leadershipSource } from '../data/mock'

/** Shown wherever a real, named person's personal data would otherwise appear. */
export function RealNotice() {
  return (
    <Notice>
      This name and title are taken from the college website (
      <a href={leadershipSource} target="_blank" rel="noreferrer">
        rajagiri.edu
      </a>
      ). The demo does not simulate salary, attendance, leave, ID or research records for named people. In the live
      system this page shows their own verified record.
    </Notice>
  )
}

/* ---------------- Profile ---------------- */
export function MyProfile() {
  const { s, me, actions } = useStore()
  const e = me!
  const [tab, setTab] = useState<'personal' | 'academic' | 'documents' | 'service'>('personal')
  const [edit, setEdit] = useState(false)
  const [phone, setPhone] = useState(e.phone)
  const [address, setAddress] = useState(e.address)
  const [add, setAdd] = useState(false)
  const [cert, setCert] = useState({ title: '', issuer: '', date: '', kind: 'Certification' as Certification['kind'] })
  const dept = s.departments.find((d) => d.id === e.departmentId)
  const score = completeness(e, s.publications)

  if (e.real)
    return (
      <>
        <PageHead eyebrow="Self-service" title="My profile" sub={e.designation} />
        <RealNotice />
      </>
    )

  return (
    <>
      {me!.real && <RealNotice />}
      <PageHead eyebrow="Self-service" title="My profile" sub={`${e.designation} · ${dept?.name} · ${e.id}`}>
        <button className="btn primary" onClick={() => setAdd(true)}>
          <Plus /> Add certificate or FDP
        </button>
      </PageHead>
      <div className="grid g3">
        <Stat label="Profile completeness" value={`${score}%`} sub={<Bar value={score} />} />
        <Stat label="Certificates and FDPs" value={e.certifications.length} sub={`${e.certifications.filter((c) => c.status === 'Pending').length} waiting for verification`} />
        <Stat label="With RCSS since" value={new Date(e.joined).getFullYear()} sub={fmtDate(e.joined)} />
      </div>
      <div className="tabs">
        {(['personal', 'academic', 'documents', 'service'] as const).map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {{ personal: 'Personal', academic: 'Qualifications and certificates', documents: 'Document vault', service: 'Service book' }[t]}
          </button>
        ))}
      </div>

      {tab === 'personal' && (
        <Card
          title="Personal details"
          sub="Changes go to HR for verification before they update your record."
          action={
            <button className="btn sm" onClick={() => setEdit(true)}>
              <Pencil /> Request a change
            </button>
          }
        >
          <dl className="kv">
            <dt>Name</dt>
            <dd>{e.name}</dd>
            <dt>Rajagiri email</dt>
            <dd>{e.email}</dd>
            <dt>Phone</dt>
            <dd>{e.phone}</dd>
            <dt>Date of birth</dt>
            <dd>{fmtDate(e.dob)}</dd>
            <dt>Address</dt>
            <dd>{e.address}</dd>
            <dt>Bank</dt>
            <dd>
              {e.bank.bankName} · {e.bank.account} · {e.bank.ifsc}
            </dd>
            <dt>PAN</dt>
            <dd>{e.pan}</dd>
            <dt>Aadhaar</dt>
            <dd>{e.aadhaar}</dd>
            <dt>Campus</dt>
            <dd>{s.campuses.find((c) => c.id === e.campusId)?.name}</dd>
          </dl>
        </Card>
      )}

      {tab === 'academic' && (
        <div className="grid g2">
          <Card title="Qualifications">
            <table className="t">
              <tbody>
                {e.qualifications.map((q) => (
                  <tr key={q.degree}>
                    <td>
                      <b>{q.degree}</b>
                      <div className="small muted">{q.institution}</div>
                    </td>
                    <td className="num">{q.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card title="Certificates, FDPs and awards" sub="Each verified entry counts in your appraisal and in IQAC data.">
            <table className="t">
              <tbody>
                {e.certifications.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <b>{c.title}</b>
                      <div className="small muted">
                        {c.kind} · {c.issuer} · {fmtDate(c.date)}
                      </div>
                    </td>
                    <td>
                      <Badge>{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === 'documents' && (
        <Card title="Document vault" sub="Only you and HR can open these files.">
          <table className="t">
            <thead>
              <tr>
                <th>Document</th>
                <th>Category</th>
                <th>Uploaded</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {e.documents.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.category}</td>
                  <td>{fmtDate(d.uploaded)}</td>
                  <td>
                    <Badge>{d.status}</Badge>
                  </td>
                  <td>
                    <button className="btn sm" onClick={() => actions.notify('In the full system this opens the stored file.')}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'service' && (
        <Card title="Digital service book" sub="Verified career history, maintained by HR.">
          <table className="t">
            <tbody>
              {e.service.map((x) => (
                <tr key={x.date}>
                  <td style={{ width: 160 }}>{fmtDate(x.date)}</td>
                  <td>{x.event}</td>
                </tr>
              ))}
              {e.probationEnds && (
                <tr>
                  <td>{fmtDate(e.probationEnds)}</td>
                  <td>Probation due to end</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {edit && (
        <Modal
          title="Request a change"
          onClose={() => setEdit(false)}
          footer={
            <button
              className="btn primary"
              onClick={() => {
                actions.submitRequest({ employeeId: e.id, type: 'Profile change', detail: `Phone/address update: ${phone}; ${address}` })
                setEdit(false)
              }}
            >
              <Send /> Send to HR
            </button>
          }
        >
          <div className="form-grid">
            <label className="field">
              Phone
              <input value={phone} onChange={(x) => setPhone(x.target.value)} />
            </label>
            <label className="field full">
              Address
              <textarea rows={2} value={address} onChange={(x) => setAddress(x.target.value)} />
            </label>
          </div>
          <Notice>Bank and ID changes need a supporting document; HR will ask for it.</Notice>
        </Modal>
      )}

      {add && (
        <Modal
          title="Add a certificate, FDP or award"
          onClose={() => setAdd(false)}
          footer={
            <button
              className="btn primary"
              disabled={!cert.title || !cert.issuer || !cert.date}
              onClick={() => {
                actions.addCertification(e.id, { ...cert, proof: 'upload.pdf' })
                setCert({ title: '', issuer: '', date: '', kind: 'Certification' })
                setAdd(false)
              }}
            >
              <Upload /> Upload and submit
            </button>
          }
        >
          <div className="form-grid">
            <label className="field full">
              Title
              <input value={cert.title} onChange={(x) => setCert({ ...cert, title: x.target.value })} placeholder="e.g. FDP on Data Analytics" />
            </label>
            <label className="field">
              Type
              <select value={cert.kind} onChange={(x) => setCert({ ...cert, kind: x.target.value as Certification['kind'] })}>
                {['Certification', 'FDP', 'Workshop', 'Award', 'Membership'].map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Date
              <input type="date" value={cert.date} onChange={(x) => setCert({ ...cert, date: x.target.value })} />
            </label>
            <label className="field full">
              Issued by
              <input value={cert.issuer} onChange={(x) => setCert({ ...cert, issuer: x.target.value })} />
            </label>
            <label className="field full">
              Proof (PDF or image)
              <input type="file" />
            </label>
          </div>
          <Notice>Once your HoD verifies it, this entry is used in your profile, appraisal and IQAC reports. You never upload it again.</Notice>
        </Modal>
      )}
    </>
  )
}

/* ---------------- Attendance and leave ---------------- */
export function MyAttendance() {
  const { s, me, actions } = useStore()
  const days = punchesFor(me!.id)
  const bal = leaveBalancesFor(me!.id)
  const [apply, setApply] = useState(false)
  const [form, setForm] = useState({ type: 'Casual Leave', from: '', to: '', reason: '' })
  const first = new Date(`${days[0].date}T00:00:00`).getDay()
  const days_ = form.from && form.to ? Math.max(1, (Date.parse(form.to) - Date.parse(form.from)) / 864e5 + 1) : 0

  if (me!.real)
    return (
      <>
        <PageHead eyebrow="Self-service · from R Punch" title="Attendance and leave" />
        <RealNotice />
      </>
    )

  return (
    <>
      {me!.real && <RealNotice />}
      <PageHead eyebrow="Self-service · from R Punch" title="Attendance and leave" sub="Punch data is read from R Punch through its API. Nothing to enter twice.">
        <button className="btn primary" onClick={() => setApply(true)}>
          <Plus /> Apply for leave
        </button>
      </PageHead>
      <div className="grid g4">
        {bal.map((b) => (
          <Stat key={b.type} label={b.type} value={b.total - b.used} sub={`${b.used} of ${b.total} used`} />
        ))}
      </div>
      <div className="grid g2">
        <Card title="Last 30 days">
          <div className="cal">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div className="dh" key={d}>
                {d}
              </div>
            ))}
            {Array.from({ length: first }).map((_, i) => (
              <div key={'x' + i} />
            ))}
            {days.map((d) => (
              <div key={d.date} className={`d ${d.status}`} title={`${d.date}: ${d.status}${d.in ? ` · in ${d.in}` : ''}`}>
                <b>{Number(d.date.slice(8))}</b>
                {d.in && <span style={{ fontSize: 10 }}>{d.in}</span>}
              </div>
            ))}
          </div>
          <div className="legend" style={{ marginTop: 12 }}>
            <span><i style={{ background: '#e3f1e8' }} />On time</span>
            <span><i style={{ background: '#fff4e0' }} />Late</span>
            <span><i style={{ background: '#e8f0fb' }} />Leave</span>
            <span><i style={{ background: '#f3e8fb' }} />Holiday</span>
          </div>
        </Card>
        <Card title="Punch log">
          <div className="table-wrap" style={{ maxHeight: 420, overflowY: 'auto' }}>
            <table className="t">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...days].reverse().filter((d) => d.status !== 'Weekend').map((d) => (
                  <tr key={d.date}>
                    <td>{fmtDate(d.date)}</td>
                    <td>{d.in ?? '—'}</td>
                    <td>{d.out ?? (d.in ? 'On campus' : '—')}</td>
                    <td>
                      <Badge>{d.status}</Badge> {d.lateMinutes > 0 && <span className="small muted">{d.lateMinutes} min</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <Card title="College calendar">
        <table className="t">
          <tbody>
            {holidays.map((h) => (
              <tr key={h.date}>
                <td style={{ width: 180 }}>{fmtDate(h.date)}</td>
                <td>{h.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {apply && (
        <Modal
          title="Apply for leave"
          onClose={() => setApply(false)}
          footer={
            <button
              className="btn primary"
              disabled={!form.from || !form.to}
              onClick={() => {
                actions.submitRequest({ employeeId: me!.id, type: 'Leave', detail: `${form.type}: ${form.reason || 'personal'}`, from: form.from, to: form.to, days: days_ })
                setApply(false)
              }}
            >
              <Send /> Submit
            </button>
          }
        >
          <div className="form-grid">
            <label className="field full">
              Leave type
              <select value={form.type} onChange={(x) => setForm({ ...form, type: x.target.value })}>
                {s.leaveTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="field">
              From
              <input type="date" value={form.from} onChange={(x) => setForm({ ...form, from: x.target.value })} />
            </label>
            <label className="field">
              To
              <input type="date" value={form.to} onChange={(x) => setForm({ ...form, to: x.target.value })} />
            </label>
            <label className="field full">
              Reason
              <input value={form.reason} onChange={(x) => setForm({ ...form, reason: x.target.value })} />
            </label>
          </div>
          <Notice>
            {days_ ? `${days_} day${days_ > 1 ? 's' : ''}. ` : ''}Route: Head of Department{days_ > 2 ? ' → Dean' : ''}
            {days_ > 10 ? ' → Principal' : ''}. Approval chains are set by the college in Admin.
          </Notice>
        </Modal>
      )}
    </>
  )
}

/* ---------------- Payslips ---------------- */
export function SlipView({ slip, name, desig }: { slip: Payslip; name: string; desig: string }) {
  return (
    <div className="payslip">
      <div className="payslip-head">
        <img src="./rcss-logo.png" alt="RCSS" />
        <div style={{ textAlign: 'right' }}>
          <b>Salary slip</b>
          <div className="small muted">{monthName(slip.month)}</div>
        </div>
      </div>
      <div className="row between small">
        <span>
          <b>{name}</b> · {desig}
        </span>
        <span>{slip.employeeId}</span>
      </div>
      <div className="grid g2">
        <table className="t">
          <thead>
            <tr>
              <th>Earnings</th>
              <th className="num">₹</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Basic pay</td><td className="num">{slip.basic.toLocaleString('en-IN')}</td></tr>
            <tr><td>DA and allowances</td><td className="num">{slip.allowances.toLocaleString('en-IN')}</td></tr>
            <tr><td><b>Gross</b></td><td className="num"><b>{(slip.basic + slip.allowances).toLocaleString('en-IN')}</b></td></tr>
          </tbody>
        </table>
        <table className="t">
          <thead>
            <tr>
              <th>Deductions</th>
              <th className="num">₹</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Provident Fund</td><td className="num">{slip.pf.toLocaleString('en-IN')}</td></tr>
            <tr><td>Income tax (TDS)</td><td className="num">{slip.tds.toLocaleString('en-IN')}</td></tr>
            <tr><td>Professional tax</td><td className="num">{slip.professionalTax.toLocaleString('en-IN')}</td></tr>
          </tbody>
        </table>
      </div>
      <div className="row between" style={{ background: '#e3f1e8', padding: '12px 14px', borderRadius: 8 }}>
        <b>Net pay</b>
        <b style={{ fontSize: 20 }}>{inr(slip.net)}</b>
      </div>
      <p className="small muted">Sample figures for demonstration only.</p>
    </div>
  )
}

export function MyPayslips() {
  const { s, me, actions } = useStore()
  const slips = s.payslips.filter((p) => p.employeeId === me!.id && p.published)
  const [open, setOpen] = useState<Payslip | null>(slips[0] ?? null)
  const year = slips.reduce((a, p) => a + p.basic + p.allowances, 0)
  return (
    <>
      {me!.real && <RealNotice />}
      <PageHead eyebrow="Self-service" title="Payslips and Form 16" sub="Published by Finance. Download any month, any time." />
      <div className="grid g3">
        <Stat label="Gross pay, last 6 months" value={inr(year)} />
        <Stat label="PF contributed" value={inr(slips.reduce((a, p) => a + p.pf, 0))} sub="Employee share" />
        <Stat label="Tax deducted (TDS)" value={inr(slips.reduce((a, p) => a + p.tds, 0))} />
      </div>
      <div className="grid g2" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)' }}>
        <Card title="Salary slips">
          <table className="t">
            <tbody>
              {slips.map((p) => (
                <tr key={p.id} style={{ background: open?.id === p.id ? '#f1f7f3' : undefined }}>
                  <td>
                    <button className="btn sm" style={{ border: 'none', background: 'none', padding: 0 }} onClick={() => setOpen(p)}>
                      {monthName(p.month)}
                    </button>
                  </td>
                  <td className="num">{inr(p.net)}</td>
                  <td className="num">
                    <button
                      className="btn sm"
                      onClick={() =>
                        downloadText(
                          `payslip-${p.month}.txt`,
                          `RCSS salary slip (sample)\n${me!.name} ${p.employeeId}\n${monthName(p.month)}\nGross ${p.basic + p.allowances}\nPF ${p.pf}\nTDS ${p.tds}\nPT ${p.professionalTax}\nNet ${p.net}\n`,
                          'text/plain',
                        )
                      }
                    >
                      <Download />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="card-head" style={{ marginTop: 18 }}>
            <div>
              <h2>Form 16</h2>
              <p>Issued by Finance after the financial year closes.</p>
            </div>
          </div>
          <table className="t">
            <tbody>
              <tr>
                <td>FY 2025–26 (AY 2026–27)</td>
                <td><Badge>Approved</Badge></td>
                <td className="num">
                  <button className="btn sm" onClick={() => actions.notify('In the full system this downloads the signed Form 16 PDF.')}>
                    <Download /> PDF
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
        {open && <SlipView slip={open} name={me!.name} desig={me!.designation} />}
      </div>
    </>
  )
}

/* ---------------- Research ---------------- */
export function MyResearch() {
  const { s, me, actions } = useStore()
  const mine = s.publications.filter((p) => p.employeeId === me!.id)
  const myProjects = s.projects.filter((p) => p.employeeId === me!.id)
  const [add, setAdd] = useState(false)
  const [f, setF] = useState({ title: '', journal: '', doi: '', quartile: 'Q2' as ScopusQuartile, authorRole: 'First / corresponding author' as AuthorRole })
  const expected = computeIncentive(s.policy, f.quartile, f.authorRole)

  return (
    <>
      {me!.real && <RealNotice />}
      <PageHead eyebrow="Self-service · Research" title="My research" sub="Add a paper once. It counts for your incentive, appraisal and IQAC data.">
        <button className="btn primary" onClick={() => setAdd(true)}>
          <Plus /> Add a publication
        </button>
      </PageHead>
      <div className="grid g3">
        <Stat label="Papers recorded" value={mine.length} />
        <Stat label="Incentive received" value={inr(mine.filter((p) => p.stage === 'Paid').reduce((a, p) => a + p.incentive, 0))} />
        <Stat label="In progress" value={inr(mine.filter((p) => p.stage !== 'Paid' && p.stage !== 'Returned').reduce((a, p) => a + p.incentive, 0))} />
      </div>
      <Card title="Publications and incentive claims">
        {mine.length === 0 && <p className="muted small">No papers yet.</p>}
        <div className="stack" style={{ gap: 18 }}>
          {mine.map((p) => (
            <div key={p.id} className="stack" style={{ gap: 12, borderBottom: '1px solid #edf1ed', paddingBottom: 16 }}>
              <div className="row between">
                <div>
                  <b>{p.title}</b>
                  <div className="small muted">
                    {p.journal} · {p.year} · Scopus {p.quartile} · {p.authorRole} · DOI {p.doi}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <b>{inr(p.incentive)}</b>
                  <div className="small muted">incentive</div>
                </div>
              </div>
              <Steps steps={['Submitted', 'HoD verified', 'Research approved', 'Paid']} current={pubStages.indexOf(p.stage) + 1} />
            </div>
          ))}
        </div>
      </Card>
      {myProjects.length > 0 && (
        <Card title="Funded projects">
          <table className="t">
            <tbody>
              {myProjects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.title}</b>
                    <div className="small muted">{p.agency}</div>
                  </td>
                  <td className="num">{inr(p.amount)}</td>
                  <td><Badge>{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {add && (
        <Modal
          title="Add a publication"
          onClose={() => setAdd(false)}
          footer={
            <button
              className="btn primary"
              disabled={!f.title || !f.journal}
              onClick={() => {
                actions.submitPublication({ ...f, employeeId: me!.id, year: 2026, doi: f.doi || '10.1000/new' })
                setAdd(false)
              }}
            >
              <Send /> Submit claim
            </button>
          }
        >
          <div className="form-grid">
            <label className="field full">
              Paper title
              <input value={f.title} onChange={(x) => setF({ ...f, title: x.target.value })} />
            </label>
            <label className="field">
              Journal
              <input value={f.journal} onChange={(x) => setF({ ...f, journal: x.target.value })} />
            </label>
            <label className="field">
              DOI
              <input value={f.doi} onChange={(x) => setF({ ...f, doi: x.target.value })} placeholder="10.xxxx/…" />
            </label>
            <label className="field">
              Scopus quartile
              <select value={f.quartile} onChange={(x) => setF({ ...f, quartile: x.target.value as ScopusQuartile })}>
                {(['Q1', 'Q2', 'Q3', 'Q4', 'Not indexed'] as const).map((q) => (
                  <option key={q}>{q}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Your role
              <select value={f.authorRole} onChange={(x) => setF({ ...f, authorRole: x.target.value as AuthorRole })}>
                <option>First / corresponding author</option>
                <option>Co-author</option>
              </select>
            </label>
          </div>
          <Notice>
            Expected incentive under the current policy: <b>{inr(expected)}</b>. In the full system the quartile is checked against Scopus automatically from the DOI.
          </Notice>
        </Modal>
      )}
    </>
  )
}

/* ---------------- Requests ---------------- */
export function MyRequests() {
  const { s, me, actions } = useStore()
  const mine = s.requests.filter((r) => r.employeeId === me!.id)
  const [type, setType] = useState<RequestItem['type'] | null>(null)
  const [detail, setDetail] = useState('')
  return (
    <>
      <PageHead eyebrow="Self-service" title="My requests" sub="Every request shows where it is, and with whom.">
        {(['On-duty', 'Experience letter', 'Certificate'] as const).map((t) => (
          <button key={t} className="btn" onClick={() => setType(t)}>
            <Plus /> {t}
          </button>
        ))}
      </PageHead>
      {mine.length === 0 && <Card><p className="muted">No requests yet. Apply for leave from Attendance and leave.</p></Card>}
      {mine.map((r) => (
        <Card key={r.id} title={`${r.type} · ${r.id}`} sub={r.detail} action={<Badge>{r.status}</Badge>}>
          <table className="t">
            <tbody>
              {r.history.map((h, i) => (
                <tr key={i}>
                  <td className="small muted" style={{ width: 160 }}>{h.at}</td>
                  <td className="small">{h.by}</td>
                  <td>{h.action}</td>
                </tr>
              ))}
              {r.status === 'Pending' && (
                <tr>
                  <td className="small muted">Now</td>
                  <td colSpan={2}>
                    Waiting with <b>{r.stage}</b>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      ))}
      {type && (
        <Modal
          title={`New ${type.toLowerCase()} request`}
          onClose={() => setType(null)}
          footer={
            <button
              className="btn primary"
              disabled={!detail}
              onClick={() => {
                actions.submitRequest({ employeeId: me!.id, type, detail, days: type === 'On-duty' ? 1 : undefined })
                setType(null)
                setDetail('')
              }}
            >
              <Send /> Submit
            </button>
          }
        >
          <label className="field">
            Details
            <textarea rows={3} value={detail} onChange={(x) => setDetail(x.target.value)} />
          </label>
        </Modal>
      )}
    </>
  )
}
