import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const shots=fileURLToPath(new URL('../screenshots/',import.meta.url));
await mkdir(shots,{recursive:true});
const server=spawn(process.execPath,['scripts/preview.mjs'],{cwd:root,env:{...process.env,PORT:'5205'},stdio:'pipe'});
await once(server.stdout,'data');
const browser=await chromium.launch();
try{
  const errors=[];
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.fulfill({status:200,body:''}));
  for(const size of [{width:1440,height:1000},{width:390,height:844}]){
    await page.setViewportSize(size);
    const readinessResponse=await page.goto('http://localhost:5205/production-readiness.html');
    assert.match(readinessResponse.headers()['content-security-policy'],/default-src 'self'; script-src 'self'/);
    assert.equal(readinessResponse.headers()['x-content-type-options'],'nosniff');
    assert.equal(readinessResponse.headers()['x-frame-options'],'DENY');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await page.locator('.finding').count(),21);
    assert.equal(await page.locator('.check-group').count(),11);
    assert.equal(await page.locator('.check').count(),83);
    assert.equal(await page.locator('#launch-priorities .launch-work article').count(),6);
    assert.equal(await page.locator('.check:not([hidden])').count(),64);
    assert.equal(await page.getByRole('button',{name:'Before launch',exact:true}).getAttribute('aria-pressed'),'true');
    assert.match(await page.locator('#check-count').textContent(),/64 of 83.*47 need work.*17 have PASS/);
    const critical=page.locator('.check').filter({has:page.getByText('Privileged-account MFA',{exact:true})});
    assert.equal(await critical.getAttribute('data-priority'),'launch');
    assert.equal(await critical.getAttribute('data-result'),'FAIL');
    await page.locator('#launch-priorities').screenshot({path:shots+`launch-priorities-${size.width}.png`});
    for(const [label,key,count] of [['Can follow later','later',9],['Only if enabled','conditional',3],['Not used now','unused',7],['All checks','all',83]]){
      await page.getByRole('button',{name:label,exact:true}).click();
      assert.equal(await page.locator('.check:not([hidden])').count(),count);
      if(key!=='all') assert.equal(await page.locator(`.check:not([hidden]):not([data-priority="${key}"])`).count(),0);
      if(key!=='all') assert.equal(await critical.getAttribute('hidden'),'');
      await page.getByRole('button',{name:'Open all checklists',exact:true}).click();
      assert.equal(await page.locator('.check:visible').count(),count);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      if(key==='later'){
        const rate=page.locator('.check').filter({has:page.getByText('Meaningful HTTP 429 Retry-After everywhere',{exact:true})});
        assert.match(await rate.locator('.priority-note').textContent(),/live service actually blocks excess requests/);
        assert.equal(await rate.locator('.status').textContent(),'FAIL');
      }
      if(key==='unused') assert.deepEqual(await page.locator('.check:visible .status').allTextContents(),Array(7).fill('N/A'));
      await page.getByRole('button',{name:'Close all checklists',exact:true}).click();
    }
    assert.match(await page.locator('.verdict').textContent(),/Not production ready/);
    await page.getByRole('button',{name:'Prepared fixes',exact:true}).click();
    assert.equal(await page.locator('.finding:visible').count(),6);
    assert.match(await page.locator('#issue-count').textContent(),/6 issues/);
    await page.getByRole('button',{name:'Needs action',exact:true}).click();
    assert.equal(await page.locator('.finding:visible').count(),15);
    await page.getByRole('button',{name:'Everything',exact:true}).click();
    await page.getByRole('button',{name:'Open all checklists',exact:true}).click();
    assert.equal(await page.locator('.check-group[open]').count(),11);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.getByRole('button',{name:'Close all checklists',exact:true}).click();
    await page.getByRole('button',{name:'Before launch',exact:true}).click();
    await page.getByRole('button',{name:'Before launch',exact:true}).focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Enter');
    assert.equal(await page.getByRole('button',{name:'All checks',exact:true}).getAttribute('aria-pressed'),'true','Keyboard can select a priority filter');
    await page.screenshot({path:shots+`production-readiness-${size.width}.png`,fullPage:true});
    assert.equal(await page.locator('script:not([src])').count(),0);
    await page.evaluate(()=>{
      const script=document.createElement('script');script.textContent='window.auditInlineExecuted=true';document.body.append(script);
    });
    assert.equal(await page.evaluate(()=>window.auditInlineExecuted===true),false,'CSP blocks inline execution');
    await page.goto('http://localhost:5205/index.html');
    await page.waitForTimeout(1100);
    assert.equal(await page.locator('#rows details').count(),9);
    assert.equal(await page.locator('#groups .group').count(),3);
    assert.ok(await page.locator('#qBig').textContent());
    assert.match(await page.locator('#qBig').textContent(),/^70/);
    assert.match(await page.locator('#lBig').textContent(),/^42/);
    assert.match(await page.locator('#launch-follow-up').locator('..').textContent(),/Draft owner: PCEC administrator/);
    assert.match(await page.locator('#target-progress').textContent(),/70\.0%.*80\.5%/);
    assert.equal(await page.locator('#target-title').textContent(),'The path to 80%');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    if(size.width===1440) await page.screenshot({path:shots+'launch-progress.png',fullPage:false});
    await page.screenshot({path:shots+`report-${size.width}.png`,fullPage:true});
    await page.getByRole('link',{name:'Open the documentation and system architecture →',exact:true}).click();
    assert.match(page.url(),/\/system-guide\.html$/);
    assert.equal(await page.locator('.diagram .node').count(),3);
    assert.match(await page.locator('.architecture').textContent(),/Vercel Scorecard hosts reports/);
    assert.match(await page.locator('.architecture').textContent(),/Updated functions and rules need a coordinated live rollout/);
    for(const link of await page.locator('a[href^="#"]').all()){
      const anchor=await link.getAttribute('href');
      assert.equal(await page.locator(anchor).count(),1,'Guide anchor resolves: '+anchor);
    }
    for(const link of await page.locator('a[href$=".html"], a[href*=".html#"]').all()){
      const target=await link.getAttribute('href');
      assert.equal((await page.request.get('http://localhost:5205/'+target.split('#')[0])).status(),200,'Guide destination exists: '+target);
      if(target.includes('#')){
        const html=await readFile(new URL('../dist/'+target.split('#')[0],import.meta.url),'utf8');
        assert.ok(html.includes('id="'+target.split('#')[1]+'"'),'Guide destination anchor exists: '+target);
      }
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Guide fits viewport');
    await page.locator('#architecture').screenshot({path:shots+`system-architecture-${size.width}.png`});
    await page.locator('#how-to summary').first().focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#how-to details[open]').count(),1,'Guide instructions open with keyboard');
    await page.locator('details').evaluateAll(nodes=>nodes.forEach(el=>el.open=true));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Expanded guide fits viewport');
    assert.equal(await page.locator('script:not([src])').count(),0);
    await page.screenshot({path:shots+`system-guide-${size.width}.png`,fullPage:true});
    await page.goto('http://localhost:5205/api-cost-review.html');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await page.locator('#estimate').textContent(),'$25.00');
    await page.locator('#members').fill('10000');
    assert.equal(await page.locator('#downloads').textContent(),'400 GB');
    assert.equal(await page.locator('#estimate').textContent(),'$38.50');
    await page.locator('#income').fill('20');
    assert.match(await page.locator('#income-note').textContent(),/exceeds/);
    await page.screenshot({path:shots+`api-costs-${size.width}.png`,fullPage:true});
    await page.locator('#members').fill('100000');
    await page.locator('#uploads').fill('30');
    assert.equal(await page.locator('#estimate').textContent(),'$515.73');
    await page.goto('http://localhost:5205/income-plan.html');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.match(await page.locator('#gross').textContent(),/5,000/);
    assert.equal(await page.locator('#balance').textContent(),'Cost needed');
    assert.match(await page.locator('#support-note').textContent(),/not confirmed income or profit/);
    await page.screenshot({path:shots+`income-plan-${size.width}.png`,fullPage:true});
    await page.locator('#monthly-cost').fill('6500');
    assert.equal(await page.locator('#needed').textContent(),'26');
    assert.match(await page.locator('#support-note').textContent(),/falls short by.*1,500/);
    await page.locator('#monthly-cost').fill('5000');
    assert.match(await page.locator('#support-note').textContent(),/exactly/);
    await page.locator('#contribution').fill('0');
    assert.equal(await page.locator('#needed').textContent(),'Contribution needed');
    await page.locator('#contribution').fill('-1');
    assert.equal(await page.locator('#input-error').isVisible(),true);
    assert.equal(await page.locator('#gross').textContent(),'Check inputs');
    await page.locator('#contribution').fill('0.01');
    await page.locator('#monthly-cost').fill('0.07');
    assert.equal(await page.locator('#needed').textContent(),'7');
    await page.goto('http://localhost:5205/email-preview.html');
    await page.waitForSelector('#mail');
    const titles=await page.locator('.choice').allTextContents();
    assert.equal(titles.length,8);
    for(const title of titles){
      await page.getByRole('button',{name:title,exact:true}).click();
      const frame=page.frameLocator('#mail');
      await frame.locator('h1').waitFor();
      assert.equal(await frame.locator('body').evaluate(el=>el.scrollWidth<=el.ownerDocument.documentElement.clientWidth),true,title+' at '+size.width);
      assert.equal(await frame.locator('body').textContent().then(s=>s.includes('{{')),false);
      assert.equal(await frame.locator('script').count(),0);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    }
    await page.getByRole('button',{name:'Forgot password',exact:true}).click();
    await page.screenshot({path:shots+`email-${size.width}.png`,fullPage:true});
    await page.frameLocator('#mail').getByRole('link',{name:/Choose a new password/}).click();
    assert.match(await page.locator('#status').textContent(),/This is a preview/);
    await page.getByRole('button',{name:'Phone',exact:true}).click();
    await page.waitForTimeout(300);
    assert.equal(await page.locator('#mail').evaluate(el=>el.clientWidth<=375),true);
  }
  const subjects=JSON.parse(await readFile(new URL('../email-templates/subjects.json',import.meta.url),'utf8'));
  for(const m of subjects){const html=await readFile(new URL('../email-templates/'+m.file,import.meta.url),'utf8');assert.ok(html.includes('{{ .Email }}'));assert.ok(!html.includes('<script'));assert.ok(html.includes('PCEC'));}
  assert.deepEqual(errors,[]);
  await page.setViewportSize({width:320,height:800});
  await page.goto('http://localhost:5205/production-readiness.html');
  await page.getByRole('button',{name:'All checks',exact:true}).click();
  await page.getByRole('button',{name:'Open all checklists',exact:true}).click();
  assert.equal(await page.locator('.check:visible').count(),83);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Priority labels fit a narrow phone');
  await page.goto('http://localhost:5205/system-guide.html');
  await page.locator('details').evaluateAll(nodes=>nodes.forEach(el=>el.open=true));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Expanded documentation fits a narrow phone');
  for(const path of ['/scripts/readiness-data.mjs','/scripts/readiness-priorities.mjs','/.env','/README.md','/PRODUCTION-AUDIT.md','/docs/README.md','/docs/08-incident-response.md'])assert.equal((await fetch('http://localhost:5205'+path)).status,404);
  console.log('PASS: documentation links, architecture and keyboard instructions; desktop and narrow-phone layouts; audit priorities and all 83 results retained; CSP and private-file denial; calculators and 8 emails.');
}finally{await browser.close();server.kill()}
