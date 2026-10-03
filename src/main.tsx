import React,{useEffect,useState}from'react';import{createRoot}from'react-dom/client';import{LayoutDashboard,Users,Briefcase,CheckSquare,CalendarDays,Clock3,FileText,Bell,Headphones,Settings,Search,ChevronRight,ArrowUpRight,TrendingUp,ShieldCheck,Menu,X,LogOut,Building2,MapPin,Mail,Phone,Globe2,Plus,Download,MoreHorizontal,GraduationCap,WalletCards,Laptop2,Target,FileCheck,Command,MessageSquare,FolderKanban,ReceiptText,HeartHandshake,PlaneTakeoff,SlidersHorizontal,Sparkles,CheckCircle2,AlertTriangle,ArrowDownRight,UsersRound,CreditCard,Landmark,CircleDollarSign,Network,BarChart3}from'lucide-react';import'./styles.css';
import { supabase, supabaseAuth } from './lib/supabase';

type Section='Overview'|'My Work'|'Projects'|'Attendance'|'Timesheet'|'Leave'|'Documents'|'Directory'|'Calendar'|'Announcements'|'Performance'|'Learning'|'Expenses'|'Payroll'|'Benefits'|'Travel'|'Assets'|'Support'|'Profile'|'Settings'|'Admin';
const nav:[Section,string,any][]=[
  ['Overview','Overview',LayoutDashboard],
  ['My Work','My Work',Briefcase],
  ['Projects','Projects & Delivery',FolderKanban],
  ['Calendar','Calendar',CalendarDays],
  ['Attendance','Attendance',Clock3],
  ['Timesheet','Timesheet',CheckSquare],
  ['Leave','Leave & Holidays',CalendarDays],
  ['Documents','Documents',FileText],
  ['Directory','Company Directory',UsersRound],
  ['Performance','Performance',Target],
  ['Learning','Learning Hub',GraduationCap],
  ['Expenses','Expenses',WalletCards],
  ['Payroll','Payroll',Landmark],
  ['Benefits','Benefits & Perks',HeartHandshake],
  ['Travel','Business Travel',PlaneTakeoff],
  ['Assets','My Assets',Laptop2],
  ['Announcements','Announcements',Bell],
  ['Support','Service Desk',Headphones],
  ['Profile','My Profile',Users],
  ['Settings','Settings',SlidersHorizontal],
  ['Admin','Admin Center',ShieldCheck]
];
const dayBucket=Math.floor(Date.now()/(5*24*60*60*1000));
const today=new Date();
const dateLabel=(d:Date)=>d.toLocaleDateString('en-US',{month:'short',day:'2-digit'});
const longDateLabel=(d:Date)=>d.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',year:'numeric'});
const workDay=(offset:number)=>{const d=new Date();d.setDate(d.getDate()+offset);return dateLabel(d)};
const longWorkDay=(offset:number)=>{const d=new Date();d.setDate(d.getDate()+offset);return longDateLabel(d)};
function useLiveClock(){const[now,setNow]=useState(()=>new Date());useEffect(()=>{const id=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(id)},[]);return now}
const taskDue=(offset:number)=>{const d=new Date(today);d.setDate(d.getDate()+offset+((dayBucket%3)*2));return dateLabel(d)};
const progress=(base:number)=>Math.min(99,base+((dayBucket%5)*3));
const tasks=[['Client data quality review','Analytics Platform',dayBucket%2===0?'Today':taskDue(2),'High',progress(72)+'%'],['Quarterly dashboard refresh','Risk Analytics',taskDue(4),'Medium',progress(41)+'%'],['Model validation pack','Quant Research',taskDue(7),'High',progress(18)+'%'],['Knowledge base update','Internal',taskDue(10),'Low',progress(86)+'%']];
const people=[['AS','Ananya Shah','VP · Analytics','Mumbai'],['RK','Rohan Kulkarni','Senior Analyst','Pune'],['PN','Priya Nair','Project Manager','Bengaluru'],['VM','Vikram Mehta','Data Engineer','Mumbai'],['SI','Sneha Iyer','HR Business Partner','Pune'],['AD','Amit Deshmukh','Team Lead','Nashik']];
const activities=[['09:42','Completed','Client data quality review'],['09:10','Updated','Quarterly dashboard refresh'],['Yesterday','Approved','Leave request · 2 days'],['Yesterday','Uploaded','Project charter v3.pdf']];
function App(){
  const[section,setSection]=useState<Section>('Overview');
  const[open,setOpen]=useState(false);
  const[query,setQuery]=useState('');
  const[toast,setToast]=useState('');
  const[dbStatus,setDbStatus]=useState('checking');
  const[session,setSession]=useState<any>(null);
  const[demoMode,setDemoMode]=useState(()=>localStorage.getItem('dpa_demo_mode')==='1');
  const[authLoading,setAuthLoading]=useState(true);
  const[commandOpen,setCommandOpen]=useState(false);
  const[noticeOpen,setNoticeOpen]=useState(false);
  const[profileOpen,setProfileOpen]=useState(false);
  const[action,setAction]=useState<string|null>(null);
  const now=useLiveClock();
  const[loginAt]=useState(()=>sessionStorage.getItem('dpa_login_at')||new Date().toISOString());
  useEffect(()=>{if(!sessionStorage.getItem('dpa_login_at'))sessionStorage.setItem('dpa_login_at',loginAt)},[loginAt]);
  const sessionSeconds=Math.max(0,Math.floor((now.getTime()-new Date(loginAt).getTime())/1000));
  const hh=String(Math.floor(sessionSeconds/3600)).padStart(2,'0');
  const mm=String(Math.floor((sessionSeconds%3600)/60)).padStart(2,'0');
  const ss=String(sessionSeconds%60).padStart(2,'0');

  useEffect(()=>{
    let active=true;
    (async()=>{
      const{data}=await supabaseAuth.auth.getSession();
      if(active){setSession(data.session);setAuthLoading(false);}
    })();
    const{data:listener}=supabaseAuth.auth.onAuthStateChange((_event,nextSession)=>{
      setSession(nextSession);
      setAuthLoading(false);
    });
    return()=>{active=false;listener.subscription.unsubscribe();};
  },[]);

  useEffect(()=>{
    let active=true;
    (async()=>{
      try{
        const{error}=await supabase.from('projects').select('id').limit(1);
        if(active)setDbStatus(error?'offline':'connected');
      }catch{
        if(active)setDbStatus('offline');
      }
    })();
    return()=>{active=false;};
  },[]);

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
        e.preventDefault();
        setCommandOpen(true);
      }
      if(e.key==='Escape'){
        setCommandOpen(false);
        setNoticeOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown',onKey);
    return()=>window.removeEventListener('keydown',onKey);
  },[]);

  const notify=(message:string)=>{
    setToast(message);
    setTimeout(()=>setToast(''),2200);
    if(/opened$|started$|requested$/.test(message)){
      setAction(message.replace(/\s+(opened|started|requested)$/,''));
    }
  };

  if(authLoading){
    return <div className="auth-shell"><div className="auth-card"><div className="mark">D</div><h1>Decimal Point Analytics</h1><p>Loading secure workspace…</p></div></div>;
  }

  if(!session&&!demoMode){
    return <AuthScreen onDemo={()=>{
      localStorage.setItem('dpa_demo_mode','1');
      setDemoMode(true);
    }}/>;
  }

  const signOut=async()=>{
    await supabaseAuth.auth.signOut().catch(()=>{});
    localStorage.removeItem('dpa_demo_mode');
    setDemoMode(false);
    notify('Signed out safely');
  };

  return <div className="app">
    <aside className={open?'side open':'side'}>
      <div className="brand">
        <div className="mark">D</div>
        <div><b>DECIMAL POINT</b><span>ANALYTICS</span></div>
        <button className="close" onClick={()=>setOpen(false)}><X/></button>
      </div>

      <div className="workspace">
        <span>WORKSPACE</span>
        <strong>Mahesh Shirsath</strong>
        <small>Employee · Analytics</small>
      </div>

      <nav>
        {nav.map(([key,label,Icon],index)=>{
          const group=index===0?'WORKSPACE':index===4?'TIME & PEOPLE':index===9?'GROWTH':index===12?'FINANCE & WORKPLACE':index===16?'COMPANY':index===18?'ACCOUNT':index===20?'ADMINISTRATION':'';
          return <React.Fragment key={key}>
            {group&&<div className="nav-section-label">{group}</div>}
            <button
              className={section===key?'active':''}
              onClick={()=>{setSection(key);setOpen(false);}}
            >
              <Icon size={18}/>
              <span>{label}</span>
              {key==='Announcements'&&<em>3</em>}
            </button>
          </React.Fragment>;
        })}
      </nav>

      <div className="sidebottom">
        <div className="secure">
          <ShieldCheck size={17}/>
          <div><b>Secure workspace</b><span>Database online</span></div>
        </div>
        <button onClick={signOut}><LogOut size={17}/>Sign out</button>
      </div>
    </aside>

    <main>
      <header>
        <button className="hamb" onClick={()=>setOpen(true)}><Menu/></button>

        <div className="crumb">
          <span>Employee Portal</span>
          <ChevronRight size={15}/>
          <b>{section}</b>
        </div>

        <div className="head-actions">
          <div className="live-clock"><Clock3 size={15}/><div><b>{now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})}</b><span>{now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span></div></div>
          <div className="session-pill"><span>SESSION</span><b>{hh}:{mm}:{ss}</b></div>
          <button className="command-trigger" onClick={()=>setCommandOpen(true)}>
            <Search size={16}/><span>Search workspace...</span><kbd>⌘ K</kbd>
          </button>
          <button className="iconbtn header-icon" onClick={()=>setNoticeOpen(v=>!v)}>
            <Bell size={19}/><i>3</i>
          </button>
          <button className="avatar profile-trigger" onClick={()=>setProfileOpen(v=>!v)}>MS</button>
        </div>

        {noticeOpen&&<div className="header-popover notifications">
          <div className="popover-head"><b>Notifications</b><span>3 new</span></div>
          <div className="notice"><div className="notice-dot"></div><div><b>Task due soon</b><span>Client data quality review · Today</span></div></div>
          <div className="notice"><div className="notice-dot"></div><div><b>Leave approved</b><span>Your October leave request was approved.</span></div></div>
          <div className="notice"><div className="notice-dot"></div><div><b>Security training</b><span>Annual awareness module is due this week.</span></div></div>
          <button className="popover-link" onClick={()=>{setNoticeOpen(false);setSection('Announcements');}}>View all notifications</button>
        </div>}

        {profileOpen&&<div className="header-popover profile-popover">
          <div className="profile-pop-head">
            <div className="avatar">MS</div>
            <div><b>Mahesh Shirsath</b><span>Employee · Analytics</span></div>
          </div>
          <button onClick={()=>{setProfileOpen(false);setSection('Profile');}}><Users size={15}/> My profile</button>
          <button onClick={()=>{setProfileOpen(false);notify('Preferences opened');}}><Settings size={15}/> Preferences</button>
          <button onClick={signOut}><LogOut size={15}/> Sign out</button>
        </div>}
      </header>

      <div className="content">
        {section==='Overview'?<Overview notify={notify} setSection={setSection}/>:
         section==='My Work'?<MyWork query={query} notify={notify}/>:
         section==='Projects'?<Projects notify={notify}/>:
         section==='Directory'?<Directory query={query} notify={notify}/>:
         section==='Attendance'?<Attendance notify={notify}/>:
         section==='Timesheet'?<Timesheet notify={notify}/>:
         section==='Leave'?<Leave notify={notify}/>:
         section==='Documents'?<Documents notify={notify}/>:
         section==='Calendar'?<Calendar/>:
         section==='Announcements'?<Announcements notify={notify}/>:
         section==='Performance'?<Performance notify={notify}/>:
         section==='Learning'?<Learning notify={notify}/>:
         section==='Expenses'?<Expenses notify={notify}/>:
         section==='Payroll'?<Payroll notify={notify}/>:
         section==='Benefits'?<Benefits notify={notify}/>:
         section==='Travel'?<Travel notify={notify}/>:
         section==='Assets'?<Assets notify={notify}/>:
         section==='Support'?<Support notify={notify}/>:
         section==='Profile'?<Profile notify={notify}/>:
         section==='Settings'?<SettingsPage notify={notify}/>:
         <Admin notify={notify}/>}
      </div>
    </main>

    {commandOpen&&<div className="command-overlay" onClick={()=>setCommandOpen(false)}>
      <div className="command-palette" onClick={e=>e.stopPropagation()}>
        <div className="command-search">
          <Search size={18}/>
          <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search pages, people and actions..."/>
          <kbd>ESC</kbd>
        </div>
        <div className="command-label">Quick navigation</div>
        {nav.slice(0,15).map(([key,label,Icon])=><button key={key} onClick={()=>{setSection(key);setCommandOpen(false);}}>
          <Icon size={17}/><span>{label}</span><ChevronRight size={15}/>
        </button>)}
        <div className="command-footer"><Command size={13}/> Command palette <span>Ctrl K</span></div>
      </div>
    </div>}

    {toast&&<div className="toast">✓ {toast}</div>}{action&&<ActionCenter title={action} onClose={()=>setAction(null)} notify={notify}/>} 
  </div>;
}

