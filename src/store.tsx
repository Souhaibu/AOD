import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { products as seed } from './data';
import { supabase, readLocal, writeLocal, itemKey } from './lib';
import type { Product, CartItem } from './types';
type Store = { products: Product[]; loading: boolean; error: string; cart: CartItem[]; favorites: string[]; notice: string; add: (i: CartItem)=>void; change: (key: string,qty: number)=>void; clear: ()=>void; favorite: (id:string)=>void; notify: (s:string)=>void; saveProducts: (p:Product[])=>void };
const Context=createContext<Store>(null!);
export const useStore=()=>useContext(Context);
export function StoreProvider({children}:{children:ReactNode}) {
 const [localProducts,setLocalProducts]=useState<Product[]>(()=>readLocal<Product[]>('aod-products-v1',seed).map(p=>{const current=seed.find(s=>s.id===p.id);return current&&(p.image.includes('images.unsplash.com/')||p.image.startsWith('/images/photo-'))?{...p,image:current.image}:p;}));
 const [cart,setCart]=useState<CartItem[]>(()=>{const c=readLocal<unknown>('aod-cart-v1',[]);return Array.isArray(c)?c.filter(i=>typeof i.productId==='string'&&typeof i.size==='string'&&typeof i.color==='string'&&Number.isInteger(i.quantity)&&i.quantity>0):[];});
 const [favorites,setFavorites]=useState<string[]>(()=>readLocal('aod-favorites-v1',[]));
 const [notice,notify]=useState('');
 const query=useQuery({queryKey:['products'],queryFn:async()=>{const {data,error}=await supabase!.from('products').select('*').eq('published',true).order('created_at',{ascending:false});if(error)throw error;return data as Product[];},enabled:!!supabase});
 const products=supabase?(query.data??[]):localProducts;
 useEffect(()=>writeLocal('aod-cart-v1',cart),[cart]);
 useEffect(()=>writeLocal('aod-favorites-v1',favorites),[favorites]);
 useEffect(()=>{if(notice){const t=setTimeout(()=>notify(''),4000);return()=>clearTimeout(t);}},[notice]);
 function add(item:CartItem){const p=products.find(p=>p.id===item.productId);if(!p||!p.sizes.includes(item.size)||!p.colors.includes(item.color))return;const total=cart.filter(i=>i.productId===item.productId).reduce((n,i)=>n+i.quantity,0);if(total+item.quantity>p.stock){notify('La quantité dépasse le stock disponible.');return;}setCart(c=>{const existing=c.find(i=>itemKey(i)===itemKey(item));return existing?c.map(i=>itemKey(i)===itemKey(item)?{...i,quantity:i.quantity+item.quantity}:i):[...c,item];});notify('Article ajouté à votre panier');}
 function change(key:string,qty:number){if(qty<=0){setCart(c=>c.filter(i=>itemKey(i)!==key));return;}const i=cart.find(i=>itemKey(i)===key);if(!i)return;const p=products.find(p=>p.id===i.productId);const others=cart.filter(c=>c.productId===i.productId&&itemKey(c)!==key).reduce((n,c)=>n+c.quantity,0);if(!p||qty+others>p.stock){notify('Stock disponible insuffisant.');return;}setCart(c=>c.map(i=>itemKey(i)===key?{...i,quantity:qty}:i));}
 return <Context.Provider value={{products,cart,favorites,notice,add,change,clear:()=>setCart([]),favorite:id=>setFavorites(f=>f.includes(id)?f.filter(v=>v!==id):[...f,id]),notify,loading:!!supabase&&query.isLoading,error:query.error?'Impossible de charger les articles. Réessayez dans un instant.':'',saveProducts:p=>{setLocalProducts(p);writeLocal('aod-products-v1',p);}}}>{children}</Context.Provider>;
}
