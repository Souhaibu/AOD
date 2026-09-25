import { createClient } from '@supabase/supabase-js';
import type { CartItem, Product } from './types';
const url=import.meta.env.VITE_SUPABASE_URL, key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url,key) : null;
export const demo = !supabase;
export function readLocal<T>(key: string, fallback: T): T { try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
export function writeLocal(key: string, value: unknown) { try { localStorage.setItem(key,JSON.stringify(value)); } catch { /* Storage can be disabled. In-memory state remains usable. */ } }
export const itemKey = (i: CartItem) => [i.productId,i.size,i.color].join('|');
export function cartTotal(cart: CartItem[], products: Product[]) { return cart.reduce((sum,i)=>sum+(products.find(p=>p.id===i.productId)?.price ?? 0)*i.quantity,0); }
export function whatsappMessage(cart: CartItem[], products: Product[]) { return `Bonjour AOD Ventes & Services !\nJe souhaite me renseigner sur les articles suivants :\n\n${cart.map(i=>{const p=products.find(p=>p.id===i.productId);return `${p?.name ?? 'Article indisponible'} — ${i.color}, ${i.size} — quantité ${i.quantity} — ${p?.price ?? 0} GNF / unité`;}).join('\n')}\n\nSous-total articles : ${cartTotal(cart,products)} GNF.\nLivraison : frais à confirmer.\nMerci de confirmer la disponibilité et le total.${demo?'\nAttention : sélection issue du catalogue de démonstration.':''}`; }
export const whatsappUrl = (message: string) => `https://wa.me/224611252588?text=${encodeURIComponent(message)}`;
