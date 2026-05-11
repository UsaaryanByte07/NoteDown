const mongoose = require("mongoose");

/**
 * SystemUser
 *
 * Roles and their permissions:
 *   root            — Full access (same as the original Root user who created them)
 *   chatSuperAdmin  — Full CRUD on Chat objects
 *   userSuperAdmin  — Full CRUD on User objects
 *   notesSuperAdmin — Full CRUD on Notes objects
 *   statsSuperAdmin — Full CRUD on SystemStats objects
 *   chatSupervisor  — READ ONLY on Chat objects
 *   userSupervisor  — READ ONLY on User objects
 *   notesSupervisor — READ ONLY on Notes objects
 *   statsSupervisor — READ ONLY on SystemStats objects
 *   chatManager     — CREATE + UPDATE on Chat objects (no delete)
 *   userManager     — CREATE + UPDATE on User objects (no delete)
 *   notesManager    — CREATE + UPDATE on Notes objects (no delete)
 *   statsManager    — CREATE + UPDATE on SystemStats objects (no delete)
 *   chatPowerUser   — CREATE + UPDATE + DELETE on Chat objects
 *   userPowerUser   — CREATE + UPDATE + DELETE on User objects
 *   notesPowerUser  — CREATE + UPDATE + DELETE on Notes objects
 *   statsPowerUser  — CREATE + UPDATE + DELETE on SystemStats objects
 */

const SYSTEM_USER_ROLES = [
  "root",
  "chatSuperAdmin",
  "userSuperAdmin",
  "notesSuperAdmin",
  "statsSuperAdmin",
  "chatSupervisor",
  "userSupervisor",
  "notesSupervisor",
  "statsSupervisor",
  "chatManager",
  "userManager",
  "notesManager",
  "statsManager",
  "chatPowerUser",
  "userPowerUser",
  "notesPowerUser",
  "statsPowerUser",
];

const systemUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: SYSTEM_USER_ROLES,
      default: "chatSupervisor",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SystemUser", systemUserSchema);
module.exports.SYSTEM_USER_ROLES = SYSTEM_USER_ROLES;
