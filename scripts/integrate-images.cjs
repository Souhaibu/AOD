const fs = require('node:fs');
const path = require('node:path');
const sharp = require('C:/Users/pc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const source = 'C:/Users/pc/.codex/generated_images/01a0cfe8-a080-77f2-b67e-13b600a4ec91';
const files = {
 'aod-conakry-hero':'exec-4b0baecd-b922-42cb-988c-8f15c771bed4.png',
 'aod-homme':'exec-eea6f950-ffbc-4fb5-b446-be3218d29a98.png',
 'aod-femme':'exec-869d49c4-bf2c-40a5-a115-64a0d15ded84.png',
 'aod-sacs':'exec-3ed39a87-0c67-45a9-a51b-b61e155049c1.png',
 'aod-boutique':'exec-d926860f-fca4-4aa8-88f7-56f47dd1c9ae.png'
};
(async()=>{
 for(const [name,file] of Object.entries(files)){
  await sharp(path.join(source,file)).resize({width:1200,withoutEnlargement:true}).webp({quality:82}).toFile(path.join('public/images',name+'.webp'));
  console.log(name);
 }
 const p='src/admin.tsx';let s=fs.readFileSync(p,'utf8');
 s=s.replace("!p.image.startsWith('https://')","!(p.image.startsWith('https://')||p.image.startsWith('/images/'))");
 s=s.replace('URL photo HTTPS','Photo (URL HTTPS ou chemin /images/)').replace('name="image" type="url"','name="image" type="text"');
 fs.writeFileSync(p,s);
 const page='src/pages.tsx';let content=fs.readFileSync(page,'utf8');
 content=content.replace('Inspiration mode : une journée de shopping','Illustration : mode contemporaine inspirée de la Guinée');
 content=content.replace('Sélection de vêtements sur un portant','Illustration d’une scène de mode en boutique, inspirée de Conakry');
 content=content.replace('Photo d’inspiration d’une boutique de vêtements','Illustration générée d’une boutique de mode guinéenne');
 content=content.replace('Photo d’inspiration — photo réelle de la boutique à venir.','Illustration générée — ne représente pas la boutique réelle.');
 fs.writeFileSync(page,content);
})().catch(e=>{console.error(e);process.exit(1)});
