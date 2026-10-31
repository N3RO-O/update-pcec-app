import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {documents} from './build-documentation.mjs';
const BASE='http://127.0.0.1:5246';
const catalog=JSON.parse(await readFile('documents/feature-catalog.json','utf8'));
const captures=JSON.parse(await readFile('documents/screenshots.json','utf8'));
const server=spawn(process.execPath,['scripts/preview.mjs'],{env:{...process.env,PORT:'5246'},stdio:'pipe'});
await new Promise((yes,no)=>{server.stdout.once('data',yes);server.once('error',no);server.once('exit',c=>no(Error('Preview exited '+c)));});
const browser=await chromium.launch();
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>new URL(route.request().url()).origin===BASE?route.continue():route.abort());
 for(const width of [320,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto(BASE+'/documentation.html');
  assert.equal(await page.locator('[data-feature]').count(),catalog.features.length);
  await page.getByLabel('Search features',{exact:true}).fill('donation');
  assert.ok(await page.locator('[data-feature]:visible').count()>=3);
  await page.locator('#feature-state').selectOption('blocked');assert.equal(await page.locator('[data-feature]:visible').count(),0);await page.locator('#feature-empty').waitFor();
  await page.getByRole('button',{name:'Clear filters',exact:true}).click();assert.equal(await page.locator('[data-feature]:visible').count(),60);
  await page.locator('#feature-module').selectOption('Giving');assert.equal(await page.locator('[data-feature]:visible').count(),4);await page.getByRole('button',{name:'Clear filters',exact:true}).click();
  await page.getByLabel('Search features',{exact:true}).focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'feature-module');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Library '+width);
  for(const [,slug] of documents){
   const res=await page.goto(BASE+'/'+slug+'.html');assert.equal(res.status(),200);assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('main').count(),1);
   const overflow=await page.evaluate(()=>[...document.querySelectorAll('main *')].filter(el=>el.getBoundingClientRect().right>innerWidth+2&&getComputedStyle(el).position!=='fixed'&&!el.closest('.table-wrap,pre')).slice(0,6).map(el=>({tag:el.tagName,class:el.className,text:el.textContent.slice(0,90)})));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,slug+' '+width+' '+JSON.stringify(overflow));
   for(const anchor of await page.locator('.document-toc a[href^="#"]').all()){const id=(await anchor.getAttribute('href')).slice(1);assert.equal(await page.locator('[id="'+id+'"]').count(),1);}
  }
  await page.goto(BASE+'/product-requirements.html#chat-003');await page.locator('#chat-003[open]').waitFor();assert.match(await page.locator('#chat-003').innerText(),/Private group creation/);
  await page.locator('#chat-003 > summary').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#chat-003').getAttribute('open'),null);await page.keyboard.press('Enter');assert.equal(await page.locator('#chat-003').getAttribute('open'),'');
  console.log('PASS '+width+'px: nine document layouts, feature filters, empty/clear states, anchors and keyboard disclosure.');
 }
 for(const [file] of documents){const res=await page.request.get(BASE+'/documents/'+file);assert.equal(res.status(),200);assert.equal(await res.text(),await readFile('documents/'+file,'utf8'));}
 for(const c of captures){const res=await page.request.get(BASE+'/'+c.publicPath);assert.equal(res.status(),200);assert.ok((await res.body()).length>100);assert.ok(c.caption&&c.width&&c.height);}
 for(const f of catalog.features){const html=await readFile('dist/product-requirements.html','utf8');assert.ok(html.includes('id="'+f.id.toLowerCase()+'"'));}
 const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),plain=await noJS.newPage();await plain.goto(BASE+'/documentation.html');assert.equal(await plain.locator('[data-feature]:visible').count(),60);assert.equal(await plain.locator('[data-feature-filters]').isVisible(),false);await plain.goto(BASE+'/product-requirements.html');await plain.locator('#chat-003 > summary').click();assert.match(await plain.locator('#chat-003').innerText(),/Private group creation/);await noJS.close();
 for(const path of ['/.env','/scripts/build-documentation.mjs','/documents/Pasted%20text.txt','/docs/README.md'])assert.equal((await page.request.get(BASE+path)).status(),404);
 assert.deepEqual(errors,[]);await page.setViewportSize({width:1440,height:1000});await page.goto(BASE+'/documentation.html');await mkdir('screenshots',{recursive:true});await page.screenshot({path:'screenshots/documentation-1440.png'});await page.setViewportSize({width:390,height:900});await page.screenshot({path:'screenshots/documentation-390.png'});
 console.log(`PASS: 60 requirement IDs, nine exact Markdown downloads, ${captures.length} images, no-JS reading and private-file denial.`);
}finally{await browser.close();server.kill();}
