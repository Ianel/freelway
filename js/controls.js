class Controls {
    constructor(player) {
        this.player = player;
        this.game = player.world.game;
        this.keys = new Set();
        this.direction = { x: 0, y: 0 };
        this.touchDirection = { x: 0, y: 0 };
        this.isTouchDevice = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
        const map = { ArrowUp: 'up', z: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', q: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
        window.addEventListener('keydown', e => {
            const editing = e.target.closest?.('input, textarea, select, [contenteditable="true"]');
            if (e.key === 'Escape') {
                if (this.game.screen === 'play' || this.game.helpOpen || this.game.mapOpen) { e.preventDefault(); this.game.escape(); }
                return;
            }
            if (editing || !this.game.canMove()) return;
            const key = map[e.key] || map[e.key.toLowerCase()];
            if (key) { e.preventDefault(); this.keys.add(key); }
            if (['e', ' ', 'enter'].includes(e.key.toLowerCase()) && !e.repeat && (e.key.toLowerCase() === 'e' || e.target.tagName !== 'BUTTON')) {
                e.preventDefault(); this.game.handleInteraction();
            }
        });
        window.addEventListener('keyup', e => this.keys.delete(map[e.key] || map[e.key.toLowerCase()]));
        window.addEventListener('blur', () => this.reset());
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) { this.reset(); if (this.game.canMove()) this.game.setPaused(true); }
        });
        this.initTouch();
    }

    initTouch() {
        this.touchUI = document.getElementById('touch-ui');
        const stick = document.getElementById('stick');
        const knob = document.getElementById('stick-knob');
        let pointer = null;
        const move = e => {
            if (e.pointerId !== pointer) return;
            const rect = stick.getBoundingClientRect();
            let x = e.clientX - rect.left - rect.width / 2;
            let y = e.clientY - rect.top - rect.height / 2;
            const length = Math.hypot(x, y);
            if (length > 35) { x *= 35 / length; y *= 35 / length; }
            this.touchDirection = { x: x / 35, y: y / 35 };
            knob.style.transform = `translate(${x}px, ${y}px)`;
        };
        stick.addEventListener('pointerdown', e => {
            if (!this.game.canMove() || pointer !== null) return;
            e.preventDefault(); pointer = e.pointerId; stick.setPointerCapture(pointer); move(e);
        });
        stick.addEventListener('pointermove', move);
        const end = e => {
            if (e.pointerId !== pointer) return;
            pointer = null; this.touchDirection = { x: 0, y: 0 }; knob.style.transform = '';
        };
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => stick.addEventListener(type, end));
        document.getElementById('btn-action').addEventListener('click', () => this.game.handleInteraction());
    }

    reset() {
        this.keys.clear(); this.touchDirection = { x: 0, y: 0 }; this.direction = { x: 0, y: 0 };
        document.getElementById('stick-knob').style.transform = '';
    }

    update() {
        if (!this.game.canMove()) { this.reset(); this.touchUI.classList.add('hidden'); return; }
        this.touchUI.classList.toggle('hidden', !this.isTouchDevice);
        let x = Number(this.keys.has('right')) - Number(this.keys.has('left')) + this.touchDirection.x;
        let y = Number(this.keys.has('down')) - Number(this.keys.has('up')) + this.touchDirection.y;
        const length = Math.hypot(x, y);
        if (length > 1) { x /= length; y /= length; }
        this.direction = { x, y };
    }
}
