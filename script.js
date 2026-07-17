/* ============================================================
   Bair & Shimi — hero scroll sequence
   Resolution-independent: all offsets are % of the stage box or
   vmin-relative, so the composition resolves identically on
   phone / tablet / laptop / ultrawide.
   ============================================================ */

const groomHand = document.getElementById("groomhand");
const brideHand = document.getElementById("bridehand");
const groomHandCut = document.getElementById("groomhandcut");
const handsStage = document.getElementById("handsStage");
const bgBig = document.getElementById("bgBig");
const scrollCue = document.getElementById("scrollCue");

const allText = document.getElementById("allText");

const flowers = ["f1", "f2", "f3", "f4", "f5", "f6"].map((id) =>
  document.getElementById(id),
);

const supportsWebP = (() => {
  const canvas = document.createElement("canvas");
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
})();

const toPreferredFormat = (src) =>
  supportsWebP ? src.replace(/\.png$/i, ".webp") : src;

function hydrateImages(selector) {
  document.querySelectorAll(selector).forEach((img) => {
    const baseSrc = img.dataset.src;
    if (!baseSrc || img.getAttribute("src")) return;
    img.src = toPreferredFormat(baseSrc);
  });
}

/* ---------- tunables ---------- */

function computeBudget() {
  return Math.round(Math.min(Math.max(window.innerHeight * 2.2, 1200), 2600));
}
let TOTAL_SCROLL = computeBudget();

const POSE = {
  groom: { x: -35.0, y: 23.8, rot: 0 }, // bottom layer
  brideCut: { x: -35.0, y: 23.8, rot: 0 }, // MUST match groom
  bride: { x: 30.3, y: 15.5, rot: 15 }, // ring finger under his ring
};

const ENTRY = {
  groom: { x: -38, y: 0, rot: 0 }, // groom: in from the left
  brideCut: { x: -38, y: 0, rot: 0 }, // MUST match groom exactly
  bride: { x: 38, y: -42, rot: 5 }, // bride: right + above => diagonal
};

const SCALE = { START: 0.82, END: 1.0 };

const HANDS_PHASE = 0.42;

const TEXT_FADE = { START: 0.42, END: 0.75 };

const AUTO = {
  DELAY: 600, // ms to wait after the loader fades before starting
  PHASE1_DURATION: 1800, // ms for the hands to travel in and meet
  PAUSE: 250, // ms to hold once they meet, before the reveal starts
  PHASE2_DURATION: 1400, // ms for the blur/text reveal to play out
  TARGET: TEXT_FADE.END, // stop once the text is fully sharp, not before
};

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

const stageProgress = (v, start, end) =>
  clamp((v - start) / (end - start), 0, 1);

// cubic ease-out — removes the linear/mechanical feel
const ease = (t) => 1 - Math.pow(1 - t, 3);

function lockBody() {
  scrollLockY = window.scrollY;
  document.body.classList.add("locked");
  document.body.style.top = `-${scrollLockY}px`;
}

function unlockBody() {
  document.body.classList.remove("locked");
  document.body.style.top = "";
  window.scrollTo(0, scrollLockY);
}

/* ---------- main render ---------- */

