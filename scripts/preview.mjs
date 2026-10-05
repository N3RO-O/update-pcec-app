import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const port=Number(process.env.PORT)||5204;
createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return}
  let path;
  try{path=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
  if(path.split(/[\\/]/).some(s=>s.startsWith('.'))||path.startsWith('/scripts/')||path.startsWith('/node_modules/')){res.writeHead(404).end();return}
  if(path==='/')path='/index.html';
  const file=join(root,path),rel=relative(root,file);
  const types={'.html':'text/html; charset=utf-8','.png':'image/png','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
  if(isAbsolute(rel)||rel.startsWith('..')||!types[extname(file)]||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return}
  res.writeHead(200,{'Content-Type':types[extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD'){res.end();return}createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`PCEC review: http://localhost:${port}`));
