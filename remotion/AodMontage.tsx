import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
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

// Courbes « motion design » : départ vif, arrivée très douce.
const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const curve = (frame: number, from: number, to: number, easing = expoOut) => interpolate(frame, [from, to], [0, 1], { ...clamp, easing });

// Recouvrement entre deux plans : la scène suivante se révèle par-dessus la précédente.
const OVERLAP = 12;

const fileOf = (productId: string) => {
  const p = products.find((x) => x.id === productId)!;
  return { file: p.image.split('/').pop()!, product: p };
};

// ---------------------------------------------------------------- Briques visuelles

type Box = [number, number];

// Photo animée (zoom lent + dérive). Si la couvrir en plein cadre obligeait à l'agrandir au-delà de sa
// définition, elle est présentée « encadrée » sur un fond flou : l'image reste nette sur téléphone.
const Media: React.FC<{ file: string; box?: Box; zoom?: [number, number]; focus?: [number, number]; drift?: [number, number]; orbit?: number; fit?: 'auto' | 'cover' }> = ({ file, box, zoom = [1.08, 1], focus = [50, 50], drift = [0, 0], orbit = 0, fit = 'auto' }) => {
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
    // orbit : légère rotation en perspective, comme une caméra qui tourne autour du sujet.
    const rot = orbit ? `perspective(1600px) rotateY(${orbit * (t - 0.5)}deg) ` : '';
    return <Img src={src} style={{ ...cover, objectPosition: `${focus[0]}% ${focus[1]}%`, transformOrigin: `${focus[0]}% ${focus[1]}%`, transform: `${rot}scale(${z}) translate(${dx}%, ${dy}%)` }} />;
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

// Texte révélé derrière un cache (il monte depuis une ligne invisible) : typographie « titrage cinéma ».
const MaskReveal: React.FC<{ delay?: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, dur = 16, children, style }) => {
  const p = curve(useCurrentFrame(), delay, delay + dur);
  return (
    <div style={{ overflow: 'hidden', paddingBottom: '0.08em', ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)`, opacity: p > 0 ? 1 : 0 }}>{children}</div>
    </div>
  );
};

// Reflet lumineux qui balaie un texte (logo, titres).
const Shine: React.FC<{ text: string; at: number; style: React.CSSProperties }> = ({ text, at, style }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [at, at + 24], [-60, 160], clamp);
  const on = frame >= at && frame <= at + 24;
  return (
    <span style={{ ...style, position: 'absolute', inset: 0, display: on ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center', color: 'transparent',
      backgroundImage: `linear-gradient(105deg, transparent ${x - 18}%, rgba(255,247,222,.95) ${x}%, transparent ${x + 18}%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>{text}</span>
  );
};

// Particules dorées en suspension (déterministes : même rendu à chaque image).
const Particles: React.FC<{ count?: number; seed?: string; color?: string; opacity?: number }> = ({ count = 28, seed = 'p', color = colors.gold, opacity = 0.55 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { unit } = useLayout();
  const fade = ease(frame, 0, 18);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const size = (2 + r('s') * 6) * unit;
        const x = r('x') * width + Math.sin(frame / 40 + r('ph') * 6.28) * 24 * unit;
        const y = (((r('y') * height - frame * (0.4 + r('v')) * 1.3 * unit) % height) + height) % height;
        const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(frame / (10 + r('t') * 22) + r('ph') * 6));
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: color, opacity: opacity * twinkle * fade, boxShadow: `0 0 ${size * 3}px ${color}`, filter: r('b') > 0.7 ? `blur(${size * 0.5}px)` : undefined }} />;
      })}
    </AbsoluteFill>
  );
};

// Fuite de lumière chaude sur les temps forts.
const LightLeak: React.FC<{ dur?: number }> = ({ dur = 36 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, dur * 0.3, dur], [0, 0.75, 0], clamp);
  const x = interpolate(frame, [0, dur], [-10, 110]);
  return <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: o, pointerEvents: 'none', background: `radial-gradient(ellipse 60% 45% at ${x}% 35%, #ffcf7a, transparent 70%), radial-gradient(ellipse 40% 60% at ${100 - x}% 80%, #ff9b54aa, transparent 70%)` }} />;
};

