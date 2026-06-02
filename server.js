const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Dope For Christ Backend Running");
});

app.post("/stkpush", async (req, res) => {
  try {
    const { phone, amount, product } = req.body;

    console.log("Payment Request:", {
      phone,
      amount,
      product
    });

    // Replace this section with actual Daraja API code
    res.json({
      success: true,
      message: "STK Push initiated successfully",
      phone,
      amount,
      product
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});