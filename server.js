const express = require("express");
const path = require("path");
const Stripe = require("stripe");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart, customer } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        error: "Il carrello è vuoto."
      });
    }

    if (
      !customer ||
      !customer.name ||
      !customer.email ||
      !customer.phone ||
      !customer.address ||
      !customer.cap ||
      !customer.city ||
      !customer.province
    ) {
      return res.status(400).json({
        error: "Compila tutti i dati di spedizione."
      });
    }

    const prezzi = {
      "Tuta Sportiva Black & Blue": 60,
      "Tuta Sportiva White & Green": 60,
      "Tuta Sportiva Black & White": 60,
      "Tuta Sportiva White & Black": 60,
      "Scarpe Sportive White": 40
    };

    const lineItems = cart.map((item) => {

      if (!prezzi[item.name]) {
        throw new Error("Prodotto non valido: " + item.name);
      }

      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            description: "Taglia/Numero: " + item.size
          },
          unit_amount: prezzi[item.name] * 100
        },
        quantity: 1
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: lineItems,

      customer_email: customer.email,

      metadata: {
        nome: customer.name,
        telefono: customer.phone,
        indirizzo: customer.address,
        cap: customer.cap,
        citta: customer.city,
        provincia: customer.province
      },

      success_url:
        req.protocol +
        "://" +
        req.get("host") +
        "/?pagamento=successo",

      cancel_url:
        req.protocol +
        "://" +
        req.get("host") +
        "/?pagamento=annullato"
    });

    return res.status(200).json({
      url: session.url
    });

  } catch (error) {

    console.error("STRIPE ERROR:", error);

    return res.status(500).json({
      error: error.message || "Errore Stripe"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("NEW STILE SPORT avviato sulla porta " + PORT);
});
