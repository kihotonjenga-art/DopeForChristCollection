const express = require("express");
const cors = require("cors");
const axios = require("axios");
 
const app = express();
 
// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
 
// ── Safaricom Credentials (Sandbox) ──────────────────────────────────────────
const consumerKey    = "QaBQppqmG3XUicmT6nnA2aGcPsAANK7qxAJ1WQrF9RMH9sAH";
const consumerSecret = "J5eDUOqo4fTGU7nQQwcYLWft8N0ItxnTCGfmihWY7zAvh1ND1kZDn32h7gv7aXbU";
const shortcode      = "174379";
const passkey        = "bfb279f9aa9bdbcf158e97ddf3e7a2e0cd8b7a4b5c7c2e8e9";
 
// ── Helper: format phone to 254XXXXXXXXX ─────────────────────────────────────
function formatPhone(phone) {
  phone = phone.trim().replace(/\s+/g, "");
  if (phone.startsWith("0"))  return "254" + phone.slice(1);
  if (phone.startsWith("+"))  return phone.slice(1);
  return phone;
}
 
// ── STK Push Route ────────────────────────────────────────────────────────────
app.post("/stkpush", async (req, res) => {
  const { phone, amount, product } = req.body;
 
  // Basic validation
  if (!phone || !amount || !product) {
    return res.status(400).json({ success: false, message: "phone, amount and product are required." });
  }
 
  const formattedPhone = formatPhone(phone);
 
  if (!/^254\d{9}$/.test(formattedPhone)) {
    return res.status(400).json({ success: false, message: "Invalid phone number. Use format: 254712345678" });
  }
 
  try {
    // 1. Generate access token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
 
    const tokenResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
 
    const accessToken = tokenResponse.data.access_token;
 
    // 2. Build timestamp & password
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);
 
    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");
 
    // 3. Send STK Push
    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password:          password,
        Timestamp:         timestamp,
        TransactionType:   "CustomerPayBillOnline",
        Amount:            Number(amount),
        PartyA:            formattedPhone,
        PartyB:            shortcode,
        PhoneNumber:       formattedPhone,
        CallBackURL:       "https://yourdomain.vercel.app/api/callback", // ← replace with your real callback URL
        AccountReference:  product,
        TransactionDesc:   "Payment"
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
 
    return res.json({ success: true, response: stkResponse.data });
 
  } catch (error) {
    const errData = error.response?.data || error.message;
    console.error("STK Push Error:", errData);
    return res.status(500).json({ success: false, message: "STK Push Failed", details: errData });
  }
});
 
// ── M-Pesa Callback Route ─────────────────────────────────────────────────────
app.post("/api/callback", (req, res) => {
  console.log("M-Pesa Callback:", JSON.stringify(req.body, null, 2));
  res.json({ ResultCode: 0, ResultDesc: "Success" });
});
 
// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(5000, () => console.log("Server running on port 5000"));
 