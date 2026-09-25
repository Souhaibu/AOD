import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { MapPin, MessageCircle, ShoppingBag } from 'lucide-react';
import { money, products } from '../src/data';
import { imageSizes } from './imageSizes';
import voiceover from './voiceover.json';
import { useLayout } from './AodPromo';
import { colors, phone, sans, serif } from './theme';

// Montage publicitaire d'une minute. 120 BPM : un temps = 15 images, une mesure = 60 images.
// Chaque coupe tombe sur un temps de scripts/generate-soundtrack.cjs (montage-60s).
export const MONTAGE = 1860; // 62 s : l'écran final laisse le temps de dire le numéro

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (frame: number, from: number, to: number, out: [number, number] = [0, 1]) =>
  interpolate(frame, [from, to], out, { ...clamp, easing: (t) => 1 - (1 - t) ** 3 });

const fileOf = (productId: string) => {
  const p = products.find((x) => x.id === productId)!;
  return { file: p.image.split('/').pop()!, product: p };
};

// ---------------------------------------------------------------- Briques visuelles

type Box = [number, number];

// Photo animée (zoom lent + dérive). Si la couvrir en plein cadre obligeait à l'agrandir au-delà de sa
// définition, elle est présentée « encadrée » sur un fond flou : l'image reste nette sur téléphone.
const Media: React.FC<{ file: string; box?: Box; zoom?: [number, number]; focus?: [number, number]; drift?: [number, number]; fit?: 'auto' | 'cover' }> = ({ file, box, zoom = [1.08, 1], focus = [50, 50], drift = [0, 0], fit = 'auto' }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const [bw, bh] = box ?? [width, height];
  const [iw, ih] = imageSizes[file] ?? [bw, bh];
  const t = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  const z = zoom[0] + (zoom[1] - zoom[0]) * t;
  const dx = drift[0] * (t - 0.5), dy = drift[1] * (t - 0.5);
  const src = staticFile(`images/${file}`);
  const card = fit === 'auto' && Math.max(bw / iw, bh / ih) * Math.max(...zoom) > 0.85;
  const cover: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };
  if (!card) {
    return <Img src={src} style={{ ...cover, objectPosition: `${focus[0]}% ${focus[1]}%`, transformOrigin: `${focus[0]}% ${focus[1]}%`, transform: `scale(${z}) translate(${dx}%, ${dy}%)` }} />;
  }
  const scale = Math.min((bw * 0.86) / iw, (bh * 0.8) / ih);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: colors.navyDeep }}>
      <Img src={src} style={{ ...cover, filter: 'blur(36px) brightness(0.5) saturate(1.1)', transform: 'scale(1.2)' }} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Img src={src} style={{ width: iw * scale, height: ih * scale, objectFit: 'cover', transform: `scale(${1 + (z - 1) * 0.5}) translate(${dx / 2}%, ${dy / 2}%)`, boxShadow: '0 40px 90px rgba(0,0,0,.45)', outline: `2px solid ${colors.gold}55`, outlineOffset: 14 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Entrée « whip » : glissé rapide avec flou de bougé, sur 8 images.
const WhipIn: React.FC<{ from?: 'left' | 'right' | 'up' | 'down' | 'zoom'; delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ from = 'right', delay = 0, children, style }) => {
  const frame = useCurrentFrame() - delay;
  const p = ease(frame, 0, 8);
  const d = (1 - p) * 60;
  const transform = { left: `translateX(${-d}%)`, right: `translateX(${d}%)`, up: `translateY(${-d}%)`, down: `translateY(${d}%)`, zoom: `scale(${1 + (1 - p) * 0.35})` }[from];
  return <AbsoluteFill style={{ transform, filter: `blur(${(1 - p) * 18}px)`, opacity: frame < 0 ? 0 : 1, overflow: 'hidden', ...style }}>{children}</AbsoluteFill>;
};

// Flash crème bref à la coupe.
const Flash: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: colors.cream, opacity: interpolate(frame, [0, 4], [strength, 0], clamp), pointerEvents: 'none' }} />;
};

