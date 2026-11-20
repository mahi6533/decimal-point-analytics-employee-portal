# Decimal Point Analytics Employee Portal

A React and TypeScript workforce portal with 21 views covering research delivery, attendance, leave, payroll, employee services and administration.

## Run locally

Use Node.js 22.12 or later. From the repository root:

```sh
npm install
npm run dev
```

To type-check, build and serve the production bundle:

```sh
npm run build
npm run preview
```

## Accounts and records

**Continue to employee workspace** opens Mahesh Shirsath’s seeded workspace. To use account sign-in, copy `.env.example` to `.env.local`, supply your Supabase project URL and publishable key, and restart Vite. The existing schema is in `supabase/schema.sql`. The same-origin auth fallback uses the Vercel function and requires those environment variables in Vercel.

The app uses Supabase for account authentication and password changes. HR requests, project time, shift logs, local profile edits and service tickets are stored in the browser under the employee’s workspace key. Uploaded documents use IndexedDB. Payslips, directory records and company bulletins are seeded. Real payroll disbursement, shared approvals and delivery to an external helpdesk require backend integrations.

The browser workflow in `.github/workflows/portal-browser.yml` runs the production build in Chromium at 1440, 1280, 768 and 390 pixels and checks for document overflow and browser errors.
