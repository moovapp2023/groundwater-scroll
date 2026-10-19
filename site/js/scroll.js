gsap.registerPlugin(ScrollTrigger);
const CD = JSON.parse(document.getElementById('curvedata').textContent);
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const stage = $('#stage'), world = $('#world');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- curve: one path, three poses ---------- */
const [bx0,by0,bx1,by1] = CD.bbox4, [cx0,cy0,cx1,cy1] = CD.bbox25;
const sx = (cx1-cx0)/(bx1-bx0), sy = (cy1-cy0)/(by1-by0);
const pose4 = CD.p4, pose55 = CD.p55;
const pose25 = pose4.map((v,i)=> i%2===0 ? cx0+(v-bx0)*sx : cy0+(v-by0)*sy);
function dFrom(n){ let i=0, o=''; for(const [c,k] of CD.tmpl){ o+=c; for(let j=0;j<k;j++){ o+=(+n[i++].toFixed(2))+(j<k-1?' ':''); } } return o; }
const curve = $('#curve'), curveState = {t:0, draw:0};
function paintCurve(){
  const t = curveState.t; let a,b,u,sw;
  if(t<=1){ a=pose25; b=pose4; u=t; sw=35+(90-35)*u; } else { a=pose4; b=pose55; u=t-1; sw=90; }
  const n = a.map((v,i)=> v+(b[i]-v)*u);
  curve.setAttribute('d', dFrom(n)); curve.setAttribute('stroke-width', sw);
  curve.style.strokeDasharray = '1 1'; curve.style.strokeDashoffset = 1-curveState.draw;
}
paintCurve();

/* ---------- labels ---------- */
const LAB = [
 {id:'t860',  txt:'860 km3', k:'sans', fs:205, x:3654, y:1434},
 {id:'tAgo',  txt:'← 30,000 years ago', k:'sans', fs:205, x:69, y:4467},
 {id:'t1960', txt:'1960', k:'sans', fs:205, x:3663, y:4467, c:1},
 {id:'t2020', txt:'2020', k:'sans', fs:205, x:3502, y:4467, c:1},
 {id:'t202',  txt:'202 years\nleft', k:'mono', fs:209, x:4605, y:2460, lh:.79},
 {id:'tLess', txt:'less usable &\nharder to get', k:'mono blue', fs:135, x:4011, y:2250, lh:.85},
 {id:'tHead', txt:'THIS MUCH IS\nGONE FOREVER', k:'arch', fs:165, x:2669, y:1971, lh:.89, min:15},
 {id:'tNever',txt:'NEVER\nCOMING\nBACK PART', k:'arch', fs:150, x:3603, y:1872, lh:.8, min:15},
 {id:'tFuture',txt:'FUTURE,\nPROBABLY', k:'arch', fs:150, x:4101, y:4188, lh:.78, c:1, ta:'center', min:15},
 {id:'tWhere',txt:'where did this go?', k:'sans', fs:200, x:2420, y:1950, c:1, min:17},
];
const BAR4 = [[2122,2662,306],[2840,2949,306],[3349,2910,306],[3646,3100,330],[3897,3370,330],[4233,3515,427]];
const BAR5 = [[1796,2585,295],[2369,2828,330],[2775,2712,329],[3011,2844,368],[3211,3163,263],[3478,3278,342]];
const PILE = [[3694,3568],[3750,3615],[3792,3650],[3830,3689],[3859,3717],[3884,3743]];
BAR4.forEach((b,i)=>LAB.push({id:'dr'+i, txt:'Drought', k:'arch', fs:102, x:b[0]+5, y:b[1]+b[2]+40, c:1, min:11}));
PILE.forEach((p,i)=>LAB.push({id:'pile'+i, txt:'Drought', k:'arch', fs:102, x:p[0], y:p[1], min:11}));
const labels = $('#labels'); const POS={};
LAB.forEach(L=>{
  const e=document.createElement('div'); e.className='t '+L.k; e.id=L.id; e.textContent=L.txt;
  if(L.lh) e.style.lineHeight=L.lh; if(L.ta) e.style.textAlign=L.ta; e.dataset.fs=L.fs; e.dataset.min=L.min||13;
  labels.appendChild(e);
  POS[L.id]={x:L.x,y:L.y-0.14*L.fs}; gsap.set(e,{x:POS[L.id].x, y:POS[L.id].y, xPercent:L.c?-50:0});
});
const EL = id => document.getElementById(id);