// Texte qui apparaît lettre par lettre ; les mots restent insécables pour que les titres longs passent à la ligne.
const Kinetic: React.FC<{ text: string; delay?: number; stagger?: number; style?: React.CSSProperties }> = ({ text, delay = 0, stagger = 1.5, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let index = 0;
  return (
    <span style={{ display: 'inline-block', ...style }}>
      {text.split(' ').map((word, w) => (
        <span key={w}>
          {w > 0 && ' '}
          <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {[...word].map((ch) => {
              const i = index++;
              const p = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 18, stiffness: 180, mass: 0.6 } });
              return <span key={i} style={{ display: 'inline-block', opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 0.6}em)` }}>{ch}</span>;
            })}
          </span>
        </span>
      ))}
    </span>
  );
};

const Line: React.FC<{ delay?: number; width: number; color?: string }> = ({ delay = 0, width, color = colors.gold }) => {
  const frame = useCurrentFrame();
  return <div style={{ height: 3, width: ease(frame, delay, delay + 14, [0, width]), background: color }} />;
};

const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = colors.gold }) => {
  const { unit } = useLayout();
  return <span style={{ fontFamily: sans, fontWeight: 600, letterSpacing: 7 * unit, fontSize: 24 * unit, color }}>{children}</span>;
};

// Bandeau produit : panneau crème qui glisse depuis la gauche.
const LowerThird: React.FC<{ productId: string; delay?: number }> = ({ productId, delay = 12 }) => {
  const frame = useCurrentFrame();
  const { vertical, unit } = useLayout();
  const { product } = fileOf(productId);
  const x = ease(frame, delay, delay + 12, [-110, 0]);
  return (
    <div style={{ position: 'absolute', left: 0, bottom: (vertical ? 260 : 90) * unit, transform: `translateX(${x}%)`, background: `${colors.cream}f2`, padding: `${26 * unit}px ${44 * unit}px ${26 * unit}px ${60 * unit}px`, borderLeft: `${10 * unit}px solid ${colors.gold}`, display: 'flex', flexDirection: 'column', gap: 8 * unit, boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
      <Label color={colors.goldDark}>{product.category.toUpperCase()}</Label>
      <span style={{ fontFamily: serif, fontSize: 64 * unit, color: colors.navy, lineHeight: 1.05 }}>{product.name}</span>
      <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 34 * unit, color: colors.ink }}>{money(product.price)}</span>
    </div>
  );
};

// Grande légende éditoriale en bas de l'image.
const Caption: React.FC<{ text: string; delay?: number }> = ({ text, delay = 6 }) => {
  const { vertical, unit } = useLayout();
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', padding: `0 ${70 * unit}px ${(vertical ? 300 : 110) * unit}px`, background: `linear-gradient(180deg, transparent 55%, ${colors.navyDeep}cc)` }}>
      <Kinetic text={text} delay={delay} style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 92 * unit, color: colors.cream, lineHeight: 1.05 }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Scènes

const ColdOpen = () => {
  const frame = useCurrentFrame();
  const { unit } = useLayout();
  const leak = interpolate(frame, [0, 120], [-40, 140]);
  const spacing = ease(frame, 18, 80, [70, 14]);
  return (
    <AbsoluteFill style={{ background: colors.navyDeep, justifyContent: 'center', alignItems: 'center' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${leak}% 40%, ${colors.gold}40, transparent 45%)` }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 * unit, transform: `scale(${interpolate(frame, [0, 120], [1, 1.06])})` }}>
        <Line width={260 * unit} />
        <Kinetic text="AOD" delay={16} stagger={6} style={{ fontFamily: serif, fontSize: 250 * unit, lineHeight: 1, color: colors.cream, letterSpacing: spacing * unit }} />
        <Line delay={10} width={260 * unit} />
        <div style={{ opacity: ease(frame, 50, 66) }}><Label>VENTES & SERVICES</Label></div>
        <div style={{ opacity: ease(frame, 70, 86) }}><Label color={colors.sand}>MADINA · CONAKRY</Label></div>
      </div>
    </AbsoluteFill>
  );
};

const Triptych = () => {
  const { vertical, unit } = useLayout();
  const { width, height } = useVideoConfig();
  const cells: { file: string; word: string; from: 'left' | 'right' | 'up' | 'down' }[] = [
    { file: 'aod-femme.webp', word: 'Madina.', from: vertical ? 'left' : 'up' },
    { file: 'aod-homme.webp', word: 'Conakry.', from: vertical ? 'right' : 'down' },
    { file: 'aod-sacs.webp', word: 'Vous.', from: vertical ? 'left' : 'up' },
  ];
  const box: Box = vertical ? [width, height / 3] : [width / 3, height];
  return (
    <AbsoluteFill style={{ background: colors.gold, flexDirection: vertical ? 'column' : 'row', gap: 6 * unit }}>
      {cells.map((c, i) => (
        <div key={c.file} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <WhipIn from={c.from} delay={i * 8}>
            <Media file={c.file} box={box} zoom={[1.15, 1]} focus={[50, 30]} fit="cover" />
            <AbsoluteFill style={{ background: `linear-gradient(0deg, ${colors.navyDeep}bb, transparent 60%)`, justifyContent: 'flex-end', padding: 50 * unit }}>
              <Kinetic text={c.word} delay={22 + i * 15} style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 96 * unit, color: colors.cream }} />
            </AbsoluteFill>
          </WhipIn>
        </div>
      ))}
    </AbsoluteFill>
  );
};

