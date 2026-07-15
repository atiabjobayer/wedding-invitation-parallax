/* ============================================================
   Bair & Shimi — hero scroll sequence
   Resolution-independent: all offsets are % of the stage box or
   vmin-relative, so the composition resolves identically on
   phone / tablet / laptop / ultrawide.
   ============================================================ */

const groomHand    = document.getElementById('groomhand');
const brideHand    = document.getElementById('bridehand');
const groomHandCut = document.getElementById('groomhandcut');
const handsStage   = document.getElementById('handsStage');
const bgBig        = document.getElementById('bgBig');
const scrollCue    = document.getElementById('scrollCue');

const allText      = document.getElementById('allText');

const flowers = ['f1','f2','f3','f4','f5','f6'].map(id => document.getElementById(id));

/* ---------- tunables ---------- */

// Scroll budget scales with viewport height so the sequence feels
// the same length on a short phone and a tall monitor.
function computeBudget() {
  return Math.round(Math.min(Math.max(window.innerHeight * 2.2, 1200), 2600));
}
let TOTAL_SCROLL = computeBudget();

/* ============================================================
   >>> HAND TUNING — EDIT EVERYTHING BELOW THIS LINE <<<

   All values are % of the hands-stage box, so they hold at
   every screen size. Positive x = right, positive y = down.
   ============================================================ */

// ---- MEASURED FROM THE SOURCE PNGs (all 2000x1414) ----------------
//   The artwork does NOT fill its canvas. Content occupies:
//     groomhand    : x 12.1%-82.8%, y  7.4%-60.0%   (ring tip @ 82.8, 18.7)
//     groomhandcut : x 12.2%-82.8%, y  7.8%-60.0%   (same art, top wedge cut)
//     bridehand    : x 12.9%-87.1%, y 10.0%-51.8%   (fingertips @ 12.9, 37.2)
//
//   Because each hand sits in the UPPER-LEFT of its canvas, positioning
//   the canvas at 0,0 makes the hand look high and left. The y values
//   below already include the correction that re-centres the artwork
//   (+16.3% for groom, +19.1% for bride). That is why they look large.
// -------------------------------------------------------------------

// WHERE EACH HAND ENDS UP (the final clasp), as % of the stage box.
//
//   THE STACK (bottom -> top):
//     1. groom    — full groom hand + sleeve
//     2. bride    — bride hand, crosses OVER the groom's fingers
//     3. brideCut — same groom art with a wedge removed near the top,
//                   redrawn ABOVE the bride so his fingertips read as
//                   being in front of hers. This is the interlock.
//
//   groom and brideCut are the SAME drawing on two layers — their
//   x / y / rot MUST stay identical or you get a visible double image.
//   Solved so the clasped pair is centred in the stage and his ring
//   sits just above her ring finger. At this pose the two hands span
//   ~147% of the stage WIDTH and ~64% of its height — the composition
//   is wide and flat, so WIDTH is what clips first, never height.
//   Recentred so the clasped pair's bounding box sits dead-centre in
//   the stage box (it was +5% right, which made one side cut first).
const POSE = {
  groom:    { x: -35.0, y:  23.8, rot:  0   },  // bottom layer
  brideCut: { x: -35.0, y:  23.8, rot:  0   },  // MUST match groom
  bride:    { x:  30.3, y:   15.5, rot:  15 }   // ring finger under his ring
};

// WHERE EACH HAND STARTS — offset from its POSE, before scrolling.
//   x: negative = starts further left | positive = starts further right
//   y: negative = starts higher up    | positive = starts lower down
const ENTRY = {
  groom:    { x: -38, y:   0, rot:  0 },   // groom: in from the left
  brideCut: { x: -38, y:   0, rot:  0 },   // MUST match groom exactly
  bride:    { x:  38, y: -42, rot: 5 }    // bride: right + above => diagonal
};

