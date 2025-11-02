// scripts.js -- p5 sketch + GSAP interactions

// Rich particle dataset with rarity, points, and descriptions (game-friendly)
const PARTICLES = [
  {
    id: 'electron',
    name: 'Electron',
    type: 'Lepton',
    rarity: 'common',
    charge: '-1',
    mass: '9.11×10⁻³¹ kg',
    color: '#ff6f61',
    points: 10,
    description: 'A lightweight lepton that orbits the nucleus.',
  },
  {
    id: 'up',
    name: 'Up Quark',
    type: 'Quark',
    rarity: 'uncommon',
    charge: '+2/3',
    mass: '2.2 MeV/c²',
    color: '#f4d35e',
    points: 25,
    description: 'A building block of protons and neutrons.',
  },
  {
    id: 'down',
    name: 'Down Quark',
    type: 'Quark',
    rarity: 'uncommon',
    charge: '-1/3',
    mass: '4.7 MeV/c²',
    color: '#00a8cc',
    points: 25,
    description: 'Pairs with up quarks inside baryons.',
  },
  {
    id: 'photon',
    name: 'Photon',
    type: 'Boson',
    rarity: 'rare',
    charge: '0',
    mass: '0',
    color: '#6a0572',
    points: 75,
    description: 'A quantum of light — rare and valuable.',
  },
  {
    id: 'gluon',
    name: 'Gluon',
    type: 'Boson',
    rarity: 'rare',
    charge: '0',
    mass: '0',
    color: '#b56576',
    points: 90,
    description: 'Carrier of the strong force — very rare in this demo.',
  },
];

let sketchParticles = [];
let selected = null;
let cnv;
let score = 0;
let level = 1;

// lightweight SFX using Howler (CDN loaded in index.html)
const SFX = {
  collect: typeof Howl !== 'undefined'
    ? new Howl ({
        src: ['https://freesound.org/data/previews/341/341695_5260870-lq.mp3'],
        volume: 0.35,
      })
    : {play: () => {}},
  bonus: typeof Howl !== 'undefined'
    ? new Howl ({
        src: ['https://freesound.org/data/previews/331/331912_3248244-lq.mp3'],
        volume: 0.45,
      })
    : {play: () => {}},
  spawn: typeof Howl !== 'undefined'
    ? new Howl ({
        src: ['https://freesound.org/data/previews/273/273182_5121236-lq.mp3'],
        volume: 0.18,
      })
    : {play: () => {}},
};

