import { useState, type FormEvent, type ReactNode } from 'react';
import {
  BadgeIndianRupee, Building2, Check, ChevronDown, ChevronRight,
  Download, Eye, EyeOff, FileText, Headphones, Landmark, Mail, MapPin,
  Network, Printer, Search, ShieldCheck, Users, Wallet,
} from 'lucide-react';
import { supabaseAuth } from './lib/supabase';
import { dateKey, employees, type PortalData, type Update } from './model';
import './Services.css';

type ServiceProps = {
  page: string;
  data: PortalData;
  update: Update;
  notify: (message: string) => void;
  launch: (target: string) => void;
  name: string;
  authenticated: boolean;
};

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});
const payEarnings = [
  ['Basic pay', 36000], ['House rent allowance', 14400], ['Special allowance', 12600],
] as const;
const payDeductions = [
  ['Employee provident fund', 4320], ['Professional tax', 200], ['Tax withheld', 1350],
] as const;
const sections = [{label:'Earnings', rows:payEarnings}, {label:'Deductions', rows:payDeductions}];
const total = (rows: ReadonlyArray<readonly [string, number]>) => rows.reduce((sum, [, amount]) => sum + amount, 0);
const gross = total(payEarnings);
const deducted = total(payDeductions);
const net = gross - deducted;
const monthKey = (d: Date) => dateKey(d).slice(0, 7);
const periodDate = (period: string) => new Date(period + '-01T12:00:00');
const periodLabel = (period: string) => periodDate(period).toLocaleDateString('en-IN', {month: 'long', year: 'numeric'});
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(s => s[0]).join('');

function payrollLedger() {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth(), 0);
  return Array.from({length: 24}, (_, i) => monthKey(new Date(last.getFullYear(), last.getMonth() - i, 1)));
}

function financialYear(period: string) {
  const date = periodDate(period);
  return date.getFullYear() - (date.getMonth() < 3 ? 1 : 0);
}

function fyLabel(start: number) { return 'FY ' + start + '–' + String(start + 1).slice(2); }

