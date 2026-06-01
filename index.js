const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // or your specific domain
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  next();
});

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

const passkey =
"bfb279f9aa9bdbcf158e97ddf3e7a2e0cd8b7a4b5c7c2e8e9";

    const password = Buffer.from(
      shortcode + passkey + timestamp
    ).toString("base64");

fetch(
  "https://dope-for-christ-collection-git-main-kihotonjenga-arts-projects.vercel.app/api/stkpush",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      phone,
      amount: price,
      product: name
    })
  }
);


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
        CallBackURL: "https://yourdomain.vercel.app/api/callback",
        AccountReference: product,
        TransactionDesc: "Payment"
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
const formattedPhone =
phone.startsWith("0")
? "254" + phone.slice(1)
: phone.replace("+", "");


const response = await fetch("...", { method: "POST", body: JSON.stringify({ phone, amount, product }) });

if (!response.ok) {
  const errText = await response.text();
  alert("HTTP Error " + response.status + ": " + errText);
  return;
}

let phone = document.getElementById("phone").value.trim();

// Auto-fix format
if (phone.startsWith("0")) {
  phone = "254" + phone.slice(1);
}

if (!/^254\d{9}$/.test(phone)) {
  alert("Invalid phone number. Use format: 254712345678");
  return;
}

const data = await response.json();

const stkResponse = await axios.post(
"https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
{
   BusinessShortCode: shortcode,
   Password: password,
   Timestamp: timestamp,
   TransactionType:
   "CustomerPayBillOnline",

   Amount: amount,

   PartyA: formattedPhone,
   PartyB: shortcode,

   PhoneNumber:
   formattedPhone,

   CallBackURL:
   "https://yourdomain.vercel.app/api/callback",

   AccountReference:
   product,

   TransactionDesc:
   "Payment"
},
{
headers:{
Authorization:
`Bearer ${accessToken}`
}
}
);

      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
     ;

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