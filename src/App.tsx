import { useSiteMotion } from './useSiteMotion';
import { Routes, Route, Link } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import { Header, Footer } from './SiteChrome';
import { Catalogue, ProductPage, CartPage, Checkout, Boutique, Info, Account } from './pages';
import Home from './Home';
import { lazy, Suspense } from 'react';
const AdminPage = lazy(() => import('./admin'));
function Admin(){return <Suspense fallback={<div className="empty">Chargement de l’administration…</div>}><AdminPage/></Suspense>;}
function Content(){useSiteMotion();const {notice}=useStore();return <><a className="skip" href="#main">Aller au contenu</a><Header/><main id="main"><Routes><Route path="/" element={<Home/>}/><Route path="/catalogue" element={<Catalogue/>}/><Route path="/favoris" element={<Catalogue favoritesOnly/>}/><Route path="/produit/:id" element={<ProductPage/>}/><Route path="/panier" element={<CartPage/>}/><Route path="/commande" element={<Checkout/>}/><Route path="/boutique" element={<Boutique/>}/><Route path="/infos/:slug" element={<Info/>}/><Route path="/compte" element={<Account/>}/><Route path="/admin" element={<Admin/>}/><Route path="*" element={<div className="empty"><h1>Cette page est introuvable</h1><Link className="button" to="/">Revenir à l’accueil</Link></div>}/></Routes></main><Footer/>{notice&&<div className="toast" role="status">{notice}</div>}</>;}
export default function App(){return <StoreProvider><Content/></StoreProvider>;}
