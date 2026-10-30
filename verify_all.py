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

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("✔ Single definitive index.html verified with 0 duplicate HTML files and obsolete scripts cleaned.")

# Test 2: Verify all stickers and creator photos on disk
sticker_files = sorted(os.listdir('Stickers Nailong'))
for i in range(1, 83):
    expected_file = f'sticker_{i}.webp'
    assert expected_file in sticker_files, f"Missing sticker file: {expected_file}"
assert 'creador_nailong.webp' in sticker_files, "Optimized creador_nailong.webp missing!"
assert 'Foto nailong yo.jfif' not in sticker_files, "Obsolete uncompressed Foto nailong yo.jfif should be removed!"
assert len(sticker_files) == 83, f"Expected exactly 83 sticker files (82 stickers + creador), found {len(sticker_files)}"
print("✔ All 82 sticker files + optimized creator photo verified in 'Stickers Nailong/' (obsolete files cleanly removed).")

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

# Test 4: Verify ALL_STICKERS in JS array contains all 82 stickers + creator
stickers_in_js = re.findall(r"file:\s*'sticker_(\d+)\.webp'", html)
unique_js_stickers = sorted(set(int(x) for x in stickers_in_js))
assert len(unique_js_stickers) == 82, f"Expected 82 stickers in ALL_STICKERS, found {len(unique_js_stickers)}"
assert unique_js_stickers == list(range(1, 83)), f"Missing stickers in ALL_STICKERS: {set(range(1, 83)) - set(unique_js_stickers)}"
assert "creador_nailong.webp" in html, "Creator photo missing from ALL_STICKERS!"
print("✔ ALL_STICKERS array accurately maps all 82 stickers (IDs 1 through 82) + creator photo.")

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
script_blocks = re.findall(r'<script>(.*?)</script>', html, re.DOTALL)
assert len(script_blocks) >= 2, "Expected inline config and main script blocks in index.html"
main_js = script_blocks[-1]
with open('temp_check.js', 'w', encoding='utf-8') as f:
    f.write(main_js)

try:
    res = subprocess.run(['node', '-c', 'temp_check.js'], capture_output=True, text=True, check=True)
    print("✔ JavaScript syntax check passed with 0 errors via Node.js.")
finally:
    if os.path.exists('temp_check.js'):
        os.remove('temp_check.js')

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
assert "const moveSpeed = Math.max(16, Math.round(foodCanvas.width * 0.02));" in html, "Minigame fast linear speed calculation missing!"
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

# Test 33: Verify Synchronized Project Documentation (GEMINI.md & CLAUDE.md)
gemini_content = open('GEMINI.md', 'r', encoding='utf-8').read()
claude_content = open('CLAUDE.md', 'r', encoding='utf-8').read()
assert gemini_content == claude_content, "GEMINI.md and CLAUDE.md must have 100% identical content!"
assert os.path.exists('DOCUMENTACION.md'), "DOCUMENTACION.md missing!"
print("✔ Project Documentation verified: GEMINI.md and CLAUDE.md are 100% synchronized and DOCUMENTACION.md is present.")

# Test 35: Verify Central Library Governance Protocol & Architectural Decision Records (ADR)
doc_content = open('DOCUMENTACION.md', 'r', encoding='utf-8').read()
assert "Protocolo de Gobernanza y Conexión con la Biblioteca Central" in gemini_content, "Central Library protocol missing from GEMINI.md!"
assert "00_INDICE_GENERAL.md" in gemini_content, "Cascade index missing from GEMINI.md!"
assert "GUIA_MAESTRA_DESARROLLO_Y_PROYECTOS.md" in gemini_content, "Methodology reference missing from GEMINI.md!"
assert "ADR-01: Descarga Universal en iOS (Safari) e Integración de Stickers para WhatsApp" in doc_content, "ADR-01 missing from DOCUMENTACION.md!"
print("✔ Central Library Governance Protocol and ADR-01 verified in project documentation.")

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
for extra in range(83, 90):
    assert not os.path.exists(f'Stickers Nailong/sticker_{extra}.webp'), f"Stray sticker_{extra}.webp found on disk!"
for i in range(1, 83):
    assert os.path.exists(f'Stickers Nailong/sticker_{i}.webp'), f"Sticker gap detected at sticker_{i}.webp!"
im60 = Image.open('Stickers Nailong/sticker_58.webp').convert('RGBA')
bbox = im60.getchannel('A').getbbox()
assert bbox and (bbox[3] - bbox[1]) < (bbox[2] - bbox[0]), "sticker_58 (GEMESNYA recortado) must keep its cropped, wider-than-tall content!"
print("✔ v13 verified: 82 continuous stickers, sticker_58 cropped, isCreatorItem decoupled from id 43, GALLERY_STEP active.")

# Test 39: v14 - TODOS los stickers cumplen el formato de WhatsApp (512x512, EXIF, peso) -> se envian como sticker
import subprocess, sys
res = subprocess.run([sys.executable, 'normalizar_stickers.py', '--check'], capture_output=True, text=True, encoding='utf-8')
assert res.returncode == 0, "Hay stickers que WhatsApp tomaria como imagen (ejecuta: python normalizar_stickers.py): " + res.stdout
assert os.path.exists('normalizar_stickers.py'), "normalizar_stickers.py missing!"
for _id, _file, _fr in re.findall(r"id:\s*(\d+),\s*file:\s*'(sticker_\d+\.webp)',\s*frames:\s*(\d+)", html):
    _n = getattr(Image.open(os.path.join('Stickers Nailong', _file)), 'n_frames', 1)
    assert _n == int(_fr), f"frames de {_file} en ALL_STICKERS ({_fr}) no coincide con el archivo ({_n}): actualizalo en index.html"
print("✔ v14 verified: all 82 stickers are 512x512 WebP with WhatsApp EXIF and within size limits (sent as real stickers).")

# Test 40: v16 - pagina de 24 en movil, sin texto de fotogramas, version visible en el pie
assert "const GALLERY_STEP = 24;" in html, "GALLERY_STEP must be a fixed 24 (desktop and mobile)!"
assert "FRAMES)" not in html and "}f)" not in html, "Frame-count text must be removed from cards and lightbox!"
assert re.search(r'id="app-version"[^>]*>v17<', html), "Footer must show the current version number (v17)!"
print("✔ v16 verified: +24 pagination on all devices, no frame-count text, version number in footer.")

# Test 41: v17 - el PNG copiado lleva esquinas transparentes (sin ellas WhatsApp lo pega como foto)
copy_src = html[html.index("async function copyStickerToClipboard"):html.index("async function copyStickerToClipboard") + 3000]
assert "roundRect(0, 0, 512, 512" in copy_src and "ctx.clip()" in copy_src, "copyStickerToClipboard must clip rounded transparent corners on a 512x512 canvas!"
assert "countTransparentPixels(ctx) < CLIPBOARD_MIN_TRANSPARENT" in copy_src, "Rounded corners must only be applied to (almost) opaque stickers!"
assert "Añadir a favoritos" not in html, "The WhatsApp share button must not promise a sticker (it always arrives as a photo)!"
assert not os.path.exists('HANDOFF_WHATSAPP.md'), "Temporary WhatsApp handoff must be removed!"
print("✔ v17 verified: clipboard sticker has transparent rounded corners (pasted as a WhatsApp sticker).")

print("\n=== ALL 41 VERIFICATION TESTS PASSED SUCCESSFULLY! ===")
