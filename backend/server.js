const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { url } = require("./config/db_config");
const { setupAdminJS } = require('./config/adminjs-setup');
const rootDir = require("./utils/path-util");
const { startOcrCleanupJob } = require("./utils/ocr-cleanup-job");

//Importing the Models
const SystemStats = require("./models/SystemStats");
const MaintenanceMode = require("./models/MaintenanceMode");

//Importing the Middlewares
const {
  pageNotFoundHandler,
  handleMulterError,
} = require("./middlewares/errorHandlerMiddleware");
const { maintenanceMiddleware } = require('./middlewares/maintenanceMiddleware');

//Importing the Routers
const { authRoutes } = require("./routes/authRoutes");
const { noteRoutes } = require("./routes/noteRoutes");
const { chatRoutes } = require("./routes/chatRoutes");

const app = express();


// Trust all private/internal IP ranges as proxies (covers Render, Heroku, Railway, Nginx, etc.)
// Render routes requests through multiple internal hops using 10.x.x.x IPs.
// 'uniquelocal' covers 10.x.x.x / 172.16-31.x.x / 192.168.x.x so Express skips
// ALL internal hops and reads the real client IP from X-Forwarded-For.
app.set("trust proxy", "loopback, linklocal, uniquelocal");

//Cors Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

//Body Parser Middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/root')) return next();
  express.json()(req, res, next);
});
app.use((req, res, next) => {
  if (req.path.startsWith('/root')) return next();
  bodyParser.urlencoded({ extended: true })(req, res, next);
});

//Cookie Parser Middleware
app.use(cookieParser());

//Maintenance Mode Middleware
app.use(maintenanceMiddleware);

//Static Files Middleware
app.use(express.static(path.join(rootDir, "public")));

const PORT = process.env.PORT || 3010;

async function startServer() {
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB successfully!");

    // Initialize SystemStats if it doesn't exist
    await SystemStats.getStats();
    console.log("SystemStats initialized.");

    await MaintenanceMode.getState();
    console.log("MaintenanceMode singleton initialized.");

    // AdminJS Root Panel
    await setupAdminJS(app);

    app.use("/api/auth", authRoutes);
    app.use("/api/notes", noteRoutes);
    app.use("/api/chat", chatRoutes);

    app.use(handleMulterError);
    app.use(pageNotFoundHandler);

    app.listen(PORT, () => {
      console.log(`Server is running on PORT:http://localhost:${PORT}`);
    });

    startOcrCleanupJob();
  } catch (err) {
    console.log("Unable to connect to Database:", err.message);
    process.exit(1);
  }
}

startServer();
