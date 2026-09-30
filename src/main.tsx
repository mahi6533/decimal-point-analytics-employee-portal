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
         section==='My Work'?<MyWork query={query}/>:
         section==='Projects'?<Projects notify={notify}/>:
         section==='Directory'?<Directory query={query}/>:
         section==='Attendance'?<Attendance/>:
         section==='Timesheet'?<Timesheet notify={notify}/>:
         section==='Leave'?<Leave notify={notify}/>:
         section==='Documents'?<Documents/>:
         section==='Calendar'?<Calendar/>:
         section==='Announcements'?<Announcements/>:
         section==='Performance'?<Performance notify={notify}/>:
         section==='Learning'?<Learning notify={notify}/>:
         section==='Expenses'?<Expenses notify={notify}/>:
         section==='Payroll'?<Payroll notify={notify}/>:
         section==='Benefits'?<Benefits notify={notify}/>:
         section==='Travel'?<Travel notify={notify}/>:
         section==='Assets'?<Assets notify={notify}/>:
         section==='Support'?<Support notify={notify}/>:
         section==='Profile'?<Profile/>:
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

    {toast&&<div className="toast">✓ {toast}</div>}
  </div>;
}

function AuthScreen({onDemo}:{onDemo:()=>void}){const[mode,setMode]=useState<'signin'|'signup'>('signin');const[name,setName]=useState('');const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[busy,setBusy]=useState(false);const[message,setMessage]=useState('');const[diagnostic,setDiagnostic]=useState<'checking'|'reachable'|'unreachable'>('checking');const[diagnosticText,setDiagnosticText]=useState('Checking Supabase Auth…');const authDirectUrl=(import.meta.env.VITE_SUPABASE_URL as string|undefined)||'';useEffect(()=>{let active=true;(async()=>{try{const controller=new AbortController();const timer=window.setTimeout(()=>controller.abort(),7000);const res=await fetch(authDirectUrl+'/auth/v1/health',{method:'GET',headers:{apikey:(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string|undefined)||''},signal:controller.signal});window.clearTimeout(timer);if(!res.ok)throw new Error('HTTP '+res.status);if(active){setDiagnostic('reachable');setDiagnosticText('Supabase Auth is reachable directly.')}}catch(error:any){if(active){setDiagnostic('unreachable');setDiagnosticText(error?.name==='AbortError'?'Supabase Auth check timed out.':error?.message||'Supabase Auth could not be reached directly.')}}})();return()=>{active=false}},[authDirectUrl]);const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setMessage('');try{if(mode==='signup'){if(password.length<6){setMessage('Password must be at least 6 characters.');setBusy(false);return}const {data,error}=await supabaseAuth.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim()||email.split('@')[0]}}});if(error)throw error;setMessage(data.session?'Account created.':'Account created. Check your email to confirm it, then sign in.')}else{const {error}=await supabaseAuth.auth.signInWithPassword({email:email.trim(),password});if(error)throw error}}catch(error:any){const raw=error?.message||'Authentication failed.';setMessage(raw==='Failed to fetch'?'Failed to fetch — the browser could not reach Supabase Auth. Use the diagnostic status below to identify whether this is a network/service issue.':raw)}finally{setBusy(false)}};return <div className="auth-shell"><div className="auth-card"><div className="auth-brand"><div className="mark">D</div><div><b>DECIMAL POINT</b><span>ANALYTICS</span></div></div><div className="auth-eyebrow">SECURE EMPLOYEE PORTAL</div><h1>{mode==='signin'?'Welcome back':'Create your employee account'}</h1><p className="auth-sub">{mode==='signin'?'Sign in to access your Decimal Point Analytics workspace.':'Create an account to access the employee workspace.'}</p><form onSubmit={submit}>{mode==='signup'&&<label>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Mahesh Shirsath" required/></label>}<label>Work email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" minLength={6} required/></label>{message&&<div className="auth-message">{message}</div>}<button className="primary auth-submit" disabled={busy}>{busy?'Please wait…':mode==='signin'?'Sign in':'Create account'}</button></form><button className="auth-switch" onClick={()=>{setMode(mode==='signin'?'signup':'signin');setMessage('')}}>{mode==='signin'?'Need an account? Create one':'Already have an account? Sign in'}</button><div className="auth-diagnostic"><span className={diagnostic}></span><div><b>Auth connection</b><small>{diagnosticText}</small></div></div><button type="button" className="auth-switch" onClick={onDemo}>Continue in demo workspace</button><div className="auth-note"><ShieldCheck size={16}/> Authentication is handled securely by Supabase.</div></div></div>}

