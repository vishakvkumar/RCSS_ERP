import { useStore } from '../store'
import { roles } from '../data/roles'
import { Avatar, Icon } from '../components/ui'

const pillars = [
  ['UserRound', 'Self-service'],
  ['Users', 'HR and lifecycle'],
  ['Fingerprint', 'R Punch attendance'],
  ['Wallet', 'Finance'],
  ['Award', 'IQAC and NAAC'],
  ['FlaskConical', 'Research incentives'],
]

export default function Login() {
  const { s, actions } = useStore()
  return (
    <div className="login">
      <div className="login-left">
        <img src="./rcss-logo.png" alt="Rajagiri College of Social Sciences" />
        <div className="stack" style={{ gap: 16 }}>
          <div className="eyebrow">RCSS-EPDE · Employee Portal and Digital Ecosystem</div>
          <h1>One login for every employee. One record for every person.</h1>
          <p className="lead">
            Profiles, documents, attendance from R Punch, salary slips, research incentives and IQAC data, in one place.
            Every role sees exactly what its work needs.
          </p>
        </div>
        <div className="pillars">
          {pillars.map(([i, l]) => (
            <div key={l}>
              <Icon name={i} />
              {l}
            </div>
          ))}
        </div>
        <button className="google-btn" onClick={() => actions.signIn('employee')}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          Sign in with Rajagiri Google account
        </button>
        <p className="small muted">
          In this demo the Google button signs you in as an employee. Use the panel on the right to try any other role.
          All people and figures are sample data.
        </p>
      </div>
      <div className="login-right">
        <h2>Try the demo as…</h2>
        <p className="small" style={{ color: '#a9c9b6' }}>
          Each login sees a different dashboard and different data. You can switch roles any time from the top bar.
        </p>
        <div className="persona-grid">
          {roles.map((r) => {
            const e = s.employees.find((x) => x.id === s.roleHolders[r.id])
            return (
              <button key={r.id} className="persona" onClick={() => actions.signIn(r.id)}>
                <Avatar name={e?.name ?? r.title} />
                <div>
                  <b>{r.title}</b>
                  <small>{e?.name}</small>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
