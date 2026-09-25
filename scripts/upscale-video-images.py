"""Prépare des versions agrandies (2x, Lanczos + accentuation légère) des visuels du catalogue
pour la vidéo, dans remotion/public/images. Le site continue d'utiliser public/images.
Usage : python3 scripts/upscale-video-images.py   (nécessite Pillow)"""
from pathlib import Path
from PIL import Image, ImageFilter

root = Path(__file__).resolve().parent.parent
src, dst = root / 'public' / 'images', root / 'remotion' / 'public' / 'images'
dst.mkdir(parents=True, exist_ok=True)
names = ['aod-conakry-hero.webp', 'aod-femme.webp', 'aod-homme.webp', 'aod-sacs.webp', 'aod-boutique.webp',
         'photo-1543163521-1bf539c55dd2.jpg', 'photo-1553062407-98eeb64c6a62.jpg',
         'photo-1511499767150-a48a237f0083.jpg', 'photo-1549298916-b41d501d3772.jpg']
sizes = {}
for name in names:
    im = Image.open(src / name).convert('RGB')
    big = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    big = big.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=2))
    fmt = 'WEBP' if name.endswith('.webp') else 'JPEG'
    big.save(dst / name, fmt, quality=93, **({'method': 6} if fmt == 'WEBP' else {'subsampling': 0}))
    sizes[name] = (big.width, big.height)
    print(name, big.size, (dst / name).stat().st_size // 1024, 'Ko')

# Dimensions utilisées par la vidéo pour ne jamais trop agrandir une photo (voir Media dans AodMontage.tsx).
lines = [f"  '{n}': [{w}, {h}]," for n, (w, h) in sizes.items()]
(root / 'remotion' / 'imageSizes.ts').write_text(
    '// Généré par scripts/upscale-video-images.py : largeur et hauteur de chaque visuel agrandi.\n'
    'export const imageSizes: Record<string, [number, number]> = {\n' + '\n'.join(lines) + '\n};\n')

# Texture de grain argentique (superposée très légèrement pour un rendu « cinéma »).
import random
random.seed(3)
fx = root / 'remotion' / 'public' / 'fx'
fx.mkdir(exist_ok=True)
grain = Image.new('L', (512, 512))
grain.putdata([max(0, min(255, int(random.gauss(128, 42)))) for _ in range(512 * 512)])
grain.save(fx / 'grain.png', optimize=True)
