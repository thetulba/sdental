import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { fileURLToPath } from "url";
import twilio from "twilio";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";

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
      console.log("Initializing Firebase Admin...");
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log("Firebase Admin initialized successfully.");
    }
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
  }

  const firebaseApp = admin.app();
  const db = admin.firestore(firebaseApp);
  const auth = admin.auth(firebaseApp);

  const JWT_SECRET = process.env.JWT_SECRET || "dental-staff-secret-key-2026";
  const OFFICE_LAT = 51.5074;
  const OFFICE_LNG = -0.1278;
  const RADIUS_METERS = 200;

  // Multer setup for profile photos
  const storage = multer.memoryStorage();
  const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

  console.log("Express middleware setup...");
  app.use(express.json({ limit: '10mb' }));

  // Helper: Calculate distance between two points in meters
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Staff Management Routes
  app.post("/api/staff/create", upload.single('photo'), async (req: any, res) => {
    console.log("Received request for /api/staff/create");
    const { username, password, name, adminUid } = req.body;
    const photo = req.file;

    try {
      // Verify requester is owner
      const requesterDoc = await db.collection("users").doc(adminUid).get();
      const isOwner = requesterDoc.data()?.role === "owner" || requesterDoc.data()?.email === "the.tulba@gmail.com";
      
      if (!isOwner) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Check if username exists
      const existing = await db.collection("staff").where("username", "==", username).get();
      if (!existing.empty) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      let photoBase64 = "";
      if (photo) {
        photoBase64 = `data:${photo.mimetype};base64,${photo.buffer.toString('base64')}`;
      }

      const staffRef = db.collection("staff").doc();
      await staffRef.set({
        id: staffRef.id,
        username,
        password: hashedPassword,
        name,
        photo: photoBase64,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ success: true, id: staffRef.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Patient Login Route
  app.post("/api/patient/login", async (req, res) => {
    const { patientId, password } = req.body;
    try {
      const patientDoc = await db.collection("patient_credentials").doc(patientId).get();
      if (!patientDoc.exists) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const patientData = patientDoc.data();
      const isMatch = await bcrypt.compare(password, patientData?.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign({ patientId }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, patient: { id: patientId, name: patientData?.name } });
    } catch (error) {
      console.error("Patient login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/promo/validate", async (req, res) => {
    const { code, subtotal } = req.body;
    try {
      const promoRef = db.collection('promocodes').doc(code);
      const promoDoc = await promoRef.get();
      if (!promoDoc.exists) {
        return res.status(404).json({ error: "Invalid promo code" });
      }
      const promoData = promoDoc.data();
      if (!promoData?.isActive) {
        return res.status(400).json({ error: "Promo code is inactive" });
      }
      if (promoData.expiresAt && new Date(promoData.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Promo code expired" });
      }

      let discount = 0;
      if (promoData.discountType === 'percentage') {
        discount = (subtotal * promoData.discountValue) / 100;
      } else if (promoData.discountType === 'fixed') {
        discount = promoData.discountValue;
      }

      const finalTotal = Math.max(0, subtotal - discount);
      res.json({ discount, finalTotal });
    } catch (error) {
      console.error("Error validating promo code:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/staff/login", async (req, res) => {
    const { username, password } = req.body;

    // Owner override
    if (username === 'Drtulba' && password === '123465') {
      const token = jwt.sign({ id: 'owner', username: 'Drtulba', name: 'Owner', role: 'owner' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ 
        token, 
        staff: { 
          id: 'owner', 
          username: 'Drtulba', 
          name: 'Owner', 
          photo: '' 
        } 
      });
    }

    try {
      const snapshot = await db.collection("staff").where("username", "==", username).get();
      if (snapshot.empty) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const staff = snapshot.docs[0].data();
      const isValid = await bcrypt.compare(password, staff.password);

      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: staff.id, username: staff.username, name: staff.name, role: 'staff' }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        token, 
        staff: { 
          id: staff.id, 
          username: staff.username, 
          name: staff.name, 
          photo: staff.photo 
        } 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/attendance/clock-in", async (req, res) => {
    const { staffId, lat, lng } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded.id !== staffId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const distance = getDistance(lat, lng, OFFICE_LAT, OFFICE_LNG);
      const status = distance <= RADIUS_METERS ? 'On-site' : 'Off-site';

      const attendanceRef = db.collection("attendance").doc();
      await attendanceRef.set({
        id: attendanceRef.id,
        staffId,
        staffName: decoded.name,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        coordinates: { lat, lng },
        distance: Math.round(distance),
        status,
      });

      res.json({ success: true, status, distance: Math.round(distance) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/attendance/logs", async (req, res) => {
    const { adminUid } = req.query;

    try {
      if (adminUid) {
        const requesterDoc = await db.collection("users").doc(adminUid as string).get();
        const isOwner = requesterDoc.data()?.role === "owner" || requesterDoc.data()?.email === "the.tulba@gmail.com";
        if (!isOwner) return res.status(403).json({ error: "Unauthorized" });
      }

      const snapshot = await db.collection("attendance").orderBy("timestamp", "desc").limit(100).get();
      const logs = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const staffDoc = await db.collection("staff").doc(data.staffId).get();
        const staffData = staffDoc.data();
        return {
          ...data,
          staffPhoto: staffData?.photo || "",
          timestamp: data.timestamp.toDate(),
        };
      }));

      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Existing API Routes
  app.get("/api/reviews", async (req, res) => {
    const { placeId } = req.query;
    if (!placeId) return res.status(400).json({ error: "placeId is required" });
    
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API key not configured" });

    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`);
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/create-user", async (req, res) => {
    const { email, password, name, role, adminUid } = req.body;
    console.log("adminUid:", adminUid);

    try {
      // Verify the requester is an admin/owner
      console.log("Fetching requesterDoc for:", adminUid);
      const requesterDoc = await db.collection("users").doc(adminUid).get();
      console.log("requesterDoc exists:", requesterDoc.exists);
      const requesterData = requesterDoc.data();
      console.log("requesterData:", requesterData);
      
      const isOwner = requesterData?.role === "owner" || requesterData?.email === "the.tulba@gmail.com";
      console.log("isOwner:", isOwner);
      
      if (!isOwner) {
        return res.status(403).json({ error: "Unauthorized. Only owners can create staff accounts." });
      }

      // Create Firebase Auth User
      console.log("Attempting to create user with email:", email);
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });
      console.log("User created successfully:", userRecord.uid);

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
