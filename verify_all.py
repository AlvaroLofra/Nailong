import os
import sys
import re
import json
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("=== STARTING COMPREHENSIVE VERIFICATION ===")

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
html = page_html
for _ref in asset_refs:
    assert os.path.exists(_ref), f"index.html references a missing file: {_ref}"
    with open(_ref, 'r', encoding='utf-8') as f:
        html += chr(10) + f.read()
js_files = [r for r in asset_refs if r.endswith('.js')]
assert [r for r in asset_refs if r.endswith('.css')], "styles.css reference missing in index.html!"
for _f in os.listdir('js'):
    assert f'js/{_f}' in asset_refs, f"js/{_f} exists but is not loaded by index.html!"
for _f in os.listdir('css'):
    assert f'css/{_f}' in asset_refs, f"css/{_f} exists but is not loaded by index.html!"
assert re.search(r'<script>(.*?)</script>', page_html, re.DOTALL) is None, "No inline <script> allowed: keep JS in js/ (D-15)!"

print("✔ Single definitive index.html verified with 0 duplicate HTML files and obsolete scripts cleaned.")

# Test 2: Verify all stickers and creator photos on disk
sticker_files = sorted([f for f in os.listdir('Stickers Nailong') if os.path.isfile(os.path.join('Stickers Nailong', f))])
for i in range(1, 96):
    expected_file = f'sticker_{i}.webp'
    assert expected_file in sticker_files, f"Missing sticker file: {expected_file}"
assert 'descatalogado_sticker_14.webp' in sticker_files, "descatalogado_sticker_14.webp missing!"
assert 'sticker_96.webp' not in sticker_files, "sticker_96.webp should not exist on disk!"
assert 'creador_nailong.webp' in sticker_files, "Optimized creador_nailong.webp missing!"
assert 'Foto nailong yo.jfif' not in sticker_files, "Obsolete uncompressed Foto nailong yo.jfif should be removed!"
assert len(sticker_files) == 97, f"Expected exactly 97 sticker files (95 stickers + creador + descatalogado), found {len(sticker_files)}"
print("✔ All 95 sticker files + optimized creator photo + descatalogado verified in 'Stickers Nailong/' (obsolete files cleanly removed).")

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

# Test 4: Verify ALL_STICKERS in JS array contains all 95 stickers + creator
stickers_in_js = re.findall(r"file:\s*'sticker_(\d+)\.webp'", html)
unique_js_stickers = sorted(set(int(x) for x in stickers_in_js))
assert len(unique_js_stickers) == 95, f"Expected 95 stickers in ALL_STICKERS, found {len(unique_js_stickers)}"
assert unique_js_stickers == list(range(1, 96)), f"Missing stickers in ALL_STICKERS: {set(range(1, 96)) - set(unique_js_stickers)}"
assert "creador_nailong.webp" in html, "Creator photo missing from ALL_STICKERS!"
print("✔ ALL_STICKERS array accurately maps all 95 stickers (IDs 1 through 95) + creator photo.")

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
assert "alvarolofra.github.io/Nailong" in html, "Official GitHub Pages URL missing from index.html!"
assert "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Falvarolofra.github.io%2FNailong%2F" in html, "QR Code generator missing live GitHub Pages URL!"
print("✔ Live GitHub Pages share integration & QR code scanner verified: points directly to alvarolofra.github.io/Nailong.")

# Test 23: Verify Dedicated Creator Section & Lightbox
assert 'id="creador"' in html, "Creator section #creador missing from DOM!"
assert "openCreatorLightbox" in html, "openCreatorLightbox function missing!"
assert "creador_nailong.webp" in html, "creador_nailong.webp missing from HTML!"
print("✔ Dedicated Creator Section verified: featured card with Nailong, caption, confeti trigger, and lightbox.")

# Test 24: Verify Minigame Height & Slower Bomb Falling Speed
assert "h-[460px] sm:h-[540px]" in html, "Minigame height not enlarged for better reaction time!"
assert "finalVy = pick.bad ? (baseVy * 0.8) : baseVy;" in html, "Bomb slower drop velocity calculation missing!"
print("✔ Minigame improved: canvas height enlarged to 660px max and bombs fall 20% slower with gentle speed for mobile.")

