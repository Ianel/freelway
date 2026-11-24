class Progression {
    constructor(storage) {
        this.storage = storage;
        this.load();
    }

    load() {
        const saved = this.storage.load() || {};
        this.playerName = typeof saved.playerName === 'string' ? saved.playerName.slice(0, 16) : '';
        // Older saves used 0 as an already-completed departure marker.
        const completed = Array.isArray(saved.completedSteps) ? saved.completedSteps : [];
        this.completedSteps = [];
        for (const step of DATA.STEPS) {
            if (!completed.includes(step.id)) break;
            this.completedSteps.push(step.id);
        }
        this.currentStep = Math.min(this.completedSteps.length + 1, DATA.STEPS.length);
        this.scores = saved.scores && typeof saved.scores === 'object' ? saved.scores : {};
        this.rewards = DATA.STEPS.filter(s => this.isStepCompleted(s.id)).map(s => s.reward);
        this.settings = { soundEnabled: saved.settings?.soundEnabled !== false };
        this.isInChallenge = false;
    }

    init(playerName) {
        this.load();
        if (!this.playerName) this.playerName = playerName;
    }

    save() {
        this.storage.save({
            playerName: this.playerName, currentStep: this.currentStep,
            completedSteps: this.completedSteps, scores: this.scores,
            rewards: this.rewards, settings: this.settings
        });
    }

    isStepCompleted(id) { return this.completedSteps.includes(id); }
    isStepUnlocked(id) {
        return DATA.STEPS.some(s => s.id === id) && (id === 1 || this.isStepCompleted(id - 1));
    }

    completeStep(id, score) {
        if (!this.isStepUnlocked(id) || !Number.isFinite(score) || score < 70) return;
        if (!this.isStepCompleted(id)) this.completedSteps.push(id);
        this.scores[id] = Math.max(this.scores[id] || 0, Math.min(100, score));
        this.currentStep = Math.min(this.completedSteps.length + 1, DATA.STEPS.length);
        this.rewards = DATA.STEPS.filter(s => this.isStepCompleted(s.id)).map(s => s.reward);
        this.save();
    }

    getProgressPercentage() { return this.completedSteps.length / DATA.STEPS.length * 100; }
    getStepReward(id) { return DATA.STEPS.find(s => s.id === id)?.reward || null; }
    reset() { this.storage.clear(); this.load(); }
}
