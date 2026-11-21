import { useState, type FormEvent } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Download, Pencil, Plus, Send } from 'lucide-react'
import { balances, businessDays, chargedDays, dateKey, holidayName, type PortalData, type Update } from './model'
import { History } from './Dashboard'
import './time-office.css'

type Common = { data: PortalData; update: Update; notify: (message: string) => void }
type FormProps = Common & { close: () => void }
type TimeProps = Common & { page: string; launch: (key: string) => void; punch: () => void }
type Entry = PortalData['entries'][number]

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const dayDate = (key: string) => new Date(key + 'T12:00:00')
const formatDay = (key: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
  dayDate(key).toLocaleDateString('en-IN', options)
function move(key: string, offset: number) {
  const day = dayDate(key)
  day.setDate(day.getDate() + offset)
  return dateKey(day)
}
const weekOf = (key: string) => move(key, -((dayDate(key).getDay() + 6) % 7))
function duration(hours: number) {
  const minutes = Math.round(hours * 60)
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`
}
function timeLabel(stamp: number) {
  return new Date(stamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
function firstWorkingDay() {
  let day = dateKey()
  while (!businessDays(day, day)) day = move(day, 1)
  return day
}

export function LeaveForm({ data, update, close, notify }: FormProps) {
  const [start, setStart] = useState(firstWorkingDay)
  const [end, setEnd] = useState(start)
  const [type, setType] = useState('Earned')
  const [half, setHalf] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const last = half ? start : end
  const year = Number(start.slice(0,4)) || new Date().getFullYear()
  const available = balances(data, year)[type] ?? 0
  const validRange = start && last && last >= start && last <= move(start, 366)
  const days = validRange ? businessDays(start, last) * (half ? 0.5 : 1) : 0
  function submit(event: FormEvent) {
    event.preventDefault()
    if (start < dateKey() || !days) return setError('Choose a current or future range containing a working day.')
    for (let y = year; y <= Number(last.slice(0,4)); y++) {
      const balance = balances(data, y)[type] ?? 0
      if (chargedDays(start, last, days, y) > balance) return setError(`This request exceeds your ${balance}-day balance for ${y}.`)
    }
    if (!reason.trim()) return setError('Enter the reason for this request.')
    if (data.leaves.some(row => ['Pending','Approved'].includes(row.status) && row.start <= last && row.end >= start)) {
      return setError('These dates overlap an existing request. Review your leave history and choose another date.')
    }
    const record = { id: crypto.randomUUID(), type, start, end: last, days, reason: reason.trim(), status: 'Pending' as const }
    update(current => ({ ...current, leaves: [record, ...current.leaves] }))
    notify('Leave request submitted')
    close()
  }
  return <form className="office-form" onSubmit={submit}>
    <label>Leave type<select value={type} onChange={e => setType(e.target.value)}>{Object.keys(balances(data)).map(key => <option key={key}>{key}</option>)}</select></label>
    <div className="office-form-pair">
      <label>Start date<input required type="date" min={dateKey()} value={start} onChange={e => { setStart(e.target.value); if (end < e.target.value) setEnd(e.target.value) }}/></label>
      <label>End date<input required type="date" min={start} max={start ? move(start,366) : undefined} disabled={half} value={last} onChange={e => setEnd(e.target.value)}/></label>
    </div>
    <label className="office-check"><input type="checkbox" checked={half} onChange={e => setHalf(e.target.checked)}/>Half-day leave</label>
    <label>Reason<textarea required maxLength={600} rows={3} value={reason} onChange={e => setReason(e.target.value)}/></label>
    <div className="office-summary" aria-live="polite"><b>{days} {days === 1 ? 'working day' : 'working days'}</b><span>{available} days available in {year} · Weekends and holidays excluded</span></div>
    {error && <p className="office-error" role="alert">{error}</p>}
    <div className="office-actions"><button type="button" className="secondary-btn" onClick={close}>Cancel</button><button className="primary-btn">Submit request</button></div>
  </form>
}

export function TimeForm({ data, update, close, notify, entry, initialDate }: FormProps & { entry?: Entry; initialDate?: string }) {
  const [date, setDate] = useState(entry?.date ?? initialDate ?? dateKey())
  const [project, setProject] = useState(entry?.project ?? '')
  const [hours, setHours] = useState(entry ? String(entry.hours) : '')
  const [location, setLocation] = useState<'Office' | 'Remote'>(entry?.location ?? 'Office')
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    const value = Number(hours)
    if (!project.trim()) return setError('Enter a project or workstream.')
    if (!(value > 0 && value <= 24) || !date || date > dateKey()) return setError('Enter valid hours for today or an earlier date.')
    if (data.submittedWeeks?.includes(weekOf(date)) || (entry && data.submittedWeeks?.includes(weekOf(entry.date)))) return setError('This week has already been submitted.')
    const existing = data.entries.filter(row => row.date === date && row.id !== entry?.id).reduce((n,row) => n + row.hours, 0)
    if (existing + value > 24) return setError('Total hours for one day cannot exceed 24.')
    const record = { id: entry?.id ?? crypto.randomUUID(), date, hours: value, project: project.trim(), location }
    update(current => ({ ...current, entries: entry ? current.entries.map(row => row.id === entry.id ? record : row) : [record, ...current.entries] }))
    notify(entry ? 'Time entry updated' : 'Timesheet entry saved')
    close()
  }
  return <form className="office-form" onSubmit={submit}>
    <label>Project or workstream<input required maxLength={100} value={project} onChange={e => setProject(e.target.value)} list="office-projects"/></label>
    <datalist id="office-projects">{[...new Set(data.entries.map(row => row.project))].map(p => <option key={p}>{p}</option>)}</datalist>
    <div className="office-form-pair"><label>Work date<input required type="date" max={dateKey()} value={date} onChange={e => setDate(e.target.value)}/></label>
    <label>Hours<input required type="number" min="0.01" max="24" step="any" inputMode="decimal" value={hours} onChange={e => setHours(e.target.value)}/></label></div>
    <label>Work location<select value={location} onChange={e => setLocation(e.target.value as typeof location)}><option>Office</option><option>Remote</option></select></label>
    {error && <p className="office-error" role="alert">{error}</p>}
    <div className="office-actions"><button type="button" className="secondary-btn" onClick={close}>Cancel</button><button className="primary-btn">Save entry</button></div>
  </form>
}

function classify(data: PortalData, key: string) {
  const leaves = data.leaves.filter(row => row.status === 'Approved' && row.start <= key && row.end >= key)
  const entries = data.entries.filter(row => row.date === key)
  const punches = data.shifts.filter(row => dateKey(new Date(row.start)) === key)
  const active = data.shift !== null && dateKey(new Date(data.shift)) === key
  const hours = entries.reduce((n,row) => n + row.hours, 0)
  const holiday = holidayName(key)
  const weekend = [0,6].includes(dayDate(key).getDay())
  if (holiday || weekend) return { status: holiday || 'Weekend', color: 'rest', hours }
  if (leaves.length) return { status: leaves[0].days === 0.5 ? 'Half-day' : 'Leave', color: leaves[0].days === 0.5 ? 'half' : 'leave', hours }
  if (active || punches.length) return { status: 'Present', color: 'present', hours }
  if (hours && hours <= 4) return { status: 'Half-day', color: 'half', hours }
  if (entries.some(row => row.location === 'Remote')) return { status: 'Work from home', color: 'remote', hours }
  if (hours) return { status: 'Present', color: 'present', hours }
  return { status: key > dateKey() ? 'Scheduled' : 'No record', color: 'empty', hours }
}

function AttendanceCalendar({ data }: { data: PortalData }) {
  const [selected, select] = useState(dateKey())
  const day = dayDate(selected)
  const year = day.getFullYear(), month = day.getMonth()
  const first = new Date(year, month, 1, 12)
  const blanks = (first.getDay() + 6) % 7
  const count = new Date(year, month + 1, 0).getDate()
  const summary = classify(data, selected)
  const shifts = data.shifts.filter(s => dateKey(new Date(s.start)) === selected)
  const entries = data.entries.filter(row => row.date === selected)
  function changeMonth(offset: number) { select(dateKey(new Date(year, month + offset, 1, 12))) }
  function exportMonth() {
    const lines = ['Date,Attendance,Timesheet hours']
    for (let i=1; i<=count; i++) {
      const key = dateKey(new Date(year,month,i,12))
      const info = classify(data,key)
      lines.push(`${key},"${info.status.replaceAll('"','""')}",${info.hours.toFixed(2)}`)
    }
    const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href=url; link.download='attendance-'+selected.slice(0,7)+'.csv'; link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <div className="office-calendar-layout"><section className="card">
    <div className="card-head office-calendar-head"><h2>{formatDay(selected, {month:'long',year:'numeric'})}</h2><div className="office-controls">
      <button type="button" className="icon-button" aria-label="Previous month" onClick={() => changeMonth(-1)}><ChevronLeft size={17}/></button>
      <button type="button" className="secondary-btn" onClick={() => select(dateKey())}>Today</button>
      <button type="button" className="icon-button" aria-label="Next month" onClick={() => changeMonth(1)}><ChevronRight size={17}/></button>
    </div></div>
    <div className="office-calendar">{weekdays.map(w => <span key={w} className="office-weekday">{w}</span>)}
      {Array.from({length:blanks},(_,i)=><span key={'blank'+i}/>)}
      {Array.from({length:count},(_,i)=>{
        const key = dateKey(new Date(year,month,i+1,12))
        const info = classify(data,key)
        return <button key={key} type="button" className="office-day" aria-label={formatDay(key,{month:'long',day:'numeric'})+', '+info.status} aria-pressed={selected===key} data-color={info.color} onClick={()=>select(key)}>
          <b>{i+1}</b><small><i/>{info.status}</small></button>
      })}
    </div>
    <div className="office-legend">{[['present','Present'],['remote','Work from home'],['half','Half-day'],['leave','Leave'],['rest','Weekend / holiday']].map(([color,label])=><span key={color} data-color={color}><i/>{label}</span>)}</div>
    <button className="secondary-btn" onClick={exportMonth}><Download size={16}/> Export month</button>
  </section><section className="card office-details">
    <CalendarDays size={22}/><h2>{formatDay(selected,{weekday:'long',day:'numeric',month:'short'})}</h2><span className="office-status" data-color={summary.color}><i/>{summary.status}</span>
    <h3>Recorded hours</h3><strong>{duration(summary.hours)}</strong>
    {entries.map(row => <div className="row" key={row.id}><span>{row.project}</span><b>{duration(row.hours)}</b></div>)}
    <h3>Shift activity</h3>
    {data.shift !== null && dateKey(new Date(data.shift))===selected && <p>Punched in at {timeLabel(data.shift)} · In progress</p>}
    {shifts.map(s=><p key={s.id}>{timeLabel(s.start)} – {timeLabel(s.end)} · {duration((s.end-s.start)/3600000)}</p>)}
    {!shifts.length && !(data.shift !== null && dateKey(new Date(data.shift))===selected) && <p>No shift punches recorded for this day.</p>}
  </section></div>
}

