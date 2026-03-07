import os
import uuid
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pygments import lex
from pygments.lexers import get_lexer_by_name, guess_lexer
from pygments.styles import get_style_by_name

OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

class SnapshotGenerator:
    def __init__(self):
        self.font_path = "JetBrainsMono.ttf"
        self.font_size = 24
        
        # Dimensions & Colors inspired by modern sleek themes
        self.bg_outer = "#9CA3AF"
        self.bg_inner = "#1E1E2E" # Catppuccin Macchiato Base / Dark Theme Background
        self.line_num_color = "#585B70"
        
        self.padding_outer = 60
        self.padding_inner_x = 40
        self.padding_inner_y = 30
        self.header_height = 50
        self.line_spacing = 6
        self.shadow_offset = 15
        self.shadow_blur = 20

    def get_font(self):
        try:
            return ImageFont.truetype(self.font_path, self.font_size)
        except OSError:
            return ImageFont.load_default()

    def generate(self, code: str, language: str = None):
        if not code or not code.strip():
            raise ValueError("Code cannot be empty")
            
        code_lines = code.split("\n")
        font = self.get_font()
        
        # Setup Lexer and Style
        try:
            if language:
                lexer = get_lexer_by_name(language)
            else:
                lexer = guess_lexer(code)
        except Exception:
            lexer = get_lexer_by_name("text")
        
        style = get_style_by_name("monokai")
        # monokai/dracula gives good vivid colors suitable for dark themes
        
        dummy_img = Image.new("RGB", (1, 1))
        dummy_draw = ImageDraw.Draw(dummy_img)
        
        avg_char_width = dummy_draw.textlength("a", font=font)
        line_height = self.font_size + self.line_spacing
        
        max_line_chars = max([len(line) for line in code_lines] + [10])
        line_num_width = dummy_draw.textlength(f"{len(code_lines)}  ", font=font)
        
        code_width = int(max_line_chars * avg_char_width)
        code_height = len(code_lines) * line_height
        
        inner_width = self.padding_inner_x * 2 + int(line_num_width) + code_width
        inner_height = self.padding_inner_y * 2 + self.header_height + code_height
        
        inner_width = max(inner_width, 600)
        
        outer_width = inner_width + self.padding_outer * 2
        outer_height = inner_height + self.padding_outer * 2
        
        img = Image.new("RGBA", (outer_width, outer_height), self.bg_outer)
        
        # Shadow
        shadow = Image.new("RGBA", (outer_width, outer_height), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow)
        shadow_rect = [
            self.padding_outer + self.shadow_offset, 
            self.padding_outer + self.shadow_offset,
            self.padding_outer + inner_width + self.shadow_offset,
            self.padding_outer + inner_height + self.shadow_offset
        ]
        shadow_draw.rounded_rectangle(shadow_rect, radius=12, fill=(0, 0, 0, 80))
        shadow = shadow.filter(ImageFilter.GaussianBlur(self.shadow_blur))
        
        img = Image.alpha_composite(img, shadow)
        
        # Inner Window
        inner_container = Image.new("RGBA", (outer_width, outer_height), (0, 0, 0, 0))
        inner_draw = ImageDraw.Draw(inner_container)
        box_rect = [
            self.padding_outer, 
            self.padding_outer,
            self.padding_outer + inner_width,
            self.padding_outer + inner_height
        ]
        inner_draw.rounded_rectangle(box_rect, radius=12, fill=self.bg_inner)
        
        # Mac Buttons
        btn_radius = 6
        btn_y = self.padding_outer + self.padding_inner_y
        btn_x_start = self.padding_outer + self.padding_inner_x
        btn_spacing = 20
        colors = ["#FF5F56", "#FFBD2E", "#27C93F"]
        for i, color in enumerate(colors):
            x = btn_x_start + i * btn_spacing
            inner_draw.ellipse(
                (x - btn_radius, btn_y - btn_radius, x + btn_radius, btn_y + btn_radius),
                fill=color
            )
            
        img = Image.alpha_composite(img, inner_container)
        
        draw = ImageDraw.Draw(img)
        start_y = self.padding_outer + self.padding_inner_y + self.header_height
        start_x_num = self.padding_outer + self.padding_inner_x
        start_x_code = start_x_num + line_num_width
        
        # Line numbers
        for i in range(len(code_lines)):
            y = start_y + i * line_height
            num_str = str(i + 1)
            num_w = draw.textlength(num_str, font=font)
            num_x = start_x_code - dummy_draw.textlength("  ", font=font) - num_w
            draw.text((num_x, y), num_str, font=font, fill=self.line_num_color)

        # Code Syntax
        tokens = list(lex(code, lexer))
        current_x = start_x_code
        current_y = start_y
        
        for t_type, t_value in tokens:
            color = style.style_for_token(t_type).get('color') or 'F8F8F2'
            if not color.startswith('#'):
                color = f"#{color}"
                
            parts = t_value.split('\n')
            for i, part in enumerate(parts):
                if part:
                    draw.text((current_x, current_y), part, font=font, fill=color)
                    current_x += draw.textlength(part, font=font)
                
                if i < len(parts) - 1:
                    current_y += line_height
                    current_x = start_x_code

        filename = f"snapshot_{uuid.uuid4().hex}.png"
        path = os.path.join(OUTPUT_DIR, filename)
        
        final_img = Image.new("RGB", img.size, self.bg_outer)
        final_img.paste(img, (0, 0), img)
        final_img.save(path)
        
        return path

generator_instance = SnapshotGenerator()

def generate_image(code: str, language: str = None):
    try:
        return generator_instance.generate(code, language)
    except Exception as e:
        raise RuntimeError(f"Failed to generate image: {str(e)}")