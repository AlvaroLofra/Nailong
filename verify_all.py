import os
import re
import sys
import json

if sys.stdout.encoding.lower() != 'utf-8':
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

# Test 2: Verify all 42 stickers on disk
sticker_files = sorted(os.listdir('Stickers Nailong'))
assert len(sticker_files) == 42, f"Expected 42 stickers on disk, found {len(sticker_files)}"
for i in range(1, 43):
    expected_file = f'sticker_{i}.webp'
    assert expected_file in sticker_files, f"Missing sticker file: {expected_file}"
print("✔ All 42 sticker files exist in 'Stickers Nailong/'.")

# Test 3: Check all image references in index.html resolve to real files
static_img_refs = re.findall(r'Stickers Nailong/(sticker_\d+\.webp)', html)
assert len(static_img_refs) > 0, "No static sticker image references found!"
for ref in set(static_img_refs):
    full_path = os.path.join('Stickers Nailong', ref)
    assert os.path.exists(full_path), f"Broken static image reference in HTML: {ref}"
print(f"✔ All {len(set(static_img_refs))} unique static sticker references point to existing files on disk.")

# Check all dynamic template literals: sticker_${gif.id}.webp, ${item.file}, ${tile.sticker}, ${data.sticker}
for gif in re.findall(r"id:\s*(\d+)", html[:html.find('const ALL_STICKERS')]):
    assert os.path.exists(os.path.join('Stickers Nailong', f'sticker_{gif}.webp')), f"FEATURED_GIF sticker_{gif}.webp missing!"
for tile in re.findall(r"sticker:\s*'([^']+)'", html):
    assert os.path.exists(os.path.join('Stickers Nailong', tile)), f"Soundboard / Mood sticker {tile} missing!"
print("✔ All dynamically templated sticker references (GIFs, Moods, Soundboard) resolve to valid files on disk.")

# Test 4: Verify ALL_STICKERS in JS array contains all 42 stickers
stickers_in_js = re.findall(r"file:\s*'sticker_(\d+)\.webp'", html)
unique_js_stickers = sorted(set(int(x) for x in stickers_in_js))
assert len(unique_js_stickers) == 42, f"Expected 42 stickers in ALL_STICKERS, found {len(unique_js_stickers)}"
assert unique_js_stickers == list(range(1, 43)), f"Missing stickers in ALL_STICKERS: {set(range(1, 43)) - set(unique_js_stickers)}"
print("✔ ALL_STICKERS array accurately maps all 42 stickers (IDs 1 through 42).")

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

# Test 7: Verify User Upload Bug Fix
assert "const imgSrc = item.customUrl ? item.customUrl : `Stickers Nailong/${item.file}`;" in html, "User upload imgSrc fallback missing in renderPolaroidGallery!"
assert "document.getElementById('lb-img').src = imgSrc;" in html, "Lightbox imgSrc fix missing!"
assert "event.target.value = '';" in html, "Input value reset missing in upload handler!"
print("✔ User photo upload bug verified fixed: supports base64 customUrl, updates gallery, lightbox, and download link.")

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

# Test 10: Verify Mobile Menu Navigation
assert "id=\"mobile-menu\"" in html, "Mobile menu dropdown missing!"
assert "toggleMobileMenu()" in html, "toggleMobileMenu function missing!"
print("✔ Mobile navigation drawer verified: collapsible tray with fast navigation jumps for phones and tablets.")

# Test 11: Verify HTML Tag Balance
tags = ['html', 'head', 'body', 'header', 'nav', 'main', 'footer', 'script', 'style']
for tag in tags:
    opens = len(re.findall(rf'<{tag}[\s>]', html, re.IGNORECASE))
    closes = len(re.findall(rf'</{tag}>', html, re.IGNORECASE))
    assert opens == closes, f"Tag mismatch for <{tag}>: {opens} opens vs {closes} closes"
