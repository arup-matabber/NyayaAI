/**
 * NyayaAI — Student Lawyer Dashboard + Library
 * React + Tailwind v4
 *
 * Fonts (index.html):
 * <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
 *
 * Backend notes:
 * - useCaseStudies() → swap mock with GET /api/case-studies
 * - useProgress()    → swap mock with GET /api/student/progress
 * - Active section state is local; router-ready (replace useState with useNavigate)
 */

import { useState, useMemo } from "react";
import { Trophy, Star, ThumbsUp, BookOpen, Zap, BookMarked, Sparkles, BarChart2, GraduationCap } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────────── */
const MOCK_CASES = [
  {
    id: "cs-01", tag: "Landmark", category: "Constitutional",
    title: "Kesavananda Bharati vs. State of Kerala",
    year: "1973", court: "Supreme Court of India",
    summary: "Defined the 'Basic Structure Doctrine' — Parliament's power to amend the Constitution is not absolute and cannot alter its fundamental essence. A 13-judge bench delivered this landmark ruling.",
    keyPoints: ["Basic Structure Doctrine established", "Parliament cannot amend core constitutional features", "Overruled Golaknath case partially", "13-judge constitutional bench"],
    outcome: "Partially in favour of petitioner",
  },
  {
    id: "cs-02", tag: "Precedent", category: "Criminal",
    title: "Maneka Gandhi vs. Union of India",
    year: "1978", court: "Supreme Court of India",
    summary: "Expanded the scope of Article 21, holding that the right to life and personal liberty cannot be curtailed except by a fair, just, and reasonable procedure established by law.",
    keyPoints: ["Article 21 expanded significantly", "Due process requirement introduced", "Passport seizure without hearing held void", "Golden Triangle of Articles 14, 19, 21"],
    outcome: "In favour of petitioner",
  },
  {
    id: "cs-03", tag: "Tort Law", category: "Civil",
    title: "Donoghue vs. Stevenson",
    year: "1932", court: "House of Lords, UK",
    summary: "Established the modern concept of negligence in tort law — the 'neighbour principle' — which forms the foundational basis of duty of care across common law jurisdictions.",
    keyPoints: ["Neighbour principle coined", "Duty of care foundation laid", "Manufacturer liability established", "Mrs Donoghue's snail in a bottle"],
    outcome: "In favour of plaintiff",
  },
  {
    id: "cs-04", tag: "Contract", category: "Contract Law",
    title: "Carlill vs. Carbolic Smoke Ball Co.",
    year: "1893", court: "Court of Appeal, England",
    summary: "Established that a public advertisement constituting a unilateral offer can form a binding contract when accepted by performance, even without formal communication of acceptance.",
    keyPoints: ["Unilateral contract doctrine", "Offer by advertisement is binding", "Performance = acceptance", "Carbolic deposited £1000 as proof of sincerity"],
    outcome: "In favour of plaintiff",
  },
  {
    id: "cs-05", tag: "Human Rights", category: "Constitutional",
    title: "Vishaka vs. State of Rajasthan",
    year: "1997", court: "Supreme Court of India",
    summary: "Laid down binding guidelines on sexual harassment at the workplace (Vishaka Guidelines) in the absence of legislation, invoking CEDAW and fundamental rights under Articles 14, 19, 21.",
    keyPoints: ["Vishaka Guidelines issued", "Sexual harassment defined legally", "Employer duty of care established", "Led to POSH Act 2013"],
    outcome: "Landmark guidelines issued",
  },
  {
    id: "cs-06", tag: "Property", category: "Property Law",
    title: "Rylands vs. Fletcher",
    year: "1868", court: "House of Lords, UK",
    summary: "Established the doctrine of strict liability — a person who brings onto their land something likely to do mischief if it escapes must keep it at their peril.",
    keyPoints: ["Strict liability doctrine born", "Escape of dangerous things", "No negligence required to prove", "Applied to reservoirs, fire, animals"],
    outcome: "In favour of plaintiff",
  },
];

const MOCK_PROGRESS = [
  { subject: "Criminal Procedure", pct: 72 },
  { subject: "Evidence Law", pct: 45 },
  { subject: "Contract Torts", pct: 90 },
  { subject: "Constitutional Law", pct: 58 },
];

const CATEGORIES = ["All", "Constitutional", "Criminal", "Civil", "Contract Law", "Property Law"];

/* ─────────────────────────────────────────────────────────────────
   DATA HOOKS
───────────────────────────────────────────────────────────────── */
function useCaseStudies() {
  // TODO: replace with fetch('/api/case-studies')
  return { cases: MOCK_CASES };
}
function useProgress() {
  // TODO: replace with fetch('/api/student/progress')
  return { progress: MOCK_PROGRESS };
}

/* ─────────────────────────────────────────────────────────────────
   EXAM PREP & CURRICULUM CONTENT
───────────────────────────────────────────────────────────────── */
const EXAM_SYLLABUS = {
  1: {
    title: "1st Year - Foundational Law",
    subjects: ["Constitutional Law I", "Law of Contract", "Jurisprudence & Legal History", "Criminal Law I (IPC 1-228)", "Law of Torts"],
    topics: ["Articles 1-35 (Fundamental Rights)", "Constitutional History", "Offer & Acceptance", "Consideration", "Breach of Contract", "Basic Crimes (Theft, Robbery)", "Fault & Liability", "Vicarious Liability"]
  },
  2: {
    title: "2nd Year - Substantive Law",
    subjects: ["Constitutional Law II", "Law of Contract (Advanced)", "Criminal Law II (IPC 229-462)", "Law of Torts (Advanced)", "Civil Procedure Code"],
    topics: ["Articles 36-395 (DPSP & Fundamental Duties)", "Amendments & Judicial Review", "Conditions & Warranties", "Indemnity & Guarantee", "Criminal Offenses Against Property", "Product Liability", "Defamation & Privacy", "CPC Filing & Jurisdiction"]
  },
  3: {
    title: "3rd Year - Criminal & Family Law",
    subjects: ["Criminal Procedure Code", "Family Law I (Hindu/Muslim/Christian)", "Jurisprudence (Advanced)", "Law of Evidence", "Administrative Law"],
    topics: ["Criminal Investigation (CrPC 160-170)", "Trials & Conviction (CrPC 225-229)", "Marriage & Divorce (Hindu Marriage Act)", "Guardianship & Custody", "Legal Positivism & Natural Law", "Eyewitness Evidence", "Hearsay Evidence", "Administrative Tribunals"]
  },
  4: {
    title: "4th Year - Specialized & Procedural",
    subjects: ["Law of Evidence (Advanced)", "Administrative Law (Advanced)", "Commercial Law", "Intellectual Property Law", "Corporate Law I"],
    topics: ["Expert Evidence", "Burden & Standard of Proof", "Constitutional Administrative Law", "Sale of Goods Act", "Partnership Act", "Copyright & Trademark", "Patents & Designs", "Company Registration & Incorporation"]
  },
  5: {
    title: "5th Year - Capstone & Electives",
    subjects: ["Corporate Law (Advanced)", "Securities Law", "Environmental Law", "International Law", "Legal Clinic & Externship"],
    topics: ["Board of Directors", "Mergers & Acquisitions", "SEBI Regulations", "Environmental Protection Act", "Treaties & Conventions", "International Human Rights", "Practical Skills & Ethics"]
  }
};

