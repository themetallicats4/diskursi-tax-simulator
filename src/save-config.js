import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const authHeader = event.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token || token !== process.env.VER_KENN) {
      return {
        statusCode: 401,
        body: JSON.stringify({ ok: false, error: "Unauthorized" }),
      };
    }

    const payload = JSON.parse(event.body || "{}");

    const allowedKeys = [
      "teacher_monthly_salary",
      "scholarship_monthly",
      "ambulance_daily_cost",
      "school_m2_cost",
      "school_avg_m2",
      "hospital_m2_cost",
      "hospital_avg_m2",
    ];

    const updates = Object.entries(payload)
      .filter(([key, value]) => allowedKeys.includes(key) && value !== undefined && value !== null)
      .map(([key, value]) => ({
        key,
        value: Number(value),
        updated_at: new Date().toISOString(),
      }));

    if (updates.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "No valid config values provided" }),
      };
    }

    const { error } = await supabase
      .from("simulation_config")
      .upsert(updates, { onConflict: "key" });

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Server error" }),
    };
  }
}