function exportLedger(periods: string[]) {
  const csv = [
    ['Pay period', 'Gross INR', 'Provident fund INR', 'Professional tax INR', 'TDS INR', 'Net INR'],
    ...periods.map(period => [period, gross, ...payDeductions.map(([, amount]) => amount), net]),
  ].map(row => row.join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'}));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'DPA-payroll-ledger-' + periods[0] + '.csv';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function Heading({title, description, action}: {title:string; description:string; action?:ReactNode}) {
  return <div className="svc-heading"><div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
function Status({children}: {children:string}) {
  return <span className="badge" data-status={children.toLowerCase()}>{children}</span>;
}
function Facts({rows}: {rows:[string,string][]}) {
  return <dl className="svc-facts">{rows.map(([label,value]) =>
    <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

export function Payslip({period, name}: {period:string; name:string}) {
  const slips = payrollLedger();
  if (!slips.includes(period)) return <p>There is no released payslip for this period.</p>;
  const end = new Date(periodDate(period).getFullYear(), periodDate(period).getMonth() + 1, 0);
  return <article className="payslip-sheet">
    <div className="svc-slip-brand"><img alt="" src="/mark.svg"/><strong>Decimal Point Analytics</strong></div>
    <div className="svc-slip-title"><div><small>EMPLOYEE PAY STATEMENT</small><h2>{periodLabel(period)}</h2></div><Status>Issued</Status></div>
    <Facts rows={[['Employee',name],['Statement reference','DPA/PS/' + period.replace('-', '/')],['Period ending',end.toLocaleDateString('en-IN')],['Currency','Indian rupee (INR)']]}/>
    <div className="svc-slip-columns">{sections.map(({label,rows}) =>
      <section key={label}><h3>{label}</h3><dl>{rows.map(([item, amount]) =>
        <div key={item}><dt>{item}</dt><dd>{rupees.format(amount)}</dd></div>)}</dl></section>)}</div>
    <div className="svc-net"><span>Net pay</span><strong>{rupees.format(net)}</strong></div>
    <button className="primary-btn no-print" onClick={() => window.print()}><Printer size={16}/>Print / Save PDF</button>
  </article>;
}

function Payroll({data, update, notify, launch}:ServiceProps) {
  const ledger = payrollLedger();
  const currentFY = financialYear(monthKey(new Date()));
  const years = Array.from(new Set([currentFY,...ledger.map(financialYear)]));
  const [year,setYear] = useState(currentFY);
  const months = ledger.filter(month => financialYear(month) === year);
  const ytd = ledger.filter(month => financialYear(month) === currentFY);
  const format = (value:number) => data.privatePay ? '••••••' : rupees.format(value);
  const cards = [
    {label:'Net monthly pay', value:format(net), caption:periodLabel(ledger[0]), icon:Wallet},
    {label:'Year-to-date earnings', value:format(gross*ytd.length), caption:fyLabel(currentFY) + ' · gross', icon:BadgeIndianRupee},
    {label:'Monthly deductions', value:format(deducted), caption:'Provident fund and taxes', icon:Landmark},
    {label:'Tax regime', value:data.profile.taxRegime || 'New regime', caption:'Current declaration', icon:ShieldCheck},
  ];
  return <div className="module svc"><Heading title="Payroll & compensation" description="Review your earnings, deductions and issued pay statements."
    action={<button className="secondary-btn" aria-pressed={data.privatePay} onClick={() => update(d=>({...d,privatePay:!d.privatePay}))}>
      {data.privatePay?<Eye size={16}/>:<EyeOff size={16}/>}{data.privatePay?'Show figures':'Hide figures'}</button>}/>
    <div className="kpis">{cards.map(({label,value,caption,icon:Icon}) =>
      <div className="kpi" key={label}><Icon size={19}/><span>{label}</span><strong>{value}</strong><small>{caption}</small></div>)}</div>
    <section className="card"><div className="card-head"><div><h2>Payslip archive</h2><p>Monthly statements issued by Finance & Pay.</p></div>
      <label className="svc-filter">Financial year<select value={year} onChange={e=>setYear(Number(e.target.value))}>{years.map(y=><option key={y} value={y}>{fyLabel(y)}</option>)}</select></label></div>
      <div className="table-wrap"><table><thead><tr><th>Pay period</th><th>Gross earnings</th><th>Net pay</th><th>Status</th><th>Statement</th></tr></thead><tbody>
        {months.map(month=><tr key={month}><th scope="row">{periodLabel(month)}</th><td>{format(gross)}</td><td>{format(net)}</td><td><Status>Issued</Status></td>
          <td><button className="secondary-btn" aria-label={'Preview payslip for '+periodLabel(month)} onClick={()=>{launch('pay:'+month);notify('Payslip ready')}}><FileText size={14}/>Preview</button></td></tr>)}</tbody></table></div>
      {!months.length&&<p className="svc-empty">Your first statement for this financial year will appear after payroll closes.</p>}</section>
    <section className="card svc-export"><div><h2>Tax & deduction ledger</h2><p>Export the monthly provident fund and tax breakdown for {fyLabel(year)}.</p></div>
      <button className="secondary-btn" disabled={!months.length || data.privatePay} onClick={()=>{exportLedger(months);notify('Payroll ledger downloaded')}}><Download size={16}/>Download CSV</button>
      {data.privatePay&&<small>Show figures to export the ledger.</small>}</section>
  </div>;
}

export function PersonDetails({id}:{id:string}) {
  const employee = employees.find(e=>e.id===id);
  if(!employee) return <p>This directory record is unavailable.</p>;
  return <section className="svc-person-details"><span className="svc-monogram">{initials(employee.name)}</span><h2>{employee.name}</h2>
    <p>{employee.role} · {employee.department}</p><Status>{employee.status}</Status>
    <Facts rows={[['Employee ID', employee.id],['Office',employee.location],['Reporting manager',employee.manager],['Extension',employee.extension],['Slack',employee.slack]]}/>
    <h3>Work email</h3><a href={'mailto:'+employee.email} className="svc-mail"><Mail size={16}/>{employee.email}</a>
    <h3>Skills & expertise</h3><div className="svc-tags">{employee.skills.map(skill=><span key={skill}>{skill}</span>)}</div></section>;
}

function Directory({launch}: ServiceProps) {
  const [query,setQuery] = useState('');
  const [department,setDepartment] = useState('');
  const [location,setLocation] = useState('');
  const [grouped,setGrouped] = useState(false);
  const departments = [...new Set(employees.map(e=>e.department))].sort();
  const locations = [...new Set(employees.map(e=>e.location))].sort();
  const filtered = employees.filter(e =>
    (!department || e.department===department) && (!location || e.location===location) &&
    [e.name,e.role,e.department,e.email,e.id,e.manager,...e.skills].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  const groups = grouped ? [...new Set(filtered.map(e=>e.manager))].sort() : [''];
  return <div className="module svc"><Heading title="Employee directory" description="Find a colleague by name, expertise, department or office."
    action={<button className="secondary-btn" aria-pressed={grouped} onClick={()=>setGrouped(v=>!v)}>{grouped?<Users size={16}/>:<Network size={16}/>}{grouped?'Directory view':'Group by manager'}</button>}/>
    <div className="card svc-search"><label><span>Search directory</span><div className="svc-search-input"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Name, role or skill"/></div></label>
    <label>Department<select value={department} onChange={e=>setDepartment(e.target.value)}><option value="">All departments</option>{departments.map(d=><option key={d}>{d}</option>)}</select></label>
    <label>Location<select value={location} onChange={e=>setLocation(e.target.value)}><option value="">All locations</option>{locations.map(l=><option key={l}>{l}</option>)}</select></label></div>
    <p className="svc-count" aria-live="polite">{filtered.length} {filtered.length===1?'colleague':'colleagues'}</p>
    {!filtered.length&&<div className="card svc-empty"><Search size={22}/><h2>No matching colleagues</h2><p>Try another name, department or location.</p>
      <button className="secondary-btn" onClick={()=>{setQuery('');setDepartment('');setLocation('')}}>Clear filters</button></div>}
    {groups.map(manager=><section key={manager}>{grouped&&<h2 className="svc-team"><Network size={17}/>Reporting to {manager}</h2>}
    <div className="directory-grid">{filtered.filter(e=>!grouped||e.manager===manager).map(e=>
      <button type="button" key={e.id} className="card svc-person" onClick={()=>launch('person:'+e.id)}>
        <span className="svc-person-top"><span className="svc-monogram">{initials(e.name)}</span><Status>{e.status}</Status></span>
        <strong>{e.name}</strong><span>{e.role}</span><small><Building2 size={14}/>{e.department}</small>
        <small><MapPin size={14}/>{e.location}<ChevronRight size={15}/></small></button>)}</div></section>)}</div>;
}

export function SecurityForm({authenticated,notify}:Pick<ServiceProps,'authenticated'|'notify'>) {
  const [message,setMessage] = useState('');
  const [busy,setBusy] = useState(false);
  async function save(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form=e.currentTarget;
    const fields=new FormData(form);
    const current=String(fields.get('current'));
    const password=String(fields.get('password'));
    if(password!==fields.get('confirm')) {setMessage('The new passwords must match.');return}
    if(current===password) {setMessage('Choose a password different from your current password.');return}
    setBusy(true);
    setMessage('');
    try {
      const user = await supabaseAuth.auth.getUser();
      if(user.error || !user.data.user?.email) throw new Error('Sign in again to change your password.');
      const check = await supabaseAuth.auth.signInWithPassword({email:user.data.user.email,password:current});
      if(check.error) throw new Error(check.error.message);
      const {error} = await supabaseAuth.auth.updateUser({password});
      if(error) throw new Error(error.message);
      form.reset(); notify('Password updated');
    } catch(err) {setMessage(err instanceof Error?err.message:'Password update failed. Please try again.')}
    finally {setBusy(false)}
  }
  return <section className="card"><div className="card-head"><div><h2>Account security</h2><p>{authenticated?'Verify your current password to choose a new one.':'Sign in with your work account to change its password.'}</p></div><ShieldCheck size={19}/></div>
    {authenticated&&<form className="svc-form" onSubmit={save}>
      <label>Current password<input name="current" type="password" autoComplete="current-password" required/></label>
      <label>New password<input name="password" type="password" minLength={8} autoComplete="new-password" required/></label>
      <label>Confirm new password<input name="confirm" type="password" minLength={8} autoComplete="new-password" required/></label>
      {message&&<p role="alert">{message}</p>}<button className="primary-btn" disabled={busy}>{busy?'Updating…':'Update password'}</button>
    </form>}</section>;
}

function Profile({data,update,name,authenticated,notify}:ServiceProps) {
  const p=data.profile;
  const self = employees.find(e=> e.name.toLowerCase()===name.toLowerCase());
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values:Record<string,string> = {};
    new FormData(e.currentTarget).forEach((value,key)=>{values[key]=String(value).trim()});
    if(!values.name) {notify('Enter a name to save your profile');return}
    update(d=>({...d,profile:{...d.profile,...values}}));
    notify('Profile saved');
  }
  return <div className="module svc"><Heading title="My profile" description="Manage your contact information, emergency contact and payroll declarations."/>
    <div className="card svc-id"><span className="svc-monogram">{initials(p.name||name)}</span><div><h2>{p.name||name}</h2><p>{p.role||self?.role||'Employee'} · {p.department||self?.department||'Decimal Point Analytics'}</p></div><Status>Active</Status></div>
    <form className="svc-profile" onSubmit={save}>
      <section className="card"><div className="card-head"><h2>Personal details</h2><Users size={18}/></div><div className="svc-form">
        <label>Full name<input name="name" required defaultValue={p.name||name} maxLength={90} autoComplete="name"/></label>
        <label>Contact email<input name="email" type="email" required defaultValue={p.email||self?.email||''} autoComplete="email"/></label>
        <label>Phone<input name="phone" type="tel" maxLength={25} defaultValue={p.phone||''} autoComplete="tel"/></label>
        <label>Office location<input name="location" defaultValue={p.location||self?.location||''} maxLength={80}/></label></div></section>
      <section className="card"><div className="card-head"><h2>Emergency contact</h2><Headphones size={18}/></div><div className="svc-form">
        <label>Contact name<input name="emergencyName" defaultValue={p.emergencyName||''} maxLength={90}/></label>
        <label>Relationship<input name="relationship" defaultValue={p.relationship||''} maxLength={50}/></label>
        <label>Contact number<input name="emergencyPhone" type="tel" maxLength={25} defaultValue={p.emergencyPhone||''}/></label></div></section>
      <section className="card"><div className="card-head"><h2>Bank & tax summary</h2><Landmark size={18}/></div><div className="svc-form">
        <label>Bank name<input name="bank" defaultValue={p.bank||''} maxLength={90}/></label>
        <label>Account ending<input name="bankSuffix" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} defaultValue={p.bankSuffix||''} placeholder="Last four digits"/></label>
        <label>Tax declaration<select name="taxRegime" defaultValue={p.taxRegime||'New regime'}><option>New regime</option><option>Old regime</option></select></label></div></section>
      <div className="svc-profile-save"><button className="primary-btn"><Check size={16}/>Save profile</button></div>
    </form><SecurityForm authenticated={authenticated} notify={notify}/></div>;
}

function Support({data,update,notify}:ServiceProps) {
  const [filter,setFilter]=useState('All statuses');
  const [expanded,setExpanded]=useState<string|null>(null);
  function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form=e.currentTarget, fields=new FormData(form);
    const title=String(fields.get('title')).trim(), detail=String(fields.get('detail')).trim();
    const team=String(fields.get('team'));
    if(!title || !detail){notify('Enter a subject and description');return}
    const id=(team==='IT Service Desk'?'IT':'HR')+'-'+crypto.randomUUID().slice(0,8).toUpperCase();
    const ticket={id,title,detail,team,status:'Open',date:dateKey()};
    update(d=>({...d,tickets:[ticket,...d.tickets]}));
    form.reset();setFilter('All statuses');setExpanded(id);notify('Support ticket submitted');
  }
  const tickets=data.tickets.filter(t=>filter==='All statuses'||t.status===filter);
  function changeStatus(id:string,status:string) {
    update(d=>({...d,tickets:d.tickets.map(t=>t.id===id?{...t,status}:t)}));
    notify(status==='Resolved'?'Ticket marked resolved':'Ticket reopened');
  }
  return <div className="module svc"><Heading title="Employee service desk" description="Request IT or HR assistance and follow your existing tickets."/>
    <div className="svc-support"><section className="card"><div className="card-head"><h2>Submit a ticket</h2><Headphones size={19}/></div>
    <form className="svc-form" onSubmit={submit}><label>Service team<select name="team"><option>IT Service Desk</option><option>People & HR</option></select></label>
      <label>Subject<input name="title" required maxLength={120} placeholder="Briefly describe the issue"/></label>
      <label>Description<textarea name="detail" required maxLength={4000} rows={5} placeholder="Include details that will help the team respond."/></label>
      <button className="primary-btn">Submit ticket</button></form></section>
    <section className="card"><div className="card-head"><h2>My tickets</h2><label className="svc-filter">Status<select value={filter} onChange={e=>setFilter(e.target.value)}>{['All statuses',...new Set(['Open','Resolved',...data.tickets.map(t=>t.status)])].map(s=><option key={s}>{s}</option>)}</select></label></div>
    {!tickets.length&&<p className="svc-empty">No tickets match this status.</p>}
    {tickets.map(ticket=><div className="svc-ticket" key={ticket.id}><button type="button" aria-expanded={expanded===ticket.id} onClick={()=>setExpanded(expanded===ticket.id?null:ticket.id)}>
      <span><small>{ticket.id} · {ticket.team}</small><strong>{ticket.title}</strong></span><Status>{ticket.status}</Status><ChevronDown size={16}/></button>
      {expanded===ticket.id&&<div className="svc-ticket-detail"><small>Submitted {ticket.date}</small><p>{ticket.detail}</p>
      <button className="secondary-btn" onClick={()=>changeStatus(ticket.id,ticket.status==='Resolved'?'Open':'Resolved')}>{ticket.status==='Resolved'?'Reopen ticket':'Mark resolved'}</button></div>}</div>)}</section></div>
  </div>;
}

export function Services(props:ServiceProps) {
  switch(props.page) {
    case 'Payroll': return <Payroll {...props}/>;
    case 'Directory': return <Directory {...props}/>;
    case 'Profile': return <Profile {...props}/>;
    case 'Support': return <Support {...props}/>;
    default: return <SecurityForm {...props}/>;
  }
}
