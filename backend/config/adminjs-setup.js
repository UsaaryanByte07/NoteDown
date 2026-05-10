require("dotenv").config();
const bcrypt = require("bcryptjs");
const session = require("express-session");
const { url: mongoUrl } = require("./db_config");

const SystemUser = require("../models/SystemUser");
const User = require("../models/User");
const Note = require("../models/Note");
const ChatSession = require("../models/ChatSession");
const ChatMessage = require("../models/ChatMessage");
const SystemStats = require("../models/SystemStats");
const MaintenanceMode = require("../models/MaintenanceMode");

const { buildResourceConfig } = require("./adminjs-rbac");

const setupAdminJS = async (app) => {
  const { default: AdminJS } = await import("adminjs");
  const { default: AdminJSExpress } = await import("@adminjs/express");
  const AdminJSMongoose = await import("@adminjs/mongoose");
  const { default: MongoStore } = await import("connect-mongo");

  AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
  });

  const admin = new AdminJS({
    rootPath: "/root/panel",
    branding: {
      companyName: "NoteDown — Root Panel",
      logo: false,
      favicon: "/favicon.ico",
    },

    resources: [
      buildResourceConfig("systemUser", SystemUser),
      buildResourceConfig("user", User),
      buildResourceConfig("note", Note),
      buildResourceConfig("chatSession", ChatSession),
      buildResourceConfig("chatMessage", ChatMessage),
      buildResourceConfig("systemStats", SystemStats),
      buildResourceConfig("maintenance", MaintenanceMode),
    ],
  });

  const sessionStore = MongoStore.create({
    mongoUrl,
    collectionName: "adminjs_sessions",
    ttl: 2 * 24 * 60 * 60, // 2 days in seconds
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (username, password) => {
        if (!username || !password) {
          return null;
        }

        const systemUser = await SystemUser.findOne({
          username: username.trim(),
        });
        if (!systemUser) {
          return null;
        }

        const match = await bcrypt.compare(password, systemUser.password);
        if (!match) {
          return null;
        }

        return {
          id: systemUser._id.toString(),
          name: systemUser.name,
          username: systemUser.username,
          role: systemUser.role,
        };
      },
      cookieName: "adminjs-root",
      cookiePassword: process.env.ADMINJS_COOKIE_SECRET,
    },
    null,
    {
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      secret: process.env.ADMINJS_SESSION_SECRET,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
      },
    },
  );

  app.use(admin.options.rootPath, adminRouter);

  // for the frontend to check if the site is in maintenance mode or not
  app.get("/api/maintenance-status", async (req, res) => {
    try {
      const state = await MaintenanceMode.getState();
      return res.status(200).json({
        isActive: state.isActive,
        message: state.message || "",
        endsAt: state.endsAt,
      });
    } catch (err) {
      return res.status(500).json({ isActive: false });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    await admin.watch();
  }

  console.log(`AdminJS Root Panel available at: http://localhost:${process.env.PORT || 3010}${admin.options.rootPath}`)
};

module.exports = { setupAdminJS };