const YEAR_QUIZZES = {
  1: {
    title: "1st Year Entrance Test",
    questions: [
      { id: 1, question: "Which article of the Indian Constitution declares India as a Sovereign Democratic Republic?", options: ["Article 1", "Article 52", "Article 79", "Article 368"], correct: 0, explanation: "Article 1 declares India as a sovereign, socialist, secular, democratic republic.", topic: "Constitutional Law I" },
      { id: 2, question: "What is the essential element of a valid contract according to the Indian Contract Act?", options: ["Consideration", "Writing", "Witnesses", "Registration"], correct: 0, explanation: "Consideration (exchange of something valuable) is essential.", topic: "Law of Contract" },
      { id: 3, question: "Under which sections of IPC does theft fall?", options: ["Section 378-380", "Section 420-421", "Section 300-307", "Section 354-355"], correct: 0, explanation: "Section 378 defines theft. Sections 379-380 cover punishment for theft and theft by public servants respectively.", topic: "Criminal Law I" },
      { id: 4, question: "What is the difference between tort and crime?", options: ["Tort is civil, crime is criminal", "No difference, they are same", "Tort only involves property", "Crime only involves violence"], correct: 0, explanation: "Tort is a civil wrong, while crime is a public wrong.", topic: "Law of Torts" }
    ]
  },
  2: {
    title: "2nd Year Mid-Term Test",
    questions: [
      { id: 1, question: "What is the scope of judicial review under Article 13 of the Constitution?", options: ["Review of laws inconsistent with fundamental rights", "Review of executive decisions", "Review of state laws only", "Review of constitutional amendments"], correct: 0, explanation: "Article 13 empowers courts to strike down laws inconsistent with fundamental rights.", topic: "Constitutional Law II" },
      { id: 2, question: "Under CPC, what is the time limit for filing an appeal?", options: ["30 days from judgment", "60 days from judgment", "90 days from judgment", "120 days from judgment"], correct: 1, explanation: "Section 106 CPC specifies 30 days to file appeal in High Court.", topic: "Civil Procedure Code" },
      { id: 3, question: "What is the difference between condition and warranty in contract law?", options: ["Condition is essential, warranty is secondary", "No difference", "Warranty cannot be waived", "Condition applies only in sales"], correct: 0, explanation: "Condition is essential term. Warranty is minor term.", topic: "Law of Contract (Advanced)" }
    ]
  },
  3: {
    title: "3rd Year Semester Test",
    questions: [
      { id: 1, question: "Under CrPC Section 161, who can record statements during investigation?", options: ["Police officer not below sub-inspector rank", "Any police officer", "Only the investigating officer", "Judge of the court"], correct: 0, explanation: "Section 161 allows recording of statements by any police officer.", topic: "Criminal Procedure Code" },
      { id: 2, question: "What is the difference between void and voidable marriage under Hindu Marriage Act?", options: ["Void=ab initio, voidable=can be validated", "No difference", "Voidable is worse than void", "Void can be challenged anytime, voidable cannot"], correct: 0, explanation: "Void marriage is void ab initio. Voidable marriage is valid until annulled.", topic: "Family Law I" },
      { id: 3, question: "What is primary evidence under Indian Evidence Act?", options: ["The original document", "Copy of original", "Oral testimony", "Circumstantial evidence"], correct: 0, explanation: "Section 62 defines primary evidence as original document.", topic: "Law of Evidence" }
    ]
  },
  4: {
    title: "4th Year Final Assessment",
    questions: [
      { id: 1, question: "What is doctrine of privity of contract?", options: ["Only parties to contract can sue/be sued", "Contracts must be private", "Secrets in contracts", "Parties must know each other"], correct: 0, explanation: "Section 2(h) ICA - only parties to contract can enforce it.", topic: "Law of Contract (Advanced)" },
      { id: 2, question: "What is passing off in intellectual property law?", options: ["Misrepresenting goods as another's", "Selling without license", "Copying a patent", "Using someone's name"], correct: 0, explanation: "Passing off is tort of misrepresenting goods and services.", topic: "Intellectual Property Law" },
      { id: 3, question: "What is the penalty for non-disclosure in insurance contracts?", options: ["Policy becomes void", "Fine only", "No penalty if innocent", "Imprisonment"], correct: 0, explanation: "Insurance contracts require utmost good faith.", topic: "Commercial Law" }
    ]
  },
  5: {
    title: "5th Year Capstone Assessment",
    questions: [
      { id: 1, question: "What are the legal consequences of a company's prospectus containing untrue statements?", options: ["Civil and criminal liability, damages to investors", "Fine only", "Cancellation of registration", "Criminal liability only"], correct: 0, explanation: "Untrue prospectus leads to civil claim, damages, and criminal prosecution.", topic: "Securities Law" },
      { id: 2, question: "What is the scope of corporate veil piercing in Indian law?", options: ["Directors liable for company debts in fraud/misconduct", "Always separate liability", "Only for taxation", "Never pierce"], correct: 0, explanation: "Corporate veil can be pierced when there is fraud, improper use of corporate form.", topic: "Corporate Law (Advanced)" }
    ]
  }
};

const getTopicQuiz = (topic) => {
  return {
    title: topic + " - Topic Quiz",
    questions: [
      {
        id: 1,
        question: "In the context of " + topic + ", which of the following is the most critical governing principle?",
        options: ["Statutory definitions and legislative intent", "Local customs only", "International treaties", "Executive directives"],
        correct: 0,
        explanation: "Statutory frameworks and legislative intent primarily govern cases in Indian law under " + topic + ".",
        topic: topic
      },
      {
        id: 2,
        question: "When evaluating a scenario involving " + topic + ", what is the first step in legal analysis?",
        options: ["Identifying the jurisdiction", "Reviewing latest Supreme Court precedents", "Ascertaining the material facts", "Checking for out-of-court settlements"],
        correct: 2,
        explanation: "Ascertaining the material facts is always the first step before applying the law for " + topic + ".",
        topic: topic
      },
      {
        id: 3,
        question: "Which of the following is an exception to the general rules of " + topic + "?",
        options: ["Force majeure or absolute necessity", "Lack of knowledge of the law", "Good faith verbal intent", "Minor infractions without intent"],
        correct: 0,
        explanation: "Force majeure (Act of God) or necessity often serves as a valid defense or exception.",
        topic: topic
      }
    ]
  };
};
const EXAM_PAPERS = [
  { year: "2024", title: "Constitutional Law — Finals", pages: 12, solved: true },
  { year: "2023", title: "Criminal Procedure — Mid-term", pages: 8, solved: true },
  { year: "2023", title: "Evidence Law — Finals", pages: 10, solved: false },
  { year: "2022", title: "Contract Law — Finals", pages: 14, solved: true },
  { year: "2022", title: "Tort Law — Mid-term", pages: 9, solved: false },
];

