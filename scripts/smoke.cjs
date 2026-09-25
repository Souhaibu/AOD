const {chromium}=require('C:/Users/pc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.setDefaultTimeout(60000);
 page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded'});
 await page.getByRole('heading',{name:/L’allure/,level:1}).waitFor();
 await page.evaluate(async()=>{const imgs=Array.from(document.images);imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode()));});
 fs.mkdirSync('test-results',{recursive:true});
 await page.screenshot({path:'test-results/home-desktop.png',fullPage:true,animations:'disabled'});
 await page.goto('http://127.0.0.1:5173/catalogue');
 await page.getByRole('button',{name:'Femme',exact:true}).click();
 if(await page.locator('.product-card').count()!==2)throw Error('Filtre Femme incorrect');
 await page.getByRole('button',{name:'Tout découvrir'}).click();
 await page.getByLabel('Rechercher un article').fill('Atelier');
 if(await page.locator('.product-card').count()!==1)throw Error('Recherche incorrecte');
 await page.locator('.product-caption a').click();
 await page.getByRole('button',{name:'Ajouter au panier'}).click();
 await page.getByRole('link',{name:/Panier, 1 articles/}).click();
 await page.reload();
 await page.getByRole('heading',{name:'Le sac Atelier'}).waitFor();
 await page.getByRole('link',{name:'Passer commande'}).click();
 await page.getByLabel('Nom complet').fill('Client Test');
 await page.getByLabel('Téléphone',{exact:true}).fill('+224 611 25 25 88');
 await page.getByRole('button',{name:'Tester la commande'}).click();
 await page.getByRole('heading',{name:'Votre commande de test est prête.'}).waitFor();
 await page.goto('http://127.0.0.1:5173/admin');
 await page.getByRole('button',{name:'Modifier',exact:true}).first().click();
 await page.getByLabel('Nom',{exact:true}).fill('Le sac Atelier Test');
 await page.getByRole('button',{name:'Enregistrer',exact:true}).click();
 await page.getByRole('cell',{name:'Le sac Atelier Test',exact:true}).waitFor();
 await page.evaluate(()=>localStorage.removeItem('aod-products-v1'));
 for(const width of [320,375,390,430,768,1024,1440,1920]){
  await page.setViewportSize({width,height:900});
  await page.goto('http://127.0.0.1:5173');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Débordement accueil '+width);
  if(width===390){await page.evaluate(async()=>{const imgs=Array.from(document.images);imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode()));});await page.screenshot({path:'test-results/home-mobile.png',fullPage:true,animations:'disabled'});}
 }
 await page.setViewportSize({width:375,height:812});
 await page.goto('http://127.0.0.1:5173/commande');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Débordement checkout');
 await page.screenshot({path:'test-results/checkout-mobile.png',fullPage:true,animations:'disabled'});
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: filtres, recherche, panier persistant, commande de test, édition administrateur, 8 largeurs responsive, aucune erreur JavaScript.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
