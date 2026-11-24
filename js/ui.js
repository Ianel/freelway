class UI {
    constructor(game, canvas) {
        this.game = game;
        this.canvas = canvas;

        // Dialog elements
        this.dialog = document.getElementById('dialog');
        this.dialogAvatar = document.getElementById('dialog-avatar');
        this.dialogAvatarCtx = this.dialogAvatar ? this.dialogAvatar.getContext('2d') : null;
        this.dialogName = document.getElementById('dialog-name');
        this.dialogRole = document.getElementById('dialog-role');
        this.dialogText = document.getElementById('dialog-text');
        this.dialogActions = document.getElementById('dialog-actions');

        // Challenge elements
        this.challenge = document.getElementById('challenge');
        this.challengeStep = document.getElementById('challenge-step');
        this.challengeTitle = document.getElementById('challenge-title');
        this.challengeBody = document.getElementById('challenge-body');
        this.challengeMsg = document.getElementById('challenge-msg');
        this.challengeSubmit = document.getElementById('challenge-submit');
        this.challengeQuit = document.getElementById('challenge-quit');

        // HUD elements
        this.hudName = document.getElementById('hud-name');
        this.hudStep = document.getElementById('hud-step');
        this.hudFill = document.getElementById('hud-fill');
        this.hudGoal = document.getElementById('hud-goal');
        this.hint = document.getElementById('hint');

        // Overlays
        this.pause = document.getElementById('pause');
        this.progressPanel = document.getElementById('progressPanel');
        this.progressList = document.getElementById('progress-list');
        this.toast = document.getElementById('toast');

        this.isInChallenge = false;
        this.dialogOpen = false;
        this.onInteractionComplete = null;
        this.validateCallback = null;
        this.currentStep = null;
        this.onChallengeComplete = null;

        // Hide UI panels initially
        if (this.dialog) this.dialog.classList.add('hidden');
        if (this.challenge) this.challenge.classList.add('hidden');
        if (this.pause) this.pause.classList.add('hidden');
        if (this.progressPanel) this.progressPanel.classList.add('hidden');
        if (this.toast) this.toast.classList.add('hidden');

        // Challenge submit button
        if (this.challengeSubmit) {
            this.challengeSubmit.addEventListener('click', () => {
                if (typeof this.validateCallback === 'function') {
                    this.validateCallback();
                }
            });
        }

        // Challenge quit button
        if (this.challengeQuit) {
            this.challengeQuit.addEventListener('click', () => this.closeChallenge());
        }
    }

    /* ============ Dialog ============ */
    showDialog(characterId, text, options, onComplete) {
        if (!this.dialog) return;

        const def = this.game.characters ? this.game.characters.get(characterId) : null;
        if (def && this.dialogName) this.dialogName.textContent = def.def.name;
        if (def && this.dialogRole) this.dialogRole.textContent = def.def.title;
        if (this.dialogText) this.dialogText.textContent = text;

        if (!def) {
            if (this.dialogName) this.dialogName.textContent = '';
            if (this.dialogRole) this.dialogRole.textContent = '';
        }
        this.game.controls.reset();
        // Draw avatar
        if (def && this.dialogAvatarCtx && def.canvas) {
            this.dialogAvatarCtx.imageSmoothingEnabled = false;
            this.dialogAvatarCtx.clearRect(0, 0, 64, 64);
            this.dialogAvatarCtx.drawImage(def.canvas, 0, 0, 64, 64);
        }

        // Build action buttons
        this.dialogActions.innerHTML = '';
        const btns = options || [{ label: 'Continuer', primary: true }];
        btns.forEach(opt => {
            const b = document.createElement('button');
            b.className = 'btn' + (opt.primary ? ' btn-primary' : '');
            b.textContent = opt.label;
            b.addEventListener('click', () => {
                if (opt.action) opt.action();
                else this.closeDialog();
            });
            this.dialogActions.appendChild(b);
        });

        this.dialog.classList.remove('hidden');
        this.dialogOpen = true;
        this.onInteractionComplete = onComplete;
        if (this.game.audio) this.game.audio.interact();
    }

    closeDialog(complete = true) {
        if (this.dialog) this.dialog.classList.add('hidden');
        this.dialogOpen = false;
        const cb = this.onInteractionComplete;
        this.onInteractionComplete = null;
        if (complete && cb) cb();
    }

    /* ============ Challenge ============ */
    showChallenge(step, onComplete) {
        if (!this.challenge) return;

        this.currentStep = step;
        this.onChallengeComplete = onComplete;

        if (this.challengeStep) this.challengeStep.textContent = `Étape ${step.id}/15`;
        if (this.challengeTitle) this.challengeTitle.textContent = step.name;
        if (this.challengeBody) this.challengeBody.innerHTML = '';
        if (this.challengeMsg) this.challengeMsg.textContent = '';

        this.challenge.classList.remove('hidden');
        this.isInChallenge = true;
        if (this.game.progression) this.game.progression.isInChallenge = true;
    }

    setChallengeMessage(msg, isError = true) {
        if (this.challengeMsg) {
            this.challengeMsg.textContent = msg;
            this.challengeMsg.style.color = isError ? '#ff9591' : '#7ee08a';
        }
    }

    closeChallenge() {
        if (this.game.challenges) this.game.challenges.cancel();
        if (this.challenge) this.challenge.classList.add('hidden');
        this.isInChallenge = false;
        if (this.game.progression) this.game.progression.isInChallenge = false;
        this.validateCallback = null;
        this.currentStep = null;
        this.onChallengeComplete = null;
    }

    /* ============ HUD ============ */
    updateHud() {
        if (!this.game.progression) return;

        const total = DATA.progression.totalSteps;
        const completed = this.game.progression.completedSteps.length;
        const currentStepId = Math.min(this.game.progression.currentStep - 1, total - 1);

        if (this.hudName) this.hudName.textContent = this.game.progression.playerName || 'Freelance';
        if (this.hudStep) this.hudStep.textContent = `Étape ${Math.min(this.game.progression.currentStep, total)}/${total}`;
        if (this.hudFill) this.hudFill.style.width = `${(completed / total) * 100}%`;

        const stepData = DATA.STEPS[currentStepId];
        if (this.hudGoal && stepData) this.hudGoal.textContent = `Objectif : ${stepData.name}`;
    }

    showHint(show) {
        if (!this.hint) return;
        if (show) this.hint.classList.remove('hidden');
        else this.hint.classList.add('hidden');
    }

    /* ============ Toast ============ */
    showToast(message, duration = 2200) {
        if (!this.toast) return;
        this.toast.textContent = message;
        this.toast.classList.remove('hidden');
        if (this.game.audio) this.game.audio.toast();
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => this.toast.classList.add('hidden'), duration);
    }

    /* ============ Pause / Progress panel ============ */
    showPause(show) {
        if (show) this.pause.classList.remove('hidden');
        else this.pause.classList.add('hidden');
    }

    showProgress() {
        const total = DATA.progression.totalSteps;
        let html = '';
        DATA.STEPS.forEach(s => {
            const done = this.game.progression.completedSteps.includes(s.id);
            const unlocked = this.game.progression.isStepUnlocked(s.id);
            const icon = done ? '✓' : (unlocked ? '●' : '🔒');
            const cls = done ? 'done' : (unlocked ? 'unlocked' : 'locked');
            html += `<div class="progress-row ${cls}"><span class="pr-num">${s.id}</span><span class="pr-icon">${icon}</span><span class="pr-name">${s.name}</span></div>`;
        });
        if (this.progressList) this.progressList.innerHTML = html;
        if (this.progressPanel) this.progressPanel.classList.remove('hidden');
    }

    hideProgress() {
        if (this.progressPanel) this.progressPanel.classList.add('hidden');
    }

    /* ============ Empty render (placeholder for loop) ============ */
    render() {
        // No canvas rendering needed - UI elements are HTML
    }

    update() {
        // No update logic needed
    }
}