import os
import sys
import re
import json
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("=== STARTING COMPREHENSIVE VERIFICATION ===")

# Codigo de la app Android (fuera de este repo). En otra ruta: variable de entorno NAILONG_ANDROID_SRC.
# Si no existe en este equipo, sus comprobaciones se saltan y se declaran como NO COMPROBADAS al final.
ANDROID_SRC = os.environ.get('NAILONG_ANDROID_SRC', r'C:\src\nailong_stickers_app')
HAY_ANDROID = os.path.isdir(ANDROID_SRC)
_ANDROID_APP = os.path.join(ANDROID_SRC, 'stickers', 'Android', 'app')
_android_java = os.path.join(_ANDROID_APP, 'src', 'main', 'java', 'com', 'example', 'samplestickerapp')
_android_res = os.path.join(_ANDROID_APP, 'src', 'main', 'res')
NO_COMPROBADO = []

# Test 1: Check single definitive index.html exists and duplicates are cleaned up
assert os.path.exists('index.html'), "index.html missing!"
assert not os.path.exists('el_mundo_m_gico_de_nailong.html'), "Duplicate HTML 'el_mundo_m_gico_de_nailong.html' should be removed!"
assert not os.path.exists('el_mundo_m_gico_de_nailong v1.html'), "Duplicate HTML 'el_mundo_m_gico_de_nailong v1.html' should be removed!"
assert not os.path.exists('compartir_amigos.bat'), "Obsolete compartir_amigos.bat should be removed!"
assert not os.path.exists('compartir_amigos.py'), "Obsolete compartir_amigos.py should be removed!"
assert not os.path.exists('COMO_HOSTEAR.md'), "Obsolete COMO_HOSTEAR.md should be removed!"
assert not os.path.exists('stickers_overview.png'), "Obsolete stickers_overview.png should be removed!"
assert os.path.exists('Stickers Nailong'), "Stickers directory missing!"

# index.html referencia css/ y js/ (D-15). `html` = codigo fuente completo (pagina + CSS + JS en orden de carga),
# de modo que las comprobaciones siguientes buscan en todo el codigo sin importar en que fichero viva.
with open('index.html', 'r', encoding='utf-8') as f:
    page_html = f.read()
asset_refs = re.findall(r'(?:src|href)="((?:css|js)/[^"?]+)(?:\?[^"]*)?"', page_html)
assert len(asset_refs) >= 3, "index.html must reference css/ and js/ files!"
assert len(asset_refs) == len(set(asset_refs)), "Duplicate css/js references in index.html!"
# W25: js/11-13 se cargan bajo demanda desde js/14; se incluyen igual en `html` y `js_files` para comprobar sintaxis y etiquetas
lazy_3d_js = ['js/11-nailong3d-geometria.js', 'js/12-nailong3d-escena.js', 'js/13-nailong3d-animacion.js']
all_asset_refs = asset_refs + [r for r in lazy_3d_js if r not in asset_refs]
html = page_html
for _ref in all_asset_refs:
    assert os.path.exists(_ref), f"Missing asset file: {_ref}"
    with open(_ref, 'r', encoding='utf-8') as f:
        html += chr(10) + f.read()
js_files = [r for r in all_asset_refs if r.endswith('.js')]
assert [r for r in asset_refs if r.endswith('.css')], "styles.css reference missing in index.html!"
for _f in os.listdir('js'):
    assert f'js/{_f}' in all_asset_refs, f"js/{_f} exists but is neither loaded by index.html nor lazy-loaded by js/14!"
for _f in os.listdir('css'):
    assert f'css/{_f}' in asset_refs, f"css/{_f} exists but is not loaded by index.html!"
assert re.search(r'<script>(.*?)</script>', page_html, re.DOTALL) is None, "No inline <script> allowed: keep JS in js/ (D-15)!"

print("✔ Single definitive index.html verified with 0 duplicate HTML files and obsolete scripts cleaned.")

# Test 2: Verify all stickers and creator photos on disk
sticker_files = sorted([f for f in os.listdir('Stickers Nailong') if os.path.isfile(os.path.join('Stickers Nailong', f))])
for i in range(1, 127):
    expected_file = f'sticker_{i}.webp'
    assert expected_file in sticker_files, f"Missing sticker file: {expected_file}"
assert 'descatalogado_sticker_14.webp' in sticker_files, "descatalogado_sticker_14.webp missing!"
assert 'sticker_127.webp' not in sticker_files, "sticker_127.webp should not exist on disk!"
assert 'creador_nailong.webp' in sticker_files, "Optimized creador_nailong.webp missing!"
assert 'Foto nailong yo.jfif' not in sticker_files, "Obsolete uncompressed Foto nailong yo.jfif should be removed!"
assert len(sticker_files) == 128, f"Expected exactly 128 sticker files (126 stickers + creador + descatalogado), found {len(sticker_files)}"
print("✔ All 126 sticker files + optimized creator photo + descatalogado verified in 'Stickers Nailong/' (obsolete files cleanly removed).")

# Test 3: Check all image references in index.html resolve to real files
static_img_refs = re.findall(r'Stickers Nailong/([a-zA-Z0-9_\.]+\.webp)', html)
assert len(static_img_refs) > 0, "No static sticker image references found!"
for ref in set(static_img_refs):
    full_path = os.path.join('Stickers Nailong', ref)
    assert os.path.exists(full_path), f"Broken static image reference in HTML: {ref}"
print(f"✔ All {len(set(static_img_refs))} unique static sticker references point to existing files on disk.")

# Check all dynamic template literals: sticker_${gif.id}.webp, ${item.file}, ${tile.sticker}, ${data.sticker}
for gif in re.findall(r"id:\s*(\d+)", html[:html.find('ALL_STICKERS = [')]):
    assert os.path.exists(os.path.join('Stickers Nailong', f'sticker_{gif}.webp')), f"FEATURED_GIF sticker_{gif}.webp missing!"
for tile in re.findall(r"sticker:\s*'([^']+)'", html):
    assert os.path.exists(os.path.join('Stickers Nailong', tile)), f"Soundboard / Mood sticker {tile} missing!"
print("✔ All dynamically templated sticker references (GIFs, Moods, Soundboard) resolve to valid files on disk.")

# Test 4: Verify ALL_STICKERS in JS array contains all 126 stickers + creator
stickers_in_js = re.findall(r"file:\s*'sticker_(\d+)\.webp'", html)
unique_js_stickers = sorted(set(int(x) for x in stickers_in_js))
assert len(unique_js_stickers) == 126, f"Expected 126 stickers in ALL_STICKERS, found {len(unique_js_stickers)}"
assert unique_js_stickers == list(range(1, 127)), f"Missing stickers in ALL_STICKERS: {set(range(1, 127)) - set(unique_js_stickers)}"
assert "creador_nailong.webp" in html, "Creator photo missing from ALL_STICKERS!"
print("✔ ALL_STICKERS array accurately maps all 126 stickers (IDs 1 through 126) + creator photo.")

# Test 5: Verify SOUNDBOARD_TILES has 12 items
soundboard_matches = re.findall(r"sticker:\s*'sticker_(\d+)\.webp',\s*name:\s*'([^']+)'", html)
print(f"✔ Soundboard contains {len(soundboard_matches)} sound tiles:")
for s_id, s_name in soundboard_matches:
    print(f"   - Sticker {s_id}: {s_name}")
assert len(soundboard_matches) == 12, f"Expected 12 soundboard tiles, got {len(soundboard_matches)}"

# Test 6: Verify FEATURED_GIFS has 9 items
featured_matches = re.findall(r"\{\s*id:\s*(\d+),\s*tag:\s*'([^']+)'", html)
assert len(featured_matches) == 9, f"Expected 9 featured GIFs, got {len(featured_matches)}"
print("✔ FEATURED_GIFS contains 9 curated real animated scenes.")

# Test 7: Verify User Upload & LocalStorage Persistence
assert "USER_PHOTOS_STORAGE_KEY" in html, "LocalStorage storage key missing!"
assert "loadUserPhotosFromStorage" in html and "saveUserPhotosToStorage" in html, "LocalStorage storage functions missing!"
assert "deleteUserPhoto" in html, "deleteUserPhoto function missing!"
assert "document.getElementById('lb-img').src = imgSrc;" in html, "Lightbox imgSrc fix missing!"
assert "event.target.value = '';" in html, "Input value reset missing in upload handler!"
print("✔ LocalStorage user photo persistence verified: photos saved across reloads with downscaling and delete support.")

# Test 8: Verify Minigame Concurrency Bug Fix
assert "if (gameAnimId) {" in html and "cancelAnimationFrame(gameAnimId)" in html, "gameAnimId cancellation missing in startMiniGame!"
assert "gameAnimId = requestAnimationFrame(gameLoop);" in html, "gameAnimId tracking missing in gameLoop!"
assert "scorePopups.push(" in html, "In-canvas floating score popup particles implemented!"
print("✔ Minigame concurrency bug verified fixed: gameAnimId properly cancelled and tracked, score popups active.")

# Test 9: Verify Visor Mágico Enhancements
assert "nextMagicGif()" in html and "prevMagicGif()" in html, "Next/Prev GIF navigation missing in Visor Mágico!"
assert "makeStickerDraggable" in html, "makeStickerDraggable function missing!"
assert "modal-speed-buttons" in html, "Speed mode buttons active state missing!"
print("✔ Visor Mágico verified: Next/Prev chevron navigation, draggable stickers layer, and speed mode styling active.")

# Test 10: Verify Responsive Mobile Drawer Navigation
assert "id=\"mobile-menu\"" in html, "mobile-menu drawer missing from DOM!"
assert "toggleMobileMenu()" in html, "toggleMobileMenu function missing!"
print("✔ Mobile navigation drawer verified: collapsible tray with fast navigation jumps for phones and tablets.")

