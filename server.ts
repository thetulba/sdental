import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { fileURLToPath } from "url";

console.log("Server module loading...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
