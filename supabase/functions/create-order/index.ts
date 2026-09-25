import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
const headers={'Access-Control-Allow-Origin':Deno.env.get('STORE_ORIGIN')??'http://127.0.0.1:5173','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Content-Type':'application/json'};
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 const respond=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(req.method!=='POST')return respond({error:'Méthode non autorisée'},405);
 // Activation explicite après configuration de l’anti-abus et validation commerciale.
 if(Deno.env.get('AOD_ORDERS_ENABLED')!=='true')return respond({error:'Les commandes en ligne ne sont pas encore ouvertes. Contactez la boutique.'},503);
 try{
  const raw=await req.text();if(raw.length>20000)return respond({error:'Demande trop volumineuse'},413);
  const body=JSON.parse(raw);const c=body.customer;
  if(!c||typeof c.name!=='string'||typeof c.phone!=='string'||!Array.isArray(body.items)||body.items.length<1||body.items.length>50)return respond({error:'Formulaire invalide'},400);
  c.phone=c.phone.replace(/[\s-]/g,'');if(!c.phone.startsWith('+'))c.phone='+224'+c.phone;
  if(!/^\+224\d{9}$/.test(c.phone)||!['pickup','delivery'].includes(c.delivery)||!body.items.every((i:any)=>typeof i.productId==='string'&&typeof i.size==='string'&&typeof i.color==='string'&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=99))return respond({error:'Coordonnées ou panier invalides'},400);
  for(const k of ['name','city','neighborhood','landmark','notes']){if(typeof c[k]!=='string'||c[k].length>1000)return respond({error:'Formulaire invalide'},400);}
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
  const {data,error}=await db.rpc('aod_create_order',{payload:body});
  if(error)return respond({error:'Vérifiez votre sélection : un article ou une option peut être indisponible.'},400);
  return respond(data);
 }catch{return respond({error:'Demande invalide. Réessayez.'},400);}
});
