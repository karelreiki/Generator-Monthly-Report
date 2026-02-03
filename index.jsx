import { useState, useEffect, useRef } from "react";

const BRANCHES = ["Jatibening Bekasi", "Summarecon Bekasi", "Cikarang Bekasi"];
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const PROGRAM_OPTIONS_REGULAR = ["General English","TOEFL Preparation","IELTS Preparation","Business English","Conversation Class","Grammar Intensive","Kids English","Teens English"];
const PROGRAM_OPTIONS_PRIVATE = ["Private General English","Private TOEFL","Private IELTS","Private Business English","Private Conversation","Private Kids","Private Teens"];

const DEFAULT_BRANCH_DATA = () => ({
  revenue: "", target_revenue: "", prev_revenue: "",
  profit: "", target_profit: "", prev_profit: "",
  expenses: "", prev_expenses: "",
  expense_categories: [{ name: "", amount: "" }],
  regular_count: "", private_count: "",
  new_register: "", extension: "",
  regular_new: "", regular_ext: "",
  private_new: "", private_ext: "",
  top_regular: [{ program: PROGRAM_OPTIONS_REGULAR[0], count: "" }],
  top_private: [{ program: PROGRAM_OPTIONS_PRIVATE[0], count: "" }],
  revenue_by_program: [{ program: "", revenue: "" }],
});

const DEFAULT_DATA = () => ({
  month: MONTHS[new Date().getMonth()],
  year: new Date().getFullYear().toString(),
  branches: Object.fromEntries(BRANCHES.map(b => [b, DEFAULT_BRANCH_DATA()])),
  sales_staff: [{ name: "", target: "", achieved: "", deals: "" }],
  aftersales_staff: [{ name: "", retention_target: "", retention_achieved: "", followups: "", resolutions: "" }],
  summary: "",
  done_projects: [{ title: "", description: "", branch: BRANCHES[0], status: "Selesai" }],
  future_plans: [{ title: "", description: "", branch: BRANCHES[0], timeline: "" }],
});

const fmt = (n) => {
  const num = parseFloat(n);
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("id-ID").format(num);
};
const fmtRp = (n) => `Rp ${fmt(n)}`;
const pct = (a, b) => {
  const na = parseFloat(a), nb = parseFloat(b);
  if (isNaN(na) || isNaN(nb) || nb === 0) return "0";
  return ((na / nb) * 100).toFixed(1);
};
const growth = (curr, prev) => {
  const c = parseFloat(curr), p = parseFloat(prev);
  if (isNaN(c) || isNaN(p) || p === 0) return 0;
  return (((c - p) / p) * 100).toFixed(1);
};

// ─── Style Constants ─────────────────────────────────────────
const COLORS = {
  bg: "#0B0F1A",
  card: "#111827",
  cardAlt: "#1A2236",
  accent: "#F59E0B",
  accentDim: "#D97706",
  accentGlow: "rgba(245,158,11,0.15)",
  green: "#10B981",
  greenDim: "#059669",
  red: "#EF4444",
  redDim: "#DC2626",
  blue: "#3B82F6",
  blueDim: "#2563EB",
  purple: "#8B5CF6",
  text: "#F9FAFB",
  textMuted: "#9CA3AF",
  textDim: "#6B7280",
  border: "#1F2937",
  borderLight: "#374151",
  inputBg: "#0D1117",
};

const FONT = `'Outfit', sans-serif`;
const FONT_MONO = `'JetBrains Mono', monospace`;

// ─── Shared Components ──────────────────────────────────────
const Badge = ({ children, color = COLORS.accent, bg }) => (
  <span style={{
    display: "inline-block", padding: "3px 10px", borderRadius: 6,
    background: bg || `${color}22`, color, fontSize: 11, fontWeight: 600,
    fontFamily: FONT_MONO, letterSpacing: 0.5, textTransform: "uppercase",
  }}>{children}</span>
);

const StatCard = ({ label, value, sub, color = COLORS.accent, icon }) => (
  <div style={{
    background: COLORS.card, borderRadius: 14, padding: "20px 22px",
    border: `1px solid ${COLORS.border}`, position: "relative", overflow: "hidden",
    flex: 1, minWidth: 180,
  }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color }} />
    <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6, fontWeight: 500 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.text, fontFamily: FONT_MONO }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: sub.startsWith("-") ? COLORS.red : COLORS.green, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
  </div>
);

const SectionTitle = ({ children, accent = COLORS.accent }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
    <div style={{ width: 4, height: 28, borderRadius: 4, background: accent }} />
    <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, margin: 0, fontFamily: FONT }}>{children}</h2>
  </div>
);

const ProgressBar = ({ value, max, color = COLORS.accent, height = 10 }) => {
  const p = Math.min(parseFloat(pct(value, max)), 100);
  return (
    <div style={{ background: COLORS.inputBg, borderRadius: height, height, width: "100%", overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: height, width: `${p}%`,
        background: `linear-gradient(90deg, ${color}, ${color}CC)`,
        transition: "width 0.6s ease",
      }} />
    </div>
  );
};

