class World {
    constructor(game) {
        this.game = game;
        this.worldWidth = 2400;
        this.worldHeight = 1800;
        this.camera = { x: 0, y: 0 };
        this.steps = DATA.STEPS.map((step, i) => ({ ...step, x: [180,400,700,1050,1350,1500,1250,900,400,300,650,950,1250,1550,1900][i], y: [1650,1550,1480,1520,1400,1100,900,850,950,650,550,600,520,350,300][i] }));
        this.obstacles = [];
        this.buildTerrain();
    }
    setPlayer(player) { this.player = player; }
    update(dt, snap = false) {
        for (const step of this.steps) {
            step.completed = this.game.progression.isStepCompleted(step.id);
            step.active = this.game.progression.isStepUnlocked(step.id);
        }
        if (!this.player) return;
        const x = Utils.clamp(this.player.getCenterX() - this.game.width / 2, 0, Math.max(0, this.worldWidth - this.game.width));
        const y = Utils.clamp(this.player.getCenterY() - this.game.height / 2, 0, Math.max(0, this.worldHeight - this.game.height));
        const blend = snap ? 1 : 1 - Math.pow(1 - CFG.camera.lerp, dt * 60);
        this.camera.x = Utils.lerp(this.camera.x, x, blend);
        this.camera.y = Utils.lerp(this.camera.y, y, blend);
    }
    buildTerrain() {
        // Paint once at native pixel resolution, then enlarge without smoothing.
        this.terrain = document.createElement('canvas');
        this.terrain.width = 800; this.terrain.height = 600;
        const c = this.terrain.getContext('2d');
        c.fillStyle = '#4b9650'; c.fillRect(0, 0, 800, 600);
        let seed = 47;
        const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
        for (let i = 0; i < 14000; i++) {
            c.fillStyle = ['#559f53','#45894b','#63a65a','#397d46'][i % 4];
            c.fillRect(Math.floor(random()*800), Math.floor(random()*600), i%3+1, 2);
        }
        // River flowing across the southern part of the map.
        const river = (p = c) => { p.beginPath(); p.moveTo(-20,405); p.bezierCurveTo(180,390,230,455,410,434); p.bezierCurveTo(580,410,600,505,830,480); };
        river(); c.strokeStyle='#346e56'; c.lineWidth=44; c.stroke();
        river(); c.strokeStyle='#7fc9ac'; c.lineWidth=36; c.stroke();
        river(); c.strokeStyle='#408fc0'; c.lineWidth=30; c.stroke();
        for(let i=0;i<200;i++) {
            const x=random()*800, y=405+Math.sin(x/130)*16+x*.085;
            c.fillStyle=i%2?'#71c8df':'#a5dde2'; c.fillRect(x,y,4+random()*9,1);
        }
        // Connected trail with a dark bank and a warm sandy centre.
        const trail = (p = c) => {
            p.beginPath(); p.moveTo(20,600);
            p.lineTo(this.steps[0].x/3,this.steps[0].y/3);
            for(let i=1;i<this.steps.length;i++) {
                const a=this.steps[i-1], b=this.steps[i];
                p.bezierCurveTo((a.x+(b.x-a.x)*.6)/3,a.y/3,(a.x+(b.x-a.x)*.4)/3,b.y/3,b.x/3,b.y/3);
            }
        };
        c.lineJoin='round'; c.lineCap='round';
        trail(); c.lineWidth=26; c.strokeStyle='#796b45'; c.stroke();
        trail(); c.lineWidth=22; c.strokeStyle='#c9a775'; c.stroke();
        trail(); c.lineWidth=17; c.strokeStyle='#e2c491'; c.stroke();
        // These masks share the exact curves used for drawing.
        const mask = (draw, width) => {
            const canvas = document.createElement('canvas');
            canvas.width = 800; canvas.height = 600;
            const context = canvas.getContext('2d');
            context.lineCap = 'round'; context.lineJoin = 'round';
            draw(context); context.lineWidth = width; context.stroke();
            return context.getImageData(0, 0, 800, 600).data;
        };
        this.waterPixels = mask(river, 36);
        const bankPixels = mask(river, 44);
        this.trailPixels = mask(trail, 22);
        const trailClearance = mask(trail, 66);
        this.collisionPixels = new Uint8Array(800 * 600);
        this.bridges = [];
        // Every place the trail crosses the river becomes a visible wooden bridge.
        // The same pixels determine where the player can cross.
        for (let y = 0; y < 600; y++) {
            for (let x = 0; x < 800; x++) {
                const i = y * 800 + x;
                const water = this.waterPixels[i * 4 + 3] > 0;
                const crossing = this.trailPixels[i * 4 + 3] > 128;
                this.collisionPixels[i] = water && !crossing ? 1 : 0;
                if (crossing && bankPixels[i * 4 + 3] > 0) {
                    c.fillStyle = y % 5 === 0 ? '#684631' : y % 5 === 1 ? '#e1b781' : '#ac784a';
                    c.fillRect(x, y, 1, 1);
                    if (water) this.bridges.push({ x: x * 3, y: y * 3 });
                }
            }
        }
        const nearTrail = (x, y) => trailClearance[(Math.floor(y) * 800 + Math.floor(x)) * 4 + 3] > 0;
        river(); c.lineWidth = 54;
        for(let i=0;i<450;i++){
            const x=random()*800,y=random()*600;
            if(nearTrail(x,y) || c.isPointInStroke(x,y))continue;
            if(i%3===0) this.tree(c,x,y,random()>.7);
            else {c.fillStyle='#347443';c.fillRect(x,y,2,4);c.fillRect(x+3,y+2,2,3);if(i%7===0){c.fillStyle=i%2?'#f2d778':'#e995a8';c.fillRect(x,y,2,2);}}
        }
        this.house(c,690,62,'#b55445');
        this.house(c,280,235,'#576a97');
        this.house(c,530,250,'#b55445');
        this.sign(c,23,527,'DÉPART');
        this.sign(c,641,120,'1er CLIENT');
        for (const obstacle of this.obstacles) this.blockRectangle(obstacle);
    }
    tree(c,x,y,pine=false) {
        x=Math.round(x);y=Math.round(y);
        this.obstacles.push({ type: 'tree', x: x-17, y: y-23, width: 35, height: 37 });
        c.fillStyle='#397645';c.fillRect(x-11,y+7,25,7);
        c.fillStyle='#3a3032';c.fillRect(x-3,y-2,7,16);
        c.fillStyle='#a07849';c.fillRect(x-1,y,3,12);
        c.fillStyle='#243e36';
        if(pine){for(let j=0;j<3;j++)c.fillRect(x-10-j*2,y-24+j*9,21+j*4,10);}
        else{c.fillRect(x-14,y-20,28,20);c.fillRect(x-19,y-15,38,12);c.fillRect(x-9,y-24,18,27);}
        c.fillStyle='#2e6a43';c.fillRect(x-12,y-18,24,17);c.fillRect(x-16,y-12,32,8);
        c.fillStyle='#4e9750';c.fillRect(x-10,y-19,19,11);c.fillRect(x-14,y-12,24,6);
        c.fillStyle='#80b45d';c.fillRect(x-7,y-17,5,3);c.fillRect(x+4,y-10,4,3);c.fillRect(x-10,y-7,3,2);
    }
    house(c,x,y,roof) {
        this.obstacles.push({ type: 'house', x: x-34, y: y-38, width: 70, height: 74 });
        c.fillStyle='#263936';c.fillRect(x-29,y+10,67,32);
        c.fillStyle='#332c30';c.fillRect(x-30,y-16,62,52);
        c.fillStyle='#efd09a';c.fillRect(x-27,y-13,56,46);
        c.fillStyle=roof;c.fillRect(x-34,y-23,70,13);c.fillRect(x-27,y-31,56,10);c.fillRect(x-19,y-38,40,10);
        c.fillStyle='#e28a65';c.fillRect(x-25,y-29,49,3);
        c.fillStyle='#493b3c';c.fillRect(x-5,y+10,13,23);
        c.fillStyle='#497b90';c.fillRect(x-20,y,10,11);c.fillRect(x+14,y,10,11);
        c.fillStyle='#fcdf9b';c.fillRect(x-16,y,2,11);c.fillRect(x+18,y,2,11);
    }
    sign(c,x,y,text) {
        this.obstacles.push({ type: 'sign', x: x-22, y: y-8, width: 46, height: 30 });
        c.fillStyle='#46312a';c.fillRect(x-2,y,4,22);c.fillRect(x-22,y-8,46,16);
        c.fillStyle='#c39762';c.fillRect(x-20,y-6,42,12);
        c.fillStyle='#392d29';c.font='bold 6px monospace';c.textAlign='center';c.fillText(text,x+1,y+2);
    }
    blockRectangle(rect) {
        for (let y = Math.max(0, Math.floor(rect.y)); y < Math.min(600, rect.y + rect.height); y++) {
            for (let x = Math.max(0, Math.floor(rect.x)); x < Math.min(800, rect.x + rect.width); x++) {
                this.collisionPixels[y * 800 + x] = 1;
            }
        }
    }

