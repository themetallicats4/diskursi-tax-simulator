import { useMemo, useState } from "react";

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
  const aha = `Bu, yılda yaklaşık ${monthsMin}–${monthsMax} ay “vergiler için çalışmak” gibi.`;

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

  // ---- Indirect estimate (your existing proxy model)
  const rateFood = 0.08;
  const rateRent = 0.02;
  const rateTransport = 0.18;
  const rateOther = 0.12;

  const weightedRate =
    (spend_food / 100) * rateFood +
    (spend_rent / 100) * rateRent +
    (spend_transport / 100) * rateTransport +
    (spend_other / 100) * rateOther;

  let surcharge = 0;
  if (has_car) surcharge += 0.03;
  if (smokes) surcharge += 0.025;
  if (drinks_alcohol) surcharge += 0.02;

  const indirectBasePct = weightedRate + surcharge;

  // uncertainty band for indirect part (same idea as v1)
  const indirectMinPct = clamp(indirectBasePct - 0.03, 0.00, 0.80);
  const indirectMaxPct = clamp(indirectBasePct + 0.05, 0.00, 0.80);

  const indirectMinTL = annualGrossTotal * indirectMinPct;
  const indirectMaxTL = annualGrossTotal * indirectMaxPct;

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

export default function App() {
  const [step, setStep] = useState("form"); // "form" | "result"
  const [savingState, setSavingState] = useState("idle"); // idle | saving | saved | error
  const [saveError, setSaveError] = useState("");

  // Income (monthly gross)
  const [wageGrossMonthly, setWageGrossMonthly] = useState(20000);
  const [otherIncomeMonthly, setOtherIncomeMonthly] = useState(0);

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

  // Results stored after compute
  const [result, setResult] = useState(null);

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

      wage_gross_monthly: wageGrossMonthly,
      other_income_monthly: otherIncomeMonthly,
      annual_gross_total: computed.annualGrossTotal,
      direct_tax_total: computed.directTaxTotal,

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
        // Still show results (so user doesn’t lose the “aha” moment)
      } else {
        setSavingState("saved");
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

  if (step === "result" && result) {
    const monthsForTaxesMin = Math.round((result.result_tax_pct_min / 100) * 12);
    const monthsForTaxesMax = Math.round((result.result_tax_pct_max / 100) * 12);

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
            <h1 style={{ margin: "6px 0 4px", fontSize: 28 }}>Sonuç</h1>
            <p style={{ margin: 0, color: "#555", lineHeight: 1.5 }}>
              Bu bir “yaklaşık” tahmindir. Amaç farkındalık yaratmaktır.
            </p>
          </header>

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
                sadece “vergiler için çalışmak” gibi düşünebilirsin.
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
                onClick={resetToForm}
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
                ← Geri dön
              </button>

              <button
                onClick={() => {
                  const dataUrl = generateShareCardDataUrl(result);
                  downloadDataUrl(dataUrl, "diskursi-vergi-sonuc.png");
                }}
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
                Paylaşılabilir görsel indir (PNG)
              </button>

            </div>
          </Card>

          <div style={{ height: 18 }} />

          <footer style={{ color: "#777", fontSize: 12, textAlign: "center" }}>
            Diskursi MVP · “Yaklaşık” simülasyon · v2
          </footer>
        </div>
      </div>
    );
  }

  // FORM STEP
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
            1 dakikada yaklaşık bir tahmin. Tam rakam değil; “yaklaşık” bir farkındalık aracı.
          </p>
        </header>

        <Card>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>1) Gelir bilgisi (Aylık brüt)</h2>
          <p style={{ marginTop: 0, color: "#555" }}>
            Brüt gelir baz alıyoruz. En az bir gelir kalemi 0'dan büyük olmalı.
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
              {new Intl.NumberFormat("tr-TR").format((wageGrossMonthly + otherIncomeMonthly) * 12)} TL
            </strong>
          </div>
        </Card>

        <div style={{ height: 12 }} />

        <Card>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>2) Harcamaların yaklaşık dağılımı</h2>
          <p style={{ marginTop: 0, color: "#555" }}>
            Toplamın <strong>100</strong> olması gerekiyor. Biz “Diğer” kalemini otomatik ayarlamaya çalışıyoruz.
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
        </Card>

        <div style={{ height: 12 }} />

        <Card>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>3) Bazı ek bilgiler (isteğe bağlı ama faydalı)</h2>
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
        </Card>

        <div style={{ height: 12 }} />

        <Card>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>4) Veri izni</h2>
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
        </Card>

        <div style={{ height: 18 }} />

        <footer style={{ color: "#777", fontSize: 12, textAlign: "center" }}>
          Diskursi MVP · “Yaklaşık” simülasyon · v2
        </footer>
      </div>
    </div>
  );
}
