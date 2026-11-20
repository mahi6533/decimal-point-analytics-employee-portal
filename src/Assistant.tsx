import {useEffect,useRef,useState} from 'react';
import {Bot,Send,Square,Trash2} from 'lucide-react';
import Dialog from './Dialog';
import {supabaseAuth} from './lib/supabase';
import './assistant.css';
type Message={role:'user'|'model';text:string};
export default function Assistant({authenticated}:{authenticated:boolean}){
 const [open,setOpen]=useState(false),[messages,setMessages]=useState<Message[]>([]),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const controller=useRef<AbortController|null>(null),bottom=useRef<HTMLDivElement>(null);
 useEffect(()=>()=>controller.current?.abort(),[]);
 useEffect(()=>{bottom.current?.scrollIntoView({block:'nearest'})},[messages,busy,error,open]);
 async function send(text=draft){
  if(busy||!text.trim()||!authenticated)return;
  // Keep complete conversation pairs within the server's context budget.
  const next:Message[]=[...messages,{role:'user',text:text.trim()}];
  setMessages(next);setDraft('');setError('');setBusy(true);
  const abort=new AbortController();controller.current=abort;
  const timeout=window.setTimeout(()=>abort.abort(),55000);
  try{
   const {data,error:authError}=await supabaseAuth.auth.getSession();
   if(authError||!data.session)throw new Error('Your session expired. Please sign in again.');
   const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+data.session.access_token},body:JSON.stringify({messages:next.slice(-5).map(m=>({...m,text:m.text.slice(0,4000)}))}),signal:abort.signal});
   let result;try{result=await response.json()}catch{throw new Error('AI service unavailable. Please try again.')}
   if(!response.ok)throw new Error(result.error||'The assistant could not respond.');
   setMessages([...next,{role:'model',text:result.text}]);
  }catch(e){setMessages(next.slice(0,-1));setDraft(text);setError(e instanceof Error&&e.name==='AbortError'?'Response stopped. You can send your message again.':e instanceof Error?e.message:'Unable to connect.')}
  finally{clearTimeout(timeout);setBusy(false);controller.current=null}
 }
 return <><button className="assistant-launch no-print" aria-label="Open AI assistant" onClick={()=>setOpen(true)}><Bot size={20}/><span>Ask AI</span></button>{open&&<Dialog title="DPA Assistant" close={()=>setOpen(false)} drawer><div className="assistant-panel">
  <div className="assistant-intro"><span className="assistant-tag">AI & ENGINEERING</span><p>Your thinking partner for code, data and everyday work.</p></div>
  {!authenticated?<p role="status">Sign in with your employee account to use the assistant.</p>:<>
  <div className="assistant-history" role="log" aria-label="AI conversation" aria-live="polite">
   {!messages.length&&!busy&&<div className="assistant-prompts">{['Help me debug a Python script','Explain an SQL window function','How do I apply for leave?'].map(p=><button className="secondary-btn" key={p} onClick={()=>void send(p)}>{p}</button>)}</div>}
   {messages.map((m,i)=><article className={'assistant-message '+m.role} key={i}><strong>{m.role==='user'?'You':'DPA Assistant'}</strong><div>{m.text}</div></article>)}
   {busy&&<p className="assistant-thinking" role="status">Thinking<span>…</span></p>}
   {error&&<p className="assistant-error" role="alert">{error}</p>}<div ref={bottom}/>
  </div>
  <form className="assistant-compose" onSubmit={e=>{e.preventDefault();void send()}}><label htmlFor="assistant-message">Message</label><textarea id="assistant-message" autoFocus rows={3} maxLength={4000} placeholder="Ask about code, data, or your workspace…" value={draft} disabled={busy} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send()}}}/><div><button className="secondary-btn" type="button" disabled={busy||!messages.length} onClick={()=>{setMessages([]);setError('');setDraft('')}}><Trash2 size={14}/>New chat</button>{busy?<button className="secondary-btn" type="button" onClick={()=>controller.current?.abort()}><Square size={14}/>Stop</button>:<button className="primary-btn" disabled={!draft.trim()} type="submit"><Send size={15}/>Send</button>}</div><small>Enter to send · Shift+Enter for a new line · Chat clears on sign-out</small></form>
  </>}
 </div></Dialog>}</>;
}
