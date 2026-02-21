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
            "spend_food",
            "spend_rent",
            "spend_transport",
            "spend_other",
            "savings_rate",
            "has_car",
            "smokes",
            "drinks_alcohol",
            "result_tax_pct_min",
            "result_tax_pct_max",
            "result_tl_min",
            "result_tl_max",
            "consent_analytics",
            "wage_gross_monthly",
            "other_income_monthly",
            "annual_gross_total",
            "direct_tax_total",
            "occupation",
            "fairness_score",
        ];

        for (const k of required) {
            if (payload[k] === undefined || payload[k] === null) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ ok: false, error: `Missing: ${k}` }),
                };
            }
        }

        const wage = Number(payload.wage_gross_monthly || 0);
        const otherInc = Number(payload.other_income_monthly || 0);

        if (wage <= 0 && otherInc <= 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ ok: false, error: "Income cannot be zero for both wage and other." }),
            };
        }

        const s = Number(payload.savings_rate);
        if (!Number.isFinite(s) || s < 0 || s > 0.9) {
            return {
                statusCode: 400,
                body: JSON.stringify({ ok: false, error: "Invalid savings_rate" }),
            };
        }

        // Occupation validation
        if (!payload.occupation || String(payload.occupation).trim() === "") {
            return {
                statusCode: 400,
                body: JSON.stringify({ ok: false, error: "Missing occupation" }),
            };
        }

        // Fairness score validation
        const fs = Number(payload.fairness_score);
        if (!Number.isFinite(fs) || fs < 0 || fs > 10) {
            return {
                statusCode: 400,
                body: JSON.stringify({ ok: false, error: "Invalid fairness_score" }),
            };
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
            net_income_band: payload.net_income_band || null,
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
            wage_gross_monthly: payload.wage_gross_monthly,
            other_income_monthly: payload.other_income_monthly,
            savings_rate: payload.savings_rate,
            annual_gross_total: payload.annual_gross_total,
            direct_tax_total: payload.direct_tax_total,
            occupation: String(payload.occupation).trim(),
            fairness_score: Number(payload.fairness_score),
        };

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
