console.log("Laboratorio NeuroVR - Nivel 5: Paneles Interactivos");

document.addEventListener('DOMContentLoaded', function () {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    const mundoFlotante = document.querySelector('#mundo-flotante') || scene;
    const entornoPrincipalEscena = document.querySelector('#entorno-principal') || scene;

    // ========== AUDIO ==========
    let audioCtx = null;
    let zumbidoFondo = null;
    let gainZumbido = null;
    let enModo360 = false;

    function iniciarMedios() {
        const vid = document.querySelector('#video-asset');
        if (vid && vid.paused && !enModo360) {
            vid.muted = false;
            vid.play().catch(e => console.log('Video autoplay error:', e));
        }

        if (audioCtx) {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            return;
        }
        audioCtx = new (window.AudioContext || window.webkitAudioContext());

        zumbidoFondo = audioCtx.createOscillator();
        gainZumbido = audioCtx.createGain();

        zumbidoFondo.type = 'sine';
        zumbidoFondo.frequency.setValueAtTime(55, audioCtx.currentTime);

        gainZumbido.gain.setValueAtTime(0.03, audioCtx.currentTime);

        zumbidoFondo.connect(gainZumbido);
        gainZumbido.connect(audioCtx.destination);
        zumbidoFondo.start();

        console.log("🔊 Audio iniciado: zumbido 55Hz, estado:", audioCtx.state);
    }

    function sonidoImpulso(frecuencia = 800) {
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frecuencia, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(frecuencia * 0.5, audioCtx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.15);
    }

    function sonidoOnda() {
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
    }

    document.addEventListener('click', iniciarMedios);
    document.addEventListener('touchstart', iniciarMedios);

    scene.addEventListener('loaded', function () {
        iniciarMedios();
        scene.addEventListener('click', iniciarMedios);
        const botonVR = document.querySelector('.a-enter-vr-button');
        if (botonVR) {
            botonVR.addEventListener('click', iniciarMedios);
        }
    });

    const NUM_NODOS = 25;
    const RADIO_ESFERA = 8;
    const ALTURA_MINIMA = -3;
    const nodos = [];
    const impulsos = [];

    const colores = [
        '#ff66aa', '#bb55ff', '#55bbff',
        '#ffaa44', '#55ffcc', '#ff55ff',
    ];

    // ========== NODOS ==========
    for (let i = 0; i < NUM_NODOS; i++) {
        const color = colores[i % colores.length];

        const entidad = document.createElement('a-entity');
        entidad.setAttribute('id', `nodo-${i}`);

        const phi = Math.acos(1 - (i + 0.5) / NUM_NODOS);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = RADIO_ESFERA * (0.5 + Math.random() * 0.5);

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = Math.max(ALTURA_MINIMA, r * Math.cos(phi) + 1.2);
        const z = r * Math.sin(phi) * Math.sin(theta);

        entidad.setAttribute('position', `${x} ${y} ${z}`);
        entornoPrincipalEscena.appendChild(entidad);

        const nucleo = document.createElement('a-sphere');
        nucleo.setAttribute('radius', 0.07);
        nucleo.setAttribute('color', color);
        nucleo.setAttribute('material', `
            emissive: ${color};
            emissiveIntensity: 1.8;
            shader: flat;
        `);
        entidad.appendChild(nucleo);

        const orbitas = [];
        const numOrbitas = 4;

        for (let j = 0; j < numOrbitas; j++) {
            const particula = document.createElement('a-sphere');
            particula.setAttribute('radius', 0.025);
            particula.setAttribute('color', color);
            particula.setAttribute('material', `
                emissive: ${color};
                emissiveIntensity: 1.0;
            `);

            const orbita = {
                elemento: particula,
                radio: 0.25 + Math.random() * 0.5,
                velocidad: 0.4 + Math.random() * 1.2,
                fase: Math.random() * Math.PI * 2,
                inclinacion: (Math.random() - 0.5) * Math.PI,
            };

            entidad.appendChild(particula);
            orbitas.push(orbita);
        }

        nodos.push({
            entidad: entidad,
            nucleo: nucleo,
            orbitas: orbitas,
            posicion: { x, y, z },
            color: color,
            frecuenciaSonido: 300 + Math.random() * 1200,
        });
    }

    // ========== CONEXIONES ==========
    const pares = [];
    nodos.forEach((nodoA, i) => {
        nodos.forEach((nodoB, j) => {
            if (i >= j) return;
            const dx = nodoA.posicion.x - nodoB.posicion.x;
            const dy = nodoA.posicion.y - nodoB.posicion.y;
            const dz = nodoA.posicion.z - nodoB.posicion.z;
            const distancia = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (distancia < 5) {
                pares.push({ nodoA, nodoB, distancia });
            }
        });
    });

    // ========== IMPULSOS CON ESTELA ==========
    pares.forEach((par) => {
        const numImpulsos = 1 + Math.floor(Math.random() * 1.5);

        for (let k = 0; k < numImpulsos; k++) {
            const impulso = document.createElement('a-sphere');
            impulso.setAttribute('radius', 0.06);
            impulso.setAttribute('color', par.nodoA.color);
            impulso.setAttribute('material', `
                emissive: ${par.nodoA.color};
                emissiveIntensity: 2.5;
            `);
            entornoPrincipalEscena.appendChild(impulso);

            const estela = [];
            for (let e = 0; e < 2; e++) {
                const trazo = document.createElement('a-sphere');
                const escala = 0.045 - (e * 0.018);
                trazo.setAttribute('radius', escala);
                trazo.setAttribute('color', par.nodoA.color);
                trazo.setAttribute('material', `
                    emissive: ${par.nodoA.color};
                    emissiveIntensity: ${1.4 - e * 0.5};
                    transparent: true;
                    opacity: ${0.85 - e * 0.3};
                `);
                entornoPrincipalEscena.appendChild(trazo);
                estela.push({ elemento: trazo, offset: (e + 1) * 0.1 });
            }

            impulsos.push({
                elemento: impulso,
                estela: estela,
                nodoA: par.nodoA,
                nodoB: par.nodoB,
                progreso: Math.random(),
                velocidad: 0.003 + Math.random() * 0.01,
                direccion: Math.random() > 0.5 ? 1 : -1,
                sonoAlLlegar: false,
            });
        }
    });

    // ========== POLVO NEURONAL FLOTANTE ==========
    const particulasFlotantes = [];
    for (let i = 0; i < 60; i++) {
        const p = document.createElement('a-sphere');
        const color = colores[Math.floor(Math.random() * colores.length)];
        const radio = 0.03 + Math.random() * 0.04;

        p.setAttribute('radius', radio);
        p.setAttribute('color', color);
        p.setAttribute('material', `
            emissive: ${color};
            emissiveIntensity: 0.7;
            transparent: true;
            opacity: 0.8;
        `);

        const phi2 = Math.acos(2 * Math.random() - 1);
        const theta2 = Math.random() * Math.PI * 2;
        const r2 = 3 + Math.random() * 9;

        const px = r2 * Math.sin(phi2) * Math.cos(theta2);
        const py = Math.max(-1, r2 * Math.cos(phi2) + 1.5);
        const pz = r2 * Math.sin(phi2) * Math.sin(theta2);

        p.setAttribute('position', `${px} ${py} ${pz}`);
        entornoPrincipalEscena.appendChild(p);

        particulasFlotantes.push({
            elemento: p,
            baseX: px,
            baseY: py,
            baseZ: pz,
            velocidad: 0.1 + Math.random() * 0.5,
            amplitud: 0.3 + Math.random() * 1.0,
            fase: Math.random() * Math.PI * 2,
        });
    }

    // ========== ONDAS EEG ==========
    const ondasEEG = [];
    const MAX_ONDAS = 8;
    const posicionCerebro = { x: 0, y: 0, z: 0 };

    function crearOnda() {
        if (ondasEEG.length >= MAX_ONDAS) {
            const vieja = ondasEEG.shift();
            if (vieja && vieja.elemento) {
                vieja.elemento.parentNode.removeChild(vieja.elemento);
            }
        }

        const color = colores[Math.floor(Math.random() * colores.length)];

        const anillo = document.createElement('a-ring');
        anillo.setAttribute('radius-inner', 0.05);
        anillo.setAttribute('radius-outer', 0.08);
        anillo.setAttribute('color', color);
        anillo.setAttribute('material', `
            emissive: ${color};
            emissiveIntensity: 1.5;
            transparent: true;
            opacity: 0.9;
            side: double;
        `);
        anillo.setAttribute('position', `${posicionCerebro.x} ${posicionCerebro.y} ${posicionCerebro.z}`);
        anillo.setAttribute('rotation', `${Math.random() * 360} ${Math.random() * 360} 0`);
        mundoFlotante.appendChild(anillo);

        sonidoOnda();

        ondasEEG.push({
            elemento: anillo,
            color: color,
            radio: 0.08,
            velocidad: 0.008 + Math.random() * 0.02,
            rotacionX: (Math.random() - 0.5) * 0.5,
            rotacionY: (Math.random() - 0.5) * 0.5,
            opacidad: 0.9,
        });
    }

    crearOnda();
    let tiempoUltimaOnda = 0;

    // ========== INTERACTIVIDAD DE PANELES ==========
    const paneles = document.querySelectorAll('.panel-info');

    paneles.forEach(panel => {
        panel.addEventListener('mouseenter', function () {
            panel.setAttribute('scale', '1.1 1.1 1.1');
            const bordes = panel.querySelectorAll('a-plane');
            bordes.forEach(b => {
                const mat = b.getAttribute('material');
                if (mat && mat.emissiveIntensity) {
                    b.setAttribute('material', 'emissiveIntensity', '3');
                }
            });
        });

        panel.addEventListener('mouseleave', function () {
            panel.setAttribute('scale', '1 1 1');
            const bordes = panel.querySelectorAll('a-plane');
            bordes.forEach(b => {
                const mat = b.getAttribute('material');
                if (mat && mat.emissiveIntensity) {
                    b.setAttribute('material', 'emissiveIntensity', '1.5');
                }
            });
        });

        panel.addEventListener('click', function () {
            console.log('Panel clickeado:', panel.querySelector('a-text').getAttribute('value'));
            panel.setAttribute('scale', '1.2 1.2 1.2');
            setTimeout(() => {
                panel.setAttribute('scale', '1 1 1');
            }, 200);
        });
    });

    // ========== PLAYLIST DE VIDEOS ==========
    const videos = [
        {
            src: 'https://snnu.smiteandoelblue.workers.dev/unity/crimson',
            titulo: 'VIDEO: Crimson Memories'
        },
        {
            src: 'https://snnu.smiteandoelblue.workers.dev/unity/cereal',
            titulo: 'VIDEO: CEREAL'
        }
    ];

    let videoActual = 0;
    const videoElement = document.querySelector('#video-asset');
    const videoTitulo = document.querySelector('#pantalla-video a-text');

    function cambiarVideo() {
        videoActual = (videoActual + 1) % videos.length;
        videoElement.src = videos[videoActual].src;
        if (videoTitulo) {
            videoTitulo.setAttribute('value', videos[videoActual].titulo);
        }
        videoElement.play().catch(e => console.log('Error reproduciendo video:', e));
    }

    if (videoElement) {
        videoElement.addEventListener('ended', function () {
            cambiarVideo();
        });
    }

    // ========== EXPERIENCIA 360 ==========
    const botonRojo360 = document.querySelector('#boton-rojo-360');
    const entornoPrincipal = document.querySelector('#entorno-principal');
    const entorno360 = document.querySelector('#entorno-360');
    const video360 = document.querySelector('#video-360-asset');
    const rig = document.querySelector('#rig');

    if (botonRojo360 && entornoPrincipal && entorno360 && video360 && rig) {
        botonRojo360.addEventListener('click', () => {
            // Sentarse en la silla (bajar altura a 1.2)
            rig.setAttribute('position', '0 1.2 35');

            // Ocultar entorno principal y mostrar 360/Unity
            entornoPrincipal.setAttribute('visible', 'false');
            entorno360.setAttribute('visible', 'true');
            enModo360 = true;

            // Pausar video normal
            const vidMain = document.querySelector('#video-asset');
            if (vidMain) vidMain.pause();

            if (video360) {
                video360.muted = false;
                video360.play().catch(e => console.log('Error reproduciendo 360:', e));
            }
        });

        function salir360() {
            if (!enModo360) return;
            enModo360 = false;
            
            // Levantarse frente a la silla (altura 1.6, z=34)
            rig.setAttribute('position', '0 1.6 34');

            // Volver a mostrar entorno principal
            entornoPrincipal.setAttribute('visible', 'true');
            entorno360.setAttribute('visible', 'false');

            if (video360) {
                video360.pause();
            }

            // Reanudar video normal
            const vidMain = document.querySelector('#video-asset');
            if (vidMain) vidMain.play().catch(e => console.log('Error reanudando video:', e));
        }

        const btnExit360 = document.querySelector('#btn-exit-360');
        if (btnExit360) {
            btnExit360.addEventListener('click', salir360);
        }

        // Detectar gatillo en los mandos para salir
        const rightController = document.querySelector('[laser-controls="hand: right"]');
        const leftController = document.querySelector('[laser-controls="hand: left"]');
        if (rightController) rightController.addEventListener('triggerdown', salir360);
        if (leftController) leftController.addEventListener('triggerdown', salir360);
        
        // También permitir salir con la tecla ESCAPE en teclado (soporte para computadora sin VR)
        window.addEventListener('keydown', (e) => {
            if (enModo360 && (e.key === 'Escape' || e.key === 'Enter')) {
                salir360();
            }
        });
    }

    // ========== ANIMACIÓN ==========
    let tiempo = 0;

    AFRAME.registerComponent('neuro-tick', {
        tick: function (t, delta) {
            tiempo += delta / 1000;

            if (tiempo - tiempoUltimaOnda > 2 + Math.random() * 1.5) {
                crearOnda();
                tiempoUltimaOnda = tiempo;
            }

            nodos.forEach(nodo => {
                const pulso = 1 + Math.sin(tiempo * 3 + nodo.posicion.x) * 0.35;
                nodo.nucleo.setAttribute('radius', 0.07 * pulso);

                if (nodo.orbitas) {
                    nodo.orbitas.forEach(orbita => {
                        const angulo = tiempo * orbita.velocidad + orbita.fase;
                        const ox = Math.cos(angulo) * orbita.radio;
                        const oz = Math.sin(angulo) * orbita.radio;
                        const oy = Math.sin(angulo * 1.3) * orbita.radio * Math.sin(orbita.inclinacion);
                        orbita.elemento.setAttribute('position', `${ox} ${oy} ${oz}`);
                    });
                }
            });

            impulsos.forEach(impulso => {
                impulso.progreso += impulso.velocidad * impulso.direccion;
                if (impulso.progreso >= 1 || impulso.progreso <= 0) {
                    impulso.direccion *= -1;
                    impulso.progreso = Math.max(0, Math.min(1, impulso.progreso));

                    const nodoLlegada = impulso.direccion === 1 ? impulso.nodoB : impulso.nodoA;
                    if (nodoLlegada && audioCtx && Math.random() < 0.15) {
                        sonidoImpulso(nodoLlegada.frecuenciaSonido * 0.5);
                    }
                }

                const A = impulso.nodoA.posicion;
                const B = impulso.nodoB.posicion;
                const t2 = impulso.progreso;

                const x = A.x + (B.x - A.x) * t2;
                const y = A.y + (B.y - A.y) * t2;
                const z = A.z + (B.z - A.z) * t2;
                impulso.elemento.setAttribute('position', `${x} ${y} ${z}`);

                const brillo = 1 - Math.abs(t2 - 0.5) * 2;
                impulso.elemento.setAttribute('radius', 0.04 + brillo * 0.05);

                const dirX = B.x - A.x;
                const dirY = B.y - A.y;
                const dirZ = B.z - A.z;
                const distTotal = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);

                if (distTotal > 0.001) {
                    const dnx = dirX / distTotal;
                    const dny = dirY / distTotal;
                    const dnz = dirZ / distTotal;

                    impulso.estela.forEach(trazo => {
                        const tx = x - dnx * trazo.offset * impulso.direccion;
                        const ty = y - dny * trazo.offset * impulso.direccion;
                        const tz = z - dnz * trazo.offset * impulso.direccion;
                        trazo.elemento.setAttribute('position', `${tx} ${ty} ${tz}`);
                    });
                }
            });

            particulasFlotantes.forEach(p => {
                const offsetY = Math.sin(tiempo * p.velocidad + p.fase) * p.amplitud;
                const offsetX = Math.cos(tiempo * p.velocidad * 0.7 + p.fase) * p.amplitud * 0.5;
                const offsetZ = Math.sin(tiempo * p.velocidad * 0.6 + p.fase + 1) * p.amplitud * 0.5;
                p.elemento.setAttribute('position', {
                    x: p.baseX + offsetX,
                    y: p.baseY + offsetY,
                    z: p.baseZ + offsetZ
                });
            });

            const panel = document.querySelector('#panel-bienvenida');
            if (panel) {
                const flotar = Math.sin(tiempo * 0.5) * 0.08;
                const posActual = panel.getAttribute('position');
                panel.setAttribute('position', {
                    x: posActual.x,
                    y: 2.8 + flotar,
                    z: posActual.z
                });
            }

            const cerebroMedio = document.querySelector('#cerebro-medio');
            const cerebroChico = document.querySelector('#cerebro-chico');
            if (cerebroMedio) {
                cerebroMedio.setAttribute('rotation', {
                    x: tiempo * 15,
                    y: tiempo * 25,
                    z: tiempo * 5
                });
            }
            if (cerebroChico) {
                cerebroChico.setAttribute('rotation', {
                    x: tiempo * -20,
                    y: tiempo * -15,
                    z: tiempo * 10
                });
            }

            for (let i = ondasEEG.length - 1; i >= 0; i--) {
                const onda = ondasEEG[i];
                onda.radio += onda.velocidad;
                onda.opacidad -= 0.003;

                if (onda.opacidad <= 0 || onda.radio > 10) {
                    if (onda.elemento && onda.elemento.parentNode) {
                        onda.elemento.parentNode.removeChild(onda.elemento);
                    }
                    ondasEEG.splice(i, 1);
                } else {
                    onda.elemento.setAttribute('radius-inner', onda.radio - 0.04);
                    onda.elemento.setAttribute('radius-outer', onda.radio);
                    onda.elemento.setAttribute('material', `
                        emissive: ${onda.color};
                        emissiveIntensity: ${onda.opacidad * 1.5};
                        transparent: true;
                        opacity: ${onda.opacidad};
                        side: double;
                    `);
                    const rotActual = onda.elemento.getAttribute('rotation');
                    onda.elemento.setAttribute('rotation', {
                        x: rotActual.x + onda.rotacionX,
                        y: rotActual.y + onda.rotacionY,
                        z: rotActual.z
                    });
                }
            }
        }
    });

    const ticker = document.createElement('a-entity');
    ticker.setAttribute('neuro-tick', '');
    scene.appendChild(ticker);

    // ========== ROTACIÓN DE FOTOS DEL EQUIPO ==========
    const teamPhotos = document.querySelectorAll('.team-photo');
    if (teamPhotos.length > 0) {
        let currentImgIndex = 0;
        setInterval(() => {
            teamPhotos[currentImgIndex].setAttribute('visible', 'false');
            currentImgIndex = (currentImgIndex + 1) % teamPhotos.length;
            teamPhotos[currentImgIndex].setAttribute('visible', 'true');
        }, 1000); // Cambia cada 1 segundo (1000 ms) sin retrasos de carga
    }

    console.log(`Nivel 5: Paneles interactivos activos`);
});

