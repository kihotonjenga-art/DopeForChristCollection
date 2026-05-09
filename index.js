const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const consumerKey = "QaBQppqmG3XUicmT6nnA2aGcPsAANK7qxAJ1WQrF9RMH9sAH";
const consumerSecret = "J5eDUOqo4fTGU7nQQwcYLWft8N0ItxnTCGfmihWY7zAvh1ND1kZDn32h7gv7aXbU";

app.post("/stkpush", async (req, res) => {

  const { phone, amount, product } = req.body;

  try {

    // GENERATE ACCESS TOKEN
    const auth = Buffer.from(
      `${consumerKey}:${consumerSecret}`
    ).toString("base64");

    const tokenResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // TIMESTAMP
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);

    const shortcode = "174379";

    const passkey = "YOUR_PASSKEY";

    const password = Buffer.from(
      shortcode + passkey + timestamp
    ).toString("base64");

    // STK PUSH
    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: "https://yourdomain.com/callback",
        AccountReference: product,
        TransactionDesc: "Payment"
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    res.json({
      success: true,
      response: stkResponse.data
    });

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.json({
      success: false,
      message: "STK Push Failed"
    });

  }

});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});