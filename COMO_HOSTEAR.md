# 🦖 Guía: Cómo Hostear y Compartir la Web de Nailong con tus Amigos ✨

¡Tu página web interactiva de **Nailong (奶龙)** está lista y optimizada al 100% para verse y jugarse perfectamente tanto en **iPhone (iOS Safari)** como en **Android (Chrome)**, tablets y ordenadores!

Aquí tienes las mejores formas gratuitas de publicarla o compartirla con tus amigos:

---

## 🚀 Opción 0: En Directo por Wi-Fi (¡Doble clic en tu PC sin subir nada!)

Si tus amigos están contigo en casa, en clase o conectados a tu misma red Wi-Fi:

1. Haz **doble clic** en el archivo:
   👉 **`compartir_amigos.bat`** (o ejecuta `python compartir_amigos.py`).
2. La ventana detectará automáticamente la dirección IP local de tu ordenador (por ejemplo `http://192.168.1.46:8000`).
3. Dile a tus amigos que abran **Safari en iPhone** o **Chrome en Android** y escriban esa dirección.
4. **¡Al segundo estarán dentro de la web jugando al minijuego y escuchando los sonidos!** No hace falta crear cuentas ni subir archivos.

---

## ⚡ Opción 1: Netlify Drop (La más rápida en la nube — ¡Sin comandos ni código en 30 segundos!)

Esta es la forma más fácil del mundo para tener un enlace web público en menos de 1 minuto:

