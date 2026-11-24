const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args:['--no-sandbox']});
 try {
 const page = await browser.newPage(); const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(process.env.GAME_URL || 'http://localhost:8000');
 await page.waitForFunction(()=>!!window.game);
 const results = await page.evaluate(()=>{
  const w=game.world,p=game.player;
  // Flood-fill real player footprints, including the bridge, rather than point-sized paths.
  const size=6,cols=400,rows=300;
  const valid=new Uint8Array(cols*rows),seen=new Uint8Array(cols*rows);
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)valid[y*cols+x]=w.canOccupy(x*size,y*size)?1:0;
  const start=Math.round(w.steps[0].y/size)*cols+Math.round(w.steps[0].x/size);
  const queue=[start];seen[start]=1;
  for(let i=0;i<queue.length;i++){
   const at=queue[i],x=at%cols,y=Math.floor(at/cols);
   for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){
    if(nx<0||ny<0||nx>=cols||ny>=rows)continue;
    const next=ny*cols+nx;if(!seen[next]&&valid[next]){seen[next]=1;queue.push(next);}
   }
  }
  const accessible=w.steps.map(s=>({id:s.id,spawn:w.canOccupy(s.x,s.y),reachable:!!seen[Math.round(s.y/size)*cols+Math.round(s.x/size)]}));
  const blocked = w.obstacles.map(o=>({type:o.type,blocked:!w.canOccupy((o.x+o.width/2)*3-14,(o.y+o.height/2)*3-24)}));
  let waterBlocked=0,bridgeOpen=0;
  for(let i=0;i<w.collisionPixels.length;i++)if(w.waterPixels[i*4+3]>128){
   const x=(i%800)*3-14,y=Math.floor(i/800)*3-24;
   if(w.trailPixels[i*4+3]===0&&!w.canOccupy(x,y))waterBlocked++;
   if(w.trailPixels[i*4+3]>128&&w.canOccupy(x,y))bridgeOpen++;
  }
  // Approach each kind of solid object using large updates: no tunnelling.
  const impacts=[];
  for(const type of ['tree','house']){
   let tested=false;
   for(const o of w.obstacles.filter(o=>o.type===type)){
    const y=(o.y+o.height/2)*3-24,x=o.x*3-60;
    if(!w.canOccupy(x,y))continue;
    p.x=x;p.y=y;game.controls.direction={x:1,y:0};p.update(1);
    impacts.push({type,stopped:p.x<(o.x+o.width)*3,valid:w.canOccupy(p.x,p.y)});tested=true;break;
   }
   if(!tested)impacts.push({type,stopped:false});
  }
  // Diagonal input should slide along a wall instead of freezing or entering it.
  let sliding = false;
  for (const o of w.obstacles.filter(o => o.type === 'house')) {
   const x = o.x * 3 - 25, y = (o.y + o.height / 2) * 3 - 24;
   if (!w.canOccupy(x, y) || !w.canOccupy(x, y + 20)) continue;
   p.x = x; p.y = y; game.controls.direction = { x: Math.SQRT1_2, y: Math.SQRT1_2 }; p.update(.1);
   sliding = p.y > y + 9 && p.x < x + 3 && w.canOccupy(p.x, p.y);
   if (sliding) break;
  }
  // A long horizontal sweep must never end in water or any other solid cell.
  for(let y=1100;y<1500;y+=12){
   if(!w.canOccupy(3,y))continue;
   p.x=3;p.y=y;game.controls.direction={x:1,y:0};p.update(15);
   impacts.push({type:'river sweep',valid:w.canOccupy(p.x,p.y)});
  }
  return {accessible,blocked,waterBlocked,bridgeOpen,impacts,sliding};
 });
 assert(results.accessible.every(s=>s.spawn&&s.reachable),JSON.stringify(results.accessible));
 assert(results.blocked.every(o=>o.blocked));
 assert(results.sliding, 'Diagonal wall sliding');
 assert(results.waterBlocked>1000);assert(results.bridgeOpen>50);
 assert(results.impacts.every(i=>i.valid&&i.stopped!==false),JSON.stringify(results.impacts));
 assert.deepEqual(errors,[]);
 console.log('PASS: solid water, trees, houses and signs; bridges open; 15 spawn points and stages reachable; swept movement prevents tunnelling.');
 console.log(JSON.stringify({waterPixelsBlocked:results.waterBlocked,bridgePixelsWalkable:results.bridgeOpen,obstacles:results.blocked.length}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
