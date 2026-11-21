import {useEffect,useState} from 'react';
import type {FormEvent} from 'react';
import {BookOpen,CalendarDays,ChevronLeft,ChevronRight,Download,FolderKanban,Plus,Search} from 'lucide-react';
import {dateKey} from './model';
import Dialog from './Dialog';
import {seedWorkItems} from './WorkItems';
import {courses,initialRecords,specs} from './operations/catalog';
import type {Field,Operation,RecordItem} from './operations/catalog';
import './operations.css';

type Props={page:string;scope:string;notify:(s:string)=>void;go:(s:string)=>void};
type Task=typeof seedWorkItems[number];
type Draft=Partial<Record<Field['key'],string>>;
const currency=(amount:number)=>amount.toLocaleString('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2});
const dayLabel=(s:string)=>new Date(s+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
const statuses:Partial<Record<Operation,string>>={Calendar:'Scheduled',Projects:'Planning',Performance:'In progress'};
function parseList<T>(key:string,fallback:T[]):T[]{
 try{const raw=localStorage.getItem(key);if(!raw)return fallback;const parsed:unknown=JSON.parse(raw);return Array.isArray(parsed)?parsed:fallback}catch{return fallback}
}
function readRecords(scope:string,page:Operation){
 const defaults=initialRecords(page);
 if(scope==='local'){
  type LegacyAction={title?:string;name?:string;details?:string;amount?:string;at?:string};
  const legacy=parseList<LegacyAction>('dpa_actions',[]);
  const pattern:Partial<Record<Operation,RegExp>>={Travel:/travel request/i,Assets:/asset request/i,Expenses:/expense form/i,Admin:/employee invite/i,Performance:/goal editor/i};
  for(const [index,a] of legacy.entries()){
   if(!pattern[page]?.test(a.title||'')||!a.at)continue;
   defaults.push({id:'HIST-'+index,title:a.name||a.title||page,detail:a.details||'',date:a.at.slice(0,10),category:'Previous workspace',status:'Recorded',amount:page==='Expenses'?Number((a.amount||'0').replace(/[^\d.]/g,'')):undefined});
  }
 }
 return parseList<RecordItem>('dpa:operations:'+scope+':'+page,defaults);
}
function dueDate(label:string){
 if(/^\d{4}-\d{2}-\d{2}$/.test(label))return label;
 const now=new Date(), d=new Date(label+' '+now.getFullYear());
 if(!Number.isFinite(+d))return dateKey(now);
 if(d.getTime()-now.getTime()>183*864e5)d.setFullYear(d.getFullYear()-1);
 if(now.getTime()-d.getTime()>183*864e5)d.setFullYear(d.getFullYear()+1);
 return dateKey(d);
}
function tasksFor(scope:string){return parseList<Task>(scope==='local'?'dpa_work_items':'dpa_work_items:'+scope,seedWorkItems)}
function projectList(tasks:Task[]):RecordItem[]{
 return [...new Set(tasks.map(t=>t.project))].map((project,i)=>{
  const related=tasks.filter(t=>t.project===project);
  const progress=Math.round(related.reduce((total,t)=>total+t.progress,0)/related.length);
  const current=related.filter(t=>t.status!=='Completed');
  return {id:'PRJ-'+i,title:project,category:related[0].client,detail:related.map(t=>t.title).join(' · '),status:current.some(t=>t.status==='Blocked')?'At risk':current.length?'On track':'Completed',date:(current.length?current:related).map(t=>dueDate(t.due)).sort()[0],progress};
 });
}
function exportRecords(page:Operation,records:RecordItem[]){
 const escape=(v:unknown)=>{const s=String(v??'');return '"'+(/^[=+@\-\t\r]/.test(s)?"'":'')+s.replaceAll('"','""')+'"'};
 const fields:(keyof RecordItem)[]=['id','title','category','status','date','end','amount','progress','detail'];
 const csv=[fields.join(','),...records.map(r=>fields.map(k=>escape(r[k])).join(','))].join('\r\n');
 const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='DPA-'+page+'-'+dateKey()+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function Editor({page,existing,onSave,close,initialDate}:{page:Operation;initialDate:string;existing?:RecordItem;onSave:(d:Draft)=>void;close:()=>void}){
 const fields=specs[page].fields;
 const [draft,setDraft]=useState<Draft>(()=>Object.fromEntries(fields.map(f=>[f.key,String(existing?.[f.key]??f.options?.[0]??(f.type==='date'?initialDate:f.key==='progress'?0:''))])));
 const submit=(e:FormEvent)=>{e.preventDefault();onSave(draft)};
 return <Dialog title={existing?'Update '+existing.title:specs[page].create||page} close={close}><form className="op-form" onSubmit={submit}>
 {fields.map(f=><label key={f.key}>{f.label}{f.options?<select value={draft[f.key]} onChange={e=>setDraft({...draft,[f.key]:e.target.value})}>{f.options.map(o=><option key={o}>{o}</option>)}</select>:
 f.type==='textarea'?<textarea required maxLength={2000} rows={3} value={draft[f.key]} onChange={e=>setDraft({...draft,[f.key]:e.target.value})}/>:
 <input required maxLength={160} type={f.type||'text'} step={f.key==='amount'?'0.01':undefined} min={f.key==='end'?draft.date:f.min} max={f.key==='date'&&page==='Expenses'?dateKey():f.max} value={draft[f.key]} onChange={e=>setDraft({...draft,[f.key]:e.target.value})}/>}</label>)}
 <div className="toolbar"><button type="button" className="secondary-btn" onClick={close}>Cancel</button><button className="primary-btn" type="submit">Save {page==='Admin'?'access request':page==='Expenses'?'claim':'record'}</button></div></form></Dialog>
}
function CalendarGrid({selected,select,events}:{selected:string;select:(s:string)=>void;events:RecordItem[]}){
 const d=new Date(selected+'T12:00:00'),y=d.getFullYear(),m=d.getMonth(),first=(new Date(y,m,1).getDay()+6)%7;
 const switchMonth=(step:number)=>select(dateKey(new Date(y,m+step,1)));
 return <section className="card"><div className="card-head"><h2>{d.toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</h2><div className="toolbar"><button className="secondary-btn" onClick={()=>select(dateKey())}>Today</button><button className="icon-button" aria-label="Previous month" onClick={()=>switchMonth(-1)}><ChevronLeft size={16}/></button><button className="icon-button" aria-label="Next month" onClick={()=>switchMonth(1)}><ChevronRight size={16}/></button></div></div>
 <div className="op-calendar">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=><small key={day}>{day}</small>)}{Array.from({length:first},(_,i)=><span key={'gap'+i}/>)}{Array.from({length:new Date(y,m+1,0).getDate()},(_,i)=>{const key=dateKey(new Date(y,m,i+1)),count=events.filter(e=>e.date===key).length;return <button key={key} className={count?'has-event':''} aria-pressed={key===selected} aria-label={dayLabel(key)+', '+count+' events'} onClick={()=>select(key)}>{i+1}{count>0&&<i aria-hidden="true"/>}</button>})}</div></section>
}
function Workspace({page,scope,notify,go}:Omit<Props,'page'>&{page:Operation}){
 const spec=specs[page],key='dpa:operations:'+scope+':'+page;
 const [records,setRecords]=useState(()=>readRecords(scope,page));
 const [filter,setFilter]=useState(''),[status,setStatus]=useState('All'),[selected,setSelected]=useState(''),[editing,setEditing]=useState(false),[day,setDay]=useState(dateKey());
 useEffect(()=>{const sync=(e:StorageEvent)=>{if(e.key===key)setRecords(readRecords(scope,page))};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[key,page,scope]);
 const tasks=tasksFor(scope),projects=page==='Projects'?projectList(tasks):[];
 const milestones:RecordItem[]=page==='Calendar'?tasks.filter(t=>t.status!=='Completed').map(t=>({id:t.id,title:t.title,date:dueDate(t.due),category:t.project,detail:t.deliverable,status:'Deadline'})):[];
 const planned:RecordItem[]=page==='Calendar'?readRecords(scope,'Projects').map(p=>({...p,id:'M-'+p.id,status:'Milestone'})):[];
 const all=[...records,...projects,...milestones,...planned],item=all.find(r=>r.id===selected),related=page==='Projects'?tasks.filter(t=>t.project===item?.title):[];
 const shown=all.filter(r=>(page!=='Calendar'||r.date===day)&&(status==='All'||r.status===status)&&[r.title,r.id,r.category,r.detail].join(' ').toLowerCase().includes(filter.toLowerCase()));
 const persist=(make:(latest:RecordItem[])=>RecordItem[],message:string)=>{
  try{const next=make(readRecords(scope,page));localStorage.setItem(key,JSON.stringify(next));setRecords(next);notify(message);return true}catch{notify('Unable to save this record. Check browser storage and try again.');return false}
 };
 const close=()=>{setSelected('');setEditing(false)};
 const update=(r:RecordItem,message:string)=>persist(latest=>[r,...latest.filter(x=>x.id!==r.id)],message);
 function save(d:Draft){
  const cleaned=Object.fromEntries(Object.entries(d).map(([k,v])=>[k,v?.trim()]));
  if(spec.fields.some(f=>!cleaned[f.key])){notify('Complete each field before saving.');return}
  const title=cleaned.title!;
  if(page==='Projects'&&all.some(p=>p.title.toLowerCase()===title.toLowerCase())){notify('A project with this name already exists.');return}
  const record:RecordItem={id:item?.id??page.slice(0,3).toUpperCase()+'-'+crypto.randomUUID().slice(0,8).toUpperCase(),title,detail:cleaned.detail!,category:cleaned.category!,date:d.date||dateKey(),status:page==='Performance'&&Number(d.progress)===100?'Completed':statuses[page]||'Pending'};
  if(d.end)record.end=d.end;if(d.amount)record.amount=Number(d.amount);if(d.progress)record.progress=Number(d.progress);
  if(update(record,page==='Admin'?'Access request recorded':page==='Expenses'?'Expense claim submitted':'Record saved')){setDay(record.date);setFilter('');setStatus('All');close()}
 }
 const course=page==='Learning'&&item?courses.find(c=>c.title===item.title):undefined;
 const courseStep=item?.progress??0;
 const isLocalEvent=page==='Calendar'&&records.some(r=>r.id===selected);
 return <div className="module ops-module"><div className="op-heading"><div><h1>{spec.title}</h1><p>{spec.description}</p></div>{spec.create&&<button className="primary-btn" onClick={()=>{setSelected('');setEditing(true)}}><Plus size={16}/>{spec.create}</button>}</div>
 {page==='Admin'&&<div className="op-shortcuts">{[['Directory','People directory'],['Projects','Project portfolio'],['Documents','Policies & controls'],['Payroll','Pay statements']].map(([target,label])=><button key={target} className="secondary-btn" onClick={()=>go(target)}>{label}<ChevronRight size={15}/></button>)}</div>}
 {page==='Calendar'?<CalendarGrid selected={day} select={setDay} events={all}/>:<div className="op-summary">
 {(page==='Expenses'?[['Submitted claims',String(all.length)],['Awaiting approval',currency(all.filter(r=>r.status==='Pending').reduce((v,r)=>v+(r.amount||0),0))],['Reimbursed',currency(all.filter(r=>r.status==='Reimbursed').reduce((v,r)=>v+(r.amount||0),0))]]:
 page==='Projects'?[['Programmes',String(all.length)],['Assigned tasks',String(tasks.length)],['At risk',String(projects.filter(p=>p.status==='At risk').length)]]:
 page==='Learning'?[['Assigned courses',String(all.length)],['Completed',String(all.filter(r=>r.status==='Completed').length)]]:
 page==='Performance'?[['Objectives & reviews',String(all.length)],['Completed',String(all.filter(r=>r.status==='Completed').length)]]:
 page==='Benefits'?[['Programmes',String(all.length)],['Enrolled',String(all.filter(r=>r.status==='Active').length)]]:
 [['Total records',String(all.length)],['Awaiting review',String(all.filter(r=>r.status==='Pending').length)]]).map(([label,value])=><div className="card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}
 <section className="card"><div className="card-head"><h2>{page==='Calendar'?dayLabel(day):spec.list}</h2><button className="secondary-btn" onClick={()=>{exportRecords(page,shown);notify('Report downloaded')}}><Download size={15}/>Export</button></div>
 {page!=='Calendar'&&<div className="op-filters"><label><Search size={16}/><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder={'Search '+spec.list.toLowerCase()} aria-label={'Search '+spec.list}/></label><select aria-label="Filter status" value={status} onChange={e=>setStatus(e.target.value)}><option value="All">All statuses</option>{[...new Set(all.map(r=>r.status))].map(s=><option key={s}>{s}</option>)}</select></div>}
 <div className="op-list">{shown.map(r=><button className="op-record" key={r.id} onClick={()=>setSelected(r.id)}><span className="op-symbol">{page==='Calendar'?<CalendarDays size={18}/>:page==='Learning'?<BookOpen size={18}/>:<FolderKanban size={18}/>}</span><span className="op-name"><strong>{r.title}</strong><small>{r.category} · {r.id}</small></span><span className="op-metric">{r.amount!==undefined?currency(r.amount):page==='Performance'||page==='Projects'?(r.progress??0)+'%':dayLabel(r.date)}</span><span className="badge" data-status={r.status.toLowerCase()}>{r.status}</span><ChevronRight size={15}/></button>)}
 {!shown.length&&<p className="op-empty">{page==='Calendar'?'No events scheduled for this day.':filter||status!=='All'?'No records match your search.':'No records yet. New requests will appear here.'}</p>}</div></section>
 {page==='Travel'&&<section className="card"><div className="card-head"><h2>Travel policy</h2></div><p>Book economy for flights under four hours. Hotel allowance is ₹6,000 per night. Retain itemised receipts for reimbursement.</p><button className="secondary-btn" onClick={()=>go('Support')}>Contact travel support</button></section>}
 {page==='Benefits'&&<button className="secondary-btn" onClick={()=>go('Support')}>Contact People Operations</button>}
 {editing?<Editor page={page} initialDate={page==='Calendar'?day:dateKey()} existing={item} onSave={save} close={close}/>:item&&<Dialog title={item.title} close={close}><div className="op-detail"><span className="badge" data-status={item.status.toLowerCase()}>{item.status}</span><p>{item.detail}</p><dl><dt>Reference</dt><dd>{item.id}</dd><dt>Category</dt><dd>{item.category}</dd><dt>{page==='Travel'?'Itinerary':'Date'}</dt><dd>{dayLabel(item.date)}{item.end?' – '+dayLabel(item.end):''}</dd>{item.amount!==undefined&&<><dt>Claim amount</dt><dd>{currency(item.amount)}</dd></>}{item.progress!==undefined&&!course&&<><dt>Progress</dt><dd>{item.progress}%</dd></>}</dl>
 {course&&<><h3>Course syllabus</h3><ol>{course.lessons.map(([title],i)=><li key={title}>{title} {i<courseStep?'· Completed':''}</li>)}</ol>{courseStep<course.lessons.length&&<div className="op-lesson"><h3>{course.lessons[courseStep][0]}</h3><p>{course.lessons[courseStep][1]}</p><button className="primary-btn" onClick={()=>update({...item,progress:courseStep+1,status:courseStep+1===course.lessons.length?'Completed':'In progress'},'Lesson completed')}>Mark lesson complete</button></div>}</>}
 {related.length>0&&<><h3>Assigned deliverables</h3><ul>{related.map(t=><li key={t.id}>{t.title} · {t.progress}%</li>)}</ul><button className="secondary-btn" onClick={()=>go('My Work')}>Open work queue</button></>}
 {item.status==='Deadline'&&<button className="secondary-btn" onClick={()=>go('My Work')}>Open work queue</button>}
 {item.status==='Milestone'&&<button className="secondary-btn" onClick={()=>go('Projects')}>Open portfolio</button>}
 {(page==='Performance'||isLocalEvent)&&<button className="primary-btn" onClick={()=>setEditing(true)}>Edit {page==='Calendar'?'event':'objective'}</button>}
 {page==='Benefits'&&item.status==='Eligible'&&<button className="primary-btn" onClick={()=>update({...item,status:'Pending'},'Enrollment requested')}>Request enrollment</button>}
 {page==='Assets'&&item.status!=='Pending'&&<button className="secondary-btn" onClick={()=>go('Support')}>Contact IT service desk</button>}
 {item.status==='Pending'&&<button className="secondary-btn" onClick={()=>update({...item,status:page==='Benefits'?'Eligible':'Withdrawn'},'Request withdrawn')}>Withdraw request</button>}
 </div></Dialog>}</div>
}
export default function Operations(props:Props){
 if(!(props.page in specs))return null;
 return <Workspace key={props.scope+props.page} {...props} page={props.page as Operation}/>
}