const Chapter: React.FC<{ n: string; title: string }> = ({ n, title }) => {
  const frame = useCurrentFrame();
  const { unit } = useLayout();
  return (
    <AbsoluteFill style={{ background: colors.navy, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      <span style={{ position: 'absolute', fontFamily: serif, fontSize: 900 * unit, color: 'transparent', WebkitTextStroke: `2px ${colors.gold}33`, transform: `translateX(${interpolate(frame, [0, 30], [8, -8])}%)` }}>{n}</span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 * unit, padding: `0 ${60 * unit}px` }}>
        <Kinetic text={n} stagger={2} style={{ fontFamily: sans, fontWeight: 600, fontSize: 34 * unit, letterSpacing: 10 * unit, color: colors.gold }} />
        <Kinetic text={title} delay={3} stagger={0.8} style={{ fontFamily: serif, fontSize: 130 * unit, color: colors.cream, lineHeight: 1 }} />
        <Line delay={6} width={200 * unit} />
      </div>
    </AbsoluteFill>
  );
};

const Shot: React.FC<{ file: string; from?: 'left' | 'right' | 'up' | 'down' | 'zoom'; zoom?: [number, number]; focus?: [number, number]; drift?: [number, number]; productId?: string; caption?: string; flash?: boolean }> = ({ file, from = 'right', zoom, focus, drift, productId, caption, flash = true }) => (
  <AbsoluteFill style={{ background: colors.navyDeep }}>
    <WhipIn from={from}><Media file={file} zoom={zoom} focus={focus} drift={drift} /></WhipIn>
    {caption && <Caption text={caption} />}
    {productId && <LowerThird productId={productId} />}
    {flash && <Flash />}
  </AbsoluteFill>
);

// Petite étiquette produit pour les plans très courts.
const Tag: React.FC<{ productId: string }> = ({ productId }) => {
  const frame = useCurrentFrame();
  const { vertical, unit } = useLayout();
  const { product } = fileOf(productId);
  return (
    <div style={{ position: 'absolute', right: 50 * unit, top: (vertical ? 260 : 80) * unit, opacity: ease(frame, 3, 9), background: colors.navy, color: colors.cream, padding: `${14 * unit}px ${26 * unit}px`, fontFamily: sans, fontWeight: 600, fontSize: 28 * unit, letterSpacing: 2 * unit, borderRight: `${6 * unit}px solid ${colors.gold}` }}>
      {product.name} · {money(product.price)}
    </div>
  );
};

