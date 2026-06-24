
// Fireworks Effect for Chinese New Year (Red & Gold Theme)
const fwCanvas = document.getElementById('fireworks-canvas');
const fwCtx = fwCanvas.getContext('2d');

let fwWidth, fwHeight;
let fireworks = [];
let particles = [];
let lastLaunchTime = 0;
const FIREWORK_LAUNCH_INTERVAL = 1450;
let lastFireworksFrame = 0;

function initFireworks() {
    fwWidth = fwCanvas.width = window.innerWidth;
    fwHeight = fwCanvas.height = window.innerHeight;
}

window.addEventListener('resize', initFireworks);

// Utility: Random in range
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Utility: Calculate distance
function calculateDistance(p1x, p1y, p2x, p2y) {
    return Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2));
}

class Firework {
    constructor(sx, sy, tx, ty) {
        this.x = sx;
        this.y = sy;
        this.sx = sx;
        this.sy = sy;
        this.tx = tx;
        this.ty = ty;
        this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(ty - sy, tx - sx);
        this.speed = 1.45;
        this.acceleration = 1.03;
        this.brightness = random(50, 70);
        this.targetRadius = 1;

        // Color selection: Mostly Red (0 or 360), some Gold (40-50)
        // 70% Red, 30% Gold
        if (Math.random() < 0.7) {
            // RED: Hue 0 or 360
            this.hue = Math.random() < 0.5 ? 0 : 360;
            // Slight variation
            this.hue += random(-10, 10);
        } else {
            // GOLD: Hue 40-50
            this.hue = random(40, 50);
        }
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.speed *= this.acceleration;
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;

        this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

        if (this.distanceTraveled >= this.distanceToTarget) {
            // Create explosion
            createParticles(this.tx, this.ty, this.hue);
            fireworks.splice(index, 1);
        } else {
            this.x += vx;
            this.y += vy;
        }
    }

    draw() {
        fwCtx.beginPath();
        fwCtx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        fwCtx.lineTo(this.x, this.y);
        fwCtx.strokeStyle = 'hsl(' + this.hue + ', 100%, ' + this.brightness + '%)';
        fwCtx.stroke();
    }
}

class Particle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = random(0, Math.PI * 2);
        this.speed = random(0.8, 7.5);
        this.friction = 0.965;
        this.gravity = 1;
        this.hue = hue + random(-20, 20); // Variation
        this.brightness = random(50, 80);
        this.alpha = 1;
        this.decay = random(0.009, 0.018);

        // Sparkle effect
        this.sparkle = Math.random() < 0.3; // 30% chance to sparkle
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;

        // Sparkle flicker
        if (this.sparkle) {
            this.brightness = random(50, 100);
        }

        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }

    draw() {
        fwCtx.beginPath();
        fwCtx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        fwCtx.lineTo(this.x, this.y);
        fwCtx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
        fwCtx.stroke();
    }
}

function createParticles(x, y, baseHue) {
    let particleCount = 26;
    while (particleCount--) {
        particles.push(new Particle(x, y, baseHue));
    }
}

function loop() {
    requestAnimationFrame(loop);
    if (document.hidden) return;

    const perfNow = performance.now();
    if (perfNow - lastFireworksFrame < 41) return;
    lastFireworksFrame = perfNow;

    const now = Date.now();

    // Trails effect
    fwCtx.globalCompositeOperation = 'destination-out';
    fwCtx.fillStyle = 'rgba(0, 0, 0, 0.58)';
    fwCtx.fillRect(0, 0, fwWidth, fwHeight);
    fwCtx.globalCompositeOperation = 'lighter';

    let i = fireworks.length;
    while (i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }

    let j = particles.length;
    while (j--) {
        particles[j].draw();
        particles[j].update(j);
    }

    // Launch lebih santai agar animasi tidak terlalu cepat
    if (now - lastLaunchTime >= FIREWORK_LAUNCH_INTERVAL && Math.random() < 0.42 && particles.length < 120) {
        lastLaunchTime = now;
        // Launch from bottom, aim for top half
        fireworks.push(new Firework(
            random(0, fwWidth), // Start X
            fwHeight,           // Start Y
            random(fwWidth * 0.2, fwWidth * 0.8), // Target X (Center focused)
            random(fwHeight * 0.1, fwHeight * 0.5) // Target Y (Upper Half)
        ));
    }
}

// Initial launch
setTimeout(() => {
    initFireworks();
    loop();
}, 500);