// Create the p5 sketch and attach canvas into #canvasWrap
new p5 (p => {
  p.setup = function () {
    const wrap = document.getElementById ('canvasWrap');
    const w = Math.max (600, wrap.clientWidth);
    const h = Math.max (360, wrap.clientHeight);
    cnv = p.createCanvas (w, h);
    cnv.parent ('canvasWrap');

    // initialize particle positions with animated spawn
    const margin = 60;
    const cols = PARTICLES.length;
    PARTICLES.forEach ((d, i) => {
      const x = margin + i * (p.width - 2 * margin) / Math.max (1, cols - 1);
      const y = p.height / 2 + p.random (-30, 30);
      const sp = {
        ...d,
        x,
        y: -120,
        targetY: y,
        r: 36,
        vx: 0,
        vy: 0,
        opacity: 1,
      };
      sketchParticles.push (sp);
      setTimeout (() => SFX.spawn.play (), 140 * i);
      gsap.to (sp, {
        duration: 0.9 + i * 0.06,
        y: sp.targetY,
        ease: 'bounce.out',
      });
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
      // simple float motion with rarity-driven amplitude
      const jitter = sp.rarity === 'rare'
        ? 0.9
        : sp.rarity === 'uncommon' ? 0.45 : 0.25;
      sp.x += p.sin (p.millis () / 1000 + i * 0.4) * jitter;
      sp.y += p.cos (p.millis () / 1000 + i * 0.6) * jitter;

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
      // rarity badge
      if (sp.rarity === 'rare') {
        p.push ();
        p.fill ('#ffd86b');
        p.noStroke ();
        p.circle (sp.x + sp.r - 6, sp.y - sp.r + 6, 10);
        p.pop ();
      } else if (sp.rarity === 'uncommon') {
        p.push ();
        p.fill ('#7dd3fc');
        p.noStroke ();
        p.circle (sp.x + sp.r - 6, sp.y - sp.r + 6, 8);
        p.pop ();
      }

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
        collectParticle (sp);
        break;
      }
    }
    updateInfoBox (selected);

    if (selected)
      gsap.fromTo (
        '#canvasWrap canvas',
        {scale: 1},
        {
          duration: 0.35,
          scale: 1.03,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: 1,
        }
      );
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
  info.innerHTML = `\n    <h3>${particle.name}</h3>\n    <p><strong>Type:</strong> ${particle.type}</p>\n    <p><strong>Rarity:</strong> ${particle.rarity}</p>\n    <p><strong>Charge:</strong> ${particle.charge}</p>\n    <p><strong>Mass:</strong> ${particle.mass}</p>\n    <p style="margin-top:8px;color:#9aa6b2">${particle.description || ''}</p>\n  `;
}

// Buttons
document.addEventListener ('DOMContentLoaded', () => {
  const shuffleBtn = document.getElementById ('shuffleBtn');
  const resetBtn = document.getElementById ('resetBtn');
  const scoreEl = document.getElementById ('score');
  const levelEl = document.getElementById ('level');

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

  // keyboard nudges and quick controls
  window.addEventListener ('keydown', ev => {
    const force = 8 * (ev.shiftKey ? 2 : 1);
    if (ev.key === 'ArrowLeft') sketchParticles.forEach (sp => (sp.x -= force));
    if (ev.key === 'ArrowRight')
      sketchParticles.forEach (sp => (sp.x += force));
    if (ev.key === 'ArrowUp') sketchParticles.forEach (sp => (sp.y -= force));
    if (ev.key === 'ArrowDown') sketchParticles.forEach (sp => (sp.y += force));
    if (ev.key === 'r') {
      resetBtn.click ();
    }
  });

  // HUD updater
  setInterval (() => {
    if (scoreEl) scoreEl.textContent = score;
    if (levelEl) levelEl.textContent = level;
  }, 200);
});

// collect/consume a particle: award points, play sound, show effect, and respawn
function collectParticle (sp) {
  if (!sp) return;
  score += sp.points || 10;
  if (sp.rarity === 'rare') SFX.bonus.play ();
  else SFX.collect.play ();

  // pop animation and remove
  gsap.to (sp, {
    duration: 0.22,
    r: sp.r * 1.4,
    onComplete: () => {
      gsap.to (sp, {
        duration: 0.65,
        y: -140,
        opacity: 0,
        ease: 'power2.in',
        onComplete: () => {
          const idx = sketchParticles.indexOf (sp);
          if (idx >= 0) sketchParticles.splice (idx, 1);
        },
      });
    },
  });

  // spawn replacement
  setTimeout (() => {
    const wrap = document.getElementById ('canvasWrap');
    const nx = 60 + Math.random () * (wrap.clientWidth - 120);
    const ny = 80 + Math.random () * (wrap.clientHeight - 160);
    const base = PARTICLES[Math.floor (Math.random () * PARTICLES.length)];
    const newP = {
      ...base,
      x: nx,
      y: -80,
      targetY: ny,
      r: base.r || 36,
      opacity: 1,
    };
    sketchParticles.push (newP);
    SFX.spawn.play ();
    gsap.to (newP, {
      duration: 0.9 + Math.random () * 0.4,
      y: ny,
      ease: 'bounce.out',
    });
  }, 480 + Math.random () * 900);

  // level progression
  if (score > level * 200) {
    level++;
    gsap.fromTo (
      '.hud',
      {scale: 0.96, opacity: 0.8},
      {scale: 1, opacity: 1, duration: 0.6, ease: 'elastic.out(1,0.7)'}
    );
  }
}