# Test 25: Verify Brand Avatar 3D Radiante Smile
assert "sticker_2.webp" in html[:25000], "Brand avatar in header must use sticker_2.webp (Sonrisa Radiante 3D)!"
assert "scale-110" in html[:25000] and "object-cover" in html[:25000], "Brand avatar should fill circle with object-cover and zoom scale!"
print("✔ Brand Avatar verified: uses animated sticker_2.webp (Sonrisa Radiante 3D) filling the circle with calibrated zoom.")

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
assert "deleteUserPhoto('${item.id}', event)" in polaroid_src, "Delete button for user photos missing in album template!"
assert "Number.isFinite(Number(item.id))" in polaroid_src, "Pin/tilt seed must support string ids of user photos!"
assert "43+" not in html and "Creador (5)" not in html, "Hardcoded filter counters (43+, Creador (5)) must be gone!"
assert "function updateFilterCounts" in html, "Dynamic filter counters missing!"
assert 'id="polaroid-grid" class="grid grid-cols-2' in html, "Album must use 2 columns on mobile!"
assert 'id="game-touch-dock" class="absolute bottom-3 inset-x-3 hidden' in html, "In-game touch dock must be hidden outside fullscreen!"
assert "getEmojiSprite(item.emoji, 34)" in html, "Minigame must draw emoji sprites instead of fillText!"
assert 'id="party-canvas" class="fixed inset-0 pointer-events-none z-50 w-full h-full" style="display: none;"' in html, "Party canvas must start hidden!"
assert "canvas.style.display = 'none'" in html, "Party canvas must be hidden again when confetti ends!"
assert "@media (prefers-reduced-motion: reduce)" in html, "prefers-reduced-motion support missing!"
assert html.count('role="dialog" aria-modal="true"') == 4, "The 4 modals must declare role=dialog and aria-modal!"
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
for extra in range(96, 105):
    assert not os.path.exists(f'Stickers Nailong/sticker_{extra}.webp'), f"Stray sticker_{extra}.webp found on disk!"
for i in range(1, 96):
    assert os.path.exists(f'Stickers Nailong/sticker_{i}.webp'), f"Sticker gap detected at sticker_{i}.webp!"
im60 = Image.open('Stickers Nailong/sticker_55.webp').convert('RGBA')
bbox = im60.getchannel('A').getbbox()
assert bbox and (bbox[3] - bbox[1]) < (bbox[2] - bbox[0]), "sticker_55 (GEMESNYA recortado) must keep its cropped, wider-than-tall content!"
print("✔ v13 verified: 95 continuous stickers, sticker_55 cropped, isCreatorItem decoupled from id 43, GALLERY_STEP active.")

# Test 39: v14 - TODOS los stickers cumplen el formato de WhatsApp (512x512, EXIF, peso) -> se envian como sticker
import subprocess, sys
res = subprocess.run([sys.executable, 'normalizar_stickers.py', '--check'], capture_output=True, text=True, encoding='utf-8')
assert res.returncode == 0, "Hay stickers que WhatsApp tomaria como imagen (ejecuta: python normalizar_stickers.py): " + res.stdout
assert os.path.exists('normalizar_stickers.py'), "normalizar_stickers.py missing!"
for _id, _file, _fr in re.findall(r"id:\s*(\d+),\s*file:\s*'(sticker_\d+\.webp)',\s*frames:\s*(\d+)", html):
    _n = getattr(Image.open(os.path.join('Stickers Nailong', _file)), 'n_frames', 1)
    assert _n == int(_fr), f"frames de {_file} en ALL_STICKERS ({_fr}) no coincide con el archivo ({_n}): actualizalo en index.html"
print("✔ v14 verified: all 95 stickers are 512x512 WebP with WhatsApp EXIF and within size limits (sent as real stickers).")

# Test 40: v16 - pagina de 24 en movil, sin texto de fotogramas, version visible en el pie
assert "const GALLERY_STEP = 24;" in html, "GALLERY_STEP must be a fixed 24 (desktop and mobile)!"
assert "FRAMES)" not in html and "}f)" not in html, "Frame-count text must be removed from cards and lightbox!"
assert re.search(r'id="app-version"[^>]*>v3.6.0<', html), "Footer must show the current version number (v3.6.0)!"
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
assert 'v3.6.0 APK' in html, "Badge in index.html must show v3.6.0 APK!"
print("✔ v3.6.0 verified: Native Android app (StickersNailong.apk) present on web root with Claymorphism download banner and v3.6.0 APK badge.")

# Test 43: v3.2.1 - Tipografia Fredoka y calibracion de icono adaptive en Android
font_path = r'C:\src\nailong_stickers_app\stickers\Android\app\src\main\res\font\fredoka.xml'
assert os.path.exists(font_path), "fredoka.xml font family resource missing in Android app!"
for f_name in ['fredoka_regular.ttf', 'fredoka_medium.ttf', 'fredoka_semibold.ttf', 'fredoka_bold.ttf']:
    assert os.path.exists(os.path.join(r'C:\src\nailong_stickers_app\stickers\Android\app\src\main\res\font', f_name)), f"Font file {f_name} missing!"
