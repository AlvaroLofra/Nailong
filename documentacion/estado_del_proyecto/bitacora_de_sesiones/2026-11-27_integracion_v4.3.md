# Bitácora de sesión — 27/11/2026: plan, lore e integración de la web 4.3.0

> **Objetivo:** repartir la web 4.3.0 en dos sesiones paralelas, escribir el documento de lore con fuentes e integrar el resultado en `main` como versión 4.3.0.
> **Agente:** Claude Code (Opus), sesión principal «Pendientes versión 4.3», en el *checkout* principal (rama `main`).

---

## 1. Reparto en dos sesiones

- **Por qué dos sesiones y no una o un *swarm* de Antigravity:**
  - **Textos:** 126 textos con una sola voz y sin títulos repetidos piden un solo autor. Un *swarm* reparte por trozos, cambia el estilo de un trozo a otro y edita el mismo fichero (`js/02`) desde varios agentes.
  - **Resto:** solo había dos piezas listas para hacer en paralelo (VM1 y VM2). Por eso un *swarm* aportaba poco.
  - La guía de la biblioteca central (`GUIA_MODELOS_Y_MODOS_AGENTES.md`) considera equivalentes Claude Code y el Orchestrator de Antigravity para una funcionalidad normal.
- **`textos-4-3`** (rama `claude/textos-4-3-50d805`): `T1`, `T2` y `W11`.
- **`visor-botonera-4-3`** (rama `claude/visor-botonera-4-3-779d6f`): `VM1`–`VM3`, `V1` y `B1`–`B3`.
- **Reglas del reparto:**
  - Cada sesión trabaja en su *worktree*. Ninguna toca la versión ni los documentos compartidos: eso lo hace la sesión principal.
  - `js/02` solo lo escribe la sesión de textos. El Visor y la botonera leen de ahí los títulos (`stickerPorClave`, `rutaSticker`).
  - La botonera esperó a que los textos estuvieran en `main`.

## 2. Lore con fuentes

- Dos investigaciones en paralelo:
  - Una solo con fuentes oficiales: nailoong.com y sus textos internos, WeChat, YouTube y Bilibili.
  - Otra con Wikipedia, prensa, sentencias y wikis.
- Se comprobaron a mano, con los textos de la web oficial, las cifras de las fichas (180 cm, 2 t, 22 de enero; Xiao Qi 157 cm y 51 kg; Bombloong 120 cm, 1 t y 30 de julio) y los nombres en inglés («Seven», «Purtato»).
- Resultado: `documentacion/guias_y_contexto/LORE_NAILONG.md`, con cada dato etiquetado por tipo de fuente y una guía de qué decir y qué no.
- **Cambio de criterio:** Wikipedia solo vale si el dato lleva referencia. La ficha de la Wikipedia china dice «5 años» sin fuente y tiene una frase que parece vandalismo.
- `CONTEXTO_PROYECTO.md` llamaba a Bombloong «dragón esqueleto/robot». Ahora dice que es un dragón azul de cascarón de huevo y remite al documento de lore.

## 3. Integración (con el OK del usuario)

1. **Commits en `main`:**
   - `644d3f5`: tráiler horizontal. Fuera de Git quedan la caché de ondas `.waveform-cache/` y la unión `assets`.
   - `182d53a`: plan de la 4.3.0.
   - `4251b67`: lore.
2. **Fusión de la rama de textos:** `3954ac8`, sin conflictos. Después, `b4c5c95` enlaza la nota técnica 07 en el índice.
3. **Fusión de la rama del visor:** `a9b0923`, sin conflictos. Esa rama ya había traído `main` (`786f1c2`).
   - El usuario pidió en esa sesión integrarlo «ya como versión final». La sesión lo transmitió con sus palabras literales: «comunícate con las demás sesiones y dejadlo integrado ya como versión final; si no requiero de hacer más cambios lo subo, si no seguimos haciendo cambios».