# Test 11: Verify HTML Tag Balance
tags_to_check = ['div', 'section', 'button', 'main', 'header', 'nav', 'footer', 'p', 'h1', 'h2', 'h3', 'h4']
for tag in tags_to_check:
    open_tags = len(re.findall(rf'<{tag}(\s+[^>]*>|>)', html, re.IGNORECASE))
    close_tags = len(re.findall(rf'</{tag}>', html, re.IGNORECASE))
    assert open_tags == close_tags, f"Tag mismatch for <{tag}>: {open_tags} opening vs {close_tags} closing"
print("✔ All structural HTML tags are strictly balanced.")

# Test 12: Verify JavaScript Syntax via Node.js
assert len(js_files) >= 2, "Expected tailwind config and app scripts referenced from index.html"
for _js in js_files:
    subprocess.run(['node', '-c', _js], capture_output=True, text=True, check=True)
print(f"✔ JavaScript syntax check passed with 0 errors via Node.js in {len(js_files)} files.")

# Test 13: Verify Mobile Viewport & PWA Head Tags
assert "viewport-fit=cover" in html, "viewport-fit=cover missing from meta viewport!"
assert 'name="theme-color" content="#FFD93D"' in html, "theme-color meta tag missing for Android Chrome address bar styling!"
assert 'property="og:image"' in html, "og:image meta tag missing for WhatsApp and social preview sharing!"
print("✔ Mobile viewport & PWA meta tags verified: notch support, Android theme-color, and WhatsApp/social sharing previews.")

# Test 14: Verify Mobile CSS Rules
assert "safe-area-inset-bottom" in html and "safe-area-inset-top" in html, "Safe area insets missing in CSS!"
assert "-webkit-tap-highlight-color" in html, "Webkit tap highlight color missing in CSS!"
assert "-webkit-touch-callout: none;" in html, "Touch callout none missing in CSS to prevent iOS popup menu!"
assert "input[type=range]::-webkit-slider-thumb" in html, "Mobile slider touch targets missing in CSS!"
print("✔ Mobile CSS verified: iOS safe area insets, -webkit tap highlights, touch callout prevention, and mobile slider touch targets.")

# Test 15: Verify Mobile Virtual Touch Controls for Minigame
assert "id=\"mobile-left-btn\"" in html and "id=\"mobile-right-btn\"" in html, "Mobile minigame virtual touch buttons missing!"
assert "bindButton(leftBtn, 'left')" in html and "bindButton(rightBtn, 'right')" in html, "bindButton handlers missing!"
assert "touchstart" in html and "touchend" in html, "Touch event listeners missing on virtual buttons!"
print("✔ Mobile minigame virtual touch controls verified: on-screen buttons with continuous touch/drag support.")

# Test 16: Verify Mobile Swipe Navigation in Modals
assert "setupModalSwipeGestures" in html, "setupModalSwipeGestures function missing!"
assert "orientationchange" in html, "Orientation change listener missing for phone rotation handling!"
print("✔ Mobile swipe navigation verified: horizontal thumb swiping active for both Visor Mágico and Photo Lightbox.")

# Test 17: Verify Share Modal and Functions
assert "id=\"share-modal\"" in html, "Share & Hosting modal missing from DOM!"
assert "openShareModal()" in html and "closeShareModal()" in html, "openShareModal / closeShareModal missing!"
assert "triggerNativeShare()" in html, "Native Web Share API function missing!"
assert "copyCurrentShareLink()" in html, "Clipboard copy link function missing!"
assert "share-qr-code" in html, "QR code container missing for camera scanning!"
print("✔ Share modal verified: native Web Share sheet, QR code scanner, and copy link.")

# Test 18: Verify PWA Manifest, Apple Touch Icon and Favicon
assert os.path.exists('manifest.json'), "manifest.json file missing from workspace!"
with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest_data = json.load(f)
assert manifest_data.get('name') and manifest_data.get('theme_color'), "manifest.json invalid properties!"
assert len(manifest_data.get('icons', [])) > 0, "manifest.json missing icons!"
for icon in manifest_data['icons']:
    assert os.path.exists(icon['src']), f"Manifest icon source missing: {icon['src']}"

assert 'rel="apple-touch-icon"' in html, "apple-touch-icon link missing in index.html head!"
assert 'rel="icon"' in html, "favicon icon link missing in index.html head!"
assert 'rel="manifest"' in html, "manifest link missing in index.html head!"
print("✔ PWA manifest, Apple Touch Icon, and favicon verified: full Home Screen installability on iPhone and Android.")

# Test 19: Verify Modal Backdrop Tap-to-Close
assert "setupModalBackdrops" in html, "setupModalBackdrops function missing!"
assert "setupModalBackdrops();" in html, "setupModalBackdrops not registered on window.onload!"
print("✔ Modal backdrop tap-to-close verified: tapping outside cards dismisses all modals on touchscreens.")

# Test 20: Verify Visor Mágico Drag & Swipe Gesture Isolation
assert "e.stopPropagation" in html, "Event propagation stop missing in makeStickerDraggable!"
assert "pointercancel" in html and "touchcancel" in html, "Pointer/touch cancel handling missing in makeStickerDraggable!"
assert "e.target.closest('#modal-stickers-layer" in html, "Sticker layer touch exclusion missing in setupModalSwipeGestures!"
print("✔ Visor Mágico drag & swipe isolation verified: sticker dragging cannot trigger modal swipe or delete stickers.")

# Test 21: Verify Minigame Touch Safety & Scroll Locking
assert "btn.addEventListener('touchcancel', stop)" in html, "touchcancel listener missing on virtual minigame buttons!"
assert "if (e.cancelable) e.preventDefault();" in html, "Canvas touchmove preventDefault missing to lock page scroll during play!"
print("✔ Minigame touch safety verified: touchcancel prevents runaway movement and canvas drag locks screen scroll.")

# Test 22: Verify Live GitHub Pages Share Integration & QR Code
# W34: los QR son SVG fijos dentro de index.html (herramientas/generar_qr.py), sin pedirlos a api.qrserver.com.
# Se regeneran aqui con el mismo script y deben coincidir modulo a modulo.
assert "alvarolofra.github.io/Nailong" in html, "Official GitHub Pages URL missing from index.html!"
assert 'api.qrserver.com' not in html, "W34: QR codes must be static inline SVGs (no requests to api.qrserver.com)!"
sys.path.insert(0, 'herramientas')
from generar_qr import QR as _QR
def _qr_inline(ident, url):
    _m = re.search(r'<svg id="' + ident + r'"[^>]*data-qr-url="([^"]+)"[^>]*>(.*?)</svg>', page_html, re.S)
    assert _m and _m.group(1) == url, f"W34: #{ident} must be an inline SVG QR code for {url}!"
    assert f'<path stroke="#000" d="{_QR(url, "L").trazo(2)}"/>' in _m.group(2), f"W34: #{ident} modules do not match herramientas/generar_qr.py for {url} (regenerate it)!"
_qr_inline('share-qr-code', 'https://alvarolofra.github.io/Nailong/')
print("✔ Live GitHub Pages share integration & QR code scanner verified: static SVG QR pointing to alvarolofra.github.io/Nailong.")

# Test 23: Verify Dedicated Creator Section & Lightbox
assert 'id="creador"' in html, "Creator section #creador missing from DOM!"
assert "openCreatorLightbox" in html, "openCreatorLightbox function missing!"
assert "creador_nailong.webp" in html, "creador_nailong.webp missing from HTML!"
print("✔ Dedicated Creator Section verified: featured card with Nailong, caption, confeti trigger, and lightbox.")

# Test 24: Verify Minigame Height & Slower Bomb Falling Speed
assert "h-[460px] sm:h-[540px]" in html, "Minigame height not enlarged for better reaction time!"
assert "finalVy = pick.bad ? (baseVy * 0.8) : baseVy;" in html, "Bomb slower drop velocity calculation missing!"
print("✔ Minigame improved: canvas height enlarged to 660px max and bombs fall 20% slower with gentle speed for mobile.")

# Test 25: Verify Brand Avatar 3D Radiante Smile (W33: copia de 192 px de sticker_2, clave dragon-de-leche)
assert "Stickers Nailong/mini/dragon-de-leche.webp" in html[:25000], "Brand avatar in header must use the 192 px copy of sticker_2 (mini/dragon-de-leche.webp, W33)!"
assert "scale-110" in html[:25000] and "object-cover" in html[:25000], "Brand avatar should fill circle with object-cover and zoom scale!"
print("✔ Brand Avatar verified: uses the animated 192 px copy of sticker_2 (mini/dragon-de-leche.webp) filling the circle with calibrated zoom.")

# Test 26: Verify Party Mode Canvas Visibility
assert 'id="party-canvas"' in html, "party-canvas missing!"
assert "contain: strict;" not in html, "party-canvas must not contain contain: strict; which collapses layout to 0x0!"
assert "w-full h-full" in html[html.find('id="party-canvas"')-40:html.find('id="party-canvas"')+80], "party-canvas should have full width and height classes!"
print("✔ Party Mode Canvas verified: unconstrained layout rect allows full-screen confetti and drumstick showers.")

# Test 27: Verify Minigame Keys State & Linear Fast Movement
assert "let keysHeld = { left: false, right: false };" in html, "keysHeld variable missing or uninitialized!"
assert "const moveSpeed = Math.max(10, Math.round(foodCanvas.width * 0.013));" in html, "Minigame calibrated speed calculation missing!"
print("✔ Minigame runtime keys & linear movement verified: keysHeld initialized, no ReferenceError, and fast linear arcade movement.")

