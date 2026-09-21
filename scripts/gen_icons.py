"""从 icon-v4-1024.png 生成 uni-app 全套启动器密度图。"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "static/icons/icon-v4-1024.png"
OUT = ROOT / "static/icons"

sq = Image.open(SRC).convert("RGB")
for size in [48, 58, 72, 80, 87, 96, 120, 144, 180, 192]:
    sq.resize((size, size), Image.LANCZOS).save(OUT / f"icon-v4-{size}.png", optimize=True)

print("source size:", sq.size)