const SplitShoes = () => {
  const frame = useCurrentFrame();
  const { vertical, unit } = useLayout();
  const { width, height } = useVideoConfig();
  const box: Box = vertical ? [width, height / 2] : [width / 2, height];
  const items: { id: string; from: 'left' | 'right' | 'up' | 'down' }[] = [
    { id: 'sandales-rivage', from: vertical ? 'left' : 'up' },
    { id: 'sneakers-urbaines', from: vertical ? 'right' : 'down' },
  ];
  return (
    <AbsoluteFill style={{ background: colors.gold, flexDirection: vertical ? 'column' : 'row', gap: 6 * unit }}>
      {items.map((it, i) => {
        const { file, product } = fileOf(it.id);
        return (
          <div key={it.id} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <WhipIn from={it.from} delay={i * 10}>
              <Media file={file} box={box} zoom={[1.1, 1]} drift={[i ? -4 : 4, 0]} fit="cover" />
              <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: i ? 'flex-end' : 'flex-start', padding: 50 * unit, background: `linear-gradient(0deg, ${colors.navyDeep}aa, transparent 50%)` }}>
                <Kinetic text={product.name} delay={22 + i * 10} stagger={0.8} style={{ fontFamily: serif, fontSize: 70 * unit, color: colors.cream }} />
                <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 32 * unit, color: colors.gold, opacity: ease(frame, 36 + i * 10, 46 + i * 10) }}>{money(product.price)}</span>
              </AbsoluteFill>
            </WhipIn>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Mosaic = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { vertical, unit } = useLayout();
  const ids = ['robe-lumiere', 'chemise-essentielle', 'sac-atelier', 'sandales-rivage', 'sac-voyage', 'lunettes-horizon'];
  const cols = vertical ? 2 : 3, rows = vertical ? 3 : 2;
  const box: Box = [width / cols, height / rows];
  const veil = ease(frame, 95, 115, [0, 0.72]);
  return (
    <AbsoluteFill style={{ background: colors.navyDeep }}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 6 * unit, transform: `scale(${interpolate(frame, [0, 180], [1, 1.08])})` }}>
        {ids.map((id, i) => {
          const p = spring({ frame: frame - i * 15, fps, config: { damping: 16, stiffness: 140 } });
          return (
            <div key={id} style={{ position: 'relative', overflow: 'hidden', opacity: Math.min(1, p * 1.5), transform: `scale(${0.85 + 0.15 * p})` }}>
              <Media file={fileOf(id).file} box={box} zoom={[1.12, 1]} fit="cover" />
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{ background: colors.navyDeep, opacity: veil }} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 24 * unit, flexDirection: 'column', padding: 60 * unit }}>
        <Kinetic text="Une sélection." delay={105} stagger={1.2} style={{ fontFamily: serif, fontSize: 110 * unit, color: colors.cream }} />
        <Kinetic text="Mille façons d’être vous." delay={122} stagger={0.9} style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 80 * unit, color: colors.gold }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const steps = [
  { n: '01', title: 'On échange sur WhatsApp', text: 'Un conseil, une taille, une couleur ?', file: 'aod-femme.webp', Icon: MessageCircle },
  { n: '02', title: 'Vous choisissez à votre rythme', text: 'Sans compte, sans pression.', file: 'aod-sacs.webp', Icon: ShoppingBag },
  { n: '03', title: 'Retrait à Madina ou livraison', text: 'Tout est confirmé avec vous avant le paiement.', file: 'aod-homme.webp', Icon: MapPin },
];

const Step: React.FC<(typeof steps)[number]> = ({ n, title, text, file, Icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { unit } = useLayout();
  const pop = spring({ frame: frame - 4, fps, config: { damping: 12, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ background: colors.navyDeep }}>
      <WhipIn from="zoom">
        <AbsoluteFill style={{ opacity: 0.35, filter: 'blur(6px)' }}><Media file={file} zoom={[1.15, 1.05]} fit="cover" /></AbsoluteFill>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${colors.navy}66, ${colors.navyDeep}ee 70%)` }} />
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 26 * unit, padding: 80 * unit }}>
          <div style={{ width: 150 * unit, height: 150 * unit, borderRadius: '50%', background: colors.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop})` }}>
            <Icon size={70 * unit} color={colors.navyDeep} strokeWidth={1.8} />
          </div>
          <Kinetic text={`ÉTAPE ${n}`} delay={8} stagger={1} style={{ fontFamily: sans, fontWeight: 600, fontSize: 28 * unit, letterSpacing: 8 * unit, color: colors.gold }} />
          <Kinetic text={title} delay={12} stagger={0.7} style={{ fontFamily: serif, fontSize: 86 * unit, lineHeight: 1.1, color: colors.cream, maxWidth: 1500 * unit }} />
          <div style={{ opacity: ease(frame, 30, 44) }}><span style={{ fontFamily: sans, fontSize: 36 * unit, color: colors.sand }}>{text}</span></div>
        </AbsoluteFill>
      </WhipIn>
      <Flash strength={0.35} />
    </AbsoluteFill>
  );
};