function render() {
  const raw = clamp(virtualScroll / TOTAL_SCROLL, 0, 1);

  /* --- HANDS ---
     Travel resolves over HANDS_PHASE; scale keeps growing over the
     full scroll, so the hands continue to enlarge after they meet. */
  const hp = ease(clamp(raw / HANDS_PHASE, 0, 1)); // travel progress
  const inv = 1 - hp;
  const scale = SCALE.START + (SCALE.END - SCALE.START) * ease(raw);

  function poseHand(el, pose, entry) {
    const x = pose.x + entry.x * inv;
    const y = pose.y + entry.y * inv;
    const r = pose.rot + entry.rot * inv;
    el.style.transform = `translate3d(${x}%, ${y}%, 0) rotate(${r}deg) scale(${scale})`;
  }

  poseHand(groomHand, POSE.groom, ENTRY.groom);
  poseHand(groomHandCut, POSE.brideCut, ENTRY.brideCut);
  poseHand(brideHand, POSE.bride, ENTRY.bride);

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
    f1: { i: 1, dx: -55, dy: 0, rot: -7 },
    f2: { i: 0, dx: -60, dy: 30, rot: -9 },
    f3: { i: 4, dx: 55, dy: 0, rot: 7 },
    f4: { i: 5, dx: -60, dy: 0, rot: -6 },
    f5: { i: 2, dx: -60, dy: -30, rot: -8 },
    f6: { i: 3, dx: 60, dy: 30, rot: 9 },
  };

  flowers.forEach((el) => {
    if (!el) return;
    const m = FLOWER_MOTION[el.id];
    if (!m) return;
    const from = 0.2 + m.i * 0.07;
    const p = ease(stageProgress(raw, from, from + 0.3));
    const inv = 1 - p;

    // Extra "pop forward" pass, synced with the hands blur/dim (tp):
    // flowers lift slightly and sharpen from a soft blur as they
    // take over as the front layer.
    const popLift = tInv * -3; // % hover-up
    const popScale = 1 + tp * 0.06; // slight forward pop
    const popBlur = tInv * 5; // blurred -> sharp

    el.style.opacity = p;
    el.style.filter = `blur(${popBlur}px)`;
    el.style.transform =
      `translate3d(${m.dx * inv}%, ${m.dy * inv + popLift}%, 0) ` +
      `rotate(${m.rot * inv}deg) scale(${(0.86 + 0.14 * p) * popScale})`;
  });

  /* --- ALL TEXT: hidden on load, fades in once the hands arrive ---
     Uses `translate` in CSS for centring, so writing `transform` here
     doesn't fight it. A slight settle + grow as it appears. */
  if (allText) {
    allText.style.opacity = tp;
    allText.style.filter = `blur(${tInv * 14}px)`;
    allText.style.transform = `translate3d(0, ${tInv * 3}%, 0) scale(${0.94 + tp * 0.06})`;
  }
  if (handsStage) {
    handsStage.style.filter = `blur(${tp * 4}px)`;
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
  requestAnimationFrame(() => {
    render();
    ticking = false;
  });
}

function advance(delta) {
  virtualScroll = clamp(virtualScroll + delta, 0, TOTAL_SCROLL);
  requestRender();
}

/* ---------- auto-scroll (plays once, any input cancels) ---------- */

let autoRAF = null;
let autoTimeout = null;
let autoDone = false; // ensures it can never run twice

function cancelAuto() {
  if (autoRAF !== null) {
    cancelAnimationFrame(autoRAF);
    autoRAF = null;
  }
  if (autoTimeout !== null) {
    clearTimeout(autoTimeout);
    autoTimeout = null;
  }
  autoDone = true;
}

// ease-in-out: gentle start, gentle stop — reads as intentional
const easeIO = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Animates virtualScroll from `from` to `to` over `duration` ms, then
// calls `onDone`. Used to build the two-phase auto-scroll below.
function animateVirtualScroll(from, to, duration, onDone) {
  const t0 = performance.now();
  const step = (now) => {
    if (autoDone) return;
    const t = clamp((now - t0) / duration, 0, 1);
    virtualScroll = from + (to - from) * easeIO(t);
    render(); // direct: we're already in a rAF
    if (t < 1) {
      autoRAF = requestAnimationFrame(step);
    } else {
      autoRAF = null;
      onDone();
    }
  };
  autoRAF = requestAnimationFrame(step);
}

function startAuto() {
  if (autoDone) return;

  // respect the OS "reduce motion" setting: jump to the same resting
  // frame instead of animating there
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    virtualScroll = TOTAL_SCROLL * AUTO.TARGET;
    autoDone = true;
    requestRender();
    return;
  }

  const meetPos = TOTAL_SCROLL * HANDS_PHASE;
  const finalPos = TOTAL_SCROLL * AUTO.TARGET;

  // Phase 1: hands travel in and meet. Phase 2 (the blur/text reveal)
  // only starts after a real pause, so the meeting itself registers
  // before the scene changes under it.
  animateVirtualScroll(virtualScroll, meetPos, AUTO.PHASE1_DURATION, () => {
    autoTimeout = setTimeout(() => {
      if (autoDone) return;
      autoTimeout = null;
      animateVirtualScroll(
        virtualScroll,
        finalPos,
        AUTO.PHASE2_DURATION,
        () => {
          autoDone = true; // finished naturally; never replay
        },
      );
    }, AUTO.PAUSE);
  });
}

/* ---------- input: wheel ---------- */

window.addEventListener(
  "wheel",
  (e) => {
    cancelAuto();
    if (locked) {
      e.preventDefault();
      advance(e.deltaY);
    } else if (window.scrollY <= 0 && e.deltaY < 0) {
      e.preventDefault();
      locked = true;
      lockBody();
      advance(e.deltaY);
    }
  },
  { passive: false },
);

/* ---------- input: touch ---------- */

let touchStartY = 0;
let lastTouchY = 0;

window.addEventListener(
  "touchstart",
  (e) => {
    cancelAuto();
    touchStartY = lastTouchY = e.touches[0].clientY;
  },
  { passive: true },
);

