"""Renderizador headless de Nailong en Blender con Eevee y canal alfa transparente.

Diseñado para ejecutarse desde terminal/agentes:
  blender -b -P render_nailong_eevee.py [-- --anim --frames 30]

Salida:
  - renders/nailong_saludo_alfa.png (fotograma de pose con fondo 100% transparente)
  - renders/secuencia/nailong_#####.png (opcional: secuencia de animación con fondo transparente)
Resolución: 1080x1920 (9:16 vertical) optimizada para Eevee y GPU de 4 GB VRAM.
"""
import os
import sys
import math
from pathlib import Path

# Detectar si se ejecuta dentro de Blender
try:
    import bpy
    IS_BLENDER = True
except ImportError:
    IS_BLENDER = False

SCRIPT_DIR = Path(__file__).resolve().parent
RENDERS_DIR = SCRIPT_DIR / "renders"
RENDERS_DIR.mkdir(parents=True, exist_ok=True)
MODELOS_DIR = SCRIPT_DIR / "modelos"
MODELOS_DIR.mkdir(parents=True, exist_ok=True)

def limpiar_escena_completa():
    """Limpia la escena por completo para evitar cubos o primitivas residuales por defecto."""
    bpy.ops.wm.read_factory_settings(use_empty=True)

def configurar_escena_eevee(res_x=1080, res_y=1920, fps=30):
    scene = bpy.context.scene
    
    # Motor Eevee optimizado
    try:
        scene.render.engine = 'BLENDER_EEVEE_NEXT'
    except Exception:
        scene.render.engine = 'BLENDER_EEVEE'

    scene.render.resolution_x = res_x
    scene.render.resolution_y = res_y
    scene.render.fps = fps
    
    # Fondo 100% transparente para composición
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '8'
    
    # Vista Standard para colores cartoon vivos y saturados (evita desaturación de AgX)
    try:
        scene.view_settings.view_transform = 'Standard'
    except Exception:
        pass
    
    print(f"[Blender] Motor: {scene.render.engine} | {res_x}x{res_y} @ {fps}fps | Alfa: {scene.render.film_transparent}")
    return scene

