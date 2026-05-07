// REAL MPESA STK PUSH (BACKEND EXAMPLE USING NODE.JS)

const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const consumerKey = "YOUR_CONSUMER_KEY";
const consumerSecret = "YOUR_CONSUMER_SECRET";

app.post("/stkpush", async (req, res) => {

    const { phone, amount } = req.body;

    try {

        // GENERATE ACCESS TOKEN
        const auth = Buffer.from(
          consumerKey + ":" + consumerSecret
        ).toString("base64");

        const tokenResponse = await axios.get(
          "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
          {
            headers:{
              Authorization: `Basic ${auth}`
            }
          }
        );

        const accessToken = tokenResponse.data.access_token;

        // SEND STK PUSH
        const response = await axios.post(
          "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
          {
            BusinessShortCode: "174379",
            Password: "YOUR_PASSWORD",
            Timestamp: "20260507120000",
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phone,
            PartyB: "174379",
            PhoneNumber: phone,
            CallBackURL: "https://yourdomain.com/callback",
            AccountReference: "DopeForChrist",
            TransactionDesc: "Clothing Payment"
          },
          {
            headers:{
              Authorization:`Bearer ${accessToken}`
            }
          }
        );

        res.json(response.data);

    } catch(error){
        console.log(error);
        res.send("Error sending STK push");
    }

});

app.listen(3000, ()=>{
    console.log("Server running on port 3000");
});