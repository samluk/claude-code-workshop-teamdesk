import { useEffect } from "react";

// Sparkles and confetti that burst out of any button while the unicorn theme is
// on. Client-only, no dependencies: one document click listener spawns a few
// short-lived elements into a fixed overlay and animates them with the Web
// Animations API, then removes them.
//
// Use appendChild, not append: the generated Cloudflare runtime types declare
// an HTMLRewriter Element.append that shadows the DOM one and fails typecheck.

const CONFETTI_COLORS = [
  "#ff6fa8",
  "#c58bff",
  "#6ec5ff",
  "#5fe3b0",
  "#ffe36e",
  "#ff9d6e",
] as const;
const SPARKLE_COLORS = ["#fff6b0", "#ffe14d", "#ffffff", "#ffc2ec"] as const;
// Warm glow plus a white halo so the pale stars read on light and dark pages.
const SPARKLE_GLOW =
  "drop-shadow(0 0 3px rgba(255, 160, 0, 0.95)) drop-shadow(0 0 7px rgba(255, 255, 255, 0.9))";

const CONFETTI_PER_CLICK = 18;
const SPARKLES_PER_CLICK = 8;
// Stops rapid clicking from piling up elements faster than they finish.
const MAX_LIVE_PARTICLES = 150;
// Confetti peaks up to ~170px above the button; closer than this to the top
// of the viewport it would leave the screen, so it fans downward instead.
const ROOM_ABOVE_NEEDED = 150;

const BUTTON_SELECTOR = 'button, [role="button"], [data-slot="button"]';
const DISABLED_SELECTOR = ':disabled, [aria-disabled="true"]';
const STAR_CLIP =
  "polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%)";
const DEGREES_TO_RADIANS = Math.PI / 180;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function shouldBurst() {
  return (
    document.documentElement.getAttribute("data-unicorn") === "on" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function createLayer() {
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, {
    inset: "0",
    overflow: "hidden",
    pointerEvents: "none",
    position: "fixed",
    zIndex: "2147483000",
  });
  document.body.appendChild(layer);
  return layer;
}

function spawnConfetti(
  layer: HTMLElement,
  x: number,
  y: number,
  fanDown: boolean
) {
  const piece = document.createElement("div");
  Object.assign(piece.style, {
    background: pick(CONFETTI_COLORS),
    borderRadius: "2px",
    height: `${randomBetween(10, 16)}px`,
    left: `${x}px`,
    position: "absolute",
    top: `${y}px`,
    width: `${randomBetween(6, 10)}px`,
  });

  // Fan upward, peak, then fall back with a spin. Near the top of the page
  // there is no room above, so fan downward instead of off-screen.
  const angle =
    (fanDown ? randomBetween(20, 160) : randomBetween(-160, -20)) *
    DEGREES_TO_RADIANS;
  const distance = randomBetween(70, 170);
  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance;
  const fall = randomBetween(60, 140);
  const spin = randomBetween(-540, 540);
  const center = "translate(-50%, -50%)";

  layer.appendChild(piece);
  const animation = piece.animate(
    [
      {
        easing: "cubic-bezier(0.2, 0.8, 0.4, 1)",
        opacity: 1,
        transform: `${center} translate(0px, 0px) rotate(0deg) scale(0.6)`,
      },
      {
        easing: "cubic-bezier(0.5, 0, 0.9, 0.6)",
        offset: 0.45,
        opacity: 1,
        transform: `${center} translate(${dx}px, ${dy}px) rotate(${spin / 2}deg) scale(1)`,
      },
      {
        opacity: 0,
        transform: `${center} translate(${dx * 1.15}px, ${dy + fall}px) rotate(${spin}deg) scale(0.9)`,
      },
    ],
    { duration: randomBetween(900, 1400), fill: "forwards" }
  );
  animation.onfinish = () => piece.remove();
}

function spawnSparkle(layer: HTMLElement, x: number, y: number) {
  const size = randomBetween(18, 32);
  // The glow sits on a wrapper because clip-path on the star would cut it off.
  const sparkle = document.createElement("div");
  Object.assign(sparkle.style, {
    filter: SPARKLE_GLOW,
    height: `${size}px`,
    left: `${x}px`,
    position: "absolute",
    top: `${y}px`,
    width: `${size}px`,
  });
  const star = document.createElement("div");
  Object.assign(star.style, {
    background: pick(SPARKLE_COLORS),
    clipPath: STAR_CLIP,
    height: "100%",
    width: "100%",
  });
  sparkle.appendChild(star);

  const angle = randomBetween(0, 360) * DEGREES_TO_RADIANS;
  const distance = randomBetween(32, 84);
  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance;
  const center = "translate(-50%, -50%)";

  layer.appendChild(sparkle);
  const animation = sparkle.animate(
    [
      {
        opacity: 0,
        transform: `${center} translate(0px, 0px) scale(0) rotate(0deg)`,
      },
      {
        offset: 0.4,
        opacity: 1,
        transform: `${center} translate(${dx * 0.6}px, ${dy * 0.6}px) scale(1) rotate(90deg)`,
      },
      {
        opacity: 0,
        transform: `${center} translate(${dx}px, ${dy}px) scale(0) rotate(180deg)`,
      },
    ],
    {
      delay: randomBetween(0, 120),
      duration: randomBetween(600, 900),
      easing: "ease-out",
      fill: "both",
    }
  );
  animation.onfinish = () => sparkle.remove();
}

function burst(layer: HTMLElement, button: Element) {
  if (layer.childElementCount > MAX_LIVE_PARTICLES) {
    return;
  }

  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  const fanDown = y < ROOM_ABOVE_NEEDED;

  for (let i = 0; i < CONFETTI_PER_CLICK; i += 1) {
    spawnConfetti(layer, x, y, fanDown);
  }
  for (let i = 0; i < SPARKLES_PER_CLICK; i += 1) {
    spawnSparkle(layer, x, y);
  }
}

export default function UnicornConfetti() {
  useEffect(() => {
    const layer = createLayer();

    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) {
        return;
      }
      const button = event.target.closest(BUTTON_SELECTOR);
      if (!button?.isConnected || button.matches(DISABLED_SELECTOR)) {
        return;
      }
      if (shouldBurst()) {
        burst(layer, button);
      }
    }

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      layer.remove();
    };
  }, []);

  return null;
}
