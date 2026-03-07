from PIL import Image, ImageDraw, ImageFont
import textwrap
import uuid
import os

WIDTH = 1200
PADDING = 80
BACKGROUND = "#1e1e1e"
TEXT_COLOR = "#d4d4d4"

OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_image(code: str):
    if not code or not code.strip():
        raise ValueError("Code cannot be empty")

    font = ImageFont.load_default()

    wrapped = []
    for line in code.split("\n"):
        wrapped.extend(textwrap.wrap(line, width=80) or [""])

    height = PADDING * 2 + len(wrapped) * 20 + 80

    try:
        img = Image.new("RGB", (WIDTH, height), BACKGROUND)
        draw = ImageDraw.Draw(img)

        # Mac window buttons
        draw.ellipse((40, 30, 60, 50), fill="#ff5f56")
        draw.ellipse((70, 30, 90, 50), fill="#ffbd2e")
        draw.ellipse((100, 30, 120, 50), fill="#27c93f")

        y = 80

        for line in wrapped:
            draw.text((60, y), line, fill=TEXT_COLOR, font=font)
            y += 20

        filename = f"snapshot_{uuid.uuid4().hex}.png"
        path = os.path.join(OUTPUT_DIR, filename)

        img.save(path)
        return path
    except Exception as e:
        raise RuntimeError(f"Failed to generate image: {str(e)}")