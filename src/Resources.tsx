import {useEffect,useRef,useState} from 'react';
import {BookOpen,CheckCheck,Download,FileText,FolderOpen,Search,Upload} from 'lucide-react';
import {bulletins,documents,downloadDoc,type PortalData,type Update} from './model';
import './resources.css';

type Props={page:string,data:PortalData,update:Update,launch:(s:string)=>void,notify:(s:string)=>void,scope:string};
type StoredDocument={id:string,scope:string,file:File,created:number};
function openDocuments():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('dpa-employee-documents',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('files',{keyPath:'id'}).createIndex('employee','scope');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}
async function loadFiles(scope:string):Promise<StoredDocument[]>{
  const db=await openDocuments();
  try{return await new Promise((resolve,reject)=>{
    const request=db.transaction('files').objectStore('files').index('employee').getAll(scope);
    request.onsuccess=()=>resolve((request.result as StoredDocument[]).sort((a,b)=>b.created-a.created));
    request.onerror=()=>reject(request.error);
  });}finally{db.close();}
}
async function saveFile(record:StoredDocument){
  const db=await openDocuments();
  try{await new Promise<void>((resolve,reject)=>{
    const tx=db.transaction('files','readwrite');
    tx.oncomplete=()=>resolve();
    tx.onabort=()=>reject(tx.error);
    tx.objectStore('files').add(record);
  });}finally{db.close();}
}
function downloadFile(file:File){
  const url=URL.createObjectURL(file);
  const link=document.createElement('a');
  link.href=url;link.download=file.name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function Documents({scope,launch,notify}:Pick<Props,'scope'|'launch'|'notify'>){
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('All documents');
  const [uploads,setUploads]=useState<StoredDocument[]>([]);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState('');
  const picker=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    let active=true;
    setLoading(true);setUploads([]);setMessage('');
    loadFiles(scope).then(files=>{if(active)setUploads(files);}).catch(()=>{if(active)setMessage('Saved uploads could not be opened in this browser.');}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[scope]);
  async function upload(file:File){
    setBusy(true);setMessage('');
    try{
      const item={id:crypto.randomUUID(),scope,file,created:Date.now()};
      await saveFile(item);
      setUploads(current=>[item,...current]);setFilter('My uploads');setQuery('');notify('Document uploaded');
    }catch{setMessage('Unable to save this file. Check available browser storage and try again.');}
    finally{setBusy(false);if(picker.current)picker.current.value='';}
  }
  const match=(s:string)=>s.toLowerCase().includes(query.trim().toLowerCase());
  const policies=filter==='My uploads'?[]:documents.filter(d=>match(d.title+' '+d.body));
  const files=filter==='Policies'?[]:uploads.filter(d=>match(d.file.name));
  return <section className="module resource-view"><div className="resource-heading"><div><h1>Documents</h1><p>Employee policies, reference guides and your uploaded files.</p></div>
    <input ref={picker} type="file" hidden aria-label="Choose a document" onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);}}/>
    <button className="primary-btn" disabled={busy||loading} onClick={()=>picker.current?.click()}><Upload size={16}/>{busy?'Uploading…':'Upload document'}</button></div>
    <div className="card"><div className="toolbar"><label className="resource-search"><Search size={16}/><input aria-label="Search documents" placeholder="Search documents" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Document collection" value={filter} onChange={e=>setFilter(e.target.value)}>{['All documents','Policies','My uploads'].map(f=><option key={f}>{f}</option>)}</select></div>
    {message&&<p role="alert">{message}</p>}
    {policies.map(d=><article className="resource-line" key={d.title}><span className="resource-icon"><BookOpen size={18}/></span><div><button className="resource-title" onClick={()=>launch('doc:'+d.title)}>{d.title}</button><small>Employee policy</small></div><button className="icon-button" aria-label={'Download '+d.title} onClick={()=>{downloadDoc(d.title);notify('Document downloaded');}}><Download size={17}/></button></article>)}
    {files.map(d=><article className="resource-line" key={d.id}><span className="resource-icon"><FileText size={18}/></span><div><b>{d.file.name}</b><small>My upload · {new Date(d.created).toLocaleDateString('en-IN')} · {Math.max(1,Math.ceil(d.file.size/1024)).toLocaleString()} KB</small></div><button className="icon-button" aria-label={'Download '+d.file.name} onClick={()=>downloadFile(d.file)}><Download size={17}/></button></article>)}
    {loading&&<p aria-live="polite">Loading saved documents…</p>}
    {!loading&&!policies.length&&!files.length&&<div className="resource-empty"><FolderOpen size={25}/><b>No documents found</b><p>{filter==='My uploads'&&!query?'Upload a file to keep a copy in this browser.':'Try another title or document collection.'}</p></div>}
    </div></section>;
}

export default function Resources(props:Props){
  const {data,update,page,launch,notify}=props;
  const [filter,setFilter]=useState('All bulletins');
  if(page==='Documents')return <Documents key={props.scope} {...props}/>;
  const unread=bulletins.filter(b=>!data.read.includes(b.id));
  const list=filter==='Unread'?unread:bulletins;
  return <section className="module resource-view"><div className="resource-heading"><div><h1>Announcements</h1><p>Research bulletins and updates from across the firm.</p></div><button className="secondary-btn" disabled={!unread.length} onClick={()=>{update(d=>({...d,read:[...new Set([...d.read,...bulletins.map(b=>b.id)])]}));notify('All announcements marked as read');}}><CheckCheck size={16}/>Mark all as read</button></div>
    <div className="card"><div className="card-head"><h2>Bulletin feed</h2><select aria-label="Filter bulletins" value={filter} onChange={e=>setFilter(e.target.value)}><option>All bulletins</option><option>Unread</option></select></div>
    {list.map(b=><article key={b.id} className="resource-bulletin"><div><span>{b.category}</span><small>{data.read.includes(b.id)?'Read':'Unread'}</small></div><button className="resource-title" onClick={()=>launch('bulletin:'+b.id)}>{b.title}</button><p>{b.body}</p></article>)}
    {!list.length&&<div className="resource-empty"><CheckCheck size={25}/><b>You’re up to date</b><p>All announcements have been read.</p></div>}</div></section>;
}
