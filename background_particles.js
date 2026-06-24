// ==========================================
// MASTERPIECE INK WASH LANDSCAPE (CHINESE NEW YEAR 2026 X RAMADHAN)
// ==========================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let time = 0;
let birds = [];
let fogs = [];
let waterRipples = [];
let lastLandscapeFrame = 0;

// Seeded random for consistent mountain generation
let seed = 12345;
function random() {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function initLandscape() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    // Init Birds
    birds = [];
    // Flock 1
    for (let i = 0; i < 8; i++) {
        birds.push({
            x: width * 0.7 + Math.random() * 300,
            y: height * 0.15 + Math.random() * 100 - 50,
            speedX: -(0.5 + Math.random() * 0.8),
            speedY: (Math.random() - 0.5) * 0.3,
            flapSpeed: 0.1 + Math.random() * 0.08,
            offset: Math.random() * Math.PI * 2,
            scale: 0.4 + Math.random() * 0.3
        });
    }

    // Init Volumetric Fog Clouds
    fogs = [];
    for (let i = 0; i < 5; i++) {
        fogs.push({
            x: Math.random() * width,
            y: height * 0.4 + Math.random() * 200, // Thicker around the mid-mountain bases
            w: 400 + Math.random() * 600,
            h: 100 + Math.random() * 150,
            speed: 0.1 + Math.random() * 0.3,
            opacity: 0.15 + Math.random() * 0.25,
            phase: Math.random() * Math.PI * 2
        });
    }

    // Init River Ripples
    waterRipples = [];
    for (let i = 0; i < 18; i++) {
        waterRipples.push({
            x: Math.random() * width,
            y: height * 0.75 + Math.random() * (height * 0.25),
            length: 50 + Math.random() * 150,
            speed: 0.2 + Math.random() * 0.5,
            opacity: Math.random() * 0.5
        });
    }
}

window.addEventListener('resize', initLandscape);

// Enhanced procedural Guilin-style peak generation
function drawTexturedMountain(points, colorHex, opacity, yOffset, scaleY) {
    ctx.save();
    ctx.globalAlpha = opacity;

    // Draw Base Shape
    ctx.fillStyle = colorHex;
    ctx.beginPath();
    const baseHorizon = height * 0.75;
    ctx.moveTo(0, baseHorizon + yOffset);

    // Generate splined path
    let pathPoints = [];
    for (let i = 0; i < points.length; i++) {
        let px = (points[i].x / 100) * width;
        let py = baseHorizon - (baseHorizon - (points[i].y / 100) * height) * scaleY + yOffset;
        pathPoints.push({ x: px, y: py });
    }

    ctx.lineTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i < pathPoints.length; i++) {
        let prev = pathPoints[i - 1];
        let curr = pathPoints[i];
        let cp1x = prev.x + (curr.x - prev.x) * 0.4;
        let cp2x = prev.x + (curr.x - prev.x) * 0.6;
        ctx.bezierCurveTo(cp1x, prev.y, cp2x, curr.y, curr.x, curr.y);
    }

    ctx.lineTo(width, baseHorizon + yOffset);
    ctx.closePath();
    ctx.fill();

    // Add Ink Wash/Watercolor layered textures (soft overlapping strokes)
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = colorHex;
    seed = 42; // reset for stable texture
    for (let i = 0; i < 15; i++) {
        ctx.globalAlpha = 0.05 + random() * 0.1;
        ctx.beginPath();
        let startX = random() * width;
        let startY = (random() * height * 0.75 * scaleY) + yOffset;
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(
            startX + 50 + random() * 100, startY - 20 - random() * 50,
            startX + 100 + random() * 150, startY - 10 - random() * 30,
            startX + 200 + random() * 200, startY + 50 + random() * 100
        );
        ctx.lineTo(startX + 200, baseHorizon + yOffset);
        ctx.lineTo(startX, baseHorizon + yOffset);
        ctx.fill();
    }

    ctx.restore();
}

