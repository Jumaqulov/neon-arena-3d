/**
 * Home-only CSS that Tailwind classes can't express cleanly:
 *  - CSS intro keyframes (run from first paint, no JS; only under no-preference motion)
 *  - the two JS-enabled layout modes, toggled by a data attribute from inside
 *    gsap.matchMedia(MQ.desktop) so SSR / reduced motion / mobile keep the static layouts:
 *      .na-zones[data-ring]  → 3D ring carousel (pinned)
 *      .na-games[data-h]     → horizontal 3D gallery (pinned)
 * These rules are unlayered, so they win over Tailwind utilities (which live in @layer).
 * React 19 hoists and de-duplicates this <style> (href + precedence).
 */
const CSS = `
@keyframes na-char-in{0%{opacity:0;transform:perspective(640px) translate3d(0,.5em,0) rotateX(-96deg)}100%{opacity:1;transform:perspective(640px) translate3d(0,0,0) rotateX(0deg)}}
@keyframes na-fade-up{0%{opacity:0;translate:0 28px}100%{opacity:1;translate:0 0}}
@keyframes na-spin{to{rotate:360deg}}
@media (prefers-reduced-motion: no-preference){
  .na-char-in{animation:na-char-in 1.15s cubic-bezier(.16,1,.3,1) both}
  .na-fade-up{animation:na-fade-up 1s cubic-bezier(.16,1,.3,1) both}
  .na-spin-slow{animation:na-spin 40s linear infinite}
}

/* ---------- Zones: 3D ring carousel ---------- */
.na-zones-nav{display:none}
.na-zones[data-ring] .na-zones-pin{height:100svh;display:flex;flex-direction:column;gap:20px;padding-top:calc(var(--header-h) + 28px);padding-bottom:20px}
.na-zones[data-ring] .na-zones-stage{position:relative;flex:1 1 auto;min-height:0;margin-top:0;perspective:1900px;perspective-origin:50% 40%}
.na-zones[data-ring] .na-zones-fit{position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d}
.na-zones[data-ring] .na-zones-ring{display:block;position:absolute;left:0;top:0;width:0;height:0;margin:0;padding:0;transform-style:preserve-3d}
.na-zones[data-ring] .na-zones-ring::before,
.na-zones[data-ring] .na-zones-ring::after{content:"";position:absolute;border-radius:50%;pointer-events:none}
.na-zones[data-ring] .na-zones-ring::after{left:-500px;top:-228px;width:1000px;height:1000px;border:1px dashed rgba(196,248,42,.38);transform:rotateX(90deg)}
.na-zones[data-ring] .na-zones-ring::before{left:-380px;top:-108px;width:760px;height:760px;border:1px solid rgba(196,248,42,.22);box-shadow:0 0 60px rgba(196,248,42,.10),inset 0 0 60px rgba(196,248,42,.10);transform:rotateX(90deg)}
.na-zones[data-ring] .na-zone-card{position:absolute;left:-160px;top:0;width:320px;transform:translateY(-50%) rotateY(calc(var(--i) * 60deg)) translateZ(440px);backface-visibility:hidden;-webkit-backface-visibility:hidden}
.na-zones[data-ring] .na-zones-nav{display:flex}
.na-zones[data-ring] .na-zones-after{padding-top:72px}

/* ---------- Games: static tilted shelf (md+, no JS needed) ---------- */
@media (min-width:768px){
  .na-games .na-games-viewport{perspective:1800px;perspective-origin:50% 10%}
  .na-games .na-games-shelf{transform-style:preserve-3d;transform:rotateX(9deg) rotateY(-7deg)}
  .na-games .na-games-track,.na-games .na-game-card,.na-games .na-game-card > a,.na-games .game-3d{transform-style:preserve-3d}
}

/* ---------- Games: pinned horizontal 3D gallery (card width is mirrored in content.ts GAME_COVER_SIZES) ---------- */
.na-games-hud{display:none}
.na-games[data-h] .na-games-pin{height:100svh;display:flex;flex-direction:column;padding-top:calc(var(--header-h) + 28px);padding-bottom:24px}
.na-games[data-h] .na-games-viewport{flex:1 1 auto;min-height:0;max-width:none;margin:0;padding:0;overflow:clip;perspective:1500px;perspective-origin:50% 42%;display:flex;align-items:center}
.na-games[data-h] .na-games-shelf{width:100%;transform-style:preserve-3d;transform:rotateX(7deg) rotateY(8deg)}
.na-games[data-h] .na-games-track{position:relative;display:flex;flex-wrap:nowrap;width:max-content;gap:36px;margin:0;overflow:visible;scroll-snap-type:none;padding:24px max(var(--page-gutter), calc((100vw - 1440px) / 2 + var(--page-gutter)))}
.na-games[data-h] .na-games-track::after{content:"";position:absolute;left:0;right:0;top:calc(100% - 40px);height:520px;pointer-events:none;transform-origin:50% 0;transform:translateZ(-260px) rotateX(90deg);background-image:repeating-linear-gradient(0deg,rgba(196,248,42,.2) 0 1px,transparent 1px 60px),repeating-linear-gradient(90deg,rgba(196,248,42,.2) 0 1px,transparent 1px 60px);-webkit-mask-image:linear-gradient(180deg,transparent,#000 35%,#000 65%,transparent);mask-image:linear-gradient(180deg,transparent,#000 35%,#000 65%,transparent)}
.na-games[data-h] .na-game-card{width:clamp(220px,min(20vw,34svh),320px);max-width:none;flex:none}
.na-games[data-h] .na-game-cover{height:auto;aspect-ratio:4/5}
.na-games[data-h] .na-games-hud{display:flex}
`;

export default function HomeStyles() {
  return (
    <style href="neon-arena-home" precedence="medium">
      {CSS}
    </style>
  );
}
