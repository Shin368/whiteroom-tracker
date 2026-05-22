import { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAqA4ujuLYv_LRBScFgMLUR8Q4OpNtpaYg",
  authDomain: "whiteroom-7e722.firebaseapp.com",
  databaseURL: "https://whiteroom-7e722-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "whiteroom-7e722",
  storageBucket: "whiteroom-7e722.firebasestorage.app",
  messagingSenderId: "49314893660",
  appId: "1:49314893660:web:f24ac367ba926b8fee7b99",
  measurementId: "G-DV8FXBT3R3"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const DATA_PATH = "whiteroom/data";



const PHASES = [
  { id:"Q1", label:"INITIATE",   color:"#E74C3C", months:"เดือน 1-3",
    subjects:["Math ม.ปลาย","Chemistry","Biology","Physics","MCAT Behav","English/IELTS","Pharmaco"],
    books:["Meditations","Man\'s Search for Meaning","Psychology of Money"] },
  { id:"Q2", label:"STRATEGIST", color:"#27AE60", months:"เดือน 4-6",
    subjects:["MCAT Bio+Biochem","MCAT Chem+Orgo","MCAT Behav","MCAT Phy+Math","Algebra+Trigo","Thai&Social","MCAT Qbook"],
    books:["Thinking Fast & Slow","Influence","The Art of Thinking Clearly"] },
  { id:"Q3", label:"OPERATIVE",  color:"#F39C12", months:"เดือน 7-9",
    subjects:["USMLE Anatomy","USMLE Biochem","USMLE Pathology","Calculus 3","Physics 3","English Adv","USMLE Qbook 1"],
    books:["The Art of War","Thinking Strategically","Poor Charlie\'s Almanack"] },
  { id:"Q4", label:"GHOST",      color:"#8E44AD", months:"เดือน 10-12",
    subjects:["USMLE Micro","USMLE Qbook 2","Integrated Review","English Adv","Math Integration","Ghost Protocol","Philosophy"],
    books:["Range","Being Mortal","How Doctors Think"] },
];
const BLOCKS = [
  {id:"morning",label:"🌅 Morning",  color:"#E74C3C"},
  {id:"math",   label:"📐 Math",     color:"#E74C3C"},
  {id:"science",label:"🔬 Science",  color:"#E74C3C"},
  {id:"deep",   label:"📚 Deep Work",color:"#E74C3C"},
  {id:"physical",label:"💪 Physical",color:"#27AE60"},
  {id:"hobby",  label:"🎯 Hobby",    color:"#8E44AD"},
  {id:"soft",   label:"📖 Soft Know",color:"#3498DB"},
  {id:"cool",   label:"🌙 Cooldown", color:"#7F8C8D"},
];
const RANKS = [
  {rank:"S",pts:5,color:"#FFD700"},{rank:"A",pts:4,color:"#C0C0C0"},
  {rank:"B",pts:3,color:"#CD7F32"},{rank:"C",pts:1,color:"#7F8C8D"},
];
const DOMAINS = [
  "การเรียน","อารมณ์","Social Skills","Strategic","ปรับตัว",
  "พละกำลัง","การพูด","Awareness","Discipline","Pressure",
  "ซ่อนความสามารถ","Influence","โดดเดี่ยว","Long-term","Risk",
  "Objectivity","Image","Patience","Energy","Philosophy",
];
const OAA_LEVELS = [
  {min:90,label:"GHOST",color:"#8E44AD"},{min:80,label:"ELITE",color:"#E74C3C"},
  {min:70,label:"ADVANCED",color:"#27AE60"},{min:60,label:"INTERMEDIATE",color:"#F39C12"},
  {min:50,label:"DEVELOPING",color:"#3498DB"},{min:0,label:"BEGINNING",color:"#7F8C8D"},
];
const IRON_LAWS = [
  "Morning Ritual ก่อนจับโทรศัพท์","Math ก่อน 10:00",
  "Social แค่ 13:30 และ 20:30","Feynman 3 concepts",
  "Anki ทุกวัน","Plan พรุ่งนี้ก่อนนอน",
];
const EXP_QUICK = [
  {l:"Deep Work",e:20},{l:"Complete Task",e:20},{l:"Workout",e:15},
  {l:"No Distract",e:10},{l:"Chess",e:10},{l:"Journal",e:5},{l:"Fix Error",e:10},
];
const BURNOUT = [
  "นอนพอแล้วยังเหนื่อย","ไม่มี motivation ทำ Hobby",
  "Concentration สั้น (<25 นาที)","หงุดหวิดง่ายผิดปกติ",
  "\"ทำไปทำไม\" มากกว่า 1 วัน",
];
const QUOTES = [
  "มึงลงทุนคิดโครงการมาแทบตาย เหลือแค่ทำจริงๆ",
  "60% ทุกวัน ดีกว่า 100% บางวันเสมอ",
  "ความมั่นใจไม่ได้มาก่อนการกระทำ",
  "แข่งกับแค่ตัวเองเมื่อวาน — คนอื่นไม่เกี่ยว",
  "พร้อมแล้ว — ขาดแค่ใบอนุญาต",
];

const calcOAA = (oaa) => {
  const bossAvg = oaa.bossScores?.length ? oaa.bossScores.reduce((a,b)=>a+b,0)/oaa.bossScores.length : 0;
  const academic = Math.round((bossAvg/10)*40);
  const p = oaa.physical||{};
  const push  = p.pushups>=50?5:p.pushups>=35?4:p.pushups>=20?3:0;
  const pull  = p.pullups>=15?5:p.pullups>=10?4:p.pullups>=5?3:0;
  const run   = p.run>0&&p.run<8?5:p.run<=10?4:p.run<=12?3:0;
  const plank = p.plank>=180?5:p.plank>=120?4:p.plank>=60?3:0;
  const physical = push+pull+run+plank;
  const presAvg = oaa.pressureScores?.length ? oaa.pressureScores.reduce((a,b)=>a+b,0)/oaa.pressureScores.length : 0;
  const mental = Math.round((presAvg/50)*10) + Object.values(oaa.mentalSelf||{}).reduce((a,b)=>a+b,0);
  const soft = Math.round(((oaa.domains||[]).reduce((a,b)=>a+b,0)/20/10)*20);
  return {academic,physical,mental,soft,total:academic+physical+mental+soft};
};
const getLevel = (s) => OAA_LEVELS.find(l=>s>=l.min)||OAA_LEVELS[OAA_LEVELS.length-1];
const getWeek  = (start) => Math.max(1,Math.floor((Date.now()-new Date(start))/604800000)+1);
const daysLeft = (start) => { const w=getWeek(start); const d=Math.floor((Date.now()-new Date(start))/86400000)%7; return Math.max(0,(4-((w-1)%4))*7-d); };
const addDays  = (start,n) => { const d=new Date(start+"T12:00:00"); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
const fmtShort = (d) => new Date(d+"T12:00:00").toLocaleDateString("th-TH",{day:"numeric",month:"short",weekday:"short"});
const getSeasonDates = (start) => {
  const weeks = [];
  for(let w=0;w<4;w++){
    const s=addDays(start,w*7);
    const e=addDays(start,w*7+6);
    weeks.push({week:w+1,start:s,end:e,label:`Week ${w+1}`});
  }
  const pfStart=addDays(start,28);
  const playoff={
    start:pfStart,
    quarter:pfStart,
    quarterRest:addDays(pfStart,1),
    semi:addDays(pfStart,2),
    semiRest:addDays(pfStart,3),
    final:addDays(pfStart,4),
    announce:addDays(pfStart,5),
    review:addDays(pfStart,6),
  };
  return {weeks,playoff};
};
const fmtDate  = (d) => new Date(d+"T12:00:00").toLocaleDateString("th-TH",{day:"numeric",month:"short"});
const calcPts  = (r) => { if(!r) return 0; const rk=RANKS.find(x=>x.rank===r.rank); return (rk?.pts||0)+Math.floor((r.exp||0)/100)*2; };
const calcStreak = (daily) => { let s=0,d=new Date(); while(true){const k=d.toISOString().slice(0,10);if(daily?.[k])s++;else break;d.setDate(d.getDate()-1);} return s; };
const physSc = (k,v) => {
  if(k==="pushups") return v>=50?5:v>=35?4:v>=20?3:0;
  if(k==="pullups") return v>=15?5:v>=10?4:v>=5?3:0;
  if(k==="run")     return v>0&&v<8?5:v<=10?4:v<=12?3:0;
  if(k==="plank")   return v>=180?5:v>=120?4:v>=60?3:0;
  return 0;
};
const calcPlayoffRank = (scores) => {
  const {qa,qp,sa,sp,fa,fp} = scores;
  const qt=qa+qp, st=sa+sp, ft=fa+fp, total=qt+st+ft;
  const passQ=qt>=70&&qp>=25, passS=st>=80&&sp>=25, passF=ft>=85&&fp>=30;
  if(!passQ||!passS||!passF) return {label:"❌ Eliminated",color:"#E74C3C",total};
  if(total>=270) return {label:"🥇 Champion",color:"#FFD700",total};
  if(total>=240) return {label:"🥈 Runner-up",color:"#C0C0C0",total};
  if(total>=210) return {label:"🥉 Top 4",color:"#CD7F32",total};
  return {label:"Playoff Player",color:"#27AE60",total};
};
const defData = () => ({
  phase:"Q1",season:1,seasonStart:new Date().toISOString().slice(0,10),
  blocks:{},subjects:{},daily:{},journal:{},weeklyReview:{},
  seasonPts:0,totalEXP:0,ironLaws:{},burnout:{},books:{},
  playoff:{},
  oaa:{bossScores:[],pressureScores:[],
    physical:{pushups:0,pullups:0,run:0,plank:0},
    mentalSelf:{emotion:0,pressure:0,screen:0,recovery:0,visual:0},
    domains:Array(20).fill(0),history:[]},
});

export default function App() {
  const [data,setData] = useState(defData());
  const [view,setView] = useState("dash");
  const [loaded,setLoaded] = useState(false);
  const today = new Date().toISOString().slice(0,10);
  const [blockDate,setBlockDate] = useState(today);
  const [selDate,setSelDate]     = useState(today);
  const [jDate,setJDate]         = useState(today);
  const [dForm,setDForm] = useState({rank:"S",exp:0,note:""});
  const [editRec,setEditRec]     = useState(null);
  const [editSubj,setEditSubj]   = useState(null);
  const [editSubjV,setEditSubjV] = useState(0);
  const [editPts,setEditPts]     = useState(false);
  const [editPtsV,setEditPtsV]   = useState(0);
  const [jForm,setJForm] = useState({good:"",improve:"",feynman:"",energy:5,plan:""});
  const [wrForm,setWrForm] = useState({days:"",rank:"",proud:"",adjust:"",priority:"",mode:"🟢",burnout:[]});
  const [oaaTab,setOaaTab]   = useState("academic");
  const [subTab,setSubTab]   = useState("Q1");
  const [tab2,setTab2]       = useState("daily");
  const [showSet,setShowSet] = useState(false);
  const [qIdx,setQIdx]       = useState(0);
  const [bossIn,setBossIn]   = useState("");
  const [presIn,setPresIn]   = useState("");
  const [pfSeason,setPfSeason] = useState("1");
  const [pfTab,setPfTab]     = useState("q");
  const [pf,setPf] = useState({qa:0,qp_nd:20,qp_bo7:0,qp_ar:0,sa:0,sp_bo7:0,sp_ar:0,sp_sr:15,sp_pl:0,fa:0,fl:0,fp_bo7:0,fp_ar:0,fp_tl:15,fp_fy:0});

  useEffect(()=>{ try{const s=localStorage.getItem("wr-v5");if(s)setData(JSON.parse(s));}catch(e){} setLoaded(true); setQIdx(Math.floor(Math.random()*QUOTES.length)); },[]);
  const save = useCallback((d)=>{ setData(d); try{localStorage.setItem("wr-v5",JSON.stringify(d));}catch(e){} },[]);
  if(!loaded) return <div style={{background:"#0A0E1A",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#E74C3C",fontFamily:"monospace",fontSize:18,letterSpacing:4}}>LOADING...</div>;

  const ph  = PHASES.find(p=>p.id===data.phase);
  const tb  = data.blocks[blockDate]||{};
  const bDone = Object.values(tb).filter(Boolean).length;
  const wk  = getWeek(data.seasonStart);
  const dl  = daysLeft(data.seasonStart);
  const oaa = calcOAA(data.oaa);
  const lv  = getLevel(oaa.total);
  const stk = calcStreak(data.daily);
  const il  = data.ironLaws?.[today]||{};
  const ilD = Object.values(il).filter(Boolean).length;
  const bu  = data.burnout?.[today]||{};
  const buC = Object.values(bu).filter(Boolean).length;
  const cpf = data.playoff?.[pfSeason];

  const qp  = Math.min(50,pf.qp_nd+(pf.qp_bo7*3)+(pf.qp_bo7<5?pf.qp_ar:0));
  const sp  = Math.min(50,(pf.sp_bo7*3)+(pf.sp_bo7<5?pf.sp_ar:0)+pf.sp_sr+pf.sp_pl);
  const fp  = Math.min(50,(pf.fp_bo7*3)+(pf.fp_bo7<5?pf.fp_ar:0)+pf.fp_tl+pf.fp_fy);
  const pfResult = calcPlayoffRank({qa:pf.qa,qp,sa:pf.sa,sp,fa:pf.fa+pf.fl,fp});

  const C = {bg:"#0A0E1A",card:"#111520",bdr:"#1E2535",r:"#E74C3C",g:"#27AE60",o:"#F39C12",p:"#8E44AD",b:"#3498DB",gr:"#7F8C8D",tx:"#E8E8E8",dm:"#7F8C8D",fa:"#3A4050"};
  const S = {
    app:{background:C.bg,minHeight:"100vh",color:C.tx,fontFamily:"\'Courier New\',monospace",paddingBottom:112},
    hdr:{background:"linear-gradient(135deg,#0A0E1A,#141824)",padding:"16px",borderBottom:`1px solid ${C.r}22`},
    card:{background:C.card,border:`1px solid ${C.bdr}`,borderRadius:6,padding:"12px 14px",margin:"8px 12px 0"},
    lbl:{fontSize:9,color:C.dm,letterSpacing:1.5,marginBottom:3,fontWeight:"bold"},
    inp:{background:C.bg,border:`1px solid ${C.bdr}`,borderRadius:4,color:C.tx,padding:"6px 10px",fontSize:11,width:"100%",fontFamily:"monospace"},
    btn:(bg,tc="#fff")=>({background:bg,color:tc,border:"none",borderRadius:4,padding:"6px 12px",cursor:"pointer",fontSize:11,fontWeight:"bold"}),
    sb:(a,ac)=>({background:a?ac:"#1E2535",color:a?"#fff":C.dm,border:"none",borderRadius:4,padding:"5px 8px",cursor:"pointer",fontSize:9,fontWeight:"bold"}),
    row:{display:"flex",gap:6,alignItems:"center"},
    g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},
    g4:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5},
    nav:(a)=>({flex:1,background:"none",border:"none",color:a?C.r:C.fa,cursor:"pointer",padding:"8px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:2}),
  };
  const Bar = ({v=0,max=100,col=C.r})=>(<div style={{height:4,background:C.bdr,borderRadius:2,overflow:"hidden",marginTop:3}}><div style={{height:"100%",width:`${Math.min(100,Math.max(0,v)/max*100)}%`,background:col,transition:"width 0.4s"}}/></div>);
  const Stat = ({n,l,col=C.r})=>(<div style={{flex:1,textAlign:"center",padding:"8px 4px"}}><div style={{fontSize:22,fontWeight:"bold",color:col}}>{n}</div><div style={{fontSize:8,color:C.dm,letterSpacing:1.5,marginTop:2}}>{l}</div></div>);
  const Dv = ()=><div style={{borderTop:`1px solid ${C.bdr}`,margin:"10px 0"}}/>;
  const NI = ({val,onChg,min=0,max=100,col=C.r})=>(<div style={S.row}><button onClick={()=>onChg(Math.max(min,val-1))} style={{...S.btn(C.bdr),flex:0.2,fontSize:13}}>−</button><div style={{flex:1,textAlign:"center",background:C.bg,border:`1px solid ${C.bdr}`,borderRadius:4,padding:6,fontSize:16,fontWeight:"bold",color:col}}>{val}</div><button onClick={()=>onChg(Math.min(max,val+1))} style={{...S.btn(C.bdr),flex:0.2,fontSize:13}}>+</button></div>);

  const toggleBlock=(id)=>{ const nb={...data.blocks}; if(!nb[blockDate]) nb[blockDate]={}; nb[blockDate][id]=!nb[blockDate][id]; save({...data,blocks:nb}); };
  const toggleIL=(i)=>{ const il2={...data.ironLaws}; if(!il2[today]) il2[today]={}; il2[today][i]=!il2[today][i]; save({...data,ironLaws:il2}); };
  const toggleBU=(i)=>{ const bu2={...data.burnout}; if(!bu2[today]) bu2[today]={}; bu2[today][i]=!bu2[today][i]; save({...data,burnout:bu2}); };
  const addEXP=(e)=>{ const old=data.daily[today]; const nd={...data.daily,[today]:{...(old||{rank:"S"}),exp:(old?.exp||0)+e,ts:new Date().toISOString()}}; save({...data,daily:nd,totalEXP:data.totalEXP+e,seasonPts:data.seasonPts+Math.floor(e/100)*2}); };
  const saveRec=()=>{ if(!dForm.rank) return; const rk=RANKS.find(x=>x.rank===dForm.rank); const old=data.daily[selDate]; const np=rk.pts+Math.floor((dForm.exp||0)/100)*2; const nd={...data.daily,[selDate]:{rank:dForm.rank,exp:dForm.exp,note:dForm.note,ts:new Date().toISOString()}}; save({...data,daily:nd,totalEXP:data.totalEXP+(dForm.exp-(old?.exp||0)),seasonPts:data.seasonPts+(np-calcPts(old))}); setDForm({rank:"S",exp:0,note:""}); setEditRec(null); };
  const startEdit=(dk)=>{ const r=data.daily[dk]; if(!r) return; setSelDate(dk); setDForm({rank:r.rank,exp:r.exp||0,note:r.note||""}); setEditRec(dk); };
  const delRec=(dk)=>{ const r=data.daily[dk]; if(!r) return; const nd={...data.daily}; delete nd[dk]; save({...data,daily:nd,totalEXP:Math.max(0,data.totalEXP-(r.exp||0)),seasonPts:Math.max(0,data.seasonPts-calcPts(r))}); if(editRec===dk){setEditRec(null);setDForm({rank:"S",exp:0,note:""});} };
  const saveJournal=()=>save({...data,journal:{...data.journal,[jDate]:{...jForm,ts:new Date().toISOString()}}});
  const delJournal=(d)=>{ const nj={...data.journal}; delete nj[d]; save({...data,journal:nj}); };
  const saveWR=()=>save({...data,weeklyReview:{...data.weeklyReview,[today]:{...wrForm,week:wk,ts:new Date().toISOString()}}});
  const addBoss=()=>{ const v=parseFloat(bossIn)||0; const bs=[...(data.oaa.bossScores||[]),v].slice(-20); save({...data,oaa:{...data.oaa,bossScores:bs}}); setBossIn(""); };
  const delBoss=(i)=>{ const bs=[...data.oaa.bossScores]; bs.splice(i,1); save({...data,oaa:{...data.oaa,bossScores:bs}}); };
  const addPres=()=>{ const v=parseFloat(presIn)||0; const ps=[...(data.oaa.pressureScores||[]),v].slice(-20); save({...data,oaa:{...data.oaa,pressureScores:ps}}); setPresIn(""); };
  const delPres=(i)=>{ const ps=[...data.oaa.pressureScores]; ps.splice(i,1); save({...data,oaa:{...data.oaa,pressureScores:ps}}); };
  const upPhy=(k,v)=>save({...data,oaa:{...data.oaa,physical:{...data.oaa.physical,[k]:parseFloat(v)||0}}});
  const upMen=(k,v)=>save({...data,oaa:{...data.oaa,mentalSelf:{...data.oaa.mentalSelf,[k]:parseInt(v)||0}}});
  const upDom=(i,v)=>{ const d2=[...(data.oaa.domains||Array(20).fill(0))]; d2[i]=parseInt(v)||0; save({...data,oaa:{...data.oaa,domains:d2}}); };
  const saveSnap=()=>{ const snap={...oaa,date:today,month:new Date().toLocaleDateString("th-TH",{month:"long",year:"numeric"})}; save({...data,oaa:{...data.oaa,history:[...(data.oaa.history||[]),snap].slice(-24)}}); };
  const savePlayoff=()=>{ const rank=pfResult; save({...data,playoff:{...data.playoff,[pfSeason]:{qa:pf.qa,qp,sa:pf.sa,sp,fa:pf.fa+pf.fl,fp,total:pfResult.total,rank:pfResult.label,color:pfResult.color,date:today}}}); };
  const toggleBook=(ph2,b)=>{ const nb={...data.books}; nb[`${ph2}-${b}`]=!nb[`${ph2}-${b}`]; save({...data,books:nb}); };
  const applySubj=(k,v)=>{ save({...data,subjects:{...data.subjects,[k]:Math.min(100,Math.max(0,v))}}); setEditSubj(null); };
  const sorted=Object.entries(data.daily||{}).sort((a,b)=>b[0].localeCompare(a[0]));

  const NAVS=[{id:"dash",i:"📊",l:"DASH"},{id:"season",i:"⚔️",l:"SEASON"},{id:"playoff",i:"🏆",l:"PLAYOFF"},{id:"oaa",i:"🎯",l:"OAA"},{id:"journal",i:"✍️",l:"JOURNAL"},{id:"study",i:"📚",l:"STUDY"}];

  return (
    <div style={S.app}>
      <div style={S.hdr}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><div style={{fontSize:17,fontWeight:"bold",letterSpacing:4}}>WHITE<span style={{color:C.r}}>ROOM</span></div><div style={{fontSize:9,color:C.dm,marginTop:2,letterSpacing:1.5}}>S{data.season} · WK{wk} · {ph.id} {ph.label}</div></div>
          <div style={{textAlign:"right"}}><button onClick={()=>setShowSet(!showSet)} style={{...S.btn(C.bdr,C.r),border:`1px solid ${C.r}44`,fontSize:9,padding:"3px 8px"}}>⚙</button><div style={{fontSize:9,color:lv.color,marginTop:3,fontWeight:"bold"}}>OAA {oaa.total} · {lv.label}</div></div>
        </div>
        {showSet&&(<div style={{background:C.bg,border:`1px solid ${C.bdr}`,borderRadius:4,padding:10,marginTop:10}}>
          <div style={{...S.lbl,color:C.r,marginBottom:6}}>SETTINGS</div>
          <div style={S.lbl}>W1 START DATE</div>
          <input type="date" value={data.seasonStart} onChange={e=>save({...data,seasonStart:e.target.value})} style={{...S.inp,marginBottom:6}}/>
          <div style={S.lbl}>SEASON #</div>
          <input type="number" min={1} value={data.season} onChange={e=>save({...data,season:parseInt(e.target.value)||1})} style={{...S.inp,marginBottom:8}}/>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>{save({...data,seasonStart:today});setShowSet(false);}} style={{...S.btn(C.r),flex:1,fontSize:9}}>W1 TODAY</button>
            <button onClick={()=>{save({...data,seasonStart:today,season:data.season+1,seasonPts:0,totalEXP:0,daily:{}});setShowSet(false);}} style={{...S.btn(C.p),flex:1,fontSize:9}}>NEW SEASON</button>
            <button onClick={()=>setShowSet(false)} style={{...S.btn(C.bdr),flex:0.5,fontSize:9}}>✕</button>
          </div>
        </div>)}
      </div>

      {view==="dash"&&(<>
        <div style={{...S.card,background:"#0D1120",border:`1px solid ${C.r}33`,cursor:"pointer",textAlign:"center",padding:"10px 14px"}} onClick={()=>setQIdx((qIdx+1)%QUOTES.length)}>
          <div style={{fontSize:10,color:C.r,fontStyle:"italic",lineHeight:1.6}}>"{QUOTES[qIdx]}"</div>
        </div>
        <div style={{...S.card,display:"flex"}}><Stat n={stk} l="STREAK"/><Stat n={wk} l="WEEK"/><Stat n={data.seasonPts} l="PTS"/><Stat n={`${dl}d`} l="→PLAYOFF" col={dl<=3?C.r:C.g}/></div>
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={S.lbl}>BLOCKS · {bDone}/{BLOCKS.length}</div>
            <input type="date" value={blockDate} onChange={e=>setBlockDate(e.target.value)} style={{...S.inp,width:"auto",fontSize:10,padding:"3px 6px"}}/>
          </div>
          <Bar v={bDone} max={BLOCKS.length} col={ph.color}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>
            {BLOCKS.map(b=>(<button key={b.id} onClick={()=>toggleBlock(b.id)} style={{background:tb[b.id]?b.color:C.bg,border:`1px solid ${tb[b.id]?b.color:C.bdr}`,borderRadius:4,padding:"5px 10px",cursor:"pointer",color:C.tx,fontSize:10,fontFamily:"monospace",transition:"all 0.15s"}}>{tb[b.id]?"✓ ":""}{b.label}</button>))}
          </div>
        </div>
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div style={S.lbl}>IRON LAWS · {ilD}/{IRON_LAWS.length}</div>{ilD===IRON_LAWS.length&&<span style={{fontSize:9,color:C.g}}>✓ COMPLETE</span>}</div>
          {IRON_LAWS.map((law,i)=>(<button key={i} onClick={()=>toggleIL(i)} style={{width:"100%",background:il[i]?`${C.r}15`:"none",border:`1px solid ${il[i]?C.r:C.bdr}`,borderRadius:4,padding:"6px 10px",cursor:"pointer",color:il[i]?C.tx:C.dm,fontSize:10,textAlign:"left",marginBottom:3,fontFamily:"monospace",display:"flex",gap:8}}><span style={{color:il[i]?C.r:C.fa}}>{il[i]?"★":"○"}</span>{law}</button>))}
        </div>
        <div style={{...S.card,border:`1px solid ${buC>=3?C.r:C.bdr}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div style={S.lbl}>BURNOUT CHECK</div>{buC>=3&&<span style={{fontSize:9,color:C.r,fontWeight:"bold"}}>⚠️ LIGHTER WEEK</span>}</div>
          {BURNOUT.map((s,i)=>(<button key={i} onClick={()=>toggleBU(i)} style={{width:"100%",background:bu[i]?`${C.r}15`:"none",border:`1px solid ${bu[i]?C.r:C.bdr}`,borderRadius:4,padding:"5px 10px",cursor:"pointer",color:bu[i]?C.r:C.dm,fontSize:10,textAlign:"left",marginBottom:3,fontFamily:"monospace",display:"flex",gap:8}}><span>{bu[i]?"✓":"□"}</span>{s}</button>))}
          {buC>=3&&<div style={{background:`${C.r}15`,borderRadius:4,padding:8,marginTop:6,fontSize:10,color:C.r,textAlign:"center"}}>3+ อาการ → เข้า Lighter Week ทันที</div>}
        </div>
        <div style={S.card}>
          <div style={S.lbl}>OAA · {oaa.total}/100</div>
          <div style={S.g4}>{[{l:"ACR",v:oaa.academic,m:40,c:C.r},{l:"PHY",v:oaa.physical,m:20,c:C.g},{l:"MNT",v:oaa.mental,m:20,c:C.b},{l:"SFT",v:oaa.soft,m:20,c:C.p}].map(x=>(<div key={x.l} style={{background:C.bg,borderRadius:4,padding:"7px 4px",border:`1px solid ${x.c}22`,textAlign:"center"}}><div style={{fontSize:7,color:C.dm}}>{x.l}</div><div style={{fontSize:15,fontWeight:"bold",color:x.c}}>{x.v}</div><div style={{fontSize:7,color:C.fa}}>/{x.m}</div></div>))}</div>
          <Bar v={oaa.total} max={100} col={lv.color}/>
          <div style={{textAlign:"center",marginTop:4,fontSize:10,color:lv.color,fontWeight:"bold"}}>{lv.label}</div>
        </div>
      </>)}

      {view==="season"&&(<>
        <div style={{...S.card,display:"flex",marginTop:10}}>
          <div style={{flex:1,textAlign:"center",padding:"8px 0"}}>
            {editPts?(<>
              <div style={{display:"flex",gap:3,justifyContent:"center",marginBottom:4}}><button onClick={()=>setEditPtsV(v=>Math.max(0,v-5))} style={S.btn(C.r)}>−</button><input type="number" value={editPtsV} onChange={e=>setEditPtsV(parseInt(e.target.value)||0)} style={{...S.inp,width:60,textAlign:"center",fontSize:13}}/><button onClick={()=>setEditPtsV(v=>v+5)} style={S.btn(C.g)}>+</button></div>
              <div style={{display:"flex",gap:3,justifyContent:"center"}}><button onClick={()=>{save({...data,seasonPts:Math.max(0,editPtsV)});setEditPts(false);}} style={{...S.btn(C.g),fontSize:9}}>✓</button><button onClick={()=>setEditPts(false)} style={{...S.btn(C.bdr),fontSize:9}}>✕</button></div>
            </>):(<div style={{cursor:"pointer"}} onClick={()=>{setEditPts(true);setEditPtsV(data.seasonPts);}}><div style={{fontSize:24,fontWeight:"bold",color:C.r}}>{data.seasonPts}</div><div style={{fontSize:7,color:C.dm,marginTop:2}}>POINTS ✎</div></div>)}
          </div>
          <Stat n={data.totalEXP} l="EXP"/><Stat n={stk} l="STREAK"/><Stat n={`${dl}d`} l="→PLAYOFF" col={dl<=3?C.r:C.g}/>
        </div>
        <div style={S.card}><div style={S.lbl}>→ 100 PTS</div><Bar v={data.seasonPts} max={100} col={C.g}/><div style={{fontSize:9,color:C.dm,marginTop:3}}>{data.seasonPts}/100 {data.seasonPts>=100?"✓ QUALIFIED":""}</div></div>

        {/* Season Calendar */}
        <div style={S.card}>
          <div style={S.lbl}>📅 SEASON CALENDAR — S{data.season}</div>
          {(() => {
            const {weeks,playoff} = getSeasonDates(data.seasonStart);
            const isCurrentWeek = (s,e) => today>=s&&today<=e;
            const isPast = (e) => today>e;
            return (<>
              {weeks.map(w => {
                const cur = isCurrentWeek(w.start,w.end);
                const past = isPast(w.end);
                return (
                  <div key={w.week} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:4,marginBottom:4,background:cur?`${C.r}15`:past?`${C.g}08`:"#0A0E1A",border:`1px solid ${cur?C.r:past?C.g:C.bdr}`}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:cur?C.r:past?C.g:C.bdr,flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,fontWeight:"bold",color:cur?C.r:past?C.g:C.dm}}>Week {w.week} {cur?"← NOW":past?"✓":""}</div>
                      <div style={{fontSize:9,color:C.dm,marginTop:1}}>{fmtShort(w.start)} → {fmtShort(w.end)}</div>
                    </div>
                    <div style={{fontSize:8,color:cur?C.r:past?C.g:C.fa,fontWeight:"bold"}}>Boss Fight W{w.week}</div>
                  </div>
                );
              })}
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:4,marginBottom:4,background:today>=playoff.start?`${C.p}15`:"#0A0E1A",border:`1px solid ${today>=playoff.start?C.p:C.bdr}`}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:today>=playoff.start?C.p:C.bdr,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,fontWeight:"bold",color:today>=playoff.start?C.p:C.dm}}>🏆 PLAYOFF WEEK {today>=playoff.start?"← NOW":""}</div>
                  <div style={{fontSize:9,color:C.dm,marginTop:1}}>{fmtShort(playoff.start)} → {fmtShort(playoff.review)}</div>
                </div>
              </div>
            </>);
          })()}
        </div>
        <div style={S.card}>
          <div style={S.lbl}>⚡ EXP QUICK ADD</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {EXP_QUICK.map(a=>(<button key={a.l} onClick={()=>addEXP(a.e)} style={{...S.btn(C.bdr),fontSize:9,padding:"5px 10px"}}>{a.l} <span style={{color:C.g}}>+{a.e}</span></button>))}
          </div>
        </div>
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{...S.lbl,margin:0}}>{editRec?"📝 EDITING":"✚ RECORD"}</div>{editRec&&<span style={{fontSize:9,color:C.o}}>🔄 {fmtDate(editRec)}</span>}</div>
          <div style={S.lbl}>DATE</div><input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)} style={{...S.inp,marginBottom:8}}/>
          <div style={S.lbl}>RANK</div>
          <div style={{display:"flex",gap:3,marginBottom:8}}>{RANKS.map(r=>(<button key={r.rank} onClick={()=>setDForm(p=>({...p,rank:r.rank}))} style={{...S.btn(dForm.rank===r.rank?r.color:C.bdr),flex:1,fontSize:12}}>{r.rank}</button>))}</div>
          <div style={S.lbl}>EXP</div>
          <div style={{...S.row,marginBottom:4}}><button onClick={()=>setDForm(p=>({...p,exp:Math.max(0,p.exp-10)}))} style={{...S.btn(C.r),flex:0.3,fontSize:13}}>−</button><div style={{flex:1,textAlign:"center",background:C.bg,border:`1px solid ${C.bdr}`,borderRadius:4,padding:7,fontSize:16,fontWeight:"bold",color:C.r}}>{dForm.exp}</div><button onClick={()=>setDForm(p=>({...p,exp:p.exp+10}))} style={{...S.btn(C.g),flex:0.3,fontSize:13}}>+</button></div>
          <div style={{display:"flex",gap:3,marginBottom:8}}>{[10,20,30,50].map(v=>(<button key={v} onClick={()=>setDForm(p=>({...p,exp:v}))} style={{...S.btn(C.bdr),flex:1,fontSize:9}}>{v}</button>))}</div>
          <div style={{fontSize:9,color:C.dm,marginBottom:6}}>Total: <span style={{color:C.r,fontWeight:"bold"}}>{(RANKS.find(r=>r.rank===dForm.rank)?.pts||0)+Math.floor(dForm.exp/100)*2} pts</span></div>
          <input value={dForm.note} onChange={e=>setDForm(p=>({...p,note:e.target.value}))} placeholder="Note..." style={{...S.inp,marginBottom:8}}/>
          <button onClick={saveRec} style={{...S.btn(C.r),width:"100%",marginBottom:4}}>✓ {editRec?"UPDATE":"RECORD"}</button>
          {editRec&&(<div style={{display:"flex",gap:4}}><button onClick={()=>delRec(editRec)} style={{...S.btn(C.r),flex:1,fontSize:10}}>🗑 DELETE</button><button onClick={()=>{setEditRec(null);setDForm({rank:"S",exp:0,note:""});setSelDate(today);}} style={{...S.btn(C.bdr),flex:1,fontSize:10}}>✕ CANCEL</button></div>)}
        </div>
        <div style={S.card}>
          <div style={S.lbl}>ALL RECORDS</div>
          {sorted.length===0&&<div style={{color:C.fa,fontSize:10,padding:10,textAlign:"center"}}>No records yet</div>}
          {sorted.map(([d,r])=>{ const rk=RANKS.find(x=>x.rank===r.rank); return(<div key={d} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 0",borderBottom:`1px solid ${C.bdr}`}}>
            <button onClick={()=>startEdit(d)} style={{flex:1,background:"none",border:"none",textAlign:"left",cursor:"pointer",padding:0}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:10,color:C.dm,minWidth:55}}>{fmtDate(d)}</span><span style={{background:rk.color+"22",color:rk.color,border:`1px solid ${rk.color}44`,padding:"1px 7px",borderRadius:10,fontSize:8,fontWeight:"bold"}}>{r.rank}</span><span style={{fontSize:9,color:C.dm}}>{r.exp}EXP</span><span style={{fontSize:9,fontWeight:"bold"}}>{calcPts(r)}pts</span></div>
              {r.note&&<div style={{fontSize:8,color:C.fa,marginTop:1,fontStyle:"italic"}}>"{r.note}"</div>}
            </button>
            <button onClick={()=>delRec(d)} style={{...S.btn(C.r),fontSize:9,padding:"3px 7px"}}>✕</button>
          </div>); })}
        </div>
      </>)}

      {view==="playoff"&&(<>
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{...S.lbl,color:C.r,margin:0}}>🏆 PLAYOFF · NBA STYLE</div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:9,color:C.dm}}>S#</span><input type="number" min={1} value={pfSeason} onChange={e=>setPfSeason(e.target.value)} style={{...S.inp,width:44,textAlign:"center",fontSize:11,padding:"3px 6px"}}/></div>
          </div>

          {/* Playoff Week Calendar */}
          {(() => {
            const {playoff} = getSeasonDates(data.seasonStart);
            const days = [
              {date:playoff.quarter,label:"🥉 Quarterfinal",sub:"2 ชม.",color:C.r},
              {date:playoff.quarterRest,label:"📖 พัก + เตรียมตัว",sub:"ทบทวน error Q-final",color:C.dm},
              {date:playoff.semi,label:"🥈 Semifinal",sub:"3 ชม.",color:C.o},
              {date:playoff.semiRest,label:"📖 พัก + เตรียมตัว",sub:"ทบทวน error Semi",color:C.dm},
              {date:playoff.final,label:"🥇 Final Boss",sub:"3-4 ชม.",color:C.p},
              {date:playoff.announce,label:"🏆 ประกาศ Final Rank",sub:"",color:"#FFD700"},
              {date:playoff.review,label:"📋 Weekly Review + New Season",sub:"",color:C.g},
            ];
            return (
              <div style={{marginBottom:10}}>
                <div style={{fontSize:9,color:C.dm,marginBottom:8}}>Playoff Week เริ่ม {fmtShort(playoff.quarter)}</div>
                {days.map((d,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:4,marginBottom:3,background:today===d.date?`${d.color}20`:"#0A0E1A",border:`1px solid ${today===d.date?d.color:C.bdr}`}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:today===d.date?d.color:today>d.date?C.g:C.bdr,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:"bold",color:today===d.date?d.color:today>d.date?C.g:C.dm}}>{d.label} {today===d.date?"← TODAY":today>d.date?"✓":""}</div>
                    <div style={{fontSize:9,color:C.dm}}>{fmtShort(d.date)}{d.sub?" · "+d.sub:""}</div>
                  </div>
                </div>))}
              </div>
            );
          })()}

          {cpf&&(<div style={{background:C.bg,border:`1px solid ${cpf.color||C.bdr}`,borderRadius:6,padding:10,marginBottom:8}}>
            <div style={{fontSize:10,color:C.dm}}>Season {pfSeason} Result</div>
            <div style={{fontSize:13,fontWeight:"bold",color:cpf.color||C.r,marginTop:2}}>{cpf.rank}</div>
            <div style={{display:"flex",gap:10,marginTop:4,fontSize:9}}><span style={{color:C.r}}>Q:{(cpf.qa||0)+(cpf.qp||0)}</span><span style={{color:C.o}}>S:{(cpf.sa||0)+(cpf.sp||0)}</span><span style={{color:C.p}}>F:{(cpf.fa||0)+(cpf.fp||0)}</span><span style={{color:C.g,fontWeight:"bold"}}>รวม:{cpf.total||0}/300</span></div>
          </div>)}
          <div style={{display:"flex",gap:3,marginBottom:8}}>{[["q","🥉 Q-FINAL",C.r],["s","🥈 SEMI",C.o],["f","🥇 FINAL",C.p]].map(([t,l,col])=>(<button key={t} onClick={()=>setPfTab(t)} style={{...S.sb(pfTab===t,col),flex:1,fontSize:10}}>{l}</button>))}</div>
        </div>

        {pfTab==="q"&&(<div style={S.card}>
          <div style={{...S.lbl,color:C.r}}>🥉 QUARTERFINAL — เกณฑ์ ≥70/100 · Pressure ≥25</div>
          <div style={{fontSize:9,color:C.dm,marginBottom:8}}>Basic concept ทุกวิชา ตั้งแต่ Season 1 ถึงปัจจุบัน</div>
          <Dv/><div style={S.lbl}>ACADEMIC /50 (Math+Science+English)</div>
          <NI val={pf.qa} onChg={v=>setPf(p=>({...p,qa:Math.min(50,v)}))} max={50} col={C.r}/>
          <Dv/><div style={S.lbl}>No Distraction</div>
          <div style={{display:"flex",gap:3,marginBottom:8}}>{[[20,"0ครั้ง"],[10,"1ครั้ง"],[0,"2+ครั้ง"]].map(([v,l])=>(<button key={l} onClick={()=>setPf(p=>({...p,qp_nd:v}))} style={{...S.btn(pf.qp_nd===v?C.b:C.bdr),flex:1,fontSize:9}}>{l}={v}</button>))}</div>
          <div style={S.lbl}>BO7 vs Easy Bot (ชนะกี่เกม)</div>
          <NI val={pf.qp_bo7} onChg={v=>setPf(p=>({...p,qp_bo7:Math.min(7,v)}))} max={7} col={C.o}/>
          <div style={{fontSize:9,color:C.dm,marginTop:3,marginBottom:8}}>{pf.qp_bo7*3}/21 pts</div>
          {pf.qp_bo7<5&&(<><div style={S.lbl}>🏹 Archery แก้ตัว</div>
          <div style={{display:"flex",gap:3,marginBottom:8}}>{[[9,"100-120"],[7,"80-99"],[5,"60-79"],[3,"40-59"],[0,"<40"]].map(([v,l])=>(<button key={l} onClick={()=>setPf(p=>({...p,qp_ar:v}))} style={{...S.btn(pf.qp_ar===v?C.g:C.bdr),flex:1,fontSize:8}}>{l}<br/>+{v}</button>))}</></>)}
          <Dv/>
          <div style={{background:C.bg,borderRadius:4,padding:10,border:`1px solid ${C.bdr}`}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}><span style={{color:C.r}}>Academic: {pf.qa}/50</span><span style={{color:C.b}}>Pressure: {qp}/50 {qp<25?"⚠️":""}</span></div>
            <div style={{fontSize:16,fontWeight:"bold",color:pf.qa+qp>=70?C.g:C.r,textAlign:"center",marginTop:6}}>{pf.qa+qp}/100 {pf.qa+qp>=70?"✓ PASS":"✗"}</div>
          </div>
        </div>)}

        {pfTab==="s"&&(<div style={S.card}>
          <div style={{...S.lbl,color:C.o}}>🥈 SEMIFINAL — เกณฑ์ ≥80/100 · Pressure ≥25</div>
          <div style={S.lbl}>ACADEMIC /50 (เชาวน์+จริยธรรม+Reading+Listening)</div>
          <NI val={pf.sa} onChg={v=>setPf(p=>({...p,sa:Math.min(50,v)}))} max={50} col={C.o}/>
          <Dv/><div style={S.lbl}>BO7 vs Medium Bot</div>
          <NI val={pf.sp_bo7} onChg={v=>setPf(p=>({...p,sp_bo7:Math.min(7,v)}))} max={7} col={C.o}/>
          <div style={{fontSize:9,color:C.dm,marginTop:3,marginBottom:8}}>{pf.sp_bo7*3}/21 pts</div>
          {pf.sp_bo7<5&&(<><div style={S.lbl}>🏹 Archery แก้ตัว</div>
          <div style={{display:"flex",gap:3,marginBottom:8}}>{[[9,"100-120"],[7,"80-99"],[5,"60-79"],[3,"40-59"],[0,"<40"]].map(([v,l])=>(<button key={l} onClick={()=>setPf(p=>({...p,sp_ar:v}))} style={{...S.btn(pf.sp_ar===v?C.g:C.bdr),flex:1,fontSize:8}}>{l}<br/>+{v}</button>))}</></>)}
          <div style={S.lbl}>ใจเย็น ไม่มั่ว</div>
          <div style={{display:"flex",gap:3,marginBottom:8}}>{[[15,"นิ่งมาก"],[10,"นิ่งพอ"],[5,"มั่วบ้าง"],[0,"panic"]].map(([v,l])=>(<button key={l} onClick={()=>setPf(p=>({...p,sp_sr:v}))} style={{...S.btn(pf.sp_sr===v?C.o:C.bdr),flex:1,fontSize:9}}>{l}<br/>{v}</button>))}</div>
          <div style={S.lbl}>Plank Hold</div>
          <div style={{display:"flex",gap:3,marginBottom:8}}>{[[14,"≥3นาที"],[10,"≥2นาที"],[6,"≥1นาที"],[0,"<1นาที"]].map(([v,l])=>(<button key={l} onClick={()=>setPf(p=>({...p,sp_pl:v}))} style={{...S.btn(pf.sp_pl===v?C.o:C.bdr),flex:1,fontSize:9}}>{l}<br/>{v}</button>))}</div>
          <Dv/>
          <div style={{background:C.bg,borderRadius:4,padding:10,border:`1px solid ${C.bdr}`}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}><span style={{color:C.o}}>Academic: {pf.sa}/50</span><span style={{color:C.b}}>Pressure: {sp}/50 {sp<25?"⚠️":""}</span></div>
            <div style={{fontSize:16,fontWeight:"bold",color:pf.sa+sp>=80?C.g:C.r,textAlign:"center",marginTop:6}}>{pf.sa+sp}/100 {pf.sa+sp>=80?"✓ PASS":"✗"}</div>
          </div>
        </div>)}

        {pfTab==="f"&&(<div style={S.card}>
          <div style={{...S.lbl,color:C.p}}>🥇 FINAL BOSS — เกณฑ์ ≥85/100 · Pressure ≥30</div>
          <div style={S.lbl}>Full Simulation ทุกวิชา /30</div>
          <NI val={pf.fa} onChg={v=>setPf(p=>({...p,fa:Math.min(30,v)}))} max={30} col={C.p}/>
          <div style={S.lbl}>Logic Puzzle 5 ข้อ (ทันทีหลัง BO7 ไม่พัก)</div>
          <div style={{display:"flex",gap:3,marginBottom:8}}>{[[20,"5/5"],[16,"4/5"],[12,"3/5"],[8,"2/5"],[4,"1/5"],[0,"0/5"]].map(([v,l])=>(<button key={l} onClick={()=>setPf(p=>({...p,fl:v}))} style={{...S.btn(pf.fl===v?C.p:C.bdr),flex:1,fontSize:9}}>{l}<br/>{v}</button>))}</div>
          <Dv/><div style={S.lbl}>BO7 vs Hard Bot</div>
          <NI val={pf.fp_bo7} onChg={v=>setPf(p=>({...p,fp_bo7:Math.min(7,v)}))} max={7} col={C.p}/>
          <div style={{fontSize:9,color:C.dm,marginTop:3,marginBottom:8}}>{pf.fp_bo7*3}/21 pts</div>
          {pf.fp_bo7<5&&(<><div style={S.lbl}>🏹 Archery แก้ตัว</div>
          <div style={{display:"flex",gap:3,marginBottom:8}}>{[[9,"100-120"],[7,"80-99"],[5,"60-79"],[3,"40-59"],[0,"<40"]].map(([v,l])=>(<button key={l} onClick={()=>setPf(p=>({...p,fp_ar:v}))} style={{...S.btn(pf.fp_ar===v?C.g:C.bdr),flex:1,fontSize:8}}>{l}<br/>+{v}</button>))}</></>)}
          <div style={S.lbl}>Time Limit</div>
          <div style={{display:"flex",gap:3,marginBottom:8}}>{[[15,"เสร็จก่อน"],[10,"ตรงพอดี"],[0,"เกินเวลา"]].map(([v,l])=>(<button key={l} onClick={()=>setPf(p=>({...p,fp_tl:v}))} style={{...S.btn(pf.fp_tl===v?C.p:C.bdr),flex:1,fontSize:9}}>{l}<br/>{v}</button>))}</div>
          <div style={S.lbl}>Feynman 1 Concept</div>
          <div style={{display:"flex",gap:3,marginBottom:8}}>{[[14,"ครบ"],[10,"ติดบ้าง"],[5,"บางส่วน"],[0,"ไม่ได้"]].map(([v,l])=>(<button key={l} onClick={()=>setPf(p=>({...p,fp_fy:v}))} style={{...S.btn(pf.fp_fy===v?C.p:C.bdr),flex:1,fontSize:9}}>{l}<br/>{v}</button>))}</div>
          <Dv/>
          <div style={{background:C.bg,borderRadius:4,padding:10,border:`1px solid ${C.bdr}`}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}><span style={{color:C.p}}>Academic: {pf.fa+pf.fl}/50</span><span style={{color:C.b}}>Pressure: {fp}/50 {fp<30?"⚠️":""}</span></div>
            <div style={{fontSize:16,fontWeight:"bold",color:(pf.fa+pf.fl+fp)>=85?C.g:C.r,textAlign:"center",marginTop:6}}>{pf.fa+pf.fl+fp}/100 {(pf.fa+pf.fl+fp)>=85?"✓ PASS":"✗"}</div>
          </div>
          <Dv/>
          <div style={{background:C.bg,border:`1px solid ${pfResult.color}`,borderRadius:6,padding:12,textAlign:"center"}}>
            <div style={{fontSize:11,color:C.dm,marginBottom:4}}>FINAL RANK PREVIEW</div>
            <div style={{fontSize:16,fontWeight:"bold",color:pfResult.color}}>{pfResult.label}</div>
            <div style={{fontSize:10,color:C.dm,marginTop:4}}>รวม {pfResult.total}/300</div>
          </div>
          <button onClick={savePlayoff} style={{...S.btn(C.p),width:"100%",marginTop:10}}>💾 SAVE RESULT</button>
        </div>)}

        {Object.keys(data.playoff||{}).length>0&&(<div style={S.card}>
          <div style={S.lbl}>HISTORY</div>
          {Object.entries(data.playoff).sort((a,b)=>b[0]-a[0]).map(([s,r])=>(<div key={s} style={{borderBottom:`1px solid ${C.bdr}`,paddingBottom:8,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:C.dm}}>Season {s}</span><span style={{fontSize:10,fontWeight:"bold",color:r.color||C.g}}>{r.rank}</span></div>
            <div style={{display:"flex",gap:8,fontSize:9,marginTop:3}}><span style={{color:C.r}}>Q:{(r.qa||0)+(r.qp||0)}</span><span style={{color:C.o}}>S:{(r.sa||0)+(r.sp||0)}</span><span style={{color:C.p}}>F:{(r.fa||0)+(r.fp||0)}</span>{r.total&&<span style={{color:C.g,fontWeight:"bold"}}>รวม:{r.total}/300</span>}</div>
          </div>))}
        </div>)}
      </>)}

      {view==="oaa"&&(<>
        <div style={{...S.card,marginTop:10,textAlign:"center",padding:"16px 14px"}}>
          <div style={{fontSize:8,color:C.dm,letterSpacing:3,marginBottom:4}}>OVERALL ACADEMIC ABILITY</div>
          <div style={{fontSize:52,fontWeight:"bold",color:lv.color,lineHeight:1}}>{oaa.total}</div>
          <div style={{fontSize:10,color:lv.color,letterSpacing:3,marginTop:6}}>{lv.label}</div>
          <Bar v={oaa.total} max={100} col={lv.color}/>
          <div style={{...S.g4,marginTop:10}}>{[{l:"ACR",v:oaa.academic,m:40,c:C.r},{l:"PHY",v:oaa.physical,m:20,c:C.g},{l:"MNT",v:oaa.mental,m:20,c:C.b},{l:"SFT",v:oaa.soft,m:20,c:C.p}].map(x=>(<div key={x.l} style={{background:C.bg,borderRadius:4,padding:"8px 4px",border:`1px solid ${x.c}33`}}><div style={{fontSize:7,color:C.dm}}>{x.l}</div><div style={{fontSize:16,fontWeight:"bold",color:x.c,marginTop:2}}>{x.v}</div><div style={{fontSize:7,color:C.fa}}>/{x.m}</div></div>))}</div>
        </div>
        <div style={{...S.card,padding:"6px 10px"}}><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{["academic","physical","mental","domains","history"].map(t=>(<button key={t} onClick={()=>setOaaTab(t)} style={S.sb(oaaTab===t,C.r)}>{t.toUpperCase()}</button>))}</div></div>
        {oaaTab==="academic"&&(<div style={S.card}>
          <div style={S.lbl}>BOSS FIGHT SCORES (0-10)</div>
          <div style={{...S.row,marginBottom:8}}><input type="number" min={0} max={10} step={0.5} value={bossIn} onChange={e=>setBossIn(e.target.value)} placeholder="8.5" style={{...S.inp,flex:1}}/><button onClick={addBoss} style={S.btn(C.r)}>ADD</button></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:10}}>{(data.oaa.bossScores||[]).map((s,i)=>(<div key={i} style={{background:C.bg,border:`1px solid ${C.bdr}`,borderRadius:3,padding:"2px 8px",display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:10,color:s>=8?C.g:s>=6?C.o:C.r,fontWeight:"bold"}}>{s}</span><button onClick={()=>delBoss(i)} style={{background:"none",border:"none",color:C.dm,cursor:"pointer",fontSize:10,padding:0}}>✕</button></div>))}</div>
          <div style={{fontSize:9,color:C.dm,marginBottom:10}}>Avg: <span style={{color:C.r,fontWeight:"bold"}}>{data.oaa.bossScores?.length?(data.oaa.bossScores.reduce((a,b)=>a+b,0)/data.oaa.bossScores.length).toFixed(1):"—"}</span> → {oaa.academic}/40</div>
          <div style={S.lbl}>PRESSURE SCORES (0-50)</div>
          <div style={{...S.row,marginBottom:8}}><input type="number" min={0} max={50} value={presIn} onChange={e=>setPresIn(e.target.value)} placeholder="35" style={{...S.inp,flex:1}}/><button onClick={addPres} style={S.btn(C.b)}>ADD</button></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:10}}>{(data.oaa.pressureScores||[]).map((s,i)=>(<div key={i} style={{background:C.bg,border:`1px solid ${C.bdr}`,borderRadius:3,padding:"2px 8px",display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:10,color:s>=35?C.g:s>=25?C.o:C.r,fontWeight:"bold"}}>{s}</span><button onClick={()=>delPres(i)} style={{background:"none",border:"none",color:C.dm,cursor:"pointer",fontSize:10,padding:0}}>✕</button></div>))}</div>
          <button onClick={saveSnap} style={{...S.btn(C.p),width:"100%"}}>📸 SAVE MONTHLY SNAPSHOT</button>
        </div>)}
        {oaaTab==="physical"&&(<div style={S.card}>
          <div style={S.lbl}>BASELINE TEST — /20</div>
          {[{k:"pushups",l:"Push-ups 1 นาที",g:"≥50=5 ≥35=4 ≥20=3"},{k:"pullups",l:"Pull-ups",g:"≥15=5 ≥10=4 ≥5=3"},{k:"run",l:"วิ่ง 2km (นาที)",g:"<8=5 ≤10=4 ≤12=3"},{k:"plank",l:"Plank (วินาที)",g:"≥180=5 ≥120=4 ≥60=3"}].map(f=>(<div key={f.k} style={{marginBottom:12}}>
            <div style={S.lbl}>{f.l}</div>
            <div style={S.row}><button onClick={()=>upPhy(f.k,Math.max(0,(data.oaa.physical[f.k]||0)-1))} style={{...S.btn(C.bdr),flex:0.2,fontSize:12}}>−</button><input type="number" value={data.oaa.physical[f.k]||""} onChange={e=>upPhy(f.k,e.target.value)} style={{...S.inp,flex:1,textAlign:"center"}}/><button onClick={()=>upPhy(f.k,(data.oaa.physical[f.k]||0)+1)} style={{...S.btn(C.bdr),flex:0.2,fontSize:12}}>+</button></div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:2,fontSize:8,color:C.dm}}><span>{f.g}</span><span style={{color:C.g,fontWeight:"bold"}}>Score: {physSc(f.k,data.oaa.physical[f.k]||0)}/5</span></div>
          </div>))}
          <div style={{textAlign:"center",borderTop:`1px solid ${C.bdr}`,paddingTop:8}}><span style={{fontSize:24,fontWeight:"bold",color:C.g}}>{oaa.physical}</span><span style={{fontSize:9,color:C.dm,marginLeft:4}}>/20</span></div>
        </div>)}
        {oaaTab==="mental"&&(<div style={S.card}>
          <div style={S.lbl}>MENTAL SELF-RATE — /20</div>
          {[{k:"emotion",l:"ควบคุมอารมณ์",d:"นับ 5 ก่อนตอบ: ได้ทุกครั้ง=2 บางครั้ง=1 ไม่ได้=0"},{k:"pressure",l:"ใจเย็นใต้ pressure",d:"นิ่งตลอด=2 นิ่งพอ=1 panic=0"},{k:"screen",l:"Screen <45 นาที",d:"ทำได้=2 พอดี=1 เกิน=0"},{k:"recovery",l:"Recovery",d:"ทันที=2 ช้า=1 ยัง=0"},{k:"visual",l:"Visualization",d:"ครบ=2 บางวัน=1 ไม่ทำ=0"}].map(f=>(<div key={f.k} style={{marginBottom:10}}>
            <div style={S.lbl}>{f.l}</div><div style={{fontSize:8,color:C.fa,marginBottom:4}}>{f.d}</div>
            <div style={{display:"flex",gap:4}}>{[0,1,2].map(v=>(<button key={v} onClick={()=>upMen(f.k,v)} style={{...S.btn((data.oaa.mentalSelf||{})[f.k]===v?C.b:C.bdr),flex:1,fontSize:13}}>{v}</button>))}</div>
          </div>))}
          <div style={{textAlign:"center",borderTop:`1px solid ${C.bdr}`,paddingTop:8}}><span style={{fontSize:24,fontWeight:"bold",color:C.b}}>{oaa.mental}</span><span style={{fontSize:9,color:C.dm,marginLeft:4}}>/20</span></div>
        </div>)}
        {oaaTab==="domains"&&(<div style={S.card}>
          <div style={S.lbl}>20 DOMAIN — /20</div>
          {DOMAINS.map((d,i)=>(<div key={i} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
              <span style={{fontSize:9,color:(data.oaa.domains||[])[i]>=7?C.tx:C.dm}}>{i+1}. {d}</span>
              <div style={{display:"flex",gap:3,alignItems:"center"}}><button onClick={()=>upDom(i,Math.max(0,((data.oaa.domains||[])[i]||0)-1))} style={{...S.btn(C.bdr),padding:"1px 6px",fontSize:10}}>−</button><span style={{fontSize:11,fontWeight:"bold",color:(data.oaa.domains||[])[i]>=9?C.p:(data.oaa.domains||[])[i]>=7?C.g:(data.oaa.domains||[])[i]>=4?C.o:C.gr,minWidth:16,textAlign:"center"}}>{(data.oaa.domains||[])[i]}</span><button onClick={()=>upDom(i,Math.min(10,((data.oaa.domains||[])[i]||0)+1))} style={{...S.btn(C.bdr),padding:"1px 6px",fontSize:10}}>+</button></div>
            </div>
            <input type="range" min={0} max={10} value={(data.oaa.domains||[])[i]||0} onChange={e=>upDom(i,e.target.value)} style={{width:"100%",accentColor:C.r,height:3}}/>
          </div>))}
          <div style={{textAlign:"center",borderTop:`1px solid ${C.bdr}`,paddingTop:8}}><span style={{fontSize:24,fontWeight:"bold",color:C.p}}>{oaa.soft}</span><span style={{fontSize:9,color:C.dm,marginLeft:4}}>/20</span></div>
        </div>)}
        {oaaTab==="history"&&(<div style={S.card}>
          <button onClick={saveSnap} style={{...S.btn(C.p),width:"100%",marginBottom:10}}>📸 SAVE SNAPSHOT</button>
          {(!data.oaa.history?.length)&&<div style={{color:C.fa,fontSize:10,textAlign:"center",padding:16}}>No snapshots yet</div>}
          {[...(data.oaa.history||[])].reverse().map((h,i)=>{ const lv2=getLevel(h.total); return(<div key={i} style={{borderBottom:`1px solid ${C.bdr}`,paddingBottom:8,marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:C.dm}}>{h.month||h.date}</span><span style={{fontSize:11,fontWeight:"bold",color:lv2.color}}>{h.total} · {lv2.label}</span></div><div style={{display:"flex",gap:8,fontSize:9}}><span style={{color:C.r}}>A:{h.academic}</span><span style={{color:C.g}}>P:{h.physical}</span><span style={{color:C.b}}>M:{h.mental}</span><span style={{color:C.p}}>S:{h.soft}</span></div><Bar v={h.total} max={100} col={lv2.color}/></div>); })}
        </div>)}
      </>)}

      {view==="journal"&&(<>
        <div style={{...S.card,padding:"6px 10px"}}><div style={{display:"flex",gap:3}}>{[["daily","DAILY"],["weekly","WEEKLY REVIEW"]].map(([t,l])=>(<button key={t} onClick={()=>setTab2(t)} style={S.sb(tab2===t,C.r)}>{l}</button>))}</div></div>
        {tab2==="daily"&&(<>
          <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={S.lbl}>DAILY JOURNAL</div><input type="date" value={jDate} onChange={e=>{setJDate(e.target.value);const j=data.journal?.[e.target.value];if(j)setJForm({good:j.good||"",improve:j.improve||"",feynman:j.feynman||"",energy:j.energy||5,plan:j.plan||""});else setJForm({good:"",improve:"",feynman:"",energy:5,plan:""}); }} style={{...S.inp,width:"auto",fontSize:10,padding:"3px 6px"}}/></div>
            {data.journal?.[jDate]&&<div style={{fontSize:9,color:C.g,marginBottom:6}}>✓ มีข้อมูลแล้ว</div>}
            <div style={S.lbl}>✅ 3 สิ่งที่ดีวันนี้</div><textarea rows={2} value={jForm.good} onChange={e=>setJForm(p=>({...p,good:e.target.value}))} placeholder="1. ..." style={{...S.inp,resize:"vertical",marginBottom:8}}/>
            <div style={S.lbl}>🔧 1 สิ่งที่จะปรับ</div><input value={jForm.improve} onChange={e=>setJForm(p=>({...p,improve:e.target.value}))} placeholder="พรุ่งนี้จะ..." style={{...S.inp,marginBottom:8}}/>
            <div style={S.lbl}>🧠 FEYNMAN CONCEPT</div><textarea rows={2} value={jForm.feynman} onChange={e=>setJForm(p=>({...p,feynman:e.target.value}))} placeholder="อธิบาย..." style={{...S.inp,resize:"vertical",marginBottom:8}}/>
            <div style={S.lbl}>📋 PLAN พรุ่งนี้</div><input value={jForm.plan} onChange={e=>setJForm(p=>({...p,plan:e.target.value}))} placeholder="3 tasks..." style={{...S.inp,marginBottom:8}}/>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={S.lbl}>⚡ ENERGY</div><span style={{fontSize:13,fontWeight:"bold",color:C.r}}>{jForm.energy}/10</span></div>
            <input type="range" min={1} max={10} value={jForm.energy} onChange={e=>setJForm(p=>({...p,energy:parseInt(e.target.value)}))} style={{width:"100%",accentColor:C.r,marginBottom:10}}/>
            <button onClick={saveJournal} style={{...S.btn(C.r),width:"100%"}}>SAVE</button>
          </div>
          <div style={S.card}>
            <div style={S.lbl}>HISTORY</div>
            {Object.entries(data.journal||{}).sort((a,b)=>b[0].localeCompare(a[0])).map(([d,j])=>(<div key={d} style={{borderBottom:`1px solid ${C.bdr}`,paddingBottom:8,marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between"}}><div style={{flex:1,cursor:"pointer"}} onClick={()=>{setJDate(d);setJForm({good:j.good||"",improve:j.improve||"",feynman:j.feynman||"",energy:j.energy||5,plan:j.plan||""});}}><div style={{fontSize:10,color:C.r,fontWeight:"bold"}}>{fmtDate(d)}</div><div style={{fontSize:9,color:C.dm,marginTop:2}}>⚡{j.energy} · {j.good?.slice(0,35)}...</div></div><button onClick={()=>delJournal(d)} style={{...S.btn(C.r),fontSize:9,padding:"3px 7px"}}>✕</button></div></div>))}
          </div>
        </>)}
        {tab2==="weekly"&&(<div style={S.card}>
          <div style={S.lbl}>WEEKLY REVIEW — Week {wk}</div>
          <div style={S.lbl}>วันที่ทำครบ (_/7)</div><input value={wrForm.days} onChange={e=>setWrForm(p=>({...p,days:e.target.value}))} placeholder="5/7" style={{...S.inp,marginBottom:8}}/>
          <div style={S.lbl}>Rank เฉลี่ย</div><div style={{display:"flex",gap:3,marginBottom:8}}>{RANKS.map(r=>(<button key={r.rank} onClick={()=>setWrForm(p=>({...p,rank:r.rank}))} style={{...S.btn(wrForm.rank===r.rank?r.color:C.bdr),flex:1,fontSize:12}}>{r.rank}</button>))}</div>
          <div style={S.lbl}>ภูมิใจที่สุด</div><input value={wrForm.proud} onChange={e=>setWrForm(p=>({...p,proud:e.target.value}))} placeholder="..." style={{...S.inp,marginBottom:8}}/>
          <div style={S.lbl}>ต้องปรับสัปดาห์หน้า</div><input value={wrForm.adjust} onChange={e=>setWrForm(p=>({...p,adjust:e.target.value}))} placeholder="..." style={{...S.inp,marginBottom:8}}/>
          <div style={S.lbl}>3 Priority Tasks สัปดาห์หน้า</div><textarea rows={2} value={wrForm.priority} onChange={e=>setWrForm(p=>({...p,priority:e.target.value}))} placeholder="① ② ③" style={{...S.inp,resize:"vertical",marginBottom:8}}/>
          <div style={S.lbl}>MODE</div><div style={{display:"flex",gap:3,marginBottom:8}}>{["🟢 ปกติ","🟡 ยุ่ง","🔴 เหนื่อย"].map(m=>(<button key={m} onClick={()=>setWrForm(p=>({...p,mode:m}))} style={{...S.btn(wrForm.mode===m?C.g:C.bdr),flex:1,fontSize:9}}>{m}</button>))}</div>
          <div style={S.lbl}>BURNOUT CHECK</div>
          {BURNOUT.map((s,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,cursor:"pointer"}} onClick={()=>{ const b=[...(wrForm.burnout||[])]; const idx=b.indexOf(i); if(idx>-1) b.splice(idx,1); else b.push(i); setWrForm(p=>({...p,burnout:b})); }}><span style={{color:(wrForm.burnout||[]).includes(i)?C.r:C.dm}}>{(wrForm.burnout||[]).includes(i)?"✓":"□"}</span><span style={{fontSize:9,color:C.dm}}>{s}</span></div>))}
          {(wrForm.burnout||[]).length>=3&&<div style={{background:`${C.r}15`,borderRadius:4,padding:8,marginTop:4,fontSize:9,color:C.r}}>⚠️ → Lighter Week ทันที</div>}
          <button onClick={saveWR} style={{...S.btn(C.r),width:"100%",marginTop:10}}>SAVE WEEKLY REVIEW</button>
          <Dv/>
          <div style={S.lbl}>PAST REVIEWS</div>
          {Object.entries(data.weeklyReview||{}).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,5).map(([d,r])=>(<div key={d} style={{borderBottom:`1px solid ${C.bdr}`,paddingBottom:6,marginBottom:6,fontSize:9}}><div style={{color:C.r,fontWeight:"bold"}}>{fmtDate(d)} · Week {r.week}</div><div style={{color:C.dm,marginTop:2}}>{r.days} days · {r.mode}</div></div>))}
        </div>)}
      </>)}

      {view==="study"&&(<>
        <div style={{...S.card,padding:"6px 10px"}}><div style={{display:"flex",gap:3}}>{PHASES.map(p=>(<button key={p.id} onClick={()=>setSubTab(p.id)} style={S.sb(subTab===p.id,p.color)}>{p.id}</button>))}</div></div>
        {PHASES.filter(p=>p.id===subTab).map(ph2=>(<div key={ph2.id} style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div style={{fontSize:11,color:ph2.color,fontWeight:"bold"}}>{ph2.id} {ph2.label}</div><div style={{fontSize:11,color:ph2.color,fontWeight:"bold"}}>{Math.round(ph2.subjects.reduce((a,s)=>a+(data.subjects[`${ph2.id}-${s}`]||0),0)/ph2.subjects.length)}%</div></div>
          {ph2.subjects.map(s=>{ const key=`${ph2.id}-${s}`; const val=data.subjects[key]||0; const ed=editSubj===key; return(<div key={s} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><span style={{fontSize:10,color:val>0?C.tx:C.dm}}>{s}</span><div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:11,color:ph2.color,fontWeight:"bold",minWidth:32,textAlign:"right"}}>{val}%</span><button onClick={()=>{setEditSubj(key);setEditSubjV(val);}} style={{...S.btn(C.r),fontSize:9,padding:"2px 6px"}}>✎</button></div></div>
            {ed?(<div><div style={{...S.row,marginBottom:4}}><button onClick={()=>setEditSubjV(v=>Math.max(0,v-5))} style={{...S.btn(C.r),flex:0.2,fontSize:12}}>−</button><input type="number" min={0} max={100} value={editSubjV} onChange={e=>setEditSubjV(parseInt(e.target.value)||0)} style={{...S.inp,flex:1,textAlign:"center"}}/><button onClick={()=>setEditSubjV(v=>Math.min(100,v+5))} style={{...S.btn(C.g),flex:0.2,fontSize:12}}>+</button></div><div style={{display:"flex",gap:4}}><button onClick={()=>applySubj(key,editSubjV)} style={{...S.btn(C.g),flex:1,fontSize:9}}>✓</button><button onClick={()=>setEditSubj(null)} style={{...S.btn(C.bdr),flex:1,fontSize:9}}>✕</button></div></div>):(<input type="range" min={0} max={100} value={val} onChange={e=>save({...data,subjects:{...data.subjects,[key]:parseInt(e.target.value)}})} style={{width:"100%",accentColor:ph2.color,height:3}}/>)}
          </div>); })}
          <Dv/>
          <div style={S.lbl}>📚 SOFT BOOKS</div>
          {ph2.books.map(book=>(<button key={book} onClick={()=>toggleBook(ph2.id,book)} style={{width:"100%",background:data.books?.[`${ph2.id}-${book}`]?`${ph2.color}15`:"none",border:`1px solid ${data.books?.[`${ph2.id}-${book}`]?ph2.color:C.bdr}`,borderRadius:4,padding:"6px 10px",cursor:"pointer",color:data.books?.[`${ph2.id}-${book}`]?ph2.color:C.dm,fontSize:10,textAlign:"left",marginBottom:3,fontFamily:"monospace",display:"flex",gap:8}}><span>{data.books?.[`${ph2.id}-${book}`]?"✓":"○"}</span>{book}</button>))}
        </div>))}
        <div style={S.card}><div style={S.lbl}>ALL PHASES</div>{PHASES.map(p=>{ const avg=Math.round(p.subjects.reduce((a,s)=>a+(data.subjects[`${p.id}-${s}`]||0),0)/p.subjects.length); return(<div key={p.id} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2,fontSize:9}}><span style={{color:p.color,fontWeight:"bold"}}>{p.id} {p.label}</span><span style={{color:p.color,fontWeight:"bold"}}>{avg}%</span></div><Bar v={avg} max={100} col={p.color}/></div>); })}</div>
      </>)}

      <nav style={{position:"fixed",bottom:0,left:0,right:0,background:"#0A0E1A",borderTop:`1px solid ${C.r}22`,display:"flex",zIndex:100}}>
        {NAVS.map(n=>(<button key={n.id} onClick={()=>setView(n.id)} style={S.nav(view===n.id)}><span style={{fontSize:13}}>{n.i}</span><span style={{fontSize:7,letterSpacing:0.5,fontWeight:"bold"}}>{n.l}</span></button>))}
      </nav>
    </div>
  );
}
