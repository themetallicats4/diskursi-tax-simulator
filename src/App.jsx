import { useMemo, useState } from "react";

const BRAND = {
  red: "#B91C1C",
  orange: "#F97316",
  cream: "#FFF7ED",
  text: "#2E2E2E",
};

const INCOME_BANDS = [
  { label: "0–10.000 TL", value: "0-10k", mid: 5000 },
  { label: "10.001–20.000 TL", value: "10-20k", mid: 15000 },
  { label: "20.001–30.000 TL", value: "20-30k", mid: 25000 },
  { label: "30.001–50.000 TL", value: "30-50k", mid: 40000 },
  { label: "50.001–80.000 TL", value: "50-80k", mid: 65000 },
  { label: "80.001+ TL", value: "80k+", mid: 95000 },
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function formatTL(n) {
  // 120000 -> 120.000
  return new Intl.NumberFormat("tr-TR").format(n);
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

/**
 * v1 Estimate Model (MVP)
 * - We approximate "effective tax burden" mainly via indirect taxes.
 * - Rent is assumed low VAT impact (proxy: 0–2%).
 * - Food lower VAT impact, transport higher, other medium.
 * - Add surcharges for car / cigarettes / alcohol.
 * - Return a range (min/max) + TL range.
 */
function computeEstimate({
  incomeMidMonthly,
  spend_food,
  spend_rent,
  spend_transport,
  spend_other,
  has_car,
  smokes,
  drinks_alcohol,
}) {
  const annualIncome = incomeMidMonthly * 12;

  // Weighted indirect tax proxy rates (not exact VAT/ÖTV, but a plausible proxy)
  const rateFood = 0.08; // lower
  const rateRent = 0.02; // near zero-ish proxy
  const rateTransport = 0.18; // higher
  const rateOther = 0.12; // medium

  const weightedRate =
    (spend_food / 100) * rateFood +
    (spend_rent / 100) * rateRent +
    (spend_transport / 100) * rateTransport +
    (spend_other / 100) * rateOther;

  // Surcharges as additional effective burden
  let surcharge = 0;
  if (has_car) surcharge += 0.03; // car ownership tends to imply fuel/vehicle taxes
  if (smokes) surcharge += 0.025; // strong excise proxy
  if (drinks_alcohol) surcharge += 0.02; // excise proxy

  // Baseline effective tax percent
  const basePct = weightedRate + surcharge;

  // Add uncertainty band (range)
  const minPct = clamp(Math.round((basePct - 0.03) * 100), 5, 80);
  const maxPct = clamp(Math.round((basePct + 0.05) * 100), 5, 80);

  const tlMin = Math.round(annualIncome * (minPct / 100));
  const tlMax = Math.round(annualIncome * (maxPct / 100));

  return {
    annualIncome,
    result_tax_pct_min: minPct,
    result_tax_pct_max: maxPct,
    result_tl_min: tlMin,
    result_tl_max: tlMax,
  };
}

export default function App() {
  const [step, setStep] = useState("form"); // "form" | "result"
  const [savingState, setSavingState] = useState("idle"); // idle | saving | saved | error
  const [saveError, setSaveError] = useState("");

  const [incomeBand, setIncomeBand] = useState(INCOME_BANDS[2].value);

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

  const incomeObj = useMemo(() => {
    return INCOME_BANDS.find((b) => b.value === incomeBand) || INCOME_BANDS[2];
  }, [incomeBand]);

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

  const canCalculate = sumOk && consent && incomeBand && savingState !== "saving";

  async function handleCalculate() {
    if (!canCalculate) return;

    setSavingState("saving");
    setSaveError("");

    // 1) compute
    const computed = computeEstimate({
      incomeMidMonthly: incomeObj.mid,
      spend_food: food,
      spend_rent: rent,
      spend_transport: transport,
      spend_other: other,
      has_car: hasCar,
      smokes,
      drinks_alcohol: drinksAlcohol,
    });

    // 2) save to DB via Netlify Function
    const payload = {
      dk_hp: "", // honeypot, keep empty
      sim_version: "v1",
      net_income_band: incomeObj.value,

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
      client_fingerprint: null,
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
      incomeLabel: incomeObj.label,
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
                <div style={{ color: "#666", fontSize: 13 }}>Aylık net gelir aralığın</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{result.incomeLabel}</div>
              </div>
              <div style={{ flex: "1 1 320px" }}>
                <div style={{ color: "#666", fontSize: 13 }}>Yıllık net gelir (yaklaşık)</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>
                  {formatTL(result.annualIncome)} TL
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

            <Row>
              <button
                onClick={resetToForm}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                ← Geri dön
              </button>

              <button
                onClick={() => alert("Next step: Share-card generator (Step 14).")}
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
                Paylaşılabilir görsel oluştur (yakında)
              </button>
            </Row>
          </Card>

          <div style={{ height: 18 }} />

          <footer style={{ color: "#777", fontSize: 12, textAlign: "center" }}>
            Diskursi MVP · “Yaklaşık” simülasyon · v1
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
          <h2 style={{ marginTop: 0, fontSize: 18 }}>1) Aylık net gelirin hangi aralıkta?</h2>

          <select
            value={incomeBand}
            onChange={(e) => setIncomeBand(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: 16,
            }}
          >
            {INCOME_BANDS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>

          <div style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
            Seçili: <strong>{incomeObj.label}</strong>
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
            <Row>
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
            </Row>
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

            <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
              (Hesaplanınca sonuç ekranına geçeceğiz ve yanıtı anonim şekilde kaydedeceğiz.)
            </div>
          </div>
        </Card>

        <div style={{ height: 18 }} />

        <footer style={{ color: "#777", fontSize: 12, textAlign: "center" }}>
          Diskursi MVP · “Yaklaşık” simülasyon · v1
        </footer>
      </div>
    </div>
  );
}
