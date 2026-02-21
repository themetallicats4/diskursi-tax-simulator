import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

export async function handler(event) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const payload = JSON.parse(event.body || "{}");

        const fp = payload.client_fingerprint;
        if (!fp || String(fp).trim() === "") {
            return {
                statusCode: 400,
                body: JSON.stringify({ ok: false, error: "Missing client_fingerprint" }),
            };
        }

        const fs = Number(payload.fairness_score);
        if (!Number.isFinite(fs) || fs < 0 || fs > 10) {
            return {
                statusCode: 400,
                body: JSON.stringify({ ok: false, error: "Invalid fairness_score (must be 0-10)" }),
            };
        }

        // Find the most recent submission for this fingerprint and update it
        const { data: rows, error: findErr } = await supabase
            .from("tax_sim_submissions")
            .select("id")
            .eq("client_fingerprint", fp)
            .order("created_at", { ascending: false })
            .limit(1);

        if (findErr) {
            return {
                statusCode: 500,
                body: JSON.stringify({ ok: false, error: findErr.message }),
            };
        }

        if (!rows || rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ ok: false, error: "No submission found for this fingerprint" }),
            };
        }

        const rowId = rows[0].id;

        const { error: updateErr } = await supabase
            .from("tax_sim_submissions")
            .update({ fairness_score: fs })
            .eq("id", rowId);

        if (updateErr) {
            return {
                statusCode: 500,
                body: JSON.stringify({ ok: false, error: updateErr.message }),
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
