import axios from "axios";
import jwt from "jsonwebtoken";

// Generate Google Indexing API Auth Token
async function getAccessToken() {
  const key = JSON.parse(process.env.GOOGLE_INDEXING_KEY_JSON);
  const privateKey = key.private_key.replace(/\\n/g, "\n");

  const jwtToken = jwt.sign(
    {
      iss: key.client_email,
      scope: "https://www.googleapis.com/auth/indexing",
      aud: "https://oauth2.googleapis.com/token",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    privateKey,
    { algorithm: "RS256" }
  );

  const { data } = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwtToken,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return data.access_token;
}

// Submit a single URL
async function indexUrl(url, type, accessToken) {
  return axios.post(
    "https://indexing.googleapis.com/v3/urlNotifications:publish",
    { url, type },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { urls, action } = req.body;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ message: "Missing URLs array" });
  }

  if (!["publish", "update", "delete"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  // Convert action → Google type
  const googleType = action === "delete" ? "URL_DELETED" : "URL_UPDATED";

  try {
    const accessToken = await getAccessToken();

    const results = [];

    // Google Indexing API supports batch — but we send sequentially for clean logging
    for (const url of urls) {
      try {
        const response = await indexUrl(url, googleType, accessToken);
        results.push({
          url,
          status: "success",
          googleResponse: response.data,
        });
      } catch (err) {
        results.push({
          url,
          status: "failed",
          error: err.response?.data || err.message,
        });
      }
    }

    return res.status(200).json({
      message: `Batch indexing completed`,
      count: urls.length,
      action,
      googleType,
      results,
    });
  } catch (error) {
    console.error("Batch Google Index Error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Google Indexing Failed",
      error: error.response?.data || error.message,
    });
  }
}
