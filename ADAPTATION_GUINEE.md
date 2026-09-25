# AOD Ventes & Services — Adaptation au contexte guinéen

Ce document complète le cahier des charges original conservé dans `CAHIER_DES_CHARGES_ORIGINAL.md`. En cas de contradiction, les règles ci-dessous priment. Les pages, fonctionnalités et exigences techniques du document original restent applicables. Il s’agit d’un cahier des charges adapté, pas d’un site déjà développé.

## 1. Positionnement

Concevoir une boutique de mode professionnelle pour AOD Ventes & Services, située à Madina, Conakry, République de Guinée. Conserver le slogan « Biens & solutions pour vous », les couleurs bleu nuit et or et le téléphone fourni : +224 611 25 25 88.

L’expérience doit être élégante, accessible et adaptée à l’activité réelle de la boutique. La priorité est de permettre au client de trouver un article, comprendre son prix et sa disponibilité, puis commander facilement depuis son téléphone.

Ne pas traiter l’Afrique comme un marché uniforme. Les zones desservies, langues d’assistance et moyens de paiement doivent correspondre aux capacités confirmées d’AOD en Guinée.

## 2. Identité visuelle et contenu

- Conserver la palette proposée, des textes lisibles et des boutons tactiles d’au moins 44 px.
- Privilégier les photos des vrais articles, de la boutique et, avec leur accord, de modèles représentatifs de sa clientèle.
- Ne pas ajouter automatiquement de motifs traditionnels, de produits ou de références culturelles absents de l’offre réelle.
- Utiliser une seule bannière principale optimisée, sans vidéo automatique ni carrousel lourd.
- Présenter les catégories réellement disponibles : Femme, Homme, Sacs, Chaussures et Accessoires.
- Prévoir des collections par usage : quotidien, travail, sorties et cérémonies, uniquement selon les produits disponibles.
- Les campagnes liées aux fêtes sont facultatives et administrables ; aucune fausse réduction ni urgence artificielle.

Proposition de texte d’accueil :

> Votre style, à portée de main.
>
> Découvrez les vêtements, sacs, chaussures et accessoires AOD à Madina, Conakry. Consultez nos articles et contactez-nous pour préparer votre commande.

Actions principales : « Voir les articles » et « Nous contacter sur WhatsApp ».

## 3. Mobile et connexion limitée

- Concevoir d’abord pour de petits téléphones Android et vérifier aussi iPhone, tablette et ordinateur.
- Afficher des images WebP ou AVIF avec tailles adaptées, chargement différé hors écran et pagination du catalogue.
- Réduire les polices, scripts et animations ; ne pas bloquer l’accès aux produits par une animation.
- Viser un chargement initial inférieur à 1 Mo sur l’accueil, à vérifier avec les vraies images.
- Tester sur réseau ralenti et appareil peu puissant, en plus des largeurs prévues dans le document original.
- Conserver le panier après fermeture ou actualisation. Ne pas conserver durablement les coordonnées sensibles sur un téléphone partagé.
- Si le réseau coupe, conserver la saisie pendant la tentative, afficher une erreur compréhensible et proposer de réessayer sans créer de commande en double.
- Une PWA reste une évolution facultative. Un panier consultable hors ligne ne signifie pas qu’une commande a été transmise ; prix et stock doivent être revérifiés à la reconnexion.

## 4. Langues et assistance

Le français est la langue initiale du site. Employer des formulations courtes : « Ajouter au panier », « Choisir mon quartier », « Frais à confirmer », « Appeler la boutique ».

Préparer la traduction de l’interface. Ajouter éventuellement le pular, le maninka ou le soussou avec des traductions relues par des locuteurs compétents. Ne pas afficher une langue d’assistance que l’équipe ne parle pas.

Prévoir les boutons Appeler et WhatsApp. Le numéro fourni sert de contact ; vérifier qu’il est bien actif sur WhatsApp avant publication. Les échanges vocaux peuvent se faire directement dans WhatsApp si la boutique assure ce service.

## 5. Prix et fiches produits

