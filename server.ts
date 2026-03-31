import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { fileURLToPath } from "url";
import twilio from "twilio";

console.log("Server module loading...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

async function startServer() {
  console.log("Starting server function called...");
  const app = express();
  const PORT = 3000;

  try {
    // Initialize Firebase Admin
    if (admin.apps.length === 0) {
      console.log("Initializing Firebase Admin with project ID:", "gen-lang-client-0468371419");
      admin.initializeApp({
        projectId: "gen-lang-client-0468371419",
      });
      console.log("Firebase Admin initialized successfully.");
    }
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
  }

  const db = admin.firestore();
  const auth = admin.auth();

  console.log("Express middleware setup...");
  app.use(express.json());

  // API Routes
  app.post("/api/admin/create-user", async (req, res) => {
    const { email, password, name, role, adminUid } = req.body;

    try {
      // Verify the requester is an admin/owner
      const requesterDoc = await db.collection("users").doc(adminUid).get();
      const requesterData = requesterDoc.data();
      
      const isOwner = requesterData?.role === "owner" || requesterData?.email === "the.tulba@gmail.com";
      
      if (!isOwner) {
        return res.status(403).json({ error: "Unauthorized. Only owners can create staff accounts." });
      }

      // Create Firebase Auth User
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      // Create User Profile in Firestore
      await db.collection("users").doc(userRecord.uid).set({
        uid: userRecord.uid,
        email,
        name,
        role,
        requiresPasswordChange: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ uid: userRecord.uid });
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const sendTwilioMessage = async (appointmentId: string, type: 'sms' | 'whatsapp') => {
    if (!twilioClient) throw new Error("Twilio is not configured.");

    const apptDoc = await db.collection("appointments").doc(appointmentId).get();
    if (!apptDoc.exists) throw new Error("Appointment not found.");
    const apptData = apptDoc.data();

    const patientDoc = await db.collection("users").doc(apptData?.patientId).get();
    if (!patientDoc.exists) throw new Error("Patient profile not found.");
    const patientData = patientDoc.data();

    if (!patientData?.phone) throw new Error("Patient does not have a phone number.");

    const startTime = apptData?.startTime.toDate();
    const formattedTime = startTime.toLocaleString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });

    const messageBody = `Hello ${patientData.name}, this is a reminder for your appointment at S Dental Center on ${formattedTime} for ${apptData?.type}. We look forward to seeing you!`;

    if (type === 'whatsapp') {
      const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
      await twilioClient.messages.create({
        body: messageBody,
        from: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
        to: `whatsapp:${patientData.phone}`
      });
    } else {
      const from = process.env.TWILIO_PHONE_NUMBER;
      if (!from) throw new Error("TWILIO_PHONE_NUMBER is not set.");
      await twilioClient.messages.create({
        body: messageBody,
        from: from,
        to: patientData.phone
      });
    }

    // Mark as sent
    await db.collection("appointments").doc(appointmentId).update({
      [`reminderSent_${type}`]: true,
      lastReminderSentAt: admin.firestore.FieldValue.serverTimestamp()
    });
  };

  app.post("/api/appointments/send-reminder", async (req, res) => {
    const { appointmentId, type, adminUid } = req.body;

    if (!twilioClient) {
      return res.status(500).json({ error: "Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in secrets." });
    }

    try {
      // Verify the requester is staff/admin/owner
      const requesterDoc = await db.collection("users").doc(adminUid).get();
      const requesterData = requesterDoc.data();
      const isStaff = ['staff', 'dentist', 'admin', 'owner'].includes(requesterData?.role || '');

      if (!isStaff) {
        return res.status(403).json({ error: "Unauthorized. Only staff can send reminders." });
      }

      await sendTwilioMessage(appointmentId, type);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error sending reminder:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Background task for automated reminders
  const AUTOMATED_REMINDER_INTERVAL = 60 * 60 * 1000; // 1 hour
  setInterval(async () => {
    if (!twilioClient) return;

    console.log("Running automated reminder check...");
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000); // Check 1 hour window

      const snapshot = await db.collection("appointments")
        .where("status", "==", "booked")
        .where("startTime", ">=", admin.firestore.Timestamp.fromDate(tomorrow))
        .where("startTime", "<=", admin.firestore.Timestamp.fromDate(tomorrowEnd))
        .get();

      for (const doc of snapshot.docs) {
        const data = doc.data();
        // Send WhatsApp by default if not sent
        if (!data.reminderSent_whatsapp) {
          try {
            await sendTwilioMessage(doc.id, 'whatsapp');
            console.log(`Automated WhatsApp reminder sent for appointment ${doc.id}`);
          } catch (e) {
            console.error(`Failed to send automated WhatsApp reminder for ${doc.id}:`, e);
          }
        }
      }
    } catch (error) {
      console.error("Error in automated reminder task:", error);
    }
  }, AUTOMATED_REMINDER_INTERVAL);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Server is ready to handle requests.");
  });
}

console.log("Calling startServer()...");
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
