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

export default function App() {
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
  const [ownsRealEstate, setOwnsRealEstate] = useState(null); // null means "not answered"

  const [consent, setConsent] = useState(true);

  const sum = food + rent + transport + other;
  const sumOk = sum === 100;

  const incomeLabel = useMemo(() => {
    return INCOME_BANDS.find((b) => b.value === incomeBand)?.label || "";
  }, [incomeBand]);

  // Helpers to keep sliders sane without complicated logic yet
  function nudgeToHundred(changedKey, nextValue) {
    // Simple approach: set the changed one, then adjust "other" to keep sum 100.
    // If "other" would go negative, clamp and accept sum mismatch (user can fix).
    let f = food, r = rent, t = transport, o = other;

    if (changedKey === "food") f = nextValue;
    if (changedKey === "rent") r = nextValue;
    if (changedKey === "transport") t = nextValue;
    if (changedKey === "other") o = nextValue;

    const newSum = f + r + t + o;
    const diff = 100 - newSum;

    // If user changed something other than "other", auto-adjust "other"
    if (changedKey !== "other") {
      o = clamp(o + diff, 0, 100);
    }

    setFood(f);
    setRent(r);
    setTransport(t);
    setOther(o);
  }

  const canContinue = sumOk && consent && incomeBand;

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
          <div style={{ fontWeight: 800, color: BRAND.red, letterSpacing: 0.2 }}>
            Diskursi
          </div>
          <h1 style={{ margin: "6px 0 4px", fontSize: 28 }}>
            Vergi Yükü Simülasyonu (MVP)
          </h1>
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
            Seçili: <strong>{incomeLabel}</strong>
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
              disabled={!canContinue}
              onClick={() => alert("Next step: calculation + result screen (we’ll add next).")}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 14,
                border: "none",
                background: canContinue ? BRAND.red : "rgba(0,0,0,0.18)",
                color: "white",
                fontWeight: 800,
                cursor: canContinue ? "pointer" : "not-allowed",
                fontSize: 16,
              }}
            >
              Sonucu Hesapla →
            </button>

            <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
              (Şimdilik bu buton sadece test amaçlı. Bir sonraki adımda hesaplama + kayıt + sonuç ekranı gelecek.)
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
