// atom_explorer.js
// Simple interactive atom explorer with GSAP animations

const atomInfo = () => document.getElementById ('atomInfo');
const atomDetails = () => document.getElementById ('atomDetails');
const nucleus = document.getElementById ('nucleus');
const nucleusCore = document.getElementById ('nucleusCore');
const nucleonsGroup = document.getElementById ('nucleons');
const orbit1 = document.getElementById ('orbit1');
const orbit2 = document.getElementById ('orbit2');
const orbit3 = document.getElementById ('orbit3');
// electron groups
const electrons1 = document.getElementById ('electrons1');
const electrons2 = document.getElementById ('electrons2');
const electrons3 = document.getElementById ('electrons3');
const atomSvg = document.getElementById ('atomSvg');

let nucleonsVisible = false;
let expandedNucleon = null;
let zoomed = false;

function setInfo (title, html) {
  const info = atomInfo ();
  info.innerHTML = `<h3>${title}</h3><div>${html}</div>`;
}

function setDetails (html) {
  const d = atomDetails ();
  if (d) d.innerHTML = html;
}

function createNucleons () {
  // create 6 nucleons (3 protons, 3 neutrons) for demonstration
  const nucleons = [];
  const colors = {proton: '#ff6f61', neutron: '#9aa6b2'};
  for (let i = 0; i < 6; i++) {
    const type = i % 2 === 0 ? 'proton' : 'neutron';
    const g = document.createElementNS ('http://www.w3.org/2000/svg', 'g');
    g.classList.add ('nucleon');
    g.setAttribute ('data-type', type);
    const cx = 40 + Math.cos (i / 6 * Math.PI * 2) * 50;
    const cy = 40 + Math.sin (i / 6 * Math.PI * 2) * 40;
    const c = document.createElementNS ('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute ('cx', cx);
    c.setAttribute ('cy', cy);
    c.setAttribute ('r', 14);
    c.setAttribute ('fill', colors[type]);
    g.appendChild (c);
    nucleons.push (g);
    nucleonsGroup.appendChild (g);
    // click handler for nucleon
    g.addEventListener ('click', ev => {
      ev.stopPropagation ();
      expandNucleon (g);
    });
  }
}

function expandNucleon (node) {
  // if already expanded, collapse
  if (expandedNucleon === node) {
    collapseQuarks ();
    expandedNucleon = null;
    setInfo (
      'Nucleon',
      'Click another nucleon to explore its quark composition.'
    );
    return;
  }
  expandedNucleon = node;
  // show quarks inside
  const bbox = node.getBBox ();
  const baseX = bbox.x + bbox.width / 2;
  const baseY = bbox.y + bbox.height / 2;
  // clear existing quark visuals
  collapseQuarks ();
  const types = node.getAttribute ('data-type') === 'proton'
    ? ['up', 'up', 'down']
    : ['up', 'down', 'down'];
  types.forEach ((q, i) => {
    const qg = document.createElementNS ('http://www.w3.org/2000/svg', 'g');
    qg.classList.add ('quark');
    const cx = baseX + Math.cos (i / 3 * Math.PI * 2) * 30;
    const cy = baseY + Math.sin (i / 3 * Math.PI * 2) * 20;
    const qc = document.createElementNS (
      'http://www.w3.org/2000/svg',
      'circle'
    );
    qc.setAttribute ('cx', cx);
    qc.setAttribute ('cy', cy);
    qc.setAttribute ('r', 8);
    qc.setAttribute ('fill', q === 'up' ? '#f4d35e' : '#00a8cc');
    qg.appendChild (qc);
    nucleonsGroup.appendChild (qg);
    // animate pop-in
    gsap.from (qc, {
      duration: 0.45,
      scale: 0,
      transformOrigin: `${cx}px ${cy}px`,
      ease: 'back.out(1.7)',
    });
  });
  setInfo (
    'Quark composition',
    `This ${node.getAttribute ('data-type')} contains quarks: ${types.join (', ')}.`
  );
}

function collapseQuarks () {
  // remove existing .quark elements
  const qs = nucleonsGroup.querySelectorAll ('.quark');
  qs.forEach (q => q.remove ());
}

function toggleNucleus () {
  if (!nucleonsVisible) {
    // zoom slightly toward nucleus for an encyclopedic feel
    if (!zoomed) {
      gsap.to (atomSvg, {
        duration: 0.9,
        scale: 1.45,
        x: -160,
        y: -100,
        transformOrigin: '400px 320px',
        ease: 'power2.out',
      });
      zoomed = true;
    }
    // after zoom, create nucleons
    setTimeout (() => {
      createNucleons ();
      nucleonsVisible = true;
      gsap.from ('.nucleon circle', {
        duration: 0.7,
        y: -40,
        opacity: 0,
        stagger: 0.08,
        ease: 'bounce.out',
      });
      setInfo (
        'Nucleus expanded',
        'You can click a nucleon to see its quark composition.'
      );
      setDetails (
        `<p><strong>Nucleus</strong>: Contains protons and neutrons. Protons are positively charged; neutrons are neutral. Click a nucleon to view its quarks.</p>`
      );
    }, 520);
  } else {
    collapseQuarks ();
    // remove nucleons
    const ns = nucleonsGroup.querySelectorAll ('.nucleon');
    ns.forEach (n => n.remove ());
    nucleonsVisible = false;
    setInfo (
      'Nucleus',
      'Click the nucleus to expand into protons and neutrons.'
    );
    setDetails ('');
    // zoom out back to full atom
    if (zoomed) {
      gsap.to (atomSvg, {
        duration: 0.8,
        scale: 1,
        x: 0,
        y: 0,
        transformOrigin: '400px 320px',
        ease: 'power2.out',
      });
      zoomed = false;
    }
  }
}

// electron expansion
function expandElectron (el) {
  // show electron details and a simple lepton breakdown
  const name = el.getAttribute ('data-name') || 'Electron';
  setInfo (
    name,
    `<p>${name} is a lepton. In this demo it expands to show its classification and some facts.</p><ul><li>Type: Lepton</li><li>Charge: -1</li><li>Mass: 9.11×10⁻³¹ kg</li></ul>`
  );
  setDetails (
    `<p><strong>${name}</strong> — Leptons are fundamental particles not composed of smaller quarks. Electrons participate in chemical bonding and determine an atom's charge.</p><p><em>Fun fact</em>: Electrons can be excited to higher energy levels and emit photons when they drop back down.</p>`
  );
  // animate a ring highlight
  gsap.fromTo (
    el,
    {scale: 1},
    {
      duration: 0.35,
      scale: 1.4,
      yoyo: true,
      repeat: 1,
      transformOrigin: 'center center',
    }
  );
}

// wiring interactions
nucleusCore.addEventListener ('click', ev => {
  ev.stopPropagation ();
  toggleNucleus ();
});

// electrons clickable — bind to all electron elements across orbits
Array.from (document.querySelectorAll ('#atomSvg .electron')).forEach (el => {
  el.style.cursor = 'pointer';
  el.addEventListener ('click', ev => {
    ev.stopPropagation ();
    expandElectron (el);
  });
});

// click outside to collapse
window.addEventListener ('click', () => {
  collapseQuarks ();
  expandedNucleon = null;
  setInfo (
    'Atom Explorer',
    'Click the nucleus to expand into nucleons, or click an electron to learn more.'
  );
});

// initial info
setInfo (
  'Atom Explorer',
  'Click the nucleus to expand into protons and neutrons. Click an electron to expand and learn about leptons.'
);

// small orbit animation
// Rotating orbit groups to emulate classic encyclopedia style animations
gsap.to ('#orbit1', {
  duration: 12,
  rotation: 360,
  transformOrigin: '400px 320px',
  repeat: -1,
  ease: 'linear',
});
gsap.to ('#orbit2', {
  duration: 9,
  rotation: -360,
  transformOrigin: '400px 320px',
  repeat: -1,
  ease: 'linear',
});
gsap.to ('#orbit3', {
  duration: 6,
  rotation: 360,
  transformOrigin: '400px 320px',
  repeat: -1,
  ease: 'linear',
});

// subtle electron wobble for life
gsap.to ('#atomSvg .electron', {
  duration: 1.8,
  y: '+=4',
  yoyo: true,
  repeat: -1,
  ease: 'sine.inOut',
  stagger: 0.2,
});

// Update legend swatches dynamically (keeps legend in sync if colors change)
function updateLegend () {
  const legend = document.querySelector ('.legend');
  if (!legend) return;
  const mapping = [
    {selector: '.legend-item:nth-child(2) .swatch', color: '#ff6f61'}, // proton
    {selector: '.legend-item:nth-child(3) .swatch', color: '#9aa6b2'}, // neutron
    {selector: '.legend-item:nth-child(4) .swatch', color: '#7dd3fc'}, // electron
    {selector: '.legend-item:nth-child(5) .swatch', color: '#f4d35e'}, // up quark
    {selector: '.legend-item:nth-child(6) .swatch', color: '#00a8cc'}, // down quark
    {selector: '.legend-item:nth-child(7) .swatch', color: '#6a0572'}, // photon
  ];
  mapping.forEach (m => {
    const el = legend.querySelector (m.selector);
    if (el) el.style.background = m.color;
  });
}
updateLegend ();

// Guided tour sequence that animates through nucleus -> nucleon -> quark -> electron
function runTour () {
  const btn = document.getElementById ('playTourBtn');
  if (btn) btn.disabled = true;
  const tl = gsap.timeline ({
    onComplete: () => {
      if (btn) btn.disabled = false;
    },
  });

  // 1. speed up orbits and slightly brighten
  tl.to (['#orbit1', '#orbit2', '#orbit3'], {duration: 0.6, timeScale: 2}, 0);
  tl.to ('#orbit1', {duration: 1.2, rotation: 720, ease: 'power2.inOut'}, 0);

  // 2. zoom toward nucleus
  tl.to (
    atomSvg,
    {
      duration: 0.9,
      scale: 1.6,
      x: -200,
      y: -120,
      transformOrigin: '400px 320px',
      ease: 'power2.inOut',
    },
    0.4
  );

  // 3. spawn nucleons and bounce
  tl.call (
    () => {
      if (!nucleonsVisible) createNucleons ();
    },
    null,
    1.2
  );
  tl.from (
    '.nucleon circle',
    {duration: 0.8, y: -40, opacity: 0, stagger: 0.08, ease: 'bounce.out'},
    1.3
  );

  // 4. expand first nucleon to show quarks
  tl.call (
    () => {
      const first = nucleonsGroup.querySelector ('.nucleon');
      if (first) expandNucleon (first);
    },
    null,
    2.4
  );

  // 5. brief pause to observe quarks
  tl.to ({}, {duration: 1.4}, 3.0);

  // 6. collapse and zoom out
  tl.call (
    () => {
      collapseQuarks ();
    },
    null,
    4.6
  );
  tl.to (
    atomSvg,
    {
      duration: 0.8,
      scale: 1,
      x: 0,
      y: 0,
      transformOrigin: '400px 320px',
      ease: 'power2.out',
    },
    4.8
  );

  // 7. highlight an electron and show info
  tl.call (
    () => {
      const el = document.querySelector ('#atomSvg .electron');
      if (el) {
        gsap.to (el, {
          duration: 0.35,
          scale: 1.6,
          yoyo: true,
          repeat: 3,
          transformOrigin: 'center center',
        });
        expandElectron (el);
      }
    },
    null,
    5.6
  );

  // 8. final pause then re-enable
  tl.to ({}, {duration: 1.2}, 6.6);
}

// bind tour button
document.addEventListener ('DOMContentLoaded', () => {
  const btn = document.getElementById ('playTourBtn');
  if (btn) btn.addEventListener ('click', runTour);
});