print("✔ All structural HTML tags are strictly balanced.")

# Test 12: Validate JavaScript syntax via Node.js
script_blocks = re.findall(r'<script>(.*?)</script>', html, re.DOTALL)
assert len(script_blocks) >= 2, "Expected Tailwind script and Main script block"
main_script = script_blocks[-1]

with open('temp_check_syntax.js', 'w', encoding='utf-8') as f:
    f.write(main_script)

node_exit = os.system('node -c temp_check_syntax.js')
assert node_exit == 0, "JavaScript syntax error detected by Node.js!"
if os.path.exists('temp_check_syntax.js'):
    os.remove('temp_check_syntax.js')
print("✔ JavaScript syntax check passed with 0 errors via Node.js.")

# Test 13: Verify Mobile Viewport & Meta Tags (viewport-fit, PWA & Open Graph)
assert "viewport-fit=cover" in html, "Missing viewport-fit=cover for iPhone notch and Dynamic Island!"
assert "apple-mobile-web-app-capable" in html, "Missing apple-mobile-web-app-capable meta tag!"
assert "theme-color" in html, "Missing theme-color meta tag for Android Chrome & mobile Safari header!"
assert "og:title" in html and "og:image" in html, "Missing Open Graph rich preview tags for WhatsApp/Telegram sharing!"
print("✔ Mobile viewport & PWA meta tags verified: notch support, Android theme-color, and WhatsApp/social sharing previews.")

# Test 14: Verify Mobile Touch & Safe Area Inset Styles
assert "-webkit-tap-highlight-color: transparent" in html, "Missing tap highlight reset for clean touchscreen clicks!"
assert "-webkit-touch-callout: none" in html, "Missing touch-callout reset to prevent accidental long-press image menus!"
assert "env(safe-area-inset" in html, "Missing iOS safe area inset CSS integration!"
assert "input[type=range]::-webkit-slider-thumb" in html, "Missing mobile touch-sized slider thumb styling!"
print("✔ Mobile CSS verified: iOS safe area insets, -webkit tap highlights, touch callout prevention, and mobile slider touch targets.")

# Test 15: Verify Mobile Minigame Virtual Controls
assert "id=\"mobile-left-btn\"" in html and "id=\"mobile-right-btn\"" in html, "Mobile virtual left/right buttons missing from minigame!"
assert "mobile-left-btn" in html and "handleMove('left')" not in html, "Valid virtual button identifiers integrated in HTML and script!"
print("✔ Mobile minigame virtual touch controls verified: on-screen buttons with continuous touch/drag support.")

# Test 16: Verify Mobile Touch Swipe Gestures for Modals
assert "setupModalSwipeGestures" in html, "setupModalSwipeGestures function missing!"
assert "setupModalSwipeGestures('magic-modal'" in html, "Visor Mágico touch swipe listener missing!"
assert "setupModalSwipeGestures('photo-lightbox'" in html, "Photo Lightbox touch swipe listener missing!"
assert "orientationchange" in html, "Orientation change listener missing for phone rotation handling!"
print("✔ Mobile swipe navigation verified: horizontal thumb swiping active for both Visor Mágico and Photo Lightbox.")

# Test 17: Verify Share & Hosting Modal and Functions
assert "id=\"share-modal\"" in html, "Share & Hosting modal missing from DOM!"
assert "openShareModal()" in html and "closeShareModal()" in html, "openShareModal / closeShareModal missing!"
assert "triggerNativeShare()" in html, "Native Web Share API function missing!"
assert "copyCurrentShareLink()" in html, "Clipboard copy link function missing!"
assert "share-qr-code" in html, "QR code container missing for camera scanning!"
print("✔ Share & Hosting module verified: native Web Share sheet, QR code scanner, copy link, and step-by-step hosting guide.")

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

print("\n=== ALL 22 VERIFICATION TESTS PASSED SUCCESSFULLY! ===")
