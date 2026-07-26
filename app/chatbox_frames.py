
import textwrap
import unicodedata

DEFAULT_MAX_TOTAL_LENGTH = 144

_UNSAFE_TRAILING_CODEPOINTS = {"‍", "️"}


def safe_cut(text, length):
    if length <= 0:
        return ""
    cut = text[:length]
    while cut and (unicodedata.combining(cut[-1]) or cut[-1] in _UNSAFE_TRAILING_CODEPOINTS):
        cut = cut[:-1]
    return cut

FRAME_STYLES = {
    "none": {
        "name": "None",
        "description": "No frame, plain text",
        "top_left": "",
        "top_right": "",
        "bottom_left": "",
        "bottom_right": "",
        "horizontal": "",
        "vertical": "",
        "padding": False
    },
    "dots": {
        "name": "Dots",
        "description": "Simple dotted border",
        "top_left": ".",
        "top_right": ".",
        "bottom_left": ".",
        "bottom_right": ".",
        "horizontal": ".",
        "vertical": ".",
        "padding": True
    },
    "dashes": {
        "name": "Dashes",
        "description": "Clean dash border",
        "top_left": "+",
        "top_right": "+",
        "bottom_left": "+",
        "bottom_right": "+",
        "horizontal": "-",
        "vertical": "|",
        "padding": True
    },
    "equals": {
        "name": "Equals",
        "description": "Double line style",
        "top_left": "+",
        "top_right": "+",
        "bottom_left": "+",
        "bottom_right": "+",
        "horizontal": "=",
        "vertical": "|",
        "padding": True
    },
    "stars": {
        "name": "Stars",
        "description": "Decorative star border",
        "top_left": "*",
        "top_right": "*",
        "bottom_left": "*",
        "bottom_right": "*",
        "horizontal": "*",
        "vertical": "*",
        "padding": True
    },
    "hashtags": {
        "name": "Hashtags",
        "description": "Bold hashtag border",
        "top_left": "#",
        "top_right": "#",
        "bottom_left": "#",
        "bottom_right": "#",
        "horizontal": "#",
        "vertical": "#",
        "padding": True
    },
    "tildes": {
        "name": "Tildes",
        "description": "Wavy tilde border",
        "top_left": "~",
        "top_right": "~",
        "bottom_left": "~",
        "bottom_right": "~",
        "horizontal": "~",
        "vertical": "~",
        "padding": True
    },
    "minimal_top": {
        "name": "Minimal Top",
        "description": "Simple line above text",
        "top_left": "",
        "top_right": "",
        "bottom_left": "",
        "bottom_right": "",
        "horizontal": "-",
        "vertical": "",
        "top_only": True,
        "padding": False
    },
    "minimal_both": {
        "name": "Minimal Lines",
        "description": "Lines above and below",
        "top_left": "",
        "top_right": "",
        "bottom_left": "",
        "bottom_right": "",
        "horizontal": "-",
        "vertical": "",
        "top_only": False,
        "padding": False
    },
    "arrows": {
        "name": "Arrows",
        "description": "Arrow-style accents",
        "top_left": ">",
        "top_right": "<",
        "bottom_left": ">",
        "bottom_right": "<",
        "horizontal": "-",
        "vertical": "|",
        "padding": True
    },
    "brackets": {
        "name": "Brackets",
        "description": "Clean bracket style",
        "top_left": "[",
        "top_right": "]",
        "bottom_left": "[",
        "bottom_right": "]",
        "horizontal": "",
        "vertical": "",
        "bracket_mode": True,
        "padding": False
    },
    "parens": {
        "name": "Parentheses",
        "description": "Soft parentheses style",
        "top_left": "(",
        "top_right": ")",
        "bottom_left": "(",
        "bottom_right": ")",
        "horizontal": "",
        "vertical": "",
        "bracket_mode": True,
        "padding": False
    },
    "angle": {
        "name": "Angle Brackets",
        "description": "Sharp angle style",
        "top_left": "<",
        "top_right": ">",
        "bottom_left": "<",
        "bottom_right": ">",
        "horizontal": "",
        "vertical": "",
        "bracket_mode": True,
        "padding": False
    },
    "pipes": {
        "name": "Pipes",
        "description": "Vertical pipe style",
        "top_left": "|",
        "top_right": "|",
        "bottom_left": "|",
        "bottom_right": "|",
        "horizontal": "",
        "vertical": "",
        "bracket_mode": True,
        "padding": False
    },
    "emoji": {
        "name": "Emoji",
        "description": "Your chosen emoji on each end of every line",
        "top_left": "",
        "top_right": "",
        "bottom_left": "",
        "bottom_right": "",
        "horizontal": "",
        "vertical": "",
        "emoji_mode": True,
        "padding": False
    }
}


DEFAULT_FRAME_EMOJI = "✨"

CUSTOM_FRAME_MODES = {"box", "bracket", "minimal_top", "minimal_both", "emoji"}