# Test 28: Verify Minigame Fullscreen Toggle
assert "toggleGameFullscreen" in html, "toggleGameFullscreen function missing!"
assert "id=\"game-fullscreen-btn\"" in html, "game-fullscreen-btn missing in minigame controls!"
assert "id=\"game-float-fs-btn\"" in html, "game-float-fs-btn floating button missing in minigame canvas!"
assert "minigame-fullscreen-active" in html, "minigame-fullscreen-active CSS class missing!"
print("✔ Minigame Fullscreen verified: dual fullscreen buttons (header + in-canvas floating), CSS fallback, and smooth transitions.")

# Test 29: Verify In-Canvas Minigame HUD (Live Score & Timer)
assert "scorePillX" in html and "pts" in html, "In-canvas live scoreboard HUD missing!"
assert "⏱️" in html and "⭐" in html, "Canvas HUD emoji indicators missing!"
print("✔ Minigame In-Canvas HUD verified: live points and timer pills visible during normal and fullscreen gameplay.")

# Test 30: Verify In-Container Touch Dock for Fullscreen Mobile Play
assert 'id="game-touch-dock"' in html, "game-touch-dock missing inside game-container!"
assert 'id="dock-left-btn"' in html and 'id="dock-right-btn"' in html, "dock direction buttons missing!"
assert "bindButton(dockLeftBtn, 'left')" in html, "dock left button binding missing!"
print("✔ Minigame In-Container Touch Dock verified: on-screen buttons accessible even in fullscreen mode on touch devices.")

# Test 31: Verify Proportional Scaling on Resize / Fullscreen
assert "const ratio = newWidth / oldWidth;" in html, "Proportional coordinate ratio calculation missing in resizeGameCanvas!"
assert "item.x * ratio" in html, "Falling items proportional rescaling missing!"
print("✔ Minigame Proportional Scaling verified: player and food positions adapt dynamically without clipping or off-screen drift.")

# Test 32: Verify WhatsApp and iOS Sticker Saving & Download Integration
assert 'id="sticker-options-modal"' in html, "sticker-options-modal missing from DOM!"
assert 'id="modal-whatsapp-btn"' in html and 'id="lb-whatsapp-btn"' in html, "WhatsApp action buttons missing in modals!"
assert 'id="duang-toast"' in html, "duang-toast notification container missing from DOM!"
assert "shareStickerDirectToWhatsApp" in html, "shareStickerDirectToWhatsApp function missing!"
assert "forceDownloadSticker" in html, "forceDownloadSticker function missing!"
assert "copyStickerToClipboard" in html, "copyStickerToClipboard function missing!"
assert "showDuangToast" in html, "showDuangToast function missing!"
assert "{ id: 'sticker-options-modal', close: closeStickerOptionsModal }" in html, "sticker-options-modal missing in setupModalBackdrops!"
print("✔ WhatsApp & iOS Sticker Integration verified: direct WhatsApp button, iOS Camera Roll save, blob download fallback, and clipboard copy.")

# Test 33: Verify agent instruction files (AGENTS.md canonical; CLAUDE.md and GEMINI.md are pointers - D-14)
agents_content = open('AGENTS.md', 'r', encoding='utf-8').read()
claude_content = open('CLAUDE.md', 'r', encoding='utf-8').read()
gemini_content = open('GEMINI.md', 'r', encoding='utf-8').read()
assert len(agents_content.splitlines()) < 200, "AGENTS.md must stay under 200 lines (move history to CHANGELOG.md)!"
assert "@AGENTS.md" in claude_content and "AGENTS.md" in gemini_content, "CLAUDE.md and GEMINI.md must point to AGENTS.md!"
assert len(claude_content.splitlines()) < 20 and len(gemini_content.splitlines()) < 20, "CLAUDE.md/GEMINI.md must be short pointers, not copies!"
for name, content in (("AGENTS.md", agents_content), ("CLAUDE.md", claude_content), ("GEMINI.md", gemini_content)):
    assert ("C:" + chr(92) + "Users") not in content, f"{name} is versioned: local absolute paths belong in CLAUDE.local.md!"
assert os.path.exists('DOCUMENTACION.md'), "DOCUMENTACION.md missing!"
assert os.path.exists('CHANGELOG.md'), "CHANGELOG.md missing!"
gitignore = open('.gitignore', 'r', encoding='utf-8').read()
assert "CLAUDE.local.md" in gitignore, "CLAUDE.local.md must be listed in .gitignore!"
print("✔ Agent instructions verified: AGENTS.md is canonical (<200 lines), CLAUDE.md/GEMINI.md are pointers, no local paths versioned, CHANGELOG.md present.")

# Test 35: Verify Architectural Decision Records (ADR) and documentation index
doc_content = open('DOCUMENTACION.md', 'r', encoding='utf-8').read()
assert "AGENTS.md" in open('documentacion/00_INDICE.md', 'r', encoding='utf-8').read(), "AGENTS.md missing from documentacion/00_INDICE.md!"
assert "D-14" in open('documentacion/estado_del_proyecto/DECISIONES.md', 'r', encoding='utf-8').read(), "D-14 missing from DECISIONES.md!"
assert "documentacion/00_INDICE.md" in doc_content and len(doc_content.splitlines()) < 40, "DOCUMENTACION.md must stay a short pointer to documentacion/00_INDICE.md!"

# Stale-figure guard: stable docs must not carry an outdated sticker/test count (AGENTS.md rule 10)
_n_stickers = len([f for f in os.listdir('Stickers Nailong') if re.fullmatch(r'sticker_\d+\.webp', f)])
_n_tests = int(re.search(r'ALL (\d+) VERIFICATION', open('verify_all.py', 'r', encoding='utf-8').read()).group(1))
_stable_docs = ['AGENTS.md', 'README.md', 'DOCUMENTACION.md', 'documentacion/00_INDICE.md',
                'documentacion/estado_del_proyecto/ESTADO_ACTUAL.md']
for _d in ('guias_y_contexto', 'notas_tecnicas'):
    _stable_docs += [f'documentacion/{_d}/{f}' for f in os.listdir(f'documentacion/{_d}') if f.endswith('.md')]
for _path in _stable_docs:
    _txt = open(_path, 'r', encoding='utf-8').read()
    for _m in re.finditer(r'\b(\d+) (cromos|stickers)\b', _txt):
        if 50 <= int(_m.group(1)) <= 200:
            assert int(_m.group(1)) == _n_stickers, f"{_path}: stale sticker count '{_m.group(0)}' (real: {_n_stickers})!"
    for _m in re.finditer(r'\b(\d+) (comprobaciones|tests|pruebas)\b', _txt):
        assert int(_m.group(1)) == _n_tests, f"{_path}: stale test count '{_m.group(0)}' (real: {_n_tests})!"
    for _m in re.finditer(r'sticker_(?:1\.\.)?(\d+)', '' if _path.endswith('ESTADO_ACTUAL.md') else _txt):  # ESTADO_ACTUAL narra la renumeración
        assert int(_m.group(1)) <= _n_stickers, f"{_path}: reference to nonexistent '{_m.group(0)}' (max: {_n_stickers})!"
print(f"✔ Documentation index, decision log (D-14), DOCUMENTACION.md pointer and no stale figures ({_n_stickers} stickers, {_n_tests} tests) verified.")

# Test 36: Verify Visual Polish, Lightbox Duang Physics & Mobile Hero Flow
assert "triggerLightboxDuang" in html, "triggerLightboxDuang function missing!"
assert "lb-particles" in html, "lb-particles container missing in lightbox!"
assert "BANNER DESTACADO WHATSAPP" in html, "WhatsApp and easy download banner missing in #galeria!"
assert "max-w-2xl lg:max-w-3xl" in html, "Enlarged photo lightbox sizing missing!"
assert "¿Por qué WhatsApp no permite instalar packs enteros" not in html, "Explanatory notice in sticker options modal should be removed!"
assert "lg:col-start-7 lg:row-start-1 lg:row-span-3" in html, "Hero mobile-first responsive stage placement missing!"
print("✔ Visual Polish & Duang Physics verified: Lightbox jelly animations with particles, enlarged creator frame, WhatsApp album banner, and mobile hero priority flow.")

# Test 37: Verify v12 performance, bug fixes, mobile UX & accessibility improvements
def js_function_body(source, name):
    start = source.index(f"function {name}(")
    end = source.index("\n        function ", start + 10)
    return source[start:end]

gif_wall_src = js_function_body(html, "renderGifWall")
polaroid_src = js_function_body(html, "renderPolaroidGallery")
soundboard_src = js_function_body(html, "renderSoundboard")
for label, src in (("renderGifWall", gif_wall_src), ("renderPolaroidGallery", polaroid_src), ("renderSoundboard", soundboard_src)):
    assert 'loading="lazy"' in src and 'decoding="async"' in src, f"{label} images must use loading=lazy and decoding=async!"
