import { AbsoluteFill, Audio, Img, Sequence, Series, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { GoldRule, Outro, ProductCard, Rise, useLayout } from './AodPromo';
import { colors, sans, serif } from './theme';

// Publicité de 30 s en deux séquences de 15 s, utilisables ensemble ou séparément
// (stories Instagram / statut WhatsApp). Les coupes tombent sur les temps de la musique (120 BPM).
export const PART = 450;

const PART1 = { products: ['robe-lumiere', 'chemise-essentielle', 'sac-atelier', 'sandales-rivage'], cuts: [120, 180, 240, 300, 360] };
const PART2 = { products: ['ensemble-libre', 'sneakers-urbaines'], cuts: [60, 120, 180, 235, 290, 345] };

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Panneau or qui balaie l'écran et masque chaque coupe.
const GoldWipe = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 12], [-101, 101], clamp);
  return <AbsoluteFill style={{ background: `linear-gradient(90deg, ${colors.goldDark}, ${colors.gold})`, transform: `translateX(${x}%) skewX(-8deg)` }} />;
};

const Soundtrack: React.FC<{ track: string; cuts: number[]; chimeAt?: number }> = ({ track, cuts, chimeAt }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <Audio src={staticFile(`audio/${track}.mp3`)} volume={(f) => 0.8 * interpolate(f, [0, 6, durationInFrames - 15, durationInFrames], [0, 1, 1, 0], clamp)} />
      {cuts.map((cut) => (
        <Sequence key={cut} from={cut - 8} durationInFrames={18}><Audio src={staticFile('audio/whoosh.mp3')} volume={0.3} /></Sequence>
      ))}
      {chimeAt !== undefined && <Sequence from={chimeAt}><Audio src={staticFile('audio/chime.mp3')} volume={0.5} /></Sequence>}
    </>
  );
};

const Wipes: React.FC<{ cuts: number[] }> = ({ cuts }) => (
  <>{cuts.map((cut) => <Sequence key={cut} from={cut - 6} durationInFrames={12}><GoldWipe /></Sequence>)}</>
);

// Plein écran photo + voile bleu nuit, commun aux titres.
const Backdrop: React.FC<{ image: string; children: React.ReactNode; opacity?: number }> = ({ image, children, opacity = 0.5 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.12, 1]);
  return (
    <AbsoluteFill style={{ background: colors.navyDeep }}>
      <Img src={staticFile(`images/${image}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, opacity }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${colors.navy}33 10%, ${colors.navyDeep}f0 85%)` }} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 80 }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { unit } = useLayout();
  return <span style={{ fontFamily: sans, fontWeight: 600, letterSpacing: 8 * unit, fontSize: 24 * unit, color: colors.gold }}>{children}</span>;
};

const Hook1 = () => {
  const { unit } = useLayout();
  return (
    <Backdrop image="aod-conakry-hero.webp" opacity={0.6}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 * unit }}>
        <Rise><Label>NOUVELLE COLLECTION</Label></Rise>
        <Rise delay={6}><h1 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 220 * unit, lineHeight: 1, color: colors.cream, letterSpacing: -4 * unit }}>AOD</h1></Rise>
        <GoldRule delay={14} width={180 * unit} />
        <Rise delay={20}><p style={{ margin: 0, fontFamily: serif, fontStyle: 'italic', fontSize: 60 * unit, color: colors.sand }}>D’ici. Avec caractère.</p></Rise>
        <Rise delay={30}><span style={{ fontFamily: sans, fontSize: 24 * unit, letterSpacing: 4 * unit, color: colors.sand, opacity: 0.8 }}>MADINA · CONAKRY</span></Rise>
      </div>
    </Backdrop>
  );
};

const Teaser = () => {
  const frame = useCurrentFrame();
  const { unit } = useLayout();
  const nudge = 10 * unit * Math.sin(frame / 5);
  return (
    <AbsoluteFill style={{ background: colors.navy, justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 36 * unit, padding: 80 * unit }}>
      <Rise><Label>FEMME · HOMME · SACS · CHAUSSURES</Label></Rise>
      <Rise delay={6}><h2 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 100 * unit, lineHeight: 1.08, color: colors.cream }}>Toute la collection<br /><em style={{ color: colors.gold }}>vous attend à Madina.</em></h2></Rise>
      <Rise delay={24}>
        <span style={{ display: 'inline-block', fontFamily: sans, fontWeight: 600, fontSize: 30 * unit, color: colors.sand, letterSpacing: 2 * unit }}>
          La suite : comment commander <span style={{ display: 'inline-block', color: colors.gold, transform: `translateX(${nudge}px)` }}>→</span>
        </span>
      </Rise>
    </AbsoluteFill>
  );
};