- Afficher tous les prix en francs guinéens : « 250 000 GNF », sans décimales inutiles et sans confusion avec le franc CFA.
- Stocker les montants en GNF entiers et recalculer les totaux côté serveur.
- Distinguer prix des articles, livraison, éventuelle remise et total à payer.
- Afficher tailles, mesures en centimètres, matière, couleurs et stock par variante.
- Pour les chaussures, préciser le système de pointure. Pour les vêtements, ne pas supposer qu’un M correspond à la même mesure chez tous les fournisseurs.
- Proposer « Demander conseil sur la taille » via WhatsApp.
- Ne pas inventer l’origine, la marque ou la qualité d’un article.
- Les données de démonstration doivent être identifiables et ne pas être publiées comme un stock réel.

## 6. Commande simple, sans compte obligatoire

Parcours recommandé : articles → coordonnées et livraison → récapitulatif → envoi de la commande.

Champs obligatoires :

- Nom du destinataire.
- Numéro de téléphone, avec indicatif +224 proposé par défaut et format international accepté.
- Mode de réception : retrait en boutique ou livraison dans une zone activée.
- Pour la livraison : ville/localité, quartier et point de repère utile.

Champs facultatifs : second numéro, commune si nécessaire pour la zone, position GPS partagée volontairement et instructions. Ne pas imposer d’e-mail, de code postal, de numéro de rue ou de géolocalisation.

Pour un retrait, ne pas demander une adresse de livraison. Pour une commande offerte à un proche, permettre de distinguer acheteur et destinataire.

Après enregistrement, afficher une référence et « Commande reçue, en attente de confirmation ». La réception de la demande ne vaut ni confirmation du stock ni paiement.

Le compte client reste facultatif. L’authentification par SMS ne doit être proposée qu’après configuration et test du fournisseur, de son coût et de sa délivrabilité. Aucun mot de passe ne doit être demandé pour commander en invité.

## 7. Livraison réellement maîtrisée

- Démarrer avec le retrait à Madina et les zones de Conakry effectivement prises en charge par AOD.
- Administrer les zones et quartiers sans figer une liste de communes dans le code.
- Associer chaque zone à un tarif, un délai indicatif, des instructions et des moyens de paiement autorisés.
- Afficher les frais connus avant l’envoi de la commande.
- Si le tarif est inconnu, afficher « Livraison sur devis — total à confirmer », jamais « 0 GNF » ou « Livraison gratuite » par défaut.
- Dans ce cas, confirmer les frais et obtenir l’accord du client avant de demander le paiement ou d’expédier.
- Prévoir l’appel du livreur et un point de rendez-vous convenu si nécessaire.
- Les livraisons hors de Conakry sont activées seulement après validation des transporteurs, localités desservies, frais et conditions de remise.
- Ne pas annoncer de livraison nationale, de délai garanti ou de livraison gratuite sans engagement réel.
- Le retrait devient disponible après confirmation de préparation, avec horaires et repère précis fournis par AOD.

## 8. Paiements et confirmation

Prévoir Orange Money Guinée, le paiement en boutique et le paiement à la livraison selon les conditions approuvées par AOD. Tous les moyens restent désactivés tant que leurs modalités ne sont pas configurées.

Orange Guinée dispose d’un portail marchand PayPro : https://paypro.orange-guinee.com/. Cela ne confirme ni l’ouverture d’un compte AOD ni l’accès à une API e-commerce. L’intégration dépendra du contrat et de la documentation réellement fournis.

Remplacer l’exigence ferme « MTN Mobile Money Guinée » du document initial par « Autre service de paiement local, à vérifier et à activer selon sa disponibilité commerciale et le compte marchand AOD ». Ne pas afficher un logo de paiement non opérationnel.

Sans API :

1. Enregistrer la commande en attente.
2. Vérifier stock, livraison et total ; faire accepter les changements au client.
3. Communiquer les instructions du compte marchand validé. Ne pas présumer que le numéro de contact est le compte d’encaissement.
4. Recueillir la référence de transaction si nécessaire.
5. Un administrateur vérifie l’encaissement dans le canal marchand avant de marquer la commande payée. Une capture d’écran seule n’est pas une preuve suffisante.

Ne jamais demander le code secret ou le code de validation du portefeuille mobile. Ne jamais simuler une réussite. Avec une API, confirmer le paiement côté serveur et gérer les notifications répétées sans double encaissement ni double commande.

Séparer les statuts de commande des statuts de paiement : non payé, en vérification, payé, échoué, partiellement remboursé ou remboursé. Pour le paiement à la livraison, enregistrer l’encaissement réel, indépendamment du statut « Livrée ».

## 9. WhatsApp comme parcours assisté

