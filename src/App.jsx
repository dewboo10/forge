// FORGE — Complete Interactive Preview
// React + Vite: replace src/App.jsx → npm run dev

import { useState, useEffect, useRef, useCallback } from "react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import * as api from "./api.js";
import "./App.css";

const REF_TIERS = [
  { refs:1,   icon:"🎁", label:"First Blood",      color:"#5ec98a", bg:"rgba(94,201,138,.1)",  border:"rgba(94,201,138,.22)",  reward:"3× Speed · 24H",       rewardType:"speed",    desc:"Your first recruit earns you a 24h burst",           subReward:"+5,000 FRG bonus" },
  { refs:3,   icon:"⚡", label:"Spark Node",        color:"#5ba8e8", bg:"rgba(91,168,232,.1)",  border:"rgba(91,168,232,.22)",  reward:"Auto-Mine · 3 Days",   rewardType:"automine", desc:"3 friends = 3 days of offline earning",             subReward:"+15,000 FRG bonus" },
  { refs:5,   icon:"🔥", label:"Live Wire",         color:"#e06c4c", bg:"rgba(224,108,76,.1)",  border:"rgba(224,108,76,.22)",  reward:"5× Speed · 7 Days",    rewardType:"speed",    desc:"5 active miners in your network",                   subReward:"+30,000 FRG bonus" },
  { refs:10,  icon:"🤖", label:"Mining Node",       color:"#e8b84b", bg:"rgba(232,184,75,.1)",  border:"rgba(232,184,75,.22)",  reward:"Auto-Mine · 30 Days",  rewardType:"automine", desc:"A full month of passive earning, free",             subReward:"+75,000 FRG bonus" },
  { refs:25,  icon:"💎", label:"Cluster Core",      color:"#c07cf0", bg:"rgba(192,124,240,.1)", border:"rgba(192,124,240,.22)", reward:"Permanent 2× Core",    rewardType:"permanent",desc:"25 referrals earns the permanent multiplier free",  subReward:"+200,000 FRG bonus" },
  { refs:50,  icon:"👑", label:"Sovereign Node",    color:"#FFB800", bg:"rgba(255,184,0,.1)",   border:"rgba(255,184,0,.22)",   reward:"Auto-Mine · 60 Days",  rewardType:"automine", desc:"50 recruits = 60 days passive mining, completely free", subReward:"+500,000 FRG + SOVEREIGN badge" },
  { refs:100, icon:"🌐", label:"Network Architect", color:"#c07cf0", bg:"rgba(192,124,240,.12)",border:"rgba(192,124,240,.3)",  reward:"Auto-Mine · 60 Days",  rewardType:"automine", desc:"100 recruits — double the rewards, 60 more days",       subReward:"+1,000,000 FRG + Network badge" },
  { refs:200, icon:"♾️", label:"Genesis Architect", color:"#e8b84b", bg:"rgba(232,184,75,.14)", border:"rgba(232,184,75,.38)",  reward:"Auto-Mine · LIFETIME", rewardType:"lifetime", desc:"200 people in your network. Earn offline forever.", subReward:"+5,000,000 FRG + Genesis NFT", elite:true },
];

const STORE_SECTIONS = [
  { id:"auto", label:"Auto-Mine", emoji:"🤖", color:"#e8b84b", tagline:"Earn while you sleep", items:[
    { id:"auto_7d",       name:"Auto-Mine · 7 Days",   icon:"🤖", priceTON:3,  tag:"STARTER",    tagColor:"#5ec98a", badge:"7 DAYS",   shortDesc:"Full rate while offline for 7 days",      earningNote:"At 0.1/s → +60,480 FRG offline",        color:"#e8b84b" },
    { id:"auto_30d",      name:"Auto-Mine · 30 Days",  icon:"🤖", priceTON:10, tag:"POPULAR",    tagColor:"#e8b84b", badge:"30 DAYS",  shortDesc:"Best value — covers a full season",        earningNote:"At 0.1/s → +259,200 FRG offline",       color:"#e8b84b", flagship:true },
    { id:"auto_lifetime", name:"Auto-Mine · Lifetime", icon:"♾️", priceTON:30, tag:"BEST VALUE", tagColor:"#c07cf0", badge:"FOREVER",  shortDesc:"One purchase. Mine offline forever.",     earningNote:"Pays for itself in 3.5 days then free forever.", color:"#c07cf0", flagship:true },
  ]},
  { id:"speed", label:"Speed Multipliers", emoji:"⚡", color:"#5ec98a", tagline:"Mine faster right now", items:[
    { id:"speed_3x",   name:"3× Speed · 7 Days",  icon:"⚡", priceTON:4,  tag:null,      tagColor:null,     badge:"3× · 7 DAYS",  shortDesc:"Triple earnings for a week",              earningNote:"Stack with Auto-Mine for 3× offline",    color:"#5ec98a" },
    { id:"speed_5x",   name:"5× Speed · 7 Days",  icon:"🔥", priceTON:8,  tag:"STRONG",  tagColor:"#e06c4c",badge:"5× · 7 DAYS",  shortDesc:"Best for leaderboard pushes",             earningNote:"5× faster offline with Auto-Mine",       color:"#e06c4c" },
    { id:"speed_perm", name:"Permanent 2× Core",  icon:"🔮", priceTON:18, tag:"FOREVER", tagColor:"#c07cf0",badge:"2× FOREVER",   shortDesc:"Everything you earn doubled forever",     earningNote:"Every upgrade and auto-mine multiplied by 2×", color:"#c07cf0", flagship:true },
  ]},
  { id:"chests", label:"FRG Head Start", emoji:"📦", color:"#5ba8e8", tagline:"Skip the early grind", items:[
    { id:"chest_s",  name:"Head Start · S",  icon:"📦", priceTON:2,  tag:null,          tagColor:null,     badge:"25K FRG",  shortDesc:"Unlock first 3 upgrades instantly",       earningNote:"Immediate rate boost pays back in 70h",  color:"#5ba8e8" },
    { id:"chest_m",  name:"Head Start · M",  icon:"📦", priceTON:5,  tag:"VALUE",        tagColor:"#5ec98a",badge:"100K FRG", shortDesc:"Max all base upgrades day one",           earningNote:"86× faster than free users from day 1",  color:"#5ba8e8" },
    { id:"chest_xl", name:"Head Start · XL", icon:"💎", priceTON:14, tag:"LEADERBOARD",  tagColor:"#c07cf0",badge:"500K FRG", shortDesc:"Instant top-leaderboard position",        earningNote:"Top rank attracts referrals → 10% forever", color:"#c07cf0", flagship:true },
  ]},
  { id:"referral", label:"Referral Amplifiers", emoji:"👥", color:"#e06c4c", tagline:"Earn more from people you already referred", items:[
    { id:"ref_2x", name:"Referral 2× Amp", icon:"📡", priceTON:5,  tag:null,          tagColor:null,      badge:"2× PASSIVE", shortDesc:"Double what every referral earns you",    earningNote:"10 friends → earn 20% not 10%",          color:"#e06c4c" },
    { id:"ref_5x", name:"Referral 5× Amp", icon:"📡", priceTON:15, tag:"HIGH INCOME", tagColor:"#e06c4c", badge:"5× PASSIVE", shortDesc:"50% of all referral earnings forever",   earningNote:"10 friends × 100 FRG/day = 500 FRG/day to you", color:"#e06c4c", flagship:true },
  ]},
];

const UPGRADES = [
  { id:1, name:"Neural Boost",  icon:"◈", baseCost:500,    rateBonus:0.5, maxLevel:5, color:"#e8b84b", desc:"Overclocks base processing" },
  { id:2, name:"Plasma Array",  icon:"◉", baseCost:2500,   rateBonus:2.5, maxLevel:5, color:"#e06c4c", desc:"Parallel hashing cores" },
  { id:3, name:"Quantum Forge", icon:"◎", baseCost:10000,  rateBonus:8,   maxLevel:4, color:"#5ec98a", desc:"Quantum tunnelling" },
  { id:4, name:"Dark Matter",   icon:"⬡", baseCost:40000,  rateBonus:25,  maxLevel:3, color:"#5ba8e8", desc:"Anti-matter collision" },
  { id:5, name:"Singularity",   icon:"✦", baseCost:180000, rateBonus:80,  maxLevel:2, color:"#c07cf0", desc:"Space-time compression" },
];

const MISSIONS = [
  { id:"m1", icon:"⛏", name:"The Miner",    color:"#e8b84b", key:"total",     unit:"FRG", checkpoints:[{at:1000,r:500,l:"1K"},{at:5000,r:1500,l:"5K"},{at:20000,r:5000,l:"20K"},{at:100000,r:20000,l:"100K"},{at:500000,r:80000,l:"500K"}] },
  { id:"m2", icon:"⬡", name:"Block Hunter", color:"#c07cf0", key:"blocks",    unit:"blk", checkpoints:[{at:1,r:500,l:"1"},{at:5,r:2500,l:"5"},{at:20,r:8000,l:"20"},{at:50,r:20000,l:"50"}] },
  { id:"m3", icon:"👥", name:"Recruiter",    color:"#e06c4c", key:"refs",      unit:"ref", checkpoints:[{at:1,r:5000,l:"1"},{at:5,r:30000,l:"5"},{at:10,r:100000,l:"10"},{at:25,r:500000,l:"25"}] },
  { id:"m4", icon:"⚡", name:"Speed Demon",  color:"#5ba8e8", key:"rate",      unit:"/s",  checkpoints:[{at:1,r:500,l:"1/s"},{at:5,r:3000,l:"5/s"},{at:20,r:12000,l:"20/s"},{at:50,r:30000,l:"50/s"}] },
];

const CRYPTO_STORIES = [
  { id:"notcoin", title:"Notcoin",        year:"2024",      color:"#FFB800", icon:"🪙", badge:"BINANCE LISTED",  subtitle:"The Tap That Changed Everything", stats:[{l:"Peak Users",v:"35M",s:"3 months"},{l:"Market Cap",v:"$1.4B",s:"at peak"},{l:"Token Price",v:"$0.028",s:"at listing"},{l:"Early ROI",v:"100×",s:"avg miner"}], story:"Started as a simple Telegram tap game in January 2024. Early miners collected NOT coins for free. When it listed on Binance in May 2024, miners who got 10M NOT received ~$280 — just for tapping.", lesson:"Early miners always win. Free mining creates real value at listing." },
  { id:"hamster",  title:"Hamster Kombat", year:"2024",      color:"#FF6B35", icon:"🐹", badge:"300M PLAYERS",    subtitle:"The CEO Clicker Empire",          stats:[{l:"Total Users",v:"300M",s:"all time"},{l:"Airdrop",v:"$200M+",s:"distributed"},{l:"Listed",v:"$0.008",s:"on Bybit"},{l:"Peak DAU",v:"52M",s:"daily"}], story:"Launched March 2024. Players tapped a hamster CEO. Within weeks it had more daily users than most countries have internet users. The HMSTR airdrop distributed hundreds of millions to early players.", lesson:"Gamified mining with a clear narrative goes viral. Keep it simple." },
  { id:"pi", title:"Pi Network", year:"2019–2024", color:"#7C3AED", icon:"🌐", badge:"60M USERS", subtitle:"The Long Game", stats:[{l:"Users",v:"60M",s:"registered"},{l:"Daily Active",v:"10M+",s:"miners"},{l:"Token Value",v:"$1.50+",s:"at launch"},{l:"Time Held",v:"6 years",s:"before listing"}], story:"Pi Network spent 6 years building a community of 60 million loyal users before listing their token. When it finally launched, early members who had been mining for free saw their holdings become genuinely valuable — because the size of the community was the product itself.", lesson:"Community size is the real asset. Patient early miners always outperform." },
  { id:"tapswap",  title:"TapSwap",        year:"2024",      color:"#06B6D4", icon:"👆", badge:"50M IN 60 DAYS",  subtitle:"Zero to 50M in 60 Days",          stats:[{l:"Users",v:"50M",s:"in 60 days"},{l:"Taps/day",v:"2B",s:"peak"},{l:"Countries",v:"180+",s:"worldwide"},{l:"Speed",v:"0→50M",s:"2 months"}], story:"TapSwap reached 50 million users in 60 days — one of the fastest growing apps in history. It proved tap-to-earn works globally, not just in crypto circles.", lesson:"Tap-to-earn is a viral loop that works across all demographics." },
];

const MOCK_CIRCLE = [
  { id:1, name:"Alex_M",  trusted:true,  avatar:"A", color:"#5ec98a" },
  { id:2, name:"Node_77", trusted:true,  avatar:"N", color:"#5ba8e8" },
  { id:3, name:"0xPriya", trusted:false, pending:true, avatar:"P", color:"#e8b84b" },
];

const DAYS = ["M","T","W","T","F","S","S"];
const MILESTONES = [1000,5000,20000,100000,500000,2000000,10000000];

function fmt(n){ if(n>=1e9)return(n/1e9).toFixed(2)+"B"; if(n>=1e6)return(n/1e6).toFixed(2)+"M"; if(n>=1e3)return(n/1e3).toFixed(1)+"K"; return n.toFixed(1); }
function calcEffectiveRate(upgObj={},purchased=[]){
  const upgradeBonus=UPGRADES.reduce((a,u)=>a+u.rateBonus*((upgObj[u.id]||upgObj[String(u.id)])||0),0);
  const permMult=purchased.includes?.('speed_perm')||purchased['speed_perm']?2:1;
  return(0.1+upgradeBonus)*permMult;
}
function fmtTime(s){ const h=~~(s/3600),m=~~((s%3600)/60),ss=s%60; if(h)return`${h}h ${m}m`; if(m)return`${m}m ${ss}s`; return`${ss}s`; }
function genHash(){ const c="0123456789abcdef"; return Array.from({length:64},()=>c[~~(Math.random()*16)]).join(""); }
function nowTs(){ const d=new Date(); return`${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`; }
function hexParts(hex){ return [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)]; }

/* ═══ CSS ═══ */

