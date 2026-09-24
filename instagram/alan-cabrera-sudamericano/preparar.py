#!/usr/bin/env python3
"""Prepara las imágenes del post a partir de fuentes/ y las deja en activos/.

Requiere: pip install "rembg[cpu]" pillow numpy opencv-python-headless
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from rembg import new_session, remove

RAIZ = Path(__file__).parent
FUENTES, ACTIVOS = RAIZ / 'fuentes', RAIZ / 'activos'


def recorte_atleta():
    foto = Image.open(FUENTES / 'atleta.jpg').convert('RGB')
    # BiRefNet da el borde fino; el modelo de personas aísla al atleta del juez y del rack.
    borde = np.asarray(remove(foto, session=new_session('birefnet-general-lite'), only_mask=True), np.float32) / 255
    persona = np.asarray(remove(foto, session=new_session('u2net_human_seg'), only_mask=True)) > 128
    n, etiquetas, stats, _ = cv2.connectedComponentsWithStats(persona.astype(np.uint8))
    atleta = (etiquetas == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
    zona = cv2.dilate(atleta, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    alfa = borde * cv2.GaussianBlur(zona.astype(np.float32), (0, 0), 3)
    alfa[686:, :334] = 0  # borde del disco rojo pegado a la cadera
    alfa[736:, :] = 0     # barra y piernas: el post corta en la cadera

    caja = (228, 340, 604, 740)
    rgba = np.dstack([np.asarray(foto), np.clip(alfa * 255, 0, 255).astype(np.uint8)])
    img = Image.fromarray(rgba, 'RGBA').crop(caja)
    img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
    rgb = img.convert('RGB').filter(ImageFilter.UnsharpMask(radius=2.6, percent=105, threshold=2))
    rgb = ImageEnhance.Color(ImageEnhance.Contrast(rgb).enhance(1.08)).enhance(1.05)
    # Borde más firme: fuera el halo oscuro que deja el fondo original.
    a = np.asarray(img.getchannel('A'), np.float32) / 255
    a = np.clip((a - .22) / .68, 0, 1)
    rgb.putalpha(Image.fromarray((a * a * (3 - 2 * a) * 255).astype(np.uint8)))
    rgb.save(ACTIVOS / 'atleta.png', optimize=True)


def insignia_lipoa():
    # Foto de perfil de Instagram: círculo de r=388 centrado en (400, 400).
    img = np.asarray(Image.open(FUENTES / 'lipoa-perfil.png').convert('RGB')).astype(np.float32)
    lum, sat = img.mean(axis=2), img.max(axis=2) - img.min(axis=2)
    # El fondo es blanco hueso con una raya gris arriba: todo lo claro y neutro pasa a blanco puro.
    peso = np.clip((lum - 196) / 30, 0, 1) * np.clip((40 - sat) / 20, 0, 1)
    img = img + (255 - img) * peso[..., None]
    lado, r = 800, 388
    yy, xx = np.mgrid[0:lado, 0:lado]
    alfa = np.clip(r - np.hypot(xx - 400 + .5, yy - 400 + .5), 0, 1)
    rgba = np.dstack([img, alfa * 255]).clip(0, 255).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').crop((12, 12, 788, 788)).save(ACTIVOS / 'lipoa.png', optimize=True)


def logo_sudamericano():
    # El logo viene sobre negro: el negro pasa a transparencia sin tocar los colores.
    img = Image.open(FUENTES / 'sudamericano.jpg').convert('RGB').crop((63, 12, 280, 158))
    img = img.resize((img.width * 3, img.height * 3), Image.LANCZOS)
    rgb = np.asarray(img.filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=1)), np.float32) / 255
    alfa = rgb.max(axis=2)
    alfa = np.where(alfa < 0.07, 0, alfa)
    color = np.where(alfa[..., None] > 0, rgb / np.maximum(alfa[..., None], 1e-6), 0)
    rgba = np.dstack([color, alfa]).clip(0, 1) * 255
    Image.fromarray(rgba.astype(np.uint8), 'RGBA').save(ACTIVOS / 'sudamericano.png', optimize=True)


if __name__ == '__main__':
    ACTIVOS.mkdir(exist_ok=True)
    recorte_atleta()
    insignia_lipoa()
    logo_sudamericano()
    print('Listo: activos/atleta.png, activos/lipoa.png, activos/sudamericano.png')
