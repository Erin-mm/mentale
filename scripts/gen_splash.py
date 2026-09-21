"""从水墨 Logo 生成 Android 启动页。"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "static/icons/icon-v4-1024.png"
OUT = ROOT / "static/splash"
PAPER = (0xF4, 0xF1, 0xE9)
SIZES = {
    "android-hdpi.png": (480, 800),
    "android-xhdpi.png": (720, 1280),
    "android-xxhdpi.png": (1080, 1920),
}

logo = Image.open(SRC).convert("RGBA")
OUT.mkdir(parents=True, exist_ok=True)
for name, (width, height) in SIZES.items():
    canvas = Image.new("RGB", (width, height), PAPER)
    mark = max(int(min(width, height) * 0.28), 160)
    glyph = logo.resize((mark, mark), Image.LANCZOS)
    x = (width - mark) // 2
    y = (height - mark) // 2 - height // 18
    canvas.paste(glyph, (x, y), glyph)
    canvas.save(OUT / name, optimize=True)
    print(name, canvas.size)
