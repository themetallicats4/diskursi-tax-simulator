export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { password } = JSON.parse(event.body || "{}");

    if (!password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "Password is required" }),
      };
    }

    const realPassword = process.env.VER_KENN;

    if (!realPassword) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: "VER_KENN not configured" }),
      };
    }

    if (password !== realPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({ ok: false, error: "Invalid password" }),
      };
    }

    // Very simple session token for now
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        token: realPassword, // simple version for now
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Server error" }),
    };
  }
}