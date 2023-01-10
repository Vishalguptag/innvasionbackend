const express = require("express");
const mongoose = require("mongoose");
const env = require("dotenv").config({ path: "./.env" });
const app = express();
const bodyParser = require("body-parser");
const { resolve } = require("path");
const cors = require("cors");
const path = require("path");
app.use(cors());
require('./db/conn');
app.use(express.json());
app.use(require('./router/auth'));

const PORT = process.env.PORT || 5252

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

app.use(express.static(process.env.STATIC_DIR));

// serving the frontend
app.use(express.static(path.join(__dirname, "./frontend/build")));



app.get("/", function (_, res) {
  res.sendFile(
    path.join(__dirname, "./frontend/build/index.html"),
    function (err) {
      res.status(500).send(err);
    }
  )
})

// app.get("/", (req, res) => {
//   const path = resolve("./frontend/build/index.html");
//   res.sendFile(path);
// });

app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "INR",
      amount: amount * 100,
      automatic_payment_methods: { enabled: true },
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

app.listen(PORT, () =>
  console.log(`Node server listening at http://localhost:5252`)
);