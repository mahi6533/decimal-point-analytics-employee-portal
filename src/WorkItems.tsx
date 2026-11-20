import React,{useEffect,useState}from'react';import{createRoot}from'react-dom/client';import{LayoutDashboard,Users,Briefcase,CheckSquare,CalendarDays,Clock3,FileText,Bell,Headphones,Settings,Search,ChevronRight,ArrowUpRight,TrendingUp,ShieldCheck,Menu,X,LogOut,Building2,MapPin,Mail,Phone,Globe2,Plus,Download,MoreHorizontal,GraduationCap,WalletCards,Laptop2,Target,FileCheck,Command,MessageSquare,FolderKanban,ReceiptText,HeartHandshake,PlaneTakeoff,SlidersHorizontal,Sparkles,Sun,Moon,CheckCircle2,AlertTriangle,ArrowDownRight,UsersRound,CreditCard,Landmark,Network,BarChart3}from'lucide-react';import './work-items.css';import Dialog from './Dialog';
const today=new Date();
const dateLabel=(d:Date)=>d.toLocaleDateString('en-US',{month:'short',day:'2-digit'});
const longDateLabel=(d:Date)=>d.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',year:'numeric'});
const workDay=(offset:number)=>{const d=new Date();d.setDate(d.getDate()+offset);return dateLabel(d)};
const longWorkDay=(offset:number)=>{const d=new Date();d.setDate(d.getDate()+offset);return longDateLabel(d)};
const workDateValue=(label:string)=>{const now=new Date();let d=new Date(label+', '+now.getFullYear());if(Number.isNaN(d.getTime()))return new Date(now.getFullYear(),now.getMonth(),now.getDate());const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());const days=(d.getTime()-today.getTime())/86400000;if(days < -180)d=new Date(label+', '+(now.getFullYear()+1));return new Date(d.getFullYear(),d.getMonth(),d.getDate())};
const daysUntilWorkDate=(label:string)=>Math.round((workDateValue(label).getTime()-new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()).getTime())/86400000);
const dueBadge=(label:string,status:string)=>status==='Completed'?'Completed':daysUntilWorkDate(label)<0?'Overdue':daysUntilWorkDate(label)===0?'Due today':daysUntilWorkDate(label)<=7?'Due soon':'Upcoming';
function PageTitle({eyebrow,title,sub,action}:{eyebrow:string,title:string,sub:string,action?:React.ReactNode}){return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{sub}</p></div>{action}</div>}
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
  checked?:string[];
  checklist:string[];
  activity:string[];
  comments:string[];
};

