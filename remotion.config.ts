import { Config } from '@remotion/cli/config';

// Ressources propres à la vidéo (visuels agrandis, bande-son) : le site n'en hérite pas.
Config.setPublicDir('./remotion/public');

// Qualité « téléphone » : images intermédiaires sans perte visible, encodage H.264 très peu compressé.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(100);
Config.setCodec('h264');
Config.setCrf(15);
Config.setX264Preset('slow');
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');
Config.setAudioBitrate('320k');
