/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialize Stripe if keys are available
let stripeClient: any = null;
function getStripeInstance() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key === "sk_test_XXXXXXXX") {
      console.warn("Stripe Secret Key is not configured in environment variables. Falling back to payment simulator.");
      return null;
    }
    // Lazy import stripe to prevent issues
    try {
      import("stripe").then((StripeModule) => {
        const Stripe = StripeModule.default;
        stripeClient = new Stripe(key, { apiVersion: "2023-10-16" as any });
      });
    } catch (e) {
      console.error("Failed to load stripe module", e);
    }
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Keep a simple in-memory transaction database for sandbox fallbacks 
  const localTransactionsDB = new Map<string, any>();

  // -------------------------------------------------------------
  // SECURE API PATHS
  // -------------------------------------------------------------

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", environment: process.env.NODE_ENV || "development" });
  });

  // Check which payment secret keys are configured
  app.get("/api/payments/config-check", (req, res) => {
    res.json({
      chapaConfigured: !!process.env.CHAPA_SECRET_KEY && process.env.CHAPA_SECRET_KEY !== "CHASECK_TEST-XXXXXXXX",
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "sk_test_XXXXXXXX",
      chapaPublicKey: process.env.CHAPA_PUBLIC_KEY || null,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
    });
  });

  // 1. CHAPA INITIALIZATION (Supports Telebirr, CBE Birr, Ethiopian local credit cards)
  app.post("/api/payments/chapa/initialize", async (req, res) => {
    const { invoiceId, amount, email, firstName, lastName, studentId } = req.body;

    if (!invoiceId || !amount || !email) {
      return res.status(400).json({ status: "error", message: "Missing required arguments (invoiceId, amount, email)" });
    }

    const txRef = `CHAPA-${invoiceId}-${Date.now()}`;
    const chapaSecretKey = process.env.CHAPA_SECRET_KEY;

    // If Chapa secret key is empty or default, trigger full-stack sandbox flow
    if (!chapaSecretKey || chapaSecretKey === "CHASECK_TEST-XXXXXXXX") {
      console.log(`[CHAPA SIMULATOR] Creating transaction ${txRef} for Invoice ${invoiceId} of ${amount} ETB`);
      
      // Store transaction pending state in memory
      localTransactionsDB.set(txRef, {
        invoiceId,
        studentId,
        amount: Number(amount),
        email,
        firstName,
        lastName,
        gateway: "Chapa",
        status: "pending",
        date: new Date().toISOString()
      });

      // Point return URL back, passing necessary success query parameters
      const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      const sandboxCheckoutUrl = `${baseUrl}/?payment_gateway=chapa&payment_status=success&tx_ref=${txRef}&invoice_id=${invoiceId}&amount=${amount}`;

      return res.json({
        status: "success",
        message: "Chapa testing link simulated",
        txRef,
        checkoutUrl: sandboxCheckoutUrl,
        mode: "sandbox"
      });
    }

    try {
      const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      const callbackUrl = `${baseUrl}/api/payments/chapa/webhook`;
      const returnUrl = `${baseUrl}/?payment_gateway=chapa&payment_status=success&tx_ref=${txRef}&invoice_id=${invoiceId}&amount=${amount}`;

      console.log(`[CHAPA REAL API] Pointing transactions to ${txRef} via official gateway`);

      const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${chapaSecretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: Number(amount),
          currency: "ETB",
          email,
          first_name: firstName || "Parent",
          last_name: lastName || "Guardian",
          tx_ref: txRef,
          callback_url: callbackUrl,
          return_url: returnUrl,
          customization: {
            title: "Focus Academy Fee Settlement",
            description: `Invoice ${invoiceId} Tuition & Operational Billing`
          }
        })
      });

      const data = await response.json();
      if (data.status === "success") {
        return res.json({
          status: "success",
          txRef,
          checkoutUrl: data.data.checkout_url,
          mode: "production"
        });
      } else {
        return res.status(400).json({
          status: "chapa_error",
          message: data.message || "Failed initializing API session with Chapa"
        });
      }
    } catch (err: any) {
      console.error("Chapa API request crashed:", err);
      return res.status(500).json({ status: "error", message: err.message });
    }
  });

  // 2. CHAPA TRANSACTION VERIFICATION
  app.get("/api/payments/chapa/verify/:txRef", async (req, res) => {
    const { txRef } = req.params;

    if (!txRef) {
      return res.status(400).json({ status: "error", message: "Missing transaction reference: txRef" });
    }

    // Checking if in simulator mode
    if (localTransactionsDB.has(txRef)) {
      const tx = localTransactionsDB.get(txRef);
      tx.status = "success";
      return res.json({
        status: "success",
        message: "Payment successfully verified under sandbox simulator",
        data: {
          tx_ref: txRef,
          amount: tx.amount,
          currency: "ETB",
          status: "success",
          invoiceId: tx.invoiceId
        }
      });
    }

    const chapaSecretKey = process.env.CHAPA_SECRET_KEY;
    if (!chapaSecretKey || chapaSecretKey === "CHASECK_TEST-XXXXXXXX") {
      return res.status(404).json({ status: "error", message: "Transaction reference not found" });
    }

    try {
      console.log(`[CHAPA REAL API] Verifying reference: ${txRef}`);
      const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${chapaSecretKey}`
        }
      });

      const data = await response.json();
      if (data.status === "success" && data.data?.status === "success") {
        return res.json({
          status: "success",
          message: "Transaction verified successfully via Chapa",
          data: {
            tx_ref: txRef,
            amount: data.data.amount,
            currency: data.data.currency,
            status: "success"
          }
        });
      } else {
        return res.status(400).json({
          status: "verification_failed",
          message: data.message || "Chapa says transaction is unconfirmed or failed"
        });
      }
    } catch (err: any) {
      console.error("Chapa Verification API crashed:", err);
      return res.status(500).json({ status: "error", message: err.message });
    }
  });

  // 3. STRIPE INITIALIZATION (Card Payments & Wallets)
  app.post("/api/payments/stripe/initialize", async (req, res) => {
    const { invoiceId, amount, email, productName } = req.body;

    if (!invoiceId || !amount) {
      return res.status(400).json({ status: "error", message: "Missing invoiceId or amount" });
    }

    const txRef = `STRIPE-${invoiceId}-${Date.now()}`;
    const stripe = getStripeInstance();

    if (!stripe) {
      // Trigger Stripe sandbox checkout simulator URL
      console.log(`[STRIPE SIMULATOR] Initializing transaction ${txRef} for invoice ${invoiceId}`);
      localTransactionsDB.set(txRef, {
        invoiceId,
        amount: Number(amount),
        email,
        gateway: "Stripe",
        status: "pending",
        date: new Date().toISOString()
      });

      const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      const sandboxCheckoutUrl = `${baseUrl}/?payment_gateway=stripe&payment_status=success&tx_ref=${txRef}&invoice_id=${invoiceId}&amount=${amount}`;

      return res.json({
        status: "success",
        message: "Stripe Checkout session simulated",
        txRef,
        checkoutUrl: sandboxCheckoutUrl,
        mode: "sandbox"
      });
    }

    try {
      const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "etb", // Can accept ETB or USD, default to ETB matching portal fee layout
              product_data: {
                name: productName || `Focus Academy Invoice ${invoiceId}`,
                description: `Tuition & School Fee Ledger Settlement`,
              },
              unit_amount: Math.round(Number(amount) * 100), // stripe accepts in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/?payment_gateway=stripe&payment_status=success&tx_ref=${txRef}&invoice_id=${invoiceId}&amount=${amount}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/?payment_gateway=stripe&payment_status=cancelled`,
        metadata: {
          invoiceId,
          txRef,
        },
      });

      return res.json({
        status: "success",
        txRef,
        checkoutUrl: session.url,
        sessionId: session.id,
        mode: "production"
      });
    } catch (err: any) {
      console.error("Stripe Checkout creation failed:", err);
      return res.status(500).json({ status: "error", message: err.message });
    }
  });

  // 4. STRIPE TRANSACTION VERIFICATION
  app.get("/api/payments/stripe/verify/:txRef", async (req, res) => {
    const { txRef } = req.params;
    const { sessionId } = req.query;

    if (localTransactionsDB.has(txRef)) {
      const tx = localTransactionsDB.get(txRef);
      tx.status = "success";
      return res.json({
        status: "success",
        message: "Payment verified successfully on Stripe sandbox simulator",
        data: {
          tx_ref: txRef,
          amount: tx.amount,
          currency: "ETB",
          status: "success",
          invoiceId: tx.invoiceId
        }
      });
    }

    const stripe = getStripeInstance();
    if (!stripe) {
      return res.status(404).json({ status: "error", message: "Transaction reference or Stripe service offline" });
    }

    try {
      let session;
      if (sessionId) {
        session = await stripe.checkout.sessions.retrieve(sessionId as string);
      } else {
        // Fallback search
        const sessions = await stripe.checkout.sessions.list({ limit: 10 });
        session = sessions.data.find((s: any) => s.metadata?.txRef === txRef);
      }

      if (session && session.payment_status === "paid") {
        return res.json({
          status: "success",
          message: "Transaction verified successfully on Stripe!",
          data: {
            tx_ref: txRef,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency?.toUpperCase() || "ETB",
            status: "success"
          }
        });
      } else {
        return res.status(400).json({
          status: "unconfirmed",
          message: "Stripe checkout session remains unpaid or incomplete"
        });
      }
    } catch (err: any) {
      console.error("Stripe Verification crashed:", err);
      return res.status(500).json({ status: "error", message: err.message });
    }
  });

  // -------------------------------------------------------------
  // ASSET / SPA SERVING VIA VITE
  // -------------------------------------------------------------

  if (process.env.NODE_ENV !== "production") {
    // Development mode: Inject Vite dev middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve pre-built static files out of dist/
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files
    app.use(express.static(distPath));
    
    // Catch-all to serve react application (allowing clientside SPA subrouting)
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK] Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV !== "production" ? "development" : "production"} mode`);
  });
}

startServer();
