export const config = { runtime: 'edge' };
const reply = (status, body) => Response.json(body, {status, headers: {'Cache-Control':'no-store'}});
export default async function handler(req) {
  if (req.method !== 'POST') return reply(405, {error:'Use POST to send a message.'});
  if (req.headers.get('origin') && req.headers.get('origin') !== new URL(req.url).origin) return reply(403,{error:'Request origin rejected.'});
  const authorization = req.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) return reply(401,{error:'Sign in to use the AI assistant.'});
  const {VITE_SUPABASE_URL:url,VITE_SUPABASE_PUBLISHABLE_KEY:publicKey,GEMINI_API_KEY:key}=process.env;
  if (!url || !publicKey || !key) return reply(503,{error:'The AI assistant is not configured yet.'});
  try {
    const auth=await fetch(url+'/auth/v1/user',{headers:{authorization,apikey:publicKey},signal:AbortSignal.timeout(10000)});
    if(!auth.ok) return reply(auth.status>=500?503:401,{error:auth.status>=500?'Sign-in service is temporarily unavailable.':'Your session expired. Please sign in again.'});
    const user=await auth.json();
    if(!user.id) return reply(401,{error:'Please sign in again.'});
    const raw=await req.text();
    if(raw.length>24000) return reply(413,{error:'Conversation is too long. Start a new chat.'});
    let body;try{body=JSON.parse(raw)}catch{return reply(400,{error:'Invalid message.'})}
    const messages=body.messages;
    if(!Array.isArray(messages)||!messages.length||messages.length>16||messages.some((m,i)=>!m||m.role!==(i%2===0?'user':'model')||typeof m.text!=='string'||!m.text.trim()||m.text.length>4000)||messages.at(-1).role!=='user')return reply(400,{error:'Send a message of up to 4,000 characters.'});
    const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',{
      method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},signal:AbortSignal.timeout(45000),
      body:JSON.stringify({systemInstruction:{parts:[{text:'You are DPA Assistant for the Decimal Point Analytics engineering workspace. Help with coding, AI, data analysis, writing, and portal navigation. Be concise and practical. You cannot access employee records, files, payroll, or perform actions. Do not claim to submit requests or know company policies. Portal modules: My Work, Projects, Calendar, Attendance, Timesheet, Leave, Support, Payroll, Directory, Documents, Profile, Settings. To apply leave use Leave; to log time use Timesheet; for a ticket use Support. For official policies direct users to Documents or HR. Never ask for passwords or API keys. Only the typed conversation is provided to you.'}]},contents:messages.map(m=>({role:m.role,parts:[{text:m.text}]})),generationConfig:{maxOutputTokens:1500,temperature:0.4}})
    });
    if(!response.ok)return reply(response.status===429?429:502,{error:response.status===429?'The free AI quota is busy or exhausted. Please try again later.':response.status===401||response.status===403?'The AI provider rejected the configured key. Please contact the workspace administrator.':'The AI service is temporarily unavailable. Please try again.'});
    const result=await response.json();
    const text=result.candidates?.[0]?.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join('').trim();
    if(!text)return reply(422,{error:'The assistant could not answer this message. Try rephrasing it.'});
    return reply(200,{text});
  }catch{return reply(503,{error:'The assistant could not connect. Please try again in a moment.'})}
}