/* ═══ NODE CANVAS ═══ */
function NodeCanvas({ active }) {
  const ref = useRef(null), st = useRef({ active:false, raf:null });
  useEffect(()=>{ st.current.active = active; },[active]);
  useEffect(()=>{
    const cvs = ref.current; if(!cvs) return;
    const ctx = cvs.getContext('2d');
    const resize = ()=>{
      const r=cvs.parentElement.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
      cvs.width=r.width*dpr; cvs.height=r.height*dpr;
      cvs.style.width=r.width+'px'; cvs.style.height=r.height+'px';
      ctx.scale(dpr,dpr);
    };
    resize();
    const W=()=>cvs.parentElement.getBoundingClientRect().width;
    const H=()=>cvs.parentElement.getBoundingClientRect().height;
    const N=18;
    const nodes=Array.from({length:N},()=>({x:Math.random()*W(),y:Math.random()*H(),vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*2+1.2,phase:Math.random()*Math.PI*2,pr:0,pulsing:false}));
    const pi=setInterval(()=>{ if(st.current.active){const n=nodes[~~(Math.random()*N)]; n.pulsing=true; n.pr=0;} },720);
    let last=performance.now();
    const draw=(now)=>{
      const dt=Math.min(now-last,32); last=now;
      const w=W(),h=H(); ctx.clearRect(0,0,w,h); const ia=st.current.active;
      nodes.forEach(n=>{
        if(ia){n.x+=n.vx*dt/16; n.y+=n.vy*dt/16; if(n.x<0||n.x>w)n.vx*=-1; if(n.y<0||n.y>h)n.vy*=-1; n.x=Math.max(0,Math.min(w,n.x)); n.y=Math.max(0,Math.min(h,n.y)); n.phase+=.03;}
        if(n.pulsing){n.pr+=1.4; const a=Math.max(0,1-n.pr/26); ctx.beginPath(); ctx.arc(n.x,n.y,n.pr,0,Math.PI*2); ctx.strokeStyle=`rgba(232,184,75,${a*.38})`; ctx.lineWidth=1; ctx.stroke(); if(n.pr>=26){n.pulsing=false; n.pr=0;}}
      });
      for(let i=0;i<N;i++) for(let j=i+1;j<N;j++){
        const a=nodes[i],b=nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y),mx=ia?84:60;
        if(d<mx){const al=(1-d/mx)*(ia?.26:.07); ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.strokeStyle=`rgba(232,184,75,${al})`; ctx.lineWidth=.7; ctx.stroke();}
      }
      nodes.forEach(n=>{
        const br=ia?(.4+.6*Math.sin(n.phase)):.18;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle=`rgba(232,184,75,${br})`; ctx.fill();
        if(ia){ctx.beginPath(); ctx.arc(n.x,n.y,n.r+2,0,Math.PI*2); ctx.fillStyle=`rgba(232,184,75,${br*.12})`; ctx.fill();}
      });
      st.current.raf = requestAnimationFrame(draw);
    };
    st.current.raf = requestAnimationFrame(draw);
    return ()=>{ cancelAnimationFrame(st.current.raf); clearInterval(pi); };
  },[]);
  return <canvas ref={ref} className="ncvs"/>;
}

