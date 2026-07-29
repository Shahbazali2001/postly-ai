import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

// DB Connection and PortConfig Import
import connectDB from "./config/dbConnection.js";
import { config } from "./config/vConfig.js";

// Routes Import
import authRouter from "./routes/authRoutes.js";
import socialAuthRouter from "./routes/socialAuthRoutes.js";
import accountRouter from "./routes/accountRoutes.js";
import postRouter from "./routes/postRoutes.js";
import activityRouter from "./routes/activityRoutes.js";

// Services Import
import { initScheduler } from "./services/schedulerService.js";

// Express App Variables
const app = express();

// Using Middleware
app.use(cors());
app.use(express.json());

// Auth Routes
app.use("/api/auth", authRouter);

// Social Auth Routes
app.use("/api/oauth", socialAuthRouter);

// Account Routes
app.use("/api/accounts", accountRouter);

// Post Routes
app.use("/api/posts", postRouter);

// Activity Route
app.use("/api/activity", activityRouter);

// Home Route
app.get("/", (_req: Request, res: Response) => {
  res.send("Server is Live!");
});

// Scheduler
initScheduler();


// Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server and Connect DB
connectDB().then(() => {
  app.listen(config.port, () => {
    console.log;
    console.log(
      `Server is started and running at http://localhost:${config.port}`,
    );
  });
});
