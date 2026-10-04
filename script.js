/* Debraj Ghosh - Portfolio: scroll-driven solar system (Three.js r128) + business UI */
(() => {
  'use strict';

  const WHATSAPP_NUMBER = '919339567429';
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;
  const isSmall = innerWidth < 800;
  root.classList.add('js-ready');
  const $ = (id) => document.getElementById(id);
  const wa = (text) => 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  if ($('year')) $('year').textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('menu-btn'), navLinks = $('nav-links');
  const setMenu = (o) => {
    menuBtn.classList.toggle('open', o);
    navLinks.classList.toggle('open', o);
    menuBtn.setAttribute('aria-expanded', String(o));
    menuBtn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav')) setMenu(false); });
  addEventListener('resize', () => { if (innerWidth > 800) setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else revealEls.forEach((el) => el.classList.add('visible'));

  /* ---------- Scroll progress ---------- */
  const bar = $('progress');
  let ticking = false;
  const paintProgress = () => {
    ticking = false;
    const max = root.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(scrollY / max, 1) : 0).toFixed(4) + ')';
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paintProgress); } }, { passive: true });
  paintProgress();

  /* ---------- Card tilt + custom cursor (mouse devices only) ---------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 6).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-3px)';
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    const cur = document.createElement('div');
    cur.className = 'cursor';
    cur.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cur);
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      cur.classList.add('on');
      cur.classList.toggle('big', !!e.target.closest('a,button,summary,select,input,textarea,.tilt'));
    }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('on'));
    (function move() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
      requestAnimationFrame(move);
    })();
  }

  /* ---------- Service buttons preselect the form ---------- */
  document.querySelectorAll('.pick').forEach((b) => b.addEventListener('click', () => {
    const sel = $('service');
    if (sel) sel.value = b.dataset.service;
  }));

  /* ---------- Project modal ---------- */
  const modal = $('modal');
  let lastFocus = null;
  const openModal = (card) => {
    const d = card.dataset;
    lastFocus = card;
    $('m-prev').innerHTML = '';
    $('m-prev').appendChild(card.querySelector('.mock').cloneNode(true));
    $('m-type').textContent = d.type;
    $('m-title').textContent = d.title;
    $('m-goal').textContent = d.goal;
    $('m-sol').textContent = d.solution;
    $('m-tech').textContent = d.tech;
    $('m-status').textContent = d.status;
    $('m-feat').innerHTML = '';
    d.features.split(',').forEach((f) => { const li = document.createElement('li'); li.textContent = f; $('m-feat').appendChild(li); });
    modal.hidden = false;
    document.body.classList.add('lock');
    requestAnimationFrame(() => modal.classList.add('open'));
    $('modal-x').focus();
  };
  const closeModal = () => {
    modal.classList.remove('open');
    document.body.classList.remove('lock');
    setTimeout(() => { modal.hidden = true; }, reduceMotion ? 0 : 250);
    if (lastFocus) lastFocus.focus();
  };
  document.querySelectorAll('.project').forEach((c) => c.addEventListener('click', () => openModal(c)));
  $('modal-x').addEventListener('click', closeModal);
  $('m-cta').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!modal.hidden) closeModal(); setMenu(false); }
    if (e.key === 'Tab' && !modal.hidden) {
      const f = [...modal.querySelectorAll('a,button')].filter((n) => n.offsetParent !== null);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Contact form -> WhatsApp ---------- */
  const form = $('contact-form'), note = $('form-note');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form), v = (k) => String(d.get(k) || '').trim();
    if (!v('name')) { note.textContent = 'Please enter your name.'; $('name').focus(); return; }
    const lines = ['Hi Debraj,', '', 'My name is ' + v('name') + '.'];
    if (v('business')) lines.push('Business: ' + v('business'));
    lines.push("I'm interested in: " + v('service'), 'Budget: ' + v('budget'), 'Timeline: ' + v('timeline'));
    if (v('message')) lines.push('', 'Project details:', v('message'));
    const url = wa(lines.join('\n'));
    if (!window.open(url, '_blank', 'noopener')) location.href = url;
    note.textContent = 'Opening WhatsApp with your message...';
  });

  /* ==========================================================
     Solar system: shader planets, one per section, camera flies between
     ========================================================== */
  const sections = [...document.querySelectorAll('[data-planet]')];
  const PCOL = ['#ffb347', '#4aa8ff', '#e0623a', '#d9a56f', '#e3cc99', '#8fe3ea', '#4a74f0'];
  const hudName = $('hud-name'), hudFact = $('hud-fact'), rail = $('hud-rail');
  const dots = sections.map((s) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Go to ' + s.dataset.planet);
    b.title = s.dataset.planet;
    b.addEventListener('click', () => s.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }));
    rail.appendChild(b);
    return b;
  });
  let activeIdx = -1;
  const setActive = (i) => {
    if (i === activeIdx) return;
    activeIdx = i;
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
    hudName.textContent = sections[i].dataset.planet;
    hudFact.textContent = sections[i].dataset.fact;
    $('hud-n').textContent = String(i + 1).padStart(2, '0') + ' / ' + String(sections.length).padStart(2, '0');
    $('hud-dot').style.setProperty('--pc', PCOL[i]);
    $('hud-fill').style.transform = 'scaleX(' + ((i + 1) / sections.length).toFixed(3) + ')';
    document.querySelectorAll('.nav-links a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + sections[i].id));
  };
  setActive(0);

  /* Intro overlay */
  const intro = document.createElement('div');
  intro.id = 'intro';
  intro.innerHTML = '<b>Debraj<span>.</span></b><i></i><small>Preparing launch</small>';
  document.body.appendChild(intro);
  let launched = false;
  const launch = () => {
    if (launched) return;
    launched = true;
    document.body.classList.add('go');
    intro.classList.add('out');
    setTimeout(() => intro.remove(), 1200);
  };
  setTimeout(launch, 4500); // failsafe

  const NOISE = `
    float hash(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
    float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
      return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
    float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+1.7;a*=.5;}return v;}
  `;
  const VERT = `
    uniform vec3 uLight;
    varying vec2 vUv;
    varying vec3 vObj, vWN, vWP, vVN, vLo;
    void main(){
      vObj = position; vUv = uv;
      vec3 c0 = modelMatrix[0].xyz, c1 = modelMatrix[1].xyz, c2 = modelMatrix[2].xyz;
      vLo = vec3(dot(uLight, c0), dot(uLight, c1), dot(uLight, c2)) / dot(c0, c0);
      vWN = normalize(mat3(modelMatrix) * normal);
      vVN = normalize(normalMatrix * normal);
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWP = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`;
  const PLANET_FRAG = NOISE + `
    uniform float uKind, uBand, uScale, uTime, uSpot;
    uniform vec3 uC1, uC2, uC3, uAtmo, uLight, uSpotCol;
    varying vec3 vObj, vWN, vWP, vVN, vLo;
    void main(){
      vec3 p = normalize(vObj), N = normalize(vWN), V = normalize(cameraPosition - vWP);
      float d = dot(N, uLight);
      vec3 col; float land = 0., shade = 1.;
      if (uKind < 0.5) {                       // rocky: craters + relief shading
        float n = fbm(p * uScale);
        col = mix(uC1, uC2, n);
        col = mix(col, uC3, smoothstep(.5, .8, fbm(p * uScale * 2.3 + 4.)));
        vec3 g = p * uScale * 5., id = floor(g), f = fract(g) - .5;
        if (hash(id) > .6) {
          float rr = length(f - (vec3(hash(id + 1.), hash(id + 2.), hash(id + 3.)) - .5) * .4);
          col *= 1. - .3 * smoothstep(.2, .15, rr) + .2 * smoothstep(.15, .2, rr) * smoothstep(.27, .2, rr);
        }
        col = mix(col, vec3(.95), smoothstep(.86, .95, abs(p.y)));
        float h0 = fbm(p * uScale * 2.), h1 = fbm(normalize(p + vLo * .03) * uScale * 2.);
        shade = clamp(1. + (h0 - h1) * 22., .35, 1.7);
      } else if (uKind < 1.5) {                // Earth
        float h = fbm(p * 2.6);
        land = smoothstep(.5, .54, h);
        vec3 ocean = mix(uC1 * .6, uC1 * 1.6, smoothstep(.2, .5, h));
        vec3 ground = mix(uC2, uC3, fbm(p * 7.));
        col = mix(ocean, ground, land);
        col = mix(col, vec3(.93, .96, 1.), smoothstep(.82, .92, abs(p.y) + h * .08));
        float cl = smoothstep(.5, .78, fbm(p * 4.5 + vec3(uTime * .012, 0., 0.)));
        col = mix(col, vec3(1.), cl * .85);
        land *= (1. - cl);
      } else {                                 // gas giant: fine bands, swirls, big storm
        vec3 q = vec3(fbm(p * 3.), fbm(p * 3. + 4.), 0.);
        float w = fbm(vec3(p.x * 2. + q.x * 2., p.y * 7., p.z * 2. + q.y * 2.)) * 1.8;
        float v = sin(p.y * uBand + w * 5.) * .5 + .5;
        v = v * .7 + (sin(p.y * uBand * 2.3 + w * 8.) * .5 + .5) * .3;
        col = mix(uC1, uC2, v);
        col = mix(col, uC3, fbm(p * vec3(3., 16., 3.)) * .55);
        vec2 sp = vec2((atan(p.z, p.x) - .6) * sqrt(max(1. - p.y * p.y, .01)), (p.y + .3) * 2.4);
        col = mix(col, uSpotCol, smoothstep(.36, .1, length(sp)) * uSpot * .85);
      }
      float lit = smoothstep(-.12, .55, d);
      vec3 outc = col * shade * (.05 + lit * 1.25);
      float rim = pow(1. - max(dot(N, V), 0.), 3.);
      outc += uAtmo * rim * (.12 + max(d + .15, 0.) * 1.0);
      if (uKind > .5 && uKind < 1.5) {
        float night = smoothstep(.08, -.25, d);
        outc += vec3(1., .75, .35) * step(.74, noise(p * 70.)) * land * night * 1.4;
      }
      gl_FragColor = vec4(outc, 1.);
    }`;
  const ATMO_FRAG = `
    uniform vec3 uColor, uLight;
    varying vec3 vVN, vWN;
    void main(){
      float i = pow(max(.66 - dot(vVN, vec3(0., 0., 1.)), 0.), 4.);
      float sunSide = .08 + 1.1 * smoothstep(-.35, .65, dot(normalize(vWN), uLight));
      gl_FragColor = vec4(uColor, 1.) * min(i * 3.4 * sunSide, 2.1);
    }`;
  const SUN_FRAG = NOISE + `
    uniform float uTime;
    varying vec3 vObj, vVN;
    void main(){
      vec3 p = normalize(vObj);
      float t = uTime * .03;
      vec3 q = vec3(fbm(p * 2. + t), fbm(p * 2. + 4. + t), fbm(p * 2. + 8.));
      float gran = fbm(p * 14. + q * 2. - t * 3.);
      float cells = fbm(p * 32. + gran * 2.);
      float n = fbm(p * 3. + q * 1.5 + t);
      vec3 c = mix(vec3(.6, .13, .02), vec3(1., .5, .1), smoothstep(.25, .65, n + gran * .4));
      c = mix(c, vec3(1., .92, .6), smoothstep(.55, .9, gran * .7 + cells * .5));
      float spots = smoothstep(.62, .7, fbm(p * 4. + 7.)) * (1. - smoothstep(0., .5, abs(p.y) * 1.4));
      c *= 1. - spots * .75;
      float mu = max(dot(vVN, vec3(0., 0., 1.)), 0.);
      c *= .55 + .6 * pow(mu, .5);                                   // limb darkening
      c = mix(c, vec3(1., .4, .05), pow(1. - mu, 3.) * .5);
      gl_FragColor = vec4(c * 1.4, 1.);
    }`;
  const TEX_FRAG = `
    uniform sampler2D uMap, uNight, uClouds;
    uniform float uHasNight, uHasClouds, uCloudA, uTime;
    uniform vec3 uAtmo, uLight;
    varying vec2 vUv;
    varying vec3 vWN, vWP;
    void main(){
      vec3 N = normalize(vWN), V = normalize(cameraPosition - vWP);
      float d = dot(N, uLight);
      vec3 col = texture2D(uMap, vUv).rgb;
      float ocean = smoothstep(.0, .25, col.b - col.r * 1.3 - col.g * .3);
      float cl = 0.;
      if (uHasClouds > .5) {
        vec4 cs = texture2D(uClouds, vUv + vec2(uTime * .0025, 0.));
        cl = mix(cs.r, cs.a, uCloudA);
        col = mix(col, vec3(1.), cl * .92);
      }
      float lit = smoothstep(-.08, .45, d);
      vec3 o = col * (.05 + lit * 1.3);
      vec3 R = reflect(-uLight, N);
      o += vec3(1., .95, .85) * pow(max(dot(R, V), 0.), 60.) * ocean * (1. - cl) * lit * .9;
      float rim = pow(1. - max(dot(N, V), 0.), 3.);
      o += uAtmo * rim * (.05 + smoothstep(-.2, .6, d) * 1.7);
      o += uAtmo * smoothstep(.25, 0., abs(d)) * .35 * (.3 + rim);
      if (uHasNight > .5) o += texture2D(uNight, vUv).rgb * smoothstep(.12, -.2, d) * (1. - cl * .75) * 1.5;
      gl_FragColor = vec4(o, 1.);
    }`;
  const SUN_TEX_FRAG = `
    uniform sampler2D uMap; uniform float uTime;
    varying vec2 vUv; varying vec3 vVN;
    void main(){
      vec3 c = texture2D(uMap, vUv + vec2(uTime * .004, 0.)).rgb * 1.4;
      float fr = pow(1. - max(dot(vVN, vec3(0., 0., 1.)), 0.), 2.);
      c = mix(c, vec3(1., .55, .1), fr * .6);
      gl_FragColor = vec4(c, 1.);
    }`;
  const RING_FRAG = NOISE + `
    uniform sampler2D uMap; uniform float uIn, uOut, uHas;
    varying vec3 vObj;
    void main(){
      float r = length(vObj.xy);
      float t = (r - uIn) / (uOut - uIn);
      float edge = smoothstep(0., .04, t) * smoothstep(1., .94, t);
      if (uHas > .5) {
        vec4 s = texture2D(uMap, vec2(t, .5));
        gl_FragColor = vec4(s.rgb * 1.15, s.a * edge);
      } else {
        float gap = 1. - (1. - smoothstep(.0, .035, abs(t - .62))) * .85;
        float b = .35 + .65 * hash(vec3(floor(t * 90.), 1., 2.));
        gl_FragColor = vec4(mix(vec3(.72, .6, .4), vec3(.95, .88, .7), b), edge * gap * (.25 + .6 * b));
      }
    }`;
  /* Deep-space sky: painted once into a texture (cheap at runtime), then hue-shifted as you travel */
  const BAKE_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
  const BAKE_FRAG = NOISE + `
    varying vec2 vUv;
    float stars(vec3 p, float sc, float th){
      vec3 g = p * sc, id = floor(g), f = fract(g) - .5;
      vec3 o = vec3(hash(id + 1.3), hash(id + 2.7), hash(id + 4.1)) - .5;
      float h = hash(id);
      return smoothstep(.1, 0., length(f - o * .7)) * step(th, h) * (.35 + .65 * hash(id + 9.));
    }
    void main(){
      float lon = (vUv.x * 2. - 1.) * 3.14159265, lat = (vUv.y - .5) * 3.14159265;
      vec3 p = vec3(cos(lat) * cos(lon), sin(lat), cos(lat) * sin(lon));
      float lt = dot(p, normalize(vec3(.35, .8, .45)));
      float band = exp(-lt * lt * 14.);                                   // milky way band
      vec3 q = vec3(fbm(p * 2.), fbm(p * 2. + 5.2), fbm(p * 2. + 9.1));
      float a = fbm(p * 2.2 + q * 1.8);
      float r = pow(1. - abs(2. * fbm(p * 3.8 + q * 2.2 + 3.) - 1.), 3.); // thin glowing filaments
      float m = fbm(p * 2.8 + q * 2. + 11.);
      vec3 blue = vec3(.1, .12, .6), violet = vec3(.45, .18, .85), pink = vec3(.95, .25, .6), amber = vec3(.95, .5, .15);
      vec3 c = vec3(.004, .005, .016);
      c += blue * smoothstep(.34, .8, a) * 1.05;
      c += violet * smoothstep(.45, .85, m) * .9;
      c += pink * r * smoothstep(.42, .8, a) * 1.5;
      c += amber * pow(smoothstep(.62, .9, a * m * 2.), 2.) * .9;          // warm Orion-style core
      float dust = smoothstep(.45, .7, fbm(p * 7. + q));
      c += vec3(.72, .7, .9) * band * (.22 + .6 * fbm(p * 5. + 2.)) * (1. - dust * .8) * .75;
      float st = stars(p, 70., .82) + .9 * stars(p, 140., .86) + .8 * stars(p, 300., .9) + 1.2 * band * stars(p, 220., .7);
      vec3 tint = mix(vec3(.7, .8, 1.), vec3(1., .85, .7), hash(floor(p * 140.) + 3.));
      c += tint * st * 1.5;
      vec3 gc = normalize(vec3(-.6, .25, -.75)), gp = p - gc;             // distant spiral galaxy
      vec3 gx = normalize(cross(gc, vec3(0., 1., 0.))), gy = cross(gc, gx);
      vec2 e = vec2(dot(gp, gx) * .55, dot(gp, gy) * 2.3);
      c += vec3(1., .85, .7) * exp(-dot(e, e) * 700.) * (.7 + .5 * sin(atan(e.y, e.x) * 2. + length(e) * 70.)) * .9;
      gl_FragColor = vec4(c * .85, 1.);
    }`;
  const SKY_FRAG = `
    uniform sampler2D uMap; uniform float uT;
    varying vec2 vUv;
    void main(){
      vec3 c = texture2D(uMap, vUv).rgb;
      float A = sin(uT * .9) * .7, cs = cos(A), sn = sin(A);
      vec3 k = vec3(.57735);
      c = c * cs + cross(k, c) * sn + k * dot(k, c) * (1. - cs);          // slow colour drift along the journey
      gl_FragColor = vec4(c, 1.);
    }`;

  function initScene() {
    const canvas = $('scene');
    if (!canvas || typeof THREE === 'undefined') { launch(); return; }
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSmall, powerPreference: 'high-performance' });
    } catch (e) { launch(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isSmall ? 1.5 : 2));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.setClearColor(0x030208, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 700);
    scene.add(camera);
    camera.add(new THREE.AmbientLight(0x6670a0, 0.6));
    const key = new THREE.DirectionalLight(0xfff1dd, 1.4);
    key.position.set(-6, 4, 6);
    camera.add(key);

    const rnd = (a, b) => a + Math.random() * (b - a);
    const canvasTex = (w, h, fn) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      fn(c.getContext('2d'), w, h);
      return new THREE.CanvasTexture(c);
    };
    const U = (o) => THREE.UniformsUtils.clone(o);
    const time = { value: 0 };
    const V3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
    const LIGHT = new THREE.Vector3(0.85, 0.35, 0.12).normalize();
    const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat);
    blank.needsUpdate = true;
    const loader = new THREE.TextureLoader();
    const maxA = renderer.capabilities.getMaxAnisotropy();
    /* optional photo textures from ./textures/ ; missing files just keep the procedural look */
    loader.setCrossOrigin('anonymous');
    const load = (file, cb) => loader.load(/^https?:/.test(file) ? file : 'textures/' + file, (t) => { t.anisotropy = maxA; t.wrapS = THREE.RepeatWrapping; cb(t); }, undefined, () => {});

    /* nebula sky (follows the camera) */
    const SKY_W = isSmall ? 2048 : 4096;
    const skyRT = new THREE.WebGLRenderTarget(SKY_W, SKY_W / 2, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
    const bakeScene = new THREE.Scene();
    const bakeQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: BAKE_VERT, fragmentShader: BAKE_FRAG, depthTest: false }));
    bakeQuad.frustumCulled = false;
    bakeScene.add(bakeQuad);
    renderer.setRenderTarget(skyRT);
    renderer.render(bakeScene, new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
    renderer.setRenderTarget(null);
    const neb = new THREE.Mesh(
      new THREE.SphereGeometry(400, 64, 48),
      new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: SKY_FRAG, uniforms: { uMap: { value: skyRT.texture }, uT: { value: 0 } }, side: THREE.BackSide, depthWrite: false })
    );
    neb.rotation.z = Math.PI / 2; // keeps the stretched poles off to the sides
    scene.add(neb);

    const SPACING = 34, DIST = 17;
    const defs = [
      { sun: true, r: 8, spin: 0.03, map: '2k_sun.jpg' },
      { kind: 1, r: 4.4, spin: 0.18, c1: [.03, .16, .5], c2: [.1, .38, .13], c3: [.5, .42, .22], atmo: [.25, .55, 1], moon: true, map: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r152/examples/textures/planets/earth_atmos_2048.jpg', night: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r152/examples/textures/planets/earth_lights_2048.png', clouds: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r152/examples/textures/planets/earth_clouds_1024.png', cloudAlpha: true },
      { kind: 0, r: 3.4, spin: 0.16, c1: [.5, .17, .08], c2: [.82, .42, .24], c3: [.28, .09, .05], atmo: [1, .45, .25], scale: 2.4, map: '2k_mars.jpg' },
      { kind: 2, r: 6.4, spin: 0.3, c1: [.88, .72, .54], c2: [.52, .3, .18], c3: [.96, .9, .82], atmo: [.9, .65, .4], band: 13, spot: 1, spotCol: [.74, .3, .18], map: '2k_jupiter.jpg' },
      { kind: 2, r: 5.2, spin: 0.26, c1: [.92, .82, .57], c2: [.68, .55, .34], c3: [.98, .93, .8], atmo: [.9, .75, .45], band: 18, rings: true, map: '2k_saturn.jpg' },
      { kind: 2, r: 4.4, spin: 0.2, c1: [.62, .85, .88], c2: [.5, .75, .82], c3: [.82, .95, .95], atmo: [.5, .9, .95], band: 5, map: '2k_uranus.jpg' },
      { kind: 2, r: 4.8, spin: 0.22, c1: [.12, .28, .85], c2: [.08, .15, .55], c3: [.4, .65, 1], atmo: [.25, .45, 1], band: 8, spot: 1, spotCol: [.04, .08, .32], map: '2k_neptune.jpg' }
    ];

    const planets = defs.map((d, i) => {
      const g = new THREE.Group();
      let mat;
      if (d.sun) {
        mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: SUN_FRAG, uniforms: { uTime: time } });
      } else {
        mat = new THREE.ShaderMaterial({
          vertexShader: VERT, fragmentShader: PLANET_FRAG,
          uniforms: {
            uKind: { value: d.kind }, uBand: { value: d.band || 10 }, uScale: { value: d.scale || 3 }, uTime: time, uSpot: { value: d.spot || 0 }, uSpotCol: { value: V3(d.spotCol || [0, 0, 0]) },
            uC1: { value: V3(d.c1) }, uC2: { value: V3(d.c2) }, uC3: { value: V3(d.c3) },
            uAtmo: { value: V3(d.atmo) }, uLight: { value: LIGHT }
          }
        });
      }
      const body = new THREE.Mesh(new THREE.SphereGeometry(d.r, isSmall ? 48 : 96, isSmall ? 32 : 64), mat);
      g.add(body);
      if (d.map) load(d.map, (t) => {
        if (d.sun) {
          body.material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: SUN_TEX_FRAG, uniforms: { uMap: { value: t }, uTime: time } });
        } else {
          const um = { uMap: { value: t }, uNight: { value: blank }, uClouds: { value: blank }, uHasNight: { value: 0 }, uHasClouds: { value: 0 }, uCloudA: { value: d.cloudAlpha ? 1 : 0 }, uTime: time, uAtmo: { value: V3(d.atmo) }, uLight: { value: LIGHT } };
          body.material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: TEX_FRAG, uniforms: um });
          if (d.night) load(d.night, (n) => { um.uNight.value = n; um.uHasNight.value = 1; });
          if (d.clouds) load(d.clouds, (c) => { um.uClouds.value = c; um.uHasClouds.value = 1; });
        }
      });

      if (d.sun) {
        const glow = canvasTex(256, 256, (c, w, h) => {
          const r = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
          r.addColorStop(0, 'rgba(255,210,110,1)'); r.addColorStop(.2, 'rgba(255,130,30,.6)');
          r.addColorStop(.55, 'rgba(255,70,0,.15)'); r.addColorStop(1, 'rgba(255,40,0,0)');
          c.fillStyle = r; c.fillRect(0, 0, w, h);
        });
        const rays = canvasTex(256, 256, (c, w, h) => {
          c.translate(w / 2, h / 2);
          for (let k = 0; k < 28; k++) {
            c.rotate(Math.PI * 2 / 28);
            const gr = c.createLinearGradient(0, 0, 0, -w / 2);
            gr.addColorStop(0, 'rgba(255,200,110,.5)'); gr.addColorStop(1, 'rgba(255,120,30,0)');
            c.fillStyle = gr; c.fillRect(-1.5 - (k % 3), -w / 2 * (.5 + (k % 5) / 10), 3, w / 2);
          }
        });
        const mk = (t, s, o) => {
          const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: o }));
          sp.scale.setScalar(d.r * s); g.add(sp); return sp;
        };
        mk(glow, 6.5, 1);
        g.userData.rays = mk(rays, 9, .55);
      } else {
        g.add(new THREE.Mesh(
          new THREE.SphereGeometry(d.r * 1.18, 48, 32),
          new THREE.ShaderMaterial({
            vertexShader: VERT, fragmentShader: ATMO_FRAG, uniforms: { uColor: { value: V3(d.atmo) }, uLight: { value: LIGHT } },
            side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
          })
        ));
      }

      if (d.rings) {
        const rg = new THREE.Mesh(
          new THREE.RingGeometry(d.r * 1.35, d.r * 2.45, 160),
          new THREE.ShaderMaterial({
            vertexShader: VERT, fragmentShader: RING_FRAG, transparent: true, side: THREE.DoubleSide, depthWrite: false,
            uniforms: { uIn: { value: d.r * 1.35 }, uOut: { value: d.r * 2.45 }, uMap: { value: blank }, uHas: { value: 0 } }
          })
        );
        rg.rotation.x = Math.PI / 2;
        load('2k_saturn_ring_alpha.png', (t) => { rg.material.uniforms.uMap.value = t; rg.material.uniforms.uHas.value = 1; });
        g.add(rg);
        g.rotation.z = 0.42;
      }

      let moon = null;
      if (d.moon) {
        moon = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 24), new THREE.MeshStandardMaterial({ color: 0xb8b8c0, roughness: 1 }));
        g.add(moon);
        load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r152/examples/textures/planets/moon_1024.jpg', (t) => { moon.material.map = t; moon.material.needsUpdate = true; });
      }
      if (i > 0) {
        const orb = new THREE.Mesh(
          new THREE.RingGeometry(d.r * 2.7, d.r * 2.7 + 0.025, 160),
          new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
        );
        orb.rotation.x = Math.PI / 2.4;
        g.add(orb);
      }

      Object.assign(g.userData, { body, moon, spin: d.spin, r: d.r, orbit: d.r * 2 + 1.4, baseX: d.r * 0.85 + 4.2, homeX: d.r * 0.85 + 4.2 });
      g.position.set(d.r * 0.85 + 4.2, 0, -i * SPACING);
      scene.add(g);
      return g;
    });

    /* distant worlds you glide past between sections */
    const bgPlanets = [];
    [
      { at: 0.5, x: -25, y: 9, r: 3.4, kind: 2, c: [[.1, .55, .65], [.05, .25, .45], [.75, .95, 1]], atmo: [.3, .85, 1], band: 11, rings: true, tilt: .5 },
      { at: 1.5, x: 24, y: -8, r: 2.4, kind: 0, c: [[.7, .25, .08], [.95, .5, .2], [.35, .1, .05]], atmo: [1, .5, .2], scale: 2.6 },
      { at: 2.5, x: -23, y: -7, r: 4.2, kind: 2, c: [[.55, .15, .75], [.3, .08, .5], [.95, .7, 1]], atmo: [.75, .3, 1], band: 9 },
      { at: 3.5, x: 25, y: 9, r: 2.8, kind: 2, c: [[.9, .35, .5], [.6, .15, .3], [1, .85, .85]], atmo: [1, .4, .6], band: 14, rings: true, tilt: -.4 },
      { at: 4.5, x: -24, y: 7, r: 3, kind: 0, c: [[.55, .75, .95], [.85, .93, 1], [.3, .5, .8]], atmo: [.5, .8, 1], scale: 3 }
    ].forEach((d) => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(d.r, 64, 48), new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: PLANET_FRAG,
        uniforms: { uKind: { value: d.kind }, uBand: { value: d.band || 10 }, uScale: { value: d.scale || 3 }, uTime: time, uSpot: { value: d.spot || 0 }, uSpotCol: { value: V3(d.spotCol || [0, 0, 0]) }, uC1: { value: V3(d.c[0]) }, uC2: { value: V3(d.c[1]) }, uC3: { value: V3(d.c[2]) }, uAtmo: { value: V3(d.atmo) }, uLight: { value: LIGHT } }
      }));
      g.add(body);
      g.add(new THREE.Mesh(new THREE.SphereGeometry(d.r * 1.18, 32, 24), new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: ATMO_FRAG, uniforms: { uColor: { value: V3(d.atmo) }, uLight: { value: LIGHT } },
        side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
      })));
      if (d.rings) {
        const rg = new THREE.Mesh(new THREE.RingGeometry(d.r * 1.4, d.r * 2.3, 96), new THREE.ShaderMaterial({
          vertexShader: VERT, fragmentShader: RING_FRAG, transparent: true, side: THREE.DoubleSide, depthWrite: false,
          uniforms: { uIn: { value: d.r * 1.4 }, uOut: { value: d.r * 2.3 }, uMap: { value: blank }, uHas: { value: 0 } }
        }));
        rg.rotation.x = Math.PI / 2;
        g.add(rg);
      }
      g.rotation.z = d.tilt || 0;
      g.position.set(d.x, d.y, -d.at * SPACING);
      scene.add(g);
      bgPlanets.push(body);
    });

    /* stars */
    const span = (planets.length - 1) * SPACING;
    const stars = (n, size, z0, z1, sp, op) => {
      const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
      const pal = [0xffffff, 0xaed6ff, 0xffd9b0, 0xffa8d0].map((c) => new THREE.Color(c));
      for (let i = 0; i < n; i++) {
        pos.set([rnd(-sp, sp), rnd(-sp * .6, sp * .6), rnd(z0, z1)], i * 3);
        const c = pal[(Math.random() * 4) | 0]; col.set([c.r, c.g, c.b], i * 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const p = new THREE.Points(geo, new THREE.PointsMaterial({ size, vertexColors: true, transparent: true, opacity: op, depthWrite: false }));
      scene.add(p); return p;
    };
    const K = isSmall ? 1 : 2;
    stars(700 * K, 0.1, -span - 120, 30, 100, .9);
    stars(260 * K, 0.22, -span - 80, 30, 55, .95);
    stars(120 * K, 0.35, -span - 60, 30, 30, .8);

    /* asteroid belt between Mars and Jupiter */
    const AST = isSmall ? 500 : 1500, ap = new Float32Array(AST * 3);
    for (let i = 0; i < AST; i++) {
      const a = rnd(0, 6.283), rad = rnd(5, 11);
      ap.set([Math.cos(a) * rad * 1.6, rnd(-1.2, 1.2) + Math.sin(a) * rad * .25, -2.5 * SPACING + Math.sin(a) * rad * 2], i * 3);
    }
    const ag = new THREE.BufferGeometry();
    ag.setAttribute('position', new THREE.BufferAttribute(ap, 3));
    const belt = new THREE.Points(ag, new THREE.PointsMaterial({ color: 0xb59a86, size: 0.12, transparent: true, opacity: 0.85, depthWrite: false }));
    scene.add(belt);

    /* close dust: sweeps past the camera so you feel the travel */
    const DUST = isSmall ? 300 : 700, dp = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) dp.set([rnd(-14, 14), rnd(-8, 8), rnd(-span - 30, 20)], i * 3);
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    scene.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xcfe3ff, size: 0.12, transparent: true, opacity: 0.45, depthWrite: false })));

    /* layout, scroll, mouse */
    const layout = () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      const narrow = innerWidth < 800;
      planets.forEach((p) => {
        p.userData.baseX = narrow ? 0 : p.userData.homeX;
        p.userData.baseY = narrow ? 4.2 : 0;
        p.scale.setScalar(narrow ? 0.7 : 1);
      });
    };
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    if (!isTouch) {
      addEventListener('pointermove', (e) => {
        mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
        mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
      }, { passive: true });
    }
    let idx = 0, idxTarget = 0;
    const readScroll = () => {
      const y = scrollY + innerHeight * 0.45;
      let i = 0;
      sections.forEach((s, k) => { if (s.offsetTop <= y) i = k; });
      const top = sections[i].offsetTop;
      const next = sections[i + 1] ? sections[i + 1].offsetTop : top + sections[i].offsetHeight;
      const f = Math.min(Math.max((y - top) / Math.max(next - top, 1), 0), 1);
      idxTarget = i + f * f * f * (f * (f * 6 - 15) + 10);
      setActive(Math.round(idxTarget));
    };
    addEventListener('scroll', readScroll, { passive: true });
    let lastW = innerWidth;
    addEventListener('resize', () => {
      if (isTouch && innerWidth === lastW) return;
      lastW = innerWidth;
      renderer.setSize(innerWidth, innerHeight, false);
      layout(); readScroll();
    });
    layout(); readScroll(); idx = idxTarget;

    const t0 = performance.now();
    let prev = t0, firstFrame = true, pr = Math.min(devicePixelRatio || 1, isSmall ? 1.5 : 2), ema = 0.016;
    const frame = (now) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      const el = (now - t0) / 1000;
      ema += (dt - ema) * 0.05;   // lower the resolution if the GPU struggles
      if (el > 3 && ema > 0.026 && pr > 1) { pr = Math.max(1, pr - 0.25); renderer.setPixelRatio(pr); renderer.setSize(innerWidth, innerHeight, false); ema = 0.016; }
      const mv = reduceMotion ? 0 : 1;
      time.value = el;

      /* intro: fly in from deep space once the overlay lifts */
      const it = reduceMotion ? 1 : Math.min(Math.max((el - 1.1) / 3.4, 0), 1);
      const ease = 1 - Math.pow(1 - it, 4);
      if (it > 0.55) launch();

      idx += (idxTarget - idx) * (reduceMotion ? 1 : 0.045);
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      const speed = Math.abs(idxTarget - idx);
      camera.fov = 55 + Math.min(speed * 30, 14) + (1 - ease) * 25; // stretch while moving
      camera.updateProjectionMatrix();
      /* swing toward each planet as the camera sweeps past it */
      let pass = 0;
      planets.forEach((p, i) => { const k = (idx - i - DIST / SPACING) / 0.22; pass += Math.exp(-k * k); });
      const near = innerWidth < 800 ? 0 : 1.6;
      camera.position.set(mouse.x * 0.9 + pass * near, -mouse.y * 0.6 + pass * 0.5, DIST - idx * SPACING + (1 - ease) * 70);
      camera.rotation.set(mouse.y * 0.03, -mouse.x * 0.05 + Math.sin(idx * 6.2832) * 0.025 * mv, Math.sin(el * 0.2) * 0.01 * mv);
      neb.position.copy(camera.position);
      neb.material.uniforms.uT.value = idx;

      planets.forEach((p) => {
        const u = p.userData;
        p.position.x = u.baseX;
        p.position.y = u.baseY || 0;
        u.body.rotation.y += dt * u.spin * mv;
        if (u.rays) u.rays.material.rotation += dt * 0.03 * mv;
        if (u.moon) {
          const a = el * 0.5 * mv;
          u.moon.position.set(Math.cos(a) * u.orbit, Math.sin(a * 0.7) * 0.4, Math.sin(a) * u.orbit);
        }
      });
      belt.rotation.y += dt * 0.01 * mv;
      bgPlanets.forEach((b) => { b.rotation.y += dt * 0.08 * mv; });

      renderer.render(scene, camera);
      if (firstFrame) { firstFrame = false; intro.classList.add('ready'); }
    };

    let raf = 0;
    const loop = (now) => { raf = requestAnimationFrame(loop); frame(now); };
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf) { prev = performance.now(); raf = requestAnimationFrame(loop); }
    });
    raf = requestAnimationFrame(loop);
  }

  initScene();
})();