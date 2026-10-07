// Mock Apps Script backend for local tests (port 8767). Mirrors Code.gs v5: state + advisor channel.
const http=require('http');let state=null,advisor=null;const KEY='test',AKEY='adv';
http.createServer((req,res)=>{const u=new URL(req.url,'http://x');const send=o=>{res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(o))};
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'});return res.end()}
 if(req.method==='GET'){if(u.searchParams.get('key')!==KEY)return send({error:'bad key'});return send({state,advisor})}
 let b='';req.on('data',d=>b+=d);req.on('end',()=>{const j=JSON.parse(b);if(j.key!==KEY)return send({error:'bad key'});
  if(j.advisor){if(j.akey!==AKEY)return send({error:'advisor key required'});advisor=j.advisor;return send({ok:true})}
  if(j.photo)return send({ok:true,url:'https://drive.example/x'});state=j.state;send({ok:true})})}).listen(8767);
