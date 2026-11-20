import {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import type {Session} from '@supabase/supabase-js';
import {Bell,CheckCheck,ChevronRight,Clock3,Download,LogOut,Menu,Moon,PanelLeftClose,PanelLeftOpen,Search,Settings,Sun,UserRound,X} from 'lucide-react';
import {configured,supabase,supabaseAuth} from './lib/supabase';
import {bulletins,dateKey,documents,downloadDoc,employees,readData,storeKey,type Update} from './model';
import {currentPage,groups,routes} from './navigation';
import Dialog from './Dialog';
import EntryScreen from './Entry';
import Dashboard from './Dashboard';
import {TimeOffice,LeaveForm,TimeForm} from './TimeOffice';
import {Services,SecurityForm,Payslip,PersonDetails} from './Services';
import Resources from './Resources';
import Operations from './Operations';
import MyWork from './WorkItems';
import './portal.css';
import './shell.css';
import './workplace.css';

function App(){
  const [session,setSession]=useState<Session|null>(null);
  const [ready,setReady]=useState(!configured);
  const [local,setLocal]=useState(localStorage.getItem('dpa_local_access')==='1');
  useEffect(()=>{
    if(!configured)return;
    let active=true;
    supabaseAuth.auth.getSession().then(({data})=>{if(active){setSession(data.session);setReady(true)}}).catch(()=>{if(active)setReady(true)});
    const {data}=supabaseAuth.auth.onAuthStateChange((_,next)=>{if(active){setSession(next);setReady(true)}});
    return ()=>{active=false;data.subscription.unsubscribe()};
  },[]);
  if(!ready)return <main aria-busy="true" className="loading-page"><img src="/mark.svg" alt="Decimal Point Analytics"/><p>Loading employee workspace…</p><div className="skeleton"/></main>;
  if(!session&&!local)return <EntryScreen onLocalAccess={()=>{localStorage.setItem('dpa_local_access','1');setLocal(true)}}/>;
  return <Workspace key={session?.user.id||'local'} session={session} signOut={async()=>{
    if(session){const {error}=await supabaseAuth.auth.signOut();if(error)throw error}
    localStorage.removeItem('dpa_local_access');sessionStorage.removeItem('dpa_login_at');setLocal(false);setSession(null);
  }}/>;
}
function Elapsed({start}:{start:number}){
  const [now,setNow]=useState(Date.now);
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return ()=>clearInterval(timer)},[]);
  const seconds=Math.max(0,Math.floor((now-start)/1000));
  return <time>{[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':')}</time>;
}
function Workspace({session,signOut}:{session:Session|null;signOut:()=>Promise<void>}){
  const scope=session?.user.id||'local';
  const accountProfile = session ? {
    email:session.user.email||'', department:session.user.user_metadata.department||'',
    role:session.user.user_metadata.job_title||'', location:session.user.user_metadata.location||''
  } : {};
  const [savedData,setData]=useState(()=>readData(scope));
  const data={...savedData,profile:{...accountProfile,...savedData.profile} as Record<string,string>};
  const [page,setPage]=useState(currentPage);
  const [theme,setTheme]=useState(localStorage.getItem('dpa_theme')==='dark'?'dark':'light');
  const [compact,setCompact]=useState(localStorage.getItem('dpa_sidebar_collapsed')==='1');
  const [mobile,setMobile]=useState(false);
  const [dialog,show]=useState(''),[query,setQuery]=useState(''),[pop,setPop]=useState('');
  const [toast,setToast]=useState(''),toastTimer=useRef(0);
  const [connection,setConnection]=useState(session?'Checking connection':'Local workspace');
  const [loginAt]=useState(()=>{const old=sessionStorage.getItem('dpa_login_at');const t=old?Date.parse(old):Date.now();sessionStorage.setItem('dpa_login_at',new Date(t).toISOString());return t});
  const header=useRef<HTMLElement>(null);
  const rail=useRef<HTMLElement>(null),menuButton=useRef<HTMLButtonElement>(null);
  const notify=(message:string)=>{clearTimeout(toastTimer.current);setToast(message);toastTimer.current=window.setTimeout(()=>setToast(''),3200)};
  useEffect(()=>()=>clearTimeout(toastTimer.current),[]);
  useEffect(()=>{if(!session)return;let active=true;supabase.from('projects').select('id').limit(1).then(({error})=>{if(active)setConnection(error?'Data service offline':'Connected to workspace')});return ()=>{active=false}},[session]);
  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('dpa_theme',theme)},[theme]);
  useEffect(()=>{localStorage.setItem('dpa_sidebar_collapsed',compact?'1':'0')},[compact]);
  useEffect(()=>{const refresh=()=>{setPage(currentPage());show('');setMobile(false);setPop('');window.scrollTo(0,0)};window.addEventListener('hashchange',refresh);return ()=>window.removeEventListener('hashchange',refresh)},[]);
  useEffect(()=>{localStorage.setItem('dpa_last_section',page);document.title=(routes.find(([id])=>id===page)?.[1]||page)+' · Decimal Point Analytics'},[page]);
  useEffect(()=>{const onStorage=(e:StorageEvent)=>{if(e.key===storeKey(scope))setData(readData(scope));if(e.key==='dpa_theme')setTheme(e.newValue==='dark'?'dark':'light')};window.addEventListener('storage',onStorage);return ()=>window.removeEventListener('storage',onStorage)},[scope]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPop('');setMobile(false);setQuery('');show('search')}if(e.key==='Escape'){setPop('');setMobile(false)}};const outside=(e:PointerEvent)=>{if(!header.current?.contains(e.target as Node))setPop('')};document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);return ()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside)}},[]);
  useEffect(()=>{if(!mobile)return;const prev=document.body.style.overflow;document.body.style.overflow='hidden';rail.current?.querySelector('button')?.focus();return ()=>{document.body.style.overflow=prev;menuButton.current?.focus()}},[mobile]);
  const update:Update=fn=>{
    try{const current=localStorage.getItem(storeKey(scope))?readData(scope):data;const next=fn(current);localStorage.setItem(storeKey(scope),JSON.stringify(next));setData(next)}
    catch{notify('Unable to save. Check available browser storage.');throw new Error('Browser storage unavailable')}
  };
  const go=(id:string)=>{if(!routes.some(([key])=>key===id))return;show('');setPop('');setMobile(false);setPage(id);location.hash=encodeURIComponent(id);window.scrollTo(0,0)};
  const launch=(id:string)=>{setPop('');setMobile(false);setQuery('');show(id)};
  const close=()=>show('');
  const mark=(id:string)=>update(d=>({...d,read:[...new Set([...d.read,id])]}));
  const punch=()=>{const now=Date.now();update(d=>d.shift?{...d,shift:null,shifts:[{id:crypto.randomUUID(),start:d.shift,end:now},...d.shifts]}:{...d,shift:now});notify(data.shift?'Shift recorded':'Punched in')};
  const toggleTheme=()=>{setTheme(theme==='dark'?'light':'dark');notify('Theme updated')};
  const logOut=()=>void signOut().catch(()=>notify('Sign-out failed. Please try again.'));
  const name=data.profile.name||session?.user.user_metadata.full_name||session?.user.email?.split('@')[0]||'Mahesh Shirsath';
  const unread=bulletins.filter(b=>!data.read.includes(b.id));
  const label=routes.find(([key])=>key===page)?.[1]||page;
  const group=groups.find(g=>g.items.some(([id])=>id===page))?.label;
  const [kind,...tail]=dialog.split(':'),value=tail.join(':');
  const doc=documents.find(d=>d.title===value),bulletin=bulletins.find(b=>b.id===value);
  const results=[...routes.map(([id,title])=>({title,kind:'Module',run:()=>go(id)})),...employees.map(p=>({title:p.name,kind:p.department,run:()=>launch('person:'+p.id)})),...documents.map(d=>({title:d.title,kind:'Policy',run:()=>launch('doc:'+d.title)}))].filter(i=>(i.title+' '+i.kind).toLowerCase().includes(query.toLowerCase()));
  const shared={data,update,notify,launch,page};
  const period=value||dateKey(new Date(new Date().getFullYear(),new Date().getMonth(),0)).slice(0,7);
  const modalTitle=({search:'Search workspace',leave:'Apply for leave',time:'Log timesheet',pay:'Payslip preview',person:'Employee profile',doc:doc?.title,bulletin:bulletin?.title} as Record<string,string|undefined>)[kind]||'Details';
  return <div className={'portal-shell'+(compact?' compact':'')}>
    {mobile&&<button className="rail-backdrop" tabIndex={-1} aria-label="Dismiss navigation" onClick={()=>setMobile(false)}/>}
    <aside ref={rail} className={'rail'+(mobile?' open':'')} onKeyDown={e=>{if(mobile&&e.key==='Tab'){const all=rail.current!.querySelectorAll('button');if(e.shiftKey&&document.activeElement===all[0]){e.preventDefault();all[all.length-1].focus()}else if(!e.shiftKey&&document.activeElement===all[all.length-1]){e.preventDefault();all[0].focus()}}}}>
      <div className="rail-brand"><img src="/mark.svg" alt=""/><div><strong>Decimal Point Analytics</strong><small>Employee Portal</small></div>{mobile&&<button className="icon-button" aria-label="Close navigation" onClick={()=>setMobile(false)}><X size={16}/></button>}</div>
      <nav className="rail-nav" aria-label="Workspace navigation">{groups.map(g=><section className="rail-group" key={g.label}><h3>{g.label}</h3>{g.items.map(([id,title,Icon])=><button key={id} title={title} aria-label={title} aria-current={page===id?'page':undefined} onClick={()=>go(id)}><Icon/><span>{title}</span>{id==='Announcements'&&unread.length>0&&<em>{unread.length}</em>}</button>)}</section>)}</nav>
      <div className="rail-foot"><button title={compact?'Expand navigation':'Collapse navigation'} className="desktop-toggle" onClick={()=>setCompact(!compact)}>{compact?<PanelLeftOpen/>:<PanelLeftClose/>}<span>Collapse sidebar</span></button><button title="Sign out" onClick={logOut}><LogOut/><span>Sign out</span></button></div>
    </aside>
    <main className="portal-main"><header className="utility" ref={header}><div><button ref={menuButton} className="mobile-menu" aria-label="Open navigation" aria-expanded={mobile} onClick={()=>setMobile(true)}><Menu size={18}/></button><div className="crumb"><span>{group}</span><ChevronRight size={14}/><b>{label}</b></div></div>
      <div className="tools"><button className="command-trigger" aria-label="Search workspace" onClick={()=>launch('search')}><Search size={16}/><span>Search workspace</span><kbd>Ctrl K</kbd></button>
        <button className="shift-button" aria-label={data.shift?'Punch out':'Punch in'} title={data.shift?'Punch out':'Punch in'} onClick={punch}><Clock3 size={15}/>{data.shift?<Elapsed start={data.shift}/>:<span>Punch in</span>}</button>
        <button className="icon-button bell-button" title="Notifications" aria-label="Notifications" aria-expanded={pop==='bell'} onClick={()=>setPop(pop==='bell'?'':'bell')}><Bell size={17}/>{!!unread.length&&<i/>}</button>
        <button className="icon-button" aria-label={theme==='dark'?'Use light theme':'Use dark theme'} onClick={toggleTheme}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}</button>
        <button className="avatar" aria-label="Open profile menu" aria-expanded={pop==='profile'} onClick={()=>setPop(pop==='profile'?'':'profile')}>{name.split(' ').map((s:string)=>s[0]).slice(0,2).join('')}</button></div>
      {pop==='bell'&&<section className="utility-pop"><div className="pop-head"><b>Notifications</b><button disabled={!unread.length} onClick={()=>update(d=>({...d,read:bulletins.map(b=>b.id)}))}><CheckCheck size={15}/>Mark all read</button></div>{bulletins.map(b=><div className="notice-row" key={b.id}><button onClick={()=>{mark(b.id);launch('bulletin:'+b.id)}}><small>{b.category}</small>{b.title}</button>{!data.read.includes(b.id)&&<button title="Mark as read" aria-label={'Mark '+b.title+' as read'} onClick={()=>mark(b.id)}><CheckCheck size={15}/></button>}</div>)}</section>}
      {pop==='profile'&&<section className="utility-pop profile-menu"><strong>{name}</strong><small>{connection} · Session <Elapsed start={loginAt}/></small><button onClick={()=>go('Profile')}><UserRound size={16}/>My profile</button><button onClick={()=>go('Settings')}><Settings size={16}/>Settings</button><button onClick={logOut}><LogOut size={16}/>Sign out</button></section>}
    </header><div className="workspace-body" key={page}>
      {page==='Overview'?<Dashboard data={data} name={name} go={go} launch={launch}/>:
       ['Attendance','Timesheet','Leave'].includes(page)?<TimeOffice {...shared} punch={punch}/>:
       ['Payroll','Directory','Profile','Support'].includes(page)?<Services {...shared} name={name} authenticated={!!session}/>:
       ['Announcements','Documents'].includes(page)?<Resources {...shared} scope={scope}/>:
       page==='Settings'?<Preferences scope={scope} theme={theme} toggle={toggleTheme} authenticated={!!session} notify={notify}/>:
       page==='My Work'?<div className="module work-items"><MyWork scope={scope} notify={notify}/></div>:
       <Operations page={page} scope={scope} notify={notify} go={go}/>}
    </div></main>
    {dialog&&<Dialog key={dialog} title={modalTitle} close={close} drawer={kind==='person'}>
      {kind==='search'?<><input autoFocus className="command-input" aria-label="Search modules, people and policies" placeholder="Search modules, people and policies" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')results[0]?.run()}}/><div className="command-results">{results.map(r=><button key={r.kind+r.title} onClick={r.run}><span>{r.title}</span><small>{r.kind}</small></button>)}{!results.length&&<p>No matching modules, people or policies.</p>}</div></>:
      kind==='leave'?<LeaveForm {...shared} close={close}/>:kind==='time'?<TimeForm {...shared} close={close}/>:
      kind==='pay'?<Payslip name={name} period={period}/>:kind==='person'?<PersonDetails id={value}/>:
      kind==='doc'&&doc?<><p className="document-body">{doc.body}</p><button className="primary-btn" onClick={()=>downloadDoc(doc.title)}><Download size={16}/>Download policy</button></>:
      bulletin?<><small>{bulletin.category}</small><p className="document-body">{bulletin.body}</p><button className="secondary-btn" onClick={()=>{mark(bulletin.id);close()}}>Mark as read</button></>:null}
    </Dialog>}
    {toast&&<div className="toast" role="status">{toast}</div>}
  </div>;
}
function Preferences({scope,theme,toggle,authenticated,notify}:{scope:string;theme:string;toggle:()=>void;authenticated:boolean;notify:(s:string)=>void}){
  const key=scope==='local'?'dpa_prefs':'dpa_prefs:'+scope;
  const [prefs,setPrefs]=useState<Record<string,boolean>>(()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}});
  return <div className="module stack"><h1>Settings</h1><section className="card stack"><h2>Workspace preferences</h2><div className="row"><span>Appearance</span><button className="secondary-btn" onClick={toggle}>{theme==='dark'?'Switch to light':'Switch to dark'}</button></div>{[['desktop','Task notifications'],['digest','Weekly digest'],['calendar','Calendar reminders'],['updates','Product updates']].map(([id,title])=><label className="row" key={id}>{title}<input type="checkbox" checked={prefs[id]??id!=='updates'} onChange={e=>{const next={...prefs,[id]:e.target.checked};localStorage.setItem(key,JSON.stringify(next));setPrefs(next);notify('Preference saved')}}/></label>)}</section><section className="card"><SecurityForm authenticated={authenticated} notify={notify}/></section></div>
}
createRoot(document.getElementById('root')!).render(<App/>);
