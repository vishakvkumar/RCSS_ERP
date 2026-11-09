import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, LogOut, RotateCcw, MoreHorizontal } from 'lucide-react'
import { useStore } from '../store'
import { navFor, roles, roleTitle, type NavItem } from '../data/roles'
import { Avatar, Icon, Toast } from './ui'
import type { RoleId } from '../data/types'

/** Up to four shortcuts for the phone tab bar: home, then the role's main work, then self-service. */
function tabsFor(sections: { section: string; items: NavItem[] }[]): NavItem[] {
  const all = sections.flatMap((s) => s.items)
  const home = all[0]
  const work = sections.find((s) => s.section === 'My work')?.items ?? []
  const self = sections.find((s) => s.section === 'Self-service')?.items ?? []
  const picks = [home, ...work.slice(0, 2), ...self].slice(0, 4)
  return picks.map((p) => ({ ...p, label: shortLabel(p.label) }))
}

function shortLabel(l: string) {
  const map: Record<string, string> = {
    'Attendance and leave': 'Attendance',
    'Payslips and Form 16': 'Payslips',
    'Publications and claims': 'Claims',
    'Salary and Form 16': 'Salary',
    'Incentive payouts': 'Payouts',
    'Department staff': 'Staff',
    'School staff': 'Staff',
    'Verify academic entries': 'Verify',
    'Document verification': 'Verify',
    'HR requests': 'Requests',
    'NAAC and NIRF': 'IQAC',
    'IQAC and NAAC': 'IQAC',
    'Faculty data': 'Faculty',
    'Funded projects': 'Projects',
    'Admission duty': 'Roster',
    'Master data': 'Settings',
    'Roles and access': 'Roles',
    Dashboard: 'Home',
    'My profile': 'Profile',
  }
  return map[l] ?? l
}

export default function Layout({ children }: { children: ReactNode }) {
  const { s, me, actions, toast } = useStore()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const loc = useLocation()
  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [loc.pathname])
  if (!s.role || !me) return null
  const activeCampus = s.campuses.filter((c) => c.active)
  const sections = navFor(s.role)
  const tabs = tabsFor(sections)

  return (
    <div className="shell">
      {open && <div className="drawer-back" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <img src="./icon-192.png" alt="" />
          </div>
          <div>
            <b>RCSS-EPDE</b>
            <span>Employee Portal</span>
          </div>
        </div>
        <div className="drawer-who">
          <Avatar name={me.name} />
          <div>
            <b>{me.name}</b>
            <small>{roleTitle(s.role)}</small>
          </div>
        </div>
        {sections.map((sec) => (
          <nav className="nav-section" key={sec.section}>
            <span>{sec.section}</span>
            {sec.items.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Icon name={it.icon} />
                {it.label}
              </NavLink>
            ))}
          </nav>
        ))}
        <div className="drawer-actions">
          <button className="nav-link" onClick={actions.reset}>
            <RotateCcw /> Reset demo data
          </button>
          <button
            className="nav-link"
            onClick={() => {
              actions.signOut()
              nav('/')
            }}
          >
            <LogOut /> Sign out
          </button>
        </div>
        <div className="sidebar-foot">
          {activeCampus.map((c) => c.name).join(' · ')}
          <br />
          Demo build · sample data only
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="btn sm menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <Menu />
          </button>
          <span className="demo-pill">Demo<span className="hide-phone"> · sample data</span></span>
          <div className="spacer" />
          <label className="row small muted" title="Switch role to see the platform through another login">
            <span className="who-text">Viewing as</span>
            <select
              className="btn sm role-select"
              value={s.role}
              aria-label="Viewing as"
              onChange={(e) => {
                actions.signIn(e.target.value as RoleId)
                nav('/')
              }}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </label>
          <div className="who hide-phone">
            <Avatar name={me.name} />
            <div className="who-text">
              <b className="small">{me.name}</b>
              <small>{roleTitle(s.role)}</small>
            </div>
          </div>
          <button className="btn sm hide-phone" onClick={actions.reset} title="Reset demo data">
            <RotateCcw />
          </button>
          <button
            className="btn sm hide-phone"
            onClick={() => {
              actions.signOut()
              nav('/')
            }}
            title="Sign out"
          >
            <LogOut />
          </button>
        </header>
        <main className="content">{children}</main>
      </div>

      <nav className="tabbar" aria-label="Main">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'} className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
            <Icon name={t.icon} size={22} />
            <span>{t.label}</span>
          </NavLink>
        ))}
        <button className={`tab-item ${open ? 'active' : ''}`} onClick={() => setOpen(true)}>
          <MoreHorizontal size={22} />
          <span>More</span>
        </button>
      </nav>
      {toast && <Toast text={toast} />}
    </div>
  )
}