/* ---------- camera ---------- */
const cam = {cx:2300, cy:3050, w:4800, h:3900};
let curScale = 1;
const FULL = location.search.includes('full');
function applyCam(){
  const vw=stage.clientWidth, vh=stage.clientHeight;
  const C = FULL?{cx:3067.5,cy:2720,w:6135,h:5440}:cam;
  const s = Math.min(vw/C.w, vh/C.h); curScale=s;
  world.style.transform = `translate(${vw/2-C.cx*s}px,${vh/2-C.cy*s}px) scale(${s})`;
  for(const e of labels.children){ const fs=+e.dataset.fs, mn=+e.dataset.min; e.style.fontSize = Math.max(fs, mn/s)+'px'; }
}

/* ---------- timeline ---------- */
const tl = gsap.timeline({defaults:{ease:'power2.inOut'}, onUpdate:applyCam});
const camTo = (c,at,d=2)=> tl.to(cam,{...c,duration:d},at);
const fade = (t,at,v=1,d=.6)=> tl.to(t,{opacity:v,duration:d,ease:'none'},at);
const bars = $$('.bar');

gsap.set(['#blockParts','#band2','#band4','#wedge','#dashArrow2'],{opacity:0});
gsap.set('#hatchWrap',{opacity:1});
fade(EL('t860'),0.1,1,.01); fade(EL('tAgo'),0.1,1,.01); fade(EL('t1960'),0.1,1,.01);
tl.set(cam,{...cam},0);

/* S1 -> S2 */
tl.to('#blockFlat',{attr:{x:2407,width:1238},duration:2,ease:'power2.inOut'},1);
fade([EL('tAgo'),EL('t860'),'#leader860'],1,0,.7);
tl.to(EL('t1960'),{x:2526,duration:2},1);
camTo({cx:3950,cy:3150,w:3900,h:3500},1,2.4);
tl.set('#blockParts',{opacity:1},3.05); tl.set('#blockFlat',{opacity:0},3.05);
fade('#flatTop',3.4,0,.8);
tl.to(curveState,{draw:1,duration:1.4,ease:'none',onUpdate:paintCurve},3.0);
fade(EL('t2020'),3.2,1,.6);
fade('#band2',3.7,1,.6);
fade(EL('t202'),4.2,1,.6);
tl.set('#dashArrow2',{opacity:1},4.3);
tl.to('#dashClipRect',{attr:{width:900},duration:1.0,ease:'none'},4.3);

/* S3: gradient + "less usable" */
fade('#gradLayer',6,1,1.2); fade('#gradSide',6.6,1,.8);
fade([EL('t202'),'#dashArrow2',EL('t1960'),EL('t2020')],6,0,.6);
tl.fromTo(EL('tLess'),{opacity:0,xPercent:12},{opacity:1,xPercent:0,duration:.9,ease:'power2.out'},7);

/* S4: curve centered, bigger; block disappears; labels fly in */
fade(['#gradLayer','#gradSide','#blockParts',EL('tLess')],9,0,1);
tl.to(curveState,{t:1,duration:2.2,ease:'power2.inOut',onUpdate:paintCurve},9);
fade('#band2',9,0,.8); fade('#band4',10,1,1);
camTo({cx:2950,cy:3050,w:3500,h:2950},9,2.2);
fade('#bars',11,1,.1);
tl.fromTo(bars,{scaleY:0,transformOrigin:'50% 0%'},{scaleY:1,duration:.9,stagger:.12,ease:'power2.out'},11);
fade(EL('tHead'),11.2,1,.8);
for(let i=0;i<6;i++){ const P=POS['dr'+i]; tl.fromTo(EL('dr'+i),{opacity:0,y:P.y+40},{opacity:1,y:P.y,duration:.5,ease:'power2.out'},11.6+i*.12); }