1. Abre tu navegador y entra en: 👉 **[app.netlify.com/drop](https://app.netlify.com/drop)**
2. Arrastra la carpeta completa del proyecto (`Página Nailong`) y suéltala en el círculo punteado que aparece en la pantalla.
3. ¡Y listo! En 5 segundos Netlify subirá los archivos y te dará una dirección pública HTTPS gratuita (por ejemplo: `https://nailong-magico-123.netlify.app`).
4. **Pásale ese enlace a tus amigos por WhatsApp o Telegram** y lo verán al instante desde cualquier parte del mundo.

> 💡 *Tip:* Si te creas una cuenta gratuita en Netlify, puedes cambiar el nombre del enlace para que sea personalizado (ej. `https://el-mundo-de-nailong.netlify.app`).

---

## 🐙 Opción 2: GitHub Pages (100% Gratis y Permanente para siempre)

Si quieres tenerla guardada en tu cuenta de GitHub con un enlace fijo tipo `https://tu-usuario.github.io/nailong`:

1. Ve a **[GitHub.com](https://github.com)** e inicia sesión o crea una cuenta.
2. Crea un nuevo repositorio público (por ejemplo, llámalo `nailong` o `pagina-nailong`).
3. Sube los archivos de este directorio:
   - `index.html`
   - `el_mundo_m_gico_de_nailong.html`
   - `manifest.json`
   - La carpeta `Stickers Nailong/` (con todos los 42 stickers .webp)
4. En la barra superior de tu repositorio en GitHub, ve a **Settings** (Configuración) ⚙️.
5. En el menú lateral izquierdo, haz clic en **Pages**.
6. En la sección **Build and deployment > Branch**, selecciona la rama `main` (o `master`) y la carpeta `/ (root)`.
7. Haz clic en **Save** (Guardar).
8. Espera 1 minuto y verás el cartel verde: *"Your site is live at https://tu-usuario.github.io/nailong"*.

---

## ▲ Opción 3: Vercel (Ultra rápido con 1 clic)

1. Entra en **[vercel.com](https://vercel.com)** e inicia sesión con tu cuenta de GitHub o correo.
2. Haz clic en **Add New... > Project**.
3. Conéctalo con tu repositorio de GitHub de Nailong o arrastra la carpeta.
4. Pulsa **Deploy**.
5. En menos de 20 segundos tendrás un dominio seguro SSL automático tipo `https://nailong.vercel.app`.

---

## 🌐 Opción 4: Túnel Local Instantáneo (Con Localtunnel)

Si estás en tu ordenador y quieres enviar un enlace público provisional a un amigo que está lejos:

1. Abre la terminal PowerShell en esta carpeta y arranca un servidor local:
   ```powershell
   python -m http.server 8000
   ```
2. En otra ventana de terminal, genera un túnel público temporal seguro con `localtunnel`:
   ```powershell
   npx localtunnel --port 8000
   ```
3. La terminal te dará un enlace público tipo `https://cute-dragons-sing.loca.lt`.
4. Mándaselo a tu amigo por WhatsApp: cuando lo abra, verá la web directamente funcionando desde tu máquina.

---

## 📱 ¿Cómo está preparada la web para móviles (Android e iPhone)?

Hemos implementado todas las especificaciones y buenas prácticas recomendadas por Apple (iOS HIG) y Google (Material Design):

1. **Adaptación a Notches e Isla Dinámica (iPhone):**
   - Incorpora `viewport-fit=cover` y variables CSS `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, `env(safe-area-inset-left)` y `env(safe-area-inset-right)`. La barra de navegación, el pie y los botones nunca quedan tapados por la cámara frontal ni por la barra inferior de gestos de iOS.

2. **Cierre de Modales por Toque en Fondo (Backdrop Tap):**
   - En cualquier teléfono, tocar fuera de la ventana del Visor Mágico, Álbum de Fotos o Compartir cierra inmediatamente el modal sin tener que alcanzar la 'X'.

3. **Navegación Táctil por Gestos (Swipe Inteligente):**
   - En el **Visor Mágico** y en el **Álbum de Fotos**, puedes deslizar horizontalmente con el pulgar para cambiar de cromo como en TikTok o Instagram.
   - El swipe ignora el arrastre de stickers, botones y sliders para evitar cambios involuntarios.
   - Dispone además de botones táctiles inferiores *"Anterior"* y *"Siguiente"* adaptados a una sola mano.

4. **Arrastre de Stickers en el Visor Mágico:**
   - Arrastra pegatinas (muslitos, coronas, estrellas) suavemente con el dedo sin que la pantalla se desplace verticalmente.
   - Doble toque en el móvil para eliminar cualquier sticker.

5. **Controles Virtuales y Drag para el Minijuego:**
   - En pantallas táctiles aparecen botones grandes `◀️ Izquierda` y `Derecha ▶️` con soporte para pulsación continua y cancelación segura (`touchcancel`).
   - También puedes arrastrar el dedo directamente sobre la pantalla de juego para guiar a Nailong sin que la página web se desplace.

6. **Botón Integrado de Compartir (Web Share API) y QR:**
   - Al pulsar el botón `🚀`, en móviles compatibles se abre la ventana nativa de **WhatsApp, Mensajes, Telegram o AirDrop** con el título, descripción y foto de Nailong listos para enviar.
   - Incluye generador de **Código QR** para escanear con la cámara y botón para copiar enlace al portapapeles.

7. **Audio Desbloqueado para iOS Safari y Android:**
   - El sintetizador de sonido Web Audio API (`Duang~`, `pop`, mordisco crujiente, maracas, fanfare) se desbloquea suavemente con el primer toque en la pantalla sin errores de reproducción automática.

8. **Instalable como App en la Pantalla de Inicio (PWA):**
   - Incluye `manifest.json`, `<link rel="apple-touch-icon">` y `<link rel="icon">`.
   - **En iPhone (Safari):** Pulsa el botón de compartir de Safari (cuadrado con flecha hacia arriba) y selecciona *"Añadir a la pantalla de inicio"*. La web lucirá el icono oficial del dinosaurio amarillo y se abrirá a pantalla completa sin barras del navegador.
   - **En Android (Chrome):** Pulsa el menú de 3 puntos en Chrome y selecciona *"Instalar aplicación"* o *"Añadir a la pantalla de inicio"*.

¡Que disfrutes compartiendo a Nailong con tus amigos! 🦖💛🍗
