class FreelanceGame {
    constructor() {
        this.canvas = document.getElementById('cv');
        this.ctx = this.canvas.getContext('2d');
        this.storage = new Storage();
        this.progression = new Progression(this.storage);
        this.characters = new Characters();
        this.audio = new Audio();
        this.audio.enabled = this.progression.settings.soundEnabled;
        this.ui = new UI(this, this.canvas);
        this.world = new World(this);
        this.player = new Player(this.world);
        this.world.setPlayer(this.player);
        this.controls = new Controls(this.player);
        this.challenges = new Challenges(this.ui, this.progression);
        this.challenges.setSteps(DATA.STEPS);
        this.interactions = new Interactions(this);
        this.isRunning = false;
        this.paused = false;
        this.helpOpen = false;
        this.setupMenu();
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
        this.showMenu();
        this.setupOffline();
    }

    handleResize() {
        this.width = document.getElementById('app').clientWidth;
        this.height = document.getElementById('app').clientHeight;
        const ratio = window.devicePixelRatio || 1;
        this.canvas.width = Math.round(this.width * ratio);
        this.canvas.height = Math.round(this.height * ratio);
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        this.ctx.imageSmoothingEnabled = false;
        if (this.world && this.player) { this.world.update(0, true); this.render(); }
    }

    setScreen(name) {
        document.querySelectorAll('.screen').forEach(el => {
            const active = el.id === name;
            el.classList.toggle('hidden', !active);
            el.classList.toggle('active', active);
        });
        this.screen = name;
        this.helpOpen = false;
        this.controls.reset();
        this.closeMap();
    }

    showMenu() {
        this.stopLoop();
        this.challenges.cancel();
        this.ui.closeChallenge();
        this.ui.closeDialog(false);
        this.ui.showPause(false);
        this.ui.hideProgress();
        this.paused = false;
        this.setScreen('menu');
        const hasSave = !!this.progression.playerName;
        document.getElementById('btn-continue').disabled = !hasSave;
        const summary = document.getElementById('menu-save');
        summary.classList.toggle('hidden', !hasSave);
        summary.textContent = hasSave ? `${this.progression.playerName} · ${this.progression.completedSteps.length}/15 étapes terminées` : '';
        this.updateSoundButton();
    }

    showNameEntry() {
        this.setScreen('namebox');
        document.getElementById('name-input').value = '';
        document.getElementById('name-input').focus();
    }

    startGame() {
        this.progression.load();
        if (!this.progression.playerName) { this.showNameEntry(); return; }
        if (this.progression.completedSteps.length === DATA.STEPS.length) { this.showEndScreen(); return; }
        this.setScreen('play');
        this.paused = false;
        const step = this.world.steps.find(s => s.id === this.progression.currentStep);
        this.player.x = step.x;
        this.player.y = step.y;
        this.ui.updateHud();
        this.world.update(0, true);
        this.audio.ensure();
        this.startLoop();
    }

    canMove() {
        if (this.mapOpen) return false;
        return this.screen === 'play' && !this.paused && !this.helpOpen && !this.ui.dialogOpen && !this.ui.isInChallenge;
    }

