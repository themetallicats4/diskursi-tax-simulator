const crypto = require("crypto");

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  }

  try {
    const { password } = JSON.parse(event.body);

    // Check password against environment variable
    const ADMIN_PASSWORD = process.env.VER_KENN;

    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      return {
        statusCode: 401,
        body: JSON.stringify({ ok: false, error: "Geçersiz şifre" }),
      };
    }

    // Generate a simple token (in production, use JWT)
    const token = crypto.randomBytes(32).toString("hex");

    // Store token in environment or return it
    // For simplicity, we'll just return a static token that the backend will validate
    // In production, you'd store this in a database with expiration
    const adminToken = Buffer.from(`${ADMIN_PASSWORD}:${Date.now()}`).toString("base64");

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        token: adminToken,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Server error" }),
    };
  }
};