const MiniTable = ({ headers, rows, accent = COLORS.accent }) => (
  <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: FONT }}>
      <thead>
        <tr style={{ background: COLORS.cardAlt }}>
          {headers.map((h, i) => (
            <th key={i} style={{
              padding: "10px 14px", textAlign: i === 0 ? "left" : "right",
              color: COLORS.textMuted, fontWeight: 600, fontSize: 11,
              textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `2px solid ${accent}33`,
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ background: ri % 2 === 0 ? COLORS.card : COLORS.cardAlt }}>
            {row.map((cell, ci) => (
              <td key={ci} style={{
                padding: "10px 14px", textAlign: ci === 0 ? "left" : "right",
                color: ci === 0 ? COLORS.text : COLORS.textMuted, fontWeight: ci === 0 ? 500 : 400,
                borderBottom: `1px solid ${COLORS.border}`,
                fontFamily: ci > 0 ? FONT_MONO : FONT,
              }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Simple Bar Chart ───────────────────────────────────────
const BarChart = ({ data, color = COLORS.accent, height = 180 }) => {
  const maxVal = Math.max(...data.map(d => parseFloat(d.value) || 0), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height, padding: "0 4px" }}>
      {data.map((d, i) => {
        const h = ((parseFloat(d.value) || 0) / maxVal) * (height - 30);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: FONT_MONO }}>{fmt(d.value)}</span>
            <div style={{
              width: "100%", maxWidth: 48, height: Math.max(h, 4), borderRadius: "6px 6px 2px 2px",
              background: `linear-gradient(180deg, ${color}, ${color}88)`,
              transition: "height 0.5s ease",
            }} />
            <span style={{ fontSize: 10, color: COLORS.textDim, textAlign: "center", lineHeight: 1.2 }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Donut Chart ────────────────────────────────────────────
const DonutChart = ({ segments, size = 140 }) => {
  const total = segments.reduce((s, x) => s + (parseFloat(x.value) || 0), 0);
  let cumulative = 0;
  const r = size / 2 - 10, cx = size / 2, cy = size / 2, sw = 18;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.inputBg} strokeWidth={sw} />
        {segments.map((seg, i) => {
          const pctVal = total > 0 ? (parseFloat(seg.value) || 0) / total : 0;
          const offset = circ * (1 - cumulative);
          cumulative += pctVal;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={sw}
              strokeDasharray={`${circ * pctVal} ${circ * (1 - pctVal)}`}
              strokeDashoffset={offset} strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: seg.color }} />
            <span style={{ color: COLORS.textMuted }}>{seg.label}</span>
            <span style={{ color: COLORS.text, fontWeight: 600, fontFamily: FONT_MONO, marginLeft: "auto" }}>{fmt(seg.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


// ─── DATA ENTRY FORM ────────────────────────────────────────
const InputField = ({ label, value, onChange, type = "text", placeholder, width, mono }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: width ? "none" : 1, width }}>
    {label && <label style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>}
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder || label}
      style={{
        background: COLORS.inputBg, border: `1px solid ${COLORS.border}`, borderRadius: 8,
        padding: "9px 12px", color: COLORS.text, fontSize: 13,
        fontFamily: mono ? FONT_MONO : FONT, outline: "none", width: "100%", boxSizing: "border-box",
        transition: "border-color 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = COLORS.accent}
      onBlur={e => e.target.style.borderColor = COLORS.border}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
    {label && <label style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        background: COLORS.inputBg, border: `1px solid ${COLORS.border}`, borderRadius: 8,
        padding: "9px 12px", color: COLORS.text, fontSize: 13, fontFamily: FONT, outline: "none",
        cursor: "pointer",
      }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const TextArea = ({ label, value, onChange, rows = 4 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>}
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
      style={{
        background: COLORS.inputBg, border: `1px solid ${COLORS.border}`, borderRadius: 8,
        padding: "10px 12px", color: COLORS.text, fontSize: 13, fontFamily: FONT,
        outline: "none", resize: "vertical", lineHeight: 1.6,
      }}
      onFocus={e => e.target.style.borderColor = COLORS.accent}
      onBlur={e => e.target.style.borderColor = COLORS.border}
    />
  </div>
);

const AddRowBtn = ({ onClick, label }) => (
  <button onClick={onClick} style={{
    background: "none", border: `1px dashed ${COLORS.borderLight}`, borderRadius: 8,
    padding: "8px 16px", color: COLORS.textDim, fontSize: 12, cursor: "pointer",
    display: "flex", alignItems: "center", gap: 6, fontFamily: FONT,
    transition: "all 0.2s",
  }}
    onMouseEnter={e => { e.target.style.borderColor = COLORS.accent; e.target.style.color = COLORS.accent; }}
    onMouseLeave={e => { e.target.style.borderColor = COLORS.borderLight; e.target.style.color = COLORS.textDim; }}
  >+ {label}</button>
);

const RemoveBtn = ({ onClick }) => (
  <button onClick={onClick} style={{
    background: `${COLORS.red}15`, border: "none", borderRadius: 6,
    width: 28, height: 28, color: COLORS.red, fontSize: 16, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.2s", flexShrink: 0, marginTop: 18,
  }}
    onMouseEnter={e => e.target.style.background = `${COLORS.red}30`}
    onMouseLeave={e => e.target.style.background = `${COLORS.red}15`}
  >×</button>
);

const FormSection = ({ title, children, accent }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 3, height: 20, borderRadius: 3, background: accent || COLORS.accent }} />
      <h3 style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, margin: 0 }}>{title}</h3>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingLeft: 13 }}>
      {children}
    </div>
  </div>
);

// ─── DATA ENTRY PANEL ───────────────────────────────────────
const DataEntryPanel = ({ data, setData }) => {
  const [activeTab, setActiveTab] = useState("general");
  const [activeBranch, setActiveBranch] = useState(BRANCHES[0]);

  const updateBranch = (field, val) => {
    setData(prev => ({
      ...prev,
      branches: { ...prev.branches, [activeBranch]: { ...prev.branches[activeBranch], [field]: val } }
    }));
  };

  const updateArrayField = (base, index, field, val) => {
    setData(prev => {
      const arr = [...prev[base]];
      arr[index] = { ...arr[index], [field]: val };
      return { ...prev, [base]: arr };
    });
  };

  const updateBranchArray = (arrName, index, field, val) => {
    setData(prev => {
      const bData = { ...prev.branches[activeBranch] };
      const arr = [...bData[arrName]];
      arr[index] = { ...arr[index], [field]: val };
      bData[arrName] = arr;
      return { ...prev, branches: { ...prev.branches, [activeBranch]: bData } };
    });
  };

  const addBranchArrayRow = (arrName, template) => {
    setData(prev => {
      const bData = { ...prev.branches[activeBranch] };
      bData[arrName] = [...bData[arrName], template];
      return { ...prev, branches: { ...prev.branches, [activeBranch]: bData } };
    });
  };

  const removeBranchArrayRow = (arrName, index) => {
    setData(prev => {
      const bData = { ...prev.branches[activeBranch] };
      bData[arrName] = bData[arrName].filter((_, i) => i !== index);
      return { ...prev, branches: { ...prev.branches, [activeBranch]: bData } };
    });
  };

  const bd = data.branches[activeBranch];

  const tabs = [
    { id: "general", label: "General" },
    { id: "branch", label: "Per Cabang" },
    { id: "staff", label: "Staff" },
    { id: "plans", label: "Plans" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Tabs */}
      <div style={{
        display: "flex", gap: 2, padding: "12px 20px 0", background: COLORS.card,
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "10px 18px", fontSize: 12, fontWeight: 600, fontFamily: FONT,
            background: activeTab === t.id ? COLORS.bg : "transparent",
            color: activeTab === t.id ? COLORS.accent : COLORS.textDim,
            border: "none", borderRadius: "8px 8px 0 0", cursor: "pointer",
            borderBottom: activeTab === t.id ? `2px solid ${COLORS.accent}` : "2px solid transparent",
            transition: "all 0.2s",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        {/* General */}
        {activeTab === "general" && (
          <>
            <FormSection title="Periode Report">
              <div style={{ display: "flex", gap: 12 }}>
                <SelectField label="Bulan" value={data.month} onChange={v => setData(p => ({ ...p, month: v }))} options={MONTHS} />
                <InputField label="Tahun" value={data.year} onChange={v => setData(p => ({ ...p, year: v }))} mono />
              </div>
            </FormSection>
            <FormSection title="Ringkasan Report">
              <TextArea label="Executive Summary" value={data.summary} onChange={v => setData(p => ({ ...p, summary: v }))} rows={6} />
            </FormSection>
          </>
        )}

        {/* Branch Data */}
        {activeTab === "branch" && (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {BRANCHES.map(b => (
                <button key={b} onClick={() => setActiveBranch(b)} style={{
                  padding: "8px 14px", fontSize: 11, fontWeight: 600, fontFamily: FONT,
                  background: activeBranch === b ? COLORS.accent : COLORS.cardAlt,
                  color: activeBranch === b ? COLORS.bg : COLORS.textMuted,
                  border: "none", borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
                }}>{b}</button>
              ))}
            </div>

            <FormSection title="Revenue" accent={COLORS.accent}>
              <div style={{ display: "flex", gap: 12 }}>
                <InputField label="Revenue Bulan Ini" value={bd.revenue} onChange={v => updateBranch("revenue", v)} mono placeholder="e.g. 150000000" />
                <InputField label="Target Revenue" value={bd.target_revenue} onChange={v => updateBranch("target_revenue", v)} mono />
                <InputField label="Revenue Bulan Lalu" value={bd.prev_revenue} onChange={v => updateBranch("prev_revenue", v)} mono />
              </div>
            </FormSection>

            <FormSection title="Profit" accent={COLORS.green}>
              <div style={{ display: "flex", gap: 12 }}>
                <InputField label="Profit Bulan Ini" value={bd.profit} onChange={v => updateBranch("profit", v)} mono />
                <InputField label="Target Profit" value={bd.target_profit} onChange={v => updateBranch("target_profit", v)} mono />
                <InputField label="Profit Bulan Lalu" value={bd.prev_profit} onChange={v => updateBranch("prev_profit", v)} mono />
              </div>
            </FormSection>

            <FormSection title="Expenses" accent={COLORS.red}>
              <div style={{ display: "flex", gap: 12 }}>
                <InputField label="Total Expenses" value={bd.expenses} onChange={v => updateBranch("expenses", v)} mono />
                <InputField label="Expenses Bulan Lalu" value={bd.prev_expenses} onChange={v => updateBranch("prev_expenses", v)} mono />
              </div>
              <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>Breakdown Kategori:</div>
              {bd.expense_categories.map((cat, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <InputField label={i === 0 ? "Kategori" : ""} value={cat.name} onChange={v => updateBranchArray("expense_categories", i, "name", v)} placeholder="e.g. Gaji, Sewa, Marketing" />
                  <InputField label={i === 0 ? "Jumlah" : ""} value={cat.amount} onChange={v => updateBranchArray("expense_categories", i, "amount", v)} mono placeholder="Nominal" />
                  {bd.expense_categories.length > 1 && <RemoveBtn onClick={() => removeBranchArrayRow("expense_categories", i)} />}
                </div>
              ))}
              <AddRowBtn onClick={() => addBranchArrayRow("expense_categories", { name: "", amount: "" })} label="Tambah Kategori" />
            </FormSection>

            <FormSection title="Transaction Analysis" accent={COLORS.blue}>
              <div style={{ display: "flex", gap: 12 }}>
                <InputField label="Jumlah Kelas Regular" value={bd.regular_count} onChange={v => updateBranch("regular_count", v)} mono />
                <InputField label="Jumlah Kelas Private" value={bd.private_count} onChange={v => updateBranch("private_count", v)} mono />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <InputField label="Register Baru (Regular)" value={bd.regular_new} onChange={v => updateBranch("regular_new", v)} mono />
                <InputField label="Perpanjangan (Regular)" value={bd.regular_ext} onChange={v => updateBranch("regular_ext", v)} mono />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <InputField label="Register Baru (Private)" value={bd.private_new} onChange={v => updateBranch("private_new", v)} mono />
                <InputField label="Perpanjangan (Private)" value={bd.private_ext} onChange={v => updateBranch("private_ext", v)} mono />
              </div>

              <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 8 }}>Top Program - Regular:</div>
              {bd.top_regular.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <SelectField label={i === 0 ? "Program" : ""} value={p.program} onChange={v => updateBranchArray("top_regular", i, "program", v)} options={PROGRAM_OPTIONS_REGULAR} />
                  <InputField label={i === 0 ? "Jumlah" : ""} value={p.count} onChange={v => updateBranchArray("top_regular", i, "count", v)} mono width={100} />
                  {bd.top_regular.length > 1 && <RemoveBtn onClick={() => removeBranchArrayRow("top_regular", i)} />}
                </div>
              ))}
              <AddRowBtn onClick={() => addBranchArrayRow("top_regular", { program: PROGRAM_OPTIONS_REGULAR[0], count: "" })} label="Tambah Program Regular" />

              <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 8 }}>Top Program - Private:</div>
              {bd.top_private.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <SelectField label={i === 0 ? "Program" : ""} value={p.program} onChange={v => updateBranchArray("top_private", i, "program", v)} options={PROGRAM_OPTIONS_PRIVATE} />
                  <InputField label={i === 0 ? "Jumlah" : ""} value={p.count} onChange={v => updateBranchArray("top_private", i, "count", v)} mono width={100} />
                  {bd.top_private.length > 1 && <RemoveBtn onClick={() => removeBranchArrayRow("top_private", i)} />}
                </div>
              ))}
              <AddRowBtn onClick={() => addBranchArrayRow("top_private", { program: PROGRAM_OPTIONS_PRIVATE[0], count: "" })} label="Tambah Program Private" />

              <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 8 }}>Revenue by Program:</div>
              {bd.revenue_by_program.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <InputField label={i === 0 ? "Nama Program" : ""} value={p.program} onChange={v => updateBranchArray("revenue_by_program", i, "program", v)} placeholder="Nama Program" />
                  <InputField label={i === 0 ? "Revenue" : ""} value={p.revenue} onChange={v => updateBranchArray("revenue_by_program", i, "revenue", v)} mono placeholder="Nominal" />
                  {bd.revenue_by_program.length > 1 && <RemoveBtn onClick={() => removeBranchArrayRow("revenue_by_program", i)} />}
                </div>
              ))}
              <AddRowBtn onClick={() => addBranchArrayRow("revenue_by_program", { program: "", revenue: "" })} label="Tambah Program Revenue" />
            </FormSection>
          </>
        )}

        {/* Staff */}
        {activeTab === "staff" && (
          <>
            <FormSection title="Sales Staff Achievement" accent={COLORS.accent}>
              {data.sales_staff.map((s, i) => (
                <div key={i} style={{
                  background: COLORS.cardAlt, borderRadius: 10, padding: 14,
                  border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", gap: 10,
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: COLORS.textDim, fontWeight: 600, width: 24 }}>#{i + 1}</span>
                    <InputField label="" value={s.name} onChange={v => updateArrayField("sales_staff", i, "name", v)} placeholder="Nama Staff" />
                    {data.sales_staff.length > 1 && <RemoveBtn onClick={() => setData(p => ({ ...p, sales_staff: p.sales_staff.filter((_, j) => j !== i) }))} />}
                  </div>
                  <div style={{ display: "flex", gap: 10, paddingLeft: 34 }}>
                    <InputField label="Target" value={s.target} onChange={v => updateArrayField("sales_staff", i, "target", v)} mono />
                    <InputField label="Achieved" value={s.achieved} onChange={v => updateArrayField("sales_staff", i, "achieved", v)} mono />
                    <InputField label="Deals" value={s.deals} onChange={v => updateArrayField("sales_staff", i, "deals", v)} mono />
                  </div>
                </div>
              ))}
              <AddRowBtn onClick={() => setData(p => ({ ...p, sales_staff: [...p.sales_staff, { name: "", target: "", achieved: "", deals: "" }] }))} label="Tambah Sales Staff" />
            </FormSection>

            <FormSection title="After Sales Staff Achievement" accent={COLORS.purple}>
              {data.aftersales_staff.map((s, i) => (
                <div key={i} style={{
                  background: COLORS.cardAlt, borderRadius: 10, padding: 14,
                  border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", gap: 10,
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: COLORS.textDim, fontWeight: 600, width: 24 }}>#{i + 1}</span>
                    <InputField label="" value={s.name} onChange={v => updateArrayField("aftersales_staff", i, "name", v)} placeholder="Nama Staff" />
                    {data.aftersales_staff.length > 1 && <RemoveBtn onClick={() => setData(p => ({ ...p, aftersales_staff: p.aftersales_staff.filter((_, j) => j !== i) }))} />}
                  </div>
                  <div style={{ display: "flex", gap: 10, paddingLeft: 34 }}>
                    <InputField label="Retention Target" value={s.retention_target} onChange={v => updateArrayField("aftersales_staff", i, "retention_target", v)} mono />
                    <InputField label="Retention Achieved" value={s.retention_achieved} onChange={v => updateArrayField("aftersales_staff", i, "retention_achieved", v)} mono />
                    <InputField label="Follow Ups" value={s.followups} onChange={v => updateArrayField("aftersales_staff", i, "followups", v)} mono />
                    <InputField label="Resolutions" value={s.resolutions} onChange={v => updateArrayField("aftersales_staff", i, "resolutions", v)} mono />
                  </div>
                </div>
              ))}
              <AddRowBtn onClick={() => setData(p => ({ ...p, aftersales_staff: [...p.aftersales_staff, { name: "", retention_target: "", retention_achieved: "", followups: "", resolutions: "" }] }))} label="Tambah After Sales Staff" />
            </FormSection>
          </>
        )}

        {/* Plans */}
        {activeTab === "plans" && (
          <>
            <FormSection title="What We Have Done" accent={COLORS.green}>
              {data.done_projects.map((p, i) => (
                <div key={i} style={{
                  background: COLORS.cardAlt, borderRadius: 10, padding: 14,
                  border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", gap: 10,
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <InputField label="Judul Project" value={p.title} onChange={v => { const arr = [...data.done_projects]; arr[i] = { ...arr[i], title: v }; setData(prev => ({ ...prev, done_projects: arr })); }} />
                    <SelectField label="Cabang" value={p.branch} onChange={v => { const arr = [...data.done_projects]; arr[i] = { ...arr[i], branch: v }; setData(prev => ({ ...prev, done_projects: arr })); }} options={BRANCHES} />
                    <SelectField label="Status" value={p.status} onChange={v => { const arr = [...data.done_projects]; arr[i] = { ...arr[i], status: v }; setData(prev => ({ ...prev, done_projects: arr })); }} options={["Selesai", "In Progress", "On Hold"]} />
                    {data.done_projects.length > 1 && <RemoveBtn onClick={() => setData(prev => ({ ...prev, done_projects: prev.done_projects.filter((_, j) => j !== i) }))} />}
                  </div>
                  <TextArea label="Deskripsi" value={p.description} onChange={v => { const arr = [...data.done_projects]; arr[i] = { ...arr[i], description: v }; setData(prev => ({ ...prev, done_projects: arr })); }} rows={2} />
                </div>
              ))}
              <AddRowBtn onClick={() => setData(prev => ({ ...prev, done_projects: [...prev.done_projects, { title: "", description: "", branch: BRANCHES[0], status: "Selesai" }] }))} label="Tambah Project" />
            </FormSection>

            <FormSection title="Future Plans" accent={COLORS.blue}>
              {data.future_plans.map((p, i) => (
                <div key={i} style={{
                  background: COLORS.cardAlt, borderRadius: 10, padding: 14,
                  border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", gap: 10,
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <InputField label="Judul Rencana" value={p.title} onChange={v => { const arr = [...data.future_plans]; arr[i] = { ...arr[i], title: v }; setData(prev => ({ ...prev, future_plans: arr })); }} />
                    <SelectField label="Cabang" value={p.branch} onChange={v => { const arr = [...data.future_plans]; arr[i] = { ...arr[i], branch: v }; setData(prev => ({ ...prev, future_plans: arr })); }} options={BRANCHES} />
                    <InputField label="Timeline" value={p.timeline} onChange={v => { const arr = [...data.future_plans]; arr[i] = { ...arr[i], timeline: v }; setData(prev => ({ ...prev, future_plans: arr })); }} placeholder="e.g. Feb 2025" />
                    {data.future_plans.length > 1 && <RemoveBtn onClick={() => setData(prev => ({ ...prev, future_plans: prev.future_plans.filter((_, j) => j !== i) }))} />}
                  </div>
                  <TextArea label="Deskripsi" value={p.description} onChange={v => { const arr = [...data.future_plans]; arr[i] = { ...arr[i], description: v }; setData(prev => ({ ...prev, future_plans: arr })); }} rows={2} />
                </div>
              ))}
              <AddRowBtn onClick={() => setData(prev => ({ ...prev, future_plans: [...prev.future_plans, { title: "", description: "", branch: BRANCHES[0], timeline: "" }] }))} label="Tambah Rencana" />
            </FormSection>
          </>
        )}
      </div>
    </div>
  );
};


// ─── PRESENTATION SLIDES ────────────────────────────────────

const SlideWrapper = ({ children, slideNum, totalSlides }) => (
  <div style={{
    background: COLORS.bg, borderRadius: 16, minHeight: 520, padding: "36px 40px",
    border: `1px solid ${COLORS.border}`, position: "relative", overflow: "hidden",
  }}>
    {/* Decorative accent line */}
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.blue}, ${COLORS.purple})` }} />
    {children}
    <div style={{
      position: "absolute", bottom: 14, right: 20, fontSize: 11,
      color: COLORS.textDim, fontFamily: FONT_MONO,
    }}>{slideNum} / {totalSlides}</div>
  </div>
);

// Slide 0: Cover
const SlideCover = ({ data, sn, ts }) => (
  <SlideWrapper slideNum={sn} totalSlides={ts}>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 450 }}>
      <Badge color={COLORS.accent}>Monthly Report</Badge>
      <h1 style={{ fontSize: 42, fontWeight: 800, color: COLORS.text, margin: "20px 0 8px", textAlign: "center", fontFamily: FONT, letterSpacing: -1 }}>
        Golden English Bekasi
      </h1>
      <p style={{ fontSize: 22, color: COLORS.accent, fontWeight: 600, fontFamily: FONT_MONO, margin: 0 }}>
        {data.month} {data.year}
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
        {BRANCHES.map(b => <Badge key={b} color={COLORS.textMuted}>{b}</Badge>)}
      </div>
    </div>
  </SlideWrapper>
);

// Slide: Revenue per branch
const SlideRevenue = ({ data, branch, sn, ts }) => {
  const bd = data.branches[branch];
  const g = growth(bd.revenue, bd.prev_revenue);
  const ach = pct(bd.revenue, bd.target_revenue);
  return (
    <SlideWrapper slideNum={sn} totalSlides={ts}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <SectionTitle>Revenue Performance</SectionTitle>
        <Badge color={COLORS.accent}>{branch}</Badge>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        <StatCard label="Revenue" value={fmtRp(bd.revenue)} sub={`${g >= 0 ? "+" : ""}${g}% vs bulan lalu`} color={COLORS.accent} />
        <StatCard label="Target" value={fmtRp(bd.target_revenue)} color={COLORS.textDim} />
        <StatCard label="Achievement" value={`${ach}%`} sub={parseFloat(ach) >= 100 ? "Target tercapai ✓" : "Below target"} color={parseFloat(ach) >= 100 ? COLORS.green : COLORS.red} />
      </div>
      <div style={{ background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12, fontWeight: 500 }}>Revenue vs Target</div>
        <BarChart data={[
          { label: "Bulan Lalu", value: bd.prev_revenue },
          { label: "Bulan Ini", value: bd.revenue },
          { label: "Target", value: bd.target_revenue },
        ]} color={COLORS.accent} height={160} />
      </div>
    </SlideWrapper>
  );
};

// Slide: Profit per branch
const SlideProfit = ({ data, branch, sn, ts }) => {
  const bd = data.branches[branch];
  const g = growth(bd.profit, bd.prev_profit);
  const ach = pct(bd.profit, bd.target_profit);
  const margin = pct(bd.profit, bd.revenue);
  return (
    <SlideWrapper slideNum={sn} totalSlides={ts}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <SectionTitle accent={COLORS.green}>Profit Performance</SectionTitle>
        <Badge color={COLORS.green}>{branch}</Badge>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        <StatCard label="Profit" value={fmtRp(bd.profit)} sub={`${g >= 0 ? "+" : ""}${g}% vs bulan lalu`} color={COLORS.green} />
        <StatCard label="Target" value={fmtRp(bd.target_profit)} color={COLORS.textDim} />
        <StatCard label="Profit Margin" value={`${margin}%`} color={COLORS.green} />
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1, background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>Achievement</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: parseFloat(ach) >= 100 ? COLORS.green : COLORS.accent, fontFamily: FONT_MONO, marginBottom: 12 }}>{ach}%</div>
          <ProgressBar value={bd.profit} max={bd.target_profit} color={parseFloat(ach) >= 100 ? COLORS.green : COLORS.accent} height={12} />
        </div>
        <div style={{ flex: 1, background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>Profit Comparison</div>
          <BarChart data={[
            { label: "Bulan Lalu", value: bd.prev_profit },
            { label: "Bulan Ini", value: bd.profit },
            { label: "Target", value: bd.target_profit },
          ]} color={COLORS.green} height={120} />
        </div>
      </div>
    </SlideWrapper>
  );
};

// Slide: Expenses per branch
const SlideExpenses = ({ data, branch, sn, ts }) => {
  const bd = data.branches[branch];
  const g = growth(bd.expenses, bd.prev_expenses);
  const cats = bd.expense_categories.filter(c => c.name && c.amount);
  const expenseColors = [COLORS.red, COLORS.accent, COLORS.blue, COLORS.purple, COLORS.green, "#EC4899", "#14B8A6"];
  return (
    <SlideWrapper slideNum={sn} totalSlides={ts}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <SectionTitle accent={COLORS.red}>Expenses</SectionTitle>
        <Badge color={COLORS.red}>{branch}</Badge>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Expenses" value={fmtRp(bd.expenses)} sub={`${g >= 0 ? "+" : ""}${g}% vs bulan lalu`} color={COLORS.red} />
        <StatCard label="Bulan Lalu" value={fmtRp(bd.prev_expenses)} color={COLORS.textDim} />
        <StatCard label="Expense Ratio" value={`${pct(bd.expenses, bd.revenue)}%`} sub="dari revenue" color={COLORS.accent} />
      </div>
      {cats.length > 0 && (
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1, background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>Breakdown Kategori</div>
            <DonutChart segments={cats.map((c, i) => ({ label: c.name, value: c.amount, color: expenseColors[i % expenseColors.length] }))} />
          </div>
          <div style={{ flex: 1, background: COLORS.card, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>Detail</div>
            <MiniTable
              headers={["Kategori", "Jumlah", "%"]}
              rows={cats.map(c => [c.name, fmtRp(c.amount), `${pct(c.amount, bd.expenses)}%`])}
              accent={COLORS.red}
            />
          </div>
        </div>
      )}
    </SlideWrapper>
  );
};

// Slide: Transactions per branch
const SlideTransactions = ({ data, branch, sn, ts }) => {
  const bd = data.branches[branch];
  const totalNew = (parseInt(bd.regular_new) || 0) + (parseInt(bd.private_new) || 0);
  const totalExt = (parseInt(bd.regular_ext) || 0) + (parseInt(bd.private_ext) || 0);
  const topReg = bd.top_regular.filter(p => p.count);
  const topPrv = bd.top_private.filter(p => p.count);
  const revProg = bd.revenue_by_program.filter(p => p.program && p.revenue);
  return (
    <SlideWrapper slideNum={sn} totalSlides={ts}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <SectionTitle accent={COLORS.blue}>Transaction Analysis</SectionTitle>
        <Badge color={COLORS.blue}>{branch}</Badge>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <StatCard label="Kelas Regular" value={fmt(bd.regular_count)} color={COLORS.blue} />
        <StatCard label="Kelas Private" value={fmt(bd.private_count)} color={COLORS.purple} />
        <StatCard label="Register Baru" value={fmt(totalNew)} color={COLORS.green} />
        <StatCard label="Perpanjangan" value={fmt(totalExt)} color={COLORS.accent} />
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1, background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>New vs Extension</div>
          <DonutChart size={120} segments={[
            { label: `Baru (Reg)`, value: bd.regular_new, color: COLORS.blue },
            { label: `Ext (Reg)`, value: bd.regular_ext, color: COLORS.blueDim },
            { label: `Baru (Prv)`, value: bd.private_new, color: COLORS.purple },
            { label: `Ext (Prv)`, value: bd.private_ext, color: "#7C3AED" },
          ]} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {topReg.length > 0 && (
            <div style={{ background: COLORS.card, borderRadius: 14, padding: 16, border: `1px solid ${COLORS.border}`, flex: 1 }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>Top Regular Programs</div>
              {topReg.sort((a, b) => (parseInt(b.count) || 0) - (parseInt(a.count) || 0)).map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                  <span style={{ fontSize: 12, color: COLORS.text }}>{p.program}</span>
                  <span style={{ fontSize: 12, color: COLORS.blue, fontFamily: FONT_MONO, fontWeight: 600 }}>{p.count}</span>
                </div>
              ))}
            </div>
          )}
          {topPrv.length > 0 && (
            <div style={{ background: COLORS.card, borderRadius: 14, padding: 16, border: `1px solid ${COLORS.border}`, flex: 1 }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>Top Private Programs</div>
              {topPrv.sort((a, b) => (parseInt(b.count) || 0) - (parseInt(a.count) || 0)).map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                  <span style={{ fontSize: 12, color: COLORS.text }}>{p.program}</span>
                  <span style={{ fontSize: 12, color: COLORS.purple, fontFamily: FONT_MONO, fontWeight: 600 }}>{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {revProg.length > 0 && (
        <div style={{ marginTop: 16, background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>Revenue by Program</div>
          <BarChart data={revProg.map(p => ({ label: p.program, value: p.revenue }))} color={COLORS.accent} height={130} />
        </div>
      )}
    </SlideWrapper>
  );
};

// Slide: Sales Staff
const SlideSalesStaff = ({ data, sn, ts }) => {
  const staff = data.sales_staff.filter(s => s.name);
  return (
    <SlideWrapper slideNum={sn} totalSlides={ts}>
      <SectionTitle accent={COLORS.accent}>Sales Staff Achievement</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {staff.map((s, i) => {
          const ach = pct(s.achieved, s.target);
          return (
            <div key={i} style={{
              background: COLORS.card, borderRadius: 14, padding: "18px 22px",
              border: `1px solid ${COLORS.border}`, display: "flex", gap: 20, alignItems: "center",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDim})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 700, color: COLORS.bg, flexShrink: 0,
              }}>{s.name.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{s.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: FONT_MONO, color: parseFloat(ach) >= 100 ? COLORS.green : COLORS.accent }}>{ach}%</span>
                </div>
                <ProgressBar value={s.achieved} max={s.target} color={parseFloat(ach) >= 100 ? COLORS.green : COLORS.accent} />
                <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>Target: <span style={{ color: COLORS.textMuted, fontFamily: FONT_MONO }}>{fmtRp(s.target)}</span></span>
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>Achieved: <span style={{ color: COLORS.textMuted, fontFamily: FONT_MONO }}>{fmtRp(s.achieved)}</span></span>
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>Deals: <span style={{ color: COLORS.textMuted, fontFamily: FONT_MONO }}>{s.deals}</span></span>
                </div>
              </div>
            </div>
          );
        })}
        {staff.length === 0 && <div style={{ color: COLORS.textDim, fontSize: 13, textAlign: "center", padding: 40 }}>No sales staff data entered</div>}
      </div>
    </SlideWrapper>
  );
};

// Slide: After Sales Staff
const SlideAfterSalesStaff = ({ data, sn, ts }) => {
  const staff = data.aftersales_staff.filter(s => s.name);
  return (
    <SlideWrapper slideNum={sn} totalSlides={ts}>
      <SectionTitle accent={COLORS.purple}>After Sales Staff Achievement</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {staff.map((s, i) => {
          const ach = pct(s.retention_achieved, s.retention_target);
          return (
            <div key={i} style={{
              background: COLORS.card, borderRadius: 14, padding: "18px 22px",
              border: `1px solid ${COLORS.border}`, display: "flex", gap: 20, alignItems: "center",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `linear-gradient(135deg, ${COLORS.purple}, #7C3AED)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>{s.name.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{s.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: FONT_MONO, color: parseFloat(ach) >= 100 ? COLORS.green : COLORS.purple }}>{ach}%</span>
                </div>
                <ProgressBar value={s.retention_achieved} max={s.retention_target} color={parseFloat(ach) >= 100 ? COLORS.green : COLORS.purple} />
                <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>Target: <span style={{ color: COLORS.textMuted, fontFamily: FONT_MONO }}>{fmt(s.retention_target)}</span></span>
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>Achieved: <span style={{ color: COLORS.textMuted, fontFamily: FONT_MONO }}>{fmt(s.retention_achieved)}</span></span>
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>Follow Ups: <span style={{ color: COLORS.textMuted, fontFamily: FONT_MONO }}>{s.followups}</span></span>
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>Resolved: <span style={{ color: COLORS.textMuted, fontFamily: FONT_MONO }}>{s.resolutions}</span></span>
                </div>
              </div>
            </div>
          );
        })}
        {staff.length === 0 && <div style={{ color: COLORS.textDim, fontSize: 13, textAlign: "center", padding: 40 }}>No after sales staff data entered</div>}
      </div>
    </SlideWrapper>
  );
};