// HOW BIG THE HANDS ARE (multiplies on top of .hands-stage width).
//   The clasped pair spans ~147% of the stage width, so the stage is
//   sized in CSS to let that overflow off both edges (the sleeve and
//   the bangles are meant to bleed). Raising END past ~1.1 starts
//   eating the fingertips — grow the CSS stage width instead.
const SCALE = { START: 0.82, END: 1.00 };

// Fraction of the scroll budget the hands take to travel into place.
const HANDS_PHASE = 0.42;

// TEXT FADE — all_text.png starts fully invisible and fades IN once
// the hands have arrived. START = scroll fraction where it begins
// fading in (should be >= HANDS_PHASE so it waits for the hands),
// END = where it is fully visible.
const TEXT_FADE = { START: 0.42, END: 0.75 };

/* ============================================================
   >>> END HAND TUNING <<<
   ============================================================ */

/* ---------- state ---------- */

let virtualScroll = 0;
let locked = true;
let ticking = false;
let scrollLockY = 0;

/* ---------- helpers ---------- */

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const stageProgress = (v, start, end) => clamp((v - start) / (end - start), 0, 1);

// cubic ease-out — removes the linear/mechanical feel
const ease = t => 1 - Math.pow(1 - t, 3);

function lockBody() {
  scrollLockY = window.scrollY;
  document.body.classList.add('locked');
  document.body.style.top = `-${scrollLockY}px`;
}

function unlockBody() {
  document.body.classList.remove('locked');
  document.body.style.top = '';
  window.scrollTo(0, scrollLockY);
}

/* ---------- main render ---------- */

function render() {
  const raw = clamp(virtualScroll / TOTAL_SCROLL, 0, 1);

  /* --- HANDS ---
     Travel resolves over HANDS_PHASE; scale keeps growing over the
     full scroll, so the hands continue to enlarge after they meet. */
  const hp  = ease(clamp(raw / HANDS_PHASE, 0, 1));  // travel progress
  const inv = 1 - hp;
  const scale = SCALE.START + (SCALE.END - SCALE.START) * ease(raw);

  function poseHand(el, pose, entry) {
    const x = pose.x + entry.x * inv;
    const y = pose.y + entry.y * inv;
    const r = pose.rot + entry.rot * inv;
    el.style.transform =
      `translate3d(${x}%, ${y}%, 0) rotate(${r}deg) scale(${scale})`;
  }

  poseHand(groomHand,    POSE.groom,    ENTRY.groom);
  poseHand(groomHandCut, POSE.brideCut, ENTRY.brideCut);
  poseHand(brideHand,    POSE.bride,    ENTRY.bride);

  /* --- BACKGROUND (bbg.png always visible; slow push-in only) --- */
  const bgP = ease(raw);
  bgBig.style.transform = `scale(${1.06 - 0.06 * bgP})`;

  /* --- TEXT/HANDS FOCUS PROGRESS (needed by flowers below too) --- */
  const tp = ease(stageProgress(raw, TEXT_FADE.START, TEXT_FADE.END));
  const tInv = 1 - tp;

  /* --- FLOWERS: staggered drift in, each from its own edge ---
     dx/dy are % of the element's own width/height. */
  const FLOWER_MOTION = {
    // id      order  dx    dy   rot   centered
    f1: { i: 1, dx: -55, dy:   0, rot: -7 },
    f2: { i: 0, dx: -60, dy:  30, rot: -9 },
    f3: { i: 4, dx:  55, dy:   0, rot:  7 },
    f4: { i: 5, dx: -60, dy:   0, rot: -6 },
    f5: { i: 2, dx: -60, dy: -30, rot: -8 },
    f6: { i: 3, dx:  60, dy:  30, rot:  9 }
  };

  flowers.forEach((el) => {
    if (!el) return;
    const m = FLOWER_MOTION[el.id];
    if (!m) return;
    const from = 0.20 + m.i * 0.07;
    const p = ease(stageProgress(raw, from, from + 0.30));
    const inv = 1 - p;

    // Extra "pop forward" pass, synced with the hands blur/dim (tp):
    // flowers lift slightly and sharpen from a soft blur as they
    // take over as the front layer.
    const popLift  = tInv * -3;                 // % hover-up
    const popScale = 1 + tp * 0.06;              // slight forward pop
    const popBlur  = tInv * 5;                   // blurred -> sharp

    el.style.opacity = p;
    el.style.filter = `blur(${popBlur}px)`;
    el.style.transform =
      `translate3d(${m.dx * inv}%, ${(m.dy * inv) + popLift}%, 0) ` +
      `rotate(${m.rot * inv}deg) scale(${(0.86 + 0.14 * p) * popScale})`;
  });

  /* --- ALL TEXT: hidden on load, fades in once the hands arrive ---
     Uses `translate` in CSS for centring, so writing `transform` here
     doesn't fight it. A slight settle + grow as it appears. */
  if (allText) {
    allText.style.opacity   = tp;
    allText.style.filter    = `blur(${tInv * 14}px)`;
    allText.style.transform = `translate3d(0, ${tInv * 3}%, 0) scale(${0.94 + tp * 0.06})`;
  }
  if (handsStage) {
    handsStage.style.filter  = `blur(${tp * 4}px)`;
    handsStage.style.opacity = 1 - tp * 0.35;
  }

  if (scrollCue) scrollCue.style.opacity = 1 - clamp(raw * 3, 0, 1);

  /* --- LOCK STATE ---
     The hero is the only section, so the body stays locked for good.
     virtualScroll simply saturates at TOTAL_SCROLL and the sequence
     rests on its final frame; scrolling back up replays it. */
}

