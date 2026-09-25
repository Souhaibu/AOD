"""Voix off synthétique du montage 60 s (remotion/AodMontage.tsx).

Chaque segment est synthétisé séparément : sa durée exacte sert à le caler sur l'image
et à afficher les sous-titres au bon moment. Sortie : remotion/public/audio/voix/*.mp3
et remotion/voiceover.json.

Usage :
  pip install piper-tts
  # voix française « siwis » : https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-fr-siwis-medium.tar.gz
  PIPER_MODEL=/chemin/fr-siwis-medium.onnx python3 scripts/generate-voiceover.py

Pour utiliser une vraie voix : remplacer les fichiers voix/*.mp3 par des enregistrements
portant les mêmes noms, puis relancer avec MEASURE_ONLY=1 pour recalculer les durées.
"""
import json
import os
import shutil
import subprocess
import tempfile
import wave
from pathlib import Path

FPS = 30
GAP = 6  # images de respiration entre deux segments enchaînés
root = Path(__file__).resolve().parent.parent
out = root / 'remotion' / 'public' / 'audio' / 'voix'
model = os.environ.get('PIPER_MODEL', '')
piper = os.environ.get('PIPER_BIN', shutil.which('piper') or 'piper')
ffmpeg = next((root / 'node_modules' / '@remotion').glob('compositor-*-gnu/ffmpeg'), None) or shutil.which('ffmpeg')

# at : image la plus tôt où le segment peut commencer (calée sur la scène). say : texte prononcé.
# show : sous-titre affiché (par défaut say). sub=False quand le même texte est déjà à l'écran.
script = [
    dict(at=20, say='Bienvenue chez AOD,', sub=False),
    dict(say='Ventes et Services.', sub=False),
    dict(at=128, say='À Madina, au cœur de Conakry,'),
    dict(say='une boutique pensée pour vous.'),
    dict(at=246, say='Pour vous, mesdames :'),
    dict(at=282, say='la robe Lumière,'),
    dict(at=362, say='l’ensemble Libre,'),
    dict(say='des pièces élégantes.'),
    dict(at=456, say='Pour vous, messieurs :'),
    dict(at=490, say='la chemise Essentielle.'),
    dict(say='Une coupe nette, au bureau comme le week-end.'),
    dict(at=636, say='Et parce que le détail change tout :'),
    dict(say='sacs, lunettes, accessoires…'),
    dict(say='de quoi compléter votre style.'),
    dict(at=846, say='Côté chaussures,'),
    dict(say='des sandales aux sneakers,'),
    dict(say='trouvez la paire qui vous ressemble.'),
    dict(at=1122, say='Une sélection.', sub=False),
    dict(say='Mille façons d’être vous.', sub=False),
    dict(at=1204, say='Commander, c’est simple :'),
    dict(say='on échange sur WhatsApp.', sub=False),
    dict(at=1294, say='Vous choisissez à votre rythme,', sub=False),
    dict(at=1384, say='et vous récupérez à Madina,'),
    dict(say='ou on vous livre.'),
    dict(at=1478, say='AOD.', sub=False),
    dict(say='D’ici. Avec caractère.', sub=False),
    dict(at=1572, say='Une envie ? Parlons-en !', sub=False),
    dict(say='Écrivez-nous sur WhatsApp,'),
    dict(say='au six cent onze, vingt-cinq, vingt-cinq, quatre-vingt-huit.', show='au 611 25 25 88.'),
    dict(say='On vous attend à Madina !'),
]


def trim_and_measure(wav_path: Path) -> float:
    """Retire les silences de début et de fin ; renvoie la durée en secondes."""
    with wave.open(str(wav_path)) as w:
        params, frames = w.getparams(), w.readframes(w.getnframes())
    width, rate = params.sampwidth, params.framerate
    samples = [int.from_bytes(frames[i:i + 2], 'little', signed=True) for i in range(0, len(frames), 2)]
    loud = [i for i, s in enumerate(samples) if abs(s) > 500]
    if loud:
        pad = int(0.03 * rate)
        a, b = max(0, loud[0] - pad), min(len(samples), loud[-1] + pad)
        samples = samples[a:b]
        with wave.open(str(wav_path), 'wb') as w:
            w.setparams(params)
            w.writeframes(b''.join(s.to_bytes(2, 'little', signed=True) for s in samples))
    return len(samples) / rate


def main() -> None:
    measure_only = os.environ.get('MEASURE_ONLY') == '1'
    out.mkdir(parents=True, exist_ok=True)
    cues, cursor = [], 0
    with tempfile.TemporaryDirectory() as tmp:
        for i, seg in enumerate(script):
            name = f'{i + 1:02d}.mp3'
            if measure_only:
                wav = Path(tmp) / f'{i}.wav'
                subprocess.run([ffmpeg, '-v', 'error', '-y', '-i', str(out / name), '-ac', '1', '-c:a', 'pcm_s16le', str(wav)], check=True)
                seconds = trim_and_measure(wav)
            else:
                wav = Path(tmp) / f'{i}.wav'
                subprocess.run([piper, '-m', model, '-f', str(wav), '--length-scale', '1.02', '--sentence-silence', '0'],
                               input=seg['say'].encode(), check=True, capture_output=True)
                seconds = trim_and_measure(wav)
                subprocess.run([ffmpeg, '-v', 'error', '-y', '-i', str(wav), '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '192k', str(out / name)], check=True)
            dur = round(seconds * FPS)
            start = max(seg.get('at', 0), cursor + GAP if cues else seg.get('at', 0))
            if 'at' in seg and start > seg['at'] + 10:
                print(f'  ⚠ segment {i + 1} commence {start - seg["at"]} images après son repère')
            cues.append(dict(file=f'audio/voix/{name}', start=start, dur=dur, text=seg.get('show', seg['say']), sub=seg.get('sub', True)))
            cursor = start + dur
            print(f'{name}  {start / FPS:5.2f}s → {cursor / FPS:5.2f}s  {seg["say"]}')
    (root / 'remotion' / 'voiceover.json').write_text(json.dumps(cues, ensure_ascii=False, indent=1) + '\n')
    if cursor > 1850:
        print('  ⚠ la voix dépasse la fin du montage')


if __name__ == '__main__':
    main()
