import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpRight, ChevronDown, Heart, MapPin, Menu, MessageCircle, Phone, Search, ShoppingBag, User, X } from 'lucide-react';
import { useStore } from './store';
import { categories, money } from './data';
import { demo, whatsappUrl } from './lib';

export function Brand() {
  return <Link className="aod-brand" to="/" aria-label="AOD accueil"><span className="aod-logotype">A<span>O</span>D<sup>✳</sup></span><span className="aod-brand-label">VENTES & SERVICES</span></Link>;
}

export function Header() {
  const { cart, products, favorites } = useStore();
  const location = useLocation();
  const [panel, setPanel] = useState<'menu' | 'search' | null>(null);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const results = products.filter(p => p.published && `${p.name} ${p.category}`.toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr'))).slice(0, 5);

  useEffect(() => { setPanel(null); window.scrollTo(0, 0); }, [location.pathname, location.search]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (!panel || !dialog.current) return;
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    if (panel === 'search') element.querySelector<HTMLInputElement>('input')?.focus();
    return () => {
      element.close();
      document.body.style.overflow = oldOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [panel]);
  function openSearch() { setQuery(''); setPanel('search'); }
  function keepPanelFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]')).filter(element => element.getClientRects().length > 0);
    const first = controls[0], last = controls[controls.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  return <>
    <div className="utility-bar"><span><MapPin size={12}/> MADINA, CONAKRY</span><span className="utility-motto">D’ici. Avec caractère.</span><a href="tel:+224611252588"><Phone size={12}/><span>Parlons style</span><strong>+224 611 25 25 88</strong><ArrowUpRight size={12}/></a></div>
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-header-inner">
        <button className="shell-icon mobile-trigger" onClick={() => setPanel('menu')} aria-label="Ouvrir le menu" aria-expanded={panel === 'menu'} aria-controls="navigation-panel"><Menu size={22}/></button>
        <Brand/>
        <nav className="desktop-navigation" aria-label="Navigation principale">
          <div className="collection-entry"><NavLink to="/catalogue">La collection</NavLink><button aria-label="Explorer les collections" aria-expanded={panel === 'menu'} aria-controls="navigation-panel" onClick={() => setPanel('menu')}><ChevronDown size={13}/></button></div>
          {['Femme', 'Homme', 'Sacs'].map(category => <Link key={category} className={location.pathname === '/catalogue' && new URLSearchParams(location.search).get('categorie') === category ? 'is-current' : undefined} to={`/catalogue?categorie=${category}`}>{category}</Link>)}
          <NavLink to="/boutique">La maison AOD</NavLink>
        </nav>
        <div className="site-header-actions">
          <button className="shell-icon search-trigger" aria-label="Rechercher" onClick={openSearch}><Search size={19}/><span>Rechercher</span></button>
          <Link className="shell-icon desktop-action" to="/favoris" aria-label="Mes favoris"><Heart size={19}/>{favorites.length > 0 && <span className="favorite-dot"/>}</Link>
          <Link className="shell-icon desktop-action" to="/compte" aria-label="Mon compte"><User size={19}/></Link>
          <Link className="header-cart" to="/panier" aria-label={`Panier, ${count} articles`}><ShoppingBag size={18}/><span>Panier</span><b key={count} className={count ? 'cart-count-active' : undefined}>{count}</b></Link>
        </div>
      </div>
      <div className="header-weave" aria-hidden="true"/>
    </header>
    {demo && <div className="shop-demo"><span/> Boutique de démonstration <i>·</i> Visuels et prix illustratifs</div>}

    {panel && <dialog id="navigation-panel" ref={dialog} className={`shell-dialog ${panel === 'search' ? 'search-dialog' : 'menu-dialog'}`} aria-labelledby="panel-heading" onKeyDown={keepPanelFocus} onCancel={() => setPanel(null)} onClose={() => setPanel(null)} onClick={event => { if (event.target === event.currentTarget) setPanel(null); }}>
      <div className="shell-panel-content">
        <div className="panel-top"><span className="panel-edition">AOD / L’ESPRIT CONAKRY</span><button className="shell-icon" aria-label={panel === 'search' ? 'Fermer la recherche' : 'Fermer le menu'} onClick={() => setPanel(null)}><X size={23}/></button></div>
        {panel === 'search' ? <>
          <h2 id="panel-heading">Votre prochaine <em>trouvaille.</em></h2>
          <label className="shell-search"><Search size={23}/><input placeholder="Un sac, une robe, une envie…" aria-label="Rechercher dans la boutique" value={query} onChange={event => setQuery(event.target.value)}/>{query && <button className="shell-icon" onClick={() => setQuery('')} aria-label="Effacer la recherche"><X size={17}/></button>}</label>
          <div className="search-caption"><span>{query ? 'RÉSULTATS DE RECHERCHE' : 'QUELQUES IDÉES POUR VOUS'}</span><span aria-live="polite">{results.length} article{results.length !== 1 ? 's' : ''}</span></div>
          <div className="quick-results">{results.length ? results.map(p => <Link key={p.id} to={`/produit/${p.id}`}><img src={p.image} alt="" width="55" height="70"/><span><small>{p.category}</small><strong>{p.name}</strong><span>{money(p.price)}</span></span><ArrowUpRight size={19}/></Link>) : <p className="search-empty">Aucun article trouvé. Essayez « sac », « robe » ou une autre catégorie.</p>}</div>
          <Link className="panel-all" to="/catalogue">Explorer toute la collection <ArrowUpRight size={19}/></Link>
        </> : <>
          <div className="menu-panel-grid"><div><h2 id="panel-heading">À chacun<br/><em>son allure.</em></h2><nav className="panel-category-links" aria-label="Collections">{categories.map((category, index) => <Link key={category} to={`/catalogue?categorie=${category}`}><span>0{index + 1}</span><strong>{category}</strong><ArrowUpRight size={21}/></Link>)}</nav><Link className="panel-all" to="/catalogue">Toute la collection <ArrowUpRight size={19}/></Link></div><Link className="panel-feature" to="/boutique"><img src="/images/aod-femme.webp" alt="L’univers mode AOD, inspiration guinéenne" width="1122" height="1402"/><div><small>ANCRÉE ICI. OUVERTE AU MONDE.</small><span>La maison AOD <ArrowUpRight size={20}/></span></div></Link></div>
          <div className="panel-bottom"><Link to="/compte"><User size={17}/> Mon compte</Link><Link to="/favoris"><Heart size={17}/> Mes favoris {favorites.length > 0 ? `(${favorites.length})` : ''}</Link><Link to="/boutique"><MapPin size={17}/> Notre boutique</Link></div>
          <a className="panel-help" href={whatsappUrl('Bonjour AOD, je souhaite un conseil.')} target="_blank" rel="noreferrer"><MessageCircle size={16}/> Besoin d’un conseil ? Échangeons. <ArrowUpRight size={15}/></a>
        </>}
      </div>
    </dialog>}
  </>;
}

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-conversation"><div><span className="footer-eyebrow">LE STYLE COMMENCE PAR UNE CONVERSATION.</span><h2>Une envie ?<br/><em>Parlons-en.</em></h2></div><div className="footer-conversation-actions"><p>Un conseil, une taille, un coup de cœur.<br/>Notre équipe est à votre écoute.</p><a className="footer-whatsapp" href={whatsappUrl('Bonjour AOD, j’aimerais un conseil sur votre collection.')} target="_blank" rel="noreferrer"><MessageCircle size={20}/><span>Échanger sur WhatsApp</span><ArrowUpRight size={20}/></a><a className="footer-call" href="tel:+224611252588"><Phone size={14}/> Ou appelez-nous : +224 611 25 25 88</a></div></div>
    <div className="footer-directory">
      <div className="footer-address"><span className="footer-eyebrow">ICI, C’EST CHEZ VOUS.</span><h3>Madina.<br/> Conakry.<br/><em>Et vous.</em></h3><p>Votre sélection de mode et d’essentiels,<br/>au cœur de la Guinée.</p><Link to="/boutique">Préparer ma visite <ArrowUpRight size={16}/></Link></div>
      <nav className="footer-link-column" aria-label="Collections du pied de page"><h3>Les univers <ArrowDown size={12}/></h3>{categories.map(category => <Link key={category} to={`/catalogue?categorie=${category}`}>{category}<ArrowUpRight size={13}/></Link>)}<Link to="/catalogue">Tout découvrir <ArrowUpRight size={13}/></Link></nav>
      <nav className="footer-link-column" aria-label="Informations pratiques"><h3>À vos côtés <ArrowDown size={12}/></h3><Link to="/boutique">La maison AOD <ArrowUpRight size={13}/></Link><Link to="/infos/livraison">Livraison & retrait <ArrowUpRight size={13}/></Link><Link to="/infos/echanges">Échanges & retours <ArrowUpRight size={13}/></Link><Link to="/compte">Mon compte <ArrowUpRight size={13}/></Link><Link to="/favoris">Mes favoris <ArrowUpRight size={13}/></Link></nav>
      <div className="footer-visit-card"><div className="visit-card-top"><MapPin size={21}/><span>RENDEZ-VOUS<br/>À MADINA</span></div><p>Venez découvrir<br/><em>votre prochaine pièce.</em></p><Link to="/boutique">Nous retrouver <span><ArrowUpRight size={21}/></span></Link><small>Contactez-nous pour le repère et les horaires.</small></div>
    </div>
    <div className="footer-signature"><div className="footer-signature-meta"><span>BIENS & SOLUTIONS POUR VOUS</span><span>FRANÇAIS · GNF</span></div><Link to="/" className="footer-giant-brand" aria-label="AOD, retour à l’accueil"><span>AOD</span><svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M50 3v94M3 50h94M17 17l66 66M17 83l66-66M32 7l36 86M7 32l86 36M7 68l86-36M32 93l36-86" stroke="currentColor" strokeWidth="3"/><circle cx="50" cy="50" r="11" fill="currentColor"/></svg><span className="footer-brand-caption">L’ALLURE A<br/>SES RACINES.</span></Link></div>
    <div className="footer-legal"><span>© {new Date().getFullYear()} AOD Ventes & Services</span><nav aria-label="Informations légales"><Link to="/infos/conditions">Conditions générales</Link><Link to="/infos/confidentialite">Confidentialité</Link><Link to="/admin">Espace équipe</Link></nav><button onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>Retour en haut <ArrowUp size={15}/></button></div>
  </footer>;
}
