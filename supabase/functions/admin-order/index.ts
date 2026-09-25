import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
const headers={'Access-Control-Allow-Origin':Deno.env.get('STORE_ORIGIN')??'http://127.0.0.1:5173','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Content-Type':'application/json'};
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 const respond=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(req.method!=='POST')return respond({error:'Méthode non autorisée'},405);
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');if(!token)return respond({error:'Connexion requise'},401);
 const {data:{user},error:authError}=await db.auth.getUser(token);
 if(authError||user?.app_metadata?.role!=='admin')return respond({error:'Accès refusé'},403);
 try{const {id,status}=await req.json();if(typeof id!=='string'||typeof status!=='string')return respond({error:'Demande invalide'},400);
 const {error}=await db.rpc('aod_update_order',{order_id:id,next_status:status});
 if(error)return respond({error:'Transition impossible : vérifiez le stock et l’accord sur la livraison.'},409);
 return respond({ok:true});}catch{return respond({error:'Demande invalide'},400);}
});