// Slide: Summary
const SlideSummary = ({ data, sn, ts }) => {
  const totalRev = BRANCHES.reduce((s, b) => s + (parseFloat(data.branches[b].revenue) || 0), 0);
  const totalProfit = BRANCHES.reduce((s, b) => s + (parseFloat(data.branches[b].profit) || 0), 0);
  const totalExp = BRANCHES.reduce((s, b) => s + (parseFloat(data.branches[b].expenses) || 0), 0);
  return (
    <SlideWrapper slideNum={sn} totalSlides={ts}>
      <SectionTitle accent={COLORS.accent}>Ringkasan Report — {data.month} {data.year}</SectionTitle>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Revenue" value={fmtRp(totalRev)} color={COLORS.accent} />
        <StatCard label="Total Profit" value={fmtRp(totalProfit)} color={COLORS.green} />
        <StatCard label="Total Expenses" value={fmtRp(totalExp)} color={COLORS.red} />
      </div>
      <MiniTable
        headers={["Cabang", "Revenue", "Profit", "Expenses", "Margin"]}
        rows={BRANCHES.map(b => {
          const bd = data.branches[b];
          return [b, fmtRp(bd.revenue), fmtRp(bd.profit), fmtRp(bd.expenses), `${pct(bd.profit, bd.revenue)}%`];
        })}
      />
      {data.summary && (
        <div style={{
          marginTop: 24, background: COLORS.card, borderRadius: 14, padding: "20px 24px",
          border: `1px solid ${COLORS.border}`, borderLeft: `4px solid ${COLORS.accent}`,
        }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>Executive Summary</div>
          <p style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{data.summary}</p>
        </div>
      )}
    </SlideWrapper>
  );
};

// Slide: Done Projects & Future Plans
const SlidePlans = ({ data, sn, ts }) => {
  const dones = data.done_projects.filter(p => p.title);
  const plans = data.future_plans.filter(p => p.title);
  const statusColors = { "Selesai": COLORS.green, "In Progress": COLORS.accent, "On Hold": COLORS.textDim };
  return (
    <SlideWrapper slideNum={sn} totalSlides={ts}>
      <div style={{ display: "flex", gap: 28 }}>
        <div style={{ flex: 1 }}>
          <SectionTitle accent={COLORS.green}>What We Have Done</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {dones.map((p, i) => (
              <div key={i} style={{
                background: COLORS.card, borderRadius: 12, padding: "16px 18px",
                border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${statusColors[p.status] || COLORS.textDim}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{p.title}</span>
                  <Badge color={statusColors[p.status]}>{p.status}</Badge>
                </div>
                <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 4 }}>{p.branch}</div>
                {p.description && <p style={{ fontSize: 12, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>{p.description}</p>}
              </div>
            ))}
            {dones.length === 0 && <div style={{ color: COLORS.textDim, fontSize: 13, padding: 20 }}>Tidak ada project</div>}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <SectionTitle accent={COLORS.blue}>Future Plans</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {plans.map((p, i) => (
              <div key={i} style={{
                background: COLORS.card, borderRadius: 12, padding: "16px 18px",
                border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${COLORS.blue}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{p.title}</span>
                  {p.timeline && <Badge color={COLORS.blue}>{p.timeline}</Badge>}
                </div>
                <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 4 }}>{p.branch}</div>
                {p.description && <p style={{ fontSize: 12, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>{p.description}</p>}
              </div>
            ))}
            {plans.length === 0 && <div style={{ color: COLORS.textDim, fontSize: 13, padding: 20 }}>Belum ada rencana</div>}
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
};


// ─── MAIN APP ───────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(DEFAULT_DATA());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mode, setMode] = useState("entry"); // "entry" | "present"
  const slideRef = useRef(null);

  // Build slides array
  const slides = [];
  slides.push({ id: "cover", render: (sn, ts) => <SlideCover data={data} sn={sn} ts={ts} /> });
  BRANCHES.forEach(b => {
    slides.push({ id: `rev-${b}`, render: (sn, ts) => <SlideRevenue data={data} branch={b} sn={sn} ts={ts} /> });
    slides.push({ id: `prf-${b}`, render: (sn, ts) => <SlideProfit data={data} branch={b} sn={sn} ts={ts} /> });
    slides.push({ id: `exp-${b}`, render: (sn, ts) => <SlideExpenses data={data} branch={b} sn={sn} ts={ts} /> });
    slides.push({ id: `trx-${b}`, render: (sn, ts) => <SlideTransactions data={data} branch={b} sn={sn} ts={ts} /> });
  });
  slides.push({ id: "sales", render: (sn, ts) => <SlideSalesStaff data={data} sn={sn} ts={ts} /> });
  slides.push({ id: "aftersales", render: (sn, ts) => <SlideAfterSalesStaff data={data} sn={sn} ts={ts} /> });
  slides.push({ id: "summary", render: (sn, ts) => <SlideSummary data={data} sn={sn} ts={ts} /> });
  slides.push({ id: "plans", render: (sn, ts) => <SlidePlans data={data} sn={sn} ts={ts} /> });

  const totalSlides = slides.length;

  const goSlide = (dir) => {
    setCurrentSlide(prev => Math.max(0, Math.min(totalSlides - 1, prev + dir)));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (mode !== "present") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goSlide(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goSlide(-1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mode, totalSlides]);

  // Export JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `GE-Bekasi-Report-${data.month}-${data.year}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  // Import JSON
  const importJSON = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target.result);
          setData(imported);
        } catch { alert("Invalid JSON file"); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div style={{
      fontFamily: FONT, background: COLORS.bg, color: COLORS.text,
      minHeight: "100vh", display: "flex", flexDirection: "column",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", background: COLORS.card,
        borderBottom: `1px solid ${COLORS.border}`, position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDim})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: COLORS.bg,
          }}>GE</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.3 }}>Monthly Report Generator</div>
            <div style={{ fontSize: 11, color: COLORS.textDim }}>Golden English Bekasi</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={importJSON} style={{
            padding: "7px 14px", fontSize: 11, fontWeight: 600, fontFamily: FONT,
            background: COLORS.cardAlt, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`,
            borderRadius: 8, cursor: "pointer",
          }}>Import JSON</button>
          <button onClick={exportJSON} style={{
            padding: "7px 14px", fontSize: 11, fontWeight: 600, fontFamily: FONT,
            background: COLORS.cardAlt, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`,
            borderRadius: 8, cursor: "pointer",
          }}>Export JSON</button>
          <div style={{ width: 1, height: 24, background: COLORS.border, margin: "0 4px" }} />
          <button onClick={() => { setMode("entry"); setCurrentSlide(0); }} style={{
            padding: "7px 14px", fontSize: 11, fontWeight: 600, fontFamily: FONT,
            background: mode === "entry" ? COLORS.accent : COLORS.cardAlt,
            color: mode === "entry" ? COLORS.bg : COLORS.textMuted,
            border: "none", borderRadius: 8, cursor: "pointer",
          }}>Data Entry</button>
          <button onClick={() => setMode("present")} style={{
            padding: "7px 14px", fontSize: 11, fontWeight: 600, fontFamily: FONT,
            background: mode === "present" ? COLORS.accent : COLORS.cardAlt,
            color: mode === "present" ? COLORS.bg : COLORS.textMuted,
            border: "none", borderRadius: 8, cursor: "pointer",
          }}>Present</button>
        </div>
      </header>

      {/* Main Content */}
      {mode === "entry" ? (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left: Form */}
          <div style={{
            width: "42%", minWidth: 420, borderRight: `1px solid ${COLORS.border}`,
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <DataEntryPanel data={data} setData={setData} />
          </div>
          {/* Right: Live Preview */}
          <div style={{ flex: 1, overflow: "auto", padding: 28, background: "#080C16" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: COLORS.textDim, fontWeight: 500 }}>Live Preview</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => goSlide(-1)} disabled={currentSlide === 0} style={{
                  width: 32, height: 32, borderRadius: 8, border: `1px solid ${COLORS.border}`,
                  background: COLORS.card, color: currentSlide === 0 ? COLORS.textDim : COLORS.text,
                  cursor: currentSlide === 0 ? "default" : "pointer", fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>←</button>
                <div style={{
                  padding: "0 12px", display: "flex", alignItems: "center",
                  fontSize: 12, color: COLORS.textMuted, fontFamily: FONT_MONO,
                }}>{currentSlide + 1} / {totalSlides}</div>
                <button onClick={() => goSlide(1)} disabled={currentSlide === totalSlides - 1} style={{
                  width: 32, height: 32, borderRadius: 8, border: `1px solid ${COLORS.border}`,
                  background: COLORS.card, color: currentSlide === totalSlides - 1 ? COLORS.textDim : COLORS.text,
                  cursor: currentSlide === totalSlides - 1 ? "default" : "pointer", fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>→</button>
              </div>
            </div>
            <div ref={slideRef} style={{ maxWidth: 900, margin: "0 auto" }}>
              {slides[currentSlide]?.render(currentSlide + 1, totalSlides)}
            </div>
            {/* Slide thumbnails */}
            <div style={{
              display: "flex", gap: 6, marginTop: 20, overflowX: "auto",
              padding: "8px 0", justifyContent: "center", flexWrap: "wrap",
            }}>
              {slides.map((s, i) => (
                <button key={s.id} onClick={() => setCurrentSlide(i)} style={{
                  width: 10, height: 10, borderRadius: 5, border: "none",
                  background: i === currentSlide ? COLORS.accent : COLORS.borderLight,
                  cursor: "pointer", transition: "all 0.2s",
                  transform: i === currentSlide ? "scale(1.3)" : "scale(1)",
                }} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Presentation Mode */
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: 28, background: "#080C16",
        }}>
          <div style={{ maxWidth: 960, width: "100%" }}>
            {slides[currentSlide]?.render(currentSlide + 1, totalSlides)}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24, alignItems: "center" }}>
            <button onClick={() => goSlide(-1)} disabled={currentSlide === 0} style={{
              padding: "10px 20px", borderRadius: 10, border: `1px solid ${COLORS.border}`,
              background: COLORS.card, color: currentSlide === 0 ? COLORS.textDim : COLORS.text,
              cursor: currentSlide === 0 ? "default" : "pointer", fontFamily: FONT, fontWeight: 600, fontSize: 13,
            }}>← Previous</button>
            <span style={{ fontSize: 13, color: COLORS.textDim, fontFamily: FONT_MONO, minWidth: 60, textAlign: "center" }}>
              {currentSlide + 1} / {totalSlides}
            </span>
            <button onClick={() => goSlide(1)} disabled={currentSlide === totalSlides - 1} style={{
              padding: "10px 20px", borderRadius: 10, border: "none",
              background: currentSlide === totalSlides - 1 ? COLORS.borderLight : COLORS.accent,
              color: currentSlide === totalSlides - 1 ? COLORS.textDim : COLORS.bg,
              cursor: currentSlide === totalSlides - 1 ? "default" : "pointer", fontFamily: FONT, fontWeight: 600, fontSize: 13,
            }}>Next →</button>
          </div>
          <div style={{
            display: "flex", gap: 4, marginTop: 16, flexWrap: "wrap", justifyContent: "center",
          }}>
            {slides.map((s, i) => (
              <button key={s.id} onClick={() => setCurrentSlide(i)} style={{
                width: 8, height: 8, borderRadius: 4, border: "none",
                background: i === currentSlide ? COLORS.accent : COLORS.borderLight,
                cursor: "pointer", transition: "all 0.2s",
              }} />
            ))}
          </div>
          <p style={{ fontSize: 11, color: COLORS.textDim, marginTop: 16 }}>Use ← → arrow keys to navigate</p>
        </div>
      )}
    </div>
  );
}
