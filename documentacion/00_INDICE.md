# Índice Maestro de la Documentación — ¡El Mundo Mágico de Nailong (奶龙)! 🦖

> Punto de entrada de **toda** la documentación del proyecto **El Mundo Mágico de Nailong (奶龙)**. Si eres un desarrollador nuevo o una sesión de IA sin contexto previo, empieza por el apartado «Leer en este orden».
>
> **Regla de Mantenimiento:** Cada documento técnico o registro nuevo se añade a este índice en el mismo commit que lo crea.

---

## 🧭 Leer en este orden

| Paso | Documento | Para qué |
|---|---|---|
| **1** | [`estado_del_proyecto/ESTADO_ACTUAL.md`](estado_del_proyecto/ESTADO_ACTUAL.md) | Qué hay hecho, qué métricas tenemos y cuál es el estado del proyecto **ahora mismo**. |
| **2** | [`estado_del_proyecto/DECISIONES.md`](estado_del_proyecto/DECISIONES.md) | Registro de Decisiones de Arquitectura (D-01 a D-19): qué se decidió y por qué. |
| **3** | Última entrada en [`estado_del_proyecto/bitacora_de_sesiones/`](estado_del_proyecto/bitacora_de_sesiones/) | Qué se hizo en la sesión más reciente y cómo retomar el trabajo. |
| **4** | [`../AGENTS.md`](../AGENTS.md) | Reglas del proyecto, comandos, protocolo de sesión y decisiones abiertas. `CLAUDE.md` y `GEMINI.md` solo apuntan a él (D-14). |
| **5** | [`guias_y_contexto/CONTEXTO_PROYECTO.md`](guias_y_contexto/CONTEXTO_PROYECTO.md) | Universo de Nailong, principios de diseño Claymorphism, paleta y requisitos clave. |
| **6** | [`guias_y_contexto/GUIA_DESARROLLO.md`](guias_y_contexto/GUIA_DESARROLLO.md) | Flujo buildless, compilación y firma del APK Android, y suite `verify_all.py`. |
| **7** | [`notas_tecnicas/00_mapa_de_codigo.md`](notas_tecnicas/00_mapa_de_codigo.md) | Qué vive en cada fichero de `js/` y `index.html` (antes de tocar código web). |
| *Si tocas el README* | [`guias_y_contexto/GUIA_README.md`](guias_y_contexto/GUIA_README.md) | Guía de estilo obligatoria de la vitrina pública. |
| *Ideas sin aplicar* | [`estado_del_proyecto/MEJORAS_PENDIENTES.md`](estado_del_proyecto/MEJORAS_PENDIENTES.md) | Mejoras visuales/de interfaz pendientes. |

---

## 📂 Qué hay en cada carpeta

| Carpeta | Contenido | ¿Se edita? |
|---|---|---|
| `estado_del_proyecto/` | `ESTADO_ACTUAL.md` (se sobrescribe en cada sesión), `DECISIONES.md` (solo se añade) y `bitacora_de_sesiones/` (una bitácora por sesión). | **Sí, en cada sesión** |
| `guias_y_contexto/` | Contexto narrativo, principios de diseño de interfaz y guía operativa de desarrollo. | Cuando cambie algo estable |
| `notas_tecnicas/` | Una nota por subsistema técnico: WhatsApp ContentProvider, Muxer WebP, Web Audio y Canvas GPU. | Sí, al modificar componentes técnicos |

Fuera de esta carpeta:

