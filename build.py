import re, json
S="svg/"
def rd(n): return open(S+n+".svg").read()
def group(s, gid):
    i=s.index('<g id="%s"'%gid); j=s.index('>',i)+1; depth=1; k=j
    while depth:
        a=s.find('<g',k); b=s.find('</g>',k)
        if a!=-1 and a<b: depth+=1; k=a+2
        else: depth-=1; k=b+4
    return s[i:k]
def inner(g):
    a=g.index('>')+1; return g[a:g.rindex('</g>')]
def tag(s, eid):
    i=s.index('id="%s"'%eid); st=s.rfind('<',0,i); en=s.index('/>',i)+2; return s[st:en]
def defs(s):
    a=s.find('<defs>'); return s[a+6:s.index('</defs>')] if a!=-1 else ''
def attr(t,a): return re.search(r'\s%s="([^"]*)"'%a,t).group(1)
def setid(t,new): return re.sub(r'\sid="[^"]*"',' id="%s"'%new,t,1)

f25=rd("Frame_2.5_no_text"); f3=rd("Frame_3_no_text"); f4=rd("Frame_4_centered_curve")
f5=rd("Frame_5_no_text"); f55=rd("Frame_5.5_no_text"); f55b=rd("Frame_5.5_bis_no_text"); f5t=rd("Frame_5_some_text")

band2=inner(group(f25,"Rectangle 34")); band4=inner(group(f4,"Rectangle 34")); wedge=inner(group(f5,"Rectangle 35"))
R12=tag(f25,"Rectangle 12"); R33=tag(f25,"Rectangle 33")
R43=tag(f3,"Rectangle 43"); R45=tag(f3,"Rectangle 45"); V6=tag(f3,"Vector 6")
V4=tag(f5,"Vector 4"); V12=tag(f5,"Vector 12")
hatch=group(f55b,"Rectangle 12")
hatchDefs=defs(f55b)
d3=defs(f3)
P4=attr(tag(f4,"Rectangle 41"),"d"); P55=attr(tag(f55,"Rectangle 41"),"d")
P25=attr(tag(f25,"Rectangle 42"),"d")
def nums(d): return [float(x) for x in re.findall(r'-?\d*\.?\d+(?:e-?\d+)?',d)]
cmds=re.findall(r'[A-Za-z]',P4)
tok=re.findall(r'([A-Za-z])|(-?\d*\.?\d+(?:e-?\d+)?)',P4)
tmpl=[];
for c,n in tok:
    if c: tmpl.append([c,0])
    else: tmpl[-1][1]+=1
n4=nums(P4); n55=nums(P55); assert len(n4)==len(n55)
x0,x1=min(n4[0::2]),max(n4[0::2])
data=dict(tmpl=tmpl,p4=n4,p55=n55,
  bbox4=[1454,2317.01,4290,3452.87],bbox25=[2406,1660,3631,2075.53])

# --- Frame 6 / 7 bar chart content ---
f6=rd("Frame_6_no_text"); f7b=rd("Frame_7_bar")
f6_inner=inner(group(f6,"Frame 6 no text"))
# strip white background rect
f6_inner=re.sub(r'\s*<rect[^>]+fill="white"[^/]*/>\s*','\n',f6_inner,count=1).strip()
f7_line=tag(f7b,"Line 88")

html=open("template.html").read()
rep={
"%%DEFS3%%":d3,"%%HATCHDEFS%%":hatchDefs,
"%%BAND2%%":band2,"%%BAND4%%":band4,"%%WEDGE%%":wedge,
"%%R12%%":R12,"%%R33%%":R33,"%%R43%%":R43,"%%R45%%":R45,"%%V6%%":V6,
"%%V4%%":V4,"%%V12%%":V12,"%%HATCH%%":hatch,
"%%CURVEDATA%%":json.dumps(data),
"%%F6BARS%%":f6_inner,
"%%F7LINE%%":f7_line,
}
for k,v in rep.items(): html=html.replace(k,v)
open("site/index.html","w").write(html)
print(len(html))