// Bandes « cinéma » qui entrent en haut et en bas de l'image.
const Letterbox: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const p = curve(useCurrentFrame(), delay, delay + 18);
  const bar: React.CSSProperties = { position: 'absolute', left: 0, right: 0, height: `${p * 9}%`, background: '#05101b' };
  return <AbsoluteFill style={{ pointerEvents: 'none' }}><div style={{ ...bar, top: 0 }} /><div style={{ ...bar, bottom: 0 }} /></AbsoluteFill>;
};

type RevealKind = 'cut' | 'circle' | 'wipe' | 'diagonal' | 'split' | 'stripes';

// Transition d'entrée : la scène se découvre (cercle, volet, diagonale, rideaux, bandes), avec un liseré or.
const Reveal: React.FC<{ kind: RevealKind; children: React.ReactNode }> = ({ kind, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { unit } = useLayout();
  const p = interpolate(frame, [0, OVERLAP], [0, 1], { ...clamp, easing: inOut });
  if (kind === 'cut' || p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const edge = 7 * unit;
  let clip = '', gold = '';
  if (kind === 'circle') {
    const r = p * 0.76 * Math.hypot(width, height);
    clip = `circle(${r}px at 50% 50%)`;
    gold = `circle(${r + edge}px at 50% 50%)`;
  } else if (kind === 'wipe') {
    clip = `inset(0 ${(1 - p) * 100}% 0 0)`;
    gold = `inset(0 ${Math.max(0, (1 - p) * 100 - 1.2)}% 0 0)`;
  } else if (kind === 'diagonal') {
    const x = p * 150;
    clip = `polygon(0 0, ${x}% 0, ${x - 50}% 100%, 0 100%)`;
    gold = `polygon(0 0, ${x + 2}% 0, ${x - 48}% 100%, 0 100%)`;
  } else if (kind === 'split') {
    clip = `inset(0 ${(1 - p) * 50}% 0 ${(1 - p) * 50}%)`;
    gold = `inset(0 ${Math.max(0, (1 - p) * 50 - 1)}% 0 ${Math.max(0, (1 - p) * 50 - 1)}%)`;
  } else {
    // Bandes horizontales décalées dans le temps.
    const n = 6, poly = (lead: number) => Array.from({ length: n }, (_, i) => {
      const w = interpolate(frame, [i * 1.2, OVERLAP - (n - 1 - i) * 0.4], [0, 100], { ...clamp, easing: inOut }) + lead;
      const y0 = (i / n) * 100, y1 = ((i + 1) / n) * 100;
      return `0% ${y0}%, ${w}% ${y0}%, ${w}% ${y1}%, 0% ${y1}%`;
    }).join(', ');
    clip = `polygon(${poly(0)})`;
    gold = `polygon(${poly(6)})`;
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(90deg, ${colors.goldDark}, ${colors.gold})`, clipPath: gold }} />
      <AbsoluteFill style={{ clipPath: clip }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// Bandeau produit animé en plusieurs temps : filet or, panneau, catégorie, nom, puis prix qui défile.
const LowerThird: React.FC<{ productId: string; delay?: number }> = ({ productId, delay = 12 }) => {
  const frame = useCurrentFrame();
  const { vertical, unit } = useLayout();
  const { product } = fileOf(productId);
  const bar = curve(frame, delay, delay + 8);
  const panel = curve(frame, delay + 4, delay + 18);
  const count = curve(frame, delay + 14, delay + 36, Easing.out(Easing.cubic));
  const price = Math.round((product.price * count) / 1000) * 1000;
  return (
    <div style={{ position: 'absolute', left: 0, bottom: (vertical ? 260 : 90) * unit, display: 'flex', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,.3))' }}>
      <div style={{ width: 10 * unit, background: colors.gold, transform: `scaleY(${bar})`, transformOrigin: 'bottom' }} />
      <div style={{ clipPath: `inset(0 ${(1 - panel) * 100}% 0 0)`, background: `${colors.cream}f4`, padding: `${26 * unit}px ${48 * unit}px ${26 * unit}px ${50 * unit}px`, display: 'flex', flexDirection: 'column', gap: 6 * unit }}>
        <MaskReveal delay={delay + 10} dur={12}><Label color={colors.goldDark}>{product.category.toUpperCase()}</Label></MaskReveal>
        <MaskReveal delay={delay + 13}><span style={{ fontFamily: serif, fontSize: 64 * unit, color: colors.navy, lineHeight: 1.05 }}>{product.name}</span></MaskReveal>
        <MaskReveal delay={delay + 14} dur={10}><span style={{ fontFamily: sans, fontWeight: 600, fontSize: 34 * unit, color: colors.ink, fontVariantNumeric: 'tabular-nums' }}>{money(price)}</span></MaskReveal>
      </div>
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
  const logo: React.CSSProperties = { fontFamily: serif, fontSize: 250 * unit, lineHeight: 1, letterSpacing: spacing * unit };
  const ring = curve(frame, 4, 50, inOut);
  return (
    <AbsoluteFill style={{ background: colors.navyDeep, justifyContent: 'center', alignItems: 'center' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${leak}% 40%, ${colors.gold}40, transparent 45%)` }} />
      <Particles seed="open" count={34} />
      <svg style={{ position: 'absolute', width: 760 * unit, height: 760 * unit, transform: `rotate(${-90 + frame * 0.4}deg) scale(${interpolate(frame, [0, 120], [0.96, 1.04])})` }} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke={colors.gold} strokeOpacity={0.35} strokeWidth={0.25} strokeDasharray={301.6} strokeDashoffset={301.6 * (1 - ring)} />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 * unit, transform: `scale(${interpolate(frame, [0, 120], [1, 1.06])})` }}>
        <Line width={260 * unit} />
        <div style={{ position: 'relative' }}>
          <Kinetic text="AOD" delay={16} stagger={6} style={{ ...logo, color: colors.cream }} />
          <Shine text="AOD" at={66} style={logo} />
        </div>
        <Line delay={10} width={260 * unit} />
        <MaskReveal delay={50}><Label>VENTES & SERVICES</Label></MaskReveal>
        <MaskReveal delay={70}><Label color={colors.sand}>MADINA · CONAKRY</Label></MaskReveal>
      </div>
    </AbsoluteFill>
  );
};

