import { describe, expect, it } from 'vitest';
import { cartTotal, itemKey, whatsappMessage, whatsappUrl } from './lib';
import { products } from './data';
describe('panier et message de commande',()=>{
 it('calcule un total en GNF à partir du catalogue',()=>{expect(cartTotal([{productId:products[0].id,size:'Unique',color:'Camel',quantity:2}],products)).toBe(500000);});
 it('sépare les options d’un même produit',()=>{expect(itemKey({productId:'x',size:'M',color:'Noir',quantity:1})).not.toBe(itemKey({productId:'x',size:'L',color:'Noir',quantity:1}));});
 it('ne présente pas les frais inconnus comme gratuits',()=>{const text=whatsappMessage([{productId:products[0].id,size:'Unique',color:'Camel',quantity:1}],products);expect(text).toContain('frais à confirmer');expect(text).toContain('250000');expect(text).toContain('démonstration');});
 it('encode correctement les caractères du message',()=>{expect(whatsappUrl('Bonjour & merci')).toBe('https://wa.me/224611252588?text=Bonjour%20%26%20merci');});
});
