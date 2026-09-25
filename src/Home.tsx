import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, MapPin, MessageCircle, Pause, Play } from 'lucide-react';
import { ProductGrid } from './components';
import { useStore } from './store';
import { whatsappUrl } from './lib';

function Rosette({ className = '' }: { className?: string }) {
  return <svg className={`rosette ${className}`} viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M50 4v92M4 50h92M17.5 17.5l65 65M17.5 82.5l65-65M32.4 7.5l35.2 85M7.5 32.4l85 35.2M7.5 67.6l85-35.2M32.4 92.5l35.2-85" stroke="currentColor" strokeWidth="3"/><circle cx="50" cy="50" r="12" fill="currentColor"/></svg>;
}

export default function Home() {
  const { products } = useStore();
  const [paused, setPaused] = useState(false);
  return <div className="edition">
    <section className="edition-hero">
      <div className="edition-topline"><span>CONAKRY, GUINÉE</span><span>MODE · CULTURE · ALLURE</span><span>ÉDITION 01 / 2026</span></div>
      <div className="edition-hero-grid">
        <div className="edition-intro">
          <span className="edition-kicker"><i/> UNE NOUVELLE EXPRESSION DU STYLE</span>
          <h1>L’allure<br/>a ses <em>racines.</em></h1>
          <div className="edition-intro-bottom"><span className="vertical-note">DE MADINA, AVEC DU STYLE.</span><div><p>Des couleurs qui racontent.<br/>Des pièces qui vous ressemblent.<br/>L’esprit de Conakry, à porter chaque jour.</p><Link className="edition-cta" to="/catalogue">Explorer la collection <span><ArrowUpRight size={21}/></span></Link><a className="edition-scroll" href="#univers"><ArrowDown size={14}/> Entrez dans l’univers AOD</a></div></div>
        </div>
        <div className="edition-visual">
          <div className="weave-lines" aria-hidden="true"/>
          <div className="edition-main-photo"><img src="/images/aod-conakry-hero.webp" alt="Mode contemporaine d’inspiration guinéenne, ensemble ivoire et indigo" fetchPriority="high" width="1122" height="1402"/><span className="photo-index">01 — L’INDIGO EN HÉRITAGE</span></div>
          <div className="edition-inset"><img src="/images/aod-homme.webp" alt="Silhouette masculine crème et bleu nuit" width="1122" height="1402"/><span>Une allure bien à vous. <ArrowUpRight size={13}/></span></div>
          <div className="edition-seal"><Rosette/><span>ANCRÉE ICI.<br/>OUVERTE AU MONDE.</span></div>
          <span className="visual-side-note">AOD VENTES & SERVICES — BIENS & SOLUTIONS POUR VOUS</span>
        </div>
      </div>
      <div className="edition-hero-foot"><span><MapPin size={13}/> Madina, Conakry</span><p>Une sélection. Mille façons d’être vous.</p><span>FEMME / HOMME / ACCESSOIRES</span></div>
    </section>

    <div className={`culture-ribbon ${paused?'is-paused':''}`}><div className="ribbon-window"><div className="ribbon-track">{[0,1].map(n=><div key={n} aria-hidden={n===1?true:undefined}><span>RACINES AFRICAINES</span><Rosette/><span>ALLURE CONTEMPORAINE</span><Rosette/><span>ESPRIT CONAKRY</span><Rosette/></div>)}</div></div><button onClick={()=>setPaused(p=>!p)} aria-label={paused?'Reprendre le défilement':'Mettre le défilement en pause'}>{paused?<Play size={16}/>:<Pause size={16}/>}</button></div>

    <section className="edition-worlds" id="univers">
      <div className="edition-section-top section-heading"><span className="edition-label">01 / LES UNIVERS</span><div><h2>Le style se vit.<br/><em>À votre façon.</em></h2></div><p>Au quotidien ou pour les grands jours,<br/>trouvez la pièce qui fait la différence.</p></div>
      <div className="worlds-grid">
        <Link className="world-card world-woman" to="/catalogue?categorie=Femme"><div className="world-image"><img src="/images/aod-femme.webp" alt="La collection Femme, robe ocre et indigo" loading="lazy" width="1122" height="1402"/><span className="world-number">01</span><span className="world-arrow"><ArrowUpRight/></span></div><div className="world-caption"><h3>Féminin. <em>Singulier.</em></h3><span>EXPLORER LA FEMME</span></div></Link>
        <Link className="world-card world-man" to="/catalogue?categorie=Homme"><div className="world-image"><img src="/images/aod-homme.webp" alt="La collection Homme, silhouette contemporaine" loading="lazy" width="1122" height="1402"/><span className="world-number">02</span><span className="world-arrow"><ArrowUpRight/></span></div><div className="world-caption"><h3>L’allure <em>au naturel.</em></h3><span>EXPLORER L’HOMME</span></div></Link>
        <Link className="world-card world-bags" to="/catalogue?categorie=Sacs"><div className="world-image"><img src="/images/aod-sacs.webp" alt="Sacs camel et détails indigo" loading="lazy" width="1122" height="1402"/><span className="world-number">03</span><span className="world-arrow"><ArrowUpRight/></span></div><div className="world-caption"><h3>Le détail <em>qui signe.</em></h3><span>SACS & ACCESSOIRES</span></div></Link>
      </div>
    </section>

    <section className="edition-selection section">
      <div className="section-heading"><div><span className="edition-label">02 / LA SÉLECTION DU MOMENT</span><h2>De belles pièces.<br/><em>De vrais coups de cœur.</em></h2></div><Link className="edition-link" to="/catalogue">Tout découvrir <ArrowUpRight size={20}/></Link></div>
      <ProductGrid products={products.filter(p=>p.published&&p.featured).slice(0,4)}/>
      <div className="selection-note"><Rosette/><p>Votre style n’a pas besoin d’en faire trop.<br/><strong>Juste d’être le vôtre.</strong></p><span>LA SIGNATURE AOD</span></div>
    </section>

    <section className="edition-story">
      <div className="story-photo"><img src="/images/aod-boutique.webp" alt="Scène de boutique imaginée, inspirée de la mode guinéenne" loading="lazy" width="1536" height="1024"/><span>IMAGINER LE STYLE. PARTAGER L’ENVIE.</span></div>
      <div className="story-copy"><span className="edition-label">03 / NOTRE POINT DE RENCONTRE</span><Rosette/><h2>De Conakry.<br/><em>Avec caractère.</em></h2><p>AOD, c’est une envie simple : vous aider à trouver les pièces dans lesquelles vous vous sentez vous-même.</p><p>Une taille, une couleur, une occasion ? Parlons-en. Notre histoire se construit aussi avec vous, à Madina.</p><Link className="edition-cta light" to="/boutique">Rencontrer AOD <span><ArrowUpRight size={21}/></span></Link><small>Visuel d’inspiration. Retrouvez la boutique à Madina.</small></div>
    </section>

    <section className="edition-service">
      <div className="service-title"><span className="edition-label">LE STYLE, SIMPLEMENT.</span><h2>Proches de vous.<br/><em>Du premier conseil<br/>au dernier détail.</em></h2><a className="edition-link" href={whatsappUrl('Bonjour AOD, j’aimerais un conseil pour choisir un article.')} target="_blank" rel="noreferrer">Un conseil sur WhatsApp <MessageCircle size={18}/></a></div>
      <div className="service-list">{[{n:'01',title:'On prend le temps d’échanger.',text:'Besoin d’un conseil sur une taille ou un article ? Appelez-nous ou écrivez-nous sur WhatsApp.'},{n:'02',title:'Vous commandez à votre rythme.',text:'Choisissez vos articles, composez votre panier. Aucun compte n’est nécessaire pour votre demande.'},{n:'03',title:'On confirme chaque détail.',text:'Disponibilité, retrait à Madina ou livraison : les modalités sont confirmées ensemble avant le paiement.'}].map(s=><div key={s.n}><span>{s.n}</span><div><h3>{s.title}</h3><p>{s.text}</p></div><ArrowUpRight size={20}/></div>)}</div>
    </section>
    <section className="edition-invitation"><div className="invitation-pattern" aria-hidden="true"/><span className="edition-label">VOTRE PROCHAINE TROUVAILLE VOUS ATTEND.</span><Link to="/catalogue"><h2>À vous de <em>jouer.</em></h2><span><ArrowUpRight/></span></Link><div><span>LA MODE QUI VOUS RESSEMBLE.</span><Rosette/><span>MADINA, CONAKRY — GUINÉE</span></div></section>
  </div>;
}
