
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const multer = require('multer');
const cookieParser = require('cookie-parser')
require("dotenv").config();

const { url } = require('./config/db_config')
const rootDir = require("./utils/path-util");


//Importing the Routers
const { authRoutes } = require("./routes/authRoutes");

const app = express();

//Cors Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

//Body Parser Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Cookie Parser Middleware
app.use(cookieParser());

//Static Files Middleware
app.use(express.static(path.join(rootDir, "public")));



app.use("/api/auth", authRoutes);
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = 3010;

async function startServer() {
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB successfully!");

    app.listen(PORT, () => {
      console.log(`Server is running on PORT:http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log("Unable to connect to Database:", err.message);
    process.exit(1);
  }
}

startServer();
