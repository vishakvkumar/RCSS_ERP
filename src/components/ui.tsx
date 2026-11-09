import { Lock, Info, CheckCircle2, User, CalendarCheck, Wallet, BookOpen, Send, CheckSquare, Users, FlaskConical, Award, BadgeCheck, UserPlus, IndianRupee, Landmark, SlidersHorizontal, ClipboardList, Building2, KeyRound, History, LayoutDashboard, ShieldCheck, UserRound, Fingerprint } from 'lucide-react'

const icons = { User, CalendarCheck, Wallet, BookOpen, Send, CheckSquare, Users, FlaskConical, Award, BadgeCheck, UserPlus, IndianRupee, Landmark, SlidersHorizontal, ClipboardList, Building2, KeyRound, History, LayoutDashboard, ShieldCheck, UserRound, Fingerprint }
import type { ReactNode } from 'react'
import type { Status } from '../data/types'

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const C = (icons as Record<string, typeof Lock>)[name] ?? Info
  return <C size={size} />
}

export function initials(name: string) {
  return name
    .replace(/^((Prof|Dr|Mr|Ms|Fr|Sr)\.\s)+/, '')
    .split(' ')
    .map((x) => x[0])
    .slice(0, 2)
    .join('')
}

export function Avatar({ name }: { name: string }) {
  return <div className="avatar">{initials(name)}</div>
}

export function PageHead({ eyebrow, title, sub, children }: { eyebrow?: string; title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="row">{children}</div>}
    </div>
  )
}

export function Card({ title, sub, action, children, className }: { title?: string; sub?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className ?? ''}`}>
      {(title || action) && (
        <div className="card-head">
          <div>
            {title && <h2>{title}</h2>}
            {sub && <p>{sub}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="card stat">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      {sub && <span className="sub">{sub}</span>}
    </div>
  )
}

const statusClass: Record<string, string> = {
  Approved: 'b-green',
  Paid: 'b-green',
  Present: 'b-green',
  Done: 'b-green',
  Completed: 'b-green',
  Ongoing: 'b-blue',
  Pending: 'b-amber',
  Submitted: 'b-amber',
  'HoD verified': 'b-blue',
  'Research approved': 'b-blue',
  Late: 'b-amber',
  Rejected: 'b-red',
  Returned: 'b-red',
  Absent: 'b-red',
  Leave: 'b-blue',
  Hidden: 'b-grey',
}

export function Badge({ children }: { children: Status | string }) {
  return <span className={`badge ${statusClass[children] ?? 'b-grey'}`}>{children}</span>
}

export function Locked({ text = 'Not visible to your role' }: { text?: string }) {
  return (
    <span className="locked">
      <Lock /> {text}
    </span>
  )
}

export function Notice({ children, tone }: { children: ReactNode; tone?: 'amber' }) {
  return (
    <div className={`notice ${tone ?? ''}`}>
      <Info />
      <div>{children}</div>
    </div>
  )
}

export function Bar({ value }: { value: number }) {
  const cls = value >= 85 ? '' : value >= 60 ? 'warn' : 'bad'
  return (
    <div className={`bar ${cls}`} role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
    </div>
  )
}

export function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="row between">
          <h2>{title}</h2>
          <button className="btn sm" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function Toast({ text }: { text: string }) {
  return (
    <div className="toast" role="status">
      <CheckCircle2 /> {text}
    </div>
  )
}

export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="timeline">
      {steps.map((s, i) => (
        <div key={s} className={`tl-step ${i < current ? 'done' : i === current ? 'current' : ''}`}>
          <div className="tl-dot">{i < current ? '✓' : i + 1}</div>
          <span>{s}</span>
        </div>
      ))}
    </div>
  )
}

export function downloadText(filename: string, text: string, type = 'text/csv') {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function toCsv(rows: (string | number)[][]) {
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
}
