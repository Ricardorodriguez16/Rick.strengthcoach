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


def logo_lipoa():
    # Foto de perfil de Instagram: círculo de r=388 centrado en (400, 400).
    img = np.asarray(Image.open(FUENTES / 'lipoa-perfil.png').convert('RGB')).astype(np.float32)
    lum, sat = img.mean(axis=2), img.max(axis=2) - img.min(axis=2)
    # El fondo es blanco hueso con una raya gris arriba: todo lo claro y neutro pasa a blanco puro.
    peso = np.clip((lum - 196) / 30, 0, 1) * np.clip((40 - sat) / 20, 0, 1)
    img = img + (255 - img) * peso[..., None]
    # Fuera del círculo (y su borde, que arrastra el gris de la app) todo pasa a blanco.
    yy, xx = np.mgrid[0:800, 0:800]
    dentro = np.clip(383 - np.hypot(xx - 400 + .5, yy - 400 + .5), 0, 1)[..., None]
    img = (img * dentro + 255 * (1 - dentro)).clip(0, 255)
    # Fondo = el blanco que toca el borde; los blancos propios del logo (disco, letras) se quedan.
    claro = (img.min(axis=2) > 235).astype(np.uint8)
    _, etiquetas = cv2.connectedComponents(claro, connectivity=4)
    borde = np.unique(np.r_[etiquetas[0], etiquetas[-1], etiquetas[:, 0], etiquetas[:, -1]])
    fondo = np.isin(etiquetas, borde[borde > 0])
    # En el filo (2 px) el blanco se convierte en transparencia para que no quede halo claro.
    distancia = cv2.distanceTransform((~fondo).astype(np.uint8), cv2.DIST_L2, 3)
    filo = (distancia > 0) & (distancia <= 2)
    alfa = np.where(fondo, 0, 1).astype(np.float32)
    alfa[filo] = ((255 - img[filo]) / 255).max(axis=1)
    rgb = np.where(filo[..., None], (img - 255 * (1 - alfa[..., None])) / np.maximum(alfa[..., None], 1e-3), img)
    rgba = np.dstack([rgb.clip(0, 255), alfa * 255]).astype(np.uint8)
    ys, xs = np.where(alfa > .02)
    rgba = rgba[ys.min() - 2:ys.max() + 3, xs.min() - 2:xs.max() + 3]
    Image.fromarray(rgba, 'RGBA').save(ACTIVOS / 'lipoa.png', optimize=True)


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
    logo_lipoa()
    logo_sudamericano()
    print('Listo: activos/atleta.png, activos/lipoa.png, activos/sudamericano.png')