def crear_camara_calibrada(target_z=1.25):
    """Crea una cámara vertical 9:16 perfectamente alineada y calibrada con el personaje."""
    cam_data = bpy.data.cameras.new("Main_Camera")
    cam_data.lens = 45
    cam_data.sensor_fit = 'AUTO'
    cam_obj = bpy.data.objects.new("Main_Camera", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Posicionar cámara de frente a 7.2m para encuadre equilibrado
    cam_obj.location = (0.0, -7.2, target_z)
    cam_obj.rotation_euler = (math.radians(90), 0.0, 0.0)
    print(f"[Blender] Cámara configurada en {cam_obj.location}")
    return cam_obj

def configurar_iluminacion_estudio():
    """Iluminación de estudio en tres puntos suave y cálida."""
    # Key light (cálida principal)
    light_data_key = bpy.data.lights.new(name="Key_Light", type='POINT')
    light_data_key.energy = 1100
    light_data_key.color = (1.0, 0.96, 0.90)
    light_data_key.shadow_soft_size = 0.6
    light_key = bpy.data.objects.new(name="Key_Light", object_data=light_data_key)
    bpy.context.collection.objects.link(light_key)
    light_key.location = (2.2, -3.0, 3.2)

    # Fill light (luz suave de relleno frontal)
    light_data_fill = bpy.data.lights.new(name="Fill_Light", type='POINT')
    light_data_fill.energy = 700
    light_data_fill.color = (1.0, 0.98, 0.95)
    light_data_fill.shadow_soft_size = 0.8
    light_fill = bpy.data.objects.new(name="Fill_Light", object_data=light_data_fill)
    bpy.context.collection.objects.link(light_fill)
    light_fill.location = (-2.0, -3.2, 1.8)

    # Rim light (luz trasera para recortar silueta)
    light_data_rim = bpy.data.lights.new(name="Rim_Light", type='POINT')
    light_data_rim.energy = 850
    light_data_rim.color = (1.0, 0.9, 0.6)
    light_rim = bpy.data.objects.new(name="Rim_Light", object_data=light_data_rim)
    bpy.context.collection.objects.link(light_rim)
    light_rim.location = (0.0, 2.8, 2.8)

def crear_material(name, base_color, roughness=0.35, specular=0.5):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        if "Base Color" in bsdf.inputs:
            bsdf.inputs["Base Color"].default_value = base_color
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        if "Specular IOR Level" in bsdf.inputs:
            bsdf.inputs["Specular IOR Level"].default_value = specular
        elif "Specular" in bsdf.inputs:
            bsdf.inputs["Specular"].default_value = specular
    return mat

def crear_procedural_nailong():
    """Genera la figura 3D completa de Nailong con cuerpo regordete, pancita, cuernos, ojos, boca sonriente, coloretes, brazos y cola."""
    # Materiales oficiales de Nailong (amarillo vivo, pancita crema, boca sonriente y lengua)
    mat_amarillo = crear_material("Nailong_Amarillo", (1.0, 0.70, 0.04, 1.0), roughness=0.25)
    mat_crema = crear_material("Nailong_Pancita", (1.0, 0.94, 0.80, 1.0), roughness=0.35)
    mat_ojos = crear_material("Nailong_Ojos", (0.04, 0.04, 0.04, 1.0), roughness=0.08, specular=0.9)
    mat_brillo = crear_material("Nailong_Brillo", (1.0, 1.0, 1.0, 1.0), roughness=0.05)
    mat_colorete = crear_material("Nailong_Colorete", (1.0, 0.42, 0.48, 1.0), roughness=0.4)
    mat_boca = crear_material("Nailong_Boca", (0.42, 0.04, 0.06, 1.0), roughness=0.25)
    mat_lengua = crear_material("Nailong_Lengua", (1.0, 0.30, 0.42, 1.0), roughness=0.25)
    mat_nariz = crear_material("Nailong_Nariz", (0.65, 0.38, 0.08, 1.0), roughness=0.4)

    # 1. Cuerpo principal elíptico en pera
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=32, radius=1.0, location=(0, 0, 1.15))
    cuerpo = bpy.context.active_object
    cuerpo.name = "Nailong_Cuerpo"
    cuerpo.scale = (1.05, 0.98, 1.25)
    cuerpo.data.materials.append(mat_amarillo)
    bpy.ops.object.shade_smooth()

    # 2. Pancita redondita frontal (crema)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=0.68, location=(0, -0.62, 0.95))
    pancita = bpy.context.active_object
    pancita.name = "Nailong_Pancita"
    pancita.scale = (0.9, 0.45, 1.0)
    pancita.data.materials.append(mat_crema)
    bpy.ops.object.shade_smooth()

    # 3. Cuernitos pequeños en la cabeza
    for x_pos, name in [(-0.35, "Cuerno_Izq"), (0.35, "Cuerno_Der")]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.18, location=(x_pos, -0.05, 2.35))
        cuerno = bpy.context.active_object
        cuerno.name = f"Nailong_{name}"
        cuerno.scale = (0.7, 0.7, 1.3)
        cuerno.rotation_euler = (math.radians(-10), math.radians(-15 if x_pos < 0 else 15), 0)
        cuerno.data.materials.append(mat_amarillo)
        bpy.ops.object.shade_smooth()

    # 4. Ojos redondos y tiernos
    for x_pos, name in [(-0.32, "Ojo_Izq"), (0.32, "Ojo_Der")]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=20, radius=0.13, location=(x_pos, -0.92, 1.75))
        ojo = bpy.context.active_object
        ojo.name = f"Nailong_{name}"
        ojo.scale = (0.85, 0.5, 1.1)
        ojo.data.materials.append(mat_ojos)
        bpy.ops.object.shade_smooth()

        # Brillo especular en el ojo
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=12, radius=0.035, location=(x_pos - 0.03, -0.99, 1.80))
        brillo = bpy.context.active_object
        brillo.name = f"Nailong_Brillo_{name}"
        brillo.data.materials.append(mat_brillo)
        bpy.ops.object.shade_smooth()

    # 5. Nariz tierno (dos puntitos sutiles entre ojos y boca)
    for x_pos, name in [(-0.06, "Nariz_Izq"), (0.06, "Nariz_Der")]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.018, location=(x_pos, -1.02, 1.55))
        nariz = bpy.context.active_object
        nariz.name = f"Nailong_{name}"
        nariz.scale = (0.8, 0.5, 1.0)
        nariz.data.materials.append(mat_nariz)
        bpy.ops.object.shade_smooth()

    # 6. Boca abierta y sonriente (mate, forma de media luna tierno)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=18, radius=0.13, location=(0, -0.96, 1.38))
    boca = bpy.context.active_object
    boca.name = "Nailong_Boca"
    boca.scale = (1.5, 0.3, 0.7)
    boca.data.materials.append(mat_boca)
    bpy.ops.object.shade_smooth()

    # Lengua rosita dentro de la boca
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.09, location=(0, -0.98, 1.34))
    lengua = bpy.context.active_object
    lengua.name = "Nailong_Lengua"
    lengua.scale = (1.1, 0.35, 0.5)
    lengua.data.materials.append(mat_lengua)
    bpy.ops.object.shade_smooth()

    # 7. Coloretes rositas en las mejillas
    for x_pos, name in [(-0.55, "Mejilla_Izq"), (0.55, "Mejilla_Der")]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.12, location=(x_pos, -0.80, 1.48))
        mejilla = bpy.context.active_object
        mejilla.name = f"Nailong_{name}"
        mejilla.scale = (1.0, 0.2, 0.6)
        mejilla.data.materials.append(mat_colorete)
        bpy.ops.object.shade_smooth()

    # 6. Brazos rechonchos (Brazo derecho levantado saludando)
    # Brazo izquierdo relajado
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.25, location=(-0.95, -0.15, 1.15))
    brazo_izq = bpy.context.active_object
    brazo_izq.name = "Nailong_Brazo_Izq"
    brazo_izq.scale = (0.7, 0.8, 1.4)
    brazo_izq.rotation_euler = (math.radians(15), math.radians(20), 0)
    brazo_izq.data.materials.append(mat_amarillo)
    bpy.ops.object.shade_smooth()

    # Brazo derecho saludando arriba
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.26, location=(1.0, -0.3, 1.6))
    brazo_der = bpy.context.active_object
    brazo_der.name = "Nailong_Brazo_Der"
    brazo_der.scale = (0.7, 0.8, 1.4)
    brazo_der.rotation_euler = (math.radians(-25), math.radians(-55), math.radians(30))
    brazo_der.data.materials.append(mat_amarillo)
    bpy.ops.object.shade_smooth()

    # 7. Patitas regordetas en la base
    for x_pos, name in [(-0.45, "Pie_Izq"), (0.45, "Pie_Der")]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.28, location=(x_pos, -0.35, 0.15))
        pie = bpy.context.active_object
        pie.name = f"Nailong_{name}"
        pie.scale = (0.9, 1.4, 0.65)
        pie.data.materials.append(mat_amarillo)
        bpy.ops.object.shade_smooth()

    # 8. Colita simpática curvada detrás
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.35, location=(0, 0.95, 0.6))
    cola = bpy.context.active_object
    cola.name = "Nailong_Cola"
    cola.scale = (0.8, 1.2, 0.8)
    cola.rotation_euler = (math.radians(-30), 0, 0)
    cola.data.materials.append(mat_amarillo)
    bpy.ops.object.shade_smooth()

    return cuerpo

