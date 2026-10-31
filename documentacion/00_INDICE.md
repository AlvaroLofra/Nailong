# Índice Maestro de la Documentación — ¡El Mundo Mágico de Nailong (奶龙)! 🦖

> Punto de entrada de **toda** la documentación del proyecto **El Mundo Mágico de Nailong (奶龙)**. Si eres un desarrollador nuevo o una sesión de IA sin contexto previo, empieza por el apartado «Leer en este orden».
>
> **Regla de Mantenimiento:** Cada documento técnico o registro nuevo se añade a este índice en el mismo commit que lo crea.

---

## 🧭 Leer en este orden

| Paso | Documento | Para qué |
|---|---|---|
| **1** | [`estado_del_proyecto/ESTADO_ACTUAL.md`](estado_del_proyecto/ESTADO_ACTUAL.md) | Qué hay hecho, qué métricas tenemos y cuál es el estado del proyecto **ahora mismo**. |
| **2** | [`estado_del_proyecto/DECISIONES.md`](estado_del_proyecto/DECISIONES.md) | Registro de Decisiones de Arquitectura (ADR-01 a ADR-13): qué se decidió y por qué. |
| **3** | Última entrada en [`estado_del_proyecto/bitacora_de_sesiones/`](estado_del_proyecto/bitacora_de_sesiones/) | Qué se hizo en la sesión más reciente y cómo retomar el trabajo. |
| **4** | [`../GEMINI.md`](../GEMINI.md) / [`../CLAUDE.md`](../CLAUDE.md) | Reglas de gobernanza, protocolo de biblioteca central, comandos silenciosos y paridad de LLMs. |
| **5** | [`guias_y_contexto/CONTEXTO_PROYECTO.md`](guias_y_contexto/CONTEXTO_PROYECTO.md) | Universo de Nailong, principios de diseño Claymorphism, paleta y requisitos clave. |
| **6** | [`guias_y_contexto/GUIA_DESARROLLO.md`](guias_y_contexto/GUIA_DESARROLLO.md) | Flujo buildless, compilación y firma del APK Android, y suite `verify_all.py`. |

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
| `../index.html` | Punto único de entrada de la SPA web interactiva (HTML5, Tailwind CDN, JS vanilla). |
| `../StickersNailong.apk` | Paquete de instalación directa de la aplicación nativa Android (24.6 MB, v3.2.1). |
| `../Stickers Nailong/` | Colección oficial de 82 cromos WebP normalizados + foto del creador. |
| `../verify_all.py` | Suite de pruebas automatizadas (44 comprobaciones estructurales y funcionales). |
| `../README.md` | Portada pública del proyecto con notas de parche directas para usuarios. |
| `../DOCUMENTACION.md` | Documentación técnica consolidada para compatibilidad con la suite de verificación. |
| `../GEMINI.md` / `../CLAUDE.md` | Contexto e instrucciones de gobernanza técnica para agentes (paridad 100% SHA-256). |

---

## 📌 Regla de Redacción: Vitrina Pública vs. Base de Conocimiento

- **Vitrina Pública (`README.md`):** Redacción directa, clara y concisa orientada al usuario final. Frases cortas sobre lo que el usuario ve, experimenta o recibe en cada versión, **sin justificaciones técnicas internas, sin código y sin explicaciones defensivas**.
- **Base Técnica (`documentacion/` y `DOCUMENTACION.md`):** Registro de ingeniería riguroso, trazabilidad de código, causas raíz, alternativas descartadas y análisis de arquitectura.

---

## 🗺️ Dónde está cada documento técnico

| Componente / Tema | Documento |
|---|---|
| Foto fija del proyecto hoy | [`estado_del_proyecto/ESTADO_ACTUAL.md`](estado_del_proyecto/ESTADO_ACTUAL.md) |
| Historial de decisiones de arquitectura (ADRs) | [`estado_del_proyecto/DECISIONES.md`](estado_del_proyecto/DECISIONES.md) |
| Bitácoras de sesiones | [`estado_del_proyecto/bitacora_de_sesiones/`](estado_del_proyecto/bitacora_de_sesiones/) |
| App Android nativa y `StickerContentProvider` | [`notas_tecnicas/01_app_android_whatsapp_stickers.md`](notas_tecnicas/01_app_android_whatsapp_stickers.md) |
| Normalización de stickers WebP y metadatos WhatsApp | [`notas_tecnicas/02_normalizacion_stickers_webp.md`](notas_tecnicas/02_normalizacion_stickers_webp.md) |
| Motor de audio sintetizado con Web Audio API | [`notas_tecnicas/03_web_audio_sintetizado.md`](notas_tecnicas/03_web_audio_sintetizado.md) |
| Minijuego Canvas a 60 FPS y aceleración GPU | [`notas_tecnicas/04_minijuego_y_rendimiento_gpu.md`](notas_tecnicas/04_minijuego_y_rendimiento_gpu.md) |
