import {dateKey} from '../model';

export type Operation = 'Calendar'|'Projects'|'Performance'|'Learning'|'Expenses'|'Benefits'|'Travel'|'Assets'|'Admin';
export type RecordItem = { id:string; title:string; detail:string; status:string; date:string; category:string; amount?:number; end?:string; progress?:number };
export type Field = { key:'title'|'category'|'date'|'detail'|'amount'|'end'|'progress'; label:string; type?:'date'|'number'|'textarea'|'email'; options?:string[]; min?:number; max?:number };
export type Spec = { title:string; description:string; list:string; create?:string; fields:Field[] };
const title=(label:string):Field=>({key:'title',label});
const category=(label:string,options:string[]):Field=>({key:'category',label,options});
const date=(label:string):Field=>({key:'date',label,type:'date'});
const detail=(label:string):Field=>({key:'detail',label,type:'textarea'});
export const specs:Record<Operation,Spec>={
 Calendar:{title:'Team calendar',description:'Meeting schedules, work deadlines and portfolio milestones.',list:'Schedule',create:'Add event',fields:[title('Event name'),date('Date'),category('Event type',['Meeting','Review','Workshop','Deadline']),detail('Agenda')]},
 Projects:{title:'Projects & delivery',description:'Track delivery milestones and the work assigned to each programme.',list:'Project portfolio',create:'New project',fields:[title('Project name'),category('Practice',['Quantitative Research','Data Engineering','Risk Analytics','Investment Research','Corporate HR']),date('Milestone date'),detail('Delivery objective')]},
 Performance:{title:'Performance',description:'Review objectives, capture progress and prepare for your next review.',list:'Objectives & reviews',create:'Add objective',fields:[title('Objective'),category('Category',['Delivery goal','Development goal','Quarterly review','Feedback']),date('Target date'),{key:'progress',label:'Completion (%)',type:'number',min:0,max:100},detail('Outcome or feedback')]},
 Learning:{title:'Learning hub',description:'Continue assigned courses and record completed lessons.',list:'My learning plan',fields:[]},
 Expenses:{title:'Expenses',description:'Submit business expenses and track reimbursement decisions.',list:'Expense claims',create:'New expense',fields:[title('Expense title'),category('Category',['Travel','Meals','Office supplies','Connectivity','Other']),date('Expense date'),{key:'amount',label:'Amount (INR)',type:'number',min:0.01,max:10000000},detail('Business purpose')]},
 Benefits:{title:'Benefits & perks',description:'Review coverage, allowances and enrollment status.',list:'Available programmes',fields:[]},
 Travel:{title:'Business travel',description:'Manage upcoming itineraries and travel approval requests.',list:'Travel requests',create:'Request travel',fields:[title('Route or destination'),category('Journey type',['Client visit','Internal meeting','Conference','Training']),date('Departure'),{key:'end',label:'Return',type:'date'},detail('Business purpose')]},
 Assets:{title:'My assets',description:'Review assigned equipment, software licences and open requests.',list:'Equipment & licences',create:'Request asset',fields:[title('Asset requested'),category('Asset type',['Laptop','Mobile','Monitor','Software','Security']),date('Required by'),detail('Business justification')]},
 Admin:{title:'Administration',description:'Prepare access requests and review workspace activity.',list:'Employee access requests',create:'Request employee access',fields:[title('Employee name'),{key:'detail',label:'Work email',type:'email'},category('Requested role',['Employee','Team lead','Project manager','HR administrator'])]}
};
export function offset(days:number){const result=new Date();result.setDate(result.getDate()+days);return dateKey(result)}
export const courses=[
 {title:'Advanced SQL for analytics',type:'Technical learning',lessons:[
 ['Window functions','Partition observations by portfolio and order them by trading date to rank values or compute rolling statistics while retaining each source row.'],
 ['Reconciliation checks','Join independently aggregated source and target balances using account and observation date. Review unmatched keys separately before measuring value differences.'],
 ['Execution plans','Inspect row estimates, scan methods and join order. Compare the same query before and after changing an index using representative data.']]},
 {title:'Information security',type:'Mandatory training',lessons:[
 ['Classifying research','Identify client-confidential inputs, licensed market data and internal research before sharing a workbook. Choose an approved workspace with access limited to the project team.'],
 ['Reporting suspicious requests','Verify unexpected instructions through a known internal channel. Record the sender, time and subject in an IT support ticket without forwarding sensitive attachments.']]},
 {title:'Leadership essentials',type:'Professional development',lessons:[
 ['Delivery handoffs','Name the accountable owner, define the acceptance criteria and agree on a deadline. Include the validation evidence so another analyst can reproduce the outcome.'],
 ['Giving feedback','Describe a specific observation, explain its impact and agree on one measurable next step. Review that step during the next check-in.']]},
 {title:'Advanced Power BI',type:'Certification preparation',lessons:[
 ['Model relationships','Keep fact tables at a consistent grain and relate dimension keys to those facts. Test ambiguous paths before publishing.'],
 ['Measure validation','Compare totals and filtered measures against a known reconciliation sample. Check how filter context changes when a user selects a period or desk.']]}
];
function record(id:string,title:string,category:string,detail:string,status:string,days:number,extra:Partial<RecordItem>={}):RecordItem{
 return {id,title,category,detail,status,date:offset(days),...extra};
}
export function initialRecords(page:Operation):RecordItem[]{
 switch(page){
 case 'Projects': return [];
 case 'Calendar':return [record('CAL-311','Research desk briefing','Meeting','Review risk factors, analyst coverage and this week’s publication schedule.','Scheduled',0),record('CAL-312','Model validation review','Review','Walk through validation evidence and open model exceptions.','Scheduled',2)];
 case 'Performance':return [
 record('OBJ-108','Improve data quality automation','Delivery goal','Automate recurring reconciliation checks and document the exceptions workflow.','In progress',20,{progress:85}),
 record('OBJ-110','Deliver risk dashboard refresh','Delivery goal','Publish reviewed measures with signed-off reconciliation evidence.','In progress',12,{progress:62}),
 record('OBJ-115','Complete advanced SQL learning path','Development goal','Apply windowing and plan analysis to the research reporting pipeline.','In progress',35,{progress:40}),
 record('REV-114','Quarterly performance review','Quarterly review','Delivery milestones reviewed with the practice lead. Next cycle will focus on validation coverage.','Completed',-14,{progress:100})];
 case 'Learning':return courses.map((c,i)=>record('LRN-'+i,c.title,c.type,c.lessons[0][1],i===0?'In progress':'Assigned',8+i,{progress:i===0?1:0}));
 case 'Benefits':return [
 record('BEN-201','Health insurance','Family floater','₹5,00,000 annual family coverage. Contact People Operations through the service desk for a dependent change or claim query.','Active',-20),
 record('BEN-202','Meal allowance','Monthly wallet','₹2,500 monthly meal allowance for enrolled employees. Credits follow the monthly payroll cycle.','Active',-20),
 record('BEN-203','Internet allowance','Hybrid work support','Claim up to ₹1,500 per month after enrollment. Retain a copy of the broadband invoice for reimbursement.','Eligible',0),
 record('BEN-204','Wellness programme','Employee wellbeing','Ten wellbeing credits per year are available for eligible activities. Contact the service desk for a list of participating providers.','Eligible',0)];
 case 'Expenses':return [
 record('EXP-24091','Client meeting travel','Travel','Rail and local transport for a client workshop.','Approved',-6,{amount:4280}),
 record('EXP-24088','Team lunch','Meals','Working lunch during the quarterly planning session.','Pending',-3,{amount:3570}),
 record('EXP-24074','Office supplies','Office supplies','Stationery and presentation materials.','Reimbursed',-12,{amount:1820}),
 record('EXP-24061','Taxi to client office','Travel','Local transport for an on-site risk review.','Reimbursed',-16,{amount:1440})];
 case 'Travel':return [
 record('TRV-24014','Mumbai → Bengaluru','Client visit','Research methodology workshop at the client office. Economy air travel and two hotel nights.','Approved',5,{end:offset(7)}),
 record('TRV-24007','Nashik → Mumbai','Internal meeting','Leadership offsite and quarterly delivery review.','Pending',12,{end:offset(12)})];
 case 'Assets':return [
 record('DPA-LT-0248','ThinkPad T490','Laptop','Assigned work laptop. Contact IT for device servicing and endpoint support.','Assigned',-90),
 record('DPA-MB-0912','Samsung F36','Mobile','Work handset with managed mobile profile.','Assigned',-55),
 record('LIC-88421','Microsoft 365','Software','Workplace productivity licence assigned to your employee account.','Active',-90),
 record('SEC-12048','VPN access','Security','Managed remote access for approved internal services.','Active',-90)];
 case 'Admin':return [];
 }
}
