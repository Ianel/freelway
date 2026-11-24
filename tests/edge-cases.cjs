const{chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});try{
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3});p.setDefaultTimeout(5000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://localhost:8000');await p.waitForFunction(()=>!!window.game);
await p.evaluate(()=>localStorage.setItem(CFG.storageKey,'{bad'));await p.reload();await p.waitForFunction(()=>game.screen==='menu');
await p.evaluate(()=>localStorage.setItem(CFG.storageKey,JSON.stringify({playerName:'Ancien',completedSteps:[0,1,2,4],settings:{soundEnabled:false}})));await p.reload();await p.waitForFunction(()=>!!window.game);
assert.deepEqual(await p.evaluate(()=>game.progression.completedSteps),[1,2]);await p.click('#btn-continue');
await p.screenshot({path:'/tmp/freelway-browser-test/mobile-map.png'});
await p.keyboard.press('e');await p.click('#dialog-actions button:first-child');await p.screenshot({path:'/tmp/freelway-browser-test/mobile-sheets.png'});assert(await p.locator('.sheet').isVisible());
await p.keyboard.press('Escape');await p.waitForFunction(()=>game.canMove());
await p.evaluate(()=>{game.startChallenge(DATA.STEPS[2]);game.challenges.finish(100);game.ui.closeChallenge();});await p.waitForTimeout(800);assert.equal(await p.evaluate(()=>game.ui.dialogOpen),false);
await p.evaluate(()=>{const before=game.player.x;game.controls.direction={x:1,y:0};game.player.update(.1);window.movement=game.player.x-before;});assert(Math.abs(await p.evaluate(()=>movement)-15.6)<.001);
await p.keyboard.press('Escape');await p.click('#pause-menu');await p.click('#btn-new');await p.click('#confirm-yes');await p.fill('#name-input','Nouvelle');await p.click('#name-cancel');assert.equal(await p.evaluate(()=>game.progression.playerName),'Ancien');
await p.click('#btn-new');await p.click('#confirm-yes');await p.fill('#name-input','Nouvelle');await p.click('#name-ok');assert.deepEqual(await p.evaluate(()=>game.progression.completedSteps),[]);assert.equal(await p.evaluate(()=>game.progression.currentStep),1);
assert.deepEqual(errors,[]);console.log('Edge cases: corrupt and legacy saves, cancellation, fresh game, time-based movement PASS');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
