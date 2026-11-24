class Audio {
    constructor() {
        this.enabled = CFG.audio.enabled;
        this.volume = CFG.audio.masterVolume;
        this.ctx = null;
        this.masterGain = null;
        this.init();
    }

    init() {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new Ctx();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.warn('WebAudio not available:', e);
            this.ctx = null;
        }
    }

    ensure() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    beep(freq, dur = 0.1, type = 'square', vol = 0.2) {
        if (!this.enabled || !this.ctx) return;
        this.ensure();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
        osc.connect(gain).connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + dur);
    }

    move() { this.beep(220, 0.03, 'triangle', 0.05); }
    interact() { this.beep(330, 0.08, 'square', 0.12); }
    success() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.beep(f, 0.12, 'square', 0.15), i * 110)); }
    fail() { this.beep(180, 0.2, 'sawtooth', 0.15); }
    unlock() { [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.beep(f, 0.1, 'triangle', 0.12), i * 90)); }
    complete() { [523, 659, 784, 1047, 1318].forEach((f, i) => setTimeout(() => this.beep(f, 0.12, 'square', 0.15), i * 100)); }
    win() { [523, 659, 784, 1047, 1318, 1568].forEach((f, i) => setTimeout(() => this.beep(f, 0.14, 'square', 0.18), i * 120)); }
    toast() { this.beep(440, 0.08, 'triangle', 0.1); }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}