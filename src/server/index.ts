import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./auth/router.js";
import { apiRouter } from "./routes/api.js";

const PORT = parseInt(process.env.PORT || "3001", 10);

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`OAR Viewer server running on http://localhost:${PORT}`);
});