const Triptych = () => {
  const frame = useCurrentFrame();
  const { vertical, unit } = useLayout();
  const { width, height } = useVideoConfig();
  const cells: { file: string; word: string; from: 'left' | 'right' | 'up' | 'down' }[] = [
    { file: 'aod-femme.webp', word: 'Madina.', from: vertical ? 'left' : 'up' },
    { file: 'aod-homme.webp', word: 'Conakry.', from: vertical ? 'right' : 'down' },
    { file: 'aod-sacs.webp', word: 'Vous.', from: vertical ? 'left' : 'up' },
  ];
  const box: Box = vertical ? [width, height / 3] : [width / 3, height];
  return (
    <AbsoluteFill style={{ background: colors.navyDeep, flexDirection: vertical ? 'column' : 'row', gap: 6 * unit }}>
      {cells.map((c, i) => (
        <div key={c.file} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <WhipIn from={c.from} delay={i * 8}>
            <Media file={c.file} box={box} zoom={[1.15, 1]} focus={[50, 30]} fit="cover" />
            <AbsoluteFill style={{ background: `linear-gradient(0deg, ${colors.navyDeep}bb, transparent 60%)`, justifyContent: 'flex-end', padding: 50 * unit }}>
              <MaskReveal delay={20 + i * 15} dur={16}><span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 96 * unit, color: colors.cream }}>{c.word}</span></MaskReveal>
              <div style={{ height: 3, width: curve(frame, 28 + i * 15, 44 + i * 15) * 120 * unit, background: colors.gold, marginTop: 10 * unit }} />
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
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${colors.navy}, ${colors.navyDeep} 75%)`, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      <span style={{ position: 'absolute', fontFamily: serif, fontSize: 900 * unit, color: 'transparent', WebkitTextStroke: `2px ${colors.gold}33`, transform: `translateX(${interpolate(frame, [0, 42], [8, -8])}%) scale(${interpolate(frame, [0, 42], [1.08, 1])})` }}>{n}</span>
      <Particles seed={`ch${n}`} count={18} opacity={0.4} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18 * unit, padding: `0 ${60 * unit}px` }}>
        <MaskReveal delay={2} dur={12}><span style={{ fontFamily: sans, fontWeight: 600, fontSize: 34 * unit, letterSpacing: 10 * unit, color: colors.gold }}>{n}</span></MaskReveal>
        <MaskReveal delay={5} dur={16}><span style={{ fontFamily: serif, fontSize: 130 * unit, color: colors.cream, lineHeight: 1 }}>{title}</span></MaskReveal>
        <Line delay={9} width={200 * unit} />
      </div>
    </AbsoluteFill>
  );
};

const Shot: React.FC<{ file: string; from?: 'left' | 'right' | 'up' | 'down' | 'zoom'; zoom?: [number, number]; focus?: [number, number]; drift?: [number, number]; orbit?: number; productId?: string; caption?: string; flash?: boolean }> = ({ file, from = 'right', zoom, focus, drift, orbit, productId, caption, flash = true }) => (
  <AbsoluteFill style={{ background: colors.navyDeep }}>
    <WhipIn from={from}><Media file={file} zoom={zoom} focus={focus} drift={drift} orbit={orbit} /></WhipIn>
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
  const p = curve(frame, 2, 12);
  return (
    <div style={{ position: 'absolute', right: 50 * unit, top: (vertical ? 260 : 80) * unit, display: 'flex', clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`, filter: 'drop-shadow(0 10px 30px rgba(0,0,0,.35))' }}>
      <div style={{ background: colors.navy, color: colors.cream, padding: `${14 * unit}px ${26 * unit}px`, fontFamily: sans, fontWeight: 600, fontSize: 28 * unit, letterSpacing: 2 * unit, transform: `translateX(${(1 - p) * 30}%)` }}>
        {product.name} · <span style={{ color: colors.gold }}>{money(product.price)}</span>
      </div>
      <div style={{ width: 6 * unit, background: colors.gold }} />
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
                <MaskReveal delay={20 + i * 10}><span style={{ fontFamily: serif, fontSize: 70 * unit, color: colors.cream }}>{product.name}</span></MaskReveal>
                <div style={{ height: 3, width: curve(frame, 28 + i * 10, 44 + i * 10) * 160 * unit, background: colors.gold, margin: `${8 * unit}px 0` }} />
                <MaskReveal delay={32 + i * 10} dur={12}><span style={{ fontFamily: sans, fontWeight: 600, fontSize: 32 * unit, color: colors.gold }}>{money(product.price)}</span></MaskReveal>
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
  const { width, height } = useVideoConfig();
  const { vertical, unit } = useLayout();
  const ids = ['robe-lumiere', 'chemise-essentielle', 'sac-atelier', 'sandales-rivage', 'sac-voyage', 'lunettes-horizon'];
  const cols = vertical ? 2 : 3, rows = vertical ? 3 : 2;
  const box: Box = [width / cols, height / rows];
  const veil = ease(frame, 95, 115, [0, 0.72]);
  const clips = [(p: number) => `inset(0 ${(1 - p) * 100}% 0 0)`, (p: number) => `inset(${(1 - p) * 100}% 0 0 0)`, (p: number) => `inset(0 0 0 ${(1 - p) * 100}%)`, (p: number) => `inset(0 0 ${(1 - p) * 100}% 0)`];
  return (
    <AbsoluteFill style={{ background: colors.navyDeep }}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 6 * unit, transform: `scale(${interpolate(frame, [0, 180], [1, 1.1])})`, filter: `blur(${ease(frame, 95, 120, [0, 7])}px)` }}>
        {ids.map((id, i) => {
          const p = curve(frame, i * 15, i * 15 + 16, inOut);
          return (
            <div key={id} style={{ position: 'relative', overflow: 'hidden', clipPath: clips[i % 4](p), background: colors.gold }}>
              <div style={{ position: 'absolute', inset: 0, transform: `scale(${1.25 - 0.25 * p})` }}><Media file={fileOf(id).file} box={box} zoom={[1.12, 1]} fit="cover" /></div>
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{ background: colors.navyDeep, opacity: veil }} />
      <Sequence from={95}><Particles seed="mosaic" count={24} /></Sequence>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 20 * unit, flexDirection: 'column', padding: 60 * unit }}>
        <MaskReveal delay={105} dur={18}><span style={{ fontFamily: serif, fontSize: 110 * unit, color: colors.cream }}>Une sélection.</span></MaskReveal>
        <Line delay={116} width={180 * unit} />
        <MaskReveal delay={122} dur={18}><span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 80 * unit, color: colors.gold }}>Mille façons d’être vous.</span></MaskReveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const steps = [
  { n: '01', title: 'On échange sur WhatsApp', text: 'Un conseil, une taille, une couleur ?', file: 'aod-femme.webp', Icon: MessageCircle },
  { n: '02', title: 'Vous choisissez à votre rythme', text: 'Sans compte, sans pression.', file: 'aod-sacs.webp', Icon: ShoppingBag },
  { n: '03', title: 'Retrait à Madina ou livraison', text: 'Tout est confirmé avec vous avant le paiement.', file: 'aod-homme.webp', Icon: MapPin },
];

