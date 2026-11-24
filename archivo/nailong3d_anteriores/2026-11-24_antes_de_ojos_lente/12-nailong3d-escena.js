        /* ==============================================================
           16. NAILONG 3D · ESCENA (cara deformable, boca 3D, ojos con AO y shader mochi)
           Necesita THREE (r147, cargado bajo demanda por js/14) y el núcleo de js/11.
        ============================================================== */
        const Nailong3DEscena = (function () {
            'use strict';
            const G = Nailong3DGeometria;

            /* ---------- Shaders: onda elástica al tocar + piel mochi mate con micro-relieve 3D ---------- */
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

            // Micro-grano 3D en espacio de reposo (no patina al mover los huesos) para acabado de vinilo/mochi mate
            const GLSL_MOCHI_VERT = `
                varying vec3 vPosReposo;
            `;
            const GLSL_MOCHI_COMUN = `
                varying vec3 vPosReposo;
                float mochiHash(vec3 p) {
                    p = fract(p * 0.3183099 + 0.1);
                    p *= 17.0;
                    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
                }
                float mochiRuido(vec3 x) {
                    vec3 i = floor(x), f = fract(x);
                    f = f * f * (3.0 - 2.0 * f);
                    return mix(
                        mix(mix(mochiHash(i), mochiHash(i + vec3(1.0, 0.0, 0.0)), f.x),
                            mix(mochiHash(i + vec3(0.0, 1.0, 0.0)), mochiHash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
                        mix(mix(mochiHash(i + vec3(0.0, 0.0, 1.0)), mochiHash(i + vec3(1.0, 0.0, 1.0)), f.x),
                            mix(mochiHash(i + vec3(0.0, 1.0, 1.0)), mochiHash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z
                    );
                }
            `;
            // Perturbación micro-aterciopelada de la normal ANTES de iluminar: rompe el reflejo plástico en frente y mejillas
            const GLSL_MOCHI_NORMAL = `
                #include <normal_fragment_maps>
                {
                    float hMochi = mochiRuido(vPosReposo * 125.0) * 0.60 + mochiRuido(vPosReposo * 275.0) * 0.40;
                    vec3 dPx = dFdx(vViewPosition);
                    vec3 tX = dPx - normal * dot(dPx, normal);
                    float lTx = length(tX);
                    if (lTx > 1e-6) {
                        tX /= lTx;
                        vec3 tY = normalize(cross(normal, tX));
                        float atenua = smoothstep(3.4, 1.1, length(vViewPosition));
                        float gx = clamp(dFdx(hMochi), -0.34, 0.34);
                        float gy = clamp(dFdy(hMochi), -0.34, 0.34);
                        normal = normalize(normal - (0.088 * atenua) * (gx * tX + gy * tY));
                    }
                }
            `;
            const GLSL_PIEL_SUAVE_FRAG = `
                #include <tonemapping_fragment>
                {
                    vec3 nV = normalize(vNormal);
                    vec3 vDir = normalize(vViewPosition);
                    float ndv = clamp(dot(nV, vDir), 0.0, 1.0);
                    float fresnel = pow(1.0 - ndv, 2.6);
                    float grano = mochiRuido(vPosReposo * 125.0) * 0.58 + mochiRuido(vPosReposo * 275.0) * 0.42;
                    float luma = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
                    // Dispersión subsuperficial cálida miel/ámbar en el terminador de sombra y pliegues
                    float penumbra = smoothstep(0.05, 0.40, luma) * (1.0 - smoothstep(0.34, 0.72, luma));
                    vec3 sssCalido = vec3(0.95, 0.48, 0.08);
                    gl_FragColor.rgb += sssCalido * (penumbra * 0.13);
                    // Micro-grano aterciopelado tipo mochi / silicona mate
                    gl_FragColor.rgb *= 1.0 + (grano - 0.5) * (0.036 + 0.044 * fresnel);
                    vec3 rimLeche = vec3(1.0, 0.90, 0.54);
                    gl_FragColor.rgb += rimLeche * (fresnel * (0.045 + 0.035 * grano));
                    // Compresión suave de altas luces para que la frente y la pancita nunca se quemen a blanco-limón
                    gl_FragColor.rgb = gl_FragColor.rgb / (1.0 + 0.16 * gl_FragColor.rgb * gl_FragColor.rgb);
                    // Sombras limpias y cálidas (evita tonos grises o verdosos en la penumbra del amarillo)
                    float sombra = 1.0 - smoothstep(0.06, 0.44, luma);
                    gl_FragColor.r = min(0.99, gl_FragColor.r + sombra * 0.055);
                    gl_FragColor.g = min(0.96, gl_FragColor.g + sombra * 0.022);
                    gl_FragColor.b = max(gl_FragColor.b * (1.0 - sombra * 0.12), 0.015 * sombra);
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
                    const pielSuave = !!(extra && extra.pielSuave);
                    shader.vertexShader = GLSL_TOQUE_CABECERA + (pielSuave ? GLSL_MOCHI_VERT : '') + (extra && extra.cabecera || '') + shader.vertexShader
                        .replace('#include <beginnormal_vertex>', GLSL_TOQUE_NORMAL)
                        .replace('#include <begin_vertex>', GLSL_TOQUE_POSICION + (pielSuave ? '\nvPosReposo = position;' : ''))
                        .replace('#include <skinning_vertex>', '#include <skinning_vertex>\n' + (extra && extra.trasPiel || ''));
                    if (pielSuave) {
                        shader.fragmentShader = shader.fragmentShader
                            .replace('#include <common>', '#include <common>\n' + GLSL_MOCHI_COMUN)
                            .replace('#include <normal_fragment_maps>', GLSL_MOCHI_NORMAL)
                            .replace('#include <tonemapping_fragment>', GLSL_PIEL_SUAVE_FRAG);
                    }
                };
                material.customProgramCacheKey = () => 'nailong-mochi-' + (extra ? extra.clave : 'base');
            }

            // Oclusión ambiental dinámica muy sutil del párpado sobre el globo ocular (cero sombras duras en reposo)
            function inyectarOjoAO(material, uOjoAO, uGloboAPivote, clave) {
                material.onBeforeCompile = (shader) => {
                    shader.uniforms.uOjoAO = uOjoAO;
                    shader.uniforms.uGloboAPivote = uGloboAPivote;
                    shader.vertexShader = 'uniform mat3 uGloboAPivote;\nvarying vec3 vDirPivote;\n' + shader.vertexShader
                        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvDirPivote = normalize(uGloboAPivote * position);');
                    shader.fragmentShader = 'uniform vec4 uOjoAO;\nvarying vec3 vDirPivote;\n' + shader.fragmentShader
                        .replace('#include <tonemapping_fragment>', `
                            #include <tonemapping_fragment>
                            {
                                vec3 dp = normalize(vDirPivote);
                                float xLat = dp.x;
                                float inclinacion = uOjoAO.w * xLat;
                                float arco = uOjoAO.z * (1.0 - min(1.0, xLat * xLat * 1.8));
                                float elevP = asin(clamp(dp.y, -1.0, 1.0));
                                float filoSup = uOjoAO.x + inclinacion + arco;
                                float filoInf = uOjoAO.y + inclinacion * 0.4 + arco * 0.65;
                                // Sombra muy suave junto al borde del párpado para mantener esclerótica blanca luminosa
                                float dSup = filoSup - elevP;
                                float aoSup = smoothstep(0.20, -0.02, dSup) * 0.13;
                                float dInf = elevP - filoInf;
                                float aoInf = smoothstep(0.12, -0.02, dInf) * 0.05;
                                float aoComisura = smoothstep(0.56, 0.88, abs(xLat)) * 0.07;
                                float ao = clamp(aoSup + aoInf + aoComisura, 0.0, 0.22);
                                gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * vec3(0.80, 0.78, 0.75), ao);
                            }
                        `);
                };
                material.customProgramCacheKey = () => 'nailong-ojo-ao-' + clave;
            }

            // Shader de boca: aplica el mismo acabado mochi en el borde amarillo exterior y respeta el burdeos oscuro interior
            const GLSL_BOCA_SUAVE_FRAG = `
                #include <tonemapping_fragment>
                {
                    vec3 nV = normalize(vNormal);
                    vec3 vDir = normalize(vViewPosition);
                    float ndv = clamp(dot(nV, vDir), 0.0, 1.0);
                    float fresnel = pow(1.0 - ndv, 2.6);
                    float grano = mochiRuido(vPosReposo * 125.0) * 0.58 + mochiRuido(vPosReposo * 275.0) * 0.42;
                    float luma = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
                    float esPiel = smoothstep(0.16, 0.42, luma);
                    float penumbra = smoothstep(0.05, 0.40, luma) * (1.0 - smoothstep(0.34, 0.72, luma));
                    vec3 sssCalido = vec3(0.95, 0.48, 0.08);
                    gl_FragColor.rgb += sssCalido * (penumbra * 0.13 * esPiel);
                    gl_FragColor.rgb *= 1.0 + (grano - 0.5) * (0.036 + 0.044 * fresnel) * esPiel;
                    vec3 rimLeche = vec3(1.0, 0.90, 0.54);
                    gl_FragColor.rgb += rimLeche * (fresnel * (0.045 + 0.035 * grano) * esPiel);
                    vec3 comp = gl_FragColor.rgb / (1.0 + 0.16 * gl_FragColor.rgb * gl_FragColor.rgb);
                    gl_FragColor.rgb = mix(gl_FragColor.rgb, comp, esPiel);
                    float sombra = (1.0 - smoothstep(0.06, 0.44, luma)) * esPiel;
                    gl_FragColor.r = min(0.99, gl_FragColor.r + sombra * 0.055);
                    gl_FragColor.g = min(0.96, gl_FragColor.g + sombra * 0.022);
                    gl_FragColor.b = max(gl_FragColor.b * (1.0 - sombra * 0.12), 0.015 * sombra);
                }
            `;

            function inyectarBocaSuave(material) {
                material.onBeforeCompile = (shader) => {
                    shader.vertexShader = GLSL_MOCHI_VERT + shader.vertexShader
                        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPosReposo = position;');
                    shader.fragmentShader = shader.fragmentShader
                        .replace('#include <common>', '#include <common>\n' + GLSL_MOCHI_COMUN)
                        .replace('#include <tonemapping_fragment>', GLSL_BOCA_SUAVE_FRAG);
                };
                material.customProgramCacheKey = () => 'nailong-boca-mochi';
            }

            function rampaToon(THREE) {
                const tonos = [174, 206, 232, 250];
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
                    color: new THREE.Color(color), roughness: 0.85, metalness: 0,
                    sheen: 0.34, sheenRoughness: 0.82, sheenColor: new THREE.Color('#FFEAA8'), envMapIntensity: 0.17
                }, extra || {}));
                const toon = (color, extra) => new THREE.MeshToonMaterial(Object.assign({ color: new THREE.Color(color), gradientMap: rampa }, extra || {}));

                const m = {
                    suave: {
                        cuerpo: suave('#FFFFFF', { vertexColors: true }),
                        parpado: suave('#FFFFFF', { vertexColors: true, roughness: 0.85 }),
                        placa: suave(C.oliva, { roughness: 0.78, sheen: 0.24, sheenColor: new THREE.Color('#DCE098'), envMapIntensity: 0.15 }),
                        garra: suave(C.garra, { roughness: 0.68, sheen: 0.10, clearcoat: 0.04, envMapIntensity: 0.13 }),
                        dientes: new THREE.MeshPhysicalMaterial({ color: new THREE.Color(C.dientes), roughness: 0.22, metalness: 0, clearcoat: 0.38, clearcoatRoughness: 0.18, envMapIntensity: 0.34 }),
                        lengua: suave(C.lengua, { roughness: 0.38, sheen: 0.26, sheenColor: new THREE.Color('#FFC4CE'), clearcoat: 0.30, clearcoatRoughness: 0.28, envMapIntensity: 0.20 }),
                        boca: suave('#FFFFFF', { vertexColors: true, roughness: 0.85, sheen: 0.34, sheenRoughness: 0.82, sheenColor: new THREE.Color('#FFEAA8'), envMapIntensity: 0.17, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }),
                        ojo: new THREE.MeshPhysicalMaterial({ map: texOjo, roughness: 0.10, clearcoat: 1.0, clearcoatRoughness: 0.02, envMapIntensity: 0.62 }),
                        brillo: new THREE.MeshBasicMaterial({ color: 0xffffff, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 })
                    },
                    toon: {
                        cuerpo: toon('#F4ECE0', { vertexColors: true }),
                        parpado: toon('#F4ECE0', { vertexColors: true }),
                        placa: toon(C.oliva),
                        garra: toon(C.garra),
                        dientes: toon('#F8F5EE'),
                        lengua: toon(C.lengua),
                        boca: toon('#F4ECE0', { vertexColors: true, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }),
                        ojo: new THREE.MeshToonMaterial({ color: new THREE.Color('#F6F4EE'), map: texOjo, gradientMap: rampa }),
                        brillo: new THREE.MeshBasicMaterial({ color: 0xffffff, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 })
                    }
                };
                inyectarToque(m.suave.cuerpo, uniformes, { clave: 'piel-suave', pielSuave: true });
                inyectarToque(m.suave.parpado, uniformes, { clave: 'parpado-suave', pielSuave: true });
                inyectarBocaSuave(m.suave.boca);
                inyectarToque(m.toon.cuerpo, uniformes, { clave: 'piel-toon', pielSuave: false });
                inyectarToque(m.toon.parpado, uniformes, { clave: 'parpado-toon', pielSuave: false });

                // Para el GLB: PBR estándar limpio sin extensiones propietarias vacías
                m.exportar = {};
                Object.keys(m.suave).forEach((k) => {
                    const o = m.suave[k];
                    m.exportar[k] = o.isMeshBasicMaterial ? o : new THREE.MeshStandardMaterial({
                        color: o.color.clone(), roughness: o.roughness, metalness: 0, map: o.map || null, vertexColors: !!o.vertexColors,
                        polygonOffset: !!o.polygonOffset, polygonOffsetFactor: o.polygonOffsetFactor || 0, polygonOffsetUnits: o.polygonOffsetUnits || 0
                    });
                });
                ['suave', 'toon', 'exportar'].forEach((est) => Object.keys(m[est]).forEach((k) => { m[est][k].name = 'Nailong_' + k; }));

                // Contorno de dibujo animado: casco invertido empujado por la normal tras la piel
                const contorno = new THREE.MeshBasicMaterial({ color: new THREE.Color('#4A2808'), side: THREE.BackSide });
                const grosor = { value: 0.0046 };
                inyectarToque(contorno, uniformes, {
                    clave: 'contorno', uniforms: { uGrosor: grosor }, cabecera: 'uniform float uGrosor;\n',
                    trasPiel: 'transformed += normalize(objectNormal) * uGrosor;'
                });
                m.contorno = contorno;
                m.grosorContorno = grosor;
                return m;
            }

            /* ---------- Textura del ojo (pupila grande tierna, anillo esmeralda vivo y esclera blanca limpia) ---------- */
            function crearTexturaOjo(THREE) {
                const W = 512, Hh = 256;
                const lienzo = document.createElement('canvas');
                lienzo.width = W; lienzo.height = Hh;
                const ctx = lienzo.getContext('2d');
                const img = ctx.createImageData(W, Hh);
                const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
                const C = G.COLORES;
                const cPupila = hex(C.pupila);
                const cIrisProf = hex('#1B6222');
                const cIrisMedio = hex('#34A230');
                const cEsmeralda = hex('#6CE03E');
                const cLima = hex('#92EE5A');
                const cAro = hex(C.irisAro);
                const cEsclera = hex(C.esclera);
                const mezcla = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
                const sat = (x) => Math.min(Math.max(x, 0), 1);
                const smooth = (e0, e1, x) => { const t = sat((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
                // ANG_IRIS = 0.78 y PUPILA = 0.66: ojos grandes y tiernos con aro blanco limpio alrededor (capturas 08 y 12)
                const ANG_IRIS = 0.78, PUPILA = 0.66;

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
                            const dyNorm = -dy / Math.sin(ANG_IRIS); // +1 abajo, -1 arriba
                            const f1 = Math.sin(az * 32.0 + Math.sin(az * 5.0) * 1.3);
                            const f2 = Math.cos(az * 19.0 - 0.6);
                            const fibras = 0.5 + 0.26 * f1 + 0.14 * f2;

                            // Anillo esmeralda brillante y vivo alrededor de la pupila grande
                            const tRadial = smooth(PUPILA - 0.03, 0.90, r);
                            let base = mezcla(cIrisProf, cIrisMedio, tRadial);
                            const medialuna = smooth(-0.28, 0.80, dyNorm) * smooth(0.56, 0.86, r) * (1.0 - smooth(0.87, 0.99, r));
                            base = mezcla(base, mezcla(cEsmeralda, cLima, fibras * 0.50), medialuna * 0.92 + tRadial * 0.42);

                            const modFibra = (fibras - 0.5) * 0.18 * smooth(PUPILA, 0.88, r) * (1.0 - smooth(0.88, 0.98, r));
                            base = mezcla(base, modFibra > 0 ? cLima : cAro, Math.abs(modFibra));

                            // Anillo limbal pino oscuro fino y nítido
                            const tLimbo = smooth(0.88, 0.98, r);
                            c = mezcla(base, cAro, tLimbo * 0.88);

                            // Leve sombreado superior para profundidad sin oscurecer el verde
                            c = mezcla(c, cAro, smooth(0.18, 0.88, -dyNorm) * 0.16);

                            // Pupila negra profunda y grande con antialiasing limpio
                            c = mezcla(c, cPupila, smooth(PUPILA + 0.013, PUPILA - 0.013, r));

                            if (r > 0.96) {
                                const tEsclera = smooth(0.96, 1.03, r);
                                const esc = mezcla(cEsclera, [246, 244, 240], smooth(1.0, 1.8, r) * 0.25);
                                c = mezcla(c, esc, tEsclera);
                            }
                        } else {
                            // Esclera blanca limpia y luminosa (suave sombreado solo muy atrás)
                            c = mezcla(cEsclera, [245, 243, 238], smooth(1.10, 1.85, r) * 0.30);
                            c = mezcla(c, [232, 226, 218], smooth(1.60, 2.35, r) * 0.28);
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

            /* ---------- Utilidades geométricas ---------- */
            function v3(THREE, a) { return new THREE.Vector3(a[0], a[1], a[2]); }
            const sstep = (e0, e1, x) => { const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1); return t * t * (3 - 2 * t); };

            function adjuntar(obj, hueso, posReposo, quat) {
                const base = hueso.userData.reposoMundo;
                obj.position.set(posReposo.x - base.x, posReposo.y - base.y, posReposo.z - base.z);
                if (quat) obj.quaternion.copy(quat);
                hueso.add(obj);
                return obj;
            }

            function impacto(desde, hacia, tMax) {
                const d = [hacia[0] - desde[0], hacia[1] - desde[1], hacia[2] - desde[2]];
                return G.trazarRayo(desde[0], desde[1], desde[2], d[0], d[1], d[2], tMax || 4);
            }

            function bulto(THREE, geo, material, hit, radios, hundido, inclinar) {
                const n = v3(THREE, hit.n);
                const dir = inclinar ? n.clone().lerp(inclinar, 0.42).normalize() : n;
                const malla = new THREE.Mesh(geo, material);
                malla.scale.set(radios[0], radios[1], radios[2]);
                malla.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
                const p = v3(THREE, hit.p).addScaledVector(dir, radios[2] * (1 - 2 * hundido));
                return { malla, p };
            }

            // Ley compartida de apertura labial (usada a la vez por crearCaraDeformable y crearBoca)
            function perfilLabios(forma) {
                const abre = Math.min(1.15, Math.max(0, forma.abierta || 0));
                const sonrisa = forma.sonrisa || 0;
                const redonda = Math.min(1, Math.max(0, forma.redonda || 0));
                const puchero = Math.min(1, Math.max(0, forma.puchero || 0));
                const dientes = Math.min(1, Math.max(0, forma.dientes || 0));
                const tAbierta = sstep(0.03, 0.14, abre);
                // En reposo: arquito sonriente limpio y legible (~0.056, captura 08); abierta crece a risa amplia (captura 02)
                const anchoSonrisa = Math.max(0, sonrisa) * (0.011 * tAbierta + 0.006 * dientes);
                const ancho = (0.056 + anchoSonrisa + 0.022 * sstep(0.08, 0.85, abre) + 0.008 * sstep(0.85, 1.15, abre))
                    * (1 - redonda * 0.62) * (1 - puchero * 0.22);
                const altoBase = abre * 0.062 * (0.78 + 0.22 * redonda);
                const expPerfil = 0.36 + 0.22 * (1 - redonda);
                return {
                    abre, tAbierta, ancho, altoBase, redonda, sonrisa, puchero, expPerfil,
                    evaluar(un) {
                        const u2 = un * un;
                        const env = Math.pow(Math.max(0, 1 - u2), expPerfil);
                        // En reposo curva claramente hacia arriba como sonrisa dulce (captura 08); en puchero baja en arco triste (captura 01)
                        const kSonrisa = 0.026 * (1 - 0.50 * tAbierta);
                        const arco = (sonrisa * kSonrisa - puchero * 0.026) * (u2 - 0.35) * (1 - redonda * 0.80);
                        const piquito = 0.0006 * Math.pow(Math.max(0, 1 - u2 * 2.4), 2) * (1 - redonda) * (1 - 0.8 * tAbierta);
                        const lineaMin = 0.0028 * Math.pow(Math.max(0, 1 - u2), 0.52);
                        const alto = altoBase * env;
                        const sup = arco + piquito + Math.max(alto * (0.28 + 0.32 * redonda), lineaMin);
                        const inf = arco - Math.max(alto * (0.86 - 0.22 * redonda), lineaMin);
                        return { sup, inf, env, arco };
                    }
                };
            }

            // Caída suave y compartida de la mandíbula (siempre por encima de y = 0.522 para no alterar jamás el cuello)
            function pesoMandibula(y) {
                return sstep(0.628, 0.570, y) * sstep(0.522, 0.554, y);
            }

            /* ---------- Deformador facial 3D sutil sobre la malla del cuerpo (cejas, pómulos, mandíbula y bolsillo oral) ---------- */
            function crearCaraDeformable(THREE, geoCuerpo, marcoBoca) {
                const posAttr = geoCuerpo.attributes.position;
                const norAttr = geoCuerpo.attributes.normal;
                const nv = posAttr.count;
                const indices = [];
                let minIdx = nv, maxIdx = 0;
                for (let v = 0; v < nv; v++) {
                    if (posAttr.getY(v) > 0.520 && posAttr.getZ(v) > 0.015) {
                        indices.push(v);
                        if (v < minIdx) minIdx = v;
                        if (v > maxIdx) maxIdx = v;
                    }
                }
                const nf = indices.length;
                const idxCara = new Uint32Array(indices);
                const p0 = new Float32Array(nf * 3);
                const n0 = new Float32Array(nf * 3);
                const uvBoca = new Float32Array(nf * 3); // u, v, profundidad respecto al plano tangente del morro
                const O = marcoBoca.O, T = marcoBoca.T, B = marcoBoca.B, N = marcoBoca.N;

                for (let k = 0; k < nf; k++) {
                    const v = idxCara[k];
                    const x = posAttr.getX(v), y = posAttr.getY(v), z = posAttr.getZ(v);
                    p0[k * 3] = x; p0[k * 3 + 1] = y; p0[k * 3 + 2] = z;
                    n0[k * 3] = norAttr.getX(v); n0[k * 3 + 1] = norAttr.getY(v); n0[k * 3 + 2] = norAttr.getZ(v);
                    const dx = x - O.x, dy = y - O.y, dz = z - O.z;
                    uvBoca[k * 3] = dx * T.x + dy * T.y + dz * T.z;
                    uvBoca[k * 3 + 1] = dx * B.x + dy * B.y + dz * B.z;
                    uvBoca[k * 3 + 2] = dx * N.x + dy * N.y + dz * N.z;
                }

                const estado = { abierta: -1, sonrisa: 0, redonda: 0, puchero: 0, cejaSubir: 0, cejaFruncir: 0, cejaTriste: 0, pomulo: 0 };

                function actualizar(f) {
                    const d = Math.abs(estado.abierta - f.abierta) + Math.abs(estado.sonrisa - f.sonrisa)
                        + Math.abs(estado.redonda - f.redonda) + Math.abs(estado.puchero - f.puchero)
                        + Math.abs(estado.cejaSubir - f.cejaSubir) + Math.abs(estado.cejaFruncir - f.cejaFruncir)
                        + Math.abs(estado.cejaTriste - f.cejaTriste) + Math.abs(estado.pomulo - f.pomulo);
                    if (d < 0.0015) return false;
                    Object.assign(estado, f);

                    const P = perfilLabios(estado);
                    const pos = posAttr.array, nor = norAttr.array;
                    const bajadaJaw = Math.min(0.018, P.abre * 0.016);
                    const cSub = estado.cejaSubir, cFru = estado.cejaFruncir, cTri = estado.cejaTriste;
                    const pom = estado.pomulo + Math.max(0, estado.sonrisa) * 0.25 * P.tAbierta;

                    for (let k = 0; k < nf; k++) {
                        const v = idxCara[k];
                        const x = p0[k * 3], y = p0[k * 3 + 1], z = p0[k * 3 + 2];
                        const nx = n0[k * 3], ny = n0[k * 3 + 1], nz = n0[k * 3 + 2];
                        const ax = Math.abs(x), sx = x >= 0 ? 1 : -1;
                        let dx = 0, dy = 0, dz = 0, dnx = 0, dny = 0, dnz = 0;

                        // 1) Cejas suaves sobre la frente (solo activas en expresiones, 0 en reposo)
                        if (y > 0.745 && z > 0.08) {
                            const wCeja = Math.exp(-Math.pow((ax - 0.104) / 0.072, 2) - Math.pow((y - 0.800) / 0.042, 2)) * sstep(0.08, 0.18, z);
                            if (wCeja > 0.002) {
                                const tInt = sstep(0.14, 0.05, ax);
                                const movY = wCeja * (cSub * 0.012 + cTri * (0.014 * tInt - 0.005 * (1 - tInt)) - cFru * (0.014 * tInt + 0.002));
                                const movZ = wCeja * (cSub * 0.003 + cFru * 0.005 * tInt + cTri * 0.003 * tInt);
                                const movX = -sx * wCeja * cFru * 0.005 * tInt;
                                dx += movX; dy += movY; dz += movZ;
                                dny += movY * 4.5; dnz += movZ * 3.5;
                            }
                        }

                        // 2) Pómulos rechonchos altos (alejados de las comisuras para no atravesar jamás Nailong_boca)
                        if (pom > 0.01 && y > 0.640 && y < 0.750 && z > 0.09) {
                            const wPom = Math.exp(-Math.pow((ax - 0.140) / 0.052, 2) - Math.pow((y - 0.684) / 0.036, 2))
                                * sstep(0.640, 0.676, y) * sstep(0.09, 0.19, z);
                            dy += wPom * pom * 0.008;
                            dx += sx * wPom * pom * 0.004;
                            dz += wPom * pom * 0.003;
                            dny += wPom * pom * 0.08;
                        }

                        // 3) Mandíbula suave y bolsillo oral cóncavo estricto dentro del perímetro labial
                        const u = uvBoca[k * 3], vb = uvBoca[k * 3 + 1], prof = uvBoca[k * 3 + 2];
                        if (y < 0.695 && z > 0.07) {
                            const wJaw = pesoMandibula(y) * sstep(0.07, 0.19, z) * Math.exp(-Math.pow(ax / 0.185, 2));
                            dy -= wJaw * bajadaJaw;
                            dz -= wJaw * bajadaJaw * 0.22;

                            // Bolsillo oral estricto dentro de rElip < 0.94: hunde la piel tras la cavidad sin morder los bordes
                            if (P.tAbierta > 0.005 && prof > -0.06 && Math.abs(u) < P.ancho * 1.05) {
                                const un = Math.max(-0.999, Math.min(0.999, u / P.ancho));
                                const L = P.evaluar(un);
                                const centroV = (L.sup + L.inf) * 0.5;
                                const semiV = Math.max(0.003, (L.sup - L.inf) * 0.5);
                                const dv = (vb - centroV) / semiV;
                                const rElip = Math.hypot(un, dv);
                                if (rElip < 0.94) {
                                    const wDentro = sstep(0.94, 0.62, rElip) * P.tAbierta;
                                    const hunde = (0.058 + 0.016 * Math.min(1, P.abre)) * wDentro;
                                    dx -= N.x * hunde;
                                    dy -= N.y * hunde;
                                    dz -= N.z * hunde;
                                }
                            }
                        }

                        pos[v * 3] = x + dx;
                        pos[v * 3 + 1] = y + dy;
                        pos[v * 3 + 2] = z + dz;
                        const nnx = nx + dnx, nny = ny + dny, nnz = nz + dnz;
                        const nl = Math.hypot(nnx, nny, nnz) || 1;
                        nor[v * 3] = nnx / nl; nor[v * 3 + 1] = nny / nl; nor[v * 3 + 2] = nnz / nl;
                    }

                    posAttr.updateRange.offset = minIdx * 3;
                    posAttr.updateRange.count = (maxIdx - minIdx + 1) * 3;
                    norAttr.updateRange.offset = minIdx * 3;
                    norAttr.updateRange.count = (maxIdx - minIdx + 1) * 3;
                    posAttr.needsUpdate = true;
                    norAttr.needsUpdate = true;
                    return true;
                }

                return { actualizar, estado };
            }

            /* ---------- Ensamblaje Bucal 3D limpio: bóveda suave + arco dental continuo sin colmillos + lengua 3D ---------- */
            function crearArcoDental(THREE, material, esSuperior) {
                const NU = 30, NV = 11;
                const geo = new THREE.BufferGeometry();
                const pos = new Float32Array(NU * NV * 3);
                const nor = new Float32Array(NU * NV * 3);
                const idx = [];
                for (let j = 0; j < NV - 1; j++) for (let i = 0; i < NU - 1; i++) {
                    const a = j * NU + i, b = a + 1, c = a + NU, d = c + 1;
                    if (esSuperior) idx.push(a, c, d, a, d, b);
                    else idx.push(a, b, d, a, d, c);
                }
                for (let j = 0; j < NV; j++) {
                    const v = j / (NV - 1);
                    const angBorde = v * Math.PI;
                    const perfilY = Math.sin(angBorde * 0.88);
                    const perfilZ = Math.cos(angBorde);
                    for (let i = 0; i < NU; i++) {
                        const un = (i / (NU - 1)) * 2 - 1;
                        const estrechaExtremo = Math.sin(Math.acos(Math.max(-0.98, Math.min(0.98, un * 0.96))));
                        const ang = un * 1.24;
                        const rx = 0.036, rz = 0.034;
                        const semiEspesor = 0.0020 * estrechaExtremo;
                        const x = Math.sin(ang) * rx + Math.sin(ang) * perfilZ * semiEspesor;
                        const z = (Math.cos(ang) - 1) * rz + Math.cos(ang) * perfilZ * semiEspesor;
                        // Arco dental liso, blanco y adorable (sin colmillos afilados, fiel a capturas 02 y 13)
                        const altoArco = (esSuperior ? 0.0112 : 0.0085) * Math.pow(estrechaExtremo, 1.15);
                        const curvaComisura = (esSuperior ? -1 : 1) * 0.0038 * un * un;
                        const y = curvaComisura + (esSuperior ? -1 : 1) * perfilY * altoArco;
                        const k = j * NU + i;
                        pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z;
                    }
                }
                geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
                geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
                geo.setIndex(idx);
                geo.computeVertexNormals();
                const m = new THREE.Mesh(geo, material);
                m.name = esSuperior ? 'Nailong_dientesSup' : 'Nailong_dientesInf';
                m.userData.mat = 'dientes';
                return m;
            }

            function crearMallaLengua(THREE, material) {
                const geo = new THREE.SphereGeometry(1, 28, 18);
                const p = geo.attributes.position;
                for (let i = 0; i < p.count; i++) {
                    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
                    const adelante = sstep(-0.6, 0.9, z);
                    x *= 1.0 - 0.14 * z;
                    if (y > 0) {
                        const surco = Math.exp(-Math.pow(x / 0.24, 2)) * adelante * 0.24;
                        y *= (0.64 - surco);
                    } else {
                        y *= 0.48;
                    }
                    p.setXYZ(i, x, y, z);
                }
                geo.computeVertexNormals();
                const m = new THREE.Mesh(geo, material);
                m.name = 'Nailong_lengua';
                m.userData.mat = 'lengua';
                return m;
            }

            function crearBoca(THREE, mats, hueso, caraRef) {
                const ancla = impacto([0, 0.634, 1.2], [0, 0.634, 0.04]);
                const O = v3(THREE, ancla.p), N = v3(THREE, ancla.n);
                const T = new THREE.Vector3(0, 1, 0).cross(N).normalize();
                const B = N.clone().cross(T).normalize();
                const marco = { O, T, B, N };

                // Mapa amplio del morro en reposo (EU=EV=0.165) para no recortar jamás ninguna expresión abierta
                const MU = 61, MV = 61, EU = 0.165, EV = 0.165;
                const mapa = new Float32Array(MU * MV * 6);
                for (let j = 0; j < MV; j++) for (let i = 0; i < MU; i++) {
                    const u = (i / (MU - 1) * 2 - 1) * EU, v = (j / (MV - 1) * 2 - 1) * EV;
                    const q = O.clone().addScaledVector(T, u).addScaledVector(B, v);
                    const desde = q.clone().addScaledVector(N, 0.28);
                    const hit = impacto([desde.x, desde.y, desde.z], [q.x - N.x * 0.12, q.y - N.y * 0.12, q.z - N.z * 0.12]) || { p: [q.x, q.y, q.z], n: [N.x, N.y, N.z] };
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

                // Malla polar/anular (N_ANG x N_RAD): borde compacto al ras de piel -> transición limpia -> cavidad cóncava
                const N_ANG = 56, N_RAD = 20;
                const nv = N_ANG * N_RAD + 1;
                const iCentro = N_ANG * N_RAD;
                const geo = new THREE.BufferGeometry();
                const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3);
                geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
                geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
                geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
                const idx = [];
                for (let r = 0; r < N_RAD - 1; r++) {
                    for (let a = 0; a < N_ANG; a++) {
                        const a2 = (a + 1) % N_ANG;
                        const p00 = r * N_ANG + a, p10 = r * N_ANG + a2;
                        const p01 = (r + 1) * N_ANG + a, p11 = (r + 1) * N_ANG + a2;
                        idx.push(p00, p10, p11, p00, p11, p01);
                    }
                }
                const rUlt = (N_RAD - 1) * N_ANG;
                for (let a = 0; a < N_ANG; a++) {
                    idx.push(rUlt + a, rUlt + ((a + 1) % N_ANG), iCentro);
                }
                geo.setIndex(idx);

                const malla = new THREE.Mesh(geo, mats.boca);
                malla.name = 'Nailong_boca';
                malla.userData.mat = 'boca';
                malla.frustumCulled = false;
                const base = hueso.userData.reposoMundo;
                adjuntar(malla, hueso, new THREE.Vector3(base.x, base.y, base.z));
                malla.position.set(0, 0, 0);

                const dientesSup = crearArcoDental(THREE, mats.dientes, true);
                const dientesInf = crearArcoDental(THREE, mats.dientes, false);
                const lengua = crearMallaLengua(THREE, mats.lengua);
                hueso.add(dientesSup, dientesInf, lengua);

                const ejesBoca = new THREE.Matrix4().makeBasis(T, B, N);
                const quatBoca = new THREE.Quaternion().setFromRotationMatrix(ejesBoca);

                const lin = (h) => G.srgbALineal(h);
                const cPiel = lin(G.COLORES.amarillo);
                const cLabioLuz = lin('#FFE26A');
                const cLabioSombra = lin('#D9901A');
                const cLineaCerrada = lin('#8E4B0C'); // caramelo cálido limpio y legible para el arquito cerrado (captura 08)
                const cBocaBorde = lin('#621820');
                const cBocaFondo = lin('#2A070C');
                const tmp = new Float32Array(6);

                const forma = {
                    abierta: 0.02, sonrisa: 0.42, redonda: 0, puchero: 0, dientes: 0, lengua: 1, fuera: 0,
                    cejaSubir: 0, cejaFruncir: 0, cejaTriste: 0, pomulo: 0
                };

                function actualizar(f) {
                    if (f) Object.assign(forma, f);
                    if (caraRef && caraRef.instancia) caraRef.instancia.actualizar(forma);

                    const P = perfilLabios(forma);
                    const bajadaJaw = Math.min(0.018, P.abre * 0.016);
                    const profMax = (0.030 + 0.008 * Math.min(1, P.abre)) * P.tAbierta;
                    const L0 = P.evaluar(0);
                    const centroV0 = (L0.sup + L0.inf) * 0.5;

                    for (let r = 0; r < N_RAD; r++) {
                        const sr = r / (N_RAD - 1);
                        // Falda compacta (1.06x) al ras exacto de la piel en sr=0 para eliminar cualquier escalón/hilito superior
                        const escalaAnillo = 1.06 - 0.77 * Math.pow(sr, 0.78);
                        const tCavidad = sstep(0.16, 0.28, sr) * P.tAbierta;
                        const hundimiento = -profMax * Math.pow(sstep(0.20, 0.88, sr), 1.25);
                        const elevBase = 0.0007 + 0.0010 * sstep(0.0, 0.14, sr);
                        const elev = elevBase + hundimiento;
                        const tCerrada = (1 - P.tAbierta) * sstep(0.28, 0.62, sr);

                        for (let a = 0; a < N_ANG; a++) {
                            const th = (a / N_ANG) * Math.PI * 2;
                            const cosT = Math.cos(th), sinT = Math.sin(th);
                            const unBase = cosT * Math.min(1, escalaAnillo);
                            const L = P.evaluar(Math.max(-0.999, Math.min(0.999, unBase)));
                            const centroV = (L.sup + L.inf) * 0.5;
                            const semiV = Math.max(0.0010, (L.sup - L.inf) * 0.5);
                            const u = cosT * P.ancho * escalaAnillo;
                            const v = centroV + sinT * semiV * escalaAnillo;
                            muestrear(u, v, tmp);

                            // Misma ley de caída mandibular que crearCaraDeformable para un sellado 100 % exacto
                            const wJaw = pesoMandibula(tmp[1]) * sstep(0.07, 0.19, tmp[2]) * Math.exp(-Math.pow(tmp[0] / 0.185, 2));
                            const caidaY = -wJaw * bajadaJaw;
                            const caidaZ = -wJaw * bajadaJaw * 0.22;

                            const k = r * N_ANG + a;
                            pos[k * 3] = tmp[0] + tmp[3] * elev - base.x;
                            pos[k * 3 + 1] = tmp[1] + tmp[4] * elev + caidaY - base.y;
                            pos[k * 3 + 2] = tmp[2] + tmp[5] * elev + caidaZ - base.z;

                            const giroAdentro = sstep(0.16, 0.48, sr) * (1 - sstep(0.75, 1.0, sr)) * (0.06 + 0.82 * P.tAbierta);
                            let nx = tmp[3] - (T.x * cosT + B.x * sinT) * giroAdentro;
                            let ny = tmp[4] - (T.y * cosT + B.y * sinT) * giroAdentro;
                            let nz = tmp[5] - (T.z * cosT + B.z * sinT) * giroAdentro;
                            const nl = Math.hypot(nx, ny, nz) || 1;
                            nor[k * 3] = nx / nl; nor[k * 3 + 1] = ny / nl; nor[k * 3 + 2] = nz / nl;

                            const luzSupLabio = Math.max(0, sinT) * Math.exp(-Math.pow((sr - 0.12) / 0.08, 2)) * 0.08 * P.tAbierta;
                            const sombraPliegue = Math.max(0, -sinT) * Math.exp(-Math.pow((sr - 0.20) / 0.08, 2)) * 0.12 * P.tAbierta;
                            const profCav = sstep(0.26, 0.94, sr);
                            const desvaneceComisura = sstep(1.0, 0.08, Math.abs(cosT));
                            for (let c = 0; c < 3; c++) {
                                let piel = cPiel[c] + (cLabioLuz[c] - cPiel[c]) * luzSupLabio;
                                piel += (cLabioSombra[c] - piel) * sombraPliegue;
                                piel += (cLineaCerrada[c] - piel) * tCerrada * desvaneceComisura * 0.86;
                                const cav = cBocaBorde[c] + (cBocaFondo[c] - cBocaBorde[c]) * Math.min(1, profCav + Math.max(0, sinT) * 0.20);
                                col[k * 3 + c] = piel + (cav - piel) * tCavidad;
                            }
                        }
                    }

                    // Vértice central del fondo de la cavidad
                    muestrear(0, centroV0, tmp);
                    const elevC = 0.0014 - profMax;
                    const wJawC = pesoMandibula(tmp[1]) * sstep(0.07, 0.19, tmp[2]);
                    pos[iCentro * 3] = tmp[0] + tmp[3] * elevC - base.x;
                    pos[iCentro * 3 + 1] = tmp[1] + tmp[4] * elevC - wJawC * bajadaJaw - base.y;
                    pos[iCentro * 3 + 2] = tmp[2] + tmp[5] * elevC - wJawC * bajadaJaw * 0.22 - base.z;
                    nor[iCentro * 3] = tmp[3]; nor[iCentro * 3 + 1] = tmp[4]; nor[iCentro * 3 + 2] = tmp[5];
                    for (let c = 0; c < 3; c++) {
                        const cerr = cPiel[c] + (cLineaCerrada[c] - cPiel[c]) * 0.86;
                        col[iCentro * 3 + c] = cerr + (cBocaFondo[c] - cerr) * P.tAbierta;
                    }

                    geo.attributes.position.needsUpdate = true;
                    geo.attributes.normal.needsUpdate = true;
                    geo.attributes.color.needsUpdate = true;

                    const mostrarDientes = P.tAbierta > 0.16 && (forma.dientes > 0.08 || P.abre > 0.48);
                    dientesSup.visible = mostrarDientes;
                    // Dientes inferiores sutiles solo en sonrisas/risas muy amplias (captura 02)
                    dientesInf.visible = mostrarDientes && forma.dientes > 0.68 && P.abre > 0.45 && (forma.redonda || 0) < 0.30;
                    if (mostrarDientes) {
                        const escAncho = (P.ancho / 0.036) * 0.78;
                        const visD = Math.max(forma.dientes || 0, sstep(0.48, 0.95, P.abre) * 0.90);
                        muestrear(0, L0.sup - 0.0018, tmp);
                        const wJawS = pesoMandibula(tmp[1]) * sstep(0.07, 0.19, tmp[2]);
                        dientesSup.quaternion.copy(quatBoca);
                        dientesSup.scale.set(escAncho, 0.80 + 0.36 * visD, Math.min(1.18, escAncho * 0.95));
                        dientesSup.position.set(tmp[0] - base.x, tmp[1] - wJawS * bajadaJaw - base.y, tmp[2] - wJawS * bajadaJaw * 0.22 - base.z)
                            .addScaledVector(N, -0.0040 - 0.0012 * Math.min(1, P.abre));

                        if (dientesInf.visible) {
                            muestrear(0, L0.inf + 0.0036, tmp);
                            const wJawI = pesoMandibula(tmp[1]) * sstep(0.07, 0.19, tmp[2]);
                            dientesInf.quaternion.copy(quatBoca);
                            dientesInf.scale.set(escAncho * 0.88, 0.75 + 0.30 * visD, Math.min(1.12, escAncho * 0.90));
                            dientesInf.position.set(tmp[0] - base.x, tmp[1] - wJawI * bajadaJaw - base.y, tmp[2] - wJawI * bajadaJaw * 0.22 - base.z)
                                .addScaledVector(N, -0.0060 - 0.0014 * Math.min(1, P.abre));
                        }
                    }

                    // Lengua 3D: bien asentada dentro de la cavidad abierta, o saliendo con gracia solo en burla (fuera > 0.08)
                    const fuera = Math.max(0, Math.min(1.1, forma.fuera || 0));
                    const mostrarLengua = (P.tAbierta > 0.24 && (forma.lengua === undefined || forma.lengua > 0.25)) || fuera > 0.08;
                    lengua.visible = mostrarLengua;
                    if (mostrarLengua) {
                        muestrear(0, L0.inf + 0.006, tmp);
                        const wJawL = pesoMandibula(tmp[1]) * sstep(0.07, 0.19, tmp[2]);
                        lengua.quaternion.copy(quatBoca);
                        if (fuera > 0.08) {
                            lengua.rotateX(0.36 + 0.28 * fuera);
                            lengua.scale.set(P.ancho * 0.50, 0.0095, 0.018 + 0.018 * fuera);
                            lengua.position.set(tmp[0] - base.x, tmp[1] - wJawL * bajadaJaw - base.y, tmp[2] - wJawL * bajadaJaw * 0.22 - base.z)
                                .addScaledVector(N, -0.008 + 0.016 * fuera)
                                .addScaledVector(B, 0.005 - 0.006 * fuera);
                        } else {
                            lengua.rotateX(0.12);
                            const escL = Math.min(1.15, 0.62 + P.abre * 0.42);
                            lengua.scale.set(P.ancho * 0.60, 0.0095 * escL, 0.018 * escL);
                            lengua.position.set(tmp[0] - base.x, tmp[1] - wJawL * bajadaJaw - base.y, tmp[2] - wJawL * bajadaJaw * 0.22 - base.z)
                                .addScaledVector(N, -0.017 - 0.004 * Math.min(1, P.abre))
                                .addScaledVector(B, 0.005 + 0.003 * Math.min(1, P.abre));
                        }
                    }
                }

                return { malla, dientesSup, dientesInf, lengua, marco, actualizar, forma };
            }

            /* ---------- Ojos, párpados suaves al ras de piel y brillo especular nítido ---------- */
            function crearGeoParpado(THREE, rInt, rExt, esSuperior) {
                const N_AZ = 48, N_EL = 14, N_BORDE = 5;
                const rDomo = rInt + 0.0008;
                const anillos = [];
                for (let j = 0; j < N_EL; j++) {
                    const u = j / (N_EL - 1);
                    const el = (1 - u) * (Math.PI * 0.54);
                    const engrosa = Math.pow(sstep(0.64, 1.0, u), 1.4);
                    const r = rDomo + (rExt - rDomo) * engrosa;
                    anillos.push({ el: esSuperior ? el : -el, r, tBorde: Math.pow(u, 5.0) * 0.14 });
                }
                for (let j = 1; j <= N_BORDE; j++) {
                    const u = j / N_BORDE;
                    const angB = u * Math.PI;
                    const r = (rExt + rInt) * 0.5 + (rExt - rInt) * 0.5 * Math.cos(angB);
                    const despEl = Math.sin(angB) * ((rExt - rInt) * 0.50 / rExt);
                    const el = esSuperior ? -despEl : despEl;
                    anillos.push({ el, r, tBorde: 0.14 + 0.14 * Math.sin(u * Math.PI * 0.85) });
                }
                const NR = anillos.length;
                const nv = NR * N_AZ;
                const pos = new Float32Array(nv * 3);
                const baseEl = new Float32Array(nv);
                const baseAz = new Float32Array(nv);
                const baseR = new Float32Array(nv);
                const col = new Float32Array(nv * 3);
                const cPiel = G.srgbALineal(G.COLORES.amarillo);
                const cPliegue = G.srgbALineal('#DF9A1E'); // dorado suave solo en el pliegue al parpadear/cerrar

                for (let r = 0; r < NR; r++) {
                    const an = anillos[r];
                    const cosE = Math.cos(an.el), sinE = Math.sin(an.el);
                    for (let a = 0; a < N_AZ; a++) {
                        const az = (a / N_AZ) * Math.PI * 2;
                        const k = r * N_AZ + a;
                        const x = -Math.cos(az) * cosE * an.r;
                        const y = sinE * an.r;
                        const z = Math.sin(az) * cosE * an.r;
                        pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z;
                        baseEl[k] = an.el; baseAz[k] = az; baseR[k] = an.r;
                        const frontal = Math.max(0, Math.sin(az));
                        const tb = an.tBorde * (0.25 + 0.75 * frontal);
                        for (let c = 0; c < 3; c++) col[k * 3 + c] = cPiel[c] + (cPliegue[c] - cPiel[c]) * tb;
                    }
                }
                const idx = [];
                for (let r = 0; r < NR - 1; r++) {
                    for (let a = 0; a < N_AZ; a++) {
                        const a2 = (a + 1) % N_AZ;
                        const p00 = r * N_AZ + a, p10 = r * N_AZ + a2;
                        const p01 = (r + 1) * N_AZ + a, p11 = (r + 1) * N_AZ + a2;
                        if (esSuperior) idx.push(p00, p01, p11, p00, p11, p10);
                        else idx.push(p00, p10, p11, p00, p11, p01);
                    }
                }
                const geo = new THREE.BufferGeometry();
                geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
                geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
                geo.setIndex(idx);
                geo.computeVertexNormals();
                return { geo, baseEl, baseAz, baseR };
            }

            function crearOjos(THREE, M, hueso) {
                const O = G.OJO;
                const geoGlobo = new THREE.SphereGeometry(O.r, 48, 32);
                const rInt = O.r + 0.00035, rExt = O.r + 0.0022;
                const datosSup = crearGeoParpado(THREE, rInt, rExt, true);
                const datosInf = crearGeoParpado(THREE, rInt, rExt, false);

                // Deformación compartida en arco feliz (^ ^) para carcajada/mimos (solo se recalcula cuando cambia)
                let arcoActual = 0;
                function arquear(arco) {
                    const a = Math.max(-0.2, Math.min(0.65, arco || 0));
                    if (Math.abs(a - arcoActual) < 0.002) return;
                    arcoActual = a;
                    [datosSup, datosInf].forEach((d) => {
                        const p = d.geo.attributes.position.array;
                        for (let i = 0; i < d.baseEl.length; i++) {
                            const az = d.baseAz[i], r = d.baseR[i];
                            const frente = Math.max(0, Math.sin(az));
                            const cercaFilo = Math.exp(-Math.pow(d.baseEl[i] / 0.55, 2));
                            const el = d.baseEl[i] + a * 0.42 * frente * frente * cercaFilo;
                            const ce = Math.cos(el), se = Math.sin(el);
                            p[i * 3] = -Math.cos(az) * ce * r;
                            p[i * 3 + 1] = se * r;
                            p[i * 3 + 2] = Math.sin(az) * ce * r;
                        }
                        d.geo.attributes.position.needsUpdate = true;
                        d.geo.computeVertexNormals();
                    });
                }

                function crearGeoBrillo(radioEsfera, radioBrillo, offset) {
                    const geo = new THREE.CircleGeometry(radioBrillo, 24);
                    const pos = geo.attributes.position;
                    const R = radioEsfera + offset;
                    for (let i = 0; i < pos.count; i++) {
                        const x = pos.getX(i), y = pos.getY(i);
                        pos.setZ(i, Math.sqrt(Math.max(0, R * R - x * x - y * y)) - R);
                    }
                    geo.computeVertexNormals();
                    return geo;
                }

                const offsetBrillo = 0.00022;
                const ojos = [];
                [1, -1].forEach((lado) => {
                    const sufijo = lado > 0 ? 'Izq' : 'Der';
                    const centro = new THREE.Vector3(O.x * lado, O.y, O.z);
                    const pivote = new THREE.Object3D();
                    adjuntar(pivote, hueso, centro);
                    pivote.rotation.y = O.giro * lado;
                    pivote.rotation.x = 0.01;
                    const giroBase = -O.giro * lado * 0.85;

                    const uOjoAO = { value: new THREE.Vector4(0.98, -0.98, 0, 0) };
                    const uGloboAPivote = { value: new THREE.Matrix3() };
                    const matSuaveOjo = M.suave.ojo.clone();
                    const matToonOjo = M.toon.ojo.clone();
                    matSuaveOjo.name = 'Nailong_ojo' + sufijo;
                    matToonOjo.name = 'Nailong_ojo' + sufijo;
                    inyectarOjoAO(matSuaveOjo, uOjoAO, uGloboAPivote, 'suave-' + sufijo);
                    inyectarOjoAO(matToonOjo, uOjoAO, uGloboAPivote, 'toon-' + sufijo);
                    const claveMat = 'ojo' + sufijo;
                    M.suave[claveMat] = matSuaveOjo;
                    M.toon[claveMat] = matToonOjo;
                    M.exportar[claveMat] = M.exportar.ojo;

                    const globo = new THREE.Mesh(geoGlobo, matSuaveOjo); globo.userData.mat = claveMat;
                    globo.rotation.y = giroBase;
                    const sup = new THREE.Mesh(datosSup.geo, M.suave.parpado); sup.userData.mat = 'parpado';
                    const inf = new THREE.Mesh(datosInf.geo, M.suave.parpado); inf.userData.mat = 'parpado';
                    pivote.name = 'Nailong_ojo' + sufijo; globo.name = 'Nailong_globo' + sufijo;
                    sup.name = 'Nailong_parpadoSup' + sufijo; inf.name = 'Nailong_parpadoInf' + sufijo;
                    pivote.add(globo, sup, inf);

                    // Un brillo circular blanco nítido arriba-derecha (idéntico a las capturas 08, 12, 13 y 14)
                    const brillos = [];
                    [[0.18, 0.22, 0.0086]].forEach(([bx, by, br]) => {
                        const bxPiv = bx - O.giro * lado * 0.78;
                        const d = new THREE.Vector3(bxPiv, by, Math.sqrt(Math.max(0.05, 1 - bxPiv * bxPiv - by * by))).normalize();
                        const geoB = crearGeoBrillo(O.r, br, offsetBrillo);
                        const b = new THREE.Mesh(geoB, M.suave.brillo); b.userData.mat = 'brillo';
                        b.position.copy(d).multiplyScalar(O.r + offsetBrillo);
                        b.lookAt(d.clone().multiplyScalar(2));
                        b.renderOrder = 3;
                        pivote.add(b);
                        brillos.push({ malla: b, elev: Math.asin(d.y), xLat: d.x, radio: br / O.r });
                    });
                    ojos.push({ lado, globo, pivote, sup, inf, giroBase, brillos, uOjoAO, uGloboAPivote });
                });
                ojos.arquear = arquear;
                return ojos;
            }

            /* ---------- Construcción completa del modelo ---------- */
            function crearModelo(THREE, malla, proxy) {
                const uniformes = crearUniformesToque(THREE);
                const texOjo = crearTexturaOjo(THREE);
                const M = crearMateriales(THREE, texOjo, uniformes);

                // Esqueleto de 15 huesos (incluye codoIzq/codoDer y colaMedia)
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

                // Ojos, deformador facial 3D y boca 3D acoplados
                const cabeza = porNombre.cabeza;
                const ojos = crearOjos(THREE, M, cabeza);
                const caraRef = { instancia: null };
                const boca = crearBoca(THREE, M.suave, cabeza, caraRef);
                caraRef.instancia = crearCaraDeformable(THREE, cuerpo.geometry, boca.marco);
                boca.actualizar();

                // Geometría de escamita dorsal redondeada suave en verde-oliva (capturas 09 y 10 espalda)
                const geoPlaca = new THREE.SphereGeometry(1, 28, 20);
                {
                    const pp = geoPlaca.attributes.position;
                    for (let i = 0; i < pp.count; i++) {
                        let x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i);
                        const h = Math.max(0, z); // +z sale hacia fuera de la espalda
                        const estrechaX = 1.0 - 0.22 * Math.pow(h, 1.2);
                        const estrechaY = 1.0 - 0.12 * Math.pow(h, 1.25);
                        x *= estrechaX;
                        y = y * estrechaY - 0.06 * h * h;
                        pp.setXYZ(i, x, y, z);
                    }
                    geoPlaca.computeVertexNormals();
                }

                // Geometría de garrita cortita, rechoncha y roma (capturas 02, 05, 08, 13 y 15)
                const geoGarra = new THREE.SphereGeometry(1, 24, 16);
                {
                    const gp = geoGarra.attributes.position;
                    for (let i = 0; i < gp.count; i++) {
                        const z = gp.getZ(i);
                        const s = z > 0 ? 1 - 0.34 * Math.pow(z, 1.4) : 1;
                        gp.setX(i, gp.getX(i) * s);
                        gp.setY(i, gp.getY(i) * s);
                    }
                    geoGarra.computeVertexNormals();
                }

                const poner = (hueso, matClave, hit, radios, hundido, inclinar, sombra, geoEsp) => {
                    if (!hit) return null;
                    const { malla: m, p } = bulto(THREE, geoEsp, M.suave[matClave], hit, radios, hundido, inclinar);
                    m.userData.mat = matClave;
                    m.castShadow = !!sombra;
                    adjuntar(m, hueso, p, m.quaternion.clone());
                    return m;
                };

                // 3 escamitas dorsales verde-oliva en la nuca/trasera de la cabeza: arriba pequeña, centro mayor, abajo mediana (captura 10)
                const cc = G.ANATOMIA.craneo.c;
                [[0.76, 0.032, 0.46], [1.18, 0.044, 0.46], [1.58, 0.036, 0.46]].forEach(([ang, r, hund]) => {
                    const dir = [0, Math.cos(ang), -Math.sin(ang)];
                    const hit = impacto([cc[0] + dir[0], cc[1] + dir[1], cc[2] + dir[2]], cc);
                    poner(cabeza, 'placa', hit, [r * 0.88, r * 1.04, r * 0.72], hund, null, true, geoPlaca);
                });

                // Manos: 3 garritas cortitas y redondeadas adjuntas al codo siguiendo el eje del antebrazo (capturas 03, 08, 12 y 13)
                const An = G.ANATOMIA;
                [1, -1].forEach((l) => {
                    const hueso = l > 0 ? porNombre.codoIzq : porNombre.codoDer;
                    const codo = new THREE.Vector3(An.brazo.codo[0] * l, An.brazo.codo[1], An.brazo.codo[2]);
                    const c = new THREE.Vector3(An.mano.c[0] * l, An.mano.c[1], An.mano.c[2]);
                    const eje = c.clone().sub(codo).normalize();
                    const refPalma = new THREE.Vector3(-0.22 * l, -0.24, 0.94);
                    const palma = refPalma.addScaledVector(eje, -refPalma.dot(eje)).normalize();
                    const abanico = new THREE.Vector3().crossVectors(palma, eje).normalize();
                    [-0.50, 0, 0.50].forEach((ang) => {
                        const d = eje.clone().multiplyScalar(0.80 * Math.cos(ang * 0.45))
                            .addScaledVector(palma, 0.22)
                            .addScaledVector(abanico, 0.56 * Math.sin(ang)).normalize();
                        const desde = c.clone().addScaledVector(d, 0.11);
                        poner(hueso, 'garra', impacto([desde.x, desde.y, desde.z], [c.x, c.y, c.z], 0.18), [0.0115, 0.0105, 0.0155], 0.46, d, false, geoGarra);
                    });
                });

                // Pies: 3 uñitas cortitas y romas asentadas bajas en el borde frontal de cada pie (capturas 05, 06 y 14)
                [1, -1].forEach((l) => {
                    const hueso = l > 0 ? porNombre.piernaIzq : porNombre.piernaDer;
                    const c = new THREE.Vector3(An.pie.c[0] * l, An.pie.c[1] - 0.008, An.pie.c[2]);
                    [-0.44, 0, 0.44].forEach((ang) => {
                        const d = new THREE.Vector3(Math.sin(ang) * 0.86 + 0.05 * l, -0.16, Math.cos(ang)).normalize();
                        const desde = c.clone().addScaledVector(d, 0.17);
                        poner(hueso, 'garra', impacto([desde.x, desde.y, desde.z], [c.x, c.y, c.z], 0.26), [0.0150, 0.0115, 0.0165], 0.48, new THREE.Vector3(Math.sin(ang) * 0.30, -0.18, 1).normalize(), false, geoGarra);
                    });
                });

                const modelo = {
                    grupo, cuerpo, contorno, proxy: mallaProxy, esqueleto, huesos: porNombre, ojos, boca,
                    cara: caraRef.instancia, materiales: M, uniformes, estilo: 'suave', texOjo
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

            /* ---------- Estudio de iluminación Seventh Impression: luz clave limpia, cielo suave y rebote cálido ---------- */
            function crearEstudio(THREE, renderer, escena, calidad) {
                const env = new THREE.Scene();
                const cupula = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.ShaderMaterial({
                    side: THREE.BackSide, depthWrite: false,
                    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
                    fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 arriba = vec3(1.0, 0.98, 0.94); vec3 abajo = vec3(0.92, 0.72, 0.36); gl_FragColor = vec4(mix(abajo, arriba, smoothstep(-0.35, 0.65, h)) * 0.86, 1.0); }'
                }));
                env.add(cupula);
                const caja = (pos, esc, int, col) => {
                    const c = col || new THREE.Color(int, int * 0.98, int * 0.93);
                    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
                    m.position.set(pos[0], pos[1], pos[2]); m.scale.set(esc[0], esc[1], 1); m.lookAt(0, 0.5, 0);
                    env.add(m);
                };
                caja([3, 4.2, 4], [3.8, 3.0], 2.4);
                caja([-4, 2.2, 3], [3.0, 3.6], 1.15);
                caja([0, 3.6, -5], [5.2, 2.4], 1.45);
                caja([0, -2, 2], [4.0, 3.0], 0.55, new THREE.Color(0.76, 0.58, 0.30));
                const pmrem = new THREE.PMREMGenerator(renderer);
                const envTex = pmrem.fromScene(env, 0.045).texture;
                escena.environment = envTex;
                pmrem.dispose();

                // Luz equilibrada para conservar saturación natilla y relieve mate sin quemar la frente ni la barriga
                const hemi = new THREE.HemisphereLight(0xFFFCF2, 0xE29B32, 0.34);
                escena.add(hemi);
                const clave = new THREE.DirectionalLight(0xFFF8E8, 0.72);
                clave.position.set(1.4, 2.6, 2.5);
                clave.castShadow = true;
                const tam = calidad === 'baja' ? 1024 : 2048;
                clave.shadow.mapSize.set(tam, tam);
                Object.assign(clave.shadow.camera, { left: -0.92, right: 0.92, top: 1.0, bottom: -0.92, near: 0.5, far: 7 });
                clave.shadow.camera.updateProjectionMatrix();
                clave.shadow.bias = -0.0006;
                clave.shadow.normalBias = 0.012;
                clave.shadow.radius = 4;
                clave.target.position.set(0, 0.45, 0);
                escena.add(clave, clave.target);

                // Relleno lateral suave ligeramente neutro-celeste (como la luz de cielo abierto en los Shorts exteriores)
                const relleno = new THREE.DirectionalLight(0xEEF3FF, 0.28);
                relleno.position.set(-2.3, 1.3, 1.9);
                escena.add(relleno);

                const contra = new THREE.DirectionalLight(0xFFF6D8, 0.40);
                contra.position.set(-0.6, 1.9, -2.6);
                escena.add(contra);

                // Suelo: sombra real + sombra de contacto difusa
                const suelo = new THREE.Mesh(new THREE.CircleGeometry(1.6, 48), new THREE.ShadowMaterial({ opacity: 0.13 }));
                suelo.rotation.x = -Math.PI / 2;
                suelo.receiveShadow = true;
                escena.add(suelo);
                const lienzo = document.createElement('canvas');
                lienzo.width = lienzo.height = 128;
                const ctx = lienzo.getContext('2d');
                const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
                grad.addColorStop(0, 'rgba(130,78,16,0.34)');
                grad.addColorStop(0.55, 'rgba(130,78,16,0.12)');
                grad.addColorStop(1, 'rgba(130,78,16,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 128, 128);
                const contacto = new THREE.Mesh(new THREE.PlaneGeometry(1.04, 1.12), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lienzo), transparent: true, depthWrite: false }));
                contacto.rotation.x = -Math.PI / 2;
                contacto.position.set(0, 0.002, -0.09);
                contacto.renderOrder = -1;
                escena.add(contacto);
                return { hemi, clave, relleno, contra, suelo, contacto, envTex };
            }

            return { crearModelo, crearEstudio, crearTexturaOjo };
        })();