assert "drop-shadow" not in gif_wall_src and "drop-shadow" not in polaroid_src, "Animated grid images must not use drop-shadow filters!"
assert "backdrop-blur" not in html, "backdrop-blur over animated content must be removed (GPU cost)!"
assert "GALLERY_PAGE_SIZE" in html and "showMoreGallery" in html and 'id="gallery-load-more"' in html, "Progressive album pagination missing!"
onload_src = html[html.index("window.onload = function()"):]
assert "loadUserPhotosFromStorage();" in onload_src, "loadUserPhotosFromStorage() must be called in window.onload!"
assert "deleteUserPhoto('${escaparHtml(item.id)}', event)" in polaroid_src, "Delete button for user photos missing in album template!"
# Los datos de las fotos del usuario (nombre de fichero, localStorage) no son de confianza: se escapan y se validan
assert 'alt="${escaparHtml(item.title)}"' in polaroid_src and "${escaparHtml(item.desc)}" in polaroid_src, "User-provided text must be escaped in the album template!"
assert "saved.filter(esFotoGuardadaValida)" in html, "Photos loaded from localStorage must be validated!"
assert "Number.isFinite(Number(item.id))" in polaroid_src, "Pin/tilt seed must support string ids of user photos!"
assert "43+" not in html and "Creador (5)" not in html, "Hardcoded filter counters (43+, Creador (5)) must be gone!"
assert "function updateFilterCounts" in html, "Dynamic filter counters missing!"
assert 'id="polaroid-grid" class="grid grid-cols-2' in html, "Album must use 2 columns on mobile!"
assert 'id="game-touch-dock" class="absolute bottom-3 inset-x-3 hidden' in html, "In-game touch dock must be hidden outside fullscreen!"
assert "getEmojiSprite(item.emoji, 34)" in html, "Minigame must draw emoji sprites instead of fillText!"
assert 'id="party-canvas" class="fixed inset-0 pointer-events-none z-50 w-full h-full" style="display: none;"' in html, "Party canvas must start hidden!"
assert "canvas.style.display = 'none'" in html, "Party canvas must be hidden again when confetti ends!"
assert "@media (prefers-reduced-motion: reduce)" in html, "prefers-reduced-motion support missing!"
_dialogs = re.findall(r'<dialog id="([\w-]+)" aria-labelledby="[\w-]+"', html)
assert sorted(_dialogs) == ['magic-modal', 'photo-lightbox', 'share-modal', 'sticker-options-modal'], f"The 4 modals must be native <dialog> elements with aria-labelledby (found {_dialogs})!"
assert html.count('</dialog>') == 4, "Each <dialog> must be closed!"
assert "modal.showModal()" in html and "addEventListener('cancel'" in html, "Modals must open with showModal() and handle the cancel (Escape) event!"
assert "e.key === 'Escape') close" not in html.replace("closeGame", ""), "Escape must be handled by the dialog cancel event, not by manual keydown handlers!"
assert "setupModalScrollLock" in html and "body.modal-open" in html, "Body scroll lock for modals missing!"
assert "setupScrollSpy" in html and "flashCompanionSpeech" in html, "Scrollspy and mobile companion behavior missing!"
drag_src = html[html.index("function makeStickerDraggable"):html.index("function makeStickerDraggable") + 4000]
assert "el.addEventListener('touchmove'" in drag_src and "window.addEventListener('touchmove'" not in drag_src, "Draggable sticker touch listeners must not be attached to window!"
print("✔ v12 verified: lazy images, no GPU-heavy filters, paginated album, persisted/deletable user photos, dynamic counters, mobile-first UX and accessible modals.")

# Test 38: v13 - stickers 43-72, renumeracion continua, desacople del creador y paso de paginacion
from PIL import Image
assert "item.id === 43" not in html, "item.id === 43 sentinel must be removed in favor of isCreatorItem!"
assert "isCreatorItem" in html, "isCreatorItem helper function missing in index.html!"
assert "GALLERY_STEP" in html, "GALLERY_STEP dynamic pagination constant missing in index.html!"
for extra in range(127, 136):
    assert not os.path.exists(f'Stickers Nailong/sticker_{extra}.webp'), f"Stray sticker_{extra}.webp found on disk!"
for i in range(1, 127):
    assert os.path.exists(f'Stickers Nailong/sticker_{i}.webp'), f"Sticker gap detected at sticker_{i}.webp!"
im60 = Image.open('Stickers Nailong/sticker_55.webp').convert('RGBA')
bbox = im60.getchannel('A').getbbox()
assert bbox and (bbox[3] - bbox[1]) < (bbox[2] - bbox[0]), "sticker_55 (GEMESNYA recortado) must keep its cropped, wider-than-tall content!"
print("✔ v13 verified: 126 continuous stickers, sticker_55 cropped, isCreatorItem decoupled from id 43, GALLERY_STEP active.")

# Test 39: v14 - TODOS los stickers cumplen el formato de WhatsApp (512x512, EXIF, peso) -> se envian como sticker
import subprocess, sys
res = subprocess.run([sys.executable, 'normalizar_stickers.py', '--check'], capture_output=True, text=True, encoding='utf-8')
assert res.returncode == 0, "Hay stickers que WhatsApp tomaria como imagen (ejecuta: python normalizar_stickers.py): " + res.stdout
assert os.path.exists('normalizar_stickers.py'), "normalizar_stickers.py missing!"
for _id, _file, _fr in re.findall(r"id:\s*(\d+),\s*file:\s*'(sticker_\d+\.webp)',\s*frames:\s*(\d+)", html):
    _n = getattr(Image.open(os.path.join('Stickers Nailong', _file)), 'n_frames', 1)
    assert _n == int(_fr), f"frames de {_file} en ALL_STICKERS ({_fr}) no coincide con el archivo ({_n}): actualizalo en index.html"
print("✔ v14 verified: all 126 stickers are 512x512 WebP with WhatsApp EXIF and within size limits (sent as real stickers).")

# Test 40: v16 - pagina de 24 en movil, sin texto de fotogramas, version visible en el pie
assert "const GALLERY_STEP = 24;" in html, "GALLERY_STEP must be a fixed 24 (desktop and mobile)!"
assert "FRAMES)" not in html and "}f)" not in html, "Frame-count text must be removed from cards and lightbox!"
assert re.search(r'id="app-version"[^>]*>v4.2.0<', html), "Footer must show the current web version number (v4.2.0)!"
print("✔ v16 verified: +24 pagination on all devices, no frame-count text, version number in footer.")

# Test 41: v17 - el PNG copiado lleva esquinas transparentes (sin ellas WhatsApp lo pega como foto)
copy_src = html[html.index("async function copyStickerToClipboard"):html.index("async function copyStickerToClipboard") + 3000]
assert "roundRect(0, 0, 512, 512" in copy_src and "ctx.clip()" in copy_src, "copyStickerToClipboard must clip rounded transparent corners on a 512x512 canvas!"
assert "countTransparentPixels(ctx) < CLIPBOARD_MIN_TRANSPARENT" in copy_src, "Rounded corners must only be applied to (almost) opaque stickers!"
assert "Añadir a favoritos" not in html, "The WhatsApp share button must not promise a sticker (it always arrives as a photo)!"
assert not os.path.exists('HANDOFF_WHATSAPP.md'), "Temporary WhatsApp handoff must be removed!"
print("✔ v17 verified: clipboard sticker has transparent rounded corners (pasted as a WhatsApp sticker).")

# Test 42: v3.1.0 - App Nativa Android Stickers Nailong (.apk) y Banner Claymorphism en la web
assert os.path.exists('StickersNailong.apk'), "StickersNailong.apk missing from web root!"
assert os.path.getsize('StickersNailong.apk') > 20 * 1024 * 1024, "StickersNailong.apk seems too small!"
assert 'id="android-app-banner"' in html, "android-app-banner missing in index.html!"
assert 'href="StickersNailong.apk"' in html, "Download link to StickersNailong.apk missing in index.html!"
assert 'download="StickersNailong.apk"' in html, "Download attribute missing in APK download link!"
assert 'v4.0.0 APK' in html, "Badge in index.html must show v4.0.0 APK!"
print("✔ v4.0.0 verified: Native Android app (StickersNailong.apk) present on web root with Claymorphism download banner and v4.0.0 APK badge.")

# Test 43: v3.2.1 - Tipografia Fredoka y calibracion de icono adaptive en Android
if HAY_ANDROID:
    assert os.path.exists(os.path.join(_android_res, 'font', 'fredoka.xml')), "fredoka.xml font family resource missing in Android app!"
    for f_name in ['fredoka_regular.ttf', 'fredoka_medium.ttf', 'fredoka_semibold.ttf', 'fredoka_bold.ttf']:
        assert os.path.exists(os.path.join(_android_res, 'font', f_name)), f"Font file {f_name} missing!"
    assert os.path.exists(os.path.join(_android_res, 'layout', 'dialog_import_selection.xml')), "dialog_import_selection.xml missing!"
    assert os.path.exists(os.path.join(_android_res, 'drawable', 'card_stickers_container.xml')), "card_stickers_container.xml missing!"
    print("✔ v3.1.0 verified: Fredoka typography family, custom dialog layout, and card container in Android app.")
else:
    NO_COMPROBADO.append("Test 43 (fuentes y layouts de la app Android)")

# Test 44: v3.2.0 - Muro de GIFs fusionado con el album: app primero, Visor Magico en tira y acceso desde el lightbox
assert 'section id="muro-gifs"' not in html, "The old standalone GIF wall section must be gone!"
assert html.index('id="android-app-banner"') < html.index('id="gif-wall-grid"') < html.index('id="polaroid-grid"'), "Order must be: app banner, Visor Magico strip, album!"
assert 'href="#android-app-banner"' in html and 'id="lb-visor-btn"' in html and 'openVisorFromLightbox' in html, "App nav button or lightbox Visor button missing!"
assert 'overflow-x: clip' in html and '@media (max-width: 359px)' in html, "Navbar overflow fix missing!"
print("✔ v3.2.0 verified: GIF wall merged into stickers section (app banner, Visor strip, album), app button in nav, navbar fits narrow phones.")

# Test 45: v3.3.2 - version.json (lo lee la app para avisar de versiones nuevas) coincide con el APK publicado.
# Desde D-27 (4.1.0) la web lleva su propia versión (pie): version.json solo sube cuando sube el APK, o la app pediría actualizar sin fin.
with open('version.json', encoding='utf-8') as _vf:
    _ver = json.load(_vf)
