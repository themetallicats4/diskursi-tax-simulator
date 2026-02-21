import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

function isInt(n) {
    return Number.isInteger(n);
}

export async function handler(event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const payload = JSON.parse(event.body || "{}");

        if (!payload.submission_id || String(payload.submission_id).trim() === "") {
            return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Missing submission_id" }) };
        }

        // Optional fields (validate only if present)
        const effectiveness = payload.effectiveness_score;
        if (effectiveness !== undefined && effectiveness !== null) {
            const v = Number(effectiveness);
            if (!isInt(v) || v < 0 || v > 10) {
                return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Invalid effectiveness_score" }) };
            }
        }

        const trust = payload.trust_central_gov_score;
        if (trust !== undefined && trust !== null) {
            const v = Number(trust);
            if (!isInt(v) || v < 0 || v > 10) {
                return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Invalid trust_central_gov_score" }) };
            }
        }

        const row = {
            submission_id: payload.submission_id,
            age_band: payload.age_band ?? null,
            gender: payload.gender ?? null,
            city: payload.city ?? null,
            tenant_status: payload.tenant_status ?? null,
            effectiveness_score: payload.effectiveness_score ?? null,
            trust_central_gov_score: payload.trust_central_gov_score ?? null,
            policy_priority: payload.policy_priority ?? null,
        };

        const { error } = await supabase.from("tax_sim_optional_survey").insert([row]);

        if (error) {
            return { statusCode: 500, body: JSON.stringify({ ok: false, error: error.message }) };
        }

        return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ ok: false, error: "Server error" }) };
    }
}
