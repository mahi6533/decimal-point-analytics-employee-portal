import { createClient } from '@supabase/supabase-js';

const url=import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
export const configured=Boolean(url && key);
const authFetch: typeof fetch = async (input,init)=>{
  const request=new Request(input,init);
  if(!url || !request.url.startsWith(url+'/auth/'))return fetch(request);
  const retry=request.clone();
  try{const response=await fetch(request);if(response.status<500)return response}catch{/* Retry through the existing same-origin proxy. */}
  const target=new URL(retry.url);
  return fetch('/api/supabase'+target.pathname+target.search,{method:retry.method,headers:retry.headers,body:['GET','HEAD'].includes(retry.method)?undefined:await retry.arrayBuffer(),signal:retry.signal});
};
export const supabase=createClient(url||'https://placeholder.supabase.co',key||'local-workspace',{global:{fetch:authFetch}});
export const supabaseAuth=supabase;
