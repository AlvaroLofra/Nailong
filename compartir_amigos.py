import http.server
import socketserver
import socket
import webbrowser
import os
import sys

# Ensure UTF-8 console output for emojis
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

def find_open_port(default_port=8000):
    for p in range(default_port, default_port + 20):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', p)) != 0:
                return p
    return default_port

def main():
    # Change working directory to the script's folder
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    local_ip = get_local_ip()
    port = find_open_port(8000)
    
    print("=" * 68)
    print("  🦖 ¡SERVIDOR LOCAL DE NAILONG (奶龙) PARA ENSEÑAR A TUS AMIGOS! ✨")
    print("=" * 68)
    print()
    print("📱 CÓMO ABRIRLO EN EL MÓVIL DE TUS AMIGOS (iPhone o Android):")
    print("   1. Conecta el móvil a la misma red Wi-Fi de tu casa.")
    print("   2. Abre Safari (en iPhone) o Chrome (en Android) y escribe:")
    print()
    print(f"      👉  http://{local_ip}:{port}")
    print()
    print("-" * 68)
    print("💻 EN ESTE ORDENADOR:")
    print(f"      👉  http://localhost:{port}")
    print("=" * 68)
    print("Pulsa [Ctrl + C] en esta ventana cuando quieras detener el servidor.")
    print()
    
    # Open local browser
    try:
        webbrowser.open(f"http://localhost:{port}")
    except Exception:
        pass

    Handler = http.server.SimpleHTTPRequestHandler
    Handler.extensions_map.update({
        '.webp': 'image/webp',
        '.json': 'application/json',
    })

    class ReusableTCPServer(socketserver.TCPServer):
        allow_reuse_address = True

    try:
        with ReusableTCPServer(("", port), Handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 ¡Servidor de Nailong detenido! ¡Hasta la próxima!")

if __name__ == '__main__':
    main()
