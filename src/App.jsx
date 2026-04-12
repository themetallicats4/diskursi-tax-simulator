import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";
import { 
  Briefcase, 
  Building2, 
  User, 
  GraduationCap, 
  Home, 
  UserCheck, 
  Car, 
  Cigarette, 
  Wine, 
  School, 
  Hospital,
  Camera,
  Megaphone,
  MapPin,
  Users,
  Shield,
  Handshake,
  Scale,
  Leaf,
  TrendingUp,
  Calculator,
  Building
} from "lucide-react";

const BRAND = {
  red: "#DC2626",
  redDark: "#B91C1C",
  redHover: "#991B1B",
  orange: "#F97316",
  cream: "#FFF7ED",
  white: "#FFFFFF",
  text: "#2E2E2E",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  inputBg: "#F9FAFB",
  stepperBg: "#FEE2E2",
  stepperBorder: "#FCA5A5",
  stepperHover: "#FECACA",
  highlightBg: "#FFF7ED",
  highlightBorder: "#FED7AA",
  highlightText: "#9A3412",
  cardShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

function NumericStepper({ label, value, onChange, min, max, step, hint, unit = "TL" }) {
  const handleIncrement = () => {
    const newValue = max ? Math.min(max, value + step) : value + step;
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleInputChange = (e) => {
    const newValue = Number(e.target.value);
    if (!isNaN(newValue)) {
      const clamped = max ? Math.max(min, Math.min(max, newValue)) : Math.max(min, newValue);
      onChange(clamped);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 4 }}>
        <label style={{ fontWeight: 600, color: BRAND.text, fontSize: 15 }}>{label}</label>
        <span style={{ fontWeight: 700, color: BRAND.text, fontSize: 15, whiteSpace: "nowrap" }}>
          {new Intl.NumberFormat("tr-TR").format(value)} {unit}
        </span>
      </div>

      {hint && (
        <div style={{ marginBottom: 8, fontSize: 12, color: BRAND.textLight }}>{hint}</div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={handleDecrement}
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: BRAND.stepperBg,
            border: `1px solid ${BRAND.stepperBorder}`,
            cursor: "pointer",
            transition: "all 150ms ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            minWidth: 44,
            minHeight: 44,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = BRAND.stepperHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = BRAND.stepperBg;
          }}
        >
          <span style={{ color: BRAND.redDark, fontSize: 20, fontWeight: 700, lineHeight: 1 }}>−</span>
        </button>

        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: "center",
            padding: "14px 8px",
            borderRadius: 12,
            backgroundColor: BRAND.inputBg,
            border: `1px solid ${BRAND.border}`,
            color: BRAND.text,
            fontSize: 18,
            fontWeight: 600,
            outline: "none",
          }}
        />

        <button
          onClick={handleIncrement}
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: BRAND.stepperBg,
            border: `1px solid ${BRAND.stepperBorder}`,
            cursor: "pointer",
            transition: "all 150ms ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            minWidth: 44,
            minHeight: 44,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = BRAND.stepperHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = BRAND.stepperBg;
          }}
        >
          <span style={{ color: BRAND.redDark, fontSize: 20, fontWeight: 700, lineHeight: 1 }}>+</span>
        </button>
      </div>

      {(min >= 12000 || max) && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: BRAND.textLight, marginTop: 6 }}>
          {min >= 12000 && <span>{new Intl.NumberFormat("tr-TR").format(min)} {unit}</span>}
          {!min || min < 12000 ? <span></span> : null}
          {max && <span>{new Intl.NumberFormat("tr-TR").format(max)} {unit}</span>}
        </div>
      )}
    </div>
  );
}

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

function formatBillionTL(n) {
  return `${n.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} milyar TL`;
}

function formatApproxRange(min, max, unitSingular, unitPlural = null) {
  const plural = unitPlural || unitSingular;

  if (!Number.isFinite(min) || !Number.isFinite(max)) return "";

  const a = Math.max(0, min);
  const b = Math.max(0, max);

  const roundedA = Math.round(a * 10) / 10;
  const roundedB = Math.round(b * 10) / 10;

  // If almost same, show a single approximate number
  if (Math.abs(roundedA - roundedB) < 0.15) {
    const one = Math.round(((roundedA + roundedB) / 2) * 10) / 10;

    // If near a whole number, show whole number
    if (Math.abs(one - Math.round(one)) < 0.12) {
      const n = Math.round(one);
      return `\u2248 ${n} ${n === 1 ? unitSingular : plural}`;
    }

    return `\u2248 ${one.toFixed(1)} ${one === 1 ? unitSingular : plural}`;
  }

  // If both sides are near whole numbers, use whole numbers
  const useWhole =
    Math.abs(roundedA - Math.round(roundedA)) < 0.12 &&
    Math.abs(roundedB - Math.round(roundedB)) < 0.12;

  if (useWhole) {
    const n1 = Math.round(roundedA);
    const n2 = Math.round(roundedB);
    return `${n1} \u2013 ${n2} ${n2 === 1 ? unitSingular : plural}`;
  }

  return `${roundedA.toFixed(1)} \u2013 ${roundedB.toFixed(1)} ${plural}`;
}

function formatTeacherEquivalent(min, max) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "";
  const a = Math.max(0, min);
  const b = Math.max(0, max);
  const r1 = Math.round(a);
  const r2 = Math.round(b);
  if (r1 === r2) {
    return `≈ ${r1} ay`;
  }
  // If still very close after rounding difference <= 1, prefer approximate midpoint
  if (Math.abs(r1 - r2) <= 1) {
    return `≈ ${Math.round((a + b) / 2)} ay`;
  }
  return `${r1} – ${r2} ay`;
}

function formatScholarshipEquivalent(min, max) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "";
  const a = Math.max(0, min);
  const b = Math.max(0, max);
  const r1 = Math.round(a);
  const r2 = Math.round(b);
  if (r1 === r2) {
    return `≈ ${r1} öğrenci`;
  }
  if (Math.abs(r1 - r2) <= 1) {
    return `≈ ${Math.round((a + b) / 2)} öğrenci`;
  }
  return `${r1} – ${r2} öğrenci`;
}

function formatAmbulanceEquivalent(min, max) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "";
  const a = Math.max(0, min);
  const b = Math.max(0, max);
  const r1 = Math.round(a);
  const r2 = Math.round(b);
  if (r1 === r2) {
    return `≈ ${r1} gün`;
  }
  if (Math.abs(r1 - r2) <= 2) {
    return `≈ ${Math.round((a + b) / 2)} gün`;
  }
  return `${r1} – ${r2} gün`;
}