/* S5: curve shrinks left, wedge + arrow + pile labels */
const kx=0.7915, tx=1275-1454*kx, ky=0.75, ty=2287-2285*ky;
fade(EL('tHead'),14,0,.6);
tl.to(curveState,{t:2,duration:2,ease:'power2.inOut',onUpdate:paintCurve},14);
tl.to('#band4',{x:tx,y:ty,scaleX:kx,scaleY:ky,svgOrigin:'0 0',duration:2},14);
camTo({cx:2950,cy:3150,w:3700,h:3050},14,2);
bars.forEach((b,i)=>{ const p=BAR5[i]; tl.to(b,{attr:{x:p[0],y:p[1],height:p[2]},duration:2},14); });
for(let i=0;i<6;i++){ const p=BAR5[i]; tl.to(EL('dr'+i),{x:p[0]+5,y:p[1]+p[2]+20-0.14*102,duration:2},14); }
tl.fromTo('#wedge',{opacity:0,x:500},{opacity:1,x:0,duration:1.2,ease:'power2.out'},16);
fade('#arrow5',16.8,1,.1);
tl.to('#arrowClipRect',{attr:{width:900},duration:1.1,ease:'none'},16.8);
fade(EL('tNever'),16.6,1,.8);
for(let i=0;i<6;i++){ const P=POS['pile'+i]; tl.fromTo(EL('pile'+i),{opacity:0,x:P.x-160,y:P.y-80},{opacity:1,x:P.x,y:P.y,duration:.5,ease:'power2.out'},17.6+i*.15); }
fade(EL('tFuture'),18.4,1,.8);

/* S5.5: clear stage, hatch fades up */
fade(['#band4','#wedge','#arrow5','#bars',EL('tNever'),EL('tFuture')].concat(
  Array.from({length:6},(_,i)=>EL('dr'+i)),
  Array.from({length:6},(_,i)=>EL('pile'+i))
),20.5,0,.9);
camTo({cx:2420,cy:2800,w:3000,h:2700},20.5,2);
tl.to('#hatchClipRect',{attr:{y:2200,height:1100},duration:2.2,ease:'power1.inOut'},21.8);
fade(EL('tWhere'),23.2,1,.8);
tl.to({},{duration:1.2},24.2);

applyCam();

const total = tl.duration();

/* ---------- step heights (called after both timelines are built) ---------- */
function setStepHeights(){
  const h1 = Math.ceil(innerHeight * (total * 0.55 + 1) / 6);
  $$('#story .step').forEach(s => s.style.minHeight = h1 + 'px');
  if(typeof tl2 !== 'undefined'){
    const h2 = Math.ceil(innerHeight * (tl2.duration() * 0.55 + 1) / 6);
    $$('#story2 .step').forEach(s => s.style.minHeight = h2 + 'px');
  }
}

addEventListener('resize', ()=>{ setStepHeights(); applyCam(); applyCam2(); ScrollTrigger.refresh(); });

/* ---------- ScrollTrigger: story 1 ---------- */
const st = ScrollTrigger.create({
  trigger: '#story',
  start: 'top top',
  end: () => '+=' + Math.round(innerHeight * (reduce ? 0.01 : total * 0.55)),
  scrub: reduce ? true : 0.7,
  animation: tl,
  invalidateOnRefresh: true
});

/* ==================== STORY 2: FRAME 6 / 7 BAR CHARTS ==================== */

const stage2 = document.getElementById('stage2');
const world2 = document.getElementById('world2');
const labels2 = document.getElementById('labels2');

/* ---------- camera 2 ---------- */
const cam2 = {cx:3073, cy:3035, w:1700, h:3600};
function applyCam2(){
  if(!stage2) return;
  const vw=stage2.clientWidth, vh=stage2.clientHeight;
  const s=Math.min(vw/cam2.w, vh/cam2.h);
  world2.style.transform=`translate(${vw/2-cam2.cx*s}px,${vh/2-cam2.cy*s}px) scale(${s})`;
  for(const e of labels2.children){ const fs=+e.dataset.fs, mn=+e.dataset.min; e.style.fontSize=Math.max(fs,mn/s)+'px'; }
}
applyCam2();