/* ─────────────────────────────────────────────────────────────────
   MOCK TRIALS CONTENT
───────────────────────────────────────────────────────────────── */
const MOCK_TRIALS = [
  { id: "mt-01", title: "Prosecution: R vs. Sharma", difficulty: "Beginner", role: "Defence", duration: "45 min", participants: 12, subject: "Criminal Procedure" },
  { id: "mt-02", title: "Civil Dispute: Mehra vs. NCI", difficulty: "Advanced", role: "Plaintiff", duration: "90 min", participants: 8, subject: "Contract Torts" },
  { id: "mt-03", title: "Writ Petition: Art. 32 Case", difficulty: "Expert", role: "Petitioner", duration: "60 min", participants: 6, subject: "Constitutional Law" },
];

/* ─────────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────────── */
const Svg = ({ children, size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children}
  </svg>
);
const SearchIcon = () => <Svg><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></Svg>;
const XIcon = () => <Svg size={13}><path d="M18 6 6 18M6 6l12 12" /></Svg>;
const BookIcon = () => <Svg><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></Svg>;
const GavelIcon = () => <Svg><path d="m14 13-8.5 8.5a2.12 2.12 0 0 1-3-3L11 10" /><path d="m16 16 6-6" /><path d="m8 8 6-6" /><path d="m9 7 8 8" /><path d="m21 11-8-8" /></Svg>;
const BrainIcon = () => <Svg><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /></Svg>;
const EditIcon = () => <Svg><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></Svg>;
const ChevRight = () => <Svg size={14}><polyline points="9 18 15 12 9 6" /></Svg>;
const ChevDown = () => <Svg size={14}><polyline points="6 9 12 15 18 9" /></Svg>;
const ArrowRight = () => <Svg size={14}><path d="M5 12h14M12 5l7 7-7 7" /></Svg>;
const CheckIcon = () => <Svg size={13}><polyline points="20 6 9 17 4 12" /></Svg>;
const UsersIcon = () => <Svg><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Svg>;
const ClockIcon = () => <Svg><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Svg>;
const SparkIcon = () => (
  <svg width={80} height={80} viewBox="0 0 24 24" fill="currentColor" opacity="0.12">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);
const HomeIcon = () => <Svg><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Svg>;
const LibIcon = () => <Svg><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></Svg>;