const HeroQuote = () => {
  const { unit } = useLayout();
  return (
    <AbsoluteFill style={{ background: colors.navyDeep }}>
      <WhipIn from="zoom"><Media file="aod-conakry-hero.webp" zoom={[1.02, 1.12]} focus={[50, 25]} /></WhipIn>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 35%, ${colors.navyDeep}e6 85%)`, justifyContent: 'flex-end', alignItems: 'center', textAlign: 'center', paddingBottom: 280 * unit, gap: 10 * unit }}>
        <Kinetic text="D’ici." delay={8} stagger={2} style={{ fontFamily: serif, fontSize: 140 * unit, color: colors.cream, lineHeight: 1 }} />
        <Kinetic text="Avec caractère." delay={24} stagger={1.2} style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 110 * unit, color: colors.gold, lineHeight: 1.1 }} />
      </AbsoluteFill>
      <Flash />
    </AbsoluteFill>
  );
};

const Finale = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { unit } = useLayout();
  const pop = spring({ frame: frame - 40, fps, config: { damping: 11, stiffness: 150 } });
  const pulse = 1 + 0.025 * Math.sin(Math.max(0, frame - 60) / 6);
  const fadeOut = interpolate(frame, [durationInFrames - 30, durationInFrames], [1, 0], clamp);
  const leak = interpolate(frame, [0, durationInFrames], [120, -20]);
  return (
    <AbsoluteFill style={{ background: colors.navy, justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 80 * unit }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${leak}% 30%, ${colors.gold}30, transparent 45%)` }} />
      <div style={{ opacity: fadeOut, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 * unit }}>
        <Kinetic text="AOD" stagger={4} style={{ fontFamily: serif, fontSize: 150 * unit, color: colors.cream, letterSpacing: 14 * unit, lineHeight: 1 }} />
        <Line delay={8} width={220 * unit} />
        <Kinetic text="Une envie ? Parlons-en." delay={14} stagger={0.8} style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 84 * unit, color: colors.gold }} />
        <div style={{ transform: `scale(${pop * pulse})`, display: 'flex', alignItems: 'center', gap: 18 * unit, background: colors.gold, color: colors.navyDeep, fontFamily: sans, fontWeight: 600, fontSize: 42 * unit, padding: `${26 * unit}px ${54 * unit}px`, borderRadius: 999, boxShadow: `0 0 ${60 * unit}px ${colors.gold}55` }}>
          <MessageCircle size={46 * unit} strokeWidth={2} /> WhatsApp · {phone}
        </div>
        <div style={{ opacity: ease(frame, 60, 75), display: 'flex', alignItems: 'center', gap: 10 * unit }}>
          <MapPin size={30 * unit} color={colors.gold} />
          <span style={{ fontFamily: sans, fontSize: 30 * unit, color: colors.sand, letterSpacing: 3 * unit }}>Boutique à Madina, Conakry</span>
        </div>
        <span style={{ opacity: ease(frame, 80, 95) * 0.55, fontFamily: sans, fontSize: 18 * unit, color: colors.sand }}>Visuels d’inspiration — ne représentent pas le stock réel.</span>
      </div>
      <Flash />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Habillage global

const Grain = () => {
  const frame = useCurrentFrame();
  const x = Math.floor(random(`gx${frame}`) * 512), y = Math.floor(random(`gy${frame}`) * 512);
  return <AbsoluteFill style={{ backgroundImage: `url(${staticFile('fx/grain.png')})`, backgroundPosition: `${x}px ${y}px`, mixBlendMode: 'overlay', opacity: 0.09, pointerEvents: 'none' }} />;
};

const Vignette = () => <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(5,14,24,.45) 100%)', pointerEvents: 'none' }} />;

