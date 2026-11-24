class Player {
    constructor(world) {
        this.world = world;
        this.x = 180;
        this.y = 1650;
        this.width = 28;
        this.height = 28;
        this.speed = CFG.player.speed;
        this.direction = { x: 0, y: 0 };
        this.facing = 'down';
        this.isMoving = false;
        this.animationTime = 0;
        this.interactionRange = CFG.player.interactionRange;
    }

    update(dt) {
        this.isMoving = false;

        if (this.world.game.controls) {
            const dx = this.world.game.controls.direction.x;
            const dy = this.world.game.controls.direction.y;

            if (dx !== 0 || dy !== 0) {
                const startX = this.x, startY = this.y;
                const deltaX = dx * this.speed * dt;
                const deltaY = dy * this.speed * dt;
                // Small swept steps prevent crossing thin obstacles, even after a slow frame.
                const segments = Math.max(1, Math.ceil(Math.max(Math.abs(deltaX), Math.abs(deltaY)) / 2));
                for (let i = 0; i < segments; i++) {
                    const nextX = this.x + deltaX / segments;
                    if (this.world.canOccupy(nextX, this.y, this.width, this.height)) this.x = nextX;
                    const nextY = this.y + deltaY / segments;
                    if (this.world.canOccupy(this.x, nextY, this.width, this.height)) this.y = nextY;
                }
                this.isMoving = Math.abs(this.x - startX) + Math.abs(this.y - startY) > 0.001;

                if (Math.abs(dx) > Math.abs(dy)) {
                    this.facing = dx > 0 ? 'right' : 'left';
                } else {
                    this.facing = dy > 0 ? 'down' : 'up';
                }

                this.direction = { x: dx, y: dy };
            }
        }

        this.animationTime += dt;
    }

    render(ctx) {
        ctx.save();
        const sprite = this.world.game.characters.get('player');
        const bob = this.isMoving ? Math.round(Math.sin(this.animationTime * 14)) * 2 : 0;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#24352d66';
        ctx.fillRect(Math.round(this.x)-2, Math.round(this.y)+26, 32, 7);
        ctx.drawImage(sprite.canvas, Math.round(this.x)-4, Math.round(this.y)-17+bob, 36, 48);
        ctx.restore();
    }

    getCenterX() {
        return this.x + this.width / 2;
    }

    getCenterY() {
        return this.y + this.height / 2;
    }
}