| Ruta | Contenido |
|---|---|
| `../index.html` | Punto único de entrada de la SPA web (HTML5 + Tailwind CDN); carga `css/` y `js/`. |
| `../css/` · `../js/` | Estilos y scripts de la web, divididos por bloque funcional (D-15; mapa en `notas_tecnicas/00_mapa_de_codigo.md`). |
| `../archivo/` | Material histórico (investigación y plan antiguos). No se lee salvo petición. |
| `../StickersNailong.apk` | Paquete de instalación directa de la aplicación nativa Android (versión y peso: `version.json`). |
| `../Stickers Nailong/` | Colección oficial de cromos WebP normalizados (total en `ESTADO_ACTUAL.md`) + foto del creador + 1 descatalogado. |
| `../verify_all.py` | Suite de pruebas automatizadas (estructurales y funcionales; nº actual en `ESTADO_ACTUAL.md`). |
| `../README.md` | Portada pública del proyecto con notas de parche directas para usuarios. |
| `../DOCUMENTACION.md` | Puntero a esta carpeta (lo exige la suite de verificación; no lleva contenido propio). |
| `../AGENTS.md` | Instrucciones canónicas para agentes de IA (< 200 líneas). |
| `../CLAUDE.md` / `../GEMINI.md` | Punteros a `AGENTS.md` (sin copiar contenido). |
| `../CLAUDE.local.md` | (No está en Git) Rutas y datos de la máquina del usuario, incl. la biblioteca central de pautas. |
| `../CHANGELOG.md` | Historial técnico de versiones (v1.0.0 → v3.4.1). |

---

## 📌 Regla de Redacción: Vitrina Pública vs. Base de Conocimiento

- **Vitrina Pública (`README.md`):** Redacción directa, clara y concisa orientada al usuario final. Frases cortas sobre lo que el usuario ve, experimenta o recibe en cada versión, **sin justificaciones técnicas internas, sin código y sin explicaciones defensivas**. Ver la guía canónica de obligado cumplimiento: [guias_y_contexto/GUIA_README.md](guias_y_contexto/GUIA_README.md).
- **Base Técnica (`documentacion/` y `DOCUMENTACION.md`):** Registro de ingeniería riguroso, trazabilidad de código, causas raíz, alternativas descartadas y análisis de arquitectura.
- **Historial Completo (CHANGELOG.md):** Todo el detalle técnico, versiones históricas y trazabilidad de ingeniería se conserva íntegramente aquí; el README.md no lo duplica.

---

## 🗺️ Dónde está cada documento técnico

| Componente / Tema | Documento |
|---|---|
| Foto fija del proyecto hoy | [`estado_del_proyecto/ESTADO_ACTUAL.md`](estado_del_proyecto/ESTADO_ACTUAL.md) |
| Historial de decisiones de arquitectura (ADRs) | [`estado_del_proyecto/DECISIONES.md`](estado_del_proyecto/DECISIONES.md) |
| Pautas de redacción del README (vitrina pública) | [guias_y_contexto/GUIA_README.md](guias_y_contexto/GUIA_README.md) |
| Contexto narrativo, principios y paleta de diseño | [guias_y_contexto/CONTEXTO_PROYECTO.md](guias_y_contexto/CONTEXTO_PROYECTO.md) |
| Guía operativa y compilación del APK | [guias_y_contexto/GUIA_DESARROLLO.md](guias_y_contexto/GUIA_DESARROLLO.md) |
| Mejoras visuales/de interfaz pendientes | [`estado_del_proyecto/MEJORAS_PENDIENTES.md`](estado_del_proyecto/MEJORAS_PENDIENTES.md) |
| Bitácoras de sesiones | [`estado_del_proyecto/bitacora_de_sesiones/`](estado_del_proyecto/bitacora_de_sesiones/) |
| App Android nativa y `StickerContentProvider` | [`notas_tecnicas/01_app_android_whatsapp_stickers.md`](notas_tecnicas/01_app_android_whatsapp_stickers.md) |
| Normalización de stickers WebP y metadatos WhatsApp | [`notas_tecnicas/02_normalizacion_stickers_webp.md`](notas_tecnicas/02_normalizacion_stickers_webp.md) |
| Mapa de ficheros, bloques y funciones de la web (para no buscar a ciegas) | [`notas_tecnicas/00_mapa_de_codigo.md`](notas_tecnicas/00_mapa_de_codigo.md) |
| Motor de audio sintetizado con Web Audio API | [`notas_tecnicas/03_web_audio_sintetizado.md`](notas_tecnicas/03_web_audio_sintetizado.md) |
| Minijuego Canvas a 60 FPS y aceleración GPU | [`notas_tecnicas/04_minijuego_y_rendimiento_gpu.md`](notas_tecnicas/04_minijuego_y_rendimiento_gpu.md) |