const Step: React.FC<(typeof steps)[number] & { index: number }> = ({ n, title, text, file, Icon, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { vertical, unit } = useLayout();
  const ring = curve(frame, 2, 26, inOut);
  const pop = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ background: colors.navyDeep }}>
      <WhipIn from="zoom">
        <AbsoluteFill style={{ opacity: 0.35, filter: 'blur(6px)' }}><Media file={file} zoom={[1.15, 1.05]} fit="cover" /></AbsoluteFill>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${colors.navy}66, ${colors.navyDeep}ee 70%)` }} />
        <Particles seed={`step${n}`} count={16} opacity={0.35} />
        {/* Progression des trois étapes */}
        <div style={{ position: 'absolute', top: (vertical ? 250 : 90) * unit, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14 * unit }}>
          {steps.map((_, k) => (
            <div key={k} style={{ width: 110 * unit, height: 5 * unit, borderRadius: 3 * unit, background: `${colors.cream}33`, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${k < index ? 100 : k === index ? curve(frame, 0, 80, (t) => t) * 100 : 0}%`, background: colors.gold }} />
            </div>
          ))}
        </div>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 26 * unit, padding: 80 * unit }}>
          <div style={{ position: 'relative', width: 190 * unit, height: 190 * unit, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="47" fill="none" stroke={colors.gold} strokeWidth={1.6} strokeDasharray={295.3} strokeDashoffset={295.3 * (1 - ring)} strokeLinecap="round" />
            </svg>
            <div style={{ width: 140 * unit, height: 140 * unit, borderRadius: '50%', background: colors.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop})`, boxShadow: `0 0 ${50 * unit}px ${colors.gold}55` }}>
              <Icon size={64 * unit} color={colors.navyDeep} strokeWidth={1.8} />
            </div>
          </div>
          <MaskReveal delay={10} dur={12}><span style={{ fontFamily: sans, fontWeight: 600, fontSize: 28 * unit, letterSpacing: 8 * unit, color: colors.gold }}>ÉTAPE {n}</span></MaskReveal>
          <Kinetic text={title} delay={14} stagger={0.7} style={{ fontFamily: serif, fontSize: 86 * unit, lineHeight: 1.1, color: colors.cream, maxWidth: 1500 * unit }} />
          <MaskReveal delay={30} dur={14}><span style={{ fontFamily: sans, fontSize: 36 * unit, color: colors.sand }}>{text}</span></MaskReveal>
        </AbsoluteFill>
      </WhipIn>
      <Flash strength={0.35} />
    </AbsoluteFill>
  );
};

const HeroQuote = () => {
  const { unit } = useLayout();
  const logo: React.CSSProperties = { fontFamily: serif, fontSize: 140 * unit, lineHeight: 1 };
  return (
    <AbsoluteFill style={{ background: colors.navyDeep }}>
      <WhipIn from="zoom"><Media file="aod-conakry-hero.webp" zoom={[1.04, 1.14]} focus={[50, 25]} orbit={3} /></WhipIn>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 35%, ${colors.navyDeep}e6 85%)` }} />
      <Particles seed="hero" count={20} opacity={0.45} />
      <Letterbox delay={2} />
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', textAlign: 'center', paddingBottom: 280 * unit, gap: 10 * unit }}>
        <div style={{ position: 'relative' }}>
          <Kinetic text="D’ici." delay={8} stagger={2} style={{ ...logo, color: colors.cream }} />
          <Shine text="D’ici." at={40} style={logo} />
        </div>
        <MaskReveal delay={24} dur={18}><span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 110 * unit, color: colors.gold, lineHeight: 1.1 }}>Avec caractère.</span></MaskReveal>
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
  const logo: React.CSSProperties = { fontFamily: serif, fontSize: 150 * unit, letterSpacing: 14 * unit, lineHeight: 1 };
  const shineX = interpolate((frame - 70) % 75, [0, 30], [-40, 140], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${colors.navy}, ${colors.navyDeep} 80%)`, justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 80 * unit }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${leak}% 30%, ${colors.gold}30, transparent 45%)` }} />
      <Particles seed="finale" count={40} />
      <div style={{ opacity: fadeOut, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 * unit }}>
        <div style={{ position: 'relative' }}>
          <Kinetic text="AOD" stagger={4} style={{ ...logo, color: colors.cream }} />
          <Shine text="AOD" at={24} style={logo} />
        </div>
        <Line delay={8} width={220 * unit} />
        <MaskReveal delay={14} dur={18}><span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 84 * unit, color: colors.gold }}>Une envie ? Parlons-en.</span></MaskReveal>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Ondes qui partent du bouton WhatsApp */}
          {[0, 25].map((offset) => {
            const t = ((Math.max(0, frame - 55 - offset)) % 50) / 50;
            return frame > 55 + offset && <div key={offset} style={{ position: 'absolute', inset: 0, borderRadius: 999, border: `${3 * unit}px solid ${colors.gold}`, opacity: (1 - t) * 0.6, transform: `scale(${1 + t * 0.35}, ${1 + t * 0.9})` }} />;
          })}
          <div style={{ position: 'relative', overflow: 'hidden', transform: `scale(${pop * pulse})`, display: 'flex', alignItems: 'center', gap: 18 * unit, background: colors.gold, color: colors.navyDeep, fontFamily: sans, fontWeight: 600, fontSize: 42 * unit, padding: `${26 * unit}px ${54 * unit}px`, borderRadius: 999, boxShadow: `0 0 ${60 * unit}px ${colors.gold}55` }}>
            <MessageCircle size={46 * unit} strokeWidth={2} /> WhatsApp · {phone}
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent ${shineX - 15}%, rgba(255,255,255,.55) ${shineX}%, transparent ${shineX + 15}%)` }} />
          </div>
        </div>
        <MaskReveal delay={60} dur={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 * unit }}>
            <MapPin size={30 * unit} color={colors.gold} />
            <span style={{ fontFamily: sans, fontSize: 30 * unit, color: colors.sand, letterSpacing: 3 * unit }}>Boutique à Madina, Conakry</span>
          </div>
        </MaskReveal>
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

type Clip = { dur: number; el: React.ReactNode; whoosh?: boolean; reveal?: RevealKind };

const timeline: Clip[] = [
  { dur: 120, el: <ColdOpen /> },
  { dur: 120, el: <Triptych />, reveal: 'circle' },
  { dur: 30, el: <Chapter n="01" title="Femme" />, whoosh: true, reveal: 'stripes' },
  { dur: 90, el: <Shot file="aod-femme.webp" from="zoom" zoom={[1.12, 1.02]} focus={[50, 30]} orbit={3} productId="robe-lumiere" />, reveal: 'split' },
  { dur: 60, el: <Shot file="aod-conakry-hero.webp" from="right" zoom={[1.1, 1.1]} drift={[-3, 0]} productId="ensemble-libre" />, reveal: 'wipe' },
  { dur: 30, el: <Shot file="aod-femme.webp" from="up" zoom={[1.22, 1.16]} focus={[50, 18]} caption="Élégance." /> },
  { dur: 30, el: <Chapter n="02" title="Homme" />, whoosh: true, reveal: 'stripes' },
  { dur: 90, el: <Shot file="aod-homme.webp" from="zoom" zoom={[1.12, 1.02]} focus={[50, 30]} orbit={-3} productId="chemise-essentielle" />, reveal: 'diagonal' },
  { dur: 60, el: <Shot file="aod-homme.webp" from="left" zoom={[1.22, 1.14]} focus={[50, 80]} drift={[0, -3]} caption="L’allure, à votre façon." />, reveal: 'wipe' },
  { dur: 30, el: <Chapter n="03" title="Sacs & accessoires" />, whoosh: true, reveal: 'stripes' },
  // Enchaînement rapide, une coupe par temps ou demi-mesure.
  { dur: 30, el: <><Shot file="aod-sacs.webp" from="right" zoom={[1.1, 1]} /><Tag productId="sac-atelier" /></> },
  { dur: 15, el: <Shot file="aod-sacs.webp" from="zoom" zoom={[1.22, 1.18]} focus={[45, 45]} /> },
  { dur: 30, el: <><Shot file="photo-1511499767150-a48a237f0083.jpg" from="left" /><Tag productId="lunettes-horizon" /></> },
  { dur: 15, el: <Shot file="photo-1553062407-98eeb64c6a62.jpg" from="zoom" zoom={[1.3, 1.26]} focus={[50, 40]} /> },
  { dur: 30, el: <><Shot file="photo-1553062407-98eeb64c6a62.jpg" from="right" zoom={[1.08, 1]} /><Tag productId="sac-voyage" /></> },
  { dur: 15, el: <Shot file="aod-sacs.webp" from="zoom" zoom={[1.22, 1.18]} focus={[70, 70]} /> },
  { dur: 45, el: <Shot file="aod-sacs.webp" from="down" zoom={[1.22, 1]} caption="Le détail qui change tout." />, reveal: 'diagonal' },
  { dur: 30, el: <Chapter n="04" title="Chaussures" />, whoosh: true, reveal: 'stripes' },
  { dur: 150, el: <SplitShoes /> },
  { dur: 180, el: <Mosaic />, whoosh: true, reveal: 'circle' },
  ...steps.map((s, i) => ({ dur: 90, el: <Step {...s} index={i} />, whoosh: true, reveal: (['wipe', 'diagonal', 'split'] as RevealKind[])[i] })),
  { dur: 90, el: <HeroQuote />, reveal: 'circle' },
  { dur: 300, el: <Finale />, reveal: 'split' },
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
      // Chaque plan déborde de OVERLAP images sous le suivant, qui se révèle par-dessus.
      <Sequence key={i} from={starts[i]} durationInFrames={c.dur + (i < timeline.length - 1 ? OVERLAP : 0)}>
        <Reveal kind={c.reveal ?? 'cut'}>{c.el}</Reveal>
      </Sequence>
    ))}
    {[120, DROP, FINALE].map((t) => <Sequence key={`leak${t}`} from={t - 4} durationInFrames={40}><LightLeak /></Sequence>)}
    <Sequence from={120} durationInFrames={FINALE - 120}><LogoBug /></Sequence>
    <Vignette />
    <Grain />
    <VoiceOver />
    <Sound />
  </AbsoluteFill>
);