function Sparkline({data,color}){
  if(!data||data.length<2) return null;
  const w=44,h=22,mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/rng)*h}`).join(' ');
  return <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"><polyline points={pts} fill="none" stroke={color||'#e8b84b'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

/* ═══ LEGACY MODAL — shown once on first launch ═══ */
function LegacyModal({onClose,onMine}){
  const [slide,setSlide]=useState(0);
  const s=CRYPTO_STORIES[slide];
  const [r,g,b]=hexParts(s.color);
  const isLast=slide===CRYPTO_STORIES.length-1;
  const goNext=()=>isLast?(onClose(),onMine?.()):setSlide(sl=>sl+1);
  return (
    <div className="legacy-overlay">
      <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
        <div className="lg-header">
          <div style={{width:29}}/>
          <div className="lg-title-wrap">
            <div className="lg-title">CRYPTO LEGACY</div>
            <div className="lg-sub">HOW EARLY MINERS BUILT BILLIONS</div>
          </div>
          <div className="lg-close" onClick={onClose}>×</div>
        </div>
        <div className="lg-dots">{CRYPTO_STORIES.map((_,i)=><div key={i} className={`lg-dot${i===slide?' active':''}`} onClick={()=>setSlide(i)}/>)}</div>
        <div className="lg-scroll">
          <div className="story-slide" key={slide}>
            <div className="story-hero" style={{background:`linear-gradient(135deg,rgba(${r},${g},${b},.13),rgba(${r},${g},${b},.05))`,border:`1px solid rgba(${r},${g},${b},.27)`}}>
              <div className="story-badge" style={{background:`rgba(${r},${g},${b},.14)`,color:s.color,borderColor:`rgba(${r},${g},${b},.34)`}}>{s.badge}</div>
              <span className="story-icon">{s.icon}</span>
              <div className="story-title" style={{color:s.color}}>{s.title}</div>
              <div className="story-year">{s.year}</div>
              <div className="story-tagline">{s.subtitle}</div>
            </div>
            <div className="story-stats">
              {s.stats.map((st2,i)=>(
                <div key={i} className="ss-card" style={{borderColor:`rgba(${r},${g},${b},.2)`,background:`rgba(${r},${g},${b},.07)`}}>
                  <div className="ss-lbl">{st2.l}</div>
                  <div className="ss-val" style={{color:s.color}}>{st2.v}</div>
                  <div className="ss-sub">{st2.s}</div>
                </div>
              ))}
            </div>
            <div className="story-body">
              <div className="sb-lbl">The Story</div>
              <div className="sb-text">{s.story}</div>
            </div>
            <div className="story-lesson" style={{background:`rgba(${r},${g},${b},.07)`,border:`1px solid rgba(${r},${g},${b},.2)`}}>
              <div className="sl-icon">💡</div>
              <div><div className="sl-lbl" style={{color:s.color}}>The Lesson</div><div className="sl-text">{s.lesson}</div></div>
            </div>
            {isLast&&(
              <div className="oct-opp" style={{background:'linear-gradient(135deg,rgba(232,184,75,.1),rgba(201,122,26,.06))',border:'1.5px solid rgba(232,184,75,.28)'}}>
                <div className="oo-icon">⛏</div>
                <div className="oo-title" style={{color:'var(--gold)'}}>Now It Is Your Turn</div>
                <div className="oo-sub" style={{color:'var(--mt)'}}>Every project above started with zero users and zero value.<br/>Forge FRG mining is live. Early miners have always won — this is no different.</div>
                <div className="oo-stats">
                  <div className="oos"><div className="oos-v" style={{color:'var(--gold)'}}>1B</div><div className="oos-l">FRG SUPPLY</div></div>
                  <div className="oos"><div className="oos-v" style={{color:'var(--gold)'}}>40%</div><div className="oos-l">MINING SHARE</div></div>
                  <div className="oos"><div className="oos-v" style={{color:'var(--green)'}}>FREE</div><div className="oos-l">TO MINE</div></div>
                </div>
                <button className="oo-cta" style={{background:'linear-gradient(135deg,#a05808,#e8b84b)'}} onClick={()=>{onClose();onMine?.();}}>▶ START MINING FRG</button>
              </div>
            )}
          </div>
        </div>
        <div className="lg-nav">
          <button className="ln-btn" onClick={()=>setSlide(s=>Math.max(0,s-1))} disabled={slide===0}>← Prev</button>
          <button className="ln-btn primary" onClick={goNext}>{isLast?'Start Mining →':`Next: ${CRYPTO_STORIES[slide+1].title} →`}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══ PURCHASE MODAL ═══ */
function PurchaseModal({item,onConfirm,onClose}){
  if(!item) return null;
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <div className="modal-header">
          <div className="modal-icon">{item.icon}</div>
          <div><div className="modal-title">{item.name}</div><div className="modal-sub">{item.badge}</div></div>
        </div>
        <div className="modal-desc">{item.shortDesc}</div>
        <div className="modal-feats">
          {['Activates immediately','Full mining rate included','Stacks with all upgrades','Counts toward leaderboard'].map((f,i)=>(
            <div key={i} className="mf-row"><div className="mf-check">✓</div>{f}</div>
          ))}
        </div>
        {item.earningNote&&<div className="modal-earn"><span style={{flexShrink:0}}>◈</span>{item.earningNote}</div>}
        <div className="modal-price-row">
          <div>
            <div className="modal-price-lbl">TOTAL PRICE</div>
            <div style={{display:'flex',alignItems:'baseline',gap:5}}>
              <span className="modal-price-amt">{item.priceTON}</span>
              <span className="modal-price-unit">TON</span>
            </div>
          </div>
          <div className="ton-badge-lg"><span className="tbl-icon">💎</span><div className="tbl-text">Paid via<br/><strong style={{color:'#0098EA'}}>TON Wallet</strong></div></div>
        </div>
        <button className="modal-btn confirm" onClick={onConfirm}>💎 PAY {item.priceTON} TON NOW</button>
        <button className="modal-btn cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

/* ═══ REWARD POPUP ═══ */
function RewardPopup({tier,onClose}){
  if(!tier) return null;
  const typeEmoji=tier.rewardType==='automine'?'🤖':tier.rewardType==='speed'?'⚡':tier.rewardType==='permanent'?'🔮':tier.rewardType==='lifetime'?'♾️':'🎁';
  return (
    <div className="reward-popup">
      <div className="rp-card" style={{border:`1.5px solid ${tier.border}`}}>
        <div className="rp-emoji">{tier.icon}</div>
        <div className="rp-pretitle">REFERRAL MILESTONE REACHED</div>
        <div className="rp-title" style={{color:tier.color}}>{tier.label}</div>
        <div className="rp-reward" style={{color:tier.color}}>{typeEmoji} {tier.reward}</div>
        <div className="rp-sub">{tier.subReward}</div>
        <div className="rp-desc">{tier.desc}</div>
        <button className="rp-btn" onClick={onClose}>✓ CLAIM REWARD</button>
      </div>
    </div>
  );
}

/* ═══ SECURITY CIRCLE ═══ */
function SecurityCircle({onShowToast}){
  const COLORS=['#5ec98a','#5ba8e8','#c07cf0','#e06c4c','#FFB800'];
  const [circle,setCircle]=useState(MOCK_CIRCLE);
  const [incoming,setIncoming]=useState([
    {id:101,name:'CryptoKev',avatar:'C',color:'#c07cf0',since:'2 min ago'},
    {id:102,name:'Miner_Riya',avatar:'R',color:'#FFB800',since:'14 min ago'},
  ]);
  // Load from backend
  useEffect(()=>{
    api.circle.getCircle().then(data=>{
      if(data.members?.length>0){
        setCircle(data.members.map(m=>({
          id:m.memberId,name:m.name,trusted:m.verified,
          avatar:(m.name||'?')[0].toUpperCase(),
          color:COLORS[m.memberId%5]||'#5ec98a',
          pending:false,
        })));
      }
      if(data.incoming?.length>0){
        setIncoming(data.incoming.map(r=>({
          id:r.id,name:r.name,avatar:(r.name||'?')[0].toUpperCase(),
          color:COLORS[r.senderId%5]||'#c07cf0',since:new Date(r.since).toLocaleTimeString(),
        })));
      }
    }).catch(()=>{});
  },[]);
  const [addInput,setAddInput]=useState('');
  const [adding,setAdding]=useState(false);
  const [activeTab,setActiveTab]=useState('circle'); // 'circle' | 'requests'

  const filledSlots=circle.length;
  const trustedCount=circle.filter(m=>m.trusted).length;
  const trustScore=Math.round((trustedCount/5)*100);

  const handleAdd=async()=>{
    if(!addInput.trim()||filledSlots>=5) return;
    const nm={id:Date.now(),name:addInput.trim(),trusted:false,pending:true,avatar:addInput[0].toUpperCase(),color:COLORS[filledSlots%5]};
    setCircle(p=>[...p,nm]); setAddInput(''); setAdding(false);
    onShowToast('📡','Invite Sent!',`${nm.name} will receive your request`);
    try{
      await api.circle.invite(addInput.trim());
    }catch(e){ console.error('Circle invite error:',e); }
  };

  const acceptRequest=async(req)=>{
    if(filledSlots>=5){onShowToast('⚠️','Circle Full','Remove someone first');return;}
    const nm={id:req.id,name:req.name,trusted:true,avatar:req.avatar,color:req.color};
    setCircle(p=>[...p,nm]);
    setIncoming(p=>p.filter(r=>r.id!==req.id));
    onShowToast('✅','Accepted!',`${req.name} is now in your Security Circle`);
    try{ await api.circle.accept(req.id); }catch(e){ console.error('Circle accept error:',e); }
  };

  const declineRequest=async(req)=>{
    setIncoming(p=>p.filter(r=>r.id!==req.id));
    onShowToast('✕','Declined',`${req.name}'s request removed`);
    try{ await api.circle.decline(req.id); }catch(e){ console.error('Circle decline error:',e); }
  };

  const removeFromCircle=async(id)=>{
    setCircle(p=>p.filter(m=>m.id!==id));
    try{ await api.circle.remove(id); }catch(e){ console.error('Circle remove error:',e); }
  };

  return (
    <div className="sc-card">
      
      <div className="sc-header">
        <div>
          <div className="sc-title">SECURITY CIRCLE</div>
          <div className="sc-sub">5 trusted contacts who verify your account is real</div>
        </div>
        <div className="sc-trust-score"><div className="sc-score-val">{trustScore}</div><div className="sc-score-lbl">TRUST SCORE</div></div>
      </div>
      <div className="sc-trust-bar"><div className="sc-trust-fill" style={{width:`${(filledSlots/5)*100}%`}}/></div>

      
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        <button onClick={()=>setActiveTab('circle')} style={{flex:1,padding:'6px 0',borderRadius:7,border:`1px solid ${activeTab==='circle'?'rgba(91,168,232,.35)':'var(--br)'}`,background:activeTab==='circle'?'rgba(91,168,232,.1)':'var(--sf2)',fontFamily:'var(--mono)',fontSize:8.5,color:activeTab==='circle'?'var(--blue)':'var(--mt)',cursor:'pointer',fontWeight:activeTab==='circle'?600:400}}>
          My Circle ({filledSlots}/5)
        </button>
        <button onClick={()=>setActiveTab('requests')} style={{flex:1,padding:'6px 0',borderRadius:7,border:`1px solid ${activeTab==='requests'?'rgba(232,184,75,.35)':'var(--br)'}`,background:activeTab==='requests'?'rgba(232,184,75,.1)':'var(--sf2)',fontFamily:'var(--mono)',fontSize:8.5,cursor:'pointer',position:'relative',fontWeight:activeTab==='requests'?600:400,color:activeTab==='requests'?'var(--gold)':'var(--mt)'}}>
          Requests {incoming.length>0&&<span style={{display:'inline-block',background:'var(--red)',color:'#fff',borderRadius:10,padding:'0 5px',fontSize:7,fontWeight:700,marginLeft:4}}>{incoming.length}</span>}
        </button>
      </div>

      
      {activeTab==='circle'&&(
        <>
          <div className="sc-circle">
            {Array.from({length:5},(_,i)=>{
              const m=circle[i];
              if(!m) return (
                <div key={i} className="sc-slot" onClick={()=>setAdding(true)}>
                  <div style={{fontSize:16,color:'var(--mt)',marginBottom:2}}>＋</div>
                  <div style={{fontFamily:'var(--mono)',fontSize:7,color:'var(--mt)'}}>Add</div>
                </div>
              );
              return (
                <div key={m.id} className={`sc-slot filled${m.pending?' pending':''}`} style={{borderColor:m.trusted?`${m.color}44`:'rgba(232,184,75,.28)'}}>
                  {m.trusted&&<div className="sc-tick">✓</div>}
                  <div className="sc-slot-avt" style={{background:`${m.color}22`,color:m.color}}>{m.avatar}</div>
                  <div className="sc-slot-name" style={{color:m.trusted?'var(--tx2)':'var(--gold)'}}>{m.name}</div>
                  <div className="sc-slot-status" style={{color:m.pending?'var(--gold)':'var(--green)'}}>{m.pending?'pending':'verified'}</div>
                  {m.trusted&&<div onClick={(e)=>{e.stopPropagation();removeFromCircle(m.id);}} style={{position:'absolute',bottom:3,right:3,width:11,height:11,borderRadius:'50%',background:'rgba(224,85,85,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,color:'var(--red)',cursor:'pointer',border:'1px solid rgba(224,85,85,.3)'}}>✕</div>}
                </div>
              );
            })}
          </div>
          {adding?(
            <div style={{display:'flex',gap:6,marginBottom:10}}>
              <input value={addInput} onChange={e=>setAddInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdd()} placeholder="Enter username or Telegram ID..." autoFocus style={{flex:1,background:'rgba(0,0,0,.4)',border:'1px solid rgba(91,168,232,.28)',borderRadius:8,padding:'8px 10px',fontFamily:'var(--mono)',fontSize:11,color:'var(--tx)',outline:'none'}}/>
              <button onClick={handleAdd} style={{padding:'8px 12px',borderRadius:8,background:'linear-gradient(135deg,#1a5a8a,var(--blue))',border:'none',color:'#fff',fontFamily:'var(--mono)',fontSize:9.5,fontWeight:700,cursor:'pointer'}}>SEND</button>
              <button onClick={()=>setAdding(false)} style={{padding:'8px 10px',borderRadius:8,background:'var(--sf2)',border:'1px solid var(--br2)',color:'var(--mt)',fontFamily:'var(--mono)',fontSize:9.5,cursor:'pointer'}}>✕</button>
            </div>
          ):(
            filledSlots<5&&<button onClick={()=>setAdding(true)} style={{width:'100%',padding:'8px',marginBottom:10,borderRadius:8,border:'1px dashed rgba(91,168,232,.28)',background:'transparent',color:'var(--blue)',fontFamily:'var(--mono)',fontSize:9,cursor:'pointer'}}>＋ Invite someone to your circle</button>
          )}
          <div className="sc-benefits">
            {[`+${trustScore}% trust score — boosts FRG allocation at listing`,`${trustedCount} verified contacts protect your account`,`Full circle (5/5) = eligible for Genesis airdrop tier`,`Higher trust = priority in early token distribution`].map((b,i)=>(
              <div key={i} className="sc-benefit"><div className="sc-benefit-dot" style={{background:i<trustedCount?'var(--blue)':'var(--br2)'}}/><span style={{color:i<trustedCount?'var(--tx2)':'var(--mt)'}}>{b}</span></div>
            ))}
          </div>
          <div className="sc-info-box">◈ Each verified contact adds to your trust score and helps protect the FRG network from fake accounts. Higher trust score = larger FRG allocation at token listing.</div>
        </>
      )}

      
      {activeTab==='requests'&&(
        <>
          {incoming.length===0?(
            <div style={{textAlign:'center',padding:'20px 0',fontFamily:'var(--mono)',fontSize:9,color:'var(--mt)'}}>
              No pending requests<br/>
              <span style={{fontSize:8,opacity:.6}}>When someone adds you to their circle, it appears here</span>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:10}}>
              <div style={{fontFamily:'var(--mono)',fontSize:8,color:'var(--mt)',letterSpacing:'.1em',marginBottom:2}}>INCOMING CIRCLE REQUESTS</div>
              {incoming.map(req=>(
                <div key={req.id} style={{display:'flex',alignItems:'center',gap:10,background:'rgba(0,0,0,.28)',border:'1px solid var(--br)',borderRadius:10,padding:'10px 12px'}}>
                  <div style={{width:32,height:32,borderRadius:8,background:`${req.color}22`,border:`1px solid ${req.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--mono)',fontSize:13,fontWeight:600,color:req.color,flexShrink:0}}>{req.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:500,color:'var(--tx)',marginBottom:2}}>{req.name}</div>
                    <div style={{fontFamily:'var(--mono)',fontSize:7.5,color:'var(--mt)'}}>Wants to add you · {req.since}</div>
                  </div>
                  <button onClick={()=>acceptRequest(req)} style={{padding:'5px 10px',borderRadius:7,background:'linear-gradient(135deg,#2e7d4f,var(--green))',border:'none',color:'#fff',fontFamily:'var(--mono)',fontSize:8.5,fontWeight:700,cursor:'pointer',marginRight:4}}>✓</button>
                  <button onClick={()=>declineRequest(req)} style={{padding:'5px 10px',borderRadius:7,background:'rgba(224,85,85,.1)',border:'1px solid rgba(224,85,85,.28)',color:'var(--red)',fontFamily:'var(--mono)',fontSize:8.5,cursor:'pointer'}}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div style={{fontFamily:'var(--mono)',fontSize:8,color:'var(--mt)',letterSpacing:'.1em',marginBottom:8,marginTop:4}}>YOUR CIRCLE MEMBERS</div>
          {circle.length===0?(
            <div style={{fontFamily:'var(--mono)',fontSize:8.5,color:'var(--mt)',textAlign:'center',padding:'10px 0'}}>Your circle is empty — go to My Circle tab to add people</div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {circle.map(m=>(
                <div key={m.id} style={{display:'flex',alignItems:'center',gap:9,background:'rgba(0,0,0,.22)',borderRadius:9,padding:'8px 11px'}}>
                  <div style={{width:26,height:26,borderRadius:6,background:`${m.color}22`,border:`1px solid ${m.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--mono)',fontSize:11,fontWeight:600,color:m.color,flexShrink:0}}>{m.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11.5,fontWeight:500,color:'var(--tx)'}}>{m.name}</div>
                    <div style={{fontFamily:'var(--mono)',fontSize:7,color:m.pending?'var(--gold)':m.trusted?'var(--green)':'var(--mt)'}}>{m.pending?'⏳ Awaiting acceptance':m.trusted?'✓ Verified in your circle':'Not trusted'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══ MAIN APP ═══ */
export default function App(){
  const [tab,setTab]=useState('mine');
  const [balance,setBalance]=useState(0);
  const [mining,setMining]=useState(false);
  const [upgrades,setUpgrades]=useState({});
  const [sessE,setSessE]=useState(0);
  const [sessT,setSessT]=useState(0);
  const [totalMined,setTotal]=useState(0);
  const [blocks,setBlocks]=useState(0);
  const [referralCount]=useState(2);
  const [missionPoints,setMP]=useState(0);
  const [claimedCPs,setCC]=useState({});
  const [purchased,setPurch]=useState({});
  const [particles,setPart]=useState([]);
  const [toast,setToast]=useState(null);
  const [boostCh,setBoostCh]=useState(1); // 3× SURGE free charge
  const [turboCh,setTurboCh]=useState(1); // 5× SURGE free charge
  // Timestamps when free charge was last used (for cooldown)
  const [surgeUsedAt,setSurgeUsedAt]=useState(null);  // 4h cooldown
  const [turboUsedAt,setTurboUsedAt]=useState(null);  // 6h cooldown
  const [now,setNow]=useState(Date.now());
  const [activeBoost,setAB]=useState(null);
  const [netHash,setNetHash]=useState(912.4);
  const [showLegacy,setLegacy]=useState(()=>!localStorage.getItem('forge_legacy_seen'));
  const [simRefs,setSimRefs]=useState(0);
  const [claimedTiers,setClaimedTiers]=useState(new Set());
  const [rewardPopup,setRewardPopup]=useState(null);
  const [copied,setCopied]=useState(false);
  const [hash,setHash]=useState({a:genHash(),b:genHash().slice(0,16),c:genHash().slice(0,16)});
  const [tick,setTick]=useState(false);
  const [rateH,setRateH]=useState([]);
  const [balH,setBalH]=useState([]);
  const [log,setLog]=useState([{t:'00:00',type:'info',msg:'Forge node initialized. Ready.'}]);
  const [circleMembers,setCircleMembers]=useState(MOCK_CIRCLE);
  const [lbData,setLbData]=useState(null);
  const [storeTab,setStoreTab]=useState('all');
  const [teamTab,setTeamTab]=useState('refer');
  const pid=useRef(0);
  const mineR=useRef(null),sesR=useRef(null),boostR=useRef(null);
  const circleRef=useRef(null);
  const prevBal=useRef(0),prevBlocks=useRef(0),prevMining=useRef(false);

  const showToast=useCallback((icon,title,sub)=>{setToast({icon,title,sub});setTimeout(()=>setToast(null),3200);},[]);
  const addParticle=useCallback(({x,y,label})=>{const id=pid.current++;setPart(p=>[...p,{id,x,y,label}]);setTimeout(()=>setPart(p=>p.filter(q=>q.id!==id)),1100);},[]);
  const addLog=useCallback((type,msg)=>setLog(p=>[{t:nowTs(),type,msg},...p].slice(0,40)),[]);
  const [apiLoaded,setApiLoaded]=useState(false);
  const [apiError,setApiError]=useState(null);

  // ── Notifications ──────────────────────────────────────────
  const [notifOpen,setNotifOpen]=useState(false);
  const [notifs,setNotifs]=useState([]);
  const unreadCount=notifs.filter(n=>!n.read).length;

  const [pendingPurchase,setPendingPurchase]=useState(null);
  const [tonConnectUI]=useTonConnectUI();
  const userFriendlyAddress=useTonAddress();
  // Auto-link wallet when connected
  useEffect(()=>{
    if(userFriendlyAddress){
      api.wallet.linkWallet(userFriendlyAddress).catch(()=>{});
    }
  },[userFriendlyAddress]);

  // ── On mount: auth + load state from backend ──────────────
  useEffect(()=>{
    async function init(){
      try{
        const user=await api.auth.login();
        setBalance(user.balance||0);
        setTotal(user.totalMined||0);
        const rawUpg=user.upgrades||{};
        const normUpg={};
        Object.entries(rawUpg).forEach(([k,v])=>{normUpg[Number(k)]=v;normUpg[String(k)]=v;});
        setUpgrades(normUpg);
        // Get accurate purchased state from store (handles expiry correctly)
        try{
          const storeData=await api.store.getPurchased();
          const map={};
          (storeData.purchased||[]).forEach(id=>{map[id]=true;});
          // Also include permanent items from user.purchased (speed_perm etc)
          (user.purchased||[]).forEach(id=>{map[id]=true;});
          setPurch(map);
        }catch(e){
          // Fallback to auth data
          setPurch(Object.fromEntries((user.purchased||[]).map(k=>[k,true])));
        }
        setSimRefs(user.referralCount||0);
        if(user.miningStartedAt) setMining(true);
        // Claim offline earnings if auto-mine active
        if((user.purchased||[]).some(p=>p.includes('auto'))){
          try{
            const offline=await api.mining.claimOffline();
            if(offline.earned>0){
              setBalance(b=>b+offline.earned);
              setTotal(t=>t+offline.earned);
              showToast('🤖','Auto-Mine Earnings',`+${fmt(offline.earned)} FRG while offline`);
            }
          }catch(e){}
        }
        setApiLoaded(true);
      }catch(e){
        console.error('Init error:',e);
        setApiLoaded(true); // still show UI in dev mode
      }
    }
    init();
  },[]);

  // Fetch notifications on load and when panel opens
  useEffect(()=>{
    api.notifications?.getAll().then(setNotifs).catch(()=>{});
  },[notifOpen]);


  const handleBuy=useCallback(async(item)=>{
    setPendingPurchase(item);
  },[]);

  const confirmPurchase=useCallback(async()=>{
    if(!pendingPurchase)return;
    const item=pendingPurchase;
    setPendingPurchase(null);
    if(!userFriendlyAddress){
      try{ await tonConnectUI.connectWallet(); }catch(e){ showToast('❌','Wallet not connected','Please connect your TON wallet'); return; }
    }
    try{
      const nanoTON=BigInt(Math.round(item.priceTON*1e9));
      const tx=await tonConnectUI.sendTransaction({
        validUntil:Math.floor(Date.now()/1000)+360,
        messages:[{address:import.meta.env.VITE_TON_ADDRESS||'UQBFckNE8kCNR8vT3MaOGHgxHB8B4TxBikmPNH6y1AvFDG3y',amount:nanoTON.toString(),payload:''}]
      });
      showToast('⏳','Verifying payment','Please wait...');
      // Verify on backend — backend activates the item
      const res=await api.store.verifyPurchase(tx.boc,item.id);
      if(res.success){
        // Handle one-time boost activations (not permanent purchases)
        if(item.id==='boost_surge'){
          setAB({mult:3,rem:60,label:'3× SURGE'});
          showToast('⚡','3× SURGE Active!','60 seconds · paid');
          addLog('info','⚡ Paid SURGE activated');
        } else if(item.id==='boost_turbo'){
          setAB({mult:2,rem:90,label:'TURBO'});
          showToast('🔥','TURBO Active!','90 seconds · paid');
          addLog('info','🔥 Paid TURBO activated');
        } else if(item.type==='chest'){
          // Chest: FRG credited, not added to purchased
          if(res.newBalance) setBalance(res.newBalance);
          showToast('📦',`+${res.frgCredited?.toLocaleString()||''} FRG`,`Head Start credited!`);
          addLog('info',`📦 ${item.name}: +${res.frgCredited} FRG`);
        } else if(res.expiresAt){
          // Expirable item (auto_7d, auto_30d, speed_3x etc)
          setPurch(p=>({...p,[item.id]:true}));
          if(res.newBalance) setBalance(res.newBalance);
          const exp=new Date(res.expiresAt);
          showToast('✅',`${item.name} Active!`,`Expires ${exp.toLocaleDateString()}`);
          addLog('info',`💎 ${item.name} active until ${exp.toLocaleDateString()}`);
        } else {
          // Permanent item (speed_perm, auto_lifetime)
          setPurch(p=>({...p,[item.id]:true}));
          if(res.newBalance) setBalance(res.newBalance);
          showToast('✅',`${item.name} Activated!`,`Paid ${item.priceTON} TON · permanent`);
          addLog('info',`💎 ${item.name}: permanent`);
        }
      }
    }catch(e){
      if(e.message?.includes('cancelled')||e.message?.includes('rejected')){
        showToast('❌','Transaction cancelled','No payment was made');
      } else {
        showToast('❌','Verification failed','Contact support if TON was deducted');
        console.error('Purchase error:',e);
      }
    }
  },[pendingPurchase,tonConnectUI,userFriendlyAddress,showToast,addLog]);

  const baseRate=0.1;
  const upgradeRate=UPGRADES.reduce((acc,u)=>{const lv=upgrades[u.id]||upgrades[String(u.id)]||0;return acc+u.rateBonus*lv;},0);
  const permMult=purchased['speed_perm']?2:1;
  const effectiveRate=(baseRate+upgradeRate)*(activeBoost?.mult||1)*permMult;
  // Ref so mining interval always reads latest rate without restarting
  const effectiveRateRef=useRef(effectiveRate);
  useEffect(()=>{effectiveRateRef.current=effectiveRate;},[effectiveRate]);



  // Mining engine — uses ref so claiming rewards never restarts the interval
  useEffect(()=>{
    if(!mining)return;
    mineR.current=setInterval(()=>{
      const earn=effectiveRateRef.current/10;
      setBalance(b=>b+earn); setSessE(s=>s+earn); setTotal(t=>t+earn);
      if(Math.random()<0.016){
        const bonus=effectiveRateRef.current*12;
        setBalance(b=>b+bonus); setSessE(s=>s+bonus);
        setBlocks(b=>b+1);
        addParticle({x:window.innerWidth*.4+Math.random()*window.innerWidth*.2,y:window.innerHeight*.35,label:`+${fmt(bonus)}`});
      }
    },100);
    sesR.current=setInterval(()=>setSessT(t=>t+1),1000);
    return()=>{clearInterval(mineR.current);clearInterval(sesR.current);};
  },[mining]); // only restarts when mining toggle changes, NOT on every rate/balance update

  // Balance tick animation
  useEffect(()=>{
    if(balance!==prevBal.current&&balance>0){setTick(true);const t=setTimeout(()=>setTick(false),110);prevBal.current=balance;return()=>clearTimeout(t);}
  },[balance]);

  // Hash animation
  useEffect(()=>{
    if(!mining)return;
    const t=setInterval(()=>setHash({a:genHash(),b:genHash().slice(0,16),c:genHash().slice(0,16)}),115);
    return()=>clearInterval(t);
  },[mining]);

  // Sparkline history
  useEffect(()=>{
    const t=setInterval(()=>{setRateH(h=>[...h.slice(-20),effectiveRate]);setBalH(h=>[...h.slice(-20),balance]);setNetHash(n=>Math.max(100,n+(Math.random()-.5)*13));},2000);
    return()=>clearInterval(t);
  },[effectiveRate,balance]);

  // Activity log
  useEffect(()=>{
    if(mining&&!prevMining.current)addLog('pos',`▶ STARTED — ${effectiveRate.toFixed(3)} FRG/s`);
    else if(!mining&&prevMining.current&&sessE>0)addLog('neg',`■ STOPPED — earned ${fmt(sessE)}`);
    prevMining.current=mining;
  },[mining]);
  useEffect(()=>{if(blocks>prevBlocks.current){addLog('blk',`⬡ BLOCK — +${fmt(effectiveRate*12)} FRG`);prevBlocks.current=blocks;}},[blocks]);

  // Boost countdown
  useEffect(()=>{
    if(!activeBoost)return;
    boostR.current=setInterval(()=>setAB(b=>{ if(!b||b.rem<=1){clearInterval(boostR.current);return null;} return{...b,rem:b.rem-1};}),1000);
    return()=>clearInterval(boostR.current);
  },[activeBoost?.label]);

  // Clock tick for cooldown countdowns
  useEffect(()=>{
    const t=setInterval(()=>{
      const n=Date.now();
      setNow(n);
      // Restore free charge when cooldown expires
      if(surgeUsedAt&&n-surgeUsedAt>=4*3600000) setBoostCh(1);
      if(turboUsedAt&&n-turboUsedAt>=6*3600000) setTurboCh(1);
    },1000);
    return()=>clearInterval(t);
  },[surgeUsedAt,turboUsedAt]);

  // Helper: format ms remaining as "Xh Xm Xs"
  const fmtCd=(ms)=>{ const s=Math.ceil(ms/1000),h=~~(s/3600),m=~~((s%3600)/60),ss=s%60; return h?`${h}h ${m}m`:m?`${m}m ${ss}s`:`${ss}s`; };
  const surgeReady=boostCh>0||(surgeUsedAt&&now-surgeUsedAt>=4*3600000);
  const turboReady=turboCh>0||(turboUsedAt&&now-turboUsedAt>=6*3600000);
  const surgeCd=surgeUsedAt&&!surgeReady?fmtCd(4*3600000-(now-surgeUsedAt)):null;
  const turboCd=turboUsedAt&&!turboReady?fmtCd(6*3600000-(now-turboUsedAt)):null;

  // Refresh mining state when switching to mine tab
  useEffect(()=>{
    if(tab==='mine'&&apiLoaded){
      api.mining.getState().then(s=>{
        setBalance(s.balance);
        setTotal(s.totalMined);
        const rawUpg2=s.upgrades||{};
        const normUpg2={};
        Object.entries(rawUpg2).forEach(([k,v])=>{normUpg2[Number(k)]=v;normUpg2[String(k)]=v;});
        setUpgrades(normUpg2);
        if(s.offlineEarnings>0){
          showToast('🤖','Auto-Mine Earnings',`+${fmt(s.offlineEarnings)} FRG offline`);
        }
      }).catch(()=>{});
    }
  },[tab,apiLoaded]);

  // Load leaderboard when profile tab opens
  useEffect(()=>{
    if(tab==='profile'||tab==='refer'){
      api.profile.getLeaderboard(50).then(data=>setLbData(data)).catch(()=>{});
    }
    if(tab==='refer'){
      // Sync real referral count and claimed tiers from backend
      api.referrals.getTiers().then(tiers=>{
        const claimed=new Set(tiers.filter(t=>t.claimed).map(t=>t.refs));
        setClaimedTiers(claimed);
      }).catch(()=>{});
      api.referrals.getInfo().then(info=>{
        setSimRefs(info.referralCount);
      }).catch(()=>{});
    }
    if(tab==='store'){
      // Sync purchased items from backend
      api.store.getPurchased().then(data=>{
        // Replace with backend truth — expirables disappear after expiry
        const map={};
        (data.purchased||[]).forEach(id=>{map[id]=true;});
        setPurch(map);
      }).catch(()=>{});
    }
  },[tab]);

  const toggle=async()=>{
    if(!mining){
      setMining(true);setSessT(0);setSessE(0);
      try{ await api.mining.start(); }catch(e){ console.error('Start error:',e); }
    } else {
      setMining(false);
      try{
        const res=await api.mining.stop();
        if(res.earned>0){
          setBalance(res.newBalance);
          setTotal(res.totalMined);
          if(res.blockBonus>0) addLog('blk',`⬡ BLOCK — +${fmt(res.blockBonus)} FRG`);
        }
      }catch(e){ console.error('Stop error:',e); }
    }
  };

  const simulateRef=async()=>{
    const newCount=simRefs+1; setSimRefs(newCount);
    showToast('👤',`+1 Referral!`,`You now have ${newCount} referrals`);
    const newTier=REF_TIERS.find(t=>t.refs===newCount&&!claimedTiers.has(t.refs));
    if(newTier) setTimeout(()=>setRewardPopup(newTier),600);
    // Refresh from backend
    try{
      const info=await api.referrals.getInfo();
      setSimRefs(info.referralCount);
    }catch(e){}
  };

  const claimReward=async()=>{
    if(!rewardPopup) return;
    const tier = rewardPopup;
    setClaimedTiers(s=>{const n=new Set(s);n.add(tier.refs);return n;});
    try{
      const res=await api.referrals.claimTier(tier.refs);
      if(res.newBalance) setBalance(res.newBalance);
    }catch(e){ console.error('Claim tier error:',e); }
    // Activate the actual reward
    if(tier.rewardType==='automine'||tier.rewardType==='lifetime'){
      // Grant free auto-mine — mark in purchased so hasAutoMine becomes true
      setPurch(p=>({...p,[`reward_auto_${tier.refs}`]:true}));
    }
    if(tier.rewardType==='speed'){
      // Activate boost immediately — 3× for 24h (86400s but demo uses 120s)
      const mult=tier.reward.startsWith('5×')?5:3;
      const dur=tier.reward.includes('7 Days')?120:60;
      setAB({mult,rem:dur,label:tier.reward});
      setBoostCh(c=>c+3); // extra charges too
    }
    if(tier.rewardType==='permanent'){
      // Give permanent 2x — sets purchased.speed_perm which is read by permMult
      setPurch(p=>({...p,speed_perm:true}));
    }
    // FRG bonus from subReward
    const octMatch = tier.subReward.replace(/,/g,'').match(/\+?(\d+)\s*FRG/);
    if(octMatch){
      const octBonus=parseInt(octMatch[1]);
      setBalance(b=>b+octBonus);
      addParticle({x:window.innerWidth*.5,y:window.innerHeight*.38,label:`+${fmt(octBonus)} FRG`});
    }
    showToast(tier.icon,`${tier.reward} ACTIVATED!`,tier.subReward);
    setRewardPopup(null);
  };

  // Mission progress
  const getMProg=(key)=>{ if(key==='total')return totalMined; if(key==='blocks')return blocks; if(key==='time_mins')return Math.floor(sessT/60); if(key==='rate')return effectiveRate; if(key==='refs')return simRefs; return 0; };
  const totalClaimable=MISSIONS.reduce((acc,m)=>{const prog=getMProg(m.key);const claimed=new Set(claimedCPs[m.id]||[]);return acc+m.checkpoints.filter((cp,i)=>prog>=cp.at&&!claimed.has(i)).length;},0);

  const claimCP=async(mId,cpIdx,reward)=>{
    setCC(prev=>{const s=new Set(prev[mId]||[]);s.add(cpIdx);return{...prev,[mId]:s};});
    setBalance(b=>b+reward); setMP(p=>p+reward);
    addParticle({x:window.innerWidth*.5,y:window.innerHeight*.4,label:`+${fmt(reward)}`});
    showToast('✅',`+${fmt(reward)} FRG`,'Checkpoint claimed!');
    try{
      const res=await api.missions.claimCheckpoint(mId,cpIdx);
      if(res.newBalance) setBalance(res.newBalance);
    }catch(e){ console.error('Mission claim error:',e); }
  };

  // Milestone
  const mIdx=MILESTONES.findIndex(m=>m>balance),prevM=mIdx>0?MILESTONES[mIdx-1]:0,curM=MILESTONES[mIdx]||MILESTONES[MILESTONES.length-1];
  const milePct=Math.min(100,((balance-prevM)/(curM-prevM))*100);

  const nextTier=REF_TIERS.find(t=>simRefs<t.refs);
  const prevTierRefs=nextTier?(REF_TIERS[REF_TIERS.indexOf(nextTier)-1]?.refs||0):0;
  const progressPct=nextTier?Math.min(100,((simRefs-prevTierRefs)/(nextTier.refs-prevTierRefs))*100):100;

  const logColors={pos:'#5ec98a',neg:'#e05555',info:'#e8b84b',blk:'#c07cf0'};

  const hasAutoMine=purchased['auto_7d']||purchased['auto_30d']||purchased['auto_lifetime']||Object.keys(purchased).some(k=>k.startsWith('reward_auto_'));
  const hasPermBoost=purchased['speed_perm'];
  const activeItemIds=Object.keys(purchased);
  const streak=4;

  return (
    <>

      <div className="bg-glow"/>
      {particles.map(p=><div key={p.id} className="ptcl" style={{left:p.x,top:p.y}}>{p.label}</div>)}
      {toast&&<div className="toast"><span className="t-icon">{toast.icon}</span><div className="t-txt"><strong>{toast.title}</strong>{toast.sub}</div></div>}
      {showLegacy&&<LegacyModal onClose={()=>{setLegacy(false);localStorage.setItem('forge_legacy_seen','1');}} onMine={()=>{setLegacy(false);localStorage.setItem('forge_legacy_seen','1');if(!mining)toggle();}}/>}
      {rewardPopup&&<RewardPopup tier={rewardPopup} onClose={claimReward}/>}
      {notifOpen&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setNotifOpen(false)}} style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,.55)',display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
          <div style={{background:'var(--bg)',borderRadius:'18px 18px 0 0',maxHeight:'75vh',display:'flex',flexDirection:'column',overflow:'hidden'}}>
            {/* Header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px 12px',borderBottom:'1px solid var(--br)',flexShrink:0}}>
              <span style={{fontFamily:'var(--mono)',fontSize:11,letterSpacing:'.1em',color:'var(--mt)'}}>NOTIFICATIONS</span>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                {unreadCount>0&&(
                  <span onClick={async()=>{await api.notifications?.markAllRead();setNotifs(n=>n.map(x=>({...x,read:true})));}} style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--gold)',cursor:'pointer',letterSpacing:'.05em'}}>MARK ALL READ</span>
                )}
                <span onClick={()=>setNotifOpen(false)} style={{fontSize:18,color:'var(--mt)',cursor:'pointer',lineHeight:1}}>✕</span>
              </div>
            </div>
            {/* List */}
            <div style={{overflowY:'auto',flex:1}}>
              {notifs.length===0?(
                <div style={{padding:'40px 18px',textAlign:'center',color:'var(--mt)',fontFamily:'var(--mono)',fontSize:11}}>
                  <div style={{fontSize:28,marginBottom:10}}>🔔</div>
                  NO NOTIFICATIONS YET
                </div>
              ):notifs.map(n=>(
                <div key={n.id} onClick={async()=>{if(!n.read){await api.notifications?.markRead(n.id);setNotifs(ns=>ns.map(x=>x.id===n.id?{...x,read:true}:x));}}} style={{display:'flex',gap:12,padding:'13px 18px',borderBottom:'1px solid var(--br)',cursor:n.read?'default':'pointer',background:n.read?'transparent':'rgba(232,184,75,.04)',transition:'background .2s'}}>
                  <div style={{fontSize:22,flexShrink:0,lineHeight:1.2}}>{n.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:3}}>
                      <span style={{fontFamily:'var(--mono)',fontSize:11,fontWeight:700,color:n.read?'var(--mt)':'var(--fg)'}}>{n.title}</span>
                      {!n.read&&<div style={{width:6,height:6,borderRadius:'50%',background:'var(--gold)',flexShrink:0}}/>}
                    </div>
                    <div style={{fontSize:12,color:'var(--mt)',lineHeight:1.5}}>{n.body}</div>
                    <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--mt)',marginTop:5,opacity:.6}}>{new Date(n.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {pendingPurchase&&<PurchaseModal item={pendingPurchase} onConfirm={confirmPurchase} onClose={()=>setPendingPurchase(null)}/>}

      <div className="app">
        
        {tab!=='mine'&&(
          <div className="topbar">
            <div className="tb-balance-center">
              <div className="tb-bal-amt">{fmt(balance)}</div>
              <div className="tb-bal-unit">FRG</div>
            </div>
          </div>
        )}

        <div className="scroll-area">

          
          {tab==='mine'&&(
            <div className="page" style={{position:'relative'}}>
              {/* ── Notification icon ── */}
              <div style={{position:'absolute',top:12,right:15,zIndex:5}}>
                <div onClick={()=>setNotifOpen(true)} style={{width:32,height:32,borderRadius:'50%',background:'var(--sf2)',border:'1px solid var(--br)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative'}}>
                  <span style={{fontSize:14}}>🔔</span>
                  {unreadCount>0&&<div style={{position:'absolute',top:-3,right:-3,width:14,height:14,borderRadius:'50%',background:'var(--red)',border:'2px solid var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--mono)',fontSize:7,fontWeight:700,color:'#fff'}}>{unreadCount}</div>}
                </div>
              </div>
              <div className="balance-block">
                <div className="bal-eye">FRG BALANCE</div>
                <div className={`bal-amount${tick?' tick':''}`}>{fmt(balance)}</div>
              </div>

              {(hasAutoMine||activeBoost||purchased['speed_perm'])&&(
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:10,flexWrap:'wrap'}}>
                  {hasAutoMine&&<div className="status-pill green"><div className="status-pip"/><span>Auto-Mine on</span></div>}
                  {activeBoost&&<div className="status-pill gold"><div className="status-pip gold"/><span>{activeBoost.mult}× {activeBoost.label} · {activeBoost.rem}s</span></div>}
                  {purchased['speed_perm']&&<div className="status-pill purple"><div className="status-pip purple"/><span>2× Core active</span></div>}
                </div>
              )}
              <div className="rate-strip">
                <div className="rs-item"><div className="rs-val gold">{fmt(totalMined)}</div><div className="rs-lbl">TOTAL MINED</div></div>
                <div className="rs-div"/>
                {mining?<div className="rate-live"><div className="rpd"/>+{effectiveRate.toFixed(4)}/SEC{activeBoost&&<span style={{color:'var(--gold)',marginLeft:6}}>⚡{activeBoost.rem}s</span>}</div>:<div className="rs-item"><div className="rs-val muted">IDLE</div><div className="rs-lbl">STATUS</div></div>}
                <div className="rs-div"/>
                <div className="rs-item"><div className="rs-val amber">{blocks}</div><div className="rs-lbl">BLOCKS</div></div>
              </div>
              <div className="mile-row">
                <div className="mile-lbl">MILESTONE</div>
                <div className="mile-track"><div className="mile-fill" style={{width:`${milePct}%`}}/></div>
                <div className="mile-lbl">{fmt(curM)}</div>
              </div>
              {milePct>75&&<div style={{fontFamily:'var(--mono)',fontSize:8,color:'var(--gold)',textAlign:'center',marginTop:-6,marginBottom:8,animation:'gblink .9s ease infinite alternate'}}>🔥 Almost there — {fmt(curM-balance)} FRG to next milestone!</div>}
              <button className={`mine-btn${mining?' stop':' start'}`} onClick={toggle}>{mining?'■  STOP MINING':'▶  INITIALIZE MINING'}</button>
              <div className="boost-row">
                {/* ── 3× SURGE ── */}
                <div className={`boost-card${activeBoost?.label==='3× SURGE'?' active':''}`}
                  onClick={async()=>{
                    if(!mining||!!activeBoost)return;
                    if(surgeCd)return;
                    if(boostCh>0){
                      setAB({mult:3,rem:60,label:'3× SURGE'});
                      setBoostCh(0);
                      setSurgeUsedAt(Date.now());
                      showToast('⚡','3× SURGE Active','60 seconds');
                    }
                  }}>
                  <div className={`boost-card-badge${surgeCd?' paid':boostCh>0?'':' paid'}`}>
                    {activeBoost?.label==='3× SURGE'?`${activeBoost.rem}s`:surgeCd?surgeCd:boostCh>0?'FREE':'⭐ 20'}
                  </div>
                  <div className="boost-card-name-row">
                    <span className="boost-card-icon">⚡</span>
                    <span className="boost-card-name">3× SURGE</span>
                  </div>
                  <div className="boost-card-sub" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:4}}>
                    <span>{activeBoost?.label==='3× SURGE'?`${activeBoost.rem}s left`:surgeCd?`Free in ${surgeCd}`:boostCh>0?'Free · 4h reset':'⭐ 20 / use'}</span>
                    {!boostCh&&!activeBoost&&(
                      <button onClick={e=>{e.stopPropagation();window.Telegram?.WebApp?.openInvoice?.('surge_20stars')||showToast('⭐','Opening Telegram Stars','20 Stars for 1 extra SURGE');}} style={{padding:'3px 8px',borderRadius:6,background:'linear-gradient(135deg,rgba(232,184,75,.2),rgba(232,184,75,.1))',border:'1px solid rgba(232,184,75,.4)',color:'var(--gold)',fontFamily:'var(--mono)',fontSize:7.5,fontWeight:700,cursor:'pointer',flexShrink:0,letterSpacing:'.04em'}}>⭐ 20</button>
                    )}
                  </div>
                </div>
                {/* ── 5× SURGE ── */}
                <div className={`boost-card${activeBoost?.label==='5× SURGE'?' active':''}`}
                  onClick={async()=>{
                    if(!mining||!!activeBoost)return;
                    if(turboCd)return;
                    if(turboCh>0){
                      setAB({mult:5,rem:60,label:'5× SURGE'});
                      setTurboCh(0);
                      setTurboUsedAt(Date.now());
                      showToast('🔥','5× SURGE Active','60 seconds');
                    }
                  }}>
                  <div className={`boost-card-badge${turboCd?' paid':turboCh>0?'':' paid'}`}>
                    {activeBoost?.label==='5× SURGE'?`${activeBoost.rem}s`:turboCd?turboCd:turboCh>0?'FREE':'⭐ 30'}
                  </div>
                  <div className="boost-card-name-row">
                    <span className="boost-card-icon">🔥</span>
                    <span className="boost-card-name">5× SURGE</span>
                  </div>
                  <div className="boost-card-sub" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:4}}>
                    <span>{activeBoost?.label==='5× SURGE'?`${activeBoost.rem}s left`:turboCd?`Free in ${turboCd}`:turboCh>0?'Free · 6h reset':'⭐ 30 / use'}</span>
                    {!turboCh&&!activeBoost&&(
                      <button onClick={e=>{e.stopPropagation();window.Telegram?.WebApp?.openInvoice?.('turbo_30stars')||showToast('⭐','Opening Telegram Stars','30 Stars for 1 extra 5× SURGE');}} style={{padding:'3px 8px',borderRadius:6,background:'linear-gradient(135deg,rgba(232,184,75,.2),rgba(232,184,75,.1))',border:'1px solid rgba(232,184,75,.4)',color:'var(--gold)',fontFamily:'var(--mono)',fontSize:7.5,fontWeight:700,cursor:'pointer',flexShrink:0,letterSpacing:'.04em'}}>⭐ 30</button>
                    )}
                  </div>
                </div>
              </div>
              {/* ── Refer a Friend card — high converting ── */}
              <div className="mine-refer-card" onClick={()=>setTab('refer')}>
                <div className="mrc-left">
                  <div className="mrc-icon">👥</div>
                  <div>
                    <div className="mrc-title">Invite Friends, Earn FRG</div>
                    <div className="mrc-sub"><strong style={{color:'var(--green)'}}>+5,000 FRG</strong> per friend · <strong style={{color:'var(--green)'}}>10%</strong> of their earnings forever</div>
                    {simRefs>0&&<div className="mrc-count">{simRefs} friend{simRefs!==1?'s':''} mining for you now</div>}
                  </div>
                </div>
                <div className="mrc-right">
                  <div className="mrc-cta">Invite →</div>
                </div>
              </div>

              {!hasAutoMine&&(
                <div className="offline-mini" onClick={()=>setTab('store')}>
                  <span className="offline-mini-icon">💤</span>
                  <div className="offline-mini-body">
                    <div className="offline-mini-title">Mine While Offline</div>
                    <div className="offline-mini-desc">Auto-Mine from 3 TON — earn while you sleep</div>
                  </div>
                  <div className="offline-mini-plans">
                    {['7D','30D','∞'].map((d,i)=>(
                      <div key={i} className="offline-mini-tag">{d}</div>
                    ))}
                  </div>
                  <div className="offline-mini-arr">›</div>
                </div>
              )}
              <div className="hterminal">
                <div className="ht-top">
                  <div className="ht-dots"><div className="hd d1"/><div className="hd d2"/><div className="hd d3"/></div>
                  <div className="ht-title">FORGE HASH PROCESSOR v1.0</div>
                  <div className="ht-st"><div className="tb-dot" style={{width:5,height:5}}/>{mining?'RUNNING':'IDLE'}</div>
                </div>
                <div className="ht-body">
                  <div className="ht-row"><span className="ht-k">attempt</span><span className={`ht-v${mining?' live':''}`}>{mining?hash.a:'0'.repeat(64)}</span></div>
                  <div className="ht-row"><span className="ht-k">target</span><span className="ht-v">0000{hash.b}</span></div>
                  <div className="ht-row"><span className="ht-k">nonce</span><span className={`ht-v${mining?' live':''}`}>{mining?hash.c:'0'.repeat(16)}</span></div>
                  <div className="ht-row"><span className="ht-k">H/s</span><span className="ht-v" style={{color:'var(--green)',opacity:1}}>{(effectiveRate*1000).toFixed(0)}</span></div>
                </div>
                <div className="ht-divider"/>
                <div className="ht-metrics">
                  <div className="ht-mc"><div className="ht-mc-lbl">BLOCK HASH</div><div className="ht-mc-val">0x{hash.a.slice(0,8)}</div></div>
                  <div className="ht-mc"><div className="ht-mc-lbl">DIFFICULTY</div><div className="ht-mc-val">{hash.b.slice(0,10).toUpperCase()}</div></div>
                  <div className="ht-mc"><div className="ht-mc-lbl">NODE ID</div><div className="ht-mc-val" style={{color:'var(--blue)'}}>FRG-A7F3C1</div></div>
                  <div className="ht-mc"><div className="ht-mc-lbl">NET HASH</div><div className="ht-mc-val" style={{color:'var(--purple)'}}>{netHash.toFixed(1)} TH/s</div></div>
                </div>
              </div>
              <div className="metrics-row">
                <div className="mc"><div className="mc-lbl">RATE</div><div className="mc-val gold">{effectiveRate.toFixed(2)}</div><div className="mc-sub">/sec</div></div>
                <div className="mc"><div className="mc-lbl">SESSION</div><div className="mc-val green">{fmt(sessE)}</div><div className="mc-sub">{fmtTime(sessT)}</div></div>
                <div className="mc"><div className="mc-lbl">BLOCKS</div><div className="mc-val amber">{blocks}</div><div className="mc-sub">found</div></div>
                <div className="mc"><div className="mc-lbl">TOTAL</div><div className="mc-val blue">{fmt(totalMined)}</div><div className="mc-sub">mined</div></div>
              </div>

              <div className="sc-mine-card" onClick={()=>{setTab('refer');setTimeout(()=>circleRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),120);}}>
                <div className="sc-mine-top">
                  <div className="sc-mine-icon">🛡️</div>
                  <div className="sc-mine-body">
                    <div className="sc-mine-title">SECURITY CIRCLE</div>
                    <div className="sc-mine-sub">Verify trusted contacts · boost your FRG allocation at listing</div>
                  </div>
                  <div className="sc-mine-score">
                    <div className="sc-mine-score-val">{Math.round((MOCK_CIRCLE.filter(m=>m.trusted).length/5)*100)}</div>
                    <div className="sc-mine-score-lbl">TRUST</div>
                  </div>
                </div>
                <div className="sc-mine-slots">
                  {Array.from({length:5},(_,i)=>{
                    const m=MOCK_CIRCLE[i];
                    return m?(
                      <div key={i} className="sc-mine-slot filled" style={{borderColor:m.trusted?`${m.color}55`:'rgba(232,184,75,.3)',background:`${m.color}14`}}>
                        {m.trusted&&<div className="sc-mine-dot" style={{background:'var(--green)'}}/>}
                        <span style={{fontFamily:'var(--mono)',fontSize:7,color:m.trusted?'var(--tx2)':'var(--gold)'}}>{m.avatar}</span>
                      </div>
                    ):(
                      <div key={i} className="sc-mine-slot empty"><span style={{fontSize:9,color:'var(--mt)'}}>＋</span></div>
                    );
                  })}
                  <div style={{flex:1,fontFamily:'var(--mono)',fontSize:8,color:'var(--mt)',alignSelf:'center',paddingLeft:8}}>
                    {MOCK_CIRCLE.filter(m=>m.trusted).length}/5 verified · tap to manage
                  </div>
                  <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--blue)'}}>›</div>
                </div>
                <div className="sc-mine-badge">🔔 2 pending requests</div>
              </div>
              <div className="div"><div className="div-line"/><div className="div-lbl">Upgrades</div><div className="div-line"/></div>
              {UPGRADES.map(u=>{
                const lv=upgrades[u.id]||0;
                const [rr,gg,bb]=hexParts(u.color);
                return(
                  <div key={u.id} className="upg-row" onClick={()=>setTab('store')}>
                    <div className="upg-icon" style={{color:u.color,borderColor:`${u.color}35`,background:`rgba(${rr},${gg},${bb},.08)`}}>{u.icon}</div>
                    <div style={{flex:1}}>
                      <div className="upg-name">{u.name}</div>
                      <div className="upg-pips">{Array.from({length:u.maxLevel},(_,i)=><div key={i} className={`pip${i<lv?' on':''}`} style={i<lv?{background:u.color,color:u.color}:{}}/>)}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div className="upg-cost" style={{color:lv>0?u.color:'var(--mt)'}}>{lv>0?`Lv.${lv}/${u.maxLevel}`:'Tap to unlock'}</div>
                      <div className="upg-bonus">+{u.rateBonus}/s</div>
                    </div>
                  </div>
                );
              })}
              <div onClick={()=>setTab('store')} style={{textAlign:'center',padding:'6px',marginBottom:4,fontFamily:'var(--mono)',fontSize:8.5,color:'var(--gold)',letterSpacing:'.1em',cursor:'pointer'}}>⚡ VIEW ALL UPGRADES →</div>
              <div className="div"><div className="div-line"/><div className="div-lbl">Peer Network</div><div className="div-line"/></div>
              <div className="nsec">
                <div className="nhdr"><div className="ntitle">◈ NODE MESH</div><div className="nlive"><div className="tb-dot" style={{width:5,height:5}}/>{mining?'SYNCING':'STANDBY'}</div></div>
                <div className="ncwrap"><NodeCanvas active={mining}/></div>
              </div>
              <div className="lpanel">
                <div className="lphdr"><span>Activity Log</span><span style={{color:'var(--green)'}}>● LIVE</span></div>
                <div className="lpentr">{log.slice(0,7).map((e,i)=><div key={i} className="le"><span className="lts">{e.t}</span><span style={{color:logColors[e.type]||'var(--tx2)'}}>{e.msg}</span></div>)}</div>
              </div>
            </div>
          )}

          
          {tab==='store'&&(
            <div className="page">

              {/* ── Category tabs ── */}
              <div className="store-tabs">
                {[['all','All'],['automine','🤖 Auto-Mine'],['upgrades','⚡ Upgrades'],['boosts','🚀 Boosts'],['referral','👥 Referral']].map(([id,lbl])=>(
                  <button key={id} className={`store-tab-btn${storeTab===id?' active':''}`} onClick={()=>setStoreTab(id)}>{lbl}</button>
                ))}
              </div>

              {/* ══════════════ AUTO-MINE ══════════════ */}
              {(storeTab==='all'||storeTab==='automine')&&<>
                <div className="div"><div className="div-line"/><div className="div-lbl">Auto-Mine</div><div className="div-line"/></div>

                {!purchased['auto_lifetime']?(
                  <>
                  {/* ── Lifetime — clean confident card ── */}
                  <div className="automine-row" style={{background:'rgba(192,124,240,.06)',border:'1px solid rgba(192,124,240,.2)',borderRadius:16,marginBottom:14,padding:'16px 15px',cursor:'pointer'}} onClick={()=>handleBuy({id:'auto_lifetime',name:'Lifetime Auto-Mine',icon:'♾️',priceTON:30,shortDesc:'Mine FRG offline forever',earningNote:'Pays for itself in 3.5 days. Then free forever.',badge:'FOREVER'})}>
                    <span className="automine-row-icon" style={{fontSize:26}}>♾️</span>
                    <div className="automine-row-body">
                      <div className="automine-row-name" style={{fontSize:15}}>Lifetime Auto-Mine <span style={{fontFamily:'var(--mono)',fontSize:7,padding:'2px 7px',borderRadius:5,background:'rgba(192,124,240,.15)',color:'var(--purple)',marginLeft:6,verticalAlign:'middle'}}>FOREVER</span></div>
                      <div className="automine-row-desc" style={{marginTop:3}}>Mine 24/7 forever — even with the app closed</div>
                      <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                        {['Offline mining','2× rate bonus','Genesis badge'].map((f,i)=>(
                          <div key={i} style={{fontFamily:'var(--mono)',fontSize:7,color:'rgba(192,124,240,.8)',background:'rgba(192,124,240,.08)',border:'1px solid rgba(192,124,240,.15)',borderRadius:5,padding:'2px 7px'}}>{f}</div>
                        ))}
                      </div>
                    </div>
                    <div className="automine-row-right">
                      <div className="automine-row-price">30</div>
                      <div className="automine-row-unit">TON</div>
                      <button className="automine-row-btn" onClick={e=>{e.stopPropagation();handleBuy({id:'auto_lifetime',name:'Lifetime Auto-Mine',icon:'♾️',priceTON:30,shortDesc:'Mine FRG offline forever',earningNote:'Pays for itself in 3.5 days. Then free forever.',badge:'FOREVER'});}} style={{background:'rgba(192,124,240,.15)',color:'var(--purple)',border:'1px solid rgba(192,124,240,.3)'}}>BUY</button>
                    </div>
                  </div>
                  <div className="automine-list">
                    <div className="automine-list-hdr">Timed Plans — cheaper to start</div>
                    {[
                      {id:"auto_7d",  icon:"🤖", name:"7 Day Auto-Mine",  desc:"Full rate offline for 7 days", ton:3,  tag:null,      saving:null},
                      {id:"auto_30d", icon:"🤖", name:"30 Day Auto-Mine", desc:"Best monthly value — save 33%", ton:10, tag:"POPULAR", saving:"vs 10 TON/mo x3 = Lifetime wins"},
                    ].map(item=>{
                      const owned=!!purchased[item.id]||!!purchased['auto_lifetime'];
                      return(
                        <div key={item.id} className={`automine-row${owned?' owned':''}`} onClick={()=>!owned&&handleBuy({id:item.id,name:item.name,icon:item.icon,priceTON:item.ton,shortDesc:item.desc,earningNote:`Earn offline. Upgrade to Lifetime for permanent mining.`,badge:item.name.toUpperCase()})}>
                          <span className="automine-row-icon">{item.icon}</span>
                          <div className="automine-row-body">
                            <div className="automine-row-name">{item.name}{item.tag&&<span style={{marginLeft:7,fontFamily:'var(--mono)',fontSize:7,padding:'2px 5px',borderRadius:4,background:'rgba(232,184,75,.12)',color:'var(--gold)'}}>{item.tag}</span>}</div>
                            <div className="automine-row-desc">{item.desc}</div>
                            {item.saving&&<div style={{fontFamily:'var(--mono)',fontSize:7,color:'var(--purple)',marginTop:3}}>💡 {item.saving}</div>}
                          </div>
                          <div className="automine-row-right">
                            <div className="automine-row-price">{item.ton}</div>
                            <div className="automine-row-unit">TON</div>
                            <button className="automine-row-btn" disabled={owned} style={{background:owned?'rgba(94,201,138,.1)':'rgba(232,184,75,.12)',color:owned?'var(--green)':'var(--gold)',border:owned?'1px solid rgba(94,201,138,.22)':'1px solid rgba(232,184,75,.28)'}}>{owned?'✓ ACTIVE':'BUY'}</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </>
                ):(
                  <div style={{background:'rgba(94,201,138,.07)',border:'1px solid rgba(94,201,138,.2)',borderRadius:14,padding:'13px 15px',marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:22}}>♾️</span>
                    <div><div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--green)',fontWeight:600}}>LIFETIME AUTO-MINE ACTIVE</div><div style={{fontFamily:'var(--mono)',fontSize:8,color:'var(--mt)',marginTop:2}}>Your node mines FRG 24/7 forever. You're in the top tier.</div></div>
                  </div>
                )}
              </>}

              {/* ══════════════ MINING UPGRADES ══════════════ */}
              {(storeTab==='all'||storeTab==='upgrades')&&<>
                <div className="div"><div className="div-line"/><div className="div-lbl">Mining Upgrades</div><div className="div-line"/></div>
                <div className="upg-2col">
                  {UPGRADES.map(u=>{
                    const lv=upgrades[u.id]||upgrades[String(u.id)]||0;
                    const maxed=lv>=u.maxLevel;
                    const cost=Math.round(u.baseCost*Math.pow(2.2,lv));
                    const can=balance>=cost&&!maxed;
                    const [rr,gg,bb]=hexParts(u.color);
                    const newRate=(0.1+UPGRADES.reduce((a,x)=>{const xl=upgrades[x.id]||upgrades[String(x.id)]||0;return a+x.rateBonus*(x.id===u.id?xl+1:xl);},0))*(purchased['speed_perm']?2:1);
                    return(
                      <div key={u.id} className={`upg-card${can?' can':''}${maxed?' maxed':''}`}
                        onClick={()=>can&&(async()=>{
                          // Optimistic local update first — works even if backend is offline
                          setBalance(b=>b-cost);
                          setUpgrades(p=>{const n={...p};n[u.id]=lv+1;n[String(u.id)]=lv+1;return n;});
                          showToast(u.icon,u.name,lv===0?'Activated!':`Level ${lv+1}`);
                          addLog('info',`◈ ${u.name} → Lv.${lv+1}`);
                          // Sync to backend (silent fail if offline)
                          api.mining.buyUpgrade(u.id).then(res=>{
                            if(res?.newBalance) setBalance(res.newBalance);
                          }).catch(()=>{/* backend offline — local state already updated */});
                        })()}>
                        <div className="upg-card-top">
                          <div className="upg-card-icon" style={{color:u.color,borderColor:`${u.color}33`,background:`rgba(${rr},${gg},${bb},.1)`}}>{u.icon}</div>
                          {maxed
                            ? <div className="upg-card-badge" style={{background:`${u.color}22`,color:u.color}}>MAX</div>
                            : lv>0
                              ? <div className="upg-card-badge" style={{background:'rgba(255,255,255,.07)',color:'var(--tx2)'}}>Lv.{lv}/{u.maxLevel}</div>
                              : null
                          }
                        </div>
                        <div className="upg-card-name">{u.name}</div>
                        <div className="upg-card-desc">{u.desc}</div>
                        <div className="upg-card-pips">
                          {Array.from({length:u.maxLevel},(_,i)=>(
                            <div key={i} className="upg-card-pip" style={i<lv?{background:u.color,boxShadow:`0 0 4px ${u.color}66`}:{}}/>
                          ))}
                        </div>
                        <div className="upg-card-bottom">
                          <div>
                            {maxed
                              ? <div className="upg-card-cost" style={{color:u.color}}>Maxed</div>
                              : <div className="upg-card-cost" style={{color:can?'var(--gold)':'var(--red)'}}>{fmt(cost)} FRG</div>
                            }
                            <div className="upg-card-bonus">+{u.rateBonus}/s per level</div>
                          </div>
                          {can&&<div className="upg-card-rate">▲ {newRate.toFixed(2)}/s</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>}

              {/* ══════════════ SPEED + REFERRAL SECTIONS ══════════════ */}
              {(storeTab==='all'||storeTab==='referral'||storeTab==='boosts')&&
                STORE_SECTIONS.slice(1).map(sec=>{
                  const show=storeTab==='all'||(storeTab==='referral'&&sec.id==='referral')||(storeTab==='boosts'&&(sec.id==='speed'||sec.id==='chests'));
                  if(!show) return null;
                  const [sr,sg,sb]=[parseInt(sec.color.slice(1,3),16),parseInt(sec.color.slice(3,5),16),parseInt(sec.color.slice(5,7),16)];
                  return(
                    <div key={sec.id}>
                      <div className="div"><div className="div-line"/><div className="div-lbl">{sec.label}</div><div className="div-line"/></div>
                      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
                        {sec.items.map((item,idx)=>{
                          const owned=!!purchased[item.id];
                          const [r,g,b]=[parseInt(item.color.slice(1,3),16),parseInt(item.color.slice(3,5),16),parseInt(item.color.slice(5,7),16)];
                          const isFlagship=!!item.flagship;
                          return(
                            <div key={item.id}
                              style={{
                                background:isFlagship?`linear-gradient(135deg,rgba(${r},${g},${b},.12),rgba(${r},${g},${b},.05))`:'var(--sf)',
                                border:isFlagship?`1.5px solid rgba(${r},${g},${b},.35)`:'1px solid var(--br)',
                                borderRadius:14,padding:'13px 14px',cursor:owned?'default':'pointer',
                                opacity:owned?.55:1,transition:'all .18s',position:'relative',overflow:'hidden',
                              }}
                              onClick={()=>!owned&&handleBuy(item)}>
                              {/* top shimmer line for flagship */}
                              {isFlagship&&<div style={{position:'absolute',top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${item.color},transparent)`}}/>}
                              {/* tag badge */}
                              {item.tag&&<div style={{position:'absolute',top:10,right:10,padding:'2px 7px',borderRadius:5,background:`rgba(${r},${g},${b},.18)`,color:item.color,fontFamily:'var(--mono)',fontSize:7,fontWeight:700,letterSpacing:'.08em',border:`1px solid rgba(${r},${g},${b},.3)`}}>{item.tag}</div>}
                              <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                                <div style={{width:42,height:42,borderRadius:11,background:`rgba(${r},${g},${b},.12)`,border:`1px solid rgba(${r},${g},${b},.26)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{item.icon}</div>
                                <div style={{flex:1,paddingRight:item.tag?48:0}}>
                                  <div style={{fontSize:13.5,fontWeight:600,color:'var(--tx)',marginBottom:3}}>{item.name}</div>
                                  <div style={{display:'inline-block',padding:'2px 7px',borderRadius:5,background:`rgba(${r},${g},${b},.12)`,color:item.color,fontFamily:'var(--mono)',fontSize:7.5,fontWeight:600,marginBottom:5}}>{item.badge}</div>
                                  <div style={{fontFamily:'var(--mono)',fontSize:8,color:'var(--mt)',lineHeight:1.55,marginBottom:item.earningNote?6:0}}>{item.shortDesc}</div>
                                  {item.earningNote&&<div style={{display:'flex',alignItems:'center',gap:5,fontFamily:'var(--mono)',fontSize:7.5,color:'var(--green)',background:'rgba(94,201,138,.06)',border:'1px solid rgba(94,201,138,.13)',borderRadius:6,padding:'4px 8px'}}>◈ {item.earningNote}</div>}
                                </div>
                              </div>
                              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:11,paddingTop:10,borderTop:`1px solid rgba(${r},${g},${b},.12)`}}>
                                <div style={{display:'flex',alignItems:'baseline',gap:4}}>
                                  <span style={{fontFamily:'var(--disp)',fontSize:26,color:'var(--gold)',lineHeight:1}}>{item.priceTON}</span>
                                  <span style={{fontFamily:'var(--mono)',fontSize:9,color:'rgba(232,184,75,.45)'}}>TON</span>
                                </div>
                                <button
                                  disabled={owned}
                                  onClick={e=>{e.stopPropagation();!owned&&handleBuy(item);}}
                                  style={{
                                    padding:'9px 20px',borderRadius:9,fontFamily:'var(--mono)',fontSize:9.5,fontWeight:700,
                                    cursor:owned?'default':'pointer',letterSpacing:'.08em',transition:'all .14s',
                                    background:owned?'rgba(94,201,138,.1)':isFlagship?`linear-gradient(135deg,rgba(${r},${g},${b},.7),${item.color})`:`rgba(${r},${g},${b},.15)`,
                                    color:owned?'var(--green)':isFlagship?'#09090b':item.color,
                                    boxShadow:(!owned&&isFlagship)?`0 3px 14px rgba(${r},${g},${b},.25)`:'none',
                                    border:(!owned&&!isFlagship)?`1px solid rgba(${r},${g},${b},.28)`:'none',
                                  }}
                                >{owned?'✓ ACTIVE':isFlagship?`BUY NOW`:'BUY'}</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              }

              {/* ══════════════ TON TRUST ══════════════ */}
              <div className="ton-trust">
                <div className="tt-title">Why TON Payments?</div>
                {[
                  {icon:'💎',name:'Native TON Wallet',desc:'Connect your Telegram wallet. No third-party apps.'},
                  {icon:'⛓',name:'On-Chain Verification',desc:'Every purchase verifiable on TON blockchain forever.'},
                  {icon:'🔒',name:'Non-Custodial',desc:'You control your wallet. Forge never holds your TON.'},
                  {icon:'⚡',name:'~3 Second Settlement',desc:'Purchases activate instantly after confirmation.'},
                ].map((t,i)=>(
                  <div key={i} className="tt-item">
                    <div className="tt-icon">{t.icon}</div>
                    <div><div className="tt-name">{t.name}</div><div className="tt-desc">{t.desc}</div></div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {tab==='refer'&&(
            <div className="page">

              {/* ── Team sub-tabs ── */}
              <div className="team-tabs">
                <button className={`team-tab-btn${teamTab==='refer'?' active':''}`} onClick={()=>setTeamTab('refer')}>👥 Refer & Earn</button>
                <button className={`team-tab-btn${teamTab==='leaderboard'?' active':''}`} onClick={()=>setTeamTab('leaderboard')}>🏆 Leaderboard</button>
              </div>

              {/* ══════════ LEADERBOARD TAB ══════════ */}
              {teamTab==='leaderboard'&&(
                <>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                    <div>
                      <div style={{fontFamily:'var(--disp)',fontSize:26,letterSpacing:'.06em',color:'var(--tx)',lineHeight:1}}>TOP MINERS</div>
                      <div style={{fontFamily:'var(--mono)',fontSize:8,color:'var(--mt)',marginTop:3}}>Global FRG rankings · updated live</div>
                    </div>
                    {lbData?.yourRank&&<div style={{textAlign:'right'}}><div style={{fontFamily:'var(--disp)',fontSize:22,color:'var(--gold)'}}>#{lbData.yourRank}</div><div style={{fontFamily:'var(--mono)',fontSize:7,color:'var(--mt)'}}>YOUR RANK</div></div>}
                  </div>
                  <div className="lb-list">
                    {(lbData?.leaderboard||[
                      {name:'0xVault',    totalMined:9847291, badge:'SOVEREIGN', isYou:false},
                      {name:'DeepNode_7', totalMined:6234881, badge:'ELITE',     isYou:false},
                      {name:'Nakamura_X', totalMined:4102334, badge:'ELITE',     isYou:false},
                      {name:'GridMaster', totalMined:2987001, badge:'MINER',     isYou:false},
                      {name:'CryptoZen',  totalMined:1843201, badge:'MINER',     isYou:false},
                      {name:'YOU',        totalMined:balance,  badge:'MINER',     isYou:true},
                    ]).slice(0,100).map((l,i)=>(
                      <div key={i} className={`lb-row${l.isYou?' you':''}`}>
                        <div className={`lb-rank${i===0?' r1':i===1?' r2':i===2?' r3':''}`}>#{l.rank||i+1}</div>
                        <div className="lb-avt">{'⬡◈◉◎✦⬟'[i%6]||'◈'}</div>
                        <div className="lb-info"><div className="lb-name" style={l.isYou?{color:'var(--gold)'}:{}}>{l.name}</div><div className="lb-tag">{l.badge||'MINER'}</div></div>
                        <div className="lb-coins">{l.isYou?fmt(balance):fmt(l.totalMined)}</div>
                      </div>
                    ))}
                    {lbData?.yourRank&&!lbData.leaderboard?.some(l=>l.isYou)&&(
                      <div className="lb-row you">
                        <div className="lb-rank">#{lbData.yourRank}</div>
                        <div className="lb-avt">✦</div>
                        <div className="lb-info"><div className="lb-name" style={{color:'var(--gold)'}}>YOU</div><div className="lb-tag">MINER</div></div>
                        <div className="lb-coins">{fmt(balance)}</div>
                      </div>
                    )}
                  </div>
                  <div style={{textAlign:'center',padding:'10px 0',fontFamily:'var(--mono)',fontSize:7.5,color:'var(--mt)',letterSpacing:'.12em'}}>SHOWING TOP 100 · UPDATES EVERY 5 MIN</div>
                </>
              )}

              {/* ══════════ REFER & EARN TAB ══════════ */}
              {teamTab==='refer'&&(
                <>
                  {/* ── Hero: single high-converting card ── */}
                  <div className="ref-hero-card">
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                      <div>
                        <div style={{fontFamily:'var(--mono)',fontSize:7.5,letterSpacing:'.2em',color:'var(--mt)',marginBottom:5,textTransform:'uppercase'}}>Your invite link</div>
                        <div style={{fontFamily:'var(--disp)',fontSize:26,letterSpacing:'.05em',color:'var(--tx)',lineHeight:1}}>INVITE & EARN</div>
                      </div>
                      {simRefs>0&&<div style={{textAlign:'right'}}>
                        <div style={{fontFamily:'var(--disp)',fontSize:22,color:'var(--green)',lineHeight:1}}>{simRefs}</div>
                        <div style={{fontFamily:'var(--mono)',fontSize:7,color:'var(--mt)'}}>invited</div>
                      </div>}
                    </div>
                    <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--mt)',lineHeight:1.65,marginBottom:14}}>
                      Each friend earns you <strong style={{color:'var(--green)'}}>5,000 FRG instantly</strong> + <strong style={{color:'var(--green)'}}>10% of everything they mine — forever.</strong>
                    </div>
                    {/* Code box — tap entire area to copy */}
                    <div className="ref-hero-code" onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);showToast('📋','Link Copied!','Now share it with friends');}}>
                      <div className="ref-hero-code-val">FORGE-X7K9Q</div>
                      <div className={`ref-hero-copy${copied?' copied':''}`}>{copied?'✓ Copied':'Tap to Copy'}</div>
                    </div>
                    {/* One primary CTA */}
                    <button className="ref-main-cta" style={{marginTop:10}} onClick={()=>showToast('💬','Opening Telegram','Sharing your invite link')}>
                      <span style={{fontSize:16}}>💬</span>
                      <span style={{fontFamily:'var(--mono)',fontSize:10,fontWeight:700,letterSpacing:'.05em'}}>Share on Telegram</span>
                    </button>
                  </div>

                  {/* ── Your stats ── */}
                  <div className="ref-stats-row">
                    {[{v:simRefs,l:'Friends invited',c:'var(--gold)'},{v:fmt(simRefs*5000),l:'FRG earned',c:'var(--green)'},{v:'10%',l:'Passive forever',c:'var(--blue)'}].map((s,i)=>(
                      <div key={i} className="ref-stat-card">
                        <div className="ref-stat-val" style={{color:s.c}}>{s.v}</div>
                        <div className="ref-stat-lbl">{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* ── Next reward — urgency ── */}
                  {nextTier&&(
                    <div className="ref-next-reward">
                      <div className="ref-next-left">
                        <div className="ref-next-label">NEXT REWARD</div>
                        <div className="ref-next-reward-name">{nextTier.reward}</div>
                        <div className="ref-next-count">{nextTier.refs - simRefs} more friend{nextTier.refs-simRefs!==1?'s':''} needed</div>
                      </div>
                      <div className="ref-next-right">
                        <div className="ref-next-progress-track">
                          <div className="ref-next-progress-fill" style={{width:`${progressPct}%`}}/>
                        </div>
                        <div className="ref-next-fraction">{simRefs} / {nextTier.refs}</div>
                      </div>
                    </div>
                  )}

                  {/* Reward ladder */}
                  <div className="div"><div className="div-line"/><div className="div-lbl">Reward Ladder</div><div className="div-line"/></div>
                  <div className="ref-ladder">
                    {REF_TIERS.map((tier,i)=>{
                      const reached=simRefs>=tier.refs,claimed=claimedTiers.has(tier.refs);
                      const isNext=!reached&&REF_TIERS.findIndex(t=>simRefs<t.refs)===i;
                      const tierPct=reached?100:Math.min(100,(simRefs/tier.refs)*100);
                      const typeEmoji=tier.rewardType==='automine'?'🤖':tier.rewardType==='speed'?'⚡':tier.rewardType==='permanent'?'🔮':tier.rewardType==='lifetime'?'♾️':'🎁';
                      return(
                        <div key={i} className={`ref-tier${reached?'':isNext?' next-up':' locked'}`} style={{background:tier.bg,borderColor:tier.border}}>
                          {tier.elite&&<div className="elite-crown">⭐ ELITE</div>}
                          {claimed&&<div className="rt-claimed">✓ CLAIMED</div>}
                          <div className="ref-tier-top">
                            <div className="rt-icon">{tier.icon}</div>
                            <div className="rt-body"><div className="rt-name" style={{color:tier.color}}>{tier.label}</div><div className="rt-desc">{tier.desc}</div></div>
                            <div className="rt-refs" style={{color:tier.color}}>{tier.refs}</div>
                          </div>
                          <div className="rt-reward-box" style={{border:`1px solid ${tier.border}`}}>
                            <div className="rt-reward-icon">{typeEmoji}</div>
                            <div className="rt-reward-text" style={{color:tier.color}}>{tier.reward}</div>
                            <div className="rt-reward-badge" style={{background:`${tier.color}1a`,color:tier.color,border:`1px solid ${tier.border}`}}>FREE</div>
                          </div>
                          <div className="rt-subreward" style={{color:tier.color}}>{tier.subReward}</div>
                          {!reached&&<div className="rt-progress"><div className="rt-prog-fill" style={{width:`${tierPct}%`,background:`linear-gradient(90deg,${tier.color}66,${tier.color})`}}/></div>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Security Circle */}
                  <div ref={circleRef} className="div"><div className="div-line"/><div className="div-lbl">Security Circle</div><div className="div-line"/></div>
                  <SecurityCircle onShowToast={showToast}/>

                  {/* Network */}
                  <div className="div"><div className="div-line"/><div className="div-lbl">Your Network</div><div className="div-line"/></div>
                  <div className="friends-list">
                    {[
                      {name:'Forge_Alex',status:'Mining · 2.4 FRG/s',earn:'+10,240',avatar:'A',color:'#5ec98a'},
                      {name:'Node_Maria',status:'Mining · 1.1 FRG/s',earn:'+4,890',avatar:'M',color:'#5ba8e8'},
                      {name:'0xPriya',status:'Offline · Last 2h',earn:'+2,100',avatar:'P',color:'#c07cf0'},
                    ].map((f,i)=>(
                      <div key={i} className="fr-row">
                        <div className="fr-avt" style={{background:`${f.color}22`,borderColor:`${f.color}44`,color:f.color}}>{f.avatar}</div>
                        <div className="fr-body"><div className="fr-name">{f.name}</div><div className="fr-status">{f.status}</div></div>
                        <div className="fr-earn">{f.earn}</div>
                      </div>
                    ))}
                    <div className="fr-row" style={{cursor:'pointer'}} onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);showToast('📋','Code Copied!','Share and earn 5,000 FRG per friend');}}>
                      <div className="fr-avt" style={{border:'1px dashed var(--br2)',background:'transparent',fontSize:16,color:'var(--gold)'}}>＋</div>
                      <div className="fr-body"><div className="fr-name" style={{color:'var(--gold)'}}>+ Invite More</div><div className="fr-status">Earn 5,000 FRG per invite</div></div>
                      <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gold)'}}>›</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          
          {tab==='missions'&&(
            <div className="page">
              <div className="streak-banner">
                <div className="sb-top"><div className="sb-title">DAILY STREAK</div><div className="sb-fire">{streak}<em>days</em>🔥</div></div>
                <div className="streak-row">{DAYS.map((d,i)=>(
                  <div key={i} className="sd"><div className={`sd-circle${i<streak?' done':i===streak?' today':' off'}`}>{i<streak?'✓':i===streak?'⛏':d}</div><div className="sd-lbl">{d}</div></div>
                ))}</div>
                <div className="streak-reward"><div className="sr-left">Tomorrow's bonus</div><div className="sr-right">+2,500 FRG · Day {streak+1}</div></div>
              </div>
              <div className="mission-banner">
                <div className="mb-icon">⚔️</div>
                <div className="mb-body">
                  <div className="mb-title">UNLIMITED MISSIONS</div>
                  <div className="mb-sub">{totalClaimable>0?`${totalClaimable} checkpoint${totalClaimable>1?'s':''} ready!`:'Mine to unlock checkpoint rewards'}</div>
                </div>
                <div className="mb-pts">{fmt(missionPoints)}</div>
              </div>
              <div className="div"><div className="div-line"/><div className="div-lbl">Active Missions</div><div className="div-line"/></div>
              {MISSIONS.map(m=>{
                const progress=getMProg(m.key),claimedSet=new Set(claimedCPs[m.id]||[]);
                const maxCp=m.checkpoints[m.checkpoints.length-1],overallPct=Math.min(100,(progress/maxCp.at)*100);
                const [hR,hG,hB]=hexParts(m.color);
                const hasClaimable=m.checkpoints.some((cp,i)=>progress>=cp.at&&!claimedSet.has(i));
                return(
                  <div key={m.id} className="umcard" style={{borderColor:hasClaimable?'rgba(232,184,75,.22)':'var(--br)'}}>
                    <div className="umc-header">
                      <div className="umc-ico" style={{color:m.color,background:`rgba(${hR},${hG},${hB},.09)`,borderColor:`rgba(${hR},${hG},${hB},.24)`}}>{m.icon}</div>
                      <div className="umc-body"><div className="umc-name">{m.name}</div><div className="umc-desc">{m.checkpoints.length} checkpoints</div></div>
                      <div className="umc-total"><div className="umc-val" style={{color:m.color}}>{fmt(progress)}</div><div className="umc-lbl">{m.unit}</div></div>
                    </div>
                    <div className="umc-progwrap">
                      <div className="umc-overall-lbl"><span>Progress</span><span style={{color:m.color}}>{overallPct.toFixed(1)}%</span></div>
                      <div className="umc-overall-track"><div className="umc-overall-fill" style={{width:`${overallPct}%`,background:`linear-gradient(90deg,rgba(${hR},${hG},${hB},.4),${m.color})`}}/></div>
                    </div>
                    <div className="umc-checkpoints">
                      {m.checkpoints.map((cp,i)=>{
                        const isDone=claimedSet.has(i),isClaimable=!isDone&&progress>=cp.at;
                        return(
                          <div key={i} className="cp-row">
                            <div className={`cp-dot${isDone?' done':isClaimable?' claimable':' locked'}`}/>
                            <div className={`cp-label${isDone?' done':isClaimable?' claimable':' locked'}`}>{cp.l}</div>
                            <div className={`cp-reward${isDone?' done':isClaimable?' claimable':' locked'}`}>{fmt(cp.r)}</div>
                            {isClaimable&&<button className="cp-claim-btn" onClick={()=>claimCP(m.id,i,cp.r)}>CLAIM</button>}
                            {isDone&&<span style={{fontFamily:'var(--mono)',fontSize:8,color:'var(--green)',flexShrink:0}}>✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div className="div"><div className="div-line"/><div className="div-lbl">Achievements</div><div className="div-line"/></div>
              <div className="ach-grid">
                {[{icon:'🌟',name:'Genesis',desc:'Started mining',u:totalMined>0},{icon:'⛓',name:'Blockchain',desc:'3 blocks found',u:blocks>=3},{icon:'💎',name:'Millionaire',desc:'Mined 1M FRG',u:totalMined>=1000000},{icon:'👑',name:'Ref. King',desc:'10 referrals',u:simRefs>=10},{icon:'🐋',name:'Whale',desc:'Top 100 global',u:false},{icon:'🔥',name:'OG Miner',desc:'7-day streak',u:streak>=7}].map((a,i)=>(
                  <div key={i} className={`ach-card${a.u?' unlocked':' locked'}`}><div className="ach-icon">{a.icon}</div><div className="ach-name">{a.name}</div><div className="ach-desc">{a.desc}</div></div>
                ))}
              </div>
            </div>
          )}

          
          {tab==='profile'&&(
            <div className="page">
              <div className="profile-card">
                <div className="ph-avt-wrap"><div className="ph-avt">⛏</div><div className="ph-avt-ring"/></div>
                <div className="ph-name">MINER_YOU</div>
                <div className="ph-tags">
                  <div className="ph-tag">MINER</div>
                  {hasAutoMine&&<div className="ph-tag green">🤖 AUTO-MINE</div>}
                  {hasPermBoost&&<div className="ph-tag purple">⚡ 2× CORE</div>}
                  {simRefs>0&&<div className="ph-tag blue">👥 {simRefs} REFS</div>}
                </div>
                <div className="ph-uid">UID: A7F3C1D2E5B8 · FORGE NETWORK</div>
                <div className="ph-big-stats">
                  <div className="ph-bstat"><div className="ph-bstat-val">{fmt(totalMined)}</div><div className="ph-bstat-lbl">FRG MINED</div></div>
                  <div className="ph-stat-div"/>
                  <div className="ph-bstat"><div className="ph-bstat-val">{effectiveRate.toFixed(2)}</div><div className="ph-bstat-lbl">FRG/SEC</div></div>
                  <div className="ph-stat-div"/>
                  <div className="ph-bstat"><div className="ph-bstat-val">{blocks}</div><div className="ph-bstat-lbl">BLOCKS</div></div>
                </div>
                {activeItemIds.length>0&&(
                  <div className="ph-active-items">
                    {activeItemIds.slice(0,4).map(id=>{
                      const icon=id.includes('auto')?'🤖':id.includes('speed')?'⚡':id.includes('chest')?'📦':'📡';
                      return(<div key={id} className="ph-active-item" style={{background:'rgba(232,184,75,.09)',borderColor:'rgba(232,184,75,.22)',color:'var(--gold)'}}><span style={{fontSize:12}}>{icon}</span>{id.replace(/_/g,' ')}</div>);
                    })}
                  </div>
                )}
              </div>
              <div className="earnings-breakdown">
                <div className="eb-title">Earnings Breakdown</div>
                <div className="eb-row"><div className="eb-label"><div className="eb-dot" style={{background:'var(--gold)'}}/>Active mining</div><div className="eb-val">{fmt(totalMined)} FRG</div></div>
                <div className="eb-row"><div className="eb-label"><div className="eb-dot" style={{background:'var(--green)'}}/>Auto-mine{!hasAutoMine&&<span style={{fontFamily:'var(--mono)',fontSize:7.5,color:'var(--mt)',marginLeft:4}}>(locked)</span>}</div><div className="eb-val" style={{color:hasAutoMine?'var(--green)':'var(--mt)'}}>{hasAutoMine?fmt(totalMined*.3)+' FRG':'—'}</div></div>
                <div className="eb-row"><div className="eb-label"><div className="eb-dot" style={{background:'var(--blue)'}}/>Referral income</div><div className="eb-val" style={{color:'var(--blue)'}}>{fmt(simRefs*1240)} FRG</div></div>
                <div className="eb-row"><div className="eb-label"><div className="eb-dot" style={{background:'var(--purple)'}}/>Mission rewards</div><div className="eb-val" style={{color:'var(--purple)'}}>{fmt(missionPoints)} FRG</div></div>
                {!hasAutoMine&&<div onClick={()=>setTab('store')} style={{marginTop:9,padding:'8px 10px',background:'rgba(232,184,75,.05)',border:'1px solid rgba(232,184,75,.14)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}><div style={{fontFamily:'var(--mono)',fontSize:8,color:'var(--mt)'}}>🤖 Add Auto-Mine to earn while offline</div><div style={{fontFamily:'var(--mono)',fontSize:8.5,color:'var(--gold)',flexShrink:0}}>from 3 TON →</div></div>}
                <div className="eb-total-row"><div className="eb-total-lbl">Total Earned</div><div className="eb-total-val">{fmt(totalMined+(hasAutoMine?totalMined*.3:0)+simRefs*1240+missionPoints)}</div></div>
              </div>
              <div className="pstats-grid">
                {[{v:streak,l:'STREAK'},{v:simRefs,l:'REFERRALS'},{v:[totalMined>0,blocks>=3,totalMined>=1000000].filter(Boolean).length,l:'BADGES'},{v:activeItemIds.length,l:'PURCHASES'},{v:fmt(missionPoints),l:'MISSION FRG'},{v:`${Math.floor(sessT/60)}m`,l:'SESSION'}].map((s,i)=>(
                  <div key={i} className="ps-card"><div className="ps-val">{s.v}</div><div className="ps-lbl">{s.l}</div></div>
                ))}
              </div>
              <div className="div"><div className="div-line"/><div className="div-lbl">Account</div><div className="div-line"/></div>
              <div className="pm-list">
                {[{icon:'🤖',name:'Auto-Mine',sub:hasAutoMine?'● Active — earning while offline':'Not active — set it up',action:()=>setTab('store'),badge:hasAutoMine?'ACTIVE':null},{icon:'⚡',name:'Upgrade',sub:`${activeItemIds.length} items · more available`,action:()=>setTab('store'),badge:null},{icon:'📜',name:'Crypto Legacy',sub:'How Notcoin, Hamster \& Pi early miners won big',action:()=>setLegacy(true),badge:'READ'},{icon:'💎',name:'TON Wallet',sub:'Connect your TON wallet',action:()=>showToast('💎','Coming Soon','TON Connect'),badge:null},{icon:'🎁',name:'Daily Reward',sub:`Streak: ${streak} days · Claim tomorrow`,action:async()=>{
            try{
              const s=await api.profile.getDailyReward();
              if(s.alreadyClaimed){showToast('🎁','Already Claimed','Come back tomorrow!');}
              else{
                const r=await api.profile.claimDailyReward();
                setBalance(b=>b+r.reward);
                setTotal(t=>t+r.reward);
                showToast('🎁',`+${fmt(r.reward)} FRG`,`Day ${r.newStreak} streak!`);
              }
            }catch(e){showToast('🎁','Claim failed','Try again');}
          },badge:null}].map((item,i)=>(
                  <div key={i} className="pm-row" onClick={item.action}>
                    <div className="pm-icon">{item.icon}</div>
                    <div className="pm-body"><div className="pm-name">{item.name}</div><div className="pm-sub">{item.sub}</div></div>
                    {item.badge&&<div className="pm-badge">{item.badge}</div>}
                    <div className="pm-arr">›</div>
                  </div>
                ))}
              </div>
              <div style={{textAlign:'center',paddingTop:8,paddingBottom:4,fontFamily:'var(--mono)',fontSize:7.5,letterSpacing:'.2em',color:'rgba(255,255,255,.1)'}}>FORGE v1.0 · FRG TOKEN · TON BLOCKCHAIN · 2025</div>
            </div>
          )}

        </div>

        
        <div className="tabbar">
          {[{id:'mine',icon:'⛏',label:'Mine'},{id:'store',icon:'⚡',label:'Upgrade'},{id:'refer',icon:'👥',label:'Team'},{id:'missions',icon:'⚔️',label:'Tasks',badge:totalClaimable||null},{id:'profile',icon:'◈',label:'Profile'}].map(t=>(
            <button key={t.id} className={`tab${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
              {t.badge?<div className="tab-badge">{t.badge}</div>:null}
              <span className="tab-icon">{t.icon}</span>
              <span className="tab-label">{t.label}</span>
              <div className="tab-pip"/>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
