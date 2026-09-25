# AOD Ventes & Services

Boutique React / TypeScript adaptée à Madina, Conakry. Interface responsive bleu nuit, or et crème, catalogue de démonstration, filtres, favoris, fiches produits, panier persistant, formulaire invité, liens WhatsApp et administration locale.

## Démarrer

Node.js 22.12+ recommandé (ou 22.20 installé sur cet ordinateur).

```sh
npm install
npm run dev
npm run build
npm test
```

Sur ce poste, le lanceur `npm` du profil est défectueux. Alternative vérifiée :

```powershell
& 'C:\Program Files\nodejs\node.exe' 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' run dev
```

Ouvrir http://127.0.0.1:5173. L’administration de démonstration est sur `/admin`.

## Démonstration

Sans variables Supabase, les produits et modifications administrateur sont conservés uniquement dans le navigateur (`aod-products-v1`). Le panier et les favoris utilisent également le stockage local. Les coordonnées du formulaire de test ne sont pas enregistrées. Les visuels générés d’inspiration guinéenne et les photos Unsplash restantes sont illustratifs : ils ne représentent pas le stock AOD.

Les liens WhatsApp ouvrent un message, sans l’envoyer automatiquement. Le numéro provient du cahier des charges et reste à vérifier avant publication. Les photos d’illustration sont servies depuis `public/images` ; le script `scripts/download-assets.ps1` conserve les identifiants de leurs sources Unsplash. Les cinq nouveaux visuels créés avec l’outil intégré ImageGen sont décrits dans `public/images/IMAGES.md` et optimisés en WebP.

## Supabase — préparation livrée, connexion non effectuée

Aucun des projets Supabase existants n’a été modifié. Choisir un projet dédié avant installation du schéma.

1. Exécuter `supabase/schema.sql` dans une base vide du projet AOD après revue. Ce fichier est un bootstrap SQL, pas une migration validée contre une base distante.
2. Copier `.env.example` vers `.env.local` et renseigner l’URL et la clé **publique** du projet. Ne jamais placer de clé service dans une variable `VITE_`.
3. Créer un utilisateur administrateur avec Supabase Auth, puis définir `app_metadata.role = admin` côté serveur/dashboard. Les métadonnées modifiables par le client ne confèrent aucun droit.
4. Déployer les fonctions `create-order` et `admin-order`, configurer `STORE_ORIGIN` avec l’origine exacte du site. Les fonctions utilisent les secrets serveur Supabase.
5. Insérer les vrais articles depuis l’administration. Le catalogue connecté ne réutilise pas automatiquement les produits fictifs.
6. Valider les contrôles RLS et les scénarios de concurrence avant ouverture. Les commandes sont désactivées par défaut côté serveur : `AOD_ORDERS_ENABLED=true` les active après validation commerciale et protection contre les abus.

La création de commande recalcule les prix depuis la base, vérifie les options, prend une clé d’idempotence et renvoie uniquement une référence. La confirmation réserve le stock dans une transaction ; l’annulation le restitue une seule fois. Aucune route publique ne donne accès aux coordonnées des commandes.

## Limites actuelles avant exploitation commerciale

- Le stock est géré par produit ; le stock indépendant de chaque combinaison taille/couleur reste à implémenter.
- L’administration reçoit les commandes et change leurs statuts. Le devis de livraison et son accord client doivent être enregistrés avant confirmation d’une livraison ; l’interface de ce devis et le rapprochement des paiements restent à compléter.
- Pas d’API Orange Money ni de paiement réel. Aucun encaissement automatique n’est simulé.
- Pas encore d’historique client, d’adresses enregistrées, d’upload de photos, de galerie multiple ni de règles d’expiration automatique des réservations.
- L’authentification connectée est préparée ; finaliser et tester le parcours de réinitialisation du mot de passe avant ouverture aux clients.
- L’anti-abus serveur (limitation de débit / CAPTCHA), les sauvegardes et les essais des fonctions SQL sur le projet choisi sont requis avant activation des commandes.
- Remplacer les photos, tarifs et contenus de démonstration ; fournir logo, horaires, repère précis, conditions de vente et politique de confidentialité définitive.

## Déploiement

`npm run build` génère `dist`. Les règles SPA pour Netlify (`public/_redirects`) et Vercel (`vercel.json`) sont fournies. Ajouter les variables publiques dans l’hébergeur puis reconstruire. Aucune publication n’a été effectuée.

## Structure

- `src/pages.tsx` : pages publiques et commande.
- `src/components.tsx` : cartes et grilles produit.
- `src/SiteChrome.tsx` et `src/chrome.css` : header, menu adaptatif, recherche et footer.
- `src/Home.tsx` et `src/edition.css` : accueil éditorial d’inspiration guinéenne.
- `src/store.tsx` : catalogue, panier et favoris.
- `src/admin.tsx` : gestion des articles et commandes.
- `src/lib.ts` : client Supabase, montants, stockage et WhatsApp.
- `src/style.css` : design et adaptations responsive.
- `supabase/` : schéma et fonctions serveur à valider sur le projet AOD.

Références techniques consultées : https://supabase.com/docs/reference/javascript/initializing et https://supabase.com/docs/guides/database/postgres/row-level-security.

## Vidéos promotionnelles (Remotion)

Le dossier `remotion/` contient une vidéo promotionnelle animée aux couleurs AOD (bleu nuit, or, crème), générée à partir des produits mis en avant dans `src/data.ts` :

- `AodPromoVertical` (1080×1920) : statut WhatsApp, Reels, TikTok ;
- `AodPromoLandscape` (1920×1080) : écran en boutique, YouTube, site.

```sh
npm run video:studio     # éditeur visuel (aperçu, choix des produits via les props)
npm run video:render     # rend les deux formats dans out/
npm run video:typecheck
```

Les polices sont embarquées (@fontsource), le rendu fonctionne donc hors ligne. Les visuels restent illustratifs, comme sur le site.