function narrativeText(label, min, max) {
  const mid = (min + max) / 2;

  if (label === "teacher") {
    if (mid < 1.5) return "Bu, yakla\u015f\u0131k bir \u00f6\u011fretmenin 1 ayl\u0131k maa\u015f\u0131na denk.";
    if (mid < 12) return "Bu, birka\u00e7 ayl\u0131k \u00f6\u011fretmen maa\u015f\u0131na e\u015fde\u011fer.";
    return "Bu, birden fazla \u00f6\u011fretmenin uzun s\u00fcreli maa\u015f\u0131na e\u015fde\u011fer.";
  }

  if (label === "scholarship") {
    if (mid < 1.5) return "Bu, yakla\u015f\u0131k bir \u00f6\u011frencinin 1 y\u0131ll\u0131k bursuna denk.";
    if (mid < 10) return "Bu, birka\u00e7 \u00f6\u011frencinin 1 y\u0131ll\u0131k bursuna kar\u015f\u0131l\u0131k gelir.";
    return "Bu, \u00e7ok say\u0131da \u00f6\u011frencinin 1 y\u0131ll\u0131k bursuna kar\u015f\u0131l\u0131k gelir.";
  }

  if (label === "ambulance") {
    if (mid < 1.5) return "Bu, yakla\u015f\u0131k 1 g\u00fcnl\u00fck ambulans hizmetine denk.";
    if (mid < 10) return "Bu, yakla\u015f\u0131k bir haftal\u0131k ambulans hizmetine kar\u015f\u0131l\u0131k gelir.";
    return "Bu, uzun s\u00fcreli ambulans hizmetine kar\u015f\u0131l\u0131k gelir.";
  }

  return "";
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

  // Background - warm cream
  ctx.fillStyle = BRAND.cream;
  ctx.fillRect(0, 0, W, H);

  // Card container
  const pad = 60;
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
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  roundRect(cardX + 8, cardY + 10, cardW, cardH, 32);
  ctx.fill();

  // Card
  ctx.fillStyle = "#FFFFFF";
  roundRect(cardX, cardY, cardW, cardH, 32);
  ctx.fill();

  // --- HEADER ---
  ctx.fillStyle = BRAND.redDark;
  ctx.font = "900 52px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.fillText("Diskursi", W / 2, cardY + 90);

  ctx.fillStyle = BRAND.text;
  ctx.font = "600 32px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Vergi Yükü Simülasyonu", W / 2, cardY + 140);

  // --- MAIN TAX RATE RANGE ---
  const pctText = `%${result.result_tax_pct_min} – %${result.result_tax_pct_max}`;
  ctx.fillStyle = BRAND.redDark;
  ctx.font = "900 120px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText(pctText, W / 2, cardY + 320);

  // --- MONTH VALUE ---
  const monthsMin = Math.round((result.result_tax_pct_min / 100) * 12);
  const monthsMax = Math.round((result.result_tax_pct_max / 100) * 12);
  
  // Format month text - avoid duplicate ranges like "4–4 ay"
  let monthText;
  if (monthsMin === monthsMax) {
    monthText = `≈ ${monthsMin} ay`;
  } else {
    monthText = `≈ ${monthsMin}–${monthsMax} ay`;
  }

  ctx.fillStyle = BRAND.orange;
  ctx.font = "800 72px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText(monthText, W / 2, cardY + 440);

  // --- SUPPORTING LINE ---
  ctx.fillStyle = BRAND.text;
  ctx.font = "600 28px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Bu, yılda yaklaşık vergiler için çalıştığın süreyi gösterir.", W / 2, cardY + 510);

  // --- GOVERNMENT INFO BLOCK ---
  const infoBoxY = cardY + 600;
  const infoBoxH = 240;
  
  // Info box background
  ctx.fillStyle = "rgba(185, 28, 28, 0.06)";
  roundRect(cardX + 60, infoBoxY, cardW - 120, infoBoxH, 20);
  ctx.fill();

  // Info box border
  ctx.strokeStyle = "rgba(185, 28, 28, 0.15)";
  ctx.lineWidth = 2;
  roundRect(cardX + 60, infoBoxY, cardW - 120, infoBoxH, 20);
  ctx.stroke();

  // Main civic info text
  ctx.fillStyle = BRAND.text;
  ctx.font = "700 32px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.fillText("Devlet gelirlerinin yaklaşık %85'i", W / 2, infoBoxY + 70);
  ctx.fillText("vergilerden geliyor.", W / 2, infoBoxY + 110);

  // Tax breakdown line
  ctx.fillStyle = "#666";
  ctx.font = "600 26px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("KDV %32.1 · Gelir Vergisi %25.4 · ÖTV %18.2", W / 2, infoBoxY + 170);

  // --- FOOTER ---
  ctx.fillStyle = "#999";
  ctx.font = "600 24px system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.textAlign = "center";
  ctx.fillText("diskursi.com.tr · yaklaşık tahmin", W / 2, cardY + cardH - 40);

  return canvas.toDataURL("image/png");
}



function Card({ children }) {
  return (
    <div
      style={{
        background: BRAND.white,
        borderRadius: 24,
        padding: 32,
        boxShadow: BRAND.cardShadow,
        border: "none",
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

function TaxReceiptRow({ label, valueMin, valueMax }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 13 }}>
      <span style={{ color: "#555" }}>{label}</span>
      <span style={{ fontWeight: 700, color: "#333" }}>
        {formatTL(Math.round(valueMin))} – {formatTL(Math.round(valueMax))} TL
      </span>
    </div>
  );
}

function TaxReceiptRowTotal({ label, valueMin, valueMax }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      marginTop: 8,
      paddingTop: 8,
      borderTop: "1px solid #eee",
      fontWeight: 900,
      fontSize: 14
    }}>
      <span style={{ color: "#333" }}>{label}</span>
      <span style={{ color: "#B91C1C" }}>
        {formatTL(Math.round(valueMin))} – {formatTL(Math.round(valueMax))} TL
      </span>
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
        gap: 12,
        padding: 14,
        borderRadius: 12,
        border: `1px solid ${BRAND.border}`,
        background: BRAND.white,
        cursor: "pointer",
        userSelect: "none",
        flex: "1 1 220px",
        transition: "all 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = BRAND.inputBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = BRAND.white;
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ 
          width: 20, 
          height: 20,
          cursor: "pointer",
          accentColor: BRAND.redDark
        }}
      />
      <span style={{ color: BRAND.text, fontSize: 15, fontWeight: 500 }}>{label}</span>
    </label>
  );
}

