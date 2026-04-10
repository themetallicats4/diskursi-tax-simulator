import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const BRAND = {
  red: "#B91C1C",
  cream: "#FFF7ED",
  text: "#2E2E2E",
};

const CONFIG_KEYS = [
  { key: "teacher_monthly_salary", label: "👩‍🏫 Öğretmen net aylık maaşı (TL)", placeholder: "73368" },
  { key: "scholarship_monthly", label: "🎓 Burs miktarı (aylık TL)", placeholder: "3000" },
  { key: "ambulance_daily_cost", label: "🚑 Ambulans günlük maliyeti (TL)", placeholder: "10000" },
  { key: "school_m2_cost", label: "🏫 School m² cost (TL)", placeholder: "21050" },
  { key: "school_avg_m2", label: "🏫 School average m²", placeholder: "6715" },
  { key: "hospital_m2_cost", label: "🏥 Hospital m² cost (TL)", placeholder: "40500" },
  { key: "hospital_avg_m2", label: "🏥 Hospital average m²", placeholder: "22500" },
];

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [form, setForm] = useState({
    teacher_monthly_salary: "",
    scholarship_monthly: "",
    ambulance_daily_cost: "",
    school_m2_cost: "",
    school_avg_m2: "",
    hospital_m2_cost: "",
    hospital_avg_m2: "",
  });
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [saveError, setSaveError] = useState("");

  // Simple password protection
  useEffect(() => {
    const password = prompt("Admin şifresi girin:");
    if (password === "diskursi123") {
      setAuthenticated(true);
    }
  }, []);

  // Fetch current values on mount
  useEffect(() => {
    if (!authenticated) return;

    async function fetchConfig() {
      const { data, error } = await supabase
        .from("simulation_config")
        .select("*");

      if (!error && data) {
        const obj = {};
        data.forEach((row) => {
          obj[row.key] = String(row.value);
        });
        setForm((prev) => ({ ...prev, ...obj }));
      }
      setLoading(false);
    }

    fetchConfig();
  }, [authenticated]);

  async function handleSave() {
    setSaveState("saving");
    setSaveError("");

    try {
      for (const key in form) {
        const val = Number(form[key]);
        if (!Number.isFinite(val) || val < 0) {
          setSaveState("error");
          setSaveError(`Geçersiz değer: ${key}`);
          return;
        }

        const { error } = await supabase
          .from("simulation_config")
          .upsert({
            key,
            value: val,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          setSaveState("error");
          setSaveError(error.message);
          return;
        }
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch (e) {
      setSaveState("error");
      setSaveError("Ağ hatası");
    }
  }

  if (!authenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BRAND.cream,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        }}
      >
        <div
          style={{
            padding: 32,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
          <div style={{ fontWeight: 900, color: BRAND.red }}>Erişim reddedildi</div>
          <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
            Geçerli bir şifre girilmedi.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: BRAND.red,
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Tekrar dene
          </button>
        </div>
      </div>
    );
  }

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
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 800, color: BRAND.red, letterSpacing: 0.2 }}>Diskursi</div>
          <h1 style={{ margin: "6px 0 4px", fontSize: 24 }}>⚙️ Admin Panel</h1>
          <p style={{ margin: 0, color: "#555", fontSize: 13 }}>
            Simülasyon konfigürasyon değerlerini buradan güncelleyebilirsiniz.
          </p>
        </div>

        {/* Config card */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: 32, color: "#666" }}>Yükleniyor...</div>
          ) : (
            <>
              {CONFIG_KEYS.map(({ key, label, placeholder }) => (
                <div key={key} style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 800,
                      fontSize: 13,
                      marginBottom: 6,
                      color: "#444",
                    }}
                  >
                    {label}
                  </label>
                  <input
                    type="number"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid #ddd",
                      fontSize: 16,
                      fontWeight: 700,
                      background: "#fafafa",
                    }}
                  />
                </div>
              ))}

              {/* Save button */}
              <button
                disabled={saveState === "saving"}
                onClick={handleSave}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "none",
                  background:
                    saveState === "saved"
                      ? "rgba(22,163,74,1)"
                      : saveState === "error"
                        ? "#F97316"
                        : BRAND.red,
                  color: "#fff",
                  fontWeight: 900,
                  cursor: saveState === "saving" ? "not-allowed" : "pointer",
                  fontSize: 15,
                  transition: "background 200ms ease",
                }}
              >
                {saveState === "saving"
                  ? "Kaydediliyor..."
                  : saveState === "saved"
                    ? "✅ Kaydedildi!"
                    : saveState === "error"
                      ? "⚠️ Hata — tekrar dene"
                      : "💾 Kaydet"}
              </button>

              {saveState === "error" && saveError && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#F97316", fontWeight: 700 }}>
                  {saveError}
                </div>
              )}
            </>
          )}
        </div>

        {/* Back link */}
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a
            href="/"
            style={{
              color: BRAND.red,
              fontWeight: 800,
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            ← Simülasyona geri dön
          </a>
        </div>

        <footer style={{ marginTop: 24, color: "#777", fontSize: 12, textAlign: "center" }}>
          Diskursi Admin · Konfigürasyon Paneli
        </footer>
      </div>
    </div>
  );
}
