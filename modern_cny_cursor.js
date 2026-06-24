/* ==========================================
   MODERN NINJA SHURIKEN CURSOR EFFECT
   Theme: Neon Steel / Smooth Motion
   ========================================== */

(function () {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
        return;
    }

    const cursorCanvas = document.createElement('canvas');
    cursorCanvas.id = 'cursor-canvas';
    cursorCanvas.style.position = 'fixed';
    cursorCanvas.style.top = '0';
    cursorCanvas.style.left = '0';
    cursorCanvas.style.width = '100%';
    cursorCanvas.style.height = '100%';
    cursorCanvas.style.pointerEvents = 'none';
    cursorCanvas.style.zIndex = '99999';
    cursorCanvas.style.transform = 'translateZ(0)';
    cursorCanvas.style.contain = 'strict';
    document.body.appendChild(cursorCanvas);

    const ctx = cursorCanvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = 1;

    const targetMouse = { x: width / 2, y: height / 2 };
    const velocity = { x: 0, y: 0 };
    const trailPoints = [];
    const sparks = [];
    const maxTrailPoints = 2;
    const movingThresholdMs = 42;
    let rotation = 0;
    let kunaiAngle = Math.PI / 2;
    let isInteractive = false;
    let cursorMode = 'idle';
    let lastMoveTime = performance.now();
    let lastFrameTime = 0;
    let lastSparkTime = 0;
    let animationFrameId = 0;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = 1;
        cursorCanvas.width = Math.floor(width * dpr);
        cursorCanvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function lerpAngle(current, target, factor) {
        const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
        return current + diff * factor;
    }

    function setCursorMode(nextMode) {
        if (cursorMode === nextMode) return;
        cursorMode = nextMode;
        document.documentElement.classList.toggle('cursor-moving', nextMode === 'moving');
    }

    function getKunaiAnchor(x, y, size, angle) {
        const tipOffsetX = Math.sin(angle) * size;
        const tipOffsetY = -Math.cos(angle) * size;
        return {
            x: x - tipOffsetX * 0.92,
            y: y - tipOffsetY * 0.92
        };
    }

    function createSpark(x, y, burstScale) {
        return {
            x,
            y,
            vx: (Math.random() - 0.5) * burstScale,
            vy: (Math.random() - 0.5) * burstScale,
            size: Math.random() * 2.3 + 0.9,
            life: 1,
            decay: Math.random() * 0.02 + 0.03,
            hue: Math.random() > 0.45 ? 48 : 190
        };
    }

    function addMoveSparks(x, y, movement) {
        const now = performance.now();
        if (movement < 18 || now - lastSparkTime < 80) return;
        const sparkCount = movement > 58 ? 1 : 0;
        for (let i = 0; i < sparkCount; i++) {
            sparks.push(createSpark(x, y, 0.95));
        }
        if (sparkCount) lastSparkTime = now;
        if (sparks.length > 4) sparks.splice(0, sparks.length - 4);
    }

    function addClickBurst(x, y) {
        for (let i = 0; i < 1; i++) {
            const spark = createSpark(x, y, 2.6);
            spark.decay = Math.random() * 0.025 + 0.04;
            spark.size = Math.random() * 1.4 + 0.8;
            sparks.push(spark);
        }
        if (sparks.length > 4) sparks.splice(0, sparks.length - 4);
    }

    function drawShuriken(x, y, size, angle, alpha, accentStrength) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = alpha;

        ctx.shadowBlur = 4.5 * accentStrength;
        ctx.shadowColor = `rgba(56, 189, 248, ${0.36 * accentStrength})`;

        ctx.fillStyle = 'rgba(203, 213, 225, 0.9)';
        ctx.strokeStyle = `rgba(125, 211, 252, ${0.9 * accentStrength})`;
        ctx.lineWidth = Math.max(1.2, size * 0.08);

        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const bladeAngle = (Math.PI / 2) * i;
            const tipX = Math.cos(bladeAngle) * size;
            const tipY = Math.sin(bladeAngle) * size;
            const leftX = Math.cos(bladeAngle - 0.55) * (size * 0.38);
            const leftY = Math.sin(bladeAngle - 0.55) * (size * 0.38);
            const rightX = Math.cos(bladeAngle + 0.55) * (size * 0.38);
            const rightY = Math.sin(bladeAngle + 0.55) * (size * 0.38);

            if (i === 0) ctx.moveTo(leftX, leftY);
            ctx.lineTo(tipX, tipY);
            ctx.lineTo(rightX, rightY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 1.8 * accentStrength;
        ctx.shadowColor = `rgba(244, 244, 245, ${0.45 * accentStrength})`;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = Math.max(1, size * 0.04);
        ctx.strokeStyle = `rgba(250, 204, 21, ${0.7 * accentStrength})`;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    function drawKunai(x, y, size, angle, alpha, accentStrength) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = alpha;

        ctx.shadowBlur = 4.5 * accentStrength;
        ctx.shadowColor = `rgba(34, 211, 238, ${0.34 * accentStrength})`;

        ctx.fillStyle = 'rgba(226, 232, 240, 0.96)';
        ctx.strokeStyle = `rgba(125, 211, 252, ${0.92 * accentStrength})`;
        ctx.lineWidth = Math.max(1.1, size * 0.08);

        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.34, -size * 0.16);
        ctx.lineTo(0, size * 0.2);
        ctx.lineTo(-size * 0.34, -size * 0.16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = `rgba(248, 250, 252, ${0.8 * accentStrength})`;
        ctx.beginPath();
        ctx.moveTo(0, size * 0.2);
        ctx.lineTo(0, size * 0.86);
        ctx.stroke();

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.beginPath();
        ctx.arc(0, size * 0.98, size * 0.18, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(250, 204, 21, ${0.78 * accentStrength})`;
        ctx.beginPath();
        ctx.arc(0, size * 0.98, size * 0.28, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    function drawIdleAura(x, y, now, interactive) {
        const pulse = (Math.sin(now * 0.006) + 1) * 0.5;
        const outerRadius = (interactive ? 15.8 : 14.2) + pulse * 1.6;
        const innerRadius = outerRadius * 0.72;

        ctx.save();
        ctx.globalAlpha = 0.22 + pulse * 0.06;
        ctx.strokeStyle = interactive ? 'rgba(250, 204, 21, 0.75)' : 'rgba(103, 232, 249, 0.72)';
        ctx.lineWidth = interactive ? 1.15 : 1;
        ctx.shadowBlur = 3;
        ctx.shadowColor = interactive ? 'rgba(250, 204, 21, 0.45)' : 'rgba(34, 211, 238, 0.42)';
        ctx.beginPath();
        ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 0.12 + pulse * 0.04;
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    function drawTrail(isMoving) {
        if (!isMoving) return;
        for (let i = 0; i < trailPoints.length; i++) {
            const point = trailPoints[i];
            const ratio = i / trailPoints.length;
            drawKunai(
                point.x,
                point.y,
                5 + ratio * 2,
                point.angle,
                0.025 + ratio * 0.07,
                0.18 + ratio * 0.1
            );
        }
    }

    function drawSparks() {
        for (let i = sparks.length - 1; i >= 0; i--) {
            const spark = sparks[i];
            spark.x += spark.vx;
            spark.y += spark.vy;
            spark.vx *= 0.985;
            spark.vy *= 0.985;
            spark.life -= spark.decay;

            if (spark.life <= 0) {
                sparks.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = spark.life;
            ctx.fillStyle = spark.hue === 48 ? 'rgba(250, 204, 21, 0.95)' : 'rgba(103, 232, 249, 0.95)';
            ctx.shadowBlur = 2;
            ctx.shadowColor = spark.hue === 48 ? 'rgba(250, 204, 21, 0.7)' : 'rgba(34, 211, 238, 0.7)';
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function scheduleAnimation() {
        if (animationFrameId) return;
        animationFrameId = requestAnimationFrame(animate);
    }

    function animate() {
        animationFrameId = 0;

        if (document.hidden) {
            return;
        }

        const now = performance.now();
        const idleFor = now - lastMoveTime;
        const speed = Math.hypot(velocity.x, velocity.y);
        const isMoving = now - lastMoveTime < movingThresholdMs || speed > 0.3;
        const maxFps = isMoving ? 48 : (sparks.length > 0 ? 24 : 12);
        const frameInterval = 1000 / maxFps;
        if (now - lastFrameTime < frameInterval) {
            scheduleAnimation();
            return;
        }
        lastFrameTime = now;

        ctx.clearRect(0, 0, width, height);

        if (isMoving) {
            rotation += 0.12 + clamp(speed * 0.008, 0, 0.3);
        } else {
            rotation += 0.035;
        }
        const targetKunaiAngle = Math.atan2(velocity.y || 0.0001, velocity.x || 0.0001) + Math.PI / 2;
        kunaiAngle = lerpAngle(kunaiAngle, targetKunaiAngle, 0.55);
        setCursorMode(isMoving ? 'moving' : 'idle');

        if (isMoving || sparks.length > 0) {
            trailPoints.unshift({
                x: targetMouse.x,
                y: targetMouse.y,
                angle: isMoving ? kunaiAngle : rotation
            });
            if (trailPoints.length > maxTrailPoints) trailPoints.length = maxTrailPoints;
        } else if (trailPoints.length) {
            trailPoints.length = 0;
        }

        if (trailPoints.length) drawTrail(isMoving);
        if (sparks.length) drawSparks();

        const idleFade = clamp((now - lastMoveTime) / 700, 0, 1);
        const idlePulse = isMoving ? 0 : ((Math.sin(now * 0.006) + 1) * 0.035);
        const mainAlpha = clamp(1 - idleFade * 0.12 + idlePulse, 0.9, 1);
        const accentStrength = isInteractive ? 1.25 : 1;
        const movingSize = isInteractive ? 17.5 : 15.5;
        const anchoredKunai = getKunaiAnchor(targetMouse.x, targetMouse.y, movingSize, kunaiAngle);

        if (isMoving) {
            drawKunai(
                anchoredKunai.x,
                anchoredKunai.y,
                movingSize,
                kunaiAngle,
                Math.min(1, mainAlpha + 0.08),
                accentStrength * 1.08
            );
        } else {
            drawIdleAura(targetMouse.x, targetMouse.y, now, isInteractive);
            drawShuriken(
                targetMouse.x,
                targetMouse.y,
                isInteractive ? 16.2 : 14.6,
                rotation,
                mainAlpha,
                accentStrength
            );
        }

        velocity.x *= 0.62;
        velocity.y *= 0.62;
        if (!isMoving && !sparks.length) {
            velocity.x = 0;
            velocity.y = 0;
            trailPoints.length = 0;
        }

        scheduleAnimation();
    }

    function updateInteractiveState(target) {
        isInteractive = Boolean(
            target && target.closest('a, button, .pointer, input, select, textarea, .btn, .switch, [role="button"]')
        );
    }

    function handlePointerUpdate(event) {
        const dx = event.clientX - targetMouse.x;
        const dy = event.clientY - targetMouse.y;
        const movement = Math.hypot(dx, dy);

        targetMouse.x = Math.round(event.clientX);
        targetMouse.y = Math.round(event.clientY);
        velocity.x = dx;
        velocity.y = dy;
        lastMoveTime = performance.now();
        updateInteractiveState(event.target);
        addMoveSparks(targetMouse.x, targetMouse.y, movement);
        scheduleAnimation();
    }

    window.addEventListener('pointermove', handlePointerUpdate, { passive: true });

    window.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        addClickBurst(event.clientX, event.clientY);
        scheduleAnimation();
    }, { passive: true });

    window.addEventListener('mouseover', (event) => {
        updateInteractiveState(event.target);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) scheduleAnimation();
    }, { passive: true });

    window.addEventListener('resize', () => {
        resize();
        scheduleAnimation();
    });
    resize();
    scheduleAnimation();

    const baseCursorSvg = encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <g transform="translate(16 16)">
                <path d="M0 -11 L3 -4 L11 0 L3 4 L0 11 L-3 4 L-11 0 L-3 -4 Z" fill="#dbe4f0" stroke="#67e8f9" stroke-width="1.2"/>
                <circle cx="0" cy="0" r="2.5" fill="#0f172a" stroke="#facc15" stroke-width="1"/>
            </g>
        </svg>
    `);

    const kunaiCursorSvg = encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
            <g transform="translate(17 17)">
                <path d="M17 3 L21 13 L17 17 L13 13 Z" fill="#e2e8f0" stroke="#67e8f9" stroke-width="1.2"/>
                <path d="M17 17 L17 27" stroke="#f8fafc" stroke-width="1.4" stroke-linecap="round"/>
                <circle cx="17" cy="28" r="2.6" fill="#0f172a" stroke="#facc15" stroke-width="1"/>
            </g>
        </svg>
    `);

    const style = document.createElement('style');
    style.innerHTML = `
        html, body {
            cursor: none !important;
        }

        a, button, .pointer, input, select, textarea, .btn, .switch, [role="button"] {
            cursor: none !important;
        }

        html.cursor-moving,
        html.cursor-moving body {
            cursor: none !important;
        }

        html.cursor-moving a,
        html.cursor-moving button,
        html.cursor-moving .pointer,
        html.cursor-moving input,
        html.cursor-moving select,
        html.cursor-moving textarea,
        html.cursor-moving .btn,
        html.cursor-moving .switch,
        html.cursor-moving [role="button"] {
            cursor: none !important;
        }
    `;
    document.head.appendChild(style);
})();
