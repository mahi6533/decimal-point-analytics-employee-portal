import {useEffect,useState,type FormEvent} from 'react';
import {Eye,EyeOff,LockKeyhole,Monitor,ShieldCheck} from 'lucide-react';
import {configured,supabaseAuth} from './lib/supabase';
import './entry.css';

export default function Entry({onLocalAccess}:{onLocalAccess:()=>void}){
  const [signup,setSignup]=useState(false);
  const [visible,setVisible]=useState(false);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [health,setHealth]=useState(configured?'Checking sign-in service…':'Shared sign-in requires a connected workspace.');
  useEffect(()=>{
    if(!configured)return;
    const controller=new AbortController();
    let active=true;
    const timeout=setTimeout(()=>controller.abort(),7000);
    fetch(import.meta.env.VITE_SUPABASE_URL+'/auth/v1/health',{headers:{apikey:import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY},signal:controller.signal})
      .then(response=>{if(active)setHealth(response.ok?'Sign-in service available':'Sign-in service temporarily unavailable');})
      .catch(()=>{if(active)setHealth('Could not reach the sign-in service');}).finally(()=>clearTimeout(timeout));
    return ()=>{active=false;controller.abort();clearTimeout(timeout);};
  },[]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const fields=new FormData(event.currentTarget);
    if(!configured){setMessage('Use browser access below to open your employee workspace.');return;}
    setBusy(true);setMessage('');
    try{
      const credentials={email:String(fields.get('email')).trim(),password:String(fields.get('password'))};
      if(signup){
        const {data,error}=await supabaseAuth.auth.signUp({...credentials,options:{data:{full_name:String(fields.get('name')).trim()}}});
        if(error)throw error;
        setMessage(data.session?'Account created.':'Check your work email to confirm your account before signing in.');
      }else{
        const {error}=await supabaseAuth.auth.signInWithPassword(credentials);
        if(error)throw error;
      }
    }catch(error){setMessage(error instanceof Error?error.message:'Unable to sign in. Please try again.');}
    finally{setBusy(false);}
  }
  return <main className="entry-screen">
    <section className="entry-art" aria-label="Decimal Point Analytics">
      <div className="entry-brand"><img src="/mark.svg" width="42" height="42" alt=""/><span>Decimal Point <strong>Analytics</strong></span></div>
      <div className="entry-intro"><p>EMPLOYEE PORTAL</p><h2>Engineering<br/>Workspace</h2><img className="entry-compute" src="/compute-stack.svg" alt=""/></div>
      <div className="entry-brand-foot">Applied AI <i/> Software engineering <i/> Data engineering</div>
    </section>
    <section className="entry-form"><div className="entry-box">
      <span className="entry-lock"><LockKeyhole size={21}/></span>
      <h1>{signup?'Create an account':'Welcome back'}</h1>
      <p>{signup?'Register with your work email to access the employee portal.':'Sign in to your Decimal Point Analytics workspace.'}</p>
      <form onSubmit={submit}>
        {signup&&<label>Full name<input required maxLength={100} name="name" autoComplete="name" placeholder="First and last name"/></label>}
        <label>Work email<input required type="email" name="email" autoComplete="username" placeholder="name@decimalpointanalytics.com"/></label>
        <label>Password<span className="entry-password"><input required minLength={6} name="password" type={visible?'text':'password'} autoComplete={signup?'new-password':'current-password'}/><button type="button" aria-label={visible?'Hide password':'Show password'} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></span></label>
        {message&&<p className="entry-feedback" role="status">{message}</p>}
        <button className="primary-btn" disabled={busy}>{busy?'Please wait…':signup?'Create account':'Sign in'}</button>
      </form>
      {configured&&<button className="entry-switch" disabled={busy} onClick={()=>{setSignup(!signup);setMessage('');}}>{signup?'Already registered? Sign in':'Create an employee account'}</button>}
      <div className="entry-access"><button className="secondary-btn" onClick={onLocalAccess}><Monitor size={17}/>Continue to employee workspace</button><small>Browser access keeps your changes on this device.</small></div>
      <div className="entry-status" role="status"><ShieldCheck size={15}/>{health}</div>
    </div></section>
  </main>;
}