/* ─────────────────────────────────────────────────────────────────
   SHARED ATOMS
───────────────────────────────────────────────────────────────── */
function CategoryTag({ label, color = "teal" }) {
  const styles = {
    teal: { bg: "#d8ecec", color: "#1a5c60" },
    gold: { bg: "#f0e8d0", color: "#7a5c20" },
    ink: { bg: "rgba(14,15,16,0.08)", color: "#4a4b4f" },
  };
  const s = styles[color] ?? styles.teal;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 500,
      padding: "3px 8px", borderRadius: 2,
      letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function SectionTitle({ label, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {sub && <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>{sub}</p>}
      <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(22px,2.5vw,30px)", fontWeight: 400, color: "#0e0f10", letterSpacing: "-0.8px" }}>{label}</h2>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CASE STUDY CARD (compact — for grid)
───────────────────────────────────────────────────────────────── */
function CaseCard({ c, onClick }) {
  const [hov, setHov] = useState(false);
  const catColor = { Constitutional: "gold", Criminal: "teal", Civil: "ink" }[c.category] ?? "ink";
  return (
    <div
      onClick={() => onClick(c)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#f0ece3" : "#fff",
        border: "0.5px solid rgba(14,15,16,0.1)",
        borderRadius: 8, padding: "20px 20px 16px",
        cursor: "pointer", transition: "background 0.15s, transform 0.15s, box-shadow 0.15s",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? "0 6px 20px rgba(14,15,16,0.1)" : "none",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <CategoryTag label={c.category} color={catColor} />
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0", letterSpacing: "0.06em" }}>{c.year}</span>
      </div>
      <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 400, color: "#0e0f10", lineHeight: 1.35, letterSpacing: "-0.3px" }}>
        {c.title}
      </h3>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#4a4b4f", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {c.summary}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0" }}>{c.court}</span>
        <span style={{ color: "#1a5c60", display: "flex", alignItems: "center", gap: 3, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500 }}>
          Read <ArrowRight />
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CASE STUDY MODAL
───────────────────────────────────────────────────────────────── */
function CaseModal({ c, onClose }) {
  if (!c) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(14,15,16,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 10, width: "100%", maxWidth: 560,
        border: "0.5px solid rgba(14,15,16,0.12)",
        boxShadow: "0 24px 60px rgba(14,15,16,0.18)",
        overflow: "hidden",
      }}>
        {/* Modal header */}
        <div style={{ background: "#0e0f10", padding: "24px 28px 20px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <CategoryTag label={c.tag} color="gold" />
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 300, color: "#fff", marginTop: 10, lineHeight: 1.2, letterSpacing: "-0.5px", maxWidth: 420 }}>
                {c.title}
              </h2>
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 6, letterSpacing: "0.06em" }}>
                {c.court} · {c.year}
              </p>
            </div>
            <button onClick={onClose} style={{
              all: "unset", cursor: "pointer", color: "rgba(255,255,255,0.5)",
              padding: 6, borderRadius: 4, background: "rgba(255,255,255,0.08)",
              display: "flex", flexShrink: 0,
            }}><XIcon /></button>
          </div>
        </div>

        {/* Modal body */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#4a4b4f", lineHeight: 1.7 }}>{c.summary}</p>

          <div>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Key Points</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {c.keyPoints.map((pt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%", background: "#d8ecec",
                    color: "#1a5c60", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                  }}><CheckIcon /></span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#0e0f10" }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#f5f2eb", borderRadius: 6, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0", textTransform: "uppercase", letterSpacing: "0.1em" }}>Outcome</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#1a5c60" }}>{c.outcome}</span>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button style={{
              flex: 1, padding: "11px 0", background: "#0e0f10", color: "#fff", border: "none",
              borderRadius: 4, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500,
            }}>Save for Exam</button>
            <button style={{
              flex: 1, padding: "11px 0", background: "transparent", color: "#1a5c60", border: "1px solid #1a5c60",
              borderRadius: 4, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500,
            }}>Add to Notes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   QUIZ COMPONENT
───────────────────────────────────────────────────────────────── */
function QuizComponent({ quiz, onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (answerIdx) => {
    setAnswers({ ...answers, [currentQ]: answerIdx });
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) correctCount++;
    });
    setScore(correctCount);
    setShowResults(true);
  };

  const handleNextQuestion = () => {
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div style={{ width: "100%", maxWidth: 640 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 32, border: "0.5px solid rgba(14,15,16,0.1)", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 300, color: "#0e0f10", marginBottom: 20, display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
            Quiz Completed! <Trophy size={24} color="#b08a3e" />
          </h2>
          
          <div style={{ background: "#f5f2eb", borderRadius: 8, padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 36, fontFamily: "'Fraunces',serif", color: "#1a5c60", marginBottom: 8 }}>
              {score}/{quiz.questions.length}
            </div>
            <div style={{ fontSize: 18, fontFamily: "'Fraunces',serif", color: "#0e0f10", marginBottom: 8 }}>
              {percentage}%
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#4a4b4f", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
              {percentage >= 80 ? <><Star size={16} color="#b08a3e" /> Excellent! Keep it up!</> :
               percentage >= 60 ? <><ThumbsUp size={16} color="#1a5c60" /> Good! Review weak areas</> :
               percentage >= 40 ? <><BookOpen size={16} color="#4a4b4f" /> Keep studying. You're on the right track</> :
               <><Zap size={16} color="#c53030" /> More practice needed. Don't give up!</>}
            </p>
          </div>

          <div style={{ textAlign: "left", marginBottom: 24 }}>
            <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, color: "#0e0f10", marginBottom: 16 }}>Review Your Answers</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 380, overflowY: "auto", paddingRight: 8 }}>
              {quiz.questions.map((q, idx) => {
                const isCorrect = answers[idx] === q.correct;
                return (
                  <div key={idx} style={{ padding: 16, borderRadius: 6, background: isCorrect ? "#f0fdf4" : "#fef2f2", borderLeft: "4px solid " + (isCorrect ? "#22c55e" : "#ef4444") }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ fontSize: 16, color: isCorrect ? "#16a34a" : "#dc2626" }}>{isCorrect ? "" : ""}</span>
                      <div>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#0e0f10", marginBottom: 4 }}>Q{idx + 1}: {q.question}</p>
                        <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", marginBottom: 8 }}>Topic: {q.topic}</p>
                        <div style={{ background: "rgba(255,255,255,0.7)", padding: 8, borderRadius: 4, fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#0e0f10" }}>
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => { setCurrentQ(0); setAnswers({}); setShowResults(false); }} style={{
              flex: 1, padding: "12px 0", border: "1px solid rgba(14,15,16,0.15)", borderRadius: 6, background: "transparent",
              fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#4a4b4f"
            }}>Retake Quiz</button>
            <button onClick={() => onComplete(percentage)} style={{
              flex: 1, padding: "12px 0", border: "none", borderRadius: 6, background: "#1a5c60",
              fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#fff"
            }}>Save & Update Progress</button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQ];
  const isAnswered = currentQ in answers;

  return (
    <div style={{ width: "100%", maxWidth: 640 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, border: "0.5px solid rgba(14,15,16,0.1)", display: "flex", flexDirection: "column" }}>
        
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9a9ba0" }}>Question {currentQ + 1} of {quiz.questions.length}</p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "#1a5c60" }}>{Math.round((currentQ / quiz.questions.length) * 100)}%</p>
          </div>
          <div style={{ width: "100%", background: "#f5f2eb", borderRadius: 4, height: 6 }}>
            <div style={{ background: "#1a5c60", borderRadius: 4, height: 6, width: ((currentQ / quiz.questions.length) * 100) + "%", transition: "width 0.3s ease" }}></div>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Topic: {question.topic}</p>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 400, color: "#0e0f10", lineHeight: 1.4, marginBottom: 20 }}>{question.question}</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {question.options.map((option, idx) => {
              const selected = answers[currentQ] === idx;
              return (
                <button key={idx} onClick={() => handleAnswer(idx)} style={{
                  all: "unset", cursor: "pointer", padding: "14px 16px", borderRadius: 6,
                  border: selected ? "1.5px solid #1a5c60" : "1px solid rgba(14,15,16,0.12)",
                  background: selected ? "#e8f2f2" : "#fff",
                  display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s"
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: selected ? "none" : "1.5px solid rgba(14,15,16,0.2)", background: selected ? "#1a5c60" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {selected && <span style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}></span>}
                  </div>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#0e0f10" }}>{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} style={{
            flex: 1, padding: "12px 0", border: "1px solid rgba(14,15,16,0.15)", borderRadius: 6, background: "transparent",
            fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: currentQ === 0 ? "not-allowed" : "pointer", color: "#4a4b4f", opacity: currentQ === 0 ? 0.5 : 1
          }}>Previous</button>
          <button onClick={handleNextQuestion} disabled={!isAnswered} style={{
            flex: 1, padding: "12px 0", border: "none", borderRadius: 6, background: "#1a5c60",
            fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: !isAnswered ? "not-allowed" : "pointer", color: "#fff", opacity: !isAnswered ? 0.5 : 1
          }}>{currentQ === quiz.questions.length - 1 ? "Submit Quiz" : "Next Question"}</button>
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   EXAM PREP PANEL
───────────────────────────────────────────────────────────────── */
function ExamPrepPanel({ onQuizComplete }) {
  const [selectedYear, setSelectedYear] = useState(null);
  const [quizStarted, setQuizStarted]   = useState(false);
  const [currentQuiz, setCurrentQuiz]   = useState(null);

  const getSubjectFallback = (topic) => {
    if (!topic) return "Evidence Law";
    const t = topic.toLowerCase();
    if (t.includes("criminal") || t.includes("ipc")) return "Criminal Procedure";
    if (t.includes("contract") || t.includes("tort")) return "Contract Torts";
    if (t.includes("constitution") || t.includes("article")) return "Constitutional Law";
    return "Evidence Law";
  };

  // VIEW 1: SELECT YEAR
  if (!selectedYear) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 0, width: "100%", maxWidth: 840 }}>
        <div style={{ marginBottom: 32, textAlign: "left" }}>
          <SectionTitle label="Choose Your Year" sub="Test Analyzer" />
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#4a4b4f", maxWidth: 600 }}>
            Take comprehensive tests aligned with your law curriculum. Track your progress and identify weak areas. Select a topic within the year to load topic-specific quizzes.
          </p>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 40, overflowX: "auto", paddingBottom: 10 }}>
          {[1,2,3,4,5].map(year => (
            <button key={year} onClick={() => setSelectedYear(year)} style={{
              all: "unset", cursor: "pointer", background: "#fff", border: "0.5px solid rgba(14,15,16,0.1)", borderRadius: 8,
              padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flex: "1 0 140px",
              transition: "transform 0.15s, box-shadow 0.15s"
            }} onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 16px rgba(14,15,16,0.06)"; }} onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
              <div style={{ width: 44, height: 44, borderRadius: 6, background: year % 2 ? "#f0e8d0" : "#d8ecec", color: year % 2 ? "#7a5c20" : "#1a5c60", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontFamily: "'Fraunces',serif", fontWeight: 600 }}>
                {year}
              </div>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 400, color: "#0e0f10", marginBottom: 4 }}>Year {year}</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9a9ba0" }}>{EXAM_SYLLABUS[year].subjects.length} subjects</p>
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(200px, 1fr))", gap: 16 }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 8, border: "0.5px solid rgba(14,15,16,0.1)" }}>
            <h4 style={{ fontFamily: "'Fraunces',serif", fontSize: 14, color: "#0e0f10", marginBottom: 6, display: "flex", alignItems: "center", gap: "6px" }}><BookMarked size={16} color="#1a5c60" /> Comprehensive</h4>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#4a4b4f", lineHeight: 1.5 }}>Tests aligned with Indian law school syllabus for all years</p>
          </div>
          <div style={{ background: "#fff", padding: 20, borderRadius: 8, border: "0.5px solid rgba(14,15,16,0.1)" }}>
            <h4 style={{ fontFamily: "'Fraunces',serif", fontSize: 14, color: "#0e0f10", marginBottom: 6, display: "flex", alignItems: "center", gap: "6px" }}><Sparkles size={16} color="#b08a3e" /> Topic Specific</h4>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#4a4b4f", lineHeight: 1.5 }}>Select individual topics to pinpoint your learning to exactly what you need.</p>
          </div>
          <div style={{ background: "#fff", padding: 20, borderRadius: 8, border: "0.5px solid rgba(14,15,16,0.1)" }}>
            <h4 style={{ fontFamily: "'Fraunces',serif", fontSize: 14, color: "#0e0f10", marginBottom: 6, display: "flex", alignItems: "center", gap: "6px" }}><BarChart2 size={16} color="#1a5c60" /> Detailed Explanations</h4>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#4a4b4f", lineHeight: 1.5 }}>Learn from detailed explanations to answers generated by AI.</p>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: OVERVIEW
  if (selectedYear && !quizStarted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 0, width: "100%", maxWidth: 740 }}>
        <button onClick={() => setSelectedYear(null)} style={{ all: "unset", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#4a4b4f", letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
          ← Back to years
        </button>
        <SectionTitle label={EXAM_SYLLABUS[selectedYear].title} sub={"Year " + selectedYear + " Overview"} />

        <div style={{ background: "#fff", borderRadius: 12, padding: 32, border: "0.5px solid rgba(14,15,16,0.1)", marginBottom: 24, boxShadow: "0 6px 16px rgba(14,15,16,0.02)" }}>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, color: "#0e0f10", marginBottom: 16 }}> Subjects in This Year</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12, marginBottom: 28 }}>
            {EXAM_SYLLABUS[selectedYear].subjects.map((sub, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, background: "#f5f2eb", borderRadius: 6 }}>
                <span style={{ color: "#1a5c60", fontSize: 14 }}></span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#0e0f10" }}>{sub}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "0.5px solid rgba(14,15,16,0.08)", paddingTop: 24 }}>
            <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 16, color: "#0e0f10", marginBottom: 16 }}>Topics (Choose to Start Quiz)</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button 
                onClick={() => { setCurrentQuiz(YEAR_QUIZZES[selectedYear]); setQuizStarted(true); }} 
                style={{ all: "unset", border: "1px dashed #1a5c60", padding: "8px 14px", background: "transparent", color: "#1a5c60", borderRadius: 6, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.1s", display: "flex", alignItems: "center", gap: "6px" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#d8ecec"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                 <GraduationCap size={16} /> Master Year Quiz
              </button>

              {EXAM_SYLLABUS[selectedYear].topics.map((topic, idx) => (
                <button 
                  key={idx} 
                  onClick={() => { setCurrentQuiz(getTopicQuiz(topic)); setQuizStarted(true); }} 
                  style={{ all: "unset", padding: "8px 14px", background: "#f0ece3", color: "#0e0f10", borderRadius: 6, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)"; e.currentTarget.style.background = "#1a5c60"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#f0ece3"; e.currentTarget.style.color = "#0e0f10"; }}
                >
                  ▶ {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 3: QUIZ
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: 640 }}>
       <QuizComponent 
         quiz={currentQuiz} 
         onComplete={(pct) => { 
           setQuizStarted(false);
           if (onQuizComplete) {
             const fallbackSubject = getSubjectFallback(currentQuiz.questions[0]?.topic);
             onQuizComplete(fallbackSubject, pct);
           }
         }}
       />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MOCK TRIAL SIMULATOR
───────────────────────────────────────────────────────────────── */
function MockTrialSimulator({ trial, onComplete, onExit }) {
  const [phase, setPhase] = useState(0); 
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const phases = [
    {
      title: "Phase 1: Opening Statement",
      scenario: "Opposing counsel makes their opening statement, claiming your client had definitive motive without presenting evidence yet.",
      options: [
        { text: "Object: Argumentative", points: 0, feedback: "Overruled. Opening statements are allowed leeway for theory." },
        { text: "Take notes and prepare to counter.", points: 20, feedback: "Good strategy. It's best to address this in your own statement." },
        { text: "Object: Hearsay", points: -5, feedback: "Overruled. Hearsay applies to testimony, not opening statements." },
      ]
    },
    {
      title: "Phase 2: Direct Examination",
      scenario: "A witness is testifying and says: 'My friend told me that the defendant was at the scene.'",
      options: [
        { text: "Object: Hearsay", points: 30, feedback: "Sustained! Out-of-court statements for truth of matter are hearsay." },
        { text: "Object: Leading Question", points: -10, feedback: "Overruled. It is not a leading question." },
        { text: "Do nothing.", points: -20, feedback: "You missed a crucial hearsay objection." }
      ]
    },
    {
      title: "Phase 3: Cross Examination",
      scenario: "It is your turn to cross-examine the main witness who has been very hostile.",
      options: [
        { text: "Ask open-ended 'Why' questions.", points: -15, feedback: "Poor choice. Never ask 'Why' on cross-examination; it lets them explain." },
        { text: "Ask leading Yes/No questions.", points: 30, feedback: "Excellent. Leading questions help control the witness." },
        { text: "Demand they admit they are lying.", points: -10, feedback: "Objection: Badgering the witness." }
      ]
    },
    {
      title: "Phase 4: Closing Argument",
      scenario: "You must choose the framing for your closing statement.",
      options: [
        { text: "Focus primarily on the burden of proof and reasonable doubt.", points: 20, feedback: "Strong closing strategy." },
        { text: "Introduce a new alternative suspect.", points: -20, feedback: "Objection: Cannot introduce new evidence in closing." },
        { text: "Appeal to the jury's emotions wildly.", points: 0, feedback: "Risky, might alienate the judge/jury." }
      ]
    }
  ];

  const maxPoints = 100;

  const handleChoice = (opt) => {
    setScore(prev => prev + opt.points);
    setFeedback(opt.feedback);
  };

  const handleNext = () => {
    setFeedback(null);
    if (phase < phases.length - 1) {
      setPhase(p => p + 1);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const finalPct = Math.max(0, Math.min(100, Math.round((score / maxPoints) * 100)));
    return (
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, border: "0.5px solid rgba(14,15,16,0.1)", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, marginBottom: 20 }}>Simulation Concluded</h2>
        <div style={{ background: "#f5f2eb", borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 36, fontFamily: "'Fraunces',serif", color: finalPct > 70 ? "#1a5c60" : "#b08a3e", marginBottom: 8 }}>{finalPct}% Rated</div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#4a4b4f" }}>
            Your legal strategy was mathematically evaluated based on logical deductions, objection timing, and procedural adherence.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onExit} style={{ flex: 1, padding: "12px 0", border: "1px solid rgba(14,15,16,0.15)", borderRadius: 6, background: "transparent", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600 }}>Discard Result</button>
          <button onClick={() => { onComplete(finalPct); onExit(); }} style={{ flex: 1, padding: "12px 0", border: "none", borderRadius: 6, background: "#1a5c60", color: "#fff", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600 }}>Save & Update Progress</button>
        </div>
      </div>
    );
  }

  const currentPhase = phases[phase];

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 32, border: "0.5px solid rgba(14,15,16,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Simulated Trial</p>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, color: "#0e0f10" }}>{trial.title}</h2>
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#1a5c60", background: "#d8ecec", padding: "4px 8px", borderRadius: 4, textTransform: "uppercase" }}>Phase {phase + 1} / {phases.length}</div>
      </div>
       
      <div style={{ background: "#f5f2eb", padding: 20, borderRadius: 6, marginBottom: 24, borderLeft: "4px solid #1a5c60" }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "#0e0f10", lineHeight: 1.5 }}>"{currentPhase.scenario}"</p>
      </div>

      {!feedback ? (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 16, marginBottom: 16, color: "#0e0f10" }}>Select your strategy:</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {currentPhase.options.map((opt, i) => (
               <button key={i} onClick={() => handleChoice(opt)} style={{
                 all: "unset", cursor: "pointer", padding: "14px 16px", border: "1px solid rgba(14,15,16,0.1)", borderRadius: 6,
                 fontFamily: "'DM Sans',sans-serif", fontSize: 13, background: "#fff", display: "flex", gap: 12, alignItems: "center", transition: "all 0.1s"
               }} onMouseEnter={e => { e.currentTarget.style.background = "#fafafa"; }} onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}>
                 <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a5c60", flexShrink: 0 }} />
                 {opt.text}
               </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
           <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 16, marginBottom: 16, color: "#0e0f10" }}>Result:</h3>
           <div style={{ background: "rgba(26, 92, 96, 0.05)", padding: 16, borderRadius: 6, marginBottom: 20, border: "1px dashed rgba(26, 92, 96, 0.3)" }}>
             <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#0e0f10" }}>{feedback}</p>
           </div>
           <button onClick={handleNext} style={{ width: "100%", padding: "12px 0", border: "none", borderRadius: 6, background: "#1a5c60", color: "#fff", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600 }}>
             Proceed to Next Phase →
           </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MOCK TRIALS PANEL
───────────────────────────────────────────────────────────────── */
function MockTrialsPanel({ onTrialComplete }) {
  const diffColor = { Beginner: "teal", Advanced: "gold", Expert: "ink" };
  const [activeTrial, setActiveTrial] = useState(null);

  if (activeTrial) {
    return <MockTrialSimulator trial={activeTrial} onExit={() => setActiveTrial(null)} onComplete={(score) => onTrialComplete(activeTrial.subject, score)} />;
  }

  return (
    <div>
      <SectionTitle label="Mock Trials" sub="Practice" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MOCK_TRIALS.map(t => (
          <div key={t.id} style={{
            background: "#fff", border: "0.5px solid rgba(14,15,16,0.1)",
            borderRadius: 6, padding: "18px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <CategoryTag label={t.difficulty} color={diffColor[t.difficulty]} />
                <CategoryTag label={`Role: ${t.role}`} color="ink" />
                <CategoryTag label={t.subject} color="gold" />
              </div>
              <p style={{ fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 400, color: "#0e0f10", letterSpacing: "-0.3px", marginBottom: 6 }}>{t.title}</p>
              <div style={{ display: "flex", gap: 14 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0" }}>
                  <ClockIcon /> {t.duration}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0" }}>
                  <UsersIcon /> {t.participants} joined
                </span>
              </div>
            </div>
            <button onClick={() => setActiveTrial(t)} style={{
              background: "#1a5c60", color: "#fff", border: "none", cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500,
              padding: "9px 18px", borderRadius: 3, whiteSpace: "nowrap",
            }}>Start Simulation</button>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 14, background: "#f5f2eb", borderRadius: 6, padding: "14px 18px",
        border: "0.5px solid rgba(14,15,16,0.08)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#4a4b4f" }}>Want to host a mock trial for your batch?</p>
        <button style={{
          all: "unset", cursor: "pointer", fontFamily: "'DM Mono',monospace", fontSize: 9,
          color: "#1a5c60", letterSpacing: "0.1em", textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 4, fontWeight: 500,
        }}>Create Session <ChevRight /></button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   RESOURCE GRID CARDS
───────────────────────────────────────────────────────────────── */
function ResourceCard({ icon, title, sub, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        all: "unset", cursor: "pointer",
        background: active ? "#0e0f10" : hov ? "#f0ece3" : "#fff",
        border: active ? "0.5px solid #0e0f10" : "0.5px solid rgba(14,15,16,0.1)",
        borderRadius: 8, padding: "20px 18px",
        display: "flex", flexDirection: "column", gap: 10,
        transition: "background 0.15s, transform 0.15s",
        transform: hov && !active ? "translateY(-2px)" : "none",
      }}>
      <div style={{
        width: 40, height: 40, borderRadius: 6,
        background: active ? "rgba(255,255,255,0.12)" : "#f5f2eb",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: active ? "#fff" : "#1a5c60",
        border: active ? "none" : "0.5px solid rgba(14,15,16,0.08)",
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: active ? "#fff" : "#0e0f10", marginBottom: 2 }}>{title}</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: active ? "rgba(255,255,255,0.55)" : "#9a9ba0" }}>{sub}</p>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────────────────────────────── */
function ProgressBar({ label, pct }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, color: "#0e0f10" }}>{label}</span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#1a5c60", fontWeight: 500 }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: "rgba(14,15,16,0.08)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "#1a5c60" : pct >= 50 ? "#b08a3e" : "#4a4b4f", borderRadius: 10, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   NAV
───────────────────────────────────────────────────────────────── */
function NavLink({ label, active }) {
  return (
    <a href="#" style={{
      fontFamily: "'DM Sans',sans-serif", fontSize: 13,
      fontWeight: active ? 600 : 500,
      color: active ? "#1a5c60" : "#4a4b4f",
      textDecoration: "none",
      borderBottom: active ? "1.5px solid #1a5c60" : "none",
      paddingBottom: active ? 2 : 0,
    }}>{label}</a>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const { cases } = useCaseStudies();
  
  const userStr = localStorage.getItem("nyaya_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.name || "Advocate";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const [progress, setProgress] = useState(MOCK_PROGRESS);

  const handleProgressUpdate = (subject, newScorePct) => {
    setProgress(prev => prev.map(p => {
      if (p.subject === subject) {
        return { ...p, pct: Math.round((p.pct + newScorePct) / 2) };
      }
      return p;
    }));
  };

  const [activeSection, setActiveSection] = useState("dashboard"); // dashboard | library | exam | trials
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [progressOpen, setProgressOpen] = useState(true);

  const filteredCases = useMemo(() => {
    let list = cases;
    if (category !== "All") list = list.filter(c => c.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [cases, category, query]);

  /* resource card config */
  const RESOURCES = [
    { key: "library", icon: <LibIcon />, title: "Library", sub: "Archived documents" },
    { key: "exam", icon: <EditIcon />, title: "Exam Prep", sub: "Papers & solutions" },
    { key: "trials", icon: <GavelIcon />, title: "Mock Trials", sub: "Practice simulations" },
    { key: "ai", icon: <BrainIcon />, title: "Legal AI", sub: "Research assistant" },
  ];

  function handleResource(key) {
    // eslint-disable-next-line react-hooks/immutability
    if (key === "ai") { window.location.href = "/"; return; } // link to home
    setActiveSection(key);
  }

  return (
    <div className="min-h-screen text-[#0e0f10] bg-[#f5f2eb] overflow-x-hidden font-sans">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 h-[60px] flex items-center justify-between px-4 sm:px-10 border-b border-[#0e0f10]/10 bg-[#f5f2eb]/90 backdrop-blur-md">
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, border: "1.5px solid #0e0f10", borderRadius: 2,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 700, color: "#0e0f10",
          }}>N</div>
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 600, color: "#0e0f10", letterSpacing: "-0.3px" }}>NyayaAI</span>
        </a>
        <nav className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar max-w-full">
          <a href="/" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: "#4a4b4f", textDecoration: "none", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
            <HomeIcon /> Home
          </a>
          <div className="whitespace-nowrap"><NavLink label="Dashboard" active={activeSection === "dashboard"} /></div>
          <div className="whitespace-nowrap hidden sm:block"><NavLink label="Library" active={activeSection === "library"} /></div>
          <div className="whitespace-nowrap hidden sm:block"><NavLink label="Research" /></div>
          <div className="whitespace-nowrap hidden sm:block"><NavLink label="Profile" /></div>
          <button style={{
            all: "unset", cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500,
            background: "#0e0f10", color: "#fff", padding: "8px 20px", borderRadius: 3,
            whiteSpace: "nowrap"
          }}>Upgrade</button>
        </nav>
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-10 py-8 pb-20 w-full overflow-hidden">

        {/* Welcome strip */}
        <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>
              Student Dashboard
            </p>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 300, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
              {getGreeting()},{" "}
              <em style={{ fontStyle: "italic", color: "#1a5c60" }}>{userName}.</em>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {activeSection !== "dashboard" && (
              <button onClick={() => setActiveSection("dashboard")} style={{
                all: "unset", cursor: "pointer",
                fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#4a4b4f",
                letterSpacing: "0.08em", textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 4,
                background: "#fff", padding: "8px 14px", borderRadius: 3,
                border: "0.5px solid rgba(14,15,16,0.15)",
              }}>← Back to Dashboard</button>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            DASHBOARD VIEW
        ════════════════════════════════════════════════════════ */}
        {activeSection === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

            {/* LEFT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

              {/* Hero case card */}
              <div style={{
                background: "#0e0f10", borderRadius: 10, padding: "36px 36px 32px",
                position: "relative", overflow: "hidden",
                border: "0.5px solid rgba(14,15,16,0.1)",
              }}>
                <div style={{ position: "absolute", right: 24, top: 24 }}><SparkIcon /></div>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ marginBottom: 14 }}><CategoryTag label="Landmark Case Study" color="gold" /></div>
                  <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(22px,2.5vw,32px)", fontWeight: 300, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.8px", maxWidth: 500, marginBottom: 12 }}>
                    Kesavananda Bharati<br />vs. State of Kerala
                  </h2>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 480, marginBottom: 24 }}>
                    The historic case that defined the 'Basic Structure Doctrine' — Parliament's power to amend the Constitution is not absolute and cannot alter its core essence.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setSelectedCase(MOCK_CASES[0])} style={{
                      background: "#fff", color: "#0e0f10", border: "none", cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600,
                      padding: "11px 24px", borderRadius: 3, display: "flex", alignItems: "center", gap: 6,
                    }}>Read More <ArrowRight /></button>
                    <button style={{
                      background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)",
                      border: "0.5px solid rgba(255,255,255,0.15)", cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500,
                      padding: "11px 24px", borderRadius: 3,
                    }}>Save for Exam</button>
                  </div>
                </div>
              </div>

              {/* Resource grid */}
              <div>
                <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Quick Access</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {RESOURCES.map(r => (
                    <ResourceCard
                      key={r.key} icon={r.icon} title={r.title} sub={r.sub}
                      active={activeSection === r.key}
                      onClick={() => handleResource(r.key)}
                    />
                  ))}
                </div>
              </div>

              {/* Case Studies Search + Grid */}
              <div style={{ background: "transparent", borderRadius: 10, padding: "28px", border: "0.5px solid rgba(14,15,16,0.12)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>Case Studies</p>
                    <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 300, letterSpacing: "-0.6px", color: "#0e0f10" }}>Browse the archive</h3>
                  </div>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0" }}>{filteredCases.length} case{filteredCases.length !== 1 ? "s" : ""}</span>
                </div>

                {/* Search */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "#fff", border: "0.5px solid rgba(14,15,16,0.12)",
                  borderRadius: 6, padding: "10px 14px", marginBottom: 12,
                }}>
                  <span style={{ color: "#9a9ba0", display: "flex", flexShrink: 0 }}><SearchIcon /></span>
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search case name, topic, or doctrine…"
                    style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#0e0f10" }}
                  />
                  {query && (
                    <button onClick={() => setQuery("")} style={{ all: "unset", cursor: "pointer", color: "#9a9ba0", display: "flex" }}><XIcon /></button>
                  )}
                </div>

                {/* Category pills */}
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 14, scrollbarWidth: "none" }}>
                  {CATEGORIES.map(cat => {
                    const on = category === cat;
                    return (
                      <button key={cat} onClick={() => setCategory(cat)} style={{
                        all: "unset", cursor: "pointer", whiteSpace: "nowrap",
                        fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 500,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        padding: "6px 14px", borderRadius: 2,
                        background: on ? "#1a5c60" : "#fff",
                        color: on ? "#fff" : "#4a4b4f",
                        boxShadow: on ? "none" : "0 0 0 0.5px rgba(14,15,16,0.15)",
                        transition: "background 0.15s, color 0.15s",
                      }}>{cat}</button>
                    );
                  })}
                </div>

                {/* Cases grid (scrollable) */}
                <div 
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  style={{
                  maxHeight: 440, overflowY: "auto",
                  paddingRight: 4, scrollbarWidth: "thin", scrollbarColor: "rgba(14,15,16,0.12) transparent",
                }}>
                  {filteredCases.length === 0 ? (
                    <div style={{ gridColumn: "span 2", padding: "40px 0", textAlign: "center" }}>
                      <p style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 300, color: "#0e0f10", marginBottom: 4 }}>No cases match</p>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9a9ba0" }}>Try a different search or category.</p>
                    </div>
                  ) : (
                    filteredCases.map(c => <CaseCard key={c.id} c={c} onClick={setSelectedCase} />)
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Progress */}
              <div style={{ background: "#fff", border: "0.5px solid rgba(14,15,16,0.1)", borderRadius: 8, overflow: "hidden" }}>
                <button onClick={() => setProgressOpen(p => !p)} style={{
                  all: "unset", cursor: "pointer", width: "100%", boxSizing: "border-box",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 18px", borderBottom: progressOpen ? "0.5px solid rgba(14,15,16,0.08)" : "none",
                }}>
                  <span style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 400, color: "#0e0f10", letterSpacing: "-0.3px" }}>Learning Progress</span>
                  {progressOpen ? <ChevDown /> : <ChevRight />}
                </button>
                {progressOpen && (
                  <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
                    {progress.map(p => <ProgressBar key={p.subject} label={p.subject} pct={p.pct} />)}
                    <button style={{
                      all: "unset", cursor: "pointer", width: "100%", boxSizing: "border-box",
                      textAlign: "center", padding: "10px 0", marginTop: 4,
                      background: "#f5f2eb", borderRadius: 4,
                      fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 500,
                      color: "#4a4b4f", letterSpacing: "0.1em", textTransform: "uppercase",
                    }}>View Analytics</button>
                  </div>
                )}
              </div>

              {/* AI assistant promo */}
              <div style={{ background: "#0e0f10", borderRadius: 8, padding: "22px 18px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -8, bottom: -8, color: "#fff" }}><SparkIcon /></div>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <p style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 400, color: "#fff", marginBottom: 6, lineHeight: 1.3 }}>Need Exam Help?</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 16, lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>
                    Chat with our AI Legal Assistant for instant case citations and summaries.
                  </p>
                  <a href="/" style={{ textDecoration: "none" }}>
                    <button style={{
                      all: "unset", cursor: "pointer",
                      fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 500,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      background: "#b08a3e", color: "#fff", padding: "8px 14px", borderRadius: 3,
                    }}>Open AI Assistant →</button>
                  </a>
                </div>
              </div>

              {/* Upcoming deadlines */}
              <div style={{ background: "#fff", border: "0.5px solid rgba(14,15,16,0.1)", borderRadius: 8, padding: "16px 18px" }}>
                <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Upcoming Deadlines</p>
                {[
                  { label: "Evidence Law — Assignment", due: "Nov 2", urgent: true },
                  { label: "Moot Court Registration", due: "Nov 5", urgent: false },
                  { label: "Criminal Proc — Finals", due: "Nov 12", urgent: false },
                ].map((d, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "9px 0",
                    borderBottom: i < 2 ? "0.5px solid rgba(14,15,16,0.06)" : "none",
                  }}>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#0e0f10" }}>{d.label}</span>
                    <span style={{
                      fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 500, letterSpacing: "0.06em",
                      color: d.urgent ? "#9c2b1b" : "#4a4b4f",
                      background: d.urgent ? "#f7e8e5" : "rgba(14,15,16,0.05)",
                      padding: "3px 8px", borderRadius: 2,
                    }}>{d.due}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            SUB-SECTION VIEWS
        ════════════════════════════════════════════════════════ */}
        {activeSection === "library" && (
          <div style={{ maxWidth: 820 }}>
            <SectionTitle label="Legal Library" sub="Archive" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { title: "The Constitution of India", type: "Statute", pages: 448, updated: "2024" },
                { title: "Indian Evidence Act, 1872", type: "Statute", pages: 72, updated: "2023" },
                { title: "Code of Criminal Procedure", type: "Code", pages: 386, updated: "2023" },
                { title: "Transfer of Property Act, 1882", type: "Statute", pages: 96, updated: "2022" },
                { title: "Contract Act, 1872 — Annotated", type: "Text", pages: 210, updated: "2024" },
              ].map((b, i) => (
                <div key={i} style={{
                  background: "#fff", border: "0.5px solid rgba(14,15,16,0.1)", borderRadius: 6,
                  padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, background: "#d8ecec", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#1a5c60" }}>
                      <BookIcon />
                    </div>
                    <div>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: "#0e0f10", marginBottom: 2 }}>{b.title}</p>
                      <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#9a9ba0", letterSpacing: "0.06em" }}>
                        {b.type} · {b.pages} pages · Updated {b.updated}
                      </p>
                    </div>
                  </div>
                  <button style={{
                    all: "unset", cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500,
                    color: "#1a5c60", display: "flex", alignItems: "center", gap: 3,
                  }}>Open <ChevRight /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "exam" && (
          <div style={{ maxWidth: 700 }}>
            <ExamPrepPanel onQuizComplete={(subj, pct) => {
               handleProgressUpdate(subj, pct);
               setActiveSection("dashboard");
            }} />
          </div>
        )}

        {activeSection === "trials" && (
          <div style={{ maxWidth: 740 }}>
            <MockTrialsPanel onTrialComplete={(subj, pct) => {
               handleProgressUpdate(subj, pct);
               setActiveSection("dashboard");
            }} />
          </div>
        )}
      </main>

      {/* ── CASE MODAL ── */}
      {selectedCase && <CaseModal c={selectedCase} onClose={() => setSelectedCase(null)} />}

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "0.5px solid rgba(14,15,16,0.1)", background: "#ede9e0" }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-10 py-8 flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6">
          <div className="text-center sm:text-left">
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 600, color: "#0e0f10", marginBottom: 4 }}>NyayaAI</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              © {new Date().getFullYear()} NyayaAI Jurisdictional Systems.
            </div>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-7">
            {["Privacy Policy", "Terms of Service", "Legal Disclaimer", "Contact"].map(l => (
              <a key={l} href="#" style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#9a9ba0", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}