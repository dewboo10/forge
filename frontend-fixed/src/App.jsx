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


/* ═══ STORE ITEM SVG ICONS ═══ */
const StoreIcons = {
  // Auto-mine robot
  automine: (color='#e8b84b') => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="7" width="16" height="12" rx="3.5" fill={color} opacity=".15" stroke={color} strokeWidth="1.2"/>
      <rect x="6" y="9.5" width="4" height="4" rx="1.5" fill={color} opacity=".5"/>
      <circle cx="8" cy="11.5" r="1.5" fill={color} opacity=".95"/>
      <rect x="12" y="9.5" width="4" height="4" rx="1.5" fill={color} opacity=".5"/>
      <circle cx="14" cy="11.5" r="1.5" fill={color} opacity=".95"/>
      <rect x="7" y="15" width="3" height="2.5" rx="1" fill={color} opacity=".6"/>
      <rect x="12" y="15" width="3" height="2.5" rx="1" fill={color} opacity=".6"/>
      <line x1="11" y1="3" x2="11" y2="7" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="11" cy="2.5" r="1.5" fill={color} opacity=".8"/>
      <line x1="3" y1="11" x2="0.5" y2="11" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity=".5"/>
      <line x1="19" y1="11" x2="21.5" y2="11" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity=".5"/>
    </svg>
  ),
  // Infinity / lifetime
  infinity: (color='#c07cf0') => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 11 Q4 6 8 6 Q12 6 11 11 Q12 16 16 16 Q20 16 20 11 Q20 6 16 6 Q12 6 11 11 Q10 16 6 16 Q2 16 2 11Z" fill={color} opacity=".15" stroke={color} strokeWidth="1.3"/>
      <circle cx="8" cy="11" r="2" fill={color} opacity=".8"/>
      <circle cx="14" cy="11" r="2" fill={color} opacity=".8"/>
    </svg>
  ),
  // Lightning bolt
  lightning: (color='#5ec98a') => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <polygon points="13,2 6,12 11,12 9,20 16,10 11,10 14,2" fill={color} opacity=".2"/>
      <polygon points="13,2 6,12 11,12 9,20 16,10 11,10 14,2" fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="10.5" cy="14" r="2" fill={color} opacity=".7"/>
    </svg>
  ),
  // Fire / strong
  fire: (color='#e06c4c') => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2 Q13 6 14 5 Q13 10 16 9 Q14 14 11 15 Q8 14 6 9 Q9 10 8 5 Q9 6 11 2Z" fill={color} opacity=".2" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="11" cy="13" r="2.5" fill={color} opacity=".75"/>
      <circle cx="11" cy="13" r="1" fill={color}/>
    </svg>
  ),
  // Crystal / permanent
  crystal: (color='#c07cf0') => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <polygon points="11,2 16,7 14,18 11,20 8,18 6,7" fill={color} opacity=".15" stroke={color} strokeWidth="1.2"/>
      <line x1="6" y1="7" x2="16" y2="7" stroke={color} strokeWidth="1" opacity=".6"/>
      <line x1="11" y1="2" x2="6" y2="7" stroke={color} strokeWidth="1" opacity=".5"/>
      <line x1="11" y1="2" x2="16" y2="7" stroke={color} strokeWidth="1" opacity=".5"/>
      <circle cx="11" cy="11" r="2.5" fill={color} opacity=".6"/>
    </svg>
  ),
  // Box / chest
  chest: (color='#5ba8e8') => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="9" width="18" height="12" rx="2.5" fill={color} opacity=".15" stroke={color} strokeWidth="1.2"/>
      <rect x="2" y="6" width="18" height="5" rx="2" fill={color} opacity=".25" stroke={color} strokeWidth="1.2"/>
      <line x1="11" y1="9" x2="11" y2="21" stroke={color} strokeWidth="1" opacity=".5"/>
      <rect x="9" y="13" width="4" height="3" rx="1" fill={color} opacity=".7"/>
      <line x1="2" y1="11" x2="20" y2="11" stroke={color} strokeWidth="1" opacity=".3"/>
    </svg>
  ),
  // Diamond
  diamond: (color='#c07cf0') => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <polygon points="11,2 18,8 11,20 4,8" fill={color} opacity=".2" stroke={color} strokeWidth="1.2"/>
      <line x1="4" y1="8" x2="18" y2="8" stroke={color} strokeWidth="1" opacity=".6"/>
      <line x1="11" y1="2" x2="4" y2="8" stroke={color} strokeWidth="1" opacity=".5"/>
      <line x1="11" y1="2" x2="18" y2="8" stroke={color} strokeWidth="1" opacity=".5"/>
      <polygon points="11,8 15,8 11,16 7,8" fill={color} opacity=".4"/>
    </svg>
  ),
  // Antenna / referral
  antenna: (color='#e06c4c') => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <line x1="11" y1="2" x2="11" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="11" cy="2" r="2" fill={color}/>
      <path d="M5 6 Q11 12 17 6" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity=".5"/>
      <path d="M3 4 Q11 13 19 4" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" opacity=".3"/>
      <rect x="8" y="14" width="6" height="6" rx="2" fill={color} opacity=".15" stroke={color} strokeWidth="1"/>
      <circle cx="11" cy="17" r="1.2" fill={color} opacity=".7"/>
    </svg>
  ),
  // Neural - for Neural Boost upgrade
  neural: (color='#e8b84b') => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="4" fill={color} opacity=".2" stroke={color} strokeWidth="1.2"/>
      <circle cx="11" cy="11" r="1.5" fill={color} opacity=".8"/>
      <circle cx="3" cy="6" r="2" fill={color} opacity=".5"/>
      <circle cx="19" cy="6" r="2" fill={color} opacity=".5"/>
      <circle cx="3" cy="16" r="2" fill={color} opacity=".5"/>
      <circle cx="19" cy="16" r="2" fill={color} opacity=".5"/>
      <line x1="5" y1="7" x2="9" y2="10" stroke={color} strokeWidth="1" opacity=".5"/>
      <line x1="17" y1="7" x2="13" y2="10" stroke={color} strokeWidth="1" opacity=".5"/>
      <line x1="5" y1="15" x2="9" y2="12" stroke={color} strokeWidth="1" opacity=".5"/>
      <line x1="17" y1="15" x2="13" y2="12" stroke={color} strokeWidth="1" opacity=".5"/>
    </svg>
  ),
  // Plasma array
  plasma: (color='#e06c4c') => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" fill="none" stroke={color} strokeWidth="1" opacity=".25" strokeDasharray="3 4"/>
      <circle cx="11" cy="11" r="5" fill={color} opacity=".12" stroke={color} strokeWidth="1.2"/>
      <circle cx="11" cy="11" r="2" fill={color} opacity=".7"/>
      <circle cx="11" cy="3" r="1.5" fill={color} opacity=".6"/>
      <circle cx="19" cy="11" r="1.5" fill={color} opacity=".6"/>
      <circle cx="3" cy="11" r="1.5" fill={color} opacity=".6"/>
      <circle cx="11" cy="19" r="1.5" fill={color} opacity=".6"/>
    </svg>
  ),
  // Quantum
  quantum: (color='#5ec98a') => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" fill={color} opacity=".12" stroke={color} strokeWidth="1.2"/>
      <polygon points="11,6 16,9 16,13 11,16 6,13 6,9" fill={color} opacity=".2"/>
      <circle cx="11" cy="11" r="2.5" fill={color} opacity=".8"/>
      <line x1="11" y1="2" x2="11" y2="6" stroke={color} strokeWidth="1" opacity=".5"/>
      <line x1="11" y1="16" x2="11" y2="20" stroke={color} strokeWidth="1" opacity=".5"/>
    </svg>
  ),
  // Dark matter
  darkmatter: (color='#5ba8e8') => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="9" fill="none" stroke={color} strokeWidth="1" opacity=".2"/>
      <ellipse cx="11" cy="11" rx="9" ry="3.5" fill="none" stroke={color} strokeWidth="1.2" opacity=".5"/>
      <ellipse cx="11" cy="11" rx="3.5" ry="9" fill="none" stroke={color} strokeWidth="1.2" opacity=".35"/>
      <circle cx="11" cy="11" r="2.5" fill={color} opacity=".7"/>
      <circle cx="11" cy="2" r="1.2" fill={color} opacity=".6"/>
      <circle cx="20" cy="11" r="1.2" fill={color} opacity=".6"/>
    </svg>
  ),
  // Singularity
  singularity: (color='#c07cf0') => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="9" fill={color} opacity=".08" stroke={color} strokeWidth="1" strokeDasharray="2 5"/>
      <circle cx="11" cy="11" r="6" fill={color} opacity=".12" stroke={color} strokeWidth="1.2"/>
      <circle cx="11" cy="11" r="3.5" fill={color} opacity=".25"/>
      <circle cx="11" cy="11" r="1.5" fill={color} opacity=".9"/>
      <circle cx="11" cy="11" r=".5" fill="#fff"/>
    </svg>
  ),
};


