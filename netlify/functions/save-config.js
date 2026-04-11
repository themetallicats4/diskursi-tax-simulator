const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  }

  try {
    // Verify authorization token
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ ok: false, error: "Unauthorized" }),
      };
    }

    const token = authHeader.substring(7);

    // Validate token (decode base64 and check password)
    const ADMIN_PASSWORD = process.env.VER_KENN;
    
    if (!ADMIN_PASSWORD) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: "Server configuration error" }),
      };
    }
    
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const [password, timestamp] = decoded.split(":");
      
      if (password !== ADMIN_PASSWORD) {
        return {
          statusCode: 401,
          body: JSON.stringify({ ok: false, error: "Invalid token" }),
        };
      }

      // Optional: Check token age (e.g., 24 hours)
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return {
          statusCode: 401,
          body: JSON.stringify({ ok: false, error: "Token expired" }),
        };
      }
    } catch (e) {
      return {
        statusCode: 401,
        body: JSON.stringify({ ok: false, error: "Invalid token format" }),
      };
    }

    // Parse request body
    const payload = JSON.parse(event.body);

    // Initialize Supabase with service role key
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: "Server configuration error" }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate and save each config value
    const configKeys = [
      "teacher_monthly_salary",
      "scholarship_monthly",
      "ambulance_daily_cost",
      "school_m2_cost",
      "school_avg_m2",
      "hospital_m2_cost",
      "hospital_avg_m2",
    ];

    for (const key of configKeys) {
      if (!(key in payload)) continue;

      const val = Number(payload[key]);
      if (!Number.isFinite(val) || val < 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ ok: false, error: `Geçersiz değer: ${key}` }),
        };
      }

      const { error } = await supabase
        .from("simulation_config")
        .upsert({
          key,
          value: val,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ ok: false, error: error.message }),
        };
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Server error" }),
    };
  }
};