function requestRender() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { render(); ticking = false; });
}

function advance(delta) {
  virtualScroll = clamp(virtualScroll + delta, 0, TOTAL_SCROLL);
  requestRender();
}

/* ---------- input: wheel ---------- */

window.addEventListener('wheel', (e) => {
  if (locked) {
    e.preventDefault();
    advance(e.deltaY);
  } else if (window.scrollY <= 0 && e.deltaY < 0) {
    e.preventDefault();
    locked = true;
    lockBody();
    advance(e.deltaY);
  }
}, { passive: false });

/* ---------- input: touch ---------- */

let touchStartY = 0;
let lastTouchY  = 0;

window.addEventListener('touchstart', (e) => {
  touchStartY = lastTouchY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  const y = e.touches[0].clientY;
  // touch deltas are smaller than wheel deltas — scale up to match feel
  const delta = (lastTouchY - y) * 2.2;
  lastTouchY = y;

  if (locked) {
    e.preventDefault();
    advance(delta);
  } else if (window.scrollY <= 0 && delta < 0) {
    e.preventDefault();
    locked = true;
    lockBody();
    advance(delta);
  }
}, { passive: false });

/* ---------- input: keyboard (accessibility) ---------- */

window.addEventListener('keydown', (e) => {
  if (!locked) return;
  const step = TOTAL_SCROLL / 12;
  if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); advance(step); }
  if (['ArrowUp', 'PageUp'].includes(e.key))          { e.preventDefault(); advance(-step); }
  if (e.key === 'End')  { e.preventDefault(); advance(TOTAL_SCROLL); }
  if (e.key === 'Home') { e.preventDefault(); advance(-TOTAL_SCROLL); }
}, { passive: false });

/* ---------- resize / orientation ---------- */

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const pct = virtualScroll / TOTAL_SCROLL;   // preserve position through rotation
    TOTAL_SCROLL = computeBudget();
    virtualScroll = pct * TOTAL_SCROLL;
    requestRender();
  }, 120);
});

window.addEventListener('orientationchange', () => setTimeout(requestRender, 250));

/* ---------- init ---------- */

lockBody();
render();