const Hook2 = () => {
  const { unit } = useLayout();
  return (
    <Backdrop image="aod-boutique.webp" opacity={0.55}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 * unit }}>
        <Rise><Label>AOD · VENTES & SERVICES</Label></Rise>
        <Rise delay={4}><h2 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 110 * unit, lineHeight: 1.05, color: colors.cream }}>Commander,<br /><em style={{ color: colors.gold }}>c’est simple.</em></h2></Rise>
      </div>
    </Backdrop>
  );
};

const steps = [
  { n: '01', title: 'On échange sur WhatsApp', text: 'Un conseil, une taille, une couleur ?', image: 'aod-femme.webp' },
  { n: '02', title: 'Vous choisissez à votre rythme', text: 'Sans compte, sans pression.', image: 'aod-sacs.webp' },
  { n: '03', title: 'Retrait à Madina ou livraison', text: 'Tout est confirmé avec vous avant le paiement.', image: 'aod-homme.webp' },
];

const Step: React.FC<(typeof steps)[number]> = ({ n, title, text, image }) => {
  const { unit } = useLayout();
  return (
    <Backdrop image={image} opacity={0.3}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * unit, maxWidth: 1400 * unit }}>
        <Rise><span style={{ fontFamily: serif, fontSize: 150 * unit, lineHeight: 1, color: colors.gold }}>{n}</span></Rise>
        <GoldRule delay={4} width={120 * unit} />
        <Rise delay={6}><h2 style={{ margin: 0, fontFamily: serif, fontWeight: 400, fontSize: 88 * unit, lineHeight: 1.08, color: colors.cream }}>{title}</h2></Rise>
        <Rise delay={12}><p style={{ margin: 0, fontFamily: sans, fontSize: 34 * unit, color: colors.sand }}>{text}</p></Rise>
      </div>
    </Backdrop>
  );
};

export const AodPubPartie1 = () => (
  <AbsoluteFill style={{ background: colors.navyDeep }}>
    <Series>
      <Series.Sequence durationInFrames={PART1.cuts[0]}><Hook1 /></Series.Sequence>
      {PART1.products.map((id, i) => (
        <Series.Sequence key={id} durationInFrames={60}><ProductCard id={id} index={i} total={PART1.products.length} /></Series.Sequence>
      ))}
      <Series.Sequence durationInFrames={PART - PART1.cuts[4]}><Teaser /></Series.Sequence>
    </Series>
    <Wipes cuts={PART1.cuts} />
    <Soundtrack track="pub-partie-1" cuts={PART1.cuts} />
  </AbsoluteFill>
);

export const AodPubPartie2 = () => (
  <AbsoluteFill style={{ background: colors.navyDeep }}>
    <Series>
      <Series.Sequence durationInFrames={PART2.cuts[0]}><Hook2 /></Series.Sequence>
      {PART2.products.map((id, i) => (
        <Series.Sequence key={id} durationInFrames={60}><ProductCard id={id} index={i} total={PART2.products.length} /></Series.Sequence>
      ))}
      {steps.map((s) => <Series.Sequence key={s.n} durationInFrames={55}><Step {...s} /></Series.Sequence>)}
      <Series.Sequence durationInFrames={PART - PART2.cuts[5]}><Outro /></Series.Sequence>
    </Series>
    <Wipes cuts={PART2.cuts} />
    {/* Carillon à l'apparition du bouton WhatsApp de l'écran final. */}
    <Soundtrack track="pub-partie-2" cuts={PART2.cuts} chimeAt={PART2.cuts[5] + 20} />
  </AbsoluteFill>
);

export const AodPub30 = () => (
  <Series>
    <Series.Sequence durationInFrames={PART}><AodPubPartie1 /></Series.Sequence>
    <Series.Sequence durationInFrames={PART}><AodPubPartie2 /></Series.Sequence>
  </Series>
);