// ========== COMPONENTES DE MOVIMIENTO CUSTOM ==========
AFRAME.registerComponent('thumbstick-movement', {
    schema: { speed: { default: 0.1 } },
    init: function () {
        this.rig = document.querySelector('#rig');
        this.camera = document.querySelector('a-camera');
        this.moveX = 0;
        this.moveY = 0;
        this.el.addEventListener('thumbstickmoved', (evt) => {
            this.moveX = evt.detail.x;
            this.moveY = evt.detail.y;
        });
    },
    tick: function () {
        if (!this.rig || !this.camera) return;
        if (Math.abs(this.moveX) < 0.1 && Math.abs(this.moveY) < 0.1) return;
        const camRot = this.camera.getAttribute('rotation');
        const rigRot = this.rig.getAttribute('rotation');
        const angle = THREE.MathUtils.degToRad(camRot.y + rigRot.y);
        const dx = (this.moveX * Math.cos(angle) + this.moveY * Math.sin(angle)) * this.data.speed;
        const dz = (this.moveY * Math.cos(angle) - this.moveX * Math.sin(angle)) * this.data.speed;
        const pos = this.rig.getAttribute('position');
        this.rig.setAttribute('position', { x: pos.x + dx, y: pos.y, z: pos.z + dz });
    }
});