/* ---------- morph data: [id, f6x, f6y, f6w, f6h, f7x, f7y, f7w, f7h] ---------- */
const MORPH = [
  ["Rectangle 83",3289.0,1883.8,22.8,2505.2,1160,3327,192,890],
  ["Rectangle 84",3311.0,1893.4,22.1,2495.6,1343,3371,193,846],
  ["Rectangle 85",3332.3,1892.2,22.1,2496.8,1526,3301,193,916],
  ["Rectangle 86",3353.6,1910.2,22.8,2478.8,1709,3610,193,607],
  ["Rectangle 87",3374.8,1897.0,22.1,2492.0,1893,3584,192,633],
  ["Rectangle 88",3396.1,1876.6,22.8,2512.4,2076,3262,192,955],
  ["Rectangle 89",3418.1,1927.0,22.1,2462.0,2260,3161,193,1056],
  ["Rectangle 90",3438.6,1947.4,22.8,2441.6,2443,3120,193,1097],
  ["Rectangle 91",3460.7,1967.8,22.1,2421.2,2627,3423,192,794],
  ["Rectangle 92",3481.9,1899.4,22.8,2489.6,2812,3599,193,618],
  ["Rectangle 93",3503.2,1903.0,22.1,2486.0,2996,3217,192,1000],
  ["Rectangle 94",3525.3,1948.6,22.1,2440.4,3183,3037,192,1180],
  ["Rectangle 95",3546.5,1954.6,22.8,2434.4,3370,2852,192,1365],
  ["Rectangle 96",3567.0,1939.0,22.8,2450.0,3553,2711,193,1506],
  ["Rectangle 97",3589.1,1924.6,22.1,2464.4,3738,3099,192,1118],
  ["Rectangle 98",3611.1,1897.0,22.1,2492.0,3921,3599,192,618],
  ["Rectangle 99",3631.6,1863.4,22.8,2525.6,4108,3336,192,881],
  ["Rectangle 100",3652.9,1888.6,22.8,2500.4,4291,3599,193,618],
  ["Rectangle 101",3674.9,1876.6,22.1,2512.4,4474,3245,193,972]
];
const NON_TRANS_RED = ["Rectangle 44","Rectangle 45","Rectangle 46","Rectangle 47","Rectangle 49","Rectangle 48","Rectangle 50","Rectangle 51","Rectangle 52","Rectangle 53","Rectangle 54","Rectangle 56","Rectangle 57","Rectangle 58","Rectangle 59","Rectangle 60","Rectangle 61","Rectangle 62","Rectangle 63","Rectangle 64","Rectangle 65","Rectangle 66","Rectangle 67","Rectangle 68","Rectangle 69","Rectangle 70","Rectangle 71","Rectangle 72","Rectangle 73","Rectangle 74","Rectangle 75","Rectangle 76","Rectangle 77","Rectangle 78","Rectangle 79","Rectangle 80","Rectangle 81","Rectangle 82","Rectangle 55"];
const BLUE_IDS = ["Rectangle 145","Rectangle 102","Rectangle 103","Rectangle 104","Rectangle 105","Rectangle 106","Rectangle 108","Rectangle 107","Rectangle 109","Rectangle 110","Rectangle 111","Rectangle 112","Rectangle 113","Rectangle 115","Rectangle 116","Rectangle 117","Rectangle 118","Rectangle 119","Rectangle 120","Rectangle 121","Rectangle 122","Rectangle 123","Rectangle 124","Rectangle 125","Rectangle 126","Rectangle 127","Rectangle 128","Rectangle 129","Rectangle 130","Rectangle 131","Rectangle 132","Rectangle 133","Rectangle 134","Rectangle 135","Rectangle 136","Rectangle 137","Rectangle 138","Rectangle 139","Rectangle 140","Rectangle 141","Rectangle 142","Rectangle 143","Rectangle 144","Rectangle 146","Rectangle 147","Rectangle 148","Rectangle 149","Rectangle 150","Rectangle 151","Rectangle 152","Rectangle 153","Rectangle 154","Rectangle 155","Rectangle 114"];

/* scope lookups to svg2 to avoid ID conflicts with story 1 */
const svg2 = stage2 ? stage2.querySelector('svg') : null;
function EL2(id){ return svg2 ? svg2.querySelector(`[id="${id}"]`) : null; }

