import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { StoreProvider, useStore } from './store'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { MyAttendance, MyPayslips, MyProfile, MyRequests, MyResearch } from './pages/SelfService'
import { Approvals, Onboarding, Payouts, Payroll, People, PersonDetail, Verify } from './pages/Work'
import { Access, Admission, AdminAudit, AdminMaster, AdminRoles, Iqac, ResearchClaims, ResearchPolicy, ResearchProjects } from './pages/Pillars'
import type { RoleId } from './data/types'
import type { ReactNode } from 'react'

function Only({ roles, children }: { roles: RoleId[]; children: ReactNode }) {
  const { s } = useStore()
  return roles.includes(s.role!) ? <>{children}</> : <Navigate to="/" replace />
}

function Routed() {
  const { s } = useStore()
  if (!s.role) return <Login />
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/me/profile" element={<MyProfile />} />
        <Route path="/me/attendance" element={<MyAttendance />} />
        <Route path="/me/payslips" element={<MyPayslips />} />
        <Route path="/me/research" element={<MyResearch />} />
        <Route path="/me/requests" element={<MyRequests />} />
        <Route path="/approvals" element={<Only roles={['principal', 'dean', 'hod', 'hr']}><Approvals /></Only>} />
        <Route path="/people" element={<Only roles={['principal', 'dean', 'hod', 'hr', 'iqac']}><People /></Only>} />
        <Route path="/people/:id" element={<Only roles={['principal', 'dean', 'hod', 'hr', 'iqac', 'finance', 'research', 'admission']}><PersonDetail /></Only>} />
        <Route path="/verify" element={<Only roles={['hod', 'hr']}><Verify /></Only>} />
        <Route path="/onboarding" element={<Only roles={['hr']}><Onboarding /></Only>} />
        <Route path="/payroll" element={<Only roles={['finance']}><Payroll /></Only>} />
        <Route path="/payouts" element={<Only roles={['finance']}><Payouts /></Only>} />
        <Route path="/iqac" element={<Only roles={['iqac', 'principal']}><Iqac /></Only>} />
        <Route path="/research" element={<Only roles={['research', 'principal', 'dean', 'hod']}><ResearchClaims /></Only>} />
        <Route path="/research/projects" element={<Only roles={['research', 'principal']}><ResearchProjects /></Only>} />
        <Route path="/research/policy" element={<Only roles={['research']}><ResearchPolicy /></Only>} />
        <Route path="/admission" element={<Only roles={['admission']}><Admission /></Only>} />
        <Route path="/admin/master" element={<Only roles={['admin']}><AdminMaster /></Only>} />
        <Route path="/admin/roles" element={<Only roles={['admin']}><AdminRoles /></Only>} />
        <Route path="/admin/audit" element={<Only roles={['admin']}><AdminAudit /></Only>} />
        <Route path="/access" element={<Access />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routed />
      </HashRouter>
    </StoreProvider>
  )
}
