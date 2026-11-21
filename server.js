const express = require("express");
const path = require("path");
const Stripe = require("stripe");

const app = express();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart, customer } = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
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

    const prodotti = {
      "Tuta Sportiva Black & Blue": 60,
      "Tuta Sportiva White & Green": 60,
      "Tuta Sportiva Black & White": 60,
      "Tuta Sportiva White & Black": 60,
      "Scarpe Sportive White": 40
    };

    const lineItems = cart.map((item) => {

      if (!prodotti[item.name]) {
        throw new Error("Prodotto non valido.");
      }

      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            description: "Taglia/Numero: " + item.size
          },
          unit_amount: prodotti[item.name] * 100
        },
        quantity: 1
      };
    });

    const session = await stripe.checkout.sessions.create({

      mode: "payment",

      payment_method_types: ["card"],

      line_items: lineItems,

      customer_email: customer.email,

      billing_address_collection: "auto",

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

    res.json({
      url: session.url
    });

  } catch (error) {

    console.error("ERRORE STRIPE:", error);

    res.status(500).json({
      error: "Impossibile creare il pagamento."
    });
  }
});


app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "index.html")
  );
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    "NEW STILE SPORT avviato sulla porta " + PORT
  );
});