/* ---------- story2 labels ---------- */
const LAB2 = [
  {id:'t2Cities', txt:'Cities',                        k:'arch blue',  fs:200, x:2570, y:1500, c:1},
  {id:'t2Agri',   txt:'Agriculture',                   k:'arch',       fs:200, x:3072, y:3900, c:1, col:'#fff'},
  {id:'t21960',   txt:'1960',                          k:'sans',       fs:180, x:2440, y:4490},
  {id:'t22020',   txt:'2020',                          k:'sans',       fs:180, x:3705, y:4490, c:1},
  {id:'t2TFW',    txt:'Total farm water usage (100%)', k:'mono blue',  fs:110, x:1185, y:2025},
  {id:'t2GW',     txt:'Groundwater  %',                k:'arch',       fs:200, x:1650, y:3950, col:'#fff'},
  {id:'t22002',   txt:'2002',                          k:'sans',       fs:180, x:1160, y:4360},
  {id:'t22022',   txt:'2022',                          k:'sans',       fs:180, x:4900, y:4360, c:1},
  {id:'t270pct',  txt:'70%',                           k:'arch',       fs:200, x:3580, y:2530, c:1, col:'#FB5D5D'},
  {id:'t2DPk',    txt:'DROUGHT\nPEAKS',               k:'arch',       fs:130, x:3750, y:4460, c:1, lh:.85, col:'#FB5D5D'},
  {id:'t2FGW',    txt:'FARM\nGROUNDWATER',            k:'arch',       fs:180, x:1170, y:3200, lh:.85, col:'#FB5D5D'},
  {id:'t2DryW',   txt:'REPORTED DRY WELLS',           k:'arch',       fs:170, x:4050, y:4480, c:1},
  {id:'t2Ax250',  txt:'·250',                    k:'sans',       fs:140, x:6080, y:2250},
  {id:'t2Ax150',  txt:'·150',                    k:'sans',       fs:140, x:6080, y:3010},
  {id:'t2Ax50',   txt:'·50',                     k:'sans',       fs:140, x:6080, y:3770},
  {id:'t22012',   txt:'2012',                          k:'sans',       fs:180, x:2996, y:4370},
  {id:'t22026',   txt:'2026',                          k:'sans',       fs:180, x:5750, y:4370, c:1},
];
const POS2 = {};
LAB2.forEach(L=>{
  const e=document.createElement('div'); e.className='t '+L.k; e.id=L.id;
  e.textContent=L.txt;
  if(L.lh) e.style.lineHeight=L.lh;
  if(L.col) e.style.color=L.col;
  e.dataset.fs=L.fs; e.dataset.min=L.min||13;
  labels2.appendChild(e);
  POS2[L.id]={x:L.x, y:L.y-0.14*L.fs};
  gsap.set(e,{x:POS2[L.id].x, y:POS2[L.id].y, xPercent:L.c?-50:0});
});

const nonTransEls = NON_TRANS_RED.map(EL2).filter(Boolean);
const blueEls = BLUE_IDS.map(EL2).filter(Boolean);
const outline2 = EL2('Rectangle 367');
const f7r104 = document.getElementById('f7r104');
const f7r105 = document.getElementById('f7r105');
const f7dotline = document.getElementById('f7dotline');

/* ---------- timeline 2 ---------- */
const tl2 = gsap.timeline({defaults:{ease:'power2.inOut'}, onUpdate:applyCam2});
const cam2To = (c,at,d=2)=> tl2.to(cam2,{...c,duration:d},at);
const fade2 = (t,at,v=1,d=.6)=> tl2.to(t,{opacity:v,duration:d,ease:'none'},at);
tl2.set(cam2,{...cam2},0);

/* S7: Frame 6 hold */
cam2To({cx:3073,cy:3035,w:1700,h:3600}, 0.1, 1.8);
tl2.to({},{duration:3},2);  // hold on Frame 6
fade2([document.getElementById('t2Cities'),document.getElementById('t2Agri'),
       document.getElementById('t21960'),document.getElementById('t22020')], 1.5, 1, 0.7);