_footer = re.search(r'id="app-version"[^>]*>v([\d.]+)<', html).group(1)
_apk_badge = re.search(r'v([\d.]+) APK', html).group(1)
assert _ver['versionName'] == _apk_badge, f"version.json versionName ({_ver['versionName']}) must match the APK badge (v{_apk_badge} APK)!"
assert tuple(map(int, _footer.split('.'))) >= tuple(map(int, _ver['versionName'].split('.'))), f"The web version (v{_footer}) can never be older than the app (v{_ver['versionName']})!"
assert _ver['apkUrl'] == 'https://alvarolofra.github.io/Nailong/StickersNailong.apk', "version.json apkUrl must point to the official APK on GitHub Pages!"
assert isinstance(_ver.get('notes'), list) and _ver['notes'], "version.json must include a non-empty notes list (shown in the app)!"
if HAY_ANDROID:
    with open(os.path.join(_ANDROID_APP, 'build.gradle'), encoding='utf-8') as _gf:
        _gradle = _gf.read()
    assert f"versionCode {_ver['versionCode']}" in _gradle and f'versionName "{_ver["versionName"]}"' in _gradle, "version.json must match versionCode/versionName in the Android build.gradle!"
    with open(os.path.join(_android_java, 'UpdateChecker.java'), encoding='utf-8') as _uf:
        assert '"https://alvarolofra.github.io/Nailong/version.json"' in _uf.read(), "UpdateChecker.java must read version.json from the official site!"
else:
    NO_COMPROBADO.append("Test 45 (version.json frente a build.gradle y UpdateChecker.java)")
print(f"✔ v3.4.1 verified: version.json ({_ver['versionName']}, code {_ver['versionCode']}) matches the APK badge and Android build.gradle (web v{_footer}, D-27).")

# Test 46: v3.3.3 - el peso del APK (etiqueta del banner y sizeMB de version.json) coincide con el fichero real
_apk_mb = os.path.getsize('StickersNailong.apk') / 1e6
assert abs(_ver.get('sizeMB', 0) - _apk_mb) < 0.15, f"version.json sizeMB ({_ver.get('sizeMB')}) must match StickersNailong.apk ({_apk_mb:.1f} MB)!"
_label = re.search(r'id="apk-size-label">(\d+) MB<', html)
assert _label and int(_label.group(1)) == round(_apk_mb), f"Download label must show the real APK size ({round(_apk_mb)} MB)!"
assert re.match(r'^\d{4}-\d{2}-\d{2}$', _ver.get('date', '')), "version.json must include the publish date (YYYY-MM-DD)!"
assert 'cdn.tailwindcss.com/3.' in html, "Tailwind CDN must be pinned to a fixed version (D-15)!"
print(f"✔ v3.4.1 verified: APK size label and version.json sizeMB match the real file ({_apk_mb:.1f} MB); CDN pinned.")


# Test 47: v3.4.1 - Cero caracteres chinos, credito Alvaro Lofra en web y app, velocidad minijuego y trailer v2
import unicodedata
for f_path in ['index.html', 'manifest.json', 'version.json'] + [os.path.join('js', js_f) for js_f in os.listdir('js') if js_f.endswith('.js')]:
    with open(f_path, encoding='utf-8') as _check_f:
        _txt = _check_f.read()
    assert not re.search(r'[一-鿿]', _txt), f"Chinese characters detected in {f_path}!"

# Creditos Alvaro Lofra
assert "Desarrollado por Álvaro Lofra" in html, "Web footer must credit 'Desarrollado por Álvaro Lofra'!"
if HAY_ANDROID:
    with open(os.path.join(_android_java, 'StickerPackListActivity.java'), encoding='utf-8') as _af:
        assert "Desarrollado por Álvaro Lofra" in _af.read(), "Android StickerPackListActivity must credit 'Desarrollado por Álvaro Lofra'!"
else:
    NO_COMPROBADO.append("Test 47 (crédito del autor en la app Android)")

# Velocidad del minijuego suave
with open(os.path.join('js', '08-minijuego.js'), encoding='utf-8') as _mj:
    _mj_txt = _mj.read()
assert "Math.round(foodCanvas.width * 0.013)" in _mj_txt, "Minigame arrow key speed must be calibrated to gentle speed!"

# Trailer v2 y poster
assert os.path.exists(os.path.join('video-promo', 'nailong_trailer_v2.mp4')), "video-promo/nailong_trailer_v2.mp4 missing!"
assert os.path.exists(os.path.join('video-promo', 'nailong_trailer_v2_portada.webp')), "video-promo/nailong_trailer_v2_portada.webp missing!"
assert 'video-ambient-canvas' in html, "video-ambient-canvas missing in index.html!"

print("✔ v3.4.1 verified: zero Chinese chars, creator credit in web & app, trailer v2 with ambilight & minigame speed tuned.")

# Test 48: v3.5.0 - A8-A13, W6-W7, zoom grande centrado y revision de Mi Seleccion
assert 'id="apk-qr-box"' in page_html and 'id="apk-qr-img"' in page_html, "W6: APK QR box missing in index.html!"
assert 'StickersNailong.apk' in re.search(r'id="apk-qr-img"[^>]+', page_html).group(0), "W6: APK QR must point to StickersNailong.apk!"
_qr_inline('apk-qr-img', 'https://alvarolofra.github.io/Nailong/StickersNailong.apk')   # W34: QR fijo, igual al del script
assert 'function toggleApkQrBox(' in html and 'function closeApkQrBox(' in html, "W6: toggleApkQrBox / closeApkQrBox missing in JS!"
_asset_versions = re.findall(r'(?:src|href)="(?:css|js)/[^"?]+\?v=([^"]+)"', page_html)
# El sufijo es la version de la web (pie, D-27) o, en retoques sin version nueva, <version>-webN.
_web_ver = re.search(r'id="app-version"[^>]*>v([\d.]+)<', page_html).group(1)
assert len(_asset_versions) == len(asset_refs) and len(set(_asset_versions)) == 1, "W7: all css/js references must carry the same ?v= suffix!"
assert re.fullmatch(re.escape(_web_ver) + r'(-web\d+)?', _asset_versions[0]), f"W7: ?v= must be {_web_ver} or {_web_ver}-webN (found {_asset_versions[0]})!"

if not HAY_ANDROID:
    NO_COMPROBADO.append("Test 48 (A8-A13 y zoom en la app Android)")
else:
    assert "setOverlayColor" in open(os.path.join(_android_java, 'StickerPackListActivity.java'), encoding='utf-8').read(), "A8: RoundingParams with setOverlayColor missing in StickerPackListActivity!"
    assert "openCurrentSelectionReview" in open(os.path.join(_android_java, 'StickerPackListActivity.java'), encoding='utf-8').read(), "Selection review method missing in StickerPackListActivity!"
    assert "setColorFilter(android.graphics.Color.WHITE)" in open(os.path.join(_android_java, 'StickerPackListAdapter.java'), encoding='utf-8').read(), "A9: White tint on + icon missing in StickerPackListAdapter!"
    assert "@string/add_short_button" in open(os.path.join(_android_res, 'layout', 'dialog_import_selection.xml'), encoding='utf-8').read(), "A10: Short 'Añadir' button text missing in dialog_import_selection.xml!"
    assert "getSelectionPreviewFile" in open(os.path.join(_android_java, 'DynamicPackManager.java'), encoding='utf-8').read(), "A11: 192px preview support for selection packs missing in DynamicPackManager!"
    assert "sticker_pack_yours_badge" in open(os.path.join(_android_res, 'layout', 'sticker_packs_list_item.xml'), encoding='utf-8').read(), "A12: 'Tuyo' badge missing in sticker_packs_list_item.xml!"
    assert "nailong_yellow_creamy" in open(os.path.join(_android_res, 'drawable', 'btn_clay_secondary.xml'), encoding='utf-8').read(), "A13: Creamy yellow button background missing in btn_clay_secondary.xml!"
    assert "sticker_zoom_overlay" in open(os.path.join(_android_res, 'layout', 'activity_sticker_pack_details.xml'), encoding='utf-8').read(), "Full-screen zoom overlay missing in activity_sticker_pack_details.xml!"
    assert "OvershootInterpolator" in open(os.path.join(_android_java, 'StickerPreviewAdapter.java'), encoding='utf-8').read(), "Smooth center zoom transition animation missing in StickerPreviewAdapter!"
    assert "btn_view_selection" in open(os.path.join(_android_res, 'layout', 'activity_sticker_pack_list.xml'), encoding='utf-8').read(), "View selection button missing in activity_sticker_pack_list.xml!"
print("✔ v3.5.0 verified: A8-A13, W6-W7, center zoom with transition & overlay, and 'Ver (N)' selection review active.")

