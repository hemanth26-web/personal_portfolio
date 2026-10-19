/* ---------- THREE.JS 3D BACKGROUND ---------- */
const canvas = document.getElementById('bg');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 9;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const hero = new THREE.Group();
scene.add(hero);

// Colorful torus knot (normal material = rainbow shading)
const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.5, 0.42, 250, 36),
  new THREE.MeshNormalMaterial()
);
hero.add(knot);

// Wireframe icosahedron around it
const wire = new THREE.Mesh(
  new THREE.IcosahedronGeometry(2.9, 1),
  new THREE.MeshBasicMaterial({ color: 0x7c5cff, wireframe: true, transparent: true, opacity: 0.35 })
);
hero.add(wire);

// Orbiting rings
const ring1 = new THREE.Mesh(
  new THREE.TorusGeometry(3.7, 0.03, 16, 200),
  new THREE.MeshBasicMaterial({ color: 0x00e5ff })
);
ring1.rotation.x = Math.PI / 2.3;
hero.add(ring1);

const ring2 = new THREE.Mesh(
  new THREE.TorusGeometry(4.2, 0.025, 16, 200),
  new THREE.MeshBasicMaterial({ color: 0xff4ecd })
);
ring2.rotation.y = Math.PI / 2.6;
hero.add(ring2);

// Floating small shapes
const shapes = [];
const shapeColors = [0x00e5ff, 0x7c5cff, 0xff4ecd, 0xffb347, 0x00f5a0];
for (let i = 0; i < 18; i++) {
  const geo = i % 2 ? new THREE.OctahedronGeometry(0.22) : new THREE.TetrahedronGeometry(0.26);
  const mat = new THREE.MeshBasicMaterial({
    color: shapeColors[i % shapeColors.length], wireframe: true
  });
  const m = new THREE.Mesh(geo, mat);
  m.position.set((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8 - 2);
  m.userData.speed = 0.005 + Math.random() * 0.01;
  scene.add(m);
  shapes.push(m);
}

// Colored particle field
const COUNT = 1600;
const pos = new Float32Array(COUNT * 3);
const col = new Float32Array(COUNT * 3);
const palette = shapeColors.map(c => new THREE.Color(c));
for (let i = 0; i < COUNT; i++) {
  pos[i * 3] = (Math.random() - 0.5) * 40;
  pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
  pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
  const c = palette[Math.floor(Math.random() * palette.length)];
  col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
const particles = new THREE.Points(
  pGeo,
  new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.85 })
);
scene.add(particles);

// Interaction state
let mouseX = 0, mouseY = 0, scrollY = 0;
addEventListener('mousemove', e => {
  mouseX = (e.clientX / innerWidth - 0.5) * 2;
  mouseY = (e.clientY / innerHeight - 0.5) * 2;
  const g = document.getElementById('cursorGlow');
  g.style.left = e.clientX + 'px';
  g.style.top = e.clientY + 'px';
});
addEventListener('scroll', () => { scrollY = window.scrollY; });

function isMobile() { return innerWidth < 860; }

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  knot.rotation.x = t * 0.25;
  knot.rotation.y = t * 0.35;
  wire.rotation.y = -t * 0.12;
  wire.rotation.x = t * 0.08;
  ring1.rotation.z = t * 0.3;
  ring2.rotation.x = t * 0.2;

  // Move the hero object across the screen as you scroll
  const progress = scrollY / innerHeight;
  const targetX = isMobile() ? 0 : Math.cos(progress * 1.1) * 3.4;
  const targetY = isMobile() ? 2.2 - progress * 0.4 : Math.sin(progress * 0.8) * 0.8;
  hero.position.x += (targetX - hero.position.x) * 0.05;
  hero.position.y += (targetY - hero.position.y) * 0.05;
  hero.rotation.y = progress * 0.7;
  const s = isMobile() ? 0.55 : 1;
  hero.scale.setScalar(s);

  shapes.forEach((m, i) => {
    m.rotation.x += m.userData.speed;
    m.rotation.y += m.userData.speed * 1.4;
    m.position.y += Math.sin(t + i) * 0.003;
  });

  particles.rotation.y = t * 0.02 + progress * 0.15;
  particles.rotation.x = progress * 0.1;

  // Mouse parallax on camera
  camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.04;
  camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.04;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ---------- TYPING EFFECT ---------- */
const roles = ['Full-Stack Developer', 'GenAI Developer', 'MERN Stack Builder', 'AI Agent Enthusiast'];
const typingEl = document.getElementById('typing');
let r = 0, c = 0, deleting = false;
function type() {
  const word = roles[r];
  typingEl.textContent = deleting ? word.slice(0, c--) : word.slice(0, c++);
  let delay = deleting ? 45 : 90;
  if (!deleting && c > word.length) { deleting = true; delay = 1400; }
  else if (deleting && c < 0) { deleting = false; r = (r + 1) % roles.length; c = 0; delay = 400; }
  setTimeout(type, delay);
}
type();

/* ---------- SCROLL REVEAL + COUNTERS ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      const num = entry.target.querySelector('[data-target]');
      if (num && !num.dataset.done) { num.dataset.done = '1'; countUp(num); }
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

function countUp(el) {
  const target = +el.dataset.target;
  const duration = 1500;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(p * target);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------- 3D TILT ON CARDS ---------- */
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    if (isMobile()) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform =
      `perspective(900px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ---------- NAV ---------- */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40));
const menuBtn = document.getElementById('menuBtn');
const links = document.getElementById('links');
menuBtn.addEventListener('click', () => links.classList.toggle('open'));
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

/* ---------- CONTACT FORM (opens your email app) ---------- */
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('fname').value;
  const email = document.getElementById('femail').value;
  const msg = document.getElementById('fmsg').value;
  const subject = encodeURIComponent('Portfolio contact from ' + name);
  const body = encodeURIComponent(msg + '\n\n- ' + name + ' (' + email + ')');
  window.location.href = `mailto:sonnailahemanth@gmail.com?subject=${subject}&body=${body}`;
});

document.getElementById('year').textContent = new Date().getFullYear();