/* S8: outline + non-transition bars fade, morph begins */
const rect160 = EL2('Rectangle 160');
const fadeOuts2 = [...nonTransEls,...blueEls,outline2,rect160].filter(Boolean);
fade2([document.getElementById('t2Cities'),document.getElementById('t2Agri'),
       document.getElementById('t21960'),document.getElementById('t22020')], 5, 0, 0.6);
fade2(fadeOuts2, 5, 0, 1.8);
cam2To({cx:3200,cy:3300,w:4600,h:2600}, 5, 3.5);
MORPH.forEach((m,i)=>{
  const el = EL2(m[0]);
  if(!el) return;
  tl2.to(el,{attr:{x:m[5],y:m[6],width:m[7],height:m[8]},duration:2.5,ease:'power2.inOut'},5.5+i*0.04);
});
/* 2021-2022 bars grow in — must make visible first */
tl2.set([f7r104,f7r105],{opacity:1},8.0);
tl2.fromTo(f7r104,{attr:{height:0,y:4217}},{attr:{height:1269,y:2948},duration:1,ease:'power2.out'},8.2);
tl2.fromTo(f7r105,{attr:{height:0,y:4217}},{attr:{height:1350,y:2867},duration:1,ease:'power2.out'},8.5);
fade2(f7dotline, 9.2, 1, 0.8);
fade2([document.getElementById('t2TFW'),document.getElementById('t2GW'),
       document.getElementById('t22002'),document.getElementById('t22022')], 9.5, 1, 0.8);

/* S9: Frame 8 dry-well bars + axes appear over Frame 7 */
const f8bars = document.getElementById('f8bars');
const f8lines = document.getElementById('f8lines');
fade2([f8bars,f8lines], 11.5, 1, 1.5);
cam2To({cx:3300,cy:3200,w:4800,h:2800}, 11.5, 2);

/* S10: 70% + DROUGHT PEAKS annotation */
const f8arrow = document.getElementById('f8arrow');
fade2(document.getElementById('t270pct'), 17.5, 1, 0.6);
fade2([f8arrow,document.getElementById('t2DPk')], 17.8, 1, 0.7);

/* S11: camera shifts to Frame 9 pose — zoomed to 2012+ with axes */
fade2([document.getElementById('t2TFW'),document.getElementById('t22002'),
       document.getElementById('t22022')], 22, 0, 0.5);
cam2To({cx:4600,cy:3200,w:3400,h:2700}, 22.5, 2.5);
fade2([document.getElementById('t2FGW'),document.getElementById('t2DryW')], 24, 1, 0.8);
fade2([document.getElementById('t2Ax250'),document.getElementById('t2Ax150'),
       document.getElementById('t2Ax50')], 24.5, 1, 0.6);
fade2([document.getElementById('t22012'),document.getElementById('t22026')], 24, 1, 0.6);

/* S12: Frame 10 colored bars — fade out black bars, fade in colored */
const f10wrap = document.getElementById('f10wrap');
fade2([f8bars,f8lines,f8arrow,f7dotline,
       document.getElementById('t270pct'),document.getElementById('t2DPk'),
       document.getElementById('t2FGW'),document.getElementById('t2DryW'),
       document.getElementById('t2Ax250'),document.getElementById('t2Ax150'),
       document.getElementById('t2Ax50'),document.getElementById('t22012'),
       document.getElementById('t22026')], 30, 0, 1.2);
cam2To({cx:2900,cy:3800,w:5000,h:2800}, 30, 2.5);
fade2(f10wrap, 31.5, 1, 1.5);
tl2.to({},{duration:2},34);

/* ---------- ScrollTrigger: story 2 ---------- */
let tl2Total = tl2.duration();
const st2 = ScrollTrigger.create({
  trigger: '#story2',
  start: 'top top',
  end: () => '+=' + Math.round(innerHeight * (reduce ? 0.01 : tl2Total * 0.55)),
  scrub: reduce ? true : 0.7,
  animation: tl2,
  invalidateOnRefresh: true
});

setStepHeights();
window.__tl=tl; window.__tl2=tl2; window.__st=st; window.__st2=st2; window.__total=total;
