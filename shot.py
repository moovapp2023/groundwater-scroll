import sys,json,glob,time
from playwright.sync_api import sync_playwright
J="js/node_modules/"
def route(p):
    def h(r):
        u=r.request.url
        if "gsap.min.js" in u: return r.fulfill(path=J+"gsap/dist/gsap.min.js",content_type="application/javascript")
        if "ScrollTrigger.min.js" in u: return r.fulfill(path=J+"gsap/dist/ScrollTrigger.min.js",content_type="application/javascript")
        if "fonts.googleapis.com" in u:
            css="".join(f"@font-face{{font-family:'{n}';font-weight:{w};src:url(https://localfont/{f})}}" for n,w,f in (("Archivo Black",400,"ab.woff2"),("Inter",700,"in.woff2"),("Space Mono",700,"sm.woff2")))
            return r.fulfill(body=css,content_type="text/css")
        if "localfont" in u:
            m={"ab.woff2":J+"@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff2","in.woff2":J+"@fontsource/inter/files/inter-latin-700-normal.woff2","sm.woff2":J+"@fontsource/space-mono/files/space-mono-latin-700-normal.woff2"}
            return r.fulfill(path=m[u.split('/')[-1]],content_type="font/woff2",headers={"access-control-allow-origin":"*"})
        r.continue_()
    p.route("**/*",h)
def run(w,h,times,full,prefix):
    with sync_playwright() as pw:
        b=pw.chromium.launch(); pg=b.new_page(viewport={"width":w,"height":h}); route(pg)
        errs=[]; pg.on("console",lambda m: errs.append(m.text) if m.type in("error","warning") else None); pg.on("pageerror",lambda e:errs.append(str(e)))
        pg.goto("file:///tmp/claude-0/-home-claude/3622009c-eafe-539c-a332-8e6c1c046646/scratchpad/site/index.html"+("?full" if full else ""))
        pg.wait_for_timeout(1200)
        total=pg.evaluate("__total"); 
        for t in times:
            y=pg.evaluate(f"(()=>{{const s=__st; return s.start+({t}/__total)*(s.end-s.start)}})()")
            pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(1800)
            pg.evaluate("document.fonts.ready")
            pg.screenshot(path=f"shots/{prefix}_{t}.png")
        print("total",total,"errors",errs[:8]); b.close()
if __name__=="__main__":
    import os; os.makedirs("shots",exist_ok=True)
    mode=sys.argv[1]
    if mode=="full": run(1227,1088,[0.9,5.4,8.8,13.8,19.8,24.8],True,"full")
    if mode=="desk": run(1440,810,[0.9,5.4,8.8,13.8,19.8,24.8],False,"desk")
    if mode=="mob": run(375,740,[0.9,5.4,13.8,19.8,24.8],False,"mob")
