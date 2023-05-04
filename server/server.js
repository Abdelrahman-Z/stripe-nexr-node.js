const express = require("express");
const cors = require("cors");
const app = express();
const stripe = require("stripe")(
  "import your cleint secret key"
);

app.use(cors());

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.post("/customers", async (req, res) => {
  const customer = await stripe.customers.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  });

  return res.status(200).send({ id: customer.id });
});

app.post("/subs", async (req, res) => {
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: {
      number: "4242424242424242",
      exp_month: 12,
      exp_year: 2023,
      cvc: "123",
    },
    billing_details: {
      name: "John Doe",
    },
  });

  await stripe.paymentMethods.attach(paymentMethod.id, {
    customer: req.body.id,
  });

  const subscription = await stripe.subscriptions.create({
    customer: req.body.id,
    items: [
      {
        price: req.body.price,
      },
    ],
    default_payment_method: paymentMethod.id,
  });

  return res.status(200).send({ subId: subscription.id });
});

app.post("/subs/cancel", async (req, res) => {
  const deleted = await stripe.subscriptions.del(req.body.subId);

  return res.status(200).send({ status: deleted.status });
});

app.listen(5000, () => console.log("Listening to the port 5000"));