    startLoop() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.frame = requestAnimationFrame(now => this.loop(now));
    }
    stopLoop() { this.isRunning = false; cancelAnimationFrame(this.frame); }
    loop(now) {
        if (!this.isRunning) return;
        const dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;
        this.controls.update();
        if (this.canMove()) this.player.update(dt);
        this.world.update(dt);
        this.interactions.update();
        this.render();
        this.frame = requestAnimationFrame(time => this.loop(time));
    }
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.save();
        this.ctx.translate(-this.world.camera.x, -this.world.camera.y);
        this.world.render(this.ctx);
        this.player.render(this.ctx);
        this.ctx.restore();
    }

    setupMenu() {
        const on = (id, fn) => document.getElementById(id).addEventListener('click', fn);
        const newGame = () => {
            const begin = () => this.showNameEntry();
            if (this.progression.playerName) this.showConfirm('Nouvelle partie', 'Ta progression sera remplacée après le choix du prénom. Continuer ?', begin);
            else begin();
        };
        on('btn-new', newGame);
        on('btn-continue', () => this.startGame());
        on('btn-reset', () => this.showConfirm('Réinitialiser', 'Supprimer toute la progression ?', () => {
            this.progression.reset(); this.showMenu();
        }));
        const showMap = () => { this.mapOpen = true; this.controls.reset(); document.getElementById('route-map').classList.remove('hidden'); document.getElementById('map-close').focus(); };
        on('btn-map', showMap);
        on('pause-map', showMap);
        on('map-close', () => this.closeMap());
        on('btn-howto', () => this.showHelp());
        on('howto-close', () => this.closeHelp());
        on('name-cancel', () => this.showMenu());
        on('name-ok', () => {
            const name = document.getElementById('name-input').value.trim() || 'Freelance';
            this.progression.reset();
            this.progression.playerName = name;
            this.progression.settings.soundEnabled = this.audio.enabled;
            this.progression.save();
            this.startGame();
        });
        document.getElementById('name-input').addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('name-ok').click();
        });
        on('btn-sound', () => {
            this.audio.toggle(); this.audio.ensure();
            this.progression.settings.soundEnabled = this.audio.enabled;
            this.progression.save(); this.updateSoundButton();
        });
        on('btn-pause', () => { if (this.canMove()) this.setPaused(true); });
        on('pause-resume', () => this.setPaused(false));
        on('pause-progress', () => this.ui.showProgress());
        on('progress-close', () => this.ui.hideProgress());
        on('pause-howto', () => this.showHelp());
        on('pause-menu', () => this.showMenu());
        on('btn-end-menu', () => this.showMenu());
        on('btn-go', newGame);
        on('confirm-yes', () => {
            const action = this.confirmAction; this.closeConfirm(); if (action) action();
        });
        on('confirm-no', () => this.closeConfirm());
    }

    updateSoundButton() {
        const button = document.getElementById('btn-sound');
        button.textContent = this.audio.enabled ? '🔊 Son' : '🔇 Son';
        button.setAttribute('aria-pressed', String(this.audio.enabled));
    }
    showConfirm(title, text, action) {
        this.confirmAction = action;
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-text').textContent = text;
        document.getElementById('confirm').classList.remove('hidden');
        document.getElementById('confirm').classList.add('active');
    }
    closeConfirm() {
        document.getElementById('confirm').classList.add('hidden');
        document.getElementById('confirm').classList.remove('active');
        this.confirmAction = null;
    }
    showHelp() {
        this.helpOpen = true; this.controls.reset();
        document.getElementById('howto').classList.remove('hidden');
        document.getElementById('howto').classList.add('active');
    }
    closeHelp() {
        this.helpOpen = false;
        document.getElementById('howto').classList.add('hidden');
        document.getElementById('howto').classList.remove('active');
    }
    setPaused(paused) {
        this.paused = paused; this.controls.reset(); this.ui.showPause(paused);
        if (!paused) this.ui.hideProgress();
    }
    closeMap() { this.mapOpen = false; document.getElementById('route-map').classList.add('hidden'); }
    escape() {
        if (this.mapOpen) { this.closeMap(); return; }
        if (document.getElementById('confirm').classList.contains('active')) this.closeConfirm();
        else if (this.helpOpen) this.closeHelp();
        else if (this.ui.isInChallenge) this.ui.closeChallenge();
        else if (this.ui.dialogOpen) this.ui.closeDialog(false);
        else if (!this.ui.progressPanel.classList.contains('hidden')) this.ui.hideProgress();
        else if (this.screen === 'play') this.setPaused(!this.paused);
    }
    handleInteraction() { this.interactions.interact(); }
    startChallenge(step) {
        if (!this.progression.isStepUnlocked(step.id)) return;
        this.controls.reset();
        this.challenges.run(step, () => {
            this.audio.success();
            this.ui.showDialog(step.character, step.congrats, null, () => {
                if (this.progression.completedSteps.length === DATA.STEPS.length) this.showEndScreen();
                else this.ui.showToast(`Débloqué : ${DATA.STEPS[this.progression.currentStep - 1].name}`);
            });
        });
    }

    showEndScreen() {
        this.stopLoop(); this.setScreen('end');
        document.getElementById('end-stats').innerHTML = `
            <div class="stat"><span>Étapes terminées</span><strong>${this.progression.completedSteps.length}/15</strong></div>
            <div class="stat"><span>Récompenses</span><strong>${this.progression.rewards.length}</strong></div>
            <div class="stat"><span>Progression</span><strong>${Math.round(this.progression.getProgressPercentage())}%</strong></div>`;
        this.audio.win(); this.startConfetti();
    }
    startConfetti() {
        const canvas = document.getElementById('confetti');
        canvas.width = this.width; canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        const particles = Array.from({ length: 80 }, () => ({ x: Math.random() * this.width, y: Math.random() * this.height, speed: 40 + Math.random() * 100, color: ['#e74c3c', '#16a085', '#f7c948'][Math.floor(Math.random() * 3)] }));
        let last = performance.now();
        const draw = now => {
            if (this.screen !== 'end') return;
            const dt = Math.min((now - last) / 1000, 0.05); last = now;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const p of particles) { p.y = (p.y + p.speed * dt) % canvas.height; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 6, 6); }
            this.confettiFrame = requestAnimationFrame(draw);
        };
        cancelAnimationFrame(this.confettiFrame);
        this.confettiFrame = requestAnimationFrame(draw);
    }
    setupOffline() {
        const status = () => { document.getElementById('offline-badge').hidden = navigator.onLine; };
        window.addEventListener('online', status); window.addEventListener('offline', status); status();
        if ('serviceWorker' in navigator && window.isSecureContext) {
            navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Mode hors ligne indisponible :', error));
        }
    }
}
window.addEventListener('load', () => { window.game = new FreelanceGame(); });
