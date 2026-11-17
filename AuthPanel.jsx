import React, {useState} from 'react';
import {KeyRound, ShieldCheck, ArrowRight, Eye, EyeOff} from 'lucide-react';
import {supabase} from './cloud';

export function AuthLayout({children}) {
  return <div className="auth-layout"><section className="auth-story"><div className="auth-brand"><KeyRound size={26}/> SubVault</div><h1>Your inventory.<br/>Beautifully<br/>under control.</h1><p>A quieter way to manage subscription accounts. Keep track of every credential, every listing, and every sale.</p><footer>ORGANIZED STOCK. CLEARER DAYS.</footer></section><main className="auth-main"><div className="auth-form"><ShieldCheck size={27} color="#8b6a4d"/><p className="eyebrow" style={{margin:'26px 0 8px'}}>YOUR PRIVATE WORKSPACE</p>{children}</div></main></div>;
}
function PasswordField({id,label,value,onChange,confirm=false,newPassword=false}) {
 const [show,setShow]=useState(false);
 return <><label htmlFor={id}>{label}</label><div style={{position:'relative'}}><input id={id} type={show?'text':'password'} autoComplete={newPassword?'new-password':'current-password'} required minLength={newPassword?12:undefined} value={value} onChange={onChange} style={{paddingRight:48}}/><button type="button" aria-label={show?'Hide '+label.toLowerCase():'Show '+label.toLowerCase()} onClick={()=>setShow(!show)} style={{position:'absolute',right:14,top:15,color:'#857365'}}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div>{newPassword&&!confirm&&<small style={{fontSize:11,color:'#857365',display:'block',marginTop:7}}>Use at least 12 characters.</small>}</>;
}
export default function AuthPanel() {
 const [mode,setMode]=useState('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[failed,setFailed]=useState(false);
 const signup=mode==='signup',forgot=mode==='forgot';
 function switchMode(next){setMode(next);setPassword('');setConfirm('');setMessage('');setFailed(false);}
 async function submit(e){
  e.preventDefault();setMessage('');setFailed(false);
  if(signup&&password!==confirm){setMessage('The passwords do not match.');setFailed(true);return;}
  setBusy(true);
  try {
   let response;
   if(forgot){response=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+'/?flow=recovery'});}
   else if(signup){response=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin}});}
   else {response=await supabase.auth.signInWithPassword({email:email.trim(),password});}
   if(response.error)throw response.error;
   if(forgot)setMessage('If an account exists for this email, you’ll receive a password reset link. Open it to choose a new password.');
   if(signup&&!response.data.session)setMessage('Check your email to confirm your account. Then return here and sign in with your email and password.');
  }catch(err){setFailed(true);setMessage(err.message);}finally{setBusy(false);}
 }
 return <AuthLayout><h2>{forgot?'Reset your password.':signup?'Create your vault.':'Welcome to your vault.'}</h2><p>{forgot?'Enter your login email and we’ll send you a secure reset link.':signup?'Choose an email ID and password for your private workspace.':'Sign in with your email ID and password.'}</p>{!supabase?<div className="setup-notice">The workspace is being connected to Supabase.</div>:<form onSubmit={submit}><label htmlFor="login-email">Email ID</label><input id="login-email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>{!forgot&&<PasswordField id="login-password" label="Password" value={password} onChange={e=>setPassword(e.target.value)} newPassword={signup}/ >}{signup&&<PasswordField id="signup-confirm" label="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} newPassword confirm/>}<button className="auth-primary" disabled={busy}>{busy?'Please wait…':forgot?'Send reset link':signup?'Create account':'Sign in'} <ArrowRight size={14} style={{display:'inline',marginLeft:10}}/></button>{message&&<p role={failed?'alert':'status'} className="message">{message}</p>}<div style={{display:'flex',justifyContent:'space-between',gap:16}}><button type="button" disabled={busy} className="text-action" onClick={()=>switchMode(forgot||signup?'login':'signup')}>{forgot||signup?'Back to sign in':'Create an account'}</button>{!forgot&&<button type="button" disabled={busy} className="text-action" onClick={()=>switchMode('forgot')}>Forgot password?</button>}</div></form>}<p style={{fontSize:11,marginTop:28}}>Already used an email sign-in link? Set a password inside your existing workspace, or use Forgot password with the same email ID.</p></AuthLayout>;
}
export function SetPassword({email,onDone,onCancel}) {
 const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[success,setSuccess]=useState(false);
 async function submit(e){
  e.preventDefault();setMessage('');
  if(password!==confirm){setMessage('The passwords do not match.');return;}
  setBusy(true);
  try{const {error}=await supabase.auth.updateUser({password});if(error)throw error;setPassword('');setConfirm('');setSuccess(true);}
  catch(err){setMessage(err.message);}finally{setBusy(false);}
 }
 return <AuthLayout><h2>{success?'Password saved.':'Set your password.'}</h2>{success?<><p>You can now sign in with your email ID and password. Your existing vault is unchanged.</p><button className="auth-primary" onClick={onDone}>Return to workspace</button></>:<><p>Choose a password for your existing account.</p><label htmlFor="account-email">Email ID</label><input id="account-email" value={email||''} readOnly autoComplete="username"/><form onSubmit={submit}><PasswordField id="new-password" label="New password" value={password} onChange={e=>setPassword(e.target.value)} newPassword/><PasswordField id="confirm-password" label="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} newPassword confirm/>{message&&<p role="alert" className="message">{message}</p>}<button className="auth-primary" disabled={busy}>{busy?'Saving password…':'Save password'}</button><button className="text-action" type="button" disabled={busy} onClick={onCancel}>Back to workspace</button></form></>}</AuthLayout>;
}
