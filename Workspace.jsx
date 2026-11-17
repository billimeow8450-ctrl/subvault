import React, {useState, useEffect, useCallback, useRef, lazy, Suspense} from 'react';
import AuthPanel, {SetPassword} from './AuthPanel';
const App = lazy(() => import('./App')); 
import {supabase, loadVault, saveVault} from './cloud';

function Vault({session,onSetPassword}){
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
  async function openPassword(){await flush();if(blocked.current||saving.current||pending.current){setError('Wait for changes to save before opening password settings.');return;}onSetPassword();}
  function download(){const b=new Blob([JSON.stringify(pending.current||loaded,null,2)],{type:'application/json'});const url=URL.createObjectURL(b);const a=document.createElement('a');a.href=url;a.download='subvault-unsaved-backup.json';a.click();URL.revokeObjectURL(url);}
  if(!loaded)return <div className="auth-main" style={{minHeight:'100vh'}}><div className="auth-form"><h2>{error?'Unable to open your vault':'Opening your vault…'}</h2><p role="status">{error||'Connecting to your private workspace.'}</p>{error&&<button className="auth-primary" onClick={()=>location.reload()}>Try again</button>}</div></div>;
  return <>{error&&<div role="alert" className="bg-rose-950 text-rose-300 p-4 text-sm flex gap-4 flex-wrap">{error}<button onClick={download}>Download unsaved backup</button><button onClick={()=>{if(error.includes('another tab'))return;blocked.current=false;setError('');flush();}}>Retry save</button></div>}<Suspense fallback={<div className="p-8">Opening inventory…</div>}><App initialData={loaded} onChange={change} cloudStatus={status} userEmail={session.user.email} onSignOut={signOut} onSetPassword={openPassword}/></Suspense></>;
}
export default function Workspace(){
  const [session,setSession]=useState(null),[ready,setReady]=useState(!supabase);
  const [passwordMode,setPasswordMode]=useState(()=>new URLSearchParams(window.location.search).get('flow')==='recovery');
  const [authError,setAuthError]=useState('');
  useEffect(()=>{
    if(!supabase)return;
    supabase.auth.getSession().then(({data,error})=>{if(error)setAuthError(error.message);else setSession(data.session);setReady(true);}).catch(e=>{setAuthError(e.message);setReady(true);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,s)=>{if(event==='PASSWORD_RECOVERY')setPasswordMode(true);if(event==='SIGNED_OUT')setPasswordMode(false);setSession(s);setReady(true);});
    return()=>subscription.unsubscribe();
  },[]);
  function closePassword(){setPasswordMode(false);const url=new URL(window.location.href);url.searchParams.delete('flow');window.history.replaceState({},'',url.pathname+url.search+url.hash);}
  if(!ready)return <div className="auth-main" style={{minHeight:'100vh'}}>Opening SubVault…</div>;
  if(session&&passwordMode)return <SetPassword email={session.user.email} onDone={closePassword} onCancel={closePassword}/>;
  return <>{authError&&<div role="alert" className="bg-rose-950 text-rose-300 p-4">{authError}</div>}{session?<Vault key={session.user.id} session={session} onSetPassword={()=>setPasswordMode(true)}/>:<AuthPanel/>}</>;
}