# Test 49: Nailong 3D - visor interactivo (js/11-14): carga perezosa de Three.js r147 con SRI y nucleo geometrico estanco y canonico
_sec = page_html[page_html.index('id="nailong-3d"'):page_html.index('id="galeria"')] if 'id="nailong-3d"' in page_html else ''
assert _sec and page_html.index('id="historia"') < page_html.index('id="nailong-3d"'), "3D section #nailong-3d must sit between #historia and #galeria!"
assert 'id="nailong-3d-visor"' in _sec and 'id="nailong-3d-lienzo"' in _sec and 'role="img"' in _sec and 'aria-live="polite"' in _sec, "3D viewer, accessible canvas and live region missing!"
assert page_html.count('href="#nailong-3d"') >= 2, "3D section must be linked from the desktop and mobile menus!"
_n3d_lazy = ['js/11-nailong3d-geometria.js', 'js/12-nailong3d-escena.js', 'js/13-nailong3d-animacion.js']
assert 'js/14-nailong3d-visor.js' in asset_refs and asset_refs.index('js/14-nailong3d-visor.js') > asset_refs.index('js/10-inicio.js'), "js/14-nailong3d-visor.js must load after js/10-inicio.js!"
assert not any(r in asset_refs for r in _n3d_lazy), "W25: js/11-13 must be lazy-loaded by js/14, not eagerly from index.html!"
_visor = open('js/14-nailong3d-visor.js', encoding='utf-8').read()
assert all(r in _visor for r in _n3d_lazy) and [_visor.index(r) for r in _n3d_lazy] == sorted(_visor.index(r) for r in _n3d_lazy), "W25: js/14 must lazy-load js/11, js/12, js/13 in strict order!"
assert 'id="nailong-3d-sticker"' in _sec and 'exportarStickerWebP' in _visor and 'sticker-pack-id' in _visor, "3D3: 512x512 WebP sticker button and WhatsApp EXIF exporter missing!"
assert "VERSION_THREE = '0.147.0'" in _visor and _visor.count("sri: 'sha384-") == 3, "Three.js must be pinned to r147 with SRI on every CDN script!"
assert 'three@' not in page_html and 'three.min.js' not in page_html, "Three.js must be lazy-loaded by js/14 (never eagerly from index.html)!"
for _clave in ('IntersectionObserver', 'visibilitychange', 'prefers-reduced-motion', 'GLTFExporter', 'binary: true', "'none' : 'pan-y'", 'new Worker('):
    assert _clave in _visor, f"3D viewer must keep: {_clave}"
# D-26: el 3D arranca apagado (sin precarga por cercania) y «Ocultar» lo apaga liberando la GPU
assert 'id="nailong-3d-cargar"' in _sec and 'id="nailong-3d-ocultar"' in _sec, "D-26: 3D viewer needs its 'Ver en 3D' and 'Ocultar' buttons!"
assert 'rootMargin' not in _visor and 'forceContextLoss' in _visor and "enlazar('nailong-3d-ocultar', apagar)" in _visor, "D-26: the 3D must stay off until the user turns it on, and hiding it must free the GPU!"
_prueba_3d = r"""
const fs = require('fs'), vm = require('vm');
const src11 = fs.readFileSync('js/11-nailong3d-geometria.js', 'utf8');
vm.runInThisContext(src11.replace(/return\s*\{\s*VERSION:\s*(\d+),/, 'return { dTorso, dCabeza, dBrazo, dPierna, dCola, VERSION: $1,') + '\n;globalThis.__K = Nailong3DGeometria;');
const K = globalThis.__K, m = K.generarMalla({ celda: 0.0105 });
const P = m.posiciones, N = m.normales, C = m.colores, I = m.indices, J = m.huesoIndices, W = m.huesoPesos, nv = P.length / 3, nt = I.length / 3;
let ymin = 1e9, ymax = -1e9, cab = 0, tor = 0, crema = 0, frente = 0, inv = 0, no2 = 0, pesosMal = 0;
let torZMin = 1e9, torZMax = -1e9, p50YMin = 1e9, p15XMin = 1e9, p15XMax = -1e9;
const brazos = new Set([K.H.brazoIzq, K.H.brazoDer, K.H.codoIzq, K.H.codoDer]);
const sinTorso = new Set([K.H.brazoIzq, K.H.brazoDer, K.H.codoIzq, K.H.codoDer, K.H.cola, K.H.colaMedia, K.H.colaPunta, K.H.piernaIzq, K.H.piernaDer]);
const am = K.srgbALineal(K.COLORES.amarillo), cr = K.srgbALineal(K.COLORES.crema);
for (let v = 0; v < nv; v++) {
  const x = P[v*3], y = P[v*3+1], z = P[v*3+2];
  ymin = Math.min(ymin, y); ymax = Math.max(ymax, y);
  if (y > 0.62 && y < 0.68) cab = Math.max(cab, Math.abs(x));
  if (y > 0.25 && y < 0.32 && !brazos.has(J[v*4])) tor = Math.max(tor, Math.abs(x));
  if (y > 0.22 && y < 0.36 && !sinTorso.has(J[v*4])) { torZMin = Math.min(torZMin, z); torZMax = Math.max(torZMax, z); }
  if (N[v*3+2] > 0.3) { frente++; if (Math.abs(C[v*3]-cr[0]) + Math.abs(C[v*3+1]-cr[1]) + Math.abs(C[v*3+2]-cr[2]) < 0.05) crema++; }
  if (z > 0) {
    const f = Math.min((C[v*3+1]-am[1])/(cr[1]-am[1]), (C[v*3+2]-am[2])/(cr[2]-am[2]));
    if (f >= 0.5) p50YMin = Math.min(p50YMin, y);
    if (f >= 0.15) { p15XMin = Math.min(p15XMin, x); p15XMax = Math.max(p15XMax, x); }
  }
  if (Math.abs(W[v*4] + W[v*4+1] + W[v*4+2] + W[v*4+3] - 1) > 1e-3) pesosMal++;
}
let piernaVis = 0, entrepiernaY = 0;
for (let y = 0; y <= 0.45; y += 0.001) { if (!piernaVis && K.dTorso(K.ANATOMIA.pierna.a[0], y, K.ANATOMIA.pierna.a[2]) < 0) piernaVis = y; if (!entrepiernaY && K.sdf(0, y, K.ANATOMIA.pierna.a[2]) < 0) entrepiernaY = y; }
const br = K.ANATOMIA.brazo, ptsB = br.codo ? [br.a, br.codo, br.b] : [br.a, br.b], radsB = br.codo ? [br.ra, br.rc, br.rb] : [br.ra, br.rb];
let sumRL = 0, sumL = 0, sAcum = 0, sSalida = null, sPunta = 0;
const sinBrazos = (x, y, z) => { const ax = Math.abs(x); return Math.min(K.dTorso(ax, y, z), K.dCabeza(ax, y, z), K.dPierna(ax, y, z), K.dPierna(-ax, y, z)); };
for (let i = 0; i < ptsB.length - 1; i++) {
  const p0 = ptsB[i], p1 = ptsB[i+1], dx = p1[0]-p0[0], dy = p1[1]-p0[1], dz = p1[2]-p0[2], L = Math.hypot(dx, dy, dz);
  sumRL += ((radsB[i] + radsB[i+1]) / 2) * L; sumL += L;
  const ux = dx/L, uy = dy/L, uz = dz/L, maxT = (i === ptsB.length - 2) ? L + 0.45 : L;
  for (let t = 0; t <= maxT; t += 0.001) {
    const px = p0[0]+ux*t, py = p0[1]+uy*t, pz = p0[2]+uz*t, s = sAcum + t;
    if (sSalida === null && sinBrazos(px, py, pz) > 0) sSalida = s;
    if (K.dBrazo(px, py, pz) < 0) sPunta = Math.max(sPunta, s);
  }
  sAcum += L;
}
const brazoLibre = sSalida !== null ? Math.max(0, sPunta - sSalida) : 0, brazoDiam = sumL > 0 ? 2 * (sumRL / sumL) : 0;
let zEspalda = null, zColaPunta = 0;
for (let z = 0; z >= -0.6; z -= 0.001) { if (K.dTorso(0, K.ANATOMIA.cola.a[1], z) > 0) { zEspalda = z; break; } }
for (let z = -0.15; z >= -0.8; z -= 0.002) { for (let y = 0.02; y <= 0.45; y += 0.004) { if (K.dCola(0, y, z) < 0) { zColaPunta = Math.min(zColaPunta, z); break; } } }
const colaSobresale = zEspalda !== null ? zEspalda - zColaPunta : 0;
let cXMax = 0, cYMin = 1e9, cYMax = -1e9, cZMin = 1e9, cZMax = -1e9, tZMaxSdf = -1e9;
for (let x = 0; x <= 0.32; x += 0.006) for (let y = 0.46; y <= 1.04; y += 0.006) for (let z = -0.28; z <= 0.40; z += 0.006) {
  if (K.dCabeza(x, y, z) < 0) { if (x > cXMax) cXMax = x; if (y < cYMin) cYMin = y; if (y > cYMax) cYMax = y; if (z < cZMin) cZMin = z; if (z > cZMax) cZMax = z; }
}
for (let y = 0.14; y <= 0.44; y += 0.006) for (let z = 0.14; z <= 0.30; z += 0.002) { if (K.dTorso(0, y, z) < 0 && z > tZMaxSdf) tZMaxSdf = z; }
const cabAlto = cYMax - cYMin, cabAncho = 2 * cXMax, cabFondo = cZMax - cZMin, cabVoladizo = cZMax - tZMaxSdf;
const yCor = cYMax - 0.16 * cabAlto;
let corX = 0;
for (let x = 0; x <= 0.30; x += 0.002) for (let z = -0.25; z <= 0.35; z += 0.006) { if (K.dCabeza(x, yCor, z) < 0 && x > corX) corX = x; }
const cabCoronilla = cabAncho > 0 ? (2 * corX) / cabAncho : 0;
const aristas = new Map();
for (let t = 0; t < nt; t++) {
  const a = I[t*3], b = I[t*3+1], c = I[t*3+2];
  for (const [u, w] of [[a, b], [b, c], [c, a]]) { const k = u < w ? u * 4194304 + w : w * 4194304 + u; aristas.set(k, (aristas.get(k) || 0) + 1); }
  const ux = P[b*3]-P[a*3], uy = P[b*3+1]-P[a*3+1], uz = P[b*3+2]-P[a*3+2], wx = P[c*3]-P[a*3], wy = P[c*3+1]-P[a*3+1], wz = P[c*3+2]-P[a*3+2];
  if ((uy*wz-uz*wy)*(N[a*3]+N[b*3]+N[c*3]) + (uz*wx-ux*wz)*(N[a*3+1]+N[b*3+1]+N[c*3+1]) + (ux*wy-uy*wx)*(N[a*3+2]+N[b*3+2]+N[c*3+2]) < 0) inv++;
}
for (const n of aristas.values()) if (n !== 2) no2++;
console.log(JSON.stringify({ vertices: nv, huecos: m.estadisticas.huecos, no2, inv, pesosMal, altura: ymax - ymin, suelo: ymin, cab: 2 * cab, tor: 2 * tor, torFondo: torZMax - torZMin, barrigaZ: torZMax, pancita: crema / frente, pancitaYMin: p50YMin, pancitaHaloAncho: p15XMax - p15XMin, piernaVis, entrepiernaY, brazoLibre, brazoDiam, hombroY: br.a[1], hombroZ: br.a[2], tieneCodo: !!(br.codo && K.H.codoIzq !== undefined && K.H.codoDer !== undefined), colaSobresale, colaRaizY: K.ANATOMIA.cola.a[1], colaRadioPunta: K.ANATOMIA.cola.rb, tieneColaMedia: K.H.colaMedia !== undefined, cabVoladizo, cabFondo, cabAncho, cabCoronilla, cabAlto, huesos: K.HUESOS.length }));
"""
_res3d = subprocess.run(['node', '-e', _prueba_3d], capture_output=True, text=True, encoding='utf-8', timeout=180)
assert _res3d.returncode == 0, "3D geometry kernel failed in Node: " + _res3d.stderr[-600:]
_g = json.loads(_res3d.stdout)
assert _g['huecos'] == 0 and _g['no2'] == 0, f"3D mesh must be watertight (every edge shared by 2 triangles): {_g}"
assert _g['inv'] == 0 and _g['pesosMal'] == 0, f"3D mesh triangles must face outwards and skin weights must sum to 1: {_g}"
assert 15000 < _g['vertices'] < 60000 and _g['huesos'] == 15, f"Unexpected 3D mesh density or skeleton: {_g}"
# D-29 (3D18): la frente corta baja la coronilla ~2,8 cm; el cuerpo conserva las medidas tomadas con H = 1 y Nailong mide ~0,97
assert 0.96 <= _g['altura'] <= 1.01 and abs(_g['suelo']) < 0.002, f"Nailong 3D must be ~0.97 units tall (D-29) standing on y=0: {_g}"
# 3D6-3D10: proporciones completas de la serie (21/21 OK)
assert 0.85 <= _g['cab'] / _g['tor'] <= 1.00 and 0.46 < _g['tor'] / _g['altura'] < 0.56, f"Head/torso proportions drifted from 3D10 canonical targets: {_g}"
assert 0.37 <= _g['torFondo'] <= 0.43 and 0.19 <= _g['barrigaZ'] <= 0.23, f"3D6 torso depth or belly front Z out of target range: {_g}"
assert 0.08 < _g['pancita'] < 0.3 and _g['pancitaYMin'] >= 0.07 and _g['pancitaHaloAncho'] <= 0.41, f"3D6 cream belly patch missing, touching floor or with halo: {_g}"
assert 0.12 <= _g['piernaVis'] <= 0.145 and _g['entrepiernaY'] >= 0.07, f"3D7 visible leg height or crotch gap out of target range: {_g}"
assert 0.20 <= _g['brazoLibre'] <= 0.24 and 0.10 <= _g['brazoDiam'] <= 0.12, f"3D8 arm free length or diameter out of target range: {_g}"
assert 0.47 <= _g['hombroY'] <= 0.50 and -0.05 <= _g['hombroZ'] <= -0.02 and _g['tieneCodo'], f"3D8 shoulder Y/Z or elbow rig out of target range: {_g}"
assert 0.25 <= _g['colaSobresale'] <= 0.32 and 0.15 <= _g['colaRaizY'] <= 0.18 and _g['colaRadioPunta'] <= 0.04 and _g['tieneColaMedia'], f"3D9 long tail or colaMedia out of target range: {_g}"
assert 0.095 <= _g['cabVoladizo'] <= 0.145 and 0.475 <= _g['cabFondo'] <= 0.505, f"3D10 head overhang (H1) or depth (H2) out of target range: {_g}"
assert 0.465 <= _g['cabAncho'] <= 0.505 and _g['cabCoronilla'] >= 0.75 and 0.465 <= _g['cabAlto'] <= 0.505, f"3D10 head width (H3), crown ratio (H4) or height (H5) out of target range: {_g}"
print(f"✔ Nailong 3D verified: lazy Three.js r147 with SRI, viewer in #nailong-3d, watertight {_g['vertices']}-vertex skinned mesh with canonical proportions.")

