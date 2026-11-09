import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, LogOut, RotateCcw } from 'lucide-react'
import { useStore } from '../store'
import { navFor, roles, roleTitle } from '../data/roles'
import { Avatar, Icon, Toast } from './ui'
import type { RoleId } from '../data/types'

export default function Layout({ children }: { children: ReactNode }) {
  const { s, me, actions, toast } = useStore()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  if (!s.role || !me) return null
  const activeCampus = s.campuses.filter((c) => c.active)

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        <div className="brand">
          <div className="brand-mark">
            <img src="./rcss-logo.png" alt="" />
          </div>
          <div>
            <b>RCSS-EPDE</b>
            <span>Employee Portal</span>
          </div>
        </div>
        {navFor(s.role).map((sec) => (
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
          <span className="demo-pill">Demo · sample data</span>
          <div className="spacer" />
          <label className="row small muted" title="Switch role to see the platform through another login">
            <span className="who-text">Viewing as</span>
            <select
              className="btn sm"
              value={s.role}
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
          <div className="who">
            <Avatar name={me.name} />
            <div className="who-text">
              <b className="small">{me.name}</b>
              <small>{roleTitle(s.role)}</small>
            </div>
          </div>
          <button className="btn sm" onClick={actions.reset} title="Reset demo data">
            <RotateCcw />
          </button>
          <button
            className="btn sm"
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
      {toast && <Toast text={toast} />}
    </div>
  )
}
