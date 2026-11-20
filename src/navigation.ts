import {LayoutDashboard,BriefcaseBusiness,FolderKanban,CalendarDays,Clock3,ClipboardList,CalendarCheck,Headphones,Laptop,Target,GraduationCap,Plane,Receipt,Landmark,HeartHandshake,Users,FileText,Bell,UserRound,Settings2,ShieldCheck} from 'lucide-react';
export const groups=[
 {label:'Workspace',items:[['Overview','Overview',LayoutDashboard],['My Work','My work',BriefcaseBusiness],['Projects','Projects',FolderKanban],['Calendar','Calendar',CalendarDays]]},
 {label:'HR & operations',items:[['Attendance','Attendance',Clock3],['Timesheet','Timesheets',ClipboardList],['Leave','Leave management',CalendarCheck],['Support','Service desk',Headphones],['Assets','My assets',Laptop],['Performance','Performance',Target],['Learning','Learning hub',GraduationCap]]},
 {label:'Finance & pay',items:[['Payroll','Payroll',Landmark],['Expenses','Expenses',Receipt],['Travel','Business travel',Plane],['Benefits','Benefits',HeartHandshake]]},
 {label:'Organization',items:[['Directory','Employee directory',Users],['Documents','Documents',FileText],['Announcements','Announcements',Bell],['Profile','My profile',UserRound],['Settings','Settings',Settings2],['Admin','Administration',ShieldCheck]]}
] as const;
export const routes=groups.flatMap(group=>[...group.items]);
export function currentPage(){
  let value='';try{value=decodeURIComponent(location.hash.slice(1))||localStorage.getItem('dpa_last_section')||''}catch{/* Request a valid landing page. */}
  return routes.some(([id])=>id===value)?value:'Overview';
}