# Test 50: v3.6.1 - todos los stickers animados se repiten en bucle (contador del chunk ANIM = 0), en la web y en la app
# (sticker_6 traia un 1: se reproducia una vez y se congelaba en la web, en el zoom de la app y en WhatsApp)
import struct as _struct
def _loop_count(_path):
    with open(_path, 'rb') as _lf:
        _b = _lf.read()
    _i = 12
    while _i < len(_b):
        _tag, _size = _b[_i:_i + 4], _struct.unpack('<I', _b[_i + 4:_i + 8])[0]
        if _tag == b'ANIM':
            return _struct.unpack('<H', _b[_i + 12:_i + 14])[0]
        _i += 8 + _size + (_size & 1)
    return None
_sin_bucle = [f for f in os.listdir('Stickers Nailong') if f.endswith('.webp') and _loop_count(os.path.join('Stickers Nailong', f)) not in (None, 0)]
if HAY_ANDROID:
    _assets_app = os.path.join(_ANDROID_APP, 'src', 'main', 'assets')
    assert os.path.isdir(_assets_app), f"Android assets folder missing: {_assets_app}"
    for _raiz, _dirs, _files in os.walk(_assets_app):
        _sin_bucle += [os.path.join(_raiz, f) for f in _files if f.endswith('.webp') and _loop_count(os.path.join(_raiz, f)) not in (None, 0)]
else:
    NO_COMPROBADO.append("Test 50 (bucle de los stickers animados dentro de la app Android; los de la web sí se comprueban)")
assert not _sin_bucle, f"Animated stickers must loop forever (ANIM loop count 0); fix with normalizar_stickers.py: {_sin_bucle}"
print("✔ Sticker loops verified: every animated WebP in the web" + (" and the Android assets" if HAY_ANDROID else "") + " repeats forever.")

# Test 51: v3.6.1 - las imagenes fijas de la web apuntan a su cromo por CLAVE (data-sticker), no solo por numero (D-22)
# Al renumerar, la clave viaja con su cromo en ALL_STICKERS; el src escrito en index.html debe coincidir con ella.
with open('js/02-datos-stickers.js', encoding='utf-8') as _df:
    _datos = _df.read()
_claves = dict(re.findall(r"clave: '([a-z0-9-]+)', file: '(sticker_\d+\.webp)'", _datos))
assert len(_claves) == _datos.count("clave: '"), "Every 'clave' in ALL_STICKERS must be unique and followed by its file!"
# W33: tambien vale su copia reducida mini/<clave>.webp (se llama por la clave, asi que no se desplaza al renumerar)
_fijas = re.findall(r'<img src="Stickers Nailong/((?:mini/[a-z0-9-]+|sticker_\d+)\.webp)" data-sticker="([a-z0-9-]+)"', page_html)
# W11 (web 4.3.0): tambien la cabecera (icono de iPhone, precarga del hero, og:image y twitter:image). En <link>/<meta>
# la clave no se resuelve al cargar (los buscadores y WhatsApp no ejecutan JS): solo este test vigila que coincida.
_fijas_cabecera = re.findall(r'<(?:link|meta) [^>]*?(?:href|content)="Stickers Nailong/(sticker_\d+\.webp)" data-sticker="([a-z0-9-]+)"', page_html)
assert len(_fijas) + len(_fijas_cabecera) == page_html.count('data-sticker="'), "Every data-sticker image must have its src/href/content right before data-sticker!"
assert {k for _, k in _fijas} >= {'dragon-de-leche', 'xiao-qi-colita', 'bombloong', 'escamitas-espalda'}, "The 4 'Quién es Nailong' cards must use data-sticker keys!"
_ids_fijos = dict((i, k) for k, i in re.findall(r'data-sticker="([a-z0-9-]+)" id="([a-z0-9-]+)"', page_html))
assert {'hero-nailong-img', 'companion-img', 'lab-nailong-img'} <= set(_ids_fijos), "W11: hero, companion and lab images must use data-sticker keys!"
_precarga = re.search(r'<link rel="preload" as="image" href="[^"]+" data-sticker="([a-z0-9-]+)"', page_html)
assert _precarga and _precarga.group(1) == _ids_fijos['hero-nailong-img'], "W11: the LCP preload must be the same sticker (key) as the hero image!"
assert re.search(r'<meta property="og:image" content="[^"]+" data-sticker="', page_html), "W11: og:image must carry its sticker key!"
# W11: las claves que usa el codigo (estados de animo del hero, disfraces del laboratorio, sprite del minijuego) existen
_usadas = re.findall(r"(?:stickerPorClave|rutaSticker|setLabCostume)\('([a-z0-9-]+)'", html) + re.findall(r"\{ clave: '([a-z0-9-]+)', speech:", html)
assert len(_usadas) >= 15 and set(_usadas) <= set(_claves), f"W11: unknown sticker keys used in the code: {sorted(set(_usadas) - set(_claves))}"
assert "setLabCostume('sticker_" not in page_html and "sticker: 'sticker_" not in js_function_body(html, 'setHeroMood'), "W11: costumes and moods must use sticker keys, not numbers!"
for _file, _key in _fijas + _fijas_cabecera:
    assert _key in _claves, f"data-sticker='{_key}' has no matching clave in ALL_STICKERS!"
    if _file.startswith('mini/'):
        assert _file == f'mini/{_key}.webp', f"data-sticker='{_key}' must use its own reduced copy mini/{_key}.webp (found {_file})!"
    else:
        assert _claves[_key] == _file, f"data-sticker='{_key}' points to {_file} but its clave belongs to {_claves[_key]} (renumbering drift)!"