4. **Versión 4.3.0 (D-27):**
   - Pie `v4.3.0` y los 13 sufijos `?v=4.3.0`. Test 40 actualizado.
   - «Tráiler oficial» pasa a «Nuestro tráiler», en la línea del lore: el proyecto no debe parecer del estudio.
   - `CHANGELOG.md`, `README.md` (novedades y líneas del Visor, el tráiler, la botonera y los disfraces), `ESTADO_ACTUAL.md` y `MEJORAS_PENDIENTES.md`. Lo aplicado sale de la lista y quedan `B3`, `B2-A`, `VM4`, `W35`–`W37` y `T3`.
   - `version.json` y el APK no cambian.

## 4. Verificación

- `py -3 verify_all.py` en `main` tras cada fusión y con la versión 4.3.0: **55 de 55 en verde**.
- **Revisión en el navegador con todo integrado** (la hizo la sesión del visor sobre `b761f0b`, en Chrome a 320, 375 y 1.366–1.536 px):
  - Revisado: la versión en el pie y los 13 `?v=4.3.0`, el Visor, «Crea tu sticker», el tráiler en horizontal y en vertical, la botonera, el hero, Bombloong desde el #117 y «Nuestro tráiler». Sin desbordes ni errores de consola.
  - Encontró un fallo que ya existía: en la reserva CSS de la pantalla completa del tráiler no había forma de salir. Se arregló en `893de4e` y se fusionó en `9b87958`, y `af80de6` lo añade al `CHANGELOG.md`. Suite: 55 de 55.
- **No comprobado:** los móviles reales, WhatsApp real y cómo suenan los sonidos nuevos (ver `ESTADO_ACTUAL.md` §4).

## 5. Cierre: demo de la app, récord del minijuego y app 4.0.1

- **Demo animada de la app (`DA1`)**, sesión `demo-app-banner`, rama `claude/demo-app-banner-83cede`. Detalle en su bitácora `2026-11-27_demo_app_banner.md`.
  - Contenido: demo simulada con HyperFrames en el banner, arreglo del botón cortado de la app (app 4.0.1, aprobado por el usuario en esa sesión) y test 56.
  - Reorganización a petición del usuario: «el vídeo de donde la app sea el de la demo, y el general esté cerca pero separado».
  - Commits `a07bf0a` (código) y `f05a6f9` (documentación). Los hizo la sesión principal: a la sesión de la demo el sistema de permisos le bloqueó el commit porque la autorización le llegó a través de otra sesión. El usuario había pedido aquí «déjalo todo unificado en cuanto a ramas y preparado».
  - Fusión `6667879`, sin conflictos.
- **Récord del minijuego**, sesión «Minijuego: highscore local y mejoras», que trabajó en `main` sin rama. La sesión principal hizo el commit (`5c0b3a5`) antes de la fusión de la demo, porque las dos tocaban `index.html` y `js/10`. Esa sesión probó el récord en el navegador; las mejoras que propuso para el minijuego quedan para otra versión, si el usuario las aprueba.
- **Documentación:**
  - `CHANGELOG.md`: demo, reorganización, récord, app 4.0.1 y 56 comprobaciones.
  - `README.md`: demo, app 4.0.1 y récord.
  - `ESTADO_ACTUAL.md`: cabecera, versiones, filas nuevas y §3–§5. La línea de la 4.2 deja de dar una cifra de tests que no le corresponde.
  - `MEJORAS_PENDIENTES.md`: `DA2`, `DA3` y `W38`.
  - `AGENTS.md`: ruta del código Android.
- **Ramas:** se borran las ramas y *worktrees* ya fusionados de esta versión (`textos-4-3`, `visor-botonera-4-3`). La de la demo se borra cuando el usuario archive su sesión. Las ramas antiguas del 3D y de Antigravity (`swarm-*`, `nailong-3d-fiel`, `nailong3d-frente`, `docs/adopcion-pautas-centrales`) no se tocan.

## 6. Qué queda

- **Publicar:** `git push` solo cuando el usuario lo apruebe.
  - Publica la web 4.3.0 y la app 4.0.1. Al publicarse `version.json`, las apps instaladas avisarán de la actualización.
  - La vuelta atrás es `git revert`; lo publicado antes es `618b225`.
- **Probar en móviles reales:**
  - La demo, «Crea tu sticker», la app 4.0.1 y el récord.
  - Escuchar la botonera.
- **`B3`:** espera a los episodios que descargue el usuario.
