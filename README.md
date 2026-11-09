# RCSS-EPDE — Employee Portal and Digital Ecosystem (Demo)

A clickable demo of the employee ERP proposed for **Rajagiri College of Social Sciences (Autonomous), Kalamassery**.
It shows how one platform gives every employee a self-service login and gives HR, Finance, IQAC, the Research
pillar and leadership role-based access to the same, single employee record.

> **Demo only.** All people, salaries, punches and publications are fictional sample data. Nothing is sent to a
> server: the demo keeps its state in the browser (`localStorage`). Use the reset button in the top bar to start over.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build locally
```

Requires Node 18+.

### Publish on GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys on every push to `main`.
Enable it once: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Try the demo as each role

On the sign-in page pick any role (or use *Sign in with Rajagiri Google account*, which signs in as an employee).
Switch roles any time from **Viewing as** in the top bar.

| Role | What they see and do |
| --- | --- |
| Director / Principal | Institution dashboard: staff strength, today's R Punch attendance, research incentives paid, NAAC readiness, payroll **totals**; final approval of long leave; ID and bank details only with a recorded reason |
| Dean | All departments in the school; approves leave escalated from HoDs |
| Head of Department | Department staff and today's punches; first-level leave/on-duty approval; verifies certificates and research claims |
| HR | Every employee record; onboarding pipeline; document verification; profile-change and letter requests |
| Finance | Salary register, publish salary slips, Form 16, incentive payouts |
| IQAC Coordinator | Department readiness, records needing follow-up, NAAC criterion mapping, AQAR/faculty CSV export |
| Research Pillar Head | All publications by Scopus quartile, approve claims, funded projects, **editable incentive policy** |
| Admission Pillar Head | Admission-duty roster and staff availability (student data stays in Fedina) |
| Employee | Profile, certificates/FDPs, document vault, service book, attendance and leave, payslips, Form 16, research claims, request tracking |
| System Administrator | Campuses (switch on Kakkanad), departments, designations, leave types, approval chains, role holders, audit log |

**Who sees what** (left menu, every role) shows the full access matrix.

### Suggested walkthrough (5 minutes)

1. **Employee** → *Attendance and leave* → apply for 1 day of leave.
2. **Employee** → *My research* → add a Q1 paper; the expected incentive is shown before submitting.
3. **Head of Department** → *Approvals* → approve the leave; *Verify academic entries* → verify the paper.
4. **Research Pillar Head** → *Publications and claims* → approve it.
5. **Finance** → *Incentive payouts* → release payment; *Salary and Form 16* → publish October slips.
6. **Employee** → see the leave approved, the paper marked *Paid* and the October slip available.
7. **Director / Principal** → open a person under *People*: pay is hidden, ID/bank opens only with a recorded reason.
8. **System Administrator** → add a department, enable the Kakkanad campus, and see everything in the *Audit log*.

## What is real and what is simulated

| Area | In this demo | In the full system |
| --- | --- | --- |
| Sign-in | Role picker | Google Workspace SSO with Rajagiri accounts |
| Attendance and leave | Generated punches for the last 30 days | Pulled from the **R Punch** API (TechProfessor Info Solutions) |
| Payroll | Sample salary figures | Integration approach to be decided once the current payroll process is confirmed |
| Scopus check | Faculty choose the quartile | Looked up automatically from the DOI |
| Incentive policy | Placeholder amounts (Q1 ₹25,000 … Q4 ₹5,000, co-author 50%) | RCSS research incentive policy |
| Files and PDFs | Buttons show a notice | Stored documents, signed Form 16, generated letters |
| Data | Browser `localStorage` | Secure database hosted in India, encrypted, DPDP Act 2023 compliant |

## Project structure

```
src/
  data/
    types.ts      Data model (employees, punches, payslips, publications, requests …)
    mock.ts       Sample data, R Punch simulation, incentive calculation
    roles.ts      Roles, navigation, data scoping and the access matrix
  store.tsx       App state and actions (approvals, claims, publishing, admin changes, audit log)
  lib.ts          Approval queues, IQAC completeness and readiness scores
  components/     Layout (sidebar, role switcher) and shared UI
  pages/
    Login.tsx
    Dashboard.tsx     One dashboard per role
    SelfService.tsx   Profile, attendance and leave, payslips, research, requests
    Work.tsx          Approvals, people, verification, onboarding, payroll, payouts
    Pillars.tsx       Research, IQAC, admission, admin, access matrix
```

Built with React 18, TypeScript, Vite and React Router (hash routing, so it runs from any static host).

## Open items from the college

- How payroll is processed today (software, spreadsheet or vendor)
- The research incentive policy document (Scopus tiers and amounts)
- R Punch API documentation and access
- Approval hierarchy for leave, on-duty and research claims
- Department, designation and employee-category lists for Kalamassery
- Owners for the HR, Finance, IQAC, Research and Admission pillars
