import { useEffect, useMemo, useState } from "react";
import "./App.css";

const BRAND = {
  red: "#B91C1C",
  orange: "#F97316",
  cream: "#FFF7ED",
  text: "#2E2E2E",
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getClientFingerprint() {
  try {
    const key = "diskursi_fp_v1";

    let fp = localStorage.getItem(key);
    if (!fp) {
      // Create a random ID once
      if (crypto.randomUUID) {
        fp = crypto.randomUUID();
      } else {
        fp = String(Math.random()).slice(2) + Date.now();
      }
      localStorage.setItem(key, fp);
    }

    return fp;
  } catch (e) {
    // If localStorage is blocked (very rare), return null
    return null;
  }
}


function formatTL(n) {
  // 120000 -> 120.000
  return new Intl.NumberFormat("tr-TR").format(n);
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function generateShareCardDataUrl(result) {
  // Canvas size optimized for Instagram story-ish screenshots (works anywhere)
  const W = 1080;
  const H = 1080;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = BRAND.cream;
  ctx.fillRect(0, 0, W, H);

  // Card container
  const pad = 80;
  const cardX = pad;
  const cardY = pad;
  const cardW = W - pad * 2;
  const cardH = H - pad * 2;

  // Rounded rectangle helper
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.10)";
  roundRect(cardX + 10, cardY + 12, cardW, cardH, 32);
  ctx.fill();

  // Card
  ctx.fillStyle = "#FFFFFF";
  roundRect(cardX, cardY, cardW, cardH, 32);
  ctx.fill();

  // Header bar
  ctx.fillStyle = BRAND.red;
  roundRect(cardX, cardY, cardW, 120, 32);
  ctx.fill();

  // Diskursi title
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 46px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Diskursi", cardX + 44, cardY + 78);

  // Subtitle
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "600 26px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Vergi Yükü Simülasyonu (yaklaşık)", cardX + 44, cardY + 108);

  // Main numbers
  const pctText = `%${result.result_tax_pct_min} – %${result.result_tax_pct_max}`;
  const tlText = `${formatTL(result.result_tl_min)} – ${formatTL(result.result_tl_max)} TL / yıl`;

  ctx.fillStyle = BRAND.text;
  ctx.font = "900 86px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText(pctText, cardX + 44, cardY + 260);

  ctx.fillStyle = "#333";
  ctx.font = "700 36px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText(tlText, cardX + 44, cardY + 320);

  // Aha line
  const monthsMin = Math.round((result.result_tax_pct_min / 100) * 12);
  const monthsMax = Math.round((result.result_tax_pct_max / 100) * 12);
  const aha = `Bu, yılda yaklaşık ${monthsMin}–${monthsMax} ay "vergiler için çalışmak" gibi.`;

  ctx.fillStyle = BRAND.orange;
  ctx.font = "800 32px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  wrapText(ctx, aha, cardX + 44, cardY + 410, cardW - 88, 40);

  // Details box
  const boxY = cardY + 520;
  ctx.fillStyle = "rgba(185, 28, 28, 0.08)";
  roundRect(cardX + 44, boxY, cardW - 88, 340, 22);
  ctx.fill();

  ctx.fillStyle = BRAND.text;
  ctx.font = "800 30px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Girdi özeti", cardX + 72, boxY + 60);

  ctx.fillStyle = "#444";
  ctx.font = "600 28px system-ui, -apple-system, Segoe UI, Roboto, Arial";

  const lines = [
    `Aylık brüt maaş: ${formatTL(result.wageGrossMonthly)} TL · Diğer gelir: ${formatTL(result.otherIncomeMonthly)} TL`,
    `Harcama dağılımı: Gıda ${result.food}%, Kira ${result.rent}%, Ulaşım ${result.transport}%, Diğer ${result.other}%`,
    `Araba: ${result.hasCar ? "Var" : "Yok"} · Sigara: ${result.smokes ? "Var" : "Yok"} · Alkol: ${result.drinksAlcohol ? "Var" : "Yok"
    }`,
  ];

  let y = boxY + 115;
  for (const line of lines) {
    wrapText(ctx, line, cardX + 72, y, cardW - 140, 36);
    y += 74;
  }

  // Footer
  ctx.fillStyle = "#666";
  ctx.font = "600 22px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("diskursi · anonim tahmin · v2", cardX + 44, cardY + cardH - 44);

  return canvas.toDataURL("image/png");
}

// helper: wrap text onto multiple lines
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}


function Card({ children }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{children}</div>;
}

function Toggle({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 12,
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "#fff",
        cursor: "pointer",
        userSelect: "none",
        flex: "1 1 220px",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 18, height: 18 }}
      />
      <span style={{ color: BRAND.text }}>{label}</span>
    </label>
  );
}

function Slider({ label, value, onChange }) {
  return (
    <div style={{ flex: "1 1 260px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: BRAND.text, fontWeight: 600 }}>{label}</span>
        <span style={{ color: "#555" }}>{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}

function MoneySlider({ label, value, onChange, min, max, step, hint }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 800, color: BRAND.text }}>{label}</div>
        <div style={{ fontWeight: 900, color: BRAND.text }}>
          {new Intl.NumberFormat("tr-TR").format(value)} TL
        </div>
      </div>

      {hint ? (
        <div style={{ marginTop: 4, fontSize: 12, color: "#666" }}>{hint}</div>
      ) : null}

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", marginTop: 10 }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#777" }}>
        <span>{new Intl.NumberFormat("tr-TR").format(min)} TL</span>
        <span>{new Intl.NumberFormat("tr-TR").format(max)} TL</span>
      </div>
    </div>
  );
}