def custom_style_from_definition(definition):
    definition = definition if isinstance(definition, dict) else {}
    mode = definition.get("mode", "box")
    if mode not in CUSTOM_FRAME_MODES:
        mode = "box"
    style = {
        "name": str(definition.get("name") or "Custom")[:40],
        "description": "Custom border",
        "top_left": str(definition.get("top_left", ""))[:6],
        "top_right": str(definition.get("top_right", ""))[:6],
        "bottom_left": str(definition.get("bottom_left", ""))[:6],
        "bottom_right": str(definition.get("bottom_right", ""))[:6],
        "horizontal": str(definition.get("horizontal", ""))[:6],
        "vertical": str(definition.get("vertical", ""))[:6],
        "padding": bool(definition.get("padding", True)),
    }
    if mode == "bracket":
        style["bracket_mode"] = True
    elif mode == "minimal_top":
        style["top_only"] = True
    elif mode == "minimal_both":
        style["top_only"] = False
    elif mode == "emoji":
        style["emoji_mode"] = True
        custom_emoji = str(definition.get("emoji", "")).strip()
        if custom_emoji:
            style["emoji_override"] = custom_emoji
    return style


def get_style(style_id, custom_frames=None):
    if custom_frames and style_id in custom_frames:
        return custom_style_from_definition(custom_frames[style_id])
    return FRAME_STYLES.get(style_id, FRAME_STYLES["none"])


def get_frame_styles(custom_frames=None):
    styles = [{"id": k, "name": v["name"], "description": v["description"]} for k, v in FRAME_STYLES.items()]
    for custom_id, definition in (custom_frames or {}).items():
        styles.append({
            "id": custom_id,
            "name": str((definition or {}).get("name") or "Custom"),
            "description": "Your custom border",
            "custom": True,
        })
    return styles


def get_longest_line_length(text):
    lines = text.split('\n')
    return max(len(line) for line in lines) if lines else 0


def truncate_line(line, max_width):
    if max_width <= 0:
        return ""
    if len(line) <= max_width:
        return line
    if max_width <= 3:
        return safe_cut(line, max_width)
    return safe_cut(line, max_width - 3) + "..."


def _fit_to_budget(build_fn, lines, max_width, max_total_length):
    line_list = list(lines) if lines else [""]
    width = max(min(max_width, 40), 1)

    for w in range(width, 0, -1):
        result = build_fn(w, line_list)
        if len(result) <= max_total_length:
            return result

    while len(line_list) > 1:
        line_list = line_list[:-1]
        for w in range(width, 0, -1):
            result = build_fn(w, line_list)
            if len(result) <= max_total_length:
                return result

    result = build_fn(1, line_list[:1])
    return safe_cut(result, max_total_length) if len(result) > max_total_length else result


def apply_frame(text, style_id, max_total_length=DEFAULT_MAX_TOTAL_LENGTH, width=None, emoji=DEFAULT_FRAME_EMOJI, line_fit=None, custom_frames=None):
    if not text or not text.strip():
        return text

    style = get_style(style_id, custom_frames)

    if style_id == "none":
        return safe_cut(text, max_total_length)

    lines = text.split('\n')
    preferred_width = width if width is not None else get_longest_line_length(text)
    preferred_width = min(preferred_width, 40)

    if style.get("emoji_mode"):
        return apply_emoji_frame(lines, style.get("emoji_override") or emoji, preferred_width, max_total_length, line_fit=line_fit)

    if style.get("bracket_mode"):
        return apply_bracket_frame(lines, style, preferred_width, max_total_length, line_fit=line_fit)

    if style.get("top_only") is not None:
        return apply_minimal_frame(lines, style, preferred_width, max_total_length, line_fit=line_fit)

    return apply_box_frame(lines, style, preferred_width, max_total_length, line_fit=line_fit)


def _fit_line(line, w, line_fit=None):
    if line_fit is not None:
        return line_fit(line, w)
    return truncate_line(line, w).ljust(w)


def apply_emoji_frame(lines, emoji, width, max_total_length=DEFAULT_MAX_TOTAL_LENGTH, line_fit=None):
    emoji = (emoji or DEFAULT_FRAME_EMOJI).strip() or DEFAULT_FRAME_EMOJI

    def build(w, line_list):
        return '\n'.join(f"{emoji} {_fit_line(line, w, line_fit)} {emoji}" for line in line_list)

    return _fit_to_budget(build, lines, width, max_total_length)


def apply_box_frame(lines, style, width, max_total_length=DEFAULT_MAX_TOTAL_LENGTH, line_fit=None):
    tl, tr = style["top_left"], style["top_right"]
    bl, br = style["bottom_left"], style["bottom_right"]
    h, v = style["horizontal"], style["vertical"]
    padding = style["padding"]

    def build(w, line_list):
        inner_width = w + 2
        top_line = tl + (h * inner_width) + tr
        bottom_line = bl + (h * inner_width) + br
        body = []
        for line in line_list:
            padded = _fit_line(line, w, line_fit)
            if padding:
                body.append(f"{v} {padded} {v}")
            else:
                body.append(f"{v}{padded}{v}")
        return '\n'.join([top_line] + body + [bottom_line])

    return _fit_to_budget(build, lines, width, max_total_length)


