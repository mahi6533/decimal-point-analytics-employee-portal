import { Fragment, useEffect, useId, useState } from 'react'
import { Activity, Bell, Briefcase, CalendarDays, CalendarPlus, ChartNoAxesColumn, ChevronDown, ChevronRight, Clock3, Download, FileText, Inbox, Landmark, ListChecks, Headphones, Timer } from 'lucide-react'
import { balances, businessDays, bulletins, dateKey, documents, downloadDoc, employees, holidayName, payDate, type PortalData } from './model'
import {readWorkItems} from './WorkItems'
import {Braces, Database, Workflow} from 'lucide-react'
import './dashboard.css'

type DashboardProps = {
  scope:string
  openItem:(id:string)=>void
  data: PortalData
  name: string
  go: (section: string) => void
  launch: (action: string) => void
}

function fromKey(key: string) {
  return new Date(key.slice(0, 10) + 'T12:00:00')
}
function offsetDay(date: Date, offset: number) {
  const next = new Date(date)
  next.setDate(date.getDate() + offset)
  return next
}
function shortDate(date: Date) {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
function number(value: number) {
  return value.toLocaleString('en-IN', { maximumFractionDigits: 1 })
}
export function History({ data }: { data: PortalData }) {
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)
  const rows = data.leaves.filter(row => filter === 'All' || row.status === filter)
  return <section className="card request-history">
    <div className="card-head"><div><h2>Request history</h2><p>Leave applications and approval status</p></div>
      <label className="dash-select"><span className="dash-sr">Filter requests by status</span><select value={filter} onChange={e => setFilter(e.target.value)}>{['All', 'Approved', 'Pending', 'Rejected'].map(status => <option key={status} value={status}>{status === 'All' ? 'All statuses' : status}</option>)}</select></label>
    </div>
    {rows.length ? <div className="table-wrap"><table><thead><tr><th>Request</th><th>Dates</th><th>Days</th><th>Status</th></tr></thead><tbody>
      {rows.map(row => <Fragment key={row.id}><tr><td><button className="history-detail" type="button" aria-expanded={expanded === row.id} onClick={() => setExpanded(expanded === row.id ? null : row.id)}>{expanded === row.id ? <ChevronDown size={14}/> : <ChevronRight size={14}/>} {row.type}</button></td>
        <td>{shortDate(fromKey(row.start))}{row.end !== row.start && ' – ' + shortDate(fromKey(row.end))}</td><td>{row.days}</td><td><span className={'badge ' + row.status.toLowerCase()}>{row.status}</span></td></tr>
        {expanded === row.id && <tr className="history-reason"><td colSpan={4}><b>Reason</b> {row.reason || 'No reason recorded.'}<small>{row.id}</small></td></tr>}
      </Fragment>)}</tbody></table></div> : <div className="dash-empty"><Inbox size={26}/><b>No {filter === 'All' ? '' : filter.toLowerCase() + ' '}requests</b><span>{filter === 'All' ? 'Your submitted leave applications will appear here.' : 'Select another status to see other applications.'}</span></div>}
  </section>
}

function WeeklyChart({ data }: { data: PortalData }) {
  const [period, setPeriod] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const id = useId()
  const today = new Date()
  const monday = offsetDay(today, -((today.getDay() + 6) % 7) - period * 7)
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = offsetDay(monday, index)
    const entries = data.entries.filter(entry => entry.date === dateKey(date))
    return { date, entries, hours: entries.reduce((sum, entry) => sum + Number(entry.hours), 0), target: businessDays(dateKey(date), dateKey(date)) * 8 }
  })
  const total = days.reduce((sum, day) => sum + day.hours, 0)
  const maximum = Math.max(10, Math.ceil(Math.max(...days.map(d => d.hours)) / 2) * 2)
  const chosen = selected === null ? null : days[selected]
  return <section className="card weekly-chart">
    <div className="card-head"><div><h2>Weekly work hours</h2><p>{shortDate(monday)} – {shortDate(days[6].date)} · Project time</p></div>
      <label className="dash-select"><span className="dash-sr">Chart week</span><select value={period} onChange={e => {setPeriod(Number(e.target.value)); setSelected(null)}}>{['This week', 'Last week', '2 weeks ago', '3 weeks ago'].map((label, i) => <option key={label} value={i}>{label}</option>)}</select></label>
    </div>
    <div className="plot-summary"><strong>{number(total)}<small> h</small></strong><div className="plot-legend"><span>Logged</span><span>Target</span></div></div>
    <div className="hours-plot" role="group" aria-label="Daily logged hours and scheduled working-day targets">
      <div className="plot-scale" aria-hidden="true">{[1, .75, .5, .25, 0].map(f => <span key={f}>{number(f * maximum)}h</span>)}</div>
      <div className="plot-columns">{days.map((day, i) => {
        const label = day.date.toLocaleDateString('en-IN', {weekday: 'short'})
        const summary = label + ', ' + number(day.hours) + ' hours logged, target ' + day.target + ' hours'
        return <button key={label} type="button" title={summary} aria-label={summary} aria-pressed={selected === i} aria-controls={id} onClick={() => setSelected(selected === i ? null : i)}>
          <span className="plot-bars"><i style={{height: (day.hours / maximum * 100) + '%'}}/><i style={{height: (day.target / maximum * 100) + '%'}}/></span><span className="plot-label">{label}</span>
        </button>
      })}</div>
    </div>
    <div id={id} className="chart-detail" aria-live="polite">{chosen ? <><b>{shortDate(chosen.date)} · {number(chosen.hours)} h</b><span>{chosen.entries.length ? chosen.entries.map(e => e.project + ' (' + number(e.hours) + ' h)').join(' · ') : 'No time entries recorded.'}</span></> : <><Timer size={15}/><span>Weekly target</span><b>{days.reduce((n, day) => n + day.target, 0)} hours</b></>}</div>
  </section>
}