function drawBoat() {
    let bx = width * 0.22;
    let by = height * 0.78;
    let bScale = width > 1000 ? 1.2 : 0.8;

    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(bScale, bScale);

    // Boat gentle rock string
    let rock = Math.sin(time * 1.5) * 1.5 * Math.PI / 180;
    let bob = Math.cos(time * 2) * 2;
    ctx.translate(0, bob);
    ctx.rotate(rock);

    // Actual Boat
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "#182025"; // Dark ink
    ctx.beginPath();
    // Hull
    ctx.moveTo(-45, 0);
    ctx.bezierCurveTo(-25, 12, 25, 12, 50, -6); // classic sampan curve
    ctx.lineTo(35, 0);
    ctx.lineTo(-35, 0);
    ctx.fill();

    // Rounded Cabin
    ctx.fillStyle = "#1c262c";
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.bezierCurveTo(-15, -18, 15, -18, 15, 0);
    ctx.fill();
    // Cabin Window
    ctx.fillStyle = "#cbe1eb";
    ctx.globalAlpha = 0.6;
    ctx.fillRect(-5, -10, 10, 6);
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "#182025";

    // Fisherman
    ctx.beginPath();
    ctx.arc(-25, -5, 3.5, 0, Math.PI * 2); // Head
    ctx.fill();
    ctx.fillRect(-27, -2, 5, 6); // Body

    // Fishing rod
    ctx.strokeStyle = "#182025";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-25, -1);
    ctx.bezierCurveTo(-40, -15, -55, -20, -65, -15);
    ctx.stroke();

    // Fishing line dropping
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-65, -15);
    ctx.lineTo(-65, 15);
    ctx.stroke();

    // Bamboo Hat
    ctx.fillStyle = "#182025";
    ctx.beginPath();
    ctx.moveTo(-32, -5);
    ctx.lineTo(-18, -5);
    ctx.lineTo(-25, -10);
    ctx.fill();

    ctx.restore();
}