def apply_minimal_frame(lines, style, width, max_total_length=DEFAULT_MAX_TOTAL_LENGTH, line_fit=None):
    h = style["horizontal"]
    top_only = style.get("top_only", False)

    def build(w, line_list):
        line_str = h * (w + 4)
        parts = [line_str] + [f"  {_fit_line(line, w, line_fit)}  " for line in line_list]
        if not top_only:
            parts.append(line_str)
        return '\n'.join(parts)

    return _fit_to_budget(build, lines, width, max_total_length)


def apply_bracket_frame(lines, style, width=40, max_total_length=DEFAULT_MAX_TOTAL_LENGTH, line_fit=None):
    tl, tr = style["top_left"], style["top_right"]

    def build(w, line_list):
        return '\n'.join(f"{tl}{_fit_line(line, w, line_fit)}{tr}" for line in line_list)

    return _fit_to_budget(build, lines, width, max_total_length)


def get_frame_preview(style_id, max_total_length=DEFAULT_MAX_TOTAL_LENGTH, emoji=DEFAULT_FRAME_EMOJI, custom_frames=None):
    sample_text = "Hello World\n12:00 PM"
    return apply_frame(sample_text, style_id, max_total_length=max_total_length, emoji=emoji, custom_frames=custom_frames)


def _frame_total_length(style, width, lines, emoji=DEFAULT_FRAME_EMOJI):
    if lines <= 0:
        return 0
    if style.get("emoji_mode"):
        effective_emoji = style.get("emoji_override") or emoji
        per_line = 2 * len(effective_emoji or DEFAULT_FRAME_EMOJI) + 2 + width
        return lines * per_line + (lines - 1)
    if style.get("bracket_mode"):
        tl, tr = style["top_left"], style["top_right"]
        per_line = len(tl) + width + len(tr)
        return lines * per_line + (lines - 1)

    if style.get("top_only") is not None:
        h = style["horizontal"]
        border_len = len(h) * (width + 4)
        num_borders = 1 if style.get("top_only") else 2
        body_len = width + 4
        total_parts = num_borders + lines
        return num_borders * border_len + lines * body_len + (total_parts - 1)

    tl, tr = style["top_left"], style["top_right"]
    bl, br = style["bottom_left"], style["bottom_right"]
    h, v = style["horizontal"], style["vertical"]
    padding = style["padding"]
    inner_width = width + 2
    top_len = len(tl) + len(h) * inner_width + len(tr)
    bottom_len = len(bl) + len(h) * inner_width + len(br)
    content_len = 2 * len(v) + width + (2 if padding else 0)
    total_parts = 2 + lines
    return top_len + bottom_len + lines * content_len + (total_parts - 1)


def plan_frame_capacity(style_id, max_total_length=DEFAULT_MAX_TOTAL_LENGTH, min_width=14, max_width=40, emoji=DEFAULT_FRAME_EMOJI, custom_frames=None):
    is_known = style_id in FRAME_STYLES or (custom_frames and style_id in custom_frames)
    style = get_style(style_id, custom_frames)
    if style_id == "none" or not style or not is_known:
        return max_width, 6

    best_width, best_lines, best_capacity = min_width, 1, 0
    for width in range(max_width, min_width - 1, -1):
        lines = 0
        while _frame_total_length(style, width, lines + 1, emoji) <= max_total_length:
            lines += 1
        if lines >= 1:
            capacity = width * lines
            if capacity > best_capacity:
                best_capacity = capacity
                best_width, best_lines = width, lines

    return best_width, max(best_lines, 1)


def wrap_for_frame(text, width):
    if width <= 0:
        return text
    lines = []
    for paragraph in str(text or "").split('\n'):
        if not paragraph.strip():
            lines.append("")
            continue
        wrapped = textwrap.wrap(paragraph, width=width, break_long_words=True, break_on_hyphens=False)
        lines.extend(wrapped if wrapped else [""])
    return '\n'.join(lines)


def chunk_lines(text, lines_per_chunk):
    lines = str(text or "").split('\n')
    lines_per_chunk = max(lines_per_chunk, 1)
    chunks = ['\n'.join(lines[i:i + lines_per_chunk]) for i in range(0, len(lines), lines_per_chunk)]
    return chunks or [""]


def paginate_text(text, max_total_length=DEFAULT_MAX_TOTAL_LENGTH):
    text = str(text or "")
    if not text:
        return [""]
    if len(text) <= max_total_length:
        return [text]

    pages = []
    current = ""

    def flush():
        nonlocal current
        if current:
            pages.append(current)
            current = ""

    for line in text.split('\n'):
        while len(line) > max_total_length:
            flush()
            cut = line.rfind(' ', 0, max_total_length)
            if cut <= 0:
                cut = max_total_length
            pages.append(safe_cut(line, cut).rstrip())
            line = line[cut:].lstrip()

        candidate = f"{current}\n{line}" if current else line
        if len(candidate) <= max_total_length:
            current = candidate
        else:
            flush()
            current = line

    flush()
    return pages or [""]
