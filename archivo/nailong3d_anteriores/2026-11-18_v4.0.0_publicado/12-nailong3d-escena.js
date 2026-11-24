        /* ==============================================================
           16. NAILONG 3D · ESCENA (malla con piel, accesorios, materiales y luces)
           Necesita THREE (r147, cargado bajo demanda por js/14) y el núcleo de js/11.
        ============================================================== */
        const Nailong3DEscena = (function () {
            'use strict';
            const G = Nailong3DGeometria;

            /* ---------- Materiales ---------- */
            // Relieve elástico gomoso al tocar: onda elástica concéntrica amortiguada con gradiente normal exacto.
            const GLSL_TOQUE_CABECERA = `
                uniform vec4 uToque[4];
                uniform float uToqueRadio;
            `;
            const GLSL_TOQUE_NORMAL = `
                #include <beginnormal_vertex>
                for (int i = 0; i < 4; i++) {
                    if (abs(uToque[i].w) > 0.0001) {
                        vec3 dd = position - uToque[i].xyz;
                        float d = length(dd);
                        float r2Onda = uToqueRadio * uToqueRadio * 0.35;
                        float env = exp(-0.5 * (d * d) / r2Onda);
                        float cOnda = cos(d * 48.0);
                        float sinc = d > 1e-4 ? sin(d * 48.0) / d : 48.0;
                        float grad = uToque[i].w * env * (cOnda / r2Onda + 48.0 * sinc);
                        vec3 ddt = dd - dot(dd, normal) * normal;
                        objectNormal -= grad * ddt;
                    }
                }
                objectNormal = normalize(objectNormal);
            `;
            const GLSL_TOQUE_POSICION = `
                #include <begin_vertex>
                for (int i = 0; i < 4; i++) {
                    if (abs(uToque[i].w) > 0.0001) {
                        vec3 dd = position - uToque[i].xyz;
                        float d = length(dd);
                        float r2Onda = uToqueRadio * uToqueRadio * 0.35;
                        float onda = exp(-0.5 * (d * d) / r2Onda) * cos(d * 48.0) * uToque[i].w;
                        transformed -= normal * onda;
                    }
                }
            `;

            function crearUniformesToque(THREE) {
                return {
                    uToque: { value: [0, 1, 2, 3].map(() => new THREE.Vector4(0, -5, 0, 0)) },
                    uToqueRadio: { value: 0.055 }
                };
            }

            const GLSL_PIEL_SUAVE_FRAG = `
                #include <tonemapping_fragment>
                {
                    vec3 nV = normalize(vNormal);
                    vec3 vDir = normalize(vViewPosition);
                    float ndv = clamp(dot(nV, vDir), 0.0, 1.0);
                    float fresnel = pow(1.0 - ndv, 2.6);
                    float luma = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
                    // Backlight translucency y wrap-around cálido miel/ámbar en luz rasante o contraluz (nuca, crestas, colita, papada)
                    float penumbra = smoothstep(0.06, 0.38, luma) * (1.0 - smoothstep(0.34, 0.72, luma));
                    float wrapAround = pow(1.0 - ndv, 2.2) * (0.35 + 0.65 * smoothstep(0.04, 0.50, luma));
                    vec3 sssMiel = vec3(1.0, 0.58, 0.12);
                    gl_FragColor.rgb += sssMiel * (penumbra * 0.22 + wrapAround * 0.18);
                    // Borde Fresnel aterciopelado dorado que realza la piel suave de dragón de leche
                    vec3 rimDorado = vec3(1.0, 0.88, 0.45);
                    gl_FragColor.rgb += rimDorado * (fresnel * 0.20);
                    // Levanta las sombras profundas evitando cualquier gris o suciedad sin perder el color crema/amarillo original
                    float sombra = 1.0 - smoothstep(0.05, 0.46, luma);
                    gl_FragColor.r = min(1.0, gl_FragColor.r + sombra * 0.08);
                    gl_FragColor.g = min(0.98, gl_FragColor.g * (1.0 - sombra * 0.02) + sombra * 0.045);
                    gl_FragColor.b = min(0.92, max(gl_FragColor.b * (1.0 - sombra * 0.14), 0.02 * sombra));
                }
            `;

            function inyectarToque(material, uniformes, extra) {
                material.onBeforeCompile = (shader) => {
                    shader.uniforms.uToque = uniformes.uToque;
                    shader.uniforms.uToqueRadio = uniformes.uToqueRadio;
                    if (extra && extra.uniforms) Object.assign(shader.uniforms, extra.uniforms);
                    shader.vertexShader = GLSL_TOQUE_CABECERA + (extra && extra.cabecera || '') + shader.vertexShader
                        .replace('#include <beginnormal_vertex>', GLSL_TOQUE_NORMAL)
                        .replace('#include <begin_vertex>', GLSL_TOQUE_POSICION)
                        .replace('#include <skinning_vertex>', '#include <skinning_vertex>\n' + (extra && extra.trasPiel || ''));
                    if (extra && extra.pielSuave) {
                        shader.fragmentShader = shader.fragmentShader.replace('#include <tonemapping_fragment>', GLSL_PIEL_SUAVE_FRAG);
                    }
                };
                material.customProgramCacheKey = () => 'nailong-toque-' + (extra ? extra.clave : 'base');
            }

            function rampaToon(THREE) {
                const tonos = [162, 196, 226, 248];
                const datos = new Uint8Array(tonos.length * 4);
                tonos.forEach((t, i) => { datos.set([t, t, t, 255], i * 4); });
                const tex = new THREE.DataTexture(datos, tonos.length, 1, THREE.RGBAFormat);
                tex.minFilter = tex.magFilter = THREE.NearestFilter;
                tex.generateMipmaps = false;
                tex.needsUpdate = true;
                return tex;
            }

            function crearMateriales(THREE, texOjo, uniformes) {
                const C = G.COLORES;
                const rampa = rampaToon(THREE);
                const suave = (color, extra) => new THREE.MeshPhysicalMaterial(Object.assign({
                    color: new THREE.Color(color), roughness: 0.74, metalness: 0,
                    sheen: 0.45, sheenRoughness: 0.72, sheenColor: new THREE.Color('#FFE8A8'), envMapIntensity: 0.26
                }, extra || {}));
                const toon = (color, extra) => new THREE.MeshToonMaterial(Object.assign({ color: new THREE.Color(color), gradientMap: rampa }, extra || {}));

                const m = {
                    suave: {
                        cuerpo: suave('#FFFFFF', { vertexColors: true }),
                        parpado: suave('#FFFFFF', { vertexColors: true }),
                        placa: suave(C.oliva, { roughness: 0.62, sheen: 0.22, envMapIntensity: 0.20 }),
                        garra: suave(C.garra, { roughness: 0.56, sheen: 0.06, clearcoat: 0.08, envMapIntensity: 0.14 }),
                        rosa: suave(C.rosa, { roughness: 0.84, sheen: 0.06, envMapIntensity: 0.12 }),
                        nariz: suave('#3A2414', { roughness: 0.5, sheen: 0 }),
                        boca: suave('#FFFFFF', { vertexColors: true, roughness: 0.52, sheen: 0.28, sheenRoughness: 0.60, sheenColor: new THREE.Color('#FFB4BE'), envMapIntensity: 0.16, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -28 }),
                        ojo: new THREE.MeshPhysicalMaterial({ map: texOjo, roughness: 0.16, clearcoat: 1.0, clearcoatRoughness: 0.03, envMapIntensity: 0.75 }),
                        brillo: new THREE.MeshBasicMaterial({ color: 0xffffff, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 })
                    },
                    toon: {
                        cuerpo: toon('#EAE0D0', { vertexColors: true }),
                        parpado: toon('#EAE0D0', { vertexColors: true }),
                        placa: toon('#7C8430'),
                        garra: toon('#56321A'),
                        rosa: toon(C.rosa),
                        nariz: toon('#3A2414'),
                        boca: toon('#E6DCD4', { vertexColors: true, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -28 }),
                        ojo: new THREE.MeshToonMaterial({ color: new THREE.Color('#E8E4DC'), map: texOjo, gradientMap: rampa }),
                        brillo: new THREE.MeshBasicMaterial({ color: 0xffffff, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 })
                    }
                };
                inyectarToque(m.suave.cuerpo, uniformes, { clave: 'piel-suave', pielSuave: true });
                inyectarToque(m.suave.parpado, uniformes, { clave: 'parpado-suave', pielSuave: true });
                inyectarToque(m.toon.cuerpo, uniformes, { clave: 'piel-toon', pielSuave: false });
                inyectarToque(m.toon.parpado, uniformes, { clave: 'parpado-toon', pielSuave: false });
                // Para el GLB: PBR estándar (sin extensiones vacías) con los mismos colores y texturas
                m.exportar = {};
                Object.keys(m.suave).forEach((k) => {
                    const o = m.suave[k];
                    m.exportar[k] = o.isMeshBasicMaterial ? o : new THREE.MeshStandardMaterial({
                        color: o.color.clone(), roughness: o.roughness, metalness: 0, map: o.map || null, vertexColors: o.vertexColors,
                        polygonOffset: o.polygonOffset, polygonOffsetFactor: o.polygonOffsetFactor, polygonOffsetUnits: o.polygonOffsetUnits
                    });
                });
                ['suave', 'toon', 'exportar'].forEach((est) => Object.keys(m[est]).forEach((k) => { m[est][k].name = 'Nailong_' + k; }));
                // Contorno de dibujo animado: casco invertido empujado por la normal tras la piel
                const contorno = new THREE.MeshBasicMaterial({ color: new THREE.Color('#4A2808'), side: THREE.BackSide });
                const grosor = { value: 0.0048 };
                inyectarToque(contorno, uniformes, {
                    clave: 'contorno', uniforms: { uGrosor: grosor }, cabecera: 'uniform float uGrosor;\n',
                    trasPiel: 'transformed += normalize(objectNormal) * uGrosor;'
                });
                m.contorno = contorno;
                m.grosorContorno = grosor;
                return m;
            }

            /* ---------- Textura del ojo (iris verde bosque con medialuna esmeralda y pupila grande de los stickers) ---------- */
            function crearTexturaOjo(THREE) {
                const W = 512, Hh = 256;
                const lienzo = document.createElement('canvas');
                lienzo.width = W; lienzo.height = Hh;
                const ctx = lienzo.getContext('2d');
                const img = ctx.createImageData(W, Hh);
                const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
                const cPupila = [0, 0, 0];
                const cIris = hex('#1F682A');
                const cAro = hex('#0E3014');
                const cEsmeralda = hex('#82D448');
                const cClaro = hex('#9AE858');
                const cEsclera = hex('#FFFFFF');
                const mezcla = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
                const sat = (x) => Math.min(Math.max(x, 0), 1);
                const smooth = (e0, e1, x) => { const t = sat((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
                const ANG_IRIS = 0.90, PUPILA = 0.67;

                for (let py = 0; py < Hh; py++) {
                    const th = (py + 0.5) / Hh * Math.PI;
                    const sinTh = Math.sin(th), cosTh = Math.cos(th);
                    for (let px = 0; px < W; px++) {
                        const ph = (px + 0.5) / W * Math.PI * 2;
                        const dx = -Math.cos(ph) * sinTh, dy = cosTh, dz = Math.sin(ph) * sinTh;
                        const ang = Math.acos(Math.max(-1, Math.min(1, dz)));
                        const r = ang / ANG_IRIS;
                        const az = Math.atan2(dy, dx);
                        let c;
                        if (r < 1.05) {
                            const dyNorm = -dy / Math.sin(ANG_IRIS);
                            // Medialuna esmeralda inferior luminosa (#82D448) característica de sticker_2, 47 y 50
                            const crescentH = smooth(-0.15, 0.85, dyNorm);
                            const crescentR = 1.0 - smooth(0.0, 0.22, Math.abs(r - 0.80));
                            const crescent = Math.pow(crescentH * crescentR, 0.88);

                            // Fibras radiales vivas sobre el iris verde bosque profundo (#1F682A)
                            const fibra1 = Math.sin(az * 36.0 + Math.sin(az * 6.0) * 1.5);
                            const fibra2 = Math.cos(az * 18.0);
                            const fibra3 = Math.sin(az * 72.0) * 0.15;
                            const fibras = 0.5 + 0.32 * fibra1 + 0.14 * fibra2 + fibra3;
                            const cCrescent = mezcla(cEsmeralda, cClaro, fibras * 0.45);
                            let cIrisBase = mezcla(cIris, cCrescent, crescent * 0.92);

                            // Modulación de fibras en la zona del iris entre pupila y anillo exterior
                            const tIrisZone = smooth(PUPILA - 0.02, 0.92, r);
                            const fVar = (fibras - 0.5) * 0.28 * tIrisZone;
                            cIrisBase = mezcla(cIrisBase, fVar > 0 ? cClaro : cAro, Math.abs(fVar));

                            // Anillo exterior verde bosque profundo
                            const tAroExt = smooth(0.78, 0.98, r);
                            c = mezcla(cIrisBase, cAro, tAroExt * 0.95);

                            // Sombra superior del párpado sobre el iris
                            const sombraSup = smooth(-0.10, 0.80, -dyNorm) * 0.40;
                            c = mezcla(c, cAro, sombraSup);

                            // Pupila negra nítida (PUPILA = 0.67) con antialiasing suave continuo
                            const tPupila = smooth(PUPILA + 0.012, PUPILA - 0.012, r);
                            c = mezcla(c, cPupila, tPupila);

                            // Transición antialiased limpia libre de artefactos en el borde del iris (r=1.0) hacia la esclera
                            if (r > 0.96) {
                                const tBorde = smooth(0.96, 1.03, r);
                                const cEscleraBase = mezcla(cEsclera, [238, 228, 216], smooth(1.0, 1.6, r) * 0.45);
                                c = mezcla(c, cEscleraBase, tBorde);
                            }
                        } else {
                            // Sombreado esférico cálido hacia la periferia evitando aspecto plano en 3/4 y perfil
                            const falloffEsclera = smooth(1.05, 1.70, r);
                            c = mezcla(cEsclera, [236, 226, 212], falloffEsclera * 0.50);
                            c = mezcla(c, [216, 202, 186], smooth(1.30, 1.90, r) * 0.35);
                        }
                        const o = (py * W + px) * 4;
                        img.data[o] = Math.round(c[0]);
                        img.data[o + 1] = Math.round(c[1]);
                        img.data[o + 2] = Math.round(c[2]);
                        img.data[o + 3] = 255;
                    }
                }
                ctx.putImageData(img, 0, 0);
                const tex = new THREE.CanvasTexture(lienzo);
                tex.encoding = THREE.sRGBEncoding;
                tex.anisotropy = 8;
                tex.wrapS = THREE.RepeatWrapping;
                tex.wrapT = THREE.ClampToEdgeWrapping;
                return tex;
            }

            /* ---------- Utilidades de colocación ---------- */
            function v3(THREE, a) { return new THREE.Vector3(a[0], a[1], a[2]); }

            // Coloca un objeto en coordenadas de reposo del mundo como hijo de un hueso (en reposo los huesos no giran)
            function adjuntar(obj, hueso, posReposo, quat) {
                const base = hueso.userData.reposoMundo;
                obj.position.set(posReposo.x - base.x, posReposo.y - base.y, posReposo.z - base.z);
                if (quat) obj.quaternion.copy(quat);
                hueso.add(obj);
                return obj;
            }

            // Busca la superficie disparando un rayo desde fuera hacia un punto interior
            function impacto(desde, hacia, tMax) {
                const d = [hacia[0] - desde[0], hacia[1] - desde[1], hacia[2] - desde[2]];
                return G.trazarRayo(desde[0], desde[1], desde[2], d[0], d[1], d[2], tMax || 4);
            }

            // Botón/garra/placa: geometría orientada según la normal y hundida una fracción de su grosor
            function bulto(THREE, geo, material, hit, radios, hundido, inclinar) {
                const n = v3(THREE, hit.n);
                const dir = inclinar ? n.clone().lerp(inclinar, 0.38).normalize() : n;
                const malla = new THREE.Mesh(geo, material);
                malla.scale.set(radios[0], radios[1], radios[2]);
                malla.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
                const p = v3(THREE, hit.p).addScaledVector(dir, radios[2] * (1 - 2 * hundido));
                return { malla, p };
            }

            /* ---------- Boca 3D: cavidad bucal en «D» hundida con interior oscuro, lengua volumétrica 3D y dientes superiores ---------- */
            function crearBoca(THREE, material, hueso) {
                const N_U = 36, N_S = 18;
                const ancla = impacto([0, 0.610, 1.2], [0, 0.610, 0.0]);
                const O = v3(THREE, ancla.p), n = v3(THREE, ancla.n);
                const T = new THREE.Vector3(0, 1, 0).cross(n).normalize();
                const B = n.clone().cross(T).normalize();
                // Mapa de altura del hocico: posición y normal de la superficie en una rejilla tangente
                const MU = 45, MV = 29, EU = 0.095, EV = 0.075;
                const mapa = new Float32Array(MU * MV * 6);
                for (let j = 0; j < MV; j++) for (let i = 0; i < MU; i++) {
                    const u = (i / (MU - 1) * 2 - 1) * EU, v = (j / (MV - 1) * 2 - 1) * EV;
                    const q = O.clone().addScaledVector(T, u).addScaledVector(B, v);
                    const desde = q.clone().addScaledVector(n, 0.25);
                    const hit = impacto([desde.x, desde.y, desde.z], [q.x - n.x * 0.1, q.y - n.y * 0.1, q.z - n.z * 0.1]) || { p: [q.x, q.y, q.z], n: [n.x, n.y, n.z] };
                    mapa.set([hit.p[0], hit.p[1], hit.p[2], hit.n[0], hit.n[1], hit.n[2]], (j * MU + i) * 6);
                }
                const muestrear = (u, v, out) => {
                    const fu = Math.min(Math.max((u / EU + 1) / 2 * (MU - 1), 0), MU - 1.001);
                    const fv = Math.min(Math.max((v / EV + 1) / 2 * (MV - 1), 0), MV - 1.001);
                    const i = Math.floor(fu), j = Math.floor(fv), a = fu - i, b = fv - j;
                    for (let c = 0; c < 6; c++) {
                        const v00 = mapa[(j * MU + i) * 6 + c], v10 = mapa[(j * MU + i + 1) * 6 + c];
                        const v01 = mapa[((j + 1) * MU + i) * 6 + c], v11 = mapa[((j + 1) * MU + i + 1) * 6 + c];
                        out[c] = (v00 * (1 - a) + v10 * a) * (1 - b) + (v01 * (1 - a) + v11 * a) * b;
                    }
                    return out;
                };
                const nv = N_U * N_S;
                const geo = new THREE.BufferGeometry();
                const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3);
                geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
                geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
                geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
                const idx = [];
                for (let s = 0; s < N_S - 1; s++) for (let u = 0; u < N_U - 1; u++) {
                    const a = s * N_U + u, b = a + 1, c = a + N_U, d = c + 1;
                    idx.push(a, b, d, a, d, c);
                }
                geo.setIndex(idx);
                const malla = new THREE.Mesh(geo, material);
                malla.userData.mat = 'boca';
                malla.renderOrder = 2;
                malla.frustumCulled = false;
                adjuntar(malla, hueso, new THREE.Vector3(hueso.userData.reposoMundo.x, hueso.userData.reposoMundo.y, hueso.userData.reposoMundo.z));
                malla.position.set(0, 0, 0);

                const lin = (h) => G.srgbALineal(h);
                const cBoca = lin('#5A181F'), cBocaSombra = lin('#380C10'), cLengua = lin(G.COLORES.lengua), cLenguaLuz = lin('#FFAAB6'), cDientes = lin(G.COLORES.dientes), cPiel = lin(G.COLORES.amarillo), cLabioSombra = lin('#DF8E14');
                const base = hueso.userData.reposoMundo;
                const tmp = new Float32Array(6);
                const forma = { ancho: 0.072, abierta: 0.50, sonrisa: 0.65, redonda: 0, dientes: 0.42, lengua: 1 };
                const sstep = (e0, e1, x) => { const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1); return t * t * (3 - 2 * t); };

                function actualizar(f) {
                    Object.assign(forma, f || {});
                    const ancho = forma.ancho * (1 - forma.redonda * 0.44);
                    const abre = Math.max(0.05, forma.abierta);
                    for (let s = 0; s < N_S; s++) for (let iu = 0; iu < N_U; iu++) {
                        const un = iu / (N_U - 1) * 2 - 1;          // -1..1 a lo ancho
                        const sn = s / (N_S - 1);                     // 0 (labio inferior) .. 1 (superior)
                        const u2 = un * un;
                        const perfil = Math.pow(Math.max(0, 1 - u2), 0.45 + 0.25 * (1 - forma.redonda));
                        // En sonrisa (sticker_2, 19), el labio superior describe un arco suave y el inferior baja en cuenco redondeado «D»
                        const arcoSup = forma.sonrisa * (u2 - 0.35) * 0.015 * (1 - forma.redonda);
                        const alto = abre * 0.088 * (0.66 + 0.34 * forma.redonda) * perfil;
                        const sup = arcoSup + Math.max(alto * (0.24 + 0.38 * forma.redonda), 0.0024 * perfil);
                        const inf = arcoSup - Math.max(alto * (0.96 - 0.24 * forma.redonda), 0.0024 * perfil);
                        const u = un * ancho, v = inf + (sup - inf) * sn;
                        muestrear(u, v, tmp);

                        const distBorde = Math.min(sn, 1 - sn) * 2 * perfil;
                        const tCavidad = sstep(0.04, 0.14, distBorde);
                        // Lengua redondeada con volumen 3D real en la mitad inferior de la cavidad (sticker_2, 19, 5)
                        const domoLengua = Math.max(0, 1 - Math.pow(un / 0.84, 2)) * sstep(0.70, 0.42, sn) * sstep(0.04, 0.16, sn);
                        const tLengua = forma.lengua * sstep(0.08, 0.22, abre) * domoLengua;
                        // Apoya sobre la superficie del SDF con domo volumétrico 3D prominente en la lengua
                        const elev = 0.00065 + 0.0022 * tLengua * tCavidad;
                        const k = s * N_U + iu;
                        pos[k * 3] = tmp[0] + tmp[3] * elev - base.x;
                        pos[k * 3 + 1] = tmp[1] + tmp[4] * elev - base.y;
                        pos[k * 3 + 2] = tmp[2] + tmp[5] * elev - base.z;

                        // Normales 3D: labio curvado hacia la cavidad y domo esférico para la lengua
                        const rollY = (sn < 0.5 ? -1 : 1) * (1 - tCavidad) * 0.40 + tLengua * (0.45 - (sn - 0.28) * 1.8);
                        const rollX = -un * 0.42 * tLengua;
                        let nx = tmp[3] + T.x * rollX + B.x * rollY;
                        let ny = tmp[4] + T.y * rollX + B.y * rollY;
                        let nz = tmp[5] + T.z * rollX + B.z * rollY;
                        const nl = Math.hypot(nx, ny, nz) || 1;
                        nor[k * 3] = nx / nl; nor[k * 3 + 1] = ny / nl; nor[k * 3 + 2] = nz / nl;

                        const luzLengua = sstep(0.14, 0.48, sn) * Math.max(0, 1 - Math.pow(un / 0.50, 2));
                        // Banda dental superior blanca limpia (#FFFFFF) visible en sonrisas amplias (sticker_19, 5, 21)
                        const techoDientes = 0.80 - 0.05 * u2;
                        const visDientes = sstep(0.08, 0.35, forma.dientes);
                        const tDientes = visDientes * sstep(0.12, 0.28, abre) * sstep(techoDientes - 0.16, techoDientes - 0.05, sn) * sstep(0.98, 0.90, sn) * sstep(0.78, 0.58, Math.abs(un));
                        const tSombraSup = sstep(0.54, 0.92, sn);
                        const tSombraLabio = sstep(0.0, 0.08, distBorde) * (1 - tCavidad);
                        for (let c = 0; c < 3; c++) {
                            let cav = cBoca[c] + (cBocaSombra[c] - cBoca[c]) * tSombraSup;
                            const lenC = cLengua[c] + (cLenguaLuz[c] - cLengua[c]) * luzLengua * 0.60;
                            cav = cav + (lenC - cav) * Math.min(1, tLengua * 1.25);
                            cav = cav + (cDientes[c] - cav) * tDientes;
                            const labio = cPiel[c] + (cLabioSombra[c] - cPiel[c]) * (0.45 * tSombraLabio + 0.25 * tCavidad);
                            col[k * 3 + c] = labio + (cav - labio) * tCavidad;
                        }
                    }
                    geo.attributes.position.needsUpdate = true;
                    geo.attributes.normal.needsUpdate = true;
                    geo.attributes.color.needsUpdate = true;
                }
                actualizar();
                return { malla, actualizar, forma };
            }

            /* ---------- Ojos, párpados integrados al ras de piel y brillos ---------- */
            function crearOjos(THREE, mats, hueso) {
                const O = G.OJO;
                const geoGlobo = new THREE.SphereGeometry(O.r, 48, 32);
                const rp = O.r + 0.0006;
                const geoSup = new THREE.SphereGeometry(rp, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2);
                const geoInf = new THREE.SphereGeometry(rp, 48, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
                // Párpado del mismo color amarillo de la piel, con línea ámbar sutil solo en el filo al cerrar
                const cPiel = G.srgbALineal(G.COLORES.amarillo), cBorde = G.srgbALineal('#D68618');
                [geoSup, geoInf].forEach((geo) => {
                    const p = geo.attributes.position, col = new Float32Array(p.count * 3);
                    for (let i = 0; i < p.count; i++) {
                        const t = Math.min(1, Math.abs(p.getY(i)) / (rp * 0.04));
                        for (let c = 0; c < 3; c++) col[i * 3 + c] = cBorde[c] + (cPiel[c] - cBorde[c]) * t * t * (3 - 2 * t);
                    }
                    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
                });

                // Geometría del brillo curvada esféricamente para offset radial uniforme exacto sobre el globo ocular
                function crearGeoBrillo(radioEsfera, radioBrillo, offset) {
                    const geo = new THREE.CircleGeometry(radioBrillo, 24);
                    const pos = geo.attributes.position;
                    const R = radioEsfera + offset;
                    for (let i = 0; i < pos.count; i++) {
                        const x = pos.getX(i), y = pos.getY(i);
                        const r2 = x * x + y * y;
                        pos.setZ(i, Math.sqrt(Math.max(0, R * R - r2)) - R);
                    }
                    geo.computeVertexNormals();
                    return geo;
                }

                // Offset calibrado: 0.00028 por encima de la córnea (evita Z-fighting) y por debajo del párpado (0.0006)
                const offsetBrillo = 0.00028;
                const ojos = [];
                [1, -1].forEach((lado) => {
                    const centro = new THREE.Vector3(O.x * lado, O.y, O.z);
                    const pivote = new THREE.Object3D();
                    adjuntar(pivote, hueso, centro);
                    // Mirada centrada hacia el espectador, dejando la medialuna de esclera blanca en el lado exterior (sticker_2, 47, 50)
                    pivote.rotation.y = -0.07 * lado;
                    pivote.rotation.x = 0.02;
                    const globo = new THREE.Mesh(geoGlobo, mats.ojo); globo.userData.mat = 'ojo';
                    const sup = new THREE.Mesh(geoSup, mats.parpado); sup.userData.mat = 'parpado';
                    const inf = new THREE.Mesh(geoInf, mats.parpado); inf.userData.mat = 'parpado';
                    const sufijo = lado > 0 ? 'Izq' : 'Der';
                    pivote.name = 'Nailong_ojo' + sufijo; globo.name = 'Nailong_globo' + sufijo;
                    sup.name = 'Nailong_parpadoSup' + sufijo; inf.name = 'Nailong_parpadoInf' + sufijo;
                    pivote.add(globo, sup, inf);
                    // Doble brillo especular nítido: círculo principal arriba a la derecha y secundario menor abajo a la izquierda (sticker_2, 47)
                    [[0.18, 0.25, 0.0125], [-0.24, -0.26, 0.0042]].forEach(([bx, by, br]) => {
                        const d = new THREE.Vector3(bx, by, Math.sqrt(Math.max(0, 1 - bx * bx - by * by))).normalize();
                        const geoB = crearGeoBrillo(O.r, br, offsetBrillo);
                        const b = new THREE.Mesh(geoB, mats.brillo); b.userData.mat = 'brillo';
                        b.position.copy(d).multiplyScalar(O.r + offsetBrillo);
                        b.lookAt(d.clone().multiplyScalar(2));
                        b.renderOrder = 3;
                        pivote.add(b);
                    });
                    ojos.push({ lado, globo, pivote, sup, inf });
                });
                return ojos;
            }

            /* ---------- Construcción completa del modelo ---------- */
            function crearModelo(THREE, malla, proxy, opciones) {
                const uniformes = crearUniformesToque(THREE);
                const texOjo = crearTexturaOjo(THREE);
                const M = crearMateriales(THREE, texOjo, uniformes);

                // Esqueleto
                const huesos = G.HUESOS.map((h) => {
                    const b = new THREE.Bone();
                    b.name = h.nombre;
                    b.userData.reposoMundo = v3(THREE, h.p);
                    return b;
                });
                G.HUESOS.forEach((h, i) => {
                    const padre = h.padre >= 0 ? G.HUESOS[h.padre].p : [0, 0, 0];
                    huesos[i].position.set(h.p[0] - padre[0], h.p[1] - padre[1], h.p[2] - padre[2]);
                    if (h.padre >= 0) huesos[h.padre].add(huesos[i]);
                });
                huesos.forEach((b) => { b.userData.reposo = { p: b.position.clone(), q: b.quaternion.clone(), s: b.scale.clone() }; });
                const esqueleto = new THREE.Skeleton(huesos);
                const porNombre = {};
                huesos.forEach((b) => { porNombre[b.name] = b; });

                const geometria = (d, conColor) => {
                    const g = new THREE.BufferGeometry();
                    g.setAttribute('position', new THREE.BufferAttribute(d.posiciones, 3));
                    g.setAttribute('normal', new THREE.BufferAttribute(d.normales, 3));
                    if (conColor && d.colores) g.setAttribute('color', new THREE.BufferAttribute(d.colores, 3));
                    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(d.huesoIndices, 4));
                    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(d.huesoPesos, 4));
                    g.setIndex(new THREE.BufferAttribute(d.indices, 1));
                    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.5, 0), 1.0);
                    return g;
                };

                const grupo = new THREE.Group();
                grupo.name = 'Nailong';
                const cuerpo = new THREE.SkinnedMesh(geometria(malla, true), M.suave.cuerpo);
                cuerpo.name = 'Nailong_cuerpo';
                cuerpo.userData.mat = 'cuerpo';
                cuerpo.castShadow = true; cuerpo.receiveShadow = true;
                cuerpo.frustumCulled = false;
                cuerpo.add(huesos[0]);
                cuerpo.bind(esqueleto);
                grupo.add(cuerpo);

                const contorno = new THREE.SkinnedMesh(cuerpo.geometry, M.contorno);
                contorno.name = 'Nailong_contorno';
                contorno.frustumCulled = false;
                contorno.visible = false;
                contorno.bind(esqueleto, cuerpo.bindMatrix);
                grupo.add(contorno);

                let mallaProxy = null;
                if (proxy) {
                    mallaProxy = new THREE.SkinnedMesh(geometria(proxy, false), new THREE.MeshBasicMaterial({ visible: false }));
                    mallaProxy.name = 'Nailong_proxy';
                    mallaProxy.visible = false;
                    mallaProxy.bind(esqueleto, cuerpo.bindMatrix);
                    grupo.add(mallaProxy);
                }

                // Accesorios
                const cabeza = porNombre.cabeza;
                const ojos = crearOjos(THREE, M.suave, cabeza);
                const boca = crearBoca(THREE, M.suave.boca, cabeza);
                const esfera = new THREE.SphereGeometry(1, 28, 18);
                // Geometría de garrita cónica redondeada (más afilada pero tierna en la punta +z, sticker 19, 52, 86)
                const geoGarra = new THREE.SphereGeometry(1, 24, 16);
                {
                    const gp = geoGarra.attributes.position;
                    for (let i = 0; i < gp.count; i++) {
                        const z = gp.getZ(i);
                        const s = z > 0 ? 1 - 0.42 * Math.pow(z, 1.3) : 1;
                        gp.setX(i, gp.getX(i) * s);
                        gp.setY(i, gp.getY(i) * s);
                    }
                    geoGarra.computeVertexNormals();
                }

                const poner = (hueso, matClave, hit, radios, hundido, inclinar, sombra, geoEsp) => {
                    if (!hit) return null;
                    const { malla: m, p } = bulto(THREE, geoEsp || esfera, M.suave[matClave], hit, radios, hundido, inclinar);
                    m.userData.mat = matClave;
                    m.castShadow = !!sombra;
                    adjuntar(m, hueso, p, m.quaternion.clone());
                    return m;
                };

                // 3 placas dorsales oliva redondeadas y prominentes en la parte posterior de la cabeza y nuca alineadas con la curvatura espinal (sticker 31, 52, 84)
                const cc = G.ANATOMIA.craneo.c;
                [[0.65, 0.046, 0.28], [1.05, 0.054, 0.28], [1.45, 0.044, 0.28]].forEach(([ang, r, hund]) => {
                    const dir = [0, Math.cos(ang), -Math.sin(ang)];
                    const hit = impacto([cc[0] + dir[0], cc[1] + dir[1], cc[2] + dir[2]], cc);
                    poner(cabeza, 'placa', hit, [r * 0.78, r * 1.04, r * 0.86], hund, null, true);
                });

                // Manos: almohadilla rosa en la cara palmar interna (sticker 52) y 3 garritas cónicas marrones en la punta orientadas hacia la pancita (sticker 86, 2, 19)
                const An = G.ANATOMIA;
                [1, -1].forEach((l) => {
                    const hueso = l > 0 ? porNombre.brazoIzq : porNombre.brazoDer;
                    const a = new THREE.Vector3(An.brazo.a[0] * l, An.brazo.a[1], An.brazo.a[2]);
                    const b = new THREE.Vector3(An.brazo.b[0] * l, An.brazo.b[1], An.brazo.b[2]);
                    const eje = b.clone().sub(a).normalize();
                    const palma = new THREE.Vector3(-0.78 * l, -0.32, 0.54).normalize();
                    const arriba = new THREE.Vector3(-0.42 * l, 0.58, 0.70).normalize();
                    const c = new THREE.Vector3(An.mano.c[0] * l, An.mano.c[1], An.mano.c[2]);
                    const dirPalma = new THREE.Vector3(-0.70 * l, -0.20, 0.68).normalize();
                    const desdePalma = c.clone().addScaledVector(dirPalma, 0.12);
                    poner(hueso, 'rosa', impacto([desdePalma.x, desdePalma.y, desdePalma.z], [c.x, c.y, c.z], 0.20), [0.022, 0.024, 0.007], 0.46);
                    [-0.44, 0, 0.44].forEach((ang) => {
                        const d = palma.clone().multiplyScalar(0.66).addScaledVector(eje, 0.52).addScaledVector(arriba, 0.50 * Math.sin(ang)).normalize();
                        const desde = c.clone().addScaledVector(d, 0.092);
                        poner(hueso, 'garra', impacto([desde.x, desde.y, desde.z], [c.x, c.y, c.z], 0.15), [0.0125, 0.0115, 0.022], 0.38, d, false, geoGarra);
                    });
                });

                // Pies: 3 uñitas marrones cónicas rechonchas delante orientadas hacia la pancita (sticker 86, 43, 30)
                [1, -1].forEach((l) => {
                    const hueso = l > 0 ? porNombre.piernaIzq : porNombre.piernaDer;
                    const c = new THREE.Vector3(An.pie.c[0] * l, An.pie.c[1] + 0.004, An.pie.c[2]);
                    [-0.40, 0, 0.40].forEach((ang) => {
                        const d = new THREE.Vector3(Math.sin(ang) * 0.85 + 0.08 * l, -0.16, Math.cos(ang)).normalize();
                        const desde = c.clone().addScaledVector(d, 0.16);
                        poner(hueso, 'garra', impacto([desde.x, desde.y, desde.z], [c.x, c.y, c.z], 0.25), [0.0155, 0.0130, 0.020], 0.42, new THREE.Vector3(Math.sin(ang) * 0.3, -0.25, 1).normalize(), false, geoGarra);
                    });
                });

                const modelo = {
                    grupo, cuerpo, contorno, proxy: mallaProxy, esqueleto, huesos: porNombre, ojos, boca,
                    materiales: M, uniformes, estilo: 'suave', texOjo
                };
                modelo.setEstilo = (estilo) => {
                    modelo.estilo = estilo;
                    grupo.traverse((o) => {
                        if (o.isMesh && o.userData.mat && M[estilo][o.userData.mat]) o.material = M[estilo][o.userData.mat];
                    });
                    contorno.visible = estilo === 'toon';
                };
                return modelo;
            }

            /* ---------- Estudio: entorno PMREM cálido, luces suaves equilibradas y suelo con sombra ---------- */
            function crearEstudio(THREE, renderer, escena, calidad) {
                // Entorno de estudio propio (cúpula cálida + cajas de luz suaves) para reflejos sedosos sin quemar
                const env = new THREE.Scene();
                const cupula = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.ShaderMaterial({
                    side: THREE.BackSide, depthWrite: false,
                    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
                    fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 arriba = vec3(1.0, 0.96, 0.88); vec3 abajo = vec3(0.88, 0.60, 0.24); gl_FragColor = vec4(mix(abajo, arriba, smoothstep(-0.35, 0.65, h)) * 0.88, 1.0); }'
                }));
                env.add(cupula);
                const caja = (pos, esc, int, col) => {
                    const c = col || new THREE.Color(int, int * 0.96, int * 0.88);
                    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
                    m.position.set(pos[0], pos[1], pos[2]); m.scale.set(esc[0], esc[1], 1); m.lookAt(0, 0.5, 0);
                    env.add(m);
                };
                caja([3, 4, 4], [3.6, 2.8], 2.8);
                caja([-4, 2, 3], [2.8, 3.6], 1.3);
                caja([0, 3.5, -5], [5.2, 2.4], 1.6);
                caja([0, -2, 2], [4.0, 3.0], 0.6, new THREE.Color(0.70, 0.48, 0.24));
                const pmrem = new THREE.PMREMGenerator(renderer);
                const envTex = pmrem.fromScene(env, 0.04).texture;
                escena.environment = envTex;
                pmrem.dispose();

                const hemi = new THREE.HemisphereLight(0xFFF7E6, 0xE08820, 0.36);
                escena.add(hemi);
                const clave = new THREE.DirectionalLight(0xFFF2DC, 0.86);
                clave.position.set(1.3, 2.5, 2.4);
                clave.castShadow = true;
                const tam = calidad === 'baja' ? 1024 : 2048;
                clave.shadow.mapSize.set(tam, tam);
                // Encuadre de sombra ajustado a la silueta de Nailong vista desde la luz (pies incluidos)
                Object.assign(clave.shadow.camera, { left: -0.75, right: 0.75, top: 0.9, bottom: -0.8, near: 0.5, far: 7 });
                clave.shadow.camera.updateProjectionMatrix();
                clave.shadow.bias = -0.0006;
                clave.shadow.normalBias = 0.012;
                clave.shadow.radius = 4;
                clave.target.position.set(0, 0.45, 0);
                escena.add(clave, clave.target);
                const relleno = new THREE.DirectionalLight(0xFFE4B6, 0.32);
                relleno.position.set(-2.2, 1.1, 1.8);
                escena.add(relleno);
                const contra = new THREE.DirectionalLight(0xFFF6D6, 0.44);
                contra.position.set(-0.6, 1.8, -2.6);
                escena.add(contra);

                // Suelo: sombra real + sombra de contacto difusa
                const suelo = new THREE.Mesh(new THREE.CircleGeometry(1.6, 48), new THREE.ShadowMaterial({ opacity: 0.14 }));
                suelo.rotation.x = -Math.PI / 2;
                suelo.receiveShadow = true;
                escena.add(suelo);
                const lienzo = document.createElement('canvas');
                lienzo.width = lienzo.height = 128;
                const ctx = lienzo.getContext('2d');
                const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
                grad.addColorStop(0, 'rgba(130,75,12,0.38)');
                grad.addColorStop(0.55, 'rgba(130,75,12,0.14)');
                grad.addColorStop(1, 'rgba(130,75,12,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 128, 128);
                const contacto = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 0.92), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lienzo), transparent: true, depthWrite: false }));
                contacto.rotation.x = -Math.PI / 2;
                contacto.position.set(0, 0.002, -0.04);
                contacto.renderOrder = -1;
                escena.add(contacto);
                return { hemi, clave, relleno, contra, suelo, contacto, envTex };
            }

            return { crearModelo, crearEstudio, crearTexturaOjo };
        })();
