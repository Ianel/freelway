/* ==========================================================================
   UTILS — helpers partagés par tous les modules.
   ========================================================================== */

const Utils = {
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    distance(x1, y1, x2, y2) {
        return Math.hypot(x2 - x1, y2 - y1);
    },

    degToRad(deg) {
        return deg * (Math.PI / 180);
    },

    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Distance from point to line segment
    pointToLineDist(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        if (dx === 0 && dy === 0) return this.distance(px, py, x1, y1);
        let t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
        t = Math.max(0, Math.min(1, t));
        return this.distance(px, py, x1 + t * dx, y1 + t * dy);
    },

    formatWPM(n) {
        return Math.round(n);
    },

    round(n, decimals = 1) {
        const p = Math.pow(10, decimals);
        return Math.round(n * p) / p;
    }
};