function AuthScreen({onDemo}:{onDemo:()=>void}){const[mode,setMode]=useState<'signin'|'signup'>('signin');const[name,setName]=useState('');const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[busy,setBusy]=useState(false);const[message,setMessage]=useState('');const[diagnostic,setDiagnostic]=useState<'checking'|'reachable'|'unreachable'>('checking');const[diagnosticText,setDiagnosticText]=useState('Checking Supabase Auth…');const authDirectUrl=(import.meta.env.VITE_SUPABASE_URL as string|undefined)||'';useEffect(()=>{let active=true;(async()=>{try{const controller=new AbortController();const timer=window.setTimeout(()=>controller.abort(),7000);const res=await fetch(authDirectUrl+'/auth/v1/health',{method:'GET',headers:{apikey:(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string|undefined)||''},signal:controller.signal});window.clearTimeout(timer);if(!res.ok)throw new Error('HTTP '+res.status);if(active){setDiagnostic('reachable');setDiagnosticText('Supabase Auth is reachable directly.')}}catch(error:any){if(active){setDiagnostic('unreachable');setDiagnosticText(error?.name==='AbortError'?'Supabase Auth check timed out.':error?.message||'Supabase Auth could not be reached directly.')}}})();return()=>{active=false}},[authDirectUrl]);const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setMessage('');try{if(mode==='signup'){if(password.length<6){setMessage('Password must be at least 6 characters.');setBusy(false);return}const {data,error}=await supabaseAuth.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim()||email.split('@')[0]}}});if(error)throw error;setMessage(data.session?'Account created.':'Account created. Check your email to confirm it, then sign in.')}else{const {error}=await supabaseAuth.auth.signInWithPassword({email:email.trim(),password});if(error)throw error}}catch(error:any){const raw=error?.message||'Authentication failed.';setMessage(raw==='Failed to fetch'?'Failed to fetch — the browser could not reach Supabase Auth. Use the diagnostic status below to identify whether this is a network/service issue.':raw)}finally{setBusy(false)}};return <div className="auth-shell"><div className="auth-card"><div className="auth-brand"><div className="mark">D</div><div><b>DECIMAL POINT</b><span>ANALYTICS</span></div></div><div className="auth-eyebrow">SECURE EMPLOYEE PORTAL</div><h1>{mode==='signin'?'Welcome back':'Create your employee account'}</h1><p className="auth-sub">{mode==='signin'?'Sign in to access your Decimal Point Analytics workspace.':'Create an account to access the employee workspace.'}</p><form onSubmit={submit}>{mode==='signup'&&<label>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Mahesh Shirsath" required/></label>}<label>Work email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" minLength={6} required/></label>{message&&<div className="auth-message">{message}</div>}<button className="primary auth-submit" disabled={busy}>{busy?'Please wait…':mode==='signin'?'Sign in':'Create account'}</button></form><button className="auth-switch" onClick={()=>{setMode(mode==='signin'?'signup':'signin');setMessage('')}}>{mode==='signin'?'Need an account? Create one':'Already have an account? Sign in'}</button><div className="auth-diagnostic"><span className={diagnostic}></span><div><b>Auth connection</b><small>{diagnosticText}</small></div></div><button type="button" className="auth-switch" onClick={onDemo}>Continue in demo workspace</button><div className="auth-note"><ShieldCheck size={16}/> Authentication is handled securely by Supabase.</div></div></div>}