def renderizar_pose_saludo(output_png):
    """Renderiza el fotograma estático de saludo con fondo transparente."""
    scene = bpy.context.scene
    scene.render.filepath = str(output_png)
    print(f"[Blender] Renderizando fotograma de pose en: {output_png}")
    bpy.ops.render.render(write_still=True)
    print(f"[Blender] Fotograma guardado exitosamente.")

def animar_saludo(frames=30):
    """Añade keyframes al brazo derecho y al cuerpo para una animación de saludo cíclica."""
    brazo = bpy.data.objects.get("Nailong_Brazo_Der")
    cuerpo = bpy.data.objects.get("Nailong_Cuerpo")
    if not brazo or not cuerpo:
        return

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = frames

    # Animación de rebote (Duang) en el cuerpo
    for f in range(1, frames + 1):
        t = (f - 1) / frames * 2 * math.pi
        cuerpo.location.z = 1.15 + math.sin(t * 2) * 0.05
        cuerpo.keyframe_insert(data_path="location", frame=f)

    # Animación de agitar la manita
    for f in range(1, frames + 1):
        t = (f - 1) / frames * 2 * math.pi
        brazo.rotation_euler.y = math.radians(-55) + math.sin(t * 4) * math.radians(18)
        brazo.rotation_euler.x = math.radians(-25) + math.cos(t * 4) * math.radians(8)
        brazo.keyframe_insert(data_path="rotation_euler", frame=f)

    print(f"[Blender] Animación de saludo configurada ({frames} fotogramas).")

if __name__ == "__main__" and IS_BLENDER:
    anim_mode = "--anim" in sys.argv
    frames_count = 30
    if "--frames" in sys.argv:
        try:
            idx = sys.argv.index("--frames")
            frames_count = int(sys.argv[idx + 1])
        except Exception:
            frames_count = 30

    limpiar_escena_completa()
    configurar_escena_eevee(1080, 1920, 30)
    configurar_iluminacion_estudio()
    crear_camara_calibrada(target_z=1.25)
    crear_procedural_nailong()

    if anim_mode:
        animar_saludo(frames=frames_count)
        seq_dir = RENDERS_DIR / "secuencia"
        seq_dir.mkdir(parents=True, exist_ok=True)
        bpy.context.scene.render.filepath = str(seq_dir / "nailong_")
        print(f"[Blender] Renderizando secuencia de animación en {seq_dir}...")
        bpy.ops.render.render(animation=True)
        print(f"[Blender] Secuencia completada.")
    else:
        salida = RENDERS_DIR / "nailong_saludo_alfa.png"
        renderizar_pose_saludo(salida)