function computeEstimateV2({
  wageGrossMonthly,
  otherIncomeMonthly,
  savingsRate,
  spend_food,
  spend_rent,
  spend_transport,
  spend_other,
  has_car,
  smokes,
  drinks_alcohol,
}) {
  const W = Math.max(0, Number(wageGrossMonthly) || 0) * 12;  // annual wage gross
  const O = Math.max(0, Number(otherIncomeMonthly) || 0) * 12; // annual other gross
  const annualGrossTotal = W + O;

  if (annualGrossTotal <= 0) {
    return null;
  }

  // Payroll deductions (wage only)
  const sgk = W * SGK_RATE;
  const ui = W * UI_RATE;
  const stamp = W * STAMP_RATE;

  // Wage taxable base (simple v2 assumption)
  const W_taxable = Math.max(0, W - sgk - ui);

  // Income tax on wage portion using wage brackets
  const taxWage = calcProgressiveTax(W_taxable, TAX_BRACKETS_WAGE_2026);

  // Other income tax using non-wage brackets, stacked above wage taxable base
  // (This captures "marginal stacking" effect cleanly.)
  const taxNonWage_total = calcProgressiveTax(W_taxable + O, TAX_BRACKETS_NONWAGE_2026);
  const taxNonWage_base = calcProgressiveTax(W_taxable, TAX_BRACKETS_NONWAGE_2026);
  const taxOther = Math.max(0, taxNonWage_total - taxNonWage_base);

  const directTaxTotal = sgk + ui + stamp + taxWage + taxOther;

  const disposable = Math.max(0, annualGrossTotal - directTaxTotal);
  const s = clamp(Number(savingsRate) || 0, 0, 0.9);
  const consumptionBase = disposable * (1 - s);


  // ---- Indirect estimate (consumption-based)
  const rateFood = 0.06;      // improved proxy
  const rateRent = 0.00;      // residential rent: VAT-exempt proxy
  const rateTransport = has_car ? 0.22 : 0.10; // car users higher fuel/OTV proxy
  const rateOther = 0.14;

  const weightedRate =
    (spend_food / 100) * rateFood +
    (spend_rent / 100) * rateRent +
    (spend_transport / 100) * rateTransport +
    (spend_other / 100) * rateOther;

  // Tobacco & alcohol as add-on burden on consumption (still minimal input)
  let sinSurcharge = 0;
  if (smokes) sinSurcharge += 0.03;
  if (drinks_alcohol) sinSurcharge += 0.02;

  const indirectEffectiveRate = clamp(weightedRate + sinSurcharge, 0, 0.80);

  // Convert to TL using CONSUMPTION base (not gross)
  const indirectTL = consumptionBase * indirectEffectiveRate;

  // Uncertainty band (now TL-based, not %-points on gross)
  const indirectMinTL = indirectTL * 0.90;
  const indirectMaxTL = indirectTL * 1.15;

  // Unified totals
  const totalMinTL = directTaxTotal + indirectMinTL;
  const totalMaxTL = directTaxTotal + indirectMaxTL;

  const totalMinPct = clamp((totalMinTL / annualGrossTotal) * 100, 0, 95);
  const totalMaxPct = clamp((totalMaxTL / annualGrossTotal) * 100, 0, 95);

  return {
    annualGrossTotal,
    directTaxTotal: Math.round(directTaxTotal),

    // unified outputs
    result_tax_pct_min: Math.round(totalMinPct),
    result_tax_pct_max: Math.round(totalMaxPct),
    result_tl_min: Math.round(totalMinTL),
    result_tl_max: Math.round(totalMaxTL),
  };
}

const TAX_BRACKETS_WAGE_2026 = [
  { upTo: 190000, rate: 0.15 },
  { upTo: 400000, rate: 0.20 },
  { upTo: 1500000, rate: 0.27 },
  { upTo: 5300000, rate: 0.35 },
  { upTo: Infinity, rate: 0.40 },
];

const TAX_BRACKETS_NONWAGE_2026 = [
  { upTo: 190000, rate: 0.15 },
  { upTo: 400000, rate: 0.20 },
  { upTo: 1000000, rate: 0.27 },
  { upTo: 5300000, rate: 0.35 },
  { upTo: Infinity, rate: 0.40 },
];

const SGK_RATE = 0.14;
const UI_RATE = 0.01;
const STAMP_RATE = 0.00759; // validated: 200k -> 1518

function calcProgressiveTax(taxableIncome, brackets) {
  const income = Math.max(0, Number(taxableIncome) || 0);
  let remaining = income;
  let lastLimit = 0;
  let tax = 0;

  for (const b of brackets) {
    const limit = b.upTo;
    const slice = Math.min(remaining, limit - lastLimit);
    if (slice > 0) {
      tax += slice * b.rate;
      remaining -= slice;
      lastLimit = limit;
    }
    if (remaining <= 0) break;
  }
  return tax;
}

