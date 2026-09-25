import { Composition } from 'remotion';
import { AodPromo, promoDuration, promoSchema } from './AodPromo';
import { products } from '../src/data';
import { AodMontage, MONTAGE } from './AodMontage';
import { AodPub30, AodPubPartie1, AodPubPartie2, PART } from './AodPub';

const formats = [
  { suffix: 'Vertical', width: 1080, height: 1920 },
  { suffix: 'Landscape', width: 1920, height: 1080 },
];
const pubs = [
  { id: 'AodMontage60', component: AodMontage, frames: MONTAGE },
  { id: 'AodPub30', component: AodPub30, frames: 2 * PART },
  { id: 'AodPubPartie1', component: AodPubPartie1, frames: PART },
  { id: 'AodPubPartie2', component: AodPubPartie2, frames: PART },
];

const defaultProps = { productIds: products.filter((p) => p.featured).map((p) => p.id).slice(0, 4) };

export const RemotionRoot = () => (
  <>
    {/* Format vertical : statut WhatsApp, Reels, TikTok */}
    <Composition id="AodPromoVertical" component={AodPromo} schema={promoSchema} defaultProps={defaultProps}
      durationInFrames={promoDuration(defaultProps.productIds.length)} fps={30} width={1080} height={1920} />
    {/* Format paysage : écran en boutique, YouTube, site */}
    <Composition id="AodPromoLandscape" component={AodPromo} schema={promoSchema} defaultProps={defaultProps}
      durationInFrames={promoDuration(defaultProps.productIds.length)} fps={30} width={1920} height={1080} />
    {/* Publicité 30 s (deux séquences de 15 s) */}
    {pubs.flatMap((p) => formats.map((f) => (
      <Composition key={p.id + f.suffix} id={p.id + f.suffix} component={p.component} durationInFrames={p.frames} fps={30} width={f.width} height={f.height} />
    )))}
  </>
);
