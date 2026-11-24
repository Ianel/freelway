// Run with Playwright installed: NODE_PATH=/path/to/node_modules node tests/browser.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
 try {
 for (const mobile of [false, true]) {
  const context = await browser.newContext({ viewport: mobile ? {width:390,height:844} : {width:1280,height:800}, deviceScaleFactor:mobile?3:1, isMobile:mobile, hasTouch:mobile });
  const page = await context.newPage(); page.setDefaultTimeout(8000); const errors = [];
  console.log('Starting',mobile?'mobile':'desktop');
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(process.env.GAME_URL || 'http://localhost:8000');
  await page.waitForFunction(() => window.game?.screen === 'menu');
  assert(await page.locator('#menu').isVisible());
  assert(!(await page.locator('#dialog').isVisible()));
  assert(await page.locator('#btn-continue').isDisabled());
  await page.click('#btn-howto'); await page.click('#howto-close');
  await page.click('#btn-map'); assert(await page.locator('#route-map').isVisible());
  await page.keyboard.press('Escape'); assert(!(await page.locator('#route-map').isVisible()));
  await page.click('#btn-new'); await page.fill('#name-input', 'Aina'); await page.keyboard.press('Enter');
  await page.waitForFunction(() => game.canMove());
  assert.equal(await page.locator('#hud-name').textContent(), 'Aina');
  assert.equal(await page.locator('#hud-fill').evaluate(el=>el.style.width), '0%');
  const start = await page.evaluate(()=>game.player.x);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(250); await page.keyboard.up('ArrowRight');
  assert(await page.evaluate(x=>game.player.x>x,start));
  const beforeZ = await page.evaluate(()=>game.player.y);
  await page.keyboard.down('z'); await page.waitForTimeout(100); await page.keyboard.up('z');
  assert(await page.evaluate(y=>game.player.y<y,beforeZ));
  await page.keyboard.press('Escape'); assert(await page.locator('#pause').isVisible());
  await page.click('#pause-progress'); assert.equal(await page.locator('.progress-row').count(),15); await page.click('#progress-close');
  await page.click('#pause-map'); assert(await page.locator('#route-map img').isVisible()); await page.click('#map-close');
  await page.click('#pause-howto'); await page.click('#howto-close'); await page.click('#pause-resume');
  if(mobile){
   const box=await page.locator('#stick').boundingBox();
   const x=await page.evaluate(()=>game.player.x);
   await page.dispatchEvent('#stick','pointerdown',{pointerId:1,clientX:box.x+75,clientY:box.y+50,pointerType:'touch'});
   await page.waitForTimeout(200);
   await page.dispatchEvent('#stick','pointerup',{pointerId:1,pointerType:'touch'});
   assert(await page.evaluate(v=>game.player.x>v,x));
  }
  // Position at markers to test every real interaction and challenge without long walks.
  const position = async id => page.evaluate(id=>{const s=game.world.steps.find(s=>s.id===id); game.player.x=s.x;game.player.y=s.y;},id);
  const interact = async () => mobile ? page.click('#btn-action') : page.keyboard.press('e');
  await position(2); await interact(); assert((await page.locator('#dialog-text').textContent()).includes('précédente')); await page.click('#dialog-actions button');
  const open = async id => { await position(id); await interact(); await page.click('#dialog-actions button:first-child'); assert(await page.locator('#challenge').isVisible()); };
  await open(1); await page.click('#challenge-quit'); await page.waitForFunction(()=>game.canMove());
  const quizAnswers={2:[0,1,2,0,1],3:[1,0,1],7:[0,0,0,0],10:[0,0,0],14:[0,0,0,0,0]};
  for(let id=1;id<=15;id++){
   console.log("Step", id); await open(id);
   if(id===1){
    await page.click('#challenge-submit'); assert((await page.locator('#challenge-msg').textContent()).includes('Écris'));
    // Real typing checks that game shortcuts do not swallow letters or spaces.
    await page.locator('#tin').pressSequentially('Bonjour le monde, je suis un futur freelance.');
   } else if(quizAnswers[id]){
    if(id===2){
     for(let i=0;i<5;i++) await page.locator('.option-btn').nth(2).click();
     assert((await page.locator('.challenge-result').textContent()).includes('20%'));
     await page.click('#challenge-submit');
    }
    if(id===3) assert(await page.locator('.sheet').isVisible());
    for(const answer of quizAnswers[id]) await page.locator('.option-btn').nth(answer).click();
    assert((await page.locator('.challenge-result').textContent()).includes('100%'));
   } else if(id===4){for(const [i,v] of ['Jean Dupont','Paris','jdupont@email.com'].entries()) await page.locator('#challenge-body input').nth(i).fill(v);}
   else if(id===5){await page.locator('.color-option').nth(1).click();await page.locator('.color-option').first().click();}
   else if(id===6){for(const v of ['Intro','Interview','Conclusion'])await page.locator(`[data-c="${v}"]`).click();}
   else if(id===8){await page.fill('#fbname','AinaDesign');await page.fill('#fbdesc','Graphiste freelance à Antananarivo');await page.selectOption('#fbcat',{label:'Graphisme'});}
   else if(id===9){for(const box of await page.locator('#challenge-body input').all())await box.check();}
   else if(id===11){await page.fill('#ptitle','Graphiste freelance');await page.selectOption('#pcat',{label:'Design'});await page.fill('#pprice','25');}
   else if(id===12){await page.fill('#esubj','Votre site restaurant');await page.fill('#ebody','Bonjour, je propose un site pour présenter votre restaurant. Pouvons-nous en discuter ?');}
   else if(id===13){await page.locator('.group-item').nth(1).click();await page.locator('.group-item').first().click();}
   else if(id===15){await page.selectOption('#fprop','good');await page.fill('#fprice','350');await page.fill('#fdelay','14');await page.fill('#fmsg','Bonjour, je propose un site vitrine avec votre menu en ligne, livré dans quatorze jours.');}
   if(![5,6,13].includes(id))await page.click('#challenge-submit');
   await page.waitForFunction(()=>game.ui.dialogOpen);
   await page.click('#dialog-actions button');
   assert.equal(await page.evaluate(()=>game.progression.completedSteps.length),id);
   assert.equal(await page.evaluate(()=>game.progression.rewards.length),id);
   if(id===1){
    await page.reload();await page.waitForFunction(()=>game.screen==='menu'); await page.click('#btn-continue');
    assert.equal(await page.evaluate(()=>game.progression.currentStep),2);
   }
  }
  assert(await page.locator('#end').isVisible());assert((await page.locator('#end-stats').textContent()).includes('100%'));
  await page.screenshot({path:`/tmp/freelway-browser-test/${mobile?'mobile':'desktop'}-complete.png`});
  await page.click('#btn-end-menu');await page.click('#btn-continue');assert(await page.locator('#end').isVisible());
  await page.click('#btn-end-menu');await page.click('#btn-new');await page.click('#confirm-no');assert(await page.locator('#menu').isVisible());
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await context.setOffline(true);await page.reload();await page.waitForFunction(()=>game.screen==='menu');assert(await page.locator('#offline-badge').isVisible());
  await page.click('#btn-continue');assert(await page.locator('#end').isVisible());
  await context.setOffline(false);
  await page.click('#btn-end-menu');await page.click('#btn-reset');await page.click('#confirm-yes');assert(await page.locator('#btn-continue').isDisabled());
  assert.deepEqual(errors,[]);
  console.log(`${mobile?'Mobile':'Desktop'}: 15 challenges, retry, movement, pause, persistence, ending and offline PASS`);
  await context.close();
 }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
