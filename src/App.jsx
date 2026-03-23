import { useState } from "react";

// ─── CONFIGURATION ──────────────────────────────────────────────────────────
const CONFIG = {
  calendlyUrl: "https://calendly.com/rsjtechltd",
  privacyPolicyUrl: "https://www.rsjtech.co.uk/privacy-policy",
  notificationEmail: "connect@rsjtech.co.uk",
  supabase: {
    url: "https://dstmrmzkiitvdwnrjnkg.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdG1ybXpraWl0dmR3bnJqbmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzE4NzIsImV4cCI6MjA4OTQ0Nzg3Mn0.Q-jvEV2lCvweckCReYyMZVsVA8pYtyOwp9V2vnCCMLI",
  },
  emailjs: {
    serviceId: "YOUR_EMAILJS_SERVICE_ID",
    templateId: "YOUR_EMAILJS_TEMPLATE_ID",
    publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
    enabled: false,
  },
};
// ────────────────────────────────────────────────────────────────────────────

// ─── SUPABASE HELPERS ───────────────────────────────────────────────────────
const sbHeaders = {
  "Content-Type": "application/json",
  "apikey": CONFIG.supabase.anonKey,
  "Authorization": `Bearer ${CONFIG.supabase.anonKey}`,
};

async function saveLead(lead) {
  const res = await fetch(`${CONFIG.supabase.url}/rest/v1/leads`, {
    method: "POST",
    headers: { ...sbHeaders, "Prefer": "return=minimal" },
    body: JSON.stringify(lead),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase insert failed: ${err}`);
  }
}
// ────────────────────────────────────────────────────────────────────────────

const BRAND = {
  primary: "#E8780A",
  dark: "#0D0D0D",
  surface: "#161616",
  card: "#1E1E1E",
  border: "#2A2A2A",
  muted: "#888",
  text: "#F0EDE6",
  sub: "#B0A99A",
};

const questions = [
  { id: "sector", label: "What sector is your business in?", type: "radio", options: ["Construction & Engineering", "Legal & Professional Services", "Finance & Accounting", "Healthcare", "Manufacturing", "Retail & eCommerce", "Technology", "Other"] },
  { id: "size", label: "How many employees do you have?", type: "radio", options: ["1–10", "11–50", "51–200", "201–500", "500+"] },
  { id: "current_usage", label: "How is AI currently being used in your business?", type: "multi", options: ["Not at all", "Informally by some staff (ChatGPT etc.)", "We have a few tools but no standards", "We have structured processes", "We actively use AI across departments"] },
  { id: "governance", label: "Do you have documented AI policies or governance in place?", type: "radio", options: ["No, nothing formal in place", "We are working on it", "Informal guidelines exist", "Yes, formal policies are in place"] },
  { id: "manual_work", label: "Which manual workflows consume the most time in your business?", type: "multi", options: ["Documentation & report writing", "Client communications & proposals", "Quoting & estimation", "Compliance & audit tasks", "Training & onboarding", "Data entry & analysis"] },
  { id: "concerns", label: "What are your biggest AI-related concerns right now?", type: "multi", options: ["Data security & privacy", "Inconsistent output quality", "Staff resistance to adoption", "UK regulatory compliance", "Losing control of AI outputs", "Not knowing where to start"] },
  { id: "incident", label: "Has your business experienced any AI-related issues?", type: "radio", options: ["No, no issues to date", "Minor issues with inconsistent outputs", "We had a data or compliance concern", "Yes, we had a significant incident", "We do not monitor AI usage closely enough to know"] },
  { id: "goal", label: "What is your primary goal for AI in the next 12 months?", type: "multi", options: ["Reduce admin time and cost", "Improve quality and consistency of outputs", "Meet UK compliance and regulatory requirements", "Gain competitive advantage in our sector", "Build a scalable AI operating model"] },
];

const SOURCE_OPTIONS = ["LinkedIn", "Google Search", "Referred by a colleague", "Industry event or conference", "Email", "Other"];

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

async function sendNotification(contact, answers, score, label) {
  if (!CONFIG.emailjs.enabled) return;
  try {
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: CONFIG.emailjs.serviceId,
        template_id: CONFIG.emailjs.templateId,
        user_id: CONFIG.emailjs.publicKey,
        template_params: {
          to_email: CONFIG.notificationEmail,
          name: contact.name, company: contact.company, email: contact.email,
          phone: contact.phone || "not provided", role: contact.role || "not provided",
          source: contact.source || "not provided", score, label: label.replace(/_/g, " "),
          sector: answers.sector, size: answers.size,
        },
      }),
    });
  } catch (e) { console.log("EmailJS error:", e); }
}

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .rsj-input { background: #1E1E1E; border: 1px solid #2A2A2A; color: #F0EDE6; padding: 14px 16px; font-size: 15px; border-radius: 2px; font-family: 'DM Sans', sans-serif; outline: none; width: 100%; margin-bottom: 4px; transition: border-color 0.15s; }
  .rsj-input:focus { border-color: #E8780A; }
  .rsj-input::placeholder { color: #555; }
  .rsj-input.error { border-color: #e74c3c; }
  .rsj-select { background: #1E1E1E; border: 1px solid #2A2A2A; color: #F0EDE6; padding: 14px 16px; font-size: 15px; border-radius: 2px; font-family: 'DM Sans', sans-serif; outline: none; width: 100%; margin-bottom: 4px; cursor: pointer; appearance: none; -webkit-appearance: none; transition: border-color 0.15s; }
  .rsj-select:focus { border-color: #E8780A; }
  .rsj-select option { background: #1E1E1E; color: #F0EDE6; }
`;

function Header() {
  return (
    <div style={{ background: "#161616", borderBottom: "1px solid #2A2A2A", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "15px", color: "#F0EDE6", letterSpacing: "0.08em" }}>
        RSJ<span style={{ color: "#E8780A" }}>TECH</span> LTD
      </div>
      <div style={{ fontSize: "11px", color: "#E8780A", border: "1px solid #E8780A", padding: "3px 10px", borderRadius: "2px", letterSpacing: "0.1em" }}>
        AI READINESS AUDIT
      </div>
    </div>
  );
}

function Intro({ onStart }) {
  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px", animation: "fadeIn 0.4s ease" }}>
      <div style={{ fontSize: "72px", fontWeight: 700, color: "#E8780A", lineHeight: 1, fontFamily: "'DM Sans', sans-serif", marginBottom: "4px" }}>5 min</div>
      <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#F0EDE6", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.15, marginBottom: "16px", marginTop: 0 }}>
        How ready is your<br />business for structured AI?
      </h1>
      <p style={{ fontSize: "15px", color: "#B0A99A", lineHeight: 1.7, marginBottom: "40px", maxWidth: "520px", fontFamily: "'DM Sans', sans-serif" }}>
        Answer 8 questions and receive a personalised AI Readiness Report covering your risk exposure, operational gaps, and a prioritised roadmap specific to your sector and size.
      </p>
      <div style={{ display: "flex", gap: "32px", marginBottom: "40px" }}>
        {[["Sector-specific", "analysis"], ["Risk", "assessment"], ["Actionable", "recommendations"]].map(([a, b]) => (
          <div key={a}>
            <div style={{ fontSize: "12px", color: "#E8780A", letterSpacing: "0.08em", fontFamily: "'DM Sans', sans-serif" }}>{a}</div>
            <div style={{ fontSize: "12px", color: "#888", fontFamily: "'DM Sans', sans-serif" }}>{b}</div>
          </div>
        ))}
      </div>
      <button style={{ background: "#E8780A", color: "#000", border: "none", padding: "14px 36px", fontSize: "14px", fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", borderRadius: "2px" }} onClick={onStart}>
        BEGIN AUDIT →
      </button>
    </div>
  );
}

function Question({ q, step, total, answers, onChange, onNext, onBack }) {
  const pct = (step / total) * 100;
  const val = answers[q.id] || (q.type === "multi" ? [] : "");
  const isMulti = q.type === "multi";
  const hasAnswer = isMulti ? val.length > 0 : val !== "";
  const toggle = (opt) => {
    if (isMulti) onChange(q.id, val.includes(opt) ? val.filter(x => x !== opt) : [...val, opt]);
    else onChange(q.id, opt);
  };
  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px", animation: "fadeIn 0.3s ease" }}>
      <div style={{ height: "2px", background: "#2A2A2A", marginBottom: "48px" }}>
        <div style={{ height: "100%", background: "#E8780A", width: `${pct}%`, transition: "width 0.3s ease" }} />
      </div>
      <div style={{ fontSize: "11px", color: "#E8780A", letterSpacing: "0.12em", marginBottom: "8px" }}>QUESTION {step} OF {total}</div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "22px", fontWeight: 600, color: "#F0EDE6", lineHeight: 1.3, marginBottom: "32px", marginTop: 0 }}>{q.label}</p>
      {isMulti && <div style={{ fontSize: "12px", color: "#888", marginBottom: "16px", fontFamily: "'DM Sans', sans-serif" }}>Select all that apply</div>}
      {q.options.map(opt => {
        const sel = isMulti ? val.includes(opt) : val === opt;
        return (
          <div key={opt} onClick={() => toggle(opt)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", border: `1px solid ${sel ? "#E8780A" : "#2A2A2A"}`, background: sel ? "rgba(232,120,10,0.08)" : "#1E1E1E", cursor: "pointer", marginBottom: "10px", borderRadius: "2px", transition: "all 0.15s", fontSize: "14px", color: sel ? "#F0EDE6" : "#B0A99A", fontFamily: "'DM Sans', sans-serif" }}>
            {isMulti
              ? <div style={{ width: "16px", height: "16px", border: `2px solid ${sel ? "#E8780A" : "#2A2A2A"}`, background: sel ? "#E8780A" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{sel && <span style={{ color: "#000", fontSize: "10px", fontWeight: 700 }}>✓</span>}</div>
              : <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${sel ? "#E8780A" : "#2A2A2A"}`, background: sel ? "#E8780A" : "transparent", flexShrink: 0 }} />}
            {opt}
          </div>
        );
      })}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "40px" }}>
        {step > 1 ? <button style={{ background: "transparent", color: "#888", border: "1px solid #2A2A2A", padding: "12px 24px", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", borderRadius: "2px" }} onClick={onBack}>← Back</button> : <div />}
        <button style={{ background: !hasAnswer ? "#2A2A2A" : "#E8780A", color: !hasAnswer ? "#888" : "#000", border: "none", padding: "12px 28px", fontSize: "13px", fontWeight: 700, cursor: !hasAnswer ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", borderRadius: "2px", letterSpacing: "0.06em" }} onClick={hasAnswer ? onNext : undefined}>
          {step === total ? "CONTINUE →" : "NEXT →"}
        </button>
      </div>
    </div>
  );
}

function ContactForm({ onSubmit, loading }) {
  const [contact, setContact] = useState({ name: "", company: "", email: "", phone: "", role: "", source: "" });
  const [gdpr, setGdpr] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const emailValid = isValidEmail(contact.email);
  const formValid = contact.name && contact.company && contact.email && emailValid && gdpr;
  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px", animation: "fadeIn 0.3s ease" }}>
      <div style={{ fontSize: "11px", color: "#E8780A", letterSpacing: "0.12em", marginBottom: "8px" }}>ALMOST THERE</div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "22px", fontWeight: 600, color: "#F0EDE6", lineHeight: 1.3, marginBottom: "16px", marginTop: 0 }}>Where should we send your report?</p>
      <p style={{ fontSize: "14px", color: "#B0A99A", marginBottom: "32px", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
        Your personalised AI Readiness Report is ready to generate. Enter your details and we will follow up personally with sector-specific insights for your business.
      </p>
      {[
        { key: "name", label: "FULL NAME *", placeholder: "Jane Smith", type: "text" },
        { key: "company", label: "COMPANY NAME *", placeholder: "Acme Ltd", type: "text" },
        { key: "role", label: "JOB TITLE", placeholder: "Operations Director", type: "text" },
        { key: "phone", label: "PHONE (OPTIONAL)", placeholder: "+44 7xxx xxxxxx", type: "tel" },
      ].map(({ key, label, placeholder, type }) => (
        <div key={key} style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "11px", color: "#E8780A", letterSpacing: "0.1em", marginBottom: "8px", display: "block" }}>{label}</label>
          <input className="rsj-input" type={type} placeholder={placeholder} value={contact[key]} onChange={e => setContact(c => ({ ...c, [key]: e.target.value }))} />
        </div>
      ))}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ fontSize: "11px", color: "#E8780A", letterSpacing: "0.1em", marginBottom: "8px", display: "block" }}>WORK EMAIL *</label>
        <input className={`rsj-input${emailTouched && contact.email && !emailValid ? " error" : ""}`} type="email" placeholder="jane@acme.co.uk" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} onBlur={() => setEmailTouched(true)} />
        {emailTouched && contact.email && !emailValid && <div style={{ fontSize: "12px", color: "#e74c3c", marginTop: "4px", fontFamily: "'DM Sans', sans-serif" }}>Please enter a valid email address</div>}
      </div>
      <div style={{ marginBottom: "24px" }}>
        <label style={{ fontSize: "11px", color: "#E8780A", letterSpacing: "0.1em", marginBottom: "8px", display: "block" }}>HOW DID YOU HEAR ABOUT US?</label>
        <div style={{ position: "relative" }}>
          <select className="rsj-select" value={contact.source} onChange={e => setContact(c => ({ ...c, source: e.target.value }))}>
            <option value="">Select an option</option>
            {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#888", pointerEvents: "none", fontSize: "12px" }}>▾</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "16px", background: "#161616", border: "1px solid #2A2A2A", borderRadius: "2px", marginBottom: "24px" }}>
        <div onClick={() => setGdpr(!gdpr)} style={{ width: "20px", height: "20px", border: `2px solid ${gdpr ? "#E8780A" : "#444"}`, background: gdpr ? "#E8780A" : "transparent", flexShrink: 0, cursor: "pointer", marginTop: "2px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "2px" }}>
          {gdpr && <span style={{ color: "#000", fontSize: "11px", fontWeight: 700 }}>✓</span>}
        </div>
        <p style={{ fontSize: "13px", color: "#B0A99A", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          I agree to RSJ Tech Ltd processing my personal data to generate this report and to follow up with relevant services, as described in the{" "}
          <a href={CONFIG.privacyPolicyUrl} target="_blank" rel="noreferrer" style={{ color: "#E8780A", textDecoration: "none" }}>Privacy Policy</a>.
          You may withdraw consent at any time by emailing connect@rsjtech.co.uk. *
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={{ background: (!formValid || loading) ? "#2A2A2A" : "#E8780A", color: (!formValid || loading) ? "#888" : "#000", border: "none", padding: "14px 32px", fontSize: "13px", fontWeight: 700, cursor: (!formValid || loading) ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", borderRadius: "2px", letterSpacing: "0.06em" }} onClick={formValid && !loading ? () => onSubmit(contact) : undefined}>
          {loading ? "GENERATING..." : "GENERATE MY REPORT →"}
        </button>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <div style={{ width: "40px", height: "40px", border: "3px solid #2A2A2A", borderTop: "3px solid #E8780A", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 24px" }} />
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "18px", color: "#F0EDE6", marginBottom: "8px" }}>Analysing your responses...</div>
      <div style={{ fontSize: "13px", color: "#888" }}>Generating your personalised AI Readiness Report</div>
    </div>
  );
}

function Report({ report, answers }) {
  let score = 50, scoreLabel = "DEVELOPING", risks = [], recs = [], summary = "";
  const sm = report.match(/SCORE:\s*(\d+)/i); if (sm) score = parseInt(sm[1]);
  const lm = report.match(/LABEL:\s*([A-Z_]+)/i); if (lm) scoreLabel = lm[1].replace(/_/g, " ");
  const sum = report.match(/SUMMARY:([\s\S]*?)(?=RISKS:|$)/i); if (sum) summary = sum[1].trim();
  const rm = report.match(/RISKS:([\s\S]*?)(?=RECOMMENDATIONS:|$)/i);
  if (rm) risks = rm[1].trim().split("\n").filter(l => l.trim().startsWith("-")).map(l => l.replace(/^-\s*/, "").trim());
  const recm = report.match(/RECOMMENDATIONS:([\s\S]*?)(?=CTA:|$)/i);
  if (recm) {
    recs = recm[1].trim().split(/\n(?=[0-9]+\.)/).filter(Boolean).map(b => {
      const t = b.match(/^[0-9]+\.\s*(.*?)(?:\n|$)/);
      const d = b.match(/DESC:\s*(.*?)(?:\n|$)/i);
      const sv = b.match(/SERVICE:\s*(.*?)(?:\n|$)/i);
      return { title: t ? t[1].trim() : b.split("\n")[0], desc: d ? d[1].trim() : "", service: sv ? sv[1].trim() : "" };
    });
  }
  const scoreColor = score >= 70 ? "#2ecc71" : score >= 40 ? "#E8780A" : "#e74c3c";
  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px 24px", animation: "fadeIn 0.4s ease" }}>
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "11px", color: "#E8780A", letterSpacing: "0.12em", marginBottom: "24px", fontFamily: "'DM Mono', monospace" }}>
          AI READINESS REPORT: {(answers.sector || "YOUR BUSINESS").toUpperCase()}
        </div>
        <div style={{ width: "120px", height: "120px", borderRadius: "50%", border: `4px solid ${scoreColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", margin: "0 auto 16px" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "36px", fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: "11px", color: "#888", letterSpacing: "0.1em" }}>/100</div>
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "20px", fontWeight: 700, color: scoreColor, marginBottom: "8px" }}>{scoreLabel}</div>
        {summary && <div style={{ fontSize: "14px", color: "#B0A99A", maxWidth: "540px", margin: "0 auto", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>{summary}</div>}
      </div>
      {risks.length > 0 && (
        <div style={{ background: "#1E1E1E", border: "1px solid #2A2A2A", borderRadius: "2px", padding: "24px", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", color: "#E8780A", letterSpacing: "0.12em", marginBottom: "16px", fontFamily: "'DM Sans', sans-serif" }}>IDENTIFIED RISKS</div>
          {risks.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "14px", fontSize: "14px", color: "#B0A99A", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              <span style={{ color: "#e74c3c", fontWeight: 700, flexShrink: 0, marginTop: "2px" }}>▸</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}
      {recs.length > 0 && (
        <div style={{ background: "#1E1E1E", border: "1px solid #2A2A2A", borderRadius: "2px", padding: "24px", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", color: "#E8780A", letterSpacing: "0.12em", marginBottom: "16px", fontFamily: "'DM Sans', sans-serif" }}>PRIORITY RECOMMENDATIONS</div>
          {recs.map((r, i) => (
            <div key={i} style={{ borderLeft: "2px solid #E8780A", paddingLeft: "16px", marginBottom: "20px" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "15px", color: "#F0EDE6", marginBottom: "4px" }}>{r.title}</div>
              {r.desc && <div style={{ fontSize: "13px", color: "#B0A99A", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>{r.desc}</div>}
              {r.service && <div style={{ display: "inline-block", fontSize: "11px", color: "#E8780A", border: "1px solid rgba(232,120,10,0.4)", padding: "2px 8px", borderRadius: "2px", marginTop: "6px", letterSpacing: "0.08em" }}>{r.service}</div>}
            </div>
          ))}
        </div>
      )}
      <div style={{ background: "#E8780A", padding: "32px", borderRadius: "2px", marginTop: "24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "22px", fontWeight: 700, color: "#000", marginBottom: "8px", marginTop: 0 }}>Ready to close these gaps?</h2>
        <p style={{ fontSize: "14px", color: "rgba(0,0,0,0.75)", marginBottom: "24px", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
          Book a 90-minute Discovery Session with RSJ Tech. We will map your exact AI risks, identify your quick wins, and hand you a clear action plan before you leave.
        </p>
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "26px", fontWeight: 700, color: "#000", fontFamily: "'DM Sans', sans-serif" }}>£750 </span>
          <span style={{ fontSize: "14px", color: "rgba(0,0,0,0.65)", fontFamily: "'DM Sans', sans-serif" }}>fully credited towards your first engagement</span>
        </div>
        <button style={{ background: "#000", color: "#E8780A", border: "none", padding: "16px 36px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", borderRadius: "2px", letterSpacing: "0.06em", marginBottom: "12px" }} onClick={() => window.open(CONFIG.calendlyUrl, "_blank")}>
          BOOK YOUR DISCOVERY SESSION →
        </button>
        <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", fontFamily: "'DM Sans', sans-serif" }}>connect@rsjtech.co.uk · rsjtech.co.uk</div>
      </div>
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [report, setReport] = useState("");
  const [contact, setContact] = useState(null);
  const [genLoading, setGenLoading] = useState(false);

  const handleAnswer = (id, val) => setAnswers(a => ({ ...a, [id]: val }));

  const handleContactSubmit = async (contactData) => {
    setContact(contactData);
    setGenLoading(true);
    setStage("loading");

    const prompt = `You are an AI strategy consultant at RSJ Tech Ltd, a UK-based AI governance and adoption firm. A business has completed an AI Readiness Audit. Generate a structured report. Write entirely in British English: use spellings such as organise, recognise, prioritise, analyse, standardise, behaviour, colour. Never use American spellings. Do not use em dashes or double hyphens anywhere.

Answers:
- Sector: ${answers.sector}
- Size: ${answers.size} employees
- Current AI usage: ${Array.isArray(answers.current_usage) ? answers.current_usage.join(", ") : answers.current_usage}
- Governance: ${answers.governance}
- Manual workflows: ${Array.isArray(answers.manual_work) ? answers.manual_work.join(", ") : answers.manual_work}
- Concerns: ${Array.isArray(answers.concerns) ? answers.concerns.join(", ") : answers.concerns}
- Incidents: ${answers.incident}
- Goals: ${Array.isArray(answers.goal) ? answers.goal.join(", ") : answers.goal}

Respond EXACTLY in this format (no extra text, no markdown, no em dashes):

SCORE: [0-100 integer based on AI maturity]
LABEL: [ONE of: AT_RISK / DEVELOPING / PROGRESSING / STRUCTURED / ADVANCED]
SUMMARY: [2-3 sentences direct assessment for this specific sector and size. British English only.]
RISKS:
- [Specific risk 1 relevant to their sector]
- [Specific risk 2]
- [Specific risk 3]
RECOMMENDATIONS:
1. [Title]
DESC: [1-2 sentences. British English only.]
SERVICE: RSJ TECH: [AI Adoption Training / AI Governance / Custom AI Systems / Technical Advisory]
2. [Title]
DESC: [1-2 sentences. British English only.]
SERVICE: RSJ TECH: [service name]
3. [Title]
DESC: [1-2 sentences. British English only.]
SERVICE: RSJ TECH: [service name]`;

    let reportText = "";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      reportText = data.content?.map(c => c.text || "").join("\n") || "";
    } catch {
      reportText = "SCORE: 45\nLABEL: DEVELOPING\nSUMMARY: Based on your responses, your business is in the early stages of AI adoption with significant governance gaps. Unaddressed, these gaps create real operational and compliance risk.\nRISKS:\n- No documented AI policies leaves the business exposed to UK data protection and regulatory risk\n- Inconsistent AI usage across staff creates variable output quality\n- Manual workflows represent significant avoidable cost\nRECOMMENDATIONS:\n1. Establish an AI Governance Framework\nDESC: Define approved tools, usage rules, and accountability within 30 days to eliminate compliance exposure.\nSERVICE: RSJ TECH: AI Governance\n2. Deploy Role-Specific AI Training\nDESC: Standardise how your team uses AI with workflows proven in your sector.\nSERVICE: RSJ TECH: AI Adoption Training\n3. Automate Your Highest-Friction Workflow\nDESC: Identify and eliminate the single most time-consuming manual process with a targeted AI system.\nSERVICE: RSJ TECH: Custom AI Systems";
    }

    const scoreMatch = reportText.match(/SCORE:\s*(\d+)/i);
    const labelMatch = reportText.match(/LABEL:\s*([A-Z_]+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
    const label = labelMatch ? labelMatch[1] : "DEVELOPING";

    try {
      await saveLead({
        id: `lead-${Date.now()}`,
        timestamp: new Date().toISOString(),
        name: contactData.name,
        company: contactData.company,
        email: contactData.email,
        phone: contactData.phone || null,
        role: contactData.role || null,
        source: contactData.source || null,
        sector: answers.sector,
        size: answers.size,
        score,
        label,
        stage: "New",
        answers,
        report: reportText,
        notes: null,
      });
    } catch (e) { console.error("Supabase save error:", e); }

    await sendNotification(contactData, answers, score, label);

    setReport(reportText);
    setGenLoading(false);
    setStage("report");
  };

  const handleNext = () => {
    if (step < questions.length - 1) setStep(s => s + 1);
    else setStage("contact");
  };

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh", fontFamily: "'DM Mono', 'Courier New', monospace", color: "#F0EDE6" }}>
      <style>{css}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <Header />
      {stage === "intro" && <Intro onStart={() => setStage("questions")} />}
      {stage === "questions" && <Question q={questions[step]} step={step + 1} total={questions.length} answers={answers} onChange={handleAnswer} onNext={handleNext} onBack={() => setStep(s => s - 1)} />}
      {stage === "contact" && <ContactForm onSubmit={handleContactSubmit} loading={genLoading} />}
      {stage === "loading" && <Loading />}
      {stage === "report" && <Report report={report} answers={answers} contact={contact} />}
    </div>
  );
}
