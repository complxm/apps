"""Build the app icons from the master artwork (icons/icon-source.jpg, 2048 px, the glass arc: open ring, amber point).

The artwork has its own rounded corners on white; iOS and Android draw their own mask, so the corners are filled with
the artwork's own dark background (sampled just inside each corner) and the square is full bleed.
Writes icons/apple-touch-icon.png (180), icon-192.png, icon-512.png, icon-maskable-512.png (the arc sits inside the
maskable safe circle), favicon-32.png, favicon-48.png.
Usage: python3 scripts/build_icons.py
"""
import os
from PIL import Image, ImageDraw, ImageFilter

app = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
icons = os.path.join(app, 'icons')
src = Image.open(os.path.join(icons, 'icon-source.jpg')).convert('RGB')
W, H = src.size

# The artwork's own rounded rectangle, slightly inset so its white antialiased rim is dropped.
radius, inset = int(W * 0.185), int(W * 0.004)
mask = Image.new('L', (W, H), 0)
ImageDraw.Draw(mask).rounded_rectangle([inset, inset, W - 1 - inset, H - 1 - inset], radius=radius, fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(3))

# Behind it: each quarter filled with the colour found just inside that corner, softened into one field.
bg = Image.new('RGB', (W, H))
d = ImageDraw.Draw(bg)
k = int(radius * 0.55)
for (x0, y0, sx, sy) in [(0, 0, k, k), (W // 2, 0, W - 1 - k, k), (0, H // 2, k, H - 1 - k), (W // 2, H // 2, W - 1 - k, H - 1 - k)]:
    d.rectangle([x0, y0, x0 + W // 2, y0 + H // 2], fill=src.getpixel((sx, sy)))
bg = bg.filter(ImageFilter.GaussianBlur(W // 10))
full = Image.composite(src, bg, mask)

def save(img, size, name):
    img.resize((size, size), Image.LANCZOS).save(os.path.join(icons, name), optimize=True)

save(full, 180, 'apple-touch-icon.png')
save(full, 192, 'icon-192.png')
save(full, 512, 'icon-512.png')
save(full, 512, 'icon-maskable-512.png')
# Favicons: a tighter crop around the arc, so it reads at 16-48 px.
c0, c1 = int(W * 0.13), int(W * 0.87)
tight = full.crop((c0, c0 + int(W * 0.03), c1, c1 + int(W * 0.03)))
save(tight, 48, 'favicon-48.png')
save(tight, 32, 'favicon-32.png')
print('icons written')