Prévoir un bouton discret qui ne masque pas le panier. Générer un message comprenant produit, variante, quantité, prix et lien produit, ainsi que les frais connus ou la mention « frais à confirmer ».

Exemple :

> Bonjour AOD, je souhaite commander :
> Sac à main — noir — quantité 1 — 250 000 GNF.
> Sous-total articles : 250 000 GNF.
> Livraison : frais à confirmer.
> Merci de confirmer la disponibilité et le total.

Utiliser https://wa.me/224611252588 après vérification du compte. L’ouverture de WhatsApp ne prouve pas que le message a été envoyé. Ne pas afficher « Commande confirmée » sur cette seule action.

Si une commande existe déjà, transmettre sa référence pour éviter une seconde saisie. Sinon, permettre à l’administrateur d’enregistrer la demande comme commande issue de WhatsApp. Limiter les données personnelles placées dans les liens préremplis.

## 10. Confiance et service après-vente

- Montrer les véritables coordonnées, photos de boutique, horaires et repères une fois fournis.
- Afficher une carte seulement avec une position vérifiée.
- Publier des règles d’échange, de retour et de remboursement approuvées par AOD et vérifiées pour le cadre applicable ; ne pas reprendre automatiquement un délai européen.
- Expliquer simplement les modalités de livraison, les éventuels acomptes et les frais à la charge du client.
- Aucun avis fictif, compteur de ventes inventé ou promesse non validée.
- Informer sur l’usage des coordonnées et limiter leur accès aux personnes qui traitent la commande.

## 11. Administration adaptée à la boutique

Prévoir une administration utilisable sur téléphone avec :

- Création rapide de produits et compression des photos.
- Stock par taille et couleur, entrées de stock et correction motivée.
- Saisie des ventes en boutique, par téléphone et sur WhatsApp pour maintenir un stock commun.
- Réservation atomique du stock à la confirmation ; expiration configurable des réservations impayées et libération unique en cas d’annulation.
- Gestion des ruptures et prévention de la vente simultanée du dernier article.
- Commandes à rappeler, paiements à vérifier, retraits prêts et livraisons en cours.
- Modification d’un devis de livraison avec trace de l’accord client.
- Suivi séparé du montant des commandes confirmées, des encaissements et des remboursements ; ne pas appeler toutes les commandes confirmées des recettes encaissées.
- Historique des modifications de prix, de stock et de statut de paiement.
- Accès limité du livreur aux seules informations nécessaires à ses livraisons.

Conserver la stack du document original. Compléter le modèle de données avec les réservations de stock, événements de commande, traces de vérification des paiements et tarifs de livraison confirmés. Conserver les prix et libellés achetés dans les lignes de commande même si le catalogue change.

Les règles RLS, permissions serveur et protections administrateur sont obligatoires. Le suivi des commandes invitées doit utiliser un accès sécurisé et non une référence publique devinable. Prévoir sauvegardes et restauration testée.

## 12. Ordre de réalisation et critères de livraison

Première version : accueil, catalogue, fiches produits, panier persistant, commande invitée, WhatsApp, retrait/livraison configurables, confirmation manuelle des paiements et administration des produits, stocks et commandes.

Évolutions : paiement automatisé après obtention des accès, compte client, traductions validées, notifications configurées et PWA. Les favoris locaux peuvent être proposés dès la première version.

Vérifier avant ouverture :

- Commande complète possible sur petit écran sans e-mail ni compte.
- Frais inconnus clairement signalés et aucun paiement demandé avant accord sur le total.
- Aucun moyen de paiement indisponible présenté comme utilisable.
- Coupure réseau et double clic sans duplication de commande.
- Stock partagé avec les ventes en boutique et absence de survente simultanée.
- Commandes et paiements traités comme deux états distincts.
- Prix recalculés côté serveur et données clients inaccessibles aux autres clients.
- Liens WhatsApp et téléphone fonctionnels ; références réutilisées pour éviter les doublons.
- Site utilisable sur réseau ralenti et sans débordement aux largeurs prévues.

Informations à obtenir d’AOD avant mise en production : logo, vraies photos et prix, stock initial, repère exact, horaires, zones et tarifs de livraison, compte marchand, modes d’encaissement autorisés et conditions d’échange. Ces éléments ne bloquent pas le prototype, mais aucune valeur de démonstration ne doit passer pour un engagement réel.