function WeekEntries({ data, update, notify }: Common) {
  const [week,setWeek] = useState(weekOf(dateKey()))
  const [editing,setEditing] = useState<Entry | 'new' | null>(null)
  const last = move(week,6)
  const entries = data.entries.filter(row=>row.date>=week && row.date<=last).sort((a,b)=>b.date.localeCompare(a.date))
  const submitted = data.submittedWeeks?.includes(week)
  return <section className="card"><div className="card-head office-calendar-head"><div><h2>{formatDay(week)} – {formatDay(last, {day:'numeric',month:'short',year:'numeric'})}</h2>
    <p>{duration(entries.reduce((total,row)=>total+row.hours,0))} logged · {submitted?'Submitted for review':'Open for entries'}</p></div><div className="office-controls">
    <button className="icon-button" aria-label="Previous week" onClick={()=>{setWeek(move(week,-7));setEditing(null)}}><ChevronLeft size={17}/></button>
    <button className="secondary-btn" onClick={()=>{setWeek(weekOf(dateKey()));setEditing(null)}}>This week</button>
    <button className="icon-button" aria-label="Next week" onClick={()=>{setWeek(move(week,7));setEditing(null)}}><ChevronRight size={17}/></button>
  </div></div>
  {editing ? <TimeForm entry={editing === 'new' ? undefined : editing} initialDate={week === weekOf(dateKey()) ? dateKey() : week} data={data} update={update} notify={notify} close={()=>setEditing(null)}/> : <>
    {entries.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Workstream</th><th>Hours</th><th>Action</th></tr></thead><tbody>
    {entries.map(row=><tr key={row.id}><td>{formatDay(row.date)}</td><td>{row.project}</td><td>{duration(row.hours)}</td><td>{submitted?'Submitted':<button className="icon-button" aria-label={'Edit '+row.project+' on '+formatDay(row.date)} onClick={()=>setEditing(row)}><Pencil size={15}/></button>}</td></tr>)}</tbody></table></div> : <p className="office-empty">No time entries for this week.</p>}
    <div className="office-actions">{!submitted && week <= dateKey() && <button className="secondary-btn" onClick={()=>setEditing('new')}><Plus size={16}/>Log time for this week</button>}
      <button className="primary-btn" disabled={submitted || !entries.length} onClick={()=>{update(current=>({...current,submittedWeeks:[...new Set([...(current.submittedWeeks??[]),week])]}));notify('Timesheet submitted for review')}}><Send size={15}/>{submitted?'Submitted':'Submit week'}</button></div>
  </>}</section>
}

export function TimeOffice(props: TimeProps) {
  const { page,data,launch,punch }=props
  const leave=page==='Leave', time=page==='Timesheet'
  return <div className="module office-module"><div className="office-heading"><div><p className="office-kicker">HR &amp; Operations</p><h1>{leave?'Leave management':time?'Timesheet':'Attendance'}</h1>
    <p>{leave?'View available days and track your leave requests.':time?'Allocate working hours to projects and submit your week.':'Review daily attendance, recorded hours and shift activity.'}</p></div>
    <button className="primary-btn" onClick={leave?()=>launch('leave'):time?()=>launch('time'):punch}>{leave||time?<Plus size={16}/>:<Clock3 size={16}/>}
    {leave?'Apply leave':time?'Log timesheet':data.shift!==null?'Punch out':'Punch in'}</button></div>
    {leave ? <><div className="office-balances">{Object.entries(balances(data)).map(([type,value])=><div className="card" key={type}><span>{type} leave</span><strong>{value}<small> days</small></strong><p>Available balance</p></div>)}</div><History data={data}/></> :
    time ? <WeekEntries {...props}/> : <AttendanceCalendar data={data}/>}
  </div>
}