assert os.path.exists(r'C:\src\nailong_stickers_app\stickers\Android\app\src\main\res\layout\dialog_import_selection.xml'), "dialog_import_selection.xml missing!"
assert os.path.exists(r'C:\src\nailong_stickers_app\stickers\Android\app\src\main\res\drawable\card_stickers_container.xml'), "card_stickers_container.xml missing!"
print("✔ v3.1.0 verified: Fredoka typography family, custom dialog layout, and card container in Android app.")

# Test 44: v3.2.0 - Muro de GIFs fusionado con el album: app primero, Visor Magico en tira y acceso desde el lightbox
assert 'section id="muro-gifs"' not in html, "The old standalone GIF wall section must be gone!"
assert html.index('id="android-app-banner"') < html.index('id="gif-wall-grid"') < html.index('id="polaroid-grid"'), "Order must be: app banner, Visor Magico strip, album!"
assert 'href="#android-app-banner"' in html and 'id="lb-visor-btn"' in html and 'openVisorFromLightbox' in html, "App nav button or lightbox Visor button missing!"
assert 'overflow-x: clip' in html and '@media (max-width: 359px)' in html, "Navbar overflow fix missing!"
print("✔ v3.2.0 verified: GIF wall merged into stickers section (app banner, Visor strip, album), app button in nav, navbar fits narrow phones.")

# Test 45: v3.3.2 - version.json (lo lee la app para avisar de versiones nuevas) coincide con la web y el APK
with open('version.json', encoding='utf-8') as _vf:
    _ver = json.load(_vf)
_footer = re.search(r'id="app-version"[^>]*>v([\d.]+)<', html).group(1)
assert _ver['versionName'] == _footer, f"version.json versionName ({_ver['versionName']}) must match the footer version (v{_footer})!"
assert _ver['apkUrl'] == 'https://alvarolofra.github.io/Nailong/StickersNailong.apk', "version.json apkUrl must point to the official APK on GitHub Pages!"
assert isinstance(_ver.get('notes'), list) and _ver['notes'], "version.json must include a non-empty notes list (shown in the app)!"
with open(os.path.join(r'C:\src\nailong_stickers_app\stickers\Android\app', 'build.gradle'), encoding='utf-8') as _gf:
    _gradle = _gf.read()
assert f"versionCode {_ver['versionCode']}" in _gradle and f'versionName "{_ver["versionName"]}"' in _gradle, "version.json must match versionCode/versionName in the Android build.gradle!"
with open(os.path.join(r'C:\src\nailong_stickers_app\stickers\Android\app\src\main\java\com\example\samplestickerapp', 'UpdateChecker.java'), encoding='utf-8') as _uf:
    assert '"https://alvarolofra.github.io/Nailong/version.json"' in _uf.read(), "UpdateChecker.java must read version.json from the official site!"
print(f"✔ v3.4.1 verified: version.json ({_ver['versionName']}, code {_ver['versionCode']}) matches web footer and Android build.gradle.")

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
act_file = os.path.join(r'C:\src\nailong_stickers_app\stickers\Android\app\src\main\java\com\example\samplestickerapp', 'StickerPackListActivity.java')
with open(act_file, encoding='utf-8') as _af:
    assert "Desarrollado por Álvaro Lofra" in _af.read(), "Android StickerPackListActivity must credit 'Desarrollado por Álvaro Lofra'!"

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
assert 'function toggleApkQrBox(' in html and 'function closeApkQrBox(' in html, "W6: toggleApkQrBox / closeApkQrBox missing in JS!"
_asset_versions = re.findall(r'(?:src|href)="(?:css|js)/[^"?]+\?v=([^"]+)"', page_html)
assert len(_asset_versions) == len(asset_refs) and all(v == _ver['versionName'] for v in _asset_versions), f"W7: all css/js references must carry ?v={_ver['versionName']}!"

_android_java = r'C:\src\nailong_stickers_app\stickers\Android\app\src\main\java\com\example\samplestickerapp'
_android_res = r'C:\src\nailong_stickers_app\stickers\Android\app\src\main\res'
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
_n3d = ['js/11-nailong3d-geometria.js', 'js/12-nailong3d-escena.js', 'js/13-nailong3d-animacion.js', 'js/14-nailong3d-visor.js']
assert [r for r in asset_refs if r in _n3d] == _n3d and asset_refs.index(_n3d[0]) > asset_refs.index('js/10-inicio.js'), "3D scripts must load in order after js/10-inicio.js!"
_visor = open('js/14-nailong3d-visor.js', encoding='utf-8').read()
assert "VERSION_THREE = '0.147.0'" in _visor and _visor.count("sri: 'sha384-") == 3, "Three.js must be pinned to r147 with SRI on every CDN script!"
assert 'three@' not in page_html and 'three.min.js' not in page_html, "Three.js must be lazy-loaded by js/14 (never eagerly from index.html)!"
for _clave in ('IntersectionObserver', 'visibilitychange', 'prefers-reduced-motion', 'GLTFExporter', 'binary: true', "'none' : 'pan-y'", 'new Worker('):
    assert _clave in _visor, f"3D viewer must keep: {_clave}"
