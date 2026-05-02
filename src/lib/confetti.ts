/**
 * Lightweight confetti effect — no external library needed.
 * Shoots coloured particles from the bottom-centre of the screen.
 */

const COLORS = [
  "hsl(4, 78%, 65%)",   // coral
  "hsl(42, 95%, 62%)",  // sun
  "hsl(158, 55%, 60%)", // mint
  "hsl(210, 80%, 65%)", // sky
  "hsl(260, 55%, 68%)", // violet
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: "rect" | "circle";
}

export function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;
  const particles: Particle[] = [];
  const count = 120;
  const cx = canvas.width / 2;
  const cy = canvas.height;

  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * Math.PI) / 1.5 + Math.PI / 6; // spread upward
    const speed = 8 + Math.random() * 12;
    particles.push({
      x: cx + (Math.random() - 0.5) * 80,
      y: cy,
      vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
      vy: -Math.sin(angle) * speed,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 6,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      opacity: 1,
      shape: Math.random() > 0.4 ? "rect" : "circle",
    });
  }

  let frame: number;
  const gravity = 0.4;
  const drag = 0.98;

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (const p of particles) {
      p.vy += gravity;
      p.vx *= drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      if (p.y < canvas.height + 20) {
        p.opacity = Math.max(0, p.opacity - 0.008);
        alive = true;
      } else {
        p.opacity = 0;
      }

      if (p.opacity <= 0) continue;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }

      ctx.restore();
    }

    if (alive) {
      frame = requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  }

  frame = requestAnimationFrame(tick);

  // Safety cleanup after 6s
  setTimeout(() => {
    cancelAnimationFrame(frame);
    canvas.remove();
  }, 6000);
}
