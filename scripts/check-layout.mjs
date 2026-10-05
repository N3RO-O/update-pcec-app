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
    await page.goto('http://localhost:5205/index.html');
    await page.waitForTimeout(1100);
    assert.equal(await page.locator('#rows details').count(),9);
    assert.equal(await page.locator('#groups .group').count(),3);
    assert.ok(await page.locator('#qBig').textContent());
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.screenshot({path:shots+`report-${size.width}.png`,fullPage:true});
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
  console.log('PASS: report and all 8 emails fit desktop and phone; preview links are inert; template placeholders remain in downloadable files.');
}finally{await browser.close();server.kill()}
