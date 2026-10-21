import express from "express";
import cors from "cors";
import employeeRoutes from "./routes/employee.routes";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/employees", employeeRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;