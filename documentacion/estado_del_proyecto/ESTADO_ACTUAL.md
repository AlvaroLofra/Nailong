# Estado Actual del Proyecto — ¡El Mundo Mágico de Nailong (奶龙)!

> **Regla de Actualización:** Este fichero se **sobrescribe en cada sesión** para reflejar la realidad de AHORA. El historial de sesiones reside en `bitacora_de_sesiones/` y las decisiones técnicas en `DECISIONES.md`.
>
> **Última actualización:** 31/10/2026 — Sesión «Adopción de las pautas de la biblioteca central» (D-14) y división de `index.html` (D-15), sobre v3.2.1 (sin cambios visibles de producto).
> **Rama activa:** `docs/adopcion-pautas-centrales` (subida a `origin`; `main` intacta hasta fusionar).
> **Versión actual de producción:** Web `v3.2.1` | Android APK `v3.2.1` (`versionCode 4`).

---

## 1. En una Frase

La aplicación web y la aplicación nativa Android se encuentran plenamente sincronizadas en la versión **v3.2.1**: la sección del Creador ha sido reubicada al pie de la página, el botón de exportación de «Mi Selección» abre de forma fluida el menú nativo de WhatsApp en cualquier dispositivo Android, y el proyecto cuenta con 44/44 pruebas de verificación superadas al 100%.

---

## 2. Cifras Clave del Proyecto (Ground Truth)

| Métrica / Concepto | Valor Verificado |
|---|---|
| **Punto único de entrada web** | `index.html` + `css/` + `js/` (SPA pura, 0 dependencias de compilación). |
| **Banco de cromos coleccionables** | Exactamente 82 stickers WebP (512×512 con chunk EXIF WhatsApp) + 1 foto optimizada del creador. |
| **Packs oficiales preconfigurados en Android** | 3 packs: *Nailong animado 1* (30), *Nailong animado 2* (30) y *Nailong estático* (22). |
| **Generador dinámico «Mi Selección»** | Mínimo 3 y máximo 30 stickers por lote, con bifurcación inteligente por tipo mixto. |
| **Paquete nativo Android firmado** | `StickersNailong.apk` (24.6 MB, firmado con esquemas v1 y v2). |
| **Botonera de sonidos sintetizados** | 12 casillas con síntesis Web Audio en tiempo real (0 archivos `.mp3`/`.wav`). |
| **Escenas virales en el Visor Mágico** | 9 animaciones WebP seleccionadas en bucle con control de velocidad (0.5x, 1x, 1.5x). |
| **Suite de pruebas automatizadas (`verify_all.py`)** | **44 de 44 comprobaciones superadas con éxito (100%)**. |
| **Suite de pruebas unitarias Android (`gradlew test`)** | **38 tareas completadas sin errores (BUILD SUCCESSFUL)**. |

---

## 3. Qué Está Completado y Verificado

- [x] **Web Interactiva:**
  - Hero elástico interactivo con pancita y contador de Duangs.
  - Visor Mágico en tira horizontal integrada en la sección `#galeria`.
  - Gran Álbum Polaroid con 82 cromos, paginación de 24 en 24 y persistencia de fotos en `localStorage`.
  - Laboratorio de Superpoderes con modo camaleón y lanzallamas en canvas.
  - Minijuego "La Gran Comilona" a 60 FPS con modo pantalla completa y HUD integrado.
  - **Reorganización:** Sección del creador (`#creador`) ubicada al final de la página (bajo el minijuego).
  - Barra superior responsive adaptada a pantallas estrechas (320 px sin desborde horizontal).
- [x] **Aplicación Nativa Android (`StickersNailong.apk`):**
  - Implementación de `StickerContentProvider` con permisos `com.whatsapp.sticker.READ`.
  - Integración nativa de la familia tipográfica Google Font **Fredoka**.
  - Píldora de feedback in-app instantáneo (0 ms de espera) sustituyendo Toasts del sistema.
  - Cuadrícula de stickers enmarcada en tarjeta Claymorphism con borde `#FDE047`.
  - Diálogo de renombrado suave de pack con botón de lápiz ✏️ (`dialog_import_selection.xml`).
  - Diálogo celebratorio de éxito (`dialog_success_whatsapp.xml`).
  - Corrección de captura de toques táctiles (`clickable="false"` y enlace dual de listeners).
  - Sobrescritura de `openFile()` y bypass de pipes en `StickerContentProvider`.
  - Icono del launcher calibrado al 72% de la *Safe Zone* de 108 dp.

---

- [x] **División de `index.html` (D-15):** `index.html` (≈1.060 líneas) + `css/styles.css` + `js/` (10 ficheros + config de Tailwind), contenido idéntico al original; comprobado en navegador local sin errores de consola.
- [x] **Material histórico (D-14 E):** `DeepResearch…md` y `PLAN_APP_STICKERS_WHATSAPP.md` en `archivo/`; `prueba_whatsapp/` eliminada.
- [x] **Instrucciones de agente (D-14):** `AGENTS.md` canónico (~55 líneas) · `CLAUDE.md`/`GEMINI.md` reducidos a punteros · `CHANGELOG.md` y `documentacion/notas_tecnicas/00_mapa_de_codigo.md` creados con el contenido que antes inflaba `CLAUDE.md` · `CLAUDE.local.md` (ignorado) con la ruta de la biblioteca central · `.gitignore` nuevo · `verify_all.py` (tests 33 y 35) adaptado; sigue en 44/44.

---

## 4. Qué Está Pendiente o Próximos Pasos

- [ ] **Decidir el commit** de la rama `docs/adopcion-pautas-centrales` (código y documentación en commits separados) y su fusión en `main`.
- [ ] **Fijar versiones CDN** (Tailwind sin versión, Font Awesome sin `integrity`) y decidir si `js/` pasa a módulos ES (D-15, abierta).
- [ ] **Fusionar la rama en `main`** para publicar la división en GitHub Pages (hoy solo está en la rama).
- [ ] `DOCUMENTACION.md` duplica a `documentacion/` y conserva cifras antiguas en su cuerpo (la suite lo exige); consolidarlo o retirarlo en una sesión propia.

- [ ] Validación manual en dispositivo físico por parte del usuario de la exportación fluida a WhatsApp.
- [ ] Exploración futura de empaquetado para Google Play Store según viabilidad.

---

## 5. Bloqueos o Dudas Abiertas

- **Ninguno:** Todos los tests pasan, el APK está firmado y compilado, y el repositorio web está sincronizado con GitHub Pages.