function DirectSplitBar({ pct01 }) {
  const pct = clamp(pct01, 0, 0.95) * 100;
  return (
    <div
      style={{
        width: "100%",
        height: 26,
        borderRadius: 999,
        background: "#f1f1f1",
        overflow: "hidden",
        marginTop: 16,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "#B91C1C",
          transition: "width 650ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      />
    </div>
  );
}

function JourneyProgress({ step, isResult }) {
  const items = isResult
    ? [
      { n: 1, label: "Meslek", icon: "👤" },
      { n: 2, label: "Gelir", icon: "�" },
      { n: 3, label: "Doğrudan", icon: "🏛" },
      { n: 4, label: "Yaşam", icon: "💸" },
      { n: 5, label: "Dolaylı", icon: "🧾" },
      { n: 6, label: "Toplam", icon: "📊" },
      { n: 7, label: "Adalet", icon: "⚖️" },
    ]
    : [
      { n: 1, label: "Meslek", icon: "👤" },
      { n: 2, label: "Gelir", icon: "�" },
      { n: 3, label: "Doğrudan", icon: "🏛" },
      { n: 4, label: "Yaşam", icon: "💸" },
      { n: 5, label: "Dolaylı", icon: "🧾" },
      { n: 6, label: "Toplam", icon: "�" },
      { n: 7, label: "Adalet", icon: "⚖️" },
    ];

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
      {items.map((it) => {
        const active = it.n === step;
        const done = it.n < step;

        return (
          <div
            key={it.n}
            style={{
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid #eee",
              background: active ? "#fff" : done ? "#fff7ed" : "#fafafa",
              fontWeight: active ? 900 : 700,
              color: done ? "#666" : "#222",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>{done ? "✓" : it.icon}</span>
            <span style={{ fontSize: 13 }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState("form"); // "form" | "result"
  const [savingState, setSavingState] = useState("idle"); // idle | saving | saved | error
  const [saveError, setSaveError] = useState("");

  const [journeyStep, setJourneyStep] = useState(1); // 1..6

  // Income (monthly gross)
  const [wageGrossMonthly, setWageGrossMonthly] = useState(20000);
  const [otherIncomeMonthly, setOtherIncomeMonthly] = useState(0);

  // Savings rate (as decimal, e.g., 0.15 = 15%)
  const [savingsRate, setSavingsRate] = useState(0.15);

  // Spending splits
  const [food, setFood] = useState(25);
  const [rent, setRent] = useState(35);
  const [transport, setTransport] = useState(15);
  const [other, setOther] = useState(25);

  // Toggles
  const [hasCar, setHasCar] = useState(false);
  const [smokes, setSmokes] = useState(false);
  const [drinksAlcohol, setDrinksAlcohol] = useState(false);
  const [ownsRealEstate, setOwnsRealEstate] = useState(null); // optional

  const [consent, setConsent] = useState(true);

  // Occupation (required, non-empty)
  const [occupation, setOccupation] = useState("");

  // Fairness perception (Step 7)
  const [fairnessScore, setFairnessScore] = useState(5);
  const [fairnessSaved, setFairnessSaved] = useState(false);

  // Submission ID (returned from server after save)
  const [submissionId, setSubmissionId] = useState("");

  // Optional survey (Step 8)
  const [surveyState, setSurveyState] = useState("idle");
  const [surveyError, setSurveyError] = useState("");
  const [ageBand, setAgeBand] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [tenantStatus, setTenantStatus] = useState("");
  const [effectivenessScore, setEffectivenessScore] = useState(5);
  const [trustScore, setTrustScore] = useState(5);
  const [policyPriority, setPolicyPriority] = useState("");

  // Results stored after compute
  const [result, setResult] = useState(null);

  // Direct tax data for Step 2 animation
  const [directSnapshot, setDirectSnapshot] = useState(null);
  const [directBarPct, setDirectBarPct] = useState(0);
  const [directCountTo, setDirectCountTo] = useState({ gross: 0, direct: 0, left: 0 });
  const [directCountNow, setDirectCountNow] = useState({ gross: 0, direct: 0, left: 0 });

  useEffect(() => {
    if (journeyStep !== 3) return;

    const computed = computeEstimateV2({
      wageGrossMonthly,
      otherIncomeMonthly,
      savingsRate,
      spend_food: food,
      spend_rent: rent,
      spend_transport: transport,
      spend_other: other,
      has_car: hasCar,
      smokes,
      drinks_alcohol: drinksAlcohol,
    });

    if (!computed) {
      setJourneyStep(2);
      return;
    }

    const gross = computed.annualGrossTotal;
    const direct = computed.directTaxTotal;
    const left = Math.max(0, gross - direct);

    setDirectSnapshot({ gross, direct, left });

    // Reset animations
    setDirectBarPct(0);
    setDirectCountNow({ gross: 0, direct: 0, left: 0 });
    setDirectCountTo({ gross, direct, left });

    // Bar animation start (small delay feels nicer)
    const t1 = setTimeout(() => {
      setDirectBarPct(gross > 0 ? direct / gross : 0);
    }, 80);

    // Count-up animation (duration ~650ms)
    const start = performance.now();
    const duration = 650;

    let rafId = null;
    const animate = (now) => {
      const p = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic

      setDirectCountNow({
        gross: Math.round(gross * eased),
        direct: Math.round(direct * eased),
        left: Math.round(left * eased),
      });

      if (p < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      clearTimeout(t1);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    journeyStep,
    wageGrossMonthly,
    otherIncomeMonthly,
    savingsRate,
    food,
    rent,
    transport,
    other,
    hasCar,
    smokes,
    drinksAlcohol,
  ]);

  const sum = food + rent + transport + other;
  const sumOk = sum === 100;

  function nudgeToHundred(changedKey, nextValue) {
    let f = food,
      r = rent,
      t = transport,
      o = other;

    if (changedKey === "food") f = nextValue;
    if (changedKey === "rent") r = nextValue;
    if (changedKey === "transport") t = nextValue;
    if (changedKey === "other") o = nextValue;

    const newSum = f + r + t + o;
    const diff = 100 - newSum;

    if (changedKey !== "other") {
      o = clamp(o + diff, 0, 100);
    }

    setFood(f);
    setRent(r);
    setTransport(t);
    setOther(o);
  }

  const incomeOk = (wageGrossMonthly > 0) || (otherIncomeMonthly > 0);
  const canCalculate = sumOk && consent && incomeOk && savingState !== "saving";

  async function handleCalculate() {
    if (!canCalculate) return;

    setSavingState("saving");
    setSaveError("");

    // 1) compute
    const computed = computeEstimateV2({
      wageGrossMonthly,
      otherIncomeMonthly,
      savingsRate,
      spend_food: food,
      spend_rent: rent,
      spend_transport: transport,
      spend_other: other,
      has_car: hasCar,
      smokes,
      drinks_alcohol: drinksAlcohol,
    });

    if (!computed) {
      setSavingState("error");
      setSaveError("Gelir bilgisi geçersiz. (İki gelir de 0 olamaz.)");
      return;
    }

    // 2) save to DB via Netlify Function
    const payload = {
      dk_hp: "", // honeypot, keep empty
      sim_version: "v2",
      occupation,

      wage_gross_monthly: wageGrossMonthly,
      other_income_monthly: otherIncomeMonthly,
      annual_gross_total: computed.annualGrossTotal,
      direct_tax_total: computed.directTaxTotal,
      savings_rate: savingsRate,

      spend_food: food,
      spend_rent: rent,
      spend_transport: transport,
      spend_other: other,

      has_car: hasCar,
      smokes,
      drinks_alcohol: drinksAlcohol,
      owns_real_estate: ownsRealEstate, // can be null

      result_tax_pct_min: computed.result_tax_pct_min,
      result_tax_pct_max: computed.result_tax_pct_max,
      result_tl_min: computed.result_tl_min,
      result_tl_max: computed.result_tl_max,

      consent_analytics: consent,
      client_fingerprint: getClientFingerprint(),
    };

    try {
      const res = await fetch("/.netlify/functions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.ok) {
        setSavingState("error");
        setSaveError(json.error || "Unknown error");
        // Still show results (so user doesn't lose the "aha" moment)
      } else {
        setSavingState("saved");
        if (json.submission_id) setSubmissionId(json.submission_id);
      }
    } catch (e) {
      setSavingState("error");
      setSaveError("Network error");
    }

    // 3) show results
    setResult({
      ...computed,
      wageGrossMonthly,
      otherIncomeMonthly,
      food,
      rent,
      transport,
      other,
      hasCar,
      smokes,
      drinksAlcohol,
    });
    setStep("result");
  }

  function resetToForm() {
    setStep("form");
    setSavingState("idle");
    setSaveError("");
  }

  // ---------------- UI RENDER ----------------

  const monthsForTaxesMin = result ? Math.round((result.result_tax_pct_min / 100) * 12) : 0;
  const monthsForTaxesMax = result ? Math.round((result.result_tax_pct_max / 100) * 12) : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BRAND.cream,
        padding: 18,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        color: BRAND.text,
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <header style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 800, color: BRAND.red, letterSpacing: 0.2 }}>Diskursi</div>
          <h1 style={{ margin: "6px 0 4px", fontSize: 28 }}>Vergi Yükü Simülasyonu (MVP)</h1>
          <p style={{ margin: 0, color: "#555", lineHeight: 1.5 }}>
            1 dakikada yaklaşık bir tahmin. Tam rakam değil; "yaklaşık" bir farkındalık aracı.
          </p>
        </header>

        <JourneyProgress step={step === "result" ? (journeyStep >= 7 ? 7 : 6) : journeyStep} isResult={step === "result"} />

        {step === "result" && result && journeyStep === 6 && (
          <div className="stepWrap">
            <Card>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
                <div style={{ flex: "1 1 320px" }}>
                  <div style={{ color: "#666", fontSize: 13 }}>Aylık brüt gelirlerin</div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>
                    Maaş: {formatTL(result.wageGrossMonthly)} TL · Diğer: {formatTL(result.otherIncomeMonthly)} TL
                  </div>
                </div>
                <div style={{ flex: "1 1 320px" }}>
                  <div style={{ color: "#666", fontSize: 13 }}>Yıllık brüt toplam (yaklaşık)</div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>
                    {formatTL(result.annualGrossTotal)} TL
                  </div>
                </div>
              </div>

              <div style={{ height: 12 }} />

              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "rgba(185, 28, 28, 0.08)",
                  border: "1px solid rgba(185, 28, 28, 0.18)",
                }}
              >
                <div style={{ color: BRAND.red, fontWeight: 900, fontSize: 14 }}>
                  Tahmini yıllık vergi yükün
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>
                  %{result.result_tax_pct_min} – %{result.result_tax_pct_max}
                </div>
                <div style={{ marginTop: 6, color: "#333", fontSize: 16 }}>
                  {formatTL(result.result_tl_min)} – {formatTL(result.result_tl_max)} TL / yıl
                </div>

                <div style={{ marginTop: 10, color: "#555" }}>
                  Bu, yılda yaklaşık{" "}
                  <strong>
                    {monthsForTaxesMin} – {monthsForTaxesMax} ay
                  </strong>{" "}
                  sadece "vergiler için çalışmak" gibi düşünebilirsin.
                </div>
              </div>

              <div style={{ height: 12 }} />

              {savingState === "saved" ? (
                <div style={{ color: "rgba(22,163,74,1)", fontWeight: 700 }}>
                  ✅ Yanıtın kaydedildi (anonim).
                </div>
              ) : savingState === "error" ? (
                <div style={{ color: BRAND.orange, fontWeight: 700 }}>
                  ⚠️ Sonuç gösterildi ama kayıt sırasında hata oldu: {saveError}
                </div>
              ) : (
                <div style={{ color: "#666" }}>…</div>
              )}

              <div style={{ height: 14 }} />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                <button
                  onClick={() => {
                    const dataUrl = generateShareCardDataUrl(result);
                    downloadDataUrl(dataUrl, "diskursi-vergi-sonuc.png");
                  }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "white",
                    color: BRAND.text,
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                >
                  📸 Görseli indir
                </button>

                <button
                  onClick={() => setJourneyStep(7)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: BRAND.red,
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                >
                  Devam Et →
                </button>
              </div>
            </Card>
          </div>
        )}

        {step === "result" && journeyStep === 7 && (
          <div className="stepWrap">
            <Card>
              <h2 style={{ marginTop: 0, fontSize: 22 }}>⚖️ Adalet algın</h2>
              <p style={{ marginTop: 6, color: "#555" }}>
                Bu toplam vergi yükünü ne kadar adil buluyorsun?
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, marginTop: 10 }}>
                <span style={{ color: "#777" }}>Hiç adil değil</span>
                <span style={{ color: "#777" }}>Tamamen adil</span>
              </div>

              <div style={{
                display: "flex",
                gap: 6,
                marginTop: 12,
                flexWrap: "wrap",
                justifyContent: "center",
              }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setFairnessScore(n)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      border: fairnessScore === n ? `2px solid ${BRAND.red}` : "1px solid #ddd",
                      background: fairnessScore === n ? "rgba(185,28,28,0.1)" : "#fff",
                      color: fairnessScore === n ? BRAND.red : "#333",
                      fontWeight: 900,
                      fontSize: 18,
                      cursor: "pointer",
                      transition: "all 150ms ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                <button
                  onClick={() => setJourneyStep(6)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                    background: "#fff",
                    color: "#111",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                >
                  ← Sonuca dön
                </button>

                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/.netlify/functions/submit", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "update_fairness",
                          client_fingerprint: getClientFingerprint(),
                          fairness_score: fairnessScore,
                        }),
                      });
                      const json = await res.json();
                      if (json.ok) {
                        setFairnessSaved(true);
                      } else {
                        console.error("Fairness save error:", json.error);
                        setFairnessSaved(true);
                      }
                    } catch (e) {
                      console.error("Fairness save network error:", e);
                      setFairnessSaved(true);
                    }
                    setJourneyStep(8);
                  }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: "#B91C1C",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                >
                  Kaydet ve Devam Et
                </button>
              </div>

              <div style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
                Not: Bu yanıt anonim olarak, yalnızca toplu analiz için kullanılır.
              </div>
            </Card>
          </div>
        )}

        {step === "result" && journeyStep === 8 && (
          <div className="stepWrap">
            <Card>
              <h2 style={{ marginTop: 0, fontSize: 18 }}>📣 Diskursi’yi destekle</h2>
              <p style={{ marginTop: 6, color: "#555" }}>
                Bu mini-simülasyon Diskursi’nin “Civic Intelligence Engine” yaklaşımını geliştirmek için hazırlandı.
                İstersen aşağıdaki kısa anketi doldurarak anonim şekilde katkı sağlayabilirsin.
                İsim/e-posta istemiyoruz.
              </p>
              <div style={{ marginTop: 10, padding: 12, borderRadius: 12, border: "1px solid #eee", background: "#FFF7ED" }}>
                <div style={{ fontWeight: 900 }}>📍 İstanbul Anketi</div>
                <div style={{ marginTop: 6, fontSize: 13, color: "#555" }}>
                  İstanbul’a özel gündem ve mahalle sorunlarını görmek ister misin?
                  Diskursi İstanbul anketimizi de inceleyebilirsin.
                </div>
                <button
                  onClick={() => window.open("https://diskursi.com/istanbul", "_blank")}
                  style={{
                    marginTop: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: BRAND.red,
                    color: "#fff",
                    fontWeight: 900,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  İstanbul anketine git →
                </button>
              </div>
            </Card>

            <div style={{ height: 14 }} />

            <Card>
              <h2 style={{ marginTop: 0, fontSize: 18 }}>📋 Anonim mini anket (isteğe bağlı)</h2>
              <p style={{ marginTop: 6, color: "#555", fontSize: 13 }}>
                Bu bilgiler tamamen anonimdir. İsim/e-posta/telefon istemiyoruz.
                Toplu analiz için kullanılır.
              </p>

              {/* Age band */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>Yaş aralığın</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["18-24", "25-34", "35-44", "45-54", "55-64", "65+"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAgeBand(v)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: ageBand === v ? `2px solid ${BRAND.red}` : "1px solid #ddd",
                        background: ageBand === v ? "rgba(185,28,28,0.08)" : "#fff",
                        color: ageBand === v ? BRAND.red : "#333",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>Cinsiyet</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { key: "female", label: "Kadın" },
                    { key: "male", label: "Erkek" },
                    { key: "other", label: "Diğer" },
                    { key: "prefer_not", label: "Belirtmek istemiyorum" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setGender(opt.key)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: gender === opt.key ? `2px solid ${BRAND.red}` : "1px solid #ddd",
                        background: gender === opt.key ? "rgba(185,28,28,0.08)" : "#fff",
                        color: gender === opt.key ? BRAND.red : "#333",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* City */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>Şehir</div>
                <input
                  type="text"
                  placeholder="Örn: İstanbul"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    width: "100%",
                    boxSizing: "border-box",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                />
              </div>

              {/* Tenant status */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>Konut durumu</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { key: "tenant", label: "🏠 Kiracı" },
                    { key: "owner", label: "🏡 Ev sahibi" },
                    { key: "family", label: "👨‍👩‍👧 Aileyle" },
                    { key: "other", label: "Diğer" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setTenantStatus(opt.key)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: tenantStatus === opt.key ? `2px solid ${BRAND.red}` : "1px solid #ddd",
                        background: tenantStatus === opt.key ? "rgba(185,28,28,0.08)" : "#fff",
                        color: tenantStatus === opt.key ? BRAND.red : "#333",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Effectiveness score */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4 }}>Devlet hizmetlerinin etkinliğini nasıl değerlendirirsin?</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#777", marginBottom: 4 }}>
                  <span>Çok kötü</span>
                  <span>Çok iyi</span>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => setEffectivenessScore(n)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        border: effectivenessScore === n ? `2px solid ${BRAND.red}` : "1px solid #ddd",
                        background: effectivenessScore === n ? "rgba(185,28,28,0.1)" : "#fff",
                        color: effectivenessScore === n ? BRAND.red : "#333",
                        fontWeight: 900,
                        fontSize: 15,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust score */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4 }}>Merkezi hükümete güvenin</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#777", marginBottom: 4 }}>
                  <span>Hiç güvenmiyorum</span>
                  <span>Tamamen güveniyorum</span>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => setTrustScore(n)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        border: trustScore === n ? `2px solid ${BRAND.red}` : "1px solid #ddd",
                        background: trustScore === n ? "rgba(185,28,28,0.1)" : "#fff",
                        color: trustScore === n ? BRAND.red : "#333",
                        fontWeight: 900,
                        fontSize: 15,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Policy priority (required for survey submit) */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 6 }}>
                  Sence vergi gelirlerinin en öncelikli kullanılması gereken alan hangisi?
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { key: "education", label: "🏫 Eğitim" },
                    { key: "health", label: "🏥 Sağlık" },
                    { key: "infrastructure", label: "🛣 Altyapı" },
                    { key: "security", label: "🛡 Güvenlik" },
                    { key: "social", label: "🤝 Sosyal yardım" },
                    { key: "justice", label: "⚖️ Adalet" },
                    { key: "environment", label: "🌿 Çevre" },
                    { key: "economy", label: "💹 Ekonomi" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setPolicyPriority(opt.key)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: policyPriority === opt.key ? `2px solid ${BRAND.red}` : "1px solid #ddd",
                        background: policyPriority === opt.key ? "rgba(185,28,28,0.08)" : "#fff",
                        color: policyPriority === opt.key ? BRAND.red : "#333",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit survey */}
              <div style={{ marginTop: 18 }}>
                <button
                  disabled={surveyState === "saving" || surveyState === "saved"}
                  onClick={async () => {
                    setSurveyState("saving");
                    setSurveyError("");

                    if (!submissionId) {
                      setSurveyState("error");
                      setSurveyError("Simülasyon kaydı bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
                      return;
                    }

                    if (!policyPriority) {
                      setSurveyState("error");
                      setSurveyError("Lütfen öncelikli alan seç.");
                      return;
                    }

                    try {
                      const res = await fetch("/.netlify/functions/submit_survey", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          submission_id: submissionId,
                          age_band: ageBand || null,
                          gender: gender || null,
                          city: city || null,
                          tenant_status: tenantStatus || null,
                          effectiveness_score: effectivenessScore,
                          trust_central_gov_score: trustScore,
                          policy_priority: policyPriority,
                        }),
                      });
                      const json = await res.json().catch(() => null);
                      if (!res.ok || !json?.ok) {
                        setSurveyState("error");
                        setSurveyError(json?.error || "Kaydedilemedi.");
                        return;
                      }
                      setSurveyState("saved");
                    } catch (e) {
                      setSurveyState("error");
                      setSurveyError("Network error");
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "none",
                    background: surveyState === "saved" ? "rgba(22,163,74,1)" : BRAND.red,
                    color: "#fff",
                    fontWeight: 900,
                    cursor: surveyState === "saved" ? "default" : "pointer",
                    fontSize: 15,
                  }}
                >
                  {surveyState === "saving" ? "Kaydediliyor..." : surveyState === "saved" ? "✅ Anket kaydedildi" : "Anketi gönder"}
                </button>

                {surveyState === "error" && (
                  <div style={{ marginTop: 8, fontSize: 12, color: BRAND.orange, fontWeight: 700 }}>
                    ⚠️ {surveyError}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
                Bu anket tamamen isteğe bağlıdır ve anonim olarak saklanır.
              </div>
            </Card>
          </div>
        )}

        {journeyStep === 1 && step !== "result" && (
          <div className="stepWrap">
            <Card>
              <h2 style={{ marginTop: 0, fontSize: 22 }}>👤 Meslek grubun</h2>
              <p style={{ marginTop: 6, color: "#555" }}>
                Bu simülasyon, farklı meslek gruplarının toplam vergi yükünü karşılaştırabilmek için bu bilgiyi ister.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 14 }}>
                {[
                  { key: "private", label: "🏢 Özel sektör çalışanı" },
                  { key: "public", label: "🏛 Kamu çalışanı" },
                  { key: "self", label: "💼 Serbest çalışan" },
                  { key: "student", label: "👩🎓 Öğrenci" },
                  { key: "unemployed", label: "🏠 Çalışmıyor" },
                  { key: "retired", label: "🧓 Emekli" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setOccupation(opt.key);
                      setJourneyStep(2);
                    }}
                    style={{
                      padding: "14px 14px",
                      borderRadius: 14,
                      border: occupation === opt.key ? `2px solid ${BRAND.red}` : "1px solid #eee",
                      background: occupation === opt.key ? "rgba(185,28,28,0.06)" : "#fff",
                      cursor: "pointer",
                      fontWeight: 900,
                      textAlign: "left",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 14, fontSize: 12, color: "#777" }}>
                Not: Bu bilgi anonimdir ve yalnızca toplu analiz için kullanılır.
              </div>
            </Card>
          </div>
        )}

        {journeyStep === 2 && step !== "result" && (
          <div className="stepWrap">
            <Card>
              <h2 style={{ marginTop: 0 }}>💰 Senin Yılın</h2>
              <p style={{ marginTop: 0, color: "#555" }}>
                Bu simülasyon, yıl boyunca devlete yaptığın katkıyı görünür kılar.
              </p>

              <MoneySlider
                label="Maaş / Ücret (brüt)"
                value={wageGrossMonthly}
                onChange={setWageGrossMonthly}
                min={0}
                max={2000000}
                step={1000}
                hint="Örn: bordro brüt maaşın."
              />

              <MoneySlider
                label="Diğer gelir (kira, freelance, vb.)"
                value={otherIncomeMonthly}
                onChange={setOtherIncomeMonthly}
                min={0}
                max={2000000}
                step={1000}
                hint="Kira + serbest iş + diğer vergilendirilebilir gelirler (toplam)."
              />

              <div style={{ marginTop: 12, fontSize: 13, color: "#555" }}>
                Yıllık brüt toplam:{" "}
                <strong>
                  {formatTL((wageGrossMonthly + otherIncomeMonthly) * 12)} TL
                </strong>
              </div>

              {((wageGrossMonthly <= 0) && (otherIncomeMonthly <= 0)) ? (
                <div style={{ marginTop: 10, fontSize: 12, fontWeight: 800, color: BRAND.orange }}>
                  En az bir gelir kalemi 0'dan büyük olmalı.
                </div>
              ) : null}

              <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => setJourneyStep(1)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "white",
                    color: BRAND.text,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  ← Geri
                </button>
                <button
                  onClick={() => setJourneyStep(3)}
                  disabled={(wageGrossMonthly <= 0) && (otherIncomeMonthly <= 0)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: BRAND.red,
                    color: "#fff",
                    fontWeight: 900,
                    cursor: "pointer",
                    opacity: ((wageGrossMonthly <= 0) && (otherIncomeMonthly <= 0)) ? 0.5 : 1,
                  }}
                >
                  Devam Et →
                </button>
              </div>
            </Card>
          </div>
        )}

        {journeyStep === 3 && (
          <div className="stepWrap">
            <Card>
              <h2 style={{ marginTop: 0, fontSize: 22 }}>🏛 Devlet İlk Payını Alıyor</h2>

              <div style={{ fontSize: 14, color: "#555", marginTop: 6 }}>
                Yıllık brüt gelirin
              </div>

              <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>
                {formatTL(directCountNow.gross)} TL
              </div>

              <DirectSplitBar pct01={directBarPct} />

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: 10,
                  fontSize: 14,
                  fontWeight: 800,
                  marginBottom: 10,
                }}
              >
                <div style={{ color: "#B91C1C" }}>
                  Devlete giden (doğrudan): {formatTL(directCountNow.direct)} TL
                </div>
                <div>
                  Sana kalan: {formatTL(directCountNow.left)} TL
                </div>
              </div>

              <div style={{ fontSize: 12, color: "#666", marginBottom: 14 }}>
                Bu ilk kesinti; SGK, işsizlik sigortası, damga vergisi ve gelir vergisini içerir (yaklaşık).
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                <button
                  onClick={() => setJourneyStep(2)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                    background: "#fff",
                    color: "#111",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                >
                  ← Geri
                </button>
                <button
                  onClick={() => setJourneyStep(4)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: BRAND.red,
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                >
                  Devam Et →
                </button>
              </div>
            </Card>
          </div>
        )}

        {journeyStep === 4 && step !== "result" && (
          <div className="stepWrap">
            <Card>
              <h2 style={{ marginTop: 0 }}>💸 Yaşam Tarzın</h2>
              <p style={{ marginTop: 0, color: "#555" }}>
                Toplamın <strong>100</strong> olması gerekiyor. Biz "Diğer" kalemini otomatik ayarlamaya çalışıyoruz.
              </p>

              <Row>
                <Slider label="Gıda" value={food} onChange={(v) => nudgeToHundred("food", v)} />
                <Slider label="Kira / Konut" value={rent} onChange={(v) => nudgeToHundred("rent", v)} />
                <Slider
                  label="Ulaşım"
                  value={transport}
                  onChange={(v) => nudgeToHundred("transport", v)}
                />
                <Slider label="Diğer" value={other} onChange={(v) => nudgeToHundred("other", v)} />
              </Row>

              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 12,
                  background: sumOk ? "rgba(34,197,94,0.12)" : "rgba(249,115,22,0.14)",
                  border: `1px solid ${sumOk ? "rgba(34,197,94,0.25)" : "rgba(249,115,22,0.25)"}`,
                  color: "#333",
                }}
              >
                Toplam: <strong>{sum}%</strong>{" "}
                {!sumOk ? <span style={{ color: BRAND.orange }}>→ 100 olmalı</span> : "✅"}
              </div>

              <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => setJourneyStep(3)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "white",
                    color: BRAND.text,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  ← Geri
                </button>
                <button
                  onClick={() => setJourneyStep(5)}
                  disabled={!sumOk}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: BRAND.red,
                    color: "#fff",
                    fontWeight: 900,
                    cursor: "pointer",
                    opacity: sumOk ? 1 : 0.5,
                  }}
                >
                  Devam Et →
                </button>
              </div>
            </Card>
          </div>
        )}

        {journeyStep === 5 && step !== "result" && (
          <div className="stepWrap">
            <Card>
              <h2 style={{ marginTop: 0, fontSize: 18 }}>📋 Bazı ek bilgiler (isteğe bağlı ama faydalı)</h2>
              <Row>
                <Toggle label="Arabam var" checked={hasCar} onChange={setHasCar} />
                <Toggle label="Sigara kullanıyorum" checked={smokes} onChange={setSmokes} />
                <Toggle label="Alkol tüketiyorum" checked={drinksAlcohol} onChange={setDrinksAlcohol} />
              </Row>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Gayrimenkul sahibi misin? (opsiyonel)</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                  <button
                    onClick={() => setOwnsRealEstate(true)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                      background: ownsRealEstate === true ? BRAND.red : "white",
                      color: ownsRealEstate === true ? "white" : BRAND.text,
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Evet
                  </button>
                  <button
                    onClick={() => setOwnsRealEstate(false)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                      background: ownsRealEstate === false ? BRAND.red : "white",
                      color: ownsRealEstate === false ? "white" : BRAND.text,
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Hayır
                  </button>
                  <button
                    onClick={() => setOwnsRealEstate(null)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.12)",
                      background: ownsRealEstate === null ? "rgba(0,0,0,0.04)" : "white",
                      color: BRAND.text,
                      cursor: "pointer",
                    }}
                  >
                    Boş bırak
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => setJourneyStep(4)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "white",
                    color: BRAND.text,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  ← Geri
                </button>
                <button
                  onClick={() => setJourneyStep(6)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: BRAND.red,
                    color: "#fff",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Devam Et →
                </button>
              </div>
            </Card>
          </div>
        )}

        {journeyStep === 6 && step !== "result" && (
          <div className="stepWrap">
            <Card>
              <h2 style={{ marginTop: 0, fontSize: 18 }}>🧮 Veri izni ve hesaplama</h2>
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  style={{ width: 18, height: 18, marginTop: 2 }}
                />
                <span style={{ color: "#444", lineHeight: 1.4 }}>
                  Sonuçlar anonim şekilde analiz amaçlı kullanılabilir. (İsim/telefon/e-posta toplamıyoruz.)
                </span>
              </label>

              <div style={{ marginTop: 14 }}>
                <button
                  disabled={!canCalculate}
                  onClick={handleCalculate}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "none",
                    background: canCalculate ? BRAND.red : "rgba(0,0,0,0.18)",
                    color: "white",
                    fontWeight: 800,
                    cursor: canCalculate ? "pointer" : "not-allowed",
                    fontSize: 16,
                  }}
                >
                  {savingState === "saving" ? "Hesaplanıyor..." : "Sonucu Hesapla →"}
                </button>

                {!incomeOk ? (
                  <div style={{ marginTop: 8, fontSize: 12, color: BRAND.orange, fontWeight: 700 }}>
                    En az bir gelir kalemi 0'dan büyük olmalı.
                  </div>
                ) : null}

                <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
                  (Hesaplanınca sonuç ekranına geçeceğiz ve yanıtı anonim şekilde kaydedeceğiz.)
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => setJourneyStep(5)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "white",
                    color: BRAND.text,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  ← Geri
                </button>
              </div>
            </Card>
          </div>
        )}

        <div style={{ height: 18 }} />

        <footer style={{ color: "#777", fontSize: 12, textAlign: "center" }}>
          Diskursi MVP · "Yaklaşık" simülasyon · v2
        </footer>
      </div>
    </div>
  );
}
