import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as admin from "firebase-admin";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// In Cloud Run, it will use the default service account
admin.initializeApp({
  projectId: "gen-lang-client-0468371419",
});

const db = admin.firestore();
const auth = admin.auth();

async function startServer() {
  const app = express();
  const PORT = 3000;

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
  });
}

startServer();
