        /* ==============================================================
           16. NAILONG 3D · ESCENA (malla con piel, accesorios, materiales y luces)
           Necesita THREE (r147, cargado bajo demanda por js/14) y el núcleo de js/11.
        ============================================================== */
        const Nailong3DEscena = (function () {
            'use strict';
            const G = Nailong3DGeometria;

            /* ---------- Materiales ---------- */
            // Abolladura elástica al tocar: gaussiana en el espacio de reposo, con corrección de normal.
            const GLSL_TOQUE_CABECERA = `
                uniform vec4 uToque[4];
                uniform float uToqueRadio;
            `;
            const GLSL_TOQUE_NORMAL = `
                #include <beginnormal_vertex>
                for (int i = 0; i < 4; i++) {
                    vec3 dd = position - uToque[i].xyz;
                    float f = exp(-dot(dd, dd) / (uToqueRadio * uToqueRadio));
                    vec3 ddt = dd - dot(dd, normal) * normal;
                    objectNormal -= 2.0 * uToque[i].w * f * ddt / (uToqueRadio * uToqueRadio);
                }
                objectNormal = normalize(objectNormal);
            `;
            const GLSL_TOQUE_POSICION = `
                #include <begin_vertex>
                for (int i = 0; i < 4; i++) {
                    vec3 dd = position - uToque[i].xyz;
                    transformed -= normal * uToque[i].w * exp(-dot(dd, dd) / (uToqueRadio * uToqueRadio));
                }
            `;

            function crearUniformesToque(THREE) {
                return {
                    uToque: { value: [0, 1, 2, 3].map(() => new THREE.Vector4(0, -5, 0, 0)) },
                    uToqueRadio: { value: 0.055 }
                };
            }

            function inyectarToque(material, uniformes, extra) {
                material.onBeforeCompile = (shader) => {
                    shader.uniforms.uToque = uniformes.uToque;
                    shader.uniforms.uToqueRadio = uniformes.uToqueRadio;
                    if (extra && extra.uniforms) Object.assign(shader.uniforms, extra.uniforms);
                    shader.vertexShader = GLSL_TOQUE_CABECERA + (extra && extra.cabecera || '') + shader.vertexShader
                        .replace('#include <beginnormal_vertex>', GLSL_TOQUE_NORMAL)
                        .replace('#include <begin_vertex>', GLSL_TOQUE_POSICION)
                        .replace('#include <skinning_vertex>', '#include <skinning_vertex>\n' + (extra && extra.trasPiel || ''));
                };
                material.customProgramCacheKey = () => 'nailong-toque-' + (extra ? extra.clave : 'base');
            }

            function rampaToon(THREE) {
                const tonos = [120, 190, 235, 255];
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
                    color: new THREE.Color(color), roughness: 0.6, metalness: 0,
                    sheen: 0.45, sheenRoughness: 0.7, sheenColor: new THREE.Color('#FFE9B8'), envMapIntensity: 0.5
                }, extra || {}));
                const toon = (color, extra) => new THREE.MeshToonMaterial(Object.assign({ color: new THREE.Color(color), gradientMap: rampa }, extra || {}));

                const m = {
                    suave: {
                        cuerpo: suave('#FFFFFF', { vertexColors: true }),
                        parpado: suave('#FFFFFF', { vertexColors: true }),
                        placa: suave(C.oliva, { roughness: 0.55, sheen: 0.3 }),
                        garra: suave(C.garra, { roughness: 0.35, sheen: 0.1, clearcoat: 0.3 }),
                        rosa: suave(C.rosa, { roughness: 0.6 }),
                        nariz: suave('#3A2414', { roughness: 0.5, sheen: 0 }),
                        boca: suave('#FFFFFF', { vertexColors: true, roughness: 0.45, sheen: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
                        ojo: new THREE.MeshPhysicalMaterial({ map: texOjo, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.0 }),
                        brillo: new THREE.MeshBasicMaterial({ color: 0xffffff })
                    },
                    toon: {
                        cuerpo: toon('#FFFFFF', { vertexColors: true }),
                        parpado: toon('#FFFFFF', { vertexColors: true }),
                        placa: toon(C.oliva),
                        garra: toon(C.garra),
                        rosa: toon(C.rosa),
                        nariz: toon('#3A2414'),
                        boca: toon('#FFFFFF', { vertexColors: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
                        ojo: new THREE.MeshToonMaterial({ map: texOjo, gradientMap: rampa }),
                        brillo: new THREE.MeshBasicMaterial({ color: 0xffffff })
                    }
                };
                inyectarToque(m.suave.cuerpo, uniformes);
                inyectarToque(m.toon.cuerpo, uniformes);
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
                const contorno = new THREE.MeshBasicMaterial({ color: new THREE.Color('#5E3A12'), side: THREE.BackSide });
                const grosor = { value: 0.0055 };
                inyectarToque(contorno, uniformes, {
                    clave: 'contorno', uniforms: { uGrosor: grosor }, cabecera: 'uniform float uGrosor;\n',
                    trasPiel: 'transformed += normalize(objectNormal) * uGrosor;'
                });
                m.contorno = contorno;
                m.grosorContorno = grosor;
                return m;
            }

            /* ---------- Textura del ojo (iris verde de los stickers, pintado por píxel sobre la esfera) ---------- */
            function crearTexturaOjo(THREE) {
                const W = 512, Hh = 256;
                const lienzo = document.createElement('canvas');
                lienzo.width = W; lienzo.height = Hh;
                const ctx = lienzo.getContext('2d');
                const img = ctx.createImageData(W, Hh);
                const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
                const C = G.COLORES;
                const cPupila = hex(C.pupila), cIris = hex(C.iris), cAro = hex(C.irisAro), cClaro = hex(C.irisClaro), cEsclera = hex(C.esclera);
                const mezcla = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
                const sat = (x) => Math.min(Math.max(x, 0), 1);
                const ANG_IRIS = 0.88, PUPILA = 0.50;
                for (let py = 0; py < Hh; py++) {
                    const th = (py + 0.5) / Hh * Math.PI;
                    for (let px = 0; px < W; px++) {
                        const ph = (px + 0.5) / W * Math.PI * 2;
                        const dx = -Math.cos(ph) * Math.sin(th), dy = Math.cos(th), dz = Math.sin(ph) * Math.sin(th);
                        const r = Math.acos(Math.max(-1, Math.min(1, dz))) / ANG_IRIS;
                        const az = Math.atan2(dy, dx);
                        let c;
                        if (r < 1.0) {
                            const fibras = 0.5 + 0.5 * Math.sin(az * 37 + Math.sin(az * 7) * 2.0);
                            c = mezcla(cClaro, cIris, sat((r - PUPILA) / 0.22));
                            c = mezcla(c, cAro, sat((r - 0.78) / 0.2));
                            c = mezcla(c, mezcla(c, cAro, 0.55), fibras * 0.25 * sat((r - PUPILA) / 0.1));
                            c = mezcla(c, cPupila, sat((PUPILA + 0.025 - r) / 0.05));
                        } else {
                            c = mezcla(cAro, cEsclera, sat((r - 1.0) / 0.07));
                            c = mezcla(c, [236, 232, 226], sat((r - 1.6) / 1.2) * 0.6);
                        }
                        const o = (py * W + px) * 4;
                        img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255;
                    }
                }
                ctx.putImageData(img, 0, 0);
                const tex = new THREE.CanvasTexture(lienzo);
                tex.encoding = THREE.sRGBEncoding;
                tex.anisotropy = 4;
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
            function impacto(desde, hacia) {
                const d = [hacia[0] - desde[0], hacia[1] - desde[1], hacia[2] - desde[2]];
                return G.trazarRayo(desde[0], desde[1], desde[2], d[0], d[1], d[2], 4);
            }

            // Botón/garra/placa: elipsoide orientado según la normal y hundido una fracción de su grosor
            function bulto(THREE, geo, material, hit, radios, hundido, inclinar) {
                const n = v3(THREE, hit.n);
                const dir = inclinar ? n.clone().lerp(inclinar, 0.35).normalize() : n;
                const malla = new THREE.Mesh(geo, material);
                malla.scale.set(radios[0], radios[1], radios[2]);
                malla.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
                const p = v3(THREE, hit.p).addScaledVector(dir, radios[2] * (1 - 2 * hundido));
                return { malla, p };
            }

            /* ---------- Boca: calcomanía curvada que se adapta al hocico ---------- */
            function crearBoca(THREE, material, hueso) {
                const N_U = 28, N_S = 10;
                const ancla = impacto([0, 0.646, 1.2], [0, 0.646, 0.0]);
                const O = v3(THREE, ancla.p), n = v3(THREE, ancla.n);
                const T = new THREE.Vector3(0, 1, 0).cross(n).normalize();
                const B = n.clone().cross(T).normalize();
                // Mapa de altura del hocico: posición y normal de la superficie en una rejilla tangente
                const MU = 41, MV = 25, EU = 0.085, EV = 0.06;
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
                const cBoca = lin(G.COLORES.boca), cLengua = lin(G.COLORES.lengua), cDientes = lin(G.COLORES.dientes);
                const base = hueso.userData.reposoMundo;
                const tmp = new Float32Array(6);
                const forma = { ancho: 0.05, abierta: 0.4, sonrisa: 0.6, redonda: 0, dientes: 0.3, lengua: 1 };

                function actualizar(f) {
                    Object.assign(forma, f || {});
                    const ancho = forma.ancho * (1 - forma.redonda * 0.42);
                    const abre = Math.max(0, forma.abierta);
                    for (let s = 0; s < N_S; s++) for (let iu = 0; iu < N_U; iu++) {
                        const un = iu / (N_U - 1) * 2 - 1;          // -1..1 a lo ancho
                        const sn = s / (N_S - 1);                     // 0 (labio inferior) .. 1 (superior)
                        const perfil = Math.pow(Math.max(0, 1 - un * un), 0.5 + 0.3 * (1 - forma.redonda));
                        const centro = forma.sonrisa * (un * un - 0.35) * 0.024 * (1 - forma.redonda);
                        const alto = abre * 0.042 * (0.55 + 0.45 * forma.redonda) * perfil;
                        const sup = centro + Math.max(alto * (0.45 + 0.25 * forma.redonda), 0.0017 * perfil + 0.0006);
                        const inf = centro - Math.max(alto, 0.0017 * perfil + 0.0006);
                        const u = un * ancho, v = inf + (sup - inf) * sn;
                        muestrear(u, v, tmp);
                        const k = s * N_U + iu;
                        pos[k * 3] = tmp[0] + tmp[3] * 0.0012 - base.x;
                        pos[k * 3 + 1] = tmp[1] + tmp[4] * 0.0012 - base.y;
                        pos[k * 3 + 2] = tmp[2] + tmp[5] * 0.0012 - base.z;
                        nor[k * 3] = tmp[3]; nor[k * 3 + 1] = tmp[4]; nor[k * 3 + 2] = tmp[5];
                        // Interior oscuro, lengua rosa abajo y dientes arriba cuando abre
                        const tLengua = forma.lengua * Math.min(1, abre * 2.2) * Math.max(0, 1 - sn / 0.42) * Math.max(0, 1 - Math.pow(Math.abs(un) / 0.78, 2));
                        const tDientes = forma.dientes * Math.min(1, abre * 2) * (sn > 0.78 ? 1 : 0) * (Math.abs(un) < 0.7 ? 1 : 0);
                        for (let c = 0; c < 3; c++) {
                            let v0 = cBoca[c] + (cLengua[c] - cBoca[c]) * Math.min(1, tLengua * 1.6);
                            v0 = v0 + (cDientes[c] - v0) * tDientes;
                            col[k * 3 + c] = v0;
                        }
                    }
                    geo.attributes.position.needsUpdate = true;
                    geo.attributes.normal.needsUpdate = true;
                    geo.attributes.color.needsUpdate = true;
                }
                actualizar();
                return { malla, actualizar, forma };
            }

            /* ---------- Ojos, párpados y brillos ---------- */
            function crearOjos(THREE, mats, hueso) {
                const O = G.OJO;
                const geoGlobo = new THREE.SphereGeometry(O.r, 48, 32);
                const rp = O.r + 0.0026;
                const geoSup = new THREE.SphereGeometry(rp, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2);
                const geoInf = new THREE.SphereGeometry(rp, 48, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
                // Borde del párpado algo más oscuro: al cerrar el ojo se lee la «rayita» de las pestañas
                const cPiel = G.srgbALineal(G.COLORES.amarillo), cBorde = G.srgbALineal('#A86A14');
                [geoSup, geoInf].forEach((geo) => {
                    const p = geo.attributes.position, col = new Float32Array(p.count * 3);
                    for (let i = 0; i < p.count; i++) {
                        const t = Math.min(1, Math.abs(p.getY(i)) / (rp * 0.16));
                        for (let c = 0; c < 3; c++) col[i * 3 + c] = cBorde[c] + (cPiel[c] - cBorde[c]) * t * t * (3 - 2 * t);
                    }
                    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
                });
                const geoBrillo = new THREE.CircleGeometry(1, 20);
                const ojos = [];
                [1, -1].forEach((lado) => {
                    const centro = new THREE.Vector3(O.x * lado, O.y, O.z);
                    const pivote = new THREE.Object3D();
                    adjuntar(pivote, hueso, centro);
                    // Ojos ligeramente abiertos hacia fuera, como en los stickers
                    pivote.rotation.y = 0.12 * lado;
                    const globo = new THREE.Mesh(geoGlobo, mats.ojo); globo.userData.mat = 'ojo';
                    const sup = new THREE.Mesh(geoSup, mats.parpado); sup.userData.mat = 'parpado';
                    const inf = new THREE.Mesh(geoInf, mats.parpado); inf.userData.mat = 'parpado';
                    const sufijo = lado > 0 ? 'Izq' : 'Der';
                    pivote.name = 'Nailong_ojo' + sufijo; globo.name = 'Nailong_globo' + sufijo;
                    sup.name = 'Nailong_parpadoSup' + sufijo; inf.name = 'Nailong_parpadoInf' + sufijo;
                    pivote.add(globo, sup, inf);
                    // Brillos fijos respecto a la cabeza (reflejo de la luz principal)
                    [[0.36, 0.42, 0.0085], [-0.28, -0.22, 0.0042]].forEach(([bx, by, br]) => {
                        const d = new THREE.Vector3(bx, by, Math.sqrt(Math.max(0, 1 - bx * bx - by * by))).normalize();
                        const b = new THREE.Mesh(geoBrillo, mats.brillo); b.userData.mat = 'brillo';
                        b.scale.setScalar(br);
                        b.position.copy(d).multiplyScalar(O.r + 0.0009);
                        b.lookAt(d.clone().multiplyScalar(2));
                        pivote.add(b);
                    });
                    ojos.push({ lado, pivote, globo, sup, inf });
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

                const poner = (hueso, matClave, hit, radios, hundido, inclinar, sombra) => {
                    if (!hit) return null;
                    const { malla: m, p } = bulto(THREE, esfera, M.suave[matClave], hit, radios, hundido, inclinar);
                    m.userData.mat = matClave;
                    m.castShadow = !!sombra;
                    adjuntar(m, hueso, p, m.quaternion.clone());
                    return m;
                };

                // Orificios nasales (sticker 30, 47)
                [1, -1].forEach((l) => poner(cabeza, 'nariz', impacto([0.026 * l, 0.706, 1.2], [0.026 * l, 0.706, 0]), [0.007, 0.0048, 0.0045], 0.6));

                // 3 placas dorsales oliva por la línea media de la nuca (sticker 31, 52, 84)
                const cc = G.ANATOMIA.craneo.c;
                [[0.12, 0.036, 0.32], [0.70, 0.058, 0.36], [1.16, 0.054, 0.36]].forEach(([ang, r, hund]) => {
                    const dir = [0, Math.cos(ang), -Math.sin(ang)];
                    const hit = impacto([cc[0] + dir[0], cc[1] + dir[1], cc[2] + dir[2]], cc);
                    poner(cabeza, 'placa', hit, [r * 0.92, r, r * 0.62], hund, null, true);
                });

                // Manos: 3 garritas marrones en la punta y almohadilla rosa en la palma (sticker 86, 43, 52)
                const An = G.ANATOMIA;
                [1, -1].forEach((l) => {
                    const hueso = l > 0 ? porNombre.brazoIzq : porNombre.brazoDer;
                    const a = new THREE.Vector3(An.brazo.a[0] * l, An.brazo.a[1], An.brazo.a[2]);
                    const b = new THREE.Vector3(An.brazo.b[0] * l, An.brazo.b[1], An.brazo.b[2]);
                    const eje = b.clone().sub(a).normalize();
                    const palma = new THREE.Vector3(0, 0, 1).addScaledVector(eje, -eje.z).normalize();
                    const lado = eje.clone().cross(palma).normalize();
                    const c = new THREE.Vector3(An.mano.c[0] * l, An.mano.c[1], An.mano.c[2]);
                    [-0.5, 0, 0.5].forEach((ang) => {
                        const d = eje.clone().multiplyScalar(Math.cos(ang)).addScaledVector(lado, Math.sin(ang)).addScaledVector(palma, 0.35).normalize();
                        const desde = c.clone().addScaledVector(d, 0.3);
                        poner(hueso, 'garra', impacto([desde.x, desde.y, desde.z], [c.x, c.y, c.z]), [0.0105, 0.0095, 0.019], 0.42, palma);
                    });
                    const desdeP = c.clone().addScaledVector(palma, 0.3).addScaledVector(eje, -0.012);
                    poner(hueso, 'rosa', impacto([desdeP.x, desdeP.y, desdeP.z], [c.x, c.y, c.z]), [0.028, 0.032, 0.0075], 0.45);
                });

                // Pies: 3 uñas marrones delante (sticker 86, 43, 10)
                [1, -1].forEach((l) => {
                    const hueso = l > 0 ? porNombre.piernaIzq : porNombre.piernaDer;
                    const c = new THREE.Vector3(An.pie.c[0] * l, An.pie.c[1] + 0.004, An.pie.c[2]);
                    [-0.42, 0, 0.42].forEach((ang) => {
                        const d = new THREE.Vector3(Math.sin(ang) + 0.12 * l, -0.18, Math.cos(ang)).normalize();
                        const desde = c.clone().addScaledVector(d, 0.3);
                        poner(hueso, 'garra', impacto([desde.x, desde.y, desde.z], [c.x, c.y, c.z]), [0.0125, 0.0105, 0.016], 0.45, new THREE.Vector3(0, -0.4, 1).normalize());
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

            /* ---------- Estudio: entorno PMREM, luces suaves y suelo con sombra ---------- */
            function crearEstudio(THREE, renderer, escena, calidad) {
                // Entorno de estudio propio (cúpula cálida + cajas de luz) para reflejos suaves
                const env = new THREE.Scene();
                const cupula = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.ShaderMaterial({
                    side: THREE.BackSide, depthWrite: false,
                    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
                    fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 arriba = vec3(1.0,0.97,0.9); vec3 abajo = vec3(0.75,0.52,0.24); gl_FragColor = vec4(mix(abajo, arriba, smoothstep(-0.35, 0.6, h)) * 0.9, 1.0); }'
                }));
                env.add(cupula);
                const caja = (pos, esc, int) => {
                    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(int, int, int * 0.96), side: THREE.DoubleSide }));
                    m.position.set(pos[0], pos[1], pos[2]); m.scale.set(esc[0], esc[1], 1); m.lookAt(0, 0.5, 0);
                    env.add(m);
                };
                caja([3, 4, 4], [3.5, 2.5], 4.0);
                caja([-4, 2, 3], [2.5, 3.5], 1.6);
                caja([0, 3, -5], [5, 2], 2.2);
                const pmrem = new THREE.PMREMGenerator(renderer);
                const envTex = pmrem.fromScene(env, 0.035).texture;
                escena.environment = envTex;
                pmrem.dispose();

                const hemi = new THREE.HemisphereLight(0xFFF6E5, 0xD98E3A, 0.32);
                escena.add(hemi);
                const clave = new THREE.DirectionalLight(0xFFF1DC, 1.05);
                clave.position.set(1.4, 2.6, 2.2);
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
                const relleno = new THREE.DirectionalLight(0xFFE7C2, 0.3);
                relleno.position.set(-2.2, 1.0, 1.6);
                escena.add(relleno);
                const contra = new THREE.DirectionalLight(0xFFFFFF, 0.55);
                contra.position.set(-0.6, 1.8, -2.6);
                escena.add(contra);

                // Suelo: sombra real + sombra de contacto difusa
                const suelo = new THREE.Mesh(new THREE.CircleGeometry(1.6, 48), new THREE.ShadowMaterial({ opacity: 0.16 }));
                suelo.rotation.x = -Math.PI / 2;
                suelo.receiveShadow = true;
                escena.add(suelo);
                const lienzo = document.createElement('canvas');
                lienzo.width = lienzo.height = 128;
                const ctx = lienzo.getContext('2d');
                const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
                grad.addColorStop(0, 'rgba(120,70,10,0.42)');
                grad.addColorStop(0.55, 'rgba(120,70,10,0.16)');
                grad.addColorStop(1, 'rgba(120,70,10,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 128, 128);
                const contacto = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.95), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lienzo), transparent: true, depthWrite: false }));
                contacto.rotation.x = -Math.PI / 2;
                contacto.position.set(0, 0.002, -0.05);
                contacto.renderOrder = -1;
                escena.add(contacto);
                return { hemi, clave, relleno, contra, suelo, contacto, envTex };
            }

            return { crearModelo, crearEstudio, crearTexturaOjo };
        })();
