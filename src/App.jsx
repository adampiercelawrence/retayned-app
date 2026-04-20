import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabase";
import { clients as clientsDb, tasks as tasksDb, healthChecks as hcDb, rolodex as rolodexDb, referrals as referralsDb, raiSuggestions as suggestionsDb, raiConversations as convoDb, profile as profileDb, touchpoints as touchpointsDb, buildRaiContext } from "./lib/db";

const C = {
  primary: "#33543E", primaryLight: "#558B68", primarySoft: "#E6EFE9",
  bg: "#F7F7F4", card: "#FFFFFF", surface: "#EEEFEB",
  sidebar: "#E6EFE9",
  text: "#1E261F", textSec: "#5A6E5E", textMuted: "#92A596",
  border: "#D8DFD8", borderLight: "#E8ECE6",
  heroGrad: "linear-gradient(145deg, #1E261F 0%, #2A382C 40%, #33543E 100%)",
  raiGrad: "linear-gradient(145deg, #1E261F 0%, #33543E 55%, #558B68 100%)",
  danger: "#C4432B", warning: "#B88B15", success: "#2D8659",
  btn: "#5B21B6", btnHover: "#4C1D95",
  cardShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
};

const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const paths = {
    today: (<><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill="none"/><circle cx="12" cy="12" r="3.5" fill={color}/></>),
    clients: (<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8" fill="none"/><path d="M23 21v-2a4 4 0 00-3-3.87" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"/><path d="M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"/></>),
    health: (<><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>),
    rai: (<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>),
    rolodex: (<><rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="1.8" fill="none"/><path d="M2 10h20" stroke={color} strokeWidth="1.8"/><circle cx="12" cy="14.5" r="1.5" fill={color}/></>),
    referrals: (<><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8" fill="none"/><path d="M19 8v6M22 11h-6" stroke={color} strokeWidth="2" strokeLinecap="round"/></>),
    settings: (<><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" fill="none"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="1.8" fill="none"/></>),
    sweeps: (<><path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round"/></>),
    target: (<><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" fill="none"/><circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.8" fill="none"/><circle cx="12" cy="12" r="2" fill={color}/></>),
    spark: (<><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/></>),
    send: (<><line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round"/></>),
    more: (<><circle cx="12" cy="5" r="1.5" fill={color}/><circle cx="12" cy="12" r="1.5" fill={color}/><circle cx="12" cy="19" r="1.5" fill={color}/></>),
    chevron: (<><polyline points="9 18 15 12 9 6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>),
    bento: (<><rect x="3" y="3" width="7" height="7" rx="1.5" fill={color}/><rect x="14" y="3" width="7" height="7" rx="1.5" fill={color}/><rect x="3" y="14" width="7" height="7" rx="1.5" fill={color}/><rect x="14" y="14" width="7" height="7" rx="1.5" fill={color}/></>),
    plus: (<><line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/></>),
  };


  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">{paths[name]}</svg>);
};

const ScoreRing = ({ score, size = 44, strokeWidth = 3.5 }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = retColor(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} stroke={C.borderLight} strokeWidth={strokeWidth} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={strokeWidth} fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" style={{ fontSize: size * 0.32, fontWeight: 800, fill: color, fontFamily: "'Manrope', sans-serif" }}>{score}</text>
    </svg>
  );
};

const clientsBase = [
  { id: 1, name: "Northvane Studios", ret: 91, contact: "Sarah Chen", role: "Head of Marketing", months: 34, revenue: 6200, velocity: "fast", lastHC: "Mar 1", lastContact: "today", tag: "Creative", referrals: 2 },
  { id: 2, name: "Oakline Outdoors", ret: 82, contact: "James Park", role: "CMO", months: 18, revenue: 4200, velocity: "normal", lastHC: "Mar 5", lastContact: "2d ago", tag: "DTC", referrals: 0 },
  { id: 3, name: "Ridgeline Supply", ret: 73, contact: "Marcus Webb", role: "Founder & CEO", months: 11, revenue: 4900, velocity: "normal", lastHC: "Mar 15", lastContact: "3d ago", tag: "Ecommerce", referrals: 0 },
  { id: 4, name: "Broadleaf Media", ret: 67, contact: "Rachel Torres", role: "VP Marketing", months: 8, revenue: 7500, velocity: "normal", lastHC: "Mar 10", lastContact: "1d ago", tag: "Media", referrals: 0 },
  { id: 5, name: "Copper & Sage", ret: 55, contact: "Elena Moss", role: "Marketing Director", months: 6, revenue: 2800, velocity: "slowing", lastHC: "Mar 20", lastContact: "5d ago", tag: "Wellness", referrals: 0 },
  { id: 6, name: "Velvet & Co", ret: 44, contact: "Priya Sharma", role: "Brand Manager", months: 4, revenue: 3100, velocity: "slowing", lastHC: "Mar 22", lastContact: "8d ago", tag: "Fashion", referrals: 0 },
  { id: 7, name: "Foxglove Partners", ret: 38, contact: "Tom Aldrich", role: "Director of Ops", months: 3, revenue: 8200, velocity: "cold", lastHC: "Mar 18", lastContact: "14d ago", tag: "B2B", referrals: 0 },
  { id: 8, name: "Evergreen Games", ret: 18, contact: "Derek Holt", role: "VP of Growth", months: 5, revenue: 5800, velocity: "cold", lastHC: "Mar 15", lastContact: "11d ago", tag: "Gaming", referrals: 0 },
];

const healthQueue = [
  { client: "Copper & Sage", ret: 55, due: "Today", overdue: 0 },
  { client: "Velvet & Co", ret: 44, due: "Overdue", overdue: 5 },
  { client: "Foxglove Partners", ret: 38, due: "Overdue", overdue: 9 },
  { client: "Evergreen Games", ret: 18, due: "Overdue", overdue: 12 },
  { client: "Ridgeline Supply", ret: 73, due: "Apr 15", overdue: 0 },
  { client: "Broadleaf Media", ret: 67, due: "Apr 10", overdue: 0 },
  { client: "Oakline Outdoors", ret: 82, due: "Apr 5", overdue: 0 },
  { client: "Northvane Studios", ret: 91, due: "Apr 1", overdue: 0 },
];

const referralsData = [
  { from: "Northvane Studios", to: "Pinehill Collective", date: "Feb 15", converted: true, revenue: 3200 },
  { from: "Northvane Studios", to: "Driftwood Creative", date: "Nov 10", converted: true, revenue: 4100 },
  { from: "Oakline Outdoors", to: "Summit Gear Co", date: "Mar 20", converted: false, revenue: 0 },
];

// Enterprise Data
const enterpriseClients = clientsBase.map(c => ({
  ...c,
  enterprise: {
    automated_scores: {
      loyaltySignal: Math.round(c.ret * 0.08 + Math.random() * 2),
      trustLevel: Math.round(c.ret * 0.07 + Math.random() * 2),
      commFreq: c.velocity === "fast" ? 7 : c.velocity === "normal" ? 5 : c.velocity === "slowing" ? 3 : 2,
      stressResponse: 5 + Math.round((Math.random() - 0.5) * 4),
      expectLevel: 5 + Math.round((Math.random() - 0.5) * 4),
      reportNeed: Math.round(3 + Math.random() * 4),
      relationDepth: Math.round(c.months > 12 ? 7 + Math.random() * 2 : 4 + Math.random() * 3),
      commTone: Math.round(4 + Math.random() * 4),
      decisionSpeed: Math.round(4 + Math.random() * 4),
      feedbackStyle: Math.round(3 + Math.random() * 4),
      metricFocus: Math.round(5 + Math.random() * 4),
      changeAppetite: Math.round(3 + Math.random() * 4),
    },
    baseline_score: c.ret,
    prior_baseline: c.ret + Math.round((Math.random() - 0.4) * 6),
    drift: 0,
    confidence: c.months > 6 ? "high" : "medium",
    archetype: c.ret >= 80 ? null : c.ret >= 60 ? (c.velocity === "slowing" ? "slow_fade" : null) : c.velocity === "cold" ? "silent_exit" : c.ret < 40 ? "budget_squeeze" : "tone_shift",
    retention_outlook: c.ret >= 80 ? "long_term" : c.ret >= 65 ? "strong" : c.ret >= 50 ? "uncertain" : c.ret >= 30 ? "at_risk" : "critical",
    active_signals: [],
    rai_summary: "",
    score_history: Array.from({length: 7}, (_, i) => ({ date: `Apr ${9-i}`, score: c.ret + Math.round((Math.random()-0.5) * 4 * (i+1)/3) })),
    last_sweep: "2026-04-09T06:02:00Z",
  }
}));

// Add signals and summaries
enterpriseClients.forEach(c => {
  const e = c.enterprise;
  e.drift = e.baseline_score - e.prior_baseline;
  if (c.velocity === "cold") e.active_signals.push({ type: "warning", text: `No response in ${Math.round(5 + Math.random()*10)} days` });
  if (c.velocity === "slowing") e.active_signals.push({ type: "warning", text: "Response time increased 40% over 2 weeks" });
  if (c.ret < 50) e.active_signals.push({ type: "warning", text: "Communication frequency declining" });
  if (c.months >= 11 && c.months <= 13) e.active_signals.push({ type: "info", text: "Approaching 1-year anniversary" });
  if (c.ret >= 80) e.active_signals.push({ type: "positive", text: "Engagement strong across all channels" });
  
  const names = { "Northvane Studios": "Sarah", "Oakline Outdoors": "James", "Ridgeline Supply": "Marcus", "Broadleaf Media": "Rachel", "Copper & Sage": "Elena", "Velvet & Co": "Priya", "Foxglove Partners": "Tom", "Evergreen Games": "Derek" };
  const n = names[c.name] || c.contact.split(" ")[0];
  if (c.ret >= 80) e.rai_summary = `${n} is locked in. Strong trust signals, consistent communication. Keep doing what you're doing.`;
  else if (c.ret >= 60) e.rai_summary = `${n} is solid but watch the edges. ${c.velocity === "slowing" ? "Response patterns are shifting — could be seasonal or could be the start of something." : "No red flags yet, but don't coast."}`;
  else if (c.ret >= 40) e.rai_summary = `${n} is pulling back. ${c.velocity === "cold" ? "They've gone quiet — that's never just busy." : "The energy has shifted. This needs a direct conversation, not another email."}`;
  else e.rai_summary = `${n} is at real risk. Multiple signals converging. Call today — not email, not Slack. A real conversation.`;
});


// Referral Intelligence (Enterprise)
const referralReadiness = enterpriseClients.map(c => {
  const e = c.enterprise;
  const scores = e.automated_scores;
  const loyalty = (scores.loyaltySignal || 5) / 10;
  const trust = (scores.trustLevel || 5) / 10;
  const depth = (scores.relationDepth || 5) / 10;
  const readiness = (loyalty * 0.35) + (trust * 0.25) + (depth * 0.20) + (c.ret / 100 * 0.15) + (c.referrals > 0 ? 0.05 : 0);
  const reasons = [];
  if (loyalty >= 0.7) reasons.push("Strong loyalty signals");
  if (trust >= 0.7) reasons.push("High trust level");
  if (depth >= 0.7) reasons.push("Deep personal relationship");
  if (c.months >= 12) reasons.push("Long-standing partnership (" + c.months + " months)");
  if (c.referrals > 0) reasons.push("Has referred before (" + c.referrals + ")");
  if (c.ret >= 80) reasons.push("Excellent retention score");
  if (c.velocity === "fast") reasons.push("Highly engaged right now");
  
  const names = { "Northvane Studios": "Sarah", "Oakline Outdoors": "James", "Ridgeline Supply": "Marcus", "Broadleaf Media": "Rachel", "Copper & Sage": "Elena", "Velvet & Co": "Priya", "Foxglove Partners": "Tom", "Evergreen Games": "Derek" };
  const n = names[c.name] || c.contact.split(" ")[0];
  let approach = "";
  if (readiness >= 0.6) approach = `${n} trusts you and the relationship is deep enough to ask directly. Bring it up casually — "Know anyone who could use what we do?" works better than a formal ask.`;
  else if (readiness >= 0.4) approach = `${n} is getting there but the relationship needs more depth first. Focus on delivering a win this month, then revisit.`;
  else approach = `Not the right time. ${n} needs to feel more confident in the partnership before you ask for anything.`;
  
  return { ...c, readiness: Math.round(readiness * 100), reasons, approach, tier: readiness >= 0.6 ? "ready" : readiness >= 0.4 ? "building" : "not_yet" };
}).sort((a, b) => b.readiness - a.readiness);

const sweepData = {
  id: "sweep_20260409",
  timestamp: "2026-04-09T06:02:00Z",
  type: "daily",
  clients_analyzed: 8,
  alerts_count: 2,
  tasks_generated: 5,
  portfolio_avg_score: Math.round(clientsBase.reduce((a, c) => a + c.ret, 0) / clientsBase.length),
  prior_portfolio_avg: Math.round(clientsBase.reduce((a, c) => a + c.ret, 0) / clientsBase.length) - 2,
  score_distribution: {
    critical: clientsBase.filter(c => c.ret <= 30).length,
    at_risk: clientsBase.filter(c => c.ret > 30 && c.ret <= 50).length,
    watch: clientsBase.filter(c => c.ret > 50 && c.ret <= 65).length,
    stable: clientsBase.filter(c => c.ret > 65 && c.ret <= 80).length,
    strong: clientsBase.filter(c => c.ret > 80).length,
  },
};

const sweepHistory = [
  { date: "Apr 9", clients: 8, avg: 53, alerts: 2 },
  { date: "Apr 8", clients: 8, avg: 52, alerts: 1 },
  { date: "Apr 7", clients: 8, avg: 54, alerts: 0 },
  { date: "Apr 6", clients: 8, avg: 53, alerts: 1 },
  { date: "Apr 5", clients: 8, avg: 55, alerts: 3 },
  { date: "Apr 4", clients: 8, avg: 54, alerts: 0 },
  { date: "Apr 3", clients: 8, avg: 52, alerts: 1 },
];

const sweepTasks = [
  { id: "st1", client: "Foxglove Partners", signal: "Budget Squeeze + Stakeholder Shift", action: "Call Tom today. His boss was cc'd on the last two emails and he requested a performance summary — that's pre-churn behavior. Don't email. Call.", priority: "urgent", timeframe: "Today" },
  { id: "st2", client: "Evergreen Games", signal: "Silent Exit", action: "Derek hasn't responded in 11 days. Send a short, direct message: 'Hey — wanted to check in. Are we good?' Don't over-explain.", priority: "high", timeframe: "Today" },
  { id: "st3", client: "Copper & Sage", signal: "Slow Fade", action: "Elena's response times are creeping up. Schedule a strategy call — reframe the value before she starts shopping.", priority: "high", timeframe: "This week" },
  { id: "st4", client: "Ridgeline Supply", signal: "12-month approaching", action: "Marcus hits 12 months next month. Send a milestone note and open a conversation about next year's scope.", priority: "medium", timeframe: "This week" },
  { id: "st5", client: "Northvane Studios", signal: "Referral opportunity", action: "Sarah's engagement is at an all-time high. Ask about referrals — she's your strongest advocate.", priority: "medium", timeframe: "This month" },
];

const integrations = [
  { cat: "Communication", items: [
    { name: "Slack", icon: "💬", connected: true, meta: "3 workspaces" },
    { name: "Microsoft Teams", icon: "📱", connected: false },
    { name: "Gmail / Google", icon: "📧", connected: true, meta: "2 accounts" },
    { name: "Outlook / Microsoft", icon: "📨", connected: false },
  ]},
  { cat: "Meetings", items: [
    { name: "Zoom", icon: "🎥", connected: true, meta: "Connected" },
    { name: "Google Meet", icon: "📹", connected: false },
    { name: "Microsoft Teams", icon: "📞", connected: false },
  ]},
  { cat: "CRM", items: [
    { name: "HubSpot", icon: "🟠", connected: false },
    { name: "Salesforce", icon: "☁️", connected: false },
    { name: "Pipedrive", icon: "📊", connected: false },
  ]},
  { cat: "Billing", items: [
    { name: "Stripe", icon: "💳", connected: false },
    { name: "QuickBooks", icon: "📗", connected: false },
    { name: "FreshBooks", icon: "📘", connected: false },
  ]},
];

function retColor(v) {
  if (v >= 80) return C.primary;      // Thriving
  if (v >= 65) return "#558B68";      // Healthy
  if (v >= 45) return C.warning;      // Watch
  if (v >= 30) return C.danger;       // At Risk
  return "#8B1E1E";                   // Critical
}
function retBucket(v) {
  if (v >= 80) return "Thriving";
  if (v >= 65) return "Healthy";
  if (v >= 45) return "Watch";
  if (v >= 30) return "At Risk";
  return "Critical";
}
function velColor(v) { return v === "fast" ? C.success : v === "normal" ? C.primaryLight : v === "slowing" ? C.warning : C.danger; }

// Minimal markdown renderer for Rai's chat responses.
// Handles: **bold**, numbered lists, bulleted lists, paragraphs separated by blank lines.
// Safe: uses React nodes, not dangerouslySetInnerHTML.
function RaiMarkdown({ text, size = 16, lineHeight = 1.65 }) {
  if (!text) return null;
  // Split into paragraph blocks on blank lines
  const blocks = text.split(/\n\s*\n/);
  const renderInline = (str, keyPrefix) => {
    // Handle **bold** and *italic* inside a string.
    // Split on bold first to protect its inner asterisks from being matched as italic markers.
    const boldParts = str.split(/(\*\*[^*]+\*\*)/g);
    const nodes = [];
    boldParts.forEach((part, bi) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        nodes.push(<strong key={`${keyPrefix}-b${bi}`} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>);
        return;
      }
      // Now process italics within the non-bold fragment
      const italicParts = part.split(/(\*[^*\n]+\*)/g);
      italicParts.forEach((ip, ii) => {
        if (ip.startsWith("*") && ip.endsWith("*") && ip.length > 2) {
          nodes.push(<em key={`${keyPrefix}-i${bi}-${ii}`} style={{ fontStyle: "italic" }}>{ip.slice(1, -1)}</em>);
        } else if (ip) {
          nodes.push(ip);
        }
      });
    });
    return nodes;
  };
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter(l => l.trim() !== "");
        // Detect numbered list: every line starts with "1. ", "2. ", etc.
        const numberedMatch = lines.length > 0 && lines.every(l => /^\s*\d+\.\s/.test(l));
        if (numberedMatch && lines.length > 1) {
          return (
            <ol key={bi} style={{ fontSize: size, color: C.text, lineHeight, marginTop: bi === 0 ? 0 : 8, marginBottom: 8, paddingLeft: 24 }}>
              {lines.map((l, li) => {
                const content = l.replace(/^\s*\d+\.\s/, "");
                return <li key={li} style={{ marginBottom: 4 }}>{renderInline(content, `${bi}-${li}`)}</li>;
              })}
            </ol>
          );
        }
        // Detect bulleted list: every line starts with "- " or "* "
        const bulletedMatch = lines.length > 0 && lines.every(l => /^\s*[-*]\s/.test(l));
        if (bulletedMatch && lines.length > 1) {
          return (
            <ul key={bi} style={{ fontSize: size, color: C.text, lineHeight, marginTop: bi === 0 ? 0 : 8, marginBottom: 8, paddingLeft: 24 }}>
              {lines.map((l, li) => {
                const content = l.replace(/^\s*[-*]\s/, "");
                return <li key={li} style={{ marginBottom: 4 }}>{renderInline(content, `${bi}-${li}`)}</li>;
              })}
            </ul>
          );
        }
        // Default: paragraph with line breaks
        return (
          <p key={bi} style={{ fontSize: size, color: C.text, lineHeight, margin: 0, marginTop: bi === 0 ? 0 : 10 }}>
            {lines.map((l, li) => (
              <span key={li}>
                {renderInline(l, `${bi}-${li}`)}
                {li < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

const navItemsCore = [
  { id: "today", icon: "today", label: "Today" },
  { id: "clients", icon: "clients", label: "Clients" },
  { id: "health", icon: "health", label: "Health Checks" },
  { id: "retros", icon: "rolodex", label: "Rolodex" },
  { id: "referrals", icon: "referrals", label: "Referrals" },
  { id: "coach", icon: "rai", label: "Talk to Rai" },
];
const navItemsEnterprise = [
  { id: "today", icon: "today", label: "Today" },
  { id: "sweeps", icon: "sweeps", label: "Sweeps" },
  { id: "clients", icon: "clients", label: "Clients" },
  { id: "health", icon: "health", label: "Health Checks" },
  { id: "referral_intel", icon: "target", label: "Referral Intel" },
  { id: "coach", icon: "rai", label: "Talk to Rai" },
];
const mobileNavCore = [
  { id: "today", icon: "today", label: "Today" },
  { id: "clients", icon: "clients", label: "Clients" },
  { id: "coach", icon: "rai", label: "Talk to Rai" },
  { id: "health", icon: "health", label: "Health" },
  { id: "more", icon: "bento", label: "More" },
];
const mobileNavEnterprise = [
  { id: "today", icon: "today", label: "Today" },
  { id: "sweeps", icon: "sweeps", label: "Sweeps" },
  { id: "clients", icon: "clients", label: "Clients" },
  { id: "coach", icon: "rai", label: "Talk to Rai" },
  { id: "more", icon: "bento", label: "More" },
];
const moreItemsCore = [
  { id: "retros", icon: "rolodex", label: "Rolodex" },
  { id: "referrals", icon: "referrals", label: "Referrals" },
  { id: "settings", icon: "settings", label: "Settings" },
];
const moreItemsEnterprise = [
  { id: "settings", icon: "settings", label: "Settings" },
];

const coachOpeners = {
  "Northvane Studios": "Let's talk about Northvane. Sarah's been with you almost 3 years. What's on your mind?",
  "Oakline Outdoors": "Oakline is solid. Anything specific, or just checking in?",
  "Ridgeline Supply": "Ridgeline is at an inflection point. 1-year mark coming. What are you thinking?",
  "Broadleaf Media": "Broadleaf is your highest revenue but stable, not growing. Want to change that?",
  "Copper & Sage": "Copper & Sage has been declining. Elena's pulling back. What happened last call?",
  "Velvet & Co": "Velvet is going vague. Priya used to give detail. What changed?",
  "Foxglove Partners": "Foxglove has been cold 2 weeks. $8.2k/mo. Ready to make a call?",
  "Evergreen Games": "Evergreen is done. Want to think through the Rolodex entry — could they come back or refer?",
};
const coachDemos = {
  "Which clients should I ask for referrals?": "Sarah at Northvane (91%) already referred 2. James at Oakline (82%) hasn't been asked. Everyone below 70%: deepen first.",
  "Who needs attention this week?": "This week: Ridgeline (1-year approaching), Copper & Sage (health check overdue), Foxglove (decision time).",
  "What patterns do my best clients share?": "Your top clients share three traits: they give honest feedback early, they trust your judgment on strategy, and they've been with you long enough to see results compound. Northvane and Oakline both check all three.",
};

const Dot = () => <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.danger, flexShrink: 0 }} />;

export default function App({ user }) {
  const [tier, setTier] = useState("core");  // "core" | "enterprise"
  const [page, setPage] = useState("today");
  const [showMore, setShowMore] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientTab, setClientTab] = useState("overview");
  const [clientBilling, setClientBilling] = useState({});
  const [billingAddOpen, setBillingAddOpen] = useState(false);
  const [billingNewItem, setBillingNewItem] = useState({ description: "", amount: "", recurring: false });
  const [editingOverview, setEditingOverview] = useState(false);
  const [overviewEditData, setOverviewEditData] = useState({});
  const [editingProfile, setEditingProfile] = useState(false);
  const [editScores, setEditScores] = useState({});
  const [retroOpen, setRetroOpen] = useState(null);
  const [retroStep, setRetroStep] = useState(0);
  // ═══ DATA LOADING ═══
  const [dataLoaded, setDataLoaded] = useState(false);
  const [hcQueue, setHcQueue] = useState([]);
  const [retroAnswers, setRetroAnswers] = useState({});
  const [rolodex, setRolodex] = useState([]);
  const [rolodexFlowOpen, setRolodexFlowOpen] = useState(null);
  const [showAddRolodex, setShowAddRolodex] = useState(false);
  const [newRolodexEntry, setNewRolodexEntry] = useState({ client: "", contact: "", work: "" });
  const [rolodexConfirm, setRolodexConfirm] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const [selectedRolodex, setSelectedRolodex] = useState(null);
  const [rolodexRemoveConfirm, setRolodexRemoveConfirm] = useState(false);
  const [rolodexEditing, setRolodexEditing] = useState(false);
  const [rolodexEditData, setRolodexEditData] = useState({});
  const [rolodexSearch, setRolodexSearch] = useState("");
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [clients, setClients] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importTab, setImportTab] = useState("csv"); // "csv" | "paste"
  const [importPaste, setImportPaste] = useState("");
  const [importPreview, setImportPreview] = useState([]);
  const [importFile, setImportFile] = useState(null);
  const [newClient, setNewClient] = useState({ name: "", contact: "", role: "", tag: "", revenue: "", months: "", latePayments: false, prevTerminated: false, otherVendors: false, fromReferral: false });
  const [profileStep, setProfileStep] = useState(0);
  const [profileScores, setProfileScores] = useState({});

  const profileDimensions = [
    { key: "trust", name: "Trust", desc: "Does this client trust you to do your job?", left: "Micromanages everything", right: "Full delegation", weight: 0.15, values: [0.00, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00] },
    { key: "loyalty", name: "Loyalty", desc: "Is this client looking at other options?", left: "Actively shopping", right: "Locked in, not looking", weight: 0.15, values: [0.00, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00] },
    { key: "expectations", name: "Expectations", desc: "Are the client's expectations for your work realistic?", left: "Unrealistic, impossible", right: "Reasonable, aligned", weight: 0.15, values: [0.00, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00] },
    { key: "grace", name: "Grace", desc: "When something goes wrong, how does this client react?", left: "Zero tolerance", right: "Gives benefit of the doubt", weight: 0.15, values: [0.00, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00] },
    { key: "commFrequency", name: "Communication Frequency", desc: "How often does the client reach out to you?", left: "Radio silence, you always initiate", right: "Nonstop, multiple times a day", weight: 0.05, values: [0.20, 0.40, 0.60, 0.80, 0.90, 1.00, 0.90, 0.80, 0.60, 0.40, 0.20] },
    { key: "stressResponse", name: "Stress Response", desc: "When results are bad or something goes wrong, how do you find out?", left: "You don't — they go quiet and deal with it internally", right: "Immediately — they call, escalate, make it known", weight: 0.05, values: [0.05, 0.20, 0.50, 0.85, 1.00, 1.00, 1.00, 0.85, 0.65, 0.40, 0.20] },
    { key: "budgetCommitment", name: "Budget Commitment", desc: "How likely is budget to become a reason this client leaves?", left: "Very likely, always under budget pressure", right: "Never, budget is a non-issue", weight: 0.05, values: [0.00, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00] },
    { key: "relationshipDepth", name: "Relationship Depth", desc: "Beyond business, is there a real relationship here?", left: "Strictly transactional", right: "Genuine connection", weight: 0.05, values: [0.20, 0.30, 0.40, 0.60, 0.80, 0.85, 0.90, 0.95, 1.00, 0.95, 0.90] },
    { key: "reportingNeed", name: "Reporting Need", desc: "How much reporting does this client need from you?", left: "Don't bother me", right: "Wants every detail", weight: 0.05, values: [0.50, 0.80, 0.85, 0.90, 0.95, 1.00, 0.95, 0.90, 0.80, 0.50, 0.20] },
    { key: "replaceability", name: "Replaceability", desc: "How easy would it be for this client to replace you?", left: "Plug and play, anyone could do it", right: "Deeply embedded, hard to replace", weight: 0.05, values: [0.00, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00] },
    { key: "commTone", name: "Communication Tone", desc: "How does this client communicate with you?", left: "Cold, passive-aggressive", right: "Warm, direct", weight: 0.05, values: [0.00, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00] },
    { key: "decisionMaking", name: "Decision Making", desc: "How much authority does your primary contact have?", left: "No authority, just a relay", right: "Full authority, makes the call", weight: 0.05, values: [0.00, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00] },
  ];

  // ─── COMBO DEFINITIONS ───
  const COMBOS = [
    { name: "Bulletproof", type: "positive", max: 2, dims: [{ key: "loyalty", dir: "gte", threshold: 8 }, { key: "grace", dir: "gte", threshold: 8 }] },
    { name: "True partner", type: "positive", max: 2, dims: [{ key: "trust", dir: "gte", threshold: 8 }, { key: "relationshipDepth", dir: "gte", threshold: 7 }] },
    { name: "Locked vault", type: "positive", max: 2, dims: [{ key: "loyalty", dir: "gte", threshold: 8 }, { key: "replaceability", dir: "gte", threshold: 7 }] },
    { name: "Smooth operator", type: "positive", max: 1, dims: [{ key: "commTone", dir: "gte", threshold: 8 }, { key: "expectations", dir: "gte", threshold: 7 }] },
    { name: "Resilient under fire", type: "positive", max: 1, dims: [{ key: "stressResponse", dir: "between", threshold: 4, upper: 6 }, { key: "grace", dir: "gte", threshold: 7 }] },
    { name: "All-in investor", type: "positive", max: 1, dims: [{ key: "budgetCommitment", dir: "gte", threshold: 8 }, { key: "trust", dir: "gte", threshold: 7 }] },
    { name: "Decision express", type: "positive", max: 1, dims: [{ key: "decisionMaking", dir: "gte", threshold: 8 }, { key: "commFrequency", dir: "between", threshold: 3, upper: 7 }] },
    { name: "Open book", type: "positive", max: 1, dims: [{ key: "commTone", dir: "gte", threshold: 7 }, { key: "stressResponse", dir: "between", threshold: 4, upper: 6 }] },
    { name: "Sticky by design", type: "positive", max: 1, dims: [{ key: "replaceability", dir: "gte", threshold: 7 }, { key: "relationshipDepth", dir: "gte", threshold: 7 }] },
    { name: "Low maintenance loyalty", type: "positive", max: 1, dims: [{ key: "loyalty", dir: "gte", threshold: 7 }, { key: "reportingNeed", dir: "between", threshold: 2, upper: 5 }] },
    { name: "Ticking time bomb", type: "negative", max: 2, dims: [{ key: "expectations", dir: "lte", threshold: 3 }, { key: "grace", dir: "lte", threshold: 3 }] },
    { name: "On the clock", type: "negative", max: 2, dims: [{ key: "trust", dir: "lte", threshold: 3 }, { key: "loyalty", dir: "lte", threshold: 3 }] },
    { name: "No room to operate", type: "negative", max: 2, dims: [{ key: "trust", dir: "lte", threshold: 3 }, { key: "grace", dir: "lte", threshold: 3 }] },
    { name: "One foot out", type: "negative", max: 2, dims: [{ key: "loyalty", dir: "lte", threshold: 3 }, { key: "replaceability", dir: "lte", threshold: 3 }] },
    { name: "Silent exit", type: "negative", max: 1, dims: [{ key: "stressResponse", dir: "lte", threshold: 2 }, { key: "commFrequency", dir: "lte", threshold: 2 }] },
    { name: "Powder keg", type: "negative", max: 1, dims: [{ key: "stressResponse", dir: "gte", threshold: 8 }, { key: "expectations", dir: "lte", threshold: 3 }] },
    { name: "Ice wall", type: "negative", max: 1, dims: [{ key: "commTone", dir: "lte", threshold: 3 }, { key: "trust", dir: "lte", threshold: 3 }] },
    { name: "Nickel and dime", type: "negative", max: 1, dims: [{ key: "budgetCommitment", dir: "lte", threshold: 2 }, { key: "reportingNeed", dir: "gte", threshold: 8 }] },
    { name: "No anchor", type: "negative", max: 1, dims: [{ key: "relationshipDepth", dir: "lte", threshold: 2 }, { key: "replaceability", dir: "lte", threshold: 3 }] },
    { name: "Bottleneck doom", type: "negative", max: 1, dims: [{ key: "decisionMaking", dir: "lte", threshold: 3 }, { key: "expectations", dir: "lte", threshold: 4 }] },
  ];

  // ─── COMBO STRENGTH CALC ───
  const calcComboStrength = (dimDef, rawVal) => {
    if (rawVal == null) return null;
    if (dimDef.dir === "gte") { if (rawVal < dimDef.threshold) return null; const r = 10 - dimDef.threshold; return r === 0 ? 1 : 0.2 + ((rawVal - dimDef.threshold) / r) * 0.8; }
    if (dimDef.dir === "lte") { if (rawVal > dimDef.threshold) return null; const r = dimDef.threshold; return r === 0 ? 1 : 0.2 + ((dimDef.threshold - rawVal) / r) * 0.8; }
    if (dimDef.dir === "between") { if (rawVal < dimDef.threshold || rawVal > dimDef.upper) return null; const mid = (dimDef.threshold + dimDef.upper) / 2; const hr = (dimDef.upper - dimDef.threshold) / 2; return hr === 0 ? 1 : 0.2 + ((hr - Math.abs(rawVal - mid)) / hr) * 0.8; }
    return null;
  };

  const calcCombos = (scores) => {
    const dimWeights = {};
    profileDimensions.forEach(d => { dimWeights[d.key] = d.weight; });
    const triggered = [];
    for (const combo of COMBOS) {
      const strengths = combo.dims.map(d => calcComboStrength(d, scores[d.key]));
      if (strengths.some(s => s === null)) continue;
      let ws = 0, tw = 0;
      combo.dims.forEach((d, i) => { ws += strengths[i] * (dimWeights[d.key] || 0.05); tw += (dimWeights[d.key] || 0.05); });
      const norm = tw > 0 ? ws / tw : 0;
      const value = Math.round(norm * combo.max * 100) / 100;
      triggered.push({ name: combo.name, type: combo.type, max: combo.max, value: combo.type === "negative" ? -value : value, strength: Math.round(norm * 100) });
    }
    return triggered;
  };

  // ─── HEALTH CHECK SCORING ───
  const HC_QUESTIONS_SCORED = [
    { key: "bigMovers", weight: 0.40 },
    { key: "holisticDrift", weight: 0.20 },
    { key: "commChange", weight: 0.20 },
    { key: "gutCheck", weight: 0.10 },
    { key: "performanceDrift", weight: 0.10 },
  ];

  const calcHealthCheckScore = (hcAnswersArr) => {
    if (!hcAnswersArr || hcAnswersArr.length < 5) return null;
    let ws = 0, tw = 0;
    HC_QUESTIONS_SCORED.forEach((q, i) => {
      const v = hcAnswersArr[i];
      if (v == null) return;
      ws += (v / 10) * q.weight;
      tw += q.weight;
    });
    if (tw === 0) return null;
    return Math.round((ws / tw) * 100);
  };

  // ─── RETENTION SCORE (dimensions + combos + HC blend) ───
  const calcRetentionScore = (scores, hcAnswersArr, qualFlags = null, months = 0) => {
    let weightedSum = 0, totalWeight = 0, scored = 0;
    for (const dim of profileDimensions) {
      const raw = scores[dim.key];
      if (raw == null || raw === "") continue;
      const val = dim.values[Math.round(Math.max(0, Math.min(10, raw)))];
      const rw = dim.weight;
      weightedSum += val * rw;
      totalWeight += rw;
      scored++;
    }
    if (totalWeight === 0) return null;
    // Renormalize if not all dimensions scored
    const dimensionScore = Math.round((weightedSum / totalWeight) * 100);

    // Combos
    const triggered = calcCombos(scores);
    const positives = triggered.filter(c => c.type === "positive").sort((a, b) => b.value - a.value);
    const negatives = triggered.filter(c => c.type === "negative").sort((a, b) => a.value - b.value);
    const posH = [1.0, 0.75, 0.50, 0.25, 0.125, 0.0625, 0.03, 0.015, 0.01, 0.005];
    const negD = [1.0, 0.90, 0.80, 0.70, 0.60, 0.50, 0.40, 0.30, 0.20, 0.10];
    let pt = 0, nt = 0;
    positives.forEach((c, i) => { c.dm = posH[i] || 0.005; c.dv = Math.round(c.value * c.dm * 100) / 100; pt += c.dv; });
    negatives.forEach((c, i) => { c.dm = negD[i] || 0.10; c.dv = Math.round(c.value * c.dm * 100) / 100; nt += c.dv; });
    const comboTotal = Math.round((pt + nt) * 100) / 100;
    const baselineScore = dimensionScore + Math.round(comboTotal);

    // HC blend: 80% baseline + 20% HC
    const hcScore = calcHealthCheckScore(hcAnswersArr);
    let finalScore = hcScore != null ? Math.round(baselineScore * 0.80 + hcScore * 0.20) : baselineScore;

    // Qualifying question adjustments
    if (qualFlags) {
      if (qualFlags.latePayments) finalScore -= 4;
      if (qualFlags.prevTerminated) finalScore -= 8;
      if (qualFlags.otherVendors) finalScore -= 3;
      if (qualFlags.fromReferral) finalScore += 2;
    }

    // Tenure bonus: +1 per year, cap +5
    const tenureYears = Math.floor((months || 0) / 12);
    finalScore += Math.min(5, tenureYears);

    // Block 0 and 100, clamp 1-99
    if (finalScore <= 0) finalScore = 1;
    if (finalScore >= 100) finalScore = 99;
    finalScore = Math.max(1, Math.min(99, finalScore));

    return finalScore;
  };

  // ─── PROFILE SCORE (invisible sort layer) ───
  const percentileRank = (arr, val) => { if (arr.length <= 1) return 0.5; const s = [...arr].sort((a, b) => a - b); return s.indexOf(val) / (s.length - 1); };

  // Referral-adjusted LTV: client's own LTV + 50% of revenue from clients they referred
  const getAdjustedLTV = (client) => {
    const ownLTV = (client.revenue || 0) * (client.months || 0);
    const referralRevenue = refs
      .filter(r => r.from === client.name && (r.status === "converted" || r.converted))
      .reduce((sum, r) => {
        // Find the referred client's total revenue
        const referredClient = clients.find(c => c.name === r.to);
        const refLTV = referredClient 
          ? (referredClient.revenue || 0) * (referredClient.months || 0)
          : (r.revenue || 0) * 12; // estimate if not a client yet
        return sum + refLTV;
      }, 0);
    return ownLTV + (referralRevenue * 0.50);
  };

  const calcProfileScore = (rs, client, allClients) => {
    if (rs == null || allClients.length === 0) return rs || 0;
    const total = allClients.reduce((a, c) => a + (c.revenue || 0), 0);
    const avg = 1 / allClients.length;
    const revFactor = total > 0 ? ((client.revenue || 0) / total) / avg : 1;
    const revNorm = Math.max(0.75, Math.min(1.50, 0.4 + revFactor * 0.6));
    const ltvF = 0.8 + percentileRank(allClients.map(c => getAdjustedLTV(c)), getAdjustedLTV(client)) * 0.4;
    const tenF = 0.8 + percentileRank(allClients.map(c => c.months || 0), client.months || 0) * 0.4;
    const multiplier = Math.max(0.90, revNorm * 0.60 + ltvF * 0.20 + tenF * 0.20);
    return Math.max(1, Math.min(99, Math.round(rs * multiplier)));
  };

  // ─── NEW CLIENT BOOST ───
  const calcNewClientBoost = (rs, revPct, daysSinceStart) => {
    if (rs < 40 || daysSinceStart >= 30) return 0;
    const bonusPts = Math.min(17.5, 17.5 * Math.pow(Math.min(revPct, 0.50) / 0.40, 0.50));
    const decay = Math.max(0, 1 - (daysSinceStart / 30));
    return Math.round(bonusPts * decay);
  };

  const submitNewClient = async () => {
    const qualFlags = { latePayments: newClient.latePayments, prevTerminated: newClient.prevTerminated, otherVendors: newClient.otherVendors, fromReferral: newClient.fromReferral };
    const baseline = calcRetentionScore(profileScores, null, qualFlags, parseInt(newClient.months) || 0);
    
    // Insert into Supabase first
    const { data: created, error } = await clientsDb.create(user.id, {
      name: newClient.name,
      contact: newClient.contact,
      role: newClient.role || "",
      tag: newClient.tag || "",
      revenue: parseInt(newClient.revenue) || 0,
      months: parseInt(newClient.months) || 0,
      retention_score: baseline || 50,
      profile_scores: { ...profileScores },
      qualifying_flags: qualFlags,
    });
    
    if (error) { console.error("Failed to create client:", error); return; }

    const client = {
      id: created?.id || Date.now(),
      name: newClient.name,
      contact: newClient.contact,
      role: newClient.role,
      tag: newClient.tag,
      revenue: parseInt(newClient.revenue) || 0,
      months: parseInt(newClient.months) || 0,
      velocity: "normal",
      lastHC: null,
      lastContact: "today",
      referrals: 0,
      ret: baseline || 50,
      profileScores: { ...profileScores },
      qualifyingFlags: qualFlags,
      daysOld: 0,
    };
    setClients([...clients, client].sort((a, b) => (b.ret || 0) - (a.ret || 0)));
    setShowAddClient(false);
    setNewClient({ name: "", contact: "", role: "", tag: "", revenue: "", months: "" });
    setProfileStep(0);
    setProfileScores({});
  };

  // Today — task manager
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskClient, setNewTaskClient] = useState("");
  const [newTaskRecurring, setNewTaskRecurring] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [taskClientSearch, setTaskClientSearch] = useState("");
  const [showTouchpoint, setShowTouchpoint] = useState(false);
  const [tpClient, setTpClient] = useState(null);
  const [tpChannel, setTpChannel] = useState(null);
  const [tpSearch, setTpSearch] = useState("");
  const [tpLogged, setTpLogged] = useState([]);
  const [confetti, setConfetti] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showStreakModal, setShowStreakModal] = useState(false);

  // ═══ FETCH ALL DATA ON MOUNT ═══
  const loadData = useCallback(async () => {
    if (!user) return;
    const uid = user.id;
    
    const [clientRes, taskRes, refRes, rolodexRes, suggestionRes, hcRes, tpRes] = await Promise.all([
      clientsDb.list(uid),
      tasksDb.listToday(uid),
      referralsDb.list(uid),
      rolodexDb.list(uid),
      suggestionsDb.listPending(uid),
      hcDb.listPending(uid),
      touchpointsDb.listToday(uid),
    ]);

    if (tpRes.data) setTpLogged(tpRes.data.map(t => ({
      id: t.id,
      client: t.client_name,
      channel: t.channel,
    })));

    if (clientRes.data) setClients(clientRes.data.map(c => ({
      ...c,
      ret: c.retention_score || 0,
      contact: c.contact || "",
      role: c.role || "",
      months: c.months || 0,
      revenue: c.revenue || 0,
      tag: c.tag || "",
      lastHC: c.last_hc_date || null,
      lastContact: c.last_task_date ? "recent" : "—",
      referrals: 0,
      profileScores: c.profile_scores || {},
      qualifyingFlags: c.qualifying_flags || {},
    })));

    if (taskRes.data) {
      // Auto-reset recurring tasks that were completed before the most recent 2 AM local time
      const now = new Date();
      const today2am = new Date(now);
      today2am.setHours(2, 0, 0, 0);
      const cutoff = now < today2am ? new Date(today2am.getTime() - 86400000) : today2am;

      const toReset = taskRes.data.filter(t =>
        t.is_recurring && t.is_done &&
        t.completed_at && new Date(t.completed_at) < cutoff
      );

      // Fire off DB updates in background (don't block UI)
      toReset.forEach(t => { tasksDb.toggle(t.id, false); });

      setTasks(taskRes.data.map(t => {
        const reset = toReset.find(r => r.id === t.id);
        return {
          id: t.id,
          text: t.text,
          client: t.client_name || "",
          done: reset ? false : t.is_done,
          ai: t.is_ai_generated,
          alert: t.is_alert,
          recurring: t.is_recurring,
          sort_order: t.sort_order,
          raiPriority: t.is_alert || false,
        };
      }));
    }

    if (refRes.data) setRefs(refRes.data.map(r => ({
      id: r.id,
      to: r.referred_to,
      from: r.referred_by,
      date: r.date_added || "",
      converted: r.status === "converted",
      status: r.status,
      revenue: r.revenue || 0,
      totalRevenue: r.total_revenue || 0,
    })));

    if (rolodexRes.data) setRolodex(rolodexRes.data.map(r => ({
      id: r.id,
      client: r.client_name,
      contact: r.contact_name,
      months: r.months || 0,
      type: r.type,
      date: r.date_added || "",
      tags: r.tags || [],
      priority: r.priority,
      reminder: r.reminder_date,
      work: r.notes,
    })));

    // Map rai_suggestions into the aiTasks format
    // (suggestions stay in their own table, tasks are separate)
    
    // Load retro answers from rolodex entries
    if (rolodexRes.data) {
      const answers = {};
      rolodexRes.data.forEach(r => {
        if (r.retro_answers && Object.keys(r.retro_answers).length > 0) {
          answers[r.id] = r.retro_answers;
        }
      });
      setRetroAnswers(answers);
    }

    // Load drift status
    if (clientRes.data) {
      const drifts = {};
      clientRes.data.forEach(c => {
        if (c.drift_status) drifts[c.name] = c.drift_status;
      });
      setClientDrift(drifts);
    }

    // Map health checks to queue format
    if (hcRes.data) {
      setHcQueue(hcRes.data.map(h => {
        const client = h.client;
        const dueDate = h.due_date ? new Date(h.due_date) : null;
        const today = new Date();
        today.setHours(0,0,0,0);
        const overdue = dueDate ? Math.max(0, Math.floor((today - dueDate) / (1000*60*60*24))) : 0;
        const isToday = dueDate && dueDate.toDateString() === today.toDateString();
        return {
          id: h.id,
          client_id: h.client_id,
          client: client?.name || "Unknown",
          ret: client?.retention_score || 0,
          due: isToday ? "Today" : dueDate ? dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
          overdue: overdue,
        };
      }));
    }

    setDataLoaded(true);
  }, [user]);


  useEffect(() => { loadData(); }, [loadData]);

  // Schedule automatic recurring-task reset at 2 AM local, every day
  // Fires even if the tab stays open across midnight — ensures no one sees stale "done" checkmarks
  useEffect(() => {
    if (!user) return;
    let timeoutId;
    const scheduleNext2am = () => {
      const now = new Date();
      const next2am = new Date(now);
      next2am.setHours(2, 0, 0, 0);
      if (next2am <= now) next2am.setDate(next2am.getDate() + 1);
      const msUntil = next2am.getTime() - now.getTime();
      timeoutId = setTimeout(() => {
        loadData();
        scheduleNext2am();
      }, msUntil);
    };
    scheduleNext2am();

    // Also refresh when tab regains focus — catches laptop-sleep case where setTimeout
    // may have paused across system sleep and missed the 2 AM fire
    const onVisible = () => { if (document.visibilityState === "visible") loadData(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user, loadData]);

  // ═══ SUPABASE-BACKED MUTATIONS ═══
  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newDone = !task.done;
    // Optimistic update
    const updated = tasks.map(t => t.id === id ? { ...t, done: newDone } : t);
    setTasks(updated);
    const countable = updated.filter(t => !t.ai);
    const doneNow = countable.filter(t => t.done).length;
    if (doneNow === countable.length && countable.length > 0) {
      setConfetti(true);
      setStreak(prev => prev + 1);
      setShowStreakModal(true);
      setTimeout(() => setConfetti(false), 3000);
    }
    // Persist
    await tasksDb.toggle(id, newDone);
  };
  const dismissAi = async (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    await tasksDb.delete(id);
  };
  const promoteAi = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const promoted = { ...task, ai: false, recurring: false, alert: task.alert || false };
    const promotedPS = getProfileSortScore(promoted.client);
    const withoutTask = tasks.filter(t => t.id !== id);
    // Try to insert next to same client first
    let insertAfterIdx = -1;
    if (promoted.client) {
      for (let i = withoutTask.length - 1; i >= 0; i--) {
        if (!withoutTask[i].ai && withoutTask[i].client === promoted.client) {
          insertAfterIdx = i;
          break;
        }
      }
    }
    // Fall back to Profile Score ordering
    if (insertAfterIdx === -1) {
      for (let i = withoutTask.length - 1; i >= 0; i--) {
        if (!withoutTask[i].ai && getProfileSortScore(withoutTask[i].client) >= promotedPS) {
          insertAfterIdx = i;
          break;
        }
      }
    }
    if (insertAfterIdx === -1) {
      const firstTask = withoutTask.findIndex(t => !t.ai);
      insertAfterIdx = firstTask >= 0 ? firstTask - 1 : -1;
    }
    const newTasks = [...withoutTask];
    newTasks.splice(insertAfterIdx + 1, 0, promoted);
    setTasks(newTasks);
  };
  const addTask = async () => {
    if (!newTask.trim()) return;
    const clientObj = clients.find(c => c.name === newTaskClient);
    const { data: created } = await tasksDb.create(user.id, {
      text: newTask.trim(),
      client_name: newTaskClient || "",
      client_id: clientObj?.id || null,
      is_recurring: newTaskRecurring,
    });
    const task = { id: created?.id || "u" + Date.now(), text: newTask.trim(), client: newTaskClient || null, done: false, ai: false, recurring: newTaskRecurring };
    const taskPS = getProfileSortScore(task.client);
    const newTasks = [...tasks];
    const allTasksFilter = (t => !t.ai);
    
    // Try to insert next to same client first
    let insertIdx = -1;
    if (task.client) {
      for (let i = newTasks.length - 1; i >= 0; i--) {
        if (allTasksFilter(newTasks[i]) && newTasks[i].client === task.client) {
          insertIdx = i;
          break;
        }
      }
    }
    // Fall back to Profile Score ordering
    if (insertIdx === -1) {
      for (let i = newTasks.length - 1; i >= 0; i--) {
        if (allTasksFilter(newTasks[i]) && getProfileSortScore(newTasks[i].client) >= taskPS) {
          insertIdx = i;
          break;
        }
      }
    }
    
    if (insertIdx >= 0) {
      newTasks.splice(insertIdx + 1, 0, task);
    } else {
      const firstTaskIdx = newTasks.findIndex(allTasksFilter);
      if (firstTaskIdx >= 0) {
        newTasks.splice(firstTaskIdx, 0, task);
      } else {
        newTasks.push(task);
      }
    }
    
    setTasks(newTasks);
    setNewTask(""); setNewTaskClient(""); setNewTaskRecurring(false); setShowClientPicker(false);
  };

  const recurringTasks = tasks.filter(t => t.recurring && !t.ai);
  const todayTasks = tasks.filter(t => !t.recurring && !t.ai);
  const aiTasks = tasks.filter(t => t.ai);
  const countableTasks = tasks.filter(t => !t.ai);

  // Priority grouping by client retention
  const getClientRet = (clientName) => {
    if (!clientName || clientName === "All Clients") return 100;
    const c = clients.find(x => x.name === clientName);
    return c ? c.ret : 50;
  };
  const getClientPriority = (clientName) => {
    if (!clientName || clientName === "All Clients") return 0;
    const c = clients.find(x => x.name === clientName);
    if (!c) return 0;
    // Profile Score drives priority (invisible sort layer)
    const ps = calcProfileScore(c.ret || 50, c, clients);
    const boost = calcNewClientBoost(c.ret || 50, clients.reduce((a, x) => a + (x.revenue || 0), 0) > 0 ? (c.revenue || 0) / clients.reduce((a, x) => a + (x.revenue || 0), 0) : 0, c.daysOld != null ? c.daysOld : 999);
    const finalPS = Math.min(99, ps + boost);
    // Higher profile score = higher priority (invert for sort)
    return finalPS / 100;
  };
  const getTier = (clientName) => {
    if (!clientName || clientName === "All Clients") return 4;
    const c = clients.find(x => x.name === clientName);
    if (!c) return 4;
    const ret = c.ret || 50;
    if (ret >= 70) return 1; // green
    if (ret >= 45) return 2; // yellow — watch
    return 3; // red — at risk
  };
  const tierLabel = (tier) => [, "Green", "Watch", "At Risk", "All Clients"][tier];
  const tierColor = (tier) => [, C.success, C.warning, C.danger, C.primary][tier];
  const sortByTierThenDone = (arr) => {
    return [...arr].sort((a, b) => {
      const ta = getTier(a.client);
      const tb = getTier(b.client);
      return ta - tb;
    });
  };
  const tasksDone = countableTasks.filter(t => t.done).length;
  const tasksTotal = countableTasks.length;

  // Task sorting — by Profile Score (invisible), highest first
  // Rai priority boost — applied to one task per day during sweep
  const getRaiBoost = (score) => {
    if (score >= 90) return 5;
    if (score >= 80) return 10;
    if (score >= 70) return 15;
    if (score >= 60) return 20;
    return 25;
  };

  const getProfileSortScore = (clientName, hasRaiBoost = false) => {
    if (!clientName || clientName === "All Clients") return 200; // All Clients tasks first
    const c = clients.find(x => x.name === clientName);
    if (!c) return 0;
    const ps = calcProfileScore(c.ret || 50, c, clients);
    const totalRev = clients.reduce((a, x) => a + (x.revenue || 0), 0);
    const revPct = totalRev > 0 ? (c.revenue || 0) / totalRev : 0;
    const boost = calcNewClientBoost(c.ret || 50, revPct, c.daysOld != null ? c.daysOld : 999);
    const raiBoost = hasRaiBoost ? getRaiBoost(ps) : 0;
    return Math.min(99, ps + boost + raiBoost);
  };

  const getSortedTasks = () => {
    return [...countableTasks].sort((a, b) => {
      const psA = getProfileSortScore(a.client, a.raiPriority);
      const psB = getProfileSortScore(b.client, b.raiPriority);
      if (psA !== psB) return psB - psA; // highest profile score first
      if (a.alert !== b.alert) return a.alert ? -1 : 1;
      if (a.recurring !== b.recurring) return a.recurring ? -1 : 1;
      return 0;
    });
  };


  // Health Checks
  const [hcOpen, setHcOpen] = useState(null);
  const [hcAnswers, setHcAnswers] = useState({});
  const [hcStep, setHcStep] = useState({});
  const [hcDone, setHcDone] = useState({});
  const [clientDrift, setClientDrift] = useState({});
  const [showUpcoming, setShowUpcoming] = useState(false);

  // Referrals
  const [refs, setRefs] = useState([]);
  const [refForm, setRefForm] = useState(false);
  const [refName, setRefName] = useState("");
  const [refFrom, setRefFrom] = useState("");
  const [refStatus, setRefStatus] = useState("converted");
  const [refRevenue, setRefRevenue] = useState("");
  const [refTotalRevenue, setRefTotalRevenue] = useState("");
  const [refEditing, setRefEditing] = useState(null);
  const [refEditData, setRefEditData] = useState({});
  const [refSearch, setRefSearch] = useState("");

  const addRef = async () => {
    if (!refName.trim() || !refFrom) return;
    const clientObj = clients.find(c => c.name === refFrom);
    const { data: created } = await referralsDb.create(user.id, {
      referred_to: refName.trim(),
      referred_by: refFrom,
      referred_by_client_id: clientObj?.id || null,
      status: refStatus,
      revenue: parseInt(refRevenue) || 0,
      total_revenue: parseInt(refTotalRevenue) || 0,
      date_added: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
    setRefs([{ id: created?.id || "ref" + Date.now(), from: refFrom, to: refName.trim(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), converted: refStatus === "converted" || refStatus === "closed", revenue: parseInt(refRevenue) || 0, totalRevenue: parseInt(refTotalRevenue) || 0, status: refStatus }, ...refs]);
    setRefName(""); setRefFrom(""); setRefStatus("converted"); setRefRevenue(""); setRefTotalRevenue(""); setRefForm(false);
  };

  const refsConverted = refs.filter(r => r.converted || r.status === "converted" || r.status === "closed");
  const refsRevenue = refsConverted.reduce((a, r) => a + r.revenue, 0);

  // Coach
  const [aiInput, setAiInput] = useState("");
  const [aiClientSearch, setAiClientSearch] = useState("");
  const [aiMessages, setAiMessages] = useState([]);
  const [aiTyping, setAiTyping] = useState(false);
  const aiEndRef = useRef(null);
  const aiUserRef = useRef(null);
  useEffect(() => {
    // Claude-style: when a new user message is sent, scroll that message to the top of the viewport
    // leaving room below for Rai's response. Falls back to bottom scroll when Rai is typing.
    if (aiMessages.length > 0 && aiMessages[aiMessages.length - 1].role === "user") {
      aiUserRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiMessages, aiTyping]);
  // Reset Rai textarea heights when input clears (e.g. after sending a message)
  useEffect(() => {
    if (aiInput === "") {
      document.querySelectorAll('textarea[placeholder="Reply to Rai…"], textarea[placeholder="Ask about a client, draft a message, get advice…"]').forEach(t => {
        t.style.height = "auto";
      });
    }
  }, [aiInput]);
  const sendAi = async (text) => {
    const q = text || aiInput; if (!q.trim()) return;
    setAiMessages(prev => [...prev, { role: "user", text: q }]); setAiInput(""); setAiTyping(true);

    try {
      // Conversation history — last 10 messages in Anthropic format
      const history = aiMessages.slice(-10).map(m => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text
      }));

      // Get the caller's JWT for the Edge Function to verify identity
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/rai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "Accept": "text/event-stream",
        },
        body: JSON.stringify({
          message: q,
          history,
          focused_client_id: null,
          stream: true,
        }),
      });

      // Rate limit: server returns JSON with status 429 (no stream)
      if (response.status === 429) {
        const data = await response.json();
        setAiMessages(prev => [...prev, { role: "ai", text: data.message || "You've hit your daily message limit. Try again tomorrow." }]);
        return;
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.error("Rai API error:", response.status, errText);
        setAiMessages(prev => [...prev, { role: "ai", text: "I'm having trouble thinking right now. Try again in a moment." }]);
        return;
      }

      // Streaming path: read SSE events, progressively build up the assistant message
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream") && response.body) {
        // Insert an empty AI message that we'll fill in chunk by chunk
        setAiMessages(prev => [...prev, { role: "ai", text: "" }]);
        setAiTyping(false); // remove the bouncing dots once streaming starts

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by double newlines
          const events = buffer.split("\n\n");
          buffer = events.pop() || ""; // incomplete event stays in buffer

          for (const evt of events) {
            const lines = evt.split("\n");
            for (const line of lines) {
              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                // Anthropic streaming: content_block_delta events carry text
                if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
                  accumulated += parsed.delta.text;
                  // Update the last message (the one we just inserted)
                  setAiMessages(prev => {
                    const next = [...prev];
                    next[next.length - 1] = { role: "ai", text: accumulated };
                    return next;
                  });
                }
              } catch {
                // ignore malformed JSON chunks
              }
            }
          }
        }

        // If stream ended with nothing, show fallback
        if (!accumulated) {
          setAiMessages(prev => {
            const next = [...prev];
            next[next.length - 1] = { role: "ai", text: "I'm having trouble thinking right now. Try again in a moment." };
            return next;
          });
        }
        return;
      }

      // Fallback: non-streaming JSON response
      const data = await response.json();
      const reply = data.reply || "I'm having trouble thinking right now. Try again in a moment.";
      setAiMessages(prev => [...prev, { role: "ai", text: reply }]);
    } catch (err) {
      console.error("Rai API error:", err);
      setAiMessages(prev => [...prev, { role: "ai", text: "Something went wrong connecting to Rai. Check your connection and try again." }]);
    }
    setAiTyping(false);
  };

  // ═══ PANEL COMPONENTS ═══
  const PanelCard = ({ children, style }) => <div style={{ background: "#FAFAF8", borderRadius: 14, border: "1px solid #E8ECE6", padding: "14px", marginBottom: 24, ...style }}>{children}</div>;
  
  const PortfolioPanel = () => {
    const avgScore = clients.length > 0 ? Math.round(clients.reduce((a, c) => a + (c.ret || 0), 0) / clients.length) : 0;
    const thriving = clients.filter(c => (c.ret || 0) >= 80).length;
    const healthy = clients.filter(c => (c.ret || 0) >= 65 && (c.ret || 0) < 80).length;
    const watch = clients.filter(c => (c.ret || 0) >= 45 && (c.ret || 0) < 65).length;
    const atRisk = clients.filter(c => (c.ret || 0) < 45).length;
    const total = clients.length || 1;
    const atRiskClients = clients.filter(c => (c.ret || 0) < 50);
    const atRiskRev = atRiskClients.reduce((a, c) => a + (c.revenue || 0), 0);
    return (
      <div className="r-today-panel" style={{ flexShrink: 0 }}>
        <PanelCard style={{ padding: "16px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div>
              <ScoreRing score={avgScore} size={56} strokeWidth={4} />
              <div style={{ textAlign: "center", marginTop: 3 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.textMuted }}>Portfolio health</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {[{ l: "Clients", v: clients.length }, { l: "Lifetime Value", v: (() => { const ltv = clients.reduce((a, c) => a + getAdjustedLTV(c), 0); return ltv >= 1000000 ? "$" + (ltv / 1000000).toFixed(1) + " M" : "$" + Math.round(ltv / 1000) + "k"; })() }, { l: "Avg Tenure", v: (() => { const mo = clients.length > 0 ? Math.round(clients.reduce((a, c) => a + (c.months || 0), 0) / clients.length) : 0; return mo >= 12 ? (mo / 12).toFixed(1) + " yr" : mo + " mo"; })() }].map((r, i) => (
                <div key={i} style={{ padding: "7px 0", borderBottom: i < 2 ? "1px solid #E8ECE6" : "none", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: C.textMuted }}>{r.l}</span>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
          {clients.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #E8ECE6" }}>
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 6, textAlign: "center" }}>
                {[{ l: "Thriving", v: thriving, c: C.primary }, { l: "Healthy", v: healthy, c: "#558B68" }, { l: "Watch", v: watch, c: C.warning }, { l: "At Risk", v: atRisk, c: C.danger }].map((s, si) => (
                  <div key={si}><div style={{ fontSize: 15, fontWeight: 900, color: s.c }}>{s.v}</div><div style={{ fontSize: 8, fontWeight: 600, color: C.textMuted }}>{s.l}</div></div>
                ))}
              </div>
              <div style={{ height: 6, borderRadius: 3, display: "flex", overflow: "hidden" }}>
                {thriving > 0 && <div style={{ width: (thriving / total * 100) + "%", background: C.primary }} />}
                {healthy > 0 && <div style={{ width: (healthy / total * 100) + "%", background: "#558B68" }} />}
                {watch > 0 && <div style={{ width: (watch / total * 100) + "%", background: C.warning }} />}
                {atRisk > 0 && <div style={{ width: (atRisk / total * 100) + "%", background: C.danger }} />}
              </div>
            </div>
          )}
        </PanelCard>
        <PanelCard>
          <div style={{ fontSize: 9, fontWeight: 600, color: C.danger, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>Revenue at risk</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.danger }}>${(atRiskRev / 1000).toFixed(1)}k/mo</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>{atRiskClients.length} client{atRiskClients.length !== 1 ? "s" : ""} scoring under 50</div>
          {atRiskClients.length > 0 && (
            <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
              {atRiskClients.slice(0, 3).map((c, ci) => (
                <span key={ci} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "#FAE8E4", color: C.danger, fontWeight: 600 }}>{c.name}</span>
              ))}
            </div>
          )}
        </PanelCard>
        {clients.length > 1 && (
          <PanelCard style={{ marginBottom: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Client Drift</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.success, textTransform: "uppercase", marginBottom: 5 }}>Improving</div>
            {[...clients].sort((a, b) => (b.ret || 0) - (a.ret || 0)).slice(0, 2).map((c, ci) => (
              <div key={"up" + ci} style={{ padding: "7px 0", borderBottom: "1px solid #E8ECE6", display: "flex", alignItems: "center", gap: 8 }}>
                <ScoreRing score={c.ret || 0} size={26} strokeWidth={2} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{c.name}</span>
              </div>
            ))}
            <div style={{ fontSize: 9, fontWeight: 700, color: C.danger, textTransform: "uppercase", marginBottom: 5, marginTop: 12 }}>Declining</div>
            {[...clients].sort((a, b) => (a.ret || 0) - (b.ret || 0)).slice(0, 2).map((c, ci) => (
              <div key={"dn" + ci} style={{ padding: "7px 0", borderBottom: ci < 1 ? "1px solid #E8ECE6" : "none", display: "flex", alignItems: "center", gap: 8 }}>
                <ScoreRing score={c.ret || 0} size={26} strokeWidth={2} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{c.name}</span>
              </div>
            ))}
          </PanelCard>
        )}
      </div>
    );
  };

  const RaiMiniPanel = () => (
    <div className="r-today-panel" style={{ width: 360, flexShrink: 0, position: "sticky", top: 28, alignSelf: "flex-start" }}>
      <div style={{ background: "transparent", borderRadius: 16, border: "1px solid " + C.borderLight, padding: "14px", display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 80px)" }}>
        {/* Rai header */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", paddingBottom: 12, borderBottom: "1px solid " + C.borderLight, marginBottom: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.btn, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, position: "relative" }}>
            Rai
            <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: C.success, border: "2px solid " + C.bg }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Rai</div>
            <div style={{ fontSize: 11, color: C.success, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.success, display: "inline-block" }} />
              Watching your portfolio
            </div>
          </div>
        </div>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {aiMessages.length === 0 ? (
            <>
              <div style={{ background: C.card, borderRadius: 10, padding: "10px 12px", fontSize: 13, lineHeight: 1.5, border: "1px solid " + C.borderLight }}>
                <strong>Good morning{user?.user_metadata?.full_name ? ", " + user.user_metadata.full_name.split(" ")[0] : ""}.</strong> {(() => {
                  const worst = [...clients].sort((a, b) => (a.ret || 0) - (b.ret || 0))[0];
                  const thriving = clients.filter(c => (c.ret || 0) >= 80);
                  if (worst && (worst.ret || 0) < 60) return worst.name + " is my biggest concern — scoring " + (worst.ret || 0) + ". Worth checking in.";
                  if (thriving.length > 0) return "Your portfolio looks solid. " + thriving.length + " clients thriving.";
                  return "What's on your mind today?";
                })()}
              </div>
              {clients.filter(c => (c.ret || 0) >= 80).length >= 2 && (
                <div style={{ background: C.card, borderRadius: 10, padding: "10px 12px", fontSize: 13, lineHeight: 1.5, border: "1px solid " + C.borderLight }}>
                  {(() => {
                    const thriving = clients.filter(c => (c.ret || 0) >= 80).slice(0, 3);
                    return "Clients I'd leave alone: " + thriving.map(c => c.name).join(", ") + ". Don't upsell. Don't over-touch.";
                  })()}
                </div>
              )}
              {/* Suggested prompts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
                {[
                  (() => { const w = [...clients].sort((a, b) => (a.ret || 0) - (b.ret || 0))[0]; return w ? "What should I say to " + w.name + "?" : null; })(),
                  "Who needs attention this week?",
                  "Draft a check-in message",
                ].filter(Boolean).map((p, i) => (
                  <div key={i} onClick={() => { setAiInput(p); }} style={{ background: C.card, border: "1px solid " + C.borderLight, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600, color: C.btn, cursor: "pointer" }}>
                    {p}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {aiMessages.map((m, i) => (
                m.role === "user" ? (
                  <div key={i} style={{ alignSelf: "flex-end", background: C.surface, color: C.text, borderRadius: 18, padding: "8px 14px", fontSize: 13, lineHeight: 1.5, maxWidth: "85%" }}>
                    {m.text}
                  </div>
                ) : (
                  <div key={i} style={{ padding: "2px 2px", color: C.text }}>
                    <RaiMarkdown text={m.text} size={13} lineHeight={1.55} />
                  </div>
                )
              ))}
              {aiTyping && <div style={{ display: "flex", gap: 4, padding: "2px 2px", alignSelf: "flex-start" }}>{[0,1,2].map(j => <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: C.textMuted, animation: `pulse 1.2s ease-in-out ${j*0.2}s infinite` }} />)}</div>}
            </>
          )}
        </div>
        {/* Input */}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.borderLight, display: "flex", gap: 6 }}>
          <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAi(); } }} placeholder="Ask Rai anything..." style={{ flex: 1, padding: "10px 14px", border: "1px solid " + C.borderLight, borderRadius: 20, fontSize: 13, fontFamily: "inherit", background: C.card, outline: "none" }} />
          <button onClick={sendAi} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: C.btn, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="send" size={14} color="#fff" /></button>
        </div>
      </div>
    </div>
  );

  const RolodexPanel = () => {
    const convertedClients = clients.filter(c => rolodex.some(r => r.name === c.name || r.client === c.name)).sort((a, b) => (b.ret || 0) - (a.ret || 0));
    const totalLeads = rolodex.length;
    const converted = convertedClients.length;
    const convRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;
    const avgScore = converted > 0 ? Math.round(convertedClients.reduce((a, c) => a + (c.ret || 0), 0) / converted) : 0;
    const staleLeads = rolodex.filter(r => !clients.some(c => c.name === r.name || c.name === r.client));
    return (
      <div className="r-today-panel" style={{ width: 320, flexShrink: 0, position: "sticky", top: 28, alignSelf: "flex-start" }}>
        <PanelCard style={{ padding: "16px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div>
              <ScoreRing score={avgScore || 0} size={56} strokeWidth={4} />
              <div style={{ textAlign: "center", marginTop: 3 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.textMuted }}>Converted health</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {[{ l: "Converted", v: converted }, { l: "Revenue added", v: "$" + Math.round(convertedClients.reduce((a, c) => a + (c.revenue || 0), 0) / 1000) + "k/mo" }, { l: "In pipeline", v: staleLeads.length }].map((r, i) => (
                <div key={i} style={{ padding: "7px 0", borderBottom: i < 2 ? "1px solid #E8ECE6" : "none", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: C.textMuted }}>{r.l}</span>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </PanelCard>
        <PanelCard>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Conversion Rate</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: C.primary }}>{convRate}%</span>
            <span style={{ fontSize: 12, color: C.textMuted }}>became clients</span>
          </div>
          <div style={{ marginTop: 8 }}>
            {[{ l: "Total leads", v: totalLeads }, { l: "Converted", v: converted }, { l: "Still in pipeline", v: staleLeads.length }].map((s, i) => (
              <div key={i} style={{ padding: "5px 0", borderBottom: i < 2 ? "1px solid #E8ECE6" : "none", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: C.textMuted }}>{s.l}</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{s.v}</span>
              </div>
            ))}
          </div>
        </PanelCard>
        <PanelCard style={{ marginBottom: 0 }}>
          {staleLeads.length > 0 ? (
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, color: C.warning, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Needs outreach</div>
              {staleLeads.slice(0, 4).map((r, i) => (
                <div key={i} style={{ padding: "7px 0", borderBottom: i < Math.min(staleLeads.length, 4) - 1 ? "1px solid #E8ECE6" : "none", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{r.name || r.client}</span>
                  <span style={{ fontSize: 11, color: C.textMuted }}>{r.contact}</span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, color: C.success, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Outreach</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>No stale leads. All contacts are active.</div>
            </div>
          )}
        </PanelCard>
      </div>
    );
  };

  const ReferralsPanel = () => {
    const referredClients = clients.filter(c => refs.some(r => r.referred === c.name || r.to === c.name));
    const avgScore = referredClients.length > 0 ? Math.round(referredClients.reduce((a, c) => a + (c.ret || 0), 0) / referredClients.length) : 0;
    const refRev = referredClients.reduce((a, c) => a + (c.revenue || 0), 0);
    const totalReferred = refs.length;
    const converted = referredClients.length;
    const convRate = totalReferred > 0 ? Math.round((converted / totalReferred) * 100) : 0;
    const likelyToRefer = [...clients].filter(c => (c.ret || 0) >= 80).sort((a, b) => (b.ret || 0) - (a.ret || 0)).slice(0, 3);
    return (
      <div className="r-today-panel" style={{ width: 320, flexShrink: 0, position: "sticky", top: 28, alignSelf: "flex-start" }}>
        <PanelCard style={{ padding: "16px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div>
              <ScoreRing score={avgScore || 0} size={56} strokeWidth={4} />
              <div style={{ textAlign: "center", marginTop: 3 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.textMuted }}>Referred health</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {[{ l: "Referred clients", v: converted }, { l: "Referral revenue", v: "$" + Math.round(refRev / 1000) + "k/mo" }, { l: "Referral LCV", v: "$" + Math.round(referredClients.reduce((a, c) => a + getAdjustedLTV(c), 0) / 1000) + "k" }].map((r, i) => (
                <div key={i} style={{ padding: "7px 0", borderBottom: i < 2 ? "1px solid #E8ECE6" : "none", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: C.textMuted }}>{r.l}</span>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </PanelCard>
        <PanelCard>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Referral Conversion</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: C.primary }}>{convRate}%</span>
            <span style={{ fontSize: 12, color: C.textMuted }}>became clients</span>
          </div>
          <div style={{ marginTop: 8 }}>
            {[{ l: "Total referred", v: totalReferred }, { l: "Converted", v: converted }, { l: "Lost", v: totalReferred - converted }].map((s, i) => (
              <div key={i} style={{ padding: "5px 0", borderBottom: i < 2 ? "1px solid #E8ECE6" : "none", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: C.textMuted }}>{s.l}</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{s.v}</span>
              </div>
            ))}
          </div>
        </PanelCard>
        {likelyToRefer.length > 0 && (
          <PanelCard style={{ marginBottom: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Likely to refer</div>
            <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8 }}>Thriving clients (80+)</div>
            {likelyToRefer.map((c, i) => (
              <div key={i} style={{ padding: "7px 0", borderBottom: i < likelyToRefer.length - 1 ? "1px solid #E8ECE6" : "none", display: "flex", alignItems: "center", gap: 8 }}>
                <ScoreRing score={c.ret || 0} size={26} strokeWidth={2} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{c.months || 0}mo</div>
                </div>
                {refs.some(r => r.from === c.name || r.source === c.name) && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: C.primarySoft, color: C.primary, fontWeight: 600 }}>Has referred</span>}
              </div>
            ))}
          </PanelCard>
        )}
      </div>
    );
  };
  const goTo = (id) => { if (page === "health" && id !== "health") { setHcDone({}); setHcOpen(null); } setPage(id); setShowMore(false); };
  const allPages = [...(tier === "enterprise" ? navItemsEnterprise : navItemsCore), ...(tier === "enterprise" ? moreItemsEnterprise : moreItemsCore)];
  const pageTitle = allPages.find(n => n.id === page)?.label || "";
  const totalRev = clients.reduce((a, c) => a + c.revenue, 0);
  const overdueChecks = hcQueue.filter(h => (h.overdue > 0 || h.due === "Today") && !hcDone[h.client]).length;
  const totalRefRev = refs.filter(r => r.status === "converted" || r.converted).reduce((a, r) => a + (r.revenue || 0), 0);

  const todayDot = tasksDone < tasksTotal;
  const healthDot = overdueChecks > 0;
  const hasDot = (id) => (id === "today" && todayDot) || (id === "health" && healthDot);

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Manrope', system-ui, sans-serif", color: C.text, background: C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, select { font-size: 16px !important; }
        @media (min-width: 768px) { input, textarea, select { font-size: 14px !important; } }
        ::selection { background: #33543E; color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #D8DFD8; border-radius: 2px; }
        .nav-item { transition: all 0.12s; cursor: pointer; }
        .nav-item:hover { background: rgba(255,255,255,0.08); }
        .r-btn { transition: all 0.15s ease; cursor: pointer; }
        @media (hover: hover) {
          .r-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(91,33,182,0.18); }
        }
        .r-btn:active { transform: scale(0.98); }
        .row-hover { transition: background 0.1s; cursor: pointer; }
        .row-hover:hover { background: ${C.primarySoft}; }
        .r-desk { display: none; }
        .r-mob-top { display: flex; }
        .r-mob-bot { display: flex; }
        .r-main { padding: 16px 16px 80px; }
        .r-today-panel { display: none !important; }
        .r-client-modal { top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; transform: none !important; max-width: 100% !important; max-height: 100% !important; border-radius: 0 !important; }
        @media (min-width: 768px) {
          :root { --sidebar-w: 270px; }
          .r-desk { display: flex !important; }
          .r-mob-top { display: none !important; }
          .r-mob-bot { display: none !important; }
          .r-today-panel { display: block !important; }
          .r-client-modal { top: 50% !important; left: 50% !important; right: auto !important; bottom: auto !important; transform: translate(-50%, -50%) !important; max-width: 520px !important; max-height: 90vh !important; border-radius: 16px !important; }
          .r-main { padding: 28px 48px; margin-left: var(--sidebar-w); }
        }
        @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
        @keyframes fwLaunch {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-40vh); opacity: 1; }
        }
        @keyframes fwBurst {
          0% { transform: translate(0,0) scale(0); opacity: 1; }
          20% { opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0.3); opacity: 0; }
        }
        @keyframes fwGlow {
          0% { transform: scale(0); opacity: 0.8; }
          50% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes fwSparkle {
          0%,100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .client-pill { transition: all 0.1s; cursor: pointer; }
        .client-pill:hover { background: ${C.primarySoft} !important; border-color: ${C.primary} !important; }
        .card-hover { transition: box-shadow 0.2s ease, transform 0.2s ease; cursor: pointer; }
        .card-hover:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06); transform: translateY(-1px); }
        .row-item { transition: background 0.12s ease; cursor: pointer; }
        .row-item:hover { background: #33543E10; }
        .btn-ghost { transition: all 0.12s ease; cursor: pointer; }
        .btn-ghost:hover { background: #EEEFEB !important; }
        .btn-ghost-green { transition: all 0.12s ease; cursor: pointer; }
        .btn-ghost-green:hover { background: #D9EBE0 !important; }
        .btn-ghost-red { transition: all 0.12s ease; cursor: pointer; }
        .btn-ghost-red:hover { background: #F5DDD8 !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Fireworks */}
      {confetti && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none", overflow: "hidden" }}>
          {/* Multiple burst origins */}
          {[
            { x: 30, y: 35, delay: 0, color: "#5B21B6" },
            { x: 70, y: 30, delay: 0.4, color: "#2D8659" },
            { x: 50, y: 25, delay: 0.8, color: "#B88B15" },
            { x: 20, y: 40, delay: 1.2, color: "#33543E" },
            { x: 80, y: 35, delay: 1.0, color: "#C4432B" },
            { x: 45, y: 45, delay: 1.5, color: "#558B68" },
          ].map((burst, bi) => (
            <div key={bi} style={{ position: "absolute", left: `${burst.x}%`, top: `${burst.y}%` }}>
              {/* Glow */}
              <div style={{
                position: "absolute", width: 120, height: 120, borderRadius: "50%",
                background: `radial-gradient(circle, ${burst.color}66 0%, transparent 70%)`,
                left: -60, top: -60,
                animation: `fwGlow 1.2s ease-out ${burst.delay + 0.1}s forwards`,
                opacity: 0,
              }} />
              {/* Particles */}
              {Array.from({ length: 24 }).map((_, pi) => {
                const angle = (pi / 24) * Math.PI * 2;
                const dist = 60 + Math.random() * 80;
                const dx = Math.cos(angle) * dist;
                const dy = Math.sin(angle) * dist;
                const size = 3 + Math.random() * 4;
                const colors = [burst.color, "#fff", burst.color + "cc", "#FFD700", "#FF6B6B", "#7C3AED", "#10B981"];
                return (
                  <div key={pi} style={{
                    position: "absolute", width: size, height: size, borderRadius: "50%",
                    background: colors[pi % colors.length],
                    boxShadow: `0 0 ${size * 2}px ${colors[pi % colors.length]}`,
                    "--dx": `${dx}px`, "--dy": `${dy}px`,
                    animation: `fwBurst ${0.8 + Math.random() * 0.6}s ease-out ${burst.delay + 0.05}s forwards`,
                    opacity: 0,
                  }} />
                );
              })}
              {/* Trail sparks */}
              {Array.from({ length: 8 }).map((_, si) => {
                const angle = (si / 8) * Math.PI * 2;
                const dist = 30 + Math.random() * 40;
                return (
                  <div key={`s${si}`} style={{
                    position: "absolute", left: Math.cos(angle) * dist, top: Math.sin(angle) * dist,
                    fontSize: 6 + Math.random() * 6, color: "#FFD700",
                    animation: `fwSparkle ${0.4 + Math.random() * 0.4}s ease-in-out ${burst.delay + 0.3 + Math.random() * 0.5}s`,
                    opacity: 0,
                  }}>✦</div>
                );
              })}
            </div>
          ))}
          {/* Rising trails */}
          {[
            { x: 30, delay: 0 },
            { x: 70, delay: 0.3 },
            { x: 50, delay: 0.6 },
            { x: 20, delay: 1.0 },
            { x: 80, delay: 0.8 },
            { x: 45, delay: 1.3 },
          ].map((trail, ti) => (
            <div key={`t${ti}`} style={{
              position: "absolute", left: `${trail.x}%`, bottom: 0,
              width: 3, height: 3, borderRadius: "50%",
              background: "#FFD700", boxShadow: "0 0 8px #FFD700, 0 0 16px #FFD70066",
              animation: `fwLaunch 0.5s ease-out ${trail.delay}s forwards`,
              opacity: 0, animationFillMode: "forwards",
            }} />
          ))}
        </div>
      )}

      {/* Streak celebration modal */}
      {showStreakModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 250, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
          <div style={{ background: C.card, borderRadius: 20, padding: "40px 48px", textAlign: "center", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>&#127881;</div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 4 }}>All done!</div>
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 20 }}>Every task completed today.</div>
            <div style={{ background: C.primarySoft, borderRadius: 12, padding: "16px", marginBottom: 20 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: C.primary }}>{streak} {streak === 1 ? "day" : "days"}</div>
              <div style={{ fontSize: 14, color: C.primary, fontWeight: 600 }}>completion streak</div>
            </div>
            <button className="r-btn" onClick={() => setShowStreakModal(false)} style={{ padding: "12px 32px", background: C.btn, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Nice</button>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="r-desk" style={{ width: 270, background: C.sidebar, flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, borderRight: "1px solid #D0DDD4" }}>
        <div style={{ padding: "20px 18px 24px" }}><span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em", color: C.primary, fontFamily: "system-ui, -apple-system, sans-serif" }}>Retayned<span style={{ letterSpacing: "0" }}>.</span></span></div>
        <div style={{ flex: 1, padding: "0 10px" }}>
          {(tier === "enterprise" ? navItemsEnterprise : navItemsCore).map(n => (
            <div key={n.id} className="nav-item" onClick={() => goTo(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, marginBottom: 2, background: page === n.id ? "#D0DDD4" : "transparent", color: page === n.id ? C.primary : "#6B8572", fontWeight: page === n.id ? 600 : 400 }}>
              <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={n.icon} size={16} color={page === n.id ? C.primary : "#6B8572"} /></span><span style={{ fontSize: 14, flex: 1 }}>{n.label}</span>
              {hasDot(n.id) && <Dot />}
            </div>
          ))}
          {page === "coach" && (
            <div style={{ padding: "10px 2px 0" }}>
              <div onClick={() => setAiMessages([])} style={{ padding: "10px 12px", borderRadius: 8, background: C.btn, color: "#fff", fontSize: 13, fontWeight: 600, textAlign: "center", cursor: "pointer" }}>New Chat</div>
            </div>
          )}
        </div>
        <div style={{ padding: "8px 10px", borderTop: "1px solid #D0DDD4" }}>
          <div onClick={() => setTier(tier === "core" ? "enterprise" : "core")} className="nav-item" style={{ display: "none", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 8, color: "#6B8572" }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{tier === "enterprise" ? "Enterprise" : "Core"}</span>
            <div style={{ width: 36, height: 20, borderRadius: 10, background: tier === "enterprise" ? C.btn : "#D0DDD4", position: "relative", transition: "background 0.2s", cursor: "pointer" }}>
              <div style={{ width: 16, height: 16, borderRadius: 8, background: "#fff", position: "absolute", top: 2, left: tier === "enterprise" ? 18 : 2, transition: "left 0.2s" }} />
            </div>
          </div>
          <div className="nav-item" onClick={() => goTo("settings")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 8, color: page === "settings" ? C.primary : "#6B8572", background: page === "settings" ? "#D0DDD4" : "transparent" }}>
            <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="settings" size={16} color={page === "settings" ? C.primary : "#6B8572"} /></span><span style={{ fontSize: 14 }}>Settings</span>
          </div>
        </div>
        <div style={{ padding: "12px 20px 18px", borderTop: "1px solid #D0DDD4" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#D0DDD4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.primary }}>{(() => { const n = user?.user_metadata?.full_name; if (n) return n.split(" ").map(x => x[0]).join("").slice(0,2).toUpperCase(); return (user?.email || "U")[0].toUpperCase(); })()}</div>
            <div><div style={{ fontSize: 14, fontWeight: 600, color: "#6B8572", textTransform: "capitalize" }}>{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}</div><div style={{ fontSize: 12, color: "#92A596" }}>{user?.user_metadata?.company || ""}</div></div>
          </div>
        </div>
      </div>

      {/* MOBILE TOP */}
      <div className="r-mob-top" style={{ justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: C.card, borderBottom: "1px solid " + C.borderLight, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.04em", color: C.primary, fontFamily: "system-ui, -apple-system, sans-serif" }}>Retayned<span style={{ letterSpacing: "0" }}>.</span></span>
        </div>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{(() => { const n = user?.user_metadata?.full_name; if (n) return n.split(" ").map(x => x[0]).join("").slice(0,2).toUpperCase(); return (user?.email || "U")[0].toUpperCase(); })()}</div>
      </div>

      <div className="r-main">

        {/* ═══ TODAY — TASK MANAGER ═══ */}
        {page === "today" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>Today</h1>
            <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 16 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>

            <div className="r-today-cols" style={{ display: "flex", gap: 24 }}>

            {/* LEFT PANEL — Portfolio tiles */}
            <div className="r-today-panel" style={{ width: 270, flexShrink: 0 }}>
              <PortfolioPanel />
            </div>

            <div style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>

            {/* Enterprise Sweep Results Card */}
            {tier === "enterprise" && (
              <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, padding: "16px 18px", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>🔄 Daily Sweep · Today 6:02 AM</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{sweepData.clients_analyzed} clients analyzed · {sweepData.alerts_count} alerts · {sweepData.tasks_generated} tasks</div>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
                    <span>Portfolio Health</span>
                    <span style={{ fontWeight: 700, color: C.text }}>{sweepData.portfolio_avg_score} <span style={{ color: sweepData.portfolio_avg_score > sweepData.prior_portfolio_avg ? C.success : C.danger }}>{sweepData.portfolio_avg_score > sweepData.prior_portfolio_avg ? "↑" : "↓"}{Math.abs(sweepData.portfolio_avg_score - sweepData.prior_portfolio_avg)} from last week</span></span>
                  </div>
                  <div style={{ height: 6, background: C.borderLight, borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${sweepData.portfolio_avg_score}%`, background: C.primarySoft, borderRadius: 3 }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  {[
                    { label: "Critical", count: sweepData.score_distribution.critical, color: C.danger },
                    { label: "At Risk", count: sweepData.score_distribution.at_risk, color: "#D97706" },
                    { label: "Watch", count: sweepData.score_distribution.watch, color: C.warning },
                    { label: "Stable", count: sweepData.score_distribution.stable, color: C.text },
                    { label: "Strong", count: sweepData.score_distribution.strong, color: C.success },
                  ].map((d, i) => (
                    <span key={i} style={{ fontSize: 12, color: d.color, fontWeight: 600 }}>{d.count > 0 ? `${d.label} (${d.count})` : ""}</span>
                  ))}
                </div>
                <button className="r-btn" onClick={() => goTo("sweeps")} style={{ width: "100%", padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>View Full Report</button>
              </div>
            )}

            {/* Daily Review */}
            <div style={{ background: C.raiGrad, borderRadius: 14, padding: "16px 18px", color: "#fff", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Daily Progress</span>
                <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em" }}>{tasksDone}<span style={{ fontSize: 15, fontWeight: 500, opacity: 0.5 }}>/{tasksTotal}</span></span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,.15)", borderRadius: 3, marginTop: 8 }}>
                <div style={{ height: "100%", width: `${tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0}%`, background: C.primarySoft, borderRadius: 3, transition: "width 0.3s" }} />
              </div>
            </div>

            {/* Add task */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} placeholder="What's on your plate?" style={{ flex: 1, minWidth: 0, padding: "0 16px", height: 44, border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: C.card, outline: "none" }} />
                <button className="r-btn" onClick={addTask} style={{ padding: "0 20px", height: 44, borderRadius: 8, border: "none", background: C.btn, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Create Task</button>
                <div style={{ position: "relative" }}>
                  <div className="r-btn" onClick={() => { setShowTouchpoint(!showTouchpoint); setTpClient(null); setTpChannel(null); setTpSearch(""); }} style={{ height: 44, padding: "0 14px", borderRadius: 8, border: "1.5px solid " + C.border, background: C.card, color: C.textSec, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 14 }}>📞</span> Log
                  </div>
                  {showTouchpoint && (
                    <div style={{ position: "absolute", top: 50, right: 0, width: 300, background: C.card, borderRadius: 14, border: "1px solid " + C.border, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden" }}>
                      <div style={{ padding: "14px 16px 10px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Log a touchpoint</div>
                        {!tpClient ? (
                          <div>
                            <input value={tpSearch} onChange={e => setTpSearch(e.target.value)} placeholder="Search clients..." autoFocus style={{ width: "100%", padding: "8px 12px", border: "1.5px solid " + C.borderLight, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: C.bg, marginBottom: 8 }} />
                            <div style={{ maxHeight: 200, overflow: "auto" }}>
                              {clients.filter(c => !tpSearch || c.name.toLowerCase().includes(tpSearch.toLowerCase())).map((c, i) => (
                                <div key={i} onClick={() => setTpClient(c.name)} className="row-hover" style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                              ))}
                            </div>
                          </div>
                        ) : !tpChannel ? (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                              <span onClick={() => setTpClient(null)} style={{ cursor: "pointer", fontSize: 12, color: C.textMuted, fontWeight: 600 }}>Back</span>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{tpClient}</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                              {[{ id: "call", label: "Call", icon: "📞" }, { id: "text", label: "Text", icon: "💬" }, { id: "meeting", label: "Meeting", icon: "🤝" }, { id: "other", label: "Other", icon: "📌" }].map(ch => (
                                <div key={ch.id} onClick={() => setTpChannel(ch.id)} className="row-hover" style={{ padding: "12px", borderRadius: 8, border: "1.5px solid " + C.borderLight, cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 600 }}>
                                  <div style={{ fontSize: 20, marginBottom: 4 }}>{ch.icon}</div>
                                  {ch.label}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div style={{ textAlign: "center", padding: "8px 0" }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>{[{ id: "call", icon: "📞" }, { id: "text", icon: "💬" }, { id: "meeting", icon: "🤝" }, { id: "other", icon: "📌" }].find(c => c.id === tpChannel)?.icon}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{tpClient}</div>
                            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>{tpChannel.charAt(0).toUpperCase() + tpChannel.slice(1)} · Today</div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => setTpChannel(null)} style={{ flex: 1, padding: "10px", background: C.surface, color: C.textSec, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Back</button>
                              <button onClick={async () => {
                                // Find the client record to get their id for the FK
                                const clientObj = clients.find(c => c.name === tpClient);
                                if (!clientObj) { setTpClient(null); setTpChannel(null); setShowTouchpoint(false); setTpSearch(""); return; }
                                // Optimistic: show the pill immediately with a temp id, then swap to real id on return
                                const tempId = "tmp_" + Date.now();
                                const tempEntry = { id: tempId, client: tpClient, channel: tpChannel };
                                setTpLogged(prev => [tempEntry, ...prev]);
                                setTpClient(null); setTpChannel(null); setShowTouchpoint(false); setTpSearch("");
                                const { data, error } = await touchpointsDb.create(user.id, { client_id: clientObj.id, client_name: clientObj.name, channel: tpChannel });
                                if (error || !data) {
                                  console.error("Failed to log touchpoint:", error);
                                  // Roll back the optimistic entry
                                  setTpLogged(prev => prev.filter(l => l.id !== tempId));
                                  return;
                                }
                                // Swap temp id for real id
                                setTpLogged(prev => prev.map(l => l.id === tempId ? { id: data.id, client: data.client_name, channel: data.channel } : l));
                              }} style={{ flex: 1, padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Log it</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {(newTask.trim() || newTaskClient || newTaskRecurring) && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  <button onClick={() => setShowClientPicker(!showClientPicker)} style={{ padding: "5px 12px", background: newTaskClient ? C.primarySoft : C.surface, color: newTaskClient ? C.primary : C.textMuted, border: "1px solid " + (newTaskClient ? C.primary + "44" : C.borderLight), borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {newTaskClient || "Assign to client"}
                  </button>
                  {newTaskClient && <button onClick={() => setNewTaskClient("")} style={{ background: "none", border: "none", fontSize: 12, color: C.textMuted, cursor: "pointer" }}>×</button>}
                  <button onClick={() => setNewTaskRecurring(!newTaskRecurring)} style={{ padding: "5px 12px", background: newTaskRecurring ? C.primarySoft : C.surface, color: newTaskRecurring ? C.primary : C.textMuted, border: "1px solid " + (newTaskRecurring ? C.primary + "44" : C.borderLight), borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {newTaskRecurring ? "↻ Recurring" : "Make recurring"}
                  </button>
                </div>
              )}
              {showClientPicker && (newTask.trim() || newTaskClient || newTaskRecurring) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6, padding: "8px 10px", background: C.card, borderRadius: 8, border: "1px solid " + C.border }}>
                  <span style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, background: taskClientSearch ? C.primarySoft : C.bg, border: "1px solid " + C.borderLight, display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <span style={{ color: C.textMuted, fontSize: 12 }}>⌕</span>
                    <input value={taskClientSearch} onChange={e => setTaskClientSearch(e.target.value)} placeholder={"Search " + clients.length + "..."} style={{ border: "none", background: "transparent", outline: "none", fontSize: 12, fontFamily: "inherit", fontWeight: 500, width: taskClientSearch ? 120 : 100, color: C.text, padding: 0 }} />
                    {taskClientSearch && <span onClick={() => setTaskClientSearch("")} style={{ cursor: "pointer", color: C.textMuted, fontSize: 10 }}>×</span>}
                  </span>
                  <span onClick={() => { setNewTaskClient("All Clients"); setShowClientPicker(false); setTaskClientSearch(""); }} style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, background: newTaskClient === "All Clients" ? C.primarySoft : C.bg, border: "1px solid " + C.borderLight, cursor: "pointer", fontWeight: 600, color: C.primary }}>All Clients</span>
                  {[...clients].sort((a, b) => b.ret - a.ret).filter(c => !taskClientSearch || c.name.toLowerCase().includes(taskClientSearch.toLowerCase())).slice(0, 5).map(c => (
                    <span key={c.id} onClick={() => { setNewTaskClient(c.name); setShowClientPicker(false); setTaskClientSearch(""); }} style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, background: newTaskClient === c.name ? C.primarySoft : C.bg, border: "1px solid " + (retColor(c.ret) + "44"), cursor: "pointer", fontWeight: 500, color: retColor(c.ret) }}>{c.name}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Logged touchpoints */}
            {tpLogged.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Logged Today</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {tpLogged.map((l) => (
                    <span key={l.id} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, background: C.primarySoft, color: C.primary, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      {l.channel === "call" ? "📞" : l.channel === "text" ? "💬" : l.channel === "meeting" ? "🤝" : "📌"} {l.client}
                      <span onClick={async () => {
                        const snapshot = l;
                        setTpLogged(prev => prev.filter(x => x.id !== l.id));
                        // Skip deletion if this is still a pending optimistic insert
                        if (typeof l.id === "string" && l.id.startsWith("tmp_")) return;
                        const { error } = await touchpointsDb.delete(l.id);
                        if (error) {
                          console.error("Failed to delete touchpoint:", error);
                          setTpLogged(prev => [snapshot, ...prev]);
                        }
                      }} style={{ cursor: "pointer", marginLeft: 4, color: C.primary, opacity: 0.5, fontSize: 13, lineHeight: 1 }}>×</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested by Rai — alerts (red) + suggestions (green) */}
            {aiTasks.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><Icon name="spark" size={12} color={C.primary} /> Suggested by Rai</div>
                {aiTasks.filter(t => t.alert).map(t => (
                  <div key={t.id} style={{ background: "linear-gradient(90deg, #FAE8E4 0%, #FDF5F3 40%, " + C.card + " 100%)", borderRadius: 14, marginBottom: 12, border: "1px solid " + C.border, overflow: "hidden", boxShadow: C.cardShadow }}>
                    <div style={{ padding: "14px 16px", position: "relative" }}>
                      <button onClick={() => dismissAi(t.id)} style={{ position: "absolute", top: 4, right: 4, background: "none", border: "none", fontSize: 20, color: C.border, cursor: "pointer", lineHeight: 1, padding: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                      <p style={{ fontSize: 14, color: C.text, fontWeight: 600, lineHeight: 1.5, paddingRight: 20 }}>{t.text}</p>
                      {t.client && <p style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{t.client}</p>}
                    </div>
                    <button className="btn-ghost-red" onClick={() => promoteAi(t.id)} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", borderTop: "1px solid " + C.borderLight, fontSize: 13, fontWeight: 600, color: C.primary, fontFamily: "inherit" }}>Add to Tasks</button>
                  </div>
                ))}
                {aiTasks.filter(t => !t.alert).slice(0, 5).map(t => (
                  <div key={t.id} style={{ background: "linear-gradient(90deg, " + C.primarySoft + " 0%, #F0F5F1 40%, " + C.card + " 100%)", borderRadius: 14, marginBottom: 12, border: "1px solid " + C.border, overflow: "hidden", boxShadow: C.cardShadow }}>
                    <div style={{ padding: "14px 16px", position: "relative" }}>
                      <button onClick={() => dismissAi(t.id)} style={{ position: "absolute", top: 4, right: 4, background: "none", border: "none", fontSize: 20, color: C.border, cursor: "pointer", lineHeight: 1, padding: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                      <p style={{ fontSize: 14, color: C.text, lineHeight: 1.5, paddingRight: 20 }}>{t.text}</p>
                      {t.client && <p style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{t.client}</p>}
                    </div>
                    <button className="btn-ghost-green" onClick={() => promoteAi(t.id)} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", borderTop: "1px solid " + C.borderLight, fontSize: 13, fontWeight: 600, color: C.primary, fontFamily: "inherit" }}>Add to Tasks</button>
                  </div>
                ))}
              </div>
            )}

            {/* Tasks — unified list, drag to reorder */}
            {countableTasks.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 0, marginTop: 24 }}>Your Tasks</div>
                <div style={{ background: C.card, borderRadius: 14, padding: "0 16px", marginTop: 8, border: "1px solid " + C.border, boxShadow: C.cardShadow }}>
                {getSortedTasks().map((t, ti, arr) => {
                  return (
                    <div key={t.id} style={{ display: "flex", gap: 12, padding: "14px 0", alignItems: "flex-start", borderBottom: ti < arr.length - 1 ? "1px solid " + C.borderLight : "none", opacity: t.done ? 0.45 : 1 }}>
                      <div onClick={() => toggleTask(t.id)} style={{ width: 22, height: 22, borderRadius: 6, border: t.done ? "none" : "2px solid " + C.border, background: t.done ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, cursor: "pointer" }}>
                        {t.done && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: t.done ? C.textMuted : C.text, lineHeight: 1.5, textDecoration: t.done ? "line-through" : "none" }}>{t.text}</p>
                        {(t.client || t.recurring) && <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          {t.client && <span style={{ fontSize: 12, color: C.textMuted }}>{t.client}</span>}
                          {t.recurring && <span style={{ fontSize: 8, color: C.textMuted, fontWeight: 600, padding: "0px 4px", borderRadius: 3, border: "1px solid " + C.border, background: C.surface, lineHeight: 1.5 }}>↻</span>}
                        </div>}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); { setTasks(tasks.filter(x => x.id !== t.id)); tasksDb.delete(t.id); }; }} style={{ background: "none", border: "none", fontSize: 18, color: C.border, cursor: "pointer", padding: "4px", lineHeight: 1, flexShrink: 0, marginTop: 0 }}>×</button>
                    </div>
                  );
                })}
                </div>
              </div>
            )}

            {tasksDone === tasksTotal && tasksTotal > 0 && <div style={{ background: C.heroGrad, borderRadius: 14, padding: "24px 20px", color: "#fff", marginTop: 16, textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 8 }}>🔥</div><div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>All clear.</div><p style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>Well done. See you tomorrow.</p></div>}
            </div>
            {/* RIGHT — Rai mini chat */}
            <RaiMiniPanel />
          </div>
          </div>
        )}

        {/* ═══ SWEEPS (ENTERPRISE) ═══ */}
        {page === "sweeps" && tier === "enterprise" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>Sweeps</h1>
            <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 16 }}>Daily Sweep · April 9, 2026 · 6:02 AM · {sweepData.clients_analyzed} clients · {sweepData.alerts_count} alerts · {sweepData.tasks_generated} tasks generated</p>

            {/* Alerts */}
            {sweepTasks.filter(t => t.priority === "urgent").length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.danger, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>🚨 Alerts ({sweepTasks.filter(t => t.priority === "urgent").length})</div>
                {sweepTasks.filter(t => t.priority === "urgent").map(t => (
                  <div key={t.id} style={{ background: "#FAE8E4", borderRadius: 12, border: "1px solid " + C.danger + "33", padding: "14px 16px", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.danger }}>CRITICAL · {t.client}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{t.signal}</div>
                    <p style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{t.action}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Priority Ranking */}
            <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Priority Ranking</div>
            <div style={{ background: C.card, borderRadius: 14, border: "1px solid " + C.border, overflow: "hidden" }}>
              {/* Header row */}
              <div style={{ display: "flex", padding: "10px 16px", borderBottom: "1px solid " + C.border, fontSize: 12, fontWeight: 600, color: C.textMuted }}>
                <span style={{ width: 28 }}>#</span>
                <span style={{ flex: 1 }}>Client</span>
                <span style={{ width: 50, textAlign: "right" }}>Score</span>
                <span style={{ width: 50, textAlign: "right" }}>Drift</span>
                <span style={{ width: 80, textAlign: "right" }}>Outlook</span>
                <span style={{ width: 90, textAlign: "right", display: "none" }} className="r-desk-inline">Archetype</span>
              </div>
              {[...enterpriseClients].sort((a, b) => b.ret - a.ret).map((c, i) => {
                const e = c.enterprise;
                const drift = c.ret - e.prior_baseline;
                const outlookLabel = { long_term: "Long-term", strong: "Strong", uncertain: "Uncertain", at_risk: "At Risk", critical: "Critical" }[e.retention_outlook] || "";
                const archLabel = { slow_fade: "Slow Fade", tone_shift: "Tone Shift", silent_exit: "Silent Exit", budget_squeeze: "Budget Sq." }[e.archetype] || "";
                const scoreColor = c.ret > 80 ? C.success : c.ret > 65 ? C.text : c.ret > 50 ? C.warning : c.ret > 30 ? "#D97706" : C.danger;
                return (
                  <div key={c.id} className="row-hover" onClick={() => { setSelectedClient(c); setClientTab("overview"); }} style={{ display: "flex", padding: "12px 16px", borderBottom: i < enterpriseClients.length - 1 ? "1px solid " + C.borderLight : "none", alignItems: "center" }}>
                    <span style={{ width: 28, fontSize: 12, color: C.textMuted }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{c.contact}</div>
                    </div>
                    <span style={{ width: 50, textAlign: "right", fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: scoreColor }}>{c.ret}</span>
                    <span style={{ width: 50, textAlign: "right", fontSize: 12, fontWeight: 600, color: drift > 0 ? C.success : drift < 0 ? C.danger : C.textMuted }}>{drift > 0 ? "+" : ""}{drift} {drift > 0 ? "↑" : drift < 0 ? "↓" : "—"}</span>
                    <span style={{ width: 80, textAlign: "right", fontSize: 12, fontWeight: 600, color: scoreColor }}>{outlookLabel}</span>
                  </div>
                );
              })}
            </div>

            {/* Tasks from Sweep */}
            <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8, marginTop: 20 }}>Tasks Generated ({sweepTasks.length})</div>
            {sweepTasks.filter(t => t.priority !== "urgent").map(t => (
              <div key={t.id} style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, padding: "14px 16px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{t.client}</span>
                  <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 4, fontWeight: 600, background: t.priority === "high" ? "#FEF3C7" : C.primarySoft, color: t.priority === "high" ? "#D97706" : C.primary }}>{t.priority === "high" ? "High" : "Medium"} · {t.timeframe}</span>
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{t.signal}</div>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{t.action}</p>
              </div>
            ))}

            {/* Sweep History */}
            <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8, marginTop: 20 }}>Previous Sweeps</div>
            <div style={{ background: C.card, borderRadius: 14, border: "1px solid " + C.border, overflow: "hidden" }}>
              {sweepHistory.map((s, i) => (
                <div key={i} style={{ padding: "12px 16px", borderBottom: i < sweepHistory.length - 1 ? "1px solid " + C.borderLight : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{s.date}</span>
                  <span style={{ fontSize: 12, color: C.textMuted }}>{s.clients} clients · Avg: {s.avg} · {s.alerts} alert{s.alerts !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ CLIENTS ═══ */}
        {page === "clients" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div><h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Clients</h1><p style={{ fontSize: 14, color: C.textMuted }}>{clients.length} active · ${(totalRev / 1000).toFixed(1)}k/mo</p></div>
              <div style={{ display: "flex", gap: 8 }}>
                {tier === "enterprise" && (
                  <button onClick={() => { setShowImport(!showImport); setShowAddClient(false); }} style={{ padding: "10px 20px", background: "transparent", color: C.primary, border: "1px solid " + C.primary + "44", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Import Clients</button>
                )}
                <button className="r-btn" onClick={() => { setShowAddClient(true); setShowImport(false); }} style={{ padding: "10px 20px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add Client</button>
              </div>
            </div>
          <div className="r-today-cols" style={{ display: "flex", gap: 24 }}>
          <div className="r-today-panel" style={{ width: 270, flexShrink: 0 }}>
            <PortfolioPanel />
          </div>
          <div style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>

            {/* Import Clients (Enterprise) */}
            {showImport && tier === "enterprise" && (
              <div style={{ background: C.card, borderRadius: 14, border: "1.5px solid " + C.primary, padding: "20px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Import Clients</div>
                  <button onClick={() => { setShowImport(false); setImportPreview([]); setImportPaste(""); setImportFile(null); }} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.textMuted }}>×</button>
                </div>

                {/* Tab toggle */}
                <div style={{ display: "flex", gap: 0, marginBottom: 16, background: C.surface, borderRadius: 8, padding: 3 }}>
                  {[{ id: "csv", label: "Upload CSV" }, { id: "paste", label: "Paste from Spreadsheet" }].map(t => (
                    <button key={t.id} onClick={() => { setImportTab(t.id); setImportPreview([]); }} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", background: importTab === t.id ? C.card : "transparent", color: importTab === t.id ? C.text : C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: importTab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>{t.label}</button>
                  ))}
                </div>

                {/* CSV Upload */}
                {importTab === "csv" && (
                  <div>
                    <div
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.primary; }}
                      onDragLeave={e => { e.currentTarget.style.borderColor = C.border; }}
                      onDrop={e => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = C.border;
                        const file = e.dataTransfer.files[0];
                        if (file && file.name.endsWith(".csv")) {
                          setImportFile(file);
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const lines = ev.target.result.split("\n").filter(l => l.trim());
                            const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
                            const rows = lines.slice(1).map(line => {
                              const cols = line.split(",").map(c => c.trim().replace(/"/g, ""));
                              return { name: cols[0] || "", contact: cols[1] || "", email: cols[2] || "", role: cols[3] || "", tag: cols[4] || "", revenue: parseInt(cols[5]) || 0, months: parseInt(cols[6]) || 0, valid: !!(cols[0] && cols[1] && cols[2]) };
                            });
                            setImportPreview(rows);
                          };
                          reader.readAsText(file);
                        }
                      }}
                      style={{ border: "2px dashed " + C.border, borderRadius: 10, padding: "32px 20px", textAlign: "center", marginBottom: 12, transition: "border-color 0.2s" }}
                    >
                      {importFile ? (
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>📄 {importFile.name}</div>
                          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{importPreview.length} rows found</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 24, marginBottom: 8 }}>📁</div>
                          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Drag & drop your CSV here</div>
                          <div style={{ fontSize: 12, color: C.textMuted }}>or <label style={{ color: C.primary, cursor: "pointer", fontWeight: 600 }}>browse files<input type="file" accept=".csv" style={{ display: "none" }} onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              setImportFile(file);
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const lines = ev.target.result.split("\n").filter(l => l.trim());
                                const rows = lines.slice(1).map(line => {
                                  const cols = line.split(",").map(c => c.trim().replace(/"/g, ""));
                                  return { name: cols[0] || "", contact: cols[1] || "", email: cols[2] || "", role: cols[3] || "", tag: cols[4] || "", revenue: parseInt(cols[5]) || 0, months: parseInt(cols[6]) || 0, valid: !!(cols[0] && cols[1] && cols[2]) };
                                });
                                setImportPreview(rows);
                              };
                              reader.readAsText(file);
                            }
                          }} /></label></div>
                          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>Expected columns: Business Name, Contact Name, Email, Role, Industry, Revenue, Months</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Paste from Spreadsheet */}
                {importTab === "paste" && (
                  <div>
                    <textarea
                      value={importPaste}
                      onChange={e => {
                        setImportPaste(e.target.value);
                        const lines = e.target.value.split("\n").filter(l => l.trim());
                        const rows = lines.map(line => {
                          const cols = line.split(/\t|,/).map(c => c.trim().replace(/"/g, ""));
                          return { name: cols[0] || "", contact: cols[1] || "", email: cols[2] || "", role: cols[3] || "", tag: cols[4] || "", revenue: parseInt(cols[5]) || 0, months: parseInt(cols[6]) || 0, valid: !!(cols[0] && cols[1] && cols[2]) };
                        });
                        setImportPreview(rows);
                      }}
                      placeholder={"Business Name\tContact Name\tEmail\tRole\tIndustry\tRevenue\tMonths\nAcme Corp\tJane Smith\tjane@acme.com\tCMO\tSaaS\t5000\t12"}
                      rows={6}
                      style={{ width: "100%", padding: "12px 14px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "monospace", outline: "none", background: C.bg, resize: "vertical", lineHeight: 1.6 }}
                    />
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>Paste rows from Excel or Google Sheets. Tab or comma-separated. First 3 columns required.</div>
                  </div>
                )}

                {/* Preview Table */}
                {importPreview.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Preview ({importPreview.filter(r => r.valid).length} valid of {importPreview.length})</div>
                    <div style={{ background: C.bg, borderRadius: 10, border: "1px solid " + C.border, overflow: "hidden" }}>
                      {/* Header */}
                      <div style={{ display: "flex", padding: "8px 12px", borderBottom: "1px solid " + C.border, fontSize: 12, fontWeight: 600, color: C.textMuted }}>
                        <span style={{ width: 24 }}></span>
                        <span style={{ flex: 2, minWidth: 0 }}>Business</span>
                        <span style={{ flex: 2, minWidth: 0 }}>Contact</span>
                        <span style={{ flex: 2, minWidth: 0 }}>Email</span>
                        <span style={{ flex: 1, minWidth: 0 }}>Role</span>
                      </div>
                      {importPreview.slice(0, 10).map((r, i) => (
                        <div key={i} style={{ display: "flex", padding: "8px 12px", borderBottom: i < Math.min(importPreview.length, 10) - 1 ? "1px solid " + C.borderLight : "none", fontSize: 12, alignItems: "center" }}>
                          <span style={{ width: 24, color: r.valid ? C.success : C.danger, fontWeight: 700 }}>{r.valid ? "✓" : "✗"}</span>
                          <span style={{ flex: 2, minWidth: 0, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name || "—"}</span>
                          <span style={{ flex: 2, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.contact || "—"}</span>
                          <span style={{ flex: 2, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: C.textMuted }}>{r.email || "—"}</span>
                          <span style={{ flex: 1, minWidth: 0, color: C.textMuted }}>{r.role || "—"}</span>
                        </div>
                      ))}
                      {importPreview.length > 10 && (
                        <div style={{ padding: "8px 12px", fontSize: 12, color: C.textMuted, textAlign: "center" }}>+ {importPreview.length - 10} more rows</div>
                      )}
                    </div>
                    {importPreview.some(r => !r.valid) && (
                      <div style={{ fontSize: 12, color: C.danger, marginTop: 6 }}>{importPreview.filter(r => !r.valid).length} row{importPreview.filter(r => !r.valid).length > 1 ? "s" : ""} missing required fields (Business Name, Contact Name, Email) — will be skipped</div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {importPreview.filter(r => r.valid).length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <button className="r-btn" onClick={() => {
                      const newClients = importPreview.filter(r => r.valid).map(r => ({
                        id: Date.now() + Math.random(),
                        name: r.name,
                        contact: r.contact,
                        role: r.role || "—",
                        tag: r.tag || "—",
                        months: r.months || 0,
                        revenue: r.revenue || 0,
                        velocity: "normal",
                        lastHC: null,
                        lastContact: "—",
                        ret: 0,
                        referrals: 0,
                      }));
                      setClients(prev => [...prev, ...newClients]);
                      setShowImport(false);
                      setImportPreview([]);
                      setImportPaste("");
                      setImportFile(null);
                    }} style={{ flex: 1, padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Import {importPreview.filter(r => r.valid).length} Client{importPreview.filter(r => r.valid).length > 1 ? "s" : ""}</button>
                    <button onClick={() => { setShowImport(false); setImportPreview([]); setImportPaste(""); setImportFile(null); }} style={{ padding: "10px 16px", background: C.surface, color: C.textMuted, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                  </div>
                )}
              </div>
            )}

            {/* Add Client Flow */}
            {showAddClient && (
              <div style={{ background: C.card, borderRadius: 14, border: "2px solid " + C.primary, padding: "20px", marginBottom: 16, boxShadow: C.cardShadow }}>
                {profileStep === 0 && (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>New Client</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} placeholder="Company name" style={{ padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                      <input value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} placeholder="Primary contact name" style={{ padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                      <input value={newClient.role} onChange={e => setNewClient({...newClient, role: e.target.value})} placeholder="Their role" style={{ padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                      <input value={newClient.tag} onChange={e => setNewClient({...newClient, tag: e.target.value})} placeholder="Industry (e.g. Fitness, Real Estate)" style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                      <input value={newClient.months} onChange={e => setNewClient({...newClient, months: e.target.value})} placeholder="Months working together" type="number" style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                      <input value={newClient.revenue} onChange={e => setNewClient({...newClient, revenue: e.target.value})} placeholder="Estimated monthly revenue ($)" type="number" style={{ padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <button className="r-btn" onClick={() => { if (newClient.name && newClient.contact) setProfileStep(1); }} style={{ flex: 1, padding: "10px", background: newClient.name && newClient.contact ? C.btn : C.surface, color: newClient.name && newClient.contact ? "#fff" : C.textMuted, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: newClient.name && newClient.contact ? "pointer" : "default", fontFamily: "inherit" }}>Next: Relationship Profile</button>
                      <button onClick={() => { setShowAddClient(false); setProfileStep(0); setProfileScores({}); }} style={{ padding: "10px 14px", background: C.surface, color: C.textMuted, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                    </div>
                  </div>
                )}

                {profileStep >= 1 && profileStep <= 12 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 800 }}>Relationship Profile</h3>
                      <span style={{ fontSize: 12, color: C.textMuted }}>{profileStep} of 12</span>
                    </div>
                    <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                      {profileDimensions.map((_, i) => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < profileStep ? C.primary : profileScores[profileDimensions[i].key] !== undefined ? C.primaryLight : C.borderLight }} />
                      ))}
                    </div>
                    {(() => {
                      const dim = profileDimensions[profileStep - 1];
                      const current = profileScores[dim.key];
                      return (
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{dim.name}</p>
                          <p style={{ fontSize: 12, color: C.textSec, marginBottom: 14 }}>{dim.desc}</p>
                          <div style={{ textAlign: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: 32, fontWeight: 900, color: current !== undefined && current !== null ? C.primary : C.borderLight }}>{current !== undefined && current !== null ? current : "—"}</span>
                          </div>
                          <div style={{ padding: "0 4px", marginBottom: 6 }}>
                            <input type="range" min="0" max="10" value={current !== undefined && current !== null ? current : 5} onChange={e => setProfileScores({...profileScores, [dim.key]: parseInt(e.target.value)})} style={{ width: "100%", height: 6, appearance: "none", WebkitAppearance: "none", background: `linear-gradient(to right, ${C.border} 0%, ${C.primary} 100%)`, borderRadius: 3, outline: "none", cursor: "pointer" }} />
                            <style>{`input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: ${C.primary}; border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); cursor: pointer; } input[type="range"]::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: ${C.primary}; border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); cursor: pointer; }`}</style>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted, marginBottom: 14 }}>
                            <span>{dim.left}</span><span>{dim.right}</span>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setProfileStep(profileStep - 1)} style={{ padding: "8px 14px", background: C.surface, color: C.textSec, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Back</button>
                            <button className="r-btn" onClick={() => { if (current !== undefined && current !== null) { profileStep < 12 ? setProfileStep(profileStep + 1) : setProfileStep(13); } }} style={{ flex: 1, padding: "8px", background: current !== undefined && current !== null ? C.btn : C.surface, color: current !== undefined && current !== null ? "#fff" : C.textMuted, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: current !== undefined && current !== null ? "pointer" : "default", fontFamily: "inherit" }}>{profileStep < 12 ? "Next" : "Review"}</button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {profileStep === 13 && (
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Review</h3>
                    <div style={{ background: C.bg, borderRadius: 10, padding: "14px", marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{newClient.name}</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>{newClient.contact} · {newClient.role}</div>
                      {newClient.tag && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{newClient.tag} · {newClient.months || 0}mo · ${parseInt(newClient.revenue || 0).toLocaleString()}/mo</div>}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Relationship Profile</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 14 }}>
                      {profileDimensions.map(d => (
                        <div key={d.key} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: C.bg, borderRadius: 6, fontSize: 12 }}>
                          <span style={{ color: C.textSec }}>{d.name}</span>
                          <span style={{ fontWeight: 700, color: C.primary }}>{profileScores[d.key]}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, textAlign: "center", marginBottom: 14 }}>
                      {(() => {
                        const b = calcRetentionScore(profileScores, null) || 50;
                        const label = b >= 75 ? "Strong" : b >= 55 ? "Stable" : b >= 35 ? "Watch" : "At Risk";
                        const color = b >= 75 ? C.success : b >= 55 ? C.warning : C.danger;
                        return <span>Starting Signal: <span style={{ fontWeight: 700, color }}>{b}% — {label}</span></span>;
                      })()}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setProfileStep(12)} style={{ padding: "10px 14px", background: C.surface, color: C.textSec, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
                      <button className="r-btn" onClick={submitNewClient} style={{ flex: 1, padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add Client</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Client Search */}
            {clients.length > 5 && (
              <div style={{ marginBottom: 12, overflow: "hidden" }}>
                <input value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="Search clients..." style={{ width: "100%", padding: "0 16px", height: 44, border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: C.card, outline: "none", boxSizing: "border-box" }} />
              </div>
            )}
            <div style={{ background: C.card, borderRadius: 14, border: "1px solid " + C.border, overflow: "hidden" }}>
              {clients.filter(c => !clientSearch || c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.contact.toLowerCase().includes(clientSearch.toLowerCase()) || (c.tag || "").toLowerCase().includes(clientSearch.toLowerCase())).map((c, i, arr) => (
                <div key={c.id} className="row-hover" onClick={() => { setSelectedClient(c); setRolodexConfirm(false); setRemoveConfirm(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: i < arr.length - 1 ? "1px solid " + C.borderLight : "none" }}>
                  <ScoreRing score={c.ret} size={44} strokeWidth={4} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{c.contact} · {c.role}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>${(c.revenue / 1000).toFixed(1)}k<span style={{ fontSize: 12, fontWeight: 400, color: C.textMuted }}>/mo</span></div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>${Math.round(getAdjustedLTV(c) / 1000)}k LCV</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <RaiMiniPanel />
          </div>
          </div>
        )}

        {/* ═══ HEALTH CHECKS ═══ */}
        {page === "health" && (() => {
          const hcQuestions = [
            { q: "Has anything changed with this relationship?", weight: 0.40, options: [{ text: "Nothing — same as always", mod: 2 }, { text: "Something minor, could be nothing", mod: 0 }, { text: "Noticeably different from before", mod: -3 }, { text: "Something has clearly changed", mod: -5 }] },
            { q: "Is this relationship better or worse than last month?", weight: 0.20, options: [{ text: "Better — things are trending up", mod: 3 }, { text: "About the same", mod: 0 }, { text: "Slightly worse", mod: -3 }, { text: "Noticeably worse", mod: -5 }] },
            { q: "Has the way this client communicates with you changed?", weight: 0.20, options: [{ text: "No — same rhythm, same tone", mod: 2 }, { text: "Slightly different but nothing alarming", mod: 0 }, { text: "Noticeably different", mod: -3 }, { text: "Yes — clearly different from before", mod: -5 }] },
            { q: "If they cancelled tomorrow, would you be surprised?", weight: 0.10, options: [{ text: "Very surprised — not on my radar at all", mod: 2 }, { text: "Somewhat surprised but I could see it", mod: 0 }, { text: "Not really surprised", mod: -3 }, { text: "I’ve had the thought myself", mod: -5 }] },
            { q: "Is this client getting more or less value from your work than last quarter?", weight: 0.10, options: [{ text: "More — results are improving", mod: 3 }, { text: "About the same", mod: 0 }, { text: "Less — results are slipping", mod: -3 }, { text: "Significantly less", mod: -5 }] },
          ];

          const selectAnswer = (client, qIdx, mod) => {
            const key = client;
            const prev = hcAnswers[key] || [];
            const alreadyAnswered = prev[qIdx] !== undefined;
            const updated = [...prev];
            updated[qIdx] = mod;
            setHcAnswers({ ...hcAnswers, [key]: updated });
            if (!alreadyAnswered) {
              setTimeout(() => {
                setHcStep(prev => ({ ...prev, [key]: qIdx + 1 }));
              }, 300);
            }
          };

          const calcDrift = (answers) => {
            if (!answers || answers.length < 5) return null;
            let delta = 0;
            hcQuestions.forEach((q, i) => {
              if (answers[i] != null) delta += answers[i] * q.weight;
            });
            delta = Math.round(delta);
            if (delta >= 2) return "Improving";
            if (delta >= 0) return "Stable";
            if (delta >= -2) return "Something shifted";
            if (delta >= -4) return "Declining";
            return "At risk";
          };

          const driftColor = (d) => d === "Improving" ? C.success : d === "Stable" ? C.primary : d === "Something shifted" ? C.warning : C.danger;
          const driftBg = (d) => d === "Improving" ? "#D1FAE5" : d === "Stable" ? C.primarySoft : d === "Something shifted" ? "#FEF3C7" : "#FEE2E2";

          const submitHc = async (client) => {
            const answers = hcAnswers[client] || [];
            const drift = calcDrift(answers);
            
            // Update local state
            setClientDrift(prev => ({ ...prev, [client]: drift }));
            setClients(prev => prev.map(x => x.name === client ? { ...x, lastHC: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) } : x));
            setHcDone(prev => ({ ...prev, [client]: true }));
            setHcOpen(null);
            
            // Persist to Supabase
            const clientObj = clients.find(c => c.name === client);
            if (clientObj) {
              // Find the HC record for this client
              const hcRecord = hcQueue.find(h => h.client === client);
              if (hcRecord?.id) {
                // Complete the health check
                const answersObj = {};
                answers.forEach((a, i) => { answersObj["q" + (i + 1)] = a; });
                await hcDb.complete(hcRecord.id, answersObj, null, drift);
                // Schedule next HC (30 days)
                await hcDb.scheduleNext(user.id, hcRecord.client_id || clientObj.id);
              }
              // Update client drift
              await clientsDb.updateDrift(clientObj.id, drift, new Date().toISOString().split("T")[0]);
            }
          };

          const activeQueue = hcQueue.filter(h => (h.overdue > 0 || h.due === "Today") && !hcDone[h.client]).sort((a, b) => b.overdue - a.overdue);
          const justCompleted = hcQueue.filter(h => (h.overdue > 0 || h.due === "Today") && hcDone[h.client]);
          const upcomingQueue = hcQueue.filter(h => h.overdue === 0 && h.due !== "Today");

          return (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Health Checks</h1>
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 20 }}>Monthly cadence · {activeQueue.filter(h => h.overdue > 0).length} overdue · {activeQueue.filter(h => h.due === "Today").length} due today</p>
            <div className="r-today-cols" style={{ display: "flex", gap: 24 }}>
            <div className="r-today-panel" style={{ width: 270, flexShrink: 0 }}>
              <PortfolioPanel />
            </div>
            <div style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>

              {activeQueue.length === 0 && justCompleted.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>All caught up</p>
                  <p style={{ fontSize: 12, color: C.textMuted }}>No health checks due right now. Check back when the next one is ready.</p>
                </div>
              )}

              {/* Active Queue — Card Stack */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activeQueue.map((h, i) => {
                  const isOpen = hcOpen === h.client;
                  const step = hcStep[h.client] || 0;
                  const answers = hcAnswers[h.client] || [];
                  const allAnswered = answers.length === 5 && answers.every(a => a !== undefined);

                  return (
                    <div key={i} style={{ background: C.card, borderRadius: 14, border: "1.5px solid " + (isOpen ? C.primary : C.border), transition: "all 0.2s", boxShadow: C.cardShadow }}>
                      <div onClick={() => setHcOpen(isOpen ? null : h.client)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", cursor: "pointer" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 700 }}>{h.client}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: retColor(h.ret) }}>{h.ret}%</span>
                          </div>
                          <div style={{ fontSize: 13, color: h.overdue > 0 ? C.danger : C.warning, marginTop: 3 }}>
                            {h.overdue > 0 ? `Overdue by ${h.overdue}d` : "Due today"}
                          </div>
                        </div>
                        {!isOpen && (
                          <button className="r-btn" style={{ padding: "10px 22px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Start</button>
                        )}
                      </div>

                      {/* Expanded HC Flow */}
                      {isOpen && (
                        <div style={{ padding: "0 18px 18px" }}>
                          {/* Progress */}
                          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                            {Array.from({ length: hcQuestions.length }).map((_, qi) => (
                              <div key={qi} style={{ flex: 1, height: 3, borderRadius: 2, background: qi < step || answers[qi] !== undefined ? C.primary : C.borderLight }} />
                            ))}
                          </div>

                          {/* Current question */}
                          {step < hcQuestions.length && (
                            <div style={{ marginBottom: 12 }}>
                              <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, lineHeight: 1.4 }}>{hcQuestions[step].q}</p>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {hcQuestions[step].options.map((opt, oi) => {
                                  const isSelected = answers[step] === opt.mod;
                                  return (
                                    <div key={oi} onClick={() => selectAnswer(h.client, step, opt.mod)} style={{
                                      padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                                      background: isSelected ? C.primarySoft : C.bg,
                                      border: "1.5px solid " + (isSelected ? C.primary : C.borderLight),
                                      fontSize: 15, color: isSelected ? C.primary : C.textSec,
                                      fontWeight: isSelected ? 600 : 400,
                                      transition: "all 0.15s",
                                    }}>{opt.text}</div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Nav */}
                          {step < hcQuestions.length && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                              <button onClick={() => step > 0 && setHcStep({ ...hcStep, [h.client]: step - 1 })} style={{ padding: "10px 16px", background: step > 0 ? C.surface : "transparent", color: step > 0 ? C.textSec : "transparent", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: step > 0 ? "pointer" : "default", fontFamily: "inherit" }}>Back</button>
                              <span style={{ fontSize: 12, color: C.textMuted }}>{step + 1} of {hcQuestions.length}</span>
                              {(() => {
                                const answered = answers[step] !== undefined;
                                return <button onClick={() => answered && setHcStep({ ...hcStep, [h.client]: step + 1 })} style={{ padding: "10px 22px", background: answered ? C.primary : C.surface, color: answered ? "#fff" : C.textMuted, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: answered ? "pointer" : "default", fontFamily: "inherit" }}>Next</button>;
                              })()}
                            </div>
                          )}

                          {/* Auto-close on completion */}
                          {step >= hcQuestions.length && allAnswered && (() => {
                            if (!hcDone[h.client]) {
                              setTimeout(() => submitHc(h.client), 0);
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Done Today */}
              {justCompleted.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Done today ({justCompleted.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {justCompleted.map((h, i) => {
                      const drift = clientDrift[h.client];
                      return (
                        <div key={"done-" + i} style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.borderLight, padding: "12px 18px", opacity: 0.55, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, textDecoration: "line-through" }}>{h.client}</span>
                            <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>Completed</div>
                          </div>
                          {drift && (
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: driftBg(drift), color: driftColor(drift) }}>{drift}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upcoming */}
              {upcomingQueue.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div className="row-hover" onClick={() => setShowUpcoming(!showUpcoming)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 10, cursor: "pointer", border: "1px solid " + C.borderLight }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.textMuted }}>Upcoming ({upcomingQueue.length})</span>
                  </div>
                  {showUpcoming && (
                    <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.borderLight, overflow: "hidden", marginTop: 6 }}>
                      {upcomingQueue.map((h, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: i < upcomingQueue.length - 1 ? "1px solid " + C.borderLight : "none", opacity: 0.5 }}>
                          <span style={{ fontSize: 13, color: C.textMuted }}>{h.client}</span>
                          <span style={{ fontSize: 12, color: C.textMuted }}>{h.due}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <RaiMiniPanel />
            </div>
            </div>
          );
        })()}

        {/* ═══ REFERRAL INTELLIGENCE (ENTERPRISE) ═══ */}
        {page === "referral_intel" && tier === "enterprise" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>Referral Intelligence</h1>
            <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 16 }}>Rai analyzes your portfolio and ranks clients by referral readiness. No guessing — just data.</p>

            {/* Summary stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { l: "Ready to Ask", v: referralReadiness.filter(r => r.tier === "ready").length, c: C.success },
                { l: "Building", v: referralReadiness.filter(r => r.tier === "building").length, c: C.warning },
                { l: "Not Yet", v: referralReadiness.filter(r => r.tier === "not_yet").length, c: C.textMuted },
              ].map((s, i) => (
                <div key={i} style={{ background: C.card, borderRadius: 10, padding: "12px 14px", border: "1px solid " + C.border, textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", marginBottom: 3 }}>{s.l}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.c }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Ready to Ask */}
            {referralReadiness.filter(r => r.tier === "ready").length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.success, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>🎯 Ready to Ask</div>
                {referralReadiness.filter(r => r.tier === "ready").map(c => (
                  <div key={c.id} style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, padding: "16px", marginBottom: 10, boxShadow: C.cardShadow }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</span>
                        <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8 }}>{c.contact} · {c.months}mo</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: C.success }}>{c.readiness}%</span>
                        <span style={{ fontSize: 12, color: C.textMuted }}>ready</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                      {c.reasons.map((r, ri) => (
                        <span key={ri} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 4, background: C.primarySoft, color: C.primary, fontWeight: 500 }}>{r}</span>
                      ))}
                    </div>
                    <div style={{ background: C.raiGrad, borderRadius: 12, padding: "14px 16px", color: "#fff" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "rgba(255,255,255,.4)", marginBottom: 6 }}>Rai's Approach</div>
                      <p style={{ fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,.7)" }}>{c.approach}</p>
                    </div>
                    <button className="r-btn" onClick={() => { setPage("coach"); setAiMessages([{ role: "ai", text: `Let's talk about getting a referral from ${c.contact} at ${c.name}. Here's what I'm thinking: ${c.approach}` }]); }} style={{ width: "100%", marginTop: 10, padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Talk to Rai About This</button>
                  </div>
                ))}
              </div>
            )}

            {/* Building Toward It */}
            {referralReadiness.filter(r => r.tier === "building").length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.warning, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>🔄 Building Toward It</div>
                {referralReadiness.filter(r => r.tier === "building").map(c => (
                  <div key={c.id} style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, padding: "16px", marginBottom: 10, boxShadow: C.cardShadow }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</span>
                        <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8 }}>{c.contact} · {c.months}mo</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: C.warning }}>{c.readiness}%</span>
                        <span style={{ fontSize: 12, color: C.textMuted }}>ready</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                      {c.reasons.map((r, ri) => (
                        <span key={ri} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 4, background: "#FEF3C7", color: "#92400E", fontWeight: 500 }}>{r}</span>
                      ))}
                    </div>
                    <p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.5 }}>{c.approach}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Not Yet */}
            {referralReadiness.filter(r => r.tier === "not_yet").length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>⏳ Not Yet</div>
                <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, overflow: "hidden" }}>
                  {referralReadiness.filter(r => r.tier === "not_yet").map((c, i, arr) => (
                    <div key={c.id} style={{ padding: "12px 16px", borderBottom: i < arr.length - 1 ? "1px solid " + C.borderLight : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                        <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8 }}>{c.contact}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: C.textMuted }}>{c.readiness}%</span>
                        <span style={{ fontSize: 12, color: C.textMuted }}>{c.approach.split(".")[0]}.</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rai blanket */}
            <div style={{ background: C.raiGrad, borderRadius: 14, padding: "16px 18px", color: "#fff", marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "rgba(255,255,255,.4)", marginBottom: 6 }}>Rai</div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.7)", lineHeight: 1.55 }}>Referral readiness is recalculated with every sweep. As relationships deepen and trust builds, clients move up the list. The best time to ask is when they're riding a win.</p>
              <button className="r-btn" onClick={() => { setPage("coach"); setAiMessages([{ role: "ai", text: "Let's talk referral strategy. Who are you thinking about asking? I can help you find the right moment and the right words." }]); }} style={{ width: "100%", marginTop: 10, padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Talk to Rai</button>
            </div>
          </div>
        )}

        {/* ═══ REFERRALS ═══ */}
        {page === "referrals" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>Referrals</h1>
                <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 4 }}>Your clients are your best salespeople. Track who they send your way.</p>
              </div>
              <button className="r-btn" onClick={() => setRefForm(true)} style={{ padding: "10px 20px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Log Referral</button>
            </div>
          <div className="r-today-cols" style={{ display: "flex", gap: 24 }}>
          <div className="r-today-panel" style={{ width: 270, flexShrink: 0 }}>
            <ReferralsPanel />
          </div>
          <div style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[{ l: "Total", v: refs.length }, { l: "Active", v: refsConverted.length, c: C.success }, { l: "Revenue", v: "$" + refsRevenue.toLocaleString(), c: C.primary }].map((s, i) => (
                <div key={i} style={{ background: C.card, borderRadius: 10, padding: "12px 14px", border: "1px solid " + C.border, textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", marginBottom: 3 }}>{s.l}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.c || C.text }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Search */}
            {refs.length > 15 && (
              <div style={{ marginBottom: 12 }}>
                <input value={refSearch} onChange={e => setRefSearch(e.target.value)} placeholder="Search referrals..." style={{ width: "100%", padding: "0 16px", height: 44, border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: C.card, outline: "none" }} />
              </div>
            )}

            {/* Add referral */}
            {refForm ? (
              <div style={{ background: C.card, borderRadius: 12, border: "1.5px solid " + C.primary, padding: "16px", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>New Referral</div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Who was referred to you?</label>
                  <input value={refName} onChange={e => setRefName(e.target.value)} placeholder="Person or company name" style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Which client referred them?</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {[...clients].sort((a, b) => b.ret - a.ret).map(c => (
                      <span key={c.id} onClick={() => setRefFrom(c.name)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: refFrom === c.name ? C.primarySoft : C.bg, border: "1.5px solid " + (refFrom === c.name ? C.primary : C.borderLight), cursor: "pointer", fontWeight: refFrom === c.name ? 600 : 500, color: refFrom === c.name ? C.primary : retColor(c.ret) }}>{c.name}</span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Status</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[{ id: "converted", label: "Active" }, { id: "closed", label: "Closed" }].map(s => {
                      const sel = refStatus === s.id;
                      const isRed = s.id === "closed";
                      return (
                      <button key={s.id} onClick={() => setRefStatus(s.id)} style={{ padding: "6px 14px", borderRadius: 6, border: "1.5px solid " + (sel ? (isRed ? C.danger : C.primary) : C.borderLight), background: sel ? (isRed ? "#FAE8E4" : C.primarySoft) : C.bg, color: sel ? (isRed ? C.danger : C.primary) : C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{s.label}</button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Average monthly revenue ($)</label>
                  <input type="number" value={refRevenue} onChange={e => setRefRevenue(e.target.value)} placeholder="0" style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                </div>

                {refStatus === "closed" && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Total revenue earned ($)</label>
                    <input type="number" value={refTotalRevenue} onChange={e => setRefTotalRevenue(e.target.value)} placeholder="0" style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  {(() => {
                    const ready = refName.trim() && refFrom;
                    return <button className="r-btn" onClick={() => ready && addRef()} style={{ flex: 1, padding: "10px", background: ready ? C.btn : C.surface, color: ready ? "#fff" : C.textMuted, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: ready ? "pointer" : "default", fontFamily: "inherit" }}>Log Referral</button>;
                  })()}
                  <button onClick={() => { setRefForm(false); setRefName(""); setRefFrom(""); setRefStatus("converted"); setRefTotalRevenue(""); }} style={{ padding: "10px 16px", background: C.surface, color: C.textMuted, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                </div>
              </div>
            ) : null}

            {/* Referral log */}
            <div style={{ background: C.card, borderRadius: 14, border: "1px solid " + C.border, overflow: "hidden", boxShadow: C.cardShadow }}>
              {refs.filter(r => !refSearch || r.to.toLowerCase().includes(refSearch.toLowerCase()) || r.from.toLowerCase().includes(refSearch.toLowerCase())).map((r, i, arr) => (
                <div key={r.id || i} className="row-hover" onClick={() => { setRefEditing(r.id || i); setRefEditData({ to: r.to, from: r.from, status: r.status || (r.converted ? "converted" : "lost"), converted: r.converted, revenue: r.revenue || "", totalRevenue: r.totalRevenue || "" }); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: i < arr.length - 1 ? "1px solid " + C.borderLight : "none", cursor: "pointer" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{r.to}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Referred by {r.from} · {r.date}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 4, fontWeight: 600, background: (r.status === "converted" || (r.converted && r.status !== "closed")) ? "#E2F3EB" : "#FAE8E4", color: (r.status === "converted" || (r.converted && r.status !== "closed")) ? C.success : C.danger }}>{(r.status === "converted" || (r.converted && r.status !== "closed")) ? "Active" : "Closed"}</span>
                    {(r.revenue > 0 || r.totalRevenue > 0) && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{(r.status === "converted" || (r.converted && r.status !== "closed")) && r.revenue > 0 ? "$" + r.revenue.toLocaleString() + "/mo" : ""}{r.status === "closed" && r.totalRevenue > 0 ? "$" + r.totalRevenue.toLocaleString() + " total" : ""}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* AI insight */}
            <div style={{ background: C.raiGrad, borderRadius: 14, padding: "22px", color: "#fff", marginTop: 16, boxShadow: "0 4px 24px rgba(30,38,31,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><Icon name="spark" size={14} color="rgba(255,255,255,0.6)" /><span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)" }}>Rai</span></div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.7)", lineHeight: 1.6, marginBottom: 14 }}>Ready for more business? Your happiest clients know people like them. Rai can help you figure out who to ask and when the timing is right.</p>
              <button className="r-btn" onClick={() => { setPage("coach"); setAiMessages([{ role: "ai", text: "Let's talk referrals. Your strongest relationships are your best source of new business. Who are you thinking about asking?" }]); }} style={{ width: "100%", padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Talk to Rai</button>
            </div>
          </div>
          <RaiMiniPanel />
          </div>
          </div>
        )}

        {/* ═══ ROLODEX ═══ */}
        {page === "retros" && (() => {
          const formerQuestions = [
            { key: "what", label: "What happened?", placeholder: "Contract ended, budget cut, went in-house, bad fit, outgrew the service..." },
            { key: "terms", label: "How did it end?", placeholder: "Good terms, neutral, rough — be honest." },
            { key: "comeback", label: "Would they come back?", placeholder: "Yes, maybe, no. What would need to change?" },
            { key: "refer", label: "Would they refer you?", placeholder: "Even if they left, would they recommend you to someone?" },
          ];
          const oneoffQuestions = [
            { key: "work", label: "What did you do for them?", placeholder: "Site audit, one-time campaign, consulting session, strategy doc..." },
            { key: "refer", label: "Would they refer you?", placeholder: "Even a one-time client can send you business. What's your read?" },
          ];

          const pendingFormer = rolodex.filter(r => r.type === "former" && !r.priority);
          const pendingOneoff = rolodex.filter(r => r.type === "oneoff" && !r.priority);
          const pending = [...pendingFormer, ...pendingOneoff];
          const searchFilter = (r) => !rolodexSearch || r.client.toLowerCase().includes(rolodexSearch.toLowerCase()) || r.contact.toLowerCase().includes(rolodexSearch.toLowerCase());
          const saved = rolodex.filter(r => r.priority && searchFilter(r));
          const savedHigh = saved.filter(r => r.priority === "high");
          const savedMedium = saved.filter(r => r.priority === "medium");
          const savedLow = saved.filter(r => r.priority === "low");

          const priorityLabel = (p) => p === "high" ? "High priority" : p === "medium" ? "Medium priority" : "Low priority";
          const priorityColor = (p) => p === "high" ? C.success : p === "medium" ? C.warning : C.textMuted;

          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>Rolodex</h1>
                  <p style={{ fontSize: 14, color: C.textMuted }}>People you've worked with. Some come back. Some refer. All worth a check-in.</p>
                </div>
                <button className="r-btn" onClick={() => setShowAddRolodex(true)} style={{ padding: "10px 20px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Add Lead</button>
              </div>
            <div className="r-today-cols" style={{ display: "flex", gap: 24 }}>
            <div className="r-today-panel" style={{ width: 270, flexShrink: 0 }}>
              <RolodexPanel />
            </div>
            <div style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>

              {/* Add to Rolodex — one-off entry */}
              {showAddRolodex && (
                <div style={{ background: C.card, borderRadius: 14, border: "2px solid " + C.primary, padding: "20px", marginBottom: 16, boxShadow: C.cardShadow }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Add to Rolodex</h3>
                  <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 12 }}>One-time clients, past projects, anyone worth a future check-in.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input value={newRolodexEntry.client} onChange={e => setNewRolodexEntry({...newRolodexEntry, client: e.target.value})} placeholder="Company or person name" style={{ padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                    <input value={newRolodexEntry.contact} onChange={e => setNewRolodexEntry({...newRolodexEntry, contact: e.target.value})} placeholder="Contact name" style={{ padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                    <input value={newRolodexEntry.work} onChange={e => setNewRolodexEntry({...newRolodexEntry, work: e.target.value})} placeholder="What did you do for them?" style={{ padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    {(() => {
                      const ready = newRolodexEntry.client.trim() && newRolodexEntry.contact.trim();
                      return <button className="r-btn" onClick={async () => { if (ready) { const newEntry = { client: newRolodexEntry.client.trim(), contact: newRolodexEntry.contact.trim(), months: 0, type: "oneoff", date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }), tags: [], priority: null, work: newRolodexEntry.work.trim() };
                const { data: createdRolodex } = await rolodexDb.create(user.id, {
                  client_name: newEntry.client,
                  contact_name: newEntry.contact,
                  type: "oneoff",
                  date_added: newEntry.date,
                  notes: newEntry.work,
                });
                newEntry.id = createdRolodex?.id || Date.now();
                setRolodex(prev => [...prev, newEntry]); setNewRolodexEntry({ client: "", contact: "", work: "" }); setShowAddRolodex(false); setRolodexFlowOpen(newEntry.id); } }} style={{ flex: 1, padding: "10px", background: ready ? C.btn : C.surface, color: ready ? "#fff" : C.textMuted, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: ready ? "pointer" : "default", fontFamily: "inherit" }}>Add & Start Flow</button>;
                    })()}
                    <button onClick={() => { setShowAddRolodex(false); setNewRolodexEntry({ client: "", contact: "", work: "" }); }} style={{ padding: "10px 14px", background: C.surface, color: C.textMuted, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Pending — need to complete flow */}
              {pending.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Ready to process</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {pending.map((r) => {
                      const isOpen = rolodexFlowOpen === r.id;
                      const answers = retroAnswers[r.id] || {};
                      const questions = r.type === "former" ? formerQuestions : oneoffQuestions;
                      const step = retroStep;
                      const allQuestionsAnswered = questions.every(q => (answers[q.key] || "").trim());
                      const priorityPicked = answers._priority;
                      const totalSteps = questions.length + 1;

                      return (
                        <div key={r.id} style={{ background: C.card, borderRadius: 12, border: "1px solid " + (isOpen ? C.primary : C.border) }}>
                          <div onClick={() => setRolodexFlowOpen(isOpen ? null : r.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", cursor: "pointer" }}>
                            <div>
                              <span style={{ fontSize: 14, fontWeight: 600 }}>{r.client}</span>
                              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{r.contact}{r.months > 0 ? " · " + r.months + "mo together" : ""}{r.type === "oneoff" ? " · One-off" : ""}</div>
                            </div>
                            {!isOpen && <button className="r-btn" style={{ padding: "6px 14px", background: C.btn, color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Begin</button>}
                          </div>

                          {isOpen && (
                            <div style={{ padding: "0 16px 16px" }}>
                              <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                                {Array.from({ length: totalSteps }).map((_, qi) => (
                                  <div key={qi} style={{ flex: 1, height: 3, borderRadius: 2, background: qi < step || (qi === questions.length && priorityPicked) ? C.primary : C.borderLight }} />
                                ))}
                              </div>

                              {step < questions.length && (
                                <div style={{ marginBottom: 12 }}>
                                  <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{questions[step].label}</p>
                                  <textarea value={answers[questions[step].key] || ""} onChange={e => (() => {
                                    const updated = { ...answers, [questions[step].key]: e.target.value };
                                    setRetroAnswers({ ...retroAnswers, [r.id]: updated });
                                    // Debounced persist handled on priority save
                                  })()} placeholder={questions[step].placeholder} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg, minHeight: 80, resize: "vertical" }} />
                                </div>
                              )}

                              {step >= questions.length && (
                                <div style={{ marginBottom: 12 }}>
                                  {!priorityPicked && (
                                    <div>
                                      <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.4 }}>How should we prioritize this contact?</p>
                                      <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>This helps Rai know who to surface first.</p>
                                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {[
                                          { id: "high", label: "High priority", desc: "Warm lead. Reach out soon.", color: C.success },
                                          { id: "medium", label: "Medium priority", desc: "Worth staying in touch.", color: C.warning },
                                          { id: "low", label: "Low priority", desc: "Long shot. Check in eventually.", color: C.textMuted },
                                        ].map(opt => (
                                          <button key={opt.id} onClick={() => {
                                            const tags = [];
                                            if ((answers.terms || "").toLowerCase().includes("good")) tags.push("Good terms");
                                            if ((answers.refer || "").toLowerCase().includes("yes")) tags.push("Would refer");
                                            if ((answers.comeback || "").toLowerCase().includes("yes")) tags.push("Would come back");
                                            if (r.type === "oneoff") tags.push("One-off");
                                            setRolodex(prev => prev.map(x => x.id === r.id ? { ...x, priority: opt.id, tags } : x));
                                            setRetroAnswers({ ...retroAnswers, [r.id]: { ...answers, _priority: opt.id } });
                                            // Persist priority + answers
                                            rolodexDb.update(r.id, { priority: opt.id, retro_answers: { ...answers, _priority: opt.id } });
                                          }} style={{ padding: "12px 14px", borderRadius: 8, border: "1.5px solid " + C.borderLight, background: C.bg, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: opt.color }}>{opt.label}</span>
                                            <span style={{ display: "block", fontSize: 12, color: C.textMuted, marginTop: 2 }}>{opt.desc}</span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {priorityPicked && (
                                    <div>
                                      <div style={{ background: C.raiGrad, borderRadius: 12, padding: "14px 16px", color: "#fff", marginBottom: 12 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "rgba(255,255,255,.3)", marginBottom: 6 }}>Rai</div>
                                        <p style={{ fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,.65)" }}>Rai will track {r.client} and remind you when it's time to reconnect. Past clients are your warmest leads.</p>
                                      </div>
                                      <button className="r-btn" onClick={() => { setRolodexFlowOpen(null); setRetroStep(0); }} style={{ width: "100%", padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Done</button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {step < questions.length && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <button onClick={() => step > 0 && setRetroStep(step - 1)} style={{ padding: "8px 14px", background: step > 0 ? C.surface : "transparent", color: step > 0 ? C.textSec : "transparent", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: step > 0 ? "pointer" : "default", fontFamily: "inherit" }}>Back</button>
                                  <span style={{ fontSize: 12, color: C.textMuted }}>{step + 1} of {totalSteps}</span>
                                  {(() => {
                                    const answered = (answers[questions[step].key] || "").trim();
                                    return <button onClick={() => answered && setRetroStep(step + 1)} style={{ padding: "6px 14px", background: answered ? C.primary : C.surface, color: answered ? "#fff" : C.textMuted, border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: answered ? "pointer" : "default", fontFamily: "inherit" }}>Next</button>;
                                  })()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Search */}
              {rolodex.length > 15 && (
                <div style={{ marginBottom: 12 }}>
                  <input value={rolodexSearch} onChange={e => setRolodexSearch(e.target.value)} placeholder="Search rolodex..." style={{ width: "100%", padding: "0 16px", height: 44, border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: C.card, outline: "none" }} />
                </div>
              )}

              {/* Saved — grouped by priority */}
              {saved.length > 0 && (
                <div>
                  {[
                    { key: "high", items: savedHigh, label: "High priority", color: C.success },
                    { key: "medium", items: savedMedium, label: "Medium priority", color: C.warning },
                    { key: "low", items: savedLow, label: "Low priority", color: C.textMuted },
                  ].filter(g => g.items.length > 0).map(group => (
                    <div key={group.key} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: group.color, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>{group.label}</div>
                      <div style={{ background: C.card, borderRadius: 14, border: "1px solid " + C.border, overflow: "hidden", boxShadow: C.cardShadow }}>
                        {group.items.map((r, i) => {
                          const answers = retroAnswers[r.id] || {};
                          const summary = r.type === "former" ? (answers.what || answers.terms || null) : (answers.work || null);
                          return (
                          <div key={r.id} className="row-hover" onClick={() => { setSelectedRolodex(r); setRolodexRemoveConfirm(false); setRolodexEditing(false); }} style={{ padding: "14px 16px", borderBottom: i < group.items.length - 1 ? "1px solid " + C.borderLight : "none", cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                              <span style={{ fontSize: 15, fontWeight: 700 }}>{r.client}</span>
                              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 3, background: C.surface, color: C.textMuted }}>{r.type === "oneoff" ? "One-off" : "Former"}</span>
                            </div>
                            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: (r.tags && r.tags.length > 0) || summary ? 6 : 0 }}>{r.contact}{r.months > 0 ? " · " + r.months + "mo" : ""}</div>
                            {r.tags && r.tags.length > 0 && (
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: summary ? 6 : 0 }}>
                                {r.tags.map((t, ti) => (
                                  <span key={ti} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: C.primarySoft, color: C.primary, fontWeight: 600 }}>{t}</span>
                                ))}
                              </div>
                            )}
                            {summary && (
                              <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.4, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{summary}</p>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {rolodex.length === 0 && !showAddRolodex && (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📇</div>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Your Rolodex is empty</p>
                  <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>Move clients here when relationships end, or add one-off contacts worth a future check-in.</p>
                </div>
              )}
            </div>
            <RaiMiniPanel />
            </div>
            </div>
          );
        })()}
        {/* ═══ COACH / TALK TO RAI — Claude-style chat ═══ */}
        {page === "coach" && (
          <div className="r-rai-page" style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 56px)" }}>
            <div className="r-rai-scroll" style={{ flex: 1, overflow: "auto", WebkitOverflowScrolling: "touch" }}>
              <div className="r-rai-inner" style={{ width: "100%", maxWidth: 720, margin: "0 auto", padding: "24px 24px 0" }}>
                {aiMessages.length === 0 ? (
                  <div>
                    <p style={{ fontSize: 22, fontWeight: 500, color: C.text, lineHeight: 1.4, marginBottom: 32, letterSpacing: "-0.01em" }}>What's on your mind today?</p>
                    <div style={{ background: C.card, border: "1.5px solid " + C.border, borderRadius: 14, padding: "14px 16px 10px", marginBottom: 32 }}>
                      <textarea value={aiInput} onChange={e => { setAiInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px"; }} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAi(); } }} placeholder="Ask about a client, draft a message, get advice…" rows={2} style={{ width: "100%", padding: "4px 0", border: "none", fontSize: 17, fontFamily: "inherit", background: "transparent", outline: "none", resize: "none", lineHeight: 1.5, color: C.text, overflowY: "auto" }} />
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 4 }}>
                        <button onClick={() => sendAi()} disabled={!aiInput.trim()} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: aiInput.trim() ? C.btn : C.borderLight, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: aiInput.trim() ? "pointer" : "default", transition: "background 0.15s" }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 13L13 8L3 3V7L9 8L3 9V13Z" fill="#fff"/></svg>
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {Object.keys(coachDemos).slice(0, 4).map((s, i) => (
                        <div key={i} className="card-hover" onClick={() => sendAi(s)} style={{ padding: "12px 16px", background: C.card, borderRadius: 10, border: "1px solid " + C.borderLight, fontSize: 14, color: C.textSec, cursor: "pointer" }}>{s}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ paddingBottom: 200 }}>
                    {aiMessages.map((m, i) => {
                      const isLastUser = m.role === "user" && i === aiMessages.length - 1;
                      const messageRef = isLastUser ? aiUserRef : null;
                      return m.role === "user" ? (
                        <div key={i} ref={messageRef} style={{ marginBottom: 28, display: "flex", justifyContent: "flex-end", scrollMarginTop: 24 }}>
                          <div style={{ maxWidth: "75%", background: C.surface, borderRadius: 20, padding: "12px 18px" }}>
                            {m.text.split("\n").map((l, j) => l.trim() === "" ? <div key={j} style={{ height: 8 }} /> : <p key={j} style={{ fontSize: 17, color: C.text, lineHeight: 1.5, margin: 0 }}>{l}</p>)}
                          </div>
                        </div>
                      ) : (
                        <div key={i} style={{ marginBottom: 28 }}>
                          <RaiMarkdown text={m.text} size={17} lineHeight={1.55} />
                        </div>
                      );
                    })}
                    {aiTyping && <div style={{ marginBottom: 28, display: "flex", gap: 4, padding: "4px 0" }}>{[0,1,2].map(j => <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: C.textMuted, animation: `pulse 1.2s ease-in-out ${j*0.2}s infinite` }} />)}</div>}
                    <div ref={aiEndRef} />
                  </div>
                )}
              </div>
            </div>
            {/* Input bar — fixed bottom once conversation started */}
            {aiMessages.length > 0 && (
              <div className="r-rai-inputbar" style={{ borderTop: "1px solid " + C.borderLight, background: C.bg, padding: "12px 24px 16px" }}>
                <div style={{ maxWidth: 720, margin: "0 auto" }}>
                  <div style={{ background: C.card, border: "1.5px solid " + C.border, borderRadius: 14, padding: "14px 16px 10px" }}>
                    <textarea value={aiInput} onChange={e => { setAiInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px"; }} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAi(); } }} placeholder="Reply to Rai…" rows={1} style={{ width: "100%", padding: "4px 0", border: "none", fontSize: 17, fontFamily: "inherit", background: "transparent", outline: "none", resize: "none", lineHeight: 1.5, color: C.text, overflowY: "auto" }} />
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 4 }}>
                      <button onClick={() => sendAi()} disabled={!aiInput.trim()} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: aiInput.trim() ? C.btn : C.borderLight, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: aiInput.trim() ? "pointer" : "default", transition: "background 0.15s" }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 13L13 8L3 3V7L9 8L3 9V13Z" fill="#fff"/></svg>
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: C.textMuted, textAlign: "center", marginTop: 6 }}>Rai can make mistakes. Double-check anything you act on.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ SETTINGS ═══ */}
        {page === "settings" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 }}>Settings</h1>
            {[{ title: "Account", desc: "Name, email, password" }, { title: "Notifications", desc: "Email alerts, daily digest" }, { title: "Team", desc: "Invite members, assign clients" }, { title: "Billing", desc: "Plan, payment method, invoices" }].map((s, i) => (
              <div key={i} className="row-hover" style={{ background: C.card, borderRadius: 10, padding: "14px 16px", border: "1px solid " + C.border, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div><div style={{ fontSize: 12, color: C.textMuted }}>{s.desc}</div></div>
                <Icon name="chevron" size={16} color={C.border} />
              </div>
            ))}

            {/* Enterprise: Integrations */}
            {tier === "enterprise" && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 12 }}>Integrations</div>
                {integrations.map((cat, ci) => (
                  <div key={ci} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>{cat.cat}</div>
                    <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, overflow: "hidden" }}>
                      {cat.items.map((item, ii) => (
                        <div key={ii} className="row-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: ii < cat.items.length - 1 ? "1px solid " + C.borderLight : "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 14, width: 24, textAlign: "center" }}>{item.icon}</span>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {item.connected ? (
                              <span style={{ fontSize: 12, color: C.success, fontWeight: 600 }}>🟢 {item.meta}</span>
                            ) : (
                              <button className="r-btn" style={{ padding: "5px 14px", background: C.btn, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Connect</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Sweep Schedule */}
                <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 12, marginTop: 20 }}>Automated Sweep</div>
                <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, padding: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>Frequency</span>
                      <select style={{ padding: "6px 12px", border: "1.5px solid " + C.border, borderRadius: 6, fontSize: 14, fontFamily: "inherit", background: C.bg }}>
                        <option>Daily</option><option>Twice daily</option><option>Weekly (Monday AM)</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>Time</span>
                      <select style={{ padding: "6px 12px", border: "1.5px solid " + C.border, borderRadius: 6, fontSize: 14, fontFamily: "inherit", background: C.bg }}>
                        <option>6:00 AM</option><option>7:00 AM</option><option>8:00 AM</option><option>9:00 AM</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>Timezone</span>
                      <select style={{ padding: "6px 12px", border: "1.5px solid " + C.border, borderRadius: 6, fontSize: 14, fontFamily: "inherit", background: C.bg }}>
                        <option>Eastern</option><option>Central</option><option>Mountain</option><option>Pacific</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12, color: C.textMuted }}>Last sweep: Today at 6:02 AM · {sweepData.clients_analyzed} clients</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>Next sweep: Tomorrow at 6:00 AM</div>
                  <button className="r-btn" style={{ width: "100%", marginTop: 12, padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Run Sweep Now</button>
                </div>

                {/* Output Routing */}
                <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 12, marginTop: 20 }}>Output Routing</div>
                <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, padding: "16px" }}>
                  {[
                    { label: "Retayned Dashboard", checked: true, disabled: true, meta: "Always on" },
                    { label: "Slack Channel", checked: false, meta: "#retention-alerts" },
                    { label: "Webhook URL", checked: false, meta: "https://..." },
                    { label: "Email Digest", checked: false, meta: "team@company.com" },
                  ].map((r, ri) => (
                    <div key={ri} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: ri < 3 ? "1px solid " + C.borderLight : "none" }}>
                      <input type="checkbox" checked={r.checked} disabled={r.disabled} readOnly style={{ width: 16, height: 16 }} />
                      <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{r.label}</span>
                      <span style={{ fontSize: 12, color: C.textMuted }}>{r.meta}</span>
                    </div>
                  ))}
                </div>

                {/* API Access */}
                <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 12, marginTop: 20 }}>API Access</div>
                <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>API Key</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>Use this key to authenticate API requests</div>
                    </div>
                    <button className="r-btn" style={{ padding: "6px 14px", background: C.btn, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Regenerate</button>
                  </div>
                  <div style={{ background: C.bg, borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: C.textSec, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>sk_live_ret_••••••••••••••••••••a4f2</span>
                    <button style={{ background: "none", border: "none", fontSize: 12, color: C.primary, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Copy</button>
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 10 }}>Endpoints</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { method: "GET", path: "/api/sweeps/latest", desc: "Most recent sweep results" },
                      { method: "POST", path: "/api/sweeps/trigger", desc: "Run a sweep now" },
                      { method: "GET", path: "/api/clients/{id}/signals", desc: "Client automated analysis" },
                      { method: "GET", path: "/api/tasks", desc: "All open tasks" },
                      { method: "PATCH", path: "/api/tasks/{id}", desc: "Mark task complete" },
                      { method: "POST", path: "/api/clients/{id}/analyze", desc: "Trigger analysis on one client" },
                      { method: "GET", path: "/api/referrals/readiness", desc: "Referral readiness ranking" },
                    ].map((ep, ei) => (
                      <div key={ei} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: C.bg, borderRadius: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", padding: "2px 6px", borderRadius: 3, background: ep.method === "GET" ? C.primarySoft : ep.method === "POST" ? "#EDE9FE" : "#FEF3C7", color: ep.method === "GET" ? C.primary : ep.method === "POST" ? C.btn : "#92400E" }}>{ep.method}</span>
                        <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, flex: 1 }}>{ep.path}</span>
                        <span style={{ fontSize: 12, color: C.textMuted }}>{ep.desc}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 10 }}>Webhook Payload</div>
                  <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>On every sweep completion, the configured webhook receives the full output schema:</p>
                  <div style={{ background: "#1E261F", borderRadius: 8, padding: "14px", fontFamily: "monospace", fontSize: 11, color: "#A7C4B5", lineHeight: 1.6, overflow: "auto", maxHeight: 200 }}>
                    <div style={{ color: "#558B68" }}>{"// POST to your webhook URL"}</div>
                    <div>{"{"}</div>
                    <div style={{ paddingLeft: 16 }}>{'"sweep_id": "sweep_20260409",'}</div>
                    <div style={{ paddingLeft: 16 }}>{'"timestamp": "2026-04-09T06:02:00Z",'}</div>
                    <div style={{ paddingLeft: 16 }}>{'"portfolio_avg_score": 74,'}</div>
                    <div style={{ paddingLeft: 16 }}>{'"clients_analyzed": 47,'}</div>
                    <div style={{ paddingLeft: 16 }}>{'"alerts": [{ "client_id": "...", "level": "critical" }],'}</div>
                    <div style={{ paddingLeft: 16 }}>{'"tasks": [{ "client_id": "...", "action": "..." }],'}</div>
                    <div style={{ paddingLeft: 16 }}>{'"priority_ranking": [{ "client_id": "...", "score": 91, "drift": 2 }],'}</div>
                    <div style={{ paddingLeft: 16 }}>{'"data_gaps": [{ "client_id": "...", "missing": ["billing"] }]'}</div>
                    <div>{"}"}</div>
                  </div>
                </div>

                {/* MCP Server */}
                <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 12, marginTop: 20 }}>MCP Server</div>
                <div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.border, padding: "16px" }}>
                  <p style={{ fontSize: 14, color: C.text, lineHeight: 1.5, marginBottom: 12 }}>Expose Retayned as a tool server for your AI agents. Any MCP-compatible agent can connect and call Retayned tools directly.</p>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "10px 14px", background: C.bg, borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted }}>Server URL</div>
                      <div style={{ fontSize: 12, fontFamily: "monospace", color: C.text, marginTop: 2 }}>https://mcp.retayned.com/v1/your-org-id</div>
                    </div>
                    <button style={{ background: "none", border: "none", fontSize: 12, color: C.primary, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Copy</button>
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Available Tools</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {[
                      { tool: "get_priority_ranking", desc: "Full client portfolio ranked by retention score" },
                      { tool: "get_client_risk_assessment", desc: "Single client signals, archetype, and Rai summary" },
                      { tool: "get_open_tasks", desc: "All pending tasks with priority and context" },
                      { tool: "complete_task", desc: "Mark a task as done" },
                      { tool: "trigger_sweep", desc: "Run an immediate portfolio analysis" },
                      { tool: "get_referral_readiness", desc: "Clients ranked by referral readiness" },
                      { tool: "get_sweep_history", desc: "Historical sweep results and trends" },
                    ].map((t, ti) => (
                      <div key={ti} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: C.bg, borderRadius: 6 }}>
                        <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: C.btn }}>{t.tool}</span>
                        <span style={{ fontSize: 12, color: C.textMuted, flex: 1 }}>{t.desc}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sign Out */}
            <button onClick={async () => { await supabase.auth.signOut(); }} style={{ width: "100%", padding: "14px", background: "transparent", border: "1.5px solid " + C.danger + "44", borderRadius: 10, fontSize: 14, fontWeight: 600, color: C.danger, cursor: "pointer", fontFamily: "inherit", marginBottom: 16 }}>Sign Out</button>

            <div style={{ background: C.raiGrad, borderRadius: 12, padding: "14px 16px", color: "#fff", marginTop: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "rgba(255,255,255,.4)", marginBottom: 6 }}>Coming Soon</div>
                    <p style={{ fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,.7)" }}>Your AI agents will be able to connect to Retayned the same way Rai connects to Slack and HubSpot. Retention intelligence as a tool, not just a dashboard.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CLIENT SLIDE-OVER */}
      {selectedClient && (() => {
        const sc = selectedClient;
        const dims = sc.profileScores || {};
        const dimLabels = { trust: ["Trust", "Micromanages everything", "Full delegation"], loyalty: ["Loyalty", "Actively shopping", "Locked in, not looking"], expectations: ["Expectations", "Unrealistic, impossible", "Reasonable, aligned"], grace: ["Grace", "Zero tolerance", "Gives benefit of the doubt"], commFrequency: ["Communication Frequency", "Radio silence", "Nonstop"], stressResponse: ["Stress Response", "Goes quiet internally", "Immediately escalates"], budgetCommitment: ["Budget Commitment", "Always under pressure", "Non-issue"], relationshipDepth: ["Relationship Depth", "Strictly transactional", "Genuine connection"], reportingNeed: ["Reporting Need", "Don't bother me", "Wants every detail"], replaceability: ["Replaceability", "Plug and play", "Deeply embedded"], commTone: ["Communication Tone", "Cold, passive-aggressive", "Warm, direct"], decisionMaking: ["Decision Making", "No authority, just a relay", "Full authority"] };
        return (
          <>
            <div onClick={() => setSelectedClient(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 90 }} />
            <div className="r-client-modal" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", maxWidth: 520, maxHeight: "90vh", background: C.card, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", zIndex: 100, overflowY: "scroll", borderRadius: 16 }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid " + C.borderLight, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: C.card, zIndex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>{sc.name}</h2>
                <button onClick={() => setSelectedClient(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.textMuted }}>×</button>
              </div>

              {/* Score + tabs */}
              <div style={{ textAlign: "center", padding: "16px 20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                {sc.ret ? <ScoreRing score={sc.ret} size={64} strokeWidth={4.5} /> : <div style={{ fontSize: 32, fontWeight: 900, color: C.textMuted }}>New</div>}
                <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 4 }}>{sc.ret ? "Retention Score" : "First health check pending"}</div>
                {sc.ret && <div style={{ fontSize: 13, fontWeight: 700, color: retColor(sc.ret), textTransform: "uppercase", letterSpacing: ".04em" }}>{sc.ret >= 80 ? "Thriving" : sc.ret >= 65 ? "Healthy" : sc.ret >= 45 ? "Watch" : sc.ret >= 30 ? "At Risk" : "Critical"}</div>}
                {sc.ret && <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {[
                    { label: "Revenue", value: "$" + (sc.revenue / 1000).toFixed(1) + "k/mo" },
                    { label: "Tenure", value: sc.months >= 12 ? (sc.months / 12).toFixed(1) + " yr" : sc.months + " mo" },
                    { label: "LCV", value: "$" + Math.round(getAdjustedLTV(sc) / 1000) + "k" },
                    { label: "Drift", value: (() => { const d = clientDrift[sc.name] || "Stable"; return d === "Something shifted" ? "Shifted" : d; })(), color: C.text },
                  ].map((s, si) => (
                    <div key={si} style={{ background: C.bg, borderRadius: 8, padding: "8px 14px" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: "0.03em", marginBottom: 1 }}>{s.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: s.color || C.text }}>{s.value}</div>
                    </div>
                  ))}
                </div>}
              </div>
              <div style={{ padding: "12px 20px 0" }}>
                <div style={{ display: "flex", gap: 0, background: C.surface, borderRadius: 10, padding: 3 }}>
                  {["Overview", "Profile", "Billing", "Timeline"].map(t => (
                    <button key={t} onClick={() => setClientTab(t.toLowerCase())} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: clientTab === t.toLowerCase() ? C.card : "transparent", color: clientTab === t.toLowerCase() ? C.text : C.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s ease, color 0.15s ease" }}>{t}</button>
                  ))}
                </div>
              </div>

              <div style={{ padding: "16px 20px" }}>
                {/* Overview */}
                {clientTab === "overview" && (
                  <div>
                    {!editingOverview ? (
                      <>
                        {[{ l: "Contact", v: sc.contact }, { l: "Role", v: sc.role }, { l: "Industry", v: sc.tag }, { l: "Together", v: sc.months + " months" }, { l: "Last Task", v: sc.lastContact }, { l: "Monthly Revenue", v: "$" + sc.revenue.toLocaleString() }, { l: "Lifetime Value", v: "$" + Math.round(getAdjustedLTV(sc)).toLocaleString() }, { l: "Health Check", v: sc.lastHC ? "Last: " + sc.lastHC : "Pending" }, { l: "Referrals", v: sc.referrals },
                          { l: "Late payments", v: sc.qualifyingFlags?.latePayments ? "Yes" : "No", flag: "latePayments" },
                          { l: "Prev. terminated", v: sc.qualifyingFlags?.prevTerminated ? "Yes" : "No", flag: "prevTerminated" },
                          { l: "Other vendors", v: sc.qualifyingFlags?.otherVendors ? "Yes" : "No", flag: "otherVendors" },
                          { l: "From referral", v: sc.qualifyingFlags?.fromReferral ? "Yes" : "No", flag: "fromReferral" },
                        ].map((d, i) => (
                          <div key={i} onClick={d.flag ? async () => {
                              const newFlags = { ...(sc.qualifyingFlags || {}), [d.flag]: !sc.qualifyingFlags?.[d.flag] };
                              const wasOn = !!sc.qualifyingFlags?.[d.flag];
                              const deltas = { latePayments: -4, prevTerminated: -8, otherVendors: -3, fromReferral: 2 };
                              const delta = deltas[d.flag] || 0;
                              const newRet = Math.max(1, Math.min(99, (sc.ret || 50) + (wasOn ? -delta : delta)));
                              setClients(prev => prev.map(c => c.id === sc.id ? { ...c, qualifyingFlags: newFlags, ret: newRet } : c));
                              setSelectedClient({ ...sc, qualifyingFlags: newFlags, ret: newRet });
                              clientsDb.update(sc.id, { qualifying_flags: newFlags, retention_score: newRet });
                            } : undefined}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid " + C.borderLight, cursor: d.flag ? "pointer" : "default" }}>
                            <span style={{ fontSize: 14, color: C.textMuted }}>{d.l}</span>
                            {d.flag ? (
                              <div style={{ width: 40, height: 22, borderRadius: 11, background: sc.qualifyingFlags?.[d.flag] ? C.primary : C.border, padding: 2, transition: "background 0.2s", display: "flex", alignItems: "center" }}>
                                <div style={{ width: 18, height: 18, borderRadius: 9, background: "#fff", transform: sc.qualifyingFlags?.[d.flag] ? "translateX(18px)" : "translateX(0)", transition: "transform 0.2s" }} />
                              </div>
                            ) : (
                              <span style={{ fontSize: 14, fontWeight: 600, color: d.c || C.text }}>{d.v}</span>
                            )}
                          </div>
                        ))}
                        <button onClick={() => { setEditingOverview(true); setOverviewEditData({ contact: sc.contact, role: sc.role, tag: sc.tag, months: sc.months, revenue: sc.revenue }); }} style={{ width: "100%", padding: "10px", background: "transparent", color: C.primary, border: "1px solid " + C.primary + "44", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 12 }}>Edit Details</button>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Edit Client Details</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {[{ key: "contact", label: "Contact name" }, { key: "role", label: "Role" }, { key: "tag", label: "Industry" }].map(f => (
                            <div key={f.key}>
                              <label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>{f.label}</label>
                              <input value={overviewEditData[f.key] || ""} onChange={e => setOverviewEditData({ ...overviewEditData, [f.key]: e.target.value })} style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                            </div>
                          ))}
                          <div>
                            <label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Months together</label>
                            <input type="number" value={overviewEditData.months || 0} onChange={e => setOverviewEditData({ ...overviewEditData, months: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Estimated monthly revenue ($)</label>
                            <input type="number" value={overviewEditData.revenue || 0} onChange={e => setOverviewEditData({ ...overviewEditData, revenue: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                          <button onClick={() => setEditingOverview(false)} style={{ padding: "10px 16px", background: C.surface, color: C.textSec, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                          <button onClick={async () => {
                            const updated = { ...sc, contact: overviewEditData.contact, role: overviewEditData.role, tag: overviewEditData.tag, months: overviewEditData.months, revenue: overviewEditData.revenue };
                            setClients(prev => prev.map(c => c.id === sc.id ? updated : c));
                            setSelectedClient(updated);
                            setEditingOverview(false);
                            clientsDb.update(sc.id, { contact: overviewEditData.contact, role: overviewEditData.role, tag: overviewEditData.tag, months: overviewEditData.months, revenue: overviewEditData.revenue });
                          }} style={{ flex: 1, padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
                        </div>
                      </>
                    )}
                    <div style={{ background: C.raiGrad, borderRadius: 14, padding: "18px", color: "#fff", marginTop: 16, boxShadow: "0 4px 24px rgba(30,38,31,0.25)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><Icon name="spark" size={14} color="rgba(255,255,255,0.6)" /><span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.5)" }}>Rai</span></div>
                      <p style={{ fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,.65)" }}>
                        {sc.ret >= 90 ? `${sc.name} — this relationship is strong. Keep showing up the way you have been. Great work!`
                        : sc.ret >= 80 ? `${sc.name} — healthy. Nothing urgent that stands out, but don't coast — momentum is easier to keep than rebuild.`
                        : sc.ret >= 70 ? `${sc.name} — nothing alarming, but worth considering what you can do slightly differently to improve this engagement.`
                        : sc.ret >= 60 ? `${sc.name} — something is off. Think through what's changed and how you can address any new variables.`
                        : sc.ret >= 50 ? `${sc.name} — there's a pattern forming. Multiple signals suggest this isn't a one-off rough patch. Have an honest conversation soon.`
                        : sc.ret >= 40 ? `${sc.name} — several things need attention and they're compounding. The longer you wait, the harder each one gets to fix.`
                        : sc.ret >= 30 ? `${sc.name} — this relationship has serious, overlapping problems. Build a retention gameplan today. Not this week — today.`
                        : sc.ret >= 20 ? `${sc.name} — deep fractures on multiple fronts. If there's a path back, it requires a direct, honest conversation immediately.`
                        : sc.ret ? `${sc.name} — there's no way to sugarcoat this one. Is a last effort worth it, or is it time for the Rolodex?`
                        : `${sc.name} is new. Complete the first health check to start building the retention picture.`}
                      </p>
                      <button className="r-btn" onClick={() => { setSelectedClient(null); setPage("coach"); setAiMessages([{ role: "ai", text: coachOpeners[sc.name] || `Let's talk about ${sc.name}.` }]); }} style={{ width: "100%", marginTop: 10, padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Talk to Rai</button>
                    </div>
                {/* Remove client */}
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                  {!rolodexConfirm && !removeConfirm ? (
                    <>
                      <button onClick={() => { setRolodexConfirm(true); setRemoveConfirm(false); }} style={{ width: "100%", padding: "10px", background: "transparent", color: C.primary, border: "1px solid " + C.primary + "44", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Move to Rolodex</button>
                      <button onClick={() => { setRemoveConfirm(true); setRolodexConfirm(false); }} style={{ width: "100%", padding: "10px", background: "transparent", color: C.danger, border: "1px solid " + C.danger + "44", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Remove Permanently</button>
                    </>
                  ) : rolodexConfirm ? (
                    <div style={{ background: C.primarySoft, borderRadius: 12, padding: "16px", border: "1px solid " + C.primary + "33" }}>
                      <p style={{ fontSize: 14, color: C.text, lineHeight: 1.55, marginBottom: 14 }}>This client will be moved to your Rolodex for future tracking. Relationships change — this keeps the door open.</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="r-btn" onClick={() => { setRolodex(prev => [...prev, { id: Date.now(), client: sc.name, contact: sc.contact, months: sc.months, type: "former", date: "Mar 2026", tags: [], priority: null }]); setClients(clients.filter(c => c.id !== sc.id));
                          clientsDb.deactivate(sc.id); setSelectedClient(null); setRolodexConfirm(false); setPage("retros"); }} style={{ flex: 1, padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Move to Rolodex</button>
                        <button onClick={() => setRolodexConfirm(false)} style={{ padding: "10px 14px", background: C.surface, color: C.textMuted, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: C.bg, borderRadius: 12, padding: "16px", border: "1px solid " + C.border }}>
                      <p style={{ fontSize: 14, color: C.text, lineHeight: 1.55, marginBottom: 14 }}>This will permanently remove them from your account — no Rolodex entry, no reminders, no history.</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { setClients(clients.filter(c => c.id !== sc.id));
                          clientsDb.deactivate(sc.id); setSelectedClient(null); setRemoveConfirm(false); }} style={{ flex: 1, padding: "10px", background: C.surface, color: C.textSec, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Remove Permanently</button>
                        <button className="r-btn" onClick={() => setRemoveConfirm(false)} style={{ padding: "10px 14px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
                  </div>
                )}

                {/* Profile — 12 dimensions */}
                {clientTab === "profile" && (
                  <div>
                    {!editingProfile ? (
                      <div>
                        {Object.keys(dims).length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {Object.entries(dims).map(([key, val]) => {
                              const labels = dimLabels[key] || [key, "Low", "High"];
                              return (
                                <div key={key} style={{ background: C.bg, borderRadius: 8, padding: "10px 12px" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{labels[0]}</span>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>{val}</span>
                                  </div>
                                  <div style={{ height: 4, background: C.borderLight, borderRadius: 2, marginBottom: 4 }}>
                                    <div style={{ height: "100%", width: `${val * 10}%`, background: C.primary, borderRadius: 2 }} />
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted }}>
                                    <span>{labels[1]}</span><span>{labels[2]}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ textAlign: "center", padding: "20px 0", color: C.textMuted, fontSize: 14 }}>
                            No profile set yet. Build one to help Rai understand this client.
                          </div>
                        )}
                        <button className="r-btn" onClick={() => { setEditScores({ ...dims }); setEditingProfile(true); }} style={{ width: "100%", padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 12 }}>
                          {Object.keys(dims).length > 0 ? "Edit Profile" : "Build Profile"}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Edit Relationship Profile</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {profileDimensions.map(d => {
                            const val = editScores[d.key] !== undefined ? editScores[d.key] : 5;
                            const labels = dimLabels[d.key] || [d.name, "Low", "High"];
                            return (
                              <div key={d.key}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                                  <span style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</span>
                                  <span style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>{val}</span>
                                </div>
                                <input type="range" min="0" max="10" value={val} onChange={e => setEditScores({ ...editScores, [d.key]: parseInt(e.target.value) })} style={{ width: "100%", height: 6, appearance: "none", WebkitAppearance: "none", background: `linear-gradient(to right, ${C.border} 0%, ${C.primary} 100%)`, borderRadius: 3, outline: "none", cursor: "pointer" }} />
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted }}>
                                  <span>{labels[1]}</span><span>{labels[2]}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                          <button onClick={() => setEditingProfile(false)} style={{ padding: "10px 16px", background: C.surface, color: C.textSec, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                          <button onClick={async () => {
                            const newRet = calcRetentionScore(editScores, null, sc.qualifyingFlags || {}, sc.months || 0);
                            const updated = clients.map(c => c.id === sc.id ? { ...c, profileScores: { ...editScores }, ret: newRet || c.ret } : c);
                            setClients(updated);
                            setSelectedClient({ ...sc, profileScores: { ...editScores }, ret: newRet || sc.ret });
                            setEditingProfile(false);
                            clientsDb.updateScores(sc.id, newRet || sc.ret, { ...editScores });
                          }} style={{ flex: 1, padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save Profile</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}




                {/* Billing */}
                {clientTab === "billing" && (() => {
                  const billing = clientBilling[sc.id] || { items: [] };
                  const now = new Date();
                  const currentMonth = now.toLocaleString("default", { month: "long", year: "numeric" });
                  const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                  const nextMonth = nextDate.toLocaleString("default", { month: "long", year: "numeric" });
                  const activeMonths = [currentMonth, nextMonth];

                  const getMonthItems = (month) => billing.items.filter(i => i.month === month);
                  const getMonthTotal = (month) => getMonthItems(month).reduce((a, i) => a + i.amount, 0);
                  const pastMonths = [...new Set(billing.items.map(i => i.month))].filter(m => !activeMonths.includes(m));

                  const addItem = (month) => {
                    if (!billingNewItem.description.trim() || !billingNewItem.amount) return;
                    const prev = clientBilling[sc.id] || { items: [] };
                    const item = { id: Date.now(), description: billingNewItem.description.trim(), amount: parseFloat(billingNewItem.amount) || 0, recurring: billingNewItem.recurring, month };
                    const newItems = [...prev.items, item];
                    if (billingNewItem.recurring) {
                      const otherMonth = month === currentMonth ? nextMonth : currentMonth;
                      const alreadyExists = prev.items.some(i => i.description === item.description && i.month === otherMonth);
                      if (!alreadyExists) {
                        newItems.push({ ...item, id: Date.now() + 1, month: otherMonth });
                      }
                    }
                    setClientBilling({ ...clientBilling, [sc.id]: { ...prev, items: newItems } });
                    setBillingNewItem({ description: "", amount: "", recurring: false });
                    setBillingAddOpen(false);
                  };

                  const removeItem = (itemId) => {
                    const prev = clientBilling[sc.id] || { items: [] };
                    setClientBilling({ ...clientBilling, [sc.id]: { ...prev, items: prev.items.filter(i => i.id !== itemId) } });
                  };

                  const toggleRecurring = (itemId) => {
                    const prev = clientBilling[sc.id] || { items: [] };
                    setClientBilling({ ...clientBilling, [sc.id]: { ...prev, items: prev.items.map(i => i.id === itemId ? { ...i, recurring: !i.recurring } : i) } });
                  };

                  const renderMonth = (month, isNext) => {
                    const items = getMonthItems(month);
                    const total = getMonthTotal(month);
                    const isAdding = billingAddOpen === month;
                    return (
                      <div key={month} style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>{month}</div>
                            {isNext && <div style={{ fontSize: 12, color: C.textMuted }}>Forward billing</div>}
                          </div>
                          {items.length > 0 && <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>${total.toLocaleString()}</div>}
                        </div>

                        {items.map(item => (
                          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: "1px solid " + C.borderLight }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{item.description}</span>
                                {item.recurring && <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 3, background: C.primarySoft, color: C.primary, fontWeight: 600 }}>↻ Recurring</span>}
                              </div>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, marginRight: 4 }}>${item.amount.toLocaleString()}</span>
                            <button onClick={() => toggleRecurring(item.id)} style={{ background: "none", border: "none", fontSize: 12, color: item.recurring ? C.primary : C.borderLight, cursor: "pointer", padding: "2px" }}>↻</button>
                            <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", fontSize: 14, color: C.borderLight, cursor: "pointer", padding: "0 2px" }}>×</button>
                          </div>
                        ))}

                        {items.length === 0 && !isAdding && (
                          <div style={{ padding: "12px 0", fontSize: 14, color: C.textMuted }}>No items yet.</div>
                        )}

                        {isAdding ? (
                          <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 8 }}>
                            <input value={billingNewItem.description} onChange={e => setBillingNewItem({ ...billingNewItem, description: e.target.value })} placeholder="Description (e.g. Retainer, Creative refresh)" style={{ padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                            <input type="number" value={billingNewItem.amount} onChange={e => setBillingNewItem({ ...billingNewItem, amount: e.target.value })} placeholder="Amount ($)" style={{ padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                            <div onClick={() => setBillingNewItem({ ...billingNewItem, recurring: !billingNewItem.recurring })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", cursor: "pointer" }}>
                              <div style={{ width: 18, height: 18, borderRadius: 4, border: billingNewItem.recurring ? "none" : "1.5px solid " + C.border, background: billingNewItem.recurring ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {billingNewItem.recurring && <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>}
                              </div>
                              <span style={{ fontSize: 14, color: C.textSec }}>Make recurring (auto-adds each month)</span>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button className="r-btn" onClick={() => addItem(month)} style={{ flex: 1, padding: "10px", background: billingNewItem.description.trim() && billingNewItem.amount ? C.btn : C.surface, color: billingNewItem.description.trim() && billingNewItem.amount ? "#fff" : C.textMuted, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add</button>
                              <button onClick={() => { setBillingAddOpen(false); setBillingNewItem({ description: "", amount: "", recurring: false }); }} style={{ padding: "10px 14px", background: C.surface, color: C.textMuted, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setBillingAddOpen(month)} style={{ width: "100%", padding: "10px", background: "transparent", color: C.primary, border: "1px dashed " + C.border, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 6 }}>+ Add line item</button>
                        )}

                        {items.length > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", marginTop: 8, borderTop: "2px solid " + C.border }}>
                            <span style={{ fontSize: 14, fontWeight: 800 }}>Total</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: C.primary }}>${total.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    );
                  };

                  return (
                    <div>
                      {renderMonth(nextMonth, true)}
                      <div style={{ height: 1, background: C.border, margin: "4px 0 20px" }} />
                      {renderMonth(currentMonth, false)}

                      {pastMonths.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8, paddingTop: 12, borderTop: "1px solid " + C.borderLight }}>Previous months</div>
                          {pastMonths.map((month, mi) => {
                            const items = getMonthItems(month);
                            const total = getMonthTotal(month);
                            return (
                              <div key={mi} style={{ background: C.bg, borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: items.length > 0 ? 4 : 0 }}>
                                  <span style={{ fontSize: 14, fontWeight: 600 }}>{month}</span>
                                  <span style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>${total.toLocaleString()}</span>
                                </div>
                                {items.length > 0 && (
                                  <div style={{ fontSize: 12, color: C.textMuted }}>
                                    {items.map(i => i.description).join(", ")}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Timeline */}
                {clientTab === "timeline" && (
                  <div>
                    {[
                      { date: "Mar 27", label: "Daily check-in logged", type: "note" },
                      { date: "Mar 24", label: "Weekly report submitted", type: "report" },
                      { date: "Mar 20", label: sc.lastHC ? "Health check completed" : "Client onboarded", type: "health" },
                      { date: "Mar 15", label: "Performance report delivered", type: "report" },
                      { date: "Mar 10", label: "Bi-weekly call — good energy", type: "note" },
                    ].map((e, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: e.type === "health" ? C.success : e.type === "report" ? C.btn : C.primaryLight, marginTop: 5, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{e.label}</div>
                          <div style={{ fontSize: 12, color: C.textMuted }}>{e.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </>
        );
      })()}


      {/* ROLODEX SLIDE-OVER */}
      {selectedRolodex && (() => {
        const sr = selectedRolodex;
        const answers = retroAnswers[sr.id] || {};
        const ed = rolodexEditData;
        const priorityOpts = [
          { id: "high", label: "High priority", color: C.success },
          { id: "medium", label: "Medium priority", color: C.warning },
          { id: "low", label: "Low priority", color: C.textMuted },
        ];
        return (
          <>
            <div onClick={() => setSelectedRolodex(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 90 }} />
            <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: 420, background: C.card, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)", zIndex: 100, overflowY: "scroll" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid " + C.borderLight, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: C.card, zIndex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>{sr.client}</h2>
                <button onClick={() => setSelectedRolodex(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.textMuted }}>×</button>
              </div>
              <div style={{ textAlign: "center", padding: "16px 20px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 4 }}>📇</div>
                <span style={{ fontSize: 14, padding: "4px 12px", borderRadius: 4, background: sr.type === "oneoff" ? C.surface : C.primarySoft, color: sr.type === "oneoff" ? C.textSec : C.primary, fontWeight: 600 }}>{sr.type === "oneoff" ? "One-off" : "Former Client"}</span>
              </div>
              <div style={{ padding: "16px 20px" }}>
                {!rolodexEditing ? (
                  <>
                    {[
                      { l: "Contact", v: sr.contact },
                      { l: "Together", v: sr.months > 0 ? sr.months + " months" : "One-time" },
                      { l: "Added", v: sr.date },
                      { l: "Priority", v: sr.priority ? (sr.priority === "high" ? "High" : sr.priority === "medium" ? "Medium" : "Low") : "Not set" },
                      { l: "Reminder", v: sr.reminder ? new Date(sr.reminder).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "None set" },
                    ].map((d, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid " + C.borderLight }}>
                        <span style={{ fontSize: 14, color: C.textMuted }}>{d.l}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: d.l === "Reminder" && sr.reminder ? C.primary : C.text }}>{d.v}</span>
                      </div>
                    ))}
                    {sr.notes && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }}>Notes</div>
                        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.5, background: C.bg, borderRadius: 8, padding: "10px 12px" }}>{sr.notes}</div>
                      </div>
                    )}
                    {(answers.what || answers.work) && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>History</div>
                        {[
                          { l: "What happened", v: answers.what },
                          { l: "What you did", v: answers.work },
                          { l: "How it ended", v: answers.terms },
                          { l: "Would come back", v: answers.comeback },
                          { l: "Would refer", v: answers.refer },
                        ].filter(d => d.v).map((d, i) => (
                          <div key={i} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 2 }}>{d.l}</div>
                            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.4 }}>{d.v}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {sr.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 14 }}>
                        {sr.tags.map((t, j) => <span key={j} style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, background: t.includes("Would refer") || t.includes("Good terms") || t.includes("Would come back") ? C.primarySoft : C.surface, color: t.includes("Would refer") || t.includes("Good terms") || t.includes("Would come back") ? C.primary : C.textSec, fontWeight: 600 }}>{t}</span>)}
                      </div>
                    )}
                    {!showReminderPicker ? (
                      <button onClick={() => { setShowReminderPicker(true); setReminderDate(sr.reminder || ""); }} className="r-btn" style={{ width: "100%", padding: sr.reminder ? "12px" : "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 16, textAlign: sr.reminder ? "left" : "center" }}>
                        {sr.reminder ? (
                          <div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 2 }}>⏰ Reminder set</div>
                            <div>{new Date(sr.reminder).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
                          </div>
                        ) : "⏰ Set Check-in Reminder"}
                      </button>
                    ) : (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>When should Rai remind you?</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                          {[
                            { label: "2 weeks", days: 14 },
                            { label: "1 month", days: 30 },
                            { label: "3 months", days: 90 },
                            { label: "6 months", days: 180 },
                          ].map(q => {
                            const target = new Date(Date.now() + q.days * 24 * 60 * 60 * 1000);
                            const dow = target.getDay();
                            const diff = dow === 0 ? 1 : dow === 1 ? 0 : 8 - dow;
                            const monday = new Date(target.getTime() + diff * 24 * 60 * 60 * 1000);
                            const d = monday.toISOString().split("T")[0];
                            const sel = reminderDate === d;
                            return (
                              <button key={q.label} onClick={() => setReminderDate(d)} style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: "1.5px solid " + (sel ? C.primary : C.border), background: sel ? C.primarySoft : C.bg, color: sel ? C.primary : C.text, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{q.label}</button>
                            );
                          })}
                        </div>
                        {reminderDate && <div style={{ fontSize: 14, color: C.primary, fontWeight: 600, marginBottom: 12 }}>Monday, {new Date(reminderDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>}
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="r-btn" onClick={() => {
                            if (reminderDate) { setRolodex(prev => prev.map(x => x.id === sr.id ? { ...x, reminder: reminderDate } : x)); setSelectedRolodex({ ...sr, reminder: reminderDate }); }
                            setShowReminderPicker(false);
                          }} style={{ flex: 1, padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
                          {sr.reminder && <button onClick={() => { setRolodex(prev => prev.map(x => x.id === sr.id ? { ...x, reminder: null } : x)); setSelectedRolodex({ ...sr, reminder: null }); setReminderDate(""); setShowReminderPicker(false); }} style={{ padding: "10px 14px", background: "transparent", color: C.danger, border: "1px solid " + C.danger + "44", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Remove</button>}
                          <button onClick={() => setShowReminderPicker(false)} style={{ padding: "10px 14px", background: C.surface, color: C.text, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                        </div>
                      </div>
                    )}
                    <button onClick={() => { setRolodexEditing(true); setRolodexEditData({ contact: sr.contact, months: sr.months, priority: sr.priority || "", notes: sr.notes || "", what: answers.what || "", work: answers.work || "", terms: answers.terms || "", comeback: answers.comeback || "", refer: answers.refer || "" }); }} style={{ width: "100%", padding: "10px", background: "transparent", color: C.primary, border: "1px solid " + C.primary + "44", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 10 }}>Edit Details</button>
                    <div style={{ marginTop: 10 }}>
                      {!rolodexRemoveConfirm ? (
                        <button onClick={() => setRolodexRemoveConfirm(true)} style={{ width: "100%", padding: "10px", background: "transparent", color: C.danger, border: "1px solid " + C.danger + "44", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Remove from Rolodex</button>
                      ) : (
                        <div style={{ background: C.bg, borderRadius: 12, padding: "16px", border: "1px solid " + C.border }}>
                          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.55, marginBottom: 14 }}>This will remove {sr.client} from your Rolodex. No more check-in reminders, no more tracking. You can always add them back later.</p>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => { setRolodex(prev => prev.filter(x => x.id !== sr.id)); rolodexDb.delete(sr.id); setSelectedRolodex(null); setRolodexRemoveConfirm(false); }} style={{ flex: 1, padding: "10px", background: C.surface, color: C.textSec, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
                            <button className="r-btn" onClick={() => setRolodexRemoveConfirm(false)} style={{ padding: "10px 14px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Edit Details</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Contact name</label>
                        <input value={ed.contact} onChange={e => setRolodexEditData({...ed, contact: e.target.value})} style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Months together</label>
                        <input type="number" value={ed.months} onChange={e => setRolodexEditData({...ed, months: parseInt(e.target.value) || 0})} style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Priority</label>
                        <div style={{ display: "flex", gap: 6 }}>
                          {priorityOpts.map(opt => (
                            <button key={opt.id} onClick={() => setRolodexEditData({...ed, priority: opt.id})} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "1.5px solid " + (ed.priority === opt.id ? opt.color : C.borderLight), background: ed.priority === opt.id ? opt.color + "18" : C.bg, color: ed.priority === opt.id ? opt.color : C.textSec, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{opt.label.replace(" priority", "")}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Notes</label>
                        <textarea value={ed.notes} onChange={e => setRolodexEditData({...ed, notes: e.target.value})} placeholder="Log a check-in, add context, anything worth remembering..." style={{ width: "100%", padding: "10px 12px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg, minHeight: 80, resize: "vertical" }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>History</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {sr.type === "former" ? (
                        <>
                          <div><label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>What happened?</label><textarea value={ed.what} onChange={e => setRolodexEditData({...ed, what: e.target.value})} placeholder="Contract ended, budget cut, went in-house..." style={{ width: "100%", padding: "10px 12px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg, minHeight: 60, resize: "vertical" }} /></div>
                          <div><label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>How did it end?</label><textarea value={ed.terms} onChange={e => setRolodexEditData({...ed, terms: e.target.value})} placeholder="Good terms, neutral, rough..." style={{ width: "100%", padding: "10px 12px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg, minHeight: 60, resize: "vertical" }} /></div>
                          <div><label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Would they come back?</label><textarea value={ed.comeback} onChange={e => setRolodexEditData({...ed, comeback: e.target.value})} placeholder="Yes, maybe, no..." style={{ width: "100%", padding: "10px 12px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg, minHeight: 60, resize: "vertical" }} /></div>
                        </>
                      ) : (
                        <div><label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>What did you do for them?</label><textarea value={ed.work} onChange={e => setRolodexEditData({...ed, work: e.target.value})} placeholder="Site audit, consulting session..." style={{ width: "100%", padding: "10px 12px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg, minHeight: 60, resize: "vertical" }} /></div>
                      )}
                      <div><label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Would they refer you?</label><textarea value={ed.refer} onChange={e => setRolodexEditData({...ed, refer: e.target.value})} placeholder="Even if they left, would they recommend you?" style={{ width: "100%", padding: "10px 12px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg, minHeight: 60, resize: "vertical" }} /></div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                      <button onClick={() => setRolodexEditing(false)} style={{ padding: "10px 16px", background: C.surface, color: C.textSec, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                      <button onClick={() => {
                        const tags = [];
                        if ((ed.terms || "").toLowerCase().includes("good")) tags.push("Good terms");
                        if ((ed.refer || "").toLowerCase().includes("yes")) tags.push("Would refer");
                        if ((ed.comeback || "").toLowerCase().includes("yes")) tags.push("Would come back");
                        if (sr.type === "oneoff") tags.push("One-off");
                        const updated = { ...sr, contact: ed.contact, months: ed.months, priority: ed.priority, notes: ed.notes, tags };
                        setRolodex(prev => prev.map(x => x.id === sr.id ? updated : x));
                        setRetroAnswers(prev => ({ ...prev, [sr.id]: { ...prev[sr.id], what: ed.what, work: ed.work, terms: ed.terms, comeback: ed.comeback, refer: ed.refer } }));
                        setSelectedRolodex(updated);
                        setRolodexEditing(false);
                      }} style={{ flex: 1, padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        );
      })()}


      {/* REFERRAL SLIDE-OVER */}
      {refEditing !== null && (() => {
        const r = refs.find((x, i) => (x.id || i) === refEditing);
        if (!r) return null;
        const isActive = r.status === "converted" || (r.converted && r.status !== "closed");
        return (
          <>
            <div onClick={() => setRefEditing(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 90 }} />
            <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: 420, background: C.card, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)", zIndex: 100, overflowY: "scroll" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid " + C.borderLight, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: C.card, zIndex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>{refEditData.to || r.to}</h2>
                <button onClick={() => setRefEditing(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.textMuted }}>×</button>
              </div>

              <div style={{ padding: "20px" }}>
                {/* Status badge */}
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 14, padding: "6px 16px", borderRadius: 6, fontWeight: 600, background: isActive ? "#E2F3EB" : "#FAE8E4", color: isActive ? C.success : C.danger }}>{isActive ? "Active" : "Closed"}</span>
                </div>

                {/* Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Referred person or company</label>
                    <input value={refEditData.to || ""} onChange={e => setRefEditData({...refEditData, to: e.target.value})} style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Referred by</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {[...clients].sort((a, b) => b.ret - a.ret).map(c => (
                        <span key={c.id} onClick={() => setRefEditData({...refEditData, from: c.name})} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, background: refEditData.from === c.name ? C.primarySoft : C.bg, border: "1.5px solid " + (refEditData.from === c.name ? C.primary : C.borderLight), cursor: "pointer", fontWeight: refEditData.from === c.name ? 600 : 500, color: refEditData.from === c.name ? C.primary : C.textSec }}>{c.name}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Status</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[{ id: "converted", label: "Active" }, { id: "closed", label: "Closed" }].map(s => {
                        const sel = (refEditData.status || (refEditData.converted ? "converted" : "lost")) === s.id;
                        const isRed = s.id === "closed";
                        return (
                          <button key={s.id} onClick={() => setRefEditData({...refEditData, status: s.id, converted: s.id === "converted" || s.id === "closed"})} style={{ padding: "8px 18px", borderRadius: 8, border: "1.5px solid " + (sel ? (isRed ? C.danger : C.primary) : C.borderLight), background: sel ? (isRed ? "#FAE8E4" : C.primarySoft) : C.bg, color: sel ? (isRed ? C.danger : C.primary) : C.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{s.label}</button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Average monthly revenue ($)</label>
                    <input type="number" value={refEditData.revenue || ""} onChange={e => setRefEditData({...refEditData, revenue: e.target.value})} placeholder="0" style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                  </div>
                  {(refEditData.status === "closed") && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Total revenue earned ($)</label>
                      <input type="number" value={refEditData.totalRevenue || ""} onChange={e => setRefEditData({...refEditData, totalRevenue: e.target.value})} placeholder="0" style={{ width: "100%", padding: "12px 16px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: C.bg }} />
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                  <button onClick={() => setRefEditing(null)} style={{ padding: "10px 16px", background: C.surface, color: C.textSec, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                  <button className="r-btn" onClick={() => {
                    setRefs(prev => prev.map((x, idx) => (x.id || idx) === refEditing ? { ...x, to: refEditData.to, from: refEditData.from, status: refEditData.status, converted: refEditData.status === "converted" || refEditData.status === "closed", revenue: parseInt(refEditData.revenue) || 0, totalRevenue: parseInt(refEditData.totalRevenue) || 0 } : x));
                    // Persist
                    referralsDb.update(refEditing, {
                      referred_to: refEditData.to,
                      referred_by: refEditData.from,
                      status: refEditData.status,
                      revenue: parseInt(refEditData.revenue) || 0,
                      total_revenue: parseInt(refEditData.totalRevenue) || 0,
                    });
                    setRefEditing(null);
                  }} style={{ flex: 1, padding: "10px", background: C.btn, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
                </div>

                <button onClick={() => { setRefs(prev => prev.filter((x, idx) => (x.id || idx) !== refEditing)); referralsDb.delete(refEditing); setRefEditing(null); }} style={{ width: "100%", padding: "10px", background: "transparent", color: C.danger, border: "1px solid " + C.danger + "44", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 12 }}>Delete Referral</button>
              </div>
            </div>
          </>
        );
      })()}


      {/* MOBILE BOTTOM NAV */}
      <div className="r-mob-bot" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.card, borderTop: "1px solid " + C.borderLight, justifyContent: "space-around", padding: "8px 0 12px", zIndex: 40 }}>
        {(tier === "enterprise" ? mobileNavEnterprise : mobileNavCore).map(n => {
          const dot = hasDot(n.id);
          return (
            <div key={n.id} onClick={() => n.id === "more" ? setShowMore(!showMore) : goTo(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, cursor: "pointer", padding: "4px 10px", position: "relative" }}>
              <Icon name={n.icon} size={22} color={(page === n.id || (n.id === "more" && showMore)) ? C.primary : C.textMuted} />
              <span style={{ fontSize: 10, fontWeight: 700, color: (page === n.id || (n.id === "more" && showMore)) ? C.primary : C.textMuted }}>{n.label}</span>
              {dot && <div style={{ position: "absolute", top: 2, right: 6, width: 7, height: 7, borderRadius: "50%", background: C.danger }} />}
            </div>
          );
        })}
      </div>
      {showMore && (
        <>
          <div onClick={() => setShowMore(false)} style={{ position: "fixed", inset: 0, zIndex: 45 }} />
          <div style={{ position: "fixed", bottom: 64, right: 12, background: C.card, borderRadius: "12px 12px 12px 12px", border: "1px solid " + C.border, boxShadow: "0 -4px 24px rgba(0,0,0,0.08)", zIndex: 46, overflow: "hidden", minWidth: 180, animation: "fadeIn 0.15s ease" }}>
            {(tier === "enterprise" ? moreItemsEnterprise : moreItemsCore).map((m, i, arr) => (
              <div key={m.id} onClick={() => goTo(m.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid " + C.borderLight, background: page === m.id ? C.primarySoft : "transparent" }}>
                <span style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={m.icon} size={18} color={page === m.id ? C.primary : C.textMuted} /></span><span style={{ fontSize: 13, fontWeight: page === m.id ? 700 : 500, color: page === m.id ? C.primary : C.text, flex: 1 }}>{m.label}</span>
                {hasDot(m.id) && <Dot />}
              </div>
            ))}
            <div onClick={() => { setTier(tier === "core" ? "enterprise" : "core"); setShowMore(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", cursor: "pointer" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted }}>{tier === "enterprise" ? "Enterprise" : "Core"}</span>
              <div style={{ width: 36, height: 20, borderRadius: 10, background: tier === "enterprise" ? C.btn : C.borderLight, position: "relative", transition: "background 0.2s" }}>
                <div style={{ width: 16, height: 16, borderRadius: 8, background: "#fff", position: "absolute", top: 2, left: tier === "enterprise" ? 18 : 2, transition: "left 0.2s" }} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
