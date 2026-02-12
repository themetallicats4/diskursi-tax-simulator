import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

function isInteger(n) {
    return Number.isInteger(n);
}

export async function handler(event) {
    // Allow only POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const payload = JSON.parse(event.body || "{}");

        // Honeypot anti-bot: if filled, accept but do nothing
        if (payload.dk_hp && String(payload.dk_hp).trim() !== "") {
            return { statusCode: 200, body: JSON.stringify({ ok: true }) };
        }

        // Required fields
        const required = [
            "sim_version",
            "net_income_band",
            "spend_food",
            "spend_rent",
            "spend_transport",
            "spend_other",
            "has_car",
            "smokes",
            "drinks_alcohol",
            "result_tax_pct_min",
            "result_tax_pct_max",
            "result_tl_min",
            "result_tl_max",
            "consent_analytics",
        ];

        for (const k of required) {
            if (payload[k] === undefined || payload[k] === null) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ ok: false, error: `Missing: ${k}` }),
                };
            }
        }

        // Spend split validation
        const sum =
            payload.spend_food +
            payload.spend_rent +
            payload.spend_transport +
            payload.spend_other;

        if (!isInteger(sum) || sum !== 100) {
            return {
                statusCode: 400,
                body: JSON.stringify({ ok: false, error: "Spend splits must sum to 100" }),
            };
        }

        // Build row
        const row = {
            sim_version: payload.sim_version,
            net_income_band: payload.net_income_band,
            spend_food: payload.spend_food,
            spend_rent: payload.spend_rent,
            spend_transport: payload.spend_transport,
            spend_other: payload.spend_other,
            has_car: !!payload.has_car,
            smokes: !!payload.smokes,
            drinks_alcohol: !!payload.drinks_alcohol,
            owns_real_estate:
                payload.owns_real_estate === undefined ? null : !!payload.owns_real_estate,
            result_tax_pct_min: payload.result_tax_pct_min,
            result_tax_pct_max: payload.result_tax_pct_max,
            result_tl_min: payload.result_tl_min,
            result_tl_max: payload.result_tl_max,
            consent_analytics: !!payload.consent_analytics,
            client_fingerprint: payload.client_fingerprint || null,
        };
        console.log("DEBUG fingerprint:", row.client_fingerprint);

        // Simple rate limit: 1 submission per 30 seconds per fingerprint
        // Simple rate limit: 1 submission per 30 seconds per fingerprint (DB-side, reliable)
        if (row.client_fingerprint) {
            const fp = row.client_fingerprint;

            // Ask Postgres: is there a submission in the last 30 seconds?
            const sinceIso = new Date(Date.now() - 30 * 1000).toISOString();

            const { data: recent, error: recentErr } = await supabase
                .from("tax_sim_submissions")
                .select("id, created_at")
                .eq("client_fingerprint", fp)
                .gte("created_at", sinceIso)
                .limit(1);

            if (recentErr) {
                console.log("RATE_LIMIT lookup error:", recentErr.message);
            } else if (recent && recent.length > 0) {
                console.log("RATE_LIMIT hit for fp:", fp, "recent created_at:", recent[0].created_at);
                return {
                    statusCode: 429,
                    body: JSON.stringify({
                        ok: false,
                        error: "Too many submissions. Please wait ~30 seconds and try again.",
                    }),
                };
            } else {
                console.log("RATE_LIMIT ok for fp:", fp);
            }
        }



        const { error } = await supabase.from("tax_sim_submissions").insert([row]);

        if (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ ok: false, error: error.message }),
            };
        }

        return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ ok: false, error: "Server error" }) };
    }
}