const LogoBug = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { vertical, unit } = useLayout();
  const o = Math.min(ease(frame, 0, 15), interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], clamp));
  return (
    <div style={{ position: 'absolute', top: (vertical ? 110 : 50) * unit, left: 60 * unit, opacity: o * 0.9, display: 'flex', alignItems: 'center', gap: 14 * unit }}>
      <span style={{ fontFamily: serif, fontSize: 46 * unit, color: colors.cream, letterSpacing: 4 * unit, textShadow: '0 2px 12px rgba(0,0,0,.4)' }}>AOD</span>
      <span style={{ width: 2, height: 30 * unit, background: colors.gold }} />
      <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 16 * unit, letterSpacing: 4 * unit, color: colors.cream, textShadow: '0 2px 12px rgba(0,0,0,.4)' }}>MADINA</span>
    </div>
  );
};

// ---------------------------------------------------------------- Voix off et sous-titres

type Cue = { file: string; start: number; dur: number; text: string; sub: boolean };
const cues = voiceover as Cue[];

// Présence de la voix image par image (0 à 1, rampes douces) : sert à baisser la musique sous la voix.
const voiceLevel = (() => {
  const level = new Float32Array(2400);
  for (const c of cues) {
    for (let f = c.start - 8; f < c.start + c.dur + 12; f++) {
      if (f < 0 || f >= level.length) continue;
      const v = Math.min(1, (f - (c.start - 8)) / 8, (c.start + c.dur + 12 - f) / 12);
      level[f] = Math.max(level[f], v);
    }
  }
  return level;
})();

