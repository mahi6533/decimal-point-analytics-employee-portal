export type LeaveRequest = {id:string; type:string; start:string; end:string; days:number; status:string; reason:string};
export type Entry = {id:string; date:string; hours:number; project:string; location?:'Office'|'Remote'};
export type PortalData = {
  leaves:LeaveRequest[]; entries:Entry[]; shifts:{id:string;start:number;end:number}[]; shift:number|null;
  read:string[]; profile:Record<string,string>; privatePay:boolean; submittedWeeks?:string[];
  tickets:{id:string; title:string; detail:string; team:string; status:string; date:string}[];
};
export type Update = (fn:(previous:PortalData)=>PortalData)=>void;
export function dateKey(d=new Date()) {
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
}
const holidays:Record<string,string>={'01-01':'New Year’s Day','01-26':'Republic Day','05-01':'Maharashtra Day','08-15':'Independence Day','10-02':'Gandhi Jayanti','12-25':'Christmas Day'};
export const holidayName=(key:string)=>holidays[key.slice(5)]||'';
export function businessDays(start:string,end:string){
  const day=new Date(start+'T12:00:00'), last=new Date(end+'T12:00:00');
  let count=0;
  while(day<=last){if(day.getDay()%6!==0&&!holidayName(dateKey(day)))count++;day.setDate(day.getDate()+1)}
  return count;
}
export function payDate(){
  const d=new Date(); d.setHours(12,0,0,0);
  function lastWorkingDay(offset:number){const last=new Date(d.getFullYear(),d.getMonth()+1+offset,0,12);while(!businessDays(dateKey(last),dateKey(last)))last.setDate(last.getDate()-1);return last}
  const next=lastWorkingDay(0);return next<d?lastWorkingDay(1):next;
}
export const employees=[
 ['Mahesh Shirsath','Quantitative Research','Nashik','Research Analyst','Ananya Deshpande','Python,Factor modelling','Available'],
 ['Ananya Deshpande','Quantitative Research','Mumbai','Research Director','Executive Office','Portfolio construction,Strategy','In a meeting'],
 ['Rohan Kulkarni','Data Engineering','Pune','Data Platform Lead','Ananya Deshpande','SQL,Data pipelines','Available'],
 ['Isha Mehta','Risk Analytics','Mumbai','Risk Analyst','Ananya Deshpande','Stress testing,Market risk','Available'],
 ['Neha Patil','Investment Research','Nashik','Equity Analyst','Ananya Deshpande','Equity valuation,Financial modelling','Away'],
 ['Arjun Shah','Data Engineering','Pune','Analytics Engineer','Rohan Kulkarni','Data quality,Python','Available'],
 ['Priya Nair','Corporate HR','Mumbai','People Operations Lead','Executive Office','People operations,Payroll','Available']
].map(([name,department,location,role,manager,skills,status],i)=>({id:'DPA-'+(1204+i),name,department,location,role,manager,skills:skills.split(','),status,email:name.toLowerCase().replace(' ','.')+'@decimalpoint.example',extension:String(210+i),slack:'@'+name.toLowerCase().replace('','').replace(' ','.')}));
export const bulletins=[
 {id:'factor-review',title:'Quarterly factor outlook',category:'Research bulletin',body:'The Quantitative Research team has opened the quarterly review of value, quality and momentum exposures. Analysts should reconcile benchmark weights and record any changes to sector assumptions in their project workbooks before the review meeting.'},
 {id:'pay-cycle',title:'Month-end payroll cut-off',category:'People operations',body:'Review your attendance exceptions and submit outstanding timesheets before the final working week of the month. Contact Payroll through the service desk if a released statement needs correction.'},
 {id:'data-quality',title:'Research data quality review',category:'Data engineering',body:'Data Engineering is reviewing stale prices, missing identifiers and outlier flags across research datasets. Add exceptions to your delivery task with the dataset, observation date and a reproducible description.'}
];
export const documents=[
 {title:'Employee handbook',body:'Workplace standards\n\nRecord working hours against the correct project. Discuss schedule changes with your reporting manager. Protect client information and use approved channels for research files.\n\nEmployee services\n\nUse Leave to request planned absence. Use Service Desk for payroll, equipment and HR enquiries. Include the relevant period or asset ID in each request.'},
 {title:'Leave policy',body:'Select earned, casual or sick leave and provide the first and last day of absence. Weekends and company holidays are excluded. Half-day requests cover a single business day. Pending and approved requests reserve leave from the selected balance.'},
 {title:'Expense guidelines',body:'Keep itemised receipts for client travel, accommodation and business purchases. Record dates, amount and business purpose, then submit the claim through Expenses. A manager reviews the claim before reimbursement.'}
];
export function downloadDoc(title:string){
  const doc=documents.find(d=>d.title===title);if(!doc)return;
  const url=URL.createObjectURL(new Blob(['Decimal Point Analytics\n'+title+'\n\n'+doc.body],{type:'text/plain;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=title.toLowerCase().replaceAll(' ','-')+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function chargedDays(start:string,end:string,days:number,year:number){
  const yearStart = year + '-01-01', yearEnd = year + '-12-31';
  if (end < yearStart || start > yearEnd) return 0;
  if (start >= yearStart && end <= yearEnd) return days;
  return businessDays(start > yearStart ? start : yearStart, end < yearEnd ? end : yearEnd);
}
export function balances(data:PortalData, year=new Date().getFullYear()){
  const result:Record<string,number>={Earned:18,Casual:8,Sick:7};
  for(const leave of data.leaves){
    if (leave.status==='Rejected' || !(leave.type in result)) continue;
    result[leave.type]-=chargedDays(leave.start,leave.end,leave.days,year);
  }
  return result;
}
function seed(scope:string):PortalData{
  const offset=(n:number)=>{const d=new Date();d.setDate(d.getDate()+n);return d};
  const entries:Entry[]=[];
  for(let i=62;i>0;i--){const date=dateKey(offset(-i));if(businessDays(date,date))entries.push({id:'time-'+date,date,hours:i%13===0?4:7+(i%5)*0.25,project:i%3?'Factor research':'Risk analytics',location:i%4===0?'Remote':'Office'})}
  const leaves:LeaveRequest[]=['Pending','Approved','Rejected'].map((status,i)=>{let d=offset([5,-5,-12][i]);while(!businessDays(dateKey(d),dateKey(d)))d.setDate(d.getDate()+1);return {id:'LV-'+(407-i),type:['Earned','Casual','Sick'][i],start:dateKey(d),end:dateKey(d),days:1,reason:['Planned personal leave','Family commitment','Appointment rescheduled'][i],status}});
  const legacy=scope==='local'?localStorage.getItem('dpa_attendance_session_'+new Date().toISOString().slice(0,10)+'_checked_at'):null;
  const workingEntries=entries.filter(entry=>!leaves.some(leave=>leave.status==='Approved' && entry.date>=leave.start && entry.date<=leave.end));
  return {leaves,entries:workingEntries,shift:legacy&&Number.isFinite(Date.parse(legacy))?Date.parse(legacy):null,shifts:[],read:[],profile:{},privatePay:false,tickets:[],submittedWeeks:[]};
}
export const storeKey=(scope:string)=>'dpa_workforce_v1:'+scope;
export function readData(scope:string):PortalData{
  const base=seed(scope);try{const saved=JSON.parse(localStorage.getItem(storeKey(scope))||'null');return saved?{...base,...saved}:base}catch{return base}
}
