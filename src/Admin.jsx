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
  const [adminToken, setAdminToken] = useState(sessionStorage.getItem("adminToken") || "");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
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

  async function handleLogin() {
    setAuthError("");
    try {
      const res = await fetch("/.netlify/functions/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: passwordInput }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setAuthError(json.error || "Login failed");
        return;
      }
      sessionStorage.setItem("adminToken", json.token);
      setAdminToken(json.token);
    } catch (e) {
      setAuthError("Network error");
    }
  }

  // Fetch current values on mount
  useEffect(() => {
    if (!adminToken) {
      setLoading(false);
      return;
    }

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
  }, [adminToken]);

  async function handleSave() {
    setSaveState("saving");
    setSaveError("");

    try {
      const payload = {
        teacher_monthly_salary: form.teacher_monthly_salary,
        scholarship_monthly: form.scholarship_monthly,
        ambulance_daily_cost: form.ambulance_daily_cost,
        school_m2_cost: form.school_m2_cost,
        school_avg_m2: form.school_avg_m2,
        hospital_m2_cost: form.hospital_m2_cost,
        hospital_avg_m2: form.hospital_avg_m2,
      };

      const res = await fetch("/.netlify/functions/save-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setSaveState("error");
        setSaveError(json.error || "Kaydetme başarısız");
        return;
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch (e) {
      setSaveState("error");
      setSaveError("Network hatası");
    }
  }

  if (!adminToken) {
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
            maxWidth: 400,
            width: "100%",
            padding: 32,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: BRAND.red }}>
              Admin Girişi
            </h2>
          </div>

          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
            placeholder="Şifre"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 14px",
              marginBottom: 12,
              borderRadius: 12,
              border: "1px solid #ddd",
              fontSize: 16,
              fontWeight: 600,
              background: "#fafafa",
            }}
          />

          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 14,
              border: "none",
              background: BRAND.red,
              color: "#fff",
              fontWeight: 900,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            Giriş Yap
          </button>

          {authError && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 10,
                background: "#FEE2E2",
                color: "#991B1B",
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {authError}
            </div>
          )}
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
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800, color: BRAND.red, letterSpacing: 0.2 }}>Diskursi</div>
            <h1 style={{ margin: "6px 0 4px", fontSize: 24 }}>⚙️ Admin Panel</h1>
            <p style={{ margin: 0, color: "#555", fontSize: 13 }}>
              Simülasyon konfigürasyon değerlerini buradan güncelleyebilirsiniz.
            </p>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem("adminToken");
              setAdminToken("");
            }}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#fff",
              color: BRAND.text,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Çıkış Yap
          </button>
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
