# Build index.html + follow.html at the repo root from build/src. Usage: python3 build/make.py v3
import os,re,sys,datetime
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));S=os.path.join(R,'build','src')
rd=lambda f:open(os.path.join(S,f)).read()
ver=sys.argv[1] if len(sys.argv)>1 else 'dev'
import json
def kata2hira(x):return ''.join(chr(ord(c)-0x60) if 'ァ'<=c<='ヶ' else c for c in x)
KJ=re.compile(r'[\u4e00-\u9fff々]')
def ruby(orig,hira):
    # align kana runs in the surface with the reading so furigana sits only over kanji
    parts=re.findall(r'[\u4e00-\u9fff々]+|[^\u4e00-\u9fff々]+',orig)
    pat=''.join('(.+?)' if KJ.match(p) else re.escape(kata2hira(p)) for p in parts)
    m=re.fullmatch(pat,hira)
    if not m:return '<ruby>'+orig+'<rt>'+hira+'</rt></ruby>'
    g=iter(m.groups());return ''.join('<ruby>'+p+'<rt>'+next(g)+'</rt></ruby>' if KJ.match(p) else p for p in parts)
def build_ja():
    d=os.path.join(S,'ja')
    if not os.path.isdir(d):return ''
    J={k:json.load(open(os.path.join(d,k+'.json'),encoding='utf-8')) for k in ['ui','compass','launch']}
    ui=dict(J['ui']['ui']);ui.update({'@'+k:v for k,v in J['ui'].get('ui_blocks',{}).items()})
    data={'ui':ui,'re':J['ui'].get('re',[]),'tracks':J['launch']['tracks'],'m':J['launch']['m'],'compass':J['compass']}
    import pykakasi;kk=pykakasi.kakasi();furi={};over=J['ui'].get('readings',{})
    def walk(o):
        if isinstance(o,str):
            for seg in re.split(r'<[^>]+>',o):
                if KJ.search(seg):
                    for tk in kk.convert(seg):
                        if KJ.search(tk['orig']):furi[tk['orig']]=ruby(tk['orig'],over.get(tk['orig'],tk['hira']))
        elif isinstance(o,dict):[walk(v) for v in o.values()]
        elif isinstance(o,list):[walk(v) for v in o]
    walk(data);
    for k,v in over.items():furi[k]=ruby(k,v)
    data['furi']=furi
    return 'const JA_DATA='+json.dumps(data,ensure_ascii=False)+';'
order=['core.js','app.js','icons.js','helpers.js','adnan.js','compass.js']
extra=sorted(f for f in os.listdir(S) if f.endswith('.js') and f not in order)  # batch files: labs_mba.js, data_mba.js ...
js='\n'.join([rd('core.js'),build_ja(),f"const BUILD='{ver} · {datetime.date.today()}';"]+[rd(f) for f in order[1:]+extra]+['boot();'])
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