function PageTitle({eyebrow,title,sub,action}:{eyebrow:string,title:string,sub:string,action?:React.ReactNode}){return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{sub}</p></div>{action}</div>}
function Overview({notify,setSection}:{notify:(s:string)=>void,setSection:(s:Section)=>void}){
  const attendanceKey='dpa_attendance_'+new Date().toISOString().slice(0,10);
  const[attendanceMarked,setAttendanceMarked]=useState(()=>localStorage.getItem(attendanceKey)==='1');
  const[period,setPeriod]=useState('This month');
  const markAttendance=()=>{localStorage.setItem(attendanceKey,'1');setAttendanceMarked(true);notify('Attendance marked for today');};
  const quick=(section:Section,message:string)=>{setSection(section);notify(message);};

  return <>
    <section className="dashboard-hero">
      <div className="hero-copy">
        <div className="eyebrow">EMPLOYEE COMMAND CENTER · SEPTEMBER 30, 2026</div>
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
      {[
        ['Utilization','86.2%','+4.1%','vs last month',TrendingUp,'up'],
        ['Active delivery','06','2','milestones this week',FolderKanban,''],
        ['Open tasks','14','5','due this week',CheckSquare,''],
        ['Billable hours','132h','+8h','vs plan',Clock3,'up'],
        ['Leave balance','18.5','2','requests pending',CalendarDays,''],
        ['Learning','72%','3','courses in progress',GraduationCap,'up']
      ].map(([label,value,delta,caption,Icon,tone],i)=><div className="kpi-card" key={i}>
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
        {[
          ['Client data quality review','Analytics Platform','Due today','High','72%',AlertTriangle],
          ['Information security training','Learning Hub','Due Oct 04','Required','10%',ShieldCheck],
          ['Quarterly dashboard refresh','Risk Analytics','Due Oct 06','Medium','41%',BarChart3],
          ['October leave request','People Operations','Pending approval','Normal','—',CalendarDays]
        ].map(([title,meta,due,priority,pct,Icon],i)=><button className="attention-row" key={i} onClick={()=>notify(String(title)+' opened')}>
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
          ['Oct 04','Security refresher deadline','Learning Hub','Required']
        ].map((x,i)=><div className="upcoming-row" key={i}><time>{x[0]}</time><div><b>{x[1]}</b><span>{x[2]}</span></div><small>{x[3]}</small></div>)}
      </section>
    </div>

    <section className="panel portfolio-panel">
      <div className="panel-head"><div><div className="eyebrow">DELIVERY PORTFOLIO</div><h2>Active engagements</h2><p>Portfolio health across assigned programs and workstreams.</p></div><button className="link" onClick={()=>setSection('Projects')}>Open portfolio <ArrowUpRight size={15}/></button></div>
      <div className="portfolio-table">
        <div className="portfolio-head"><span>Program</span><span>Workstream</span><span>Health</span><span>Progress</span><span>Owner</span><span>Next milestone</span></div>
        {[
          ['Analytics Platform','Data quality & automation','On track','92%','Mahesh','Oct 03'],
          ['Risk Analytics','Executive dashboard','On track','76%','Mahesh','Oct 06'],
          ['Client Intelligence','Research pipeline','Watch','58%','Priya Nair','Oct 10'],
          ['Enterprise Data Hub','Data engineering','Planning','34%','Vikram Mehta','Oct 18']
        ].map((p,i)=><div className="portfolio-row" key={i}><div><b>{p[0]}</b><span>{p[1]}</span></div><span className={'health '+String(p[2]).toLowerCase().replace(' ','-')}>{p[2]}</span><div className="table-progress"><i style={{width:p[3]}}></i></div><strong>{p[3]}</strong><span>{p[4]}</span><span>{p[5]}</span></div>)}
      </div>
    </section>

    <div className="dashboard-footer-grid">
      <section className="panel compact-panel">
        <div className="panel-head"><div><h2>Latest announcements</h2><p>Company-wide updates</p></div><button className="link" onClick={()=>setSection('Announcements')}>View all</button></div>
        {[
          ['Annual strategy town hall','Leadership','Sep 29'],
          ['Security awareness month','IT & Security','Sep 25'],
          ['New analytics practice launch','Business Update','Sep 22']
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
function MyWork({query}:{query:string}){const[selected,setSelected]=useState<any[]|null>(null);const[filter,setFilter]=useState('all');let data=tasks.filter(x=>x.join(' ').toLowerCase().includes(query.toLowerCase()));if(filter==='week')data=data.slice(0,3);return <><PageTitle eyebrow="WORK MANAGEMENT" title="My Work" sub="Track deliverables, priorities and project commitments." action={<button className="primary" onClick={()=>setSelected(['New task','Internal','Today','Medium','0%'])}><Plus size={16}/> New task</button>}/><div className="filterbar"><button className={'filter '+(filter==='all'?'active':'')} onClick={()=>setFilter('all')}>All tasks · 14</button><button className={'filter '+(filter==='projects'?'active':'')} onClick={()=>setFilter('projects')}>My projects</button><button className={'filter '+(filter==='week'?'active':'')} onClick={()=>setFilter('week')}>Due this week</button><span></span><div className="smallsearch"><Search size={16}/>{query||'Filter results'}</div></div><section className="panel"><div className="table-head"><span>Task</span><span>Project</span><span>Due</span><span>Priority</span><span>Progress</span></div>{data.map((t,i)=><button className="table-row task-click" key={i} onClick={()=>setSelected(t)}><div><div className="rowtitle"><span className="check"></span><b>{t[0]}</b></div><small>Owner: Mahesh Shirsath</small></div><span>{t[1]}</span><span>{t[2]}</span><label className={'priority '+t[3].toLowerCase()}>{t[3]}</label><div className="rowprogress"><i style={{width:t[4]}}></i><small>{t[4]}</small></div></button>)}</section>{selected&&<div className="task-overlay" onClick={()=>setSelected(null)}><div className="task-modal" onClick={e=>e.stopPropagation()}><div className="task-modal-head"><div><span className="eyebrow">TASK DETAILS</span><h2>{selected[0]}</h2><p>Assigned to Mahesh Shirsath · {selected[1]}</p></div><button className="iconbtn" onClick={()=>setSelected(null)}>×</button></div><div className="task-detail-grid"><div><span>Project</span><b>{selected[1]}</b></div><div><span>Due date</span><b>{selected[2]}</b></div><div><span>Priority</span><label className={'priority '+selected[3].toLowerCase()}>{selected[3]}</label></div><div><span>Status</span><b>{selected[4]==='100%'?'Completed':'In progress'}</b></div></div><div className="task-progress-large"><div><span>Completion</span><b>{selected[4]}</b></div><div className="progress"><i style={{width:selected[4]}}></i></div></div><div className="task-description"><h3>Task overview</h3><p>Review assigned deliverables, validate the latest data, document findings and prepare the work package for the next project milestone. Update the task when a review or client dependency is completed.</p><h3>Checklist</h3><label><input type="checkbox" defaultChecked/> Review source data and requirements</label><label><input type="checkbox"/> Validate outputs and exceptions</label><label><input type="checkbox"/> Upload supporting documents</label><label><input type="checkbox"/> Mark deliverable ready for review</label></div><div className="task-modal-actions"><button className="ghost" onClick={()=>setSelected(null)}>Close</button><button className="primary" onClick={()=>setSelected(null)}>Update task</button></div></div></div>}</>}

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
  return <><PageTitle eyebrow="TOTAL REWARDS" title="Benefits & Perks" sub="Health, insurance, allowances and employee wellbeing programs." action={<button className="primary" onClick={()=>notify('Benefits enrollment opened')}><Plus size={16}/> Manage benefits</button>}/><div className="business-grid">{[['Health insurance','Family floater','₹5L coverage','Active',HeartHandshake],['Meal allowance','Monthly wallet','₹2,500 / month','Active',WalletCards],['Internet allowance','Hybrid work support','₹1,500 / month','Eligible',Globe2],['Wellness program','Learning & wellbeing','10 credits / year','6 used',Sparkles]].map((x,i)=><div className="business-card benefit-card" key={i}><div className="business-icon">{React.createElement(x[4] as any,{size:20})}</div><span>{x[1]}</span><h2>{x[0]}</h2><p>{x[2]}</p><label className="asset-status">{x[3]}</label><button className="link" onClick={()=>notify(x[0]+' details opened')}>View details <ArrowUpRight size={14}/></button></div>)}</div><section className="panel"><div className="panel-head"><div><h2>Benefits contacts</h2><p>People to contact when you need support</p></div></div>{[['People Operations','Ritika Shah','Benefits specialist','Mumbai'],['Insurance desk','Corporate Benefits Team','Claims & queries','Remote'],['Wellbeing','Employee Assistance','Confidential support','Remote']].map((x,i)=><div className="contact-row" key={i}><div className="personavatar">{['RS','CB','EA'][i]}</div><div><b>{x[0]}</b><span>{x[1]} · {x[2]}</span></div><small>{x[3]}</small><button className="iconbtn" onClick={()=>notify('Contact options opened')}><Mail size={15}/></button></div>)}</section></>;
}

function Travel({notify}:{notify:(s:string)=>void}){
  return <><PageTitle eyebrow="BUSINESS TRAVEL" title="Travel Desk" sub="Manage travel requests, itineraries, policy approvals and reimbursements." action={<button className="primary" onClick={()=>notify('Travel request started')}><Plus size={16}/> New travel request</button>}/><div className="stats">{[['Upcoming travel','02','Trips this quarter'],['Pending approvals','01','Needs manager review'],['Travel budget','₹86,000','FY remaining'],['Policy compliance','98%','Current profile']].map(x=><div className="stat"><span>{x[0]}</span><strong>{x[1]}</strong><small>{x[2]}</small></div>)}</div><section className="panel"><div className="panel-head"><div><h2>Travel requests</h2><p>Active and upcoming business travel</p></div></div>{[['TRV-24014','Mumbai → Bengaluru','Oct 08 – Oct 10','Client workshop','Approved'],['TRV-24007','Nashik → Mumbai','Oct 15','Leadership offsite','Pending'],['TRV-23988','Pune → Hyderabad','Sep 05 – Sep 07','Project kickoff','Completed']].map((x,i)=><div className="travel-row" key={i}><div className="travel-icon"><PlaneTakeoff size={17}/></div><div><b>{x[0]} · {x[1]}</b><span>{x[2]} · {x[3]}</span></div><label className={x[4].toLowerCase()}>{x[4]}</label><button className="iconbtn" onClick={()=>notify(x[0]+' itinerary opened')}><ChevronRight size={15}/></button></div>)}</section><div className="grid2"><section className="panel"><div className="panel-head"><div><h2>Travel policy</h2><p>Your default policy profile</p></div></div><div className="policy-list"><div><span>Air travel</span><b>Economy under 4h</b></div><div><span>Hotel</span><b>Up to ₹6,000 / night</b></div><div><span>Local transport</span><b>Company policy</b></div></div></section><section className="panel"><div className="panel-head"><div><h2>Travel support</h2><p>Need help while on the move?</p></div></div><button className="support-action" onClick={()=>notify('Travel support opened')}><Headphones size={18}/><div><b>24×7 assistance</b><span>Emergency travel desk and itinerary support</span></div><ChevronRight size={15}/></button></section></div></>;
}

function SettingsPage({notify}:{notify:(s:string)=>void}){
  const prefs=[['Desktop notifications','Receive task, leave and service alerts','On'],['Weekly digest','Get a Friday summary of work and people activity','On'],['Calendar reminders','15 minute reminder before meetings','On'],['Product updates','News about new portal features','Off']];
  return <><PageTitle eyebrow="WORKSPACE PREFERENCES" title="Settings" sub="Personalize notifications, security and workspace behavior." action={<button className="primary" onClick={()=>notify('Settings saved')}><CheckCircle2 size={16}/> Save changes</button>}/><div className="grid2"><section className="panel settings-panel"><div className="panel-head"><div><h2>Notifications</h2><p>Choose what reaches your work inbox</p></div></div>{prefs.map((p,i)=><div className="setting-row" key={i}><div><b>{p[0]}</b><span>{p[1]}</span></div><button className={'toggle '+(p[2]==='On'?'on':'')} onClick={()=>notify(p[0]+' preference updated')}><i></i><span>{p[2]}</span></button></div>)}</section><section className="panel"><div className="panel-head"><div><h2>Security</h2><p>Account controls and active sessions</p></div></div>{[['MFA','Enabled · Authenticator app','Protected'],['Password','Last changed 38 days ago','Healthy'],['Sessions','2 active sessions','Review']].map((x,i)=><div className="simple-row" key={i}><div><b>{x[0]}</b><span>{x[1]}</span></div><label>{x[2]}</label><button className="link" onClick={()=>notify(x[0]+' settings opened')}>Manage</button></div>)}</section></div><section className="panel"><div className="panel-head"><div><h2>Workspace appearance</h2><p>Choose how the employee portal feels and behaves</p></div></div><div className="appearance-grid">{[['Density','Comfortable','Rows, cards and spacing'],['Theme','System','Matches your device'],['Start page','Overview','Open the dashboard on sign-in']].map(x=><button key={x[0]} className="appearance-card" onClick={()=>notify(x[0]+' preference selected')}><span>{x[0]}</span><b>{x[1]}</b><small>{x[2]}</small><ChevronRight size={15}/></button>)}</div></section></>;
}

function Directory({query}:{query:string}){let d=people.filter(p=>p.join(' ').toLowerCase().includes(query.toLowerCase()));return <><PageTitle eyebrow="PEOPLE & TEAMS" title="Company Directory" sub="Find colleagues, teams and business contacts across Decimal Point Analytics."/><div className="directory">{d.map((p,i)=><div className="person" key={i}><div className="personavatar">{p[0]}</div><div><b>{p[1]}</b><span>{p[2]}</span><small><MapPin size={13}/>{p[3]}</small></div><button className="iconbtn"><Mail size={17}/></button></div>)}</div></>}
function Attendance(){return <><PageTitle eyebrow="TIME & ATTENDANCE" title="Attendance" sub="Your working hours, presence and monthly timesheet." action={<button className="primary"><Download size={16}/> Export</button>}/><div className="attendance-grid"><div className="panel clockcard"><span>Today's status</span><strong>08:42:18</strong><small>Wednesday · Sep 30</small><div className="clockline"><span>09:18 AM</span><span>06:00 PM expected</span></div><button className="primary">Checked in</button></div><div className="panel"><div className="panel-head"><div><h2>September summary</h2><p>Current month</p></div></div><div className="attstats"><div><b>19</b><span>Present</span></div><div><b>01</b><span>Leave</span></div><div><b>00</b><span>Absent</span></div><div><b>08h 42m</b><span>Avg. hours</span></div></div></div></div><section className="panel"><div className="panel-head"><div><h2>Recent attendance</h2><p>Latest submitted entries</p></div></div>{['Sep 30','Sep 29','Sep 28','Sep 25'].map((d,i)=><div className="attrow" key={d}><b>{d}</b><span>Present</span><span>09:{18-i*3} AM</span><span>06:{2+i*4} PM</span><strong>{i===0?'08h 42m':'08h 3'+i+'m'}</strong></div>)}</section></>}
function Leave({notify}:{notify:(s:string)=>void}){return <><PageTitle eyebrow="TIME OFF" title="Leave & Holidays" sub="Manage leave requests, balances and the company holiday calendar." action={<button className="primary" onClick={()=>notify('Leave request form opened')}><Plus size={16}/> Request leave</button>}/><div className="leavecards">{[['18.5','Annual leave','days available'],['07.0','Sick leave','days available'],['02','Pending requests','awaiting approval']].map((x,i)=><div className="stat" key={i}><span>{x[1]}</span><strong>{x[0]}</strong><small>{x[2]}</small></div>)}</div><section className="panel"><div className="panel-head"><div><h2>Requests</h2><p>Your recent leave activity</p></div></div>{[['Oct 05 – Oct 06','Annual leave','2 days','Pending'],['Aug 19','Sick leave','1 day','Approved'],['Jul 11 – Jul 12','Annual leave','2 days','Approved']].map((x,i)=><div className="leave-row" key={i}><div><b>{x[0]}</b><span>{x[1]}</span></div><strong>{x[2]}</strong><label className={x[3].toLowerCase()}>{x[3]}</label></div>)}</section></>}
function Documents(){return <><PageTitle eyebrow="KNOWLEDGE HUB" title="Documents" sub="Policies, project files and company resources in one place." action={<button className="primary"><Plus size={16}/> Upload</button>}/><div className="docgrid">{[['Company Policy Handbook','Policies','PDF','2.4 MB'],['Project Charter — Analytics Platform','Projects','PDF','1.8 MB'],['Employee Benefits Guide','HR','PDF','950 KB'],['Data Security Standards','Compliance','PDF','3.1 MB'],['Q3 Business Review','Reports','PPTX','5.6 MB'],['Client Delivery Checklist','Templates','DOCX','420 KB']].map((d,i)=><div className="doc" key={i}><div className="fileicon"><FileText size={22}/></div><div><b>{d[0]}</b><span>{d[1]} · {d[2]} · {d[3]}</span></div><button className="iconbtn"><Download size={17}/></button></div>)}</div></>}
function Calendar(){return <><PageTitle eyebrow="PLANNING" title="Calendar" sub="Meetings, milestones and company events."/><div className="calendar-panel panel"><div className="month"><button>‹</button><h2>September 2026</h2><button>›</button></div><div className="week">{['MON','TUE','WED','THU','FRI','SAT','SUN'].map(x=><span>{x}</span>)}{Array.from({length:30},(_,i)=><div className={i===29?'today':''}><b>{i+1}</b>{[2,8,14,21,30].includes(i+1)&&<small>Meeting</small>}</div>)}</div></div></>}
function Announcements(){return <><PageTitle eyebrow="COMPANY NEWS" title="Announcements" sub="Stay current with company updates and important notices."/><div className="announcements">{[['Annual strategy town hall','Leadership','Sep 29','Join us for the FY27 strategy and operating priorities town hall.'],['Security awareness month','IT & Security','Sep 25','Mandatory security refresher training is now available in the learning hub.'],['New analytics practice launch','Business Update','Sep 22','Our new Decision Intelligence practice is now live across three regions.']].map((a,i)=><article className="announcement"><div className="annicon">{i===0?'★':i===1?'✓':'↗'}</div><div><label>{a[1]} · {a[2]}</label><h2>{a[0]}</h2><p>{a[3]}</p><button className="link">Read announcement <ArrowUpRight size={15}/></button></div></article>)}</div></>}
function Performance({notify}:{notify:(s:string)=>void}){const cards:[string,string,string,any][]=[['FY27 Goals','4 active goals','72% complete',Target],['Quarterly review','Q3 review cycle','Submitted · Sep 26',FileCheck],['Feedback','3 feedback requests','1 awaiting response',MessageSquare],['Growth plan','Analytics leadership track','In progress',TrendingUp]];return <><PageTitle eyebrow="PEOPLE & PERFORMANCE" title="Performance" sub="Goals, feedback cycles and growth progress in one place." action={<button className="primary" onClick={()=>notify('Goal editor opened')}><Plus size={16}/> Add goal</button>}/><div className="business-grid">{cards.map(([a,b,d,I],i)=><div className="business-card" key={i}><div className="business-icon">{React.createElement(I,{size:20})}</div><span>{a}</span><h2>{b}</h2><p>{d}</p><button className="link" onClick={()=>notify(String(a)+' opened')}>Open <ArrowUpRight size={14}/></button></div>)}</div><section className="panel"><div className="panel-head"><div><h2>Current goals</h2><p>FY27 objectives aligned to your team priorities</p></div></div>{[['Improve data quality automation','Analytics Platform','85%'],['Deliver risk dashboard refresh','Risk Analytics','62%'],['Complete advanced SQL learning path','Personal development','40%']].map((g,i)=><div className="goal-row" key={i}><div><b>{g[0]}</b><span>{g[1]}</span></div><strong>{g[2]}</strong><div className="progress"><i style={{width:g[2]}}></i></div></div>)}</section></>}
function Learning({notify}:{notify:(s:string)=>void}){return <><PageTitle eyebrow="LEARNING & DEVELOPMENT" title="Learning Hub" sub="Courses, certifications and mandatory training assigned to you."/><div className="business-grid">{[['Advanced SQL for Analytics','Learning path','8 modules · 72% complete'],['Information Security','Mandatory','Due Oct 04 · 25 min'],['Leadership Essentials','Recommended','12 lessons · 18% complete'],['Power BI Advanced','Certification','Exam readiness · 64%']].map((x,i)=><div className="business-card course" key={i}><div className="course-top"><span>{x[1]}</span><b>{i===0?'72%':i===3?'64%':'New'}</b></div><h2>{x[0]}</h2><p>{x[2]}</p><div className="progress"><i style={{width:i===0?'72%':i===3?'64%':i===1?'10%':'18%'}}></i></div><button className="primary" onClick={()=>notify('Course opened')}>{i===1?'Start training':'Continue'}</button></div>)}</div></>}
function Expenses({notify}:{notify:(s:string)=>void}){return <><PageTitle eyebrow="FINANCE & REIMBURSEMENTS" title="Expenses" sub="Submit, track and review business expenses and reimbursements." action={<button className="primary" onClick={()=>notify('Expense form opened')}><Plus size={16}/> New expense</button>}/><div className="stats">{[['This month','₹18,420','6 claims'],['Pending','₹7,850','2 approvals'],['Reimbursed','₹10,570','4 paid'],['Policy limit','₹50,000','Monthly']].map((x,i)=><div className="stat" key={i}><span>{x[0]}</span><strong>{x[1]}</strong><small>{x[2]}</small></div>)}</div><section className="panel"><div className="panel-head"><div><h2>Recent claims</h2><p>Expense submissions and reimbursement status</p></div></div>{[['EXP-24091','Client meeting travel','₹4,280','Approved'],['EXP-24088','Team lunch','₹3,570','Pending'],['EXP-24074','Office supplies','₹1,820','Reimbursed'],['EXP-24061','Taxi · client visit','₹1,440','Reimbursed']].map((e,i)=><div className="expense-row" key={i}><div><b>{e[0]}</b><span>{e[1]}</span></div><strong>{e[2]}</strong><label className={e[3].toLowerCase()}>{e[3]}</label><button className="iconbtn" onClick={()=>notify(e[0]+' details opened')}><ChevronRight size={16}/></button></div>)}</section></>}
function Assets({notify}:{notify:(s:string)=>void}){const assets:[string,string,string,string,any][]=[['ThinkPad T490','Laptop','DPA-LT-0248','Assigned',Laptop2],['Samsung F36','Mobile','DPA-MB-0912','Assigned',Phone],['Microsoft 365','Software','LIC-88421','Active',Globe2],['VPN Access','Security','SEC-12048','Active',ShieldCheck]];return <><PageTitle eyebrow="IT & WORKPLACE" title="My Assets" sub="Company devices, software licenses and assigned workplace equipment." action={<button className="primary" onClick={()=>notify('Asset request opened')}><Plus size={16}/> Request asset</button>}/><div className="business-grid">{assets.map((x,i)=>{const I=x[4];return <div className="business-card asset-card" key={i}><div className="business-icon"><I size={20}/></div><span>{x[1]}</span><h2>{x[0]}</h2><p>{x[2]}</p><label className="asset-status">{x[3]}</label><button className="link" onClick={()=>notify(String(x[0])+' details opened')}>View details <ArrowUpRight size={14}/></button></div>})}</div></>}
function Support({notify}:{notify:(s:string)=>void}){return <><PageTitle eyebrow="HELP CENTER" title="Support" sub="Get help with technology, HR, facilities and workplace services."/><div className="supportgrid">{[['IT Service Desk','Laptop, access, software and connectivity','Create ticket'],['People & HR','Benefits, payroll, leave and employee support','Contact HR'],['Facilities','Office access, seating and workplace services','Request help']].map(x=><div className="supportcard"><Headphones size={24}/><h2>{x[0]}</h2><p>{x[1]}</p><button className="primary" onClick={()=>notify(x[2]+' opened')}>{x[2]} <ArrowUpRight size={15}/></button></div>)}</div><section className="panel"><div className="panel-head"><div><h2>My tickets</h2><p>Recent support requests</p></div></div>{[['IT-10482','VPN access renewal','IT Service Desk','Open'],['HR-09812','Leave policy clarification','People & HR','Resolved']].map(t=><div className="ticket"><b>{t[0]}</b><span>{t[1]}</span><span>{t[2]}</span><label>{t[3]}</label></div>)}</section></>}
function Profile(){return <><PageTitle eyebrow="MY ACCOUNT" title="Mahesh Shirsath" sub="Employee profile and workspace preferences." action={<button className="ghost"><Settings size={16}/> Settings</button>}/><section className="profile panel"><div className="profilehero"><div className="bigavatar">MS</div><div><h2>Mahesh Shirsath</h2><p>Analytics · Employee ID DPA-0247</p><span><MapPin size={14}/> Nashik, Maharashtra · India</span></div></div><div className="profilegrid">{[['Work email','mahesh.shirsath@decimalpointanalytics.com'],['Department','Analytics & Insights'],['Manager','Rohan Kulkarni'],['Joined','July 15, 2024'],['Role','Business / Data Analyst'],['Work mode','Hybrid']].map(x=><div><label>{x[0]}</label><b>{x[1]}</b></div>)}</div></section></>}
function Admin({notify}:{notify:(s:string)=>void}){const adminCards:[string,string,any][]=[['People & access','Manage employee records, roles and permissions',Users],['Projects & delivery','Portfolio, milestones and project health',Briefcase],['Reports & analytics','Operational dashboards and exports',TrendingUp],['Policies & security','Controls, policies and audit activity',ShieldCheck]];return <><PageTitle eyebrow="ADMINISTRATION" title="Admin Center" sub="People, operations and workspace controls." action={<button className="primary" onClick={()=>notify('Employee invite opened')}><Plus size={16}/> Add employee</button>}/><div className="adminstats">{[['Employees','248','+12 this quarter'],['Active projects','42','6 launching soon'],['Open approvals','17','Needs attention'],['System health','99.98%','All services operational']].map(x=><div className="stat"><span>{x[0]}</span><strong>{x[1]}</strong><small>{x[2]}</small></div>)}</div><div className="admincards">{adminCards.map(([a,b,I])=><button className="admincard" onClick={()=>notify(String(a)+' opened')}><I size={24}/><div><b>{a}</b><span>{b}</span></div><ChevronRight/></button>)}</div></>}

createRoot(document.getElementById('root')!).render(<App/>);
