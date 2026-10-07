# Build index.html + follow.html at the repo root from build/src. Usage: python3 build/make.py v3
import os,re,sys,datetime
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));S=os.path.join(R,'build','src')
rd=lambda f:open(os.path.join(S,f)).read()
ver=sys.argv[1] if len(sys.argv)>1 else 'dev'
order=['core.js','app.js','icons.js','helpers.js','adnan.js','compass.js']
extra=sorted(f for f in os.listdir(S) if f.endswith('.js') and f not in order)  # batch files: labs_mba.js, data_mba.js ...
js='\n'.join([rd('core.js'),f"const BUILD='{ver} · {datetime.date.today()}';"]+[rd(f) for f in order[1:]+extra]+['boot();'])
head='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="Adnan">
<meta name="theme-color" content="#0B1F3A">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<style>html,body{height:100%}body{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}img{max-width:100%}[hidden]{display:none!important}</style>
'''
tail='<script>if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js").then(r=>{r.update();setInterval(()=>r.update(),60*60*1000)}).catch(()=>{});let rl=false;navigator.serviceWorker.addEventListener("controllerchange",()=>{if(!rl){rl=true;location.reload()}})}</script>\n</body>\n</html>\n'
out=head+"<title>Adnan's Launchpad</title>\n<style>\n"+rd('style.css')+"\n</style>\n</head>\n<body>"+rd('body.html')+"\n<script>\n"+js+"\n</script>\n"+tail
open(os.path.join(R,'index.html'),'w').write(out)
open(os.path.join(R,'follow.html'),'w').write(out.replace('<body>','<body>\n<script>window.FOLLOW=true</script>',1).replace("<title>Adnan's Launchpad</title>","<title>Advisor · Adnan's Launchpad</title>",1))
p=os.path.join(R,'sw.js');w=open(p).read();w=re.sub(r"adnan-lp-[\w.]+'","adnan-lp-"+ver+"'",w,count=1);open(p,'w').write(w)
print('built',len(out),'cache',ver)
