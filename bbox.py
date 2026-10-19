import re,json,sys
from playwright.sync_api import sync_playwright
files=["Frame_4_centered_curve","Frame_5.5_no_text","Frame_5.5_bis_no_text","Frame_5_no_text","Frame_5_some_text","Frame_4_label_bars","Frame_2.5_no_text"]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page()
    for f in files:
        s=open(f"svg/{f}.svg").read()
        pg.set_content(f"<body style='margin:0'>{s}</body>")
        r=pg.evaluate("""()=>{const svg=document.querySelector('svg');const out=[];
        svg.querySelectorAll('path,rect').forEach((e,i)=>{ if(e.closest('defs,clipPath,filter,pattern')) return; if(e.getAttribute('width')==='6135') return;
          const bb=e.getBBox(); const sw=parseFloat(e.getAttribute('stroke-width')||0);
          out.push([e.id||('#'+i),e.getAttribute('fill')||'',e.getAttribute('stroke')||'',sw,Math.round(bb.x),Math.round(bb.y),Math.round(bb.x+bb.width),Math.round(bb.y+bb.height)]);});
          return out}""")
        print("==",f)
        for x in r: print("  ",x)
    b.close()
