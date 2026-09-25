import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { z } from 'zod';
import { products, money } from '../src/data';
import { colors, phone, sans, serif } from './theme';

export const promoSchema = z.object({ productIds: z.array(z.string()) });

const INTRO = 90;
const PRODUCT = 75;
const OUTRO = 105;
const TRANSITION = 15;

export const promoDuration = (count: number) => INTRO + count * PRODUCT + OUTRO - (count + 1) * TRANSITION;

// Les chemins du catalogue commencent par « / » ; Remotion sert le dossier public/ via staticFile().
const asset = (src: string) => (src.startsWith('http') ? src : staticFile(src.replace(/^\//, '')));

const useLayout = () => {
  const { width, height } = useVideoConfig();
  return { vertical: height > width, unit: Math.min(width, height) / 1080 };
};

const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 40}px)`, ...style }}>{children}</div>;
};

const GoldRule: React.FC<{ delay?: number; width: number }> = ({ delay = 0, width }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 20], [0, width], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ height: 2, width: w, background: colors.gold }} />;
};

const Intro = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { unit } = useLayout();
  const zoom = interpolate(frame, [0, durationInFrames], [1.12, 1]);
  return (
    <AbsoluteFill style={{ background: colors.navyDeep }}>
      <Img src={staticFile('images/aod-conakry-hero.webp')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, opacity: 0.55 }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${colors.navy}00 20%, ${colors.navyDeep}ee 85%)` }} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 28 * unit, padding: 80 * unit }}>
        <Rise><span style={{ fontFamily: sans, fontWeight: 600, letterSpacing: 8 * unit, fontSize: 24 * unit, color: colors.gold }}>MADINA · CONAKRY</span></Rise>
        <Rise delay={8}><h1 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 220 * unit, lineHeight: 1, color: colors.cream, letterSpacing: -4 * unit }}>AOD</h1></Rise>
        <GoldRule delay={18} width={180 * unit} />
        <Rise delay={24}><p style={{ margin: 0, fontFamily: serif, fontStyle: 'italic', fontSize: 56 * unit, color: colors.sand }}>D’ici. Avec caractère.</p></Rise>
        <Rise delay={34}><span style={{ fontFamily: sans, fontSize: 22 * unit, letterSpacing: 4 * unit, color: colors.sand, opacity: 0.8 }}>VENTES & SERVICES</span></Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ProductCard: React.FC<{ id: string; index: number; total: number }> = ({ id, index, total }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { vertical, unit } = useLayout();
  const product = products.find((p) => p.id === id);
  if (!product) return null;
  const drift = interpolate(frame, [0, durationInFrames], [1.06, 1]);
  const image = (
    <div style={{ flex: vertical ? '0 0 62%' : '0 0 55%', overflow: 'hidden', position: 'relative' }}>
      <Img src={asset(product.image)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${drift})` }} />
    </div>
  );
  return (
    <AbsoluteFill style={{ background: colors.cream, flexDirection: vertical ? 'column' : 'row' }}>
      {image}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 * unit, padding: `${60 * unit}px ${80 * unit}px` }}>
        <Rise delay={4}><span style={{ fontFamily: sans, fontWeight: 600, fontSize: 22 * unit, letterSpacing: 6 * unit, color: colors.goldDark }}>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} — {product.category.toUpperCase()}</span></Rise>
        <Rise delay={10}><h2 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 84 * unit, lineHeight: 1.05, color: colors.navy, letterSpacing: -2 * unit }}>{product.name}</h2></Rise>
        <GoldRule delay={16} width={120 * unit} />
        <Rise delay={20}><span style={{ fontFamily: sans, fontSize: 40 * unit, color: colors.ink }}>{money(product.price)}</span></Rise>
        <Rise delay={26}><span style={{ fontFamily: sans, fontSize: 24 * unit, color: colors.muted }}>{product.colors.join(' · ')}</span></Rise>
      </div>
    </AbsoluteFill>
  );
};

const Outro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { unit } = useLayout();
  const pulse = 1 + 0.03 * Math.sin((frame / fps) * Math.PI * 2);
  return (
    <AbsoluteFill style={{ background: colors.navy, justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 36 * unit, padding: 80 * unit }}>
      <Rise><span style={{ fontFamily: sans, fontWeight: 600, letterSpacing: 8 * unit, fontSize: 22 * unit, color: colors.gold }}>LE STYLE COMMENCE PAR UNE CONVERSATION</span></Rise>
      <Rise delay={8}><h2 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 110 * unit, lineHeight: 1.05, color: colors.cream }}>Une envie ?<br /><em style={{ color: colors.gold }}>Parlons-en.</em></h2></Rise>
      <Rise delay={20}>
        <div style={{ transform: `scale(${pulse})`, background: colors.gold, color: colors.navyDeep, fontFamily: sans, fontWeight: 600, fontSize: 38 * unit, padding: `${24 * unit}px ${48 * unit}px`, borderRadius: 999 }}>WhatsApp · {phone}</div>
      </Rise>
      <Rise delay={30}><span style={{ fontFamily: sans, fontSize: 24 * unit, color: colors.sand, letterSpacing: 3 * unit }}>Boutique à Madina, Conakry</span></Rise>
      <Rise delay={40}><span style={{ fontFamily: sans, fontSize: 16 * unit, color: colors.sand, opacity: 0.55 }}>Visuels d’inspiration — ne représentent pas le stock réel.</span></Rise>
    </AbsoluteFill>
  );
};

// Bande-son originale générée par scripts/generate-soundtrack.cjs (120 BPM, une mesure = 60 images).
const Soundtrack: React.FC<{ count: number }> = ({ count }) => {
  const { fps, durationInFrames } = useVideoConfig();
  // Début de chaque transition : après l'intro, puis toutes les PRODUCT - TRANSITION images.
  const cuts = Array.from({ length: count + 1 }, (_, i) => INTRO - TRANSITION + i * (PRODUCT - TRANSITION));
  const outroStart = cuts[cuts.length - 1];
  return (
    <>
      <Audio src={staticFile('audio/aod-theme.mp3')} volume={(f) => 0.8 * interpolate(f, [0, 10, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
      {cuts.map((cut) => (
        <Sequence key={cut} from={cut - 4} durationInFrames={Math.round(0.6 * fps)}><Audio src={staticFile('audio/whoosh.mp3')} volume={0.35} /></Sequence>
      ))}
      {/* Carillon à l'apparition du bouton WhatsApp. */}
      <Sequence from={outroStart + 20}><Audio src={staticFile('audio/chime.mp3')} volume={0.5} /></Sequence>
    </>
  );
};

export const AodPromo: React.FC<z.infer<typeof promoSchema>> = ({ productIds }) => {
  const timing = linearTiming({ durationInFrames: TRANSITION });
  return (
    <AbsoluteFill style={{ background: colors.navyDeep }}>
      <Soundtrack count={productIds.length} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO}><Intro /></TransitionSeries.Sequence>
        {productIds.flatMap((id, i) => [
          <TransitionSeries.Transition key={`t-${id}`} presentation={i % 2 ? slide({ direction: 'from-right' }) : fade()} timing={timing} />,
          <TransitionSeries.Sequence key={id} durationInFrames={PRODUCT}><ProductCard id={id} index={i} total={productIds.length} /></TransitionSeries.Sequence>,
        ])}
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={OUTRO}><Outro /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