    canOccupy(x, y, width = 28, height = 28) {
        if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x + width > this.worldWidth || y + height > this.worldHeight) return false;
        // The solid part is the player's feet, matching the top-down perspective.
        const left = Math.floor((x + 5) / 3);
        const right = Math.floor((x + width - 5) / 3);
        const top = Math.floor((y + height - 9) / 3);
        const bottom = Math.floor((y + height) / 3);
        for (let py = top; py <= bottom; py++) {
            for (let px = left; px <= right; px++) {
                if (this.collisionPixels[py * 800 + px]) return false;
            }
        }
        return true;
    }

    render(ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.terrain,0,0,this.worldWidth,this.worldHeight);
        for(const step of this.steps){
            const x=step.x,y=step.y;
            const sprite=this.game.characters.get(step.character);
            if(sprite)ctx.drawImage(sprite.canvas,x-18,y-55,36,48);
            ctx.fillStyle='#26312d';ctx.fillRect(x-16,y+5,32,16);
            ctx.fillStyle=step.completed?'#7ee08a':step.active?'#ffd23f':'#7a816d';ctx.fillRect(x-14,y+3,28,14);
            ctx.fillStyle='#212535';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(step.completed?'✓':String(step.id).padStart(2,'0'),x,y+14);
            const text=step.name;
            ctx.font='bold 11px monospace';
            const width=ctx.measureText(text).width+16;
            ctx.fillStyle='#242b30';ctx.fillRect(x-width/2,y+25,width,22);
            ctx.fillStyle=step.active?'#fff0cc':'#c3c5aa';ctx.fillText(text,x,y+40);
            if(step.id===this.game.progression.currentStep&&!step.completed){
                ctx.fillStyle='#ffd23f';ctx.fillRect(x-5,y-68,10,5);ctx.fillRect(x-3,y-63,6,3);ctx.fillRect(x-1,y-60,2,2);
            }
        }
    }
    getStepAt(x,y,threshold=60){return this.steps.find(s=>Math.hypot(x-s.x,y-s.y)<threshold);}
}