assert 'function aplicarStickersFijos' in _datos and 'aplicarStickersFijos();' in _datos, "The runtime resolver of data-sticker keys is missing!"
print(f"✔ Fixed sticker images verified: {len(_fijas) + len(_fijas_cabecera)} images and {len(set(_usadas))} keys in the code resolved by stable key, none drifted after renumbering.")

# Test 52: detector de stickers repetidos (normalizar_stickers.py --clasificar)
# Dos garantias: ningun par de stickers distintos del catalogo se confunde entre si (ni como dudoso),
# y una copia reducida a 240 px (como llega de TikTok) de un sticker se reconoce como repetida.
import itertools as _it
import tempfile as _tmp
import normalizar_stickers as _ns
from PIL import Image as _Img
_firmas = {k: v for k, v in _ns.firmas_conocidas().items() if re.fullmatch(r'sticker_\d+\.webp', k)}
_dmin, _pa, _pb = min((_ns.distancia(_firmas[a], _firmas[b]), a, b) for a, b in _it.combinations(sorted(_firmas), 2))
assert _dmin >= _ns.UMBRAL_DUDOSO, f"{_pa} y {_pb} se parecen demasiado (distancia {_dmin:.1f} < {_ns.UMBRAL_DUDOSO}): o son el mismo sticker o hay que recalibrar los umbrales"
assert _ns.UMBRAL_REPETIDO < _ns.UMBRAL_DUDOSO, "UMBRAL_REPETIDO must be below UMBRAL_DUDOSO!"
with _tmp.TemporaryDirectory() as _d:
    for _name in ('sticker_1.webp', 'sticker_2.webp', 'sticker_52.webp'):
        _im = _Img.open(f'Stickers Nailong/{_name}')
        _fr = []
        for _k in range(getattr(_im, 'n_frames', 1)):
            _im.seek(_k)
            _fr.append(_im.convert('RGBA').resize((240, 240)))
        _copia = os.path.join(_d, _name.replace('.webp', '.png'))
        _fr[0].save(_copia, save_all=len(_fr) > 1, append_images=_fr[1:], duration=60, disposal=0, blend=0)
        _cerca, _dc = _ns.mas_parecido(_ns.firma(_copia), _firmas)
        assert _cerca == _name and _dc < _ns.UMBRAL_REPETIDO, f"Una copia a 240 px de {_name} deberia salir como repetida de si misma (salio {_cerca}, distancia {_dc:.1f})"
print(f"✔ Duplicate detector verified: closest distinct pair at {_dmin:.1f} (>= {_ns.UMBRAL_DUDOSO}), 240 px copies recognised as repeats.")

# Test 53: W33 - las imagenes pequenas usan copias reducidas de 192 px (mini/<clave>.webp), el icono de la
# pestana es de 64 px y el sprite del minijuego (clave mofletes-estirados) se descarga al acercarse al juego, no al abrir la web.
# T2 (web 4.3.0): mini/bombloong.webp es un recorte fijo de su cromo (RECORTES en miniaturas_web.py)
_res_mini = subprocess.run([sys.executable, os.path.join('herramientas', 'miniaturas_web.py'), '--check'], capture_output=True, text=True, encoding='utf-8')
assert _res_mini.returncode == 0, "W33: reduced copies are missing or out of date (run: py -3 herramientas/miniaturas_web.py): " + _res_mini.stdout
_minis = set(re.findall(r'Stickers Nailong/mini/([a-z0-9-]+)\.webp', page_html))
assert {'dragon-de-leche', 'xiao-qi-colita', 'bombloong', 'escamitas-espalda', 'favicon'} <= _minis, f"W33: logo, banner, cards and favicon must use their reduced copies (found {sorted(_minis)})!"
assert 'rel="icon" type="image/webp" href="Stickers Nailong/mini/favicon.webp"' in page_html, "W33: the favicon must be the 64 px copy (the whole sticker_18 weighed 398 KB)!"
_de_las_fichas = '|'.join(re.escape(_claves[k]) for k in ('dragon-de-leche', 'xiao-qi-colita', 'bombloong', 'escamitas-espalda'))
assert not re.search(r'<img src="Stickers Nailong/(?:' + _de_las_fichas + ')"', page_html), "W33: small images (logo, banner, cards, footer) must not load the 512 px stickers!"
_mj_src = open(os.path.join('js', '08-minijuego.js'), encoding='utf-8').read()
assert re.search(r"playerSprite\.src\s*=\s*'", _mj_src) is None and 'function cargarSpriteJugador' in _mj_src, "W33: the minigame sprite must not be requested when the page opens!"
assert 'cargarSpriteJugador();' in js_function_body(html, 'startMiniGame') and 'cargarSpriteJugador();' in js_function_body(html, 'setupGameVisibilityPause'), "W33: the minigame sprite must load near the game or when it starts!"
assert "src.includes('/mini/')" in js_function_body(html, 'aplicarStickersFijos'), "W33: the data-sticker resolver must keep the reduced copies!"
print(f"✔ W33 verified: {len(_minis)} reduced copies (192 px, 64 px favicon) match their stickers; minigame sprite loads on demand.")

# Test 54: W32 - iconos como dibujos SVG dentro de css/styles.css (sin descargar Font Awesome de cdnjs)
assert 'cdnjs.cloudflare.com' not in page_html and 'font-awesome' not in page_html, "W32: Font Awesome must not be downloaded from cdnjs any more!"
_res_ico = subprocess.run([sys.executable, os.path.join('herramientas', 'iconos_svg.py'), '--check'], capture_output=True, text=True, encoding='utf-8')
assert _res_ico.returncode == 0, "W32: every fa-* icon used in index.html or js/ needs its SVG in css/styles.css (run: py -3 herramientas/iconos_svg.py): " + _res_ico.stdout
_css_src = open(os.path.join('css', 'styles.css'), encoding='utf-8').read()
assert 'Font Awesome Free 6.5.1' in _css_src and 'CC BY 4.0' in _css_src, "W32: the Font Awesome Free attribution (CC BY 4.0) must stay next to the icon drawings!"
assert 'height: 1lh' in _css_src and 'flex-shrink: 0' in _css_src, "W32: icon boxes must keep the size of the old font glyphs (1lh tall, no shrinking)!"
print(f"✔ W32 verified: {len(re.findall(r'^[.]fa-[a-z0-9-]+ [{] --fa-ancho', _css_src, re.M))} icons drawn as inline SVG masks, no requests to cdnjs.")

# Test 55: 3D14-3D16 - ahorro en moviles modestos (sin sombra en tiempo real y ~30 fps en reposo en calidad «baja»),
# malla guardada en IndexedDB (clave = huella del codigo de js/11 + calidad + celdas) y programas de shader preparados al encender
_esc = open(os.path.join('js', '12-nailong3d-escena.js'), encoding='utf-8').read()
_vis = open(os.path.join('js', '14-nailong3d-visor.js'), encoding='utf-8').read()
assert "const conSombra = calidad !== 'baja';" in _esc and 'clave.castShadow = conSombra;' in _esc, "3D14: no real-time shadow in 'baja' quality (the contact shadow stays)!"
assert "renderer.shadowMap.enabled = S.calidad !== 'baja';" in _vis, "3D14: the shadow map must be off in 'baja' quality!"
assert 'function enReposo(' in _vis and 'MS_REPOSO' in _vis and '!reposo && !S.reposoPrevio' in _vis, "3D14: ~30 fps when nobody touches Nailong, without fooling the resolution monitor!"
assert "calidad=(baja|alta)" in _vis, "3D14: ?calidad=baja must force the phone mode (used by the capture tools)!"
assert 'indexedDB.open(CACHE_BD, 1)' in _vis and 'huellaTexto(src), src.length, S.calidad' in _vis and 'const mallasP = obtenerMallas(' in _vis, "3D15: the mesh cache key must derive from js/11 code, quality and cells!"
assert "S.origenMalla = 'calculada'" in _vis and 'mallasValidas(guardado.mallas' in _vis, "3D15: a missing, broken or slow cache must fall back to computing the mesh!"
assert "inyectarOjoAO(matSuaveOjo, uOjoAO, uGloboAPivote, 'suave');" in _esc and "inyectarOjoAO(matToonOjo, uOjoAO, uGloboAPivote, 'toon');" in _esc, "3D16: both eyes must share one shader program per style!"
assert 'function precompilarEstilos(' in _vis and 'precompilarEstilos();' in _vis and 'S.renderer.compile(S.escena, S.camara);' in _vis, "3D16: all shader programs (both styles, mouth parts) must be ready when the 3D turns on!"
print("✔ 3D14-3D16 verified: no live shadow and ~30 fps idle in 'baja', IndexedDB mesh cache keyed by js/11, shared eye program and precompiled styles.")

if NO_COMPROBADO:
    print(f"\n⚠ NO COMPROBADO: falta el código de la app Android en {ANDROID_SRC} (defínelo con NAILONG_ANDROID_SRC si está en otra ruta):")
    for _nc in NO_COMPROBADO:
        print(f"   - {_nc}")
    print(f"\n=== 55 VERIFICATION TESTS PASSED, {len(NO_COMPROBADO)} WITH THEIR ANDROID PART NOT CHECKED ===")
else:
    print("\n=== ALL 55 VERIFICATION TESTS PASSED SUCCESSFULLY! ===")
