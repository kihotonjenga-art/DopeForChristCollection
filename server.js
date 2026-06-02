const express = require("express");
const cors    = require("cors");
const axios   = require("axios");
const Stripe  = require("stripe");
 
const app    = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
 
// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());
 
// ── M-Pesa Credentials (Sandbox — swap for live when ready) ──────────────────
const MPESA_CONSUMER_KEY    = process.env.MPESA_CONSUMER_KEY    || "QaBQppqmG3XUicmT6nnA2aGcPsAANK7qxAJ1WQrF9RMH9sAH";
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "J5eDUOqo4fTGU7nQQwcYLWft8N0ItxnTCGfmihWY7zAvh1ND1kZDn32h7gv7aXbU";
const SHORTCODE             = "174379";
const PASSKEY               = "bfb279f9aa9bdbcf158e97ddf3e7a2e0cd8b7a4b5c7c2e8e9";
const CALLBACK_URL          = process.env.CALLBACK_URL || "https:///https://dope-for-christ-collection-jrxlj4pxi-kihotonjenga-arts-projects.vercel.app///api/mpesa-callback";
 
// ── Helper: format phone ──────────────────────────────────────────────────────
function formatPhone(p) {
  p = p.trim().replace(/[\s\-()]/g, "");
  if (p.startsWith("+"))                        p = p.slice(1);
  if (p.startsWith("07") || p.startsWith("01")) p = "254" + p.slice(1);
  return p;
}
 
// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "DopeForChrist API is running ✅" });
});
 
// ─────────────────────────────────────────────────────────────────────────────
// M-PESA STK PUSH
// ─────────────────────────────────────────────────────────────────────────────
app.post("/stkpush", async (req, res) => {
  const { phone, amount, product } = req.body;
 
  if (!phone || !amount || !product) {
    return res.status(400).json({ success: false, message: "phone, amount and product are required." });
  }
 
  const formattedPhone = formatPhone(phone);
  if (!/^254[17]\d{8}$/.test(formattedPhone)) {
    return res.status(400).json({ success: false, message: "Invalid phone number. Use format: 0712345678" });
  }
 
  try {
    // 1. Get access token
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
    const tokenRes = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const accessToken = tokenRes.data.access_token;
 
    // 2. Timestamp & password
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const password  = Buffer.from(SHORTCODE + PASSKEY + timestamp).toString("base64");
 
    // 3. STK Push
    const stkRes = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: SHORTCODE,
        Password:          password,
        Timestamp:         timestamp,
        TransactionType:   "CustomerPayBillOnline",
        Amount:            Number(amount),
        PartyA:            formattedPhone,
        PartyB:            SHORTCODE,
        PhoneNumber:       formattedPhone,
        CallBackURL:       CALLBACK_URL,
        AccountReference:  product,
        TransactionDesc:   "Payment for " + product
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
 
    return res.json({ success: true, data: stkRes.data });
 
  } catch (err) {
    console.error("M-Pesa Error:", err.response?.data || err.message);
    return res.status(500).json({ success: false, message: "STK Push failed.", details: err.response?.data || err.message });
  }
});
 
// M-Pesa callback
app.post("/api/mpesa-callback", (req, res) => {
  console.log("M-Pesa Callback:", JSON.stringify(req.body, null, 2));
  res.json({ ResultCode: 0, ResultDesc: "Success" });
});
 
// ─────────────────────────────────────────────────────────────────────────────
// STRIPE — Create Payment Intent (foreign cards)
// ─────────────────────────────────────────────────────────────────────────────
app.post("/stripe/create-payment-intent", async (req, res) => {
  const { amount, currency = "usd", product } = req.body;
 
  if (!amount || !product) {
    return res.status(400).json({ success: false, message: "amount and product are required." });
  }
 
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(Number(amount) * 100), // Stripe uses cents
      currency: currency.toLowerCase(),
      metadata: { product }
    });
 
    return res.json({ success: true, clientSecret: paymentIntent.client_secret });
 
  } catch (err) {
    console.error("Stripe Error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});
 
// ── Start (local dev only — Vercel uses exports) ──────────────────────────────
if (require.main === module) {
  app.listen(5000, () => console.log("Server running on http://localhost:5000"));
}
 
module.exports = app;
 