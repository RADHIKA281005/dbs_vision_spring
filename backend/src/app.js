import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes import
import userRouter from "./routes/user.routes.js";
import beneficiaryRouter from "./routes/beneficiary.routes.js";
import inventoryRouter from "./routes/inventory.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/beneficiaries", beneficiaryRouter);
app.use("/api/v1/inventory", inventoryRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// http://localhost:8000/api/v1/users/register

// Error handling middleware
import { errorHandler } from "./middlewares/error.middleware.js";
app.use(errorHandler);

export { app };