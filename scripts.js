// scripts.js -- p5 sketch + GSAP interactions

// Particle data (kept simple, will be used by p5)
const PARTICLES = [
  {
    name: 'Electron',
    type: 'Lepton',
    charge: '-1',
    mass: '9.11×10⁻³¹ kg',
    color: '#ff6f61',
  },
  {
    name: 'Up Quark',
    type: 'Quark',
    charge: '+2/3',
    mass: '2.2 MeV/c²',
    color: '#f4d35e',
  },
  {
    name: 'Down Quark',
    type: 'Quark',
    charge: '-1/3',
    mass: '4.7 MeV/c²',
    color: '#00a8cc',
  },
  {name: 'Photon', type: 'Boson', charge: '0', mass: '0', color: '#6a0572'},
];

let sketchParticles = [];
let selected = null;
let cnv;

// Create the p5 sketch and attach canvas into #canvasWrap
new p5 (p => {
  p.setup = function () {
    const wrap = document.getElementById ('canvasWrap');
    const w = Math.max (600, wrap.clientWidth);
    const h = Math.max (360, wrap.clientHeight);
    cnv = p.createCanvas (w, h);
    cnv.parent ('canvasWrap');

    // initialize particle positions
    const margin = 80;
    const cols = PARTICLES.length;
    PARTICLES.forEach ((d, i) => {
      const x = margin + i * (p.width - 2 * margin) / Math.max (1, cols - 1);
      const y = p.height / 2 + p.random (-30, 30);
      sketchParticles.push ({...d, x, y, r: 36, vx: 0, vy: 0});
    });

    p.noStroke ();
    p.textAlign (p.CENTER, p.CENTER);
    p.textSize (13);

    // entrance animation using GSAP (fade-in of canvas and buttons)
    gsap.from ('#canvasWrap canvas', {
      duration: 0.8,
      y: 20,
      opacity: 0,
      ease: 'power2.out',
    });
    gsap.from ('.brand h1', {duration: 0.8, x: -10, opacity: 0, delay: 0.1});
    gsap.from ('.info', {duration: 0.8, x: 10, opacity: 0, delay: 0.15});

    // accessibility: ensure infoBox is set
    updateInfoBox (null);
  };

  p.windowResized = function () {
    const wrap = document.getElementById ('canvasWrap');
    p.resizeCanvas (
      Math.max (560, wrap.clientWidth),
      Math.max (320, wrap.clientHeight)
    );
  };

  p.draw = function () {
    p.background ('#0f1720');

    // subtle background grid / glow
    for (let i = 0; i < sketchParticles.length; i++) {
      const sp = sketchParticles[i];
      // simple float motion
      sp.x += p.sin (p.millis () / 1000 + i) * 0.2;
      sp.y += p.cos (p.millis () / 1000 + i * 0.6) * 0.2;

      // draw glow
      p.push ();
      p.noStroke ();
      p.fill (sp.color + '22');
      p.circle (sp.x, sp.y, sp.r * 3);
      p.pop ();

      // main circle
      p.fill (sp.color);
      p.circle (sp.x, sp.y, sp.r * 2);

      p.fill ('#e6eef6');
      p.text (sp.name, sp.x, sp.y - sp.r - 12);

      // highlight if selected
      if (selected === sp) {
        p.push ();
        p.stroke ('#ffffff66');
        p.strokeWeight (2);
        p.noFill ();
        p.circle (sp.x, sp.y, sp.r * 2.6);
        p.pop ();
      }
    }
  };

  p.mousePressed = function () {
    // only respond if mouse is inside canvas
    if (
      p.mouseX < 0 ||
      p.mouseX > p.width ||
      p.mouseY < 0 ||
      p.mouseY > p.height
    )
      return;
    selected = null;
    for (let sp of sketchParticles) {
      const d = p.dist (p.mouseX, p.mouseY, sp.x, sp.y);
      if (d < sp.r) {
        selected = sp;
        break;
      }
    }
    updateInfoBox (selected);

    // animate selection
    if (selected) {
      gsap.fromTo (
        '#canvasWrap canvas',
        {scale: 1},
        {
          duration: 0.4,
          scale: 1.02,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: 1,
        }
      );
    }
  };
});

// Update info panel
function updateInfoBox (particle) {
  const info = document.getElementById ('infoBox');
  if (!info) return;
  if (!particle) {
    info.innerHTML = '<p>Click or tap a particle to see its properties.</p>';
    return;
  }
  info.innerHTML = `\n    <h3>${particle.name}</h3>\n    <p><strong>Type:</strong> ${particle.type}</p>\n    <p><strong>Charge:</strong> ${particle.charge}</p>\n    <p><strong>Mass:</strong> ${particle.mass}</p>\n  `;
}

// Buttons
document.addEventListener ('DOMContentLoaded', () => {
  const shuffleBtn = document.getElementById ('shuffleBtn');
  const resetBtn = document.getElementById ('resetBtn');

  shuffleBtn.addEventListener ('click', () => {
    // randomize positions with a joyful animation
    sketchParticles.forEach ((sp, i) => {
      const nx =
        60 +
        Math.random () *
          (document.getElementById ('canvasWrap').clientWidth - 120);
      const ny =
        80 +
        Math.random () *
          (document.getElementById ('canvasWrap').clientHeight - 160);
      gsap.to (sp, {
        duration: 0.9 + Math.random () * 0.6,
        x: nx,
        y: ny,
        ease: 'elastic.out(1, 0.6)',
      });
    });
  });

  resetBtn.addEventListener ('click', () => {
    // place them evenly again
    const wrap = document.getElementById ('canvasWrap');
    const margin = 80;
    const cols = sketchParticles.length;
    sketchParticles.forEach ((sp, i) => {
      const x =
        margin +
        i *
          (Math.max (560, wrap.clientWidth) - 2 * margin) /
          Math.max (1, cols - 1);
      const y = Math.max (320, wrap.clientHeight) / 2;
      gsap.to (sp, {duration: 0.8, x, y, ease: 'power3.out'});
    });
  });
});