function Slider({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <label style={{ color: BRAND.text, fontWeight: 600, fontSize: 15 }}>{label}</label>
        <span style={{ 
          color: BRAND.redDark, 
          fontWeight: 700,
          fontSize: 15,
          minWidth: 50,
          textAlign: "right"
        }}>
          {value}%
        </span>
      </div>
      <div style={{ position: "relative", width: "100%" }}>
        <div style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 6,
          borderRadius: 3,
          backgroundColor: BRAND.border,
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${value}%`,
            borderRadius: 3,
            backgroundColor: BRAND.redDark,
            transition: "width 100ms ease",
          }} />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ 
            position: "relative",
            width: "100%",
            height: 20,
            background: "transparent",
            WebkitAppearance: "none",
            appearance: "none",
            outline: "none",
            cursor: "pointer",
          }}
        />
      </div>
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

    // breakdown for "Vergi Fişin"
    incomeTax: Math.round(taxWage + taxOther),
    sgk: Math.round(sgk),
    unemployment: Math.round(ui),
    stamp: Math.round(stamp),
    indirectMin: Math.round(indirectMinTL),
    indirectMax: Math.round(indirectMaxTL),
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
const TEACHER_NET_MONTHLY_DEFAULT = 73368; // 2026 Ocak–Haziran öğretmen net aylığı (fallback)

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

function MonthLoadingBar({ monthsMin, monthsMax }) {
  const minCells = Math.round(clamp(monthsMin, 0, 12));
  const maxCells = Math.round(clamp(monthsMax, 0, 12));

  const cells = Array.from({ length: 12 }).map((_, i) => {
    if (i < minCells) return "#B91C1C";
    if (i < maxCells) return "rgba(185,28,28,0.35)";
    return "#EEE";
  });

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666" }}>
        <span>Ocak</span><span>Aralık</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 6, marginTop: 8 }}>
        {cells.map((bg, idx) => (
          <div key={idx} style={{ height: 18, borderRadius: 8, background: bg }} />
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 13, color: "#444", fontWeight: 900 }}>
        ⏳ Yılda yaklaşık <span style={{ color: "#B91C1C" }}>{monthsMin.toFixed(1)} – {monthsMax.toFixed(1)}</span> ay "vergiler için çalışmak" gibi düşünebilirsin.
      </div>
    </div>
  );
}

function JourneyProgress({ step, isResult }) {
  const items = [
    { n: 1, label: "Meslek" },
    { n: 2, label: "Gelir" },
    { n: 3, label: "Doğrudan" },
    { n: 4, label: "Yaşam" },
    { n: 5, label: "Dolaylı" },
    { n: 6, label: "Toplam" },
  ];

  return (
    <div style={{ 
      display: "flex", 
      gap: 8, 
      flexWrap: "wrap", 
      justifyContent: "center",
      marginBottom: 32,
      overflowX: "auto",
      padding: "0 4px"
    }}>
      {items.map((it) => {
        const active = it.n === step;
        const done = it.n < step;

        return (
          <div
            key={it.n}
            style={{
              padding: "8px 16px",
              borderRadius: 9999,
              border: active ? `2px solid ${BRAND.redDark}` : `1px solid ${BRAND.border}`,
              background: active ? BRAND.stepperBg : BRAND.white,
              fontWeight: active ? 600 : 400,
              color: active ? BRAND.redDark : BRAND.textMuted,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              transition: "all 150ms ease",
              whiteSpace: "nowrap",
            }}
          >
            <span>{done ? "✓" : it.n}</span>
            <span>{it.label}</span>
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

  // Dynamic config from Supabase (with fallback defaults)
  const [config, setConfig] = useState(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data, error } = await supabase
          .from("simulation_config")
          .select("*");

        if (!error && data) {
          const obj = {};
          data.forEach((row) => {
            obj[row.key] = row.value;
          });
          setConfig(obj);
        }
      } catch (e) {
        // Config fetch failed — app continues with defaults
        console.warn("Config fetch failed, using defaults:", e);
      }
    }

    fetchConfig();
  }, []);

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
  const [fairnessAnswered, setFairnessAnswered] = useState(false);
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
  const [reactionChoice, setReactionChoice] = useState(null);
  const [simulationFeedback, setSimulationFeedback] = useState("");

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

  const monthsForTaxesMin = result ? (result.result_tax_pct_min / 100) * 12 : 0;
  const monthsForTaxesMax = result ? (result.result_tax_pct_max / 100) * 12 : 0;

  const dailyTaxMin = result ? result.result_tl_min / 365 : 0;
  const dailyTaxMax = result ? result.result_tl_max / 365 : 0;

  const TEACHER_NET_MONTHLY = config?.teacher_monthly_salary || TEACHER_NET_MONTHLY_DEFAULT;
  const scholarshipMonthly = config?.scholarship_monthly || 3000;
  const ambulanceDaily = config?.ambulance_daily_cost || 10000;
  const scholarshipAnnual = scholarshipMonthly * 12;

  const teacherMonthsMin = result ? result.result_tl_min / TEACHER_NET_MONTHLY : 0;
  const teacherMonthsMax = result ? result.result_tl_max / TEACHER_NET_MONTHLY : 0;

  const studentsMin = result ? result.result_tl_min / scholarshipAnnual : 0;
  const studentsMax = result ? result.result_tl_max / scholarshipAnnual : 0;

  const ambulanceDaysMin = result ? result.result_tl_min / ambulanceDaily : 0;
  const ambulanceDaysMax = result ? result.result_tl_max / ambulanceDaily : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BRAND.cream,
        padding: "18px 12px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        color: BRAND.text,
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 8px" }}>
        <header style={{ marginBottom: 32, textAlign: "center" }}>
          {journeyStep === 1 && step !== "result" ? (
            // Show hero image on first step only
            <div style={{
              display: "flex",
              justifyContent: "center",
            }}>
              <img
                src="/tax_sim_visual.png"
                alt="Diskursi Vergi Yükü Simülasyonu"
                style={{
                  width: "100%",
                  maxWidth: 420,
                  height: "auto",
                  borderRadius: 12,
                }}
              />
            </div>
          ) : (
            // Show text on all other steps
            <>
              <h1 style={{ 
                margin: "0 0 8px 0", 
                fontSize: 32, 
                fontWeight: 700, 
                color: BRAND.redDark,
                letterSpacing: -0.5
              }}>
                Diskursi
              </h1>
              <h2 style={{ 
                margin: "0 0 4px 0", 
                fontSize: 20, 
                fontWeight: 600,
                color: BRAND.text
              }}>
                Vergi Yükü Simülasyonu
              </h2>
              <p style={{ 
                margin: 0, 
                color: BRAND.textMuted, 
                fontSize: 14,
                lineHeight: 1.5 
              }}>
                1 dakikada yaklaşık bir tahmin
              </p>
            </>
          )}
        </header>

        <JourneyProgress step={step === "result" ? 6 : journeyStep} isResult={step === "result"} />

        {step === "result" && result && journeyStep === 6 && (
          <div className="stepWrap">
            
            {/* 1. VERGI FİŞİN - MINIMAL DESIGN */}
            {(() => {
              // Calculate direct tax components (all are fixed values, no min/max)
              const incomeTaxMin = result.incomeTax;
              const incomeTaxMax = result.incomeTax;
              const sgkMin = result.sgk;
              const sgkMax = result.sgk;
              const unemploymentMin = result.unemployment;
              const unemploymentMax = result.unemployment;
              const stampMin = result.stamp;
              const stampMax = result.stamp;

              const directMin = result.directTaxTotal;
              const directMax = result.directTaxTotal;

              // Indirect taxes have min/max range
              const indirectMin = result.indirectMin;
              const indirectMax = result.indirectMax;

              // Split indirect taxes using proportional breakdown
              let kdvRatio = 0.55;
              let otvRatio = 0.25;

              // Adjust ÖTV if behavior flags exist
              if (result.hasCar) otvRatio += 0.05;
              if (result.smokes || result.drinksAlcohol) otvRatio += 0.05;

              // Keep total <= 1.0
              const otherRatio = Math.max(0, 1 - (kdvRatio + otvRatio));

              const kdvMin = indirectMin * kdvRatio;
              const kdvMax = indirectMax * kdvRatio;
              const otvMin = indirectMin * otvRatio;
              const otvMax = indirectMax * otvRatio;
              const otherIndirectMin = indirectMin * otherRatio;
              const otherIndirectMax = indirectMax * otherRatio;

              return (
                <Card>
                  <h2 style={{ 
                    fontSize: 20, 
                    fontWeight: 600, 
                    color: BRAND.text,
                    marginTop: 0,
                    marginBottom: 16
                  }}>
                    Vergi fişin
                  </h2>

                  <p style={{ fontSize: 13, color: BRAND.textMuted, marginBottom: 24 }}>
                    Yıllık vergi yükünün hangi kalemlerden oluştuğunu gösterir.
                  </p>

                  {/* Direct taxes block */}
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ 
                      fontSize: 14, 
                      fontWeight: 600, 
                      color: BRAND.text,
                      marginBottom: 12,
                      paddingBottom: 8,
                      borderBottom: `2px solid ${BRAND.border}`
                    }}>
                      Doğrudan kesintiler
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: BRAND.textMuted, fontSize: 13 }}>Gelir vergisi</span>
                        <span style={{ color: BRAND.text, fontWeight: 600, fontSize: 13 }}>
                          {formatTL(Math.round(incomeTaxMin))} TL
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: BRAND.textMuted, fontSize: 13 }}>SGK primleri</span>
                        <span style={{ color: BRAND.text, fontWeight: 600, fontSize: 13 }}>
                          {formatTL(Math.round(sgkMin))} TL
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: BRAND.textMuted, fontSize: 13 }}>İşsizlik sigortası</span>
                        <span style={{ color: BRAND.text, fontWeight: 600, fontSize: 13 }}>
                          {formatTL(Math.round(unemploymentMin))} TL
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: BRAND.textMuted, fontSize: 13 }}>Damga vergisi</span>
                        <span style={{ color: BRAND.text, fontWeight: 600, fontSize: 13 }}>
                          {formatTL(Math.round(stampMin))} TL
                        </span>
                      </div>
                    </div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: `2px solid ${BRAND.stepperBg}`
                    }}>
                      <span style={{ color: BRAND.redDark, fontWeight: 700, fontSize: 14 }}>Toplam doğrudan</span>
                      <span style={{ color: BRAND.redDark, fontSize: 16, fontWeight: 700 }}>
                        {formatTL(Math.round(directMin))} TL
                      </span>
                    </div>
                  </div>

                  {/* Indirect taxes block */}
                  <div>
                    <h3 style={{ 
                      fontSize: 14, 
                      fontWeight: 600, 
                      color: BRAND.text,
                      marginBottom: 12,
                      paddingBottom: 8,
                      borderBottom: `2px solid ${BRAND.border}`
                    }}>
                      Dolaylı vergiler
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: BRAND.textMuted, fontSize: 13 }}>KDV (harcamalardan)</span>
                        <span style={{ color: BRAND.text, fontWeight: 600, fontSize: 13 }}>
                          {formatTL(Math.round(kdvMin))} – {formatTL(Math.round(kdvMax))} TL
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: BRAND.textMuted, fontSize: 13 }}>ÖTV ve diğer</span>
                        <span style={{ color: BRAND.text, fontWeight: 600, fontSize: 13 }}>
                          {formatTL(Math.round(otvMin + otherIndirectMin))} – {formatTL(Math.round(otvMax + otherIndirectMax))} TL
                        </span>
                      </div>
                    </div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: `2px solid ${BRAND.stepperBg}`
                    }}>
                      <span style={{ color: BRAND.redDark, fontWeight: 700, fontSize: 14 }}>Toplam dolaylı</span>
                      <span style={{ color: BRAND.redDark, fontSize: 16, fontWeight: 700 }}>
                        {formatTL(Math.round(indirectMin))} – {formatTL(Math.round(indirectMax))} TL
                      </span>
                    </div>
                  </div>

                  {/* Total summary */}
                  <div style={{
                    marginTop: 24,
                    padding: 16,
                    borderRadius: 16,
                    background: BRAND.stepperBg,
                    border: `2px solid ${BRAND.redDark}`,
                    textAlign: "center",
                  }}>
                    <div style={{ color: BRAND.redDark, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                      TOPLAM VERGİ
                    </div>
                    <div style={{ color: BRAND.redDark, fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
                      {formatTL(result.result_tl_min)} – {formatTL(result.result_tl_max)} TL
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* 2. TAX PERCENTAGE BLOCK - REMOVED TL AMOUNT */}
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
                <div style={{ marginTop: 6, fontSize: 13, color: "#666" }}>
                  Bu oran, toplam gelirinin yaklaşık ne kadarının vergi olarak devlete gittiğini gösterir.
                </div>
              </div>

              <div style={{ height: 12 }} />

              {/* 3. YAKLAŞIK GÜNLÜK VERGİ YÜKÜN - RENAMED */}
              {result.annualGrossTotal > 0 && (
                <div style={{
                  marginTop: 2,
                  padding: 14,
                  borderRadius: 16,
                  border: "1px solid #eee",
                  background: "#fff",
                }}>
                  <div style={{ fontSize: 16, fontWeight: 1000 }}>⚡ Yaklaşık Günlük Vergi Yükün</div>

                  <div style={{ marginTop: 10, padding: 12, borderRadius: 14, background: "rgba(185,28,28,0.06)", border: "1px solid rgba(185,28,28,0.18)" }}>
                    <div style={{ marginTop: 6, fontSize: 22, fontWeight: 1000, color: "#B91C1C" }}>
                      {formatTL(Math.round(dailyTaxMin))} – {formatTL(Math.round(dailyTaxMax))} TL / gün
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                      (Yıllık toplam vergi tahmininin 365'e bölünmüş halidir.)
                    </div>
                  </div>

                  <MonthLoadingBar monthsMin={monthsForTaxesMin} monthsMax={monthsForTaxesMax} />
                </div>
              )}
            </Card>

            {/* 4. BİREYSEL YILLIK KATKINLA - MINIMAL WITH ORANGE SQUARES */}
            {(() => {
              const teacherLabel = formatTeacherEquivalent(teacherMonthsMin, teacherMonthsMax);
              const scholarshipLabel = formatScholarshipEquivalent(studentsMin, studentsMax);
              const ambulanceLabel = formatAmbulanceEquivalent(ambulanceDaysMin, ambulanceDaysMax);

              return (
                <Card>
                  <h2 style={{ 
                    fontSize: 20, 
                    fontWeight: 600, 
                    color: BRAND.text,
                    marginTop: 0,
                    marginBottom: 16
                  }}>
                    Bireysel Yıllık Katkınla Neler Yapılır?
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Teacher */}
                    <div style={{
                      padding: 16,
                      borderRadius: 16,
                      background: BRAND.highlightBg,
                      border: `1px solid ${BRAND.highlightBorder}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 16
                    }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: BRAND.orange,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <GraduationCap size={24} style={{ color: BRAND.white, strokeWidth: 2 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          color: BRAND.highlightText, 
                          fontWeight: 600, 
                          margin: 0,
                          marginBottom: 4,
                          fontSize: 14
                        }}>
                          Öğretmen maaşı (aylık)
                        </p>
                        <p style={{ 
                          color: BRAND.highlightText, 
                          fontSize: 13, 
                          margin: 0 
                        }}>
                          {teacherLabel}
                        </p>
                      </div>
                    </div>

                    {/* Scholarship */}
                    <div style={{
                      padding: 16,
                      borderRadius: 16,
                      background: BRAND.highlightBg,
                      border: `1px solid ${BRAND.highlightBorder}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 16
                    }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: BRAND.orange,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <School size={24} style={{ color: BRAND.white, strokeWidth: 2 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          color: BRAND.highlightText, 
                          fontWeight: 600, 
                          margin: 0,
                          marginBottom: 4,
                          fontSize: 14
                        }}>
                          Öğrenci bursu (yıllık)
                        </p>
                        <p style={{ 
                          color: BRAND.highlightText, 
                          fontSize: 13, 
                          margin: 0 
                        }}>
                          {scholarshipLabel}
                        </p>
                      </div>
                    </div>

                    {/* Ambulance */}
                    <div style={{
                      padding: 16,
                      borderRadius: 16,
                      background: BRAND.highlightBg,
                      border: `1px solid ${BRAND.highlightBorder}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 16
                    }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: BRAND.orange,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <Hospital size={24} style={{ color: BRAND.white, strokeWidth: 2 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          color: BRAND.highlightText, 
                          fontWeight: 600, 
                          margin: 0,
                          marginBottom: 4,
                          fontSize: 14
                        }}>
                          Ambulans hizmeti (günlük)
                        </p>
                        <p style={{ 
                          color: BRAND.highlightText, 
                          fontSize: 13, 
                          margin: 0 
                        }}>
                          {ambulanceLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* 5. COLLECTIVE CONTRIBUTION - MINIMAL WITH ORANGE ICONS */}
            {(() => {
              const tax1000Min = result.result_tl_min * 1000;
              const tax1000Max = result.result_tl_max * 1000;

              // Config-driven school and hospital values
              const schoolM2Cost = config?.school_m2_cost || 21050;
              const schoolAvgM2 = config?.school_avg_m2 || 6715;
              const hospitalM2Cost = config?.hospital_m2_cost || 40500;
              const hospitalAvgM2 = config?.hospital_avg_m2 || 22500;

              const schoolCost = schoolM2Cost * schoolAvgM2;
              const hospitalCost = hospitalM2Cost * hospitalAvgM2;

              const schoolCountMin = tax1000Min / schoolCost;
              const schoolCountMax = tax1000Max / schoolCost;
              const hospitalCountMin = tax1000Min / hospitalCost;
              const hospitalCountMax = tax1000Max / hospitalCost;

              // Format school/hospital counts
              const formatPublicInvestment = (min, max, unit) => {
                const mid = (min + max) / 2;
                const rounded = Math.round(mid * 10) / 10;
                if (rounded < 0.1) return `< 0.1 ${unit}`;
                if (rounded >= 1) return `≈ ${Math.round(rounded)} ${unit}`;
                return `≈ ${rounded.toFixed(1)} ${unit}`;
              };

              const schoolLabel = formatPublicInvestment(schoolCountMin, schoolCountMax, "okul");
              const hospitalLabel = formatPublicInvestment(hospitalCountMin, hospitalCountMax, "hastane");

              return (
                <Card>
                  <h2 style={{ 
                    fontSize: 20, 
                    fontWeight: 600, 
                    color: BRAND.text,
                    marginTop: 0,
                    marginBottom: 8
                  }}>
                    1000 kişi olsaydı? 
                  </h2>

                  <p style={{ 
                    fontSize: 14, 
                    color: BRAND.textMuted, 
                    marginTop: 0,
                    marginBottom: 16 
                  }}>
                    Seninle aynı miktarda vergi ödeyen bin kişi bir araya gelince
                  </p>

                  <div style={{
                    textAlign: "center",
                    marginBottom: 24,
                    padding: 24,
                    borderRadius: 16,
                    background: BRAND.stepperBg,
                  }}>
                    <p style={{ color: BRAND.redDark, fontSize: 13, marginBottom: 8, fontWeight: 600 }}>
                      Toplam vergi
                    </p>
                    <div style={{
                      color: BRAND.redDark,
                      fontSize: 28,
                      fontWeight: 700,
                    }}>
                      {((tax1000Min + tax1000Max) / 2 / 1000000).toFixed(1)} milyon TL
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    {/* School */}
                    <div style={{
                      textAlign: "center",
                      padding: 16,
                      borderRadius: 16,
                      background: BRAND.inputBg,
                    }}>
                      <School size={32} style={{ color: BRAND.orange, margin: "0 auto 12px" }} />
                      <p style={{ color: BRAND.text, fontWeight: 600, margin: 0, marginBottom: 4 }}>
                        {schoolLabel}
                      </p>
                      <p style={{ color: BRAND.textLight, fontSize: 12, margin: 0 }}>
                        orta büyüklükte
                      </p>
                    </div>

                    {/* Hospital */}
                    <div style={{
                      textAlign: "center",
                      padding: 16,
                      borderRadius: 16,
                      background: BRAND.inputBg,
                    }}>
                      <Hospital size={32} style={{ color: BRAND.orange, margin: "0 auto 12px" }} />
                      <p style={{ color: BRAND.text, fontWeight: 600, margin: 0, marginBottom: 4 }}>
                        {hospitalLabel}
                      </p>
                      <p style={{ color: BRAND.textLight, fontSize: 12, margin: 0 }}>
                        tam donanımlı
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* 6. DEVLET GELİRLERİ - MOVED TO END */}
            {(() => {
              const GOV_TOTAL_INCOME_B = 16266.1;
              const GOV_TAX_INCOME_B = 13833.1;
              const GOV_GV_B = 3517.0;
              const GOV_KDV_B = 4434.4;
              const GOV_OTV_B = 2513.5;
              const GOV_OTHER_TAX_B = GOV_TAX_INCOME_B - (GOV_GV_B + GOV_KDV_B + GOV_OTV_B);

              const taxShareTotal = (GOV_TAX_INCOME_B / GOV_TOTAL_INCOME_B) * 100;
              const gvShareInTax = (GOV_GV_B / GOV_TAX_INCOME_B) * 100;
              const kdvShareInTax = (GOV_KDV_B / GOV_TAX_INCOME_B) * 100;
              const otvShareInTax = (GOV_OTV_B / GOV_TAX_INCOME_B) * 100;
              const otherShareInTax = (GOV_OTHER_TAX_B / GOV_TAX_INCOME_B) * 100;

              return (
                <Card>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 8,
                    marginBottom: 16
                  }}>
                    <Building size={20} style={{ color: BRAND.redDark, strokeWidth: 2 }} />
                    <h2 style={{ 
                      fontSize: 20, 
                      fontWeight: 600, 
                      color: BRAND.text,
                      margin: 0
                    }}>
                      Devlet gelirleri (2026, yaklaşık)
                    </h2>
                  </div>

                  <div style={{ marginTop: 8, fontSize: 13, color: "#444", fontWeight: 900 }}>
                    Devlet gelirinin büyük kısmı senin gibi vatandaşların ödediği vergilerden geliyor.
                    Aşağıda detaylarını bulabilirsin:
                  </div>

                  {/* Taxes share of total income */}
                  <div style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 14,
                    background: "rgba(185,28,28,0.06)",
                    border: "1px solid rgba(185,28,28,0.18)",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#444" }}>Vergilerin toplam gelir içindeki payı</div>
                    <div style={{ marginTop: 6, fontSize: 22, fontWeight: 1000, color: "#B91C1C" }}>
                      %{taxShareTotal.toFixed(1)}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                      Toplam gelir: {formatBillionTL(GOV_TOTAL_INCOME_B)} · Vergi gelirleri: {formatBillionTL(GOV_TAX_INCOME_B)}
                    </div>
                  </div>

                  {/* Inside tax income breakdown */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#444" }}>Vergi gelirinin iç dağılımı</div>

                    <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                      {[
                        { label: "Gelir Vergisi", pct: gvShareInTax, val: GOV_GV_B },
                        { label: "KDV", pct: kdvShareInTax, val: GOV_KDV_B },
                        { label: "ÖTV", pct: otvShareInTax, val: GOV_OTV_B },
                        { label: "Diğer Vergiler", pct: otherShareInTax, val: GOV_OTHER_TAX_B },
                      ].map((x) => (
                        <div key={x.label} style={{
                          padding: 12,
                          borderRadius: 14,
                          border: "1px solid #eee",
                          background: "#fff",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <div style={{ fontWeight: 1000 }}>{x.label}</div>
                            <div style={{ fontWeight: 1000, color: "#B91C1C" }}>%{x.pct.toFixed(1)}</div>
                          </div>
                          <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>{formatBillionTL(x.val)}</div>

                          {/* mini bar */}
                          <div style={{ marginTop: 8, width: "100%", height: 10, borderRadius: 999, background: "#eee", overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(100, Math.max(0, x.pct))}%`, height: "100%", background: "#B91C1C", transition: "width 600ms ease" }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
                      Kaynak: 2026 bütçe büyüklükleri (yaklaşık). Amaç farkındalık yaratmaktır.
                    </div>
                  </div>
                </Card>
              );
            })()}

            {savingState === "saved" ? (
              <div style={{ color: "rgba(22,163,74,1)", fontWeight: 700 }}>
                ✅ Yanıtın anonim olarak kaydedildi.
              </div>
            ) : savingState === "error" ? (
              <div style={{ color: BRAND.orange, fontWeight: 700 }}>
                ⚠️ Sonuç gösterildi ama kayıt sırasında hata oldu: {saveError}
              </div>
            ) : (
              <div style={{ color: "#666" }}>…</div>
            )}

            <div style={{ height: 14 }} />

            <Card>
              {/* Fairness question – inline */}
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "#fafafa",
                  border: "1px solid #eee",
                }}
              >
                <div style={{ 
                  fontWeight: 900, 
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}>
                  <Scale size={16} style={{ color: BRAND.redDark, strokeWidth: 2 }} />
                  Bu toplam vergi yükünü ne kadar adil buluyorsun?
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginTop: 10, color: "#777" }}>
                  <span>Hiç adil değil</span>
                  <span>Tamamen adil</span>
                </div>

                <div style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 8,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => { setFairnessScore(n); setFairnessAnswered(true); }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        border: fairnessAnswered && fairnessScore === n ? `2px solid ${BRAND.red}` : "1px solid #ddd",
                        background: fairnessAnswered && fairnessScore === n ? "rgba(185,28,28,0.1)" : "#fff",
                        color: fairnessAnswered && fairnessScore === n ? BRAND.red : "#333",
                        fontWeight: 900,
                        fontSize: 16,
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

                {!fairnessAnswered && (
                  <div style={{ marginTop: 8, fontSize: 12, color: BRAND.red, fontWeight: 700 }}>
                    Devam etmek veya görseli indirmek için lütfen soruya yanıt ver.
                  </div>
                )}

                <div style={{ marginTop: 6, fontSize: 11, color: "#999" }}>
                  Bu yanıt anonim olarak, yalnızca toplu analiz için kullanılır.
                </div>
              </div>

              <div style={{ height: 14 }} />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                <button
                  disabled={!fairnessAnswered}
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
                    cursor: fairnessAnswered ? "pointer" : "not-allowed",
                    fontWeight: 900,
                    opacity: fairnessAnswered ? 1 : 0.4,
                    transition: "opacity 200ms ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    justifyContent: "center",
                  }}
                >
                  <Camera size={16} style={{ strokeWidth: 2 }} />
                  Görseli indir
                </button>

                <button
                  disabled={!fairnessAnswered}
                  onClick={async () => {
                    // Save fairness score, then advance
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
                    setJourneyStep(7);
                  }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: BRAND.red,
                    color: "white",
                    cursor: fairnessAnswered ? "pointer" : "not-allowed",
                    fontWeight: 900,
                    opacity: fairnessAnswered ? 1 : 0.4,
                    transition: "opacity 200ms ease",
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
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Megaphone size={20} style={{ color: BRAND.redDark, strokeWidth: 2 }} /><h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: BRAND.text }}>Diskursi'yi destekle</h2></div>
              <p style={{ marginTop: 6, color: "#555" }}>
                Bu küçük simülasyon Diskursi tarafından Türkiye Cumhuriyeti vatandaşları için geliştirildi. <br />
                İstersen aşağıdaki kısa anketi doldurarak anonim şekilde katkı sağlayabilirsin.
                Ayrıca İstanbul'da yaşıyorsan aşağıdaki butondan İstanbul anketimize katılıp desteğini artırabilirsin. <br />
                İsim/e-posta istemiyoruz.
              </p>
              <div style={{ marginTop: 10, padding: 12, borderRadius: 12, border: "1px solid #eee", background: "#FFF7ED" }}>
                <div style={{ 
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6
                }}>
                  <MapPin size={30} style={{ color: BRAND.orange, strokeWidth: 2 }} />
                  <span style={{ fontSize: 20, fontWeight: 700 }}>
                    İstanbul Anketi
                  </span>
                </div>
                <div style={{ marginTop: 6, fontSize: 15, color: "#555" }}>
                  İstanbul’a özel gündem ve mahalle sorunlarını görmek ister misin?
                  Diskursi İstanbul anketimizi de inceleyebilirsin.
                </div>
                <button
                  onClick={() => window.open("https://diskursi.com.tr", "_blank")}
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
              <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 600, color: BRAND.text }}>
                Sence vergiler nasıl kullanılıyor?
              </h2>
              <p style={{ marginTop: 0, marginBottom: 32, color: BRAND.textMuted, fontSize: 15, lineHeight: 1.6 }}>
                Sana birkaç sorumuz var. Bu bilgiler tamamen anonimdir. İsim/e-posta/telefon istemiyoruz.
                Toplu analiz için kullanılır.
              </p>

              {/* Age band */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, color: BRAND.text }}>Yaş aralığın</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {["18-24", "25-34", "35-44", "45-54", "55-64", "65+"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAgeBand(v)}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: ageBand === v ? `2px solid ${BRAND.redDark}` : "1px solid #E5E7EB",
                        background: ageBand === v ? BRAND.stepperBg : "#F9FAFB",
                        color: ageBand === v ? BRAND.redDark : BRAND.text,
                        fontWeight: ageBand === v ? 600 : 400,
                        cursor: "pointer",
                        fontSize: 16,
                        transition: "all 150ms ease",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 56,
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, color: BRAND.text }}>Cinsiyet</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
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
                        padding: 16,
                        borderRadius: 12,
                        border: gender === opt.key ? `2px solid ${BRAND.redDark}` : "1px solid #E5E7EB",
                        background: gender === opt.key ? BRAND.stepperBg : "#F9FAFB",
                        color: gender === opt.key ? BRAND.redDark : BRAND.text,
                        fontWeight: gender === opt.key ? 600 : 400,
                        cursor: "pointer",
                        fontSize: 16,
                        transition: "all 150ms ease",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 56,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* City */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, color: BRAND.text }}>Şehir</div>
                <input
                  type="text"
                  placeholder="Örn: İstanbul"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    padding: "16px 20px",
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    background: "#F9FAFB",
                    width: "100%",
                    boxSizing: "border-box",
                    fontSize: 16,
                    fontWeight: 400,
                    color: BRAND.text,
                    outline: "none",
                  }}
                />
              </div>

              {/* Tenant status */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, color: BRAND.text }}>Konut durumu</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {[
                    { key: "tenant", label: "Kiracı" },
                    { key: "owner", label: "Ev sahibi" },
                    { key: "family", label: "Aileyle" },
                    { key: "other", label: "Diğer" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setTenantStatus(opt.key)}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: tenantStatus === opt.key ? `2px solid ${BRAND.redDark}` : "1px solid #E5E7EB",
                        background: tenantStatus === opt.key ? BRAND.stepperBg : "#F9FAFB",
                        color: tenantStatus === opt.key ? BRAND.redDark : BRAND.text,
                        fontWeight: tenantStatus === opt.key ? 600 : 400,
                        cursor: "pointer",
                        fontSize: 16,
                        transition: "all 150ms ease",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 56,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Effectiveness score */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: BRAND.text }}>
                  Devlet hizmetlerinin etkinliğini nasıl değerlendirirsin?
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: BRAND.textMuted, marginBottom: 12 }}>
                  <span>Çok kötü</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: BRAND.text }}>{effectivenessScore}</span>
                  <span>Çok iyi</span>
                </div>
                <div style={{ position: "relative", width: "100%", height: 20 }}>
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    right: 0,
                    height: 8,
                    borderRadius: 4,
                    background: "linear-gradient(to right, #DC2626 0%, #F97316 50%, #10B981 100%)",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }} />
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={effectivenessScore}
                    onChange={(e) => setEffectivenessScore(Number(e.target.value))}
                    style={{ 
                      position: "relative",
                      width: "100%",
                      height: 20,
                      background: "transparent",
                      WebkitAppearance: "none",
                      appearance: "none",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>

              {/* Trust score */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: BRAND.text }}>
                  Merkezi hükümete güvenin
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: BRAND.textMuted, marginBottom: 12 }}>
                  <span>Hiç güvenmiyorum</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: BRAND.text }}>{trustScore}</span>
                  <span>Tamamen güveniyorum</span>
                </div>
                <div style={{ position: "relative", width: "100%", height: 20 }}>
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    right: 0,
                    height: 8,
                    borderRadius: 4,
                    background: "linear-gradient(to right, #DC2626 0%, #F97316 50%, #10B981 100%)",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }} />
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={trustScore}
                    onChange={(e) => setTrustScore(Number(e.target.value))}
                    style={{ 
                      position: "relative",
                      width: "100%",
                      height: 20,
                      background: "transparent",
                      WebkitAppearance: "none",
                      appearance: "none",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>

              {/* Policy priority */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, color: BRAND.text }}>
                  Sence vergi gelirlerinin en öncelikli kullanılması gereken alan hangisi?
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {[
                    { key: "education", label: "Eğitim", icon: School },
                    { key: "health", label: "Sağlık", icon: Hospital },
                    { key: "infrastructure", label: "Altyapı", icon: Building2 },
                    { key: "security", label: "Güvenlik", icon: Shield },
                    { key: "social", label: "Sosyal yardım", icon: Handshake },
                    { key: "justice", label: "Adalet", icon: Scale },
                    { key: "environment", label: "Çevre", icon: Leaf },
                    { key: "economy", label: "Ekonomi", icon: TrendingUp },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setPolicyPriority(opt.key)}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: policyPriority === opt.key ? `2px solid ${BRAND.redDark}` : "1px solid #E5E7EB",
                        background: policyPriority === opt.key ? BRAND.stepperBg : "#F9FAFB",
                        color: policyPriority === opt.key ? BRAND.redDark : BRAND.text,
                        fontWeight: policyPriority === opt.key ? 600 : 400,
                        cursor: "pointer",
                        fontSize: 16,
                        transition: "all 150ms ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        minHeight: 56,
                        textAlign: "center",
                      }}
                    >
                      <opt.icon size={18} style={{ strokeWidth: 2, flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reaction choice - Mini feedback */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, color: BRAND.text }}>
                  Bu simülasyon sana ne hissettirdi?
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {[
                    { key: "surprised", label: "Şaşırdım" },
                    { key: "expected", label: "Beklediğim gibiydi" },
                    { key: "too_much", label: "Fazla geldi" },
                    { key: "too_little", label: "Az geldi" },
                    { key: "unsure", label: "Emin değilim" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setReactionChoice(opt.key)}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: reactionChoice === opt.key ? `2px solid ${BRAND.redDark}` : "1px solid #E5E7EB",
                        background: reactionChoice === opt.key ? BRAND.stepperBg : "#F9FAFB",
                        color: reactionChoice === opt.key ? BRAND.redDark : BRAND.text,
                        fontWeight: reactionChoice === opt.key ? 600 : 400,
                        cursor: "pointer",
                        fontSize: 16,
                        transition: "all 150ms ease",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 56,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulation feedback textarea */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, color: BRAND.text }}>
                  Geliştirmemiz için kısa bir geri bildirim bırakmak ister misin?
                </div>
                <textarea
                  value={simulationFeedback}
                  onChange={(e) => setSimulationFeedback(e.target.value)}
                  placeholder="Geliştirmemiz için fikrini paylaşabilirsin."
                  maxLength={300}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "16px 20px",
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    background: "#F9FAFB",
                    fontSize: 16,
                    fontWeight: 400,
                    color: BRAND.text,
                    outline: "none",
                    resize: "vertical",
                    minHeight: 100,
                    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
                  }}
                />
                <div style={{ marginTop: 6, fontSize: 12, color: BRAND.textLight }}>
                  
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
                          reaction_choice: reactionChoice || null,
                          simulation_feedback: simulationFeedback?.trim() || null,
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
              <h2 style={{ 
                marginTop: 0,
                marginBottom: 24, 
                fontSize: 24, 
                fontWeight: 600,
                color: BRAND.text 
              }}>
                Meslek grubun
              </h2>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", 
                gap: 16,
                marginBottom: 24
              }}>
                {[
                  { id: "private", label: "Özel sektör çalışanı", Icon: Briefcase },
                  { id: "public", label: "Kamu çalışanı", Icon: Building2 },
                  { id: "self", label: "Serbest çalışan", Icon: User },
                  { id: "student", label: "Öğrenci", Icon: GraduationCap },
                  { id: "unemployed", label: "Çalışmıyor", Icon: Home },
                  { id: "retired", label: "Emekli", Icon: UserCheck },
                ].map((prof) => {
                  const isSelected = occupation === prof.id;
                  const IconComponent = prof.Icon;
                  return (
                    <button
                      key={prof.id}
                      onClick={() => setOccupation(prof.id)}
                      style={{
                        padding: 24,
                        borderRadius: 16,
                        border: isSelected ? `2px solid ${BRAND.redDark}` : `1px solid ${BRAND.border}`,
                        background: isSelected ? BRAND.stepperBg : BRAND.white,
                        cursor: "pointer",
                        transition: "all 150ms ease",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = BRAND.inputBg;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = BRAND.white;
                        }
                      }}
                    >
                      <IconComponent
                        size={32}
                        style={{ 
                          marginBottom: 12,
                          color: isSelected ? BRAND.redDark : BRAND.textMuted,
                          strokeWidth: 2
                        }}
                      />
                      <div style={{
                        color: isSelected ? BRAND.redDark : BRAND.text,
                        fontSize: 14,
                        fontWeight: isSelected ? 600 : 400,
                      }}>
                        {prof.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p style={{ 
                textAlign: "center", 
                color: BRAND.textLight, 
                fontSize: 12,
                marginBottom: 16
              }}>
                Bu bilgi anonimdir.
              </p>

              <button
                disabled={!occupation}
                onClick={() => setJourneyStep(2)}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 16,
                  border: "none",
                  background: occupation ? BRAND.red : "#D1D5DB",
                  color: BRAND.white,
                  fontWeight: 600,
                  cursor: occupation ? "pointer" : "not-allowed",
                  fontSize: 16,
                  transition: "all 150ms ease",
                }}
                onMouseEnter={(e) => {
                  if (occupation) {
                    e.currentTarget.style.backgroundColor = BRAND.redHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (occupation) {
                    e.currentTarget.style.backgroundColor = BRAND.red;
                  }
                }}
              >
                Devam Et
              </button>
            </Card>
          </div>
        )}

        {journeyStep === 2 && step !== "result" && (
          <div className="stepWrap">
            <Card>
              <h2 style={{ 
                marginTop: 0,
                marginBottom: 8,
                fontSize: 24, 
                fontWeight: 600,
                color: BRAND.text 
              }}>
                Temel Gelirlerin
              </h2>
              <p style={{ marginTop: 0, marginBottom: 32, color: BRAND.textMuted, fontSize: 14 }}>
                Aylık brüt gelirlerini gir
              </p>

              <NumericStepper
                label="Maaş / Ücret (brüt)"
                value={wageGrossMonthly}
                onChange={setWageGrossMonthly}
                min={0}
                max={null}
                step={1000}
                hint="Örn: bordro brüt maaşın"
              />

              <NumericStepper
                label="Diğer gelir (kira, freelance, vb.)"
                value={otherIncomeMonthly}
                onChange={setOtherIncomeMonthly}
                min={0}
                max={null}
                step={1000}
                hint="Kira + serbest iş + diğer vergilendirilebilir gelirler"
              />

              <div style={{ 
                marginTop: 16,
                padding: 16,
                borderRadius: 12,
                backgroundColor: BRAND.highlightBg,
                border: `1px solid ${BRAND.highlightBorder}`
              }}>
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column",
                  gap: 8,
                  alignItems: "center",
                  textAlign: "center"
                }}>
                  <span style={{ 
                    color: BRAND.highlightText, 
                    fontWeight: 600,
                    fontSize: 14
                  }}>
                    Yıllık brüt toplam:
                  </span>
                  <span style={{
                    color: BRAND.highlightText,
                    fontSize: 24,
                    fontWeight: 700,
                  }}>
                    {formatTL((wageGrossMonthly + otherIncomeMonthly) * 12)} TL
                  </span>
                </div>
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
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 8,
                marginBottom: 8
              }}>
                <Building size={24} style={{ color: BRAND.redDark, strokeWidth: 2 }} />
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: BRAND.text }}>
                  Devlet İlk Payını Alıyor
                </h2>
              </div>

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
              <h2 style={{ 
                marginTop: 0,
                marginBottom: 8,
                fontSize: 24, 
                fontWeight: 600,
                color: BRAND.text 
              }}>
                Yaşam tarzın
              </h2>
              <p style={{ marginTop: 0, marginBottom: 24, color: BRAND.textMuted, fontSize: 14 }}>
                Gelirini yaklaşık olarak nasıl harcıyorsun? (Toplam %100 olmalı)
              </p>

              <Slider label="Gıda" value={food} onChange={(v) => nudgeToHundred("food", v)} />
              <Slider label="Kira / Konut" value={rent} onChange={(v) => nudgeToHundred("rent", v)} />
              <Slider label="Ulaşım" value={transport} onChange={(v) => nudgeToHundred("transport", v)} />
              <Slider label="Diğer" value={other} onChange={(v) => nudgeToHundred("other", v)} />

              <div style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 12,
                background: sumOk ? "#D1FAE5" : "#FEE2E2",
                border: sumOk ? "1px solid #6EE7B7" : "1px solid #FCA5A5",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    color: sumOk ? "#065F46" : "#991B1B",
                    fontWeight: 600,
                  }}>
                    Toplam:
                  </span>
                  <span style={{
                    color: sumOk ? "#065F46" : "#991B1B",
                    fontSize: 24,
                    fontWeight: 700,
                  }}>
                    {sum}%
                  </span>
                </div>
                {!sumOk && (
                  <p style={{ 
                    marginTop: 8, 
                    marginBottom: 0,
                    color: "#991B1B", 
                    fontSize: 12 
                  }}>
                    Toplam %100 olmalı
                  </p>
                )}
              </div>

              <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                <button
                  onClick={() => setJourneyStep(3)}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 16,
                    border: `1px solid ${BRAND.border}`,
                    background: BRAND.white,
                    color: BRAND.text,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 16,
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND.inputBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND.white;
                  }}
                >
                  ← Geri
                </button>
                <button
                  onClick={() => setJourneyStep(5)}
                  disabled={!sumOk}
                  style={{
                    flex: 2,
                    padding: 16,
                    borderRadius: 16,
                    border: "none",
                    background: sumOk ? BRAND.red : "#D1D5DB",
                    color: BRAND.white,
                    fontWeight: 600,
                    cursor: sumOk ? "pointer" : "not-allowed",
                    fontSize: 16,
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (sumOk) {
                      e.currentTarget.style.backgroundColor = BRAND.redHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (sumOk) {
                      e.currentTarget.style.backgroundColor = BRAND.red;
                    }
                  }}
                >
                  Devam Et
                </button>
              </div>
            </Card>
          </div>
        )}

        {journeyStep === 5 && step !== "result" && (
          <div className="stepWrap">
            <Card>
              <h2 style={{ 
                marginTop: 0,
                marginBottom: 8,
                fontSize: 24, 
                fontWeight: 600,
                color: BRAND.text 
              }}>
                Harcarken de vergi ödüyorsun
              </h2>
              <p style={{ marginTop: 0, marginBottom: 24, color: BRAND.textMuted, fontSize: 14 }}>
                Aşağıdakilerden hangisi senin için geçerli?
              </p>

              {/* Car */}
              <button
                onClick={() => setHasCar(!hasCar)}
                style={{
                  width: "100%",
                  padding: "16px 12px",
                  borderRadius: 16,
                  marginBottom: 16,
                  border: hasCar ? `2px solid ${BRAND.redDark}` : `1px solid ${BRAND.border}`,
                  background: hasCar ? BRAND.stepperBg : BRAND.inputBg,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{
                  padding: 10,
                  borderRadius: 12,
                  backgroundColor: hasCar ? BRAND.redDark : BRAND.border,
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Car size={22} style={{ color: hasCar ? BRAND.white : BRAND.textMuted, strokeWidth: 2 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                  <p style={{
                    color: hasCar ? BRAND.redDark : BRAND.text,
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: 4,
                    fontSize: 15,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    Arabam var
                  </p>
                  <p style={{ 
                    color: BRAND.textLight, 
                    fontSize: 12, 
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    ÖTV, MTV, akaryakıt vergileri
                  </p>
                </div>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: `2px solid ${hasCar ? BRAND.redDark : "#D1D5DB"}`,
                  backgroundColor: hasCar ? BRAND.redDark : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginLeft: 4,
                }}>
                  {hasCar && (
                    <div style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      backgroundColor: BRAND.white,
                    }} />
                  )}
                </div>
              </button>

              {/* Smoking */}
              <button
                onClick={() => setSmokes(!smokes)}
                style={{
                  width: "100%",
                  padding: "16px 12px",
                  borderRadius: 16,
                  marginBottom: 16,
                  border: smokes ? `2px solid ${BRAND.redDark}` : `1px solid ${BRAND.border}`,
                  background: smokes ? BRAND.stepperBg : BRAND.inputBg,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{
                  padding: 10,
                  borderRadius: 12,
                  backgroundColor: smokes ? BRAND.redDark : BRAND.border,
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Cigarette size={22} style={{ color: smokes ? BRAND.white : BRAND.textMuted, strokeWidth: 2 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                  <p style={{
                    color: smokes ? BRAND.redDark : BRAND.text,
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: 4,
                    fontSize: 15,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    Sigara kullanıyorum
                  </p>
                  <p style={{ 
                    color: BRAND.textLight, 
                    fontSize: 12, 
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    Yüksek ÖTV oranı
                  </p>
                </div>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: `2px solid ${smokes ? BRAND.redDark : "#D1D5DB"}`,
                  backgroundColor: smokes ? BRAND.redDark : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginLeft: 4,
                }}>
                  {smokes && (
                    <div style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      backgroundColor: BRAND.white,
                    }} />
                  )}
                </div>
              </button>

              {/* Alcohol */}
              <button
                onClick={() => setDrinksAlcohol(!drinksAlcohol)}
                style={{
                  width: "100%",
                  padding: "16px 12px",
                  borderRadius: 16,
                  marginBottom: 24,
                  border: drinksAlcohol ? `2px solid ${BRAND.redDark}` : `1px solid ${BRAND.border}`,
                  background: drinksAlcohol ? BRAND.stepperBg : BRAND.inputBg,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{
                  padding: 10,
                  borderRadius: 12,
                  backgroundColor: drinksAlcohol ? BRAND.redDark : BRAND.border,
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Wine size={22} style={{ color: drinksAlcohol ? BRAND.white : BRAND.textMuted, strokeWidth: 2 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                  <p style={{
                    color: drinksAlcohol ? BRAND.redDark : BRAND.text,
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: 4,
                    fontSize: 15,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    Alkol tüketiyorum
                  </p>
                  <p style={{ 
                    color: BRAND.textLight, 
                    fontSize: 12, 
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    Yüksek ÖTV oranı
                  </p>
                </div>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: `2px solid ${drinksAlcohol ? BRAND.redDark : "#D1D5DB"}`,
                  backgroundColor: drinksAlcohol ? BRAND.redDark : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginLeft: 4,
                }}>
                  {drinksAlcohol && (
                    <div style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      backgroundColor: BRAND.white,
                    }} />
                  )}
                </div>
              </button>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setJourneyStep(4)}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 16,
                    border: `1px solid ${BRAND.border}`,
                    background: BRAND.white,
                    color: BRAND.text,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 16,
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND.inputBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND.white;
                  }}
                >
                  ← Geri
                </button>
                <button
                  onClick={() => setJourneyStep(6)}
                  style={{
                    flex: 2,
                    padding: 16,
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
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 8,
                marginBottom: 12
              }}>
                <Calculator size={20} style={{ color: BRAND.redDark, strokeWidth: 2 }} />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: BRAND.text }}>
                  Veri izni ve hesaplama
                </h2>
              </div>
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
                    padding: "16px",
                    borderRadius: 16,
                    border: "none",
                    background: canCalculate ? BRAND.red : "#CBCED4",
                    color: BRAND.white,
                    fontWeight: 600,
                    cursor: canCalculate ? "pointer" : "not-allowed",
                    fontSize: 16,
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (canCalculate) {
                      e.currentTarget.style.backgroundColor = BRAND.redHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (canCalculate) {
                      e.currentTarget.style.backgroundColor = BRAND.red;
                    }
                  }}
                >
                  {savingState === "saving" ? "Hesaplanıyor..." : "Devam Et"}
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
          Diskursi · (Yaklaşık) Vergi Simülasyonu · v2
        </footer>
      </div>
    </div>
  );
}
