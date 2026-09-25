import { continueRender, delayRender } from 'remotion';
// Polices embarquées dans le bundle : le rendu fonctionne hors ligne.
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';

// Palette de la boutique (voir src/style.css) : bleu nuit, or et crème.
export const colors = {
  navy: '#102a43',
  navyDeep: '#0a1c2e',
  gold: '#c9a45c',
  goldDark: '#b58b3b',
  cream: '#faf9f6',
  sand: '#eeeae0',
  ink: '#182d3c',
  muted: '#6a706f',
};

export const serif = "'Playfair Display', Georgia, serif";
export const sans = "Inter, Arial, sans-serif";

export const phone = '+224 611 25 25 88';

const fontsHandle = delayRender('Chargement des polices');
Promise.all([
  document.fonts.load(`400 40px 'Playfair Display'`),
  document.fonts.load(`italic 400 40px 'Playfair Display'`),
  document.fonts.load('400 40px Inter'),
  document.fonts.load('600 40px Inter'),
]).then(() => continueRender(fontsHandle));