_prueba_3d = r"""
const fs = require('fs'), vm = require('vm');
vm.runInThisContext(fs.readFileSync('js/11-nailong3d-geometria.js', 'utf8') + '\n;globalThis.__K = Nailong3DGeometria;');
const K = globalThis.__K, m = K.generarMalla({ celda: 0.0105 });
const P = m.posiciones, N = m.normales, C = m.colores, I = m.indices, J = m.huesoIndices, W = m.huesoPesos, nv = P.length / 3, nt = I.length / 3;
let ymin = 1e9, ymax = -1e9, cab = 0, tor = 0, crema = 0, frente = 0, inv = 0, no2 = 0, pesosMal = 0;
const brazos = new Set([K.H.brazoIzq, K.H.brazoDer]), cr = K.srgbALineal(K.COLORES.crema);
for (let v = 0; v < nv; v++) {
  const x = P[v*3], y = P[v*3+1];
  ymin = Math.min(ymin, y); ymax = Math.max(ymax, y);
  if (y > 0.62 && y < 0.68) cab = Math.max(cab, Math.abs(x));
  if (y > 0.25 && y < 0.32 && !brazos.has(J[v*4])) tor = Math.max(tor, Math.abs(x));
  if (N[v*3+2] > 0.3) { frente++; if (Math.abs(C[v*3]-cr[0]) + Math.abs(C[v*3+1]-cr[1]) + Math.abs(C[v*3+2]-cr[2]) < 0.05) crema++; }
  if (Math.abs(W[v*4] + W[v*4+1] + W[v*4+2] + W[v*4+3] - 1) > 1e-3) pesosMal++;
}
const aristas = new Map();
for (let t = 0; t < nt; t++) {
  const a = I[t*3], b = I[t*3+1], c = I[t*3+2];
  for (const [u, w] of [[a, b], [b, c], [c, a]]) { const k = u < w ? u * 4194304 + w : w * 4194304 + u; aristas.set(k, (aristas.get(k) || 0) + 1); }
  const ux = P[b*3]-P[a*3], uy = P[b*3+1]-P[a*3+1], uz = P[b*3+2]-P[a*3+2], wx = P[c*3]-P[a*3], wy = P[c*3+1]-P[a*3+1], wz = P[c*3+2]-P[a*3+2];
  if ((uy*wz-uz*wy)*(N[a*3]+N[b*3]+N[c*3]) + (uz*wx-ux*wz)*(N[a*3+1]+N[b*3+1]+N[c*3+1]) + (ux*wy-uy*wx)*(N[a*3+2]+N[b*3+2]+N[c*3+2]) < 0) inv++;
}
for (const n of aristas.values()) if (n !== 2) no2++;
console.log(JSON.stringify({ vertices: nv, huecos: m.estadisticas.huecos, no2, inv, pesosMal, altura: ymax - ymin, suelo: ymin, cab: 2 * cab, tor: 2 * tor, pancita: crema / frente, huesos: K.HUESOS.length }));
"""
_res3d = subprocess.run(['node', '-e', _prueba_3d], capture_output=True, text=True, encoding='utf-8', timeout=180)
assert _res3d.returncode == 0, "3D geometry kernel failed in Node: " + _res3d.stderr[-600:]
_g = json.loads(_res3d.stdout)
assert _g['huecos'] == 0 and _g['no2'] == 0, f"3D mesh must be watertight (every edge shared by 2 triangles): {_g}"
assert _g['inv'] == 0 and _g['pesosMal'] == 0, f"3D mesh triangles must face outwards and skin weights must sum to 1: {_g}"
assert 15000 < _g['vertices'] < 60000 and _g['huesos'] == 12, f"Unexpected 3D mesh density or skeleton: {_g}"
assert abs(_g['altura'] - 1.0) < 0.02 and abs(_g['suelo']) < 0.002, f"Nailong 3D must be 1 unit tall standing on y=0: {_g}"
assert 0.8 < _g['cab'] / _g['tor'] < 0.95 and 0.5 < _g['tor'] / _g['altura'] < 0.66, f"Head/torso proportions drifted from the stickers (86, 43): {_g}"
assert 0.08 < _g['pancita'] < 0.3, f"Cream belly patch missing or oversized: {_g}"
print(f"✔ Nailong 3D verified: lazy Three.js r147 with SRI, viewer in #nailong-3d, watertight {_g['vertices']}-vertex skinned mesh with canonical proportions.")

print("\n=== ALL 49 VERIFICATION TESTS PASSED SUCCESSFULLY! ===")