// Sous-titre façon « karaoké » : le mot en cours de prononciation passe en or.
const Subtitle: React.FC<{ cue: Cue }> = ({ cue }) => {
  const frame = useCurrentFrame();
  const { vertical, unit } = useLayout();
  const words = cue.text.split(' ');
  const total = cue.text.replace(/ /g, '').length;
  let acc = 0;
  const spans = words.map((w) => { const s = acc / total; acc += w.length; return { w, s, e: acc / total }; });
  const t = frame / cue.dur;
  const appear = ease(frame, 0, 5), leave = interpolate(frame, [cue.dur + 2, cue.dur + 8], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: (cue.start >= FINALE ? (vertical ? 330 : 120) : vertical ? 580 : 330) * unit, pointerEvents: 'none' }}>
      <div style={{ opacity: Math.min(appear, leave), transform: `translateY(${(1 - appear) * 12}px)`, maxWidth: (vertical ? 940 : 1500) * unit, textAlign: 'center', background: 'rgba(8,22,36,.72)', padding: `${14 * unit}px ${28 * unit}px`, borderRadius: 14 * unit, fontFamily: sans, fontWeight: 600, fontSize: 46 * unit, lineHeight: 1.3, color: colors.cream }}>
        {spans.map(({ w, s, e }, i) => (
          <span key={i} style={{ color: t >= s && t < e + 0.05 ? colors.gold : colors.cream }}>{i > 0 ? ' ' : ''}{w}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const VoiceOver = () => (
  <>
    {cues.map((c) => (
      <Sequence key={c.file} from={c.start} durationInFrames={c.dur + 10}>
        <Audio src={staticFile(c.file)} volume={1} />
        {c.sub && <Subtitle cue={c} />}
      </Sequence>
    ))}
  </>
);

// ---------------------------------------------------------------- Montage

type Clip = { dur: number; el: React.ReactNode; whoosh?: boolean };

const timeline: Clip[] = [
  { dur: 120, el: <ColdOpen /> },
  { dur: 120, el: <Triptych /> },
  { dur: 30, el: <Chapter n="01" title="Femme" />, whoosh: true },
  { dur: 90, el: <Shot file="aod-femme.webp" from="zoom" zoom={[1.12, 1]} focus={[50, 30]} productId="robe-lumiere" /> },
  { dur: 60, el: <Shot file="aod-conakry-hero.webp" from="right" zoom={[1.1, 1.1]} drift={[-3, 0]} productId="ensemble-libre" /> },
  { dur: 30, el: <Shot file="aod-femme.webp" from="up" zoom={[1.22, 1.16]} focus={[50, 18]} caption="Élégance." /> },
  { dur: 30, el: <Chapter n="02" title="Homme" />, whoosh: true },
  { dur: 90, el: <Shot file="aod-homme.webp" from="zoom" zoom={[1.12, 1]} focus={[50, 30]} productId="chemise-essentielle" /> },
  { dur: 60, el: <Shot file="aod-homme.webp" from="left" zoom={[1.22, 1.14]} focus={[50, 80]} drift={[0, -3]} caption="L’allure, à votre façon." /> },
  { dur: 30, el: <Chapter n="03" title="Sacs & accessoires" />, whoosh: true },
  // Enchaînement rapide, une coupe par temps ou demi-mesure.
  { dur: 30, el: <><Shot file="aod-sacs.webp" from="right" zoom={[1.1, 1]} /><Tag productId="sac-atelier" /></> },
  { dur: 15, el: <Shot file="aod-sacs.webp" from="zoom" zoom={[1.22, 1.18]} focus={[45, 45]} /> },
  { dur: 30, el: <><Shot file="photo-1511499767150-a48a237f0083.jpg" from="left" /><Tag productId="lunettes-horizon" /></> },
  { dur: 15, el: <Shot file="photo-1553062407-98eeb64c6a62.jpg" from="zoom" zoom={[1.3, 1.26]} focus={[50, 40]} /> },
  { dur: 30, el: <><Shot file="photo-1553062407-98eeb64c6a62.jpg" from="right" zoom={[1.08, 1]} /><Tag productId="sac-voyage" /></> },
  { dur: 15, el: <Shot file="aod-sacs.webp" from="zoom" zoom={[1.22, 1.18]} focus={[70, 70]} /> },
  { dur: 45, el: <Shot file="aod-sacs.webp" from="down" zoom={[1.22, 1]} caption="Le détail qui change tout." /> },
  { dur: 30, el: <Chapter n="04" title="Chaussures" />, whoosh: true },
  { dur: 150, el: <SplitShoes /> },
  { dur: 180, el: <Mosaic />, whoosh: true },
  ...steps.map((s) => ({ dur: 90, el: <Step {...s} />, whoosh: true })),
  { dur: 90, el: <HeroQuote /> },
  { dur: 300, el: <Finale /> },
];

const starts = timeline.reduce<number[]>((acc, c, i) => [...acc, i ? acc[i - 1] + timeline[i - 1].dur : 0], []);
if (starts[starts.length - 1] + timeline[timeline.length - 1].dur !== MONTAGE) throw new Error('La timeline ne correspond pas à MONTAGE');

const FINALE = starts[starts.length - 1];
const DROP = 1200; // mesure 20 : fin de la pause musicale, début des étapes

const Sound = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <Audio src={staticFile('audio/montage-60s.mp3')} volume={(f) => 0.85 * (1 - 0.62 * (voiceLevel[f] ?? 0)) * interpolate(f, [0, 8, durationInFrames - 40, durationInFrames], [0, 1, 1, 0], clamp)} />
      {[120, DROP].map((t) => (
        <Sequence key={`r${t}`} from={t - 60} durationInFrames={60}><Audio src={staticFile('audio/riser.mp3')} volume={0.28} /></Sequence>
      ))}
      {[120, DROP, FINALE].map((t) => (
        <Sequence key={`i${t}`} from={t}><Audio src={staticFile('audio/impact.mp3')} volume={0.5} /></Sequence>
      ))}
      {timeline.map((c, i) => c.whoosh && (
        <Sequence key={`w${i}`} from={starts[i] - 8} durationInFrames={18}><Audio src={staticFile('audio/whoosh.mp3')} volume={0.3} /></Sequence>
      ))}
      <Sequence from={FINALE + 40}><Audio src={staticFile('audio/chime.mp3')} volume={0.5} /></Sequence>
    </>
  );
};

export const AodMontage = () => (
  <AbsoluteFill style={{ background: colors.navyDeep }}>
    {timeline.map((c, i) => (
      <Sequence key={i} from={starts[i]} durationInFrames={c.dur}>{c.el}</Sequence>
    ))}
    <Sequence from={120} durationInFrames={FINALE - 120}><LogoBug /></Sequence>
    <Vignette />
    <Grain />
    <VoiceOver />
    <Sound />
  </AbsoluteFill>
);