function ActionCenter({title,onClose,notify}:{title:string,onClose:()=>void,notify:(s:string)=>void}){
  const[name,setName]=useState('');const[details,setDetails]=useState('');const[amount,setAmount]=useState('');const[file,setFile]=useState<File|null>(null);
  const lower=title.toLowerCase();
  const mode=lower.includes('invite')?'invite':lower.includes('expense')?'expense':lower.includes('leave')?'leave':lower.includes('travel')?'travel':lower.includes('asset')?'asset':lower.includes('course')||lower.includes('training')?'course':lower.includes('goal')?'goal':lower.includes('upload')?'upload':lower.includes('download')||lower.includes('export')||lower.includes('payslip')?'download':lower.includes('settings')||lower.includes('preferences')?'settings':lower.includes('contact')?'contact':lower.includes('ticket')||lower.includes('service')||lower.includes('help')?'support':lower.includes('announcement')?'announcement':lower.includes('project')||lower.includes('workspace')?'project':'details';
  const save=(message:string)=>{const record={title,name,details,amount,fileName:file?.name||'',at:new Date().toISOString()};const existing=JSON.parse(localStorage.getItem('dpa_actions')||'[]');localStorage.setItem('dpa_actions',JSON.stringify([record,...existing].slice(0,50)));notify(message);onClose();};
  const download=()=>{const rows=['Item,Status,Updated','Workspace,Operational,Today','Employee profile,Active,Today','Security controls,Protected,Today'];const blob=new Blob([rows.join('\n')],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='employee-workspace-report.csv';a.click();URL.revokeObjectURL(url);onClose();notify('Report downloaded');};
  return <div className="action-overlay" onClick={onClose}><div className="action-center" onClick={e=>e.stopPropagation()}><div className="action-head"><div><span className="eyebrow">WORKSPACE ACTION</span><h2>{title}</h2><p>Complete this workflow and save its activity to the employee workspace.</p></div><button className="iconbtn" onClick={onClose}>×</button></div>
    {mode==='invite'&&<><div className="action-form"><label>Employee name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name"/></label><label>Work email<input value={details} onChange={e=>setDetails(e.target.value)} placeholder="name@company.com"/></label><label>Role<select defaultValue="Employee"><option>Employee</option><option>Team lead</option><option>Project manager</option><option>HR admin</option></select></label></div><button className="primary" onClick={()=>save('Employee invitation prepared')}>Send invitation</button></>}
    {mode==='expense'&&<><div className="action-form"><label>Expense title<input value={name} onChange={e=>setName(e.target.value)} placeholder="Client travel"/></label><label>Amount<input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="₹ 0"/></label><label>Business purpose<textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Why was this expense incurred?"/></label></div><button className="primary" onClick={()=>save('Expense claim submitted')}>Submit expense</button></>}
    {mode==='leave'&&<><div className="action-form"><label>Leave type<select defaultValue="Annual leave"><option>Annual leave</option><option>Sick leave</option><option>Work from home</option><option>Personal leave</option></select></label><label>Dates<input value={name} onChange={e=>setName(e.target.value)} placeholder="Oct 05 – Oct 06"/></label><label>Reason<textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Reason for leave"/></label></div><button className="primary" onClick={()=>save('Leave request submitted')}>Submit request</button></>}
    {mode==='travel'&&<><div className="action-form"><label>Route<input value={name} onChange={e=>setName(e.target.value)} placeholder="Nashik → Mumbai"/></label><label>Travel dates<input value={details} onChange={e=>setDetails(e.target.value)} placeholder="Oct 15 – Oct 17"/></label><label>Purpose<textarea value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Client meeting / workshop"/></label></div><button className="primary" onClick={()=>save('Travel request submitted')}>Send for approval</button></>}
    {mode==='asset'&&<><div className="action-form"><label>Asset type<select defaultValue="Laptop"><option>Laptop</option><option>Mobile</option><option>Monitor</option><option>Software license</option></select></label><label>Request reason<textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Explain what you need"/></label></div><button className="primary" onClick={()=>save('Asset request submitted')}>Request asset</button></>}
    {mode==='course'&&<div className="action-detail"><div className="detail-stat"><span>Learning status</span><b>72% complete</b></div><div className="detail-stat"><span>Next module</span><b>Advanced analytics exercise</b></div><div className="detail-stat"><span>Target date</span><b>Oct 04, 2026</b></div><button className="primary" onClick={()=>{localStorage.setItem('dpa_learning_last_action',new Date().toISOString());notify('Learning session started');onClose()}}>Continue learning</button></div>}
    {mode==='goal'&&<div className="action-detail"><div className="detail-stat"><span>Objective</span><b>Improve delivery quality</b></div><div className="detail-stat"><span>Current progress</span><b>72%</b></div><label>Update note<textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="What changed this week?"/></label><button className="primary" onClick={()=>save('Goal update saved')}>Save progress</button></div>}
    {mode==='upload'&&<div className="action-detail"><label className="upload-box"><FileText size={24}/><b>Select a document</b><span>PDF, DOCX, PPTX or XLSX</span><input type="file" onChange={e=>setFile(e.target.files?.[0]||null)}/></label><button className="primary" disabled={!file} onClick={()=>save(file?file.name+' uploaded to workspace':'Choose a file first')}>Upload document</button></div>}
    {mode==='download'&&<div className="action-detail"><div className="detail-stat"><span>Prepared file</span><b>Employee workspace report</b></div><p>Generate a CSV report in your browser.</p><button className="primary" onClick={download}><Download size={15}/> Download report</button></div>}
    {mode==='settings'&&<div className="action-detail settings-action">{['Task notifications','Calendar reminders','Weekly digest','Security alerts'].map((x,i)=><label key={x}><span>{x}</span><input type="checkbox" defaultChecked={i<3}/></label>)}<button className="primary" onClick={()=>save('Workspace preferences saved')}>Save preferences</button></div>}
    {mode==='support'&&<div className="action-detail"><div className="detail-stat"><span>Support channel</span><b>Employee Service Desk</b></div><label>Issue<textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Describe the issue"/></label><button className="primary" onClick={()=>save('Support ticket submitted')}>Create ticket</button></div>}
    {mode==='announcement'&&<div className="action-detail"><div className="detail-stat"><span>Read status</span><b>Announcement opened</b></div><p>Review the update and record it in workspace activity.</p><button className="primary" onClick={()=>save('Announcement marked as read')}>Mark as read</button></div>}
    {mode==='contact'&&<div className="action-detail"><div className="contact-detail"><div className="bigavatar">HR</div><div><b>Employee Support</b><span>People Operations · benefits, leave and workplace support</span></div></div><div className="action-actions"><a className="primary" href="mailto:people@company.example">Email team</a><button className="ghost" onClick={()=>{navigator.clipboard?.writeText('people@company.example');notify('Contact copied');onClose()}}>Copy contact</button></div></div>}
    {mode==='project'&&<div className="action-detail"><div className="detail-stat"><span>Workspace</span><b>Delivery program</b></div><div className="detail-stat"><span>Health</span><b>On track · 92%</b></div><div className="detail-stat"><span>Next milestone</span><b>Oct 03, 2026</b></div><button className="primary" onClick={()=>save('Project workspace updated')}>Open project workspace</button></div>}
    {mode==='details'&&<div className="action-detail"><div className="detail-stat"><span>Action</span><b>{title}</b></div><div className="detail-stat"><span>Activity</span><b>Recorded in this browser</b></div><label>Notes<textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Add optional notes"/></label><button className="primary" onClick={()=>save('Workspace action saved')}>Save action</button></div>}
  </div></div>;
}

function PageTitle({eyebrow,title,sub,action}:{eyebrow:string,title:string,sub:string,action?:React.ReactNode}){return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{sub}</p></div>{action}</div>}
function Overview({notify,setSection}:{notify:(s:string)=>void,setSection:(s:Section)=>void}){const now=useLiveClock();
  const attendanceKey='dpa_attendance_'+new Date().toISOString().slice(0,10);
  const[attendanceMarked,setAttendanceMarked]=useState(()=>localStorage.getItem(attendanceKey)==='1');
  const[period,setPeriod]=useState('This month');
  const markAttendance=()=>{localStorage.setItem(attendanceKey,'1');setAttendanceMarked(true);notify('Attendance marked for today');};
  const quick=(section:Section,message:string)=>{setSection(section);notify(message);};

  return <>
    <section className="dashboard-hero">
      <div className="hero-copy">
        <div className="eyebrow">EMPLOYEE COMMAND CENTER · {longDateLabel(now)}</div>
        <h1>Good morning, Mahesh.</h1>
        <p>One workspace for delivery, people operations, finance, learning and workplace services.</p>
        <div className="hero-actions">
          <button className="primary" onClick={()=>quick('My Work','Opening your active work queue')}><Briefcase size={16}/> Open work queue <ArrowUpRight size={15}/></button>
          {!attendanceMarked&&<button className="ghost" onClick={markAttendance}><Clock3 size={16}/> Mark attendance</button>}
          <button className="hero-link" onClick={()=>notify('Command center ready')}><Sparkles size={15}/> Ask the workspace</button>
        </div>
      </div>
      <div className="hero-side">
        <div className="hero-health"><span>WORKSPACE HEALTH</span><strong>Healthy</strong><small>All key services available</small></div>
        <div className="hero-ring"><b>86%</b><span>utilization</span></div>
      </div>
    </section>

    <div className="command-strip">
      <button onClick={()=>quick('Projects','Opening project portfolio')}><FolderKanban size={17}/><span>Projects</span><small>06 active</small></button>
      <button onClick={()=>quick('Timesheet','Opening this week’s timesheet')}><Clock3 size={17}/><span>Timesheet</span><small>38h 20m</small></button>
      <button onClick={()=>quick('Leave','Opening leave balance')}><CalendarDays size={17}/><span>Time off</span><small>18.5 days</small></button>
      <button onClick={()=>quick('Expenses','Opening expense claims')}><ReceiptText size={17}/><span>Expenses</span><small>₹7,850 pending</small></button>
      <button onClick={()=>quick('Learning','Opening assigned learning')}><GraduationCap size={17}/><span>Learning</span><small>2 due soon</small></button>
    </div>

    <div className="kpi-grid">
      {([
        ['Utilization','86.2%','+4.1%','vs last month',TrendingUp,'up'],
        ['Active delivery','06','2','milestones this week',FolderKanban,''],
        ['Open tasks','14','5','due this week',CheckSquare,''],
        ['Billable hours','132h','+8h','vs plan',Clock3,'up'],
        ['Leave balance','18.5','2','requests pending',CalendarDays,''],
        ['Learning','72%','3','courses in progress',GraduationCap,'up']
      ] as [string,string,string,string,any,string][]).map(([label,value,delta,caption,Icon,tone],i)=><div className="kpi-card" key={i}>
        <div className="kpi-top"><span>{label}</span><div className="kpi-icon">{React.createElement(Icon as any,{size:17})}</div></div>
        <strong>{value}</strong>
        <div className={'kpi-delta '+String(tone)}>{delta} <span>{caption}</span></div>
      </div>)}
    </div>

    <div className="section-heading-row">
      <div><div className="eyebrow">OPERATIONS OVERVIEW</div><h2>What needs your attention</h2><p>Priorities across work, people and workplace services.</p></div>
      <select value={period} onChange={e=>setPeriod(e.target.value)}><option>This month</option><option>Last month</option><option>This quarter</option></select>
    </div>

    <div className="dashboard-grid-main">
      <section className="panel attention-panel">
        <div className="panel-head"><div><h2>Priority queue</h2><p>Actions that are time-sensitive or blocking delivery</p></div><button className="link" onClick={()=>setSection('My Work')}>View work queue <ChevronRight size={15}/></button></div>
        {([
          ['Client data quality review','Analytics Platform','Due today','High','72%',AlertTriangle],
          ['Information security training','Learning Hub','Due '+workDay(1),'Required','10%',ShieldCheck],
          ['Quarterly dashboard refresh','Risk Analytics','Due '+workDay(3),'Medium','41%',BarChart3],
          ['October leave request','People Operations','Pending approval','Normal','—',CalendarDays]
        ] as [string,string,string,string,string,any][]).map(([title,meta,due,priority,pct,Icon],i)=><button className="attention-row" key={i} onClick={()=>notify(String(title)+' opened')}>
          <div className="attention-icon">{React.createElement(Icon as any,{size:16})}</div>
          <div className="attention-main"><b>{title}</b><span>{meta} · {due}</span></div>
          <label className={'priority '+String(priority).toLowerCase()}>{priority}</label>
          <strong>{pct}</strong>
          <ChevronRight size={15}/>
        </button>)}
      </section>

      <section className="panel capacity-panel">
        <div className="panel-head"><div><h2>Capacity & focus</h2><p>Current week allocation</p></div><button className="iconbtn" onClick={()=>notify('Capacity report opened')}><MoreHorizontal size={18}/></button></div>
        <div className="capacity-score"><div><b>86%</b><span>allocated</span></div><div className="capacity-ring"><i></i></div></div>
        <div className="capacity-list">
          {[
            ['Client delivery','32h','76%'],
            ['Internal analytics','11h','52%'],
            ['Learning & growth','4h','28%'],
            ['Meetings','8h','61%']
          ].map((x,i)=><div key={i}><div><span>{x[0]}</span><b>{x[1]}</b></div><div className="micro-bar"><i style={{width:x[2]}}></i></div></div>)}
        </div>
        <button className="outline-wide" onClick={()=>quick('Timesheet','Opening timesheet summary')}>Review timesheet <ArrowUpRight size={14}/></button>
      </section>
    </div>

    <div className="dashboard-grid-main lower">
      <section className="panel">
        <div className="panel-head"><div><h2>Weekly activity</h2><p>Work rhythm across the last 7 days</p></div><span className="panel-badge">38h 20m total</span></div>
        <div className="activity-chart">
          {[['Mon',62,'6h 12m'],['Tue',78,'8h 04m'],['Wed',92,'8h 42m'],['Thu',76,'7h 18m'],['Fri',54,'5h 11m'],['Sat',18,'1h 02m'],['Sun',0,'']].map((x,i)=><div className="chart-col" key={i}><div className="chart-value">{x[2]}</div><div className="chart-track"><i style={{height:x[1]+'%'}}></i></div><span>{x[0]}</span></div>)}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Upcoming</h2><p>Meetings & milestones</p></div><button className="link" onClick={()=>setSection('Calendar')}>Calendar <ChevronRight size={15}/></button></div>
        {[
          ['10:30 AM','Client steering sync','Analytics Platform','30 min'],
          ['02:00 PM','Risk dashboard review','Risk Analytics','45 min'],
          ['Tomorrow','1:1 with Rohan','People · Manager','30 min'],
          [workDay(1),'Security refresher deadline','Learning Hub','Required']
        ].map((x,i)=><div className="upcoming-row" key={i}><time>{x[0]}</time><div><b>{x[1]}</b><span>{x[2]}</span></div><small>{x[3]}</small></div>)}
      </section>
    </div>

    <section className="panel portfolio-panel">
      <div className="panel-head"><div><div className="eyebrow">DELIVERY PORTFOLIO</div><h2>Active engagements</h2><p>Portfolio health across assigned programs and workstreams.</p></div><button className="link" onClick={()=>setSection('Projects')}>Open portfolio <ArrowUpRight size={15}/></button></div>
      <div className="portfolio-table">
        <div className="portfolio-head"><span>Program</span><span>Workstream</span><span>Health</span><span>Progress</span><span>Owner</span><span>Next milestone</span></div>
        {[
          ['Analytics Platform','Data quality & automation','On track','92%','Mahesh',workDay(0)],
          ['Risk Analytics','Executive dashboard','On track','76%','Mahesh',workDay(3)],
          ['Client Intelligence','Research pipeline','Watch','58%','Priya Nair',workDay(7)],
          ['Enterprise Data Hub','Data engineering','Planning','34%','Vikram Mehta',workDay(15)]
        ].map((p,i)=><div className="portfolio-row" key={i}><div><b>{p[0]}</b><span>{p[1]}</span></div><span className={'health '+String(p[2]).toLowerCase().replace(' ','-')}>{p[2]}</span><div className="table-progress"><i style={{width:p[3]}}></i></div><strong>{p[3]}</strong><span>{p[4]}</span><span>{p[5]}</span></div>)}
      </div>
    </section>

    <div className="dashboard-footer-grid">
      <section className="panel compact-panel">
        <div className="panel-head"><div><h2>Latest announcements</h2><p>Company-wide updates</p></div><button className="link" onClick={()=>setSection('Announcements')}>View all</button></div>
        {[
          ['Annual strategy town hall','Leadership',workDay(-4)],
          ['Security awareness month','IT & Security',workDay(-8)],
          ['New analytics practice launch','Business Update',workDay(-11)]
        ].map((x,i)=><button className="news-row" key={i} onClick={()=>setSection('Announcements')}><div className="news-num">0{i+1}</div><div><b>{x[0]}</b><span>{x[1]}</span></div><small>{x[2]}</small><ArrowUpRight size={14}/></button>)}
      </section>
      <section className="panel compact-panel">
        <div className="panel-head"><div><h2>Service status</h2><p>Core employee services</p></div><span className="status-live"><i></i> Live</span></div>
        {[
          ['Identity & access','Operational','99.99%'],
          ['Employee workspace','Operational','99.98%'],
          ['Documents','Operational','99.95%'],
          ['Learning platform','Operational','99.97%']
        ].map((x,i)=><div className="service-row" key={i}><div className="service-dot"><CheckCircle2 size={14}/></div><span>{x[0]}</span><small>{x[1]}</small><b>{x[2]}</b></div>)}
      </section>
    </div>
  </>;
}
type WorkItem={
  id:string;
  title:string;
  project:string;
  type:'Delivery'|'Side Hustle';
  client:string;
  priority:'Urgent'|'High'|'Medium'|'Low';
  status:'Backlog'|'In progress'|'In review'|'Blocked'|'Completed';
  progress:number;
  due:string;
  estimate:string;
  logged:string;
  sprint:string;
  owner:string;
  description:string;
  deliverable:string;
  dependency:string;
  checklist:string[];
  activity:string[];
  comments:string[];
};

const seedWorkItems:WorkItem[]=[
  {
    id:'WK-1048',title:'Client data quality review',project:'Analytics Platform',type:'Delivery',client:'Global Banking Client',
    priority:'High',status:'In progress',progress:72,due:'Today',estimate:'6h',logged:'4h 20m',sprint:'Sprint 24',owner:'Mahesh Shirsath',
    description:'Validate source-to-target data quality for the client analytics feed. Reconcile exception records, document root causes, and prepare the release-readiness note for the project manager.',
    deliverable:'DQ validation workbook + release-readiness summary',
    dependency:'Client source extract v7.2',
    checklist:['Review source data and mapping rules','Reconcile exception records','Validate corrected outputs','Upload DQ evidence pack','Mark deliverable ready for review'],
    activity:['09:42 · Exception set reconciled (38 records)','09:10 · Validation workbook updated','Yesterday · Source extract v7.2 received'],
    comments:['Rohan · Please include the top 5 recurring exception patterns.']
  },
  {
    id:'WK-1051',title:'Quarterly dashboard refresh',project:'Risk Analytics',type:'Delivery',client:'Internal Risk Office',
    priority:'Medium',status:'In progress',progress:41,due:'Oct 06',estimate:'10h',logged:'3h 35m',sprint:'Sprint 24',owner:'Mahesh Shirsath',
    description:'Refresh the executive risk dashboard with the latest quarter-end metrics, validate measures against the finance pack, and prepare the review version for leadership.',
    deliverable:'Power BI dashboard v4 + metric reconciliation sheet',
    dependency:'Q3 finance pack',
    checklist:['Load quarter-end dataset','Refresh semantic model','Validate KPI calculations','Review dashboard layout','Publish review build'],
    activity:['Yesterday · Q3 dataset loaded','Sep 29 · KPI reconciliation started','Sep 26 · Review comments incorporated'],
    comments:['Priya · Use the new risk-severity definition from the September policy note.']
  },
  {
    id:'WK-1058',title:'Model validation pack',project:'Quant Research',type:'Delivery',client:'Research Practice',
    priority:'High',status:'In review',progress:64,due:'Oct 08',estimate:'8h',logged:'5h 10m',sprint:'Sprint 24',owner:'Mahesh Shirsath',
    description:'Complete the model validation pack for the latest scoring model, covering stability metrics, drift observations, sample-level exceptions, and sign-off evidence.',
    deliverable:'Validation memo + evidence annexure',
    dependency:'Model v2.3 output snapshot',
    checklist:['Run stability checks','Review drift indicators','Investigate sample exceptions','Prepare validation memo','Submit for peer review'],
    activity:['Today · Validation memo updated','Sep 29 · Drift analysis complete','Sep 27 · Sample review finished'],
    comments:['Ananya · Please call out any material drift separately in the executive summary.']
  },
  {
    id:'WK-1062',title:'Knowledge base update',project:'Internal Analytics Enablement',type:'Delivery',client:'Decimal Point Analytics',
    priority:'Low',status:'Backlog',progress:18,due:'Oct 12',estimate:'4h',logged:'45m',sprint:'Sprint 25',owner:'Mahesh Shirsath',
    description:'Turn repeated analytics support questions into concise internal knowledge articles with examples, troubleshooting steps, and ownership guidance.',
    deliverable:'3 published knowledge articles',
    dependency:'SME review from Data Engineering',
    checklist:['Collect recurring questions','Draft article 1','Draft article 2','Draft article 3','Submit SME review'],
    activity:['Sep 30 · Topic list created','Sep 28 · Stakeholder interview completed'],
    comments:[]
  },
  {
    id:'SH-2101',title:'Internal analytics automation sprint',project:'Side Hustle & Innovation',type:'Side Hustle',client:'Internal Innovation Lab',
    priority:'High',status:'In progress',progress:58,due:'Oct 05',estimate:'7h',logged:'3h 50m',sprint:'Innovation Sprint 03',owner:'Mahesh Shirsath',
    description:'Prototype a small automation that converts recurring CSV quality checks into a repeatable review report. This is an internal innovation item and should remain separate from billable client delivery.',
    deliverable:'Automation prototype + sample output report',
    dependency:'Approved sample CSV dataset',
    checklist:['Define input/output contract','Create validation rules','Build repeatable report generation','Test against sample datasets','Demo to analytics lead'],
    activity:['10:05 · Rule set for null/duplicate checks drafted','Yesterday · Prototype folder created','Sep 29 · Idea approved for innovation sprint'],
    comments:['Mahesh · Keep the prototype generic so it can be reused by other teams.']
  },
  {
    id:'SH-2104',title:'Power BI dashboard polish lab',project:'Side Hustle & Innovation',type:'Side Hustle',client:'Internal Innovation Lab',
    priority:'Medium',status:'In review',progress:76,due:'Oct 07',estimate:'5h',logged:'3h 40m',sprint:'Innovation Sprint 03',owner:'Mahesh Shirsath',
    description:'Experiment with a more executive-friendly dashboard layout, consistent KPI cards, drill-through patterns, and a compact mobile experience for internal reporting.',
    deliverable:'Dashboard design prototype + component guide',
    dependency:'Internal design feedback',
    checklist:['Review executive dashboard examples','Create component variations','Test drill-through interaction','Validate mobile layout','Share design guide'],
    activity:['Today · KPI component variants prepared','Sep 30 · Mobile layout tested','Sep 28 · Initial prototype reviewed'],
    comments:['Priya · Keep the visual system aligned with the enterprise portal.']
  },
  {
    id:'SH-2110',title:'Personal analytics portfolio case study',project:'Side Hustle & Innovation',type:'Side Hustle',client:'Professional Development',
    priority:'Low',status:'Backlog',progress:22,due:'Oct 15',estimate:'6h',logged:'1h 10m',sprint:'Personal Build',owner:'Mahesh Shirsath',
    description:'Build a sanitized case study showing an end-to-end analytics workflow: problem framing, data quality, exploration, KPI design, validation, and executive storytelling.',
    deliverable:'Portfolio case study PDF + dashboard walkthrough',
    dependency:'No confidential client data',
    checklist:['Define case-study problem','Create synthetic dataset','Build analysis notebook','Design executive dashboard','Write final case study'],
    activity:['Sep 30 · Problem statement drafted','Sep 27 · Synthetic dataset outline created'],
    comments:[]
  },
  {
    id:'SH-2116',title:'SQL performance pattern library',project:'Side Hustle & Innovation',type:'Side Hustle',client:'Internal Learning Guild',
    priority:'Low',status:'Completed',progress:100,due:'Sep 29',estimate:'3h',logged:'3h 05m',sprint:'Innovation Sprint 02',owner:'Mahesh Shirsath',
    description:'Create a reusable library of practical SQL patterns for joins, deduplication, exception analysis, and reconciliation workflows commonly used by analytics teams.',
    deliverable:'SQL pattern library + examples',
    dependency:'Peer review completed',
    checklist:['Join pattern examples','Deduplication patterns','Reconciliation examples','Comment and document','Publish to learning hub'],
    activity:['Sep 29 · Published to Learning Hub','Sep 28 · Peer review completed','Sep 26 · Examples finalized'],
    comments:['Rohan · Good reusable reference for new analysts.']
  }
];

function MyWork({query,notify}:{query:string,notify:(s:string)=>void}){
  const stored=localStorage.getItem('dpa_work_items');
  const[items,setItems]=useState<WorkItem[]>(()=>stored?(JSON.parse(stored) as WorkItem[]):seedWorkItems);
  const[selected,setSelected]=useState<WorkItem|null>(null);
  const[filter,setFilter]=useState<'all'|'delivery'|'side'|'due'|'active'|'completed'>('all');
  const[showCreate,setShowCreate]=useState(false);
  const[comment,setComment]=useState('');
  const[newTask,setNewTask]=useState({title:'',project:'Internal Analytics',priority:'Medium' as WorkItem['priority'],due:'Oct 20',type:'Side Hustle' as WorkItem['type'],description:''});

  useEffect(()=>{localStorage.setItem('dpa_work_items',JSON.stringify(items));},[items]);

  const persistUpdate=(next:WorkItem)=>{
    setItems(prev=>prev.map(x=>x.id===next.id?next:x));
    setSelected(next);
    notify('Task updated successfully');
  };

  const filtered=items.filter(x=>{
    const matchesSearch=x.title.toLowerCase().includes(query.toLowerCase())||x.project.toLowerCase().includes(query.toLowerCase())||x.client.toLowerCase().includes(query.toLowerCase())||x.deliverable.toLowerCase().includes(query.toLowerCase());
    if(!matchesSearch)return false;
    if(filter==='delivery')return x.type==='Delivery';
    if(filter==='side')return x.type==='Side Hustle';
    if(filter==='due')return x.status!=='Completed';
    if(filter==='active')return x.status==='In progress'||x.status==='In review'||x.status==='Blocked';
    if(filter==='completed')return x.status==='Completed';
    return true;
  });
  const delivery=filtered.filter(x=>x.type==='Delivery');
  const side=filtered.filter(x=>x.type==='Side Hustle');
  const activeCount=items.filter(x=>x.status!=='Completed').length;
  const sideCount=items.filter(x=>x.type==='Side Hustle').length;
  const completion=Math.round(items.reduce((sum,x)=>sum+x.progress,0)/items.length);

  const openTask=(task:WorkItem)=>{setSelected(task);setComment('');};
  const addTask=()=>{
    if(!newTask.title.trim())return;
    const item:WorkItem={
      id:'WK-'+Math.floor(3000+Math.random()*6999),title:newTask.title.trim(),project:newTask.project,type:newTask.type,client:'Internal Workspace',
      priority:newTask.priority,status:'Backlog',progress:0,due:newTask.due,estimate:'To estimate',logged:'0h',sprint:'Next sprint',owner:'Mahesh Shirsath',
      description:newTask.description||'New work item created from My Work. Add scope, evidence and acceptance criteria before starting delivery.',
      deliverable:'Define deliverable',dependency:'None',checklist:['Confirm scope and acceptance criteria','Create working draft','Review output','Attach supporting evidence','Mark complete'],activity:['Just now · Task created from My Work'],comments:[]
    };
    setItems(prev=>[item,...prev]);setShowCreate(false);setNewTask({title:'',project:'Internal Analytics',priority:'Medium',due:'Oct 20',type:'Side Hustle',description:''});openTask(item);notify('New task created');
  };

  return <>
    <PageTitle eyebrow="WORK MANAGEMENT" title="My Work" sub="Your personal delivery cockpit — client work, internal commitments, side projects, evidence and execution history." action={<button className="primary" onClick={()=>setShowCreate(true)}><Plus size={16}/> New task</button>}/>

    <div className="work-overview-grid">
      <div className="work-summary-card primary-summary"><span>Total work items</span><strong>{items.length}</strong><small>{activeCount} active · {items.length-activeCount} completed</small></div>
      <div className="work-summary-card"><span>Delivery tasks</span><strong>{items.filter(x=>x.type==='Delivery').length}</strong><small>Client & internal commitments</small></div>
      <div className="work-summary-card"><span>Side hustle</span><strong>{sideCount}</strong><small>Innovation & personal build</small></div>
      <div className="work-summary-card"><span>Avg. completion</span><strong>{completion}%</strong><small>Across all assigned work</small></div>
    </div>

    <section className="work-command-panel">
      <div><div className="eyebrow">MY WORKSPACE</div><h2>Run your work from one place</h2><p>Open a task to see scope, deliverables, dependencies, checklist, history, comments and progress controls.</p></div>
      <div className="work-command-stats"><div><b>38h 20m</b><span>logged this week</span></div><div><b>5</b><span>items due this week</span></div><div><b>2</b><span>items awaiting review</span></div></div>
    </section>

    <div className="work-filterbar">
      <div className="work-tabs">
        {[
          ['all','All work',''],
          ['delivery','Delivery',''],
          ['side','Side Hustle',''],
          ['active','Active',''],
          ['due','Due soon',''],
          ['completed','Completed','']
        ].map(([key,label])=><button key={key} className={filter===key?'active':''} onClick={()=>setFilter(key as typeof filter)}>{label}<span>{key==='all'?items.length:key==='delivery'?items.filter(x=>x.type==='Delivery').length:key==='side'?sideCount:key==='completed'?items.filter(x=>x.status==='Completed').length:activeCount}</span></button>)}
      </div>
      <div className="smallsearch"><Search size={15}/>{query||'Workspace search'}</div>
    </div>

    <div className="work-layout">
      <section className="panel work-list-panel">
        <div className="panel-head"><div><h2>Delivery work</h2><p>Client, internal and recurring operational commitments</p></div><span className="panel-badge">{delivery.length} visible</span></div>
        {delivery.length===0?<div className="empty-state">No delivery work matches the current filter.</div>:delivery.map(task=><button className="work-item-row" key={task.id} onClick={()=>openTask(task)}>
          <div className="work-type-icon"><Briefcase size={16}/></div>
          <div className="work-item-main"><div><b>{task.title}</b><span>{task.project} · {task.client}</span></div><div className="work-item-meta"><small>{task.id}</small><small>Due {task.due}</small><small>{task.estimate} estimate</small></div></div>
          <label className={'priority '+task.priority.toLowerCase()}>{task.priority}</label>
          <div className="work-progress-cell"><span>{task.progress}%</span><div className="progress"><i style={{width:task.progress+'%'}}></i></div></div>
          <span className={'work-status '+task.status.toLowerCase().replace(/\s/g,'-')}>{task.status}</span>
          <ChevronRight size={16}/>
        </button>)}
      </section>

      <section className="panel work-list-panel side-hustle-panel">
        <div className="panel-head"><div><h2>Side Hustle & Innovation</h2><p>Non-billable innovation, learning and personal build work</p></div><span className="side-hustle-badge"><Sparkles size={13}/> {side.length} ideas</span></div>
        {side.length===0?<div className="empty-state">No side-hustle work matches the current filter.</div>:side.map(task=><button className="work-item-row side-row" key={task.id} onClick={()=>openTask(task)}>
          <div className="work-type-icon side-icon"><Sparkles size={16}/></div>
          <div className="work-item-main"><div><b>{task.title}</b><span>{task.project} · {task.client}</span></div><div className="work-item-meta"><small>{task.id}</small><small>Due {task.due}</small><small>{task.estimate}</small></div></div>
          <label className={'priority '+task.priority.toLowerCase()}>{task.priority}</label>
          <div className="work-progress-cell"><span>{task.progress}%</span><div className="progress"><i style={{width:task.progress+'%'}}></i></div></div>
          <span className={'work-status '+task.status.toLowerCase().replace(/\s/g,'-')}>{task.status}</span>
          <ChevronRight size={16}/>
        </button>)}
      </section>
    </div>

    <section className="panel work-capacity-panel">
      <div className="panel-head"><div><h2>Execution board</h2><p>Where your work stands across the workflow lifecycle</p></div><button className="link" onClick={()=>{setFilter('active');notify('Showing active work')}}>Show active <ArrowUpRight size={14}/></button></div>
      <div className="execution-board">{['Backlog','In progress','In review','Blocked','Completed'].map(status=>{
        const col=items.filter(x=>x.status===status);
        return <div className="execution-col" key={status}><div className="execution-col-head"><span>{status}</span><b>{col.length}</b></div>{col.slice(0,3).map(task=><button className="execution-card" key={task.id} onClick={()=>openTask(task)}><b>{task.title}</b><span>{task.project}</span><div><i style={{width:task.progress+'%'}}></i></div><small>{task.progress}% · {task.due}</small></button>)}{col.length>3&&<small className="more-count">+{col.length-3} more</small>}</div>
      })}</div>
    </section>

    {showCreate&&<div className="task-overlay" onClick={()=>setShowCreate(false)}><div className="task-modal" onClick={e=>e.stopPropagation()}><div className="task-modal-head"><div><span className="eyebrow">CREATE WORK ITEM</span><h2>New task</h2><p>Add a real work item to your personal execution board.</p></div><button className="iconbtn" onClick={()=>setShowCreate(false)}>×</button></div><div className="create-task-grid"><label>Task title<input value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})} placeholder="e.g. Build monthly client reconciliation"/></label><label>Work type<select value={newTask.type} onChange={e=>setNewTask({...newTask,type:e.target.value as WorkItem['type']})}><option>Delivery</option><option>Side Hustle</option></select></label><label>Project / workspace<input value={newTask.project} onChange={e=>setNewTask({...newTask,project:e.target.value})} placeholder="Project name"/></label><label>Priority<select value={newTask.priority} onChange={e=>setNewTask({...newTask,priority:e.target.value as WorkItem['priority']})}><option>Urgent</option><option>High</option><option>Medium</option><option>Low</option></select></label><label>Due date<input value={newTask.due} onChange={e=>setNewTask({...newTask,due:e.target.value})} placeholder="Oct 20"/></label><label className="create-span-2">Description<textarea value={newTask.description} onChange={e=>setNewTask({...newTask,description:e.target.value})} placeholder="Define the actual outcome, acceptance criteria and context."/></label></div><div className="task-modal-actions"><button className="ghost" onClick={()=>setShowCreate(false)}>Cancel</button><button className="primary" onClick={addTask}>Create task</button></div></div></div>}

    {selected&&<div className="task-overlay" onClick={()=>setSelected(null)}><div className="task-modal rich-task-modal" onClick={e=>e.stopPropagation()}>
      <div className="task-modal-head"><div><div className="task-id-line"><span className="eyebrow">{selected.id}</span><span className={'work-kind '+selected.type.toLowerCase().replace(/\s/g,'-')}>{selected.type}</span></div><h2>{selected.title}</h2><p>{selected.project} · {selected.client}</p></div><button className="iconbtn" onClick={()=>setSelected(null)}>×</button></div>
      <div className="task-detail-grid rich"><div><span>Priority</span><label className={'priority '+selected.priority.toLowerCase()}>{selected.priority}</label></div><div><span>Due</span><b>{selected.due}</b></div><div><span>Estimate</span><b>{selected.estimate}</b></div><div><span>Logged</span><b>{selected.logged}</b></div><div><span>Sprint</span><b>{selected.sprint}</b></div><div><span>Owner</span><b>{selected.owner}</b></div><div><span>Dependency</span><b>{selected.dependency}</b></div><div><span>Deliverable</span><b>{selected.deliverable}</b></div></div>

      <div className="task-progress-large"><div><span>Completion</span><b>{selected.progress}%</b></div><input className="task-range" type="range" min="0" max="100" value={selected.progress} onChange={e=>persistUpdate({...selected,progress:Number(e.target.value),status:Number(e.target.value)===100?'Completed':selected.status==='Completed'?'In progress':selected.status})}/><div className="progress"><i style={{width:selected.progress+'%'}}></i></div></div>

      <div className="rich-task-grid">
        <div className="task-detail-section"><h3>Task overview</h3><p>{selected.description}</p><h3>Acceptance checklist</h3>{selected.checklist.map((item,i)=><label className="check-row" key={item}><input type="checkbox" defaultChecked={selected.progress>=((i+1)/selected.checklist.length)*100}/><span>{item}</span></label>)}</div>
        <div className="task-detail-section"><h3>Workflow status</h3><select className="task-status-select" value={selected.status} onChange={e=>persistUpdate({...selected,status:e.target.value as WorkItem['status']})}>{['Backlog','In progress','In review','Blocked','Completed'].map(x=><option key={x}>{x}</option>)}</select><h3>Recent activity</h3>{selected.activity.map(x=><div className="task-activity" key={x}><span></span><p>{x}</p></div>)}</div>
      </div>

      <div className="task-evidence-row"><div><span className="eyebrow">PRIMARY DELIVERABLE</span><b>{selected.deliverable}</b></div><button className="ghost" onClick={()=>notify('Deliverable workspace opened')}><FileCheck size={15}/> Open deliverable</button></div>
      <div className="task-comments"><div className="panel-head"><div><h3>Comments & handoffs</h3><p>Context shared by teammates on this work item</p></div></div>{selected.comments.length?selected.comments.map((x,i)=><div className="comment" key={i}><div className="personavatar">{x.split(' · ')[0].slice(0,2)}</div><span>{x}</span></div>):<div className="empty-state">No comments yet. Add the first work note below.</div>}<div className="comment-composer"><input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a progress note or handoff message"/><button className="primary" disabled={!comment.trim()} onClick={()=>{const next={...selected,comments:[...selected.comments, 'You · '+comment.trim()]};persistUpdate(next);setComment('')}}><MessageSquare size={14}/> Add note</button></div></div>

      <div className="task-modal-actions"><button className="ghost" onClick={()=>setSelected(null)}>Close</button>{selected.status!=='Completed'&&<button className="primary" onClick={()=>persistUpdate({...selected,status:'Completed',progress:100})}><CheckCircle2 size={15}/> Mark complete</button>}</div>
    </div></div>}
  </>;
}
function Projects({notify}:{notify:(s:string)=>void}){
  const rows=[['Analytics Platform','Data & Insights','92%','On track','Oct 03','12'],['Risk Analytics','Financial Analytics','76%','On track','Oct 06','8'],['Client Intelligence','Research','58%','Watch','Oct 10','15'],['Enterprise Data Hub','Technology','34%','Planning','Oct 18','21']];
  return <><PageTitle eyebrow="PORTFOLIO MANAGEMENT" title="Projects & Delivery" sub="Portfolio health, milestones, delivery metrics and workstream ownership." action={<button className="primary" onClick={()=>notify('Create project workflow opened')}><Plus size={16}/> New project</button>}/><div className="stats">{[['Active programs','06','2 launching this month'],['Milestones','24','5 due in 7 days'],['Delivery health','92%','Across assigned work'],['Open risks','03','1 needs escalation']].map((x,i)=><div className="stat" key={i}><span>{x[0]}</span><strong>{x[1]}</strong><small className={i===2?'up':''}>{x[2]}</small></div>)}</div><section className="panel"><div className="panel-head"><div><h2>Portfolio</h2><p>Program-level delivery view</p></div><button className="ghost" onClick={()=>notify('Portfolio export prepared')}><Download size={15}/> Export report</button></div><div className="portfolio-table full"><div className="portfolio-head"><span>Program</span><span>Workstream</span><span>Health</span><span>Progress</span><span>Next milestone</span><span>Tasks</span></div>{rows.map((p,i)=><button className="portfolio-row clickable" key={i} onClick={()=>notify(p[0]+' workspace opened')}><div><b>{p[0]}</b><span>{p[1]}</span></div><span className={'health '+p[3].toLowerCase()}>{p[3]}</span><div className="table-progress"><i style={{width:p[2]}}></i></div><strong>{p[2]}</strong><span>{p[4]}</span><span>{p[5]}</span></button>)}</div></section><div className="grid2"><section className="panel"><div className="panel-head"><div><h2>Delivery risks</h2><p>Items requiring review</p></div></div>{[['Client Intelligence','Data dependency','Medium','Oct 02'],['Risk Analytics','Sign-off pending','Low','Oct 04'],['Enterprise Data Hub','Resource alignment','Medium','Oct 07']].map((r,i)=><div className="risk-row" key={i}><div className="risk-icon"><AlertTriangle size={15}/></div><div><b>{r[0]}</b><span>{r[1]}</span></div><label className={r[2].toLowerCase()}>{r[2]}</label><small>{r[3]}</small></div>)}</section><section className="panel"><div className="panel-head"><div><h2>Team distribution</h2><p>Work across active programs</p></div></div>{[['Analytics','42%'],['Research','21%'],['Technology','24%'],['Internal','13%']].map((x,i)=><div className="distribution-row" key={i}><span>{x[0]}</span><b>{x[1]}</b><div className="micro-bar"><i style={{width:x[1]}}></i></div></div>)}</section></div></>;
}

function Timesheet({notify}:{notify:(s:string)=>void}){
  const days=[['Mon','8h 12m'],['Tue','8h 04m'],['Wed','8h 42m'],['Thu','7h 18m'],['Fri','6h 04m'],['Sat','—'],['Sun','—']];
  return <><PageTitle eyebrow="TIME TRACKING" title="Timesheet" sub="Review weekly hours, attendance records and billable allocation." action={<button className="primary" onClick={()=>notify('Timesheet submitted for review')}><CheckCircle2 size={16}/> Submit week</button>}/><div className="timesheet-banner"><div><span>WEEK OF SEP 28 — OCT 04</span><strong>38h 20m</strong><small>2h 40m remaining to planned weekly capacity</small></div><div className="timesheet-progress"><i style={{width:'76%'}}></i></div><button onClick={()=>notify('Timesheet preferences opened')}>Week settings <Settings size={14}/></button></div><section className="panel"><div className="panel-head"><div><h2>Daily entries</h2><p>Hours captured from attendance and project allocation</p></div></div>{days.map((d,i)=><div className="time-row" key={i}><b>{d[0]}</b><span>{['Analytics Platform','Risk Analytics','Internal','Analytics Platform','Research','',''][i]||'—'}</span><span>{d[1]}</span><label>{i===5||i===6?'Weekend':'Recorded'}</label><button className="iconbtn" onClick={()=>notify('Edit '+d[0]+' opened')}><ArrowUpRight size={14}/></button></div>)}</section></>;
}

function Payroll({notify}:{notify:(s:string)=>void}){
  return <><PageTitle eyebrow="PAY & COMPENSATION" title="Payroll" sub="Compensation summary, payslips, tax documents and payment preferences." action={<button className="ghost" onClick={()=>notify('Payslip archive opened')}><Download size={16}/> Payslip archive</button>}/><div className="stats">{[['Current gross','₹84,500','Monthly'],['Net pay','₹72,140','Sep 30 credit'],['Tax withheld','₹9,420','Current month'],['YTD earnings','₹7,18,250','FY 2026–27']].map((x,i)=><div className="stat" key={i}><span>{x[0]}</span><strong>{x[1]}</strong><small>{x[2]}</small></div>)}</div><div className="grid2"><section className="panel"><div className="panel-head"><div><h2>Latest payslip</h2><p>September 2026 payroll</p></div><span className="status-live"><i></i> Processed</span></div><div className="pay-slip"><div><span>Gross pay</span><b>₹84,500</b></div><div><span>Deductions</span><b>₹12,360</b></div><div><span>Net pay</span><b>₹72,140</b></div></div><button className="outline-wide" onClick={()=>notify('September payslip downloaded')}><Download size={14}/> Download payslip</button></section><section className="panel"><div className="panel-head"><div><h2>Tax & compliance</h2><p>Documents available for download</p></div></div>{[['Form 16','FY 2025–26','Available'],['Investment declaration','FY 2026–27','Open'],['Bank account','•••• 4421','Verified']].map((x,i)=><div className="simple-row" key={i}><div><b>{x[0]}</b><span>{x[1]}</span></div><label>{x[2]}</label><ChevronRight size={15}/></div>)}</section></div></>;
}

function Benefits({notify}:{notify:(s:string)=>void}){
  return <><PageTitle eyebrow="TOTAL REWARDS" title="Benefits & Perks" sub="Health, insurance, allowances and employee wellbeing programs." action={<button className="primary" onClick={()=>notify('Benefits enrollment opened')}><Plus size={16}/> Manage benefits</button>}/><div className="business-grid">{([['Health insurance','Family floater','₹5L coverage','Active',HeartHandshake],['Meal allowance','Monthly wallet','₹2,500 / month','Active',WalletCards],['Internet allowance','Hybrid work support','₹1,500 / month','Eligible',Globe2],['Wellness program','Learning & wellbeing','10 credits / year','6 used',Sparkles]] as [string,string,string,string,any][]).map((x,i)=><div className="business-card benefit-card" key={i}><div className="business-icon">{React.createElement(x[4] as any,{size:20})}</div><span>{x[1]}</span><h2>{x[0]}</h2><p>{x[2]}</p><label className="asset-status">{x[3]}</label><button className="link" onClick={()=>notify(x[0]+' details opened')}>View details <ArrowUpRight size={14}/></button></div>)}</div><section className="panel"><div className="panel-head"><div><h2>Benefits contacts</h2><p>People to contact when you need support</p></div></div>{[['People Operations','Ritika Shah','Benefits specialist','Mumbai'],['Insurance desk','Corporate Benefits Team','Claims & queries','Remote'],['Wellbeing','Employee Assistance','Confidential support','Remote']].map((x,i)=><div className="contact-row" key={i}><div className="personavatar">{['RS','CB','EA'][i]}</div><div><b>{x[0]}</b><span>{x[1]} · {x[2]}</span></div><small>{x[3]}</small><button className="iconbtn" onClick={()=>notify('Contact options opened')}><Mail size={15}/></button></div>)}</section></>;
}

function Travel({notify}:{notify:(s:string)=>void}){
  return <><PageTitle eyebrow="BUSINESS TRAVEL" title="Travel Desk" sub="Manage travel requests, itineraries, policy approvals and reimbursements." action={<button className="primary" onClick={()=>notify('Travel request started')}><Plus size={16}/> New travel request</button>}/><div className="stats">{[['Upcoming travel','02','Trips this quarter'],['Pending approvals','01','Needs manager review'],['Travel budget','₹86,000','FY remaining'],['Policy compliance','98%','Current profile']].map(x=><div className="stat"><span>{x[0]}</span><strong>{x[1]}</strong><small>{x[2]}</small></div>)}</div><section className="panel"><div className="panel-head"><div><h2>Travel requests</h2><p>Active and upcoming business travel</p></div></div>{[['TRV-24014','Mumbai → Bengaluru','Oct 08 – Oct 10','Client workshop','Approved'],['TRV-24007','Nashik → Mumbai','Oct 15','Leadership offsite','Pending'],['TRV-23988','Pune → Hyderabad','Sep 05 – Sep 07','Project kickoff','Completed']].map((x,i)=><div className="travel-row" key={i}><div className="travel-icon"><PlaneTakeoff size={17}/></div><div><b>{x[0]} · {x[1]}</b><span>{x[2]} · {x[3]}</span></div><label className={x[4].toLowerCase()}>{x[4]}</label><button className="iconbtn" onClick={()=>notify(x[0]+' itinerary opened')}><ChevronRight size={15}/></button></div>)}</section><div className="grid2"><section className="panel"><div className="panel-head"><div><h2>Travel policy</h2><p>Your default policy profile</p></div></div><div className="policy-list"><div><span>Air travel</span><b>Economy under 4h</b></div><div><span>Hotel</span><b>Up to ₹6,000 / night</b></div><div><span>Local transport</span><b>Company policy</b></div></div></section><section className="panel"><div className="panel-head"><div><h2>Travel support</h2><p>Need help while on the move?</p></div></div><button className="support-action" onClick={()=>notify('Travel support opened')}><Headphones size={18}/><div><b>24×7 assistance</b><span>Emergency travel desk and itinerary support</span></div><ChevronRight size={15}/></button></section></div></>;
}

function SettingsPage({notify}:{notify:(s:string)=>void}){
  const prefs=[['Desktop notifications','Receive task, leave and service alerts','On'],['Weekly digest','Get a Friday summary of work and people activity','On'],['Calendar reminders','15 minute reminder before meetings','On'],['Product updates','News about new portal features','Off']];
  return <><PageTitle eyebrow="WORKSPACE PREFERENCES" title="Settings" sub="Personalize notifications, security and workspace behavior." action={<button className="primary" onClick={()=>notify('Settings saved')}><CheckCircle2 size={16}/> Save changes</button>}/><div className="grid2"><section className="panel settings-panel"><div className="panel-head"><div><h2>Notifications</h2><p>Choose what reaches your work inbox</p></div></div>{prefs.map((p,i)=><div className="setting-row" key={i}><div><b>{p[0]}</b><span>{p[1]}</span></div><button className={'toggle '+(p[2]==='On'?'on':'')} onClick={()=>notify(p[0]+' preference updated')}><i></i><span>{p[2]}</span></button></div>)}</section><section className="panel"><div className="panel-head"><div><h2>Security</h2><p>Account controls and active sessions</p></div></div>{[['MFA','Enabled · Authenticator app','Protected'],['Password','Last changed 38 days ago','Healthy'],['Sessions','2 active sessions','Review']].map((x,i)=><div className="simple-row" key={i}><div><b>{x[0]}</b><span>{x[1]}</span></div><label>{x[2]}</label><button className="link" onClick={()=>notify(x[0]+' settings opened')}>Manage</button></div>)}</section></div><section className="panel"><div className="panel-head"><div><h2>Workspace appearance</h2><p>Choose how the employee portal feels and behaves</p></div></div><div className="appearance-grid">{[['Density','Comfortable','Rows, cards and spacing'],['Theme','System','Matches your device'],['Start page','Overview','Open the dashboard on sign-in']].map(x=><button key={x[0]} className="appearance-card" onClick={()=>notify(x[0]+' preference selected')}><span>{x[0]}</span><b>{x[1]}</b><small>{x[2]}</small><ChevronRight size={15}/></button>)}</div></section></>;
}

function Directory({query,notify}:{query:string,notify:(s:string)=>void}){let d=people.filter(p=>p.join(' ').toLowerCase().includes(query.toLowerCase()));return <><PageTitle eyebrow="PEOPLE & TEAMS" title="Company Directory" sub="Find colleagues, teams and business contacts across Decimal Point Analytics."/><div className="directory">{d.map((p,i)=><div className="person" key={i}><div className="personavatar">{p[0]}</div><div><b>{p[1]}</b><span>{p[2]}</span><small><MapPin size={13}/>{p[3]}</small></div><button className="iconbtn" onClick={()=>notify(p[1]+' contact opened')}><Mail size={17}/></button></div>)}</div></>}
function Attendance({notify}:{notify:(s:string)=>void}){const now=useLiveClock();
  const key='dpa_attendance_session_'+new Date().toISOString().slice(0,10);
  const[checkedIn,setCheckedIn]=useState(()=>localStorage.getItem(key)==='1');
  const[checkInAt,setCheckInAt]=useState(()=>localStorage.getItem(key+'_time')||'09:18 AM');
  const toggle=()=>{
    if(!checkedIn){
      const t=new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
      localStorage.setItem(key,'1');localStorage.setItem(key+'_time',t);localStorage.setItem(key+'_checked_at',new Date().toISOString());setCheckInAt(t);setCheckedIn(true);notify('Attendance checked in');
    }else{
      localStorage.removeItem(key);localStorage.removeItem(key+'_checked_at');notify('Attendance checked out');setCheckedIn(false);
    }
  };
  return <><PageTitle eyebrow="TIME & ATTENDANCE" title="Attendance" sub="Your working hours, presence and monthly timesheet." action={<button className="primary" onClick={()=>notify('Attendance export opened')}><Download size={16}/> Export</button>}/><div className="attendance-grid"><div className="panel clockcard"><span>Today's status</span><strong>{checkedIn?`${String(Math.floor((now.getTime()-new Date(localStorage.getItem(key+'_checked_at')||now.toISOString()).getTime())/3600000)).padStart(2,'0')}:${String(Math.floor(((now.getTime()-new Date(localStorage.getItem(key+'_checked_at')||now.toISOString()).getTime())/60000)%60)).padStart(2,'0')}:${String(Math.floor(((now.getTime()-new Date(localStorage.getItem(key+'_checked_at')||now.toISOString()).getTime())/1000)%60)).padStart(2,'0')}`:'00:00:00'}</strong><small>{longDateLabel(now)}</small><div className="clockline"><span>{checkedIn?checkInAt:'Not checked in'}</span><span>06:00 PM expected</span></div><button className="primary" onClick={toggle}>{checkedIn?'Check out':'Check in'}</button></div><div className="panel"><div className="panel-head"><div><h2>September summary</h2><p>Current month</p></div><button className="iconbtn" onClick={()=>notify('Attendance options opened')}><MoreHorizontal size={18}/></button></div><div className="attstats"><div><b>19</b><span>Present</span></div><div><b>01</b><span>Leave</span></div><div><b>00</b><span>Absent</span></div><div><b>08h 42m</b><span>Avg. hours</span></div></div></div></div><section className="panel"><div className="panel-head"><div><h2>Recent attendance</h2><p>Latest submitted entries</p></div></div>{['Sep 30','Sep 29','Sep 28','Sep 25'].map((d,i)=><div className="attrow" key={d}><b>{d}</b><span>Present</span><span>09:{18-i*3} AM</span><span>06:{2+i*4} PM</span><strong>{i===0?'08h 42m':'08h 3'+i+'m'}</strong></div>)}</section></>;
}
function Leave({notify}:{notify:(s:string)=>void}){return <><PageTitle eyebrow="TIME OFF" title="Leave & Holidays" sub="Manage leave requests, balances and the company holiday calendar." action={<button className="primary" onClick={()=>notify('Leave request form opened')}><Plus size={16}/> Request leave</button>}/><div className="leavecards">{[['18.5','Annual leave','days available'],['07.0','Sick leave','days available'],['02','Pending requests','awaiting approval']].map((x,i)=><div className="stat" key={i}><span>{x[1]}</span><strong>{x[0]}</strong><small>{x[2]}</small></div>)}</div><section className="panel"><div className="panel-head"><div><h2>Requests</h2><p>Your recent leave activity</p></div></div>{[['Oct 05 – Oct 06','Annual leave','2 days','Pending'],['Aug 19','Sick leave','1 day','Approved'],['Jul 11 – Jul 12','Annual leave','2 days','Approved']].map((x,i)=><div className="leave-row" key={i}><div><b>{x[0]}</b><span>{x[1]}</span></div><strong>{x[2]}</strong><label className={x[3].toLowerCase()}>{x[3]}</label></div>)}</section></>}
function Documents({notify}:{notify:(s:string)=>void}){return <><PageTitle eyebrow="KNOWLEDGE HUB" title="Documents" sub="Policies, project files and company resources in one place." action={<button className="primary" onClick={()=>notify('Document upload opened')}><Plus size={16}/> Upload</button>}/><div className="docgrid">{[['Company Policy Handbook','Policies','PDF','2.4 MB'],['Project Charter — Analytics Platform','Projects','PDF','1.8 MB'],['Employee Benefits Guide','HR','PDF','950 KB'],['Data Security Standards','Compliance','PDF','3.1 MB'],['Q3 Business Review','Reports','PPTX','5.6 MB'],['Client Delivery Checklist','Templates','DOCX','420 KB']].map((d,i)=><div className="doc" key={i}><div className="fileicon"><FileText size={22}/></div><div><b>{d[0]}</b><span>{d[1]} · {d[2]} · {d[3]}</span></div><button className="iconbtn" onClick={()=>notify(d[0]+' download requested')}><Download size={17}/></button></div>)}</div></>}
function Calendar(){const[current,setCurrent]=useState(new Date(new Date().getFullYear(),new Date().getMonth(),1));const year=current.getFullYear(),month=current.getMonth();const first=(new Date(year,month,1).getDay()+6)%7;const days=new Date(year,month+1,0).getDate();const prev=()=>setCurrent(new Date(year,month-1,1));const next=()=>setCurrent(new Date(year,month+1,1));const label=current.toLocaleDateString('en-US',{month:'long',year:'numeric'});return <><PageTitle eyebrow="PLANNING" title="Calendar" sub="Meetings, milestones and company events."/><div className="calendar-panel panel"><div className="month"><button onClick={prev}>‹</button><h2>{label}</h2><button onClick={next}>›</button></div><div className="week">{['MON','TUE','WED','THU','FRI','SAT','SUN'].map(x=><span key={x}>{x}</span>)}{Array.from({length:first+days},(_,i)=>{const day=i-first+1;if(day<1)return <div className="empty-day" key={'e'+i}></div>;const today=new Date();const isToday=day===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();return <div className={isToday?'today':''} key={day}><b>{day}</b>{[2,8,14,21,30].includes(day)&&<small>Meeting</small>}</div>})}</div></div></>}
function Announcements({notify}:{notify:(s:string)=>void}){return <><PageTitle eyebrow="COMPANY NEWS" title="Announcements" sub="Stay current with company updates and important notices."/><div className="announcements">{[['Annual strategy town hall','Leadership','Sep 29','Join us for the FY27 strategy and operating priorities town hall.'],['Security awareness month','IT & Security','Sep 25','Mandatory security refresher training is now available in the learning hub.'],['New analytics practice launch','Business Update','Sep 22','Our new Decision Intelligence practice is now live across three regions.']].map((a,i)=><article className="announcement" key={i}><div className="annicon">{i===0?'★':i===1?'✓':'↗'}</div><div><label>{a[1]} · {a[2]}</label><h2>{a[0]}</h2><p>{a[3]}</p><button className="link" onClick={()=>notify(a[0]+' announcement opened')}>Read announcement <ArrowUpRight size={15}/></button></div></article>)}</div></>}
function Performance({notify}:{notify:(s:string)=>void}){const cards:[string,string,string,any][]=[['FY27 Goals','4 active goals','72% complete',Target],['Quarterly review','Q3 review cycle','Submitted · Sep 26',FileCheck],['Feedback','3 feedback requests','1 awaiting response',MessageSquare],['Growth plan','Analytics leadership track','In progress',TrendingUp]];return <><PageTitle eyebrow="PEOPLE & PERFORMANCE" title="Performance" sub="Goals, feedback cycles and growth progress in one place." action={<button className="primary" onClick={()=>notify('Goal editor opened')}><Plus size={16}/> Add goal</button>}/><div className="business-grid">{cards.map(([a,b,d,I],i)=><div className="business-card" key={i}><div className="business-icon">{React.createElement(I,{size:20})}</div><span>{a}</span><h2>{b}</h2><p>{d}</p><button className="link" onClick={()=>notify(String(a)+' opened')}>Open <ArrowUpRight size={14}/></button></div>)}</div><section className="panel"><div className="panel-head"><div><h2>Current goals</h2><p>FY27 objectives aligned to your team priorities</p></div></div>{[['Improve data quality automation','Analytics Platform','85%'],['Deliver risk dashboard refresh','Risk Analytics','62%'],['Complete advanced SQL learning path','Personal development','40%']].map((g,i)=><div className="goal-row" key={i}><div><b>{g[0]}</b><span>{g[1]}</span></div><strong>{g[2]}</strong><div className="progress"><i style={{width:g[2]}}></i></div></div>)}</section></>}
function Learning({notify}:{notify:(s:string)=>void}){return <><PageTitle eyebrow="LEARNING & DEVELOPMENT" title="Learning Hub" sub="Courses, certifications and mandatory training assigned to you."/><div className="business-grid">{[['Advanced SQL for Analytics','Learning path','8 modules · 72% complete'],['Information Security','Mandatory','Due Oct 04 · 25 min'],['Leadership Essentials','Recommended','12 lessons · 18% complete'],['Power BI Advanced','Certification','Exam readiness · 64%']].map((x,i)=><div className="business-card course" key={i}><div className="course-top"><span>{x[1]}</span><b>{i===0?'72%':i===3?'64%':'New'}</b></div><h2>{x[0]}</h2><p>{x[2]}</p><div className="progress"><i style={{width:i===0?'72%':i===3?'64%':i===1?'10%':'18%'}}></i></div><button className="primary" onClick={()=>notify('Course opened')}>{i===1?'Start training':'Continue'}</button></div>)}</div></>}
function Expenses({notify}:{notify:(s:string)=>void}){return <><PageTitle eyebrow="FINANCE & REIMBURSEMENTS" title="Expenses" sub="Submit, track and review business expenses and reimbursements." action={<button className="primary" onClick={()=>notify('Expense form opened')}><Plus size={16}/> New expense</button>}/><div className="stats">{[['This month','₹18,420','6 claims'],['Pending','₹7,850','2 approvals'],['Reimbursed','₹10,570','4 paid'],['Policy limit','₹50,000','Monthly']].map((x,i)=><div className="stat" key={i}><span>{x[0]}</span><strong>{x[1]}</strong><small>{x[2]}</small></div>)}</div><section className="panel"><div className="panel-head"><div><h2>Recent claims</h2><p>Expense submissions and reimbursement status</p></div></div>{[['EXP-24091','Client meeting travel','₹4,280','Approved'],['EXP-24088','Team lunch','₹3,570','Pending'],['EXP-24074','Office supplies','₹1,820','Reimbursed'],['EXP-24061','Taxi · client visit','₹1,440','Reimbursed']].map((e,i)=><div className="expense-row" key={i}><div><b>{e[0]}</b><span>{e[1]}</span></div><strong>{e[2]}</strong><label className={e[3].toLowerCase()}>{e[3]}</label><button className="iconbtn" onClick={()=>notify(e[0]+' details opened')}><ChevronRight size={16}/></button></div>)}</section></>}
function Assets({notify}:{notify:(s:string)=>void}){const assets:[string,string,string,string,any][]=[['ThinkPad T490','Laptop','DPA-LT-0248','Assigned',Laptop2],['Samsung F36','Mobile','DPA-MB-0912','Assigned',Phone],['Microsoft 365','Software','LIC-88421','Active',Globe2],['VPN Access','Security','SEC-12048','Active',ShieldCheck]];return <><PageTitle eyebrow="IT & WORKPLACE" title="My Assets" sub="Company devices, software licenses and assigned workplace equipment." action={<button className="primary" onClick={()=>notify('Asset request opened')}><Plus size={16}/> Request asset</button>}/><div className="business-grid">{assets.map((x,i)=>{const I=x[4];return <div className="business-card asset-card" key={i}><div className="business-icon"><I size={20}/></div><span>{x[1]}</span><h2>{x[0]}</h2><p>{x[2]}</p><label className="asset-status">{x[3]}</label><button className="link" onClick={()=>notify(String(x[0])+' details opened')}>View details <ArrowUpRight size={14}/></button></div>})}</div></>}
function Support({notify}:{notify:(s:string)=>void}){return <><PageTitle eyebrow="HELP CENTER" title="Support" sub="Get help with technology, HR, facilities and workplace services."/><div className="supportgrid">{[['IT Service Desk','Laptop, access, software and connectivity','Create ticket'],['People & HR','Benefits, payroll, leave and employee support','Contact HR'],['Facilities','Office access, seating and workplace services','Request help']].map(x=><div className="supportcard"><Headphones size={24}/><h2>{x[0]}</h2><p>{x[1]}</p><button className="primary" onClick={()=>notify(x[2]+' opened')}>{x[2]} <ArrowUpRight size={15}/></button></div>)}</div><section className="panel"><div className="panel-head"><div><h2>My tickets</h2><p>Recent support requests</p></div></div>{[['IT-10482','VPN access renewal','IT Service Desk','Open'],['HR-09812','Leave policy clarification','People & HR','Resolved']].map(t=><div className="ticket"><b>{t[0]}</b><span>{t[1]}</span><span>{t[2]}</span><label>{t[3]}</label></div>)}</section></>}
function Profile({notify}:{notify:(s:string)=>void}){return <><PageTitle eyebrow="MY ACCOUNT" title="Mahesh Shirsath" sub="Employee profile and workspace preferences." action={<button className="ghost" onClick={()=>notify('Profile settings opened')}><Settings size={16}/> Settings</button>}/><section className="profile panel"><div className="profilehero"><div className="bigavatar">MS</div><div><h2>Mahesh Shirsath</h2><p>Analytics · Employee ID DPA-0247</p><span><MapPin size={14}/> Nashik, Maharashtra · India</span></div></div><div className="profilegrid">{[['Work email','mahesh.shirsath@decimalpointanalytics.com'],['Department','Analytics & Insights'],['Manager','Rohan Kulkarni'],['Joined','July 15, 2024'],['Role','Business / Data Analyst'],['Work mode','Hybrid']].map(x=><div key={x[0]}><label>{x[0]}</label><b>{x[1]}</b></div>)}</div></section></>}
function Admin({notify}:{notify:(s:string)=>void}){const adminCards:[string,string,any][]=[['People & access','Manage employee records, roles and permissions',Users],['Projects & delivery','Portfolio, milestones and project health',Briefcase],['Reports & analytics','Operational dashboards and exports',TrendingUp],['Policies & security','Controls, policies and audit activity',ShieldCheck]];return <><PageTitle eyebrow="ADMINISTRATION" title="Admin Center" sub="People, operations and workspace controls." action={<button className="primary" onClick={()=>notify('Employee invite opened')}><Plus size={16}/> Add employee</button>}/><div className="adminstats">{[['Employees','248','+12 this quarter'],['Active projects','42','6 launching soon'],['Open approvals','17','Needs attention'],['System health','99.98%','All services operational']].map(x=><div className="stat"><span>{x[0]}</span><strong>{x[1]}</strong><small>{x[2]}</small></div>)}</div><div className="admincards">{adminCards.map(([a,b,I])=><button className="admincard" onClick={()=>notify(String(a)+' opened')}><I size={24}/><div><b>{a}</b><span>{b}</span></div><ChevronRight/></button>)}</div></>}

createRoot(document.getElementById('root')!).render(<App/>);