export const seedWorkItems:WorkItem[]=[
  {
    id:'WK-1048',title:'Client data quality review',project:'Analytics Platform',type:'Delivery',client:'Global Banking Client',
    priority:'High',status:'In progress',progress:76,due:workDay(0),estimate:'6h',logged:'4h 50m',sprint:'Sprint 25',owner:'You',
    description:'Validate source-to-target data quality for the client analytics feed, reconcile exceptions and prepare the release-readiness note for the project manager.',
    deliverable:'DQ validation workbook + release-readiness summary',dependency:'Client source extract v7.2',
    checklist:['Review source data and mapping rules','Reconcile exception records','Validate corrected outputs','Upload DQ evidence pack','Mark deliverable ready for review'],
    activity:[workDay(0)+' · Exception set reconciled (38 records)',workDay(-1)+' · Validation workbook updated',workDay(-2)+' · Source extract v7.2 received'],
    comments:['Project lead · Please include the top 5 recurring exception patterns.']
  },
  {
    id:'WK-1051',title:'Quarterly dashboard refresh',project:'Risk Analytics',type:'Delivery',client:'Internal Risk Office',
    priority:'Medium',status:'In progress',progress:48,due:workDay(2),estimate:'10h',logged:'4h 05m',sprint:'Sprint 25',owner:'You',
    description:'Refresh the executive risk dashboard with the latest quarter-end metrics, validate measures against the finance pack and prepare the leadership review build.',
    deliverable:'Power BI dashboard v4 + metric reconciliation sheet',dependency:'Q3 finance pack',
    checklist:['Load quarter-end dataset','Refresh semantic model','Validate KPI calculations','Review dashboard layout','Publish review build'],
    activity:[workDay(0)+' · KPI variance check started',workDay(-1)+' · Q3 dataset loaded',workDay(-3)+' · Review comments incorporated'],
    comments:['Reviewer · Use the updated risk-severity definition in the September policy note.']
  },
  {
    id:'WK-1058',title:'Model validation pack',project:'Quant Research',type:'Delivery',client:'Research Practice',
    priority:'High',status:'In review',progress:71,due:workDay(4),estimate:'8h',logged:'5h 45m',sprint:'Sprint 25',owner:'You',
    description:'Complete the validation pack for the latest scoring model, covering stability metrics, drift observations, sample-level exceptions and sign-off evidence.',
    deliverable:'Validation memo + evidence annexure',dependency:'Model v2.3 output snapshot',
    checklist:['Run stability checks','Review drift indicators','Investigate sample exceptions','Prepare validation memo','Submit for peer review'],
    activity:[workDay(0)+' · Validation memo updated',workDay(-1)+' · Drift analysis complete',workDay(-3)+' · Sample review finished'],
    comments:['Analytics lead · Call out any material drift separately in the executive summary.']
  },
  {
    id:'WK-1062',title:'Knowledge base update',project:'Internal Analytics Enablement',type:'Delivery',client:'Decimal Point Analytics',
    priority:'Low',status:'Backlog',progress:26,due:workDay(8),estimate:'4h',logged:'1h 05m',sprint:'Sprint 26',owner:'You',
    description:'Turn recurring analytics support questions into concise internal knowledge articles with examples, troubleshooting steps and clear ownership guidance.',
    deliverable:'3 published knowledge articles',dependency:'SME review from Data Engineering',
    checklist:['Collect recurring questions','Draft article 1','Draft article 2','Draft article 3','Submit SME review'],
    activity:[workDay(-1)+' · Topic list created',workDay(-3)+' · Stakeholder interview completed'],
    comments:[]
  },
  {
    id:'WK-1070',title:'Client reconciliation exception pack',project:'Analytics Platform',type:'Delivery',client:'Global Banking Client',
    priority:'High',status:'Backlog',progress:8,due:workDay(5),estimate:'5h',logged:'0h',sprint:'Sprint 25',owner:'You',
    description:'Prepare a structured exception pack for unresolved client reconciliation items, including severity, business impact, source reference and proposed remediation owner.',
    deliverable:'Exception tracker + remediation ownership matrix',dependency:'Client reconciliation run #48',
    checklist:['Pull unresolved exceptions','Classify business impact','Assign remediation owners','Validate priority with PM','Publish exception pack'],
    activity:[workDay(0)+' · Task created for Sprint 25'],
    comments:[]
  },
  {
    id:'WK-1074',title:'Analytics release readiness review',project:'Enterprise Data Hub',type:'Delivery',client:'Technology Practice',
    priority:'Medium',status:'In progress',progress:39,due:workDay(7),estimate:'6h',logged:'2h 10m',sprint:'Sprint 25',owner:'You',
    description:'Review release-readiness evidence for the next analytics platform deployment and consolidate open validation, documentation and support actions.',
    deliverable:'Release-readiness checklist + sign-off tracker',dependency:'Deployment candidate RC-14',
    checklist:['Review deployment evidence','Validate test coverage','Check rollback notes','Confirm support runbook','Prepare sign-off summary'],
    activity:[workDay(0)+' · Test evidence review opened',workDay(-1)+' · RC-14 published'],
    comments:['Engineering lead · Please flag any unresolved environment dependency.']
  },
  {
    id:'SH-2101',title:'Internal analytics automation sprint',project:'Side Hustle & Innovation',type:'Side Hustle',client:'Internal Innovation Lab',
    priority:'High',status:'In progress',progress:63,due:workDay(1),estimate:'7h',logged:'4h 20m',sprint:'Innovation Sprint 04',owner:'You',
    description:'Prototype a reusable automation that converts recurring CSV quality checks into a repeatable review report. Keep the work separate from billable client delivery.',
    deliverable:'Automation prototype + sample output report',dependency:'Approved sample CSV dataset',
    checklist:['Define input/output contract','Create validation rules','Build repeatable report generation','Test against sample datasets','Review with analytics lead'],
    activity:[workDay(0)+' · Null/duplicate rules tested',workDay(-1)+' · Prototype folder updated',workDay(-2)+' · Innovation sprint scoped'],
    comments:['You · Keep the prototype generic so other teams can reuse it.']
  },
  {
    id:'SH-2104',title:'Power BI dashboard polish lab',project:'Side Hustle & Innovation',type:'Side Hustle',client:'Internal Innovation Lab',
    priority:'Medium',status:'In review',progress:82,due:workDay(3),estimate:'5h',logged:'4h 05m',sprint:'Innovation Sprint 04',owner:'You',
    description:'Experiment with an executive-friendly dashboard layout, consistent KPI cards, drill-through patterns and a compact mobile experience.',
    deliverable:'Dashboard design prototype + component guide',dependency:'Internal design feedback',
    checklist:['Review executive dashboard examples','Create component variations','Test drill-through interaction','Validate mobile layout','Share design guide'],
    activity:[workDay(0)+' · KPI component variants prepared',workDay(-1)+' · Mobile layout tested',workDay(-3)+' · Initial prototype reviewed'],
    comments:['Reviewer · Keep the visual system aligned with the enterprise portal.']
  },
  {
    id:'SH-2110',title:'Personal analytics portfolio case study',project:'Side Hustle & Innovation',type:'Side Hustle',client:'Professional Development',
    priority:'Low',status:'In progress',progress:34,due:workDay(10),estimate:'6h',logged:'1h 50m',sprint:'Personal Build',owner:'You',
    description:'Build a sanitized analytics case study covering problem framing, data quality, exploration, KPI design, validation and executive storytelling.',
    deliverable:'Portfolio case study PDF + dashboard walkthrough',dependency:'No confidential client data',
    checklist:['Define case-study problem','Create synthetic dataset','Build analysis notebook','Design executive dashboard','Write final case study'],
    activity:[workDay(-1)+' · Problem statement drafted',workDay(-3)+' · Synthetic dataset outline created'],
    comments:[]
  },
  {
    id:'SH-2116',title:'SQL performance pattern library',project:'Side Hustle & Innovation',type:'Side Hustle',client:'Internal Learning Guild',
    priority:'Low',status:'Completed',progress:100,due:workDay(-5),estimate:'3h',logged:'3h 05m',sprint:'Innovation Sprint 03',owner:'You',
    description:'Create a reusable library of SQL patterns for joins, deduplication, exception analysis and reconciliation workflows used by analytics teams.',
    deliverable:'SQL pattern library + examples',dependency:'Peer review completed',
    checklist:['Join pattern examples','Deduplication patterns','Reconciliation examples','Comment and document','Publish to learning hub'],
    activity:[workDay(-5)+' · Published to Learning Hub',workDay(-6)+' · Peer review completed',workDay(-8)+' · Examples finalized'],
    comments:['Project lead · Good reusable reference for new analysts.']
  },
  {
    id:'SH-2120',title:'Executive narrative template lab',project:'Side Hustle & Innovation',type:'Side Hustle',client:'Internal Innovation Lab',
    priority:'Medium',status:'Backlog',progress:12,due:workDay(6),estimate:'4h',logged:'0h 35m',sprint:'Innovation Sprint 04',owner:'You',
    description:'Create a reusable executive-storytelling template for analytics reviews covering headline insights, drivers, actions, risks and next steps.',
    deliverable:'Executive narrative template + sample review',dependency:'Leadership feedback slot',
    checklist:['Draft narrative structure','Create example KPI story','Add risk/action sections','Review with analytics lead','Publish template'],
    activity:[workDay(-1)+' · Outline drafted'],
    comments:[]
  },
  {
    id:'SH-2124',title:'Reusable data-quality rules catalog',project:'Side Hustle & Innovation',type:'Side Hustle',client:'Internal Quality Guild',
    priority:'High',status:'In progress',progress:44,due:workDay(9),estimate:'6h',logged:'2h 05m',sprint:'Innovation Sprint 04',owner:'You',
    description:'Build a reusable catalog of common data-quality checks with rule definitions, sample failures, severity guidance and suggested remediation.',
    deliverable:'DQ rules catalog + sample failure library',dependency:'Data governance glossary',
    checklist:['Define rule categories','Add null/duplicate checks','Add reconciliation checks','Map severity levels','Publish reusable catalog'],
    activity:[workDay(0)+' · Rule categories agreed',workDay(-2)+' · First sample failures added'],
    comments:['Quality lead · Add a short business-friendly explanation for each severity.']
  },
  {
    id:'WK-1081',title:'October capacity and sprint planning',project:'Analytics Operations',type:'Delivery',client:'Internal Analytics Leadership',
    priority:'Medium',status:'Backlog',progress:5,due:workDay(11),estimate:'3h',logged:'0h',sprint:'Sprint 26',owner:'You',
    description:'Prepare the upcoming sprint capacity view, identify committed versus discretionary work and highlight potential delivery conflicts before planning.',
    deliverable:'Sprint capacity sheet + priority recommendations',dependency:'Team allocation inputs',
    checklist:['Collect planned work','Estimate capacity','Identify conflicts','Prioritize commitments','Share planning summary'],
    activity:[workDay(0)+' · Planning request received'],
    comments:[]
  },
  {
    id:'WK-1086',title:'Client metrics definition audit',project:'Risk Analytics',type:'Delivery',client:'Internal Risk Office',
    priority:'High',status:'In progress',progress:31,due:workDay(13),estimate:'7h',logged:'1h 20m',sprint:'Sprint 26',owner:'You',
    description:'Audit KPI definitions used in the client risk reporting layer and reconcile calculation logic, ownership and source documentation.',
    deliverable:'Metric definition audit + approved glossary',dependency:'Risk metric glossary v2',
    checklist:['Inventory metrics','Compare definitions','Validate source mappings','Flag inconsistencies','Publish approved glossary'],
    activity:[workDay(-1)+' · Metric inventory started'],
    comments:[]
  },
  {
    id:'WK-1092',title:'Weekly client SLA and exception summary',project:'Analytics Platform',type:'Delivery',client:'Global Banking Client',
    priority:'Urgent',status:'In progress',progress:58,due:workDay(1),estimate:'4h',logged:'2h 10m',sprint:'Sprint 26',owner:'You',
    description:'Compile SLA performance, unresolved exceptions and response-time breaches into a concise client-ready weekly summary with clear owners and next actions.',
    deliverable:'Weekly SLA scorecard + exception action list',dependency:'Support ticket export and reconciliation run',
    checklist:['Refresh SLA metrics','Validate breach calculations','Group exceptions by severity','Confirm action owners','Share review-ready summary'],
    activity:[workDay(0)+' · SLA variance review started',workDay(-1)+' · Exception data prepared'],
    comments:['Project lead · Separate confirmed breaches from items still under investigation.']
  },
  {
    id:'WK-1098',title:'Data lineage and source ownership review',project:'Enterprise Data Hub',type:'Delivery',client:'Technology Practice',
    priority:'High',status:'Backlog',progress:12,due:workDay(4),estimate:'6h',logged:'0h 40m',sprint:'Sprint 26',owner:'You',
    description:'Map critical report fields to upstream datasets, document data owners and flag gaps in lineage evidence that could affect release support.',
    deliverable:'Lineage register + source owner matrix',dependency:'Latest data catalog extract',
    checklist:['Inventory critical report fields','Map upstream datasets','Confirm accountable owners','Flag lineage gaps','Publish review register'],
    activity:[workDay(0)+' · Review scoped for Sprint 26'],
    comments:[]
  },
  {
    id:'SH-2131',title:'Reusable analytics component library',project:'Side Hustle & Innovation',type:'Side Hustle',client:'Internal Innovation Lab',
    priority:'Medium',status:'In progress',progress:37,due:workDay(5),estimate:'5h',logged:'1h 35m',sprint:'Innovation Sprint 05',owner:'You',
    description:'Create reusable KPI, filter, status and chart patterns that help internal analytics pages stay consistent, accessible and responsive across screen sizes.',
    deliverable:'Component reference page + reusable UI examples',dependency:'Approved lavender and teal token set',
    checklist:['Define component tokens','Build KPI card variants','Document chart and filter patterns','Test narrow screen layouts','Publish usage notes'],
    activity:[workDay(0)+' · KPI card variants drafted',workDay(-1)+' · Token mapping prepared'],
    comments:[]
  },
  {
    id:'SH-2138',title:'AI-assisted documentation experiment',project:'Side Hustle & Innovation',type:'Side Hustle',client:'Analytics Enablement Guild',
    priority:'Low',status:'Backlog',progress:8,due:workDay(9),estimate:'4h',logged:'0h 25m',sprint:'Innovation Sprint 05',owner:'You',
    description:'Evaluate a lightweight workflow for turning approved technical notes into structured documentation, with human review and privacy checks before publication.',
    deliverable:'Experiment notes + quality checklist',dependency:'Sanitized example documentation',
    checklist:['Choose a safe sample input','Define output structure','Test a small workflow','Review factual accuracy','Document guardrails and findings'],
    activity:[workDay(-1)+' · Experiment scope drafted'],
    comments:[]
  }
];
export default function MyWork({scope,notify}:{scope:string,notify:(s:string)=>void}){
  const query='';
  const key=(s:string)=>scope==='local'?s:s+':'+scope;
  const workSeedDate=new Date().toISOString().slice(0,10);
  const storedDate=localStorage.getItem(key('dpa_work_items_date'));
  const stored=localStorage.getItem(key('dpa_work_items'));
  const[items,setItems]=useState<WorkItem[]>(()=>{
    if(!stored)return seedWorkItems;
    try{
      const saved=JSON.parse(stored) as WorkItem[];
      if(!Array.isArray(saved))return seedWorkItems;
      if(storedDate===workSeedDate)return saved;
      const freshById=new Map(seedWorkItems.map(item=>[item.id,item]));
      const savedIds=new Set(saved.map(item=>item.id));
      const rebased=saved.map(item=>{const fresh=freshById.get(item.id);return fresh?{...item,due:fresh.due}:item;});
      return [...rebased,...seedWorkItems.filter(item=>!savedIds.has(item.id))];
    }catch{return seedWorkItems;}
  });
  const[selected,setSelected]=useState<WorkItem|null>(null);
  const[filter,setFilter]=useState<'all'|'delivery'|'side'|'due'|'today'|'overdue'|'active'|'completed'>('all');
  const[workSearch,setWorkSearch]=useState('');
  const[showCreate,setShowCreate]=useState(false);
  const[comment,setComment]=useState('');
  const[newTask,setNewTask]=useState({title:'',project:'Internal Analytics',priority:'Medium' as WorkItem['priority'],due:workDay(17),type:'Side Hustle' as WorkItem['type'],description:''});

  useEffect(()=>{localStorage.setItem(key('dpa_work_items'),JSON.stringify(items));localStorage.setItem(key('dpa_work_items_date'),workSeedDate);window.dispatchEvent(new Event('dpa:work-items-updated'));},[items,workSeedDate]);

  const persistUpdate=(next:WorkItem)=>{
    setItems(prev=>prev.map(x=>x.id===next.id?next:x));
    setSelected(next);
    notify('Task updated successfully');
  };

  const filtered=items.filter(x=>{
    const search=(query+' '+workSearch).trim().toLowerCase();
    const matchesSearch=!search||[x.title,x.project,x.client,x.deliverable,x.id,x.owner,x.status,x.priority].some(v=>v.toLowerCase().includes(search));
    if(!matchesSearch)return false;
    const days=daysUntilWorkDate(x.due);
    if(filter==='delivery')return x.type==='Delivery';
    if(filter==='side')return x.type==='Side Hustle';
    if(filter==='due')return x.status!=='Completed'&&days>=0&&days<=7;
    if(filter==='today')return x.status!=='Completed'&&days===0;
    if(filter==='overdue')return x.status!=='Completed'&&days<0;
    if(filter==='active')return x.status!=='Completed';
    if(filter==='completed')return x.status==='Completed';
    return true;
  });
  const delivery=filtered.filter(x=>x.type==='Delivery');
  const side=filtered.filter(x=>x.type==='Side Hustle');
  const activeCount=items.filter(x=>x.status!=='Completed').length;
  const sideCount=items.filter(x=>x.type==='Side Hustle').length;
  const overdueCount=items.filter(x=>x.status!=='Completed'&&daysUntilWorkDate(x.due)<0).length;
  const dueSoonCount=items.filter(x=>x.status!=='Completed'&&daysUntilWorkDate(x.due)>=0&&daysUntilWorkDate(x.due)<=7).length;
  const dueTodayCount=items.filter(x=>x.status!=='Completed'&&daysUntilWorkDate(x.due)===0).length;
  const reviewCount=items.filter(x=>x.status==='In review').length;
  const blockedCount=items.filter(x=>x.status==='Blocked').length;
  const completion=Math.round(items.reduce((sum,x)=>sum+x.progress,0)/Math.max(items.length,1));

  const openTask=(task:WorkItem)=>{setSelected(task);setComment('');};
  const addTask=()=>{
    if(!newTask.title.trim())return;
    const item:WorkItem={
      id:'WK-'+crypto.randomUUID().slice(0,8),title:newTask.title.trim(),project:newTask.project,type:newTask.type,client:'Internal Workspace',
      priority:newTask.priority,status:'Backlog',progress:0,due:newTask.due,estimate:'To estimate',logged:'0h',sprint:'Next sprint',owner:'You',
      description:newTask.description||'New work item created from My Work. Add scope, evidence and acceptance criteria before starting delivery.',
      deliverable:'Define deliverable',dependency:'None',checklist:['Confirm scope and acceptance criteria','Create working draft','Review output','Attach supporting evidence','Mark complete'],activity:['Just now · Task created from My Work'],comments:[]
    };
    setItems(prev=>[item,...prev]);setShowCreate(false);setNewTask({title:'',project:'Internal Analytics',priority:'Medium',due:workDay(17),type:'Side Hustle',description:''});openTask(item);notify('New task created');
  };

  return <>
    <PageTitle eyebrow="WORK MANAGEMENT" title="My Work" sub="Your personal delivery cockpit — client work, internal commitments, side projects, evidence and execution history." action={<button className="primary-btn" onClick={()=>setShowCreate(true)}><Plus size={16}/> New task</button>}/>

    <div className="work-overview-grid">
      <div className="work-summary-card primary-summary"><span>Total work items</span><strong>{items.length}</strong><small>{activeCount} active · {items.length-activeCount} completed</small></div>
      <div className="work-summary-card"><span>Delivery tasks</span><strong>{items.filter(x=>x.type==='Delivery').length}</strong><small>Client & internal commitments</small></div>
      <div className="work-summary-card"><span>Side hustle</span><strong>{sideCount}</strong><small>Innovation & personal build</small></div>
      <div className="work-summary-card"><span>Avg. completion</span><strong>{completion}%</strong><small>Across all assigned work</small></div>
    </div>

    <section className="work-command-panel">
      <div><div className="eyebrow">MY WORKSPACE</div><h2>Run your work from one place</h2><p>Open a task to see scope, deliverables, dependencies, checklist, history, comments and progress controls.</p></div>
      <div className="work-command-stats"><div><b>{dueSoonCount}</b><span>due in 7 days</span></div><div><b>{overdueCount}</b><span>overdue items</span></div><div><b>{reviewCount}</b><span>awaiting review</span></div><div><b>{blockedCount}</b><span>blocked items</span></div></div>
    </section>

    <div className="work-filterbar">
      <div className="work-tabs">
        {[
          ['all','All work',''],
          ['delivery','Delivery',''],
          ['side','Innovation',''],
          ['active','Active',''],
          ['today','Due today',''],
          ['due','Next 7 days',''],
          ['overdue','Overdue',''],
          ['completed','Completed','']
        ].map(([key,label])=><button key={key} className={filter===key?'active':''} onClick={()=>setFilter(key as typeof filter)}>{label}<span>{key==='all'?items.length:key==='delivery'?items.filter(x=>x.type==='Delivery').length:key==='side'?sideCount:key==='completed'?items.filter(x=>x.status==='Completed').length:key==='overdue'?overdueCount:key==='today'?dueTodayCount:key==='due'?dueSoonCount:activeCount}</span></button>)}
      </div>
      <label className="smallsearch work-search"><Search size={15}/><input value={workSearch} onChange={e=>setWorkSearch(e.target.value)} placeholder="Search work items…"/></label>
    </div>

    <div className="work-layout">
      <section className="card work-list-panel">
        <div className="card-head"><div><h2>Delivery work</h2><p>Client, internal and recurring operational commitments</p></div><span className="panel-badge">{delivery.length} visible</span></div>
        {delivery.length===0?<div className="empty-state">No delivery work matches the current filter.</div>:delivery.map(task=><button className="work-item-row" key={task.id} onClick={()=>openTask(task)}>
          <div className="work-type-icon"><Briefcase size={16}/></div>
          <div className="work-item-main"><div><b>{task.title}</b><span>{task.project} · {task.client}</span></div><div className="work-item-meta"><small>{task.id}</small><small className={'due-meta '+dueBadge(task.due,task.status).toLowerCase().replace(/\s/g,'-')}>{dueBadge(task.due,task.status)} · {task.due}</small><small>{task.estimate} estimate</small></div></div>
          <label className={'priority '+task.priority.toLowerCase()}>{task.priority}</label>
          <div className="work-progress-cell"><span>{task.progress}%</span><div className="progress"><i style={{width:task.progress+'%'}}></i></div></div>
          <span className={'work-status '+task.status.toLowerCase().replace(/\s/g,'-')}>{task.status}</span>
          <ChevronRight size={16}/>
        </button>)}
      </section>

      <section className="card work-list-panel side-hustle-panel">
        <div className="card-head"><div><h2>Side Hustle & Innovation</h2><p>Non-billable innovation, learning and personal build work</p></div><span className="side-hustle-badge"><Sparkles size={13}/> {side.length} ideas</span></div>
        {side.length===0?<div className="empty-state">No side-hustle work matches the current filter.</div>:side.map(task=><button className="work-item-row side-row" key={task.id} onClick={()=>openTask(task)}>
          <div className="work-type-icon side-icon"><Sparkles size={16}/></div>
          <div className="work-item-main"><div><b>{task.title}</b><span>{task.project} · {task.client}</span></div><div className="work-item-meta"><small>{task.id}</small><small className={'due-meta '+dueBadge(task.due,task.status).toLowerCase().replace(/\s/g,'-')}>{dueBadge(task.due,task.status)} · {task.due}</small><small>{task.estimate}</small></div></div>
          <label className={'priority '+task.priority.toLowerCase()}>{task.priority}</label>
          <div className="work-progress-cell"><span>{task.progress}%</span><div className="progress"><i style={{width:task.progress+'%'}}></i></div></div>
          <span className={'work-status '+task.status.toLowerCase().replace(/\s/g,'-')}>{task.status}</span>
          <ChevronRight size={16}/>
        </button>)}
      </section>
    </div>

    <section className="card work-capacity-panel">
      <div className="card-head"><div><h2>Execution board</h2><p>Where your work stands across the workflow lifecycle</p></div><button className="link" onClick={()=>{setFilter('active');notify('Showing active work')}}>Show active <ArrowUpRight size={14}/></button></div>
      <div className="execution-board">{['Backlog','In progress','In review','Blocked','Completed'].map(status=>{
        const col=items.filter(x=>x.status===status);
        return <div className="execution-col" key={status}><div className="execution-col-head"><span>{status}</span><b>{col.length}</b></div>{col.slice(0,3).map(task=><button className="execution-card" key={task.id} onClick={()=>openTask(task)}><b>{task.title}</b><span>{task.project}</span><div><i style={{width:task.progress+'%'}}></i></div><small>{task.progress}% · {task.due}</small></button>)}{col.length>3&&<small className="more-count">+{col.length-3} more</small>}</div>
      })}</div>
    </section>

    {showCreate&&<Dialog title="Create task" close={()=>setShowCreate(false)}><div className="task-modal" onClick={e=>e.stopPropagation()}><div className="task-modal-head"><div><span className="eyebrow">CREATE WORK ITEM</span><h2>New task</h2><p>Add a real work item to your personal execution board.</p></div><button aria-label="Close" className="icon-button" onClick={()=>setShowCreate(false)}>×</button></div><div className="create-task-grid"><label>Task title<input value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})} placeholder="e.g. Build monthly client reconciliation"/></label><label>Work type<select value={newTask.type} onChange={e=>setNewTask({...newTask,type:e.target.value as WorkItem['type']})}><option>Delivery</option><option>Side Hustle</option></select></label><label>Project / workspace<input value={newTask.project} onChange={e=>setNewTask({...newTask,project:e.target.value})} placeholder="Project name"/></label><label>Priority<select value={newTask.priority} onChange={e=>setNewTask({...newTask,priority:e.target.value as WorkItem['priority']})}><option>Urgent</option><option>High</option><option>Medium</option><option>Low</option></select></label><label>Due date<input value={newTask.due} onChange={e=>setNewTask({...newTask,due:e.target.value})} placeholder={workDay(17)}/></label><label className="create-span-2">Description<textarea value={newTask.description} onChange={e=>setNewTask({...newTask,description:e.target.value})} placeholder="Define the actual outcome, acceptance criteria and context."/></label></div><div className="task-modal-actions"><button className="secondary-btn" onClick={()=>setShowCreate(false)}>Cancel</button><button className="primary-btn" disabled={!newTask.title.trim()||!newTask.project.trim()} onClick={addTask}>Create task</button></div></div></Dialog>}

    {selected&&<Dialog title="Work item" close={()=>setSelected(null)}><div className="task-modal rich-task-modal" onClick={e=>e.stopPropagation()}>
      <div className="task-modal-head"><div><div className="task-id-line"><span className="eyebrow">{selected.id}</span><span className={'work-kind '+selected.type.toLowerCase().replace(/\s/g,'-')}>{selected.type}</span></div><h2>{selected.title}</h2><p>{selected.project} · {selected.client}</p></div><button aria-label="Close" className="icon-button" onClick={()=>setSelected(null)}>×</button></div>
      <div className="task-detail-grid rich"><div><span>Priority</span><label className={'priority '+selected.priority.toLowerCase()}>{selected.priority}</label></div><div><span>Due</span><b>{selected.due}</b></div><div><span>Estimate</span><b>{selected.estimate}</b></div><div><span>Logged</span><b>{selected.logged}</b></div><div><span>Sprint</span><b>{selected.sprint}</b></div><div><span>Owner</span><b>{selected.owner}</b></div><div><span>Dependency</span><b>{selected.dependency}</b></div><div><span>Deliverable</span><b>{selected.deliverable}</b></div></div>

      <div className="task-progress-large"><div><span>Completion</span><b>{selected.progress}%</b></div><input className="task-range" type="range" min="0" max="100" value={selected.progress} onChange={e=>persistUpdate({...selected,progress:Number(e.target.value),status:Number(e.target.value)===100?'Completed':selected.status==='Completed'?'In progress':selected.status})}/><div className="progress"><i style={{width:selected.progress+'%'}}></i></div></div>

      <div className="rich-task-grid">
        <div className="task-detail-section"><h3>Task overview</h3><p>{selected.description}</p><h3>Acceptance checklist</h3>{selected.checklist.map((item,i)=><label className="check-row" key={item}><input type="checkbox" checked={(selected.checked??selected.checklist.filter((_,j)=>selected.progress>=(j+1)/selected.checklist.length*100)).includes(item)} onChange={e=>{const old=selected.checked??selected.checklist.filter((_,j)=>selected.progress>=(j+1)/selected.checklist.length*100);persistUpdate({...selected,checked:e.target.checked?[...old,item]:old.filter(x=>x!==item)})}}/><span>{item}</span></label>)}</div>
        <div className="task-detail-section"><h3>Workflow status</h3><select className="task-status-select" value={selected.status} onChange={e=>persistUpdate({...selected,status:e.target.value as WorkItem['status']})}>{['Backlog','In progress','In review','Blocked','Completed'].map(x=><option key={x}>{x}</option>)}</select><h3>Recent activity</h3>{selected.activity.map(x=><div className="task-activity" key={x}><span></span><p>{x}</p></div>)}</div>
      </div>

      <div className="task-evidence-row"><div><span className="eyebrow">PRIMARY DELIVERABLE</span><b>{selected.deliverable}</b></div><button className="secondary-btn" onClick={()=>{const a=document.createElement('a');a.href='data:text/plain;charset=utf-8,'+encodeURIComponent([selected.title,selected.deliverable,selected.description,...selected.checklist].join('\n\n'));a.download=selected.id+'-brief.txt';a.click();notify('Brief downloaded')}}><FileCheck size={15}/> Download brief</button></div>
      <div className="task-comments"><div className="card-head"><div><h3>Comments & handoffs</h3><p>Context shared by teammates on this work item</p></div></div>{selected.comments.length?selected.comments.map((x,i)=><div className="comment" key={i}><div className="personavatar">{x.split(' · ')[0].slice(0,2)}</div><span>{x}</span></div>):<div className="empty-state">No comments yet. Add the first work note below.</div>}<div className="comment-composer"><input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a progress note or handoff message"/><button className="primary-btn" disabled={!comment.trim()} onClick={()=>{const next={...selected,comments:[...selected.comments, 'You · '+comment.trim()]};persistUpdate(next);setComment('')}}><MessageSquare size={14}/> Add note</button></div></div>

      <div className="task-modal-actions"><button className="secondary-btn" onClick={()=>setSelected(null)}>Close</button>{selected.status!=='Completed'&&<button className="primary-btn" onClick={()=>persistUpdate({...selected,status:'Completed',progress:100})}><CheckCircle2 size={15}/> Mark complete</button>}</div>
    </div></Dialog>}
  </>;
}
