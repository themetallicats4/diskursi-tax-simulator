import { useState } from "react";

export default function App() {
  const [status, setStatus] = useState("idle");

  async function handleTestSave() {
    setStatus("saving...");

    const payload = {
      // honeypot field (should remain empty)
      dk_hp: "",

      sim_version: "v1",
      net_income_band: "20-30k",

      spend_food: 25,
      spend_rent: 35,
      spend_transport: 15,
      spend_other: 25,

      has_car: false,
      smokes: false,
      drinks_alcohol: false,
      owns_real_estate: null,

      result_tax_pct_min: 25,
      result_tax_pct_max: 35,
      result_tl_min: 120000,
      result_tl_max: 180000,

      consent_analytics: true,
      client_fingerprint: null,
    };

    try {
      const res = await fetch("/.netlify/functions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.ok) setStatus("saved ✅");
      else setStatus("error: " + (json.error || "unknown"));
    } catch (e) {
      setStatus("network error");
    }
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 720 }}>
      <h1 style={{ marginBottom: 8 }}>Diskursi – Tax Simulator (Test)</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        This is a temporary test button to confirm saving to Supabase works from the
        live app.
      </p>

      <button
        onClick={handleTestSave}
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          border: "none",
          background: "#B91C1C",
          color: "white",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Test Save to Database
      </button>

      <div style={{ marginTop: 12 }}>
        <strong>Status:</strong> {status}
      </div>
    </div>
  );
}
