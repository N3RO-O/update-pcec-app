import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {join} from 'node:path';

export const documents=[
 ['01-Product-Requirements-Document.md','product-requirements','Product requirements','Feature-by-feature requirements, roles, business rules and acceptance criteria.'],
 ['02-Technical-Requirements-Document.md','technical-requirements','Technical requirements','Current stack, architecture, API contracts, security and performance targets.'],
 ['03-Application-Flow-Document.md','app-flow','Application flows','Account journeys, role workflows, navigation, giving and exceptional states.'],
 ['04-UI-UX-Design-Brief.md','design-brief','UI/UX design brief','PCEC visual identity, components, layouts, accessibility and responsive behavior.'],
 ['05-Database-Schema-and-Implementation.md','backend-schema','Database schema & implementation','Source-derived columns, relationships, constraints, indexes and migration strategy.'],
 ['06-Implementation-Plan.md','implementation-plan','Implementation plan','Phases, dependencies, bounded integration tickets and external acceptance gates.'],
 ['07-System-Audit-Report.md','system-audit','System audit','What was inspected, code findings, evidence boundaries and current limitations.'],
 ['08-Testing-and-QA-Report.md','testing-qa','Testing & QA','Suite outcomes, feature acceptance, live checks and work still awaiting verification.'],
 ['09-Portfolio-Feature-Mapping.md','portfolio-mapping','Portfolio feature mapping','All 22 case studies and reusable UI patterns, with adaptations and exclusions.'],
];
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=x=>x.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const docLinks=new Map(documents.map(d=>[d[0],d[1]+'.html']));
const safeHref=href=>{
 if(/^(?:javascript|data|vbscript):/i.test(href))return '#';
 if(docLinks.has(href))return docLinks.get(href);
 if(/^(feature|route|schema)-catalog\.json$/.test(href))return 'documents/'+href;
 return href;
};
function inline(value){
 let s=escape(String(value).replace(/\\\|/g,'|'));
 s=s.replace(/`([^`]+)`/g,'<code>$1</code>');
 s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_m,label,url)=>`<a href="${escape(safeHref(url.replace(/&amp;/g,'&')))}"${/^https?:/.test(url)?' rel="noopener noreferrer"':''}>${label}</a>`);
 return s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
}
function diagramPreview(code){
 const labels=new Map(),edges=[];
 const clean=s=>s.replace(/<br\s*\/?\s*>/gi,' · ').replace(/["']/g,'').trim();
 for(const line of code.split('\n')){
  for(const m of line.matchAll(/\b([A-Za-z][\w-]*)\[([^\]]+)\]/g))labels.set(m[1],clean(m[2]));
  const participant=line.match(/^\s*participant\s+(\w+)\s+as\s+(.+)/);if(participant)labels.set(participant[1],clean(participant[2]));
 }
 for(const line of code.split('\n')){
  const flow=line.match(/^\s*([\w-]+)(?:\[[^\]]*\])?\s*--+>\s*(?:\|([^|]+)\|\s*)?([\w-]+)(?:\[[^\]]*\])?/);
  const sequence=line.match(/^\s*([\w-]+)\s*-+>>?\s*([\w-]+)\s*:\s*(.+)/);
  const relationship=line.match(/^\s*([\w-]+)\s+[|o}{.-]+\s+([\w-]+)\s*:\s*(.+)/);
  if(flow)edges.push([flow[1],flow[3],flow[2]||'']);else if(sequence)edges.push([sequence[1],sequence[2],sequence[3]]);else if(relationship)edges.push([relationship[1],relationship[2],relationship[3]]);
 }
 if(!edges.length)return '';
 return '<figure class="diagram-overview"><figcaption>Connection overview</figcaption><ol>'+edges.map(([a,b,note])=>'<li><span class="diagram-node">'+escape(labels.get(a)||a)+'</span><span class="diagram-arrow" aria-label="connects to">→</span><span class="diagram-node">'+escape(labels.get(b)||b)+'</span>'+(note?'<span class="diagram-note">'+escape(clean(note))+'</span>':'')+'</li>').join('')+'</ol><p class="small">Each row shows a connection. The complete Mermaid definition below preserves direction, conditions and relationship notation.</p></figure>';
}
function markdown(source){
 const lines=source.split(/\r?\n/),out=[],contents=[],ids=new Map();let i=0;
 const idFor=text=>{const preferred=text.match(/^([A-Z]+-\d+)\b/)?.[1]?.toLowerCase()||slug(text);const n=(ids.get(preferred)||0)+1;ids.set(preferred,n);return preferred+(n>1?'-'+n:'');};
 while(i<lines.length){
  const line=lines[i];if(!line.trim()){i++;continue;}
  if(line.startsWith('```')){const language=line.slice(3).trim();const code=[];i++;while(i<lines.length&&!lines[i].startsWith('```'))code.push(lines[i++]);i++;const value=code.join('\n');out.push(`${language==='mermaid'?diagramPreview(value)+'<details class="diagram-source"><summary>Complete Mermaid diagram source</summary>':''}<pre><code>${escape(value)}</code></pre>${language==='mermaid'?'</details>':''}`);continue;}
  const heading=line.match(/^(#{1,6})\s+(.+)$/);if(heading){const level=heading[1].length;if(level===1){i++;continue;}const id=idFor(heading[2]);out.push(`<h${level} id="${id}">${inline(heading[2])}<a class="heading-anchor" href="#${id}" aria-label="Link to ${escape(heading[2])}">#</a></h${level}>`);if(level===2)contents.push({id,text:heading[2]});i++;continue;}
  if(/^\|/.test(line)&&/^\|\s*[-:]/.test(lines[i+1]||'')){
   const split=s=>s.split(/(?<!\\)\|/).slice(1,-1).map(c=>c.trim());const head=split(line);i+=2;const rows=[];while(i<lines.length&&/^\|/.test(lines[i]))rows.push(split(lines[i++]));
   out.push(`<div class="table-wrap" role="region" aria-label="Scrollable reference table" tabindex="0"><table><thead><tr>${head.map(c=>'<th scope="col">'+inline(c)+'</th>').join('')}</tr></thead><tbody>${rows.map(row=>'<tr>'+row.map((c,n)=>n?'<td>'+inline(c)+'</td>':'<th scope="row">'+inline(c)+'</th>').join('')+'</tr>').join('')}</tbody></table></div>`);continue;
  }
  if(/^[-*] /.test(line)){const items=[];while(i<lines.length&&/^[-*] /.test(lines[i]))items.push(lines[i++].slice(2));out.push('<ul>'+items.map(x=>'<li>'+inline(x)+'</li>').join('')+'</ul>');continue;}
  const para=[];while(i<lines.length&&lines[i].trim()&&!/^(?:#{1,6}\s|```|\||[-*] )/.test(lines[i]))para.push(lines[i++]);if(para.length)out.push('<p>'+inline(para.join(' '))+'</p>');else i++;
 }
 let body=out.join('\n');
 body=body.replace(/<h3 id="([a-z]+-\d+)">([\s\S]*?)<\/h3>([\s\S]*?)(?=<h[23]\b|$)/g,(_m,id,title,content)=>`<details class="feature-spec" id="${id}"><summary>${title.replace(/<a class="heading-anchor"[\s\S]*?<\/a>/,'')}</summary><div class="fold-body">${content}</div></details>`);
 return {body,contents};
}
const header=(title,subtitle)=>`<a class="skip" href="#main">Skip to content</a><header class="docs-header"><div class="docs-shell"><nav aria-label="Project navigation"><a class="docs-brand" href="index.html">PCEC Connect <span>Project update</span></a><div><a href="documentation.html">Documentation</a><a href="production-readiness.html#current-status">Readiness</a><a href="https://pcec-connect.vercel.app/" rel="noopener noreferrer">Open app ↗</a></div></nav><p class="eyebrow">PROJECT DOCUMENTATION · 31 OCTOBER 2026</p><h1>${escape(title)}</h1><p class="docs-lead">${escape(subtitle)}</p></div></header>`;
const footer='<footer class="docs-footer docs-shell"><p>Reviewed source and isolated test evidence. Production acceptance and third-party services remain separately verified. No member records or credentials are published here.</p><a href="documentation.html">All documents</a> · <a href="index.html">Project summary</a> · <a href="https://tabuzoportfolio.vercel.app/" rel="noopener noreferrer">Developer portfolio</a></footer>';
const shell=(title,description,body,script=false)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · PCEC Connect</title><meta name="description" content="${escape(description)}"><link rel="stylesheet" href="assets/documentation.css">${script?'<script src="assets/documentation.js" defer></script>':''}</head><body>${body}${footer}</body></html>`;
const stateOf=f=>f.status.startsWith('Blocked')?'blocked':f.status.startsWith('Implemented')?'implemented':'planned';

export async function buildDocumentation(root,output){
 const source=join(root,'documents');await mkdir(join(output,'documents'),{recursive:true});
 const catalog=JSON.parse(await readFile(join(source,'feature-catalog.json'),'utf8'));
 const captures=JSON.parse(await readFile(join(source,'screenshots.json'),'utf8').catch(()=>'[]'));
 const {features}=catalog;
 for(const d of documents){
  const raw=await readFile(join(source,d[0]),'utf8');await writeFile(join(output,'documents',d[0]),raw);
  const rendered=markdown(raw);
  const contents=rendered.contents.map(c=>`<li><a href="#${c.id}">${escape(c.text)}</a></li>`).join('');
  const neighbours=documents.filter(x=>x!==d).map(x=>`<a href="${x[1]}.html">${escape(x[2])}</a>`).join('');
  const body=`${header(d[2],d[3])}<main class="docs-shell document-layout" id="main"><aside class="document-toc"><p class="eyebrow">ON THIS PAGE</p><ol>${contents}</ol><a class="download" download href="documents/${d[0]}">Download Markdown ↓</a></aside><article class="document-body"><div class="document-status"><strong>Evidence-aware documentation</strong><p>Reviewed baseline 1.1.10; scoped update 1.1.11. Implementation and verification status are separate; see the QA report for accepted results.</p></div>${rendered.body}<nav class="related-docs" aria-label="Related documents"><h2>Other documents</h2>${neighbours}</nav></article></main>`;
  await writeFile(join(output,d[1]+'.html'),shell(d[2],d[3],body,true));
 }
 for(const name of ['feature-catalog.json','route-catalog.json','schema-catalog.json','screenshots.json']){const value=await readFile(join(source,name),'utf8').catch(()=>name==='screenshots.json'?'[]':null);if(value===null)throw Error('Missing documentation data: '+name);await writeFile(join(output,'documents',name),value);}
 await cp(join(root,'assets/documentation.css'),join(output,'assets/documentation.css'));await cp(join(root,'assets/documentation.js'),join(output,'assets/documentation.js'));
 if(captures.length)await cp(join(root,'assets/screenshots'),join(output,'assets/screenshots'),{recursive:true});
 const cards=documents.map((d,i)=>`<a class="document-card" href="${d[1]}.html"><span class="document-number">${String(i+1).padStart(2,'0')}</span><h3>${escape(d[2])}</h3><p>${escape(d[3])}</p><span class="read-document">Read document →</span></a>`).join('');
 const groups=[...new Set(features.map(f=>f.module))];
 const featureCards=features.map(f=>`<article class="feature-card" data-feature data-module="${escape(f.module)}" data-status="${stateOf(f)}" data-search="${escape([f.id,f.name,f.module,f.role,f.purpose,f.status].join(' ').toLowerCase())}"><div class="feature-heading"><span class="feature-id">${f.id}</span><span class="status-tag ${stateOf(f)}">${escape(f.status)}</span></div><h3>${escape(f.name)}</h3><p>${escape(f.description)}</p><p class="small">${escape(f.module)} · ${escape(f.priority)} priority · ${escape(f.role)}</p><a href="product-requirements.html#${f.id.toLowerCase()}">Requirements &amp; acceptance →</a></article>`).join('');
 const gallery=captures.map(c=>`<figure class="capture-card"><a href="${escape(c.publicPath)}"><img src="${escape(c.publicPath)}" alt="${escape(c.alt)}" width="${Number(c.width)}" height="${Number(c.height)}" loading="lazy"></a><figcaption><strong>${escape(c.title)}</strong><span>${escape(c.context)} · ${escape(c.width+' × '+c.height)}</span><p>${escape(c.caption)}</p></figcaption></figure>`).join('');
 const body=`${header('The complete PCEC reference.','Requirements, architecture, flows, design, database and implementation — grounded in the app, with test evidence and actual interface captures.')}<main class="docs-shell library-main" id="main"><section class="docs-notice" aria-label="Scope and status"><strong>A documented testing release, with clear acceptance gates.</strong><p>The library covers ${features.length} current and proposed features and 59 app routes. A feature's source implementation is distinct from real-service acceptance. Bank confirmation, mail delivery, MFA/recovery, backups and current real-device acceptance are not implied by a screenshot.</p><div class="docs-stats"><span><b>6</b> core documents</span><span><b>3</b> supporting reports</span><span><b>${features.length}</b> feature specifications</span><span><b>38 + 1</b> source tables + view</span></div></section><section aria-labelledby="documents-title"><p class="eyebrow">THE DOCUMENT SET</p><h2 id="documents-title">Start with the question you need answered.</h2><div class="document-grid">${cards}</div></section><section aria-labelledby="features-title"><p class="eyebrow">FEATURE BY FEATURE</p><h2 id="features-title">Find a capability. Read its contract.</h2><p>Roles, interactions, validation, permissions, dependencies, error states and acceptance criteria are defined individually. Planned items stay labelled.</p><div class="feature-filters" data-feature-filters hidden><label>Search features<input type="search" id="feature-search" placeholder="Try donations, groups, profile, offline…" maxlength="120"></label><label>Module<select id="feature-module"><option value="">All modules</option>${groups.map(g=>`<option>${escape(g)}</option>`).join('')}</select></label><label>Implementation<select id="feature-state"><option value="">All states</option><option value="implemented">Implemented source</option><option value="planned">Planned / acceptance needed</option><option value="blocked">Blocked by dependency</option></select></label><button type="button" id="clear-features">Clear filters</button></div><p id="feature-count" role="status">${features.length} features</p><div class="feature-grid">${featureCards}</div><p id="feature-empty" class="docs-notice" hidden>No matching features. Try a shorter term or clear the filters.</p></section><section aria-labelledby="captures-title"><p class="eyebrow">ACTUAL INTERFACES</p><h2 id="captures-title">Screens, with their context.</h2><p>These are rendered interfaces, not generated mockups. App captures use an isolated sample backend, with no real member records, private messages or receipts. Portfolio captures identify their public-site context.</p>${captures.length?'<div class="capture-grid">'+gallery+'</div>':'<p class="docs-notice">Screenshots are being captured and privacy-reviewed. This is an in-progress local build.</p>'}</section></main>`;
 await writeFile(join(output,'documentation.html'),shell('Complete project documentation','PCEC product and technical requirements, app flows, design brief, backend schema, implementation plan, audit, QA and portfolio mapping.',body,true));
 console.log(`Prepared ${documents.length} document pages, ${features.length} feature entries and ${captures.length} reviewed screenshot references.`);
}
