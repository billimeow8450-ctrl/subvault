import React, {useState, useEffect, useCallback, useRef, lazy, Suspense} from 'react';
import {KeyRound, ShieldCheck, ArrowRight} from 'lucide-react';
const App = lazy(() => import('./App')); 
import {supabase, loadVault, saveVault} from './cloud';

function Login() {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [magic,setMagic]=useState(true);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  async function submit(e){
    e.preventDefault(); setBusy(true);setMessage('');
    try {
      const {error} = magic ? await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin}}) : await supabase.auth.signInWithPassword({email:email.trim(),password});
      if(error) throw error;
      if(magic)setMessage('Check your email. Your secure sign-in link is on its way.');
    }catch(err){setMessage(err.message);}finally{setBusy(false);}
  }
  return <div className="auth-layout"><section className="auth-story"><div className="auth-brand"><KeyRound size={26}/> SubVault</div><h1>Your inventory.<br/>Beautifully<br/>under control.</h1><p>A quieter way to manage subscription accounts. Keep track of every credential, every listing, and every sale.</p><footer>ORGANIZED STOCK. CLEARER DAYS.</footer></section><main className="auth-main"><div className="auth-form"><ShieldCheck size={27} color="#8b6a4d"/><p className="eyebrow" style={{margin:'26px 0 8px'}}>YOUR PRIVATE WORKSPACE</p><h2>Welcome to your vault.</h2><p>Sign in to keep your inventory securely in sync across your devices.</p>{!supabase?<div className="setup-notice">The workspace is being connected to Supabase. Add the project URL and publishable key to finish setup.</div>:<form onSubmit={submit}><label htmlFor="login-email">Email address</label><input id="login-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>{!magic&&<><label htmlFor="login-password">Password</label><input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></>}<button className="auth-primary" disabled={busy}>{busy?'Please wait…':magic?'Email me a sign-in link':'Sign in'} <ArrowRight size={14} style={{display:'inline',marginLeft:10}}/></button><button type="button" className="text-action" onClick={()=>{setMagic(!magic);setMessage('');}}>{magic?'Use an existing password instead':'Sign in with an email link'}</button>{message&&<p role="status" className="message">{message}</p>}</form>}<p style={{fontSize:11,marginTop:35}}>Your workspace starts empty. Only you can access your saved inventory.</p></div></main></div>;
}
function Vault({session}){
  const [loaded,setLoaded]=useState(null);
  const [error,setError]=useState('');
  const [status,setStatus]=useState('All changes saved');
  const revision=useRef(0), pending=useRef(null), saved=useRef(''), saving=useRef(false), blocked=useRef(false);
  useEffect(()=>{let active=true;loadVault().then(v=>{if(active){revision.current=v.revision;saved.current=JSON.stringify(v.payload);setLoaded(v.payload);}}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[]);
  const flush=useCallback(async()=>{
    if(saving.current||blocked.current||!pending.current)return;
    const next=pending.current;pending.current=null;
    if(JSON.stringify(next)===saved.current)return;
    saving.current=true;setStatus('Saving changes…');
    try{revision.current=await saveVault(next,revision.current);saved.current=JSON.stringify(next);setStatus('All changes saved');}
    catch(e){pending.current=pending.current||next;blocked.current=true;setStatus('Changes not saved');setError(e.message.includes('conflict')?'This vault changed in another tab or device. Download your unsaved copy before reloading to avoid losing changes.':e.message);}
    finally{saving.current=false;}
  },[]);
  useEffect(()=>{const id=setInterval(flush,650);const unload=e=>{if(saving.current||pending.current){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',unload);return()=>{clearInterval(id);window.removeEventListener('beforeunload',unload);};},[flush]);
  const change=useCallback(data=>{if(JSON.stringify(data)!==saved.current){pending.current=data;setStatus('Unsaved changes');}},[]);
  async function signOut(){await flush();if(blocked.current||saving.current||pending.current){setError('Wait for changes to save, or download your unsaved copy before signing out.');return;}await supabase.auth.signOut();}
  function download(){const b=new Blob([JSON.stringify(pending.current||loaded,null,2)],{type:'application/json'});const url=URL.createObjectURL(b);const a=document.createElement('a');a.href=url;a.download='subvault-unsaved-backup.json';a.click();URL.revokeObjectURL(url);}
  if(!loaded)return <div className="auth-main" style={{minHeight:'100vh'}}><div className="auth-form"><h2>{error?'Unable to open your vault':'Opening your vault…'}</h2><p role="status">{error||'Connecting to your private workspace.'}</p>{error&&<button className="auth-primary" onClick={()=>location.reload()}>Try again</button>}</div></div>;
  return <>{error&&<div role="alert" className="bg-rose-950 text-rose-300 p-4 text-sm flex gap-4 flex-wrap">{error}<button onClick={download}>Download unsaved backup</button><button onClick={()=>{if(error.includes('another tab'))return;blocked.current=false;setError('');flush();}}>Retry save</button></div>}<Suspense fallback={<div className="p-8">Opening inventory…</div>}><App initialData={loaded} onChange={change} cloudStatus={status} userEmail={session.user.email} onSignOut={signOut}/></Suspense></>;
}
export default function Workspace(){
  const [session,setSession]=useState(null),[ready,setReady]=useState(!supabase);
  useEffect(()=>{if(!supabase)return;supabase.auth.getSession().then(({data,error})=>{if(!error)setSession(data.session);setReady(true);});const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>{setSession(s);setReady(true);});return()=>subscription.unsubscribe();},[]);
  if(!ready)return <div className="auth-main" style={{minHeight:'100vh'}}>Opening SubVault…</div>;
  return session?<Vault key={session.user.id} session={session}/>:<Login/>;
}
