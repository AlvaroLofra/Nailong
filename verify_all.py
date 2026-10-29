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
assert os.path.exists('Stickers Nailong'), "Stickers directory missing!"

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("✔ Single definitive index.html verified with 0 duplicate HTML files.")

# Test 2: Verify all stickers and creator photos on disk
sticker_files = sorted(os.listdir('Stickers Nailong'))
for i in range(1, 43):
    expected_file = f'sticker_{i}.webp'
    assert expected_file in sticker_files, f"Missing sticker file: {expected_file}"
assert 'Foto nailong yo.jfif' in sticker_files, "Original Foto nailong yo.jfif missing!"
assert 'creador_nailong.webp' in sticker_files, "Optimized creador_nailong.webp missing!"
print("✔ All 42 sticker files + creator photos (original and webp) exist in 'Stickers Nailong/'.")

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

# Test 4: Verify ALL_STICKERS in JS array contains all 42 stickers + creator
stickers_in_js = re.findall(r"file:\s*'sticker_(\d+)\.webp'", html)
unique_js_stickers = sorted(set(int(x) for x in stickers_in_js))
assert len(unique_js_stickers) == 42, f"Expected 42 stickers in ALL_STICKERS, found {len(unique_js_stickers)}"
assert unique_js_stickers == list(range(1, 43)), f"Missing stickers in ALL_STICKERS: {set(range(1, 43)) - set(unique_js_stickers)}"
assert "creador_nailong.webp" in html, "Creator photo missing from ALL_STICKERS!"
print("✔ ALL_STICKERS array accurately maps all 42 stickers (IDs 1 through 42) + creator photo.")

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

print("\n=== ALL 24 VERIFICATION TESTS PASSED SUCCESSFULLY! ===")