AFRAME.registerComponent('thumbstick-turn', {
    schema: { angle: { default: 45 } },
    init: function () {
        this.rig = document.querySelector('#rig');
        this.turned = false;
        this.el.addEventListener('thumbstickmoved', (evt) => {
            if (evt.detail.x > 0.5 && !this.turned) {
                this.turn(-this.data.angle);
                this.turned = true;
            } else if (evt.detail.x < -0.5 && !this.turned) {
                this.turn(this.data.angle);
                this.turned = true;
            } else if (Math.abs(evt.detail.x) < 0.3) {
                this.turned = false;
            }
        });
    },
    turn: function (angle) {
        if (!this.rig) return;
        const rot = this.rig.getAttribute('rotation');
        this.rig.setAttribute('rotation', { x: rot.x, y: rot.y + angle, z: rot.z });
    }
});


// ========== INTERACCION PAPERS ==========
document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    function initPapers() {
        const pdfWindow = document.querySelector('#pdf-window');
        const pdfViewerPlane = document.querySelector('#pdf-viewer-plane');
        const closeBtn = document.querySelector('#close-pdf');
        const canvas = document.querySelector('#pdf-canvas');
        const ctx = canvas ? canvas.getContext('2d') : null;

        let pdfDoc = null;
        let pageNum = 1;
        let isRendering = false;

        const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
        if (pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }

        const papersData = {
            'paper-1': 'gi2020-31.pdf',
            'paper-2': 'gi2020-31.pdf',
            'paper-3': 'gi2020-31.pdf'
        };

        function renderPage(num) {
            if (!pdfDoc || !ctx) return;
            isRendering = true;
            pdfDoc.getPage(num).then(page => {
                const viewport = page.getViewport({ scale: 2.0 });
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const renderCtx = { canvasContext: ctx, viewport: viewport };
                page.render(renderCtx).promise.then(() => {
                    isRendering = false;
                    // Asegurar que el canvas sirva de textura a A-Frame
                    const material = pdfViewerPlane.getObject3D('mesh').material;
                    if (material && material.map) {
                        material.map.needsUpdate = true;
                    } else if (material) {
                        // Si la textura aun no esta mapeada, asignarla
                        const texture = new THREE.CanvasTexture(canvas);
                        texture.minFilter = THREE.LinearFilter;
                        material.map = texture;
                        material.needsUpdate = true;
                    }
                });
            });
        }

        document.querySelectorAll('.paper-item').forEach(paper => {
            paper.addEventListener('click', function () {
                const id = this.getAttribute('id');
                const pdfFile = papersData[id];
                if (pdfFile && pdfWindow) {
                    pdfWindow.setAttribute('visible', 'true');
                    if (pdfjsLib) {
                        pdfjsLib.getDocument(pdfFile).promise.then(pdf => {
                            pdfDoc = pdf;
                            pageNum = 1;
                            renderPage(pageNum);
                        }).catch(err => console.error("Error cargando PDF:", err));
                    }
                }
            });
        });

        if (closeBtn && pdfWindow) {
            closeBtn.addEventListener('click', (evt) => {
                evt.stopPropagation();
                pdfWindow.setAttribute('visible', 'false');
                pdfDoc = null;
            });
        }

        const btnPrev = document.querySelector('#btn-prev-page');
        const btnNext = document.querySelector('#btn-next-page');

        if (btnPrev) {
            btnPrev.addEventListener('click', (evt) => {
                evt.stopPropagation();
                if (!pdfDoc || isRendering) return;
                if (pageNum > 1) {
                    pageNum--;
                    renderPage(pageNum);
                }
            });
        }

        if (btnNext) {
            btnNext.addEventListener('click', (evt) => {
                evt.stopPropagation();
                if (!pdfDoc || isRendering) return;
                if (pageNum < pdfDoc.numPages) {
                    pageNum++;
                    renderPage(pageNum);
                }
            });
        }

        // ========== SELECCIÓN CON GATILLO (Meta Quest) ==========
        function handleTrigger() {
            const raycasterComp = this.components.raycaster;
            if (raycasterComp && raycasterComp.intersectedEls && raycasterComp.intersectedEls.length > 0) {
                raycasterComp.intersectedEls[0].emit('click');
            }
        }
        
        const rightController = document.querySelector('[laser-controls="hand: right"]');
        const leftController = document.querySelector('[laser-controls="hand: left"]');
        if (rightController) rightController.addEventListener('triggerdown', handleTrigger);
        if (leftController) leftController.addEventListener('triggerdown', handleTrigger);
    }

    if (scene.hasLoaded) {
        initPapers();
    } else {
        scene.addEventListener('loaded', initPapers);
    }
});