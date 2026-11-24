# Nailong 3D · versiones anteriores guardadas

Copias completas del Nailong 3D (los cuatro ficheros `js/11` a `js/14`) para poder **verlas, compararlas o restaurarlas** cuando se quiera. No se cargan en la web: solo están guardadas.

| Carpeta | Qué Nailong es | Cómo se ve |
|---|---|---|
| `2026-11-24_antes_de_ojos_lente/` | El que estaba en vigor justo antes de la versión 4.1: cara «V3» (curva en campana) y **ojos de bola** (los «saltones»). Cumple 21/21 de proporción y 5/5 de cara. | Láminas «antes» en `documentacion/referencias_nailong_serie/comparativas/3d12_final/` y `3d13_ojos_lente/antes_primeros_planos/` (solo en el equipo, fuera de Git). |
| `2026-11-18_v4.0.0_publicado/` | El que estaba publicado en la web desde la versión 4.0.0 (18/11/2026), antes de todas las mejoras de fidelidad del 23-24/11. | Es el modelo inicial (1/21 de proporción con las medidas actuales). |

## Cómo restaurar uno

Lo más sencillo: pedírselo a un agente, por ejemplo «restaura el Nailong 3D de `archivo/nailong3d_anteriores/2026-11-24_antes_de_ojos_lente`».

Pasos técnicos que seguirá:

1. Copiar los cuatro ficheros de la carpeta elegida sobre `js/` (mismos nombres).
2. Cambiar el sufijo `?v=` de las referencias a `css/` y `js/` en `index.html` para que GitHub Pages no sirva los ficheros viejos de caché (regla 7 de `AGENTS.md`).
3. Ejecutar `py -3 verify_all.py`:
   - con `2026-11-24_antes_de_ojos_lente` debe seguir en verde (mismo `js/13` y `js/14` que la 4.1);
   - con `2026-11-18_v4.0.0_publicado` fallarán las pruebas de proporciones 3D (test 49), que se escribieron después: habría que restaurar también la versión de `verify_all.py` de esa fecha (commit `32816a2`).
4. Revisar en el navegador con `?3d=1` y publicar como una versión más.

También están en el historial de Git: el del 18/11 es el commit `32816a2`; el de antes de los ojos «lente» no llegó a tener commit propio, por eso se guarda aquí.
