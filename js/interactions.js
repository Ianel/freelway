class Interactions {
    constructor(game) { this.game = game; }

    update() {
        const g = this.game;
        const step = g.world.getStepAt(g.player.getCenterX(), g.player.getCenterY(), CFG.player.interactionRange);
        g.ui.showHint(g.canMove() && !!step);
    }

    interact() {
        const g = this.game;
        if (!g.canMove()) return;
        const marker = g.world.getStepAt(g.player.getCenterX(), g.player.getCenterY(), CFG.player.interactionRange);
        if (!marker) return;
        const step = DATA.STEPS.find(s => s.id === marker.id);
        if (!g.progression.isStepUnlocked(step.id)) {
            g.ui.showDialog(step.character, 'Termine d’abord l’étape précédente pour débloquer celle-ci.');
            return;
        }
        g.ui.showDialog(step.character, step.intro, [
            { label: 'Commencer', primary: true, action: () => { g.ui.closeDialog(false); g.startChallenge(step); } },
            { label: 'Plus tard', action: () => g.ui.closeDialog(false) }
        ]);
    }
}