/* ═══ TIER / REWARD ICON RENDERER ═══ */
function TierIcon({icon, color='#fff', size=20}) {
  const s = size, h = s/2;
  if(icon==='gift') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="9" width="16" height="11" rx="2" fill={color} opacity=".2" stroke={color} strokeWidth="1.1"/>
      <rect x="1" y="6" width="18" height="4" rx="1.5" fill={color} opacity=".3" stroke={color} strokeWidth="1.1"/>
      <line x1="10" y1="6" x2="10" y2="20" stroke={color} strokeWidth="1" opacity=".5"/>
      <path d="M10 6 Q10 3 7 3 Q4 3 6 6Z" fill={color} opacity=".6"/>
      <path d="M10 6 Q10 3 13 3 Q16 3 14 6Z" fill={color} opacity=".6"/>
    </svg>
  );
  if(icon==='bolt') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <polygon points="12,1 5,11 10,11 8,19 15,9 10,9 13,1" fill={color} opacity=".25"/>
      <polygon points="12,1 5,11 10,11 8,19 15,9 10,9 13,1" fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="9" cy="13" r="2" fill={color} opacity=".7"/>
    </svg>
  );
  if(icon==='fire') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <path d="M10 1 Q12 5 13 4 Q12 9 15 8 Q13 14 10 16 Q7 14 5 8 Q8 9 7 4 Q8 5 10 1Z" fill={color} opacity=".25" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="10" cy="13" r="3" fill={color} opacity=".6"/>
      <circle cx="10" cy="13" r="1.5" fill={color} opacity=".9"/>
    </svg>
  );
  if(icon==='robot') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="7" width="14" height="10" rx="3" fill={color} opacity=".18" stroke={color} strokeWidth="1.1"/>
      <rect x="5.5" y="9.5" width="3.5" height="3.5" rx="1.2" fill={color} opacity=".4"/>
      <circle cx="7.2" cy="11.2" r="1.3" fill={color} opacity=".9"/>
      <rect x="11" y="9.5" width="3.5" height="3.5" rx="1.2" fill={color} opacity=".4"/>
      <circle cx="12.8" cy="11.2" r="1.3" fill={color} opacity=".9"/>
      <rect x="6.5" y="14.5" width="2.5" height="2" rx=".8" fill={color} opacity=".5"/>
      <rect x="11" y="14.5" width="2.5" height="2" rx=".8" fill={color} opacity=".5"/>
      <line x1="10" y1="3" x2="10" y2="7" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="10" cy="2.5" r="1.5" fill={color} opacity=".8"/>
    </svg>
  );
  if(icon==='crystal') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <polygon points="10,2 16,7 14,18 10,20 6,18 4,7" fill={color} opacity=".2" stroke={color} strokeWidth="1.1"/>
      <line x1="4" y1="7" x2="16" y2="7" stroke={color} strokeWidth="1" opacity=".5"/>
      <polygon points="10,7 14,7 10,15 6,7" fill={color} opacity=".35"/>
      <circle cx="10" cy="11" r="2" fill={color} opacity=".65"/>
    </svg>
  );
  if(icon==='crown') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <polygon points="3,16 3,7 7,12 10,3 13,12 17,7 17,16" fill={color} opacity=".25" stroke={color} strokeWidth="1.1" strokeLinejoin="round"/>
      <rect x="3" y="16" width="14" height="3" rx="1.2" fill={color} opacity=".4"/>
      <circle cx="10" cy="5" r="2" fill={color} opacity=".8"/>
      <circle cx="3" cy="8" r="1.5" fill={color} opacity=".6"/>
      <circle cx="17" cy="8" r="1.5" fill={color} opacity=".6"/>
    </svg>
  );
  if(icon==='infinity') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <path d="M3 10 Q3 6 6 6 Q9 6 10 10 Q11 14 14 14 Q17 14 17 10 Q17 6 14 6 Q11 6 10 10 Q9 14 6 14 Q3 14 3 10Z" fill={color} opacity=".2" stroke={color} strokeWidth="1.2"/>
      <circle cx="6.5" cy="10" r="2" fill={color} opacity=".7"/>
      <circle cx="13.5" cy="10" r="2" fill={color} opacity=".7"/>
    </svg>
  );
  if(icon==='shield') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <path d="M10 1 L17 4 L17 10 Q17 16 10 19 Q3 16 3 10 L3 4 Z" fill={color} opacity=".18" stroke={color} strokeWidth="1.2"/>
      <path d="M10 5 L13 6.5 L13 10 Q13 13 10 14.5 Q7 13 7 10 L7 6.5 Z" fill={color} opacity=".3"/>
      <circle cx="10" cy="10" r="2.2" fill={color} opacity=".8"/>
    </svg>
  );
  if(icon==='star') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <polygon points="10,1 12.5,7.5 19,7.5 13.5,11.5 15.5,18 10,14 4.5,18 6.5,11.5 1,7.5 7.5,7.5" fill={color} opacity=".8" stroke={color} strokeWidth=".5"/>
    </svg>
  );
  if(icon==='node') return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" fill={color} opacity=".12" stroke={color} strokeWidth="1.2"/>
      <circle cx="10" cy="10" r="4" fill={color} opacity=".3"/>
      <circle cx="10" cy="10" r="2" fill={color} opacity=".8"/>
      <line x1="10" y1="3" x2="10" y2="6" stroke={color} strokeWidth="1" opacity=".5"/>
      <line x1="17" y1="10" x2="14" y2="10" stroke={color} strokeWidth="1" opacity=".5"/>
    </svg>
  );
  // fallback dot
  return <circle cx={h} cy={h} r={h*0.4} fill={color}/>;
}

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
        if(n.pulsing){n.pr+=1.4; const a=Math.max(0,1-n.pr/26); ctx.beginPath(); ctx.arc(n.x,n.y,n.pr,0,Math.PI*2); ctx.strokeStyle=`rgba(0,195,123,${a*.35})`; ctx.lineWidth=1; ctx.stroke(); if(n.pr>=26){n.pulsing=false; n.pr=0;}}
      });
      for(let i=0;i<N;i++) for(let j=i+1;j<N;j++){
        const a=nodes[i],b=nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y),mx=ia?84:60;
        if(d<mx){const al=(1-d/mx)*(ia?.26:.07); ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.strokeStyle=`rgba(0,195,123,${al})`; ctx.lineWidth=.7; ctx.stroke();}
      }
      nodes.forEach(n=>{
        const br=ia?(.4+.6*Math.sin(n.phase)):.18;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle=`rgba(0,195,123,${br})`; ctx.fill();
        if(ia){ctx.beginPath(); ctx.arc(n.x,n.y,n.r+2,0,Math.PI*2); ctx.fillStyle=`rgba(0,195,123,${br*.1})`; ctx.fill();}
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
  return <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"><polyline points={pts} fill="none" stroke={color||'var(--green)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
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
                <div className="oo-title" style={{color:'var(--green)'}}>Now It Is Your Turn</div>
                <div className="oo-sub" style={{color:'var(--tx3)'}}>Every project above started with zero users and zero value.<br/>Forge FRG mining is live. Early miners have always won — this is no different.</div>
                <div className="oo-stats">
                  <div className="oos"><div className="oos-v" style={{color:'var(--green)'}}>1B</div><div className="oos-l">FRG SUPPLY</div></div>
                  <div className="oos"><div className="oos-v" style={{color:'var(--green)'}}>40%</div><div className="oos-l">MINING SHARE</div></div>
                  <div className="oos"><div className="oos-v" style={{color:'var(--green)'}}>FREE</div><div className="oos-l">TO MINE</div></div>
                </div>
                <button className="oo-cta" style={{background:'var(--green)'}} onClick={()=>{onClose();onMine?.();}}>▶ START MINING FRG</button>
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
  const isAutoMine=item.id?.includes('auto');
  const isLifetime=item.id==='auto_lifetime';
  const isBoost=item.id?.includes('boost')||item.id?.includes('speed');
  const isReferral=item.id?.includes('ref')||item.id?.includes('chest');

  // Psychological hook per item type
  const hook = isLifetime ? "Early miners who set up Auto-Mine earned 3× more than those who didn't."
    : isAutoMine ? "Your node sleeps when you do. Auto-Mine doesn't."
    : isBoost ? "Top miners activate a boost every mining session."
    : isReferral ? "Your referral network multiplies while you sleep."
    : "Every upgrade compounds — the earlier, the better.";

  // Item-specific illustration
  const Illustration = ()=>{
    if(isLifetime) return (
      <svg width="100%" height="80" viewBox="0 0 320 80" style={{display:'block'}}>
        {/* Infinity loop robot */}
        <circle cx="110" cy="40" r="28" fill="none" stroke="#b464ff" strokeWidth="2.5" opacity=".5"/>
        <circle cx="110" cy="40" r="18" fill="none" stroke="#b464ff" strokeWidth="1.5" opacity=".35"/>
        <circle cx="110" cy="40" r="9" fill="#b464ff" opacity=".25"/>
        <circle cx="210" cy="40" r="28" fill="none" stroke="#b464ff" strokeWidth="2.5" opacity=".5"/>
        <circle cx="210" cy="40" r="18" fill="none" stroke="#b464ff" strokeWidth="1.5" opacity=".35"/>
        <circle cx="210" cy="40" r="9" fill="#b464ff" opacity=".25"/>
        <path d="M110 12 Q160 40 210 12" fill="none" stroke="#b464ff" strokeWidth="2" opacity=".4"/>
        <path d="M110 68 Q160 40 210 68" fill="none" stroke="#b464ff" strokeWidth="2" opacity=".4"/>
        <circle cx="160" cy="40" r="5" fill="#b464ff" opacity=".8"/>
        <ellipse cx="160" cy="40" rx="10" ry="10" fill="#b464ff" opacity=".15"/>
        {/* Dot grid behind */}
        {Array.from({length:16},(_,i)=>Array.from({length:4},(_,j)=>(
          <circle key={i*4+j} cx={i*22} cy={j*22+2} r=".8" fill="rgba(255,255,255,.07)"/>
        )))}
      </svg>
    );
    if(isBoost) return (
      <svg width="100%" height="80" viewBox="0 0 320 80" style={{display:'block'}}>
        {Array.from({length:16},(_,i)=>Array.from({length:4},(_,j)=>(
          <circle key={i*4+j} cx={i*22} cy={j*22+2} r=".8" fill="rgba(255,255,255,.07)"/>
        )))}
        {/* Lightning bolt centered */}
        <polygon points="175,5 140,42 162,42 128,75 185,34 162,34 198,5" fill="#2a2a2a"/>
        <polygon points="175,10 145,42 163,42 132,71 182,38 162,38 194,10" fill="#333"/>
        <polygon points="175,16 150,42 164,42 136,67 179,42 162,42 190,16" fill="#ffc100" opacity=".55"/>
        <polygon points="172,22 154,42 165,42 140,63 176,46 163,46 186,22" fill="#ffc100" opacity=".85"/>
        <circle cx="160" cy="54" r="5" fill="#ffc100"/>
        <ellipse cx="160" cy="54" rx="10" ry="10" fill="#ffc100" opacity=".2"/>
        {/* Speed lines left */}
        <line x1="60" y1="32" x2="118" y2="32" stroke="#ffc100" strokeWidth="1.5" opacity=".35" strokeLinecap="round"/>
        <line x1="80" y1="40" x2="124" y2="40" stroke="#ffc100" strokeWidth="1" opacity=".25" strokeLinecap="round"/>
        <line x1="68" y1="48" x2="120" y2="48" stroke="#ffc100" strokeWidth="1.2" opacity=".2" strokeLinecap="round"/>
        {/* Speed lines right */}
        <line x1="202" y1="32" x2="260" y2="32" stroke="#ffc100" strokeWidth="1.5" opacity=".35" strokeLinecap="round"/>
        <line x1="196" y1="40" x2="240" y2="40" stroke="#ffc100" strokeWidth="1" opacity=".25" strokeLinecap="round"/>
        <line x1="200" y1="48" x2="252" y2="48" stroke="#ffc100" strokeWidth="1.2" opacity=".2" strokeLinecap="round"/>
      </svg>
    );
    if(isAutoMine) return (
      <svg width="100%" height="80" viewBox="0 0 320 80" style={{display:'block'}}>
        {Array.from({length:16},(_,i)=>Array.from({length:4},(_,j)=>(
          <circle key={i*4+j} cx={i*22} cy={j*22+2} r=".8" fill="rgba(255,255,255,.07)"/>
        )))}
        {/* Robot figure */}
        <rect x="128" y="16" width="64" height="48" rx="10" fill="#1e1e1e"/>
        <rect x="134" y="22" width="20" height="14" rx="4" fill="#00c37b" opacity=".3"/>
        <circle cx="144" cy="29" r="5" fill="#00c37b" opacity=".9"/>
        <rect x="166" y="22" width="20" height="14" rx="4" fill="#00c37b" opacity=".3"/>
        <circle cx="176" cy="29" r="5" fill="#00c37b" opacity=".9"/>
        <rect x="136" y="42" width="12" height="8" rx="2" fill="#252525"/>
        <rect x="152" y="42" width="12" height="8" rx="2" fill="#252525"/>
        <rect x="168" y="42" width="12" height="8" rx="2" fill="#252525"/>
        <line x1="160" y1="6" x2="160" y2="16" stroke="#00c37b" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="160" cy="5" r="3.5" fill="#00c37b" opacity=".8"/>
        <rect x="108" y="26" width="22" height="10" rx="5" fill="#1a1a1a"/>
        <rect x="190" y="26" width="22" height="10" rx="5" fill="#1a1a1a"/>
        <rect x="136" y="62" width="14" height="16" rx="5" fill="#1a1a1a"/>
        <rect x="170" y="62" width="14" height="16" rx="5" fill="#1a1a1a"/>
        <ellipse cx="160" cy="78" rx="30" ry="4" fill="#00c37b" opacity=".08"/>
        {/* ZZZ — sleeping world */}
        <text x="62" y="30" fontSize="14" fill="rgba(255,255,255,.2)" fontWeight="700">Z</text>
        <text x="74" y="20" fontSize="10" fill="rgba(255,255,255,.13)" fontWeight="700">z</text>
        <text x="82" y="12" fontSize="7" fill="rgba(255,255,255,.08)" fontWeight="700">z</text>
        <text x="228" y="30" fontSize="14" fill="rgba(255,255,255,.2)" fontWeight="700">Z</text>
        <text x="216" y="20" fontSize="10" fill="rgba(255,255,255,.13)" fontWeight="700">z</text>
        <text x="206" y="12" fontSize="7" fill="rgba(255,255,255,.08)" fontWeight="700">z</text>
      </svg>
    );
    // Default — upgrade/generic
    return (
      <svg width="100%" height="80" viewBox="0 0 320 80" style={{display:'block'}}>
        {Array.from({length:16},(_,i)=>Array.from({length:4},(_,j)=>(
          <circle key={i*4+j} cx={i*22} cy={j*22+2} r=".8" fill="rgba(255,255,255,.07)"/>
        )))}
        <circle cx="160" cy="40" r="32" fill="none" stroke="#00c37b" strokeWidth="1" opacity=".2" strokeDasharray="4 6"/>
        <circle cx="160" cy="40" r="20" fill="none" stroke="#00c37b" strokeWidth="1.5" opacity=".35"/>
        <circle cx="160" cy="40" r="10" fill="#00c37b" opacity=".2"/>
        <circle cx="160" cy="40" r="5" fill="#00c37b" opacity=".6"/>
        <line x1="160" y1="8" x2="160" y2="20" stroke="#00c37b" strokeWidth="1.5" opacity=".5"/>
        <line x1="192" y1="40" x2="180" y2="40" stroke="#00c37b" strokeWidth="1.5" opacity=".5"/>
        <line x1="128" y1="40" x2="140" y2="40" stroke="#00c37b" strokeWidth="1.5" opacity=".5"/>
        <line x1="160" y1="60" x2="160" y2="72" stroke="#00c37b" strokeWidth="1.5" opacity=".5"/>
        <polygon points="160,2 163,10 160,8 157,10" fill="#00c37b" opacity=".7"/>
      </svg>
    );
  };

  return (
    <div style={{position:'fixed',inset:0,zIndex:9000,background:'rgba(0,0,0,.82)',display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:'100%',maxWidth:430,background:'#111',borderRadius:'18px 18px 0 0',overflow:'hidden',borderTop:'1px solid rgba(255,255,255,.1)'}}>

        {/* Illustration header */}
        <div style={{background:'#0a0a0a',position:'relative',overflow:'hidden'}}>
          <Illustration/>
          {/* Item icon overlay */}
          <div style={{position:'absolute',top:'50%',left:20,transform:'translateY(-50%)',width:48,height:48,borderRadius:12,background:'rgba(0,0,0,.6)',border:'1px solid rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,backdropFilter:'blur(8px)'}}>
            {item.icon}
          </div>
          {/* Handle */}
          <div style={{position:'absolute',top:8,left:'50%',transform:'translateX(-50%)',width:32,height:3,background:'rgba(255,255,255,.15)',borderRadius:2}}/>
        </div>

        <div style={{padding:'16px 20px 0'}}>
          {/* Name + badge */}
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
            <div style={{fontSize:18,fontWeight:800,color:'#fff',letterSpacing:'-.01em'}}>{item.name}</div>
            {item.badge&&<span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:4,background:'rgba(0,195,123,.12)',color:'#00c37b',border:'1px solid rgba(0,195,123,.2)'}}>{item.badge}</span>}
          </div>

          {/* Description */}
          <div style={{fontSize:12,color:'rgba(255,255,255,.35)',marginBottom:14,lineHeight:1.5}}>{item.shortDesc}</div>

          {/* Features */}
          <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:14}}>
            {(isLifetime?['Mine 24/7 — even when app is closed','Full rate × all your upgrades','Permanent — pay once, earn forever','Activates within seconds']:
              isAutoMine?['Earns FRG while you sleep','Full mining rate applied','Works with all upgrades','Easy to upgrade to Lifetime']:
              isBoost?['Multiplies your current mining rate','Stacks with all node upgrades','Activates immediately on tap','Your balance keeps all earnings']:
              ['Activates immediately','Stacks with all upgrades','Permanent upgrade','Counts toward leaderboard']
            ).map((f,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:16,height:16,borderRadius:'50%',background:'rgba(0,195,123,.15)',border:'1px solid rgba(0,195,123,.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1,4 3,6 7,2" stroke="#00c37b" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{fontSize:12,color:'rgba(255,255,255,.6)'}}>{f}</span>
              </div>
            ))}
          </div>

          {/* Psychological hook — replaces guarantee */}
          <div style={{padding:'10px 12px',background:'rgba(255,255,255,.04)',borderRadius:8,border:'1px solid rgba(255,255,255,.07)',marginBottom:14}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,.35)',fontStyle:'italic',lineHeight:1.5}}>"{hook}"</div>
          </div>

          {/* Price row */}
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px',background:'rgba(255,255,255,.04)',borderRadius:10,border:'1px solid rgba(255,255,255,.07)',marginBottom:14}}>
            <div style={{flex:1}}>
              <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.25)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:2}}>Total Price</div>
              <div style={{display:'flex',alignItems:'baseline',gap:4}}>
                <span style={{fontSize:28,fontWeight:800,color:'#fff',lineHeight:1}}>{item.priceTON}</span>
                <span style={{fontSize:12,color:'rgba(255,255,255,.35)',fontWeight:500}}>TON</span>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:8,background:'rgba(0,152,234,.12)',border:'1px solid rgba(0,152,234,.2)'}}>
              <span style={{fontSize:18}}>💎</span>
              <div>
                <div style={{fontSize:9,color:'rgba(0,152,234,.7)',fontWeight:600}}>Paid via</div>
                <div style={{fontSize:11,fontWeight:800,color:'#0098EA'}}>TON Wallet</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{padding:'0 20px 36px',display:'flex',flexDirection:'column',gap:8}}>
          <button onClick={onConfirm} style={{width:'100%',padding:'15px',borderRadius:12,background:'#0098EA',border:'none',color:'#fff',fontSize:15,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,letterSpacing:'-.01em'}}>
            <span style={{fontSize:18}}>💎</span>
            PAY {item.priceTON} TON
          </button>
          <button onClick={onClose} style={{width:'100%',padding:'13px',borderRadius:12,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.4)',fontSize:13,fontWeight:600,cursor:'pointer'}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══ REWARD POPUP ═══ */
function RewardPopup({tier,onClose}){
  if(!tier) return null;
  const typeEmoji=tier.rewardType==='automine'?<TierIcon icon='robot' color={tier.color} size={28}/>:tier.rewardType==='speed'?<TierIcon icon='bolt' color={tier.color} size={28}/>:tier.rewardType==='permanent'?<TierIcon icon='crystal' color={tier.color} size={28}/>:tier.rewardType==='lifetime'?<TierIcon icon='infinity' color={tier.color} size={28}/>:<TierIcon icon='gift' color={tier.color} size={28}/>;
  return (
    <div className="reward-popup">
      <div className="rp-card" style={{border:`1.5px solid ${tier.border}`}}>
        <div className="rp-emoji"><TierIcon icon={tier.icon} color={tier.color} size={52}/></div>
        <div className="rp-pretitle">REFERRAL MILESTONE REACHED</div>
        <div className="rp-title" style={{color:tier.color}}>{tier.label}</div>
        <div className="rp-reward" style={{color:tier.color,display:'flex',alignItems:'center',gap:6,justifyContent:'center'}}>{typeEmoji}<span>{tier.reward}</span></div>
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
        <button onClick={()=>setActiveTab('circle')} style={{flex:1,padding:'6px 0',borderRadius:7,border:`1px solid ${activeTab==='circle'?'rgba(91,168,232,.35)':'var(--br)'}`,background:activeTab==='circle'?'rgba(91,168,232,.1)':'var(--card)',fontFamily:'var(--f)',fontSize:8.5,color:activeTab==='circle'?'#5096ff':'var(--tx3)',cursor:'pointer',fontWeight:activeTab==='circle'?600:400}}>
          My Circle ({filledSlots}/5)
        </button>
        <button onClick={()=>setActiveTab('requests')} style={{flex:1,padding:'6px 0',borderRadius:7,border:`1px solid ${activeTab==='requests'?'rgba(232,184,75,.35)':'var(--br)'}`,background:activeTab==='requests'?'rgba(232,184,75,.1)':'var(--card)',fontFamily:'var(--f)',fontSize:8.5,cursor:'pointer',position:'relative',fontWeight:activeTab==='requests'?600:400,color:activeTab==='requests'?'var(--green)':'var(--tx3)'}}>
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
                  <div style={{fontSize:16,color:'var(--tx3)',marginBottom:2}}>＋</div>
                  <div style={{fontFamily:'var(--f)',fontSize:7,color:'var(--tx3)'}}>Add</div>
                </div>
              );
              return (
                <div key={m.id} className={`sc-slot filled${m.pending?' pending':''}`} style={{borderColor:m.trusted?`${m.color}44`:'rgba(232,184,75,.28)'}}>
                  {m.trusted&&<div className="sc-tick">✓</div>}
                  <div className="sc-slot-avt" style={{background:`${m.color}22`,color:m.color}}>{m.avatar}</div>
                  <div className="sc-slot-name" style={{color:m.trusted?'var(--tx2)':'var(--green)'}}>{m.name}</div>
                  <div className="sc-slot-status" style={{color:m.pending?'var(--green)':'var(--green)'}}>{m.pending?'pending':'verified'}</div>
                  {m.trusted&&<div onClick={(e)=>{e.stopPropagation();removeFromCircle(m.id);}} style={{position:'absolute',bottom:3,right:3,width:11,height:11,borderRadius:'50%',background:'rgba(224,85,85,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,color:'var(--red)',cursor:'pointer',border:'1px solid rgba(224,85,85,.3)'}}>✕</div>}
                </div>
              );
            })}
          </div>
          {adding?(
            <div style={{display:'flex',gap:6,marginBottom:10}}>
              <input value={addInput} onChange={e=>setAddInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdd()} placeholder="Enter username or Telegram ID..." autoFocus style={{flex:1,background:'rgba(0,0,0,.4)',border:'1px solid rgba(91,168,232,.28)',borderRadius:8,padding:'8px 10px',fontFamily:'var(--f)',fontSize:11,color:'var(--tx)',outline:'none'}}/>
              <button onClick={handleAdd} style={{padding:'8px 12px',borderRadius:8,background:'linear-gradient(135deg,#1a5a8a,#5096ff)',border:'none',color:'#fff',fontFamily:'var(--f)',fontSize:9.5,fontWeight:700,cursor:'pointer'}}>SEND</button>
              <button onClick={()=>setAdding(false)} style={{padding:'8px 10px',borderRadius:8,background:'var(--card)',border:'1px solid var(--br)',color:'var(--tx3)',fontFamily:'var(--f)',fontSize:9.5,cursor:'pointer'}}>✕</button>
            </div>
          ):(
            filledSlots<5&&<button onClick={()=>setAdding(true)} style={{width:'100%',padding:'8px',marginBottom:10,borderRadius:8,border:'1px dashed rgba(91,168,232,.28)',background:'transparent',color:'#5096ff',fontFamily:'var(--f)',fontSize:9,cursor:'pointer'}}>＋ Invite someone to your circle</button>
          )}
          <div className="sc-benefits">
            {[`+${trustScore}% trust score — boosts FRG allocation at listing`,`${trustedCount} verified contacts protect your account`,`Full circle (5/5) = eligible for Genesis airdrop tier`,`Higher trust = priority in early token distribution`].map((b,i)=>(
              <div key={i} className="sc-benefit"><div className="sc-benefit-dot" style={{background:i<trustedCount?'#5096ff':'var(--br)'}}/><span style={{color:i<trustedCount?'var(--tx2)':'var(--tx3)'}}>{b}</span></div>
            ))}
          </div>
          <div className="sc-info-box">◈ Each verified contact adds to your trust score and helps protect the FRG network from fake accounts. Higher trust score = larger FRG allocation at token listing.</div>
        </>
      )}

      
      {activeTab==='requests'&&(
        <>
          {incoming.length===0?(
            <div style={{textAlign:'center',padding:'20px 0',fontFamily:'var(--f)',fontSize:9,color:'var(--tx3)'}}>
              No pending requests<br/>
              <span style={{fontSize:8,opacity:.6}}>When someone adds you to their circle, it appears here</span>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:10}}>
              <div style={{fontFamily:'var(--f)',fontSize:8,color:'var(--tx3)',letterSpacing:'.1em',marginBottom:2}}>INCOMING CIRCLE REQUESTS</div>
              {incoming.map(req=>(
                <div key={req.id} style={{display:'flex',alignItems:'center',gap:10,background:'rgba(0,0,0,.28)',border:'1px solid var(--br)',borderRadius:10,padding:'10px 12px'}}>
                  <div style={{width:32,height:32,borderRadius:8,background:`${req.color}22`,border:`1px solid ${req.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--f)',fontSize:13,fontWeight:600,color:req.color,flexShrink:0}}>{req.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:500,color:'var(--tx)',marginBottom:2}}>{req.name}</div>
                    <div style={{fontFamily:'var(--f)',fontSize:7.5,color:'var(--tx3)'}}>Wants to add you · {req.since}</div>
                  </div>
                  <button onClick={()=>acceptRequest(req)} style={{padding:'5px 10px',borderRadius:7,background:'linear-gradient(135deg,#2e7d4f,var(--green))',border:'none',color:'#fff',fontFamily:'var(--f)',fontSize:8.5,fontWeight:700,cursor:'pointer',marginRight:4}}>✓</button>
                  <button onClick={()=>declineRequest(req)} style={{padding:'5px 10px',borderRadius:7,background:'rgba(224,85,85,.1)',border:'1px solid rgba(224,85,85,.28)',color:'var(--red)',fontFamily:'var(--f)',fontSize:8.5,cursor:'pointer'}}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div style={{fontFamily:'var(--f)',fontSize:8,color:'var(--tx3)',letterSpacing:'.1em',marginBottom:8,marginTop:4}}>YOUR CIRCLE MEMBERS</div>
          {circle.length===0?(
            <div style={{fontFamily:'var(--f)',fontSize:8.5,color:'var(--tx3)',textAlign:'center',padding:'10px 0'}}>Your circle is empty — go to My Circle tab to add people</div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {circle.map(m=>(
                <div key={m.id} style={{display:'flex',alignItems:'center',gap:9,background:'rgba(0,0,0,.22)',borderRadius:9,padding:'8px 11px'}}>
                  <div style={{width:26,height:26,borderRadius:6,background:`${m.color}22`,border:`1px solid ${m.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--f)',fontSize:11,fontWeight:600,color:m.color,flexShrink:0}}>{m.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11.5,fontWeight:500,color:'var(--tx)'}}>{m.name}</div>
                    <div style={{fontFamily:'var(--f)',fontSize:7,color:m.pending?'var(--green)':m.trusted?'var(--green)':'var(--tx3)'}}>{m.pending?'⏳ Awaiting acceptance':m.trusted?'✓ Verified in your circle':'Not trusted'}</div>
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

/* ═══ HALVING SECTION ═══ */
const HALVING_EPOCHS = [
  { users: 0,         label: 'Genesis',  rate: 1.000, color: '#e8b84b' },
  { users: 1000,      label: '1K',       rate: 0.500, color: '#5ec98a' },
  { users: 10000,     label: '10K',      rate: 0.250, color: '#5ba8e8' },
  { users: 100000,    label: '100K',     rate: 0.125, color: '#c07cf0' },
  { users: 1000000,   label: '1M',       rate: 0.0625,color: '#e06c4c' },
  { users: 100000000, label: '100M',     rate: 0.03125,color:'#f87171' },
]

function getEpoch(users) {
  for (let i = HALVING_EPOCHS.length - 1; i >= 0; i--) {
    if (users >= HALVING_EPOCHS[i].users) return i
  }
  return 0
}

function fmtUsers(n) {
  if (n >= 1e6) return (n/1e6).toFixed(0)+'M'
  if (n >= 1e3) return (n/1e3).toFixed(0)+'K'
  return n.toString()
}

function HalvingSection({ totalUsers = 0, effectiveRate = 0.1 }) {
  const canvasRef = useRef(null)
  const epochIdx  = getEpoch(totalUsers)
  const epoch     = HALVING_EPOCHS[epochIdx]
  const nextEpoch = HALVING_EPOCHS[epochIdx + 1] || null
  const [expanded, setExpanded] = useState(false)

  // Progress to next halving
  const progressPct = nextEpoch
    ? Math.min(100, ((totalUsers - epoch.users) / (nextEpoch.users - epoch.users)) * 100)
    : 100

  const usersToNext = nextEpoch ? nextEpoch.users - totalUsers : 0

  // Draw graph
  useEffect(() => {
    if (!expanded) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio
    const H = canvas.height = 160 * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    const w = canvas.offsetWidth
    const h = 160

    ctx.clearRect(0, 0, w, h)

    // Background grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(0, h * i/4)
      ctx.lineTo(w, h * i/4)
      ctx.stroke()
    }

    // X axis labels
    const xLabels = ['0', '1K', '10K', '100K', '1M', '100M']
    const xPositions = [0, 0.08, 0.22, 0.44, 0.66, 1.0]

    // Draw the step-down halving curve
    const points = HALVING_EPOCHS.map((e, i) => ({
      x: xPositions[i] * w,
      y: h - 20 - (e.rate / 1.0) * (h - 40),
      rate: e.rate,
      epoch: i,
    }))

    // Shade future (dimmed) vs past (bright)
    for (let i = 0; i < points.length - 1; i++) {
      const isPast = i < epochIdx
      const isCurrent = i === epochIdx
      const p = points[i]
      const pn = points[i + 1]

      // Fill area under step
      const grad = ctx.createLinearGradient(p.x, 0, p.x, h)
      const col = HALVING_EPOCHS[i].color
      grad.addColorStop(0, col + (isPast ? '40' : isCurrent ? '28' : '12'))
      grad.addColorStop(1, col + '00')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(p.x, h - 20)
      ctx.lineTo(p.x, p.y)
      ctx.lineTo(pn.x, p.y)
      ctx.lineTo(pn.x, h - 20)
      ctx.closePath()
      ctx.fill()

      // Horizontal step line
      ctx.strokeStyle = col + (isPast ? 'cc' : isCurrent ? 'ff' : '44')
      ctx.lineWidth = isCurrent ? 2.5 : 1.5
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(pn.x, p.y)
      ctx.stroke()

      // Vertical drop line at epoch boundary
      ctx.strokeStyle = col + '66'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(pn.x, p.y)
      ctx.lineTo(pn.x, points[i + 1].y)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Draw last horizontal segment (100M+)
    const last = points[points.length - 1]
    ctx.strokeStyle = HALVING_EPOCHS[points.length-1].color + '44'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(w, last.y)
    ctx.stroke()

    // Current position marker
    const curX = xPositions[epochIdx] * w +
      (nextEpoch ? progressPct/100 * (xPositions[epochIdx+1] - xPositions[epochIdx]) * w : 0)
    const curY = points[epochIdx].y

    // Glow circle
    const glowGrad = ctx.createRadialGradient(curX, curY, 0, curX, curY, 14)
    glowGrad.addColorStop(0, epoch.color + '60')
    glowGrad.addColorStop(1, epoch.color + '00')
    ctx.fillStyle = glowGrad
    ctx.beginPath()
    ctx.arc(curX, curY, 14, 0, Math.PI * 2)
    ctx.fill()

    // Dot
    ctx.fillStyle = epoch.color
    ctx.beginPath()
    ctx.arc(curX, curY, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'var(--bg)'
    ctx.lineWidth = 2
    ctx.stroke()

    // YOU ARE HERE label
    ctx.fillStyle = epoch.color
    ctx.font = `bold 9px "IBM Plex Mono", monospace`
    ctx.textAlign = curX > w * 0.8 ? 'right' : 'center'
    ctx.fillText('YOU ARE HERE', curX > w * 0.8 ? curX - 4 : curX, curY - 14)

    // X axis labels
    ctx.font = `8px "IBM Plex Mono", monospace`
    ctx.textAlign = 'center'
    xLabels.forEach((lbl, i) => {
      const x = xPositions[i] * w
      ctx.fillStyle = i === epochIdx ? HALVING_EPOCHS[i].color : 'rgba(255,255,255,0.25)'
      ctx.fillText(lbl, Math.max(8, Math.min(w-8, x)), h - 4)
    })

    // Rate labels on Y axis
    ctx.textAlign = 'left'
    ;[1, 0.5, 0.25, 0.125].forEach(rate => {
      const y = h - 20 - (rate / 1.0) * (h - 40)
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.font = '7px "IBM Plex Mono", monospace'
      ctx.fillText((rate * 100).toFixed(1) + '%', 2, y - 2)
    })
  }, [expanded, totalUsers, epochIdx, epoch, progressPct])

  return (
    <div style={{margin:'0 0 14px',borderRadius:14,overflow:'hidden',border:`1px solid ${epoch.color}28`,background:`rgba(9,9,11,0.6)`}}>
      {/* Header — always visible */}
      <div onClick={()=>setExpanded(e=>!e)} style={{padding:'13px 15px',cursor:'pointer',display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:36,height:36,borderRadius:10,background:`${epoch.color}18`,border:`1px solid ${epoch.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>⛏</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
            <span style={{fontFamily:'var(--f)',fontSize:11,fontWeight:700,color:epoch.color,letterSpacing:'.08em'}}>MINING HALVING</span>
            <span style={{fontFamily:'var(--f)',fontSize:9,color:'var(--tx3)',background:'var(--card)',border:'1px solid var(--br)',borderRadius:4,padding:'1px 6px'}}>{epoch.label} EPOCH</span>
          </div>
          <div style={{fontFamily:'var(--f)',fontSize:9,color:'var(--tx3)'}}>
            {nextEpoch
              ? <>Rate halves at <span style={{color:epoch.color}}>{fmtUsers(nextEpoch.users)} users</span> · <span style={{color:'var(--tx)'}}>{fmtUsers(usersToNext)}</span> to go</>
              : <span style={{color:'var(--tx3)'}}>Final epoch reached</span>
            }
          </div>
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          <div style={{fontFamily:'var(--f)',fontSize:18,fontWeight:700,color:epoch.color,lineHeight:1}}>{(epoch.rate*100).toFixed(2)}%</div>
          <div style={{fontFamily:'var(--f)',fontSize:8,color:'var(--tx3)'}}>CURRENT RATE</div>
        </div>
        <div style={{fontFamily:'var(--f)',fontSize:14,color:'var(--tx3)',marginLeft:4}}>{expanded?'▲':'▼'}</div>
      </div>

      {/* Progress bar to next halving */}
      {nextEpoch && (
        <div style={{padding:'0 15px 12px'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
            <span style={{fontFamily:'var(--f)',fontSize:8,color:'var(--tx3)'}}>{fmtUsers(totalUsers || 0)} users now</span>
            <span style={{fontFamily:'var(--f)',fontSize:8,color:epoch.color}}>halving at {fmtUsers(nextEpoch.users)}</span>
          </div>
          <div style={{height:6,borderRadius:3,background:'var(--card)',overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:3,width:`${progressPct}%`,background:`linear-gradient(90deg,${epoch.color}88,${epoch.color})`,transition:'width .6s ease',position:'relative'}}>
              <div style={{position:'absolute',right:0,top:0,bottom:0,width:3,background:epoch.color,borderRadius:2,boxShadow:`0 0 6px ${epoch.color}`}}/>
            </div>
          </div>
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div style={{borderTop:`1px solid ${epoch.color}18`}}>
          {/* Graph */}
          <div style={{padding:'14px 15px 8px'}}>
            <div style={{fontFamily:'var(--f)',fontSize:8,color:'var(--tx3)',marginBottom:8,letterSpacing:'.08em'}}>MINING RATE ACROSS ALL EPOCHS</div>
            <canvas ref={canvasRef} style={{width:'100%',height:160,display:'block',borderRadius:8,background:'rgba(0,0,0,.3)'}}/>
          </div>

          {/* Epoch table */}
          <div style={{padding:'8px 15px 14px'}}>
            <div style={{fontFamily:'var(--f)',fontSize:8,color:'var(--tx3)',letterSpacing:'.08em',marginBottom:8}}>EPOCH SCHEDULE</div>
            {HALVING_EPOCHS.slice(0, -1).map((e, i) => {
              const next = HALVING_EPOCHS[i + 1]
              const isCur = i === epochIdx
              const isPast = i < epochIdx
              return (
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 10px',borderRadius:8,marginBottom:4,background:isCur?`${e.color}12`:'transparent',border:isCur?`1px solid ${e.color}30`:'1px solid transparent'}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:isCur?e.color:isPast?e.color+'80':'var(--br)',flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontFamily:'var(--f)',fontSize:10,color:isCur?e.color:isPast?'var(--tx3)':'var(--tx3)',fontWeight:isCur?700:400}}>
                        {fmtUsers(e.users)} – {fmtUsers(next.users)} users
                      </span>
                      {isCur && <span style={{fontFamily:'var(--f)',fontSize:8,background:e.color,color:'#09090b',borderRadius:3,padding:'1px 5px',fontWeight:700}}>NOW</span>}
                      {isPast && <span style={{fontFamily:'var(--f)',fontSize:8,color:'var(--tx3)'}}>PASSED</span>}
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontFamily:'var(--f)',fontSize:11,color:isCur?e.color:isPast?'var(--tx3)':'var(--tx3)',fontWeight:isCur?700:400}}>{(e.rate*100).toFixed(2)}%</div>
                    <div style={{fontFamily:'var(--f)',fontSize:8,color:'var(--tx3)'}}>base rate</div>
                  </div>
                </div>
              )
            })}

            {/* What halving means for you */}
            <div style={{marginTop:10,padding:'10px 12px',borderRadius:8,background:'rgba(232,184,75,.05)',border:'1px solid rgba(232,184,75,.15)'}}>
              <div style={{fontFamily:'var(--f)',fontSize:8,color:'var(--green)',letterSpacing:'.08em',marginBottom:6}}>WHAT THIS MEANS FOR YOU</div>
              <div style={{fontFamily:'var(--f)',fontSize:10,color:'var(--tx)',lineHeight:1.6}}>
                Your current rate: <span style={{color:epoch.color,fontWeight:700}}>{effectiveRate.toFixed(3)} FRG/s</span>
              </div>
              {nextEpoch && (
                <div style={{fontFamily:'var(--f)',fontSize:10,color:'var(--tx3)',marginTop:3,lineHeight:1.6}}>
                  After next halving: <span style={{color:'var(--red)',fontWeight:700}}>{(effectiveRate * nextEpoch.rate / epoch.rate).toFixed(3)} FRG/s</span>
                  <span style={{color:'var(--tx3)'}}> (−50%)</span>
                </div>
              )}
              <div style={{fontFamily:'var(--f)',fontSize:9,color:'var(--tx3)',marginTop:6,lineHeight:1.5}}>
                Early miners lock in higher rates forever. Every user who joins after the next halving earns half what you earn today.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══ FEATURE 1: FROZEN BALANCE / COOLING WARNING ═══ */
function CoolingWarning({ hoursInactive, onMine }) {
  const pct = Math.min(100, ((hoursInactive - 20) / 4) * 100); // 20h → 24h = 0→100%
  const urgent = hoursInactive >= 23;
  return (
    <div style={{margin:'0 0 14px',borderRadius:14,overflow:'hidden',border:`1px solid ${urgent?'rgba(224,85,85,.5)':'rgba(232,184,75,.35)'}`,background:urgent?'rgba(224,85,85,.06)':'rgba(232,184,75,.04)',animation:urgent?'gblink 1.4s ease infinite alternate':'none'}}>
      <div style={{padding:'13px 15px 10px',display:'flex',alignItems:'center',gap:11}}>
        <div style={{position:'relative',flexShrink:0}}>
          <div style={{width:40,height:40,borderRadius:10,background:urgent?'rgba(224,85,85,.15)':'rgba(232,184,75,.12)',border:`1px solid ${urgent?'rgba(224,85,85,.4)':'rgba(232,184,75,.3)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>
            {urgent?'🧊':'⚠️'}
          </div>
          {urgent&&<div style={{position:'absolute',top:-3,right:-3,width:10,height:10,borderRadius:'50%',background:'#e05555',border:'2px solid var(--bg)',animation:'sdot 1s infinite'}}/>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:'var(--f)',fontSize:11,fontWeight:700,color:urgent?'#e05555':'var(--green)',letterSpacing:'.06em',marginBottom:2}}>
            {urgent?'⚠️ NODE COOLING DOWN':'NODE COOLING WARNING'}
          </div>
          <div style={{fontFamily:'var(--f)',fontSize:9,color:'var(--tx3)',lineHeight:1.5}}>
            {urgent
              ?<>Your node has been inactive <span style={{color:'#e05555',fontWeight:700}}>{Math.floor(hoursInactive)}h</span>. Balance protection at risk.</>
              :<>Inactive for <span style={{color:'var(--green)',fontWeight:700}}>{Math.floor(hoursInactive)}h</span>. Mine now to protect your position.</>
            }
          </div>
        </div>
        <button onClick={onMine} style={{flexShrink:0,padding:'8px 14px',borderRadius:8,background:urgent?'var(--red)':'var(--green)',color:'#000',fontFamily:'var(--f)',fontSize:9,fontWeight:700,border:'none',cursor:'pointer',letterSpacing:'.06em'}}>
          MINE NOW
        </button>
      </div>
      {/* Cooling progress bar */}
      <div style={{padding:'0 15px 12px'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontFamily:'var(--f)',fontSize:8,color:'var(--tx3)'}}>cooling progress</span>
          <span style={{fontFamily:'var(--f)',fontSize:8,color:urgent?'#e05555':'var(--green)'}}>{Math.floor(24-hoursInactive)}h left before full cooling</span>
        </div>
        <div style={{height:5,borderRadius:3,background:'var(--card)',overflow:'hidden'}}>
          <div style={{height:'100%',width:`${pct}%`,borderRadius:3,background:urgent?'linear-gradient(90deg,#e05555,#ff7070)':'linear-gradient(90deg,var(--green),#ffdd88)',transition:'width .5s'}}/>
        </div>
      </div>
    </div>
  );
}

/* ═══ FEATURE 3: NODE UPGRADE VISUAL IDENTITY ═══ */
function NodeIdentityCard({ upgrades={}, purchased={}, effectiveRate=0.1, mining=false }) {
  const totalLevels = Object.values(upgrades).reduce((a,b)=>a+(b||0),0);
  const hasPerm = purchased['speed_perm']||purchased?.includes?.('speed_perm');
  const hasAuto = Object.keys(purchased).some(k=>k.includes('auto'))||purchased?.includes?.('auto_lifetime');

  // Determine node tier based on total upgrade levels
  const tier = totalLevels===0?0:totalLevels<=3?1:totalLevels<=8?2:totalLevels<=14?3:totalLevels<=20?4:5;
  const tiers = [
    {name:'GENESIS NODE',    color:'#71717a', glow:'rgba(113,113,122,.3)',  icon:'◈', desc:'Base configuration'},
    {name:'SPARK NODE',      color:'#e8b84b', glow:'rgba(232,184,75,.3)',   icon:'◉', desc:'First upgrades installed'},
    {name:'PLASMA NODE',     color:'#e06c4c', glow:'rgba(224,108,76,.35)',  icon:'◎', desc:'Multi-core processing'},
    {name:'QUANTUM NODE',    color:'#5ba8e8', glow:'rgba(91,168,232,.35)',  icon:'⬡', desc:'Quantum-enabled'},
    {name:'DARK MATTER NODE',color:'#c07cf0', glow:'rgba(192,124,240,.4)',  icon:'✦', desc:'Anti-matter collision'},
    {name:'SINGULARITY NODE',color:'#ffffff', glow:'rgba(255,255,255,.35)', icon:'⊕', desc:'Space-time compression'},
  ];
  const t = tiers[tier];
  const [r,g,b] = [parseInt(t.color.slice(1,3),16),parseInt(t.color.slice(3,5),16),parseInt(t.color.slice(5,7),16)];

  return (
    <div style={{margin:'0 0 14px',borderRadius:14,border:`1px solid rgba(${r},${g},${b},.25)`,background:`rgba(${r},${g},${b},.04)`,overflow:'hidden',position:'relative'}}>
      {/* Top shimmer line */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${t.color}88,transparent)`}}/>
      <div style={{padding:'14px 15px',display:'flex',alignItems:'center',gap:12}}>
        {/* Node icon with glow */}
        <div style={{position:'relative',flexShrink:0}}>
          <div style={{width:52,height:52,borderRadius:13,background:`rgba(${r},${g},${b},.12)`,border:`1.5px solid rgba(${r},${g},${b},.4)`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:mining?`0 0 20px ${t.glow}`:undefined,transition:'box-shadow .4s'}}>
            <span style={{fontFamily:'var(--f)',fontSize:22,color:t.color,filter:mining?`drop-shadow(0 0 8px ${t.color})`:'none',transition:'filter .4s',animation:mining?'breathe 2s ease infinite':'none'}}>{t.icon}</span>
          </div>
          {mining&&<div style={{position:'absolute',inset:-2,borderRadius:15,border:`1px solid rgba(${r},${g},${b},.3)`,animation:'breathe 2s ease infinite'}}/>}
        </div>
        {/* Node info */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:3}}>
            <span style={{fontFamily:'var(--f)',fontSize:11,fontWeight:700,color:t.color,letterSpacing:'.06em'}}>{t.name}</span>
            {mining&&<div style={{width:5,height:5,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 6px var(--green)',animation:'sdot 2s infinite'}}/>}
          </div>
          <div style={{fontFamily:'var(--f)',fontSize:9,color:'var(--tx3)',marginBottom:6}}>{t.desc}</div>
          {/* Upgrade pips per module */}
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {UPGRADES.map(u=>{
              const lv=upgrades[u.id]||upgrades[String(u.id)]||0;
              return(
                <div key={u.id} style={{display:'flex',gap:2,alignItems:'center'}}>
                  {Array.from({length:u.maxLevel},(_,i)=>(
                    <div key={i} style={{width:6,height:6,borderRadius:1,background:i<lv?u.color:'var(--card)',border:`1px solid ${i<lv?u.color+'60':'var(--br)'}`,boxShadow:i<lv&&mining?`0 0 4px ${u.color}80`:undefined,transition:'all .3s'}}/>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        {/* Rate display */}
        <div style={{textAlign:'right',flexShrink:0}}>
          <div style={{fontFamily:'var(--f)',fontSize:16,fontWeight:700,color:t.color,lineHeight:1,filter:mining?`drop-shadow(0 0 8px ${t.color}50)`:undefined}}>{effectiveRate.toFixed(2)}</div>
          <div style={{fontFamily:'var(--f)',fontSize:8,color:'var(--tx3)'}}>FRG/SEC</div>
          {hasPerm&&<div style={{fontFamily:'var(--f)',fontSize:7,color:'#c07cf0',marginTop:3}}>2× CORE</div>}
          {hasAuto&&<div style={{fontFamily:'var(--f)',fontSize:7,color:'var(--green)',marginTop:1}}>AUTO ●</div>}
        </div>
      </div>
    </div>
  );
}

/* ═══ FEATURE 6: GENESIS BADGE + EARLY MINER STATUS ═══ */
function GenesisBadgeCard({ totalUsers=0, hasGenesis=false, onInvite }) {
  const GENESIS_CAP = 10000;
  const spotsLeft = Math.max(0, GENESIS_CAP - totalUsers);
  const pct = Math.min(100, (totalUsers / GENESIS_CAP) * 100);
  const isAlmostFull = pct > 85;

  if (hasGenesis) {
    return (
      <div style={{margin:'0 0 14px',borderRadius:14,border:'1px solid rgba(232,184,75,.35)',background:'rgba(232,184,75,.05)',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,#e8b84b88,transparent)'}}/>
        <div style={{padding:'13px 15px',display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:44,height:44,borderRadius:11,background:'rgba(232,184,75,.15)',border:'1.5px solid rgba(232,184,75,.5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,boxShadow:'0 0 16px rgba(232,184,75,.25)',flexShrink:0}}>⭐</div>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
              <span style={{fontFamily:'var(--f)',fontSize:11,fontWeight:700,color:'var(--green)',letterSpacing:'.06em'}}>GENESIS MINER</span>
              <span style={{fontFamily:'var(--f)',fontSize:8,background:'rgba(232,184,75,.2)',color:'var(--green)',border:'1px solid rgba(232,184,75,.4)',borderRadius:4,padding:'1px 6px'}}>LOCKED IN</span>
            </div>
            <div style={{fontFamily:'var(--f)',fontSize:9,color:'var(--tx3)',lineHeight:1.5}}>
              You joined before 10K users. <span style={{color:'var(--green)'}}>+1.1× permanent rate bonus</span> and exclusive Genesis NFT at listing.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{margin:'0 0 14px',borderRadius:14,border:`1px solid ${isAlmostFull?'rgba(224,85,85,.4)':'rgba(232,184,75,.25)'}`,background:isAlmostFull?'rgba(224,85,85,.04)':'rgba(232,184,75,.03)',overflow:'hidden',position:'relative'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${isAlmostFull?'rgba(224,85,85,.6)':'rgba(232,184,75,.5)'},transparent)`}}/>
      <div style={{padding:'13px 15px 10px'}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:11,marginBottom:10}}>
          <div style={{width:44,height:44,borderRadius:11,background:isAlmostFull?'rgba(224,85,85,.12)':'rgba(232,184,75,.1)',border:`1.5px solid ${isAlmostFull?'rgba(224,85,85,.4)':'rgba(232,184,75,.3)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
            {isAlmostFull?'🔥':'⭐'}
          </div>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:3}}>
              <span style={{fontFamily:'var(--f)',fontSize:11,fontWeight:700,color:isAlmostFull?'#e05555':'var(--green)',letterSpacing:'.06em'}}>GENESIS BADGE</span>
              {isAlmostFull&&<span style={{fontFamily:'var(--f)',fontSize:8,background:'rgba(224,85,85,.2)',color:'#e05555',border:'1px solid rgba(224,85,85,.4)',borderRadius:4,padding:'1px 6px',animation:'cf 1s infinite'}}>CLOSING SOON</span>}
            </div>
            <div style={{fontFamily:'var(--f)',fontSize:9,color:'var(--tx3)',lineHeight:1.5}}>
              First <span style={{color:'var(--green)',fontWeight:700}}>10,000 miners</span> get a permanent <span style={{color:'var(--green)',fontWeight:700}}>+1.1× rate bonus</span> and exclusive Genesis NFT. After 10K users — gone forever.
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{marginBottom:8}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontFamily:'var(--f)',fontSize:8,color:'var(--tx3)'}}>{totalUsers.toLocaleString()} / 10,000 miners</span>
            <span style={{fontFamily:'var(--f)',fontSize:8,color:isAlmostFull?'#e05555':'var(--green)',fontWeight:700}}>{spotsLeft.toLocaleString()} spots left</span>
          </div>
          <div style={{height:6,borderRadius:3,background:'var(--card)',overflow:'hidden',position:'relative'}}>
            <div style={{height:'100%',width:`${pct}%`,borderRadius:3,background:isAlmostFull?'linear-gradient(90deg,#e05555,#ff9090)':'linear-gradient(90deg,var(--green),#ffe08a)',transition:'width .8s ease'}}>
              <div style={{position:'absolute',right:0,top:0,bottom:0,width:2,background:isAlmostFull?'#e05555':'var(--green)',boxShadow:isAlmostFull?'0 0 8px #e05555':'0 0 8px var(--green)'}}/>
            </div>
          </div>
        </div>
        <button onClick={onInvite} style={{width:'100%',padding:'9px',borderRadius:9,background:isAlmostFull?'rgba(224,85,85,.15)':'rgba(232,184,75,.1)',border:`1px solid ${isAlmostFull?'rgba(224,85,85,.35)':'rgba(232,184,75,.3)'}`,color:isAlmostFull?'#e05555':'var(--green)',fontFamily:'var(--f)',fontSize:9,fontWeight:700,cursor:'pointer',letterSpacing:'.08em'}}>
          👥 INVITE FRIENDS BEFORE IT CLOSES →
        </button>
      </div>
    </div>
  );
}

/* ═══ FEATURE 8: WALLET CONNECTION REWARD ═══ */
function WalletRewardCard({ connected=false, claimed=false, onConnect }) {
  if (connected && claimed) return null; // Already done — hide completely
  return (
    <div style={{margin:'0 0 14px',borderRadius:14,border:'1px solid rgba(91,168,232,.3)',background:'rgba(91,168,232,.04)',overflow:'hidden',position:'relative'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(91,168,232,.6),transparent)'}}/>
      <div style={{padding:'13px 15px',display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:44,height:44,borderRadius:11,background:'rgba(91,168,232,.12)',border:'1.5px solid rgba(91,168,232,.35)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,boxShadow:'0 0 14px rgba(91,168,232,.2)'}}>💎</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:3}}>
            <span style={{fontFamily:'var(--f)',fontSize:11,fontWeight:700,color:'#5096ff',letterSpacing:'.06em'}}>VERIFY YOUR WALLET</span>
            <span style={{fontFamily:'var(--f)',fontSize:8,background:'rgba(91,168,232,.15)',color:'#5096ff',border:'1px solid rgba(91,168,232,.3)',borderRadius:4,padding:'1px 6px'}}>ONE-TIME</span>
          </div>
          <div style={{fontFamily:'var(--f)',fontSize:9,color:'var(--tx3)',lineHeight:1.5}}>
            Connect your TON wallet and receive <span style={{color:'#5096ff',fontWeight:700}}>+10,000 FRG</span> instantly + Verified Miner badge.
          </div>
        </div>
        <button onClick={onConnect} style={{flexShrink:0,padding:'8px 14px',borderRadius:8,background:'rgba(91,168,232,.15)',border:'1px solid rgba(91,168,232,.4)',color:'#5096ff',fontFamily:'var(--f)',fontSize:9,fontWeight:700,cursor:'pointer',letterSpacing:'.06em',whiteSpace:'nowrap'}}>
          CONNECT →
        </button>
      </div>
    </div>
  );
}

/* ═══ GENESIS HERO ═══ */
function GenesisHero({ totalUsers=0, onInvite }) {
  const CAP = 10000;
  const pct = Math.min(100, (totalUsers / CAP) * 100);
  const spotsLeft = Math.max(0, CAP - totalUsers);
  const urgent = pct > 80;
  return (
    <div style={{marginBottom:12,borderRadius:14,overflow:'hidden',background:'var(--card)',border:'1px solid var(--br)'}}>
      <div style={{padding:'18px 18px 16px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:'var(--tx)',marginBottom:2}}>Genesis Badge</div>
            <div style={{fontSize:11,color:'var(--tx3)',fontWeight:500}}>First 10,000 miners only</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:18,fontWeight:800,color:urgent?'var(--red)':'var(--green)',lineHeight:1}}>{spotsLeft.toLocaleString()}</div>
            <div style={{fontSize:9,color:'var(--tx3)',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase',marginTop:2}}>spots left</div>
          </div>
        </div>
        <div style={{height:3,borderRadius:2,background:'var(--card3)',marginBottom:14,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${pct}%`,borderRadius:2,background:urgent?'var(--red)':'var(--green)',transition:'width .8s'}}/>
        </div>
        <div style={{fontSize:12,color:'var(--tx3)',lineHeight:1.6,marginBottom:16}}>
          Permanent <span style={{color:'var(--tx)',fontWeight:700}}>+1.1× mining rate</span> and Genesis NFT at listing. After 10K users — gone forever.
        </div>
        <button onClick={onInvite} style={{width:'100%',padding:14,borderRadius:14,background:'var(--green)',border:'none',color:'#000',fontSize:14,fontWeight:800,cursor:'pointer',letterSpacing:'.01em'}}>
          Invite Friends → Lock In Your Spot
        </button>
      </div>
    </div>
  );
}

/* ═══ HALVING DROPDOWN ═══ */
function HalvingDropdown({effectiveRate, totalUsers, onInvite}){
  const [open,setOpen]=useState(false);
  const milestones=[
    {users:0,     label:'Now',   rate:1,      c:'#00c37b'},
    {users:1000,  label:'1K',    rate:0.5,    c:'#7ed957'},
    {users:10000, label:'10K',   rate:0.25,   c:'#ffc100'},
    {users:100000,label:'100K',  rate:0.125,  c:'#ff8c42'},
    {users:1e6,   label:'1M',    rate:0.0625, c:'#ff6b3d'},
    {users:1e8,   label:'100M',  rate:0.03125,c:'#ff4d4d'},
  ];
  const curIdx=milestones.reduce((a,m,i)=>totalUsers>=m.users?i:a,0);
  const cur=milestones[curIdx];
  const next=milestones[curIdx+1];
  const spotsToNext=next?next.users-totalUsers:0;
  const pct=next?Math.min(100,((totalUsers-cur.users)/(next.users-cur.users))*100):100;

  return(
    <div style={{borderBottom:'none'}}>
      {/* Header row — always visible */}
      <div onClick={()=>setOpen(o=>!o)} style={{padding:'16px 20px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',WebkitTapHighlightColor:'transparent',position:'relative',overflow:'hidden'}}>
        {/* Hooded figure watching the chart drop */}
        <svg style={{position:'absolute',right:44,top:0,bottom:0,opacity:.055,pointerEvents:'none'}} width="80" height="70" viewBox="0 0 80 70">
          <path d="M40 4 Q22 8 18 22 Q14 36 16 48 Q24 60 40 62 Q56 60 64 48 Q66 36 62 22 Q58 8 40 4Z" fill="#111" stroke="#fff" strokeWidth=".7"/>
          <ellipse cx="40" cy="34" rx="14" ry="10" fill="#0d0d0d" stroke="#ff4d4d" strokeWidth=".6"/>
          <circle cx="34" cy="32" r="2.5" fill="#ff4d4d" opacity=".5"/>
          <circle cx="46" cy="32" r="2.5" fill="#ff4d4d" opacity=".5"/>
          <path d="M40 4 Q32 14 30 26" fill="none" stroke="#fff" strokeWidth=".4" opacity=".4"/>
          <path d="M40 4 Q48 14 50 26" fill="none" stroke="#fff" strokeWidth=".4" opacity=".4"/>
          {/* Falling arrow */}
          <line x1="68" y1="8" x2="74" y2="28" stroke="#ff4d4d" strokeWidth=".8"/>
          <polygon points="74,28 70,22 78,22" fill="#ff4d4d" opacity=".6"/>
        </svg>
        {/* Creepy mining illustration */}
        <svg style={{position:'absolute',right:50,top:'50%',transform:'translateY(-50%)',opacity:.04}} width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="24" fill="none" stroke="#fff" strokeWidth="1.2"/>
          <circle cx="30" cy="30" r="15" fill="none" stroke="#fff" strokeWidth=".8"/>
          <circle cx="30" cy="30" r="7" fill="none" stroke="#fff" strokeWidth=".6"/>
          <circle cx="30" cy="30" r="2" fill="#fff" opacity=".5"/>
          {Array.from({length:8},(_,i)=>{const a=i*45*Math.PI/180;const x1=30+15*Math.cos(a);const y1=30+15*Math.sin(a);const x2=30+24*Math.cos(a);const y2=30+24*Math.sin(a);return<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth=".5" opacity=".4"/>})}
        </svg>
        <div style={{width:36,height:36,borderRadius:8,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="1" y="12" width="8" height="7" rx="1.5" fill="#00c37b" opacity=".9"/>
            <rect x="2" y="13" width="3" height="2" rx=".5" fill="rgba(0,0,0,.3)"/>
            <rect x="6" y="13" width="2" height="2" rx=".5" fill="rgba(0,0,0,.3)"/>
            <line x1="6" y1="12" x2="16" y2="3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M14 1.5 L18.5 3.5 L17 6 L12.5 4.5 Z" fill="#fff"/>
            <circle cx="10" cy="11" r="1.2" fill="#ffc100"/>
            <line x1="11.5" y1="9.5" x2="13.5" y2="8" stroke="#ffc100" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:2}}>Mining Rate Halving</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.22)'}}>
            {next?<>Next halving in <span style={{color:cur.c,fontWeight:600}}>{spotsToNext.toLocaleString()} users</span></>:<span style={{color:'rgba(255,77,77,.6)'}}>Final halving reached</span>}
          </div>
        </div>
        {/* Progress arc */}
        <div style={{textAlign:'center',flexShrink:0}}>
          <div style={{fontSize:11,fontWeight:800,color:cur.c}}>{(cur.rate*100).toFixed(1)}%</div>
          <div style={{fontSize:8,color:'rgba(255,255,255,.2)',marginTop:1,fontWeight:500}}>of max</div>
        </div>
        <span style={{fontSize:12,color:'rgba(255,255,255,.2)',transition:'transform .2s',display:'inline-block',transform:open?'rotate(180deg)':'none',flexShrink:0}}>▾</span>
      </div>

      {/* Progress bar — always visible */}
      {next&&(
        <div style={{padding:'0 20px 12px'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontSize:9,color:'rgba(255,255,255,.18)',fontFamily:"'SF Mono',monospace"}}>{totalUsers.toLocaleString()} users now</span>
            <span style={{fontSize:9,color:cur.c,fontFamily:"'SF Mono',monospace",fontWeight:600}}>halves at {next.users.toLocaleString()}</span>
          </div>
          <div style={{height:3,borderRadius:100,background:'rgba(255,255,255,.05)',overflow:'hidden',marginBottom:10}}>
            <div style={{height:'100%',width:`${pct}%`,borderRadius:100,background:cur.c,transition:'width .6s'}}/>
          </div>
          {/* Minimal invite nudge — always visible on halving card */}
          <div onClick={onInvite} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:7,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><circle cx="5" cy="4" r="2.5" fill="#00c37b" opacity=".7"/><circle cx="9" cy="4" r="2.5" fill="#00c37b" opacity=".5"/><path d="M1 11 Q1 8 5 8 Q9 8 9 11" fill="#00c37b" opacity=".7"/><path d="M9 8 Q13 8 13 11" fill="#00c37b" opacity=".4"/></svg>
            <span style={{fontSize:10,color:'rgba(255,255,255,.3)',flex:1}}>Invite friends to build the network</span>
            <span style={{fontSize:10,fontWeight:600,color:'rgba(0,195,123,.5)'}}>Invite →</span>
          </div>
        </div>
      )}

      {/* Expanded content */}
      {open&&(
        <div style={{borderTop:'1px solid rgba(255,255,255,.05)'}}>
          {/* Key message */}
          <div style={{padding:'14px 20px',background:'rgba(255,50,50,.03)',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
            <div style={{fontSize:12,fontWeight:700,color:'#fff',marginBottom:5}}>Everyone's mining rate halves — not your balance</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.35)',lineHeight:1.65}}>
              <span style={{color:'rgba(0,195,123,.9)',fontWeight:700}}>Your earned FRG balance is always safe</span> — halving never touches it. Only your <span style={{color:'#fff',fontWeight:600}}>future earning rate</span> halves when the next user milestone is hit. This affects every miner equally — base rate, upgrades, and auto-mine all halve together.
            </div>
          </div>

          {/* Step chart */}
          <div style={{padding:'14px 20px 10px'}}>
            <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.2)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:10}}>Rate at each milestone</div>
            <div style={{position:'relative',height:110}}>
              <svg width="100%" height="100" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  {milestones.slice(0,-1).map((_,i)=>(
                    <linearGradient key={i} id={`hg${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={milestones[i].c} stopOpacity=".4"/>
                      <stop offset="100%" stopColor={milestones[i].c} stopOpacity=".04"/>
                    </linearGradient>
                  ))}
                </defs>
                {/* Y labels */}
                {[{v:'100%',y:8},{v:'50%',y:33},{v:'25%',y:58},{v:'12%',y:78}].map((l,i)=>(
                  <text key={i} x="0" y={l.y} fontSize="6.5" fill="rgba(255,255,255,.18)" fontFamily="monospace">{l.v}</text>
                ))}
                {/* Bars — 5 steps */}
                {[
                  {x:28,w:40,y:6,h:88,gi:0},
                  {x:68,w:40,y:30,h:64,gi:1},
                  {x:108,w:40,y:56,h:38,gi:2},
                  {x:148,w:40,y:76,h:18,gi:3},
                  {x:188,w:40,y:88,h:6,gi:4},
                  {x:228,w:72,y:94,h:0,gi:5},
                ].map((b,i)=>{
                  const m=milestones[i];
                  const isYou=i===curIdx;
                  return(<g key={i}>
                    {i>0&&<line x1={b.x} y1={milestones[i-1].y||[6,30,56,76,88,94][i-1]} x2={b.x} y2={b.y} stroke="rgba(255,255,255,.06)" strokeWidth="1" strokeDasharray="3 3"/>}
                    <rect x={b.x} y={b.y} width={b.w} height={b.h+4} fill={`url(#hg${Math.min(b.gi,4)})`}/>
                    <line x1={b.x} y1={b.y} x2={b.x+b.w} y2={b.y} stroke={m.c} strokeWidth={isYou?2.5:1.5} opacity={isYou?1:.6}/>
                    {isYou&&<><circle cx={b.x+b.w/2} cy={b.y} r="4.5" fill="none" stroke={m.c} strokeWidth="1.8"/><circle cx={b.x+b.w/2} cy={b.y} r="2" fill={m.c}/><text x={b.x+b.w/2} y={b.y-6} fontSize="7" fill={m.c} textAnchor="middle" fontWeight="700">YOU</text></>}
                  </g>);
                })}
              </svg>
              {/* X labels */}
              <div style={{position:'absolute',bottom:0,left:28,right:0,display:'flex',fontSize:8,fontFamily:'monospace'}}>
                {milestones.map((m,i)=>(
                  <div key={i} style={{width:i<5?40:72,textAlign:'center',color:i===curIdx?m.c:'rgba(255,255,255,.25)',fontWeight:i===curIdx?700:400}}>{m.label}</div>
                ))}
              </div>
            </div>
          </div>

          {/* What halves */}
          <div style={{padding:'0 20px 14px'}}>
            <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.2)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>Everything that halves</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {[
                {e:'⛏',t:'Base mining rate',d:'0.1 FRG/s base halves for everyone'},
                {e:'◈',t:'All upgrade bonuses',d:'Neural Boost, Plasma Array — all halved'},
                {e:'⬡',t:'Block rewards',d:'FRG earned per block found → halved'},
                {e:'⏱',t:'Block time +50%',d:'Harder to find blocks after each halving'},
                {e:'🔒',t:'Your balance — always safe',d:'Earned FRG is yours forever, halving never touches it'},
              ].map((p,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 10px',background:'rgba(255,255,255,.02)',borderRadius:6,border:'1px solid rgba(255,255,255,.04)'}}>
                  <span style={{fontSize:15,flexShrink:0}}>{p.e}</span>
                  <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:'#fff',marginBottom:1}}>{p.t}</div><div style={{fontSize:10,color:'rgba(255,255,255,.25)'}}>{p.d}</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* Rate comparison */}
          <div style={{padding:'0 20px 14px',display:'flex',gap:8}}>
            <div style={{flex:1,padding:'10px',background:'rgba(0,195,123,.05)',border:'1px solid rgba(0,195,123,.12)',borderRadius:7}}>
              <div style={{fontSize:9,color:'rgba(0,195,123,.6)',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:4}}>Your rate now</div>
              <div style={{fontSize:18,fontWeight:800,color:'#00c37b',fontFamily:"'SF Mono',monospace"}}>{effectiveRate.toFixed(3)}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,.2)',marginTop:1}}>FRG/s</div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:24,flexShrink:0}}>
              <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7h8M8 4l3 3-3 3" stroke="rgba(255,255,255,.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{flex:1,padding:'10px',background:'rgba(255,77,77,.05)',border:'1px solid rgba(255,77,77,.12)',borderRadius:7}}>
              <div style={{fontSize:9,color:'rgba(255,77,77,.6)',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:4}}>After next halving</div>
              <div style={{fontSize:18,fontWeight:800,color:'#ff4d4d',fontFamily:"'SF Mono',monospace"}}>{(effectiveRate/2).toFixed(3)}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,.2)',marginTop:1}}>FRG/s</div>
            </div>
          </div>

          <div style={{padding:'0 20px 16px'}}>
            <button onClick={onInvite} style={{width:'100%',padding:'12px',borderRadius:8,background:'#00c37b',border:'none',color:'#000',fontSize:13,fontWeight:800,cursor:'pointer'}}>
              Invite Friends → Build Your Team
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ NODE EXPANDABLE ═══ */
function NodeExpandable({t,r,g,b,mining,effectiveRate,hasAutoMine,purchased,upgrades,activeModules,onUpgrade}){
  const [open,setOpen]=useState(false);
  return(
    <div style={{borderRadius:16,border:'1px solid var(--br)',background:'var(--card)',marginBottom:12,overflow:'hidden'}}>
      <div onClick={()=>setOpen(o=>!o)} style={{padding:'14px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
        <div style={{width:44,height:44,borderRadius:12,background:'var(--card2)',border:'1px solid var(--br)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:mining?'0 0 16px rgba(0,195,123,.15)':'none',transition:'box-shadow .5s'}}>
          <span style={{fontSize:20,color:mining?'var(--green)':'var(--tx3)',animation:mining?'breathe 2.5s ease infinite':'none',transition:'color .5s'}}>{t.icon}</span>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
            <span style={{fontSize:13,fontWeight:700,color:'var(--tx)'}}>{t.name}</span>
            {mining&&<div style={{width:5,height:5,borderRadius:'50%',background:'var(--green)',animation:'sdot 2s infinite',flexShrink:0}}/>}
          </div>
          <div style={{fontSize:11,color:'var(--tx3)',fontWeight:500}}>
            {activeModules}/5 modules · {hasAutoMine&&<span style={{color:'var(--green)'}}>auto-mine · </span>}{purchased['speed_perm']&&<span style={{color:'#b464ff'}}>2× core · </span>}{effectiveRate.toFixed(3)} FRG/s
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:20,fontWeight:800,color:mining?'var(--green)':'var(--tx)',lineHeight:1,transition:'color .5s'}}>{effectiveRate.toFixed(2)}</div>
            <div style={{fontSize:9,color:'var(--tx3)',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase'}}>FRG/s</div>
          </div>
          <span style={{fontSize:12,color:'var(--tx3)',transition:'transform .2s',display:'inline-block',transform:open?'rotate(180deg)':'none'}}>▾</span>
        </div>
      </div>
      {open&&(
        <div style={{borderTop:'1px solid var(--br)',padding:'10px 16px 8px'}}>
          {UPGRADES.map(u=>{
            const lv=upgrades[u.id]||upgrades[String(u.id)]||0;
            const isMaxed=lv>=u.maxLevel;
            return(
              <div key={u.id} onClick={onUpgrade} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid var(--br)',cursor:'pointer'}}>
                <div style={{width:32,height:32,borderRadius:9,background:'var(--card2)',border:'1px solid var(--br)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0,color:lv>0?'var(--green)':'var(--tx3)'}}>{u.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:600,color:lv>0?'var(--tx)':'var(--tx3)'}}>{u.name}</span>
                    {isMaxed&&<span style={{fontSize:8,color:'var(--green)',fontWeight:700,background:'var(--green-dim)',borderRadius:3,padding:'1px 5px'}}>MAX</span>}
                  </div>
                  <div style={{display:'flex',gap:3}}>
                    {Array.from({length:u.maxLevel},(_,i)=>(
                      <div key={i} style={{height:2.5,flex:1,borderRadius:2,background:i<lv?'var(--green)':'var(--card3)',transition:'all .3s'}}/>
                    ))}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:11,fontWeight:700,color:lv>0?'var(--tx)':'var(--tx3)'}}>{lv>0?`${lv}/${u.maxLevel}`:'—'}</div>
                  <div style={{fontSize:9,color:'var(--tx3)',fontWeight:500}}>+{u.rateBonus}/s</div>
                </div>
              </div>
            );
          })}
          <div onClick={onUpgrade} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'12px',cursor:'pointer'}}>
            <span style={{fontSize:12,fontWeight:700,color:'var(--green)'}}>Upgrade Node →</span>
          </div>
        </div>
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
  const [referralEarnings,setReferralEarnings]=useState(0);
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
  const [showLegacy,setLegacy]=useState(false);
  const [simRefs,setSimRefs]=useState(0);
  const [refCode,setRefCode]=useState('');
  const [refList,setRefList]=useState([]);
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
  const [totalUsers,setTotalUsers]=useState(null);
  // Feature states
  const [walletBonusClaimed,setWalletBonusClaimed]=useState(()=>!!localStorage.getItem('forge_wallet_bonus'));
  const [genesisBadge,setGenesisBadge]=useState(()=>!!localStorage.getItem('forge_genesis_badge'));
  const [coolingWarning,setCoolingWarning]=useState(false);
  const [lastActiveAt,setLastActiveAt]=useState(()=>Number(localStorage.getItem('forge_last_active'))||Date.now());
  const [storeTab,setStoreTab]=useState('all');
  const [teamTab,setTeamTab]=useState('refer');
  const [walletMenuOpen,setWalletMenuOpen]=useState(false);
  const pid=useRef(0);
  const mineR=useRef(null),sesR=useRef(null),boostR=useRef(null);
  const circleRef=useRef(null);
  const prevBal=useRef(0),prevBlocks=useRef(0),prevMining=useRef(false);

  const showToast=useCallback((icon,title,sub)=>{setToast({icon,title,sub});setTimeout(()=>setToast(null),3200);},[])

  // Buy a Stars item — fetches invoice link from bot, opens Telegram payment
  const buyWithStars=useCallback(async(itemId)=>{
    try{
      const tg=window?.Telegram?.WebApp;
      const d=await api.store.getInvoice(itemId);
      if(!d.ok||!d.invoiceLink) throw new Error(d.error||'Failed to get invoice');
      if(tg?.openInvoice){
        tg.openInvoice(d.invoiceLink,(status)=>{
          if(status==='paid'){showToast('⭐','Payment successful!','Item will activate shortly');}
          else if(status==='cancelled'){showToast('✕','Cancelled','No charge was made');}
          else if(status==='failed'){showToast('❌','Payment failed','Please try again');}
        });
      } else {
        window.open(d.invoiceLink,'_blank');
      }
    }catch(e){
      showToast('❌','Stars payment failed',e.message);
      console.error('buyWithStars error:',e);
    }
  },[showToast]);
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
        if(user.referralCode) setRefCode(user.referralCode);
        // Load real referral earnings on init
        try{
          const refInfo = await api.referrals.getInfo();
          setSimRefs(refInfo.ref_count||refInfo.referralCount||0);
          if(refInfo.ref_code||refInfo.referralCode) setRefCode(refInfo.ref_code||refInfo.referralCode);
          if(typeof refInfo.referral_earnings==='number') setReferralEarnings(refInfo.referral_earnings);
        }catch(e){}
        // Load real daily streak from server
        try{
          const dailyData = await api.profile.getDailyReward();
          setStreak(dailyData.streak||0);
        }catch(e){}
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
      // Check wallet bonus status from server (source of truth, overrides localStorage)
      try{
        const walletData = await api.wallet.getWallet();
        if(walletData.bonusClaimed){
          setWalletBonusClaimed(true);
          localStorage.setItem('forge_wallet_bonus','1');
        }
      }catch(e){}
      // Fetch real total users for halving display
      try{
        const statsData = await api.stats.getTotalUsers();
        if(typeof statsData.total_users==='number') setTotalUsers(statsData.total_users);
      }catch(e){}
    }
    init();
  },[]);

  // Fetch notifications on load and when panel opens
  useEffect(()=>{
    api.notifications?.getAll().then(setNotifs).catch(()=>{});
  },[notifOpen]);

  // Cooling warning — show if user hasn't mined in 20+ hours
  useEffect(()=>{
    const check=()=>{
      if(mining) return; // actively mining — no warning
      const hoursInactive=(Date.now()-lastActiveAt)/(1000*60*60);
      setCoolingWarning(hoursInactive>=20);
    };
    check();
    const t=setInterval(check,60000); // check every minute
    return()=>clearInterval(t);
  },[mining,lastActiveAt]);

  // Genesis badge — award when user is among early miners (totalUsers < 10000)
  useEffect(()=>{
    if(!genesisBadge&&totalUsers!==null&&totalUsers<10000&&totalMined>0){
      setGenesisBadge(true);
      localStorage.setItem('forge_genesis_badge','1');
    }
  },[genesisBadge,totalUsers,totalMined]);

  // Wallet bonus — grant when wallet first connected
  const walletBonusGranted=useRef(false);
  useEffect(()=>{
    if(userFriendlyAddress&&!walletBonusClaimed&&!walletBonusGranted.current){
      walletBonusGranted.current=true;
      // Grant bonus balance (frontend-side for now, backend wires this later)
      setBalance(b=>b+10000);
      setTotal(t=>t+10000);
      setWalletBonusClaimed(true);
      localStorage.setItem('forge_wallet_bonus','1');
      showToast('💎','Wallet Verified!','+10,000 FRG credited to your node');
      addLog('info','💎 TON wallet verified — +10,000 FRG bonus');
    }
  },[userFriendlyAddress,walletBonusClaimed,showToast,addLog]);


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
      const RECIPIENT = import.meta.env.VITE_TON_ADDRESS;
      if (!RECIPIENT) {
        showToast('❌', 'Store not configured', 'TON address not set — contact support');
        return;
      }
      const nanoTON=BigInt(Math.round(item.priceTON*1e9));
      const tx=await tonConnectUI.sendTransaction({
        validUntil:Math.floor(Date.now()/1000)+360,
        messages:[{address:RECIPIENT,amount:nanoTON.toString(),payload:''}]
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



  // ── Heartbeat: ping backend every 20s while mining ────────
  useEffect(()=>{
    if(!mining) return;
    const hb = setInterval(()=>{ api.mining.heartbeat().catch(()=>{}); }, 20000);
    return ()=>clearInterval(hb);
  },[mining]);

  // ── Stop mining when app closes / goes to background ──────
  useEffect(()=>{
    const handleStop = ()=>{
      if(mining){
        api.mining.stop().catch(()=>{});
      }
    };
    const handleVisibility = ()=>{
      if(document.visibilityState === 'hidden') handleStop();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleStop);
    // Telegram WebApp close event
    window?.Telegram?.WebApp?.onEvent?.('viewportChanged', ()=>{
      if(window?.Telegram?.WebApp?.viewportStableHeight === 0) handleStop();
    });
    return ()=>{
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleStop);
    };
  },[mining]);

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

  // Refresh mining state when switching to mine tab — sync server balance
  useEffect(()=>{
    if(tab==='mine'&&apiLoaded){
      api.mining.getState().then(s=>{
        // Sync authoritative server balance (prevents drift from local ticker)
        if(typeof s.balance === 'number') setBalance(s.balance);
        if(typeof s.totalMined === 'number') setTotal(s.totalMined);
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
      api.profile.getLeaderboard(50).then(data=>{setLbData(data);if(data?.yourRank)setTotalUsers(data.yourRank+50);}).catch(()=>{});
    }
    if(tab==='refer'){
      // Sync real referral count and claimed tiers from backend
      api.referrals.getTiers().then(tiers=>{
        const claimed=new Set(tiers.filter(t=>t.claimed).map(t=>t.refs));
        setClaimedTiers(claimed);
      }).catch(()=>{});
      api.referrals.getInfo().then(info=>{
        setSimRefs(info.referralCount||info.ref_count||0);
        if(info.referralCode||info.ref_code) setRefCode(info.referralCode||info.ref_code);
        if(typeof info.referral_earnings==='number') setReferralEarnings(info.referral_earnings);
      }).catch(()=>{});
      // Load real friends list
      api.referrals.getList().then(data=>{
        if(data?.refs) setRefList(data.refs);
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
      // Track last active time for cooling mechanic
      const now=Date.now();
      setLastActiveAt(now);
      localStorage.setItem('forge_last_active',now);
      setCoolingWarning(false);
      try{ await api.mining.start(); }catch(e){ console.error('Start error:',e); }
    } else {
      setMining(false);
      const now=Date.now();
      setLastActiveAt(now);
      localStorage.setItem('forge_last_active',now);
      try{
        const res=await api.mining.stop();
        if(res.earned>0){
          if(typeof res.balance==='number') setBalance(res.balance);
          if(typeof res.total_mined==='number') setTotal(res.total_mined);
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
      // Backend returns { ok, frg, reward } — apply FRG bonus to balance
      if(typeof res.frg==='number'){ setBalance(b=>b+res.frg); setTotal(t=>t+res.frg); }
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
  const [streak,setStreak]=useState(0);

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
              <span style={{fontFamily:'var(--f)',fontSize:11,letterSpacing:'.1em',color:'var(--tx3)'}}>NOTIFICATIONS</span>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                {unreadCount>0&&(
                  <span onClick={async()=>{await api.notifications?.markAllRead();setNotifs(n=>n.map(x=>({...x,read:true})));}} style={{fontFamily:'var(--f)',fontSize:9,color:'var(--green)',cursor:'pointer',letterSpacing:'.05em'}}>MARK ALL READ</span>
                )}
                <span onClick={()=>setNotifOpen(false)} style={{fontSize:18,color:'var(--tx3)',cursor:'pointer',lineHeight:1}}>✕</span>
              </div>
            </div>
            {/* List */}
            <div style={{overflowY:'auto',flex:1}}>
              {notifs.length===0?(
                <div style={{padding:'40px 18px',textAlign:'center',color:'var(--tx3)',fontFamily:'var(--f)',fontSize:11}}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{marginBottom:10}}>
                  <path d="M14 2 Q8 2 7 8 Q6 14 4 17 L24 17 Q22 14 21 8 Q20 2 14 2Z" fill="#00c37b" opacity=".2" stroke="#00c37b" strokeWidth="1.2"/>
                  <path d="M4 17 L24 17" stroke="#00c37b" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M11 17 Q11 21 14 21 Q17 21 17 17" fill="#00c37b" opacity=".5"/>
                  <circle cx="14" cy="4" r="2" fill="#00c37b" opacity=".7"/>
                </svg>
                  NO NOTIFICATIONS YET
                </div>
              ):notifs.map(n=>(
                <div key={n.id} onClick={async()=>{if(!n.read){await api.notifications?.markRead(n.id);setNotifs(ns=>ns.map(x=>x.id===n.id?{...x,read:true}:x));}}} style={{display:'flex',gap:12,padding:'13px 18px',borderBottom:'1px solid var(--br)',cursor:n.read?'default':'pointer',background:n.read?'transparent':'rgba(232,184,75,.04)',transition:'background .2s'}}>
                  <div style={{fontSize:22,flexShrink:0,lineHeight:1.2}}>{n.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:3}}>
                      <span style={{fontFamily:'var(--f)',fontSize:11,fontWeight:700,color:n.read?'var(--tx3)':'var(--fg)'}}>{n.title}</span>
                      {!n.read&&<div style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',flexShrink:0}}/>}
                    </div>
                    <div style={{fontSize:12,color:'var(--tx3)',lineHeight:1.5}}>{n.body}</div>
                    <div style={{fontFamily:'var(--f)',fontSize:9,color:'var(--tx3)',marginTop:5,opacity:.6}}>{new Date(n.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
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
            <div style={{background:'#000',minHeight:'100%',position:'relative'}}>

                            {/* ── BACKGROUND ART — Blum-style solid figure ── */}
              <svg style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}} viewBox="0 0 430 900" preserveAspectRatio="xMidYMid slice">
                {/* Dot grid — same as Blum */}
                {Array.from({length:22},(_,i)=>Array.from({length:46},(_,j)=>(
                  <circle key={i*100+j} cx={i*20} cy={j*20} r="1" fill="rgba(255,255,255,.07)"/>
                )))}
                <g opacity=".15">
                {/* Miner figure — SOLID fills, Blum style */}
                {/* Body torso — main mass */}
                <rect x="162" y="520" width="86" height="100" rx="10" fill="#1a1a1a"/>
                {/* Chest plate highlight */}
                <rect x="172" y="530" width="66" height="60" rx="6" fill="#222"/>
                {/* Circuit lines on chest */}
                <line x1="185" y1="545" x2="185" y2="575" stroke="#00c37b" strokeWidth="1.2" opacity=".7"/>
                <line x1="205" y1="540" x2="205" y2="580" stroke="#00c37b" strokeWidth=".8" opacity=".45"/>
                <line x1="225" y1="545" x2="225" y2="575" stroke="#00c37b" strokeWidth="1.2" opacity=".7"/>
                <line x1="185" y1="558" x2="225" y2="558" stroke="#00c37b" strokeWidth=".8" opacity=".4"/>
                {/* Shoulders */}
                <rect x="138" y="522" width="28" height="34" rx="8" fill="#1e1e1e"/>
                <rect x="244" y="522" width="28" height="34" rx="8" fill="#1e1e1e"/>
                {/* Shoulder detail */}
                <rect x="142" y="527" width="20" height="6" rx="2" fill="#2a2a2a"/>
                <rect x="248" y="527" width="20" height="6" rx="2" fill="#2a2a2a"/>
                {/* Arms */}
                <rect x="118" y="540" width="24" height="55" rx="8" fill="#1a1a1a"/>
                <rect x="268" y="540" width="24" height="55" rx="8" fill="#1a1a1a"/>
                {/* Pick hand right */}
                <line x1="292" y1="558" x2="345" y2="510" stroke="#1e1e1e" strokeWidth="10" strokeLinecap="round"/>
                <line x1="292" y1="558" x2="345" y2="510" stroke="#2a2a2a" strokeWidth="6" strokeLinecap="round"/>
                {/* Pick head */}
                <polygon points="345,510 362,494 368,514 350,526" fill="#2a2a2a"/>
                <polygon points="345,510 356,498 360,510" fill="#333"/>
                {/* Legs */}
                <rect x="172" y="618" width="32" height="54" rx="8" fill="#1a1a1a"/>
                <rect x="208" y="618" width="32" height="54" rx="8" fill="#1a1a1a"/>
                {/* Boots */}
                <rect x="165" y="666" width="46" height="16" rx="5" fill="#161616"/>
                <rect x="201" y="666" width="46" height="16" rx="5" fill="#161616"/>
                {/* HEAD */}
                <rect x="170" y="460" width="70" height="66" rx="12" fill="#1a1a1a"/>
                {/* Helmet top ridge */}
                <rect x="175" y="453" width="60" height="12" rx="5" fill="#222"/>
                <rect x="188" y="447" width="34" height="10" rx="4" fill="#1e1e1e"/>
                {/* VISOR — THE ONE GREEN ACCENT */}
                <rect x="178" y="472" width="54" height="20" rx="4" fill="#00c37b" opacity=".18"/>
                <rect x="180" y="474" width="50" height="16" rx="3" fill="#00c37b" opacity=".22"/>
                {/* Visor glow lines */}
                <rect x="183" y="477" width="44" height="4" rx="1" fill="#00c37b" opacity=".6"/>
                <rect x="183" y="484" width="30" height="2" rx="1" fill="#00c37b" opacity=".3"/>
                {/* Chin/jaw */}
                <rect x="180" y="492" width="50" height="12" rx="4" fill="#1e1e1e"/>
                {/* Neck */}
                <rect x="192" y="522" width="26" height="8" rx="3" fill="#161616"/>
                {/* Ground shadow */}
                <ellipse cx="205" cy="684" rx="70" ry="8" fill="#00c37b" opacity=".07"/>
                {/* Floating block particles */}
                <rect x="340" y="490" width="14" height="14" rx="3" fill="#1e1e1e" transform="rotate(15 347 497)"/>
                <rect x="100" y="560" width="11" height="11" rx="2" fill="#1e1e1e" transform="rotate(-20 105 565)"/>
                <rect x="350" y="580" width="9" height="9" rx="2" fill="#1a1a1a" transform="rotate(30 354 584)"/>
                <circle cx="350" cy="497" r="3" fill="#00c37b" opacity=".5"/>
                <circle cx="105" cy="565" r="2" fill="#00c37b" opacity=".35"/>
              </g>
              </svg>

              {/* ── STICKY LOGO BAR ── */}
              <div style={{position:'sticky',top:0,zIndex:200,background:'rgba(0,0,0,.96)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',display:'flex',justifyContent:'center',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                <img src="/forge-logo.png" style={{width:30,height:30,borderRadius:8,objectFit:'cover'}} alt="Forge"/>
              </div>

              {/* ── WALLET POPUP — centered modal ── */}
              {walletMenuOpen&&(
                <div onClick={()=>setWalletMenuOpen(false)} style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,.75)',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 32px'}}>
                  <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:340,background:'#161616',borderRadius:16,padding:'20px',border:'1px solid rgba(255,255,255,.09)'}}>
                    {/* Header */}
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:'#00c37b',flexShrink:0}}/>
                      <span style={{fontSize:13,color:'#00c37b',fontWeight:700}}>Wallet Connected</span>
                    </div>
                    {/* Address */}
                    <div style={{fontSize:10,color:'rgba(255,255,255,.25)',fontFamily:"'SF Mono',monospace",wordBreak:'break-all',lineHeight:1.6,padding:'10px 12px',background:'rgba(255,255,255,.03)',borderRadius:8,border:'1px solid rgba(255,255,255,.06)',marginBottom:16}}>{userFriendlyAddress}</div>
                    {/* Actions */}
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={()=>setWalletMenuOpen(false)} style={{flex:1,padding:'11px',borderRadius:9,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.4)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                      <button onClick={()=>{tonConnectUI.disconnect?.();setWalletMenuOpen(false);}} style={{flex:1,padding:'11px',borderRadius:9,background:'rgba(255,50,50,.08)',border:'1px solid rgba(255,50,50,.18)',color:'#ff4d4d',fontSize:13,fontWeight:700,cursor:'pointer'}}>Disconnect</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── MAIN CONTENT ── */}
              <div style={{position:'relative',zIndex:1}}>

                {/* WALLET ROW + BELL — scrolls with content */}
                <div style={{padding:'8px 20px 0',display:'flex',gap:8,alignItems:'stretch'}}>
                  {/* Wallet card — takes remaining space */}
                  <div style={{flex:1,minWidth:0}}>
                    {userFriendlyAddress?(
                      <div onClick={()=>setWalletMenuOpen(true)} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 12px',borderRadius:8,background:'rgba(255,255,255,.03)',border:'1px solid rgba(0,195,123,.14)',cursor:'pointer',WebkitTapHighlightColor:'transparent',height:'100%',boxSizing:'border-box'}}>
                        <div style={{width:5,height:5,borderRadius:'50%',background:'#00c37b',flexShrink:0}}/>
                        <span style={{flex:1,fontSize:10,fontFamily:"'SF Mono',monospace",color:'rgba(255,255,255,.26)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userFriendlyAddress.slice(0,10)}…{userFriendlyAddress.slice(-6)}</span>
                        <span style={{fontSize:9,color:'rgba(255,77,77,.5)',fontWeight:700,letterSpacing:'.04em',flexShrink:0}}>UNLINK</span>
                      </div>
                    ):(
                      <button onClick={()=>tonConnectUI.connectWallet().catch(()=>{})} style={{width:'100%',height:'100%',display:'flex',alignItems:'center',gap:10,padding:'6px 12px',borderRadius:8,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',cursor:'pointer',WebkitTapHighlightColor:'transparent',boxSizing:'border-box'}}>
                        <span style={{flex:1,fontSize:11,color:'rgba(255,255,255,.22)',fontWeight:500,textAlign:'left'}}>Connect Wallet</span>
                        {!walletBonusClaimed&&<span style={{fontSize:10,fontWeight:700,color:'#5096ff',background:'rgba(80,150,255,.07)',borderRadius:5,padding:'2px 8px',flexShrink:0}}>+10K FRG</span>}
                      </button>
                    )}
                  </div>

                  {/* Notification Bell — same height as wallet card */}
                  <button onClick={()=>setNotifOpen(true)} style={{position:'relative',flexShrink:0,width:42,borderRadius:8,background:'rgba(255,255,255,.03)',border:`1px solid ${unreadCount>0?'rgba(0,195,123,.25)':'rgba(255,255,255,.06)'}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,cursor:'pointer',WebkitTapHighlightColor:'transparent',padding:'5px 0',transition:'border-color .2s'}}>
                    {/* Illustrated bell SVG */}
                    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                      {/* Bell body */}
                      <path d="M11 2 Q6 2 5.5 7.5 Q5 13 3 15 L19 15 Q17 13 16.5 7.5 Q16 2 11 2Z"
                        fill={unreadCount>0?'#00c37b':'rgba(255,255,255,.12)'}
                        stroke={unreadCount>0?'#00c37b':'rgba(255,255,255,.3)'}
                        strokeWidth="1.2"
                        opacity={unreadCount>0?1:.8}
                      />
                      {/* Bell bottom bar */}
                      <path d="M3 15 L19 15" stroke={unreadCount>0?'#00c37b':'rgba(255,255,255,.3)'} strokeWidth="1.5" strokeLinecap="round"/>
                      {/* Clapper */}
                      <path d="M8.5 15 Q8.5 19 11 19 Q13.5 19 13.5 15" fill={unreadCount>0?'rgba(0,195,123,.5)':'rgba(255,255,255,.15)'} />
                      {/* Highlight shimmer on bell */}
                      <path d="M7 7 Q8 5 10 5" stroke={unreadCount>0?'rgba(255,255,255,.5)':'rgba(255,255,255,.2)'} strokeWidth=".9" strokeLinecap="round"/>
                      {/* Active dot if unread */}
                      {unreadCount>0&&<circle cx="17" cy="5" r="3.5" fill="#e05555" stroke="#000" strokeWidth="1.2"/>}
                    </svg>
                    {/* Count or label */}
                    <span style={{fontSize:7,fontWeight:700,letterSpacing:'.04em',color:unreadCount>0?'#00c37b':'rgba(255,255,255,.2)',lineHeight:1}}>
                      {unreadCount>0?(unreadCount>9?'9+':unreadCount):'BELL'}
                    </span>
                  </button>
                </div>

                {/* BALANCE */}
                <div style={{padding:'22px 20px 14px',textAlign:'center',position:'relative'}}>
                  <svg style={{position:'absolute',top:14,left:'50%',transform:'translateX(-50%)',opacity:.05,pointerEvents:'none'}} width="200" height="88" viewBox="0 0 200 88">
                    <ellipse cx="100" cy="44" rx="94" ry="36" fill="none" stroke="#fff" strokeWidth="1"/>
                    <ellipse cx="100" cy="44" rx="64" ry="24" fill="none" stroke="#fff" strokeWidth=".6"/>
                    <circle cx="100" cy="44" r="18" fill="none" stroke="#fff" strokeWidth="1"/>
                    <circle cx="100" cy="44" r="9" fill="none" stroke="#fff" strokeWidth=".7"/>
                    <circle cx="100" cy="44" r="3.5" fill="#fff"/>
                    <line x1="6" y1="44" x2="82" y2="44" stroke="#fff" strokeWidth=".5"/>
                    <line x1="118" y1="44" x2="194" y2="44" stroke="#fff" strokeWidth=".5"/>
                    <line x1="100" y1="8" x2="100" y2="26" stroke="#fff" strokeWidth=".5"/>
                    <line x1="100" y1="62" x2="100" y2="80" stroke="#fff" strokeWidth=".5"/>
                  </svg>
                  <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.16em',textTransform:'uppercase',marginBottom:6}}>FRG Balance</div>
                  <div className={`bal-amount${tick?' tick':''}`} style={{fontSize:'clamp(58px,15vw,76px)',fontWeight:700,color:'rgba(255,255,255,.88)',lineHeight:1,letterSpacing:'-.04em',marginBottom:8}}>{fmt(balance)}</div>
                  <div style={{height:22,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {mining
                      ?<div style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 12px',borderRadius:100,background:'rgba(0,195,123,.07)',border:'1px solid rgba(0,195,123,.13)'}}>
                         <div style={{width:5,height:5,borderRadius:'50%',background:'#00c37b',animation:'sdot .9s infinite',flexShrink:0}}/>
                         <span style={{fontSize:12,fontWeight:700,color:'#00c37b'}}>+{effectiveRate.toFixed(4)} FRG/s</span>
                         {activeBoost&&<span style={{fontSize:10,color:'#ffc100',fontWeight:700}}>⚡{activeBoost.rem}s</span>}
                       </div>
                      :<span style={{fontSize:11,color:'rgba(255,255,255,.14)'}}>Tap below to start</span>}
                  </div>
                </div>

                {/* MINE BUTTON / MINING ACTIVE CARD */}
                <div style={{padding:'0 20px 10px'}}>
                  {!mining?(
                    <button onClick={toggle} style={{width:'100%',height:56,borderRadius:12,border:'none',cursor:'pointer',transition:'opacity .18s',position:'relative',overflow:'hidden',WebkitTapHighlightColor:'transparent',background:'linear-gradient(135deg,#007a4c 0%,#009e62 45%,#00b36e 100%)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:0}}>

                      {/* Artwork layer */}
                      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} viewBox="0 0 390 56" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">

                        {/* Top-left: large off-center ring cluster, clipped at edges — not centered, drifted up-left */}
                        <ellipse cx="72" cy="18" rx="58" ry="38" stroke="rgba(0,0,0,0.18)" strokeWidth="1.2"/>
                        <ellipse cx="72" cy="18" rx="38" ry="25" stroke="rgba(0,0,0,0.15)" strokeWidth="0.9"/>
                        <ellipse cx="72" cy="18" rx="20" ry="13" stroke="rgba(0,0,0,0.13)" strokeWidth="0.7"/>
                        <circle cx="72" cy="18" r="5" fill="rgba(0,0,0,0.22)"/>
                        <line x1="0"   y1="18" x2="52"  y2="18" stroke="rgba(0,0,0,0.13)" strokeWidth="0.6"/>
                        <line x1="92"  y1="18" x2="130" y2="18" stroke="rgba(0,0,0,0.1)"  strokeWidth="0.6"/>
                        <line x1="72"  y1="0"  x2="72"  y2="5"  stroke="rgba(0,0,0,0.13)" strokeWidth="0.6"/>

                        {/* Bottom-right: smaller ring cluster, drifted down-right, different scale */}
                        <ellipse cx="308" cy="44" rx="44" ry="28" stroke="rgba(0,0,0,0.14)" strokeWidth="1"/>
                        <ellipse cx="308" cy="44" rx="27" ry="17" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8"/>
                        <ellipse cx="308" cy="44" rx="13" ry="8"  stroke="rgba(0,0,0,0.1)"  strokeWidth="0.6"/>
                        <circle cx="308" cy="44" r="3.5" fill="rgba(0,0,0,0.2)"/>
                        <line x1="264" y1="44" x2="295" y2="44" stroke="rgba(0,0,0,0.1)"  strokeWidth="0.5"/>
                        <line x1="321" y1="44" x2="390" y2="44" stroke="rgba(0,0,0,0.09)" strokeWidth="0.5"/>
                        <line x1="308" y1="51" x2="308" y2="56" stroke="rgba(0,0,0,0.1)"  strokeWidth="0.5"/>

                        {/* Loose dot scatter — irregular, not grid-aligned */}
                        {[[18,8],[44,14],[110,6],[155,42],[200,10],[230,48],[275,18],[340,8],[370,38],[88,46],[130,30]].map(([x,y],i)=>
                          <circle key={i} cx={x} cy={y} r="0.85" fill="rgba(0,0,0,0.2)"/>
                        )}

                        {/* Diagonal grain lines — top-left to bottom-right, uneven spacing */}
                        <line x1="0"   y1="14" x2="28"  y2="0"  stroke="rgba(0,0,0,0.07)" strokeWidth="0.5"/>
                        <line x1="0"   y1="36" x2="56"  y2="0"  stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
                        <line x1="0"   y1="56" x2="85"  y2="0"  stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"/>
                        <line x1="30"  y1="56" x2="140" y2="0"  stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"/>
                        <line x1="310" y1="56" x2="390" y2="18" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
                        <line x1="355" y1="56" x2="390" y2="40" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"/>

                        {/* Dark right-edge fade */}
                        <rect x="310" width="80" height="56" fill="url(#fadeR)"/>

                        {/* Shimmer — angled gloss streak */}
                        <rect x="-100" y="-10" width="90" height="76" fill="url(#shimmer)" transform="skewX(-12)">
                          <animateTransform attributeName="transform" type="translate" values="-100,0;520,0" dur="2.4s" repeatCount="indefinite" additive="sum"/>
                        </rect>

                        <defs>
                          <linearGradient id="fadeR" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%"   stopColor="black" stopOpacity="0"/>
                            <stop offset="100%" stopColor="black" stopOpacity="0.28"/>
                          </linearGradient>
                          <linearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%"   stopColor="white" stopOpacity="0"/>
                            <stop offset="35%"  stopColor="white" stopOpacity="0.07"/>
                            <stop offset="50%"  stopColor="white" stopOpacity="0.19"/>
                            <stop offset="65%"  stopColor="white" stopOpacity="0.07"/>
                            <stop offset="100%" stopColor="white" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Label */}
                      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{position:'relative',zIndex:2,flexShrink:0}}>
                        <circle cx="9" cy="9" r="7.5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.3"/>
                        <circle cx="9" cy="9" r="4"   stroke="rgba(0,0,0,0.35)" strokeWidth="1"/>
                        <circle cx="9" cy="9" r="1.5" fill="rgba(0,0,0,0.7)"/>
                        <line x1="1"  y1="9" x2="5"  y2="9" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2"/>
                        <line x1="13" y1="9" x2="17" y2="9" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2"/>
                        <line x1="9"  y1="1" x2="9"  y2="5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2"/>
                        <line x1="9"  y1="13" x2="9" y2="17" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2"/>
                      </svg>
                      <span style={{position:'relative',zIndex:2,fontSize:15,fontWeight:800,letterSpacing:'-.01em',color:'rgba(0,0,0,0.75)'}}>Start Mining</span>
                    </button>
                  ):(
                    /* Mining active — contextual upsell card, minimal */
                    <div style={{borderRadius:12,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',padding:'12px 14px',display:'flex',alignItems:'center',gap:12,position:'relative',overflow:'hidden'}}>
                      {/* Subtle miner illustration */}
                      <svg style={{position:'absolute',right:0,top:0,opacity:.07,pointerEvents:'none'}} width="90" height="68" viewBox="0 0 90 68">
                        <circle cx="70" cy="20" r="16" fill="none" stroke="#fff" strokeWidth="1"/>
                        <circle cx="70" cy="20" r="8" fill="none" stroke="#fff" strokeWidth=".7"/>
                        <circle cx="70" cy="20" r="3" fill="#fff" opacity=".5"/>
                        <line x1="54" y1="20" x2="62" y2="20" stroke="#fff" strokeWidth=".8"/>
                        <line x1="78" y1="20" x2="86" y2="20" stroke="#fff" strokeWidth=".8"/>
                        <line x1="70" y1="4" x2="70" y2="12" stroke="#fff" strokeWidth=".8"/>
                        <path d="M30 50 Q45 30 60 40 Q75 50 80 60" fill="none" stroke="#fff" strokeWidth=".6" strokeDasharray="3 4"/>
                        <circle cx="30" cy="50" r="2.5" fill="#fff" opacity=".4"/>
                        <circle cx="55" cy="36" r="2" fill="#fff" opacity=".3"/>
                      </svg>
                      <div style={{width:32,height:32,borderRadius:8,background:'rgba(0,195,123,.1)',border:'1px solid rgba(0,195,123,.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {!hasAutoMine?(
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="3" y="7" width="14" height="10" rx="3" fill="#00c37b" opacity=".2" stroke="#00c37b" strokeWidth="1.1"/>
                            <rect x="5.5" y="9.5" width="3" height="3" rx="1" fill="#00c37b" opacity=".4"/>
                            <circle cx="7" cy="11" r="1.3" fill="#00c37b" opacity=".95"/>
                            <rect x="11.5" y="9.5" width="3" height="3" rx="1" fill="#00c37b" opacity=".4"/>
                            <circle cx="13" cy="11" r="1.3" fill="#00c37b" opacity=".95"/>
                            <rect x="7" y="14.5" width="2" height="1.8" rx=".7" fill="#00c37b" opacity=".6"/>
                            <rect x="11" y="14.5" width="2" height="1.8" rx=".7" fill="#00c37b" opacity=".6"/>
                            <line x1="10" y1="3.5" x2="10" y2="7" stroke="#00c37b" strokeWidth="1.2" strokeLinecap="round"/>
                            <circle cx="10" cy="3" r="1.4" fill="#00c37b" opacity=".8"/>
                          </svg>
                        ):!Object.values(upgrades).some(v=>v>0)?(
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <polygon points="11,1 5,9 9,9 7,19 15,10 10,10 13,1" fill="#00c37b" opacity=".3"/>
                            <polygon points="11,1 5,9 9,9 7,19 15,10 10,10 13,1" fill="none" stroke="#00c37b" strokeWidth="1.2" strokeLinejoin="round"/>
                            <circle cx="9" cy="13" r="2" fill="#00c37b" opacity=".8"/>
                          </svg>
                        ):(
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="7" cy="7" r="3" fill="#00c37b" opacity=".7"/>
                            <circle cx="13" cy="7" r="3" fill="#00c37b" opacity=".5"/>
                            <path d="M1 17 Q1 13 7 13 Q13 13 13 17" fill="#00c37b" opacity=".7"/>
                            <path d="M13 13 Q19 13 19 17" fill="#00c37b" opacity=".4"/>
                            <circle cx="10" cy="12" r="2.5" fill="#00c37b" opacity=".9"/>
                            <circle cx="10" cy="12" r="4" fill="none" stroke="#00c37b" strokeWidth=".8" opacity=".4"/>
                          </svg>
                        )}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        {!hasAutoMine?(
                          <>
                            <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.7)',marginBottom:1}}>Mining stops when you close</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,.25)'}}>Get Auto-Mine to earn 24/7</div>
                          </>
                        ):!Object.values(upgrades).some(v=>v>0)?(
                          <>
                            <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.7)',marginBottom:1}}>Boost your mining rate</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,.25)'}}>Upgrades multiply your FRG/s</div>
                          </>
                        ):(
                          <>
                            <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.7)',marginBottom:1}}>+{effectiveRate.toFixed(4)} FRG/s running</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,.25)'}}>Invite friends to earn 10% of their mining</div>
                          </>
                        )}
                      </div>
                      <button onClick={()=>{setTab('store');if(!hasAutoMine)setStoreTab('automine');else if(!Object.values(upgrades).some(v=>v>0))setStoreTab('upgrades');else setTab('refer');}} style={{padding:'6px 12px',borderRadius:7,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.5)',fontSize:10,fontWeight:600,cursor:'pointer',flexShrink:0,whiteSpace:'nowrap',WebkitTapHighlightColor:'transparent'}}>
                        {!hasAutoMine?'Get it':'Upgrade'}
                      </button>
                    </div>
                  )}
                </div>

                {/* BOOSTS — fixed size always */}
                <div style={{padding:'0 20px 10px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[
                    {
                      key:'surge',label:'3× Surge',icon:'⚡',
                      active:activeBoost?.label==='3× SURGE',
                      badge:activeBoost?.label==='3× SURGE'?`${activeBoost.rem}s`:surgeCd?surgeCd:boostCh>0?'FREE':'20⭐',
                      badgeColor:surgeCd?'#ff4d4d':boostCh>0?'#00c37b':'#ffc100',
                      sub:boostCh>0?'Free · 4h reset':surgeCd||'⭐ Stars',
                      canUse:mining&&!activeBoost&&!surgeCd&&boostCh>0,
                      onTap:()=>{if(mining&&!activeBoost&&!surgeCd&&boostCh>0){setAB({mult:3,rem:60,label:'3× SURGE'});setBoostCh(0);setSurgeUsedAt(Date.now());showToast('⚡','3× SURGE Active','60 seconds');}},
                      onBuy:()=>buyWithStars('boost_surge'),
                      needsBuy:!boostCh&&!activeBoost,
                      ill:<svg width="60" height="60" viewBox="0 0 70 70">
                        <polygon points="48,4 30,34 44,34 18,66 56,30 40,30 62,4" fill="#2a2a2a"/>
                        <polygon points="48,10 33,34 45,34 22,62 53,34 41,34 60,10" fill="#333"/>
                        <polygon points="48,16 36,34 46,34 26,58 50,38 40,38 57,16" fill="#ffc100" opacity=".6"/>
                        <polygon points="44,20 38,34 47,34 30,55 48,40 40,40 54,20" fill="#ffc100" opacity=".85"/>
                        <circle cx="41" cy="46" r="4" fill="#ffc100"/>
                        <ellipse cx="41" cy="46" rx="7" ry="7" fill="#ffc100" opacity=".3"/>
                      </svg>
                    },
                    {
                      key:'turbo',label:'5× Turbo',icon:'🔥',
                      active:activeBoost?.label==='5× SURGE',
                      badge:activeBoost?.label==='5× SURGE'?`${activeBoost.rem}s`:turboCd?turboCd:turboCh>0?'FREE':'30⭐',
                      badgeColor:turboCd?'#ff4d4d':turboCh>0?'#00c37b':'#ffc100',
                      sub:turboCh>0?'Free · 6h reset':turboCd||'⭐ Stars',
                      canUse:mining&&!activeBoost&&!turboCd&&turboCh>0,
                      onTap:()=>{if(mining&&!activeBoost&&!turboCd&&turboCh>0){setAB({mult:5,rem:60,label:'5× SURGE'});setTurboCh(0);setTurboUsedAt(Date.now());showToast('🔥','5× SURGE Active','60 seconds');}},
                      onBuy:()=>buyWithStars('boost_turbo'),
                      needsBuy:!turboCh&&!activeBoost,
                      ill:<svg width="60" height="60" viewBox="0 0 70 70">
                        <circle cx="56" cy="56" r="38" fill="#252525"/>
                        <circle cx="56" cy="56" r="28" fill="#2d2d2d"/>
                        <circle cx="56" cy="56" r="19" fill="#363636"/>
                        <circle cx="56" cy="56" r="11" fill="#ff6b3d" opacity=".5"/>
                        <circle cx="56" cy="56" r="6" fill="#ff6b3d" opacity=".8"/>
                        <circle cx="56" cy="56" r="2.5" fill="#ff6b3d"/>
                        <circle cx="56" cy="56" r="16" fill="none" stroke="#ff6b3d" strokeWidth="1.2" opacity=".5"/>
                        <circle cx="56" cy="56" r="25" fill="none" stroke="#ff6b3d" strokeWidth=".8" opacity=".3"/>
                        <circle cx="56" cy="56" r="34" fill="none" stroke="#ff6b3d" strokeWidth=".5" opacity=".15"/>
                      </svg>
                    }
                  ].map(b=>(
                    <div key={b.key}
                      onClick={()=>{ if(b.canUse){b.onTap();} else if(b.needsBuy){b.onBuy();} }}
                      style={{borderRadius:10,background:b.active?'rgba(0,195,123,.06)':'rgba(255,255,255,.03)',border:`1px solid ${b.active?'rgba(0,195,123,.14)':'rgba(255,255,255,.07)'}`,padding:'11px 12px',cursor:'pointer',position:'relative',overflow:'hidden',WebkitTapHighlightColor:'transparent',display:'flex',flexDirection:'column',gap:6}}>
                      {/* Illustration clipped to bottom-right, doesn't touch top badge area */}
                      <div style={{position:'absolute',bottom:0,right:0,width:60,height:60,overflow:'hidden',pointerEvents:'none'}}>
                        {b.ill}
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative',zIndex:1}}>
                        <span style={{fontSize:20,lineHeight:1}}>{b.icon}</span>
                        <span style={{fontSize:8,fontWeight:800,padding:'2px 5px',borderRadius:4,background:b.badgeColor==='#ff4d4d'?'rgba(255,77,77,.08)':b.badgeColor==='#00c37b'?'rgba(0,195,123,.08)':'rgba(255,193,0,.06)',color:b.badgeColor,border:`1px solid ${b.badgeColor==='#ff4d4d'?'rgba(255,77,77,.14)':b.badgeColor==='#00c37b'?'rgba(0,195,123,.14)':'rgba(255,193,0,.12)'}`,minWidth:24,textAlign:'center'}}>{b.badge}</span>
                      </div>
                      <div style={{position:'relative',zIndex:1}}>
                        <div style={{fontSize:13,fontWeight:800,color:'#fff',marginBottom:1}}>{b.label}</div>
                        <div style={{fontSize:9,color:b.needsBuy?'#ffc100':'rgba(255,255,255,.2)',fontWeight:b.needsBuy?600:400}}>
                          {b.needsBuy?'Tap to buy with Stars ⭐':b.sub}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* MILESTONE */}
                <div style={{padding:'0 20px 14px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                    <span style={{fontSize:10,color:'rgba(255,255,255,.18)',fontWeight:500}}>Milestone</span>
                    <span style={{fontSize:10,fontWeight:700,color:milePct>75?'#00c37b':'rgba(255,255,255,.18)'}}>{fmt(balance)} / {fmt(curM)}</span>
                  </div>
                  <div style={{height:3,borderRadius:100,background:'rgba(255,255,255,.05)',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${milePct}%`,borderRadius:100,background:'#00c37b',transition:'width .6s',boxShadow:milePct>5?'0 0 6px rgba(0,195,123,.35)':undefined}}/>
                  </div>
                </div>

                {coolingWarning&&!mining&&(
                  <div style={{margin:'0 20px 10px'}}>
                    <CoolingWarning hoursInactive={(Date.now()-lastActiveAt)/(1000*60*60)} onMine={()=>{if(!mining)toggle();}}/>
                  </div>
                )}

                {/* ══ SECTIONS ══ */}
                <div style={{borderTop:'1px solid rgba(255,255,255,.05)'}}>

                  {/* 1. YOUR NODE */}
                  {(()=>{
                    const totalLevels=Object.values(upgrades).reduce((a,b)=>a+(Number(b)||0),0);
                    const tier=totalLevels===0?0:totalLevels<=3?1:totalLevels<=8?2:totalLevels<=14?3:totalLevels<=20?4:5;
                    const tiers=[{name:'Genesis Node',color:'rgba(255,255,255,.22)',icon:'◈'},{name:'Spark Node',color:'#ffc100',icon:'◉'},{name:'Plasma Node',color:'#ff6b3d',icon:'◎'},{name:'Quantum Node',color:'#5096ff',icon:'⬡'},{name:'Dark Matter',color:'#b464ff',icon:'✦'},{name:'Singularity',color:'#fff',icon:'⊕'}];
                    const t=tiers[tier];
                    const activeModules=UPGRADES.filter(u=>(upgrades[u.id]||upgrades[String(u.id)]||0)>0).length;
                    return <NodeExpandable t={t} r={0} g={0} b={0} mining={mining} effectiveRate={effectiveRate} hasAutoMine={hasAutoMine} purchased={purchased} upgrades={upgrades} activeModules={activeModules} onUpgrade={()=>setTab('store')}/>;
                  })()}
                  <div style={{height:1,background:'rgba(255,255,255,.05)'}}/>

                  {/* 2. HALVING — below Genesis Node, above Security Circle */}
                  <HalvingDropdown effectiveRate={effectiveRate} totalUsers={totalUsers||0} onInvite={()=>setTab('refer')}/>
                  <div style={{height:1,background:'rgba(255,255,255,.05)'}}/>

                  {/* 3. SECURITY CIRCLE */}
                  <div onClick={()=>{setTab('refer');setTimeout(()=>circleRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),120);}} style={{padding:'14px 20px',cursor:'pointer',WebkitTapHighlightColor:'transparent',position:'relative',overflow:'hidden'}}>
                    <svg style={{position:'absolute',right:0,bottom:0,pointerEvents:'none',opacity:.9}} width="70" height="70" viewBox="0 0 90 90">
                      {/* Guardian — Blum style solid */}
                      <path d="M60 8 L80 18 L80 50 Q80 70 60 82 Q40 70 40 50 L40 18 Z" fill="#1e1e1e"/>
                      <path d="M60 14 L74 22 L74 50 Q74 66 60 76 Q46 66 46 50 L46 22 Z" fill="#252525"/>
                      {/* Shield inner */}
                      <path d="M60 20 L70 26 L70 48 Q70 60 60 68 Q50 60 50 48 L50 26 Z" fill="#2a2a2a"/>
                      {/* Eye visor — green */}
                      <ellipse cx="60" cy="38" rx="10" ry="7" fill="#00c37b" opacity=".15"/>
                      <ellipse cx="60" cy="38" rx="7" ry="5" fill="#00c37b" opacity=".22"/>
                      <rect x="53" y="35" width="14" height="5" rx="2" fill="#00c37b" opacity=".55"/>
                      <circle cx="56" cy="37" r="2" fill="#00c37b" opacity=".6"/>
                      <circle cx="64" cy="37" r="2" fill="#00c37b" opacity=".6"/>
                      {/* Center emblem */}
                      <circle cx="60" cy="52" r="5" fill="#1e1e1e" stroke="#00c37b" strokeWidth=".8" opacity=".4"/>
                      <circle cx="60" cy="52" r="2.5" fill="#00c37b" opacity=".3"/>
                      {/* Glow */}
                      <ellipse cx="60" cy="83" rx="18" ry="4" fill="#00c37b" opacity=".07"/>
                    </svg>
                    <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:9}}>
                      <div style={{width:34,height:34,borderRadius:8,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 1 L15 4 L15 9 Q15 14 9 17 Q3 14 3 9 L3 4 Z" fill="#00c37b" opacity=".15" stroke="#00c37b" strokeWidth="1.2"/>
                      <path d="M9 4 L12 5.5 L12 9 Q12 12 9 13.5 Q6 12 6 9 L6 5.5 Z" fill="#00c37b" opacity=".25"/>
                      <circle cx="9" cy="9" r="2" fill="#00c37b" opacity=".8"/>
                    </svg>
                  </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:1}}>Security Circle</div>
                        <div style={{fontSize:10,color:'rgba(255,255,255,.22)'}}>Verify contacts · boost your FRG allocation</div>
                      </div>
                      <div style={{textAlign:'center',background:'rgba(255,255,255,.04)',borderRadius:6,padding:'4px 9px',flexShrink:0}}>
                        <div style={{fontSize:16,fontWeight:800,color:'#fff',lineHeight:1}}>{Math.round((MOCK_CIRCLE.filter(m=>m.trusted).length/5)*100)}</div>
                        <div style={{fontSize:8,color:'rgba(255,255,255,.2)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em'}}>Trust</div>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:5,background:'rgba(255,255,255,.025)',borderRadius:7,padding:'7px 9px',alignItems:'center'}}>
                      {Array.from({length:5},(_,i)=>{const m=MOCK_CIRCLE[i];return m?(
                        <div key={i} style={{width:26,height:26,borderRadius:6,background:`${m.color}10`,border:`1px solid ${m.trusted?m.color+'30':'rgba(255,255,255,.06)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:10,color:m.trusted?m.color:'rgba(255,255,255,.2)',position:'relative'}}>
                          {m.avatar}
                          {m.trusted&&<div style={{position:'absolute',top:1,right:1,width:5,height:5,borderRadius:'50%',background:'#00c37b',border:'1px solid #000'}}/>}
                        </div>
                      ):(
                        <div key={i} style={{width:26,height:26,borderRadius:6,border:'1px dashed rgba(255,255,255,.06)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:11,color:'rgba(255,255,255,.15)'}}>+</div>
                      );})}
                      <div style={{flex:1,fontSize:9,color:'rgba(255,255,255,.18)',paddingLeft:5}}>{MOCK_CIRCLE.filter(m=>m.trusted).length}/5 verified</div>
                      <span style={{fontSize:12,color:'rgba(255,255,255,.16)'}}>›</span>
                    </div>
                  </div>
                  <div style={{height:1,background:'rgba(255,255,255,.05)'}}/>

                  {/* 4. GENESIS BADGE */}
                  {genesisBadge&&<>
                    <div style={{padding:'12px 20px',display:'flex',alignItems:'center',gap:10,position:'relative',overflow:'hidden'}}>
                      <svg style={{position:'absolute',right:18,opacity:.05}} width="44" height="44" viewBox="0 0 44 44">
                        <polygon points="22,2 26,15 40,15 30,24 34,38 22,30 10,38 14,24 4,15 18,15" fill="none" stroke="#fff" strokeWidth="1.4"/>
                        <polygon points="22,8 25,17 35,17 28,23 31,33 22,27 13,33 16,23 9,17 19,17" fill="#fff" opacity=".25"/>
                      </svg>
                      <div style={{width:30,height:30,borderRadius:7,background:'rgba(255,193,0,.1)',border:'1px solid rgba(255,193,0,.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polygon points="8,1 10,6 15,6 11,9 12,14 8,11 4,14 5,9 1,6 6,6" fill="#ffc100" opacity=".9"/></svg>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:700,color:'#00c37b'}}>Genesis Miner</div>
                        <div style={{fontSize:10,color:'rgba(255,255,255,.2)',marginTop:1}}>+1.1× rate locked forever</div>
                      </div>
                    </div>
                    <div style={{height:1,background:'rgba(255,255,255,.05)'}}/>
                  </>}

                  {/* 6. HASH TERMINAL */}
                  <div style={{padding:'13px 20px',position:'relative',overflow:'hidden'}}>
                    <svg style={{position:'absolute',top:10,right:14,opacity:.04,pointerEvents:'none'}} width="72" height="72" viewBox="0 0 72 72">
                      <rect x="6" y="6" width="60" height="60" fill="none" stroke="#fff" strokeWidth=".9"/>
                      <rect x="18" y="18" width="36" height="36" fill="none" stroke="#fff" strokeWidth=".65"/>
                      <circle cx="36" cy="36" r="12" fill="none" stroke="#fff" strokeWidth=".75"/>
                      <circle cx="36" cy="36" r="4.5" fill="#fff" opacity=".3"/>
                      <line x1="6" y1="36" x2="18" y2="36" stroke="#fff" strokeWidth=".5"/>
                      <line x1="54" y1="36" x2="66" y2="36" stroke="#fff" strokeWidth=".5"/>
                      <line x1="36" y1="6" x2="36" y2="18" stroke="#fff" strokeWidth=".5"/>
                      <line x1="36" y1="54" x2="36" y2="66" stroke="#fff" strokeWidth=".5"/>
                    </svg>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:7}}>
                      <div style={{display:'flex',alignItems:'center',gap:5}}>
                        <div style={{display:'flex',gap:3}}>{['.09','.2','.38'].map((o,i)=><div key={i} style={{width:5,height:5,borderRadius:'50%',background:`rgba(255,255,255,${o})`}}/>)}</div>
                        <span style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.16)',letterSpacing:'.1em',textTransform:'uppercase'}}>Hash Processor</span>
                      </div>
                      <div style={{fontSize:9,fontWeight:600,color:mining?'#00c37b':'rgba(255,255,255,.16)',display:'flex',alignItems:'center',gap:3}}>
                        {mining&&<div style={{width:4,height:4,borderRadius:'50%',background:'#00c37b',animation:'sdot 1s infinite'}}/>}
                        {mining?'Running':'Idle'}
                      </div>
                    </div>
                    <div style={{fontFamily:"'SF Mono',monospace",fontSize:9,lineHeight:1.85,color:'rgba(255,255,255,.15)',marginBottom:7}}>
                      <div style={{display:'flex',gap:8}}><span style={{color:'rgba(255,255,255,.12)',width:46,flexShrink:0}}>attempt</span><span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:mining?'rgba(255,255,255,.3)':undefined}}>{mining?hash.a:'0'.repeat(64)}</span></div>
                      <div style={{display:'flex',gap:8}}><span style={{color:'rgba(255,255,255,.12)',width:46,flexShrink:0}}>nonce</span><span style={{color:mining?'#00c37b':'rgba(255,255,255,.15)',animation:mining?'cf .12s steps(1) infinite':undefined}}>{mining?hash.c:'0'.repeat(16)}</span></div>
                      <div style={{display:'flex',gap:8}}><span style={{color:'rgba(255,255,255,.12)',width:46,flexShrink:0}}>H/s</span><span style={{color:'#00c37b',fontWeight:700}}>{(effectiveRate*1000).toFixed(0)}</span></div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
                      {[{l:'Session',v:fmt(sessE),c:'#00c37b'},{l:'Net Hash',v:`${netHash.toFixed(1)} TH`,c:'#b464ff'},{l:'Node ID',v:'FRG-A7F3',c:'#5096ff'},{l:'Blocks',v:blocks,c:'rgba(255,255,255,.7)'}].map((m,i)=>(
                        <div key={i} style={{padding:'6px 8px',background:'rgba(255,255,255,.025)',borderRadius:5,border:'1px solid rgba(255,255,255,.04)'}}>
                          <div style={{fontSize:8,fontWeight:600,color:'rgba(255,255,255,.14)',letterSpacing:'.07em',textTransform:'uppercase',marginBottom:2}}>{m.l}</div>
                          <div style={{fontFamily:"'SF Mono',monospace",fontSize:11,fontWeight:700,color:m.c}}>{m.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{height:1,background:'rgba(255,255,255,.05)'}}/>

                  {/* 7. NODE MESH */}
                  <div style={{padding:'11px 20px 14px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                      <span style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.16)',letterSpacing:'.1em',textTransform:'uppercase'}}>Node Mesh</span>
                      <span style={{fontSize:9,color:mining?'#00c37b':'rgba(255,255,255,.16)',display:'flex',alignItems:'center',gap:3,fontWeight:600}}>
                        {mining&&<div style={{width:4,height:4,borderRadius:'50%',background:'#00c37b',animation:'sdot 1s infinite'}}/>}
                        {mining?'Syncing':'Standby'}
                      </span>
                    </div>
                    <div style={{position:'relative',height:64,borderRadius:6,overflow:'hidden',background:'rgba(255,255,255,.02)',marginBottom:7}}><NodeCanvas active={mining}/></div>
                    {log.slice(0,5).map((e,i)=>(
                      <div key={i} style={{display:'flex',gap:8,padding:'2px 0',fontFamily:"'SF Mono',monospace",fontSize:9,color:logColors[e.type]||'rgba(255,255,255,.2)'}}>
                        <span style={{color:'rgba(255,255,255,.12)',flexShrink:0,width:32}}>{e.t}</span>{e.msg}
                      </div>
                    ))}
                  </div>

                </div>
              </div>
              <div style={{height:20}}/>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              UPGRADE TAB
          ══════════════════════════════════════════════════ */}
          {tab==='store'&&(
            <div style={{background:'#000',minHeight:'100%'}}>
              {/* BG illustration */}
              <svg style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}} viewBox="0 0 430 900" preserveAspectRatio="xMidYMid slice">
                {Array.from({length:22},(_,i)=>Array.from({length:46},(_,j)=>(
                  <circle key={i*100+j} cx={i*20} cy={j*20} r="1" fill="rgba(255,255,255,.07)"/>
                )))}
                <g opacity=".15">
                {/* Server rack — solid Blum style */}
                <rect x="148" y="260" width="134" height="200" rx="10" fill="#161616"/>
                {/* Rack units */}
                {[0,1,2,3,4].map(i=>(
                  <g key={i}>
                    <rect x="156" y={272+i*36} width="118" height="28" rx="4" fill="#1e1e1e"/>
                    <rect x="162" y={278+i*36} width="80" height="16" rx="3" fill="#222"/>
                    <circle cx="258" cy={286+i*36} r="5" fill={i===0?'#00c37b':'#1a1a1a'} opacity={i===0?'.8':'.5'}/>
                    <circle cx="258" cy={286+i*36} r="3" fill={i===0?'#00c37b':'#252525'}/>
                    {i===0&&<rect x="162" y="281" width="80" height="6" rx="2" fill="#00c37b" opacity=".15"/>}
                  </g>
                ))}
                {/* Side panels */}
                <rect x="136" y="268" width="14" height="186" rx="5" fill="#141414"/>
                <rect x="280" y="268" width="14" height="186" rx="5" fill="#141414"/>
                {/* Cables out bottom */}
                <path d="M190 460 Q190 490 160 500 Q130 510 130 540" fill="none" stroke="#1e1e1e" strokeWidth="8" strokeLinecap="round"/>
                <path d="M215 460 Q215 500 215 540" fill="none" stroke="#1e1e1e" strokeWidth="8" strokeLinecap="round"/>
                <path d="M240 460 Q240 490 270 500 Q300 510 300 540" fill="none" stroke="#1e1e1e" strokeWidth="8" strokeLinecap="round"/>
                {/* Cable green accent */}
                <path d="M215 460 Q215 500 215 540" fill="none" stroke="#00c37b" strokeWidth="1.5" strokeDasharray="4 6" opacity=".5"/>
                {/* Top status light */}
                <rect x="195" y="252" width="40" height="10" rx="3" fill="#1a1a1a"/>
                <circle cx="215" cy="257" r="3" fill="#00c37b" opacity=".8"/>
                <ellipse cx="215" cy="257" rx="6" ry="4" fill="#00c37b" opacity=".15"/>
              </g>
              </svg>

              <div style={{position:'relative',zIndex:1}}>
                {/* Header */}
                <div style={{padding:'16px 20px 10px',borderBottom:'1px solid rgba(255,255,255,.05)',position:'relative',overflow:'hidden'}}>
                  <svg style={{position:'absolute',right:0,top:0,pointerEvents:'none'}} width='110' height='70' viewBox='0 0 110 70'>
                    <rect x='55' y='8' width='44' height='54' rx='7' fill='#1e1e1e'/>
                    <rect x='62' y='15' width='30' height='9' rx='2' fill='#00c37b' opacity='.25'/>
                    <rect x='62' y='15' width='30' height='9' rx='2' fill='none' stroke='#00c37b' strokeWidth='.8' opacity='.6'/>
                    <circle cx='86' cy='19' r='3' fill='#00c37b' opacity='.9'/>
                    <rect x='62' y='28' width='30' height='9' rx='2' fill='#252525'/>
                    <circle cx='86' cy='32' r='3' fill='#333'/>
                    <rect x='62' y='41' width='30' height='9' rx='2' fill='#252525'/>
                    <circle cx='86' cy='45' r='3' fill='#333'/>
                    <rect x='48' y='12' width='10' height='46' rx='3' fill='#161616'/>
                    <rect x='99' y='12' width='10' height='46' rx='3' fill='#161616'/>
                    <path d='M77 62 Q77 70 70 70' fill='none' stroke='#00c37b' strokeWidth='1.5' strokeDasharray='3 3' opacity='.6'/>
                    <circle cx='77' cy='8' r='3' fill='#00c37b' opacity='.8'/>
                    <ellipse cx='77' cy='8' rx='5' ry='4' fill='#00c37b' opacity='.2'/>
                  </svg>
                  <div style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.14em',textTransform:'uppercase',marginBottom:3}}>Forge Store</div>
                  <div style={{fontSize:22,fontWeight:800,color:'#fff',letterSpacing:'-.02em'}}>Upgrade Your Node</div>
                </div>

                {/* Category tabs */}
                <div style={{display:'flex',gap:0,padding:'0',borderBottom:'1px solid rgba(255,255,255,.05)',overflowX:'auto'}}>
                  {[['all','All'],['automine','Auto-Mine'],['upgrades','Upgrades'],['boosts','Boosts'],['referral','Referral']].map(([id,lbl])=>(
                    <button key={id} onClick={()=>setStoreTab(id)} style={{padding:'10px 14px',fontSize:11,fontWeight:600,color:storeTab===id?'#00c37b':'rgba(255,255,255,.25)',background:'none',border:'none',borderBottom:`2px solid ${storeTab===id?'#00c37b':'transparent'}`,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,letterSpacing:'.02em',transition:'all .15s',WebkitTapHighlightColor:'transparent'}}>
                      {lbl}
                    </button>
                  ))}
                </div>

                {/* AUTO-MINE */}
                {(storeTab==='all'||storeTab==='automine')&&(
                  <div style={{borderBottom:'1px solid rgba(255,255,255,.05)'}}>
                    <div style={{padding:'14px 20px 4px',fontSize:9,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.12em',textTransform:'uppercase'}}>Auto-Mine</div>
                    {!purchased['auto_lifetime']?(
                      <div style={{display:'flex',flexDirection:'column',gap:0}}>
                        {[
                          {id:'auto_lifetime',icon:'♾️',name:'Lifetime Auto-Mine',desc:'Mine 24/7 forever — even offline',price:30,badge:'FOREVER',highlight:true},
                          {id:'auto_30d',    icon:'autobot',name:'30 Day Auto-Mine',  desc:'Best monthly value',price:10,badge:'POPULAR',highlight:false},
                          {id:'auto_7d',     icon:'autobot',name:'7 Day Auto-Mine',   desc:'Start earning offline today',price:3, badge:null,highlight:false},
                        ].map(item=>{
                          const owned=!!purchased[item.id];
                          return(
                            <div key={item.id} onClick={()=>!owned&&handleBuy({...item,priceTON:item.price,shortDesc:item.desc,earningNote:item.id==='auto_lifetime'?'Pays for itself in ~3 days':'Upgrade to Lifetime for best value'})}
                              style={{padding:'14px 20px',display:'flex',alignItems:'center',gap:12,cursor:owned?'default':'pointer',position:'relative',overflow:'hidden',borderBottom:'1px solid rgba(255,255,255,.04)',WebkitTapHighlightColor:'transparent',background:item.highlight&&!owned?'rgba(192,124,240,.04)':'transparent'}}>
                              {item.highlight&&<div style={{position:'absolute',left:0,top:0,bottom:0,width:2,background:'#b464ff'}}/>}
                              <div style={{width:36,height:36,borderRadius:8,background:item.highlight?'rgba(192,124,240,.1)':'rgba(255,255,255,.04)',border:`1px solid ${item.highlight?'rgba(192,124,240,.2)':'rgba(255,255,255,.07)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                              {item.id==='auto_lifetime'?StoreIcons.infinity('#c07cf0'):StoreIcons.automine('#e8b84b')}
                            </div>
                              <div style={{flex:1}}>
                                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                                  <span style={{fontSize:13,fontWeight:700,color:'#fff'}}>{item.name}</span>
                                  {item.badge&&<span style={{fontSize:8,fontWeight:700,padding:'1px 5px',borderRadius:3,background:item.highlight?'rgba(192,124,240,.15)':'rgba(0,195,123,.1)',color:item.highlight?'#b464ff':'#00c37b'}}>{item.badge}</span>}
                                </div>
                                <div style={{fontSize:10,color:'rgba(255,255,255,.25)'}}>{item.desc}</div>
                              </div>
                              <div style={{textAlign:'right',flexShrink:0}}>
                                {owned
                                  ?<div style={{fontSize:11,fontWeight:700,color:'#00c37b'}}>✓ Active</div>
                                  :<>
                                    <div style={{fontSize:16,fontWeight:800,color:'#fff',lineHeight:1}}>{item.price}</div>
                                    <div style={{fontSize:9,color:'rgba(255,255,255,.3)'}}>TON</div>
                                  </>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ):(
                      <div style={{padding:'14px 20px',display:'flex',alignItems:'center',gap:10,position:'relative',overflow:'hidden'}}>
                        <svg style={{position:'absolute',right:0,top:0,bottom:0,pointerEvents:'none'}} width='80' height='50' viewBox='0 0 80 50'>
                          <rect x='35' y='8' width='36' height='28' rx='6' fill='#1e1e1e'/>
                          <rect x='41' y='14' width='10' height='8' rx='2' fill='#00c37b' opacity='.35'/>
                          <circle cx='46' cy='18' r='3' fill='#00c37b' opacity='.9'/>
                          <rect x='55' y='14' width='10' height='8' rx='2' fill='#00c37b' opacity='.35'/>
                          <circle cx='60' cy='18' r='3' fill='#00c37b' opacity='.9'/>
                          <line x1='53' y1='5' x2='53' y2='14' stroke='#00c37b' strokeWidth='1.2' opacity='.7'/>
                          <circle cx='53' cy='4' r='2.5' fill='#00c37b' opacity='.8'/>
                          <rect x='43' y='26' width='8' height='5' rx='1.5' fill='#252525'/>
                          <rect x='55' y='26' width='8' height='5' rx='1.5' fill='#252525'/>
                          <ellipse cx='53' cy='38' rx='18' ry='3' fill='#00c37b' opacity='.1'/>
                        </svg>
                        <div style={{width:36,height:36,borderRadius:8,background:'rgba(192,124,240,.1)',border:'1px solid rgba(192,124,240,.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          {StoreIcons.infinity('#c07cf0')}
                        </div>
                        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:'#00c37b'}}>Lifetime Auto-Mine Active</div><div style={{fontSize:10,color:'rgba(255,255,255,.22)',marginTop:1}}>Mining 24/7 forever</div></div>
                        <div style={{fontSize:11,color:'#00c37b'}}>✓</div>
                      </div>
                    )}
                  </div>
                )}

                {/* MINING UPGRADES */}
                {(storeTab==='all'||storeTab==='upgrades')&&(
                  <div style={{borderBottom:'1px solid rgba(255,255,255,.05)'}}>
                    <div style={{padding:'14px 20px 10px',fontSize:9,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.12em',textTransform:'uppercase'}}>Mining Upgrades</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,padding:'0 20px 14px'}}>
                      {UPGRADES.map(u=>{
                        const lv=upgrades[u.id]||upgrades[String(u.id)]||0;
                        const maxed=lv>=u.maxLevel;
                        const cost=Math.round(u.baseCost*Math.pow(2.2,lv));
                        const can=balance>=cost&&!maxed;
                        return(
                          <div key={u.id} onClick={()=>can&&(async()=>{
                            setBalance(b=>b-cost);
                            setUpgrades(p=>{const n={...p};n[u.id]=lv+1;n[String(u.id)]=lv+1;return n;});
                            showToast(u.icon,u.name,lv===0?'Activated!':`Level ${lv+1}`);
                            addLog('info',`◈ ${u.name} → Lv.${lv+1}`);
                            api.mining.buyUpgrade(u.id).then(res=>{
                              if(res?.newBalance) setBalance(res.newBalance);
                              if(res?.new_level !== undefined) setUpgrades(p=>{const n={...p};n[u.id]=res.new_level;n[String(u.id)]=res.new_level;return n;});
                            }).catch(()=>{});
                          })()} style={{borderRadius:10,background:maxed?'rgba(0,195,123,.04)':can?'rgba(255,255,255,.04)':'rgba(255,255,255,.02)',border:`1px solid ${maxed?'rgba(0,195,123,.15)':can?'rgba(255,255,255,.1)':'rgba(255,255,255,.05)'}`,padding:'12px',cursor:can?'pointer':'default',WebkitTapHighlightColor:'transparent',position:'relative',overflow:'hidden'}}>
                            <svg style={{position:'absolute',top:0,right:0,opacity:.06,pointerEvents:'none'}} width="60" height="60" viewBox="0 0 60 60">
                              <circle cx="30" cy="30" r="24" fill="none" stroke={u.color} strokeWidth="1.2"/>
                              <circle cx="30" cy="30" r="14" fill="none" stroke={u.color} strokeWidth=".8"/>
                              <circle cx="30" cy="30" r="5" fill={u.color} opacity=".5"/>
                            </svg>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                              <div style={{width:26,height:26,display:'flex',alignItems:'center',justifyContent:'center'}}>
                                {u.id===1&&StoreIcons.neural(u.color)}
                                {u.id===2&&StoreIcons.plasma(u.color)}
                                {u.id===3&&StoreIcons.quantum(u.color)}
                                {u.id===4&&StoreIcons.darkmatter(u.color)}
                                {u.id===5&&StoreIcons.singularity(u.color)}
                              </div>
                              {maxed?<span style={{fontSize:8,fontWeight:700,color:'#00c37b',background:'rgba(0,195,123,.1)',padding:'1px 6px',borderRadius:4}}>MAX</span>
                                :lv>0?<span style={{fontSize:8,fontWeight:700,color:'rgba(255,255,255,.3)',background:'rgba(255,255,255,.06)',padding:'1px 6px',borderRadius:4}}>Lv{lv}/{u.maxLevel}</span>:null}
                            </div>
                            <div style={{fontSize:12,fontWeight:700,color:'#fff',marginBottom:2}}>{u.name}</div>
                            <div style={{fontSize:9,color:'rgba(255,255,255,.22)',marginBottom:6,lineHeight:1.4}}>{u.desc}</div>
                            <div style={{display:'flex',gap:2,marginBottom:6}}>
                              {Array.from({length:u.maxLevel},(_,i)=><div key={i} style={{height:2,flex:1,borderRadius:1,background:i<lv?u.color:'rgba(255,255,255,.08)'}}/>)}
                            </div>
                            <div style={{fontSize:10,fontWeight:700,color:maxed?'#00c37b':can?'#00c37b':'rgba(255,77,77,.7)'}}>{maxed?'Maxed':fmt(cost)+' FRG'}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* BOOSTS + REFERRAL store items */}
                {STORE_SECTIONS.slice(1).map(sec=>{
                  const show=storeTab==='all'||(storeTab==='referral'&&sec.id==='referral')||(storeTab==='boosts'&&(sec.id==='speed'||sec.id==='chests'));
                  if(!show) return null;
                  return(
                    <div key={sec.id} style={{borderBottom:'1px solid rgba(255,255,255,.05)'}}>
                      <div style={{padding:'14px 20px 4px',fontSize:9,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.12em',textTransform:'uppercase'}}>{sec.label}</div>
                      {sec.items.map(item=>{
                        const owned=!!purchased[item.id];
                        return(
                          <div key={item.id} onClick={()=>!owned&&handleBuy(item)}
                            style={{padding:'14px 20px',display:'flex',alignItems:'center',gap:12,cursor:owned?'default':'pointer',borderBottom:'1px solid rgba(255,255,255,.04)',WebkitTapHighlightColor:'transparent',opacity:owned?.6:1}}>
                            <div style={{width:36,height:36,borderRadius:8,background:`${item.color}12`,border:`1px solid ${item.color}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            {item.id?.includes('auto_lifetime')?StoreIcons.infinity(item.color):item.id?.includes('auto')?StoreIcons.automine(item.color):item.id==='speed_perm'?StoreIcons.crystal(item.color):item.id==='speed_5x'?StoreIcons.fire(item.color):item.id?.includes('speed')?StoreIcons.lightning(item.color):item.id==='chest_xl'?StoreIcons.diamond(item.color):item.id?.includes('chest')?StoreIcons.chest(item.color):item.id?.includes('ref')?StoreIcons.antenna(item.color):StoreIcons.lightning(item.color)}
                          </div>
                            <div style={{flex:1}}>
                              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                                <span style={{fontSize:13,fontWeight:700,color:'#fff'}}>{item.name}</span>
                                {item.tag&&<span style={{fontSize:8,fontWeight:700,padding:'1px 5px',borderRadius:3,background:`${item.color}18`,color:item.color}}>{item.tag}</span>}
                              </div>
                              <div style={{fontSize:10,color:'rgba(255,255,255,.25)',marginBottom:2}}>{item.shortDesc}</div>
                              {item.earningNote&&<div style={{fontSize:9,color:'rgba(0,195,123,.6)'}}>◈ {item.earningNote}</div>}
                            </div>
                            <div style={{textAlign:'right',flexShrink:0}}>
                              {owned
                                ?<div style={{fontSize:11,fontWeight:700,color:'#00c37b'}}>✓ Active</div>
                                :<><div style={{fontSize:16,fontWeight:800,color:'#fff',lineHeight:1}}>{item.priceTON}</div><div style={{fontSize:9,color:'rgba(255,255,255,.3)'}}>TON</div></>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {/* TON trust */}
                <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:10,position:'relative',overflow:'hidden'}}>
                  <svg style={{position:'absolute',right:0,top:0,pointerEvents:'none'}} width='90' height='120' viewBox='0 0 90 120'>
                    <polygon points='60,10 78,30 72,55 60,62 48,55 42,30' fill='#1e1e1e'/>
                    <polygon points='60,18 74,34 69,53 60,58 51,53 46,34' fill='#252525'/>
                    <circle cx='60' cy='38' r='10' fill='#5096ff' opacity='.2'/>
                    <circle cx='60' cy='38' r='6' fill='#5096ff' opacity='.4'/>
                    <circle cx='60' cy='38' r='3' fill='#5096ff' opacity='.85'/>
                    <line x1='60' y1='62' x2='60' y2='80' stroke='#5096ff' strokeWidth='1.5' opacity='.5'/>
                    <line x1='60' y1='80' x2='48' y2='100' stroke='#5096ff' strokeWidth='1' opacity='.35'/>
                    <line x1='60' y1='80' x2='72' y2='100' stroke='#5096ff' strokeWidth='1' opacity='.35'/>
                    <circle cx='48' cy='102' r='3' fill='#5096ff' opacity='.4'/>
                    <circle cx='72' cy='102' r='3' fill='#5096ff' opacity='.4'/>
                  </svg>
                  {[{icon:'💎',t:'Native TON Wallet',d:'Connect directly. No third-party.'},{icon:'⛓',t:'On-Chain Verification',d:'Every purchase on TON blockchain.'},{icon:'🔒',t:'Non-Custodial',d:'You control your wallet always.'},{icon:'⚡',t:'~3 Second Settlement',d:'Purchases activate instantly.'}].map((x,i)=>(
                    <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                      <span style={{fontSize:14,flexShrink:0,marginTop:1}}>{x.icon}</span>
                      <div><div style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,.45)',marginBottom:1}}>{x.t}</div><div style={{fontSize:10,color:'rgba(255,255,255,.2)'}}>{x.d}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TEAM TAB
          ══════════════════════════════════════════════════ */}
          {tab==='refer'&&(
            <div style={{background:'#000',minHeight:'100%'}}>
              <svg style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}} viewBox="0 0 430 900" preserveAspectRatio="xMidYMid slice">
                {Array.from({length:22},(_,i)=>Array.from({length:46},(_,j)=>(
                  <circle key={i*100+j} cx={i*20} cy={j*20} r="1" fill="rgba(255,255,255,.07)"/>
                )))}
                <g opacity=".15">
                {/* Two connected figures — solid fills */}
                {/* LEFT FIGURE */}
                <ellipse cx="128" cy="310" rx="26" ry="30" fill="#1a1a1a"/>
                <rect x="104" y="340" width="48" height="65" rx="8" fill="#1a1a1a"/>
                <rect x="110" y="348" width="36" height="42" rx="5" fill="#222"/>
                <rect x="84" y="345" width="22" height="40" rx="7" fill="#1a1a1a"/>
                <rect x="144" y="345" width="22" height="40" rx="7" fill="#1a1a1a"/>
                <rect x="108" y="403" width="16" height="36" rx="6" fill="#161616"/>
                <rect x="128" y="403" width="16" height="36" rx="6" fill="#161616"/>
                {/* LEFT visor */}
                <rect x="110" y="316" width="36" height="14" rx="3" fill="#1e1e1e"/>
                <rect x="113" y="318" width="30" height="10" rx="2" fill="#252525"/>
                {/* RIGHT FIGURE */}
                <ellipse cx="302" cy="310" rx="26" ry="30" fill="#1a1a1a"/>
                <rect x="278" y="340" width="48" height="65" rx="8" fill="#1a1a1a"/>
                <rect x="284" y="348" width="36" height="42" rx="5" fill="#222"/>
                <rect x="258" y="345" width="22" height="40" rx="7" fill="#1a1a1a"/>
                <rect x="318" y="345" width="22" height="40" rx="7" fill="#1a1a1a"/>
                <rect x="282" y="403" width="16" height="36" rx="6" fill="#161616"/>
                <rect x="302" y="403" width="16" height="36" rx="6" fill="#161616"/>
                {/* RIGHT visor — green */}
                <rect x="284" y="316" width="36" height="14" rx="3" fill="#00c37b" opacity=".2"/>
                <rect x="286" y="318" width="32" height="10" rx="2" fill="#00c37b" opacity=".25"/>
                <rect x="288" y="320" width="28" height="5" rx="1" fill="#00c37b" opacity=".55"/>
                {/* Connection beam */}
                <rect x="150" y="375" width="130" height="6" rx="3" fill="#00c37b" opacity=".15"/>
                <rect x="150" y="375" width="130" height="6" rx="3" fill="none" stroke="#00c37b" strokeWidth=".6" opacity=".4"/>
                <circle cx="215" cy="378" rx="7" ry="7" fill="#00c37b" opacity=".4"/>
                <circle cx="215" cy="378" r="13" fill="none" stroke="#00c37b" strokeWidth=".8" opacity=".2"/>
                {/* Ground shadows */}
                <ellipse cx="128" cy="441" rx="36" ry="5" fill="#00c37b" opacity=".05"/>
                <ellipse cx="302" cy="441" rx="36" ry="5" fill="#00c37b" opacity=".05"/>
              </g>
              </svg>

              <div style={{position:'relative',zIndex:1}}>
                {/* Sub-tabs */}
                <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
                  {[['refer','Refer & Earn'],['leaderboard','Leaderboard']].map(([id,lbl])=>(
                    <button key={id} onClick={()=>setTeamTab(id)} style={{flex:1,padding:'12px',fontSize:12,fontWeight:600,color:teamTab===id?'#00c37b':'rgba(255,255,255,.25)',background:'none',border:'none',borderBottom:`2px solid ${teamTab===id?'#00c37b':'transparent'}`,cursor:'pointer',WebkitTapHighlightColor:'transparent',transition:'all .15s'}}>
                      {lbl}
                    </button>
                  ))}
                </div>

                {/* REFER & EARN */}
                {teamTab==='refer'&&(
                  <div>
                    {/* Hero stats */}
                    <div style={{padding:'20px 20px 0'}}>
                      <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.14em',textTransform:'uppercase',marginBottom:4}}>Your Network</div>
                      <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:16}}>
                        <span style={{fontSize:40,fontWeight:800,color:'#fff',lineHeight:1}}>{simRefs}</span>
                        <span style={{fontSize:13,color:'rgba(255,255,255,.3)',fontWeight:500}}>friends invited</span>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:20}}>
                        {[
                          {v:fmt(referralEarnings||simRefs*5000),l:'FRG earned',c:'#00c37b'},
                          {v:'10%',l:'Passive forever',c:'#5096ff'},
                          {v:simRefs>0?`#${lbData?.yourRank||'—'}` :'—',l:'Your rank',c:'rgba(255,255,255,.5)'},
                        ].map((s,i)=>(
                          <div key={i} style={{padding:'10px',background:'rgba(255,255,255,.03)',borderRadius:8,border:'1px solid rgba(255,255,255,.06)'}}>
                            <div style={{fontSize:16,fontWeight:800,color:s.c,marginBottom:2}}>{s.v}</div>
                            <div style={{fontSize:9,color:'rgba(255,255,255,.22)',fontWeight:500}}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Invite link */}
                    <div style={{margin:'0 20px 16px',padding:'14px',background:'rgba(255,255,255,.03)',borderRadius:10,border:'1px solid rgba(255,255,255,.07)'}}>
                      <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>Your invite link</div>
                      <div style={{fontFamily:"'SF Mono',monospace",fontSize:10,color:'rgba(255,255,255,.35)',marginBottom:10,wordBreak:'break-all',lineHeight:1.5}}>
                        {`t.me/${import.meta.env.VITE_BOT_URL?.replace('https://t.me/','')?.replace(/\//g,'')||'ForgeBot'}?start=${refCode||'loading...'}`}
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>{
                          const link=`https://t.me/${import.meta.env.VITE_BOT_URL?.replace('https://','')?.split('/')[0]||'ForgeBot'}?start=${refCode}`;
                          navigator.clipboard?.writeText(link).catch(()=>{});
                          setCopied(true);setTimeout(()=>setCopied(false),2500);
                          showToast('📋','Link Copied!','Share it to earn FRG');
                        }} style={{flex:1,padding:'9px',borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:copied?'#00c37b':'rgba(255,255,255,.4)',fontSize:11,fontWeight:600,cursor:'pointer',transition:'color .2s'}}>
                          {copied?'✓ Copied':'Copy Link'}
                        </button>
                        <button onClick={()=>{
                          const link=`https://t.me/${import.meta.env.VITE_BOT_URL?.replace('https://','')?.split('/')[0]||'ForgeBot'}?start=${refCode}`;
                          const text=encodeURIComponent(`⛏ Mine FRG with me on Forge — early miners earn the most before the next halving!\n\n${link}`);
                          window.Telegram?.WebApp?.openTelegramLink?.(`https://t.me/share/url?url=${link}&text=${text}`);
                        }} style={{flex:1,padding:'9px',borderRadius:8,background:'#00c37b',border:'none',color:'#000',fontSize:11,fontWeight:700,cursor:'pointer'}}>
                          Share on Telegram
                        </button>
                      </div>
                    </div>

                    {/* What friends earn you */}
                    <div style={{margin:'0 20px 16px',padding:'12px 14px',background:'rgba(0,195,123,.04)',borderRadius:10,border:'1px solid rgba(0,195,123,.1)',position:'relative',overflow:'hidden'}}>
                      <svg style={{position:'absolute',right:-6,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}} width='90' height='90' viewBox='0 0 90 90'>
                        <ellipse cx='65' cy='32' rx='20' ry='24' fill='#1a1a1a'/>
                        <ellipse cx='65' cy='32' rx='13' ry='16' fill='#222'/>
                        <rect x='54' y='26' width='22' height='10' rx='3' fill='#00c37b' opacity='.3'/>
                        <rect x='56' y='28' width='18' height='6' rx='2' fill='#00c37b' opacity='.55'/>
                        <circle cx='61' cy='31' r='2.5' fill='#00c37b' opacity='.9'/>
                        <circle cx='69' cy='31' r='2.5' fill='#00c37b' opacity='.9'/>
                        <rect x='52' y='56' width='26' height='30' rx='6' fill='#1a1a1a'/>
                        <rect x='38' y='60' width='16' height='22' rx='5' fill='#1a1a1a'/>
                        <rect x='78' y='60' width='12' height='22' rx='5' fill='#1a1a1a'/>
                        <line x1='46' y1='72' x2='32' y2='80' stroke='#00c37b' strokeWidth='1' opacity='.4'/>
                        <circle cx='30' cy='81' r='3' fill='#00c37b' opacity='.5'/>
                        <ellipse cx='65' cy='87' rx='18' ry='3' fill='#00c37b' opacity='.08'/>
                      </svg>
                      <div style={{fontSize:11,fontWeight:700,color:'#fff',marginBottom:6}}>Each friend you invite gives you:</div>
                      {[['⚡','5,000 FRG','Instant when they join'],['♾️','10% of everything they mine','Passive, forever'],['📈','Higher halving milestone','More users = scarcer FRG']].map((r,i)=>(
                        <div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:i<2?6:0}}>
                          <span style={{fontSize:13,flexShrink:0}}>{r[0]}</span>
                          <span style={{fontSize:11,fontWeight:700,color:'#00c37b'}}>{r[1]}</span>
                          <span style={{fontSize:10,color:'rgba(255,255,255,.25)'}}>{r[2]}</span>
                        </div>
                      ))}
                    </div>

                    {/* Next reward */}
                    {nextTier&&(
                      <div style={{margin:'0 20px 16px',padding:'12px 14px',background:'rgba(255,255,255,.03)',borderRadius:10,border:'1px solid rgba(255,255,255,.07)',position:'relative',overflow:'hidden'}}>
                        <svg style={{position:'absolute',right:60,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',opacity:.5}} width='50' height='60' viewBox='0 0 50 60'>
                          <polygon points='25,4 32,18 48,18 36,28 40,44 25,34 10,44 14,28 2,18 18,18' fill='#1e1e1e'/>
                          <polygon points='25,10 30,20 42,20 33,27 36,39 25,32 14,39 17,27 8,20 20,20' fill='#2a2a2a'/>
                          <polygon points='25,14 29,22 38,22 31,27 34,36 25,30 16,36 19,27 12,22 21,22' fill='#ffc100' opacity='.35'/>
                          <circle cx='25' cy='26' r='5' fill='#ffc100' opacity='.55'/>
                          <circle cx='25' cy='26' r='2.5' fill='#ffc100' opacity='.9'/>
                        </svg>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                          <div>
                            <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.2)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:2}}>Next Reward</div>
                            <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>{nextTier.reward}</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,.25)',marginTop:1}}>{nextTier.refs-simRefs} more friend{nextTier.refs-simRefs!==1?'s':''} needed</div>
                          </div>
                          <div style={{width:44,height:44,borderRadius:'50%',background:`${nextTier.color}12`,border:`1px solid ${nextTier.color}25`,display:'flex',alignItems:'center',justifyContent:'center'}}><TierIcon icon={nextTier.icon} color={nextTier.color} size={24}/></div>
                        </div>
                        <div style={{height:3,borderRadius:100,background:'rgba(255,255,255,.06)',overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${progressPct}%`,borderRadius:100,background:'#00c37b',transition:'width .6s'}}/>
                        </div>
                        <div style={{fontSize:9,color:'rgba(255,255,255,.2)',marginTop:4}}>{simRefs} / {nextTier.refs}</div>
                      </div>
                    )}

                    {/* Reward ladder */}
                    <div style={{padding:'0 20px 6px'}}>
                      <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:10}}>Reward Ladder</div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column'}}>
                      {REF_TIERS.map((tier,i)=>{
                        const reached=simRefs>=tier.refs;
                        const claimed=claimedTiers.has(tier.refs);
                        const isNext=!reached&&REF_TIERS.findIndex(t=>simRefs<t.refs)===i;
                        return(
                          <div key={i} style={{padding:'12px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid rgba(255,255,255,.04)',opacity:(!reached&&!isNext)?.65:1,position:'relative'}}>
                            {reached&&!claimed&&<div style={{position:'absolute',left:0,top:0,bottom:0,width:2,background:'#00c37b'}}/>}
                            {isNext&&<div style={{position:'absolute',left:0,top:0,bottom:0,width:2,background:'rgba(255,193,0,.5)'}}/>}
                            <div style={{width:32,height:32,borderRadius:8,background:`${tier.color}12`,border:`1px solid ${tier.color}28`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><TierIcon icon={tier.icon} color={tier.color} size={18}/></div>
                            <div style={{flex:1}}>
                              <div style={{fontSize:12,fontWeight:700,color:reached?'#fff':'rgba(255,255,255,.65)',marginBottom:1}}>{tier.label}</div>
                              <div style={{fontSize:10,color:'rgba(255,255,255,.22)',marginBottom:2}}>{tier.reward}</div>
                              <div style={{fontSize:9,color:'rgba(255,255,255,.4)'}}>{tier.refs} friends needed</div>
                            </div>
                            <div style={{flexShrink:0}}>
                              {claimed
                                ?<span style={{fontSize:11,fontWeight:700,color:'#00c37b'}}>✓ Claimed</span>
                                :reached
                                  ?<button onClick={async()=>{
                                      try{
                                        const res=await api.referrals.claimTier(tier.refs);
                                        setClaimedTiers(s=>new Set([...s,tier.refs]));
                                        if(typeof res?.frg==='number'){setBalance(b=>b+res.frg);setTotal(t=>t+res.frg);}
                                        showToast(tier.icon,'Reward Claimed!',tier.reward);
                                      }catch(e){showToast('❌','Claim failed','Try again');}
                                    }} style={{padding:'6px 12px',borderRadius:6,background:'#00c37b',border:'none',color:'#000',fontSize:10,fontWeight:700,cursor:'pointer'}}>
                                      Claim
                                    </button>
                                  :<span style={{fontSize:10,color:'rgba(255,255,255,.45)'}}>{tier.refs-simRefs} left</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Security Circle */}
                    <div ref={circleRef} style={{padding:'16px 20px 6px'}}>
                      <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:10}}>Security Circle</div>
                    </div>
                    <SecurityCircle onShowToast={showToast}/>

                    {/* Your network friends */}
                    <div style={{padding:'16px 20px 6px'}}>
                      <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:10}}>Your Friends</div>
                    </div>
                    {refList.length===0?(
                      <div style={{padding:'12px 20px',fontSize:11,color:'rgba(255,255,255,.2)',textAlign:'center'}}>No friends yet — invite someone!</div>
                    ):refList.slice(0,20).map((f,i)=>{
                      const COLORS=['#5ec98a','#5ba8e8','#c07cf0','#e06c4c','#FFB800'];
                      const color=COLORS[i%5];
                      return(
                        <div key={f.id} style={{padding:'12px 20px',display:'flex',alignItems:'center',gap:11,borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                          <div style={{width:34,height:34,borderRadius:'50%',background:`${color}18`,border:`1px solid ${color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color,flexShrink:0}}>
                            {(f.name||'?')[0].toUpperCase()}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12,fontWeight:600,color:'#fff',marginBottom:1}}>{f.name||`User ${f.id}`}</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,.22)'}}>Joined {new Date(f.joined_at).toLocaleDateString()}</div>
                          </div>
                          <div style={{fontSize:11,fontWeight:700,color:'#00c37b',flexShrink:0}}>+{fmt(f.total_mined*0.1)} FRG</div>
                        </div>
                      );
                    })}
                    <div onClick={()=>{
                      const link=`https://t.me/${import.meta.env.VITE_BOT_URL?.replace('https://','')?.split('/')[0]||'ForgeBot'}?start=${refCode}`;
                      window.Telegram?.WebApp?.openTelegramLink?.(`https://t.me/share/url?url=${link}`);
                    }} style={{padding:'12px 20px',display:'flex',alignItems:'center',gap:11,cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>
                      <div style={{width:34,height:34,borderRadius:'50%',border:'1px dashed rgba(255,255,255,.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'#00c37b',flexShrink:0}}>+</div>
                      <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:'#00c37b'}}>Invite a friend</div><div style={{fontSize:10,color:'rgba(255,255,255,.22)'}}>Earn 5,000 FRG per invite</div></div>
                      <span style={{fontSize:14,color:'rgba(255,255,255,.18)'}}>›</span>
                    </div>
                  </div>
                )}

                {/* LEADERBOARD */}
                {teamTab==='leaderboard'&&(
                  <div>
                    <div style={{padding:'16px 20px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div>
                        <div style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.14em',textTransform:'uppercase',marginBottom:3}}>Global Rankings</div>
                        <div style={{fontSize:20,fontWeight:800,color:'#fff'}}>Top Miners</div>
                      </div>
                      {lbData?.yourRank&&<div style={{textAlign:'right'}}>
                        <div style={{fontSize:22,fontWeight:800,color:'#00c37b'}}>#{lbData.yourRank}</div>
                        <div style={{fontSize:9,color:'rgba(255,255,255,.2)'}}>Your rank</div>
                      </div>}
                    </div>
                    {(lbData?.leaderboard||[
                      {name:'0xVault',totalMined:9847291,badge:'SOVEREIGN'},
                      {name:'DeepNode_7',totalMined:6234881,badge:'ELITE'},
                      {name:'Nakamura_X',totalMined:4102334,badge:'ELITE'},
                      {name:'GridMaster',totalMined:2987001,badge:'MINER'},
                      {name:'CryptoZen',totalMined:1843201,badge:'MINER'},
                    ]).slice(0,100).map((l,i)=>{
                      const you=l.isYou||(lbData?.yourRank&&l.rank===lbData.yourRank);
                      return(
                        <div key={i} style={{padding:'11px 20px',display:'flex',alignItems:'center',gap:11,borderBottom:'1px solid rgba(255,255,255,.04)',background:you?'rgba(0,195,123,.04)':'transparent'}}>
                          <div style={{width:28,fontSize:i<3?14:11,fontWeight:800,color:i===0?'#ffc100':i===1?'rgba(255,255,255,.5)':i===2?'#cd7f32':'rgba(255,255,255,.22)',flexShrink:0,textAlign:'center'}}>
                            {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${l.rank||i+1}`}
                          </div>
                          <div style={{width:30,height:30,borderRadius:7,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>{'⬡◈◉◎✦⬟'[i%6]}</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12,fontWeight:600,color:you?'#00c37b':'#fff',marginBottom:1}}>{you?'You':l.name}</div>
                            <div style={{fontSize:9,color:'rgba(255,255,255,.22)'}}>{l.badge||'MINER'}</div>
                          </div>
                          <div style={{fontSize:12,fontWeight:700,color:you?'#00c37b':'rgba(255,255,255,.5)'}}>{you?fmt(balance):fmt(l.totalMined)}</div>
                        </div>
                      );
                    })}
                    {lbData?.yourRank&&!lbData.leaderboard?.some(l=>l.isYou)&&(
                      <div style={{padding:'11px 20px',display:'flex',alignItems:'center',gap:11,background:'rgba(0,195,123,.04)',borderTop:'1px solid rgba(0,195,123,.1)'}}>
                        <div style={{width:28,fontSize:11,fontWeight:800,color:'#00c37b',flexShrink:0,textAlign:'center'}}>#{lbData.yourRank}</div>
                        <div style={{width:30,height:30,borderRadius:7,background:'rgba(0,195,123,.08)',border:'1px solid rgba(0,195,123,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>✦</div>
                        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:'#00c37b'}}>You</div><div style={{fontSize:9,color:'rgba(255,255,255,.22)'}}>MINER</div></div>
                        <div style={{fontSize:12,fontWeight:700,color:'#00c37b'}}>{fmt(balance)}</div>
                      </div>
                    )}
                    <div style={{padding:'10px 20px',fontSize:9,color:'rgba(255,255,255,.15)',textAlign:'center',letterSpacing:'.1em'}}>TOP 100 · UPDATES EVERY 5 MIN</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TASKS TAB
          ══════════════════════════════════════════════════ */}
          {tab==='missions'&&(
            <div style={{background:'#000',minHeight:'100%'}}>
              <svg style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}} viewBox="0 0 430 900" preserveAspectRatio="xMidYMid slice">
                {Array.from({length:22},(_,i)=>Array.from({length:46},(_,j)=>(
                  <circle key={i*100+j} cx={i*20} cy={j*20} r="1" fill="rgba(255,255,255,.07)"/>
                )))}
                <g opacity=".15">
                {/* Trophy — solid Blum style */}
                {/* Cup body */}
                <path d="M160 230 Q155 310 215 335 Q275 310 270 230 Z" fill="#1a1a1a"/>
                <path d="M168 240 Q164 305 215 325 Q266 305 262 240 Z" fill="#1e1e1e"/>
                {/* Handles */}
                <path d="M160 250 Q128 250 128 278 Q128 306 160 306" fill="none" stroke="#1a1a1a" strokeWidth="18" strokeLinecap="round"/>
                <path d="M160 250 Q132 250 132 278 Q132 302 160 302" fill="none" stroke="#222" strokeWidth="10" strokeLinecap="round"/>
                <path d="M270 250 Q302 250 302 278 Q302 306 270 306" fill="none" stroke="#1a1a1a" strokeWidth="18" strokeLinecap="round"/>
                <path d="M270 250 Q298 250 298 278 Q298 302 270 302" fill="none" stroke="#222" strokeWidth="10" strokeLinecap="round"/>
                {/* Stem */}
                <rect x="204" y="334" width="22" height="24" rx="3" fill="#161616"/>
                {/* Base */}
                <rect x="185" y="356" width="60" height="12" rx="4" fill="#161616"/>
                <rect x="178" y="366" width="74" height="10" rx="4" fill="#141414"/>
                {/* Star inside cup */}
                <polygon points="215,258 220,272 235,272 223,281 228,295 215,286 202,295 207,281 195,272 210,272" fill="#00c37b" opacity=".25"/>
                <polygon points="215,263 219,273 230,273 222,280 225,291 215,284 205,291 208,280 200,273 211,273" fill="#00c37b" opacity=".45"/>
                {/* Shine line */}
                <line x1="178" y1="256" x2="185" y2="270" stroke="#2a2a2a" strokeWidth="3" strokeLinecap="round"/>
                {/* Glow */}
                <ellipse cx="215" cy="377" rx="52" ry="6" fill="#00c37b" opacity=".06"/>
              </g>
              </svg>
              <div style={{position:'relative',zIndex:1}}>
                {/* Header */}
                <div style={{padding:'16px 20px 10px',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
                  <div style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.14em',textTransform:'uppercase',marginBottom:3}}>Daily & Missions</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{fontSize:22,fontWeight:800,color:'#fff'}}>Tasks</div>
                    {totalClaimable>0&&<div style={{padding:'4px 10px',borderRadius:100,background:'rgba(0,195,123,.1)',border:'1px solid rgba(0,195,123,.2)',fontSize:10,fontWeight:700,color:'#00c37b'}}>{totalClaimable} ready to claim</div>}
                  </div>
                </div>

                {/* Daily streak */}
                <div style={{padding:'14px 20px',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:1}}>Daily Streak</div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.22)'}}>Keep mining every day</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:22,fontWeight:800,color:'#ffc100',lineHeight:1}}>{streak}🔥</div>
                      <div style={{fontSize:9,color:'rgba(255,255,255,.2)'}}>days</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:4,marginBottom:10}}>
                    {['M','T','W','T','F','S','S'].map((d,i)=>(
                      <div key={i} style={{flex:1,textAlign:'center'}}>
                        <div style={{width:'100%',aspectRatio:1,borderRadius:7,background:i<streak?'rgba(0,195,123,.15)':i===streak?'rgba(255,193,0,.1)':'rgba(255,255,255,.04)',border:`1px solid ${i<streak?'rgba(0,195,123,.3)':i===streak?'rgba(255,193,0,.25)':'rgba(255,255,255,.06)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:i<streak?'#00c37b':i===streak?'#ffc100':'rgba(255,255,255,.2)',marginBottom:3}}>
                          {i<streak?'✓':i===streak?'⛏':d}
                        </div>
                        <div style={{fontSize:8,color:'rgba(255,255,255,.15)'}}>{d}</div>
                      </div>
                    ))}
                  </div>
                  {/* Reward Calendar — shows full progression */}
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:7}}>Reward Schedule</div>
                    <div style={{display:'flex',gap:3}}>
                      {[500,1000,2000,3500,5000,8000,12000].map((reward,i)=>{
                        const isPast=i<streak;
                        const isCurrent=i===streak;
                        return(
                          <div key={i} style={{flex:1,borderRadius:7,background:isPast?'rgba(0,195,123,.08)':isCurrent?'rgba(255,193,0,.1)':'rgba(255,255,255,.03)',border:`1px solid ${isPast?'rgba(0,195,123,.2)':isCurrent?'rgba(255,193,0,.3)':'rgba(255,255,255,.06)'}`,padding:'6px 4px',textAlign:'center',position:'relative'}}>
                            {isCurrent&&<div style={{position:'absolute',top:-5,left:'50%',transform:'translateX(-50%)',fontSize:9,color:'#ffc100'}}>▼</div>}
                            <div style={{fontSize:8,fontWeight:700,color:isPast?'rgba(0,195,123,.6)':isCurrent?'#ffc100':'rgba(255,255,255,.2)',marginBottom:2}}>D{i+1}</div>
                            <div style={{fontSize:9,fontWeight:800,color:isPast?'#00c37b':isCurrent?'#ffc100':'rgba(255,255,255,.35)',lineHeight:1}}>{reward>=1000?`${reward/1000}K`:reward}</div>
                            <div style={{fontSize:7,color:'rgba(255,255,255,.15)',marginTop:1}}>FRG</div>
                            {isPast&&<div style={{position:'absolute',top:3,right:3,fontSize:7,color:'#00c37b'}}>✓</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 10px',background:'rgba(255,193,0,.04)',borderRadius:8,border:'1px solid rgba(255,193,0,.1)'}}>
                    <span style={{fontSize:10,color:'rgba(255,255,255,.3)'}}>Tomorrow's bonus</span>
                    <span style={{fontSize:11,fontWeight:700,color:'#ffc100'}}>+{([500,1000,2000,3500,5000,8000,12000][Math.min(streak,6)]||12000).toLocaleString()} FRG · Day {streak+1}</span>
                  </div>
                </div>

                {/* Missions */}
                <div style={{padding:'14px 20px 6px'}}>
                  <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:10}}>Active Missions</div>
                </div>
                {MISSIONS.map(m=>{
                  const progress=getMProg(m.key);
                  const claimedSet=new Set(claimedCPs[m.id]||[]);
                  const maxCp=m.checkpoints[m.checkpoints.length-1];
                  const pct=Math.min(100,(progress/maxCp.at)*100);
                  const hasClaimable=m.checkpoints.some((cp,i)=>progress>=cp.at&&!claimedSet.has(i));
                  return(
                    <div key={m.id} style={{margin:'0 20px 10px',borderRadius:10,background:hasClaimable?'rgba(0,195,123,.04)':'rgba(255,255,255,.02)',border:`1px solid ${hasClaimable?'rgba(0,195,123,.12)':'rgba(255,255,255,.06)'}`,overflow:'hidden'}}>
                      <div style={{padding:'12px 14px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                          <div style={{width:32,height:32,borderRadius:8,background:`${m.color}12`,border:`1px solid ${m.color}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="7" fill={m.color} opacity=".2" stroke={m.color} strokeWidth="1"/>
                            <circle cx="9" cy="9" r="4" fill={m.color} opacity=".5"/>
                            <circle cx="9" cy="9" r="2" fill={m.color} opacity=".9"/>
                          </svg>
                        </div>
                          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:'#fff',marginBottom:1}}>{m.name}</div><div style={{fontSize:9,color:'rgba(255,255,255,.22)'}}>{fmt(progress)} {m.unit}</div></div>
                          {hasClaimable&&<div style={{fontSize:9,fontWeight:700,color:'#00c37b',background:'rgba(0,195,123,.1)',padding:'2px 7px',borderRadius:4}}>CLAIM</div>}
                        </div>
                        <div style={{height:3,borderRadius:100,background:'rgba(255,255,255,.06)',overflow:'hidden',marginBottom:8}}>
                          <div style={{height:'100%',width:`${pct}%`,borderRadius:100,background:m.color,transition:'width .6s'}}/>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:5}}>
                          {m.checkpoints.map((cp,i)=>{
                            const done=claimedSet.has(i);
                            const claimable=!done&&progress>=cp.at;
                            return(
                              <div key={i} style={{display:'flex',alignItems:'center',gap:8,opacity:(!done&&!claimable)?.6:1}}>
                                <div style={{width:7,height:7,borderRadius:'50%',background:done?'#00c37b':claimable?m.color:'rgba(255,255,255,.12)',flexShrink:0}}/>
                                <div style={{flex:1,fontSize:10,color:done?'rgba(255,255,255,.5)':claimable?'#fff':'rgba(255,255,255,.55)'}}>{cp.l}</div>
                                <div style={{fontSize:10,fontWeight:700,color:done?'rgba(255,255,255,.25)':m.color}}>{done?'✓':fmt(cp.r)}</div>
                                {claimable&&<button onClick={()=>claimCP(m.id,i,cp.r)} style={{padding:'3px 9px',borderRadius:5,background:'#00c37b',border:'none',color:'#000',fontSize:9,fontWeight:700,cursor:'pointer',flexShrink:0}}>Claim</button>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Achievements */}
                <div style={{padding:'16px 20px 6px'}}>
                  <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:10}}>Achievements</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,padding:'0 20px 20px'}}>
                  {[
                    {icon:'star',name:'Genesis',desc:'Started mining',u:totalMined>0,
                      art:<svg width="40" height="20" viewBox="0 0 40 20"><polygon points="20,1 23,8 31,8 25,13 27,20 20,16 13,20 15,13 9,8 17,8" fill="#ffc100" opacity=".7"/></svg>},
                    {icon:'node',name:'Blockchain',desc:'3 blocks found',u:blocks>=3,
                      art:<svg width="40" height="20" viewBox="0 0 40 20"><rect x="2" y="5" width="10" height="10" rx="2" fill="#5096ff" opacity=".6"/><rect x="15" y="5" width="10" height="10" rx="2" fill="#5096ff" opacity=".8"/><rect x="28" y="5" width="10" height="10" rx="2" fill="#5096ff"/><line x1="12" y1="10" x2="15" y2="10" stroke="#5096ff" strokeWidth="1.5"/><line x1="25" y1="10" x2="28" y2="10" stroke="#5096ff" strokeWidth="1.5"/></svg>},
                    {icon:'crystal',name:'Millionaire',desc:'Mined 1M FRG',u:totalMined>=1000000,
                      art:<svg width="40" height="20" viewBox="0 0 40 20"><polygon points="20,2 28,8 25,18 15,18 12,8" fill="#00c37b" opacity=".5"/><polygon points="20,5 26,9 23,16 17,16 14,9" fill="#00c37b" opacity=".8"/><line x1="12" y1="8" x2="28" y2="8" stroke="#00c37b" strokeWidth="1"/></svg>},
                    {icon:'crown',name:'Ref. King',desc:'10 referrals',u:simRefs>=10,
                      art:<svg width="40" height="20" viewBox="0 0 40 20"><polygon points="5,16 5,6 12,12 20,2 28,12 35,6 35,16" fill="#ffc100" opacity=".7"/><rect x="5" y="16" width="30" height="3" rx="1" fill="#ffc100" opacity=".5"/></svg>},
                    {icon:'shield',name:'Whale',desc:'Top 100 global',u:false,
                      art:<svg width="40" height="20" viewBox="0 0 40 20"><path d="M4 12 Q10 4 22 6 Q34 4 38 10 Q36 16 28 15 Q24 18 20 16 Q10 20 4 12Z" fill="#5096ff" opacity=".4"/></svg>},
                    {icon:'fire',name:'OG Miner',desc:'7-day streak',u:streak>=7,
                      art:<svg width="40" height="20" viewBox="0 0 40 20"><path d="M20 2 Q23 8 26 6 Q24 12 28 11 Q25 16 20 18 Q15 16 12 11 Q16 12 14 6 Q17 8 20 2Z" fill="#ff6b3d" opacity=".7"/><circle cx="20" cy="14" r="2.5" fill="#ffc100"/></svg>},
                  ].map((a,i)=>(
                    <div key={i} style={{borderRadius:8,background:a.u?'rgba(255,255,255,.04)':'rgba(255,255,255,.02)',border:`1px solid ${a.u?'rgba(255,255,255,.1)':'rgba(255,255,255,.04)'}`,padding:'10px 8px',textAlign:'center',opacity:a.u?1:.35}}>
                      <div style={{display:'flex',justifyContent:'center',marginBottom:4}}>
                        <TierIcon icon={a.icon} color={a.u?'#fff':'rgba(255,255,255,.3)'} size={26}/>
                      </div>
                      {a.u&&<div style={{display:'flex',justifyContent:'center',marginBottom:3}}>{a.art}</div>}
                      <div style={{fontSize:10,fontWeight:700,color:a.u?'#fff':'rgba(255,255,255,.3)',marginBottom:2}}>{a.name}</div>
                      <div style={{fontSize:9,color:'rgba(255,255,255,.2)'}}>{a.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              PROFILE TAB
          ══════════════════════════════════════════════════ */}
          {tab==='profile'&&(
            <div style={{background:'#000',minHeight:'100%'}}>
              <svg style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}} viewBox="0 0 430 900" preserveAspectRatio="xMidYMid slice">
                {Array.from({length:22},(_,i)=>Array.from({length:46},(_,j)=>(
                  <circle key={i*100+j} cx={i*20} cy={j*20} r="1" fill="rgba(255,255,255,.07)"/>
                )))}
                <g opacity=".15">
                {/* Hooded figure — Blum style, solid fills */}
                {/* Cloak outer shape */}
                <path d="M215 170 Q162 180 148 220 Q136 258 140 300 Q150 345 215 362 Q280 345 290 300 Q294 258 282 220 Q268 180 215 170Z" fill="#161616"/>
                {/* Cloak inner shadow */}
                <path d="M215 185 Q170 195 158 230 Q148 264 152 302 Q162 340 215 354 Q268 340 278 302 Q282 264 272 230 Q260 195 215 185Z" fill="#1a1a1a"/>
                {/* Face/visor area */}
                <ellipse cx="215" cy="268" rx="38" ry="28" fill="#111"/>
                {/* VISOR — green accent */}
                <rect x="183" y="256" width="64" height="18" rx="5" fill="#00c37b" opacity=".18"/>
                <rect x="186" y="258" width="58" height="14" rx="4" fill="#00c37b" opacity=".22"/>
                <rect x="189" y="261" width="52" height="6" rx="2" fill="#00c37b" opacity=".65"/>
                <rect x="189" y="269" width="38" height="2" rx="1" fill="#00c37b" opacity=".3"/>
                {/* Nose/mouth area dark */}
                <rect x="196" y="276" width="38" height="14" rx="4" fill="#151515"/>
                {/* Hood lines */}
                <path d="M215 170 Q196 195 192 225" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
                <path d="M215 170 Q234 195 238 225" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
                {/* Shoulder width */}
                <path d="M148 310 Q148 340 165 350" fill="none" stroke="#1a1a1a" strokeWidth="14" strokeLinecap="round"/>
                <path d="M282 310 Q282 340 265 350" fill="none" stroke="#1a1a1a" strokeWidth="14" strokeLinecap="round"/>
                {/* Ground glow */}
                <ellipse cx="215" cy="365" rx="55" ry="7" fill="#00c37b" opacity=".06"/>
                {/* Data particles */}
                <circle cx="130" cy="240" r="3" fill="#00c37b" opacity=".25"/>
                <circle cx="300" cy="280" r="2.5" fill="#00c37b" opacity=".2"/>
                <circle cx="118" cy="300" r="2" fill="#1e1e1e" stroke="#00c37b" strokeWidth=".5"/>
              </g>
              </svg>
              <div style={{position:'relative',zIndex:1}}>
                {/* Profile hero */}
                <div style={{padding:'24px 20px 16px',textAlign:'center',borderBottom:'1px solid rgba(255,255,255,.05)',position:'relative',overflow:'hidden'}}>
                  {/* Small orbit decoration — top corners only, does not overlap any content */}
                  <svg style={{position:'absolute',top:8,left:16,pointerEvents:'none',opacity:.5}} width='40' height='40' viewBox='0 0 40 40'>
                    <circle cx='20' cy='20' r='16' fill='none' stroke='rgba(255,255,255,.08)' strokeWidth='1' strokeDasharray='3 6'/>
                    <circle cx='20' cy='4' r='3' fill='#00c37b' opacity='.6'/>
                    <circle cx='36' cy='20' r='2' fill='rgba(255,255,255,.2)'/>
                  </svg>
                  <svg style={{position:'absolute',top:8,right:16,pointerEvents:'none',opacity:.5}} width='40' height='40' viewBox='0 0 40 40'>
                    <circle cx='20' cy='20' r='16' fill='none' stroke='rgba(255,255,255,.08)' strokeWidth='1' strokeDasharray='3 6'/>
                    <circle cx='20' cy='4' r='3' fill='#00c37b' opacity='.6'/>
                    <circle cx='4' cy='20' r='2' fill='rgba(255,255,255,.2)'/>
                  </svg>
                  <div style={{width:56,height:56,borderRadius:14,background:'rgba(0,195,123,.08)',border:'1px solid rgba(0,195,123,.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',position:'relative'}}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect x="1" y="17" width="12" height="10" rx="2.5" fill="#00c37b" opacity=".9"/>
                      <rect x="2" y="18.5" width="4" height="3" rx="1" fill="rgba(0,0,0,.25)"/>
                      <rect x="8" y="18.5" width="3" height="3" rx="1" fill="rgba(0,0,0,.25)"/>
                      <line x1="9" y1="17" x2="22" y2="5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M20 3 L26 6 L24 10 L18 7.5 Z" fill="#fff"/>
                      <path d="M18 7.5 L15 15 L13 13 Z" fill="rgba(255,255,255,.6)"/>
                      <circle cx="14" cy="15.5" r="1.8" fill="#ffc100"/>
                      <line x1="16" y1="13.5" x2="19" y2="11" stroke="#ffc100" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    {mining&&<div style={{position:'absolute',bottom:-2,right:-2,width:12,height:12,borderRadius:'50%',background:'#00c37b',border:'2px solid #000'}}/>}
                  </div>
                  <div style={{fontSize:16,fontWeight:800,color:'#fff',marginBottom:6}}>
                    {window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name||'Miner'}
                  </div>
                  <div style={{display:'flex',justifyContent:'center',gap:6,flexWrap:'wrap',marginBottom:14}}>
                    <span style={{fontSize:9,padding:'2px 7px',borderRadius:4,background:'rgba(255,255,255,.06)',color:'rgba(255,255,255,.35)'}}>MINER</span>
                    {hasAutoMine&&<span style={{fontSize:9,padding:'2px 7px',borderRadius:4,background:'rgba(0,195,123,.08)',color:'#00c37b',display:'flex',alignItems:'center',gap:3}}><svg width="10" height="10" viewBox="0 0 20 20" fill="none"><rect x="3" y="7" width="14" height="10" rx="3" fill="#00c37b"/><circle cx="7" cy="11" r="2" fill="#000"/><circle cx="13" cy="11" r="2" fill="#000"/><line x1="10" y1="2" x2="10" y2="7" stroke="#00c37b" strokeWidth="1.5" strokeLinecap="round"/></svg>AUTO-MINE</span>}
                    {hasPermBoost&&<span style={{fontSize:9,padding:'2px 7px',borderRadius:4,background:'rgba(180,100,255,.08)',color:'#b464ff'}}>⚡ 2× CORE</span>}
                    {simRefs>0&&<span style={{fontSize:9,padding:'2px 7px',borderRadius:4,background:'rgba(80,150,255,.08)',color:'#5096ff'}}>👥 {simRefs} REFS</span>}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:1}}>
                    {[{v:fmt(totalMined),l:'Total Mined'},{v:effectiveRate.toFixed(3),l:'FRG/s'},{v:blocks,l:'Blocks'}].map((s,i)=>(
                      <div key={i} style={{padding:'10px 6px',background:'rgba(255,255,255,.03)',borderRadius:i===0?'8px 0 0 8px':i===2?'0 8px 8px 0':'0'}}>
                        <div style={{fontSize:18,fontWeight:800,color:'#fff',lineHeight:1,marginBottom:2}}>{s.v}</div>
                        <div style={{fontSize:9,color:'rgba(255,255,255,.22)',fontWeight:500}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Earnings breakdown */}
                <div style={{padding:'14px 20px',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
                  <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:10}}>Earnings Breakdown</div>
                  {[
                    {dot:'#00c37b',l:'Active mining',v:`${fmt(totalMined)} FRG`},
                    {dot:'#00c37b',l:`Auto-mine${!hasAutoMine?' (locked)':''}`,v:hasAutoMine?`${fmt(Math.floor(totalMined*.3))} FRG`:'—',dim:!hasAutoMine},
                    {dot:'#5096ff',l:'Referral income',v:referralEarnings>0?`${fmt(referralEarnings)} FRG`:`${fmt(simRefs*1240)} FRG`,c:'#5096ff'},
                    {dot:'#b464ff',l:'Mission rewards',v:`${fmt(missionPoints)} FRG`,c:'#b464ff'},
                  ].map((r,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.04)',opacity:r.dim?.45:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:6,height:6,borderRadius:'50%',background:r.dot,flexShrink:0}}/>
                        <span style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>{r.l}</span>
                      </div>
                      <span style={{fontSize:11,fontWeight:600,color:r.c||'rgba(255,255,255,.5)'}}>{r.v}</span>
                    </div>
                  ))}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0 0'}}>
                    <span style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.5)'}}>Total</span>
                    <span style={{fontSize:16,fontWeight:800,color:'#fff'}}>{fmt(totalMined+(hasAutoMine?Math.floor(totalMined*.3):0)+(referralEarnings||simRefs*1240)+missionPoints)} FRG</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{padding:'14px 20px',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.12em',textTransform:'uppercase'}}>Stats</div>
                    {/* Minimal circuit decoration */}
                    <svg width="60" height="12" viewBox="0 0 60 12" style={{opacity:.35}}>
                      <line x1="0" y1="6" x2="12" y2="6" stroke="#00c37b" strokeWidth="1"/>
                      <circle cx="14" cy="6" r="2" fill="#00c37b"/>
                      <line x1="16" y1="6" x2="28" y2="6" stroke="rgba(255,255,255,.2)" strokeWidth="1"/>
                      <circle cx="30" cy="6" r="2" fill="rgba(255,255,255,.2)"/>
                      <line x1="32" y1="6" x2="44" y2="6" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
                      <circle cx="46" cy="6" r="2" fill="rgba(255,255,255,.12)"/>
                      <line x1="48" y1="6" x2="60" y2="6" stroke="rgba(255,255,255,.06)" strokeWidth="1"/>
                    </svg>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                    {[
                      {v:streak,l:'Streak',suffix:'🔥',art:'#ffc100',shape:'flame'},
                      {v:simRefs,l:'Referrals',art:'#00c37b',shape:'people'},
                      {v:[totalMined>0,blocks>=3,totalMined>=1000000].filter(Boolean).length,l:'Badges',art:'#ffc100',shape:'star'},
                      {v:Object.keys(purchased).length,l:'Purchases',art:'#5096ff',shape:'box'},
                      {v:fmt(missionPoints),l:'Mission FRG',art:'#b464ff',shape:'bolt'},
                      {v:`${Math.floor(sessT/60)}m`,l:'Session',art:'#00c37b',shape:'clock'},
                    ].map((s,i)=>(
                      <div key={i} style={{padding:'10px',background:'rgba(255,255,255,.03)',borderRadius:8,border:'1px solid rgba(255,255,255,.05)',position:'relative',overflow:'hidden'}}>
                        {/* Tiny corner accent */}
                        <svg style={{position:'absolute',bottom:4,right:4,pointerEvents:'none'}} width="18" height="18" viewBox="0 0 18 18">
                          {s.shape==='flame'&&<path d="M9 1 Q11 4 12 3 Q11 7 13 6 Q11 10 9 11 Q7 10 5 6 Q7 7 6 3 Q7 4 9 1Z" fill={s.art} opacity=".5"/>}
                          {s.shape==='people'&&<><circle cx="7" cy="6" r="3" fill={s.art} opacity=".5"/><circle cx="13" cy="6" r="3" fill={s.art} opacity=".35"/><path d="M1 16 Q1 11 7 11 Q13 11 13 16" fill={s.art} opacity=".5"/></>}
                          {s.shape==='star'&&<polygon points="9,1 11,7 17,7 12,10 14,16 9,13 4,16 6,10 1,7 7,7" fill={s.art} opacity=".55"/>}
                          {s.shape==='box'&&<><rect x="2" y="2" width="14" height="14" rx="3" fill="none" stroke={s.art} strokeWidth="1.2" opacity=".5"/><circle cx="9" cy="9" r="2.5" fill={s.art} opacity=".5"/></>}
                          {s.shape==='bolt'&&<polygon points="11,1 6,9 10,9 7,17 13,7 9,7" fill={s.art} opacity=".55"/>}
                          {s.shape==='clock'&&<><circle cx="9" cy="9" r="7" fill="none" stroke={s.art} strokeWidth="1.2" opacity=".5"/><line x1="9" y1="9" x2="9" y2="4" stroke={s.art} strokeWidth="1.2" opacity=".7"/><line x1="9" y1="9" x2="13" y2="9" stroke={s.art} strokeWidth="1" opacity=".6"/></>}
                        </svg>
                        <div style={{fontSize:16,fontWeight:800,color:'#fff',lineHeight:1,marginBottom:2}}>{s.v}{s.suffix||''}</div>
                        <div style={{fontSize:9,color:'rgba(255,255,255,.22)'}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account menu */}
                <div style={{padding:'14px 20px 6px'}}>
                  <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.18)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:4}}>Account</div>
                </div>
                {[
                  {icon:'🤖',name:'Auto-Mine',sub:hasAutoMine?'Active — earning while offline':'Not active — set up now',action:()=>setTab('store'),badge:hasAutoMine?'ACTIVE':null,c:'#00c37b'},
                  {icon:'⚡',name:'Upgrades',sub:`${Object.keys(purchased).length} items · more available`,action:()=>setTab('store'),c:'#ffc100'},
                  {icon:'gift',name:'Daily Reward',sub:`Streak: ${streak} days`,action:async()=>{
                    try{
                      const s=await api.profile.getDailyReward();
                      if(s.claimedToday){showToast('🎁','Already Claimed','Come back tomorrow!');}
                      else{const r=await api.profile.claimDailyReward();setBalance(b=>b+r.reward);setTotal(t=>t+r.reward);if(r.streak) setStreak(r.streak);showToast('🎁',`+${fmt(r.reward)} FRG`,`Day ${r.streak||''} streak!`);}
                    }catch(e){showToast('🎁','Claim failed','Try again');}
                  }},
                  {icon:'wallet',name:'TON Wallet',sub:userFriendlyAddress?`${userFriendlyAddress.slice(0,8)}…${userFriendlyAddress.slice(-4)}`:'Not connected',action:()=>{if(userFriendlyAddress)setWalletMenuOpen(true);else tonConnectUI.connectWallet().catch(()=>{});}},
                ].map((item,i,arr)=>(
                  <div key={i} onClick={item.action} style={{padding:'13px 20px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,.04)':'none',WebkitTapHighlightColor:'transparent'}}>
                    <div style={{width:34,height:34,borderRadius:8,background:item.c?`${item.c}10`:'rgba(255,255,255,.04)',border:`1px solid ${item.c?item.c+'20':'rgba(255,255,255,.07)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {item.icon==='gift'&&<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="8" width="14" height="10" rx="2" fill={item.c||'#fff'} opacity=".2" stroke={item.c||'#fff'} strokeWidth="1"/><rect x="1" y="6" width="16" height="3.5" rx="1.5" fill={item.c||'#fff'} opacity=".35" stroke={item.c||'#fff'} strokeWidth="1"/><line x1="9" y1="6" x2="9" y2="18" stroke={item.c||'#fff'} strokeWidth="1" opacity=".5"/><path d="M9 6 Q9 3 6 3 Q3 3 5 6Z" fill={item.c||'#fff'} opacity=".5"/><path d="M9 6 Q9 3 12 3 Q15 3 13 6Z" fill={item.c||'#fff'} opacity=".5"/></svg>}
                    {item.icon==='wallet'&&<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="4" width="16" height="12" rx="2.5" fill={item.c||'#fff'} opacity=".15" stroke={item.c||'#fff'} strokeWidth="1.2"/><circle cx="13" cy="10" r="2" fill={item.c||'#fff'} opacity=".8"/><line x1="1" y1="7" x2="17" y2="7" stroke={item.c||'#fff'} strokeWidth="1" opacity=".4"/></svg>}
                    {item.icon==='🤖'&&StoreIcons.automine(item.c||'#00c37b')}
                    {item.icon==='⚡'&&StoreIcons.lightning(item.c||'#ffc100')}
                    {!['gift','wallet','🤖','⚡'].includes(item.icon)&&<span style={{fontSize:17}}>{item.icon}</span>}
                  </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:'#fff',marginBottom:1}}>{item.name}</div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.25)'}}>{item.sub}</div>
                    </div>
                    {item.badge&&<span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:4,background:'rgba(0,195,123,.1)',color:'#00c37b'}}>{item.badge}</span>}
                    <span style={{fontSize:14,color:'rgba(255,255,255,.18)'}}>›</span>
                  </div>
                ))}

                <div style={{textAlign:'center',padding:'16px 20px',fontSize:9,color:'rgba(255,255,255,.1)',letterSpacing:'.16em'}}>FORGE v1.0 · FRG TOKEN · TON BLOCKCHAIN</div>
              </div>
            </div>
          )}

        </div>{/* end scroll-area */}

        <div className="tabbar">

          {/* MINE — pickaxe striking block with sparks */}
          <button className={`tab${tab==='mine'?' active':''}`} onClick={()=>setTab('mine')}>
            <div className="tab-pip"/>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="2" y="14" width="11" height="10" rx="2" fill={tab==='mine'?'#00c37b':'rgba(255,255,255,.5)'} opacity=".9"/>
              <rect x="3" y="15" width="4" height="3" rx=".5" fill="rgba(0,0,0,.25)"/>
              <rect x="8" y="15" width="4" height="3" rx=".5" fill="rgba(0,0,0,.25)"/>
              <line x1="7.5" y1="14" x2="21" y2="3" stroke={tab==='mine'?'#fff':'rgba(255,255,255,.7)'} strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M19 1 L25 4 L23 8 L17 5.5 Z" fill={tab==='mine'?'#fff':'rgba(255,255,255,.7)'}/>
              <path d="M17 5.5 L14 12 L12 10 Z" fill={tab==='mine'?'rgba(255,255,255,.6)':'rgba(255,255,255,.4)'}/>
              <circle cx="13.5" cy="13" r="1.5" fill="#ffc100"/>
              <line x1="15.5" y1="11" x2="18" y2="9" stroke="#ffc100" strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="14" y1="10" x2="15" y2="7.5" stroke="#ffc100" strokeWidth="1.1" strokeLinecap="round" opacity=".8"/>
              <line x1="17" y1="13" x2="20" y2="12.5" stroke="#ffc100" strokeWidth="1" strokeLinecap="round" opacity=".7"/>
            </svg>
            <span className="tab-label">Mine</span>
          </button>

          {/* UPGRADE — server rack with glowing active unit */}
          <button className={`tab${tab==='store'?' active':''}`} onClick={()=>setTab('store')}>
            <div className="tab-pip"/>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="4" y="5" width="18" height="18" rx="2.5" stroke={tab==='store'?'#00c37b':'rgba(255,255,255,.5)'} strokeWidth="1.4" fill={tab==='store'?'rgba(0,195,123,.12)':'rgba(255,255,255,.06)'}/>
              <rect x="6.5" y="8" width="11" height="3.5" rx="1" fill={tab==='store'?'#00c37b':'rgba(255,255,255,.7)'} opacity=".9"/>
              <circle cx="20.5" cy="9.75" r="1.5" fill={tab==='store'?'#00c37b':'rgba(255,255,255,.7)'}/>
              <rect x="6.5" y="13.5" width="11" height="3.5" rx="1" fill={tab==='store'?'rgba(0,195,123,.35)':'rgba(255,255,255,.3)'}/>
              <circle cx="20.5" cy="15.25" r="1.5" fill={tab==='store'?'rgba(0,195,123,.4)':'rgba(255,255,255,.3)'}/>
              <rect x="6.5" y="19" width="11" height="2.5" rx="1" fill={tab==='store'?'rgba(0,195,123,.18)':'rgba(255,255,255,.15)'}/>
              <circle cx="20.5" cy="20.25" r="1" fill={tab==='store'?'rgba(0,195,123,.2)':'rgba(255,255,255,.15)'}/>
              <line x1="13" y1="2" x2="13" y2="5" stroke={tab==='store'?'#00c37b':'rgba(255,255,255,.5)'} strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="13" cy="1.5" r="1.4" fill={tab==='store'?'#00c37b':'rgba(255,255,255,.5)'}/>
            </svg>
            <span className="tab-label">Upgrade</span>
          </button>

          {/* TEAM — two figures connected by energy node */}
          <button className={`tab${tab==='refer'?' active':''}`} onClick={()=>setTab('refer')}>
            <div className="tab-pip"/>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="7" cy="8" r="3.5" fill={tab==='refer'?'#00c37b':'rgba(255,255,255,.7)'}/>
              <path d="M1 22 Q1.5 15 7 15 Q9.5 15 11 16.5" stroke={tab==='refer'?'#00c37b':'rgba(255,255,255,.7)'} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <rect x="1" y="21" width="10" height="4" rx="2" fill={tab==='refer'?'#00c37b':'rgba(255,255,255,.7)'}/>
              <circle cx="19" cy="8" r="3.5" fill={tab==='refer'?'rgba(0,195,123,.7)':'rgba(255,255,255,.45)'}/>
              <path d="M25 22 Q24.5 15 19 15 Q16.5 15 15 16.5" stroke={tab==='refer'?'rgba(0,195,123,.7)':'rgba(255,255,255,.45)'} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <rect x="15" y="21" width="10" height="4" rx="2" fill={tab==='refer'?'rgba(0,195,123,.7)':'rgba(255,255,255,.45)'}/>
              <circle cx="13" cy="13" r="2.5" fill={tab==='refer'?'#00c37b':'rgba(255,255,255,.8)'}/>
              <circle cx="13" cy="13" r="4.5" fill="none" stroke={tab==='refer'?'#00c37b':'rgba(255,255,255,.4)'} strokeWidth="1" strokeDasharray="2 2"/>
              <line x1="10" y1="13" x2="11" y2="13" stroke={tab==='refer'?'#00c37b':'rgba(255,255,255,.5)'} strokeWidth="1.2"/>
              <line x1="15" y1="13" x2="16" y2="13" stroke={tab==='refer'?'#00c37b':'rgba(255,255,255,.5)'} strokeWidth="1.2"/>
            </svg>
            <span className="tab-label">Team</span>
          </button>

          {/* TASKS — clipboard with glowing checkmark */}
          <button className={`tab${tab==='missions'?' active':''}`} onClick={()=>setTab('missions')}>
            {totalClaimable?<div className="tab-badge">{totalClaimable}</div>:null}
            <div className="tab-pip"/>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="4" y="6" width="18" height="19" rx="2.5" stroke={tab==='missions'?'#00c37b':'rgba(255,255,255,.5)'} strokeWidth="1.4" fill={tab==='missions'?'rgba(0,195,123,.1)':'rgba(255,255,255,.05)'}/>
              <rect x="9" y="3.5" width="8" height="4.5" rx="1.5" fill={tab==='missions'?'#00c37b':'rgba(255,255,255,.6)'} stroke={tab==='missions'?'#00c37b':'rgba(255,255,255,.6)'} strokeWidth="1"/>
              <polyline points="7.5,13 9.5,15.5 13.5,11" stroke={tab==='missions'?'#00c37b':'rgba(255,255,255,.8)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="15" y1="13" x2="19.5" y2="13" stroke={tab==='missions'?'#00c37b':'rgba(255,255,255,.5)'} strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="8" cy="18.5" r="1.5" fill={tab==='missions'?'rgba(0,195,123,.5)':'rgba(255,255,255,.35)'}/>
              <line x1="11" y1="18.5" x2="19.5" y2="18.5" stroke={tab==='missions'?'rgba(0,195,123,.5)':'rgba(255,255,255,.3)'} strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="8" cy="23" r="1.5" fill={tab==='missions'?'rgba(0,195,123,.3)':'rgba(255,255,255,.2)'}/>
              <line x1="11" y1="23" x2="17" y2="23" stroke={tab==='missions'?'rgba(0,195,123,.3)':'rgba(255,255,255,.18)'} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="tab-label">Tasks</span>
          </button>

          {/* PROFILE — hooded figure with green visor eyes */}
          <button className={`tab${tab==='profile'?' active':''}`} onClick={()=>setTab('profile')}>
            <div className="tab-pip"/>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M13 1 Q7 3 5 8 Q3 13 4 18 Q6 23 13 25 Q20 23 22 18 Q23 13 21 8 Q19 3 13 1Z" stroke={tab==='profile'?'#00c37b':'rgba(255,255,255,.55)'} strokeWidth="1.3" fill={tab==='profile'?'rgba(0,195,123,.12)':'rgba(255,255,255,.07)'}/>
              <rect x="8" y="11" width="10" height="5" rx="2.5" fill={tab==='profile'?'#00c37b':'rgba(255,255,255,.5)'} opacity=".45"/>
              <rect x="8.5" y="11.5" width="9" height="4" rx="2" fill={tab==='profile'?'#00c37b':'rgba(255,255,255,.7)'} opacity=".7"/>
              <circle cx="11" cy="13.5" r="1.5" fill={tab==='profile'?'#fff':'rgba(0,0,0,.4)'} opacity={tab==='profile'?1:.7}/>
              <circle cx="15" cy="13.5" r="1.5" fill={tab==='profile'?'#fff':'rgba(0,0,0,.4)'} opacity={tab==='profile'?1:.7}/>
              <path d="M13 1 Q10 5 10 11" stroke={tab==='profile'?'rgba(0,195,123,.5)':'rgba(255,255,255,.25)'} strokeWidth="1" strokeLinecap="round"/>
              <path d="M13 1 Q16 5 16 11" stroke={tab==='profile'?'rgba(0,195,123,.5)':'rgba(255,255,255,.25)'} strokeWidth="1" strokeLinecap="round"/>
              <path d="M9 19 Q13 22 17 19" stroke={tab==='profile'?'#00c37b':'rgba(255,255,255,.4)'} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="tab-label">Profile</span>
          </button>

        </div>
      </div>
    </>
  );
}