window.addEventListener(
  "touchmove",
  (e) => {
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
  },
  { passive: false },
);

/* ---------- input: keyboard (accessibility) ---------- */

window.addEventListener(
  "keydown",
  (e) => {
    cancelAuto();
    if (!locked) return;
    const step = TOTAL_SCROLL / 12;
    if (["ArrowDown", "PageDown", " "].includes(e.key)) {
      e.preventDefault();
      advance(step);
    }
    if (["ArrowUp", "PageUp"].includes(e.key)) {
      e.preventDefault();
      advance(-step);
    }
    if (e.key === "End") {
      e.preventDefault();
      advance(TOTAL_SCROLL);
    }
    if (e.key === "Home") {
      e.preventDefault();
      advance(-TOTAL_SCROLL);
    }
  },
  { passive: false },
);

/* ---------- resize / orientation ---------- */

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // an in-flight auto-scroll holds a stale target; stop it rather
    // than let it fight the new budget
    cancelAuto();
    const pct = virtualScroll / TOTAL_SCROLL; // preserve position through rotation
    TOTAL_SCROLL = computeBudget();
    virtualScroll = pct * TOTAL_SCROLL;
    requestRender();
  }, 120);
});

window.addEventListener("orientationchange", () =>
  setTimeout(requestRender, 250),
);

/* ---------- loading screen ----------
   Tracks REAL decode progress of the artwork, so the ring reflects
   something true rather than a fake timer. A hard timeout guarantees
   the loader always clears even if an asset 404s or stalls. */

const loader = document.getElementById("loader");
const loaderPct = document.getElementById("loaderPct");
const loaderMsg = document.getElementById("loaderMsg");
const ringFill = document.getElementById("ringFill");

const RING_C = 276.46; // 2 * PI * r, r=44 (matches the CSS)
const LOADER_TIMEOUT = 12000; // ms — never trap the visitor

const MESSAGES = [
  "Setting the scene",
  "Arranging the flowers",
  "Polishing the ring",
  "Almost ready",
];

// Only the first visible frame blocks the loader.
const CRITICAL_ASSETS = [
  "images/bbg.png",
  "images/groomhand.png",
  "images/bridehand.png",
  "images/groomhandcut.png",
].map(toPreferredFormat);

let loaded = 0;
let finished = false;
let shownPct = 0;

function setProgress(frac) {
  const pct = Math.round(frac * 100);
  // never let the number go backwards
  if (pct < shownPct) return;
  shownPct = pct;
  if (loaderPct) loaderPct.textContent = `${pct}%`;
  if (ringFill) ringFill.style.strokeDashoffset = RING_C * (1 - frac);

  const idx = Math.min(Math.floor(frac * MESSAGES.length), MESSAGES.length - 1);
  if (loaderMsg && loaderMsg.dataset.idx !== String(idx)) {
    loaderMsg.dataset.idx = String(idx);
    loaderMsg.classList.add("is-swapping");
    setTimeout(() => {
      loaderMsg.textContent = MESSAGES[idx];
      loaderMsg.classList.remove("is-swapping");
    }, 200);
  }
}

function finish() {
  if (finished) return;
  finished = true;

  setProgress(1);

  // Non-critical layers can load after first frame is ready.
  hydrateImages("#allText[data-src], .flower[data-src]");

  // let the ring visibly reach 100% before the curtain lifts
  setTimeout(() => {
    if (loader) {
      loader.classList.add("loader--done");
      // drop the node once the fade finishes — it's inert after this
      setTimeout(() => loader && loader.remove(), 800);
    }
    // play the sequence forward once, hands-free
    setTimeout(startAuto, AUTO.DELAY);
  }, 420);
}

function bumpLoaded() {
  loaded++;
  setProgress(Math.min(loaded / CRITICAL_ASSETS.length, 1));
  if (loaded >= CRITICAL_ASSETS.length) finish();
}

function preload() {
  setProgress(0);

  CRITICAL_ASSETS.forEach((src) => {
    const img = new Image();
    let counted = false;
    // guard: a cached image can fire onload AND report .complete
    // synchronously — without this the count double-fires and the
    // ring jumps past 100%.
    const once = () => {
      if (counted) return;
      counted = true;
      bumpLoaded();
    };
    img.onload = once;
    img.onerror = once; // a 404 must not stall the loader
    img.src = src;
    if (img.complete) once();
  });

  // safety net
  setTimeout(finish, LOADER_TIMEOUT);
}

/* ---------- init ---------- */

hydrateImages("#groomhand[data-src], #bridehand[data-src], #groomhandcut[data-src]");
lockBody();
render();
preload();