function renderLandscape() {
    if (document.hidden) {
        requestAnimationFrame(renderLandscape);
        return;
    }

    const now = performance.now();
    if (now - lastLandscapeFrame < 41) {
        requestAnimationFrame(renderLandscape);
        return;
    }
    lastLandscapeFrame = now;

    ctx.clearRect(0, 0, width, height);

    // 1. Sky Gradient (Pale Blue/Grey Ink Wash)
    let skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.75);
    skyGradient.addColorStop(0, "#b8d0db");
    skyGradient.addColorStop(0.5, "#d5e2e8");
    skyGradient.addColorStop(1, "#edf3f5");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Water below 75%
    let waterGradient = ctx.createLinearGradient(0, height * 0.75, 0, height);
    waterGradient.addColorStop(0, "#edf3f5"); // Horizon white/grey
    waterGradient.addColorStop(0.3, "#c8d9e0");
    waterGradient.addColorStop(1, "#a6b9c2");
    ctx.fillStyle = waterGradient;
    ctx.fillRect(0, height * 0.75, width, height * 0.25);

    // 2. Rising Sun (Soft watercolor bleed)
    ctx.save();
    let cx = width * 0.25;
    let cy = height * 0.18;
    let cr = Math.min(width, height) * 0.08;

    // Outer glow
    let sunGlow = ctx.createRadialGradient(cx, cy, cr * 0.8, cx, cy, cr * 2);
    sunGlow.addColorStop(0, "rgba(219, 68, 38, 0.8)");
    sunGlow.addColorStop(0.4, "rgba(219, 68, 38, 0.2)");
    sunGlow.addColorStop(1, "rgba(219, 68, 38, 0)");
    ctx.fillStyle = sunGlow;
    ctx.fillRect(cx - cr * 2, cy - cr * 2, cr * 4, cr * 4);

    // Core sun
    ctx.beginPath();
    ctx.arc(cx, cy, cr * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = "#db4426"; // Deep Ink Orange/Red
    ctx.fill();
    ctx.restore();

    // 3. Guilin Mountain Peaks
    // Back Layer (Faded, Light Blue/Grey)
    const backHills = [
        { x: -10, y: 50 }, { x: 5, y: 35 }, { x: 20, y: 55 }, { x: 35, y: 30 },
        { x: 60, y: 45 }, { x: 75, y: 25 }, { x: 90, y: 50 }, { x: 110, y: 30 }
    ];
    drawTexturedMountain(backHills, "#8a9ea8", 0.4, 0, 1.0);

    // Mid Layer (More defined, taller)
    const midHills = [
        { x: -5, y: 80 }, { x: 10, y: 40 }, { x: 32, y: 75 }, { x: 50, y: 25 },
        { x: 68, y: 65 }, { x: 85, y: 20 }, { x: 105, y: 70 }
    ];
    drawTexturedMountain(midHills, "#607985", 0.6, 10, 1.1);

    // Front Layers (Dark, dramatic contrast)
    const frontPeaksLeft = [
        { x: -10, y: 95 }, { x: 0, y: 40 }, { x: 12, y: 15 }, { x: 25, y: 45 },
        { x: 38, y: 80 }, { x: 55, y: 100 }
    ];
    // Right massive peak (like in reference image)
    const frontPeaksRight = [
        { x: 65, y: 100 }, { x: 75, y: 50 }, { x: 82, y: 10 }, { x: 88, y: 35 },
        { x: 95, y: 20 }, { x: 110, y: 60 }
    ];

    drawTexturedMountain(frontPeaksLeft, "#1b2b30", 0.95, 20, 1.2);
    drawTexturedMountain(frontPeaksRight, "#162226", 0.98, 20, 1.3);

    // 4. Watercolor Dense Fog / Clouds moving through the mountains
    ctx.globalCompositeOperation = "screen";
    fogs.forEach(fog => {
        fog.x += fog.speed;
        if (fog.x > width + fog.w) fog.x = -fog.w;

        let driftY = Math.sin(time + fog.phase) * 15;

        ctx.save();
        ctx.translate(fog.x, fog.y + driftY);
        ctx.globalAlpha = fog.opacity;

        let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, fog.h);
        // Soft white/blue fog
        grad.addColorStop(0, "rgba(240, 248, 255, 1)");
        grad.addColorStop(0.5, "rgba(240, 248, 255, 0.5)");
        grad.addColorStop(1, "rgba(240, 248, 255, 0)");

        ctx.fillStyle = grad;
        // Stretch width for flat volumetric clouds
        ctx.scale(fog.w / fog.h, 1);
        ctx.beginPath();
        ctx.arc(0, 0, fog.h, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
    ctx.globalCompositeOperation = "source-over";

    // 5. Water Reflections & Ripples
    // Base mountain shadow reflection on water
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#1b2b30";
    ctx.beginPath();
    ctx.moveTo(width * 0.05, height * 0.75);
    ctx.lineTo(width * 0.35, height * 0.75);
    ctx.lineTo(width * 0.2, height);
    ctx.lineTo(0, height);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width * 0.7, height * 0.75);
    ctx.lineTo(width, height * 0.75);
    ctx.lineTo(width, height);
    ctx.lineTo(width * 0.8, height);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Moving water ripples
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineCap = "round";
    waterRipples.forEach(rip => {
        rip.x -= rip.speed; // flow left
        if (rip.x < -rip.length) {
            rip.x = width + rip.length;
            rip.y = height * 0.75 + Math.random() * (height * 0.25);
        }

        ctx.lineWidth = 1 + (rip.y - height * 0.75) * 0.01; // Thicker closer to bottom
        let currentOpacity = (Math.sin(time * 2 + rip.x * 0.01) + 1) * 0.5 * rip.opacity;

        ctx.globalAlpha = currentOpacity;
        ctx.beginPath();
        ctx.moveTo(rip.x, rip.y);
        ctx.lineTo(rip.x + rip.length, rip.y);
        ctx.stroke();
    });
    ctx.globalAlpha = 1.0;

    // 6. Detailed Boat
    drawBoat();

    // 7. Flocking Birds
    ctx.strokeStyle = "#121a1f"; // Darkest ink
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    birds.forEach(b => {
        b.x += b.speedX;
        b.y += Math.sin(time + b.offset) * 0.2 + b.speedY; // subtle bob

        if (b.x < -20) {
            b.x = width + 20;
            b.y = height * 0.15 + Math.random() * 100 - 50;
        }

        let wingY = Math.sin(time * 6 * b.flapSpeed + b.offset) * 12 * b.scale;

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.scale(b.scale, b.scale);

        ctx.beginPath();
        // V shape stroke
        ctx.moveTo(-10, -wingY * 0.8);
        ctx.quadraticCurveTo(-4, -wingY * 0.3, 0, 0);
        ctx.quadraticCurveTo(4, -wingY * 0.3, 10, -wingY * 0.8);
        ctx.stroke();

        // Slight body
        ctx.fillStyle = "#121a1f";
        ctx.beginPath();
        ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });

    time += 0.013;
    requestAnimationFrame(renderLandscape);
}

initLandscape();
renderLandscape();
