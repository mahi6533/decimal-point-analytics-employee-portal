import { Fragment, useId, useState } from 'react'
import { Activity, Bell, Briefcase, CalendarDays, CalendarPlus, ChartNoAxesColumn, ChevronDown, ChevronRight, Clock3, Download, FileText, Inbox, Landmark, ListChecks, Plus, Timer } from 'lucide-react'
import { balances, businessDays, bulletins, dateKey, documents, downloadDoc, employees, holidayName, payDate, type PortalData } from './model'
import './dashboard.css'

type DashboardProps = {
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
// A decorative isometric grid evokes the firm's quantitative research work.
function SignalSurface() {
  const project = (i: number, j: number) => {
    const height = 78 * Math.exp(-((i - 11) ** 2 / 22 + (j - 6) ** 2 / 21))
      + 49 * Math.exp(-((i - 21) ** 2 / 16 + (j - 11) ** 2 / 19))
      + 6 * Math.sin(i * 0.5 + j * 0.25)
    return [45 + i * 12 + j * 8, 96 - i * 2.3 + j * 5.3 - height]
  }
  const line = (points: number[][]) => points.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')
  return <svg className="signal-surface" viewBox="0 0 510 200" aria-hidden="true" focusable="false">
    {Array.from({ length: 18 }, (_, j) => <polyline key={'y' + j} points={line(Array.from({ length: 28 }, (_, i) => project(i, j)))} />)}
    {Array.from({ length: 28 }, (_, i) => <polyline key={'x' + i} points={line(Array.from({ length: 18 }, (_, j) => project(i, j)))} />)}
    {[[11, 6], [21, 11], [5, 10]].map(([i, j]) => {
      const [x, y] = project(i, j)
      return <circle key={i} cx={x} cy={y} r="2.8"/>
    })}
  </svg>
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

export default function Dashboard({data, name, go, launch}: DashboardProps) {
  const today = new Date()
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
    <section className="hero dash-hero">
      <SignalSurface/>
      <div className="dash-welcome"><div className="dash-date"><CalendarDays size={14}/>{today.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
        <h1>Good {hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'}, {firstName}.</h1>
        <div className="dash-affiliation"><span className={'shift-state' + (data.shift ? ' active-shift' : '')}><i/>{data.shift ? 'On shift' : 'Off shift'}</span><span className="dash-role"><Briefcase size={14}/>{data.profile.role || 'Research Analyst'} · {data.profile.department || 'Quantitative Research'}</span></div>
        <div className="dash-actions"><button className="primary-btn" onClick={() => launch('leave')}><Plus size={16}/>Apply leave</button><button className="secondary-btn" onClick={() => launch('time')}><Clock3 size={16}/>Log timesheet</button></div>
      </div>
    </section>
    <section className="kpis" aria-label="Employee summary">
      <button className="kpi dash-kpi" onClick={() => go('Attendance')}><span className="kpi-label"><span className="metric-icon blue"><Clock3 size={17}/></span>Hours logged</span><strong>{number(logged)}<small> h</small></strong><span className="kpi-caption">of {target} hours this month</span><span className="hours-progress"><i style={{width: Math.min(100, logged / target * 100) + '%'}}/></span></button>
      <button className="kpi dash-kpi" onClick={() => go('Leave')}><span className="kpi-label"><span className="metric-icon teal"><CalendarPlus size={17}/></span>Leave balance</span><strong>{number(available)}<small> days</small></strong><span className="kpi-caption">{Object.entries(balance).map(([type, value]) => type.split(' ')[0] + ' ' + number(value)).join(' · ')}</span></button>
      <button className="kpi dash-kpi" title="Preview latest payslip" onClick={() => launch('pay')}><span className="kpi-label"><span className="metric-icon violet"><Landmark size={17}/></span>Next payroll</span><strong>{number(Math.max(0, distance))}<small> days</small></strong><span className="kpi-caption">{payday.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span></button>
      <button className="kpi dash-kpi" onClick={() => go('Leave')}><span className="kpi-label"><span className="metric-icon amber"><ListChecks size={17}/></span>Pending requests</span><strong>{String(pending).padStart(2,'0')}</strong><span className="kpi-caption">{pending ? 'Awaiting leave approval' : 'All leave requests reviewed'}</span></button>
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