export default function Dashboard({data, name, go, launch, scope, openItem}: DashboardProps) {
  const today = new Date()
  const [items,setItems]=useState(()=>readWorkItems(scope))
  useEffect(()=>{
    const refresh=()=>setItems(readWorkItems(scope))
    window.addEventListener('storage',refresh)
    return ()=>window.removeEventListener('storage',refresh)
  },[scope])
  const firstName = name.trim().split(/\s+/)[0]
  const hour = today.getHours()
  const monthPrefix = dateKey(today).slice(0, 7)
  const logged = data.entries.reduce((sum, e) => sum + (e.date.startsWith(monthPrefix) ? Number(e.hours) : 0), 0)
  const target = businessDays(monthPrefix + '-01', dateKey(new Date(today.getFullYear(), today.getMonth() + 1, 0))) * 8
  const balance = balances(data)
  const available = Object.values(balance).reduce((sum, value) => sum + value, 0)
  const payday = payDate()
  const distance = Math.round((fromKey(dateKey(payday)).getTime() - fromKey(dateKey(today)).getTime()) / 86400000)
  const pending = data.leaves.filter(row => row.status === 'Pending').length
  return <div className="module dpa-dashboard">
    <section className="workspace-intro" aria-label="My workspace">
      <div className="welcome-banner">
        <div className="welcome-copy">
          <div className="workspace-label">Engineering workspace</div>
          <h1>Good {hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'}, {firstName}.</h1>
          <p>{data.profile.role || 'Research Analyst'} <span aria-hidden="true">/</span> {data.profile.department || 'Quantitative Research'}</p>
          <div className="welcome-context"><span><CalendarDays size={15}/>{today.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'long',year:'numeric'})}</span><span className={'shift-state' + (data.shift ? ' active-shift' : '')}><i/>{data.shift ? 'On shift' : 'Off shift'}</span></div>
        </div>
      </div>
      <div className="service-links" aria-label="Employee shortcuts">
        <button onClick={()=>go('My Work')}><Briefcase/><span>My work</span><ChevronRight/></button>
        <button onClick={()=>launch('leave')}><CalendarPlus/><span>Apply leave</span><ChevronRight/></button>
        <button onClick={()=>launch('time')}><Clock3/><span>Log timesheet</span><ChevronRight/></button>
        <button onClick={()=>go('Support')}><Headphones/><span>Service desk</span><ChevronRight/></button>
      </div>
    </section>
    <div className="summary-heading"><h2>Employee overview</h2><span>{today.toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</span></div>
    <section className="kpis" aria-label="Employee summary">
      <button className="kpi dash-kpi" onClick={() => go('Attendance')}><span className="kpi-label"><span className="metric-icon blue"><Clock3 size={17}/></span>Hours logged</span><strong>{number(logged)}<small> h</small></strong><span className="kpi-caption">of {target} hours this month</span><span className="hours-progress"><i style={{width: Math.min(100, logged / target * 100) + '%'}}/></span></button>
      <button className="kpi dash-kpi" onClick={() => go('Leave')}><span className="kpi-label"><span className="metric-icon teal"><CalendarPlus size={17}/></span>Leave balance</span><strong>{number(available)}<small> days</small></strong><span className="kpi-caption">{Object.entries(balance).map(([type, value]) => type.split(' ')[0] + ' ' + number(value)).join(' · ')}</span></button>
      <button className="kpi dash-kpi" title="Preview latest payslip" onClick={() => launch('pay')}><span className="kpi-label"><span className="metric-icon violet"><Landmark size={17}/></span>Next payroll</span><strong>{number(Math.max(0, distance))}<small> days</small></strong><span className="kpi-caption">{payday.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span></button>
      <button className="kpi dash-kpi" onClick={() => go('Leave')}><span className="kpi-label"><span className="metric-icon amber"><ListChecks size={17}/></span>Pending requests</span><strong>{String(pending).padStart(2,'0')}</strong><span className="kpi-caption">{pending ? 'Awaiting leave approval' : 'All leave requests reviewed'}</span></button>
    </section>
    <section aria-labelledby="studio-title" className="studio">
      <div className="studio-heading"><h2 id="studio-title">Engineering workbench</h2><button onClick={()=>go('My Work')}>All work <ChevronRight size={15}/></button></div>
      <div className="studio-grid">{[
        {label:'Applied AI',icon:Workflow,ids:['SH-2138','WK-1058'],tone:'iris'},
        {label:'Software engineering',icon:Braces,ids:['SH-2131','SH-2101'],tone:'blue'},
        {label:'Data engineering',icon:Database,ids:['WK-1098','SH-2124'],tone:'mint'}
      ].map(({label,icon:Icon,ids,tone})=>{
        const candidates=ids.map(id=>items.find(item=>item.id===id))
        const task=candidates.find(item=>item&&item.status!=='Completed')??candidates.find(Boolean)
        if(!task)return null
        return <button key={label} className={'studio-task '+tone} onClick={()=>openItem(task.id)}>
          <span className="discipline"><Icon size={18}/>{label}</span>
          <strong>{task.title}</strong>
          <span className="studio-meta"><code>{task.id}</code><span>{task.status}</span><ChevronRight size={14}/></span>
        </button>
      })}</div>
    </section>
    <div className="columns dash-columns"><div className="stack"><WeeklyChart data={data}/><History data={data}/></div>
      <div className="stack">
        <section className="card bulletin-card"><div className="card-head"><div><h2>Company bulletins</h2><p>Research and workplace updates</p></div><Bell size={18}/></div>
          <div className="dash-feed">{bulletins.slice(0,3).map((item,i) => <button key={item.id} onClick={() => launch('bulletin:' + item.id)}><span className={'feed-icon feed-i' + i}>{i===0 ? <ChartNoAxesColumn size={16}/> : i===1 ? <Activity size={16}/> : <Briefcase size={16}/>}</span><span><small>{item.category}</small><b>{item.title}</b></span><ChevronRight size={14}/></button>)}</div>
        </section>
        <Agenda/>
        <section className="card"><div className="card-head"><div><h2>HR documents</h2><p>Download employee resources</p></div><FileText size={18}/></div><div className="dash-feed">{documents.slice(0,3).map(doc => <button key={doc.title} onClick={() => downloadDoc(doc.title)}><FileText size={17}/><b>{doc.title}</b><Download size={16}/></button>)}</div></section>
      </div>
    </div>
  </div>
}

function Agenda() {
  const today = new Date()
  const holidays: { date: Date; name: string; detail: string }[] = []
  for (let i = 0; i <= 365 && holidays.length < 2; i++) {
    const date = offsetDay(today, i)
    const name = holidayName(dateKey(date))
    if (name) holidays.push({date, name, detail: 'Office holiday'})
  }
  const away = offsetDay(today, 1)
  while (away.getDay() === 0 || away.getDay() === 6 || holidayName(dateKey(away))) away.setDate(away.getDate() + 1)
  const coverage = employees.filter(person => person.status === 'Away').map(person => ({date:away,name:person.name,detail:person.department + ' · Out of office'}))
  const upcoming = [...holidays, ...coverage].sort((a,b) => a.date.getTime() - b.date.getTime())
  return <section className="card"><div className="card-head"><div><h2>Team calendar</h2><p>Upcoming holidays and time away</p></div><CalendarDays size={18}/></div><div className="agenda-list">{upcoming.map(event => <div key={event.name}><time dateTime={dateKey(event.date)}><small>{event.date.toLocaleDateString('en-IN',{month:'short'})}</small><b>{event.date.getDate()}</b></time><span><b>{event.name}</b><small>{event.detail}</small></span></div>)}</div></section>
}

