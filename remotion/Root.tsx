import { Composition } from 'remotion';
import { AodPromo, promoDuration, promoSchema } from './AodPromo';
import { products } from '../src/data';

const defaultProps = { productIds: products.filter((p) => p.featured).map((p) => p.id).slice(0, 4) };

export const RemotionRoot = () => (
  <>
    {/* Format vertical : statut WhatsApp, Reels, TikTok */}
    <Composition id="AodPromoVertical" component={AodPromo} schema={promoSchema} defaultProps={defaultProps}
      durationInFrames={promoDuration(defaultProps.productIds.length)} fps={30} width={1080} height={1920} />
    {/* Format paysage : écran en boutique, YouTube, site */}
    <Composition id="AodPromoLandscape" component={AodPromo} schema={promoSchema} defaultProps={defaultProps}
      durationInFrames={promoDuration(defaultProps.productIds.length)} fps={30} width={1920} height={1080} />
  </>
);
