import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabase";
import { clients as clientsDb, tasks as tasksDb, healthChecks as hcDb, rolodex as rolodexDb,
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
today: (<><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill="none"/><ci
clients: (<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth=
health: (<><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={color} strokeWidth="1.8" fill="non
rai: (<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color}
rolodex: (<><rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="1
referrals: (<><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke={color} strokeWidt
settings: (<><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" fill="none"/>
sweeps: (<><path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinec
target: (<><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" fill="none"/><
spark: (<><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" stroke={colo
send: (<><line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth="2" strokeLineca
more: (<><circle cx="12" cy="5" r="1.5" fill={color}/><circle cx="12" cy="12" r="1.5" fil
chevron: (<><polyline points="9 18 15 12 9 6" stroke={color} strokeWidth="2" fill="none"
bento: (<><rect x="3" y="3" width="7" height="7" rx="1.5" fill={color}/><rect x="14" y="3
plus: (<><line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLineca
};
return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w
};
const ScoreRing = ({ score, size = 44, strokeWidth = 3.5 }) => {
const r = (size - strokeWidth) / 2;
const circ = 2 * Math.PI * r;
const offset = circ - (score / 100) * circ;
const color = retColor(score);
return (
<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}
<circle cx={size/2} cy={size/2} r={r} stroke={C.borderLight} strokeWidth={strokeWidth}
<circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={strokeWidth} fill="no
<text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" style={{ fon
</svg>
);
};
const clientsBase = [
{ id: 1, name: "Northvane Studios", ret: 91, contact: "Sarah Chen", role: "Head of Marketin
{ id: 2, name: "Oakline Outdoors", ret: 82, contact: "James Park", role: "CMO", months: 18,
{ id: 3, name: "Ridgeline Supply", ret: 73, contact: "Marcus Webb", role: "Founder & CEO",
{ id: 4, name: "Broadleaf Media", ret: 67, contact: "Rachel Torres", role: "VP Marketing",
{ id: 5, name: "Copper & Sage", ret: 55, contact: "Elena Moss", role: "Marketing Director",
{ id: 6, name: "Velvet & Co", ret: 44, contact: "Priya Sharma", role: "Brand Manager", mont
{ id: 7, name: "Foxglove Partners", ret: 38, contact: "Tom Aldrich", role: "Director of Ops
{ id: 8, name: "Evergreen Games", ret: 18, contact: "Derek Holt", role: "VP of Growth", mon
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
{ from: "Northvane Studios", to: "Pinehill Collective", date: "Feb 15", converted: true, re
{ from: "Northvane Studios", to: "Driftwood Creative", date: "Nov 10", converted: true, rev
{ from: "Oakline Outdoors", to: "Summit Gear Co", date: "Mar 20", converted: false, revenue
];
// Enterprise Data
const enterpriseClients = clientsBase.map(c => ({
...c,
enterprise: {
automated_scores: {
loyaltySignal: Math.round(c.ret * 0.08 + Math.random() * 2),
trustLevel: Math.round(c.ret * 0.07 + Math.random() * 2),
commFreq: c.velocity === "fast" ? 7 : c.velocity === "normal" ? 5 : c.velocity === "slo
stressResponse: 5 + Math.round((Math.random() - 0.5) * 4),
expectLevel: 5 + Math.round((Math.random() - 0.5) * 4),
reportNeed: Math.round(3 + Math.random() * 4),
relationDepth: Math.round(c.months > 12 ? 7 + Math.random() * 2 : 4 + Math.random() * 3
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
archetype: c.ret >= 80 ? null : c.ret >= 60 ? (c.velocity === "slowing" ? "slow_fade" : n
retention_outlook: c.ret >= 80 ? "long_term" : c.ret >= 65 ? "strong" : c.ret >= 50 ? "un
active_signals: [],
rai_summary: "",
score_history: Array.from({length: 7}, (_, i) => ({ date: `Apr ${9-i}`, score: c.ret + Ma
last_sweep: "2026-04-09T06:02:00Z",
}
}));
// Add signals and summaries
enterpriseClients.forEach(c => {
const e = c.enterprise;
e.drift = e.baseline_score - e.prior_baseline;
if (c.velocity === "cold") e.active_signals.push({ type: "warning", text: `No response in $
if (c.velocity === "slowing") e.active_signals.push({ type: "warning", text: "Response time
if (c.ret < 50) e.active_signals.push({ type: "warning", text: "Communication frequency dec
if (c.months >= 11 && c.months <= 13) e.active_signals.push({ type: "info", text: "Approach
if (c.ret >= 80) e.active_signals.push({ type: "positive", text: "Engagement strong across
const names = { "Northvane Studios": "Sarah", "Oakline Outdoors": "James", "Ridgeline Suppl
const n = names[c.name] || c.contact.split(" ")[0];
if (c.ret >= 80) e.rai_summary = `${n} is locked in. Strong trust signals, consistent commu
else if (c.ret >= 60) e.rai_summary = `${n} is solid but watch the edges. ${c.velocity ===
else if (c.ret >= 40) e.rai_summary = `${n} is pulling back. ${c.velocity === "cold" else e.rai_summary = `${n} is at real risk. Multiple signals converging. Call today — not e
? "The
});
// Referral Intelligence (Enterprise)
const referralReadiness = enterpriseClients.map(c => {
const e = c.enterprise;
const scores = e.automated_scores;
const loyalty = (scores.loyaltySignal || 5) / 10;
const trust = (scores.trustLevel || 5) / 10;
const depth = (scores.relationDepth || 5) / 10;
const readiness = (loyalty * 0.35) + (trust * 0.25) + (depth * 0.20) + (c.ret / 100 * 0.15)
const reasons = [];
if (loyalty >= 0.7) reasons.push("Strong loyalty signals");
if (trust >= 0.7) reasons.push("High trust level");
if (depth >= 0.7) reasons.push("Deep personal relationship");
if (c.months >= 12) reasons.push("Long-standing partnership (" + c.months + " months)");
if (c.referrals > 0) reasons.push("Has referred before (" + c.referrals + ")");
if (c.ret >= 80) reasons.push("Excellent retention score");
if (c.velocity === "fast") reasons.push("Highly engaged right now");
const names = { "Northvane Studios": "Sarah", "Oakline Outdoors": "James", "Ridgeline Suppl
const n = names[c.name] || c.contact.split(" ")[0];
let approach = "";
if (readiness >= 0.6) approach = `${n} trusts you and the relationship is deep enough to as
else if (readiness >= 0.4) approach = `${n} is getting there but the relationship needs mor
else approach = `Not the right time. ${n} needs to feel more confident in the partnership b
return { ...c, readiness: Math.round(readiness * 100), reasons, approach, tier: readiness >
}).sort((a, b) => b.readiness - a.readiness);
const sweepData = {
id: "sweep_20260409",
timestamp: "2026-04-09T06:02:00Z",
type: "daily",
clients_analyzed: 8,
alerts_count: 2,
tasks_generated: 5,
portfolio_avg_score: Math.round(clientsBase.reduce((a, c) => a + c.ret, 0) / clientsBase.le
prior_portfolio_avg: Math.round(clientsBase.reduce((a, c) => a + c.ret, 0) / clientsBase.le
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
{ id: "st1", client: "Foxglove Partners", signal: "Budget Squeeze + Stakeholder Shift", act
{ id: "st2", client: "Evergreen Games", signal: "Silent Exit", action: "Derek hasn't respon
{ id: "st3", client: "Copper & Sage", signal: "Slow Fade", action: "Elena's response times
{ id: "st4", client: "Ridgeline Supply", signal: "12-month approaching", action: "Marcus hi
{ id: "st5", client: "Northvane Studios", signal: "Referral opportunity", action: "Sarah's
];
const integrations = [
{ cat: "Communication", items: [
{ name: "Slack", icon: " { name: "Microsoft Teams", icon: " { name: "Gmail / Google", icon: " { name: "Outlook / Microsoft", icon: " ", connected: true, meta: "3 workspaces" },
", connected: false },
", connected: true, meta: "2 accounts" },
", connected: false },
]},
{ cat: "Meetings", items: [
{ name: "Zoom", icon: " ", connected: true, meta: "Connected" },
{ name: "Google Meet", icon: " ", connected: false },
{ name: "Microsoft Teams", icon: " ", connected: false },
]},
{ cat: "CRM", items: [
{ name: "HubSpot", icon: " ", connected: false },
{ name: "Salesforce", icon: " ", connected: false },
{ name: "Pipedrive", icon: " ", connected: false },
]},
{ cat: "Billing", items: [
{ name: "Stripe", icon: " ", connected: false },
{ name: "QuickBooks", icon: " ", connected: false },
{ name: "FreshBooks", icon: " ", connected: false },
]},
];
function retColor(v) {
if (v >= 80) return C.primary; // Thriving
if (v >= 65) return "#558B68"; // Healthy
if (v >= 45) return C.warning; // Watch
if (v >= 30) return C.danger; // At Risk
return "#8B1E1E"; // Critical
}
function retBucket(v) {
if (v >= 80) return "Thriving";
if (v >= 65) return "Healthy";
if (v >= 45) return "Watch";
if (v >= 30) return "At Risk";
return "Critical";
}
function velColor(v) { return v === "fast" ? C.success : v === "normal" ? C.primaryLight : v
// Minimal markdown renderer for Rai's chat responses.
// Handles: **bold**, numbered lists, bulleted lists, paragraphs separated by blank lines.
// Safe: uses React nodes, not dangerouslySetInnerHTML.
function RaiMarkdown({ text, size = 16, lineHeight = 1.65 }) {
if (!text) return null;
// Split into paragraph blocks on blank lines
const blocks = text.split(/\n\s*\n/);
const renderInline = (str, keyPrefix) => {
// Handle **bold** and *italic* inside a string.
// Split on bold first to protect its inner asterisks from being matched as italic const boldParts = str.split(/(\*\*[^*]+\*\*)/g);
const nodes = [];
boldParts.forEach((part, bi) => {
if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
nodes.push(<strong key={`${keyPrefix}-b${bi}`} style={{ fontWeight: 700 }}>{part.slic
return;
marker
}
// Now process italics within the non-bold fragment
const italicParts = part.split(/(\*[^*\n]+\*)/g);
italicParts.forEach((ip, ii) => {
if (ip.startsWith("*") && ip.endsWith("*") && ip.length > 2) {
nodes.push(<em key={`${keyPrefix}-i${bi}-${ii}`} style={{ fontStyle: "italic" }}>{i
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
<ol key={bi} style={{ fontSize: size, color: C.text, lineHeight, marginTop: bi ==
{lines.map((l, li) => {
const content = l.replace(/^\s*\d+\.\s/, "");
return <li key={li} style={{ marginBottom: 4 }}>{renderInline(content, })}
</ol>
`${bi}
);
}
// Detect bulleted list: every line starts with "- " or "* "
const bulletedMatch = lines.length > 0 && lines.every(l => /^\s*[-*]\s/.test(l));
if (bulletedMatch && lines.length > 1) {
return (
<ul key={bi} style={{ fontSize: size, color: C.text, lineHeight, marginTop: bi ==
{lines.map((l, li) => {
const content = l.replace(/^\s*[-*]\s/, "");
return <li key={li} style={{ marginBottom: 4 }}>{renderInline(content, })}
</ul>
`${bi}
);
}
// Default: paragraph with line breaks
return (
<p key={bi} style={{ fontSize: size, color: C.text, lineHeight, margin: 0, marginTo
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
"Northvane Studios": "Let's talk about Northvane. Sarah's been with you almost 3 years. Wha
"Oakline Outdoors": "Oakline is solid. Anything specific, or just checking in?",
"Ridgeline Supply": "Ridgeline is at an inflection point. 1-year mark coming. What are you
"Broadleaf Media": "Broadleaf is your highest revenue but stable, not growing. Want to chan
"Copper & Sage": "Copper & Sage has been declining. Elena's pulling back. What happened las
"Velvet & Co": "Velvet is going vague. Priya used to give detail. What changed?",
"Foxglove Partners": "Foxglove has been cold 2 weeks. $8.2k/mo. Ready to make a call?",
"Evergreen Games": "Evergreen is done. Want to think through the Rolodex entry — could they
};
const coachDemos = {
"Which clients should I ask for referrals?": "Sarah at Northvane (91%) already referred 2.
"Who needs attention this week?": "This week: Ridgeline (1-year approaching), Copper "What patterns do my best clients share?": "Your top clients share three traits: they give
& Sage
};
const Dot = () => <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.dange
export default function App({ user }) {
const [tier, setTier] = useState("core"); // "core" | "enterprise"
const [page, setPage] = useState("today");
const [showMore, setShowMore] = useState(false);
const [selectedClient, setSelectedClient] = useState(null);
const [clientTab, setClientTab] = useState("overview");
const [clientBilling, setClientBilling] = useState({});
const [billingAddOpen, setBillingAddOpen] = useState(false);
const [billingNewItem, setBillingNewItem] = useState({ description: "", amount: "", recurri
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
const [newRolodexEntry, setNewRolodexEntry] = useState({ client: "", contact: "", work: ""
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
const [newClient, setNewClient] = useState({ name: "", contact: "", role: "", tag: "", reve
const [profileStep, setProfileStep] = useState(0);
const [profileScores, setProfileScores] = useState({});
const profileDimensions = [
{ key: "trust", name: "Trust", desc: "Does this client trust you to do your job?", left:
{ key: "loyalty", name: "Loyalty", desc: "Is this client looking at other options?", left
{ key: "expectations", name: "Expectations", desc: "Are the client's expectations for you
{ key: "grace", name: "Grace", desc: "When something goes wrong, how does this client rea
{ key: "commFrequency", name: "Communication Frequency", desc: "How often does the client
{ key: "stressResponse", name: "Stress Response", desc: "When results are bad or somethin
{ key: "budgetCommitment", name: "Budget Commitment", desc: "How likely is budget to beco
{ key: "relationshipDepth", name: "Relationship Depth", desc: "Beyond business, is there
{ key: "reportingNeed", name: "Reporting Need", desc: "How much reporting does this clien
{ key: "replaceability", name: "Replaceability", desc: "How easy would it be for this cli
{ key: "commTone", name: "Communication Tone", desc: "How does this client communicate wi
{ key: "decisionMaking", name: "Decision Making", desc: "How much authority does your pri
];
// ─── COMBO DEFINITIONS ───
const COMBOS = [
{ name: "Bulletproof", type: "positive", max: 2, dims: [{ key: "loyalty", dir: "gte", thr
{ name: "True partner", type: "positive", max: 2, dims: [{ key: "trust", dir: "gte", thre
{ name: "Locked vault", type: "positive", max: 2, dims: [{ key: "loyalty", dir: "gte", th
{ name: "Smooth operator", type: "positive", max: 1, dims: [{ key: "commTone", dir: "gte"
{ name: "Resilient under fire", type: "positive", max: 1, dims: [{ key: "stressResponse",
{ name: "All-in investor", type: "positive", max: 1, dims: [{ key: "budgetCommitment", di
{ name: "Decision express", type: "positive", max: 1, dims: [{ key: "decisionMaking", dir
{ name: "Open book", type: "positive", max: 1, dims: [{ key: "commTone", dir: "gte", thre
{ name: "Sticky by design", type: "positive", max: 1, dims: [{ key: "replaceability", dir
{ name: "Low maintenance loyalty", type: "positive", max: 1, dims: [{ key: "loyalty", dir
{ name: "Ticking time bomb", type: "negative", max: 2, dims: [{ key: "expectations", dir:
{ name: "On the clock", type: "negative", max: 2, dims: [{ key: "trust", dir: "lte", thre
{ name: "No room to operate", type: "negative", max: 2, dims: [{ key: "trust", dir: "lte"
{ name: "One foot out", type: "negative", max: 2, dims: [{ key: "loyalty", dir: "lte", th
{ name: "Silent exit", type: "negative", max: 1, dims: [{ key: "stressResponse", dir: "lt
{ name: "Powder keg", type: "negative", max: 1, dims: [{ key: "stressResponse", dir: "gte
{ name: "Ice wall", type: "negative", max: 1, dims: [{ key: "commTone", dir: "lte", thres
{ name: "Nickel and dime", type: "negative", max: 1, dims: [{ key: "budgetCommitment", di
{ name: "No anchor", type: "negative", max: 1, dims: [{ key: "relationshipDepth", dir: "l
{ name: "Bottleneck doom", type: "negative", max: 1, dims: [{ key: "decisionMaking", dir:
];
// ─── COMBO STRENGTH CALC ───
const calcComboStrength = (dimDef, rawVal) => {
if (rawVal == null) return null;
if (dimDef.dir === "gte") { if (rawVal < dimDef.threshold) return null; const r = 10 - di
if (dimDef.dir === "lte") { if (rawVal > dimDef.threshold) return null; const r = dimDef.
if (dimDef.dir === "between") { if (rawVal < dimDef.threshold || rawVal > dimDef.upper) r
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
combo.dims.forEach((d, i) => { ws += strengths[i] * (dimWeights[d.key] || 0.05); const norm = tw > 0 ? ws / tw : 0;
tw +=
const value = Math.round(norm * combo.max * 100) / 100;
triggered.push({ name: combo.name, type: combo.type, max: combo.max, value: combo.type
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
const positives = triggered.filter(c => c.type === "positive").sort((a, b) => b.value - a
const negatives = triggered.filter(c => c.type === "negative").sort((a, b) => a.value - b
const posH = [1.0, 0.75, 0.50, 0.25, 0.125, 0.0625, 0.03, 0.015, 0.01, 0.005];
const negD = [1.0, 0.90, 0.80, 0.70, 0.60, 0.50, 0.40, 0.30, 0.20, 0.10];
let pt = 0, nt = 0;
positives.forEach((c, i) => { c.dm = posH[i] || 0.005; c.dv = Math.round(c.value * c.dm *
negatives.forEach((c, i) => { c.dm = negD[i] || 0.10; c.dv = Math.round(c.value * c.dm *
const comboTotal = Math.round((pt + nt) * 100) / 100;
const baselineScore = dimensionScore + Math.round(comboTotal);
// HC blend: 80% baseline + 20% HC
const hcScore = calcHealthCheckScore(hcAnswersArr);
let finalScore = hcScore != null ? Math.round(baselineScore * 0.80 + hcScore * 0.20) : ba
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
const percentileRank = (arr, val) => { if (arr.length <= 1) return 0.5; const s = [...arr].
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
const ltvF = 0.8 + percentileRank(allClients.map(c => getAdjustedLTV(c)), getAdjustedLTV(
const tenF = 0.8 + percentileRank(allClients.map(c => c.months || 0), client.months || 0)
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
const qualFlags = { latePayments: newClient.latePayments, prevTerminated: newClient.prevT
const baseline = calcRetentionScore(profileScores, null, qualFlags, parseInt(newClient.mo
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
const [clientRes, taskRes, refRes, rolodexRes, suggestionRes, hcRes, tpRes] = await Promi
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
// Auto-reset recurring tasks that were completed before the most recent 2 AM local tim
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
const overdue = dueDate ? Math.max(0, Math.floor((today - dueDate) / (1000*60*60*24))
const isToday = dueDate && dueDate.toDateString() === today.toDateString();
return {
id: h.id,
client_id: h.client_id,
client: client?.name || "Unknown",
ret: client?.retention_score || 0,
due: isToday ? "Today" : dueDate ? dueDate.toLocaleDateString("en-US", { month: "sh
overdue: overdue,
};
}));
}
setDataLoaded(true);
}, [user]);
useEffect(() => { loadData(); }, [loadData]);
// Schedule automatic recurring-task reset at 2 AM local, every day
// Fires even if the tab stays open across midnight — ensures no one sees stale "done" chec
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
const task = { id: created?.id || "u" + Date.now(), text: newTask.trim(), client: newTask
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
if (allTasksFilter(newTasks[i]) && getProfileSortScore(newTasks[i].client) >= taskPS)
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
setNewTask(""); setNewTaskClient(""); setNewTaskRecurring(false); setShowClientPicker(fal
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
const boost = calcNewClientBoost(c.ret || 50, clients.reduce((a, x) => a + (x.revenue ||
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
const boost = calcNewClientBoost(c.ret || 50, revPct, c.daysOld != null ? c.daysOld : 999
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
setRefs([{ id: created?.id || "ref" + Date.now(), from: refFrom, to: refName.trim(), date
setRefName(""); setRefFrom(""); setRefStatus("converted"); setRefRevenue(""); setRefTotal
};
const refsConverted = refs.filter(r => r.converted || r.status === "converted" || r.status
const refsRevenue = refsConverted.reduce((a, r) => a + r.revenue, 0);
// Coach
const [aiInput, setAiInput] = useState("");
const [aiClientSearch, setAiClientSearch] = useState("");
const [aiMessages, setAiMessages] = useState([]);
const [aiTyping, setAiTyping] = useState(false);
const aiEndRef = useRef(null);
const aiUserRef = useRef(null);
useEffect(() => {
// Claude-style: when a new user message is sent, scroll that message to the top of the v
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
document.querySelectorAll('textarea[placeholder="Reply to Rai…"], textarea[placeholder=
t.style.height = "auto";
});
}
}, [aiInput]);
const sendAi = async (text) => {
const q = text || aiInput; if (!q.trim()) return;
setAiMessages(prev => [...prev, { role: "user", text: q }]); setAiInput(""); setAiTyping(
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
setAiMessages(prev => [...prev, { role: "ai", text: data.message || "You've hit your
return;
}
if (!response.ok) {
const errText = await response.text().catch(() => "");
console.error("Rai API error:", response.status, errText);
setAiMessages(prev => [...prev, { role: "ai", text: "I'm having trouble thinking righ
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
if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_del
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
next[next.length - 1] = { role: "ai", text: "I'm having trouble thinking right no
return next;
});
}
return;
a mome
}
// Fallback: non-streaming JSON response
const data = await response.json();
const reply = data.reply || "I'm having trouble thinking right now. Try again in setAiMessages(prev => [...prev, { role: "ai", text: reply }]);
} catch (err) {
console.error("Rai API error:", err);
setAiMessages(prev => [...prev, { role: "ai", text: "Something went wrong connecting to
}
setAiTyping(false);
};
// ═══ PANEL COMPONENTS ═══
const PanelCard = ({ children, style }) => <div style={{ background: "#FAFAF8", borderRadiu
const PortfolioPanel = () => {
const avgScore = clients.length > 0 ? Math.round(clients.reduce((a, c) => a + (c.ret || 0
const thriving = clients.filter(c => (c.ret || 0) >= 80).length;
const healthy = clients.filter(c => (c.ret || 0) >= 65 && (c.ret || 0) < 80).length;
const watch = clients.filter(c => (c.ret || 0) >= 45 && (c.ret || 0) < 65).length;
const atRisk = clients.filter(c => (c.ret || 0) < 45).length;
const total = clients.length || 1;
return (
<div className="r-today-panel" style={{ flexShrink: 0 }}>
<PanelCard style={{ padding: "16px" }}>
<div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
<div style={{ display: "flex", alignItems: "center" }}>
<ScoreRing score={avgScore} size={56} strokeWidth={4} />
</div>
<div style={{ flex: 1 }}>
{[
{ l: "Clients", v: clients.length },
{ l: "Monthly Revenue", v: (() => { const mrr = clients.reduce((a, c) => a +
].map((r, i, arr) => (
<div key={i} style={{ padding: "10px 0", borderBottom: i < arr.length - 1 ? "
<span style={{ fontSize: 12, color: C.textMuted }}>{r.l}</span>
<span style={{ fontSize: 14, fontWeight: 800 }}>{r.v}</span>
</div>
))}
</div>
</div>
{clients.length > 0 && (
<div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #E8ECE6" }}>
<div style={{ display: "flex", justifyContent: "space-around", marginBottom: 6,
{[{ l: "Thriving", v: thriving, c: C.primary }, { l: "Healthy", v: healthy, c
<div key={si}><div style={{ fontSize: 15, fontWeight: 900, color: s.c }}>{s
))}
</div>
<div style={{ height: 6, borderRadius: 3, display: "flex", overflow: "hidden" }
{thriving > 0 && <div style={{ width: (thriving / total * 100) + "%", backgro
{healthy > 0 && <div style={{ width: (healthy / total * 100) + "%", backgroun
{watch > 0 && <div style={{ width: (watch / total * 100) + "%", background: C
{atRisk > 0 && <div style={{ width: (atRisk / total * 100) + "%", background:
</div>
</div>
)}
</PanelCard>
<PanelCard>
<div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "upp
<div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
<div style={{ flex: 1 }}>
<div style={{ fontSize: 20, fontWeight: 900, color: C.text, letterSpacing: "-0.
<div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>Lifetime Value<
</div>
<div style={{ width: 1, background: "#E8ECE6" }} />
<div style={{ flex: 1 }}>
<div style={{ fontSize: 20, fontWeight: 900, color: C.text, letterSpacing: "-0.
<div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>Avg Tenure</div
</div>
</div>
{clients.length > 0 && (() => {
const longest = [...clients].sort((a, b) => (b.months || 0) - (a.months || if (!longest || !longest.months) return null;
const yrs = longest.months >= 12 ? (longest.months / 12).toFixed(1) + " yr" : lon
return (
<div style={{ fontSize: 11, color: C.textMuted, paddingTop: 10, borderTop: "1px
Longest relationship: <span style={{ color: C.text, fontWeight: 600 }}>{longe
</div>
0))[0]
);
})()}
</PanelCard>
{clients.length > 1 && (
<PanelCard style={{ marginBottom: 0 }}>
<div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "u
<div style={{ fontSize: 9, fontWeight: 700, color: C.success, textTransform: "upp
{[...clients].sort((a, b) => (b.ret || 0) - (a.ret || 0)).slice(0, 2).map((c, ci)
<div key={"up" + ci} style={{ padding: "7px 0", borderBottom: "1px solid #E8ECE
<ScoreRing score={c.ret || 0} size={26} strokeWidth={2} />
<span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{c.name}</span>
</div>
))}
<div style={{ fontSize: 9, fontWeight: 700, color: C.danger, textTransform: "uppe
{[...clients].sort((a, b) => (a.ret || 0) - (b.ret || 0)).slice(0, 2).map((c, ci)
<div key={"dn" + ci} style={{ padding: "7px 0", borderBottom: ci < 1 ? "1px sol
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
<div className="r-today-panel" style={{ width: 360, flexShrink: 0, position: "sticky", to
color:
<div style={{ background: "transparent", borderRadius: 16, border: "1px solid " + C.bor
{/* Rai header */}
<div style={{ display: "flex", gap: 10, alignItems: "center", paddingBottom: 12, bord
<div style={{ width: 38, height: 38, borderRadius: "50%", background: C.btn, Rai
<div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10,
</div>
<div>
<div style={{ fontSize: 14, fontWeight: 800 }}>Rai</div>
<div style={{ fontSize: 11, color: C.success, fontWeight: 600, display: "flex", a
<span style={{ width: 5, height: 5, borderRadius: "50%", background: C.success,
Watching your portfolio
</div>
</div>
</div>
{/* Messages */}
<div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", g
{aiMessages.length === 0 ? (
<>
<div style={{ background: C.card, borderRadius: 10, padding: "10px 12px", fontS
<strong>Good morning{user?.user_metadata?.full_name ? ", " + user.user_metada
const worst = [...clients].sort((a, b) => (a.ret || 0) - (b.ret || 0))[0];
const thriving = clients.filter(c => (c.ret || 0) >= 80);
if (worst && (worst.ret || 0) < 60) return worst.name + " is my biggest con
if (thriving.length > 0) return "Your portfolio looks solid. " + thriving.l
return "What's on your mind today?";
})()}
</div>
{clients.filter(c => (c.ret || 0) >= 80).length >= 2 && (
<div style={{ background: C.card, borderRadius: 10, padding: "10px 12px", fon
{(() => {
const thriving = clients.filter(c => (c.ret || 0) >= 80).slice(0, 3);
return "Clients I'd leave alone: " + thriving.map(c => c.name).join(", ")
})()}
</div>
)}
{/* Suggested prompts */}
<div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}
{[
(() => { const w = [...clients].sort((a, b) => (a.ret || 0) - (b.ret "Who needs attention this week?",
"Draft a check-in message",
].filter(Boolean).map((p, i) => (
<div key={i} onClick={() => { setAiInput(p); }} style={{ background: {p}
</div>
))}
|| 0))
C.card
</div>
</>
) : (
<>
{aiMessages.map((m, i) => (
m.role === "user" ? (
<div key={i} style={{ alignSelf: "flex-end", background: C.surface, color:
{m.text}
</div>
) : (
<div key={i} style={{ padding: "2px 2px", color: C.text }}>
<RaiMarkdown text={m.text} size={13} lineHeight={1.55} />
</div>
)
))}
</>
{aiTyping && <div style={{ display: "flex", gap: 4, padding: "2px 2px", alignSe
)}
</div>
{/* Input */}
<div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.borderLight,
<input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => {
<button onClick={sendAi} style={{ width: 36, height: 36, borderRadius: "50%", borde
</div>
</div>
</div>
);
const RolodexPanel = () => {
const convertedClients = clients.filter(c => rolodex.some(r => r.name === c.name || r.cli
const totalLeads = rolodex.length;
const converted = convertedClients.length;
const convRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;
const avgScore = converted > 0 ? Math.round(convertedClients.reduce((a, c) => a + (c.ret
const staleLeads = rolodex.filter(r => !clients.some(c => c.name === r.name || c.name ===
return (
<div className="r-today-panel" style={{ width: 320, flexShrink: 0, position: "sticky",
<PanelCard style={{ padding: "16px" }}>
<div style={{ display: "flex", gap: 14, alignItems: "center" }}>
<div>
<ScoreRing score={avgScore || 0} size={56} strokeWidth={4} />
<div style={{ textAlign: "center", marginTop: 3 }}>
<div style={{ fontSize: 9, fontWeight: 600, color: C.textMuted }}>Converted h
</div>
</div>
<div style={{ flex: 1 }}>
{[{ l: "Converted", v: converted }, { l: "Revenue added", v: "$" + Math.round(c
<div key={i} style={{ padding: "7px 0", borderBottom: i < 2 ? "1px solid #E8E
<span style={{ fontSize: 12, color: C.textMuted }}>{r.l}</span>
<span style={{ fontSize: 14, fontWeight: 800 }}>{r.v}</span>
</div>
l: "St
#E8ECE
))}
</div>
</div>
</PanelCard>
<PanelCard>
<div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "upp
<div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
<span style={{ fontSize: 28, fontWeight: 900, color: C.primary }}>{convRate}%</sp
<span style={{ fontSize: 12, color: C.textMuted }}>became clients</span>
</div>
<div style={{ marginTop: 8 }}>
{[{ l: "Total leads", v: totalLeads }, { l: "Converted", v: converted }, { <div key={i} style={{ padding: "5px 0", borderBottom: i < 2 ? "1px solid <span style={{ fontSize: 11, color: C.textMuted }}>{s.l}</span>
<span style={{ fontSize: 11, fontWeight: 700 }}>{s.v}</span>
</div>
))}
</div>
</PanelCard>
<PanelCard style={{ marginBottom: 0 }}>
{staleLeads.length > 0 ? (
<div>
<div style={{ fontSize: 9, fontWeight: 600, color: C.warning, textTransform: "u
{staleLeads.slice(0, 4).map((r, i) => (
<div key={i} style={{ padding: "7px 0", borderBottom: i < Math.min(staleLeads
<span style={{ fontSize: 12, fontWeight: 600 }}>{r.name || r.client}</span>
<span style={{ fontSize: 11, color: C.textMuted }}>{r.contact}</span>
</div>
))}
</div>
) : (
<div>
</div>
<div style={{ fontSize: 9, fontWeight: 600, color: C.success, textTransform: "u
<div style={{ fontSize: 12, color: C.textMuted }}>No stale leads. All contacts
)}
</PanelCard>
</div>
);
};
const ReferralsPanel = () => {
const referredClients = clients.filter(c => refs.some(r => r.referred === c.name || r.to
const avgScore = referredClients.length > 0 ? Math.round(referredClients.reduce((a, c) =>
const refRev = referredClients.reduce((a, c) => a + (c.revenue || 0), 0);
const totalReferred = refs.length;
const converted = referredClients.length;
const convRate = totalReferred > 0 ? Math.round((converted / totalReferred) * 100) : 0;
const likelyToRefer = [...clients].filter(c => (c.ret || 0) >= 80).sort((a, b) => (b.ret
return (
<div className="r-today-panel" style={{ width: 320, flexShrink: 0, position: "sticky",
<PanelCard style={{ padding: "16px" }}>
<div style={{ display: "flex", gap: 14, alignItems: "center" }}>
<div>
<ScoreRing score={avgScore || 0} size={56} strokeWidth={4} />
<div style={{ textAlign: "center", marginTop: 3 }}>
<div style={{ fontSize: 9, fontWeight: 600, color: C.textMuted }}>Referred he
</div>
</div>
<div style={{ flex: 1 }}>
{[{ l: "Referred clients", v: converted }, { l: "Referral revenue", v: "$" + Ma
<div key={i} style={{ padding: "7px 0", borderBottom: i < 2 ? "1px solid #E8E
<span style={{ fontSize: 12, color: C.textMuted }}>{r.l}</span>
<span style={{ fontSize: 14, fontWeight: 800 }}>{r.v}</span>
</div>
))}
</div>
</div>
</PanelCard>
<PanelCard>
<div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "upp
<div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
<span style={{ fontSize: 28, fontWeight: 900, color: C.primary }}>{convRate}%</sp
<span style={{ fontSize: 12, color: C.textMuted }}>became clients</span>
</div>
<div style={{ marginTop: 8 }}>
{[{ l: "Total referred", v: totalReferred }, { l: "Converted", v: converted }, {
<div key={i} style={{ padding: "5px 0", borderBottom: i < 2 ? "1px solid <span style={{ fontSize: 11, color: C.textMuted }}>{s.l}</span>
<span style={{ fontSize: 11, fontWeight: 700 }}>{s.v}</span>
#E8ECE
</div>
))}
</div>
</PanelCard>
{likelyToRefer.length > 0 && (
<PanelCard style={{ marginBottom: 0 }}>
<div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted, textTransform: "u
<div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8 }}>Thriving clien
{likelyToRefer.map((c, i) => (
<div key={i} style={{ padding: "7px 0", borderBottom: i < likelyToRefer.length
<ScoreRing score={c.ret || 0} size={26} strokeWidth={2} />
<div style={{ flex: 1 }}>
<span style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</span>
<div style={{ fontSize: 10, color: C.textMuted }}>{c.months || 0}mo</div>
</div>
{refs.some(r => r.from === c.name || r.source === c.name) && <span style={{ f
</div>
))}
</PanelCard>
)}
</div>
);
};
const goTo = (id) => { if (page === "health" && id !== "health") { setHcDone({}); setHcOpen
const allPages = [...(tier === "enterprise" ? navItemsEnterprise : navItemsCore), ...(tier
const pageTitle = allPages.find(n => n.id === page)?.label || "";
const totalRev = clients.reduce((a, c) => a + c.revenue, 0);
const overdueChecks = hcQueue.filter(h => (h.overdue > 0 || h.due === "Today") && !hcDone[h
const totalRefRev = refs.filter(r => r.status === "converted" || r.converted).reduce((a, r)
const todayDot = tasksDone < tasksTotal;
const healthDot = overdueChecks > 0;
const hasDot = (id) => (id === "today" && todayDot) || (id === "health" && healthDot);
return (
<div style={{ minHeight: "100vh", fontFamily: "'Manrope', system-ui, sans-serif", color:
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;70
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
.r-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(91,33,182,0
}
.r-btn:active { transform: scale(0.98); }
.row-hover { transition: background 0.1s; cursor: pointer; }
.row-hover:hover { background: ${C.primarySoft}; }
.r-desk { display: none; }
.r-mob-top { display: flex; }
.r-mob-bot { display: flex; }
.r-main { padding: 16px 16px 80px; }
.r-today-panel { display: none !important; }
.r-client-modal { top: 0 !important; left: 0 !important; right: 0 !important; bottom:
/* Mobile: Log button becomes icon-only */
.r-log-label { display: none; }
/* Mobile: chat user-message scroll needs to clear sticky header */
.r-chat-msg-user { scroll-margin-top: 80px !important; }
@media (min-width: 768px) {
:root { --sidebar-w: 270px; }
.r-desk { display: flex !important; }
.r-mob-top { display: none !important; }
.r-mob-bot { display: none !important; }
.r-today-panel { display: block !important; }
.r-client-modal { top: 50% !important; left: 50% !important; right: auto !important
.r-main { padding: 28px 48px; margin-left: var(--sidebar-w); }
.r-log-label { display: inline !important; }
.r-chat-msg-user { scroll-margin-top: 24px !important; }
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
.client-pill:hover { background: ${C.primarySoft} !important; border-color: ${C.prima
.card-hover { transition: box-shadow 0.2s ease, transform 0.2s ease; cursor: pointer;
.card-hover:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.0
.row-item { transition: background 0.12s ease; cursor: pointer; }
.row-item:hover { background: #33543E10; }
.btn-ghost { transition: all 0.12s ease; cursor: pointer; }
.btn-ghost:hover { background: #EEEFEB !important; }
.btn-ghost-green { transition: all 0.12s ease; cursor: pointer; }
.btn-ghost-green:hover { background: #D9EBE0 !important; }
.btn-ghost-red { transition: all 0.12s ease; cursor: pointer; }
.btn-ghost-red:hover { background: #F5DDD8 !important; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1;
`}</style>
{/* Fireworks */}
{confetti && (
<div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none", {/* Multiple burst origins */}
{[
overfl
{ x: 30, y: 35, delay: 0, color: "#5B21B6" },
{ x: 70, y: 30, delay: 0.4, color: "#2D8659" },
{ x: 50, y: 25, delay: 0.8, color: "#B88B15" },
{ x: 20, y: 40, delay: 1.2, color: "#33543E" },
{ x: 80, y: 35, delay: 1.0, color: "#C4432B" },
{ x: 45, y: 45, delay: 1.5, color: "#558B68" },
].map((burst, bi) => (
<div key={bi} style={{ position: "absolute", left: `${burst.x}%`, top: `${burst.y
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
const colors = [burst.color, "#fff", burst.color + "cc", "#FFD700", "#FF6B6B"
return (
<div key={pi} style={{
position: "absolute", width: size, height: size, borderRadius: "50%",
background: colors[pi % colors.length],
boxShadow: `0 0 ${size * 2}px ${colors[pi % colors.length]}`,
"--dx": `${dx}px`, "--dy": `${dy}px`,
animation: `fwBurst ${0.8 + Math.random() * 0.6}s ease-out ${burst.delay
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
position: "absolute", left: Math.cos(angle) * dist, top: Math.sin(angle)
fontSize: 6 + Math.random() * 6, color: "#FFD700",
animation: `fwSparkle ${0.4 + Math.random() * 0.4}s ease-in-out ${burst.d
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
<div style={{ position: "fixed", inset: 0, zIndex: 250, display: "flex", alignItems:
<div style={{ background: C.card, borderRadius: 20, padding: "40px 48px", textAlign
<div style={{ fontSize: 48, marginBottom: 12 }}>&#127881;</div>
<div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", marginBott
<div style={{ fontSize: 14, color: C.textMuted, marginBottom: 20 }}>Every task co
<div style={{ background: C.primarySoft, borderRadius: 12, padding: "16px", margi
<div style={{ fontSize: 36, fontWeight: 900, color: C.primary }}>{streak} {stre
<div style={{ fontSize: 14, color: C.primary, fontWeight: 600 }}>completion str
</div>
<button className="r-btn" onClick={() => setShowStreakModal(false)} style={{ padd
</div>
</div>
)}
{/* SIDEBAR */}
<div className="r-desk" style={{ width: 270, background: C.sidebar, flexDirection: "col
<div style={{ padding: "20px 18px 24px" }}><span style={{ fontSize: 24, fontWeight: 9
<div style={{ flex: 1, padding: "0 10px" }}>
{(tier === "enterprise" ? navItemsEnterprise : navItemsCore).map(n => (
<div key={n.id} className="nav-item" onClick={() => goTo(n.id)} style={{ display:
<span style={{ width: 24, display: "flex", alignItems: "center", justifyContent
{hasDot(n.id) && <Dot />}
</div>
))}
{page === "coach" && (
<div style={{ padding: "10px 2px 0" }}>
<div onClick={() => setAiMessages([])} style={{ padding: "10px 12px", borderRad
</div>
"flex"
)}
</div>
<div style={{ padding: "8px 10px", borderTop: "1px solid #D0DDD4" }}>
<div onClick={() => setTier(tier === "core" ? "enterprise" : "core")} className="na
<span style={{ fontSize: 12, fontWeight: 600 }}>{tier === "enterprise" ? "Enterpr
<div style={{ width: 36, height: 20, borderRadius: 10, background: tier === "ente
<div style={{ width: 16, height: 16, borderRadius: 8, background: "#fff", posit
</div>
</div>
<div className="nav-item" onClick={() => goTo("settings")} style={{ display: <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent:
</div>
</div>
<div style={{ padding: "12px 20px 18px", borderTop: "1px solid #D0DDD4" }}>
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
<div style={{ width: 30, height: 30, borderRadius: 8, background: "#D0DDD4", disp
<div><div style={{ fontSize: 14, fontWeight: 600, color: "#6B8572", textTransform
</div>
</div>
</div>
"cente
{/* MOBILE TOP */}
<div className="r-mob-top" style={{ justifyContent: "space-between", alignItems: <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
<span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.04em", color: C.pr
</div>
<div style={{ width: 28, height: 28, borderRadius: 8, background: C.primary, display:
</div>
<div className="r-main">
{/* ═══ TODAY — TASK MANAGER ═══ */}
{page === "today" && (
<div>
<h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBotto
<p style={{ fontSize: 14, color: C.textMuted, marginBottom: 16 }}>{new Date().toL
<div className="r-today-cols" style={{ display: "flex", gap: 24 }}>
{/* LEFT PANEL — Portfolio tiles */}
<div className="r-today-panel" style={{ width: 270, flexShrink: 0 }}>
<PortfolioPanel />
</div>
<div style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>
{/* Enterprise Sweep Results Card */}
{tier === "enterprise" && (
<div style={{ background: C.card, borderRadius: 12, border: "1px solid " + C.bo
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "
<div>
<div style={{ fontSize: 14, fontWeight: 700 }}> Daily Sweep · Today 6:0
<div style={{ fontSize: 12, color: C.textMuted }}>{sweepData.clients_anal
</div>
</div>
<div style={{ marginBottom: 10 }}>
<div style={{ display: "flex", justifyContent: "space-between", fontSize: 1
<span>Portfolio Health</span>
<span style={{ fontWeight: 700, color: C.text }}>{sweepData.portfolio_avg
</div>
<div style={{ height: 6, background: C.borderLight, borderRadius: 3 }}>
<div style={{ height: "100%", width: `${sweepData.portfolio_avg_score}%`,
</div>
</div>
{[
<div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
{ label: "Critical", count: sweepData.score_distribution.critical, color:
{ label: "At Risk", count: sweepData.score_distribution.at_risk, color: "
{ label: "Watch", count: sweepData.score_distribution.watch, color: C.war
{ label: "Stable", count: sweepData.score_distribution.stable, color: C.t
{ label: "Strong", count: sweepData.score_distribution.strong, color: C.s
].map((d, i) => (
<span key={i} style={{ fontSize: 12, color: d.color, fontWeight: 600 }}>{
))}
</div>
</div>
<button className="r-btn" onClick={() => goTo("sweeps")} style={{ width: "100
)}
}}>{ta
{/* Daily Review */}
<div style={{ background: C.raiGrad, borderRadius: 14, padding: "16px 18px", colo
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4
<span style={{ fontSize: 14, fontWeight: 700 }}>Daily Progress</span>
<span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em" </div>
<div style={{ height: 6, background: "rgba(255,255,255,.15)", borderRadius: 3,
<div style={{ height: "100%", width: `${tasksTotal > 0 ? Math.round((tasksDon
</div>
</div>
{/* Add task */}
<div style={{ marginBottom: 24 }}>
<div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
<input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={
<button className="r-btn" onClick={addTask} style={{ padding: "0 20px", heigh
<div style={{ position: "relative" }}>
<div className="r-btn r-log-btn" onClick={() => { setShowTouchpoint(!showTo
<span style={{ fontSize: 14 }}> </span> <span className="r-log-label">Lo
</div>
{showTouchpoint && (
<div style={{ position: "absolute", top: 50, right: 0, width: 300, <div style={{ padding: "14px 16px 10px" }}>
<div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Log
{!tpClient ? (
<div>
backgr
<input value={tpSearch} onChange={e => setTpSearch(e.target.value
<div style={{ maxHeight: 200, overflow: "auto" }}>
{clients.filter(c => !tpSearch || c.name.toLowerCase().includes
<div key={i} onClick={() => setTpClient(c.name)} className="r
"point
))}
</div>
</div>
) : !tpChannel ? (
<div>
<div style={{ display: "flex", alignItems: "center", gap: 6, marg
<span onClick={() => setTpClient(null)} style={{ cursor: <span style={{ fontSize: 13, fontWeight: 600 }}>{tpClient}</spa
</div>
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", ga
{[{ id: "call", label: "Call", icon: " " }, { id: "text", labe
<div key={ch.id} onClick={() => setTpChannel(ch.id)} classNam
<div style={{ fontSize: 20, marginBottom: 4 }}>{ch.icon}</d
{ch.label}
</div>
))}
</div>
2 }}>{
</div>
) : (
<div style={{ textAlign: "center", padding: "8px 0" }}>
<div style={{ fontSize: 28, marginBottom: 8 }}>{[{ id: "call", ic
<div style={{ fontSize: 14, fontWeight: 700, marginBottom: <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14
<div style={{ display: "flex", gap: 6 }}>
<button onClick={() => setTpChannel(null)} style={{ flex: 1, pa
<button onClick={async () => {
// Find the client record to get their id for the FK
const clientObj = clients.find(c => c.name === tpClient);
if (!clientObj) { setTpClient(null); setTpChannel(null); setS
// Optimistic: show the pill immediately with a temp id, then
const tempId = "tmp_" + Date.now();
const tempEntry = { id: tempId, client: tpClient, channel: tp
setTpLogged(prev => [tempEntry, ...prev]);
setTpClient(null); setTpChannel(null); setShowTouchpoint(fals
const { data, error } = await touchpointsDb.create(user.id, {
if (error || !data) {
console.error("Failed to log touchpoint:", error);
// Roll back the optimistic entry
setTpLogged(prev => prev.filter(l => l.id !== tempId));
return;
}
// Swap temp id for real id
setTpLogged(prev => prev.map(l => l.id === tempId ? { id: dat
}} style={{ flex: 1, padding: "10px", background: C.btn, color:
</div>
</div>
)}
</div>
</div>
)}
</div>
</div>
{(newTask.trim() || newTaskClient || newTaskRecurring) && (
<div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fl
<button onClick={() => setShowClientPicker(!showClientPicker)} style={{ pad
{newTaskClient || "Assign to client"}
</button>
{newTaskClient && <button onClick={() => setNewTaskClient("")} style={{ bac
<button onClick={() => setNewTaskRecurring(!newTaskRecurring)} style={{ pad
{newTaskRecurring ? "↻ Recurring" : "Make recurring"}
</button>
</div>
)}
{showClientPicker && (newTask.trim() || newTaskClient || newTaskRecurring) && (
style=
<div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6, paddin
<span style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, backgroun
<span style={{ color: C.textMuted, fontSize: 12 }}>⌕</span>
<input value={taskClientSearch} onChange={e => setTaskClientSearch(e.targ
{taskClientSearch && <span onClick={() => setTaskClientSearch("")} </span>
<span onClick={() => { setNewTaskClient("All Clients"); setShowClientPicker
{[...clients].sort((a, b) => b.ret - a.ret).filter(c => !taskClientSearch |
<span key={c.id} onClick={() => { setNewTaskClient(c.name); setShowClient
))}
</div>
)}
</div>
{/* Logged touchpoints */}
{tpLogged.length > 0 && (
<div style={{ marginBottom: 18 }}>
<div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransfor
<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
{tpLogged.map((l) => (
<span key={l.id} style={{ fontSize: 12, padding: "5px 10px", borderRadius
{l.channel === "call" ? " " : l.channel === "text" ? " " : l.channel
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
</span>
}} style={{ cursor: "pointer", marginLeft: 4, color: C.primary, opacity
))}
</div>
</div>
)}
{/* Suggested by Rai — alerts (red) + suggestions (green) */}
{aiTasks.length > 0 && (
<div style={{ marginBottom: 24 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform:
{aiTasks.filter(t => t.alert).map(t => (
<div key={t.id} style={{ background: "linear-gradient(90deg, #FAE8E4 <div style={{ padding: "14px 16px", position: "relative" }}>
<button onClick={() => dismissAi(t.id)} style={{ position: "absolute",
0%, #F
<p style={{ fontSize: 14, color: C.text, fontWeight: 600, lineHeight: 1
{t.client && <p style={{ fontSize: 12, color: C.textMuted, marginTop: 4
</div>
</div>
<button className="btn-ghost-red" onClick={() => promoteAi(t.id)} style={
))}
{aiTasks.filter(t => !t.alert).slice(0, 5).map(t => (
<div key={t.id} style={{ background: "linear-gradient(90deg, " + C.primaryS
<div style={{ padding: "14px 16px", position: "relative" }}>
<button onClick={() => dismissAi(t.id)} style={{ position: "absolute",
<p style={{ fontSize: 14, color: C.text, lineHeight: 1.5, paddingRight:
{t.client && <p style={{ fontSize: 12, color: C.textMuted, marginTop: 4
</div>
<button className="btn-ghost-green" onClick={() => promoteAi(t.id)} style
</div>
))}
</div>
)}
{/* Tasks — unified list, drag to reorder */}
{countableTasks.length > 0 && (
<div style={{ marginBottom: 12 }}>
<div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransfor
<div style={{ background: C.card, borderRadius: 14, padding: "0 16px", margin
{getSortedTasks().map((t, ti, arr) => {
return (
<div key={t.id} style={{ display: "flex", gap: 12, padding: "14px 0", ali
<div onClick={() => toggleTask(t.id)} style={{ width: 22, height: 22, b
{t.done && <span style={{ color: "#fff", fontSize: 12, fontWeight: 70
</div>
<div style={{ flex: 1 }}>
<p style={{ fontSize: 14, fontWeight: 500, color: t.done ? C.textMute
{(t.client || t.recurring) && <div style={{ display: "flex", alignIte
{t.client && <span style={{ fontSize: 12, color: C.textMuted }}>{t.
{t.recurring && <span style={{ fontSize: 8, color: C.textMuted, fon
</div>}
</div>
<button onClick={(e) => { e.stopPropagation(); { setTasks(tasks.filter(
</div>
);
})}
</div>
</div>
)}
{tasksDone === tasksTotal && tasksTotal > 0 && <div style={{ background: C.heroGr
</div>
{/* RIGHT — Rai mini chat */}
<RaiMiniPanel />
</div>
</div>
)}
{/* ═══ SWEEPS (ENTERPRISE) ═══ */}
{page === "sweeps" && tier === "enterprise" && (
<div>
<h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBotto
<p style={{ fontSize: 14, color: C.textMuted, marginBottom: 16 }}>Daily Sweep · A
{/* Alerts */}
{sweepTasks.filter(t => t.priority === "urgent").length > 0 && (
<div style={{ marginBottom: 16 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: C.danger, textTransform:
{sweepTasks.filter(t => t.priority === "urgent").map(t => (
<div key={t.id} style={{ background: "#FAE8E4", borderRadius: 12, border: "
<div style={{ display: "flex", justifyContent: "space-between", marginBot
<span style={{ fontSize: 14, fontWeight: 700, color: C.danger }}>CRITIC
</div>
<div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{t.sig
<p style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{t.action}</p
</div>
))}
</div>
)}
C.bord
{/* Priority Ranking */}
<div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "up
<div style={{ background: C.card, borderRadius: 14, border: "1px solid " + {/* Header row */}
<div style={{ display: "flex", padding: "10px 16px", borderBottom: "1px solid "
<span style={{ width: 28 }}>#</span>
<span style={{ flex: 1 }}>Client</span>
<span style={{ width: 50, textAlign: "right" }}>Score</span>
<span style={{ width: 50, textAlign: "right" }}>Drift</span>
<span style={{ width: 80, textAlign: "right" }}>Outlook</span>
<span style={{ width: 90, textAlign: "right", display: "none" }} className="r
</div>
{[...enterpriseClients].sort((a, b) => b.ret - a.ret).map((c, i) => {
const e = c.enterprise;
const drift = c.ret - e.prior_baseline;
const outlookLabel = { long_term: "Long-term", strong: "Strong", uncertain: "
const archLabel = { slow_fade: "Slow Fade", tone_shift: "Tone Shift", silent_
const scoreColor = c.ret > 80 ? C.success : c.ret > 65 ? C.text : c.ret > 50
return (
<div key={c.id} className="row-hover" onClick={() => { setSelectedClient(c)
<span style={{ width: 28, fontSize: 12, color: C.textMuted }}>{i + 1}</sp
<div style={{ flex: 1 }}>
<span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
<div style={{ fontSize: 12, color: C.textMuted }}>{c.contact}</div>
</div>
<span style={{ width: 50, textAlign: "right", fontSize: 14, fontWeight: 7
<span style={{ width: 50, textAlign: "right", fontSize: 12, fontWeight: 6
<span style={{ width: 80, textAlign: "right", fontSize: 12, fontWeight: 6
</div>
);
})}
</div>
{/* Tasks from Sweep */}
<div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "up
{sweepTasks.filter(t => t.priority !== "urgent").map(t => (
<div key={t.id} style={{ background: C.card, borderRadius: 12, border: "1px sol
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "
<span style={{ fontSize: 14, fontWeight: 600 }}>{t.client}</span>
<span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 4, fontWeig
</div>
<div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{t.signal}
<p style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{t.action}</p>
</div>
))}
{/* Sweep History */}
<div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: "up
<div style={{ background: C.card, borderRadius: 14, border: "1px solid " + C.bord
{sweepHistory.map((s, i) => (
<div key={i} style={{ padding: "12px 16px", borderBottom: i < sweepHistory.le
<span style={{ fontSize: 14, fontWeight: 600 }}>{s.date}</span>
<span style={{ fontSize: 12, color: C.textMuted }}>{s.clients} clients · Av
</div>
))}
</div>
</div>
)}
{/* ═══ CLIENTS ═══ */}
{page === "clients" && (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex
<div><h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marg
<div style={{ display: "flex", gap: 8 }}>
{tier === "enterprise" && (
<button onClick={() => { setShowImport(!showImport); setShowAddClient(false
)}
<button className="r-btn" onClick={() => { setShowAddClient(true); setShowImp
</div>
</div>
<div className="r-today-cols" style={{ display: "flex", gap: 24 }}>
<div className="r-today-panel" style={{ width: 270, flexShrink: 0 }}>
<PortfolioPanel />
</div>
<div style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>
{/* Import Clients (Enterprise) */}
{showImport && tier === "enterprise" && (
<div style={{ background: C.card, borderRadius: 14, border: "1.5px solid " + C.
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "
<div style={{ fontSize: 14, fontWeight: 700 }}>Import Clients</div>
<button onClick={() => { setShowImport(false); setImportPreview([]); </div>
setImp
{/* Tab toggle */}
<div style={{ display: "flex", gap: 0, marginBottom: 16, background: C.surfac
{[{ id: "csv", label: "Upload CSV" }, { id: "paste", label: "Paste from Spr
<button key={t.id} onClick={() => { setImportTab(t.id); setImportPreview(
))}
</div>
{/* CSV Upload */}
{importTab === "csv" && (
<div>
<div
onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColo
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
const headers = lines[0].split(",").map(h => h.trim().replace(/"/
const rows = lines.slice(1).map(line => {
const cols = line.split(",").map(c => c.trim().replace(/"/g, ""
return { name: cols[0] || "", contact: cols[1] || "", email: co
});
setImportPreview(rows);
};
reader.readAsText(file);
}
}}
style={{ border: "2px dashed " + C.border, borderRadius: 10, padding: "
>
{importFile ? (
<div>
<div style={{ fontSize: 14, fontWeight: 600 }}> {importFile.name}
<div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{im
</div>
) : (
<div>
<div style={{ fontSize: 24, marginBottom: 8 }}> </div>
<div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Dra
<div style={{ fontSize: 12, color: C.textMuted }}>or <label style={
const file = e.target.files[0];
if (file) {
setImportFile(file);
const reader = new FileReader();
reader.onload = (ev) => {
const lines = ev.target.result.split("\n").filter(l => l.trim
const rows = lines.slice(1).map(line => {
const cols = line.split(",").map(c => c.trim().replace(/"/g
return { name: cols[0] || "", contact: cols[1] || "", email
});
setImportPreview(rows);
};
reader.readAsText(file);
}
}} /></label></div>
<div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 </div>
}}>Exp
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
const cols = line.split(/\t|,/).map(c => c.trim().replace(/"/g, "")
return { name: cols[0] || "", contact: cols[1] || "", email: cols[2
});
setImportPreview(rows);
}}
placeholder={"Business Name\tContact Name\tEmail\tRole\tIndustry\tReven
rows={6}
style={{ width: "100%", padding: "12px 14px", border: "1.5px solid " +
/>
</div>
<div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>Paste row
)}
{/* Preview Table */}
{importPreview.length > 0 && (
<div style={{ marginTop: 16 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransf
<div style={{ background: C.bg, borderRadius: 10, border: "1px solid " +
{/* Header */}
<div style={{ display: "flex", padding: "8px 12px", borderBottom: "1px
<span style={{ width: 24 }}></span>
<span style={{ flex: 2, minWidth: 0 }}>Business</span>
<span style={{ flex: 2, minWidth: 0 }}>Contact</span>
<span style={{ flex: 2, minWidth: 0 }}>Email</span>
<span style={{ flex: 1, minWidth: 0 }}>Role</span>
</div>
{importPreview.slice(0, 10).map((r, i) => (
<div key={i} style={{ display: "flex", padding: "8px 12px", borderBot
<span style={{ width: 24, color: r.valid ? C.success : C.danger, fo
<span style={{ flex: 2, minWidth: 0, fontWeight: 600, overflow: "hi
<span style={{ flex: 2, minWidth: 0, overflow: "hidden", textOverfl
<span style={{ flex: 2, minWidth: 0, overflow: "hidden", textOverfl
<span style={{ flex: 1, minWidth: 0, color: C.textMuted }}>{r.role
</div>
))}
{importPreview.length > 10 && (
<div style={{ padding: "8px 12px", fontSize: 12, color: C.textMuted,
)}
</div>
{importPreview.some(r => !r.valid) && (
<div style={{ fontSize: 12, color: C.danger, marginTop: 6 }}>{importPre
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
}} style={{ flex: 1, padding: "10px", background: C.btn, color: "#fff", b
<button onClick={() => { setShowImport(false); setImportPreview([]); setI
</div>
)}
</div>
)}
+ C.pr
{/* Add Client Flow */}
{showAddClient && (
<div style={{ background: C.card, borderRadius: 14, border: "2px solid " {profileStep === 0 && (
<div>
<h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>New Clien
<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
<input value={newClient.name} onChange={e => setNewClient({...newClient
<input value={newClient.contact} onChange={e => setNewClient({...newCli
<input value={newClient.role} onChange={e => setNewClient({...newClient
<input value={newClient.tag} onChange={e => setNewClient({...newClient,
<input value={newClient.months} onChange={e => setNewClient({...newClie
<input value={newClient.revenue} onChange={e => setNewClient({...newCli
</div>
<div style={{ display: "flex", gap: 8, marginTop: 14 }}>
<button className="r-btn" onClick={() => { if (newClient.name && newCli
<button onClick={() => { setShowAddClient(false); setProfileStep(0); se
</div>
</div>
)}
<div style={{ display: "flex", justifyContent: "space-between", alignItem
<h3 style={{ fontSize: 14, fontWeight: 800 }}>Relationship Profile</h3>
<span style={{ fontSize: 12, color: C.textMuted }}>{profileStep} of 12<
{profileStep >= 1 && profileStep <= 12 && (
<div>
</div>
<div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
{profileDimensions.map((_, i) => (
<div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background
))}
</div>
{(() => {
const dim = profileDimensions[profileStep - 1];
const current = profileScores[dim.key];
return (
<div>
<p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{dim.
<p style={{ fontSize: 12, color: C.textSec, marginBottom: 14 <div style={{ textAlign: "center", marginBottom: 8 }}>
<span style={{ fontSize: 32, fontWeight: 900, color: current !==
</div>
<div style={{ padding: "0 4px", marginBottom: 6 }}>
<input type="range" min="0" max="10" value={current !== undefined
<style>{`input[type="range"]::-webkit-slider-thumb { -webkit-appe
</div>
<div style={{ display: "flex", justifyContent: "space-between", fon
<span>{dim.left}</span><span>{dim.right}</span>
</div>
<div style={{ display: "flex", gap: 8 }}>
<button onClick={() => setProfileStep(profileStep - 1)} style={{
<button className="r-btn" onClick={() => { if (current !== undefi
</div>
</div>
}}>{di
);
})()}
</div>
)}
{profileStep === 13 && (
<div>
<h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Review</h
<div style={{ background: C.bg, borderRadius: 10, padding: "14px", margin
<div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{newCli
<div style={{ fontSize: 12, color: C.textMuted }}>{newClient.contact} ·
{newClient.tag && <div style={{ fontSize: 12, color: C.textMuted, margi
</div>
<div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Relations
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, ma
{profileDimensions.map(d => (
<div key={d.key} style={{ display: "flex", justifyContent: "space-bet
<span style={{ color: C.textSec }}>{d.name}</span>
<span style={{ fontWeight: 700, color: C.primary }}>{profileScores[
</div>
))}
</div>
<div style={{ fontSize: 12, color: C.textMuted, textAlign: "center", marg
{(() => {
const b = calcRetentionScore(profileScores, null) || 50;
const label = b >= 75 ? "Strong" : b >= 55 ? "Stable" : b >= 35 ? "Wa
const color = b >= 75 ? C.success : b >= 55 ? C.warning : C.danger;
return <span>Starting Signal: <span style={{ fontWeight: 700, color }
})()}
</div>
<div style={{ display: "flex", gap: 8 }}>
<button onClick={() => setProfileStep(12)} style={{ padding: "10px 14px
<button className="r-btn" onClick={submitNewClient} style={{ flex: 1, p
</div>
</div>
)}
</div>
)}
{/* Client Search */}
{clients.length > 5 && (
<div style={{ marginBottom: 12, overflow: "hidden" }}>
<input value={clientSearch} onChange={e => setClientSearch(e.target.value)} p
</div>
)}
<div style={{ background: C.card, borderRadius: 14, border: "1px solid " + C.bord
{clients.filter(c => !clientSearch || c.name.toLowerCase().includes(clientSearc
<div key={c.id} className="row-hover" onClick={() => { setSelectedClient(c);
<ScoreRing score={c.ret} size={44} strokeWidth={4} />
<div style={{ flex: 1, minWidth: 0 }}>
<div style={{ fontSize: 15, fontWeight: 700 }}>{c.name}</div>
<div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{c.contac
</div>
<div style={{ textAlign: "right", flexShrink: 0 }}>
<div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>${(c.revenu
<div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>${Math.ro
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
{ q: "Has anything changed with this relationship?", weight: 0.40, options: [{ te
{ q: "Is this relationship better or worse than last month?", weight: 0.20, optio
{ q: "Has the way this client communicates with you changed?", weight: 0.20, opti
{ q: "If they cancelled tomorrow, would you be surprised?", weight: 0.10, options
{ q: "Is this client getting more or less value from your work than last quarter?
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
const driftColor = (d) => d === "Improving" ? C.success : d === "Stable" ? C.primar
const driftBg = (d) => d === "Improving" ? "#D1FAE5" : d === "Stable" ? C.primarySo
const submitHc = async (client) => {
const answers = hcAnswers[client] || [];
const drift = calcDrift(answers);
// Update local state
setClientDrift(prev => ({ ...prev, [client]: drift }));
setClients(prev => prev.map(x => x.name === client ? { ...x, lastHC: new Date().t
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
await clientsDb.updateDrift(clientObj.id, drift, new Date().toISOString().split
}
};
const activeQueue = hcQueue.filter(h => (h.overdue > 0 || h.due === "Today") && !hc
const justCompleted = hcQueue.filter(h => (h.overdue > 0 || h.due === "Today") && h
const upcomingQueue = hcQueue.filter(h => h.overdue === 0 && h.due !== "Today");
return (
<div>
<h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBot
<p style={{ fontSize: 14, color: C.textMuted, marginBottom: 20 }}>Monthly caden
<div className="r-today-cols" style={{ display: "flex", gap: 24 }}>
<div className="r-today-panel" style={{ width: 270, flexShrink: 0 }}>
<PortfolioPanel />
</div>
<div style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>
{activeQueue.length === 0 && justCompleted.length === 0 && (
<div style={{ textAlign: "center", padding: "40px 20px" }}>
<p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>All caught up
<p style={{ fontSize: 12, color: C.textMuted }}>No health checks due right
</div>
)}
{/* Active Queue — Card Stack */}
<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
{activeQueue.map((h, i) => {
const isOpen = hcOpen === h.client;
const step = hcStep[h.client] || 0;
const answers = hcAnswers[h.client] || [];
const allAnswered = answers.length === 5 && answers.every(a => a !== undefi
return (
<div key={i} style={{ background: C.card, borderRadius: 14, border: "1.5p
<div onClick={() => setHcOpen(isOpen ? null : h.client)} style={{ displ
<div>
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
<span style={{ fontSize: 15, fontWeight: 700 }}>{h.client}</span>
<span style={{ fontSize: 13, fontWeight: 700, fontFamily: "monosp
</div>
<div style={{ fontSize: 13, color: h.overdue > 0 ? C.danger : C.war
{h.overdue > 0 ? `Overdue by ${h.overdue}d` : "Due today"}
</div>
</div>
{!isOpen && (
<button className="r-btn" style={{ padding: "10px 22px", background
)}
</div>
{/* Expanded HC Flow */}
{isOpen && (
<div style={{ padding: "0 18px 18px" }}>
{/* Progress */}
<div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
{Array.from({ length: hcQuestions.length }).map((_, qi) => (
<div key={qi} style={{ flex: 1, height: 3, borderRadius: 2, bac
))}
</div>
{/* Current question */}
{step < hcQuestions.length && (
<div style={{ marginBottom: 12 }}>
<p style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, li
<div style={{ display: "flex", flexDirection: "column", gap: 8
{hcQuestions[step].options.map((opt, oi) => {
const isSelected = answers[step] === opt.mod;
return (
<div key={oi} onClick={() => selectAnswer(h.client, step,
padding: "14px 16px", borderRadius: 10, cursor: "pointe
background: isSelected ? C.primarySoft : C.bg,
border: "1.5px solid " + (isSelected ? C.primary : C.bo
fontSize: 15, color: isSelected ? C.primary : C.textSec
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
<div style={{ display: "flex", justifyContent: "space-between", a
<button onClick={() => step > 0 && setHcStep({ ...hcStep, [h.cl
<span style={{ fontSize: 12, color: C.textMuted }}>{step + 1} o
{(() => {
const answered = answers[step] !== undefined;
return <button onClick={() => answered && setHcStep({ ...hcSt
})()}
</div>
)}
{/* Auto-close on completion */}
{step >= hcQuestions.length && allAnswered && (() => {
if (!hcDone[h.client]) {
setTimeout(() => submitHc(h.client), 0);
}
})()}
</div>
return null;
)}
</div>
);
})}
</div>
{/* Done Today */}
{justCompleted.length > 0 && (
<div style={{ marginTop: 24 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransf
<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
{justCompleted.map((h, i) => {
const drift = clientDrift[h.client];
return (
<div key={"done-" + i} style={{ background: C.card, borderRadius: 12,
<div>
<span style={{ fontSize: 14, fontWeight: 600, color: C.textMuted,
<div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>Comple
</div>
{drift && (
<span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px"
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
<div className="row-hover" onClick={() => setShowUpcoming(!showUpcoming)} s
<span style={{ fontSize: 13, fontWeight: 600, color: C.textMuted }}>Upcom
</div>
{showUpcoming && (
<div style={{ background: C.card, borderRadius: 12, border: "1px solid "
{upcomingQueue.map((h, i) => (
<div key={i} style={{ display: "flex", justifyContent: "space-between
<span style={{ fontSize: 13, color: C.textMuted }}>{h.client}</span
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
<h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBotto
<p style={{ fontSize: 14, color: C.textMuted, marginBottom: 16 }}>Rai analyzes yo
{/* Summary stats */}
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margi
{[
{ l: "Ready to Ask", v: referralReadiness.filter(r => r.tier === "ready").len
{ l: "Building", v: referralReadiness.filter(r => r.tier === "building").leng
{ l: "Not Yet", v: referralReadiness.filter(r => r.tier === "not_yet").length
].map((s, i) => (
<div key={i} style={{ background: C.card, borderRadius: 10, padding: "12px 14
<div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransf
<div style={{ fontSize: 24, fontWeight: 800, color: s.c }}>{s.v}</div>
</div>
))}
</div>
<span style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</span>
<span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8 }}>{c.
{/* Ready to Ask */}
{referralReadiness.filter(r => r.tier === "ready").length > 0 && (
<div style={{ marginBottom: 20 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: C.success, textTransform:
{referralReadiness.filter(r => r.tier === "ready").map(c => (
<div key={c.id} style={{ background: C.card, borderRadius: 12, border: "1px
<div style={{ display: "flex", justifyContent: "space-between", alignItem
<div>
</div>
<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
<span style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace"
<span style={{ fontSize: 12, color: C.textMuted }}>ready</span>
</div>
</div>
<div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10
{c.reasons.map((r, ri) => (
<span key={ri} style={{ fontSize: 12, padding: "3px 10px", borderRadi
))}
</div>
<div style={{ background: C.raiGrad, borderRadius: 12, padding: "14px 16p
<div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase"
<p style={{ fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,.7
</div>
<button className="r-btn" onClick={() => { setPage("coach"); setAiMessage
</div>
))}
</div>
)}
{/* Building Toward It */}
{referralReadiness.filter(r => r.tier === "building").length > 0 && (
<div style={{ marginBottom: 20 }}>
<span style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</span>
<span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8 }}>{c.
<div style={{ fontSize: 12, fontWeight: 700, color: C.warning, textTransform:
{referralReadiness.filter(r => r.tier === "building").map(c => (
<div key={c.id} style={{ background: C.card, borderRadius: 12, border: "1px
<div style={{ display: "flex", justifyContent: "space-between", alignItem
<div>
</div>
<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
<span style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace"
<span style={{ fontSize: 12, color: C.textMuted }}>ready</span>
</div>
</div>
<div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10
{c.reasons.map((r, ri) => (
<span key={ri} style={{ fontSize: 12, padding: "3px 10px", borderRadi
))}
</div>
<p style={{ fontSize: 14, color: C.textSec, lineHeight: 1.5 }}>{c.approac
</div>
))}
</div>
)}
" + C.
=> (
{/* Not Yet */}
{referralReadiness.filter(r => r.tier === "not_yet").length > 0 && (
<div>
<div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransfor
<div style={{ background: C.card, borderRadius: 12, border: "1px solid {referralReadiness.filter(r => r.tier === "not_yet").map((c, i, arr) <div key={c.id} style={{ padding: "12px 16px", borderBottom: i < arr.leng
<div>
</div>
<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
<span style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace"
<span style={{ fontSize: 12, color: C.textMuted }}>{c.approach.split(
</div>
</div>
<span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
<span style={{ fontSize: 12, color: C.textMuted, marginLeft: 8 }}>{c.
))}
</div>
</div>
)}
{/* Rai blanket */}
<div style={{ background: C.raiGrad, borderRadius: 14, padding: "16px 18px", colo
<div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letter
<p style={{ fontSize: 14, color: "rgba(255,255,255,.7)", lineHeight: 1.55 }}>Re
<button className="r-btn" onClick={() => { setPage("coach"); setAiMessages([{ r
</div>
</div>
)}
{/* ═══ REFERRALS ═══ */}
{page === "referrals" && (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex
<div>
<h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginB
<p style={{ fontSize: 14, color: C.textMuted, marginBottom: 4 }}>Your clients
</div>
<button className="r-btn" onClick={() => setRefForm(true)} style={{ padding: "1
</div>
<div className="r-today-cols" style={{ display: "flex", gap: 24 }}>
<div className="r-today-panel" style={{ width: 270, flexShrink: 0 }}>
<ReferralsPanel />
</div>
<div style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>
{/* Stats */}
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margi
{[{ l: "Total", v: refs.length }, { l: "Active", v: refsConverted.length, c: C.
<div key={i} style={{ background: C.card, borderRadius: 10, padding: "12px 14
<div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, textTransf
<div style={{ fontSize: 24, fontWeight: 800, color: s.c || C.text }}>{s.v}<
</div>
))}
</div>
{/* Search */}
{refs.length > 15 && (
<div style={{ marginBottom: 12 }}>
<input value={refSearch} onChange={e => setRefSearch(e.target.value)} placeho
</div>
)}
{/* Add referral */}
{refForm ? (
<div style={{ background: C.card, borderRadius: 12, border: "1.5px solid " + C.
<div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>New Referral
<div style={{ marginBottom: 10 }}>
<label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display:
<input value={refName} onChange={e => setRefName(e.target.value)} placehold
</div>
<div style={{ marginBottom: 10 }}>
<label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display:
<div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
{[...clients].sort((a, b) => b.ret - a.ret).map(c => (
<span key={c.id} onClick={() => setRefFrom(c.name)} style={{ fontSize:
))}
</div>
</div>
<div style={{ marginBottom: 14 }}>
<label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display:
<div style={{ display: "flex", gap: 6 }}>
{[{ id: "converted", label: "Active" }, { id: "closed", label: "Closed" }
const sel = refStatus === s.id;
const isRed = s.id === "closed";
return (
<button key={s.id} onClick={() => setRefStatus(s.id)} style={{ padding:
);
})}
</div>
</div>
<div style={{ marginBottom: 14 }}>
<label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, display:
<input type="number" value={refRevenue} onChange={e => setRefRevenue(e.targ
</div>
{refStatus === "closed" && (
<div style={{ marginBottom: 14 }}>
<label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, displa
<input type="number" value={refTotalRevenue} onChange={e => setRefTotalRe
</div>
)}
style=
<div style={{ display: "flex", gap: 8 }}>
{(() => {
const ready = refName.trim() && refFrom;
return <button className="r-btn" onClick={() => ready && addRef()} })()}
<button onClick={() => { setRefForm(false); setRefName(""); setRefFrom("");
</div>
</div>
) : null}
{/* Referral log */}
<div style={{ background: C.card, borderRadius: 14, border: "1px solid " + C.bord
{refs.filter(r => !refSearch || r.to.toLowerCase().includes(refSearch.toLowerCa
<div key={r.id || i} className="row-hover" onClick={() => { setRefEditing(r.i
<div style={{ flex: 1, minWidth: 0 }}>
<div style={{ fontSize: 15, fontWeight: 700 }}>{r.to}</div>
<div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Referred
</div>
<div style={{ textAlign: "right", flexShrink: 0 }}>
<span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 4, fontWe
{(r.revenue > 0 || r.totalRevenue > 0) && <div style={{ fontSize: 12, col
</div>
</div>
))}
</div>
{/* AI insight */}
<div style={{ background: C.raiGrad, borderRadius: 14, padding: "22px", color: "#
<div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}
<p style={{ fontSize: 14, color: "rgba(255,255,255,.7)", lineHeight: 1.6, margi
<button className="r-btn" onClick={() => { setPage("coach"); setAiMessages([{ r
</div>
</div>
<RaiMiniPanel />
</div>
</div>
)}
{/* ═══ ROLODEX ═══ */}
{page === "retros" && (() => {
const formerQuestions = [
{ key: "what", label: "What happened?", placeholder: "Contract ended, budget cut,
{ key: "terms", label: "How did it end?", placeholder: "Good terms, neutral, roug
{ key: "comeback", label: "Would they come back?", placeholder: "Yes, maybe, no.
{ key: "refer", label: "Would they refer you?", placeholder: "Even if they left,
];
const oneoffQuestions = [
{ key: "work", label: "What did you do for them?", placeholder: "Site audit, one-
{ key: "refer", label: "Would they refer you?", placeholder: "Even a one-time cli
];
const pendingFormer = rolodex.filter(r => r.type === "former" && !r.priority);
const pendingOneoff = rolodex.filter(r => r.type === "oneoff" && !r.priority);
const pending = [...pendingFormer, ...pendingOneoff];
const searchFilter = (r) => !rolodexSearch || r.client.toLowerCase().includes(rolod
const saved = rolodex.filter(r => r.priority && searchFilter(r));
const savedHigh = saved.filter(r => r.priority === "high");
const savedMedium = saved.filter(r => r.priority === "medium");
const savedLow = saved.filter(r => r.priority === "low");
const priorityLabel = (p) => p === "high" ? "High priority" : p === "medium" ? "Med
const priorityColor = (p) => p === "high" ? C.success : p === "medium" ? C.warning
<h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margi
<p style={{ fontSize: 14, color: C.textMuted }}>People you've worked with.
return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "fl
<div>
</div>
<button className="r-btn" onClick={() => setShowAddRolodex(true)} style={{ pa
</div>
<div className="r-today-cols" style={{ display: "flex", gap: 24 }}>
<div className="r-today-panel" style={{ width: 270, flexShrink: 0 }}>
<RolodexPanel />
</div>
<div style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>
{/* Add to Rolodex — one-off entry */}
{showAddRolodex && (
<div style={{ background: C.card, borderRadius: 14, border: "2px solid " + C.
<h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Add to Rolod
<p style={{ fontSize: 14, color: C.textMuted, marginBottom: 12 }}>One-time
<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
<input value={newRolodexEntry.client} onChange={e => setNewRolodexEntry({
<input value={newRolodexEntry.contact} onChange={e => setNewRolodexEntry(
<input value={newRolodexEntry.work} onChange={e => setNewRolodexEntry({..
</div>
<div style={{ display: "flex", gap: 8, marginTop: 14 }}>
{(() => {
const ready = newRolodexEntry.client.trim() && newRolodexEntry.contact.
return <button className="r-btn" onClick={async () => { if (ready) { co
const { data: createdRolodex } = await rolodexDb.create(user.id, {
client_name: newEntry.client,
contact_name: newEntry.contact,
type: "oneoff",
date_added: newEntry.date,
notes: newEntry.work,
});
newEntry.id = createdRolodex?.id || Date.now();
setRolodex(prev => [...prev, newEntry]); setNewRolodexEntry({ client: "", con
})()}
<button onClick={() => { setShowAddRolodex(false); setNewRolodexEntry({ c
</div>
</div>
)}
{/* Pending — need to complete flow */}
{pending.length > 0 && (
<div style={{ marginBottom: 16 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransfor
<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
{pending.map((r) => {
const isOpen = rolodexFlowOpen === r.id;
const answers = retroAnswers[r.id] || {};
const questions = r.type === "former" ? formerQuestions : oneoffQuestio
const step = retroStep;
const allQuestionsAnswered = questions.every(q => (answers[q.key] || ""
const priorityPicked = answers._priority;
const totalSteps = questions.length + 1;
return (
<div key={r.id} style={{ background: C.card, borderRadius: 12, border
<div onClick={() => setRolodexFlowOpen(isOpen ? null : r.id)} style
<div>
<span style={{ fontSize: 14, fontWeight: 600 }}>{r.client}</spa
<div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}
</div>
{!isOpen && <button className="r-btn" style={{ padding: "6px 14px
</div>
{isOpen && (
<div style={{ padding: "0 16px 16px" }}>
<div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
{Array.from({ length: totalSteps }).map((_, qi) => (
<div key={qi} style={{ flex: 1, height: 3, borderRadius: 2,
))}
</div>
{step < questions.length && (
<div style={{ marginBottom: 12 }}>
<p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8,
<textarea value={answers[questions[step].key] || ""} onChan
const updated = { ...answers, [questions[step].key]: e.ta
setRetroAnswers({ ...retroAnswers, [r.id]: updated // Debounced persist handled on priority save
});
})()} placeholder={questions[step].placeholder} style={{ wi
</div>
)}
{step >= questions.length && (
<div style={{ marginBottom: 12 }}>
{!priorityPicked && (
<div>
<p style={{ fontSize: 14, fontWeight: 700, marginBottom
<p style={{ fontSize: 12, color: C.textMuted, marginBot
<div style={{ display: "flex", flexDirection: "column",
{[
{ id: "high", label: "High priority", desc: "Warm l
{ id: "medium", label: "Medium priority", desc: "Wo
{ id: "low", label: "Low priority", desc: "Long sho
].map(opt => (
<button key={opt.id} onClick={() => {
const tags = [];
if ((answers.terms || "").toLowerCase().includes(
if ((answers.refer || "").toLowerCase().includes(
if ((answers.comeback || "").toLowerCase().includ
if (r.type === "oneoff") tags.push("One-off");
setRolodex(prev => prev.map(x => x.id === r.id ?
setRetroAnswers({ ...retroAnswers, [r.id]: { ...a
// Persist priority + answers
rolodexDb.update(r.id, { priority: opt.id, retro_
}} style={{ padding: "12px 14px", borderRadius: 8,
<span style={{ fontSize: 14, fontWeight: 600, col
<span style={{ display: "block", fontSize: 12, co
</button>
))}
</div>
</div>
)}
{priorityPicked && (
<div>
<div style={{ background: C.raiGrad, borderRadius: 12,
<div style={{ fontSize: 12, fontWeight: 600, textTran
<p style={{ fontSize: 14, lineHeight: 1.55, color: "r
</div>
<button className="r-btn" onClick={() => { setRolodexFl
</div>
)}
</div>
)}
{step < questions.length && (
<div style={{ display: "flex", justifyContent: "space-between
<button onClick={() => step > 0 && setRetroStep(step <span style={{ fontSize: 12, color: C.textMuted }}>{step +
{(() => {
- 1)}
const answered = (answers[questions[step].key] || "").tri
return <button onClick={() => answered && setRetroStep(st
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
<input value={rolodexSearch} onChange={e => setRolodexSearch(e.target.value
</div>
)}
{/* Saved — grouped by priority */}
{saved.length > 0 && (
<div>
{[
textTr
solid
{ key: "high", items: savedHigh, label: "High priority", color: C.success
{ key: "medium", items: savedMedium, label: "Medium priority", color: C.w
{ key: "low", items: savedLow, label: "Low priority", color: C.textMuted
].filter(g => g.items.length > 0).map(group => (
<div key={group.key} style={{ marginBottom: 16 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: group.color, <div style={{ background: C.card, borderRadius: 14, border: "1px {group.items.map((r, i) => {
const answers = retroAnswers[r.id] || {};
const summary = r.type === "former" ? (answers.what || answers.term
return (
<div key={r.id} className="row-hover" onClick={() => { setSelectedR
<div style={{ display: "flex", alignItems: "center", gap: 8, marg
<span style={{ fontSize: 15, fontWeight: 700 }}>{r.client}</spa
<span style={{ fontSize: 11, padding: "2px 8px", borderRadius:
</div>
<div style={{ fontSize: 12, color: C.textMuted, marginBottom: (r.
{r.tags && r.tags.length > 0 && (
<div style={{ display: "flex", gap: 4, flexWrap: "wrap", {r.tags.map((t, ti) => (
<span key={ti} style={{ fontSize: 11, padding: "2px 8px", b
))}
margin
</div>
)}
{summary && (
<p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.4, fo
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
<div style={{ fontSize: 32, marginBottom: 12 }}> </div>
<p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Your Rolodex
<p style={{ fontSize: 12, color: C.textMuted, marginBottom: 16 }}>Move clie
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
<div className="r-rai-page" style={{ display: "flex", flexDirection: "column", minH
<div className="r-rai-scroll" style={{ flex: 1, overflow: "auto", WebkitOverflowS
<div className="r-rai-inner" style={{ width: "100%", maxWidth: 720, margin: "0
{aiMessages.length === 0 ? (
<div>
<p style={{ fontSize: 22, fontWeight: 500, color: C.text, lineHeight: 1.4
<div style={{ background: C.card, border: "1.5px solid " + C.border, bord
<textarea value={aiInput} onChange={e => { setAiInput(e.target.value);
<div style={{ display: "flex", justifyContent: "flex-end", alignItems:
<button onClick={() => sendAi()} disabled={!aiInput.trim()} style={{
<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d
</button>
</div>
</div>
<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
{Object.keys(coachDemos).slice(0, 4).map((s, i) => (
<div key={i} className="card-hover" onClick={() => sendAi(s)} style={
))}
</div>
</div>
) : (
<div style={{ paddingBottom: 200 }}>
{aiMessages.map((m, i) => {
const isLastUser = m.role === "user" && i === aiMessages.length - 1;
const messageRef = isLastUser ? aiUserRef : null;
return m.role === "user" ? (
<div key={i} ref={messageRef} className="r-chat-msg-user" style={{ ma
<div style={{ maxWidth: "75%", background: C.surface, borderRadius:
{m.text.split("\n").map((l, j) => l.trim() === "" ? <div key={j}
</div>
</div>
) : (
<div key={i} style={{ marginBottom: 28 }}>
<RaiMarkdown text={m.text} size={17} lineHeight={1.55} />
</div>
);
})}
{aiTyping && <div style={{ marginBottom: 28, display: "flex", gap: <div ref={aiEndRef} />
</div>
4, pad
)}
</div>
</div>
{/* Input bar — fixed bottom once conversation started */}
{aiMessages.length > 0 && (
<div className="r-rai-inputbar" style={{ background: C.bg, padding: "12px 24px
<div style={{ maxWidth: 720, margin: "0 auto" }}>
<div style={{ background: C.card, border: "1.5px solid " + C.border, border
<textarea value={aiInput} onChange={e => { setAiInput(e.target.value); e.
<div style={{ display: "flex", justifyContent: "flex-end", alignItems: "c
<button onClick={() => sendAi()} disabled={!aiInput.trim()} style={{ wi
<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="
</button>
</div>
</div>
<p style={{ fontSize: 11, color: C.textMuted, textAlign: "center", marginTo
</div>
</div>
)}
</div>
)}
{/* ═══ SETTINGS ═══ */}
{page === "settings" && (
<div>
<h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBotto
{[{ title: "Account", desc: "Name, email, password" }, { title: "Notifications",
<div key={i} className="row-hover" style={{ background: C.card, borderRadius: 1
<div><div style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div><div style
<Icon name="chevron" size={16} color={C.border} />
</div>
))}
{/* Enterprise: Integrations */}
{tier === "enterprise" && (
<div style={{ marginTop: 20 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform:
{integrations.map((cat, ci) => (
<div key={ci} style={{ marginBottom: 16 }}>
<div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, marginBo
<div style={{ background: C.card, borderRadius: 12, border: "1px solid "
{cat.items.map((item, ii) => (
<div key={ii} className="row-hover" style={{ display: "flex", justify
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
<span style={{ fontSize: 14, width: 24, textAlign: "center" }}>{i
<span style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</span
</div>
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
{item.connected ? (
<span style={{ fontSize: 12, color: C.success, fontWeight: 600
) : (
<button className="r-btn" style={{ padding: "5px 14px", backgro
)}
</div>
</div>
))}
</div>
</div>
))}
" + C.
{/* Sweep Schedule */}
<div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform:
<div style={{ background: C.card, borderRadius: 12, border: "1px solid <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItem
<span style={{ fontSize: 14, fontWeight: 600 }}>Frequency</span>
<select style={{ padding: "6px 12px", border: "1.5px solid " + C.border
<option>Daily</option><option>Twice daily</option><option>Weekly (Mon
</select>
</div>
<div style={{ display: "flex", justifyContent: "space-between", alignItem
<span style={{ fontSize: 14, fontWeight: 600 }}>Time</span>
<select style={{ padding: "6px 12px", border: "1.5px solid " + C.border
<option>6:00 AM</option><option>7:00 AM</option><option>8:00 AM</opti
</select>
</div>
<div style={{ display: "flex", justifyContent: "space-between", alignItem
<span style={{ fontSize: 14, fontWeight: 600 }}>Timezone</span>
<select style={{ padding: "6px 12px", border: "1.5px solid " + C.border
<option>Eastern</option><option>Central</option><option>Mountain</opt
</select>
</div>
</div>
<div style={{ marginTop: 12, fontSize: 12, color: C.textMuted }}>Last sweep
<div style={{ fontSize: 12, color: C.textMuted }}>Next sweep: Tomorrow at 6
<button className="r-btn" style={{ width: "100%", marginTop: 12, padding: "
</div>
{/* Output Routing */}
<div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform:
<div style={{ background: C.card, borderRadius: 12, border: "1px solid {[
" + C.
{ label: "Retayned Dashboard", checked: true, disabled: true, meta: "Alwa
{ label: "Slack Channel", checked: false, meta: "#retention-alerts" },
{ label: "Webhook URL", checked: false, meta: "https://..." },
{ label: "Email Digest", checked: false, meta: "team@company.com" },
].map((r, ri) => (
<div key={ri} style={{ display: "flex", alignItems: "center", gap: 10, pa
<input type="checkbox" checked={r.checked} disabled={r.disabled} readOn
<span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{r.label}</spa
<span style={{ fontSize: 12, color: C.textMuted }}>{r.meta}</span>
</div>
))}
</div>
" + C.
{/* API Access */}
<div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform:
<div style={{ background: C.card, borderRadius: 12, border: "1px solid <div style={{ display: "flex", justifyContent: "space-between", alignItems:
<div>
<div style={{ fontSize: 14, fontWeight: 600 }}>API Key</div>
<div style={{ fontSize: 12, color: C.textMuted }}>Use this key to authe
</div>
<button className="r-btn" style={{ padding: "6px 14px", background: C.btn
</div>
<div style={{ background: C.bg, borderRadius: 8, padding: "10px 14px", font
<span>sk_live_ret_••••••••••••••••••••a4f2</span>
<button style={{ background: "none", border: "none", fontSize: 12, color:
</div>
<div style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 1
<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
{[
{ method: "GET", path: "/api/sweeps/latest", desc: "Most recent sweep r
{ method: "POST", path: "/api/sweeps/trigger", desc: "Run a sweep now"
{ method: "GET", path: "/api/clients/{id}/signals", desc: "Client autom
{ method: "GET", path: "/api/tasks", desc: "All open tasks" },
{ method: "PATCH", path: "/api/tasks/{id}", desc: "Mark task complete"
{ method: "POST", path: "/api/clients/{id}/analyze", desc: "Trigger ana
{ method: "GET", path: "/api/referrals/readiness", desc: "Referral read
].map((ep, ei) => (
<div key={ei} style={{ display: "flex", alignItems: "center", gap: 8, p
<span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace"
<span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600
<span style={{ fontSize: 12, color: C.textMuted }}>{ep.desc}</span>
</div>
))}
</div>
<div style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 1
<p style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>On every s
<div style={{ background: "#1E261F", borderRadius: 8, padding: "14px", font
<div style={{ color: "#558B68" }}>{"// POST to your webhook URL"}</div>
<div>{"{"}</div>
<div style={{ paddingLeft: 16 }}>{'"sweep_id": "sweep_20260409",'}</div>
<div style={{ paddingLeft: 16 }}>{'"timestamp": "2026-04-09T06:02:00Z",'}
<div style={{ paddingLeft: 16 }}>{'"portfolio_avg_score": 74,'}</div>
<div style={{ paddingLeft: 16 }}>{'"clients_analyzed": 47,'}</div>
<div style={{ paddingLeft: 16 }}>{'"alerts": [{ "client_id": "...", "leve
<div style={{ paddingLeft: 16 }}>{'"tasks": [{ "client_id": "...", "actio
<div style={{ paddingLeft: 16 }}>{'"priority_ranking": [{ "client_id": ".
<div style={{ paddingLeft: 16 }}>{'"data_gaps": [{ "client_id": "...", "m
<div>{"}"}</div>
</div>
</div>
{/* MCP Server */}
<div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform:
<div style={{ background: C.card, borderRadius: 12, border: "1px solid <p style={{ fontSize: 14, color: C.text, lineHeight: 1.5, marginBottom: 12
" + C.
<div style={{ display: "flex", justifyContent: "space-between", alignItems:
<div>
<div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted }}>Serv
<div style={{ fontSize: 12, fontFamily: "monospace", color: C.text, mar
</div>
<button style={{ background: "none", border: "none", fontSize: 12, </div>
color:
<div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Available T
<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
{[
{ tool: "get_priority_ranking", desc: "Full client portfolio ranked by
{ tool: "get_client_risk_assessment", desc: "Single client signals, arc
{ tool: "get_open_tasks", desc: "All pending tasks with priority and co
{ tool: "complete_task", desc: "Mark a task as done" },
{ tool: "trigger_sweep", desc: "Run an immediate portfolio analysis" },
{ tool: "get_referral_readiness", desc: "Clients ranked by referral rea
{ tool: "get_sweep_history", desc: "Historical sweep results and trends
].map((t, ti) => (
<div key={ti} style={{ display: "flex", alignItems: "center", gap: 8, p
<span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700
<span style={{ fontSize: 12, color: C.textMuted, flex: 1 }}>{t.desc}<
</div>
))}
</div>
{/* Sign Out */}
<button onClick={async () => { await supabase.auth.signOut(); }} style={{ width:
<div style={{ background: C.raiGrad, borderRadius: 12, padding: "14px 16px", colo
<div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase",
<p style={{ fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,.7)"
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
const dimLabels = { trust: ["Trust", "Micromanages everything", "Full delegation"], l
return (
<>
<div onClick={() => setSelectedClient(null)} style={{ position: "fixed", inset: 0
<div className="r-client-modal" style={{ position: "fixed", top: "50%", left: "50
<div style={{ padding: "14px 20px", borderBottom: "1px solid " + C.borderLight,
<h2 style={{ fontSize: 20, fontWeight: 800 }}>{sc.name}</h2>
<button onClick={() => setSelectedClient(null)} style={{ background: "none",
</div>
{/* Score + tabs */}
<div style={{ textAlign: "center", padding: "16px 20px 0", display: "flex", fle
{sc.ret ? <ScoreRing score={sc.ret} size={64} strokeWidth={4.5} /> : <div sty
<div style={{ fontSize: 14, color: C.textMuted, marginBottom: 4 }}>{sc.ret ?
{sc.ret && <div style={{ fontSize: 13, fontWeight: 700, color: retColor(sc.re
{sc.ret && <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "w
{[
"8px 1
letter
{ label: "Revenue", value: "$" + (sc.revenue / 1000).toFixed(1) + "k/mo"
{ label: "Tenure", value: sc.months >= 12 ? (sc.months / 12).toFixed(1) +
{ label: "LCV", value: "$" + Math.round(getAdjustedLTV(sc) / 1000) + "k"
{ label: "Drift", value: (() => { const d = clientDrift[sc.name] || "Stab
].map((s, si) => (
<div key={si} style={{ background: C.bg, borderRadius: 8, padding: <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, <div style={{ fontSize: 14, fontWeight: 700, color: s.color || C.text }
</div>
))}
</div>}
</div>
<div style={{ padding: "12px 20px 0" }}>
<div style={{ display: "flex", gap: 0, background: C.surface, borderRadius: 1
{["Overview", "Profile", "Billing", "Timeline"].map(t => (
<button key={t} onClick={() => setClientTab(t.toLowerCase())} style={{ fl
))}
</div>
</div>
<div style={{ padding: "16px 20px" }}>
{/* Overview */}
{clientTab === "overview" && (
<div>
{!editingOverview ? (
<>
{[{ l: "Contact", v: sc.contact }, { l: "Role", v: sc.role }, { l: "I
{ l: "Late payments", v: sc.qualifyingFlags?.latePayments ? "Yes" :
{ l: "Prev. terminated", v: sc.qualifyingFlags?.prevTerminated ? "Y
{ l: "Other vendors", v: sc.qualifyingFlags?.otherVendors ? "Yes" :
{ l: "From referral", v: sc.qualifyingFlags?.fromReferral ? "Yes" :
].map((d, i) => (
<div key={i} onClick={d.flag ? async () => {
const newFlags = { ...(sc.qualifyingFlags || {}), [d.flag]: !sc
const wasOn = !!sc.qualifyingFlags?.[d.flag];
const deltas = { latePayments: -4, prevTerminated: -8, otherVen
const delta = deltas[d.flag] || 0;
alignI
const newRet = Math.max(1, Math.min(99, (sc.ret || 50) + (wasOn
setClients(prev => prev.map(c => c.id === sc.id ? { ...c, quali
setSelectedClient({ ...sc, qualifyingFlags: newFlags, ret: newR
clientsDb.update(sc.id, { qualifying_flags: newFlags, retention
} : undefined}
style={{ display: "flex", justifyContent: "space-between", <span style={{ fontSize: 14, color: C.textMuted }}>{d.l}</span>
{d.flag ? (
<div style={{ width: 40, height: 22, borderRadius: 11, backgrou
<div style={{ width: 18, height: 18, borderRadius: 9, backgro
</div>
) : (
<span style={{ fontSize: 14, fontWeight: 600, color: d.c || C.t
)}
</div>
))}
</>
) : (
<>
<button onClick={() => { setEditingOverview(true); setOverviewEditDat
<div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Edit
<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
{[{ key: "contact", label: "Contact name" }, { key: "role", label:
<div key={f.key}>
<label style={{ fontSize: 14, fontWeight: 600, color: C.textMut
<input value={overviewEditData[f.key] || ""} onChange={e => set
</div>
<label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted
<input type="number" value={overviewEditData.revenue || 0} onChan
))}
<div>
<label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted
<input type="number" value={overviewEditData.months || 0} onChang
</div>
<div>
</div>
</div>
<div style={{ display: "flex", gap: 8, marginTop: 16 }}>
<button onClick={() => setEditingOverview(false)} style={{ padding:
<button onClick={async () => {
const updated = { ...sc, contact: overviewEditData.contact, role:
setClients(prev => prev.map(c => c.id === sc.id ? updated : c));
setSelectedClient(updated);
setEditingOverview(false);
clientsDb.update(sc.id, { contact: overviewEditData.contact, role
}} style={{ flex: 1, padding: "10px", background: C.btn, color: "#f
</div>
</>
)}
<div style={{ background: C.raiGrad, borderRadius: 14, padding: "18px", c
<div style={{ display: "flex", alignItems: "center", gap: 6, marginBott
<p style={{ fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,.6
{sc.ret >= 90 ? `${sc.name} — this relationship is strong. Keep showi
: sc.ret >= 80 ? `${sc.name} — healthy. Nothing urgent that stands ou
: sc.ret >= 70 ? `${sc.name} — nothing alarming, but worth considerin
: sc.ret >= 60 ? `${sc.name} — something is off. Think through what's
: sc.ret >= 50 ? `${sc.name} — there's a pattern forming. Multiple si
: sc.ret >= 40 ? `${sc.name} — several things need attention and they
: sc.ret >= 30 ? `${sc.name} — this relationship has serious, overlap
: sc.ret >= 20 ? `${sc.name} — deep fractures on multiple fronts. If
: sc.ret ? `${sc.name} — there's no way to sugarcoat this one. Is a l
: `${sc.name} is new. Complete the first health check to start buildi
</p>
<button className="r-btn" onClick={() => { setSelectedClient(null); set
</div>
{/* Remove client */}
<div style={{ marginTop: 20, display: "flex", flexDirection: "column", {!rolodexConfirm && !removeConfirm ? (
<>
gap: 6
<button onClick={() => { setRolodexConfirm(true); setRemoveConfirm(fals
<button onClick={() => { setRemoveConfirm(true); setRolodexConfirm(fals
</>
) : rolodexConfirm ? (
<div style={{ background: C.primarySoft, borderRadius: 12, padding: "16px
<p style={{ fontSize: 14, color: C.text, lineHeight: 1.55, marginBottom
<div style={{ display: "flex", gap: 8 }}>
<button className="r-btn" onClick={() => { setRolodex(prev => [...pre
clientsDb.deactivate(sc.id); setSelectedClient(null); setRolodexCon
<button onClick={() => setRolodexConfirm(false)} style={{ padding: "1
</div>
</div>
) : (
<div style={{ background: C.bg, borderRadius: 12, padding: "16px", border
<p style={{ fontSize: 14, color: C.text, lineHeight: 1.55, marginBottom
<div style={{ display: "flex", gap: 8 }}>
<button onClick={() => { setClients(clients.filter(c => c.id !== sc.i
clientsDb.deactivate(sc.id); setSelectedClient(null); setRemoveConf
<button className="r-btn" onClick={() => setRemoveConfirm(false)} sty
</div>
</div>
)}
</div>
</div>
)}
8 }}>
{/* Profile — 12 dimensions */}
{clientTab === "profile" && (
<div>
{!editingProfile ? (
<div>
{Object.keys(dims).length > 0 ? (
<div style={{ display: "flex", flexDirection: "column", gap: {Object.entries(dims).map(([key, val]) => {
const labels = dimLabels[key] || [key, "Low", "High"];
return (
<div key={key} style={{ background: C.bg, borderRadius: 8, pa
<div style={{ display: "flex", justifyContent: "space-betwe
<span style={{ fontSize: 14, fontWeight: 600 }}>{labels[0
<span style={{ fontSize: 14, fontWeight: 700, color: C.pr
</div>
<div style={{ height: 4, background: C.borderLight, borderR
<div style={{ height: "100%", width: `${val * 10}%`, back
</div>
<div style={{ display: "flex", justifyContent: "space-betwe
<span>{labels[1]}</span><span>{labels[2]}</span>
</div>
</div>
);
})}
</div>
) : (
</div>
<div style={{ textAlign: "center", padding: "20px 0", color: C.text
No profile set yet. Build one to help Rai understand this client.
)}
<button className="r-btn" onClick={() => { setEditScores({ ...dims })
{Object.keys(dims).length > 0 ? "Edit Profile" : "Build Profile"}
</button>
</div>
) : (
<div>
<div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Edit
<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
{profileDimensions.map(d => {
const val = editScores[d.key] !== undefined ? editScores[d.key] :
const labels = dimLabels[d.key] || [d.name, "Low", "High"];
return (
<div key={d.key}>
<div style={{ display: "flex", justifyContent: "space-between
<span style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</s
<span style={{ fontSize: 14, fontWeight: 700, color: C.prim
</div>
<input type="range" min="0" max="10" value={val} onChange={e
<div style={{ display: "flex", justifyContent: "space-between
<span>{labels[1]}</span><span>{labels[2]}</span>
</div>
</div>
);
})}
</div>
<div style={{ display: "flex", gap: 8, marginTop: 14 }}>
<button onClick={() => setEditingProfile(false)} style={{ padding:
<button onClick={async () => {
const newRet = calcRetentionScore(editScores, null, sc.qualifying
const updated = clients.map(c => c.id === sc.id ? { ...c, profile
setClients(updated);
setSelectedClient({ ...sc, profileScores: { ...editScores }, ret:
setEditingProfile(false);
clientsDb.updateScores(sc.id, newRet || sc.ret, { ...editScores }
}} style={{ flex: 1, padding: "10px", background: C.btn, color: "#f
</div>
</div>
)}
</div>
)}
{/* Billing */}
{clientTab === "billing" && (() => {
const billing = clientBilling[sc.id] || { items: [] };
const now = new Date();
const currentMonth = now.toLocaleString("default", { month: "long", year: "
const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const nextMonth = nextDate.toLocaleString("default", { month: "long", year:
const activeMonths = [currentMonth, nextMonth];
const getMonthItems = (month) => billing.items.filter(i => i.month === mont
const getMonthTotal = (month) => getMonthItems(month).reduce((a, i) => a +
const pastMonths = [...new Set(billing.items.map(i => i.month))].filter(m =
const addItem = (month) => {
if (!billingNewItem.description.trim() || !billingNewItem.amount) return;
const prev = clientBilling[sc.id] || { items: [] };
const item = { id: Date.now(), description: billingNewItem.description.tr
const newItems = [...prev.items, item];
if (billingNewItem.recurring) {
const otherMonth = month === currentMonth ? nextMonth : currentMonth;
const alreadyExists = prev.items.some(i => i.description === item.descr
if (!alreadyExists) {
newItems.push({ ...item, id: Date.now() + 1, month: otherMonth });
}
}
setClientBilling({ ...clientBilling, [sc.id]: { ...prev, items: newItems
setBillingNewItem({ description: "", amount: "", recurring: false });
setBillingAddOpen(false);
};
const removeItem = (itemId) => {
const prev = clientBilling[sc.id] || { items: [] };
setClientBilling({ ...clientBilling, [sc.id]: { ...prev, items: prev.item
};
const toggleRecurring = (itemId) => {
const prev = clientBilling[sc.id] || { items: [] };
setClientBilling({ ...clientBilling, [sc.id]: { ...prev, items: prev.item
};
const renderMonth = (month, isNext) => {
const items = getMonthItems(month);
const total = getMonthTotal(month);
const isAdding = billingAddOpen === month;
return (
<div key={month} style={{ marginBottom: 20 }}>
<div style={{ display: "flex", justifyContent: "space-between", align
<div>
<div style={{ fontSize: 14, fontWeight: 700 }}>{month}</div>
{isNext && <div style={{ fontSize: 12, color: C.textMuted }}>Forw
</div>
{items.length > 0 && <div style={{ fontSize: 14, fontWeight: </div>
700, c
{items.map(item => (
<div key={item.id} style={{ display: "flex", alignItems: "center",
<div style={{ flex: 1, minWidth: 0 }}>
<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
<span style={{ fontSize: 14, fontWeight: 600 }}>{item.descrip
{item.recurring && <span style={{ fontSize: 12, padding: "2px
</div>
</div>
<span style={{ fontSize: 14, fontWeight: 700, marginRight: 4 }}>$
<button onClick={() => toggleRecurring(item.id)} style={{ backgro
<button onClick={() => removeItem(item.id)} style={{ background:
</div>
))}
{items.length === 0 && !isAdding && (
<div style={{ padding: "12px 0", fontSize: 14, color: C.textMuted }
)}
{isAdding ? (
<div style={{ padding: "12px 0", display: "flex", flexDirection: "c
<input value={billingNewItem.description} onChange={e => setBilli
<input type="number" value={billingNewItem.amount} onChange={e =>
<div onClick={() => setBillingNewItem({ ...billingNewItem, recurr
<div style={{ width: 18, height: 18, borderRadius: 4, border: b
{billingNewItem.recurring && <span style={{ color: "#fff", fo
</div>
<span style={{ fontSize: 14, color: C.textSec }}>Make recurring
</div>
<div style={{ display: "flex", gap: 8 }}>
<button className="r-btn" onClick={() => addItem(month)} style=
<button onClick={() => { setBillingAddOpen(false); setBillingNe
</div>
</div>
) : (
<button onClick={() => setBillingAddOpen(month)} style={{ width: "1
)}
{items.length > 0 && (
<div style={{ display: "flex", justifyContent: "space-between", pad
<span style={{ fontSize: 14, fontWeight: 800 }}>Total</span>
<span style={{ fontSize: 14, fontWeight: 800, color: C.primary }}
</div>
)}
</div>
);
};
return (
<div>
{renderMonth(nextMonth, true)}
<div style={{ height: 1, background: C.border, margin: "4px 0 20px" }}
{renderMonth(currentMonth, false)}
{pastMonths.length > 0 && (
<div style={{ marginTop: 8 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, te
{pastMonths.map((month, mi) => {
const items = getMonthItems(month);
const total = getMonthTotal(month);
return (
<div key={mi} style={{ background: C.bg, borderRadius: 8, paddi
<div style={{ display: "flex", justifyContent: "space-between
<span style={{ fontSize: 14, fontWeight: 600 }}>{month}</sp
<span style={{ fontSize: 14, fontWeight: 700, color: C.prim
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
{ date: "Mar 20", label: sc.lastHC ? "Health check completed" : "Client
{ date: "Mar 15", label: "Performance report delivered", type: "report"
{ date: "Mar 10", label: "Bi-weekly call — good energy", type: "note" }
].map((e, i) => (
<div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, align
<div style={{ width: 6, height: 6, borderRadius: "50%", background: e
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
<div onClick={() => setSelectedRolodex(null)} style={{ position: "fixed", inset:
<div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxW
<div style={{ padding: "14px 20px", borderBottom: "1px solid " + C.borderLight,
<h2 style={{ fontSize: 20, fontWeight: 800 }}>{sr.client}</h2>
<button onClick={() => setSelectedRolodex(null)} style={{ background: "none",
</div>
<div style={{ textAlign: "center", padding: "16px 20px 0" }}>
<div style={{ fontSize: 32, marginBottom: 4 }}> </div>
<span style={{ fontSize: 14, padding: "4px 12px", borderRadius: 4, background
</div>
<div style={{ padding: "16px 20px" }}>
{!rolodexEditing ? (
<>
{[
{ l: "Contact", v: sr.contact },
{ l: "Together", v: sr.months > 0 ? sr.months + " months" : "One-time"
{ l: "Added", v: sr.date },
{ l: "Priority", v: sr.priority ? (sr.priority === "high" ? "High" : sr
{ l: "Reminder", v: sr.reminder ? new Date(sr.reminder).toLocaleDateStr
].map((d, i) => (
<div key={i} style={{ display: "flex", justifyContent: "space-between",
<span style={{ fontSize: 14, color: C.textMuted }}>{d.l}</span>
<span style={{ fontSize: 14, fontWeight: 600, color: d.l === "Reminde
</div>
))}
{sr.notes && (
<div style={{ marginTop: 14 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, text
<div style={{ fontSize: 14, color: C.text, lineHeight: 1.5, backgroun
</div>
)}
{(answers.what || answers.work) && (
<div style={{ marginTop: 14 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, text
{[
{ l: "What happened", v: answers.what },
{ l: "What you did", v: answers.work },
{ l: "How it ended", v: answers.terms },
{ l: "Would come back", v: answers.comeback },
{ l: "Would refer", v: answers.refer },
].filter(d => d.v).map((d, i) => (
<div key={i} style={{ marginBottom: 10 }}>
<div style={{ fontSize: 14, color: C.textMuted, marginBottom: 2 }
<div style={{ fontSize: 14, color: C.text, lineHeight: 1.4 }}>{d.
</div>
))}
</div>
)}
{sr.tags.length > 0 && (
<div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 14
{sr.tags.map((t, j) => <span key={j} style={{ fontSize: 12, padding:
</div>
)}
{!showReminderPicker ? (
<button onClick={() => { setShowReminderPicker(true); setReminderDate(s
{sr.reminder ? (
<div>
</div>
) : " Set Check-in Reminder"}
</button>
) : (
<div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", margin
<div>{new Date(sr.reminder).toLocaleDateString("en-US", { weekday
<div style={{ marginTop: 16 }}>
<div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>When
<div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom
{[
{ label: "2 weeks", days: 14 },
{ label: "1 month", days: 30 },
{ label: "3 months", days: 90 },
{ label: "6 months", days: 180 },
].map(q => {
const target = new Date(Date.now() + q.days * 24 * 60 * 60 const dow = target.getDay();
const diff = dow === 0 ? 1 : dow === 1 ? 0 : 8 - dow;
const monday = new Date(target.getTime() + diff * 24 * 60 * 60 *
const d = monday.toISOString().split("T")[0];
const sel = reminderDate === d;
return (
<button key={q.label} onClick={() => setReminderDate(d)} * 1000
style=
);
fontWe
})}
</div>
{reminderDate && <div style={{ fontSize: 14, color: C.primary, <div style={{ display: "flex", gap: 8 }}>
<button className="r-btn" onClick={() => {
if (reminderDate) { setRolodex(prev => prev.map(x => x.id === sr.
setShowReminderPicker(false);
}} style={{ flex: 1, padding: "10px", background: C.btn, color: "#f
{sr.reminder && <button onClick={() => { setRolodex(prev => prev.ma
<button onClick={() => setShowReminderPicker(false)} style={{ paddi
</div>
</div>
width:
)}
<button onClick={() => { setRolodexEditing(true); setRolodexEditData({ co
<div style={{ marginTop: 10 }}>
{!rolodexRemoveConfirm ? (
<button onClick={() => setRolodexRemoveConfirm(true)} style={{ ) : (
<div style={{ background: C.bg, borderRadius: 12, padding: "16px", bo
<p style={{ fontSize: 14, color: C.text, lineHeight: 1.55, marginBo
<div style={{ display: "flex", gap: 8 }}>
<button onClick={() => { setRolodex(prev => prev.filter(x => x.id
<button className="r-btn" onClick={() => setRolodexRemoveConfirm(
</div>
</div>
)}
</div>
</>
) : (
<>
<div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Edit Det
<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
<div>
<label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, di
<input value={ed.contact} onChange={e => setRolodexEditData({...ed, c
</div>
<div>
<label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, di
<input type="number" value={ed.months} onChange={e => setRolodexEditD
</div>
<div>
<label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, di
<div style={{ display: "flex", gap: 6 }}>
{priorityOpts.map(opt => (
<button key={opt.id} onClick={() => setRolodexEditData({...ed, pr
))}
</div>
</div>
<div>
<label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, di
<textarea value={ed.notes} onChange={e => setRolodexEditData({...ed,
</div>
</div>
<div style={{ fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom:
<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
{sr.type === "former" ? (
<>
<div><label style={{ fontSize: 14, fontWeight: 600, color: C.textMu
<div><label style={{ fontSize: 14, fontWeight: 600, color: C.textMu
<div><label style={{ fontSize: 14, fontWeight: 600, color: C.textMu
</>
) : (
<div><label style={{ fontSize: 14, fontWeight: 600, color: C.textMute
)}
<div><label style={{ fontSize: 14, fontWeight: 600, color: C.textMuted,
</div>
<div style={{ display: "flex", gap: 8, marginTop: 16 }}>
<button onClick={() => setRolodexEditing(false)} style={{ padding: "10p
<button onClick={() => {
const tags = [];
if ((ed.terms || "").toLowerCase().includes("good")) tags.push("Good
if ((ed.refer || "").toLowerCase().includes("yes")) tags.push("Would
if ((ed.comeback || "").toLowerCase().includes("yes")) tags.push("Wou
if (sr.type === "oneoff") tags.push("One-off");
const updated = { ...sr, contact: ed.contact, months: ed.months, prio
setRolodex(prev => prev.map(x => x.id === sr.id ? updated : x));
setRetroAnswers(prev => ({ ...prev, [sr.id]: { ...prev[sr.id], setSelectedRolodex(updated);
setRolodexEditing(false);
}} style={{ flex: 1, padding: "10px", background: C.btn, color: "#fff",
</div>
what:
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
<div onClick={() => setRefEditing(null)} style={{ position: "fixed", inset: 0, ba
<div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxW
<div style={{ padding: "14px 20px", borderBottom: "1px solid " + C.borderLight,
<h2 style={{ fontSize: 20, fontWeight: 800 }}>{refEditData.to || r.to}</h2>
<button onClick={() => setRefEditing(null)} style={{ background: "none", bord
</div>
<div style={{ padding: "20px" }}>
{/* Status badge */}
<div style={{ marginBottom: 20 }}>
<span style={{ fontSize: 14, padding: "6px 16px", borderRadius: 6, fontWeig
</div>
{/* Details */}
<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
<div>
<label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, displa
<input value={refEditData.to || ""} onChange={e => setRefEditData({...ref
</div>
<div>
<label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
{[...clients].sort((a, b) => b.ret - a.ret).map(c => (
<span key={c.id} onClick={() => setRefEditData({...refEditData, from:
displa
displa
))}
</div>
</div>
<div>
<label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, <div style={{ display: "flex", gap: 6 }}>
{[{ id: "converted", label: "Active" }, { id: "closed", label: "Closed"
const sel = (refEditData.status || (refEditData.converted ? "converte
const isRed = s.id === "closed";
return (
<button key={s.id} onClick={() => setRefEditData({...refEditData, s
);
})}
</div>
</div>
<div>
<label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, <input type="number" value={refEditData.revenue || ""} onChange={e </div>
{(refEditData.status === "closed") && (
displa
=> set
<div>
<label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, disp
<input type="number" value={refEditData.totalRevenue || ""} onChange={e
</div>
)}
</div>
<div style={{ display: "flex", gap: 8, marginTop: 20 }}>
<button onClick={() => setRefEditing(null)} style={{ padding: "10px 16px",
<button className="r-btn" onClick={() => {
setRefs(prev => prev.map((x, idx) => (x.id || idx) === refEditing ? { ...
// Persist
referralsDb.update(refEditing, {
referred_to: refEditData.to,
referred_by: refEditData.from,
status: refEditData.status,
revenue: parseInt(refEditData.revenue) || 0,
total_revenue: parseInt(refEditData.totalRevenue) || 0,
});
setRefEditing(null);
}} style={{ flex: 1, padding: "10px", background: C.btn, color: "#fff", bor
</div>
<button onClick={() => { setRefs(prev => prev.filter((x, idx) => (x.id || idx
</div>
</div>
</>
);
})()}
{/* MOBILE BOTTOM NAV */}
<div className="r-mob-bot" style={{ position: "fixed", bottom: 0, left: 0, right: 0, ba
{(tier === "enterprise" ? mobileNavEnterprise : mobileNavCore).map(n => {
const dot = hasDot(n.id);
return (
<div key={n.id} onClick={() => n.id === "more" ? setShowMore(!showMore) : goTo(n.
<Icon name={n.icon} size={22} color={(page === n.id || (n.id === "more" && show
<span style={{ fontSize: 10, fontWeight: 700, color: (page === n.id || (n.id ==
{dot && <div style={{ position: "absolute", top: 2, right: 6, width: 7, height:
</div>
);
})}
</div>
{showMore && (
<>
<div onClick={() => setShowMore(false)} style={{ position: "fixed", inset: 0, zInde
<div style={{ position: "fixed", bottom: 64, right: 12, background: C.card, borderR
{(tier === "enterprise" ? moreItemsEnterprise : moreItemsCore).map((m, i, arr) =>
<div key={m.id} onClick={() => goTo(m.id)} style={{ display: "flex", alignItems
<span style={{ width: 24, height: 24, display: "flex", alignItems: "center",
{hasDot(m.id) && <Dot />}
</div>
))}
<div onClick={() => { setTier(tier === "core" ? "enterprise" : "core"); setShowMo
<span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted }}>{tier === "
<div style={{ width: 36, height: 20, borderRadius: 10, background: tier === "en
<div style={{ width: 16, height: 16, borderRadius: 8, background: "#fff", pos
</div>
</div>
</div>
</>
)}
</div>
);
}
