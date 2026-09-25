import type { Product } from './types';
// Visuels générés d’inspiration guinéenne. Aucun article réel n’est représenté.
const localIllustrations: Record<string,string> = {
 'photo-1483985988355-763728e1935b':'aod-conakry-hero',
 'photo-1548036328-c9fa89d128fa':'aod-sacs',
 'photo-1598033129183-c4f50c736f10':'aod-homme',
 'photo-1515372039744-b8f02a3ae446':'aod-femme',
 'photo-1539109136881-3be0616acf4b':'aod-femme',
 'photo-1617137968427-85924c800a22':'aod-homme',
 'photo-1584917865442-de89df76afd3':'aod-sacs',
 'photo-1445205170230-053b83016050':'aod-boutique',
 'photo-1441986300917-64674bd600d8':'aod-boutique'
};
export const photo = (id: string, _width = 700) => localIllustrations[id] ? `/images/${localIllustrations[id]}.webp` : `/images/${id}.jpg`;
export const products: Product[] = [
 { id:'sac-atelier',name:'Le sac Atelier',category:'Sacs',price:250000,image:photo('photo-1548036328-c9fa89d128fa'),description:'Une silhouette structurée et une teinte chaleureuse pour accompagner vos journées. Porté main ou épaule.',material:'Matière à confirmer sur le produit réel',sizes:['Unique'],colors:['Camel','Noir'],stock:8,featured:true,published:true,created_at:'2026-09-20'},
 { id:'chemise-essentielle',name:'La chemise Essentielle',category:'Homme',price:180000,image:photo('photo-1598033129183-c4f50c736f10'),description:'Une coupe décontractée qui se porte aussi bien au bureau que le week-end. Choisissez votre taille et demandez conseil à notre équipe.',material:'Composition à confirmer',sizes:['S','M','L','XL'],colors:['Écru','Bleu'],stock:12,featured:true,published:true,created_at:'2026-09-19'},
 { id:'robe-lumiere',name:'La robe Lumière',category:'Femme',price:320000,image:photo('photo-1515372039744-b8f02a3ae446'),description:'Une pièce fluide et féminine pour les moments du quotidien comme les belles occasions.',material:'Composition à confirmer',sizes:['S','M','L'],colors:['Sable','Noir'],stock:6,featured:true,published:true,created_at:'2026-09-18'},
 { id:'sandales-rivage',name:'Les sandales Rivage',category:'Chaussures',price:150000,image:photo('photo-1543163521-1bf539c55dd2'),description:'Une ligne délicate qui complète une tenue avec simplicité. Pointures européennes.',material:'Composition à confirmer',sizes:['37','38','39','40'],colors:['Beige'],stock:9,featured:true,published:true,created_at:'2026-09-17'},
 { id:'sac-voyage',name:'Le compagnon de voyage',category:'Sacs',price:450000,image:photo('photo-1553062407-98eeb64c6a62'),description:'Un format pratique pour garder vos essentiels à portée de main pendant vos déplacements.',material:'Dimensions et composition à confirmer',sizes:['Unique'],colors:['Noir'],stock:5,featured:false,published:true,created_at:'2026-09-16'},
 { id:'lunettes-horizon',name:'Les lunettes Horizon',category:'Accessoires',price:85000,image:photo('photo-1511499767150-a48a237f0083'),description:'La touche finale de votre silhouette. Caractéristiques de protection à vérifier sur le produit réel.',material:'Composition à confirmer',sizes:['Unique'],colors:['Écaille','Noir'],stock:15,featured:false,published:true,created_at:'2026-09-15'},
 { id:'ensemble-libre',name:'L’ensemble Libre',category:'Femme',price:380000,image:photo('photo-1483985988355-763728e1935b'),description:'Une proposition de tenue à découvrir avec notre équipe. Visuel d’inspiration, non contractuel.',material:'Composition à confirmer',sizes:['S','M','L','XL'],colors:['Sable'],stock:4,featured:false,published:true,created_at:'2026-09-14'},
 { id:'sneakers-urbaines',name:'Les sneakers Urbaines',category:'Chaussures',price:280000,image:photo('photo-1549298916-b41d501d3772'),description:'Une allure décontractée pour vos déplacements du quotidien. Pointures européennes.',material:'Composition à confirmer',sizes:['40','41','42','43','44'],colors:['Camel'],stock:7,featured:false,published:true,created_at:'2026-09-13'}
];
export const categories = ['Femme','Homme','Sacs','Chaussures','Accessoires'];
export const money = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' GNF';
