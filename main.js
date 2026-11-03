// Nav background once the hero scrolls away
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > window.innerHeight * 0.55);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Perched capys drop in once the wordmark has risen
const ready = () => requestAnimationFrame(() => {
  document.body.classList.add("is-ready");
  // after the drop-in, stop the intro animation from replaying when other animations swap in and out
  setTimeout(() => document.body.classList.add("is-landed"), 1800);
});
document.fonts ? document.fonts.ready.then(ready) : ready();

// Tap a capy → squish + a little cheer (lines adapted from the app's tone)
const cheers = [
  "You showed up. That counts.",
  "Half-done is still done-ish.",
  "Nothing is overdue here.",
  "Rest is a task too.",
  "One small thing? I'll sit with you.",
  "Proud of you. Want a yuzu?",
  "Today can be a gentle one.",
  "No streak to break. Ever.",
];
const bubble = document.getElementById("bubble");
const mark = bubble.parentElement;
let cheerIdx = Math.floor(Math.random() * cheers.length);
let bubbleTimer;

function cheer(capy) {
  capy.classList.remove("is-squish");
  void capy.offsetWidth;
  capy.classList.add("is-squish");
  capy.addEventListener("animationend", () => capy.classList.remove("is-squish"), { once: true });

  bubble.textContent = cheers[cheerIdx++ % cheers.length];
  const m = mark.getBoundingClientRect();
  const c = capy.getBoundingClientRect();
  bubble.classList.remove("is-on");
  // anchor to the capy's upper-right; flip left if it would leave the viewport
  let x = c.left - m.left + c.width * 0.7;
  const bw = bubble.offsetWidth;
  if (m.left + x + bw > innerWidth - 12) x = c.left - m.left - bw + c.width * 0.3;
  bubble.style.left = `${Math.max(x, 12 - m.left)}px`;
  bubble.style.top = `${c.top - m.top - bubble.offsetHeight + c.height * 0.12}px`;
  requestAnimationFrame(() => bubble.classList.add("is-on"));
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.remove("is-on"), 2600);
}

// The shy capy on the "l" sits with its back to you; click and it turns around for a bit
const backSrc = "assets/capy-back.webp";
const faceSrc = "assets/capy-front.webp";
let turnTimer;
function turn(capy, toFace) {
  const img = capy.querySelector("img");
  capy.classList.remove("is-turning");
  void capy.offsetWidth;
  capy.classList.add("is-turning");
  setTimeout(() => { img.src = toFace ? faceSrc : backSrc; }, 250);
  capy.addEventListener("animationend", () => capy.classList.remove("is-turning"), { once: true });
  capy.dataset.facing = toFace ? "you" : "away";
}
new Image().src = faceSrc;

const canHover = matchMedia("(hover: hover)").matches;
document.querySelectorAll(".perch").forEach((capy) => {
  if (canHover) capy.addEventListener("mouseenter", () => cheer(capy));
  capy.addEventListener("click", () => {
    if (capy.dataset.capy === "back") {
      const toFace = capy.dataset.facing !== "you";
      turn(capy, toFace);
      clearTimeout(turnTimer);
      if (toFace) {
        cheer(capy);
        turnTimer = setTimeout(() => turn(capy, false), 4000);
      }
      return;
    }
    cheer(capy);
  });
});

// Yuzu bath: each finished task drops a yuzu in and Capy sinks a little deeper
const tub = document.getElementById("tub");
const tubCapy = document.getElementById("tubCapy");
const count = document.getElementById("bathCount");
let yuzus = 0;

document.getElementById("dropYuzu").addEventListener("click", () => {
  yuzus++;
  const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  el.setAttribute("viewBox", "0 0 40 40");
  el.classList.add("float-yuzu");
  el.innerHTML = '<use href="#yuzu"/>';
  el.style.left = `${10 + Math.random() * 72}%`;
  el.style.setProperty("--y", `${520 + Math.random() * 90}%`);
  tub.appendChild(el);
  el.addEventListener("animationend", () => el.classList.add("is-floating"), { once: true });

  // keep the tub from overflowing with fruit
  const all = tub.querySelectorAll(".float-yuzu");
  if (all.length > 14) all[0].remove();

  tubCapy.style.setProperty("--sink", Math.min(yuzus * 3, 24));
  count.textContent = yuzus === 1 ? "1 yuzu in the bath — Capy approves." :
    yuzus < 8 ? `${yuzus} yuzu in the bath` : `${yuzus} yuzu. Capy is fully steeped.`;
});
